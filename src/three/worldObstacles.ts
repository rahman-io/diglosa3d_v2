import * as THREE from 'three';
import { ZoneId } from '../types/game';
import { getArchipelagoGroundY } from './archipelagoWorld';
import { MaterialPalette } from './materials';

/**
 * All 40 Interactive 3D Obstacles (20 from Sheet A + 20 from Sheet B),
 * distributed cleanly across all islands & bridges with fair timing telegraphs,
 * solvable platforming logic, and zero per-frame allocations.
 */
export type ObstacleKind =
  // Sheet A (01 - 20)
  | 'rotating_blades' // 01
  | 'swinging_spike' // 02
  | 'crushing_piston' // 03
  | 'lava_fountain' // 04
  | 'spinning_logs' // 05
  | 'collapsing_path' // 06
  | 'laser_barrier' // 07
  | 'rolling_boulder' // 08
  | 'electrified_grid' // 09
  | 'crushing_walls' // 10
  | 'acid_fount' // 11
  | 'fire_shooter' // 12
  | 'retractable_spikes' // 13
  | 'toxic_gas' // 14
  | 'spinning_gears' // 15
  | 'ice_patch' // 16
  | 'gust_vent' // 17
  | 'treadmill_spikes' // 18
  | 'bouncy_pad' // 19
  | 'chomping_trap' // 20
  // Sheet B (21 - 40)
  | 'spinning_blade_track' // 21
  | 'lava_volcano' // 22
  | 'swinging_mace_dual' // 23
  | 'collapsing_bridge' // 24
  | 'laser_gate' // 25
  | 'spike_trap' // 26
  | 'boulder_chute' // 27
  | 'burning_treadmill' // 28
  | 'crushing_monoliths' // 29
  | 'tesla_grid' // 30
  | 'toxic_slime_pool' // 31
  | 'falling_stalactites' // 32
  | 'piston_pusher' // 33
  | 'spinning_fire_bar' // 34
  | 'moving_platforms' // 35
  | 'shattering_glass' // 36
  | 'wind_turbine' // 37
  | 'ice_slide' // 38
  | 'ice_breaker' // 39
  | 'crystal_shards'; // 40

export interface ObstaclePlacementDef {
  id: string;
  num: number;
  kind: ObstacleKind;
  name: string;
  hint: string;
  zoneId: ZoneId | 'hub';
  x: number;
  z: number;
  yaw: number;
  phase?: number;
}

export const WORLD_OBSTACLE_DEFS: ObstaclePlacementDef[] = [
  // === HUB & SOUTH BRIDGE (3) ===
  {
    id: 'obs_19_bouncy',
    num: 19,
    kind: 'bouncy_pad',
    name: 'Bouncy Pad',
    hint: 'Injak pegas merah di sisi benteng barat untuk meluncur menuju tebing & obby rantai!',
    zoneId: 'hub',
    x: -36.5,
    z: -15.5,
    yaw: 0,
  },
  {
    id: 'obs_05_logs',
    num: 5,
    kind: 'spinning_logs',
    name: 'Spinning Logs',
    hint: 'Lompat di antara dua gelondong berduri yang berputar!',
    zoneId: 'hub',
    x: -23.2,
    z: 43.33,
    yaw: 0.26,
  },
  {
    id: 'obs_06_collapse_path',
    num: 6,
    kind: 'collapsing_path',
    name: 'Collapsing Path',
    hint: 'Papan bergetar akan runtuh — terus berlari atau melompat!',
    zoneId: 'hub',
    x: -20.56,
    z: 53.06,
    yaw: 0.26,
  },

  // === DESA SAPAAN (5) ===
  {
    id: 'obs_01_rot_blades',
    num: 1,
    kind: 'rotating_blades',
    name: 'Rotating Blades',
    hint: 'Lompati bilah pisau putar atau ikuti celah putarannya!',
    zoneId: 'desa_sapaan',
    x: -18.0,
    z: 132.0,
    yaw: 0,
  },
  {
    id: 'obs_13_ret_spikes',
    num: 13,
    kind: 'retractable_spikes',
    name: 'Retractable Spikes',
    hint: 'Perhatikan kilau jingga, lewati saat duri masuk ke lantai!',
    zoneId: 'desa_sapaan',
    x: -18.0,
    z: 116.0,
    yaw: 0,
  },
  {
    id: 'obs_26_spike_trap',
    num: 26,
    kind: 'spike_trap',
    name: 'Spike Trap',
    hint: 'Lompat tinggi melewati jebakan duri batu atau ambil sisi tepi!',
    zoneId: 'desa_sapaan',
    x: -23.0,
    z: 101.0,
    yaw: 0.25,
  },
  {
    id: 'obs_37_wind_turbine',
    num: 37,
    kind: 'wind_turbine',
    name: 'Wind Turbine',
    hint: 'Tahan arah gerak melawan hembusan turbin atau tunggu jeda!',
    zoneId: 'desa_sapaan',
    x: -33.0,
    z: 86.0,
    yaw: 0.4,
  },
  {
    id: 'obs_18_treadmill',
    num: 18,
    kind: 'treadmill_spikes',
    name: 'Treadmill Spikes',
    hint: 'Lari cepat atau lompat agar tidak terdorong ke deretan duri!',
    zoneId: 'desa_sapaan',
    x: -18.0,
    z: 84.0,
    yaw: 0.2,
  },

  // === PASAR RASA (6) ===
  {
    id: 'obs_24_collapse_bridge',
    num: 24,
    kind: 'collapsing_bridge',
    name: 'Collapsing Bridge',
    hint: 'Jembatan lapuk akan ambruk sesaat — terus berlari melintasinya!',
    zoneId: 'pasar_rasa',
    x: -64.97,
    z: 17.43,
    yaw: -0.48,
  },
  {
    id: 'obs_04_lava_fount',
    num: 4,
    kind: 'lava_fountain',
    name: 'Lava Fountain',
    hint: 'Semburan lava muncul berkala — seberangi saat jeda tenang!',
    zoneId: 'pasar_rasa',
    x: -102.0,
    z: 70.0,
    yaw: 0,
  },
  {
    id: 'obs_22_lava_volcano',
    num: 22,
    kind: 'lava_volcano',
    name: 'Lava Fountain Volcano',
    hint: 'Kerucut magma menyemburkan api — hindari saat kawah membara!',
    zoneId: 'pasar_rasa',
    x: -112.0,
    z: 34.0,
    yaw: 0,
  },
  {
    id: 'obs_12_fire_shooter',
    num: 12,
    kind: 'fire_shooter',
    name: 'Fire Shooter',
    hint: 'Lompati bola api atau geser ke samping jalur meriam!',
    zoneId: 'pasar_rasa',
    x: -119.0,
    z: 45.0,
    yaw: Math.PI / 2,
  },
  {
    id: 'obs_34_spin_fire',
    num: 34,
    kind: 'spinning_fire_bar',
    name: 'Spinning Fire Bar',
    hint: 'Lompati palang api berputar atau ikuti arah putarannya!',
    zoneId: 'pasar_rasa',
    x: -119.0,
    z: 85.0,
    yaw: 0,
  },
  {
    id: 'obs_28_burn_treadmill',
    num: 28,
    kind: 'burning_treadmill',
    name: 'Burning Treadmill',
    hint: 'Berlari melawan sabuk berjalan sambil melompati lidah api!',
    zoneId: 'pasar_rasa',
    x: -111.0,
    z: 13.0,
    yaw: 0,
  },

  // === HUTAN SATWA (6) ===
  {
    id: 'obs_17_gust_vent',
    num: 17,
    kind: 'gust_vent',
    name: 'Gust Vent',
    hint: 'Awas angin kencang di jembatan! Tahan arah agar tidak terjatuh.',
    zoneId: 'hutan_satwa',
    x: 55.5,
    z: 26.25,
    yaw: 0.75,
  },
  {
    id: 'obs_02_swing_spike',
    num: 2,
    kind: 'swinging_spike',
    name: 'Swinging Spike',
    hint: 'Tunggu ayunan bola berduri ke samping lalu lari melewatinya!',
    zoneId: 'hutan_satwa',
    x: 78.0,
    z: 42.5,
    yaw: 0.25,
  },
  {
    id: 'obs_11_acid_fount',
    num: 11,
    kind: 'acid_fount',
    name: 'Acid Fount',
    hint: 'Jangan menginjak kolam asam hijau — lewati tepian batu aman!',
    zoneId: 'hutan_satwa',
    x: 112.0,
    z: 76.0,
    yaw: 0,
  },
  {
    id: 'obs_31_slime_pool',
    num: 31,
    kind: 'toxic_slime_pool',
    name: 'Toxic Slime Pool',
    hint: 'Lompat dari satu balok batu lumut ke balok lain di atas lumpur!',
    zoneId: 'hutan_satwa',
    x: 96.0,
    z: 66.0,
    yaw: 0.4,
  },
  {
    id: 'obs_14_toxic_gas',
    num: 14,
    kind: 'toxic_gas',
    name: 'Toxic Gas',
    hint: 'Ventilasi menyemburkan gas beracun berkala — lewati saat jernih!',
    zoneId: 'hutan_satwa',
    x: 108.0,
    z: 28.0,
    yaw: 0,
  },
  {
    id: 'obs_20_chomp',
    num: 20,
    kind: 'chomping_trap',
    name: 'Chomping Trap',
    hint: 'Rahang baja mengatup cepat — lewati saat rahang terbuka lebar!',
    zoneId: 'hutan_satwa',
    x: 126.0,
    z: 54.0,
    yaw: 0.35,
  },

  // === GERBANG KOTA (7) ===
  {
    id: 'obs_03_piston',
    num: 3,
    kind: 'crushing_piston',
    name: 'Crushing Piston',
    hint: 'Tunggu piston batu terangkat ke atas lalu segera menerobos!',
    zoneId: 'gerbang_kota',
    x: -82.2,
    z: -33.16,
    yaw: -1.66,
  },
  {
    id: 'obs_10_crush_walls',
    num: 10,
    kind: 'crushing_walls',
    name: 'Crushing Walls',
    hint: 'Terobos celah di antara dinding berduri saat terbuka lebar!',
    zoneId: 'gerbang_kota',
    x: -105.2,
    z: -61.6,
    yaw: 0.45,
  },
  {
    id: 'obs_21_blade_track',
    num: 21,
    kind: 'spinning_blade_track',
    name: 'Spinning Blade',
    hint: 'Dua gergaji rel meluncur bolak-balik — lompat atau hindari rel!',
    zoneId: 'gerbang_kota',
    x: -158.0,
    z: -86.0,
    yaw: Math.PI / 2,
  },
  {
    id: 'obs_08_boulder',
    num: 8,
    kind: 'rolling_boulder',
    name: 'Rolling Boulder',
    hint: 'Hindari batu gelinding di jalur atas atau melompat saat mendekat!',
    zoneId: 'gerbang_kota',
    x: -136.0,
    z: -89.5,
    yaw: Math.PI / 2,
  },
  {
    id: 'obs_27_boulder_chute',
    num: 27,
    kind: 'boulder_chute',
    name: 'Rolling Boulder Chute',
    hint: 'Batu besar menggelinding di talang — pindah ke lajur jalan sebelah!',
    zoneId: 'gerbang_kota',
    x: -188.0,
    z: -83.0,
    yaw: Math.PI / 2,
  },
  {
    id: 'obs_07_laser_bar',
    num: 7,
    kind: 'laser_barrier',
    name: 'Laser Barrier',
    hint: 'Laser merah mati secara berkala — tunggu padam sebelum melintas!',
    zoneId: 'gerbang_kota',
    x: -110.0,
    z: -76.0,
    yaw: 0.1,
  },
  {
    id: 'obs_33_piston_push',
    num: 33,
    kind: 'piston_pusher',
    name: 'Piston Pusher',
    hint: 'Piston samping mendorong keras — lewati saat piston ditarik masuk!',
    zoneId: 'gerbang_kota',
    x: -132.0,
    z: -108.0,
    yaw: 0,
  },

  // === MENARA WAKTU (7) ===
  {
    id: 'obs_15_spin_gears',
    num: 15,
    kind: 'spinning_gears',
    name: 'Spinning Gears',
    hint: 'Lewati celah aman di antara roda gigi emas yang berputar!',
    zoneId: 'menara_waktu',
    x: 79.92,
    z: -60.56,
    yaw: 1.94,
  },
  {
    id: 'obs_23_mace_dual',
    num: 23,
    kind: 'swinging_mace_dual',
    name: 'Swinging Mace',
    hint: 'Dua gada berduri berayun silang — masuk saat kedua rantai memisah!',
    zoneId: 'menara_waktu',
    x: 108.0,
    z: -72.0,
    yaw: Math.PI / 2,
  },
  {
    id: 'obs_09_elec_grid',
    num: 9,
    kind: 'electrified_grid',
    name: 'Electrified Grid',
    hint: 'Lantai berkedip sebelum menyetrum — lewati saat listrik mati!',
    zoneId: 'menara_waktu',
    x: 122.0,
    z: -72.0,
    yaw: 0,
  },
  {
    id: 'obs_30_tesla_grid',
    num: 30,
    kind: 'tesla_grid',
    name: 'Electrified Tesla Grid',
    hint: 'Ubin listrik bergantian sisi A & B — lompat ke petak yang gelap!',
    zoneId: 'menara_waktu',
    x: 128.0,
    z: -103.5,
    yaw: 0,
  },
  {
    id: 'obs_35_mov_plats',
    num: 35,
    kind: 'moving_platforms',
    name: 'Moving Platforms',
    hint: 'Naiki pilar batu yang naik-turun untuk menyeberangi lereng!',
    zoneId: 'menara_waktu',
    x: 148.0,
    z: -62.0,
    yaw: 0,
  },
  {
    id: 'obs_29_crush_mono',
    num: 29,
    kind: 'crushing_monoliths',
    name: 'Crushing Monoliths',
    hint: 'Tunggu monolit berduri membuka jalan di mulut Terowongan Kronos!',
    zoneId: 'menara_waktu',
    x: 176.0,
    z: -56.0,
    yaw: 0.28,
  },
  {
    id: 'obs_25_laser_gate',
    num: 25,
    kind: 'laser_gate',
    name: 'Laser Gate',
    hint: 'Gerbang laser pelataran menara berkedip — sabar tunggu padam!',
    zoneId: 'menara_waktu',
    x: 141.0,
    z: -115.0,
    yaw: 0,
  },

  // === GUA PORTAL (6) ===
  {
    id: 'obs_36_shatter_glass',
    num: 36,
    kind: 'shattering_glass',
    name: 'Shattering Glass',
    hint: 'Kaca es retak saat diinjak — terus berlari atau lompat cepat!',
    zoneId: 'gua_portal',
    x: -15.05,
    z: -95.16,
    yaw: 3.01,
  },
  {
    id: 'obs_32_stalactites',
    num: 32,
    kind: 'falling_stalactites',
    name: 'Falling Stalactites',
    hint: 'Perhatikan bayangan lingkaran peringatan sebelum stalaktit jatuh!',
    zoneId: 'gua_portal',
    x: -14.0,
    z: -146.0,
    yaw: 0,
  },
  {
    id: 'obs_16_ice_patch',
    num: 16,
    kind: 'ice_patch',
    name: 'Ice Patch',
    hint: 'Permukaan es licin! Kendalikan arah agar tidak tergelincir.',
    zoneId: 'gua_portal',
    x: -4.0,
    z: -168.0,
    yaw: 0,
  },
  {
    id: 'obs_38_ice_slide',
    num: 38,
    kind: 'ice_slide',
    name: 'Ice Slide',
    hint: 'Seluncuran es mempercepat gerak — arahkan lompatan di ujungnya!',
    zoneId: 'gua_portal',
    x: 5.0,
    z: -152.0,
    yaw: 0,
  },
  {
    id: 'obs_39_ice_breaker',
    num: 39,
    kind: 'ice_breaker',
    name: 'Ice Breaker',
    hint: 'Beliung es raksasa mengayun di tebing — lewati saat terangkat!',
    zoneId: 'gua_portal',
    x: -16.0,
    z: -166.0,
    yaw: 0.4,
  },
  {
    id: 'obs_40_crystal_shards',
    num: 40,
    kind: 'crystal_shards',
    name: 'Crystal Shards',
    hint: 'Kristal ungu menyembul berirama — lewati saat surut ke dalam batu!',
    zoneId: 'gua_portal',
    x: 11.0,
    z: -167.0,
    yaw: 0.34,
  },
];

export interface TileBreakState {
  localZ: number;
  halfW: number;
  halfD: number;
  mesh: THREE.Object3D;
  baseY: number;
  state: 'intact' | 'shaking' | 'gone';
  timer: number;
}

export interface MovingPlatformNode {
  localX: number;
  localZ: number;
  halfW: number;
  halfD: number;
  baseY: number;
  ampY: number;
  speed: number;
  phase: number;
  currentY: number;
  mesh: THREE.Object3D;
}

export interface SteppingBlockNode {
  localX: number;
  localZ: number;
  halfW: number;
  halfD: number;
  topY: number;
}

export interface ObstacleRuntimeInstance {
  def: ObstaclePlacementDef;
  baseY: number;
  group: THREE.Group;
  phase: number;
  cosY: number;
  sinY: number;
  // Dynamic parts animated per tick
  spinners: Array<{ obj: THREE.Object3D; speed: number; axis: 'x' | 'y' | 'z' }>;
  swings: Array<{ obj: THREE.Object3D; amp: number; speed: number; offset: number; axis: 'x' | 'z' }>;
  pistons: Array<{ obj: THREE.Object3D; basePos: THREE.Vector3; dir: THREE.Vector3 }>;
  lasers: THREE.Mesh[];
  warnGlows: THREE.Mesh[];
  hazardParts: THREE.Object3D[];
  fireballs: Array<{ mesh: THREE.Mesh; offset: number }>;
  breakTiles: TileBreakState[];
  movingPlatforms: MovingPlatformNode[];
  steppingBlocks: SteppingBlockNode[];
  bounceCooldown: number;
  springTop?: THREE.Object3D;
  springCompression: number;
}

export interface WorldObstaclesRig {
  group: THREE.Group;
  instances: ObstacleRuntimeInstance[];
  disposables: Array<{ dispose: () => void }>;
}

export interface ObstacleEvaluationResult {
  onIce: boolean;
  pushX: number;
  pushZ: number;
  bounceVelY: number;
  supportY: number | null;
  hazardHit: {
    name: string;
    hint: string;
    knockX: number;
    knockZ: number;
  } | null;
}

const _localScratch = new THREE.Vector3();
const _worldScratch = new THREE.Vector3();

function toLocalXZ(
  wx: number,
  wz: number,
  ox: number,
  oz: number,
  cosY: number,
  sinY: number,
): { lx: number; lz: number } {
  const dx = wx - ox;
  const dz = wz - oz;
  return {
    lx: dx * cosY - dz * sinY,
    lz: dx * sinY + dz * cosY,
  };
}

function buildSpikeCone(mat: THREE.Material, r: number, h: number): THREE.Mesh {
  return new THREE.Mesh(new THREE.ConeGeometry(r, h, 4), mat);
}

export function createWorldObstacles(palette: MaterialPalette): WorldObstaclesRig {
  const group = new THREE.Group();
  const instances: ObstacleRuntimeInstance[] = [];
  const disposables: Array<{ dispose: () => void }> = [];

  // Shared PBR Materials for all 40 obstacles (varying roughness/metalness for crisp contrast)
  const stoneLight = palette.getMat(0x94a3b8, 'matte');
  const stoneDark = palette.getMat(0x475569, 'matte');
  const metalSteel = palette.getMat(0xcbd5e1, 'metal');
  const metalDark = palette.getMat(0x334155, 'metal');
  const goldMetal = palette.getMat(0xfacc15, 'metal');
  const woodOak = palette.getPixelMat('oak_plank');
  const woodSpruce = palette.getPixelMat('spruce_plank');

  const magmaMat = palette.createSurfaceMat({
    color: 0xf97316,
    emissive: 0xea580c,
    emissiveIntensity: 0.9,
    roughness: 0.3,
  });
  const laserMat = palette.createSurfaceMat({
    color: 0xf43f5e,
    emissive: 0xe11d48,
    emissiveIntensity: 1.25,
    roughness: 0.15,
    transparent: true,
    opacity: 0.9,
  });
  const acidMat = palette.createSurfaceMat({
    color: 0x84cc16,
    emissive: 0x65a30d,
    emissiveIntensity: 0.78,
    roughness: 0.18,
    transparent: true,
    opacity: 0.88,
  });
  const elecMat = palette.createSurfaceMat({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 1.15,
    roughness: 0.15,
    transparent: true,
    opacity: 0.92,
  });
  const warnMat = palette.createSurfaceMat({
    color: 0xfacc15,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.85,
    roughness: 0.25,
    transparent: true,
    opacity: 0.75,
  });
  const iceMat = palette.createSurfaceMat({
    color: 0xbae6fd,
    emissive: 0x0284c7,
    emissiveIntensity: 0.22,
    roughness: 0.08,
    metalness: 0.15,
    transparent: true,
    opacity: 0.82,
  });
  const crystalHazardMat = palette.createSurfaceMat({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 0.88,
    roughness: 0.12,
    metalness: 0.2,
  });
  const conveyorMat = palette.getMat(0x1e293b, 'matte');
  const bounceRedMat = palette.createSurfaceMat({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 0.32,
    roughness: 0.35,
  });
  const bounceBlueMat = palette.getMat(0x2563eb, 'metal');

  disposables.push(
    magmaMat,
    laserMat,
    acidMat,
    elecMat,
    warnMat,
    iceMat,
    crystalHazardMat,
    bounceRedMat,
  );

  WORLD_OBSTACLE_DEFS.forEach((def, idx) => {
    const cosY = Math.cos(def.yaw);
    const sinY = Math.sin(def.yaw);
    let baseY = getArchipelagoGroundY(def.x, def.z);
    if (baseY < 0.2 && (def.kind === 'collapsing_bridge' || def.kind === 'shattering_glass')) {
      // Sample deck height at both intact ends of the bridge gap
      const yA = getArchipelagoGroundY(def.x - 4.6 * sinY, def.z - 4.6 * cosY);
      const yB = getArchipelagoGroundY(def.x + 4.6 * sinY, def.z + 4.6 * cosY);
      baseY = Math.max(yA, yB, 2.6);
    }
    const root = new THREE.Group();
    root.position.set(def.x, baseY, def.z);
    root.rotation.y = def.yaw;
    group.add(root);

    const inst: ObstacleRuntimeInstance = {
      def,
      baseY,
      group: root,
      phase: def.phase ?? idx * 0.67,
      cosY,
      sinY,
      spinners: [],
      swings: [],
      pistons: [],
      lasers: [],
      warnGlows: [],
      hazardParts: [],
      fireballs: [],
      breakTiles: [],
      movingPlatforms: [],
      steppingBlocks: [],
      bounceCooldown: 0,
      springCompression: 0,
    };

    switch (def.kind) {
      case 'rotating_blades': {
        // 01. 4-Arm Metal Razor Rotor on crimson gear hub
        const pad = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.18, 5.6), stoneDark);
        pad.position.y = 0.09;
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.55, 10), bounceRedMat);
        hub.position.y = 0.36;
        const rotor = new THREE.Group();
        rotor.position.y = 0.55;
        for (let b = 0; b < 4; b++) {
          const arm = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.14, 0.48), metalSteel);
          const a = (b * Math.PI) / 2;
          arm.position.set(Math.cos(a) * 1.35, 0, Math.sin(a) * 1.35);
          arm.rotation.y = -a;
          arm.castShadow = true;
          const edge = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.08, 0.14), laserMat);
          edge.position.set(Math.cos(a) * 1.35, 0.04, Math.sin(a) * 1.35 + 0.18);
          edge.rotation.y = -a;
          rotor.add(arm, edge);
        }
        root.add(pad, hub, rotor);
        inst.spinners.push({ obj: rotor, speed: 2.15, axis: 'y' });
        break;
      }

      case 'swinging_spike': {
        // 02. Overhead timber gantry + chain pendulum spiked iron ball
        const postL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 5.8, 0.55), woodSpruce);
        postL.position.set(-2.6, 2.9, 0);
        const postR = postL.clone();
        postR.position.set(2.6, 2.9, 0);
        const beam = new THREE.Mesh(new THREE.BoxGeometry(5.9, 0.55, 0.65), metalDark);
        beam.position.set(0, 5.65, 0);
        const pivot = new THREE.Group();
        pivot.position.set(0, 5.4, 0);
        const chain = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.85, 0.24), metalDark);
        chain.position.y = -1.95;
        const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.92, 0), metalSteel);
        ball.position.y = -4.1;
        ball.castShadow = true;
        [
          [0, 1, 0],
          [0, -1, 0],
          [1, 0, 0],
          [-1, 0, 0],
          [0, 0, 1],
          [0, 0, -1],
        ].forEach(([sx, sy, sz]) => {
          const sp = buildSpikeCone(metalSteel, 0.22, 0.55);
          sp.position.set(sx * 0.95, -4.1 + sy * 0.95, sz * 0.95);
          if (sx !== 0) sp.rotation.z = -sx * (Math.PI / 2);
          if (sz !== 0) sp.rotation.x = sz * (Math.PI / 2);
          if (sy < 0) sp.rotation.x = Math.PI;
          pivot.add(sp);
        });
        pivot.add(chain, ball);
        root.add(postL, postR, beam, pivot);
        inst.swings.push({ obj: pivot, amp: 0.92, speed: 1.9, offset: 0, axis: 'z' });
        inst.hazardParts.push(ball);
        break;
      }

      case 'crushing_piston': {
        // 03. Heavy Stone Piston stamping down onto glowing magma anvil
        const anvil = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.35, 4.4), stoneDark);
        anvil.position.y = 0.17;
        const magmaRim = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.22, 3.8), magmaMat);
        magmaRim.position.y = 0.26;
        const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 5.2, 0.65), metalDark);
        frameL.position.set(-2.1, 2.6, 0);
        const frameR = frameL.clone();
        frameR.position.set(2.1, 2.6, 0);
        const topCap = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.65, 1.4), stoneLight);
        topCap.position.set(0, 5.1, 0);
        const piston = new THREE.Group();
        piston.position.set(0, 3.6, 0);
        const head = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.3, 3.4), stoneLight);
        head.castShadow = true;
        const rod = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.4, 0.95), metalSteel);
        rod.position.y = 1.4;
        piston.add(head, rod);
        root.add(anvil, magmaRim, frameL, frameR, topCap, piston);
        inst.pistons.push({ obj: piston, basePos: new THREE.Vector3(0, 3.8, 0), dir: new THREE.Vector3(0, -2.9, 0) });
        inst.warnGlows.push(magmaRim);
        break;
      }

      case 'lava_fountain': {
        // 04. Bubbling Magma Basin erupting rhythmic vertical lava plume
        const base = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.36, 4.6), stoneDark);
        base.position.y = 0.18;
        const pool = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.22, 3.6), magmaMat);
        pool.position.y = 0.32;
        const plume = new THREE.Group();
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.1, 4.2, 8), magmaMat);
        col.position.y = 2.1;
        const cap = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 0), warnMat);
        cap.position.y = 4.25;
        plume.add(col, cap);
        root.add(base, pool, plume);
        inst.hazardParts.push(plume);
        inst.warnGlows.push(pool);
        break;
      }

      case 'spinning_logs': {
        // 05. Paired rotating spiked timber rollers spanning wooden frame
        const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.65, 5.4), woodSpruce);
        frameL.position.set(-2.5, 0.32, 0);
        const frameR = frameL.clone();
        frameR.position.set(2.5, 0.32, 0);
        root.add(frameL, frameR);
        [-1.35, 1.35].forEach((oz, li) => {
          const logGrp = new THREE.Group();
          logGrp.position.set(0, 0.52, oz);
          const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 4.6, 10), woodOak);
          cyl.rotation.z = Math.PI / 2;
          cyl.castShadow = true;
          logGrp.add(cyl);
          for (let i = 0; i < 6; i++) {
            const sp = buildSpikeCone(metalSteel, 0.16, 0.42);
            const a = (i / 6) * Math.PI * 2;
            sp.position.set(-1.5 + (i % 3) * 1.5, Math.sin(a) * 0.64, Math.cos(a) * 0.64);
            sp.rotation.x = Math.PI / 2 - a;
            logGrp.add(sp);
          }
          root.add(logGrp);
          inst.spinners.push({ obj: logGrp, speed: li === 0 ? 2.4 : -2.4, axis: 'x' });
        });
        break;
      }

      case 'collapsing_path': {
        // 06. 3 Stepping Wooden Planks over bridge that shake & drop after stepping!
        for (let t = 0; t < 3; t++) {
          const tz = -2.2 + t * 2.2;
          const tile = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.36, 1.95), woodOak);
          tile.position.set(0, 0.12, tz);
          tile.castShadow = true;
          root.add(tile);
          inst.breakTiles.push({
            localZ: tz,
            halfW: 2.2,
            halfD: 1.0,
            mesh: tile,
            baseY: 0.12,
            state: 'intact',
            timer: 0,
          });
        }
        break;
      }

      case 'laser_barrier': {
        // 07. Twin Emitter Posts with 3 horizontal pulsing red laser beams
        const base = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.26, 1.4), stoneLight);
        base.position.y = 0.13;
        const postL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.6, 0.55), metalDark);
        postL.position.set(-2.5, 1.8, 0);
        const postR = postL.clone();
        postR.position.set(2.5, 1.8, 0);
        root.add(base, postL, postR);
        [0.85, 1.75, 2.65].forEach((ly) => {
          const beam = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.16, 0.16), laserMat);
          beam.position.set(0, ly, 0);
          root.add(beam);
          inst.lasers.push(beam);
        });
        const warnBox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.65), warnMat);
        warnBox.position.set(0, 0.3, 0);
        root.add(warnBox);
        inst.warnGlows.push(warnBox);
        break;
      }

      case 'rolling_boulder': {
        // 08. Stone Chute Lane with 2 Cyclically Rolling Voxel Boulders
        const track = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.24, 11.0), stoneDark);
        track.position.y = 0.12;
        const railL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 11.0), stoneLight);
        railL.position.set(-1.65, 0.32, 0);
        const railR = railL.clone();
        railR.position.set(1.65, 0.32, 0);
        root.add(track, railL, railR);
        [0, Math.PI].forEach((off) => {
          const b = new THREE.Mesh(new THREE.DodecahedronGeometry(1.12, 0), stoneLight);
          b.position.set(0, 1.25, 0);
          b.castShadow = true;
          root.add(b);
          inst.fireballs.push({ mesh: b, offset: off });
        });
        break;
      }

      case 'electrified_grid': {
        // 09. Checkerboard Steel Floor Grid pulsing blue high-voltage arcs
        const frame = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.24, 5.6), metalDark);
        frame.position.y = 0.12;
        const grille = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.28, 5.0), metalSteel);
        grille.position.y = 0.14;
        const arcPlane = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.35, 4.9), elecMat);
        arcPlane.position.y = 0.24;
        const warnPlate = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.2, 5.2), warnMat);
        warnPlate.position.y = 0.2;
        root.add(frame, grille, arcPlane, warnPlate);
        inst.lasers.push(arcPlane);
        inst.warnGlows.push(warnPlate);
        break;
      }

      case 'crushing_walls': {
        // 10. Paired Spiked Stone Slabs slamming inward across walkway
        const base = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.24, 4.2), stoneDark);
        base.position.y = 0.12;
        root.add(base);
        [-1, 1].forEach((side) => {
          const wall = new THREE.Group();
          wall.position.set(side * 2.8, 1.75, 0);
          const block = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.2, 3.6), stoneLight);
          block.castShadow = true;
          wall.add(block);
          for (let sz = -1.1; sz <= 1.1; sz += 1.1) {
            for (let sy = -0.8; sy <= 0.8; sy += 1.6) {
              const sp = buildSpikeCone(metalSteel, 0.22, 0.55);
              sp.position.set(-side * 0.95, sy, sz);
              sp.rotation.z = side * (Math.PI / 2);
              wall.add(sp);
            }
          }
          root.add(wall);
          inst.pistons.push({
            obj: wall,
            basePos: new THREE.Vector3(side * 3.1, 1.75, 0),
            dir: new THREE.Vector3(-side * 2.15, 0, 0),
          });
        });
        break;
      }

      case 'acid_fount': {
        // 11. Toxic Green Acid Basin with Fountain Pipe & Safe Rim Stones
        const basin = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.36, 5.2), stoneDark);
        basin.position.y = 0.18;
        const acidPool = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.26, 4.2), acidMat);
        acidPool.position.y = 0.28;
        const pipe = new THREE.Mesh(new THREE.BoxGeometry(0.85, 3.0, 0.85), metalSteel);
        pipe.position.set(0, 1.5, -2.2);
        const spout = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 1.4), metalSteel);
        spout.position.set(0, 2.75, -1.5);
        const pour = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.5, 0.65), acidMat);
        pour.position.set(0, 1.5, -0.95);
        root.add(basin, acidPool, pipe, spout, pour);
        inst.hazardParts.push(pour);
        inst.warnGlows.push(acidPool);
        break;
      }

      case 'fire_shooter': {
        // 12. Mounted Brass-Crimson Cannon firing rhythmic glowing fireballs
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 2.2), metalDark);
        base.position.y = 0.25;
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.35, 2.1), bounceRedMat);
        body.position.y = 1.15;
        body.castShadow = true;
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.4, 8), metalDark);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 1.25, 1.2);
        const fuse = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.28), magmaMat);
        fuse.position.set(0, 2.0, -0.4);
        root.add(base, body, barrel, fuse);
        [0, Math.PI].forEach((off) => {
          const fb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.56, 0), magmaMat);
          fb.position.set(0, 1.25, 1.8);
          root.add(fb);
          inst.fireballs.push({ mesh: fb, offset: off });
        });
        break;
      }

      case 'retractable_spikes': {
        // 13. 3x3 Metallic Floor Spikes rising out of warning plate
        const plate = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.26, 4.8), stoneDark);
        plate.position.y = 0.13;
        const glowPad = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.28, 4.4), warnMat);
        glowPad.position.y = 0.15;
        const spikeCluster = new THREE.Group();
        for (let ix = -1; ix <= 1; ix++) {
          for (let iz = -1; iz <= 1; iz++) {
            const sp = buildSpikeCone(metalSteel, 0.28, 1.45);
            sp.position.set(ix * 1.4, 0.7, iz * 1.4);
            spikeCluster.add(sp);
          }
        }
        root.add(plate, glowPad, spikeCluster);
        inst.pistons.push({
          obj: spikeCluster,
          basePos: new THREE.Vector3(0, -1.15, 0),
          dir: new THREE.Vector3(0, 1.25, 0),
        });
        inst.warnGlows.push(glowPad);
        break;
      }

      case 'toxic_gas': {
        // 14. Circular Stone Grate emitting rising green toxic cloud puffs
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.3, 0.42, 12), stoneDark);
        ring.position.y = 0.21;
        const core = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.46, 10), acidMat);
        core.position.y = 0.24;
        const cloudGrp = new THREE.Group();
        [
          [0, 1.4, 0, 1.5],
          [-0.8, 2.2, 0.5, 1.1],
          [0.8, 2.4, -0.5, 1.1],
        ].forEach(([cx, cy, cz, sz]) => {
          const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(sz, 0), acidMat);
          puff.position.set(cx, cy, cz);
          cloudGrp.add(puff);
        });
        root.add(ring, core, cloudGrp);
        inst.hazardParts.push(cloudGrp);
        inst.warnGlows.push(core);
        break;
      }

      case 'spinning_gears': {
        // 15. Golden Clockwork Bridge Track with Twin Counter-Rotating Spoked Gears (fits 5m bridge)
        const deck = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.34, 6.2), metalDark);
        deck.position.y = 0.17;
        root.add(deck);
        [-1.65, 1.65].forEach((gx, gi) => {
          const gear = new THREE.Group();
          gear.position.set(gx, 1.55, gi === 0 ? -0.9 : 0.9);
          const rim = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.22, 6, 12), goldMetal);
          const spokeA = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.24, 0.32), goldMetal);
          const spokeB = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.6, 0.32), goldMetal);
          gear.add(rim, spokeA, spokeB);
          for (let t = 0; t < 8; t++) {
            const a = (t / 8) * Math.PI * 2;
            const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.42), goldMetal);
            tooth.position.set(Math.cos(a) * 1.58, Math.sin(a) * 1.58, 0);
            tooth.rotation.z = a;
            gear.add(tooth);
          }
          root.add(gear);
          inst.spinners.push({ obj: gear, speed: gi === 0 ? 1.85 : -1.85, axis: 'z' });
        });
        break;
      }

      case 'ice_patch': {
        // 16. Frosty Slippery Ice Sheet with jagged corner ice spires
        const sheet = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.24, 6.4), iceMat);
        sheet.position.y = 0.12;
        root.add(sheet);
        [
          [-2.8, -2.8, 1.8],
          [2.8, -2.8, 2.1],
          [-2.8, 2.8, 1.6],
          [2.8, 2.8, 2.3],
        ].forEach(([ix, iz, ih]) => {
          const spire = buildSpikeCone(iceMat, 0.42, ih);
          spire.position.set(ix, ih * 0.5, iz);
          root.add(spire);
        });
        break;
      }

      case 'gust_vent': {
        // 17. Giant Stone Wind Fan blasting directional gusts
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 2.4), stoneDark);
        base.position.y = 0.22;
        const housing = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 1.1, 12), stoneLight);
        housing.rotation.x = Math.PI / 2;
        housing.position.y = 2.2;
        const fan = new THREE.Group();
        fan.position.set(0, 2.2, 0.25);
        for (let b = 0; b < 4; b++) {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.42, 3.2, 0.16), metalSteel);
          blade.rotation.z = (b * Math.PI) / 4;
          fan.add(blade);
        }
        const streakGrp = new THREE.Group();
        for (let s = 0; s < 3; s++) {
          const streak = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 2.2), iceMat);
          streak.position.set((s - 1) * 0.9, 1.4 + (s % 2) * 0.8, 2.5);
          streakGrp.add(streak);
        }
        root.add(base, housing, fan, streakGrp);
        inst.spinners.push({ obj: fan, speed: 6.5, axis: 'z' });
        inst.hazardParts.push(streakGrp);
        break;
      }

      case 'treadmill_spikes': {
        // 18. Moving Conveyor Belt pushing toward glowing rear spikes
        const belt = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.34, 6.2), conveyorMat);
        belt.position.y = 0.17;
        const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 6.4), warnMat);
        sideL.position.set(-2.2, 0.24, 0);
        const sideR = sideL.clone();
        sideR.position.set(2.2, 0.24, 0);
        root.add(belt, sideL, sideR);
        for (let sx = -1.5; sx <= 1.5; sx += 0.75) {
          const sp = buildSpikeCone(metalSteel, 0.24, 1.1);
          sp.position.set(sx, 0.72, -2.7);
          root.add(sp);
        }
        break;
      }

      case 'bouncy_pad': {
        // 19. Red & Blue Coiled Spring Launch Pad
        const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.32, 3.4), stoneDark);
        base.position.y = 0.16;
        const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.95, 10), bounceBlueMat);
        coil.position.y = 0.65;
        const cap = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.38, 2.8), bounceRedMat);
        cap.position.y = 1.15;
        cap.castShadow = true;
        root.add(base, coil, cap);
        inst.springTop = cap;
        break;
      }

      case 'chomping_trap': {
        // 20. Giant Hinged Steel Bear-Jaw Floor Clamp
        const plate = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.24, 4.6), stoneDark);
        plate.position.y = 0.12;
        root.add(plate);
        [-1, 1].forEach((side) => {
          const jaw = new THREE.Group();
          jaw.position.set(side * 1.9, 0.35, 0);
          const bar = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 4.0), metalSteel);
          bar.position.set(-side * 0.9, 0, 0);
          jaw.add(bar);
          for (let tz = -1.5; tz <= 1.5; tz += 1.0) {
            const tooth = buildSpikeCone(metalSteel, 0.22, 0.72);
            tooth.position.set(-side * 1.15, 0.35, tz);
            jaw.add(tooth);
          }
          root.add(jaw);
          inst.swings.push({ obj: jaw, amp: 0.78, speed: 2.0, offset: side > 0 ? 0 : Math.PI, axis: 'z' });
        });
        break;
      }

      // === SHEET B (21 - 40) ===
      case 'spinning_blade_track': {
        // 21. Twin Circular Saws sliding along recessed parallel floor rails
        const base = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.24, 4.8), stoneLight);
        base.position.y = 0.12;
        const rail1 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.12, 0.26), metalDark);
        rail1.position.set(0, 0.26, -1.0);
        const rail2 = rail1.clone();
        rail2.position.set(0, 0.26, 1.0);
        root.add(base, rail1, rail2);
        [-1.0, 1.0].forEach((rz, si) => {
          const saw = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.22, 14), metalSteel);
          saw.rotation.z = Math.PI / 2;
          saw.position.set(0, 0.65, rz);
          saw.castShadow = true;
          root.add(saw);
          inst.pistons.push({
            obj: saw,
            basePos: new THREE.Vector3(0, 0.65, rz),
            dir: new THREE.Vector3(si === 0 ? 2.1 : -2.1, 0, 0),
          });
          inst.spinners.push({ obj: saw, speed: 7.5, axis: 'x' });
        });
        break;
      }

      case 'lava_volcano': {
        // 22. Volcanic Magma Mound erupting glowing plume
        const mound = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 2.6, 1.65, 8), stoneDark);
        mound.position.y = 0.82;
        const crater = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.26, 8), magmaMat);
        crater.position.y = 1.62;
        const geyser = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.4, 7), magmaMat);
        geyser.position.y = 3.2;
        root.add(mound, crater, geyser);
        inst.hazardParts.push(geyser);
        inst.warnGlows.push(crater);
        break;
      }

      case 'swinging_mace_dual': {
        // 23. Dual Counter-Swinging Spiked Mace Pendulums
        const beam = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.55, 0.65), metalDark);
        beam.position.set(0, 5.8, 0);
        root.add(beam);
        [-1, 1].forEach((side) => {
          const piv = new THREE.Group();
          piv.position.set(side * 0.4, 5.6, 0);
          const chain = new THREE.Mesh(new THREE.BoxGeometry(0.22, 4.0, 0.22), metalSteel);
          chain.position.y = -2.0;
          const ball = new THREE.Mesh(new THREE.DodecahedronGeometry(0.88, 0), metalDark);
          ball.position.y = -4.25;
          ball.castShadow = true;
          piv.add(chain, ball);
          root.add(piv);
          inst.swings.push({ obj: piv, amp: 0.88, speed: 1.95, offset: side > 0 ? 0 : Math.PI, axis: 'z' });
        });
        break;
      }

      case 'collapsing_bridge': {
        // 24. Rope-Framed Chasm Slats that crack & break under weight
        const railL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.85, 6.8), woodSpruce);
        railL.position.set(-2.35, 0.42, 0);
        const railR = railL.clone();
        railR.position.set(2.35, 0.42, 0);
        root.add(railL, railR);
        for (let t = 0; t < 3; t++) {
          const tz = -2.1 + t * 2.1;
          const slat = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.34, 1.8), woodOak);
          slat.position.set(0, 0.14, tz);
          root.add(slat);
          inst.breakTiles.push({
            localZ: tz,
            halfW: 2.15,
            halfD: 0.98,
            mesh: slat,
            baseY: 0.14,
            state: 'intact',
            timer: 0,
          });
        }
        break;
      }

      case 'laser_gate': {
        // 25. Stone Archway Gate with Cycling Horizontal Red Laser Grid
        const colL = new THREE.Mesh(new THREE.BoxGeometry(0.95, 4.4, 0.95), stoneLight);
        colL.position.set(-2.4, 2.2, 0);
        const colR = colL.clone();
        colR.position.set(2.4, 2.2, 0);
        const lintel = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.9, 1.05), stoneDark);
        lintel.position.set(0, 4.45, 0);
        root.add(colL, colR, lintel);
        [0.85, 1.75, 2.65, 3.45].forEach((ly) => {
          const beam = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.18, 0.18), laserMat);
          beam.position.set(0, ly, 0);
          root.add(beam);
          inst.lasers.push(beam);
        });
        const warnBox = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.7), warnMat);
        warnBox.position.set(0, 3.9, 0);
        root.add(warnBox);
        inst.warnGlows.push(warnBox);
        break;
      }

      case 'spike_trap': {
        // 26. Permanent Stone Spike Bed (jump or step around rim!)
        const slab = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.24, 4.2), stoneLight);
        slab.position.y = 0.12;
        root.add(slab);
        for (let ix = -1; ix <= 1; ix++) {
          for (let iz = -1; iz <= 1; iz++) {
            const sp = buildSpikeCone(metalSteel, 0.26, 1.18);
            sp.position.set(ix * 1.25, 0.72, iz * 1.25);
            sp.castShadow = true;
            root.add(sp);
          }
        }
        break;
      }

      case 'boulder_chute': {
        // 27. Chiseled Stone Trough Rolling Massive Sphere Downhill
        const bed = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.28, 12.0), stoneDark);
        bed.position.y = 0.14;
        const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.95, 12.0), stoneLight);
        wallL.position.set(-1.75, 0.48, 0);
        const wallR = wallL.clone();
        wallR.position.set(1.75, 0.48, 0);
        const bigBoulder = new THREE.Mesh(new THREE.IcosahedronGeometry(1.38, 1), stoneLight);
        bigBoulder.position.set(0, 1.5, 0);
        bigBoulder.castShadow = true;
        root.add(bed, wallL, wallR, bigBoulder);
        inst.fireballs.push({ mesh: bigBoulder, offset: 0 });
        break;
      }

      case 'burning_treadmill': {
        // 28. Flaming Conveyor Belt over Glowing Magma Bed
        const bed = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.22, 6.8), magmaMat);
        bed.position.y = 0.11;
        const belt = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.36, 6.2), conveyorMat);
        belt.position.y = 0.26;
        root.add(bed, belt);
        for (let f = -1.6; f <= 1.6; f += 1.6) {
          const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), magmaMat);
          flame.position.set(f, 0.95, 0);
          root.add(flame);
          inst.hazardParts.push(flame);
        }
        break;
      }

      case 'crushing_monoliths': {
        // 29. Heavy Spiked Monoliths guarding Terowongan Kronos
        [-1, 1].forEach((side) => {
          const mono = new THREE.Group();
          mono.position.set(side * 3.8, 2.2, 0);
          const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 4.4, 3.4), stoneDark);
          body.castShadow = true;
          mono.add(body);
          for (let sy = -1.2; sy <= 1.2; sy += 1.2) {
            const sp = buildSpikeCone(goldMetal, 0.26, 0.62);
            sp.position.set(-side * 1.25, sy, 0);
            sp.rotation.z = side * (Math.PI / 2);
            mono.add(sp);
          }
          root.add(mono);
          inst.pistons.push({
            obj: mono,
            basePos: new THREE.Vector3(side * 4.0, 2.2, 0),
            dir: new THREE.Vector3(-side * 2.5, 0, 0),
          });
        });
        break;
      }

      case 'tesla_grid': {
        // 30. Alternating Phase-A / Phase-B Tesla Electric Floor Tiles
        const padA = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.28, 5.2), metalDark);
        padA.position.set(-1.5, 0.14, 0);
        const padB = padA.clone();
        padB.position.set(1.5, 0.14, 0);
        const arcA = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.36, 5.0), elecMat);
        arcA.position.set(-1.5, 0.22, 0);
        const arcB = arcA.clone();
        arcB.position.set(1.5, 0.22, 0);
        root.add(padA, padB, arcA, arcB);
        inst.lasers.push(arcA, arcB);
        break;
      }

      case 'toxic_slime_pool': {
        // 31. Bubbling Green Slime Pool with 4 Safe Mossy Stone Stepping Blocks!
        const rim = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.28, 6.8), stoneDark);
        rim.position.y = 0.14;
        const slime = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.3, 6.2), acidMat);
        slime.position.y = 0.22;
        root.add(rim, slime);
        const stoneMat = palette.getMat(0x65a30d, 'matte');
        [
          [-1.6, -1.5],
          [1.5, -1.6],
          [-1.5, 1.5],
          [1.6, 1.5],
        ].forEach(([sx, sz]) => {
          const blk = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.62, 1.75), stoneMat);
          blk.position.set(sx, 0.34, sz);
          blk.castShadow = true;
          root.add(blk);
          inst.steppingBlocks.push({ localX: sx, localZ: sz, halfW: 0.96, halfD: 0.96, topY: baseY + 0.65 });
        });
        break;
      }

      case 'falling_stalactites': {
        // 32. Overhead Cave Stalactites with Ground Target Warning Shadow
        const archL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 6.2, 0.6), stoneDark);
        archL.position.set(-2.6, 3.1, 0);
        const archR = archL.clone();
        archR.position.set(2.6, 3.1, 0);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.7, 3.2), stoneDark);
        roof.position.set(0, 6.1, 0);
        const shadowRing = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.1, 14), warnMat);
        shadowRing.position.set(0, 0.12, 0);
        const stal = new THREE.Group();
        stal.position.set(0, 5.2, 0);
        [
          [0, 0, 1.85],
          [-0.9, 0.5, 1.35],
          [0.9, -0.5, 1.35],
        ].forEach(([sx, sz, sh]) => {
          const cone = buildSpikeCone(stoneLight, 0.44, sh);
          cone.rotation.x = Math.PI;
          cone.position.set(sx, -sh * 0.5, sz);
          stal.add(cone);
        });
        root.add(archL, archR, roof, shadowRing, stal);
        inst.pistons.push({ obj: stal, basePos: new THREE.Vector3(0, 5.3, 0), dir: new THREE.Vector3(0, -3.5, 0) });
        inst.warnGlows.push(shadowRing);
        break;
      }

      case 'piston_pusher': {
        // 33. Horizontal Wall Piston Shoving Hero Across Corridor
        const housing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 3.2), stoneDark);
        housing.position.set(-2.6, 1.4, 0);
        const pusher = new THREE.Group();
        pusher.position.set(-1.6, 1.3, 0);
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.2, 2.6), stoneLight);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.75, 0.75), goldMetal);
        arm.position.x = -1.5;
        pusher.add(pad, arm);
        root.add(housing, pusher);
        inst.pistons.push({ obj: pusher, basePos: new THREE.Vector3(-1.4, 1.3, 0), dir: new THREE.Vector3(3.4, 0, 0) });
        break;
      }

      case 'spinning_fire_bar': {
        // 34. 4-Arm Blazing Fire Bar Rotating Around Central Hub
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.85, 1.1, 10), stoneDark);
        hub.position.y = 0.55;
        const bar = new THREE.Group();
        bar.position.y = 0.92;
        for (let a = 0; a < 4; a++) {
          const armAng = (a * Math.PI) / 2;
          for (let r = 1.0; r <= 3.1; r += 0.7) {
            const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 0), magmaMat);
            orb.position.set(Math.cos(armAng) * r, 0, Math.sin(armAng) * r);
            bar.add(orb);
          }
        }
        root.add(hub, bar);
        inst.spinners.push({ obj: bar, speed: 1.45, axis: 'y' });
        break;
      }

      case 'moving_platforms': {
        // 35. 3 Vertical Stone Elevator Pillars Oscillating in Slope Chasm
        for (let i = 0; i < 3; i++) {
          const ox = -3.4 + i * 3.4;
          const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 4.0, 2.6), stoneLight);
          pillar.position.set(ox, 0, 0);
          pillar.castShadow = true;
          root.add(pillar);
          inst.movingPlatforms.push({
            localX: ox,
            localZ: 0,
            halfW: 1.45,
            halfD: 1.45,
            baseY: baseY + 2.1 + i * 1.15,
            ampY: 1.35,
            speed: 1.35,
            phase: i * 1.8,
            currentY: baseY + 2.1 + i * 1.15,
            mesh: pillar,
          });
        }
        break;
      }

      case 'shattering_glass': {
        // 36. Translucent Ice-Blue Glass Bridge Tiles that Crack & Shatter Briefly
        for (let t = 0; t < 3; t++) {
          const tz = -2.2 + t * 2.2;
          const glass = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.28, 1.98), iceMat);
          glass.position.set(0, 0.1, tz);
          root.add(glass);
          inst.breakTiles.push({
            localZ: tz,
            halfW: 2.3,
            halfD: 1.02,
            mesh: glass,
            baseY: 0.1,
            state: 'intact',
            timer: 0,
          });
        }
        break;
      }

      case 'wind_turbine': {
        // 37. Cylindrical Wind Turbine Blowing Across Village Ridge
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 2.2, 12), stoneLight);
        drum.rotation.x = Math.PI / 2;
        drum.position.y = 1.9;
        const rotor = new THREE.Group();
        rotor.position.set(0, 1.9, 1.15);
        for (let b = 0; b < 4; b++) {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.36, 2.9, 0.16), metalSteel);
          blade.rotation.z = (b * Math.PI) / 4;
          rotor.add(blade);
        }
        const gust = new THREE.Group();
        for (let g = 0; g < 3; g++) {
          const cube = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 1.8), iceMat);
          cube.position.set((g - 1) * 0.85, 1.5 + (g % 2) * 0.7, 2.8);
          gust.add(cube);
        }
        root.add(drum, rotor, gust);
        inst.spinners.push({ obj: rotor, speed: 6.2, axis: 'z' });
        inst.hazardParts.push(gust);
        break;
      }

      case 'ice_slide': {
        // 38. Sleek Curved Frozen Ice Slide Chute
        const curbL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.75, 8.2), stoneLight);
        curbL.position.set(-2.3, 0.38, 0);
        const curbR = curbL.clone();
        curbR.position.set(2.3, 0.38, 0);
        const slide = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.24, 8.2), iceMat);
        slide.position.y = 0.12;
        root.add(curbL, curbR, slide);
        break;
      }

      case 'ice_breaker': {
        // 39. Twin Swinging Blue Ice-Pick Pendulums
        const floor = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.22, 4.4), iceMat);
        floor.position.y = 0.11;
        const bar = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.48, 0.55), stoneDark);
        bar.position.set(0, 5.6, 0);
        root.add(floor, bar);
        [-1, 1].forEach((side) => {
          const piv = new THREE.Group();
          piv.position.set(side * 0.5, 5.4, 0);
          const rod = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.8, 0.22), metalSteel);
          rod.position.y = -1.9;
          const pick = buildSpikeCone(iceMat, 0.75, 1.35);
          pick.rotation.x = Math.PI;
          pick.position.y = -4.05;
          piv.add(rod, pick);
          root.add(piv);
          inst.swings.push({ obj: piv, amp: 0.85, speed: 2.0, offset: side > 0 ? 0 : Math.PI, axis: 'z' });
        });
        break;
      }

      case 'crystal_shards': {
        // 40. Pulsing Purple Amethyst Floor Shards Erupting on Rhythm
        const bed = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.22, 5.2), stoneDark);
        bed.position.y = 0.11;
        const glow = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.24, 4.8), crystalHazardMat);
        glow.position.y = 0.13;
        const spikes = new THREE.Group();
        [
          [0, 0, 2.2],
          [-1.5, -1.2, 1.65],
          [1.5, -1.1, 1.75],
          [-1.4, 1.3, 1.6],
          [1.4, 1.3, 1.7],
        ].forEach(([cx, cz, ch]) => {
          const sp = new THREE.Mesh(new THREE.ConeGeometry(0.42, ch, 5), crystalHazardMat);
          sp.position.set(cx, ch * 0.5, cz);
          spikes.add(sp);
        });
        root.add(bed, glow, spikes);
        inst.pistons.push({ obj: spikes, basePos: new THREE.Vector3(0, -1.8, 0), dir: new THREE.Vector3(0, 1.9, 0) });
        inst.warnGlows.push(glow);
        break;
      }
    }

    instances.push(inst);
  });

  // Track every procedural BufferGeometry inside the obstacle rig for clean disposal
  const seenGeo = new Set<THREE.BufferGeometry>();
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.geometry && !seenGeo.has(obj.geometry)) {
      seenGeo.add(obj.geometry);
      disposables.push(obj.geometry);
    }
  });

  return { group, instances, disposables };
}

export function getObstacleSupportHeight(
  rig: WorldObstaclesRig,
  x: number,
  z: number,
  heroY: number,
): number | null {
  let bestY: number | null = null;
  for (let i = 0; i < rig.instances.length; i++) {
    const inst = rig.instances[i];
    if (Math.abs(x - inst.def.x) > 8.5 || Math.abs(z - inst.def.z) > 8.5) continue;
    const { lx, lz } = toLocalXZ(x, z, inst.def.x, inst.def.z, inst.cosY, inst.sinY);

    // 1. Stepping blocks in Toxic Slime Pool
    for (let b = 0; b < inst.steppingBlocks.length; b++) {
      const sb = inst.steppingBlocks[b];
      if (Math.abs(lx - sb.localX) <= sb.halfW && Math.abs(lz - sb.localZ) <= sb.halfD && heroY >= sb.topY - 1.25) {
        if (bestY === null || sb.topY > bestY) bestY = sb.topY;
      }
    }

    // 2. Oscillating Elevator Pillars
    for (let p = 0; p < inst.movingPlatforms.length; p++) {
      const mp = inst.movingPlatforms[p];
      if (Math.abs(lx - mp.localX) <= mp.halfW && Math.abs(lz - mp.localZ) <= mp.halfD && heroY >= mp.currentY - 1.4) {
        if (bestY === null || mp.currentY > bestY) bestY = mp.currentY;
      }
    }

    // 3. Intact / Shaking Breakable Bridge & Glass Tiles
    for (let b = 0; b < inst.breakTiles.length; b++) {
      const bt = inst.breakTiles[b];
      if (bt.state !== 'gone' && Math.abs(lx) <= bt.halfW && Math.abs(lz - bt.localZ) <= bt.halfD) {
        const tileTop = inst.baseY + 0.28;
        if (heroY >= tileTop - 1.25 && (bestY === null || tileTop > bestY)) {
          bestY = tileTop;
        }
      }
    }

    // 4. Bouncy Pad top
    if (inst.def.kind === 'bouncy_pad') {
      const d = Math.hypot(lx, lz);
      const topY = inst.baseY + 1.34;
      if (d <= 1.7 && heroY >= topY - 1.25) {
        if (bestY === null || topY > bestY) bestY = topY;
      }
    }
  }
  return bestY;
}

export function updateAndEvaluateObstacles(
  rig: WorldObstaclesRig,
  dt: number,
  elapsed: number,
  heroPos: THREE.Vector3,
  heroVel: THREE.Vector3,
  heroOnGround: boolean,
  canTakeDamage: boolean,
): ObstacleEvaluationResult {
  let onIce = false;
  let pushX = 0;
  let pushZ = 0;
  let bounceVelY = 0;
  let supportY: number | null = null;
  let hazardHit: ObstacleEvaluationResult['hazardHit'] = null;

  for (let i = 0; i < rig.instances.length; i++) {
    const inst = rig.instances[i];
    const kind = inst.def.kind;
    const t = elapsed + inst.phase;
    if (inst.bounceCooldown > 0) inst.bounceCooldown = Math.max(0, inst.bounceCooldown - dt);

    // 1. Update continuous spinners
    for (let s = 0; s < inst.spinners.length; s++) {
      const sp = inst.spinners[s];
      sp.obj.rotation[sp.axis] += sp.speed * dt;
    }

    // 2. Update pendulums & chomping jaws
    for (let w = 0; w < inst.swings.length; w++) {
      const sw = inst.swings[w];
      sw.obj.rotation[sw.axis] = Math.sin(t * sw.speed + sw.offset) * sw.amp;
    }

    // 3. Update rhythmic cycles (3-phase: Safe -> Telegraph -> Active)
    const cyc = (t % 3.8) / 3.8; // 0..1 every 3.8s
    const isWarn = cyc >= 0.48 && cyc < 0.72;
    const isActive = cyc >= 0.72;

    if (
      kind === 'crushing_piston' ||
      kind === 'crushing_walls' ||
      kind === 'crushing_monoliths' ||
      kind === 'retractable_spikes' ||
      kind === 'crystal_shards' ||
      kind === 'falling_stalactites' ||
      kind === 'piston_pusher'
    ) {
      const ext = isActive
        ? Math.min(1, (cyc - 0.72) / 0.08)
        : cyc < 0.14
        ? Math.max(0, 1 - cyc / 0.14)
        : isWarn
        ? 0.08 + Math.sin(t * 28) * 0.04
        : 0;
      for (let p = 0; p < inst.pistons.length; p++) {
        const pt = inst.pistons[p];
        pt.obj.position.copy(pt.basePos).addScaledVector(pt.dir, ext);
      }
    } else if (kind === 'spinning_blade_track') {
      for (let p = 0; p < inst.pistons.length; p++) {
        const pt = inst.pistons[p];
        const slide = Math.sin(t * 1.9);
        pt.obj.position.copy(pt.basePos).addScaledVector(pt.dir, slide);
      }
    }

    // Lasers & Tesla alternating grids
    if (kind === 'laser_barrier' || kind === 'laser_gate' || kind === 'electrified_grid') {
      for (let l = 0; l < inst.lasers.length; l++) {
        inst.lasers[l].visible = isActive;
      }
      for (let w = 0; w < inst.warnGlows.length; w++) {
        inst.warnGlows[w].visible = isWarn || isActive;
        inst.warnGlows[w].scale.setScalar(isWarn ? 1.0 + Math.sin(t * 22) * 0.12 : 1.0);
      }
    } else if (kind === 'tesla_grid') {
      const phaseA = Math.floor((t / 2.2) % 2) === 0;
      if (inst.lasers.length >= 2) {
        inst.lasers[0].visible = phaseA;
        inst.lasers[1].visible = !phaseA;
      }
    } else if (
      kind === 'lava_fountain' ||
      kind === 'lava_volcano' ||
      kind === 'acid_fount' ||
      kind === 'toxic_gas' ||
      kind === 'burning_treadmill'
    ) {
      for (let h = 0; h < inst.hazardParts.length; h++) {
        const hp = inst.hazardParts[h];
        hp.visible = isActive || isWarn;
        const scY = isActive ? 0.95 + Math.sin(t * 14) * 0.12 : 0.25;
        hp.scale.set(isActive ? 1.0 : 0.55, scY, isActive ? 1.0 : 0.55);
      }
    } else if (kind === 'gust_vent' || kind === 'wind_turbine') {
      const blowing = cyc >= 0.42;
      for (let h = 0; h < inst.hazardParts.length; h++) {
        inst.hazardParts[h].visible = blowing;
        inst.hazardParts[h].position.z = ((t * 4.5) % 3.2);
      }
    }

    // Fireballs & Boulders sweeping lane
    for (let f = 0; f < inst.fireballs.length; f++) {
      const fb = inst.fireballs[f];
      if (kind === 'fire_shooter') {
        const prog = ((t * 0.42 + fb.offset / (Math.PI * 2)) % 1 + 1) % 1;
        fb.mesh.position.set(0, 1.25, 1.6 + prog * 11.5);
      } else {
        const prog = ((t * 0.34 + fb.offset / (Math.PI * 2)) % 1 + 1) % 1;
        fb.mesh.position.set(0, kind === 'boulder_chute' ? 1.45 : 1.25, -5.0 + prog * 10.0);
        fb.mesh.rotation.x += dt * 4.5;
      }
    }

    // Moving Elevator Platforms
    for (let p = 0; p < inst.movingPlatforms.length; p++) {
      const mp = inst.movingPlatforms[p];
      const targetY = mp.baseY + Math.sin(elapsed * mp.speed + mp.phase) * mp.ampY;
      mp.currentY = targetY;
      mp.mesh.position.y = targetY - inst.baseY - 2.0; // box height 4.0 -> top is currentY!
    }

    // Spring recovery
    if (inst.springTop) {
      inst.springCompression = Math.max(0, inst.springCompression - dt * 4.2);
      inst.springTop.position.y = 1.15 - inst.springCompression * 0.45;
    }

    // Breakable Tiles (Collapsing Path, Collapsing Bridge, Shattering Glass)
    for (let b = 0; b < inst.breakTiles.length; b++) {
      const bt = inst.breakTiles[b];
      if (bt.state === 'shaking') {
        bt.timer += dt;
        bt.mesh.position.y = bt.baseY + Math.sin(bt.timer * 48) * 0.08;
        if (bt.timer >= 0.78) {
          bt.state = 'gone';
          bt.timer = 0;
        }
      } else if (bt.state === 'gone') {
        bt.timer += dt;
        bt.mesh.position.y = bt.baseY - Math.min(2.6, bt.timer * 7.5);
        bt.mesh.visible = bt.timer < 0.35;
        if (bt.timer >= 2.2) {
          bt.state = 'intact';
          bt.timer = 0;
          bt.mesh.position.y = bt.baseY;
          bt.mesh.visible = true;
        }
      }
    }

    // === HERO INTERACTION CHECK (fast bounding cull first) ===
    const dx = heroPos.x - inst.def.x;
    const dz = heroPos.z - inst.def.z;
    if (dx * dx + dz * dz > 169.0) continue; // >13m away

    const dy = heroPos.y - inst.baseY;
    const { lx, lz } = toLocalXZ(heroPos.x, heroPos.z, inst.def.x, inst.def.z, inst.cosY, inst.sinY);

    // A. Breakable tile step trigger + support (local rotated coords)
    for (let b = 0; b < inst.breakTiles.length; b++) {
      const bt = inst.breakTiles[b];
      if (Math.abs(lx) <= bt.halfW && Math.abs(lz - bt.localZ) <= bt.halfD) {
        if (bt.state !== 'gone' && dy >= -0.8 && dy <= 1.2) {
          const tileTop = inst.baseY + 0.28;
          if (supportY === null || tileTop > supportY) supportY = tileTop;
          if (bt.state === 'intact' && heroOnGround) {
            bt.state = 'shaking';
            bt.timer = 0;
          }
        }
      }
    }

    // B. Bouncy Pad Launch
    if (kind === 'bouncy_pad' && Math.hypot(lx, lz) <= 1.75 && dy >= 0.3 && dy <= 2.1 && inst.bounceCooldown <= 0) {
      bounceVelY = 16.5;
      inst.bounceCooldown = 0.45;
      inst.springCompression = 1.0;
    }

    // C. Ice Patches & Ice Slide
    if ((kind === 'ice_patch' || kind === 'ice_slide' || kind === 'ice_breaker') && Math.abs(lx) <= 3.2 && Math.abs(lz) <= 4.1 && dy <= 1.2 && dy >= -0.6) {
      onIce = true;
      if (kind === 'ice_slide') {
        pushX += inst.sinY * 42.0;
        pushZ += inst.cosY * 42.0;
      }
    }

    // D. Wind Gusts & Conveyors & Piston Pusher
    if ((kind === 'gust_vent' || kind === 'wind_turbine') && Math.abs(lx) <= 2.4 && lz >= 0.2 && lz <= 6.8 && dy >= -0.6 && dy <= 3.6) {
      if (cyc >= 0.42) {
        pushX += inst.sinY * 38.0;
        pushZ += inst.cosY * 38.0;
      }
    }
    if ((kind === 'treadmill_spikes' || kind === 'burning_treadmill') && Math.abs(lx) <= 2.2 && Math.abs(lz) <= 3.1 && dy >= -0.4 && dy <= 1.1) {
      // Belt pushes toward -Z local (rear spikes)
      pushX -= inst.sinY * 34.0;
      pushZ -= inst.cosY * 34.0;
    }
    if (kind === 'piston_pusher' && isActive && Math.abs(lz) <= 1.6 && lx >= -1.6 && lx <= 2.4 && dy >= -0.4 && dy <= 2.8) {
      pushX += inst.cosY * 145.0;
      pushZ -= inst.sinY * 145.0;
    }

    // E. Active Damage Checks (only if canTakeDamage & not already hit this frame)
    if (!canTakeDamage || hazardHit !== null) continue;

    let touched = false;
    if (kind === 'rotating_blades') {
      if (dy >= -0.3 && dy <= 1.1 && Math.hypot(lx, lz) <= 2.65 && Math.hypot(lx, lz) >= 0.55) {
        const ang = inst.spinners[0].obj.rotation.y;
        const pAng = Math.atan2(lz, lx);
        for (let b = 0; b < 4; b++) {
          let diff = (pAng - (ang + (b * Math.PI) / 2)) % (Math.PI * 2);
          if (diff > Math.PI) diff -= Math.PI * 2;
          if (diff < -Math.PI) diff += Math.PI * 2;
          if (Math.abs(diff) < 0.22) touched = true;
        }
      }
    } else if (kind === 'spinning_fire_bar') {
      if (dy >= -0.2 && dy <= 1.45 && Math.hypot(lx, lz) <= 3.25 && Math.hypot(lx, lz) >= 0.65) {
        const ang = inst.spinners[0].obj.rotation.y;
        const pAng = Math.atan2(lz, lx);
        for (let b = 0; b < 4; b++) {
          let diff = (pAng - (ang + (b * Math.PI) / 2)) % (Math.PI * 2);
          if (diff > Math.PI) diff -= Math.PI * 2;
          if (diff < -Math.PI) diff += Math.PI * 2;
          if (Math.abs(diff) < 0.22) touched = true;
        }
      }
    } else if (kind === 'swinging_spike' || kind === 'swinging_mace_dual' || kind === 'ice_breaker') {
      for (let w = 0; w < inst.swings.length; w++) {
        const piv = inst.swings[w].obj;
        const ang = piv.rotation.z;
        const bx = piv.position.x + Math.sin(ang) * 4.1;
        const by = piv.position.y - Math.cos(ang) * 4.1;
        if (Math.abs(lx - bx) <= 1.25 && Math.abs(lz) <= 1.35 && Math.abs(dy - (by - 0.6)) <= 1.35) {
          touched = true;
        }
      }
    } else if (kind === 'crushing_piston' || kind === 'falling_stalactites') {
      if (isActive && Math.abs(lx) <= 1.85 && Math.abs(lz) <= 1.85 && dy >= -0.3 && dy <= 2.3) {
        touched = true;
      }
    } else if (kind === 'crushing_walls' || kind === 'crushing_monoliths') {
      if (isActive && Math.abs(lx) <= 1.5 && Math.abs(lz) <= 1.9 && dy >= -0.3 && dy <= 3.4) {
        touched = true;
      }
    } else if (kind === 'laser_barrier' || kind === 'laser_gate') {
      if (isActive && Math.abs(lx) <= 2.4 && Math.abs(lz) <= 0.65 && dy >= -0.2 && dy <= 3.6) {
        touched = true;
      }
    } else if (kind === 'electrified_grid') {
      if (isActive && Math.abs(lx) <= 2.5 && Math.abs(lz) <= 2.5 && dy >= -0.3 && dy <= 0.95) {
        touched = true;
      }
    } else if (kind === 'tesla_grid') {
      const phaseA = Math.floor((t / 2.2) % 2) === 0;
      if (dy >= -0.3 && dy <= 0.95 && Math.abs(lz) <= 2.5) {
        if ((phaseA && lx >= -2.9 && lx <= -0.1) || (!phaseA && lx >= 0.1 && lx <= 2.9)) {
          touched = true;
        }
      }
    } else if (kind === 'retractable_spikes' || kind === 'crystal_shards') {
      if (isActive && Math.abs(lx) <= 2.35 && Math.abs(lz) <= 2.35 && dy >= -0.3 && dy <= 1.25) {
        touched = true;
      }
    } else if (kind === 'spike_trap') {
      if (Math.abs(lx) <= 1.85 && Math.abs(lz) <= 1.85 && dy >= -0.2 && dy <= 1.05) {
        touched = true;
      }
    } else if (kind === 'lava_fountain' || kind === 'lava_volcano' || kind === 'toxic_gas') {
      if (isActive && Math.hypot(lx, lz) <= 1.95 && dy >= -0.3 && dy <= 3.6) {
        touched = true;
      }
    } else if (kind === 'acid_fount') {
      if (Math.abs(lx) <= 2.05 && Math.abs(lz) <= 2.05 && dy >= -0.3 && dy <= 0.9) {
        touched = true;
      }
    } else if (kind === 'toxic_slime_pool') {
      // Safe when standing on any of the 4 stone blocks OR jumped cleanly above!
      let onStone = false;
      for (let b = 0; b < inst.steppingBlocks.length; b++) {
        const sb = inst.steppingBlocks[b];
        if (Math.abs(lx - sb.localX) <= sb.halfW + 0.15 && Math.abs(lz - sb.localZ) <= sb.halfD + 0.15) {
          onStone = true;
          break;
        }
      }
      if (!onStone && Math.abs(lx) <= 2.95 && Math.abs(lz) <= 2.95 && dy >= -0.3 && dy <= 0.48) {
        touched = true;
      }
    } else if (kind === 'chomping_trap') {
      const closed = Math.abs(Math.sin(t * 2.0)) < 0.28;
      if (closed && Math.abs(lx) <= 1.6 && Math.abs(lz) <= 2.0 && dy >= -0.3 && dy <= 1.35) {
        touched = true;
      }
    } else if (kind === 'treadmill_spikes') {
      if (Math.abs(lx) <= 1.9 && lz <= -2.1 && lz >= -3.15 && dy >= -0.2 && dy <= 1.1) {
        touched = true;
      }
    } else if (kind === 'burning_treadmill') {
      if (isActive && Math.abs(lx) <= 1.9 && Math.abs(lz) <= 2.6 && dy >= -0.2 && dy <= 1.25) {
        touched = true;
      }
    } else if (kind === 'spinning_logs') {
      if (Math.abs(lx) <= 2.3 && (Math.abs(lz + 1.35) <= 0.85 || Math.abs(lz - 1.35) <= 0.85) && dy >= -0.2 && dy <= 1.05) {
        touched = true;
      }
    } else if (kind === 'spinning_blade_track') {
      for (let p = 0; p < inst.pistons.length; p++) {
        const saw = inst.pistons[p].obj;
        if (Math.abs(lx - saw.position.x) <= 1.0 && Math.abs(lz - saw.position.z) <= 0.72 && dy >= -0.2 && dy <= 1.55) {
          touched = true;
        }
      }
    } else if (kind === 'fire_shooter' || kind === 'rolling_boulder' || kind === 'boulder_chute') {
      for (let f = 0; f < inst.fireballs.length; f++) {
        const fb = inst.fireballs[f].mesh;
        const rad = kind === 'boulder_chute' ? 1.55 : kind === 'rolling_boulder' ? 1.3 : 0.85;
        if (
          Math.abs(lx - fb.position.x) <= rad &&
          Math.abs(lz - fb.position.z) <= rad &&
          Math.abs(dy - fb.position.y) <= rad + 0.35
        ) {
          touched = true;
        }
      }
    } else if (kind === 'spinning_gears') {
      if (dy >= -0.2 && dy <= 2.3 && Math.abs(lz) <= 1.2 && (Math.abs(lx + 1.65) <= 0.65 || Math.abs(lx - 1.65) <= 0.65)) {
        touched = true;
      }
    }

    if (touched) {
      const kLen = Math.max(0.25, Math.hypot(dx, dz));
      hazardHit = {
        name: inst.def.name,
        hint: inst.def.hint,
        knockX: (dx / kLen) * 14.5,
        knockZ: (dz / kLen) * 14.5,
      };
    }
  }

  // Keep scratch vars referenced cleanly for zero-allocation path checks
  _localScratch.set(0, 0, 0);
  _worldScratch.set(0, 0, 0);

  return {
    onIce,
    pushX,
    pushZ,
    bounceVelY,
    supportY,
    hazardHit,
  };
}
