import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { getCharacterPreset } from '../data/characterPresets';
import { createMaterialPalette, SurfaceMaterial } from '../three/materials';
import {
  applyHeroAppearance,
  applyHeroWeaponPose,
  createHeroAvatar,
  HeroAvatarRig,
  setHeroWeaponVisual,
} from '../three/rpgModels';
import { CharacterPresetId } from '../types/game';

interface HeroPreviewCanvasProps {
  characterId: CharacterPresetId;
  className?: string;
}

interface PedestalTheme {
  baseHex: number;
  capHex: number;
  accentHex: number;
}

const PEDESTAL_THEMES: Record<CharacterPresetId, PedestalTheme> = {
  hoot_emerald: { baseHex: 0x5c3d24, capHex: 0x4ade80, accentHex: 0xfacc15 },
  aria_sky: { baseHex: 0x475569, capHex: 0x94a3b8, accentHex: 0x2dd4bf },
  karsa_crimson: { baseHex: 0x7c2d12, capHex: 0xd97706, accentHex: 0xf59e0b },
  raka_gold: { baseHex: 0x1e293b, capHex: 0x334155, accentHex: 0x22d3ee },
  luna_violet: { baseHex: 0x451a03, capHex: 0x22c55e, accentHex: 0xec4899 },
  nusa_teal: { baseHex: 0x78350f, capHex: 0xfde68a, accentHex: 0x0ea5e9 },
};

const isSoftwareWebGl = (): boolean => {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
};

export const HeroPreviewCanvas: React.FC<HeroPreviewCanvasProps> = ({
  characterId,
  className = 'h-56 sm:h-64',
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const initialCharacterRef = useRef<CharacterPresetId>(characterId);
  const rigRef = useRef<HeroAvatarRig | null>(null);
  const pedestalMatsRef = useRef<{
    base: SurfaceMaterial;
    cap: SurfaceMaterial;
    accent: SurfaceMaterial;
    ring: SurfaceMaterial;
  } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const initCharId = initialCharacterRef.current;
    const initPreset = getCharacterPreset(initCharId);
    const initTheme = PEDESTAL_THEMES[initCharId];

    const softGl = isSoftwareWebGl();
    const isMobile =
      typeof navigator !== 'undefined' &&
      (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 1 && window.innerWidth <= 1024));

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !softGl,
      powerPreference: isMobile ? 'default' : 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(
      softGl ? 1 : Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.75),
    );
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    let envTex: THREE.Texture | null = null;
    if (!softGl) {
      const pmrem = new THREE.PMREMGenerator(renderer);
      envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;
      pmrem.dispose();
    }

    const camera = new THREE.PerspectiveCamera(32, 1.1, 0.1, 35);
    camera.position.set(1.65, 2.35, 4.95);

    const hemi = new THREE.HemisphereLight(0xfffbeb, 0x1e293b, softGl ? 1.45 : 1.05);
    const key = new THREE.DirectionalLight(0xfff7ed, 2.15);
    key.position.set(3.5, 6, 4.5);
    const rim = new THREE.DirectionalLight(0x38bdf8, 1.3);
    rim.position.set(-4, 2.8, -3.5);
    scene.add(hemi, key, rim);

    const palette = createMaterialPalette(renderer, softGl, softGl);

    // Voxel Diorama Pedestal matching the 6 Character Design Sheets
    const pedestalGroup = new THREE.Group();
    const pedBaseMat = palette.createSurfaceMat({
      color: initTheme.baseHex,
      roughness: 0.85,
      metalness: 0.08,
    });
    const pedCapMat = palette.createSurfaceMat({
      color: initTheme.capHex,
      roughness: 0.78,
      metalness: 0.06,
    });
    const pedAccentMat = palette.createSurfaceMat({
      color: initTheme.accentHex,
      emissive: initTheme.accentHex,
      emissiveIntensity: 0.35,
      roughness: 0.35,
      metalness: 0.25,
    });
    const pedRingMat = palette.createSurfaceMat({
      color: initTheme.accentHex,
      emissive: initTheme.accentHex,
      emissiveIntensity: 0.65,
      roughness: 0.25,
    });

    const baseBlock = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.38, 2.35), pedBaseMat);
    baseBlock.position.y = -0.24;
    const capBlock = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.14, 2.44), pedCapMat);
    capBlock.position.y = 0.01;
    const accentTrim = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.06, 2.5), pedAccentMat);
    accentTrim.position.y = -0.07;
    const glowDisc = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.06, 32), pedRingMat);
    glowDisc.rotation.x = -Math.PI / 2;
    glowDisc.position.y = 0.09;

    pedestalGroup.add(baseBlock, capBlock, accentTrim, glowDisc);
    pedestalGroup.position.y = -1.15;
    scene.add(pedestalGroup);
    pedestalMatsRef.current = {
      base: pedBaseMat,
      cap: pedCapMat,
      accent: pedAccentMat,
      ring: pedRingMat,
    };

    const pivot = new THREE.Group();
    pivot.position.y = -1.07;
    const rig = createHeroAvatar(palette, initPreset.colors, initCharId);
    setHeroWeaponVisual(rig, 'ketapel', false);
    rig.root.rotation.y = 0.24;
    pivot.add(rig.root);
    scene.add(pivot);
    rigRef.current = rig;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 3.6;
    controls.maxDistance = 6.8;
    controls.maxPolarAngle = Math.PI * 0.56;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.enableDamping = !softGl;
    controls.target.set(0, 0.48, 0);
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
      const h = Math.max(120, host.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(host);

    let disposed = false;
    let frameId = 0;
    let lastMs = performance.now();
    let lastRenderMs = 0;
    let totalTime = 0;
    const minFrameMs = isMobile ? 33 : 20;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const st = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (st === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      if (!softGl && (document.hidden || now - lastRenderMs < minFrameMs - 1.5)) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }
      lastRenderMs = now;
      const dt = Math.min(0.06, Math.max(0.001, (now - lastMs) / 1000));
      lastMs = now;
      totalTime += dt;

      if (!userInteracting) {
        pivot.rotation.y = Math.sin(totalTime * 0.65) * 0.35;
        pedestalGroup.rotation.y = pivot.rotation.y;
      }

      applyHeroWeaponPose(rig, 'ketapel', false, {
        speed: 0,
        walkCycle: 0,
        aimAlpha: 0,
        recoil: 0,
        dt,
        elapsed: totalTime,
      });

      controls.update();
      renderer.render(scene, camera);

      if (softGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    if (softGl) {
      tick();
    } else {
      frameId = window.requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      rigRef.current = null;
      pedestalMatsRef.current = null;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
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
  }, []);

  useEffect(() => {
    const rig = rigRef.current;
    if (rig) {
      applyHeroAppearance(rig, getCharacterPreset(characterId).colors, characterId);
    }
    const mats = pedestalMatsRef.current;
    if (mats) {
      const theme = PEDESTAL_THEMES[characterId];
      mats.base.color.setHex(theme.baseHex);
      mats.cap.color.setHex(theme.capHex);
      mats.accent.color.setHex(theme.accentHex);
      mats.accent.emissive.setHex(theme.accentHex);
      mats.ring.color.setHex(theme.accentHex);
      mats.ring.emissive.setHex(theme.accentHex);
    }
  }, [characterId]);

  return (
    <div
      ref={hostRef}
      title="Seret untuk memutar model 3D"
      className={`w-full cursor-grab active:cursor-grabbing ${className}`}
    />
  );
};
