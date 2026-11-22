import * as THREE from 'three';
import { ZoneId } from '../types/game';
import { MaterialPalette } from './materials';
import { VillageObstacle } from './minecraftVillage';

export const IELTS_TEMPORARILY_LOCKED = true;

export const OVERWORLD_ANCHORS = {
  hub: { x: 0, y: 2.4, z: 0 },
  desaSpawn: { x: 0, y: 1.6, z: 60.5, yaw: Math.PI },
  starterWeapon: { x: -6.2, y: 1.6, z: 57.5 },
  portal: { x: 7.5, y: 2.4, z: -61.5 },
  istanaFloating: { x: 86, y: 23, z: -74 },
  zones: {
    desa_sapaan: { x: 0, y: 1.6, z: 54 },
    pasar_rasa: { x: -50, y: 1.4, z: 29 },
    hutan_satwa: { x: 50, y: 1.6, z: 29 },
    gerbang_kota: { x: -50, y: 3.8, z: -31 },
    menara_waktu: { x: 50, y: 3.4, z: -31 },
    gua_portal: { x: 0, y: 2.4, z: -62 },
  } as Record<ZoneId, { x: number; y: number; z: number }>,
  npcs: {
    npc_tetua: { x: 4.4, z: 51.2, rotY: -0.65 },
    npc_koki: { x: -45.4, z: 25.2, rotY: 0.55 },
    npc_rubah: { x: 47.6, z: 24.4, rotY: -0.75 },
    npc_penjaga: { x: -43.8, z: -24.0, rotY: 0.65 },
    npc_penyihir: { x: 44.8, z: -24.2, rotY: -0.65 },
    npc_portal: { x: -4.2, z: -57.2, rotY: 0.45 },
  } as Record<string, { x: number; z: number; rotY: number }>,
  guardPosts: {
    npc_tetua: { x: 7.2, z: 46.8, rotY: -0.9, bedTint: 0xf59e0b },
    npc_koki: { x: -41.5, z: 29.8, rotY: -0.7, bedTint: 0xef4444 },
    npc_rubah: { x: 43.2, z: 21.8, rotY: 0.85, bedTint: 0x10b981 },
    npc_penjaga: { x: -40.2, z: -28.5, rotY: -1.1, bedTint: 0x3b82f6 },
    npc_penyihir: { x: 41.4, z: -28.6, rotY: 1.1, bedTint: 0x8b5cf6 },
    npc_portal: { x: -9.5, z: -55.2, rotY: 0.7, bedTint: 0xa855f7 },
  } as Record<string, { x: number; z: number; rotY: number; bedTint: number }>,
} as const;

export interface IslandDisk {
  id: 'hub' | ZoneId;
  cx: number;
  cz: number;
  radius: number;
  groundY: number;
}

export interface BridgeSpan {
  id: string;
  ax: number;
  az: number;
  ay: number;
  bx: number;
  bz: number;
  by: number;
  halfWidth: number;
  archHeight: number;
  style: 'wood' | 'rope' | 'stone' | 'highway';
}

export const ISLAND_DISKS: IslandDisk[] = [
  { id: 'hub', cx: 0, cz: 0, radius: 17.5, groundY: 2.4 },
  { id: 'desa_sapaan', cx: 0, cz: 54, radius: 21.0, groundY: 1.6 },
  { id: 'pasar_rasa', cx: -50, cz: 29, radius: 20.0, groundY: 1.4 },
  { id: 'hutan_satwa', cx: 50, cz: 29, radius: 20.5, groundY: 1.6 },
  { id: 'gerbang_kota', cx: -50, cz: -31, radius: 20.5, groundY: 3.8 },
  { id: 'menara_waktu', cx: 50, cz: -31, radius: 20.0, groundY: 3.4 },
  { id: 'gua_portal', cx: 0, cz: -62, radius: 20.0, groundY: 2.4 },
];

export const BRIDGE_SPANS: BridgeSpan[] = [
  {
    id: 'bridge_desa',
    ax: 0,
    az: 15.6,
    ay: 2.4,
    bx: 0,
    bz: 35.2,
    by: 1.6,
    halfWidth: 2.7,
    archHeight: 0.35,
    style: 'wood',
  },
  {
    id: 'bridge_pasar',
    ax: -13.6,
    az: 7.8,
    ay: 2.4,
    bx: -33.6,
    bz: 19.8,
    by: 1.4,
    halfWidth: 2.5,
    archHeight: 0.3,
    style: 'wood',
  },
  {
    id: 'bridge_satwa',
    ax: 13.6,
    az: 7.8,
    ay: 2.4,
    bx: 33.6,
    bz: 19.8,
    by: 1.6,
    halfWidth: 2.6,
    archHeight: 0.78,
    style: 'rope',
  },
  {
    id: 'bridge_gerbang',
    ax: -13.6,
    az: -8.2,
    ay: 2.4,
    bx: -33.6,
    bz: -20.8,
    by: 3.8,
    halfWidth: 2.7,
    archHeight: 0.35,
    style: 'stone',
  },
  {
    id: 'bridge_menara',
    ax: 13.6,
    az: -8.2,
    ay: 2.4,
    bx: 33.6,
    bz: -20.8,
    by: 3.4,
    halfWidth: 2.6,
    archHeight: 0.35,
    style: 'stone',
  },
  {
    id: 'bridge_portal',
    ax: 0,
    az: -15.6,
    ay: 2.4,
    bx: 0,
    bz: -44.0,
    by: 2.4,
    halfWidth: 2.8,
    archHeight: 0.4,
    style: 'stone',
  },
  {
    id: 'highway_gerbang',
    ax: -63.0,
    az: -23.0,
    ay: 3.8,
    bx: -89.5,
    bz: -23.0,
    by: 3.8,
    halfWidth: 3.3,
    archHeight: 0.0,
    style: 'highway',
  },
];

function evalBridgeSample(
  b: BridgeSpan,
  x: number,
  z: number,
): { distSq: number; t: number; y: number; clampedX: number; clampedZ: number } {
  const vx = b.bx - b.ax;
  const vz = b.bz - b.az;
  const lenSq = vx * vx + vz * vz || 1;
  const rawT = ((x - b.ax) * vx + (z - b.az) * vz) / lenSq;
  const t = Math.max(0, Math.min(1, rawT));
  const projX = b.ax + vx * t;
  const projZ = b.az + vz * t;
  const dx = x - projX;
  const dz = z - projZ;
  const perpDist = Math.hypot(dx, dz);
  const clampedPerp = Math.max(0, perpDist - b.halfWidth);
  const scale = perpDist > 0.0001 ? Math.min(1, b.halfWidth / perpDist) : 1;
  const clampedX = projX + dx * scale;
  const clampedZ = projZ + dz * scale;
  const y = b.ay + (b.by - b.ay) * t + Math.sin(t * Math.PI) * b.archHeight;
  return { distSq: clampedPerp * clampedPerp, t, y, clampedX, clampedZ };
}

export function getArchipelagoGroundY(x: number, z: number): number {
  let bestBridgeY: number | null = null;
  let bestBridgePerp = Infinity;

  for (let i = 0; i < BRIDGE_SPANS.length; i++) {
    const b = BRIDGE_SPANS[i];
    const vx = b.bx - b.ax;
    const vz = b.bz - b.az;
    const lenSq = vx * vx + vz * vz || 1;
    const rawT = ((x - b.ax) * vx + (z - b.az) * vz) / lenSq;
    if (rawT >= -0.02 && rawT <= 1.02) {
      const t = Math.max(0, Math.min(1, rawT));
      const px = b.ax + vx * t;
      const pz = b.az + vz * t;
      const perp = Math.hypot(x - px, z - pz);
      if (perp <= b.halfWidth + 0.55 && perp < bestBridgePerp) {
        bestBridgePerp = perp;
        bestBridgeY = b.ay + (b.by - b.ay) * t + Math.sin(t * Math.PI) * b.archHeight;
      }
    }
  }

  for (let i = 0; i < ISLAND_DISKS.length; i++) {
    const isl = ISLAND_DISKS[i];
    const d = Math.hypot(x - isl.cx, z - isl.cz);
    if (d <= isl.radius + 0.5) {
      if (bestBridgeY !== null && d > isl.radius - 2.6) {
        return Math.max(isl.groundY, bestBridgeY);
      }
      return isl.groundY;
    }
  }

  if (bestBridgeY !== null) {
    return bestBridgeY;
  }

  return 1.6;
}

export function isWalkableArchipelago(x: number, z: number, margin = 0): boolean {
  for (let i = 0; i < ISLAND_DISKS.length; i++) {
    const isl = ISLAND_DISKS[i];
    const r = Math.max(2, isl.radius - margin);
    if (Math.hypot(x - isl.cx, z - isl.cz) <= r) return true;
  }
  for (let i = 0; i < BRIDGE_SPANS.length; i++) {
    const b = BRIDGE_SPANS[i];
    const vx = b.bx - b.ax;
    const vz = b.bz - b.az;
    const lenSq = vx * vx + vz * vz || 1;
    const rawT = ((x - b.ax) * vx + (z - b.az) * vz) / lenSq;
    if (rawT >= -0.03 && rawT <= 1.03) {
      const t = Math.max(0, Math.min(1, rawT));
      const px = b.ax + vx * t;
      const pz = b.az + vz * t;
      if (Math.hypot(x - px, z - pz) <= Math.max(0.75, b.halfWidth - margin * 0.5)) {
        return true;
      }
    }
  }
  return false;
}

export function constrainToWalkableArchipelago(
  pos: { x: number; z: number },
  margin = 0.65,
): void {
  if (isWalkableArchipelago(pos.x, pos.z, margin)) return;

  let bestX: number = OVERWORLD_ANCHORS.desaSpawn.x;
  let bestZ: number = OVERWORLD_ANCHORS.desaSpawn.z;
  let bestDistSq = Infinity;

  for (let i = 0; i < ISLAND_DISKS.length; i++) {
    const isl = ISLAND_DISKS[i];
    const r = Math.max(2, isl.radius - margin);
    const dx = pos.x - isl.cx;
    const dz = pos.z - isl.cz;
    const d = Math.hypot(dx, dz) || 1;
    const cx = isl.cx + (dx / d) * r;
    const cz = isl.cz + (dz / d) * r;
    const dSq = (pos.x - cx) * (pos.x - cx) + (pos.z - cz) * (pos.z - cz);
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      bestX = cx;
      bestZ = cz;
    }
  }

  for (let i = 0; i < BRIDGE_SPANS.length; i++) {
    const sample = evalBridgeSample(BRIDGE_SPANS[i], pos.x, pos.z);
    if (sample.distSq < bestDistSq) {
      bestDistSq = sample.distSq;
      bestX = sample.clampedX;
      bestZ = sample.clampedZ;
    }
  }

  pos.x = bestX;
  pos.z = bestZ;
}

export function getArchipelagoZoneForPosition(x: number, z: number): ZoneId {
  const zoneIds: ZoneId[] = [
    'desa_sapaan',
    'pasar_rasa',
    'hutan_satwa',
    'gerbang_kota',
    'menara_waktu',
    'gua_portal',
  ];
  let bestId: ZoneId = 'desa_sapaan';
  let bestDistSq = Infinity;
  for (let i = 0; i < zoneIds.length; i++) {
    const zId = zoneIds[i];
    const p = OVERWORLD_ANCHORS.zones[zId];
    const dx = x - p.x;
    const dz = z - p.z;
    const dSq = dx * dx + dz * dz;
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      bestId = zId;
    }
  }
  return bestId;
}

export interface ArchipelagoRig {
  group: THREE.Group;
  walkableTargets: THREE.Object3D[];
  obstacles: VillageObstacle[];
  torchesFlame: THREE.Object3D[];
  waterUniforms: { uTime: { value: number } };
  windmillHub: THREE.Group;
  gears: Array<{ mesh: THREE.Object3D; speed: number }>;
  clockHands: THREE.Group[];
  cars: Array<{ mesh: THREE.Group; baseX: number; rangeX: number; speed: number; phase: number }>;
  minecart: THREE.Group;
  crystalMeshes: THREE.Mesh[];
  lavaMeshes: THREE.Mesh[];
  istanaGroup: THREE.Group;
  istanaDome: THREE.Mesh;
  zooCritters: Array<{
    root: THREE.Group;
    head: THREE.Object3D;
    baseX: number;
    baseZ: number;
    baseYaw: number;
    phase: number;
  }>;
  disposables: Array<{ dispose: () => void }>;
}

interface VoxelSpec {
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  color: number;
}

function hash2(gx: number, gz: number): number {
  const n = Math.sin(gx * 127.1 + gz * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function buildVoxelBatch(
  specs: VoxelSpec[],
  mat: THREE.Material,
  castShadow: boolean,
  receiveShadow: boolean,
): THREE.InstancedMesh {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, specs.length));
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  for (let i = 0; i < specs.length; i++) {
    const s = specs[i];
    dummy.position.set(s.x, s.y, s.z);
    dummy.rotation.set(0, 0, 0);
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

function pushSteppedMountain(
  out: VoxelSpec[],
  opts: {
    cx: number;
    cz: number;
    baseY: number;
    tiers: number;
    baseW: number;
    baseD: number;
    tierH: number;
    shiftX?: number;
    shiftZ?: number;
    rockColors: number[];
    capColors?: number[];
    carveBox?: { minX: number; maxX: number; minZ: number; maxZ: number; maxY: number };
  },
): void {
  const step = 1.8;
  for (let t = 0; t < opts.tiers; t++) {
    const w = Math.max(3.2, opts.baseW - t * 2.2);
    const d = Math.max(3.2, opts.baseD - t * 2.1);
    const tcx = opts.cx + (opts.shiftX ?? 0) * t;
    const tcz = opts.cz + (opts.shiftZ ?? 0) * t;
    const ty = opts.baseY + t * opts.tierH;
    const isTop = t === opts.tiers - 1;
    const nx = Math.max(2, Math.round(w / step));
    const nz = Math.max(2, Math.round(d / step));
    const cellW = w / nx;
    const cellD = d / nz;

    for (let ix = 0; ix < nx; ix++) {
      for (let iz = 0; iz < nz; iz++) {
        const bx = tcx - w * 0.5 + (ix + 0.5) * cellW;
        const bz = tcz - d * 0.5 + (iz + 0.5) * cellD;
        if (
          opts.carveBox &&
          bx >= opts.carveBox.minX &&
          bx <= opts.carveBox.maxX &&
          bz >= opts.carveBox.minZ &&
          bz <= opts.carveBox.maxZ &&
          ty + opts.tierH <= opts.carveBox.maxY
        ) {
          continue;
        }
        const h = hash2(Math.round(bx * 2), Math.round(bz * 2));
        // Trim far corners slightly on outer perimeter for natural voxel silhouette
        const edgeX = ix === 0 || ix === nx - 1;
        const edgeZ = iz === 0 || iz === nz - 1;
        if (edgeX && edgeZ && h > 0.52) continue;

        const bodyHex = opts.rockColors[(ix + iz + t) % opts.rockColors.length];
        out.push({
          x: bx,
          y: ty + opts.tierH * 0.5,
          z: bz,
          sx: cellW * 1.01,
          sy: opts.tierH,
          sz: cellD * 1.01,
          color: bodyHex,
        });

        if (opts.capColors && (isTop || (edgeX || edgeZ ? h > 0.35 : false))) {
          const capHex = opts.capColors[(ix * 3 + iz + t) % opts.capColors.length];
          out.push({
            x: bx,
            y: ty + opts.tierH + 0.16,
            z: bz,
            sx: cellW * 1.01,
            sy: 0.32,
            sz: cellD * 1.01,
            color: capHex,
          });
        }
      }
    }
  }
}

function createToothedGear(
  radius: number,
  thickness: number,
  teeth: number,
  mat: THREE.Material,
  darkMat: THREE.Material,
): THREE.Group {
  const gear = new THREE.Group();
  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.72, radius * 0.15, 6, 18),
    mat,
  );
  outerRing.castShadow = true;
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.28, radius * 0.28, thickness * 1.35, 10),
    darkMat,
  );
  hub.rotation.x = Math.PI / 2;
  gear.add(outerRing, hub);

  // 4 Cross spokes inside gear
  const spokeGeo = new THREE.BoxGeometry(radius * 1.32, radius * 0.14, thickness * 0.68);
  const sp1 = new THREE.Mesh(spokeGeo, darkMat);
  const sp2 = new THREE.Mesh(spokeGeo, darkMat);
  sp2.rotation.z = Math.PI / 2;
  gear.add(sp1, sp2);

  const toothGeo = new THREE.BoxGeometry(radius * 0.27, radius * 0.34, thickness * 0.96);
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const t = new THREE.Mesh(toothGeo, mat);
    t.position.set(Math.cos(a) * radius * 0.92, Math.sin(a) * radius * 0.92, 0);
    t.rotation.z = a;
    t.castShadow = true;
    gear.add(t);
  }
  return gear;
}

function createChiliCluster(palette: MaterialPalette, scale = 1): THREE.Group {
  const g = new THREE.Group();
  const redMat = palette.getMat(0xdc2626, 'gloss');
  const darkRedMat = palette.getMat(0x991b1b, 'matte');
  const stemMat = palette.getMat(0x16a34a, 'matte');

  const seg1 = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.05, 0.72), redMat);
  seg1.position.set(0, 0.9, 0);
  seg1.castShadow = true;
  const seg2 = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.95, 0.56), redMat);
  seg2.position.set(0.1, 0.05, 0.08);
  seg2.rotation.z = 0.22;
  const tip = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.72, 0.34), darkRedMat);
  tip.position.set(0.26, -0.62, 0.16);
  tip.rotation.z = 0.45;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.42), stemMat);
  cap.position.set(-0.02, 1.48, 0);
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.52, 0.2), stemMat);
  stem.position.set(-0.08, 1.82, 0);
  stem.rotation.z = -0.28;
  g.add(seg1, seg2, tip, cap, stem);
  g.scale.setScalar(scale);
  return g;
}

function createGiraffeMesh(palette: MaterialPalette): { root: THREE.Group; head: THREE.Group } {
  const r = new THREE.Group();
  const coat = palette.getMat(0xf59e0b, 'matte');
  const spot = palette.getMat(0x78350f, 'matte');
  const legG = new THREE.BoxGeometry(0.22, 1.35, 0.22);
  [[-0.28, -0.45], [0.28, -0.45], [-0.28, 0.45], [0.28, 0.45]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legG, coat);
    leg.position.set(lx, 0.675, lz);
    leg.castShadow = true;
    r.add(leg);
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.72, 1.35), coat);
  body.position.set(0, 1.55, 0);
  body.castShadow = true;
  const spot1 = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.32, 0.42), spot);
  spot1.position.set(0, 1.62, 0.15);
  const spot2 = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.28, 0.36), spot);
  spot2.position.set(0, 1.48, -0.32);

  const head = new THREE.Group();
  head.position.set(0, 1.8, 0.56);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.85, 0.38), coat);
  neck.position.set(0, 0.92, 0.08);
  neck.rotation.x = 0.12;
  neck.castShadow = true;
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.44, 0.78), coat);
  skull.position.set(0, 1.92, 0.32);
  const hornL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.1), spot);
  hornL.position.set(-0.14, 2.24, 0.14);
  const hornR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.1), spot);
  hornR.position.set(0.14, 2.24, 0.14);
  head.add(neck, skull, hornL, hornR);
  r.add(body, spot1, spot2, head);
  return { root: r, head };
}

function createZebraMesh(palette: MaterialPalette): { root: THREE.Group; head: THREE.Group } {
  const r = new THREE.Group();
  const white = palette.getMat(0xf8fafc, 'matte');
  const dark = palette.getMat(0x1e293b, 'matte');
  const legG = new THREE.BoxGeometry(0.2, 0.72, 0.2);
  [[-0.24, -0.4], [0.24, -0.4], [-0.24, 0.4], [0.24, 0.4]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legG, white);
    leg.position.set(lx, 0.36, lz);
    r.add(leg);
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.62, 1.18), white);
  body.position.set(0, 0.92, 0);
  body.castShadow = true;
  [-0.36, 0, 0.36].forEach((sz) => {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.56, 0.16), dark);
    stripe.position.set(0, 0.94, sz);
    r.add(stripe);
  });
  const head = new THREE.Group();
  head.position.set(0, 1.15, 0.55);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.58, 0.36), white);
  neck.position.set(0, 0.22, 0.05);
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.68), white);
  skull.position.set(0, 0.52, 0.22);
  const mane = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.56, 0.34), dark);
  mane.position.set(0, 0.44, -0.08);
  head.add(neck, skull, mane);
  r.add(body, head);
  return { root: r, head };
}

function createPandaMesh(palette: MaterialPalette): { root: THREE.Group; head: THREE.Group } {
  const r = new THREE.Group();
  const white = palette.getMat(0xf8fafc, 'matte');
  const black = palette.getMat(0x0f172a, 'matte');
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.68, 0.96), white);
  body.position.set(0, 0.58, 0);
  body.castShadow = true;
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.32, 0.34), black);
  band.position.set(0, 0.62, 0.26);
  const pawG = new THREE.BoxGeometry(0.26, 0.36, 0.26);
  [[-0.28, -0.32], [0.28, -0.32], [-0.28, 0.32], [0.28, 0.32]].forEach(([px, pz]) => {
    const paw = new THREE.Mesh(pawG, black);
    paw.position.set(px, 0.18, pz);
    r.add(paw);
  });
  const head = new THREE.Group();
  head.position.set(0, 0.92, 0.46);
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.54, 0.54), white);
  const earL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.14), black);
  earL.position.set(-0.26, 0.3, -0.06);
  const earR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.14), black);
  earR.position.set(0.26, 0.3, -0.06);
  const patchL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.06), black);
  patchL.position.set(-0.15, 0.06, 0.26);
  const patchR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.06), black);
  patchR.position.set(0.15, 0.06, 0.26);
  head.add(skull, earL, earR, patchL, patchR);
  r.add(body, band, head);
  return { root: r, head };
}

function createFenceLoop(
  palette: MaterialPalette,
  cx: number,
  y: number,
  cz: number,
  halfW: number,
  halfD: number,
): THREE.Group {
  const g = new THREE.Group();
  const wood = palette.getPixelMat('oak_plank');
  const postG = new THREE.BoxGeometry(0.24, 0.95, 0.24);
  const corners: Array<[number, number]> = [
    [-halfW, -halfD],
    [halfW, -halfD],
    [-halfW, halfD],
    [halfW, halfD],
    [0, -halfD],
    [0, halfD],
    [-halfW, 0],
    [halfW, 0],
  ];
  corners.forEach(([px, pz]) => {
    const post = new THREE.Mesh(postG, wood);
    post.position.set(cx + px, y + 0.48, cz + pz);
    post.castShadow = true;
    g.add(post);
  });
  const railH = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2, 0.16, 0.12), wood);
  railH.position.set(cx, y + 0.72, cz - halfD);
  const railH2 = railH.clone();
  railH2.position.set(cx, y + 0.72, cz + halfD);
  const railV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, halfD * 2), wood);
  railV.position.set(cx - halfW, y + 0.72, cz);
  const railV2 = railV.clone();
  railV2.position.set(cx + halfW, y + 0.72, cz);
  g.add(railH, railH2, railV, railV2);
  return g;
}

function createVoxelCar(
  palette: MaterialPalette,
  bodyColor: number,
  isPolice = false,
): THREE.Group {
  const car = new THREE.Group();
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.75, 1.35), palette.getMat(bodyColor, 'gloss'));
  chassis.position.y = 0.56;
  chassis.castShadow = true;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.58, 1.18), palette.getPixelMat('glass_pane', 0xe0f2fe));
  cabin.position.set(-0.08, 1.15, 0);
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.32, 0.14, 1.22),
    palette.getMat(isPolice ? 0xf8fafc : bodyColor, 'gloss'),
  );
  roof.position.set(-0.08, 1.48, 0);
  if (isPolice) {
    const beaconR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.42), palette.getMat(0xef4444, 'emissive'));
    beaconR.position.set(-0.08, 1.62, -0.25);
    const beaconB = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.42), palette.getMat(0x3b82f6, 'emissive'));
    beaconB.position.set(-0.08, 1.62, 0.25);
    car.add(beaconR, beaconB);
  }
  const wheelMat = palette.getMat(0x0f172a, 'matte');
  const wheelG = new THREE.BoxGeometry(0.45, 0.45, 0.24);
  [[-0.7, -0.68], [0.7, -0.68], [-0.7, 0.68], [0.7, 0.68]].forEach(([wx, wz]) => {
    const w = new THREE.Mesh(wheelG, wheelMat);
    w.position.set(wx, 0.24, wz);
    car.add(w);
  });
  car.add(chassis, cabin, roof);
  return car;
}

export function createArchipelagoWorld(
  palette: MaterialPalette,
  lowDetail = false,
): ArchipelagoRig {
  const group = new THREE.Group();
  const walkableTargets: THREE.Object3D[] = [];
  const obstacles: VillageObstacle[] = [];
  const torchesFlame: THREE.Object3D[] = [];
  const gears: Array<{ mesh: THREE.Object3D; speed: number }> = [];
  const clockHands: THREE.Group[] = [];
  const cars: Array<{ mesh: THREE.Group; baseX: number; rangeX: number; speed: number; phase: number }> = [];
  const crystalMeshes: THREE.Mesh[] = [];
  const lavaMeshes: THREE.Mesh[] = [];
  const zooCritters: ArchipelagoRig['zooCritters'] = [];
  const disposables: Array<{ dispose: () => void }> = [];
  const waterUniforms = { uTime: { value: 0 } };

  // 1. Rich Vibrant Azure Voxel Ocean (zero washed-out grey glare, crisp color)
  const oceanGeo = new THREE.PlaneGeometry(460, 460, lowDetail ? 28 : 64, lowDetail ? 28 : 64);
  const oceanMat = palette.createSurfaceMat({
    color: 0x0284c7,
    emissive: 0x0369a1,
    emissiveIntensity: 0.22,
    roughness: 0.58,
    metalness: 0.08,
  });
  oceanMat.customProgramCacheKey = () => 'archipelago-ocean-v2';
  oceanMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = waterUniforms.uTime;
    shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       transformed.z += sin(position.x * 0.16 + uTime * 1.8) * 0.11 + cos(position.y * 0.18 + uTime * 1.45) * 0.09;`,
    );
  };
  const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanMesh.rotation.x = -Math.PI / 2;
  oceanMesh.position.y = 0;
  oceanMesh.receiveShadow = true;
  group.add(oceanMesh);
  disposables.push(oceanGeo, oceanMat);

  // Voxel Terrain Collectors:
  // - walkableTopBlocks: flat & stepped top surface blocks (added to walkableTargets for tap-to-move!)
  // - cliffAndPropBlocks: stepped rocky/sandy cliffs, mountain terraces, sea foam shelves, bridge piers
  const walkableTopBlocks: VoxelSpec[] = [];
  const cliffBlocks: VoxelSpec[] = [];

  const neutralVoxelMat = palette.createSurfaceMat({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.02,
  });
  disposables.push(neutralVoxelMat);

  // Deep saturated fiery magma & crystal materials (calibrated for ACESFilmicToneMapping)
  const magmaCoreMat = palette.createSurfaceMat({
    color: 0xea580c,
    emissive: 0xc2410c,
    emissiveIntensity: 0.65,
    roughness: 0.35,
    metalness: 0.05,
  });
  const magmaHotMat = palette.createSurfaceMat({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.62,
    roughness: 0.3,
    metalness: 0.05,
  });
  const crystalMat = palette.createSurfaceMat({
    color: 0xa855f7,
    emissive: 0x7e22ce,
    emissiveIntensity: 0.68,
    roughness: 0.16,
    metalness: 0.2,
  });
  disposables.push(magmaCoreMat, magmaHotMat, crystalMat);

  // 2. Sculpted Multi-Tiered Voxel Islands (ZERO CylinderGeometry Z-fighting!)
  const islandThemes: Record<
    IslandDisk['id'],
    {
      topColors: number[];
      pathColors: number[];
      cliffColors: number[];
      foamColors: number[];
    }
  > = {
    hub: {
      topColors: [0x64748b, 0x78716c, 0x57534e, 0x4d7c0f],
      pathColors: [0x94a3b8, 0x78716c],
      cliffColors: [0x475569, 0x334155, 0x57534e],
      foamColors: [0x38bdf8, 0x7dd3fc],
    },
    desa_sapaan: {
      topColors: [0x65a30d, 0x589e2e, 0x71bd3d, 0x4d7c0f],
      pathColors: [0xb88a4c, 0xc49655],
      cliffColors: [0x78543a, 0x5d402a, 0x64748b],
      foamColors: [0x38bdf8, 0xbae6fd],
    },
    pasar_rasa: {
      topColors: [0xfde047, 0xfacc15, 0xfcd34d, 0xfbbf24],
      pathColors: [0xd97706, 0xeab308],
      cliffColors: [0xb45309, 0x9a3412, 0xc2410c],
      foamColors: [0x7dd3fc, 0xbae6fd],
    },
    hutan_satwa: {
      topColors: [0x22c55e, 0x16a34a, 0x4ade80, 0x15803d],
      pathColors: [0xc49655, 0xb88a4c],
      cliffColors: [0x5d402a, 0x4d7c0f, 0x3f6212],
      foamColors: [0x38bdf8, 0xbae6fd],
    },
    gerbang_kota: {
      topColors: [0x94a3b8, 0x64748b, 0x65a30d, 0x78716c],
      pathColors: [0x475569, 0x334155],
      cliffColors: [0x52525b, 0x3f3f46, 0x64748b],
      foamColors: [0x38bdf8, 0x93c5fd],
    },
    menara_waktu: {
      topColors: [0x84cc16, 0x65a30d, 0xa3e635, 0x4d7c0f],
      pathColors: [0xb88a4c, 0x94a3b8],
      cliffColors: [0x78543a, 0x57534e, 0x65a30d],
      foamColors: [0x38bdf8, 0xbae6fd],
    },
    gua_portal: {
      topColors: [0x334155, 0x475569, 0x1e293b, 0x3f3f46],
      pathColors: [0x64748b, 0x475569],
      cliffColors: [0x1e293b, 0x0f172a, 0x312e81],
      foamColors: [0x60a5fa, 0x93c5fd],
    },
  };

  const cellStep = lowDetail ? 2.4 : 2.0;
  for (let idx = 0; idx < ISLAND_DISKS.length; idx++) {
    const isl = ISLAND_DISKS[idx];
    const theme = islandThemes[isl.id];
    const outerR = isl.radius + 2.2;
    const minGx = Math.floor((isl.cx - outerR) / cellStep);
    const maxGx = Math.ceil((isl.cx + outerR) / cellStep);
    const minGz = Math.floor((isl.cz - outerR) / cellStep);
    const maxGz = Math.ceil((isl.cz + outerR) / cellStep);

    for (let gx = minGx; gx <= maxGx; gx++) {
      for (let gz = minGz; gz <= maxGz; gz++) {
        const wx = gx * cellStep;
        const wz = gz * cellStep;
        const dx = wx - isl.cx;
        const dz = wz - isl.cz;
        const dist = Math.hypot(dx, dz);
        const edgeNoise = (hash2(gx, gz) - 0.5) * 1.9;
        const effR = isl.radius + edgeNoise;

        if (dist <= effR) {
          // Walkable island main deck voxel (top exactly at isl.groundY, thickness 0.6m)
          const isPath =
            (isl.id === 'desa_sapaan' && Math.abs(dx) < 3.0 && dz < 8) ||
            (isl.id === 'hub' && (Math.abs(dx) < 2.8 || Math.abs(dz) < 2.8)) ||
            (isl.id === 'hutan_satwa' && Math.abs(dx + dz * 0.4) < 3.2) ||
            (isl.id === 'gerbang_kota' && dz > 5 && dz < 11);

          const cList = isPath ? theme.pathColors : theme.topColors;
          const colHex = cList[Math.abs(gx * 7 + gz * 13 + idx) % cList.length];
          walkableTopBlocks.push({
            x: wx,
            y: isl.groundY - 0.3,
            z: wz,
            sx: cellStep * 1.01,
            sy: 0.6,
            sz: cellStep * 1.01,
            color: colHex,
          });

          // Underlying dirt/stone cliff foundation ONLY below y = isl.groundY - 0.6 (zero overlap!)
          const bodyH = Math.max(0.5, isl.groundY - 0.6 + 0.5);
          const isOuterRim = dist > effR - 3.6;
          if (isOuterRim) {
            const cliffHex = theme.cliffColors[Math.abs(gx * 3 + gz * 5) % theme.cliffColors.length];
            cliffBlocks.push({
              x: wx,
              y: -0.5 + bodyH * 0.5,
              z: wz,
              sx: cellStep * 1.01,
              sy: bodyH,
              sz: cellStep * 1.01,
              color: cliffHex,
            });
          }
        } else if (dist <= effR + 1.8) {
          // Stepped lower coastal rock shelf + turquoise/white sea foam step
          const shelfH = Math.max(0.55, isl.groundY * 0.52);
          const cliffHex = theme.cliffColors[Math.abs(gx + gz) % theme.cliffColors.length];
          cliffBlocks.push({
            x: wx,
            y: -0.2 + shelfH * 0.5,
            z: wz,
            sx: cellStep * 1.02,
            sy: shelfH,
            sz: cellStep * 1.02,
            color: cliffHex,
          });
        } else if (dist <= effR + 3.2 && hash2(gx + 11, gz - 7) > 0.32) {
          // Turquoise shallow coastal voxel foam tile just above water
          cliffBlocks.push({
            x: wx,
            y: 0.06,
            z: wz,
            sx: cellStep * 0.96,
            sy: 0.16,
            sz: cellStep * 0.96,
            color: theme.foamColors[Math.abs(gx + gz) % theme.foamColors.length],
          });
        }
      }
    }

    // Solid hidden under-hull core strictly BELOW top deck (never touches isl.groundY -> zero Z-fighting!)
    const hullH = Math.max(0.4, isl.groundY - 0.25);
    const hullGeo = new THREE.CylinderGeometry(
      isl.radius - 1.0,
      isl.radius + 0.6,
      hullH,
      16,
    );
    const hullMat = palette.getMat(theme.cliffColors[0], 'matte');
    const hullMesh = new THREE.Mesh(hullGeo, hullMat);
    hullMesh.position.set(isl.cx, -0.45 + hullH * 0.5, isl.cz);
    hullMesh.receiveShadow = true;
    group.add(hullMesh);
    disposables.push(hullGeo);
  }

  // 3. Build Connecting Voxel/Timber/Stone Bridges between Islands
  const plankMat = palette.getPixelMat('oak_plank');
  const spruceMat = palette.getPixelMat('spruce_plank');
  const cobbleMat = palette.getPixelMat('cobble');
  const roadMat = palette.roadMat;

  for (const br of BRIDGE_SPANS) {
    const segs = 12;
    const dx = br.bx - br.ax;
    const dz = br.bz - br.az;
    const totalLen = Math.hypot(dx, dz);
    const yaw = Math.atan2(dx, dz);
    const stepLen = totalLen / segs + 0.14;
    const width = br.halfWidth * 2;
    const deckMat =
      br.style === 'highway'
        ? roadMat
        : br.style === 'stone'
        ? cobbleMat
        : br.style === 'rope'
        ? spruceMat
        : plankMat;

    for (let s = 0; s < segs; s++) {
      const t0 = s / segs;
      const t1 = (s + 1) / segs;
      const tm = (t0 + t1) * 0.5;
      const x0 = br.ax + dx * t0;
      const z0 = br.az + dz * t0;
      const y0 = br.ay + (br.by - br.ay) * t0 + Math.sin(t0 * Math.PI) * br.archHeight;
      const x1 = br.ax + dx * t1;
      const z1 = br.az + dz * t1;
      const y1 = br.ay + (br.by - br.ay) * t1 + Math.sin(t1 * Math.PI) * br.archHeight;
      const slope = Math.atan2(y1 - y0, Math.hypot(x1 - x0, z1 - z0));

      const segGeo = new THREE.BoxGeometry(width, 0.36, stepLen);
      const segMesh = new THREE.Mesh(segGeo, deckMat);
      segMesh.position.set((x0 + x1) * 0.5, (y0 + y1) * 0.5 - 0.18, (z0 + z1) * 0.5);
      segMesh.rotation.order = 'YXZ';
      segMesh.rotation.y = yaw;
      segMesh.rotation.x = -slope;
      segMesh.castShadow = true;
      segMesh.receiveShadow = true;
      group.add(segMesh);
      walkableTargets.push(segMesh);
      disposables.push(segGeo);

      if (s % 2 === 0 || s === segs - 1) {
        const perpX = Math.cos(yaw) * (br.halfWidth - 0.14);
        const perpZ = -Math.sin(yaw) * (br.halfWidth - 0.14);
        const railColor = br.style === 'stone' || br.style === 'highway' ? 0x64748b : 0x78350f;
        const railH = br.style === 'rope' ? 0.95 : 0.72;
        [-1, 1].forEach((side) => {
          cliffBlocks.push({
            x: (x0 + x1) * 0.5 + perpX * side,
            y: (y0 + y1) * 0.5 + railH * 0.5,
            z: (z0 + z1) * 0.5 + perpZ * side,
            sx: 0.28,
            sy: railH,
            sz: 0.28,
            color: railColor,
          });
        });
      }
      if (s === 2 || s === 6 || s === 9) {
        const pym = (y0 + y1) * 0.5;
        cliffBlocks.push({
          x: br.ax + dx * tm,
          y: pym * 0.5 - 0.2,
          z: br.az + dz * tm,
          sx: br.style === 'highway' ? 2.4 : 1.15,
          sy: pym + 0.6,
          sz: br.style === 'highway' ? 2.4 : 1.15,
          color: br.style === 'stone' || br.style === 'highway' ? 0x475569 : 0x5c3a1e,
        });
      }
    }
  }

  // ============================================================================
  // CENTRAL HUB RUIN CITADEL (0, y=2.4, z=0)
  // Towering 5-Tier Ruined Citadel Mountain + Stepped Stairs + Rune Obelisk + Fiery Magma Caldera
  // ============================================================================
  {
    const hub = new THREE.Group();
    const hy = 2.4;

    // Towering stepped mossy stone mountain behind the center walkway
    pushSteppedMountain(cliffBlocks, {
      cx: 0,
      cz: -8.6,
      baseY: hy,
      tiers: 5,
      baseW: 15.0,
      baseD: 9.2,
      tierH: 1.85,
      shiftZ: -0.45,
      rockColors: [0x64748b, 0x57534e, 0x78716c, 0x475569],
      capColors: [0x4d7c0f, 0x65a30d, 0x78716c],
      carveBox: { minX: -2.4, maxX: 2.4, minZ: -11.0, maxZ: -3.5, maxY: hy + 7.4 },
    });

    // Grand ascending stone steps climbing up to the Rune Obelisk
    for (let s = 0; s < 6; s++) {
      cliffBlocks.push({
        x: 0,
        y: hy + s * 0.72 + 0.36,
        z: -4.2 - s * 1.05,
        sx: 3.8,
        sy: 0.72 + s * 0.1,
        sz: 1.2,
        color: s % 2 === 0 ? 0x94a3b8 : 0x78716c,
      });
    }

    // Tall Rune Monolith crowning the Hub Mountain
    const obelisk = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 6.2, 1.9),
      palette.getMat(0x57534e, 'matte'),
    );
    obelisk.position.set(0, hy + 8.6, -10.5);
    obelisk.castShadow = true;
    const runeGlow = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 3.8, 2.02),
      magmaHotMat,
    );
    runeGlow.position.set(0, hy + 8.9, -10.5);
    const obeliskCap = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.7, 2.3),
      palette.getMat(0x78716c, 'matte'),
    );
    obeliskCap.position.set(0, hy + 11.9, -10.5);
    hub.add(obelisk, runeGlow, obeliskCap);

    // Corner ruined watchtower on East flank (7.6, -7.2) + hanging chain ruins on West (-7.8, -7.2)
    const watchTower = new THREE.Mesh(new THREE.BoxGeometry(3.6, 8.2, 3.6), cobbleMat);
    watchTower.position.set(7.8, hy + 4.1, -7.8);
    watchTower.castShadow = true;
    const wtCrown = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.0, 4.2), palette.getMat(0x475569, 'matte'));
    wtCrown.position.set(7.8, hy + 8.6, -7.8);
    const floatBlock = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 2.4), cobbleMat);
    floatBlock.position.set(-7.8, hy + 7.2, -7.6);
    floatBlock.castShadow = true;
    hub.add(watchTower, wtCrown, floatBlock);
    obstacles.push(
      { x: 0, z: -8.6, halfW: 6.5, halfD: 4.0 },
      { x: 7.8, z: -7.8, halfW: 2.0, halfD: 2.0 },
    );

    // Flanking stone torch pillars beside the central stair
    [[-4.2, -4.6], [4.2, -4.6], [-2.5, -9.8], [2.5, -9.8]].forEach(([px, pz], idx) => {
      const py = idx >= 2 ? hy + 4.4 : hy;
      const col = new THREE.Mesh(new THREE.BoxGeometry(1.15, 3.4, 1.15), cobbleMat);
      col.position.set(px, py + 1.7, pz);
      col.castShadow = true;
      const fl = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.65), magmaHotMat);
      fl.position.set(px, py + 3.75, pz);
      fl.userData.isFlame = true;
      torchesFlame.push(fl);
      hub.add(col, fl);
      if (idx < 2) obstacles.push({ x: px, z: pz, halfW: 0.75, halfD: 0.75 });
    });

    // Glowing Fiery Magma Caldera + Twin Stepped Lava Waterfalls on South-East Hub rim
    const lavaRim = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.56, 5.4),
      palette.getMat(0x292524, 'matte'),
    );
    lavaRim.position.set(7.2, hy + 0.16, 7.6);
    const lavaPool = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.62, 4.0), magmaCoreMat);
    lavaPool.position.set(7.2, hy + 0.22, 7.6);
    const lavaVein = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.66, 2.0), magmaHotMat);
    lavaVein.position.set(7.2, hy + 0.25, 7.6);
    const lavaFall1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, hy + 0.65, 1.3), magmaCoreMat);
    lavaFall1.position.set(9.6, hy * 0.5, 11.4);
    const lavaFall2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, hy + 0.65, 1.1), magmaHotMat);
    lavaFall2.position.set(5.4, hy * 0.5, 11.6);
    lavaMeshes.push(lavaPool, lavaVein, lavaFall1, lavaFall2);
    hub.add(lavaRim, lavaPool, lavaVein, lavaFall1, lavaFall2);
    obstacles.push({ x: 7.2, z: 7.6, halfW: 3.6, halfD: 2.7 });

    group.add(hub);
  }

  // ============================================================================
  // 1. DESA SAPAAN ISLAND (0, y=1.6, z=54) — STORY ORDER SPAWN!
  //    Tall Windmill + Cottages + Well + Mountainous Grass Hill + Glowing Ember Cave
  // ============================================================================
  const windmillHub = new THREE.Group();
  {
    const dy = 1.6;
    // Tall Voxel Windmill (-12.5, 51.0)
    const mill = new THREE.Group();
    mill.position.set(-12.5, dy, 51.0);
    const mPlinth = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.2, 5.2), cobbleMat);
    mPlinth.position.y = 0.6;
    mPlinth.castShadow = true;
    const mBase = new THREE.Mesh(new THREE.BoxGeometry(4.4, 4.0, 4.4), cobbleMat);
    mBase.position.y = 3.0;
    mBase.castShadow = true;
    const mTower = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 4.2, 3.6),
      palette.getMat(0xf8fafc, 'matte'),
    );
    mTower.position.y = 7.0;
    mTower.castShadow = true;
    const mTrim = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.45, 4.0), spruceMat);
    mTrim.position.y = 5.1;
    const mRoof = new THREE.Mesh(new THREE.ConeGeometry(3.3, 2.8, 4), spruceMat);
    mRoof.position.y = 10.5;
    mRoof.rotation.y = Math.PI / 4;
    mRoof.castShadow = true;

    windmillHub.position.set(0, 7.6, 2.05);
    const hubCore = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.82, 0.82), palette.getPixelMat('oak_log'));
    windmillHub.add(hubCore);
    const sailMat = palette.getMat(0xfef9c3, 'matte');
    for (let s = 0; s < 4; s++) {
      const armPivot = new THREE.Group();
      armPivot.rotation.z = (s * Math.PI) / 2;
      const spar = new THREE.Mesh(new THREE.BoxGeometry(0.26, 4.2, 0.18), plankMat);
      spar.position.y = 2.1;
      const sail = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.0, 0.08), sailMat);
      sail.position.set(0.58, 2.3, 0.06);
      armPivot.add(spar, sail);
      windmillHub.add(armPivot);
    }
    mill.add(mPlinth, mBase, mTrim, mTower, mRoof, windmillHub);
    group.add(mill);
    obstacles.push({ x: -12.5, z: 51.0, halfW: 2.6, halfD: 2.6 });

    // Multi-Tiered Lush Green Mountain Ridge & Glowing Ember Cave Mouth on East side (+12.5, 52.5)
    pushSteppedMountain(cliffBlocks, {
      cx: 13.0,
      cz: 52.5,
      baseY: dy,
      tiers: 5,
      baseW: 11.4,
      baseD: 12.6,
      tierH: 1.65,
      shiftX: 0.45,
      rockColors: [0x64748b, 0x57534e, 0x78543a],
      capColors: [0x65a30d, 0x589e2e, 0x84cc16],
      carveBox: { minX: 6.8, maxX: 11.6, minZ: 49.8, maxZ: 55.2, maxY: dy + 4.4 },
    });

    const caveGroup = new THREE.Group();
    caveGroup.position.set(7.6, dy, 52.5);
    const archL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4.0, 1.5), cobbleMat);
    archL.position.set(0, 2.0, -2.2);
    archL.castShadow = true;
    const archR = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4.0, 1.5), cobbleMat);
    archR.position.set(0, 2.0, 2.2);
    archR.castShadow = true;
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 6.2), cobbleMat);
    archTop.position.set(0, 4.4, 0);
    archTop.castShadow = true;
    const caveDark = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 3.8, 3.3),
      palette.getMat(0x090d16, 'matte'),
    );
    caveDark.position.set(1.4, 1.9, 0);
    const caveEmber = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 3.3), magmaCoreMat);
    caveEmber.position.set(0.8, 0.16, 0);
    lavaMeshes.push(caveEmber);
    const caveDock = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.34, 2.0), plankMat);
    caveDock.position.set(-1.1, 0.28, 0);
    [-2.1, 2.1].forEach((tz) => {
      const tFlame = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.6, 0.48), magmaHotMat);
      tFlame.position.set(-0.8, 2.7, tz);
      tFlame.userData.isFlame = true;
      torchesFlame.push(tFlame);
      caveGroup.add(tFlame);
    });
    caveGroup.add(archL, archR, archTop, caveDark, caveEmber, caveDock);
    group.add(caveGroup);
    obstacles.push({ x: 12.2, z: 52.5, halfW: 5.2, halfD: 5.4 });
  }

  // ============================================================================
  // 2. PASAR RASA ISLAND (-50, y=1.4, z=29)
  //    Stepped Terracotta Chili Cliff + Giant Chili Peppers + Striped Tents + Golden Tumpeng
  // ============================================================================
  {
    const py = 1.4;
    // Giant Golden Tumpeng Feast at Plaza Center (-50.5, 30.5)
    const ped = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.8, 5.2), cobbleMat);
    ped.position.set(-50.5, py + 0.4, 30.5);
    ped.castShadow = true;
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 1.5, 1.4, 12), palette.getMat(0x334155, 'metal'));
    pot.position.set(-50.5, py + 1.45, 30.5);
    const tumpeng1 = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 2.0, 0.9, 10), palette.getMat(0xeab308, 'matte'));
    tumpeng1.position.set(-50.5, py + 2.35, 30.5);
    const tumpeng2 = new THREE.Mesh(new THREE.ConeGeometry(1.55, 2.3, 10), palette.getMat(0xfacc15, 'matte'));
    tumpeng2.position.set(-50.5, py + 3.9, 30.5);
    tumpeng2.castShadow = true;
    group.add(ped, pot, tumpeng1, tumpeng2);
    obstacles.push({ x: -50.5, z: 30.5, halfW: 2.7, halfD: 2.7 });

    // 5 Red & Yellow Striped Canopy Market Pavilions
    const redMat = palette.getPixelMat('wool_red');
    const yelMat = palette.getPixelMat('wool_yellow');
    const tentSpecs: Array<[number, number, number]> = [
      [-58.2, 32.0, 0.25],
      [-54.5, 40.0, 0.08],
      [-43.2, 36.2, -0.35],
      [-45.8, 20.5, 0.55],
      [-39.8, 27.5, -0.7],
    ];
    tentSpecs.forEach(([tx, tz, ry]) => {
      const tGroup = new THREE.Group();
      tGroup.position.set(tx, py, tz);
      tGroup.rotation.y = ry;
      [[-1.7, -1.3], [1.7, -1.3], [-1.7, 1.3], [1.7, 1.3]].forEach(([px, pz]) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.5, 0.24), plankMat);
        post.position.set(px, 1.25, pz);
        tGroup.add(post);
      });
      for (let s = 0; s < 5; s++) {
        const slat = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.38, 3.2), s % 2 === 0 ? redMat : yelMat);
        slat.position.set(-1.56 + s * 0.78, 2.65, 0);
        slat.castShadow = true;
        tGroup.add(slat);
      }
      const peak = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.35, 2.2), redMat);
      peak.position.set(0, 3.0, 0);
      const table = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.85, 1.05), spruceMat);
      table.position.set(0, 0.425, 0);
      tGroup.add(peak, table);
      group.add(tGroup);
      obstacles.push({ x: tx, z: tz, halfW: 1.9, halfD: 1.6 });
    });

    // Campfire beside Tumpeng plaza
    [[-54.2, 30.8], [-46.5, 32.8]].forEach(([fx, fz]) => {
      const log = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.26, 1.1), palette.getPixelMat('oak_log'));
      log.position.set(fx, py + 0.13, fz);
      const fl = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.75, 0.58), magmaCoreMat);
      fl.position.set(fx, py + 0.58, fz);
      fl.userData.isFlame = true;
      torchesFlame.push(fl);
      group.add(log, fl);
    });

    // Towering Terracotta Chili Cliff Mountain (-58.5, 19.5)
    pushSteppedMountain(cliffBlocks, {
      cx: -58.5,
      cz: 19.0,
      baseY: py,
      tiers: 5,
      baseW: 11.4,
      baseD: 10.6,
      tierH: 1.85,
      shiftX: -0.45,
      shiftZ: -0.35,
      rockColors: [0xb45309, 0x9a3412, 0xc2410c, 0x7c2d12],
      capColors: [0x65a30d, 0x589e2e],
      carveBox: { minX: -57.5, maxX: -52.5, minZ: 20.0, maxZ: 25.0, maxY: py + 4.8 },
    });
    const chiliCaveDark = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 3.6, 2.8),
      palette.getMat(0x090d16, 'matte'),
    );
    chiliCaveDark.position.set(-55.2, py + 1.8, 22.4);
    chiliCaveDark.rotation.y = 0.42;
    group.add(chiliCaveDark);
    [
      [-59.2, py + 3.2, 22.8, 1.25],
      [-52.0, py + 3.4, 21.8, 1.35],
      [-55.4, py + 5.2, 21.2, 1.1],
      [-61.5, py + 4.8, 20.2, 1.05],
    ].forEach(([cx, cy, cz, sc]) => {
      const ch = createChiliCluster(palette, sc);
      ch.position.set(cx, cy, cz);
      group.add(ch);
    });
    obstacles.push({ x: -58.5, z: 19.0, halfW: 5.0, halfD: 4.5 });
  }

  // ============================================================================
  // 3. HUTAN SATWA / ZOO ISLAND (50, y=1.6, z=29)
  //    Grand ZOO Gate + Fenced Giraffe/Zebra/Pandas + Waterfall Lagoon + Giant Tiger Head Mountain
  // ============================================================================
  {
    const zy = 1.6;
    const zooGate = new THREE.Group();
    zooGate.position.set(38.5, zy, 22.2);
    zooGate.rotation.y = -1.04;
    const zpL = new THREE.Mesh(new THREE.BoxGeometry(1.0, 4.8, 1.0), palette.getPixelMat('oak_log'));
    zpL.position.set(-2.7, 2.4, 0);
    zpL.castShadow = true;
    const zpR = zpL.clone();
    zpR.position.set(2.7, 2.4, 0);
    const zBeam = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.25, 1.25), spruceMat);
    zBeam.position.set(0, 5.0, 0);
    zBeam.castShadow = true;
    const zSign = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.9, 1.36), palette.getMat(0xfef3c7, 'matte'));
    zSign.position.set(0, 5.0, 0);
    zooGate.add(zpL, zpR, zBeam, zSign);
    group.add(zooGate);

    group.add(createFenceLoop(palette, 42.5, zy, 35.5, 3.2, 2.8));
    obstacles.push({ x: 42.5, z: 35.5, halfW: 3.3, halfD: 2.9 });
    const giraffe = createGiraffeMesh(palette);
    giraffe.root.position.set(42.5, zy, 35.5);
    giraffe.root.rotation.y = 2.4;
    group.add(giraffe.root);
    zooCritters.push({ root: giraffe.root, head: giraffe.head, baseX: 42.5, baseZ: 35.5, baseYaw: 2.4, phase: 0.5 });

    group.add(createFenceLoop(palette, 50.2, zy, 31.8, 2.6, 2.2));
    obstacles.push({ x: 50.2, z: 31.8, halfW: 2.7, halfD: 2.3 });
    const zebra = createZebraMesh(palette);
    zebra.root.position.set(50.2, zy, 31.8);
    zebra.root.rotation.y = -0.8;
    group.add(zebra.root);
    zooCritters.push({ root: zebra.root, head: zebra.head, baseX: 50.2, baseZ: 31.8, baseYaw: -0.8, phase: 1.7 });

    group.add(createFenceLoop(palette, 51.0, zy, 41.2, 3.2, 2.3));
    obstacles.push({ x: 51.0, z: 41.2, halfW: 3.3, halfD: 2.4 });
    [49.8, 52.2].forEach((px, idx) => {
      const pnd = createPandaMesh(palette);
      pnd.root.position.set(px, zy, 41.2);
      pnd.root.rotation.y = idx === 0 ? 0.5 : -0.4;
      group.add(pnd.root);
      zooCritters.push({ root: pnd.root, head: pnd.head, baseX: px, baseZ: 41.2, baseYaw: idx === 0 ? 0.5 : -0.4, phase: idx * 2.1 });
    });

    const zooPond = new THREE.Mesh(
      new THREE.CylinderGeometry(4.4, 4.4, 0.28, 16),
      palette.getMat(0x0284c7, 'gloss'),
    );
    zooPond.position.set(60.2, zy + 0.08, 36.2);
    const waterfall = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, zy + 0.5, 0.9),
      palette.getMat(0x38bdf8, 'gloss'),
    );
    waterfall.position.set(65.4, zy * 0.5, 39.4);
    waterfall.rotation.y = -0.6;
    group.add(zooPond, waterfall);
    obstacles.push({ x: 60.2, z: 36.2, halfW: 4.2, halfD: 4.2 });

    // Towering Mossy Jungle Mountain + Giant Sculpted Voxel Tiger Head Cave Mouth
    pushSteppedMountain(cliffBlocks, {
      cx: 61.5,
      cz: 21.8,
      baseY: zy,
      tiers: 5,
      baseW: 11.0,
      baseD: 11.0,
      tierH: 1.9,
      shiftX: 0.45,
      rockColors: [0x15803d, 0x166534, 0x3f6212, 0x5d402a],
      capColors: [0x22c55e, 0x16a34a, 0x4ade80],
      carveBox: { minX: 54.0, maxX: 60.0, minZ: 20.0, maxZ: 25.6, maxY: zy + 5.2 },
    });

    const tigerCave = new THREE.Group();
    tigerCave.position.set(57.2, zy, 23.0);
    tigerCave.rotation.y = -0.65;
    const orangeMat = palette.getMat(0xf97316, 'matte');
    const stripeMat = palette.getMat(0x0f172a, 'matte');
    const whiteMat = palette.getMat(0xf8fafc, 'matte');
    const cheekL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.8, 1.6), orangeMat);
    cheekL.position.set(-2.4, 1.9, 0);
    const cheekR = cheekL.clone();
    cheekR.position.set(2.4, 1.9, 0);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(6.6, 1.9, 1.9), orangeMat);
    brow.position.set(0, 4.5, 0);
    brow.castShadow = true;
    const earL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.95), orangeMat);
    earL.position.set(-2.5, 5.9, 0.1);
    const earR = earL.clone();
    earR.position.set(2.5, 5.9, 0.1);
    const stripeTop = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 2.0), stripeMat);
    stripeTop.position.set(0, 4.7, 0.05);
    const fangL = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.95, 0.46), whiteMat);
    fangL.position.set(-1.15, 3.1, 0.78);
    const fangR = fangL.clone();
    fangR.position.set(1.15, 3.1, 0.78);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.46, 0.25), magmaHotMat);
    eyeL.position.set(-1.55, 4.4, 0.98);
    const eyeR = eyeL.clone();
    eyeR.position.set(1.55, 4.4, 0.98);
    const mouthDark = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.4, 2.4), stripeMat);
    mouthDark.position.set(0, 1.7, -0.6);
    tigerCave.add(cheekL, cheekR, brow, earL, earR, stripeTop, fangL, fangR, eyeL, eyeR, mouthDark);
    group.add(tigerCave);
    obstacles.push({ x: 61.0, z: 22.2, halfW: 4.8, halfD: 4.8 });
  }

  // ============================================================================
  // 4. GERBANG KOTA ISLAND (-50, y=3.8, z=-31)
  //    Elevated Fortress Battlements + 2-Story Red Brick School + Road + Moving Cars + Highway Tunnel
  // ============================================================================
  {
    const gy = 3.8;
    const school = new THREE.Group();
    school.position.set(-54, gy, -39);
    const brickMat = palette.getMat(0xb91c1c, 'matte');
    const roofMat = palette.getMat(0x78350f, 'matte');
    const winMat = palette.getPixelMat('glass_pane', 0xe0f2fe);
    const body = new THREE.Mesh(new THREE.BoxGeometry(10.0, 5.6, 6.4), brickMat);
    body.position.y = 2.8;
    body.castShadow = true;
    const roofL = new THREE.Mesh(new THREE.BoxGeometry(10.8, 1.35, 3.9), roofMat);
    roofL.position.set(0, 6.05, -1.35);
    roofL.rotation.x = -0.34;
    const roofR = new THREE.Mesh(new THREE.BoxGeometry(10.8, 1.35, 3.9), roofMat);
    roofR.position.set(0, 6.05, 1.35);
    roofR.rotation.x = 0.34;
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.5, 0.28), spruceMat);
    door.position.set(0, 1.25, 3.24);
    school.add(body, roofL, roofR, door);
    [-3.3, -1.6, 1.6, 3.3].forEach((wx) => {
      [1.8, 3.9].forEach((wy) => {
        if (wy < 2.2 && Math.abs(wx) < 1.8) return;
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.15, 0.2), winMat);
        win.position.set(wx, wy, 3.24);
        school.add(win);
      });
    });
    group.add(school);
    obstacles.push({ x: -54, z: -39, halfW: 5.2, halfD: 3.4 });

    // Crenellated Castle Walls & Corner Watchtowers
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(22, 4.4, 1.6), cobbleMat);
    northWall.position.set(-50, gy + 2.2, -45.5);
    northWall.castShadow = true;
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.4, 14), cobbleMat);
    eastWall.position.set(-38.5, gy + 2.2, -38.5);
    const towerNE = new THREE.Mesh(new THREE.BoxGeometry(3.0, 6.4, 3.0), cobbleMat);
    towerNE.position.set(-38.5, gy + 3.2, -45.5);
    const towerNW = towerNE.clone();
    towerNW.position.set(-61.5, gy + 3.2, -45.5);
    group.add(northWall, eastWall, towerNE, towerNW);
    // Merlon battlements along top of north wall
    for (let mx = -60; mx <= -40; mx += 2.4) {
      cliffBlocks.push({
        x: mx,
        y: gy + 4.85,
        z: -45.5,
        sx: 1.1,
        sy: 0.9,
        sz: 1.4,
        color: 0x94a3b8,
      });
    }
    obstacles.push(
      { x: -50, z: -45.5, halfW: 11.2, halfD: 1.0 },
      { x: -38.5, z: -38.5, halfW: 1.0, halfD: 7.2 },
    );

    const cityRoad = new THREE.Mesh(new THREE.BoxGeometry(24, 0.14, 6.2), roadMat);
    cityRoad.position.set(-51, gy + 0.05, -23);
    cityRoad.receiveShadow = true;
    walkableTargets.push(cityRoad);
    const tunnelFrame = new THREE.Group();
    tunnelFrame.position.set(-62.5, gy, -23);
    const tunL = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4.6, 1.5), cobbleMat);
    tunL.position.set(0, 2.3, -3.5);
    const tunR = tunL.clone();
    tunR.position.set(0, 2.3, 3.5);
    const tunTop = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.6, 8.8), cobbleMat);
    tunTop.position.set(0, 5.2, 0);
    tunTop.castShadow = true;
    const tlPole = new THREE.Mesh(new THREE.BoxGeometry(0.26, 3.6, 0.26), palette.getMat(0x1e293b, 'metal'));
    tlPole.position.set(2.2, 1.8, 3.6);
    const tlGreen = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), palette.getMat(0x22c55e, 'emissive'));
    tlGreen.position.set(2.2, 3.2, 3.6);
    tunnelFrame.add(tunL, tunR, tunTop, tlPole, tlGreen);
    group.add(cityRoad, tunnelFrame);
    obstacles.push(
      { x: -62.5, z: -26.6, halfW: 1.4, halfD: 0.9 },
      { x: -62.5, z: -19.4, halfW: 1.4, halfD: 0.9 },
    );

    [
      { z: -21.5, color: 0xef4444, baseX: -58, range: 12, speed: 0.75, phase: 0, police: false },
      { z: -24.5, color: 0xfacc15, baseX: -66, range: 14, speed: 0.62, phase: 2.2, police: false },
      { z: -21.5, color: 0x2563eb, baseX: -48, range: 9, speed: 0.85, phase: 4.1, police: true },
    ].forEach((cfg) => {
      const car = createVoxelCar(palette, cfg.color, cfg.police);
      car.position.set(cfg.baseX, gy + 0.1, cfg.z);
      group.add(car);
      cars.push({ mesh: car, baseX: cfg.baseX, rangeX: cfg.range, speed: cfg.speed, phase: cfg.phase });
    });
  }

  // ============================================================================
  // 5. MENARA WAKTU ISLAND (50, y=3.4, z=-31)
  //    Stepped Terraced Mountain + Grand Clock Tower + 7 Interlocking Gold Gears + Tunnel Cave
  // ============================================================================
  {
    const my = 3.4;
    pushSteppedMountain(cliffBlocks, {
      cx: 54.0,
      cz: -36.5,
      baseY: my,
      tiers: 4,
      baseW: 13.6,
      baseD: 12.8,
      tierH: 1.9,
      shiftX: 0.35,
      shiftZ: -0.4,
      rockColors: [0x78543a, 0x57534e, 0x92400e],
      capColors: [0x84cc16, 0x65a30d, 0x4d7c0f],
      carveBox: { minX: 52.0, maxX: 60.0, minZ: -28.0, maxZ: -22.0, maxY: my + 4.4 },
    });

    const clockTower = new THREE.Group();
    clockTower.position.set(53.0, my + 3.6, -37.2);
    const ctBase = new THREE.Mesh(new THREE.BoxGeometry(6.0, 8.2, 6.0), palette.getMat(0xd97706, 'matte'));
    ctBase.position.y = 4.1;
    ctBase.castShadow = true;
    const ctBelfry = new THREE.Mesh(new THREE.BoxGeometry(6.8, 4.6, 6.8), palette.getMat(0xf59e0b, 'matte'));
    ctBelfry.position.y = 10.4;
    ctBelfry.castShadow = true;
    const ctSpire = new THREE.Mesh(new THREE.ConeGeometry(4.6, 5.6, 4), palette.getMat(0x78350f, 'matte'));
    ctSpire.position.y = 15.5;
    ctSpire.rotation.y = Math.PI / 4;
    ctSpire.castShadow = true;
    clockTower.add(ctBase, ctBelfry, ctSpire);

    [
      [0, 10.4, 3.45, 0],
      [-3.45, 10.4, 0, -Math.PI / 2],
      [3.45, 10.4, 0, Math.PI / 2],
      [0, 10.4, -3.45, Math.PI],
    ].forEach(([dx, dy, dz, ry]) => {
      const face = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 3.4, 0.26),
        palette.createSurfaceMat({ color: 0xfef3c7, emissive: 0xfde047, emissiveIntensity: 0.35 }),
      );
      face.position.set(dx, dy, dz);
      face.rotation.y = ry;
      const handGroup = new THREE.Group();
      handGroup.position.set(dx, dy, dz);
      handGroup.rotation.y = ry;
      const bigHand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.3, 0.36), palette.getMat(0x1e293b, 'matte'));
      bigHand.position.set(0, 0.48, 0.08);
      handGroup.add(bigHand);
      clockTower.add(face, handGroup);
      clockHands.push(handGroup);
    });
    group.add(clockTower);
    obstacles.push({ x: 53.0, z: -37.2, halfW: 3.6, halfD: 3.6 });

    const goldGearMat = palette.getMat(0xfacc15, 'metal');
    const darkGearMat = palette.getMat(0x92400e, 'metal');
    [
      { x: 47.0, y: my + 6.4, z: -33.2, ry: 0.45, r: 3.0, teeth: 10, spd: 0.65 },
      { x: 51.8, y: my + 5.2, z: -31.8, ry: 0.15, r: 2.3, teeth: 8, spd: -0.82 },
      { x: 57.6, y: my + 6.6, z: -32.6, ry: -0.35, r: 2.6, teeth: 9, spd: 0.72 },
      { x: 45.2, y: my + 3.2, z: -35.8, ry: 0.9, r: 2.0, teeth: 8, spd: -0.95 },
      { x: 59.5, y: my + 3.4, z: -34.2, ry: -0.5, r: 2.1, teeth: 8, spd: -0.9 },
      { x: 50.2, y: my + 2.4, z: -30.2, ry: 0.1, r: 1.7, teeth: 8, spd: 1.0 },
    ].forEach((g) => {
      const mesh = createToothedGear(g.r, 0.58, g.teeth, goldGearMat, darkGearMat);
      mesh.position.set(g.x, g.y, g.z);
      mesh.rotation.y = g.ry;
      group.add(mesh);
      gears.push({ mesh, speed: g.spd });
    });

    const timeArchL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.8, 1.5), cobbleMat);
    timeArchL.position.set(54.2, my + 1.9, -24.5);
    const timeArchR = timeArchL.clone();
    timeArchR.position.set(58.4, my + 1.9, -24.5);
    const timeArchTop = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.5, 1.8), cobbleMat);
    timeArchTop.position.set(56.3, my + 4.4, -24.5);
    const timeCaveDark = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 3.5, 2.4),
      palette.getMat(0x090d16, 'matte'),
    );
    timeCaveDark.position.set(56.3, my + 1.75, -26.0);
    group.add(timeArchL, timeArchR, timeArchTop, timeCaveDark);
    obstacles.push({ x: 56.3, z: -26.2, halfW: 3.1, halfD: 2.4 });
  }

  // ============================================================================
  // 6. GUA PORTAL ISLAND (0, y=2.4, z=-62)
  //    Towering Jagged Dark Basalt Mountain + Giant Purple Amethyst Crystals + Minecart Track & Cave
  // ============================================================================
  const minecart = new THREE.Group();
  {
    const gy = 2.4;
    pushSteppedMountain(cliffBlocks, {
      cx: 0,
      cz: -75.0,
      baseY: gy,
      tiers: 6,
      baseW: 20.0,
      baseD: 10.6,
      tierH: 2.25,
      shiftZ: -0.5,
      rockColors: [0x1e293b, 0x334155, 0x0f172a, 0x3f3f46],
      carveBox: { minX: -5.4, maxX: 1.2, minZ: -74.0, maxZ: -68.0, maxY: gy + 5.2 },
    });

    const crystalCavernDark = new THREE.Mesh(
      new THREE.BoxGeometry(6.0, 4.8, 3.8),
      palette.getMat(0x090d16, 'matte'),
    );
    crystalCavernDark.position.set(-2.2, gy + 2.4, -71.5);
    const crystalCavernGlow = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 3.4), crystalMat);
    crystalCavernGlow.position.set(-2.2, gy + 0.18, -71.2);
    group.add(crystalCavernDark, crystalCavernGlow);

    [
      [-8.4, gy + 8.6, -74.5, 2.5, 0.22],
      [7.8, gy + 9.2, -74.8, 2.7, -0.24],
      [-1.5, gy + 11.4, -76.8, 3.0, 0.08],
      [-5.6, gy + 2.8, -69.5, 1.4, 0.35],
      [2.8, gy + 2.4, -70.0, 1.3, -0.32],
      [-10.2, gy + 3.4, -71.2, 1.7, 0.28],
      [9.4, gy + 3.8, -70.6, 1.8, -0.26],
    ].forEach(([cx, cy, cz, sc, tilt]) => {
      const shard = new THREE.Mesh(new THREE.OctahedronGeometry(1.1 * sc, 0), crystalMat);
      shard.position.set(cx, cy, cz);
      shard.scale.set(0.7, 1.85, 0.7);
      shard.rotation.z = tilt;
      group.add(shard);
      crystalMeshes.push(shard);
    });

    for (let r = 0; r < 8; r++) {
      const t = r / 7;
      const rx = -2.2 + Math.sin(t * 2.1) * 4.2;
      const rz = -71.0 + t * 11.2;
      const ry = gy + 0.28 + (1 - t) * 1.15;
      const tie = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 0.48), spruceMat);
      tie.position.set(rx, ry, rz);
      group.add(tie);
      cliffBlocks.push({
        x: rx,
        y: (ry - gy) * 0.5 + gy - 0.1,
        z: rz,
        sx: 0.48,
        sy: Math.max(0.2, ry - gy + 0.2),
        sz: 0.48,
        color: 0x5c3a1e,
      });
    }
    const cartBody = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.85, 1.65), palette.getMat(0x64748b, 'metal'));
    cartBody.position.y = 0.55;
    const oreGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), crystalMat);
    oreGem.position.set(0, 1.05, 0);
    minecart.add(cartBody, oreGem);
    minecart.position.set(-1.5, gy + 0.72, -64.5);
    group.add(minecart);
    obstacles.push(
      { x: 0, z: -75.0, halfW: 9.6, halfD: 4.8 },
      { x: -1.8, z: -66.0, halfW: 1.8, halfD: 5.0 },
    );
  }

  // ============================================================================
  // 7. FLOATING ISTANA IELTS SKY ISLAND (+86, y=23, z=-74) — SEALED IN DOME!
  // ============================================================================
  const istanaGroup = new THREE.Group();
  istanaGroup.position.set(
    OVERWORLD_ANCHORS.istanaFloating.x,
    OVERWORLD_ANCHORS.istanaFloating.y,
    OVERWORLD_ANCHORS.istanaFloating.z,
  );
  const marbleMat = palette.getMat(0xf8fafc, 'matte');
  const goldTrimMat = palette.getMat(0xfacc15, 'metal');
  const skyIslandBase = new THREE.Mesh(
    new THREE.CylinderGeometry(11.8, 5.2, 4.4, 14),
    palette.getMat(0x4d7c0f, 'matte'),
  );
  skyIslandBase.position.y = -2.4;
  const skyIslandTop = new THREE.Mesh(
    new THREE.CylinderGeometry(12.4, 11.8, 0.8, 16),
    palette.getMat(0x84cc16, 'matte'),
  );
  skyIslandTop.position.y = 0.0;
  istanaGroup.add(skyIslandBase, skyIslandTop);

  const pBase = new THREE.Mesh(new THREE.BoxGeometry(12.0, 4.0, 8.8), marbleMat);
  pBase.position.y = 2.4;
  const pWingL = new THREE.Mesh(new THREE.BoxGeometry(3.4, 5.6, 4.4), marbleMat);
  pWingL.position.set(-5.4, 3.2, 0);
  const pWingR = pWingL.clone();
  pWingR.position.set(5.4, 3.2, 0);
  const pDome = new THREE.Mesh(new THREE.SphereGeometry(3.3, 14, 10), goldTrimMat);
  pDome.position.set(0, 5.8, 0);
  const pDomeL = new THREE.Mesh(new THREE.SphereGeometry(1.6, 10, 8), goldTrimMat);
  pDomeL.position.set(-5.4, 6.6, 0);
  const pDomeR = pDomeL.clone();
  pDomeR.position.set(5.4, 6.6, 0);
  istanaGroup.add(pBase, pWingL, pWingR, pDome, pDomeL, pDomeR);

  const cloudMat = palette.getMat(0xf8fafc, 'matte');
  [
    [-8, -3.5, 4, 6.0, 2.4, 5.0],
    [6, -3.8, -3, 6.4, 2.6, 5.2],
    [0, -4.8, 0, 8.6, 2.8, 6.6],
  ].forEach(([cx, cy, cz, sx, sy, sz]) => {
    const cl = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), cloudMat);
    cl.position.set(cx, cy, cz);
    istanaGroup.add(cl);
  });

  const istanaDomeMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.42,
    transparent: true,
    opacity: 0.28,
    roughness: 0.1,
    metalness: 0.2,
    depthWrite: false,
  });
  const istanaDome = new THREE.Mesh(new THREE.SphereGeometry(15.0, 24, 18), istanaDomeMat);
  istanaDome.position.y = 3.5;
  istanaGroup.add(istanaDome);
  disposables.push(istanaDomeMat);

  const skyBridgeGeo = new THREE.BoxGeometry(3.8, 0.35, 30);
  const skyBridgeMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.46,
    depthWrite: false,
  });
  const skyBridge = new THREE.Mesh(skyBridgeGeo, skyBridgeMat);
  skyBridge.position.set(68, 14.5, -53);
  skyBridge.rotation.order = 'YXZ';
  skyBridge.rotation.y = -0.68;
  skyBridge.rotation.x = 0.44;
  group.add(istanaGroup, skyBridge);
  disposables.push(skyBridgeGeo, skyBridgeMat);

  // Outer Horizon Sea Clouds matching reference diorama corners
  const outerCloudSpots: Array<[number, number, number]> = [
    [-92, 2.5, 62],
    [-86, 3.2, 74],
    [88, 2.6, 58],
    [94, 3.4, 72],
    [-98, 2.8, -68],
    [104, 3.5, 10],
  ];
  outerCloudSpots.forEach(([ox, oy, oz]) => {
    cliffBlocks.push(
      { x: ox, y: oy, z: oz, sx: 9.0, sy: 2.2, sz: 6.5, color: 0xf8fafc },
      { x: ox + 3.2, y: oy + 1.2, z: oz - 1.5, sx: 5.5, sy: 1.8, sz: 4.5, color: 0xf1f5f9 },
    );
  });

  // Flush batched Voxel Walkable Surfaces & Stepped Cliffs/Mountains
  const walkableBatch = buildVoxelBatch(walkableTopBlocks, neutralVoxelMat, false, true);
  group.add(walkableBatch);
  walkableTargets.push(walkableBatch);
  disposables.push(walkableBatch.geometry);

  const cliffBatch = buildVoxelBatch(cliffBlocks, neutralVoxelMat, true, true);
  group.add(cliffBatch);
  disposables.push(cliffBatch.geometry);

  return {
    group,
    walkableTargets,
    obstacles,
    torchesFlame,
    waterUniforms,
    windmillHub,
    gears,
    clockHands,
    cars,
    minecart,
    crystalMeshes,
    lavaMeshes,
    istanaGroup,
    istanaDome,
    zooCritters,
    disposables,
  };
}

export function updateArchipelagoWorld(
  rig: ArchipelagoRig,
  dt: number,
  elapsed: number,
): void {
  rig.waterUniforms.uTime.value = elapsed;

  rig.windmillHub.rotation.z -= dt * 0.72;

  for (let i = 0; i < rig.gears.length; i++) {
    rig.gears[i].mesh.rotation.z += dt * rig.gears[i].speed;
  }
  for (let i = 0; i < rig.clockHands.length; i++) {
    rig.clockHands[i].rotation.z = -elapsed * 0.45;
  }
  for (let i = 0; i < rig.cars.length; i++) {
    const c = rig.cars[i];
    const s = Math.sin(elapsed * c.speed + c.phase);
    c.mesh.position.x = c.baseX + s * c.rangeX;
    c.mesh.rotation.y = Math.cos(elapsed * c.speed + c.phase) >= 0 ? 0 : Math.PI;
  }

  const cartT = (Math.sin(elapsed * 0.65) + 1) * 0.5;
  rig.minecart.position.x = -2.2 + Math.sin(cartT * 2.1) * 3.2;
  rig.minecart.position.z = -70.0 + cartT * 9.5;
  rig.minecart.position.y = 2.4 + 0.72 + (1 - cartT) * 0.9;

  rig.istanaGroup.position.y = OVERWORLD_ANCHORS.istanaFloating.y + Math.sin(elapsed * 0.85) * 0.65;
  const domeMat = rig.istanaDome.material as THREE.MeshStandardMaterial;
  domeMat.opacity = 0.24 + Math.sin(elapsed * 2.2) * 0.06;

  for (let i = 0; i < rig.zooCritters.length; i++) {
    const c = rig.zooCritters[i];
    const t = elapsed * 1.4 + c.phase;
    c.head.rotation.y = Math.sin(t * 0.9) * 0.25;
    c.head.rotation.x = Math.max(0, Math.sin(t * 1.3)) * 0.16;
  }
}
