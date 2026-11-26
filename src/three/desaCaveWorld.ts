import * as THREE from 'three';
import type { MaterialPalette } from './materials';
import { createPixelVoxelTexture } from './rpgModels';
import { createWeaponMesh } from './weaponModels';
import type { CaveBlockKind } from '../types/game';
import type {
  CaveBlockDef,
  CaveCliffPlatform,
  CaveLavaChasm,
  CaveStaticCollider,
  CaveTrapRig,
  CaveWeaponChestRig,
  DungeonArenaRig,
  DungeonDoorRig,
} from './rpgModels';

interface VoxelBoxSpec {
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  color: number;
}

interface StairSpec {
  id: string;
  x0: number;
  z0: number;
  x1: number;
  z1: number;
  halfW: number;
  y0: number;
  y1: number;
  steps: number;
  curbHeight?: number;
}

interface RectZone {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  y: number;
}

// ============================================================================
// 1. EXACT 120m x 120m MULTI-TIER TOPOLOGY (100% faithful to concept layout)
// ============================================================================

const PLAYABLE_HALF_BOUND = 47.8;
const CAVE_CEILING_Y = 30.0;

// Diagonal / axis-aligned staircases connecting every tier cleanly
const DESA_STAIRS: StairSpec[] = [
  // Stair 1: Wide South Courtyard (y=0) -> Exit Portal Terrace (y=3.5)
  { id: 'courtyard_to_exit', x0: -1.5, z0: 39.5, x1: -10.5, z1: 31.5, halfW: 2.8, y0: 0, y1: 3.5, steps: 7, curbHeight: 0.65 },
  // Stair 2: Exit Portal Terrace (y=3.5) -> West Labyrinth (y=2.0)
  { id: 'exit_to_west_maze', x0: -20.5, z0: 21.5, x1: -24.5, z1: 16.5, halfW: 2.3, y0: 3.5, y1: 2.0, steps: 4, curbHeight: 0.5 },
  // Stair 3: West Labyrinth (y=2.0) -> Red Ribbon Mossy Grotto (y=4.0)
  { id: 'west_maze_to_ribbon', x0: -36.5, z0: 4.5, x1: -42.2, z1: -2.0, halfW: 1.9, y0: 2.0, y1: 4.0, steps: 5, curbHeight: 0.4 },
  // Stair 4: West Labyrinth North Exit (y=2.0) -> NW Diamond Chest Alcove (y=3.5)
  { id: 'west_maze_to_chest', x0: -26.0, z0: -6.5, x1: -26.0, z1: -18.5, halfW: 2.5, y0: 2.0, y1: 3.5, steps: 4, curbHeight: 0.5 },
  // Stair 5: SE Well Bank (y=0) -> East Labyrinth (y=3.5)
  { id: 'se_bank_to_east_maze', x0: 27.5, z0: 34.5, x1: 27.5, z1: 23.0, halfW: 2.8, y0: 0, y1: 3.5, steps: 7, curbHeight: 0.5 },
  // Stair 6: West-Center Hillside (y=3.5) -> Upper Boss Courtyard (y=9.5)
  { id: 'west_hill_to_boss', x0: -11.5, z0: -12.0, x1: -11.5, z1: -24.0, halfW: 2.2, y0: 3.5, y1: 9.5, steps: 12, curbHeight: 0.6 },
  // Stair 7: Central-East Hillside (y=3.5) -> Upper Boss Courtyard (y=9.5)
  { id: 'center_hill_to_boss', x0: 7.5, z0: 4.5, x1: 7.5, z1: -23.0, halfW: 2.3, y0: 3.5, y1: 9.5, steps: 14, curbHeight: 0.6 },
  // Stair 8: East Grand Cliff Staircase (y=3.5) -> Boss Courtyard / NE Prison Shelf (y=9.5)
  { id: 'east_grand_to_boss', x0: 26.5, z0: -8.0, x1: 26.5, z1: -24.0, halfW: 2.5, y0: 3.5, y1: 9.5, steps: 12, curbHeight: 0.6 },
  // Stair 9: NW Chest Alcove (y=3.5) -> Upper NW Back Door Shelf (y=9.5)
  { id: 'nw_chest_to_back_door', x0: -16.5, z0: -26.0, x1: -16.5, z1: -41.0, halfW: 2.1, y0: 3.5, y1: 9.5, steps: 12, curbHeight: 0.55 },
  // River safety climb-out stairs (so jumping into the cyan river never traps player)
  { id: 'river_exit_west', x0: 8.5, z0: 29.0, x1: 4.5, z1: 34.0, halfW: 1.8, y0: -2.0, y1: 0, steps: 4 },
  { id: 'river_exit_east', x0: 19.5, z0: 35.0, x1: 23.5, z1: 38.0, halfW: 1.8, y0: -2.0, y1: 0, steps: 4 },
];

// Arched Stone Bridge endpoints (from Exit Terrace across the Crystal River to Central Promontory)
const BRIDGE_START = { x: -7.5, z: 22.5, y: 3.5 };
const BRIDGE_END = { x: 4.5, z: 15.5, y: 3.5 };
const BRIDGE_HALF_W = 2.15;
const BRIDGE_ARCH_RISE = 1.05; // Gently arches up to 4.55m over the glowing crystal river!

function sampleStairElevation(
  x: number,
  z: number,
  st: StairSpec,
): { onStair: boolean; y: number } {
  const dx = st.x1 - st.x0;
  const dz = st.z1 - st.z0;
  const len = Math.hypot(dx, dz);
  if (len < 0.01) return { onStair: false, y: 0 };
  const ux = dx / len;
  const uz = dz / len;
  const rx = x - st.x0;
  const rz = z - st.z0;
  const along = rx * ux + rz * uz;
  const perp = Math.abs(-rx * uz + rz * ux);
  if (along < -0.45 || along > len + 0.45 || perp > st.halfW) {
    return { onStair: false, y: 0 };
  }
  const t = THREE.MathUtils.clamp(along / len, 0, 1);
  const stepIdx = Math.min(st.steps - 1, Math.floor(t * st.steps));
  const quantizedT = st.steps > 1 ? stepIdx / (st.steps - 1) : t;
  const smoothT = THREE.MathUtils.lerp(t, quantizedT, 0.35);
  return { onStair: true, y: THREE.MathUtils.lerp(st.y0, st.y1, smoothT) };
}

function sampleBridgeElevation(
  x: number,
  z: number,
): { onBridge: boolean; y: number } {
  const dx = BRIDGE_END.x - BRIDGE_START.x;
  const dz = BRIDGE_END.z - BRIDGE_START.z;
  const len = Math.hypot(dx, dz);
  const ux = dx / len;
  const uz = dz / len;
  const rx = x - BRIDGE_START.x;
  const rz = z - BRIDGE_START.z;
  const along = rx * ux + rz * uz;
  const perp = Math.abs(-rx * uz + rz * ux);
  if (along < -0.6 || along > len + 0.6 || perp > BRIDGE_HALF_W) {
    return { onBridge: false, y: 0 };
  }
  const t = THREE.MathUtils.clamp(along / len, 0, 1);
  const arch = Math.sin(t * Math.PI) * BRIDGE_ARCH_RISE;
  return { onBridge: true, y: 3.5 + arch };
}

// Check if (x,z) lies inside the deep sunken Cyan Crystal River Gorge
export function isInCrystalRiverChannel(x: number, z: number): boolean {
  // Curved river spine from subterranean arch (-6, -2) -> under bridge (-1.5, 19) -> SE pool (22, 46)
  if (z >= -4 && z <= 18 && x >= -10.5 && x <= -1.5) {
    return true;
  }
  // Diagonal mid channel under the bridge & past the lower courtyard
  const lineDist = Math.abs((z - 16) * 0.72 - (x + 2) * 0.69);
  if (z >= 14 && z <= 49 && x >= -7 && x <= 28 && lineDist < 5.4) {
    return true;
  }
  // SE crystal bay right next to the lower plaza & well
  if (z >= 25 && z <= 48 && x >= 11 && x <= 26 && x - 0.55 * z < 4.5 && x - 0.55 * z > -9.5) {
    return true;
  }
  return false;
}

const FLAT_DECKS: RectZone[] = [
  // North High Boss Courtyard (y = 9.5)
  { minX: -16.5, maxX: 28.5, minZ: -49.0, maxZ: -22.0, y: 9.5 },
  // NE Hanging Cliff Prison Shelf & Walkway (y = 9.5)
  { minX: 24.0, maxX: 41.5, minZ: -37.0, maxZ: -23.0, y: 9.5 },
  // Upper NW Back Door Terrace (y = 9.5)
  { minX: -20.5, maxX: -11.5, minZ: -49.0, maxZ: -39.0, y: 9.5 },
  // NW Diamond Ore & Golden Weapon Chest Alcove (y = 3.5)
  { minX: -34.5, maxX: -17.5, minZ: -37.0, maxZ: -17.0, y: 3.5 },
  // Exit Portal Terrace (y = 3.5)
  { minX: -22.6, maxX: -6.5, minZ: 20.5, maxZ: 34.5, y: 3.5 },
  // Central Rock Promontory across Bridge (y = 3.5)
  { minX: 1.5, maxX: 15.5, minZ: 2.5, maxZ: 18.5, y: 3.5 },
  // East Quadrant Labyrinth & Guardhouse Deck (y = 3.5)
  { minX: 14.5, maxX: 46.5, minZ: -8.5, maxZ: 24.5, y: 3.5 },
  // Mossy Red Ribbon Grotto Shelf (y = 4.0)
  { minX: -48.5, maxX: -40.5, minZ: -8.5, maxZ: 2.5, y: 4.0 },
  // West Quadrant Labyrinth Deck (y = 2.0)
  { minX: -41.5, maxX: -14.5, minZ: -9.5, maxZ: 20.5, y: 2.0 },
  // North-of-West-Maze Torch Arch Shelf (y = 2.0)
  { minX: -41.5, maxX: -32.5, minZ: -16.0, maxZ: -9.0, y: 2.0 },
  // South Lower Entrance Plaza & Forge/Well Deck (y = 0)
  { minX: -14.0, maxX: 16.5, minZ: 30.0, maxZ: 49.0, y: 0.0 },
  // SE Base Shelf below East Stairs (y = 0)
  { minX: 23.0, maxX: 46.0, minZ: 32.0, maxZ: 47.0, y: 0.0 },
];

// Terraced grass/earth hills between Central Promontory/Labyrinths and High Boss Plateau
const TERRACED_HILLS: RectZone[] = [
  { minX: -21.0, maxX: -6.0, minZ: -25.0, maxZ: -13.0, y: 5.5 },
  { minX: -18.0, maxX: 3.0, minZ: -23.0, maxZ: -14.0, y: 7.5 },
  { minX: 2.0, maxX: 18.0, minZ: -14.0, maxZ: 3.0, y: 5.5 },
  { minX: 4.0, maxX: 21.0, minZ: -22.0, maxZ: -11.0, y: 7.5 },
  { minX: 18.0, maxX: 29.0, minZ: -22.0, maxZ: -13.0, y: 6.0 },
];

export function sampleDesaCaveGroundY(x: number, z: number, refY = 0): number {
  // 1. Check Arched Bridge first when walking on top (>= 1.8m)
  const br = sampleBridgeElevation(x, z);
  if (br.onBridge && refY >= 1.65) {
    return br.y;
  }

  // 2. Check explicit Staircases (exact match with visual voxel steps)
  let bestStairY: number | null = null;
  for (const st of DESA_STAIRS) {
    const res = sampleStairElevation(x, z, st);
    if (res.onStair) {
      if (bestStairY === null || res.y > bestStairY) {
        bestStairY = res.y;
      }
    }
  }
  if (bestStairY !== null) {
    return bestStairY;
  }

  // 3. Check Elevated Decks & Terraces (highest deck reachable below or near refY + 2.2m)
  let bestDeckY: number | null = null;
  for (const d of FLAT_DECKS) {
    if (x >= d.minX && x <= d.maxX && z >= d.minZ && z <= d.maxZ) {
      if (bestDeckY === null || d.y > bestDeckY) {
        bestDeckY = d.y;
      }
    }
  }
  for (const h of TERRACED_HILLS) {
    if (x >= h.minX && x <= h.maxX && z >= h.minZ && z <= h.maxZ) {
      if (bestDeckY === null || h.y > bestDeckY) {
        bestDeckY = h.y;
      }
    }
  }
  if (bestDeckY !== null) {
    return bestDeckY;
  }

  // 4. Deep Crystal River Gorge floor
  if (isInCrystalRiverChannel(x, z)) {
    return -2.1;
  }

  // Default lower stone floor
  return 0.0;
}

// ============================================================================
// 2. BATCHED VOXEL MESH BUILDER
// ============================================================================

function buildVoxelBatch(
  specs: VoxelBoxSpec[],
  material: THREE.Material,
  castShadow: boolean,
  receiveShadow: boolean,
): THREE.InstancedMesh {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mesh = new THREE.InstancedMesh(geo, material, Math.max(1, specs.length));
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  for (let i = 0; i < specs.length; i++) {
    const s = specs[i];
    dummy.position.set(s.x, s.y, s.z);
    dummy.scale.set(s.sx, s.sy, s.sz);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    col.setHex(s.color);
    mesh.setColorAt(i, col);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
  return mesh;
}

// Deterministic pseudo-random helper for subtle voxel stone/moss color variety
function hash2(x: number, z: number): number {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

// Procedural seamless turquoise crystal river flow texture (repeat wrapping for UV scroll)
function createCrystalRiverTexture(variant: 'base' | 'shimmer'): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, size, 0);
  if (variant === 'base') {
    grad.addColorStop(0.0, '#0891b2');
    grad.addColorStop(0.18, '#06b6d4');
    grad.addColorStop(0.5, '#22d3ee');
    grad.addColorStop(0.82, '#06b6d4');
    grad.addColorStop(1.0, '#0891b2');
  } else {
    grad.addColorStop(0.0, '#0e7490');
    grad.addColorStop(0.5, '#67e8f9');
    grad.addColorStop(1.0, '#0e7490');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Flowing longitudinal caustic current ribbons (tiled seamlessly along Y)
  for (let i = 0; i < 26; i++) {
    const xBase = ((i * 37) % size);
    const width = 4 + (i % 4) * 3;
    const amp = 6 + (i % 3) * 4;
    const freq = (i % 2 === 0 ? 1 : 2) * Math.PI * 2;
    ctx.strokeStyle =
      i % 3 === 0
        ? 'rgba(207, 250, 254, 0.42)'
        : i % 2 === 0
        ? 'rgba(103, 232, 249, 0.34)'
        : 'rgba(14, 116, 144, 0.28)';
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let s = 0; s <= 32; s++) {
      const t = s / 32;
      const y = t * size;
      const x = (xBase + Math.sin(t * freq + i) * amp + size) % size;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Crisp bright surface foam ripples
  for (let i = 0; i < 42; i++) {
    const px = ((i * 73 + 19) % (size - 16)) + 8;
    const py = ((i * 53 + 11) % size);
    const len = 10 + (i % 5) * 6;
    ctx.fillStyle = i % 4 === 0 ? 'rgba(236, 254, 255, 0.55)' : 'rgba(165, 243, 252, 0.35)';
    ctx.fillRect(px, py, 2 + (i % 2), len);
    if (py + len > size) {
      ctx.fillRect(px, py - size, 2 + (i % 2), len);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

// Soft radial cavern mist texture for atmospheric floating mist planes
function createCaveMistTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rad = ctx.createRadialGradient(size * 0.5, size * 0.5, 4, size * 0.5, size * 0.5, size * 0.5);
  rad.addColorStop(0, 'rgba(186, 230, 253, 0.58)');
  rad.addColorStop(0.45, 'rgba(125, 211, 252, 0.28)');
  rad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// Curved smooth ribbon BufferGeometry along a 3D Catmull-Rom river spine
function createRiverRibbonGeometry(
  spine: THREE.Vector3[],
  segments: number,
  widthAtT: (t: number) => number,
  uvRepeatV: number,
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(spine);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const pt = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    // Horizontal sideways normal
    const lenXZ = Math.max(0.001, Math.hypot(tan.x, tan.z));
    const nx = -tan.z / lenXZ;
    const nz = tan.x / lenXZ;
    const hw = widthAtT(t);

    positions.push(pt.x - nx * hw, pt.y, pt.z - nz * hw);
    positions.push(pt.x + nx * hw, pt.y, pt.z + nz * hw);
    uvs.push(0, t * uvRepeatV);
    uvs.push(1, t * uvRepeatV);

    if (i < segments) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ============================================================================
// 3. MAIN DESA SAPAAN GRAND CAVERN BUILDER
// ============================================================================

export function createDesaCaveEnvironment(
  palette: MaterialPalette,
  doors: DungeonDoorRig[],
  sharedRigTools: {
    blockHighlight: THREE.LineSegments;
    blockPlacePreview: THREE.LineSegments;
    torchPreview: THREE.Group;
    shieldBlockMat: THREE.Material;
    blockGeo: THREE.BufferGeometry;
    crackMaterials: THREE.MeshBasicMaterial[];
    crackGeo: THREE.BufferGeometry;
    stoneBlockMat: THREE.Material;
    mossBlockMat: THREE.Material;
    diamondOreMat: THREE.Material;
    heartOreMat: THREE.Material;
    wordSealMat: THREE.Material;
    guardianMesh: THREE.Group;
    guardianAuraMat: THREE.MeshBasicMaterial;
    prisonBars: THREE.Group;
    prisonLockMat: SurfaceMaterialLike;
    captiveMesh: THREE.Group;
    prisonKeyGroup: THREE.Group;
    ribbonGroup: THREE.Group;
    ribbonPivot: THREE.Group;
    ribbonRingMat: THREE.MeshBasicMaterial;
  },
): DungeonArenaRig {
  const group = new THREE.Group();
  const animatables: THREE.Object3D[] = [];
  const caveBlocks: CaveBlockDef[] = [];
  const caveColliders: CaveStaticCollider[] = [];
  const platforms: CaveCliffPlatform[] = [];
  const chasms: CaveLavaChasm[] = [];
  const traps: CaveTrapRig[] = [];
  const cameraOccluders: THREE.Object3D[] = [];
  const disposables: Array<{ dispose: () => void }> = [];

  // Core Textures & Materials
  const voxelTex = createPixelVoxelTexture('#cbd5e1', '#94a3b8', '#e2e8f0', undefined, 'cobblestone');
  disposables.push(voxelTex);
  const voxelMat = palette.createSurfaceMat({
    map: voxelTex,
    roughness: 0.9,
    metalness: 0.05,
  });
  const crystalCyanMat = palette.createSurfaceMat({
    color: 0x22d3ee,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.95,
    roughness: 0.2,
    metalness: 0.15,
    transparent: true,
    opacity: 0.88,
  });
  const crystalPurpleMat = palette.createSurfaceMat({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 0.85,
    roughness: 0.22,
    metalness: 0.2,
  });
  const riverFlowTex = createCrystalRiverTexture('base');
  const riverShimmerTex = createCrystalRiverTexture('shimmer');
  riverShimmerTex.repeat.set(1.4, 1.4);
  const waterfallTex = riverShimmerTex.clone();
  waterfallTex.repeat.set(1.2, 2.2);
  waterfallTex.needsUpdate = true;
  const wellWaterTex = riverShimmerTex.clone();
  wellWaterTex.repeat.set(1, 1);
  wellWaterTex.needsUpdate = true;
  const caveMistTex = createCaveMistTexture();
  disposables.push(riverFlowTex, riverShimmerTex, waterfallTex, wellWaterTex, caveMistTex);

  const riverWaterMat = palette.createSurfaceMat({
    color: 0x38bdf8,
    map: riverFlowTex,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.78,
    roughness: 0.14,
    metalness: 0.18,
    transparent: true,
    opacity: 0.88,
  });
  riverWaterMat.emissiveMap = riverFlowTex;

  const riverShimmerMat = palette.createSurfaceMat({
    color: 0xbae6fd,
    map: riverShimmerTex,
    emissive: 0x67e8f9,
    emissiveIntensity: 0.65,
    roughness: 0.08,
    metalness: 0.1,
    transparent: true,
    opacity: 0.36,
  });
  riverShimmerMat.emissiveMap = riverShimmerTex;
  riverShimmerMat.depthWrite = false;

  const waterfallMat = palette.createSurfaceMat({
    color: 0x67e8f9,
    map: waterfallTex,
    emissive: 0x22d3ee,
    emissiveIntensity: 0.92,
    roughness: 0.12,
    transparent: true,
    opacity: 0.86,
    side: THREE.DoubleSide,
  });
  waterfallMat.emissiveMap = waterfallTex;

  const wellWaterMat = palette.createSurfaceMat({
    color: 0x22d3ee,
    map: wellWaterTex,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.72,
    roughness: 0.12,
    transparent: true,
    opacity: 0.9,
  });
  wellWaterMat.emissiveMap = wellWaterTex;
  const brazierGlowMat = palette.getMat(0xfbbf24, 'emissive');
  const goldSigilMat = palette.createSurfaceMat({
    color: 0xfde047,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.05,
    roughness: 0.3,
    transparent: true,
    opacity: 0.92,
  });
  const emeraldSigilMat = palette.createSurfaceMat({
    color: 0x34d399,
    emissive: 0x10b981,
    emissiveIntensity: 1.05,
    roughness: 0.28,
    transparent: true,
    opacity: 0.92,
  });
  const bluePortalMat = palette.createSurfaceMat({
    color: 0x67e8f9,
    emissive: 0x0284c7,
    emissiveIntensity: 1.2,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9,
  });
  disposables.push(
    voxelMat,
    crystalCyanMat,
    crystalPurpleMat,
    riverWaterMat,
    riverShimmerMat,
    waterfallMat,
    wellWaterMat,
    goldSigilMat,
    emeraldSigilMat,
    bluePortalMat,
  );

  const stoneSpecs: VoxelBoxSpec[] = [];
  const glowCyanSpecs: VoxelBoxSpec[] = [];
  const glowPurpleSpecs: VoxelBoxSpec[] = [];

  const STONE_SHADES = [0x475569, 0x3f4a5a, 0x525d6d, 0x374151];
  const DARK_SHADES = [0x1e2430, 0x262d3b, 0x181c24];
  const GRASS_SHADES = [0x4d7c0f, 0x3f6212, 0x65a30d];
  const DIRT_SHADES = [0x78350f, 0x6c3416, 0x5c2b0e];
  const WOOD_SHADES = [0x854d0e, 0x713f12, 0x92400e];
  const STALACTITE_SHADES = [0xa1887f, 0x8d6e63, 0x795548];

  const pickShade = (arr: number[], x: number, z: number) =>
    arr[Math.floor(hash2(x, z) * arr.length) % arr.length];

  // --------------------------------------------------------------------------
  // A. Deep Bedrock Slab & Cutaway Cross-Section Outer Frame (120m x 120m)
  // --------------------------------------------------------------------------
  const bedrockBase = new THREE.Mesh(
    new THREE.BoxGeometry(116, 4.5, 116),
    palette.getMat(0x111827, 'matte'),
  );
  bedrockBase.position.set(0, -4.6, 0);
  bedrockBase.receiveShadow = true;
  group.add(bedrockBase);

  // Outer perimeter cutaway bedrock & soil strata rim around X/Z = ±52..55
  const addWallBox = (
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    color: number,
    collider = true,
  ) => {
    stoneSpecs.push({ x, y, z, sx, sy, sz, color });
    if (collider) {
      caveColliders.push({
        x,
        z,
        halfW: sx * 0.5,
        halfD: sz * 0.5,
        minY: y - sy * 0.5,
        maxY: y + sy * 0.5,
      });
    }
  };

  // Back North Wall (Z = -52.5) & West Wall (X = -52.5) & East Wall (X = +52.5) & South Cutaway Rim
  const northWallMesh = new THREE.Mesh(
    new THREE.BoxGeometry(114, 34, 6),
    palette.getMat(0x282f3c, 'matte'),
  );
  northWallMesh.position.set(0, 14, -53);
  northWallMesh.receiveShadow = true;
  const westWallMesh = new THREE.Mesh(
    new THREE.BoxGeometry(6, 34, 114),
    palette.getMat(0x242a36, 'matte'),
  );
  westWallMesh.position.set(-53, 14, 0);
  westWallMesh.receiveShadow = true;
  const eastWallMesh = new THREE.Mesh(
    new THREE.BoxGeometry(6, 34, 114),
    palette.getMat(0x242a36, 'matte'),
  );
  eastWallMesh.position.set(53, 14, 0);
  eastWallMesh.receiveShadow = true;
  const southWallMesh = new THREE.Mesh(
    new THREE.BoxGeometry(114, 7.5, 4),
    palette.getMat(0x1f2530, 'matte'),
  );
  southWallMesh.position.set(0, -3.5, 52);
  southWallMesh.receiveShadow = true;
  group.add(northWallMesh, westWallMesh, eastWallMesh, southWallMesh);
  cameraOccluders.push(northWallMesh, westWallMesh, eastWallMesh);

  // Perimeter rocky relief ledges & ore specks embedded along cutaway walls (solid airtight colliders!)
  for (let i = -48; i <= 48; i += 4) {
    // North & West/East rocky pilasters (solid physics!)
    addWallBox(i, 16, -49.5, 4.0, 26, 2.5, pickShade(DARK_SHADES, i, -49), true);
    addWallBox(-49.5, 16, i, 2.5, 26, 4.0, pickShade(DARK_SHADES, -49, i), true);
    addWallBox(49.5, 16, i, 2.5, 26, 4.0, pickShade(DARK_SHADES, 49, i), true);
    // Upper brown earth soil band near rim (y = 26..29)
    addWallBox(i, 27.5, -50.2, 4, 2.6, 2.8, pickShade(DIRT_SHADES, i, 1), false);
    addWallBox(-50.2, 27.5, i, 2.8, 2.6, 4, pickShade(DIRT_SHADES, i, 2), false);
    addWallBox(50.2, 27.5, i, 2.8, 2.6, 4, pickShade(DIRT_SHADES, i, 3), false);
    // Cutaway lower bedrock ore crystals along South & East edges
    if (i % 8 === 0) {
      glowCyanSpecs.push({ x: i + 1, y: -3.2, z: 50.3, sx: 1.2, sy: 1.2, sz: 0.9, color: 0x22d3ee });
      glowPurpleSpecs.push({ x: 50.3, y: -2.8, z: i - 1, sx: 0.9, sy: 1.2, sz: 1.2, color: 0xc084fc });
    }
  }

  // Ceiling slab + Hanging Tan Stalactites (hidden in minimap/topdown snapshots!)
  const ceilingGroup = new THREE.Group();
  ceilingGroup.userData.isMapHidden = true;
  const ceilingSlab = new THREE.Mesh(
    new THREE.BoxGeometry(114, 1.4, 114),
    palette.getMat(0x1b2029, 'matte'),
  );
  ceilingSlab.position.y = CAVE_CEILING_Y;
  ceilingGroup.add(ceilingSlab);

  const stalactiteSpecs: VoxelBoxSpec[] = [];
  for (let gx = -46; gx <= 46; gx += 6) {
    for (let gz = -46; gz <= 46; gz += 7) {
      const rnd = hash2(gx, gz);
      if (rnd < 0.42) continue;
      // Denser stalactites near perimeter & overhang, sparser over open center so lighting shines cleanly
      const edgeWeight = Math.max(Math.abs(gx), Math.abs(gz)) / 48;
      if (edgeWeight < 0.45 && rnd < 0.78) continue;
      const len = 3.2 + rnd * 5.2;
      const col = pickShade(STALACTITE_SHADES, gx, gz);
      stalactiteSpecs.push({ x: gx, y: CAVE_CEILING_Y - len * 0.5, z: gz, sx: 1.4, sy: len, sz: 1.4, color: col });
      stalactiteSpecs.push({
        x: gx,
        y: CAVE_CEILING_Y - len - 0.9,
        z: gz,
        sx: 0.75,
        sy: 1.8,
        sz: 0.75,
        color: col,
      });
    }
  }
  const stalBatch = buildVoxelBatch(stalactiteSpecs, voxelMat, false, false);
  ceilingGroup.add(stalBatch);
  group.add(ceilingGroup);
  cameraOccluders.push(ceilingSlab);

  // --------------------------------------------------------------------------
  // B. Main Multi-Tier Terrain Slabs, Terraced Hills & Cliffs
  // --------------------------------------------------------------------------
  const addTierBlock = (
    minX: number,
    maxX: number,
    minZ: number,
    maxZ: number,
    topY: number,
    bottomY: number,
    topPalette: number[],
    sidePalette: number[],
    addMossTrim = false,
  ) => {
    const cx = (minX + maxX) * 0.5;
    const cz = (minZ + maxZ) * 0.5;
    const sx = maxX - minX;
    const sz = maxZ - minZ;
    const bodyH = Math.max(0.4, topY - bottomY - 0.45);
    if (bodyH > 0.4) {
      stoneSpecs.push({
        x: cx,
        y: bottomY + bodyH * 0.5,
        z: cz,
        sx,
        sy: bodyH,
        sz,
        color: pickShade(sidePalette, cx, cz),
      });
    }
    // Tile top surface in clean 2m×2m voxel blocks for authentic Minecraft grid look
    for (let tx = minX; tx < maxX; tx += 2) {
      const w = Math.min(2, maxX - tx);
      for (let tz = minZ; tz < maxZ; tz += 2) {
        const d = Math.min(2, maxZ - tz);
        const hEdge = addMossTrim && hash2(tx * 2, tz * 2) > 0.78 ? GRASS_SHADES : topPalette;
        stoneSpecs.push({
          x: tx + w * 0.5,
          y: topY - 0.25,
          z: tz + d * 0.5,
          sx: w,
          sy: 0.5,
          sz: d,
          color: pickShade(hEdge, tx, tz),
        });
      }
    }
  };

  // Lower Courtyard & SE Base (y = 0)
  addTierBlock(-14, 16.5, 30, 49, 0.0, -3.5, STONE_SHADES, DARK_SHADES, true);
  addTierBlock(23, 46, 32, 47, 0.0, -3.5, STONE_SHADES, DARK_SHADES, true);

  // Exit Portal Terrace (y = 3.5) & Solid West Rocky Cliff Bastion behind Door 3 (-22.2, 3.5, 25.5)
  addTierBlock(-22.6, -6.5, 20.5, 34.5, 3.5, -2.5, STONE_SHADES, DARK_SHADES, true);
  // Solid Rocky Cliff Bastion flush behind Door 3 (leaves Stair 2 at Z<=21.5 wide open!)
  addWallBox(-25.8, 3.8, 27.3, 6.4, 12.2, 9.4, 0x262d3b, true);
  addWallBox(-25.8, 10.2, 27.3, 5.8, 1.0, 8.6, 0x4d7c0f, false);
  // Flanking stone cliff cheeks wrapping Door 3 edges cleanly
  addWallBox(-22.55, 6.4, 22.8, 1.4, 6.0, 1.2, 0x374151, true);
  addWallBox(-22.55, 6.4, 28.2, 1.4, 6.0, 1.2, 0x374151, true);

  // Central Rock Promontory across Bridge (y = 3.5)
  addTierBlock(1.5, 15.5, 2.5, 18.5, 3.5, -2.5, STONE_SHADES, DARK_SHADES, true);
  // Decorative rocky cliff outcrop rising solidly behind Door 1 (7.4, 3.5, 12.2, rotY=-0.82)
  addWallBox(11.1, 7.2, 8.3, 6.2, 7.8, 6.6, 0x374151, true);
  addWallBox(11.6, 11.4, 7.9, 4.4, 1.4, 4.8, 0x4d7c0f, false);
  {
    const d1Rot = -0.82;
    const d1Cos = Math.cos(d1Rot);
    const d1Sin = Math.sin(d1Rot);
    const addD1RockBlock = (lx: number, ly: number, lz: number, sx: number, sy: number, sz: number, col: number, colSolid = true) => {
      const wx = 7.4 + lx * d1Cos + lz * d1Sin;
      const wz = 12.2 - lx * d1Sin + lz * d1Cos;
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), palette.getMat(col, 'matte'));
      m.position.set(wx, ly, wz);
      m.rotation.y = d1Rot;
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
      cameraOccluders.push(m);
      if (colSolid) {
        caveColliders.push({
          x: wx,
          z: wz,
          halfW: sx * 0.5,
          halfD: sz * 0.5,
          rotY: d1Rot,
          minY: ly - sy * 0.5,
          maxY: ly + sy * 0.5,
        });
      }
    };
    // Solid cliff cheek walls + deep backing mass directly flush against Door 1's sides & back
    addD1RockBlock(0, 6.8, -2.05, 6.6, 6.6, 2.2, 0x262d3b, true);
    addD1RockBlock(-2.85, 6.5, -0.75, 1.4, 6.0, 1.8, 0x374151, true);
    addD1RockBlock(2.85, 6.5, -0.75, 1.4, 6.0, 1.8, 0x374151, true);
    addD1RockBlock(0, 10.3, -1.9, 6.0, 0.9, 2.0, 0x4d7c0f, false);
  }

  // West Labyrinth Deck (y = 2.0) + North Torch Shelf (y = 2.0) + Cliff backing behind Decor Cliff Door
  addTierBlock(-41.5, -14.5, -9.5, 20.5, 2.0, -2.5, STONE_SHADES, DARK_SHADES, true);
  addTierBlock(-41.5, -32.5, -16.0, -9.0, 2.0, -2.5, STONE_SHADES, DARK_SHADES, true);
  addWallBox(-37.0, 6.2, -18.3, 10.4, 9.0, 4.6, 0x262d3b, true);
  addWallBox(-37.0, 11.0, -18.5, 9.6, 0.9, 4.0, 0x4d7c0f, false);

  // Mossy Red Ribbon Grotto Shelf (y = 4.0)
  addTierBlock(-48.5, -40.5, -8.5, 2.5, 4.0, -2.5, GRASS_SHADES, DIRT_SHADES, false);

  // East Labyrinth & Guardhouse Deck (y = 3.5)
  addTierBlock(14.5, 46.5, -8.5, 24.5, 3.5, -2.5, STONE_SHADES, DARK_SHADES, true);

  // NW Diamond Ore & Chest Alcove (y = 3.5)
  addTierBlock(-34.5, -17.5, -37.0, -17.0, 3.5, -2.5, STONE_SHADES, DARK_SHADES, false);

  // Terraced Green & Earth Hills between Mid-Tier & Boss Plateau
  addTierBlock(-21.0, -6.0, -25.0, -13.0, 5.5, 0.0, GRASS_SHADES, DIRT_SHADES, false);
  addTierBlock(-18.0, 3.0, -23.0, -14.0, 7.5, 2.0, GRASS_SHADES, DIRT_SHADES, false);
  addTierBlock(2.0, 18.0, -14.0, 3.0, 5.5, 0.0, GRASS_SHADES, DIRT_SHADES, false);
  addTierBlock(4.0, 21.0, -22.0, -11.0, 7.5, 2.0, GRASS_SHADES, DIRT_SHADES, false);
  addTierBlock(18.0, 29.0, -22.0, -13.0, 6.0, 0.0, GRASS_SHADES, DIRT_SHADES, false);

  // North High Boss Courtyard (y = 9.5) & Upper NW Back Door Shelf (y = 9.5)
  addTierBlock(-16.5, 28.5, -49.0, -22.0, 9.5, 0.0, STONE_SHADES, DARK_SHADES, true);
  addTierBlock(-20.5, -11.5, -49.0, -39.0, 9.5, 0.0, STONE_SHADES, DARK_SHADES, true);

  // Massive Solid Carved Cliff & Buttresses Framing Colossal Door 4 (2.0, 9.5, -47.2)
  addWallBox(2.0, 16.0, -49.6, 11.8, 13.5, 3.2, 0x262d3b, true);
  addWallBox(-2.95, 15.6, -47.9, 3.2, 12.8, 3.0, 0x374151, true);
  addWallBox(6.95, 15.6, -47.9, 3.2, 12.8, 3.0, 0x374151, true);
  addWallBox(2.0, 21.2, -48.1, 11.8, 3.2, 3.4, 0x282f3c, true);
  // Solid rock cliff wall flush behind Upper NW Decor Door (-16.0, 9.5, -48.0)
  addWallBox(-16.0, 12.8, -49.4, 5.2, 6.8, 2.8, 0x262d3b, true);

  // NE Hanging Cliff Prison Shelf (y = 9.5) with jagged crystal-studded rock cliff underside!
  addTierBlock(24.0, 41.5, -37.0, -23.0, 9.5, 4.2, STONE_SHADES, DARK_SHADES, false);
  addWallBox(35.0, 1.5, -31.0, 9.5, 6.2, 8.5, 0x262d3b, true);
  // Glowing Cyan & Purple Crystal Clusters under the NE Prison Overhang (as seen in image!)
  glowCyanSpecs.push(
    { x: 24.5, y: 6.2, z: -20.5, sx: 1.1, sy: 1.1, sz: 1.1, color: 0x22d3ee },
    { x: 26.2, y: 5.0, z: -18.5, sx: 0.9, sy: 0.9, sz: 0.9, color: 0x67e8f9 },
    { x: 30.2, y: 7.4, z: -23.5, sx: 1.1, sy: 1.1, sz: 1.1, color: 0x22d3ee },
    { x: 40.5, y: 8.2, z: -22.2, sx: 1.0, sy: 1.2, sz: 1.0, color: 0x22d3ee },
  );
  glowPurpleSpecs.push(
    { x: 22.8, y: 7.4, z: -21.2, sx: 1.0, sy: 1.0, sz: 1.0, color: 0xc084fc },
    { x: 24.0, y: 8.1, z: -22.0, sx: 0.9, sy: 0.9, sz: 0.9, color: 0xa855f7 },
  );

  // --------------------------------------------------------------------------
  // C. Deep Cyan Crystal River Gorge, Animated Flowing Water & Waterfall, Stone Bridge
  // --------------------------------------------------------------------------
  // Riverbed dark stone floor
  const riverFloor = new THREE.Mesh(
    new THREE.BoxGeometry(46, 0.6, 58),
    palette.getMat(0x0f172a, 'matte'),
  );
  riverFloor.position.set(5, -2.5, 22);
  riverFloor.receiveShadow = true;
  group.add(riverFloor);

  // Smooth Continuous Curved Crystal River Ribbon + Animated Shimmer Layer (UV-scrolled!)
  {
    const riverSpine = [
      new THREE.Vector3(-6.0, -1.56, -4.5),
      new THREE.Vector3(-6.0, -1.56, 5.5),
      new THREE.Vector3(-5.0, -1.56, 15.0),
      new THREE.Vector3(-0.2, -1.56, 22.8),
      new THREE.Vector3(8.5, -1.56, 30.2),
      new THREE.Vector3(17.8, -1.56, 38.6),
      new THREE.Vector3(24.0, -1.56, 49.0),
    ];
    const widthFn = (t: number) => 4.6 + Math.sin(t * Math.PI * 0.85) * 2.1 + t * 0.8;
    const riverGeo = createRiverRibbonGeometry(riverSpine, 44, widthFn, 6.2);
    const riverMesh = new THREE.Mesh(riverGeo, riverWaterMat);
    riverMesh.receiveShadow = true;
    riverMesh.userData.animKind = 'uvScroll';
    riverMesh.userData.scrollU = 0.04;
    riverMesh.userData.scrollV = -0.34;
    animatables.push(riverMesh);
    disposables.push(riverGeo);
    group.add(riverMesh);

    const shimmerSpine = riverSpine.map((v) => new THREE.Vector3(v.x, v.y + 0.06, v.z));
    const shimmerGeo = createRiverRibbonGeometry(shimmerSpine, 44, (t) => widthFn(t) * 0.92, 7.5);
    const shimmerMesh = new THREE.Mesh(shimmerGeo, riverShimmerMat);
    shimmerMesh.userData.animKind = 'uvScroll';
    shimmerMesh.userData.scrollU = -0.05;
    shimmerMesh.userData.scrollV = -0.52;
    animatables.push(shimmerMesh);
    disposables.push(shimmerGeo);
    group.add(shimmerMesh);

    // Subterranean Waterfall Cascade pouring out of Arch (-6.0, -3.5) into the Crystal River
    const wfGeo = new THREE.PlaneGeometry(6.8, 4.8, 1, 8);
    const posAttr = wfGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < posAttr.count; i++) {
      const py = posAttr.getY(i);
      const fracDown = (2.4 - py) / 4.8; // 0 at top -> 1 at river surface
      posAttr.setZ(i, fracDown * fracDown * 1.45);
    }
    wfGeo.computeVertexNormals();
    const waterfallMesh = new THREE.Mesh(wfGeo, waterfallMat);
    waterfallMesh.position.set(-6.0, 0.65, -3.55);
    waterfallMesh.userData.animKind = 'uvScroll';
    waterfallMesh.userData.scrollU = 0.0;
    waterfallMesh.userData.scrollV = 1.15;
    animatables.push(waterfallMesh);
    disposables.push(wfGeo);
    group.add(waterfallMesh);

    // Animated Splash Foam Ring at the Waterfall Plunge Base
    const splashGeo = new THREE.RingGeometry(1.1, 3.5, 24);
    const splashMat = palette.createSurfaceMat({
      color: 0xe0f2fe,
      emissive: 0x67e8f9,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide,
    });
    splashMat.depthWrite = false;
    const splashMesh = new THREE.Mesh(splashGeo, splashMat);
    splashMesh.rotation.x = -Math.PI / 2;
    splashMesh.position.set(-6.0, -1.46, -1.85);
    splashMesh.userData.animKind = 'waterfallSplash';
    animatables.push(splashMesh);
    disposables.push(splashGeo, splashMat);
    group.add(splashMesh);
  }

  // Subterranean Water Arch Overhang at (-6, Z=-4..0) where the glowing river pours out (solid colliders!)
  addWallBox(-6.0, 4.8, -4.5, 10.5, 4.4, 5.0, 0x334155, true);
  addWallBox(-10.2, 1.5, -4.5, 2.2, 4.5, 5.2, 0x1e293b, true);
  addWallBox(-1.6, 1.5, -4.5, 2.2, 4.5, 5.2, 0x1e293b, true);

  // Vertical Rocky Gorge Walls flanking the upper crystal canyon
  addWallBox(-10.8, 1.0, 7.5, 2.4, 6.2, 17.5, 0x262d3b, true);
  addWallBox(-0.6, 1.0, 7.5, 2.2, 6.2, 17.5, 0x262d3b, true);

  // Jagged Glowing Cyan Crystal Spires emerging from the river water (with solid colliders!)
  const spireClusters: Array<[number, number, number]> = [
    [-6.5, 4.0, 1.3],
    [-4.8, 9.5, 1.6],
    [-6.8, 13.8, 1.2],
    [-2.5, 17.2, 1.1],
    [4.2, 24.8, 1.4],
    [10.8, 29.8, 1.75],
    [16.2, 34.5, 1.45],
    [21.0, 41.0, 1.6],
  ];
  spireClusters.forEach(([cx, cz, sc], idx) => {
    const hMain = 2.6 * sc;
    glowCyanSpecs.push({ x: cx, y: -1.5 + hMain * 0.5, z: cz, sx: 1.0 * sc, sy: hMain, sz: 1.0 * sc, color: 0x22d3ee });
    glowCyanSpecs.push({
      x: cx + (idx % 2 === 0 ? 0.9 : -0.9),
      y: -1.5 + hMain * 0.32,
      z: cz + 0.65,
      sx: 0.72 * sc,
      sy: hMain * 0.65,
      sz: 0.72 * sc,
      color: 0x67e8f9,
    });
    glowCyanSpecs.push({
      x: cx - (idx % 2 === 0 ? 0.8 : -0.7),
      y: -1.5 + hMain * 0.25,
      z: cz - 0.75,
      sx: 0.65 * sc,
      sy: hMain * 0.52,
      sz: 0.65 * sc,
      color: 0x06b6d4,
    });
    caveColliders.push({
      x: cx,
      z: cz,
      halfW: 0.9 * sc,
      halfD: 0.9 * sc,
      minY: -2.3,
      maxY: -1.2 + hMain,
    });
  });

  // Arched Voxel Stone Bridge spanning from Exit Terrace (-7.5, 22.5) to Central Promontory (4.5, 15.5)
  {
    const dx = BRIDGE_END.x - BRIDGE_START.x;
    const dz = BRIDGE_END.z - BRIDGE_START.z;
    const len = Math.hypot(dx, dz);
    const ux = dx / len;
    const uz = dz / len;
    const px = -uz;
    const pz = ux;
    const steps = 15;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const mx = THREE.MathUtils.lerp(BRIDGE_START.x, BRIDGE_END.x, t);
      const mz = THREE.MathUtils.lerp(BRIDGE_START.z, BRIDGE_END.z, t);
      const deckY = 3.5 + Math.sin(t * Math.PI) * BRIDGE_ARCH_RISE;
      // Deck slab block + stone arch ribs underneath
      const segMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 0.75, BRIDGE_HALF_W * 2),
        palette.getMat(pickShade(STONE_SHADES, mx, mz), 'matte'),
      );
      segMesh.position.set(mx, deckY - 0.37, mz);
      segMesh.rotation.y = Math.atan2(dx, dz) - Math.PI / 2;
      segMesh.castShadow = true;
      segMesh.receiveShadow = true;
      group.add(segMesh);
      cameraOccluders.push(segMesh);

      // Low crenellated bridge parapets (alternating height like Minecraft masonry!)
      if (i % 2 === 0 || i === 0 || i === steps) {
        const curbH = i % 2 === 0 ? 0.85 : 0.55;
        [-BRIDGE_HALF_W + 0.28, BRIDGE_HALF_W - 0.28].forEach((side) => {
          const cx = mx + px * side;
          const cz = mz + pz * side;
          const pMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.95, curbH, 0.5),
            palette.getMat(0x525d6d, 'matte'),
          );
          pMesh.position.set(cx, deckY + curbH * 0.5, cz);
          pMesh.rotation.y = Math.atan2(dx, dz) - Math.PI / 2;
          pMesh.castShadow = true;
          group.add(pMesh);
        });
      }
    }
    // Continuous airtight rotated OBB railings on both sides of the bridge
    const bridgeYaw = Math.atan2(dx, dz) - Math.PI / 2;
    const midX = (BRIDGE_START.x + BRIDGE_END.x) * 0.5;
    const midZ = (BRIDGE_START.z + BRIDGE_END.z) * 0.5;
    [-BRIDGE_HALF_W + 0.24, BRIDGE_HALF_W - 0.24].forEach((side) => {
      caveColliders.push({
        x: midX + px * side,
        z: midZ + pz * side,
        halfW: len * 0.48,
        halfD: 0.34,
        rotY: bridgeYaw,
        minY: 3.3,
        maxY: 6.2,
      });
    });
    // Bridge masonry arch abutments on both banks (solid pier below bridge deck!)
    addWallBox(-7.2, 1.3, 22.3, 2.2, 4.0, 4.5, 0x374151, true);
    addWallBox(4.2, 1.3, 15.7, 2.2, 4.0, 4.5, 0x374151, true);
  }

  // --------------------------------------------------------------------------
  // D. Visual Voxel Steps & Curb Colliders for ALL 11 DESA_STAIRS
  // --------------------------------------------------------------------------
  for (const st of DESA_STAIRS) {
    const dx = st.x1 - st.x0;
    const dz = st.z1 - st.z0;
    const len = Math.hypot(dx, dz);
    const ux = dx / len;
    const uz = dz / len;
    const px = -uz;
    const pz = ux;
    const yaw = Math.atan2(dx, dz);
    const treadLen = len / st.steps + 0.25;
    for (let i = 0; i < st.steps; i++) {
      const t = (i + 0.5) / st.steps;
      const sx = THREE.MathUtils.lerp(st.x0, st.x1, t);
      const sz = THREE.MathUtils.lerp(st.z0, st.z1, t);
      const sy = THREE.MathUtils.lerp(st.y0, st.y1, i / Math.max(1, st.steps - 1));
      const baseFloor = Math.min(st.y0, st.y1) - 1.2;
      const stepH = Math.max(0.55, sy - baseFloor);
      const tread = new THREE.Mesh(
        new THREE.BoxGeometry(st.halfW * 2, stepH, treadLen),
        palette.getMat(i % 2 === 0 ? 0x525d6d : 0x475569, 'matte'),
      );
      tread.position.set(sx, baseFloor + stepH * 0.5, sz);
      tread.rotation.y = yaw;
      tread.castShadow = true;
      tread.receiveShadow = true;
      group.add(tread);

      if (st.curbHeight && i % 2 === 0) {
        [-st.halfW - 0.25, st.halfW + 0.25].forEach((side) => {
          const cx = sx + px * side;
          const cz = sz + pz * side;
          const curb = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, st.curbHeight!, treadLen * 1.1),
            palette.getMat(0x374151, 'matte'),
          );
          curb.position.set(cx, sy + st.curbHeight! * 0.5, cz);
          curb.rotation.y = yaw;
          group.add(curb);
        });
      }
    }
    if (st.curbHeight) {
      const midX = (st.x0 + st.x1) * 0.5;
      const midZ = (st.z0 + st.z1) * 0.5;
      [-st.halfW - 0.25, st.halfW + 0.25].forEach((side) => {
        caveColliders.push({
          x: midX + px * side,
          z: midZ + pz * side,
          halfW: 0.28,
          halfD: len * 0.45,
          rotY: yaw,
          minY: Math.min(st.y0, st.y1) - 0.4,
          maxY: Math.max(st.y0, st.y1) + st.curbHeight! + 0.4,
        });
      });
    }
  }

  // --------------------------------------------------------------------------
  // E. West Stone Labyrinth (y = 2.0) & East Stone Labyrinth + Guardhouse (y = 3.5)
  // --------------------------------------------------------------------------
  const addMazeWall = (x0: number, z0: number, x1: number, z1: number, floorY: number, height = 2.2) => {
    const cx = (x0 + x1) * 0.5;
    const cz = (z0 + z1) * 0.5;
    const sx = Math.max(1.2, Math.abs(x1 - x0) + 1.0);
    const sz = Math.max(1.2, Math.abs(z1 - z0) + 1.0);
    stoneSpecs.push({ x: cx, y: floorY + height * 0.5, z: cz, sx, sy: height, sz, color: 0x475569 });
    // Mossy top cap along the stone maze wall
    stoneSpecs.push({ x: cx, y: floorY + height + 0.14, z: cz, sx: sx * 0.96, sy: 0.28, sz: sz * 0.96, color: 0x4d7c0f });
    caveColliders.push({
      x: cx,
      z: cz,
      halfW: sx * 0.5,
      halfD: sz * 0.5,
      minY: floorY,
      maxY: floorY + height + 0.4,
    });
  };

  // West Labyrinth Walls (y = 2.0, X ∈ [-40, -16], Z ∈ [-6, +19])
  addMazeWall(-40, 19, -28, 19, 2.0);
  addMazeWall(-21, 19, -16, 19, 2.0);
  addMazeWall(-40, -6, -30, -6, 2.0);
  addMazeWall(-22, -6, -16, -6, 2.0);
  addMazeWall(-40, -6, -40, 1, 2.0);
  addMazeWall(-40, 9, -40, 19, 2.0);
  addMazeWall(-16, -6, -16, 19, 2.0);
  // Inner West Maze turns (clean 4m+ wide passages!)
  addMazeWall(-33, 13, -24, 13, 2.0);
  addMazeWall(-22, 8, -16, 8, 2.0);
  addMazeWall(-34, -1, -34, 8, 2.0);
  addMazeWall(-27, 1, -27, 11, 2.0);
  addMazeWall(-34, -1, -29, -1, 2.0);

  // East Labyrinth Walls (y = 3.5, X ∈ [15, 45], Z ∈ [-6, +24])
  addMazeWall(15, 24, 24, 24, 3.5);
  addMazeWall(31, 24, 45, 24, 3.5);
  addMazeWall(15, -6, 23, -6, 3.5);
  addMazeWall(30, -6, 45, -6, 3.5);
  addMazeWall(15, -6, 15, 10, 3.5);
  addMazeWall(15, 17, 15, 24, 3.5);
  addMazeWall(45, -6, 45, 24, 3.5);
  // Inner East Maze turns
  addMazeWall(21, -6, 21, 7, 3.5);
  addMazeWall(21, 14, 21, 19, 3.5);
  addMazeWall(21, 19, 34, 19, 3.5);
  addMazeWall(27, 2, 36, 2, 3.5);
  addMazeWall(33, 13, 33, 19, 3.5);
  // Enclosed Stone Guardhouse Building framing Door 2: Lumbung at (37.0, 3.5, 10.5, rotY=-Math.PI/2)
  addMazeWall(37, 6, 45, 6, 3.5, 4.6);
  addMazeWall(37, 15, 45, 15, 3.5, 4.6);
  addMazeWall(45, 6, 45, 15, 3.5, 4.6);
  addMazeWall(37, 6, 37, 7.9, 3.5, 4.6);
  addMazeWall(37, 13.1, 37, 15, 3.5, 4.6);
  // Header wall above Door 2 lintel connecting front wings to roof
  addWallBox(37.0, 7.75, 10.5, 1.2, 1.3, 5.4, 0x475569, true);
  // Solid Guardhouse Roof Slab over Door 2 room
  addWallBox(41.0, 8.45, 10.5, 9.2, 0.75, 10.2, 0x374151, true);

  // --------------------------------------------------------------------------
  // F. Iconic Plaza Landmarks: Gold Sigil, Bench, Forge, Well, Teleport Pad, 3 Boss Sigils
  // --------------------------------------------------------------------------
  // 1. Lower Courtyard Golden Circular Sigil at (-1.5, 0.04, 41.5)
  const plazaSigilRing = new THREE.Mesh(new THREE.RingGeometry(1.9, 2.55, 28), goldSigilMat);
  plazaSigilRing.rotation.x = -Math.PI / 2;
  plazaSigilRing.position.set(-1.5, 0.04, 41.5);
  const plazaSigilInner = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.35, 6), goldSigilMat);
  plazaSigilInner.rotation.x = -Math.PI / 2;
  plazaSigilInner.position.set(-1.5, 0.045, 41.5);
  group.add(plazaSigilRing, plazaSigilInner);

  // 2. Wooden Bench left of the gold sigil at (-7.0, 0, 41.0)
  {
    const bench = new THREE.Group();
    bench.position.set(-7.0, 0, 41.0);
    bench.rotation.y = 0.7;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 0.85), palette.getMat(0x854d0e, 'matte'));
    seat.position.y = 0.52;
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.65, 0.18), palette.getMat(0x713f12, 'matte'));
    back.position.set(0, 0.92, -0.34);
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.5, 0.8), palette.getMat(0x451a03, 'matte'));
    legL.position.set(-0.95, 0.25, 0);
    const legR = legL.clone();
    legR.position.x = 0.95;
    bench.add(seat, back, legL, legR);
    group.add(bench);
    caveColliders.push({ x: -7.0, z: 41.0, halfW: 1.25, halfD: 0.65, minY: 0, maxY: 1.5 });
  }

  // 3. Crafting Forge & Workbench Station (5.5, 0, 35.5)
  const craftingTablePos = new THREE.Vector3(5.5, 0, 35.5);
  {
    const craftStation = new THREE.Group();
    craftStation.position.copy(craftingTablePos);
    craftStation.userData.craftingTable = true;
    const tableBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.05, 1.3), palette.getMat(0x78350f, 'matte'));
    tableBase.position.set(-0.6, 0.525, 0);
    tableBase.castShadow = true;
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.22, 1.45), palette.getMat(0xd97706, 'matte'));
    tableTop.position.set(-0.6, 1.15, 0);
    const furnaceBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.55, 1.45), palette.getMat(0x475569, 'matte'));
    furnaceBody.position.set(0.95, 0.775, 0);
    furnaceBody.castShadow = true;
    const furnaceMouth = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.55, 0.16), palette.getMat(0xf97316, 'emissive'));
    furnaceMouth.position.set(0.95, 0.55, 0.74);
    const craftOrb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), palette.getMat(0x38bdf8, 'emissive'));
    craftOrb.position.set(0.15, 2.05, 0);
    craftOrb.userData.animKind = 'bob';
    craftOrb.userData.baseY = 2.05;
    craftOrb.userData.phase = 1.1;
    animatables.push(craftOrb);
    craftStation.add(tableBase, tableTop, furnaceBody, furnaceMouth, craftOrb);
    group.add(craftStation);
    caveColliders.push({ x: 5.65, z: 35.5, halfW: 1.65, halfD: 0.95, minY: 0, maxY: 2.2 });
  }

  // 4. Mossy Cylindrical Stone Well at (9.5, 0, 41.5)
  {
    const well = new THREE.Group();
    well.position.set(9.5, 0, 41.5);
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(1.55, 1.65, 1.15, 12, 1, true),
      palette.getMat(0x475569, 'matte'),
    );
    rim.position.y = 0.575;
    rim.castShadow = true;
    const topRing = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.25, 6, 12), palette.getMat(0x3f6212, 'matte'));
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = 1.16;
    const wellWater = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.38, 0.14, 12), wellWaterMat);
    wellWater.position.y = 0.55;
    wellWater.userData.animKind = 'uvScroll';
    wellWater.userData.scrollU = 0.12;
    wellWater.userData.scrollV = 0.08;
    animatables.push(wellWater);
    well.add(rim, topRing, wellWater);
    group.add(well);
    caveColliders.push({ x: 9.5, z: 41.5, halfW: 1.65, halfD: 1.65, minY: 0, maxY: 1.65 });
  }

  // 5. Glowing Cyan Square Exit Teleport Pad on Exit Terrace (-14.5, 3.5, 29.0)
  const exitPadPos = new THREE.Vector3(-14.5, 3.5, 29.0);
  const exitGate = new THREE.Group();
  exitGate.position.copy(exitPadPos);
  exitGate.userData.exitPad = true;
  {
    const frameBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.22, 3.6), palette.getMat(0x334155, 'matte'));
    frameBase.position.y = 0.11;
    const padCore = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.16, 2.85), bluePortalMat);
    padCore.position.y = 0.2;
    const auraBeam = new THREE.Mesh(
      new THREE.BoxGeometry(2.45, 3.0, 2.45),
      palette.createSurfaceMat({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.75,
        transparent: true,
        opacity: 0.24,
        roughness: 0.1,
      }),
    );
    auraBeam.position.y = 1.7;
    auraBeam.userData.animKind = 'bob';
    auraBeam.userData.baseY = 1.7;
    auraBeam.userData.phase = 0.5;
    animatables.push(auraBeam);
    exitGate.add(frameBase, padCore, auraBeam);
    group.add(exitGate);

    // Stacked wooden crates beside Exit Pad & Door 3 (with solid colliders!)
    const crate1 = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.15, 1.15), palette.getMat(0x854d0e, 'matte'));
    crate1.position.set(-20.8, 3.5 + 0.575, 29.5);
    crate1.castShadow = true;
    const crate2 = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.95), palette.getMat(0x713f12, 'matte'));
    crate2.position.set(-20.9, 3.5 + 1.15 + 0.475, 29.5);
    crate2.castShadow = true;
    const crate3 = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.05, 1.05), palette.getMat(0x92400e, 'matte'));
    crate3.position.set(-19.6, 3.5 + 0.525, 30.2);
    crate3.castShadow = true;
    group.add(crate1, crate2, crate3);
    caveColliders.push({ x: -20.85, z: 29.5, halfW: 0.62, halfD: 0.62, minY: 3.5, maxY: 5.7 });
    caveColliders.push({ x: -19.6, z: 30.2, halfW: 0.56, halfD: 0.56, minY: 3.5, maxY: 4.7 });
  }

  // 6. NW Mossy Arched Grotto (Red Ribbon) at (-44.5, 4.0, -4.0) with solid vault walls
  {
    const grottoArch = new THREE.Group();
    grottoArch.position.set(-45.5, 4.0, -4.0);
    for (let k = -3; k <= 3; k++) {
      const archH = 4.6 - Math.abs(k) * 0.4;
      const mossV = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 1.1, 1.2),
        palette.getMat(k % 2 === 0 ? 0x3f6212 : 0x4d7c0f, 'matte'),
      );
      mossV.position.set(0, archH, k * 1.15);
      grottoArch.add(mossV);
    }
    group.add(grottoArch);
    // Solid grotto back & side walls + vault ceiling so player/monsters cannot clip out
    addWallBox(-48.2, 6.4, -4.0, 1.6, 5.4, 8.8, 0x262d3b, true);
    addWallBox(-45.5, 6.2, -7.8, 4.2, 5.0, 1.4, 0x3f6212, true);
    addWallBox(-45.5, 6.2, -0.2, 4.2, 5.0, 1.4, 0x3f6212, true);
    caveColliders.push({ x: -45.5, z: -4.0, halfW: 2.0, halfD: 4.0, minY: 7.7, maxY: 9.8 });
  }

  // 7. NW Diamond Ore & Crates Framing Weapon Chest at (-25.5, 3.5, -31.5) (all solid!)
  const chestX = -25.5;
  const chestY = 3.5;
  const chestZ = -31.5;
  {
    glowCyanSpecs.push(
      { x: -29.0, y: 4.5, z: -32.0, sx: 1.8, sy: 1.8, sz: 1.8, color: 0x22d3ee },
      { x: -29.2, y: 6.3, z: -31.8, sx: 1.6, sy: 1.6, sz: 1.6, color: 0x67e8f9 },
      { x: -27.4, y: 4.4, z: -34.2, sx: 1.7, sy: 1.7, sz: 1.7, color: 0x22d3ee },
      { x: -23.0, y: 4.3, z: -33.2, sx: 1.5, sy: 1.5, sz: 1.5, color: 0x06b6d4 },
    );
    stoneSpecs.push(
      { x: -22.5, y: 4.1, z: -30.5, sx: 1.2, sy: 1.2, sz: 1.2, color: pickShade(WOOD_SHADES, 1, 2) },
      { x: -21.8, y: 4.1, z: -32.2, sx: 1.1, sy: 1.1, sz: 1.1, color: pickShade(WOOD_SHADES, 2, 3) },
    );
    caveColliders.push(
      { x: -29.1, z: -31.9, halfW: 0.95, halfD: 0.95, minY: 3.5, maxY: 7.2 },
      { x: -27.4, z: -34.2, halfW: 0.9, halfD: 0.9, minY: 3.5, maxY: 5.5 },
      { x: -23.0, z: -33.2, halfW: 0.8, halfD: 0.8, minY: 3.5, maxY: 5.2 },
      { x: -22.5, z: -30.5, halfW: 0.65, halfD: 0.65, minY: 3.5, maxY: 4.8 },
      { x: -21.8, z: -32.2, halfW: 0.6, halfD: 0.6, minY: 3.5, maxY: 4.8 },
    );
  }

  // 8. Boss Courtyard 3 Glowing Magic Floor Sigils + Corner Braziers (y = 9.5)
  {
    const makeBossSquareSigil = (sx: number, sz: number) => {
      const grp = new THREE.Group();
      grp.position.set(sx, 9.54, sz);
      const outer = new THREE.Mesh(new THREE.RingGeometry(2.5, 3.05, 4), goldSigilMat);
      outer.rotation.x = -Math.PI / 2;
      outer.rotation.z = Math.PI / 4;
      const inner = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.5, 4), goldSigilMat);
      inner.rotation.x = -Math.PI / 2;
      grp.add(outer, inner);
      group.add(grp);
    };
    makeBossSquareSigil(-7.5, -33.5);
    makeBossSquareSigil(11.5, -33.5);

    const mandalaGrp = new THREE.Group();
    mandalaGrp.position.set(2.0, 9.55, -33.5);
    const mOuter = new THREE.Mesh(new THREE.RingGeometry(3.2, 3.8, 28), emeraldSigilMat);
    mOuter.rotation.x = -Math.PI / 2;
    const mInner = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.85, 6), emeraldSigilMat);
    mInner.rotation.x = -Math.PI / 2;
    mandalaGrp.add(mOuter, mInner);
    group.add(mandalaGrp);

    // Boss courtyard rim parapet blocks (skip stair openings at [-13.5..-9.5], [5.5..9.5], [24..29])
    for (let px = -15.5; px <= 23.5; px += 3.0) {
      const nearStair =
        Math.abs(px + 11.5) < 3.0 || Math.abs(px - 7.5) < 3.0;
      if (nearStair) continue;
      stoneSpecs.push({ x: px, y: 9.85, z: -22.3, sx: 2.2, sy: 0.7, sz: 0.7, color: 0x525d6d });
      caveColliders.push({ x: px, z: -22.3, halfW: 1.1, halfD: 0.4, minY: 9.4, maxY: 10.6 });
    }

    // Glowing Amber Brazier Pillars framing the Boss Courtyard overlooks
    [
      [-3.5, 9.5, -22.4],
      [11.5, 9.5, -22.4],
      [-15.5, 9.5, -30.5],
      [19.5, 9.5, -30.5],
    ].forEach(([bx, by, bz]) => {
      const ped = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.25, 1.1), palette.getMat(0x374151, 'matte'));
      ped.position.set(bx, by + 0.625, bz);
      const fire = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.6, 0.75), brazierGlowMat);
      fire.position.set(bx, by + 1.5, bz);
      group.add(ped, fire);
      caveColliders.push({ x: bx, z: bz, halfW: 0.65, halfD: 0.65, minY: by, maxY: by + 2.2 });
    });
  }

  // 9. Atmospheric Cliff Doorways matching the 2 extra doors visible in concept art
  const buildDecorCliffDoor = (dx: number, dy: number, dz: number, rotY: number) => {
    const dg = new THREE.Group();
    dg.position.set(dx, dy, dz);
    dg.rotation.y = rotY;
    const fL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.6, 0.9), palette.getMat(0x374151, 'matte'));
    fL.position.set(-1.3, 1.8, 0);
    const fR = fL.clone();
    fR.position.x = 1.3;
    const fTop = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.75, 1.0), palette.getMat(0x475569, 'matte'));
    fTop.position.set(0, 3.85, 0);
    const wood = new THREE.Mesh(new THREE.BoxGeometry(1.9, 3.5, 0.3), palette.getMat(0x452814, 'matte'));
    wood.position.set(0, 1.75, -0.05);
    const rune = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.95, 0.12), brazierGlowMat);
    rune.position.set(0, 2.1, 0.14);
    [-1.75, 1.75].forEach((tx) => {
      const flame = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.26), brazierGlowMat);
      flame.position.set(tx, 2.25, 0.45);
      dg.add(flame);
    });
    dg.add(fL, fR, fTop, wood, rune);
    group.add(dg);
  };
  // North-of-West-Maze cliff door & Upper NW back wall door (both embedded flush into rock + solid OBB!)
  buildDecorCliffDoor(-37.0, 2.0, -15.5, 0.25);
  buildDecorCliffDoor(-16.0, 9.5, -48.0, 0);
  caveColliders.push(
    { x: -37.0, z: -15.5, halfW: 1.78, halfD: 0.68, rotY: 0.25, minY: 2.0, maxY: 6.5 },
    { x: -16.0, z: -48.0, halfW: 1.78, halfD: 0.68, rotY: 0, minY: 9.5, maxY: 14.0 },
  );

  // Flush Instanced Voxel Batches
  const stoneBatch = buildVoxelBatch(stoneSpecs, voxelMat, true, true);
  disposables.push(stoneBatch.geometry);
  group.add(stoneBatch);
  cameraOccluders.push(stoneBatch);

  if (glowCyanSpecs.length > 0) {
    const cyanBatch = buildVoxelBatch(glowCyanSpecs, crystalCyanMat, false, false);
    disposables.push(cyanBatch.geometry);
    group.add(cyanBatch);
  }
  if (glowPurpleSpecs.length > 0) {
    const purpleBatch = buildVoxelBatch(glowPurpleSpecs, crystalPurpleMat, false, false);
    disposables.push(purpleBatch.geometry);
    group.add(purpleBatch);
  }

  // --------------------------------------------------------------------------
  // G. Attach 5 Mission Doors, Solid Door OBB Colliders, Mist Layers & Cave Lighting
  // --------------------------------------------------------------------------
  doors.forEach((d) => {
    group.add(d.group);
    cameraOccluders.push(d.group);
  });

  // Solid physical colliders for all 5 mission doors + props so neither players nor monsters pass/trap inside!
  {
    // Door 0: Sumur Tua open stone ruin arch at (12.8, 0, 44.5, rotY=-0.78) — side pillars + overhead lintel solid, center walkable
    const d0Rot = -0.78;
    const d0Cos = Math.cos(d0Rot);
    const d0Sin = Math.sin(d0Rot);
    caveColliders.push(
      {
        x: 12.8 - 1.55 * d0Cos,
        z: 44.5 + 1.55 * d0Sin,
        halfW: 0.6,
        halfD: 0.62,
        rotY: d0Rot,
        minY: 0,
        maxY: 6.0,
      },
      {
        x: 12.8 + 1.55 * d0Cos,
        z: 44.5 - 1.55 * d0Sin,
        halfW: 0.6,
        halfD: 0.62,
        rotY: d0Rot,
        minY: 0,
        maxY: 6.0,
      },
      {
        x: 12.8,
        z: 44.5,
        halfW: 2.2,
        halfD: 0.65,
        rotY: d0Rot,
        minY: 4.15,
        maxY: 6.1,
      },
    );

    // Door 1: Jembatan Batu at (7.4, 3.5, 12.2, rotY=-0.82) — solid door frame & closed leaves
    const d1Rot = -0.82;
    const d1Cos = Math.cos(d1Rot);
    const d1Sin = Math.sin(d1Rot);
    caveColliders.push({
      x: 7.4 - 0.55 * d1Sin,
      z: 12.2 - 0.55 * d1Cos,
      halfW: 2.45,
      halfD: 0.92,
      rotY: d1Rot,
      minY: 3.5,
      maxY: 9.6,
    });

    // Door 2: Lumbung Guardhouse at (37.0, 3.5, 10.5, rotY=-Math.PI/2) — solid leaves + flanking crate & barrel
    caveColliders.push(
      { x: 37.45, z: 10.5, halfW: 0.9, halfD: 2.4, minY: 3.5, maxY: 9.2 },
      { x: 36.55, z: 12.8, halfW: 0.52, halfD: 0.52, minY: 3.5, maxY: 5.0 },
      { x: 36.55, z: 8.15, halfW: 0.5, halfD: 0.5, minY: 3.5, maxY: 5.0 },
    );

    // Door 3: Parit at (-22.2, 3.5, 25.5, rotY=Math.PI/2) — solid leaves embedded into West cliff
    caveColliders.push({ x: -22.7, z: 25.5, halfW: 0.92, halfD: 2.4, minY: 3.5, maxY: 9.6 });

    // Door 4: Sel Tebing Rani colossal double gate at (2.0, 9.5, -47.2, rotY=0) + flanking lamp pedestals
    caveColliders.push(
      { x: 2.0, z: -47.95, halfW: 3.6, halfD: 1.0, minY: 9.5, maxY: 20.5 },
      { x: -2.3, z: -45.95, halfW: 0.54, halfD: 0.54, minY: 9.5, maxY: 13.0 },
      { x: 6.3, z: -45.95, halfW: 0.54, halfD: 0.54, minY: 9.5, maxY: 13.0 },
    );
  }

  // Atmospheric Drifting Cavern Mist Planes (hidden on minimap snapshots)
  {
    const mistGroup = new THREE.Group();
    mistGroup.userData.isMapHidden = true;
    const mistSpecs: Array<[number, number, number, number, number, number]> = [
      [-6.0, 0.25, 3.0, 14, 14, 0.26],
      [-2.0, 0.15, 19.0, 16, 16, 0.24],
      [11.0, 0.1, 31.0, 18, 18, 0.25],
      [20.0, 0.2, 42.0, 16, 16, 0.22],
      [-25.0, 5.2, -31.0, 15, 15, 0.16],
      [2.0, 11.4, -36.0, 22, 16, 0.14],
      [34.0, 6.2, -26.0, 14, 14, 0.18],
    ];
    mistSpecs.forEach(([mx, my, mz, mw, mh, op], idx) => {
      const mGeo = new THREE.PlaneGeometry(mw, mh);
      const mMat = new THREE.MeshBasicMaterial({
        map: caveMistTex,
        color: idx < 4 ? 0x67e8f9 : 0xa5b4fc,
        transparent: true,
        opacity: op,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mPlane = new THREE.Mesh(mGeo, mMat);
      mPlane.rotation.x = -Math.PI / 2;
      mPlane.position.set(mx, my, mz);
      mPlane.userData.isMapHidden = true;
      mPlane.userData.animKind = 'mist';
      mPlane.userData.baseX = mx;
      mPlane.userData.baseZ = mz;
      mPlane.userData.baseOpacity = op;
      mPlane.userData.phase = idx * 1.15;
      animatables.push(mPlane);
      disposables.push(mGeo, mMat);
      mistGroup.add(mPlane);
    });
    group.add(mistGroup);
  }

  // Warm ambient point lights across the key visual landmarks (capped gently for FPS)
  const keyLights: Array<[number, number, number, number, number, number]> = [
    [-1.5, 5.5, 40.0, 0xfbbf24, 1.6, 26],   // Lower plaza & forge
    [-6.0, 3.0, 15.0, 0x22d3ee, 2.2, 28],   // Crystal river glow under bridge
    [13.0, 3.0, 32.0, 0x22d3ee, 1.8, 24],   // SE crystal cluster
    [-25.5, 6.8, -30.0, 0x38bdf8, 1.7, 22], // NW Diamond Chest Alcove
    [2.0, 16.5, -33.5, 0xfde047, 2.0, 36],  // High Boss Courtyard
    [35.5, 13.5, -30.5, 0xf97316, 1.6, 20], // NE Hanging Prison
  ];
  keyLights.forEach(([lx, ly, lz, hex, intensity, dist]) => {
    const ptLight = new THREE.PointLight(hex, intensity, dist, 1.35);
    ptLight.position.set(lx, ly, lz);
    group.add(ptLight);
  });

  // --------------------------------------------------------------------------
  // H. Mineable Cave Blocks (positioned cleanly in side pockets, never blocking stairs)
  // --------------------------------------------------------------------------
  const blockMeta: Record<CaveBlockKind, { label: string; hp: number; mat: THREE.Material }> = {
    stone: { label: 'Batu Gua', hp: 2, mat: sharedRigTools.stoneBlockMat },
    moss_dirt: { label: 'Tanah Berlumut', hp: 1, mat: sharedRigTools.mossBlockMat },
    diamond_ore: { label: 'Bijih Berlian', hp: 3, mat: sharedRigTools.diamondOreMat },
    heart_ore: { label: 'Kristal Hati', hp: 2, mat: sharedRigTools.heartOreMat },
    word_seal: { label: 'Segel Rune Kata', hp: 3, mat: sharedRigTools.wordSealMat },
    player_shield: { label: 'Blok Pelindung', hp: 4, mat: sharedRigTools.shieldBlockMat },
  };
  const blockCoords: Array<[number, number, CaveBlockKind]> = [
    [-18.0, 31.5, 'stone'],
    [-17.8, 22.5, 'diamond_ore'],
    [-32.0, 17.5, 'moss_dirt'],
    [-38.5, 12.5, 'stone'],
    [-30.0, -2.5, 'heart_ore'],
    [-22.0, -26.0, 'diamond_ore'],
    [-28.5, -24.0, 'diamond_ore'],
    [18.0, 21.5, 'stone'],
    [38.0, 20.0, 'moss_dirt'],
    [28.0, 14.0, 'heart_ore'],
    [38.0, -2.0, 'diamond_ore'],
    [-13.0, -28.0, 'word_seal'],
    [18.0, -28.0, 'word_seal'],
    [31.0, -28.0, 'stone'],
    [31.0, -34.0, 'diamond_ore'],
  ];
  blockCoords.forEach(([bx, bz, kind], idx) => {
    const info = blockMeta[kind];
    const id = `cb_desa_sapaan_${idx}`;
    const baseY = sampleDesaCaveGroundY(bx, bz, 10);
    const blockY = baseY + 1.05;
    const mesh = new THREE.Mesh(sharedRigTools.blockGeo, info.mat);
    mesh.position.set(bx, blockY, bz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.caveBlockId = id;
    group.add(mesh);
    caveBlocks.push({
      id,
      kind,
      label: info.label,
      x: bx,
      y: blockY,
      z: bz,
      halfW: 1.0,
      hp: info.hp,
      maxHp: info.hp,
      mesh,
      alive: true,
      hasAmbush: idx % 5 === 1,
    });
  });

  group.add(
    sharedRigTools.blockHighlight,
    sharedRigTools.blockPlacePreview,
    sharedRigTools.torchPreview,
  );

  // --------------------------------------------------------------------------
  // I. Golden Weapon Chest, NE Hanging Cliff Prison, Boss Key & Red Ribbon
  // --------------------------------------------------------------------------
  const chestGroup = new THREE.Group();
  chestGroup.position.set(chestX, chestY, chestZ);
  chestGroup.userData.caveWeaponChest = true;
  const chestBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.95, 1.2), palette.getMat(0x92400e, 'matte'));
  chestBase.position.y = 0.475;
  chestBase.castShadow = true;
  const chestBand = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.22, 1.26), palette.getMat(0xfbbf24, 'emissive'));
  chestBand.position.y = 0.88;
  const chestOrb = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), palette.getMat(0x38bdf8, 'emissive'));
  chestOrb.position.set(0, 2.38, 0);
  chestOrb.userData.animKind = 'bob';
  chestOrb.userData.baseY = 2.38;
  chestOrb.userData.phase = 0.4;
  animatables.push(chestOrb);
  const chestGun = createWeaponMesh('kerikil', palette, 1.25);
  chestGun.position.set(0, 1.56, 0);
  chestGun.rotation.set(0.18, 0.4, 0.1);
  chestGun.userData.animKind = 'spin';
  animatables.push(chestGun);
  chestGroup.add(chestBase, chestBand, chestOrb, chestGun);
  group.add(chestGroup);
  caveColliders.push({ x: chestX, z: chestZ, halfW: 0.85, halfD: 0.72, minY: chestY, maxY: chestY + 1.5 });
  const weaponChest: CaveWeaponChestRig = {
    x: chestX,
    y: chestY,
    z: chestZ,
    group: chestGroup,
    orb: chestOrb,
    collected: false,
  };

  // NE Hanging Cliff Prison Cell (y = 9.5, X=37.5, Z=-31.5)
  const prisonPos = new THREE.Vector3(37.5, 9.5, -31.5);
  const prisonGroup = new THREE.Group();
  prisonGroup.position.copy(prisonPos);
  prisonGroup.userData.hiddenPrison = true;
  const cellPad = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.24, 4.0), palette.getMat(0x334155, 'matte'));
  cellPad.position.y = 0.12;
  const cellRoof = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.2, 4.4), palette.getMat(0x374151, 'matte'));
  cellRoof.position.y = 3.9;
  const cellBack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.6, 4.2), palette.getMat(0x262d3b, 'matte'));
  cellBack.position.set(1.9, 1.8, 0);
  const cellSideN = new THREE.Mesh(new THREE.BoxGeometry(4.0, 3.6, 0.5), palette.getMat(0x262d3b, 'matte'));
  cellSideN.position.set(0, 1.8, -1.9);
  const cellSideS = cellSideN.clone();
  cellSideS.position.z = 1.9;
  // Torch at prison corner
  const pTorchPost = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.85, 0.22), palette.getMat(0x713f12, 'matte'));
  pTorchPost.position.set(-2.05, 1.8, 1.95);
  const pTorchFlame = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.28), brazierGlowMat);
  pTorchFlame.position.set(-2.05, 2.35, 1.95);
  prisonGroup.add(cellPad, cellRoof, cellBack, cellSideN, cellSideS, pTorchPost, pTorchFlame, sharedRigTools.prisonBars);
  sharedRigTools.captiveMesh.position.set(0.15, 0.24, 0);
  sharedRigTools.captiveMesh.rotation.y = -Math.PI / 2;
  prisonGroup.add(sharedRigTools.captiveMesh);
  group.add(prisonGroup);
  caveColliders.push({ x: 39.4, z: -31.5, halfW: 0.4, halfD: 2.1, minY: 9.5, maxY: 14.0 });
  caveColliders.push({ x: 37.5, z: -33.4, halfW: 2.1, halfD: 0.35, minY: 9.5, maxY: 14.0 });
  caveColliders.push({ x: 37.5, z: -29.6, halfW: 2.1, halfD: 0.35, minY: 9.5, maxY: 14.0 });
  caveColliders.push({ x: 37.5, z: -31.5, halfW: 2.2, halfD: 2.2, minY: 12.8, maxY: 14.4 });

  // Boss Spawn & Prison Key Drop Position right in center of High Boss Courtyard (y = 9.5)
  const bossSpawnPos = new THREE.Vector3(2.0, 9.5, -33.5);
  sharedRigTools.prisonKeyGroup.position.copy(bossSpawnPos);
  group.add(sharedRigTools.prisonKeyGroup);

  // Red Ribbon inside the Mossy West Grotto (y = 4.0)
  const ribbonPos = new THREE.Vector3(-44.5, 4.0, -4.0);
  sharedRigTools.ribbonGroup.position.copy(ribbonPos);
  group.add(sharedRigTools.ribbonGroup);

  // Dummy inside guardian (Desa Sapaan uses outside Pak Budi reunion!)
  const guardianPos = new THREE.Vector3(4.8, 0, 11.8);

  return {
    group,
    animatables,
    doors,
    exitPadPos,
    exitClickable: exitGate,
    craftingTablePos,
    caveBlocks,
    caveColliders,
    platforms,
    chasms,
    traps,
    blockHighlight: sharedRigTools.blockHighlight,
    blockPlacePreview: sharedRigTools.blockPlacePreview,
    torchPreview: sharedRigTools.torchPreview,
    shieldBlockMat: sharedRigTools.shieldBlockMat,
    shieldBlockGeo: sharedRigTools.blockGeo,
    crackMaterials: sharedRigTools.crackMaterials,
    crackGeo: sharedRigTools.crackGeo,
    weaponChest,
    hasInsideGuardian: false,
    guardianPos,
    guardianMesh: sharedRigTools.guardianMesh,
    guardianAuraMat: sharedRigTools.guardianAuraMat,
    prisonPos,
    prisonGroup,
    prisonBars: sharedRigTools.prisonBars,
    prisonLockMat: sharedRigTools.prisonLockMat as DungeonArenaRig['prisonLockMat'],
    captiveMesh: sharedRigTools.captiveMesh,
    prisonKeyGroup: sharedRigTools.prisonKeyGroup,
    ribbonPos,
    ribbonGroup: sharedRigTools.ribbonGroup,
    ribbonPivot: sharedRigTools.ribbonPivot,
    ribbonRingMat: sharedRigTools.ribbonRingMat,
    cameraOccluders,
    disposables,
    halfBound: PLAYABLE_HALF_BOUND,
    ceilingY: CAVE_CEILING_Y,
    spawnPos: new THREE.Vector3(0, 0, 42.5),
    bossSpawnPos,
    bossGuardCoords: [
      [-7.5, -33.5],
      [11.5, -33.5],
    ],
    monsterSpawns: {
      quizCoords: [
        [-26.5, 7.5],
        [28.5, 8.5],
        [2.0, -27.5],
      ],
      brawlerCoords: [
        [-31.5, 3.0],
        [29.5, 15.5],
      ],
      creeperSpots: [
        [-25.5, -20.5],
        [4.2, 10.8],
      ],
      batSpots: [
        [-2.0, 12.0],
        [15.0, -25.0],
      ],
      shooterCoords: [
        [-20.5, -8.5],
        [34.5, -2.5],
      ],
    },
    customGroundHeight: sampleDesaCaveGroundY,
  };
}

interface SurfaceMaterialLike {
  color: THREE.Color;
  emissive: THREE.Color;
  emissiveIntensity: number;
  dispose: () => void;
}
