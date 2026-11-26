import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { getCharacterPreset } from '../data/characterPresets';
import { createMaterialPalette } from '../three/materials';
import {
  animateCaptiveMesh,
  animateZoneNpc,
  applyHeroAppearance,
  applyHeroWeaponPose,
  createCaptiveMesh,
  createHeroAvatar,
  createOwlMessengerRig,
  createZoneNpc,
  HeroAvatarRig,
  OwlMessengerRig,
} from '../three/rpgModels';
import { CharacterPresetId } from '../types/game';

export type DialogueSpeakerKind = 'hero' | 'npc' | 'captive' | 'owl';

interface DialoguePortraitCanvasProps {
  speakerKind: DialogueSpeakerKind;
  characterId: CharacterPresetId;
  npcId?: string;
  captiveKind?: 'girl' | 'mother' | 'fox_kit' | 'student' | 'spirit';
  captiveColor?: number;
  isSpeaking?: boolean;
  className?: string;
}

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

export const DialoguePortraitCanvas: React.FC<DialoguePortraitCanvasProps> = ({
  speakerKind,
  characterId,
  npcId = 'npc_tetua',
  captiveKind = 'girl',
  captiveColor = 0xf472b6,
  isSpeaking = false,
  className = '',
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const speakingRef = useRef<boolean>(isSpeaking);
  speakingRef.current = isSpeaking;

  const sceneRefs = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    palette: ReturnType<typeof createMaterialPalette>;
    pivot: THREE.Group;
    activeKind: DialogueSpeakerKind;
    heroRig: HeroAvatarRig | null;
    npcMesh: THREE.Group | null;
    captiveMesh: THREE.Group | null;
    owlRig: OwlMessengerRig | null;
  } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const softGl = isSoftwareWebGl();
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !softGl,
      powerPreference: 'default',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(softGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.pointerEvents = 'none';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 0.88, 0.1, 24);

    const hemi = new THREE.HemisphereLight(0xfffbeb, 0x334155, softGl ? 1.55 : 1.35);
    const key = new THREE.DirectionalLight(0xfff7ed, 2.2);
    key.position.set(2.8, 4.5, 4.2);
    const rim = new THREE.DirectionalLight(0xfde68a, 1.15);
    rim.position.set(-3.2, 2.4, -2.5);
    const fill = new THREE.DirectionalLight(0xe0f2fe, 0.85);
    fill.position.set(-2.0, 0.8, 3.0);
    scene.add(hemi, key, rim, fill);

    const palette = createMaterialPalette(renderer, true, true);
    const pivot = new THREE.Group();
    scene.add(pivot);

    sceneRefs.current = {
      scene,
      camera,
      palette,
      pivot,
      activeKind: speakerKind,
      heroRig: null,
      npcMesh: null,
      captiveMesh: null,
      owlRig: null,
    };

    const syncSize = () => {
      const w = Math.max(90, host.clientWidth);
      const h = Math.max(100, host.clientHeight);
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
    let elapsed = 0;
    const minFrameMs = softGl ? 65 : 24;
    let lastRenderMs = 0;

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      if (document.hidden || now - lastRenderMs < minFrameMs) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }
      lastRenderMs = now;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastMs) / 1000));
      lastMs = now;
      elapsed += dt;

      const refs = sceneRefs.current;
      if (refs) {
        const talking = speakingRef.current;
        if (refs.activeKind === 'hero' && refs.heroRig) {
          applyHeroWeaponPose(refs.heroRig, 'ketapel', false, {
            speed: 0,
            walkCycle: 0,
            aimAlpha: 0,
            recoil: 0,
            dt,
            elapsed,
          });
          refs.heroRig.headGroup.rotation.y = talking ? Math.sin(elapsed * 5.2) * 0.08 : 0.06;
          refs.heroRig.headGroup.rotation.x = talking ? Math.sin(elapsed * 8.5) * 0.06 : 0;
        } else if (refs.activeKind === 'npc' && refs.npcMesh) {
          animateZoneNpc(refs.npcMesh, elapsed, 0.3, talking, dt, 'stand');
          const rig = refs.npcMesh.userData.npcRig as { headGroup?: THREE.Group } | undefined;
          if (rig?.headGroup && talking) {
            rig.headGroup.rotation.x = Math.sin(elapsed * 8.4) * 0.055;
          }
        } else if (refs.activeKind === 'captive' && refs.captiveMesh) {
          animateCaptiveMesh(refs.captiveMesh, elapsed, talking);
        } else if (refs.activeKind === 'owl' && refs.owlRig) {
          const flap = Math.sin(elapsed * (talking ? 8.5 : 3.2)) * 0.22;
          refs.owlRig.leftWing.rotation.z = 0.2 + flap;
          refs.owlRig.rightWing.rotation.z = -0.2 - flap;
          refs.owlRig.root.position.y = Math.sin(elapsed * 3.0) * 0.05;
        }

        refs.pivot.rotation.y = 0.34 + Math.sin(elapsed * 1.1) * 0.03;
      }

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      ro.disconnect();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      palette.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
      sceneRefs.current = null;
    };
  }, []);

  useEffect(() => {
    const refs = sceneRefs.current;
    if (!refs) return;

    while (refs.pivot.children.length > 0) {
      const child = refs.pivot.children[0];
      refs.pivot.remove(child);
      child.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.geometry.dispose();
        }
      });
    }
    refs.heroRig = null;
    refs.npcMesh = null;
    refs.captiveMesh = null;
    refs.owlRig = null;
    refs.activeKind = speakerKind;

    let targetRoot: THREE.Object3D;
    if (speakerKind === 'hero') {
      const rig = createHeroAvatar(refs.palette, getCharacterPreset(characterId).colors, characterId);
      applyHeroAppearance(rig, getCharacterPreset(characterId).colors, characterId);
      // Remove ground shadow blob if present so bust floats cleanly
      rig.root.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.CircleGeometry) {
          obj.visible = false;
        }
      });
      refs.heroRig = rig;
      targetRoot = rig.root;
    } else if (speakerKind === 'captive') {
      const mesh = createCaptiveMesh(captiveKind, captiveColor, refs.palette);
      mesh.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.CircleGeometry) {
          obj.visible = false;
        }
      });
      refs.captiveMesh = mesh;
      targetRoot = mesh;
    } else if (speakerKind === 'owl') {
      const owl = createOwlMessengerRig(refs.palette);
      owl.envelope.visible = false;
      refs.owlRig = owl;
      targetRoot = owl.root;
    } else {
      const mesh = createZoneNpc(npcId, refs.palette);
      mesh.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.CircleGeometry) {
          obj.visible = false;
        }
      });
      refs.npcMesh = mesh;
      targetRoot = mesh;
    }

    refs.pivot.add(targetRoot);
    refs.pivot.updateMatrixWorld(true);

    // Frame chest-up bust portrait cleanly matching Harvest Moon dialogue portrait
    const box = new THREE.Box3().setFromObject(targetRoot);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const safeH = Math.max(0.8, size.y);
    const bustFocusY =
      speakerKind === 'owl' || captiveKind === 'fox_kit' || captiveKind === 'spirit'
        ? center.y + safeH * 0.04
        : box.max.y - safeH * 0.34;
    const dist =
      speakerKind === 'owl' || captiveKind === 'fox_kit' || captiveKind === 'spirit'
        ? Math.max(2.35, safeH * 2.15)
        : Math.max(2.55, safeH * 1.38);

    refs.camera.position.set(0.08, bustFocusY + safeH * 0.04, dist);
    refs.camera.lookAt(0, bustFocusY, 0);
  }, [speakerKind, characterId, npcId, captiveKind, captiveColor]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    />
  );
};
