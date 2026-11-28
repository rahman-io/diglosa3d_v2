import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { getCharacterPreset } from '../data/characterPresets';
import { createMaterialPalette, SurfaceMaterial } from '../three/materials';
import {
  applyHeroAppearance,
  computeBlinkScale,
  createHeroAvatar,
  HeroAvatarRig,
  setHeroFacialExpression,
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

function applyCharacterShowcasePose(
  rig: HeroAvatarRig,
  charId: CharacterPresetId,
  sTime: number,
  totalTime: number,
  dt: number,
): void {
  const intro = sTime < 1.75 ? Math.sin((sTime / 1.75) * Math.PI) : 0;
  const loopT = Math.max(0, sTime - 1.75);
  const cyclePos = (loopT % 4.6) / 4.6;
  const flourish =
    cyclePos >= 0.15 && cyclePos <= 0.62
      ? Math.sin(((cyclePos - 0.15) / 0.47) * Math.PI)
      : 0;
  const act = Math.max(intro, flourish * 0.88);

  // Subtle entrance accent ring burst on pedestal
  const ringMat = rig.dashRing.material as THREE.MeshBasicMaterial;
  if (sTime < 0.72) {
    const p = sTime / 0.72;
    ringMat.color.setHex(PEDESTAL_THEMES[charId].accentHex);
    ringMat.opacity = (1 - p) * 0.62;
    const ringScale = 0.72 + p * 0.65;
    rig.dashRing.scale.set(ringScale, ringScale, 1);
  } else {
    ringMat.opacity = 0;
  }

  let targetBodyY = 0;
  let targetBodyRotY = 0;
  let squashOffset = 0;
  let targetUpperX = 0;
  let targetUpperY = 0;
  let targetUpperZ = 0;
  let targetHeadX = 0;
  let targetHeadY = 0;
  let targetHeadZ = 0;
  let targetLeftArmX = 0;
  let targetLeftArmY = 0;
  let targetLeftArmZ = 0.04;
  let targetRightArmX = 0;
  let targetRightArmY = 0;
  let targetRightArmZ = -0.04;
  let targetLeftLegX = 0;
  let targetLeftLegZ = 0.04;
  let targetRightLegX = 0;
  let targetRightLegZ = -0.04;
  let exprMode: 'neutral' | 'tense' | 'fierce' = 'neutral';

  if (charId === 'hoot_emerald') {
    // Hoot: Nimble owl hop, wing-sleeve flutter, raises Golden Lantern & curious owl head-tilts
    const hop = sTime < 0.9 ? Math.abs(Math.sin(sTime * Math.PI * 2.2)) * 0.15 : 0;
    const flap = act > 0.05 ? Math.sin(totalTime * 14) * 0.3 * act : 0;
    targetBodyY = hop + Math.abs(Math.sin(totalTime * 2.8)) * 0.025;
    targetBodyRotY = Math.sin(totalTime * 1.1) * 0.1 + intro * 0.22;
    targetUpperX = 0.08 + act * 0.07;
    targetUpperY = Math.sin(totalTime * 1.4) * 0.12;
    targetHeadZ = 0.15 * Math.sin(totalTime * 1.35) + act * 0.16;
    targetHeadY = Math.sin(totalTime * 1.9) * 0.26;
    targetLeftArmX = -0.78 - act * 0.58 + Math.sin(totalTime * 2.4) * 0.06;
    targetLeftArmY = -0.14;
    targetLeftArmZ = 0.22 + act * 0.16;
    targetRightArmX = -0.25 - act * 0.35;
    targetRightArmZ = -0.28 - act * 0.52 - flap;
    targetLeftLegX = -0.1 + act * 0.14;
    targetRightLegX = 0.12 - act * 0.14;
    targetLeftLegZ = 0.06;
    targetRightLegZ = -0.06;
  } else if (charId === 'aria_sky') {
    // Aria: Serene Grand Translator — holds glowing Rune Tome open & traces runes gracefully
    const castWave = Math.sin(totalTime * 3.8);
    targetBodyY = Math.sin(totalTime * 2.0) * 0.018;
    targetBodyRotY = -0.14 + Math.sin(totalTime * 0.7) * 0.06;
    targetUpperX = -0.03 + Math.sin(totalTime * 1.8) * 0.025;
    targetUpperY = 0.18 - act * 0.08;
    targetHeadX = 0.04 + flourish * 0.1 - intro * 0.08;
    targetHeadY = -0.16 + Math.sin(totalTime * 1.1) * 0.1;
    targetHeadZ = -0.06 * act;
    targetLeftArmX = -0.95 - act * 0.18;
    targetLeftArmY = 0.28;
    targetLeftArmZ = -0.24;
    targetRightArmX = -0.58 - act * 0.78 + castWave * 0.12 * act;
    targetRightArmY = -0.2;
    targetRightArmZ = 0.12 + act * 0.28 + Math.cos(totalTime * 3.8) * 0.14 * act;
    targetLeftLegX = -0.14;
    targetRightLegX = 0.12;
  } else if (charId === 'karsa_crimson') {
    // Karsa: Heavy fearless brawler — power stomp, hoists Pickaxe & flexes bare right fist
    const drop = sTime < 0.3 ? (0.3 - sTime) * 0.35 : 0;
    squashOffset =
      sTime > 0.28 && sTime < 0.55
        ? -Math.sin(((sTime - 0.28) / 0.27) * Math.PI) * 0.1
        : 0;
    targetBodyY = drop + Math.sin(totalTime * 2.2) * 0.015;
    targetBodyRotY = 0.2 + intro * 0.12;
    targetUpperX = -0.06 + act * 0.06;
    targetUpperY = Math.sin(totalTime * 0.9) * 0.07 + act * 0.22;
    targetHeadX = -0.06 + act * 0.08;
    targetHeadY = -0.22 - act * 0.14;
    targetLeftArmX = -0.92 - act * 0.72 + Math.sin(totalTime * 2.2) * 0.04;
    targetLeftArmY = -0.18;
    targetLeftArmZ = 0.26 + act * 0.18;
    targetRightArmX = -0.42 - act * 1.15;
    targetRightArmY = 0.35 * act;
    targetRightArmZ = -0.22 - act * 0.24;
    targetLeftLegX = -0.18;
    targetRightLegX = 0.16;
    targetLeftLegZ = 0.15;
    targetRightLegZ = -0.15;
    exprMode = act > 0.25 ? 'fierce' : 'tense';
  } else if (charId === 'raka_gold') {
    // Raka: Young tech scientist — snappy hop, raises Scanner Tablet & rapidly taps hologram
    const hop =
      sTime < 0.45
        ? Math.sin((sTime / 0.45) * Math.PI) * 0.12
        : Math.abs(Math.sin(totalTime * 3.1)) * 0.02;
    const tap = Math.sin(totalTime * 16) * 0.14;
    targetBodyY = hop;
    targetBodyRotY = -0.18 + Math.sin(totalTime * 1.2) * 0.08;
    targetUpperX = 0.07;
    targetUpperY = 0.22;
    targetHeadX = act * 0.14 - 0.04;
    targetHeadY = -0.18 + (act > 0.3 ? 0.12 : Math.sin(totalTime * 2.1) * 0.18);
    targetHeadZ = -0.07 * Math.sin(totalTime * 1.6);
    targetLeftArmX = -1.04 - act * 0.18;
    targetLeftArmY = 0.24;
    targetLeftArmZ = -0.26;
    targetRightArmX = act > 0.12 ? -1.18 + tap * act : -0.22 + Math.sin(totalTime * 2.2) * 0.05;
    targetRightArmY = act > 0.12 ? 0.25 : 0;
    targetRightArmZ = act > 0.12 ? 0.46 * act : -0.16;
    targetLeftLegX = -0.15;
    targetRightLegX = 0.12;
    targetLeftLegZ = 0.07;
    targetRightLegZ = -0.07;
    exprMode = act > 0.2 ? 'tense' : 'neutral';
  } else if (charId === 'luna_violet') {
    // Luna: Agile Nature Guardian — springs into iconic Bow-Draw archer stance aimed at viewer
    const hop =
      sTime < 0.6
        ? Math.sin((sTime / 0.6) * Math.PI) * 0.15
        : Math.abs(Math.sin(totalTime * 2.4)) * 0.025;
    targetBodyY = hop;
    targetBodyRotY = 0.22 + act * 0.34;
    targetUpperX = 0.05;
    targetUpperY = 0.15 + act * 0.26;
    targetHeadY = -0.14 - act * 0.36;
    targetHeadZ = -0.05 * act;
    targetLeftArmX = THREE.MathUtils.lerp(-0.52, -1.42, act);
    targetLeftArmY = THREE.MathUtils.lerp(0.1, -0.18, act);
    targetLeftArmZ = THREE.MathUtils.lerp(0.22, 0.28, act);
    targetRightArmX = THREE.MathUtils.lerp(-0.18, -1.38, act);
    targetRightArmY = THREE.MathUtils.lerp(0, -0.35, act);
    targetRightArmZ = THREE.MathUtils.lerp(-0.18, 0.24, act);
    targetLeftLegX = -0.18 - act * 0.14;
    targetRightLegX = 0.16 + act * 0.14;
    targetLeftLegZ = 0.09;
    targetRightLegZ = -0.09;
    exprMode = act > 0.3 ? 'tense' : 'neutral';
  } else {
    // Nusa: Noble Ocean Voyager — heroic Trisula salute & commanding sea-sentinel stance
    const surge =
      sTime < 0.7
        ? Math.sin((sTime / 0.7) * Math.PI) * 0.14
        : Math.sin(totalTime * 2.0) * 0.02;
    targetBodyY = surge;
    targetBodyRotY = -0.15 + intro * 0.18;
    targetUpperX = -0.07;
    targetUpperY = -0.16 + act * 0.26;
    targetHeadX = -0.06;
    targetHeadY = 0.14 - act * 0.22;
    targetLeftArmX = -0.24 - act * 0.78 + Math.sin(totalTime * 1.9) * 0.04;
    targetLeftArmY = -0.15 * act;
    targetLeftArmZ = 0.3 + act * 0.14;
    targetRightArmX = -0.28 - act * 0.55;
    targetRightArmY = -0.2 * act;
    targetRightArmZ = -0.22 - act * 0.62;
    targetLeftLegX = -0.16;
    targetRightLegX = 0.14;
    targetLeftLegZ = 0.12;
    targetRightLegZ = -0.12;
    exprMode = act > 0.3 ? 'fierce' : 'neutral';
  }

  // Volume-preserving breathing + squash/stretch
  const targetBodySy = 1 + Math.sin(totalTime * 2.6) * 0.036 + squashOffset;
  const curBodySy = THREE.MathUtils.damp(rig.body.scale.y, targetBodySy, 16, dt);
  const safeBodySy = Math.max(0.76, curBodySy);
  const bodySxz = 1 / Math.sqrt(safeBodySy);
  rig.body.scale.set(bodySxz, safeBodySy, bodySxz);

  // Natural blinking + expressive brows/mouth
  const blinkY = computeBlinkScale(totalTime, 0.25);
  rig.leftEye.scale.y = blinkY;
  rig.rightEye.scale.y = blinkY;
  setHeroFacialExpression(rig, exprMode, totalTime, false);

  const dampRate = 12;
  rig.body.position.y = THREE.MathUtils.damp(rig.body.position.y, targetBodyY, dampRate, dt);
  rig.body.rotation.y = THREE.MathUtils.damp(rig.body.rotation.y, targetBodyRotY, dampRate, dt);
  rig.upperBody.rotation.x = THREE.MathUtils.damp(rig.upperBody.rotation.x, targetUpperX, dampRate, dt);
  rig.upperBody.rotation.y = THREE.MathUtils.damp(rig.upperBody.rotation.y, targetUpperY, dampRate, dt);
  rig.upperBody.rotation.z = THREE.MathUtils.damp(rig.upperBody.rotation.z, targetUpperZ, dampRate, dt);
  rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, targetHeadX, dampRate, dt);
  rig.headGroup.rotation.y = THREE.MathUtils.damp(rig.headGroup.rotation.y, targetHeadY, dampRate, dt);
  rig.headGroup.rotation.z = THREE.MathUtils.damp(rig.headGroup.rotation.z, targetHeadZ, dampRate, dt);
  rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, targetLeftArmX, 15, dt);
  rig.leftArm.rotation.y = THREE.MathUtils.damp(rig.leftArm.rotation.y, targetLeftArmY, 15, dt);
  rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, targetLeftArmZ, 15, dt);
  rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, targetRightArmX, 15, dt);
  rig.rightArm.rotation.y = THREE.MathUtils.damp(rig.rightArm.rotation.y, targetRightArmY, 15, dt);
  rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, targetRightArmZ, 15, dt);
  rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, targetLeftLegX, dampRate, dt);
  rig.leftLeg.rotation.z = THREE.MathUtils.damp(rig.leftLeg.rotation.z, targetLeftLegZ, dampRate, dt);
  rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, targetRightLegX, dampRate, dt);
  rig.rightLeg.rotation.z = THREE.MathUtils.damp(rig.rightLeg.rotation.z, targetRightLegZ, dampRate, dt);
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

export const HeroPreviewCanvas: React.FC<HeroPreviewCanvasProps> = ({
  characterId,
  className = 'h-56 sm:h-64',
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const initialCharacterRef = useRef<CharacterPresetId>(characterId);
  const activeCharacterRef = useRef<CharacterPresetId>(characterId);
  const showcaseTimeRef = useRef<number>(0);
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
      showcaseTimeRef.current += dt;

      if (!userInteracting) {
        pivot.rotation.y = Math.sin(totalTime * 0.52) * 0.24;
        pedestalGroup.rotation.y = pivot.rotation.y;
      }

      applyCharacterShowcasePose(
        rig,
        activeCharacterRef.current,
        showcaseTimeRef.current,
        totalTime,
        dt,
      );

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
    if (activeCharacterRef.current !== characterId) {
      activeCharacterRef.current = characterId;
      showcaseTimeRef.current = 0;
    }
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
