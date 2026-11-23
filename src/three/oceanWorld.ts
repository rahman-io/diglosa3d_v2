import * as THREE from 'three';
import { DivingGearId, MonsterType, OceanMaterials, SeaBiotaId } from '../types/game';
import { MaterialPalette } from './materials';
import {
  animateSeaBiotaRig,
  createSeaBiotaMesh,
  SEA_BIOTA_BY_ID,
  SEA_BIOTA_CATALOG,
  SeaBiotaRig,
} from './seaBiotaCatalog';

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
  clickables: THREE.Object3D[];
  disposables: Array<{ dispose: () => void }>;
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
    rig.root.userData.oceanBiotaSpecies = speciesId;
    if ((opts?.patrolMode ?? 'static') === 'static' && rig.parts.length === 0) {
      freezeSubtreeMatrices(rig.root);
    }
    group.add(rig.root);
    clickables.push(rig.root);
    biotaNodes.push({
      id: `biota_${speciesId}_${bSeq++}`,
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
  // #13 Sea Turtle (RARE, MOUNT: Yes — gracefully swimming in Foreground Sanctuary!)
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
  // #20 Glowing Jellyfish (RARE, LIGHT: 8m — floating softly across Reef & Twilight Slope)
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
    clickables,
    disposables,
  };
}

export function updateOceanWorld(
  rig: OceanWorldRig,
  dt: number,
  elapsed: number,
  heroPos: THREE.Vector3,
  heroYaw: number,
  ownedGear: Set<DivingGearId>,
  lowDetail = false,
): void {
  // Subtle surface ripple & sunbeam sway
  rig.surfaceMesh.position.y = Math.sin(elapsed * 1.4) * 0.08;
  rig.sunbeams.forEach((b, idx) => {
    b.rotation.z = 0.22 + Math.sin(elapsed * 0.7 + idx * 1.1) * 0.05;
  });

  // Animate rising bubbles
  const posAttr = rig.bubblesPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
  const arr = posAttr.array as Float32Array;
  for (let i = 0; i < arr.length; i += 3) {
    arr[i + 1] += dt * (1.8 + (i % 5) * 0.35);
    arr[i] += Math.sin(elapsed * 2.2 + i) * dt * 0.22;
    if (arr[i + 1] > -0.35) {
      arr[i + 1] = -26 + Math.random() * 4;
    }
  }
  posAttr.needsUpdate = true;

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

  // Animate all 20 Sea Biota species with mobile distance culling & scale dirty-guard
  const cullDistSq = lowDetail ? 40 * 40 : 68 * 68;
  for (const node of rig.biotaNodes) {
    if (node.harvestCooldown > 0) {
      node.harvestCooldown = Math.max(0, node.harvestCooldown - dt);
    }
    const nextScale = node.scale * (node.harvestCooldown > 0 ? 0.76 : 1.0);
    if (node.lastDimScale !== nextScale) {
      node.rig.root.scale.setScalar(nextScale);
      node.lastDimScale = nextScale;
    }

    const dxH = node.x - heroPos.x;
    const dyH = node.y - heroPos.y;
    const dzH = node.z - heroPos.z;
    const distSq = dxH * dxH + dyH * dyH + dzH * dzH;
    if (distSq > cullDistSq) continue;

    if (node.patrolMode === 'swim') {
      const t = elapsed * node.patrolSpeed + node.phase;
      const nx = node.homeX + Math.cos(t) * node.patrolRadius;
      const nz = node.homeZ + Math.sin(t * 0.8) * (node.patrolRadius * 0.75);
      const ny = node.homeY + Math.sin(elapsed * 1.6 + node.phase) * 0.35;
      const dx = nx - node.x;
      const dz = nz - node.z;
      if (Math.hypot(dx, dz) > 0.002) {
        node.rig.root.rotation.y = Math.atan2(dx, dz);
      }
      node.x = nx;
      node.y = ny;
      node.z = nz;
      node.rig.root.position.set(nx, ny, nz);
    } else if (node.patrolMode === 'hover') {
      const t = elapsed * node.patrolSpeed + node.phase;
      node.x = node.homeX + Math.cos(t) * node.patrolRadius * 0.5;
      node.z = node.homeZ + Math.sin(t) * node.patrolRadius * 0.5;
      node.y = node.homeY + Math.sin(elapsed * 1.3 + node.phase) * 0.55;
      node.rig.root.position.set(node.x, node.y, node.z);
    } else if (node.patrolMode === 'crawl') {
      const t = elapsed * node.patrolSpeed + node.phase;
      const nx = node.homeX + Math.cos(t) * node.patrolRadius;
      const nz = node.homeZ + Math.sin(t * 1.1) * (node.patrolRadius * 0.65);
      const ny = getOceanFloorY(nx, nz) + 0.05;
      const dx = nx - node.x;
      const dz = nz - node.z;
      if (Math.hypot(dx, dz) > 0.002) {
        node.rig.root.rotation.y = Math.atan2(dx, dz);
      }
      node.x = nx;
      node.y = ny;
      node.z = nz;
      node.rig.root.position.set(nx, ny, nz);
    }

    animateSeaBiotaRig(node.rig, elapsed, node.phase);
  }
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
