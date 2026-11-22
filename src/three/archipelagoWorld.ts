import * as THREE from 'three';
import { ZoneId } from '../types/game';
import { MaterialPalette } from './materials';
import { VillageObstacle } from './minecraftVillage';

export const IELTS_TEMPORARILY_LOCKED = true;

export const OVERWORLD_ANCHORS = {
  hub: { x: 0, y: 2.8, z: 0 },
  desaSpawn: { x: -6.0, y: 2.6, z: 126.0, yaw: Math.PI * 0.85 },
  starterWeapon: { x: -12.5, y: 2.6, z: 123.0 },
  portal: { x: 8.5, y: 2.6, z: -80.5 },
  istanaFloating: { x: 122, y: 38, z: -108 },
  zones: {
    desa_sapaan: { x: -2.0, y: 2.6, z: 112.0 },
    pasar_rasa: { x: -102.0, y: 2.0, z: 52.0 },
    hutan_satwa: { x: 102, y: 3.4, z: 52 },
    gerbang_kota: { x: -66, y: 7.8, z: -42 },
    menara_waktu: { x: 66, y: 6.2, z: -42 },
    gua_portal: { x: 0, y: 2.6, z: -78 },
  } as Record<ZoneId, { x: number; y: number; z: number }>,
  npcs: {
    npc_tetua: { x: 20.0, z: 118.0, rotY: -1.57 },
    npc_koki: { x: -89.5, z: 45.0, rotY: 0.75 },
    npc_rubah: { x: 87.5, z: 42.5, rotY: -1.1 },
    npc_penjaga: { x: -58.5, z: -34.0, rotY: 0.65 },
    npc_penyihir: { x: 59.5, z: -34.2, rotY: -0.65 },
    npc_portal: { x: -4.8, z: -76.5, rotY: 0.45 },
  } as Record<string, { x: number; z: number; rotY: number }>,
  guardPosts: {
    npc_tetua: { x: 11.5, z: 109.0, rotY: -0.9, bedTint: 0xf59e0b },
    npc_koki: { x: -85.5, z: 41.0, rotY: -0.8, bedTint: 0xef4444 },
    npc_rubah: { x: 83.5, z: 36.5, rotY: 0.75, bedTint: 0x10b981 },
    npc_penjaga: { x: -55.2, z: -39.5, rotY: -1.1, bedTint: 0x3b82f6 },
    npc_penyihir: { x: 56.2, z: -39.2, rotY: 1.1, bedTint: 0x8b5cf6 },
    npc_portal: { x: -10.5, z: -75.0, rotY: 0.7, bedTint: 0xa855f7 },
  } as Record<string, { x: number; z: number; rotY: number; bedTint: number }>,
} as const;

export type TerrainSurfaceKind =
  | 'land'
  | 'road'
  | 'stairs'
  | 'beach'
  | 'bridge'
  | 'parkour'
  | 'water';

export interface TerrainSample {
  groundY: number;
  isLandOrBridge: boolean;
  isDryLand: boolean;
  surface: TerrainSurfaceKind;
}

export interface IslandDisk {
  id: 'hub' | ZoneId;
  cx: number;
  cz: number;
  radius: number;
  groundY: number;
}

export interface SeaIslet {
  id: string;
  cx: number;
  cz: number;
  radius: number;
  peakY: number;
  theme: 'sand_green' | 'jungle' | 'rock_sand' | 'basalt' | 'autumn';
}

export interface BridgeGap {
  t0: number;
  t1: number;
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
  gaps?: BridgeGap[];
}

export interface ParkourPad {
  id: string;
  x: number;
  y: number;
  z: number;
  halfW: number;
  halfD: number;
  style: 'stone' | 'wood' | 'ruin_float' | 'dock';
  color?: number;
  chained?: boolean;
}

export const WORLD_OCEAN_LIMIT = 240;
export const SEABED_Y = -1.1;

export const ISLAND_DISKS: IslandDisk[] = [
  { id: 'hub', cx: 0, cz: 0, radius: 25.0, groundY: 2.8 },
  // 120m (radius 60m) Full-Scale Starter Village ("Desa Sapaan") matching level design overview!
  { id: 'desa_sapaan', cx: 0, cz: 118, radius: 60.0, groundY: 2.6 },
  // 110m (radius 55m) Full-Scale Festival Market ("Pasar Rasa") matching level design overview!
  { id: 'pasar_rasa', cx: -122, cz: 50, radius: 55.0, groundY: 2.0 },
  // 130m (radius 65m) Full-Scale Zoo District ("Hutan Satwa") matching level design overview!
  { id: 'hutan_satwa', cx: 120, cz: 58, radius: 65.0, groundY: 3.4 },
  { id: 'gerbang_kota', cx: -66, cz: -42, radius: 28.5, groundY: 4.0 },
  { id: 'menara_waktu', cx: 66, cz: -42, radius: 28.0, groundY: 3.6 },
  { id: 'gua_portal', cx: 0, cz: -82, radius: 29.0, groundY: 2.6 },
];

export const SEA_ISLETS: SeaIslet[] = [
  { id: 'islet_sw', cx: -68, cz: 126, radius: 7.4, peakY: 4.2, theme: 'sand_green' },
  { id: 'islet_se', cx: 62, cz: 168, radius: 7.4, peakY: 4.5, theme: 'jungle' },
  { id: 'islet_w', cx: -142, cz: -20, radius: 8.2, peakY: 5.0, theme: 'rock_sand' },
  { id: 'islet_e', cx: 196, cz: 10, radius: 8.2, peakY: 5.2, theme: 'jungle' },
  { id: 'islet_nw', cx: -42, cz: -84, radius: 7.6, peakY: 5.6, theme: 'basalt' },
  { id: 'islet_ne', cx: 42, cz: -84, radius: 7.6, peakY: 5.4, theme: 'autumn' },
  // Scenic tiny sandy/green sea islets in NW strait off Desa Sapaan (matching level design!)
  { id: 'islet_desa_nw1', cx: -32, cz: 50, radius: 4.4, peakY: 3.1, theme: 'sand_green' },
  { id: 'islet_desa_nw2', cx: -48, cz: 70, radius: 4.6, peakY: 2.9, theme: 'sand_green' },
  { id: 'islet_desa_nw3', cx: -64, cz: 82, radius: 5.4, peakY: 3.5, theme: 'sand_green' },
  // Scenic tiny sandy/jungle sea islets in NW strait off Hutan Satwa (matching level design!)
  { id: 'islet_satwa_nw1', cx: 52, cz: 8, radius: 5.2, peakY: 3.2, theme: 'sand_green' },
  { id: 'islet_satwa_nw2', cx: 68, cz: -4, radius: 4.6, peakY: 2.8, theme: 'jungle' },
  { id: 'islet_satwa_nw3', cx: 84, cz: -14, radius: 5.4, peakY: 3.5, theme: 'sand_green' },
];

export const BRIDGE_SPANS: BridgeSpan[] = [
  {
    id: 'bridge_desa',
    ax: 0,
    az: 21.5,
    ay: 2.8,
    bx: -18.0,
    bz: 62.5,
    by: 2.6,
    halfWidth: 2.6,
    archHeight: 1.0,
    style: 'rope',
    // Scenic suspension bridge connecting Hub South to Desa Sapaan NW shore
  },
  {
    // Exact 5m-wide (halfWidth 2.5) Wooden Bridge ("Jembatan Kayu: Lebar 5m") connecting Hub SW to Pasar Rasa Plaza
    id: 'bridge_pasar',
    ax: -19.5,
    az: 11.5,
    ay: 2.8,
    bx: -72.0,
    bz: 31.0,
    by: 2.0,
    halfWidth: 2.5,
    archHeight: 1.0,
    style: 'wood',
    gaps: [{ t0: 0.45, t1: 0.545 }],
  },
  {
    // Exact 6m-wide (halfWidth 3.0) rope suspension bridge from Hub East directly to Hutan Satwa 16m Gate!
    id: 'bridge_satwa',
    ax: 19.5,
    az: 11.5,
    ay: 2.8,
    bx: 65.0,
    bz: 36.5,
    by: 3.4,
    halfWidth: 3.0,
    archHeight: 1.35,
    style: 'rope',
  },
  {
    id: 'bridge_gerbang',
    ax: -19.5,
    az: -11.5,
    ay: 2.8,
    bx: -43.0,
    bz: -27.5,
    by: 4.0,
    halfWidth: 2.95,
    archHeight: 0.65,
    style: 'stone',
    gaps: [{ t0: 0.45, t1: 0.555 }],
  },
  {
    id: 'bridge_menara',
    ax: 19.5,
    az: -11.5,
    ay: 2.8,
    bx: 43.0,
    bz: -27.5,
    by: 3.6,
    halfWidth: 2.9,
    archHeight: 0.6,
    style: 'stone',
    gaps: [{ t0: 0.45, t1: 0.555 }],
  },
  {
    id: 'bridge_portal',
    ax: 0,
    az: -22.5,
    ay: 2.8,
    bx: 0,
    bz: -56.0,
    by: 2.6,
    halfWidth: 3.0,
    archHeight: 0.7,
    style: 'stone',
    gaps: [{ t0: 0.45, t1: 0.54 }],
  },
  {
    id: 'highway_gerbang',
    ax: -82.0,
    az: -32.0,
    ay: 4.0,
    bx: -118.0,
    bz: -32.0,
    by: 4.0,
    halfWidth: 3.4,
    archHeight: 0.0,
    style: 'highway',
  },
];

// Floating chain ruins, crumbling viaduct jutting over water, sea stepping stones & harbor climb docks
export const PARKOUR_PLATFORMS: ParkourPad[] = [
  // Hub West floating chained stone platforms hovering off the cliff edge over open sea!
  { id: 'hub_chain_1', x: -25.8, y: 4.2, z: -4.6, halfW: 1.7, halfD: 1.7, style: 'ruin_float', chained: true },
  { id: 'hub_chain_2', x: -29.8, y: 5.0, z: -4.8, halfW: 1.65, halfD: 1.65, style: 'ruin_float', chained: true },
  { id: 'hub_chain_3', x: -33.8, y: 5.8, z: -5.2, halfW: 1.7, halfD: 1.7, style: 'ruin_float', chained: true },

  // Gerbang Kota crumbling SE broken viaduct ruins jutting over sea
  { id: 'viaduct_1', x: -42.5, y: 3.8, z: -20.5, halfW: 1.8, halfD: 1.65, style: 'stone' },
  { id: 'viaduct_2', x: -38.0, y: 3.1, z: -17.5, halfW: 1.65, halfD: 1.55, style: 'stone' },
  { id: 'viaduct_3', x: -33.5, y: 2.2, z: -14.8, halfW: 1.55, halfD: 1.5, style: 'stone' },

  // Outer West Sea Stepping Stones (Pasar Rasa North Shore <-> Gerbang Kota SW)
  { id: 'west_hop_1', x: -97.0, y: 0.9, z: -6.0, halfW: 1.8, halfD: 1.8, style: 'stone' },
  { id: 'west_hop_2', x: -93.0, y: 1.4, z: -12.0, halfW: 1.7, halfD: 1.7, style: 'stone' },
  { id: 'west_hop_3', x: -89.0, y: 1.9, z: -18.0, halfW: 1.7, halfD: 1.7, style: 'stone' },
  { id: 'west_hop_4', x: -85.0, y: 2.4, z: -24.0, halfW: 1.8, halfD: 1.8, style: 'stone' },

  // Outer East Sea Stepping Stones (Hutan Satwa NW coast <-> Menara Waktu South Dock)
  { id: 'east_hop_1', x: 102.0, y: 0.9, z: -9.5, halfW: 1.8, halfD: 1.8, style: 'wood' },
  { id: 'east_hop_2', x: 94.0, y: 1.3, z: -11.0, halfW: 1.7, halfD: 1.7, style: 'wood' },
  { id: 'east_hop_3', x: 76.0, y: 1.6, z: -13.5, halfW: 1.7, halfD: 1.7, style: 'wood' },
  { id: 'east_hop_4', x: 69.5, y: 1.9, z: -14.0, halfW: 1.8, halfD: 1.8, style: 'wood' },

  // Low Swim Harbor Docks & Sea-Piers dipping down to y=0.28..0.38 for effortless swimming entry/exit!
  { id: 'dock_desa_south', x: 0, y: 0.28, z: 178.5, halfW: 3.2, halfD: 2.6, style: 'dock' },
  { id: 'dock_desa_west', x: -60.5, y: 0.28, z: 118.0, halfW: 2.6, halfD: 3.0, style: 'dock' },
  { id: 'dock_desa_east', x: 35.0, y: 0.28, z: 167.5, halfW: 2.8, halfD: 2.8, style: 'dock' },
  { id: 'dock_pasar_south', x: -100.0, y: 0.28, z: 102.5, halfW: 3.0, halfD: 2.8, style: 'dock' },
  { id: 'dock_pasar_east', x: -66.5, y: 0.28, z: 47.0, halfW: 3.0, halfD: 2.6, style: 'dock' },
  { id: 'dock_satwa_south', x: 120.0, y: 0.3, z: 123.5, halfW: 3.2, halfD: 2.8, style: 'dock' },
  { id: 'dock_satwa_west', x: 54.5, y: 0.3, z: 62.0, halfW: 2.8, halfD: 3.2, style: 'dock' },
  { id: 'dock_satwa_east', x: 148.0, y: 0.3, z: 117.0, halfW: 3.0, halfD: 2.8, style: 'dock' },
  { id: 'dock_hub_west', x: -25.2, y: 0.32, z: 0, halfW: 2.4, halfD: 2.8, style: 'dock' },
  { id: 'dock_hub_east', x: 25.2, y: 0.32, z: 0, halfW: 2.4, halfD: 2.8, style: 'dock' },
  { id: 'dock_gerbang_south', x: -66.0, y: 0.32, z: -13.8, halfW: 2.8, halfD: 2.5, style: 'dock' },
  { id: 'dock_menara_south', x: 66.0, y: 0.32, z: -14.2, halfW: 2.8, halfD: 2.5, style: 'dock' },
  { id: 'dock_portal_west', x: -29.2, y: 0.3, z: -80.0, halfW: 2.5, halfD: 2.8, style: 'dock' },
  { id: 'dock_portal_east', x: 29.2, y: 0.3, z: -80.0, halfW: 2.5, halfD: 2.8, style: 'dock' },
];

function hash2(gx: number, gz: number): number {
  const n = Math.sin(gx * 127.1 + gz * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0 || 1)));
  return t * t * (3 - 2 * t);
}

function quantizeTier(y: number, step = 0.55): number {
  return Math.round(y / step) * step;
}

/** Multi-octave topographic hill & ridge noise giving genuine valleys, foothills & crests. */
function hillWave(wx: number, wz: number): number {
  return (
    Math.sin(wx * 0.14 + wz * 0.11) * 1.45 +
    Math.cos(wx * 0.22 - wz * 0.17) * 0.95 +
    Math.sin(wx * 0.35 + wz * 0.29) * 0.55
  );
}

function padBlend(
  wx: number,
  wz: number,
  px: number,
  pz: number,
  innerR: number,
  outerR: number,
  padY: number,
  rawY: number,
): number {
  const d = Math.hypot(wx - px, wz - pz);
  if (d <= innerR) return padY;
  if (d >= outerR) return rawY;
  const k = smoothstep(innerR, outerR, d);
  return padY + (rawY - padY) * k;
}

function rectBlend(
  wx: number,
  wz: number,
  x0: number,
  x1: number,
  z0: number,
  z1: number,
  feather: number,
  padY: number,
  rawY: number,
): number {
  const dx = wx < x0 ? x0 - wx : wx > x1 ? wx - x1 : 0;
  const dz = wz < z0 ? z0 - wz : wz > z1 ? wz - z1 : 0;
  const d = Math.hypot(dx, dz);
  if (d <= 0.001) return padY;
  if (d >= feather) return rawY;
  const k = smoothstep(0, feather, d);
  return padY + (rawY - padY) * k;
}

function islandContourRadius(isl: IslandDisk, wx: number, wz: number): number {
  const dx = wx - isl.cx;
  const dz = wz - isl.cz;
  const ang = Math.atan2(dz, dx);
  const wobble =
    Math.sin(ang * 3 + isl.cx * 0.13) * 1.35 +
    Math.cos(ang * 5 - isl.cz * 0.11) * 0.9;
  return isl.radius + wobble;
}

function isletContourRadius(isl: SeaIslet, wx: number, wz: number): number {
  const dx = wx - isl.cx;
  const dz = wz - isl.cz;
  const ang = Math.atan2(dz, dx);
  return isl.radius + Math.sin(ang * 3 + isl.cx * 0.2) * 0.75 + Math.cos(ang * 4 - isl.cz * 0.17) * 0.45;
}

function sampleSeaIslet(
  isl: SeaIslet,
  wx: number,
  wz: number,
  dist: number,
  effR: number,
): { y: number; surface: TerrainSurfaceKind } {
  const tRim = THREE.MathUtils.clamp((effR - dist) / effR, 0, 1);
  if (dist > effR - 2.3) {
    const beachH = 0.25 + smoothstep(effR, effR - 2.3, dist) * 0.8;
    return { y: quantizeTier(beachH, 0.3), surface: 'beach' };
  }
  const raw = 0.95 + Math.pow(tRim, 1.15) * (isl.peakY - 0.95) + hillWave(wx * 1.4, wz * 1.4) * 0.35;
  return { y: quantizeTier(Math.max(0.85, raw), 0.55), surface: 'land' };
}

function sampleIslandInterior(
  isl: IslandDisk,
  wx: number,
  wz: number,
  dist: number,
  effR: number,
): { y: number; surface: TerrainSurfaceKind } {
  const dx = wx - isl.cx;
  const dz = wz - isl.cz;
  const rimSlope = smoothstep(effR, effR - 4.4, dist);

  if (isl.id === 'hub') {
    // 1. Sloping E/W coastal beaches & sea-stairs down to docks (walkable right from water!)
    if (wx < -18.0 && Math.abs(wz) <= 3.0) {
      const t = THREE.MathUtils.clamp((-18.0 - wx) / 6.5, 0, 1);
      return { y: Math.max(0.32, quantizeTier(2.8 - t * 2.45, 0.48)), surface: 'stairs' };
    }
    if (wx > 18.0 && Math.abs(wz) <= 3.0) {
      const t = THREE.MathUtils.clamp((wx - 18.0) / 6.5, 0, 1);
      return { y: Math.max(0.32, quantizeTier(2.8 - t * 2.45, 0.48)), surface: 'stairs' };
    }
    // 2. North, South, E/W & diagonal NW/NE/SW/SE bridgehead causeways at y=2.8!
    if ((Math.abs(dx) <= 3.0 && Math.abs(dz) >= 3.2) || (Math.abs(dz) <= 3.2 && Math.abs(dx) <= 18.5)) {
      return { y: 2.8, surface: 'road' };
    }
    // Diagonal spoke corridors linking center Hub to bridge_pasar / bridge_satwa / bridge_gerbang / bridge_menara
    const absDx = Math.abs(dx);
    const absDz = Math.abs(dz);
    const diagProj = (absDx * 19.5 + absDz * 11.5) / (19.5 * 19.5 + 11.5 * 11.5);
    if (diagProj >= 0.15 && diagProj <= 1.25) {
      const perpDiag = Math.abs(absDx * 11.5 - absDz * 19.5) / Math.hypot(19.5, 11.5);
      if (perpDiag <= 2.95) {
        return { y: 2.8, surface: 'road' };
      }
    }
    // 3. Grand North-East Citadel Staircase up to Rune Obelisk Mountain Summit (y=11.0)!
    if (wx >= 4.2 && wx <= 9.2 && wz <= -4.2 && wz >= -16.4) {
      const prog = THREE.MathUtils.clamp((-4.2 - wz) / 12.0, 0, 1);
      return { y: Math.min(11.0, quantizeTier(2.8 + prog * 8.2, 0.58)), surface: 'stairs' };
    }
    // Summit Obelisk plateau on NE Citadel Peak
    if (wx >= 4.8 && wx <= 15.2 && wz < -15.6 && wz >= -21.8) {
      return { y: 11.0, surface: 'land' };
    }

    // Organic terraced citadel mountain & lowlands everywhere else!
    let h = 2.6 + hillWave(wx, wz) * 0.95;
    if (dz < -2.0 && dx > 3.2) {
      // Sweeping north-east citadel mountain ridge rising steeply behind Obelisk
      const northFactor = smoothstep(-2.0, -18.5, dz) * smoothstep(22.0, 4.0, Math.abs(dx - 10.0));
      h += northFactor * 7.8 + Math.max(0, Math.sin(dx * 0.25)) * 1.4;
    } else if (dz < -2.0 && dx < -3.2) {
      // Western watch ridge overlooking chain parkour
      const nwFactor = smoothstep(-2.0, -17.5, dz) * smoothstep(20.0, 4.0, Math.abs(dx + 10.5));
      h += nwFactor * 5.2;
    }
    // Lava Caldera & cascading lava trough on SE
    const lavaDist = Math.hypot(wx - 9.2, wz - 9.2);
    if (lavaDist <= 4.4) {
      return { y: 2.8, surface: 'land' };
    }
    if (wx > 9.5 && wz > 9.5 && Math.abs(wx - wz) <= 3.2) {
      const tFall = THREE.MathUtils.clamp((wx - 9.5) / 10.5, 0, 1);
      return { y: Math.max(0.35, quantizeTier(2.8 - tFall * 2.4, 0.55)), surface: 'land' };
    }
    // West elevated parkour bluff leading to chain platforms
    if (dx <= -7.5 && dz >= -8.0 && dz <= 4.5 && dist < effR - 3.0) {
      h = Math.max(h, 4.0 + smoothstep(-7.5, -16.0, dx) * 1.2);
    }

    // Protect center plaza & lava rim smoothly
    h = padBlend(wx, wz, 0, 0, 4.2, 8.8, 2.8, h);
    // Coastal sandy/pebble beach slope down into sea around rim (except steep N mountain cliff)
    if (dist > effR - 4.4 && dz > -10.5) {
      const beachY = 0.28 + rimSlope * 2.1;
      return { y: Math.max(0.28, quantizeTier(Math.min(Math.max(0.45, h), beachY), 0.35)), surface: 'beach' };
    }
    return { y: Math.max(0.55, quantizeTier(h, 0.55)), surface: 'land' };
  }

  if (isl.id === 'desa_sapaan') {
    // Full 120m Starter Village (cx=0, cz=118, r=60):
    // 1. South harbor stairs down to dock_desa_south (z=178.5)
    if (wz >= 169.0 && Math.abs(wx) <= 4.5) {
      const t = THREE.MathUtils.clamp((wz - 169.0) / 9.0, 0, 1);
      return { y: Math.max(0.28, quantizeTier(2.6 - t * 2.3, 0.36)), surface: 'stairs' };
    }
    // 2. Winding 4m-wide Footpath ("Jalur Setapak: Lebar 4m", halfWidth=2.0)
    const segDist = (ax: number, az: number, bx: number, bz: number): number => {
      const vx = bx - ax;
      const vz = bz - az;
      const lSq = vx * vx + vz * vz || 1;
      const t = Math.max(0, Math.min(1, ((wx - ax) * vx + (wz - az) * vz) / lSq));
      return Math.hypot(wx - (ax + vx * t), wz - (az + vz * t));
    };
    const onVillagePath =
      segDist(-18.0, 62.5, -18.0, 68.0) <= 2.2 ||
      segDist(-18.0, 68.0, -3.5, 88.0) <= 2.0 ||
      segDist(-3.5, 88.0, -2.0, 112.0) <= 2.0 ||
      segDist(-2.0, 112.0, 11.0, 118.5) <= 2.0 ||
      segDist(11.0, 118.5, 15.2, 118.0) <= 2.0 ||
      segDist(-2.0, 112.0, -5.0, 146.0) <= 2.0 ||
      segDist(-5.0, 146.0, 0.0, 170.0) <= 2.0;
    if (onVillagePath) {
      return { y: 2.6, surface: 'road' };
    }
    // 3. Elevated Wooden Cave Deck Apron (x=17.8..28.5, z=113..123 -> y=3.2m) + entry ramp
    if (wx >= 15.2 && wx <= 17.8 && wz >= 115.0 && wz <= 121.0) {
      const t = THREE.MathUtils.clamp((wx - 15.2) / 2.6, 0, 1);
      return { y: quantizeTier(2.6 + t * 0.6, 0.3), surface: 'stairs' };
    }
    if (wx > 17.8 && wx <= 28.5 && wz >= 113.0 && wz <= 123.0) {
      return { y: 3.2, surface: 'land' };
    }
    // 4. Stepped Stone Staircases climbing West Village Terraces (Rumah 2, Rumah 1, Kincir Angin 22m)
    if (wx >= -14.5 && wx <= -6.5 && wz >= 112.0 && wz <= 117.5) {
      const prog = THREE.MathUtils.clamp((-6.5 - wx) / 8.0, 0, 1);
      return { y: quantizeTier(2.6 + prog * 2.0, 0.45), surface: 'stairs' };
    }
    if (wx >= -14.5 && wx <= -7.5 && wz >= 91.0 && wz <= 101.0) {
      const prog = THREE.MathUtils.clamp((101.0 - wz) / 10.0, 0, 1);
      return { y: quantizeTier(2.6 + prog * 3.6, 0.48), surface: 'stairs' };
    }
    if (wx >= -30.5 && wx <= -22.0 && wz >= 92.5 && wz <= 98.0) {
      const prog = THREE.MathUtils.clamp((-22.0 - wx) / 8.5, 0, 1);
      return { y: quantizeTier(5.0 + prog * 2.4, 0.48), surface: 'stairs' };
    }

    // 5. Rolling Stepped Grasslands + Towering 38m Bukit Gua on East!
    let h = 2.6 + hillWave(wx * 0.52, wz * 0.52) * 1.15;
    // Giant 38m Grass-Capped Cave Hill ("Tinggi Bukit Gua: 38m") on East side
    const caveHillCore = Math.exp(-((wx - 39.5) ** 2 / 260 + (wz - 114.0) ** 2 / 340)) * 35.8;
    const caveHillNorth = Math.exp(-((wx - 33.0) ** 2 / 190 + (wz - 94.0) ** 2 / 200)) * 24.5;
    const caveHillSouth = Math.exp(-((wx - 34.0) ** 2 / 190 + (wz - 134.0) ** 2 / 200)) * 22.0;
    // West Stepped Windmill Bluff & Village Hills
    const windmillHill = Math.exp(-((wx + 34.0) ** 2 + (wz - 96.0) ** 2) / 180) * 5.2;
    const southWestHill = Math.exp(-((wx + 24.0) ** 2 + (wz - 142.0) ** 2) / 170) * 3.8;
    h += caveHillCore + caveHillNorth + caveHillSouth + windmillHill + southWestHill;

    // Smooth NW bridge arrival plaza so straight exit off bridge_desa has zero step jump
    h = padBlend(wx, wz, -18.5, 65.5, 4.8, 10.5, 2.6, h);
    // Crisp flat canyon/apron right in front of the 16m x 14m Mulut Gua entrance!
    h = rectBlend(wx, wz, 13.0, 28.5, 108.0, 128.0, 2.5, 2.6, h);
    // Crisp stepped village terraces & landmark pads
    h = padBlend(wx, wz, -34.0, 96.0, 5.5, 10.5, 7.4, h); // Kincir Angin 22m terrace
    h = rectBlend(wx, wz, -21.0, -6.0, 77.0, 91.0, 4.0, 6.2, h); // Rumah Desa 1 (12m x 10m)
    h = rectBlend(wx, wz, -27.5, -12.5, 111.5, 124.5, 4.0, 4.6, h); // Rumah Desa 2 (12m x 10m)
    h = padBlend(wx, wz, -6.0, 126.0, 5.0, 9.5, 2.6, h); // desaSpawn & village square
    h = padBlend(wx, wz, -12.5, 123.0, 3.2, 6.5, 2.6, h); // starterWeapon
    h = padBlend(wx, wz, -6.5, 111.5, 3.0, 6.0, 2.6, h); // village_well
    h = padBlend(wx, wz, 11.5, 109.0, 3.0, 6.0, 2.6, h); // guardPost
    h = rectBlend(wx, wz, 0.0, 9.0, 130.0, 138.0, 3.5, 2.6, h); // Wheat Farm meadow

    // Gentle sloping sandy beaches around NW/West/South rim for swim-outs
    if (dist > effR - 6.2 && (wx < 22.0 || wz > 142.0)) {
      const beachY = 0.28 + rimSlope * 2.2;
      return { y: Math.max(0.28, quantizeTier(Math.min(Math.max(0.45, h), beachY), 0.36)), surface: 'beach' };
    }
    return { y: Math.max(0.5, Math.min(38.0, quantizeTier(h, 0.7))), surface: 'land' };
  }

  if (isl.id === 'pasar_rasa') {
    // Full 110m Festival Market (cx=-122, cz=50, r=55):
    // 1. East harbor wooden pier ramp down to dock_pasar_east (-66.5, 47.0)
    if (wx >= -75.0 && wx <= -67.0 && wz >= 44.5 && wz <= 49.5) {
      const t = THREE.MathUtils.clamp((wx - -75.0) / 8.0, 0, 1);
      return { y: Math.max(0.28, quantizeTier(2.0 - t * 1.72, 0.36)), surface: 'stairs' };
    }
    // 2. Carved Southern Sand Staircase down to dock_pasar_south (-100, 102.5)
    if (wx >= -104.0 && wx <= -96.5 && wz >= 84.0 && wz <= 101.0) {
      const t = THREE.MathUtils.clamp((wz - 84.0) / 16.0, 0, 1);
      return { y: Math.max(0.28, quantizeTier(2.0 - t * 1.72, 0.36)), surface: 'stairs' };
    }
    // 3. Bridge landing road from bridge_pasar (-72, 31) straight into 45m x 40m Alun-Alun Pasar
    const segDist = (ax: number, az: number, bx: number, bz: number): number => {
      const vx = bx - ax;
      const vz = bz - az;
      const lSq = vx * vx + vz * vz || 1;
      const t = Math.max(0, Math.min(1, ((wx - ax) * vx + (wz - az) * vz) / lSq));
      return Math.hypot(wx - (ax + vx * t), wz - (az + vz * t));
    };
    const onBridgeRoad =
      segDist(-72.0, 31.0, -76.5, 32.7) <= 2.5 ||
      segDist(-76.5, 32.7, -89.5, 45.0) <= 2.4;
    if (onBridgeRoad) {
      return { y: 2.0, surface: 'road' };
    }

    // 4. Rolling Golden Dunes + Towering 32m Red Terracotta Cliff Massif ("Tinggi Tebing: 32m")
    let h = 2.0 + hillWave(wx * 0.45, wz * 0.45) * 0.85;
    const cliffCore = Math.exp(-((wx + 152.0) ** 2 / 310 + (wz - 42.0) ** 2 / 380)) * 30.8;
    const cliffNorth = Math.exp(-((wx + 146.0) ** 2 / 220 + (wz - 20.0) ** 2 / 220)) * 23.0;
    const cliffSouth = Math.exp(-((wx + 148.0) ** 2 / 220 + (wz - 66.0) ** 2 / 210)) * 18.5;
    h += cliffCore + cliffNorth + cliffSouth;

    // Smooth ENE bridge arrival plaza so walking straight off bridge_pasar has zero step jump
    h = padBlend(wx, wz, -74.0, 32.0, 4.8, 10.0, 2.0, h);
    // 5. Alun-Alun Pasar: 45m x 40m Flat Sunlit Golden Sand Terrace (x=-120..-75, z=34..74)
    h = rectBlend(wx, wz, -120.0, -75.0, 34.0, 74.0, 5.5, 2.0, h);
    // Crisp Cave Mouth Floor Apron for 22m x 20m Gua Dapur Rempah (-135..-118, z=36..60)
    h = rectBlend(wx, wz, -135.0, -118.0, 36.0, 60.0, 3.0, 2.0, h);

    // Gentle sandy beaches around East / South / North shore for effortless swimming entry/exit
    if (dist > effR - 5.8 && (wx > -132.0 || wz > 78.0)) {
      const beachY = 0.28 + rimSlope * 1.65;
      return { y: Math.max(0.28, quantizeTier(Math.min(Math.max(0.45, h), beachY), 0.34)), surface: 'beach' };
    }
    return { y: Math.max(0.5, Math.min(32.0, quantizeTier(h, 0.5))), surface: 'land' };
  }

  if (isl.id === 'hutan_satwa') {
    // Full 130m Zoo District (cx=120, cz=58, r=65):
    // 1. Blue Lagoon Basin & SE Cliff Waterfall Outlet (x=142, z=82)
    const lagDist = Math.hypot((wx - 142.0) / 14.5, (wz - 82.0) / 12.5);
    if (lagDist < 1.0) {
      return { y: 0.25, surface: 'beach' };
    }
    if (wx >= 146.0 && wx <= 162.0 && wz >= 86.0 && wz <= 108.0) {
      return { y: 0.25, surface: 'beach' };
    }

    // 2. Winding Yellow-Sand Safari Trail (6m Bridge Arrival -> 16m Gate -> Fork -> Panda/Lagoon & Tiger Cave Jaws!)
    const segDist = (ax: number, az: number, bx: number, bz: number): number => {
      const vx = bx - ax;
      const vz = bz - az;
      const lSq = vx * vx + vz * vz || 1;
      const t = Math.max(0, Math.min(1, ((wx - ax) * vx + (wz - az) * vz) / lSq));
      return Math.hypot(wx - (ax + vx * t), wz - (az + vz * t));
    };
    const onMainTrail =
      segDist(60.0, 34.0, 79.0, 42.0) <= 3.8 ||
      segDist(79.0, 42.0, 96.0, 49.0) <= 3.9 ||
      segDist(96.0, 49.0, 124.0, 47.0) <= 3.8 ||
      segDist(124.0, 47.0, 141.0, 42.5) <= 4.1 ||
      segDist(96.0, 49.0, 114.0, 68.0) <= 3.4 ||
      segDist(114.0, 68.0, 128.0, 74.0) <= 3.4;
    if (onMainTrail) {
      return { y: 3.4, surface: 'road' };
    }

    // 3. Climbable North-East Mountain Trail climbing beside Tiger Cliff (y=3.4 -> 18.5m overlook!)
    if (wx >= 122.0 && wx <= 146.0 && wz >= 14.0 && wz <= 23.0) {
      const prog = THREE.MathUtils.clamp((wx - 122.0) / 23.0, 0, 1);
      return { y: quantizeTier(3.4 + prog * 14.5, 0.7), surface: 'stairs' };
    }

    // 4. Terraced Rolling Jungle Floor + Towering 45m Tiger Cliff Mountain!
    let h = 3.4 + hillWave(wx * 0.55, wz * 0.55) * 0.95;

    // 45m Giant Rocky Tiger Mountain Massif on East / North-East (peak up to 45.0m!)
    const cliffCore = Math.exp(-((wx - 161.5) ** 2 / 320 + (wz - 36.0) ** 2 / 480)) * 41.8;
    const cliffNorthShoulder = Math.exp(-((wx - 150.0) ** 2 / 240 + (wz - 16.0) ** 2 / 240)) * 27.5;
    const cliffSouthShoulder = Math.exp(-((wx - 164.0) ** 2 / 220 + (wz - 62.0) ** 2 / 260)) * 22.0;
    const frontRimHill = Math.exp(-((wx - 122.0) ** 2 + (wz - 108.0) ** 2) / 140) * 3.2;
    h += cliffCore + cliffNorthShoulder + cliffSouthShoulder + frontRimHill;

    // Crisp Level Terraces for the 3 Zoo Enclosures + Gate + NPC + Tiger Cave Mouth Apron
    h = rectBlend(wx, wz, 76.0, 106.0, 55.0, 77.0, 3.5, 3.4, h); // Kandang Jerapah (30m x 22m)
    h = rectBlend(wx, wz, 93.0, 127.0, 18.0, 42.0, 3.5, 3.4, h); // Kandang Zebra (34m x 24m)
    h = rectBlend(wx, wz, 86.0, 126.0, 79.5, 104.5, 3.5, 3.4, h); // Kandang Panda (40m x 25m)
    h = padBlend(wx, wz, 87.5, 42.5, 4.5, 8.5, 3.4, h); // npc_rubah plaza
    h = padBlend(wx, wz, 83.5, 36.5, 3.2, 6.5, 3.4, h); // guardPost
    h = padBlend(wx, wz, 141.0, 42.5, 6.5, 11.5, 3.4, h); // Tiger Head Cave entrance apron!
    h = padBlend(wx, wz, 102.0, 52.0, 5.0, 9.0, 3.4, h); // Teleport / Safari center square

    // Gentle sloping sandy/mossy beaches on West & South rims for effortless ocean swim-outs
    if (dist > effR - 6.5 && (wx < 152.0 || wz > 75.0)) {
      const beachY = 0.28 + rimSlope * 2.4;
      return { y: Math.max(0.28, quantizeTier(Math.min(Math.max(0.45, h), beachY), 0.36)), surface: 'beach' };
    }
    return { y: Math.max(0.55, Math.min(45.0, quantizeTier(h, 0.75))), surface: 'land' };
  }

  if (isl.id === 'gerbang_kota') {
    // 1. Sea-stairs down to South dock
    if (wx >= -69.5 && wx <= -62.5 && wz >= -24.5) {
      const t = THREE.MathUtils.clamp((wz - -24.5) / 9.5, 0, 1);
      return { y: Math.max(0.32, quantizeTier(4.0 - t * 3.65, 0.52)), surface: 'stairs' };
    }
    // 2. Grand Stone Staircase climbing Highway Plaza (y=4.0) -> School Fortress Plateau (y=7.8)!
    if (wx >= -63.0 && wx <= -57.2 && wz >= -42.0 && wz <= -35.0) {
      const prog = THREE.MathUtils.clamp((-35.0 - wz) / 6.8, 0, 1);
      return { y: Math.min(7.8, quantizeTier(4.0 + prog * 3.8, 0.55)), surface: 'stairs' };
    }
    // 3. Elevated Red-Brick School & Fortress Courtyard (y=7.8) + guardPost (-55.2, -39.5)
    if (wz <= -39.0) {
      if (wx >= -57.2 && wz >= -42.5) return { y: 7.8, surface: 'land' };
      if (wx >= -80.0 && wx <= -53.0 && wz >= -56.5 && wz <= -41.5) return { y: 7.8, surface: 'land' };
    }
    // 4. Lower Highway Asphalt Corridor (y=4.0)
    if (wz >= -35.6 && wz <= -28.0 && wx <= -44.0) {
      return { y: 4.0, surface: 'road' };
    }

    // 5. Surrounding Rugged Highlands & Cliff Coastal Ridges (NW Peak up to 13.0m!)
    let h = 4.0 + hillWave(wx * 0.9, wz * 0.9) * 1.2;
    const nwBastionPeak = Math.exp(-((wx + 83.0) ** 2 + (wz + 54.0) ** 2) / 115) * 8.6;
    const neWatchRidge = Math.exp(-((wx + 50.0) ** 2 + (wz + 55.0) ** 2) / 95) * 6.2;
    h += nwBastionPeak + neWatchRidge;

    h = padBlend(wx, wz, -58.5, -34.0, 2.8, 5.5, 4.0, h); // npc_penjaga

    if (dist > effR - 4.6 && dz > -4.0) {
      const beachY = 0.3 + rimSlope * 2.8;
      return { y: Math.max(0.3, quantizeTier(Math.min(Math.max(0.55, h), beachY), 0.4)), surface: 'beach' };
    }
    return { y: Math.max(0.65, quantizeTier(h, 0.55)), surface: 'land' };
  }

  if (isl.id === 'menara_waktu') {
    // 1. South sea-stairs down to dock_menara_south
    if (wx >= 62.5 && wx <= 69.5 && wz >= -25.0) {
      const t = THREE.MathUtils.clamp((wz - -25.0) / 9.5, 0, 1);
      return { y: Math.max(0.32, quantizeTier(3.6 - t * 3.25, 0.52)), surface: 'stairs' };
    }
    // 2. Winding Spiraling Cobblestone Stairway up to Clock Tower Summit (y=10.6)!
    // Flight 1 (West ascent): x: 52..59, z: -38..-47 (3.6 -> 6.8)
    if (wx >= 51.5 && wx <= 59.5 && wz <= -37.5 && wz >= -48.0) {
      const prog = THREE.MathUtils.clamp((-37.5 - wz) / 10.0, 0, 1);
      return { y: quantizeTier(3.6 + prog * 3.2, 0.55), surface: 'stairs' };
    }
    // Flight 2 (North-East ridge ascent): x: 53..66, z: -53..-48 (6.8 -> 10.6)
    if (wx >= 53.0 && wx <= 66.5 && wz <= -47.5 && wz >= -54.5) {
      const prog = THREE.MathUtils.clamp((wx - 53.0) / 13.0, 0, 1);
      return { y: Math.min(10.6, quantizeTier(6.8 + prog * 3.8, 0.55)), surface: 'stairs' };
    }
    // Clock Tower Summit Plateau (y=10.6)
    if (wx >= 64.0 && wx <= 77.5 && wz >= -56.5 && wz <= -44.0) {
      return { y: 10.6, surface: 'land' };
    }

    // 3. Rolling Autumn Highland Ridges & Foothills across Menara Waktu
    let h = 3.8 + hillWave(wx * 0.9, wz * 0.9) * 1.35;
    const towerMount = Math.exp(-((wx - 71.0) ** 2 + (wz + 49.0) ** 2) / 135) * 6.8;
    const eastRidge = Math.exp(-((wx - 83.0) ** 2 + (wz + 38.0) ** 2) / 95) * 5.6;
    h += towerMount + eastRidge;

    h = padBlend(wx, wz, 59.5, -34.2, 3.0, 6.0, 3.6, h); // npc_penyihir
    h = padBlend(wx, wz, 56.2, -39.2, 2.8, 5.4, 3.6, h); // guardPost
    h = padBlend(wx, wz, 72.5, -34.5, 2.8, 5.4, 3.6, h); // timeCave apron

    if (dist > effR - 4.6 && dz > -4.0) {
      const beachY = 0.3 + rimSlope * 2.5;
      return { y: Math.max(0.3, quantizeTier(Math.min(Math.max(0.55, h), beachY), 0.38)), surface: 'beach' };
    }
    return { y: Math.max(0.6, quantizeTier(h, 0.55)), surface: 'land' };
  }

  // gua_portal (0, -82) — Deep Amphitheater + Colossal Jagged Crystal Mountains (up to 17.5m!)
  if (Math.abs(wx) >= 20.0 && wz >= -84.0 && wz <= -76.0) {
    const t = THREE.MathUtils.clamp((Math.abs(wx) - 20.0) / 8.5, 0, 1);
    return { y: Math.max(0.3, quantizeTier(2.6 - t * 2.25, 0.48)), surface: 'stairs' };
  }
  if (Math.abs(wx) <= 3.2 && wz >= -76.0 && wz <= -54.0) {
    return { y: 2.6, surface: 'road' };
  }
  // Twin climbable quarry staircases climbing crystal ridge on W & E flanks
  if (Math.abs(wx) >= 11.0 && Math.abs(wx) <= 17.5 && wz <= -80.0 && wz >= -94.0) {
    const prog = THREE.MathUtils.clamp((-80.0 - wz) / 13.5, 0, 1);
    return { y: quantizeTier(2.6 + prog * 8.4, 0.56), surface: 'stairs' };
  }

  let h = 2.6 + hillWave(wx * 0.9, wz * 0.9) * 1.3;
  const crystalMainPeak = Math.exp(-(wx * wx * 0.7 + (wz + 97.5) ** 2) / 130) * 15.0;
  const crystalWestPeak = Math.exp(-((wx + 15.5) ** 2 + (wz + 94.0) ** 2) / 90) * 10.2;
  const crystalEastPeak = Math.exp(-((wx - 15.5) ** 2 + (wz + 94.0) ** 2) / 90) * 10.6;
  h += crystalMainPeak + crystalWestPeak + crystalEastPeak;

  h = rectBlend(wx, wz, -12.5, 11.5, -83.5, -72.5, 3.2, 2.6, h); // courtyard, portal, npc, guardPost

  if (dist > effR - 4.8 && dz > -10.0) {
    const beachY = 0.28 + rimSlope * 2.1;
    return { y: Math.max(0.28, quantizeTier(Math.min(Math.max(0.5, h), beachY), 0.35)), surface: 'beach' };
  }
  return { y: Math.max(0.5, quantizeTier(h, 0.55)), surface: 'land' };
}

function evalBridgeSample(
  b: BridgeSpan,
  x: number,
  z: number,
): {
  distSq: number;
  rawT: number;
  t: number;
  perp: number;
  inGap: boolean;
  y: number;
  clampedX: number;
  clampedZ: number;
} {
  const vx = b.bx - b.ax;
  const vz = b.bz - b.az;
  const lenSq = vx * vx + vz * vz || 1;
  const rawT = ((x - b.ax) * vx + (z - b.az) * vz) / lenSq;
  const t = Math.max(0, Math.min(1, rawT));
  const projX = b.ax + vx * t;
  const projZ = b.az + vz * t;
  const dx = x - projX;
  const dz = z - projZ;
  const perp = Math.hypot(dx, dz);
  const clampedPerp = Math.max(0, perp - b.halfWidth);
  const scale = perp > 0.0001 ? Math.min(1, b.halfWidth / perp) : 1;
  const clampedX = projX + dx * scale;
  const clampedZ = projZ + dz * scale;
  const y = b.ay + (b.by - b.ay) * t + Math.sin(t * Math.PI) * b.archHeight;

  let inGap = false;
  if (b.gaps) {
    for (let g = 0; g < b.gaps.length; g++) {
      const gap = b.gaps[g];
      if (t > gap.t0 && t < gap.t1) {
        inGap = true;
        break;
      }
    }
  }
  return { distSq: clampedPerp * clampedPerp, rawT, t, perp, inGap, y, clampedX, clampedZ };
}

export function sampleArchipelagoTerrain(x: number, z: number): TerrainSample {
  let bestBridgeY: number | null = null;
  let bestBridgePerp = Infinity;

  for (let i = 0; i < BRIDGE_SPANS.length; i++) {
    const b = BRIDGE_SPANS[i];
    const s = evalBridgeSample(b, x, z);
    if (s.rawT >= -0.02 && s.rawT <= 1.02 && !s.inGap && s.perp <= b.halfWidth + 0.35) {
      if (s.perp < bestBridgePerp) {
        bestBridgePerp = s.perp;
        bestBridgeY = s.y;
      }
    }
  }

  for (let i = 0; i < ISLAND_DISKS.length; i++) {
    const isl = ISLAND_DISKS[i];
    const dist = Math.hypot(x - isl.cx, z - isl.cz);
    const effR = islandContourRadius(isl, x, z);
    if (dist <= effR) {
      const inner = sampleIslandInterior(isl, x, z, dist, effR);
      if (bestBridgeY !== null && dist > effR - 3.2 && bestBridgeY > inner.y) {
        return {
          groundY: bestBridgeY,
          isLandOrBridge: true,
          isDryLand: true,
          surface: 'bridge',
        };
      }
      for (let pIdx = 0; pIdx < PARKOUR_PLATFORMS.length; pIdx++) {
        const p = PARKOUR_PLATFORMS[pIdx];
        if (
          p.style !== 'dock' &&
          Math.abs(x - p.x) <= p.halfW + 0.14 &&
          Math.abs(z - p.z) <= p.halfD + 0.14 &&
          p.y >= inner.y - 0.05
        ) {
          return {
            groundY: p.y,
            isLandOrBridge: true,
            isDryLand: true,
            surface: 'parkour',
          };
        }
      }
      return {
        groundY: inner.y,
        isLandOrBridge: true,
        isDryLand: true,
        surface: inner.surface,
      };
    }
  }

  for (let i = 0; i < SEA_ISLETS.length; i++) {
    const isl = SEA_ISLETS[i];
    const dist = Math.hypot(x - isl.cx, z - isl.cz);
    const effR = isletContourRadius(isl, x, z);
    if (dist <= effR) {
      const inner = sampleSeaIslet(isl, x, z, dist, effR);
      return {
        groundY: inner.y,
        isLandOrBridge: true,
        isDryLand: true,
        surface: inner.surface,
      };
    }
  }

  if (bestBridgeY !== null) {
    return {
      groundY: bestBridgeY,
      isLandOrBridge: true,
      isDryLand: false,
      surface: 'bridge',
    };
  }

  for (let i = 0; i < PARKOUR_PLATFORMS.length; i++) {
    const p = PARKOUR_PLATFORMS[i];
    if (Math.abs(x - p.x) <= p.halfW + 0.18 && Math.abs(z - p.z) <= p.halfD + 0.18) {
      return {
        groundY: p.y,
        isLandOrBridge: true,
        isDryLand: false,
        surface: p.style === 'dock' ? 'beach' : 'parkour',
      };
    }
  }

  return {
    groundY: SEABED_Y,
    isLandOrBridge: false,
    isDryLand: false,
    surface: 'water',
  };
}

export function getArchipelagoGroundY(x: number, z: number): number {
  return sampleArchipelagoTerrain(x, z).groundY;
}

export function isWalkableArchipelago(x: number, z: number, margin = 0): boolean {
  for (let i = 0; i < ISLAND_DISKS.length; i++) {
    const isl = ISLAND_DISKS[i];
    const effR = Math.max(2, islandContourRadius(isl, x, z) - margin);
    if (Math.hypot(x - isl.cx, z - isl.cz) <= effR) return true;
  }
  for (let i = 0; i < SEA_ISLETS.length; i++) {
    const isl = SEA_ISLETS[i];
    const effR = Math.max(1.5, isletContourRadius(isl, x, z) - margin);
    if (Math.hypot(x - isl.cx, z - isl.cz) <= effR) return true;
  }
  for (let i = 0; i < BRIDGE_SPANS.length; i++) {
    const b = BRIDGE_SPANS[i];
    const s = evalBridgeSample(b, x, z);
    if (
      s.rawT >= -0.02 &&
      s.rawT <= 1.02 &&
      !s.inGap &&
      s.perp <= Math.max(0.7, b.halfWidth - margin * 0.5)
    ) {
      return true;
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
    const r = Math.max(2, isl.radius - margin - 0.8);
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
    if (!sample.inGap && sample.distSq < bestDistSq) {
      bestDistSq = sample.distSq;
      bestX = sample.clampedX;
      bestZ = sample.clampedZ;
    }
  }

  pos.x = bestX;
  pos.z = bestZ;
}

export function constrainHeroToWorldBounds(
  pos: { x: number; z: number },
  margin = 1.0,
): void {
  const lim = WORLD_OCEAN_LIMIT - margin;
  pos.x = THREE.MathUtils.clamp(pos.x, -lim, lim);
  pos.z = THREE.MathUtils.clamp(pos.z, -lim, lim);
}

export function getArchipelagoZoneForPosition(x: number, z: number): ZoneId {
  for (let i = 0; i < ISLAND_DISKS.length; i++) {
    const isl = ISLAND_DISKS[i];
    if (isl.id !== 'hub' && Math.hypot(x - isl.cx, z - isl.cz) <= islandContourRadius(isl, x, z) + 2.0) {
      return isl.id;
    }
  }
  const zoneOrder: ZoneId[] = [
    'desa_sapaan',
    'pasar_rasa',
    'hutan_satwa',
    'gerbang_kota',
    'menara_waktu',
    'gua_portal',
  ];
  let best: ZoneId = 'desa_sapaan';
  let bestD = Infinity;
  for (const zId of zoneOrder) {
    const p = OVERWORLD_ANCHORS.zones[zId];
    const d = (x - p.x) * (x - p.x) + (z - p.z) * (z - p.z);
    if (d < bestD) {
      bestD = d;
      best = zId;
    }
  }
  return best;
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

function buildVoxelBatch(
  specs: VoxelSpec[],
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
  zooCritters: Array<{ root: THREE.Group; head: THREE.Group; phase: number }>;
  disposables: Array<{ dispose: () => void }>;
}

function createToothedGear(
  radius: number,
  thickness: number,
  teeth: number,
  goldMat: THREE.Material,
  darkMat: THREE.Material,
): THREE.Group {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, thickness, 16), goldMat);
  rim.rotation.x = Math.PI / 2;
  rim.castShadow = true;
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.34, radius * 0.34, thickness * 1.4, 12), darkMat);
  hub.rotation.x = Math.PI / 2;
  g.add(rim, hub);

  const toothGeo = new THREE.BoxGeometry(radius * 0.32, radius * 0.32, thickness * 0.92);
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const t = new THREE.Mesh(toothGeo, goldMat);
    t.position.set(Math.cos(a) * (radius + radius * 0.13), Math.sin(a) * (radius + radius * 0.13), 0);
    t.rotation.z = a;
    t.castShadow = true;
    g.add(t);
  }
  return g;
}

function createChiliSculpture(
  redMat: THREE.Material,
  stemMat: THREE.Material,
  scale = 1,
): THREE.Group {
  const g = new THREE.Group();
  const seg1 = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.35, 0.95), redMat);
  seg1.position.y = 0.7;
  const seg2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.25, 0.75), redMat);
  seg2.position.set(0.12, -0.45, 0);
  seg2.rotation.z = 0.18;
  const tip = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.85, 0.45), redMat);
  tip.position.set(0.32, -1.3, 0);
  tip.rotation.z = 0.35;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.5), stemMat);
  cap.position.y = 1.55;
  g.add(seg1, seg2, tip, cap);
  g.scale.setScalar(scale);
  return g;
}

function createGiraffeMesh(palette: MaterialPalette): { root: THREE.Group; head: THREE.Group } {
  const r = new THREE.Group();
  const coat = palette.getMat(0xf59e0b, 'matte');
  const spot = palette.getMat(0x78350f, 'matte');
  const legG = new THREE.BoxGeometry(0.22, 1.35, 0.22);
  [[-0.26, -0.45], [0.26, -0.45], [-0.26, 0.45], [0.26, 0.45]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legG, coat);
    leg.position.set(lx, 0.68, lz);
    leg.castShadow = true;
    r.add(leg);
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.75, 1.35), coat);
  body.position.set(0, 1.5, 0);
  body.castShadow = true;
  const spot1 = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.34, 0.36), spot);
  spot1.position.set(0, 1.55, -0.2);
  const spot2 = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.32, 0.32), spot);
  spot2.position.set(0, 1.48, 0.35);
  const head = new THREE.Group();
  head.position.set(0, 1.85, 0.52);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.36, 1.75, 0.36), coat);
  neck.position.set(0, 0.85, 0.14);
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

  // 1. Expansive Vibrant Azure Ocean (swimmable across ±240 archipelago!)
  const oceanGeo = new THREE.PlaneGeometry(840, 840, lowDetail ? 36 : 84, lowDetail ? 36 : 84);
  const oceanMat = palette.createSurfaceMat({
    color: 0x0284c7,
    emissive: 0x0369a1,
    emissiveIntensity: 0.22,
    roughness: 0.56,
    metalness: 0.08,
  });
  oceanMat.customProgramCacheKey = () => 'archipelago-ocean-v3';
  oceanMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = waterUniforms.uTime;
    shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       transformed.z += sin(position.x * 0.14 + uTime * 1.8) * 0.11 + cos(position.y * 0.16 + uTime * 1.45) * 0.09;`,
    );
  };
  const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanMesh.rotation.x = -Math.PI / 2;
  oceanMesh.position.y = 0;
  oceanMesh.receiveShadow = true;
  group.add(oceanMesh);
  walkableTargets.push(oceanMesh);
  disposables.push(oceanGeo, oceanMat);

  const seabedGeo = new THREE.PlaneGeometry(620, 620);
  const seabedMat = palette.getMat(0x0c4a6e, 'matte');
  const seabedMesh = new THREE.Mesh(seabedGeo, seabedMat);
  seabedMesh.rotation.x = -Math.PI / 2;
  seabedMesh.position.y = SEABED_Y - 0.1;
  group.add(seabedMesh);
  disposables.push(seabedGeo);

  const walkableTopBlocks: VoxelSpec[] = [];
  const cliffBlocks: VoxelSpec[] = [];

  const neutralVoxelMat = palette.createSurfaceMat({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.02,
  });
  disposables.push(neutralVoxelMat);

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
  const waterfallMat = palette.createSurfaceMat({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
    roughness: 0.18,
    metalness: 0.1,
  });
  disposables.push(magmaCoreMat, magmaHotMat, crystalMat, waterfallMat);

  // 2. Sculpted Multi-Tiered Mountainous Islands Directly From sampleArchipelagoTerrain
  const islandThemes: Record<
    IslandDisk['id'],
    {
      lowColors: number[];
      highColors: number[];
      pathColors: number[];
      stairColors: number[];
      beachColors: number[];
      cliffColors: number[];
      foamColors: number[];
    }
  > = {
    hub: {
      lowColors: [0x64748b, 0x78716c, 0x4d7c0f, 0x57534e],
      highColors: [0x94a3b8, 0x64748b, 0x65a30d, 0x475569],
      pathColors: [0x94a3b8, 0x78716c],
      stairColors: [0xcbd5e1, 0x94a3b8],
      beachColors: [0x94a3b8, 0xcbd5e1],
      cliffColors: [0x475569, 0x334155, 0x57534e],
      foamColors: [0x38bdf8, 0x7dd3fc],
    },
    desa_sapaan: {
      lowColors: [0x65a30d, 0x589e2e, 0x71bd3d],
      highColors: [0x65a30d, 0x4d7c0f, 0x71bd3d, 0x84cc16],
      pathColors: [0xd4a373, 0xc49655],
      stairColors: [0xd4a373, 0x94a3b8],
      beachColors: [0xfde68a, 0xfcd34d],
      cliffColors: [0x78543a, 0x64748b, 0x5d402a, 0x78716c],
      foamColors: [0x38bdf8, 0xbae6fd],
    },
    pasar_rasa: {
      lowColors: [0xfde047, 0xfacc15, 0xfcd34d],
      highColors: [0xd97706, 0xb45309, 0xc2410c, 0xea580c],
      pathColors: [0xd97706, 0xeab308],
      stairColors: [0xc2410c, 0xd97706],
      beachColors: [0xfef08a, 0xfde047],
      cliffColors: [0xb45309, 0x9a3412, 0xc2410c],
      foamColors: [0x7dd3fc, 0xbae6fd],
    },
    hutan_satwa: {
      lowColors: [0x22c55e, 0x16a34a, 0x4ade80],
      highColors: [0x15803d, 0x166534, 0x4d7c0f, 0x57534e],
      pathColors: [0xc49655, 0xb88a4c],
      stairColors: [0xd4a373, 0x84cc16],
      beachColors: [0xfde68a, 0x86efac],
      cliffColors: [0x5d402a, 0x4d7c0f, 0x3f6212],
      foamColors: [0x38bdf8, 0xbae6fd],
    },
    gerbang_kota: {
      lowColors: [0x94a3b8, 0x64748b, 0x65a30d],
      highColors: [0x64748b, 0x475569, 0x94a3b8, 0x4d7c0f],
      pathColors: [0x475569, 0x334155],
      stairColors: [0xe2e8f0, 0x94a3b8],
      beachColors: [0xcbd5e1, 0x94a3b8],
      cliffColors: [0x52525b, 0x3f3f46, 0x64748b],
      foamColors: [0x38bdf8, 0x93c5fd],
    },
    menara_waktu: {
      lowColors: [0x84cc16, 0x65a30d, 0xa3e635],
      highColors: [0xd97706, 0xb45309, 0x84cc16, 0x65a30d],
      pathColors: [0xb88a4c, 0x94a3b8],
      stairColors: [0xd97706, 0xb45309],
      beachColors: [0xfde68a, 0x94a3b8],
      cliffColors: [0x78543a, 0x57534e, 0x65a30d],
      foamColors: [0x38bdf8, 0xbae6fd],
    },
    gua_portal: {
      lowColors: [0x334155, 0x475569, 0x1e293b],
      highColors: [0x475569, 0x64748b, 0x312e81, 0x1e293b],
      pathColors: [0x64748b, 0x475569],
      stairColors: [0x94a3b8, 0x64748b],
      beachColors: [0x64748b, 0x94a3b8],
      cliffColors: [0x1e293b, 0x0f172a, 0x312e81],
      foamColors: [0x60a5fa, 0x93c5fd],
    },
  };

  const cellStep = lowDetail ? 2.2 : 1.75;
  const topThickness = 0.65;
  for (let idx = 0; idx < ISLAND_DISKS.length; idx++) {
    const isl = ISLAND_DISKS[idx];
    const theme = islandThemes[isl.id];
    const outerR = isl.radius + 3.8;
    const minGx = Math.floor((isl.cx - outerR) / cellStep);
    const maxGx = Math.ceil((isl.cx + outerR) / cellStep);
    const minGz = Math.floor((isl.cz - outerR) / cellStep);
    const maxGz = Math.ceil((isl.cz + outerR) / cellStep);

    for (let gx = minGx; gx <= maxGx; gx++) {
      for (let gz = minGz; gz <= maxGz; gz++) {
        const wx = gx * cellStep;
        const wz = gz * cellStep;
        const dist = Math.hypot(wx - isl.cx, wz - isl.cz);
        const effR = islandContourRadius(isl, wx, wz);

        if (dist <= effR) {
          const inner = sampleIslandInterior(isl, wx, wz, dist, effR);
          const colList =
            inner.surface === 'stairs'
              ? theme.stairColors
              : inner.surface === 'road'
              ? theme.pathColors
              : inner.surface === 'beach'
              ? theme.beachColors
              : isl.id === 'pasar_rasa' && inner.y >= 26.5
              ? [0x65a30d, 0x84cc16, 0x4d7c0f]
              : inner.y > isl.groundY + 3.2
              ? theme.highColors
              : theme.lowColors;
          const tierBias = Math.floor(inner.y * 1.3);
          const colHex = colList[Math.abs(gx * 7 + gz * 13 + idx + tierBias) % colList.length];

          walkableTopBlocks.push({
            x: wx,
            y: inner.y - topThickness * 0.5,
            z: wz,
            sx: cellStep * 1.03,
            sy: topThickness,
            sz: cellStep * 1.03,
            color: colHex,
          });

          const nNorth = sampleIslandInterior(isl, wx, wz - cellStep, Math.hypot(wx - isl.cx, wz - cellStep - isl.cz), effR).y;
          const nSouth = sampleIslandInterior(isl, wx, wz + cellStep, Math.hypot(wx - isl.cx, wz + cellStep - isl.cz), effR).y;
          const nWest = sampleIslandInterior(isl, wx - cellStep, wz, Math.hypot(wx - cellStep - isl.cx, wz - isl.cz), effR).y;
          const nEast = sampleIslandInterior(isl, wx + cellStep, wz, Math.hypot(wx + cellStep - isl.cx, wz - isl.cz), effR).y;
          const minNeighborY = Math.min(nNorth, nSouth, nWest, nEast);
          const isOuterRim = dist > effR - cellStep * 1.9;
          const hasSteepDrop = inner.y - minNeighborY > 0.2;

          if (isOuterRim || hasSteepDrop) {
            const bottomY = isOuterRim ? SEABED_Y - 0.15 : Math.max(SEABED_Y - 0.15, minNeighborY - topThickness);
            const topColumnY = inner.y - topThickness;
            const colH = Math.max(0.38, topColumnY - bottomY);
            const cliffHex = theme.cliffColors[Math.abs(gx * 3 + gz * 5 + tierBias) % theme.cliffColors.length];
            cliffBlocks.push({
              x: wx,
              y: bottomY + colH * 0.5,
              z: wz,
              sx: cellStep * 1.03,
              sy: colH,
              sz: cellStep * 1.03,
              color: cliffHex,
            });
          }
        } else if (dist <= effR + 2.4 && hash2(gx + 11, gz - 7) > 0.26) {
          cliffBlocks.push({
            x: wx,
            y: 0.04,
            z: wz,
            sx: cellStep * 0.96,
            sy: 0.14,
            sz: cellStep * 0.96,
            color: theme.foamColors[Math.abs(gx + gz) % theme.foamColors.length],
          });
        }
      }
    }
  }

  // 2b. Render 6 Exploratory Sea Islets / Atolls Across the Wide Straits
  const isletPalettes: Record<SeaIslet['theme'], { top: number[]; beach: number[]; cliff: number[] }> = {
    sand_green: { top: [0x65a30d, 0x4d7c0f], beach: [0xfde68a, 0xfcd34d], cliff: [0x78543a, 0x64748b] },
    jungle: { top: [0x22c55e, 0x15803d], beach: [0xfde68a, 0x86efac], cliff: [0x5d402a, 0x4d7c0f] },
    rock_sand: { top: [0xd97706, 0x78716c], beach: [0xfef08a, 0xfde047], cliff: [0x9a3412, 0x57534e] },
    basalt: { top: [0x475569, 0x334155], beach: [0x64748b, 0x94a3b8], cliff: [0x1e293b, 0x0f172a] },
    autumn: { top: [0x84cc16, 0xd97706], beach: [0xfde68a, 0x94a3b8], cliff: [0x78543a, 0x57534e] },
  };
  for (let idx = 0; idx < SEA_ISLETS.length; idx++) {
    const isl = SEA_ISLETS[idx];
    const pal = isletPalettes[isl.theme];
    const outerR = isl.radius + 2.2;
    const minGx = Math.floor((isl.cx - outerR) / cellStep);
    const maxGx = Math.ceil((isl.cx + outerR) / cellStep);
    const minGz = Math.floor((isl.cz - outerR) / cellStep);
    const maxGz = Math.ceil((isl.cz + outerR) / cellStep);
    for (let gx = minGx; gx <= maxGx; gx++) {
      for (let gz = minGz; gz <= maxGz; gz++) {
        const wx = gx * cellStep;
        const wz = gz * cellStep;
        const dist = Math.hypot(wx - isl.cx, wz - isl.cz);
        const effR = isletContourRadius(isl, wx, wz);
        if (dist <= effR) {
          const inner = sampleSeaIslet(isl, wx, wz, dist, effR);
          const colList = inner.surface === 'beach' ? pal.beach : pal.top;
          walkableTopBlocks.push({
            x: wx,
            y: inner.y - topThickness * 0.5,
            z: wz,
            sx: cellStep * 1.03,
            sy: topThickness,
            sz: cellStep * 1.03,
            color: colList[Math.abs(gx + gz) % colList.length],
          });
          cliffBlocks.push({
            x: wx,
            y: (inner.y - topThickness + SEABED_Y) * 0.5,
            z: wz,
            sx: cellStep * 1.03,
            sy: Math.max(0.4, inner.y - topThickness - SEABED_Y),
            sz: cellStep * 1.03,
            color: pal.cliff[Math.abs(gx * 3 + gz) % pal.cliff.length],
          });
        }
      }
    }
  }

  // 3. Build Connecting Bridges (Clear, Architectural Single-Gap Parkour Spans!)
  const plankMat = palette.getPixelMat('oak_plank');
  const spruceMat = palette.getPixelMat('spruce_plank');
  const cobbleMat = palette.getPixelMat('cobble');
  const roadMat = palette.roadMat;

  for (const br of BRIDGE_SPANS) {
    const segs = 20;
    const dx = br.bx - br.ax;
    const dz = br.bz - br.az;
    const totalLen = Math.hypot(dx, dz);
    const yaw = Math.atan2(dx, dz);
    const stepLen = totalLen / segs + 0.1;
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
      const mx = (x0 + x1) * 0.5;
      const my = (y0 + y1) * 0.5;
      const mz = (z0 + z1) * 0.5;
      const slope = Math.atan2(y1 - y0, Math.hypot(x1 - x0, z1 - z0));

      let inGap = false;
      let isJumpEdge = false;
      if (br.gaps) {
        for (const g of br.gaps) {
          if (tm > g.t0 && tm < g.t1) {
            inGap = true;
            break;
          }
          if (Math.abs(tm - g.t0) < 0.06 || Math.abs(tm - g.t1) < 0.06) {
            isJumpEdge = true;
          }
        }
      }

      if (inGap) {
        // Sunken rubble or sagging rope cables clearly marking the jumpable chasm!
        if (br.style === 'rope') {
          const perpX = Math.cos(yaw) * (br.halfWidth - 0.16);
          const perpZ = -Math.sin(yaw) * (br.halfWidth - 0.16);
          [-1, 1].forEach((side) => {
            cliffBlocks.push({
              x: mx + perpX * side,
              y: my + 0.65,
              z: mz + perpZ * side,
              sx: 0.16,
              sy: 0.16,
              sz: stepLen,
              color: 0x78350f,
            });
          });
        } else {
          cliffBlocks.push({
            x: mx,
            y: -0.45,
            z: mz,
            sx: 1.8,
            sy: 0.9,
            sz: 1.8,
            color: 0x475569,
          });
        }
        continue;
      }

      const segGeo = new THREE.BoxGeometry(width, 0.42, stepLen);
      const segMesh = new THREE.Mesh(segGeo, deckMat);
      segMesh.position.set(mx, my - 0.21, mz);
      segMesh.rotation.order = 'YXZ';
      segMesh.rotation.y = yaw;
      segMesh.rotation.x = -slope;
      segMesh.castShadow = true;
      segMesh.receiveShadow = true;
      group.add(segMesh);
      walkableTargets.push(segMesh);
      disposables.push(segGeo);

      // Clear amber/gold edge markers flanking broken gap edges so jump timing is obvious!
      if (isJumpEdge) {
        const perpX = Math.cos(yaw) * (br.halfWidth - 0.24);
        const perpZ = -Math.sin(yaw) * (br.halfWidth - 0.24);
        [-1, 1].forEach((side) => {
          cliffBlocks.push({
            x: mx + perpX * side,
            y: my + 0.72,
            z: mz + perpZ * side,
            sx: 0.42,
            sy: 1.45,
            sz: 0.42,
            color: br.style === 'rope' ? 0xd97706 : 0xf59e0b,
          });
        });
      } else if (s % 2 === 0 || s === segs - 1) {
        const perpX = Math.cos(yaw) * (br.halfWidth - 0.16);
        const perpZ = -Math.sin(yaw) * (br.halfWidth - 0.16);
        const railColor = br.style === 'stone' || br.style === 'highway' ? 0x64748b : 0x78350f;
        const railH = br.style === 'rope' ? 1.1 : 0.78;
        [-1, 1].forEach((side) => {
          cliffBlocks.push({
            x: mx + perpX * side,
            y: my + railH * 0.5,
            z: mz + perpZ * side,
            sx: 0.28,
            sy: railH,
            sz: 0.28,
            color: railColor,
          });
        });
      }

      // Sturdy Sea Piers supporting intact spans
      if (s === 3 || s === 7 || s === 12 || s === 16 || isJumpEdge) {
        cliffBlocks.push({
          x: mx,
          y: (my + SEABED_Y) * 0.5 - 0.2,
          z: mz,
          sx: br.style === 'highway' ? 2.6 : 1.55,
          sy: my - SEABED_Y + 0.2,
          sz: br.style === 'highway' ? 2.6 : 1.55,
          color: br.style === 'stone' || br.style === 'highway' ? 0x475569 : 0x5c3a1e,
        });
      }
    }
  }

  // 3b. Floating Chain Ruins, Viaduct Jutties, Sea Stepping Stones & Low Harbor Swim Piers
  const chainMat = palette.getMat(0x334155, 'metal');
  for (const pad of PARKOUR_PLATFORMS) {
    const padColor =
      pad.color ??
      (pad.style === 'dock'
        ? 0xb88a4c
        : pad.style === 'wood'
        ? 0xa16207
        : pad.style === 'ruin_float'
        ? 0x64748b
        : 0x78716c);

    walkableTopBlocks.push({
      x: pad.x,
      y: pad.y - 0.28,
      z: pad.z,
      sx: pad.halfW * 2,
      sy: 0.56,
      sz: pad.halfD * 2,
      color: padColor,
    });

    if (pad.chained) {
      for (let c = 0; c < 5; c++) {
        const link = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.55, 0.24), chainMat);
        link.position.set(pad.x, pad.y + 0.55 + c * 0.78, pad.z);
        link.rotation.y = c * 0.78;
        group.add(link);
      }
      const anchorBar = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.35, 0.85), cobbleMat);
      anchorBar.position.set(pad.x, pad.y + 4.4, pad.z);
      group.add(anchorBar);
    } else if (pad.style === 'dock') {
      [-pad.halfW + 0.24, pad.halfW - 0.24].forEach((ox) => {
        [-pad.halfD + 0.24, pad.halfD - 0.24].forEach((oz) => {
          cliffBlocks.push({
            x: pad.x + ox,
            y: 0.15,
            z: pad.z + oz,
            sx: 0.32,
            sy: 2.0,
            sz: 0.32,
            color: 0x5c3a1e,
          });
        });
      });
    } else {
      cliffBlocks.push({
        x: pad.x,
        y: (pad.y + SEABED_Y) * 0.5 - 0.25,
        z: pad.z,
        sx: pad.halfW * 1.45,
        sy: pad.y - SEABED_Y + 0.2,
        sz: pad.halfD * 1.45,
        color: pad.style === 'wood' ? 0x5c3a1e : 0x475569,
      });
    }
  }

  // ============================================================================
  // 0. HUB TENGAH (0, 0) — Rune Obelisk Summit + Cascading Molten Lava Fall
  // ============================================================================
  {
    const hubLava = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.28, 6.2), magmaCoreMat);
    hubLava.position.set(9.2, 2.74, 9.2);
    lavaMeshes.push(hubLava);
    group.add(hubLava);

    // Molten Lava Waterfall pouring down SE basalt terraces into steaming sea
    [
      [11.8, 2.1, 11.8, 2.6, 0.9, 2.6],
      [14.2, 1.35, 14.2, 2.6, 1.1, 2.6],
      [16.5, 0.45, 16.5, 3.0, 0.95, 3.0],
    ].forEach(([lx, ly, lz, sx, sy, sz], i) => {
      const fall = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz),
        i % 2 === 0 ? magmaHotMat : magmaCoreMat,
      );
      fall.position.set(lx, ly, lz);
      lavaMeshes.push(fall);
      group.add(fall);
    });
    obstacles.push({ x: 9.2, z: 9.2, halfW: 3.5, halfD: 3.2 });

    const obY = getArchipelagoGroundY(10.5, -18.5);
    const obPlinth = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.1, 4.4), cobbleMat);
    obPlinth.position.set(10.5, obY + 0.55, -18.5);
    obPlinth.castShadow = true;
    const obShaft = new THREE.Mesh(new THREE.BoxGeometry(2.3, 6.0, 2.3), palette.getMat(0x334155, 'matte'));
    obShaft.position.set(10.5, obY + 4.1, -18.5);
    obShaft.castShadow = true;
    const obRune = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.4, 2.45), magmaHotMat);
    obRune.position.set(10.5, obY + 4.5, -18.5);
    const obCrown = new THREE.Mesh(new THREE.OctahedronGeometry(1.1, 0), crystalMat);
    obCrown.position.set(10.5, obY + 8.0, -18.5);
    crystalMeshes.push(obCrown);
    group.add(obPlinth, obShaft, obRune, obCrown);
    obstacles.push({ x: 10.5, z: -18.5, halfW: 2.3, halfD: 2.3 });

    [
      [7.2, -16.8],
      [13.8, -16.8],
      [-5.2, 5.2],
      [5.2, -5.2],
    ].forEach(([tx, tz]) => {
      const ty = getArchipelagoGroundY(tx, tz);
      const brazier = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.25, 0.9), cobbleMat);
      brazier.position.set(tx, ty + 0.62, tz);
      const flame = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.62), magmaHotMat);
      flame.position.set(tx, ty + 1.55, tz);
      flame.userData.isFlame = true;
      torchesFlame.push(flame);
      group.add(brazier, flame);
    });
  }

  // ============================================================================
  // 1. DESA SAPAAN ISLAND (0, z=118, Panjang 120m!)
  //    - Kincir Angin Raksasa (T: 22m)
  //    - 2 Rumah Desa (12m x 10m via rpgModels)
  //    - Bukit Gua 38m + Mulut Gua Batu (T: 14m / L: 16m) + Dek Kayu + Pohon Desa (6-10m)
  // ============================================================================
  const windmillHub = new THREE.Group();
  {
    const millX = -34.0;
    const millZ = 96.0;
    const my = getArchipelagoGroundY(millX, millZ);
    const mill = new THREE.Group();
    mill.position.set(millX, my, millZ);
    mill.rotation.y = 0.65;
    const mPlinth = new THREE.Mesh(new THREE.BoxGeometry(6.2, 2.2, 6.2), cobbleMat);
    mPlinth.position.y = 1.1;
    mPlinth.castShadow = true;
    const mBase = new THREE.Mesh(new THREE.BoxGeometry(5.0, 6.8, 5.0), cobbleMat);
    mBase.position.y = 5.6;
    mBase.castShadow = true;
    const mTrim = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.55, 5.5), spruceMat);
    mTrim.position.y = 9.2;
    const mTower = new THREE.Mesh(new THREE.BoxGeometry(4.2, 8.2, 4.2), palette.getMat(0xf8fafc, 'matte'));
    mTower.position.y = 13.4;
    mTower.castShadow = true;
    const mDoor = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 0.3), spruceMat);
    mDoor.position.set(0, 1.2, 3.12);
    // Terracotta pitched gable roof reaching T = 22.0m!
    const roofTerraMat = palette.getMat(0xd97706, 'matte');
    for (let t = 0; t < 5; t++) {
      const rw = 5.2 - t * 0.9;
      const tier = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.95, 5.0), roofTerraMat);
      tier.position.y = 17.85 + t * 0.9;
      tier.castShadow = true;
      mill.add(tier);
    }

    windmillHub.position.set(0, 15.2, 2.45);
    const hubCore = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.25, 1.25), palette.getPixelMat('oak_log'));
    windmillHub.add(hubCore);
    const sailMat = palette.getMat(0xfef9c3, 'matte');
    for (let s = 0; s < 4; s++) {
      const armPivot = new THREE.Group();
      armPivot.rotation.z = (s * Math.PI) / 2;
      const spar = new THREE.Mesh(new THREE.BoxGeometry(0.36, 6.2, 0.24), plankMat);
      spar.position.y = 3.1;
      const sail = new THREE.Mesh(new THREE.BoxGeometry(1.65, 4.4, 0.12), sailMat);
      sail.position.set(0.88, 3.4, 0.08);
      armPivot.add(spar, sail);
      windmillHub.add(armPivot);
    }
    mill.add(mPlinth, mBase, mTrim, mTower, mDoor, windmillHub);
    group.add(mill);
    obstacles.push({ x: millX, z: millZ, halfW: 3.4, halfD: 3.4 });

    // Wooden crates beside the windmill
    [
      [-28.5, 99.5, 1.2],
      [-27.2, 100.6, 0.95],
    ].forEach(([cx, cz, cs]) => {
      const cy = getArchipelagoGroundY(cx, cz);
      cliffBlocks.push({ x: cx, y: cy + cs * 0.5, z: cz, sx: cs, sy: cs, sz: cs, color: 0xb45309 });
    });

    // Mulut Gua Raksasa (T: 14m / L: 16m!) + Raised Wooden Cave Deck (10.5m x 11.5m) at (28, 118)
    const caveFloorY = 2.6;
    // Wooden Cave Deck resting on thick oak pilings
    walkableTopBlocks.push({ x: 23.0, y: 2.95, z: 118.0, sx: 10.5, sy: 0.5, sz: 10.4, color: 0xb88a4c });
    [
      [18.5, 113.5],
      [18.5, 122.5],
      [27.0, 113.5],
      [27.0, 122.5],
    ].forEach(([px, pz]) => {
      cliffBlocks.push({ x: px, y: 2.2, z: pz, sx: 0.65, sy: 1.8, sz: 0.65, color: 0x5c3a1e });
    });

    // Grand Stepped Stone Cave Archway (Lebar 16m x Tinggi 14m!) carved into the 38m East Bukit Gua
    const stoneDark = 0x475569;
    const stoneMid = 0x64748b;
    const stoneLight = 0x94a3b8;
    // Outer Side Arch Pillars (z=110.5 and z=125.5 -> full 16m outer span!)
    [110.5, 125.5].forEach((az) => {
      cliffBlocks.push({ x: 28.0, y: caveFloorY + 5.2, z: az, sx: 4.5, sy: 10.4, sz: 2.8, color: stoneMid });
      cliffBlocks.push({ x: 26.8, y: caveFloorY + 4.2, z: az + (az < 118 ? 1.2 : -1.2), sx: 2.8, sy: 8.4, sz: 1.8, color: stoneLight });
    });
    // Stepped Arch Crown Tiers up to T = 14.0m!
    cliffBlocks.push({ x: 27.5, y: caveFloorY + 10.2, z: 112.5, sx: 4.2, sy: 2.4, sz: 4.2, color: stoneMid });
    cliffBlocks.push({ x: 27.5, y: caveFloorY + 10.2, z: 123.5, sx: 4.2, sy: 2.4, sz: 4.2, color: stoneMid });
    cliffBlocks.push({ x: 27.5, y: caveFloorY + 12.0, z: 115.0, sx: 4.4, sy: 2.2, sz: 5.5, color: stoneLight });
    cliffBlocks.push({ x: 27.5, y: caveFloorY + 12.0, z: 121.0, sx: 4.4, sy: 2.2, sz: 5.5, color: stoneLight });
    cliffBlocks.push({ x: 27.5, y: caveFloorY + 13.3, z: 118.0, sx: 4.6, sy: 1.6, sz: 7.5, color: stoneDark });
    // Deep Dark Cavern Interior & Glowing Amber Ember Floor inside the Mouth
    const caveDarkMesh = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 10.5, 10.8),
      palette.getMat(0x090d16, 'matte'),
    );
    caveDarkMesh.position.set(32.5, caveFloorY + 5.2, 118.0);
    const caveEmberMesh = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 0.32, 7.2),
      magmaCoreMat,
    );
    caveEmberMesh.position.set(30.5, 3.25, 118.0);
    lavaMeshes.push(caveEmberMesh);
    group.add(caveDarkMesh, caveEmberMesh);

    // Twin Tall Stone Torch Pedestals Flanking the Wooden Cave Deck
    [111.5, 124.5].forEach((tz) => {
      cliffBlocks.push({ x: 20.5, y: 3.9, z: tz, sx: 1.35, sy: 2.6, sz: 1.35, color: stoneMid });
      cliffBlocks.push({ x: 20.5, y: 5.4, z: tz, sx: 0.75, sy: 0.65, sz: 0.75, color: 0x78350f });
      const tFlame = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.05, 0.85), magmaHotMat);
      tFlame.position.set(20.5, 6.2, tz);
      tFlame.userData.isFlame = true;
      torchesFlame.push(tFlame);
      group.add(tFlame);
    });
    // Arch pillar + cavern backwall colliders (central wooden deck & mouth stay walkable!)
    obstacles.push(
      { x: 28.0, z: 110.2, halfW: 2.4, halfD: 1.8 },
      { x: 28.0, z: 125.8, halfW: 2.4, halfD: 1.8 },
      { x: 32.0, z: 118.0, halfW: 2.6, halfD: 5.5 },
    );

    // Wooden Village Signpost beside the 4m footpath
    const signY = getArchipelagoGroundY(-1.5, 131.5);
    cliffBlocks.push({ x: -1.5, y: signY + 1.1, z: 131.5, sx: 0.35, sy: 2.2, sz: 0.35, color: 0x5c3a1e });
    cliffBlocks.push({ x: -1.5, y: signY + 1.85, z: 131.5, sx: 1.8, sy: 0.95, sz: 0.28, color: 0xb88a4c });

    // Pohon Desa (T: 6m - 10m!) stylized voxel oak trees across terraces & meadow
    const desaTreeSpots: Array<[number, number, number, number]> = [
      // [x, z, trunkHeight (3.5..5.6m), canopySize (3.6..4.8m)] -> Total height 6m - 10m!
      [-23.5, 72.0, 4.2, 4.0],
      [-28.5, 81.5, 4.8, 4.4],
      [-3.5, 76.0, 4.0, 3.8],
      [6.5, 86.0, 5.2, 4.6],
      [-2.5, 96.0, 4.4, 4.0],
      [-37.0, 114.0, 4.6, 4.2],
      [-33.5, 130.0, 5.4, 4.8],
      [-21.0, 138.0, 4.2, 3.8],
      [-10.5, 148.0, 4.8, 4.2],
      [6.5, 142.0, 4.4, 4.0],
      [15.5, 136.0, 5.0, 4.4],
      [23.5, 140.0, 4.6, 4.2],
      [31.5, 144.0, 5.4, 4.6],
      [-24.0, 156.0, 4.2, 3.8],
      [11.0, 158.0, 4.8, 4.4],
      [-43.5, 104.0, 5.0, 4.5],
      [15.0, 96.0, 4.5, 4.0],
      [-7.0, 102.0, 3.8, 3.6],
    ];
    desaTreeSpots.forEach(([tx, tz, th, cw], ti) => {
      const ty = getArchipelagoGroundY(tx, tz);
      if (ty < 1.0) return;
      cliffBlocks.push({ x: tx, y: ty + th * 0.5, z: tz, sx: 1.05, sy: th, sz: 1.05, color: 0x5c3a1e });
      obstacles.push({ x: tx, z: tz, halfW: 0.72, halfD: 0.72 });
      const leaf1 = ti % 2 === 0 ? 0x65a30d : 0x4d7c0f;
      const leaf2 = ti % 2 === 0 ? 0x84cc16 : 0x65a30d;
      walkableTopBlocks.push({ x: tx, y: ty + th + 0.9, z: tz, sx: cw, sy: 1.8, sz: cw, color: leaf1 });
      walkableTopBlocks.push({ x: tx, y: ty + th + 2.5, z: tz, sx: cw * 0.68, sy: 1.5, sz: cw * 0.68, color: leaf2 });
    });
  }

  // ============================================================================
  // 2. PASAR RASA ISLAND (cx=-122, cz=50, Panjang 110m!)
  //    - Tinggi Tebing: 32m (berpuncak rumput hijau)
  //    - Gua Dapur Rempah (T: 22m / L: 20m) + 4 Cabai Voxel Raksasa
  //    - Monumen Raksasa Tumpeng (T: 18m)
  //    - 4 Lapak & Tenda Pasar (8m x 6m) + 4 Api Unggun + Dermaga Kayu Timur
  // ============================================================================
  {
    const plazaY = getArchipelagoGroundY(-103.0, 52.0);

    // 2a. Monumen Raksasa Tumpeng (T: 18m!) centered in the 45m x 40m Alun-Alun Pasar
    const tumpeng = new THREE.Group();
    tumpeng.position.set(-103.0, plazaY, 52.0);
    const bowlDarkMat = palette.getMat(0x78350f, 'matte');
    const bowlMidMat = palette.getMat(0x9a3412, 'matte');
    const bananaLeafMat = palette.getMat(0x4d7c0f, 'matte');
    const riceGoldMat = palette.getMat(0xfacc15, 'matte');
    const riceDeepMat = palette.getMat(0xeab308, 'matte');
    const riceTipMat = palette.getMat(0x22c55e, 'matte');
    // Stepped Circular Woven/Terracotta Platter Base (h=0..4.2m)
    const platterRings: Array<[number, number, number, THREE.Material]> = [
      [5.4, 0.9, 0.45, bowlDarkMat],
      [6.1, 1.0, 1.35, bowlMidMat],
      [6.6, 1.1, 2.35, bowlDarkMat],
      [6.8, 0.95, 3.35, bowlMidMat],
      [6.4, 0.55, 4.05, bananaLeafMat],
    ];
    platterRings.forEach(([r, h, py, mat]) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.96, h, 14), mat);
      m.position.y = py;
      m.castShadow = true;
      m.receiveShadow = true;
      tumpeng.add(m);
    });
    // 10 Stepped Voxel Golden Rice Tiers climbing cleanly from 4.3m up to 16.0m!
    for (let tier = 0; tier < 10; tier++) {
      const rw = 5.4 - tier * 0.48;
      const th = 1.2;
      const ty = 4.3 + tier * 1.18 + th * 0.5;
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(rw * 1.75, th, rw * 1.75),
        tier % 2 === 0 ? riceGoldMat : riceDeepMat,
      );
      box.position.y = ty;
      box.rotation.y = (tier % 2) * (Math.PI / 4) * 0.35;
      box.castShadow = true;
      box.receiveShadow = true;
      tumpeng.add(box);
    }
    // Green Banana-Leaf Crown Peak reaching T = 18.0m above plaza!
    const crownBase = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.15, 1.75), riceTipMat);
    crownBase.position.y = 16.6;
    crownBase.castShadow = true;
    const crownTip = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.1, 0.95), riceTipMat);
    crownTip.position.y = 17.55;
    crownTip.castShadow = true;
    tumpeng.add(crownBase, crownTip);
    group.add(tumpeng);
    obstacles.push({ x: -103.0, z: 52.0, halfW: 6.6, halfD: 6.6 });

    // 2b. 4 Lapak & Tenda Pasar (8m x 6m each!) surrounding the Alun-Alun Pasar
    const redMat = palette.getPixelMat('wool_red');
    const yelMat = palette.getPixelMat('wool_yellow');
    const jarMat = palette.getMat(0x0284c7, 'gloss');
    const crateColor = 0xb45309;
    const tentSpecs: Array<[number, number, number]> = [
      [-97.0, 38.0, 0.25],
      [-112.0, 67.0, -0.35],
      [-96.0, 71.0, 0.2],
      [-82.5, 55.0, -1.15],
    ];
    tentSpecs.forEach(([tx, tz, ry]) => {
      const ty = getArchipelagoGroundY(tx, tz);
      const tent = new THREE.Group();
      tent.position.set(tx, ty, tz);
      tent.rotation.y = ry;
      // Timber Deck Plinth (8m x 6m)
      const deck = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.28, 6.0), plankMat);
      deck.position.y = 0.14;
      deck.receiveShadow = true;
      tent.add(deck);
      // 6 Heavy Timber Support Posts
      [-3.7, 0, 3.7].forEach((px) => {
        [-2.7, 2.7].forEach((pz) => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.36, 4.0, 0.36), spruceMat);
          post.position.set(px, 2.0, pz);
          post.castShadow = true;
          tent.add(post);
        });
      });
      // Red & Yellow Striped Voxel Canopy (8m x 6m sloped awning)
      for (let s = 0; s < 8; s++) {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(1.04, 0.44, 6.4),
          s % 2 === 0 ? redMat : yelMat,
        );
        stripe.position.set(-3.64 + s * 1.04, 4.15, 0);
        stripe.castShadow = true;
        tent.add(stripe);
      }
      // Roof Ridge + Red Festival Pennant Flag
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.32, 1.2), spruceMat);
      ridge.position.y = 4.48;
      const flagPole = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.4, 0.18), spruceMat);
      flagPole.position.set(0, 5.1, 0);
      const pennant = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 0.1), redMat);
      pennant.position.set(0.6, 5.5, 0);
      tent.add(ridge, flagPole, pennant);
      // Wooden Market Counters & Spice Baskets/Jars
      const counter = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.15, 1.4), plankMat);
      counter.position.set(0, 0.72, 1.2);
      counter.castShadow = true;
      tent.add(counter);
      [-2.2, 0, 2.2].forEach((jx, ji) => {
        const basket = new THREE.Mesh(
          new THREE.BoxGeometry(0.95, 0.6, 0.95),
          ji === 1 ? jarMat : palette.getMat(ji === 0 ? 0xf59e0b : 0xef4444, 'matte'),
        );
        basket.position.set(jx, 1.55, 1.2);
        tent.add(basket);
      });
      group.add(tent);
      // Side crates beside each stall
      cliffBlocks.push({
        x: tx + Math.cos(ry) * 4.4,
        y: ty + 0.55,
        z: tz - Math.sin(ry) * 4.4,
        sx: 1.1,
        sy: 1.1,
        sz: 1.1,
        color: crateColor,
      });
      obstacles.push({ x: tx, z: tz, halfW: 3.9, halfD: 3.1 });
    });

    // 2c. Gua Dapur Rempah (T: 22m / L: 20m!) carved into the 32m Red Terracotta Cliff at (-128, 48)
    const caveFloorY = 2.0;
    const terraDark = 0x7c2d12;
    const terraMid = 0x9a3412;
    const terraLight = 0xc2410c;
    // Left (z=38) & Right (z=58) Massive Stepped Terracotta Arch Buttresses -> Full 20m outer width!
    [38.0, 58.0].forEach((az) => {
      cliffBlocks.push({ x: -127.0, y: caveFloorY + 7.5, z: az, sx: 6.5, sy: 15.0, sz: 3.6, color: terraMid });
      cliffBlocks.push({ x: -125.5, y: caveFloorY + 6.0, z: az + (az < 48 ? 1.5 : -1.5), sx: 4.0, sy: 12.0, sz: 2.2, color: terraLight });
    });
    // Stepped Arch Crown Tiers climbing up to T = 22.0m (y = 24.0m)!
    cliffBlocks.push({ x: -127.5, y: caveFloorY + 15.8, z: 40.5, sx: 6.0, sy: 3.6, sz: 5.5, color: terraMid });
    cliffBlocks.push({ x: -127.5, y: caveFloorY + 15.8, z: 55.5, sx: 6.0, sy: 3.6, sz: 5.5, color: terraMid });
    cliffBlocks.push({ x: -127.5, y: caveFloorY + 18.8, z: 44.0, sx: 6.2, sy: 3.2, sz: 6.8, color: terraLight });
    cliffBlocks.push({ x: -127.5, y: caveFloorY + 18.8, z: 52.0, sx: 6.2, sy: 3.2, sz: 6.8, color: terraLight });
    cliffBlocks.push({ x: -127.5, y: caveFloorY + 21.0, z: 48.0, sx: 6.5, sy: 2.4, sz: 9.2, color: terraDark });

    // Deep Dark Spice Cavern Interior & Glowing Amber Hearth Floor inside Mouth
    const chDark = new THREE.Mesh(new THREE.BoxGeometry(10.0, 17.5, 14.5), palette.getMat(0x090d16, 'matte'));
    chDark.position.set(-134.5, caveFloorY + 8.75, 48.0);
    const chHearth = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.35, 9.5), magmaCoreMat);
    chHearth.position.set(-131.5, caveFloorY + 0.16, 48.0);
    lavaMeshes.push(chHearth);
    group.add(chDark, chHearth);
    obstacles.push(
      { x: -127.0, z: 37.8, halfW: 3.4, halfD: 2.0 },
      { x: -127.0, z: 58.2, halfW: 3.4, halfD: 2.0 },
      { x: -133.5, z: 48.0, halfW: 2.8, halfD: 7.2 },
    );

    // 4 Giant Curved Voxel Red Chili Peppers flanking Gua Dapur Rempah
    const chiliRed = palette.getMat(0xef4444, 'matte');
    const chiliStem = palette.getMat(0x22c55e, 'matte');
    [
      [-126.0, 34.0, 2.8, 0.35],
      [-124.2, 39.2, 2.2, 0.18],
      [-124.2, 56.8, 2.2, -0.18],
      [-126.0, 62.0, 2.8, -0.35],
    ].forEach(([cx, cz, sc, ry]) => {
      const ch = createChiliSculpture(chiliRed, chiliStem, sc);
      ch.position.set(cx, caveFloorY + 5.8 + sc * 1.45, cz);
      ch.rotation.y = ry;
      group.add(ch);
    });

    // Twin Stone Fire Braziers Flanking the Cave Entrance
    [39.5, 56.5].forEach((bz) => {
      cliffBlocks.push({ x: -123.5, y: caveFloorY + 1.4, z: bz, sx: 1.5, sy: 2.8, sz: 1.5, color: 0x57534e });
      const bFlame = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.2, 0.95), magmaHotMat);
      bFlame.position.set(-123.5, caveFloorY + 3.4, bz);
      bFlame.userData.isFlame = true;
      torchesFlame.push(bFlame);
      group.add(bFlame);
    });

    // 2d. 4 Warm Campfires (Api Unggun) + Wooden East Harbor Jetty Planks & Pilings
    [
      [-119.5, 62.5],
      [-117.5, 37.5],
      [-89.0, 65.5],
      [-88.0, 36.5],
    ].forEach(([fx, fz]) => {
      const fy = getArchipelagoGroundY(fx, fz);
      cliffBlocks.push({ x: fx, y: fy + 0.25, z: fz, sx: 1.8, sy: 0.45, sz: 1.8, color: 0x64748b });
      cliffBlocks.push({ x: fx, y: fy + 0.55, z: fz, sx: 1.15, sy: 0.35, sz: 0.42, color: 0x5c3a1e });
      const flame = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.15, 0.85), magmaHotMat);
      flame.position.set(fx, fy + 1.15, fz);
      flame.userData.isFlame = true;
      torchesFlame.push(flame);
      group.add(flame);
      obstacles.push({ x: fx, z: fz, halfW: 0.95, halfD: 0.95 });
    });

    // Green Voxel Shrubs on top of the 32m Grass-Capped Mesa
    [
      [-150.0, 42.0, 1.8],
      [-146.0, 34.0, 1.4],
      [-154.0, 48.0, 1.5],
      [-145.0, 22.0, 1.6],
      [-152.0, 56.0, 1.4],
    ].forEach(([sx, sz, sw]) => {
      const sy = getArchipelagoGroundY(sx, sz);
      if (sy >= 24.0) {
        walkableTopBlocks.push({ x: sx, y: sy + sw * 0.4, z: sz, sx: sw, sy: sw * 0.8, sz: sw, color: 0x4d7c0f });
      }
    });
  }

  // ============================================================================
  // 3. HUTAN SATWA (ZOO DISTRICT, cx=120, cz=58, Panjang 130m!)
  //    - Gerbang Utama Balok Kayu Raksasa (T: 16m)
  //    - Kandang Jerapah (30x22m), Kandang Zebra (34x24m), Kandang Panda (40x25m)
  //    - Laguna Air Terjun Tebing + Teratai
  //    - Tebing Gunung 45m + Gua Kepala Harimau Voxel Raksasa (T: 24m / L: 22m)!
  // ============================================================================
  {
    const addWalkInEnclosure = (
      cx: number,
      cz: number,
      halfW: number,
      halfD: number,
      gateSide: 'north' | 'south' | 'east' | 'west',
    ) => {
      const y = getArchipelagoGroundY(cx, cz);
      const railColor = 0xb45309;
      const postColor = 0x78350f;
      const gateHalf = 2.0;

      // Corner & perimeter fence posts every ~3.5m
      for (let x = -halfW; x <= halfW + 0.01; x += 3.5) {
        if ((gateSide === 'north' || gateSide === 'south') && Math.abs(x) < gateHalf) continue;
        [-halfD, halfD].forEach((zOff) => {
          if (zOff === -halfD && gateSide === 'north' && Math.abs(x) < gateHalf) return;
          if (zOff === halfD && gateSide === 'south' && Math.abs(x) < gateHalf) return;
          cliffBlocks.push({ x: cx + x, y: y + 0.9, z: cz + zOff, sx: 0.42, sy: 1.8, sz: 0.42, color: postColor });
        });
      }
      for (let z = -halfD; z <= halfD + 0.01; z += 3.5) {
        [-halfW, halfW].forEach((xOff) => {
          if (xOff === -halfW && gateSide === 'west' && Math.abs(z) < gateHalf) return;
          if (xOff === halfW && gateSide === 'east' && Math.abs(z) < gateHalf) return;
          cliffBlocks.push({ x: cx + xOff, y: y + 0.9, z: cz + z, sx: 0.42, sy: 1.8, sz: 0.42, color: postColor });
        });
      }

      // Horizontal fence rails (double height) + walk-in gate gap colliders
      const addHWall = (zPos: number, hasGate: boolean) => {
        if (!hasGate) {
          [0.65, 1.35].forEach((ry) => {
            cliffBlocks.push({ x: cx, y: y + ry, z: zPos, sx: halfW * 2, sy: 0.24, sz: 0.22, color: railColor });
          });
          obstacles.push({ x: cx, z: zPos, halfW, halfD: 0.45 });
        } else {
          const segW = halfW - gateHalf;
          [-1, 1].forEach((side) => {
            const sxPos = cx + side * (gateHalf + segW * 0.5);
            [0.65, 1.35].forEach((ry) => {
              cliffBlocks.push({ x: sxPos, y: y + ry, z: zPos, sx: segW, sy: 0.24, sz: 0.22, color: railColor });
            });
            obstacles.push({ x: sxPos, z: zPos, halfW: segW * 0.5, halfD: 0.45 });
          });
        }
      };
      const addVWall = (xPos: number, hasGate: boolean) => {
        if (!hasGate) {
          [0.65, 1.35].forEach((ry) => {
            cliffBlocks.push({ x: xPos, y: y + ry, z: cz, sx: 0.22, sy: 0.24, sz: halfD * 2, color: railColor });
          });
          obstacles.push({ x: xPos, z: cz, halfW: 0.45, halfD });
        } else {
          const segD = halfD - gateHalf;
          [-1, 1].forEach((side) => {
            const szPos = cz + side * (gateHalf + segD * 0.5);
            [0.65, 1.35].forEach((ry) => {
              cliffBlocks.push({ x: xPos, y: y + ry, z: szPos, sx: 0.22, sy: 0.24, sz: segD, color: railColor });
            });
            obstacles.push({ x: xPos, z: szPos, halfW: 0.45, halfD: segD * 0.5 });
          });
        }
      };
      addHWall(cz - halfD, gateSide === 'north');
      addHWall(cz + halfD, gateSide === 'south');
      addVWall(cx - halfW, gateSide === 'west');
      addVWall(cx + halfW, gateSide === 'east');
    };

    // 3a. Gerbang Utama (Tinggi: 16m!) — Giant Stepped Fallen-Log Jungle Archway at (79, 42)
    const gateBaseY = getArchipelagoGroundY(79.0, 42.0);
    const gate = new THREE.Group();
    gate.position.set(79.0, gateBaseY, 42.0);
    gate.rotation.y = 0.38; // perpendicular to NW->SE arrival trail
    const barkDark = palette.getMat(0x5c3a1e, 'matte');
    const barkMid = palette.getMat(0x78350f, 'matte');
    const woodCut = palette.getMat(0xd4a373, 'matte');
    const leafGateMat = palette.getMat(0x22c55e, 'matte');
    const vineGateMat = palette.getMat(0x15803d, 'matte');
    // Giant Left & Right Tree-Trunk Columns (height 13.0m)
    [-9.5, 9.5].forEach((px) => {
      const baseFoot = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 4.2), barkDark);
      baseFoot.position.set(px, 1.1, 0);
      baseFoot.castShadow = true;
      const col = new THREE.Mesh(new THREE.BoxGeometry(3.2, 11.2, 3.2), barkMid);
      col.position.set(px, 7.6, 0);
      col.castShadow = true;
      gate.add(baseFoot, col);
    });
    // Massive Horizontal Cross-Log Lintel rising up to y=16.0m above ground!
    const mainLog = new THREE.Mesh(new THREE.BoxGeometry(24.5, 3.6, 3.8), barkMid);
    mainLog.position.set(0, 14.2, 0);
    mainLog.castShadow = true;
    const logCapL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.8, 3.0), woodCut);
    logCapL.position.set(-12.3, 14.2, 0);
    const logCapR = logCapL.clone();
    logCapR.position.set(12.3, 14.2, 0);
    const logTopCrown = new THREE.Mesh(new THREE.BoxGeometry(21.5, 1.2, 3.2), barkDark);
    logTopCrown.position.set(0, 16.0, 0);
    // Mossy tufts & hanging vines along the 16m log arch
    [[-6.5, 16.8, 0.4], [0, 17.0, -0.3], [7.2, 16.7, 0.2]].forEach(([lx, ly, lz]) => {
      const tuft = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.4, 2.8), leafGateMat);
      tuft.position.set(lx, ly, lz);
      gate.add(tuft);
    });
    [-7.2, -3.4, 4.1, 7.8].forEach((vx, vi) => {
      const vLen = 3.2 + (vi % 2) * 1.8;
      const vine = new THREE.Mesh(new THREE.BoxGeometry(0.45, vLen, 0.45), vineGateMat);
      vine.position.set(vx, 12.2 - vLen * 0.5, 1.8);
      gate.add(vine);
    });
    gate.add(mainLog, logCapL, logCapR, logTopCrown);
    group.add(gate);
    // Pillared colliders only on the two gate trunks so players walk right underneath!
    obstacles.push(
      { x: 75.5, z: 33.4, halfW: 2.2, halfD: 2.2 },
      { x: 82.5, z: 50.6, halfW: 2.2, halfD: 2.2 },
    );

    // 3b. Kandang Jerapah (30m x 22m) at (91, 66) + Heroic Giant Giraffe
    addWalkInEnclosure(91.0, 66.0, 15.0, 11.0, 'north');
    const giraY = getArchipelagoGroundY(91.0, 66.0);
    const gir = createGiraffeMesh(palette);
    gir.root.scale.setScalar(2.4);
    gir.root.position.set(90.0, giraY, 66.5);
    gir.root.rotation.y = 0.72;
    group.add(gir.root);
    zooCritters.push({ root: gir.root, head: gir.head, phase: 0.4 });

    // 3c. Kandang Zebra (34m x 24m) at (110, 30) + Scaled Striped Zebra
    addWalkInEnclosure(110.0, 30.0, 17.0, 12.0, 'south');
    const zebY = getArchipelagoGroundY(110.0, 30.0);
    const zeb = createZebraMesh(palette);
    zeb.root.scale.setScalar(2.15);
    zeb.root.position.set(110.0, zebY, 30.0);
    zeb.root.rotation.y = -0.85;
    group.add(zeb.root);
    zooCritters.push({ root: zeb.root, head: zeb.head, phase: 2.1 });

    // 3d. Kandang Panda (Exact 40m x 25m!) at (106, 92) + 2 Plump Pandas + Bamboo Grove
    addWalkInEnclosure(106.0, 92.0, 20.0, 12.5, 'north');
    const panY = getArchipelagoGroundY(106.0, 92.0);
    const pan1 = createPandaMesh(palette);
    pan1.root.scale.setScalar(2.25);
    pan1.root.position.set(100.5, panY, 91.5);
    pan1.root.rotation.y = 0.45;
    const pan2 = createPandaMesh(palette);
    pan2.root.scale.setScalar(1.85);
    pan2.root.position.set(112.0, panY, 93.0);
    pan2.root.rotation.y = -0.75;
    group.add(pan1.root, pan2.root);
    zooCritters.push(
      { root: pan1.root, head: pan1.head, phase: 3.5 },
      { root: pan2.root, head: pan2.head, phase: 5.0 },
    );
    // Fresh Bamboo Stalks inside Panda Enclosure
    [
      [91.5, 97.5, 4.8],
      [93.2, 98.8, 5.8],
      [121.0, 86.0, 5.2],
      [122.4, 87.5, 4.4],
    ].forEach(([bx, bz, bh]) => {
      cliffBlocks.push({ x: bx, y: panY + bh * 0.5, z: bz, sx: 0.48, sy: bh, sz: 0.48, color: 0x65a30d });
      cliffBlocks.push({ x: bx, y: panY + bh + 0.5, z: bz, sx: 1.4, sy: 1.0, sz: 1.4, color: 0x22c55e });
    });

    // 3e. Blue Jungle Lagoon (142, 82) + Lily Pads + Plunging Cliff Waterfall!
    const lagoonWater = new THREE.Mesh(new THREE.BoxGeometry(28.0, 0.36, 25.0), waterfallMat);
    lagoonWater.position.set(142.0, 0.2, 82.0);
    group.add(lagoonWater);
    // Lagoon Outlet Channel & Vertical Waterfall pouring off SE cliff edge into the ocean!
    [
      [152.0, 0.2, 95.0, 11.0, 0.38, 12.0],
      [156.5, -0.35, 102.0, 8.5, 1.5, 4.2],
    ].forEach(([wx, wy, wz, sx, sy, sz]) => {
      const wf = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), waterfallMat);
      wf.position.set(wx, wy, wz);
      group.add(wf);
    });
    // Floating Voxel Lily Pads & Foam across Lagoon
    [
      [135.5, 78.0, 1.8],
      [140.5, 86.0, 2.2],
      [146.0, 77.5, 1.6],
      [148.0, 88.5, 2.0],
    ].forEach(([lx, lz, ls]) => {
      walkableTopBlocks.push({ x: lx, y: 0.42, z: lz, sx: ls, sy: 0.14, sz: ls, color: 0x4ade80 });
    });

    // 3f. Colossal Voxel Giant Jungle Trees ("Pohon Rimba", T: 10m-15m, L: 10m-15m)
    const jungleTreeSpots: Array<[number, number, number, number]> = [
      // [x, z, trunkHeight (8..11m), canopyWidth (10..15m)]
      [68.0, 52.0, 8.2, 10.5],
      [74.0, 25.0, 9.0, 11.5],
      [88.0, 18.0, 10.2, 13.0],
      [106.0, 8.0, 9.5, 12.0],
      [126.0, 10.0, 10.8, 14.0],
      [64.0, 74.0, 8.5, 11.0],
      [75.0, 94.0, 9.8, 12.5],
      [96.0, 112.0, 10.0, 13.0],
      [120.0, 112.0, 9.2, 11.8],
      [134.0, 106.0, 10.4, 13.5],
      [164.0, 92.0, 9.6, 12.0],
      [172.0, 72.0, 10.5, 13.5],
      [136.0, 64.0, 8.8, 11.0],
      [122.0, 56.0, 8.2, 10.2],
      [134.0, 25.0, 9.5, 12.0],
      [152.0, 12.0, 10.5, 14.0],
    ];
    jungleTreeSpots.forEach(([tx, tz, th, cw], ti) => {
      const ty = getArchipelagoGroundY(tx, tz);
      if (ty < 1.2) return;
      // Thick voxel trunk (1.8m x 1.8m)
      cliffBlocks.push({ x: tx, y: ty + th * 0.5, z: tz, sx: 1.8, sy: th, sz: 1.8, color: 0x5c3a1e });
      obstacles.push({ x: tx, z: tz, halfW: 1.05, halfD: 1.05 });
      // Multi-tiered blocky foliage crown (total height ~10-15m, width ~10-15m!)
      const leafC1 = ti % 2 === 0 ? 0x22c55e : 0x16a34a;
      const leafC2 = ti % 2 === 0 ? 0x4ade80 : 0x22c55e;
      walkableTopBlocks.push({ x: tx, y: ty + th + 1.2, z: tz, sx: cw, sy: 2.6, sz: cw, color: leafC1 });
      walkableTopBlocks.push({ x: tx, y: ty + th + 3.4, z: tz, sx: cw * 0.7, sy: 2.2, sz: cw * 0.7, color: leafC2 });
      walkableTopBlocks.push({ x: tx, y: ty + th + 5.1, z: tz, sx: cw * 0.4, sy: 1.4, sz: cw * 0.4, color: 0x86efac });
      // Dangling vine curtains from jungle canopy corners
      [-cw * 0.42, cw * 0.42].forEach((vx, vi) => {
        const vLen = 3.2 + ((ti + vi) % 3) * 1.1;
        cliffBlocks.push({
          x: tx + vx,
          y: ty + th - vLen * 0.5,
          z: tz + (vi === 0 ? cw * 0.38 : -cw * 0.38),
          sx: 0.45,
          sy: vLen,
          sz: 0.45,
          color: 0x15803d,
        });
      });
    });

    // 3g. Giant Sculpted Voxel Tiger Head Cave ("Gua Kepala Harimau": T: 24m / L: 22m!)
    // Built into the 45m East Cliff facing WSW toward the main safari trail at (147, 41)!
    const tigerY = getArchipelagoGroundY(145.0, 41.5);
    const tigerCenter = new THREE.Vector3(149.0, tigerY, 41.0);
    const tigerYaw = -Math.PI * 0.56; // faces WSW directly toward approaching Hero on safari road!
    const cosT = Math.cos(tigerYaw);
    const sinT = Math.sin(tigerYaw);
    const pushTigerBox = (
      lx: number,
      ly: number,
      lz: number,
      sx: number,
      sy: number,
      sz: number,
      color: number,
      toTop = false,
    ) => {
      const wx = tigerCenter.x + lx * cosT + lz * sinT;
      const wz = tigerCenter.z - lx * sinT + lz * cosT;
      const arr = toTop ? walkableTopBlocks : cliffBlocks;
      arr.push({ x: wx, y: tigerCenter.y + ly, z: wz, sx, sy, sz, color });
    };

    const OR = 0xf97316;
    const OR_D = 0xea580c;
    const WH = 0xf8fafc;
    const BK = 0x0f172a;
    const RD = 0xdc2626;
    const PK = 0xf472b6;

    // Dark roaring cavern interior inside mouth (22m wide x 24m tall monument!)
    pushTigerBox(0, 6.5, -2.5, 11.5, 11.5, 8.5, 0x090d16);
    // Lower roaring jaw + white chin + pink/red tongue & lower huge fangs
    pushTigerBox(0, 1.4, 2.5, 14.0, 2.8, 7.5, WH);
    pushTigerBox(0, 2.9, 3.0, 7.5, 0.9, 5.5, RD);
    [-4.2, 4.2].forEach((fx) => {
      pushTigerBox(fx, 4.2, 5.2, 1.6, 2.8, 1.6, WH);
    });
    // Massive White Cheek Ruffs + Orange Jaw Pillars flanking the walkable mouth (height y=0..15)
    [-8.6, 8.6].forEach((side) => {
      pushTigerBox(side, 6.2, 1.4, 4.8, 10.5, 6.5, WH);
      pushTigerBox(side * 0.92, 11.5, 0.8, 5.2, 8.5, 7.2, OR);
      pushTigerBox(side * 1.08, 12.0, 1.2, 2.2, 2.2, 4.2, BK); // side cheek stripes
    });
    // Upper Snout, Bridge of Nose, Pink Voxel Nose & Upper Giant Fangs (y=12..17)
    pushTigerBox(0, 13.5, 3.8, 12.5, 3.8, 5.2, OR);
    pushTigerBox(0, 12.5, 6.2, 3.8, 2.2, 2.4, PK); // pink voxel tiger nose
    [-4.4, 4.4].forEach((fx) => {
      pushTigerBox(fx, 10.4, 5.2, 1.7, 3.4, 1.7, WH); // upper giant canine fangs!
    });
    // Massive Forehead Brow & Tiger Stripes + Rounded Ears up to y=24m!
    pushTigerBox(0, 17.8, 2.0, 21.0, 5.4, 9.0, OR, true);
    pushTigerBox(0, 20.6, 1.2, 17.0, 2.6, 8.2, OR_D, true);
    // Iconic Black Stripes across forehead & nose bridge
    pushTigerBox(0, 18.8, 6.2, 2.2, 3.6, 1.4, BK);
    [-4.5, 4.5].forEach((sx) => {
      pushTigerBox(sx, 19.2, 5.8, 3.2, 1.4, 1.4, BK);
      pushTigerBox(sx * 1.35, 16.8, 5.6, 2.2, 2.6, 1.4, BK);
    });
    // Rounded Voxel Tiger Ears crowning at y=22.5..24.2m!
    [-7.8, 7.8].forEach((ex) => {
      pushTigerBox(ex, 22.8, 1.2, 4.4, 3.6, 3.0, OR, true);
      pushTigerBox(ex, 22.6, 2.6, 2.2, 2.0, 0.8, BK);
    });
    // Glowing Golden-Amber Tiger Eyes (dedicated emissive meshes for life!)
    [-4.8, 4.8].forEach((ex) => {
      const eyeMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 0.9), magmaHotMat);
      const wx = tigerCenter.x + ex * cosT + 6.4 * sinT;
      const wz = tigerCenter.z - ex * sinT + 6.4 * cosT;
      eyeMesh.position.set(wx, tigerCenter.y + 16.0, wz);
      eyeMesh.rotation.y = tigerYaw;
      group.add(eyeMesh);
    });
    // Draping jungle vines hanging down the 45m cliff directly above the Tiger Head!
    [
      [146.5, 31.0, 32.5, 11.0],
      [148.0, 33.0, 41.0, 10.5],
      [147.0, 32.0, 49.5, 12.0],
      [152.5, 38.0, 36.0, 14.0],
      [153.0, 37.5, 46.5, 13.0],
    ].forEach(([vx, vy, vz, vh]) => {
      cliffBlocks.push({ x: vx, y: vy - vh * 0.5, z: vz, sx: 0.75, sy: vh, sz: 0.75, color: 0x15803d });
    });
    // Solid cliff colliders flanking the open tiger jaws (leaving central mouth walk-in clear!)
    obstacles.push(
      { x: 151.0, z: 32.5, halfW: 3.5, halfD: 3.5 },
      { x: 151.0, z: 49.5, halfW: 3.5, halfD: 3.5 },
      { x: 156.5, z: 41.0, halfW: 3.2, halfD: 5.5 },
    );
  }

  // ============================================================================
  // 4. GERBANG KOTA ISLAND (-66, z=-42)
  //    Lower Cliff Highway (y=4.0) + Grand Stone Stairs -> Upper School Fortress (y=7.8)
  // ============================================================================
  {
    const schoolY = getArchipelagoGroundY(-70.0, -50.0);
    const school = new THREE.Group();
    school.position.set(-70.0, schoolY, -50.0);
    const brickMat = palette.getMat(0xb91c1c, 'matte');
    const roofMat = palette.getMat(0x78350f, 'matte');
    const winMat = palette.getPixelMat('glass_pane', 0xe0f2fe);
    const body = new THREE.Mesh(new THREE.BoxGeometry(10.5, 5.8, 6.6), brickMat);
    body.position.y = 2.9;
    body.castShadow = true;
    const roofL = new THREE.Mesh(new THREE.BoxGeometry(11.4, 1.4, 4.1), roofMat);
    roofL.position.set(0, 6.25, -1.4);
    roofL.rotation.x = -0.34;
    const roofR = new THREE.Mesh(new THREE.BoxGeometry(11.4, 1.4, 4.1), roofMat);
    roofR.position.set(0, 6.25, 1.4);
    roofR.rotation.x = 0.34;
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.6, 0.28), spruceMat);
    door.position.set(0, 1.3, 3.34);
    school.add(body, roofL, roofR, door);
    [-3.4, -1.6, 1.6, 3.4].forEach((wx) => {
      [1.9, 4.1].forEach((wy) => {
        if (wy < 2.2 && Math.abs(wx) < 1.8) return;
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.15, 0.2), winMat);
        win.position.set(wx, wy, 3.34);
        school.add(win);
      });
    });
    group.add(school);
    obstacles.push({ x: -70.0, z: -50.0, halfW: 5.5, halfD: 3.5 });

    // Crenellated Castle Walls & Corner Watchtowers atop y=7.8 fortress plateau
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(24, 4.6, 1.7), cobbleMat);
    northWall.position.set(-66.0, schoolY + 2.3, -56.2);
    northWall.castShadow = true;
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(1.7, 4.6, 15.0), cobbleMat);
    eastWall.position.set(-53.5, schoolY + 2.3, -49.0);
    const towerNE = new THREE.Mesh(new THREE.BoxGeometry(3.2, 6.8, 3.2), cobbleMat);
    towerNE.position.set(-53.5, schoolY + 3.4, -56.2);
    const towerNW = towerNE.clone();
    towerNW.position.set(-78.5, schoolY + 3.4, -56.2);
    group.add(northWall, eastWall, towerNE, towerNW);
    for (let mx = -77; mx <= -55; mx += 2.4) {
      cliffBlocks.push({
        x: mx,
        y: schoolY + 5.05,
        z: -56.2,
        sx: 1.1,
        sy: 0.9,
        sz: 1.4,
        color: 0x94a3b8,
      });
    }
    obstacles.push(
      { x: -66.0, z: -56.2, halfW: 12.2, halfD: 1.1 },
      { x: -53.5, z: -49.0, halfW: 1.1, halfD: 7.7 },
    );

    const hwyY = getArchipelagoGroundY(-66, -32);
    const cityRoad = new THREE.Mesh(new THREE.BoxGeometry(34, 0.14, 6.4), roadMat);
    cityRoad.position.set(-64, hwyY + 0.05, -32);
    cityRoad.receiveShadow = true;
    walkableTargets.push(cityRoad);
    const tunnelFrame = new THREE.Group();
    tunnelFrame.position.set(-80.5, hwyY, -32);
    const tunL = new THREE.Mesh(new THREE.BoxGeometry(2.6, 4.8, 1.6), cobbleMat);
    tunL.position.set(0, 2.4, -3.6);
    const tunR = tunL.clone();
    tunR.position.set(0, 2.4, 3.6);
    const tunTop = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.7, 9.2), cobbleMat);
    tunTop.position.set(0, 5.4, 0);
    tunTop.castShadow = true;
    const tlPole = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.8, 0.28), palette.getMat(0x1e293b, 'metal'));
    tlPole.position.set(2.4, 1.9, 3.6);
    const tlGreen = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), palette.getMat(0x22c55e, 'emissive'));
    tlGreen.position.set(2.4, 3.4, 3.6);
    tunnelFrame.add(tunL, tunR, tunTop, tlPole, tlGreen);
    group.add(cityRoad, tunnelFrame);
    obstacles.push(
      { x: -80.5, z: -35.6, halfW: 1.5, halfD: 1.0 },
      { x: -80.5, z: -28.4, halfW: 1.5, halfD: 1.0 },
    );

    [
      { z: -30.5, color: 0xef4444, baseX: -72, range: 16, speed: 0.72, phase: 0, police: false },
      { z: -33.5, color: 0xfacc15, baseX: -84, range: 18, speed: 0.6, phase: 2.2, police: false },
      { z: -30.5, color: 0x2563eb, baseX: -58, range: 11, speed: 0.85, phase: 4.1, police: true },
    ].forEach((cfg) => {
      const car = createVoxelCar(palette, cfg.color, cfg.police);
      car.position.set(cfg.baseX, hwyY + 0.1, cfg.z);
      group.add(car);
      cars.push({ mesh: car, baseX: cfg.baseX, rangeX: cfg.range, speed: cfg.speed, phase: cfg.phase });
    });
  }

  // ============================================================================
  // 5. MENARA WAKTU ISLAND (+66, z=-42) — Spiraling Clock Peak + Gold Gears
  // ============================================================================
  {
    const towerY = getArchipelagoGroundY(70.5, -50.0);
    const clockTower = new THREE.Group();
    clockTower.position.set(70.5, towerY, -50.0);
    const ctBase = new THREE.Mesh(new THREE.BoxGeometry(6.4, 8.8, 6.4), palette.getMat(0xd97706, 'matte'));
    ctBase.position.y = 4.4;
    ctBase.castShadow = true;
    const ctBelfry = new THREE.Mesh(new THREE.BoxGeometry(7.2, 4.8, 7.2), palette.getMat(0xf59e0b, 'matte'));
    ctBelfry.position.y = 11.1;
    ctBelfry.castShadow = true;
    const ctSpire = new THREE.Mesh(new THREE.ConeGeometry(4.8, 6.0, 4), palette.getMat(0x78350f, 'matte'));
    ctSpire.position.y = 16.5;
    ctSpire.rotation.y = Math.PI / 4;
    ctSpire.castShadow = true;
    clockTower.add(ctBase, ctBelfry, ctSpire);

    [
      [0, 11.1, 3.65, 0],
      [-3.65, 11.1, 0, -Math.PI / 2],
      [3.65, 11.1, 0, Math.PI / 2],
      [0, 11.1, -3.65, Math.PI],
    ].forEach(([dx, dy, dz, ry]) => {
      const face = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 3.6, 0.26),
        palette.createSurfaceMat({ color: 0xfef3c7, emissive: 0xfde047, emissiveIntensity: 0.35 }),
      );
      face.position.set(dx, dy, dz);
      face.rotation.y = ry;
      const handGroup = new THREE.Group();
      handGroup.position.set(dx, dy, dz);
      handGroup.rotation.y = ry;
      const bigHand = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.4, 0.36), palette.getMat(0x1e293b, 'matte'));
      bigHand.position.set(0, 0.5, 0.08);
      handGroup.add(bigHand);
      clockTower.add(face, handGroup);
      clockHands.push(handGroup);
    });
    group.add(clockTower);
    obstacles.push({ x: 70.5, z: -50.0, halfW: 3.6, halfD: 3.6 });

    const goldGearMat = palette.getMat(0xfacc15, 'metal');
    const darkGearMat = palette.getMat(0x92400e, 'metal');
    [
      { x: 63.0, y: 12.8, z: -45.5, ry: 0.45, r: 3.2, teeth: 10, spd: 0.65 },
      { x: 68.5, y: 11.4, z: -43.5, ry: 0.15, r: 2.5, teeth: 8, spd: -0.82 },
      { x: 75.5, y: 13.0, z: -44.2, ry: -0.35, r: 2.8, teeth: 9, spd: 0.72 },
      { x: 60.5, y: 9.2, z: -48.5, ry: 0.9, r: 2.2, teeth: 8, spd: -0.95 },
      { x: 77.5, y: 9.6, z: -46.8, ry: -0.5, r: 2.3, teeth: 8, spd: -0.9 },
      { x: 66.8, y: 8.2, z: -41.5, ry: 0.1, r: 1.9, teeth: 8, spd: 1.0 },
    ].forEach((g) => {
      const mesh = createToothedGear(g.r, 0.62, g.teeth, goldGearMat, darkGearMat);
      mesh.position.set(g.x, g.y, g.z);
      mesh.rotation.y = g.ry;
      group.add(mesh);
      gears.push({ mesh, speed: g.spd });
    });

    const archY = getArchipelagoGroundY(72.5, -34.5);
    const timeArchL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.8, 1.5), cobbleMat);
    timeArchL.position.set(70.4, archY + 1.9, -34.5);
    const timeArchR = timeArchL.clone();
    timeArchR.position.set(74.6, archY + 1.9, -34.5);
    const timeArchTop = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.5, 1.8), cobbleMat);
    timeArchTop.position.set(72.5, archY + 4.4, -34.5);
    const timeCaveDark = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.5, 2.4), palette.getMat(0x090d16, 'matte'));
    timeCaveDark.position.set(72.5, archY + 1.75, -36.0);
    group.add(timeArchL, timeArchR, timeArchTop, timeCaveDark);
    obstacles.push({ x: 72.5, z: -36.2, halfW: 2.8, halfD: 2.0 });
  }

  // ============================================================================
  // 6. GUA PORTAL ISLAND (0, z=-82) — Jagged Amethyst Crystal Mountains + Minecart
  // ============================================================================
  const minecart = new THREE.Group();
  {
    const gy = getArchipelagoGroundY(-2.2, -83.0);
    const crystalCavernDark = new THREE.Mesh(new THREE.BoxGeometry(6.4, 5.2, 4.0), palette.getMat(0x090d16, 'matte'));
    crystalCavernDark.position.set(-2.2, gy + 2.6, -89.5);
    const crystalCavernGlow = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.4, 3.6), crystalMat);
    crystalCavernGlow.position.set(-2.2, gy + 0.2, -89.2);
    group.add(crystalCavernDark, crystalCavernGlow);

    [
      [-10.5, 15.2, -94.0, 2.8, 0.22],
      [10.2, 15.8, -94.5, 3.0, -0.24],
      [-1.5, 19.6, -98.0, 3.4, 0.08],
      [-6.5, 7.6, -88.0, 1.6, 0.35],
      [3.5, 7.2, -88.5, 1.5, -0.32],
      [-14.5, 11.2, -92.5, 2.1, 0.28],
      [14.0, 11.6, -92.0, 2.2, -0.26],
    ].forEach(([cx, cy, cz, sc, tilt]) => {
      const shard = new THREE.Mesh(new THREE.OctahedronGeometry(1.1 * sc, 0), crystalMat);
      shard.position.set(cx, cy, cz);
      shard.scale.set(0.7, 1.9, 0.7);
      shard.rotation.z = tilt;
      group.add(shard);
      crystalMeshes.push(shard);
    });

    for (let r = 0; r < 9; r++) {
      const t = r / 8;
      const rx = -2.2 + Math.sin(t * 2.1) * 4.5;
      const rz = -89.0 + t * 12.2;
      const ry = gy + 0.28 + (1 - t) * 1.2;
      const tie = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.18, 0.48), spruceMat);
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
    minecart.position.set(-1.5, gy + 0.72, -82.5);
    group.add(minecart);
    obstacles.push(
      { x: -1.5, z: -96.8, halfW: 4.8, halfD: 2.5 },
      { x: -1.8, z: -84.0, halfW: 1.7, halfD: 4.8 },
    );
  }

  // ============================================================================
  // 7. FLOATING ISTANA IELTS SKY ISLAND (+112, y=28, z=-98)
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
    new THREE.CylinderGeometry(12.4, 5.5, 4.6, 14),
    palette.getMat(0x4d7c0f, 'matte'),
  );
  skyIslandBase.position.y = -2.5;
  const skyIslandTop = new THREE.Mesh(
    new THREE.CylinderGeometry(13.0, 12.4, 0.8, 16),
    palette.getMat(0x84cc16, 'matte'),
  );
  skyIslandTop.position.y = 0.0;
  istanaGroup.add(skyIslandBase, skyIslandTop);

  const pBase = new THREE.Mesh(new THREE.BoxGeometry(12.4, 4.2, 9.0), marbleMat);
  pBase.position.y = 2.5;
  const pWingL = new THREE.Mesh(new THREE.BoxGeometry(3.6, 5.8, 4.6), marbleMat);
  pWingL.position.set(-5.6, 3.3, 0);
  const pWingR = pWingL.clone();
  pWingR.position.set(5.6, 3.3, 0);
  const pDome = new THREE.Mesh(new THREE.SphereGeometry(3.4, 14, 10), goldTrimMat);
  pDome.position.set(0, 6.0, 0);
  const pDomeL = new THREE.Mesh(new THREE.SphereGeometry(1.7, 10, 8), goldTrimMat);
  pDomeL.position.set(-5.6, 6.8, 0);
  const pDomeR = pDomeL.clone();
  pDomeR.position.set(5.6, 6.8, 0);
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
  const istanaDome = new THREE.Mesh(new THREE.SphereGeometry(15.5, 24, 18), istanaDomeMat);
  istanaDome.position.y = 3.6;
  istanaGroup.add(istanaDome);
  disposables.push(istanaDomeMat);

  const skyBridgeGeo = new THREE.BoxGeometry(4.0, 0.35, 36);
  const skyBridgeMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.46,
    depthWrite: false,
  });
  const skyBridge = new THREE.Mesh(skyBridgeGeo, skyBridgeMat);
  skyBridge.position.set(90, 18.5, -72);
  skyBridge.rotation.order = 'YXZ';
  skyBridge.rotation.y = -0.68;
  skyBridge.rotation.x = 0.42;
  group.add(istanaGroup, skyBridge);
  disposables.push(skyBridgeGeo, skyBridgeMat);

  // Outer perimeter diorama sky-clouds well outside playable islands & below horizon
  const outerCloudSpots: Array<[number, number, number]> = [
    [-146, 3.0, 148],
    [-132, 3.8, 174],
    [136, 3.2, 152],
    [154, 4.0, 172],
    [-132, 3.5, -94],
    [158, 4.0, -16],
  ];
  outerCloudSpots.forEach(([ox, oy, oz]) => {
    cliffBlocks.push(
      { x: ox, y: oy, z: oz, sx: 11.0, sy: 2.4, sz: 7.5, color: 0xf8fafc },
      { x: ox + 3.6, y: oy + 1.3, z: oz - 1.8, sx: 6.5, sy: 2.0, sz: 5.0, color: 0xf1f5f9 },
    );
  });

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
  rig.minecart.position.x = -2.2 + Math.sin(cartT * 2.1) * 3.4;
  rig.minecart.position.z = -88.0 + cartT * 10.5;
  rig.minecart.position.y = 2.6 + 0.72 + (1 - cartT) * 1.0;

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
