import * as THREE from 'three';
import { ZoneId } from '../types/game';
import { MaterialPalette } from './materials';
import { VillageObstacle } from './minecraftVillage';
import {
  buildIstanaFloatingIsland,
  IstanaFloatingRig,
  updateIstanaFloatingIsland,
} from './istanaFloatingIsland';

export const IELTS_TEMPORARILY_LOCKED = true;

export const OVERWORLD_ANCHORS = {
  hub: { x: -8.0, y: 6.0, z: -5.0 },
  desaSpawn: { x: -6.0, y: 2.6, z: 126.0, yaw: Math.PI * 0.85 },
  starterWeapon: { x: -12.5, y: 2.6, z: 123.0 },
  swimSuit: { x: -4.5, y: 2.6, z: 140.0 },
  portal: { x: 2.0, y: 14.0, z: -185.0 },
  istanaFloating: { x: 254, y: 38, z: -188 },
  zones: {
    desa_sapaan: { x: -2.0, y: 2.6, z: 112.0 },
    pasar_rasa: { x: -102.0, y: 2.0, z: 52.0 },
    hutan_satwa: { x: 102, y: 3.4, z: 52 },
    gerbang_kota: { x: -119.0, y: 12.0, z: -86.0 },
    menara_waktu: { x: 118.0, y: 10.0, z: -72.0 },
    gua_portal: { x: 9.0, y: 14.0, z: -171.0 },
  } as Record<ZoneId, { x: number; y: number; z: number }>,
  npcs: {
    npc_tetua: { x: 20.0, z: 118.0, rotY: -1.57 },
    npc_koki: { x: -89.5, z: 45.0, rotY: 0.75 },
    npc_rubah: { x: 87.5, z: 42.5, rotY: -1.1 },
    npc_penjaga: { x: -110.5, z: -92.5, rotY: 0.45 },
    npc_penyihir: { x: 113.5, z: -73.5, rotY: 0.72 },
    npc_portal: { x: 5.0, z: -177.0, rotY: 0.52 },
  } as Record<string, { x: number; z: number; rotY: number }>,
  guardPosts: {
    npc_tetua: { x: 11.5, z: 109.0, rotY: -0.9, bedTint: 0xf59e0b },
    npc_koki: { x: -85.5, z: 41.0, rotY: -0.8, bedTint: 0xef4444 },
    npc_rubah: { x: 83.5, z: 36.5, rotY: 0.75, bedTint: 0x10b981 },
    npc_penjaga: { x: -102.0, z: -95.5, rotY: -0.95, bedTint: 0x3b82f6 },
    npc_penyihir: { x: 117.5, z: -80.5, rotY: 0.35, bedTint: 0x8b5cf6 },
    npc_portal: { x: -1.0, z: -172.0, rotY: 0.78, bedTint: 0xa855f7 },
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

export const WORLD_OCEAN_LIMIT = 275;
export const SEABED_Y = -1.1;

export const ISLAND_DISKS: IslandDisk[] = [
  // 125m (radius 62.5m) Full-Scale Citadel Reruntuhan ("Central Hub") matching level design overview!
  { id: 'hub', cx: 0, cz: -17, radius: 62.5, groundY: 6.0 },
  // 120m (radius 60m) Full-Scale Starter Village ("Desa Sapaan") matching level design overview!
  { id: 'desa_sapaan', cx: 0, cz: 118, radius: 60.0, groundY: 2.6 },
  // 110m (radius 55m) Full-Scale Festival Market ("Pasar Rasa") matching level design overview!
  { id: 'pasar_rasa', cx: -122, cz: 50, radius: 55.0, groundY: 2.0 },
  // 130m (radius 65m) Full-Scale Zoo District ("Hutan Satwa") matching level design overview!
  { id: 'hutan_satwa', cx: 120, cz: 58, radius: 65.0, groundY: 3.4 },
  // 140m (radius 70m) Full-Scale Fortress City ("Gerbang Kota") matching level design overview!
  { id: 'gerbang_kota', cx: -118, cz: -98, radius: 70.0, groundY: 12.0 },
  // 130m (radius 65m) Full-Scale Clock Tower Hill ("Menara Waktu") matching level design overview!
  { id: 'menara_waktu', cx: 148, cz: -92, radius: 65.0, groundY: 10.0 },
  // 135m (radius 67.5m) Full-Scale Crystal Canyon ("Gua Portal") matching level design overview!
  { id: 'gua_portal', cx: 20, cz: -174, radius: 67.5, groundY: 14.0 },
];

export const SEA_ISLETS: SeaIslet[] = [
  { id: 'islet_sw', cx: -74, cz: 126, radius: 7.4, peakY: 4.2, theme: 'sand_green' },
  { id: 'islet_se', cx: 62, cz: 168, radius: 7.4, peakY: 4.5, theme: 'jungle' },
  { id: 'islet_w', cx: -172, cz: -16, radius: 8.0, peakY: 5.0, theme: 'rock_sand' },
  { id: 'islet_e', cx: 196, cz: 10, radius: 8.2, peakY: 5.2, theme: 'jungle' },
  { id: 'islet_nw', cx: -62, cz: -162, radius: 5.8, peakY: 4.6, theme: 'basalt' },
  { id: 'islet_ne', cx: 42, cz: -88, radius: 6.4, peakY: 4.8, theme: 'autumn' },
  // Scenic tiny sandy/green sea islets in NW strait off Desa Sapaan (matching level design!)
  { id: 'islet_desa_nw1', cx: -32, cz: 50, radius: 4.4, peakY: 3.1, theme: 'sand_green' },
  { id: 'islet_desa_nw2', cx: -48, cz: 70, radius: 4.6, peakY: 2.9, theme: 'sand_green' },
  { id: 'islet_desa_nw3', cx: -64, cz: 82, radius: 5.4, peakY: 3.5, theme: 'sand_green' },
  // Scenic tiny sandy/jungle sea islets in East strait between Citadel, Hutan Satwa & Menara Waktu
  { id: 'islet_satwa_nw1', cx: 76, cz: -16, radius: 4.4, peakY: 3.1, theme: 'sand_green' },
  { id: 'islet_satwa_nw2', cx: 88, cz: -8, radius: 4.6, peakY: 2.9, theme: 'jungle' },
  { id: 'islet_satwa_nw3', cx: 96, cz: -24, radius: 5.0, peakY: 3.4, theme: 'sand_green' },
  // Scenic tiny sandy/green sea islets off Gerbang Kota NW (matching level design overview!)
  { id: 'islet_gerbang_nw1', cx: -206, cz: -148, radius: 6.4, peakY: 4.0, theme: 'sand_green' },
  { id: 'islet_gerbang_nw2', cx: -196, cz: -168, radius: 4.8, peakY: 3.0, theme: 'sand_green' },
  { id: 'islet_gerbang_nw3', cx: -182, cz: -180, radius: 4.2, peakY: 2.8, theme: 'sand_green' },
  // Scenic stone/foam sea islets off Gua Portal NW (matching level design overview!)
  { id: 'islet_portal_nw1', cx: -56, cz: -224, radius: 5.4, peakY: 3.2, theme: 'basalt' },
  { id: 'islet_portal_nw2', cx: -42, cz: -238, radius: 4.2, peakY: 2.6, theme: 'rock_sand' },
];

export const BRIDGE_SPANS: BridgeSpan[] = [
  {
    // Exact 4m-wide (halfWidth 2.0) Suspension Bridge ("Jembatan Gantung: Lebar 4m") connecting Citadel SW to Desa Sapaan!
    id: 'bridge_desa',
    ax: -26.0,
    az: 33.0,
    ay: 5.0,
    bx: -18.0,
    bz: 62.5,
    by: 2.6,
    halfWidth: 2.0,
    archHeight: 1.1,
    style: 'rope',
  },
  {
    // Exact 5m-wide (halfWidth 2.5) Wooden Bridge ("Jembatan Kayu: Lebar 5m") connecting Citadel WSW to Pasar Rasa Plaza
    id: 'bridge_pasar',
    ax: -58.0,
    az: 4.0,
    ay: 5.0,
    bx: -72.0,
    bz: 31.0,
    by: 2.0,
    halfWidth: 2.5,
    archHeight: 1.0,
    style: 'wood',
    gaps: [{ t0: 0.45, t1: 0.545 }],
  },
  {
    // Exact 4m-wide (halfWidth 2.0) Suspension Bridge ("Jembatan Gantung: Lebar 4m") connecting Citadel SE to Hutan Satwa!
    id: 'bridge_satwa',
    ax: 46.0,
    az: 16.0,
    ay: 5.0,
    bx: 65.0,
    bz: 36.5,
    by: 3.4,
    halfWidth: 2.0,
    archHeight: 1.15,
    style: 'rope',
  },
  {
    // Exact 8m-wide (halfWidth 4.0) Tall Arched Stone Viaduct ("Jembatan Viaduk: Lebar 8m") extending SE from Gerbang Kota!
    id: 'viaduct_gerbang',
    ax: -114.0,
    az: -80.0,
    ay: 12.0,
    bx: -92.0,
    bz: -34.0,
    by: 12.0,
    halfWidth: 4.0,
    archHeight: 0.0,
    style: 'stone',
  },
  {
    id: 'bridge_gerbang',
    ax: -57.0,
    az: -31.0,
    ay: 6.5,
    bx: -92.0,
    bz: -34.0,
    by: 12.0,
    halfWidth: 3.0,
    archHeight: 0.85,
    style: 'stone',
    gaps: [{ t0: 0.44, t1: 0.52 }],
  },
  {
    // Exact 5m-wide (halfWidth 2.5) Wooden Gear Bridge ("Jembatan Roda Gigi: Lebar 5m") connecting Citadel ENE to Menara Waktu!
    id: 'bridge_menara',
    ax: 50.0,
    az: -49.0,
    ay: 6.5,
    bx: 94.0,
    bz: -66.0,
    by: 10.0,
    halfWidth: 2.5,
    archHeight: 0.85,
    style: 'wood',
    gaps: [{ t0: 0.45, t1: 0.54 }],
  },
  {
    // Exact 3m Rail Stone Bridge connecting Citadel North-NW Pass directly to Gua Portal South Quarry!
    id: 'bridge_portal',
    ax: -18.0,
    az: -73.0,
    ay: 5.0,
    bx: -12.0,
    bz: -118.0,
    by: 4.0,
    halfWidth: 3.2,
    archHeight: 0.9,
    style: 'stone',
    gaps: [{ t0: 0.46, t1: 0.525 }],
  },
  {
    // Exact 14m-wide (halfWidth 7.0) Highway Bridge exiting West out of the 14m x 12m Underground Tunnel!
    id: 'highway_gerbang',
    ax: -171.0,
    az: -86.0,
    ay: 12.0,
    bx: -226.0,
    bz: -86.0,
    by: 12.0,
    halfWidth: 7.0,
    archHeight: 0.0,
    style: 'highway',
  },
];

// Floating chain ruins, crumbling viaduct jutting over water, sea stepping stones & harbor climb docks
export const PARKOUR_PLATFORMS: ParkourPad[] = [
  // Citadel West Floating Chain Obby Platforms: exact 4m x 4m (halfW=2.0, halfD=2.0) hovering over cliff cove & ocean!
  { id: 'hub_chain_1', x: -45.5, y: 12.8, z: -20.0, halfW: 2.0, halfD: 2.0, style: 'ruin_float', chained: true },
  { id: 'hub_chain_2', x: -51.8, y: 13.7, z: -21.2, halfW: 2.0, halfD: 2.0, style: 'wood', chained: true },
  { id: 'hub_chain_3', x: -58.2, y: 14.6, z: -19.8, halfW: 2.0, halfD: 2.0, style: 'ruin_float', chained: true },
  { id: 'hub_chain_4', x: -64.6, y: 15.5, z: -21.0, halfW: 2.0, halfD: 2.0, style: 'wood', chained: true },

  // Gerbang Kota crumbling SE broken viaduct ruins jutting over sea near Viaduct head
  { id: 'viaduct_1', x: -86.0, y: 8.5, z: -31.0, halfW: 1.9, halfD: 1.7, style: 'stone' },
  { id: 'viaduct_2', x: -81.0, y: 6.2, z: -28.0, halfW: 1.8, halfD: 1.6, style: 'stone' },
  { id: 'viaduct_3', x: -75.5, y: 4.0, z: -25.0, halfW: 1.7, halfD: 1.55, style: 'stone' },

  // Outer West Sea Stepping Stones (Pasar Rasa North Shore <-> Gerbang Kota South Dock)
  { id: 'west_hop_1', x: -124.0, y: 0.9, z: -9.5, halfW: 1.8, halfD: 1.8, style: 'stone' },
  { id: 'west_hop_2', x: -125.0, y: 1.3, z: -14.0, halfW: 1.8, halfD: 1.8, style: 'stone' },
  { id: 'west_hop_3', x: -125.5, y: 1.6, z: -18.5, halfW: 1.8, halfD: 1.8, style: 'stone' },
  { id: 'west_hop_4', x: -126.0, y: 1.8, z: -23.0, halfW: 1.8, halfD: 1.8, style: 'stone' },

  // Outer East Sea Stepping Stones (Hutan Satwa North coast <-> Menara Waktu South Dock)
  { id: 'east_hop_1', x: 144.5, y: 0.9, z: -4.5, halfW: 1.8, halfD: 1.8, style: 'wood' },
  { id: 'east_hop_2', x: 145.5, y: 1.2, z: -9.5, halfW: 1.8, halfD: 1.8, style: 'wood' },
  { id: 'east_hop_3', x: 146.5, y: 1.4, z: -14.5, halfW: 1.8, halfD: 1.8, style: 'wood' },
  { id: 'east_hop_4', x: 147.5, y: 1.1, z: -19.5, halfW: 1.8, halfD: 1.8, style: 'wood' },

  // Low Swim Harbor Docks & Sea-Piers dipping down to y=0.28..0.38 for effortless swimming entry/exit!
  { id: 'dock_desa_south', x: 0, y: 0.28, z: 178.5, halfW: 3.2, halfD: 2.6, style: 'dock' },
  { id: 'dock_desa_west', x: -60.5, y: 0.28, z: 118.0, halfW: 2.6, halfD: 3.0, style: 'dock' },
  { id: 'dock_desa_east', x: 35.0, y: 0.28, z: 167.5, halfW: 2.8, halfD: 2.8, style: 'dock' },
  { id: 'dock_pasar_south', x: -100.0, y: 0.28, z: 102.5, halfW: 3.0, halfD: 2.8, style: 'dock' },
  { id: 'dock_pasar_east', x: -66.5, y: 0.28, z: 47.0, halfW: 3.0, halfD: 2.6, style: 'dock' },
  { id: 'dock_satwa_south', x: 120.0, y: 0.3, z: 123.5, halfW: 3.2, halfD: 2.8, style: 'dock' },
  { id: 'dock_satwa_west', x: 54.5, y: 0.3, z: 62.0, halfW: 2.8, halfD: 3.2, style: 'dock' },
  { id: 'dock_satwa_east', x: 148.0, y: 0.3, z: 117.0, halfW: 3.0, halfD: 2.8, style: 'dock' },
  { id: 'dock_hub_west', x: -63.0, y: 0.32, z: -17.0, halfW: 2.6, halfD: 2.8, style: 'dock' },
  { id: 'dock_hub_east', x: 63.0, y: 0.32, z: -17.0, halfW: 2.6, halfD: 2.8, style: 'dock' },
  { id: 'dock_gerbang_south', x: -126.5, y: 0.32, z: -27.5, halfW: 3.0, halfD: 2.6, style: 'dock' },
  { id: 'dock_menara_south', x: 148.0, y: 0.32, z: -26.5, halfW: 3.0, halfD: 2.8, style: 'dock' },
  { id: 'dock_portal_west', x: -48.0, y: 0.3, z: -174.0, halfW: 2.8, halfD: 3.0, style: 'dock' },
  { id: 'dock_portal_east', x: 88.0, y: 0.3, z: -174.0, halfW: 2.8, halfD: 3.0, style: 'dock' },
  { id: 'dock_portal_south', x: 14.0, y: 0.3, z: -106.0, halfW: 3.0, halfD: 2.8, style: 'dock' },
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
  if (isl.id === 'hub') {
    const wobble = Math.sin(ang * 4) * 0.65 + Math.cos(ang * 3 + 0.5) * 0.45;
    return isl.radius - 0.55 + wobble * 0.6;
  }
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
    // Citadel Reruntuhan (Central Hub: cx=0, cz=-17, radius=62.5m -> Total Panjang 125m!)
    // Local coords hx = wx, hz = wz + 17
    const hx = dx;
    const hz = dz;

    const segDist = (ax: number, az: number, bx: number, bz: number): { d: number; t: number } => {
      const vx = bx - ax;
      const vz = bz - az;
      const lSq = vx * vx + vz * vz || 1;
      const t = Math.max(0, Math.min(1, ((hx - ax) * vx + (hz - az) * vz) / lSq));
      return { d: Math.hypot(hx - (ax + vx * t), hz - (az + vz * t)), t };
    };

    // 1. Sloping West & East Harbor Swim Dock Stairs (hx=±50..±62, |hz| <= 3.5)
    if (hx <= -50.0 && Math.abs(hz) <= 3.5) {
      const t = THREE.MathUtils.clamp((-50.0 - hx) / 11.5, 0, 1);
      return { y: Math.max(0.32, quantizeTier(5.0 - t * 4.68, 0.45)), surface: 'stairs' };
    }
    if (hx >= 50.0 && Math.abs(hz) <= 3.5) {
      const t = THREE.MathUtils.clamp((hx - 50.0) / 11.5, 0, 1);
      return { y: Math.max(0.32, quantizeTier(6.0 - t * 5.68, 0.45)), surface: 'stairs' };
    }

    // 2. Kawah Lava Utama (35m x 25m): hx ∈ [-13.5, +21.5], hz ∈ [+27.0, +52.0] + Twin Front Spillways!
    if (hx >= -13.5 && hx <= 21.5 && hz >= 27.0 && hz <= 52.0) {
      return { y: 1.75, surface: 'land' };
    }
    // Twin Lava Waterfall Spillways breaching front basalt sea-cliff down into the sea!
    if (hz > 51.0 && (Math.abs(hx + 7.5) <= 2.4 || Math.abs(hx - 13.5) <= 2.4)) {
      const tFall = THREE.MathUtils.clamp((hz - 51.0) / 9.5, 0, 1);
      return { y: Math.max(0.32, quantizeTier(2.6 - tFall * 2.25, 0.55)), surface: 'land' };
    }

    // 3. Grand Tangga Batu Kuno (Exact 6m wide = ±3.0m) ascending from Citadel Plaza -> Mid Landing -> 34m Obelisk Summit!
    // Lower Flight (hx ∈ [-6.0, 0.0], hz ∈ [-14.0, +6.0], y: 6.0 -> 20.0m, 20m run!)
    if (hx >= -6.0 && hx <= 0.0 && hz >= -14.0 && hz <= 6.0) {
      const prog = THREE.MathUtils.clamp((6.0 - hz) / 20.0, 0, 1);
      return { y: Math.min(20.0, quantizeTier(6.0 + prog * 14.0, 0.46)), surface: 'stairs' };
    }
    // Mid-Citadel Ruin Landing Terrace (y = 20.0m)
    if (hx >= -11.0 && hx <= 15.0 && hz >= -18.0 && hz < -14.0) {
      return { y: 20.0, surface: 'road' };
    }
    // Upper Flight (hx ∈ [-3.0, +3.0] — exact 6m wide!, hz ∈ [-36.5, -18.0], y: 20.0 -> 34.0m, 18.5m run -> <=0.46m step!)
    if (hx >= -3.0 && hx <= 3.0 && hz >= -36.5 && hz < -18.0) {
      const prog = THREE.MathUtils.clamp((-18.0 - hz) / 18.5, 0, 1);
      return { y: Math.min(34.0, quantizeTier(20.0 + prog * 14.0, 0.46)), surface: 'stairs' };
    }
    // Summit Obelisk Plateau Terrace (y = 34.0m — 20m Obelisk + Plinth reaches exact T = 54.0m!)
    if (hx >= -12.0 && hx <= 12.0 && hz >= -49.5 && hz < -36.5) {
      return { y: 34.0, surface: 'land' };
    }

    // 4. West Ruin Bastion Stairway & Launch Terrace (leading straight to 4m x 4m Platform Rantai Obby!)
    if (hx >= -24.0 && hx <= -12.0 && hz >= -6.0 && hz <= -0.5) {
      const prog = THREE.MathUtils.clamp((-12.0 - hx) / 12.0, 0, 1);
      return { y: Math.min(12.0, quantizeTier(6.0 + prog * 6.0, 0.45)), surface: 'stairs' };
    }
    if (hx >= -42.0 && hx < -24.0 && hz >= -10.0 && hz <= 2.0) {
      return { y: 12.0, surface: 'road' };
    }

    // 5. East Watchtower Bastion Stairway & Terrace (y = 14.0m)
    if (hx >= 6.0 && hx <= 18.0 && hz >= -10.0 && hz <= -4.0) {
      const prog = THREE.MathUtils.clamp((hx - 6.0) / 12.0, 0, 1);
      return { y: Math.min(14.0, quantizeTier(6.0 + prog * 8.0, 0.46)), surface: 'stairs' };
    }
    if (hx > 18.0 && hx <= 34.5 && hz >= -26.0 && hz <= -6.0) {
      return { y: 14.0, surface: 'land' };
    }

    // 6. Central Courtyard & Paved Citadel Causeways connecting ALL 6 Archipelago Bridges cleanly!
    if (hx >= -22.0 && hx <= 6.0 && hz >= 4.0 && hz <= 22.0) {
      return { y: 6.0, surface: 'road' };
    }
    const cDesa = segDist(-16.0, 18.0, -26.0, 50.0);
    if (cDesa.d <= 3.0) {
      return { y: quantizeTier(6.0 - smoothstep(0.55, 1.0, cDesa.t) * 1.0, 0.35), surface: 'road' };
    }
    const cPasar = segDist(-20.0, 12.0, -58.0, 21.0);
    if (cPasar.d <= 3.0) {
      return { y: quantizeTier(6.0 - smoothstep(0.55, 1.0, cPasar.t) * 1.0, 0.35), surface: 'road' };
    }
    const cSatwaA = segDist(6.0, 18.0, 32.0, 22.0);
    const cSatwaB = segDist(32.0, 22.0, 46.0, 33.0);
    if (cSatwaA.d <= 3.0 || cSatwaB.d <= 3.0) {
      const drop = cSatwaB.d <= 3.0 ? smoothstep(0.25, 1.0, cSatwaB.t) * 1.0 : 0;
      return { y: quantizeTier(6.0 - drop, 0.35), surface: 'road' };
    }
    const cGerbangA = segDist(-20.0, 10.0, -50.0, 10.0);
    const cGerbangB = segDist(-50.0, 10.0, -57.0, -14.0);
    if (cGerbangA.d <= 3.0 || cGerbangB.d <= 3.0) {
      const climb = cGerbangB.d <= 3.0 ? smoothstep(0.35, 1.0, cGerbangB.t) * 0.5 : 0;
      return { y: quantizeTier(6.0 + climb, 0.35), surface: 'road' };
    }
    const cMenaraA = segDist(6.0, 12.0, 38.0, 4.0);
    const cMenaraB = segDist(38.0, 4.0, 50.0, -32.0);
    if (cMenaraA.d <= 3.0 || cMenaraB.d <= 3.0) {
      const climb = cMenaraB.d <= 3.0 ? smoothstep(0.35, 1.0, cMenaraB.t) * 0.5 : 0;
      return { y: quantizeTier(6.0 + climb, 0.35), surface: 'road' };
    }
    const cPortalA = segDist(-46.0, 9.0, -45.0, -28.0);
    const cPortalB = segDist(-45.0, -28.0, -18.0, -56.0);
    if (cPortalA.d <= 3.2 || cPortalB.d <= 3.2) {
      const drop = cPortalB.d <= 3.2 ? smoothstep(0.35, 1.0, cPortalB.t) * 1.0 : 0;
      return { y: quantizeTier(6.0 - drop, 0.35), surface: 'road' };
    }

    // 7. Deep Coastal Cove underneath the Floating 4m x 4m Chain Obby (hx < -42.5, hz ∈ [-10, +2])
    if (hx < -42.5 && hz >= -10.5 && hz <= 2.5) {
      return { y: 1.8, surface: 'beach' };
    }

    // 8. Sculpted Volcanic Basalt Crater Rim, Terraced Mountain Peaks & Mossy Citadel Ridges
    let h = 6.0 + hillWave(wx * 0.42, wz * 0.42) * 1.35;

    // Towering North-Center Mountain Backdrop supporting the 34m Obelisk Plateau (rises behind to 38..40m!)
    const mountainCore = Math.exp(-((hx - 0.0) ** 2 / 460 + (hz + 41.0) ** 2 / 360)) * 31.5;
    const mountainNorth = Math.exp(-((hx - 2.0) ** 2 / 640 + (hz + 51.0) ** 2 / 190)) * 34.0;
    const mountainWest = Math.exp(-((hx + 22.0) ** 2 / 260 + (hz + 32.0) ** 2 / 320)) * 18.0;
    const mountainEast = Math.exp(-((hx - 26.0) ** 2 / 310 + (hz + 26.0) ** 2 / 340)) * 16.5;
    h += mountainCore + mountainNorth + mountainWest + mountainEast;

    // Dark Volcanic Basalt Outer Crater Rim framing Kawah Lava Utama (35m x 25m)
    const rimDistX = Math.max(0, Math.abs(hx - 4.0) - 17.5);
    const rimDistZ = Math.max(0, Math.abs(hz - 39.5) - 12.5);
    const craterRimDist = Math.hypot(rimDistX, rimDistZ);
    if (craterRimDist > 0.01 && craterRimDist < 5.5) {
      const rimPeak = (1.0 - smoothstep(0.0, 5.5, craterRimDist)) * 3.8;
      h = Math.max(h, 6.2 + rimPeak);
    }

    // Smooth bridge arrival pads
    h = padBlend(hx, hz, -26.0, 50.0, 3.8, 7.0, 5.0, h);
    h = padBlend(hx, hz, -58.0, 21.0, 3.8, 7.0, 5.0, h);
    h = padBlend(hx, hz, 46.0, 33.0, 3.8, 7.0, 5.0, h);
    h = padBlend(hx, hz, -57.0, -14.0, 3.8, 7.0, 6.5, h);
    h = padBlend(hx, hz, 50.0, -32.0, 3.8, 7.0, 6.5, h);
    h = padBlend(hx, hz, -18.0, -56.0, 3.8, 7.0, 5.0, h);

    // Gentle sandy/pebble beaches along West/East outer flanks (except volcanic front caldera cliff)
    if (dist > effR - 5.2 && !(hx >= -16.0 && hx <= 24.0 && hz >= 48.0)) {
      const beachY = 0.32 + rimSlope * 3.4;
      return { y: Math.max(0.32, quantizeTier(Math.min(Math.max(0.55, h), beachY), 0.45)), surface: 'beach' };
    }
    return { y: Math.max(0.65, Math.min(40.0, quantizeTier(h, 0.7))), surface: 'land' };
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
    h = padBlend(wx, wz, -4.5, 140.0, 3.0, 6.0, 2.6, h); // swimSuit
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
    // Full 140m (radius 70m) City Fortress Island ("Gerbang Kota"):
    // Center: cx=-118, cz=-98 -> local coords lx = wx + 118, lz = wz + 98
    const lx = wx + 118.0;
    const lz = wz + 98.0;

    // 1. South Harbor Cliff Staircase climbing smoothly from dock_gerbang_south (-126.5, -27.5, y=0.32) up to Lower Highway (y=12.0)!
    if (lx >= -12.0 && lx <= -5.0 && lz >= 19.0) {
      const t = THREE.MathUtils.clamp((lz - 19.0) / 50.0, 0, 1);
      return { y: Math.max(0.32, quantizeTier(12.0 - t * 11.68, 0.5)), surface: 'stairs' };
    }

    // 2. Grand City Gate Ramp rising smoothly from Lower Highway (lz=+5, y=12.0) through Gate (lz=-4) to Courtyard (lz=-9, y=20.0)!
    if (lx >= -5.5 && lx <= 3.5 && lz >= -9.0 && lz <= 5.0) {
      const prog = THREE.MathUtils.clamp((5.0 - lz) / 14.0, 0, 1);
      return { y: Math.min(20.0, quantizeTier(12.0 + prog * 8.0, 0.48)), surface: 'stairs' };
    }

    // 3. Upper Fortress Courtyard (y=20.0m, 54m x 40m enclosed by 28m Benteng walls!)
    if (lx >= -28.5 && lx <= 26.5 && lz >= -44.5 && lz < -4.0) {
      // Paved asphalt driveway leading straight from City Gate up to Sekolah Bata Merah front steps
      if (
        (lx >= -5.5 && lx <= 3.5 && lz >= -19.0) ||
        (lx >= -17.0 && lx <= 11.0 && lz >= -19.0 && lz <= -12.0)
      ) {
        return { y: 20.0, surface: 'road' };
      }
      return { y: 20.0, surface: 'land' };
    }

    // 4. Lower City Highway & 14m-Wide Hollow Walkable Underground Tunnel Corridor (y=12.0m)!
    //    Includes T-intersection junction seamlessly joining the 8m Viaduct Bridge at (lx=+4, lz=+18) -> (-114, -80)!
    if (lz >= 5.0 && lz <= 19.0 && lx <= 47.0) {
      return { y: 12.0, surface: 'road' };
    }
    if (lx >= -0.5 && lx <= 8.5 && lz >= 18.0 && lz <= 26.0) {
      return { y: 12.0, surface: 'road' };
    }

    // 5. Lower City Gate Stone Forecourt Plaza (y=12.0m) in front of Fortress East/West walls (npc_penjaga & guardPost!)
    if (lx >= -26.0 && lx <= 32.0 && lz >= -4.0 && lz < 5.0) {
      return { y: 12.0, surface: 'land' };
    }
    // East Coastal Highway Shoulder overlooking the Viaduct & Ocean (y=12.0m)
    if (lx >= 10.0 && lx <= 48.0 && lz >= 19.0 && lz <= 25.0) {
      return { y: 12.0, surface: 'land' };
    }

    // 6. Towering 36m Rocky City Cliffs ("Tinggi Tebing Kota: 36m") & Stepped Lower Basalt Headland!
    let h = 12.0 + hillWave(wx * 0.42, wz * 0.42) * 1.1;

    // Towering 36m mountain backdrop behind North & West/East shoulders of the Benteng
    const northCliff = smoothstep(-38.0, -52.0, lz) * 23.6;
    const westCliff = smoothstep(-24.0, -40.0, lx) * smoothstep(32.0, 14.0, lz) * 23.4;
    const eastCliff = smoothstep(24.0, 38.0, lx) * smoothstep(14.0, -10.0, lz) * 21.8;
    h += Math.min(24.2, Math.max(northCliff, westCliff, eastCliff));

    // Front-South lower rocky cliff drop below the y=12m highway & tunnel mouth (creating the 12m cliff wall + sandy cove!)
    if (lz > 19.5) {
      const cliffDrop = smoothstep(20.0, 31.5, lz) * 7.8;
      h = Math.max(1.8, 12.0 - cliffDrop + hillWave(wx * 0.65, wz * 0.65) * 1.35);
    }

    // Smooth plaza pad under npc_penjaga & guardPost
    h = padBlend(wx, wz, -110.5, -92.5, 3.0, 5.5, 12.0, h);
    h = padBlend(wx, wz, -102.0, -95.5, 3.0, 5.5, 12.0, h);

    // Coastal sandy beach cove along the front-south shoreline (walkable swim-in shore!)
    if (dist > effR - 7.5 && lz > 18.0) {
      const beachY = 0.28 + rimSlope * 2.2;
      return { y: Math.max(0.28, quantizeTier(Math.min(Math.max(0.45, h), beachY), 0.36)), surface: 'beach' };
    }
    return { y: Math.max(0.75, Math.min(36.0, quantizeTier(h, 0.75))), surface: 'land' };
  }

  if (isl.id === 'menara_waktu') {
    // Menara Waktu (cx=148, cz=-92, radius=65.0) — Full 130m Clock Tower Hill!
    // Local coords lx = wx - 148, lz = wz + 92
    const lx = wx - 148.0;
    const lz = wz + 92.0;

    // 1. South sea-dock cliff staircase climbing smoothly from dock_menara_south (148, -26.5) -> South Promenade (y=10.0m)
    if (Math.abs(lx) <= 4.2 && lz >= 28.0) {
      const t = THREE.MathUtils.clamp((lz - 28.0) / 34.0, 0, 1);
      return { y: Math.max(0.32, quantizeTier(10.0 - t * 9.68, 0.46)), surface: 'stairs' };
    }
    // South promenade path linking top of South sea stairs to Main Golden Terrace Road
    if (lx >= -20.0 && lx <= 4.2 && lz >= 23.0 && lz <= 29.0) {
      return { y: 10.0, surface: 'road' };
    }

    // 2. Main Golden Lower Terrace Road (y=10.0m) from Jembatan Roda Gigi (lx=-54, lz=+26) -> Pavilion Plaza -> Stair Foot
    if (lx >= -58.0 && lx <= -18.0 && lz >= 15.0 && lz <= 30.0) {
      return { y: 10.0, surface: 'road' };
    }
    // Classical Time Pavilion Courtyard Shelf (y=10.0m)
    if (lx >= -47.0 && lx <= -24.0 && lz >= -4.0 && lz <= 15.0) {
      return { y: 10.0, surface: 'land' };
    }

    // 3. Winding Two-Flight Hilltop Stairway climbing from Lower Terrace (10.0m) -> Clock Tower Summit Courtyard (32.0m)!
    // Flight 1 (Front-West ascent northward: lz=+16..-8 across lx=-24..-16, y=10.0->21.0m)
    if (lx >= -24.5 && lx <= -15.5 && lz >= -8.0 && lz <= 16.0) {
      const prog = THREE.MathUtils.clamp((16.0 - lz) / 24.0, 0, 1);
      return { y: Math.min(21.0, quantizeTier(10.0 + prog * 11.0, 0.42)), surface: 'stairs' };
    }
    // Mid-Hill Terrace Landing (y=21.0m)
    if (lx >= -25.0 && lx <= -14.0 && lz >= -16.5 && lz <= -8.0) {
      return { y: 21.0, surface: 'road' };
    }
    // Flight 2 (Upper ridge ascent eastward: lx=-14..+6 across lz=-16..-7.5, y=21.0->32.0m)
    if (lx >= -14.0 && lx <= 6.0 && lz >= -16.5 && lz <= -7.5) {
      const prog = THREE.MathUtils.clamp((lx - -14.0) / 20.0, 0, 1);
      return { y: Math.min(32.0, quantizeTier(21.0 + prog * 11.0, 0.42)), surface: 'stairs' };
    }

    // 4. Clock Tower Summit Courtyard Plateau (y=32.0m) — Menara Jam Utama (T:26m) rises from 32m -> 58m!
    if (lx >= -2.0 && lx <= 19.0 && lz >= -26.0 && lz <= -2.0) {
      const isPlazaFront = lz >= -10.5 && lx <= 14.0;
      return { y: 32.0, surface: isPlazaFront ? 'road' : 'land' };
    }

    // 4b. NE Cliff Stairway & Grassy Bridgehead Overlook (172, 22.0, -124 -> lx=+24, lz=-32) to Severed Light Bridge!
    if (Math.hypot(wx - 172.0, wz + 124.0) <= 5.0) {
      return { y: 22.0, surface: 'land' };
    }
    if (lx >= 15.0 && lx <= 20.5 && lz >= -34.5 && lz <= -25.5) {
      const prog = THREE.MathUtils.clamp((-25.5 - lz) / 9.0, 0, 1);
      return { y: Math.max(25.0, quantizeTier(32.0 - prog * 7.0, 0.45)), surface: 'stairs' };
    }
    if (lx >= 19.5 && lx <= 24.5 && lz >= -35.5 && lz <= -29.0) {
      const prog = THREE.MathUtils.clamp((lx - 19.5) / 5.0, 0, 1);
      return { y: Math.max(22.0, quantizeTier(25.0 - prog * 3.0, 0.45)), surface: 'stairs' };
    }

    // 5. Terowongan Kronos (T:14m / L:16m!) Carved Bore Floor & SE Coastal Apron at (lx=+28, lz=+32 -> wx=176, wz=-60)
    if (lx >= 19.0 && lx <= 37.0 && lz >= 20.0) {
      if (lz <= 42.0) {
        return { y: 2.0, surface: 'road' };
      }
      const beachT = THREE.MathUtils.clamp((lz - 42.0) / 12.0, 0, 1);
      return { y: Math.max(0.32, quantizeTier(2.0 - beachT * 1.68, 0.36)), surface: 'beach' };
    }

    // 6. Sculpted Lush Emerald-Green Terraced Clockwork Hill rising up to 32.0m Summit Massif!
    let h = 4.6 + hillWave(wx * 0.42, wz * 0.42) * 1.4;
    // Broad Summit Dome supporting Menara Jam Utama (32m plateau)
    const summitPeak = Math.exp(-((lx - 7.0) ** 2 / 780 + (lz + 14.0) ** 2 / 640)) * 28.5;
    // West Terrace Shoulder flanking Pavilion & Jembatan Roda Gigi
    const westTerrace = Math.exp(-((lx + 38.0) ** 2 / 460 + (lz - 10.0) ** 2 / 420)) * 7.2;
    // East Clockwork Ridge overlooking Terowongan Kronos & Giant 14m Gears
    const eastGearRidge = Math.exp(-((lx - 32.0) ** 2 / 520 + (lz - 4.0) ** 2 / 480)) * 18.5;
    // North Rear Cliff Massif
    const northBluff = Math.exp(-((lx - 4.0) ** 2 / 900 + (lz + 34.0) ** 2 / 360)) * 20.5;
    h += summitPeak + westTerrace + eastGearRidge + northBluff;

    // Keep Bridge Landing (94, -66), NE Light Bridge Headland (172, -124), NPC, Guard Post & Zone Beacon flat
    h = padBlend(wx, wz, 94.0, -66.0, 4.5, 8.5, 10.0, h);
    h = padBlend(wx, wz, 172.0, -124.0, 5.2, 10.5, 22.0, h);
    h = padBlend(wx, wz, 118.0, -72.0, 4.5, 8.5, 10.0, h);
    h = padBlend(wx, wz, 113.5, -73.5, 3.5, 6.5, 10.0, h);
    h = padBlend(wx, wz, 117.5, -80.5, 3.5, 6.5, 10.0, h);

    // Sandy coastal rim strips along Front-South / SW / SE edge
    if (dist > effR - 6.2 && lz > -6.0) {
      const beachY = 0.32 + rimSlope * 2.2;
      return { y: Math.max(0.32, quantizeTier(Math.min(Math.max(0.48, h), beachY), 0.36)), surface: 'beach' };
    }
    return { y: Math.max(0.75, Math.min(32.0, quantizeTier(h, 0.75))), surface: 'land' };
  }

  // gua_portal (cx=20, cz=-174, radius=67.5) — Full 135m Crystal Canyon!
  // Local coords lx = wx - 20, lz = wz + 174
  const lx = wx - 20.0;
  const lz = wz + 174.0;

  // 1. Sea-Dock Cliff Staircases (West, East & South cove -> effortless swim entry/exit!)
  if (lx <= -44.0 && Math.abs(lz) <= 4.0) {
    const t = THREE.MathUtils.clamp((-44.0 - lx) / 20.8, 0, 1);
    return { y: Math.max(0.3, quantizeTier(11.5 - t * 11.2, 0.48)), surface: 'stairs' };
  }
  if (lx >= 42.0 && Math.abs(lz) <= 4.0) {
    const t = THREE.MathUtils.clamp((lx - 42.0) / 25.0, 0, 1);
    return { y: Math.max(0.3, quantizeTier(10.5 - t * 10.2, 0.48)), surface: 'stairs' };
  }
  if (lx >= -10.5 && lx <= -2.5 && lz >= 32.0) {
    const t = THREE.MathUtils.clamp((lz - 32.0) / 35.0, 0, 1);
    return { y: Math.max(0.3, quantizeTier(5.5 - t * 5.2, 0.46)), surface: 'stairs' };
  }

  // 2. SW Bridge Quarry Ascent: Bridge Landing (lx=-32, lz=56, y=4.0m) -> Ruined Stone Arch (lx=-34, lz=14, y=12.0m) -> Courtyard (lx=-18, lz=8, y=14.0m)!
  if (lx >= -38.5 && lx <= -29.5 && lz >= 14.0 && lz <= 56.0) {
    const prog = THREE.MathUtils.clamp((56.0 - lz) / 42.0, 0, 1);
    return { y: quantizeTier(4.0 + prog * 8.0, 0.45), surface: 'stairs' };
  }
  if (lx >= -34.0 && lx <= -18.0 && lz >= 6.0 && lz <= 16.0) {
    const prog = THREE.MathUtils.clamp((lx - -34.0) / 16.0, 0, 1);
    return { y: quantizeTier(12.0 + prog * 2.0, 0.44), surface: 'stairs' };
  }

  // 3. Front Canyon Gorge Stairs connecting South Cove (lx=-12, lz=32, y=5.5m) up to Crystal Courtyard (lx=-14, lz=12, y=14.0m)!
  if (lx >= -19.0 && lx <= -11.0 && lz >= 12.0 && lz <= 32.0) {
    const prog = THREE.MathUtils.clamp((32.0 - lz) / 20.0, 0, 1);
    return { y: quantizeTier(5.5 + prog * 8.5, 0.48), surface: 'stairs' };
  }

  // 4. Ramp climbing from Crystal Courtyard (y=14.0m) straight into Mulut Gua Portal (T:16m / L:14m at lx=+2, lz=-14, y=18.0m)!
  if (lx >= -6.5 && lx <= 8.5 && lz >= -20.0 && lz <= -5.0) {
    const prog = THREE.MathUtils.clamp((-5.0 - lz) / 10.0, 0, 1);
    return { y: Math.min(18.0, quantizeTier(14.0 + prog * 4.0, 0.45)), surface: 'stairs' };
  }

  // 5. Flat Central Crystal Courtyard Terrace (y=14.0m) hosting Purple Portal Arch, NPC Portal, Guard Post & Zone Beacon
  if (lx >= -26.5 && lx <= 2.5 && lz >= -15.0 && lz <= 13.0) {
    return { y: 14.0, surface: 'road' };
  }
  // West Quarry Shelf under Ruined Stone Arch & Wooden Scaffolding (y=12.0m)
  if (lx >= -45.0 && lx <= -26.5 && lz >= -12.0 && lz <= 22.0) {
    return { y: 12.0, surface: 'land' };
  }

  // 6. Sculpted 52m Crystal Canyon Mountain Massif ("Tinggi Puncak Ngarai: 52m") & Lower Misty Gorge!
  let h = 6.2 + hillWave(wx * 0.42, wz * 0.42) * 1.4;

  // Sunken Front-Center/South Misty Gorge beneath the Elevated Minecart Trestle (y=3.2..5.5m)
  const gorgePit = Math.exp(-((lx - 8.0) ** 2 / 360 + (lz - 30.0) ** 2 / 210));
  h -= gorgePit * 3.0;

  // Towering Central-North Dark Obsidian Peak directly behind/above Mulut Gua Portal (rises to 36..42m!)
  const obsidianPeak = Math.exp(-((lx - 2.0) ** 2 / 340 + (lz + 28.0) ** 2 / 230)) * 31.5;
  // Colossal 52m North-East Grey Granite Canyon Summit ("Tinggi Puncak Ngarai: 52m"!)
  const neCanyonPeak = Math.exp(-((lx - 32.0) ** 2 / 360 + (lz + 32.0) ** 2 / 320)) * 46.2;
  // North-West Shoulder Cliff behind Obsidian Portal
  const nwShoulder = Math.exp(-((lx + 24.0) ** 2 / 240 + (lz + 26.0) ** 2 / 240)) * 22.5;
  // East Crystal Rim Wall flanking the Minecart Hairpin
  const eastRim = Math.exp(-((lx - 46.0) ** 2 / 220 + (lz + 4.0) ** 2 / 280)) * 18.5;

  h += obsidianPeak + neCanyonPeak + nwShoulder + eastRim;

  // Keep bridge arrival landing at (-12, -118) smooth at y=4.0m
  h = padBlend(wx, wz, -12.0, -118.0, 5.2, 10.5, 4.0, h);
  // Keep dock/courtyard anchors crisp
  h = padBlend(wx, wz, 2.0, -185.0, 4.5, 8.0, 14.0, h);
  h = padBlend(wx, wz, 9.0, -171.0, 4.5, 8.0, 14.0, h);
  h = padBlend(wx, wz, 5.0, -177.0, 3.5, 6.5, 14.0, h);
  h = padBlend(wx, wz, -1.0, -172.0, 3.5, 6.5, 14.0, h);

  // Sandy coastal rim strips along Front-South / SW / SE edge (matching beach edge in overview image!)
  if (dist > effR - 6.8 && lz > -6.0) {
    const beachY = 0.28 + rimSlope * 2.2;
    return { y: Math.max(0.28, quantizeTier(Math.min(Math.max(0.45, h), beachY), 0.36)), surface: 'beach' };
  }
  return { y: Math.max(0.75, Math.min(52.0, quantizeTier(h, 0.75))), surface: 'land' };
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
      if (bestBridgeY !== null && bestBridgeY > inner.y + 0.05) {
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
  minecartCurve: THREE.CatmullRomCurve3;
  crystalMeshes: THREE.Mesh[];
  lavaMeshes: THREE.Mesh[];
  istanaGroup: THREE.Group;
  istanaDome: THREE.Mesh;
  istanaRig: IstanaFloatingRig;
  zooCritters: Array<{ root: THREE.Group; head: THREE.Group; phase: number }>;
  disposables: Array<{ dispose: () => void }>;
}

const _cartPosScratch = new THREE.Vector3();
const _cartTanScratch = new THREE.Vector3();

function createToothedGear(
  radius: number,
  thickness: number,
  teeth: number,
  goldMat: THREE.Material,
  darkMat: THREE.Material,
  disposables?: Array<{ dispose: () => void }>,
): THREE.Group {
  const g = new THREE.Group();
  // 1. Open Beveled Outer Golden Rim Ring (matching giant spoked clockwork wheels in overview!)
  const ringGeo = new THREE.TorusGeometry(radius * 0.86, radius * 0.125, 8, Math.max(16, teeth));
  const rim = new THREE.Mesh(ringGeo, goldMat);
  rim.scale.set(1, 1, Math.max(0.7, (thickness * 0.55) / (radius * 0.125)));
  rim.castShadow = true;

  const innerRingGeo = new THREE.TorusGeometry(radius * 0.68, radius * 0.048, 6, 16);
  const innerRim = new THREE.Mesh(innerRingGeo, darkMat);
  innerRim.scale.set(1, 1, Math.max(0.65, (thickness * 0.42) / (radius * 0.048)));

  // 2. Central Axle Hub & Bolt Boss
  const hubGeo = new THREE.CylinderGeometry(radius * 0.24, radius * 0.24, thickness * 1.4, 12);
  const hub = new THREE.Mesh(hubGeo, darkMat);
  hub.rotation.x = Math.PI / 2;
  hub.castShadow = true;
  const bossGeo = new THREE.CylinderGeometry(radius * 0.14, radius * 0.14, thickness * 1.65, 8);
  const boss = new THREE.Mesh(bossGeo, goldMat);
  boss.rotation.x = Math.PI / 2;
  g.add(rim, innerRim, hub, boss);

  // 3. Radial Brass Spokes (6 spokes across the open wheel center)
  const spokeCount = radius >= 4.5 ? 6 : 4;
  const spokeGeo = new THREE.BoxGeometry(radius * 1.62, radius * 0.13, thickness * 0.68);
  for (let s = 0; s < spokeCount / 2; s++) {
    const spoke = new THREE.Mesh(spokeGeo, goldMat);
    spoke.rotation.z = (s / (spokeCount / 2)) * Math.PI;
    spoke.castShadow = true;
    g.add(spoke);
  }

  // 4. Heavy Rectangular Perimeter Gear Teeth
  const toothGeo = new THREE.BoxGeometry(radius * 0.22, radius * 0.24, thickness * 0.92);
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const t = new THREE.Mesh(toothGeo, goldMat);
    t.position.set(Math.cos(a) * (radius * 1.01), Math.sin(a) * (radius * 1.01), 0);
    t.rotation.z = a;
    t.castShadow = true;
    g.add(t);
  }
  if (disposables) {
    disposables.push(ringGeo, innerRingGeo, hubGeo, bossGeo, spokeGeo, toothGeo);
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
  variant: 'sedan' | 'taxi' | 'police' | 'bus' = 'sedan',
): THREE.Group {
  const car = new THREE.Group();
  const isBus = variant === 'bus';
  const isPolice = variant === 'police';
  const isTaxi = variant === 'taxi';

  const bodyMat = palette.getMat(isPolice ? 0xf8fafc : bodyColor, 'gloss');
  const trimMat = palette.getMat(0x1e293b, 'matte');
  const glassMat = palette.getPixelMat('glass_pane', 0xe0f2fe);
  const wheelMat = palette.getMat(0x0f172a, 'matte');
  const rimMat = palette.getMat(0xcbd5e1, 'metal');
  const headlightMat = palette.getMat(0xfef08a, 'emissive');
  const taillightMat = palette.getMat(0xef4444, 'emissive');

  if (isBus) {
    // Full-scale Red City Bus (9.8m long x 3.2m wide x 4.85m tall — towers cleanly above the 3.43m Hero!)
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.65, 3.25), trimMat);
    bumper.position.y = 0.72;
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(9.8, 1.55, 3.16), bodyMat);
    lowerBody.position.y = 1.68;
    lowerBody.castShadow = true;
    const beltStripe = new THREE.Mesh(new THREE.BoxGeometry(9.86, 0.28, 3.22), palette.getMat(0xf8fafc, 'matte'));
    beltStripe.position.y = 2.48;
    const glassCabin = new THREE.Mesh(new THREE.BoxGeometry(9.45, 1.45, 3.04), glassMat);
    glassCabin.position.y = 3.32;
    // Pillar dividers along passenger windows
    [-3.3, -1.6, 0.1, 1.8, 3.5].forEach((px) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.52, 3.12), bodyMat);
      pillar.position.set(px, 3.32, 0);
      car.add(pillar);
    });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(9.7, 0.45, 3.14), palette.getMat(0xf8fafc, 'matte'));
    roof.position.y = 4.26;
    roof.castShadow = true;
    const acUnit = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.38, 1.8), palette.getMat(0x94a3b8, 'metal'));
    acUnit.position.set(-0.8, 4.66, 0);

    // Front & Rear Lights
    [-1.1, 1.1].forEach((lz) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.52), headlightMat);
      hl.position.set(4.94, 1.25, lz);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.52), taillightMat);
      tl.position.set(-4.94, 1.25, lz);
      car.add(hl, tl);
    });

    // 4 Heavy Wheels + Metallic Hubcaps
    const tireGeo = new THREE.BoxGeometry(1.18, 1.18, 0.52);
    const hubGeo = new THREE.BoxGeometry(0.56, 0.56, 0.58);
    [[-3.0, -1.48], [3.0, -1.48], [-3.0, 1.48], [3.0, 1.48]].forEach(([wx, wz]) => {
      const tire = new THREE.Mesh(tireGeo, wheelMat);
      tire.position.set(wx, 0.59, wz);
      const hub = new THREE.Mesh(hubGeo, rimMat);
      hub.position.set(wx, 0.59, wz);
      car.add(tire, hub);
    });
    car.add(bumper, lowerBody, beltStripe, glassCabin, roof, acUnit);
    return car;
  }

  // Human-proportional Sedan / Taxi / Police SUV (5.8m-6.4m long x 2.9m-3.1m wide x 3.45m-3.95m tall!)
  // Ensures vehicles are NEVER smaller than the 3.43m Hero explorer!
  const len = isPolice ? 6.4 : 5.8;
  const wid = isPolice ? 3.1 : 2.9;
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(len + 0.24, 0.5, wid + 0.08), trimMat);
  bumper.position.y = 0.68;

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(len, 1.32, wid), bodyMat);
  chassis.position.y = 1.48;
  chassis.castShadow = true;

  if (isPolice) {
    const hoodMat = palette.getMat(0x1d4ed8, 'gloss');
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.36, wid + 0.04), hoodMat);
    hood.position.set(2.05, 1.48, 0);
    const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.36, wid + 0.04), hoodMat);
    trunk.position.set(-2.3, 1.48, 0);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(len * 0.52, 0.28, wid + 0.06), hoodMat);
    stripe.position.set(-0.2, 1.45, 0);
    car.add(hood, trunk, stripe);
  }

  const cabLen = isPolice ? 3.9 : 3.25;
  const cabH = isPolice ? 1.25 : 1.15;
  const cabX = isPolice ? -0.35 : -0.22;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(cabLen, cabH, wid - 0.34), glassMat);
  cabin.position.set(cabX, 2.14 + cabH * 0.5, 0);
  // Roof pillars for realistic voxel car look
  [-cabLen * 0.44, cabLen * 0.44].forEach((px) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.32, cabH + 0.04, wid - 0.3), trimMat);
    p.position.set(cabX + px, 2.14 + cabH * 0.5, 0);
    car.add(p);
  });

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(cabLen + 0.14, 0.28, wid - 0.28),
    palette.getMat(isPolice ? 0xf8fafc : bodyColor, 'gloss'),
  );
  roof.position.set(cabX, 2.14 + cabH + 0.14, 0);
  roof.castShadow = true;

  if (isPolice) {
    const barBase = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.16, 1.75), trimMat);
    barBase.position.set(cabX + 0.2, 3.62, 0);
    const beaconR = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 0.72), palette.getMat(0xef4444, 'emissive'));
    beaconR.position.set(cabX + 0.2, 3.82, -0.46);
    const beaconB = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 0.72), palette.getMat(0x3b82f6, 'emissive'));
    beaconB.position.set(cabX + 0.2, 3.82, 0.46);
    car.add(barBase, beaconR, beaconB);
  } else if (isTaxi) {
    const taxiSign = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.34, 1.1), palette.getMat(0xfef08a, 'emissive'));
    taxiSign.position.set(cabX + 0.25, 3.6, 0);
    car.add(taxiSign);
  }

  // Headlights, Taillights & Grille
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.52, wid * 0.48), trimMat);
  grille.position.set(len * 0.5 + 0.04, 1.15, 0);
  car.add(grille);
  [-wid * 0.34, wid * 0.34].forEach((lz) => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.34, 0.48), headlightMat);
    hl.position.set(len * 0.5 + 0.05, 1.32, lz);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.34, 0.48), taillightMat);
    tl.position.set(-len * 0.5 - 0.05, 1.32, lz);
    car.add(hl, tl);
  });

  // 4 Large Voxel Tires + Metallic Hubcaps
  const wheelGeo = new THREE.BoxGeometry(1.06, 1.06, 0.46);
  const hubGeo = new THREE.BoxGeometry(0.48, 0.48, 0.52);
  const wxOff = len * 0.32;
  const wzOff = wid * 0.46;
  [[-wxOff, -wzOff], [wxOff, -wzOff], [-wxOff, wzOff], [wxOff, wzOff]].forEach(([wx, wz]) => {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(wx, 0.53, wz);
    const hub = new THREE.Mesh(hubGeo, rimMat);
    hub.position.set(wx, 0.53, wz);
    car.add(w, hub);
  });

  car.add(bumper, chassis, cabin, roof);
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

  // 1. Expansive Vibrant Azure Ocean (swimmable across ±275 archipelago!)
  const oceanGeo = new THREE.PlaneGeometry(960, 960, lowDetail ? 36 : 84, lowDetail ? 36 : 84);
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

  const seabedGeo = new THREE.PlaneGeometry(740, 740);
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
      lowColors: [0x65a30d, 0x4d7c0f, 0x78716c, 0x64748b],
      highColors: [0x65a30d, 0x4d7c0f, 0x71bd3d, 0x78716c],
      pathColors: [0x94a3b8, 0x78716c],
      stairColors: [0xcbd5e1, 0x94a3b8],
      beachColors: [0x94a3b8, 0xcbd5e1],
      cliffColors: [0x57534e, 0x475569, 0x64748b],
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
      highColors: [0x65a30d, 0x4d7c0f, 0x64748b, 0x52525b],
      pathColors: [0x334155, 0x1e293b],
      stairColors: [0x94a3b8, 0xcbd5e1],
      beachColors: [0xfde68a, 0xfcd34d],
      cliffColors: [0x64748b, 0x52525b, 0x475569],
      foamColors: [0x38bdf8, 0xbae6fd],
    },
    menara_waktu: {
      lowColors: [0x65a30d, 0x84cc16, 0x4d7c0f],
      highColors: [0x65a30d, 0x84cc16, 0x4d7c0f, 0x71bd3d],
      pathColors: [0xd4a373, 0xeab308],
      stairColors: [0xd4a373, 0xb88a4c],
      beachColors: [0xfde68a, 0xfcd34d],
      cliffColors: [0x78543a, 0x5c3a1e, 0x64748b],
      foamColors: [0x38bdf8, 0xbae6fd],
    },
    gua_portal: {
      lowColors: [0x475569, 0x334155, 0x1e1b4b],
      highColors: [0x64748b, 0x475569, 0x78716c, 0x312e81],
      pathColors: [0x64748b, 0x94a3b8],
      stairColors: [0x94a3b8, 0x64748b],
      beachColors: [0xfde68a, 0x94a3b8],
      cliffColors: [0x1e1b4b, 0x2e1065, 0x334155, 0x475569],
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
          const isHubBasaltZone =
            isl.id === 'hub' && wx >= -18.5 && wx <= 26.5 && wz + 17.0 >= 22.0;
          const colList =
            inner.surface === 'stairs'
              ? theme.stairColors
              : inner.surface === 'road'
              ? theme.pathColors
              : isHubBasaltZone
              ? [0x1c1917, 0x292524, 0x3f3f46]
              : inner.surface === 'beach'
              ? theme.beachColors
              : isl.id === 'hub' && inner.y >= 26.0
              ? [0x64748b, 0x78716c, 0x65a30d]
              : isl.id === 'gerbang_kota' && Math.abs(inner.y - 20.0) < 0.2
              ? [0x65a30d, 0x589e2e, 0x71bd3d]
              : isl.id === 'gerbang_kota' && Math.abs(inner.y - 12.0) < 0.2
              ? [0x94a3b8, 0x64748b, 0xcbd5e1]
              : isl.id === 'gerbang_kota' && inner.y < 11.0
              ? [0x65a30d, 0x4d7c0f, 0x64748b]
              : isl.id === 'pasar_rasa' && inner.y >= 26.5
              ? [0x65a30d, 0x84cc16, 0x4d7c0f]
              : isl.id === 'gua_portal' && inner.y >= 34.0 && wx - 20.0 > 12.0
              ? [0x64748b, 0x475569, 0x78716c]
              : isl.id === 'gua_portal' && inner.y >= 19.0
              ? [0x1e1b4b, 0x2e1065, 0x0f172a, 0x3b0764]
              : isl.id === 'gua_portal' && Math.abs(inner.y - 12.0) < 1.2
              ? [0x64748b, 0x475569, 0x94a3b8]
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
            const hubBasaltCliff = [0x1c1917, 0x292524, 0x3f3f46];
            const isHubBasalt = isl.id === 'hub' && wx >= -18.5 && wx <= 26.5 && wz + 17.0 >= 22.0;
            const cliffPalette = isHubBasalt ? hubBasaltCliff : theme.cliffColors;
            const cliffHex = cliffPalette[Math.abs(gx * 3 + gz * 5 + tierBias) % cliffPalette.length];
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
    const dx = br.bx - br.ax;
    const dz = br.bz - br.az;
    const totalLen = Math.hypot(dx, dz);
    const isViaductOrHwy = br.id === 'viaduct_gerbang' || br.style === 'highway';
    const segs = Math.max(20, Math.round(totalLen / 2.2));
    const yaw = Math.atan2(dx, dz);
    const stepLen = totalLen / segs + 0.1;
    const width = br.halfWidth * 2;
    const deckMat = isViaductOrHwy
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
          if (Math.abs(tm - g.t0) < 0.045 || Math.abs(tm - g.t1) < 0.045) {
            isJumpEdge = true;
          }
        }
      }

      if (inGap) {
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

      const segGeo = new THREE.BoxGeometry(width, isViaductOrHwy ? 0.72 : 0.42, stepLen);
      const segMesh = new THREE.Mesh(segGeo, deckMat);
      segMesh.position.set(mx, my - (isViaductOrHwy ? 0.36 : 0.21), mz);
      segMesh.rotation.order = 'YXZ';
      segMesh.rotation.y = yaw;
      segMesh.rotation.x = -slope;
      segMesh.castShadow = true;
      segMesh.receiveShadow = true;
      group.add(segMesh);
      walkableTargets.push(segMesh);
      disposables.push(segGeo);

      if (isViaductOrHwy) {
        // Dashed white centerline + continuous stone parapets with crenellated posts!
        if (s % 2 === 0) {
          cliffBlocks.push({
            x: mx,
            y: my + 0.05,
            z: mz,
            sx: 0.42,
            sy: 0.08,
            sz: stepLen * 0.65,
            color: 0xf8fafc,
          });
        }
        const perpX = Math.cos(yaw) * (br.halfWidth - 0.35);
        const perpZ = -Math.sin(yaw) * (br.halfWidth - 0.35);
        [-1, 1].forEach((side) => {
          cliffBlocks.push({
            x: mx + perpX * side,
            y: my + 0.46,
            z: mz + perpZ * side,
            sx: 0.72,
            sy: 0.96,
            sz: 0.72,
            color: s % 3 === 0 ? 0xcbd5e1 : 0x94a3b8,
          });
          if (s % 3 === 0) {
            cliffBlocks.push({
              x: mx + perpX * side,
              y: my + 1.1,
              z: mz + perpZ * side,
              sx: 0.85,
              sy: 0.38,
              sz: 0.85,
              color: 0x64748b,
            });
          }
        });
        // Tall arched stone viaduct piers & arch shoulders down to SEABED_Y
        if (s === 0 || s === segs - 1 || s % 7 === 0) {
          const pierW = br.style === 'highway' ? 3.8 : 2.8;
          cliffBlocks.push({
            x: mx,
            y: (my + SEABED_Y) * 0.5 - 0.3,
            z: mz,
            sx: pierW,
            sy: my - SEABED_Y + 0.2,
            sz: pierW,
            color: 0x64748b,
          });
        } else {
          // Underside stone arch haunches curving between piers
          const archPhase = (s % 7) / 7;
          const archDrop = Math.pow(Math.abs(archPhase - 0.5) * 2, 1.8) * 3.8 + 1.2;
          cliffBlocks.push({
            x: mx,
            y: my - 0.6 - archDrop * 0.5,
            z: mz,
            sx: width * 0.78,
            sy: archDrop,
            sz: stepLen * 0.96,
            color: 0x475569,
          });
        }
      } else {
        const isRailBridge = br.id === 'bridge_portal';
        if (isRailBridge) {
          // 3m-wide wooden railway ties & twin steel rails running across bridge_portal (matching blueprint!)
          const tiePerpX = Math.cos(yaw) * 1.45;
          const tiePerpZ = -Math.sin(yaw) * 1.45;
          const railPerpX = Math.cos(yaw) * 1.05;
          const railPerpZ = -Math.sin(yaw) * 1.05;
          cliffBlocks.push({
            x: mx,
            y: my + 0.08,
            z: mz,
            sx: Math.abs(tiePerpX) * 2 + 0.45,
            sy: 0.14,
            sz: Math.abs(tiePerpZ) * 2 + 0.45,
            color: 0x78350f,
          });
          [-1, 1].forEach((side) => {
            cliffBlocks.push({
              x: mx + railPerpX * side,
              y: my + 0.18,
              z: mz + railPerpZ * side,
              sx: 0.22,
              sy: 0.16,
              sz: stepLen * 0.95,
              color: 0xcbd5e1,
            });
          });
        }
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
          const railColor = br.style === 'stone' ? 0x64748b : 0x78350f;
          const isGearBridge = br.id === 'bridge_menara';
          const railH = br.style === 'rope' || isGearBridge ? 1.15 : isRailBridge && s % 6 === 0 ? 3.2 : 0.78;
          [-1, 1].forEach((side) => {
            cliffBlocks.push({
              x: mx + perpX * side,
              y: my + railH * 0.5,
              z: mz + perpZ * side,
              sx: isRailBridge && s % 6 === 0 ? 0.52 : 0.28,
              sy: railH,
              sz: isRailBridge && s % 6 === 0 ? 0.52 : 0.28,
              color: railColor,
            });
            if (isGearBridge) {
              cliffBlocks.push({
                x: mx + perpX * side,
                y: my + railH + 0.08,
                z: mz + perpZ * side,
                sx: 0.24,
                sy: 0.2,
                sz: stepLen * 1.95,
                color: 0xb88a4c,
              });
            } else if (br.style === 'rope') {
              const ropeSag = Math.sin(tm * Math.PI) * 0.24;
              cliffBlocks.push({
                x: mx + perpX * side,
                y: my + railH + 0.06 - ropeSag,
                z: mz + perpZ * side,
                sx: 0.2,
                sy: 0.16,
                sz: stepLen * 2.05,
                color: 0xd4a373,
              });
            }
          });
          if (isRailBridge && s % 6 === 0) {
            // Stone overhead cross-lintel frame matching the bottom-left bridge in Gua Portal overview
            cliffBlocks.push({
              x: mx,
              y: my + 3.45,
              z: mz,
              sx: width * 0.98,
              sy: 0.58,
              sz: 0.68,
              color: 0x94a3b8,
            });
          }
        }

        if (s % 5 === 2 || isJumpEdge) {
          cliffBlocks.push({
            x: mx,
            y: (my + SEABED_Y) * 0.5 - 0.2,
            z: mz,
            sx: isRailBridge ? 2.2 : 1.65,
            sy: my - SEABED_Y + 0.2,
            sz: isRailBridge ? 2.2 : 1.65,
            color: br.style === 'stone' ? 0x475569 : 0x5c3a1e,
          });
        }
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
      const linkCount = pad.id === 'hub_chain_2' ? 11 : 7;
      for (let c = 0; c < linkCount; c++) {
        const link = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.62, 0.28), chainMat);
        link.position.set(pad.x, pad.y + 0.55 + c * 0.82, pad.z);
        link.rotation.y = c * 0.78;
        group.add(link);
      }
      const anchorBar = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.1, 2.1), cobbleMat);
      anchorBar.position.set(pad.x, pad.y + 0.55 + linkCount * 0.82 + 0.5, pad.z);
      anchorBar.castShadow = true;
      const anchorMoss = new THREE.Mesh(new THREE.BoxGeometry(2.16, 0.26, 2.16), palette.getMat(0x65a30d, 'matte'));
      anchorMoss.position.set(pad.x, pad.y + 0.55 + linkCount * 0.82 + 1.1, pad.z);
      group.add(anchorBar, anchorMoss);
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
  // 0. CITADEL RERUNTUHAN / CENTRAL HUB (0, -17, Panjang 125m)
  //    - Puncak Obelisk Rune: Tinggi 54m (34m Summit Plateau + 20m Plinth & Monolith!)
  //    - Kawah Lava Utama: 35m x 25m + Air Terjun Lava Kembar ke Laut
  //    - Tangga Batu Kuno: Lebar 6m + Menara Penjaga Runtuh + Lengkungan Bata
  // ============================================================================
  {
    const mossMat = palette.getMat(0x65a30d, 'matte');
    const stoneWeatheredMat = palette.getMat(0x94a3b8, 'matte');
    const stoneDarkMat = palette.getMat(0x475569, 'matte');
    const brickRuinsMat = palette.getMat(0xb45309, 'matte');
    const basaltMat = palette.getMat(0x292524, 'matte');
    const ruinVoxels: VoxelSpec[] = [];

    // 1. Kawah Lava Utama (35m x 25m) centered at (hx=+4.0, hz=+39.5 -> wx=+4.0, wz=+22.5)
    const craterCx = 4.0;
    const craterCz = 22.5;
    const lavaLake = new THREE.Mesh(new THREE.BoxGeometry(35.0, 0.55, 25.0), magmaCoreMat);
    lavaLake.position.set(craterCx, 2.38, craterCz);
    lavaMeshes.push(lavaLake);
    group.add(lavaLake);
    // Cooled black basalt crust islands floating atop the 35m x 25m molten basin
    [
      [-7.0, 17.5, 4.2, 3.0],
      [6.5, 20.0, 5.0, 3.4],
      [-2.0, 26.5, 3.8, 2.8],
      [12.5, 25.5, 3.6, 3.0],
      [1.0, 15.5, 3.2, 2.4],
    ].forEach(([cx, cz, sw, sd]) => {
      const crust = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.35, sd), basaltMat);
      crust.position.set(cx, 2.68, cz);
      group.add(crust);
    });
    // Safe rim obstacle covering the molten crater floor so hero patrols rim without sinking inside lava
    obstacles.push({ x: craterCx, z: craterCz, halfW: 16.2, halfD: 11.2 });

    // Upper Cliff Lava Feeder Cascade pouring into North Wall of Kawah Lava Utama
    [
      [6.5, 9.6, -2.0, 4.2, 1.8, 3.6],
      [6.5, 7.2, 1.4, 4.6, 4.2, 3.2],
      [6.5, 4.2, 5.0, 5.0, 4.4, 3.4],
      [6.5, 2.8, 8.8, 5.2, 1.4, 3.8],
    ].forEach(([lx, ly, lz, sx, sy, sz], i) => {
      const fall = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz),
        i % 2 === 0 ? magmaHotMat : magmaCoreMat,
      );
      fall.position.set(lx, ly, lz);
      lavaMeshes.push(fall);
      group.add(fall);
    });

    // Twin Front Sea-Cliff Lava Waterfalls pouring from Kawah Lava Utama front lip down into the ocean!
    [-7.5, 13.5].forEach((fx) => {
      [
        [fx, 2.3, 35.5, 4.4, 1.2, 3.2],
        [fx, 1.25, 38.2, 4.6, 2.2, 2.8],
        [fx, 0.32, 41.2, 5.2, 0.65, 3.8],
      ].forEach(([lx, ly, lz, sx, sy, sz], i) => {
        const wfall = new THREE.Mesh(
          new THREE.BoxGeometry(sx, sy, sz),
          i % 2 === 0 ? magmaHotMat : magmaCoreMat,
        );
        wfall.position.set(lx, ly, lz);
        lavaMeshes.push(wfall);
        group.add(wfall);
      });
    });

    // Jagged Dark Basalt Caldera Front Bastion Pier framing the twin waterfalls
    [
      [-15.5, 35.5, 3.4, 6.2, 3.4],
      [3.0, 36.0, 6.2, 6.8, 3.8],
      [22.5, 35.5, 3.4, 6.2, 3.4],
    ].forEach(([bx, bz, sw, sh, sd]) => {
      ruinVoxels.push({ x: bx, y: sh * 0.5, z: bz, sx: sw, sy: sh, sz: sd, color: 0x1c1917 });
    });

    // 2. Colossal Summit Rune Obelisk reaching exact Puncak 54.0m! (Base plateau = 34.0m at wx=0, wz=-59)
    const obX = 0.0;
    const obZ = -60.5;
    const obBaseY = 34.0;
    const obPlinth = new THREE.Mesh(new THREE.BoxGeometry(8.2, 2.0, 7.2), cobbleMat);
    obPlinth.position.set(obX, obBaseY + 1.0, obZ);
    obPlinth.castShadow = true;
    obPlinth.receiveShadow = true;
    const obLowerShaft = new THREE.Mesh(new THREE.BoxGeometry(5.6, 9.2, 4.4), stoneDarkMat);
    obLowerShaft.position.set(obX, obBaseY + 6.6, obZ);
    obLowerShaft.castShadow = true;
    const obUpperShaft = new THREE.Mesh(new THREE.BoxGeometry(4.8, 7.3, 3.8), stoneWeatheredMat);
    obUpperShaft.position.set(obX, obBaseY + 14.85, obZ);
    obUpperShaft.castShadow = true;
    const obCrownCap = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.5, 3.0), cobbleMat);
    obCrownCap.position.set(obX, obBaseY + 19.25, obZ); // Top exactly y = 34.0 + 20.0 = 54.0m!
    obCrownCap.castShadow = true;
    // Glowing Emissive Orange-Gold Vertical Runes etched onto Obelisk front & rear faces
    const runeGlyphLower = new THREE.Mesh(new THREE.BoxGeometry(1.1, 6.4, 4.58), magmaHotMat);
    runeGlyphLower.position.set(obX, obBaseY + 6.8, obZ);
    const runeGlyphUpper = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.0, 3.98), magmaCoreMat);
    runeGlyphUpper.position.set(obX, obBaseY + 15.0, obZ);
    const obMossCap = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.45, 2.8), mossMat);
    obMossCap.position.set(obX + 0.5, obBaseY + 17.8, obZ + 0.5);
    group.add(obPlinth, obLowerShaft, obUpperShaft, obCrownCap, runeGlyphLower, runeGlyphUpper, obMossCap);
    disposables.push(
      obPlinth.geometry,
      obLowerShaft.geometry,
      obUpperShaft.geometry,
      obCrownCap.geometry,
      runeGlyphLower.geometry,
      runeGlyphUpper.geometry,
      obMossCap.geometry,
    );
    obstacles.push({ x: obX, z: obZ, halfW: 4.1, halfD: 3.6 });

    // Twin Giant Flaming Brazier Pedestals flanking the Obelisk + Lower Courtyard Braziers
    [
      [-6.5, obZ + 2.5, obBaseY, 3.2, 1.5],
      [6.5, obZ + 2.5, obBaseY, 3.2, 1.5],
      [-5.8, -12.0, 6.0, 1.4, 0.85],
      [0.2, -12.0, 6.0, 1.4, 0.85],
    ].forEach(([tx, tz, baseH, pedH, flameScale]) => {
      const brazier = new THREE.Mesh(
        new THREE.BoxGeometry(1.35 * flameScale, pedH, 1.35 * flameScale),
        cobbleMat,
      );
      brazier.position.set(tx, baseH + pedH * 0.5, tz);
      brazier.castShadow = true;
      const flame = new THREE.Mesh(
        new THREE.BoxGeometry(0.95 * flameScale, 1.15 * flameScale, 0.95 * flameScale),
        magmaHotMat,
      );
      flame.position.set(tx, baseH + pedH + 0.65 * flameScale, tz);
      flame.userData.isFlame = true;
      torchesFlame.push(flame);
      group.add(brazier, flame);
      disposables.push(brazier.geometry, flame.geometry);
    });

    // 3. Low Ruined Stone Parapets flanking the 6m-wide Tangga Batu Kuno
    for (let s = 0; s < 10; s++) {
      const zStep = -11.5 - s * 1.95;
      const yStep = 6.5 + (s / 9) * 13.0;
      [-6.45, 0.45].forEach((px) => {
        ruinVoxels.push({ x: px, y: yStep + 0.45, z: zStep, sx: 0.75, sy: 1.0, sz: 1.55, color: 0x78716c });
      });
    }
    for (let s = 0; s < 9; s++) {
      const zStep = -35.5 - s * 2.0;
      const yStep = 20.5 + (s / 8) * 13.0;
      [-3.45, 3.45].forEach((px) => {
        ruinVoxels.push({ x: px, y: yStep + 0.45, z: zStep, sx: 0.75, sy: 1.0, sz: 1.55, color: 0x94a3b8 });
      });
    }

    // 4. Ruined East Citadel Watchtower Keep (wx=+25.0, wz=-34.0, ground y=14.0m -> top 36.0m)
    const wtX = 25.0;
    const wtZ = -34.0;
    const wtY = 14.0;
    // Open Arch Lower Keep Pillars (3.4m wide clear passage + stone tower above)
    [
      [-3.1, -3.1],
      [3.1, -3.1],
      [-3.1, 3.1],
      [3.1, 3.1],
    ].forEach(([ox, oz]) => {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(2.2, 5.2, 2.2), stoneDarkMat);
      pier.position.set(wtX + ox, wtY + 2.6, wtZ + oz);
      pier.castShadow = true;
      group.add(pier);
      obstacles.push({ x: wtX + ox, z: wtZ + oz, halfW: 1.15, halfD: 1.15 });
    });
    const wtBody = new THREE.Mesh(new THREE.BoxGeometry(7.6, 11.5, 7.6), cobbleMat);
    wtBody.position.set(wtX, wtY + 10.95, wtZ);
    wtBody.castShadow = true;
    const wtGallery = new THREE.Mesh(new THREE.BoxGeometry(9.0, 2.2, 9.0), stoneWeatheredMat);
    wtGallery.position.set(wtX, wtY + 17.6, wtZ);
    wtGallery.castShadow = true;
    const wtRoof = new THREE.Mesh(new THREE.BoxGeometry(6.8, 2.2, 6.8), stoneDarkMat);
    wtRoof.position.set(wtX, wtY + 19.8, wtZ);
    const wtCrown = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.4, 4.4), mossMat);
    wtCrown.position.set(wtX, wtY + 21.5, wtZ);
    group.add(wtBody, wtGallery, wtRoof, wtCrown);
    // Watchtower Crenellations & Mossy Overgrowth
    [-3.6, 0, 3.6].forEach((ox) => {
      [-3.6, 3.6].forEach((oz) => {
        ruinVoxels.push({ x: wtX + ox, y: wtY + 19.3, z: wtZ + oz, sx: 1.4, sy: 1.2, sz: 1.4, color: 0x94a3b8 });
      });
    });

    // 5. Ruined Terracotta-Brick Gateway Archways (West Obby Bastion & Mid-Cliff Overlook)
    const buildRuinedArch = (ax: number, ay: number, az: number, yaw: number, halfSpan: number, h: number) => {
      const archGrp = new THREE.Group();
      archGrp.position.set(ax, ay, az);
      archGrp.rotation.y = yaw;
      const pL = new THREE.Mesh(new THREE.BoxGeometry(1.9, h, 2.4), brickRuinsMat);
      pL.position.set(-halfSpan, h * 0.5, 0);
      pL.castShadow = true;
      const pR = new THREE.Mesh(new THREE.BoxGeometry(1.9, h - 0.6, 2.4), brickRuinsMat);
      pR.position.set(halfSpan, (h - 0.6) * 0.5, 0);
      pR.castShadow = true;
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(halfSpan * 2 + 2.4, 1.8, 2.5), stoneWeatheredMat);
      lintel.position.set(0, h + 0.5, 0);
      lintel.castShadow = true;
      const mossTop = new THREE.Mesh(new THREE.BoxGeometry(halfSpan * 1.4, 0.7, 2.6), mossMat);
      mossTop.position.set(-halfSpan * 0.2, h + 1.6, 0);
      archGrp.add(pL, pR, lintel, mossTop);
      group.add(archGrp);
      const cosA = Math.cos(yaw);
      const sinA = Math.sin(yaw);
      obstacles.push(
        { x: ax - cosA * halfSpan, z: az + sinA * halfSpan, halfW: 1.05, halfD: 1.05 },
        { x: ax + cosA * halfSpan, z: az - sinA * halfSpan, halfW: 1.05, halfD: 1.05 },
      );
    };
    // West Bastion Brick Archway framing the entrance to the 4m x 4m Floating Chain Obby
    buildRuinedArch(-34.0, 12.0, -20.0, Math.PI / 2, 3.2, 6.2);
    // Mid-Citadel Red Brick Ruin Arch beside Lower Courtyard Stairs
    buildRuinedArch(8.5, 6.0, -8.5, 0.25, 3.0, 5.8);

    // 6. Hanging Green Vines draping down Citadel Cliffs, Watchtower & Arches
    [
      [wtX - 4.4, wtY + 13.5, wtZ + 3.2, 6.5],
      [wtX + 4.4, wtY + 12.0, wtZ - 2.0, 7.2],
      [wtX - 2.0, wtY + 15.0, wtZ + 4.4, 5.8],
      [-32.5, 17.5, -23.0, 4.2],
      [11.0, 14.0, -10.5, 5.5],
      [-11.5, 29.0, -52.0, 6.0],
      [11.5, 29.0, -52.0, 6.0],
      [-4.0, 18.0, -32.0, 4.8],
    ].forEach(([vx, vy, vz, vh], i) => {
      ruinVoxels.push({
        x: vx,
        y: vy,
        z: vz,
        sx: 0.72,
        sy: vh,
        sz: 0.72,
        color: i % 2 === 0 ? 0x65a30d : 0x4d7c0f,
      });
    });

    // Timber Bridgehead Pylons flanking the 4m-wide Suspension Bridges (bridge_desa & bridge_satwa)
    [
      [-26.0, 33.0, 5.0, 0.26],
      [46.0, 16.0, 5.0, 0.74],
    ].forEach(([px, pz, py, pyaw]) => {
      const cosP = Math.cos(pyaw);
      const sinP = Math.sin(pyaw);
      [-2.25, 2.25].forEach((side) => {
        ruinVoxels.push({
          x: px + cosP * side,
          y: py + 1.4,
          z: pz - sinP * side,
          sx: 0.55,
          sy: 2.8,
          sz: 0.55,
          color: 0x78350f,
        });
      });
    });

    if (ruinVoxels.length > 0) {
      const ruinWhiteMat = palette.createSurfaceMat({ color: 0xffffff, roughness: 0.9 });
      const ruinBatch = buildVoxelBatch(ruinVoxels, ruinWhiteMat, true, true);
      group.add(ruinBatch);
      disposables.push(ruinBatch.geometry, ruinWhiteMat);
    }
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
  // 4. GERBANG KOTA ISLAND (cx=-118, cz=-98, Panjang 140m!)
  //    - Tinggi Tebing Kota: 36m | Benteng & Gerbang Kota: T: 28m
  //    - Sekolah Bata Merah: 28m x 18m (T: 15m) atop y=20m Courtyard
  //    - Terowongan Bawah Tanah: T: 12m / L: 14m (walkable!) + Jembatan Viaduk: Lebar 8m
  //    - Human-Proportional Vehicles (>= 3.45m tall, larger than 3.43m Hero!)
  // ============================================================================
  {
    const cx = -118.0;
    const cz = -98.0;
    const courtY = 20.0;
    const hwyY = 12.0;

    // 4a. Sekolah Bata Merah: Exact 28m x 18m (T: 15m -> y=20m to 35m!)
    const schoolX = cx - 3.0; // -121.0
    const schoolZ = cz - 28.0; // -126.0
    const school = new THREE.Group();
    school.position.set(schoolX, courtY, schoolZ);
    const brickMat = palette.getMat(0xb91c1c, 'matte');
    const brickTrimMat = palette.getMat(0xe2e8f0, 'matte');
    const roofTerraMat = palette.getMat(0x9a3412, 'matte');
    const roofDarkMat = palette.getMat(0x7c2d12, 'matte');
    const winMat = palette.getPixelMat('glass_pane', 0xe0f2fe);
    const darkFrameMat = palette.getMat(0x1e293b, 'matte');
    const concreteMat = palette.getMat(0x94a3b8, 'matte');

    // Concrete foundation plinth + front 2-step concrete stairs
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(28.6, 0.9, 18.6), concreteMat);
    plinth.position.y = 0.45;
    plinth.receiveShadow = true;
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.45, 2.2), concreteMat);
    step1.position.set(0, 0.22, 10.2);
    const step2 = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.85, 1.3), concreteMat);
    step2.position.set(0, 0.42, 9.6);

    // 2-story Red Brick Main Body (28m x 8.4m x 18m)
    const body = new THREE.Mesh(new THREE.BoxGeometry(28.0, 8.4, 18.0), brickMat);
    body.position.y = 5.1;
    body.castShadow = true;
    body.receiveShadow = true;
    const midBand = new THREE.Mesh(new THREE.BoxGeometry(28.3, 0.35, 18.3), brickTrimMat);
    midBand.position.y = 4.9;
    const corniceBand = new THREE.Mesh(new THREE.BoxGeometry(28.5, 0.42, 18.5), brickTrimMat);
    corniceBand.position.y = 9.2;

    // Recessed Stone Entrance Portico + Realistic Tall Double Doors (3.8m wide x 4.4m tall!)
    const portico = new THREE.Mesh(new THREE.BoxGeometry(6.8, 5.2, 1.2), concreteMat);
    portico.position.set(0, 3.0, 9.0);
    const doorRecess = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.4, 0.4), darkFrameMat);
    doorRecess.position.set(0, 2.6, 9.5);
    const doorWood = new THREE.Mesh(new THREE.BoxGeometry(3.8, 4.1, 0.46), spruceMat);
    doorWood.position.set(0, 2.55, 9.56);
    const doorMullion = new THREE.Mesh(new THREE.BoxGeometry(0.22, 4.1, 0.52), darkFrameMat);
    doorMullion.position.set(0, 2.55, 9.58);
    school.add(plinth, step1, step2, body, midBand, corniceBand, portico, doorRecess, doorWood, doorMullion);

    // Stepped Terracotta Pitched Roof (y=9.3m -> peak y=15.0m!) + Intersecting Central Front Gable + Clock!
    for (let t = 0; t < 6; t++) {
      const tierH = 0.95;
      const tierD = 19.6 - t * 2.8;
      const tier = new THREE.Mesh(
        new THREE.BoxGeometry(29.4, tierH, tierD),
        t % 2 === 0 ? roofTerraMat : roofDarkMat,
      );
      tier.position.y = 9.78 + t * 0.92;
      tier.castShadow = true;
      school.add(tier);
    }
    // Projecting Front Center Gable Wing (10.6m wide, climbing cleanly to T=15.0m!)
    const gableWall = new THREE.Mesh(new THREE.BoxGeometry(9.2, 3.8, 7.5), brickMat);
    gableWall.position.set(0, 11.2, 6.2);
    gableWall.castShadow = true;
    school.add(gableWall);
    for (let g = 0; g < 6; g++) {
      const gw = 10.6 - g * 1.6;
      const gr = new THREE.Mesh(
        new THREE.BoxGeometry(gw, 0.92, 9.4),
        g % 2 === 0 ? roofTerraMat : roofDarkMat,
      );
      gr.position.set(0, 9.85 + g * 0.92, 6.2);
      gr.castShadow = true;
      school.add(gr);
    }
    // Iconic Front Gable School Clock Face!
    const clockRim = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, 0.36, 16), darkFrameMat);
    clockRim.rotation.x = Math.PI / 2;
    clockRim.position.set(0, 11.8, 10.95);
    const clockDial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.98, 0.98, 0.42, 16),
      palette.createSurfaceMat({ color: 0xf8fafc, emissive: 0xfef3c7, emissiveIntensity: 0.25 }),
    );
    clockDial.rotation.x = Math.PI / 2;
    clockDial.position.set(0, 11.8, 10.96);
    const schoolClockHands = new THREE.Group();
    schoolClockHands.position.set(0, 11.8, 11.2);
    const chMin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.72, 0.12), darkFrameMat);
    chMin.position.y = 0.28;
    const chHr = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.14, 0.12), darkFrameMat);
    chHr.position.x = 0.18;
    schoolClockHands.add(chMin, chHr);
    clockHands.push(schoolClockHands);
    school.add(clockRim, clockDial, schoolClockHands);

    // 2-Story Window Grid along Front (+Z), Back (-Z), and Side Facades
    [-11.0, -7.2, -3.5, 3.5, 7.2, 11.0].forEach((wx) => {
      [2.8, 6.9].forEach((wy) => {
        if (wy < 4.5 && Math.abs(wx) < 4.2) return;
        [-9.06, 9.06].forEach((wz) => {
          const frame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.35, 0.24), darkFrameMat);
          frame.position.set(wx, wy, wz);
          const glass = new THREE.Mesh(new THREE.BoxGeometry(1.72, 1.95, 0.28), winMat);
          glass.position.set(wx, wy, wz);
          const sill = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.26, 0.44), brickTrimMat);
          sill.position.set(wx, wy - 1.22, wz);
          school.add(frame, glass, sill);
        });
      });
    });
    [-4.8, 0, 4.8].forEach((wz) => {
      [2.8, 6.9].forEach((wy) => {
        [-14.06, 14.06].forEach((wx) => {
          const frame = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.35, 2.1), darkFrameMat);
          frame.position.set(wx, wy, wz);
          const glass = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.95, 1.72), winMat);
          glass.position.set(wx, wy, wz);
          school.add(frame, glass);
        });
      });
    });
    group.add(school);
    obstacles.push({ x: schoolX, z: schoolZ, halfW: 14.3, halfD: 9.4 });

    // 4b. Benteng & Gerbang Kota (T: 28m -> walls from courtY=20m up to y=28m, towers up to 30.5m!)
    const wallLight = 0xcbd5e1;
    const wallMid = 0x94a3b8;
    const wallDark = 0x64748b;
    const addFortWallSegment = (wx: number, wz: number, lenX: number, lenZ: number, wallH = 8.0) => {
      cliffBlocks.push({
        x: wx,
        y: courtY + wallH * 0.5 - 0.5,
        z: wz,
        sx: lenX,
        sy: wallH + 1.0,
        sz: lenZ,
        color: wallMid,
      });
      // Top stone parapet ledge + voxel crenellations reaching T=28.0..29.2m!
      const isEastWest = lenX >= lenZ;
      const span = isEastWest ? lenX : lenZ;
      for (let off = -span * 0.5 + 1.2; off <= span * 0.5 - 1.2; off += 2.6) {
        cliffBlocks.push({
          x: isEastWest ? wx + off : wx,
          y: courtY + wallH + 0.65,
          z: isEastWest ? wz : wz + off,
          sx: isEastWest ? 1.25 : lenX * 0.72,
          sy: 1.3,
          sz: isEastWest ? lenZ * 0.72 : 1.25,
          color: wallLight,
        });
      }
    };
    const addWatchTower = (tx: number, tz: number, size = 5.0, height = 10.4) => {
      cliffBlocks.push({
        x: tx,
        y: courtY + height * 0.5 - 1.0,
        z: tz,
        sx: size,
        sy: height + 2.0,
        sz: size,
        color: wallMid,
      });
      cliffBlocks.push({
        x: tx,
        y: courtY + height + 0.35,
        z: tz,
        sx: size + 0.8,
        sy: 0.9,
        sz: size + 0.8,
        color: wallDark,
      });
      const half = size * 0.48;
      [[-half, -half], [half, -half], [-half, half], [half, half], [0, -half], [0, half], [-half, 0], [half, 0]].forEach(([mx, mz]) => {
        cliffBlocks.push({
          x: tx + mx,
          y: courtY + height + 1.35,
          z: tz + mz,
          sx: 1.15,
          sy: 1.15,
          sz: 1.15,
          color: wallLight,
        });
      });
    };

    const fWest = cx - 28.0; // -146
    const fEast = cx + 26.0; // -92
    const fNorth = cz - 44.0; // -142
    const fSouth = cz - 4.0; // -102
    const fMidX = (fWest + fEast) * 0.5; // -119

    // North, West, East fortress perimeter walls (y=20 -> 28m!)
    addFortWallSegment(fMidX, fNorth, fEast - fWest + 2.0, 2.4, 8.0);
    addFortWallSegment(fWest, (fNorth + fSouth) * 0.5, 2.4, fSouth - fNorth, 8.0);
    addFortWallSegment(fEast, (fNorth + fSouth) * 0.5, 2.4, fSouth - fNorth, 8.0);
    // South front walls flanking the 9m-wide City Gate opening (x=-125.5..-112.5)
    addFortWallSegment(-136.0, fSouth, 20.0, 2.4, 8.0);
    addFortWallSegment(-102.0, fSouth, 20.0, 2.4, 8.0);

    // Substructure retaining stone wall beneath the front South Benteng face down to the y=12m highway plaza
    cliffBlocks.push({ x: -136.0, y: 16.0, z: fSouth, sx: 20.0, sy: 8.4, sz: 2.8, color: wallDark });
    cliffBlocks.push({ x: -102.0, y: 16.0, z: fSouth, sx: 20.0, sy: 8.4, sz: 2.8, color: wallDark });

    // 4 Corner Watchtowers + Twin Gatehouse Towers (T=30.5m!)
    addWatchTower(fWest, fNorth, 5.2, 10.2);
    addWatchTower(fEast, fNorth, 5.2, 10.2);
    addWatchTower(fWest, fSouth, 5.2, 10.2);
    addWatchTower(fEast, fSouth, 5.2, 10.2);
    addWatchTower(-125.5, fSouth, 4.8, 10.6);
    addWatchTower(-112.5, fSouth, 4.8, 10.6);

    // Tall Substructure Bases under Gatehouse Towers down to y=12m plaza
    cliffBlocks.push({ x: -125.5, y: 16.0, z: fSouth, sx: 5.0, sy: 8.4, sz: 5.0, color: wallDark });
    cliffBlocks.push({ x: -112.5, y: 16.0, z: fSouth, sx: 5.0, sy: 8.4, sz: 5.0, color: wallDark });

    // Twin Red Exclamation [!] Warning Sign Plaques mounted on front of Gatehouse Towers (matching image!)
    const signWhiteMat = palette.getMat(0xf8fafc, 'matte');
    const signRedMat = palette.getMat(0xdc2626, 'emissive');
    [-125.5, -112.5].forEach((gx) => {
      const board = new THREE.Mesh(new THREE.BoxGeometry(1.9, 3.2, 0.25), signRedMat);
      board.position.set(gx, 22.8, fSouth + 2.65);
      const inner = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.75, 0.28), signWhiteMat);
      inner.position.set(gx, 22.8, fSouth + 2.68);
      const exclBar = new THREE.Mesh(new THREE.BoxGeometry(0.36, 1.35, 0.34), signRedMat);
      exclBar.position.set(gx, 23.25, fSouth + 2.71);
      const exclDot = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.34), signRedMat);
      exclDot.position.set(gx, 22.0, fSouth + 2.71);
      group.add(board, inner, exclBar, exclDot);
    });

    // Open Double Black Iron Gates flanking the walkable City Gate Ramp (x=-123.1..-114.9 stays WIDE OPEN!)
    const ironMat = palette.getMat(0x0f172a, 'metal');
    [-1, 1].forEach((side) => {
      const gateLeaf = new THREE.Group();
      gateLeaf.position.set(-119.0 + side * 4.3, 18.2, fSouth);
      gateLeaf.rotation.y = side * 1.15; // swung open cleanly inside the gatehouse throat!
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.32, 0.24), ironMat);
      topRail.position.set(-side * 1.7, 7.2, 0);
      const botRail = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.32, 0.24), ironMat);
      botRail.position.set(-side * 1.7, 0.6, 0);
      gateLeaf.add(topRail, botRail);
      for (let b = 0; b < 5; b++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 7.4, 0.22), ironMat);
        bar.position.set(-side * (0.35 + b * 0.72), 3.7, 0);
        gateLeaf.add(bar);
      }
      group.add(gateLeaf);
    });

    // Stone arch lintel spanning high above the twin iron gates (y=26.5..28.5m, 8.5m clearance above ramp!)
    cliffBlocks.push({ x: -119.0, y: 27.6, z: fSouth, sx: 8.8, sy: 1.8, sz: 2.6, color: wallLight });

    // Fortress Wall & Watchtower Colliders (keeping City Gate Ramp x=-123.1..-114.9 unobstructed!)
    obstacles.push(
      { x: fMidX, z: fNorth, halfW: 28.0, halfD: 1.6 },
      { x: fWest, z: (fNorth + fSouth) * 0.5, halfW: 1.6, halfD: 21.0 },
      { x: fEast, z: (fNorth + fSouth) * 0.5, halfW: 1.6, halfD: 21.0 },
      { x: -136.0, z: fSouth, halfW: 10.4, halfD: 1.6 },
      { x: -102.0, z: fSouth, halfW: 10.4, halfD: 1.6 },
      { x: -125.5, z: fSouth, halfW: 2.5, halfD: 2.5 },
      { x: -112.5, z: fSouth, halfW: 2.5, halfD: 2.5 },
    );

    // Courtyard Voxel Oak Trees & Shrubs flanking Sekolah Bata Merah
    [
      [-140.0, -110.0, 4.4, 4.2],
      [-139.0, -133.0, 4.8, 4.4],
      [-100.0, -112.0, 4.6, 4.2],
      [-99.5, -132.0, 4.2, 4.0],
    ].forEach(([tx, tz, th, cw], ti) => {
      cliffBlocks.push({ x: tx, y: courtY + th * 0.5, z: tz, sx: 1.0, sy: th, sz: 1.0, color: 0x5c3a1e });
      obstacles.push({ x: tx, z: tz, halfW: 0.75, halfD: 0.75 });
      walkableTopBlocks.push({
        x: tx,
        y: courtY + th + 0.9,
        z: tz,
        sx: cw,
        sy: 1.8,
        sz: cw,
        color: ti % 2 === 0 ? 0x22c55e : 0x65a30d,
      });
      walkableTopBlocks.push({
        x: tx,
        y: courtY + th + 2.4,
        z: tz,
        sx: cw * 0.68,
        sy: 1.4,
        sz: cw * 0.68,
        color: 0x4ade80,
      });
    });

    // White & Blue Police Patrol SUV parked inside the Fortress Courtyard (6.4m x 3.1m x 3.95m!)
    const policeCar = createVoxelCar(palette, 0xf8fafc, 'police');
    policeCar.position.set(-127.0, courtY + 0.04, -109.5);
    policeCar.rotation.y = -0.35;
    group.add(policeCar);
    obstacles.push({ x: -127.0, z: -109.5, halfW: 2.9, halfD: 2.9 });

    // 4c. Terowongan Bawah Tanah (T: 12m / L: 14m) + 36m Cliff Overburden + Twin Traffic Lights!
    //     Tunnel Bore runs x=-172 to x=-138, z=-93 to z=-79 (14m wide!) at floor y=12m, ceiling y=24m!
    const tunX0 = cx - 54.0; // -172
    const tunX1 = cx - 20.0; // -138
    const tunLen = tunX1 - tunX0; // 34m
    const tunMidX = (tunX0 + tunX1) * 0.5; // -155
    const tunZ = cz + 12.0; // -86.0

    // Inner stone tunnel side walls (outside the 14m roadway -> z=-94.5 & z=-77.5)
    [-94.6, -77.4].forEach((tz) => {
      cliffBlocks.push({ x: tunMidX, y: hwyY + 6.2, z: tz, sx: tunLen, sy: 12.8, sz: 2.8, color: 0x334155 });
      obstacles.push({ x: tunMidX, z: tz, halfW: tunLen * 0.5 + 0.4, halfD: 1.4 });
    });

    // Dark tunnel vault ceiling (y=24.0m..26.0m -> exact 12m clear height above road!) + West & East Stone Arch Portal Frames
    cliffBlocks.push({ x: tunMidX, y: hwyY + 12.8, z: tunZ, sx: tunLen + 2.0, sy: 1.8, sz: 18.6, color: 0x1e293b });
    [tunX0, tunX1].forEach((px) => {
      // Stepped arched stone portal collar (18m outer width x 14m outer height framing the 14m x 12m bore!)
      cliffBlocks.push({ x: px, y: hwyY + 6.5, z: tunZ - 8.4, sx: 2.6, sy: 13.0, sz: 2.8, color: 0x475569 });
      cliffBlocks.push({ x: px, y: hwyY + 6.5, z: tunZ + 8.4, sx: 2.6, sy: 13.0, sz: 2.8, color: 0x475569 });
      cliffBlocks.push({ x: px, y: hwyY + 12.6, z: tunZ, sx: 3.0, sy: 2.4, sz: 19.6, color: 0x64748b });
      cliffBlocks.push({ x: px, y: hwyY + 14.3, z: tunZ, sx: 2.6, sy: 1.4, sz: 15.0, color: 0x94a3b8 });
    });

    // Towering 36m Mountain Cliff Overburden directly above the Tunnel (y=25.5m -> 36.0m!)
    // Built cleanly above the 12m tunnel clearance so Hero walks freely underneath!
    cliffBlocks.push({ x: tunMidX, y: 29.8, z: tunZ, sx: tunLen + 1.5, sy: 8.8, sz: 18.4, color: 0x64748b });
    walkableTopBlocks.push({ x: tunMidX, y: 34.8, z: tunZ, sx: tunLen + 1.5, sy: 1.4, sz: 18.4, color: 0x65a30d });
    cliffBlocks.push({ x: tunMidX - 4.0, y: 35.6, z: tunZ - 2.0, sx: 22.0, sy: 1.2, sz: 12.0, color: 0x4d7c0f });

    // Twin 6.5m-tall Traffic Lights flanking West Tunnel Portal (matching image!)
    const poleMat = palette.getMat(0x1e293b, 'metal');
    const tlRedMat = palette.getMat(0xef4444, 'emissive');
    const tlYelMat = palette.getMat(0xfacc15, 'emissive');
    const tlGrnMat = palette.getMat(0x22c55e, 'emissive');
    [-93.2, -78.8].forEach((tz) => {
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.45, 6.4, 0.45), poleMat);
      pole.position.set(tunX0 - 1.6, hwyY + 3.2, tz);
      pole.castShadow = true;
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.3, 0.85), poleMat);
      box.position.set(tunX0 - 1.6, hwyY + 5.6, tz);
      const redL = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.48, 0.48), tlRedMat);
      redL.position.set(tunX0 - 1.6, hwyY + 6.25, tz);
      const yelL = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.48, 0.48), tlYelMat);
      yelL.position.set(tunX0 - 1.6, hwyY + 5.6, tz);
      const grnL = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.48, 0.48), tlGrnMat);
      grnL.position.set(tunX0 - 1.6, hwyY + 4.95, tz);
      group.add(pole, box, redL, yelL, grnL);
    });

    // Dashed white road centerline markings & roadside stone curbs across the 14m Lower City Highway
    for (let rx = tunX0 + 2; rx <= cx + 44; rx += 5.0) {
      cliffBlocks.push({ x: rx, y: hwyY + 0.04, z: tunZ, sx: 2.5, sy: 0.08, sz: 0.44, color: 0xf8fafc });
    }
    // Lower Highway Cliff Trees & Grassy Shoulder Islands (matching image!)
    [
      [-103.5, -75.0, 4.2, 4.0],
      [-86.0, -76.5, 4.5, 4.2],
      [-81.0, -96.5, 4.8, 4.4],
    ].forEach(([tx, tz, th, cw], ti) => {
      const ty = getArchipelagoGroundY(tx, tz);
      if (ty < 8.0) return;
      cliffBlocks.push({ x: tx, y: ty + th * 0.5, z: tz, sx: 0.95, sy: th, sz: 0.95, color: 0x5c3a1e });
      obstacles.push({ x: tx, z: tz, halfW: 0.65, halfD: 0.65 });
      walkableTopBlocks.push({ x: tx, y: ty + th + 0.85, z: tz, sx: cw, sy: 1.7, sz: cw, color: ti % 2 === 0 ? 0x22c55e : 0x65a30d });
      walkableTopBlocks.push({ x: tx, y: ty + th + 2.2, z: tz, sx: cw * 0.65, sy: 1.2, sz: cw * 0.65, color: 0x4ade80 });
    });

    // Small background wooden pier off NE Gerbang Kota cliff (visible on far right of level design image!)
    walkableTopBlocks.push({ x: -46.0, y: 0.45, z: -112.0, sx: 10.0, sy: 0.35, sz: 4.5, color: 0xb88a4c });
    [[-50, -113.8], [-42, -113.8], [-50, -110.2], [-42, -110.2]].forEach(([px, pz]) => {
      cliffBlocks.push({ x: px, y: 0.25, z: pz, sx: 0.45, sy: 2.4, sz: 0.45, color: 0x5c3a1e });
    });

    // 4d. Human-Proportional Vehicles on the 14m Lower City Highway (ALL >= Hero height!)
    [
      { z: tunZ + 3.5, color: 0x2563eb, variant: 'sedan' as const, baseX: -152.0, range: 38.0, speed: 0.24, phase: 0.4 },
      { z: tunZ - 3.5, color: 0xfacc15, variant: 'taxi' as const, baseX: -134.0, range: 34.0, speed: 0.28, phase: 2.6 },
      { z: tunZ - 3.6, color: 0xdc2626, variant: 'bus' as const, baseX: -92.0, range: 15.0, speed: 0.22, phase: 4.2 },
      { z: tunZ + 3.4, color: 0xf97316, variant: 'sedan' as const, baseX: -90.0, range: 14.0, speed: 0.26, phase: 1.1 },
    ].forEach((cfg) => {
      const car = createVoxelCar(palette, cfg.color, cfg.variant);
      car.position.set(cfg.baseX, hwyY + 0.06, cfg.z);
      group.add(car);
      cars.push({ mesh: car, baseX: cfg.baseX, rangeX: cfg.range, speed: cfg.speed, phase: cfg.phase });
    });
  }

  // ============================================================================
  // ============================================================================
  // 5. MENARA WAKTU ISLAND (cx=148, cz=-92, Panjang 130m!)
  //    - Tinggi Puncak Menara: 58m (32m Hill Summit + 26m Menara Jam Utama!)
  //    - Menara Jam Utama: T: 26m / L: 12m (4 giant clock dials + golden spire)
  //    - Roda Gigi Raksasa: Diameter 14m (interlocking open-spoked golden gears)
  //    - Terowongan Kronos: T: 14m / L: 16m (vaulted stone cliff tunnel on SE flank)
  //    - Jembatan Roda Gigi: Lebar 5m + Twin Bridgehead Gears + Time Pavilion
  // ============================================================================
  {
    const mCx = 148.0;
    const mCz = -92.0;
    const goldGearMat = palette.getMat(0xfacc15, 'metal');
    const goldTrimMat = palette.getMat(0xeab308, 'metal');
    const darkGearMat = palette.getMat(0x78350f, 'metal');
    const towerStoneL = palette.getMat(0xcbd5e1, 'matte');
    const towerStoneM = palette.getMat(0x94a3b8, 'matte');
    const towerStoneD = palette.getMat(0x64748b, 'matte');

    // 5a. Menara Jam Utama (L: 12m x 12m footprint, T: 26m height -> 32m + 26m = 58.0m Summit!)
    const towerX = mCx + 8.0; // 156.0
    const towerZ = mCz - 16.0; // -108.0
    const towerY = 32.0; // Exact 32.0m Summit Courtyard
    const clockTower = new THREE.Group();
    clockTower.position.set(towerX, towerY, towerZ);

    // Base Ashlar Plinth & Vaulted Ground Portals (y = 0..7.5m, 12.0m x 12.0m)
    const ctBaseStep = new THREE.Mesh(new THREE.BoxGeometry(12.0, 1.2, 12.0), towerStoneM);
    ctBaseStep.position.y = 0.6;
    ctBaseStep.castShadow = true;
    const ctGroundCore = new THREE.Mesh(new THREE.BoxGeometry(10.8, 6.4, 10.8), towerStoneL);
    ctGroundCore.position.y = 4.4;
    ctGroundCore.castShadow = true;
    clockTower.add(ctBaseStep, ctGroundCore);

    // 4 Golden Corner Pilasters rising up the main tower shaft (y = 1.2..20.4m)
    [[-5.2, -5.2], [5.2, -5.2], [-5.2, 5.2], [5.2, 5.2]].forEach(([px, pz]) => {
      const pilaster = new THREE.Mesh(new THREE.BoxGeometry(1.4, 19.2, 1.4), goldTrimMat);
      pilaster.position.set(px, 10.8, pz);
      pilaster.castShadow = true;
      clockTower.add(pilaster);
    });

    // Arched Ground-Floor Doorway Recesses on all 4 cardinal sides (gold frame + dark interior)
    [
      [0, 0, 5.45, 0],
      [0, 0, -5.45, Math.PI],
      [5.45, 0, 0, Math.PI / 2],
      [-5.45, 0, 0, -Math.PI / 2],
    ].forEach(([dx, , dz, ry]) => {
      const doorGrp = new THREE.Group();
      doorGrp.position.set(dx, 0, dz);
      doorGrp.rotation.y = ry;
      const archVoid = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.4, 0.55), palette.getMat(0x0f172a, 'matte'));
      archVoid.position.set(0, 2.8, 0);
      const archGoldL = new THREE.Mesh(new THREE.BoxGeometry(0.65, 4.8, 0.72), goldTrimMat);
      archGoldL.position.set(-1.9, 3.0, 0);
      const archGoldR = archGoldL.clone();
      archGoldR.position.set(1.9, 3.0, 0);
      const archGoldTop = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.8, 0.78), goldTrimMat);
      archGoldTop.position.set(0, 5.3, 0);
      doorGrp.add(archVoid, archGoldL, archGoldR, archGoldTop);
      clockTower.add(doorGrp);
    });

    // Middle Shaft + Gold Belt Cornices (y = 7.6..13.8m)
    const ctBelt1 = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.75, 11.8), goldTrimMat);
    ctBelt1.position.y = 7.8;
    const ctShaft = new THREE.Mesh(new THREE.BoxGeometry(10.0, 5.8, 10.0), towerStoneM);
    ctShaft.position.y = 11.0;
    ctShaft.castShadow = true;
    // Recessed tall gothic window slits on each middle face
    [
      [0, 11.0, 5.08, 0],
      [0, 11.0, -5.08, Math.PI],
      [5.08, 11.0, 0, Math.PI / 2],
      [-5.08, 11.0, 0, -Math.PI / 2],
    ].forEach(([wx, wy, wz, ry]) => {
      const slit = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.6, 0.28), palette.getMat(0x1e293b, 'matte'));
      slit.position.set(wx, wy, wz);
      slit.rotation.y = ry;
      clockTower.add(slit);
    });

    // Clock Belfry Chamber (y = 13.9..20.5m, 10.8m x 10.8m) + Upper Golden Parapet Cornice
    const ctBelt2 = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.75, 11.6), goldTrimMat);
    ctBelt2.position.y = 14.0;
    const ctBelfry = new THREE.Mesh(new THREE.BoxGeometry(10.8, 6.4, 10.8), towerStoneL);
    ctBelfry.position.y = 17.3;
    ctBelfry.castShadow = true;
    const ctRoofCornice = new THREE.Mesh(new THREE.BoxGeometry(11.9, 0.85, 11.9), goldTrimMat);
    ctRoofCornice.position.y = 20.6;
    clockTower.add(ctBelt1, ctShaft, ctBelt2, ctBelfry, ctRoofCornice);

    // 4 Giant Circular Cream Clock Dials (diameter 5.4m) with Golden Bezels, Tick Marks & Animated Hands!
    const dialMat = palette.createSurfaceMat({
      color: 0xfef9c3,
      emissive: 0xfde047,
      emissiveIntensity: 0.34,
      roughness: 0.28,
    });
    disposables.push(dialMat);
    const dialGeo = new THREE.CylinderGeometry(2.55, 2.55, 0.28, 20);
    const bezelGeo = new THREE.TorusGeometry(2.65, 0.32, 8, 20);
    const tickGeo = new THREE.BoxGeometry(0.16, 0.38, 0.14);
    const handLongGeo = new THREE.BoxGeometry(0.24, 1.85, 0.22);
    const handShortGeo = new THREE.BoxGeometry(0.26, 1.15, 0.22);
    disposables.push(dialGeo, bezelGeo, tickGeo, handLongGeo, handShortGeo);

    [
      [0, 17.3, 5.52, 0],
      [-5.52, 17.3, 0, -Math.PI / 2],
      [5.52, 17.3, 0, Math.PI / 2],
      [0, 17.3, -5.52, Math.PI],
    ].forEach(([dx, dy, dz, ry]) => {
      const faceGrp = new THREE.Group();
      faceGrp.position.set(dx, dy, dz);
      faceGrp.rotation.y = ry;
      const dial = new THREE.Mesh(dialGeo, dialMat);
      dial.rotation.x = Math.PI / 2;
      const bezel = new THREE.Mesh(bezelGeo, goldGearMat);
      bezel.position.z = 0.08;
      faceGrp.add(dial, bezel);
      for (let t = 0; t < 12; t++) {
        const a = (t / 12) * Math.PI * 2;
        const tick = new THREE.Mesh(tickGeo, darkGearMat);
        tick.position.set(Math.sin(a) * 2.08, Math.cos(a) * 2.08, 0.16);
        tick.rotation.z = -a;
        faceGrp.add(tick);
      }
      const handGroup = new THREE.Group();
      handGroup.position.set(0, 0, 0.22);
      const minuteHand = new THREE.Mesh(handLongGeo, palette.getMat(0x1e293b, 'matte'));
      minuteHand.position.set(0, 0.72, 0);
      const hourHand = new THREE.Mesh(handShortGeo, palette.getMat(0x0f172a, 'matte'));
      hourHand.position.set(0.45, 0.22, 0.06);
      hourHand.rotation.z = -Math.PI * 0.35;
      handGroup.add(minuteHand, hourHand);
      faceGrp.add(handGroup);
      clockTower.add(faceGrp);
      clockHands.push(handGroup);
    });

    // Stepped Stone & Golden Spire reaching exact T = 26.0m above plateau (58.0m world peak!)
    [
      [8.6, 1.35, 21.7, towerStoneD],
      [6.4, 1.35, 23.0, goldTrimMat],
      [4.2, 1.3, 24.25, towerStoneD],
      [1.8, 0.9, 25.2, goldGearMat],
    ].forEach(([w, h, y, mat]) => {
      const tier = new THREE.Mesh(new THREE.BoxGeometry(w as number, h as number, w as number), mat as THREE.Material);
      tier.position.y = y as number;
      tier.castShadow = true;
      clockTower.add(tier);
    });
    const spireNeedle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.55, 1.6, 6), goldGearMat);
    spireNeedle.position.y = 25.2; // tip reaches 26.0m local -> 58.0m exact!
    clockTower.add(spireNeedle);

    group.add(clockTower);
    obstacles.push({ x: towerX, z: towerZ, halfW: 6.1, halfD: 6.1 });

    // 5b. Roda Gigi Raksasa (Diameter 14m -> r=6.4..6.8!) + Counter-Rotating Clockwork Wheels
    [
      // Giant 14m East Hillside Gear towering beside Menara Jam Utama
      { x: mCx + 24.0, y: 24.5, z: mCz - 10.0, ry: -0.32, r: 6.4, teeth: 14, spd: 0.42 },
      // Giant 14m Terowongan Kronos Crown Arch Gear framing tunnel roof
      { x: mCx + 28.0, y: 12.8, z: mCz + 28.0, ry: 0.28, r: 6.4, teeth: 14, spd: -0.38 },
      // Giant 14m SE Cliff Gear flanking Terowongan Kronos left shoulder
      { x: mCx + 15.5, y: 11.8, z: mCz + 23.0, ry: 0.45, r: 6.3, teeth: 14, spd: 0.44 },
      // Giant 14m NW Rear Cliff Gear visible behind left ridge
      { x: mCx - 20.0, y: 23.5, z: mCz - 18.0, ry: 0.52, r: 6.2, teeth: 14, spd: -0.4 },
      // Interlocking Secondary Gears (Diameter 8m - 10m)
      { x: mCx + 27.0, y: 16.5, z: mCz + 6.0, ry: -0.15, r: 4.2, teeth: 10, spd: -0.62 },
      { x: mCx + 18.0, y: 17.8, z: mCz + 12.0, ry: 0.22, r: 3.6, teeth: 10, spd: 0.72 },
      { x: mCx - 12.0, y: 26.5, z: mCz - 24.0, ry: 0.12, r: 4.5, teeth: 10, spd: 0.56 },
      // Twin Bridgehead Gears (Diameter 7.6m) flanking Jembatan Roda Gigi: Lebar 5m at (94, -66)!
      { x: 91.5, y: 11.4, z: -61.5, ry: 0.94, r: 3.6, teeth: 10, spd: 0.65 },
      { x: 96.5, y: 11.4, z: -70.5, ry: 0.94, r: 3.6, teeth: 10, spd: -0.65 },
    ].forEach((g) => {
      const mesh = createToothedGear(g.r, 0.95, g.teeth, goldGearMat, darkGearMat, disposables);
      mesh.position.set(g.x, g.y, g.z);
      mesh.rotation.y = g.ry;
      group.add(mesh);
      gears.push({ mesh, speed: g.spd });
    });

    // Twin Heavy Timber Gate Columns framing Jembatan Roda Gigi Entrance at (94, -66)
    [
      [91.8, -62.5],
      [96.2, -69.5],
    ].forEach(([gx, gz]) => {
      cliffBlocks.push({ x: gx, y: 9.8, z: gz, sx: 1.4, sy: 6.8, sz: 1.4, color: 0x5c3a1e });
      obstacles.push({ x: gx, z: gz, halfW: 0.85, halfD: 0.85 });
    });

    // 5c. Classical Stone & Gold Time Pavilion ("Bangunan Penjaga Waktu") on West Terrace (108, 10.0, -90)
    const pavX = mCx - 40.0; // 108.0
    const pavZ = mCz + 2.0; // -90.0
    const pavY = 10.0;
    cliffBlocks.push({ x: pavX, y: pavY + 0.45, z: pavZ, sx: 9.2, sy: 0.9, sz: 9.2, color: 0x94a3b8 });
    cliffBlocks.push({ x: pavX, y: pavY + 3.2, z: pavZ, sx: 7.6, sy: 4.8, sz: 7.6, color: 0xcbd5e1 });
    cliffBlocks.push({ x: pavX, y: pavY + 5.8, z: pavZ, sx: 8.8, sy: 0.8, sz: 8.8, color: 0xeab308 });
    cliffBlocks.push({ x: pavX, y: pavY + 6.9, z: pavZ, sx: 5.6, sy: 1.4, sz: 5.6, color: 0x64748b });
    cliffBlocks.push({ x: pavX, y: pavY + 7.9, z: pavZ, sx: 3.2, sy: 0.9, sz: 3.2, color: 0xfacc15 });
    const pavDoor = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 0.45), palette.getMat(0x1e293b, 'matte'));
    pavDoor.position.set(pavX + 3.9, pavY + 2.5, pavZ + 1.5);
    pavDoor.rotation.y = Math.PI / 2;
    group.add(pavDoor);
    obstacles.push({ x: pavX, z: pavZ, halfW: 4.7, halfD: 4.7 });

    // Human-proportional wooden mining/clockwork crates near Pavilion & Bridge Plaza
    [
      [mCx - 36.0, mCz + 11.0, 1.15],
      [mCx - 34.4, mCz + 12.2, 0.95],
      [mCx - 26.0, mCz + 25.0, 1.2],
    ].forEach(([bx, bz, bs]) => {
      const by = getArchipelagoGroundY(bx, bz);
      cliffBlocks.push({ x: bx, y: by + bs * 0.5, z: bz, sx: bs, sy: bs, sz: bs, color: 0xb45309 });
      obstacles.push({ x: bx, z: bz, halfW: bs * 0.55, halfD: bs * 0.55 });
    });

    // 5d. Terowongan Kronos (T: 14m / L: 16m!) on South-East Cliff Face (wx=176, wz=-60 -> lx=+28, lz=+32)
    //     Clear 16m wide x 14m tall vaulted stone tunnel opening with grassy cliff overburden above!
    const tkX = mCx + 28.0; // 176.0
    const tkZ = mCz + 32.0; // -60.0
    const tkFloorY = 2.0;
    const tkYaw = 0.28;
    const cosK = Math.cos(tkYaw);
    const sinK = Math.sin(tkYaw);
    const pushTunnelBox = (lx: number, ly: number, lz: number, sx: number, sy: number, sz: number, color: number) => {
      const wx = tkX + lx * cosK + lz * sinK;
      const wz = tkZ - lx * sinK + lz * cosK;
      cliffBlocks.push({ x: wx, y: tkFloorY + ly, z: wz, sx, sy, sz, color });
    };
    const tkStoneD = 0x475569;
    const tkStoneM = 0x64748b;
    const tkStoneL = 0x94a3b8;
    // Twin massive stone vault side piers flanking clear 16m bore (lx = ±9.6 -> 16.0m inside clearance!)
    [-9.6, 9.6].forEach((px) => {
      pushTunnelBox(px, 5.5, 0, 3.2, 11.0, 11.5, tkStoneM);
      pushTunnelBox(px + (px < 0 ? 1.0 : -1.0), 10.6, 0.5, 2.2, 2.4, 11.0, tkStoneL);
    });
    // Stepped Vaulted Stone Arch Crown rising to T = 14.0m inside clearance!
    pushTunnelBox(-6.6, 12.6, 0.4, 4.6, 2.4, 11.5, tkStoneL);
    pushTunnelBox(6.6, 12.6, 0.4, 4.6, 2.4, 11.5, tkStoneL);
    pushTunnelBox(-3.2, 14.2, 0.4, 4.4, 2.2, 11.5, tkStoneM);
    pushTunnelBox(3.2, 14.2, 0.4, 4.4, 2.2, 11.5, tkStoneM);
    pushTunnelBox(0, 15.2, 0.4, 6.8, 2.2, 12.0, tkStoneD);
    // Natural emerald grass & cliff overburden resting atop Terowongan Kronos (y = 18m..23m)
    cliffBlocks.push({ x: tkX - 1.5 * sinK, y: tkFloorY + 17.5, z: tkZ - 1.5 * cosK, sx: 20.0, sy: 3.4, sz: 12.5, color: 0x78543a });
    walkableTopBlocks.push({ x: tkX - 1.5 * sinK, y: tkFloorY + 19.6, z: tkZ - 1.5 * cosK, sx: 20.0, sy: 1.0, sz: 12.5, color: 0x65a30d });

    // Deep Dark Interior & Glowing Golden Time-Cave Floor inside Terowongan Kronos
    const tkCavernDark = new THREE.Mesh(
      new THREE.BoxGeometry(15.2, 12.4, 10.5),
      palette.getMat(0x090d16, 'matte'),
    );
    tkCavernDark.position.set(tkX - 4.8 * sinK, tkFloorY + 6.2, tkZ - 4.8 * cosK);
    tkCavernDark.rotation.y = tkYaw;
    const tkGoldGlow = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.35, 6.2), crystalMat);
    tkGoldGlow.position.set(tkX - 3.2 * sinK, tkFloorY + 0.14, tkZ - 3.2 * cosK);
    tkGoldGlow.rotation.y = tkYaw;
    group.add(tkCavernDark, tkGoldGlow);
    // Colliders on Left/Right Vault Piers & Deep Back Wall (16m entrance remains completely open!)
    obstacles.push(
      { x: tkX - 9.6 * cosK, z: tkZ + 9.6 * sinK, halfW: 2.2, halfD: 4.5 },
      { x: tkX + 9.6 * cosK, z: tkZ - 9.6 * sinK, halfW: 2.2, halfD: 4.5 },
      { x: tkX - 6.5 * sinK, z: tkZ - 6.5 * cosK, halfW: 7.0, halfD: 2.5 },
    );
  }

  // ============================================================================
  // 6. GUA PORTAL ISLAND (cx=20, cz=-174, Panjang 135m!)
  //    - Tinggi Puncak Ngarai: 52m
  //    - Mulut Gua Portal: T: 16m / L: 14m (glowing magenta cavern!)
  //    - Jalur Rel Tambang: Lebar 3m (elevated curved timber trestle + spur)
  //    - Human-Proportional Minecart (2.2m x 3.4m x 2.4m) riding on 2.2m steel gauge
  //    - Kristal Ungu Raksasa (T: 12m - 18m) + Ruined Stone Arch + Timber Scaffolding
  // ============================================================================
  const minecart = new THREE.Group();
  const minecartCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(20.5, 18.0, -193.0),
    new THREE.Vector3(24.5, 17.6, -184.0),
    new THREE.Vector3(33.5, 16.0, -172.0),
    new THREE.Vector3(46.0, 14.0, -161.0),
    new THREE.Vector3(55.5, 12.2, -152.0),
    new THREE.Vector3(52.0, 10.6, -141.0),
    new THREE.Vector3(38.0, 9.2, -138.0),
    new THREE.Vector3(24.0, 8.2, -144.0),
    new THREE.Vector3(18.5, 7.6, -152.0),
  ]);
  {
    const gCx = 20.0;
    const gCz = -174.0;
    const courtY = 14.0;

    // 6a. Mulut Gua Portal (T: 16m / L: 14m!) carved into the obsidian cliff face at (22, -188)
    const caveYaw = 0.34;
    const cosC = Math.cos(caveYaw);
    const sinC = Math.sin(caveYaw);
    const caveFloorY = 17.6;
    const pushCaveBox = (
      lx: number,
      ly: number,
      lz: number,
      sx: number,
      sy: number,
      sz: number,
      color: number,
    ) => {
      const wx = 22.0 + lx * cosC + lz * sinC;
      const wz = -188.0 - lx * sinC + lz * cosC;
      cliffBlocks.push({ x: wx, y: caveFloorY + ly, z: wz, sx, sy, sz, color });
    };

    const obsDark = 0x0f172a;
    const obsMid = 0x1e1b4b;
    const obsPurple = 0x2e1065;
    // Left & Right Obsidian Portal Pillars flanking the clear 14m-wide bore (lx = ±8.5 -> 14m open inside!)
    [-8.5, 8.5].forEach((px) => {
      pushCaveBox(px, 6.5, 0, 3.4, 13.0, 5.2, obsMid);
      pushCaveBox(px + (px < 0 ? 1.2 : -1.2), 12.5, 0.2, 2.2, 3.2, 4.8, obsPurple);
    });
    // Stepped Arch Crown rising cleanly to T = 16.0m above cave floor!
    pushCaveBox(-5.2, 14.2, 0.2, 5.4, 2.8, 5.4, obsMid);
    pushCaveBox(5.2, 14.2, 0.2, 5.4, 2.8, 5.4, obsMid);
    pushCaveBox(0, 15.6, 0.2, 11.5, 2.6, 5.8, obsDark);
    pushCaveBox(0, 17.2, -1.2, 17.0, 2.4, 7.0, obsPurple);

    // Brilliant Magenta-Purple Glowing Cavern Interior behind the 14m x 16m mouth
    const glowPortalMat = palette.createSurfaceMat({
      color: 0xe879f9,
      emissive: 0xc026d3,
      emissiveIntensity: 0.95,
      roughness: 0.2,
    });
    const cavernShell = new THREE.Mesh(
      new THREE.BoxGeometry(13.2, 13.5, 8.5),
      palette.getMat(0x09061a, 'matte'),
    );
    cavernShell.position.set(22.0 - 4.5 * sinC, caveFloorY + 6.75, -188.0 - 4.5 * cosC);
    cavernShell.rotation.y = caveYaw;
    const portalGlowBack = new THREE.Mesh(new THREE.BoxGeometry(10.8, 11.4, 0.9), glowPortalMat);
    portalGlowBack.position.set(22.0 - 3.6 * sinC, caveFloorY + 6.0, -188.0 - 3.6 * cosC);
    portalGlowBack.rotation.y = caveYaw;
    const portalGlowFloor = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.4, 6.2), crystalMat);
    portalGlowFloor.position.set(22.0 - 1.5 * sinC, caveFloorY + 0.12, -188.0 - 1.5 * cosC);
    portalGlowFloor.rotation.y = caveYaw;
    group.add(cavernShell, portalGlowBack, portalGlowFloor);
    disposables.push(glowPortalMat);
    obstacles.push(
      { x: 22.0 - 8.5 * cosC, z: -188.0 + 8.5 * sinC, halfW: 2.2, halfD: 2.6 },
      { x: 22.0 + 8.5 * cosC, z: -188.0 - 8.5 * sinC, halfW: 2.2, halfD: 2.6 },
      { x: 22.0 - 5.2 * sinC, z: -188.0 - 5.2 * cosC, halfW: 6.0, halfD: 2.8 },
    );

    // 6b. Secondary East Crystal Grotto carved into the 52m Grey Granite Cliff (wx=48, wz=-190)
    const grottoDark = new THREE.Mesh(new THREE.BoxGeometry(12.5, 11.0, 9.0), palette.getMat(0x09061a, 'matte'));
    grottoDark.position.set(49.0, 22.5, -192.0);
    grottoDark.rotation.y = -0.38;
    const grottoGlow = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.45, 7.2), crystalMat);
    grottoGlow.position.set(48.5, 17.4, -190.5);
    grottoGlow.rotation.y = -0.38;
    group.add(grottoDark, grottoGlow);

    // 6c. Jalur Rel Tambang: Exact 3m-Wide Curved Elevated Wooden Trestle + East Grotto Spur!
    const buildTrestleFromSpline = (curve: THREE.CatmullRomCurve3, segs: number, withPillars: boolean) => {
      const steelMat = palette.getMat(0xcbd5e1, 'metal');
      const tieMat = palette.getPixelMat('spruce_plank');
      const beamMat = palette.getMat(0x78350f, 'matte');
      const pA = new THREE.Vector3();
      const pB = new THREE.Vector3();
      const mid = new THREE.Vector3();
      const dir = new THREE.Vector3();
      const right = new THREE.Vector3();

      for (let i = 0; i < segs; i++) {
        const t0 = i / segs;
        const t1 = (i + 1) / segs;
        curve.getPointAt(t0, pA);
        curve.getPointAt(t1, pB);
        mid.addVectors(pA, pB).multiplyScalar(0.5);
        dir.subVectors(pB, pA);
        const segLen = dir.length();
        const yaw = Math.atan2(dir.x, dir.z);
        const horiz = Math.hypot(dir.x, dir.z) || 1;
        const pitch = Math.atan2(dir.y, horiz);
        right.set(Math.cos(yaw), 0, -Math.sin(yaw));

        // 3.0m-wide wooden railway cross-tie + twin side stringer beams
        const tie = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.24, 0.56), tieMat);
        tie.position.copy(mid);
        tie.rotation.order = 'YXZ';
        tie.rotation.y = yaw;
        tie.rotation.x = -pitch;
        tie.castShadow = true;
        tie.receiveShadow = true;
        group.add(tie);

        // Twin Steel Rails (2.2m rail gauge) + Outer Wooden Deck Guard Beams (at ±1.4m)
        [-1.08, 1.08].forEach((rOff) => {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, segLen + 0.14), steelMat);
          rail.position.set(mid.x + right.x * rOff, mid.y + 0.18, mid.z + right.z * rOff);
          rail.rotation.order = 'YXZ';
          rail.rotation.y = yaw;
          rail.rotation.x = -pitch;
          group.add(rail);
        });
        [-1.38, 1.38].forEach((bOff) => {
          const beam = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.44, segLen + 0.16), beamMat);
          beam.position.set(mid.x + right.x * bOff, mid.y - 0.18, mid.z + right.z * bOff);
          beam.rotation.order = 'YXZ';
          beam.rotation.y = yaw;
          beam.rotation.x = -pitch;
          beam.castShadow = true;
          group.add(beam);
        });

        // Heavy Timber Trestle Bents (every 3rd segment) resting solidly on canyon terrain below!
        if (withPillars && (i % 3 === 1 || i === segs - 1)) {
          const gL = getArchipelagoGroundY(mid.x - right.x * 1.25, mid.z - right.z * 1.25);
          const gR = getArchipelagoGroundY(mid.x + right.x * 1.25, mid.z + right.z * 1.25);
          const baseGround = Math.max(2.0, Math.min(gL, gR) - 0.4);
          const colH = mid.y - baseGround;
          if (colH > 0.6) {
            [-1.25, 1.25].forEach((pOff) => {
              cliffBlocks.push({
                x: mid.x + right.x * pOff,
                y: baseGround + colH * 0.5,
                z: mid.z + right.z * pOff,
                sx: 0.68,
                sy: colH,
                sz: 0.68,
                color: 0x5c3a1e,
              });
            });
            // Horizontal trestle cross-brace at mid-height
            const brace = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.42, 0.42), beamMat);
            brace.position.set(mid.x, baseGround + colH * 0.55, mid.z);
            brace.rotation.y = yaw;
            group.add(brace);
          }
        }
      }
    };

    buildTrestleFromSpline(minecartCurve, 34, true);
    // Secondary curving rail spur feeding into East Crystal Grotto (matching overview right alcove!)
    const eastSpurCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(33.5, 16.0, -172.0),
      new THREE.Vector3(41.5, 16.5, -179.0),
      new THREE.Vector3(47.0, 17.2, -187.5),
    ]);
    buildTrestleFromSpline(eastSpurCurve, 11, true);

    // Track end wooden bumper stop at P8 (18.5, 7.6, -152.0)
    const endCap = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.1, 0.55), spruceMat);
    endCap.position.set(18.5, 8.1, -152.0);
    endCap.rotation.y = 0.65;
    group.add(endCap);

    // 6d. Human-Proportional Minecart (2.2m wide x 3.4m long x 2.4m tall on the 2.2m rail gauge!)
    const cartIronMat = palette.getMat(0x64748b, 'metal');
    const cartRimMat = palette.getMat(0x334155, 'metal');
    const cartWheelMat = palette.getMat(0x0f172a, 'metal');
    // Heavy Undercarriage & 4 Flanged Steel Wheels aligned to 2.2m rail gauge
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.36, 3.1), cartRimMat);
    chassis.position.y = 0.62;
    const hopperLower = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.95, 3.25), cartIronMat);
    hopperLower.position.y = 1.25;
    hopperLower.castShadow = true;
    const hopperRim = new THREE.Mesh(new THREE.BoxGeometry(2.32, 0.28, 3.42), cartRimMat);
    hopperRim.position.y = 1.82;
    hopperRim.castShadow = true;
    const bumperF = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.34, 0.24), cartRimMat);
    bumperF.position.set(0, 0.62, 1.72);
    const bumperB = bumperF.clone();
    bumperB.position.set(0, 0.62, -1.72);
    minecart.add(chassis, hopperLower, hopperRim, bumperF, bumperB);

    [[-1.08, -1.0], [1.08, -1.0], [-1.08, 1.0], [1.08, 1.0]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.68, 0.68), cartWheelMat);
      wheel.position.set(wx, 0.52, wz);
      const hub = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.28), cartIronMat);
      hub.position.set(wx, 0.52, wz);
      minecart.add(wheel, hub);
    });
    // Glowing Purple Crystal Ore Cargo piled inside the hopper!
    [
      [-0.35, 2.05, -0.45, 0.68, 0.2],
      [0.32, 2.15, 0.2, 0.82, -0.25],
      [0.0, 2.0, 0.65, 0.62, 0.15],
    ].forEach(([ox, oy, oz, os, tilt]) => {
      const ore = new THREE.Mesh(new THREE.OctahedronGeometry(os, 0), crystalMat);
      ore.position.set(ox, oy, oz);
      ore.scale.set(0.85, 1.25, 0.85);
      ore.rotation.z = tilt;
      minecart.add(ore);
      crystalMeshes.push(ore);
    });
    minecart.position.set(33.5, 16.15, -172.0);
    group.add(minecart);

    // 6e. Kristal Ungu Raksasa (T: 12m - 18m!) — Faceted Multi-Spire Amethyst Crystal Clusters
    const crystalCoreMat = palette.createSurfaceMat({
      color: 0xc084fc,
      emissive: 0x9333ea,
      emissiveIntensity: 0.78,
      roughness: 0.12,
      metalness: 0.22,
    });
    disposables.push(crystalCoreMat);
    const buildGiantCrystalCluster = (cx: number, baseY: number, cz: number, totalH: number, baseR: number, yaw = 0) => {
      const cluster = new THREE.Group();
      cluster.position.set(cx, baseY, cz);
      cluster.rotation.y = yaw;
      const spires: Array<[number, number, number, number, number, number, number]> = [
        // [ox, oz, heightFrac, radiusScale, tiltX, tiltZ, rotY]
        [0, 0, 1.0, 1.0, 0.04, -0.06, 0.2],
        [-baseR * 0.95, baseR * 0.4, 0.72, 0.74, 0.18, 0.32, 1.0],
        [baseR * 1.05, -baseR * 0.35, 0.66, 0.68, -0.15, -0.34, 2.1],
        [baseR * 0.35, baseR * 0.95, 0.54, 0.56, 0.32, -0.14, 0.7],
        [-baseR * 0.45, -baseR * 0.85, 0.48, 0.52, -0.3, 0.18, 1.6],
      ];
      spires.forEach(([ox, oz, hFrac, rSc, tx, tz, ry], si) => {
        const sH = totalH * hFrac;
        const shaftH = sH * 0.68;
        const tipH = sH * 0.32;
        const rBot = baseR * rSc;
        const rTop = rBot * 0.86;
        const spirePivot = new THREE.Group();
        spirePivot.position.set(ox, -0.8, oz);
        spirePivot.rotation.set(tx, ry, tz);
        const sMat = si === 0 ? crystalCoreMat : crystalMat;
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, shaftH, 6), sMat);
        shaft.position.y = shaftH * 0.5;
        shaft.castShadow = true;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(rTop, tipH, 6), crystalCoreMat);
        tip.position.y = shaftH + tipH * 0.5;
        tip.castShadow = true;
        spirePivot.add(shaft, tip);
        cluster.add(spirePivot);
        crystalMeshes.push(shaft, tip);
      });
      group.add(cluster);
      obstacles.push({ x: cx, z: cz, halfW: baseR * 1.35, halfD: baseR * 1.35 });
    };

    // Exact 6 giant amethyst clusters matching overview blueprint (ALL T: 12m - 18m!):
    buildGiantCrystalCluster(gCx + 2.0, 36.5, gCz - 26.0, 18.0, 2.6, 0.25); // Summit Peak Crown (18m!)
    buildGiantCrystalCluster(gCx + 36.0, 41.5, gCz - 34.0, 12.5, 2.0, -0.4); // 52m NE Peak Crystal (12.5m)
    buildGiantCrystalCluster(gCx + 46.0, 18.5, gCz - 6.0, 17.5, 2.5, 0.85); // East Canyon Rim Giant (17.5m!)
    buildGiantCrystalCluster(gCx - 8.0, 5.2, gCz + 28.0, 14.5, 2.2, -0.35); // Front-Center-Left Gorge Giant (14.5m!)
    buildGiantCrystalCluster(gCx + 22.0, 3.6, gCz + 44.0, 13.0, 2.1, 0.55); // Front-Bottom Trestle Giant (13.0m!)
    buildGiantCrystalCluster(gCx - 16.0, 22.0, gCz - 20.0, 12.0, 1.85, 0.15); // West Obsidian Peak Flank (12.0m)
    buildGiantCrystalCluster(gCx + 28.0, 17.5, gCz - 16.0, 12.2, 1.9, -0.6); // East Crystal Grotto Cluster (12.2m)

    // 6f. Ruined Weathered Stone Archway + 3-Tier Wooden Mining Scaffolding on West Quarry Bluff!
    const archCx = gCx - 34.0; // -14.0
    const archCz = gCz + 16.0; // -158.0
    const archBaseY = getArchipelagoGroundY(archCx, archCz);
    const ruinStoneL = 0x94a3b8;
    const ruinStoneM = 0x64748b;
    const ruinStoneD = 0x475569;
    // Twin crumbling piers (10m outer span -> clear walkable passage underneath!)
    cliffBlocks.push({ x: archCx - 4.4, y: archBaseY + 4.5, z: archCz, sx: 2.8, sy: 9.0, sz: 3.0, color: ruinStoneM });
    cliffBlocks.push({ x: archCx + 4.4, y: archBaseY + 3.8, z: archCz, sx: 2.8, sy: 7.6, sz: 3.0, color: ruinStoneM });
    // Stepped broken stone arch blocks & mossy crown stones up to +13.2m
    cliffBlocks.push({ x: archCx - 2.6, y: archBaseY + 9.8, z: archCz, sx: 2.6, sy: 2.4, sz: 2.8, color: ruinStoneL });
    cliffBlocks.push({ x: archCx + 2.6, y: archBaseY + 8.9, z: archCz, sx: 2.4, sy: 2.2, sz: 2.8, color: ruinStoneL });
    cliffBlocks.push({ x: archCx - 0.6, y: archBaseY + 11.4, z: archCz, sx: 3.4, sy: 2.2, sz: 2.8, color: ruinStoneD });
    cliffBlocks.push({ x: archCx - 3.8, y: archBaseY + 11.6, z: archCz, sx: 1.8, sy: 1.8, sz: 2.2, color: 0x4d7c0f }); // mossy ruin cap
    obstacles.push(
      { x: archCx - 4.4, z: archCz, halfW: 1.5, halfD: 1.6 },
      { x: archCx + 4.4, z: archCz, halfW: 1.5, halfD: 1.6 },
    );

    // 3-Tier Timber Mining Scaffolding Tower beside the West Archway (-5, -148), clear of both staircases
    const scafX = gCx - 25.0; // -5.0
    const scafZ = gCz + 26.0; // -148.0
    const scafY = getArchipelagoGroundY(scafX, scafZ);
    [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]].forEach(([px, pz]) => {
      cliffBlocks.push({ x: scafX + px, y: scafY + 4.4, z: scafZ + pz, sx: 0.42, sy: 8.8, sz: 0.42, color: 0x5c3a1e });
    });
    [2.6, 5.4, 8.2].forEach((ty) => {
      walkableTopBlocks.push({ x: scafX, y: scafY + ty, z: scafZ, sx: 3.6, sy: 0.32, sz: 3.6, color: 0xb88a4c });
    });
    obstacles.push({ x: scafX, z: scafZ, halfW: 1.9, halfD: 1.9 });

    // Human-proportional wooden mining crates & glowing courtyard crystal bollards (1.1m..1.6m)
    [
      [gCx - 16.0, gCz + 8.0, 1.2],
      [gCx - 14.5, gCz + 9.2, 0.95],
      [gCx + 2.0, gCz + 2.0, 1.15],
      [gCx + 14.0, gCz + 28.0, 1.3],
    ].forEach(([bx, bz, bs]) => {
      const by = getArchipelagoGroundY(bx, bz);
      cliffBlocks.push({ x: bx, y: by + bs * 0.5, z: bz, sx: bs, sy: bs, sz: bs, color: 0xb45309 });
      obstacles.push({ x: bx, z: bz, halfW: bs * 0.55, halfD: bs * 0.55 });
    });

    // 6g. Soft Atmospheric Canyon Mist Puffs drifting inside the Lower Front Gorge
    const mistMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.24,
      roughness: 0.95,
      depthWrite: false,
    });
    disposables.push(mistMat);
    [
      [gCx - 4.0, 6.4, gCz + 32.0, 11.0, 2.2, 8.5],
      [gCx + 8.0, 5.8, gCz + 36.0, 13.0, 2.4, 9.5],
      [gCx + 18.0, 6.2, gCz + 30.0, 10.5, 2.0, 8.0],
      [gCx - 14.0, 6.8, gCz + 36.0, 9.5, 2.0, 7.5],
    ].forEach(([mx, my, mz, sx, sy, sz]) => {
      const puff = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mistMat);
      puff.position.set(mx, my, mz);
      group.add(puff);
    });
  }

  // ============================================================================
  // 7. FLOATING ISTANA IELTS SKY ISLAND (115m Island, 120m Hex Shield, 65x55x48m Palace, 6m Severed Bridge)
  // ============================================================================
  const lightBridgeStart = { x: 172.0, y: 22.0, z: -124.0 };
  const istanaRig = buildIstanaFloatingIsland(
    palette,
    OVERWORLD_ANCHORS.istanaFloating,
    lightBridgeStart,
    lowDetail,
  );
  group.add(istanaRig.istanaGroup, istanaRig.skyBridgeGroup);
  disposables.push(...istanaRig.disposables);
  // Rope barrier collider across the severed Light Bridgehead on Menara Waktu cliff
  obstacles.push({
    x: lightBridgeStart.x,
    z: lightBridgeStart.z,
    halfW: 3.4,
    halfD: 1.1,
  });

  // Outer perimeter diorama sky-clouds well outside playable islands & below horizon
  const outerCloudSpots: Array<[number, number, number]> = [
    [-146, 3.0, 148],
    [-132, 3.8, 174],
    [136, 3.2, 152],
    [154, 4.0, 172],
    [-226, 4.5, -182],
    [-58, 4.0, -248],
    [98, 4.2, -242],
    [226, 4.2, -32],
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
    minecartCurve,
    crystalMeshes,
    lavaMeshes,
    istanaGroup: istanaRig.istanaGroup,
    istanaDome: istanaRig.istanaDome,
    istanaRig,
    zooCritters,
    disposables,
  };
}

const _archWorldScratch = new THREE.Vector3();

function isPointNearViewer(
  wx: number,
  wz: number,
  maxDistSq: number,
  heroPos?: { x: number; z: number },
  camPos?: { x: number; z: number },
): boolean {
  if (!heroPos && !camPos) return true;
  if (heroPos) {
    const dx = heroPos.x - wx;
    const dz = heroPos.z - wz;
    if (dx * dx + dz * dz <= maxDistSq) return true;
  }
  if (camPos) {
    const dx = camPos.x - wx;
    const dz = camPos.z - wz;
    if (dx * dx + dz * dz <= maxDistSq) return true;
  }
  return false;
}

function getCachedObjXZ(obj: THREE.Object3D): { wx: number; wz: number } {
  let wx = obj.userData._archWx as number | undefined;
  let wz = obj.userData._archWz as number | undefined;
  if (wx === undefined || wz === undefined) {
    obj.getWorldPosition(_archWorldScratch);
    wx = _archWorldScratch.x;
    wz = _archWorldScratch.z;
    obj.userData._archWx = wx;
    obj.userData._archWz = wz;
  }
  return { wx, wz };
}

export function freezeStaticSubtree(
  root: THREE.Object3D,
  dynamicNodes: Set<THREE.Object3D>,
): void {
  root.updateMatrixWorld(true);
  const walk = (node: THREE.Object3D): boolean => {
    if (dynamicNodes.has(node)) {
      return true;
    }
    let hasDyn = false;
    for (let i = 0; i < node.children.length; i++) {
      if (walk(node.children[i])) hasDyn = true;
    }
    node.matrixAutoUpdate = false;
    node.updateMatrix();
    if (!hasDyn) {
      node.matrixWorldAutoUpdate = false;
    }
    return hasDyn;
  };
  walk(root);
}

export function updateArchipelagoWorld(
  rig: ArchipelagoRig,
  _dt: number,
  elapsed: number,
  heroPos?: { x: number; z: number },
  camPos?: { x: number; z: number },
): void {
  rig.waterUniforms.uTime.value = elapsed;

  if (isPointNearViewer(0, 118, 128 * 128, heroPos, camPos)) {
    rig.windmillHub.rotation.z = -elapsed * 0.72;
  }

  for (let i = 0; i < rig.gears.length; i++) {
    const g = rig.gears[i];
    const { wx, wz } = getCachedObjXZ(g.mesh);
    if (isPointNearViewer(wx, wz, 130 * 130, heroPos, camPos)) {
      g.mesh.rotation.z = elapsed * g.speed;
    }
  }
  for (let i = 0; i < rig.clockHands.length; i++) {
    const ch = rig.clockHands[i];
    const { wx, wz } = getCachedObjXZ(ch);
    if (isPointNearViewer(wx, wz, 130 * 130, heroPos, camPos)) {
      ch.rotation.z = -elapsed * 0.45;
    }
  }
  for (let i = 0; i < rig.cars.length; i++) {
    const c = rig.cars[i];
    const { wz } = getCachedObjXZ(c.mesh);
    if (!isPointNearViewer(c.baseX, wz, 118 * 118, heroPos, camPos)) continue;
    const s = Math.sin(elapsed * c.speed + c.phase);
    c.mesh.position.x = c.baseX + s * c.rangeX;
    c.mesh.rotation.y = Math.cos(elapsed * c.speed + c.phase) >= 0 ? 0 : Math.PI;
  }

  if (isPointNearViewer(20, -174, 122 * 122, heroPos, camPos)) {
    const cartT = 0.08 + ((Math.sin(elapsed * 0.42) + 1) * 0.5) * 0.84;
    rig.minecartCurve.getPointAt(cartT, _cartPosScratch);
    rig.minecartCurve.getTangentAt(cartT, _cartTanScratch);
    rig.minecart.position.set(_cartPosScratch.x, _cartPosScratch.y + 0.14, _cartPosScratch.z);
    rig.minecart.rotation.order = 'YXZ';
    rig.minecart.rotation.y = Math.atan2(_cartTanScratch.x, _cartTanScratch.z);
    const tanHoriz = Math.hypot(_cartTanScratch.x, _cartTanScratch.z) || 1;
    rig.minecart.rotation.x = -Math.atan2(_cartTanScratch.y, tanHoriz);
  }

  if (
    isPointNearViewer(
      OVERWORLD_ANCHORS.istanaFloating.x,
      OVERWORLD_ANCHORS.istanaFloating.z,
      180 * 180,
      heroPos,
      camPos,
    )
  ) {
    updateIstanaFloatingIsland(rig.istanaRig, OVERWORLD_ANCHORS.istanaFloating.y, elapsed);
  }

  for (let i = 0; i < rig.zooCritters.length; i++) {
    const c = rig.zooCritters[i];
    const { wx, wz } = getCachedObjXZ(c.root);
    if (!isPointNearViewer(wx, wz, 82 * 82, heroPos, camPos)) continue;
    const t = elapsed * 1.4 + c.phase;
    c.head.rotation.y = Math.sin(t * 0.9) * 0.25;
    c.head.rotation.x = Math.max(0, Math.sin(t * 1.3)) * 0.16;
  }
}
