import React, { memo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { getCharacterPreset } from '../data/characterPresets';
import {
  buildDiverseNpcRig,
  DiverseNpcRigResult,
  NpcArchetypeId,
} from '../three/diverseNpcs';
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

export type DialogueSpeakerKind = 'hero' | 'npc' | 'captive' | 'owl' | 'villagers';

interface DialoguePortraitCanvasProps {
  speakerKind: DialogueSpeakerKind;
  characterId: CharacterPresetId;
  npcId?: string;
  villagerArchetypes?: string[];
  captiveKind?: 'girl' | 'mother' | 'fox_kit' | 'student' | 'spirit';
  captiveColor?: number;
  isSpeaking?: boolean;
  className?: string;
}

interface CachedPortraitEntry {
  key: string;
  root: THREE.Object3D;
  kind: DialogueSpeakerKind;
  heroRig: HeroAvatarRig | null;
  npcMesh: THREE.Group | null;
  villagerRigs: DiverseNpcRigResult[];
  captiveMesh: THREE.Group | null;
  owlRig: OwlMessengerRig | null;
  camX: number;
  camY: number;
  camZ: number;
  lookX: number;
  lookY: number;
}

interface PortraitStudio {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  palette: ReturnType<typeof createMaterialPalette>;
  pivot: THREE.Group;
  cache: Map<string, CachedPortraitEntry>;
  width: number;
  height: number;
}

let sharedStudio: PortraitStudio | null = null;
let studioFailed = false;

function disposeObjectTree(root: THREE.Object3D): void {
  root.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.geometry.dispose();
    }
  });
}

function getPortraitStudio(): PortraitStudio | null {
  if (sharedStudio) return sharedStudio;
  if (studioFailed) return null;
  try {
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(160, 176, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 160 / 176, 0.1, 24);

    const hemi = new THREE.HemisphereLight(0xfffbeb, 0x334155, 1.45);
    const key = new THREE.DirectionalLight(0xfff7ed, 2.0);
    key.position.set(2.8, 4.5, 4.2);
    const rim = new THREE.DirectionalLight(0xfde68a, 1.05);
    rim.position.set(-3.2, 2.4, -2.5);
    const fill = new THREE.DirectionalLight(0xe0f2fe, 0.75);
    fill.position.set(-2.0, 0.8, 3.0);
    scene.add(hemi, key, rim, fill);

    const palette = createMaterialPalette(renderer, true, true);
    const pivot = new THREE.Group();
    scene.add(pivot);

    sharedStudio = {
      renderer,
      scene,
      camera,
      palette,
      pivot,
      cache: new Map(),
      width: 160,
      height: 176,
    };
    return sharedStudio;
  } catch {
    studioFailed = true;
    return null;
  }
}

function getOrBuildPortraitEntry(
  studio: PortraitStudio,
  opts: {
    key: string;
    speakerKind: DialogueSpeakerKind;
    characterId: CharacterPresetId;
    npcId: string;
    villagerArchetypes?: string[];
    captiveKind: 'girl' | 'mother' | 'fox_kit' | 'student' | 'spirit';
    captiveColor: number;
  },
): CachedPortraitEntry {
  const existing = studio.cache.get(opts.key);
  if (existing) {
    studio.cache.delete(opts.key);
    studio.cache.set(opts.key, existing);
    return existing;
  }

  let heroRig: HeroAvatarRig | null = null;
  let npcMesh: THREE.Group | null = null;
  const villagerRigs: DiverseNpcRigResult[] = [];
  let captiveMesh: THREE.Group | null = null;
  let owlRig: OwlMessengerRig | null = null;
  let targetRoot: THREE.Object3D;

  if (opts.speakerKind === 'hero') {
    const rig = createHeroAvatar(
      studio.palette,
      getCharacterPreset(opts.characterId).colors,
      opts.characterId,
    );
    applyHeroAppearance(rig, getCharacterPreset(opts.characterId).colors, opts.characterId);
    rig.root.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.CircleGeometry) {
        obj.visible = false;
      }
    });
    heroRig = rig;
    targetRoot = rig.root;
  } else if (opts.speakerKind === 'villagers') {
    const pair = new THREE.Group();
    const archetypes: NpcArchetypeId[] =
      opts.villagerArchetypes && opts.villagerArchetypes.length > 0
        ? (opts.villagerArchetypes as NpcArchetypeId[])
        : ['florist_girl', 'farmer_boy'];
    archetypes.forEach((archId, idx) => {
      const rig = buildDiverseNpcRig(archId, studio.palette, false);
      rig.root.userData.npcRig = rig;
      if (archetypes.length === 2) {
        rig.root.position.set(idx === 0 ? -0.46 : 0.46, 0, idx === 0 ? 0.04 : -0.04);
        rig.root.rotation.y = idx === 0 ? 0.16 : -0.16;
      }
      villagerRigs.push(rig);
      pair.add(rig.root);
    });
    targetRoot = pair;
  } else if (opts.speakerKind === 'captive') {
    const mesh = createCaptiveMesh(opts.captiveKind, opts.captiveColor, studio.palette);
    mesh.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.CircleGeometry) {
        obj.visible = false;
      }
    });
    captiveMesh = mesh;
    targetRoot = mesh;
  } else if (opts.speakerKind === 'owl') {
    const owl = createOwlMessengerRig(studio.palette);
    owl.envelope.visible = false;
    owlRig = owl;
    targetRoot = owl.root;
  } else {
    const mesh = createZoneNpc(opts.npcId, studio.palette);
    mesh.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.CircleGeometry) {
        obj.visible = false;
      }
    });
    npcMesh = mesh;
    targetRoot = mesh;
  }

  targetRoot.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(targetRoot);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const safeH = Math.max(0.8, size.y);
  const bustFocusY =
    opts.speakerKind === 'owl' || opts.captiveKind === 'fox_kit' || opts.captiveKind === 'spirit'
      ? center.y + safeH * 0.04
      : box.max.y - safeH * 0.34;
  const dist =
    opts.speakerKind === 'villagers'
      ? Math.max(3.15, safeH * 1.48, size.x * 2.18)
      : opts.speakerKind === 'owl' || opts.captiveKind === 'fox_kit' || opts.captiveKind === 'spirit'
        ? Math.max(2.35, safeH * 2.15)
        : Math.max(2.55, safeH * 1.38);

  const entry: CachedPortraitEntry = {
    key: opts.key,
    root: targetRoot,
    kind: opts.speakerKind,
    heroRig,
    npcMesh,
    villagerRigs,
    captiveMesh,
    owlRig,
    camX: opts.speakerKind === 'villagers' ? 0.0 : 0.08,
    camY: bustFocusY + safeH * 0.04,
    camZ: dist,
    lookX: center.x,
    lookY: bustFocusY,
  };

  if (studio.cache.size >= 10) {
    const oldestKey = studio.cache.keys().next().value;
    if (oldestKey) {
      const oldest = studio.cache.get(oldestKey);
      studio.cache.delete(oldestKey);
      if (oldest && !studio.pivot.children.includes(oldest.root)) {
        disposeObjectTree(oldest.root);
      }
    }
  }
  studio.cache.set(opts.key, entry);
  return entry;
}

const DialoguePortraitCanvasInner: React.FC<DialoguePortraitCanvasProps> = ({
  speakerKind,
  characterId,
  npcId = 'npc_tetua',
  villagerArchetypes,
  captiveKind = 'girl',
  captiveColor = 0xf472b6,
  isSpeaking = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const speakingRef = useRef<boolean>(isSpeaking);
  speakingRef.current = isSpeaking;
  const villagerKey = villagerArchetypes?.join(',') ?? '';
  const entryKey = `${speakerKind}|${characterId}|${npcId}|${villagerKey}|${captiveKind}|${captiveColor}`;
  const elapsedRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const studio = getPortraitStudio();
    if (!studio) return;

    const entry = getOrBuildPortraitEntry(studio, {
      key: entryKey,
      speakerKind,
      characterId,
      npcId,
      villagerArchetypes,
      captiveKind,
      captiveColor,
    });

    const renderPortraitFrame = (dt: number, talking: boolean) => {
      const cw = Math.min(192, Math.max(96, canvas.clientWidth || 144));
      const ch = Math.min(192, Math.max(96, canvas.clientHeight || 164));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      if (studio.width !== cw || studio.height !== ch) {
        studio.width = cw;
        studio.height = ch;
        studio.renderer.setSize(cw, ch, false);
        studio.camera.aspect = cw / ch;
        studio.camera.updateProjectionMatrix();
      }

      if (studio.pivot.children[0] !== entry.root) {
        while (studio.pivot.children.length > 0) {
          studio.pivot.remove(studio.pivot.children[0]);
        }
        studio.pivot.add(entry.root);
      }

      const elapsed = elapsedRef.current;
      if (entry.kind === 'hero' && entry.heroRig) {
        applyHeroWeaponPose(entry.heroRig, 'ketapel', false, {
          speed: 0,
          walkCycle: 0,
          aimAlpha: 0,
          recoil: 0,
          dt,
          elapsed,
        });
        entry.heroRig.headGroup.rotation.y = talking ? Math.sin(elapsed * 5.2) * 0.08 : 0.06;
        entry.heroRig.headGroup.rotation.x = talking ? Math.sin(elapsed * 8.5) * 0.06 : 0;
      } else if (entry.kind === 'npc' && entry.npcMesh) {
        animateZoneNpc(entry.npcMesh, elapsed, 0.3, talking, dt, 'stand');
        const rig = entry.npcMesh.userData.npcRig as { headGroup?: THREE.Group } | undefined;
        if (rig?.headGroup && talking) {
          rig.headGroup.rotation.x = Math.sin(elapsed * 8.4) * 0.055;
        }
      } else if (entry.kind === 'villagers' && entry.villagerRigs.length > 0) {
        entry.villagerRigs.forEach((vRig, idx) => {
          animateZoneNpc(vRig.root, elapsed, idx * 1.4, talking, dt, 'stand');
          if (talking) {
            vRig.headGroup.rotation.x = Math.sin(elapsed * 8.2 + idx * 1.1) * 0.06;
            vRig.rightArm.rotation.x =
              vRig.baseRightArmX - 0.35 + Math.sin(elapsed * 5.4 + idx) * 0.14;
          }
        });
      } else if (entry.kind === 'captive' && entry.captiveMesh) {
        animateCaptiveMesh(entry.captiveMesh, elapsed, talking);
      } else if (entry.kind === 'owl' && entry.owlRig) {
        const flap = Math.sin(elapsed * (talking ? 8.5 : 3.2)) * 0.22;
        entry.owlRig.leftWing.rotation.z = 0.2 + flap;
        entry.owlRig.rightWing.rotation.z = -0.2 - flap;
        entry.owlRig.root.position.y = Math.sin(elapsed * 3.0) * 0.05;
      }

      studio.pivot.rotation.y =
        (entry.kind === 'villagers' ? 0.12 : 0.34) + Math.sin(elapsed * 1.1) * 0.03;
      studio.camera.position.set(entry.camX, entry.camY, entry.camZ);
      studio.camera.lookAt(entry.lookX, entry.lookY, 0);
      studio.renderer.render(studio.scene, studio.camera);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(studio.renderer.domElement, 0, 0, cw, ch);
      }
    };

    renderPortraitFrame(0.016, speakingRef.current);

    let timerId: number | null = null;
    if (isSpeaking) {
      timerId = window.setInterval(() => {
        if (document.hidden || !speakingRef.current) return;
        elapsedRef.current += 0.125;
        renderPortraitFrame(0.125, true);
      }, 125);
    }

    const ro = new ResizeObserver(() => {
      renderPortraitFrame(0.016, speakingRef.current);
    });
    ro.observe(canvas);

    return () => {
      ro.disconnect();
      if (timerId !== null) {
        window.clearInterval(timerId);
      }
    };
  }, [entryKey, isSpeaking, speakerKind, characterId, npcId, villagerArchetypes, captiveKind, captiveColor]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none block select-none ${className}`}
    />
  );
};

export const DialoguePortraitCanvas = memo(DialoguePortraitCanvasInner);
