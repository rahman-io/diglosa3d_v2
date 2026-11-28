import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createMaterialPalette } from '../three/materials';
import { createWeaponMesh } from '../three/weaponModels';
import { WeaponId } from '../types/game';
import { getDevicePerfProfile } from '../utils/devicePerf';

interface WeaponPreviewCanvasProps {
  weaponId: WeaponId;
  owned: boolean;
  className?: string;
}

export const WeaponPreviewCanvas: React.FC<WeaponPreviewCanvasProps> = ({
  weaponId,
  owned,
  className = 'h-40 sm:h-48',
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const perf = getDevicePerfProfile();
    const softGl = perf.isSoftwareGl;
    const isMobile = perf.isMobile;
    const isLowEnd = perf.isLowEnd;
    const isUltraLow = perf.isUltraLowEnd;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !softGl && !isLowEnd,
      powerPreference: isMobile ? 'default' : 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(
      softGl
        ? 1
        : Math.min(
            window.devicePixelRatio || 1,
            isUltraLow ? 0.9 : isLowEnd ? 1.05 : isMobile ? 1.25 : 1.75,
          ),
    );
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    let envTex: THREE.Texture | null = null;
    if (!softGl && !isLowEnd) {
      const pmrem = new THREE.PMREMGenerator(renderer);
      envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;
      pmrem.dispose();
    }

    const camera = new THREE.PerspectiveCamera(32, 2.2, 0.1, 30);
    camera.position.set(1.55, 0.65, 1.45);

    const hemi = new THREE.HemisphereLight(0xfffbeb, 0x1e293b, isLowEnd || softGl ? 1.38 : 1.0);
    const key = new THREE.DirectionalLight(0xfff7ed, 2.1);
    key.position.set(3, 5, 4);
    const rim = new THREE.DirectionalLight(0x38bdf8, 1.35);
    rim.position.set(-4, 2, -3);
    scene.add(hemi, key, rim);

    const palette = createMaterialPalette(renderer, softGl, softGl || isUltraLow);

    // Metallic Turntable Pedestal
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.78, 0.08, 28),
      palette.getMat(0x1e293b, 'metal'),
    );
    pedestal.position.y = -0.52;
    const pedRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.69, 0.02, 8, 32),
      palette.getMat(owned ? 0xfbbf24 : 0x64748b, 'emissive'),
    );
    pedRing.rotation.x = Math.PI / 2;
    pedRing.position.y = -0.48;
    scene.add(pedestal, pedRing);

    const pivot = new THREE.Group();
    const mesh = createWeaponMesh(weaponId, palette, 1.65);

    // Center weapon around pivot
    const box = new THREE.Box3().setFromObject(mesh);
    const center = new THREE.Vector3();
    box.getCenter(center);
    mesh.position.sub(center);
    pivot.add(mesh);
    pivot.position.y = 0.04;
    scene.add(pivot);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 1.25;
    controls.maxDistance = 3.2;
    controls.enableDamping = !softGl;
    controls.target.set(0, 0.02, 0);
    controls.update();

    let userInteracting = false;
    const onStart = () => {
      userInteracting = true;
    };
    const onEnd = () => {
      userInteracting = false;
    };
    controls.addEventListener('start', onStart);
    controls.addEventListener('end', onEnd);

    const syncSize = () => {
      const w = Math.max(120, host.clientWidth);
      const h = Math.max(100, host.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(host);

    let disposed = false;
    let inViewport = true;
    let frameId = 0;
    let timerId = 0;
    let lastMs = performance.now();
    const minFrameMs = isUltraLow ? 42 : isLowEnd ? 36 : isMobile ? 33 : 20;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const st = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (st === gl.UNSIGNALED) {
          timerId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          timerId = window.setTimeout(cb, 80);
        }
      };
      timerId = window.setTimeout(poll, 5);
    };

    const schedule = () => {
      if (disposed || document.hidden || !inViewport) return;
      if (softGl) {
        afterDraw(tick);
      } else if (minFrameMs >= 30) {
        timerId = window.setTimeout(() => {
          if (!disposed && !document.hidden && inViewport) {
            frameId = window.requestAnimationFrame(tick);
          }
        }, minFrameMs - 4);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    const tick = () => {
      if (disposed || document.hidden || !inViewport) return;
      const now = performance.now();
      const dt = Math.min(0.06, Math.max(0.001, (now - lastMs) / 1000));
      lastMs = now;

      if (!userInteracting) {
        pivot.rotation.y += dt * 0.75;
      }
      controls.update();
      renderer.render(scene, camera);
      schedule();
    };

    const onVisibility = () => {
      if (!document.hidden && inViewport && !disposed) {
        lastMs = performance.now();
        window.cancelAnimationFrame(frameId);
        window.clearTimeout(timerId);
        if (softGl) tick();
        else frameId = window.requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((e) => e.isIntersecting);
          if (visible !== inViewport) {
            inViewport = visible;
            if (visible && !document.hidden && !disposed) {
              lastMs = performance.now();
              window.cancelAnimationFrame(frameId);
              window.clearTimeout(timerId);
              if (softGl) tick();
              else frameId = window.requestAnimationFrame(tick);
            }
          }
        },
        { threshold: 0.01 },
      );
      io.observe(host);
    }

    if (softGl) {
      tick();
    } else {
      frameId = window.requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timerId);
      document.removeEventListener('visibilitychange', onVisibility);
      io?.disconnect();
      ro.disconnect();
      controls.removeEventListener('start', onStart);
      controls.removeEventListener('end', onEnd);
      controls.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      palette.dispose();
      envTex?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [weaponId, owned]);

  return (
    <div
      ref={hostRef}
      className={`w-full cursor-grab active:cursor-grabbing ${className} ${
        owned ? '' : 'grayscale opacity-75'
      }`}
    />
  );
};
