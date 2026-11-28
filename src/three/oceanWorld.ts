import * as THREE from 'three';
import { DivingGearId, MonsterType, OceanMaterials, SeaBiotaId, WeaponId } from '../types/game';
import { MaterialPalette } from './materials';
import {
  animateSeaBiotaRig,
  createSeaBiotaMesh,
  SEA_BIOTA_BY_ID,
  SEA_BIOTA_CATALOG,
  SeaBiotaRig,
} from './seaBiotaCatalog';
import { createWeaponMesh } from './weaponModels';

export interface DivingGearDef {
  id: DivingGearId;
  name: string;
  subtitle: string;
  maxOxygenBonus: number;
  drainMultiplier: number;
  speedBonus: number;
  torchPower: number;
  craftCost: Partial<OceanMaterials>;
  diamondCost: number;
  color: string;
}

export const DIVING_GEAR_DEFS: Record<DivingGearId, DivingGearDef> = {
  snorkel: {
    id: 'snorkel',
    name: 'Kacamata & Snorkel Karang',
    subtitle: '+45 O₂ · Penglihatan jernih & hemat napas dangkal',
    maxOxygenBonus: 45,
    drainMultiplier: 0.65,
    speedBonus: 0.08,
    torchPower: 0.4,
    craftCost: { fiber: 3, calcium: 2 },
    diamondCost: 3,
    color: '#38bdf8',
  },
  wetsuit_tank: {
    id: 'wetsuit_tank',
    name: 'Baju Selam & Tabung O₂',
    subtitle: '+140 O₂ · Tahan tekanan Palung Abyssal (-80% boros O₂)',
    maxOxygenBonus: 140,
    drainMultiplier: 0.22,
    speedBonus: 0.14,
    torchPower: 0.8,
    craftCost: { fiber: 4, calcium: 3, pearl: 2 },
    diamondCost: 6,
    color: '#22d3ee',
  },
  fins_torch: {
    id: 'fins_torch',
    name: 'Sirip Cepat & Senter Abyssal',
    subtitle: '+38% Kecepatan Renang & Sinar Senter Terang di Palung',
    maxOxygenBonus: 35,
    drainMultiplier: 0.85,
    speedBonus: 0.38,
    torchPower: 2.8,
    craftCost: { pearl: 2, shell: 2, fiber: 3 },
    diamondCost: 5,
    color: '#facc15',
  },
};

export interface OceanSeaMonsterSpawn {
  id: string;
  type: MonsterType;
  name: string;
  x: number;
  z: number;
  y: number;
  maxHp: number;
  rewardXp: number;
  rewardDiamonds: number;
  rewardScore: number;
}

// Placed exclusively inside the deep Abyssal Trench (z <= -22) so shallow reef exploration stays peaceful!
export const OCEAN_SEA_MONSTER_SPAWNS: OceanSeaMonsterSpawn[] = [
  { id: 'oc_shark_1', type: 'goring_shark', name: 'Hiu Bertaring Palung', x: -16, z: -26, y: -18.5, maxHp: 5, rewardXp: 35, rewardDiamonds: 2, rewardScore: 260 },
  { id: 'oc_eel_1', type: 'electric_eel_drakon', name: 'Belut Naga Listrik', x: 14, z: -28, y: -19.2, maxHp: 5, rewardXp: 38, rewardDiamonds: 2, rewardScore: 280 },
  { id: 'oc_jelly_1', type: 'venomous_box_jelly', name: 'Ubur-Ubur Berbisa', x: -6, z: -31, y: -17.0, maxHp: 4, rewardXp: 32, rewardDiamonds: 1, rewardScore: 240 },
  { id: 'oc_viper_1', type: 'toxic_sea_viper', name: 'Ular Laut Beracun', x: 22, z: -33, y: -21.5, maxHp: 5, rewardXp: 36, rewardDiamonds: 2, rewardScore: 270 },
  { id: 'oc_angler_1', type: 'shadow_angler', name: 'Ikan Sungut Bayangan', x: -24, z: -34, y: -22.5, maxHp: 6, rewardXp: 42, rewardDiamonds: 2, rewardScore: 310 },
  { id: 'oc_ray_1', type: 'spiny_mega_stingray', name: 'Pari Duri Raksasa', x: 4, z: -36, y: -23.0, maxHp: 6, rewardXp: 42, rewardDiamonds: 2, rewardScore: 320 },
  { id: 'oc_kraken_1', type: 'abyssal_kraken', name: 'Kraken Penguasa Palung', x: -8, z: -42, y: -22.5, maxHp: 9, rewardXp: 70, rewardDiamonds: 4, rewardScore: 540 },
  { id: 'oc_leviathan_1', type: 'leviathan_serpent', name: 'Naga Leviathan', x: 14, z: -43, y: -21.0, maxHp: 8, rewardXp: 65, rewardDiamonds: 3, rewardScore: 480 },
  { id: 'oc_jaw_1', type: 'giant_bone_jaw', name: 'Rahang Tulang Purba', x: -20, z: -45, y: -24.0, maxHp: 7, rewardXp: 55, rewardDiamonds: 3, rewardScore: 420 },
  { id: 'oc_maw_1', type: 'charybdis_maw', name: 'Mulut Charybdis', x: 2, z: -47, y: -26.5, maxHp: 10, rewardXp: 85, rewardDiamonds: 5, rewardScore: 680 },
];

export interface OceanBiotaNode {
  id: string;
  speciesId: SeaBiotaId;
  rig: SeaBiotaRig;
  x: number;
  y: number;
  z: number;
  homeX: number;
  homeY: number;
  homeZ: number;
  phase: number;
  patrolMode: 'static' | 'swim' | 'hover' | 'crawl';
  patrolRadius: number;
  patrolSpeed: number;
  harvestCooldown: number;
  scale: number;
  lastDimScale?: number;
  repelX?: number;
  repelZ?: number;
}

export interface OceanSolidCollider {
  x: number;
  z: number;
  minY: number;
  maxY: number;
  halfW: number;
  halfD: number;
  rotY?: number;
  isSphere?: boolean;
  radius?: number;
}

export interface OceanPickup {
  id: string;
  kind: 'heart' | 'diamond' | 'weapon';
  weaponId?: WeaponId;
  label: string;
  x: number;
  y: number;
  z: number;
  phase: number;
  active: boolean;
  respawnTimer: number;
  mesh: THREE.Group;
}

export interface OceanAirVent {
  id: string;
  x: number;
  y: number;
  z: number;
  group: THREE.Group;
  rings: THREE.Mesh[];
}

export interface OceanSupplyChest {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  rewardGear?: DivingGearId;
  rewardMaterials: Partial<OceanMaterials>;
  opened: boolean;
  group: THREE.Group;
  lid: THREE.Group;
  beacon: THREE.Mesh;
}

export interface OceanWorldRig {
  group: THREE.Group;
  surfaceMesh: THREE.Mesh;
  sunbeams: THREE.Mesh[];
  bubblesPoints: THREE.Points;
  buoyGroup: THREE.Group;
  buoyPos: THREE.Vector3;
  torchLight: THREE.PointLight;
  reefGlowLight: THREE.PointLight;
  biotaNodes: OceanBiotaNode[];
  airVents: OceanAirVent[];
  chests: OceanSupplyChest[];
  colliders: OceanSolidCollider[];
  pickups: OceanPickup[];
  clickables: THREE.Object3D[];
  disposables: Array<{ dispose: () => void }>;
}

export function getSeaBiotaSolidRadius(speciesId: SeaBiotaId, scale = 1): number {
  switch (speciesId) {
    case 'brain_coral':
    case 'fire_coral':
    case 'blue_staghorn':
    case 'giant_clam':
      return 0.85 * scale;
    case 'sea_turtle':
    case 'spotted_stingray':
    case 'chameleon_octopus':
    case 'glowing_jellyfish':
      return 0.9 * scale;
    case 'sea_anemone':
    case 'sea_fan':
    case 'bioluminescent_algae':
      return 0.62 * scale;
    case 'giant_kelp':
    case 'seagrass':
    case 'tiger_cowrie':
    case 'spiny_lobster':
    case 'box_crab':
    case 'starfish':
      return 0.52 * scale;
    case 'clownfish':
    case 'blue_tang':
    case 'yellow_seahorse':
    default:
      return 0.56 * scale;
  }
}

export function resolveOceanSolidCollisions(
  pos: { x: number; y: number; z: number },
  colliders: OceanSolidCollider[],
  radius = 0.68,
  entityHeight = 2.1,
): boolean {
  let pushed = false;
  for (let i = 0; i < colliders.length; i++) {
    const col = colliders[i];
    if (pos.y >= col.maxY - 0.14 || pos.y + entityHeight <= col.minY + 0.14) continue;
    const dx = pos.x - col.x;
    const dz = pos.z - col.z;
    if (col.isSphere && col.radius !== undefined) {
      const minD = col.radius + radius;
      const distSq = dx * dx + dz * dz;
      if (distSq < minD * minD) {
        if (distSq > 0.0001) {
          const d = Math.sqrt(distSq);
          pos.x += (dx / d) * (minD - d);
          pos.z += (dz / d) * (minD - d);
        } else {
          pos.z = col.z + minD;
        }
        pushed = true;
      }
      continue;
    }

    const rotY = col.rotY ?? 0;
    const cosY = rotY !== 0 ? Math.cos(rotY) : 1;
    const sinY = rotY !== 0 ? Math.sin(rotY) : 0;
    const lx = rotY !== 0 ? dx * cosY - dz * sinY : dx;
    const lz = rotY !== 0 ? dx * sinY + dz * cosY : dz;
    const cx = THREE.MathUtils.clamp(lx, -col.halfW, col.halfW);
    const cz = THREE.MathUtils.clamp(lz, -col.halfD, col.halfD);
    const px = lx - cx;
    const pz = lz - cz;
    const distSq = px * px + pz * pz;
    if (distSq >= radius * radius) continue;

    let nextLx = lx;
    let nextLz = lz;
    if (distSq > 0.0001) {
      const d = Math.sqrt(distSq);
      nextLx += (px / d) * (radius - d);
      nextLz += (pz / d) * (radius - d);
    } else {
      const penX = col.halfW + radius - Math.abs(lx);
      const penZ = col.halfD + radius - Math.abs(lz);
      if (penX < penZ) {
        nextLx = lx >= 0 ? col.halfW + radius : -(col.halfW + radius);
      } else {
        nextLz = lz >= 0 ? col.halfD + radius : -(col.halfD + radius);
      }
    }
    if (rotY !== 0) {
      pos.x = col.x + nextLx * cosY + nextLz * sinY;
      pos.z = col.z - nextLx * sinY + nextLz * cosY;
    } else {
      pos.x = col.x + nextLx;
      pos.z = col.z + nextLz;
    }
    pushed = true;
  }
  return pushed;
}

const OCEAN_WEAPON_LABELS: Record<WeaponId, string> = {
  ketapel: 'Senjata Pemula',
  kerikil: 'Ketapel Kerikil',
  emas: 'Senjata Emas',
  saus: 'Senjata Cepat',
  biji: 'Senjata Hijau',
  kertas: 'Senjata Langit',
  jarum: 'Senjata Berat',
  kristal: 'Senjata Kristal',
  harpun: 'Harpun Kristal Laut',
};

function createOceanPickupMesh(
  kind: 'heart' | 'diamond' | 'weapon',
  weaponId: WeaponId | undefined,
  palette: MaterialPalette,
  disposables: Array<{ dispose: () => void }>,
): THREE.Group {
  const g = new THREE.Group();
  const ringMat = palette.getMat(
    kind === 'heart' ? 0xfb7185 : kind === 'diamond' ? 0x38bdf8 : 0xfacc15,
    'emissive',
  );
  const haloGeo = new THREE.TorusGeometry(kind === 'weapon' ? 0.72 : 0.56, 0.055, 6, 16);
  const halo = new THREE.Mesh(haloGeo, ringMat);
  halo.rotation.x = Math.PI / 2;
  halo.position.y = -0.25;
  disposables.push(haloGeo);
  g.add(halo);

  if (kind === 'heart') {
    const heartMat = palette.createSurfaceMat({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 0.95,
      roughness: 0.25,
    });
    const lobeGeo = new THREE.BoxGeometry(0.36, 0.36, 0.28);
    const centerGeo = new THREE.OctahedronGeometry(0.36, 0);
    const leftLobe = new THREE.Mesh(lobeGeo, heartMat);
    leftLobe.position.set(-0.17, 0.16, 0);
    const rightLobe = new THREE.Mesh(lobeGeo, heartMat);
    rightLobe.position.set(0.17, 0.16, 0);
    const tip = new THREE.Mesh(centerGeo, heartMat);
    tip.position.set(0, -0.02, 0);
    tip.scale.set(1.2, 1.05, 0.75);
    disposables.push(heartMat, lobeGeo, centerGeo);
    g.add(leftLobe, rightLobe, tip);
  } else if (kind === 'diamond') {
    const diaMat = palette.createSurfaceMat({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 1.0,
      roughness: 0.15,
      metalness: 0.25,
    });
    const diaGeo = new THREE.OctahedronGeometry(0.46, 0);
    const dia = new THREE.Mesh(diaGeo, diaMat);
    dia.scale.set(0.88, 1.28, 0.88);
    disposables.push(diaMat, diaGeo);
    g.add(dia);
  } else {
    const wMesh = createWeaponMesh(weaponId ?? 'emas', palette, 1.35);
    wMesh.position.y = 0.16;
    wMesh.rotation.z = 0.22;
    g.add(wMesh);
  }
  return g;
}

/**
 * Computes seabed height matching the 3-zone underwater diorama:
 * - Foreground Coral Sanctuary (z >= -4): bright shallow terraces (-7.5m to -11.5m)
 * - Middle Twilight Reef Slope (-24 < z < -4): descending slope (-11.5m to -19.5m)
 * - Background Abyssal Trench (z <= -24): deep dark seafloor (-22m to -28.5m) + steep basalt cliff flanks
 */
export function getOceanFloorY(x: number, z: number): number {
  let baseY: number;
  if (z >= 14) {
    baseY = -7.8 - ((38 - z) / 24) * 1.4;
  } else if (z >= -4) {
    baseY = -9.2 - ((14 - z) / 18) * 2.4;
  } else if (z > -24) {
    const t = (-4 - z) / 20;
    baseY = -11.6 - t * 8.4;
  } else {
    const t = Math.min(1, (-24 - z) / 26);
    baseY = -20.0 - t * 8.2;
  }

  // Gentle terraced voxel ripples & coral mounds
  const terraceWave =
    Math.sin(x * 0.19) * Math.cos(z * 0.17) * 0.65 +
    Math.sin(x * 0.42 + z * 0.35) * 0.25;

  // Raised left-side sunken temple terrace
  const templeDist = Math.hypot(x + 14, z - 10);
  const templeLift = templeDist < 9 ? (1 - templeDist / 9) * 1.6 : 0;

  // Abyssal trench steep rocky canyon side cliffs (|x| > 26 when z < -18)
  let canyonLift = 0;
  if (z < -16 && Math.abs(x) > 25) {
    const wallT = Math.min(1, (Math.abs(x) - 25) / 14);
    canyonLift = wallT * wallT * 11.5;
  }

  return Math.round((baseY + terraceWave + templeLift + canyonLift) * 2) / 2;
}

export function getOceanZoneInfo(z: number, y: number): {
  kind: 'sanctuary' | 'twilight' | 'abyss';
  label: string;
} {
  if (z <= -22 || y <= -19.5) {
    return { kind: 'abyss', label: 'Palung Abyssal' };
  }
  if (z <= -3 || y <= -12.5) {
    return { kind: 'twilight', label: 'Terumbu Senja' };
  }
  return { kind: 'sanctuary', label: 'Taman Karang Dangkal' };
}

const SHARED_UNIT_BOX_GEO = new THREE.BoxGeometry(1, 1, 1);
SHARED_UNIT_BOX_GEO.userData.shared = true;

function makeVoxelBox(
  sx: number,
  sy: number,
  sz: number,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const m = new THREE.Mesh(SHARED_UNIT_BOX_GEO, mat);
  m.scale.set(sx, sy, sz);
  m.position.set(x, y, z);
  return m;
}

function freezeSubtreeMatrices(root: THREE.Object3D): void {
  root.traverse((obj) => {
    obj.updateMatrix();
    if (obj !== root || root instanceof THREE.Mesh) {
      obj.matrixAutoUpdate = false;
    }
  });
}

export function createOceanEnvironment(
  palette: MaterialPalette,
  lowDetail = false,
): OceanWorldRig {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];
  const clickables: THREE.Object3D[] = [];
  const colliders: OceanSolidCollider[] = [];
  const pickups: OceanPickup[] = [];

  // 1. Voxelized 3-Zone Seabed Terrain
  const sandLightMat = palette.getMat(0xfde68a, 'matte');
  const sandWarmMat = palette.getMat(0xeab308, 'matte');
  const tealReefMat = palette.getMat(0x0f766e, 'matte');
  const twilightRockMat = palette.getMat(0x1e3a5f, 'matte');
  const abyssRockMat = palette.getMat(0x0f172a, 'matte');
  const abyssAccentMat = palette.getMat(0x1e293b, 'matte');
  const mossStoneMat = palette.getMat(0x475569, 'matte');
  const mossGreenMat = palette.getMat(0x15803d, 'matte');

  const step = lowDetail ? 4 : 3;
  const tileGeo = new THREE.BoxGeometry(step, 8.0, step);
  disposables.push(tileGeo);

  const sandMatrices: THREE.Matrix4[] = [];
  const sandWarmMatrices: THREE.Matrix4[] = [];
  const tealMatrices: THREE.Matrix4[] = [];
  const abyssMatrices: THREE.Matrix4[] = [];
  const dummy = new THREE.Object3D();

  for (let gx = -46; gx <= 46; gx += step) {
    for (let gz = -52; gz <= 42; gz += step) {
      const fy = getOceanFloorY(gx, gz);
      dummy.position.set(gx, fy - 4.0, gz);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      if (gz >= -3) {
        if ((Math.abs(gx + gz) % 7) < 2) {
          tealMatrices.push(dummy.matrix.clone());
        } else if (Math.abs(gx * 3 + gz) % 5 === 0) {
          sandWarmMatrices.push(dummy.matrix.clone());
        } else {
          sandMatrices.push(dummy.matrix.clone());
        }
      } else if (gz > -23) {
        tealMatrices.push(dummy.matrix.clone());
      } else {
        abyssMatrices.push(dummy.matrix.clone());
      }
    }
  }

  const addTerrainInstances = (mats: THREE.Matrix4[], mat: THREE.Material) => {
    if (mats.length === 0) return;
    const im = new THREE.InstancedMesh(tileGeo, mat, mats.length);
    im.receiveShadow = !lowDetail;
    mats.forEach((m, i) => im.setMatrixAt(i, m));
    im.instanceMatrix.needsUpdate = true;
    im.computeBoundingSphere();
    im.matrixAutoUpdate = false;
    im.updateMatrix();
    group.add(im);
  };
  addTerrainInstances(sandMatrices, sandLightMat);
  addTerrainInstances(sandWarmMatrices, sandWarmMat);
  addTerrainInstances(tealMatrices, twilightRockMat);
  addTerrainInstances(abyssMatrices, abyssRockMat);

  // Extended abyss floor backdrop so horizon never reveals a void
  const deepBackdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 240),
    abyssRockMat,
  );
  deepBackdrop.rotation.x = -Math.PI / 2;
  deepBackdrop.position.set(0, -32.5, -10);
  group.add(deepBackdrop);
  disposables.push(deepBackdrop.geometry);

  // 2. Sunken Mossy Temple Ruin on Foreground Reef Shelf (matches left side of image_35a38232.png!)
  const ruins = new THREE.Group();
  const rBaseY = getOceanFloorY(-14, 10);
  ruins.position.set(-14, rBaseY, 10);
  ruins.rotation.y = 0.42;
  ruins.rotation.z = -0.14;
  const colL = makeVoxelBox(1.5, 6.2, 1.5, mossStoneMat, -2.6, 3.0, 0);
  const colR = makeVoxelBox(1.5, 6.2, 1.5, mossStoneMat, 2.6, 3.0, 0);
  const lintel = makeVoxelBox(7.6, 1.35, 1.8, mossStoneMat, 0, 6.5, 0);
  const lintelTop = makeVoxelBox(6.2, 0.9, 1.5, mossGreenMat, 0, 7.45, 0);
  const mossCapL = makeVoxelBox(1.65, 0.7, 1.65, mossGreenMat, -2.6, 5.5, 0);
  const mossCapR = makeVoxelBox(1.65, 0.7, 1.65, mossGreenMat, 2.6, 4.9, 0);
  const fallenPillar = makeVoxelBox(1.3, 1.3, 4.2, mossStoneMat, 3.8, 0.5, 2.6);
  fallenPillar.rotation.y = 0.75;
  const stepBase = makeVoxelBox(8.8, 0.8, 4.2, tealReefMat, 0, 0.25, 0);
  ruins.add(colL, colR, lintel, lintelTop, mossCapL, mossCapR, fallenPillar, stepBase);
  ruins.updateMatrixWorld(true);
  freezeSubtreeMatrices(ruins);
  ruins.matrixAutoUpdate = false;
  group.add(ruins);

  // Colliders matching Sunken Temple Ruins at (-14, rBaseY, 10), rotY = 0.42
  const rCos = Math.cos(0.42);
  const rSin = Math.sin(0.42);
  const ruinWorldPos = (lx: number, lz: number): [number, number] => [
    -14 + lx * rCos + lz * rSin,
    10 - lx * rSin + lz * rCos,
  ];
  const [colLX, colLZ] = ruinWorldPos(-2.6, 0);
  const [colRX, colRZ] = ruinWorldPos(2.6, 0);
  const [fallX, fallZ] = ruinWorldPos(3.8, 2.6);
  colliders.push(
    {
      x: colLX,
      z: colLZ,
      minY: rBaseY - 0.4,
      maxY: rBaseY + 7.4,
      halfW: 0.88,
      halfD: 0.88,
      rotY: 0.42,
    },
    {
      x: colRX,
      z: colRZ,
      minY: rBaseY - 0.4,
      maxY: rBaseY + 7.4,
      halfW: 0.88,
      halfD: 0.88,
      rotY: 0.42,
    },
    {
      x: -14,
      z: 10,
      minY: rBaseY + 5.8,
      maxY: rBaseY + 8.0,
      halfW: 3.9,
      halfD: 1.0,
      rotY: 0.42,
    },
    {
      x: -14,
      z: 10,
      minY: rBaseY - 0.8,
      maxY: rBaseY + 0.68,
      halfW: 4.4,
      halfD: 2.1,
      rotY: 0.42,
    },
    {
      x: fallX,
      z: fallZ,
      minY: rBaseY - 0.4,
      maxY: rBaseY + 1.45,
      halfW: 0.72,
      halfD: 2.15,
      rotY: 0.42 + 0.75,
    },
  );

  // Additional sunken stone columns along reef ridge
  const extraPillars: Array<[number, number, number, number]> = [
    [-24, 22, 4.4, 0.18],
    [-21, -2, 3.8, -0.22],
    [16, 19, 3.5, 0.12],
  ];
  for (const [px, pz, h, tilt] of extraPillars) {
    const py = getOceanFloorY(px, pz);
    const p = makeVoxelBox(1.25, h, 1.25, mossStoneMat, px, py + h * 0.48, pz);
    p.rotation.z = tilt;
    p.updateMatrix();
    p.matrixAutoUpdate = false;
    const cap = makeVoxelBox(1.4, 0.5, 1.4, mossGreenMat, px, py + h * 0.92, pz);
    cap.updateMatrix();
    cap.matrixAutoUpdate = false;
    group.add(p, cap);
    colliders.push({
      x: px,
      z: pz,
      minY: py - 0.4,
      maxY: py + h + 0.35,
      halfW: 0.78,
      halfD: 0.78,
    });
  }

  // 3. Giant Abyssal Cavern Archway & Cliffs in Background Trench (matches right side of image_35a38232.png!)
  const archGroup = new THREE.Group();
  const archBaseY = getOceanFloorY(0, -40);
  const leftButtress = makeVoxelBox(10, 26, 9, abyssRockMat, -18, archBaseY + 12, -40);
  const rightButtress = makeVoxelBox(10, 26, 9, abyssRockMat, 18, archBaseY + 12, -40);
  const archBridge = makeVoxelBox(46, 7.5, 8.5, abyssRockMat, 0, archBaseY + 23.5, -40);
  const archKeystone = makeVoxelBox(14, 5.5, 9.5, abyssAccentMat, 0, archBaseY + 20.5, -39.5);
  archGroup.add(leftButtress, rightButtress, archBridge, archKeystone);

  // Stepped voxel stalactites & cliff ledges around the abyssal maw
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    const h = 4 + Math.abs(i) * 1.4;
    const stal = makeVoxelBox(2.4, h, 2.4, abyssAccentMat, i * 4.5, archBaseY + 19 - h * 0.4, -38.5);
    archGroup.add(stal);
  }
  // Flanking dark abyss canyon cliffs
  const leftCliff = makeVoxelBox(16, 28, 36, abyssRockMat, -39, -15, -36);
  const rightCliff = makeVoxelBox(16, 28, 36, abyssRockMat, 39, -15, -36);
  const backCliff = makeVoxelBox(94, 30, 8, abyssRockMat, 0, -16, -54);
  archGroup.add(leftCliff, rightCliff, backCliff);
  archGroup.updateMatrixWorld(true);
  freezeSubtreeMatrices(archGroup);
  archGroup.matrixAutoUpdate = false;
  group.add(archGroup);

  colliders.push(
    { x: -18, z: -40, minY: archBaseY - 2, maxY: archBaseY + 25, halfW: 5.0, halfD: 4.5 },
    { x: 18, z: -40, minY: archBaseY - 2, maxY: archBaseY + 25, halfW: 5.0, halfD: 4.5 },
    { x: 0, z: -40, minY: archBaseY + 19.2, maxY: archBaseY + 27.5, halfW: 23.0, halfD: 4.8 },
    { x: -39, z: -36, minY: -32, maxY: 0, halfW: 8.0, halfD: 18.0 },
    { x: 39, z: -36, minY: -32, maxY: 0, halfW: 8.0, halfD: 18.0 },
    { x: 0, z: -54, minY: -32, maxY: 0, halfW: 47.0, halfD: 4.0 },
  );

  // 4. Water Ceiling & Sunbeams (marked isMapHidden so top-down map captures seabed cleanly)
  const waterCeilGeo = new THREE.PlaneGeometry(110, 110, lowDetail ? 4 : 14, lowDetail ? 4 : 14);
  const waterCeilMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.34,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const surfaceMesh = new THREE.Mesh(waterCeilGeo, waterCeilMat);
  surfaceMesh.rotation.x = -Math.PI / 2;
  surfaceMesh.position.set(0, 0, -4);
  surfaceMesh.userData.isMapHidden = true;
  group.add(surfaceMesh);
  disposables.push(waterCeilGeo, waterCeilMat);

  // Volumetric Sunbeams piercing into the sunlit Foreground Coral Sanctuary
  const sunbeams: THREE.Mesh[] = [];
  const beamGeo = new THREE.ConeGeometry(4.8, 22, lowDetail ? 7 : 10, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.13,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  disposables.push(beamGeo, beamMat);

  const beamCoords: Array<[number, number, number]> = [
    [-16, -7.5, 20],
    [-4, -8.5, 14],
    [10, -7.2, 24],
    [18, -9.0, 6],
    [-8, -10.0, -1],
  ];
  const activeBeamCoords = lowDetail ? beamCoords.slice(0, 3) : beamCoords;
  activeBeamCoords.forEach(([bx, by, bz], idx) => {
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(bx, by, bz);
    beam.rotation.z = 0.22 + (idx % 2 === 0 ? 0.04 : -0.04);
    beam.rotation.x = -0.14;
    beam.userData.isMapHidden = true;
    group.add(beam);
    sunbeams.push(beam);
  });

  // 5. Floating Underwater Bubbles Particle Field
  const bubbleCount = lowDetail ? 80 : 240;
  const bubblePositions = new Float32Array(bubbleCount * 3);
  for (let i = 0; i < bubbleCount; i++) {
    bubblePositions[i * 3] = (Math.random() - 0.5) * 84;
    bubblePositions[i * 3 + 1] = -26 + Math.random() * 25;
    bubblePositions[i * 3 + 2] = -46 + Math.random() * 82;
  }
  const bubbleGeo = new THREE.BufferGeometry();
  bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePositions, 3));
  const bubbleMat = new THREE.PointsMaterial({
    color: 0xe0f2fe,
    size: lowDetail ? 0.38 : 0.32,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  const bubblesPoints = new THREE.Points(bubbleGeo, bubbleMat);
  bubblesPoints.userData.isMapHidden = true;
  group.add(bubblesPoints);
  disposables.push(bubbleGeo, bubbleMat);

  // 6. Surface Return Buoy (Floating exit anchor in Coral Sanctuary)
  const buoyPos = new THREE.Vector3(0, -1.8, 33);
  const buoyGroup = new THREE.Group();
  buoyGroup.position.copy(buoyPos);
  const buoyGold = palette.getMat(0xfacc15, 'emissive');
  const buoyCyan = palette.getMat(0x22d3ee, 'emissive');
  const buoyBase = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.35, 0.7, lowDetail ? 8 : 12), buoyGold);
  const buoyBeacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), buoyCyan);
  buoyBeacon.position.y = 1.15;
  const chainDepth = Math.abs(getOceanFloorY(0, 33) - buoyPos.y);
  const anchorChain = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, chainDepth, 6),
    mossStoneMat,
  );
  anchorChain.position.y = -chainDepth * 0.5;
  buoyGroup.add(buoyBase, buoyBeacon, anchorChain);
  buoyGroup.userData.oceanExit = true;
  group.add(buoyGroup);
  clickables.push(buoyGroup);
  colliders.push({
    x: 0,
    z: 33,
    minY: buoyPos.y - 0.4,
    maxY: buoyPos.y + 1.4,
    halfW: 1.25,
    halfD: 1.25,
    isSphere: true,
    radius: 1.25,
  });

  // 7. Four Underwater O₂ Air Bubble Vents (refill oxygen in reefs & trench!)
  const airVents: OceanAirVent[] = [];
  const ventCoords: Array<[number, number]> = [
    [-8, 22],
    [14, 10],
    [-12, -10],
    [9, -25],
  ];
  const ventStoneMat = palette.getMat(0x334155, 'matte');
  const ventGlowMat = palette.createSurfaceMat({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.4,
    roughness: 0.2,
  });
  disposables.push(ventGlowMat);
  ventCoords.forEach(([vx, vz], idx) => {
    const vy = getOceanFloorY(vx, vz);
    const vGroup = new THREE.Group();
    vGroup.position.set(vx, vy, vz);
    const crater = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.4, 0.8, 7), ventStoneMat);
    crater.position.y = 0.4;
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.2, 7), ventGlowMat);
    core.position.y = 0.82;
    vGroup.add(crater, core);

    const rings: THREE.Mesh[] = [];
    const ringCount = lowDetail ? 2 : 3;
    for (let r = 0; r < ringCount; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.55 + r * 0.15, 0.08, 5, lowDetail ? 9 : 12),
        ventGlowMat,
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 1.2 + r * 1.4;
      vGroup.add(ring);
      rings.push(ring);
    }
    group.add(vGroup);
    airVents.push({ id: `vent_${idx}`, x: vx, y: vy, z: vz, group: vGroup, rings });
    colliders.push({
      x: vx,
      z: vz,
      minY: vy - 0.3,
      maxY: vy + 0.9,
      halfW: 1.35,
      halfD: 1.35,
      isSphere: true,
      radius: 1.35,
    });
  });

  // 8. Two Sunken Supply Chests (Snorkel in Temple Ruins & Twilight Reef Cache)
  const chests: OceanSupplyChest[] = [];
  const chestWoodMat = palette.getMat(0x92400e, 'matte');
  const chestGoldMat = palette.getMat(0xfbbf24, 'metal');
  const chestDefs: Array<{
    id: string;
    label: string;
    x: number;
    z: number;
    rewardGear?: DivingGearId;
    rewardMaterials: Partial<OceanMaterials>;
  }> = [
    {
      id: 'chest_temple_snorkel',
      label: 'Peti Harta Kuil (Snorkel & Bahan Selam)',
      x: -14,
      z: 12,
      rewardGear: 'snorkel',
      rewardMaterials: { fiber: 3, calcium: 2, pearl: 1 },
    },
    {
      id: 'chest_twilight_cache',
      label: 'Peti Gua Terumbu Senja (Mutiara & Sirip)',
      x: 18,
      z: -14,
      rewardGear: 'fins_torch',
      rewardMaterials: { pearl: 2, shell: 2, fiber: 3, food: 2 },
    },
  ];
  chestDefs.forEach((cd) => {
    const cy = getOceanFloorY(cd.x, cd.z);
    const cGroup = new THREE.Group();
    cGroup.position.set(cd.x, cy, cd.z);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.72, 1.05), chestWoodMat);
    base.position.y = 0.36;
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.16, 1.1), chestGoldMat);
    band.position.y = 0.66;
    const lid = new THREE.Group();
    lid.position.set(0, 0.72, -0.5);
    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.42, 1.05), chestWoodMat);
    lidMesh.position.set(0, 0.21, 0.5);
    const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.14), chestGoldMat);
    clasp.position.set(0, 0.08, 1.04);
    lid.add(lidMesh, clasp);
    const beacon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.32, 0),
      palette.getMat(0xfacc15, 'emissive'),
    );
    beacon.position.y = 1.95;
    cGroup.add(base, band, lid, beacon);
    cGroup.userData.oceanChestId = cd.id;
    group.add(cGroup);
    clickables.push(cGroup);
    chests.push({
      id: cd.id,
      label: cd.label,
      x: cd.x,
      y: cy,
      z: cd.z,
      rewardGear: cd.rewardGear,
      rewardMaterials: cd.rewardMaterials,
      opened: false,
      group: cGroup,
      lid,
      beacon,
    });
    colliders.push({
      x: cd.x,
      z: cd.z,
      minY: cy - 0.3,
      maxY: cy + 1.15,
      halfW: 0.78,
      halfD: 0.55,
    });
  });

  // 9. Populate 100% of ALL 20 Sea Biota Species naturally across Sanctuary & Twilight Reef!
  const biotaNodes: OceanBiotaNode[] = [];
  let bSeq = 0;

  const placeBiota = (
    speciesId: SeaBiotaId,
    x: number,
    z: number,
    opts?: {
      yOffset?: number;
      patrolMode?: OceanBiotaNode['patrolMode'];
      patrolRadius?: number;
      patrolSpeed?: number;
      scale?: number;
      yaw?: number;
    },
  ) => {
    const rig = createSeaBiotaMesh(speciesId, palette);
    const floorY = getOceanFloorY(x, z);
    const y = floorY + (opts?.yOffset ?? 0);
    const scale = opts?.scale ?? 1.0;
    rig.root.position.set(x, y, z);
    rig.root.scale.setScalar(scale);
    if (opts?.yaw !== undefined) {
      rig.root.rotation.y = opts.yaw;
    }
    const nodeId = `biota_${speciesId}_${bSeq++}`;
    rig.root.userData.oceanBiotaSpecies = speciesId;
    rig.root.userData.biotaNodeId = nodeId;
    if ((opts?.patrolMode ?? 'static') === 'static' && rig.parts.length === 0) {
      freezeSubtreeMatrices(rig.root);
    }
    group.add(rig.root);
    clickables.push(rig.root);
    biotaNodes.push({
      id: nodeId,
      speciesId,
      rig,
      x,
      y,
      z,
      homeX: x,
      homeY: y,
      homeZ: z,
      phase: bSeq * 1.13,
      patrolMode: opts?.patrolMode ?? 'static',
      patrolRadius: opts?.patrolRadius ?? 0,
      patrolSpeed: opts?.patrolSpeed ?? 0.65,
      harvestCooldown: 0,
      scale,
      lastDimScale: scale,
    });
  };

  const pickList = <T>(items: T[], mobileMax: number): T[] =>
    lowDetail ? items.slice(0, Math.min(items.length, mobileMax)) : items;

  // Foreground Coral Garden & Reef Terraces (guaranteed peaceful & colorful start!)
  // #1 Brain Coral
  pickList([[-6, 22, 1.15], [7, 17, 1.05], [-18, 16, 1.25], [2, 6, 1.1], [-10, -1, 1.0]], 3).forEach(
    ([x, z, sc]) => placeBiota('brain_coral', x, z, { scale: sc }),
  );
  // #2 Fire Coral (DAMAGE: +2 sting if brushed right up against it)
  pickList([[-19, 20, 1.1], [15, 22, 1.15], [-3, 10, 1.05], [12, -2, 1.2]], 2).forEach(([x, z, sc]) =>
    placeBiota('fire_coral', x, z, { scale: sc }),
  );
  // #3 Blue Staghorn (Calcium yield)
  pickList([[5, 25, 1.1], [-12, 18, 1.15], [18, 13, 1.2], [-6, 4, 1.15], [10, -10, 1.1]], 3).forEach(
    ([x, z, sc]) => placeBiota('blue_staghorn', x, z, { scale: sc }),
  );
  // #4 Sea Anemone
  pickList([[4, 21, 1.05], [-8, 15, 1.1], [9, 14, 1.0], [-16, 4, 1.15]], 2).forEach(([x, z, sc]) =>
    placeBiota('sea_anemone', x, z, { scale: sc }),
  );
  // #5 Giant Kelp Forests (tall emerald pillars framing Sanctuary & Reef edge)
  pickList([
    [-11, 6, 1.35],
    [-9, 3, 1.5],
    [-14, 1, 1.4],
    [13, 6, 1.35],
    [16, 2, 1.45],
    [11, -3, 1.3],
    [-22, 12, 1.25],
    [22, 16, 1.25],
  ], 4).forEach(([x, z, sc]) => placeBiota('giant_kelp', x, z, { scale: sc }));
  // #6 Seagrass beds
  pickList([
    [-3, 24, 1.1],
    [8, 22, 1.1],
    [-15, 23, 1.05],
    [15, 18, 1.15],
    [-2, 12, 1.05],
    [6, 1, 1.1],
    [-18, -3, 1.1],
  ], 3).forEach(([x, z, sc]) => placeBiota('seagrass', x, z, { scale: sc }));
  // #7 Bioluminescent Algae (lights up Twilight Slope & Cave Ruins!)
  pickList([
    [-8, -5, 1.2],
    [7, -8, 1.25],
    [-16, -12, 1.3],
    [14, -15, 1.25],
    [-3, -17, 1.3],
    [20, -18, 1.2],
  ], 3).forEach(([x, z, sc]) => placeBiota('bioluminescent_algae', x, z, { scale: sc }));
  // #8 Sea Fan
  pickList([[11, 20, 1.15], [-17, 14, 1.1], [3, 13, 1.1], [-12, 0, 1.2], [17, -6, 1.15]], 3).forEach(
    ([x, z, sc]) => placeBiota('sea_fan', x, z, { scale: sc, yaw: x * 0.2 }),
  );
  // #9 Tiger Cowrie (Shell)
  pickList([[-5, 26, 1.05], [10, 24, 1.0], [-11, 12, 1.1], [14, 4, 1.05]], 2).forEach(([x, z, sc]) =>
    placeBiota('tiger_cowrie', x, z, { scale: sc, yaw: z * 0.4 }),
  );
  // #10 Giant Clam (Pearl yield!)
  pickList([[-4, 19, 1.15], [12, 15, 1.2], [-18, 7, 1.25], [4, -4, 1.2], [-14, -15, 1.25]], 3).forEach(
    ([x, z, sc]) => placeBiota('giant_clam', x, z, { scale: sc, yaw: x * 0.15 }),
  );
  // #11 Clownfish (Cute schools swimming around anemones right where player spawns!)
  pickList([
    [3, 21, 3.2],
    [5, 22, 3.8],
    [-7, 16, 3.4],
    [-9, 15, 4.1],
    [8, 14, 3.5],
    [-15, 5, 3.6],
  ], 3).forEach(([x, z, yOff]) =>
    placeBiota('clownfish', x, z, {
      yOffset: yOff,
      patrolMode: 'swim',
      patrolRadius: 3.0,
      patrolSpeed: 0.9,
      scale: 1.05,
    }),
  );
  // #12 Blue Tang (Cute Dory-blue school gliding above the reef!)
  pickList([
    [-2, 23, 3.6],
    [6, 18, 4.2],
    [-12, 9, 4.5],
    [11, 8, 4.0],
    [0, 3, 4.4],
  ], 3).forEach(([x, z, yOff]) =>
    placeBiota('blue_tang', x, z, {
      yOffset: yOff,
      patrolMode: 'swim',
      patrolRadius: 4.5,
      patrolSpeed: 1.0,
      scale: 1.05,
    }),
  );
  // #13 Sea Turtle (RARE, MOUNT: Yes, gracefully swimming in Foreground Sanctuary!)
  pickList([
    [-3, 18, 4.4],
    [9, 11, 4.8],
    [-11, -3, 5.2],
  ], 2).forEach(([x, z, yOff]) =>
    placeBiota('sea_turtle', x, z, {
      yOffset: yOff,
      patrolMode: 'swim',
      patrolRadius: 6.5,
      patrolSpeed: 0.42,
      scale: 1.2,
    }),
  );
  // #14 Spotted Stingray (Gliding gracefully over sandy reef & twilight slope)
  pickList([
    [7, 19, 2.2],
    [-13, 3, 2.6],
    [4, -8, 2.8],
  ], 2).forEach(([x, z, yOff]) =>
    placeBiota('spotted_stingray', x, z, {
      yOffset: yOff,
      patrolMode: 'swim',
      patrolRadius: 6.0,
      patrolSpeed: 0.48,
      scale: 1.1,
    }),
  );
  // #15 Yellow Seahorse (Bobbing gently near Seagrass & Kelp)
  pickList([
    [-2, 24, 1.5],
    [9, 21, 1.6],
    [-13, 8, 1.8],
    [13, 3, 1.7],
  ], 2).forEach(([x, z, yOff]) =>
    placeBiota('yellow_seahorse', x, z, {
      yOffset: yOff,
      patrolMode: 'hover',
      patrolRadius: 0.8,
      patrolSpeed: 0.7,
      scale: 1.1,
    }),
  );
  // #16 Chameleon Octopus (RARE)
  pickList([
    [-15, 11, 0.25],
    [15, -7, 0.25],
    [-6, -14, 0.25],
  ], 2).forEach(([x, z, yOff]) =>
    placeBiota('chameleon_octopus', x, z, {
      yOffset: yOff,
      patrolMode: 'crawl',
      patrolRadius: 2.0,
      patrolSpeed: 0.35,
      scale: 1.15,
    }),
  );
  // #17 Spiny Lobster (Food yield)
  pickList([
    [-12, 13, 0.05],
    [11, 7, 0.05],
    [-9, -8, 0.05],
    [12, -13, 0.05],
  ], 2).forEach(([x, z, yOff]) =>
    placeBiota('spiny_lobster', x, z, {
      yOffset: yOff,
      patrolMode: 'crawl',
      patrolRadius: 1.8,
      patrolSpeed: 0.45,
      scale: 1.05,
    }),
  );
  // #18 Box Crab (Food yield)
  pickList([
    [2, 24, 0.05],
    [-7, 20, 0.05],
    [14, 16, 0.05],
    [-4, 5, 0.05],
  ], 2).forEach(([x, z, yOff]) =>
    placeBiota('box_crab', x, z, {
      yOffset: yOff,
      patrolMode: 'crawl',
      patrolRadius: 2.2,
      patrolSpeed: 0.55,
      scale: 1.0,
    }),
  );
  // #19 Starfish (Shell yield)
  pickList([
    [-1, 25, 0.04],
    [6, 23, 0.04],
    [-9, 17, 0.04],
    [12, 11, 0.04],
    [-5, 2, 0.04],
  ], 3).forEach(([x, z, yOff]) =>
    placeBiota('starfish', x, z, { yOffset: yOff, scale: 1.05, yaw: x * 0.4 }),
  );
  // #20 Glowing Jellyfish (RARE, LIGHT: 8m, floating softly across Reef & Twilight Slope)
  pickList([
    [-16, 19, 5.2],
    [8, 9, 5.8],
    [-4, -6, 6.2],
    [12, -11, 6.0],
    [-14, -18, 6.6],
    [2, -21, 6.4],
  ], 3).forEach(([x, z, yOff]) =>
    placeBiota('glowing_jellyfish', x, z, {
      yOffset: yOff,
      patrolMode: 'hover',
      patrolRadius: 2.2,
      patrolSpeed: 0.35,
      scale: 1.2,
    }),
  );

  // Sanity guard: verify all 20 species exist
  for (const spec of SEA_BIOTA_CATALOG) {
    if (!biotaNodes.some((n) => n.speciesId === spec.id)) {
      placeBiota(spec.id, 0, 20, { yOffset: 1 });
    }
  }

  // 9b. Scattered Underwater Hearts (❤️), Diamonds (💎), and Weapons across Reef & Abyssal Trench
  const addOceanPickup = (
    id: string,
    kind: OceanPickup['kind'],
    x: number,
    z: number,
    yOff: number,
    weaponId?: WeaponId,
  ) => {
    const floorY = getOceanFloorY(x, z);
    const y = THREE.MathUtils.clamp(floorY + yOff, floorY + 0.9, -1.6);
    const mesh = createOceanPickupMesh(kind, weaponId, palette, disposables);
    mesh.position.set(x, y, z);
    mesh.userData.oceanPickupId = id;
    group.add(mesh);
    pickups.push({
      id,
      kind,
      weaponId,
      label:
        kind === 'heart'
          ? 'Nyawa Bawah Laut (❤️)'
          : kind === 'diamond'
          ? 'Berlian Bawah Laut (💎)'
          : `${OCEAN_WEAPON_LABELS[weaponId ?? 'emas']} (+Ammo)`,
      x,
      y,
      z,
      phase: pickups.length * 1.17,
      active: true,
      respawnTimer: 0,
      mesh,
    });
  };

  // Hearts (❤️)
  [
    [-9, 25, 2.2],
    [10, 22, 2.5],
    [-18, 9, 2.2],
    [16, 4, 2.8],
    [-8, -11, 2.6],
    [11, -15, 2.8],
    [-12, -29, 3.0],
    [10, -37, 3.2],
  ].forEach(([px, pz, pyOff], i) => addOceanPickup(`oc_heart_${i}`, 'heart', px, pz, pyOff));

  // Diamonds (💎)
  [
    [-14, 15, 2.3],
    [6, 20, 2.4],
    [-20, 4, 2.4],
    [17, 15, 2.5],
    [-4, -6, 2.6],
    [13, -10, 2.6],
    [-15, -22, 3.0],
    [5, -27, 2.8],
    [-11, -41, 3.2],
    [12, -41, 3.2],
  ].forEach(([px, pz, pyOff], i) => addOceanPickup(`oc_dia_${i}`, 'diamond', px, pz, pyOff));

  // Weapons (Senjata Bawah Laut)
  const oceanWeaponSpots: Array<[WeaponId, number, number, number]> = [
    ['emas', -14, 7, 2.2],
    ['saus', 14, 17, 2.4],
    ['biji', -19, -5, 2.6],
    ['kertas', 15, -18, 2.8],
    ['jarum', -6, -28, 3.0],
    ['kristal', 4, -39, 3.2],
  ];
  oceanWeaponSpots.forEach(([wid, wx, wz, wyOff], i) =>
    addOceanPickup(`oc_wp_${i}_${wid}`, 'weapon', wx, wz, wyOff, wid),
  );

  // 10. Hero Underwater Torch Light & Reef Bioluminescence Accent Light (<= 2 dynamic lights)
  const torchLight = new THREE.PointLight(0x7dd3fc, 1.4, 24, 1.4);
  torchLight.position.set(0, -4, 26);
  group.add(torchLight);

  const reefGlowLight = new THREE.PointLight(0x22d3ee, 1.6, 36, 1.2);
  reefGlowLight.position.set(0, -6, -8);
  group.add(reefGlowLight);

  return {
    group,
    surfaceMesh,
    sunbeams,
    bubblesPoints,
    buoyGroup,
    buoyPos,
    torchLight,
    reefGlowLight,
    biotaNodes,
    airVents,
    chests,
    colliders,
    pickups,
    clickables,
    disposables,
  };
}

function updateAndSeparateOceanBiota(
  biotaNodes: OceanBiotaNode[],
  colliders: OceanSolidCollider[],
  sampleFloorY: (x: number, z: number) => number,
  dt: number,
  elapsed: number,
  heroPos: THREE.Vector3,
  ridingTurtle: boolean,
  maxDistSq: number,
  isArchipelago = false,
): void {
  const heroRad = 0.68;
  let mountedTurtleIdx = -1;
  if (ridingTurtle) {
    let bestSq = 64;
    for (let i = 0; i < biotaNodes.length; i++) {
      const n = biotaNodes[i];
      if (n.speciesId !== 'sea_turtle') continue;
      const dSq =
        (n.x - heroPos.x) * (n.x - heroPos.x) + (n.z - heroPos.z) * (n.z - heroPos.z);
      if (dSq < bestSq) {
        bestSq = dSq;
        mountedTurtleIdx = i;
      }
    }
  }
  // Pass 1: Patrol & obstacle avoidance
  for (let i = 0; i < biotaNodes.length; i++) {
    const node = biotaNodes[i];
    if (node.harvestCooldown > 0) {
      node.harvestCooldown = Math.max(0, node.harvestCooldown - dt);
    }
    if (i === mountedTurtleIdx) {
      node.rig.root.visible = false;
      node.x = heroPos.x;
      node.y = Math.min(-1.25, heroPos.y);
      node.z = heroPos.z;
      continue;
    }
    const dxH = node.x - heroPos.x;
    const dzH = node.z - heroPos.z;
    const distSqXZ = dxH * dxH + dzH * dzH;
    if (isArchipelago) {
      const visible = distSqXZ <= maxDistSq;
      node.rig.root.visible = visible;
      if (!visible) continue;
    } else {
      node.rig.root.visible = true;
      if (distSqXZ + (node.y - heroPos.y) * (node.y - heroPos.y) > maxDistSq) {
        continue;
      }
    }

    const nextScale = node.scale * (node.harvestCooldown > 0 ? 0.76 : 1.0);
    if (node.lastDimScale !== nextScale) {
      node.rig.root.scale.setScalar(nextScale);
      node.lastDimScale = nextScale;
    }

    node.repelX = (node.repelX ?? 0) * Math.exp(-5.0 * dt);
    node.repelZ = (node.repelZ ?? 0) * Math.exp(-5.0 * dt);

    if (node.patrolMode === 'swim') {
      const t = elapsed * node.patrolSpeed + node.phase;
      const baseNx = node.homeX + Math.cos(t) * node.patrolRadius;
      const baseNz = node.homeZ + Math.sin(t * 0.8) * (node.patrolRadius * 0.75);
      const nx = baseNx + node.repelX;
      const nz = baseNz + node.repelZ;
      const minY = sampleFloorY(nx, nz) + 0.65;
      const rawNy = node.homeY + Math.sin(elapsed * 1.6 + node.phase) * 0.35;
      const ny = Math.max(minY, isArchipelago ? Math.min(-1.25, rawNy) : Math.min(-1.05, rawNy));
      const tmp = { x: nx, y: ny, z: nz };
      const rad = getSeaBiotaSolidRadius(node.speciesId, node.scale);
      if (resolveOceanSolidCollisions(tmp, colliders, rad, 0.9)) {
        node.repelX += tmp.x - nx;
        node.repelZ += tmp.z - nz;
      }
      const dx = tmp.x - node.x;
      const dz = tmp.z - node.z;
      if (Math.hypot(dx, dz) > 0.002) {
        node.rig.root.rotation.y = Math.atan2(dx, dz);
      }
      node.x = tmp.x;
      node.y = tmp.y;
      node.z = tmp.z;
      node.rig.root.position.set(tmp.x, tmp.y, tmp.z);
    } else if (node.patrolMode === 'hover') {
      const t = elapsed * node.patrolSpeed + node.phase;
      const nx = node.homeX + Math.cos(t) * node.patrolRadius * 0.5 + node.repelX;
      const nz = node.homeZ + Math.sin(t) * node.patrolRadius * 0.5 + node.repelZ;
      const minY = sampleFloorY(nx, nz) + 0.55;
      const rawNy = node.homeY + Math.sin(elapsed * 1.3 + node.phase) * 0.55;
      const ny = Math.max(minY, isArchipelago ? Math.min(-1.25, rawNy) : Math.min(-1.05, rawNy));
      const tmp = { x: nx, y: ny, z: nz };
      const rad = getSeaBiotaSolidRadius(node.speciesId, node.scale);
      if (resolveOceanSolidCollisions(tmp, colliders, rad, 0.9)) {
        node.repelX += tmp.x - nx;
        node.repelZ += tmp.z - nz;
      }
      node.x = tmp.x;
      node.y = tmp.y;
      node.z = tmp.z;
      node.rig.root.position.set(tmp.x, tmp.y, tmp.z);
    } else if (node.patrolMode === 'crawl') {
      const t = elapsed * node.patrolSpeed + node.phase;
      const nx = node.homeX + Math.cos(t) * node.patrolRadius + node.repelX;
      const nz = node.homeZ + Math.sin(t * 1.1) * (node.patrolRadius * 0.65) + node.repelZ;
      const ny = sampleFloorY(nx, nz) + 0.05;
      const tmp = { x: nx, y: ny, z: nz };
      const rad = getSeaBiotaSolidRadius(node.speciesId, node.scale);
      if (resolveOceanSolidCollisions(tmp, colliders, rad, 0.7)) {
        node.repelX += tmp.x - nx;
        node.repelZ += tmp.z - nz;
      }
      const dx = tmp.x - node.x;
      const dz = tmp.z - node.z;
      if (Math.hypot(dx, dz) > 0.002) {
        node.rig.root.rotation.y = Math.atan2(dx, dz);
      }
      node.x = tmp.x;
      node.y = sampleFloorY(tmp.x, tmp.z) + 0.05;
      node.z = tmp.z;
      node.rig.root.position.set(node.x, node.y, node.z);
    }
  }

  // Pass 2: Prevent fish/creatures from passing through each other or corals
  for (let i = 0; i < biotaNodes.length; i++) {
    const a = biotaNodes[i];
    if (isArchipelago && !a.rig.root.visible) continue;
    const radA = getSeaBiotaSolidRadius(a.speciesId, a.scale);
    for (let j = i + 1; j < biotaNodes.length; j++) {
      const b = biotaNodes[j];
      if (a.patrolMode === 'static' && b.patrolMode === 'static') continue;
      if (isArchipelago && !b.rig.root.visible) continue;
      if (Math.abs(a.y - b.y) > 1.35) continue;
      const radB = getSeaBiotaSolidRadius(b.speciesId, b.scale);
      const minD = radA + radB;
      const dx = a.x - b.x;
      const dz = a.z - b.z;
      const distSq = dx * dx + dz * dz;
      if (distSq >= minD * minD) continue;
      const d = distSq > 0.0001 ? Math.sqrt(distSq) : 0.01;
      const nx = distSq > 0.0001 ? dx / d : 1;
      const nz = distSq > 0.0001 ? dz / d : 0;
      const push = minD - d;
      if (a.patrolMode !== 'static' && b.patrolMode === 'static') {
        a.x += nx * push;
        a.z += nz * push;
        a.repelX = (a.repelX ?? 0) + nx * push;
        a.repelZ = (a.repelZ ?? 0) + nz * push;
        a.rig.root.position.set(a.x, a.y, a.z);
      } else if (b.patrolMode !== 'static' && a.patrolMode === 'static') {
        b.x -= nx * push;
        b.z -= nz * push;
        b.repelX = (b.repelX ?? 0) - nx * push;
        b.repelZ = (b.repelZ ?? 0) - nz * push;
        b.rig.root.position.set(b.x, b.y, b.z);
      } else {
        const half = push * 0.5;
        a.x += nx * half;
        a.z += nz * half;
        a.repelX = (a.repelX ?? 0) + nx * half;
        a.repelZ = (a.repelZ ?? 0) + nz * half;
        b.x -= nx * half;
        b.z -= nz * half;
        b.repelX = (b.repelX ?? 0) - nx * half;
        b.repelZ = (b.repelZ ?? 0) - nz * half;
        a.rig.root.position.set(a.x, a.y, a.z);
        b.rig.root.position.set(b.x, b.y, b.z);
      }
    }
  }

  // Pass 3: Solid separation between Hero and all fish/biota (so character & fish never clip)
  for (let i = 0; i < biotaNodes.length; i++) {
    const node = biotaNodes[i];
    if (isArchipelago && !node.rig.root.visible) continue;
    if (ridingTurtle && node.speciesId === 'sea_turtle') continue;
    const nodeH =
      node.speciesId === 'giant_kelp'
        ? 4.6 * node.scale
        : node.speciesId === 'starfish'
        ? 0.42
        : 1.45 * node.scale;
    const heroCenterY = heroPos.y + 0.9;
    if (heroCenterY + 1.05 < node.y - 0.35 || heroCenterY - 0.95 > node.y + nodeH) continue;
    const minD = heroRad + getSeaBiotaSolidRadius(node.speciesId, node.scale);
    const dx = heroPos.x - node.x;
    const dz = heroPos.z - node.z;
    const distSq = dx * dx + dz * dz;
    if (distSq >= minD * minD) continue;
    const d = distSq > 0.0001 ? Math.sqrt(distSq) : 0.01;
    const nx = distSq > 0.0001 ? dx / d : 1;
    const nz = distSq > 0.0001 ? dz / d : 0;
    const push = minD - d;
    if (node.patrolMode === 'static') {
      heroPos.x += nx * push;
      heroPos.z += nz * push;
    } else {
      // Push hero 55% and deflect fish/creature 45% so both bounce apart naturally
      heroPos.x += nx * push * 0.55;
      heroPos.z += nz * push * 0.55;
      node.x -= nx * push * 0.45;
      node.z -= nz * push * 0.45;
      node.repelX = (node.repelX ?? 0) - nx * push * 0.45;
      node.repelZ = (node.repelZ ?? 0) - nz * push * 0.45;
      node.rig.root.position.set(node.x, node.y, node.z);
    }
  }

  // Animate visual rigs after final positions
  for (let i = 0; i < biotaNodes.length; i++) {
    const node = biotaNodes[i];
    if (isArchipelago) {
      if (!node.rig.root.visible) continue;
    } else {
      const dxH = node.x - heroPos.x;
      const dyH = node.y - heroPos.y;
      const dzH = node.z - heroPos.z;
      if (dxH * dxH + dyH * dyH + dzH * dzH > maxDistSq) continue;
    }
    animateSeaBiotaRig(node.rig, elapsed, node.phase);
  }
}

export function updateOceanWorld(
  rig: OceanWorldRig,
  dt: number,
  elapsed: number,
  heroPos: THREE.Vector3,
  heroYaw: number,
  ownedGear: Set<DivingGearId>,
  lowDetail = false,
  ridingTurtle = false,
): void {
  // Subtle surface ripple & sunbeam sway
  rig.surfaceMesh.position.y = Math.sin(elapsed * 1.4) * 0.08;
  rig.sunbeams.forEach((b, idx) => {
    b.rotation.z = 0.22 + Math.sin(elapsed * 0.7 + idx * 1.1) * 0.05;
  });

  // Animate rising bubbles (throttle GPU buffer upload on lowDetail)
  const bubbleTick = Math.floor(elapsed * 20);
  if (!lowDetail || (bubbleTick & 1) === 0) {
    const posAttr = rig.bubblesPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const stepDt = lowDetail ? dt * 1.9 : dt;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] += stepDt * (1.8 + (i % 5) * 0.35);
      arr[i] += Math.sin(elapsed * 2.2 + i) * stepDt * 0.22;
      if (arr[i + 1] > -0.35) {
        arr[i + 1] = -26 + Math.random() * 4;
      }
    }
    posAttr.needsUpdate = true;
  }

  // Surface Return Buoy gentle bob & spin
  rig.buoyGroup.position.y = rig.buoyPos.y + Math.sin(elapsed * 2.2) * 0.2;
  rig.buoyGroup.rotation.y += dt * 0.9;

  // Air Vents rising rings
  for (const vent of rig.airVents) {
    const ventDistSq =
      (vent.x - heroPos.x) * (vent.x - heroPos.x) +
      (vent.z - heroPos.z) * (vent.z - heroPos.z);
    if (lowDetail && ventDistSq > 46 * 46) continue;
    vent.rings.forEach((ring, idx) => {
      const cycle = ((elapsed * 0.75 + idx * 0.33) % 1);
      ring.position.y = 1.0 + cycle * 4.5;
      const sc = 0.8 + cycle * 0.55;
      ring.scale.setScalar(sc);
    });
  }

  // Unopened chests beacon spin & open lid interpolation
  for (const ch of rig.chests) {
    if (!ch.opened) {
      ch.beacon.visible = true;
      ch.beacon.rotation.y += dt * 2.1;
      ch.beacon.position.y = 1.9 + Math.sin(elapsed * 3.0 + ch.x) * 0.22;
    } else {
      ch.beacon.visible = false;
      ch.lid.rotation.x = THREE.MathUtils.damp(ch.lid.rotation.x, -1.25, 10, dt);
    }
  }

  // Hero underwater torch light intensity scales with Fins & Abyssal Torch gear
  const hasTorch = ownedGear.has('fins_torch');
  const hasMask = ownedGear.has('snorkel') || ownedGear.has('wetsuit_tank');
  rig.torchLight.intensity = hasTorch ? 5.2 : hasMask ? 2.2 : 1.0;
  rig.torchLight.distance = hasTorch ? 34 : 20;
  rig.torchLight.color.setHex(hasTorch ? 0xfef08a : 0x67e8f9);
  rig.torchLight.position.set(
    heroPos.x + Math.sin(heroYaw) * 1.4,
    heroPos.y + 1.8,
    heroPos.z + Math.cos(heroYaw) * 1.4,
  );

  // Animate pickups (bob + spin + respawn)
  for (const pk of rig.pickups) {
    if (!pk.active) {
      pk.mesh.visible = false;
      pk.respawnTimer -= dt;
      if (pk.respawnTimer <= 0) {
        pk.active = true;
        pk.mesh.visible = true;
      }
      continue;
    }
    pk.mesh.visible = true;
    pk.mesh.position.y = pk.y + Math.sin(elapsed * 2.6 + pk.phase) * 0.24;
    pk.mesh.rotation.y += dt * 1.8;
  }

  // Separate & animate all 20 Sea Biota species
  const cullDistSq = lowDetail ? 40 * 40 : 68 * 68;
  updateAndSeparateOceanBiota(
    rig.biotaNodes,
    rig.colliders,
    getOceanFloorY,
    dt,
    elapsed,
    heroPos,
    ridingTurtle,
    cullDistSq,
    false,
  );
}

export function getArchipelagoOceanZoneInfo(y: number): {
  kind: 'sanctuary' | 'twilight' | 'abyss';
  label: string;
} {
  if (y <= -16.0) {
    return { kind: 'abyss', label: 'Palung Abyssal' };
  }
  if (y <= -7.2) {
    return { kind: 'twilight', label: 'Terumbu Senja' };
  }
  return { kind: 'sanctuary', label: 'Taman Karang Dangkal' };
}

export interface ArchipelagoUnderwaterRig {
  group: THREE.Group;
  sunbeams: THREE.Mesh[];
  bubblesPoints: THREE.Points;
  torchLight: THREE.PointLight;
  biotaNodes: OceanBiotaNode[];
  airVents: OceanAirVent[];
  chests: OceanSupplyChest[];
  colliders: OceanSolidCollider[];
  pickups: OceanPickup[];
  dynamicNodes: THREE.Object3D[];
  clickables: THREE.Object3D[];
  disposables: Array<{ dispose: () => void }>;
  sampleFloorY: (x: number, z: number) => number;
}

export function createArchipelagoUnderwaterProps(
  palette: MaterialPalette,
  isWaterSpot: (x: number, z: number) => boolean,
  sampleFloorY: (x: number, z: number) => number,
  lowDetail = false,
): ArchipelagoUnderwaterRig {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];
  const clickables: THREE.Object3D[] = [];
  const dynamicNodes: THREE.Object3D[] = [];
  const colliders: OceanSolidCollider[] = [];
  const pickups: OceanPickup[] = [];

  const nudgeToWater = (x: number, z: number): [number, number] => {
    if (isWaterSpot(x, z)) return [x, z];
    for (let r = 4; r <= 28; r += 4) {
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        const nx = Math.round((x + Math.cos(ang) * r) * 10) / 10;
        const nz = Math.round((z + Math.sin(ang) * r) * 10) / 10;
        if (isWaterSpot(nx, nz)) return [nx, nz];
      }
    }
    return [x, z];
  };

  // 1. Sunken Temple Ruins & Stone Arches across Inter-Island Straits
  const mossStoneMat = palette.getMat(0x475569, 'matte');
  const mossGreenMat = palette.getMat(0x15803d, 'matte');
  const tealReefMat = palette.getMat(0x0f766e, 'matte');
  const ruinLocations: Array<[number, number, number]> = [
    [-26, 186, 0.42],
    [-68, 96, -0.35],
    [62, 108, 0.78],
    [-64, -64, 0.18],
  ];
  ruinLocations.forEach(([rxRaw, rzRaw, rotY]) => {
    const [rx, rz] = nudgeToWater(rxRaw, rzRaw);
    const ry = sampleFloorY(rx, rz);
    const ruins = new THREE.Group();
    ruins.position.set(rx, ry, rz);
    ruins.rotation.y = rotY;
    const colL = makeVoxelBox(1.4, 5.2, 1.4, mossStoneMat, -2.4, 2.5, 0);
    const colR = makeVoxelBox(1.4, 5.2, 1.4, mossStoneMat, 2.4, 2.5, 0);
    const lintel = makeVoxelBox(7.0, 1.2, 1.6, mossStoneMat, 0, 5.5, 0);
    const lintelTop = makeVoxelBox(5.6, 0.8, 1.3, mossGreenMat, 0, 6.3, 0);
    const stepBase = makeVoxelBox(8.0, 0.7, 3.8, tealReefMat, 0, 0.25, 0);
    ruins.add(colL, colR, lintel, lintelTop, stepBase);
    ruins.updateMatrixWorld(true);
    freezeSubtreeMatrices(ruins);
    ruins.matrixAutoUpdate = false;
    group.add(ruins);

    const cosR = Math.cos(rotY);
    const sinR = Math.sin(rotY);
    colliders.push(
      {
        x: rx + -2.4 * cosR,
        z: rz - -2.4 * sinR,
        minY: ry - 0.3,
        maxY: ry + 6.2,
        halfW: 0.78,
        halfD: 0.78,
        rotY,
      },
      {
        x: rx + 2.4 * cosR,
        z: rz - 2.4 * sinR,
        minY: ry - 0.3,
        maxY: ry + 6.2,
        halfW: 0.78,
        halfD: 0.78,
        rotY,
      },
      {
        x: rx,
        z: rz,
        minY: ry + 4.9,
        maxY: ry + 6.8,
        halfW: 3.6,
        halfD: 0.85,
        rotY,
      },
      {
        x: rx,
        z: rz,
        minY: ry - 0.6,
        maxY: ry + 0.65,
        halfW: 4.0,
        halfD: 1.9,
        rotY,
      },
    );
  });

  // 2. Hero-Following Volumetric Sunbeams & Rising Bubbles (hidden on dry land for zero FPS cost)
  const sunbeams: THREE.Mesh[] = [];
  const beamGeo = new THREE.ConeGeometry(5.2, 24, lowDetail ? 6 : 9, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  disposables.push(beamGeo, beamMat);

  const beamOffsets: Array<[number, number, number]> = lowDetail
    ? [
        [-10, -8.5, 8],
        [8, -9.2, -6],
        [0, -7.8, 12],
      ]
    : [
        [-12, -8.5, 10],
        [9, -9.0, 12],
        [-7, -10.5, -9],
        [13, -8.8, -7],
      ];
  beamOffsets.forEach(([ox, oy, oz], idx) => {
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(ox, oy, oz);
    beam.rotation.z = 0.2 + (idx % 2 === 0 ? 0.04 : -0.04);
    beam.rotation.x = -0.14;
    beam.userData.baseOffsetX = ox;
    beam.userData.baseOffsetY = oy;
    beam.userData.baseOffsetZ = oz;
    beam.userData.isMapHidden = true;
    beam.visible = false;
    group.add(beam);
    sunbeams.push(beam);
    dynamicNodes.push(beam);
  });

  const bubbleCount = lowDetail ? 75 : 180;
  const bubblePositions = new Float32Array(bubbleCount * 3);
  for (let i = 0; i < bubbleCount; i++) {
    bubblePositions[i * 3] = (Math.random() - 0.5) * 46;
    bubblePositions[i * 3 + 1] = -25 + Math.random() * 24;
    bubblePositions[i * 3 + 2] = (Math.random() - 0.5) * 46;
  }
  const bubbleGeo = new THREE.BufferGeometry();
  bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePositions, 3));
  const bubbleMat = new THREE.PointsMaterial({
    color: 0xe0f2fe,
    size: lowDetail ? 0.38 : 0.3,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  const bubblesPoints = new THREE.Points(bubbleGeo, bubbleMat);
  bubblesPoints.userData.isMapHidden = true;
  bubblesPoints.visible = false;
  group.add(bubblesPoints);
  dynamicNodes.push(bubblesPoints);
  disposables.push(bubbleGeo, bubbleMat);

  // 3. Underwater O₂ Air Bubble Vents across All Inter-Island Straits
  const airVents: OceanAirVent[] = [];
  const ventCoords: Array<[number, number]> = [
    [-10, 190], // Desa Sapaan South Reef
    [-42, 146], // Desa SW -> Pasar Rasa
    [-76, 86], // Pasar Rasa East Strait
    [42, 134], // Desa SE -> Hutan Satwa
    [74, 88], // Hutan Satwa West Lagoon
    [-84, -8], // Hub <-> Gerbang Kota
    [86, -2], // Hub <-> Menara Waktu
    [-46, -110], // Gerbang <-> Gua Portal
    [68, -118], // Menara <-> Gua Portal
    [-6, -54], // Citadel North Strait
  ];
  const ventStoneMat = palette.getMat(0x334155, 'matte');
  const ventGlowMat = palette.createSurfaceMat({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.4,
    roughness: 0.2,
  });
  disposables.push(ventGlowMat);
  ventCoords.forEach(([vxRaw, vzRaw], idx) => {
    const [vx, vz] = nudgeToWater(vxRaw, vzRaw);
    const vy = sampleFloorY(vx, vz);
    const vGroup = new THREE.Group();
    vGroup.position.set(vx, vy, vz);
    const crater = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.4, 0.8, 7), ventStoneMat);
    crater.position.y = 0.4;
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.2, 7), ventGlowMat);
    core.position.y = 0.82;
    vGroup.add(crater, core);

    const rings: THREE.Mesh[] = [];
    const ringCount = lowDetail ? 2 : 3;
    for (let r = 0; r < ringCount; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.55 + r * 0.15, 0.08, 5, lowDetail ? 9 : 12),
        ventGlowMat,
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 1.2 + r * 1.4;
      vGroup.add(ring);
      rings.push(ring);
      dynamicNodes.push(ring);
    }
    group.add(vGroup);
    dynamicNodes.push(vGroup);
    airVents.push({ id: `arch_vent_${idx}`, x: vx, y: vy, z: vz, group: vGroup, rings });
    colliders.push({
      x: vx,
      z: vz,
      minY: vy - 0.3,
      maxY: vy + 0.9,
      halfW: 1.35,
      halfD: 1.35,
      isSphere: true,
      radius: 1.35,
    });
  });

  // 4. Sunken Supply Chests (Snorkel near Desa South Reef & Twilight Cache toward Pasar)
  const chests: OceanSupplyChest[] = [];
  const chestWoodMat = palette.getMat(0x92400e, 'matte');
  const chestGoldMat = palette.getMat(0xfbbf24, 'metal');
  const chestDefs: Array<{
    id: string;
    label: string;
    x: number;
    z: number;
    rewardGear?: DivingGearId;
    rewardMaterials: Partial<OceanMaterials>;
  }> = [
    {
      id: 'chest_temple_snorkel',
      label: 'Peti Harta Kuil (Snorkel & Bahan Selam)',
      x: -22,
      z: 188,
      rewardGear: 'snorkel',
      rewardMaterials: { fiber: 3, calcium: 2, pearl: 1 },
    },
    {
      id: 'chest_twilight_cache',
      label: 'Peti Gua Terumbu Senja (Mutiara & Sirip)',
      x: -68,
      z: 96,
      rewardGear: 'fins_torch',
      rewardMaterials: { pearl: 2, shell: 2, fiber: 3, food: 2 },
    },
  ];
  chestDefs.forEach((cd) => {
    const [cx, cz] = nudgeToWater(cd.x, cd.z);
    const cy = sampleFloorY(cx, cz);
    const cGroup = new THREE.Group();
    cGroup.position.set(cx, cy, cz);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.72, 1.05), chestWoodMat);
    base.position.y = 0.36;
    const band = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.16, 1.1), chestGoldMat);
    band.position.y = 0.66;
    const lid = new THREE.Group();
    lid.position.set(0, 0.72, -0.5);
    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.42, 1.05), chestWoodMat);
    lidMesh.position.set(0, 0.21, 0.5);
    const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.14), chestGoldMat);
    clasp.position.set(0, 0.08, 1.04);
    lid.add(lidMesh, clasp);
    const beacon = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.32, 0),
      palette.getMat(0xfacc15, 'emissive'),
    );
    beacon.position.y = 1.95;
    cGroup.add(base, band, lid, beacon);
    cGroup.userData.oceanChestId = cd.id;
    group.add(cGroup);
    clickables.push(cGroup);
    dynamicNodes.push(cGroup, lid, beacon);
    chests.push({
      id: cd.id,
      label: cd.label,
      x: cx,
      y: cy,
      z: cz,
      rewardGear: cd.rewardGear,
      rewardMaterials: cd.rewardMaterials,
      opened: false,
      group: cGroup,
      lid,
      beacon,
    });
    colliders.push({
      x: cx,
      z: cz,
      minY: cy - 0.3,
      maxY: cy + 1.15,
      halfW: 0.78,
      halfD: 0.55,
    });
  });

  // 5. Populate All 20 Sea Biota Species Across Inter-Island Straits & Coastal Reefs
  const biotaNodes: OceanBiotaNode[] = [];
  let bSeq = 0;
  const placeArchBiota = (
    speciesId: SeaBiotaId,
    rawX: number,
    rawZ: number,
    opts?: {
      yOffset?: number;
      patrolMode?: OceanBiotaNode['patrolMode'];
      patrolRadius?: number;
      patrolSpeed?: number;
      scale?: number;
      yaw?: number;
    },
  ) => {
    const [x, z] = nudgeToWater(rawX, rawZ);
    const rig = createSeaBiotaMesh(speciesId, palette);
    const floorY = sampleFloorY(x, z);
    const maxYOffset = Math.max(0.15, Math.abs(floorY) - 1.35);
    const safeOffset = Math.min(opts?.yOffset ?? 0, maxYOffset);
    const y = floorY + safeOffset;
    const scale = opts?.scale ?? 1.0;
    const nodeId = `arch_biota_${speciesId}_${bSeq++}`;
    rig.root.position.set(x, y, z);
    rig.root.scale.setScalar(scale);
    if (opts?.yaw !== undefined) {
      rig.root.rotation.y = opts.yaw;
    }
    rig.root.userData.oceanBiotaSpecies = speciesId;
    rig.root.userData.biotaNodeId = nodeId;
    group.add(rig.root);
    clickables.push(rig.root);
    dynamicNodes.push(rig.root);
    biotaNodes.push({
      id: nodeId,
      speciesId,
      rig,
      x,
      y,
      z,
      homeX: x,
      homeY: y,
      homeZ: z,
      phase: bSeq * 1.13,
      patrolMode: opts?.patrolMode ?? 'static',
      patrolRadius: opts?.patrolRadius ?? 0,
      patrolSpeed: opts?.patrolSpeed ?? 0.65,
      harvestCooldown: 0,
      scale,
      lastDimScale: scale,
    });
  };

  const pickList = <T>(items: T[], mobileMax: number): T[] =>
    lowDetail ? items.slice(0, Math.min(items.length, mobileMax)) : items;

  // #1 Brain Coral
  pickList([[-16, 188, 1.2], [-56, 134, 1.15], [42, 148, 1.2], [-80, 74, 1.15], [76, 94, 1.15]], 3).forEach(
    ([x, z, sc]) => placeArchBiota('brain_coral', x, z, { scale: sc }),
  );
  // #2 Fire Coral
  pickList([[-34, 184, 1.15], [22, 192, 1.15], [-74, 62, 1.1], [72, 68, 1.2], [-76, -18, 1.15]], 3).forEach(
    ([x, z, sc]) => placeArchBiota('fire_coral', x, z, { scale: sc }),
  );
  // #3 Blue Staghorn
  pickList([[-4, 194, 1.15], [-52, 122, 1.2], [46, 124, 1.15], [-86, -4, 1.2], [86, -10, 1.15]], 3).forEach(
    ([x, z, sc]) => placeArchBiota('blue_staghorn', x, z, { scale: sc }),
  );
  // #4 Sea Anemone
  pickList([[4, 188, 1.1], [-28, 178, 1.15], [-66, 106, 1.05], [56, 114, 1.1], [-22, -96, 1.1]], 3).forEach(
    ([x, z, sc]) => placeArchBiota('sea_anemone', x, z, { scale: sc }),
  );
  // #5 Giant Kelp Forests
  pickList([
    [-14, 182, 1.35],
    [16, 184, 1.4],
    [-46, 136, 1.45],
    [-70, 88, 1.4],
    [52, 120, 1.35],
    [82, 18, 1.4],
    [-82, 10, 1.4],
    [-40, -106, 1.45],
  ], 5).forEach(([x, z, sc]) => placeArchBiota('giant_kelp', x, z, { scale: sc }));
  // #6 Seagrass
  pickList([
    [-2, 184, 1.1],
    [-22, 196, 1.1],
    [28, 180, 1.1],
    [-60, 118, 1.15],
    [48, 136, 1.1],
    [76, 8, 1.15],
  ], 4).forEach(([x, z, sc]) => placeArchBiota('seagrass', x, z, { scale: sc }));
  // #7 Bioluminescent Algae (glowing along Twilight Straits!)
  pickList([
    [-48, 104, 1.25],
    [-84, 12, 1.3],
    [-86, -24, 1.3],
    [88, -20, 1.25],
    [-48, -124, 1.3],
    [72, -118, 1.25],
  ], 4).forEach(([x, z, sc]) => placeArchBiota('bioluminescent_algae', x, z, { scale: sc }));
  // #8 Sea Fan
  pickList([[10, 196, 1.15], [-38, 152, 1.15], [64, 102, 1.1], [-72, 16, 1.2], [42, -118, 1.15]], 3).forEach(
    ([x, z, sc]) => placeArchBiota('sea_fan', x, z, { scale: sc, yaw: x * 0.2 }),
  );
  // #9 Tiger Cowrie
  pickList([[-8, 186, 1.05], [14, 188, 1.0], [-62, 112, 1.1], [68, 98, 1.05]], 3).forEach(
    ([x, z, sc]) => placeArchBiota('tiger_cowrie', x, z, { scale: sc, yaw: z * 0.3 }),
  );
  // #10 Giant Clam (Pearl yield!)
  pickList([[-18, 192, 1.2], [-64, 92, 1.25], [58, 116, 1.2], [-80, -16, 1.25], [74, -112, 1.25]], 3).forEach(
    ([x, z, sc]) => placeArchBiota('giant_clam', x, z, { scale: sc, yaw: x * 0.15 }),
  );
  // #11 Clownfish
  pickList([
    [4, 188, 1.6],
    [-26, 180, 1.8],
    [-64, 106, 2.2],
    [56, 114, 2.0],
    [-78, 4, 2.2],
  ], 3).forEach(([x, z, yOff]) =>
    placeArchBiota('clownfish', x, z, {
      yOffset: yOff,
      patrolMode: 'swim',
      patrolRadius: 3.5,
      patrolSpeed: 0.9,
      scale: 1.1,
    }),
  );
  // #12 Blue Tang
  pickList([
    [-10, 194, 2.0],
    [-46, 130, 2.6],
    [46, 128, 2.4],
    [82, -6, 2.8],
    [-42, -114, 2.6],
  ], 3).forEach(([x, z, yOff]) =>
    placeArchBiota('blue_tang', x, z, {
      yOffset: yOff,
      patrolMode: 'swim',
      patrolRadius: 4.8,
      patrolSpeed: 1.0,
      scale: 1.1,
    }),
  );
  // #13 Sea Turtle (Mountable!)
  pickList([
    [-8, 192, 2.2],
    [-56, 116, 2.8],
    [54, 118, 2.6],
    [-76, -8, 3.2],
    [76, -8, 3.0],
  ], 3).forEach(([x, z, yOff]) =>
    placeArchBiota('sea_turtle', x, z, {
      yOffset: yOff,
      patrolMode: 'swim',
      patrolRadius: 7.0,
      patrolSpeed: 0.42,
      scale: 1.25,
    }),
  );
  // #14 Spotted Stingray
  pickList([
    [16, 194, 1.8],
    [-70, 84, 2.2],
    [66, 92, 2.2],
    [-46, -118, 2.5],
  ], 3).forEach(([x, z, yOff]) =>
    placeArchBiota('spotted_stingray', x, z, {
      yOffset: yOff,
      patrolMode: 'swim',
      patrolRadius: 6.5,
      patrolSpeed: 0.48,
      scale: 1.15,
    }),
  );
  // #15 Yellow Seahorse
  pickList([
    [-4, 184, 1.2],
    [18, 182, 1.3],
    [-48, 134, 1.4],
    [54, 118, 1.3],
  ], 2).forEach(([x, z, yOff]) =>
    placeArchBiota('yellow_seahorse', x, z, {
      yOffset: yOff,
      patrolMode: 'hover',
      patrolRadius: 0.85,
      patrolSpeed: 0.7,
      scale: 1.15,
    }),
  );
  // #16 Chameleon Octopus
  pickList([
    [-24, 190, 0.25],
    [-72, 92, 0.25],
    [74, 88, 0.25],
    [-88, -18, 0.25],
  ], 2).forEach(([x, z, yOff]) =>
    placeArchBiota('chameleon_octopus', x, z, {
      yOffset: yOff,
      patrolMode: 'crawl',
      patrolRadius: 2.2,
      patrolSpeed: 0.35,
      scale: 1.15,
    }),
  );
  // #17 Spiny Lobster
  pickList([
    [-12, 186, 0.05],
    [-58, 124, 0.05],
    [60, 110, 0.05],
    [82, -16, 0.05],
  ], 2).forEach(([x, z, yOff]) =>
    placeArchBiota('spiny_lobster', x, z, {
      yOffset: yOff,
      patrolMode: 'crawl',
      patrolRadius: 1.9,
      patrolSpeed: 0.45,
      scale: 1.05,
    }),
  );
  // #18 Box Crab
  pickList([
    [6, 186, 0.05],
    [-34, 166, 0.05],
    [38, 152, 0.05],
    [-64, 72, 0.05],
  ], 2).forEach(([x, z, yOff]) =>
    placeArchBiota('box_crab', x, z, {
      yOffset: yOff,
      patrolMode: 'crawl',
      patrolRadius: 2.2,
      patrolSpeed: 0.55,
      scale: 1.0,
    }),
  );
  // #19 Starfish
  pickList([
    [-2, 189, 0.04],
    [12, 191, 0.04],
    [-54, 130, 0.04],
    [48, 138, 0.04],
  ], 3).forEach(([x, z, yOff]) =>
    placeArchBiota('starfish', x, z, { yOffset: yOff, scale: 1.1, yaw: x * 0.4 }),
  );
  // #20 Glowing Jellyfish
  pickList([
    [-38, 142, 3.2],
    [-78, 42, 3.8],
    [64, 86, 3.4],
    [-86, -12, 4.2],
    [88, -14, 4.0],
    [-44, -120, 4.2],
  ], 3).forEach(([x, z, yOff]) =>
    placeArchBiota('glowing_jellyfish', x, z, {
      yOffset: yOff,
      patrolMode: 'hover',
      patrolRadius: 2.4,
      patrolSpeed: 0.35,
      scale: 1.25,
    }),
  );

  // Sanity guard: verify all 20 species exist
  for (const spec of SEA_BIOTA_CATALOG) {
    if (!biotaNodes.some((n) => n.speciesId === spec.id)) {
      placeArchBiota(spec.id, -8, 190, { yOffset: 1 });
    }
  }

  // 5b. Scattered Underwater Hearts (❤️), Diamonds (💎), and Weapons across Archipelago Straits
  const addArchPickup = (
    id: string,
    kind: OceanPickup['kind'],
    rawX: number,
    rawZ: number,
    yOff: number,
    weaponId?: WeaponId,
  ) => {
    const [x, z] = nudgeToWater(rawX, rawZ);
    const floorY = sampleFloorY(x, z);
    const safeOffset = Math.min(yOff, Math.max(0.85, Math.abs(floorY) - 1.45));
    const y = Math.min(-1.55, floorY + safeOffset);
    const mesh = createOceanPickupMesh(kind, weaponId, palette, disposables);
    mesh.position.set(x, y, z);
    mesh.userData.oceanPickupId = id;
    group.add(mesh);
    dynamicNodes.push(mesh);
    pickups.push({
      id,
      kind,
      weaponId,
      label:
        kind === 'heart'
          ? 'Nyawa Bawah Laut (❤️)'
          : kind === 'diamond'
          ? 'Berlian Bawah Laut (💎)'
          : `${OCEAN_WEAPON_LABELS[weaponId ?? 'emas']} (+Ammo)`,
      x,
      y,
      z,
      phase: pickups.length * 1.13,
      active: true,
      respawnTimer: 0,
      mesh,
    });
  };

  // Hearts (❤️) across straits
  [
    [-6, 192, 1.8],
    [-32, 170, 2.0],
    [34, 142, 2.0],
    [-66, 98, 2.2],
    [66, 98, 2.2],
    [-82, 4, 2.4],
    [82, 4, 2.4],
    [-50, -108, 2.5],
    [64, -112, 2.5],
    [0, -48, 2.2],
  ].forEach(([px, pz, pyOff], i) => addArchPickup(`arch_oc_heart_${i}`, 'heart', px, pz, pyOff));

  // Diamonds (💎) across straits
  [
    [-18, 184, 1.9],
    [16, 186, 1.9],
    [-46, 132, 2.2],
    [46, 128, 2.2],
    [-76, 62, 2.4],
    [72, 74, 2.4],
    [-84, -16, 2.6],
    [86, -12, 2.6],
    [-42, -120, 2.6],
    [70, -122, 2.6],
    [-20, -68, 2.4],
    [22, -66, 2.4],
  ].forEach(([px, pz, pyOff], i) => addArchPickup(`arch_oc_dia_${i}`, 'diamond', px, pz, pyOff));

  // Underwater Weapons (Senjata Bawah Laut)
  const archWeaponSpots: Array<[WeaponId, number, number, number]> = [
    ['emas', -14, 188, 2.0],
    ['saus', -54, 122, 2.2],
    ['biji', 54, 116, 2.2],
    ['kertas', -80, -6, 2.4],
    ['jarum', 80, -6, 2.4],
    ['kristal', -46, -116, 2.6],
  ];
  archWeaponSpots.forEach(([wid, wx, wz, wyOff], i) =>
    addArchPickup(`arch_oc_wp_${i}_${wid}`, 'weapon', wx, wz, wyOff, wid),
  );

  // 6. Hero Underwater Torch Light (only lit when underwater!)
  const torchLight = new THREE.PointLight(0x7dd3fc, 0, 26, 1.4);
  torchLight.position.set(0, -4, 190);
  group.add(torchLight);
  dynamicNodes.push(torchLight);

  return {
    group,
    sunbeams,
    bubblesPoints,
    torchLight,
    biotaNodes,
    airVents,
    chests,
    colliders,
    pickups,
    dynamicNodes,
    clickables,
    disposables,
    sampleFloorY,
  };
}

export function updateArchipelagoUnderwaterProps(
  rig: ArchipelagoUnderwaterRig,
  dt: number,
  elapsed: number,
  heroPos: THREE.Vector3,
  heroYaw: number,
  camY: number,
  ownedGear: Set<DivingGearId>,
  isUnderwater: boolean,
  lowDetail = false,
  ridingTurtle = false,
): void {
  const showAtmosphereFx = isUnderwater || camY < 0.05;
  rig.bubblesPoints.visible = showAtmosphereFx;
  if (showAtmosphereFx) {
    rig.bubblesPoints.position.set(heroPos.x, 0, heroPos.z);
    const bubbleTick = Math.floor(elapsed * 20);
    if (!lowDetail || (bubbleTick & 1) === 0) {
      const posAttr = rig.bubblesPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const stepDt = lowDetail ? dt * 1.9 : dt;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] += stepDt * (1.8 + (i % 5) * 0.35);
        arr[i] += Math.sin(elapsed * 2.2 + i) * stepDt * 0.2;
        if (arr[i + 1] > -0.25) {
          arr[i + 1] = -24 + Math.random() * 6;
        }
      }
      posAttr.needsUpdate = true;
    }
  }

  for (let i = 0; i < rig.sunbeams.length; i++) {
    const b = rig.sunbeams[i];
    b.visible = showAtmosphereFx && heroPos.y > -18.5;
    if (b.visible) {
      b.position.set(
        heroPos.x + ((b.userData.baseOffsetX as number) ?? 0),
        (b.userData.baseOffsetY as number) ?? -8.5,
        heroPos.z + ((b.userData.baseOffsetZ as number) ?? 0),
      );
      b.rotation.z = 0.2 + Math.sin(elapsed * 0.7 + i * 1.1) * 0.05;
    }
  }

  if (showAtmosphereFx) {
    const hasTorch = ownedGear.has('fins_torch');
    const hasMask = ownedGear.has('snorkel') || ownedGear.has('wetsuit_tank');
    rig.torchLight.intensity = hasTorch ? 5.2 : hasMask ? 2.4 : 1.3;
    rig.torchLight.distance = hasTorch ? 36 : 24;
    rig.torchLight.color.setHex(hasTorch ? 0xfef08a : 0x67e8f9);
    rig.torchLight.position.set(
      heroPos.x + Math.sin(heroYaw) * 1.4,
      heroPos.y + 1.8,
      heroPos.z + Math.cos(heroYaw) * 1.4,
    );
  } else {
    rig.torchLight.intensity = 0;
  }

  const visDistSq = lowDetail ? 46 * 46 : 74 * 74;

  // Air vents
  for (const vent of rig.airVents) {
    const dx = vent.x - heroPos.x;
    const dz = vent.z - heroPos.z;
    const distSq = dx * dx + dz * dz;
    const visible = distSq <= visDistSq;
    vent.group.visible = visible;
    if (!visible) continue;
    vent.rings.forEach((ring, idx) => {
      const cycle = (elapsed * 0.75 + idx * 0.33) % 1;
      ring.position.y = 1.0 + cycle * 4.2;
      ring.scale.setScalar(0.8 + cycle * 0.55);
    });
  }

  // Supply chests
  for (const ch of rig.chests) {
    const dx = ch.x - heroPos.x;
    const dz = ch.z - heroPos.z;
    const distSq = dx * dx + dz * dz;
    ch.group.visible = distSq <= visDistSq;
    if (!ch.group.visible) continue;
    if (!ch.opened) {
      ch.beacon.visible = true;
      ch.beacon.rotation.y += dt * 2.1;
      ch.beacon.position.y = 1.9 + Math.sin(elapsed * 3.0 + ch.x) * 0.22;
    } else {
      ch.beacon.visible = false;
      ch.lid.rotation.x = THREE.MathUtils.damp(ch.lid.rotation.x, -1.25, 10, dt);
    }
  }

  // Underwater Pickups (Hearts, Diamonds, Weapons)
  for (const pk of rig.pickups) {
    if (!pk.active) {
      pk.mesh.visible = false;
      pk.respawnTimer -= dt;
      if (pk.respawnTimer <= 0) {
        pk.active = true;
      }
      continue;
    }
    const dx = pk.x - heroPos.x;
    const dz = pk.z - heroPos.z;
    const vis = dx * dx + dz * dz <= visDistSq;
    pk.mesh.visible = vis;
    if (!vis) continue;
    pk.mesh.position.y = pk.y + Math.sin(elapsed * 2.6 + pk.phase) * 0.24;
    pk.mesh.rotation.y += dt * 1.8;
  }

  // Distance-culled & Collision-Separated 20 Sea Biota Species
  updateAndSeparateOceanBiota(
    rig.biotaNodes,
    rig.colliders,
    rig.sampleFloorY,
    dt,
    elapsed,
    heroPos,
    ridingTurtle,
    visDistSq,
    true,
  );
}

export function getBiotaActionLabel(speciesId: SeaBiotaId): string | null {
  const entry = SEA_BIOTA_BY_ID[speciesId];
  if (!entry) return null;
  if (entry.mountable) return 'Tunggangi Penyu (E)';
  if (entry.yieldKind === 'pearl') return `Panen Mutiara · ${entry.indoName} (E)`;
  if (entry.yieldKind === 'calcium') return `Panen Kalsium · ${entry.indoName} (E)`;
  if (entry.yieldKind === 'fiber') return `Panen Serat Kelp · ${entry.indoName} (E)`;
  if (entry.yieldKind === 'shell') return `Ambil Cangkang · ${entry.indoName} (E)`;
  if (entry.yieldKind === 'food') return `Ambil Makanan Laut · ${entry.indoName} (E)`;
  return null;
}
