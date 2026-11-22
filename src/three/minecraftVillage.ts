import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  constrainToWalkableArchipelago,
  getArchipelagoGroundY,
  isWalkableArchipelago,
  OVERWORLD_ANCHORS,
  sampleArchipelagoTerrain,
} from './archipelagoWorld';
import { MaterialPalette } from './materials';
import {
  buildDiverseNpcRig,
  NPC_ARCHETYPES,
  NpcAppearanceVariant,
  NpcArchetypeId,
} from './diverseNpcs';

export interface VillageObstacle {
  x: number;
  z: number;
  halfW: number;
  halfD: number;
}

export interface VillageInteractable {
  id: string;
  x: number;
  z: number;
  radius: number;
  message: string;
  mesh: THREE.Object3D;
}

function computeVillageBlink(elapsed: number, phase = 0): number {
  const period = 3.7 + (phase % 1.4);
  const t = (elapsed + phase * 1.7) % period;
  if (t < 0.14) {
    const p = t / 0.14;
    return Math.max(0.08, 1 - Math.sin(p * Math.PI) * 0.92);
  }
  if (Math.floor((elapsed + phase) / period) % 4 === 0 && t >= 0.24 && t < 0.36) {
    const p = (t - 0.24) / 0.12;
    return Math.max(0.08, 1 - Math.sin(p * Math.PI) * 0.92);
  }
  return 1;
}

interface VillagerActor {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  headGroup: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  propSpin?: THREE.Object3D;
  archetype: NpcArchetypeId;
  baseRightArmX: number;
  baseLeftArmX: number;
  baseRightArmZ: number;
  baseLeftArmZ: number;
  baseScaleXZ: number;
  baseScaleY: number;
  waypoints: Array<[number, number]>;
  homeDoor: [number, number];
  isInsideHouse: boolean;
  wpIdx: number;
  x: number;
  z: number;
  yaw: number;
  pauseTimer: number;
  speed: number;
  walkPhase: number;
  stuckTimer: number;
  avoidSign: number;
  interactable?: VillageInteractable;
}

interface GolemActor {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  headGroup: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  waypoints: Array<[number, number]>;
  wpIdx: number;
  x: number;
  z: number;
  yaw: number;
  pauseTimer: number;
  walkPhase: number;
  holdsFlower: boolean;
  stuckTimer: number;
  avoidSign: number;
  interactable?: VillageInteractable;
}

interface LlamaActor {
  root: THREE.Group;
  headPivot: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  legs: THREE.Mesh[];
  baseX: number;
  baseZ: number;
  baseYaw: number;
  phase: number;
}

interface BeeActor {
  root: THREE.Group;
  leftWing: THREE.Mesh;
  rightWing: THREE.Mesh;
  centerX: number;
  centerY: number;
  centerZ: number;
  radiusX: number;
  radiusZ: number;
  speed: number;
  phase: number;
}

interface PillagerActor {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  centerX: number;
  baseY: number;
  centerZ: number;
  patrolR: number;
  phase: number;
}

export interface MinecraftVillageRig {
  group: THREE.Group;
  obstacles: VillageObstacle[];
  interactables: VillageInteractable[];
  clickables: THREE.Object3D[];
  villagers: VillagerActor[];
  golems: GolemActor[];
  llamas: LlamaActor[];
  bees: BeeActor[];
  pillagers: PillagerActor[];
  critters: Array<{
    root: THREE.Group;
    head: THREE.Group;
    leftEye: THREE.Mesh;
    rightEye: THREE.Mesh;
    baseX: number;
    baseZ: number;
    baseYaw: number;
    phase: number;
  }>;
  torchesFlame: THREE.Object3D[];
  smokePuffs: Array<{ mesh: THREE.Mesh; baseX: number; baseY: number; baseZ: number; phase: number }>;
  windUniforms: { uTime: { value: number } };
  sunGroup?: THREE.Group;
  moonGroup?: THREE.Group;
  starMat?: THREE.PointsMaterial;
  outpostBanner?: THREE.Group;
  breezeMotes?: {
    mesh: THREE.InstancedMesh;
    seeds: Float32Array;
    count: number;
  };
  disposables: Array<{ dispose: () => void }>;
}

export interface GuardPostRig {
  group: THREE.Group;
  bedX: number;
  bedZ: number;
  bedY: number;
  bedYaw: number;
  torchFlame: THREE.Object3D;
  obstacles: VillageObstacle[];
}

function mergeStaticGroupMeshes(
  root: THREE.Group,
  disposables?: Array<{ dispose: () => void }>,
): void {
  interface MergeBucket {
    mat: THREE.Material;
    castShadow: boolean;
    receiveShadow: boolean;
    meshes: THREE.Mesh[];
  }
  const buckets = new Map<string, MergeBucket>();

  for (const child of root.children) {
    if (
      !(child instanceof THREE.Mesh) ||
      child instanceof THREE.InstancedMesh ||
      child.userData?.isFlame ||
      child.userData?.villageId ||
      Array.isArray(child.material)
    ) {
      continue;
    }
    const geo = child.geometry;
    if (!geo || !geo.getAttribute('position')) continue;
    const hasUv = Boolean(geo.getAttribute('uv'));
    const key = `${child.material.uuid}|${child.castShadow ? 1 : 0}|${child.receiveShadow ? 1 : 0}|${hasUv ? 1 : 0}`;
    let b = buckets.get(key);
    if (!b) {
      b = {
        mat: child.material,
        castShadow: child.castShadow,
        receiveShadow: child.receiveShadow,
        meshes: [],
      };
      buckets.set(key, b);
    }
    b.meshes.push(child);
  }

  for (const b of buckets.values()) {
    if (b.meshes.length < 2) continue;
    const bakedGeos: THREE.BufferGeometry[] = [];
    for (const m of b.meshes) {
      m.updateMatrix();
      const raw = m.geometry;
      const g = raw.index ? raw.toNonIndexed() : raw.clone();
      for (const attrName of Object.keys(g.attributes)) {
        if (attrName !== 'position' && attrName !== 'normal' && attrName !== 'uv') {
          g.deleteAttribute(attrName);
        }
      }
      if (!g.getAttribute('normal')) {
        g.computeVertexNormals();
      }
      g.applyMatrix4(m.matrix);
      bakedGeos.push(g);
    }
    const merged = mergeGeometries(bakedGeos, false);
    for (const g of bakedGeos) g.dispose();
    if (!merged) continue;

    const mergedMesh = new THREE.Mesh(merged, b.mat);
    mergedMesh.castShadow = b.castShadow;
    mergedMesh.receiveShadow = b.receiveShadow;
    root.add(mergedMesh);
    disposables?.push(merged);

    for (const m of b.meshes) {
      root.remove(m);
      m.geometry.dispose();
    }
  }
}

export function createNpcGuardPost(
  palette: MaterialPalette,
  options: { x: number; z: number; rotY: number; bedTint?: number; y?: number },
): GuardPostRig {
  const groundY = options.y ?? getArchipelagoGroundY(options.x, options.z);
  const group = new THREE.Group();
  group.position.set(options.x, groundY, options.z);
  group.rotation.y = options.rotY;

  const woodMat = palette.getMat(0x92400e, 'matte');
  const darkWoodMat = palette.getMat(0x5c3a21, 'matte');
  const stoneMat = palette.getMat(0x64748b, 'matte');
  const bedFrameMat = palette.getMat(0x78350f, 'matte');
  const mattressMat = palette.getMat(options.bedTint ?? 0xdc2626, 'matte');
  const pillowMat = palette.getMat(0xf8fafc, 'matte');
  const lanternMat = palette.getMat(0xfde047, 'emissive');

  // Stone foundation platform
  const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.22, 3.0), stoneMat);
  floorMesh.position.set(0, 0.11, 0);
  floorMesh.receiveShadow = true;
  floorMesh.castShadow = true;
  group.add(floorMesh);

  // 4 Timber corner pillars
  const postGeo = new THREE.BoxGeometry(0.24, 2.55, 0.24);
  const corners: Array<[number, number]> = [
    [-1.35, -1.25],
    [1.35, -1.25],
    [-1.35, 1.25],
    [1.35, 1.25],
  ];
  for (const [cx, cz] of corners) {
    const p = new THREE.Mesh(postGeo, darkWoodMat);
    p.position.set(cx, 1.38, cz);
    p.castShadow = true;
    group.add(p);
  }

  // Low side timber railing on back & left
  const backRail = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.65, 0.16), woodMat);
  backRail.position.set(0, 0.55, -1.25);
  group.add(backRail);

  // Slanted / pitched wooden awning roof
  const roofBase = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.2, 3.35), woodMat);
  roofBase.position.set(0, 2.7, 0);
  roofBase.castShadow = true;
  group.add(roofBase);
  const roofPeak = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.22, 2.5), darkWoodMat);
  roofPeak.position.set(0, 2.88, 0);
  roofPeak.castShadow = true;
  group.add(roofPeak);

  // Guard bed inside shelter (head at -x, feet at +x)
  const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.34, 1.05), bedFrameMat);
  bedFrame.position.set(0, 0.39, -0.35);
  group.add(bedFrame);

  const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.24, 0.94), mattressMat);
  mattress.position.set(0.02, 0.66, -0.35);
  group.add(mattress);

  const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, 0.82), pillowMat);
  pillow.position.set(-0.68, 0.8, -0.35);
  group.add(pillow);

  // Warm guard lantern post
  const lanternPole = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.9, 0.14), darkWoodMat);
  lanternPole.position.set(1.35, 2.15, 1.25);
  group.add(lanternPole);
  const lanternGlow = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.32), lanternMat);
  lanternGlow.position.set(1.35, 2.38, 1.52);
  group.add(lanternGlow);

  mergeStaticGroupMeshes(group);

  // Compute world coordinates of bed center & sleep yaw (+x = feet direction in world space)
  const cos = Math.cos(options.rotY);
  const sin = Math.sin(options.rotY);
  const localBedX = 0;
  const localBedZ = -0.35;
  const bedX = options.x + localBedX * cos + localBedZ * sin;
  const bedZ = options.z - localBedX * sin + localBedZ * cos;
  const bedYaw = options.rotY + Math.PI / 2;

  return {
    group,
    bedX,
    bedZ,
    bedY: groundY + 0.78,
    bedYaw,
    torchFlame: lanternGlow,
    obstacles: [{ x: options.x, z: options.z, halfW: 1.55, halfD: 1.45 }],
  };
}

// Helper: detailed Minecraft-style Timber & Cobblestone House
export function createMinecraftHouse(
  palette: MaterialPalette,
  options: {
    x: number;
    z: number;
    rotY: number;
    width?: number;
    depth?: number;
    wallHeight?: number;
    roofTint?: number;
    flowerBox?: boolean;
  },
): THREE.Group {
  const w = options.width ?? 6.0;
  const d = options.depth ?? 5.0;
  const h = options.wallHeight ?? 3.4;
  const group = new THREE.Group();
  group.position.set(options.x, 0, options.z);
  group.rotation.y = options.rotY;

  const cobbleMat = palette.getPixelMat('cobble');
  const plankMat = palette.getPixelMat('oak_plank');
  const logMat = palette.getPixelMat('oak_log');
  const roofMat = options.roofTint
    ? palette.getPixelMat('spruce_plank', options.roofTint)
    : palette.getPixelMat('spruce_plank');
  const glassMat = palette.getPixelMat('glass_pane');
  const darkWoodMat = palette.getMat(0x5c3a1e, 'matte');
  const flameMat = palette.getMat(0xfef08a, 'emissive');
  const emberMat = palette.getMat(0xf97316, 'emissive');

  // Cobblestone base foundation
  const base = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 1.0, d + 0.3), cobbleMat);
  base.position.y = 0.5;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Wooden plank or warm cream-plaster walls (large 12m x 10m village houses use crisp cream-plaster with oak beams!)
  const wallMat = w >= 10 ? palette.getMat(0xf8fafc, 'matte') : plankMat;
  const walls = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, h - 0.8, d - 0.1), wallMat);
  walls.position.y = 1.0 + (h - 0.8) * 0.5;
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // 4 Corner Oak Log Pillars
  const pillarGeo = new THREE.BoxGeometry(w >= 10 ? 0.85 : 0.62, h + 0.2, w >= 10 ? 0.85 : 0.62);
  const halfW = w * 0.5 - 0.08;
  const halfD = d * 0.5 - 0.08;
  const corners: Array<[number, number]> = [
    [-halfW, -halfD],
    [halfW, -halfD],
    [-halfW, halfD],
    [halfW, halfD],
  ];
  corners.forEach(([cx, cz]) => {
    const p = new THREE.Mesh(pillarGeo, logMat);
    p.position.set(cx, (h + 0.2) * 0.5, cz);
    p.castShadow = true;
    group.add(p);
  });

  // Stepped Minecraft Pitched Plank Roof (scales adaptively for 12m x 10m village houses!)
  const tiers = Math.max(4, Math.ceil(w * 0.52));
  const stepW = (w + 0.4) / tiers;
  for (let i = 0; i < tiers; i++) {
    const tW = Math.max(1.4, w + 1.2 - i * stepW);
    const tD = d + 1.1;
    const tier = new THREE.Mesh(new THREE.BoxGeometry(tW, 0.58, tD), roofMat);
    tier.position.y = h + 0.25 + i * 0.54;
    tier.castShadow = true;
    tier.receiveShadow = true;
    group.add(tier);
  }

  // Front Cobblestone Entry Stairs + Oak Door
  const stair1 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.38, 0.9), cobbleMat);
  stair1.position.set(0, 0.19, halfD + 0.55);
  stair1.receiveShadow = true;
  const stair2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 0.5), cobbleMat);
  stair2.position.set(0, 0.32, halfD + 0.25);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.05, 0.18), darkWoodMat);
  door.position.set(0, 1.55, halfD + 0.06);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.24), palette.getMat(0xfbbf24, 'metal'));
  handle.position.set(0.35, 1.5, halfD + 0.1);
  group.add(stair1, stair2, door, handle);

  // Twin Torch Posts beside the front steps (from screenshot reference)
  [-1.25, 1.25].forEach((tx) => {
    const cob = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.85, 0.45), cobbleMat);
    cob.position.set(tx, 0.42, halfD + 0.48);
    const stick = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.6, 0.14), darkWoodMat);
    stick.position.set(tx, 1.15, halfD + 0.48);
    const ember = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.18), emberMat);
    ember.position.set(tx, 1.48, halfD + 0.48);
    const flame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.14), flameMat);
    flame.position.set(tx, 1.62, halfD + 0.48);
    flame.userData.isFlame = true;
    group.add(cob, stick, ember, flame);
  });

  // Glass Windows on front & sides
  const winFront = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.95, 0.16), glassMat);
  winFront.position.set(w * 0.28, 2.25, halfD + 0.05);
  const winSideL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.95, 1.4), glassMat);
  winSideL.position.set(-halfW - 0.04, 2.25, 0);
  const winSideR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.95, 1.4), glassMat);
  winSideR.position.set(halfW + 0.04, 2.25, 0);
  group.add(winFront, winSideL, winSideR);

  if (options.flowerBox) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.35, 0.4), darkWoodMat);
    box.position.set(w * 0.28, 1.55, halfD + 0.22);
    const flower1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.24), palette.getMat(0xef4444, 'matte'));
    flower1.position.set(w * 0.28 - 0.28, 1.84, halfD + 0.24);
    const flower2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.24), palette.getMat(0xfacc15, 'matte'));
    flower2.position.set(w * 0.28 + 0.24, 1.84, halfD + 0.24);
    group.add(box, flower1, flower2);
  }

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(w + 2.8, d + 2.8),
    palette.contactShadowMat,
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  group.add(shadow);

  mergeStaticGroupMeshes(group);

  return group;
}

function createCobblestoneWell(palette: MaterialPalette, x: number, z: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const cobble = palette.getPixelMat('cobble');
  const oakFence = palette.getPixelMat('oak_plank');
  const roof = palette.getPixelMat('spruce_plank');

  // Gravel pad underneath
  const gravel = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.08, 4.6), cobble);
  gravel.position.y = 0.04;
  gravel.receiveShadow = true;
  g.add(gravel);

  // 4-sided well basin walls
  const wN = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.05, 0.45), cobble);
  wN.position.set(0, 0.55, -1.18);
  const wS = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.05, 0.45), cobble);
  wS.position.set(0, 0.55, 1.18);
  const wE = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.05, 2.0), cobble);
  wE.position.set(1.18, 0.55, 0);
  const wW = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.05, 2.0), cobble);
  wW.position.set(-1.18, 0.55, 0);
  [wN, wS, wE, wW].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  });

  // Water inside the well
  const water = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.65, 1.9), palette.waterMat);
  water.position.y = 0.48;
  g.add(water);

  // 4 Corner fence posts + pitched plank roof
  const postGeo = new THREE.BoxGeometry(0.28, 2.4, 0.28);
  const posts: Array<[number, number]> = [
    [-1.18, -1.18],
    [1.18, -1.18],
    [-1.18, 1.18],
    [1.18, 1.18],
  ];
  posts.forEach(([px, pz]) => {
    const p = new THREE.Mesh(postGeo, oakFence);
    p.position.set(px, 2.15, pz);
    p.castShadow = true;
    g.add(p);
  });

  const roofBase = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.35, 3.4), roof);
  roofBase.position.y = 3.4;
  roofBase.castShadow = true;
  const roofCap = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.35, 2.3), roof);
  roofCap.position.y = 3.74;
  roofCap.castShadow = true;
  const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 0.32), palette.getMat(0xfacc15, 'emissive'));
  lantern.position.set(0, 2.95, 0);
  const bucket = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.42, 0.44), palette.getMat(0x64748b, 'metal'));
  bucket.position.set(0.35, 1.45, 0);
  g.add(roofBase, roofCap, lantern, bucket);

  mergeStaticGroupMeshes(g);

  return g;
}



function createLanternPost(palette: MaterialPalette, x: number, z: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const postMat = palette.getPixelMat('oak_log');
  const plankMat = palette.getPixelMat('oak_plank');
  const ironMat = palette.getMat(0x1e293b, 'metal');
  const glowMat = palette.getMat(0xfbbf24, 'emissive');

  const pole = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.1, 0.28), postMat);
  pole.position.y = 1.55;
  pole.castShadow = true;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.24, 0.24), plankMat);
  arm.position.set(0.32, 3.05, 0);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.34), ironMat);
  cap.position.set(0.68, 2.82, 0);
  const core = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.36, 0.28), glowMat);
  core.position.set(0.68, 2.58, 0);
  g.add(pole, arm, cap, core);
  return g;
}

function createVillagerMesh(
  palette: MaterialPalette,
  archetype: NpcArchetypeId,
  variant?: NpcAppearanceVariant,
): VillagerActor {
  const rig = buildDiverseNpcRig(archetype, palette, true, variant);
  return {
    root: rig.root,
    bodyPivot: rig.bodyPivot,
    headGroup: rig.headGroup,
    leftEye: rig.leftEye,
    rightEye: rig.rightEye,
    leftLeg: rig.leftLeg,
    rightLeg: rig.rightLeg,
    leftArm: rig.leftArm,
    rightArm: rig.rightArm,
    propSpin: rig.propSpin,
    archetype,
    baseRightArmX: rig.baseRightArmX,
    baseLeftArmX: rig.baseLeftArmX,
    baseRightArmZ: rig.baseRightArmZ,
    baseLeftArmZ: rig.baseLeftArmZ,
    baseScaleXZ: rig.baseScaleXZ,
    baseScaleY: rig.baseScaleY,
    waypoints: [],
    wpIdx: 0,
    x: 0,
    z: 0,
    yaw: 0,
    pauseTimer: 0,
    speed: 1.9,
    walkPhase: Math.random() * Math.PI * 2,
    stuckTimer: 0,
    avoidSign: Math.random() < 0.5 ? 1 : -1,
    homeDoor: [0, 0],
    isInsideHouse: false,
  };
}

function createIronGolemMesh(palette: MaterialPalette, holdsFlower: boolean): GolemActor {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), palette.contactShadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  root.add(shadow);

  const ironMat = palette.getMat(0xd6d3d1, 'matte');
  const mossMat = palette.getMat(0x4d7c0f, 'matte');
  const darkMat = palette.getMat(0x292524, 'matte');
  const eyeGlow = palette.getMat(0xef4444, 'emissive');

  const makeLeg = (lx: number): THREE.Group => {
    const leg = new THREE.Group();
    leg.position.set(lx, 1.25, 0);
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.25, 0.58), ironMat);
    m.position.y = -0.62;
    m.castShadow = true;
    leg.add(m);
    return leg;
  };
  const leftLeg = makeLeg(-0.48);
  const rightLeg = makeLeg(0.48);
  bodyPivot.add(leftLeg, rightLeg);

  const waist = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.72), darkMat);
  waist.position.y = 1.45;
  const chest = new THREE.Mesh(new THREE.BoxGeometry(1.95, 1.25, 0.98), ironMat);
  chest.position.y = 2.28;
  chest.castShadow = true;
  const vine = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.85, 1.02), mossMat);
  vine.position.set(-0.35, 2.18, 0);
  bodyPivot.add(waist, chest, vine);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.9, 0.08);
  bodyPivot.add(headGroup);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.92, 0.82), ironMat);
  head.position.y = 0.36;
  head.castShadow = true;
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.36, 0.24), palette.getMat(0xa8a29e, 'matte'));
  nose.position.set(0, 0.16, 0.46);
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.08), eyeGlow);
  eyeL.position.set(-0.2, 0.39, 0.42);
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.08), eyeGlow);
  eyeR.position.set(0.2, 0.39, 0.42);
  headGroup.add(head, nose, eyeL, eyeR);

  const makeArm = (ax: number, flower: boolean): THREE.Group => {
    const arm = new THREE.Group();
    arm.position.set(ax, 2.72, 0);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.05, 0.52), ironMat);
    mesh.position.y = -0.95;
    mesh.castShadow = true;
    arm.add(mesh);
    if (flower) {
      const stem = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.08), palette.getMat(0x16a34a, 'matte'));
      stem.position.set(0, -1.88, 0.38);
      stem.rotation.x = 0.6;
      const petal = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.12), palette.getMat(0xfacc15, 'emissive'));
      petal.position.set(0, -1.78, 0.55);
      arm.add(stem, petal);
      arm.rotation.x = -0.65;
    }
    return arm;
  };
  const leftArm = makeArm(-1.25, holdsFlower);
  const rightArm = makeArm(1.25, false);
  bodyPivot.add(leftArm, rightArm);

  return {
    root,
    bodyPivot,
    headGroup,
    leftEye: eyeL,
    rightEye: eyeR,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    waypoints: [],
    wpIdx: 0,
    x: 0,
    z: 0,
    yaw: 0,
    pauseTimer: 0,
    walkPhase: 0,
    holdsFlower,
    stuckTimer: 0,
    avoidSign: 1,
  };
}

function createLlamaMesh(
  palette: MaterialPalette,
  x: number,
  z: number,
  yaw: number,
  carpetHex: number,
): LlamaActor {
  const root = new THREE.Group();
  root.position.set(x, 0, z);
  root.rotation.y = yaw;

  const wool = palette.getMat(0xf8fafc, 'matte');
  const snoutMat = palette.getMat(0xe2c7a8, 'matte');
  const carpet = palette.getMat(carpetHex, 'matte');
  const trim = palette.getMat(0xfacc15, 'matte');
  const dark = palette.getMat(0x0f172a, 'gloss');

  const legs: THREE.Mesh[] = [];
  const legGeo = new THREE.BoxGeometry(0.26, 0.85, 0.26);
  const legCoords: Array<[number, number]> = [
    [-0.24, -0.45],
    [0.24, -0.45],
    [-0.24, 0.45],
    [0.24, 0.45],
  ];
  legCoords.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, wool);
    leg.position.set(lx, 0.425, lz);
    leg.castShadow = true;
    legs.push(leg);
    root.add(leg);
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.78, 1.38), wool);
  body.position.y = 1.18;
  body.castShadow = true;
  const rug = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.46, 0.85), carpet);
  rug.position.set(0, 1.38, -0.05);
  const rugTrim = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.1, 0.88), trim);
  rugTrim.position.set(0, 1.16, -0.05);
  root.add(body, rug, rugTrim);

  const headPivot = new THREE.Group();
  headPivot.position.set(0, 1.45, 0.56);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.9, 0.46), wool);
  neck.position.set(0, 0.42, 0.08);
  neck.castShadow = true;
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.34), snoutMat);
  snout.position.set(0, 0.72, 0.38);
  const earL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.32, 0.14), wool);
  earL.position.set(-0.16, 1.0, 0.05);
  const earR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.32, 0.14), wool);
  earR.position.set(0.16, 1.0, 0.05);
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.06), dark);
  eyeL.position.set(-0.16, 0.86, 0.32);
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.06), dark);
  eyeR.position.set(0.16, 0.86, 0.32);
  headPivot.add(neck, snout, earL, earR, eyeL, eyeR);
  root.add(headPivot);

  return {
    root,
    headPivot,
    leftEye: eyeL,
    rightEye: eyeR,
    legs,
    baseX: x,
    baseZ: z,
    baseYaw: yaw,
    phase: Math.random() * 6,
  };
}

function createBeeMesh(palette: MaterialPalette): {
  root: THREE.Group;
  leftWing: THREE.Mesh;
  rightWing: THREE.Mesh;
} {
  const root = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.36, 0.52), palette.getMat(0xfacc15, 'matte'));
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.38, 0.18), palette.getMat(0x1e293b, 'matte'));
  stripe.position.z = -0.05;
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.06), palette.getMat(0x0f172a, 'gloss'));
  eyeL.position.set(-0.11, 0.04, 0.27);
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.06), palette.getMat(0x0f172a, 'gloss'));
  eyeR.position.set(0.11, 0.04, 0.27);

  const wingMat = palette.getMat(0xf8fafc, 'glass');
  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.26), wingMat);
  leftWing.position.set(-0.28, 0.2, 0.02);
  const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.26), wingMat);
  rightWing.position.set(0.28, 0.2, 0.02);

  root.add(body, stripe, eyeL, eyeR, leftWing, rightWing);
  return { root, leftWing, rightWing };
}



export function createMinecraftVillageWorld(palette: MaterialPalette): MinecraftVillageRig {
  const group = new THREE.Group();
  const obstacles: VillageObstacle[] = [];
  const interactables: VillageInteractable[] = [];
  const clickables: THREE.Object3D[] = [];
  const villagers: VillagerActor[] = [];
  const golems: GolemActor[] = [];
  const llamas: LlamaActor[] = [];
  const bees: BeeActor[] = [];
  const pillagers: PillagerActor[] = [];
  const critters: MinecraftVillageRig['critters'] = [];
  const torchesFlame: THREE.Object3D[] = [];
  const smokePuffs: Array<{ mesh: THREE.Mesh; baseX: number; baseY: number; baseZ: number; phase: number }> = [];
  const disposables: Array<{ dispose: () => void }> = [];
  const windUniforms = { uTime: { value: 0 } };

  const makeWindMaterial = (
    baseMat: THREE.Material,
    opts: { minY: number; amp: number; speed: number; cacheKey: string },
  ): THREE.Material => {
    const mat = baseMat.clone();
    mat.customProgramCacheKey = () => opts.cacheKey;
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = windUniforms.uTime;
      shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float windPhase = 0.0;
        #ifdef USE_INSTANCING
          windPhase = instanceMatrix[3].x * 0.17 + instanceMatrix[3].z * 0.13;
        #endif
        float windHeight = max(0.0, transformed.y - (${opts.minY.toFixed(3)}));
        float windGust = sin(uTime * ${opts.speed.toFixed(2)} + windPhase + transformed.y * 0.65)
                       + 0.45 * sin(uTime * ${(opts.speed * 1.73).toFixed(2)} + windPhase * 1.9);
        float windCross = cos(uTime * ${(opts.speed * 0.82).toFixed(2)} + windPhase * 1.3);
        transformed.x += windGust * windHeight * ${opts.amp.toFixed(4)};
        transformed.z += windCross * windHeight * ${(opts.amp * 0.65).toFixed(4)};`,
      );
    };
    disposables.push(mat);
    return mat;
  };

  // 1. Classic Minecraft Square Sun, Moon & Night Starfield in sky dome (scaled past expanded archipelago)
  const sunGroup = new THREE.Group();
  sunGroup.userData.isMapHidden = true;
  sunGroup.position.set(105, 84, -145);
  sunGroup.lookAt(0, 0, 0);
  const sunCoreMat = new THREE.MeshBasicMaterial({ color: 0xfef9c3, fog: false });
  const sunCore = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), sunCoreMat);
  const sunHaloMat = new THREE.MeshBasicMaterial({
    color: 0xfde047,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    fog: false,
  });
  const sunHalo = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), sunHaloMat);
  sunHalo.position.z = -0.2;
  sunGroup.add(sunCore, sunHalo);
  group.add(sunGroup);

  const moonGroup = new THREE.Group();
  moonGroup.userData.isMapHidden = true;
  moonGroup.position.set(-105, -48, 95);
  moonGroup.lookAt(0, 0, 0);
  const moonCoreMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, fog: false });
  const moonCore = new THREE.Mesh(new THREE.PlaneGeometry(15, 15), moonCoreMat);
  const moonHaloMat = new THREE.MeshBasicMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    fog: false,
  });
  const moonHalo = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), moonHaloMat);
  moonHalo.position.z = -0.2;
  moonGroup.add(moonCore, moonHalo);
  moonGroup.visible = false;
  group.add(moonGroup);

  const starCount = 220;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = ((i * 137.5) % 360) * (Math.PI / 180);
    const phi = 0.22 + ((i * 29) % 100) / 100 * 1.18;
    const rad = 215;
    starPos[i * 3 + 0] = Math.cos(phi) * Math.cos(theta) * rad;
    starPos[i * 3 + 1] = Math.sin(phi) * rad + 12;
    starPos[i * 3 + 2] = Math.cos(phi) * Math.sin(theta) * rad;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xf8fafc,
    size: 1.5,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: false,
  });
  const starPoints = new THREE.Points(starGeo, starMat);
  starPoints.userData.isMapHidden = true;
  group.add(starPoints);
  disposables.push(sunCoreMat, sunHaloMat, moonCoreMat, moonHaloMat, starGeo, starMat);

  // 2. Cobblestone Village Well inside Desa Sapaan (-6.5, 111.5)
  const wellY = getArchipelagoGroundY(-6.5, 111.5);
  const well = createCobblestoneWell(palette, -6.5, 111.5);
  well.position.y = wellY;
  well.userData.villageId = 'village_well';
  group.add(well);
  clickables.push(well);
  obstacles.push({ x: -6.5, z: 111.5, halfW: 1.55, halfD: 1.55 });
  interactables.push({
    id: 'village_well',
    x: -6.5,
    z: 111.5,
    radius: 3.4,
    message: 'Sumur Batu Desa Sapaan: Warga berkumpul di sini mengisi air sebelum berangkat bekerja!',
    mesh: well,
  });

  // 3. Irrigated Wheat Farm + Hay Bales + Beehives on Desa Sapaan meadow (x: 4.5, z: 134.0)
  const farmGroup = new THREE.Group();
  const farmCx = 4.5;
  const farmCz = 134.0;
  const farmY = getArchipelagoGroundY(farmCx, farmCz);
  const farmlandMat = palette.getPixelMat('farmland');
  const hayMat = palette.getPixelMat('hay');
  const woodFenceMat = palette.getPixelMat('oak_plank');

  const bedLeft = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 5.4), farmlandMat);
  bedLeft.position.set(farmCx - 1.9, farmY + 0.07, farmCz);
  bedLeft.receiveShadow = true;
  const bedRight = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 5.4), farmlandMat);
  bedRight.position.set(farmCx + 1.9, farmY + 0.07, farmCz);
  bedRight.receiveShadow = true;
  const canal = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 5.4), palette.waterMat);
  canal.position.set(farmCx, farmY + 0.06, farmCz);
  farmGroup.add(bedLeft, bedRight, canal);

  const bale = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.95), hayMat);
  bale.position.set(farmCx + 3.6, farmY + 0.48, farmCz - 1.8);
  farmGroup.add(bale);

  const hivePost = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.35, 0.22), woodFenceMat);
  hivePost.position.set(farmCx - 3.6, farmY + 0.68, farmCz - 1.8);
  const hiveBox = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.82, 0.82), palette.getMat(0xf59e0b, 'matte'));
  hiveBox.position.set(farmCx - 3.6, farmY + 1.62, farmCz - 1.8);
  farmGroup.add(hivePost, hiveBox);
  mergeStaticGroupMeshes(farmGroup, disposables);

  // Instanced Wheat Crops (24 stalks swaying in wind)
  const wheatGeo = new THREE.BoxGeometry(0.42, 0.85, 0.42);
  wheatGeo.translate(0, 0.425, 0);
  const wheatMat = makeWindMaterial(
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.88 }),
    { minY: 0.04, amp: 0.18, speed: 2.35, cacheKey: 'voxel-wheat-wind' },
  );
  const wheatCount = 24;
  const wheatMesh = new THREE.InstancedMesh(wheatGeo, wheatMat, wheatCount);
  const dummy = new THREE.Object3D();
  const cColor = new THREE.Color();
  let wi = 0;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      const wx = col < 2 ? farmCx - 2.5 + col * 1.15 : farmCx + 1.35 + (col - 2) * 1.15;
      const wz = farmCz - 2.2 + row * 0.88;
      const s = 0.82 + ((row + col) % 3) * 0.14;
      dummy.position.set(wx, farmY + 0.14, wz);
      dummy.rotation.y = ((row * 3 + col) % 4) * 0.4;
      dummy.scale.set(1, s, 1);
      dummy.updateMatrix();
      wheatMesh.setMatrixAt(wi, dummy.matrix);
      cColor.setHex((row + col) % 3 === 0 ? 0xfacc15 : (row + col) % 3 === 1 ? 0x84cc16 : 0xeab308);
      wheatMesh.setColorAt(wi, cColor);
      wi++;
    }
  }
  wheatMesh.instanceMatrix.needsUpdate = true;
  if (wheatMesh.instanceColor) wheatMesh.instanceColor.needsUpdate = true;
  wheatMesh.computeBoundingSphere();
  farmGroup.add(wheatMesh);
  disposables.push(wheatGeo, wheatMat);
  group.add(farmGroup);
  obstacles.push({ x: farmCx, z: farmCz, halfW: 3.3, halfD: 2.7 });

  // Outdoor Furnace & Crafting Bench beside Desa Sapaan Rumah 2 (-12.8, 110.5)
  const benchY = getArchipelagoGroundY(-12.8, 110.5);
  const furnace = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), palette.getPixelMat('furnace'));
  furnace.position.set(-12.8, benchY + 0.5, 110.0);
  const craftBench = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), palette.getPixelMat('crafting'));
  craftBench.position.set(-12.8, benchY + 0.5, 111.1);
  group.add(furnace, craftBench);
  obstacles.push({ x: -12.8, z: 110.55, halfW: 0.65, halfD: 1.25 });

  // Island Lantern Posts along Desa Sapaan, Central Hub, & outer island plazas
  const lanternCoords: Array<[number, number]> = [
    [-4.5, 128.0],
    [4.5, 122.0],
    [-15.5, 65.0],
    [-6.0, 96.0],
    [-15.0, -1.0],
    [2.5, 1.5],
    [-58.5, 34.5], // bridge approach lantern
    [-81.5, 42.5], // Pasar Rasa East plaza lantern
    [-113.5, 58.0], // Pasar Rasa West plaza lantern
    [85.5, 44.5],
    [134.5, 43.0],
    [-114.5, -92.5],
    [-125.0, -108.0],
    [-114.0, -108.0],
    [102.0, -68.0],
    [115.0, -71.0],
    [128.0, -80.0],
    [146.0, -98.0],
    [170.0, -54.0],
    [1.5, -168.5],
    [14.5, -172.0],
    [18.5, -181.5],
    [-10.0, -122.0],
  ];
  lanternCoords.forEach(([lx, lz]) => {
    const post = createLanternPost(palette, lx, lz);
    post.position.y = getArchipelagoGroundY(lx, lz);
    group.add(post);
    obstacles.push({ x: lx, z: lz, halfW: 0.45, halfD: 0.45 });
  });

  // 4. All 14 Remaining Diverse World Citizens (completing all 20 NPCs across every biome!)
  // Outdoor Blacksmith Iron Anvil in Central Hub (-18.5, -7.5)
  const anvilGroup = new THREE.Group();
  const anvilY = getArchipelagoGroundY(-18.5, -7.5);
  const ironAnvilMat = palette.getMat(0x334155, 'metal');
  const anvilBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.32, 0.8), ironAnvilMat);
  anvilBase.position.y = 0.16;
  const anvilWaist = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.38, 0.46), ironAnvilMat);
  anvilWaist.position.y = 0.5;
  const anvilTop = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.34, 0.72), ironAnvilMat);
  anvilTop.position.y = 0.84;
  anvilTop.castShadow = true;
  anvilGroup.add(anvilBase, anvilWaist, anvilTop);
  anvilGroup.position.set(-18.5, anvilY, -7.5);
  group.add(anvilGroup);
  obstacles.push({ x: -18.5, z: -7.5, halfW: 0.85, halfD: 0.65 });

  // Outdoor Satay Grill Cart in Pasar Rasa (-85.2, 51.0)
  const grillGroup = new THREE.Group();
  const grillY = getArchipelagoGroundY(-85.2, 51.0);
  const grillLegMat = palette.getMat(0x475569, 'metal');
  const grillTable = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.88, 1.55), palette.getMat(0x78350f, 'matte'));
  grillTable.position.y = 0.44;
  const grillTray = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.18, 1.42), grillLegMat);
  grillTray.position.y = 0.96;
  const embers = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 1.25), palette.getMat(0xf97316, 'emissive'));
  embers.position.y = 1.06;
  grillGroup.add(grillTable, grillTray, embers);
  grillGroup.position.set(-85.2, grillY, 51.0);
  group.add(grillGroup);
  obstacles.push({ x: -85.2, z: 51.0, halfW: 0.7, halfD: 0.95 });

  const citizenPlans: Array<{
    archetype: NpcArchetypeId;
    waypoints: Array<[number, number]>;
    homeDoor: [number, number];
    speed: number;
    variant?: NpcAppearanceVariant;
    label?: string;
    dialogue?: string;
  }> = [
    // =========================================================================
    // 1. DESA SAPAAN (10 Citizens: Kids, Youth, Adults, Elderly)
    // =========================================================================
    { archetype: 'village_kid', waypoints: [[-2.5, 118.0], [-5.0, 115.0], [-8.0, 118.0], [-5.0, 121.0]], homeDoor: [-14.0, 118.0], speed: 2.35 },
    { archetype: 'schoolgirl', waypoints: [[-8.5, 123.0], [-3.5, 124.5], [-2.0, 129.0], [-7.5, 129.0]], homeDoor: [-14.0, 118.0], speed: 2.15 },
    { archetype: 'farmer_boy', waypoints: [[0.2, 130.5], [0.2, 137.8], [8.8, 137.8], [8.8, 130.5]], homeDoor: [-13.5, 90.0], speed: 1.9 },
    { archetype: 'florist_girl', waypoints: [[9.0, 114.5], [14.5, 116.5], [14.5, 121.5], [9.0, 121.5]], homeDoor: [11.5, 109.0], speed: 1.85 },
    {
      archetype: 'village_kid',
      waypoints: [[-7.0, 102.0], [0.0, 102.0], [0.0, 106.5], [-7.0, 106.5]],
      homeDoor: [-13.5, 90.0],
      speed: 2.4,
      variant: { shirtHex: 0xeab308, accentHex: 0x2563eb, pantsHex: 0x1e293b },
      label: 'Bocah Desa Dani (Anak-anak · Laki-laki)',
      dialogue: 'Main petak umpet di halaman utara seru sekali! Ayo ucapkan "Good afternoon!"',
    },
    {
      archetype: 'schoolgirl',
      waypoints: [[-11.0, 103.5], [-5.5, 103.5], [-5.5, 107.5], [-11.0, 107.5]],
      homeDoor: [-14.0, 118.0],
      speed: 2.1,
      variant: { hairHex: 0x14b8a6, pantsHex: 0x1e3a8a, accentHex: 0x0ea5e9 },
      label: 'Siswi Desa Sinta (Anak-anak · Perempuan Berhijab)',
      dialogue: 'Aku mencatat semua sapaan baru di buku catatanku setiap pagi!',
    },
    {
      archetype: 'farmer_boy',
      waypoints: [[9.8, 128.0], [15.5, 128.0], [15.5, 134.5], [9.8, 134.5]],
      homeDoor: [11.5, 109.0],
      speed: 1.85,
      variant: { shirtHex: 0x22c55e, pantsHex: 0x1e40af },
      label: 'Pemuda Tani Bagas (Muda · Laki-laki)',
      dialogue: 'Gandum emas kami butuh air bersih dan semangat belajar yang tekun!',
    },
    {
      archetype: 'florist_girl',
      waypoints: [[-16.0, 114.0], [-11.0, 114.0], [-11.0, 120.0], [-16.0, 120.0]],
      homeDoor: [-14.0, 118.0],
      speed: 1.8,
      variant: { hairHex: 0xd97706, pantsHex: 0x7c3aed, shirtHex: 0xfef9c3 },
      label: 'Perangkai Bunga Rina (Muda · Perempuan Non-Hijab)',
      dialogue: 'Bunga aster ungu di kebun barat harum sekali saat pagi cerah!',
    },
    {
      archetype: 'grandma_herbalist',
      waypoints: [[-9.5, 131.5], [-2.0, 131.5], [-2.0, 136.0], [-9.5, 136.0]],
      homeDoor: [-14.0, 118.0],
      speed: 1.4,
      variant: { hairHex: 0xfef3c7, shirtHex: 0x4d7c0f, pantsHex: 0x365314 },
      label: 'Nenek Jamu Desa (Tua · Perempuan Berhijab)',
      dialogue: 'Minumlah ramuan daun hangat sebelum menyeberang jembatan menuju Citadel, Cucu!',
    },
    {
      archetype: 'village_elder',
      waypoints: [[-10.0, 95.5], [-3.5, 95.5], [-3.5, 99.5], [-10.0, 99.5]],
      homeDoor: [-13.5, 90.0],
      speed: 1.45,
      variant: { shirtHex: 0x78350f, pantsHex: 0x451a03 },
      label: 'Sesepuh Gerbang Utara (Tua · Laki-laki)',
      dialogue: 'Setiap pahlawan besar selalu mulai dari sopan santun dan sapaan sederhana.',
    },

    // =========================================================================
    // 2. PASAR RASA (10 Citizens: Vendors, Chefs, Merchants, Shoppers)
    // =========================================================================
    { archetype: 'street_vendor', waypoints: [[-87.0, 48.0], [-92.5, 48.0], [-92.5, 55.0], [-87.0, 54.0]], homeDoor: [-89.5, 45.0], speed: 1.85 },
    { archetype: 'spice_merchant', waypoints: [[-113.0, 44.0], [-117.5, 50.0], [-114.0, 58.5], [-111.0, 51.0]], homeDoor: [-110.0, 46.0], speed: 1.75 },
    {
      archetype: 'pastry_chef',
      waypoints: [[-97.0, 42.0], [-91.0, 42.0], [-91.0, 45.5], [-97.0, 45.5]],
      homeDoor: [-89.5, 45.0],
      speed: 1.8,
      variant: { hairHex: 0x2dd4bf, shirtHex: 0x0f766e, accentHex: 0xf43f5e },
      label: 'Pembuat Kue Tari (Muda · Perempuan Berhijab)',
      dialogue: 'Kue bolu dan roti panggang manis ini cocok menemani latihan kata makanan!',
    },
    {
      archetype: 'street_vendor',
      waypoints: [[-105.0, 60.0], [-98.0, 60.0], [-98.0, 64.0], [-105.0, 64.0]],
      homeDoor: [-89.5, 45.0],
      speed: 1.85,
      variant: { shirtHex: 0x0d9488, pantsHex: 0x1e293b },
      label: 'Penjual Minuman Segar (Muda · Laki-laki)',
      dialogue: 'Es jeruk manis, air kelapa, dan teh hangat siap menyegarkan para pejuang kata!',
    },
    {
      archetype: 'spice_merchant',
      waypoints: [[-115.0, 60.5], [-107.0, 60.5], [-107.0, 64.5], [-115.0, 64.5]],
      homeDoor: [-110.0, 46.0],
      speed: 1.7,
      variant: { hairHex: 0x9f1239, shirtHex: 0xb45309, accentHex: 0xf59e0b },
      label: 'Saudagar Bumbu Wati (Dewasa · Perempuan Berhijab)',
      dialogue: 'Tahu bedanya Sweet, Spicy, Sour, dan Salty? Coba cicipi rempah Pasar Rasa!',
    },
    {
      archetype: 'farmer_boy',
      waypoints: [[-83.0, 39.0], [-88.5, 39.0], [-88.5, 44.0], [-83.0, 44.0]],
      homeDoor: [-89.5, 45.0],
      speed: 1.9,
      variant: { shirtHex: 0xd97706, pantsHex: 0x334155 },
      label: 'Pengantar Sayur Pasar (Muda · Laki-laki)',
      dialogue: 'Baru mengantar gandum dan buah segar dari ladang untuk dapur Koki Mimi!',
    },
    {
      archetype: 'florist_girl',
      waypoints: [[-95.0, 35.0], [-89.0, 35.0], [-89.0, 39.5], [-95.0, 39.5]],
      homeDoor: [-89.5, 45.0],
      speed: 1.8,
      variant: { pantsHex: 0xdb2777, shirtHex: 0xfdf2f8 },
      label: 'Penjual Bunga Meja (Muda · Perempuan Non-Hijab)',
      dialogue: 'Bunga hias meja membuat gerai Pasar Rasa tampak cerah dan wangi!',
    },
    {
      archetype: 'schoolgirl',
      waypoints: [[-112.0, 37.0], [-106.0, 37.0], [-106.0, 41.0], [-112.0, 41.0]],
      homeDoor: [-110.0, 46.0],
      speed: 2.15,
      variant: { hairHex: 0x38bdf8, pantsHex: 0x1d4ed8 },
      label: 'Pembeli Cilik Naya (Anak-anak · Perempuan Berhijab)',
      dialogue: 'Ibu menyuruhku beli roti dan buah! Untung aku sudah hafal namanya dalam Bahasa Inggris.',
    },
    {
      archetype: 'village_kid',
      waypoints: [[-91.5, 58.0], [-86.0, 58.0], [-86.0, 62.0], [-91.5, 62.0]],
      homeDoor: [-89.5, 45.0],
      speed: 2.3,
      variant: { shirtHex: 0x10b981, accentHex: 0xf59e0b },
      label: 'Bocah Jajan Bimo (Anak-anak · Laki-laki)',
      dialogue: 'Bau sate bakarnya bikin lapar terus! Cepat kalahkan Lendir Liar ya Kak!',
    },
    {
      archetype: 'bus_driver',
      waypoints: [[-79.0, 42.0], [-83.5, 42.0], [-83.5, 48.5], [-79.0, 48.5]],
      homeDoor: [-89.5, 45.0],
      speed: 1.8,
      variant: { shirtHex: 0xe2e8f0, pantsHex: 0x1e293b },
      label: 'Kurir Logistik Pasar (Dewasa · Laki-laki)',
      dialogue: 'Kargo buah dan rempah dari pelabuhan tiba tepat waktu di gerbang Pasar Rasa!',
    },

    // =========================================================================
    // 3. HUTAN SATWA (10 Citizens: Keepers, Herbalists, Rangers, Visitors)
    // =========================================================================
    { archetype: 'zoo_keeper', waypoints: [[94.0, 49.0], [104.0, 49.0], [104.0, 52.5], [94.0, 52.5]], homeDoor: [83.5, 36.5], speed: 1.9 },
    { archetype: 'grandma_herbalist', waypoints: [[114.0, 46.5], [123.0, 46.5], [123.0, 51.5], [114.0, 51.5]], homeDoor: [83.5, 36.5], speed: 1.45 },
    {
      archetype: 'ranger_guide',
      waypoints: [[126.0, 44.0], [134.0, 44.0], [134.0, 50.0], [126.0, 50.0]],
      homeDoor: [83.5, 36.5],
      speed: 1.9,
      variant: { shirtHex: 0x365314, pantsHex: 0x713f12 },
      label: 'Ranger Patroli Harimau (Dewasa · Laki-laki)',
      dialogue: 'Pagar kandang macan dan beruang aman terkendali. Hati-hati saat malam di rimba!',
    },
    {
      archetype: 'zoo_keeper',
      waypoints: [[109.0, 74.0], [119.0, 74.0], [119.0, 78.0], [109.0, 78.0]],
      homeDoor: [83.5, 36.5],
      speed: 1.85,
      variant: { hairHex: 0xd97706, shirtHex: 0x65a30d, pantsHex: 0x854d0e },
      label: 'Perawat Panda Maya (Dewasa · Perempuan Non-Hijab)',
      dialogue: 'Para panda sedang asyik mengunyah bambu segar di taman sebelah!',
    },
    {
      archetype: 'florist_girl',
      waypoints: [[109.0, 58.0], [117.0, 58.0], [117.0, 65.0], [109.0, 65.0]],
      homeDoor: [83.5, 36.5],
      speed: 1.75,
      variant: { pantsHex: 0x15803d, shirtHex: 0xfef3c7 },
      label: 'Botanis Rimba Tia (Muda · Perempuan Non-Hijab)',
      dialogue: 'Banyak pakis liar dan anggrek langka tumbuh subur di Hutan Satwa!',
    },
    {
      archetype: 'village_kid',
      waypoints: [[98.0, 51.0], [106.5, 51.0], [106.5, 53.8], [98.0, 53.8]],
      homeDoor: [83.5, 36.5],
      speed: 2.3,
      variant: { shirtHex: 0xea580c, pantsHex: 0x334155 },
      label: 'Pengunjung Cilik Aldo (Anak-anak · Laki-laki)',
      dialogue: 'Wah lihat leher jerapah itu tinggi sekali! Giraffe dalam Bahasa Inggris!',
    },
    {
      archetype: 'schoolgirl',
      waypoints: [[88.0, 48.0], [95.0, 48.0], [95.0, 53.0], [88.0, 53.0]],
      homeDoor: [83.5, 36.5],
      speed: 2.1,
      variant: { hairHex: 0xfb7185, pantsHex: 0x0f766e },
      label: 'Siswi Wisata Kiki (Anak-anak · Perempuan Berhijab)',
      dialogue: 'Kami sedang karyawisata mengenal nama-nama satwa liar!',
    },
    {
      archetype: 'school_teacher',
      waypoints: [[90.0, 44.5], [97.5, 44.5], [97.5, 47.5], [90.0, 47.5]],
      homeDoor: [83.5, 36.5],
      speed: 1.65,
      variant: { hairHex: 0x3f6212, shirtHex: 0x1e293b, accentHex: 0x16a34a },
      label: 'Guru Pendamping Rimba (Dewasa · Perempuan Berhijab)',
      dialogue: 'Anak-anak bersemangat sekali mempelajari kata Tiger, Zebra, dan Elephant!',
    },
    {
      archetype: 'farmer_boy',
      waypoints: [[121.0, 54.0], [129.0, 54.0], [129.0, 62.0], [121.0, 62.0]],
      homeDoor: [83.5, 36.5],
      speed: 1.85,
      variant: { shirtHex: 0x65a30d, pantsHex: 0x3f3f46 },
      label: 'Pemasok Pakan Satwa (Muda · Laki-laki)',
      dialogue: 'Rumput segar dan buah hutan siap diantarkan untuk makan siang para hewan.',
    },
    {
      archetype: 'village_elder',
      waypoints: [[84.0, 39.0], [90.0, 39.0], [90.0, 43.0], [84.0, 43.0]],
      homeDoor: [83.5, 36.5],
      speed: 1.4,
      variant: { shirtHex: 0xe7e5e4, pantsHex: 0x78716c },
      label: 'Sesepuh Suaka Rimba (Tua · Laki-laki)',
      dialogue: 'Hutan Satwa telah berdiri puluhan tahun menjaga harmoni manusia dan alam.',
    },

    // =========================================================================
    // 4. GERBANG KOTA (10 Citizens: Teachers, Students, Officers, Commuters)
    // =========================================================================
    { archetype: 'school_teacher', waypoints: [[-125.0, -113.5], [-114.0, -113.5], [-114.0, -108.5], [-125.0, -108.5]], homeDoor: [-121.0, -115.0], speed: 1.7 },
    { archetype: 'bus_driver', waypoints: [[-100.0, -83.0], [-108.0, -83.0], [-108.0, -88.0], [-100.0, -88.0]], homeDoor: [-102.0, -95.5], speed: 1.95 },
    {
      archetype: 'schoolgirl',
      waypoints: [[-111.0, -113.0], [-103.0, -113.0], [-103.0, -108.0], [-111.0, -108.0]],
      homeDoor: [-121.0, -115.0],
      speed: 2.15,
      variant: { hairHex: 0x9f1239, pantsHex: 0x1e293b },
      label: 'Siswi Sekolah Bata Dewi (Anak-anak · Perempuan Berhijab)',
      dialogue: 'Terima kasih sudah membebaskan Gerbang Kota! Sekolah jadi ramai lagi!',
    },
    {
      archetype: 'village_kid',
      waypoints: [[-128.0, -116.0], [-122.0, -116.0], [-122.0, -112.0], [-128.0, -112.0]],
      homeDoor: [-121.0, -115.0],
      speed: 2.35,
      variant: { shirtHex: 0x2563eb, accentHex: 0xfacc15 },
      label: 'Murid Sekolah Kota Arif (Anak-anak · Laki-laki)',
      dialogue: 'Bel sekolah sebentar lagi berbunyi! Jangan sampai terlambat masuk kelas!',
    },
    {
      archetype: 'city_policeman',
      waypoints: [[-114.0, -87.0], [-107.0, -87.0], [-107.0, -82.0], [-114.0, -82.0]],
      homeDoor: [-102.0, -95.5],
      speed: 1.85,
      variant: { shirtHex: 0x0284c7, pantsHex: 0x0f172a },
      label: 'Petugas Lalu Lintas Kota (Dewasa · Laki-laki)',
      dialogue: 'Jalur layang kota bersih dari kabut! Tetap patuhi rambu dan jaga ketertiban.',
    },
    {
      archetype: 'street_vendor',
      waypoints: [[-128.0, -98.0], [-122.0, -98.0], [-122.0, -94.0], [-128.0, -94.0]],
      homeDoor: [-102.0, -95.5],
      speed: 1.85,
      variant: { shirtHex: 0xb91c1c, pantsHex: 0x334155 },
      label: 'Pedagang Kaki Lima Stasiun (Muda · Laki-laki)',
      dialogue: 'Sate hangat dan jajanan cepat untuk para pekerja kantoran Gerbang Kota!',
    },
    {
      archetype: 'clockmaker',
      waypoints: [[-97.0, -99.0], [-91.0, -99.0], [-91.0, -94.0], [-97.0, -94.0]],
      homeDoor: [-102.0, -95.5],
      speed: 1.55,
      variant: { accentHex: 0x475569, pantsHex: 0x1e293b },
      label: 'Tukang Reparasi Arloji Kota (Tua · Laki-laki)',
      dialogue: 'Warga kota sangat menghargai ketepatan waktu saat berangkat kerja.',
    },
    {
      archetype: 'spice_merchant',
      waypoints: [[-136.0, -91.0], [-129.0, -91.0], [-129.0, -85.0], [-136.0, -85.0]],
      homeDoor: [-102.0, -95.5],
      speed: 1.7,
      variant: { hairHex: 0x059669, shirtHex: 0x047857, accentHex: 0xfbbf24 },
      label: 'Penjaga Kios Trotoar (Dewasa · Perempuan Berhijab)',
      dialogue: 'Dari terowongan barat sampai terminal timur, seluruh distrik kini lancar!',
    },
    {
      archetype: 'pastry_chef',
      waypoints: [[-100.0, -98.0], [-94.0, -98.0], [-94.0, -94.5], [-100.0, -94.5]],
      homeDoor: [-102.0, -95.5],
      speed: 1.75,
      variant: { hairHex: 0xfb923c, shirtHex: 0x9a3412, accentHex: 0xfef3c7 },
      label: 'Koki Bekal Sekolah (Muda · Perempuan Berhijab)',
      dialogue: 'Roti lapis hangat siap untuk anak-anak Sekolah Bata Merah!',
    },
    {
      archetype: 'ielts_dean',
      waypoints: [[-104.0, -118.0], [-97.0, -118.0], [-97.0, -112.0], [-104.0, -112.0]],
      homeDoor: [-121.0, -115.0],
      speed: 1.5,
      variant: { shirtHex: 0x3730a3, hairHex: 0x312e81 },
      label: 'Kepala Sekolah Gerbang Kota (Tua · Perempuan Berhijab)',
      dialogue: 'Pendidikan bahasa di kota ini semakin maju sejak kabut kelabu tersibak!',
    },

    // =========================================================================
    // 5. MENARA WAKTU (8 Citizens: Clocksmiths, Scholars, Mechanics, Observers)
    // =========================================================================
    {
      archetype: 'clockmaker',
      waypoints: [[115.0, -83.0], [121.0, -83.0], [121.0, -78.0], [115.0, -78.0]],
      homeDoor: [117.5, -80.5],
      speed: 1.6,
      variant: { accentHex: 0x64748b, pantsHex: 0x334155 },
      label: 'Magang Pembuat Jam (Tua · Laki-laki)',
      dialogue: 'Kami menyetel jarum jam paviliun agar selaras dengan Menara Utama!',
    },
    {
      archetype: 'school_teacher',
      waypoints: [[96.0, -74.0], [105.0, -74.0], [105.0, -68.0], [96.0, -68.0]],
      homeDoor: [117.5, -80.5],
      speed: 1.7,
      variant: { hairHex: 0x7e22ce, shirtHex: 0x3b0764 },
      label: 'Pengajar Sejarah Waktu (Dewasa · Perempuan Berhijab)',
      dialogue: 'Ingat cara menyebut waktu: Seven o’clock, Half past eight, Quarter to ten!',
    },
    {
      archetype: 'crystal_scholar',
      waypoints: [[122.0, -74.0], [128.0, -74.0], [128.0, -69.0], [122.0, -69.0]],
      homeDoor: [117.5, -80.5],
      speed: 1.75,
      variant: { shirtHex: 0x0f766e, hairHex: 0x14b8a6 },
      label: 'Peneliti Bintang Menara (Dewasa · Perempuan Berhijab)',
      dialogue: 'Bayangan jarum matahari tepat menunjuk jalur jembatan cahaya di timur laut.',
    },
    {
      archetype: 'mine_engineer',
      waypoints: [[131.0, -67.5], [142.0, -67.5], [142.0, -64.5], [131.0, -64.5]],
      homeDoor: [117.5, -80.5],
      speed: 1.8,
      variant: { shirtHex: 0x475569, accentHex: 0xeab308 },
      label: 'Teknisi Roda Gigi (Dewasa · Laki-laki)',
      dialogue: 'Roda gigi emas menara jam sudah kuolesi minyak agar berputar mulus!',
    },
    {
      archetype: 'temple_guardian',
      waypoints: [[148.0, -98.0], [159.0, -98.0], [159.0, -95.0], [148.0, -95.0]],
      homeDoor: [152.0, -97.0],
      speed: 1.55,
      label: 'Penjaga Teras Puncak Jam (Tua · Laki-laki)',
      dialogue: 'Dari teras atas Menara Waktu, Istana IELTS tampak megah di atas awan!',
    },
    {
      archetype: 'ielts_dean',
      waypoints: [[147.0, -102.0], [147.0, -96.0], [151.0, -96.0], [151.0, -102.0]],
      homeDoor: [152.0, -97.0],
      speed: 1.45,
      variant: { shirtHex: 0x881337, hairHex: 0x4c0519 },
      label: 'Pengamat Istana Langit (Tua · Perempuan Berhijab)',
      dialogue: 'Saat keenam mahkota utuh, Jembatan Cahaya menuju Istana IELTS dapat dilalui!',
    },
    {
      archetype: 'ranger_guide',
      waypoints: [[170.0, -66.0], [180.0, -66.0], [180.0, -56.0], [170.0, -56.0]],
      homeDoor: [172.0, -58.0],
      speed: 1.85,
      variant: { shirtHex: 0x047857, pantsHex: 0x78350f },
      label: 'Pengamat Jembatan Cahaya (Dewasa · Laki-laki)',
      dialogue: 'Ujung jembatan cahaya masih terputus oleh perisai energi "COMING SOON"!',
    },
    {
      archetype: 'village_kid',
      waypoints: [[108.0, -75.0], [116.0, -75.0], [116.0, -70.0], [108.0, -70.0]],
      homeDoor: [117.5, -80.5],
      speed: 2.3,
      variant: { shirtHex: 0x0284c7, accentHex: 0xfef08a },
      label: 'Pengagum Jam Rafa (Anak-anak · Laki-laki)',
      dialogue: 'Lonceng menara jam terdengar sampai ke seberang laut saat siang hari!',
    },

    // =========================================================================
    // 6. GUA PORTAL (8 Citizens: Quarry Engineers, Sentries, Crystal Scholars)
    // =========================================================================
    { archetype: 'mine_engineer', waypoints: [[-16.0, -178.0], [-11.0, -178.0], [-11.0, -171.0], [-16.0, -171.0]], homeDoor: [-1.0, -172.0], speed: 1.8 },
    {
      archetype: 'mine_engineer',
      waypoints: [[-22.0, -166.0], [-14.0, -166.0], [-14.0, -158.0], [-22.0, -158.0]],
      homeDoor: [-1.0, -172.0],
      speed: 1.8,
      variant: { shirtHex: 0x475569, pantsHex: 0x1e293b, accentHex: 0xfacc15 },
      label: 'Mandor Tambang Selatan (Dewasa · Laki-laki)',
      dialogue: 'Batu kristal ungu di ngarai ini beresonansi dengan kekuatan kata tanya!',
    },
    {
      archetype: 'blacksmith',
      waypoints: [[-22.0, -182.0], [-17.0, -182.0], [-17.0, -175.0], [-22.0, -175.0]],
      homeDoor: [-1.0, -172.0],
      speed: 1.7,
      variant: { pantsHex: 0x1c1917, accentHex: 0x9a3412 },
      label: 'Pandai Rel Tambang (Dewasa · Laki-laki)',
      dialogue: 'Rel lori besi di ngarai ini kuperbaiki setiap minggu agar tetap kokoh!',
    },
    {
      archetype: 'crystal_scholar',
      waypoints: [[-4.0, -178.0], [3.0, -178.0], [3.0, -170.0], [-4.0, -170.0]],
      homeDoor: [-1.0, -172.0],
      speed: 1.7,
      variant: { shirtHex: 0x4338ca, hairHex: 0x4f46e5 },
      label: 'Peneliti Prasasti Portal (Dewasa · Perempuan Berhijab)',
      dialogue: 'Who, What, Where, When, Why—kelima kunci itu membuka Portal Agung!',
    },
    {
      archetype: 'temple_guardian',
      waypoints: [[11.0, -183.0], [18.0, -183.0], [18.0, -176.0], [11.0, -176.0]],
      homeDoor: [-1.0, -172.0],
      speed: 1.6,
      variant: { shirtHex: 0x64748b, accentHex: 0x0ea5e9 },
      label: 'Pengawal Gerbang Portal (Tua · Laki-laki)',
      dialogue: 'Portal di puncak ngarai hanya terbuka bagi pemilik 6 Pecahan Mahkota!',
    },
    {
      archetype: 'temple_guardian',
      waypoints: [[12.0, -172.0], [19.0, -172.0], [19.0, -165.0], [12.0, -165.0]],
      homeDoor: [-1.0, -172.0],
      speed: 1.6,
      label: 'Penjaga Teras Ngarai (Tua · Laki-laki)',
      dialogue: 'Lentera kuilku menjaga jalur kristal tetap aman dari bayangan gua.',
    },
    {
      archetype: 'ranger_guide',
      waypoints: [[2.0, -168.0], [10.0, -168.0], [10.0, -163.0], [2.0, -163.0]],
      homeDoor: [-1.0, -172.0],
      speed: 1.9,
      variant: { shirtHex: 0x3f6212, pantsHex: 0x57534e },
      label: 'Pemandu Jalur Ngarai (Dewasa · Laki-laki)',
      dialogue: 'Tebing Ngarai Kristal curam di sisi selatan, tetaplah ikuti jalan setapak!',
    },
    {
      archetype: 'grandma_herbalist',
      waypoints: [[-5.0, -167.0], [1.0, -167.0], [1.0, -163.0], [-5.0, -163.0]],
      homeDoor: [-1.0, -172.0],
      speed: 1.4,
      variant: { hairHex: 0xc084fc, shirtHex: 0x6b21a8 },
      label: 'Tabib Ngarai Kristal (Tua · Perempuan Berhijab)',
      dialogue: 'Lumut gua bercahaya ini bahan ramuan pemulih energi para penjelajah.',
    },

    // =========================================================================
    // 7. CENTRAL HUB / CITADEL RERUNTUHAN (14 Citizens across Plaza, Causeways & Bastions)
    // =========================================================================
    { archetype: 'blacksmith', waypoints: [[-20.2, -10.5], [-16.6, -10.5], [-16.6, -4.8], [-20.2, -4.8]], homeDoor: [-12.5, -2.5], speed: 1.75 },
    { archetype: 'temple_guardian', waypoints: [[-2.0, -11.0], [4.0, -11.0], [4.0, -5.0], [-2.0, -5.0]], homeDoor: [2.0, -12.0], speed: 1.65 },
    { archetype: 'ielts_dean', waypoints: [[-11.0, 1.0], [-4.5, 1.0], [-4.5, 3.5], [-11.0, 3.5]], homeDoor: [-6.0, 2.0], speed: 1.5 },
    {
      archetype: 'city_policeman',
      waypoints: [[-14.5, -3.5], [-8.5, -3.5], [-8.5, 0.5], [-14.5, 0.5]],
      homeDoor: [-12.5, -2.5],
      speed: 1.85,
      variant: { shirtHex: 0x0284c7, pantsHex: 0x1e3a8a },
      label: 'Petugas Patroli Citadel (Dewasa · Laki-laki)',
      dialogue: 'Menjaga keamanan persimpangan 6 pulau agar para pahlawan bebas melintas!',
    },
    {
      archetype: 'street_vendor',
      waypoints: [[-21.5, -2.0], [-16.0, -2.0], [-16.0, 3.5], [-21.5, 3.5]],
      homeDoor: [-12.5, -2.5],
      speed: 1.8,
      variant: { shirtHex: 0x1d4ed8, pantsHex: 0x334155 },
      label: 'Penjual Bekal Citadel (Muda · Laki-laki)',
      dialogue: 'Sate hangat bekal perjalanan jauh melintasi jembatan batu Citadel!',
    },
    {
      archetype: 'pastry_chef',
      waypoints: [[10.0, -12.0], [16.5, -12.0], [16.5, -6.0], [10.0, -6.0]],
      homeDoor: [2.0, -12.0],
      speed: 1.75,
      variant: { hairHex: 0xc084fc, shirtHex: 0x6d28d9, accentHex: 0xf472b6 },
      label: 'Juru Roti Halaman Timur (Muda · Perempuan Berhijab)',
      dialogue: 'Aroma kue manis Citadel menyambut siapa saja yang pulang dari ekspedisi!',
    },
    {
      archetype: 'florist_girl',
      waypoints: [[18.0, -11.0], [25.0, -11.0], [25.0, -5.0], [18.0, -5.0]],
      homeDoor: [2.0, -12.0],
      speed: 1.8,
      variant: { hairHex: 0x5c3a1e, pantsHex: 0x0284c7, shirtHex: 0xf0f9ff },
      label: 'Perangkai Bunga Citadel (Muda · Perempuan Non-Hijab)',
      dialogue: 'Bunga-bunga liar tumbuh indah di sela batu reruntuhan kuno ini!',
    },
    {
      archetype: 'village_elder',
      waypoints: [[-6.5, -12.0], [-1.0, -12.0], [-1.0, -8.5], [-6.5, -8.5]],
      homeDoor: [2.0, -12.0],
      speed: 1.4,
      label: 'Sejarawan Reruntuhan (Tua · Laki-laki)',
      dialogue: 'Citadel Reruntuhan adalah jantung kerajaan sebelum Istana IELTS terangkat ke langit.',
    },
    {
      archetype: 'schoolgirl',
      waypoints: [[-23.5, 6.0], [-19.5, 14.0], [-22.5, 22.0], [-18.5, 12.0]],
      homeDoor: [-12.5, -2.5],
      speed: 2.1,
      variant: { hairHex: 0x0f766e, pantsHex: 0x134e4a },
      label: 'Pelajar Pelintas Jembatan (Anak-anak · Perempuan Berhijab)',
      dialogue: 'Jembatan batu dari Desa Sapaan ke Citadel pemandangan lautnya indah sekali!',
    },
    {
      archetype: 'village_kid',
      waypoints: [[-36.0, -5.0], [-26.0, -5.0], [-26.0, -2.0], [-36.0, -2.0]],
      homeDoor: [-12.5, -2.5],
      speed: 2.35,
      variant: { shirtHex: 0x16a34a, accentHex: 0xef4444 },
      label: 'Pelari Cilik Jembatan Barat (Anak-anak · Laki-laki)',
      dialogue: 'Dari ujung barat Citadel kamu bisa menyeberang ke Pasar Rasa dan Gerbang Kota!',
    },
    {
      archetype: 'ranger_guide',
      waypoints: [[24.0, 2.0], [34.0, 4.0], [34.0, 7.0], [24.0, 4.0]],
      homeDoor: [2.0, -12.0],
      speed: 1.9,
      variant: { shirtHex: 0x15803d, pantsHex: 0x78350f },
      label: 'Pemandu Jalan Timur (Dewasa · Laki-laki)',
      dialogue: 'Jalur timur menghubungkan Citadel menuju Hutan Satwa dan Menara Waktu!',
    },
    {
      archetype: 'crystal_scholar',
      waypoints: [[-38.0, -24.0], [-28.0, -24.0], [-28.0, -18.0], [-38.0, -18.0]],
      homeDoor: [-31.0, -20.0],
      speed: 1.65,
      variant: { shirtHex: 0x7c3aed, hairHex: 0xa855f7 },
      label: 'Cendekiawan Bastion Barat (Dewasa · Perempuan Berhijab)',
      dialogue: 'Menara bastion barat menyimpan catatan rute rahasia ke Gua Portal.',
    },
    {
      archetype: 'mine_engineer',
      waypoints: [[20.0, -28.0], [30.0, -28.0], [30.0, -23.0], [20.0, -23.0]],
      homeDoor: [25.0, -25.0],
      speed: 1.75,
      variant: { shirtHex: 0xb45309, pantsHex: 0x334155 },
      label: 'Insinyur Menara Pengawas (Dewasa · Laki-laki)',
      dialogue: 'Pondasi menara timur dibangun kokoh dari batu granit tua Citadel!',
    },
    {
      archetype: 'temple_guardian',
      waypoints: [[-7.0, -64.5], [-4.5, -56.5], [4.5, -56.5], [7.0, -64.5]],
      homeDoor: [0.0, -56.5],
      speed: 1.55,
      variant: { shirtHex: 0xf59e0b, accentHex: 0x1d4ed8 },
      label: 'Penjaga Puncak Obelisk (Tua · Laki-laki)',
      dialogue: 'Puncak Obelisk Citadel memancarkan sinyal menuju Portal Istana IELTS!',
    },
  ];

  const _spawnScratch = { x: 0, z: 0 };
  citizenPlans.forEach((cp, idx) => {
    const spec = NPC_ARCHETYPES[cp.archetype];
    const v = createVillagerMesh(palette, cp.archetype, cp.variant);
    v.waypoints = cp.waypoints;
    v.homeDoor = cp.homeDoor;
    v.isInsideHouse = false;
    _spawnScratch.x = cp.waypoints[0][0];
    _spawnScratch.z = cp.waypoints[0][1];
    pushOutFromBoxes(_spawnScratch, 0.56, obstacles);
    v.x = _spawnScratch.x;
    v.z = _spawnScratch.z;
    v.wpIdx = 1;
    v.speed = cp.speed;
    v.root.position.set(v.x, getArchipelagoGroundY(v.x, v.z), v.z);
    const id = `villager_${cp.archetype}_${idx}`;
    v.root.userData.villageId = id;
    group.add(v.root);
    clickables.push(v.root);
    const msg = cp.dialogue
      ? `${cp.label ?? spec.displayNameId}: "${cp.dialogue}" [${spec.professionId} · HP ${spec.stats.hp} / ATK ${spec.stats.atk} / NRG ${spec.stats.nrg}]`
      : `${spec.socialMessageId} [${spec.professionId} · HP ${spec.stats.hp} / ATK ${spec.stats.atk} / NRG ${spec.stats.nrg}]`;
    const inter: VillageInteractable = {
      id,
      x: v.x,
      z: v.z,
      radius: 2.8,
      message: msg,
      mesh: v.root,
    };
    v.interactable = inter;
    villagers.push(v);
    interactables.push(inter);
  });

  const llama1 = createLlamaMesh(palette, -92.5, 56.5, -0.7, 0x1d4ed8);
  llama1.root.position.y = getArchipelagoGroundY(-92.5, 56.5);
  const llama2 = createLlamaMesh(palette, -112.5, 48.0, 0.5, 0x0284c7);
  llama2.root.position.y = getArchipelagoGroundY(-112.5, 48.0);
  group.add(llama1.root, llama2.root);
  llamas.push(llama1, llama2);
  obstacles.push(
    { x: -92.5, z: 56.5, halfW: 0.55, halfD: 0.65 },
    { x: -112.5, z: 48.0, halfW: 0.55, halfD: 0.65 },
  );

  // Hutan Satwa Critters: Voxel Fox + 2 Fluffy Sheep grazing peacefully in Zoo Island
  const buildFox = (fx: number, fz: number, yaw: number) => {
    const r = new THREE.Group();
    r.position.set(fx, getArchipelagoGroundY(fx, fz), fz);
    r.rotation.y = yaw;
    const fur = palette.getMat(0xea580c, 'matte');
    const white = palette.getMat(0xf8fafc, 'matte');
    const dark = palette.getMat(0x0f172a, 'gloss');
    const legG = new THREE.BoxGeometry(0.16, 0.34, 0.16);
    [[-0.14, -0.24], [0.14, -0.24], [-0.14, 0.24], [0.14, 0.24]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legG, dark);
      leg.position.set(lx, 0.17, lz);
      r.add(leg);
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.36, 0.72), fur);
    body.position.y = 0.45;
    body.castShadow = true;
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.52), fur);
    tail.position.set(0, 0.48, -0.52);
    const tailTip = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.18), white);
    tailTip.position.set(0, 0.48, -0.78);
    const head = new THREE.Group();
    head.position.set(0, 0.58, 0.38);
    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.38), fur);
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.22), white);
    snout.position.set(0, -0.05, 0.24);
    const earL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.08), dark);
    earL.position.set(-0.14, 0.22, 0);
    const earR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.08), dark);
    earR.position.set(0.14, 0.22, 0);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.05), dark);
    eyeL.position.set(-0.11, 0.05, 0.2);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.05), dark);
    eyeR.position.set(0.11, 0.05, 0.2);
    head.add(skull, snout, earL, earR, eyeL, eyeR);
    r.add(body, tail, tailTip, head);
    group.add(r);
    critters.push({ root: r, head, leftEye: eyeL, rightEye: eyeR, baseX: fx, baseZ: fz, baseYaw: yaw, phase: 0.4 });
  };
  const buildSheep = (sx: number, sz: number, yaw: number, phase: number) => {
    const r = new THREE.Group();
    r.position.set(sx, getArchipelagoGroundY(sx, sz), sz);
    r.rotation.y = yaw;
    const wool = palette.getMat(0xf8fafc, 'matte');
    const face = palette.getMat(0xd6b595, 'matte');
    const dark = palette.getMat(0x1e293b, 'gloss');
    const legG = new THREE.BoxGeometry(0.18, 0.42, 0.18);
    [[-0.2, -0.28], [0.2, -0.28], [-0.2, 0.28], [0.2, 0.28]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legG, face);
      leg.position.set(lx, 0.21, lz);
      r.add(leg);
    });
    const woolBody = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.62, 0.94), wool);
    woolBody.position.y = 0.65;
    woolBody.castShadow = true;
    const head = new THREE.Group();
    head.position.set(0, 0.78, 0.52);
    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.4, 0.42), face);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.18, 0.44), wool);
    crown.position.y = 0.16;
    const eL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.06), dark);
    eL.position.set(-0.12, 0.04, 0.22);
    const eR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.06), dark);
    eR.position.set(0.12, 0.04, 0.22);
    head.add(skull, crown, eL, eR);
    r.add(woolBody, head);
    group.add(r);
    critters.push({ root: r, head, leftEye: eL, rightEye: eR, baseX: sx, baseZ: sz, baseYaw: yaw, phase });
  };
  buildFox(96.0, 46.5, -0.9);
  buildSheep(84.0, 52.5, -2.1, 1.8);
  buildSheep(125.0, 68.0, -0.4, 3.2);

  // 2 Iron Golems: Desa Sapaan flower-holder & Central Hub Guardian
  const golem1 = createIronGolemMesh(palette, true);
  golem1.waypoints = [
    [-4.5, 108.0],
    [4.5, 110.0],
    [4.5, 122.0],
    [-4.5, 122.0],
  ];
  golem1.x = golem1.waypoints[0][0];
  golem1.z = golem1.waypoints[0][1];
  golem1.wpIdx = 1;
  golem1.root.position.set(golem1.x, getArchipelagoGroundY(golem1.x, golem1.z), golem1.z);
  golem1.root.userData.villageId = 'iron_golem_plaza';
  group.add(golem1.root);
  clickables.push(golem1.root);
  golems.push(golem1);
  const golem1Inter: VillageInteractable = {
    id: 'iron_golem_plaza',
    x: golem1.x,
    z: golem1.z,
    radius: 3.4,
    message: 'Iron Golem Desa Sapaan: Penjaga setia desa yang ramah kepada lebah dan warga!',
    mesh: golem1.root,
  };
  golem1.interactable = golem1Inter;
  interactables.push(golem1Inter);

  const golem2 = createIronGolemMesh(palette, false);
  golem2.waypoints = [
    [-15.5, -10.5],
    [-2.5, -10.5],
    [-2.5, -1.0],
    [-15.5, -1.0],
  ];
  golem2.x = golem2.waypoints[0][0];
  golem2.z = golem2.waypoints[0][1];
  golem2.wpIdx = 1;
  golem2.root.position.set(golem2.x, getArchipelagoGroundY(golem2.x, golem2.z), golem2.z);
  golem2.root.userData.villageId = 'iron_golem_market';
  group.add(golem2.root);
  clickables.push(golem2.root);
  golems.push(golem2);

  // 5 Buzzing Voxel Bees around Desa Sapaan Farm & Flowers + Hutan Satwa
  const beeCenters: Array<[number, number]> = [
    [4.5, 134.0],
    [-3.5, 114.0],
    [-11.5, 122.0],
    [106.0, 74.0],
    [-14.5, -4.0],
  ];
  beeCenters.forEach(([bx, bz], idx) => {
    const by = getArchipelagoGroundY(bx, bz) + 2.2;
    const b = createBeeMesh(palette);
    b.root.position.set(bx, by, bz);
    group.add(b.root);
    bees.push({
      root: b.root,
      leftWing: b.leftWing,
      rightWing: b.rightWing,
      centerX: bx,
      centerY: by,
      centerZ: bz,
      radiusX: 1.6 + (idx % 2) * 0.8,
      radiusZ: 1.4 + ((idx + 1) % 2) * 0.7,
      speed: 1.6 + idx * 0.22,
      phase: idx * 1.3,
    });
  });

  // 5. Island Oak & Birch Trees (sampled cleanly onto walkable island hills & sea islets!)
  const oakSpecs: Array<[number, number, number]> = [];
  const birchSpecs: Array<[number, number, number]> = [];
  const islandTreeSpots: Array<[number, number, boolean]> = [
    // Desa Sapaan rolling hills & perimeter (120m Starter Village at cx=0, cz=118)
    [-28.0, 122.0, false],
    [-26.0, 102.0, true],
    [-10.5, 162.0, false],
    [10.5, 166.0, true],
    [22.5, 76.0, false],
    [28.5, 152.0, true],
    // Hutan Satwa lush jungle & highland perimeter (130m Zoo District at cx=120, cz=58)
    [66.5, 46.0, false],
    [73.0, 60.5, true],
    [83.5, 81.5, false],
    [108.0, 114.5, true],
    [150.0, 108.5, false],
    [144.0, 62.5, true],
    // Pasar Rasa palm/spice oasis grove (110m Festival Market at cx=-122, cz=50)
    [-114.0, 26.0, false],
    [-108.0, 86.0, true],
    [-78.0, 68.0, false],
    [-124.0, 80.0, true],
    [-86.0, 16.0, false],
    // Gerbang Kota fortress hills & scenic coastal cliffs
    [-82.0, -102.0, true],
    [-156.0, -124.0, false],
    [-154.0, -68.0, true],
    [-80.0, -68.0, false],
    // Menara Waktu lush terraced hillslopes
    [104.0, -88.0, false],
    [138.0, -56.0, true],
    [166.0, -112.0, false],
    [118.0, -118.0, true],
    [182.0, -88.0, false],
    // Central Citadel Hub ancient grove (courtyard & mossy terraces, clear of 35m x 25m lava caldera)
    [-28.0, -8.0, false],
    [-24.0, -34.0, true],
    [18.0, -18.0, false],
    [36.0, -4.0, true],
    [-38.0, 12.0, false],
    [32.0, 4.0, true],
    // Exploratory Sea Islets + Desa Sapaan, Hutan Satwa & Gerbang Kota NW strait islets
    [-74.0, 126.0, false],
    [62.0, 168.0, true],
    [-172.0, -16.0, false],
    [196.0, 10.0, true],
    [-62.0, -162.0, false],
    [42.0, -88.0, true],
    [-206.0, -148.0, false],
    [-196.0, -168.0, true],
    [-182.0, -180.0, false],
    [-32.0, 50.0, false],
    [-48.0, 70.0, true],
    [-64.0, 82.0, false],
    [76.0, -16.0, false],
    [88.0, -8.0, true],
    [96.0, -24.0, false],
  ];
  islandTreeSpots.forEach(([tx, tz, isBirch], i) => {
    if (!isWalkableArchipelago(tx, tz, 1.8)) return;
    const ty = getArchipelagoGroundY(tx, tz);
    if (ty < 0.75) return;
    if (Math.abs(ty - getArchipelagoGroundY(tx + 1.0, tz)) > 0.78) return;
    const s = 0.92 + (i % 3) * 0.14;
    if (isBirch) birchSpecs.push([tx, tz, s]);
    else oakSpecs.push([tx, tz, s]);
    obstacles.push({ x: tx, z: tz, halfW: 0.65 * s, halfD: 0.65 * s });
  });

  const buildTreeInstancing = (
    specs: Array<[number, number, number]>,
    trunkMat: THREE.Material,
    leafMat: THREE.Material,
    leafTints: number[],
  ) => {
    if (specs.length === 0) return;
    const trunkGeo = new THREE.BoxGeometry(0.86, 2.5, 0.86);
    trunkGeo.translate(0, 1.25, 0);
    const canopyLowGeo = new THREE.BoxGeometry(3.2, 1.45, 3.2);
    canopyLowGeo.translate(0, 3.05, 0);
    const canopyTopGeo = new THREE.BoxGeometry(2.05, 1.15, 2.05);
    canopyTopGeo.translate(0, 4.25, 0);

    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, specs.length);
    const lowCanopy = new THREE.InstancedMesh(canopyLowGeo, leafMat, specs.length);
    const topCanopy = new THREE.InstancedMesh(canopyTopGeo, leafMat, specs.length);
    trunks.castShadow = true;
    lowCanopy.castShadow = true;
    topCanopy.castShadow = true;

    const dObj = new THREE.Object3D();
    const tCol = new THREE.Color();
    specs.forEach(([tx, tz, s], idx) => {
      const ty = getArchipelagoGroundY(tx, tz);
      dObj.position.set(tx, ty, tz);
      dObj.rotation.y = (idx * 1.1) % (Math.PI * 2);
      dObj.scale.set(s, s * (0.94 + (idx % 3) * 0.12), s);
      dObj.updateMatrix();
      trunks.setMatrixAt(idx, dObj.matrix);
      lowCanopy.setMatrixAt(idx, dObj.matrix);
      topCanopy.setMatrixAt(idx, dObj.matrix);
      tCol.setHex(leafTints[idx % leafTints.length]);
      lowCanopy.setColorAt(idx, tCol);
      topCanopy.setColorAt(idx, tCol);
    });
    trunks.instanceMatrix.needsUpdate = true;
    lowCanopy.instanceMatrix.needsUpdate = true;
    topCanopy.instanceMatrix.needsUpdate = true;
    if (lowCanopy.instanceColor) lowCanopy.instanceColor.needsUpdate = true;
    if (topCanopy.instanceColor) topCanopy.instanceColor.needsUpdate = true;
    trunks.computeBoundingSphere();
    lowCanopy.computeBoundingSphere();
    topCanopy.computeBoundingSphere();
    group.add(trunks, lowCanopy, topCanopy);
    disposables.push(trunkGeo, canopyLowGeo, canopyTopGeo);
  };

  const oakLeafMat = makeWindMaterial(palette.getPixelMat('leaves_oak'), {
    minY: 2.3,
    amp: 0.058,
    speed: 1.85,
    cacheKey: 'voxel-tree-wind',
  });
  const birchLeafMat = makeWindMaterial(palette.getPixelMat('leaves_birch'), {
    minY: 2.3,
    amp: 0.062,
    speed: 1.95,
    cacheKey: 'voxel-tree-wind',
  });
  buildTreeInstancing(oakSpecs, palette.getPixelMat('oak_log'), oakLeafMat, [0xffffff, 0xd9f99d, 0xbef264]);
  buildTreeInstancing(birchSpecs, palette.getPixelMat('birch_log'), birchLeafMat, [0xffffff, 0xecfccb, 0xd9f99d]);

  // 6. Instanced Tall Grass Tufts, Poppies & Pebbles placed cleanly across the wide Archipelago
  const grassCenters = [
    OVERWORLD_ANCHORS.zones.desa_sapaan,
    { x: -20, z: 100 },
    { x: 0, z: 146 },
    OVERWORLD_ANCHORS.zones.hutan_satwa,
    { x: 126, z: 62 },
    { x: 108, z: 92 },
    OVERWORLD_ANCHORS.zones.pasar_rasa,
    OVERWORLD_ANCHORS.zones.gerbang_kota,
    OVERWORLD_ANCHORS.zones.menara_waktu,
    OVERWORLD_ANCHORS.hub,
  ];
  const grassSpots: Array<[number, number]> = [];
  for (let i = 0; i < 320; i++) {
    const base = grassCenters[i % grassCenters.length];
    const a = i * 2.39996;
    const r = 3.5 + ((i * 19) % 190) * 0.1;
    const gx = base.x + Math.cos(a) * r;
    const gz = base.z + Math.sin(a) * r;
    if (!isWalkableArchipelago(gx, gz, 2.2)) continue;
    const gs = sampleArchipelagoTerrain(gx, gz);
    if (gs.surface === 'road' || gs.surface === 'stairs' || gs.groundY >= 24.0) continue;
    grassSpots.push([gx, gz]);
  }
  if (grassSpots.length > 0) {
    const bladeGeo = new THREE.BoxGeometry(0.16, 0.56, 0.42);
    bladeGeo.translate(0, 0.28, 0);
    const bladeMat = makeWindMaterial(palette.getMat(0x5ea832, 'matte'), {
      minY: 0.04,
      amp: 0.24,
      speed: 2.85,
      cacheKey: 'voxel-grass-wind',
    });
    const grassMesh = new THREE.InstancedMesh(bladeGeo, bladeMat, grassSpots.length);
    const gd = new THREE.Object3D();
    const gc = new THREE.Color();
    const greens = [0x65a30d, 0x4d7c0f, 0x84cc16, 0x4ade80];
    grassSpots.forEach(([gx, gz], idx) => {
      gd.position.set(gx, getArchipelagoGroundY(gx, gz), gz);
      gd.rotation.y = (idx * 0.9) % Math.PI;
      gd.scale.set(0.85 + (idx % 3) * 0.25, 0.75 + (idx % 4) * 0.18, 0.85 + (idx % 2) * 0.2);
      gd.updateMatrix();
      grassMesh.setMatrixAt(idx, gd.matrix);
      gc.setHex(greens[idx % greens.length]);
      grassMesh.setColorAt(idx, gc);
    });
    grassMesh.instanceMatrix.needsUpdate = true;
    if (grassMesh.instanceColor) grassMesh.instanceColor.needsUpdate = true;
    grassMesh.computeBoundingSphere();
    group.add(grassMesh);
    disposables.push(bladeGeo);
  }

  // Flowers across islands
  const flowerSpots: Array<[number, number]> = [];
  for (let i = 0; i < 128; i++) {
    const base = grassCenters[i % grassCenters.length];
    const a = i * 2.17 + 0.6;
    const r = 4.2 + ((i * 23) % 175) * 0.1;
    const fx = base.x + Math.cos(a) * r;
    const fz = base.z + Math.sin(a) * r;
    if (isWalkableArchipelago(fx, fz, 2.5)) {
      const fs = sampleArchipelagoTerrain(fx, fz);
      if (fs.surface !== 'road' && fs.surface !== 'stairs' && fs.groundY < 24.0) {
        flowerSpots.push([fx, fz]);
      }
    }
  }
  if (flowerSpots.length > 0) {
    const stemGeo = new THREE.BoxGeometry(0.1, 0.34, 0.1);
    stemGeo.translate(0, 0.17, 0);
    const petalGeo = new THREE.BoxGeometry(0.3, 0.22, 0.3);
    petalGeo.translate(0, 0.42, 0);
    const stemWindMat = makeWindMaterial(palette.getMat(0x16a34a, 'matte'), {
      minY: 0.04,
      amp: 0.22,
      speed: 2.65,
      cacheKey: 'voxel-flower-wind',
    });
    const petalWindMat = makeWindMaterial(
      palette.createSurfaceMat({ color: 0xffffff, roughness: 0.78 }),
      {
        minY: 0.04,
        amp: 0.22,
        speed: 2.65,
        cacheKey: 'voxel-flower-wind',
      },
    );
    const stemMesh = new THREE.InstancedMesh(stemGeo, stemWindMat, flowerSpots.length);
    const petalMesh = new THREE.InstancedMesh(petalGeo, petalWindMat, flowerSpots.length);
    const fd = new THREE.Object3D();
    const fc = new THREE.Color();
    const flowerColors = [0xef4444, 0xf8fafc, 0xfacc15, 0xef4444];
    flowerSpots.forEach(([fx, fz], i) => {
      fd.position.set(fx, getArchipelagoGroundY(fx, fz), fz);
      fd.rotation.y = (i * 0.7) % Math.PI;
      fd.scale.setScalar(0.9 + (i % 3) * 0.12);
      fd.updateMatrix();
      stemMesh.setMatrixAt(i, fd.matrix);
      petalMesh.setMatrixAt(i, fd.matrix);
      fc.setHex(flowerColors[i % flowerColors.length]);
      petalMesh.setColorAt(i, fc);
    });
    stemMesh.instanceMatrix.needsUpdate = true;
    petalMesh.instanceMatrix.needsUpdate = true;
    if (petalMesh.instanceColor) petalMesh.instanceColor.needsUpdate = true;
    stemMesh.computeBoundingSphere();
    petalMesh.computeBoundingSphere();
    group.add(stemMesh, petalMesh);
    disposables.push(stemGeo, petalGeo);
  }

  // Drifting Sunlit Breeze Motes over the expanded Archipelago
  const moteCount = 72;
  const moteGeo = new THREE.BoxGeometry(0.16, 0.08, 0.16);
  const moteMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
  });
  const moteMesh = new THREE.InstancedMesh(moteGeo, moteMat, moteCount);
  moteMesh.frustumCulled = false;
  const moteSeeds = new Float32Array(moteCount * 4);
  const mc = new THREE.Color();
  const motePalette = [0xbef264, 0x86efac, 0xfef08a, 0xd9f99d];
  for (let i = 0; i < moteCount; i++) {
    moteSeeds[i * 4 + 0] = ((i * 83) % 390) - 195; // baseX
    moteSeeds[i * 4 + 1] = 3.5 + ((i * 19) % 58) * 0.15; // baseY
    moteSeeds[i * 4 + 2] = ((i * 107) % 390) - 195; // baseZ
    moteSeeds[i * 4 + 3] = i * 0.73; // phase
    mc.setHex(motePalette[i % motePalette.length]);
    moteMesh.setColorAt(i, mc);
  }
  if (moteMesh.instanceColor) moteMesh.instanceColor.needsUpdate = true;
  group.add(moteMesh);
  disposables.push(moteGeo, moteMat);

  return {
    group,
    obstacles,
    interactables,
    clickables,
    villagers,
    golems,
    llamas,
    bees,
    pillagers,
    critters,
    torchesFlame,
    smokePuffs,
    windUniforms,
    sunGroup,
    moonGroup,
    starMat,
    breezeMotes: { mesh: moteMesh, seeds: moteSeeds, count: moteCount },
    disposables,
  };
}

function pushOutFromBoxes(
  pos: { x: number; z: number },
  radius: number,
  boxes: VillageObstacle[],
): boolean {
  let hit = false;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < boxes.length; i++) {
      const obs = boxes[i];
      const cx = THREE.MathUtils.clamp(pos.x, obs.x - obs.halfW, obs.x + obs.halfW);
      const cz = THREE.MathUtils.clamp(pos.z, obs.z - obs.halfD, obs.z + obs.halfD);
      const dx = pos.x - cx;
      const dz = pos.z - cz;
      const distSq = dx * dx + dz * dz;
      if (distSq < radius * radius) {
        hit = true;
        if (distSq > 0.0001) {
          const d = Math.sqrt(distSq);
          pos.x += (dx / d) * (radius - d);
          pos.z += (dz / d) * (radius - d);
        } else {
          const penX = obs.halfW + radius - Math.abs(pos.x - obs.x);
          const penZ = obs.halfD + radius - Math.abs(pos.z - obs.z);
          if (penX < penZ) {
            pos.x += pos.x >= obs.x ? penX : -penX;
          } else {
            pos.z += pos.z >= obs.z ? penZ : -penZ;
          }
        }
      }
    }
  }
  constrainToWalkableArchipelago(pos, radius);
  return hit;
}

function hasAheadObstacle(
  x: number,
  z: number,
  dirX: number,
  dirZ: number,
  probeDist: number,
  radius: number,
  boxes: VillageObstacle[],
): boolean {
  const px = x + dirX * probeDist;
  const pz = z + dirZ * probeDist;
  for (let i = 0; i < boxes.length; i++) {
    const obs = boxes[i];
    const cx = THREE.MathUtils.clamp(px, obs.x - obs.halfW, obs.x + obs.halfW);
    const cz = THREE.MathUtils.clamp(pz, obs.z - obs.halfD, obs.z + obs.halfD);
    const dx = px - cx;
    const dz = pz - cz;
    if (dx * dx + dz * dz < radius * radius) return true;
  }
  return false;
}

const _moveScratch = { x: 0, z: 0 };
const _moteDummy = new THREE.Object3D();
const _torchWorldScratch = new THREE.Vector3();
let _villageAnimCounter = 0;

function getMinViewerDistSq(
  wx: number,
  wz: number,
  heroX?: number,
  heroZ?: number,
  camX?: number,
  camZ?: number,
): number {
  if (heroX === undefined || heroZ === undefined) return 0;
  let minSq = (wx - heroX) * (wx - heroX) + (wz - heroZ) * (wz - heroZ);
  if (camX !== undefined && camZ !== undefined) {
    const cSq = (wx - camX) * (wx - camX) + (wz - camZ) * (wz - camZ);
    if (cSq < minSq) minSq = cSq;
  }
  return minSq;
}

export function updateMinecraftVillage(
  rig: MinecraftVillageRig,
  dt: number,
  elapsed: number,
  extraObstacles: VillageObstacle[] = [],
  dayPhase: 'pagi' | 'siang' | 'sore' | 'malam' = 'siang',
  heroX?: number,
  heroZ?: number,
  lowDetail = false,
  camX?: number,
  camZ?: number,
  allowVisibilityCull = false,
): void {
  _villageAnimCounter = (_villageAnimCounter + 1) & 0xffff;
  const hasHeroDist = heroX !== undefined && heroZ !== undefined;
  const animDistSqLimit = lowDetail ? 40 * 40 : 54 * 54;

  rig.windUniforms.uTime.value = elapsed;

  if (rig.outpostBanner) {
    if (!hasHeroDist || getMinViewerDistSq(148, -92, heroX, heroZ, camX, camZ) <= 95 * 95) {
      rig.outpostBanner.rotation.x = 0.08 + Math.sin(elapsed * 3.1) * 0.18 + Math.sin(elapsed * 5.7) * 0.06;
      rig.outpostBanner.rotation.z = Math.cos(elapsed * 2.4) * 0.09;
    }
  }

  const torchDistSqLimit = lowDetail ? 78 * 78 : 98 * 98;
  const torchNearSqLimit = 36 * 36;
  const torchBaseScale = dayPhase === 'malam' || dayPhase === 'sore' ? 1.28 : 1.0;
  for (let i = 0; i < rig.torchesFlame.length; i++) {
    const fl = rig.torchesFlame[i];
    if (hasHeroDist) {
      let wx = fl.userData._twx as number | undefined;
      let wz = fl.userData._twz as number | undefined;
      if (wx === undefined || wz === undefined) {
        fl.getWorldPosition(_torchWorldScratch);
        wx = _torchWorldScratch.x;
        wz = _torchWorldScratch.z;
        fl.userData._twx = wx;
        fl.userData._twz = wz;
      }
      const dSq = getMinViewerDistSq(wx, wz, heroX, heroZ, camX, camZ);
      if (dSq > torchDistSqLimit) continue;
      if (lowDetail && dSq > torchNearSqLimit && ((i + _villageAnimCounter) & 1) !== 0) continue;
    }
    const flick = (0.9 + Math.sin(elapsed * 14 + i * 2.1) * 0.18 + Math.cos(elapsed * 21 + i) * 0.07) * torchBaseScale;
    fl.scale.set(torchBaseScale, flick, torchBaseScale);
    fl.rotation.z = Math.sin(elapsed * 7.5 + i * 1.3) * 0.14;
  }

  if (
    rig.breezeMotes &&
    rig.breezeMotes.mesh.visible &&
    (!hasHeroDist || getMinViewerDistSq(0, 0, heroX, heroZ, camX, camZ) <= 96 * 96) &&
    (!lowDetail || (_villageAnimCounter & 1) === 0)
  ) {
    const { mesh, seeds, count } = rig.breezeMotes;
    for (let i = 0; i < count; i++) {
      const bx = seeds[i * 4 + 0];
      const by = seeds[i * 4 + 1];
      const bz = seeds[i * 4 + 2];
      const ph = seeds[i * 4 + 3];
      const driftX = ((bx + elapsed * (1.55 + (i % 3) * 0.35) + 42) % 84) - 42;
      const driftZ = ((bz + elapsed * 0.45 + Math.sin(elapsed * 0.9 + ph) * 2.2 + 38) % 76) - 38;
      const flutterY = by + Math.sin(elapsed * 1.8 + ph) * 0.75;
      _moteDummy.position.set(driftX, flutterY, driftZ);
      _moteDummy.rotation.set(elapsed * 1.4 + ph, elapsed * 1.9 + ph, Math.sin(elapsed * 2.2 + ph) * 0.6);
      const s = 0.75 + Math.sin(elapsed * 2.6 + ph) * 0.25;
      _moteDummy.scale.setScalar(s);
      _moteDummy.updateMatrix();
      mesh.setMatrixAt(i, _moteDummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  const shouldGoHome = dayPhase === 'sore' || dayPhase === 'malam';

  // 1. Villagers & Citizens: 60fps nearby animation + 8x distance-throttled movement on outer islands
  for (let i = 0; i < rig.villagers.length; i++) {
    const v = rig.villagers[i];
    const inter = v.interactable;

    if (!shouldGoHome && v.isInsideHouse) {
      // Pagi tiba -> keluar dari pintu rumah kembali beraktivitas
      v.isInsideHouse = false;
      v.x = v.homeDoor[0];
      v.z = v.homeDoor[1];
      v.pauseTimer = 0.15;
      v.stuckTimer = 0;
      v.root.visible = true;
      v.root.position.set(v.x, getArchipelagoGroundY(v.x, v.z), v.z);
    }

    if (shouldGoHome && v.isInsideHouse) {
      if (inter) {
        inter.x = 9999;
        inter.z = 9999;
      }
      continue;
    }

    const distSq = hasHeroDist
      ? (v.x - heroX!) * (v.x - heroX!) + (v.z - heroZ!) * (v.z - heroZ!)
      : 0;
    const minViewerSq = getMinViewerDistSq(v.x, v.z, heroX, heroZ, camX, camZ);
    if (allowVisibilityCull) {
      const wantVis = minViewerSq <= 135 * 135;
      if (v.root.visible !== wantVis) v.root.visible = wantVis;
    } else if (!v.root.visible) {
      v.root.visible = true;
    }
    const isNearAnim = !hasHeroDist || distSq <= animDistSqLimit;

    if (!isNearAnim && (!shouldGoHome || distSq > 75 * 75)) {
      // Distant island citizens: step position cheaply every 8th frame, skip bone math & O(N^2) checks
      if (((i + _villageAnimCounter) & 7) !== 0) continue;
      const stepDt = Math.min(0.24, dt * 8);
      if (!shouldGoHome && v.pauseTimer > 0) {
        v.pauseTimer -= stepDt;
        continue;
      }
      const [tx, tz] = shouldGoHome ? v.homeDoor : v.waypoints[v.wpIdx];
      const dx = tx - v.x;
      const dz = tz - v.z;
      const dist = Math.hypot(dx, dz);
      if (shouldGoHome && dist < 1.35) {
        v.isInsideHouse = true;
        v.root.visible = false;
        v.stuckTimer = 0;
        if (inter) {
          inter.x = 9999;
          inter.z = 9999;
        }
        continue;
      }
      if (!shouldGoHome && dist < 0.55) {
        v.wpIdx = (v.wpIdx + 1) % v.waypoints.length;
        v.pauseTimer = 1.25 + (i % 3) * 0.7;
      } else if (dist > 0.001) {
        const spd = shouldGoHome ? v.speed * (dayPhase === 'malam' ? 2.4 : 1.65) : v.speed;
        const step = Math.min(dist, spd * stepDt);
        v.x += (dx / dist) * step;
        v.z += (dz / dist) * step;
        v.yaw = Math.atan2(dx, dz);
        v.root.position.set(v.x, getArchipelagoGroundY(v.x, v.z), v.z);
        v.root.rotation.y = v.yaw;
        if (inter) {
          inter.x = v.x;
          inter.z = v.z;
        }
      }
      continue;
    }

    const breath = Math.sin(elapsed * 2.6 + i * 1.1);
    if (isNearAnim) {
      const vBlink = computeVillageBlink(elapsed, i * 1.37);
      v.leftEye.scale.y = vBlink;
      v.rightEye.scale.y = vBlink;
    }

    if (!shouldGoHome && v.pauseTimer > 0) {
      v.pauseTimer -= dt;
      v.leftLeg.rotation.x = THREE.MathUtils.damp(v.leftLeg.rotation.x, 0, 14, dt);
      v.rightLeg.rotation.x = THREE.MathUtils.damp(v.rightLeg.rotation.x, 0, 14, dt);
      v.bodyPivot.position.y = THREE.MathUtils.damp(v.bodyPivot.position.y, 0, 14, dt);
      v.headGroup.rotation.y = THREE.MathUtils.damp(
        v.headGroup.rotation.y,
        Math.sin(elapsed * 1.6 + i) * 0.34,
        8,
        dt,
      );
      v.headGroup.rotation.x = Math.sin(elapsed * 2.2 + i) * 0.05;

      // Living idle breathing squash-and-stretch preserving authentic age/build proportions
      const sy = 1 + breath * 0.036;
      const sxz = 1 / Math.sqrt(sy);
      v.bodyPivot.scale.set(v.baseScaleXZ * sxz, v.baseScaleY * sy, v.baseScaleXZ * sxz);

      let targetR = v.baseRightArmX + breath * 0.06;
      let targetL = v.baseLeftArmX - breath * 0.06;
      let targetRZ = v.baseRightArmZ;
      let targetLZ = v.baseLeftArmZ;

      // Distinct daily work & habit animations for each NPC profession
      switch (v.archetype) {
        case 'blacksmith': {
          // Rhythmic iron hammering strike
          const strike = Math.pow(Math.abs(Math.sin(elapsed * 4.6 + i)), 1.6);
          targetR = -1.65 + strike * 1.15;
          v.headGroup.rotation.x = 0.14 + strike * 0.1;
          break;
        }
        case 'grandma_herbalist': {
          // Circular mortar & pestle grinding motion
          targetR = v.baseRightArmX + Math.sin(elapsed * 4.2 + i) * 0.18;
          targetRZ = v.baseRightArmZ + Math.cos(elapsed * 4.2 + i) * 0.14;
          targetL = v.baseLeftArmX + Math.sin(elapsed * 2.1 + i) * 0.05;
          v.headGroup.rotation.x = 0.18;
          break;
        }
        case 'street_vendor': {
          // Flipping grilled satay skewer over embers
          targetR = v.baseRightArmX - 0.18 + Math.sin(elapsed * 4.8 + i) * 0.28;
          targetL = v.baseLeftArmX + Math.sin(elapsed * 2.4 + i) * 0.1;
          break;
        }
        case 'farmer_boy': {
          // Rhythmic hoeing chop into soil
          const chop = Math.sin(elapsed * 3.2 + i);
          targetR = v.baseRightArmX - 0.25 + chop * 0.34;
          targetL = v.baseLeftArmX - 0.2 + chop * 0.18;
          v.headGroup.rotation.x = 0.14 + Math.max(0, chop) * 0.12;
          break;
        }
        case 'zoo_keeper': {
          // Jotting animal checklist notes with pen on clipboard
          targetR = v.baseRightArmX - 0.18 + Math.sin(elapsed * 6.5 + i) * 0.12;
          targetRZ = -0.22 + Math.cos(elapsed * 5.0 + i) * 0.08;
          v.headGroup.rotation.x = 0.16;
          break;
        }
        case 'bus_driver': {
          // Steering wheel turn check
          const steer = Math.sin(elapsed * 2.4 + i) * 0.16;
          targetR = v.baseRightArmX + steer;
          targetL = v.baseLeftArmX - steer;
          break;
        }
        case 'florist_girl': {
          // Gentle floral basket sway & smelling blooms
          targetR = v.baseRightArmX + Math.sin(elapsed * 1.9 + i) * 0.05;
          targetL = v.baseLeftArmX + Math.sin(elapsed * 1.9 + i) * 0.05;
          v.headGroup.rotation.x = 0.12;
          break;
        }
        case 'village_kid': {
          // Energetic playground bounce
          const hop = Math.abs(Math.sin(elapsed * 4.5 + i)) * 0.06;
          v.bodyPivot.position.y = THREE.MathUtils.damp(v.bodyPivot.position.y, hop, 16, dt);
          targetR = v.baseRightArmX - Math.sin(elapsed * 3.2 + i) * 0.22;
          targetL = v.baseLeftArmX + Math.sin(elapsed * 3.2 + i) * 0.22;
          break;
        }
        case 'mine_engineer': {
          // Checking pickaxe poise & helmet beam scan
          targetR = v.baseRightArmX + Math.sin(elapsed * 1.8 + i) * 0.08;
          v.headGroup.rotation.y = Math.sin(elapsed * 2.1 + i) * 0.45;
          break;
        }
        case 'temple_guardian': {
          // Raising lantern softly to inspect the perimeter
          targetR = v.baseRightArmX - 0.12 + Math.sin(elapsed * 1.6 + i) * 0.08;
          break;
        }
        default:
          break;
      }

      v.rightArm.rotation.x = THREE.MathUtils.damp(v.rightArm.rotation.x, targetR, 12, dt);
      v.leftArm.rotation.x = THREE.MathUtils.damp(v.leftArm.rotation.x, targetL, 12, dt);
      v.rightArm.rotation.z = THREE.MathUtils.damp(v.rightArm.rotation.z, targetRZ, 12, dt);
      v.leftArm.rotation.z = THREE.MathUtils.damp(v.leftArm.rotation.z, targetLZ, 12, dt);
      continue;
    }

    const [tx, tz] = shouldGoHome ? v.homeDoor : v.waypoints[v.wpIdx];
    const dx = tx - v.x;
    const dz = tz - v.z;
    const dist = Math.hypot(dx, dz);
    if (shouldGoHome && dist < 1.15) {
      v.isInsideHouse = true;
      v.root.visible = false;
      v.stuckTimer = 0;
      if (inter) {
        inter.x = 9999;
        inter.z = 9999;
      }
      continue;
    }
    if (!shouldGoHome && dist < 0.45) {
      v.wpIdx = (v.wpIdx + 1) % v.waypoints.length;
      v.pauseTimer = 1.25 + (i % 3) * 0.7;
      v.stuckTimer = 0;
      continue;
    }

    let dirX = dx / dist;
    let dirZ = dz / dist;
    const vRad = 0.56;
    const probe = hasAheadObstacle(v.x, v.z, dirX, dirZ, 0.95, vRad, rig.obstacles) ||
      hasAheadObstacle(v.x, v.z, dirX, dirZ, 0.95, vRad, extraObstacles);
    if (probe) {
      // Steer tangentially around wall/pole/house!
      const perpX = -dirZ * v.avoidSign;
      const perpZ = dirX * v.avoidSign;
      dirX = dirX * 0.35 + perpX * 0.9;
      dirZ = dirZ * 0.35 + perpZ * 0.9;
      const nLen = Math.hypot(dirX, dirZ) || 1;
      dirX /= nLen;
      dirZ /= nLen;
    }

    const moveSpeed = shouldGoHome ? v.speed * (dayPhase === 'malam' ? 2.4 : 1.65) : v.speed;
    const step = Math.min(dist, moveSpeed * dt);
    const prevX = v.x;
    const prevZ = v.z;
    _moveScratch.x = v.x + dirX * step;
    _moveScratch.z = v.z + dirZ * step;
    pushOutFromBoxes(_moveScratch, vRad, rig.obstacles);
    pushOutFromBoxes(_moveScratch, vRad, extraObstacles);

    // Keep distance from other visible villagers & golems (fast AABB reject)
    for (let j = 0; j < rig.villagers.length; j++) {
      if (j === i) continue;
      const ov = rig.villagers[j];
      if (ov.isInsideHouse) continue;
      const vx = _moveScratch.x - ov.x;
      if (vx > 1.25 || vx < -1.25) continue;
      const vz = _moveScratch.z - ov.z;
      if (vz > 1.25 || vz < -1.25) continue;
      const vd = Math.hypot(vx, vz);
      if (vd > 0.001 && vd < 1.05) {
        _moveScratch.x += (vx / vd) * (1.05 - vd) * 0.5;
        _moveScratch.z += (vz / vd) * (1.05 - vd) * 0.5;
      }
    }
    for (let j = 0; j < rig.golems.length; j++) {
      const og = rig.golems[j];
      const vx = _moveScratch.x - og.x;
      const vz = _moveScratch.z - og.z;
      const vd = Math.hypot(vx, vz);
      if (vd > 0.001 && vd < 1.45) {
        _moveScratch.x += (vx / vd) * (1.45 - vd);
        _moveScratch.z += (vz / vd) * (1.45 - vd);
      }
    }

    const moved = Math.hypot(_moveScratch.x - prevX, _moveScratch.z - prevZ);
    v.x = _moveScratch.x;
    v.z = _moveScratch.z;

    if (moved < step * 0.25) {
      v.stuckTimer += dt;
      if (v.stuckTimer > 0.9) {
        v.avoidSign *= -1;
        if (!shouldGoHome) {
          v.wpIdx = (v.wpIdx + 1) % v.waypoints.length;
        } else if (v.stuckTimer > 3.2) {
          // If path to doorway is blocked at night, slip safely inside home
          v.isInsideHouse = true;
          v.root.visible = false;
        }
        v.stuckTimer = 0;
      }
    } else {
      v.stuckTimer = 0;
    }

    const moveDx = v.x - prevX;
    const moveDz = v.z - prevZ;
    const targetYaw = moved > 0.005 ? Math.atan2(moveDx, moveDz) : Math.atan2(dx, dz);
    let diff = targetYaw - v.yaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    v.yaw += diff * (1 - Math.exp(-8 * dt));
    v.root.position.set(v.x, getArchipelagoGroundY(v.x, v.z), v.z);
    v.root.rotation.y = v.yaw;

    v.walkPhase += dt * (5.5 + moveSpeed);
    const swing = Math.sin(v.walkPhase) * 0.54;
    const stepBounce = Math.abs(Math.sin(v.walkPhase));
    v.leftLeg.rotation.x = swing;
    v.rightLeg.rotation.x = -swing;
    v.bodyPivot.position.y = stepBounce * 0.07;
    v.headGroup.rotation.y = THREE.MathUtils.damp(v.headGroup.rotation.y, 0, 8, dt);
    v.headGroup.rotation.x = Math.sin(v.walkPhase * 2) * 0.03;

    // Squash-and-stretch stride preserving authentic child/youth/adult/elderly scale
    const walkSy = 1 + breath * 0.025 + stepBounce * 0.045;
    const walkSxz = 1 / Math.sqrt(walkSy);
    v.bodyPivot.scale.set(v.baseScaleXZ * walkSxz, v.baseScaleY * walkSy, v.baseScaleXZ * walkSxz);

    const keepsHandsSteady =
      v.archetype === 'florist_girl' ||
      v.archetype === 'bus_driver' ||
      v.archetype === 'grandma_herbalist' ||
      v.archetype === 'pastry_chef';
    const armWalkAmp = keepsHandsSteady ? 0.08 : 0.45;
    v.leftArm.rotation.x = v.baseLeftArmX - swing * armWalkAmp;
    v.rightArm.rotation.x = v.baseRightArmX + swing * armWalkAmp;
    v.leftArm.rotation.z = v.baseLeftArmZ;
    v.rightArm.rotation.z = v.baseRightArmZ;

    if (v.propSpin) {
      v.propSpin.rotation.y += dt * 1.8;
    }

    if (inter) {
      inter.x = v.x;
      inter.z = v.z;
    }
  }

  // 2. Iron Golems heavy steady patrol with distance throttling + cached interactable
  for (let i = 0; i < rig.golems.length; i++) {
    const g = rig.golems[i];
    const minGolemSq = getMinViewerDistSq(g.x, g.z, heroX, heroZ, camX, camZ);
    if (allowVisibilityCull) {
      const wantVis = minGolemSq <= 145 * 145;
      if (g.root.visible !== wantVis) g.root.visible = wantVis;
    } else if (!g.root.visible) {
      g.root.visible = true;
    }
    const gDistSqHero = hasHeroDist
      ? (g.x - heroX!) * (g.x - heroX!) + (g.z - heroZ!) * (g.z - heroZ!)
      : 0;
    const isNearGolem = !hasHeroDist || gDistSqHero <= animDistSqLimit;

    if (!isNearGolem) {
      if (((i + _villageAnimCounter) & 7) !== 0) continue;
      const stepDt = Math.min(0.24, dt * 8);
      if (g.pauseTimer > 0) {
        g.pauseTimer -= stepDt;
        continue;
      }
      const [tx, tz] = g.waypoints[g.wpIdx];
      const dx = tx - g.x;
      const dz = tz - g.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.65) {
        g.wpIdx = (g.wpIdx + 1) % g.waypoints.length;
        g.pauseTimer = 1.6;
      } else {
        const step = Math.min(dist, 1.45 * stepDt);
        g.x += (dx / dist) * step;
        g.z += (dz / dist) * step;
        g.yaw = Math.atan2(dx, dz);
        g.root.position.set(g.x, getArchipelagoGroundY(g.x, g.z), g.z);
        g.root.rotation.y = g.yaw;
        if (g.interactable) {
          g.interactable.x = g.x;
          g.interactable.z = g.z;
        }
      }
      continue;
    }

    const breath = Math.sin(elapsed * 1.9 + i * 1.4);
    const gBlink = computeVillageBlink(elapsed, 2.2 + i * 1.9);
    g.leftEye.scale.y = gBlink;
    g.rightEye.scale.y = gBlink;

    if (g.pauseTimer > 0) {
      g.pauseTimer -= dt;
      g.leftLeg.rotation.x = THREE.MathUtils.damp(g.leftLeg.rotation.x, 0, 12, dt);
      g.rightLeg.rotation.x = THREE.MathUtils.damp(g.rightLeg.rotation.x, 0, 12, dt);
      g.rightArm.rotation.x = THREE.MathUtils.damp(g.rightArm.rotation.x, 0, 12, dt);
      if (!g.holdsFlower) g.leftArm.rotation.x = THREE.MathUtils.damp(g.leftArm.rotation.x, 0, 12, dt);
      g.headGroup.rotation.y = Math.sin(elapsed * 0.9 + i) * 0.25;
      const sy = 1 + breath * 0.034;
      const sxz = 1 / Math.sqrt(sy);
      g.bodyPivot.scale.set(sxz, sy, sxz);
      continue;
    }

    const [tx, tz] = g.waypoints[g.wpIdx];
    const dx = tx - g.x;
    const dz = tz - g.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.55) {
      g.wpIdx = (g.wpIdx + 1) % g.waypoints.length;
      g.pauseTimer = 1.6;
      g.stuckTimer = 0;
      continue;
    }

    let dirX = dx / dist;
    let dirZ = dz / dist;
    const gRad = 0.92;
    if (
      hasAheadObstacle(g.x, g.z, dirX, dirZ, 1.25, gRad, rig.obstacles) ||
      hasAheadObstacle(g.x, g.z, dirX, dirZ, 1.25, gRad, extraObstacles)
    ) {
      const perpX = -dirZ * g.avoidSign;
      const perpZ = dirX * g.avoidSign;
      dirX = dirX * 0.35 + perpX * 0.9;
      dirZ = dirZ * 0.35 + perpZ * 0.9;
      const nLen = Math.hypot(dirX, dirZ) || 1;
      dirX /= nLen;
      dirZ /= nLen;
    }

    const step = Math.min(dist, 1.45 * dt);
    const prevX = g.x;
    const prevZ = g.z;
    _moveScratch.x = g.x + dirX * step;
    _moveScratch.z = g.z + dirZ * step;
    pushOutFromBoxes(_moveScratch, gRad, rig.obstacles);
    pushOutFromBoxes(_moveScratch, gRad, extraObstacles);

    const moved = Math.hypot(_moveScratch.x - prevX, _moveScratch.z - prevZ);
    g.x = _moveScratch.x;
    g.z = _moveScratch.z;

    if (moved < step * 0.25) {
      g.stuckTimer += dt;
      if (g.stuckTimer > 1.0) {
        g.avoidSign *= -1;
        g.wpIdx = (g.wpIdx + 1) % g.waypoints.length;
        g.stuckTimer = 0;
      }
    } else {
      g.stuckTimer = 0;
    }

    const targetYaw = moved > 0.005 ? Math.atan2(g.x - prevX, g.z - prevZ) : Math.atan2(dx, dz);
    let diff = targetYaw - g.yaw;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    g.yaw += diff * (1 - Math.exp(-5 * dt));
    g.root.position.set(g.x, getArchipelagoGroundY(g.x, g.z), g.z);
    g.root.rotation.y = g.yaw;

    g.walkPhase += dt * 3.8;
    const swing = Math.sin(g.walkPhase) * 0.42;
    const stomp = Math.abs(Math.sin(g.walkPhase));
    g.leftLeg.rotation.x = swing;
    g.rightLeg.rotation.x = -swing;
    g.rightArm.rotation.x = swing * 0.65;
    if (!g.holdsFlower) {
      g.leftArm.rotation.x = -swing * 0.65;
    } else {
      g.leftArm.rotation.x = -0.65 + Math.sin(elapsed * 2.5) * 0.08;
    }
    g.headGroup.rotation.y = THREE.MathUtils.damp(g.headGroup.rotation.y, 0, 6, dt);
    const golemSy = 1 + breath * 0.025 + stomp * 0.04;
    const golemSxz = 1 / Math.sqrt(golemSy);
    g.bodyPivot.scale.set(golemSxz, golemSy, golemSxz);

    if (g.interactable) {
      g.interactable.x = g.x;
      g.interactable.z = g.z;
    }
  }

  // 3. Llamas & Hutan Satwa Critters gentle idle breathing squash-and-stretch, blinking & grazing
  for (const l of rig.llamas) {
    const minSq = getMinViewerDistSq(l.baseX, l.baseZ, heroX, heroZ, camX, camZ);
    if (allowVisibilityCull) {
      const wantVis = minSq <= 135 * 135;
      if (l.root.visible !== wantVis) l.root.visible = wantVis;
    } else if (!l.root.visible) {
      l.root.visible = true;
    }
    if (hasHeroDist && minSq > animDistSqLimit) continue;
    l.headPivot.rotation.y = Math.sin(elapsed * 1.1 + l.phase) * 0.25;
    l.headPivot.rotation.x = Math.sin(elapsed * 1.8 + l.phase) * 0.08;
    const lBlink = computeVillageBlink(elapsed, l.phase + 0.9);
    l.leftEye.scale.y = lBlink;
    l.rightEye.scale.y = lBlink;
    const sy = 1 + Math.sin(elapsed * 2.2 + l.phase) * 0.04;
    const sxz = 1 / Math.sqrt(sy);
    l.root.scale.set(sxz, sy, sxz);
  }
  for (const c of rig.critters) {
    const minSq = getMinViewerDistSq(c.baseX, c.baseZ, heroX, heroZ, camX, camZ);
    if (allowVisibilityCull) {
      const wantVis = minSq <= 98 * 98;
      if (c.root.visible !== wantVis) c.root.visible = wantVis;
    } else if (!c.root.visible) {
      c.root.visible = true;
    }
    if (hasHeroDist && minSq > animDistSqLimit) continue;
    const t = elapsed * 1.3 + c.phase;
    const nx = c.baseX + Math.sin(t * 0.6) * 0.65;
    const nz = c.baseZ + Math.cos(t * 0.5) * 0.55;
    c.root.position.set(nx, getArchipelagoGroundY(nx, nz), nz);
    c.root.rotation.y = c.baseYaw + Math.sin(t * 0.7) * 0.35;
    c.head.rotation.x = Math.max(0, Math.sin(t * 1.6)) * 0.32;
    c.head.rotation.y = Math.cos(t * 1.1) * 0.22;
    const cBlink = computeVillageBlink(elapsed, c.phase + 2.4);
    c.leftEye.scale.y = cBlink;
    c.rightEye.scale.y = cBlink;
    const sy = 1 + Math.sin(elapsed * 3.0 + c.phase) * 0.045;
    const sxz = 1 / Math.sqrt(sy);
    c.root.scale.set(sxz, sy, sxz);
  }

  // 4. Voxel Bees buzzing in figure-8 over flowers & farm (rest in hives at night)
  const beesAwake = dayPhase !== 'malam';
  for (const b of rig.bees) {
    const minSq = getMinViewerDistSq(b.centerX, b.centerZ, heroX, heroZ, camX, camZ);
    const wantVis = beesAwake && (!allowVisibilityCull || minSq <= 92 * 92);
    if (b.root.visible !== wantVis) b.root.visible = wantVis;
    if (!wantVis) continue;
    if (hasHeroDist && minSq > animDistSqLimit) continue;
    const t = elapsed * b.speed + b.phase;
    const nx = b.centerX + Math.sin(t) * b.radiusX;
    const nz = b.centerZ + Math.sin(t * 2) * b.radiusZ * 0.6;
    const ny = b.centerY + Math.sin(t * 3.2) * 0.28;
    const vx = Math.cos(t) * b.radiusX;
    const vz = Math.cos(t * 2) * b.radiusZ * 1.2;
    b.root.position.set(nx, ny, nz);
    b.root.rotation.y = Math.atan2(vx, vz);
    const wingFlap = Math.sin(elapsed * 38 + b.phase) * 0.55;
    b.leftWing.rotation.z = wingFlap;
    b.rightWing.rotation.z = -wingFlap;
  }

  // 5. Pillager Outpost ridge patrol + crossbow aiming, blinking & breathing stretch
  for (const p of rig.pillagers) {
    const minSq = getMinViewerDistSq(p.centerX, p.centerZ, heroX, heroZ, camX, camZ);
    if (allowVisibilityCull) {
      const wantVis = minSq <= 135 * 135;
      if (p.root.visible !== wantVis) p.root.visible = wantVis;
    } else if (!p.root.visible) {
      p.root.visible = true;
    }
    if (hasHeroDist && minSq > animDistSqLimit) continue;
    const a = elapsed * 0.55 + p.phase;
    const px = p.centerX + Math.cos(a) * p.patrolR;
    const pz = p.centerZ + Math.sin(a) * p.patrolR;
    p.root.position.set(px, p.baseY, pz);
    p.root.rotation.y = Math.atan2(-Math.sin(a), Math.cos(a));
    const sw = Math.sin(elapsed * 5 + p.phase) * 0.45;
    p.leftLeg.rotation.x = sw;
    p.rightLeg.rotation.x = -sw;
    p.rightArm.rotation.x = -0.95 + Math.sin(elapsed * 2.5 + p.phase) * 0.14;
    p.leftArm.rotation.x = -0.82 - Math.sin(elapsed * 2.5 + p.phase) * 0.12;
    p.leftArm.rotation.z = 0.28;
    const pBlink = computeVillageBlink(elapsed, p.phase + 1.5);
    p.leftEye.scale.y = pBlink;
    p.rightEye.scale.y = pBlink;
    const sy = 1 + Math.sin(elapsed * 2.8 + p.phase) * 0.04;
    const sxz = 1 / Math.sqrt(sy);
    p.bodyPivot.scale.set(sxz, sy, sxz);
  }

  for (const s of rig.smokePuffs) {
    const minSq = getMinViewerDistSq(s.baseX, s.baseZ, heroX, heroZ, camX, camZ);
    if (allowVisibilityCull) {
      const wantVis = minSq <= 125 * 125;
      if (s.mesh.visible !== wantVis) s.mesh.visible = wantVis;
    } else if (!s.mesh.visible) {
      s.mesh.visible = true;
    }
    if (hasHeroDist && minSq > 105 * 105) continue;
    const rise = ((elapsed * 1.6 + s.phase) % 12) / 12;
    s.mesh.position.set(
      s.baseX + Math.sin(elapsed * 0.9 + s.phase) * 0.65,
      s.baseY + rise * 14,
      s.baseZ + Math.cos(elapsed * 0.7 + s.phase) * 0.5,
    );
    s.mesh.scale.setScalar(0.85 + rise * 1.5);
  }
}
