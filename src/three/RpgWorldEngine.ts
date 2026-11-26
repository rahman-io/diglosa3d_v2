import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { soundEngine } from '../audio/soundEngine';
import {
  ACADEMY_INHABITANTS,
  ACADEMY_NPCS,
  ACADEMY_SHADOWS,
  ALL_OVERWORLD_NPCS,
  AMMO_COST,
  BOSSES,
  DAILY_GOAL,
  DIFF_CONFIG,
  DOOR_MINI_MONSTER,
  DOOR_RESTORED_STORY,
  getActiveZoneNpcDef,
  getLevelInfo,
  getRankTitle,
  getZoneNpcById,
  MAX_AMMO,
  NPC_CATALOG,
  RELICS,
  RIBBONS,
  SAVE_KEY,
  TUNE,
  WEAPON_ORDER,
  WEAPONS,
  ZONE_CAVE_STORIES,
  ZONE_DOORS,
  ZONE_INFO,
} from '../data/diglosaCatalog';
import {
  AreaWaveDeal,
  computeAreaWaveDeal,
  getWordsForZone,
  VOCAB_BY_ID,
  VOCAB_CATALOG,
} from '../data/vocabCatalog';
import {
  getCharacterPreset,
  getMultiplayerGroupSpawnPoint,
  loadSavedCharacterId,
  loadSavedPlayerName,
  RANDOM_SPAWN_POINTS,
} from '../data/characterPresets';
import {
  AimMode,
  AreaMonsterStats,
  BattleContext,
  CameraMode,
  CarHudState,
  CaveSealContext,
  CharacterPresetId,
  DayPhaseId,
  DifficultyMode,
  DivingGearId,
  DungeonZoneState,
  GamePhase,
  GameSettings,
  JumpDiveTrick,
  LearningSessionContext,
  LiveMapBounds,
  LiveMapSnapshot,
  LocalPlayerSyncPacket,
  MonsterType,
  NearbyInjuredPeer,
  OceanMaterials,
  OceanSurvivalState,
  P2pReliableMessage,
  PickaxeTier,
  PlaneAmmoType,
  PlaneHudState,
  PlaneMode,
  PlaneVariant,
  ProjectedLabel,
  RadarBlip,
  RadarBlipKind,
  RadarState,
  RelicId,
  RemotePlayerState,
  RpgHudSnapshot,
  RpgQuestState,
  SeaBiotaId,
  SpawnPreference,
  StoryDialogState,
  SwimStyleId,
  SwimStylePreference,
  SyncMonsterSnapshot,
  SyncShooterSnapshot,
  WaveMissionState,
  WaveMonsterGroupSummary,
  WeaponId,
  WordProgress,
  WorldLocationMode,
  WorldTimeState,
  ZoneId,
} from '../types/game';
import {
  ArchipelagoUnderwaterRig,
  createArchipelagoUnderwaterProps,
  createOceanEnvironment,
  DIVING_GEAR_DEFS,
  getArchipelagoOceanZoneInfo,
  getBiotaActionLabel,
  getOceanFloorY,
  getOceanZoneInfo,
  OCEAN_SEA_MONSTER_SPAWNS,
  OceanBiotaNode,
  OceanPickup,
  OceanSupplyChest,
  OceanWorldRig,
  resolveOceanSolidCollisions,
  updateArchipelagoUnderwaterProps,
  updateOceanWorld,
} from './oceanWorld';
import { SEA_BIOTA_BY_ID } from './seaBiotaCatalog';
import { createMaterialPalette, MaterialPalette } from './materials';
import {
  createMinecraftVillageWorld,
  createVillagerMesh,
  MinecraftVillageRig,
  resolveOBBvsOBB,
  resolveObstacleBoxes,
  resolveVehicleOBBvsObstacles,
  updateMinecraftVillage,
  VehicleHazard,
  VillageObstacle,
  VillagerActor,
} from './minecraftVillage';
import {
  appendVehicleVillageColliders,
  ArchipelagoRig,
  BRIDGE_SPANS,
  constrainHeroToWorldBounds,
  constrainToWalkableArchipelago,
  createArchipelagoWorld,
  FLIGHT_WORLD_LIMIT,
  freezeStaticSubtree,
  getArchipelagoGroundY,
  getArchipelagoSeabedY,
  IELTS_TEMPORARILY_LOCKED,
  ISLAND_DISKS,
  isWalkableArchipelago,
  OVERWORLD_ANCHORS,
  OVERWORLD_ZONE_DOORS,
  pushEntityFromOBB,
  resolveArchipelagoVehicleCollisions,
  resolveCircleDesaVisualTerrain,
  resolveVehicleOBBDesaVisualTerrain,
  sampleArchipelagoTerrain,
  sampleDesaVisualVehicleGroundY,
  updateArchipelagoWorld,
  WORLD_OCEAN_LIMIT,
} from './archipelagoWorld';
import {
  AcademyHallRig,
  animateCaptiveMesh,
  animateMonsterRig,
  animateShooterRig,
  animateZoneNpc,
  applyHeroAppearance,
  applyHeroWeaponPose,
  CaveBlockDef,
  computeBlinkScale,
  createAcademyHallEnvironment,
  createAreaMists,
  createCaptiveMesh,
  createCaveTntMesh,
  createCaveTorchMesh,
  createDungeonEnvironment,
  createFirstPersonViewRig,
  createHeroAvatar,
  createMonsterMesh,
  createOwlMessengerRig,
  createPortalArch,
  createShooterMesh,
  createStarterWeaponPickup,
  createSwimSuitPickup,
  createVoxelClouds,
  createZoneLandmarks,
  createZoneNpc,
  DungeonArenaRig,
  FirstPersonViewRig,
  getWeaponPoseClass,
  getZoneForPosition,
  HeroAvatarRig,
  OwlMessengerRig,
  PortalArchRig,
  setFirstPersonHeldVisual,
  setHeroWeaponVisual,
  updateDoorRigVisual,
} from './rpgModels';
import {
  createDriveableCarRig,
  DriveableCarRig,
  updateCarRigVisuals,
} from './carModel';
import {
  animatePlaneRig,
  createPlaneModel,
  PlaneRig,
} from './planeModel';
import {
  AIRBASE_ISLANDS,
  getAirbaseRunwaySpawn,
} from './airbaseIslands';
import {
  createWorldObstacles,
  getObstacleSupportHeight,
  resolveSolidObstacleCollisions,
  resolveVehicleSolidObstacleCollisions,
  updateAndEvaluateObstacles,
  WorldObstaclesRig,
} from './worldObstacles';
import {
  DAY_SURFACE_SPAWNS,
  FLYING_MONSTER_TYPES,
  MONSTER_SPECS,
  NIGHT_SURFACE_SPAWNS,
  SEA_CAPABLE_WEAPONS,
  SEA_MONSTER_SPAWNS,
  SKY_MONSTER_SPAWNS,
} from './monstersCatalog';
import {
  generateRandomSurfaceWave,
  summarizeWaveMonsters,
} from './waveGenerator';

interface CollectibleItem {
  active: boolean;
  kind: 'diamond' | 'heart';
  x: number;
  y: number;
  z: number;
  phase: number;
  respawnTimer: number;
  matrixInit?: boolean;
}

interface RoamingMonster {
  id: string;
  type: MonsterType;
  name: string;
  zoneId: ZoneId;
  homeX: number;
  homeY?: number;
  homeZ: number;
  x: number;
  y?: number;
  z: number;
  maxHp: number;
  rewardXp: number;
  rewardDiamonds: number;
  rewardScore: number;
  isBoss?: boolean;
  isAmbush?: boolean;
  isVillageAmbushTarget?: boolean;
  isCaveMob?: boolean;
  isNightMonster?: boolean;
  isSeaMonster?: boolean;
  isSkyMonster?: boolean;
  sunburnTimer?: number;
  combatOnly?: boolean;
  fuseTimer?: number;
  mobHp?: number;
  maxMobHp?: number;
  aggroActive?: boolean;
  attackCooldown?: number;
  windupTimer?: number;
  lungeTimer?: number;
  diveOffset?: number;
  hitFlashTimer?: number;
  isAcademyShadow?: boolean;
  academySkill?: 'listening' | 'reading' | 'writing' | 'speaking';
  wordIds?: string[];
  mesh: THREE.Group;
  alive: boolean;
  respawnTimer: number;
  patrolPhase: number;
  angryTimer: number;
  stanceHp?: number;
  walkPhase?: number;
  attackAnimTimer?: number;
  patrolClock?: number;
  idleRestTimer?: number;
  idleRoamTimer?: number;
}

interface CaveActiveTnt {
  x: number;
  y: number;
  z: number;
  timer: number;
  mesh: THREE.Group;
}

interface CaveFallingBoulder {
  x: number;
  z: number;
  timer: number;
  maxTime: number;
  rockMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
}

interface EnemyShooter {
  id: string;
  x: number;
  z: number;
  homeX: number;
  homeZ: number;
  hp: number;
  cooldown: number;
  phase: number;
  walkPhase: number;
  recoilTimer: number;
  hitSquashTimer: number;
  prevX: number;
  prevZ: number;
  mesh: THREE.Group;
  alive: boolean;
  respawnTimer: number;
  zoneId?: ZoneId;
  isNightShooter?: boolean;
  sunburnTimer?: number;
  patrolClock?: number;
  idleRestTimer?: number;
  idleRoamTimer?: number;
}

interface Projectile3D {
  active: boolean;
  fromPlayer: boolean;
  fromPlane?: boolean;
  planeAmmo?: PlaneAmmoType;
  weaponId?: WeaponId;
  x: number;
  y?: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  gravity?: number;
  homingTargetId?: string;
  aoeRadius?: number;
  explosionColor?: number;
  damage: number;
  shieldDamage: number;
  pierceLeft: number;
  hitIds: Set<string>;
  life: number;
  mesh: THREE.Mesh;
  visualOnly?: boolean;
}

interface WorldPlane {
  id: string;
  name: string;
  variant: PlaneVariant;
  airbaseId: 'airbase_south' | 'airbase_east' | 'airbase_north';
  radarColor: string;
  root: THREE.Group;
  rig: PlaneRig;
  pos: THREE.Vector3;
  spawnPos: THREE.Vector3;
  yaw: number;
  spawnYaw: number;
  pitch: number;
  roll: number;
  speed: number;
  vy: number;
  canopyAngle: number;
  gearExtend: number;
  steerAngle: number;
  occupied: boolean;
  passedRings: Set<string>;
}

interface WorldVehicle {
  id: string;
  name: string;
  kind: 'hero_car' | 'police' | 'sedan' | 'taxi' | 'bus';
  root: THREE.Group;
  rig?: DriveableCarRig;
  pos: THREE.Vector3;
  spawnPos: THREE.Vector3;
  yaw: number;
  spawnYaw: number;
  speed: number;
  steerAngle: number;
  wheelSpin: number;
  doorAngle: number;
  pitchLean: number;
  rollLean: number;
  headlightsOn: boolean;
  handbrakeOn: boolean;
  halfW: number;
  halfL: number;
  height: number;
  seatOffset: THREE.Vector3;
  boardOffset: THREE.Vector3;
  driverKind: 'none' | 'player' | 'npc';
  initialNpcDriver: boolean;
  npcDriverIdx: number | null;
  npcDriveTimer: number;
  npcParkTimer: number;
  npcPatrolDir: 1 | -1;
  npcHomeZone: 'highway' | 'courtyard' | 'desa';
  radarColor: string;
}

interface ParticleItem {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

interface SavedZoneCaveDetail {
  defeatedEnemyIds: string[];
  brokenBlockIds: string[];
  placedShieldBlocks: Array<{ id: string; x: number; y: number; z: number; hp: number }>;
  placedTorches: Array<{ x: number; z: number }>;
  weaponChestCollected?: boolean;
  chestAmbushTriggered?: boolean;
  chestAmbushInfo?: { isCombatAmbush: boolean; wordIds?: string[] };
  prisonKeyCollected?: boolean;
  triggeredBlockAmbushes?: Array<{
    id: string;
    originX: number;
    originZ: number;
    title: string;
    accentHex: number;
    isCombatAmbush: boolean;
    wordIds?: string[];
  }>;
}

interface SavedOverworldNightMonster {
  id: string;
  type: MonsterType;
  name: string;
  zoneId: ZoneId;
  x: number;
  y?: number;
  z: number;
  homeX: number;
  homeZ: number;
  mobHp: number;
  maxMobHp: number;
  maxHp?: number;
  stanceHp?: number;
  combatOnly?: boolean;
  isNightMonster?: boolean;
  wordIds?: string[];
  rewardXp: number;
  rewardDiamonds: number;
  rewardScore: number;
}

interface SavedStatePayload {
  version: number;
  xp: number;
  hp: number;
  maxHp: number;
  diamonds: number;
  score: number;
  maxStreak: number;
  dailyDate: string;
  dailyCount: number;
  monstersDefeated: number;
  wordProgress: Record<string, WordProgress>;
  activeWeapon: WeaponId;
  ownedWeapons: WeaponId[];
  weaponAmmo: Record<WeaponId, number>;
  starterWeaponPicked: boolean;
  swimSuitPicked?: boolean;
  ownedRelics: RelicId[];
  ribbons: ZoneId[];
  liberatedZones: ZoneId[];
  areaTrophies: ZoneId[];
  areaDoorsCleared: Record<ZoneId, number[]>;
  areaDeals: Partial<Record<ZoneId, AreaWaveDeal>>;
  ieltsScores: Record<'listening' | 'reading' | 'writing' | 'speaking' | 'full', number>;
  ieltsCleared: boolean;
  settings: GameSettings;
  introDone: boolean;
  caveIntrosSeen?: ZoneId[];
  defeatedBossZones?: ZoneId[];
  zoneCaveProgress?: Partial<Record<ZoneId, { defeated: number; remaining: number; total: number }>>;
  zoneCaveDetails?: Partial<Record<ZoneId, SavedZoneCaveDetail>>;
  caveTorchesLeft?: number;
  caveBlocksMined?: number;
  caveShieldBlocksLeft?: number;
  caveTntLeft?: number;
  pickaxeTier?: PickaxeTier;
  worldTimeTick?: number;
  dayCount?: number;
  lastWorldMode?: WorldLocationMode;
  lastDungeonZoneId?: ZoneId;
  lastDungeonMixed?: boolean;
  lastHeroPos?: { x: number; y: number; z: number; yaw: number };
  savedOverworldHeroPos?: { x: number; y: number; z: number };
  nightWaveDaySpawned?: number;
  dayWaveDaySpawned?: number;
  surfaceWaveMode?: 'day' | 'night';
  nightWaveTotal?: number;
  missionWaveSeed?: number;
  missionWaveCount?: number;
  missionWaveCompleted?: boolean;
  currentSquadName?: string;
  nightZoneTotals?: Partial<Record<ZoneId, number>>;
  nightMonsterSeq?: number;
  savedNightMonsters?: SavedOverworldNightMonster[];
  savedDefeatedSeaSkyIds?: string[];
  savedNightShooters?: Array<{
    id: string;
    x: number;
    z: number;
    homeX: number;
    homeZ: number;
    zoneId: ZoneId;
    hp: number;
    alive: boolean;
  }>;
  savedCollectibles?: Array<{ active: boolean; respawnTimer: number }>;
  defeatedAcademyEnemyIds?: string[];
  oceanGear?: DivingGearId[];
  oceanMaterials?: OceanMaterials;
  discoveredBiota?: SeaBiotaId[];
  oceanOpenedChests?: string[];
}

const MAX_COLLECTIBLES = 56;
const MAX_PARTICLES = 110;
const MAX_PROJECTILES = 36;
const TICKS_PER_DAY = 24000;
const TICKS_PER_SEC = 20;

const OVERWORLD_OFF_DUTY_SPOTS = OVERWORLD_ANCHORS.offDutySpots;

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _proj = new THREE.Vector3();
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();
const _skyColorScratch = new THREE.Color();
const _sunColorScratch = new THREE.Color();
const _hemiSkyScratch = new THREE.Color();
const _hemiGndScratch = new THREE.Color();
const _skyDayCol = new THREE.Color(0x9cd6fc);
const _skyDawnCol = new THREE.Color(0xfdba74);
const _skyDuskCol = new THREE.Color(0xf97316);
const _skyNightCol = new THREE.Color(0x091128);
const _skyTenseMistCol = new THREE.Color(0x475569);
const _skyDayMistCol = new THREE.Color(0xb4c4d4);
const _mistDayCol = new THREE.Color(0xdbeafe);
const _mistNightCol = new THREE.Color(0x64748b);
const _sunDayCol = new THREE.Color(0xfff4d6);
const _sunDawnCol = new THREE.Color(0xfdba74);
const _sunNightCol = new THREE.Color(0x93c5fd);
const _hemiSkyDayCol = new THREE.Color(0xe0f2fe);
const _hemiSkyDuskCol = new THREE.Color(0xfca5a5);
const _hemiSkyNightCol = new THREE.Color(0x1e293b);
const _hemiGndDayCol = new THREE.Color(0x5c913b);
const _hemiGndNightCol = new THREE.Color(0x14221a);
const _centerNdc = new THREE.Vector2(0, 0);
const _aimPoint = new THREE.Vector3();
const _cloudMat = new THREE.Matrix4();
const _cloudPos = new THREE.Vector3();
const _cloudQuat = new THREE.Quaternion();
const _cloudScale = new THREE.Vector3();
const MAP_MINI_SIZE = 128;
const MAP_FULL_W = 512;
const MAP_FULL_H = 320;
const LINEAR_TO_SRGB_LUT = (() => {
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const lin = i / 255;
    const srgb = lin <= 0.0031308 ? lin * 12.92 : 1.055 * Math.pow(lin, 1 / 2.4) - 0.055;
    lut[i] = Math.max(0, Math.min(255, Math.round(srgb * 255)));
  }
  return lut;
})();

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export interface RpgEngineCallbacks {
  onHudUpdate: (snapshot: RpgHudSnapshot) => void;
  onStartBattle: (battle: BattleContext) => void;
  onStartLearning: (session: LearningSessionContext) => void;
  onOpenNpcDialogue: (npcId: string) => void;
  onOpenAcademyExam: (skill: 'listening' | 'reading' | 'writing' | 'speaking' | 'full') => void;
  onOpenCaveSeal: (seal: CaveSealContext) => void;
  onOpenCrafting: () => void;
  onMultiplayerPacket?: (pkt: P2pReliableMessage, targetUid?: string) => void;
}

interface PrologueSceneSpec {
  sceneTitle: string;
  accentColor: string;
  worldTimeTick: number;
  textId: string;
  textEn: string;
}

const PROLOGUE_SCENES: PrologueSceneSpec[] = [
  {
    sceneTitle: 'Menyapu Langit di Atas Kerajaan Kata yang Damai',
    accentColor: '#f59e0b',
    worldTimeTick: 4200,
    textId:
      'Dahulu kala, di seberang lautan biru yang tenang, berdirilah sebuah kerajaan yang indah bernama Kerajaan Kata, tempat enam pulau hijau saling terhubung oleh jembatan cahaya dan angin pagi yang lembut. Kerajaan itu dipimpin oleh Raja Aksara yang arif lagi pemurah, sehingga seluruh penduduk di Desa Sapaan, Pasar Rasa, Hutan Satwa, Gerbang Kota, Menara Waktu, hingga Gua Portal dapat hidup rukun, saling menyapa dengan kata-kata yang hangat, serta bernyanyi riang setiap hari. Di antara rakyat yang berbahagia itu, hiduplah seorang pemuda pemberani bernama Hoot bersama adiknya yang lemah lembut bernama Lila, seorang gadis kecil berhati emas yang selalu menghiasi rambutnya dengan pita merah yang indah.',
    textEn:
      'Long ago, across a tranquil blue sea, there stood a lovely kingdom named Kerajaan Kata, where six green islands were joined by bridges of light and gentle morning breezes. The realm was ruled by wise and generous Raja Aksara, so the townsfolk across Desa Sapaan, Pasar Rasa, Hutan Satwa, Gerbang Kota, Menara Waktu, and Gua Portal lived in harmony, greeting one another with warm words and singing joyfully each day. Among those happy people lived a brave young explorer named Hoot and his gentle little sister Lila, a kind-hearted girl who always adorned her hair with a bright red ribbon.',
  },
  {
    sceneTitle: 'Malam Kelam Ketika Badai Bayangan Menyerbu Istana',
    accentColor: '#7c3aed',
    worldTimeTick: 17400,
    textId:
      'Namun ketenteraman yang manis itu tidak berlangsung selamanya, karena pada suatu malam yang gelap tanpa cahaya bulan, gerombolan monster bayangan bersenjata datang menyerbu bagaikan badai dingin yang menakutkan. Mereka mengepung Istana Utara, lalu memecahkan Mahkota Kerajaan yang suci menjadi enam kepingan berkilau sebelum merampas hampir seluruh kata Bahasa Inggris dari ingatan negeri itu. Dalam sekejap, lagu-lagu ceria di alun-alun pun terhenti, dan nyala lentera di istana meredup ditelan kabut kelam yang turun menyelimuti langit.',
    textEn:
      'Yet that sweet peace did not last forever, for on a dark and moonless night, a horde of armed shadow monsters swept in like a bitter storm. They surrounded the Northern Palace and shattered the sacred Royal Crown into six gleaming shards before stealing nearly every English word from the memory of the realm. In an instant, the cheerful songs in the village squares fell silent, and the palace lanterns dimmed beneath the dark mist descending across the sky.',
  },
  {
    sceneTitle: 'Kesunyian yang Menyelimuti Keenam Pulau',
    accentColor: '#475569',
    worldTimeTick: 14800,
    textId:
      'Sejak malam malapetaka itu tiba, keenam pecahan mahkota tersebar jauh ke enam penjuru pulau dan dijaga ketat oleh para monster bos raksasa yang buas. Sementara itu, para penduduk desa yang ketakutan memilih mengunci pintu rumah mereka rapat-rapat, sehingga pasar yang dahulu ramai kini berubah lengang dan hutan yang ramah dipenuhi bayangan yang mengintai. Setiap pulau seakan tertidur dalam kesunyian yang panjang, menunggu datangnya seorang penjelajah yang sanggup mengembalikan suara dan keberanian mereka.',
    textEn:
      'Ever since that fateful night, the six crown shards were scattered far across the six islands and guarded closely by fierce giant boss monsters. Meanwhile, the frightened villagers bolted their doors tight, so the once lively markets grew empty and the friendly woods filled with lurking shadows. Every island seemed to fall into a long silence, awaiting a brave explorer who could restore their voice and courage.',
  },
  {
    sceneTitle: 'Pengungsian di Balik Pintu Ungu dan Jejak Pita Merah Lila',
    accentColor: '#e11d48',
    worldTimeTick: 18600,
    textId:
      'Beruntunglah pada saat-saat genting di malam itu, Raja Aksara berhasil membawa Lila menyingkir jauh hingga berlindung di balik Pintu Ungu yang kokoh di pulau paling utara. Meskipun hatinya diliputi rindu kepada sang kakak, Lila yang cerdik tidak pernah menyerah, karena sepanjang perjalanan melintasi kepulauan ia sengaja menjatuhkan enam pita merah kesayangannya sebagai penunjuk jalan bagi Hoot. Sebelum gerbang istana tertutup rapat, ia pun sempat menuliskan sepucuk surat bersampul merah, lalu menyerahkannya kepada seekor burung hantu setia agar segera diterbangkan mencari kakaknya.',
    textEn:
      'Fortunately in that perilous night hour, Raja Aksara managed to lead Lila safely away to shelter behind the sturdy Purple Gate on the northernmost island. Though her heart ached for her brother, clever little Lila never gave up, for along her journey across the archipelago she quietly dropped six of her beloved red ribbons to guide Hoot. Before the palace gate swung shut, she wrote a red-sealed letter and entrusted it to a faithful messenger owl to carry to her brother.',
  },
  {
    sceneTitle: 'Terbang Menembus Kabut Malam Menuju Desa Sapaan',
    accentColor: '#10b981',
    worldTimeTick: 19600,
    textId:
      'Kini burung hantu utusan istana itu membelah awan dan meluncur menembus kabut malam yang dingin, mengitari satu demi satu pulau yang sunyi untuk mencari jejak hingga tiba di pulau terakhir bernama Desa Sapaan. Di tengah alun-alun desa yang temaram cahaya lentera, tampaklah Hoot berdiri seorang diri dengan wajah penuh tanda tanya, menatap langit malam sambil menunggu kabar tentang nasib adiknya serta negerinya. Perlahan sang burung hantu menukik turun sambil mencengkeram surat bersampul merah itu erat-erat, karena kisah petualangan besar untuk menyelamatkan Kerajaan Kata baru saja akan dimulai.',
    textEn:
      'Now the royal messenger owl parts the clouds and glides through the cold night mist, circling one quiet island after another in search of him until it reaches the final island of Desa Sapaan. In the center of the village square bathed in soft lantern light, Hoot stands alone with a puzzled gaze, looking up into the night sky as he awaits word of his sister and his homeland. Gently the owl swoops down clutching the red-sealed letter tight, for the grand adventure to save Kerajaan Kata is just about to begin.',
  },
];

interface PrologueKingRig {
  root: THREE.Group;
  body: THREE.Group;
  upperBody: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  crown: THREE.Group;
}

interface PrologueCutsceneRig {
  group: THREE.Group;
  istanaStage: THREE.Group;
  king: PrologueKingRig;
  royalCrowd: Array<{
    mesh: THREE.Group;
    baseX: number;
    baseZ: number;
    yaw: number;
    phase: number;
  }>;
  lilaMesh: THREE.Group;
  villagers: Array<{
    mesh: THREE.Group;
    x: number;
    z: number;
    yaw: number;
    phase: number;
    role: 'chat' | 'stroll' | 'dance';
    walkA?: THREE.Vector3;
    walkB?: THREE.Vector3;
    center?: THREE.Vector3;
    orbitR?: number;
  }>;
  bridgeBeams: THREE.Mesh[];
  bridgeLightOrbs: Array<{
    mesh: THREE.Mesh;
    ax: number;
    ay: number;
    az: number;
    bx: number;
    by: number;
    bz: number;
    arch: number;
    speed: number;
    offset: number;
  }>;
  skyPortal: {
    group: THREE.Group;
    core: THREE.Mesh;
    ringOuter: THREE.Mesh;
    ringInner: THREE.Mesh;
    beam: THREE.Mesh;
    beamMat: THREE.MeshBasicMaterial;
    bolts: THREE.Mesh[];
  };
  crownAltar: THREE.Group;
  sacredCrown: THREE.Group;
  crownShockwave: {
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
  };
  palaceLanterns: Array<{
    orb: THREE.Mesh;
    mat: THREE.MeshStandardMaterial;
    halo: THREE.Mesh;
    haloMat: THREE.MeshBasicMaterial;
    phase: number;
  }>;
  wordOrbs: Array<{
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    homePos: THREE.Vector3;
    snatchStart: number;
    snatchEnd: number;
    keeper: boolean;
    phase: number;
  }>;
  darkMists: Array<{
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    phase: number;
    baseScale: number;
  }>;
  crownShards: Array<{
    mesh: THREE.Mesh;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
  }>;
  raiders: Array<{
    mesh: THREE.Group;
    type: MonsterType;
    spawnPos: THREE.Vector3;
    raidPos: THREE.Vector3;
    strikePos?: THREE.Vector3;
    orbitAngle?: number;
    orbitRadius?: number;
    hoverY: number;
    isFlier: boolean;
    spawnDelay: number;
    phase: number;
  }>;
  bosses: Array<{
    zId: ZoneId;
    mesh: THREE.Group;
    type: MonsterType;
    pos: THREE.Vector3;
    phase: number;
  }>;
  ribbonDrops: Array<{
    mesh: THREE.Group;
    pos: THREE.Vector3;
    dropTime: number;
  }>;
  flightMists: Array<{
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    basePos: THREE.Vector3;
    phase: number;
  }>;
  owlFlightCurve: THREE.CatmullRomCurve3;
  disposables: Array<{ dispose: () => void }>;
  raidPortalSoundFired: boolean;
  raidShatterFired: boolean;
  raidStealSoundFired: boolean;
}

export class RpgWorldEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private hemiLight: THREE.HemisphereLight;
  private sunLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private playerCaveLight: THREE.PointLight;
  private palette: MaterialPalette;
  private hero: HeroAvatarRig;
  private fpViewRig: FirstPersonViewRig;
  private cloudsMesh: THREE.InstancedMesh;
  private owlRig: OwlMessengerRig;
  private portalRig: PortalArchRig;
  private starterPickupMesh: THREE.Group;
  private swimSuitPickupMesh: THREE.Group;
  private carRig!: DriveableCarRig;
  private areaMists: Map<ZoneId, THREE.Mesh>;
  private worldMistMesh: THREE.InstancedMesh | null = null;
  private worldMistMat: THREE.MeshBasicMaterial | null = null;
  private worldMistSeeds: Array<{
    baseX: number;
    baseY: number;
    baseZ: number;
    sx: number;
    sy: number;
    sz: number;
    driftX: number;
    driftZ: number;
    phase: number;
    rotY: number;
  }> = [];
  private isSoftwareGl: boolean;
  private isMobileDevice: boolean;
  private isLowEndMobile: boolean;
  private preferLiteShader: boolean;
  private callbacks: RpgEngineCallbacks;

  // Live Top-Down Orthographic 3D Map Capture (Zero extra WebGL context)
  private mapCamera: THREE.OrthographicCamera;
  private mapRtMinimap: THREE.WebGLRenderTarget;
  private mapRtFull: THREE.WebGLRenderTarget;
  private mapPixelsMinimap: Uint8Array;
  private mapPixelsFull: Uint8Array;
  private mapCanvasMinimap: HTMLCanvasElement;
  private mapCanvasFull: HTMLCanvasElement;
  private mapCtxMinimap: CanvasRenderingContext2D | null;
  private mapCtxFull: CanvasRenderingContext2D | null;
  private mapImageDataMinimap: ImageData | null;
  private mapImageDataFull: ImageData | null;
  private lastMinimapCaptureMs = 0;
  private lastFullMapCaptureMs = 0;
  private lastMinimapKey = '';
  private lastFullMapKey = '';
  private lastMiniHeroX = 9999;
  private lastMiniHeroZ = 9999;
  private lastMinimapBounds: LiveMapBounds = {
    worldMode: 'overworld',
    centerX: OVERWORLD_ANCHORS.desaSpawn.x,
    centerZ: OVERWORLD_ANCHORS.desaSpawn.z,
    halfW: 36,
    halfH: 36,
  };
  private lastFullMapBounds: LiveMapBounds = {
    worldMode: 'overworld',
    centerX: -6,
    centerZ: -26,
    halfW: 368,
    halfH: 230,
  };

  private frameId = 0;
  private lastTimeMs = 0;
  private lastFrameRenderMs = 0;
  private emaFrameWorkMs = 4;
  private activeDprScale = 1.0;
  private appliedDpr = 1.0;
  private slowFrameStreak = 0;
  private fastFrameStreak = 0;
  private lastInputActivityMs = 0;
  private lastShadowHeroX = 9999;
  private lastShadowHeroZ = 9999;
  private lastShadowSunX = 9999;
  private lastShadowSunY = 9999;
  private lastShadowMode = '';
  private lastShadowUpdateMs = 0;
  private shadowFrameCounter = 0;
  private animFrameCounter = 0;
  private hasActiveParticles = false;
  private forceRenderNextFrame = true;
  private backgroundIdle = false;
  private elapsed = 0;
  private disposed = false;
  private lastHudHeroX = 9999;
  private lastHudHeroZ = 9999;
  private lastHudCamYaw = 9999;
  private mapHiddenOverworld: THREE.Object3D[] = [];
  private mapHiddenDungeon: THREE.Object3D[] = [];
  private mapHiddenAcademy: THREE.Object3D[] = [];
  private mapHiddenOcean: THREE.Object3D[] = [];

  // Input & Raycasting
  private heldKeys = new Set<string>();
  private virtualMove = { x: 0, z: 0 };
  private tapMoveTarget: THREE.Vector3 | null = null;
  private voiceMoveVec = { x: 0, z: 0 };
  private voiceMoveTimer = 0;
  private voiceSprint = false;
  private voiceAutoFire = false;
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2();
  private camRaycaster = new THREE.Raycaster();
  private camOccluderScratch: THREE.Object3D[] = [];
  private currentCamDist = 7.8;
  private lookPointer: {
    id: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    moved: boolean;
  } | null = null;
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private overworldClickables: THREE.Object3D[] = [];
  private dungeonClickables: THREE.Object3D[] = [];
  private academyClickables: THREE.Object3D[] = [];
  private oceanClickables: THREE.Object3D[] = [];

  // World containers & entities
  private worldMode: WorldLocationMode = 'overworld';
  private overworldGroup: THREE.Group;
  private archipelagoRig!: ArchipelagoRig;
  private archipelagoUnderwaterRig: ArchipelagoUnderwaterRig | null = null;
  private villageRig!: MinecraftVillageRig;
  private worldObstaclesRig!: WorldObstaclesRig;
  private heroOnIce = false;
  private extraVillageColliders: VillageObstacle[] = [];
  private _desaColScratch = { x: 0, z: 0 };
  private _desaPickupBoxes: VillageObstacle[] = [
    { x: OVERWORLD_ANCHORS.starterWeapon.x, z: OVERWORLD_ANCHORS.starterWeapon.z, halfW: 0.78, halfD: 0.78 },
    { x: OVERWORLD_ANCHORS.swimSuit.x, z: OVERWORLD_ANCHORS.swimSuit.z, halfW: 0.78, halfD: 0.78 },
  ];
  private dungeonRig: DungeonArenaRig | null = null;
  private academyRig: AcademyHallRig | null = null;
  private oceanRig: OceanWorldRig | null = null;
  private dungeonAnimatables: THREE.Object3D[] = [];
  private dungeonExitPos = new THREE.Vector3(0, 0, 17);
  private dungeonState: DungeonZoneState | null = null;
  private savedOverworldHeroPos = new THREE.Vector3(
    OVERWORLD_ANCHORS.desaSpawn.x,
    OVERWORLD_ANCHORS.desaSpawn.y,
    OVERWORLD_ANCHORS.desaSpawn.z,
  );

  // Driveable 3D Explorer Car state (parked at Alun-Alun Desa, full slow door animation + driving physics)
  private carPos = new THREE.Vector3(0.4, getArchipelagoGroundY(0.4, 118.0), 118.0);
  private carYaw = -Math.PI * 0.68;
  private carSpeed = 0;
  private carSteerAngle = 0;
  private carWheelSpin = 0;
  private carDoorAngle = 0;
  private carPitchLean = 0;
  private carRollLean = 0;
  private carMode: 'none' | 'entering' | 'driving' | 'exiting' = 'none';
  private carAnimTimer = 0;
  private carExitBrakeWait = 0;
  private carEnterStartPos = new THREE.Vector3();
  private carEnterStartYaw = 0;
  private carExitSafePos = new THREE.Vector3();
  private carDoorOpenPlayed = false;
  private carDoorClosePlayed = false;
  private carHeadlightsOn = false;
  private carHandbrakeOn = false;
  private carExhaustTimer = 0;
  private nearCar = false;
  private worldVehicles: WorldVehicle[] = [];
  private activeVehicleId = 'hero_car';
  private nearVehicleId: string | null = null;
  private carHornFleeTimer = 0;
  private activeVehicleHazards: VehicleHazard[] = [];
  private carCtrl = {
    gas: false,
    brake: false,
    left: false,
    right: false,
    handbrake: false,
    boost: false,
  };

  // Flyable 3-Jet Airbase Fleet State
  private worldPlanes: WorldPlane[] = [];
  private planeMode: PlaneMode = 'none';
  private activePlaneId = 'jet_garuda';
  private nearPlaneId: string | null = null;
  private planeActiveAmmo: PlaneAmmoType = 'vulcan';
  private planeAmmoCounts: Record<PlaneAmmoType, number> = {
    vulcan: 240,
    missile: 24,
    bomb: 8,
    plasma: 14,
  };
  private planeFireCooldown = 0;
  private planeVulcanRegenTimer = 0;
  private planeResupplyCooldown = 0;
  private planeFireHeld = false;
  private planeAnimTimer = 0;
  private planeCanopyOpenPlayed = false;
  private planeCanopyClosePlayed = false;
  private planeEnterStartPos = new THREE.Vector3();
  private planeEnterStartYaw = 0;
  private planeExitSafePos = new THREE.Vector3();
  private planeMuzzleToggle = false;
  private bombReticleMesh: THREE.Mesh | null = null;
  private planeCtrl = {
    gas: false,
    brake: false,
    left: false,
    right: false,
    climb: false,
    descend: false,
    boost: false,
  };

  // Voxel Cave State
  private caveTorches: Array<{
    x: number;
    z: number;
    mesh: THREE.Group;
    light: THREE.PointLight | null;
  }> = [];
  private caveTorchesLeft = 16;
  private caveShieldBlocksLeft = 4;
  private caveTntLeft = 1;
  private pickaxeTier: PickaxeTier = 1;
  private nearCraftingTable = false;
  private caveBlocksMined = 0;
  private targetedCaveBlock: CaveBlockDef | null = null;
  private chestAmbushTriggered = false;
  private caveBoulders: CaveFallingBoulder[] = [];
  private activeTnts: CaveActiveTnt[] = [];
  private bossBoulderTimer = 0;
  private ambushSeq = 0;

  private npcs: Map<
    string,
    {
      mesh: THREE.Group;
      alertMesh: THREE.Mesh;
      aura: {
        group: THREE.Group;
        outerBeam: THREE.Mesh;
        innerBeam: THREE.Mesh;
        outerBeamMat: THREE.MeshBasicMaterial;
        innerBeamMat: THREE.MeshBasicMaterial;
        ringInner: THREE.Mesh;
        ringOuter: THREE.Mesh;
        ringInnerMat: THREE.MeshBasicMaterial;
        ringOuterMat: THREE.MeshBasicMaterial;
        rayGroup: THREE.Group;
        rayMat: THREE.MeshBasicMaterial;
        motes: Array<{ mesh: THREE.Mesh; phase: number; speed: number }>;
      };
      zoneId: ZoneId;
      shift: 'day' | 'night';
      partnerNpcId: string;
      dayNpcId: string;
      x: number;
      z: number;
      standX: number;
      standY: number;
      standZ: number;
      standRotY: number;
      offDutyX: number;
      offDutyY: number;
      offDutyZ: number;
      offDutyRotY: number;
      roamTargetX: number;
      roamTargetZ: number;
      roamPaused: boolean;
      roamTimer: number;
      walkWaypoint?: { x: number; z: number };
      yaw: number;
      poseMode: 'stand' | 'walk';
      lastTalkBannerMs: number;
      koTimer: number;
      fleeTimer: number;
      fleeDirX: number;
      fleeDirZ: number;
    }
  > = new Map();
  private worldTimeTick = this.pickRandomWorldTimeTick();
  private dayCount = 1;
  private lastOverworldDayPhase: DayPhaseId = this.getDayPhaseForTick(this.worldTimeTick);
  private nightWaveDaySpawned = 0;
  private dayWaveDaySpawned = 0;
  private surfaceWaveMode: 'day' | 'night' = 'day';
  private pendingDayWaveTimer = -1;
  private nightWaveTotal = 0;
  private missionWaveSeed = 0;
  private missionWaveCount = 0;
  private missionWaveCompleted = false;
  private missionWaveSummary: WaveMonsterGroupSummary[] = [];
  private currentSquadName = '';
  private nightZoneTotals: Partial<Record<ZoneId, number>> = {};
  private nightShooterSaved: Array<{
    id: string;
    x: number;
    z: number;
    homeX: number;
    homeZ: number;
    zoneId: ZoneId;
    hp: number;
    alive: boolean;
  }> = [];
  private nightMonsterSeq = 0;
  private sunburnFxTimer = 0;
  private academyNpcs: Map<string, { mesh: THREE.Group; x: number; z: number }> = new Map();
  private academyCitizens: Array<{ id: string; mesh: THREE.Group; x: number; z: number; message: string }> = [];
  private monsters: RoamingMonster[] = [];
  private seaMonsters: RoamingMonster[] = [];
  private skyMonsters: RoamingMonster[] = [];
  private overworldAllMonsters: RoamingMonster[] = [];
  private restoredDefeatedSeaSkyIds = new Set<string>();
  private dungeonMonsters: RoamingMonster[] = [];
  private dungeonTotalSpawned = 0;
  private academyMonsters: RoamingMonster[] = [];
  private academyTotalSpawned = 0;
  private oceanMonsters: RoamingMonster[] = [];
  private oceanTotalSpawned = 0;
  private oceanOxygen = 35;
  private oceanSuffocateTimer = 0;
  private fireCoralStingTimer = 0;
  private oceanGear = new Set<DivingGearId>();
  private oceanMaterials: OceanMaterials = { pearl: 0, fiber: 0, calcium: 0, shell: 0, food: 0 };
  private discoveredBiota = new Set<SeaBiotaId>();
  private openedOceanChests = new Set<string>();
  private ridingTurtle = false;
  private heroDiveActive = false;
  private oceanAscendHeld = false;
  private oceanDescendHeld = false;
  private nearBiotaNode: OceanBiotaNode | null = null;
  private nearOceanChest: OceanSupplyChest | null = null;
  private nearOceanTurtle = false;
  private diveTransition: {
    active: boolean;
    stage: 'swim_to_water' | 'plunge' | 'submerge' | 'surface';
    timer: number;
    targetX?: number;
    targetZ?: number;
    bubbleTimer: number;
  } | null = null;
  private zoneCaveProgress: Partial<Record<ZoneId, { defeated: number; remaining: number; total: number }>> = {};
  private zoneCaveDetails: Partial<Record<ZoneId, SavedZoneCaveDetail>> = {};
  private defeatedAcademyEnemyIds = new Set<string>();
  private autoSaveTimer = 0;
  private restoredWorldMode: WorldLocationMode = 'overworld';
  private restoredDungeonZoneId: ZoneId | null = null;
  private restoredDungeonMixed = false;
  private restoredHeroPos: { x: number; y: number; z: number; yaw: number } | null = null;
  private restoredNightMonsters: SavedOverworldNightMonster[] = [];
  private restoredNightShooters: Array<{
    id: string;
    x: number;
    z: number;
    homeX: number;
    homeZ: number;
    zoneId: ZoneId;
    hp: number;
    alive: boolean;
  }> = [];
  private restoredCollectibles: Array<{ active: boolean; respawnTimer: number }> | null = null;
  private shooters: EnemyShooter[] = [];
  private projectiles: Projectile3D[] = [];
  private collectibles: CollectibleItem[] = [];
  private diamondInstanced: THREE.InstancedMesh;
  private heartInstanced: THREE.InstancedMesh;
  private particles: ParticleItem[] = [];
  private particleMesh: THREE.InstancedMesh;
  private waterUniforms = { uTime: { value: 0 } };

  // Hero physics (story-order start at Desa Sapaan)
  private heroPos = new THREE.Vector3(
    OVERWORLD_ANCHORS.desaSpawn.x,
    OVERWORLD_ANCHORS.desaSpawn.y,
    OVERWORLD_ANCHORS.desaSpawn.z,
  );
  private heroVel = new THREE.Vector3(0, 0, 0);
  private heroVelY = 0;
  private heroOnGround = true;
  private isSwimming = false;
  private swimStylePreference: SwimStylePreference = 'auto';
  private activeSwimStyle: SwimStyleId = 'water_tread';
  private swimFxTimer = 0;
  private swimLeapTimer = 0;
  private swimDiveTimer = 0;
  private swimDodgeTimer = 0;
  private swimDodgeRoll = 0;
  private activeJumpTrick: JumpDiveTrick | null = null;
  private lastJumpTrick: JumpDiveTrick | null = null;
  private jumpTrickElapsed = 0;
  private jumpToSwimPlayedForAir = false;
  private prevHeroYaw = OVERWORLD_ANCHORS.desaSpawn.yaw;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private jumpLandTimer = 0;
  private heroYaw = OVERWORLD_ANCHORS.desaSpawn.yaw;
  private walkCycle = 0;
  private dashCooldown = 0;
  private fireCooldown = 0;
  private pulseRingTimer = 0;
  private encounterGraceTimer = 0;
  private hpRegenTimer = 0;
  private ketapelRegenTimer = 0;
  private shooterGemsThisArea = 0;

  // Story choreography state
  private introDone = false;
  private caveIntrosSeen = new Set<ZoneId>();
  private defeatedBossZones = new Set<ZoneId>();
  private storyDialog: StoryDialogState | null = null;
  private storyTimer = 0;
  private dialogueTargetNpcId: string | null = null;
  private caveGuardianTurns: Array<{
    speakerSide: 'npc' | 'hero';
    speakerName: string;
    speakerRole: string;
    textId: string;
    textEn: string;
  }> = [];
  private owlState: 'hidden' | 'fly' | 'land' | 'leave' | 'leave_to_ambush' = 'hidden';
  private savedPrologueWorldTimeTick: number | null = null;
  private prologueRig: PrologueCutsceneRig | null = null;
  private villageAmbushState: {
    active: boolean;
    inCutscene: boolean;
    resolved: boolean;
    stage: 'ambush' | 'rescue_talk' | 'escort' | 'awaiting_guardian_talk' | 'walking_home';
    timer: number;
    talkMidX?: number;
    talkMidZ?: number;
    abductedStartPos: THREE.Vector3;
    abductor: {
      mesh: THREE.Group;
      x: number;
      y: number;
      z: number;
      yaw: number;
      active: boolean;
    } | null;
    npcs: Array<{
      id: string;
      actor: VillagerActor;
      x: number;
      y: number;
      z: number;
      yaw: number;
      role: 'abducted' | 'survivor';
      alive: boolean;
      sheltering: boolean;
      homeDoor: [number, number];
      loopCenter: [number, number];
      orbitPhase: number;
      speed: number;
      shoutCutscene: string;
      shoutLive: string;
    }>;
    cutsceneMonsters: Array<{
      mesh: THREE.Group;
      type: MonsterType;
      x: number;
      y: number;
      z: number;
      yaw: number;
      targetNpcIdx: number;
      patrolPhase: number;
    }>;
  } | null = null;
  private cutsceneStartPos = new THREE.Vector3();
  private cutsceneTargetPos = new THREE.Vector3();

  // RPG Progression State
  private phase: GamePhase = 'title';
  private cameraMode: CameraMode = 'third_back';
  private cameraYaw = 0;
  private cameraPitch = 0.22;
  private thirdPersonDist = 7.8;
  private activeHotbarSlot = 0;
  private fpSwingTimer = 0;
  private shootAimTimer = 0;
  private shootRecoilTimer = 0;
  private shootAimYaw: number | null = null;
  private shootAimPitch = 0;
  private shootAimTargetId: string | null = null;
  private shootTargetPos: { x: number; y: number; z: number } | null = null;
  private autoCamPitchActive = false;
  private manualLookHoldTimer = 0;
  private pendingTurnShot: { fromHold: boolean } | null = null;
  private isAiming = false;
  private aimToggled = false;
  private rightAimHeld = false;
  private leftFireHeld = false;
  private hudFireHeld = false;
  private aimBlend = 0;
  private recoilPitch = 0;
  private crosshairSpread = 0;
  private hitMarkerTimer = 0;
  private hitMarkerKind: 'none' | 'hit' | 'kill' = 'none';
  private damageFlashTimer = 0;
  private damageFlashSeq = 0;
  private lastDamageAmount = 1;
  private lastDamageDir: 'front' | 'back' | 'left' | 'right' | 'center' = 'center';
  private lastDefeatReason: string | null = null;
  private cameraShakeTimer = 0;
  private cameraShakeStrength = 0;
  private crosshairOnEnemy = false;
  private pointerLocked = false;
  private heroIdleTime = 0;
  private heroThoughtText: string | null = null;
  private heroThoughtTimer = 0;
  private heroThoughtCooldown = 3.2;
  private npcThoughtId: string | null = null;
  private npcThoughtText: string | null = null;
  private npcThoughtTimer = 0;
  private npcThoughtCooldown = 4.5;
  private xp = 0;
  private hp = TUNE.hpStart;
  private maxHp = TUNE.hpStart;
  private diamonds = 1;
  private score = 0;
  private streak = 0;
  private maxStreak = 0;
  private dailyDate = todayKey();
  private dailyCount = 0;
  private monstersDefeated = 0;

  private activeWeapon: WeaponId = 'ketapel';
  private ownedWeapons = new Set<WeaponId>();
  private weaponAmmo: Record<WeaponId, number> = {
    ketapel: 0,
    kerikil: 0,
    emas: 0,
    saus: 0,
    biji: 0,
    kertas: 0,
    jarum: 0,
    kristal: 0,
  };
  private starterWeaponPicked = false;
  private swimSuitPicked = false;
  private ownedRelics = new Set<RelicId>();
  private ribbons = new Set<ZoneId>();
  private liberatedZones = new Set<ZoneId>();
  private areaTrophies = new Set<ZoneId>();
  private areaDoorsCleared: Record<ZoneId, number[]> = {
    desa_sapaan: [],
    pasar_rasa: [],
    hutan_satwa: [],
    gerbang_kota: [],
    menara_waktu: [],
    gua_portal: [],
  };
  private areaDeals: Partial<Record<ZoneId, AreaWaveDeal>> = {};
  private wordProgress: Record<string, WordProgress> = {};
  private ieltsScores: Record<'listening' | 'reading' | 'writing' | 'speaking' | 'full', number> = {
    listening: 0,
    reading: 0,
    writing: 0,
    speaking: 0,
    full: 0,
  };
  private ieltsCleared = false;
  private settings: GameSettings = {
    difficulty: 'petualang',
    aimMode: 'manual',
    storyLocked: true,
    qtimer: true,
    fxLevel: 'full',
    touchControls: 'auto',
    dpadMode: 'joystick',
  };
  private quests: RpgQuestState[] = [];

  private nearbyNpcId: string | null = null;
  private nearbyOverworldZoneDoor: ZoneId | null = null;
  private nightPermittedZones: Set<ZoneId> = new Set();
  private nearbyMonsterId: string | null = null;
  private nearbyDoorIndex: number | null = null;
  private nearbyDungeonGuardian = false;
  private nearPrisonKey = false;
  private nearHiddenPrison = false;
  private nearPortal = false;
  private nearDungeonExit = false;
  private bannerMessage: string | null = null;
  private bannerTimer = 0;
  private lastHudPushMs = 0;
  private hasSave = false;
  private localCharacterId: CharacterPresetId = loadSavedCharacterId();
  private localPlayerName = loadSavedPlayerName('Hoot');
  private multiplayerActive = false;
  private localMultiplayerUid = '';
  private isMultiplayerHost = true;
  private hasConnectedPeers = false;
  private awaitingRejoinWorldSync = false;
  private rejoinSyncDeadlineMs = 0;
  private allyHelpCooldown = 0;
  private nearbyInjuredPeer: NearbyInjuredPeer | null = null;
  private localMabarStats = {
    kills: 0,
    assists: 0,
    helps: 0,
    challenges: 0,
    zonesCleared: 0,
  };
  private monsterDamageContributors = new Map<string, Set<string>>();
  private peerMonsterTargets = new Map<
    string,
    { x: number; y: number; z: number; yaw: number; aggroActive?: boolean }
  >();
  private remotePeers = new Map<
    string,
    {
      state: RemotePlayerState;
      rig: HeroAvatarRig;
      pos: THREE.Vector3;
      targetPos: THREE.Vector3;
      yaw: number;
      targetYaw: number;
      weaponKey: string;
    }
  >();
  private departingPeerEffects: Array<{
    rig: HeroAvatarRig;
    elapsed: number;
    duration: number;
    startY: number;
    startYaw: number;
  }> = [];
  private wordProgressDirty = true;
  private cachedWordSummary: {
    seen: number;
    mastered: number;
    learnedIds: string[];
    legacyMastery: Record<string, number>;
    wordProgressCopy: Record<string, WordProgress>;
  } = {
    seen: 0,
    mastered: 0,
    learnedIds: [],
    legacyMastery: {},
    wordProgressCopy: {},
  };

  constructor(container: HTMLElement, callbacks: RpgEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    const gpuProbe = (() => {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2');
      if (!gl) return { software: true, gpu: '' };
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return {
        software: /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu),
        gpu,
      };
    })();
    this.isSoftwareGl = gpuProbe.software;

    this.isMobileDevice =
      typeof navigator !== 'undefined' &&
      (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 1 &&
          typeof window !== 'undefined' &&
          window.innerWidth <= 1024));
    const hwCores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    const hwMem =
      typeof navigator !== 'undefined'
        ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4
        : 4;
    this.isLowEndMobile =
      this.isMobileDevice &&
      (hwCores <= 4 ||
        hwMem <= 3 ||
        /Mali-G5[0-2]|Mali-T|Adreno \(TM\) 5|Adreno \(TM\) 610|PowerVR/i.test(gpuProbe.gpu));
    this.preferLiteShader = this.isSoftwareGl;

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: this.isMobileDevice ? 'default' : 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setPixelRatio(
      this.isSoftwareGl
        ? 1
        : Math.min(
            window.devicePixelRatio || 1,
            this.isLowEndMobile ? 1.35 : this.isMobileDevice ? 1.6 : 1.75,
          ),
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.type = this.isMobileDevice
      ? THREE.PCFShadowMap
      : THREE.PCFSoftShadowMap;
    this.renderer.setSize(
      container.clientWidth || window.innerWidth,
      container.clientHeight || window.innerHeight,
    );
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    const skyColor = new THREE.Color(0x9cd6fc);
    this.scene.background = skyColor;
    this.scene.fog = new THREE.FogExp2(0x9cd6fc, 0.0022);

    if (!this.isSoftwareGl) {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } else {
      this.scene.environment = null;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(
      50,
      width / height,
      0.16,
      this.isMobileDevice ? 460 : 560,
    );
    this.camera.position.set(16, 48, 86);
    this.scene.add(this.camera);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.07;
    this.controls.maxPolarAngle = Math.PI * 0.42;
    this.controls.minPolarAngle = 0.35;
    this.controls.minDistance = 14;
    this.controls.maxDistance = 128;
    this.controls.target.set(6, 7, -4);
    this.controls.enabled = false;

    this.hemiLight = new THREE.HemisphereLight(
      0xe0f2fe,
      0x5c913b,
      this.preferLiteShader ? 1.18 : 0.98,
    );
    this.scene.add(this.hemiLight);

    const shadowMapSize = this.isLowEndMobile ? 768 : this.isMobileDevice ? 1024 : 1536;
    this.sunLight = new THREE.DirectionalLight(0xfff4d6, 1.95);
    this.sunLight.position.set(42, 68, 42);
    this.sunLight.castShadow = !this.isSoftwareGl;
    this.sunLight.shadow.mapSize.set(shadowMapSize, shadowMapSize);
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 210;
    const d = this.isMobileDevice ? 62 : 76;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.025;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    this.rimLight = new THREE.DirectionalLight(0xd8b4fe, this.preferLiteShader ? 0.5 : 0.42);
    this.rimLight.position.set(-40, 28, -45);
    this.scene.add(this.rimLight);

    this.playerCaveLight = new THREE.PointLight(0xffedd5, 0, 16, 1.6);
    this.playerCaveLight.position.set(0, 2.8, 0);
    this.scene.add(this.playerCaveLight);

    this.palette = createMaterialPalette(this.renderer, this.isSoftwareGl, this.preferLiteShader);
    this.overworldGroup = new THREE.Group();
    this.scene.add(this.overworldGroup);

    this.buildFantasyTerrain();
    this.overworldGroup.add(createZoneLandmarks(this.palette));

    this.portalRig = createPortalArch(this.palette);
    const pp = OVERWORLD_ANCHORS.portal;
    this.portalRig.root.position.set(pp.x, getArchipelagoGroundY(pp.x, pp.z), pp.z);
    this.portalRig.root.rotation.y = 0.34;
    this.portalRig.root.userData.portal = true;
    this.overworldGroup.add(this.portalRig.root);
    this.overworldClickables.push(this.portalRig.root);

    this.areaMists = createAreaMists();
    this.areaMists.forEach((m) => this.overworldGroup.add(m));
    this.createSpreadingWorldMist();

    this.starterPickupMesh = createStarterWeaponPickup(this.palette);
    const sw = OVERWORLD_ANCHORS.starterWeapon;
    this.starterPickupMesh.position.set(sw.x, getArchipelagoGroundY(sw.x, sw.z), sw.z);
    this.starterPickupMesh.userData.starterPickup = true;
    this.overworldGroup.add(this.starterPickupMesh);
    this.overworldClickables.push(this.starterPickupMesh);

    this.swimSuitPickupMesh = createSwimSuitPickup(this.palette);
    const ss = OVERWORLD_ANCHORS.swimSuit;
    this.swimSuitPickupMesh.position.set(ss.x, getArchipelagoGroundY(ss.x, ss.z), ss.z);
    this.swimSuitPickupMesh.userData.swimSuitPickup = true;
    this.overworldGroup.add(this.swimSuitPickupMesh);
    this.overworldClickables.push(this.swimSuitPickupMesh);

    this.carRig = createDriveableCarRig(this.palette);
    this.carRig.root.position.copy(this.carPos);
    this.carRig.root.rotation.y = this.carYaw;
    this.carRig.root.userData.driveableCar = true;
    this.carRig.root.userData.vehicleId = 'hero_car';
    this.overworldGroup.add(this.carRig.root);
    this.overworldClickables.push(this.carRig.root);
    this.initWorldVehicles();
    this.initWorldPlanes();

    const reticleGeo = new THREE.RingGeometry(5.6, 6.8, 28);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.72,
    });
    this.bombReticleMesh = new THREE.Mesh(reticleGeo, reticleMat);
    this.bombReticleMesh.rotation.x = -Math.PI / 2;
    this.bombReticleMesh.visible = false;
    this.bombReticleMesh.userData.isMapHidden = true;
    this.overworldGroup.add(this.bombReticleMesh);

    this.cloudsMesh = createVoxelClouds(36, this.preferLiteShader);
    this.cloudsMesh.userData.isMapHidden = true;
    this.overworldGroup.add(this.cloudsMesh);

    this.mapCamera = new THREE.OrthographicCamera(-36, 36, 36, -36, 0.5, 250);
    this.mapCamera.up.set(0, 0, -1);
    this.mapRtMinimap = new THREE.WebGLRenderTarget(MAP_MINI_SIZE, MAP_MINI_SIZE, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: false,
      depthBuffer: true,
    });
    this.mapRtFull = new THREE.WebGLRenderTarget(MAP_FULL_W, MAP_FULL_H, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: false,
      depthBuffer: true,
    });
    this.mapPixelsMinimap = new Uint8Array(MAP_MINI_SIZE * MAP_MINI_SIZE * 4);
    this.mapPixelsFull = new Uint8Array(MAP_FULL_W * MAP_FULL_H * 4);
    this.mapCanvasMinimap = document.createElement('canvas');
    this.mapCanvasMinimap.width = MAP_MINI_SIZE;
    this.mapCanvasMinimap.height = MAP_MINI_SIZE;
    this.mapCtxMinimap = this.mapCanvasMinimap.getContext('2d');
    this.mapImageDataMinimap = this.mapCtxMinimap
      ? this.mapCtxMinimap.createImageData(MAP_MINI_SIZE, MAP_MINI_SIZE)
      : null;
    this.mapCanvasFull = document.createElement('canvas');
    this.mapCanvasFull.width = MAP_FULL_W;
    this.mapCanvasFull.height = MAP_FULL_H;
    this.mapCtxFull = this.mapCanvasFull.getContext('2d');
    this.mapImageDataFull = this.mapCtxFull
      ? this.mapCtxFull.createImageData(MAP_FULL_W, MAP_FULL_H)
      : null;

    this.hero = createHeroAvatar(
      this.palette,
      getCharacterPreset(this.localCharacterId).colors,
      this.localCharacterId,
    );
    this.hero.root.position.copy(this.heroPos);
    setHeroWeaponVisual(this.hero, 'ketapel', false);
    this.scene.add(this.hero.root);

    this.fpViewRig = createFirstPersonViewRig(this.palette);
    this.fpViewRig.root.visible = false;
    setFirstPersonHeldVisual(this.fpViewRig, 'bare', 'ketapel');
    this.camera.add(this.fpViewRig.root);

    this.owlRig = createOwlMessengerRig(this.palette);
    this.owlRig.root.visible = false;
    this.scene.add(this.owlRig.root);

    this.initNpcs();
    this.initOverworldMonsters();
    this.initProjectilePool();

    const dGeo = new THREE.OctahedronGeometry(0.75, 0);
    const dMat = this.palette.createSurfaceMat({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.45,
      roughness: 0.12,
      metalness: 0.35,
    });
    this.diamondInstanced = new THREE.InstancedMesh(dGeo, dMat, MAX_COLLECTIBLES);
    this.diamondInstanced.frustumCulled = false;
    this.overworldGroup.add(this.diamondInstanced);

    const hGeo = new THREE.BoxGeometry(0.85, 0.85, 0.45);
    const hMat = this.palette.createSurfaceMat({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.15,
    });
    this.heartInstanced = new THREE.InstancedMesh(hGeo, hMat, MAX_COLLECTIBLES);
    this.heartInstanced.frustumCulled = false;
    this.overworldGroup.add(this.heartInstanced);

    const pGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const pMat = this.palette.createSurfaceMat({ color: 0xffffff, roughness: 0.35 });
    this.particleMesh = new THREE.InstancedMesh(pGeo, pMat, MAX_PARTICLES);
    this.particleMesh.frustumCulled = false;
    this.particleMesh.visible = false;
    this.scene.add(this.particleMesh);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: -50,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 1,
      });
    }

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.checkHasSave();
    this.initDefaultQuests();
    this.spawnCollectibles();
    this.freezeOverworldStaticMatrices();
    this.mapHiddenOverworld = this.collectMapHidden(this.overworldGroup);
    this.updateOverworldDayNightAtmosphere(0, false);
    this.applyGraphicsQuality();
    this.bindEvents();
    this.pushHud(true);

    this.lastTimeMs = performance.now();
    this.scheduleNextTick();
  }

  private collectMapHidden(root: THREE.Object3D): THREE.Object3D[] {
    const out: THREE.Object3D[] = [];
    root.traverse((obj) => {
      if (obj.userData?.isMapHidden) out.push(obj);
    });
    return out;
  }

  private freezeOverworldStaticMatrices(): void {
    const dyn = new Set<THREE.Object3D>();
    dyn.add(this.archipelagoRig.windmillHub);
    dyn.add(this.archipelagoRig.minecart);
    dyn.add(this.archipelagoRig.istanaRig.istanaGroup);
    for (const g of this.archipelagoRig.gears) dyn.add(g.mesh);
    for (const ch of this.archipelagoRig.clockHands) dyn.add(ch);
    for (const c of this.archipelagoRig.cars) dyn.add(c.mesh);
    for (const zc of this.archipelagoRig.zooCritters) dyn.add(zc.root);
    if (this.archipelagoUnderwaterRig) {
      for (const dn of this.archipelagoUnderwaterRig.dynamicNodes) {
        dyn.add(dn);
      }
    }

    for (const v of this.villageRig.villagers) dyn.add(v.root);
    for (const gm of this.villageRig.golems) dyn.add(gm.root);
    for (const ll of this.villageRig.llamas) dyn.add(ll.root);
    for (const b of this.villageRig.bees) dyn.add(b.root);
    for (const p of this.villageRig.pillagers) dyn.add(p.root);
    for (const c of this.villageRig.critters) dyn.add(c.root);
    for (const s of this.villageRig.smokePuffs) dyn.add(s.mesh);
    for (const fl of this.villageRig.torchesFlame) dyn.add(fl);
    if (this.villageRig.sunGroup) dyn.add(this.villageRig.sunGroup);
    if (this.villageRig.moonGroup) dyn.add(this.villageRig.moonGroup);
    if (this.villageRig.outpostBanner) dyn.add(this.villageRig.outpostBanner);
    if (this.villageRig.breezeMotes?.mesh) dyn.add(this.villageRig.breezeMotes.mesh);

    // worldObstaclesRig already freezes its own static parts & manages dynamic pivots internally
    dyn.add(this.worldObstaclesRig.group);
    dyn.add(this.portalRig.ringOuter);
    dyn.add(this.portalRig.ringInner);
    dyn.add(this.starterPickupMesh);
    dyn.add(this.swimSuitPickupMesh);
    dyn.add(this.carRig.root);
    for (const pl of this.worldPlanes) dyn.add(pl.root);
    if (this.bombReticleMesh) dyn.add(this.bombReticleMesh);
    const airbase = this.archipelagoRig.airbaseRig;
    for (const d of airbase.radarDishes) dyn.add(d);
    for (const w of airbase.windsocks) dyn.add(w);
    for (const rp of airbase.resupplyPads) dyn.add(rp.ringMesh);
    for (const rg of airbase.rings) dyn.add(rg.mesh);
    dyn.add(this.cloudsMesh);
    dyn.add(this.diamondInstanced);
    dyn.add(this.heartInstanced);
    this.areaMists.forEach((m) => dyn.add(m));
    if (this.worldMistMesh) dyn.add(this.worldMistMesh);
    this.npcs.forEach((n) => {
      dyn.add(n.mesh);
      dyn.add(n.alertMesh);
      dyn.add(n.aura.group);
    });
    for (const m of this.overworldAllMonsters) dyn.add(m.mesh);

    freezeStaticSubtree(this.overworldGroup, dyn);
  }

  private getBaseTargetDpr(): number {
    const fx = this.settings.fxLevel;
    const dprRaw = window.devicePixelRatio || 1;
    if (this.isSoftwareGl) return 1;
    if (fx === 'off') {
      return this.isMobileDevice ? Math.min(dprRaw, 1.0) : Math.min(dprRaw, 1.1);
    }
    if (fx === 'lite') {
      return this.isLowEndMobile
        ? Math.min(dprRaw, 1.15)
        : this.isMobileDevice
        ? Math.min(dprRaw, 1.25)
        : Math.min(dprRaw, 1.35);
    }
    return this.isLowEndMobile
      ? Math.min(dprRaw, 1.35)
      : this.isMobileDevice
      ? Math.min(dprRaw, 1.6)
      : Math.min(dprRaw, 1.75);
  }

  private applyEffectivePixelRatio(forceResize = false): void {
    const baseDpr = this.getBaseTargetDpr();
    const minFloor = this.isSoftwareGl
      ? 1
      : this.worldMode === 'ocean' && this.isMobileDevice
      ? 0.78
      : this.isMobileDevice
      ? 1.0
      : 1.1;
    const scaled =
      this.settings.fxLevel === 'full' && !this.isSoftwareGl
        ? Math.max(minFloor, Math.round(baseDpr * this.activeDprScale * 100) / 100)
        : baseDpr;
    if (!forceResize && Math.abs(scaled - this.appliedDpr) < 0.03) return;
    this.appliedDpr = scaled;
    this.renderer.setPixelRatio(scaled);
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h);
  }

  private applyGraphicsQuality(): void {
    const fx = this.settings.fxLevel;
    this.activeDprScale = 1.0;
    this.slowFrameStreak = 0;
    this.fastFrameStreak = 0;
    this.applyEffectivePixelRatio(true);

    // Keep crisp sun shadows active across GPU devices (throttled & dirty-checked) unless FX is Off
    const shadowsOn = !this.isSoftwareGl && fx !== 'off';
    this.renderer.shadowMap.enabled = shadowsOn;
    this.sunLight.castShadow = shadowsOn;
    if (shadowsOn) {
      this.renderer.shadowMap.needsUpdate = true;
      this.lastShadowUpdateMs = performance.now();
    }

    if (this.villageRig?.breezeMotes) {
      this.villageRig.breezeMotes.mesh.visible = fx !== 'off';
    }
    this.forceRenderNextFrame = true;
  }

  private checkHasSave(): void {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      this.hasSave = Boolean(raw);
    } catch {
      this.hasSave = false;
    }
  }

  private getOrCreateZoneCaveDetail(zoneId: ZoneId): SavedZoneCaveDetail {
    if (!this.zoneCaveDetails[zoneId]) {
      this.zoneCaveDetails[zoneId] = {
        defeatedEnemyIds: [],
        brokenBlockIds: [],
        placedShieldBlocks: [],
        placedTorches: [],
        triggeredBlockAmbushes: [],
      };
    }
    return this.zoneCaveDetails[zoneId]!;
  }

  private markDungeonEnemyDefeated(zoneId: ZoneId, enemyId: string): void {
    const detail = this.getOrCreateZoneCaveDetail(zoneId);
    if (!detail.defeatedEnemyIds.includes(enemyId)) {
      detail.defeatedEnemyIds.push(enemyId);
    }
  }

  private saveProgress(): void {
    if (this.multiplayerActive) return;
    try {
      // Sync live overworld night shooter states before saving
      if (this.worldMode === 'overworld' && this.nightShooterSaved.length > 0) {
        for (const saved of this.nightShooterSaved) {
          const live = this.shooters.find((s) => s.id === saved.id);
          if (live) {
            saved.x = live.x;
            saved.z = live.z;
            saved.hp = live.hp;
            saved.alive = live.alive;
          }
        }
      }

      const overworldPos =
        this.worldMode === 'overworld' ? this.heroPos : this.savedOverworldHeroPos;
      const savedNightMonsters: SavedOverworldNightMonster[] = this.monsters
        .filter((m) => m.alive)
        .map((m) => ({
          id: m.id,
          type: m.type,
          name: m.name,
          zoneId: m.zoneId,
          x: m.x,
          y: m.y,
          z: m.z,
          homeX: m.homeX,
          homeZ: m.homeZ,
          mobHp: m.mobHp ?? m.maxMobHp ?? 4,
          maxMobHp: m.maxMobHp ?? 4,
          maxHp: m.maxHp,
          stanceHp: m.stanceHp,
          combatOnly: Boolean(m.combatOnly),
          isNightMonster: Boolean(m.isNightMonster),
          wordIds: m.wordIds,
          rewardXp: m.rewardXp,
          rewardDiamonds: m.rewardDiamonds,
          rewardScore: m.rewardScore,
        }));
      const savedDefeatedSeaSkyIds: string[] = [];
      for (const sm of this.seaMonsters) {
        if (!sm.alive) savedDefeatedSeaSkyIds.push(sm.id);
      }
      for (const sk of this.skyMonsters) {
        if (!sk.alive) savedDefeatedSeaSkyIds.push(sk.id);
      }

      const payload: SavedStatePayload = {
        version: 1,
        xp: this.xp,
        hp: this.hp,
        maxHp: this.maxHp,
        diamonds: this.diamonds,
        score: this.score,
        maxStreak: this.maxStreak,
        dailyDate: this.dailyDate,
        dailyCount: this.dailyCount,
        monstersDefeated: this.monstersDefeated,
        wordProgress: this.wordProgress,
        activeWeapon: this.activeWeapon,
        ownedWeapons: Array.from(this.ownedWeapons),
        weaponAmmo: { ...this.weaponAmmo },
        starterWeaponPicked: this.starterWeaponPicked,
        swimSuitPicked: this.swimSuitPicked,
        ownedRelics: Array.from(this.ownedRelics),
        ribbons: Array.from(this.ribbons),
        liberatedZones: Array.from(this.liberatedZones),
        areaTrophies: Array.from(this.areaTrophies),
        areaDoorsCleared: this.areaDoorsCleared,
        areaDeals: this.areaDeals,
        ieltsScores: this.ieltsScores,
        ieltsCleared: this.ieltsCleared,
        settings: this.settings,
        introDone: this.introDone,
        caveIntrosSeen: Array.from(this.caveIntrosSeen),
        defeatedBossZones: Array.from(this.defeatedBossZones),
        zoneCaveProgress: { ...this.zoneCaveProgress },
        zoneCaveDetails: this.zoneCaveDetails,
        caveTorchesLeft: this.caveTorchesLeft,
        caveBlocksMined: this.caveBlocksMined,
        caveShieldBlocksLeft: this.caveShieldBlocksLeft,
        caveTntLeft: this.caveTntLeft,
        pickaxeTier: this.pickaxeTier,
        worldTimeTick: Math.round(this.worldTimeTick),
        dayCount: this.dayCount,
        lastWorldMode: this.worldMode,
        lastDungeonZoneId: this.worldMode === 'dungeon' ? this.dungeonState?.zoneId : undefined,
        lastDungeonMixed:
          this.worldMode === 'dungeon' ? Boolean(this.dungeonState?.isMixedChallenge) : undefined,
        lastHeroPos: {
          x: this.heroPos.x,
          y: this.heroPos.y,
          z: this.heroPos.z,
          yaw: this.heroYaw,
        },
        savedOverworldHeroPos: {
          x: overworldPos.x,
          y: overworldPos.y,
          z: overworldPos.z,
        },
        nightWaveDaySpawned: this.nightWaveDaySpawned,
        dayWaveDaySpawned: this.dayWaveDaySpawned,
        surfaceWaveMode: this.surfaceWaveMode,
        nightWaveTotal: this.nightWaveTotal,
        missionWaveSeed: this.missionWaveSeed,
        missionWaveCount: this.missionWaveCount,
        missionWaveCompleted: this.missionWaveCompleted,
        currentSquadName: this.currentSquadName,
        nightZoneTotals: { ...this.nightZoneTotals },
        nightMonsterSeq: this.nightMonsterSeq,
        savedNightMonsters,
        savedDefeatedSeaSkyIds,
        savedNightShooters: this.nightShooterSaved.map((s) => ({ ...s })),
        savedCollectibles: this.collectibles.map((c) => ({
          active: c.active,
          respawnTimer: c.respawnTimer,
        })),
        defeatedAcademyEnemyIds: Array.from(this.defeatedAcademyEnemyIds),
        oceanGear: Array.from(this.oceanGear),
        oceanMaterials: { ...this.oceanMaterials },
        discoveredBiota: Array.from(this.discoveredBiota),
        oceanOpenedChests: Array.from(this.openedOceanChests),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      this.hasSave = true;
    } catch {
      // ignore storage quota errors
    }
  }

  private loadProgress(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw) as SavedStatePayload;
      this.xp = data.xp || 0;
      this.maxHp = data.maxHp || TUNE.hpStart;
      this.hp = Math.max(1, Math.min(this.maxHp, data.hp || this.maxHp));
      this.diamonds = data.diamonds ?? 1;
      this.score = data.score || 0;
      this.maxStreak = data.maxStreak || 0;
      const today = todayKey();
      if (data.dailyDate === today) {
        this.dailyDate = today;
        this.dailyCount = data.dailyCount || 0;
      } else {
        this.dailyDate = today;
        this.dailyCount = 0;
        // Daily +6 ketapel ammo bonus
        if (data.starterWeaponPicked) {
          data.weaponAmmo.ketapel = Math.min(MAX_AMMO, (data.weaponAmmo.ketapel || 0) + 6);
        }
      }
      this.monstersDefeated = data.monstersDefeated || 0;
      this.wordProgress = data.wordProgress || {};
      this.wordProgressDirty = true;
      this.activeWeapon = data.activeWeapon || 'ketapel';
      this.ownedWeapons = new Set(data.ownedWeapons || []);
      this.weaponAmmo = {
        ketapel: data.weaponAmmo?.ketapel || 0,
        kerikil: data.weaponAmmo?.kerikil || 0,
        emas: data.weaponAmmo?.emas || 0,
        saus: data.weaponAmmo?.saus || 0,
        biji: data.weaponAmmo?.biji || 0,
        kertas: data.weaponAmmo?.kertas || 0,
        jarum: data.weaponAmmo?.jarum || 0,
        kristal: data.weaponAmmo?.kristal || 0,
      };
      this.caveTorchesLeft = data.caveTorchesLeft ?? 16;
      this.caveBlocksMined = data.caveBlocksMined ?? 0;
      this.caveShieldBlocksLeft = data.caveShieldBlocksLeft ?? 4;
      this.caveTntLeft = data.caveTntLeft ?? 1;
      this.pickaxeTier = data.pickaxeTier ?? 1;
      this.starterWeaponPicked = Boolean(data.starterWeaponPicked);
      this.swimSuitPicked = Boolean(data.swimSuitPicked);
      this.ownedRelics = new Set(data.ownedRelics || []);
      this.ribbons = new Set(data.ribbons || []);
      this.liberatedZones = new Set(data.liberatedZones || []);
      this.areaTrophies = new Set(data.areaTrophies || []);
      this.areaDoorsCleared = data.areaDoorsCleared || {
        desa_sapaan: [],
        pasar_rasa: [],
        hutan_satwa: [],
        gerbang_kota: [],
        menara_waktu: [],
        gua_portal: [],
      };
      this.areaDeals = data.areaDeals || {};
      this.ieltsScores = data.ieltsScores || {
        listening: 0,
        reading: 0,
        writing: 0,
        speaking: 0,
        full: 0,
      };
      this.ieltsCleared = Boolean(data.ieltsCleared);
      if (data.settings) {
        this.settings = { ...this.settings, ...data.settings };
        this.applyGraphicsQuality();
      }
      this.introDone = Boolean(data.introDone);
      this.caveIntrosSeen = new Set(data.caveIntrosSeen || []);
      this.defeatedBossZones = new Set(data.defeatedBossZones || []);
      this.zoneCaveProgress = data.zoneCaveProgress ? { ...data.zoneCaveProgress } : {};
      this.zoneCaveDetails = data.zoneCaveDetails ? { ...data.zoneCaveDetails } : {};
      this.defeatedAcademyEnemyIds = new Set(data.defeatedAcademyEnemyIds || []);
      this.oceanGear = new Set(data.oceanGear || []);
      this.oceanMaterials = {
        pearl: data.oceanMaterials?.pearl || 0,
        fiber: data.oceanMaterials?.fiber || 0,
        calcium: data.oceanMaterials?.calcium || 0,
        shell: data.oceanMaterials?.shell || 0,
        food: data.oceanMaterials?.food || 0,
      };
      this.discoveredBiota = new Set(data.discoveredBiota || []);
      this.openedOceanChests = new Set(data.oceanOpenedChests || []);
      this.worldTimeTick =
        typeof data.worldTimeTick === 'number' && Number.isFinite(data.worldTimeTick)
          ? ((data.worldTimeTick % TICKS_PER_DAY) + TICKS_PER_DAY) % TICKS_PER_DAY
          : 600;
      this.dayCount =
        typeof data.dayCount === 'number' && data.dayCount >= 1 ? Math.floor(data.dayCount) : 1;
      this.lastOverworldDayPhase = this.getDayPhaseForTick(this.worldTimeTick);
      this.restoredWorldMode = data.lastWorldMode || 'overworld';
      this.restoredDungeonZoneId = data.lastDungeonZoneId || null;
      this.restoredDungeonMixed = Boolean(data.lastDungeonMixed);
      if (data.lastHeroPos) {
        const lx = data.lastHeroPos.x;
        const lz = data.lastHeroPos.z;
        const ly = data.lastHeroPos.y;
        const inArchBounds =
          Number.isFinite(lx) &&
          Number.isFinite(lz) &&
          Math.abs(lx) < WORLD_OCEAN_LIMIT - 4 &&
          Math.abs(lz) < WORLD_OCEAN_LIMIT - 4;
        if (this.restoredWorldMode === 'overworld' && !isWalkableArchipelago(lx, lz)) {
          if (inArchBounds) {
            const minSeabed = getArchipelagoSeabedY(lx, lz) + 0.45;
            this.restoredHeroPos = {
              x: lx,
              y: THREE.MathUtils.clamp(Number.isFinite(ly) ? ly : -1.16, minSeabed, 0),
              z: lz,
              yaw: data.lastHeroPos.yaw || 0,
            };
          } else {
            const sp = OVERWORLD_ANCHORS.desaSpawn;
            this.restoredHeroPos = { x: sp.x, y: getArchipelagoGroundY(sp.x, sp.z), z: sp.z, yaw: sp.yaw };
          }
        } else {
          this.restoredHeroPos = {
            ...data.lastHeroPos,
            y: this.restoredWorldMode === 'overworld' ? getArchipelagoGroundY(lx, lz) : ly,
          };
        }
      } else {
        this.restoredHeroPos = null;
      }
      if (
        data.savedOverworldHeroPos &&
        isWalkableArchipelago(data.savedOverworldHeroPos.x, data.savedOverworldHeroPos.z)
      ) {
        this.savedOverworldHeroPos.set(
          data.savedOverworldHeroPos.x,
          getArchipelagoGroundY(data.savedOverworldHeroPos.x, data.savedOverworldHeroPos.z),
          data.savedOverworldHeroPos.z,
        );
      } else {
        const sp = OVERWORLD_ANCHORS.desaSpawn;
        this.savedOverworldHeroPos.set(sp.x, getArchipelagoGroundY(sp.x, sp.z), sp.z);
      }
      this.nightWaveDaySpawned = data.nightWaveDaySpawned || 0;
      this.dayWaveDaySpawned = data.dayWaveDaySpawned || 0;
      this.surfaceWaveMode = data.surfaceWaveMode || 'night';
      this.nightWaveTotal = data.nightWaveTotal || 0;
      this.missionWaveSeed = data.missionWaveSeed || 0;
      this.missionWaveCount = data.missionWaveCount || 0;
      this.missionWaveCompleted = Boolean(data.missionWaveCompleted);
      this.currentSquadName = data.currentSquadName || '';
      if (this.missionWaveSeed > 0 && this.missionWaveCount >= 20) {
        this.missionWaveSummary = generateRandomSurfaceWave(
          this.missionWaveSeed,
          this.missionWaveCount,
        ).summary;
      } else {
        this.missionWaveSummary = [];
      }
      this.nightZoneTotals = data.nightZoneTotals ? { ...data.nightZoneTotals } : {};
      this.nightMonsterSeq = data.nightMonsterSeq || 0;
      this.restoredNightMonsters = Array.isArray(data.savedNightMonsters)
        ? data.savedNightMonsters.map((m) => ({ ...m }))
        : [];
      this.restoredDefeatedSeaSkyIds = new Set(
        Array.isArray(data.savedDefeatedSeaSkyIds) ? data.savedDefeatedSeaSkyIds : [],
      );
      this.restoredNightShooters = Array.isArray(data.savedNightShooters)
        ? data.savedNightShooters.map((s) => ({ ...s }))
        : [];
      this.nightShooterSaved = this.restoredNightShooters.map((s) => ({ ...s }));
      this.restoredCollectibles = Array.isArray(data.savedCollectibles)
        ? data.savedCollectibles.map((c) => ({ ...c }))
        : null;
      return true;
    } catch {
      return false;
    }
  }

  private buildFantasyTerrain(): void {
    this.archipelagoRig = createArchipelagoWorld(
      this.palette,
      this.isLowEndMobile || this.settings.fxLevel !== 'full',
    );
    this.overworldGroup.add(this.archipelagoRig.group);

    // Living Minecraft Village dwellers, Farm, Market traders, Iron Golems & Wildlife adapted to islands
    this.villageRig = createMinecraftVillageWorld(this.palette);
    this.villageRig.obstacles.push(...this.archipelagoRig.obstacles);
    const px = OVERWORLD_ANCHORS.portal.x;
    const pz = OVERWORLD_ANCHORS.portal.z;
    const h1y = getArchipelagoGroundY(-13.5, 84.0);
    const h2y = getArchipelagoGroundY(-20.0, 118.0);
    this.villageRig.obstacles.push(
      // Desa Sapaan 12m x 10m Village Houses (corner pillars + front cobblestone steps/torch pedestals)
      { x: -13.5, z: 84.0, halfW: 6.36, halfD: 5.36, rotY: 0.35, minY: h1y, maxY: h1y + 9.2 },
      {
        x: -13.5 + 5.42 * Math.sin(0.35),
        z: 84.0 + 5.42 * Math.cos(0.35),
        halfW: 1.5,
        halfD: 0.52,
        rotY: 0.35,
        minY: h1y,
        maxY: h1y + 1.8,
      },
      { x: -20.0, z: 118.0, halfW: 6.36, halfD: 5.36, rotY: 1.15, minY: h2y, maxY: h2y + 9.2 },
      {
        x: -20.0 + 5.42 * Math.sin(1.15),
        z: 118.0 + 5.42 * Math.cos(1.15),
        halfW: 1.5,
        halfD: 0.52,
        rotY: 1.15,
        minY: h2y,
        maxY: h2y + 1.8,
      },
      // Portal Arch stone piers in Gua Portal (center doorway stays passable)
      { x: px - 3.9, z: pz, halfW: 1.15, halfD: 1.25 },
      { x: px + 3.9, z: pz, halfW: 1.15, halfD: 1.25 },
    );
    this.villageRig.torchesFlame.push(...this.archipelagoRig.torchesFlame);
    this.overworldGroup.add(this.villageRig.group);
    this.overworldClickables.push(...this.villageRig.clickables);

    this.worldObstaclesRig = createWorldObstacles(this.palette);
    this.overworldGroup.add(this.worldObstaclesRig.group);

    const underLowDetail =
      this.isMobileDevice || this.isLowEndMobile || this.settings.fxLevel !== 'full';
    this.archipelagoUnderwaterRig = createArchipelagoUnderwaterProps(
      this.palette,
      (wx, wz) => this.isOpenSeaPoint(wx, wz, 2.5),
      getArchipelagoSeabedY,
      underLowDetail,
    );
    this.overworldGroup.add(this.archipelagoUnderwaterRig.group);
    this.overworldClickables.push(...this.archipelagoUnderwaterRig.clickables);
  }

  private initNpcs(): void {
    const alertGeo = new THREE.OctahedronGeometry(0.42, 0);
    const alertMat = this.palette.getMat(0xfacc15, 'emissive');
    const outerBeamGeo = new THREE.CylinderGeometry(0.55, 1.48, 22, 6, 1, true);
    const innerBeamGeo = new THREE.CylinderGeometry(0.16, 0.38, 24, 8, 1, true);
    const ringInnerGeo = new THREE.RingGeometry(1.12, 1.46, 28);
    const ringOuterGeo = new THREE.RingGeometry(1.62, 1.88, 28);
    const rayBladeGeo = new THREE.PlaneGeometry(0.36, 5.4);
    const moteGeo = new THREE.OctahedronGeometry(0.22, 0);
    const startAtNight = this.getCurrentDayPhase() === 'malam';

    for (const def of ALL_OVERWORLD_NPCS) {
      const zId = def.zoneId as ZoneId;
      const shift: 'day' | 'night' = def.shiftRole ?? 'day';
      const isOnDuty = (shift === 'night') === startAtNight;
      const standY = getArchipelagoGroundY(def.x, def.z);
      const spot = OVERWORLD_OFF_DUTY_SPOTS[zId] ?? {
        x: def.x - 4.0,
        z: def.z + 2.5,
        rotY: def.rotationY,
      };
      const offDutyY = getArchipelagoGroundY(spot.x, spot.z);

      const initX = isOnDuty ? def.x : spot.x;
      const initY = isOnDuty ? standY : offDutyY;
      const initZ = isOnDuty ? def.z : spot.z;
      const initYaw = isOnDuty ? def.rotationY : spot.rotY;

      const mesh = createZoneNpc(def.id, this.palette);
      mesh.position.set(initX, initY, initZ);
      mesh.rotation.y = initYaw;
      mesh.userData.npcId = def.id;
      this.overworldGroup.add(mesh);
      this.overworldClickables.push(mesh);

      const alertMesh = new THREE.Mesh(alertGeo, alertMat);
      alertMesh.position.set(initX, initY + 4.4, initZ);
      alertMesh.visible = isOnDuty;
      this.overworldGroup.add(alertMesh);

      const accentColor = new THREE.Color(def.accentColor);
      const auraGroup = new THREE.Group();
      auraGroup.position.set(initX, initY, initZ);
      auraGroup.visible = isOnDuty;

      const outerBeamMat = new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: startAtNight ? 0.3 : 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      });
      const outerBeam = new THREE.Mesh(outerBeamGeo, outerBeamMat);
      outerBeam.position.y = 11.1;
      auraGroup.add(outerBeam);

      const innerBeamMat = new THREE.MeshBasicMaterial({
        color: 0xfffbeb,
        transparent: true,
        opacity: startAtNight ? 0.42 : 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      });
      const innerBeam = new THREE.Mesh(innerBeamGeo, innerBeamMat);
      innerBeam.position.y = 12.1;
      auraGroup.add(innerBeam);

      const ringInnerMat = new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      });
      const ringInner = new THREE.Mesh(ringInnerGeo, ringInnerMat);
      ringInner.rotation.x = -Math.PI / 2;
      ringInner.position.y = 0.09;
      auraGroup.add(ringInner);

      const ringOuterMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.52,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      });
      const ringOuter = new THREE.Mesh(ringOuterGeo, ringOuterMat);
      ringOuter.rotation.x = -Math.PI / 2;
      ringOuter.position.y = 0.06;
      auraGroup.add(ringOuter);

      const rayGroup = new THREE.Group();
      const rayMat = new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0.44,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      });
      const rayCount = 5;
      for (let ri = 0; ri < rayCount; ri++) {
        const ang = (ri / rayCount) * Math.PI * 2;
        const rayBlade = new THREE.Mesh(rayBladeGeo, rayMat);
        rayBlade.position.set(Math.sin(ang) * 1.32, 2.85, Math.cos(ang) * 1.32);
        rayBlade.rotation.order = 'YXZ';
        rayBlade.rotation.y = ang;
        rayBlade.rotation.x = 0.24;
        rayGroup.add(rayBlade);
      }
      auraGroup.add(rayGroup);

      const moteMatAccent = new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      });
      const moteMatGold = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      });
      const motes: Array<{ mesh: THREE.Mesh; phase: number; speed: number }> = [];
      for (let mi = 0; mi < 4; mi++) {
        const moteMesh = new THREE.Mesh(moteGeo, mi % 2 === 0 ? moteMatAccent : moteMatGold);
        const phase = (mi / 4) * Math.PI * 2;
        moteMesh.position.set(Math.cos(phase) * 1.35, 1.0 + mi * 0.85, Math.sin(phase) * 1.35);
        auraGroup.add(moteMesh);
        motes.push({ mesh: moteMesh, phase, speed: 1.7 + (mi % 2) * 0.45 });
      }

      this.overworldGroup.add(auraGroup);

      this.npcs.set(def.id, {
        mesh,
        alertMesh,
        aura: {
          group: auraGroup,
          outerBeam,
          innerBeam,
          outerBeamMat,
          innerBeamMat,
          ringInner,
          ringOuter,
          ringInnerMat,
          ringOuterMat,
          rayGroup,
          rayMat,
          motes,
        },
        zoneId: zId,
        shift,
        partnerNpcId: def.partnerNpcId ?? def.id,
        dayNpcId: def.dayNpcId ?? def.id,
        x: initX,
        z: initZ,
        standX: def.x,
        standY,
        standZ: def.z,
        standRotY: def.rotationY,
        offDutyX: spot.x,
        offDutyY,
        offDutyZ: spot.z,
        offDutyRotY: spot.rotY,
        roamTargetX: spot.x,
        roamTargetZ: spot.z,
        roamPaused: true,
        roamTimer: 2.0 + Math.random() * 2.5,
        walkWaypoint: zId === 'hutan_satwa' ? { x: 110.0, z: 48.0 } : undefined,
        yaw: initYaw,
        poseMode: 'stand',
        lastTalkBannerMs: 0,
        koTimer: 0,
        fleeTimer: 0,
        fleeDirX: 0,
        fleeDirZ: 1,
      });
    }
  }

  private isNpcOnDuty(shift: 'day' | 'night'): boolean {
    const isNight = this.getCurrentDayPhase() === 'malam';
    return (shift === 'night') === isNight;
  }

  private grantNightPermissionForZone(zoneId: ZoneId, silent = false): void {
    if (this.getCurrentDayPhase() !== 'malam') return;
    const newlyPermitted = !this.nightPermittedZones.has(zoneId);
    this.nightPermittedZones.add(zoneId);
    if (!silent && newlyPermitted) {
      const nightDef = getActiveZoneNpcDef(zoneId, true);
      soundEngine.playPick();
      this.showBanner(
        `🔑 ${nightDef.name} (Shift Malam): "Silakan, pintu ${nightDef.zoneName} kubuka untukmu malam ini!"`,
        4.6,
      );
      this.pushHud(true);
    }
  }

  private interactWithOverworldNpc(npcId: string): void {
    const def = getZoneNpcById(npcId);
    const npc = this.npcs.get(npcId);
    if (!def || !npc) return;

    if (!this.isNpcOnDuty(npc.shift)) {
      const partnerDef = getZoneNpcById(npc.partnerNpcId);
      soundEngine.playPick();
      npc.yaw = Math.atan2(this.heroPos.x - npc.x, this.heroPos.z - npc.z);
      npc.roamPaused = true;
      npc.roamTimer = 3.5;
      npc.lastTalkBannerMs = Date.now();
      const msg =
        npc.shift === 'day'
          ? `💬 ${def.name} (Lepas Piket): "Shift siangku sudah selesai, sekarang aku warga biasa. Temui ${partnerDef?.name ?? 'Penjaga Malam'} di pintu ${def.zoneName}!"`
          : `💬 ${def.name} (Lepas Piket): "Pagi hingga sore ${partnerDef?.name ?? 'Penjaga Siang'} yang berjaga di pintu ${def.zoneName}. Nanti malam giliranku bertugas!"`;
      this.showBanner(msg, 5.0);
      this.pushHud(true);
      return;
    }

    if (this.getCurrentDayPhase() === 'malam') {
      this.nightPermittedZones.add(npc.zoneId);
    }
    if (
      this.villageAmbushState?.active &&
      (this.villageAmbushState.stage === 'awaiting_guardian_talk' ||
        this.villageAmbushState.stage === 'escort') &&
      def.zoneId === 'desa_sapaan'
    ) {
      this.villageAmbushState.stage = 'walking_home';
      this.villageAmbushState.resolved = true;
      this.villageAmbushState.timer = 0;
      for (const ambNpc of this.villageAmbushState.npcs) {
        if (ambNpc.role === 'survivor' && ambNpc.alive) {
          ambNpc.shoutLive = '👋 Kami pulang ke rumah dulu ya, Pahlawan! Semoga berhasil!';
        }
      }
    }
    this.dialogueTargetNpcId = npcId;
    const npcGroundY = getArchipelagoGroundY(npc.x, npc.z);
    let dx = this.heroPos.x - npc.x;
    let dz = this.heroPos.z - npc.z;
    let dist = Math.hypot(dx, dz);
    if (dist < 0.05) {
      dx = Math.sin(npc.standRotY);
      dz = Math.cos(npc.standRotY);
      dist = 1;
    }
    const desiredDist = 2.35;
    if (dist < 1.8 || dist > 3.1) {
      const nx = npc.x + (dx / dist) * desiredDist;
      const nz = npc.z + (dz / dist) * desiredDist;
      const ny = getArchipelagoGroundY(nx, nz);
      if (sampleArchipelagoTerrain(nx, nz).isLandOrBridge && Math.abs(ny - npcGroundY) < 1.6) {
        this.heroPos.set(nx, ny, nz);
        this.hero.root.position.copy(this.heroPos);
      }
    }
    this.heroYaw = Math.atan2(npc.x - this.heroPos.x, npc.z - this.heroPos.z);
    this.hero.body.rotation.y = this.heroYaw;
    npc.yaw = Math.atan2(this.heroPos.x - npc.x, this.heroPos.z - npc.z);
    npc.poseMode = 'stand';
    npc.mesh.rotation.y = npc.yaw;

    this.phase = 'dialogue';
    this.heldKeys.clear();
    this.applyCameraVisibilityAndControls();
    this.callbacks.onOpenNpcDialogue(npcId);
    this.pushHud(true);
  }

  private rebuildOverworldMonsterPool(): void {
    this.overworldAllMonsters.length = 0;
    for (let i = 0; i < this.monsters.length; i++) this.overworldAllMonsters.push(this.monsters[i]);
    for (let i = 0; i < this.seaMonsters.length; i++) this.overworldAllMonsters.push(this.seaMonsters[i]);
    for (let i = 0; i < this.skyMonsters.length; i++) this.overworldAllMonsters.push(this.skyMonsters[i]);
  }

  private isOpenSeaPoint(x: number, z: number, clearance = 3.0): boolean {
    const limit = WORLD_OCEAN_LIMIT - 12;
    if (Math.abs(x) > limit || Math.abs(z) > limit) return false;
    if (sampleArchipelagoTerrain(x, z).isLandOrBridge) return false;
    if (
      sampleArchipelagoTerrain(x + clearance, z).isLandOrBridge ||
      sampleArchipelagoTerrain(x - clearance, z).isLandOrBridge ||
      sampleArchipelagoTerrain(x, z + clearance).isLandOrBridge ||
      sampleArchipelagoTerrain(x, z - clearance).isLandOrBridge
    ) {
      return false;
    }
    return true;
  }

  private isHeroNearSeaShore(): boolean {
    if (
      this.worldMode === 'ocean' ||
      this.isSwimming ||
      this.isHeroUnderwater() ||
      this.ridingTurtle ||
      Boolean(this.diveTransition?.active)
    ) {
      return true;
    }
    if (this.worldMode !== 'overworld') return false;
    const hx = this.heroPos.x;
    const hz = this.heroPos.z;
    const center = sampleArchipelagoTerrain(hx, hz);
    if (!center.isLandOrBridge || center.surface === 'beach' || center.surface === 'water') {
      return true;
    }
    const radii = [8, 14];
    for (let ri = 0; ri < radii.length; ri++) {
      const r = radii[ri];
      for (let k = 0; k < 8; k++) {
        const ang = (k / 8) * Math.PI * 2;
        const s = sampleArchipelagoTerrain(hx + Math.cos(ang) * r, hz + Math.sin(ang) * r);
        if (!s.isLandOrBridge || s.surface === 'beach' || s.surface === 'water') {
          return true;
        }
      }
    }
    return false;
  }

  private resolveSafeSeaSpawnPos(rawX: number, rawZ: number): { x: number; z: number } {
    if (this.isOpenSeaPoint(rawX, rawZ, 3.2)) {
      return { x: rawX, z: rawZ };
    }
    for (let r = 4; r <= 38; r += 4) {
      for (let k = 0; k < 12; k++) {
        const ang = (k / 12) * Math.PI * 2;
        const tx = rawX + Math.cos(ang) * r;
        const tz = rawZ + Math.sin(ang) * r;
        if (this.isOpenSeaPoint(tx, tz, 3.0)) {
          return { x: tx, z: tz };
        }
      }
    }
    return { x: rawX, z: rawZ };
  }

  private constrainSeaMonsterToWater(
    pt: { x: number; z: number },
    fallbackX: number,
    fallbackZ: number,
    clearance = 2.4,
  ): void {
    const limit = WORLD_OCEAN_LIMIT - 12;
    pt.x = THREE.MathUtils.clamp(pt.x, -limit, limit);
    pt.z = THREE.MathUtils.clamp(pt.z, -limit, limit);
    if (this.isOpenSeaPoint(pt.x, pt.z, clearance)) return;
    if (this.isOpenSeaPoint(pt.x, fallbackZ, clearance)) {
      pt.z = fallbackZ;
      return;
    }
    if (this.isOpenSeaPoint(fallbackX, pt.z, clearance)) {
      pt.x = fallbackX;
      return;
    }
    pt.x = fallbackX;
    pt.z = fallbackZ;
  }

  private initSeaMonsters(): void {
    for (const sm of this.seaMonsters) {
      if (sm.mesh.parent) sm.mesh.parent.remove(sm.mesh);
      const clickIdx = this.overworldClickables.indexOf(sm.mesh);
      if (clickIdx >= 0) this.overworldClickables.splice(clickIdx, 1);
    }
    this.seaMonsters = [];

    const diff = this.settings.difficulty;
    const diffHpMult = diff === 'santai' ? 0.8 : diff === 'pendekar' ? 1.25 : 1.0;

    for (let i = 0; i < SEA_MONSTER_SPAWNS.length; i++) {
      const tpl = SEA_MONSTER_SPAWNS[i];
      const spec = MONSTER_SPECS[tpl.type];
      const safe = this.resolveSafeSeaSpawnPos(tpl.x, tpl.z);
      const mesh = createMonsterMesh(tpl.type, this.palette);
      mesh.position.set(safe.x, spec.hoverY, safe.z);

      const ringRadius = Math.max(1.2, spec.hitRadius * 0.85);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(ringRadius, ringRadius + 0.45, 24),
        new THREE.MeshBasicMaterial({
          color: 0x06b6d4,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.72,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.08 - spec.hoverY;
      mesh.add(ring);
      mesh.userData.combatRing = ring;

      const mId = `sea_mob_${i}_${tpl.type}`;
      mesh.userData.monsterId = mId;
      this.overworldGroup.add(mesh);
      this.overworldClickables.push(mesh);

      const maxMobHp = Math.max(3, Math.round(spec.hitHp * diffHpMult));
      this.seaMonsters.push({
        id: mId,
        type: tpl.type,
        name: tpl.name,
        zoneId: tpl.zoneId,
        homeX: safe.x,
        homeZ: safe.z,
        x: safe.x,
        y: spec.hoverY,
        z: safe.z,
        maxHp: spec.quizHp,
        mobHp: maxMobHp,
        maxMobHp,
        rewardXp: spec.rewardXp + (diff === 'pendekar' ? 10 : 0),
        rewardDiamonds: spec.rewardDiamonds,
        rewardScore: spec.rewardScore,
        combatOnly: true,
        isSeaMonster: true,
        aggroActive: false,
        attackCooldown: 1.0 + Math.random() * 0.8,
        windupTimer: -1,
        lungeTimer: 0,
        hitFlashTimer: 0,
        mesh,
        alive: true,
        respawnTimer: 0,
        patrolPhase: Math.random() * Math.PI * 2,
        angryTimer: 0,
      });
    }
    this.rebuildOverworldMonsterPool();
  }

  private initSkyMonsters(): void {
    for (const sk of this.skyMonsters) {
      if (sk.mesh.parent) sk.mesh.parent.remove(sk.mesh);
      const clickIdx = this.overworldClickables.indexOf(sk.mesh);
      if (clickIdx >= 0) this.overworldClickables.splice(clickIdx, 1);
    }
    this.skyMonsters = [];

    const diff = this.settings.difficulty;
    const diffHpMult = diff === 'santai' ? 0.85 : diff === 'pendekar' ? 1.25 : 1.0;

    for (let i = 0; i < SKY_MONSTER_SPAWNS.length; i++) {
      const tpl = SKY_MONSTER_SPAWNS[i];
      const spec = MONSTER_SPECS[tpl.type];
      const groundY = getArchipelagoGroundY(tpl.x, tpl.z);
      const startY = groundY + spec.hoverY;
      const mesh = createMonsterMesh(tpl.type, this.palette);
      mesh.position.set(tpl.x, startY, tpl.z);

      const ringRadius = Math.max(1.15, spec.hitRadius * 0.72);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(ringRadius, ringRadius + 0.36, 22),
        new THREE.MeshBasicMaterial({
          color: tpl.combatOnly ? 0xf97316 : 0xa855f7,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.68,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -0.35;
      mesh.add(ring);
      mesh.userData.combatRing = ring;

      const mId = `sky_mob_${i}_${tpl.type}`;
      mesh.userData.monsterId = mId;
      this.overworldGroup.add(mesh);
      this.overworldClickables.push(mesh);

      const maxMobHp = Math.max(4, Math.round(spec.hitHp * diffHpMult));
      this.skyMonsters.push({
        id: mId,
        type: tpl.type,
        name: tpl.name,
        zoneId: tpl.zoneId,
        homeX: tpl.x,
        homeZ: tpl.z,
        x: tpl.x,
        y: startY,
        z: tpl.z,
        maxHp: spec.quizHp,
        mobHp: tpl.combatOnly ? maxMobHp : spec.quizHp,
        maxMobHp: tpl.combatOnly ? maxMobHp : spec.quizHp,
        stanceHp: tpl.combatOnly ? 0 : spec.stanceHp,
        rewardXp: spec.rewardXp + (diff === 'pendekar' ? 10 : 0),
        rewardDiamonds: spec.rewardDiamonds,
        rewardScore: spec.rewardScore,
        combatOnly: tpl.combatOnly,
        isSkyMonster: true,
        wordIds: tpl.combatOnly ? undefined : this.pickZoneChallengeWords(tpl.zoneId, 4),
        aggroActive: false,
        attackCooldown: 1.2 + Math.random() * 1.4,
        windupTimer: -1,
        lungeTimer: 0,
        hitFlashTimer: 0,
        mesh,
        alive: true,
        respawnTimer: 0,
        patrolPhase: Math.random() * Math.PI * 2,
        angryTimer: 0,
      });
    }
    this.rebuildOverworldMonsterPool();
  }

  private initOverworldMonsters(): void {
    this.monsters = [];
    this.initSeaMonsters();
    this.initSkyMonsters();
    this.rebuildOverworldMonsterPool();
  }

  private pickRandomWorldTimeTick(): number {
    const phases: DayPhaseId[] = ['pagi', 'siang', 'sore', 'malam'];
    const picked = phases[Math.floor(Math.random() * phases.length)];
    if (picked === 'pagi') {
      return 23050 + Math.floor(Math.random() * 650);
    }
    if (picked === 'sore') {
      return 12050 + Math.floor(Math.random() * 650);
    }
    if (picked === 'malam') {
      return 13200 + Math.floor(Math.random() * 8800);
    }
    return 400 + Math.floor(Math.random() * 10800);
  }

  private getDayPhaseForTick(tick: number): DayPhaseId {
    const t = ((tick % TICKS_PER_DAY) + TICKS_PER_DAY) % TICKS_PER_DAY;
    if (t < 12000) return 'siang';
    if (t < 13000) return 'sore';
    if (t < 23000) return 'malam';
    return 'pagi';
  }

  private getCurrentDayPhase(): DayPhaseId {
    return this.getDayPhaseForTick(this.worldTimeTick);
  }

  private getWorldTimeState(): WorldTimeState {
    const t = ((this.worldTimeTick % TICKS_PER_DAY) + TICKS_PER_DAY) % TICKS_PER_DAY;
    const phase = this.getDayPhaseForTick(t);
    const labelMap: Record<DayPhaseId, string> = {
      pagi: 'Pagi / Fajar',
      siang: 'Siang',
      sore: 'Sore / Senja',
      malam: 'Malam',
    };
    const remTicks =
      phase === 'siang'
        ? 12000 - t
        : phase === 'sore'
        ? 13000 - t
        : phase === 'malam'
        ? 23000 - t
        : 24000 - t;
    let activeSurfaceCount = 0;
    let activeNightMobs = 0;
    for (let i = 0; i < this.monsters.length; i++) {
      const m = this.monsters[i];
      if (!m.alive) continue;
      activeSurfaceCount++;
      if (m.isNightMonster) activeNightMobs++;
    }
    for (let i = 0; i < this.seaMonsters.length; i++) {
      if (this.seaMonsters[i].alive) activeSurfaceCount++;
    }
    for (let i = 0; i < this.skyMonsters.length; i++) {
      if (this.skyMonsters[i].alive) activeSurfaceCount++;
    }
    let activeNightShooters = 0;
    for (let i = 0; i < this.shooters.length; i++) {
      const s = this.shooters[i];
      if (s.alive && s.isNightShooter) activeNightShooters++;
    }
    const activeNightCount = activeNightMobs + activeNightShooters;
    const seaSkyCount = this.seaMonsters.length + this.skyMonsters.length;
    const expectedTotal =
      (this.missionWaveCount > 0 ? this.missionWaveCount : phase === 'malam' ? 50 : 30) + seaSkyCount;
    const waveTotal = Math.max(
      (this.missionWaveCount || this.nightWaveTotal || (phase === 'malam' ? 50 : 30)) + seaSkyCount,
      expectedTotal,
      activeSurfaceCount,
    );
    const waveDefeated = Math.max(0, waveTotal - activeSurfaceCount);
    return {
      tick: Math.round(t),
      phase,
      phaseLabel: labelMap[phase],
      dayCount: this.dayCount,
      phaseRemainingSec: Math.max(0, Math.ceil(remTicks / TICKS_PER_SEC)),
      nightMonsterCount: phase === 'malam' ? activeNightCount : 0,
      nightWaveDefeated: phase === 'malam' ? waveDefeated : 0,
      nightWaveTotal: phase === 'malam' ? waveTotal : 0,
      surfaceMonsterCount: activeSurfaceCount,
      surfaceWaveDefeated: waveDefeated,
      surfaceWaveTotal: waveTotal,
    };
  }

  private clearOverworldNightMonsters(): void {
    for (const m of this.monsters) {
      if (m.mesh.parent) m.mesh.parent.remove(m.mesh);
      const clickIdx = this.overworldClickables.indexOf(m.mesh);
      if (clickIdx >= 0) this.overworldClickables.splice(clickIdx, 1);
    }
    this.monsters = [];
    this.nightWaveTotal = 0;
    this.nightZoneTotals = {};
    this.nightShooterSaved = [];
    this.rebuildOverworldMonsterPool();
  }

  private pickZoneChallengeWords(zoneId: ZoneId, count = 4): string[] {
    const zonePool = getWordsForZone(zoneId);
    const source = zonePool.length > 0 ? zonePool : VOCAB_CATALOG;
    const out: string[] = [];
    for (let i = 0; i < count && source.length > 0; i++) {
      const picked = source[Math.floor(Math.random() * source.length)];
      if (picked && !out.includes(picked.id)) {
        out.push(picked.id);
      }
    }
    return out;
  }

  private resolveSafeOverworldMonsterSpot(rawX: number, rawZ: number): { x: number; z: number } {
    let sx = rawX;
    let sz = rawZ;
    const avoidPoints = [
      { x: this.heroPos.x, z: this.heroPos.z, minR: 11.0 },
      { x: OVERWORLD_ANCHORS.desaSpawn.x, z: OVERWORLD_ANCHORS.desaSpawn.z, minR: 12.0 },
      { x: OVERWORLD_ANCHORS.starterWeapon.x, z: OVERWORLD_ANCHORS.starterWeapon.z, minR: 10.0 },
      { x: OVERWORLD_ANCHORS.swimSuit.x, z: OVERWORLD_ANCHORS.swimSuit.z, minR: 9.0 },
    ];
    for (const pt of avoidPoints) {
      const dx = sx - pt.x;
      const dz = sz - pt.z;
      const d = Math.hypot(dx, dz);
      if (d < pt.minR) {
        const angle = d > 0.1 ? Math.atan2(dz, dx) : Math.random() * Math.PI * 2;
        sx = pt.x + Math.cos(angle) * (pt.minR + 2.5);
        sz = pt.z + Math.sin(angle) * (pt.minR + 2.5);
      }
    }
    // Nudge out of village buildings/trees/obstacles (supports rotated OBBs)
    const clampPt = { x: sx, z: sz };
    resolveObstacleBoxes(clampPt, 1.85, this.villageRig.obstacles);
    constrainToWalkableArchipelago(clampPt, 1.3);
    return clampPt;
  }

  private isInDesaSapaanArea(x: number, z: number): boolean {
    return z >= 52 && z <= 185 && x >= -68 && x <= 68;
  }

  private resolveActiveDesaPickupBoxes(pos: { x: number; z: number }, radius: number): void {
    if (pos.z < 119 || pos.z > 144 || pos.x < -16 || pos.x > 0) return;
    if (!this.starterWeaponPicked && this.starterPickupMesh.visible) {
      this._desaPickupBoxes[0].halfW = 0.78;
      this._desaPickupBoxes[0].halfD = 0.78;
    } else {
      this._desaPickupBoxes[0].halfW = -10;
      this._desaPickupBoxes[0].halfD = -10;
    }
    if (!this.swimSuitPicked && this.swimSuitPickupMesh.visible) {
      this._desaPickupBoxes[1].halfW = 0.78;
      this._desaPickupBoxes[1].halfD = 0.78;
    } else {
      this._desaPickupBoxes[1].halfW = -10;
      this._desaPickupBoxes[1].halfD = -10;
    }
    if (this._desaPickupBoxes[0].halfW > 0 || this._desaPickupBoxes[1].halfW > 0) {
      resolveObstacleBoxes(pos, radius, this._desaPickupBoxes);
    }
  }

  private pushCircle2d(
    pos: { x: number; z: number },
    ex: number,
    ez: number,
    minD: number,
    scale = 1.0,
  ): void {
    const dx = pos.x - ex;
    if (dx > minD || dx < -minD) return;
    const dz = pos.z - ez;
    if (dz > minD || dz < -minD) return;
    const dSq = dx * dx + dz * dz;
    if (dSq >= minD * minD) return;
    if (dSq > 0.0001) {
      const d = Math.sqrt(dSq);
      const push = (minD - d) * scale;
      pos.x += (dx / d) * push;
      pos.z += (dz / d) * push;
    } else {
      pos.z += minD * scale;
    }
  }

  private resolveDesaLivingSeparation(
    pos: { x: number; z: number },
    selfRad: number,
    groundY: number,
    selfMonster?: RoamingMonster,
    selfShooter?: EnemyShooter,
    selfNpcId?: string,
    skipHero = false,
    heroMinDistOverride?: number,
  ): void {
    for (let i = 0; i < this.monsters.length; i++) {
      const om = this.monsters[i];
      if (!om.alive || om === selfMonster || om.isSkyMonster || om.isSeaMonster) continue;
      if (!this.isInDesaSapaanArea(om.x, om.z)) continue;
      const oRad = 0.78 * MONSTER_SPECS[om.type].baseScale;
      this.pushCircle2d(pos, om.x, om.z, selfRad + oRad, 0.55);
    }
    for (let i = 0; i < this.shooters.length; i++) {
      const os = this.shooters[i];
      if (!os.alive || os === selfShooter || !this.isInDesaSapaanArea(os.x, os.z)) continue;
      this.pushCircle2d(pos, os.x, os.z, selfRad + 0.85, 0.55);
    }
    for (const [nid, npc] of this.npcs.entries()) {
      if (
        nid === selfNpcId ||
        npc.koTimer > 0 ||
        !this.isNpcOnDuty(npc.shift) ||
        !this.isInDesaSapaanArea(npc.x, npc.z)
      ) {
        continue;
      }
      this.pushCircle2d(pos, npc.x, npc.z, selfRad + 0.62, 0.85);
    }
    for (let i = 0; i < this.villageRig.villagers.length; i++) {
      const v = this.villageRig.villagers[i];
      if (!v.alive || v.isInsideHouse || v.drivingVehicleId || !this.isInDesaSapaanArea(v.x, v.z)) continue;
      this.pushCircle2d(pos, v.x, v.z, selfRad + 0.56, 0.65);
    }
    for (let i = 0; i < this.villageRig.golems.length; i++) {
      const g = this.villageRig.golems[i];
      if (!this.isInDesaSapaanArea(g.x, g.z)) continue;
      this.pushCircle2d(pos, g.x, g.z, selfRad + 1.16, 0.85);
    }
    if (
      !skipHero &&
      Math.abs(this.heroPos.y - groundY) <= 2.4 &&
      this.isInDesaSapaanArea(this.heroPos.x, this.heroPos.z)
    ) {
      this.pushCircle2d(
        pos,
        this.heroPos.x,
        this.heroPos.z,
        heroMinDistOverride ?? selfRad + 0.72,
        0.75,
      );
    }
  }

  private restoreNightMonstersFromSave(): void {
    for (const m of this.monsters) {
      if (m.mesh.parent) m.mesh.parent.remove(m.mesh);
      const clickIdx = this.overworldClickables.indexOf(m.mesh);
      if (clickIdx >= 0) this.overworldClickables.splice(clickIdx, 1);
    }
    this.monsters = [];
    for (const saved of this.restoredNightMonsters) {
      const mType: MonsterType = saved.type in MONSTER_SPECS ? saved.type : 'thorn_goblin';
      const spec = MONSTER_SPECS[mType];
      const fallback = OVERWORLD_ANCHORS.zones[saved.zoneId] ?? OVERWORLD_ANCHORS.desaSpawn;
      const sx = isWalkableArchipelago(saved.x, saved.z, 0.5) ? saved.x : fallback.x;
      const sz = isWalkableArchipelago(saved.x, saved.z, 0.5) ? saved.z : fallback.z;
      const baseGroundY = getArchipelagoGroundY(sx, sz);
      const sy = saved.y ?? baseGroundY + spec.hoverY;
      const isCombat = saved.combatOnly ?? true;
      const mesh = createMonsterMesh(mType, this.palette);
      mesh.position.set(sx, sy, sz);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.85 * spec.baseScale, 1.15 * spec.baseScale, 20),
        new THREE.MeshBasicMaterial({
          color: isCombat ? 0xef4444 : 0xa855f7,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.78,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.06 - spec.hoverY;
      mesh.add(ring);
      mesh.userData.combatRing = ring;
      mesh.userData.monsterId = saved.id;
      this.overworldGroup.add(mesh);
      this.overworldClickables.push(mesh);

      const wordIds =
        !isCombat
          ? saved.wordIds && saved.wordIds.length > 0
            ? saved.wordIds
            : this.pickZoneChallengeWords(saved.zoneId, 4)
          : undefined;

      this.monsters.push({
        id: saved.id,
        type: mType,
        name: saved.name || spec.name,
        zoneId: saved.zoneId,
        homeX: sx,
        homeZ: sz,
        x: sx,
        y: sy,
        z: sz,
        maxHp: saved.maxHp ?? spec.quizHp,
        mobHp: saved.mobHp ?? spec.hitHp,
        maxMobHp: saved.maxMobHp ?? spec.hitHp,
        stanceHp: !isCombat ? (saved.stanceHp ?? spec.stanceHp) : undefined,
        rewardXp: saved.rewardXp ?? spec.rewardXp,
        rewardDiamonds: saved.rewardDiamonds ?? spec.rewardDiamonds,
        rewardScore: saved.rewardScore ?? spec.rewardScore,
        combatOnly: isCombat,
        isNightMonster: saved.isNightMonster ?? this.surfaceWaveMode === 'night',
        wordIds,
        aggroActive: false,
        attackCooldown: 0.9 + Math.random() * 0.9,
        windupTimer: -1,
        lungeTimer: 0,
        hitFlashTimer: 0,
        mesh,
        alive: true,
        respawnTimer: 0,
        patrolPhase: Math.random() * Math.PI * 2,
        angryTimer: 0,
      });
    }
    this.rebuildOverworldMonsterPool();
  }

  private spawnNightSurfaceWave(): void {
    this.spawnOverworldSurfaceWave('night');
  }

  private isOverworldChallengeNoRespawn(): boolean {
    return this.worldMode === 'overworld' && (this.missionWaveCount > 0 || this.nightWaveTotal > 0);
  }

  private hasAliveChallengeMonsters(): boolean {
    return (
      this.monsters.some((m) => m.alive) ||
      this.seaMonsters.some((m) => m.alive) ||
      this.skyMonsters.some((m) => m.alive)
    );
  }

  public getWaveMissionState(): WaveMissionState | null {
    const surfaceTotal = this.missionWaveCount || this.nightWaveTotal;
    if (surfaceTotal <= 0) return null;
    const total = surfaceTotal + this.seaMonsters.length + this.skyMonsters.length;
    const remaining =
      this.monsters.filter((m) => m.alive).length +
      this.seaMonsters.filter((m) => m.alive).length +
      this.skyMonsters.filter((m) => m.alive).length;
    const defeated = Math.max(0, total - remaining);
    const baseEntries: Array<{ type: MonsterType; combatOnly: boolean }> =
      this.missionWaveSummary.length > 0
        ? this.missionWaveSummary.flatMap((g) => {
            const arr: Array<{ type: MonsterType; combatOnly: boolean }> = [];
            for (let i = 0; i < g.combatCount; i++) arr.push({ type: g.type, combatOnly: true });
            for (let i = 0; i < g.quizCount; i++) arr.push({ type: g.type, combatOnly: false });
            return arr;
          })
        : this.monsters.map((m) => ({ type: m.type, combatOnly: Boolean(m.combatOnly) }));
    const summary = summarizeWaveMonsters([
      ...baseEntries,
      ...this.seaMonsters.map((m) => ({ type: m.type, combatOnly: Boolean(m.combatOnly) })),
      ...this.skyMonsters.map((m) => ({ type: m.type, combatOnly: Boolean(m.combatOnly) })),
    ]);
    let quizTotal = 0;
    let combatTotal = 0;
    for (const g of summary) {
      quizTotal += g.quizCount;
      combatTotal += g.combatCount;
    }
    return {
      seed: this.missionWaveSeed,
      squadName: this.currentSquadName || `${this.localPlayerName || 'HOOT'} SQUAD`,
      total,
      defeated,
      remaining,
      quizTotal,
      combatTotal,
      completed: this.missionWaveCompleted || (total > 0 && remaining === 0),
      monsterGroups: summary,
    };
  }

  public startNewRandomMissionWave(
    seedInput?: number,
    countInput?: number,
    squadName?: string,
  ): WaveMissionState {
    this.spawnRandomMissionWave(seedInput, countInput, squadName);
    this.saveProgress();
    const state = this.getWaveMissionState()!;
    this.showBanner(
      `🎯 Misi Baru: Habisi ${state.total} Monster Darat, Laut & Terbang (${state.quizTotal} Kata A1 · ${state.combatTotal} Duel)!`,
      4.8,
    );
    this.pushHud(true);
    return state;
  }

  private checkMissionWaveCompletion(): void {
    if (this.missionWaveCount <= 0 || this.missionWaveCompleted) return;
    const remaining =
      this.monsters.filter((m) => m.alive).length +
      this.seaMonsters.filter((m) => m.alive).length +
      this.skyMonsters.filter((m) => m.alive).length;
    if (remaining > 0) return;

    this.missionWaveCompleted = true;
    const totalChallenge = this.missionWaveCount + this.seaMonsters.length + this.skyMonsters.length;
    this.gainXp(150);
    this.diamonds += 5;
    this.addScore(500);
    soundEngine.playFanfare();
    this.showBanner(
      `🏆 MISI SELESAI! Seluruh ${totalChallenge}/${totalChallenge} monster darat, laut & terbang berhasil dihabisi! +150 XP · +5 💎 · +500 Skor!`,
      6.0,
    );
    this.saveProgress();
    if (this.multiplayerActive && this.hasConnectedPeers && this.isWorldAuthority()) {
      this.emitMultiplayerPacket(this.buildWorldSyncPacket());
    }
  }

  private spawnRandomMissionWave(
    seedInput?: number,
    countInput?: number,
    squadName?: string,
  ): void {
    this.clearOverworldNightMonsters();
    this.pendingDayWaveTimer = -1;
    const wave = generateRandomSurfaceWave(seedInput, countInput);
    this.missionWaveSeed = wave.seed;
    this.missionWaveCount = wave.count;
    this.missionWaveCompleted = false;
    this.missionWaveSummary = wave.summary;
    if (squadName) {
      this.currentSquadName = squadName;
    }

    const diff = this.settings.difficulty;
    const diffHpMult = diff === 'santai' ? 0.8 : diff === 'pendekar' ? 1.25 : 1.0;
    const isNight = this.getCurrentDayPhase() === 'malam';
    this.surfaceWaveMode = isNight ? 'night' : 'day';

    for (let i = 0; i < wave.spawns.length; i++) {
      const template = wave.spawns[i];
      const spec = MONSTER_SPECS[template.type];
      const safe = this.resolveSafeOverworldMonsterSpot(template.x, template.z);
      const sx = safe.x;
      const sz = safe.z;
      const groundY = getArchipelagoGroundY(sx, sz);
      const sy = groundY + spec.hoverY;

      const mesh = createMonsterMesh(template.type, this.palette);
      mesh.position.set(sx, sy, sz);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.85 * spec.baseScale, 1.15 * spec.baseScale, 20),
        new THREE.MeshBasicMaterial({
          color: template.combatOnly ? 0xef4444 : 0xa855f7,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.78,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.06 - spec.hoverY;
      mesh.add(ring);
      mesh.userData.combatRing = ring;

      this.nightMonsterSeq += 1;
      const mId = `wave_${wave.seed}_${this.nightMonsterSeq}`;
      mesh.userData.monsterId = mId;
      this.overworldGroup.add(mesh);
      this.overworldClickables.push(mesh);

      const maxMobHp = Math.max(2, Math.round(spec.hitHp * diffHpMult));
      const wordIds = template.combatOnly
        ? undefined
        : this.pickZoneChallengeWords(template.zoneId, spec.tier === 'giant' ? 5 : 4);

      this.monsters.push({
        id: mId,
        type: template.type,
        name: template.name,
        zoneId: template.zoneId,
        homeX: sx,
        homeZ: sz,
        x: sx,
        y: sy,
        z: sz,
        maxHp: spec.quizHp,
        mobHp: maxMobHp,
        maxMobHp,
        stanceHp: template.combatOnly ? undefined : spec.stanceHp,
        rewardXp: spec.rewardXp + (diff === 'pendekar' ? 5 : 0),
        rewardDiamonds: spec.rewardDiamonds,
        rewardScore: spec.rewardScore,
        combatOnly: template.combatOnly,
        isNightMonster: isNight,
        wordIds,
        aggroActive: false,
        attackCooldown: 0.9 + Math.random() * 0.9,
        windupTimer: -1,
        lungeTimer: 0,
        hitFlashTimer: 0,
        mesh,
        alive: true,
        respawnTimer: 0,
        patrolPhase: Math.random() * Math.PI * 2,
        angryTimer: 0,
      });
    }

    this.nightWaveDaySpawned = this.dayCount;
    this.dayWaveDaySpawned = this.dayCount;
    this.restoredDefeatedSeaSkyIds.clear();
    this.initSeaMonsters();
    this.initSkyMonsters();
    this.syncShootersForDifficulty(true);
    const zoneTotals: Partial<Record<ZoneId, number>> = {};
    for (const pool of [this.monsters, this.seaMonsters, this.skyMonsters]) {
      for (const m of pool) {
        if (m.alive) {
          zoneTotals[m.zoneId] = (zoneTotals[m.zoneId] || 0) + 1;
        }
      }
    }
    this.nightZoneTotals = zoneTotals;
    this.nightWaveTotal = wave.count;
    this.rebuildOverworldMonsterPool();
    if (this.multiplayerActive && this.hasConnectedPeers && this.isWorldAuthority()) {
      this.emitMultiplayerPacket(this.buildWorldSyncPacket());
    }
    this.pushHud(true);
  }

  private spawnOverworldSurfaceWave(mode: 'day' | 'night'): void {
    this.clearOverworldNightMonsters();
    this.pendingDayWaveTimer = -1;
    this.surfaceWaveMode = mode;

    const templates = mode === 'night' ? NIGHT_SURFACE_SPAWNS : DAY_SURFACE_SPAWNS;
    const diff = this.settings.difficulty;
    const diffHpMult = diff === 'santai' ? 0.8 : diff === 'pendekar' ? 1.25 : 1.0;

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const spec = MONSTER_SPECS[template.type];
      const jitterX = template.x + (Math.random() - 0.5) * 4.2;
      const jitterZ = template.z + (Math.random() - 0.5) * 4.2;
      const safe = this.resolveSafeOverworldMonsterSpot(jitterX, jitterZ);
      const sx = safe.x;
      const sz = safe.z;
      const groundY = getArchipelagoGroundY(sx, sz);
      const sy = groundY + spec.hoverY;

      const mesh = createMonsterMesh(template.type, this.palette);
      mesh.position.set(sx, sy, sz);

      // Cincin aura di kaki: Merah (70% Duel Fisik) vs Ungu (30% Tantangan Bahasa Inggris)
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.85 * spec.baseScale, 1.15 * spec.baseScale, 20),
        new THREE.MeshBasicMaterial({
          color: template.combatOnly ? 0xef4444 : 0xa855f7,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.78,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.06 - spec.hoverY;
      mesh.add(ring);
      mesh.userData.combatRing = ring;

      this.nightMonsterSeq += 1;
      const mId = `${mode}_mob_${this.dayCount}_${this.nightMonsterSeq}`;
      mesh.userData.monsterId = mId;
      this.overworldGroup.add(mesh);
      this.overworldClickables.push(mesh);

      const maxMobHp = Math.max(2, Math.round(spec.hitHp * diffHpMult));
      const wordIds = template.combatOnly
        ? undefined
        : this.pickZoneChallengeWords(template.zoneId, spec.tier === 'giant' ? 5 : 4);

      this.monsters.push({
        id: mId,
        type: template.type,
        name: template.name,
        zoneId: template.zoneId,
        homeX: sx,
        homeZ: sz,
        x: sx,
        y: sy,
        z: sz,
        maxHp: spec.quizHp,
        mobHp: maxMobHp,
        maxMobHp,
        stanceHp: template.combatOnly ? undefined : spec.stanceHp,
        rewardXp: spec.rewardXp + (diff === 'pendekar' ? 5 : 0),
        rewardDiamonds: spec.rewardDiamonds,
        rewardScore: spec.rewardScore,
        combatOnly: template.combatOnly,
        isNightMonster: mode === 'night',
        wordIds,
        aggroActive: false,
        attackCooldown: 0.9 + Math.random() * 0.9,
        windupTimer: -1,
        lungeTimer: 0,
        hitFlashTimer: 0,
        mesh,
        alive: true,
        respawnTimer: 0,
        patrolPhase: Math.random() * Math.PI * 2,
        angryTimer: 0,
      });
    }

    if (mode === 'night') {
      this.nightWaveDaySpawned = this.dayCount;
    } else {
      this.dayWaveDaySpawned = this.dayCount;
    }
    this.restoredDefeatedSeaSkyIds.clear();
    this.initSeaMonsters();
    this.initSkyMonsters();
    this.syncShootersForDifficulty(mode === 'night');
    const zoneTotals: Partial<Record<ZoneId, number>> = {};
    for (const pool of [this.monsters, this.seaMonsters, this.skyMonsters]) {
      for (const m of pool) {
        if (m.alive) {
          zoneTotals[m.zoneId] = (zoneTotals[m.zoneId] || 0) + 1;
        }
      }
    }
    this.nightZoneTotals = zoneTotals;
    this.nightWaveTotal = this.monsters.filter((m) => m.alive).length;
    const totalAllPools =
      this.nightWaveTotal + this.seaMonsters.length + this.skyMonsters.length;
    this.rebuildOverworldMonsterPool();
    if (this.worldMode === 'overworld') {
      if (mode === 'night') {
        soundEngine.playBoss();
        this.showBanner(
          `🌙 Malam Hari ke-${this.dayCount}! ${totalAllPools} monster darat, laut & terbang muncul di seluruh kepulauan!`,
          5.0,
        );
      } else {
        this.showBanner(
          `☀️ Hari ke-${this.dayCount}! ${totalAllPools} monster darat, laut & terbang berkeliaran di 6 pulau & selat!`,
          4.5,
        );
      }
    }
    if (this.multiplayerActive && this.hasConnectedPeers && this.isWorldAuthority()) {
      this.emitMultiplayerPacket(this.buildWorldSyncPacket());
    }
    this.pushHud(true);
  }

  private triggerMorningSunlightDestruction(): void {
    if (
      this.missionWaveCount > 0 &&
      !this.missionWaveCompleted &&
      this.hasAliveChallengeMonsters()
    ) {
      return;
    }
    let anyDoomed = false;
    for (const m of this.monsters) {
      if (!m.alive || !m.isNightMonster || m.sunburnTimer !== undefined) continue;
      m.sunburnTimer = 0.25 + Math.random() * 1.1;
      anyDoomed = true;
    }
    for (const s of this.shooters) {
      if (!s.alive || !s.isNightShooter || s.sunburnTimer !== undefined) continue;
      s.sunburnTimer = 0.2 + Math.random() * 0.9;
      anyDoomed = true;
    }
    this.pendingDayWaveTimer = 2.1;
    if (anyDoomed && this.worldMode === 'overworld') {
      this.showBanner(
        '☀️ Cahaya matahari fajar membakar monster malam! Gelombang siang (30 monster) segera muncul!',
        4.6,
      );
    }
  }

  private initProjectilePool(): void {
    const geo = new THREE.OctahedronGeometry(0.32, 0);
    for (let i = 0; i < MAX_PROJECTILES; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0x4fd8ff });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.projectiles.push({
        active: false,
        fromPlayer: true,
        x: 0,
        y: 1.35,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        damage: 1,
        shieldDamage: 1,
        pierceLeft: 0,
        hitIds: new Set(),
        life: 0,
        mesh,
      });
    }
  }

  private syncShootersForDifficulty(resetNightShooters = false): void {
    // Clear previous shooters
    for (const s of this.shooters) {
      if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
    }
    this.shooters = [];

    // Overworld uses exact 30 (day) / 50 (night) wave spawns including ranged monster types
    if (this.worldMode === 'overworld') {
      if (resetNightShooters) {
        this.nightShooterSaved = [];
      }
      return;
    }

    const maxCount = DIFF_CONFIG[this.settings.difficulty].maxShooters;
    if (maxCount <= 0) {
      return;
    }

    const coords: Array<[number, number]> =
      this.worldMode === 'dungeon'
        ? [
            [-10, -10],
            [10, -10],
          ]
        : [
            [-12, 2],
            [12, 2],
          ];

    const parent =
      this.worldMode === 'dungeon' && this.dungeonRig
        ? this.dungeonRig.group
        : this.worldMode === 'academy' && this.academyRig
        ? this.academyRig.group
        : this.overworldGroup;

    for (let i = 0; i < maxCount; i++) {
      const [sx, sz] = coords[i % coords.length];
      const mesh = createShooterMesh(this.palette);
      mesh.position.set(sx, 0, sz);
      parent.add(mesh);
      const id = `shooter_${this.worldMode}_${i}`;
      this.shooters.push({
        id,
        x: sx,
        z: sz,
        homeX: sx,
        homeZ: sz,
        hp: 3,
        cooldown: 1.5 + i * 0.7,
        phase: i * 1.4,
        walkPhase: i * 1.4,
        recoilTimer: 0,
        hitSquashTimer: 0,
        prevX: sx,
        prevZ: sz,
        mesh,
        alive: true,
        respawnTimer: 0,
        zoneId: undefined,
        isNightShooter: false,
      });
    }

    if (this.worldMode === 'dungeon' && this.dungeonState) {
      const detail = this.zoneCaveDetails[this.dungeonState.zoneId];
      if (detail && detail.defeatedEnemyIds.length > 0) {
        const defeatedSet = new Set(detail.defeatedEnemyIds);
        for (const s of this.shooters) {
          if (defeatedSet.has(s.id)) {
            s.alive = false;
            s.mesh.visible = false;
            s.respawnTimer = 0;
          }
        }
      }
    } else if (this.worldMode === 'academy' && this.defeatedAcademyEnemyIds.size > 0) {
      for (const s of this.shooters) {
        if (this.defeatedAcademyEnemyIds.has(s.id)) {
          s.alive = false;
          s.mesh.visible = false;
          s.respawnTimer = 0;
        }
      }
    }
  }

  private initDefaultQuests(): void {
    this.quests = NPC_CATALOG.map((npc) => ({
      id: `quest_${npc.id}`,
      npcId: npc.id,
      npcName: npc.name,
      zoneId: npc.zoneId as ZoneId,
      zoneName: npc.zoneName,
      title: npc.questTitle,
      type: npc.questType,
      target: npc.questTarget,
      progress: this.liberatedZones.has(npc.zoneId as ZoneId) ? 1 : 0,
      rewardXp: npc.rewardXp,
      rewardDiamonds: npc.rewardDiamonds,
      accepted: true,
      claimed: this.liberatedZones.has(npc.zoneId as ZoneId),
    }));
  }

  private spawnCollectibles(): void {
    this.collectibles = [];
    const spots: Array<[number, number, 'diamond' | 'heart']> = [
      // Desa Sapaan
      [-5.0, 91.0, 'heart'],
      [-3.0, 114.0, 'diamond'],
      [19.0, 118.0, 'diamond'],
      [-4.0, 148.0, 'heart'],
      [26.0, 94.0, 'diamond'],
      [-32.0, 134.0, 'heart'],
      [-18.0, 78.0, 'diamond'],
      [14.0, 142.0, 'heart'],
      // Central Hub Citadel & Bridges
      [-23.2, 43.3, 'diamond'],
      [-8.0, -10.0, 'diamond'],
      [0.0, -53.0, 'heart'],
      [24.0, 8.0, 'heart'],
      [-26.0, -32.0, 'diamond'],
      [28.0, -28.0, 'diamond'],
      [0.0, 18.0, 'heart'],
      // Pasar Rasa
      [-64.6, -21.0, 'diamond'],
      [-61.5, 10.8, 'diamond'],
      [-92.0, 52.0, 'diamond'],
      [-125.0, -14.0, 'diamond'],
      [-142.0, 62.0, 'heart'],
      [-104.0, 80.0, 'diamond'],
      [-146.0, 24.0, 'heart'],
      [-112.0, 16.0, 'diamond'],
      // Hutan Satwa
      [55.5, 26.25, 'diamond'],
      [83.0, 44.0, 'heart'],
      [106.0, 92.0, 'diamond'],
      [125.0, 68.5, 'heart'],
      [140.5, 42.5, 'diamond'],
      [145.5, -9.5, 'heart'],
      [112.0, 22.0, 'diamond'],
      [152.0, 74.0, 'heart'],
      // Gerbang Kota
      [-81.0, -28.0, 'diamond'],
      [-106.0, -86.0, 'diamond'],
      [-121.0, -112.0, 'diamond'],
      [-88.0, -126.0, 'heart'],
      [-152.0, -92.0, 'heart'],
      [-140.0, -138.0, 'diamond'],
      [-110.0, -58.0, 'diamond'],
      // Menara Waktu
      [115.0, -76.0, 'heart'],
      [152.0, -98.0, 'diamond'],
      [176.0, -54.0, 'diamond'],
      [128.0, -126.0, 'heart'],
      [174.0, -116.0, 'diamond'],
      [140.0, -52.0, 'heart'],
      [108.0, -68.0, 'diamond'],
      // Gua Portal & Kepulauan Laut
      [-16.2, -84.0, 'diamond'],
      [-14.0, -158.0, 'diamond'],
      [10.0, -168.0, 'diamond'],
      [20.0, -184.0, 'heart'],
      [52.0, -156.0, 'heart'],
      [-22.0, -196.0, 'diamond'],
      [48.0, -196.0, 'diamond'],
      [14.0, -214.0, 'heart'],
      [-74.0, 126.0, 'diamond'],
      [62.0, 168.0, 'heart'],
      [-164.0, -12.0, 'heart'],
    ];

    for (let i = 0; i < MAX_COLLECTIBLES; i++) {
      if (i < spots.length) {
        const cx = spots[i][0];
        const cz = spots[i][1];
        this.collectibles.push({
          active: true,
          kind: spots[i][2],
          x: cx,
          y: getArchipelagoGroundY(cx, cz),
          z: cz,
          phase: i * 0.8,
          respawnTimer: 0,
          matrixInit: false,
        });
      } else {
        this.collectibles.push({
          active: false,
          kind: 'diamond',
          x: 0,
          y: 0,
          z: 0,
          phase: i,
          respawnTimer: 0,
          matrixInit: false,
        });
      }
    }
  }

  private refreshAreaMists(): void {
    this.areaMists.forEach((mist, zId) => {
      mist.visible = !this.liberatedZones.has(zId);
    });
  }

  private refreshWeaponVisual(): void {
    const canHoldWeapon =
      this.carMode === 'none' &&
      this.planeMode === 'none' &&
      this.activeHotbarSlot <= 7 &&
      this.ownedWeapons.has(this.activeWeapon) &&
      (!this.isSwimming || this.worldMode === 'ocean' || this.isHeroUnderwater() || SEA_CAPABLE_WEAPONS.has(this.activeWeapon));
    setHeroWeaponVisual(this.hero, this.activeWeapon, canHoldWeapon);

    if (this.carMode !== 'none' || this.planeMode !== 'none') {
      setFirstPersonHeldVisual(this.fpViewRig, 'bare', this.activeWeapon, this.pickaxeTier);
    } else if (this.isSwimming) {
      setFirstPersonHeldVisual(
        this.fpViewRig,
        canHoldWeapon ? 'weapon' : 'bare',
        this.activeWeapon,
        this.pickaxeTier,
      );
    } else if (this.activeHotbarSlot === 8) {
      setFirstPersonHeldVisual(this.fpViewRig, 'pickaxe', this.activeWeapon, this.pickaxeTier);
    } else if (this.activeHotbarSlot === 9) {
      setFirstPersonHeldVisual(this.fpViewRig, 'torch', this.activeWeapon, this.pickaxeTier);
    } else if (this.activeHotbarSlot === 10) {
      setFirstPersonHeldVisual(this.fpViewRig, 'shield_block', this.activeWeapon, this.pickaxeTier);
    } else if (this.activeHotbarSlot === 11) {
      setFirstPersonHeldVisual(this.fpViewRig, 'tnt', this.activeWeapon, this.pickaxeTier);
    } else if (canHoldWeapon) {
      setFirstPersonHeldVisual(this.fpViewRig, 'weapon', this.activeWeapon, this.pickaxeTier);
    } else {
      setFirstPersonHeldVisual(this.fpViewRig, 'bare', this.activeWeapon, this.pickaxeTier);
    }

    this.starterPickupMesh.visible = !this.starterWeaponPicked;
    this.swimSuitPickupMesh.visible = !this.swimSuitPicked;
  }

  public selectHotbarSlot(slotIndex: number): void {
    this.lastInputActivityMs = performance.now();
    const idx = Math.max(0, Math.min(11, Math.floor(slotIndex)));
    this.activeHotbarSlot = idx;
    this.pendingTurnShot = null;
    if (idx <= 7) {
      const wId = WEAPON_ORDER[idx];
      if (wId && this.ownedWeapons.has(wId)) {
        this.activeWeapon = wId;
      }
    } else {
      this.shootAimTimer = 0;
      this.shootAimYaw = null;
      this.shootAimPitch = 0;
      this.shootAimTargetId = null;
      this.shootTargetPos = null;
    }
    this.fpSwingTimer = 0.16;
    this.refreshWeaponVisual();
    soundEngine.playPick();
    this.saveProgress();
    this.pushHud(true);
  }

  private applyCameraVisibilityAndControls(): void {
    const isPlaying = this.phase === 'playing';
    const inFirstPerson = isPlaying && this.cameraMode === 'first_person';
    this.hero.body.visible = !inFirstPerson;
    this.fpViewRig.root.visible = inFirstPerson && this.carMode === 'none' && this.planeMode === 'none';
    this.controls.enabled = isPlaying && this.cameraMode === 'orbit';
  }

  private rayIntersectAabbDist(
    ox: number,
    oy: number,
    oz: number,
    dx: number,
    dy: number,
    dz: number,
    maxDist: number,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    minZ: number,
    maxZ: number,
  ): number | null {
    let tMin = 0.05;
    let tMax = maxDist;
    const checkAxis = (o: number, d: number, mn: number, mx: number): boolean => {
      if (Math.abs(d) < 1e-6) {
        return o >= mn && o <= mx;
      }
      let t1 = (mn - o) / d;
      let t2 = (mx - o) / d;
      if (t1 > t2) {
        const tmp = t1;
        t1 = t2;
        t2 = tmp;
      }
      tMin = Math.max(tMin, t1);
      tMax = Math.min(tMax, t2);
      return tMin <= tMax;
    };
    if (!checkAxis(ox, dx, minX, maxX)) return null;
    if (!checkAxis(oy, dy, minY, maxY)) return null;
    if (!checkAxis(oz, dz, minZ, maxZ)) return null;
    return tMin <= maxDist ? tMin : null;
  }

  private computeSpringArmDist(
    originX: number,
    originY: number,
    originZ: number,
    dirX: number,
    dirY: number,
    dirZ: number,
    desiredDist: number,
  ): number {
    let safeDist = desiredDist;

    let minCamY = 0.78;
    if (this.worldMode === 'overworld') {
      for (const frac of [0.55, 0.85, 1.0]) {
        const sx = originX + dirX * safeDist * frac;
        const sz = originZ + dirZ * safeDist * frac;
        const tSamp = sampleArchipelagoTerrain(sx, sz);
        if (tSamp.isLandOrBridge) {
          minCamY = Math.max(minCamY, tSamp.groundY + 0.85);
        }
      }
    }
    if (dirY < -0.01 && originY + dirY * safeDist < minCamY) {
      safeDist = Math.min(safeDist, Math.max(1.2, (minCamY - originY) / dirY));
    }

    if (this.worldMode === 'dungeon' && this.dungeonRig) {
      // Keep camera cleanly below cavern ceiling (9.8)
      const maxCamY = 8.95;
      if (dirY > 0.01 && originY + dirY * safeDist > maxCamY) {
        safeDist = Math.min(safeDist, Math.max(1.2, (maxCamY - originY) / dirY));
      }

      this.camOccluderScratch.length = 0;
      for (const obj of this.dungeonRig.cameraOccluders) {
        this.camOccluderScratch.push(obj);
      }
      for (const blk of this.dungeonRig.caveBlocks) {
        if (blk.alive) this.camOccluderScratch.push(blk.mesh);
      }
      if (this.dungeonRig.prisonBars.visible) {
        this.camOccluderScratch.push(this.dungeonRig.prisonBars);
      }

      _v1.set(originX, originY, originZ);
      _v2.set(dirX, dirY, dirZ).normalize();
      this.camRaycaster.near = 0.15;
      this.camRaycaster.far = safeDist + 0.55;
      this.camRaycaster.set(_v1, _v2);

      const hits = this.camRaycaster.intersectObjects(this.camOccluderScratch, true);
      if (hits.length > 0) {
        safeDist = Math.min(safeDist, Math.max(1.15, hits[0].distance - 0.52));
      }
    } else if (this.worldMode === 'ocean' && this.oceanRig) {
      if (dirY > 0.01 && originY + dirY * safeDist > -0.35) {
        safeDist = Math.min(safeDist, Math.max(1.2, (-0.35 - originY) / dirY));
      }
      for (const frac of [0.5, 0.78, 1.0]) {
        const sx = originX + dirX * safeDist * frac;
        const sz = originZ + dirZ * safeDist * frac;
        const seabedCamY = getOceanFloorY(sx, sz) + 0.72;
        if (originY + dirY * safeDist * frac < seabedCamY) {
          if (dirY < -0.01) {
            safeDist = Math.min(safeDist, Math.max(1.25, (seabedCamY - originY) / (dirY * frac)));
          }
        }
      }
      for (const col of this.oceanRig.colliders) {
        if (col.isSphere && col.radius !== undefined) {
          const hit = this.rayIntersectAabbDist(
            originX,
            originY,
            originZ,
            dirX,
            dirY,
            dirZ,
            safeDist + 0.45,
            col.x - col.radius,
            col.x + col.radius,
            col.minY,
            col.maxY,
            col.z - col.radius,
            col.z + col.radius,
          );
          if (hit !== null) safeDist = Math.min(safeDist, Math.max(1.25, hit - 0.48));
        } else if (!col.rotY) {
          const hit = this.rayIntersectAabbDist(
            originX,
            originY,
            originZ,
            dirX,
            dirY,
            dirZ,
            safeDist + 0.45,
            col.x - col.halfW,
            col.x + col.halfW,
            col.minY,
            col.maxY,
            col.z - col.halfD,
            col.z + col.halfD,
          );
          if (hit !== null) safeDist = Math.min(safeDist, Math.max(1.25, hit - 0.48));
        }
      }
    } else if (this.worldMode === 'academy' && this.academyRig) {
      _v1.set(originX, originY, originZ);
      _v2.set(dirX, dirY, dirZ).normalize();
      this.camRaycaster.near = 0.15;
      this.camRaycaster.far = safeDist + 0.55;
      this.camRaycaster.set(_v1, _v2);
      const hits = this.camRaycaster.intersectObjects(this.academyRig.cameraOccluders, true);
      if (hits.length > 0) {
        safeDist = Math.min(safeDist, Math.max(1.2, hits[0].distance - 0.52));
      }
    } else if (this.worldMode === 'overworld') {
      // Keep camera cleanly under Gerbang Kota 14m x 12m tunnel ceiling (y=24m) when inside the tunnel bore
      if (
        originX >= -172.5 &&
        originX <= -137.5 &&
        originZ >= -93.5 &&
        originZ <= -78.5 &&
        originY < 21.5
      ) {
        const tunnelMaxCamY = 22.6;
        if (dirY > 0.01 && originY + dirY * safeDist > tunnelMaxCamY) {
          safeDist = Math.min(safeDist, Math.max(1.8, (tunnelMaxCamY - originY) / dirY));
        }
      }
      for (const obs of this.villageRig.obstacles) {
        if (obs.halfW < 1.25 && obs.halfD < 1.25) continue;
        const baseY = getArchipelagoGroundY(obs.x, obs.z);
        const h = baseY + (obs.halfW >= 2.4 ? 7.2 : 4.2);
        const hit = this.rayIntersectAabbDist(
          originX,
          originY,
          originZ,
          dirX,
          dirY,
          dirZ,
          safeDist + 0.5,
          obs.x - obs.halfW,
          obs.x + obs.halfW,
          baseY,
          h,
          obs.z - obs.halfD,
          obs.z + obs.halfD,
        );
        if (hit !== null) {
          safeDist = Math.min(safeDist, Math.max(1.25, hit - 0.5));
        }
      }
      // Portal Arch stone pillars at Gua Portal north edge
      const px = OVERWORLD_ANCHORS.portal.x;
      const pz = OVERWORLD_ANCHORS.portal.z;
      const py = getArchipelagoGroundY(px, pz);
      const portalPillars = [px - 3.9, px + 3.9];
      for (const pillarX of portalPillars) {
        const hit = this.rayIntersectAabbDist(
          originX,
          originY,
          originZ,
          dirX,
          dirY,
          dirZ,
          safeDist + 0.5,
          pillarX - 1.15,
          pillarX + 1.15,
          py,
          py + 7.6,
          pz - 1.2,
          pz + 1.2,
        );
        if (hit !== null) {
          safeDist = Math.min(safeDist, Math.max(1.25, hit - 0.5));
        }
      }
    }

    return safeDist;
  }

  private snapCameraBehindHero(): void {
    this.cameraYaw = 0;
    this.cameraPitch = 0.22;
    const sinY = Math.sin(this.cameraYaw);
    const cosY = Math.cos(this.cameraYaw);
    const cosP = Math.cos(this.cameraPitch);
    const sinP = Math.sin(this.cameraPitch);
    const targetY = this.heroPos.y + 1.92;
    const baseDist =
      this.worldMode === 'dungeon' ? Math.min(this.thirdPersonDist, 6.2) : this.thirdPersonDist;
    const dirX = sinY * cosP;
    const dirY = sinP;
    const dirZ = cosY * cosP;
    const safeDist = this.computeSpringArmDist(
      this.heroPos.x,
      targetY,
      this.heroPos.z,
      dirX,
      dirY,
      dirZ,
      baseDist,
    );
    this.currentCamDist = safeDist;
    this.camera.position.set(
      this.heroPos.x + dirX * safeDist,
      targetY + dirY * safeDist,
      this.heroPos.z + dirZ * safeDist,
    );
    this.controls.target.set(this.heroPos.x, targetY, this.heroPos.z);
    this.camera.lookAt(this.heroPos.x, targetY, this.heroPos.z);
  }

  public continueGame(options?: { silent?: boolean; targetPhase?: GamePhase }): void {
    const silent = Boolean(options?.silent);
    const targetPhase = options?.targetPhase;
    if (!this.loadProgress()) {
      this.startNewGame();
      return;
    }
    this.clearSubScenes();
    this.clearVillageAmbushRig();
    this.resetCarToParked();
    this.resetPlanesToParked(false);
    this.worldMode = 'overworld';
    this.overworldGroup.visible = true;
    this.phase = 'playing';
    this.storyDialog = null;
    this.owlRig.root.visible = false;
    this.owlState = 'hidden';

    const eqIdx = WEAPON_ORDER.indexOf(this.activeWeapon);
    this.activeHotbarSlot = eqIdx >= 0 ? eqIdx : 0;

    this.initDefaultQuests();
    this.spawnCollectibles();
    if (this.restoredCollectibles && this.restoredCollectibles.length === this.collectibles.length) {
      for (let i = 0; i < this.collectibles.length; i++) {
        this.collectibles[i].active = this.restoredCollectibles[i].active;
        this.collectibles[i].respawnTimer = this.restoredCollectibles[i].respawnTimer;
        this.collectibles[i].matrixInit = false;
      }
    }
    this.refreshAreaMists();
    this.refreshWeaponVisual();

    const hasSavedWaveMission =
      this.missionWaveCount > 0 &&
      !this.missionWaveCompleted &&
      this.restoredNightMonsters.length > 0;
    const curPhase = this.getCurrentDayPhase();
    const canRestoreNight =
      curPhase === 'malam' &&
      this.surfaceWaveMode === 'night' &&
      this.nightWaveDaySpawned === this.dayCount &&
      this.restoredNightMonsters.length > 0;
    const canRestoreDay =
      curPhase !== 'malam' &&
      this.surfaceWaveMode === 'day' &&
      this.dayWaveDaySpawned === this.dayCount &&
      this.restoredNightMonsters.length > 0;
    if (hasSavedWaveMission || canRestoreNight || canRestoreDay) {
      this.restoreNightMonstersFromSave();
    } else {
      this.clearOverworldNightMonsters();
    }

    this.updateOverworldDayNightAtmosphere(0, false);

    if (this.restoredWorldMode === 'dungeon' && this.restoredDungeonZoneId) {
      this.enterZoneDungeon(this.restoredDungeonZoneId, this.restoredDungeonMixed, true);
      if (targetPhase === 'gameover') {
        this.hp = 0;
        this.setPhase('gameover');
      } else if (targetPhase === 'paused') {
        this.setPhase('paused');
      } else if (!silent) {
        this.showBanner('Selamat datang kembali, Hoot! Lanjutkan petualanganmu di gua!', 3.6);
        soundEngine.playWin();
      }
      this.pushHud(true);
      return;
    }

    if (this.restoredWorldMode === 'academy' && !IELTS_TEMPORARILY_LOCKED) {
      this.enterAcademy(true);
      if (targetPhase === 'gameover') {
        this.hp = 0;
        this.setPhase('gameover');
      } else if (targetPhase === 'paused') {
        this.setPhase('paused');
      } else if (!silent) {
        this.showBanner('Selamat datang kembali, Hoot! Lanjutkan di Istana IELTS!', 3.6);
        soundEngine.playWin();
      }
      this.pushHud(true);
      return;
    }

    if (this.archipelagoUnderwaterRig) {
      for (const ch of this.archipelagoUnderwaterRig.chests) {
        const opened = this.openedOceanChests.has(ch.id);
        ch.opened = opened;
        ch.lid.rotation.x = opened ? -1.25 : 0;
        ch.beacon.visible = !opened;
      }
    }

    this.syncShootersForDifficulty();
    this.syncOverworldMonstersByDiff();
    this.initSeaMonsters();
    this.initSkyMonsters();
    if (
      (hasSavedWaveMission || canRestoreNight || canRestoreDay) &&
      this.restoredDefeatedSeaSkyIds.size > 0
    ) {
      for (const pool of [this.seaMonsters, this.skyMonsters]) {
        for (const m of pool) {
          if (!this.restoredDefeatedSeaSkyIds.has(m.id)) continue;
          m.alive = false;
          m.respawnTimer = 0;
          m.mesh.visible = false;
        }
      }
    }
    this.restoredDefeatedSeaSkyIds.clear();

    const sp = OVERWORLD_ANCHORS.desaSpawn;
    let restoredInWater = false;
    if (this.restoredWorldMode === 'ocean') {
      const diveY = Math.max(getArchipelagoSeabedY(-18, 192) + 0.8, -4.4);
      this.heroPos.set(-18, diveY, 192);
      this.heroYaw = Math.PI;
      this.heroDiveActive = true;
      this.isSwimming = true;
      this.heroOnGround = false;
      restoredInWater = true;
      if (!silent) {
        this.showBanner('🐠 Selamat datang kembali di Dunia Bawah Laut Kepulauan!', 3.6);
      }
    } else if (this.restoredHeroPos && this.restoredWorldMode === 'overworld') {
      const rx = this.restoredHeroPos.x;
      const rz = this.restoredHeroPos.z;
      if (isWalkableArchipelago(rx, rz)) {
        const hy = getArchipelagoGroundY(rx, rz);
        this.heroPos.set(rx, hy, rz);
        this.heroYaw = this.restoredHeroPos.yaw;
        this.heroDiveActive = false;
        this.isSwimming = false;
        this.heroOnGround = true;
      } else {
        const minSeabed = getArchipelagoSeabedY(rx, rz) + 0.45;
        const ry = THREE.MathUtils.clamp(this.restoredHeroPos.y, minSeabed, -1.16);
        this.heroPos.set(rx, ry, rz);
        this.heroYaw = this.restoredHeroPos.yaw;
        this.isSwimming = true;
        this.heroDiveActive = ry < -1.65;
        this.heroOnGround = false;
        restoredInWater = true;
      }
    } else if (isWalkableArchipelago(this.savedOverworldHeroPos.x, this.savedOverworldHeroPos.z)) {
      const hy = getArchipelagoGroundY(this.savedOverworldHeroPos.x, this.savedOverworldHeroPos.z);
      this.heroPos.set(this.savedOverworldHeroPos.x, hy, this.savedOverworldHeroPos.z);
      this.heroYaw = sp.yaw;
      this.heroDiveActive = false;
    } else {
      this.heroPos.set(sp.x, getArchipelagoGroundY(sp.x, sp.z), sp.z);
      this.heroYaw = sp.yaw;
      this.heroDiveActive = false;
    }
    this.oceanOxygen = this.getOceanMaxOxygen();
    if (!restoredInWater) {
      this.savedOverworldHeroPos.copy(this.heroPos);
    }
    this.hero.root.position.copy(this.heroPos);
    this.hero.body.rotation.y = this.heroYaw;
    this.heroVel.set(0, 0, 0);
    this.heroVelY = 0;
    this.heroOnGround = !restoredInWater;
    this.isSwimming = restoredInWater;
    this.refreshWeaponVisual();
    this.tapMoveTarget = null;
    this.encounterGraceTimer = 2.0;

    if (this.cameraMode === 'orbit') this.cameraMode = 'third_back';
    if (targetPhase === 'gameover') {
      this.hp = 0;
      this.setPhase('gameover');
    } else if (targetPhase === 'paused') {
      this.setPhase('paused');
    } else {
      this.applyCameraVisibilityAndControls();
    }
    this.snapCameraBehindHero();

    if (!silent) {
      this.showBanner(
        this.restoredWorldMode === 'academy' && IELTS_TEMPORARILY_LOCKED
          ? '🔒 Istana IELTS ditutup sementara — selamat datang kembali di Desa Sapaan!'
          : 'Selamat datang kembali, Hoot! Lanjutkan petualanganmu!',
        3.8,
      );
      soundEngine.playWin();
    }
    this.pushHud(true);
  }

  public setLocalAppearance(characterId: CharacterPresetId, displayName?: string): void {
    this.localCharacterId = characterId;
    if (displayName && displayName.trim().length > 0) {
      this.localPlayerName = displayName.trim().slice(0, 24);
    }
    applyHeroAppearance(this.hero, getCharacterPreset(characterId).colors, characterId);
  }

  public setMultiplayerActive(active: boolean, localUid?: string): void {
    this.multiplayerActive = active;
    if (typeof localUid === 'string') {
      this.localMultiplayerUid = localUid;
    }
    if (!active) {
      for (const peer of this.remotePeers.values()) {
        this.scene.remove(peer.rig.root);
      }
      this.remotePeers.clear();
      for (const fx of this.departingPeerEffects) {
        this.scene.remove(fx.rig.root);
      }
      this.departingPeerEffects = [];
      this.peerMonsterTargets.clear();
      this.monsterDamageContributors.clear();
      this.nearbyInjuredPeer = null;
      this.allyHelpCooldown = 0;
      this.isMultiplayerHost = true;
      this.hasConnectedPeers = false;
      this.awaitingRejoinWorldSync = false;
      this.rejoinSyncDeadlineMs = 0;
      this.localMultiplayerUid = '';
    }
  }

  public setMultiplayerRole(isHost: boolean, hasPeers: boolean): void {
    const promotedToHost = this.multiplayerActive && !this.isMultiplayerHost && isHost;
    this.isMultiplayerHost = isHost;
    this.hasConnectedPeers = hasPeers;
    if (promotedToHost) {
      this.awaitingRejoinWorldSync = false;
      this.rejoinSyncDeadlineMs = 0;
      if (hasPeers) {
        this.emitMultiplayerPacket(this.buildWorldSyncPacket());
      }
    }
  }

  public setAwaitingRejoinSync(waiting: boolean): void {
    this.awaitingRejoinWorldSync = waiting;
    this.rejoinSyncDeadlineMs = waiting ? Date.now() + 15_000 : 0;
  }

  public isAwaitingRejoinSync(): boolean {
    if (!this.awaitingRejoinWorldSync) return false;
    if (Date.now() > this.rejoinSyncDeadlineMs) {
      this.awaitingRejoinWorldSync = false;
      this.rejoinSyncDeadlineMs = 0;
      return false;
    }
    return true;
  }

  private isWorldAuthority(): boolean {
    return !this.multiplayerActive || this.isMultiplayerHost;
  }

  public isMultiplayerWorldHost(): boolean {
    return this.multiplayerActive && this.isMultiplayerHost && !this.isAwaitingRejoinSync();
  }

  private emitMultiplayerPacket(pkt: P2pReliableMessage, targetUid?: string): void {
    if (!this.multiplayerActive) return;
    this.callbacks.onMultiplayerPacket?.(pkt, targetUid);
  }

  private emitProgressSync(): void {
    if (!this.multiplayerActive || !this.hasConnectedPeers) return;
    this.emitMultiplayerPacket(this.buildProgressSyncPacket());
  }

  public buildProgressSyncPacket(): P2pReliableMessage {
    return {
      t: 'prog',
      lz: Array.from(this.liberatedZones),
      dbz: Array.from(this.defeatedBossZones),
      dc: {
        desa_sapaan: [...(this.areaDoorsCleared.desa_sapaan || [])],
        pasar_rasa: [...(this.areaDoorsCleared.pasar_rasa || [])],
        hutan_satwa: [...(this.areaDoorsCleared.hutan_satwa || [])],
        gerbang_kota: [...(this.areaDoorsCleared.gerbang_kota || [])],
        menara_waktu: [...(this.areaDoorsCleared.menara_waktu || [])],
        gua_portal: [...(this.areaDoorsCleared.gua_portal || [])],
      },
    };
  }

  private buildMonsterSnapshot(m: RoamingMonster): SyncMonsterSnapshot {
    return {
      id: m.id,
      tp: m.type,
      nm: m.name,
      zn: m.zoneId,
      x: Math.round(m.x * 100) / 100,
      y: Math.round((m.y ?? getArchipelagoGroundY(m.x, m.z)) * 100) / 100,
      z: Math.round(m.z * 100) / 100,
      hx: Math.round(m.homeX * 100) / 100,
      hz: Math.round(m.homeZ * 100) / 100,
      yaw: Math.round(m.mesh.rotation.y * 100) / 100,
      hp: m.mobHp ?? m.maxMobHp ?? 4,
      mhp: m.maxMobHp ?? 4,
      shp: m.stanceHp,
      cmb: Boolean(m.combatOnly),
      ngt: m.isNightMonster,
      sea: m.isSeaMonster,
      sky: m.isSkyMonster,
      wids: m.wordIds,
      rxp: m.rewardXp,
      rdm: m.rewardDiamonds,
      rsc: m.rewardScore,
      al: m.alive,
      agg: m.aggroActive,
      sb: m.sunburnTimer !== undefined,
    };
  }

  public buildWorldSyncPacket(): P2pReliableMessage {
    const snapshots: SyncMonsterSnapshot[] = [
      ...this.monsters.map((m) => this.buildMonsterSnapshot(m)),
      ...this.seaMonsters.map((m) => this.buildMonsterSnapshot(m)),
      ...this.skyMonsters.map((m) => this.buildMonsterSnapshot(m)),
    ];
    const shooterSnaps: SyncShooterSnapshot[] =
      this.worldMode === 'overworld'
        ? this.shooters.map((s) => ({
            id: s.id,
            x: Math.round(s.x * 100) / 100,
            z: Math.round(s.z * 100) / 100,
            hx: Math.round(s.homeX * 100) / 100,
            hz: Math.round(s.homeZ * 100) / 100,
            zn: s.zoneId,
            hp: s.hp,
            al: s.alive,
            ngt: s.isNightShooter,
          }))
        : [];
    return {
      t: 'wsync',
      day: this.dayCount,
      tick: Math.round(this.worldTimeTick),
      mode: this.surfaceWaveMode,
      wtot: this.nightWaveTotal,
      ws: this.missionWaveSeed || undefined,
      wc: this.missionWaveCount || undefined,
      wcmp: this.missionWaveCompleted || undefined,
      sq: this.currentSquadName || undefined,
      nseq: this.nightMonsterSeq,
      m: snapshots,
      s: shooterSnaps,
      lz: Array.from(this.liberatedZones),
      dbz: Array.from(this.defeatedBossZones),
      dc: {
        desa_sapaan: [...(this.areaDoorsCleared.desa_sapaan || [])],
        pasar_rasa: [...(this.areaDoorsCleared.pasar_rasa || [])],
        hutan_satwa: [...(this.areaDoorsCleared.hutan_satwa || [])],
        gerbang_kota: [...(this.areaDoorsCleared.gerbang_kota || [])],
        menara_waktu: [...(this.areaDoorsCleared.menara_waktu || [])],
        gua_portal: [...(this.areaDoorsCleared.gua_portal || [])],
      },
    };
  }

  public buildMonsterMovePacket(): P2pReliableMessage {
    const moveMonsters: Array<{
      id: string;
      x: number;
      y: number;
      z: number;
      yaw: number;
      hp: number;
      al: boolean;
      agg?: boolean;
    }> = [];
    for (const pool of [this.monsters, this.seaMonsters, this.skyMonsters]) {
      for (const m of pool) {
        if (!m.alive && m.respawnTimer <= 0) continue;
        moveMonsters.push({
          id: m.id,
          x: Math.round(m.x * 100) / 100,
          y: Math.round((m.y ?? getArchipelagoGroundY(m.x, m.z)) * 100) / 100,
          z: Math.round(m.z * 100) / 100,
          yaw: Math.round(m.mesh.rotation.y * 100) / 100,
          hp: m.mobHp ?? m.maxMobHp ?? 4,
          al: m.alive,
          agg: m.aggroActive,
        });
      }
    }
    const moveShooters: Array<{ id: string; x: number; z: number; hp: number; al: boolean }> =
      this.worldMode === 'overworld'
        ? this.shooters
            .filter((s) => s.alive)
            .map((s) => ({
              id: s.id,
              x: Math.round(s.x * 100) / 100,
              z: Math.round(s.z * 100) / 100,
              hp: s.hp,
              al: s.alive,
            }))
        : [];
    return {
      t: 'msync',
      m: moveMonsters,
      s: moveShooters,
    };
  }

  public buildClockSyncPacket(): P2pReliableMessage {
    return {
      t: 'clock',
      day: this.dayCount,
      tick: Math.round(this.worldTimeTick),
      mode: this.surfaceWaveMode,
      wtot: this.nightWaveTotal,
      wcmp: this.missionWaveCompleted || undefined,
    };
  }

  public getLocalStatsPacket(uidOverride?: string): P2pReliableMessage {
    const uid = uidOverride || this.localMultiplayerUid || 'local';
    const zoneId =
      this.worldMode === 'dungeon' && this.dungeonState
        ? this.dungeonState.zoneId
        : getZoneForPosition(this.heroPos.x, this.heroPos.z);
    const zoneName =
      this.worldMode === 'academy'
        ? 'Istana IELTS'
        : this.worldMode === 'ocean'
        ? getOceanZoneInfo(this.heroPos.z, this.heroPos.y).label
        : ZONE_INFO[zoneId]?.name || 'Kepulauan';
    return {
      t: 'stats',
      st: {
        uid,
        displayName: this.localPlayerName,
        characterId: this.localCharacterId,
        kills: this.localMabarStats.kills,
        assists: this.localMabarStats.assists,
        helps: this.localMabarStats.helps,
        challenges: this.localMabarStats.challenges,
        zonesCleared: this.liberatedZones.size,
        personalScore: this.score,
        hp: this.hp,
        maxHp: this.maxHp,
        worldMode: this.worldMode,
        zoneName,
        inChallenge:
          this.phase === 'battle' || this.phase === 'learning' || this.phase === 'academy',
        updatedAtMs: Date.now(),
      },
    };
  }

  private applyProgressSync(
    lz: ZoneId[],
    dbz: ZoneId[],
    dc: Record<ZoneId, number[]>,
  ): void {
    let changed = false;
    for (const z of lz) {
      if (!this.liberatedZones.has(z)) {
        this.liberatedZones.add(z);
        this.ribbons.add(z);
        const q = this.quests.find((item) => item.zoneId === z);
        if (q) {
          q.accepted = true;
          q.progress = q.target;
          q.claimed = true;
        }
        changed = true;
      }
    }
    for (const z of dbz) {
      if (!this.defeatedBossZones.has(z)) {
        this.defeatedBossZones.add(z);
        changed = true;
      }
    }
    if (dc) {
      (Object.keys(this.areaDoorsCleared) as ZoneId[]).forEach((zId) => {
        const incoming = dc[zId] || [];
        const existing = new Set(this.areaDoorsCleared[zId] || []);
        let zChanged = false;
        for (const dIdx of incoming) {
          if (!existing.has(dIdx)) {
            existing.add(dIdx);
            zChanged = true;
          }
        }
        if (zChanged) {
          this.areaDoorsCleared[zId] = Array.from(existing).sort((a, b) => a - b);
          if (this.worldMode === 'dungeon' && this.dungeonState?.zoneId === zId) {
            this.dungeonState.doorsCleared = [...this.areaDoorsCleared[zId]];
            this.updateDungeonDoorVisuals();
          }
          changed = true;
        }
      });
    }
    this.localMabarStats.zonesCleared = this.liberatedZones.size;
    if (changed) {
      this.refreshAreaMists();
      this.pushHud(true);
    }
  }

  private findOverworldMonsterById(id: string): RoamingMonster | undefined {
    return (
      this.monsters.find((m) => m.id === id) ??
      this.seaMonsters.find((m) => m.id === id) ??
      this.skyMonsters.find((m) => m.id === id)
    );
  }

  private spawnSyncedSurfaceMonster(snap: SyncMonsterSnapshot): RoamingMonster {
    const mType: MonsterType = snap.tp in MONSTER_SPECS ? snap.tp : 'thorn_goblin';
    const spec = MONSTER_SPECS[mType];
    const mesh = createMonsterMesh(mType, this.palette);
    mesh.position.set(snap.x, snap.y, snap.z);
    mesh.rotation.y = snap.yaw;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.85 * spec.baseScale, 1.15 * spec.baseScale, 20),
      new THREE.MeshBasicMaterial({
        color: snap.cmb ? 0xef4444 : 0xa855f7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.78,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06 - spec.hoverY;
    mesh.add(ring);
    mesh.userData.combatRing = ring;
    mesh.userData.monsterId = snap.id;
    mesh.visible = snap.al;
    this.overworldGroup.add(mesh);
    if (snap.al) {
      this.overworldClickables.push(mesh);
    }
    this.peerMonsterTargets.set(snap.id, {
      x: snap.x,
      y: snap.y,
      z: snap.z,
      yaw: snap.yaw,
      aggroActive: snap.agg,
    });
    return {
      id: snap.id,
      type: mType,
      name: snap.nm || spec.name,
      zoneId: snap.zn,
      homeX: snap.hx,
      homeZ: snap.hz,
      x: snap.x,
      y: snap.y,
      z: snap.z,
      maxHp: spec.quizHp,
      mobHp: snap.hp,
      maxMobHp: snap.mhp,
      stanceHp: !snap.cmb ? (snap.shp ?? spec.stanceHp) : undefined,
      rewardXp: snap.rxp,
      rewardDiamonds: snap.rdm,
      rewardScore: snap.rsc,
      combatOnly: snap.cmb,
      isNightMonster: snap.ngt,
      wordIds: snap.wids,
      aggroActive: snap.agg,
      attackCooldown: 1.0,
      windupTimer: -1,
      lungeTimer: 0,
      hitFlashTimer: 0,
      mesh,
      alive: snap.al,
      respawnTimer: 0,
      patrolPhase: Math.random() * Math.PI * 2,
      angryTimer: 0,
    };
  }

  private getNearestPlayerTarget(
    x: number,
    z: number,
    worldMode: WorldLocationMode,
  ): { x: number; y: number; z: number; dx: number; dz: number; distSq: number; dist: number; isLocal: boolean } {
    let bestX = this.heroPos.x;
    let bestY = this.heroPos.y;
    let bestZ = this.heroPos.z;
    let bestDx = bestX - x;
    let bestDz = bestZ - z;
    let bestDistSq = bestDx * bestDx + bestDz * bestDz;
    let isLocal = true;

    if (this.multiplayerActive && this.remotePeers.size > 0) {
      for (const peer of this.remotePeers.values()) {
        if (peer.state.worldMode !== worldMode) continue;
        if (typeof peer.state.hp === 'number' && peer.state.hp <= 0) continue;
        const dx = peer.pos.x - x;
        const dz = peer.pos.z - z;
        const dSq = dx * dx + dz * dz;
        if (dSq < bestDistSq) {
          bestDistSq = dSq;
          bestX = peer.pos.x;
          bestY = peer.pos.y;
          bestZ = peer.pos.z;
          bestDx = dx;
          bestDz = dz;
          isLocal = false;
        }
      }
    }

    return {
      x: bestX,
      y: bestY,
      z: bestZ,
      dx: bestDx,
      dz: bestDz,
      distSq: bestDistSq,
      dist: Math.sqrt(bestDistSq),
      isLocal,
    };
  }

  private applyMonsterDefeatedRemotely(
    m: RoamingMonster,
    killerUid: string,
    killerName: string,
    assists: string[],
    isQuiz?: boolean,
  ): void {
    const myUid = this.localMultiplayerUid || 'local';
    m.alive = false;
    m.respawnTimer = this.isOverworldChallengeNoRespawn()
      ? 0
      : m.isSeaMonster
      ? 45
      : m.isSkyMonster
      ? 50
      : 0;
    m.aggroActive = false;
    m.windupTimer = -1;
    m.lungeTimer = 0;
    m.mesh.visible = false;
    this.peerMonsterTargets.delete(m.id);
    this.monsterDamageContributors.delete(m.id);
    if (!m.isSeaMonster && !m.isSkyMonster) {
      if (m.mesh.parent) m.mesh.parent.remove(m.mesh);
      const clickIdx = this.overworldClickables.indexOf(m.mesh);
      if (clickIdx >= 0) this.overworldClickables.splice(clickIdx, 1);
    }
    this.spawnBurst(
      m.x,
      (m.y ?? getArchipelagoGroundY(m.x, m.z)) + 1.5,
      m.z,
      isQuiz ? 0xc084fc : m.isSeaMonster ? 0x22d3ee : m.isSkyMonster ? 0xf97316 : 0xfacc15,
      24,
    );

    if (isQuiz) {
      if (killerUid !== myUid) {
        this.showBanner(`📘 ${killerName} menaklukkan ${m.name} lewat tantangan Inggris!`, 2.8);
      }
      if (this.worldMode === 'overworld') {
        this.checkMissionWaveCompletion();
      }
      this.pushHud(true);
      return;
    }

    if (killerUid === myUid) {
      this.monstersDefeated += 1;
      this.localMabarStats.kills += 1;
      this.gainXp(m.rewardXp);
      this.addScore(m.rewardScore);
      const diamondDrop = Math.max(1, m.rewardDiamonds || 1);
      const ammoDrop = 3 + diamondDrop;
      if (this.ownedWeapons.size > 0) {
        this.weaponAmmo[this.activeWeapon] = Math.min(
          MAX_AMMO,
          this.weaponAmmo[this.activeWeapon] + ammoDrop,
        );
      }
      this.diamonds += diamondDrop;
      const healed = this.hp < this.maxHp;
      if (healed) this.hp += 1;
      soundEngine.playBoom();
      this.triggerHitMarker(true);
      this.showBanner(
        `⚔️ ${m.name} kalah! +${m.rewardXp} XP · +${diamondDrop} 💎 · +${ammoDrop} Peluru${healed ? ' · +1 ❤️' : ''}`,
        3.0,
      );
    } else if (assists.includes(myUid)) {
      this.localMabarStats.assists += 1;
      this.gainXp(15);
      this.addScore(90);
      soundEngine.playPick();
      this.showBanner(`🤝 Assist mengalahkan ${m.name} bersama ${killerName}! +15 XP · +90 Skor`, 2.8);
    } else {
      soundEngine.playBoom();
      this.showBanner(`⚔️ ${killerName} mengalahkan ${m.name}!`, 2.2);
    }
    if (this.worldMode === 'overworld') {
      this.checkMissionWaveCompletion();
    }
    this.pushHud(true);
  }

  public handleMultiplayerPacket(
    fromUid: string,
    pkt: P2pReliableMessage,
    localUid?: string,
  ): void {
    if (localUid) {
      this.localMultiplayerUid = localUid;
    }
    const myUid = this.localMultiplayerUid || localUid || 'local';

    if (pkt.t === 'wsync') {
      if (this.isWorldAuthority() && !this.isAwaitingRejoinSync()) return;
      this.awaitingRejoinWorldSync = false;
      this.rejoinSyncDeadlineMs = 0;
      this.dayCount = pkt.day;
      this.worldTimeTick = pkt.tick;
      this.surfaceWaveMode = pkt.mode;
      this.lastOverworldDayPhase = this.getDayPhaseForTick(pkt.tick);
      this.nightWaveTotal = pkt.wtot;
      this.missionWaveSeed = pkt.ws ?? this.missionWaveSeed;
      this.missionWaveCount = pkt.wc ?? pkt.wtot;
      this.missionWaveCompleted = Boolean(pkt.wcmp);
      if (pkt.sq) {
        this.currentSquadName = pkt.sq;
      }
      if (this.missionWaveSeed > 0 && this.missionWaveCount >= 20) {
        this.missionWaveSummary = generateRandomSurfaceWave(
          this.missionWaveSeed,
          this.missionWaveCount,
        ).summary;
      }
      this.nightMonsterSeq = Math.max(this.nightMonsterSeq, pkt.nseq);
      if (pkt.mode === 'night') {
        this.nightWaveDaySpawned = pkt.day;
      } else {
        this.dayWaveDaySpawned = pkt.day;
      }

      const incomingSurface = pkt.m.filter((snap) => !snap.sea && !snap.sky);
      const sameWave =
        incomingSurface.length === this.monsters.length &&
        incomingSurface.every((snap, idx) => this.monsters[idx]?.id === snap.id);

      if (!sameWave) {
        this.clearOverworldNightMonsters();
        this.nightWaveTotal = pkt.wtot;
        this.missionWaveCount = pkt.wc ?? pkt.wtot;
        for (const snap of incomingSurface) {
          this.monsters.push(this.spawnSyncedSurfaceMonster(snap));
        }
        if (this.missionWaveSummary.length === 0 && incomingSurface.length > 0) {
          this.missionWaveSummary = summarizeWaveMonsters(
            incomingSurface.map((s) => ({ type: s.tp, combatOnly: s.cmb })),
          );
        }
        this.rebuildOverworldMonsterPool();
      } else {
        for (const snap of incomingSurface) {
          const m = this.monsters.find((item) => item.id === snap.id);
          if (!m) continue;
          m.mobHp = snap.hp;
          m.alive = snap.al;
          m.aggroActive = snap.agg;
          m.mesh.visible = snap.al;
          if (!snap.al) {
            const clickIdx = this.overworldClickables.indexOf(m.mesh);
            if (clickIdx >= 0) this.overworldClickables.splice(clickIdx, 1);
          }
          this.peerMonsterTargets.set(snap.id, {
            x: snap.x,
            y: snap.y,
            z: snap.z,
            yaw: snap.yaw,
            aggroActive: snap.agg,
          });
        }
      }

      for (const snap of pkt.m) {
        if (!snap.sea && !snap.sky) continue;
        const m = this.findOverworldMonsterById(snap.id);
        if (!m) continue;
        m.mobHp = snap.hp;
        m.alive = snap.al;
        m.aggroActive = snap.agg;
        m.mesh.visible = snap.al;
        this.peerMonsterTargets.set(snap.id, {
          x: snap.x,
          y: snap.y,
          z: snap.z,
          yaw: snap.yaw,
          aggroActive: snap.agg,
        });
      }

      if (this.worldMode === 'overworld') {
        for (const sSnap of pkt.s) {
          const s = this.shooters.find((item) => item.id === sSnap.id);
          if (s) {
            s.hp = sSnap.hp;
            s.alive = sSnap.al;
            s.mesh.visible = sSnap.al;
            this.peerMonsterTargets.set(`sh_${sSnap.id}`, {
              x: sSnap.x,
              y: getArchipelagoGroundY(sSnap.x, sSnap.z),
              z: sSnap.z,
              yaw: s.mesh.rotation.y,
            });
          }
        }
      }

      this.applyProgressSync(pkt.lz, pkt.dbz, pkt.dc);
      this.updateOverworldDayNightAtmosphere(0, false);
      this.pushHud(true);
      return;
    }

    if (pkt.t === 'msync') {
      if (this.isWorldAuthority()) return;
      for (const snap of pkt.m) {
        this.peerMonsterTargets.set(snap.id, {
          x: snap.x,
          y: snap.y,
          z: snap.z,
          yaw: snap.yaw,
          aggroActive: snap.agg,
        });
        const m = this.findOverworldMonsterById(snap.id);
        if (m) {
          m.mobHp = snap.hp;
          m.aggroActive = snap.agg;
          if (m.alive !== snap.al) {
            m.alive = snap.al;
            m.mesh.visible = snap.al;
            if (!snap.al && !m.isSeaMonster && !m.isSkyMonster) {
              const clickIdx = this.overworldClickables.indexOf(m.mesh);
              if (clickIdx >= 0) this.overworldClickables.splice(clickIdx, 1);
            }
          }
        }
      }
      if (this.worldMode === 'overworld') {
        for (const sSnap of pkt.s) {
          this.peerMonsterTargets.set(`sh_${sSnap.id}`, {
            x: sSnap.x,
            y: getArchipelagoGroundY(sSnap.x, sSnap.z),
            z: sSnap.z,
            yaw: 0,
          });
          const s = this.shooters.find((item) => item.id === sSnap.id);
          if (s) {
            s.hp = sSnap.hp;
            s.alive = sSnap.al;
            s.mesh.visible = sSnap.al;
          }
        }
      }
      return;
    }

    if (pkt.t === 'm_hit') {
      if (!this.isWorldAuthority()) return;
      if (pkt.isSh) {
        const s = this.shooters.find((item) => item.id === pkt.id);
        if (!s || !s.alive) return;
        let contribs = this.monsterDamageContributors.get(`sh_${s.id}`);
        if (!contribs) {
          contribs = new Set();
          this.monsterDamageContributors.set(`sh_${s.id}`, contribs);
        }
        contribs.add(fromUid);
        s.hp -= pkt.dmg;
        s.hitSquashTimer = 0.24;
        const len = Math.max(0.25, Math.hypot(pkt.dx, pkt.dz));
        s.x += (pkt.dx / len) * 1.4;
        s.z += (pkt.dz / len) * 1.4;
        if (s.hp <= 0) {
          s.alive = false;
          s.mesh.visible = false;
          s.respawnTimer = 0;
          const killerName = this.remotePeers.get(fromUid)?.state.displayName || 'Rekan Tim';
          const assists = Array.from(contribs).filter((uid) => uid !== fromUid);
          this.monsterDamageContributors.delete(`sh_${s.id}`);
          this.emitMultiplayerPacket({
            t: 'm_kill',
            id: s.id,
            killerUid: fromUid,
            killerName,
            assists,
            isSh: true,
            md: 'overworld',
          });
          if (assists.includes(myUid)) {
            this.localMabarStats.assists += 1;
            this.gainXp(10);
            this.addScore(60);
            this.showBanner(`🤝 Assist Penembak bersama ${killerName}!`, 2.2);
          }
          this.pushHud(true);
        }
        return;
      }

      const m = this.findOverworldMonsterById(pkt.id);
      if (!m || !m.alive) return;
      let contribs = this.monsterDamageContributors.get(m.id);
      if (!contribs) {
        contribs = new Set();
        this.monsterDamageContributors.set(m.id, contribs);
      }
      contribs.add(fromUid);
      m.mobHp = (m.mobHp ?? m.maxMobHp ?? 4) - pkt.dmg;
      if (m.combatOnly) {
        m.aggroActive = true;
        m.hitFlashTimer = 0.22;
      }
      const len = Math.max(0.25, Math.hypot(pkt.dx, pkt.dz));
      if (m.isSeaMonster && this.worldMode === 'overworld') {
        const knockPt = { x: m.x + (pkt.dx / len) * 1.2, z: m.z + (pkt.dz / len) * 1.2 };
        this.constrainSeaMonsterToWater(knockPt, m.x, m.z, 2.2);
        m.x = knockPt.x;
        m.z = knockPt.z;
      } else if (m.isSkyMonster && this.worldMode === 'overworld') {
        const skyLimit = WORLD_OCEAN_LIMIT - 20;
        m.x = THREE.MathUtils.clamp(m.x + (pkt.dx / len) * 1.35, -skyLimit, skyLimit);
        m.z = THREE.MathUtils.clamp(m.z + (pkt.dz / len) * 1.35, -skyLimit, skyLimit);
      } else if (this.worldMode === 'overworld') {
        const knockPt = { x: m.x + (pkt.dx / len) * 1.05, z: m.z + (pkt.dz / len) * 1.05 };
        constrainToWalkableArchipelago(knockPt, 0.95);
        m.x = knockPt.x;
        m.z = knockPt.z;
      }
      if (m.mobHp <= 0) {
        const killerName = this.remotePeers.get(fromUid)?.state.displayName || 'Rekan Tim';
        const assists = Array.from(contribs).filter((uid) => uid !== fromUid);
        this.emitMultiplayerPacket({
          t: 'm_kill',
          id: m.id,
          killerUid: fromUid,
          killerName,
          assists,
          md: 'overworld',
          zn: m.zoneId,
        });
        this.applyMonsterDefeatedRemotely(m, fromUid, killerName, assists, false);
      }
      return;
    }

    if (pkt.t === 'm_kill') {
      if (pkt.isSh) {
        const s = this.shooters.find((item) => item.id === pkt.id);
        if (s) {
          s.alive = false;
          s.mesh.visible = false;
          s.respawnTimer = 0;
          this.peerMonsterTargets.delete(`sh_${s.id}`);
          this.monsterDamageContributors.delete(`sh_${s.id}`);
          this.spawnBurst(s.x, getArchipelagoGroundY(s.x, s.z) + 1.5, s.z, 0xfbbf24, 20);
        }
        if (pkt.killerUid === myUid) {
          this.monstersDefeated += 1;
          this.localMabarStats.kills += 1;
          this.gainXp(5);
          this.addScore(120);
          soundEngine.playBoom();
          this.triggerHitMarker(true);
          this.showBanner('Penembak Kalah! +5 XP', 2.4);
        } else if (pkt.assists.includes(myUid)) {
          this.localMabarStats.assists += 1;
          this.gainXp(5);
          this.addScore(60);
          this.showBanner(`🤝 Assist Penembak bersama ${pkt.killerName}!`, 2.2);
        }
        this.pushHud(true);
        return;
      }

      const m = this.findOverworldMonsterById(pkt.id);
      if (m) {
        this.applyMonsterDefeatedRemotely(m, pkt.killerUid, pkt.killerName, pkt.assists, pkt.isQuiz);
      }
      return;
    }

    if (pkt.t === 'shot') {
      if (this.worldMode !== pkt.md) return;
      const fromPlayer = pkt.fp !== false;
      this.spawnProjectile({
        fromPlayer,
        weaponId: pkt.wid,
        x: pkt.x,
        y: pkt.y,
        z: pkt.z,
        vx: pkt.vx,
        vy: pkt.vy,
        vz: pkt.vz,
        damage: pkt.dmg,
        shieldDamage: 1,
        pierceLeft: 0,
        colorHex: pkt.col,
        visualOnly: fromPlayer,
      });
      return;
    }

    if (pkt.t === 'heal') {
      if (pkt.toUid !== myUid) return;
      if (this.hp > 0 && this.hp < this.maxHp) {
        this.hp = Math.min(this.maxHp, this.hp + pkt.amt);
      }
      soundEngine.playPick();
      this.spawnBurst(this.heroPos.x, this.heroPos.y + 1.8, this.heroPos.z, 0x34d399, 20);
      this.showBanner(`❤️ ${pkt.fromName} membantumu pulih (+${pkt.amt} ❤️)!`, 3.2);
      this.pushHud(true);
      return;
    }

    if (pkt.t === 'prog') {
      this.applyProgressSync(pkt.lz, pkt.dbz, pkt.dc);
      return;
    }

    if (pkt.t === 'clock') {
      if (this.isWorldAuthority()) return;
      this.dayCount = pkt.day;
      this.worldTimeTick = pkt.tick;
      this.surfaceWaveMode = pkt.mode;
      this.lastOverworldDayPhase = this.getDayPhaseForTick(pkt.tick);
      this.nightWaveTotal = pkt.wtot;
      if (pkt.wcmp) {
        this.missionWaveCompleted = true;
      }
      this.updateOverworldDayNightAtmosphere(0, false);
      this.pushHud(true);
      return;
    }

    if (pkt.t === 'wreq') {
      if (this.multiplayerActive && this.phase === 'playing' && !this.isAwaitingRejoinSync()) {
        this.emitMultiplayerPacket(this.buildWorldSyncPacket(), fromUid);
      }
    }
  }

  public helpNearbyTeammate(): void {
    if (!this.multiplayerActive || this.phase !== 'playing') return;
    if (this.allyHelpCooldown > 0) {
      this.showBanner(
        `⏳ Bantu Teman siap lagi dalam ${Math.ceil(this.allyHelpCooldown)} detik.`,
        1.8,
      );
      return;
    }
    const target = this.nearbyInjuredPeer;
    if (!target) {
      this.showBanner('Dekati teman tim yang terluka (< 6.5m) untuk membantunya.', 2.2);
      return;
    }
    this.allyHelpCooldown = 15;
    this.localMabarStats.helps += 1;
    this.gainXp(25);
    this.addScore(80);
    soundEngine.playPick();
    const peerEntry = this.remotePeers.get(target.uid);
    if (peerEntry) {
      this.spawnBurst(peerEntry.pos.x, peerEntry.pos.y + 1.8, peerEntry.pos.z, 0x34d399, 20);
      if (typeof peerEntry.state.hp === 'number' && typeof peerEntry.state.maxHp === 'number') {
        peerEntry.state.hp = Math.min(peerEntry.state.maxHp, peerEntry.state.hp + 1);
      }
    }
    this.emitMultiplayerPacket({
      t: 'heal',
      toUid: target.uid,
      amt: 1,
      fromName: this.localPlayerName,
    });
    this.showBanner(
      `💚 Berhasil membantu ${target.displayName} (+1 ❤️)! +25 XP · +80 Skor`,
      3.0,
    );
    this.pushHud(true);
  }

  public upsertRemotePlayers(players: RemotePlayerState[]): void {
    if (!this.multiplayerActive) return;
    const activeUids = new Set<string>();
    for (const p of players) {
      activeUids.add(p.uid);
      let entry = this.remotePeers.get(p.uid);
      if (!entry) {
        const rig = createHeroAvatar(
          this.palette,
          getCharacterPreset(p.characterId).colors,
          p.characterId,
        );
        rig.root.position.set(p.x, p.y, p.z);
        rig.body.rotation.y = p.yaw;
        setHeroWeaponVisual(rig, p.activeWeapon, p.weaponOwned);
        this.scene.add(rig.root);
        entry = {
          state: { ...p },
          rig,
          pos: new THREE.Vector3(p.x, p.y, p.z),
          targetPos: new THREE.Vector3(p.x, p.y, p.z),
          yaw: p.yaw,
          targetYaw: p.yaw,
          weaponKey: `${p.activeWeapon}:${p.weaponOwned ? 1 : 0}`,
        };
        this.remotePeers.set(p.uid, entry);
        if (this.phase === 'playing' && p.worldMode === this.worldMode) {
          this.spawnBurst(p.x, p.y + 1.0, p.z, 0x34d399, 18);
        }
      } else {
        if (entry.state.characterId !== p.characterId) {
          applyHeroAppearance(entry.rig, getCharacterPreset(p.characterId).colors, p.characterId);
        }
        entry.state = { ...p };
        entry.targetPos.set(p.x, p.y, p.z);
        entry.targetYaw = p.yaw;
      }
    }

    for (const [uid, entry] of this.remotePeers.entries()) {
      if (!activeUids.has(uid)) {
        this.remotePeers.delete(uid);
        if (this.nearbyInjuredPeer?.uid === uid) {
          this.nearbyInjuredPeer = null;
        }
        if (entry.state.worldMode === this.worldMode && this.phase !== 'title') {
          this.spawnBurst(entry.pos.x, entry.pos.y + 1.1, entry.pos.z, 0x38bdf8, 22);
          this.spawnBurst(entry.pos.x, entry.pos.y + 1.4, entry.pos.z, 0xfbbf24, 14);
          this.departingPeerEffects.push({
            rig: entry.rig,
            elapsed: 0,
            duration: 0.58,
            startY: entry.pos.y,
            startYaw: entry.yaw,
          });
        } else {
          this.scene.remove(entry.rig.root);
        }
      }
    }
  }

  public triggerRemoteChatBubble(uid: string, text: string): void {
    const entry = this.remotePeers.get(uid);
    if (!entry) return;
    entry.state.lastChatText = text;
    entry.state.lastChatAt = Date.now();
  }

  public getLocalSyncPacket(): LocalPlayerSyncPacket {
    const spd = Math.hypot(this.heroVel.x, this.heroVel.z);
    const zoneId =
      this.worldMode === 'dungeon' && this.dungeonState
        ? this.dungeonState.zoneId
        : getZoneForPosition(this.heroPos.x, this.heroPos.z);
    const zoneName =
      this.worldMode === 'academy'
        ? 'Istana IELTS'
        : this.worldMode === 'ocean'
        ? getOceanZoneInfo(this.heroPos.z, this.heroPos.y).label
        : ZONE_INFO[zoneId]?.name || 'Kepulauan';
    return {
      t: 'state',
      w: this.worldMode,
      x: Math.round(this.heroPos.x * 100) / 100,
      y: Math.round(this.heroPos.y * 100) / 100,
      z: Math.round(this.heroPos.z * 100) / 100,
      yaw: Math.round(this.heroYaw * 100) / 100,
      spd: Math.round(spd * 10) / 10,
      wc: Math.round(this.walkCycle * 100) / 100,
      og: this.heroOnGround,
      sw: this.isSwimming,
      wp: this.activeWeapon,
      wo: this.ownedWeapons.has(this.activeWeapon),
      ap: Math.round(this.shootAimPitch * 100) / 100,
      ch: this.localCharacterId,
      nm: this.localPlayerName,
      hp: this.hp,
      mhp: this.maxHp,
      ic: this.phase === 'battle' || this.phase === 'learning' || this.phase === 'academy',
      zn: zoneName,
    };
  }

  private pickSafeSpawnPoint(spawnMode?: SpawnPreference, spawnIndex?: number): { x: number; y: number; z: number; yaw: number; label?: string } {
    const def = OVERWORLD_ANCHORS.desaSpawn;
    if (this.multiplayerActive) {
      const chosen = getMultiplayerGroupSpawnPoint(spawnIndex ?? 0);
      const pt = new THREE.Vector3(chosen.x, getArchipelagoGroundY(chosen.x, chosen.z), chosen.z);
      constrainToWalkableArchipelago(pt, 0.85);
      if (this.villageRig?.obstacles) {
        resolveObstacleBoxes(pt, 0.85, this.villageRig.obstacles);
      }
      pt.y = getArchipelagoGroundY(pt.x, pt.z);
      return {
        x: pt.x,
        y: pt.y,
        z: pt.z,
        yaw: chosen.yaw,
        label: chosen.label,
      };
    }
    if (spawnMode !== 'random' && typeof spawnIndex !== 'number') {
      return {
        x: def.x,
        y: getArchipelagoGroundY(def.x, def.z),
        z: def.z,
        yaw: def.yaw,
      };
    }
    const idx =
      typeof spawnIndex === 'number' && RANDOM_SPAWN_POINTS.length > 0
        ? Math.abs(Math.floor(spawnIndex)) % RANDOM_SPAWN_POINTS.length
        : Math.floor(Math.random() * RANDOM_SPAWN_POINTS.length);
    const chosen = RANDOM_SPAWN_POINTS[idx] ?? {
      id: 'default',
      label: 'Alun-Alun Desa',
      x: def.x,
      z: def.z,
      yaw: def.yaw,
    };
    const pt = new THREE.Vector3(chosen.x, getArchipelagoGroundY(chosen.x, chosen.z), chosen.z);
    constrainToWalkableArchipelago(pt, 0.85);
    if (this.villageRig?.obstacles) {
      resolveObstacleBoxes(pt, 0.85, this.villageRig.obstacles);
    }
    pt.y = getArchipelagoGroundY(pt.x, pt.z);
    return {
      x: pt.x,
      y: pt.y,
      z: pt.z,
      yaw: chosen.yaw,
      label: chosen.label,
    };
  }

  public startNewGame(
    aimMode?: AimMode,
    difficulty?: DifficultyMode,
    options?: {
      spawnMode?: SpawnPreference;
      spawnIndex?: number;
      skipStory?: boolean;
      characterId?: CharacterPresetId;
      playerName?: string;
      waveSeed?: number;
      waveCount?: number;
      squadName?: string;
    },
  ): void {
    this.clearSubScenes();
    this.clearVillageAmbushRig();
    this.clearOverworldNightMonsters();
    this.worldMode = 'overworld';
    this.overworldGroup.visible = true;
    if (options?.characterId || options?.playerName) {
      this.setLocalAppearance(
        options.characterId ?? this.localCharacterId,
        options.playerName,
      );
    }
    if (aimMode) {
      this.settings.aimMode = aimMode;
    }
    if (difficulty) {
      this.settings.difficulty = difficulty;
    }
    this.isAiming = false;
    this.aimToggled = false;
    this.rightAimHeld = false;
    this.leftFireHeld = false;
    this.hudFireHeld = false;
    this.aimBlend = 0;
    this.recoilPitch = 0;
    this.crosshairSpread = 0;
    this.crosshairOnEnemy = false;

    this.damageFlashTimer = 0;
    this.cameraShakeTimer = 0;
    this.lastDefeatReason = null;
    this.lastDamageDir = 'center';
    this.lastDamageAmount = 1;
    const startHp = DIFF_CONFIG[this.settings.difficulty].startHp;
    this.xp = 0;
    this.hp = startHp;
    this.maxHp = startHp;
    this.diamonds = 1;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.dailyDate = todayKey();
    this.dailyCount = 0;
    this.monstersDefeated = 0;
    this.ieltsCleared = false;
    this.wordProgress = {};
    this.wordProgressDirty = true;
    this.forceRenderNextFrame = true;
    this.activeWeapon = 'ketapel';
    this.activeHotbarSlot = 0;
    this.ownedWeapons.clear();
    this.weaponAmmo = {
      ketapel: 0,
      kerikil: 0,
      emas: 0,
      saus: 0,
      biji: 0,
      kertas: 0,
      jarum: 0,
      kristal: 0,
    };
    this.caveTorchesLeft = 16;
    this.caveBlocksMined = 0;
    this.caveShieldBlocksLeft = 4;
    this.caveTntLeft = 1;
    this.pickaxeTier = 1;
    this.starterWeaponPicked = false;
    this.swimSuitPicked = false;
    this.diveTransition = null;
    this.ownedRelics.clear();
    this.ribbons.clear();
    this.liberatedZones.clear();
    this.nightPermittedZones.clear();
    this.nearbyOverworldZoneDoor = null;
    this.areaTrophies.clear();
    this.areaDoorsCleared = {
      desa_sapaan: [],
      pasar_rasa: [],
      hutan_satwa: [],
      gerbang_kota: [],
      menara_waktu: [],
      gua_portal: [],
    };
    this.areaDeals = {};
    this.ieltsScores = { listening: 0, reading: 0, writing: 0, speaking: 0, full: 0 };
    this.introDone = false;
    this.caveIntrosSeen.clear();
    this.defeatedBossZones.clear();
    this.zoneCaveProgress = {};
    this.zoneCaveDetails = {};
    this.defeatedAcademyEnemyIds.clear();
    this.oceanGear.clear();
    this.oceanMaterials = { pearl: 0, fiber: 0, calcium: 0, shell: 0, food: 0 };
    this.discoveredBiota.clear();
    this.openedOceanChests.clear();
    this.oceanOxygen = 35;
    this.ridingTurtle = false;
    this.heroDiveActive = false;
    this.resetCarToParked(true);
    this.resetPlanesToParked(true);
    if (this.archipelagoUnderwaterRig) {
      for (const ch of this.archipelagoUnderwaterRig.chests) {
        ch.opened = false;
        ch.lid.rotation.x = 0;
        ch.beacon.visible = true;
      }
      for (const pk of this.archipelagoUnderwaterRig.pickups) {
        pk.active = true;
        pk.respawnTimer = 0;
        pk.mesh.visible = true;
      }
    }
    this.restoredWorldMode = 'overworld';
    this.restoredDungeonZoneId = null;
    this.restoredDungeonMixed = false;
    this.restoredHeroPos = null;
    this.restoredNightMonsters = [];
    this.restoredNightShooters = [];
    this.restoredCollectibles = null;
    this.worldTimeTick = this.multiplayerActive
      ? 23200
      : options?.skipStory
      ? this.pickRandomWorldTimeTick()
      : 19600;
    this.dayCount = 1;
    this.lastOverworldDayPhase = this.getDayPhaseForTick(this.worldTimeTick);
    this.nightWaveDaySpawned = 0;
    this.dayWaveDaySpawned = 0;
    this.surfaceWaveMode = this.lastOverworldDayPhase === 'malam' ? 'night' : 'day';
    this.pendingDayWaveTimer = -1;
    this.nightWaveTotal = 0;
    this.missionWaveSeed = 0;
    this.missionWaveCount = 0;
    this.missionWaveCompleted = false;
    this.missionWaveSummary = [];
    this.restoredDefeatedSeaSkyIds.clear();
    this.currentSquadName = options?.squadName || '';
    this.nightZoneTotals = {};
    this.nightShooterSaved = [];
    this.nightMonsterSeq = 0;
    this.allyHelpCooldown = 0;
    this.nearbyInjuredPeer = null;
    this.localMabarStats = {
      kills: 0,
      assists: 0,
      helps: 0,
      challenges: 0,
      zonesCleared: 0,
    };
    this.monsterDamageContributors.clear();
    this.peerMonsterTargets.clear();
    this.autoSaveTimer = 0;

    this.initDefaultQuests();
    this.spawnCollectibles();
    this.refreshAreaMists();
    this.refreshWeaponVisual();
    this.syncShootersForDifficulty(true);
    if (!this.multiplayerActive || this.isWorldAuthority() || options?.waveSeed) {
      this.spawnRandomMissionWave(options?.waveSeed, options?.waveCount, options?.squadName);
    } else {
      this.syncOverworldMonstersByDiff();
      this.initSeaMonsters();
      this.initSkyMonsters();
    }
    this.shootAimPitch = 0;
    this.shootAimTargetId = null;
    this.shootTargetPos = null;
    this.autoCamPitchActive = false;
    this.updateOverworldDayNightAtmosphere(0, false);

    const sp = this.pickSafeSpawnPoint(options?.spawnMode, options?.spawnIndex);
    this.heroPos.set(sp.x, sp.y, sp.z);
    this.savedOverworldHeroPos.copy(this.heroPos);
    this.heroVel.set(0, 0, 0);
    this.heroVelY = 0;
    this.heroOnGround = true;
    this.isSwimming = false;
    this.tapMoveTarget = null;
    this.heroYaw = sp.yaw;
    this.encounterGraceTimer = 3.0;

    this.cameraMode = 'third_back';
    this.applyCameraVisibilityAndControls();
    this.snapCameraBehindHero();

    if (options?.skipStory) {
      this.introDone = true;
      this.storyDialog = null;
      this.owlRig.root.visible = false;
      this.owlState = 'hidden';
      this.phase = 'playing';
      this.applyCameraVisibilityAndControls();
      this.showBanner(
        sp.label
          ? `🌐 Mabar Aktif · Mendarat di ${sp.label}!`
          : '🌐 Mode Mabar Aktif · Selamat berpetualang bersama!',
        3.6,
      );
      soundEngine.playWin();
      this.pushHud(true);
    } else {
      // Begin animated 5-scene 3D Prologue before Messenger Owl meets Hero in Desa Sapaan
      this.startOpeningPrologue();
    }
    this.saveProgress();
  }

  private buildPrologueKingMesh(): PrologueKingRig {
    const root = new THREE.Group();
    const body = new THREE.Group();
    root.add(body);

    const skinMat = this.palette.getMat(0xfed7aa, 'matte');
    const robeMat = this.palette.getMat(0x312e81, 'matte');
    const capeMat = this.palette.getMat(0xbe123c, 'matte');
    const goldMat = this.palette.getMat(0xfacc15, 'metal');
    const goldGlow = this.palette.getMat(0xfef08a, 'emissive');
    const beardMat = this.palette.getMat(0xf8fafc, 'matte');
    const darkMat = this.palette.getMat(0x0f172a, 'gloss');

    const makeLeg = (lx: number): THREE.Group => {
      const leg = new THREE.Group();
      leg.position.set(lx, 0.9, 0);
      const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.7, 0.38), robeMat);
      cloth.position.y = -0.35;
      cloth.castShadow = true;
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.24, 0.46), darkMat);
      boot.position.set(0, -0.78, 0.04);
      boot.castShadow = true;
      leg.add(cloth, boot);
      return leg;
    };
    const leftLeg = makeLeg(-0.22);
    const rightLeg = makeLeg(0.22);
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.62, 0.64), robeMat);
    skirt.position.y = 0.72;
    skirt.castShadow = true;
    body.add(leftLeg, rightLeg, skirt);

    const upperBody = new THREE.Group();
    upperBody.position.set(0, 0.96, 0);
    body.add(upperBody);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.98, 1.0, 0.6), robeMat);
    torso.position.y = 0.5;
    torso.castShadow = true;
    const sash = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.16, 0.64), goldMat);
    sash.position.y = 0.12;
    const cape = new THREE.Mesh(new THREE.BoxGeometry(1.06, 1.32, 0.16), capeMat);
    cape.position.set(0, 0.34, -0.36);
    cape.rotation.x = 0.12;
    cape.castShadow = true;
    const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.66), goldMat);
    pauldronL.position.set(-0.56, 0.92, 0);
    const pauldronR = pauldronL.clone();
    pauldronR.position.x = 0.56;
    upperBody.add(torso, sash, cape, pauldronL, pauldronR);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.05, 0);
    upperBody.add(headGroup);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.76, 0.76), skinMat);
    head.position.y = 0.38;
    head.castShadow = true;
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.28, 0.82), beardMat);
    hair.position.set(0, 0.66, -0.04);
    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.38, 0.22), beardMat);
    beard.position.set(0, 0.12, 0.36);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.11, 0.06), darkMat);
    eyeL.position.set(-0.17, 0.4, 0.4);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.17;
    headGroup.add(head, hair, beard, eyeL, eyeR);

    // Removable glowing Royal Crown on Raja Aksara's head
    const crown = new THREE.Group();
    crown.position.set(0, 0.84, 0);
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.2, 0.86), goldMat);
    const ruby = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), this.palette.getMat(0xef4444, 'emissive'));
    ruby.position.set(0, 0.04, 0.46);
    crown.add(band, ruby);
    for (const [px, pz] of [
      [-0.32, 0.32],
      [0.32, 0.32],
      [-0.32, -0.32],
      [0.32, -0.32],
      [0, 0.34],
      [0, -0.34],
    ]) {
      const prong = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.14), goldGlow);
      prong.position.set(px, 0.22, pz);
      crown.add(prong);
    }
    headGroup.add(crown);

    const makeArm = (ax: number, withScepter: boolean): THREE.Group => {
      const arm = new THREE.Group();
      arm.position.set(ax, 0.88, 0);
      const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.56, 0.3), robeMat);
      sleeve.position.y = -0.24;
      sleeve.castShadow = true;
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.24), skinMat);
      hand.position.y = -0.58;
      arm.add(sleeve, hand);
      if (withScepter) {
        const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.55, 6), goldMat);
        staff.position.set(0, -0.55, 0.28);
        staff.rotation.x = Math.PI * 0.35;
        const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), goldGlow);
        orb.position.set(0, -0.1, 0.84);
        arm.add(staff, orb);
      }
      return arm;
    };
    const leftArm = makeArm(-0.62, false);
    const rightArm = makeArm(0.62, true);
    upperBody.add(leftArm, rightArm);

    root.scale.setScalar(1.18);
    return { root, body, upperBody, headGroup, leftArm, rightArm, leftLeg, rightLeg, crown };
  }

  private buildPrologueStage(): PrologueCutsceneRig {
    this.cleanupPrologueStage();
    const group = new THREE.Group();
    this.scene.add(group);

    // 1. Raja Aksara & joyful royal attendants on the central Hub terrace overlooking bridges
    const king = this.buildPrologueKingMesh();
    const hubX = -6.0;
    const hubZ = -2.0;
    king.root.position.set(hubX, getArchipelagoGroundY(hubX, hubZ), hubZ);
    group.add(king.root);

    const royalConfigs: Array<{ id: string; x: number; z: number; phase: number }> = [
      { id: 'school_teacher', x: -3.2, z: 0.9, phase: 0.3 },
      { id: 'crystal_scholar', x: -8.6, z: 1.1, phase: 1.5 },
      { id: 'village_elder', x: -5.2, z: 2.5, phase: 2.7 },
    ];
    const royalCrowd = royalConfigs.map((rc) => {
      const mesh = createZoneNpc(rc.id, this.palette);
      const yaw = Math.atan2(hubX - rc.x, hubZ - rc.z);
      mesh.position.set(rc.x, getArchipelagoGroundY(rc.x, rc.z), rc.z);
      mesh.rotation.y = yaw;
      group.add(mesh);
      return { mesh, baseX: rc.x, baseZ: rc.z, yaw, phase: rc.phase };
    });

    // 2. Lila with pink dress and vivid red hair ribbon
    const lilaMesh = createCaptiveMesh('girl', 0xf472b6, this.palette);
    const lilaCapRig = lilaMesh.userData.captiveRig as { headGroup?: THREE.Group } | undefined;
    if (lilaCapRig?.headGroup) {
      const bowCenter = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.18, 0.18),
        this.palette.getMat(0xe11d48, 'emissive'),
      );
      bowCenter.position.set(0.22, 0.74, 0.12);
      const bowTail = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.28, 0.1),
        this.palette.getMat(0xf43f5e, 'emissive'),
      );
      bowTail.position.set(0.34, 0.56, 0.1);
      bowTail.rotation.z = -0.25;
      lilaCapRig.headGroup.add(bowCenter, bowTail);
    }
    lilaMesh.position.set(-10.2, getArchipelagoGroundY(-10.2, 121.0), 121.0);
    group.add(lilaMesh);

    // 3. Living Desa Sapaan townsfolk: chatting neighbors, strolling friends, singing & dancing trio
    const villagerSpecs: Array<{
      id: string;
      x: number;
      z: number;
      yaw: number;
      phase: number;
      role: 'chat' | 'stroll' | 'dance';
      walkA?: [number, number];
      walkB?: [number, number];
      center?: [number, number];
      orbitR?: number;
    }> = [
      // Chatting pair near sunlit garden left of square
      { id: 'village_elder', x: -12.6, z: 116.8, yaw: 1.25, phase: 0.4, role: 'chat' },
      { id: 'grandma_herbalist', x: -10.8, z: 117.3, yaw: -1.85, phase: 1.9, role: 'chat' },
      // Chatting merchant & baker on sunny east terrace
      { id: 'spice_merchant', x: -1.6, z: 115.6, yaw: 1.35, phase: 0.9, role: 'chat' },
      { id: 'pastry_chef', x: 0.2, z: 116.1, yaw: -1.78, phase: 2.3, role: 'chat' },
      // Strolling friends walking side-by-side along the open lawn
      {
        id: 'florist_girl',
        x: 3.4,
        z: 116.0,
        yaw: 0.4,
        phase: 0.6,
        role: 'stroll',
        walkA: [3.2, 114.8],
        walkB: [7.6, 120.2],
      },
      {
        id: 'farmer_boy',
        x: 4.5,
        z: 115.2,
        yaw: 0.4,
        phase: 1.2,
        role: 'stroll',
        walkA: [4.4, 114.0],
        walkB: [8.8, 119.4],
      },
      // Joyful dancing & singing children circle in Desa Sapaan square
      {
        id: 'village_kid',
        x: 1.8,
        z: 121.5,
        yaw: 0,
        phase: 0.0,
        role: 'dance',
        center: [2.0, 122.0],
        orbitR: 1.45,
      },
      {
        id: 'schoolgirl',
        x: 3.2,
        z: 122.2,
        yaw: 2.1,
        phase: 2.09,
        role: 'dance',
        center: [2.0, 122.0],
        orbitR: 1.45,
      },
      {
        id: 'village_kid',
        x: 1.2,
        z: 123.3,
        yaw: 4.2,
        phase: 4.18,
        role: 'dance',
        center: [2.0, 122.0],
        orbitR: 1.45,
      },
    ];
    const villagers = villagerSpecs.map((cfg) => {
      const mesh = createZoneNpc(cfg.id, this.palette);
      mesh.position.set(cfg.x, getArchipelagoGroundY(cfg.x, cfg.z), cfg.z);
      mesh.rotation.y = cfg.yaw;
      group.add(mesh);
      return {
        mesh,
        x: cfg.x,
        z: cfg.z,
        yaw: cfg.yaw,
        phase: cfg.phase,
        role: cfg.role,
        walkA: cfg.walkA
          ? new THREE.Vector3(cfg.walkA[0], getArchipelagoGroundY(cfg.walkA[0], cfg.walkA[1]), cfg.walkA[1])
          : undefined,
        walkB: cfg.walkB
          ? new THREE.Vector3(cfg.walkB[0], getArchipelagoGroundY(cfg.walkB[0], cfg.walkB[1]), cfg.walkB[1])
          : undefined,
        center: cfg.center
          ? new THREE.Vector3(cfg.center[0], getArchipelagoGroundY(cfg.center[0], cfg.center[1]), cfg.center[1])
          : undefined,
        orbitR: cfg.orbitR,
      };
    });

    // 4. Shimmering "Jembatan Cahaya" pillars & gliding golden light orbs across all 6 island bridges
    const bridgeSpans: Array<{
      ax: number;
      ay: number;
      az: number;
      bx: number;
      by: number;
      bz: number;
      arch: number;
    }> = [
      { ax: -26.0, ay: 5.0, az: 33.0, bx: -18.0, by: 2.6, bz: 62.5, arch: 1.1 }, // Desa Sapaan
      { ax: -58.0, ay: 5.0, az: 4.0, bx: -72.0, by: 2.0, bz: 31.0, arch: 1.0 }, // Pasar Rasa
      { ax: 46.0, ay: 5.0, az: 16.0, bx: 65.0, by: 3.4, bz: 36.5, arch: 1.15 }, // Hutan Satwa
      { ax: -57.0, ay: 6.5, az: -31.0, bx: -92.0, by: 12.0, bz: -34.0, arch: 0.85 }, // Gerbang Kota
      { ax: 50.0, ay: 6.5, az: -49.0, bx: 94.0, by: 10.0, bz: -66.0, arch: 0.85 }, // Menara Waktu
      { ax: -18.0, ay: 5.0, az: -73.0, bx: -12.0, by: 4.0, bz: -118.0, arch: 0.9 }, // Gua Portal
    ];
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.36,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const beamGeo = new THREE.CylinderGeometry(0.42, 1.45, 17, 12, 1, true);
    const orbGeo = new THREE.OctahedronGeometry(0.42, 1);
    const orbMat = this.palette.getMat(0xfef08a, 'emissive');
    const bridgeBeams: THREE.Mesh[] = [];
    const bridgeLightOrbs: PrologueCutsceneRig['bridgeLightOrbs'] = [];

    bridgeSpans.forEach((sp, bi) => {
      const bm = new THREE.Mesh(beamGeo, beamMat.clone());
      bm.position.set(
        (sp.ax + sp.bx) * 0.5,
        (sp.ay + sp.by) * 0.5 + sp.arch + 8.0,
        (sp.az + sp.bz) * 0.5,
      );
      group.add(bm);
      bridgeBeams.push(bm);

      for (let oi = 0; oi < 3; oi++) {
        const orb = new THREE.Mesh(orbGeo, orbMat);
        group.add(orb);
        bridgeLightOrbs.push({
          mesh: orb,
          ax: sp.ax,
          ay: sp.ay,
          az: sp.az,
          bx: sp.bx,
          by: sp.by,
          bz: sp.bz,
          arch: sp.arch,
          speed: 0.24 + oi * 0.04,
          offset: (bi * 0.19 + oi * 0.33) % 1,
        });
      }
    });

    const disposables: Array<{ dispose: () => void }> = [];

    // 5. Adegan 2 Stage mounted inside Istana Utara (Northern Floating Palace)
    const istanaStage = new THREE.Group();
    istanaStage.visible = false;
    this.archipelagoRig.istanaRig.istanaGroup.add(istanaStage);

    // 5a. Dark Sky Storm Portal hovering above Istana Utara courtyard
    const skyPortalGroup = new THREE.Group();
    skyPortalGroup.position.set(0, 27.5, 31.0);
    skyPortalGroup.rotation.x = 0.42;
    const vortexMat = new THREE.MeshBasicMaterial({
      color: 0x1e0836,
      transparent: true,
      opacity: 0.94,
      side: THREE.DoubleSide,
    });
    const ringOuterMat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const ringInnerMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const beamPortalMat = new THREE.MeshBasicMaterial({
      color: 0x6b21a8,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const coreGeo = new THREE.CircleGeometry(6.2, 32);
    const ringOuterGeo = new THREE.TorusGeometry(6.8, 0.45, 10, 36);
    const ringInnerGeo = new THREE.TorusGeometry(4.7, 0.3, 10, 28);
    const beamPortalGeo = new THREE.CylinderGeometry(3.4, 9.5, 24.5, 18, 1, true);
    const portalCore = new THREE.Mesh(coreGeo, vortexMat);
    const ringOuter = new THREE.Mesh(ringOuterGeo, ringOuterMat);
    const ringInner = new THREE.Mesh(ringInnerGeo, ringInnerMat);
    ringInner.position.z = 0.25;
    const portalBeam = new THREE.Mesh(beamPortalGeo, beamPortalMat);
    portalBeam.rotation.x = Math.PI * 0.5;
    portalBeam.position.z = 11.8;
    skyPortalGroup.add(portalCore, ringOuter, ringInner, portalBeam);

    const boltGeo = new THREE.BoxGeometry(0.32, 3.6, 0.32);
    const portalBolts: THREE.Mesh[] = [];
    for (let bi = 0; bi < 8; bi++) {
      const ang = (bi / 8) * Math.PI * 2;
      const bolt = new THREE.Mesh(boltGeo, bi % 2 === 0 ? ringOuterMat : ringInnerMat);
      bolt.position.set(Math.cos(ang) * 7.1, Math.sin(ang) * 7.1, 0.15);
      bolt.rotation.z = ang + Math.PI * 0.5;
      skyPortalGroup.add(bolt);
      portalBolts.push(bolt);
    }
    istanaStage.add(skyPortalGroup);
    disposables.push(
      vortexMat,
      ringOuterMat,
      ringInnerMat,
      beamPortalMat,
      coreGeo,
      ringOuterGeo,
      ringInnerGeo,
      beamPortalGeo,
      boltGeo,
    );

    // 5b. Sacred Royal Crown resting on an ornate Marble & Gold Altar at (0, 3.5, 25.2)
    const crownAltar = new THREE.Group();
    crownAltar.position.set(0, 3.5, 25.2);
    const altarBaseMat = this.palette.getMat(0xf8fafc, 'gloss');
    const altarGoldMat = this.palette.getMat(0xfacc15, 'metal');
    const altarVelvetMat = this.palette.getMat(0xbe123c, 'matte');
    const pedestalStep = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 2.6), altarBaseMat);
    pedestalStep.position.y = 0.225;
    const pedestalShaft = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.35, 1.35), altarBaseMat);
    pedestalShaft.position.y = 1.12;
    const pedestalCap = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.3, 1.9), altarGoldMat);
    pedestalCap.position.y = 1.88;
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.28, 1.15), altarVelvetMat);
    cushion.position.y = 2.15;
    crownAltar.add(pedestalStep, pedestalShaft, pedestalCap, cushion);
    istanaStage.add(crownAltar);

    const sacredCrown = new THREE.Group();
    sacredCrown.position.set(0, 2.55, 0);
    const goldGlow = this.palette.getMat(0xfef08a, 'emissive');
    const rubyGlow = this.palette.getMat(0xf43f5e, 'emissive');
    const emeraldGlow = this.palette.getMat(0x10b981, 'emissive');
    const cBand = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.26, 1.12), altarGoldMat);
    const cHaloGeo = new THREE.TorusGeometry(0.92, 0.06, 8, 24);
    const cHaloMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cHalo = new THREE.Mesh(cHaloGeo, cHaloMat);
    cHalo.rotation.x = Math.PI * 0.5;
    sacredCrown.add(cBand, cHalo);
    [
      [-0.42, 0.42],
      [0.42, 0.42],
      [-0.42, -0.42],
      [0.42, -0.42],
      [0, 0.45],
      [0, -0.45],
    ].forEach(([px, pz], idx) => {
      const spire = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.18), goldGlow);
      spire.position.set(px, 0.3, pz);
      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.11, 0),
        idx % 2 === 0 ? rubyGlow : emeraldGlow,
      );
      gem.position.set(px, 0.56, pz);
      sacredCrown.add(spire, gem);
    });
    crownAltar.add(sacredCrown);

    const shockGeo = new THREE.RingGeometry(0.4, 1.4, 28);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const shockMesh = new THREE.Mesh(shockGeo, shockMat);
    shockMesh.rotation.x = -Math.PI * 0.5;
    shockMesh.position.set(0, 5.75, 25.2);
    shockMesh.visible = false;
    istanaStage.add(shockMesh);
    disposables.push(cHaloGeo, cHaloMat, shockGeo, shockMat);

    // 5c. 8 Royal Palace Lanterns lining the portico & marble stairs (dim down during the storm)
    const lanternPositions: Array<[number, number, number]> = [
      [-8.6, 3.5, 25.4],
      [8.6, 3.5, 25.4],
      [-8.8, 3.5, 31.0],
      [8.8, 3.5, 31.0],
      [-5.2, 0.0, 35.5],
      [5.2, 0.0, 35.5],
      [-5.2, 0.0, 42.5],
      [5.2, 0.0, 42.5],
    ];
    const postMat = this.palette.getMat(0x334155, 'metal');
    const lPostGeo = new THREE.BoxGeometry(0.32, 2.2, 0.32);
    const lCapGeo = new THREE.BoxGeometry(0.75, 0.22, 0.75);
    const lOrbGeo = new THREE.BoxGeometry(0.5, 0.62, 0.5);
    const lHaloGeo = new THREE.SphereGeometry(0.95, 10, 8);
    const palaceLanterns = lanternPositions.map(([lx, ly, lz], li) => {
      const lGroup = new THREE.Group();
      lGroup.position.set(lx, ly, lz);
      const post = new THREE.Mesh(lPostGeo, postMat);
      post.position.y = 1.1;
      const capTop = new THREE.Mesh(lCapGeo, altarGoldMat);
      capTop.position.y = 2.86;
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.8,
        roughness: 0.25,
      });
      const orb = new THREE.Mesh(lOrbGeo, orbMat);
      orb.position.y = 2.42;
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const halo = new THREE.Mesh(lHaloGeo, haloMat);
      halo.position.y = 2.42;
      lGroup.add(post, capTop, orb, halo);
      istanaStage.add(lGroup);
      disposables.push(orbMat, haloMat);
      return { orb, mat: orbMat, halo, haloMat, phase: li * 0.85 };
    });
    disposables.push(lPostGeo, lCapGeo, lOrbGeo, lHaloGeo);

    // 5d. Six gleaming golden Crown Shards bursting out across the sky when Crown shatters
    const shardDirections: Array<[number, number, number]> = [
      [-34, 24, 14],
      [34, 24, 14],
      [-42, 20, 38],
      [42, 20, 38],
      [-22, 28, -10],
      [22, 28, -10],
    ];
    const shardGeo = new THREE.OctahedronGeometry(0.72, 0);
    const shardMat = this.palette.getMat(0xfacc15, 'emissive');
    const crownShards = shardDirections.map(([ex, ey, ez]) => {
      const mesh = new THREE.Mesh(shardGeo, shardMat);
      const startPos = new THREE.Vector3(0, 5.9, 25.2);
      const endPos = new THREE.Vector3(ex, ey, ez);
      mesh.position.copy(startPos);
      mesh.visible = false;
      istanaStage.add(mesh);
      return { mesh, startPos, endPos };
    });
    disposables.push(shardGeo);

    // 5e. 8 Armed Shadow Raiders descending from the Sky Portal to besiege Istana Utara
    const attachShadowWeapon = (monsterMesh: THREE.Group, kind: number) => {
      const mRig = monsterMesh.userData.monsterRig as { rightArm?: THREE.Group; weaponGroup?: THREE.Object3D } | undefined;
      if (mRig?.weaponGroup) return;
      const wGroup = new THREE.Group();
      const darkBladeMat = this.palette.getMat(0x3b0764, 'metal');
      const voidEdgeMat = this.palette.getMat(0xc084fc, 'emissive');
      const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.14), postMat);
      hilt.position.y = -0.35;
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.18), altarGoldMat);
      guard.position.y = -0.1;
      wGroup.add(hilt, guard);
      if (kind % 2 === 0) {
        // Broad Shadow Greatsword
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.55, 0.09), darkBladeMat);
        blade.position.y = 0.72;
        const glowEdge = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.48, 0.12), voidEdgeMat);
        glowEdge.position.y = 0.72;
        wGroup.add(blade, glowEdge);
      } else {
        // Curved Shadow Battleaxe
        const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.45, 0.14), darkBladeMat);
        shaft.position.y = 0.58;
        const axeHead = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.55, 0.14), voidEdgeMat);
        axeHead.position.set(0.25, 1.02, 0);
        wGroup.add(shaft, axeHead);
      }
      wGroup.position.set(0.06, -0.75, 0.25);
      wGroup.rotation.x = Math.PI * 0.42;
      if (mRig?.rightArm) {
        mRig.rightArm.add(wGroup);
      } else {
        wGroup.position.set(0.75, 1.15, 0.35);
        monsterMesh.add(wGroup);
      }
    };

    const raiderConfigs: Array<{
      type: MonsterType;
      rx: number;
      ry: number;
      rz: number;
      sx?: number;
      sy?: number;
      sz?: number;
      isFlier: boolean;
      orbitAngle?: number;
      orbitRadius?: number;
      delay: number;
      phase: number;
    }> = [
      // Lead Captain who drops onto staircase and strikes the Crown Altar!
      { type: 'skeleton_warrior', rx: 0.0, ry: 3.5, rz: 28.6, sx: 0.0, sy: 3.5, sz: 26.8, isFlier: false, delay: 0.7, phase: 0.2 },
      // Ground surround formation on portico & marble steps
      { type: 'thorn_goblin', rx: -6.4, ry: 3.5, rz: 27.6, isFlier: false, delay: 1.0, phase: 1.1 },
      { type: 'skeleton_warrior', rx: 6.4, ry: 3.5, rz: 27.6, isFlier: false, delay: 1.25, phase: 2.0 },
      { type: 'lava_imp', rx: -4.4, ry: 0.0, rz: 33.4, isFlier: false, delay: 1.5, phase: 2.8 },
      { type: 'thorn_goblin', rx: 4.4, ry: 0.0, rz: 33.4, isFlier: false, delay: 1.75, phase: 3.6 },
      // Aerial raiders circling the palace spires & courtyard sky
      { type: 'stone_gargoyle', rx: -11.5, ry: 14.5, rz: 25.0, isFlier: true, orbitAngle: 0.4, orbitRadius: 15.5, delay: 1.1, phase: 1.7 },
      { type: 'shadow_harpy', rx: 11.5, ry: 16.0, rz: 26.0, isFlier: true, orbitAngle: 2.5, orbitRadius: 16.5, delay: 1.4, phase: 3.2 },
      { type: 'giant_phantom', rx: 0.0, ry: 18.5, rz: 18.0, isFlier: true, orbitAngle: 4.5, orbitRadius: 14.0, delay: 1.9, phase: 4.4 },
    ];
    const raiders = raiderConfigs.map((rc, idx) => {
      const mesh = createMonsterMesh(rc.type, this.palette, rc.type === 'giant_phantom' ? 1.25 : 1.12);
      attachShadowWeapon(mesh, idx);
      const spawnPos = new THREE.Vector3(
        (idx % 2 === 0 ? -1 : 1) * (idx * 0.65),
        27.0,
        30.5,
      );
      const raidPos = new THREE.Vector3(rc.rx, rc.ry, rc.rz);
      const strikePos = rc.sx !== undefined ? new THREE.Vector3(rc.sx, rc.sy ?? rc.ry, rc.sz ?? rc.rz) : undefined;
      mesh.position.copy(spawnPos);
      mesh.visible = false;
      istanaStage.add(mesh);
      return {
        mesh,
        type: rc.type,
        spawnPos,
        raidPos,
        strikePos,
        orbitAngle: rc.orbitAngle,
        orbitRadius: rc.orbitRadius,
        hoverY: rc.ry,
        isFlier: rc.isFlier,
        spawnDelay: rc.delay,
        phase: rc.phase,
      };
    });

    // 5f. 10 Luminous English Word Tablets floating over Istana courtyard, snatched into the storm vortex
    const makeWordPlaque = (word: string, keeper: boolean) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 96;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = keeper ? '#064e3b' : '#1e293b';
      ctx.strokeStyle = keeper ? '#fde047' : '#38bdf8';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.roundRect(6, 6, 244, 84, 20);
      ctx.fill();
      ctx.stroke();
      ctx.font = '900 40px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = keeper ? '#fef08a' : '#e0f2fe';
      ctx.fillText(word, 128, 50);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const geo = new THREE.PlaneGeometry(2.5, 0.94);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      disposables.push(tex, geo, mat);
      return { mesh: new THREE.Mesh(geo, mat), mat };
    };

    const wordSpecs: Array<{ word: string; x: number; y: number; z: number; s: number; e: number; keeper?: boolean }> = [
      { word: 'HELLO', x: -7.5, y: 7.4, z: 32.0, s: 4.8, e: 6.7 },
      { word: 'MORNING', x: 7.2, y: 7.8, z: 32.5, s: 5.0, e: 7.0 },
      { word: 'FRIEND', x: -4.2, y: 8.6, z: 27.5, s: 5.2, e: 7.2 },
      { word: 'SMILE', x: 4.4, y: 8.5, z: 28.0, s: 5.4, e: 7.4 },
      { word: 'PEACE', x: -9.8, y: 6.2, z: 37.5, s: 5.6, e: 7.6 },
      { word: 'DREAM', x: 9.6, y: 6.4, z: 37.5, s: 5.8, e: 7.8 },
      { word: 'MUSIC', x: -2.8, y: 9.6, z: 36.0, s: 6.0, e: 8.0 },
      { word: 'STORY', x: 3.1, y: 9.8, z: 36.0, s: 6.2, e: 8.2 },
      { word: 'LIGHT', x: 0.0, y: 10.6, z: 30.5, s: 6.4, e: 8.4 },
      { word: 'HOPE', x: -2.4, y: 7.2, z: 24.4, s: 5.0, e: 8.5, keeper: true },
    ];
    const wordOrbs = wordSpecs.map((ws, wi) => {
      const { mesh, mat } = makeWordPlaque(ws.word, Boolean(ws.keeper));
      const homePos = new THREE.Vector3(ws.x, ws.y, ws.z);
      mesh.position.copy(homePos);
      istanaStage.add(mesh);
      return {
        mesh,
        mat,
        homePos,
        snatchStart: ws.s,
        snatchEnd: ws.e,
        keeper: Boolean(ws.keeper),
        phase: wi * 0.72,
      };
    });

    // 5g. 18 Descending Dark Storm Mist Clouds shrouding Istana Utara & dimming sky
    const mistGeo = new THREE.SphereGeometry(1, 10, 8);
    const darkMists: PrologueCutsceneRig['darkMists'] = [];
    for (let mi = 0; mi < 18; mi++) {
      const ang = (mi / 18) * Math.PI * 2 + (mi % 3) * 0.25;
      const rad = 7.5 + (mi % 4) * 7.2;
      const startPos = new THREE.Vector3(
        Math.cos(ang) * rad,
        24.5 + (mi % 3) * 4.2,
        26.0 + Math.sin(ang) * (rad * 0.72),
      );
      const endPos = new THREE.Vector3(
        Math.cos(ang) * (rad * 0.85),
        4.2 + (mi % 4) * 3.1,
        28.0 + Math.sin(ang) * (rad * 0.62),
      );
      const mistMat = new THREE.MeshBasicMaterial({
        color: mi % 2 === 0 ? 0x0f172a : 0x1e1b4b,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
      });
      const mistMesh = new THREE.Mesh(mistGeo, mistMat);
      const baseScale = 5.4 + (mi % 4) * 2.1;
      mistMesh.position.copy(startPos);
      mistMesh.scale.set(baseScale * 1.4, baseScale * 0.55, baseScale * 1.2);
      istanaStage.add(mistMesh);
      disposables.push(mistMat);
      darkMists.push({
        mesh: mistMesh,
        mat: mistMat,
        startPos,
        endPos,
        phase: mi * 0.65,
        baseScale,
      });
    }
    disposables.push(mistGeo);

    // 6. Giant Boss Monsters looming over the 6 misty islands in Scene 3
    const portalPt = OVERWORLD_ANCHORS.portal;
    const bossSpecs: Array<{ zId: ZoneId; type: MonsterType; phase: number }> = [
      { zId: 'desa_sapaan', type: 'forest_slime', phase: 0.4 },
      { zId: 'pasar_rasa', type: 'magma_elemental', phase: 1.2 },
      { zId: 'hutan_satwa', type: 'ancient_treant', phase: 2.1 },
      { zId: 'gerbang_kota', type: 'iron_juggernaut', phase: 3.0 },
      { zId: 'menara_waktu', type: 'obsidian_hydra', phase: 3.9 },
      { zId: 'gua_portal', type: 'titan_colossus', phase: 4.8 },
    ];
    const bosses = bossSpecs.map((bs) => {
      const za = OVERWORLD_ANCHORS.zones[bs.zId];
      const mesh = createMonsterMesh(bs.type, this.palette, 1.85);
      const gy = getArchipelagoGroundY(za.x, za.z);
      const pos = new THREE.Vector3(za.x, gy, za.z);
      mesh.position.copy(pos);
      mesh.visible = false;
      group.add(mesh);
      return { zId: bs.zId, mesh, type: bs.type, pos, phase: bs.phase };
    });

    // 7. Red Ribbons dropped by Lila along the escape trail to the Purple Gate in Scene 4
    const ribbonCoords: Array<{ x: number; z: number; t: number }> = [
      { x: portalPt.x + 1.8, z: portalPt.z + 24, t: 0.6 },
      { x: portalPt.x + 0.9, z: portalPt.z + 18, t: 1.3 },
      { x: portalPt.x + 0.4, z: portalPt.z + 12, t: 2.0 },
      { x: portalPt.x - 0.2, z: portalPt.z + 7, t: 2.7 },
    ];
    const ribbonRed = this.palette.getMat(0xe11d48, 'emissive');
    const ribbonTrim = this.palette.getMat(0xfda4af, 'emissive');
    const ribbonDrops = ribbonCoords.map((rc) => {
      const rGroup = new THREE.Group();
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 0.14), ribbonRed);
      wingL.position.x = -0.24;
      wingL.rotation.z = 0.22;
      const wingR = wingL.clone();
      wingR.position.x = 0.24;
      wingR.rotation.z = -0.22;
      const knot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), ribbonTrim);
      rGroup.add(wingL, wingR, knot);
      const gy = getArchipelagoGroundY(rc.x, rc.z);
      const pos = new THREE.Vector3(rc.x, gy + 0.75, rc.z);
      rGroup.position.copy(pos);
      rGroup.visible = false;
      group.add(rGroup);
      return { mesh: rGroup, pos, dropTime: rc.t };
    });

    // 8. Scene 5 Night Mist Cloud Corridor & Island-Hopping Owl Search Path ending at Desa Sapaan
    const stageAnchors = this.getOpeningStageAnchors();
    const owlFlightCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(portalPt.x + 10, portalPt.y + 20, portalPt.z + 36),
      new THREE.Vector3(-118, 32, -88), // Gerbang Kota
      new THREE.Vector3(-104, 24, 48),  // Pasar Rasa
      new THREE.Vector3(-4, 24, -14),   // Central Hub & Jembatan
      new THREE.Vector3(118, 29, -72),  // Menara Waktu
      new THREE.Vector3(106, 23, 48),   // Hutan Satwa
      new THREE.Vector3(38, 17, 94),    // Crossing southern bay into last island
      new THREE.Vector3(stageAnchors.owlX - 5.2, stageAnchors.owlY + 5.6, stageAnchors.owlZ - 5.0),
    ]);

    const flightMistGeo = new THREE.SphereGeometry(1, 10, 8);
    const flightMists: PrologueCutsceneRig['flightMists'] = [];
    const mistWaypoints = 22;
    for (let fi = 0; fi < mistWaypoints; fi++) {
      const fu = 0.05 + (fi / (mistWaypoints - 1)) * 0.82;
      const ptOnPath = owlFlightCurve.getPointAt(fu);
      const sideJitter = (fi % 2 === 0 ? 1 : -1) * (2.5 + (fi % 3) * 3.8);
      const heightJitter = ((fi % 3) - 1) * 2.2;
      const basePos = new THREE.Vector3(
        ptOnPath.x + sideJitter,
        ptOnPath.y + heightJitter,
        ptOnPath.z + ((fi % 4) - 1.5) * 3.0,
      );
      const fMat = new THREE.MeshBasicMaterial({
        color: fi % 2 === 0 ? 0x334155 : 0x475569,
        transparent: true,
        opacity: 0.34,
        depthWrite: false,
      });
      const fMesh = new THREE.Mesh(flightMistGeo, fMat);
      const sx = 8.5 + (fi % 4) * 3.2;
      fMesh.position.copy(basePos);
      fMesh.scale.set(sx * 1.45, sx * 0.42, sx * 1.25);
      fMesh.visible = false;
      group.add(fMesh);
      disposables.push(fMat);
      flightMists.push({
        mesh: fMesh,
        mat: fMat,
        basePos,
        phase: fi * 0.78,
      });
    }
    disposables.push(flightMistGeo);

    return {
      group,
      istanaStage,
      king,
      royalCrowd,
      lilaMesh,
      villagers,
      bridgeBeams,
      bridgeLightOrbs,
      skyPortal: {
        group: skyPortalGroup,
        core: portalCore,
        ringOuter,
        ringInner,
        beam: portalBeam,
        beamMat: beamPortalMat,
        bolts: portalBolts,
      },
      crownAltar,
      sacredCrown,
      crownShockwave: { mesh: shockMesh, mat: shockMat },
      palaceLanterns,
      wordOrbs,
      darkMists,
      crownShards,
      raiders,
      bosses,
      ribbonDrops,
      flightMists,
      owlFlightCurve,
      disposables,
      raidPortalSoundFired: false,
      raidShatterFired: false,
      raidStealSoundFired: false,
    };
  }

  private clearVillageAmbushRig(): void {
    const amb = this.villageAmbushState;
    if (!amb) return;
    if (amb.abductor) {
      this.overworldGroup.remove(amb.abductor.mesh);
    }
    for (const n of amb.npcs) {
      this.overworldGroup.remove(n.actor.root);
    }
    for (const cm of amb.cutsceneMonsters) {
      this.overworldGroup.remove(cm.mesh);
    }
    this.villageAmbushState = null;
  }

  private cleanupPrologueStage(keepPrologueMusic = false): void {
    if (!keepPrologueMusic) {
      soundEngine.setPrologueSceneMusic(null);
    }
    const istanaRig = this.archipelagoRig.istanaRig;
    if (this.prologueRig) {
      this.scene.remove(this.prologueRig.group);
      istanaRig.istanaGroup.remove(this.prologueRig.istanaStage);
      for (const disp of this.prologueRig.disposables) {
        disp.dispose();
      }
      this.prologueRig = null;
    }
    istanaRig.istanaDome.visible = true;
    istanaRig.gateGroup.visible = true;
    istanaRig.courtyardNpcs.forEach((c) => {
      c.rig.root.visible = true;
    });
    if (this.savedPrologueWorldTimeTick !== null) {
      this.worldTimeTick = this.savedPrologueWorldTimeTick;
      this.savedPrologueWorldTimeTick = null;
    }
    for (const m of this.overworldAllMonsters) {
      m.mesh.visible = m.alive;
    }
    for (const s of this.shooters) {
      s.mesh.visible = s.alive;
    }
    for (const p of this.villageRig.pillagers) {
      p.root.visible = this.getCurrentDayPhase() === 'malam';
    }
    if (this.villageRig.outpostBanner) {
      this.villageRig.outpostBanner.visible = true;
    }
    this.starterPickupMesh.visible = this.worldMode === 'overworld' && !this.starterWeaponPicked;
    this.swimSuitPickupMesh.visible = this.worldMode === 'overworld' && !this.swimSuitPicked;
    this.refreshAreaMists();
    this.updateOverworldDayNightAtmosphere(0, false);

    // Reset Hero limb transforms cleanly before Owl conversation or playing
    this.hero.body.position.y = 0;
    this.hero.upperBody.rotation.set(0, 0, 0);
    this.hero.headGroup.rotation.set(0, 0, 0);
    this.hero.leftArm.rotation.set(0, 0, 0);
    this.hero.rightArm.rotation.set(0, 0, 0);
    this.hero.leftLeg.rotation.set(0, 0, 0);
    this.hero.rightLeg.rotation.set(0, 0, 0);
  }

  private applyPrologueSceneStep(step: number): void {
    const idx = THREE.MathUtils.clamp(step, 0, PROLOGUE_SCENES.length - 1);
    const spec = PROLOGUE_SCENES[idx];
    this.storyTimer = 0;
    this.worldTimeTick = spec.worldTimeTick;
    soundEngine.setPrologueSceneMusic(idx);

    const istanaRig = this.archipelagoRig.istanaRig;
    if (this.prologueRig) {
      const rig = this.prologueRig;
      const showPeaceful = idx === 0;
      const showRaid = idx === 1;
      const showSilence = idx === 2;
      const showEscape = idx === 3;
      const showOwlFlight = idx === 4;

      rig.istanaStage.visible = showRaid;
      istanaRig.istanaDome.visible = !showRaid;
      istanaRig.gateGroup.visible = !showRaid;
      istanaRig.courtyardNpcs.forEach((c) => {
        c.rig.root.visible = !showRaid;
      });
      rig.raidPortalSoundFired = false;
      rig.raidShatterFired = false;
      rig.raidStealSoundFired = false;

      rig.bridgeBeams.forEach((bm) => {
        bm.visible = showPeaceful;
      });
      rig.bridgeLightOrbs.forEach((o) => {
        o.mesh.visible = showPeaceful;
      });
      rig.royalCrowd.forEach((rc) => {
        rc.mesh.visible = showPeaceful;
      });
      rig.villagers.forEach((v) => {
        v.mesh.visible = showPeaceful;
      });
      rig.crownShards.forEach((sh) => {
        sh.mesh.visible = false;
        sh.mesh.position.copy(sh.startPos);
      });
      rig.raiders.forEach((rd) => {
        rd.mesh.visible = false;
        rd.mesh.position.copy(rd.spawnPos);
      });
      rig.sacredCrown.visible = showRaid;
      rig.crownShockwave.mesh.visible = false;
      rig.skyPortal.group.scale.setScalar(0.05);
      rig.wordOrbs.forEach((w) => {
        w.mesh.visible = showRaid;
        w.mesh.position.copy(w.homePos);
        w.mesh.scale.setScalar(1);
        w.mat.opacity = 0.95;
        w.mat.color.setHex(0xffffff);
      });
      rig.palaceLanterns.forEach((l) => {
        l.mat.emissiveIntensity = 1.9;
        l.haloMat.opacity = 0.34;
        l.halo.scale.setScalar(1);
      });
      rig.darkMists.forEach((dm) => {
        dm.mesh.position.copy(dm.startPos);
        dm.mat.opacity = 0.0;
      });
      rig.bosses.forEach((bs) => {
        bs.mesh.visible = showSilence || (showOwlFlight && bs.zId !== 'desa_sapaan');
      });
      rig.flightMists.forEach((fm) => {
        fm.mesh.visible = showOwlFlight;
      });
      rig.ribbonDrops.forEach((rb) => {
        rb.mesh.visible = false;
      });

      rig.king.root.visible = showPeaceful || showRaid || showEscape;
      rig.king.crown.visible = showPeaceful;
      rig.king.root.scale.setScalar(1.18);
      rig.lilaMesh.visible = showPeaceful || showEscape;
      rig.lilaMesh.scale.setScalar(0.86);

      if (showPeaceful) {
        const hubX = -6.0;
        const hubZ = -2.0;
        rig.king.root.position.set(hubX, getArchipelagoGroundY(hubX, hubZ), hubZ);
        rig.king.root.rotation.y = 0.25;
        this.hero.root.visible = true;
        this.heroPos.set(-11.8, getArchipelagoGroundY(-11.8, 121.0), 121.0);
        this.hero.root.position.copy(this.heroPos);
        this.owlRig.root.visible = false;
        this.camera.position.set(-98, 76, 134);
        this.controls.target.set(0, 8, -10);
      } else if (showRaid) {
        const istanaG = istanaRig.istanaGroup;
        istanaG.updateMatrixWorld(true);
        _v1.set(-2.5, 3.5, 23.8);
        istanaG.localToWorld(_v1);
        rig.king.root.position.copy(_v1);
        rig.king.root.rotation.y = istanaG.rotation.y + 0.12;
        this.hero.root.visible = false;
        this.owlRig.root.visible = false;

        _v1.set(11.5, 7.5, 49.0);
        istanaG.localToWorld(_v1);
        _v2.set(0, 14.0, 24.0);
        istanaG.localToWorld(_v2);
        this.camera.position.copy(_v1);
        this.controls.target.copy(_v2);
      } else if (showSilence) {
        this.hero.root.visible = false;
        this.owlRig.root.visible = false;
        this.camera.position.set(-135, 58, 95);
        this.controls.target.set(-20, 10, -30);
      } else if (showEscape) {
        const pt = OVERWORLD_ANCHORS.portal;
        rig.king.root.position.set(pt.x - 0.8, getArchipelagoGroundY(pt.x - 0.8, pt.z + 22), pt.z + 22);
        rig.lilaMesh.position.set(pt.x + 1.0, getArchipelagoGroundY(pt.x + 1.0, pt.z + 23), pt.z + 23);
        this.hero.root.visible = false;
        this.owlRig.root.visible = true;
        this.owlRig.envelope.visible = true;
        this.owlRig.root.position.set(pt.x + 2.4, pt.y + 3.8, pt.z + 11.0);
        this.camera.position.set(pt.x - 11, pt.y + 7.5, pt.z + 29);
        this.controls.target.set(pt.x, pt.y + 2.6, pt.z + 11);
      } else if (showOwlFlight) {
        const stage = this.getOpeningStageAnchors();
        this.hero.root.visible = true;
        this.heroPos.set(stage.heroX, stage.heroY, stage.heroZ);
        this.heroYaw = Math.atan2(stage.owlX - stage.heroX, stage.owlZ - stage.heroZ);
        this.hero.root.position.copy(this.heroPos);
        this.hero.body.rotation.y = this.heroYaw;
        this.owlRig.root.visible = true;
        this.owlRig.envelope.visible = true;
        rig.owlFlightCurve.getPointAt(0, _v1);
        rig.owlFlightCurve.getTangentAt(0, _forward);
        this.owlRig.root.position.copy(_v1);
        this.owlRig.root.rotation.set(0.14, Math.atan2(_forward.x, _forward.z), 0);
        this.camera.position.set(
          _v1.x - _forward.x * 13 + _forward.z * 5,
          _v1.y + 5.5,
          _v1.z - _forward.z * 13 - _forward.x * 5,
        );
        this.controls.target.set(_v1.x + _forward.x * 18, _v1.y - 4.0, _v1.z + _forward.z * 18);
      }
      this.controls.update();
    }

    this.storyDialog = {
      kind: 'prologue',
      step: idx,
      maxStep: PROLOGUE_SCENES.length - 1,
      sceneTitle: spec.sceneTitle,
      speakerName: 'Kisah Kerajaan Kata',
      speakerRole: `Adegan ${idx + 1} dari ${PROLOGUE_SCENES.length}`,
      textEn: spec.textEn,
      textId: spec.textId,
      accentColor: spec.accentColor,
    };
    this.updateOverworldDayNightAtmosphere(0, false);
    this.pushHud(true);
  }

  private startOpeningPrologue(): void {
    this.phase = 'story';
    this.heldKeys.clear();
    this.applyCameraVisibilityAndControls();
    if (this.savedPrologueWorldTimeTick === null) {
      this.savedPrologueWorldTimeTick = this.worldTimeTick;
    }
    this.prologueRig = this.buildPrologueStage();
    this.starterPickupMesh.visible = false;
    this.swimSuitPickupMesh.visible = false;
    this.applyPrologueSceneStep(0);
  }

  private getOpeningStageAnchors(): {
    heroX: number;
    heroY: number;
    heroZ: number;
    owlX: number;
    owlY: number;
    owlZ: number;
  } {
    const sp = OVERWORLD_ANCHORS.desaSpawn;
    const heroY = getArchipelagoGroundY(sp.x, sp.z);
    const fx = Math.sin(sp.yaw);
    const fz = Math.cos(sp.yaw);
    const owlX = sp.x + fx * 3.15;
    const owlZ = sp.z + fz * 3.15;
    const owlGroundY = getArchipelagoGroundY(owlX, owlZ);
    const owlY = Math.max(heroY, owlGroundY) + 2.25;
    return {
      heroX: sp.x,
      heroY,
      heroZ: sp.z,
      owlX,
      owlY,
      owlZ,
    };
  }

  private startOpeningStory(): void {
    this.cleanupPrologueStage(true);
    this.phase = 'story';
    this.applyCameraVisibilityAndControls();
    this.storyTimer = 0;
    this.owlState = 'fly';
    this.hero.root.visible = true;

    const stage = this.getOpeningStageAnchors();
    this.heroPos.set(stage.heroX, stage.heroY, stage.heroZ);
    this.heroYaw = Math.atan2(stage.owlX - stage.heroX, stage.owlZ - stage.heroZ);
    this.hero.root.position.copy(this.heroPos);
    this.hero.body.rotation.y = this.heroYaw;

    this.owlRig.root.visible = true;
    this.owlRig.envelope.visible = true;
    this.owlRig.root.position.set(stage.owlX - 6.5, stage.owlY + 6.5, stage.owlZ - 5.5);
    this.owlRig.root.rotation.set(
      0,
      Math.atan2(stage.heroX - stage.owlX, stage.heroZ - stage.owlZ),
      0,
    );

    // Snap side-angle camera immediately so player & hovering owl are visible in profile/3-quarter view
    const dx = stage.owlX - stage.heroX;
    const dz = stage.owlZ - stage.heroZ;
    const dist = Math.hypot(dx, dz) || 1;
    const toOwlX = dx / dist;
    const toOwlZ = dz / dist;
    const sideX = -toOwlZ;
    const sideZ = toOwlX;
    const midX = (stage.heroX + stage.owlX) * 0.5;
    const midZ = (stage.heroZ + stage.owlZ) * 0.5;
    this.controls.target.set(midX, stage.heroY + 1.05, midZ);
    this.camera.position.set(
      midX + sideX * 5.6 - toOwlX * 0.6,
      stage.heroY + 2.95,
      midZ + sideZ * 5.6 - toOwlZ * 0.6,
    );
    this.controls.update();

    this.storyDialog = {
      kind: 'opening',
      step: 0,
      speakerName: 'Burung Hantu Pembawa Pesan',
      speakerRole: 'Utusan Istana · Desa Sapaan',
      speakerKind: 'owl',
      speakerSide: 'npc',
      textEn: 'Hoot! I finally found you! Tonight, armed shadow monsters raided the Northern Palace, shattered the Royal Crown into six shards, and stole English words across the islands!',
      textId: 'Hoot! Akhirnya aku menemukanmu! Malam ini gerombolan monster bayangan bersenjata menyerbu Istana Utara Kerajaan Kata, memecah Mahkota Kerajaan menjadi enam keping, dan merampas kata-kata Bahasa Inggris di seluruh kepulauan!',
      accentColor: '#f59e0b',
    };
    soundEngine.playDoor();
    this.pushHud(true);
  }

  public advanceStory(): void {
    if (!this.storyDialog) return;

    if (this.storyDialog.kind === 'prologue') {
      const nextStep = this.storyDialog.step + 1;
      if (nextStep < PROLOGUE_SCENES.length) {
        soundEngine.playDoor();
        this.applyPrologueSceneStep(nextStep);
      } else {
        this.startOpeningStory();
      }
      return;
    }

    if (this.storyDialog.kind === 'opening') {
      const nextStep = this.storyDialog.step + 1;
      if (nextStep === 1) {
        // Burung Hantu menyampaikan isi surat bersampul merah dari Lila (orang ke-3)
        this.owlState = 'land';
        this.owlRig.envelope.visible = false;
        this.storyDialog = {
          kind: 'opening',
          step: 1,
          speakerName: 'Burung Hantu (Kabar Adikmu Lila)',
          speakerRole: 'Menyampaikan Surat Bersampul Merah',
          speakerKind: 'owl',
          speakerSide: 'npc',
          textEn: 'I carry a red-sealed letter from your sister Lila. She wanted you to know that when the monsters attacked, she and Raja Aksara took shelter behind the Purple Gate on the northernmost island, and she is waiting for you there.',
          textId: 'Aku membawa surat bersampul merah dari adikmu, Lila. Ia berpesan agar kamu tetap tenang, karena saat serangan terjadi ia dan Raja Aksara berhasil berlindung di balik Pintu Ungu di pulau paling utara, dan kini ia menunggumu di sana.',
          accentColor: '#e11d48',
        };
        soundEngine.speakEnglish('Your sister Lila is safe behind the Purple Gate and waiting for you!');
      } else if (nextStep === 2) {
        // Burung Hantu menyampaikan amanat Raja Aksara (orang ke-3)
        this.owlState = 'land';
        this.storyDialog = {
          kind: 'opening',
          step: 2,
          speakerName: 'Burung Hantu (Titah Raja Aksara)',
          speakerRole: 'Menyampaikan Amanat Kerajaan',
          speakerKind: 'owl',
          speakerSide: 'npc',
          textEn: 'Raja Aksara also asked me to tell you this: very few words remain in the palace, while six crown shards are scattered across six islands guarded by mighty bosses. Baginda asks you to free every island starting from Desa Sapaan!',
          textId: 'Raja Aksara juga memintaku menyampaikan bahwa kini hanya tersisa sedikit kata di istana, sementara enam pecahan mahkota tersebar di enam pulau dan dijaga monster bos besar, sehingga Baginda memintamu membebaskan keenam pulau dimulai dari Desa Sapaan.',
          accentColor: '#8b5cf6',
        };
        soundEngine.speakEnglish('Raja Aksara asks you to recover all six crown shards across six islands!');
      } else if (nextStep === 3) {
        // Player merespons Burung Hantu secara langsung
        this.owlState = 'land';
        this.storyDialog = {
          kind: 'opening',
          step: 3,
          speakerName: 'Hoot',
          speakerRole: 'Penjelajah Nusantara Kata',
          speakerKind: 'hero',
          speakerSide: 'hero',
          textEn: 'Got it! Thank you for bringing news from Lila and Raja Aksara. I will recover all six crown shards and rescue them!',
          textId: 'Baiklah! Terima kasih sudah mengantarkan kabar dari Lila dan Raja Aksara. Aku siap berangkat membebaskan seluruh pulau dan menyelamatkan mereka!',
          accentColor: '#10b981',
        };
      } else if (nextStep === 4) {
        // Burung Hantu memberi petunjuk awal sebelum terbang pergi
        this.owlState = 'land';
        this.storyDialog = {
          kind: 'opening',
          step: 4,
          speakerName: 'Burung Hantu Pembawa Pesan',
          speakerRole: 'Petunjuk Awal · Desa Sapaan',
          speakerKind: 'owl',
          speakerSide: 'npc',
          textEn: 'You have no weapon yet! Pick up the Starter Weapon in the grass on the left side of this village square, talk to the village guardian, and collect Lila’s 6 red ribbons across the islands. Good luck!',
          textId: 'Bagus, tapi kamu belum memegang senjata! Ambil Senjata Pemula yang terjatuh di sebelah kiri alun-alun desa ini, temui penjaga desa, lalu kumpulkan 6 pita merah milik Lila di tiap pulau. Aku terbang duluan, Hoot!',
          accentColor: '#10b981',
        };
      } else {
        this.finishOpeningStory(false);
      }
      this.pushHud(true);
      return;
    }

    if (this.storyDialog.kind === 'village_ambush') {
      this.finishVillageAmbushCutscene();
      return;
    }

    if (this.storyDialog.kind === 'village_rescue_talk') {
      const nextStep = this.storyDialog.step + 1;
      if (nextStep === 1) {
        this.storyDialog = {
          kind: 'village_rescue_talk',
          step: 1,
          maxStep: 2,
          speakerName: 'Laras & Bagas (Warga Desa)',
          speakerRole: 'Petunjuk & Arah ke Penjaga Pulau',
          speakerKind: 'captive',
          captiveKind: 'girl',
          captiveColor: 0xf472b6,
          speakerSide: 'npc',
          textEn:
            'Since the dark fog spread across the archipelago, everyone hid indoors and the village doors lost their greeting words! Come with us now—we will lead you straight to the Desa Sapaan Island Guardian!',
          textId:
            'Sejak kabut pekat menyelimuti pulau ini, semua warga sembunyi di dalam rumah dan pintu-pintu kehilangan kata sapaannya! Ayo ikut kami sekarang—kami antar kamu langsung menemui Penjaga Pulau Desa Sapaan!',
          accentColor: '#f59e0b',
        };
        soundEngine.playPick();
        this.pushHud(true);
      } else if (nextStep === 2) {
        this.storyDialog = {
          kind: 'village_rescue_talk',
          step: 2,
          maxStep: 2,
          speakerName: 'Hoot',
          speakerRole: 'Penjelajah Nusantara Kata',
          speakerKind: 'hero',
          speakerSide: 'hero',
          textEn:
            'I am glad you two are safe! I will rescue our kidnapped neighbor and free every island. Lead the way to the Island Guardian!',
          textId:
            'Syukurlah kalian selamat! Aku pasti menemukan warga yang diculik itu dan membebaskan seluruh pulau. Ayo antarkan aku menemui Penjaga Pulau sekarang!',
          accentColor: '#10b981',
        };
        soundEngine.playPick();
        this.pushHud(true);
      } else {
        this.startVillageRescueEscort();
      }
      return;
    }

    if (this.storyDialog.kind === 'village_rescue_escort') {
      this.finishVillageRescueEscort();
      return;
    }

    if (this.storyDialog.kind === 'dungeon_intro') {
      const zId = this.storyDialog.zoneId!;
      const story = ZONE_CAVE_STORIES[zId];
      const nextStep = this.storyDialog.step + 1;
      if (nextStep < story.introSteps.length) {
        const s = story.introSteps[nextStep];
        this.storyDialog = {
          kind: 'dungeon_intro',
          step: nextStep,
          zoneId: zId,
          speakerName: s.speakerName,
          speakerRole: s.speakerRole,
          textEn: s.textEn,
          textId: s.textId,
          accentColor: story.accentColor,
          speakerKind: 'npc',
          speakerNpcId: story.guardianId,
          speakerSide: 'npc',
        };
        if (zId !== 'gua_portal' || nextStep !== 1) {
          soundEngine.speakEnglish(s.textEn);
        }
        this.pushHud(true);
      } else {
        this.finishDungeonIntroCutscene();
      }
      return;
    }

    if (this.storyDialog.kind === 'cave_guardian') {
      const nextStep = this.storyDialog.step + 1;
      if (nextStep < this.caveGuardianTurns.length) {
        const zId = this.storyDialog.zoneId!;
        const story = ZONE_CAVE_STORIES[zId];
        const turn = this.caveGuardianTurns[nextStep];
        this.storyDialog = {
          kind: 'cave_guardian',
          step: nextStep,
          maxStep: this.caveGuardianTurns.length - 1,
          zoneId: zId,
          speakerName: turn.speakerName,
          speakerRole: turn.speakerRole,
          textEn: turn.textEn,
          textId: turn.textId,
          accentColor: story.accentColor,
          speakerKind: turn.speakerSide === 'hero' ? 'hero' : 'npc',
          speakerNpcId: story.guardianId,
          speakerSide: turn.speakerSide,
        };
        this.pushHud(true);
      } else {
        this.storyDialog = null;
        this.caveGuardianTurns = [];
        this.phase = 'playing';
        this.applyCameraVisibilityAndControls();
        this.snapCameraBehindHero();
        this.pushHud(true);
      }
      return;
    }

    if (this.storyDialog.kind === 'dungeon_rescue') {
      const zId = this.storyDialog.zoneId!;
      const story = ZONE_CAVE_STORIES[zId];
      const boss = BOSSES[zId];
      const rb = RIBBONS[zId];
      const wDef = WEAPONS[boss.rewardWeapon];
      const nextStep = this.storyDialog.step + 1;

      if (nextStep === 1) {
        if (this.dungeonRig) {
          this.dungeonRig.guardianAuraMat.color.setHex(0x22c55e);
        }
        this.storyDialog = {
          kind: 'dungeon_rescue',
          step: 1,
          zoneId: zId,
          speakerName: `${story.guardianName} (Suara Pulih!)`,
          speakerRole: `Penjaga ${ZONE_INFO[zId].name} · Reuni Keluarga`,
          textEn: story.rescueGuardianEn,
          textId: story.rescueGuardianId,
          accentColor: '#10b981',
          speakerKind: 'npc',
          speakerNpcId: story.guardianId,
          speakerSide: 'npc',
        };
        soundEngine.playWin();
        soundEngine.speakEnglish(story.rescueGuardianEn);
        this.pushHud(true);
      } else if (nextStep === 2) {
        this.finalizeDungeonLiberation(zId);
        this.storyDialog = {
          kind: 'dungeon_rescue',
          step: 2,
          zoneId: zId,
          speakerName: 'Hoot',
          speakerRole: `${ZONE_INFO[zId].name} Bebas · Pecahan Mahkota ${rb.number}/6`,
          textEn: `Area liberated! Earned Crown Shard #${rb.number}/6, ${RELICS[boss.rewardRelic].name}, and ${wDef.name}!`,
          textId: `${story.captiveName} kembali bersama ${story.guardianName}! Gua kini terang benderang dan bebas dari bayangan monster.`,
          accentColor: '#e11d48',
          speakerKind: 'hero',
          speakerSide: 'hero',
          ribbonName: rb.name,
          ribbonQuote: rb.quote,
          rewardSummary: `Pecahan Mahkota #${rb.number}/6 · ${RELICS[boss.rewardRelic].name} · ${wDef.name} (+Peluru) · +5 💎 · +180 XP`,
        };
        soundEngine.playFanfare();
        this.pushHud(true);
      } else {
        this.finishDungeonRescueCutscene(zId);
      }
      return;
    }

    if (this.storyDialog.kind === 'area_cleared') {
      this.storyDialog = null;
      this.phase = 'playing';
      this.applyCameraVisibilityAndControls();
      this.pushHud(true);
      return;
    }
  }

  public skipStory(): void {
    if (!this.storyDialog) return;
    if (this.storyDialog.kind === 'prologue') {
      this.cleanupPrologueStage();
      this.finishOpeningStory(true);
    } else if (this.storyDialog.kind === 'opening') {
      this.finishOpeningStory(true);
    } else if (this.storyDialog.kind === 'owl_depart') {
      this.startVillageAmbushCutscene();
    } else if (this.storyDialog.kind === 'village_ambush') {
      this.finishVillageAmbushCutscene();
    } else if (this.storyDialog.kind === 'village_rescue_talk') {
      this.startVillageRescueEscort();
    } else if (this.storyDialog.kind === 'village_rescue_escort') {
      this.finishVillageRescueEscort();
    } else if (this.storyDialog.kind === 'dungeon_intro') {
      this.finishDungeonIntroCutscene();
    } else if (this.storyDialog.kind === 'dungeon_rescue') {
      this.finishDungeonRescueCutscene(this.storyDialog.zoneId);
    } else if (this.storyDialog.kind === 'cave_guardian') {
      this.storyDialog = null;
      this.caveGuardianTurns = [];
      this.phase = 'playing';
      this.applyCameraVisibilityAndControls();
      this.snapCameraBehindHero();
      this.pushHud(true);
    }
  }

  public skipOpeningStory(): void {
    this.skipStory();
  }

  private startDungeonIntroCutscene(zoneId: ZoneId): void {
    const story = ZONE_CAVE_STORIES[zoneId];
    const s0 = story.introSteps[0];
    this.phase = 'story';
    this.heldKeys.clear();
    this.applyCameraVisibilityAndControls();
    this.storyTimer = 0;

    this.heroPos.set(0, 0, 16.2);
    this.cutsceneStartPos.set(0, 0, 16.2);
    this.cutsceneTargetPos.set(2.4, 0, 12.6);
    this.heroYaw = Math.atan2(2.4, 12.6 - 16.2);
    this.hero.root.position.copy(this.heroPos);
    this.hero.body.rotation.y = this.heroYaw;

    this.camera.position.set(-2.2, 4.0, 18.2);
    this.controls.target.set(2.8, 1.8, 12.4);
    this.controls.update();

    this.storyDialog = {
      kind: 'dungeon_intro',
      step: 0,
      zoneId,
      speakerName: s0.speakerName,
      speakerRole: s0.speakerRole,
      textEn: s0.textEn,
      textId: s0.textId,
      accentColor: story.accentColor,
    };
    soundEngine.playDoor();
    this.pushHud(true);
  }

  private finishDungeonIntroCutscene(): void {
    const zId = this.storyDialog?.zoneId || this.dungeonState?.zoneId;
    if (zId) this.caveIntrosSeen.add(zId);
    this.storyDialog = null;
    this.phase = 'playing';
    this.heroPos.set(2.4, 0, 12.6);
    this.heroVel.set(0, 0, 0);
    this.heroVelY = 0;
    this.heroOnGround = true;
    this.hero.root.position.copy(this.heroPos);
    this.hero.leftLeg.rotation.x = 0;
    this.hero.rightLeg.rotation.x = 0;
    this.hero.leftArm.rotation.set(0, 0, 0);
    this.hero.rightArm.rotation.set(0, 0, 0);
    this.hero.upperBody.rotation.set(0, 0, 0);
    this.hero.headGroup.rotation.set(0, 0, 0);
    this.hero.body.position.y = 0;
    this.applyCameraVisibilityAndControls();
    this.snapCameraBehindHero();
    this.saveProgress();
    if (zId) {
      const st = ZONE_CAVE_STORIES[zId];
      this.showBanner(
        `Misi Gua ${ZONE_INFO[zId].name}: Buka 5 Pintu, kalahkan Bos, ambil Kunci Penjara & selamatkan ${st.captiveName}!`,
        4.8,
      );
    }
    soundEngine.playBuild();
    this.pushHud(true);
  }

  private startDungeonRescueCutscene(zoneId: ZoneId): void {
    const story = ZONE_CAVE_STORIES[zoneId];
    this.phase = 'story';
    this.heldKeys.clear();
    this.applyCameraVisibilityAndControls();
    this.storyTimer = 0;

    if (this.dungeonRig) {
      this.dungeonRig.prisonBars.visible = false;
      this.dungeonRig.group.add(this.dungeonRig.captiveMesh);
      this.dungeonRig.captiveMesh.position.set(3.3, 0, 11.8);
      this.dungeonRig.captiveMesh.rotation.y = -0.35;
    }
    this.heroPos.set(2.1, 0, 13.5);
    this.heroYaw = Math.atan2(3.8 - 2.1, 11.8 - 13.5);
    this.hero.root.position.copy(this.heroPos);
    this.hero.body.rotation.y = this.heroYaw;
    this.camera.position.set(0.4, 3.2, 16.8);
    this.controls.target.set(3.4, 1.7, 12.1);
    this.controls.update();

    this.storyDialog = {
      kind: 'dungeon_rescue',
      step: 0,
      zoneId,
      speakerName: story.captiveName,
      speakerRole: `${story.captiveRole} · Terbebas dari Penjara!`,
      textEn: story.rescueCaptiveEn,
      textId: story.rescueCaptiveId,
      accentColor: story.accentColor,
    };
    soundEngine.playFanfare();
    soundEngine.speakEnglish(story.rescueCaptiveEn);
    this.pushHud(true);
  }

  private finalizeDungeonLiberation(zoneId: ZoneId): void {
    const boss = BOSSES[zoneId];
    const wDef = WEAPONS[boss.rewardWeapon];
    this.defeatedBossZones.add(zoneId);
    const prevProg = this.zoneCaveProgress[zoneId];
    const safeTotal = prevProg ? prevProg.total : 9 + DIFF_CONFIG[this.settings.difficulty].maxShooters;
    this.zoneCaveProgress[zoneId] = { defeated: safeTotal, remaining: 0, total: safeTotal };
    if (!this.liberatedZones.has(zoneId)) {
      this.liberatedZones.add(zoneId);
      this.ribbons.add(zoneId);
      this.ownedRelics.add(boss.rewardRelic);
      this.ownedWeapons.add(boss.rewardWeapon);
      this.weaponAmmo[boss.rewardWeapon] = Math.min(
        MAX_AMMO,
        (this.weaponAmmo[boss.rewardWeapon] || 0) + wDef.packSize,
      );
      this.activeWeapon = boss.rewardWeapon;
      const eqIdx = WEAPON_ORDER.indexOf(boss.rewardWeapon);
      if (eqIdx >= 0) this.activeHotbarSlot = eqIdx;
      this.hp = this.maxHp;
      this.diamonds += 5;
      this.gainXp(180);
      this.addScore(1200);

      const q = this.quests.find((item) => item.zoneId === zoneId);
      if (q) {
        q.accepted = true;
        q.progress = q.target;
        q.claimed = true;
      }
      this.checkAreaTrophy(zoneId);
      this.refreshWeaponVisual();
      this.refreshAreaMists();
      this.localMabarStats.zonesCleared = this.liberatedZones.size;
      this.emitProgressSync();
    }

    if (this.dungeonState && this.dungeonState.zoneId === zoneId) {
      this.dungeonState.bossDefeated = true;
      this.dungeonState.prisonKeySpawned = false;
      this.dungeonState.prisonKeyCollected = true;
      this.dungeonState.prisonUnlocked = true;
      this.dungeonState.liberated = true;
    }
    if (this.dungeonRig) {
      this.dungeonRig.prisonBars.visible = false;
      this.dungeonRig.prisonKeyGroup.visible = false;
      this.dungeonRig.guardianAuraMat.color.setHex(0x22c55e);
      this.dungeonRig.group.add(this.dungeonRig.captiveMesh);
      this.dungeonRig.captiveMesh.position.set(3.3, 0, 11.8);
      this.dungeonRig.captiveMesh.rotation.y = -0.35;
    }
    this.applyAtmosphere('dungeon', zoneId, true);
  }

  private finishDungeonRescueCutscene(zoneId?: ZoneId): void {
    const zId = zoneId || this.storyDialog?.zoneId || this.dungeonState?.zoneId;
    if (zId) {
      this.finalizeDungeonLiberation(zId);
    }
    this.storyDialog = null;
    this.phase = 'playing';
    this.heroPos.set(2.1, 0, 13.5);
    this.heroVel.set(0, 0, 0);
    this.heroVelY = 0;
    this.heroOnGround = true;
    this.hero.root.position.copy(this.heroPos);
    this.applyCameraVisibilityAndControls();
    this.snapCameraBehindHero();
    this.saveProgress();
    if (zId) {
      const rb = RIBBONS[zId];
      const boss = BOSSES[zId];
      this.spawnBurst(3.8, 2.2, 11.8, 0x34d399, 36);
      this.showBanner(
        `🎉 ${ZONE_INFO[zId].name} Bebas! Dapat Pecahan Mahkota #${rb.number}/6, ${RELICS[boss.rewardRelic].name}, & ${WEAPONS[boss.rewardWeapon].name}!`,
        5.0,
      );
    }
    this.pushHud(true);
  }

  private finishOpeningStory(skipped: boolean): void {
    if (skipped) {
      this.cleanupPrologueStage();
      this.clearVillageAmbushRig();
      this.hero.root.visible = true;
      this.introDone = true;
      this.storyDialog = null;
      this.owlState = 'leave';
      this.owlRig.root.rotation.set(0, Math.PI * 0.45, 0);
      this.storyTimer = 0;
      this.phase = 'playing';
      const sp = OVERWORLD_ANCHORS.desaSpawn;
      this.heroPos.set(sp.x, getArchipelagoGroundY(sp.x, sp.z), sp.z);
      this.savedOverworldHeroPos.copy(this.heroPos);
      this.heroYaw = sp.yaw;
      this.hero.root.position.copy(this.heroPos);
      this.hero.body.rotation.y = this.heroYaw;
      this.applyCameraVisibilityAndControls();
      this.snapCameraBehindHero();
      this.saveProgress();
      this.showBanner(
        '🎯 Misi Awal (Desa Sapaan): Ikuti cahaya biru di kiri desa untuk ambil Senjata Pemula!',
        5.0,
      );
      soundEngine.playBuild();
      this.pushHud(true);
      return;
    }

    // Burung Hantu terbang kembali setelah percakapan penyampaian surat, sambil BGM scene_5.mp3 tetap mengalun
    this.cleanupPrologueStage(true);
    this.hero.root.visible = true;
    this.introDone = true;
    this.owlState = 'leave_to_ambush';
    this.owlRig.root.visible = true;
    this.owlRig.envelope.visible = false;
    this.owlRig.root.rotation.set(-0.18, Math.PI * 0.25, 0);
    this.storyTimer = 0;
    this.phase = 'story';
    this.storyDialog = {
      kind: 'owl_depart',
      step: 0,
      speakerName: 'Burung Hantu Pembawa Pesan',
      speakerRole: 'Terbang Kembali',
      textEn: '',
      textId: '',
      accentColor: '#f59e0b',
    };
    this.pushHud(true);
  }

  private startVillageAmbushCutscene(): void {
    this.clearVillageAmbushRig();
    this.owlRig.root.visible = false;
    this.owlState = 'hidden';
    this.phase = 'story';
    this.heldKeys.clear();
    this.applyCameraVisibilityAndControls();
    this.storyTimer = 0;

    // Putar scene_2.mp3 tepat saat serangan monster di depan mata pemain dimulai
    soundEngine.setPrologueSceneMusic(1);
    soundEngine.playMonster();

    const sp = OVERWORLD_ANCHORS.desaSpawn;
    this.heroPos.set(sp.x, getArchipelagoGroundY(sp.x, sp.z), sp.z);
    this.savedOverworldHeroPos.copy(this.heroPos);
    this.heroYaw = sp.yaw;
    this.hero.root.visible = true;
    this.hero.root.position.copy(this.heroPos);
    this.hero.body.rotation.y = this.heroYaw;

    this.starterPickupMesh.visible = this.worldMode === 'overworld' && !this.starterWeaponPicked;

    const npcConfigs: Array<{
      id: string;
      archetype: 'village_kid' | 'florist_girl' | 'farmer_boy';
      role: 'abducted' | 'survivor';
      x: number;
      z: number;
      loopCenter: [number, number];
      homeDoor: [number, number];
      orbitPhase: number;
      speed: number;
      shoutCutscene: string;
      shoutLive: string;
    }> = [
      {
        id: 'ambush_npc_abducted',
        archetype: 'village_kid',
        role: 'abducted',
        x: -1.2,
        z: 117.2,
        loopCenter: [-1.2, 117.2],
        homeDoor: [-14.0, 118.0],
        orbitPhase: 0.2,
        speed: 4.5,
        shoutCutscene: '😱 Tolooong!! Monster terbang menyambar!',
        shoutLive: '😱 Tolooong!!',
      },
      {
        id: 'ambush_npc_survivor_1',
        archetype: 'florist_girl',
        role: 'survivor',
        x: -3.6,
        z: 114.2,
        loopCenter: [-3.2, 115.4],
        homeDoor: [-14.0, 118.0],
        orbitPhase: 1.4,
        speed: 4.9,
        shoutCutscene: '😭 Tolong!! Monster mengejar kami!',
        shoutLive: '🆘 Tolong! Cepat habisi monster itu!',
      },
      {
        id: 'ambush_npc_survivor_2',
        archetype: 'farmer_boy',
        role: 'survivor',
        x: 3.1,
        z: 115.6,
        loopCenter: [2.8, 114.8],
        homeDoor: [11.5, 109.0],
        orbitPhase: 3.6,
        speed: 5.0,
        shoutCutscene: '😱 Selamatkan kami!! Tolooong!!',
        shoutLive: '⚠️ Ambil senjata di kiri & selamatkan kami!',
      },
    ];

    const npcs = npcConfigs.map((cfg) => {
      const actor = createVillagerMesh(this.palette, cfg.archetype);
      const gy = getArchipelagoGroundY(cfg.x, cfg.z);
      actor.x = cfg.x;
      actor.z = cfg.z;
      actor.root.position.set(cfg.x, gy, cfg.z);
      this.overworldGroup.add(actor.root);
      return {
        id: cfg.id,
        actor,
        x: cfg.x,
        y: gy,
        z: cfg.z,
        yaw: 0,
        role: cfg.role,
        alive: true,
        sheltering: false,
        homeDoor: cfg.homeDoor,
        loopCenter: cfg.loopCenter,
        orbitPhase: cfg.orbitPhase,
        speed: cfg.speed,
        shoutCutscene: cfg.shoutCutscene,
        shoutLive: cfg.shoutLive,
      };
    });

    // Monster terbang penculik 1 NPC ke langit
    const abductorMesh = createMonsterMesh('stone_gargoyle', this.palette);
    abductorMesh.scale.setScalar(1.12);
    abductorMesh.position.set(-2.5, 13.5, 101.0);
    this.overworldGroup.add(abductorMesh);

    // 2 Monster darat yang terus menyerang 2 NPC lainnya di depan pemain
    const attackerConfigs: Array<{ type: MonsterType; x: number; z: number; targetNpcIdx: number; phase: number }> = [
      { type: 'thorn_goblin', x: -6.2, z: 109.0, targetNpcIdx: 1, phase: 0.4 },
      { type: 'dire_wolf', x: 5.8, z: 109.5, targetNpcIdx: 2, phase: 2.1 },
    ];
    const cutsceneMonsters = attackerConfigs.map((ac) => {
      const mesh = createMonsterMesh(ac.type, this.palette);
      const gy = getArchipelagoGroundY(ac.x, ac.z);
      mesh.position.set(ac.x, gy + MONSTER_SPECS[ac.type].hoverY, ac.z);
      this.overworldGroup.add(mesh);
      return {
        mesh,
        type: ac.type,
        x: ac.x,
        y: gy + MONSTER_SPECS[ac.type].hoverY,
        z: ac.z,
        yaw: 0,
        targetNpcIdx: ac.targetNpcIdx,
        patrolPhase: ac.phase,
      };
    });

    this.villageAmbushState = {
      active: true,
      inCutscene: true,
      resolved: false,
      stage: 'ambush',
      timer: 0,
      abductedStartPos: new THREE.Vector3(npcConfigs[0].x, getArchipelagoGroundY(npcConfigs[0].x, npcConfigs[0].z), npcConfigs[0].z),
      abductor: {
        mesh: abductorMesh,
        x: -2.5,
        y: 13.5,
        z: 101.0,
        yaw: 0,
        active: true,
      },
      npcs,
      cutsceneMonsters,
    };

    const camStartX = this.heroPos.x - 2.6;
    const camStartY = this.heroPos.y + 4.2;
    const camStartZ = this.heroPos.z + 5.2;
    this.camera.position.set(camStartX, camStartY, camStartZ);
    this.controls.target.set(-0.8, this.heroPos.y + 2.2, 114.8);
    this.controls.update();

    this.storyDialog = {
      kind: 'village_ambush',
      step: 0,
      sceneTitle: 'Desa Sapaan Diserang!',
      speakerName: '⚠️ Desa Sapaan Diserang!',
      speakerRole: 'Warga Dikejar Monster',
      textEn: 'A flying monster abducted one villager into the sky! Press Mulai Main, grab the Starter Weapon on the left, and defeat the monsters chasing the two remaining villagers!',
      textId: 'Satu warga baru saja dibawa terbang monster ke langit hingga menghilang! Dua warga lainnya masih diserang monster tepat di depanmu — tekan Mulai Main, segera ambil Senjata Pemula di sebelah kiri dan habisi monster-monster itu!',
      accentColor: '#ef4444',
    };
    this.pushHud(true);
  }

  private finishVillageAmbushCutscene(): void {
    soundEngine.setPrologueSceneMusic(null);
    const amb = this.villageAmbushState;
    if (amb && amb.inCutscene) {
      amb.inCutscene = false;
      // Ubah monster penyerang cutscene menjadi monster pertarungan NYATA di depan pemain!
      for (let i = 0; i < amb.cutsceneMonsters.length; i++) {
        const cm = amb.cutsceneMonsters[i];
        this.overworldGroup.remove(cm.mesh);
        const spec = MONSTER_SPECS[cm.type];
        const mesh = createMonsterMesh(cm.type, this.palette);
        const groundY = getArchipelagoGroundY(cm.x, cm.z);
        const sy = groundY + spec.hoverY;
        mesh.position.set(cm.x, sy, cm.z);
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.85 * spec.baseScale, 1.15 * spec.baseScale, 20),
          new THREE.MeshBasicMaterial({
            color: 0xef4444,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
          }),
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.06 - spec.hoverY;
        mesh.add(ring);
        mesh.userData.combatRing = ring;

        this.nightMonsterSeq += 1;
        const mId = `ambush_${Date.now()}_${i}_${this.nightMonsterSeq}`;
        mesh.userData.monsterId = mId;
        this.overworldGroup.add(mesh);
        this.overworldClickables.push(mesh);

        this.monsters.push({
          id: mId,
          type: cm.type,
          name: spec.name,
          zoneId: 'desa_sapaan',
          homeX: cm.x,
          homeZ: cm.z,
          x: cm.x,
          y: sy,
          z: cm.z,
          maxHp: spec.quizHp,
          mobHp: 2,
          maxMobHp: 2,
          rewardXp: spec.rewardXp,
          rewardDiamonds: spec.rewardDiamonds,
          rewardScore: spec.rewardScore,
          combatOnly: true,
          isVillageAmbushTarget: true,
          isNightMonster: this.getCurrentDayPhase() === 'malam',
          aggroActive: true,
          attackCooldown: 1.0,
          windupTimer: -1,
          lungeTimer: 0,
          hitFlashTimer: 0,
          mesh,
          alive: true,
          respawnTimer: 0,
          patrolPhase: cm.patrolPhase,
          angryTimer: 0,
        });
      }
      amb.cutsceneMonsters = [];
      this.rebuildOverworldMonsterPool();
    }

    this.storyDialog = null;
    this.phase = 'playing';
    this.hero.root.visible = true;
    const sp = OVERWORLD_ANCHORS.desaSpawn;
    this.heroPos.set(sp.x, getArchipelagoGroundY(sp.x, sp.z), sp.z);
    this.savedOverworldHeroPos.copy(this.heroPos);
    this.heroYaw = sp.yaw;
    this.hero.root.position.copy(this.heroPos);
    this.hero.body.rotation.y = this.heroYaw;
    this.starterPickupMesh.visible = this.worldMode === 'overworld' && !this.starterWeaponPicked;
    this.applyCameraVisibilityAndControls();
    this.snapCameraBehindHero();
    this.saveProgress();
    this.showBanner(
      '⚠️ CEPAT! Ambil Senjata Pemula di sebelah kiri dan habisi monster untuk menolong 2 warga!',
      5.5,
    );
    soundEngine.playBuild();
    this.pushHud(true);
  }

  private completeVillageAmbushRescue(): void {
    const amb = this.villageAmbushState;
    if (!amb || amb.stage !== 'ambush') return;
    amb.stage = 'rescue_talk';
    amb.resolved = false;
    amb.inCutscene = false;
    amb.timer = 0;

    this.gainXp(60);
    this.diamonds += 2;
    this.addScore(250);
    soundEngine.playWin();

    // Posisikan Hero & 2 warga selamat saling berhadapan di area alun-alun Desa Sapaan yang terbuka
    const baseHeroX = THREE.MathUtils.clamp(this.heroPos.x, -3.5, 11.5);
    const baseHeroZ = THREE.MathUtils.clamp(this.heroPos.z, 114.0, 122.0);
    const heroSpot = new THREE.Vector3(baseHeroX, getArchipelagoGroundY(baseHeroX, baseHeroZ), baseHeroZ);
    resolveObstacleBoxes(heroSpot, 0.72, this.villageRig.obstacles, heroSpot.y, 2.2);
    constrainToWalkableArchipelago(heroSpot, 0.72);
    heroSpot.y = getArchipelagoGroundY(heroSpot.x, heroSpot.z);

    this.heroPos.copy(heroSpot);
    this.heroVel.set(0, 0, 0);
    this.heroVelY = 0;
    this.heroOnGround = true;
    this.hero.root.position.copy(this.heroPos);

    const survivors = amb.npcs.filter((n) => n.role === 'survivor' && n.alive);
    const npcOffsets: Array<[number, number]> = [
      [3.15, -0.85],
      [3.15, 0.85],
    ];
    let sumX = 0;
    let sumZ = 0;
    survivors.forEach((n, idx) => {
      const [ox, oz] = npcOffsets[idx] ?? [3.15, 0];
      const pt = new THREE.Vector3(
        THREE.MathUtils.clamp(this.heroPos.x + ox, -9.0, 18.0),
        this.heroPos.y,
        THREE.MathUtils.clamp(this.heroPos.z + oz, 112.0, 124.0),
      );
      resolveObstacleBoxes(pt, 0.62, this.villageRig.obstacles, pt.y, 2.2);
      constrainToWalkableArchipelago(pt, 0.62);
      n.x = pt.x;
      n.z = pt.z;
      n.y = getArchipelagoGroundY(n.x, n.z);
      n.yaw = Math.atan2(this.heroPos.x - n.x, this.heroPos.z - n.z);
      n.actor.root.position.set(n.x, n.y, n.z);
      n.actor.root.rotation.y = n.yaw;
      n.shoutLive = idx === 0 ? '😭 Terima kasih, Pahlawan!' : '🙏 Kami diselamatkan!';
      sumX += n.x;
      sumZ += n.z;
    });

    const midX = survivors.length > 0 ? sumX / survivors.length : this.heroPos.x + 3.0;
    const midZ = survivors.length > 0 ? sumZ / survivors.length : this.heroPos.z;
    amb.talkMidX = midX;
    amb.talkMidZ = midZ;
    this.heroYaw = Math.atan2(midX - this.heroPos.x, midZ - this.heroPos.z);
    this.hero.body.rotation.y = this.heroYaw;

    this.heldKeys.clear();
    this.leftFireHeld = false;
    this.hudFireHeld = false;
    this.phase = 'story';
    this.storyTimer = 0;
    this.applyCameraVisibilityAndControls();

    this.storyDialog = {
      kind: 'village_rescue_talk',
      step: 0,
      maxStep: 2,
      speakerName: 'Laras & Bagas (Warga Desa)',
      speakerRole: 'Warga Desa Sapaan · Terselamatkan',
      speakerKind: 'captive',
      captiveKind: 'girl',
      captiveColor: 0xf472b6,
      speakerSide: 'npc',
      textEn:
        'Thank you so much, Hero! You saved our lives! It happened so fast—a giant flying monster swooped down, snatched one villager into the sky until he vanished in the mist, and those monsters chased us here!',
      textId:
        'Terima kasih banyak, Pahlawan! Kau menyelamatkan nyawa kami! Tadi mengerikan sekali—monster terbang besar tiba-tiba menyambar satu warga kami ke langit hingga lenyap ditelan kabut, lalu monster-monster darat itu mengejar kami!',
      accentColor: '#10b981',
    };

    this.saveProgress();
    this.pushHud(true);
  }

  private startVillageRescueEscort(): void {
    const amb = this.villageAmbushState;
    if (!amb || !amb.active) {
      this.storyDialog = null;
      this.phase = 'playing';
      this.applyCameraVisibilityAndControls();
      this.pushHud(true);
      return;
    }
    amb.stage = 'escort';
    amb.timer = 0;
    for (const n of amb.npcs) {
      if (n.role === 'survivor' && n.alive) {
        n.shoutLive = '🏃 Ikuti kami menuju Penjaga Pulau!';
      }
    }
    this.phase = 'story';
    this.storyTimer = 0;
    this.heldKeys.clear();
    this.applyCameraVisibilityAndControls();
    this.storyDialog = {
      kind: 'village_rescue_escort',
      step: 0,
      speakerName: 'Laras & Bagas (Memandu Jalan)',
      speakerRole: 'Menuju Penjaga Pulau Desa Sapaan',
      textEn: 'Follow the villagers to the Desa Sapaan Island Guardian!',
      textId: 'Kedua warga sedang mengantarmu menemui Penjaga Pulau Desa Sapaan di dekat gerbang gua...',
      accentColor: '#10b981',
    };
    soundEngine.playDoor();
    this.pushHud(true);
  }

  private finishVillageRescueEscort(): void {
    const amb = this.villageAmbushState;
    const activeGuardian = getActiveZoneNpcDef('desa_sapaan', this.getCurrentDayPhase() === 'malam');
    const guardianSpot = OVERWORLD_ANCHORS.npcs.npc_tetua;
    const heroStandX = guardianSpot.x - 2.65;
    const heroStandZ = guardianSpot.z;
    const heroStandY = getArchipelagoGroundY(heroStandX, heroStandZ);

    this.heroPos.set(heroStandX, heroStandY, heroStandZ);
    this.heroVel.set(0, 0, 0);
    this.heroVelY = 0;
    this.heroOnGround = true;
    this.heroYaw = Math.atan2(guardianSpot.x - heroStandX, guardianSpot.z - heroStandZ);
    this.hero.root.position.copy(this.heroPos);
    this.hero.body.rotation.y = this.heroYaw;
    this.savedOverworldHeroPos.copy(this.heroPos);

    if (amb && amb.active) {
      amb.stage = 'awaiting_guardian_talk';
      amb.resolved = false;
      amb.timer = 0;
      const survivors = amb.npcs.filter((n) => n.role === 'survivor' && n.alive);
      const waitCoords: Array<[number, number]> = [
        [guardianSpot.x - 4.3, guardianSpot.z - 1.55],
        [guardianSpot.x - 4.3, guardianSpot.z + 1.55],
      ];
      survivors.forEach((n, idx) => {
        const [wx, wz] = waitCoords[idx] ?? [guardianSpot.x - 4.3, guardianSpot.z];
        n.x = wx;
        n.z = wz;
        n.y = getArchipelagoGroundY(wx, wz);
        n.yaw = Math.atan2(guardianSpot.x - wx, guardianSpot.z - wz);
        n.actor.root.position.set(n.x, n.y, n.z);
        n.actor.root.rotation.y = n.yaw;
        n.shoutLive =
          idx === 0
            ? `👉 Itu ${activeGuardian.name}! Tekan BICARA (E)!`
            : '💬 Bicaralah dengan Penjaga Pulau!';
      });
    }

    this.storyDialog = null;
    this.phase = 'playing';
    this.nearbyNpcId = activeGuardian.id;
    this.applyCameraVisibilityAndControls();
    this.snapCameraBehindHero();
    this.showBanner(
      `👆 Tutorial: Tekan tombol BICARA (atau E) untuk berbicara dengan ${activeGuardian.name}!`,
      6.0,
    );
    soundEngine.playPick();
    this.saveProgress();
    this.pushHud(true);
  }

  public resolveDefeatExitChoice(returnToZone: boolean): void {
    const zId = this.storyDialog?.zoneId;
    this.storyDialog = null;
    this.phase = 'playing';
    if (returnToZone && zId) {
      this.enterZoneDungeon(zId, false);
    } else {
      this.pushHud(true);
    }
  }

  private syncOverworldMonstersByDiff(): void {
    if (this.multiplayerActive && !this.isWorldAuthority()) return;
    if (
      this.missionWaveCount > 0 &&
      !this.missionWaveCompleted &&
      this.hasAliveChallengeMonsters()
    ) {
      return;
    }
    const phase = this.getCurrentDayPhase();
    if (phase === 'malam') {
      if (this.nightWaveDaySpawned !== this.dayCount) {
        this.spawnNightSurfaceWave();
      }
    } else {
      this.clearOverworldNightMonsters();
    }
  }

  private updateOverworldDayNightAtmosphere(dt: number, advanceClock: boolean): void {
    if (advanceClock && (this.phase === 'playing' || (this.multiplayerActive && this.isWorldAuthority()))) {
      const prevPhase = this.getCurrentDayPhase();
      this.worldTimeTick += TICKS_PER_SEC * dt;
      if (this.worldTimeTick >= TICKS_PER_DAY) {
        this.worldTimeTick -= TICKS_PER_DAY;
        this.dayCount += 1;
      }
      const nextPhase = this.getDayPhaseForTick(this.worldTimeTick);
      this.lastOverworldDayPhase = nextPhase;

      if (prevPhase !== nextPhase) {
        const activeMissionWave =
          this.missionWaveCount > 0 &&
          !this.missionWaveCompleted &&
          this.hasAliveChallengeMonsters();
        if (nextPhase === 'sore') {
          this.showBanner(
            '🌇 Sore tiba! Penjaga siang bersiap bergantian tugas dengan penjaga shift malam menjelang gelap...',
            4.5,
          );
        } else if (nextPhase === 'malam') {
          if (this.isWorldAuthority() && !activeMissionWave) {
            this.spawnNightSurfaceWave();
          }
          this.showBanner(
            '🌙 Malam tiba! Para penjaga malam datang menggantikan tugas di depan pintu wilayah, sementara penjaga siang kembali menjadi warga biasa!',
            5.4,
          );
        } else if (nextPhase === 'pagi') {
          this.nightPermittedZones.clear();
          if (this.isWorldAuthority()) {
            if (!activeMissionWave) {
              this.triggerMorningSunlightDestruction();
            }
            this.syncShootersForDifficulty();
          }
          this.showBanner(
            activeMissionWave
              ? '🌅 Fajar menyingsing! Monster misi aktif tetap bertahan & penjaga siang mengambil alih pintu wilayah!'
              : '🌅 Fajar menyingsing! Monster malam hancur & penjaga siang kembali berjaga di depan pintu menggantikan penjaga malam!',
            5.4,
          );
        } else if (nextPhase === 'siang') {
          if (this.isWorldAuthority()) {
            if (!activeMissionWave) {
              this.clearOverworldNightMonsters();
            }
            this.syncShootersForDifficulty();
          }
        }
        if (this.isWorldAuthority() && this.multiplayerActive && this.hasConnectedPeers) {
          this.emitMultiplayerPacket(this.buildWorldSyncPacket());
        }
        this.pushHud(true);
      }
    }

    if (this.worldMode !== 'overworld') return;

    const t = ((this.worldTimeTick % TICKS_PER_DAY) + TICKS_PER_DAY) % TICKS_PER_DAY;
    // Minecraft solar cycle: 0=terbit lewat, 6000=tengah hari, 12000=terbenam, 18000=tengah malam, 23000=fajar
    const theta = (t / TICKS_PER_DAY) * Math.PI * 2;
    const sunY = Math.sin(theta);
    const sunX = Math.cos(theta);

    // Hitung rasio siang (0 = malam penuh, 1 = siang terang) dan fajar/senja
    const daylight = THREE.MathUtils.clamp((sunY + 0.25) / 0.52, 0, 1);
    const twilightGlow = Math.exp(-Math.pow((sunY + 0.02) / 0.22, 2));
    const isDawn = t >= 22200 || t < 1800;

    const inProloguePeaceful =
      this.phase === 'story' &&
      this.storyDialog?.kind === 'prologue' &&
      this.storyDialog.step === 0;
    const inPrologueScene2 =
      this.phase === 'story' &&
      this.storyDialog?.kind === 'prologue' &&
      this.storyDialog.step === 1;
    const stormMistT = inPrologueScene2 ? THREE.MathUtils.clamp((this.storyTimer - 4.8) / 4.8, 0, 1) : 0;

    if (daylight >= 0.5) {
      _skyColorScratch
        .copy(isDawn ? _skyDawnCol : _skyDuskCol)
        .lerp(_skyDayCol, (daylight - 0.5) * 2);
    } else {
      _skyColorScratch
        .copy(_skyNightCol)
        .lerp(isDawn ? _skyDawnCol : _skyDuskCol, daylight * 2);
    }
    _skyColorScratch.lerp(isDawn ? _skyDawnCol : _skyDuskCol, twilightGlow * 0.28);
    if (inPrologueScene2) {
      _skyColorScratch.lerp(_hemiGndNightCol, 0.35 + stormMistT * 0.45);
    } else if (!inProloguePeaceful) {
      // Kabut tebal menyelimuti seluruh kepulauan pada malam, pagi, siang, hingga sore
      _skyColorScratch.lerp(_skyDayMistCol, daylight * 0.62);
      _skyColorScratch.lerp(_skyTenseMistCol, THREE.MathUtils.lerp(0.42, 0.36, daylight));
    }

    (this.scene.background as THREE.Color).copy(_skyColorScratch);
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.copy(_skyColorScratch);
      this.scene.fog.density = inPrologueScene2
        ? THREE.MathUtils.lerp(0.014, 0.036, stormMistT)
        : inProloguePeaceful
        ? THREE.MathUtils.lerp(0.0068, 0.003, daylight)
        : THREE.MathUtils.lerp(0.042, 0.029, daylight) + twilightGlow * 0.005;
    }

    if (this.worldMistMesh && this.worldMistMat) {
      this.worldMistMesh.visible = !inProloguePeaceful;
      this.worldMistMat.color.copy(_mistNightCol).lerp(_mistDayCol, daylight * 0.86);
      this.worldMistMat.opacity = inPrologueScene2
        ? THREE.MathUtils.lerp(0.06, 0.36, stormMistT)
        : THREE.MathUtils.lerp(0.36, 0.27, daylight) + twilightGlow * 0.04;
    }

    const moodLightFactor = inProloguePeaceful ? 1.0 : THREE.MathUtils.lerp(0.92, 0.78, daylight);
    _hemiSkyScratch
      .copy(_hemiSkyNightCol)
      .lerp(_hemiSkyDayCol, daylight)
      .lerp(_hemiSkyDuskCol, twilightGlow * 0.35);
    _hemiGndScratch.copy(_hemiGndNightCol).lerp(_hemiGndDayCol, daylight);
    this.hemiLight.color.copy(_hemiSkyScratch);
    this.hemiLight.groundColor.copy(_hemiGndScratch);
    this.hemiLight.intensity =
      (THREE.MathUtils.lerp(0.34, 0.98, daylight) + (this.preferLiteShader ? 0.2 : 0)) *
      (inPrologueScene2 ? 1 - stormMistT * 0.42 : moodLightFactor);

    _sunColorScratch
      .copy(_sunNightCol)
      .lerp(isDawn ? _sunDawnCol : _sunDayCol, THREE.MathUtils.clamp(daylight * 1.15, 0, 1));
    this.sunLight.color.copy(_sunColorScratch);
    this.sunLight.intensity =
      (THREE.MathUtils.lerp(0.46, 1.95, daylight) + twilightGlow * 0.22) *
      (inPrologueScene2 ? 1 - stormMistT * 0.48 : moodLightFactor);

    const focusX = inPrologueScene2
      ? OVERWORLD_ANCHORS.istanaFloating.x
      : this.phase === 'title'
      ? 4
      : Math.round(this.heroPos.x * 0.5) * 2;
    const focusZ = inPrologueScene2
      ? OVERWORLD_ANCHORS.istanaFloating.z
      : this.phase === 'title'
      ? -4
      : Math.round(this.heroPos.z * 0.5) * 2;
    this.sunLight.target.position.set(focusX, 0, focusZ);
    this.sunLight.target.updateMatrixWorld();

    if (sunY >= -0.05) {
      this.sunLight.position.set(
        focusX + sunX * 58,
        Math.max(24, sunY * 72 + 16),
        focusZ + 44,
      );
    } else {
      // Arah cahaya bulan saat malam
      this.sunLight.position.set(
        focusX - sunX * 54,
        Math.max(28, -sunY * 64 + 20),
        focusZ - 40,
      );
    }

    this.rimLight.intensity =
      THREE.MathUtils.lerp(0.28, 0.42, daylight) + (this.preferLiteShader ? 0.08 : 0);
    if (!this.preferLiteShader) {
      this.scene.environmentIntensity = THREE.MathUtils.lerp(0.32, 1.0, daylight) * moodLightFactor;
    }
    this.playerCaveLight.intensity = daylight < 0.35 ? THREE.MathUtils.lerp(1.15, 0, daylight / 0.35) : 0;
    this.playerCaveLight.position.set(this.heroPos.x, this.heroPos.y + 2.6, this.heroPos.z);

    if (this.villageRig?.sunGroup) {
      const sy = sunY * 126 + 10;
      this.villageRig.sunGroup.position.set(sunX * 145, sy, -85);
      this.villageRig.sunGroup.visible = sy > -14;
    }
    if (this.villageRig?.moonGroup) {
      const my = -sunY * 126 + 10;
      this.villageRig.moonGroup.position.set(-sunX * 145, my, -85);
      this.villageRig.moonGroup.visible = !inPrologueScene2 && my > -14;
    }
    if (this.villageRig?.starMat) {
      this.villageRig.starMat.opacity = inPrologueScene2
        ? 0.25 * (1 - stormMistT)
        : THREE.MathUtils.clamp((0.35 - daylight) * 2.4, 0, 0.92);
    }

    // Continuous underwater optical atmosphere blending whenever camera dips below water surface (y < 0.08)
    const camSubmergeT = THREE.MathUtils.clamp((0.08 - this.camera.position.y) / 0.85, 0, 1);
    if (camSubmergeT > 0.001) {
      const depthRatio = THREE.MathUtils.clamp((-this.camera.position.y - 1.5) / 22, 0, 1);
      _sunColorScratch.setHex(0x0e7490).lerp(_skyNightCol, depthRatio * 0.85);
      (this.scene.background as THREE.Color).lerp(_sunColorScratch, camSubmergeT * 0.94);
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.copy(this.scene.background as THREE.Color);
        const uwDensity = 0.012 + depthRatio * 0.02;
        this.scene.fog.density = THREE.MathUtils.lerp(this.scene.fog.density, uwDensity, camSubmergeT);
      }
      this.hemiLight.intensity = THREE.MathUtils.lerp(
        this.hemiLight.intensity,
        THREE.MathUtils.lerp(1.12, 0.44, depthRatio),
        camSubmergeT,
      );
      this.sunLight.intensity = THREE.MathUtils.lerp(
        this.sunLight.intensity,
        THREE.MathUtils.lerp(1.28, 0.3, depthRatio),
        camSubmergeT,
      );
    }
  }

  private applyAtmosphere(mode: WorldLocationMode, zoneId?: ZoneId, dungeonBright = false): void {
    const liteBoost = this.preferLiteShader ? 0.2 : 0;
    const shadowsDesired = mode !== 'ocean' && !this.isSoftwareGl && this.settings.fxLevel !== 'off';
    this.renderer.shadowMap.enabled = shadowsDesired;
    this.sunLight.castShadow = shadowsDesired;
    if (shadowsDesired) {
      this.renderer.shadowMap.needsUpdate = true;
    }
    if (mode === 'dungeon') {
      if (dungeonBright) {
        const brightHex =
          zoneId === 'gua_portal'
            ? 0x3b2f63
            : zoneId === 'menara_waktu'
            ? 0x2b3b55
            : zoneId === 'hutan_satwa'
            ? 0x1e4e3a
            : zoneId === 'pasar_rasa'
            ? 0x4a2c1d
            : 0x334155;
        (this.scene.background as THREE.Color).setHex(brightHex);
        if (this.scene.fog instanceof THREE.FogExp2) {
          this.scene.fog.color.setHex(brightHex);
          this.scene.fog.density = 0.0065;
        }
        this.hemiLight.color.setHex(0xe0f2fe);
        this.hemiLight.groundColor.setHex(0x5c913b);
        this.hemiLight.intensity = 1.18 + liteBoost;
        this.sunLight.target.position.set(0, 0, 0);
        this.sunLight.target.updateMatrixWorld();
        this.sunLight.color.setHex(0xfff4d6);
        this.sunLight.position.set(42, 68, 42);
        this.sunLight.intensity = 1.45;
        this.rimLight.intensity = 0.58;
        if (!this.preferLiteShader) this.scene.environmentIntensity = 0.92;
        this.playerCaveLight.intensity = 1.25;
      } else {
        const fogHex =
          zoneId === 'gua_portal'
            ? 0x0b0a1f
            : zoneId === 'menara_waktu'
            ? 0x0c142c
            : zoneId === 'hutan_satwa'
            ? 0x071f14
            : zoneId === 'pasar_rasa'
            ? 0x1c100a
            : 0x0f172a;
        (this.scene.background as THREE.Color).setHex(fogHex);
        if (this.scene.fog instanceof THREE.FogExp2) {
          this.scene.fog.color.setHex(fogHex);
          this.scene.fog.density = 0.022;
        }
        this.hemiLight.color.setHex(0xe0f2fe);
        this.hemiLight.groundColor.setHex(0x5c913b);
        this.hemiLight.intensity = 0.36 + liteBoost * 0.6;
        this.sunLight.target.position.set(0, 0, 0);
        this.sunLight.target.updateMatrixWorld();
        this.sunLight.color.setHex(0xfff4d6);
        this.sunLight.position.set(42, 68, 42);
        this.sunLight.intensity = 0.2;
        this.rimLight.intensity = 0.16;
        if (!this.preferLiteShader) this.scene.environmentIntensity = 0.25;
        this.playerCaveLight.intensity = 2.4;
      }
    } else if (mode === 'academy') {
      (this.scene.background as THREE.Color).setHex(0x1e1b4b);
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.setHex(0x1e1b4b);
        this.scene.fog.density = 0.008;
      }
      this.hemiLight.color.setHex(0xe0f2fe);
      this.hemiLight.groundColor.setHex(0x5c913b);
      this.hemiLight.intensity = 0.85 + liteBoost;
      this.sunLight.target.position.set(0, 0, 0);
      this.sunLight.target.updateMatrixWorld();
      this.sunLight.color.setHex(0xfff4d6);
      this.sunLight.position.set(42, 68, 42);
      this.sunLight.intensity = 1.35;
      this.rimLight.intensity = 0.45;
      if (!this.preferLiteShader) this.scene.environmentIntensity = 0.85;
      this.playerCaveLight.intensity = 0;
    } else if (mode === 'ocean') {
      (this.scene.background as THREE.Color).setHex(0x0c4a6e);
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.setHex(0x0c4a6e);
        this.scene.fog.density = 0.014;
      }
      this.hemiLight.color.setHex(0x7dd3fc);
      this.hemiLight.groundColor.setHex(0x0f172a);
      this.hemiLight.intensity = 1.05 + liteBoost;
      this.sunLight.target.position.set(0, -10, 0);
      this.sunLight.target.updateMatrixWorld();
      this.sunLight.color.setHex(0xe0f2fe);
      this.sunLight.position.set(22, 68, 42);
      this.sunLight.intensity = 1.25;
      this.rimLight.intensity = 0.45;
      if (!this.preferLiteShader) this.scene.environmentIntensity = 0.78;
      this.playerCaveLight.intensity = 0;
    } else {
      this.updateOverworldDayNightAtmosphere(0, false);
    }
    this.applyEffectivePixelRatio();
  }

  private clearSubScenes(): void {
    if (this.dungeonRig) {
      this.scene.remove(this.dungeonRig.group);
      this.dungeonRig.disposables.forEach((d) => d.dispose());
      this.dungeonRig.group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      this.dungeonRig = null;
      this.mapHiddenDungeon = [];
    }
    if (this.academyRig) {
      this.scene.remove(this.academyRig.group);
      this.academyRig.group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      this.academyRig = null;
      this.mapHiddenAcademy = [];
    }
    if (this.oceanRig) {
      this.scene.remove(this.oceanRig.group);
      this.oceanRig.disposables.forEach((d) => d.dispose());
      this.oceanRig.group.traverse((obj) => {
        if (obj instanceof THREE.Mesh && !obj.geometry.userData?.shared) {
          obj.geometry.dispose();
        }
      });
      this.oceanRig = null;
      this.mapHiddenOcean = [];
    }
    this.activeJumpTrick = null;
    this.jumpTrickElapsed = 0;
    this.jumpToSwimPlayedForAir = false;
    this.diveTransition = null;
    soundEngine.setSwimmingAudio(false);
    soundEngine.setCarEngine(false, 0);
    soundEngine.setPlaneEngine(false, 0);
    this.clearCarControls();
    this.clearPlaneControls();
    if (this.carMode !== 'none') {
      const av = this.getActiveVehicle();
      if (av) {
        av.driverKind = 'none';
        av.speed = 0;
        av.doorAngle = 0;
      }
      this.carMode = 'none';
      this.carSpeed = 0;
      this.carDoorAngle = 0;
    }
    if (this.planeMode !== 'none') {
      const ap = this.getActivePlane();
      if (ap) {
        ap.occupied = false;
        ap.speed = 0;
        ap.vy = 0;
        ap.canopyAngle = 0;
      }
      this.planeMode = 'none';
    }
    if (this.bombReticleMesh) this.bombReticleMesh.visible = false;
    this.clearCaveBoulders();
    this.activeTnts.forEach((t) => {
      if (t.mesh.parent) t.mesh.parent.remove(t.mesh);
    });
    this.activeTnts = [];
    this.caveTorches = [];
    this.targetedCaveBlock = null;
    this.nearCraftingTable = false;
    this.chestAmbushTriggered = false;
    this.bossBoulderTimer = 0;
    this.dungeonAnimatables = [];
    this.dungeonMonsters = [];
    this.dungeonTotalSpawned = 0;
    this.academyMonsters = [];
    this.academyTotalSpawned = 0;
    this.oceanMonsters = [];
    this.oceanTotalSpawned = 0;
    this.oceanClickables = [];
    this.ridingTurtle = false;
    this.heroDiveActive = false;
    this.oceanAscendHeld = false;
    this.oceanDescendHeld = false;
    this.nearBiotaNode = null;
    this.nearOceanChest = null;
    this.nearOceanTurtle = false;
    this.dungeonClickables = [];
    this.academyClickables = [];
    this.academyNpcs.clear();
    this.academyCitizens = [];
    this.dungeonState = null;
    this.nearDungeonExit = false;
    this.nearbyDoorIndex = null;
    this.nearbyOverworldZoneDoor = null;
    this.nearbyDungeonGuardian = false;
    this.nearPrisonKey = false;
    this.nearHiddenPrison = false;
    this.tapMoveTarget = null;
    this.clearProjectiles();
    this.applyAtmosphere('overworld');
  }

  private clearCaveBoulders(): void {
    for (const b of this.caveBoulders) {
      if (b.rockMesh.parent) b.rockMesh.parent.remove(b.rockMesh);
      if (b.ringMesh.parent) b.ringMesh.parent.remove(b.ringMesh);
      b.rockMesh.geometry.dispose();
      (b.rockMesh.material as THREE.Material).dispose();
      b.ringMesh.geometry.dispose();
      (b.ringMesh.material as THREE.Material).dispose();
    }
    this.caveBoulders = [];
  }

  private clearProjectiles(): void {
    for (const p of this.projectiles) {
      p.active = false;
      p.mesh.visible = false;
      p.hitIds.clear();
    }
  }

  private getOrCreateAreaDeal(zoneId: ZoneId): AreaWaveDeal {
    if (!this.areaDeals[zoneId]) {
      this.areaDeals[zoneId] = computeAreaWaveDeal(zoneId);
      this.saveProgress();
    }
    return this.areaDeals[zoneId]!;
  }

  public enterZoneDungeon(
    zoneId: ZoneId,
    isMixedChallenge = false,
    resumeSavedPos = false,
  ): void {
    if (this.worldMode === 'overworld' && !resumeSavedPos) {
      this.savedOverworldHeroPos.copy(this.heroPos);
    }
    this.clearSubScenes();

    this.overworldGroup.visible = false;
    this.worldMode = 'dungeon';
    this.phase = 'playing';
    this.isSwimming = false;
    this.refreshWeaponVisual();
    this.heldKeys.clear();
    this.shooterGemsThisArea = 0;
    this.bossBoulderTimer = 0;

    const detail = this.getOrCreateZoneCaveDetail(zoneId);
    const defeatedSet = new Set(detail.defeatedEnemyIds);
    const brokenBlockSet = new Set(detail.brokenBlockIds);
    this.chestAmbushTriggered = Boolean(
      detail.chestAmbushTriggered || detail.weaponChestCollected,
    );

    const rig = createDungeonEnvironment(zoneId, this.palette);
    this.dungeonRig = rig;
    this.dungeonAnimatables = rig.animatables;
    this.dungeonExitPos.copy(rig.exitPadPos);

    // Restore broken blocks, weapon chest, placed shield blocks, and placed torches
    for (const blk of rig.caveBlocks) {
      if (brokenBlockSet.has(blk.id)) {
        blk.alive = false;
        blk.mesh.visible = false;
        blk.hasAmbush = false;
      }
    }
    if (detail.weaponChestCollected) {
      rig.weaponChest.collected = true;
      rig.weaponChest.group.visible = false;
    }
    for (const sb of detail.placedShieldBlocks) {
      const sbMesh = new THREE.Mesh(rig.shieldBlockGeo, rig.shieldBlockMat);
      sbMesh.position.set(sb.x, sb.y, sb.z);
      sbMesh.castShadow = true;
      sbMesh.receiveShadow = true;
      sbMesh.userData.caveBlockId = sb.id;
      rig.group.add(sbMesh);
      const sbDef: CaveBlockDef = {
        id: sb.id,
        kind: 'player_shield',
        label: 'Blok Pelindung',
        x: sb.x,
        y: sb.y,
        z: sb.z,
        halfW: 1.0,
        hp: sb.hp,
        maxHp: 4,
        mesh: sbMesh,
        alive: true,
      };
      rig.caveBlocks.push(sbDef);
      if (sb.hp < 4) {
        this.updateBlockCrackVisual(sbDef);
      }
    }
    for (const tc of detail.placedTorches) {
      const torchMesh = createCaveTorchMesh(this.palette);
      torchMesh.position.set(tc.x, 0, tc.z);
      rig.group.add(torchMesh);
      let light: THREE.PointLight | null = null;
      const maxTorchLights = this.isMobileDevice ? 4 : 8;
      const activeLightsCount = this.caveTorches.filter((item) => item.light !== null).length;
      if (activeLightsCount < maxTorchLights) {
        light = new THREE.PointLight(0xffb74d, 4.4, 18, 1.55);
        light.position.set(tc.x, 1.5, tc.z);
        rig.group.add(light);
      }
      this.caveTorches.push({ x: tc.x, z: tc.z, mesh: torchMesh, light });
    }

    this.dungeonClickables.push(
      rig.exitClickable,
      rig.weaponChest.group,
      rig.guardianMesh,
      rig.prisonGroup,
      rig.prisonKeyGroup,
    );
    rig.group.children.forEach((child) => {
      if (child.userData.craftingTable) this.dungeonClickables.push(child);
    });
    rig.doors.forEach((d) => this.dungeonClickables.push(d.group));
    rig.caveBlocks.forEach((b) => this.dungeonClickables.push(b.mesh));
    this.scene.add(rig.group);
    this.mapHiddenDungeon = this.collectMapHidden(rig.group);

    const liberated = this.liberatedZones.has(zoneId);
    const bossBeaten = liberated || this.defeatedBossZones.has(zoneId);
    this.applyAtmosphere('dungeon', zoneId, bossBeaten);

    const deal = this.getOrCreateAreaDeal(zoneId);
    const clearedSet = new Set(this.areaDoorsCleared[zoneId] || []);

    // 60% English Quiz Guardians (3 Penjaga Kata carrying 100% of remaining area vocab) +
    // 40% Pure Real-Time Action Brawlers (2 Petarung Gua — zero quiz, fight directly in 3D!)
    const quizWaves: string[][] = [[], [], []];
    deal.monsterWaves.forEach((wIds, idx) => {
      quizWaves[idx % 3].push(...wIds);
    });

    const quizCoords: Array<[number, number]> = [
      [-9, -1],
      [0, -11],
      [9, -1],
    ];
    const monsterTypes: MonsterType[] = [
      BOSSES[zoneId].monsterType,
      'skeleton_warrior',
      BOSSES[zoneId].monsterType,
      'crystal_golem',
    ];

    quizWaves.forEach((wordIds, idx) => {
      const [mx, mz] = quizCoords[idx];
      const id = `dw_${zoneId}_${idx}`;
      const mType = monsterTypes[idx % monsterTypes.length];
      const mesh = createMonsterMesh(mType, this.palette, 1.0);
      mesh.position.set(mx, 0, mz);
      mesh.userData.monsterId = id;
      rig.group.add(mesh);
      this.dungeonClickables.push(mesh);

      const isAlive = !bossBeaten && !defeatedSet.has(id);
      this.dungeonMonsters.push({
        id,
        type: mType,
        name: `Penjaga Kata #${idx + 1}`,
        zoneId,
        homeX: mx,
        homeZ: mz,
        x: mx,
        z: mz,
        maxHp: Math.min(5, Math.max(2, Math.ceil(wordIds.length / 8))),
        rewardXp: 35,
        rewardDiamonds: 0, // Bab 8: noGems in dungeon monster drops
        rewardScore: 220,
        wordIds,
        mesh,
        alive: isAlive,
        respawnTimer: 0,
        patrolPhase: idx * 1.4,
        angryTimer: 0,
      });
      if (!isAlive) {
        mesh.visible = false;
      }
    });

    const brawlerCoords: Array<[number, number]> = [
      [-7, -9],
      [7, -9],
    ];
    const brawlerHp = this.settings.difficulty === 'pendekar' ? 5 : 4;
    brawlerCoords.forEach(([bx, bz], idx) => {
      const id = `db_${zoneId}_${idx}`;
      const mType: MonsterType = idx === 0 ? BOSSES[zoneId].monsterType : 'minotaur_brute';
      const mesh = createMonsterMesh(mType, this.palette, 1.05);
      mesh.position.set(bx, 0, bz);
      mesh.userData.monsterId = id;

      // Glowing crimson battle ring underneath so players immediately spot 40% Pure Combat brawlers!
      const auraRing = new THREE.Mesh(
        new THREE.RingGeometry(0.95, 1.32, 18),
        new THREE.MeshBasicMaterial({
          color: 0xef4444,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        }),
      );
      auraRing.rotation.x = -Math.PI / 2;
      auraRing.position.y = 0.08;
      mesh.add(auraRing);
      mesh.userData.combatRing = auraRing;

      rig.group.add(mesh);
      this.dungeonClickables.push(mesh);

      const isAlive = !bossBeaten && !defeatedSet.has(id);
      this.dungeonMonsters.push({
        id,
        type: mType,
        name: `Petarung Gua #${idx + 1}`,
        zoneId,
        homeX: bx,
        homeZ: bz,
        x: bx,
        z: bz,
        maxHp: brawlerHp,
        mobHp: brawlerHp,
        maxMobHp: brawlerHp,
        combatOnly: true,
        aggroActive: false,
        attackCooldown: 1.4 + idx * 0.4,
        windupTimer: -1,
        lungeTimer: 0,
        hitFlashTimer: 0,
        rewardXp: 25,
        rewardDiamonds: 1,
        rewardScore: 220,
        mesh,
        alive: isAlive,
        respawnTimer: 0,
        patrolPhase: idx * 2.2 + 0.7,
        angryTimer: 0,
      });
      if (!isAlive) {
        mesh.visible = false;
      }
    });

    // Spawn Cave-Exclusive Mobs: 2 Cave Spiders (volatile ambushers) & 2 Lava Imps (flying ceiling swoopers)
    const creeperSpots: Array<[number, number]> = [
      [-11, 2],
      [11, -3],
    ];
    creeperSpots.forEach(([cx, cz], idx) => {
      const cid = `creeper_${zoneId}_${idx}`;
      const isAlive = !bossBeaten && !defeatedSet.has(cid);
      const cMesh = createMonsterMesh('cave_spider', this.palette, 1.0);
      cMesh.position.set(cx, 0, cz);
      cMesh.visible = isAlive;
      rig.group.add(cMesh);
      this.dungeonMonsters.push({
        id: cid,
        type: 'cave_spider',
        name: 'Cave Spider',
        zoneId,
        homeX: cx,
        homeZ: cz,
        x: cx,
        y: 0,
        z: cz,
        maxHp: 2,
        mobHp: 2,
        fuseTimer: -1,
        rewardXp: 15,
        rewardDiamonds: 0,
        rewardScore: 140,
        isCaveMob: true,
        mesh: cMesh,
        alive: isAlive,
        respawnTimer: 0,
        patrolPhase: idx * 2.1,
        angryTimer: 0,
      });
    });

    const batSpots: Array<[number, number]> = [
      [-6, -5],
      [6, 3],
    ];
    batSpots.forEach(([bx, bz], idx) => {
      const bid = `bat_${zoneId}_${idx}`;
      const isAlive = !bossBeaten && !defeatedSet.has(bid);
      const bMesh = createMonsterMesh('lava_imp', this.palette, 1.0);
      bMesh.position.set(bx, 3.4, bz);
      bMesh.visible = isAlive;
      rig.group.add(bMesh);
      this.dungeonMonsters.push({
        id: bid,
        type: 'lava_imp',
        name: 'Lava Imp',
        zoneId,
        homeX: bx,
        homeZ: bz,
        x: bx,
        y: 3.4,
        z: bz,
        maxHp: 2,
        mobHp: 2,
        rewardXp: 15,
        rewardDiamonds: 0,
        rewardScore: 140,
        isCaveMob: true,
        mesh: bMesh,
        alive: isAlive,
        respawnTimer: 0,
        patrolPhase: idx * 2.7 + 0.8,
        angryTimer: 0,
      });
    });

    const caveStory = ZONE_CAVE_STORIES[zoneId];
    const wordMobs = this.dungeonMonsters.filter((m) => !m.isCaveMob);
    const aliveCount = wordMobs.filter((m) => m.alive).length;
    const keyCollected = liberated || (bossBeaten && Boolean(detail.prisonKeyCollected));
    this.dungeonState = {
      zoneId,
      zoneName: ZONE_INFO[zoneId].name,
      doorsCleared: Array.from(clearedSet),
      monstersRemaining: aliveCount,
      monstersTotal: wordMobs.length,
      allEnemiesDefeated: 0,
      allEnemiesRemaining: 0,
      allEnemiesTotal: 0,
      bossSpawned: bossBeaten,
      bossDefeated: bossBeaten,
      prisonKeySpawned: bossBeaten && !liberated,
      prisonKeyCollected: keyCollected,
      prisonUnlocked: liberated,
      captiveName: caveStory.captiveName,
      guardianName: caveStory.guardianName,
      liberated,
      isMixedChallenge,
    };

    if (liberated) {
      rig.prisonBars.visible = false;
      rig.prisonKeyGroup.visible = false;
      rig.guardianAuraMat.color.setHex(0x22c55e);
      rig.group.add(rig.captiveMesh);
      rig.captiveMesh.position.set(3.3, 0, 11.8);
      rig.captiveMesh.rotation.y = -0.35;
    } else if (bossBeaten) {
      rig.prisonKeyGroup.visible = !keyCollected;
    }

    // Restore previously triggered chest/mine ambush monsters if still alive (or count if defeated)
    let extraDefeatedAmbushCount = 0;
    if (!bossBeaten) {
      const chestAmbushId = `ambush_chest_${zoneId}`;
      if (detail.chestAmbushTriggered) {
        if (defeatedSet.has(chestAmbushId)) {
          extraDefeatedAmbushCount += 1;
        } else {
          this.spawnCaveAmbushMonster(
            rig.weaponChest.x,
            rig.weaponChest.z,
            'Penjaga Peti Rahasia',
            0x38bdf8,
            chestAmbushId,
            detail.chestAmbushInfo?.isCombatAmbush,
            detail.chestAmbushInfo?.wordIds,
            true,
          );
        }
      }
      for (const amb of detail.triggeredBlockAmbushes || []) {
        if (defeatedSet.has(amb.id)) {
          extraDefeatedAmbushCount += 1;
        } else {
          this.spawnCaveAmbushMonster(
            amb.originX,
            amb.originZ,
            amb.title,
            amb.accentHex,
            amb.id,
            amb.isCombatAmbush,
            amb.wordIds,
            true,
          );
        }
      }
    }

    // If all 5 doors & monster waves already done (re-entering after Door 4), spawn Boss if not yet defeated
    this.updateDungeonDoorVisuals();
    this.syncShootersForDifficulty();
    if (bossBeaten) {
      this.shooters.forEach((s) => {
        s.alive = false;
        s.mesh.visible = false;
      });
      this.dungeonTotalSpawned =
        this.dungeonMonsters.length + this.shooters.length + extraDefeatedAmbushCount;
    } else {
      this.dungeonTotalSpawned =
        this.dungeonMonsters.length + this.shooters.length + extraDefeatedAmbushCount;
      if (clearedSet.has(4)) {
        this.spawnDungeonBoss(zoneId);
      }
    }
    this.syncDungeonMonsterStats();

    this.nearbyNpcId = null;
    this.nearbyOverworldZoneDoor = null;
    this.nearbyMonsterId = null;
    this.nearbyDoorIndex = null;
    this.nearbyDungeonGuardian = false;
    this.nearPrisonKey = false;
    this.nearHiddenPrison = false;
    this.nearPortal = false;
    this.nearDungeonExit = false;
    this.encounterGraceTimer = 1.6;
    if (this.cameraMode === 'orbit') this.cameraMode = 'third_back';

    if (!liberated && !this.caveIntrosSeen.has(zoneId) && !resumeSavedPos) {
      this.startDungeonIntroCutscene(zoneId);
      return;
    }

    if (resumeSavedPos && this.restoredHeroPos) {
      this.heroPos.set(
        THREE.MathUtils.clamp(this.restoredHeroPos.x, -18.5, 18.5),
        Math.max(0, this.restoredHeroPos.y),
        THREE.MathUtils.clamp(this.restoredHeroPos.z, -18.5, 18.5),
      );
      this.heroYaw = this.restoredHeroPos.yaw;
    } else {
      this.heroPos.set(0, 0, 13);
      this.heroYaw = Math.PI;
    }
    this.heroVel.set(0, 0, 0);
    this.heroVelY = 0;
    this.heroOnGround = true;
    this.hero.root.position.copy(this.heroPos);
    this.hero.body.rotation.y = this.heroYaw;

    this.applyCameraVisibilityAndControls();
    this.snapCameraBehindHero();

    this.spawnBurst(this.heroPos.x, 1.8, this.heroPos.z, 0xa855f7, 22);
    soundEngine.playDoor();
    if (!resumeSavedPos) {
      this.showBanner(
        liberated
          ? `Gua ${ZONE_INFO[zoneId].name} Bebas & Terang · ${caveStory.guardianName} & ${caveStory.captiveName} aman!`
          : bossBeaten
          ? `Bos kalah & gua terang! Ambil Kunci Penjara emas di tengah gua lalu selamatkan ${caveStory.captiveName}!`
          : `Gua ${ZONE_INFO[zoneId].name}: Buka 5 Pintu, kalahkan Bos, lalu selamatkan ${caveStory.captiveName}!`,
        4.8,
      );
    }
    this.saveProgress();
    this.pushHud(true);
  }

  private updateDungeonDoorVisuals(): void {
    if (!this.dungeonRig || !this.dungeonState) return;
    const cleared = new Set(this.dungeonState.doorsCleared);
    const readyForDoor4 =
      cleared.has(0) &&
      cleared.has(1) &&
      cleared.has(2) &&
      cleared.has(3) &&
      this.dungeonState.monstersRemaining === 0;

    for (const d of this.dungeonRig.doors) {
      if (cleared.has(d.index)) {
        updateDoorRigVisual(d, 'cleared');
      } else if (d.index === 4 && !readyForDoor4) {
        updateDoorRigVisual(d, 'locked');
      } else {
        updateDoorRigVisual(d, 'open');
      }
    }
  }

  public enterAcademy(resumeSavedPos = false): void {
    if (IELTS_TEMPORARILY_LOCKED) {
      this.showBanner(
        '🔒 Istana IELTS sedang ditutup sementara! Nikmati petualangan di 6 pulau Nusantara Kata terlebih dahulu.',
        4.4,
      );
      soundEngine.playNo();
      return;
    }
    if (this.settings.storyLocked && this.ribbons.size < 6) {
      this.showBanner(
        `Istana IELTS terkunci (Mode Cerita)! Kumpulkan 6 Mahkota (${this.ribbons.size}/6) atau ubah ke Bebas di Opsi.`,
        4.0,
      );
      soundEngine.playNo();
      return;
    }
    if (this.worldMode === 'overworld' && !resumeSavedPos) {
      this.savedOverworldHeroPos.copy(this.heroPos);
    }
    this.clearSubScenes();
    this.overworldGroup.visible = false;
    this.worldMode = 'academy';
    this.phase = 'playing';
    this.isSwimming = false;
    this.refreshWeaponVisual();
    this.heldKeys.clear();
    this.shooterGemsThisArea = 0;

    const rig = createAcademyHallEnvironment(this.palette);
    this.academyRig = rig;
    this.dungeonAnimatables = rig.animatables;
    this.dungeonExitPos.copy(rig.exitPadPos);
    this.academyClickables.push(rig.exitClickable);
    this.scene.add(rig.group);
    this.mapHiddenAcademy = this.collectMapHidden(rig.group);
    this.applyAtmosphere('academy');

    for (const def of ACADEMY_NPCS) {
      const mesh = createZoneNpc(def.id, this.palette);
      mesh.position.set(def.x, 0, def.z);
      mesh.rotation.y = def.rotationY;
      mesh.userData.npcId = def.id;
      rig.group.add(mesh);
      this.academyClickables.push(mesh);
      this.academyNpcs.set(def.id, { mesh, x: def.x, z: def.z });
    }

    for (const st of ACADEMY_INHABITANTS) {
      const mesh = createZoneNpc(st.archetypeId, this.palette, st.variant);
      mesh.position.set(st.x, 0, st.z);
      mesh.rotation.y = st.rotationY;
      mesh.userData.academyTip = st.message;
      rig.group.add(mesh);
      this.academyClickables.push(mesh);
      this.academyCitizens.push({ id: st.id, mesh, x: st.x, z: st.z, message: st.message });
    }

    for (const s of ACADEMY_SHADOWS) {
      const isAlive = !this.defeatedAcademyEnemyIds.has(s.id);
      const mesh = createMonsterMesh(s.type, this.palette, 1.0);
      mesh.position.set(s.x, 0, s.z);
      mesh.userData.monsterId = s.id;
      mesh.visible = isAlive;
      rig.group.add(mesh);
      this.academyClickables.push(mesh);
      this.academyMonsters.push({
        id: s.id,
        type: s.type,
        name: s.name,
        zoneId: s.zoneId,
        homeX: s.x,
        homeZ: s.z,
        x: s.x,
        z: s.z,
        maxHp: s.maxHp,
        rewardXp: s.rewardXp,
        rewardDiamonds: s.rewardDiamonds,
        rewardScore: s.rewardScore,
        isAcademyShadow: true,
        academySkill: s.academySkill,
        mesh,
        alive: isAlive,
        respawnTimer: 0,
        patrolPhase: Math.random() * Math.PI * 2,
        angryTimer: 0,
      });
    }

    this.syncShootersForDifficulty();
    this.academyTotalSpawned =
      this.academyMonsters.length + this.shooters.length;

    if (resumeSavedPos && this.restoredHeroPos) {
      this.heroPos.set(
        THREE.MathUtils.clamp(this.restoredHeroPos.x, -18.5, 18.5),
        Math.max(0, this.restoredHeroPos.y),
        THREE.MathUtils.clamp(this.restoredHeroPos.z, -18.5, 18.5),
      );
      this.heroYaw = this.restoredHeroPos.yaw;
    } else {
      this.heroPos.set(0, 0, 12);
      this.heroYaw = Math.PI;
    }
    this.heroVel.set(0, 0, 0);
    this.heroVelY = 0;
    this.heroOnGround = true;
    this.hero.root.position.copy(this.heroPos);
    this.hero.body.rotation.y = this.heroYaw;
    this.encounterGraceTimer = 1.6;
    if (this.cameraMode === 'orbit') this.cameraMode = 'third_back';
    this.applyCameraVisibilityAndControls();
    this.snapCameraBehindHero();

    if (!resumeSavedPos) {
      soundEngine.playFanfare();
      this.showBanner(
        'Epilog Istana IELTS! Keenam Pecahan Mahkota bersatu — Raja Aksara & Lila menyambutmu di aula!',
        5.0,
      );
    }
    this.saveProgress();
    this.pushHud(true);
  }

  public exitDungeon(): void {
    if (this.worldMode === 'overworld') return;
    this.clearSubScenes();
    this.worldMode = 'overworld';
    this.overworldGroup.visible = true;
    this.phase = 'playing';
    this.heldKeys.clear();

    if (!isWalkableArchipelago(this.savedOverworldHeroPos.x, this.savedOverworldHeroPos.z)) {
      const sp = OVERWORLD_ANCHORS.desaSpawn;
      this.savedOverworldHeroPos.set(sp.x, getArchipelagoGroundY(sp.x, sp.z), sp.z);
    } else {
      this.savedOverworldHeroPos.y = getArchipelagoGroundY(
        this.savedOverworldHeroPos.x,
        this.savedOverworldHeroPos.z,
      );
    }
    this.heroPos.copy(this.savedOverworldHeroPos);
    this.heroVel.set(0, 0, 0);
    this.heroVelY = 0;
    this.heroOnGround = true;
    this.isSwimming = false;
    this.refreshWeaponVisual();
    this.hero.root.position.copy(this.heroPos);
    this.encounterGraceTimer = 2.0;

    this.refreshAreaMists();
    this.syncShootersForDifficulty();
    this.applyCameraVisibilityAndControls();
    this.snapCameraBehindHero();

    this.spawnBurst(this.heroPos.x, this.heroPos.y + 1.5, this.heroPos.z, 0x38bdf8, 18);
    soundEngine.playDoor();
    this.showBanner('Kembali ke Kepulauan Nusantara Kata', 2.4);
    this.saveProgress();
    this.pushHud(true);
  }

  private triggerDefeatExit(lastZoneId?: ZoneId): void {
    this.damageFlashTimer = 0;
    this.cameraShakeTimer = 0;
    this.clearSubScenes();
    this.worldMode = 'overworld';
    this.overworldGroup.visible = true;
    const sp = OVERWORLD_ANCHORS.desaSpawn;
    const sy = getArchipelagoGroundY(sp.x, sp.z);
    this.heroPos.set(sp.x, sy, sp.z);
    this.heroYaw = sp.yaw;
    this.savedOverworldHeroPos.copy(this.heroPos);
    this.heroVel.set(0, 0, 0);
    this.heroVelY = 0;
    this.heroOnGround = true;
    this.isSwimming = false;
    this.refreshWeaponVisual();
    this.hero.root.position.copy(this.heroPos);
    this.hp = Math.ceil(this.maxHp / 2);
    this.encounterGraceTimer = 6.0;
    this.refreshAreaMists();
    this.syncShootersForDifficulty();

    this.controls.target.set(sp.x, sy + 2, sp.z);
    this.camera.position.set(sp.x, sy + 22, sp.z + 20);
    this.controls.update();

    const npc = getActiveZoneNpcDef(lastZoneId || 'desa_sapaan', this.getCurrentDayPhase() === 'malam');
    this.phase = 'story';
    this.applyCameraVisibilityAndControls();
    this.storyDialog = {
      kind: 'defeat_exit',
      step: 0,
      zoneId: lastZoneId,
      speakerName: npc?.name || 'Kakek Sapa',
      speakerRole: npc?.zoneName || 'Hutan Kata',
      textEn: 'Rest up, Hoot! Your heart is half-recovered. Want to head right back or catch your breath first?',
      textId: `Jangan menyerah, Hoot! Nyawamu dipulihkan (${this.hp}/${this.maxHp} ❤️). Ingin langsung kembali ke ${npc?.zoneName || 'sana'} atau istirahat dulu?`,
      accentColor: npc?.accentColor || '#f59e0b',
      defeatReason: this.lastDefeatReason || undefined,
    };
    soundEngine.playLose();
    this.saveProgress();
    this.pushHud(true);
  }

  public setPhase(next: GamePhase): void {
    const wasDialogue = this.phase === 'dialogue';
    this.phase = next;
    if (next !== 'dialogue') {
      this.dialogueTargetNpcId = null;
    }
    this.forceRenderNextFrame = true;
    this.lastFrameRenderMs = 0;
    this.heldKeys.clear();
    this.lookPointer = null;
    if (next !== 'playing') {
      this.damageFlashTimer = 0;
      this.cameraShakeTimer = 0;
      this.voiceMoveTimer = 0;
      this.voiceMoveVec = { x: 0, z: 0 };
      this.voiceSprint = false;
      this.voiceAutoFire = false;
      this.isAiming = false;
      this.aimToggled = false;
      this.rightAimHeld = false;
      this.leftFireHeld = false;
      this.hudFireHeld = false;
      this.clearCarControls();
      this.clearPlaneControls();
      soundEngine.setCarEngine(false, 0);
      soundEngine.setPlaneEngine(false, 0);
      if (document.pointerLockElement === this.renderer.domElement) {
        try {
          document.exitPointerLock?.();
        } catch {
          // ignore
        }
      }
    }
    this.applyCameraVisibilityAndControls();
    if (next === 'playing' && wasDialogue) {
      this.snapCameraBehindHero();
    }
    if ((next === 'paused' || next === 'title') && this.hasSave) {
      this.saveProgress();
    }
    if (!this.disposed) {
      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
      this.scheduleNextTick();
    }
    this.pushHud(true);
  }

  public setBackgroundIdle(idle: boolean): void {
    if (this.backgroundIdle === idle) return;
    this.backgroundIdle = idle;
    if (this.disposed) return;
    if (!idle) {
      this.lastTimeMs = performance.now();
      this.lastFrameRenderMs = 0;
      this.forceRenderNextFrame = true;
      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
      this.scheduleNextTick();
    } else {
      this.forceRenderNextFrame = true;
    }
  }

  public toggleAimMode(): void {
    this.lastInputActivityMs = performance.now();
    if (this.phase !== 'playing') return;
    if (this.settings.aimMode !== 'manual') {
      this.showBanner('Mode Bidik Otomatis aktif — ubah ke Bidik Bebas di Menu Opsi untuk Scope!', 2.5);
      return;
    }
    if (this.activeHotbarSlot > 7 || !this.ownedWeapons.has(this.activeWeapon)) {
      this.showBanner('Pilih senjata terlebih dahulu untuk membidik (ADS)!', 2.0);
      return;
    }
    this.aimToggled = !this.aimToggled;
    this.isAiming = this.aimToggled || this.rightAimHeld;
    soundEngine.playPick();
    this.pushHud(true);
  }

  public setFireHeld(held: boolean): void {
    if (held) this.lastInputActivityMs = performance.now();
    this.hudFireHeld = held;
    if (held && this.phase === 'playing') {
      this.fireActiveWeapon(false);
    }
  }

  public togglePointerLock(): void {
    if (this.phase !== 'playing') return;
    const dom = this.renderer.domElement;
    if (document.pointerLockElement === dom) {
      try {
        document.exitPointerLock?.();
      } catch {
        // ignore
      }
      return;
    }
    try {
      const res = dom.requestPointerLock?.() as unknown as Promise<void> | undefined;
      if (res && typeof res.catch === 'function') {
        res.catch(() => {
          this.showBanner('Geser layar dengan mouse/jari untuk membidik, klik kiri/Spasi untuk menembak!', 2.6);
        });
      }
    } catch {
      this.showBanner('Geser layar dengan mouse/jari untuk membidik!', 2.4);
    }
  }

  public toggleCameraMode(): void {
    this.lastInputActivityMs = performance.now();
    const order: CameraMode[] = ['third_back', 'first_person', 'orbit'];
    const curIdx = order.indexOf(this.cameraMode);
    const nextIdx = curIdx >= 0 ? (curIdx + 1) % order.length : 0;
    this.cameraMode = order[nextIdx];
    this.applyCameraVisibilityAndControls();
    if (this.cameraMode === 'orbit') {
      this.controls.target.set(this.heroPos.x, 2.0, this.heroPos.z);
      if (this.camera.position.distanceTo(this.controls.target) < 12) {
        this.camera.position.set(this.heroPos.x, 18, this.heroPos.z + 22);
      }
      this.controls.update();
    }
    const labels: Record<CameraMode, string> = {
      third_back: 'Sudut Pandang: Kamera Belakang (Orbit 360°)',
      first_person: 'Sudut Pandang: Orang Pertama (FPS)',
      third_front: 'Sudut Pandang: Kamera Depan',
      orbit: 'Sudut Pandang: Kamera Bebas 3D',
    };
    this.showBanner(labels[this.cameraMode], 2.2);
    this.pushHud(true);
  }

  public updateSettings(partial: Partial<GameSettings>): void {
    const prevDiff = this.settings.difficulty;
    const prevFx = this.settings.fxLevel;
    this.settings = { ...this.settings, ...partial };
    if (partial.fxLevel && partial.fxLevel !== prevFx) {
      this.applyGraphicsQuality();
    }
    if (partial.aimMode === 'auto') {
      this.isAiming = false;
      this.aimToggled = false;
      this.rightAimHeld = false;
      this.aimBlend = 0;
      this.recoilPitch = 0;
      this.crosshairOnEnemy = false;
      if (document.pointerLockElement === this.renderer.domElement) {
        try {
          document.exitPointerLock?.();
        } catch {
          // ignore
        }
      }
    } else if (partial.aimMode === 'manual') {
      this.autoCamPitchActive = false;
    }
    if (partial.difficulty && partial.difficulty !== prevDiff) {
      this.syncShootersForDifficulty();
      if (this.worldMode === 'overworld') this.syncOverworldMonstersByDiff();
    }
    this.saveProgress();
    this.pushHud(true);
  }

  public toggleAimModeSetting(): void {
    const next: AimMode = this.settings.aimMode === 'auto' ? 'manual' : 'auto';
    this.updateSettings({ aimMode: next });
    this.showBanner(
      next === 'auto'
        ? 'Mode Bidik: Bidik Otomatis (Kunci Target Cerdas)'
        : 'Mode Bidik: Bidik Bebas (Crosshair & Scope)',
      2.2,
    );
  }

  public setSwimStylePreference(style: SwimStylePreference): void {
    this.swimStylePreference = style;
    if (style !== 'auto') {
      this.activeSwimStyle = style;
    }
    this.pushHud(true);
  }

  public cycleSwimStyle(): void {
    const order: SwimStylePreference[] = [
      'auto',
      'surface_paddle',
      'front_crawl',
      'underwater_glide',
      'jump_dive',
      'deep_submerge',
      'scuba_explore',
      'water_tread',
      'quick_dodge',
      'water_dash',
      'backstroke',
    ];
    const idx = order.indexOf(this.swimStylePreference);
    const next = order[(idx + 1) % order.length];
    this.setSwimStylePreference(next);
  }

  private getOceanMaxOxygen(): number {
    let bonus = 0;
    for (const gId of this.oceanGear) {
      bonus += DIVING_GEAR_DEFS[gId].maxOxygenBonus;
    }
    return 35 + bonus;
  }

  private hasUnlimitedOceanOxygen(): boolean {
    return this.swimSuitPicked || this.oceanGear.size > 0;
  }

  public enterOceanWorld(resumeSavedPos = false, preserveDiveEntry = false): void {
    if (this.worldMode === 'overworld' && !resumeSavedPos) {
      this.savedOverworldHeroPos.copy(this.heroPos);
    }
    this.clearSubScenes();

    this.overworldGroup.visible = false;
    this.worldMode = 'ocean';
    this.phase = 'playing';
    this.isSwimming = true;
    this.heroOnGround = false;
    this.heldKeys.clear();

    const oceanLowDetail =
      this.isMobileDevice || this.isLowEndMobile || this.settings.fxLevel !== 'full';
    const rig = createOceanEnvironment(this.palette, oceanLowDetail);
    this.oceanRig = rig;
    this.dungeonExitPos.copy(rig.buoyPos);

    for (const ch of rig.chests) {
      if (this.openedOceanChests.has(ch.id)) {
        ch.opened = true;
        ch.lid.rotation.x = -1.25;
        ch.beacon.visible = false;
      }
    }

    this.oceanClickables.push(...rig.clickables);

    const diff = this.settings.difficulty;
    const diffHpMult = diff === 'santai' ? 0.8 : diff === 'pendekar' ? 1.25 : 1.0;
    for (let i = 0; i < OCEAN_SEA_MONSTER_SPAWNS.length; i++) {
      const tpl = OCEAN_SEA_MONSTER_SPAWNS[i];
      const spec = MONSTER_SPECS[tpl.type];
      const mesh = createMonsterMesh(tpl.type, this.palette);
      mesh.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.castShadow = false;
          o.receiveShadow = false;
        }
      });
      mesh.position.set(tpl.x, tpl.y, tpl.z);

      const ringRadius = Math.max(1.2, spec.hitRadius * 0.85);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(ringRadius, ringRadius + 0.45, 14),
        new THREE.MeshBasicMaterial({
          color: 0x22d3ee,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.72,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.08 - spec.hoverY;
      mesh.add(ring);
      mesh.userData.combatRing = ring;
      mesh.userData.monsterId = tpl.id;
      rig.group.add(mesh);
      this.oceanClickables.push(mesh);

      const maxMobHp = Math.max(3, Math.round(tpl.maxHp * diffHpMult));
      this.oceanMonsters.push({
        id: tpl.id,
        type: tpl.type,
        name: tpl.name,
        zoneId: 'gua_portal',
        homeX: tpl.x,
        homeY: tpl.y,
        homeZ: tpl.z,
        x: tpl.x,
        y: tpl.y,
        z: tpl.z,
        maxHp: spec.quizHp,
        mobHp: maxMobHp,
        maxMobHp,
        rewardXp: tpl.rewardXp + (diff === 'pendekar' ? 10 : 0),
        rewardDiamonds: tpl.rewardDiamonds,
        rewardScore: tpl.rewardScore,
        combatOnly: true,
        isSeaMonster: true,
        aggroActive: false,
        attackCooldown: 1.0 + Math.random() * 0.8,
        windupTimer: -1,
        lungeTimer: 0,
        hitFlashTimer: 0,
        mesh,
        alive: true,
        respawnTimer: 0,
        patrolPhase: Math.random() * Math.PI * 2,
        angryTimer: 0,
      });
    }
    this.oceanTotalSpawned = this.oceanMonsters.length;

    this.scene.add(rig.group);
    this.mapHiddenOcean = this.collectMapHidden(rig.group);
    this.applyAtmosphere('ocean');

    if (resumeSavedPos && this.restoredHeroPos && this.restoredWorldMode === 'ocean') {
      const rx = THREE.MathUtils.clamp(this.restoredHeroPos.x, -40, 40);
      const rz = THREE.MathUtils.clamp(this.restoredHeroPos.z, -48, 35);
      const floorY = getOceanFloorY(rx, rz) + 0.6;
      const ry = THREE.MathUtils.clamp(this.restoredHeroPos.y, floorY, -1.2);
      this.heroPos.set(rx, ry, rz);
      this.heroYaw = this.restoredHeroPos.yaw;
    } else if (preserveDiveEntry) {
      this.heroPos.set(0, -2.35, 26);
      this.heroYaw = Math.PI;
    } else {
      this.heroPos.set(0, -5.2, 26);
      this.heroYaw = Math.PI;
    }
    this.hero.root.position.copy(this.heroPos);
    this.hero.body.rotation.y = this.heroYaw;
    this.heroVel.set(0, 0, preserveDiveEntry ? -2.2 : 0);
    this.heroVelY = preserveDiveEntry ? -3.4 : 0;
    this.oceanOxygen = this.getOceanMaxOxygen();
    this.oceanSuffocateTimer = 0;
    this.fireCoralStingTimer = 0;
    this.ridingTurtle = false;
    this.activeSwimStyle = preserveDiveEntry
      ? 'deep_submerge'
      : this.oceanGear.has('wetsuit_tank')
      ? 'scuba_explore'
      : 'underwater_glide';
    this.encounterGraceTimer = 2.0;

    this.refreshWeaponVisual();
    if (this.cameraMode === 'orbit') this.cameraMode = 'third_back';
    this.applyCameraVisibilityAndControls();
    if (!preserveDiveEntry) {
      this.snapCameraBehindHero();
    }

    soundEngine.playJumpToSwim();
    this.showBanner(
      '🐠 Selamat datang di Taman Karang Dangkal! Temukan 20 Biota Laut & cari Baju Selam sebelum turun ke Palung Abyssal!',
      5.0,
    );
    this.saveProgress();
    this.pushHud(true);
  }

  private findNearestWaterEntrySpot(x: number, z: number, yaw: number): { x: number; z: number } | null {
    for (let dist = 4; dist <= 92; dist += 4) {
      let bestSpot: { x: number; z: number; score: number } | null = null;
      for (let i = 0; i < 24; i++) {
        const ang = yaw + (i / 24) * Math.PI * 2;
        const wx = x + Math.sin(ang) * dist;
        const wz = z + Math.cos(ang) * dist;
        if (Math.abs(wx) >= WORLD_OCEAN_LIMIT - 8 || Math.abs(wz) >= WORLD_OCEAN_LIMIT - 8) continue;
        const s = sampleArchipelagoTerrain(wx, wz);
        if (!s.isLandOrBridge && s.groundY <= -0.5) {
          let angDiff = ang - yaw;
          while (angDiff > Math.PI) angDiff -= Math.PI * 2;
          while (angDiff < -Math.PI) angDiff += Math.PI * 2;
          const score = dist + Math.abs(angDiff) * 2.2;
          if (!bestSpot || score < bestSpot.score) {
            bestSpot = { x: wx, z: wz, score };
          }
        }
      }
      if (bestSpot) return { x: bestSpot.x, z: bestSpot.z };
    }
    return null;
  }

  public walkToSwimSuit(): void {
    if (this.phase !== 'playing' || this.worldMode !== 'overworld' || this.swimSuitPicked) return;
    const ss = OVERWORLD_ANCHORS.swimSuit;
    this.diveTransition = null;
    this.tapMoveTarget = new THREE.Vector3(ss.x, getArchipelagoGroundY(ss.x, ss.z), ss.z);
    this.showBanner('🩱 Menuju ke Pakaian Renang di Desa Sapaan...', 2.4);
    soundEngine.playPick();
  }

  private isHeroUnderwater(): boolean {
    if (this.worldMode === 'ocean') return true;
    if (this.worldMode !== 'overworld' || !this.isSwimming) return false;
    const divingStage =
      this.diveTransition?.active &&
      (this.diveTransition.stage === 'plunge' ||
        this.diveTransition.stage === 'submerge' ||
        this.diveTransition.stage === 'surface');
    return this.heroDiveActive || this.heroPos.y < -1.65 || Boolean(divingStage);
  }

  public toggleDiveOcean(): void {
    this.lastInputActivityMs = performance.now();
    if (this.phase !== 'playing') return;

    if (this.worldMode === 'ocean' || (this.worldMode === 'overworld' && this.isHeroUnderwater())) {
      if (this.diveTransition?.stage === 'surface') {
        this.showBanner('🫧 Sedang berenang naik ke permukaan laut...', 1.8);
        return;
      }
      this.tapMoveTarget = null;
      this.heroDiveActive = true;
      this.diveTransition = {
        active: true,
        stage: 'surface',
        timer: 0,
        bubbleTimer: 0,
      };
      soundEngine.playSplash(0.75);
      this.showBanner('🫧 Berenang naik perlahan ke permukaan laut...', 2.2);
      this.pushHud(true);
      return;
    }

    if (this.worldMode !== 'overworld') return;

    if (!this.swimSuitPicked) {
      soundEngine.playNo();
      this.showBanner(
        '🩱 Ambil Pakaian Renang di Desa Sapaan dahulu sebelum menyelam! Cek ikon Pakaian Renang di Peta.',
        3.6,
      );
      return;
    }

    if (this.diveTransition?.active) {
      if (this.diveTransition.stage === 'swim_to_water') {
        this.diveTransition = null;
        this.tapMoveTarget = null;
        this.showBanner('Menyelam dibatalkan.', 1.6);
        this.pushHud(true);
      }
      return;
    }

    const curSample = sampleArchipelagoTerrain(this.heroPos.x, this.heroPos.z);
    const alreadyOverWater = this.isSwimming || !curSample.isLandOrBridge || curSample.groundY < -0.15;
    if (alreadyOverWater) {
      this.tapMoveTarget = null;
      this.isSwimming = true;
      this.heroDiveActive = true;
      this.heroOnGround = false;
      this.oceanOxygen = Math.max(this.oceanOxygen, this.getOceanMaxOxygen());
      this.activeSwimStyle = 'jump_dive';
      this.diveTransition = {
        active: true,
        stage: 'plunge',
        timer: 0,
        bubbleTimer: 0,
      };
      soundEngine.playJumpToSwim();
      this.spawnBurst(this.heroPos.x, 0.14, this.heroPos.z, 0xbae6fd, 18);
      this.showBanner('🤿 Menyelam perlahan masuk ke dalam laut...', 2.2);
      this.pushHud(true);
      return;
    }

    const waterSpot = this.findNearestWaterEntrySpot(this.heroPos.x, this.heroPos.z, this.heroYaw);
    if (!waterSpot) {
      soundEngine.playNo();
      this.showBanner('🌊 Dekati tepi laut atau dermaga untuk mulai menyelam!', 2.5);
      return;
    }

    this.tapMoveTarget = new THREE.Vector3(waterSpot.x, -0.5, waterSpot.z);
    this.diveTransition = {
      active: true,
      stage: 'swim_to_water',
      timer: 0,
      targetX: waterSpot.x,
      targetZ: waterSpot.z,
      bubbleTimer: 0,
    };
    soundEngine.playPick();
    this.showBanner('🏊 Menuju tepi laut untuk terjun & menyelam pelan ke dasar...', 2.8);
    this.pushHud(true);
  }

  private exitOceanToSurface(): void {
    const savedX = this.savedOverworldHeroPos.x;
    const savedZ = this.savedOverworldHeroPos.z;
    const savedSample = sampleArchipelagoTerrain(savedX, savedZ);
    const savedInWater = !savedSample.isLandOrBridge || savedSample.groundY < -0.25;
    const waterSpot = savedInWater
      ? { x: savedX, z: savedZ }
      : this.findNearestWaterEntrySpot(savedX, savedZ, this.heroYaw) ?? { x: 0, z: 186 };

    this.clearSubScenes();
    this.worldMode = 'overworld';
    this.overworldGroup.visible = true;
    this.phase = 'playing';
    this.heldKeys.clear();
    this.tapMoveTarget = null;

    this.heroPos.set(waterSpot.x, -0.95, waterSpot.z);
    this.heroVel.set(0, 0, 0);
    this.heroVelY = 2.6;
    this.heroOnGround = false;
    this.isSwimming = true;
    this.heroDiveActive = false;
    this.activeSwimStyle = 'surface_paddle';
    this.hero.root.position.copy(this.heroPos);
    this.encounterGraceTimer = 2.0;

    this.refreshAreaMists();
    this.syncShootersForDifficulty();
    this.refreshWeaponVisual();
    this.applyCameraVisibilityAndControls();
    this.updateOverworldDayNightAtmosphere(0, false);
    this.snapCameraBehindHero();

    this.spawnBurst(this.heroPos.x, 0.16, this.heroPos.z, 0xbae6fd, 24);
    soundEngine.playSplash(1.05);
    this.showBanner('🌊 Berhasil berenang naik ke permukaan laut!', 2.6);
    this.saveProgress();
    this.pushHud(true);
  }

  public setOceanVerticalInput(dir: 'up' | 'down', held: boolean): void {
    this.lastInputActivityMs = performance.now();
    if (dir === 'up') this.oceanAscendHeld = held;
    else this.oceanDescendHeld = held;
  }

  public toggleOceanTurtleMount(): void {
    if (this.worldMode !== 'ocean' && !this.isHeroUnderwater() && !this.isSwimming) return;
    if (this.ridingTurtle) {
      this.ridingTurtle = false;
      soundEngine.playSplash(0.6);
      this.showBanner('🐢 Turun dari Penyu Hijau.', 1.8);
      this.pushHud(true);
      return;
    }
    if (!this.nearOceanTurtle) {
      soundEngine.playNo();
      this.showBanner('🐢 Dekati Penyu Hijau di Taman Karang untuk menungganginya!', 2.2);
      return;
    }
    this.ridingTurtle = true;
    this.discoveredBiota.add('sea_turtle');
    soundEngine.playPick();
    this.spawnBurst(this.heroPos.x, this.heroPos.y + 0.5, this.heroPos.z, 0x22c55e, 14);
    this.showBanner('🐢 Menunggangi Penyu Hijau! Karakter duduk di atas tempurungnya.', 2.8);
    this.saveProgress();
    this.pushHud(true);
  }

  private initWorldVehicles(): void {
    this.worldVehicles = [];

    // 1. Hero's Explorer SUV at Desa Sapaan
    const heroSpawn = new THREE.Vector3(0.4, getArchipelagoGroundY(0.4, 118.0), 118.0);
    const heroYaw = -Math.PI * 0.68;
    this.carRig.root.userData.driveableCar = true;
    this.carRig.root.userData.vehicleId = 'hero_car';
    this.worldVehicles.push({
      id: 'hero_car',
      name: 'Mobil Petualang',
      kind: 'hero_car',
      root: this.carRig.root,
      rig: this.carRig,
      pos: heroSpawn.clone(),
      spawnPos: heroSpawn.clone(),
      yaw: heroYaw,
      spawnYaw: heroYaw,
      speed: 0,
      steerAngle: 0,
      wheelSpin: 0,
      doorAngle: 0,
      pitchLean: 0,
      rollLean: 0,
      headlightsOn: false,
      handbrakeOn: false,
      halfW: 1.64,
      halfL: 3.2,
      height: 3.48,
      seatOffset: this.carRig.driverSeatOffset.clone(),
      boardOffset: this.carRig.boardOutsideOffset.clone(),
      driverKind: 'none',
      initialNpcDriver: false,
      npcDriverIdx: null,
      npcDriveTimer: 0,
      npcParkTimer: 0,
      npcPatrolDir: 1,
      npcHomeZone: 'desa',
      radarColor: '#38bdf8',
    });

    // 2. Police Patrol SUV in Gerbang Kota Courtyard
    if (this.archipelagoRig?.policeCar) {
      const pc = this.archipelagoRig.policeCar;
      pc.userData.driveableCar = true;
      pc.userData.vehicleId = 'police_car';
      pc.userData.skipArchipelagoCol = true;
      this.overworldClickables.push(pc);
      this.worldVehicles.push({
        id: 'police_car',
        name: 'Mobil Patroli Polisi',
        kind: 'police',
        root: pc,
        pos: pc.position.clone(),
        spawnPos: pc.position.clone(),
        yaw: pc.rotation.y,
        spawnYaw: pc.rotation.y,
        speed: 0,
        steerAngle: 0,
        wheelSpin: 0,
        doorAngle: 0,
        pitchLean: 0,
        rollLean: 0,
        headlightsOn: false,
        handbrakeOn: false,
        halfW: 1.6,
        halfL: 3.25,
        height: 3.75,
        seatOffset: new THREE.Vector3(0.62, 0.25, 0.05),
        boardOffset: new THREE.Vector3(2.45, 0, 0),
        driverKind: 'none',
        initialNpcDriver: false,
        npcDriverIdx: null,
        npcDriveTimer: 0,
        npcParkTimer: 0,
        npcPatrolDir: 1,
        npcHomeZone: 'courtyard',
        radarColor: '#60a5fa',
      });
    }

    // 3..6. Lower Highway Sedans, Taxi & City Bus
    if (this.archipelagoRig?.cars) {
      this.archipelagoRig.cars.forEach((c, idx) => {
        const vid = `hwy_car_${idx}`;
        const isBus = c.variant === 'bus';
        c.managedByEngine = true;
        c.mesh.userData.driveableCar = true;
        c.mesh.userData.vehicleId = vid;
        c.mesh.userData.skipArchipelagoCol = true;
        this.overworldClickables.push(c.mesh);
        const startDir: 1 | -1 = idx % 2 === 0 ? 1 : -1;
        const startYaw = startDir > 0 ? Math.PI / 2 : -Math.PI / 2;
        c.mesh.rotation.y = startYaw;
        this.worldVehicles.push({
          id: vid,
          name: c.name,
          kind: c.variant,
          root: c.mesh,
          pos: c.mesh.position.clone(),
          spawnPos: c.mesh.position.clone(),
          yaw: startYaw,
          spawnYaw: startYaw,
          speed: 0,
          steerAngle: 0,
          wheelSpin: 0,
          doorAngle: 0,
          pitchLean: 0,
          rollLean: 0,
          headlightsOn: false,
          handbrakeOn: false,
          halfW: c.halfX,
          halfL: c.halfZ,
          height: c.height,
          seatOffset: isBus ? new THREE.Vector3(0.8, 0.45, 3.3) : new THREE.Vector3(0.58, 0.2, 0),
          boardOffset: isBus ? new THREE.Vector3(2.5, 0, 3.1) : new THREE.Vector3(2.35, 0, 0),
          driverKind: 'none',
          initialNpcDriver: idx === 1 || idx === 2,
          npcDriverIdx: null,
          npcDriveTimer: 0,
          npcParkTimer: 0,
          npcPatrolDir: startDir,
          npcHomeZone: 'highway',
          radarColor: isBus ? '#f87171' : c.variant === 'taxi' ? '#facc15' : '#fb923c',
        });
      });
    }

    this.assignInitialNpcDrivers();
    this.activeVehicleId = 'hero_car';
    const heroCar = this.getActiveVehicle();
    if (heroCar) this.syncCarFieldsFromVehicle(heroCar);
  }

  private assignInitialNpcDrivers(): void {
    if (!this.villageRig) return;
    for (const v of this.worldVehicles) {
      if (!v.initialNpcDriver || v.driverKind !== 'none') continue;
      let bestIdx = -1;
      let bestScore = Infinity;
      for (let i = 0; i < this.villageRig.villagers.length; i++) {
        const vil = this.villageRig.villagers[i];
        if (!vil.alive || vil.drivingVehicleId) continue;
        const d = Math.hypot(vil.x - v.pos.x, vil.z - v.pos.z);
        const archetypeBonus =
          v.kind === 'bus' && vil.archetype === 'bus_driver'
            ? -200
            : vil.x < -45 && vil.z < -40
            ? -80
            : 0;
        const score = d + archetypeBonus;
        if (score < bestScore) {
          bestScore = score;
          bestIdx = i;
        }
      }
      if (bestIdx >= 0) {
        const vil = this.villageRig.villagers[bestIdx];
        vil.drivingVehicleId = v.id;
        vil.isInsideHouse = false;
        vil.fleeTimer = 0;
        v.driverKind = 'npc';
        v.npcDriverIdx = bestIdx;
        v.npcDriveTimer = 22 + Math.random() * 14;
      }
    }
  }

  private getActiveVehicle(): WorldVehicle | undefined {
    return this.worldVehicles.find((v) => v.id === this.activeVehicleId) ?? this.worldVehicles[0];
  }

  private syncCarFieldsFromVehicle(v: WorldVehicle): void {
    this.carPos.copy(v.pos);
    this.carYaw = v.yaw;
    this.carSpeed = v.speed;
    this.carSteerAngle = v.steerAngle;
    this.carWheelSpin = v.wheelSpin;
    this.carDoorAngle = v.doorAngle;
    this.carPitchLean = v.pitchLean;
    this.carRollLean = v.rollLean;
    this.carHeadlightsOn = v.headlightsOn;
    this.carHandbrakeOn = v.handbrakeOn;
  }

  private getVehicleWorldPoint(
    v: WorldVehicle,
    localOffset: THREE.Vector3,
    out = new THREE.Vector3(),
  ): THREE.Vector3 {
    const s = Math.sin(v.yaw);
    const c = Math.cos(v.yaw);
    out.set(
      v.pos.x + localOffset.x * c + localOffset.z * s,
      v.pos.y + localOffset.y,
      v.pos.z - localOffset.x * s + localOffset.z * c,
    );
    return out;
  }

  private getCarWorldPoint(localOffset: THREE.Vector3, out = new THREE.Vector3()): THREE.Vector3 {
    const active = this.getActiveVehicle();
    if (active) return this.getVehicleWorldPoint(active, localOffset, out);
    const s = Math.sin(this.carYaw);
    const c = Math.cos(this.carYaw);
    out.set(
      this.carPos.x + localOffset.x * c + localOffset.z * s,
      this.carPos.y + localOffset.y,
      this.carPos.z - localOffset.x * s + localOffset.z * c,
    );
    return out;
  }

  private isPointInsideVehicleOBB(
    v: WorldVehicle,
    px: number,
    py: number,
    pz: number,
    margin = 0.25,
    yPadBottom = 0.6,
    yPadTop = 0.7,
  ): boolean {
    const dx = px - v.pos.x;
    const dz = pz - v.pos.z;
    const span = v.halfW + v.halfL + margin + 0.5;
    if (Math.abs(dx) > span || Math.abs(dz) > span) return false;
    if (py < v.pos.y - yPadBottom || py > v.pos.y + v.height + yPadTop) return false;
    const cosY = Math.cos(v.yaw);
    const sinY = Math.sin(v.yaw);
    const lx = dx * cosY - dz * sinY;
    const lz = dx * sinY + dz * cosY;
    return Math.abs(lx) <= v.halfW + margin && Math.abs(lz) <= v.halfL + margin;
  }

  private resolveWorldVehiclesCollision(
    pos: { x: number; y?: number; z: number },
    radius = 0.62,
    entityHeight = 2.6,
    excludeVehicleId?: string,
  ): { hitVehicle: boolean; supportY: number | null } {
    let hitVehicle = false;
    let supportY: number | null = null;
    for (let i = 0; i < this.worldVehicles.length; i++) {
      const v = this.worldVehicles[i];
      if (v.id === excludeVehicleId) continue;
      const r = pushEntityFromOBB(
        pos,
        v.pos.x,
        v.pos.y,
        v.pos.z,
        v.yaw,
        v.halfW,
        v.halfL,
        v.height,
        radius,
        entityHeight,
      );
      if (r.pushed) hitVehicle = true;
      if (r.topY !== null && (supportY === null || r.topY > supportY)) supportY = r.topY;
    }
    return { hitVehicle, supportY };
  }

  private resolveVehicleOBBvsWorldVehicles(
    pos: { x: number; y?: number; z: number },
    yaw: number,
    halfW: number,
    halfL: number,
    vehicleHeight: number,
    excludeVehicleId?: string,
  ): boolean {
    const aUx = Math.cos(yaw);
    const aUz = -Math.sin(yaw);
    const aVx = Math.sin(yaw);
    const aVz = Math.cos(yaw);
    const vy = pos.y ?? 0;
    let hit = false;
    for (let i = 0; i < this.worldVehicles.length; i++) {
      const v = this.worldVehicles[i];
      if (v.id === excludeVehicleId) continue;
      if (vy + vehicleHeight <= v.pos.y + 0.05 || vy >= v.pos.y + v.height - 0.1) continue;
      const bUx = Math.cos(v.yaw);
      const bUz = -Math.sin(v.yaw);
      const bVx = Math.sin(v.yaw);
      const bVz = Math.cos(v.yaw);
      if (
        resolveOBBvsOBB(
          pos,
          halfW,
          halfL,
          aUx,
          aUz,
          aVx,
          aVz,
          v.pos.x,
          v.pos.z,
          v.halfW,
          v.halfL,
          bUx,
          bUz,
          bVx,
          bVz,
        )
      ) {
        hit = true;
      }
    }
    return hit;
  }

  private clearCarControls(): void {
    this.carCtrl.gas = false;
    this.carCtrl.brake = false;
    this.carCtrl.left = false;
    this.carCtrl.right = false;
    this.carCtrl.handbrake = false;
    this.carCtrl.boost = false;
  }

  private resetCarToParked(resetPosition = false): void {
    this.clearCarControls();
    this.carMode = 'none';
    this.carSpeed = 0;
    this.carSteerAngle = 0;
    this.carDoorAngle = 0;
    this.carPitchLean = 0;
    this.carRollLean = 0;
    this.carAnimTimer = 0;
    this.carExitBrakeWait = 0;
    this.carHornFleeTimer = 0;
    soundEngine.setCarEngine(false, 0);

    if (resetPosition) {
      if (this.villageRig) {
        for (const vil of this.villageRig.villagers) {
          vil.alive = true;
          vil.fleeTimer = 0;
          vil.drivingVehicleId = null;
          vil.vehicleCooldown = 0;
          vil.isInsideHouse = false;
          vil.bodyPivot.position.y = 0;
          vil.bodyPivot.rotation.x = 0;
          vil.leftLeg.rotation.x = 0;
          vil.rightLeg.rotation.x = 0;
          vil.root.visible = true;
          if (vil.interactable) {
            vil.interactable.x = vil.x;
            vil.interactable.z = vil.z;
          }
        }
      }
      const resetAtNight = this.getCurrentDayPhase() === 'malam';
      for (const npc of this.npcs.values()) {
        const isOnDuty = (npc.shift === 'night') === resetAtNight;
        npc.koTimer = 0;
        npc.fleeTimer = 0;
        npc.x = isOnDuty ? npc.standX : npc.offDutyX;
        npc.z = isOnDuty ? npc.standZ : npc.offDutyZ;
        npc.yaw = isOnDuty ? npc.standRotY : npc.offDutyRotY;
        npc.poseMode = 'stand';
        npc.roamPaused = true;
        npc.roamTimer = 2.0 + Math.random() * 2.5;
        npc.mesh.visible = true;
        npc.mesh.position.set(
          npc.x,
          isOnDuty ? npc.standY : npc.offDutyY,
          npc.z,
        );
        npc.aura.group.visible = isOnDuty;
        npc.aura.group.position.set(
          npc.x,
          isOnDuty ? npc.standY : npc.offDutyY,
          npc.z,
        );
      }
      for (const v of this.worldVehicles) {
        v.pos.copy(v.spawnPos);
        v.yaw = v.spawnYaw;
        v.speed = 0;
        v.steerAngle = 0;
        v.doorAngle = 0;
        v.pitchLean = 0;
        v.rollLean = 0;
        v.headlightsOn = false;
        v.handbrakeOn = false;
        v.driverKind = 'none';
        v.npcDriverIdx = null;
        v.npcDriveTimer = 0;
        v.npcParkTimer = 0;
        v.root.position.copy(v.pos);
        v.root.rotation.set(0, v.yaw, 0);
        if (v.rig) {
          updateCarRigVisuals(v.rig, {
            doorAngle: 0,
            steerAngle: 0,
            wheelSpin: v.wheelSpin,
            headlightsOn: false,
            braking: false,
            reversing: false,
            pitchLean: 0,
            rollLean: 0,
          });
        }
      }
      this.assignInitialNpcDrivers();
      this.activeVehicleId = 'hero_car';
      const heroCar = this.getActiveVehicle();
      if (heroCar) {
        this.syncCarFieldsFromVehicle(heroCar);
      } else {
        this.carPos.set(0.4, getArchipelagoGroundY(0.4, 118.0), 118.0);
        this.carYaw = -Math.PI * 0.68;
      }
    } else {
      const active = this.getActiveVehicle();
      if (active) {
        if (active.driverKind === 'player') active.driverKind = 'none';
        active.speed = 0;
        active.doorAngle = 0;
        active.pitchLean = 0;
        active.rollLean = 0;
        active.steerAngle = 0;
        active.root.position.copy(active.pos);
        active.root.rotation.set(0, active.yaw, 0);
        this.syncCarFieldsFromVehicle(active);
      }
      if (this.carRig) {
        updateCarRigVisuals(this.carRig, {
          doorAngle: 0,
          steerAngle: 0,
          wheelSpin: this.carWheelSpin,
          headlightsOn: this.carHeadlightsOn,
          braking: false,
          reversing: false,
          pitchLean: 0,
          rollLean: 0,
        });
      }
    }
    this.refreshWeaponVisual();
    this.applyCameraVisibilityAndControls();
  }

  private findSafeCarExitSpot(v?: WorldVehicle): THREE.Vector3 {
    const veh = v ?? this.getActiveVehicle();
    const board = veh ? veh.boardOffset : this.carRig.boardOutsideOffset;
    const rearZ = -(veh ? veh.halfL + 1.15 : 3.7);
    const frontZ = veh ? veh.halfL + 1.15 : 3.7;
    const candidates = [
      board,
      new THREE.Vector3(-board.x, 0, board.z),
      new THREE.Vector3(0, 0, rearZ),
      new THREE.Vector3(0, 0, frontZ),
    ];
    for (const off of candidates) {
      const p = veh ? this.getVehicleWorldPoint(veh, off) : this.getCarWorldPoint(off);
      const s = sampleArchipelagoTerrain(p.x, p.z);
      const refY = veh ? veh.pos.y : this.carPos.y;
      if (s.isLandOrBridge && s.groundY >= 0.05 && Math.abs(s.groundY - refY) < 2.2) {
        const probe = { x: p.x, y: s.groundY, z: p.z };
        if (this.villageRig) {
          resolveObstacleBoxes(probe, 0.56, this.villageRig.obstacles, s.groundY, 2.2);
        }
        if (Math.hypot(probe.x - p.x, probe.z - p.z) < 0.35) {
          p.y = s.groundY;
          return p;
        }
      }
    }
    const fallback = veh ? this.getVehicleWorldPoint(veh, board) : this.getCarWorldPoint(board);
    fallback.y = Math.max(0.1, getArchipelagoGroundY(fallback.x, fallback.z));
    if (this.villageRig) {
      resolveObstacleBoxes(fallback, 0.56, this.villageRig.obstacles, fallback.y, 2.2);
    }
    return fallback;
  }

  public enterOrExitCar(targetVehicleId?: string): void {
    this.lastInputActivityMs = performance.now();
    if (this.phase !== 'playing' || this.worldMode !== 'overworld') return;
    if (this.planeMode !== 'none') return;

    if (this.carMode === 'none') {
      let target: WorldVehicle | undefined;
      if (targetVehicleId) {
        target = this.worldVehicles.find((v) => v.id === targetVehicleId);
      } else if (this.nearVehicleId) {
        target = this.worldVehicles.find((v) => v.id === this.nearVehicleId);
      } else {
        let bestDist = Infinity;
        for (const v of this.worldVehicles) {
          if (v.driverKind !== 'none') continue;
          const d = Math.hypot(this.heroPos.x - v.pos.x, this.heroPos.z - v.pos.z);
          if (d < bestDist) {
            bestDist = d;
            target = v;
          }
        }
        if (!target) target = this.getActiveVehicle();
      }
      if (!target) return;

      if (target.driverKind === 'npc') {
        soundEngine.playNo();
        this.showBanner(`🚕 ${target.name} sedang dikendarai NPC! Cari mobil yang kosong.`, 2.4);
        return;
      }

      const doorPt = this.getVehicleWorldPoint(target, target.boardOffset);
      const distCenter = Math.hypot(this.heroPos.x - target.pos.x, this.heroPos.z - target.pos.z);
      const distDoor = Math.hypot(this.heroPos.x - doorPt.x, this.heroPos.z - doorPt.z);
      const reachRadius = target.kind === 'bus' ? 7.4 : 6.0;
      if (distCenter > reachRadius && distDoor > 4.4) {
        this.tapMoveTarget = doorPt;
        this.showBanner(`🚗 Berjalan menuju ${target.name}...`, 2.2);
        return;
      }

      this.activeVehicleId = target.id;
      target.driverKind = 'player';
      target.npcDriverIdx = null;
      target.speed = 0;
      this.syncCarFieldsFromVehicle(target);
      this.carMode = 'entering';
      this.carAnimTimer = 0;
      this.carDoorOpenPlayed = false;
      this.carDoorClosePlayed = false;
      this.carEnterStartPos.copy(this.heroPos);
      this.carEnterStartYaw = this.heroYaw;
      this.tapMoveTarget = null;
      this.heroVel.set(0, 0, 0);
      this.heroVelY = 0;
      this.heroOnGround = true;
      this.isSwimming = false;
      this.heroDiveActive = false;
      this.ridingTurtle = false;
      this.diveTransition = null;
      this.isAiming = false;
      this.aimToggled = false;
      this.hudFireHeld = false;
      this.leftFireHeld = false;
      this.clearCarControls();
      soundEngine.setWalking(false);
      soundEngine.setSwimmingAudio(false);
      this.refreshWeaponVisual();
      this.applyCameraVisibilityAndControls();
      this.showBanner(`🚗 Masuk ke ${target.name}...`, 2.0);
      this.pushHud(true);
      return;
    }

    if (this.carMode === 'driving') {
      const active = this.getActiveVehicle();
      this.carMode = 'exiting';
      this.carAnimTimer = 0;
      this.carExitBrakeWait = Math.abs(this.carSpeed) > 1.2 ? 0.3 : 0;
      this.carDoorOpenPlayed = false;
      this.carDoorClosePlayed = false;
      this.carExitSafePos.copy(this.findSafeCarExitSpot(active));
      this.clearCarControls();
      soundEngine.setCarEngine(false, 0);
      this.showBanner(`🚗 Menghentikan ${active?.name ?? 'mobil'} & keluar...`, 1.8);
      this.pushHud(true);
    }
  }

  public setCarControl(
    ctrl: 'gas' | 'brake' | 'left' | 'right' | 'handbrake' | 'boost',
    held: boolean,
  ): void {
    this.lastInputActivityMs = performance.now();
    this.carCtrl[ctrl] = held;
  }

  public toggleCarHandbrake(): void {
    this.lastInputActivityMs = performance.now();
    if (this.carMode !== 'driving') return;
    this.carHandbrakeOn = !this.carHandbrakeOn;
    const active = this.getActiveVehicle();
    if (active) active.handbrakeOn = this.carHandbrakeOn;
    soundEngine.playCarDoor(false);
    this.showBanner(
      this.carHandbrakeOn ? '🅿️ Rem Tangan AKTIF' : '🚗 Rem Tangan Dilepas',
      1.6,
    );
    this.pushHud(true);
  }

  public toggleCarHeadlights(): void {
    this.lastInputActivityMs = performance.now();
    if (this.worldMode !== 'overworld') return;
    this.carHeadlightsOn = !this.carHeadlightsOn;
    const active = this.getActiveVehicle();
    if (active) active.headlightsOn = this.carHeadlightsOn;
    soundEngine.playPick();
    this.showBanner(
      this.carHeadlightsOn ? '💡 Lampu Depan Mobil NYALA' : '💡 Lampu Depan Mobil MATI',
      1.6,
    );
    this.pushHud(true);
  }

  public honkCarHorn(): void {
    this.lastInputActivityMs = performance.now();
    if (this.worldMode !== 'overworld') return;
    soundEngine.playCarHorn();
    this.carHornFleeTimer = 0.95;
    const active = this.getActiveVehicle();
    const hx = active ? active.pos.x : this.carPos.x;
    const hy = active ? active.pos.y : this.carPos.y;
    const hz = active ? active.pos.z : this.carPos.z;
    this.spawnBurst(hx, hy + 2.2, hz, 0xfacc15, 6);
  }

  private buildCarHudState(): CarHudState | null {
    if (this.phase !== 'playing' || this.worldMode !== 'overworld') return null;
    const active =
      this.carMode !== 'none'
        ? this.getActiveVehicle()
        : this.worldVehicles.find((v) => v.id === this.nearVehicleId) ?? this.getActiveVehicle();
    const speedKmh = Math.round(Math.abs(this.carSpeed) * 3.6);
    const joyFwd = -this.virtualMove.z;
    const joySideSteerCrawl =
      Math.abs(this.virtualMove.x) > 0.32 && Math.abs(joyFwd) <= 0.16 && !this.carHandbrakeOn;
    const gasHeld =
      this.carCtrl.gas ||
      this.heldKeys.has('KeyW') ||
      this.heldKeys.has('ArrowUp') ||
      joyFwd > 0.16 ||
      joySideSteerCrawl;
    const brakeHeld =
      this.carCtrl.brake ||
      this.heldKeys.has('KeyS') ||
      this.heldKeys.has('ArrowDown') ||
      joyFwd < -0.2;
    const gear: CarHudState['gear'] =
      this.carMode !== 'driving'
        ? 'N'
        : this.carSpeed < -0.5
        ? 'R'
        : this.carSpeed > 0.5 || gasHeld
        ? 'D'
        : 'N';
    const refPos = active ? active.pos : this.carPos;
    const distanceMeters = Math.round(
      Math.hypot(this.heroPos.x - refPos.x, this.heroPos.z - refPos.z),
    );
    return {
      available: this.worldVehicles.length > 0 || Boolean(this.carRig),
      mode: this.carMode,
      nearCar: this.nearCar,
      carName: active?.name ?? 'Mobil Petualang',
      speedKmh,
      gear,
      headlightsOn: this.carHeadlightsOn,
      handbrakeOn: this.carHandbrakeOn || this.carCtrl.handbrake || this.heldKeys.has('Space'),
      braking: this.carMode === 'driving' && brakeHeld && this.carSpeed > 0.4,
      turboActive:
        this.carMode === 'driving' &&
        (this.carCtrl.boost || this.heldKeys.has('ShiftLeft') || this.heldKeys.has('ShiftRight')) &&
        gasHeld,
      distanceMeters,
    };
  }

  private static readonly PLANE_AMMO_MAX: Record<PlaneAmmoType, number> = {
    vulcan: 240,
    missile: 24,
    bomb: 8,
    plasma: 14,
  };

  private initWorldPlanes(): void {
    this.worldPlanes = [];
    for (let i = 0; i < AIRBASE_ISLANDS.length; i++) {
      const base = AIRBASE_ISLANDS[i];
      const rig = createPlaneModel({ variant: base.planeVariant });
      const spawn = getAirbaseRunwaySpawn(base);
      rig.root.position.set(spawn.pos.x, spawn.pos.y, spawn.pos.z);
      rig.root.rotation.set(0, spawn.yaw, 0);
      rig.root.userData.driveablePlane = true;
      rig.root.userData.planeId = base.planeId;
      this.overworldGroup.add(rig.root);
      this.overworldClickables.push(rig.root);

      this.worldPlanes.push({
        id: base.planeId,
        name: base.planeName,
        variant: base.planeVariant,
        airbaseId: base.id,
        radarColor: base.radarColor,
        root: rig.root,
        rig,
        pos: spawn.pos.clone(),
        spawnPos: spawn.pos.clone(),
        yaw: spawn.yaw,
        spawnYaw: spawn.yaw,
        pitch: 0,
        roll: 0,
        speed: 0,
        vy: 0,
        canopyAngle: 0,
        gearExtend: 1,
        steerAngle: 0,
        occupied: false,
        passedRings: new Set(),
      });
    }
    this.activePlaneId = this.worldPlanes[0]?.id ?? 'jet_garuda';
  }

  private getActivePlane(): WorldPlane | undefined {
    return this.worldPlanes.find((p) => p.id === this.activePlaneId) ?? this.worldPlanes[0];
  }

  private getPlaneWorldPoint(p: WorldPlane, localPt: THREE.Vector3): THREE.Vector3 {
    const out = localPt.clone();
    out.applyAxisAngle(new THREE.Vector3(0, 1, 0), p.yaw);
    out.add(p.pos);
    return out;
  }

  private clearPlaneControls(): void {
    this.planeCtrl.gas = false;
    this.planeCtrl.brake = false;
    this.planeCtrl.left = false;
    this.planeCtrl.right = false;
    this.planeCtrl.climb = false;
    this.planeCtrl.descend = false;
    this.planeCtrl.boost = false;
    this.planeFireHeld = false;
  }

  private resetPlanesToParked(resetPosition = false): void {
    this.clearPlaneControls();
    this.planeMode = 'none';
    this.planeFireCooldown = 0;
    this.planeVulcanRegenTimer = 0;
    this.planeResupplyCooldown = 0;
    this.planeAnimTimer = 0;
    if (this.bombReticleMesh) this.bombReticleMesh.visible = false;
    soundEngine.setPlaneEngine(false, 0);

    if (resetPosition) {
      this.planeAmmoCounts = { ...RpgWorldEngine.PLANE_AMMO_MAX };
      this.planeActiveAmmo = 'vulcan';
    }
    for (const p of this.worldPlanes) {
      p.occupied = false;
      p.speed = 0;
      p.vy = 0;
      p.canopyAngle = 0;
      p.gearExtend = 1;
      p.steerAngle = 0;
      p.pitch = 0;
      p.roll = 0;
      if (resetPosition) {
        p.pos.copy(p.spawnPos);
        p.yaw = p.spawnYaw;
        p.passedRings.clear();
      } else {
        const groundY = Math.max(0, getArchipelagoGroundY(p.pos.x, p.pos.z));
        if (p.pos.y > groundY + 1.5) {
          p.pos.copy(p.spawnPos);
          p.yaw = p.spawnYaw;
        } else {
          p.pos.y = groundY;
        }
      }
      p.root.position.copy(p.pos);
      p.root.rotation.set(0, p.yaw, 0);
      animatePlaneRig(p.rig, {
        speed: 0,
        throttleRatio: 0,
        turbo: false,
        canopyAngle: 0,
        gearExtend: 1,
        steerAngle: 0,
        pitchInput: 0,
        rollBank: 0,
        elapsed: this.elapsed,
      });
    }
    this.refreshWeaponVisual();
    this.applyCameraVisibilityAndControls();
  }

  private resolveHeroParkedCarCollision(): void {
    this.resolveWorldVehiclesCollision(this.heroPos, 0.62, 2.2);
    for (let i = 0; i < this.worldPlanes.length; i++) {
      const pl = this.worldPlanes[i];
      if (pl.occupied) continue;
      pushEntityFromOBB(
        this.heroPos,
        pl.pos.x,
        pl.pos.y,
        pl.pos.z,
        pl.yaw,
        1.45,
        pl.rig.halfL * 0.85,
        pl.rig.height,
        0.62,
        2.2,
      );
    }
  }

  private findSafePlaneExitSpot(pl: WorldPlane): THREE.Vector3 {
    const candidates = [
      pl.rig.boardOutsideOffset,
      new THREE.Vector3(-pl.rig.boardOutsideOffset.x, 0, pl.rig.boardOutsideOffset.z),
      new THREE.Vector3(0, 0, pl.rig.halfL + 1.5),
      new THREE.Vector3(0, 0, -(pl.rig.halfL + 1.5)),
    ];
    for (const off of candidates) {
      const pt = this.getPlaneWorldPoint(pl, off);
      const s = sampleArchipelagoTerrain(pt.x, pt.z);
      if (s.isLandOrBridge && s.groundY >= 0.05 && Math.abs(s.groundY - pl.pos.y) < 3.0) {
        pt.y = s.groundY;
        return pt;
      }
    }
    const fallback = this.getPlaneWorldPoint(pl, pl.rig.boardOutsideOffset);
    fallback.y = Math.max(0.2, getArchipelagoGroundY(fallback.x, fallback.z));
    return fallback;
  }

  public enterOrExitPlane(targetPlaneId?: string): void {
    this.lastInputActivityMs = performance.now();
    if (this.phase !== 'playing' || this.worldMode !== 'overworld') return;
    if (this.carMode !== 'none') return;

    if (this.planeMode === 'none') {
      let target: WorldPlane | undefined;
      if (targetPlaneId) {
        target = this.worldPlanes.find((p) => p.id === targetPlaneId);
      } else if (this.nearPlaneId) {
        target = this.worldPlanes.find((p) => p.id === this.nearPlaneId);
      } else {
        let bestDist = Infinity;
        for (const p of this.worldPlanes) {
          const d = Math.hypot(this.heroPos.x - p.pos.x, this.heroPos.z - p.pos.z);
          if (d < bestDist) {
            bestDist = d;
            target = p;
          }
        }
      }
      if (!target) return;

      const boardPt = this.getPlaneWorldPoint(target, target.rig.boardOutsideOffset);
      const distCenter = Math.hypot(this.heroPos.x - target.pos.x, this.heroPos.z - target.pos.z);
      const distBoard = Math.hypot(this.heroPos.x - boardPt.x, this.heroPos.z - boardPt.z);
      if (distCenter > 7.8 && distBoard > 5.2) {
        this.tapMoveTarget = boardPt;
        this.showBanner(`✈️ Berjalan menuju kokpit ${target.name}...`, 2.2);
        return;
      }

      this.activePlaneId = target.id;
      target.occupied = true;
      target.speed = 0;
      target.vy = 0;
      this.planeMode = 'entering';
      this.planeAnimTimer = 0;
      this.planeCanopyOpenPlayed = false;
      this.planeCanopyClosePlayed = false;
      this.planeEnterStartPos.copy(this.heroPos);
      this.planeEnterStartYaw = this.heroYaw;
      this.tapMoveTarget = null;
      this.heroVel.set(0, 0, 0);
      this.heroVelY = 0;
      this.heroOnGround = true;
      this.isSwimming = false;
      this.heroDiveActive = false;
      this.ridingTurtle = false;
      this.diveTransition = null;
      this.isAiming = false;
      this.aimToggled = false;
      this.hudFireHeld = false;
      this.leftFireHeld = false;
      this.clearPlaneControls();
      soundEngine.setWalking(false);
      soundEngine.setSwimmingAudio(false);
      this.refreshWeaponVisual();
      this.applyCameraVisibilityAndControls();
      this.showBanner(`✈️ Naik ke kokpit ${target.name}...`, 2.0);
      this.pushHud(true);
      return;
    }

    if (this.planeMode === 'taxi' || this.planeMode === 'flying') {
      const active = this.getActivePlane();
      if (!active) return;
      const groundS = sampleArchipelagoTerrain(active.pos.x, active.pos.z);
      const altAboveGround = active.pos.y - groundS.groundY;

      if (this.planeMode === 'flying') {
        if (groundS.isLandOrBridge && groundS.groundY >= 0.05 && altAboveGround <= 6.5) {
          // Smooth auto-flare touchdown right onto the island!
          active.pos.y = groundS.groundY;
          active.vy = 0;
          active.pitch = 0;
          active.roll = 0;
          active.gearExtend = 1;
          active.speed = Math.min(active.speed, 6);
          this.planeMode = 'taxi';
          soundEngine.playPlaneLand();
          this.spawnBurst(active.pos.x, active.pos.y + 0.3, active.pos.z, 0xe2e8f0, 12);
        } else {
          soundEngine.playNo();
          this.showBanner(
            !groundS.isLandOrBridge
              ? '🌊 Terbang di atas laut — arahkan ke pulau/runway lalu tekan Turun untuk mendarat!'
              : `🛬 Masih terlalu tinggi (${Math.round(altAboveGround)}m)! Tahan Mendarat (Ctrl) hingga mendekati pulau.`,
            2.6,
          );
          return;
        }
      }

      this.planeMode = 'exiting';
      this.planeAnimTimer = 0;
      this.planeCanopyOpenPlayed = false;
      this.planeCanopyClosePlayed = false;
      this.planeExitSafePos.copy(this.findSafePlaneExitSpot(active));
      this.clearPlaneControls();
      if (this.bombReticleMesh) this.bombReticleMesh.visible = false;
      soundEngine.setPlaneEngine(false, 0);
      this.showBanner(`✈️ Menghentikan turbin & keluar dari ${active.name}...`, 1.8);
      this.pushHud(true);
    }
  }

  public setPlaneControl(
    ctrl: 'gas' | 'brake' | 'left' | 'right' | 'climb' | 'descend' | 'boost',
    held: boolean,
  ): void {
    this.lastInputActivityMs = performance.now();
    this.planeCtrl[ctrl] = held;
  }

  public selectPlaneAmmo(ammo: PlaneAmmoType): void {
    this.lastInputActivityMs = performance.now();
    this.planeActiveAmmo = ammo;
    soundEngine.playPick();
    this.pushHud(true);
  }

  public setPlaneFireHeld(held: boolean): void {
    this.lastInputActivityMs = performance.now();
    this.planeFireHeld = held;
    if (held) {
      this.firePlaneWeapon(false);
    }
  }

  private findPlaneLockedTarget(pl: WorldPlane): {
    id: string;
    name: string;
    x: number;
    y: number;
    z: number;
    dist: number;
    kind: 'monster' | 'shooter';
  } | null {
    if (this.worldMode !== 'overworld') return null;
    const fwdX = Math.sin(pl.yaw);
    const fwdZ = Math.cos(pl.yaw);
    let best: {
      id: string;
      name: string;
      x: number;
      y: number;
      z: number;
      dist: number;
      kind: 'monster' | 'shooter';
      score: number;
    } | null = null;

    for (const m of this.getActiveMonsters()) {
      if (!m.alive || m.sunburnTimer !== undefined) continue;
      const spec = MONSTER_SPECS[m.type];
      const my = (m.y ?? getArchipelagoGroundY(m.x, m.z) + spec.hoverY) + (m.isBoss ? 2.1 : spec.hitCenterY);
      const dx = m.x - pl.pos.x;
      const dy = my - (pl.pos.y + 1.1);
      const dz = m.z - pl.pos.z;
      const dist = Math.hypot(dx, dy, dz);
      if (dist < 4 || dist > 120) continue;
      const horiz = Math.max(0.1, Math.hypot(dx, dz));
      const dot = (dx / horiz) * fwdX + (dz / horiz) * fwdZ;
      if (dot < 0.35) continue;
      const score = dot * 120 - dist * 0.45 + (m.isSkyMonster ? 18 : 0);
      if (!best || score > best.score) {
        best = { id: m.id, name: m.name, x: m.x, y: my, z: m.z, dist, kind: 'monster', score };
      }
    }

    for (const s of this.shooters) {
      if (!s.alive) continue;
      const sy = getArchipelagoGroundY(s.x, s.z) + 1.45;
      const dx = s.x - pl.pos.x;
      const dy = sy - (pl.pos.y + 1.1);
      const dz = s.z - pl.pos.z;
      const dist = Math.hypot(dx, dy, dz);
      if (dist < 4 || dist > 110) continue;
      const horiz = Math.max(0.1, Math.hypot(dx, dz));
      const dot = (dx / horiz) * fwdX + (dz / horiz) * fwdZ;
      if (dot < 0.4) continue;
      const score = dot * 110 - dist * 0.45;
      if (!best || score > best.score) {
        best = { id: s.id, name: 'Penembak', x: s.x, y: sy, z: s.z, dist, kind: 'shooter', score };
      }
    }

    if (!best) return null;
    return { id: best.id, name: best.name, x: best.x, y: best.y, z: best.z, dist: best.dist, kind: best.kind };
  }

  public firePlaneWeapon(fromHold = false): void {
    if (this.phase !== 'playing' || this.worldMode !== 'overworld') return;
    if (this.planeMode !== 'taxi' && this.planeMode !== 'flying') return;
    if (this.planeFireCooldown > 0) return;

    const pl = this.getActivePlane();
    if (!pl) return;

    let ammoType = this.planeActiveAmmo;
    if ((this.planeAmmoCounts[ammoType] ?? 0) <= 0) {
      if ((this.planeAmmoCounts.vulcan ?? 0) > 0) {
        ammoType = 'vulcan';
        this.planeActiveAmmo = 'vulcan';
      } else {
        if (!fromHold) {
          soundEngine.playNo();
          this.showBanner('⚠️ Amunisi habis! Tunggu isi otomatis Vulcan atau mendarat di Pad Hangar Pangkalan.', 2.2);
        }
        return;
      }
    }

    this.planeAmmoCounts[ammoType] = Math.max(0, this.planeAmmoCounts[ammoType] - 1);
    const locked = this.findPlaneLockedTarget(pl);
    const cosP = Math.cos(pl.pitch);
    const fwdX = Math.sin(pl.yaw) * cosP;
    const fwdY = Math.sin(pl.pitch);
    const fwdZ = Math.cos(pl.yaw) * cosP;

    this.planeMuzzleToggle = !this.planeMuzzleToggle;
    const leftWing = this.getPlaneWorldPoint(pl, pl.rig.leftWingMuzzle);
    const rightWing = this.getPlaneWorldPoint(pl, pl.rig.rightWingMuzzle);
    const belly = this.getPlaneWorldPoint(pl, pl.rig.bellyBombOffset);
    const muzzle = this.planeMuzzleToggle ? leftWing : rightWing;

    if (ammoType === 'vulcan') {
      this.planeFireCooldown = 0.11;
      const spd = 88 + Math.max(0, pl.speed);
      let vx = fwdX * spd;
      let vy = fwdY * spd;
      let vz = fwdZ * spd;
      if (locked) {
        const dx = locked.x - muzzle.x;
        const dy = locked.y - muzzle.y;
        const dz = locked.z - muzzle.z;
        const d3 = Math.max(1, Math.hypot(dx, dy, dz));
        vx = (dx / d3) * spd;
        vy = (dy / d3) * spd;
        vz = (dz / d3) * spd;
      }
      this.spawnProjectile({
        fromPlayer: true,
        fromPlane: true,
        planeAmmo: 'vulcan',
        x: muzzle.x,
        y: muzzle.y,
        z: muzzle.z,
        vx,
        vy,
        vz,
        damage: 14,
        shieldDamage: 1,
        pierceLeft: 0,
        colorHex: 0xfef08a,
      });
      this.spawnBurst(muzzle.x, muzzle.y, muzzle.z, 0xfacc15, 3);
      soundEngine.playPlaneFire('vulcan');
    } else if (ammoType === 'missile') {
      this.planeFireCooldown = 0.36;
      const spd = 62 + Math.max(0, pl.speed * 0.65);
      let vx = fwdX * spd;
      let vy = (fwdY - 0.04) * spd;
      let vz = fwdZ * spd;
      if (locked) {
        const dx = locked.x - muzzle.x;
        const dy = locked.y - muzzle.y;
        const dz = locked.z - muzzle.z;
        const d3 = Math.max(1, Math.hypot(dx, dy, dz));
        vx = (dx / d3) * spd;
        vy = (dy / d3) * spd;
        vz = (dz / d3) * spd;
      }
      this.spawnProjectile({
        fromPlayer: true,
        fromPlane: true,
        planeAmmo: 'missile',
        homingTargetId: locked?.id,
        aoeRadius: 4.5,
        explosionColor: 0xf97316,
        x: muzzle.x,
        y: muzzle.y,
        z: muzzle.z,
        vx,
        vy,
        vz,
        damage: 48,
        shieldDamage: 3,
        pierceLeft: 0,
        colorHex: 0xf97316,
      });
      this.spawnBurst(muzzle.x, muzzle.y, muzzle.z, 0xf97316, 6);
      soundEngine.playPlaneFire('missile');
    } else if (ammoType === 'bomb') {
      this.planeFireCooldown = 0.72;
      const dropSpd = Math.max(8, pl.speed * 0.72);
      this.spawnProjectile({
        fromPlayer: true,
        fromPlane: true,
        planeAmmo: 'bomb',
        gravity: 24,
        aoeRadius: 12.0,
        explosionColor: 0xf59e0b,
        x: belly.x,
        y: belly.y,
        z: belly.z,
        vx: Math.sin(pl.yaw) * dropSpd,
        vy: Math.min(-2.5, pl.vy * 0.5 - 3.5),
        vz: Math.cos(pl.yaw) * dropSpd,
        damage: 140,
        shieldDamage: 99,
        pierceLeft: 0,
        colorHex: 0xef4444,
      });
      soundEngine.playPlaneFire('bomb');
    } else {
      // Plasma Rockets: high-speed cyan shield-breaker + AoE
      this.planeFireCooldown = 0.42;
      const spd = 76 + Math.max(0, pl.speed * 0.5);
      let vx = fwdX * spd;
      let vy = fwdY * spd;
      let vz = fwdZ * spd;
      if (locked) {
        const dx = locked.x - muzzle.x;
        const dy = locked.y - muzzle.y;
        const dz = locked.z - muzzle.z;
        const d3 = Math.max(1, Math.hypot(dx, dy, dz));
        vx = (dx / d3) * spd;
        vy = (dy / d3) * spd;
        vz = (dz / d3) * spd;
      }
      this.spawnProjectile({
        fromPlayer: true,
        fromPlane: true,
        planeAmmo: 'plasma',
        aoeRadius: 6.2,
        explosionColor: 0x22d3ee,
        x: muzzle.x,
        y: muzzle.y,
        z: muzzle.z,
        vx,
        vy,
        vz,
        damage: 85,
        shieldDamage: 99,
        pierceLeft: 1,
        colorHex: 0x22d3ee,
      });
      this.spawnBurst(muzzle.x, muzzle.y, muzzle.z, 0x38bdf8, 6);
      soundEngine.playPlaneFire('plasma');
    }

    if (!fromHold) {
      this.pushHud(true);
    }
  }

  private triggerPlaneExplosionAoe(
    x: number,
    y: number,
    z: number,
    radius: number,
    damage: number,
    shieldDamage: number,
    colorHex: number,
  ): void {
    soundEngine.playBoom();
    this.spawnBurst(x, y + 0.35, z, colorHex, Math.min(34, Math.round(radius * 2.8)));
    let hitAny = false;
    let killedAny = false;

    for (const s of this.shooters) {
      if (!s.alive) continue;
      const sy = getArchipelagoGroundY(s.x, s.z) + 1.3;
      if (Math.hypot(s.x - x, sy - y, s.z - z) <= radius) {
        hitAny = true;
        s.hp -= damage;
        s.hitSquashTimer = 0.24;
        if (s.hp <= 0) {
          killedAny = true;
          s.alive = false;
          s.mesh.visible = false;
          s.respawnTimer = 0;
          this.monstersDefeated += 1;
          this.localMabarStats.kills += 1;
          this.gainXp(5);
          this.addScore(120);
          this.spawnBurst(s.x, sy + 0.5, s.z, 0xfbbf24, 16);
        }
      }
    }

    for (const m of this.getActiveMonsters()) {
      if (!m.alive || m.sunburnTimer !== undefined) continue;
      const spec = MONSTER_SPECS[m.type];
      const my = (m.y ?? getArchipelagoGroundY(m.x, m.z) + spec.hoverY) + (m.isBoss ? 2.1 : spec.hitCenterY);
      const d3 = Math.hypot(m.x - x, my - y, m.z - z);
      if (d3 <= radius + spec.hitRadius) {
        hitAny = true;
        if (m.combatOnly || m.isCaveMob) {
          const wasAlive = m.alive;
          this.damageRealTimeMonster(m, damage, m.x - x, m.z - z);
          if (wasAlive && !m.alive) killedAny = true;
        } else {
          const maxStance = spec.stanceHp;
          const nextStance = Math.max(0, (m.stanceHp ?? maxStance) - shieldDamage);
          m.stanceHp = nextStance;
          if (nextStance <= 0) {
            killedAny = true;
            this.handleRealTimeMonsterDefeated(m);
          } else {
            this.spawnBurst(m.x, my, m.z, 0x38bdf8, 8);
          }
        }
      }
    }

    if (hitAny) {
      this.triggerHitMarker(killedAny);
      this.pushHud(true);
    }
  }

  private updatePlanePhysicsAndAnimation(dt: number): void {
    const pl = this.getActivePlane();
    if (!pl) {
      this.planeMode = 'none';
      soundEngine.setPlaneEngine(false, 0);
      return;
    }

    const smoothstep = (v: number) => {
      const t = THREE.MathUtils.clamp(v, 0, 1);
      return t * t * (3 - 2 * t);
    };
    const seatPt = this.getPlaneWorldPoint(pl, pl.rig.pilotSeatOffset);
    const outsidePt = this.getPlaneWorldPoint(pl, pl.rig.boardOutsideOffset);
    let turboActive = false;
    let pitchInput = 0;

    if (this.planeMode === 'entering') {
      pl.speed = THREE.MathUtils.damp(pl.speed, 0, 10, dt);
      this.planeAnimTimer += dt;
      const t = this.planeAnimTimer;
      if (!this.planeCanopyOpenPlayed && t >= 0.05) {
        this.planeCanopyOpenPlayed = true;
        soundEngine.playPlaneCanopy(true);
      }
      if (t < 0.48) {
        const e1 = smoothstep(t / 0.48);
        this.heroPos.lerpVectors(this.planeEnterStartPos, outsidePt, e1);
        this.heroPos.y = THREE.MathUtils.lerp(this.planeEnterStartPos.y, pl.pos.y, e1);
        pl.canopyAngle = THREE.MathUtils.lerp(0, 0.92, e1);
        const faceYaw = Math.atan2(seatPt.x - this.heroPos.x, seatPt.z - this.heroPos.z);
        let dYaw = faceYaw - this.planeEnterStartYaw;
        while (dYaw > Math.PI) dYaw -= Math.PI * 2;
        while (dYaw < -Math.PI) dYaw += Math.PI * 2;
        this.heroYaw = this.planeEnterStartYaw + dYaw * e1;
      } else if (t < 1.25) {
        const e2 = smoothstep((t - 0.48) / 0.77);
        pl.canopyAngle = 0.92;
        this.heroPos.lerpVectors(outsidePt, seatPt, e2);
        this.heroPos.y += Math.sin(e2 * Math.PI) * 0.42;
        let dYaw = pl.yaw - this.heroYaw;
        while (dYaw > Math.PI) dYaw -= Math.PI * 2;
        while (dYaw < -Math.PI) dYaw += Math.PI * 2;
        this.heroYaw += dYaw * e2;
      } else {
        const e3 = smoothstep((t - 1.25) / 0.45);
        this.heroPos.copy(seatPt);
        this.heroYaw = pl.yaw;
        pl.canopyAngle = THREE.MathUtils.lerp(0.92, 0, e3);
        if (!this.planeCanopyClosePlayed && t >= 1.32) {
          this.planeCanopyClosePlayed = true;
          soundEngine.playPlaneCanopy(false);
        }
        if (t >= 1.7) {
          pl.canopyAngle = 0;
          this.planeMode = 'taxi';
          soundEngine.playPlaneTakeoff();
          this.showBanner(
            `✈️ ${pl.name} siap! Tahan Lepas Landas (Spasi) untuk terbang, atau pakai Joystick + Tembak!`,
            3.2,
          );
          this.pushHud(true);
        }
      }
      soundEngine.setPlaneEngine(true, 0.14);
    } else if (this.planeMode === 'exiting') {
      pl.speed = THREE.MathUtils.damp(pl.speed, 0, 12, dt);
      this.planeAnimTimer += dt;
      const t = this.planeAnimTimer;
      if (!this.planeCanopyOpenPlayed && t >= 0.04) {
        this.planeCanopyOpenPlayed = true;
        soundEngine.playPlaneCanopy(true);
      }
      if (t < 0.45) {
        const e1 = smoothstep(t / 0.45);
        pl.canopyAngle = THREE.MathUtils.lerp(0, 0.92, e1);
        this.heroPos.copy(seatPt);
        this.heroYaw = pl.yaw;
      } else if (t < 1.15) {
        const e2 = smoothstep((t - 0.45) / 0.7);
        pl.canopyAngle = 0.92;
        this.heroPos.lerpVectors(seatPt, this.planeExitSafePos, e2);
        this.heroPos.y += Math.sin(e2 * Math.PI) * 0.36;
      } else {
        const e3 = smoothstep((t - 1.15) / 0.4);
        this.heroPos.copy(this.planeExitSafePos);
        pl.canopyAngle = THREE.MathUtils.lerp(0.92, 0, e3);
        if (!this.planeCanopyClosePlayed && t >= 1.2) {
          this.planeCanopyClosePlayed = true;
          soundEngine.playPlaneCanopy(false);
        }
        if (t >= 1.55) {
          pl.canopyAngle = 0;
          pl.occupied = false;
          this.planeMode = 'none';
          this.heroPos.copy(this.planeExitSafePos);
          this.heroVel.set(0, 0, 0);
          this.heroVelY = 0;
          this.heroOnGround = true;
          this.refreshWeaponVisual();
          this.applyCameraVisibilityAndControls();
          this.showBanner(`🚶 Keluar dari ${pl.name}.`, 1.8);
          this.pushHud(true);
        }
      }
      soundEngine.setPlaneEngine(false, 0);
    } else if (this.planeMode === 'taxi' || this.planeMode === 'flying') {
      const joyX = THREE.MathUtils.clamp(this.virtualMove.x, -1, 1);
      const joyY = THREE.MathUtils.clamp(-this.virtualMove.z, -1, 1);
      const gasHeld =
        this.planeCtrl.gas ||
        this.heldKeys.has('KeyW') ||
        this.heldKeys.has('ArrowUp') ||
        joyY > 0.16;
      const brakeHeld =
        this.planeCtrl.brake ||
        this.heldKeys.has('KeyS') ||
        this.heldKeys.has('ArrowDown') ||
        joyY < -0.22;
      const climbHeld = this.planeCtrl.climb || this.heldKeys.has('Space');
      const descendHeld =
        this.planeCtrl.descend ||
        this.heldKeys.has('ControlLeft') ||
        this.heldKeys.has('ControlRight');
      const boostHeld =
        this.planeCtrl.boost ||
        this.heldKeys.has('ShiftLeft') ||
        this.heldKeys.has('ShiftRight');

      let steerInput = 0;
      if (this.planeCtrl.left || this.heldKeys.has('KeyA') || this.heldKeys.has('ArrowLeft')) steerInput += 1;
      if (this.planeCtrl.right || this.heldKeys.has('KeyD') || this.heldKeys.has('ArrowRight')) steerInput -= 1;
      if (Math.abs(joyX) > 0.08) steerInput -= joyX;
      steerInput = THREE.MathUtils.clamp(steerInput, -1, 1);
      pl.steerAngle = THREE.MathUtils.damp(pl.steerAngle, steerInput * 0.45, 10, dt);

      turboActive = boostHeld && (this.planeMode === 'flying' || gasHeld || climbHeld);

      if (this.planeMode === 'taxi') {
        const maxTaxi = turboActive ? 28 : 20;
        if (climbHeld || gasHeld) {
          const accel = climbHeld ? 24 : turboActive ? 26 : 16;
          pl.speed = Math.min(maxTaxi, pl.speed + accel * dt);
        } else if (brakeHeld) {
          if (pl.speed > 0.5) pl.speed = Math.max(0, pl.speed - 28 * dt);
          else pl.speed = Math.max(-6, pl.speed - 10 * dt);
        } else {
          pl.speed = THREE.MathUtils.damp(pl.speed, 0, 3.8, dt);
        }

        const steerWeight = Math.abs(pl.speed) > 0.4 ? Math.sign(pl.speed) : 1;
        pl.yaw += steerInput * 1.45 * steerWeight * dt;

        const prevX = pl.pos.x;
        const prevZ = pl.pos.z;
        pl.pos.x += Math.sin(pl.yaw) * pl.speed * dt;
        pl.pos.z += Math.cos(pl.yaw) * pl.speed * dt;
        const s = sampleArchipelagoTerrain(pl.pos.x, pl.pos.z);
        if (!s.isLandOrBridge || s.groundY < -0.05) {
          if (pl.speed > 10 && !climbHeld) {
            // Auto-liftoff off the runway edge if moving fast enough!
            this.planeMode = 'flying';
            pl.vy = 6.2;
            soundEngine.playPlaneTakeoff();
            this.showBanner('🛫 Lepas landas di ujung landasan! Terbang ke Pangkalan lain atau buru monster!', 2.6);
          } else {
            pl.pos.x = prevX;
            pl.pos.z = prevZ;
            pl.speed *= 0.4;
          }
        } else {
          pl.pos.y = THREE.MathUtils.damp(pl.pos.y, s.groundY, 18, dt);
          const airbaseObs = this.archipelagoRig.airbaseRig.obstacles;
          for (let oi = 0; oi < airbaseObs.length; oi++) {
            const obs = airbaseObs[oi];
            if (Math.abs(pl.pos.x - obs.x) < obs.halfW + 1.8 && Math.abs(pl.pos.z - obs.z) < obs.halfD + 1.8) {
              pl.pos.x = prevX;
              pl.pos.z = prevZ;
              pl.speed = Math.min(pl.speed, 2);
              break;
            }
          }
        }

        // Check Airbase Resupply Pad on ground!
        if (this.planeResupplyCooldown > 0) this.planeResupplyCooldown = Math.max(0, this.planeResupplyCooldown - dt);
        for (const pad of this.archipelagoRig.airbaseRig.resupplyPads) {
          if (
            Math.hypot(pl.pos.x - pad.pos.x, pl.pos.z - pad.pos.z) < 6.4 &&
            Math.abs(pl.pos.y - pad.pos.y) < 3.0 &&
            this.planeResupplyCooldown <= 0
          ) {
            this.planeAmmoCounts = { ...RpgWorldEngine.PLANE_AMMO_MAX };
            if (this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + 1);
            this.planeResupplyCooldown = 5.5;
            soundEngine.playUpgrade();
            this.spawnBurst(pl.pos.x, pl.pos.y + 1.4, pl.pos.z, 0x22d3ee, 18);
            this.showBanner(`🔧 Hanggar ${pad.name}: Amunisi pesawat penuh & +1 ❤️!`, 2.8);
            this.pushHud(true);
            break;
          }
        }

        // Takeoff trigger when climbHeld & speed >= 9.5 m/s
        if (climbHeld && pl.speed >= 9.5) {
          this.planeMode = 'flying';
          pl.vy = 8.5;
          pl.speed = Math.max(pl.speed, 22);
          soundEngine.playPlaneTakeoff();
          this.spawnBurst(pl.pos.x, pl.pos.y + 0.5, pl.pos.z, 0x38bdf8, 16);
          this.showBanner('🛫 Lepas Landas! Gunakan Joystick untuk belok, Tembak untuk serangan udara!', 2.6);
          this.pushHud(true);
        }

        pl.pitch = THREE.MathUtils.damp(pl.pitch, climbHeld ? 0.14 : 0, 8, dt);
        pl.roll = THREE.MathUtils.damp(pl.roll, 0, 10, dt);
        pl.gearExtend = THREE.MathUtils.damp(pl.gearExtend, 1, 10, dt);
        soundEngine.setPlaneEngine(true, Math.min(0.65, 0.2 + Math.abs(pl.speed) / 28));
      } else {
        // FLIGHT MODE: smooth arcade aerodynamics
        const targetCruise = turboActive ? 54 : gasHeld ? 40 : brakeHeld ? 18 : 29;
        pl.speed = THREE.MathUtils.damp(pl.speed, targetCruise, 3.2, dt);

        pl.yaw += steerInput * (1.28 + (turboActive ? 0.22 : 0)) * dt;
        const targetRoll = -steerInput * 0.56;
        pl.roll = THREE.MathUtils.damp(pl.roll, targetRoll, 7.5, dt);

        let targetVy = 0;
        if (climbHeld && !descendHeld) {
          targetVy = turboActive ? 19.5 : 14.5;
          pitchInput = 1;
        } else if (descendHeld && !climbHeld) {
          targetVy = -14.5;
          pitchInput = -1;
        } else if (brakeHeld && pl.speed <= 22) {
          targetVy = -4.2; // Gentle approach descent when slowing down
          pitchInput = -0.35;
        }
        pl.vy = THREE.MathUtils.damp(pl.vy, targetVy, 5.5, dt);
        const desiredPitch = THREE.MathUtils.clamp(pl.vy / 26, -0.46, 0.48);
        pl.pitch = THREE.MathUtils.damp(pl.pitch, desiredPitch, 6.5, dt);

        pl.pos.x += Math.sin(pl.yaw) * pl.speed * dt;
        pl.pos.z += Math.cos(pl.yaw) * pl.speed * dt;
        pl.pos.y = THREE.MathUtils.clamp(pl.pos.y + pl.vy * dt, 0.55, 86);

        // Keep within expansive 3-airbase flight airspace (soft turn-back clamp)
        const distOrigin = Math.hypot(pl.pos.x, pl.pos.z);
        if (distOrigin > FLIGHT_WORLD_LIMIT) {
          const k = FLIGHT_WORLD_LIMIT / distOrigin;
          pl.pos.x *= k;
          pl.pos.z *= k;
          const backYaw = Math.atan2(-pl.pos.x, -pl.pos.z);
          let dYaw = backYaw - pl.yaw;
          while (dYaw > Math.PI) dYaw -= Math.PI * 2;
          while (dYaw < -Math.PI) dYaw += Math.PI * 2;
          pl.yaw += dYaw * 2.2 * dt;
        }

        // Check ground/island/airbase beneath plane for auto-gear deploy & landing touchdown
        const sUnder = sampleArchipelagoTerrain(pl.pos.x, pl.pos.z);
        const altUnder = pl.pos.y - Math.max(0, sUnder.groundY);
        const gearReady = sUnder.isLandOrBridge && sUnder.groundY >= 0 && altUnder <= 9.0;
        pl.gearExtend = THREE.MathUtils.damp(pl.gearExtend, gearReady ? 1 : 0, 7.5, dt);

        if (sUnder.isLandOrBridge && sUnder.groundY >= 0.05 && pl.pos.y <= sUnder.groundY + 0.35 && pl.vy <= 1.2) {
          pl.pos.y = sUnder.groundY;
          pl.vy = 0;
          pl.pitch = 0;
          pl.roll = 0;
          pl.gearExtend = 1;
          pl.speed = Math.min(pl.speed, 16);
          this.planeMode = 'taxi';
          soundEngine.playPlaneLand();
          this.spawnBurst(pl.pos.x, pl.pos.y + 0.35, pl.pos.z, 0xe2e8f0, 14);
          this.showBanner('🛬 Berhasil mendarat! Tekan Turun (E) atau lanjut melaju di darat.', 2.6);
          this.pushHud(true);
        } else if (!sUnder.isLandOrBridge && pl.pos.y < 1.3 && pl.vy < 0) {
          // Sea skimming safety hydro-lift so plane never sinks into the ocean
          pl.vy = 2.8;
          pl.pos.y = Math.max(1.25, pl.pos.y);
        }

        // Sky takeoff ring challenges: speed boost + XP!
        for (const ring of this.archipelagoRig.airbaseRig.rings) {
          if (ring.cooldown > 0) continue;
          const dr = pl.pos.distanceTo(ring.pos);
          if (dr < ring.radius + 1.4) {
            ring.cooldown = 4.0;
            pl.speed = Math.min(58, pl.speed + 12);
            soundEngine.playPlaneRing();
            this.spawnBurst(ring.pos.x, ring.pos.y, ring.pos.z, ring.ringColor, 18);
            if (!pl.passedRings.has(ring.id)) {
              pl.passedRings.add(ring.id);
              this.gainXp(15);
              this.addScore(120);
              this.showBanner('✨ Cincin Langit! +15 XP · Dorongan Kecepatan!', 2.0);
            }
          }
        }

        soundEngine.setPlaneEngine(true, THREE.MathUtils.clamp((pl.speed / 54) * (turboActive ? 1.2 : 0.9), 0.35, 1.15));
      }

      // Passive Vulcan refill so pilot never gets completely stuck out of ammo
      if (this.planeAmmoCounts.vulcan < RpgWorldEngine.PLANE_AMMO_MAX.vulcan) {
        this.planeVulcanRegenTimer += dt;
        if (this.planeVulcanRegenTimer >= 0.28) {
          this.planeVulcanRegenTimer = 0;
          this.planeAmmoCounts.vulcan = Math.min(RpgWorldEngine.PLANE_AMMO_MAX.vulcan, this.planeAmmoCounts.vulcan + 1);
        }
      }

      // Bomb aiming ground reticle projection when bomb ammo is selected in flight
      if (this.bombReticleMesh) {
        if (this.planeMode === 'flying' && this.planeActiveAmmo === 'bomb') {
          const dropSpd = Math.max(8, pl.speed * 0.72);
          const v0y = Math.min(-2.5, pl.vy * 0.5 - 3.5);
          const hAbove = Math.max(1.0, pl.pos.y - Math.max(0, getArchipelagoGroundY(pl.pos.x, pl.pos.z)));
          const tFall = (v0y + Math.sqrt(v0y * v0y + 2 * 24 * hAbove)) / 24;
          const bx = pl.pos.x + Math.sin(pl.yaw) * dropSpd * tFall;
          const bz = pl.pos.z + Math.cos(pl.yaw) * dropSpd * tFall;
          const by = Math.max(0.14, getArchipelagoGroundY(bx, bz) + 0.14);
          this.bombReticleMesh.position.set(bx, by, bz);
          this.bombReticleMesh.visible = true;
        } else {
          this.bombReticleMesh.visible = false;
        }
      }

      // Continuous firing when holding Fire button / Space / Left Mouse
      if (this.planeFireHeld && this.planeFireCooldown <= 0) {
        this.firePlaneWeapon(true);
      }

      // Sync hero seated inside cockpit + plane mesh orientation
      pl.root.position.copy(pl.pos);
      pl.root.rotation.order = 'YXZ';
      pl.root.rotation.set(-pl.pitch, pl.yaw, pl.roll);

      const newSeat = this.getPlaneWorldPoint(pl, pl.rig.pilotSeatOffset);
      this.heroPos.copy(newSeat);
      this.heroYaw = pl.yaw;
      this.heroVel.set(Math.sin(pl.yaw) * pl.speed, 0, Math.cos(pl.yaw) * pl.speed);
      this.heroVelY = pl.vy;
      this.heroOnGround = this.planeMode === 'taxi';
    }

    pl.root.position.copy(pl.pos);
    if (this.planeMode !== 'taxi' && this.planeMode !== 'flying') {
      pl.root.rotation.set(0, pl.yaw, 0);
    }
    animatePlaneRig(pl.rig, {
      speed: pl.speed,
      throttleRatio: this.planeMode === 'flying' ? THREE.MathUtils.clamp(pl.speed / 44, 0.3, 1.2) : Math.abs(pl.speed) / 22,
      turbo: turboActive,
      canopyAngle: pl.canopyAngle,
      gearExtend: pl.gearExtend,
      steerAngle: pl.steerAngle,
      pitchInput,
      rollBank: pl.roll,
      elapsed: this.elapsed,
    });
  }

  private buildPlaneHudState(): PlaneHudState | null {
    if (this.phase !== 'playing' || this.worldMode !== 'overworld') return null;
    const active =
      this.planeMode !== 'none'
        ? this.getActivePlane()
        : this.worldPlanes.find((p) => p.id === this.nearPlaneId) ?? this.getActivePlane();
    if (!active) return null;

    const sUnder = sampleArchipelagoTerrain(active.pos.x, active.pos.z);
    const groundY = Math.max(0, sUnder.groundY);
    const altitudeMeters = Math.max(0, Math.round(active.pos.y - groundY));
    const canLand =
      this.planeMode === 'taxi' ||
      (this.planeMode === 'flying' && sUnder.isLandOrBridge && sUnder.groundY >= 0.05 && altitudeMeters <= 8);

    let nearestAirbaseName = AIRBASE_ISLANDS[0].name;
    let bestBaseD = Infinity;
    for (const b of AIRBASE_ISLANDS) {
      const d = Math.hypot(active.pos.x - b.cx, active.pos.z - b.cz);
      if (d < bestBaseD) {
        bestBaseD = d;
        nearestAirbaseName = b.name;
      }
    }

    const locked = this.planeMode === 'taxi' || this.planeMode === 'flying' ? this.findPlaneLockedTarget(active) : null;

    return {
      available: this.worldPlanes.length > 0,
      mode: this.planeMode,
      nearPlane: Boolean(this.nearPlaneId),
      planeId: active.id,
      planeName: active.name,
      variant: active.variant,
      speedKmh: Math.round(Math.abs(active.speed) * 3.6),
      altitudeMeters,
      canTakeoff: this.planeMode === 'taxi',
      canLand,
      turboActive:
        (this.planeMode === 'flying' || this.planeMode === 'taxi') &&
        (this.planeCtrl.boost || this.heldKeys.has('ShiftLeft') || this.heldKeys.has('ShiftRight')),
      activeAmmo: this.planeActiveAmmo,
      ammoCounts: { ...this.planeAmmoCounts },
      lockedTargetName: locked?.name ?? null,
      nearestAirbaseName,
    };
  }

  private updateCarPhysicsAndAnimation(dt: number): void {
    const active = this.getActiveVehicle();
    const hasCustomDoor = Boolean(active?.rig);
    const seatOffset = active ? active.seatOffset : this.carRig.driverSeatOffset;
    const boardOffset = active ? active.boardOffset : this.carRig.boardOutsideOffset;

    const smoothstep = (v: number) => {
      const t = THREE.MathUtils.clamp(v, 0, 1);
      return t * t * (3 - 2 * t);
    };
    const seatPt = this.getCarWorldPoint(seatOffset);
    const outsidePt = this.getCarWorldPoint(boardOffset);
    let brakingVisual = false;
    let reversingVisual = false;

    if (this.carMode === 'entering') {
      this.carSpeed = THREE.MathUtils.damp(this.carSpeed, 0, 12, dt);
      this.carAnimTimer += dt;
      const t = this.carAnimTimer;
      if (!this.carDoorOpenPlayed && t >= 0.04) {
        this.carDoorOpenPlayed = true;
        soundEngine.playCarDoor(true);
      }

      if (hasCustomDoor) {
        if (t < 0.55) {
          const e1 = smoothstep(t / 0.55);
          this.heroPos.lerpVectors(this.carEnterStartPos, outsidePt, e1);
          this.heroPos.y = THREE.MathUtils.lerp(this.carEnterStartPos.y, this.carPos.y, e1);
          this.carDoorAngle = THREE.MathUtils.lerp(0, 1.05, e1);
          const faceYaw = Math.atan2(seatPt.x - this.heroPos.x, seatPt.z - this.heroPos.z);
          let dYaw = faceYaw - this.carEnterStartYaw;
          while (dYaw > Math.PI) dYaw -= Math.PI * 2;
          while (dYaw < -Math.PI) dYaw += Math.PI * 2;
          this.heroYaw = this.carEnterStartYaw + dYaw * e1;
        } else if (t < 1.55) {
          const e2 = smoothstep((t - 0.55) / 1.0);
          this.carDoorAngle = 1.05;
          this.heroPos.lerpVectors(outsidePt, seatPt, e2);
          this.heroPos.y += Math.sin(e2 * Math.PI) * 0.16;
          const enterYaw = Math.atan2(seatPt.x - outsidePt.x, seatPt.z - outsidePt.z);
          let dYaw = this.carYaw - enterYaw;
          while (dYaw > Math.PI) dYaw -= Math.PI * 2;
          while (dYaw < -Math.PI) dYaw += Math.PI * 2;
          this.heroYaw = enterYaw + dYaw * e2;
        } else {
          const e3 = smoothstep((t - 1.55) / 0.65);
          this.heroPos.copy(seatPt);
          this.heroYaw = this.carYaw;
          this.carDoorAngle = THREE.MathUtils.lerp(1.05, 0, e3);
          if (!this.carDoorClosePlayed && t >= 1.65) {
            this.carDoorClosePlayed = true;
            soundEngine.playCarDoor(false);
          }
          if (t >= 2.2) {
            this.carDoorAngle = 0;
            this.carMode = 'driving';
            this.carHandbrakeOn = false;
            soundEngine.playCarEngineStart();
            this.showBanner(`🚗 ${active?.name ?? 'Mobil'} siap! Gunakan Gas, Rem & Turbo.`, 2.6);
            this.pushHud(true);
          }
        }
      } else {
        if (t < 0.35) {
          const e1 = smoothstep(t / 0.35);
          this.heroPos.lerpVectors(this.carEnterStartPos, outsidePt, e1);
          this.heroPos.y = THREE.MathUtils.lerp(this.carEnterStartPos.y, this.carPos.y, e1);
          const faceYaw = Math.atan2(seatPt.x - this.heroPos.x, seatPt.z - this.heroPos.z);
          let dYaw = faceYaw - this.carEnterStartYaw;
          while (dYaw > Math.PI) dYaw -= Math.PI * 2;
          while (dYaw < -Math.PI) dYaw += Math.PI * 2;
          this.heroYaw = this.carEnterStartYaw + dYaw * e1;
        } else if (t < 0.95) {
          const e2 = smoothstep((t - 0.35) / 0.6);
          this.heroPos.lerpVectors(outsidePt, seatPt, e2);
          this.heroPos.y += Math.sin(e2 * Math.PI) * 0.22;
          let dYaw = this.carYaw - this.carEnterStartYaw;
          while (dYaw > Math.PI) dYaw -= Math.PI * 2;
          while (dYaw < -Math.PI) dYaw += Math.PI * 2;
          this.heroYaw = this.carEnterStartYaw + dYaw * e2;
        } else {
          this.heroPos.copy(seatPt);
          this.heroYaw = this.carYaw;
          if (!this.carDoorClosePlayed) {
            this.carDoorClosePlayed = true;
            soundEngine.playCarDoor(false);
          }
          this.carMode = 'driving';
          this.carHandbrakeOn = false;
          soundEngine.playCarEngineStart();
          this.showBanner(`🚗 ${active?.name ?? 'Mobil'} siap dikendarai!`, 2.6);
          this.pushHud(true);
        }
      }
      soundEngine.setCarEngine(false, 0);
    } else if (this.carMode === 'exiting') {
      if (Math.abs(this.carSpeed) > 0.6 || this.carExitBrakeWait > 0) {
        this.carExitBrakeWait = Math.max(0, this.carExitBrakeWait - dt);
        this.carSpeed = THREE.MathUtils.damp(this.carSpeed, 0, 12, dt);
        this.carWheelSpin += (this.carSpeed / 0.56) * dt;
        const prevX = this.carPos.x;
        const prevZ = this.carPos.z;
        this.carPos.x += Math.sin(this.carYaw) * this.carSpeed * dt;
        this.carPos.z += Math.cos(this.carYaw) * this.carSpeed * dt;
        const s = sampleArchipelagoTerrain(this.carPos.x, this.carPos.z);
        if (!s.isLandOrBridge || s.groundY < -0.18) {
          this.carPos.x = prevX;
          this.carPos.z = prevZ;
          this.carSpeed = 0;
        } else {
          this.carPos.y = THREE.MathUtils.damp(this.carPos.y, Math.max(-0.05, s.groundY), 16, dt);
        }
        const liveSeat = this.getCarWorldPoint(seatOffset);
        this.heroPos.copy(liveSeat);
        this.heroYaw = this.carYaw;
        brakingVisual = true;
        this.carExitSafePos.copy(this.findSafeCarExitSpot(active));
      } else {
        this.carSpeed = 0;
        this.carAnimTimer += dt;
        const t = this.carAnimTimer;
        if (!this.carDoorOpenPlayed && t >= 0.03) {
          this.carDoorOpenPlayed = true;
          soundEngine.playCarDoor(true);
        }
        if (hasCustomDoor) {
          if (t < 0.6) {
            const e1 = smoothstep(t / 0.6);
            this.carDoorAngle = THREE.MathUtils.lerp(0, 1.05, e1);
            this.heroPos.copy(seatPt);
            this.heroYaw = this.carYaw;
          } else if (t < 1.35) {
            const e2 = smoothstep((t - 0.6) / 0.75);
            this.carDoorAngle = 1.05;
            this.heroPos.lerpVectors(seatPt, this.carExitSafePos, e2);
            this.heroPos.y += Math.sin(e2 * Math.PI) * 0.14;
            const outYaw = Math.atan2(this.carExitSafePos.x - seatPt.x, this.carExitSafePos.z - seatPt.z);
            let dYaw = outYaw - this.carYaw;
            while (dYaw > Math.PI) dYaw -= Math.PI * 2;
            while (dYaw < -Math.PI) dYaw += Math.PI * 2;
            this.heroYaw = this.carYaw + dYaw * e2;
          } else {
            const e3 = smoothstep((t - 1.35) / 0.6);
            this.heroPos.copy(this.carExitSafePos);
            this.carDoorAngle = THREE.MathUtils.lerp(1.05, 0, e3);
            if (!this.carDoorClosePlayed && t >= 1.45) {
              this.carDoorClosePlayed = true;
              soundEngine.playCarDoor(false);
            }
            if (t >= 1.95) {
              this.carDoorAngle = 0;
              this.carMode = 'none';
              if (active) {
                active.driverKind = 'none';
                active.speed = 0;
                active.npcParkTimer = 4.5;
              }
              this.heroPos.copy(this.carExitSafePos);
              this.heroVel.set(0, 0, 0);
              this.heroVelY = 0;
              this.heroOnGround = true;
              this.refreshWeaponVisual();
              this.applyCameraVisibilityAndControls();
              this.showBanner('🚶 Kamu keluar dari mobil.', 1.8);
              this.pushHud(true);
            }
          }
        } else {
          if (t < 0.7) {
            const e2 = smoothstep(t / 0.7);
            this.heroPos.lerpVectors(seatPt, this.carExitSafePos, e2);
            this.heroPos.y += Math.sin(e2 * Math.PI) * 0.16;
            const outYaw = Math.atan2(this.carExitSafePos.x - seatPt.x, this.carExitSafePos.z - seatPt.z);
            let dYaw = outYaw - this.carYaw;
            while (dYaw > Math.PI) dYaw -= Math.PI * 2;
            while (dYaw < -Math.PI) dYaw += Math.PI * 2;
            this.heroYaw = this.carYaw + dYaw * e2;
          } else {
            if (!this.carDoorClosePlayed) {
              this.carDoorClosePlayed = true;
              soundEngine.playCarDoor(false);
            }
            this.carDoorAngle = 0;
            this.carMode = 'none';
            if (active) {
              active.driverKind = 'none';
              active.speed = 0;
              active.npcParkTimer = 4.5;
            }
            this.heroPos.copy(this.carExitSafePos);
            this.heroVel.set(0, 0, 0);
            this.heroVelY = 0;
            this.heroOnGround = true;
            this.refreshWeaponVisual();
            this.applyCameraVisibilityAndControls();
            this.showBanner('🚶 Kamu keluar dari mobil.', 1.8);
            this.pushHud(true);
          }
        }
      }
      soundEngine.setCarEngine(false, 0);
    } else if (this.carMode === 'driving') {
      const joyX = THREE.MathUtils.clamp(this.virtualMove.x, -1, 1);
      const joyY = THREE.MathUtils.clamp(-this.virtualMove.z, -1, 1);
      const pedalOrKeyGas =
        this.carCtrl.gas || this.heldKeys.has('KeyW') || this.heldKeys.has('ArrowUp');
      const pedalOrKeyBrake =
        this.carCtrl.brake || this.heldKeys.has('KeyS') || this.heldKeys.has('ArrowDown');
      const handbrakeActive =
        this.carHandbrakeOn || this.carCtrl.handbrake || this.heldKeys.has('Space');
      const joyGas = joyY > 0.16;
      const joyBrake = joyY < -0.2;
      const joySideCrawl = Math.abs(joyX) > 0.32 && !joyGas && !joyBrake && !pedalOrKeyBrake;

      const gasInput = pedalOrKeyGas || joyGas || joySideCrawl;
      const brakeInput = pedalOrKeyBrake || joyBrake;
      const leftInput = this.carCtrl.left || this.heldKeys.has('KeyA') || this.heldKeys.has('ArrowLeft');
      const rightInput =
        this.carCtrl.right || this.heldKeys.has('KeyD') || this.heldKeys.has('ArrowRight');
      const boostInput =
        this.carCtrl.boost || this.heldKeys.has('ShiftLeft') || this.heldKeys.has('ShiftRight');

      const kbSteer = (leftInput ? 1 : 0) - (rightInput ? 1 : 0);
      const joySteer = Math.abs(joyX) > 0.08 ? -joyX : 0;
      const steerTarget = THREE.MathUtils.clamp(kbSteer + joySteer, -1, 1) * 0.54;
      this.carSteerAngle = THREE.MathUtils.damp(this.carSteerAngle, steerTarget, 11, dt);

      const joyFwdScale = pedalOrKeyGas
        ? 1
        : joyGas
        ? THREE.MathUtils.clamp((joyY - 0.16) / 0.72, 0.38, 1)
        : joySideCrawl
        ? 0.42
        : 0;
      const joyRevScale = pedalOrKeyBrake
        ? 1
        : joyBrake
        ? THREE.MathUtils.clamp((-joyY - 0.2) / 0.7, 0.4, 1)
        : 0;

      const prevSpd = this.carSpeed;
      const kindSpeedScale = active?.kind === 'bus' ? 0.86 : active?.kind === 'police' ? 1.08 : 1.0;
      const maxFwd = (boostInput && !handbrakeActive ? 32 : 23) * kindSpeedScale * Math.max(0.45, joyFwdScale);
      const maxRev = -9.5 * Math.max(0.5, joyRevScale);
      if (handbrakeActive) {
        this.carSpeed = THREE.MathUtils.damp(this.carSpeed, 0, 9.5, dt);
        brakingVisual = true;
      } else if (gasInput && !brakeInput) {
        if (this.carSpeed < 0) {
          this.carSpeed = Math.min(0, this.carSpeed + 34 * dt);
          brakingVisual = true;
        } else {
          const accel = (boostInput ? 26 : 16.5) * kindSpeedScale * Math.max(0.45, joyFwdScale);
          if (this.carSpeed > maxFwd) {
            this.carSpeed = THREE.MathUtils.damp(this.carSpeed, maxFwd, 4.5, dt);
          } else {
            this.carSpeed = Math.min(maxFwd, this.carSpeed + accel * dt);
          }
        }
      } else if (brakeInput && !gasInput) {
        if (this.carSpeed > 0.6) {
          this.carSpeed = Math.max(0, this.carSpeed - 32 * dt);
          brakingVisual = true;
        } else {
          this.carSpeed = Math.max(maxRev, this.carSpeed - 12 * Math.max(0.5, joyRevScale) * dt);
          reversingVisual = true;
        }
      } else {
        this.carSpeed *= Math.exp(-2.6 * dt);
        if (Math.abs(this.carSpeed) < 0.08) this.carSpeed = 0;
      }

      if (Math.abs(this.carSpeed) > 0.25) {
        const speedFactor = THREE.MathUtils.clamp(Math.abs(this.carSpeed) / 7.5, 0.25, 1.0);
        const turnDir = this.carSpeed >= 0 ? 1 : -1;
        this.carYaw += this.carSteerAngle * 2.15 * speedFactor * turnDir * dt;
      }

      const prevX = this.carPos.x;
      const prevZ = this.carPos.z;
      this.carPos.x += Math.sin(this.carYaw) * this.carSpeed * dt;
      this.carPos.z += Math.cos(this.carYaw) * this.carSpeed * dt;
      const carHalfW = active ? active.halfW : 1.64;
      const carHalfL = active ? active.halfL : 3.2;
      const carHeight = active ? active.height : 3.48;
      const carRadius = Math.max(carHalfW, 1.55);
      constrainHeroToWorldBounds(this.carPos, carHalfW + 0.35);

      const checkWaterEdge = sampleArchipelagoTerrain(this.carPos.x, this.carPos.z);
      if (!checkWaterEdge.isLandOrBridge || checkWaterEdge.groundY < -0.18) {
        const tryX = sampleArchipelagoTerrain(this.carPos.x, prevZ);
        const tryZ = sampleArchipelagoTerrain(prevX, this.carPos.z);
        if (tryX.isLandOrBridge && tryX.groundY >= -0.18) {
          this.carPos.z = prevZ;
        } else if (tryZ.isLandOrBridge && tryZ.groundY >= -0.18) {
          this.carPos.x = prevX;
        } else {
          this.carPos.x = prevX;
          this.carPos.z = prevZ;
        }
        this.carSpeed *= 0.25;
      }

      const preCarClimbMax = this.carPos.y + 0.58;
      if (this.isInDesaSapaanArea(this.carPos.x, this.carPos.z)) {
        resolveVehicleOBBDesaVisualTerrain(
          this.archipelagoRig,
          this.carPos,
          this.carYaw,
          carHalfW,
          carHalfL,
          preCarClimbMax,
        );
      }
      resolveVehicleOBBvsObstacles(
        this.carPos,
        this.carYaw,
        carHalfW,
        carHalfL,
        this.villageRig.obstacles,
        this.carPos.y,
        carHeight,
      );
      resolveArchipelagoVehicleCollisions(this.archipelagoRig, this.carPos, carRadius, carHeight);
      this.resolveVehicleOBBvsWorldVehicles(
        this.carPos,
        this.carYaw,
        carHalfW,
        carHalfL,
        carHeight,
        active?.id,
      );
      if (this.worldObstaclesRig) {
        resolveVehicleSolidObstacleCollisions(
          this.worldObstaclesRig,
          this.carPos,
          this.carYaw,
          carHalfW,
          carHalfL,
          carHeight,
        );
      }
      if (this.isInDesaSapaanArea(this.carPos.x, this.carPos.z)) {
        resolveVehicleOBBDesaVisualTerrain(
          this.archipelagoRig,
          this.carPos,
          this.carYaw,
          carHalfW,
          carHalfL,
          preCarClimbMax,
        );
        resolveVehicleOBBvsObstacles(
          this.carPos,
          this.carYaw,
          carHalfW,
          carHalfL,
          this.villageRig.obstacles,
          this.carPos.y,
          carHeight,
        );
      }

      const postWater = sampleArchipelagoTerrain(this.carPos.x, this.carPos.z);
      if (!postWater.isLandOrBridge || postWater.groundY < -0.18) {
        this.carPos.x = prevX;
        this.carPos.z = prevZ;
        this.carSpeed = 0;
      } else {
        const targetCarY = this.isInDesaSapaanArea(this.carPos.x, this.carPos.z)
          ? sampleDesaVisualVehicleGroundY(
              this.archipelagoRig,
              this.carPos.x,
              this.carPos.z,
              this.carYaw,
              carHalfW,
              carHalfL,
              preCarClimbMax,
              postWater.groundY,
            )
          : postWater.groundY;
        this.carPos.y = THREE.MathUtils.damp(
          this.carPos.y,
          Math.max(-0.05, targetCarY),
          16,
          dt,
        );
      }

      this.carWheelSpin += (this.carSpeed / 0.56) * dt;
      const accelRate = (this.carSpeed - prevSpd) / Math.max(0.001, dt);
      const targetPitch = THREE.MathUtils.clamp(-accelRate * 0.0022, -0.05, 0.05);
      const targetRoll = THREE.MathUtils.clamp(
        this.carSteerAngle * THREE.MathUtils.clamp(this.carSpeed / 16, -1, 1) * 0.14,
        -0.085,
        0.085,
      );
      this.carPitchLean = THREE.MathUtils.damp(this.carPitchLean, targetPitch, 10, dt);
      this.carRollLean = THREE.MathUtils.damp(this.carRollLean, targetRoll, 10, dt);

      const liveSeat = this.getCarWorldPoint(seatOffset);
      this.heroPos.copy(liveSeat);
      this.heroYaw = this.carYaw;
      this.heroVel.set(
        Math.sin(this.carYaw) * this.carSpeed,
        0,
        Math.cos(this.carYaw) * this.carSpeed,
      );
      this.heroVelY = 0;
      this.heroOnGround = true;
      this.isSwimming = false;

      this.carExhaustTimer -= dt;
      if (this.carExhaustTimer <= 0) {
        this.carExhaustTimer = boostInput ? 0.06 : Math.abs(this.carSpeed) > 3 ? 0.12 : 0.28;
        const exZ = -(active ? active.halfL + 0.1 : 3.15);
        const exPt = this.getCarWorldPoint(new THREE.Vector3(-0.92, 0.58, exZ));
        this.spawnBurst(
          exPt.x,
          exPt.y,
          exPt.z,
          boostInput && gasInput ? 0x38bdf8 : 0xcbd5e1,
          boostInput && gasInput ? 4 : 1,
        );
      }

      soundEngine.setCarEngine(
        true,
        THREE.MathUtils.clamp(Math.abs(this.carSpeed) / 26, 0, 1.25),
        boostInput && gasInput && !handbrakeActive,
      );
    }

    if (active) {
      active.pos.copy(this.carPos);
      active.yaw = this.carYaw;
      active.speed = this.carSpeed;
      active.steerAngle = this.carSteerAngle;
      active.wheelSpin = this.carWheelSpin;
      active.doorAngle = this.carDoorAngle;
      active.pitchLean = this.carPitchLean;
      active.rollLean = this.carRollLean;
      active.headlightsOn = this.carHeadlightsOn;
      active.handbrakeOn = this.carHandbrakeOn;
      active.root.position.copy(this.carPos);
      active.root.rotation.set(0, this.carYaw, 0);
      if (active.rig) {
        updateCarRigVisuals(active.rig, {
          doorAngle: this.carDoorAngle,
          steerAngle: this.carSteerAngle,
          wheelSpin: this.carWheelSpin,
          headlightsOn: this.carHeadlightsOn,
          braking: brakingVisual,
          reversing: reversingVisual || this.carSpeed < -0.5,
          pitchLean: this.carPitchLean,
          rollLean: this.carRollLean,
        });
      }
    }
  }

  private pickSafeNpcFleeDir(
    x: number,
    z: number,
    curY: number,
    prefX: number,
    prefZ: number,
  ): [number, number] {
    const baseAng = Math.hypot(prefX, prefZ) > 0.001 ? Math.atan2(prefX, prefZ) : 0;
    const offsets = [0, 0.55, -0.55, 1.1, -1.1, 1.7, -1.7, Math.PI];
    for (let k = 0; k < offsets.length; k++) {
      const a = baseAng + offsets[k];
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const px = x + dx * 2.4;
      const pz = z + dz * 2.4;
      const s = sampleArchipelagoTerrain(px, pz);
      if (s.isLandOrBridge && s.groundY >= 0.05 && Math.abs(s.groundY - curY) < 2.2) {
        return [dx, dz];
      }
    }
    return [Math.sin(baseAng), Math.cos(baseAng)];
  }

  private isNpcDrivePathClear(v: WorldVehicle, yaw: number, dist: number): boolean {
    const px = v.pos.x + Math.sin(yaw) * dist;
    const pz = v.pos.z + Math.cos(yaw) * dist;
    const s = sampleArchipelagoTerrain(px, pz);
    if (!s.isLandOrBridge || s.groundY < 0.05 || Math.abs(s.groundY - v.pos.y) > 1.4) {
      return false;
    }
    const probe = { x: px, z: pz };
    const r = v.halfW + 0.55;
    resolveObstacleBoxes(probe, r, this.villageRig.obstacles);
    if (Math.hypot(probe.x - px, probe.z - pz) > 0.35) return false;
    for (let i = 0; i < this.worldVehicles.length; i++) {
      const ov = this.worldVehicles[i];
      if (ov.id === v.id) continue;
      if (Math.hypot(ov.pos.x - px, ov.pos.z - pz) < ov.halfW + v.halfW + 2.6) return false;
    }
    return true;
  }

  private updateWorldVehiclesAndImpacts(dt: number): void {
    if (this.carHornFleeTimer > 0) {
      this.carHornFleeTimer = Math.max(0, this.carHornFleeTimer - dt);
    }

    const activeNpcDriverCount = this.worldVehicles.filter((v) => v.driverKind === 'npc').length;
    let npcBoardingsAvailable = Math.max(0, 3 - activeNpcDriverCount);

    for (let i = 0; i < this.worldVehicles.length; i++) {
      const v = this.worldVehicles[i];
      if (v.npcParkTimer > 0) v.npcParkTimer = Math.max(0, v.npcParkTimer - dt);

      const isPlayerOccupied = this.carMode !== 'none' && v.id === this.activeVehicleId;
      if (isPlayerOccupied) {
        v.driverKind = 'player';
        continue;
      }

      if (v.driverKind === 'npc') {
        const vil = v.npcDriverIdx !== null ? this.villageRig.villagers[v.npcDriverIdx] : null;
        if (!vil || !vil.alive) {
          v.driverKind = 'none';
          v.npcDriverIdx = null;
          v.speed = 0;
        } else {
          v.npcDriveTimer -= dt;
          if (v.npcDriveTimer <= 0 || this.phase !== 'playing') {
            v.speed = THREE.MathUtils.damp(v.speed, 0, 5.5, dt);
            if (Math.abs(v.speed) < 0.25) {
              v.speed = 0;
              const exitSpot = this.findSafeCarExitSpot(v);
              vil.x = exitSpot.x;
              vil.z = exitSpot.z;
              vil.root.position.copy(exitSpot);
              vil.bodyPivot.position.y = 0;
              vil.bodyPivot.rotation.x = 0;
              vil.leftLeg.rotation.x = 0;
              vil.rightLeg.rotation.x = 0;
              vil.leftArm.rotation.x = vil.baseLeftArmX;
              vil.rightArm.rotation.x = vil.baseRightArmX;
              vil.drivingVehicleId = null;
              vil.vehicleCooldown = 14;
              vil.root.visible = true;
              if (vil.interactable) {
                vil.interactable.x = vil.x;
                vil.interactable.z = vil.z;
              }
              v.driverKind = 'none';
              v.npcDriverIdx = null;
              v.npcParkTimer = 14;
            }
          } else {
            const cruiseSpd = v.kind === 'bus' ? 6.4 : v.npcHomeZone === 'highway' ? 8.6 : 7.0;
            if (v.npcHomeZone === 'highway') {
              // Gerbang Kota lower highway patrol lane
              if (v.pos.x <= -171 && v.npcPatrolDir < 0) v.npcPatrolDir = 1;
              else if (v.pos.x >= -84 && v.npcPatrolDir > 0) v.npcPatrolDir = -1;
              const desiredYaw = v.npcPatrolDir > 0 ? Math.PI / 2 : -Math.PI / 2;
              let yDiff = desiredYaw - v.yaw;
              while (yDiff > Math.PI) yDiff -= Math.PI * 2;
              while (yDiff < -Math.PI) yDiff += Math.PI * 2;
              v.yaw += yDiff * Math.min(1, dt * 4.5);

              // Check ahead for other cars / hero car
              let blockedAhead = false;
              for (let j = 0; j < this.worldVehicles.length; j++) {
                if (j === i) continue;
                const ov = this.worldVehicles[j];
                const dx = ov.pos.x - v.pos.x;
                const dz = ov.pos.z - v.pos.z;
                if (Math.abs(dz) > 4.2) continue;
                const fwd = dx * Math.sin(v.yaw) + dz * Math.cos(v.yaw);
                if (fwd > 0 && fwd < v.halfL + ov.halfL + 4.5) {
                  blockedAhead = true;
                  break;
                }
              }
              v.speed = THREE.MathUtils.damp(v.speed, blockedAhead ? 0 : cruiseSpd, 4.5, dt);
            } else {
              // Steer safely around island roads & plazas
              const aheadDist = v.halfL + 4.2;
              if (!this.isNpcDrivePathClear(v, v.yaw, aheadDist)) {
                const tryOffsets = [0.55, -0.55, 1.05, -1.05, 1.65, -1.65];
                let turned = false;
                for (let k = 0; k < tryOffsets.length; k++) {
                  const candYaw = v.yaw + tryOffsets[k];
                  if (this.isNpcDrivePathClear(v, candYaw, aheadDist)) {
                    v.yaw += Math.sign(tryOffsets[k]) * Math.min(Math.abs(tryOffsets[k]), dt * 2.8);
                    turned = true;
                    break;
                  }
                }
                if (!turned) {
                  v.yaw += dt * 2.2;
                  v.speed = THREE.MathUtils.damp(v.speed, 2.6, 5, dt);
                } else {
                  v.speed = THREE.MathUtils.damp(v.speed, cruiseSpd * 0.72, 4, dt);
                }
              } else {
                v.speed = THREE.MathUtils.damp(v.speed, cruiseSpd, 3.8, dt);
              }
            }

            const prevX = v.pos.x;
            const prevZ = v.pos.z;
            v.pos.x += Math.sin(v.yaw) * v.speed * dt;
            v.pos.z += Math.cos(v.yaw) * v.speed * dt;
            const npcCarClimbMax = v.pos.y + 0.58;
            constrainHeroToWorldBounds(v.pos, v.halfW + 0.35);
            if (this.isInDesaSapaanArea(v.pos.x, v.pos.z)) {
              resolveVehicleOBBDesaVisualTerrain(
                this.archipelagoRig,
                v.pos,
                v.yaw,
                v.halfW,
                v.halfL,
                npcCarClimbMax,
              );
            }
            resolveVehicleOBBvsObstacles(
              v.pos,
              v.yaw,
              v.halfW,
              v.halfL,
              this.villageRig.obstacles,
              v.pos.y,
              v.height,
            );
            resolveArchipelagoVehicleCollisions(this.archipelagoRig, v.pos, v.halfW, v.height);
            this.resolveVehicleOBBvsWorldVehicles(
              v.pos,
              v.yaw,
              v.halfW,
              v.halfL,
              v.height,
              v.id,
            );
            if (this.worldObstaclesRig) {
              resolveVehicleSolidObstacleCollisions(
                this.worldObstaclesRig,
                v.pos,
                v.yaw,
                v.halfW,
                v.halfL,
                v.height,
              );
            }
            const gSample = sampleArchipelagoTerrain(v.pos.x, v.pos.z);
            if (!gSample.isLandOrBridge || gSample.groundY < 0.05 || Math.abs(gSample.groundY - v.pos.y) > 1.8) {
              v.pos.x = prevX;
              v.pos.z = prevZ;
              v.speed = 0;
              if (v.npcHomeZone === 'highway') {
                v.npcPatrolDir = v.npcPatrolDir > 0 ? -1 : 1;
              } else {
                v.yaw += Math.PI * 0.65;
              }
            } else {
              const targetY = this.isInDesaSapaanArea(v.pos.x, v.pos.z)
                ? sampleDesaVisualVehicleGroundY(
                    this.archipelagoRig,
                    v.pos.x,
                    v.pos.z,
                    v.yaw,
                    v.halfW,
                    v.halfL,
                    npcCarClimbMax,
                    gSample.groundY,
                  )
                : gSample.groundY;
              v.pos.y = THREE.MathUtils.damp(v.pos.y, targetY, 14, dt);
            }
            v.wheelSpin += (v.speed / 0.56) * dt;
          }

          if (v.driverKind === 'npc' && vil.alive) {
            const seatPt = this.getVehicleWorldPoint(v, v.seatOffset);
            vil.x = seatPt.x;
            vil.z = seatPt.z;
            vil.yaw = v.yaw;
            vil.root.visible = true;
            vil.root.position.set(seatPt.x, seatPt.y, seatPt.z);
            vil.root.rotation.y = v.yaw;
            vil.bodyPivot.position.y = -0.18;
            vil.bodyPivot.rotation.x = 0.06;
            vil.leftLeg.rotation.x = -1.25;
            vil.rightLeg.rotation.x = -1.25;
            vil.leftArm.rotation.x = -0.78;
            vil.rightArm.rotation.x = -0.78;
          }
        }
      } else {
        // Unoccupied vehicle coasts safely to a stop
        if (Math.abs(v.speed) > 0.05) {
          v.speed *= Math.exp(-3.4 * dt);
          const prevX = v.pos.x;
          const prevZ = v.pos.z;
          v.pos.x += Math.sin(v.yaw) * v.speed * dt;
          v.pos.z += Math.cos(v.yaw) * v.speed * dt;
          const coastClimbMax = v.pos.y + 0.58;
          if (this.isInDesaSapaanArea(v.pos.x, v.pos.z)) {
            resolveVehicleOBBDesaVisualTerrain(
              this.archipelagoRig,
              v.pos,
              v.yaw,
              v.halfW,
              v.halfL,
              coastClimbMax,
            );
          }
          resolveVehicleOBBvsObstacles(
            v.pos,
            v.yaw,
            v.halfW,
            v.halfL,
            this.villageRig.obstacles,
            v.pos.y,
            v.height,
          );
          this.resolveVehicleOBBvsWorldVehicles(
            v.pos,
            v.yaw,
            v.halfW,
            v.halfL,
            v.height,
            v.id,
          );
          if (this.worldObstaclesRig) {
            resolveVehicleSolidObstacleCollisions(
              this.worldObstaclesRig,
              v.pos,
              v.yaw,
              v.halfW,
              v.halfL,
              v.height,
            );
          }
          const s = sampleArchipelagoTerrain(v.pos.x, v.pos.z);
          if (!s.isLandOrBridge || s.groundY < -0.1) {
            v.pos.x = prevX;
            v.pos.z = prevZ;
            v.speed = 0;
          } else {
            const targetY = this.isInDesaSapaanArea(v.pos.x, v.pos.z)
              ? sampleDesaVisualVehicleGroundY(
                  this.archipelagoRig,
                  v.pos.x,
                  v.pos.z,
                  v.yaw,
                  v.halfW,
                  v.halfL,
                  coastClimbMax,
                  s.groundY,
                )
              : s.groundY;
            v.pos.y = THREE.MathUtils.damp(v.pos.y, targetY, 14, dt);
          }
          v.wheelSpin += (v.speed / 0.56) * dt;
          if (Math.abs(v.speed) < 0.16) v.speed = 0;
        } else {
          v.speed = 0;
        }

        // Strict NPC Boarding Rule: ONLY if completely unoccupied, stationary (|speed| < 0.25), and hero is away
        if (
          npcBoardingsAvailable > 0 &&
          this.phase === 'playing' &&
          v.npcParkTimer <= 0 &&
          v.driverKind === 'none' &&
          Math.abs(v.speed) < 0.25 &&
          Math.hypot(this.heroPos.x - v.pos.x, this.heroPos.z - v.pos.z) > 13.0
        ) {
          for (let j = 0; j < this.villageRig.villagers.length; j++) {
            const vil = this.villageRig.villagers[j];
            if (
              !vil.alive ||
              vil.isInsideHouse ||
              vil.drivingVehicleId ||
              vil.vehicleCooldown > 0 ||
              vil.fleeTimer > 0
            ) {
              continue;
            }
            const dVil = Math.hypot(vil.x - v.pos.x, vil.z - v.pos.z);
            const vilY = getArchipelagoGroundY(vil.x, vil.z);
            if (dVil < 7.5 && Math.abs(vilY - v.pos.y) < 3.0) {
              v.driverKind = 'npc';
              v.npcDriverIdx = j;
              v.npcDriveTimer = 16 + Math.random() * 14;
              vil.drivingVehicleId = v.id;
              vil.fleeTimer = 0;
              npcBoardingsAvailable -= 1;
              break;
            }
          }
        }
      }

      v.root.position.copy(v.pos);
      v.root.rotation.set(0, v.yaw, 0);
      if (v.rig && !(this.carMode !== 'none' && v.id === this.activeVehicleId)) {
        updateCarRigVisuals(v.rig, {
          doorAngle: v.doorAngle,
          steerAngle: v.steerAngle,
          wheelSpin: v.wheelSpin,
          headlightsOn: v.headlightsOn,
          braking: false,
          reversing: false,
          pitchLean: v.pitchLean,
          rollLean: v.rollLean,
        });
      }
      if (v.id === this.activeVehicleId && this.carMode === 'none') {
        this.syncCarFieldsFromVehicle(v);
      }
    }

    // Rebuild live vehicle hazards for Villagers & Quest NPCs + village collision avoidance
    this.activeVehicleHazards.length = 0;
    for (let i = 0; i < this.worldVehicles.length; i++) {
      const v = this.worldVehicles[i];
      this.activeVehicleHazards.push({
        id: v.id,
        x: v.pos.x,
        y: v.pos.y,
        z: v.pos.z,
        vx: Math.sin(v.yaw) * v.speed,
        vz: Math.cos(v.yaw) * v.speed,
        yaw: v.yaw,
        speed: v.speed,
        halfW: v.halfW,
        halfL: v.halfL,
        honking: this.carHornFleeTimer > 0 && v.id === this.activeVehicleId,
      });
    }

    if (this.phase !== 'playing') return;

    const isOverworldGuest = this.multiplayerActive && !this.isWorldAuthority();

    // Moving cars crush & kill Monsters and hit & kill exposed NPCs!
    for (let i = 0; i < this.worldVehicles.length; i++) {
      const v = this.worldVehicles[i];
      const absSpd = Math.abs(v.speed);
      if (absSpd < 2.2) continue;

      const byPlayer = v.driverKind === 'player';

      // 1. Overworld Monsters (surface combat, quiz, coastal sea, low-flying sky)
      const hitMonster = (m: RoamingMonster): boolean => {
        if (!m.alive || m.sunburnTimer !== undefined) return false;
        const spec = MONSTER_SPECS[m.type];
        const my = m.y ?? getArchipelagoGroundY(m.x, m.z) + spec.hoverY;
        if (m.isSkyMonster && my > v.pos.y + v.height + 1.25) return false;
        const pad = 0.5 + spec.hitRadius * 0.55;
        if (!this.isPointInsideVehicleOBB(v, m.x, my + spec.hitCenterY, m.z, pad, 1.2, 1.4)) {
          return false;
        }
        if (byPlayer) {
          if (isOverworldGuest) {
            m.hitFlashTimer = 0.25;
            this.spawnBurst(m.x, my + 1.4, m.z, 0xfacc15, 18);
            soundEngine.playBoom();
            this.triggerHitMarker(true);
            this.emitMultiplayerPacket({
              t: 'm_hit',
              id: m.id,
              dmg: 999,
              dx: Math.sin(v.yaw) * v.speed,
              dz: Math.cos(v.yaw) * v.speed,
              md: 'overworld',
            });
          } else {
            this.triggerHitMarker(true);
            this.handleRealTimeMonsterDefeated(m);
            this.showBanner(`🚗 ${m.name} tertabrak & hancur oleh ${v.name}!`, 2.2);
          }
        } else {
          // NPC-driven vehicle crushes monster cleanly
          m.alive = false;
          m.respawnTimer = this.isOverworldChallengeNoRespawn()
            ? 0
            : m.isSeaMonster
            ? 45
            : m.isSkyMonster
            ? 50
            : 0;
          m.aggroActive = false;
          m.windupTimer = -1;
          m.lungeTimer = 0;
          m.mesh.visible = false;
          if (!m.isSeaMonster && !m.isSkyMonster) {
            if (m.mesh.parent) m.mesh.parent.remove(m.mesh);
            const clickIdx = this.overworldClickables.indexOf(m.mesh);
            if (clickIdx >= 0) this.overworldClickables.splice(clickIdx, 1);
          }
          if (this.worldMode === 'overworld') {
            this.checkMissionWaveCompletion();
          }
          if (this.multiplayerActive && this.hasConnectedPeers && this.isWorldAuthority()) {
            this.emitMultiplayerPacket({
              t: 'm_kill',
              id: m.id,
              killerUid: 'npc_driver',
              killerName: v.name,
              assists: [],
              isQuiz: false,
              md: 'overworld',
              zn: m.zoneId,
            });
          }
          soundEngine.playBoom();
          this.spawnBurst(m.x, my + 1.5, m.z, 0xfacc15, 24);
        }
        v.speed *= 0.88;
        return true;
      };

      for (let mi = 0; mi < this.monsters.length; mi++) hitMonster(this.monsters[mi]);
      for (let si = 0; si < this.seaMonsters.length; si++) hitMonster(this.seaMonsters[si]);
      for (let ki = 0; ki < this.skyMonsters.length; ki++) hitMonster(this.skyMonsters[ki]);

      // 2. Enemy Shooters
      for (let si = 0; si < this.shooters.length; si++) {
        const s = this.shooters[si];
        if (!s.alive || s.sunburnTimer !== undefined) continue;
        const sy = getArchipelagoGroundY(s.x, s.z);
        if (!this.isPointInsideVehicleOBB(v, s.x, sy + 1.2, s.z, 0.75, 1.0, 1.2)) continue;
        if (byPlayer && isOverworldGuest) {
          s.hitSquashTimer = 0.24;
          soundEngine.playBoom();
          this.spawnBurst(s.x, sy + 1.5, s.z, 0xfbbf24, 18);
          this.emitMultiplayerPacket({
            t: 'm_hit',
            id: s.id,
            dmg: 999,
            dx: Math.sin(v.yaw) * v.speed,
            dz: Math.cos(v.yaw) * v.speed,
            md: 'overworld',
            isSh: true,
          });
        } else {
          s.alive = false;
          s.mesh.visible = false;
          s.respawnTimer = 0;
          if (s.isNightShooter) {
            const savedEntry = this.nightShooterSaved.find((entry) => entry.id === s.id);
            if (savedEntry) savedEntry.alive = false;
          }
          if (this.multiplayerActive && this.hasConnectedPeers && this.isWorldAuthority()) {
            const hostUid = byPlayer ? this.localMultiplayerUid || 'host' : 'npc_driver';
            this.emitMultiplayerPacket({
              t: 'm_kill',
              id: s.id,
              killerUid: hostUid,
              killerName: byPlayer ? this.localPlayerName : v.name,
              assists: [],
              isSh: true,
              md: 'overworld',
            });
          }
          if (byPlayer) {
            this.monstersDefeated += 1;
            this.localMabarStats.kills += 1;
            this.gainXp(5);
            this.addScore(120);
            this.triggerHitMarker(true);
            this.showBanner(`🚗 Penembak Liar tertabrak & hancur oleh ${v.name}! (+5 XP)`, 2.2);
          }
          soundEngine.playBoom();
          this.spawnBurst(s.x, sy + 1.6, s.z, 0xfbbf24, 22);
        }
        v.speed *= 0.88;
      }

      // 3. NPCs hit by fast cars (>= 2.6 m/s)
      if (absSpd >= 2.6) {
        for (let vi = 0; vi < this.villageRig.villagers.length; vi++) {
          const vil = this.villageRig.villagers[vi];
          if (!vil.alive || vil.isInsideHouse || vil.drivingVehicleId) continue;
          const vy = getArchipelagoGroundY(vil.x, vil.z);
          if (!this.isPointInsideVehicleOBB(v, vil.x, vy + 1.1, vil.z, 0.42, 0.8, 0.8)) continue;
          vil.alive = false;
          vil.root.visible = false;
          if (vil.interactable) {
            vil.interactable.x = 9999;
            vil.interactable.z = 9999;
          }
          soundEngine.playHurt();
          this.spawnBurst(vil.x, vy + 1.4, vil.z, 0xef4444, 20);
          if (byPlayer) {
            this.showBanner(`💥 Warga desa tertabrak ${v.name}!`, 2.6);
          }
          v.speed *= 0.84;
        }

        for (const [npcId, npc] of this.npcs.entries()) {
          if (npc.koTimer > 0) continue;
          const ny = getArchipelagoGroundY(npc.x, npc.z);
          if (!this.isPointInsideVehicleOBB(v, npc.x, ny + 1.2, npc.z, 0.45, 0.8, 0.8)) continue;
          npc.koTimer = 15.0;
          npc.fleeTimer = 0;
          npc.mesh.visible = false;
          npc.alertMesh.visible = false;
          npc.aura.group.visible = false;
          if (this.nearbyNpcId === npcId) this.nearbyNpcId = null;
          const def = getZoneNpcById(npcId);
          soundEngine.playHurt();
          this.spawnBurst(npc.x, ny + 1.5, npc.z, 0xef4444, 22);
          if (byPlayer) {
            this.showBanner(`💥 ${def?.name ?? 'Warga'} tertabrak ${v.name} & pingsan 15 detik!`, 2.8);
          }
          v.speed *= 0.84;
        }
      }
    }
  }


  private interactWithOceanChest(ch: OceanSupplyChest): void {
    if (ch.opened) return;
    ch.opened = true;
    this.openedOceanChests.add(ch.id);
    ch.beacon.visible = false;
    soundEngine.playWin();
    this.spawnBurst(ch.x, ch.y + 0.8, ch.z, 0xfacc15, 24);

    const parts: string[] = [];
    if (ch.rewardGear && !this.oceanGear.has(ch.rewardGear)) {
      this.oceanGear.add(ch.rewardGear);
      const def = DIVING_GEAR_DEFS[ch.rewardGear];
      this.oceanOxygen = this.getOceanMaxOxygen();
      parts.push(`🦺 Dapat ${def.name}!`);
      if (ch.rewardGear === 'wetsuit_tank') {
        this.activeSwimStyle = 'scuba_explore';
      }
    }
    if (ch.rewardMaterials.pearl) {
      this.oceanMaterials.pearl += ch.rewardMaterials.pearl;
      parts.push(`+${ch.rewardMaterials.pearl} Mutiara`);
    }
    if (ch.rewardMaterials.fiber) {
      this.oceanMaterials.fiber += ch.rewardMaterials.fiber;
      parts.push(`+${ch.rewardMaterials.fiber} Serat`);
    }
    if (ch.rewardMaterials.calcium) {
      this.oceanMaterials.calcium += ch.rewardMaterials.calcium;
      parts.push(`+${ch.rewardMaterials.calcium} Kalsium`);
    }
    if (ch.rewardMaterials.shell) {
      this.oceanMaterials.shell += ch.rewardMaterials.shell;
      parts.push(`+${ch.rewardMaterials.shell} Cangkang`);
    }
    if (ch.rewardMaterials.food) {
      this.oceanMaterials.food += ch.rewardMaterials.food;
      parts.push(`+${ch.rewardMaterials.food} Makanan`);
    }
    this.gainXp(25);
    this.addScore(180);
    this.showBanner(`🧰 ${ch.label} terbuka! ${parts.join(' · ')}`, 4.2);
    this.saveProgress();
    this.pushHud(true);
  }

  private collectOceanPickup(pk: OceanPickup): void {
    if (!pk.active) return;
    pk.active = false;
    pk.mesh.visible = false;
    pk.respawnTimer = TUNE.itemBackSec;

    if (pk.kind === 'heart') {
      this.hp = Math.min(this.maxHp, this.hp + 1);
      this.addScore(40);
      this.spawnBurst(pk.x, pk.y + 0.4, pk.z, 0xf43f5e, 14);
      soundEngine.playPick();
      this.showBanner('❤️ Nyawa Bawah Laut +1!', 2.2);
    } else if (pk.kind === 'diamond') {
      this.diamonds += 1;
      this.addScore(80);
      this.gainXp(15);
      this.spawnBurst(pk.x, pk.y + 0.4, pk.z, 0x38bdf8, 14);
      soundEngine.playPick();
      this.showBanner('💎 Berlian Bawah Laut +1!', 2.2);
    } else if (pk.kind === 'weapon' && pk.weaponId) {
      const wid = pk.weaponId;
      const wDef = WEAPONS[wid];
      const newlyUnlocked = !this.ownedWeapons.has(wid);
      this.ownedWeapons.add(wid);
      this.activeWeapon = wid;
      const slotIdx = WEAPON_ORDER.indexOf(wid);
      if (slotIdx >= 0) {
        this.activeHotbarSlot = slotIdx;
      }
      this.weaponAmmo[wid] = Math.min(MAX_AMMO, (this.weaponAmmo[wid] ?? 0) + wDef.packSize);
      this.refreshWeaponVisual();
      this.gainXp(newlyUnlocked ? 25 : 12);
      this.addScore(newlyUnlocked ? 150 : 60);
      this.spawnBurst(pk.x, pk.y + 0.4, pk.z, wDef.colorHex, 20);
      soundEngine.playPick();
      this.showBanner(
        newlyUnlocked
          ? `🔫 Senjata Bawah Laut Terbuka: ${wDef.name}! (+${wDef.packSize} Peluru)`
          : `🔫 Isi Ulang ${wDef.name} (+${wDef.packSize} Peluru)`,
        3.2,
      );
    }
    this.saveProgress();
    this.pushHud(true);
  }

  private interactWithBiotaNode(node: OceanBiotaNode): void {
    const entry = SEA_BIOTA_BY_ID[node.speciesId];
    if (!entry) return;
    if (!this.discoveredBiota.has(node.speciesId)) {
      this.discoveredBiota.add(node.speciesId);
      this.gainXp(10);
      this.addScore(35);
    }
    if (entry.mountable) {
      this.toggleOceanTurtleMount();
      return;
    }
    if (node.harvestCooldown > 0) {
      soundEngine.playNo();
      this.showBanner(`⏳ ${entry.indoName} sedang memulihkan diri (${Math.ceil(node.harvestCooldown)}d).`, 1.8);
      return;
    }
    if (!entry.yieldKind) {
      soundEngine.playPick();
      this.showBanner(`🐠 ${entry.indoName} (${entry.rarity}) tercatat di Ensiklopedia Laut!`, 2.4);
      this.saveProgress();
      this.pushHud(true);
      return;
    }
    node.harvestCooldown = 14;
    this.oceanMaterials[entry.yieldKind] += 1;
    if (entry.yieldKind === 'shell') {
      this.addScore(25);
    }
    this.gainXp(8);
    this.addScore(30);
    soundEngine.playPick();
    this.spawnBurst(node.x, node.y + 0.5, node.z, 0x22d3ee, 10);
    const labelMap: Record<keyof OceanMaterials, string> = {
      pearl: '⚪ Mutiara +1',
      fiber: '🌿 Serat Kelp +1',
      calcium: '🪸 Kalsium Karang +1',
      shell: '🐚 Cangkang +1',
      food: '🍤 Makanan Laut +1',
    };
    this.showBanner(`✨ Panen ${entry.indoName}: ${labelMap[entry.yieldKind]}!`, 2.4);
    this.saveProgress();
    this.pushHud(true);
  }

  public craftOrBuyDivingGear(gearId: DivingGearId, method: 'craft' | 'diamond'): void {
    const def = DIVING_GEAR_DEFS[gearId];
    if (!def) return;
    if (this.oceanGear.has(gearId)) {
      soundEngine.playNo();
      this.showBanner(`✓ ${def.name} sudah kamu miliki!`, 2.0);
      return;
    }
    if (method === 'craft') {
      const need = def.craftCost;
      if (
        (need.pearl && this.oceanMaterials.pearl < need.pearl) ||
        (need.fiber && this.oceanMaterials.fiber < need.fiber) ||
        (need.calcium && this.oceanMaterials.calcium < need.calcium) ||
        (need.shell && this.oceanMaterials.shell < need.shell) ||
        (need.food && this.oceanMaterials.food < need.food)
      ) {
        soundEngine.playNo();
        this.showBanner('Bahan laut belum cukup! Panen Karang, Kelp, atau Kerang dulu.', 2.4);
        return;
      }
      if (need.pearl) this.oceanMaterials.pearl -= need.pearl;
      if (need.fiber) this.oceanMaterials.fiber -= need.fiber;
      if (need.calcium) this.oceanMaterials.calcium -= need.calcium;
      if (need.shell) this.oceanMaterials.shell -= need.shell;
      if (need.food) this.oceanMaterials.food -= need.food;
    } else {
      if (this.diamonds < def.diamondCost) {
        soundEngine.playNo();
        this.showBanner(`Butuh ${def.diamondCost} 💎 untuk membuka ${def.name}!`, 2.4);
        return;
      }
      this.diamonds -= def.diamondCost;
    }

    this.oceanGear.add(gearId);
    this.oceanOxygen = this.getOceanMaxOxygen();
    if (gearId === 'wetsuit_tank') {
      this.activeSwimStyle = 'scuba_explore';
    }
    soundEngine.playWin();
    this.spawnBurst(this.heroPos.x, this.heroPos.y + 1.0, this.heroPos.z, 0x38bdf8, 22);
    this.showBanner(`🤿 Perlengkapan Dibuat: ${def.name}! Max O₂ sekarang ${this.oceanOxygen}!`, 3.6);
    this.saveProgress();
    this.pushHud(true);
  }

  public eatOceanFood(): void {
    if (this.oceanMaterials.food <= 0) {
      soundEngine.playNo();
      this.showBanner('Makanan Laut habis! Tangkap Lobster Berduri atau Kepiting Kotak.', 2.2);
      return;
    }
    if (this.hp >= this.maxHp) {
      soundEngine.playNo();
      this.showBanner('Nyawa (❤️) sudah penuh!', 1.8);
      return;
    }
    this.oceanMaterials.food -= 1;
    this.hp = Math.min(this.maxHp, this.hp + 1);
    soundEngine.playPick();
    this.spawnBurst(this.heroPos.x, this.heroPos.y + 1.1, this.heroPos.z, 0xf43f5e, 14);
    this.showBanner(`🍤 Memakan hasil laut segar! Nyawa pulih (${this.hp}/${this.maxHp} ❤️)`, 2.4);
    this.saveProgress();
    this.pushHud(true);
  }

  public equipWeapon(id: WeaponId): void {
    if (!this.ownedWeapons.has(id)) return;
    this.activeWeapon = id;
    const slotIdx = WEAPON_ORDER.indexOf(id);
    if (slotIdx >= 0) this.activeHotbarSlot = slotIdx;
    this.refreshWeaponVisual();
    soundEngine.playPick();
    this.saveProgress();
    this.pushHud(true);
  }

  public buyAmmoWithDiamonds(): boolean {
    if (!this.ownedWeapons.size || this.diamonds < AMMO_COST) {
      soundEngine.playNo();
      return false;
    }
    const w = WEAPONS[this.activeWeapon];
    if (this.weaponAmmo[this.activeWeapon] >= MAX_AMMO) {
      soundEngine.playNo();
      return false;
    }
    this.diamonds -= AMMO_COST;
    this.weaponAmmo[this.activeWeapon] = Math.min(
      MAX_AMMO,
      this.weaponAmmo[this.activeWeapon] + w.packSize,
    );
    soundEngine.playPick();
    this.saveProgress();
    this.pushHud(true);
    return true;
  }

  public startAmmoQuiz(): void {
    const pool = [...VOCAB_CATALOG].sort(() => Math.random() - 0.5).slice(0, 3);
    this.phase = 'learning';
    this.heldKeys.clear();
    this.callbacks.onStartLearning({
      mode: 'quiz',
      title: 'Kuis Isi Peluru Gratis (+6 Peluru)',
      minPct: 60,
      wordIds: pool.map((v) => v.id),
      isAmmoQuiz: true,
    });
    this.pushHud(true);
  }

  public startQuickLearning(mode: LearningSessionContext['mode'], catId?: number, zoneId?: ZoneId): void {
    const pool =
      catId !== undefined
        ? VOCAB_CATALOG.filter((v) => v.catId === catId)
        : zoneId
        ? getWordsForZone(zoneId)
        : VOCAB_CATALOG;
    const count = mode === 'match' ? 8 : 10;
    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    this.phase = 'learning';
    this.heldKeys.clear();
    this.callbacks.onStartLearning({
      mode,
      title: catId !== undefined ? `Latihan Kategori` : zoneId ? ZONE_INFO[zoneId].name : 'Mode Belajar Cepat',
      zoneId,
      catId,
      minPct: 60,
      wordIds: picked.map((v) => v.id),
    });
    this.pushHud(true);
  }

  public openDungeonDoor(doorIndex: number): void {
    if (this.worldMode !== 'dungeon' || !this.dungeonState) return;
    const zId = this.dungeonState.zoneId;
    const door = ZONE_DOORS[zId][doorIndex];
    if (!door) return;

    const cleared = new Set(this.dungeonState.doorsCleared);
    if (doorIndex === 4) {
      const ready =
        cleared.has(0) &&
        cleared.has(1) &&
        cleared.has(2) &&
        cleared.has(3) &&
        this.dungeonState.monstersRemaining === 0;
      if (!ready) {
        soundEngine.playNo();
        this.showBanner(
          'Selesaikan Pintu 1–4 & semua Monster Kata area ini dulu sebelum membuka Pintu Bos!',
          3.4,
        );
        return;
      }
    }

    if (door.mode === 'duel') {
      const mini = DOOR_MINI_MONSTER[zId];
      this.phase = 'battle';
      this.heldKeys.clear();
      soundEngine.playBoss();
      this.callbacks.onStartBattle({
        monsterId: `door1_${zId}`,
        monsterType: mini.type,
        monsterName: mini.name,
        zoneId: zId,
        isIeltsBoss: false,
        monsterHp: mini.hp,
        monsterMaxHp: mini.hp,
        roundNumber: 1,
        doorIndex: 1,
      });
      this.pushHud(true);
      return;
    }

    const deal = this.getOrCreateAreaDeal(zId);
    const wordIds = deal.doorWords[doorIndex] || getWordsForZone(zId).slice(0, 10).map((v) => v.id);
    this.phase = 'learning';
    this.heldKeys.clear();
    soundEngine.playDoor();
    this.callbacks.onStartLearning({
      mode: door.mode,
      title: `${door.name} — ${door.modeLabel}`,
      zoneId: zId,
      doorIndex,
      minPct: door.minPct,
      wordIds,
    });
    this.pushHud(true);
  }

  public recordWordAttempt(vocabId: string, ok: boolean, noLevel = false): void {
    const prev = this.wordProgress[vocabId] || { b: 0, r: 0, w: 0 };
    const next: WordProgress = {
      b: ok ? (noLevel ? prev.b : Math.min(5, prev.b + 1)) : Math.max(0, prev.b - 1),
      r: ok ? prev.r + 1 : prev.r,
      w: ok ? prev.w : prev.w + 1,
    };
    this.wordProgress[vocabId] = next;
    this.wordProgressDirty = true;

    const t = todayKey();
    if (this.dailyDate !== t) {
      this.dailyDate = t;
      this.dailyCount = 0;
    }
    this.dailyCount += 1;
  }

  public completeLearningSession(
    ctx: LearningSessionContext,
    pct: number,
    xpEarned: number,
    cekCepatPassed?: boolean,
  ): void {
    this.phase = 'playing';
    this.localMabarStats.challenges += 1;
    if (xpEarned > 0) {
      this.gainXp(xpEarned);
      this.addScore(xpEarned * 12);
    }
    if (pct >= 70) {
      this.gainXp(20); // Bab 7: +20 XP session completion bonus
      this.addScore(180);
    }

    if (ctx.isAmmoQuiz) {
      if (pct >= 60 && this.ownedWeapons.size > 0) {
        this.weaponAmmo[this.activeWeapon] = Math.min(
          MAX_AMMO,
          this.weaponAmmo[this.activeWeapon] + 6,
        );
        soundEngine.playPick();
        this.showBanner(`Berhasil! +6 Peluru untuk ${WEAPONS[this.activeWeapon].name}!`, 3.2);
      } else {
        this.showBanner('Skor belum cukup 60% untuk bonus peluru. Coba lagi!', 2.6);
      }
      this.saveProgress();
      this.pushHud(true);
      return;
    }

    // Check Door Clear inside Dungeon
    if (
      ctx.zoneId &&
      ctx.doorIndex !== undefined &&
      this.worldMode === 'dungeon' &&
      this.dungeonState &&
      this.dungeonState.zoneId === ctx.zoneId
    ) {
      const passed = pct >= ctx.minPct;
      if (passed) {
        const list = this.areaDoorsCleared[ctx.zoneId] || [];
        if (!list.includes(ctx.doorIndex)) {
          this.areaDoorsCleared[ctx.zoneId] = [...list, ctx.doorIndex];
        }
        this.dungeonState.doorsCleared = [...this.areaDoorsCleared[ctx.zoneId]];

        const storyLine = DOOR_RESTORED_STORY[ctx.zoneId]?.[ctx.doorIndex];
        if (ctx.doorIndex === 0 && cekCepatPassed) {
          this.hp = Math.min(this.maxHp, this.hp + 1);
          this.showBanner(
            `${storyLine || `Pintu "${ctx.title}" terbuka!`} (+1 Hati ditemukan!)`,
            4.2,
          );
        } else {
          this.showBanner(storyLine || `Pintu "${ctx.title}" Berhasil Dibuka!`, 4.0);
        }
        soundEngine.playWin();

        if (ctx.doorIndex === 4 && !this.dungeonState.bossDefeated && !this.dungeonState.bossSpawned) {
          this.spawnDungeonBoss(ctx.zoneId);
        }
        this.updateDungeonDoorVisuals();
        this.emitProgressSync();
      } else {
        soundEngine.playNo();
        this.showBanner(`Butuh minimal ${ctx.minPct}% untuk membuka pintu ini (Skor: ${pct}%).`, 3.4);
      }
    }

    if (ctx.zoneId) {
      this.checkAreaTrophy(ctx.zoneId);
    }
    this.saveProgress();
    this.pushHud(true);
  }

  private spawnDungeonBoss(zoneId: ZoneId): void {
    if (!this.dungeonRig || !this.dungeonState) return;
    const boss = BOSSES[zoneId];
    this.dungeonState.bossSpawned = true;
    const mesh = createMonsterMesh(boss.monsterType, this.palette, 1.65);
    mesh.position.set(0, 0, -9);
    mesh.userData.monsterId = boss.id;
    this.dungeonRig.group.add(mesh);
    this.dungeonClickables.push(mesh);

    this.dungeonMonsters.push({
      id: boss.id,
      type: boss.monsterType,
      name: boss.name,
      zoneId,
      homeX: 0,
      homeZ: -9,
      x: 0,
      z: -9,
      maxHp: boss.hpPerPhase * boss.phases,
      rewardXp: 250,
      rewardDiamonds: 5,
      rewardScore: 950,
      isBoss: true,
      mesh,
      alive: true,
      respawnTimer: 0,
      patrolPhase: 0,
      angryTimer: 0,
    });

    this.bossBoulderTimer = 1.6;
    const defeatedSet = new Set(this.zoneCaveDetails[zoneId]?.defeatedEnemyIds || []);
    const guardCount = this.settings.difficulty === 'santai' ? 1 : 2;
    const guardCoords: Array<[number, number]> = [
      [-12, -8],
      [12, -8],
    ];
    for (let i = 0; i < guardCount; i++) {
      const guardId = `boss_guard_${i}`;
      const isGuardAlive = !defeatedSet.has(guardId);
      const [gx, gz] = guardCoords[i];
      const gMesh = createShooterMesh(this.palette);
      gMesh.position.set(gx, 0, gz);
      gMesh.visible = isGuardAlive;
      this.dungeonRig.group.add(gMesh);
      this.shooters.push({
        id: guardId,
        x: gx,
        z: gz,
        homeX: gx,
        homeZ: gz,
        hp: 3,
        cooldown: 1.3 + i * 0.6,
        phase: i * 1.9,
        walkPhase: i * 1.9,
        recoilTimer: 0,
        hitSquashTimer: 0,
        prevX: gx,
        prevZ: gz,
        mesh: gMesh,
        alive: isGuardAlive,
        respawnTimer: 0,
      });
    }

    this.dungeonTotalSpawned += 1 + guardCount;
    this.syncDungeonMonsterStats();

    soundEngine.playBoss();
    this.spawnBurst(0, 2.5, -9, 0xef4444, 34);
    this.showBanner(
      `AWAS! BOS ${boss.name.toUpperCase()} + BATU RUNTUH & PENGAWAL MUNCUL!`,
      4.8,
    );
  }

  private syncDungeonMonsterStats(): void {
    if (this.worldMode !== 'dungeon' || !this.dungeonState) return;
    const remaining =
      this.dungeonMonsters.filter((m) => m.alive).length +
      this.shooters.filter((s) => s.alive).length;
    const total = Math.max(this.dungeonTotalSpawned, remaining);
    const defeated = Math.max(0, total - remaining);
    this.dungeonState.allEnemiesRemaining = remaining;
    this.dungeonState.allEnemiesTotal = total;
    this.dungeonState.allEnemiesDefeated = defeated;
    this.zoneCaveProgress[this.dungeonState.zoneId] = {
      defeated,
      remaining,
      total,
    };
  }

  public recordIeltsScore(
    skill: 'listening' | 'reading' | 'writing' | 'speaking' | 'full',
    pct: number,
  ): void {
    this.ieltsScores[skill] = Math.max(this.ieltsScores[skill] || 0, pct);
    this.localMabarStats.challenges += 1;
    const xpGain = skill === 'full' ? Math.round(pct / 5) + 30 : Math.round(pct / 5);
    this.gainXp(xpGain);
    this.addScore(xpGain * 20);
    if (pct >= 70 && skill === 'full') {
      this.ieltsCleared = true;
    }
    if (pct >= 70) soundEngine.playWin();
    else soundEngine.playWrongAnswer();
    this.showBanner(
      `Selesai Ujian ${skill.toUpperCase()} (${pct}%) · +${xpGain} XP!`,
      4.0,
    );
    this.saveProgress();
    this.pushHud(true);
  }

  private checkAreaTrophy(zoneId: ZoneId): void {
    if (this.areaTrophies.has(zoneId)) return;
    const words = getWordsForZone(zoneId);
    if (words.length === 0) return;
    let seen = 0;
    let mastered = 0;
    for (const w of words) {
      const p = this.wordProgress[w.id];
      if (p && p.r + p.w > 0) seen++;
      if (p && p.b >= 3) mastered++;
    }
    if (seen / words.length >= 0.6 && mastered / words.length >= 0.2) {
      this.areaTrophies.add(zoneId);
      this.diamonds += 5;
      this.maxHp = Math.min(TUNE.hpCap, this.maxHp + 1);
      this.hp = this.maxHp;
      soundEngine.playFanfare();
      this.showBanner(
        `TROFI PENGUASAAN ${ZONE_INFO[zoneId].name}! +5 💎, Nyawa Penuh & +1 Max ❤️!`,
        4.6,
      );
    }
  }

  public teleportToZone(zoneId: ZoneId): void {
    if (this.worldMode !== 'overworld') {
      this.exitDungeon();
    }
    const z = ZONE_INFO[zoneId];
    if (!z) return;
    const target = { x: z.x - 1.5, z: z.z + 5.0 };
    constrainToWalkableArchipelago(target, 0.8);
    const ty = getArchipelagoGroundY(target.x, target.z);
    this.heroPos.set(target.x, ty, target.z);
    this.heroVel.set(0, 0, 0);
    this.heroVelY = 0;
    this.heroOnGround = true;
    this.isSwimming = false;
    this.refreshWeaponVisual();
    this.tapMoveTarget = null;
    this.hero.root.position.copy(this.heroPos);
    this.applyCameraVisibilityAndControls();
    this.snapCameraBehindHero();
    this.encounterGraceTimer = 1.8;
    this.spawnBurst(this.heroPos.x, ty + 1.5, this.heroPos.z, 0x38bdf8, 18);
    soundEngine.playDoor();
    this.showBanner(`Berpindah ke ${z.name}`, 2.5);
    this.pushHud(true);
  }

  public acceptQuest(npcId: string): void {
    const q = this.quests.find((item) => item.npcId === npcId);
    if (!q) return;
    if (!q.accepted) {
      q.accepted = true;
      this.showBanner(`Misi Diterima: ${q.title}`, 3.0);
      soundEngine.playBuild();
    } else if (q.progress >= q.target && !q.claimed) {
      q.claimed = true;
      this.gainXp(q.rewardXp);
      this.diamonds += q.rewardDiamonds;
      this.addScore(q.rewardXp * 3);
      this.hp = Math.min(this.maxHp, this.hp + 1);
      soundEngine.playQuestComplete();
      this.showBanner(
        `Hadiah Misi Diklaim! +${q.rewardXp} XP · +${q.rewardDiamonds} 💎!`,
        3.6,
      );
    }
    this.saveProgress();
    this.pushHud(true);
  }

  public learnVocabFromNpc(vocabIds: string[]): void {
    let newlySeen = 0;
    for (const id of vocabIds) {
      if (!this.wordProgress[id]) {
        this.wordProgress[id] = { b: 1, r: 1, w: 0 };
        this.wordProgressDirty = true;
        newlySeen++;
      }
    }
    if (newlySeen > 0) {
      this.gainXp(newlySeen * 5);
      this.addScore(newlySeen * 25);
      this.saveProgress();
      this.pushHud(true);
    }
  }

  public startIeltsTrial(): void {
    this.enterAcademy();
  }

  public applyBattleAnswer(
    correct: boolean,
    vocabId: string,
    options?: {
      shieldBlocked?: boolean;
      duelHitStreak?: number;
      duelAmmoGained?: number;
      isAcademyMini?: boolean;
    },
  ): { ammoAwarded: number } {
    let ammoAwarded = 0;
    if (!options?.isAcademyMini && VOCAB_BY_ID[vocabId]) {
      this.recordWordAttempt(vocabId, correct, false);
    }

    if (correct) {
      this.streak += 1;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
      this.addScore(100 + this.streak * 20);
      this.gainXp(2); // Bab 8: +2 XP per duel hit
      if (this.ownedWeapons.size > 0 && (options?.duelAmmoGained || 0) < 10) {
        const bonus = (options?.duelHitStreak || 1) % 3 === 0 ? 2 : 1;
        const allowed = Math.min(bonus, 10 - (options?.duelAmmoGained || 0));
        this.weaponAmmo[this.activeWeapon] = Math.min(
          MAX_AMMO,
          this.weaponAmmo[this.activeWeapon] + allowed,
        );
        ammoAwarded = allowed;
      }
      soundEngine.playOk();
    } else {
      this.streak = 0;
      soundEngine.playWrongAnswer();
      if (!options?.shieldBlocked) {
        this.hp = Math.max(0, this.hp - 1);
      }
    }
    this.saveProgress();
    this.pushHud(true);
    return { ammoAwarded };
  }

  public healOneHeart(): void {
    this.hp = Math.min(this.maxHp, this.hp + 1);
    soundEngine.playPick();
    this.pushHud(true);
  }

  public finishBattle(
    outcome: 'victory' | 'defeat' | 'fled',
    battle: BattleContext,
  ): void {
    this.encounterGraceTimer = outcome === 'victory' ? TUNE.invKill : TUNE.invHit;

    if (outcome === 'fled') {
      const fledMonster = this.getActiveMonsters().find((item) => item.id === battle.monsterId);
      if (fledMonster) fledMonster.stanceHp = 3;
      this.hp = Math.max(0, this.hp - 1);
      this.streak = 0;
      _forward.set(Math.sin(this.heroYaw), 0, Math.cos(this.heroYaw));
      this.heroVel.addScaledVector(_forward, -16);
      if (this.hp <= 0) {
        this.lastDefeatReason = 'Kehabisan nyawa saat kabur dari duel';
        if (this.worldMode !== 'overworld') {
          this.triggerDefeatExit(battle.zoneId);
        } else {
          this.phase = 'gameover';
          soundEngine.playLose();
        }
      } else {
        this.phase = 'playing';
        this.triggerDamageFlash(1, 'Kehabisan nyawa saat kabur dari duel');
        this.showBanner('Berhasil kabur dari duel (-1 ❤️)', 2.4);
      }
      this.saveProgress();
      this.pushHud(true);
      return;
    }

    if (outcome === 'defeat' || this.hp <= 0) {
      const lostMonster = this.getActiveMonsters().find((item) => item.id === battle.monsterId);
      this.lastDefeatReason = lostMonster
        ? `Kalah duel melawan ${lostMonster.name}`
        : 'Kalah dalam duel kuis melawan monster';
      if (this.worldMode !== 'overworld') {
        this.triggerDefeatExit(battle.zoneId);
      } else {
        this.phase = 'gameover';
        soundEngine.playLose();
        this.pushHud(true);
      }
      return;
    }

    // Victory!
    this.phase = 'playing';
    this.monstersDefeated += 1;
    this.localMabarStats.challenges += 1;

    // Door 1 Mini-Monster Duel Clear
    if (battle.doorIndex === 1 && this.worldMode === 'dungeon' && this.dungeonState) {
      const zId = this.dungeonState.zoneId;
      const list = this.areaDoorsCleared[zId] || [];
      if (!list.includes(1)) {
        this.areaDoorsCleared[zId] = [...list, 1];
      }
      this.dungeonState.doorsCleared = [...this.areaDoorsCleared[zId]];
      this.gainXp(25);
      this.addScore(320);
      this.updateDungeonDoorVisuals();
      this.emitProgressSync();
      soundEngine.playWin();
      const duelLine = DOOR_RESTORED_STORY[zId]?.[1];
      this.showBanner(
        duelLine || `Pintu Duel "${ZONE_DOORS[zId][1].name}" Berhasil Dibuka!`,
        4.0,
      );
      this.checkAreaTrophy(zId);
      this.saveProgress();
      this.pushHud(true);
      return;
    }

    if (this.worldMode === 'academy' && battle.isAcademyShadow) {
      const m = this.academyMonsters.find((item) => item.id === battle.monsterId);
      if (m) {
        m.alive = false;
        m.mesh.visible = false;
        m.respawnTimer = 0;
        this.defeatedAcademyEnemyIds.add(m.id);
      }
      this.gainXp(45);
      this.addScore(350);
      soundEngine.playWin();
      this.showBanner(`${battle.monsterName} dikalahkan! +45 XP!`, 3.0);
    } else if (this.worldMode === 'dungeon' && this.dungeonState) {
      const m = this.dungeonMonsters.find((item) => item.id === battle.monsterId);
      if (m) {
        m.alive = false;
        m.mesh.visible = false;
        m.respawnTimer = 0;
        this.markDungeonEnemyDefeated(this.dungeonState.zoneId, m.id);
        // Mark all carried words seen/mastered boost
        if (m.wordIds) {
          m.wordIds.forEach((wId) => {
            if (!this.wordProgress[wId]) {
              this.wordProgress[wId] = { b: 1, r: 1, w: 0 };
              this.wordProgressDirty = true;
            }
          });
        }
        this.gainXp(m.rewardXp);
        this.addScore(m.rewardScore);
        this.spawnBurst(m.x, 2.0, m.z, 0xfacc15, 28);
      }

      if (battle.isZoneBoss) {
        const zId = this.dungeonState.zoneId;
        const boss = BOSSES[zId];
        const caveStory = ZONE_CAVE_STORIES[zId];
        this.defeatedBossZones.add(zId);
        this.emitProgressSync();
        this.dungeonState.bossDefeated = true;
        this.dungeonState.prisonKeySpawned = true;
        this.dungeonState.monstersRemaining = 0;
        this.clearCaveBoulders();
        this.shooters.forEach((s) => {
          s.alive = false;
          s.mesh.visible = false;
          s.respawnTimer = 0;
          this.markDungeonEnemyDefeated(zId, s.id);
        });
        this.dungeonMonsters.forEach((dm) => {
          dm.alive = false;
          dm.mesh.visible = false;
          dm.respawnTimer = 0;
          this.markDungeonEnemyDefeated(zId, dm.id);
        });
        this.applyAtmosphere('dungeon', zId, true);
        if (this.dungeonRig) {
          this.dungeonRig.prisonKeyGroup.visible = true;
        }
        this.hp = Math.min(this.maxHp, this.hp + 2);
        this.gainXp(80);
        this.addScore(500);
        this.spawnBurst(0, 2.0, -9, 0xfacc15, 42);
        this.spawnBurst(this.heroPos.x, 2.4, this.heroPos.z, 0xfef08a, 24);
        soundEngine.playFanfare();
        const cornerHint =
          caveStory.prisonCorner === 'nw' ? 'Kiri Atas (Barat Laut)' : 'Kanan Atas (Timur Laut)';
        this.showBanner(
          `✨ Bos ${boss.name} kalah! Gua menjadi terang! Ambil Kunci Penjara Emas di tengah gua lalu gali sudut ${cornerHint} untuk menyelamatkan ${caveStory.captiveName}!`,
          6.0,
        );
      } else if (m?.isAmbush) {
        this.diamonds += 1;
        if (this.ownedWeapons.size > 0) {
          this.weaponAmmo[this.activeWeapon] = Math.min(
            MAX_AMMO,
            this.weaponAmmo[this.activeWeapon] + 3,
          );
        }
        soundEngine.playWin();
        this.showBanner(
          `${battle.monsterName} kalah! +${m.rewardXp} XP · +1 💎 · +3 Peluru!`,
          3.2,
        );
      } else {
        const remainingNonBoss = this.dungeonMonsters.filter(
          (item) => item.alive && !item.isBoss && !item.isAmbush && !item.isCaveMob,
        ).length;
        this.dungeonState.monstersRemaining = remainingNonBoss;
        this.updateDungeonDoorVisuals();
        soundEngine.playWin();
        this.showBanner(
          remainingNonBoss > 0
            ? `${battle.monsterName} kalah! Sisa ${remainingNonBoss} kelompok monster kata.`
            : 'Semua monster kata kalah! Buka Pintu ke-5 untuk memanggil Bos!',
          3.4,
        );
      }
      this.syncDungeonMonsterStats();
      this.checkAreaTrophy(this.dungeonState.zoneId);
    } else {
      // Overworld Surface or Sky English-Challenge Monster defeated — scale XP, Diamonds, Ammo & Survival Heart!
      const m =
        this.monsters.find((item) => item.id === battle.monsterId) ??
        this.skyMonsters.find((item) => item.id === battle.monsterId);
      if (m) {
        m.alive = false;
        m.respawnTimer = this.isOverworldChallengeNoRespawn() ? 0 : m.isSkyMonster ? 50 : 0;
        m.mesh.visible = false;
        if (!m.isSkyMonster) {
          if (m.mesh.parent) m.mesh.parent.remove(m.mesh);
          const clickIdx = this.overworldClickables.indexOf(m.mesh);
          if (clickIdx >= 0) this.overworldClickables.splice(clickIdx, 1);
        }
        this.localMabarStats.kills += 1;
        this.peerMonsterTargets.delete(m.id);
        this.monsterDamageContributors.delete(m.id);
        if (this.multiplayerActive && this.hasConnectedPeers) {
          this.emitMultiplayerPacket({
            t: 'm_kill',
            id: m.id,
            killerUid: this.localMultiplayerUid || 'local',
            killerName: this.localPlayerName,
            assists: [],
            isQuiz: true,
            md: 'overworld',
            zn: m.zoneId,
          });
        }
        this.gainXp(m.rewardXp);
        this.diamonds += m.rewardDiamonds;
        this.addScore(m.rewardScore);
        if (this.hp < this.maxHp) {
          this.hp += 1;
        }
        if (this.ownedWeapons.size > 0) {
          this.weaponAmmo[this.activeWeapon] = Math.min(
            MAX_AMMO,
            this.weaponAmmo[this.activeWeapon] + 4 + m.rewardDiamonds,
          );
        }
        this.spawnBurst(m.x, (m.y ?? getArchipelagoGroundY(m.x, m.z)) + 1.8, m.z, 0xfacc15, 24);
        soundEngine.playWin();
        this.showBanner(
          `Menang melawan ${battle.monsterName}! +${m.rewardXp} XP · +${m.rewardDiamonds} 💎 · +${4 + m.rewardDiamonds} Peluru`,
          3.0,
        );
        if (this.worldMode === 'overworld') {
          this.checkMissionWaveCompletion();
        }
      } else {
        soundEngine.playWin();
        this.showBanner(`Menang melawan ${battle.monsterName}!`, 2.8);
      }
    }

    this.saveProgress();
    this.pushHud(true);
  }

  private addScore(points: number): void {
    const mult = DIFF_CONFIG[this.settings.difficulty].scoreMult;
    this.score += Math.max(0, Math.round(points * mult));
  }

  private gainXp(amount: number): void {
    const prevLv = getLevelInfo(this.xp).level;
    const mult = DIFF_CONFIG[this.settings.difficulty].xpMult;
    this.xp += Math.max(1, Math.round(amount * mult));
    const nextLv = getLevelInfo(this.xp);
    if (nextLv.level > prevLv) {
      this.hp = this.maxHp;
      soundEngine.playFanfare();
      this.showBanner(`NAIK LEVEL ${nextLv.level}: ${nextLv.title}! Nyawa pulih penuh!`, 3.6);
      this.spawnBurst(this.heroPos.x, 2.5, this.heroPos.z, 0xfacc15, 28);
    }
  }

  private showBanner(msg: string, duration = 2.8): void {
    this.bannerMessage = msg;
    this.bannerTimer = duration;
  }

  public showGroupNotice(msg: string, duration = 3.2): void {
    this.showBanner(msg, duration);
    this.pushHud(true);
  }

  private spawnBurst(x: number, y: number, z: number, colorHex: number, count: number): void {
    if (this.settings.fxLevel === 'off') return;
    const actual =
      this.settings.fxLevel === 'lite' || this.isMobileDevice
        ? Math.max(2, Math.ceil(count / 2))
        : count;
    let spawned = 0;
    _color.setHex(colorHex);
    for (let i = 0; i < this.particles.length && spawned < actual; i++) {
      const p = this.particles[i];
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        p.z = z;
        const a = Math.random() * Math.PI * 2;
        const spd = 2.5 + Math.random() * 6.5;
        p.vx = Math.cos(a) * spd;
        p.vy = 3.5 + Math.random() * 6;
        p.vz = Math.sin(a) * spd;
        p.life = 0;
        p.maxLife = 0.55 + Math.random() * 0.4;
        this.particleMesh.setColorAt(i, _color);
        spawned++;
      }
    }
    if (spawned > 0) {
      this.hasActiveParticles = true;
      this.particleMesh.visible = true;
    }
    if (this.particleMesh.instanceColor) {
      this.particleMesh.instanceColor.needsUpdate = true;
    }
  }

  public setVirtualMove(vx: number, vz: number): void {
    this.virtualMove.x = vx;
    this.virtualMove.z = vz;
    if (Math.hypot(vx, vz) > 0.08) {
      this.lastInputActivityMs = performance.now();
      this.tapMoveTarget = null;
      this.voiceMoveTimer = 0;
      this.voiceMoveVec = { x: 0, z: 0 };
      this.voiceSprint = false;
    }
  }

  public triggerPrimaryAction(): void {
    this.lastInputActivityMs = performance.now();
    if (this.phase !== 'playing') return;

    if (this.worldMode === 'overworld' && this.planeMode === 'none' && (this.carMode === 'driving' || (this.carMode === 'none' && this.nearCar))) {
      this.enterOrExitCar();
      return;
    }
    if (this.worldMode === 'overworld' && this.carMode === 'none' && (this.planeMode === 'taxi' || this.planeMode === 'flying' || (this.planeMode === 'none' && this.nearPlaneId))) {
      this.enterOrExitPlane();
      return;
    }
    if (this.carMode !== 'none' || this.planeMode !== 'none') return;

    if (this.worldMode === 'ocean' || this.isHeroUnderwater() || this.ridingTurtle) {
      if (this.worldMode === 'ocean' && this.nearDungeonExit) {
        this.exitDungeon();
        return;
      }
      if (this.nearOceanChest && !this.nearOceanChest.opened) {
        this.interactWithOceanChest(this.nearOceanChest);
        return;
      }
      if (this.nearBiotaNode) {
        this.interactWithBiotaNode(this.nearBiotaNode);
        return;
      }
      if (this.nearOceanTurtle || this.ridingTurtle) {
        this.toggleOceanTurtleMount();
        return;
      }
    }

    if (this.worldMode === 'dungeon' && this.nearPrisonKey) {
      this.collectPrisonKey();
      return;
    }

    if (this.worldMode === 'dungeon' && this.nearHiddenPrison) {
      this.interactWithHiddenPrison();
      return;
    }

    if (this.worldMode !== 'overworld' && this.nearDungeonExit) {
      this.exitDungeon();
      return;
    }

    if (this.worldMode === 'dungeon' && this.nearbyDoorIndex !== null) {
      this.openDungeonDoor(this.nearbyDoorIndex);
      return;
    }

    if (
      this.worldMode === 'dungeon' &&
      this.dungeonRig &&
      !this.dungeonRig.weaponChest.collected &&
      Math.hypot(
        this.heroPos.x - this.dungeonRig.weaponChest.x,
        this.heroPos.z - this.dungeonRig.weaponChest.z,
      ) < 4.2 &&
      Math.abs(this.heroPos.y - this.dungeonRig.weaponChest.y) < 1.8
    ) {
      this.collectCaveWeaponChest();
      return;
    }

    if (this.worldMode === 'dungeon' && this.nearCraftingTable) {
      this.openCraftingTable();
      return;
    }

    if (this.worldMode === 'dungeon' && this.nearbyDungeonGuardian) {
      this.talkToCaveGuardian();
      return;
    }

    if (
      this.worldMode === 'dungeon' &&
      this.targetedCaveBlock &&
      this.targetedCaveBlock.kind === 'word_seal'
    ) {
      this.openWordSealChallenge(this.targetedCaveBlock);
      return;
    }

    if (this.worldMode === 'academy' && this.nearbyNpcId) {
      const npc = ACADEMY_NPCS.find((n) => n.id === this.nearbyNpcId);
      if (npc?.academySkill === 'exit') {
        this.exitDungeon();
      } else if (npc?.academySkill) {
        this.phase = 'academy';
        this.heldKeys.clear();
        this.callbacks.onOpenAcademyExam(npc.academySkill);
        this.pushHud(true);
      }
      return;
    }

    if (this.worldMode === 'overworld' && this.nearbyNpcId) {
      this.interactWithOverworldNpc(this.nearbyNpcId);
      return;
    }

    if (this.worldMode === 'overworld' && this.nearbyOverworldZoneDoor && !this.nearPortal) {
      const doorZoneId = this.nearbyOverworldZoneDoor;
      const door = OVERWORLD_ZONE_DOORS[doorZoneId];
      const isNight = this.getCurrentDayPhase() === 'malam';
      const activeDef = getActiveZoneNpcDef(doorZoneId, isNight);
      const activeLive = this.npcs.get(activeDef.id);
      if (isNight) {
        if (this.nightPermittedZones.has(doorZoneId)) {
          this.enterZoneDungeon(doorZoneId, false);
        } else if (
          activeLive &&
          Math.hypot(activeLive.x - door.x, activeLive.z - door.z) < 9.0
        ) {
          this.interactWithOverworldNpc(activeDef.id);
        } else {
          const guardDist = activeLive
            ? Math.round(Math.hypot(this.heroPos.x - activeLive.x, this.heroPos.z - activeLive.z))
            : 0;
          soundEngine.playNo();
          this.showBanner(
            `🌙 ${activeDef.name} sedang menuju pintu ${door.label} (~${guardDist}m) untuk pergantian jaga malam!`,
            4.2,
          );
        }
      } else {
        this.interactWithOverworldNpc(activeDef.id);
      }
      return;
    }

    if (this.worldMode === 'overworld' && this.nearPortal) {
      this.enterAcademy();
      return;
    }

    if (this.nearbyMonsterId) {
      const pool = this.getActiveMonsters();
      const m = pool.find((item) => item.id === this.nearbyMonsterId && item.alive);
      if (m) {
        this.engageMonster(m);
        return;
      }
    }

    if (this.worldMode === 'academy' && this.academyCitizens.length > 0) {
      let nearestCit: (typeof this.academyCitizens)[number] | null = null;
      let nearestDist = 3.6;
      for (const cit of this.academyCitizens) {
        const d = Math.hypot(cit.x - this.heroPos.x, cit.z - this.heroPos.z);
        if (d < nearestDist) {
          nearestDist = d;
          nearestCit = cit;
        }
      }
      if (nearestCit) {
        soundEngine.playPick();
        this.showBanner(nearestCit.message, 5.2);
        return;
      }
    }

    if (this.worldMode === 'overworld' && this.villageRig?.interactables) {
      let nearestItem: (typeof this.villageRig.interactables)[number] | null = null;
      let nearestDist = Infinity;
      for (const vItem of this.villageRig.interactables) {
        const d = Math.hypot(vItem.x - this.heroPos.x, vItem.z - this.heroPos.z);
        if (d <= vItem.radius + 1.0 && d < nearestDist) {
          nearestDist = d;
          nearestItem = vItem;
        }
      }
      if (nearestItem) {
        soundEngine.playPick();
        this.showBanner(nearestItem.message, 5.2);
        return;
      }
    }

    // Otherwise Dash
    if (this.dashCooldown <= 0) {
      this.dashCooldown = 1.1;
      this.pulseRingTimer = 0.4;
      _forward.set(Math.sin(this.heroYaw), 0, Math.cos(this.heroYaw));
      this.heroVel.addScaledVector(_forward, 22);
      soundEngine.playDash();
    }
  }

  private collectPrisonKey(): void {
    if (
      !this.dungeonRig ||
      !this.dungeonState ||
      !this.dungeonState.prisonKeySpawned ||
      this.dungeonState.prisonKeyCollected
    ) {
      return;
    }
    this.dungeonState.prisonKeyCollected = true;
    this.getOrCreateZoneCaveDetail(this.dungeonState.zoneId).prisonKeyCollected = true;
    this.dungeonRig.prisonKeyGroup.visible = false;
    this.nearPrisonKey = false;
    this.spawnBurst(0, 1.6, -9, 0xfacc15, 28);
    soundEngine.playPick();
    const cornerLabel =
      ZONE_CAVE_STORIES[this.dungeonState.zoneId].prisonCorner === 'nw'
        ? 'Kiri Atas (Barat Laut)'
        : 'Kanan Atas (Timur Laut)';
    this.showBanner(
      `🔑 Kunci Penjara Emas didapat! Gali batu sudut ${cornerLabel} & buka sel untuk menyelamatkan ${this.dungeonState.captiveName}!`,
      5.2,
    );
    this.saveProgress();
    this.pushHud(true);
  }

  private interactWithHiddenPrison(): void {
    if (!this.dungeonRig || !this.dungeonState || this.dungeonState.prisonUnlocked) return;
    if (!this.dungeonState.prisonKeyCollected) {
      soundEngine.playNo();
      this.showBanner(
        this.dungeonState.bossDefeated
          ? `Penjara ${this.dungeonState.captiveName} masih terkunci! Ambil Kunci Emas di tengah gua dulu!`
          : `Penjara ${this.dungeonState.captiveName} terkunci rapat! Buka 5 Pintu & kalahkan Bos untuk merebut Kuncinya!`,
        3.8,
      );
      return;
    }
    this.dungeonState.prisonUnlocked = true;
    this.nearHiddenPrison = false;
    this.spawnBurst(
      this.dungeonRig.prisonPos.x,
      1.8,
      this.dungeonRig.prisonPos.z,
      0x34d399,
      36,
    );
    this.startDungeonRescueCutscene(this.dungeonState.zoneId);
  }

  private talkToCaveGuardian(): void {
    if (!this.dungeonState || !this.dungeonRig) return;
    const zId = this.dungeonState.zoneId;
    const story = ZONE_CAVE_STORIES[zId];
    const zoneLabel = ZONE_INFO[zId].name;
    soundEngine.playPick();

    const gPos = this.dungeonRig.guardianPos;
    let dx = this.heroPos.x - gPos.x;
    let dz = this.heroPos.z - gPos.z;
    let dist = Math.hypot(dx, dz);
    if (dist < 0.05) {
      dx = -0.8;
      dz = 0.6;
      dist = 1;
    }
    const talkDist = 2.25;
    if (dist < 1.6 || dist > 2.9) {
      this.heroPos.set(gPos.x + (dx / dist) * talkDist, 0, gPos.z + (dz / dist) * talkDist);
      this.hero.root.position.copy(this.heroPos);
    }
    this.heroYaw = Math.atan2(gPos.x - this.heroPos.x, gPos.z - this.heroPos.z);
    this.hero.body.rotation.y = this.heroYaw;
    this.dungeonRig.guardianMesh.rotation.y = Math.atan2(
      this.heroPos.x - gPos.x,
      this.heroPos.z - gPos.z,
    );

    if (this.dungeonState.liberated) {
      this.caveGuardianTurns = [
        {
          speakerSide: 'npc',
          speakerName: story.guardianName,
          speakerRole: `Penjaga Gua ${zoneLabel} · Bebas ✓`,
          textId: story.rescueGuardianId,
          textEn: story.rescueGuardianEn,
        },
        {
          speakerSide: 'hero',
          speakerName: 'Hoot',
          speakerRole: 'Penjelajah Nusantara Kata',
          textId: `Aku senang melihat kalian berkumpul lagi, ${story.guardianName}! Aku lanjutkan petualangan dulu ya.`,
          textEn: `I am glad to see you together again, ${story.guardianName}! I will keep exploring!`,
        },
      ];
    } else if (this.dungeonState.prisonKeyCollected) {
      const corner =
        story.prisonCorner === 'nw' ? 'Kiri Atas (Barat Laut)' : 'Kanan Atas (Timur Laut)';
      this.caveGuardianTurns = [
        {
          speakerSide: 'npc',
          speakerName: story.guardianName,
          speakerRole: `Penjaga Gua ${zoneLabel}`,
          textId: `Kamu sudah memegang Kunci Penjara Emasnya! Cepat buka sel rahasia di sudut ${corner} untuk menyelamatkan ${story.captiveName}!`,
          textEn: `You already have the Golden Prison Key! Hurry to the secret cell in the ${corner} corner and rescue ${story.captiveName}!`,
        },
        {
          speakerSide: 'hero',
          speakerName: 'Hoot',
          speakerRole: 'Penjelajah Nusantara Kata',
          textId: `Siap, ${story.guardianName}! Aku segera ke sudut ${corner} sekarang juga!`,
          textEn: `Got it, ${story.guardianName}! I am heading straight there right now!`,
        },
      ];
    } else if (this.dungeonState.bossDefeated) {
      this.caveGuardianTurns = [
        {
          speakerSide: 'npc',
          speakerName: story.guardianName,
          speakerRole: `Penjaga Gua ${zoneLabel}`,
          textId: `Gua sudah terang! Ambil Kunci Penjara Emas yang jatuh di tengah arena, lalu bebaskan ${story.captiveName}!`,
          textEn: `The cave is bright again! Pick up the Golden Prison Key in the center arena and free ${story.captiveName}!`,
        },
        {
          speakerSide: 'hero',
          speakerName: 'Hoot',
          speakerRole: 'Penjelajah Nusantara Kata',
          textId: `Baik! Aku ambil kuncinya di tengah arena dan segera membebaskan ${story.captiveName}!`,
          textEn: `Right away! I will grab the key in the center and rescue ${story.captiveName}!`,
        },
      ];
    } else {
      const doorsDone = this.dungeonState.doorsCleared.length;
      this.caveGuardianTurns = [
        {
          speakerSide: 'npc',
          speakerName: story.guardianName,
          speakerRole: `Penjaga Gua ${zoneLabel} (${doorsDone}/5 Pintu)`,
          textId: `Tolong selamatkan ${story.captiveName}! Buka 5 Pintu Misi dan kalahkan Bos agar Kunci Penjaranya jatuh!`,
          textEn: `Please save ${story.captiveName}! Open all 5 Mission Doors and defeat the Boss to drop the Prison Key!`,
        },
        {
          speakerSide: 'hero',
          speakerName: 'Hoot',
          speakerRole: 'Penjelajah Nusantara Kata',
          textId: `Tenang saja, ${story.guardianName}! Aku akan membuka semua pintu dan menaklukkan Bos gua ini.`,
          textEn: `Stay strong, ${story.guardianName}! I will unlock every door and defeat the cave boss.`,
        },
      ];
    }

    const first = this.caveGuardianTurns[0];
    this.phase = 'story';
    this.heldKeys.clear();
    this.applyCameraVisibilityAndControls();
    this.storyDialog = {
      kind: 'cave_guardian',
      step: 0,
      maxStep: this.caveGuardianTurns.length - 1,
      zoneId: zId,
      speakerName: first.speakerName,
      speakerRole: first.speakerRole,
      textEn: first.textEn,
      textId: first.textId,
      accentColor: story.accentColor,
      speakerKind: 'npc',
      speakerNpcId: story.guardianId,
      speakerSide: 'npc',
    };
    this.pushHud(true);
  }

  public openWordSealChallenge(block?: CaveBlockDef): void {
    const target = block || this.targetedCaveBlock;
    if (!target || !target.alive || target.kind !== 'word_seal' || !this.dungeonState) return;
    const pool = getWordsForZone(this.dungeonState.zoneId);
    if (pool.length === 0) return;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    this.phase = 'learning';
    this.heldKeys.clear();
    this.callbacks.onOpenCaveSeal({
      blockId: target.id,
      zoneId: this.dungeonState.zoneId,
      vocabId: picked.id,
    });
    this.pushHud(true);
  }

  public resolveWordSeal(blockId: string, correct: boolean, vocabId: string): void {
    this.recordWordAttempt(vocabId, correct, false);
    this.phase = 'playing';
    this.applyCameraVisibilityAndControls();

    const blk = this.dungeonRig?.caveBlocks.find((b) => b.id === blockId && b.alive);
    if (correct) {
      this.localMabarStats.challenges += 1;
      if (blk) {
        this.shatterCaveBlock(blk, true);
      } else {
        this.diamonds += 2;
        this.gainXp(15);
        soundEngine.playWin();
      }
    } else {
      this.hp = Math.max(0, this.hp - 1);
      soundEngine.playHurt();
      this.triggerDamageFlash(1, 'Gagal menjawab tantangan segel gua', blk ? { x: blk.x, z: blk.z } : undefined);
      if (this.hp <= 0) {
        this.triggerDefeatExit(this.dungeonState?.zoneId);
        return;
      }
      this.showBanner('Jawaban belum tepat! Segel tetap kokoh (-1 ❤️)', 2.8);
    }
    this.saveProgress();
    this.pushHud(true);
  }

  private updateBlockCrackVisual(blk: CaveBlockDef): void {
    const rig = this.dungeonRig;
    if (!rig) return;
    if (!blk.alive || blk.hp <= 0 || blk.hp >= blk.maxHp) {
      if (blk.crackMesh) blk.crackMesh.visible = false;
      return;
    }
    const frac = 1 - blk.hp / Math.max(1, blk.maxHp);
    const stage = Math.min(3, Math.max(0, Math.floor(frac * 4)));
    if (!blk.crackMesh) {
      const cMesh = new THREE.Mesh(rig.crackGeo, rig.crackMaterials[stage]);
      cMesh.position.set(blk.x, blk.y, blk.z);
      rig.group.add(cMesh);
      blk.crackMesh = cMesh;
    } else {
      blk.crackMesh.position.set(blk.x, blk.y, blk.z);
      blk.crackMesh.material = rig.crackMaterials[stage];
      blk.crackMesh.visible = true;
    }
  }

  private shatterCaveBlock(blk: CaveBlockDef, fromQuiz: boolean): void {
    blk.alive = false;
    blk.mesh.visible = false;
    if (blk.crackMesh) blk.crackMesh.visible = false;
    this.caveBlocksMined += 1;
    if (this.worldMode === 'dungeon' && this.dungeonState) {
      const detail = this.getOrCreateZoneCaveDetail(this.dungeonState.zoneId);
      if (blk.kind === 'player_shield') {
        detail.placedShieldBlocks = detail.placedShieldBlocks.filter((p) => p.id !== blk.id);
      } else if (!detail.brokenBlockIds.includes(blk.id)) {
        detail.brokenBlockIds.push(blk.id);
      }
    }
    if (this.targetedCaveBlock?.id === blk.id) {
      this.targetedCaveBlock = null;
      if (this.dungeonRig) this.dungeonRig.blockHighlight.visible = false;
    }

    const burstColor =
      blk.kind === 'diamond_ore'
        ? 0x22d3ee
        : blk.kind === 'heart_ore'
        ? 0xfb7185
        : blk.kind === 'word_seal'
        ? 0xc084fc
        : blk.kind === 'moss_dirt'
        ? 0x22c55e
        : 0x94a3b8;
    this.spawnBurst(blk.x, 1.2, blk.z, burstColor, 20);
    soundEngine.playBoom();

    if (blk.kind === 'diamond_ore') {
      this.diamonds += 1;
      this.gainXp(10);
      this.addScore(120);
      soundEngine.playPick();
      this.showBanner('Bijih Berlian Ditambang! +1 💎 · +10 XP!', 2.8);
    } else if (blk.kind === 'heart_ore') {
      this.hp = Math.min(this.maxHp, this.hp + 1);
      this.gainXp(6);
      this.addScore(80);
      soundEngine.playPick();
      this.showBanner('Kristal Hati Ditemukan! +1 ❤️ · +6 XP!', 2.8);
    } else if (blk.kind === 'word_seal') {
      this.diamonds += 2;
      this.gainXp(15);
      this.addScore(240);
      if (this.ownedWeapons.size > 0) {
        this.weaponAmmo[this.activeWeapon] = Math.min(
          MAX_AMMO,
          this.weaponAmmo[this.activeWeapon] + 4,
        );
      }
      soundEngine.playWin();
      this.showBanner(
        fromQuiz
          ? 'Segel Kata Terpecahkan! +2 💎 · +4 Peluru · +15 XP!'
          : 'Obsidian Segel Kata Hancur! +2 💎 · +15 XP!',
        3.2,
      );
    } else if (blk.kind === 'player_shield') {
      this.caveShieldBlocksLeft = Math.min(32, this.caveShieldBlocksLeft + 1);
      this.showBanner('Blok Pelindung diambil kembali (+1 🧱)!', 2.0);
    } else if (blk.kind === 'moss_dirt') {
      this.gainXp(2);
      this.addScore(25);
      this.caveShieldBlocksLeft = Math.min(32, this.caveShieldBlocksLeft + 1);
      if (this.ownedWeapons.size > 0 && Math.random() < 0.35) {
        this.weaponAmmo[this.activeWeapon] = Math.min(
          MAX_AMMO,
          this.weaponAmmo[this.activeWeapon] + 1,
        );
        this.showBanner('Tanah Berlumut Digali! +1 🧱 Blok · +1 Peluru', 2.2);
      } else if (this.caveTorchesLeft < 24 && Math.random() < 0.35) {
        this.caveTorchesLeft += 1;
        this.showBanner('Menemukan +1 Obor 🔦 & +1 🧱 Blok Pelindung!', 2.2);
      } else {
        this.showBanner('Tanah Berlumut Digali! +1 🧱 Blok Pelindung', 1.8);
      }
    } else {
      this.gainXp(2);
      this.addScore(30);
      this.caveShieldBlocksLeft = Math.min(32, this.caveShieldBlocksLeft + 1);
      if (this.caveTorchesLeft < 24 && Math.random() < 0.25) {
        this.caveTorchesLeft += 1;
        this.showBanner('Batu Gua Pecah! +1 🧱 Blok · +1 Obor 🔦!', 2.2);
      } else {
        this.showBanner('Batu Gua Pecah! +1 🧱 Blok Pelindung (Tekan B untuk pasang)', 2.2);
      }
    }

    if (!fromQuiz && blk.hasAmbush && this.worldMode === 'dungeon' && this.dungeonState) {
      const ambushId = `ambush_blk_${blk.id}`;
      const spawned = this.spawnCaveAmbushMonster(
        blk.x,
        blk.z,
        'Penjaga Tambang',
        0xf97316,
        ambushId,
      );
      if (spawned) {
        const detail = this.getOrCreateZoneCaveDetail(this.dungeonState.zoneId);
        if (!detail.triggeredBlockAmbushes) detail.triggeredBlockAmbushes = [];
        if (!detail.triggeredBlockAmbushes.some((a) => a.id === spawned.id)) {
          detail.triggeredBlockAmbushes.push({
            id: spawned.id,
            originX: blk.x,
            originZ: blk.z,
            title: 'Penjaga Tambang',
            accentHex: 0xf97316,
            isCombatAmbush: spawned.isCombatAmbush,
            wordIds: spawned.wordIds,
          });
        }
      }
      this.showBanner('AWAS KEJUTAN TAMBANG! Penjaga Gua muncul dari balik balok!', 3.2);
    }
  }

  private spawnCaveAmbushMonster(
    originX: number,
    originZ: number,
    title: string,
    accentHex: number,
    fixedId?: string,
    isCombatAmbushOverride?: boolean,
    wordIdsOverride?: string[],
    silentRestore = false,
  ): { id: string; isCombatAmbush: boolean; wordIds?: string[] } | null {
    if (!this.dungeonRig || !this.dungeonState) return null;
    const zId = this.dungeonState.zoneId;
    const zoneWords = getWordsForZone(zId);
    const pickedWords: string[] = wordIdsOverride ? [...wordIdsOverride] : [];
    if (pickedWords.length === 0) {
      for (let i = 0; i < Math.min(4, zoneWords.length); i++) {
        const w = zoneWords[Math.floor(Math.random() * zoneWords.length)];
        if (w && !pickedWords.includes(w.id)) pickedWords.push(w.id);
      }
    }

    let dx = originX - this.heroPos.x;
    let dz = originZ - this.heroPos.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.4) {
      dx = -this.heroPos.x;
      dz = -this.heroPos.z;
    }
    const len = Math.max(0.5, Math.hypot(dx, dz));
    const sx = THREE.MathUtils.clamp(this.heroPos.x + (dx / len) * 2.5, -17.2, 17.2);
    const sz = THREE.MathUtils.clamp(this.heroPos.z + (dz / len) * 2.5, -17.2, 17.2);

    this.ambushSeq += 1;
    const isCombatAmbush =
      isCombatAmbushOverride !== undefined ? isCombatAmbushOverride : Math.random() < 0.4;
    const id = fixedId || `ambush_${zId}_${this.ambushSeq}`;
    const ambushType: MonsterType = isCombatAmbush ? 'swamp_lizardman' : 'stone_gargoyle';
    const mesh = createMonsterMesh(
      ambushType,
      this.palette,
      isCombatAmbush ? 1.02 : 0.95,
    );
    mesh.position.set(sx, 0, sz);
    mesh.userData.monsterId = id;

    if (isCombatAmbush) {
      const auraRing = new THREE.Mesh(
        new THREE.RingGeometry(0.9, 1.25, 16),
        new THREE.MeshBasicMaterial({
          color: 0xef4444,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        }),
      );
      auraRing.rotation.x = -Math.PI / 2;
      auraRing.position.y = 0.08;
      mesh.add(auraRing);
      mesh.userData.combatRing = auraRing;
    }

    this.dungeonRig.group.add(mesh);
    this.dungeonClickables.push(mesh);

    this.dungeonMonsters.push({
      id,
      type: ambushType,
      name: isCombatAmbush ? title.replace('Penjaga', 'Petarung') : title,
      zoneId: zId,
      homeX: sx,
      homeZ: sz,
      x: sx,
      z: sz,
      maxHp: isCombatAmbush ? 3 : 2,
      mobHp: isCombatAmbush ? 3 : undefined,
      maxMobHp: isCombatAmbush ? 3 : undefined,
      combatOnly: isCombatAmbush,
      aggroActive: isCombatAmbush,
      attackCooldown: 1.1,
      windupTimer: -1,
      lungeTimer: 0,
      hitFlashTimer: 0,
      rewardXp: 30,
      rewardDiamonds: 1,
      rewardScore: 260,
      isAmbush: true,
      wordIds: isCombatAmbush ? undefined : pickedWords,
      mesh,
      alive: true,
      respawnTimer: 0,
      patrolPhase: Math.random() * Math.PI * 2,
      angryTimer: 0,
      stanceHp: isCombatAmbush ? undefined : 2,
    });

    this.dungeonTotalSpawned += 1;
    this.syncDungeonMonsterStats();
    this.encounterGraceTimer = Math.max(this.encounterGraceTimer, 1.15);
    if (!silentRestore) {
      soundEngine.playBoss();
      this.spawnBurst(sx, 1.8, sz, accentHex, 24);
      this.pushHud(true);
    }
    return {
      id,
      isCombatAmbush,
      wordIds: isCombatAmbush ? undefined : pickedWords,
    };
  }

  private performCaveMeleeStrike(damage: number): boolean {
    if (this.worldMode !== 'dungeon') return false;
    let hitAny = false;
    for (const m of this.dungeonMonsters) {
      if (!m.alive || (!m.combatOnly && !m.isCaveMob)) continue;
      const dist = Math.hypot(m.x - this.heroPos.x, m.z - this.heroPos.z);
      if (dist <= 3.35) {
        hitAny = true;
        this.damageRealTimeMonster(m, damage, m.x - this.heroPos.x, m.z - this.heroPos.z);
        break;
      }
    }
    return hitAny;
  }

  private damageRealTimeMonster(
    m: RoamingMonster,
    damage: number,
    dirX: number,
    dirZ: number,
  ): void {
    if (this.worldMode === 'overworld' && this.multiplayerActive && this.hasConnectedPeers) {
      if (!this.isWorldAuthority()) {
        soundEngine.playHit();
        this.spawnBurst(
          m.x,
          (m.y ?? 0) + 1.3,
          m.z,
          m.isSeaMonster ? 0x06b6d4 : m.isSkyMonster ? 0xf97316 : m.combatOnly ? 0xef4444 : 0x22c55e,
          12,
        );
        this.triggerHitMarker(false);
        const visHp = Math.max(1, (m.mobHp ?? m.maxMobHp ?? 4) - damage);
        m.mobHp = visHp;
        if (m.combatOnly) {
          m.hitFlashTimer = 0.22;
        }
        this.emitMultiplayerPacket({
          t: 'm_hit',
          id: m.id,
          dmg: damage,
          dx: dirX,
          dz: dirZ,
          md: this.worldMode,
          zn: m.zoneId,
        });
        this.showBanner(`⚔️ Kena ${m.name}! (${visHp}/${m.maxMobHp ?? 4})`, 1.2);
        return;
      }

      let contribs = this.monsterDamageContributors.get(m.id);
      if (!contribs) {
        contribs = new Set();
        this.monsterDamageContributors.set(m.id, contribs);
      }
      contribs.add(this.localMultiplayerUid || 'host');
    }

    m.mobHp = (m.mobHp ?? m.maxMobHp ?? 4) - damage;
    if (m.isCaveMob && m.type === 'cave_spider') {
      m.fuseTimer = -1;
      m.mesh.scale.setScalar(MONSTER_SPECS[m.type].baseScale);
    } else if (m.combatOnly) {
      m.aggroActive = true;
      m.hitFlashTimer = 0.22;
    }

    const len = Math.max(0.25, Math.hypot(dirX, dirZ));
    if (m.isSeaMonster && this.worldMode === 'ocean') {
      m.x = THREE.MathUtils.clamp(m.x + (dirX / len) * 1.45, -40, 40);
      m.z = THREE.MathUtils.clamp(m.z + (dirZ / len) * 1.45, -49, -16);
    } else if (m.isSeaMonster && this.worldMode === 'overworld') {
      const knockPt = {
        x: m.x + (dirX / len) * 1.35,
        z: m.z + (dirZ / len) * 1.35,
      };
      this.constrainSeaMonsterToWater(knockPt, m.x, m.z, 2.2);
      m.x = knockPt.x;
      m.z = knockPt.z;
    } else if (m.isSkyMonster && this.worldMode === 'overworld') {
      const skyLimit = WORLD_OCEAN_LIMIT - 20;
      m.x = THREE.MathUtils.clamp(m.x + (dirX / len) * 1.45, -skyLimit, skyLimit);
      m.z = THREE.MathUtils.clamp(m.z + (dirZ / len) * 1.45, -skyLimit, skyLimit);
    } else if (this.worldMode === 'overworld') {
      const knockPt = {
        x: m.x + (dirX / len) * 1.15,
        z: m.z + (dirZ / len) * 1.15,
      };
      constrainToWalkableArchipelago(knockPt, 0.95);
      m.x = knockPt.x;
      m.z = knockPt.z;
    } else {
      m.x = THREE.MathUtils.clamp(m.x + (dirX / len) * 1.15, -18, 18);
      m.z = THREE.MathUtils.clamp(m.z + (dirZ / len) * 1.15, -18, 18);
    }
    soundEngine.playHit();
    this.spawnBurst(
      m.x,
      (m.y ?? 0) + 1.3,
      m.z,
      m.isSeaMonster ? 0x06b6d4 : m.isSkyMonster ? 0xf97316 : m.combatOnly ? 0xef4444 : 0x22c55e,
      12,
    );
    this.triggerHitMarker(m.mobHp <= 0);

    if (m.mobHp <= 0) {
      this.handleRealTimeMonsterDefeated(m);
    } else if (m.combatOnly) {
      this.showBanner(
        `⚔️ Kena ${m.name}! Sisa HP ${m.mobHp}/${m.maxMobHp ?? 4}`,
        1.4,
      );
    } else {
      this.showBanner(`Kena ${m.name}! Tembak 1× lagi untuk melumpuhkan!`, 1.4);
    }
  }

  private handleRealTimeMonsterDefeated(m: RoamingMonster): void {
    m.alive = false;
    m.respawnTimer =
      this.worldMode === 'ocean' || this.isOverworldChallengeNoRespawn()
        ? 0
        : m.isSeaMonster
        ? 45
        : m.isSkyMonster
        ? 50
        : 0;
    m.aggroActive = false;
    m.windupTimer = -1;
    m.lungeTimer = 0;
    m.mesh.visible = false;
    if (this.worldMode === 'overworld' && !m.isSeaMonster && !m.isSkyMonster) {
      if (m.mesh.parent) m.mesh.parent.remove(m.mesh);
      const clickIdx = this.overworldClickables.indexOf(m.mesh);
      if (clickIdx >= 0) this.overworldClickables.splice(clickIdx, 1);
    }
    this.localMabarStats.kills += 1;
    if (this.worldMode === 'overworld' && this.multiplayerActive && this.hasConnectedPeers && this.isWorldAuthority()) {
      const hostUid = this.localMultiplayerUid || 'host';
      const contribs = this.monsterDamageContributors.get(m.id);
      const assists = contribs ? Array.from(contribs).filter((uid) => uid !== hostUid) : [];
      this.monsterDamageContributors.delete(m.id);
      this.peerMonsterTargets.delete(m.id);
      this.emitMultiplayerPacket({
        t: 'm_kill',
        id: m.id,
        killerUid: hostUid,
        killerName: this.localPlayerName,
        assists,
        isQuiz: false,
        md: 'overworld',
        zn: m.zoneId,
      });
    }
    soundEngine.playBoom();
    this.spawnBurst(
      m.x,
      (m.y ?? 0) + 1.5,
      m.z,
      m.isSeaMonster ? 0x22d3ee : m.isSkyMonster ? 0xf97316 : 0xfacc15,
      26,
    );

    if (m.isCaveMob) {
      if (this.worldMode === 'dungeon' && this.dungeonState) {
        this.markDungeonEnemyDefeated(this.dungeonState.zoneId, m.id);
      }
      this.monstersDefeated += 1;
      this.gainXp(15);
      this.addScore(m.rewardScore);
      if (this.ownedWeapons.size > 0) {
        this.weaponAmmo[this.activeWeapon] = Math.min(
          MAX_AMMO,
          this.weaponAmmo[this.activeWeapon] + 3,
        );
      }
      if (m.type === 'cave_spider') {
        this.caveShieldBlocksLeft = Math.min(32, this.caveShieldBlocksLeft + 1);
      } else {
        this.caveTorchesLeft = Math.min(24, this.caveTorchesLeft + 1);
      }
      this.syncDungeonMonsterStats();
      this.showBanner(
        `${m.name} kalah! +15 XP · +3 Peluru · ${m.type === 'cave_spider' ? '+1 🧱' : '+1 🔦'}`,
        2.6,
      );
      this.saveProgress();
      this.pushHud(true);
      return;
    }

    // Combat-only Surface Monster, Sea Monster, Sky Monster, Cave Guardian, or Combat Ambush!
    if (this.worldMode === 'dungeon' && this.dungeonState) {
      this.markDungeonEnemyDefeated(this.dungeonState.zoneId, m.id);
    }
    this.monstersDefeated += 1;
    this.gainXp(m.rewardXp);
    this.addScore(m.rewardScore);
    const diamondDrop = Math.max(1, m.rewardDiamonds || 1);
    const ammoDrop = 3 + diamondDrop;
    if (this.ownedWeapons.size > 0) {
      this.weaponAmmo[this.activeWeapon] = Math.min(
        MAX_AMMO,
        this.weaponAmmo[this.activeWeapon] + ammoDrop,
      );
    }
    this.diamonds += diamondDrop;
    const healed = this.hp < this.maxHp;
    if (healed) {
      this.hp += 1;
    }

    if (m.isSeaMonster) {
      this.showBanner(
        `🌊 ${m.name} ditaklukkan! Laut aman sementara · +${m.rewardXp} XP · +${diamondDrop} 💎 · +${ammoDrop} Peluru${healed ? ' · +1 ❤️' : ''}!`,
        3.2,
      );
    } else if (m.isSkyMonster) {
      this.showBanner(
        `🦅 ${m.name} dijatuhkan dari langit! +${m.rewardXp} XP · +${diamondDrop} 💎 · +${ammoDrop} Peluru${healed ? ' · +1 ❤️' : ''}!`,
        3.2,
      );
    } else if (this.dungeonState && !m.isAmbush) {
      const remainingNonBoss = this.dungeonMonsters.filter(
        (item) => item.alive && !item.isBoss && !item.isAmbush && !item.isCaveMob,
      ).length;
      this.dungeonState.monstersRemaining = remainingNonBoss;
      this.updateDungeonDoorVisuals();
      this.showBanner(
        remainingNonBoss > 0
          ? `⚔️ ${m.name} kalah dalam duel aksi! +${m.rewardXp} XP · +${diamondDrop} 💎 · +${ammoDrop} Peluru (Sisa ${remainingNonBoss} penjaga)`
          : '⚔️ Semua Penjaga Gua kalah! Buka Pintu ke-5 untuk memanggil Bos!',
        3.4,
      );
    } else {
      this.showBanner(
        `⚔️ ${m.name} kalah! +${m.rewardXp} XP · +${diamondDrop} 💎 · +${ammoDrop} Peluru${healed ? ' · +1 ❤️' : ''}!`,
        3.0,
      );
    }
    if (this.worldMode === 'overworld') {
      if (
        m.isVillageAmbushTarget &&
        this.villageAmbushState?.active &&
        !this.villageAmbushState.resolved &&
        !this.monsters.some((om) => om.alive && om.isVillageAmbushTarget)
      ) {
        this.completeVillageAmbushRescue();
      }
      this.checkMissionWaveCompletion();
    }
    this.syncDungeonMonsterStats();
    this.saveProgress();
    this.pushHud(true);
  }

  public mineTargetedBlock(): void {
    if (this.phase !== 'playing') return;
    this.fpSwingTimer = 0.24;

    if (this.worldMode === 'overworld') {
      for (const m of this.monsters) {
        if (!m.alive || !m.combatOnly) continue;
        if (Math.hypot(m.x - this.heroPos.x, m.z - this.heroPos.z) <= 3.6) {
          this.damageRealTimeMonster(
            m,
            Math.max(1, this.pickaxeTier),
            m.x - this.heroPos.x,
            m.z - this.heroPos.z,
          );
          return;
        }
      }
      soundEngine.playDash();
      this.showBanner('Masuk ke Gua Wilayah (lewat NPC/Peta) untuk menambang blok gua!', 2.6);
      return;
    }

    if (this.worldMode !== 'dungeon' || !this.dungeonRig) {
      soundEngine.playDash();
      this.showBanner('Masuk ke Gua Wilayah (lewat NPC/Peta) untuk menambang blok gua!', 2.6);
      return;
    }

    const blk = this.targetedCaveBlock;
    if (!blk || !blk.alive) {
      if (this.performCaveMeleeStrike(this.pickaxeTier)) {
        this.saveProgress();
        this.pushHud(true);
        return;
      }
      soundEngine.playDash();
      this.showBanner('Arahkan ke blok batu atau Petarung Gua di depanmu!', 2.0);
      return;
    }

    blk.hp -= this.pickaxeTier;
    soundEngine.playHit();
    const chipHex =
      blk.kind === 'diamond_ore'
        ? 0x22d3ee
        : blk.kind === 'heart_ore'
        ? 0xfb7185
        : blk.kind === 'word_seal'
        ? 0xc084fc
        : 0x94a3b8;
    this.spawnBurst(blk.x, blk.y + 0.2, blk.z, chipHex, 8);

    if (blk.hp <= 0) {
      this.shatterCaveBlock(blk, false);
    } else {
      blk.mesh.scale.setScalar(0.92);
      if (blk.crackMesh) blk.crackMesh.scale.setScalar(0.92);
      this.updateBlockCrackVisual(blk);
    }
    this.saveProgress();
    this.pushHud(true);
  }

  public placeCaveTorch(): void {
    if (this.phase !== 'playing') return;
    this.fpSwingTimer = 0.24;

    if (this.worldMode !== 'dungeon' || !this.dungeonRig) {
      soundEngine.playDash();
      this.showBanner('Masuk ke Gua Wilayah untuk memasang Obor penerang!', 2.6);
      return;
    }

    if (this.caveTorchesLeft <= 0) {
      soundEngine.playNo();
      this.showBanner('Obor habis! Gali Batu Gua untuk mendapat tambahan obor.', 2.6);
      return;
    }

    const dirX =
      this.cameraMode === 'first_person'
        ? -Math.sin(this.cameraYaw)
        : Math.sin(this.heroYaw);
    const dirZ =
      this.cameraMode === 'first_person'
        ? -Math.cos(this.cameraYaw)
        : Math.cos(this.heroYaw);

    const tx = THREE.MathUtils.clamp(this.heroPos.x + dirX * 2.1, -19.2, 19.2);
    const tz = THREE.MathUtils.clamp(this.heroPos.z + dirZ * 2.1, -19.2, 19.2);

    // Prevent placing inside a solid block or stacking directly on another torch
    for (const blk of this.dungeonRig.caveBlocks) {
      if (!blk.alive) continue;
      if (Math.abs(tx - blk.x) < 1.1 && Math.abs(tz - blk.z) < 1.1) {
        soundEngine.playNo();
        this.showBanner('Titik tertutup blok batu! Mundur sedikit atau gali dulu.', 2.0);
        return;
      }
    }
    for (const t of this.caveTorches) {
      if (Math.hypot(tx - t.x, tz - t.z) < 1.3) {
        soundEngine.playNo();
        this.showBanner('Sudah ada obor terang di titik ini!', 1.8);
        return;
      }
    }

    this.caveTorchesLeft -= 1;
    const torchMesh = createCaveTorchMesh(this.palette);
    torchMesh.position.set(tx, 0, tz);
    this.dungeonRig.group.add(torchMesh);

    // Cap active dynamic PointLights to 8 per cave for smooth FPS on HP & Software WebGL
    let light: THREE.PointLight | null = null;
    const maxTorchLights = this.isMobileDevice ? 4 : 8;
    const activeLightsCount = this.caveTorches.filter((item) => item.light !== null).length;
    if (activeLightsCount >= maxTorchLights) {
      const oldest = this.caveTorches.find((item) => item.light !== null);
      if (oldest && oldest.light) {
        light = oldest.light;
        oldest.light = null;
        light.position.set(tx, 1.5, tz);
      }
    }
    if (!light) {
      light = new THREE.PointLight(0xffb74d, 4.4, 18, 1.55);
      light.position.set(tx, 1.5, tz);
      this.dungeonRig.group.add(light);
    }

    this.caveTorches.push({ x: tx, z: tz, mesh: torchMesh, light });
    if (this.dungeonState) {
      this.getOrCreateZoneCaveDetail(this.dungeonState.zoneId).placedTorches.push({
        x: tx,
        z: tz,
      });
    }
    this.spawnBurst(tx, 1.35, tz, 0xfacc15, 10);
    soundEngine.playBuild();
    this.showBanner('Obor dipasang! Jalur gua terang & monster di dekat cahaya lebih tenang.', 2.6);
    this.saveProgress();
    this.pushHud(true);
  }

  private getDungeonSupportHeight(x: number, z: number, refY: number): number {
    if (this.worldMode === 'academy' && this.academyRig) {
      if (Math.abs(x) <= 4.75 && Math.abs(z + 14.5) <= 3.1 && refY >= 0.0) {
        return 0.65;
      }
      return 0;
    }
    if (this.worldMode !== 'dungeon' || !this.dungeonRig) return 0;
    let supportY = 0;
    for (const p of this.dungeonRig.platforms) {
      if (Math.abs(x - p.x) <= p.halfW + 0.35 && Math.abs(z - p.z) <= p.halfD + 0.35) {
        if (refY >= p.topY - 0.65) {
          supportY = Math.max(supportY, p.topY);
        }
      }
    }
    for (const blk of this.dungeonRig.caveBlocks) {
      if (!blk.alive) continue;
      if (Math.abs(x - blk.x) <= blk.halfW + 0.35 && Math.abs(z - blk.z) <= blk.halfW + 0.35) {
        const topY = blk.y + 1.1;
        if (refY >= topY - 0.65) {
          supportY = Math.max(supportY, topY);
        }
      }
    }
    return supportY;
  }

  private pickRandomJumpTrick(): JumpDiveTrick {
    const tricks: JumpDiveTrick[] = [
      'backflip',
      'cannonball',
      'spreadeagle',
      'swan_dive',
      'front_flip',
      'corkscrew',
    ];
    const pool = this.lastJumpTrick ? tricks.filter((t) => t !== this.lastJumpTrick) : tricks;
    const picked = pool[Math.floor(Math.random() * pool.length)]!;
    this.lastJumpTrick = picked;
    return picked;
  }

  private isHeadingTowardWater(x: number, z: number, yaw: number): boolean {
    const sinY = Math.sin(yaw);
    const cosY = Math.cos(yaw);
    for (const dist of [0, 2.4, 4.4, 6.4]) {
      const s = sampleArchipelagoTerrain(x + sinY * dist, z + cosY * dist);
      if (!s.isLandOrBridge || s.groundY < -0.15) {
        return true;
      }
    }
    return false;
  }

  public jumpHero(): void {
    this.lastInputActivityMs = performance.now();
    if (this.phase !== 'playing' || this.carMode !== 'none' || this.planeMode !== 'none') return;
    if (this.worldMode === 'ocean' || this.isHeroUnderwater()) {
      this.heroVelY = Math.min(7.2, this.heroVelY + 4.8);
      soundEngine.playSplash(0.65);
      this.spawnBurst(this.heroPos.x, this.heroPos.y + 0.3, this.heroPos.z, 0xbae6fd, 8);
      return;
    }
    if (this.isSwimming) {
      this.jumpBufferTimer = 0;
      this.jumpLandTimer = 0;
      this.coyoteTimer = 0;
      this.swimLeapTimer = 0.54;
      this.heroVelY = 13.8;
      _forward.set(Math.sin(this.heroYaw), 0, Math.cos(this.heroYaw));
      this.heroVel.addScaledVector(_forward, 5.8);
      this.isSwimming = false;
      this.heroOnGround = false;
      this.refreshWeaponVisual();
      soundEngine.playSplash(0.95);
      this.spawnBurst(this.heroPos.x, 0.16, this.heroPos.z, 0xbae6fd, 14);
      return;
    }
    if (!this.heroOnGround && this.coyoteTimer <= 0) {
      this.jumpBufferTimer = 0.16;
      return;
    }
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.jumpLandTimer = 0;
    this.heroOnGround = false;
    if (this.worldMode === 'overworld' && this.isHeadingTowardWater(this.heroPos.x, this.heroPos.z, this.heroYaw)) {
      this.activeJumpTrick = this.pickRandomJumpTrick();
      this.jumpTrickElapsed = 0;
      this.jumpToSwimPlayedForAir = true;
      this.heroVelY = 12.6;
      soundEngine.playJumpToSwim();
    } else {
      this.activeJumpTrick = null;
      this.jumpTrickElapsed = 0;
      this.jumpToSwimPlayedForAir = false;
      this.heroVelY = 11.8;
      soundEngine.playDash();
    }
  }

  public openCraftingTable(): void {
    if (this.phase !== 'playing' || this.worldMode !== 'dungeon') return;
    this.phase = 'learning';
    this.heldKeys.clear();
    this.callbacks.onOpenCrafting();
    this.pushHud(true);
  }

  public craftCaveItem(recipe: 'pickaxe_2' | 'pickaxe_3' | 'torches' | 'ammo' | 'tnt'): void {
    if (recipe === 'pickaxe_2') {
      if (this.pickaxeTier >= 2 || this.caveShieldBlocksLeft < 4) {
        soundEngine.playNo();
        return;
      }
      this.caveShieldBlocksLeft -= 4;
      this.pickaxeTier = 2;
      this.showBanner('Beliung Besi (Tier 2) dibuat! Gali 2× lebih cepat!', 3.2);
    } else if (recipe === 'pickaxe_3') {
      if (this.pickaxeTier < 2 || this.pickaxeTier >= 3 || this.caveShieldBlocksLeft < 4 || this.diamonds < 2) {
        soundEngine.playNo();
        return;
      }
      this.caveShieldBlocksLeft -= 4;
      this.diamonds -= 2;
      this.pickaxeTier = 3;
      this.showBanner('Beliung Berlian (Tier 3) dibuat! Gali 3× lebih cepat!', 3.4);
    } else if (recipe === 'torches') {
      if (this.caveShieldBlocksLeft < 2 || this.caveTorchesLeft >= 24) {
        soundEngine.playNo();
        return;
      }
      this.caveShieldBlocksLeft -= 2;
      this.caveTorchesLeft = Math.min(24, this.caveTorchesLeft + 6);
      this.showBanner('Berhasil merakit +6 Obor Gua (🔦)!', 2.6);
    } else if (recipe === 'ammo') {
      if (this.ownedWeapons.size === 0 || this.caveShieldBlocksLeft < 2 || this.diamonds < 1) {
        soundEngine.playNo();
        return;
      }
      this.caveShieldBlocksLeft -= 2;
      this.diamonds -= 1;
      this.weaponAmmo[this.activeWeapon] = Math.min(
        MAX_AMMO,
        (this.weaponAmmo[this.activeWeapon] || 0) + 10,
      );
      this.showBanner(`Amunisi ${WEAPONS[this.activeWeapon].name} +10 Peluru dibuat!`, 2.8);
    } else if (recipe === 'tnt') {
      if (this.caveShieldBlocksLeft < 3 || this.caveTntLeft >= 16) {
        soundEngine.playNo();
        return;
      }
      this.caveShieldBlocksLeft -= 3;
      this.caveTntLeft = Math.min(16, this.caveTntLeft + 2);
      this.showBanner('Berhasil merakit +2 TNT Tambang (🧨 · Slot T)!', 3.0);
    }
    soundEngine.playUpgrade();
    this.refreshWeaponVisual();
    this.saveProgress();
    this.pushHud(true);
  }

  private getShieldPlacementCoords(): { x: number; y: number; z: number } {
    const dirX =
      this.cameraMode === 'first_person'
        ? -Math.sin(this.cameraYaw)
        : Math.sin(this.heroYaw);
    const dirZ =
      this.cameraMode === 'first_person'
        ? -Math.cos(this.cameraYaw)
        : Math.cos(this.heroYaw);
    const rawX = this.heroPos.x + dirX * 2.45;
    const rawZ = this.heroPos.z + dirZ * 2.45;
    const x = THREE.MathUtils.clamp(Math.round(rawX / 2) * 2, -18, 18);
    const z = THREE.MathUtils.clamp(Math.round(rawZ / 2) * 2, -18, 18);
    const supportTop = this.getDungeonSupportHeight(x, z, this.heroPos.y + 0.35);
    const y = Math.min(3.3, supportTop + 1.1);
    return { x, y, z };
  }

  public placeShieldBlock(): void {
    if (this.phase !== 'playing') return;
    this.fpSwingTimer = 0.22;

    if (this.worldMode !== 'dungeon' || !this.dungeonRig || !this.dungeonState) {
      soundEngine.playDash();
      this.showBanner('Masuk ke Gua Wilayah untuk menyusun Blok Pelindung!', 2.6);
      return;
    }

    if (this.caveShieldBlocksLeft <= 0) {
      soundEngine.playNo();
      this.showBanner('Stok Blok Pelindung habis! Gali Batu Gua (Slot 9 ⛏️) untuk dapat blok.', 2.6);
      return;
    }

    const { x: bx, y: by, z: bz } = this.getShieldPlacementCoords();
    if (Math.hypot(bx - this.heroPos.x, bz - this.heroPos.z) < 1.35 && Math.abs(by - (this.heroPos.y + 1.1)) < 1.1) {
      soundEngine.playNo();
      this.showBanner('Terlalu dekat dengan posisimu! Arahkan sedikit lebih jauh.', 1.8);
      return;
    }

    for (const col of this.dungeonRig.caveColliders) {
      if (Math.abs(bx - col.x) < 1.5 && Math.abs(bz - col.z) < 1.5) {
        soundEngine.playNo();
        this.showBanner('Titik tertutup pilar batu!', 1.8);
        return;
      }
    }
    for (const blk of this.dungeonRig.caveBlocks) {
      if (
        blk.alive &&
        Math.abs(bx - blk.x) < 1.5 &&
        Math.abs(bz - blk.z) < 1.5 &&
        Math.abs(by - blk.y) < 1.4
      ) {
        soundEngine.playNo();
        this.showBanner('Sudah ada blok di kotak ini!', 1.8);
        return;
      }
    }
    for (const door of ZONE_DOORS[this.dungeonState.zoneId]) {
      if (Math.hypot(bx - door.x, bz - door.z) < 2.6) {
        soundEngine.playNo();
        this.showBanner('Tidak bisa menutup gerbang Pintu Misi!', 2.0);
        return;
      }
    }
    if (Math.hypot(bx - this.dungeonExitPos.x, bz - this.dungeonExitPos.z) < 3.0) {
      soundEngine.playNo();
      this.showBanner('Tidak bisa menutup portal keluar gua!', 2.0);
      return;
    }

    this.caveShieldBlocksLeft -= 1;
    const id = `ps_${Date.now()}_${Math.floor(Math.random() * 999)}`;
    const mesh = new THREE.Mesh(this.dungeonRig.shieldBlockGeo, this.dungeonRig.shieldBlockMat);
    mesh.position.set(bx, by, bz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.caveBlockId = id;
    this.dungeonRig.group.add(mesh);
    this.dungeonClickables.push(mesh);

    this.dungeonRig.caveBlocks.push({
      id,
      kind: 'player_shield',
      label: 'Blok Pelindung',
      x: bx,
      y: by,
      z: bz,
      halfW: 1.0,
      hp: 4,
      maxHp: 4,
      mesh,
      alive: true,
    });
    this.getOrCreateZoneCaveDetail(this.dungeonState.zoneId).placedShieldBlocks.push({
      id,
      x: bx,
      y: by,
      z: bz,
      hp: 4,
    });

    this.spawnBurst(bx, by + 0.1, bz, 0x38bdf8, 10);
    soundEngine.playBuild();
    this.showBanner(
      'Blok Pelindung dipasang! Bisa jadi benteng peluru, penahan Creeper, atau pijakan jembatan!',
      2.6,
    );
    this.saveProgress();
    this.pushHud(true);
  }

  public placeAndTriggerTnt(): void {
    if (this.phase !== 'playing') return;
    this.fpSwingTimer = 0.24;

    if (this.worldMode !== 'dungeon' || !this.dungeonRig) {
      soundEngine.playDash();
      this.showBanner('Masuk ke Gua Wilayah untuk memasang TNT Tambang!', 2.6);
      return;
    }

    if (this.caveTntLeft <= 0) {
      soundEngine.playNo();
      this.showBanner('TNT habis! Buat lagi di ⚒️ Meja Craft gua (3 🧱 = +2 🧨).', 2.6);
      return;
    }

    const dirX =
      this.cameraMode === 'first_person'
        ? -Math.sin(this.cameraYaw)
        : Math.sin(this.heroYaw);
    const dirZ =
      this.cameraMode === 'first_person'
        ? -Math.cos(this.cameraYaw)
        : Math.cos(this.heroYaw);
    const tx = THREE.MathUtils.clamp(this.heroPos.x + dirX * 2.1, -18.0, 18.0);
    const tz = THREE.MathUtils.clamp(this.heroPos.z + dirZ * 2.1, -18.0, 18.0);
    const ty = this.getDungeonSupportHeight(tx, tz, this.heroPos.y + 0.5);

    this.caveTntLeft -= 1;
    const mesh = createCaveTntMesh(this.palette);
    mesh.position.set(tx, ty, tz);
    this.dungeonRig.group.add(mesh);
    this.activeTnts.push({ x: tx, y: ty, z: tz, timer: 1.7, mesh });

    soundEngine.playBuild();
    this.showBanner('🧨 TNT aktif! Menjauh — meledak dalam 1,7 detik!', 2.2);
    this.saveProgress();
    this.pushHud(true);
  }

  private collectCaveWeaponChest(): void {
    const rig = this.dungeonRig;
    if (!rig || rig.weaponChest.collected) return;
    rig.weaponChest.collected = true;
    rig.weaponChest.group.visible = false;
    if (this.dungeonState) {
      this.getOrCreateZoneCaveDetail(this.dungeonState.zoneId).weaponChestCollected = true;
    }

    const firstUnlock = !this.ownedWeapons.has('kerikil');
    this.ownedWeapons.add('kerikil');
    const gainAmmo = firstUnlock ? 12 : 10;
    this.weaponAmmo.kerikil = Math.min(MAX_AMMO, (this.weaponAmmo.kerikil || 0) + gainAmmo);
    if (!firstUnlock) {
      this.diamonds += 1;
    }
    this.activeWeapon = 'kerikil';
    const slotIdx = WEAPON_ORDER.indexOf('kerikil');
    if (slotIdx >= 0) this.activeHotbarSlot = slotIdx;

    this.refreshWeaponVisual();
    this.spawnBurst(rig.weaponChest.x, rig.weaponChest.y + 1.5, rig.weaponChest.z, 0x38bdf8, 28);
    if (firstUnlock) {
      soundEngine.playFanfare();
      this.showBanner(
        'Peti Rahasia Gua! Dapat Ketapel Kerikil (+12 Peluru · 3× bidik buka kuis monster)!',
        4.6,
      );
    } else {
      soundEngine.playPick();
      this.showBanner('Peti Rahasia Gua! +10 Peluru Kerikil & +1 💎!', 3.4);
    }
    this.saveProgress();
    this.pushHud(true);
  }

  private triggerHitMarker(isKill: boolean): void {
    this.hitMarkerTimer = 0.2;
    this.hitMarkerKind = isKill ? 'kill' : 'hit';
  }

  private computeDamageDirection(
    sourcePos?: { x: number; z: number },
  ): 'front' | 'back' | 'left' | 'right' | 'center' {
    if (!sourcePos) return 'center';
    const dx = sourcePos.x - this.heroPos.x;
    const dz = sourcePos.z - this.heroPos.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.15) return 'center';
    this.camera.getWorldDirection(_v1);
    _v1.y = 0;
    if (_v1.lengthSq() < 0.001) {
      _v1.set(Math.sin(this.heroYaw), 0, Math.cos(this.heroYaw));
    }
    _v1.normalize();
    const fx = _v1.x;
    const fz = _v1.z;
    const rx = -fz;
    const rz = fx;
    const forwardDot = (dx * fx + dz * fz) / dist;
    const rightDot = (dx * rx + dz * rz) / dist;
    if (Math.abs(rightDot) >= Math.abs(forwardDot)) {
      return rightDot >= 0 ? 'right' : 'left';
    }
    return forwardDot >= 0 ? 'front' : 'back';
  }

  private triggerDamageFlash(
    amount = 1,
    reason = 'Serangan monster',
    sourcePos?: { x: number; z: number },
  ): void {
    this.lastDamageAmount = Math.max(1, amount);
    this.lastDefeatReason = reason;
    this.lastDamageDir = this.computeDamageDirection(sourcePos);
    this.cameraShakeTimer = 0.34;
    this.cameraShakeStrength = amount >= 2 ? 0.38 : 0.25;
    if (this.hp > 0) {
      this.damageFlashTimer = 0.58;
      this.damageFlashSeq += 1;
      this.pushHud(true);
    }
  }

  private getCrosshairAimInfo(): { point: THREE.Vector3; hitEnemy: boolean } {
    this.raycaster.setFromCamera(_centerNdc, this.camera);
    const ro = this.raycaster.ray.origin;
    const rd = this.raycaster.ray.direction;
    const heroDepth =
      (this.heroPos.x - ro.x) * rd.x +
      (this.heroPos.y + 1.4 - ro.y) * rd.y +
      (this.heroPos.z - ro.z) * rd.z;

    let bestT = 78;
    let hitEnemy = false;

    // 1. Check Shooters under crosshair ray
    for (const s of this.shooters) {
      if (!s.alive) continue;
      const tx = s.x - ro.x;
      const ty = 1.38 - ro.y;
      const tz = s.z - ro.z;
      const t = tx * rd.x + ty * rd.y + tz * rd.z;
      if (t > heroDepth + 0.35 && t < bestT) {
        const px = ro.x + rd.x * t - s.x;
        const py = ro.y + rd.y * t - 1.38;
        const pz = ro.z + rd.z * t - s.z;
        if (px * px + py * py + pz * pz < 0.98 * 0.98) {
          bestT = t;
          hitEnemy = true;
        }
      }
    }

    // 2. Check Monsters (ground, giant, & flying) under crosshair ray
    for (const m of this.getActiveMonsters()) {
      if (!m.alive || m.angryTimer > 0) continue;
      const spec = MONSTER_SPECS[m.type];
      const baseGround =
        m.y ?? (this.worldMode === 'overworld' ? getArchipelagoGroundY(m.x, m.z) + spec.hoverY : spec.hoverY);
      const cy = baseGround + (m.isBoss ? 2.15 : spec.hitCenterY);
      const rad = m.isBoss ? Math.max(1.85, spec.hitRadius * 1.15) : spec.hitRadius;
      const tx = m.x - ro.x;
      const ty = cy - ro.y;
      const tz = m.z - ro.z;
      const t = tx * rd.x + ty * rd.y + tz * rd.z;
      if (t > heroDepth + 0.35 && t < bestT) {
        const px = ro.x + rd.x * t - m.x;
        const py = ro.y + rd.y * t - cy;
        const pz = ro.z + rd.z * t - m.z;
        if (px * px + py * py + pz * pz < rad * rad) {
          bestT = t;
          hitEnemy = true;
        }
      }
    }

    // 3. Check Dungeon walls & blocks so aiming at cover stops right on the surface
    if (this.worldMode === 'dungeon' && this.dungeonRig) {
      for (const col of this.dungeonRig.caveColliders) {
        const tWall = this.rayIntersectAabbDist(
          ro.x,
          ro.y,
          ro.z,
          rd.x,
          rd.y,
          rd.z,
          bestT,
          col.x - col.halfW,
          col.x + col.halfW,
          0,
          6.5,
          col.z - col.halfW,
          col.z + col.halfW,
        );
        if (tWall !== null && tWall > heroDepth + 0.35 && tWall < bestT) {
          bestT = tWall;
          hitEnemy = false;
        }
      }
      for (const blk of this.dungeonRig.caveBlocks) {
        if (!blk.alive || blk.kind === 'player_shield') continue;
        const tBlk = this.rayIntersectAabbDist(
          ro.x,
          ro.y,
          ro.z,
          rd.x,
          rd.y,
          rd.z,
          bestT,
          blk.x - blk.halfW,
          blk.x + blk.halfW,
          blk.y - 0.85,
          blk.y + 0.85,
          blk.z - blk.halfW,
          blk.z + blk.halfW,
        );
        if (tBlk !== null && tBlk > heroDepth + 0.35 && tBlk < bestT) {
          bestT = tBlk;
          hitEnemy = false;
        }
      }
    }

    // 4. Ground plane stop if aiming downward at ground
    if (!hitEnemy && rd.y < -0.01) {
      const tGround = -ro.y / rd.y;
      if (tGround > heroDepth + 0.5 && tGround < bestT) {
        bestT = tGround;
      }
    }

    _aimPoint.set(ro.x + rd.x * bestT, ro.y + rd.y * bestT, ro.z + rd.z * bestT);
    return { point: _aimPoint, hitEnemy };
  }

  public fireActiveWeapon(fromHold = false, skipTurnWait = false): void {
    if (this.phase !== 'playing' || this.carMode !== 'none' || this.planeMode !== 'none') return;
    if (this.isSwimming && this.worldMode !== 'ocean' && !this.isHeroUnderwater()) {
      const slotWpn = this.activeHotbarSlot <= 7 ? WEAPON_ORDER[this.activeHotbarSlot] : undefined;
      const canShootWater = Boolean(
        slotWpn && this.ownedWeapons.has(slotWpn) && SEA_CAPABLE_WEAPONS.has(slotWpn),
      );
      if (!canShootWater) {
        if (!fromHold) {
          this.showBanner(
            '🏊 Senjata awal tidak bisa ditembakkan saat berenang! Pakai Senjata Wilayah (Emas/Cepat/Hijau/Langit/Berat/Kristal) atau naik ke pantai.',
            2.6,
          );
          soundEngine.playNo();
        }
        return;
      }
    }
    this.lastInputActivityMs = performance.now();

    if (this.activeHotbarSlot === 8) {
      if (!fromHold) this.mineTargetedBlock();
      return;
    }
    if (this.activeHotbarSlot === 9) {
      if (!fromHold) this.placeCaveTorch();
      return;
    }
    if (this.activeHotbarSlot === 10) {
      if (!fromHold) this.placeShieldBlock();
      return;
    }
    if (this.activeHotbarSlot === 11) {
      if (!fromHold) this.placeAndTriggerTnt();
      return;
    }

    if (this.ownedWeapons.size === 0) {
      if (!fromHold) {
        this.showBanner(
          '🔎 Belum punya senjata! Ikuti cahaya biru ke kiri Alun-Alun untuk mengambil Senjata Pertamamu!',
          3.2,
        );
        soundEngine.playNo();
      }
      return;
    }

    const slotWeapon = WEAPON_ORDER[this.activeHotbarSlot];
    if (slotWeapon && !this.ownedWeapons.has(slotWeapon)) {
      if (!fromHold) {
        this.showBanner(
          `${WEAPONS[slotWeapon].name} belum terbuka! (${WEAPONS[slotWeapon].originLabel})`,
          2.8,
        );
        soundEngine.playNo();
      }
      return;
    }

    if (this.fireCooldown > 0) return;

    const wDef = WEAPONS[this.activeWeapon];
    if ((this.weaponAmmo[this.activeWeapon] || 0) <= 0) {
      if (fromHold) return;
      this.pendingTurnShot = null;
      this.fireCooldown = 0.35;
      this.fpSwingTimer = 0.2;
      if (this.performCaveMeleeStrike(1)) {
        this.saveProgress();
        this.pushHud(true);
        return;
      }
      soundEngine.playNo();
      this.showBanner(`Peluru ${wDef.name} habis! Gali batu / pakai Beliung untuk pukulan dekat.`, 2.6);
      return;
    }

    const isManualAim = this.settings.aimMode === 'manual';
    const poseCls = getWeaponPoseClass(this.activeWeapon);
    const muzzleHeight =
      this.cameraMode === 'first_person'
        ? 2.28
        : poseCls === 'heavy_gatling'
        ? 1.48
        : poseCls === 'rifle_twohand'
        ? 1.88
        : 1.92;
    const muzzleDist =
      poseCls === 'rifle_twohand' || poseCls === 'heavy_gatling' ? 1.45 : 1.15;
    const muzzleRight = this.cameraMode === 'first_person' ? 0.18 : 0.34;

    let aimYaw = this.heroYaw;
    let aimPitch = 0;
    let lockedTargetId: string | null = null;
    let lockedTargetPos: { x: number; y: number; z: number } | null = null;
    let dirX = Math.sin(aimYaw);
    let dirY = 0;
    let dirZ = Math.cos(aimYaw);

    if (isManualAim && (this.cameraMode === 'third_back' || this.cameraMode === 'first_person')) {
      // Bidik Bebas: manual 3D crosshair aiming in TPS & FPS views (supports straight-up skyward shots)
      const aim = this.getCrosshairAimInfo();
      aimYaw = Math.atan2(aim.point.x - this.heroPos.x, aim.point.z - this.heroPos.z);

      const mx0 =
        this.heroPos.x + Math.sin(aimYaw) * muzzleDist - Math.cos(aimYaw) * muzzleRight;
      const my0 = this.heroPos.y + muzzleHeight;
      const mz0 =
        this.heroPos.z + Math.cos(aimYaw) * muzzleDist + Math.sin(aimYaw) * muzzleRight;
      _v1.set(aim.point.x - mx0, aim.point.y - my0, aim.point.z - mz0);
      const len = _v1.length();
      if (len > 0.08) {
        _v1.divideScalar(len);
        dirX = _v1.x;
        dirY = _v1.y;
        dirZ = _v1.z;
      } else {
        dirX = Math.sin(aimYaw);
        dirY = 0;
        dirZ = Math.cos(aimYaw);
      }
      aimPitch = Math.atan2(dirY, Math.max(0.05, Math.hypot(dirX, dirZ)));
    } else {
      // Bidik Otomatis: auto-lock nearest ground, sea, or overhead sky enemy
      let bestDist = Infinity;
      let targetX = 0;
      let targetY = this.heroPos.y + muzzleHeight;
      let targetZ = 0;
      let foundTarget = false;

      if (this.worldMode === 'overworld') {
        for (const s of this.shooters) {
          if (!s.alive) continue;
          const d = Math.hypot(s.x - this.heroPos.x, s.z - this.heroPos.z);
          if (d < TUNE.autoAimRange && d < bestDist) {
            bestDist = d;
            targetX = s.x;
            targetY = getArchipelagoGroundY(s.x, s.z) + 1.65;
            targetZ = s.z;
            lockedTargetId = s.id;
            foundTarget = true;
          }
        }
      }

      for (const m of this.getActiveMonsters()) {
        if (!m.alive) continue;
        const d2d = Math.hypot(m.x - this.heroPos.x, m.z - this.heroPos.z);
        const maxRange = m.isSkyMonster ? TUNE.autoAimRange + 12 : TUNE.autoAimRange;
        if (d2d > maxRange) continue;
        const spec = MONSTER_SPECS[m.type];
        const mBaseY =
          m.y ??
          (this.worldMode === 'overworld'
            ? getArchipelagoGroundY(m.x, m.z) + spec.hoverY
            : spec.hoverY);
        const tY = mBaseY + (m.isBoss ? 2.1 : spec.hitCenterY);
        const d3d = m.isSkyMonster ? Math.hypot(d2d, tY - (this.heroPos.y + muzzleHeight)) : d2d;
        if (d3d < bestDist) {
          bestDist = d3d;
          targetX = m.x;
          targetY = tY;
          targetZ = m.z;
          lockedTargetId = m.id;
          foundTarget = true;
        }
      }

      if (foundTarget) {
        lockedTargetPos = { x: targetX, y: targetY, z: targetZ };
        aimYaw = Math.atan2(targetX - this.heroPos.x, targetZ - this.heroPos.z);
        const mx0 =
          this.heroPos.x + Math.sin(aimYaw) * muzzleDist - Math.cos(aimYaw) * muzzleRight;
        const my0 = this.heroPos.y + muzzleHeight;
        const mz0 =
          this.heroPos.z + Math.cos(aimYaw) * muzzleDist + Math.sin(aimYaw) * muzzleRight;
        _v1.set(targetX - mx0, targetY - my0, targetZ - mz0);
        const len = _v1.length();
        if (len > 0.08) {
          _v1.divideScalar(len);
          dirX = _v1.x;
          dirY = _v1.y;
          dirZ = _v1.z;
        } else {
          dirX = Math.sin(aimYaw);
          dirY = 0;
          dirZ = Math.cos(aimYaw);
        }
        aimPitch = Math.atan2(dirY, Math.max(0.05, Math.hypot(dirX, dirZ)));
      } else if (this.cameraMode === 'first_person') {
        const aim = this.getCrosshairAimInfo();
        aimYaw = Math.atan2(aim.point.x - this.heroPos.x, aim.point.z - this.heroPos.z);
        const mx0 =
          this.heroPos.x + Math.sin(aimYaw) * muzzleDist - Math.cos(aimYaw) * muzzleRight;
        const my0 = this.heroPos.y + muzzleHeight;
        const mz0 =
          this.heroPos.z + Math.cos(aimYaw) * muzzleDist + Math.sin(aimYaw) * muzzleRight;
        _v1.set(aim.point.x - mx0, aim.point.y - my0, aim.point.z - mz0);
        const len = _v1.length();
        if (len > 0.08) {
          _v1.divideScalar(len);
          dirX = _v1.x;
          dirY = _v1.y;
          dirZ = _v1.z;
        }
        aimPitch = Math.atan2(dirY, Math.max(0.05, Math.hypot(dirX, dirZ)));
      } else if (this.cameraMode === 'third_back' && this.cameraPitch < -0.15) {
        // Auto-mode user tilted camera upward toward sky: allow manual skyward free-shot even with no lock
        aimYaw = this.cameraYaw + Math.PI;
        const upPitch = THREE.MathUtils.clamp(-this.cameraPitch, 0.15, 1.18);
        const cosUp = Math.cos(upPitch);
        dirX = Math.sin(aimYaw) * cosUp;
        dirY = Math.sin(upPitch);
        dirZ = Math.cos(aimYaw) * cosUp;
        aimPitch = upPitch;
      } else {
        dirX = Math.sin(aimYaw);
        dirY = 0;
        dirZ = Math.cos(aimYaw);
        aimPitch = 0;
      }
    }

    if (!isManualAim && !fromHold) {
      this.manualLookHoldTimer = 0;
    }

    let turnDiff = aimYaw - this.heroYaw;
    while (turnDiff > Math.PI) turnDiff -= Math.PI * 2;
    while (turnDiff < -Math.PI) turnDiff += Math.PI * 2;
    if (!skipTurnWait && this.cameraMode !== 'first_person' && Math.abs(turnDiff) > 0.24) {
      this.shootAimYaw = aimYaw;
      this.shootAimPitch = aimPitch;
      this.shootAimTargetId = lockedTargetId;
      this.shootTargetPos = lockedTargetPos;
      this.shootAimTimer = Math.max(this.shootAimTimer, 1.25);
      this.pendingTurnShot = { fromHold };
      return;
    }

    this.pendingTurnShot = null;
    this.heroYaw = aimYaw;
    this.hero.body.rotation.y = aimYaw;
    this.shootAimYaw = aimYaw;
    this.shootAimPitch = aimPitch;
    this.shootAimTargetId = lockedTargetId;
    this.shootTargetPos = lockedTargetPos;

    this.weaponAmmo[this.activeWeapon] -= 1;
    this.fireCooldown = wDef.cooldown;
    this.fpSwingTimer = 0.2;
    this.shootAimTimer = 1.25;
    this.shootRecoilTimer = 0.22;
    soundEngine.playShoot(this.activeWeapon);

    const kick = wDef.cooldown >= 0.4 ? 0.032 : wDef.cooldown >= 0.25 ? 0.02 : 0.012;
    if (isManualAim) {
      this.recoilPitch = Math.min(0.14, this.recoilPitch + kick * (this.isAiming ? 0.65 : 1.0));
      this.crosshairSpread = Math.min(
        1.0,
        this.crosshairSpread + (wDef.cooldown >= 0.4 ? 0.68 : 0.35),
      );
    }

    const muzzleX =
      this.heroPos.x + Math.sin(aimYaw) * muzzleDist - Math.cos(aimYaw) * muzzleRight;
    const muzzleY = this.heroPos.y + muzzleHeight;
    const muzzleZ =
      this.heroPos.z + Math.cos(aimYaw) * muzzleDist + Math.sin(aimYaw) * muzzleRight;

    // Subtle bright muzzle spark right at barrel exit
    this.spawnBurst(muzzleX, muzzleY, muzzleZ, wDef.colorHex, 5);

    const angles = wDef.spread === 3 ? [-0.14, 0, 0.14] : [0];
    for (const offset of angles) {
      const cosO = Math.cos(offset);
      const sinO = Math.sin(offset);
      const rx = dirX * cosO + dirZ * sinO;
      const rz = -dirX * sinO + dirZ * cosO;
      this.spawnProjectile({
        fromPlayer: true,
        weaponId: this.activeWeapon,
        x: muzzleX,
        y: muzzleY,
        z: muzzleZ,
        vx: rx * wDef.speed,
        vy: dirY * wDef.speed,
        vz: rz * wDef.speed,
        damage: wDef.damage,
        shieldDamage: wDef.shieldDamage,
        pierceLeft: wDef.pierce || 0,
        colorHex: wDef.colorHex,
      });
      if (this.multiplayerActive && this.hasConnectedPeers) {
        this.emitMultiplayerPacket({
          t: 'shot',
          fp: true,
          wid: this.activeWeapon,
          x: Math.round(muzzleX * 100) / 100,
          y: Math.round(muzzleY * 100) / 100,
          z: Math.round(muzzleZ * 100) / 100,
          vx: Math.round(rx * wDef.speed * 100) / 100,
          vy: Math.round(dirY * wDef.speed * 100) / 100,
          vz: Math.round(rz * wDef.speed * 100) / 100,
          col: wDef.colorHex,
          dmg: wDef.damage,
          md: this.worldMode,
        });
      }
    }
    this.pushHud(true);
  }

  private spawnProjectile(opts: {
    fromPlayer: boolean;
    fromPlane?: boolean;
    planeAmmo?: PlaneAmmoType;
    weaponId?: WeaponId;
    x: number;
    y?: number;
    z: number;
    vx: number;
    vy?: number;
    vz: number;
    gravity?: number;
    homingTargetId?: string;
    aoeRadius?: number;
    explosionColor?: number;
    damage: number;
    shieldDamage: number;
    pierceLeft: number;
    colorHex: number;
    visualOnly?: boolean;
  }): void {
    const slot = this.projectiles.find((p) => !p.active);
    if (!slot) return;
    slot.active = true;
    slot.fromPlayer = opts.fromPlayer;
    slot.fromPlane = Boolean(opts.fromPlane);
    slot.planeAmmo = opts.planeAmmo;
    slot.weaponId = opts.weaponId;
    slot.visualOnly = Boolean(opts.visualOnly);
    slot.x = opts.x;
    slot.y = opts.y ?? 1.35;
    slot.z = opts.z;
    slot.vx = opts.vx;
    slot.vy = opts.vy ?? 0;
    slot.vz = opts.vz;
    slot.gravity = opts.gravity;
    slot.homingTargetId = opts.homingTargetId;
    slot.aoeRadius = opts.aoeRadius;
    slot.explosionColor = opts.explosionColor;
    slot.damage = opts.damage;
    slot.shieldDamage = opts.shieldDamage;
    slot.pierceLeft = opts.pierceLeft;
    slot.hitIds.clear();
    const horizSpd = Math.hypot(opts.vx, opts.vz);
    slot.life = opts.fromPlane
      ? opts.planeAmmo === 'bomb'
        ? 4.2
        : 2.8
      : opts.fromPlayer && Math.abs(opts.vy ?? 0) > horizSpd * 0.18
      ? 1.85
      : 1.45;
    (slot.mesh.material as THREE.MeshBasicMaterial).color.setHex(opts.colorHex);
    const scaleVal = opts.fromPlane
      ? opts.planeAmmo === 'bomb'
        ? 2.15
        : opts.planeAmmo === 'missile' || opts.planeAmmo === 'plasma'
        ? 1.65
        : 1.15
      : opts.damage > 1
      ? 1.45
      : 1.0;
    slot.mesh.scale.setScalar(scaleVal);
    slot.mesh.position.set(opts.x, slot.y, opts.z);
    slot.mesh.visible = true;
  }

  private getActiveMonsters(): RoamingMonster[] {
    if (this.worldMode === 'dungeon') return this.dungeonMonsters;
    if (this.worldMode === 'academy') return this.academyMonsters;
    if (this.worldMode === 'ocean') return this.oceanMonsters;
    return this.overworldAllMonsters;
  }

  private engageMonster(m: RoamingMonster): void {
    if (m.combatOnly || m.isCaveMob || this.carMode !== 'none' || this.planeMode !== 'none') return;
    this.phase = 'battle';
    this.heldKeys.clear();
    this.tapMoveTarget = null;
    soundEngine.playBoss();
    const isZoneBoss = Boolean(m.isBoss && this.worldMode === 'dungeon');
    const boss = isZoneBoss ? BOSSES[m.zoneId] : undefined;
    this.callbacks.onStartBattle({
      monsterId: m.id,
      monsterType: m.type,
      monsterName: m.name,
      zoneId: m.zoneId,
      isIeltsBoss: false,
      isZoneBoss,
      isAcademyShadow: m.isAcademyShadow,
      academySkill: m.academySkill,
      bossMechanic: boss?.mechanic,
      isMixedChallenge: this.worldMode === 'dungeon' && Boolean(this.dungeonState?.isMixedChallenge),
      monsterHp: isZoneBoss && boss ? boss.hpPerPhase : m.maxHp,
      monsterMaxHp: isZoneBoss && boss ? boss.hpPerPhase : m.maxHp,
      bossPhase: isZoneBoss ? 1 : undefined,
      roundNumber: 1,
      wordIds: m.wordIds,
    });
    this.pushHud(true);
  }

  private onPointerLockChange = (): void => {
    this.pointerLocked = document.pointerLockElement === this.renderer.domElement;
    if (!this.pointerLocked) {
      this.leftFireHeld = false;
      this.planeFireHeld = false;
    }
    this.pushHud(true);
  };

  private onContextMenu = (e: MouseEvent): void => {
    if (this.phase === 'playing') {
      e.preventDefault();
    }
  };

  private bindEvents(): void {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);
    window.addEventListener('pagehide', this.onPageHideSave);
    window.addEventListener('beforeunload', this.onPageHideSave);
    document.addEventListener('visibilitychange', this.onVisibilitySave);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.onPointerDown);
    dom.addEventListener('pointermove', this.onPointerMove);
    dom.addEventListener('pointerup', this.onPointerUp);
    dom.addEventListener('pointercancel', this.onPointerCancel);
    dom.addEventListener('wheel', this.onWheel, { passive: false });
    dom.addEventListener('contextmenu', this.onContextMenu);
  }

  private onPageHideSave = (): void => {
    if (this.phase !== 'title' && !this.multiplayerActive) {
      this.saveProgress();
    }
  };

  private onVisibilitySave = (): void => {
    if (document.visibilityState === 'hidden') {
      if (this.phase !== 'title' && !this.multiplayerActive) {
        this.saveProgress();
      }
      soundEngine.setWalking(false);
    } else if (!this.disposed) {
      this.lastTimeMs = performance.now();
      this.lastFrameRenderMs = 0;
      this.forceRenderNextFrame = true;
      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
      this.scheduleNextTick();
    }
  };

  private onResize = (): void => {
    if (this.disposed) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.forceRenderNextFrame = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.scheduleNextTick();
  };

  private onWindowBlur = (): void => {
    this.heldKeys.clear();
    this.clearCarControls();
    this.clearPlaneControls();
    this.lookPointer = null;
    this.rightAimHeld = false;
    this.leftFireHeld = false;
    this.hudFireHeld = false;
    this.jumpBufferTimer = 0;
    this.isAiming = this.aimToggled;
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    this.lastInputActivityMs = performance.now();
    this.heldKeys.add(e.code);
    if (e.repeat) return;

    if (this.phase === 'playing') {
      if (this.carMode !== 'none') {
        if (e.code === 'KeyE' || e.code === 'Enter') {
          e.preventDefault();
          if (this.carMode === 'driving') this.enterOrExitCar();
          return;
        }
        if (e.code === 'KeyH') {
          e.preventDefault();
          this.honkCarHorn();
          return;
        }
        if (e.code === 'KeyL') {
          e.preventDefault();
          this.toggleCarHeadlights();
          return;
        }
        if (e.code === 'KeyP') {
          e.preventDefault();
          this.toggleCarHandbrake();
          return;
        }
        if (e.code === 'KeyC' || e.code === 'F5') {
          e.preventDefault();
          this.toggleCameraMode();
          return;
        }
        if (e.code === 'Space') {
          e.preventDefault();
          return;
        }
        return;
      }
      if (this.planeMode !== 'none') {
        if (e.code === 'KeyE' || e.code === 'Enter') {
          e.preventDefault();
          if (this.planeMode === 'taxi' || this.planeMode === 'flying') this.enterOrExitPlane();
          return;
        }
        if (e.code === 'Digit1') {
          this.selectPlaneAmmo('vulcan');
          return;
        }
        if (e.code === 'Digit2') {
          this.selectPlaneAmmo('missile');
          return;
        }
        if (e.code === 'Digit3') {
          this.selectPlaneAmmo('bomb');
          return;
        }
        if (e.code === 'Digit4') {
          this.selectPlaneAmmo('plasma');
          return;
        }
        if (e.code === 'KeyF' || e.code === 'KeyG' || e.code === 'KeyJ') {
          e.preventDefault();
          this.firePlaneWeapon(false);
          return;
        }
        if (e.code === 'KeyC' || e.code === 'F5') {
          e.preventDefault();
          this.toggleCameraMode();
          return;
        }
        if (e.code === 'Space' || e.code === 'ControlLeft' || e.code === 'ControlRight') {
          e.preventDefault();
          return;
        }
        return;
      }
      if (e.code.startsWith('Digit')) {
        const num = Number(e.code.slice(5));
        if (num >= 1 && num <= 9) {
          this.selectHotbarSlot(num - 1);
          return;
        }
        if (num === 0) {
          this.selectHotbarSlot(9);
          return;
        }
      }
      if (e.code === 'KeyB') {
        this.selectHotbarSlot(10);
        return;
      }
      if (e.code === 'KeyT') {
        this.selectHotbarSlot(11);
        return;
      }
      if (e.code === 'KeyQ' || e.code === 'KeyV') {
        e.preventDefault();
        this.toggleAimMode();
        return;
      }
      if (e.code === 'KeyL') {
        e.preventDefault();
        this.togglePointerLock();
        return;
      }
      if (e.code === 'KeyJ') {
        e.preventDefault();
        this.jumpHero();
        return;
      }
      if (e.code === 'KeyE' || e.code === 'Enter') {
        e.preventDefault();
        this.triggerPrimaryAction();
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (this.isSwimming) {
          this.jumpHero();
        } else if (this.activeHotbarSlot >= 8 || this.ownedWeapons.size > 0) {
          this.fireActiveWeapon(false);
        } else {
          this.triggerPrimaryAction();
        }
      } else if (e.code === 'KeyF') {
        if (this.dashCooldown <= 0) {
          this.dashCooldown = 1.1;
          this.pulseRingTimer = 0.4;
          _forward.set(Math.sin(this.heroYaw), 0, Math.cos(this.heroYaw));
          this.heroVel.addScaledVector(_forward, 22);
          soundEngine.playDash();
        }
      } else if (e.code === 'KeyR' && this.multiplayerActive) {
        e.preventDefault();
        this.helpNearbyTeammate();
      } else if (e.code === 'KeyG' && this.isSwimming) {
        e.preventDefault();
        this.cycleSwimStyle();
      } else if (e.code === 'KeyX' && (this.worldMode === 'overworld' || this.worldMode === 'ocean')) {
        e.preventDefault();
        this.toggleDiveOcean();
      } else if (e.code === 'KeyC' || e.code === 'F5') {
        e.preventDefault();
        this.toggleCameraMode();
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.heldKeys.delete(e.code);
  };

  private onWheel = (e: WheelEvent): void => {
    if (this.phase !== 'playing') return;
    if (this.cameraMode === 'third_back' || this.cameraMode === 'third_front') {
      e.preventDefault();
      this.thirdPersonDist = THREE.MathUtils.clamp(
        this.thirdPersonDist + e.deltaY * 0.008,
        4.0,
        15.0,
      );
    }
  };

  private onPointerDown = (e: PointerEvent): void => {
    this.lastInputActivityMs = performance.now();
    if (this.phase !== 'playing') return;
    if (e.button === 2) {
      if (
        this.settings.aimMode === 'manual' &&
        this.activeHotbarSlot <= 7 &&
        this.ownedWeapons.has(this.activeWeapon)
      ) {
        this.rightAimHeld = true;
        this.isAiming = true;
      }
      if (this.lookPointer === null) {
        this.lookPointer = {
          id: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          lastX: e.clientX,
          lastY: e.clientY,
          moved: false,
        };
      }
      return;
    }

    if (e.button === 0 && document.pointerLockElement === this.renderer.domElement) {
      if (this.planeMode === 'taxi' || this.planeMode === 'flying') {
        this.planeFireHeld = true;
        this.firePlaneWeapon(false);
        return;
      }
      this.leftFireHeld = true;
      this.fireActiveWeapon(false);
      return;
    }

    if (this.lookPointer === null) {
      this.lookPointer = {
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        moved: false,
      };
    }
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (this.phase !== 'playing' || this.cameraMode === 'orbit') return;

    const sensScale = this.isAiming ? 0.65 : 1.0;

    if (document.pointerLockElement === this.renderer.domElement) {
      if (Math.hypot(e.movementX, e.movementY) > 2.5) {
        this.manualLookHoldTimer = 0.55;
        this.autoCamPitchActive = false;
      }
      this.cameraYaw -= e.movementX * 0.0042 * sensScale;
      const minP = this.cameraMode === 'first_person' ? -1.25 : -1.18;
      this.cameraPitch = THREE.MathUtils.clamp(
        this.cameraPitch + e.movementY * 0.0038 * sensScale,
        minP,
        1.12,
      );
      return;
    }

    if (!this.lookPointer || this.lookPointer.id !== e.pointerId) return;
    const dx = e.clientX - this.lookPointer.lastX;
    const dy = e.clientY - this.lookPointer.lastY;
    this.lookPointer.lastX = e.clientX;
    this.lookPointer.lastY = e.clientY;

    if (
      !this.lookPointer.moved &&
      Math.hypot(e.clientX - this.lookPointer.startX, e.clientY - this.lookPointer.startY) > 5
    ) {
      this.lookPointer.moved = true;
    }

    if (this.lookPointer.moved) {
      this.lastInputActivityMs = performance.now();
      this.manualLookHoldTimer = 0.55;
      this.autoCamPitchActive = false;
      const sens = (e.pointerType === 'touch' ? 0.0072 : 0.0048) * sensScale;
      this.cameraYaw -= dx * sens;
      const minP = this.cameraMode === 'first_person' ? -1.25 : -1.18;
      this.cameraPitch = THREE.MathUtils.clamp(
        this.cameraPitch + dy * sens,
        minP,
        1.12,
      );
    }
  };

  private onPointerCancel = (e: PointerEvent): void => {
    if (e.button === 2) {
      this.rightAimHeld = false;
      this.isAiming = this.aimToggled;
    }
    this.leftFireHeld = false;
    this.planeFireHeld = false;
    if (this.lookPointer?.id === e.pointerId) {
      this.lookPointer = null;
    }
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (e.button === 2) {
      this.rightAimHeld = false;
      this.isAiming = this.aimToggled;
      if (this.lookPointer?.id === e.pointerId) {
        this.lookPointer = null;
      }
      return;
    }
    this.leftFireHeld = false;
    this.planeFireHeld = false;

    const lp = this.lookPointer;
    if (lp && lp.id === e.pointerId) {
      this.lookPointer = null;
      if (lp.moved) return;
    } else if (lp !== null) {
      return;
    }
    if (this.phase !== 'playing') return;
    if (this.carMode !== 'none') return;
    if (this.planeMode !== 'none') {
      if ((this.planeMode === 'taxi' || this.planeMode === 'flying') && document.pointerLockElement !== this.renderer.domElement) {
        this.firePlaneWeapon(false);
      }
      return;
    }
    if (document.pointerLockElement === this.renderer.domElement) return;

    const hasArmedWeapon =
      this.activeHotbarSlot <= 7 && this.ownedWeapons.has(this.activeWeapon);

    // When in ADS / First-Person mode with a weapon, Left-Click shoots directly at crosshair!
    if (hasArmedWeapon && (this.isAiming || this.cameraMode === 'first_person')) {
      this.fireActiveWeapon(false);
      return;
    }

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);

    const targets =
      this.worldMode === 'dungeon'
        ? this.dungeonClickables
        : this.worldMode === 'academy'
        ? this.academyClickables
        : this.worldMode === 'ocean'
        ? this.oceanClickables
        : this.overworldClickables;
    const hits = this.raycaster.intersectObjects(targets, true);
    if (hits.length > 0) {
      let obj: THREE.Object3D | null = hits[0].object;
      while (
        obj &&
        !obj.userData.npcId &&
        !obj.userData.monsterId &&
        !obj.userData.portal &&
        !obj.userData.driveableCar &&
        !obj.userData.driveablePlane &&
        !obj.userData.dungeonExit &&
        !obj.userData.academyExit &&
        !obj.userData.oceanExit &&
        !obj.userData.oceanChestId &&
        !obj.userData.biotaNodeId &&
        !obj.userData.caveBlockId &&
        !obj.userData.caveWeaponChest &&
        !obj.userData.craftingTable &&
        !obj.userData.caveGuardian &&
        !obj.userData.prisonKey &&
        !obj.userData.hiddenPrison &&
        obj.userData.doorIndex === undefined
      ) {
        obj = obj.parent;
      }
      if (obj) {
        if (obj.userData.driveableCar && this.worldMode === 'overworld') {
          this.enterOrExitCar(obj.userData.vehicleId as string | undefined);
          return;
        }
        if (obj.userData.driveablePlane && this.worldMode === 'overworld') {
          this.enterOrExitPlane(obj.userData.planeId as string | undefined);
          return;
        }
        if (obj.userData.oceanExit && this.worldMode === 'ocean' && this.oceanRig) {
          if (
            Math.hypot(
              this.heroPos.x - this.oceanRig.buoyPos.x,
              this.heroPos.z - this.oceanRig.buoyPos.z,
            ) < 7.5
          ) {
            this.exitDungeon();
          } else {
            this.tapMoveTarget = this.oceanRig.buoyPos.clone();
            this.showBanner('🫧 Berenang menuju Pelampung Naik ke Permukaan...', 2.2);
          }
          return;
        }
        const activeOceanRig =
          this.worldMode === 'ocean'
            ? this.oceanRig
            : this.worldMode === 'overworld'
            ? this.archipelagoUnderwaterRig
            : null;
        if (obj.userData.oceanChestId && activeOceanRig) {
          const ch = activeOceanRig.chests.find((item) => item.id === obj!.userData.oceanChestId);
          if (ch && !ch.opened) {
            if (Math.hypot(this.heroPos.x - ch.x, this.heroPos.z - ch.z) < 5.0) {
              this.interactWithOceanChest(ch);
            } else {
              this.tapMoveTarget = new THREE.Vector3(ch.x, ch.y, ch.z);
              this.showBanner(`🧰 Menuju ${ch.label}...`, 2.0);
            }
          }
          return;
        }
        if (obj.userData.biotaNodeId && activeOceanRig) {
          const node = activeOceanRig.biotaNodes.find(
            (item) => item.id === obj!.userData.biotaNodeId,
          );
          if (node) {
            if (Math.hypot(this.heroPos.x - node.x, this.heroPos.z - node.z) < 5.2) {
              this.interactWithBiotaNode(node);
            } else {
              this.tapMoveTarget = new THREE.Vector3(node.x, node.y, node.z);
              const entry = SEA_BIOTA_BY_ID[node.speciesId];
              this.showBanner(`🐠 Mendekati ${entry?.indoName ?? 'Biota Laut'}...`, 1.8);
            }
          }
          return;
        }
        if (obj.userData.prisonKey && this.worldMode === 'dungeon' && this.dungeonState) {
          if (Math.hypot(this.heroPos.x, this.heroPos.z + 9) < 6.5) {
            this.collectPrisonKey();
          } else {
            this.tapMoveTarget = new THREE.Vector3(0, 0, -9);
            this.showBanner('Menuju Kunci Penjara Emas...', 2.0);
          }
          return;
        }
        if (
          obj.userData.hiddenPrison &&
          this.worldMode === 'dungeon' &&
          this.dungeonRig &&
          this.dungeonState
        ) {
          if (
            Math.hypot(
              this.dungeonRig.prisonPos.x - this.heroPos.x,
              this.dungeonRig.prisonPos.z - this.heroPos.z,
            ) < 6.0
          ) {
            this.interactWithHiddenPrison();
          } else {
            this.tapMoveTarget = this.dungeonRig.prisonPos.clone();
            this.showBanner(`Menuju Penjara Tersembunyi (${this.dungeonState.captiveName})...`, 2.2);
          }
          return;
        }
        if (
          obj.userData.caveGuardian &&
          this.worldMode === 'dungeon' &&
          this.dungeonRig
        ) {
          if (
            Math.hypot(
              this.dungeonRig.guardianPos.x - this.heroPos.x,
              this.dungeonRig.guardianPos.z - this.heroPos.z,
            ) < 6.5
          ) {
            this.talkToCaveGuardian();
          } else {
            this.tapMoveTarget = new THREE.Vector3(2.8, 0, 12.2);
            this.showBanner(`Menuju ${this.dungeonState?.guardianName || 'Penjaga Gua'}...`, 2.0);
          }
          return;
        }
        if (
          obj.userData.craftingTable &&
          this.worldMode === 'dungeon' &&
          this.dungeonRig &&
          Math.hypot(
            this.dungeonRig.craftingTablePos.x - this.heroPos.x,
            this.dungeonRig.craftingTablePos.z - this.heroPos.z,
          ) < 7.5
        ) {
          this.openCraftingTable();
          return;
        }
        if (
          obj.userData.caveWeaponChest &&
          this.worldMode === 'dungeon' &&
          this.dungeonRig &&
          !this.dungeonRig.weaponChest.collected &&
          Math.hypot(
            this.dungeonRig.weaponChest.x - this.heroPos.x,
            this.dungeonRig.weaponChest.z - this.heroPos.z,
          ) < 7.5
        ) {
          if (Math.abs(this.heroPos.y - this.dungeonRig.weaponChest.y) < 1.8) {
            this.collectCaveWeaponChest();
          } else {
            this.showBanner('Lompat ke atas tebing batu (⬆️ / J) untuk mengambil Peti Senjata!', 2.4);
          }
          return;
        }
        if (obj.userData.caveBlockId && this.worldMode === 'dungeon' && this.dungeonRig) {
          const blk = this.dungeonRig.caveBlocks.find(
            (b) => b.id === obj!.userData.caveBlockId && b.alive,
          );
          if (blk && Math.hypot(blk.x - this.heroPos.x, blk.z - this.heroPos.z) < 7.5) {
            this.targetedCaveBlock = blk;
            this.dungeonRig.blockHighlight.position.set(blk.x, blk.y, blk.z);
            this.dungeonRig.blockHighlight.visible = true;
            if (blk.kind === 'word_seal' && this.activeHotbarSlot !== 8) {
              this.openWordSealChallenge(blk);
            } else if (this.activeHotbarSlot === 8) {
              this.mineTargetedBlock();
            } else if (this.activeHotbarSlot === 9) {
              this.placeCaveTorch();
            } else if (this.activeHotbarSlot === 10) {
              this.placeShieldBlock();
            } else if (this.activeHotbarSlot === 11) {
              this.placeAndTriggerTnt();
            } else {
              this.showBanner(`Pilih Slot 9 (⛏️ Beliung) untuk menggali ${blk.label}!`, 2.2);
            }
            return;
          }
        }
        if (obj.userData.dungeonExit || obj.userData.academyExit) {
          this.exitDungeon();
          return;
        }
        if (obj.userData.doorIndex !== undefined && this.worldMode === 'dungeon') {
          this.openDungeonDoor(Number(obj.userData.doorIndex));
          return;
        }
        if (obj.userData.npcId) {
          if (this.worldMode === 'academy') {
            const npc = ACADEMY_NPCS.find((n) => n.id === obj!.userData.npcId);
            if (npc?.academySkill === 'exit') this.exitDungeon();
            else if (npc?.academySkill) {
              this.phase = 'academy';
              this.callbacks.onOpenAcademyExam(npc.academySkill);
            }
            this.pushHud(true);
          } else {
            this.interactWithOverworldNpc(obj.userData.npcId as string);
          }
          return;
        }
        if (obj.userData.portal && this.worldMode === 'overworld') {
          this.enterAcademy();
          return;
        }
        if (obj.userData.starterPickup && this.worldMode === 'overworld' && !this.starterWeaponPicked) {
          const sw = OVERWORLD_ANCHORS.starterWeapon;
          this.tapMoveTarget = new THREE.Vector3(sw.x, getArchipelagoGroundY(sw.x, sw.z), sw.z);
          this.showBanner('Menuju ke Senjata Pertamamu...', 2.0);
          return;
        }
        if (obj.userData.swimSuitPickup && this.worldMode === 'overworld' && !this.swimSuitPicked) {
          this.walkToSwimSuit();
          return;
        }
        if (obj.userData.academyTip && this.worldMode === 'academy') {
          this.showBanner(obj.userData.academyTip as string, 4.8);
          soundEngine.playPick();
          return;
        }
        if (obj.userData.villageId && this.worldMode === 'overworld') {
          const vItem = this.villageRig.interactables.find(
            (item) => item.id === obj!.userData.villageId,
          );
          if (vItem) {
            this.showBanner(vItem.message, 3.4);
            soundEngine.playPick();
          }
          return;
        }
        if (obj.userData.monsterId) {
          const m = this.getActiveMonsters().find((item) => item.id === obj!.userData.monsterId && item.alive);
          if (m) {
            if (m.combatOnly || m.isCaveMob) {
              this.fireActiveWeapon(false);
            } else {
              this.engageMonster(m);
            }
            return;
          }
        }
      }
    }

    // With an armed weapon in Bidik Bebas TPS, clicking empty view fires at crosshair;
    // in Bidik Otomatis mode, clicking empty ground performs classic Tap-to-Move.
    if (
      this.settings.aimMode === 'manual' &&
      hasArmedWeapon &&
      this.cameraMode === 'third_back' &&
      e.button === 0
    ) {
      this.fireActiveWeapon(false);
      return;
    }

    if (this.worldMode === 'overworld' && this.archipelagoRig) {
      const groundHits = this.raycaster.intersectObjects(this.archipelagoRig.walkableTargets, false);
      if (groundHits.length > 0) {
        const pt = groundHits[0].point.clone();
        constrainHeroToWorldBounds(pt, 1.0);
        const s = sampleArchipelagoTerrain(pt.x, pt.z);
        pt.y = s.isLandOrBridge ? s.groundY : 0;
        this.tapMoveTarget = pt;
        this.spawnBurst(pt.x, pt.y + 0.3, pt.z, s.isLandOrBridge ? 0x38bdf8 : 0xbae6fd, 6);
        return;
      }
    }

    const groundHit = new THREE.Vector3();
    this.groundPlane.constant = this.worldMode === 'overworld' ? -Math.max(0, this.heroPos.y) : 0;
    if (this.raycaster.ray.intersectPlane(this.groundPlane, groundHit)) {
      if (this.worldMode === 'overworld') {
        constrainHeroToWorldBounds(groundHit, 1.0);
        const s = sampleArchipelagoTerrain(groundHit.x, groundHit.z);
        groundHit.y = s.isLandOrBridge ? s.groundY : 0;
      }
      this.tapMoveTarget = groundHit;
      this.spawnBurst(groundHit.x, groundHit.y + 0.3, groundHit.z, 0x38bdf8, 6);
    }
  };

  private getTargetFrameIntervalMs(now: number): number {
    if (
      this.backgroundIdle ||
      this.phase === 'paused' ||
      this.phase === 'gameover' ||
      this.phase === 'battle' ||
      this.phase === 'learning' ||
      this.phase === 'academy'
    ) {
      return 650;
    }
    if (this.phase === 'title') {
      return this.isLowEndMobile ? 44 : this.isMobileDevice ? 38 : 32;
    }
    if (this.phase === 'dialogue' || this.phase === 'story') {
      return this.isMobileDevice ? 32 : 16;
    }
    const fx = this.settings.fxLevel;
    if (fx === 'off') return 32;
    if (fx === 'lite') return this.isMobileDevice ? 32 : 16;
    // Idle power-save: ease gently when standing completely still with no active touch/projectiles
    if (
      this.isMobileDevice &&
      this.heldKeys.size === 0 &&
      Math.abs(this.virtualMove.x) < 0.02 &&
      Math.abs(this.virtualMove.z) < 0.02 &&
      !this.tapMoveTarget &&
      !this.leftFireHeld &&
      !this.hudFireHeld &&
      !this.hasActiveParticles &&
      now - this.lastInputActivityMs > 1800
    ) {
      return 42;
    }
    // Low-end mobile devices lock to rock-steady 30-40Hz pacing so full PBR + shadows + sharp DPR stay cool
    if (this.isLowEndMobile) return 26;
    // Adaptive thermal governor: if a mid-range mobile device takes >11ms per frame tick, ease to ~35-45Hz headroom
    if (this.isMobileDevice && this.emaFrameWorkMs > 11) return 24;
    // Cap at 60 FPS (prevents 120Hz thermal drain while keeping 60Hz buttery smooth)
    return 16;
  }

  private scheduleNextTick(): void {
    if (this.disposed || document.hidden) return;
    const isIdle =
      this.backgroundIdle ||
      this.phase === 'paused' ||
      this.phase === 'gameover' ||
      this.phase === 'battle' ||
      this.phase === 'learning' ||
      this.phase === 'academy';
    if (isIdle && !this.forceRenderNextFrame) {
      this.frameId = window.setTimeout(this.tick, 650);
      return;
    }
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick = (): void => {
    if (this.disposed || document.hidden) return;
    const now = performance.now();
    const targetFrameMs = this.getTargetFrameIntervalMs(now);
    if (!this.forceRenderNextFrame && now - this.lastFrameRenderMs < targetFrameMs - 2.0) {
      this.scheduleNextTick();
      return;
    }
    this.lastFrameRenderMs = now;
    this.animFrameCounter = (this.animFrameCounter + 1) & 0xffff;

    const rawDt = (now - this.lastTimeMs) / 1000;
    this.lastTimeMs = now;
    const dt = Math.min(Math.max(rawDt, 0.001), 0.06);
    this.elapsed += dt;

    const isModalIdlePhase =
      this.backgroundIdle ||
      this.phase === 'paused' ||
      this.phase === 'gameover' ||
      this.phase === 'battle' ||
      this.phase === 'learning' ||
      this.phase === 'academy';

    if (isModalIdlePhase) {
      if (this.forceRenderNextFrame) {
        this.forceRenderNextFrame = false;
        if (this.renderer.shadowMap.enabled) {
          this.renderer.shadowMap.needsUpdate = true;
          this.lastShadowUpdateMs = now;
        }
        this.renderer.render(this.scene, this.camera);
      }
      this.scheduleNextTick();
      return;
    }

    this.forceRenderNextFrame = false;
    this.updateWorldAnimations(dt);
    if (this.phase === 'title') {
      const a = this.elapsed * 0.1;
      _v1.set(Math.cos(a) * 175 + 20, 78 + Math.sin(this.elapsed * 0.35) * 3.5, Math.sin(a) * 175 + 32);
      this.camera.position.lerp(_v1, 1 - Math.exp(-3 * dt));
      this.controls.target.set(20, 10, 32);
      this.controls.update();
    } else if (this.phase === 'story') {
      this.updateStoryAnimations(dt);
      this.controls.update();
    } else if (this.phase === 'dialogue') {
      this.updateDialogueCamera(dt);
      this.controls.update();
    } else if (this.phase === 'playing') {
      this.updatePlaying(dt);
      if (this.cameraMode === 'orbit') {
        this.controls.update();
      }
    } else {
      if (this.cameraMode === 'orbit') {
        this.controls.update();
      }
    }
    this.updateRemotePeers(dt);
    this.updateParticles(dt);

    if (this.renderer.shadowMap.enabled) {
      this.shadowFrameCounter += 1;
      const shadowMod =
        this.phase === 'title'
          ? 12
          : this.isLowEndMobile
          ? 4
          : this.isMobileDevice
          ? 3
          : 2;
      if (this.shadowFrameCounter % shadowMod === 0) {
        const heroMoved =
          Math.abs(this.heroPos.x - this.lastShadowHeroX) > 0.42 ||
          Math.abs(this.heroPos.z - this.lastShadowHeroZ) > 0.42;
        const sunMoved =
          Math.abs(this.sunLight.position.x - this.lastShadowSunX) > 0.95 ||
          Math.abs(this.sunLight.position.y - this.lastShadowSunY) > 0.95;
        const modeChanged = this.worldMode !== this.lastShadowMode;
        const timeRefresh =
          now - this.lastShadowUpdateMs >
          (this.phase === 'title' ? 3200 : this.isLowEndMobile ? 1250 : 900);
        if (heroMoved || sunMoved || modeChanged || timeRefresh) {
          this.renderer.shadowMap.needsUpdate = true;
          this.lastShadowHeroX = this.heroPos.x;
          this.lastShadowHeroZ = this.heroPos.z;
          this.lastShadowSunX = this.sunLight.position.x;
          this.lastShadowSunY = this.sunLight.position.y;
          this.lastShadowMode = this.worldMode;
          this.lastShadowUpdateMs = now;
        }
      }
    }

    const applyCamShake = this.phase === 'playing' && this.cameraShakeTimer > 0;
    let shakeOffX = 0;
    let shakeOffY = 0;
    let shakeOffZ = 0;
    if (applyCamShake) {
      const shakeT = this.cameraShakeTimer / 0.34;
      const modeScale = this.cameraMode === 'first_person' ? 0.42 : 1.0;
      const amp = this.cameraShakeStrength * shakeT * shakeT * modeScale;
      shakeOffX = Math.sin(this.elapsed * 58) * amp;
      shakeOffY = Math.cos(this.elapsed * 73) * amp * 0.72;
      shakeOffZ = Math.sin(this.elapsed * 49 + 1.3) * amp;
      this.camera.position.x += shakeOffX;
      this.camera.position.y += shakeOffY;
      this.camera.position.z += shakeOffZ;
    }
    this.renderer.render(this.scene, this.camera);
    if (applyCamShake) {
      this.camera.position.x -= shakeOffX;
      this.camera.position.y -= shakeOffY;
      this.camera.position.z -= shakeOffZ;
    }
    const workMs = performance.now() - now;
    this.emaFrameWorkMs = this.emaFrameWorkMs * 0.9 + workMs * 0.1;

    // Adaptive resolution scaling on mobile Full mode: keep sharp DPR by default, step down only under sustained load
    if (this.isMobileDevice && this.phase === 'playing' && this.settings.fxLevel === 'full') {
      const minDprScale = this.worldMode === 'ocean' ? 0.72 : 0.85;
      if (workMs > 13.5) {
        this.slowFrameStreak += 1;
        this.fastFrameStreak = 0;
        if (this.slowFrameStreak >= 45 && this.activeDprScale > minDprScale) {
          this.activeDprScale = Math.max(minDprScale, this.activeDprScale - 0.08);
          this.slowFrameStreak = 0;
          this.applyEffectivePixelRatio();
        }
      } else if (workMs < 7.5) {
        this.fastFrameStreak += 1;
        this.slowFrameStreak = 0;
        if (this.fastFrameStreak >= 90 && this.activeDprScale < 1.0) {
          this.activeDprScale = Math.min(1.0, this.activeDprScale + 0.05);
          this.fastFrameStreak = 0;
          this.applyEffectivePixelRatio();
        }
      } else {
        this.slowFrameStreak = Math.max(0, this.slowFrameStreak - 1);
      }
    }

    const hudMinMs = this.isLowEndMobile ? 250 : this.isMobileDevice ? 200 : 140;
    if (now - this.lastHudPushMs > hudMinMs) {
      this.pushHud(false);
    }
    this.scheduleNextTick();
  };

  private updateHarvestDialogueCamera(
    heroX: number,
    heroY: number,
    heroZ: number,
    partnerX: number,
    partnerY: number,
    partnerZ: number,
    dt: number,
  ): void {
    const dx = heroX - partnerX;
    const dz = heroZ - partnerZ;
    const dist = Math.hypot(dx, dz) || 1;
    const toHeroX = dx / dist;
    const toHeroZ = dz / dist;
    const perpX = -toHeroZ;
    const perpZ = toHeroX;

    const midX = (heroX + partnerX) * 0.5;
    const midY = (heroY + partnerY) * 0.5;
    const midZ = (heroZ + partnerZ) * 0.5;

    // Shift look-at slightly toward hero/lower Y so both 3D figures sit cleanly in the upper-middle above the bottom dialogue box
    const tx = midX + toHeroX * 0.92;
    const ty = midY + 0.16;
    const tz = midZ + toHeroZ * 0.92;

    const offX = toHeroX * 4.55 + perpX * 0.55;
    const offY = 4.95;
    const offZ = toHeroZ * 4.55 + perpZ * 0.55;
    const desiredDist = Math.hypot(offX, offY, offZ);
    const dirX = offX / desiredDist;
    const dirY = offY / desiredDist;
    const dirZ = offZ / desiredDist;
    const safeDist = this.computeSpringArmDist(tx, ty, tz, dirX, dirY, dirZ, desiredDist);

    _v1.set(tx + dirX * safeDist, ty + dirY * safeDist, tz + dirZ * safeDist);
    _v2.set(tx, ty, tz);
    const k = 1 - Math.exp(-5.4 * dt);
    this.camera.position.lerp(_v1, k);
    this.controls.target.lerp(_v2, k);
  }

  private createSpreadingWorldMist(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 128, 128);
      const puffs: Array<[number, number, number, number]> = [
        [64, 64, 58, 0.52],
        [46, 56, 40, 0.34],
        [82, 58, 38, 0.32],
        [62, 80, 36, 0.28],
      ];
      for (const [cx, cy, r, a] of puffs) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(255,255,255,${a})`);
        g.addColorStop(0.5, `rgba(241,245,249,${a * 0.48})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const mistTex = new THREE.CanvasTexture(canvas);
    mistTex.colorSpace = THREE.SRGBColorSpace;

    // Crossed 3-plane soft cloud cluster so fog wisps read smoothly from every angle without hard edges
    const posArr: number[] = [];
    const uvArr: number[] = [];
    const idxArr: number[] = [];
    const pushQuad = (
      x0: number,
      y0: number,
      z0: number,
      x1: number,
      y1: number,
      z1: number,
      x2: number,
      y2: number,
      z2: number,
      x3: number,
      y3: number,
      z3: number,
    ) => {
      const base = posArr.length / 3;
      posArr.push(x0, y0, z0, x1, y1, z1, x2, y2, z2, x3, y3, z3);
      uvArr.push(0, 0, 1, 0, 1, 1, 0, 1);
      idxArr.push(base, base + 1, base + 2, base, base + 2, base + 3);
    };
    pushQuad(-0.5, 0.14, -0.5, 0.5, 0.14, -0.5, 0.5, 0.14, 0.5, -0.5, 0.14, 0.5);
    for (const ang of [0, Math.PI / 3, -Math.PI / 3]) {
      const c = Math.cos(ang) * 0.5;
      const s = Math.sin(ang) * 0.5;
      pushQuad(-c, -0.1, -s, c, -0.1, s, c, 0.45, s, -c, 0.45, -s);
    }
    const mistGeo = new THREE.BufferGeometry();
    mistGeo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
    mistGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));
    mistGeo.setIndex(idxArr);
    mistGeo.computeVertexNormals();

    this.worldMistMat = new THREE.MeshBasicMaterial({
      map: mistTex,
      color: 0xdbeafe,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const seeds: typeof this.worldMistSeeds = [];
    const addSeed = (wx: number, wy: number, wz: number, sx: number, sy: number, sz: number, idx: number) => {
      seeds.push({
        baseX: wx,
        baseY: wy,
        baseZ: wz,
        sx,
        sy,
        sz,
        driftX: 1.6 + (idx % 4) * 0.65,
        driftZ: 1.2 + ((idx + 2) % 4) * 0.55,
        phase: idx * 0.73,
        rotY: (idx * 1.17) % (Math.PI * 2),
      });
    };

    let seedIdx = 0;
    for (const disk of ISLAND_DISKS) {
      const count = disk.id === 'desa_sapaan' ? 18 : 11;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (seedIdx % 5) * 0.21;
        const rRatio = disk.id === 'desa_sapaan' ? 0.14 + ((i * 7) % 10) * 0.082 : 0.18 + ((i * 5) % 10) * 0.08;
        const rad = disk.radius * rRatio;
        const wx = disk.cx + Math.cos(angle) * rad;
        const wz = disk.cz + Math.sin(angle) * rad;
        const gy = Math.max(0.2, getArchipelagoGroundY(wx, wz));
        const scaleW = 14.0 + (seedIdx % 5) * 3.4;
        const scaleH = 4.2 + (seedIdx % 3) * 1.1;
        addSeed(wx, gy + 0.35 + (seedIdx % 3) * 0.45, wz, scaleW, scaleH, scaleW * 0.92, seedIdx);
        seedIdx++;
      }
    }

    for (const br of BRIDGE_SPANS) {
      for (const u of [0.22, 0.52, 0.82]) {
        const wx = THREE.MathUtils.lerp(br.ax, br.bx, u);
        const wz = THREE.MathUtils.lerp(br.az, br.bz, u);
        const wy = THREE.MathUtils.lerp(br.ay, br.by, u) + 0.6;
        addSeed(wx, wy, wz, 15.5, 4.4, 15.5, seedIdx);
        seedIdx++;
      }
    }

    const mesh = new THREE.InstancedMesh(mistGeo, this.worldMistMat, seeds.length);
    mesh.userData.isMapHidden = true;
    mesh.frustumCulled = false;
    mesh.renderOrder = 4;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      _cloudPos.set(s.baseX, s.baseY, s.baseZ);
      _cloudQuat.setFromAxisAngle(_v3.set(0, 1, 0), s.rotY);
      _cloudScale.set(s.sx, s.sy, s.sz);
      _cloudMat.compose(_cloudPos, _cloudQuat, _cloudScale);
      mesh.setMatrixAt(i, _cloudMat);
    }
    mesh.instanceMatrix.needsUpdate = true;
    this.worldMistSeeds = seeds;
    this.worldMistMesh = mesh;
    this.overworldGroup.add(mesh);
  }

  private animateHeroConversation(heroSpeaking: boolean, dt: number): void {
    const hBlink = computeBlinkScale(this.elapsed, 0.25);
    this.hero.leftEye.scale.y = hBlink;
    this.hero.rightEye.scale.y = hBlink;
    const breathSy = 1 + Math.sin(this.elapsed * 2.8) * 0.032;
    const breathSxz = 1 / Math.sqrt(breathSy);
    this.hero.body.scale.set(breathSxz, breathSy, breathSxz);

    const targetBodyY = heroSpeaking
      ? Math.abs(Math.sin(this.elapsed * 3.6)) * 0.045
      : Math.abs(Math.sin(this.elapsed * 2.2)) * 0.02;
    const talkBeat = Math.sin(this.elapsed * 7.2);
    const talkAlt = Math.cos(this.elapsed * 5.4);
    const listenSway = Math.sin(this.elapsed * 2.2);
    const nod = Math.max(0, Math.sin(this.elapsed * 3.1)) * 0.09;

    const tUpperX = heroSpeaking ? 0.08 + Math.sin(this.elapsed * 4.4) * 0.06 : 0.04 + nod * 0.45;
    const tUpperY = heroSpeaking ? talkAlt * 0.14 : listenSway * 0.07;
    const tHeadX = heroSpeaking ? -0.14 + talkBeat * 0.09 : -0.18 + nod;
    const tHeadY = heroSpeaking
      ? Math.sin(this.elapsed * 2.7) * 0.12
      : Math.sin(this.elapsed * 1.4) * 0.08;
    const tHeadZ = heroSpeaking ? Math.cos(this.elapsed * 3.1) * 0.06 : listenSway * 0.04;
    const tRightArmX = heroSpeaking
      ? -0.82 + talkBeat * 0.34
      : -0.24 + Math.sin(this.elapsed * 2.5) * 0.1;
    const tRightArmZ = heroSpeaking
      ? -0.32 - Math.abs(talkAlt) * 0.24
      : -0.18 - Math.abs(listenSway) * 0.08;
    const tLeftArmX = heroSpeaking
      ? -0.45 - talkAlt * 0.28
      : -0.2 + Math.cos(this.elapsed * 2.1) * 0.09;
    const tLeftArmZ = heroSpeaking
      ? 0.24 + Math.abs(talkBeat) * 0.18
      : 0.16 + Math.abs(listenSway) * 0.06;
    const tLeftLegX = heroSpeaking
      ? 0.08 + Math.sin(this.elapsed * 2.8) * 0.05
      : 0.05 + listenSway * 0.035;
    const tRightLegX = heroSpeaking
      ? -0.08 - Math.sin(this.elapsed * 2.8) * 0.05
      : -0.05 - listenSway * 0.035;

    this.hero.body.position.y = THREE.MathUtils.damp(this.hero.body.position.y, targetBodyY, 12, dt);
    this.hero.upperBody.rotation.x = THREE.MathUtils.damp(this.hero.upperBody.rotation.x, tUpperX, 11, dt);
    this.hero.upperBody.rotation.y = THREE.MathUtils.damp(this.hero.upperBody.rotation.y, tUpperY, 11, dt);
    this.hero.headGroup.rotation.x = THREE.MathUtils.damp(this.hero.headGroup.rotation.x, tHeadX, 12, dt);
    this.hero.headGroup.rotation.y = THREE.MathUtils.damp(this.hero.headGroup.rotation.y, tHeadY, 12, dt);
    this.hero.headGroup.rotation.z = THREE.MathUtils.damp(this.hero.headGroup.rotation.z, tHeadZ, 12, dt);
    this.hero.rightArm.rotation.x = THREE.MathUtils.damp(this.hero.rightArm.rotation.x, tRightArmX, 12, dt);
    this.hero.rightArm.rotation.z = THREE.MathUtils.damp(this.hero.rightArm.rotation.z, tRightArmZ, 12, dt);
    this.hero.leftArm.rotation.x = THREE.MathUtils.damp(this.hero.leftArm.rotation.x, tLeftArmX, 12, dt);
    this.hero.leftArm.rotation.z = THREE.MathUtils.damp(this.hero.leftArm.rotation.z, tLeftArmZ, 12, dt);
    this.hero.leftLeg.rotation.x = THREE.MathUtils.damp(this.hero.leftLeg.rotation.x, tLeftLegX, 10, dt);
    this.hero.rightLeg.rotation.x = THREE.MathUtils.damp(this.hero.rightLeg.rotation.x, tRightLegX, 10, dt);
  }

  private updateSideAngleDialogueCamera(
    heroX: number,
    heroY: number,
    heroZ: number,
    partnerX: number,
    partnerY: number,
    partnerZ: number,
    dt: number,
  ): void {
    const dx = partnerX - heroX;
    const dz = partnerZ - heroZ;
    const dist = Math.hypot(dx, dz) || 1;
    const toPartnerX = dx / dist;
    const toPartnerZ = dz / dist;
    const sideX = -toPartnerZ;
    const sideZ = toPartnerX;
    const midX = (heroX + partnerX) * 0.5;
    const midZ = (heroZ + partnerZ) * 0.5;

    const lookX = midX;
    const lookY = Math.min(heroY, partnerY) + 1.05;
    const lookZ = midZ;

    const offY = 1.9;
    const posOffX = sideX * 5.6 - toPartnerX * 0.6;
    const posOffZ = sideZ * 5.6 - toPartnerZ * 0.6;
    const negOffX = -sideX * 5.6 - toPartnerX * 0.6;
    const negOffZ = -sideZ * 5.6 - toPartnerZ * 0.6;
    const desiredDist = Math.hypot(posOffX, offY, posOffZ);

    const safePos = this.computeSpringArmDist(
      lookX,
      lookY,
      lookZ,
      posOffX / desiredDist,
      offY / desiredDist,
      posOffZ / desiredDist,
      desiredDist,
    );
    const safeNeg = this.computeSpringArmDist(
      lookX,
      lookY,
      lookZ,
      negOffX / desiredDist,
      offY / desiredDist,
      negOffZ / desiredDist,
      desiredDist,
    );
    const usePosSide = safePos >= safeNeg - 0.15;
    const offX = usePosSide ? posOffX : negOffX;
    const offZ = usePosSide ? posOffZ : negOffZ;
    const safeDist = usePosSide ? safePos : safeNeg;

    _v1.set(
      lookX + (offX / desiredDist) * safeDist,
      lookY + (offY / desiredDist) * safeDist,
      lookZ + (offZ / desiredDist) * safeDist,
    );
    _v2.set(lookX, lookY, lookZ);
    const camLerp = 1 - Math.exp(-5.0 * dt);
    this.camera.position.lerp(_v1, camLerp);
    this.controls.target.lerp(_v2, camLerp);
  }

  private updateDialogueCamera(dt: number): void {
    const npc = this.dialogueTargetNpcId ? this.npcs.get(this.dialogueTargetNpcId) : null;
    if (!npc) return;

    const npcGroundY = getArchipelagoGroundY(npc.x, npc.z);
    npc.poseMode = 'stand';
    npc.yaw = Math.atan2(this.heroPos.x - npc.x, this.heroPos.z - npc.z);
    npc.mesh.rotation.y = npc.yaw;

    this.heroYaw = Math.atan2(npc.x - this.heroPos.x, npc.z - this.heroPos.z);
    this.hero.body.rotation.y = this.heroYaw;
    this.hero.root.position.copy(this.heroPos);
    this.animateHeroConversation(false, dt);

    // Sudut pandang kamera 3/4 samping yang sama persis seperti saat bercakap dengan Burung Hantu
    this.updateSideAngleDialogueCamera(
      this.heroPos.x,
      this.heroPos.y,
      this.heroPos.z,
      npc.x,
      npcGroundY,
      npc.z,
      dt,
    );
  }

  private updatePrologueAnimations(dt: number): void {
    const rig = this.prologueRig;
    if (!rig || !this.storyDialog || this.storyDialog.kind !== 'prologue') return;

    const step = this.storyDialog.step;
    const t = this.storyTimer;
    const camLerp = 1 - Math.exp(-3.4 * dt);

    // Subtle King breathing helper
    const animateKing = (waving: boolean, distressed: boolean, walking: boolean) => {
      const k = rig.king;
      if (walking) {
        const stride = this.elapsed * 7.2;
        const swing = Math.sin(stride) * 0.48;
        k.leftLeg.rotation.x = swing;
        k.rightLeg.rotation.x = -swing;
        k.leftArm.rotation.x = -swing * 0.55;
        k.rightArm.rotation.x = swing * 0.35;
        k.body.position.y = Math.abs(Math.sin(stride)) * 0.08;
        k.headGroup.rotation.y = Math.sin(this.elapsed * 2.2) * 0.14;
      } else if (distressed) {
        k.leftLeg.rotation.x = 0.08;
        k.rightLeg.rotation.x = -0.08;
        k.body.position.y = Math.abs(Math.sin(this.elapsed * 5.2)) * 0.05;
        k.upperBody.rotation.x = -0.08 + Math.sin(this.elapsed * 6.0) * 0.06;
        k.leftArm.rotation.x = -1.65 + Math.sin(this.elapsed * 7.5) * 0.35;
        k.leftArm.rotation.z = 0.48;
        k.rightArm.rotation.x = -1.35 + Math.cos(this.elapsed * 6.8) * 0.3;
        k.rightArm.rotation.z = -0.4;
        k.headGroup.rotation.y = Math.sin(this.elapsed * 5.0) * 0.32;
      } else if (waving) {
        k.leftLeg.rotation.x = 0;
        k.rightLeg.rotation.x = 0;
        k.body.position.y = Math.sin(this.elapsed * 2.4) * 0.03;
        k.upperBody.rotation.x = 0.04;
        k.leftArm.rotation.x = -2.2 + Math.sin(this.elapsed * 5.5) * 0.36;
        k.leftArm.rotation.z = 0.32 + Math.cos(this.elapsed * 5.5) * 0.14;
        k.rightArm.rotation.x = -0.35 + Math.sin(this.elapsed * 2.2) * 0.08;
        k.rightArm.rotation.z = -0.16;
        k.headGroup.rotation.y = Math.sin(this.elapsed * 1.6) * 0.18;
      }
    };

    if (step === 0) {
      // Adegan 1 (4-Shot Film):
      // 1) Aerial sweep of 6 lush green islands & glowing golden bridges
      // 2) Hub terrace with wise Raja Aksara greeting happy royal citizens
      // 3) Desa Sapaan square with chatting, strolling & dancing/singing villagers
      // 4) Hoot & little sister Lila (pink dress + red ribbon) walking joyfully & waving
      rig.bridgeBeams.forEach((bm, i) => {
        const mat = bm.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.25 + Math.sin(this.elapsed * 2.6 + i * 0.9) * 0.12;
        bm.rotation.y += dt * 0.7;
      });
      rig.bridgeLightOrbs.forEach((o) => {
        const u = (this.elapsed * o.speed + o.offset) % 1;
        const arc = Math.sin(u * Math.PI) * o.arch;
        const ox = THREE.MathUtils.lerp(o.ax, o.bx, u);
        const oz = THREE.MathUtils.lerp(o.az, o.bz, u);
        const oy = THREE.MathUtils.lerp(o.ay, o.by, u) + arc + 0.95 + Math.sin(this.elapsed * 5 + o.offset * 6) * 0.18;
        o.mesh.position.set(ox, oy, oz);
        o.mesh.rotation.y += dt * 3.0;
        const s = 0.8 + Math.sin(u * Math.PI) * 0.45;
        o.mesh.scale.setScalar(s);
      });

      animateKing(true, false, false);
      rig.royalCrowd.forEach((rc, i) => {
        animateZoneNpc(rc.mesh, this.elapsed, rc.phase, true, dt, 'stand');
        rc.mesh.position.y = getArchipelagoGroundY(rc.baseX, rc.baseZ) + Math.abs(Math.sin(this.elapsed * 3.6 + i * 0.9)) * 0.08;
        rc.mesh.rotation.y = rc.yaw + Math.sin(this.elapsed * 1.8 + i) * 0.14;
      });

      rig.villagers.forEach((v, i) => {
        if (v.role === 'stroll' && v.walkA && v.walkB) {
          const ping = (Math.sin(this.elapsed * 0.48 + v.phase) + 1) * 0.5;
          const dir = Math.cos(this.elapsed * 0.48 + v.phase) >= 0 ? 1 : -1;
          const px = THREE.MathUtils.lerp(v.walkA.x, v.walkB.x, ping);
          const pz = THREE.MathUtils.lerp(v.walkA.z, v.walkB.z, ping);
          v.x = px;
          v.z = pz;
          v.mesh.position.set(px, getArchipelagoGroundY(px, pz), pz);
          v.mesh.rotation.y = Math.atan2(
            (v.walkB.x - v.walkA.x) * dir,
            (v.walkB.z - v.walkA.z) * dir,
          );
          animateZoneNpc(v.mesh, this.elapsed * 0.95, v.phase, false, dt, 'walk');
        } else if (v.role === 'dance' && v.center && v.orbitR) {
          const ang = this.elapsed * 1.15 + v.phase;
          const dx = v.center.x + Math.cos(ang) * v.orbitR;
          const dz = v.center.z + Math.sin(ang) * v.orbitR;
          const hop = Math.abs(Math.sin(this.elapsed * 6.4 + v.phase)) * 0.18;
          v.x = dx;
          v.z = dz;
          v.mesh.position.set(dx, getArchipelagoGroundY(dx, dz) + hop, dz);
          v.mesh.rotation.y = Math.atan2(-Math.sin(ang), Math.cos(ang));
          animateZoneNpc(v.mesh, this.elapsed * 1.1, v.phase, true, dt, 'walk');
        } else {
          animateZoneNpc(v.mesh, this.elapsed, v.phase, true, dt, 'stand');
          v.mesh.rotation.y = v.yaw + Math.sin(this.elapsed * 2.1 + i * 1.1) * 0.22;
        }
      });

      // Hoot & Lila walking joyfully side-by-side across Desa Sapaan square, then chatting & waving
      const walkStart = 11.4;
      const walkEnd = 15.2;
      const wp = THREE.MathUtils.clamp((t - walkStart) / (walkEnd - walkStart), 0, 1);
      const easeW = wp < 1 ? 1 - Math.pow(1 - wp, 2) : 1;
      const hX = THREE.MathUtils.lerp(-11.8, -5.8, easeW);
      const hZ = THREE.MathUtils.lerp(120.8, 124.4, easeW);
      const lX = hX + 1.48;
      const lZ = hZ + 0.36;
      const walkYaw = Math.atan2(-5.8 - -11.8, 124.4 - 120.8);

      this.heroPos.set(hX, getArchipelagoGroundY(hX, hZ), hZ);
      this.hero.root.position.copy(this.heroPos);
      rig.lilaMesh.position.set(lX, getArchipelagoGroundY(lX, lZ), lZ);

      const hBlink = computeBlinkScale(this.elapsed, 0.25);
      this.hero.leftEye.scale.y = hBlink;
      this.hero.rightEye.scale.y = hBlink;

      if (wp > 0 && wp < 1) {
        const stride = this.elapsed * 8.4;
        const swing = Math.sin(stride) * 0.52;
        this.heroYaw = walkYaw;
        this.hero.body.rotation.y = this.heroYaw;
        this.hero.body.position.y = Math.abs(Math.sin(stride)) * 0.09;
        this.hero.leftLeg.rotation.x = swing;
        this.hero.rightLeg.rotation.x = -swing;
        this.hero.leftArm.rotation.x = -swing * 0.65;
        this.hero.rightArm.rotation.x = swing * 0.65;
        this.hero.headGroup.rotation.y = Math.sin(this.elapsed * 2.5) * 0.22;

        rig.lilaMesh.rotation.y = walkYaw;
        rig.lilaMesh.position.y = getArchipelagoGroundY(lX, lZ) + Math.abs(Math.sin(stride + 0.6)) * 0.14;
        animateCaptiveMesh(rig.lilaMesh, this.elapsed * 1.15, true);
      } else {
        const chatFace = wp >= 1 ? Math.atan2(lX - hX, lZ - hZ) * 0.55 + 0.35 : walkYaw;
        this.heroYaw = chatFace;
        this.hero.body.rotation.y = THREE.MathUtils.damp(this.hero.body.rotation.y, chatFace, 8, dt);
        this.hero.body.position.y = Math.sin(this.elapsed * 3.0) * 0.03;
        this.hero.leftLeg.rotation.x = THREE.MathUtils.damp(this.hero.leftLeg.rotation.x, 0, 10, dt);
        this.hero.rightLeg.rotation.x = THREE.MathUtils.damp(this.hero.rightLeg.rotation.x, 0, 10, dt);
        this.hero.leftArm.rotation.x = -0.35 + Math.sin(this.elapsed * 2.8) * 0.16;
        this.hero.rightArm.rotation.x = -2.0 + Math.sin(this.elapsed * 5.2) * 0.32;
        this.hero.rightArm.rotation.z = -0.25;
        this.hero.headGroup.rotation.y = Math.sin(this.elapsed * 2.2) * 0.16;

        rig.lilaMesh.rotation.y = wp >= 1 ? Math.atan2(hX - lX, hZ - lZ) * 0.55 - 0.3 : walkYaw;
        rig.lilaMesh.position.y = getArchipelagoGroundY(lX, lZ) + Math.abs(Math.sin(this.elapsed * 4.5)) * 0.1;
        animateCaptiveMesh(rig.lilaMesh, this.elapsed, true);
      }

      // 4-shot cinematic camera sequence across Adegan 1
      if (t < 4.2) {
        // Shot 1: Sweeping aerial flight over the 6 peaceful green islands & bridges of light
        const p = t / 4.2;
        const ang = THREE.MathUtils.lerp(2.25, 0.85, p);
        _v1.set(Math.cos(ang) * 108, THREE.MathUtils.lerp(74, 48, p), Math.sin(ang) * 108);
        _v2.set(0, 8, -10);
      } else if (t < 8.2) {
        // Shot 2: Swoop smoothly to Central Hub terrace framing crowned Raja Aksara & royal citizens
        const p = (t - 4.2) / 4.0;
        const ease = p * p * (3 - 2 * p);
        _v1.set(
          THREE.MathUtils.lerp(-1.2, -10.8, ease),
          THREE.MathUtils.lerp(14.5, 9.6, ease),
          THREE.MathUtils.lerp(13.5, 9.2, ease),
        );
        _v2.set(-6.0, 7.6, -0.5);
      } else if (t < 12.6) {
        // Shot 3: Glide over the golden bridge into Desa Sapaan square full of joyful citizens
        const p = (t - 8.2) / 4.4;
        const ease = p * p * (3 - 2 * p);
        _v1.set(
          THREE.MathUtils.lerp(-14.5, 8.5, ease),
          THREE.MathUtils.lerp(14.0, 8.2, ease),
          THREE.MathUtils.lerp(106.0, 128.5, ease),
        );
        _v2.set(
          THREE.MathUtils.lerp(-5.0, -0.8, ease),
          3.8,
          THREE.MathUtils.lerp(117.0, 120.0, ease),
        );
      } else {
        // Shot 4: Warm medium close-up tracking Hoot & Lila (pink dress + red ribbon) together
        const p = Math.min(1, (t - 12.6) / 3.4);
        const ease = 1 - Math.pow(1 - p, 2);
        _v1.set(
          THREE.MathUtils.lerp(hX + 6.4, hX + 3.8, ease),
          THREE.MathUtils.lerp(this.heroPos.y + 4.4, this.heroPos.y + 2.75, ease),
          THREE.MathUtils.lerp(hZ + 8.5, hZ + 5.6, ease),
        );
        _v2.set(
          (hX + lX) * 0.5,
          this.heroPos.y + 1.25,
          (hZ + lZ) * 0.5,
        );
      }
      this.camera.position.lerp(_v1, camLerp);
      this.controls.target.lerp(_v2, camLerp);
      return;
    }

    if (step === 1) {
      // Adegan 2: Malam Kelam Tanpa Bulan di Istana Utara —
      // Portal langit terbuka, monster bayangan bersenjata menyerbu turun mengepung istana,
      // memecahkan Mahkota Kerajaan menjadi 6 kepingan berkilau, merampas kata Bahasa Inggris,
      // lentera istana meredup & kabut kelam turun menyelimuti langit.
      const istanaG = this.archipelagoRig.istanaRig.istanaGroup;
      istanaG.updateMatrixWorld(true);

      // Keep Raja Aksara grounded on the Istana portico
      _v3.set(-2.5, 3.5, 23.8);
      istanaG.localToWorld(_v3);
      rig.king.root.position.copy(_v3);
      rig.king.root.rotation.y = istanaG.rotation.y + 0.12;
      animateKing(false, true, false);

      // 1. Sky Storm Portal opens violently (t: 0.15s -> 1.8s)
      const portalOpen = THREE.MathUtils.clamp((t - 0.15) / 1.5, 0, 1);
      const easePortal = 1 - Math.pow(1 - portalOpen, 3);
      const portalFade = t > 8.8 ? Math.max(0.25, 1 - (t - 8.8) / 2.5) : 1;
      rig.skyPortal.group.scale.setScalar(Math.max(0.05, easePortal * (1 + Math.sin(this.elapsed * 4.5) * 0.04)));
      rig.skyPortal.ringOuter.rotation.z += dt * 2.8;
      rig.skyPortal.ringInner.rotation.z -= dt * 4.2;
      rig.skyPortal.beamMat.opacity = (0.28 + Math.sin(this.elapsed * 7.0) * 0.08) * portalOpen * portalFade;
      rig.skyPortal.bolts.forEach((b, bi) => {
        b.scale.y = 0.7 + Math.abs(Math.sin(this.elapsed * 12 + bi * 1.4)) * 0.65;
      });
      if (!rig.raidPortalSoundFired && t >= 0.3) {
        rig.raidPortalSoundFired = true;
        soundEngine.playMonster();
      }

      // 2. Armed Shadow Monster Horde dives from Sky Portal & besieges Istana Utara
      const camLocal = istanaG.worldToLocal(_v3.copy(this.camera.position));
      rig.raiders.forEach((rd) => {
        if (t < rd.spawnDelay) {
          rd.mesh.visible = false;
          return;
        }
        rd.mesh.visible = true;
        const flyTime = rd.isFlier ? 2.1 : 1.7;
        const p = THREE.MathUtils.clamp((t - rd.spawnDelay) / flyTime, 0, 1);
        const ease = 1 - Math.pow(1 - p, 2);

        if (rd.isFlier) {
          if (p < 1) {
            rd.mesh.position.lerpVectors(rd.spawnPos, rd.raidPos, ease);
            rd.mesh.position.y += Math.sin(p * Math.PI) * 3.0;
          } else {
            const ang = (rd.orbitAngle ?? 0) + (t - rd.spawnDelay - flyTime) * 0.75;
            const rad = rd.orbitRadius ?? 15.0;
            rd.mesh.position.set(
              Math.cos(ang) * rad,
              rd.hoverY + Math.sin(this.elapsed * 2.6 + rd.phase) * 1.35,
              14.0 + Math.sin(ang) * (rad * 0.85),
            );
            rd.mesh.rotation.y = Math.atan2(-Math.sin(ang), Math.cos(ang));
          }
          animateMonsterRig(rd.mesh, {
            mode: 'patrol',
            speed: 5.5,
            elapsed: this.elapsed,
            phase: rd.phase,
            dt,
          });
        } else {
          // Ground armed raiders plunge from portal to marble steps/portico, then lead captain strikes crown
          if (p < 1) {
            rd.mesh.position.lerpVectors(rd.spawnPos, rd.raidPos, ease);
            rd.mesh.position.y += Math.sin(p * Math.PI) * 2.8;
            rd.mesh.rotation.y = Math.atan2(0 - rd.mesh.position.x, 25.0 - rd.mesh.position.z);
          } else if (rd.strikePos && t >= 3.55) {
            const strikeP = THREE.MathUtils.clamp((t - 3.55) / 0.75, 0, 1);
            rd.mesh.position.lerpVectors(rd.raidPos, rd.strikePos, strikeP);
            rd.mesh.rotation.y = Math.atan2(0 - rd.mesh.position.x, 25.2 - rd.mesh.position.z);
          } else {
            rd.mesh.position.copy(rd.raidPos);
            rd.mesh.rotation.y = Math.atan2(
              -2.5 - rd.raidPos.x,
              24.5 - rd.raidPos.z,
            );
          }
          const isStriker = Boolean(rd.strikePos && t >= 4.0 && t <= 4.75);
          animateMonsterRig(rd.mesh, {
            mode: isStriker ? 'attack' : p < 0.98 ? 'patrol' : t >= 4.35 ? 'attack' : 'windup',
            speed: p < 0.98 ? 6.5 : 0,
            elapsed: this.elapsed,
            phase: rd.phase,
            attackProgress: isStriker ? (t - 4.0) / 0.75 : (Math.sin(this.elapsed * 4 + rd.phase) + 1) * 0.5,
            dt,
          });
        }
      });

      // 3. Intact Sacred Crown shatters into 6 gleaming shards at t = 4.35s!
      const shattered = t >= 4.35;
      rig.sacredCrown.visible = !shattered;
      if (!shattered) {
        rig.sacredCrown.position.y = 2.55 + Math.sin(this.elapsed * 3.2) * 0.14;
        rig.sacredCrown.rotation.y += dt * 1.4;
      } else if (!rig.raidShatterFired) {
        rig.raidShatterFired = true;
        soundEngine.playBoom();
      }

      const shockT = THREE.MathUtils.clamp((t - 4.35) / 0.85, 0, 1);
      if (shattered && shockT < 1) {
        rig.crownShockwave.mesh.visible = true;
        rig.crownShockwave.mesh.scale.setScalar(1 + shockT * 9.5);
        rig.crownShockwave.mat.opacity = (1 - shockT) * 0.88;
      } else {
        rig.crownShockwave.mesh.visible = false;
      }

      const burstT = THREE.MathUtils.clamp((t - 4.35) / 2.8, 0, 1);
      const easeB = 1 - Math.pow(1 - burstT, 3);
      rig.crownShards.forEach((sh, i) => {
        sh.mesh.visible = shattered;
        if (shattered) {
          sh.mesh.position.lerpVectors(sh.startPos, sh.endPos, easeB);
          sh.mesh.position.y += Math.sin(burstT * Math.PI) * 8.5 + Math.sin(this.elapsed * 3.8 + i) * 0.35;
          sh.mesh.rotation.y += dt * 4.2;
          sh.mesh.rotation.x += dt * 2.1;
        }
      });

      // 4. Stolen English Word Tablets dragged upward into the dark Sky Portal!
      if (!rig.raidStealSoundFired && t >= 4.9) {
        rig.raidStealSoundFired = true;
        soundEngine.playHit();
      }
      rig.wordOrbs.forEach((w) => {
        if (w.keeper) {
          // One lone glimmering word left behind near Raja Aksara's feet
          const dropP = THREE.MathUtils.clamp((t - w.snatchStart) / 2.6, 0, 1);
          w.mesh.position.set(
            w.homePos.x,
            THREE.MathUtils.lerp(w.homePos.y, 4.35, dropP) + Math.sin(this.elapsed * 2.5 + w.phase) * 0.14,
            w.homePos.z,
          );
          w.mesh.scale.setScalar(THREE.MathUtils.lerp(1.0, 0.72, dropP));
          w.mat.opacity = THREE.MathUtils.lerp(0.95, 0.65, dropP);
        } else {
          const sp = THREE.MathUtils.clamp((t - w.snatchStart) / (w.snatchEnd - w.snatchStart), 0, 1);
          if (sp <= 0) {
            w.mesh.visible = true;
            w.mesh.position.set(
              w.homePos.x + Math.sin(this.elapsed * 1.4 + w.phase) * 0.25,
              w.homePos.y + Math.sin(this.elapsed * 2.8 + w.phase) * 0.24,
              w.homePos.z,
            );
            w.mesh.scale.setScalar(1);
            w.mat.color.setHex(0xffffff);
            w.mat.opacity = 0.96;
          } else if (sp < 1) {
            const easeS = sp * sp;
            _v3.set(Math.sin(sp * Math.PI * 3 + w.phase) * 1.8, 27.2, 31.0);
            w.mesh.position.lerpVectors(w.homePos, _v3, easeS);
            w.mesh.scale.setScalar(1 - sp * 0.72);
            w.mat.color.setHex(0xc084fc);
            w.mat.opacity = (1 - sp) * 0.95;
          } else {
            w.mesh.visible = false;
          }
        }
        w.mesh.rotation.y = Math.atan2(camLocal.x - w.mesh.position.x, camLocal.z - w.mesh.position.z);
      });

      // 5. Palace Lanterns flicker & dim under descending Dark Mist
      const dimT = THREE.MathUtils.clamp((t - 4.4) / 4.2, 0, 1);
      rig.palaceLanterns.forEach((l) => {
        const flicker = dimT > 0.05 && dimT < 0.9 ? 0.7 + Math.sin(this.elapsed * 22 + l.phase) * 0.3 : 1;
        const glow = Math.max(0.08, (1 - dimT * 0.9) * flicker);
        l.mat.emissiveIntensity = 1.9 * glow;
        l.haloMat.opacity = 0.34 * glow;
        l.halo.scale.setScalar(0.55 + glow * 0.55);
      });

      const mistT = THREE.MathUtils.clamp((t - 4.8) / 4.8, 0, 1);
      const easeM = 1 - Math.pow(1 - mistT, 2);
      rig.darkMists.forEach((dm) => {
        dm.mesh.position.lerpVectors(dm.startPos, dm.endPos, easeM);
        dm.mesh.position.x += Math.sin(this.elapsed * 0.7 + dm.phase) * 1.6;
        dm.mesh.position.z += Math.cos(this.elapsed * 0.6 + dm.phase) * 1.2;
        dm.mat.opacity = THREE.MathUtils.lerp(0.05, 0.56, easeM);
      });

      // 6. 4-Beat Dramatic Siege Camera Work across Istana Utara
      if (t < 2.8) {
        // Shot 1: Low-angle courtyard establishing shot up toward the Sky Portal & Golden Dome
        const p = t / 2.8;
        const ease = p * p * (3 - 2 * p);
        _v1.set(
          THREE.MathUtils.lerp(11.5, -8.5, ease),
          THREE.MathUtils.lerp(7.5, 11.5, ease),
          THREE.MathUtils.lerp(49.0, 42.5, ease),
        );
        _v2.set(0, THREE.MathUtils.lerp(15.0, 11.0, ease), 25.0);
      } else if (t < 5.3) {
        // Shot 2: Push in dramatically on Raja Aksara, Sacred Crown Altar & shattering strike
        const p = (t - 2.8) / 2.5;
        const ease = p * p * (3 - 2 * p);
        _v1.set(
          THREE.MathUtils.lerp(-8.5, -5.8, ease),
          THREE.MathUtils.lerp(11.5, 8.2, ease),
          THREE.MathUtils.lerp(42.5, 34.8, ease),
        );
        _v2.set(0, THREE.MathUtils.lerp(8.5, 7.2, ease), 25.5);
      } else if (t < 8.4) {
        // Shot 3: Sweeping arc tracking stolen English word tablets lifted into the vortex
        const p = (t - 5.3) / 3.1;
        const ease = p * p * (3 - 2 * p);
        _v1.set(
          THREE.MathUtils.lerp(-5.8, 12.0, ease),
          THREE.MathUtils.lerp(8.2, 13.5, ease),
          THREE.MathUtils.lerp(34.8, 43.0, ease),
        );
        _v2.set(0, THREE.MathUtils.lerp(7.2, 13.5, ease), 28.5);
      } else {
        // Shot 4: Ominous pullback as dark storm mist swallows the dimmed Northern Palace
        const p = Math.min(1, (t - 8.4) / 3.0);
        const ease = 1 - Math.pow(1 - p, 2);
        _v1.set(
          THREE.MathUtils.lerp(12.0, 18.5, ease),
          THREE.MathUtils.lerp(13.5, 19.5, ease),
          THREE.MathUtils.lerp(43.0, 54.0, ease),
        );
        _v2.set(0, THREE.MathUtils.lerp(13.5, 11.0, ease), 24.0);
      }

      istanaG.localToWorld(_v1);
      istanaG.localToWorld(_v2);
      this.camera.position.lerp(_v1, camLerp);
      this.controls.target.lerp(_v2, camLerp);
      return;
    }

    if (step === 2) {
      // Adegan 3: Kesunyian & Kabut di Keenam Pulau + Monster Bos Raksasa
      rig.bosses.forEach((bs) => {
        bs.mesh.position.set(bs.pos.x, bs.pos.y + Math.sin(this.elapsed * 1.8 + bs.phase) * 0.25, bs.pos.z);
        bs.mesh.rotation.y = Math.sin(this.elapsed * 0.7 + bs.phase) * 0.65;
        animateMonsterRig(bs.mesh, {
          mode: 'patrol',
          speed: 0,
          elapsed: this.elapsed,
          phase: bs.phase,
          dt,
        });
      });

      const sweepA = 2.4 - t * 0.16;
      _v1.set(Math.cos(sweepA) * 155, 62 + Math.sin(t * 0.4) * 5, Math.sin(sweepA) * 145);
      _v2.set(Math.cos(sweepA + 0.5) * 28, 8, Math.sin(sweepA + 0.5) * 28);
      this.camera.position.lerp(_v1, camLerp);
      this.controls.target.lerp(_v2, camLerp);
      return;
    }

    if (step === 3) {
      // Adegan 4: Pelarian Raja Aksara & Lila ke Pintu Ungu, Jejak Pita Merah & Utusan Burung Hantu
      const pt = OVERWORLD_ANCHORS.portal;
      const runP = Math.min(1, t / 3.4);
      const kx = THREE.MathUtils.lerp(pt.x - 1.2, pt.x - 0.8, runP);
      const kz = THREE.MathUtils.lerp(pt.z + 25, pt.z + 4.0, runP);
      const lx = THREE.MathUtils.lerp(pt.x + 1.2, pt.x + 0.8, runP);
      const lz = THREE.MathUtils.lerp(pt.z + 26, pt.z + 5.2, runP);
      rig.king.root.position.set(kx, getArchipelagoGroundY(kx, kz), kz);
      rig.king.root.rotation.y = Math.PI;
      rig.lilaMesh.position.set(lx, getArchipelagoGroundY(lx, lz), lz);
      rig.lilaMesh.rotation.y = Math.PI;

      animateKing(false, false, runP < 0.98);
      animateCaptiveMesh(rig.lilaMesh, this.elapsed * (runP < 0.98 ? 1.4 : 0.9), false);

      // Pop Lila's dropped red ribbons along the escape trail
      rig.ribbonDrops.forEach((rb, i) => {
        if (t >= rb.dropTime) {
          rb.mesh.visible = true;
          rb.mesh.position.y = rb.pos.y + Math.sin(this.elapsed * 3.4 + i) * 0.18;
          rb.mesh.rotation.y += dt * 1.9;
        }
      });

      // Fade Raja Aksara & Lila into shelter behind the Purple Gate once inside
      if (t > 3.6) {
        const shelterFade = Math.max(0.01, 1 - (t - 3.6) / 0.85);
        rig.king.root.scale.setScalar(1.18 * shelterFade);
        rig.lilaMesh.scale.setScalar(0.86 * shelterFade);
        if (shelterFade <= 0.03) {
          rig.king.root.visible = false;
          rig.lilaMesh.visible = false;
        }
      }

      // Owl waits at the Purple Gate and ascends holding the red-sealed letter
      const owlTakeoff = THREE.MathUtils.clamp((t - 2.6) / 2.8, 0, 1);
      const flap = Math.sin(this.elapsed * 15.5) * 0.62;
      this.owlRig.leftWing.rotation.z = 0.12 + flap;
      this.owlRig.rightWing.rotation.z = -0.12 - flap;
      this.owlRig.root.position.set(
        THREE.MathUtils.lerp(pt.x + 2.2, pt.x + 12, owlTakeoff),
        THREE.MathUtils.lerp(pt.y + 3.2, pt.y + 18, owlTakeoff) + Math.sin(this.elapsed * 3.2) * 0.25,
        THREE.MathUtils.lerp(pt.z + 8.5, pt.z + 42, owlTakeoff),
      );
      this.owlRig.root.rotation.set(0.08, 0.25, Math.sin(this.elapsed * 2.5) * 0.08);

      _v1.set(pt.x - 10.5, pt.y + 7.5 + owlTakeoff * 6, THREE.MathUtils.lerp(pt.z + 29, pt.z + 18, runP));
      _v2.set(pt.x, pt.y + 2.6 + owlTakeoff * 4, THREE.MathUtils.lerp(pt.z + 15, pt.z + 5, runP));
      this.camera.position.lerp(_v1, camLerp);
      this.controls.target.lerp(_v2, camLerp);
      return;
    }

    // Adegan 5: Burung Hantu Terbang Mengitari Pulau-pulau Menembus Kabut Malam Hingga Menemukan Hoot di Desa Sapaan
    rig.bosses.forEach((bs) => {
      if (!bs.mesh.visible) return;
      bs.mesh.position.set(bs.pos.x, bs.pos.y + Math.sin(this.elapsed * 1.8 + bs.phase) * 0.22, bs.pos.z);
      bs.mesh.rotation.y = Math.sin(this.elapsed * 0.7 + bs.phase) * 0.65;
      animateMonsterRig(bs.mesh, {
        mode: 'patrol',
        speed: 0,
        elapsed: this.elapsed,
        phase: bs.phase,
        dt,
      });
    });

    rig.flightMists.forEach((fm) => {
      fm.mesh.position.set(
        fm.basePos.x + Math.sin(this.elapsed * 0.45 + fm.phase) * 2.4,
        fm.basePos.y + Math.cos(this.elapsed * 0.55 + fm.phase) * 0.65,
        fm.basePos.z + Math.cos(this.elapsed * 0.4 + fm.phase) * 2.0,
      );
    });

    const stage = this.getOpeningStageAnchors();
    const flightDuration = 13.5;
    const rawP = Math.min(1, t / flightDuration);
    const curveU = rawP < 0.85 ? rawP : 0.85 + 0.15 * Math.sin(((rawP - 0.85) / 0.15) * (Math.PI * 0.5));
    rig.owlFlightCurve.getPointAt(curveU, _v3);
    rig.owlFlightCurve.getTangentAt(curveU, _forward);

    const ox = _v3.x;
    const oy = _v3.y + Math.sin(this.elapsed * 3.4) * 0.28;
    const oz = _v3.z;
    this.owlRig.root.position.set(ox, oy, oz);

    const flightYaw = Math.atan2(_forward.x, _forward.z);
    const faceHeroYaw = Math.atan2(stage.heroX - ox, stage.heroZ - oz);
    const yawBlend = THREE.MathUtils.clamp((rawP - 0.84) / 0.16, 0, 1);
    let yawDiff = faceHeroYaw - flightYaw;
    while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
    while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
    const blendedYaw = flightYaw + yawDiff * yawBlend;

    this.owlRig.root.rotation.set(
      0.16 * (1 - yawBlend * 0.35),
      blendedYaw,
      Math.sin(this.elapsed * 2.4) * 0.14 * (1 - yawBlend * 0.6),
    );
    const flap = Math.sin(this.elapsed * 16) * 0.65;
    this.owlRig.leftWing.rotation.z = 0.14 + flap;
    this.owlRig.rightWing.rotation.z = -0.14 - flap;

    // Hoot stands alone in the lantern-lit square of Desa Sapaan, looking up once the Owl nears
    this.heroPos.set(stage.heroX, stage.heroY, stage.heroZ);
    this.hero.root.position.copy(this.heroPos);
    const spotOwlT = THREE.MathUtils.clamp((rawP - 0.72) / 0.2, 0, 1);
    const targetHeroYaw = Math.atan2(ox - stage.heroX, oz - stage.heroZ);
    this.heroYaw = targetHeroYaw;
    this.hero.body.rotation.y = this.heroYaw;
    this.hero.headGroup.rotation.x = THREE.MathUtils.lerp(-0.12, -0.36, spotOwlT) + Math.sin(this.elapsed * 2.1) * 0.05;
    this.hero.headGroup.rotation.y = (1 - spotOwlT) * Math.sin(this.elapsed * 1.3) * 0.35;
    this.hero.leftArm.rotation.x = -0.16;
    this.hero.rightArm.rotation.x = -0.22;

    if (rawP < 0.84) {
      // Dynamic chase camera trailing & banking past the Owl through misty night islands
      _right.set(-_forward.z, 0, _forward.x).normalize();
      const sideBias = Math.sin(rawP * Math.PI * 3.0) * 4.5;
      _v1.set(
        ox - _forward.x * 12.5 + _right.x * (5.2 + sideBias),
        oy + 4.8,
        oz - _forward.z * 12.5 + _right.z * (5.2 + sideBias),
      );
      _v2.set(
        ox + _forward.x * 18.0,
        Math.max(6.0, oy - 5.2),
        oz + _forward.z * 18.0,
      );
    } else {
      // Sweeping finale into Desa Sapaan framing Hoot looking up at the arriving Owl
      const finP = (rawP - 0.84) / 0.16;
      const easeFin = 1 - Math.pow(1 - finP, 2);
      _right.set(-_forward.z, 0, _forward.x).normalize();
      const startCamX = ox - _forward.x * 12.5 + _right.x * 5.2;
      const startCamY = oy + 4.8;
      const startCamZ = oz - _forward.z * 12.5 + _right.z * 5.2;
      _v1.set(
        THREE.MathUtils.lerp(startCamX, stage.heroX + 7.2, easeFin),
        THREE.MathUtils.lerp(startCamY, stage.heroY + 5.2, easeFin),
        THREE.MathUtils.lerp(startCamZ, stage.heroZ + 7.8, easeFin),
      );
      _v2.set(
        THREE.MathUtils.lerp(ox, stage.heroX, easeFin),
        THREE.MathUtils.lerp(oy - 1.5, stage.heroY + 2.4, easeFin),
        THREE.MathUtils.lerp(oz, stage.heroZ, easeFin),
      );
    }
    this.camera.position.lerp(_v1, camLerp);
    this.controls.target.lerp(_v2, camLerp);
  }

  private animateVillagerPanic(
    actor: VillagerActor,
    walkPhase: number,
    seed: number,
    fleeSpeed: number,
    inAir = false,
  ): void {
    const vBlink = computeBlinkScale(this.elapsed, seed);
    actor.leftEye.scale.y = vBlink;
    actor.rightEye.scale.y = vBlink;
    const swing = Math.sin(walkPhase) * (inAir ? 1.05 : 0.88);
    actor.leftLeg.rotation.x = swing;
    actor.rightLeg.rotation.x = -swing;
    actor.bodyPivot.position.y = inAir ? 0 : Math.abs(Math.sin(walkPhase)) * 0.12;
    actor.bodyPivot.rotation.x = inAir ? 0.32 : 0.2;
    actor.headGroup.rotation.y = Math.sin(this.elapsed * 12 + seed) * 0.5;
    actor.headGroup.rotation.x = inAir ? -0.35 : -0.06;
    actor.leftArm.rotation.x = inAir ? -2.2 + Math.sin(walkPhase) * 0.5 : -0.95 - swing * 0.65;
    actor.rightArm.rotation.x = inAir ? -2.2 - Math.sin(walkPhase) * 0.5 : -0.95 + swing * 0.65;
    actor.leftArm.rotation.z = 0.28;
    actor.rightArm.rotation.z = -0.28;
    void fleeSpeed;
  }

  private updateVillageAmbushState(dt: number): void {
    const amb = this.villageAmbushState;
    if (!amb || !amb.active) return;
    amb.timer += dt;

    // 1. Update monster terbang yang menculik 1 NPC ke langit lalu menghilang
    if (amb.abductor && amb.abductor.active) {
      const abd = amb.abductor;
      const kidnapped = amb.npcs.find((n) => n.role === 'abducted');
      const t = amb.timer;
      if (t < 1.65) {
        const p = t / 1.65;
        const ease = p * p * (3 - 2 * p);
        const startX = -2.5;
        const startY = 13.5;
        const startZ = 101.0;
        const tgtX = kidnapped ? kidnapped.x : -1.2;
        const tgtZ = kidnapped ? kidnapped.z : 117.2;
        const tgtY = getArchipelagoGroundY(tgtX, tgtZ) + 2.35;
        abd.x = THREE.MathUtils.lerp(startX, tgtX, ease);
        abd.y = THREE.MathUtils.lerp(startY, tgtY, ease);
        abd.z = THREE.MathUtils.lerp(startZ, tgtZ, ease);
        abd.yaw = Math.atan2(tgtX - startX, tgtZ - startZ);
      } else {
        const liftDt = t - 1.65;
        const climbSpeed = amb.inCutscene ? 6.2 : 11.5;
        abd.y += climbSpeed * dt;
        abd.z -= 4.2 * dt;
        abd.x -= 1.4 * dt;
        abd.yaw = Math.atan2(-1.4, -4.2);
        if (kidnapped && kidnapped.alive) {
          kidnapped.x = abd.x;
          kidnapped.z = abd.z;
          kidnapped.y = abd.y - 1.75;
          kidnapped.yaw = abd.yaw + Math.PI;
          kidnapped.actor.root.position.set(kidnapped.x, kidnapped.y, kidnapped.z);
          kidnapped.actor.root.rotation.y = kidnapped.yaw;
          kidnapped.actor.walkPhase += dt * 18;
          this.animateVillagerPanic(kidnapped.actor, kidnapped.actor.walkPhase, 1.2, 6, true);
        }
        const fadeStart = 3.6;
        if (liftDt >= fadeStart) {
          const vanishP = THREE.MathUtils.clamp((liftDt - fadeStart) / 1.4, 0, 1);
          const sc = Math.max(0.01, 1 - vanishP);
          abd.mesh.scale.setScalar(1.12 * sc);
          if (kidnapped && kidnapped.alive) {
            kidnapped.actor.root.scale.setScalar(sc);
          }
          if (vanishP >= 1) {
            abd.active = false;
            abd.mesh.visible = false;
            this.overworldGroup.remove(abd.mesh);
            if (kidnapped) {
              kidnapped.alive = false;
              kidnapped.actor.root.visible = false;
              this.overworldGroup.remove(kidnapped.actor.root);
            }
          }
        }
      }
      if (abd.active) {
        abd.mesh.position.set(abd.x, abd.y, abd.z);
        abd.mesh.rotation.y = abd.yaw;
        animateMonsterRig(abd.mesh, {
          mode: t >= 1.5 && t < 2.2 ? 'attack' : 'patrol',
          speed: 7.0,
          walkPhase: this.elapsed * 9,
          elapsed: this.elapsed,
          phase: 0.7,
          attackProgress: t >= 1.5 && t < 2.2 ? (t - 1.5) / 0.7 : 0,
          dt,
        });
      }
    }

    // 2. Update NPC yang berlari panik atau masuk ke rumah setelah diselamatkan
    const ambushMonsters = this.monsters.filter((m) => m.alive && m.isVillageAmbushTarget);
    let anySurvivorAlive = false;

    for (let i = 0; i < amb.npcs.length; i++) {
      const n = amb.npcs[i];
      if (!n.alive) continue;
      if (n.role === 'abducted' && amb.timer >= 1.65) continue;

      if (amb.stage === 'walking_home' || amb.resolved) {
        anySurvivorAlive = true;
        const [hx, hz] = n.homeDoor;
        const dx = hx - n.x;
        const dz = hz - n.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 1.45) {
          n.alive = false;
          n.sheltering = true;
          n.actor.root.visible = false;
          this.overworldGroup.remove(n.actor.root);
          continue;
        }
        const step = Math.min(dist, 4.6 * dt);
        const movePt = this._desaColScratch;
        movePt.x = n.x + (dx / dist) * step;
        movePt.z = n.z + (dz / dist) * step;
        const gy = getArchipelagoGroundY(movePt.x, movePt.z);
        resolveObstacleBoxes(movePt, 0.56, this.villageRig.obstacles, gy, 2.0);
        constrainToWalkableArchipelago(movePt, 0.56);
        n.yaw = Math.atan2(movePt.x - n.x, movePt.z - n.z);
        n.x = movePt.x;
        n.z = movePt.z;
        n.y = getArchipelagoGroundY(n.x, n.z);
        n.actor.walkPhase += dt * 11;
        n.actor.root.position.set(n.x, n.y, n.z);
        n.actor.root.rotation.y = n.yaw;
        const vBlink = computeBlinkScale(this.elapsed, i * 1.9);
        n.actor.leftEye.scale.y = vBlink;
        n.actor.rightEye.scale.y = vBlink;
        const swing = Math.sin(n.actor.walkPhase) * 0.62;
        n.actor.leftLeg.rotation.x = swing;
        n.actor.rightLeg.rotation.x = -swing;
        n.actor.leftArm.rotation.x = -swing * 0.55;
        n.actor.rightArm.rotation.x = swing * 0.55;
        n.actor.leftArm.rotation.z = 0.14;
        n.actor.rightArm.rotation.z = -0.14;
        n.actor.bodyPivot.position.y = Math.abs(Math.sin(n.actor.walkPhase)) * 0.06;
        n.actor.bodyPivot.rotation.x = 0.06;
        n.actor.headGroup.rotation.y = Math.sin(this.elapsed * 2.2 + i) * 0.12;
        continue;
      }

      if (amb.stage === 'rescue_talk') {
        anySurvivorAlive = true;
        n.y = getArchipelagoGroundY(n.x, n.z);
        n.yaw = Math.atan2(this.heroPos.x - n.x, this.heroPos.z - n.z);
        n.actor.root.position.set(n.x, n.y, n.z);
        n.actor.root.rotation.y = n.yaw;
        const vBlink = computeBlinkScale(this.elapsed, i * 2.1 + 0.4);
        n.actor.leftEye.scale.y = vBlink;
        n.actor.rightEye.scale.y = vBlink;
        const npcSpeaking = this.storyDialog?.speakerSide !== 'hero';
        const nod = Math.sin(this.elapsed * (npcSpeaking ? 6.5 : 2.6) + i * 1.4);
        n.actor.leftLeg.rotation.x = 0;
        n.actor.rightLeg.rotation.x = 0;
        n.actor.bodyPivot.position.y = npcSpeaking ? Math.abs(nod) * 0.045 : Math.sin(this.elapsed * 2.2 + i) * 0.02;
        n.actor.bodyPivot.rotation.x = npcSpeaking ? 0.06 : 0.02;
        n.actor.headGroup.rotation.x = npcSpeaking ? nod * 0.12 : Math.max(0, nod) * 0.08;
        n.actor.headGroup.rotation.y = Math.sin(this.elapsed * 2.1 + i) * 0.1;
        n.actor.leftArm.rotation.x = npcSpeaking ? -0.78 + nod * 0.28 : -0.22;
        n.actor.rightArm.rotation.x = npcSpeaking ? -0.62 - nod * 0.24 : -0.22;
        n.actor.leftArm.rotation.z = 0.24;
        n.actor.rightArm.rotation.z = -0.24;
        continue;
      }

      if (amb.stage === 'awaiting_guardian_talk') {
        anySurvivorAlive = true;
        const guardianSpot = OVERWORLD_ANCHORS.npcs.npc_tetua;
        n.y = getArchipelagoGroundY(n.x, n.z);
        n.yaw = Math.atan2(guardianSpot.x - n.x, guardianSpot.z - n.z);
        n.actor.root.position.set(n.x, n.y, n.z);
        n.actor.root.rotation.y = n.yaw;
        const vBlink = computeBlinkScale(this.elapsed, i * 2.1 + 0.4);
        n.actor.leftEye.scale.y = vBlink;
        n.actor.rightEye.scale.y = vBlink;
        n.actor.leftLeg.rotation.x = 0;
        n.actor.rightLeg.rotation.x = 0;
        n.actor.bodyPivot.position.y = Math.abs(Math.sin(this.elapsed * 3.0 + i)) * 0.03;
        n.actor.bodyPivot.rotation.x = 0.04;
        n.actor.headGroup.rotation.y = Math.sin(this.elapsed * 2.4 + i) * 0.16;
        n.actor.headGroup.rotation.x = -0.05;
        n.actor.rightArm.rotation.x = -1.25 + Math.sin(this.elapsed * 4.5 + i) * 0.22;
        n.actor.leftArm.rotation.x = -0.26;
        n.actor.leftArm.rotation.z = 0.18;
        n.actor.rightArm.rotation.z = -0.22;
        continue;
      }

      if (amb.stage === 'escort') {
        anySurvivorAlive = true;
        continue;
      }

      anySurvivorAlive = true;
      if (amb.inCutscene) {
        const p = this.elapsed * (n.role === 'abducted' ? 1.1 : 1.35) + n.orbitPhase;
        const radX = n.role === 'abducted' ? 1.45 : 3.2;
        const radZ = n.role === 'abducted' ? 1.25 : 2.6;
        const tx = n.loopCenter[0] + Math.cos(p) * radX;
        const tz = n.loopCenter[1] + Math.sin(p) * radZ;
        const dx = tx - n.x;
        const dz = tz - n.z;
        const dist = Math.hypot(dx, dz) || 1;
        const step = Math.min(dist, n.speed * dt);
        n.x += (dx / dist) * step;
        n.z += (dz / dist) * step;
        n.y = getArchipelagoGroundY(n.x, n.z);
        n.yaw = Math.atan2(dx, dz);
      } else {
        // Saat mode main aktif, 2 NPC selamat terus berlari menghindar monster pengejar di alun-alun
        let threatX = n.loopCenter[0];
        let threatZ = n.loopCenter[1];
        let bestD = Infinity;
        for (const m of ambushMonsters) {
          const d = Math.hypot(m.x - n.x, m.z - n.z);
          if (d < bestD) {
            bestD = d;
            threatX = m.x;
            threatZ = m.z;
          }
        }
        const awayX = n.x - threatX;
        const awayZ = n.z - threatZ;
        const awayLen = Math.hypot(awayX, awayZ) || 1;
        const toCenterX = n.loopCenter[0] - n.x;
        const toCenterZ = n.loopCenter[1] - n.z;
        const tangX = Math.cos(this.elapsed * 1.4 + n.orbitPhase) * 0.7;
        const tangZ = Math.sin(this.elapsed * 1.4 + n.orbitPhase) * 0.7;
        let dirX = (bestD < 12 ? awayX / awayLen : 0) + toCenterX * 0.28 + tangX;
        let dirZ = (bestD < 12 ? awayZ / awayLen : 0) + toCenterZ * 0.28 + tangZ;
        const dLen = Math.hypot(dirX, dirZ) || 1;
        dirX /= dLen;
        dirZ /= dLen;
        _moveScratchOrClamp: {
          const clampPt = this._desaColScratch;
          clampPt.x = THREE.MathUtils.clamp(n.x + dirX * n.speed * dt, -10.5, 9.5);
          clampPt.z = THREE.MathUtils.clamp(n.z + dirZ * n.speed * dt, 108.5, 123.5);
          const gy = getArchipelagoGroundY(clampPt.x, clampPt.z);
          resolveObstacleBoxes(clampPt, 0.56, this.villageRig.obstacles, gy, 2.0);
          constrainToWalkableArchipelago(clampPt, 0.56);
          n.yaw = Math.atan2(clampPt.x - n.x, clampPt.z - n.z);
          n.x = clampPt.x;
          n.z = clampPt.z;
          n.y = getArchipelagoGroundY(n.x, n.z);
          break _moveScratchOrClamp;
        }
      }

      n.actor.walkPhase += dt * (10.5 + n.speed);
      n.actor.root.position.set(n.x, n.y, n.z);
      n.actor.root.rotation.y = n.yaw;
      this.animateVillagerPanic(n.actor, n.actor.walkPhase, i * 2.3 + 0.5, n.speed, false);
    }

    // 3. Animasi monster penyerang saat masih dalam adegan cutscene (sebelum tombol Mulai Main ditekan)
    if (amb.inCutscene) {
      for (let i = 0; i < amb.cutsceneMonsters.length; i++) {
        const cm = amb.cutsceneMonsters[i];
        const target = amb.npcs[cm.targetNpcIdx] ?? amb.npcs[1];
        if (!target) continue;
        const spec = MONSTER_SPECS[cm.type];
        const dx = target.x - cm.x;
        const dz = target.z - cm.z;
        const dist = Math.hypot(dx, dz) || 1;
        if (dist > 1.35) {
          const spd = 4.6 * spec.speedMult * dt;
          cm.x += (dx / dist) * Math.min(dist - 1.1, spd);
          cm.z += (dz / dist) * Math.min(dist - 1.1, spd);
        }
        cm.y = getArchipelagoGroundY(cm.x, cm.z) + spec.hoverY;
        cm.yaw = Math.atan2(dx, dz);
        cm.mesh.position.set(cm.x, cm.y, cm.z);
        cm.mesh.rotation.y = cm.yaw;
        const atkCycle = (this.elapsed * 1.45 + cm.patrolPhase) % 1;
        const attacking = dist < 2.6 && atkCycle > 0.65;
        animateMonsterRig(cm.mesh, {
          mode: attacking ? 'attack' : 'patrol',
          speed: 4.6,
          walkPhase: this.elapsed * 8 + cm.patrolPhase,
          elapsed: this.elapsed,
          phase: cm.patrolPhase,
          attackProgress: attacking ? (atkCycle - 0.65) / 0.35 : 0,
          dt,
        });
      }
    }

    if (amb.resolved && !anySurvivorAlive && (!amb.abductor || !amb.abductor.active)) {
      amb.active = false;
      this.villageAmbushState = null;
    }
  }

  private updateStoryAnimations(dt: number): void {
    this.storyTimer += dt;

    if (this.storyDialog?.kind === 'prologue') {
      this.updatePrologueAnimations(dt);
      return;
    }

    if (this.owlState === 'leave_to_ambush' && this.storyDialog?.kind === 'owl_depart') {
      const flap = Math.sin(this.elapsed * 19) * 0.72;
      this.owlRig.leftWing.rotation.z = flap;
      this.owlRig.rightWing.rotation.z = -flap;
      const owlBlink = computeBlinkScale(this.elapsed, 0.9);
      this.owlRig.leftEye.scale.y = owlBlink;
      this.owlRig.rightEye.scale.y = owlBlink;
      this.owlRig.root.position.y += dt * 10.5;
      this.owlRig.root.position.x += dt * 7.5;
      this.owlRig.root.position.z -= dt * 6.5;
      if (this.storyTimer >= 1.35) {
        this.startVillageAmbushCutscene();
      }
      return;
    }

    if (this.storyDialog?.kind === 'village_ambush') {
      this.updateVillageAmbushState(dt);
      const lookX = -0.8;
      const lookY = this.heroPos.y + 2.2;
      const lookZ = 115.0;
      _v1.set(this.heroPos.x - 2.6, this.heroPos.y + 4.3, this.heroPos.z + 5.2);
      _v2.set(lookX, lookY, lookZ);
      const camLerp = 1 - Math.exp(-5.0 * dt);
      this.camera.position.lerp(_v1, camLerp);
      this.controls.target.lerp(_v2, camLerp);
      return;
    }

    if (this.storyDialog?.kind === 'village_rescue_talk') {
      this.updateVillageAmbushState(dt);
      const amb = this.villageAmbushState;
      const partnerX = amb?.talkMidX ?? this.heroPos.x + 3.1;
      const partnerZ = amb?.talkMidZ ?? this.heroPos.z;
      const partnerY = getArchipelagoGroundY(partnerX, partnerZ);
      this.heroYaw = Math.atan2(partnerX - this.heroPos.x, partnerZ - this.heroPos.z);
      this.hero.body.rotation.y = this.heroYaw;
      this.hero.root.position.copy(this.heroPos);
      this.animateHeroConversation(this.storyDialog.speakerSide === 'hero', dt);
      this.updateSideAngleDialogueCamera(
        this.heroPos.x,
        this.heroPos.y,
        this.heroPos.z,
        partnerX,
        partnerY,
        partnerZ,
        dt,
      );
      return;
    }

    if (this.storyDialog?.kind === 'village_rescue_escort') {
      const amb = this.villageAmbushState;
      if (!amb || !amb.active) {
        this.finishVillageRescueEscort();
        return;
      }
      const guardianSpot = OVERWORLD_ANCHORS.npcs.npc_tetua;
      const heroTargetX = guardianSpot.x - 2.65;
      const heroTargetZ = guardianSpot.z;
      const survivors = amb.npcs.filter((n) => n.role === 'survivor' && n.alive);
      const npcTargets: Array<[number, number]> = [
        [guardianSpot.x - 4.3, guardianSpot.z - 1.55],
        [guardianSpot.x - 4.3, guardianSpot.z + 1.55],
      ];

      let allNpcsNear = true;
      survivors.forEach((n, idx) => {
        const [finalX, finalZ] = npcTargets[idx] ?? [guardianSpot.x - 4.3, guardianSpot.z];
        const useMid = Math.abs(n.z - guardianSpot.z) > 4.2 && n.x < 8.5;
        const tx = useMid ? 9.5 : finalX;
        const tz = useMid ? guardianSpot.z + (idx === 0 ? -1.1 : 1.1) : finalZ;
        const dx = tx - n.x;
        const dz = tz - n.z;
        const dist = Math.hypot(dx, dz);
        if (Math.hypot(finalX - n.x, finalZ - n.z) > 0.65) {
          allNpcsNear = false;
        }
        if (dist > 0.18) {
          const step = Math.min(dist, 5.1 * dt);
          const pt = this._desaColScratch;
          pt.x = n.x + (dx / dist) * step;
          pt.z = n.z + (dz / dist) * step;
          const gy = getArchipelagoGroundY(pt.x, pt.z);
          resolveObstacleBoxes(pt, 0.56, this.villageRig.obstacles, gy, 2.0);
          constrainToWalkableArchipelago(pt, 0.56);
          n.yaw = Math.atan2(pt.x - n.x, pt.z - n.z);
          n.x = pt.x;
          n.z = pt.z;
          n.y = getArchipelagoGroundY(n.x, n.z);
          n.actor.walkPhase += dt * 11.5;
          const swing = Math.sin(n.actor.walkPhase) * 0.65;
          n.actor.leftLeg.rotation.x = swing;
          n.actor.rightLeg.rotation.x = -swing;
          n.actor.leftArm.rotation.x = -swing * 0.55;
          n.actor.rightArm.rotation.x = swing * 0.55;
          n.actor.bodyPivot.position.y = Math.abs(Math.sin(n.actor.walkPhase)) * 0.06;
        } else {
          n.yaw = Math.atan2(guardianSpot.x - n.x, guardianSpot.z - n.z);
          n.actor.leftLeg.rotation.x = 0;
          n.actor.rightLeg.rotation.x = 0;
        }
        const vBlink = computeBlinkScale(this.elapsed, idx * 1.8 + 0.3);
        n.actor.leftEye.scale.y = vBlink;
        n.actor.rightEye.scale.y = vBlink;
        n.actor.root.position.set(n.x, n.y, n.z);
        n.actor.root.rotation.y = n.yaw;
      });

      const hUseMid = Math.abs(this.heroPos.z - guardianSpot.z) > 4.2 && this.heroPos.x < 7.0;
      const htx = hUseMid ? 8.0 : heroTargetX;
      const htz = hUseMid ? guardianSpot.z : heroTargetZ;
      const hdx = htx - this.heroPos.x;
      const hdz = htz - this.heroPos.z;
      const hDist = Math.hypot(hdx, hdz);
      if (hDist > 0.2) {
        const hStep = Math.min(hDist, 4.9 * dt);
        const hPt = this._desaColScratch;
        hPt.x = this.heroPos.x + (hdx / hDist) * hStep;
        hPt.z = this.heroPos.z + (hdz / hDist) * hStep;
        const hGy = getArchipelagoGroundY(hPt.x, hPt.z);
        resolveObstacleBoxes(hPt, 0.65, this.villageRig.obstacles, hGy, 2.0);
        constrainToWalkableArchipelago(hPt, 0.65);
        this.heroYaw = Math.atan2(hPt.x - this.heroPos.x, hPt.z - this.heroPos.z);
        this.heroPos.set(hPt.x, getArchipelagoGroundY(hPt.x, hPt.z), hPt.z);
        this.walkCycle += dt * 11.2;
        const swing = Math.sin(this.walkCycle) * 0.58;
        this.hero.leftLeg.rotation.x = swing;
        this.hero.rightLeg.rotation.x = -swing;
        this.hero.leftArm.rotation.x = -swing * 0.65;
        this.hero.rightArm.rotation.x = swing * 0.55;
        this.hero.body.position.y = Math.abs(Math.sin(this.walkCycle)) * 0.08;
      } else {
        this.heroYaw = Math.atan2(guardianSpot.x - this.heroPos.x, guardianSpot.z - this.heroPos.z);
      }
      const hBlink = computeBlinkScale(this.elapsed, 0.25);
      this.hero.leftEye.scale.y = hBlink;
      this.hero.rightEye.scale.y = hBlink;
      this.hero.root.position.copy(this.heroPos);
      this.hero.body.rotation.y = this.heroYaw;

      const camLerp = 1 - Math.exp(-4.5 * dt);
      _v1.set(this.heroPos.x - 5.4, this.heroPos.y + 4.4, this.heroPos.z + 6.4);
      _v2.set(
        THREE.MathUtils.lerp(this.heroPos.x + 2.5, guardianSpot.x, 0.45),
        this.heroPos.y + 1.4,
        THREE.MathUtils.lerp(this.heroPos.z, guardianSpot.z, 0.5),
      );
      this.camera.position.lerp(_v1, camLerp);
      this.controls.target.lerp(_v2, camLerp);

      if ((allNpcsNear && Math.hypot(heroTargetX - this.heroPos.x, heroTargetZ - this.heroPos.z) < 0.7) || this.storyTimer > 9.5) {
        this.finishVillageRescueEscort();
      }
      return;
    }

    if (this.storyDialog?.kind === 'cave_guardian' && this.dungeonRig) {
      const gPos = this.dungeonRig.guardianPos;
      this.dungeonRig.guardianMesh.rotation.y = Math.atan2(
        this.heroPos.x - gPos.x,
        this.heroPos.z - gPos.z,
      );
      this.heroYaw = Math.atan2(gPos.x - this.heroPos.x, gPos.z - this.heroPos.z);
      this.hero.body.rotation.y = this.heroYaw;
      this.hero.root.position.copy(this.heroPos);
      this.playerCaveLight.position.set(this.heroPos.x, 2.8, this.heroPos.z);
      animateZoneNpc(this.dungeonRig.guardianMesh, this.elapsed, 0.5, true, dt);

      this.updateHarvestDialogueCamera(
        this.heroPos.x,
        this.heroPos.y,
        this.heroPos.z,
        gPos.x,
        0,
        gPos.z,
        dt,
      );
      return;
    }

    if (this.storyDialog?.kind === 'dungeon_intro' && this.dungeonRig) {
      const walkDuration = 1.7;
      const t = Math.min(1, this.storyTimer / walkDuration);
      this.heroPos.lerpVectors(this.cutsceneStartPos, this.cutsceneTargetPos, t);
      this.hero.root.position.copy(this.heroPos);

      const hBlink = computeBlinkScale(this.elapsed, 0.25);
      this.hero.leftEye.scale.y = hBlink;
      this.hero.rightEye.scale.y = hBlink;
      const breathSy = 1 + Math.sin(this.elapsed * 2.5) * 0.04;
      const breathSxz = 1 / Math.sqrt(breathSy);
      this.hero.body.scale.set(breathSxz, breathSy, breathSxz);

      if (t < 1) {
        this.walkCycle += dt * 11;
        const swing = Math.sin(this.walkCycle) * 0.58;
        this.hero.leftLeg.rotation.x = swing;
        this.hero.rightLeg.rotation.x = -swing;
        this.hero.leftArm.rotation.x = -swing * 0.7;
        this.hero.rightArm.rotation.x = swing * 0.5;
        this.hero.body.position.y = Math.abs(Math.sin(this.walkCycle)) * 0.1;
        this.heroYaw = Math.atan2(
          this.cutsceneTargetPos.x - this.cutsceneStartPos.x,
          this.cutsceneTargetPos.z - this.cutsceneStartPos.z,
        );
      } else {
        this.hero.leftLeg.rotation.x *= 0.8;
        this.hero.rightLeg.rotation.x *= 0.8;
        this.hero.leftArm.rotation.x *= 0.8;
        this.hero.rightArm.rotation.x *= 0.8;
        this.hero.body.position.y = 0;
        this.hero.headGroup.rotation.y = Math.sin(this.elapsed * 1.1) * 0.12;
        this.heroYaw = Math.atan2(
          this.dungeonRig.guardianPos.x - this.heroPos.x,
          this.dungeonRig.guardianPos.z - this.heroPos.z,
        );
      }
      this.hero.body.rotation.y = this.heroYaw;
      this.playerCaveLight.position.set(this.heroPos.x, 2.8, this.heroPos.z);
      animateZoneNpc(this.dungeonRig.guardianMesh, this.elapsed, 0.5, true, dt);
      animateCaptiveMesh(this.dungeonRig.captiveMesh, this.elapsed, false);

      this.updateHarvestDialogueCamera(
        this.heroPos.x,
        this.heroPos.y,
        this.heroPos.z,
        this.dungeonRig.guardianPos.x,
        0,
        this.dungeonRig.guardianPos.z,
        dt,
      );
      return;
    }

    if (this.storyDialog?.kind === 'dungeon_rescue' && this.dungeonRig) {
      this.dungeonRig.captiveMesh.position.set(
        3.3,
        Math.abs(Math.sin(this.elapsed * 6.5)) * 0.34,
        11.8,
      );
      animateZoneNpc(this.dungeonRig.guardianMesh, this.elapsed, 0.5, true, dt);
      animateCaptiveMesh(this.dungeonRig.captiveMesh, this.elapsed, true);
      const hBlink = computeBlinkScale(this.elapsed, 0.25);
      this.hero.leftEye.scale.y = hBlink;
      this.hero.rightEye.scale.y = hBlink;
      const breathSy = 1 + Math.sin(this.elapsed * 2.5) * 0.042;
      const breathSxz = 1 / Math.sqrt(breathSy);
      this.hero.body.scale.set(breathSxz, breathSy, breathSxz);
      this.hero.leftLeg.rotation.x *= 0.8;
      this.hero.rightLeg.rotation.x *= 0.8;
      this.hero.body.position.y = 0;
      this.heroYaw = Math.atan2(3.8 - this.heroPos.x, 11.8 - this.heroPos.z);
      this.hero.body.rotation.y = this.heroYaw;

      this.updateHarvestDialogueCamera(
        this.heroPos.x,
        this.heroPos.y,
        this.heroPos.z,
        3.6,
        0,
        11.8,
        dt,
      );
      return;
    }

    if (this.storyDialog?.kind === 'opening') {
      const stage = this.getOpeningStageAnchors();
      this.heroPos.set(stage.heroX, stage.heroY, stage.heroZ);
      this.heroYaw = Math.atan2(stage.owlX - stage.heroX, stage.owlZ - stage.heroZ);
      this.hero.root.position.copy(this.heroPos);
      this.hero.body.rotation.y = this.heroYaw;

      const heroSpeaking = this.storyDialog.speakerSide === 'hero';
      const owlSpeaking = !heroSpeaking;

      this.animateHeroConversation(heroSpeaking, dt);

      // Expressive hovering & flapping animation for Owl in front of Player
      const flapSpeed = this.owlState === 'fly' ? 16 : owlSpeaking ? 13.5 : 10.5;
      const flapAmp = this.owlState === 'fly' ? 0.65 : owlSpeaking ? 0.56 : 0.44;
      const flap = Math.sin(this.elapsed * flapSpeed) * flapAmp;
      this.owlRig.leftWing.rotation.z = 0.12 + flap;
      this.owlRig.rightWing.rotation.z = -0.12 - flap;
      const owlBlink = computeBlinkScale(this.elapsed, 0.9);
      this.owlRig.leftEye.scale.y = owlBlink;
      this.owlRig.rightEye.scale.y = owlBlink;

      const hoverBob = Math.sin(this.elapsed * 3.4) * 0.22;
      if (this.owlState === 'fly') {
        const p = Math.min(1, this.storyTimer / 1.65);
        const ease = 1 - Math.pow(1 - p, 3);
        const startX = stage.owlX - 6.5;
        const startY = stage.owlY + 6.5;
        const startZ = stage.owlZ - 5.5;
        this.owlRig.root.position.set(
          THREE.MathUtils.lerp(startX, stage.owlX, ease),
          THREE.MathUtils.lerp(startY, stage.owlY, ease) + hoverBob,
          THREE.MathUtils.lerp(startZ, stage.owlZ, ease),
        );
        if (p >= 1) {
          this.owlState = 'land';
        }
      } else {
        this.owlRig.root.position.set(
          stage.owlX + Math.sin(this.elapsed * 1.9) * 0.14,
          stage.owlY + hoverBob,
          stage.owlZ + Math.cos(this.elapsed * 1.7) * 0.12,
        );
      }

      const faceHeroYaw = Math.atan2(
        stage.heroX - this.owlRig.root.position.x,
        stage.heroZ - this.owlRig.root.position.z,
      );
      this.owlRig.root.rotation.y =
        faceHeroYaw + (owlSpeaking ? Math.sin(this.elapsed * 3.8) * 0.14 : Math.sin(this.elapsed * 1.6) * 0.06);
      this.owlRig.root.rotation.x = owlSpeaking
        ? 0.1 + Math.sin(this.elapsed * 7.5) * 0.12
        : 0.06 + Math.sin(this.elapsed * 2.5) * 0.04;
      this.owlRig.root.rotation.z = Math.sin(this.elapsed * 2.6) * 0.09;

      // Side-angle 3D dialogue camera framing BOTH Hero & Owl clearly (never from behind either!)
      this.updateSideAngleDialogueCamera(
        stage.heroX,
        stage.heroY,
        stage.heroZ,
        stage.owlX,
        stage.heroY,
        stage.owlZ,
        dt,
      );
      return;
    }

    const flap = Math.sin(this.elapsed * 16) * 0.65;
    this.owlRig.leftWing.rotation.z = flap;
    this.owlRig.rightWing.rotation.z = -flap;
    const owlBlink = computeBlinkScale(this.elapsed, 0.9);
    this.owlRig.leftEye.scale.y = owlBlink;
    this.owlRig.rightEye.scale.y = owlBlink;
  }

  private updateWorldAnimations(dt: number): void {
    this.waterUniforms.uTime.value = this.elapsed;
    const shouldAdvanceClock =
      this.worldMode === 'overworld' ||
      (this.multiplayerActive && this.isWorldAuthority() && this.phase === 'playing');
    this.updateOverworldDayNightAtmosphere(dt, shouldAdvanceClock);
    this.sunburnFxTimer += dt;
    const ambientMode =
      this.phase === 'title' || this.phase === 'paused' || this.phase === 'gameover'
        ? 'none'
        : this.worldMode === 'ocean' || this.isHeroUnderwater()
        ? 'deep_sea'
        : this.worldMode === 'overworld'
        ? this.getCurrentDayPhase() === 'malam'
          ? 'night'
          : 'day'
        : 'none';
    soundEngine.setAmbientMode(ambientMode);
    if (this.phase !== 'playing') {
      soundEngine.setWalking(false);
      soundEngine.setSwimmingAudio(false);
    }

    // Keep Hero breathing, blinking & alive even on title/story/dialogue/pause screens!
    const inPrologue = this.phase === 'story' && this.storyDialog?.kind === 'prologue';
    const inAmbushCutscene =
      this.phase === 'story' && this.storyDialog?.kind === 'village_ambush';
    const inStoryCutscene =
      this.phase === 'story' &&
      (this.storyDialog?.kind === 'prologue' ||
        this.storyDialog?.kind === 'opening' ||
        this.storyDialog?.kind === 'owl_depart' ||
        this.storyDialog?.kind === 'village_ambush' ||
        this.storyDialog?.kind === 'village_rescue_talk' ||
        this.storyDialog?.kind === 'village_rescue_escort' ||
        this.storyDialog?.kind === 'dungeon_intro' ||
        this.storyDialog?.kind === 'dungeon_rescue');
    if (inPrologue || inAmbushCutscene) {
      for (const m of this.overworldAllMonsters) {
        m.mesh.visible = false;
      }
      for (const s of this.shooters) {
        s.mesh.visible = false;
      }
      for (const p of this.villageRig.pillagers) {
        p.root.visible = false;
      }
    }
    if (
      (this.phase === 'playing' || this.phase === 'dialogue') &&
      this.villageAmbushState?.active &&
      !this.villageAmbushState.inCutscene
    ) {
      this.updateVillageAmbushState(dt);
    }
    if (this.phase !== 'playing') {
      this.heroIdleTime = 0;
      this.heroThoughtText = null;
      this.heroThoughtTimer = 0;
    }
    if (this.phase !== 'playing' && this.phase !== 'dialogue' && !inStoryCutscene) {
      const hasEquippedWeapon =
        this.activeHotbarSlot <= 7 && this.ownedWeapons.has(this.activeWeapon);
      applyHeroWeaponPose(this.hero, this.activeWeapon, hasEquippedWeapon, {
        speed: 0,
        walkCycle: this.walkCycle,
        aimAlpha: 0,
        recoil: 0,
        dt,
        elapsed: this.elapsed,
        idleDuration: this.phase === 'title' ? this.elapsed : 0,
      });
    }

    // Owl leaving flight after story completes
    if (this.owlState === 'leave' && this.owlRig.root.visible) {
      this.storyTimer += dt;
      const flap = Math.sin(this.elapsed * 18) * 0.7;
      this.owlRig.leftWing.rotation.z = flap;
      this.owlRig.rightWing.rotation.z = -flap;
      const owlBlink = computeBlinkScale(this.elapsed, 0.9);
      this.owlRig.leftEye.scale.y = owlBlink;
      this.owlRig.rightEye.scale.y = owlBlink;
      this.owlRig.root.position.y += dt * 12;
      this.owlRig.root.position.x += dt * 10;
      if (this.storyTimer > 1.4) {
        this.owlRig.root.visible = false;
        this.owlState = 'hidden';
      }
    }

    if (this.worldMode !== 'overworld') {
      for (const obj of this.dungeonAnimatables) {
        if (obj.userData.animKind === 'spinZ') {
          obj.rotation.z += dt * 1.4;
        } else if (obj.userData.animKind === 'bob') {
          const base = Number(obj.userData.baseY || 3.5);
          const ph = Number(obj.userData.phase || 0);
          obj.position.y = base + Math.sin(this.elapsed * 2.8 + ph) * 0.35;
          obj.rotation.y += dt * 1.6;
        }
      }

      // Gently restore mined block wobble, sync cracks, & flicker placed cave torch flames
      if (this.worldMode === 'dungeon' && this.dungeonRig) {
        const gDist = Math.hypot(
          this.heroPos.x - this.dungeonRig.guardianPos.x,
          this.heroPos.z - this.dungeonRig.guardianPos.z,
        );
        animateZoneNpc(this.dungeonRig.guardianMesh, this.elapsed, 0.5, gDist < 4.5, dt);
        if (!this.dungeonState?.liberated) {
          animateCaptiveMesh(this.dungeonRig.captiveMesh, this.elapsed, false);
        } else {
          this.dungeonRig.guardianMesh.position.y = Math.abs(Math.sin(this.elapsed * 4.2)) * 0.1;
          if (this.phase !== 'story') {
            this.dungeonRig.captiveMesh.position.y =
              Math.abs(Math.sin(this.elapsed * 5.0 + 0.7)) * 0.14;
            animateCaptiveMesh(this.dungeonRig.captiveMesh, this.elapsed, true);
          }
        }
        for (const blk of this.dungeonRig.caveBlocks) {
          if (blk.alive && blk.mesh.scale.x < 0.999) {
            const s = THREE.MathUtils.lerp(blk.mesh.scale.x, 1, 1 - Math.exp(-14 * dt));
            blk.mesh.scale.setScalar(s);
            if (blk.crackMesh) blk.crackMesh.scale.setScalar(s);
          }
        }
        this.caveTorches.forEach((t, idx) => {
          const flame = t.mesh.children.find((c) => c.userData.isFlame);
          if (flame) {
            flame.scale.y = 0.92 + Math.sin(this.elapsed * 13 + idx * 1.7) * 0.2;
          }
          if (t.light) {
            t.light.intensity = 4.2 + Math.sin(this.elapsed * 11 + idx * 2.1) * 0.45;
          }
        });
        this.updateDungeonHazards(dt);
      } else if (this.worldMode === 'academy') {
        let acIdx = 0;
        for (const npc of this.academyNpcs.values()) {
          const isNear = Math.hypot(this.heroPos.x - npc.x, this.heroPos.z - npc.z) < 4.2;
          animateZoneNpc(npc.mesh, this.elapsed, acIdx * 1.15, isNear, dt);
          acIdx++;
        }
        for (const cit of this.academyCitizens) {
          const isNear = Math.hypot(this.heroPos.x - cit.x, this.heroPos.z - cit.z) < 3.6;
          animateZoneNpc(cit.mesh, this.elapsed, acIdx * 0.95, isNear, dt);
          acIdx++;
        }
      }
    }

    // Animate active monster pool (torches inside caves calm nearby monsters!)
    const baseSpeedMult = this.settings.difficulty === 'pendekar' ? 1.3 : 1.0;
    const canVisCull = this.worldMode === 'overworld' && this.phase === 'playing';
    const camX = this.camera.position.x;
    const camZ = this.camera.position.z;
    let sunburnRemoved = false;
    const isOverworldGuest =
      this.worldMode === 'overworld' && this.multiplayerActive && !this.isWorldAuthority();
    const guestBlend = 1 - Math.exp(-10 * dt);
    for (const m of this.getActiveMonsters()) {
      if (inPrologue) {
        m.mesh.visible = false;
        continue;
      }
      const spec = MONSTER_SPECS[m.type];
      if (!m.alive) {
        if (this.phase === 'playing' && m.respawnTimer > 0 && !isOverworldGuest) {
          m.respawnTimer -= dt;
          if (m.respawnTimer <= 0) {
            m.alive = true;
            m.mesh.visible = true;
            m.mesh.matrixAutoUpdate = true;
            m.x = m.homeX;
            m.z = m.homeZ;
            if (m.isCaveMob) {
              m.mobHp = 2;
              m.fuseTimer = m.type === 'cave_spider' ? -1 : undefined;
              m.y = FLYING_MONSTER_TYPES.has(m.type) ? 3.4 : 0;
              m.mesh.scale.setScalar(spec.baseScale);
            } else if (m.isSeaMonster) {
              m.mobHp = m.maxMobHp ?? spec.hitHp;
              m.aggroActive = false;
              m.windupTimer = -1;
              m.lungeTimer = 0;
              m.y = spec.hoverY;
              m.mesh.position.set(m.x, m.y, m.z);
              m.mesh.scale.setScalar(spec.baseScale);
            } else if (m.isSkyMonster) {
              m.mobHp = m.maxMobHp ?? spec.hitHp;
              m.stanceHp = spec.stanceHp;
              m.aggroActive = false;
              m.windupTimer = -1;
              m.lungeTimer = 0;
              m.diveOffset = 0;
              m.y = Math.max(getArchipelagoGroundY(m.x, m.z) + spec.hoverY, spec.hoverY);
              m.mesh.position.set(m.x, m.y, m.z);
              m.mesh.rotation.set(0, m.patrolPhase, 0);
              m.mesh.scale.setScalar(spec.baseScale);
            }
          }
        }
        continue;
      }
      if (this.worldMode === 'overworld') {
        const dxH = this.heroPos.x - m.x;
        const dzH = this.heroPos.z - m.z;
        const distSqH = dxH * dxH + dzH * dzH;
        const dxC = camX - m.x;
        const dzC = camZ - m.z;
        const minDistSq = Math.min(distSqH, dxC * dxC + dzC * dzC);
        const visLim = m.isSeaMonster || m.isSkyMonster ? 160 * 160 : 130 * 130;
        const keepVis =
          !inAmbushCutscene &&
          (!canVisCull ||
            minDistSq <= visLim ||
            Boolean(m.aggroActive) ||
            m.sunburnTimer !== undefined ||
            m.angryTimer > 0);
        if (m.mesh.visible !== keepVis) {
          m.mesh.visible = keepVis;
          if (keepVis) {
            m.mesh.matrixAutoUpdate = true;
            m.mesh.updateMatrix();
          }
        }
        const aiLim = m.isSeaMonster ? 82 * 82 : m.isSkyMonster ? 86 * 86 : 52 * 52;
        const isAwake =
          distSqH <= aiLim ||
          Boolean(m.aggroActive) ||
          m.sunburnTimer !== undefined ||
          m.angryTimer > 0;
        m.mesh.matrixAutoUpdate = isAwake;
      }
      if (isOverworldGuest) {
        if (m.angryTimer > 0) {
          m.angryTimer -= dt;
          m.mesh.scale.setScalar(m.isBoss ? 1.65 : spec.baseScale);
          animateMonsterRig(m.mesh, {
            mode: 'windup',
            elapsed: this.elapsed,
            phase: m.patrolPhase,
            dt,
          });
          if (m.angryTimer <= 0) {
            this.engageMonster(m);
          }
          continue;
        }
        const tgt = this.peerMonsterTargets.get(m.id);
        let mSpd = 0;
        if (tgt) {
          const prevX = m.x;
          const prevZ = m.z;
          m.x = THREE.MathUtils.lerp(m.x, tgt.x, guestBlend);
          m.z = THREE.MathUtils.lerp(m.z, tgt.z, guestBlend);
          m.y = THREE.MathUtils.lerp(m.y ?? tgt.y, tgt.y, guestBlend);
          mSpd = Math.hypot(m.x - prevX, m.z - prevZ) / Math.max(0.001, dt);
          let yDiff = tgt.yaw - m.mesh.rotation.y;
          while (yDiff > Math.PI) yDiff -= Math.PI * 2;
          while (yDiff < -Math.PI) yDiff += Math.PI * 2;
          m.mesh.rotation.y += yDiff * guestBlend;
        }
        if (m.hitFlashTimer && m.hitFlashTimer > 0) {
          m.hitFlashTimer = Math.max(0, m.hitFlashTimer - dt);
        }
        m.walkPhase = (m.walkPhase ?? m.patrolPhase) + dt * (2.6 + mSpd * 1.1);
        m.mesh.position.set(m.x, m.y ?? getArchipelagoGroundY(m.x, m.z) + spec.hoverY, m.z);
        m.mesh.scale.setScalar(spec.baseScale);
        const dxLocal = this.heroPos.x - m.x;
        const dzLocal = this.heroPos.z - m.z;
        const distSqLocal = dxLocal * dxLocal + dzLocal * dzLocal;
        if (distSqLocal <= 66 * 66) {
          animateMonsterRig(m.mesh, {
            mode: m.hitFlashTimer && m.hitFlashTimer > 0 ? 'hit' : mSpd > 0.25 ? 'patrol' : 'idle',
            speed: mSpd,
            walkPhase: m.walkPhase,
            elapsed: this.elapsed,
            phase: m.patrolPhase,
            dt,
          });
        }
        if (
          m.combatOnly &&
          this.carMode === 'none' &&
          this.planeMode === 'none' &&
          this.phase === 'playing' &&
          this.encounterGraceTimer <= 0 &&
          distSqLocal < (1.85 + spec.baseScale * 0.4) ** 2 &&
          Math.abs((m.y ?? 0) - this.heroPos.y) < 2.2
        ) {
          const dmg = spec.atkDamageHearts;
          this.hp = Math.max(0, this.hp - dmg);
          this.encounterGraceTimer = 1.45;
          soundEngine.playHurt();
          const len = Math.max(0.2, Math.sqrt(distSqLocal));
          this.heroVel.set((dxLocal / len) * 14, 0, (dzLocal / len) * 14);
          this.heroVelY = 4.2;
          this.spawnBurst(this.heroPos.x, this.heroPos.y + 1.2, this.heroPos.z, 0xef4444, 14);
          this.showBanner(`⚔️ Diserang ${m.name}! (-${dmg} ❤️)`, 2.0);
          this.triggerDamageFlash(dmg, `Serangan ${m.name}`, { x: m.x, z: m.z });
          if (this.hp <= 0) {
            this.phase = 'gameover';
            soundEngine.playLose();
            this.pushHud(true);
            return;
          }
        }
        continue;
      }
      if (m.isSeaMonster && (this.worldMode === 'overworld' || this.worldMode === 'ocean')) {
        this.updateSeaMonster(m, dt, baseSpeedMult);
        continue;
      }
      if (m.sunburnTimer !== undefined) {
        m.sunburnTimer -= dt;
        const jx = Math.sin(this.elapsed * 52 + m.patrolPhase) * 0.14;
        const jz = Math.cos(this.elapsed * 47 + m.patrolPhase) * 0.14;
        m.mesh.position.set(m.x + jx, (m.y ?? 0) + Math.abs(Math.sin(this.elapsed * 24)) * 0.25, m.z + jz);
        m.mesh.scale.setScalar(spec.baseScale * (1.0 + Math.max(0, 1.3 - m.sunburnTimer) * 0.26));
        if (this.sunburnFxTimer > 0.14) {
          this.spawnBurst(m.x, (m.y ?? 0) + 1.3, m.z, 0xf97316, 4);
        }
        if (m.sunburnTimer <= 0) {
          m.sunburnTimer = undefined;
          m.alive = false;
          m.mesh.visible = false;
          if (m.mesh.parent) m.mesh.parent.remove(m.mesh);
          const clickIdx = this.overworldClickables.indexOf(m.mesh);
          if (clickIdx >= 0) this.overworldClickables.splice(clickIdx, 1);
          sunburnRemoved = true;
          soundEngine.playBoom();
          this.spawnBurst(m.x, (m.y ?? 0) + 1.6, m.z, 0xff7a00, 30);
          this.spawnBurst(m.x, (m.y ?? 0) + 2.2, m.z, 0xfacc15, 16);
        }
        continue;
      }

      if (m.angryTimer > 0) {
        m.angryTimer -= dt;
        m.mesh.scale.setScalar(m.isBoss ? 1.65 : spec.baseScale);
        animateMonsterRig(m.mesh, {
          mode: 'windup',
          elapsed: this.elapsed,
          phase: m.patrolPhase,
          dt,
        });
        if (m.angryTimer <= 0) {
          this.engageMonster(m);
        }
        continue;
      }
      if (m.isSkyMonster && this.worldMode === 'overworld') {
        this.updateSkyMonster(m, dt, baseSpeedMult);
        continue;
      }

      let calmMult = 1.0;
      if (this.worldMode === 'dungeon' && this.caveTorches.length > 0) {
        for (const t of this.caveTorches) {
          if (Math.hypot(m.x - t.x, m.z - t.z) < 6.5) {
            calmMult = 0.45;
            break;
          }
        }
      }

      // Special AI 1: Cave Spider (chases Hoot & unleashes venom burst unless blocked by Blok Pelindung!)
      if (m.isCaveMob && m.type === 'cave_spider' && this.worldMode === 'dungeon' && this.dungeonRig) {
        const dxH = this.heroPos.x - m.x;
        const dzH = this.heroPos.z - m.z;
        const distH = Math.hypot(dxH, dzH);

        if (m.fuseTimer !== undefined && m.fuseTimer >= 0) {
          if (this.phase === 'playing') {
            if (distH > 6.4) {
              m.fuseTimer = -1;
              m.mesh.scale.setScalar(spec.baseScale);
            } else {
              m.fuseTimer -= dt;
              const swell =
                spec.baseScale *
                (1 + (1.65 - Math.max(0, m.fuseTimer)) * 0.22 + Math.sin(this.elapsed * 34) * 0.08);
              m.mesh.scale.setScalar(swell);
              m.mesh.rotation.y = Math.atan2(dxH, dzH);
              animateMonsterRig(m.mesh, {
                mode: 'windup',
                elapsed: this.elapsed,
                phase: m.patrolPhase,
                dt,
              });
              if (m.fuseTimer <= 0) {
                m.alive = false;
                m.mesh.visible = false;
                m.respawnTimer = 0;
                m.fuseTimer = -1;
                m.mesh.scale.setScalar(spec.baseScale);
                if (this.worldMode === 'dungeon' && this.dungeonState) {
                  this.markDungeonEnemyDefeated(this.dungeonState.zoneId, m.id);
                }
                this.syncDungeonMonsterStats();
                this.pushHud(true);
                soundEngine.playBoom();
                this.spawnBurst(m.x, 1.5, m.z, 0xa855f7, 34);

                let blockedByShield = false;
                for (const blk of this.dungeonRig.caveBlocks) {
                  if (!blk.alive || blk.kind !== 'player_shield') continue;
                  const distBlk = Math.hypot(blk.x - m.x, blk.z - m.z);
                  const nearHeroLine =
                    distBlk < 2.8 ||
                    (distH > 0.2 &&
                      Math.hypot(blk.x - (m.x + dxH * 0.5), blk.z - (m.z + dzH * 0.5)) < 2.1);
                  if (nearHeroLine) {
                    blockedByShield = true;
                    blk.hp -= 2;
                    blk.mesh.scale.setScalar(0.88);
                    if (blk.hp <= 0) {
                      this.shatterCaveBlock(blk, false);
                    } else {
                      this.updateBlockCrackVisual(blk);
                      if (this.dungeonState) {
                        const savedSb = this.getOrCreateZoneCaveDetail(
                          this.dungeonState.zoneId,
                        ).placedShieldBlocks.find((p) => p.id === blk.id);
                        if (savedSb) savedSb.hp = blk.hp;
                      }
                    }
                    this.showBanner('Blok Pelindung menahan ledakan racun Cave Spider!', 2.4);
                    break;
                  }
                }
                this.saveProgress();
                if (!blockedByShield && distH < 4.4 && this.encounterGraceTimer <= 0) {
                  this.hp = Math.max(0, this.hp - 1);
                  this.encounterGraceTimer = 1.6;
                  soundEngine.playHurt();
                  const len = Math.max(0.2, distH);
                  this.heroVel.set((dxH / len) * 18, 0, (dzH / len) * 18);
                  this.heroVelY = 6.5;
                  this.showBanner(
                    'BOOM! Terkena semburan Cave Spider! Tahan dengan Blok Pelindung (-1 ❤️)',
                    2.6,
                  );
                  this.triggerDamageFlash(1, 'Ledakan racun Cave Spider', { x: m.x, z: m.z });
                  if (this.hp <= 0) {
                    this.triggerDefeatExit(this.dungeonState?.zoneId);
                    return;
                  }
                }
              }
            }
          }
          continue;
        }

        let nextMx = m.x;
        let nextMz = m.z;
        if (this.phase === 'playing' && distH < 10.5 && distH > 0.3) {
          const spd = 2.7 * baseSpeedMult * calmMult;
          nextMx += (dxH / distH) * spd * dt;
          nextMz += (dzH / distH) * spd * dt;
          m.mesh.rotation.y = Math.atan2(dxH, dzH);
          if (distH < 3.4) {
            m.fuseTimer = 1.65;
            soundEngine.playHit();
            this.showBanner('SSSS...! Cave Spider bersiap meledak! Pasang Blok Pelindung atau mundur!', 2.2);
          }
        } else {
          const p = this.elapsed * 0.85 * baseSpeedMult * calmMult + m.patrolPhase;
          nextMx = m.homeX + Math.cos(p) * 2.4;
          nextMz = m.homeZ + Math.sin(p * 0.8) * 2.0;
          m.mesh.rotation.y = Math.atan2(-Math.sin(p), Math.cos(p * 0.8));
        }

        const mRad = 0.9;
        const pushCreeperBox = (bx: number, bz: number, hw: number) => {
          const cx = THREE.MathUtils.clamp(nextMx, bx - hw, bx + hw);
          const cz = THREE.MathUtils.clamp(nextMz, bz - hw, bz + hw);
          const dx = nextMx - cx;
          const dz = nextMz - cz;
          const distSq = dx * dx + dz * dz;
          if (distSq < mRad * mRad && distSq > 0.0001) {
            const d = Math.sqrt(distSq);
            nextMx += (dx / d) * (mRad - d);
            nextMz += (dz / d) * (mRad - d);
          }
        };
        for (const col of this.dungeonRig.caveColliders) {
          pushCreeperBox(col.x, col.z, col.halfW);
        }
        for (const blk of this.dungeonRig.caveBlocks) {
          if (blk.alive) pushCreeperBox(blk.x, blk.z, blk.halfW);
        }
        const prevCx = m.x;
        const prevCz = m.z;
        m.x = THREE.MathUtils.clamp(nextMx, -18, 18);
        m.z = THREE.MathUtils.clamp(nextMz, -18, 18);
        const cSpd = Math.hypot(m.x - prevCx, m.z - prevCz) / Math.max(0.001, dt);
        m.walkPhase = (m.walkPhase ?? m.patrolPhase) + dt * (3.2 + cSpd * 1.4);
        m.mesh.position.set(m.x, Math.abs(Math.sin(m.walkPhase)) * 0.08, m.z);
        animateMonsterRig(m.mesh, {
          mode: 'patrol',
          speed: cSpd,
          walkPhase: m.walkPhase,
          elapsed: this.elapsed,
          phase: m.patrolPhase,
          dt,
        });
        continue;
      }

      // Special AI 2: Cave Flying Imp (flies near ceiling, flaps wings, swoops down at Hoot!)
      if (m.isCaveMob && FLYING_MONSTER_TYPES.has(m.type) && this.worldMode === 'dungeon') {
        const dxH = this.heroPos.x - m.x;
        const dzH = this.heroPos.z - m.z;
        const distH = Math.hypot(dxH, dzH);
        let targetY = 3.5 + Math.sin(this.elapsed * 2.6 + m.patrolPhase) * 0.55;

        if (this.phase === 'playing' && distH < 9.5 && calmMult > 0.6) {
          const spd = 3.4 * baseSpeedMult * dt;
          const len = Math.max(0.2, distH);
          m.x = THREE.MathUtils.clamp(m.x + (dxH / len) * spd, -18, 18);
          m.z = THREE.MathUtils.clamp(m.z + (dzH / len) * spd, -18, 18);
          targetY = Math.max(1.55, this.heroPos.y + 1.55);
          m.mesh.rotation.y = Math.atan2(dxH, dzH);
        } else {
          const p = this.elapsed * 1.15 * baseSpeedMult * calmMult + m.patrolPhase;
          m.x = m.homeX + Math.cos(p) * 3.8;
          m.z = m.homeZ + Math.sin(p * 1.3) * 2.8;
          m.mesh.rotation.y = Math.atan2(-Math.sin(p), Math.cos(p * 1.3));
        }

        m.y = THREE.MathUtils.lerp(m.y ?? 3.4, targetY, 1 - Math.exp(-5 * dt));
        m.mesh.position.set(m.x, m.y, m.z);
        animateMonsterRig(m.mesh, {
          mode: this.phase === 'playing' && distH < 9.5 ? 'attack' : 'patrol',
          speed: 3.2,
          walkPhase: this.elapsed * 6,
          elapsed: this.elapsed,
          phase: m.patrolPhase,
          attackProgress: 0.5,
          dt,
        });

        if (
          this.phase === 'playing' &&
          this.encounterGraceTimer <= 0 &&
          distH < 1.65 &&
          Math.abs((m.y ?? 3.4) - (this.heroPos.y + 1.15)) < 1.35
        ) {
          this.hp = Math.max(0, this.hp - 1);
          this.encounterGraceTimer = 1.6;
          soundEngine.playHurt();
          this.spawnBurst(this.heroPos.x, this.heroPos.y + 1.3, this.heroPos.z, 0xf97316, 14);
          m.y = 4.0;
          const len = Math.max(0.2, distH);
          m.x = THREE.MathUtils.clamp(m.x - (dxH / len) * 2.8, -17.5, 17.5);
          m.z = THREE.MathUtils.clamp(m.z - (dzH / len) * 2.8, -17.5, 17.5);
          this.showBanner(`Diserang ${m.name}! Tembak dengan senjatamu (-1 ❤️)`, 2.2);
          this.triggerDamageFlash(1, `Serangan ${m.name}`, { x: m.x, z: m.z });
          if (this.hp <= 0) {
            this.triggerDefeatExit(this.dungeonState?.zoneId);
            return;
          }
        }
        continue;
      }

      // Distance culling for far Overworld surface monsters (keeps 50-mob Night & 30-mob Day locked at 60 FPS)
      let nearestBrawlerTgt =
        this.worldMode === 'overworld' && this.multiplayerActive
          ? this.getNearestPlayerTarget(m.x, m.z, 'overworld')
          : {
              x: this.heroPos.x,
              y: this.heroPos.y,
              z: this.heroPos.z,
              dx: this.heroPos.x - m.x,
              dz: this.heroPos.z - m.z,
              distSq: (this.heroPos.x - m.x) ** 2 + (this.heroPos.z - m.z) ** 2,
              dist: Math.hypot(this.heroPos.x - m.x, this.heroPos.z - m.z),
              isLocal: true,
            };
      let chasingAmbushNpc = false;
      if (
        m.isVillageAmbushTarget &&
        this.villageAmbushState?.active &&
        !this.villageAmbushState.resolved &&
        nearestBrawlerTgt.dist > 6.5 &&
        (m.mobHp ?? 2) >= (m.maxMobHp ?? 2)
      ) {
        let bestNpcDist = Infinity;
        for (const ambNpc of this.villageAmbushState.npcs) {
          if (!ambNpc.alive || ambNpc.role !== 'survivor') continue;
          const dNpc = Math.hypot(ambNpc.x - m.x, ambNpc.z - m.z);
          if (dNpc < bestNpcDist) {
            bestNpcDist = dNpc;
            chasingAmbushNpc = true;
            nearestBrawlerTgt = {
              x: ambNpc.x,
              y: ambNpc.y,
              z: ambNpc.z,
              dx: ambNpc.x - m.x,
              dz: ambNpc.z - m.z,
              distSq: dNpc * dNpc,
              dist: dNpc,
              isLocal: false,
            };
          }
        }
      }
      const dxHero = nearestBrawlerTgt.dx;
      const dzHero = nearestBrawlerTgt.dz;
      const distSqHero = nearestBrawlerTgt.distSq;
      if (this.worldMode === 'overworld' && distSqHero > 52 * 52 && !m.aggroActive) {
        continue;
      }

      // Special AI 3: Combat Brawlers (70% Overworld Day & Night Combat Monsters + Cave Guardians — NO QUIZ!)
      if (
        m.combatOnly &&
        ((this.worldMode === 'dungeon' && this.dungeonRig) || this.worldMode === 'overworld')
      ) {
        const distH = nearestBrawlerTgt.dist;

        if (m.hitFlashTimer && m.hitFlashTimer > 0) {
          m.hitFlashTimer = Math.max(0, m.hitFlashTimer - dt);
        }
        if (m.attackCooldown && m.attackCooldown > 0) {
          m.attackCooldown = Math.max(0, m.attackCooldown - dt);
        }
        if (m.attackAnimTimer && m.attackAnimTimer > 0) {
          m.attackAnimTimer = Math.max(0, m.attackAnimTimer - dt);
        }

        const ring = m.mesh.userData.combatRing as THREE.Object3D | undefined;
        if (ring) {
          ring.rotation.z += dt * 2.5;
        }

        const aggroRange =
          this.worldMode === 'overworld' ? spec.aggroRange : calmMult < 0.7 ? 7.8 : 12.8;
        if (this.phase === 'playing' && (distH < aggroRange || chasingAmbushNpc)) {
          if (!m.aggroActive) {
            soundEngine.playMonster();
          }
          m.aggroActive = true;
        } else if (this.worldMode === 'overworld' && !m.isVillageAmbushTarget && distH > aggroRange + 7.0) {
          m.aggroActive = false;
        }

        let nextMx = m.x;
        let nextMz = m.z;
        const baseScale = m.isBoss ? 1.65 : spec.baseScale;
        m.mesh.scale.setScalar(baseScale);
        m.mesh.rotation.x = 0;

        let monMode: 'idle' | 'patrol' | 'windup' | 'attack' | 'shoot' | 'hit' = 'patrol';
        let monAttackProg = 0;
        const meleeReach = 2.0 + spec.baseScale * 0.45;

        // Phase A: Active Lunging Melee Strike!
        if (m.lungeTimer && m.lungeTimer > 0) {
          m.lungeTimer = Math.max(0, m.lungeTimer - dt);
          if (this.phase === 'playing' && distH > 0.2) {
            const spd = 9.0 * spec.speedMult * dt;
            nextMx += (dxHero / distH) * spd;
            nextMz += (dzHero / distH) * spd;
          }
          m.mesh.rotation.y = Math.atan2(dxHero, dzHero);
          monMode = 'attack';
          monAttackProg = 1 - m.lungeTimer / 0.28;

          const jumpedOver = this.heroPos.y > 1.25;
          let shieldBlocked = false;
          if (this.worldMode === 'dungeon' && this.dungeonRig && distH < 2.25) {
            for (const blk of this.dungeonRig.caveBlocks) {
              if (
                blk.alive &&
                blk.kind === 'player_shield' &&
                Math.hypot(blk.x - (m.x + dxHero * 0.5), blk.z - (m.z + dzHero * 0.5)) < 1.85
              ) {
                shieldBlocked = true;
                blk.hp -= 1;
                if (blk.hp <= 0) this.shatterCaveBlock(blk, false);
                else this.updateBlockCrackVisual(blk);
                m.lungeTimer = 0;
                this.showBanner('🧱 Blok Pelindung menahan serangan monster!', 1.8);
                break;
              }
            }
          }

          if (
            !shieldBlocked &&
            !jumpedOver &&
            this.carMode === 'none' &&
            this.planeMode === 'none' &&
            nearestBrawlerTgt.isLocal &&
            this.phase === 'playing' &&
            this.encounterGraceTimer <= 0 &&
            distH < meleeReach
          ) {
            const dmg = spec.atkDamageHearts;
            this.hp = Math.max(0, this.hp - dmg);
            this.encounterGraceTimer = 1.45;
            soundEngine.playHurt();
            const len = Math.max(0.2, distH);
            this.heroVel.set((dxHero / len) * 15, 0, (dzHero / len) * 15);
            this.heroVelY = 4.8;
            this.spawnBurst(this.heroPos.x, this.heroPos.y + 1.2, this.heroPos.z, 0xef4444, 16);
            this.showBanner(
              `⚔️ Diserang ${m.name} (ATK ${spec.stats.atk})! Lompat / Tembak (-${dmg} ❤️)`,
              2.2,
            );
            this.triggerDamageFlash(dmg, `Serangan ${m.name}`, { x: m.x, z: m.z });
            if (this.hp <= 0) {
              if (this.worldMode !== 'overworld') {
                this.triggerDefeatExit(this.dungeonState?.zoneId);
              } else {
                this.phase = 'gameover';
                soundEngine.playLose();
                this.pushHud(true);
              }
              return;
            }
          }
        } else if (m.windupTimer !== undefined && m.windupTimer > 0) {
          // Phase B: Telegraphing windup before lunge
          m.windupTimer -= dt;
          m.mesh.rotation.y = Math.atan2(dxHero, dzHero);
          monMode = 'windup';
          if (m.windupTimer <= 0) {
            m.windupTimer = -1;
            m.lungeTimer = 0.28;
            soundEngine.playHit();
          }
        } else if (this.phase === 'playing' && m.aggroActive && distH > 0.2) {
          // Phase C: Relentless Chase + Melee/Ranged Decisions
          m.mesh.rotation.y = Math.atan2(dxHero, dzHero);

          if (distH < meleeReach + 0.55 && (m.attackCooldown ?? 0) <= 0) {
            m.windupTimer = 0.52;
            m.attackCooldown = this.settings.difficulty === 'pendekar' ? 1.8 : 2.3;
            soundEngine.playMonster();
          } else {
            const spd = 3.35 * spec.speedMult * baseSpeedMult * calmMult;
            if (distH > 1.75) {
              nextMx += (dxHero / distH) * spd * dt;
              nextMz += (dzHero / distH) * spd * dt;
            }
            if (spec.ranged && distH >= 4.5 && distH < 15.0 && (m.attackCooldown ?? 0) <= 0) {
              const pSpeed = this.settings.difficulty === 'pendekar' ? 10.5 : 8.6;
              const mGround =
                this.worldMode === 'overworld' ? getArchipelagoGroundY(m.x, m.z) : 0;
              const mFireY = mGround + spec.hoverY + spec.hitCenterY;
              const px = m.x + (dxHero / distH) * (0.9 * spec.baseScale);
              const pz = m.z + (dzHero / distH) * (0.9 * spec.baseScale);
              const pvx = (dxHero / distH) * pSpeed;
              const pvz = (dzHero / distH) * pSpeed;
              this.spawnProjectile({
                fromPlayer: false,
                x: px,
                y: mFireY,
                z: pz,
                vx: pvx,
                vz: pvz,
                damage: 1,
                shieldDamage: 1,
                pierceLeft: 0,
                colorHex: 0xef4444,
              });
              if (this.worldMode === 'overworld' && this.multiplayerActive && this.hasConnectedPeers && this.isWorldAuthority()) {
                this.emitMultiplayerPacket({
                  t: 'shot',
                  fp: false,
                  x: Math.round(px * 100) / 100,
                  y: Math.round(mFireY * 100) / 100,
                  z: Math.round(pz * 100) / 100,
                  vx: Math.round(pvx * 100) / 100,
                  vy: 0,
                  vz: Math.round(pvz * 100) / 100,
                  col: 0xef4444,
                  dmg: 1,
                  md: 'overworld',
                });
              }
              m.attackCooldown = this.settings.difficulty === 'pendekar' ? 2.5 : 3.4;
              m.attackAnimTimer = 0.3;
            }
          }
        } else {
          // Idle Patrol near settlement & outer islands
          if (m.patrolClock === undefined) {
            m.patrolClock = m.patrolPhase;
            m.idleRoamTimer = 3.5 + (m.patrolPhase % 3.5);
            m.idleRestTimer = 0;
          }
          if ((m.idleRestTimer ?? 0) > 0) {
            m.idleRestTimer = Math.max(0, (m.idleRestTimer ?? 0) - dt);
            monMode = 'idle';
            if ((m.idleRestTimer ?? 0) <= 0) {
              m.idleRoamTimer = 4.2 + Math.random() * 3.6;
            }
          } else {
            m.patrolClock += dt * 0.85 * spec.speedMult * baseSpeedMult * calmMult;
            m.idleRoamTimer = (m.idleRoamTimer ?? 4.5) - dt;
            if ((m.idleRoamTimer ?? 0) <= 0) {
              m.idleRestTimer = 2.8 + Math.random() * 2.8;
            }
            const p = m.patrolClock;
            nextMx = m.homeX + Math.cos(p) * 3.2;
            nextMz = m.homeZ + Math.sin(p * 0.85) * 2.6;
            m.mesh.rotation.y = Math.atan2(-Math.sin(p), Math.cos(p * 0.85));
          }
        }

        if (m.hitFlashTimer && m.hitFlashTimer > 0) {
          monMode = 'hit';
        } else if ((m.attackAnimTimer ?? 0) > 0 && monMode === 'patrol') {
          monMode = 'shoot';
          monAttackProg = 1 - (m.attackAnimTimer ?? 0) / 0.3;
        }

        const mRad = 0.85 * spec.baseScale;
        const pushBrawlerBox = (bx: number, bz: number, hw: number, hd = hw) => {
          const cx = THREE.MathUtils.clamp(nextMx, bx - hw, bx + hw);
          const cz = THREE.MathUtils.clamp(nextMz, bz - hd, bz + hd);
          const dx = nextMx - cx;
          const dz = nextMz - cz;
          const distSq = dx * dx + dz * dz;
          if (distSq < mRad * mRad && distSq > 0.0001) {
            const d = Math.sqrt(distSq);
            nextMx += (dx / d) * (mRad - d);
            nextMz += (dz / d) * (mRad - d);
          }
        };
        const prevBx = m.x;
        const prevBz = m.z;
        if (this.worldMode === 'dungeon' && this.dungeonRig) {
          for (const col of this.dungeonRig.caveColliders) {
            pushBrawlerBox(col.x, col.z, col.halfW);
          }
          for (const blk of this.dungeonRig.caveBlocks) {
            if (blk.alive) pushBrawlerBox(blk.x, blk.z, blk.halfW);
          }
          m.x = THREE.MathUtils.clamp(nextMx, -18, 18);
          m.z = THREE.MathUtils.clamp(nextMz, -18, 18);
        } else {
          const mobClamp = this._desaColScratch;
          mobClamp.x = nextMx;
          mobClamp.z = nextMz;
          const bPreY = getArchipelagoGroundY(m.x, m.z);
          resolveObstacleBoxes(mobClamp, mRad, this.villageRig.obstacles, bPreY, 2.2);
          this.resolveActiveDesaPickupBoxes(mobClamp, mRad);
          resolveArchipelagoVehicleCollisions(this.archipelagoRig, mobClamp, mRad, 2.2);
          this.resolveWorldVehiclesCollision(mobClamp, mRad, 2.2);
          if (this.worldObstaclesRig) {
            resolveSolidObstacleCollisions(this.worldObstaclesRig, mobClamp, mRad, 2.2);
          }
          if (this.isInDesaSapaanArea(mobClamp.x, mobClamp.z)) {
            resolveCircleDesaVisualTerrain(this.archipelagoRig, mobClamp, mRad, bPreY + 0.95);
            const bGroundY = getArchipelagoGroundY(mobClamp.x, mobClamp.z);
            const heroMinD = Math.min(2.0, 0.65 + spec.hitRadius * 0.62);
            this.resolveDesaLivingSeparation(
              mobClamp,
              mRad,
              bGroundY,
              m,
              undefined,
              undefined,
              false,
              heroMinD,
            );
            resolveObstacleBoxes(mobClamp, mRad, this.villageRig.obstacles, bGroundY, 2.2);
            this.resolveActiveDesaPickupBoxes(mobClamp, mRad);
            resolveArchipelagoVehicleCollisions(this.archipelagoRig, mobClamp, mRad, 2.2);
            this.resolveWorldVehiclesCollision(mobClamp, mRad, 2.2);
            if (this.worldObstaclesRig) {
              resolveSolidObstacleCollisions(this.worldObstaclesRig, mobClamp, mRad, 2.2);
            }
            resolveCircleDesaVisualTerrain(this.archipelagoRig, mobClamp, mRad, bPreY + 0.95);
          }
          constrainToWalkableArchipelago(mobClamp, 0.95);
          m.x = mobClamp.x;
          m.z = mobClamp.z;
        }
        const bSpd = Math.hypot(m.x - prevBx, m.z - prevBz) / Math.max(0.001, dt);
        if (bSpd > 0.25) {
          m.walkPhase = (m.walkPhase ?? m.patrolPhase) + dt * (3.5 + bSpd * 1.45);
        } else if (monMode === 'patrol' && !m.aggroActive) {
          monMode = 'idle';
        }
        const mGroundY = this.worldMode === 'overworld' ? getArchipelagoGroundY(m.x, m.z) : 0;
        const hoverBob =
          spec.hoverY > 0
            ? spec.hoverY + Math.sin(this.elapsed * 3.0 + m.patrolPhase) * 0.24
            : bSpd > 0.25
            ? Math.abs(Math.sin(m.walkPhase ?? 0)) * 0.08
            : 0;
        m.y = mGroundY + hoverBob;
        m.mesh.position.set(m.x, m.y, m.z);
        if (distSqHero <= 42 * 42) {
          animateMonsterRig(m.mesh, {
            mode: monMode,
            speed: bSpd,
            walkPhase: m.walkPhase,
            elapsed: this.elapsed,
            phase: m.patrolPhase,
            attackProgress: monAttackProg,
            dt,
          });
        }
        continue;
      }

      // 30% English Quiz Monsters (Overworld Day/Night & Dungeon Guardians & Academy)
      if (m.patrolClock === undefined) {
        m.patrolClock = m.patrolPhase;
        m.idleRoamTimer = 4.0 + (m.patrolPhase % 3.5);
        m.idleRestTimer = 0;
      }
      const qRing = m.mesh.userData.combatRing as THREE.Object3D | undefined;
      if (qRing) {
        qRing.rotation.z -= dt * 1.8;
      }
      let normalMonMode: 'idle' | 'patrol' = 'patrol';
      let nextMx = m.x;
      let nextMz = m.z;
      if ((m.idleRestTimer ?? 0) > 0) {
        m.idleRestTimer = Math.max(0, (m.idleRestTimer ?? 0) - dt);
        normalMonMode = 'idle';
        if ((m.idleRestTimer ?? 0) <= 0) {
          m.idleRoamTimer = 4.5 + Math.random() * 3.8;
        }
      } else {
        m.patrolClock += dt * 0.85 * spec.speedMult * baseSpeedMult * calmMult;
        m.idleRoamTimer = (m.idleRoamTimer ?? 4.5) - dt;
        if ((m.idleRoamTimer ?? 0) <= 0) {
          m.idleRestTimer = 2.8 + Math.random() * 2.8;
        }
        const p = m.patrolClock;
        const radius = m.isBoss ? 1.8 : 2.6;
        nextMx = m.homeX + Math.cos(p) * radius;
        nextMz = m.homeZ + Math.sin(p * 0.8) * (radius * 0.8);
        if (this.worldMode === 'dungeon' && this.dungeonRig) {
          const mRad = m.isBoss ? 1.25 : 0.95;
          const pushMonsterBox = (bx: number, bz: number, hw: number, hd = hw) => {
            const cx = THREE.MathUtils.clamp(nextMx, bx - hw, bx + hw);
            const cz = THREE.MathUtils.clamp(nextMz, bz - hd, bz + hd);
            const dx = nextMx - cx;
            const dz = nextMz - cz;
            const distSq = dx * dx + dz * dz;
            if (distSq < mRad * mRad && distSq > 0.0001) {
              const d = Math.sqrt(distSq);
              nextMx += (dx / d) * (mRad - d);
              nextMz += (dz / d) * (mRad - d);
            }
          };
          for (const col of this.dungeonRig.caveColliders) {
            pushMonsterBox(col.x, col.z, col.halfW);
          }
          for (const blk of this.dungeonRig.caveBlocks) {
            if (blk.alive) pushMonsterBox(blk.x, blk.z, blk.halfW);
          }
        } else if (this.worldMode === 'overworld') {
          const mRad = 0.85 * spec.baseScale;
          const mobClamp = this._desaColScratch;
          mobClamp.x = nextMx;
          mobClamp.z = nextMz;
          const qPreY = getArchipelagoGroundY(m.x, m.z);
          resolveObstacleBoxes(mobClamp, mRad, this.villageRig.obstacles, qPreY, 2.2);
          this.resolveActiveDesaPickupBoxes(mobClamp, mRad);
          resolveArchipelagoVehicleCollisions(this.archipelagoRig, mobClamp, mRad, 2.2);
          this.resolveWorldVehiclesCollision(mobClamp, mRad, 2.2);
          if (this.worldObstaclesRig) {
            resolveSolidObstacleCollisions(this.worldObstaclesRig, mobClamp, mRad, 2.2);
          }
          if (this.isInDesaSapaanArea(mobClamp.x, mobClamp.z)) {
            resolveCircleDesaVisualTerrain(this.archipelagoRig, mobClamp, mRad, qPreY + 0.95);
            const qGroundY = getArchipelagoGroundY(mobClamp.x, mobClamp.z);
            const heroMinD = Math.min(2.05, 0.68 + spec.hitRadius * 0.65);
            this.resolveDesaLivingSeparation(
              mobClamp,
              mRad,
              qGroundY,
              m,
              undefined,
              undefined,
              false,
              heroMinD,
            );
            resolveObstacleBoxes(mobClamp, mRad, this.villageRig.obstacles, qGroundY, 2.2);
            this.resolveActiveDesaPickupBoxes(mobClamp, mRad);
            resolveArchipelagoVehicleCollisions(this.archipelagoRig, mobClamp, mRad, 2.2);
            this.resolveWorldVehiclesCollision(mobClamp, mRad, 2.2);
            if (this.worldObstaclesRig) {
              resolveSolidObstacleCollisions(this.worldObstaclesRig, mobClamp, mRad, 2.2);
            }
            resolveCircleDesaVisualTerrain(this.archipelagoRig, mobClamp, mRad, qPreY + 0.95);
          }
          constrainToWalkableArchipelago(mobClamp, 0.95);
          nextMx = mobClamp.x;
          nextMz = mobClamp.z;
        }
        m.mesh.rotation.y = Math.atan2(-Math.sin(p), Math.cos(p * 0.8));
      }
      const prevOx = m.x;
      const prevOz = m.z;
      m.x = nextMx;
      m.z = nextMz;
      const mSpd = Math.hypot(m.x - prevOx, m.z - prevOz) / Math.max(0.001, dt);
      if (mSpd > 0.2) {
        m.walkPhase = (m.walkPhase ?? m.patrolPhase) + dt * (3.0 + mSpd * 1.4);
      } else {
        normalMonMode = 'idle';
      }
      const nGroundY = this.worldMode === 'overworld' ? getArchipelagoGroundY(m.x, m.z) : 0;
      const nHover =
        spec.hoverY > 0
          ? spec.hoverY + Math.sin(this.elapsed * 3.0 + m.patrolPhase) * 0.24
          : mSpd > 0.2
          ? Math.abs(Math.sin(m.walkPhase ?? 0)) * 0.06
          : 0;
      m.y = nGroundY + nHover;
      m.mesh.position.set(m.x, m.y, m.z);
      if (distSqHero <= 42 * 42) {
        animateMonsterRig(m.mesh, {
          mode: normalMonMode,
          speed: mSpd,
          walkPhase: m.walkPhase,
          elapsed: this.elapsed,
          phase: m.patrolPhase,
          dt,
        });
      }
    }
    if (sunburnRemoved) {
      this.rebuildOverworldMonsterPool();
    }

    if (this.sunburnFxTimer > 0.14) this.sunburnFxTimer = 0;

    if (this.worldMode !== 'overworld') return;

    this.areaMists.forEach((mist, zId) => {
      if (this.storyDialog?.kind === 'prologue') {
        mist.visible = this.storyDialog.step >= 2;
      } else if (this.liberatedZones.has(zId)) {
        mist.visible = false;
      } else if (!canVisCull) {
        mist.visible = true;
      } else {
        const dxH = this.heroPos.x - mist.position.x;
        const dzH = this.heroPos.z - mist.position.z;
        const dxC = camX - mist.position.x;
        const dzC = camZ - mist.position.z;
        mist.visible = Math.min(dxH * dxH + dzH * dzH, dxC * dxC + dzC * dzC) <= 145 * 145;
      }
    });

    updateArchipelagoWorld(
      this.archipelagoRig,
      dt,
      this.elapsed,
      this.heroPos,
      this.camera.position,
    );

    if (
      this.archipelagoUnderwaterRig &&
      (this.isHeroUnderwater() || this.camera.position.y <= 22)
    ) {
      updateArchipelagoUnderwaterProps(
        this.archipelagoUnderwaterRig,
        dt,
        this.elapsed,
        this.heroPos,
        this.heroYaw,
        this.camera.position.y,
        this.oceanGear,
        this.isHeroUnderwater(),
        this.isMobileDevice || this.isLowEndMobile || this.settings.fxLevel !== 'full',
        this.ridingTurtle && this.isSwimming,
      );
    }

    const currentDayPhase = this.getCurrentDayPhase();

    this.updateWorldVehiclesAndImpacts(dt);

    this.extraVillageColliders.length = 0;
    this.extraVillageColliders.push({
      x: this.heroPos.x,
      z: this.heroPos.z,
      halfW: 0.65,
      halfD: 0.65,
    });
    for (const npc of this.npcs.values()) {
      if (npc.koTimer > 0 || !this.isNpcOnDuty(npc.shift)) continue;
      this.extraVillageColliders.push({
        x: npc.x,
        z: npc.z,
        halfW: 0.65,
        halfD: 0.65,
      });
    }
    if (!this.starterWeaponPicked && this.starterPickupMesh.visible) {
      this.extraVillageColliders.push({
        x: OVERWORLD_ANCHORS.starterWeapon.x,
        z: OVERWORLD_ANCHORS.starterWeapon.z,
        halfW: 0.78,
        halfD: 0.78,
      });
    }
    if (!this.swimSuitPicked && this.swimSuitPickupMesh.visible) {
      this.extraVillageColliders.push({
        x: OVERWORLD_ANCHORS.swimSuit.x,
        z: OVERWORLD_ANCHORS.swimSuit.z,
        halfW: 0.78,
        halfD: 0.78,
      });
    }
    for (let i = 0; i < this.monsters.length; i++) {
      const m = this.monsters[i];
      if (!m.alive || m.isSkyMonster || m.isSeaMonster || !this.isInDesaSapaanArea(m.x, m.z)) {
        continue;
      }
      const r = 0.75 * MONSTER_SPECS[m.type].baseScale;
      this.extraVillageColliders.push({ x: m.x, z: m.z, halfW: r, halfD: r });
    }
    for (let i = 0; i < this.shooters.length; i++) {
      const s = this.shooters[i];
      if (!s.alive || !this.isInDesaSapaanArea(s.x, s.z)) continue;
      this.extraVillageColliders.push({ x: s.x, z: s.z, halfW: 0.82, halfD: 0.82 });
    }
    appendVehicleVillageColliders(this.archipelagoRig, this.extraVillageColliders);
    for (let i = 0; i < this.worldVehicles.length; i++) {
      const v = this.worldVehicles[i];
      this.extraVillageColliders.push({
        x: v.pos.x,
        z: v.pos.z,
        halfW: v.halfW,
        halfD: v.halfL,
        rotY: v.yaw,
        minY: v.pos.y,
        maxY: v.pos.y + v.height,
      });
    }
    updateMinecraftVillage(
      this.villageRig,
      dt,
      this.elapsed,
      this.extraVillageColliders,
      currentDayPhase,
      this.heroPos.x,
      this.heroPos.z,
      this.isLowEndMobile || this.settings.fxLevel !== 'full',
      this.camera.position.x,
      this.camera.position.z,
      canVisCull,
      this.activeVehicleHazards,
    );
    if (inPrologue) {
      for (const p of this.villageRig.pillagers) {
        p.root.visible = false;
      }
      if (this.villageRig.outpostBanner) {
        this.villageRig.outpostBanner.visible = false;
      }
    } else if (this.villageRig.outpostBanner) {
      this.villageRig.outpostBanner.visible = true;
    }

    // Gentle blocky Minecraft-style voxel clouds drift across the sky
    const throttleUpload = this.isLowEndMobile || this.settings.fxLevel !== 'full';
    if (!throttleUpload || (this.animFrameCounter & 1) === 0) {
      const cloudStep = throttleUpload ? dt * 1.8 : dt * 0.9;
      for (let i = 0; i < this.cloudsMesh.count; i++) {
        this.cloudsMesh.getMatrixAt(i, _cloudMat);
        _cloudMat.decompose(_cloudPos, _cloudQuat, _cloudScale);
        _cloudPos.x += cloudStep;
        if (_cloudPos.x > 240) _cloudPos.x = -240;
        _cloudMat.compose(_cloudPos, _cloudQuat, _cloudScale);
        this.cloudsMesh.setMatrixAt(i, _cloudMat);
      }
      this.cloudsMesh.instanceMatrix.needsUpdate = true;

      if (this.worldMistMesh && this.worldMistMesh.visible) {
        for (let i = 0; i < this.worldMistSeeds.length; i++) {
          const s = this.worldMistSeeds[i];
          const mx = s.baseX + Math.sin(this.elapsed * 0.24 + s.phase) * s.driftX;
          const my = s.baseY + Math.cos(this.elapsed * 0.35 + s.phase) * 0.22;
          const mz = s.baseZ + Math.cos(this.elapsed * 0.21 + s.phase) * s.driftZ;
          _cloudPos.set(mx, my, mz);
          _cloudQuat.setFromAxisAngle(_v3.set(0, 1, 0), s.rotY + this.elapsed * 0.06);
          _cloudScale.set(s.sx, s.sy, s.sz);
          _cloudMat.compose(_cloudPos, _cloudQuat, _cloudScale);
          this.worldMistMesh.setMatrixAt(i, _cloudMat);
        }
        this.worldMistMesh.instanceMatrix.needsUpdate = true;
      }
    }

    this.portalRig.ringOuter.rotation.z += dt * 1.1;
    this.portalRig.ringInner.rotation.z -= dt * 1.8;

    if (this.starterPickupMesh.visible) {
      this.starterPickupMesh.rotation.y += dt * 1.8;
      this.starterPickupMesh.children.forEach((c) => {
        if (c.userData.animOrb) {
          c.position.y += Math.sin(this.elapsed * 3.4) * 0.004;
        } else if (c.userData.animBeacon) {
          const mat = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
          mat.opacity = 0.16 + Math.sin(this.elapsed * 4.0) * 0.09;
        } else if (c.userData.animRing) {
          const s = 1 + Math.sin(this.elapsed * 4.5) * 0.12;
          c.scale.setScalar(s);
        }
      });
    }

    if (this.swimSuitPickupMesh.visible) {
      this.swimSuitPickupMesh.rotation.y += dt * 1.6;
      this.swimSuitPickupMesh.children.forEach((c) => {
        if (c.userData.animOrb) {
          c.position.y += Math.sin(this.elapsed * 3.2 + 1.1) * 0.004;
        } else if (c.userData.animBeacon) {
          const mat = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
          mat.opacity = 0.18 + Math.sin(this.elapsed * 3.8) * 0.09;
        } else if (c.userData.animRing) {
          const s = 1 + Math.sin(this.elapsed * 4.2) * 0.12;
          c.scale.setScalar(s);
        }
      });
    }

    const isNightShift = currentDayPhase === 'malam';
    let npcIdx = 0;
    for (const [npcId, npc] of this.npcs.entries()) {
      const isOnDuty = (npc.shift === 'night') === isNightShift;
      if (!isOnDuty) {
        // NPC lepas piket bersembunyi aman di dalam rumah (tidak berkeliaran di luar saat keadaan mencekam)
        npc.mesh.visible = false;
        npc.alertMesh.visible = false;
        npc.aura.group.visible = false;
        npc.poseMode = 'stand';
        npc.fleeTimer = 0;
        npcIdx++;
        continue;
      }
      if (npc.koTimer > 0) {
        npc.koTimer = Math.max(0, npc.koTimer - dt);
        npc.mesh.visible = false;
        npc.alertMesh.visible = false;
        npc.aura.group.visible = false;
        if (npc.koTimer <= 0) {
          const rx = npc.standX;
          const ry = npc.standY;
          const rz = npc.standZ;
          const rYaw = npc.standRotY;
          npc.x = rx;
          npc.z = rz;
          npc.yaw = rYaw;
          npc.poseMode = 'stand';
          npc.fleeTimer = 0;
          npc.mesh.position.set(rx, ry, rz);
          npc.mesh.visible = true;
          npc.aura.group.position.set(rx, ry, rz);
          npc.aura.group.visible = !inPrologue && !inAmbushCutscene;
          this.spawnBurst(rx, ry + 1.2, rz, 0x38bdf8, 12);
        }
        npcIdx++;
        continue;
      }
      npc.mesh.visible = true;
      npc.aura.group.visible = !inPrologue && !inAmbushCutscene;

      const q = this.quests.find((item) => item.npcId === npc.dayNpcId);
      const showAlert = !inPrologue && !inAmbushCutscene && !q?.claimed;
      const distHero = Math.hypot(this.heroPos.x - npc.x, this.heroPos.z - npc.z);

      // Threat scan: Overworld NPCs sprint away fast when a moving or honking car approaches
      let threatX = 0;
      let threatZ = 0;
      let threatScore = 0;
      const npcYNow = getArchipelagoGroundY(npc.x, npc.z);
      for (let hi = 0; hi < this.activeVehicleHazards.length; hi++) {
        const hz = this.activeVehicleHazards[hi];
        const spd = Math.abs(hz.speed);
        if (spd < 0.75 && !hz.honking) continue;
        if (Math.abs(hz.y - npcYNow) > 4.2) continue;
        const dx = npc.x - hz.x;
        const dz = npc.z - hz.z;
        const d = Math.hypot(dx, dz);
        const dangerRange = hz.honking ? 18.5 : Math.min(20.0, 9.5 + spd * 0.65);
        if (d > dangerRange) continue;
        const invSpd = spd > 0.25 ? 1 / spd : 0;
        const approachDot =
          spd > 0.25 && d > 0.1 ? (dx / d) * (hz.vx * invSpd) + (dz / d) * (hz.vz * invSpd) : 0;
        if (d < 8.8 || hz.honking || approachDot > 0.18) {
          let awayX = dx;
          let awayZ = dz;
          if (spd > 0.5 && d > 0.2) {
            const perpX = -hz.vz * invSpd;
            const perpZ = hz.vx * invSpd;
            const sideSign = dx * perpX + dz * perpZ >= 0 ? 1 : -1;
            awayX = dx / d + perpX * sideSign * 1.45;
            awayZ = dz / d + perpZ * sideSign * 1.45;
          }
          const score = dangerRange - d + (hz.honking ? 4 : 0);
          if (score > threatScore) {
            threatScore = score;
            threatX = awayX;
            threatZ = awayZ;
          }
        }
      }
      if (threatScore > 0) {
        const [fx, fz] = this.pickSafeNpcFleeDir(npc.x, npc.z, npcYNow, threatX, threatZ);
        npc.fleeDirX = fx;
        npc.fleeDirZ = fz;
        npc.fleeTimer = 1.25;
      }

      let isFleeingCar = false;
      if (npc.fleeTimer > 0) {
        npc.fleeTimer = Math.max(0, npc.fleeTimer - dt);
        isFleeingCar = true;
        npc.x += npc.fleeDirX * 7.6 * dt;
        npc.z += npc.fleeDirZ * 7.6 * dt;
        npc.yaw = Math.atan2(npc.fleeDirX, npc.fleeDirZ);
        npc.poseMode = 'walk';
        npc.mesh.position.set(npc.x, getArchipelagoGroundY(npc.x, npc.z), npc.z);
      } else if (isOnDuty) {
        // Shift bertugas: berjalan ke pos pintu wilayah dan berdiri berjaga dengan aura terang!
        const useWaypoint =
          Boolean(npc.walkWaypoint) &&
          npc.x < npc.walkWaypoint!.x - 0.8 &&
          npc.standX > npc.walkWaypoint!.x;
        const targetX = useWaypoint ? npc.walkWaypoint!.x : npc.standX;
        const targetZ = useWaypoint ? npc.walkWaypoint!.z : npc.standZ;
        const dx = targetX - npc.x;
        const dz = targetZ - npc.z;
        const distTarget = Math.hypot(dx, dz);
        const distStand = Math.hypot(npc.standX - npc.x, npc.standZ - npc.z);
        if (distStand > 0.25 && distTarget > 0.2) {
          const step = Math.min(distTarget, 3.8 * dt);
          npc.x += (dx / distTarget) * step;
          npc.z += (dz / distTarget) * step;
          npc.yaw = Math.atan2(dx, dz);
          npc.poseMode = 'walk';
          npc.mesh.position.set(npc.x, getArchipelagoGroundY(npc.x, npc.z), npc.z);
        } else {
          npc.x = npc.standX;
          npc.z = npc.standZ;
          npc.yaw = distHero < 5.6
            ? Math.atan2(this.heroPos.x - npc.x, this.heroPos.z - npc.z)
            : npc.standRotY;
          npc.poseMode = 'stand';
          npc.mesh.position.set(npc.standX, npc.standY, npc.standZ);
        }
        if (
          isNightShift &&
          this.phase === 'playing' &&
          distHero < 6.4 &&
          !this.nightPermittedZones.has(npc.zoneId)
        ) {
          this.grantNightPermissionForZone(npc.zoneId);
        }
      } else {
        // Lepas piket: kembali ke plaza pulau & berbaur santai sebagai warga / NPC biasa (tanpa aura & tanpa tidur!)
        const distOffHome = Math.hypot(npc.offDutyX - npc.x, npc.offDutyZ - npc.z);
        if (distOffHome > 3.8) {
          const useWaypoint =
            Boolean(npc.walkWaypoint) &&
            npc.x > npc.walkWaypoint!.x + 0.8 &&
            npc.offDutyX < npc.walkWaypoint!.x;
          const targetX = useWaypoint ? npc.walkWaypoint!.x : npc.offDutyX;
          const targetZ = useWaypoint ? npc.walkWaypoint!.z : npc.offDutyZ;
          const dx = targetX - npc.x;
          const dz = targetZ - npc.z;
          const distTarget = Math.hypot(dx, dz) || 1;
          const step = Math.min(distTarget, 3.6 * dt);
          npc.x += (dx / distTarget) * step;
          npc.z += (dz / distTarget) * step;
          npc.yaw = Math.atan2(dx, dz);
          npc.poseMode = 'walk';
          npc.mesh.position.set(npc.x, getArchipelagoGroundY(npc.x, npc.z), npc.z);
        } else if (distHero < 5.0 && this.phase === 'playing') {
          npc.poseMode = 'stand';
          npc.yaw = Math.atan2(this.heroPos.x - npc.x, this.heroPos.z - npc.z);
          npc.mesh.position.set(npc.x, getArchipelagoGroundY(npc.x, npc.z), npc.z);
        } else {
          npc.roamTimer -= dt;
          if (npc.roamTimer <= 0) {
            npc.roamPaused = !npc.roamPaused;
            if (!npc.roamPaused) {
              const ang = Math.random() * Math.PI * 2;
              const rad = 0.8 + Math.random() * 1.9;
              npc.roamTargetX = npc.offDutyX + Math.cos(ang) * rad;
              npc.roamTargetZ = npc.offDutyZ + Math.sin(ang) * rad;
              npc.roamTimer = 2.2 + Math.random() * 2.0;
            } else {
              npc.roamTimer = 3.2 + Math.random() * 3.0;
            }
          }
          if (!npc.roamPaused) {
            const dx = npc.roamTargetX - npc.x;
            const dz = npc.roamTargetZ - npc.z;
            const dRoam = Math.hypot(dx, dz);
            if (dRoam > 0.25) {
              const step = Math.min(dRoam, 1.55 * dt);
              npc.x += (dx / dRoam) * step;
              npc.z += (dz / dRoam) * step;
              npc.yaw = Math.atan2(dx, dz);
              npc.poseMode = 'walk';
              npc.mesh.position.set(npc.x, getArchipelagoGroundY(npc.x, npc.z), npc.z);
            } else {
              npc.roamPaused = true;
              npc.poseMode = 'stand';
              npc.roamTimer = 3.0 + Math.random() * 2.5;
            }
          } else {
            npc.poseMode = 'stand';
          }
        }
      }

      if (npc.poseMode === 'walk') {
        const npcCol = this._desaColScratch;
        npcCol.x = npc.x;
        npcCol.z = npc.z;
        const nRad = 0.62;
        const nPreY = getArchipelagoGroundY(npcCol.x, npcCol.z);
        resolveObstacleBoxes(npcCol, nRad, this.villageRig.obstacles, nPreY, 2.2);
        this.resolveActiveDesaPickupBoxes(npcCol, nRad);
        resolveArchipelagoVehicleCollisions(this.archipelagoRig, npcCol, nRad, 2.2);
        this.resolveWorldVehiclesCollision(npcCol, nRad, 2.2);
        if (this.worldObstaclesRig) {
          resolveSolidObstacleCollisions(this.worldObstaclesRig, npcCol, nRad, 2.2);
        }
        if (this.isInDesaSapaanArea(npcCol.x, npcCol.z)) {
          resolveCircleDesaVisualTerrain(this.archipelagoRig, npcCol, nRad, nPreY + 0.95);
          this.resolveDesaLivingSeparation(
            npcCol,
            nRad,
            getArchipelagoGroundY(npcCol.x, npcCol.z),
            undefined,
            undefined,
            npcId,
          );
          resolveObstacleBoxes(npcCol, nRad, this.villageRig.obstacles, nPreY, 2.2);
          this.resolveActiveDesaPickupBoxes(npcCol, nRad);
        }
        constrainToWalkableArchipelago(npcCol, nRad);
        npc.x = npcCol.x;
        npc.z = npcCol.z;
        npc.mesh.position.set(npc.x, getArchipelagoGroundY(npc.x, npc.z), npc.z);
      }

      const npcGroundY =
        npc.poseMode === 'stand' && npc.x === npc.standX && npc.z === npc.standZ
          ? npc.standY
          : getArchipelagoGroundY(npc.x, npc.z);
      npc.mesh.rotation.y = npc.yaw;
      npc.aura.group.position.set(npc.x, npcGroundY, npc.z);
      if (isOnDuty && (distHero < 180 || this.phase === 'title')) {
        const pulse = Math.sin(this.elapsed * 3.1 + npcIdx * 1.15);
        const beamWidthScale = 1 + pulse * 0.14;
        npc.aura.outerBeam.rotation.y += dt * 0.65;
        npc.aura.outerBeam.scale.set(beamWidthScale, 1, beamWidthScale);
        npc.aura.outerBeamMat.opacity = (isNightShift ? 0.3 : 0.22) + pulse * 0.06;
        npc.aura.innerBeamMat.opacity =
          (isNightShift ? 0.42 : 0.34) + Math.sin(this.elapsed * 4.5 + npcIdx) * 0.08;
        npc.aura.rayGroup.rotation.y += dt * 1.35;
        npc.aura.rayGroup.position.y = Math.sin(this.elapsed * 2.5 + npcIdx) * 0.22;
        npc.aura.rayMat.opacity = (isNightShift ? 0.52 : 0.42) + pulse * 0.1;
        npc.aura.ringInner.scale.setScalar(1 + pulse * 0.12);
        npc.aura.ringOuter.scale.setScalar(1.06 - pulse * 0.1);
        npc.aura.ringInnerMat.opacity = 0.65 + pulse * 0.18;
        npc.aura.ringOuterMat.opacity = 0.46 - pulse * 0.12;
        for (let mi = 0; mi < npc.aura.motes.length; mi++) {
          const m = npc.aura.motes[mi];
          const mPhase = this.elapsed * m.speed + m.phase + npcIdx * 0.8;
          const cycle = (mPhase * 0.45) % 1;
          const r = 1.32 + Math.sin(mPhase * 1.7) * 0.22;
          m.mesh.position.set(Math.cos(mPhase) * r, 0.75 + cycle * 4.1, Math.sin(mPhase) * r);
          m.mesh.rotation.y += dt * 2.6;
          m.mesh.scale.setScalar(0.75 + Math.sin(cycle * Math.PI) * 0.55);
        }
      }
      npc.alertMesh.visible = showAlert;
      if (showAlert && (distHero < 85 || this.phase === 'title')) {
        npc.alertMesh.position.set(
          npc.x,
          npcGroundY + 4.2 + Math.sin(this.elapsed * 3.5 + npc.x) * 0.28,
          npc.z,
        );
        npc.alertMesh.rotation.y += dt * 2.2;
      }
      const isNear = distHero < 5.5;
      if (distHero < 38 || npc.poseMode === 'walk') {
        animateZoneNpc(
          npc.mesh,
          isFleeingCar ? this.elapsed * 2.1 : this.elapsed,
          npcIdx * 1.15,
          isNear,
          dt,
          npc.poseMode,
        );
      }
      npcIdx++;
    }

    // Update idle NPC floating thought bubbles (only standing NPCs when not speaking)
    if (this.phase === 'playing') {
      if (this.npcThoughtTimer > 0 && this.npcThoughtId) {
        const thoughtNpc = this.npcs.get(this.npcThoughtId);
        const blockedBySpeech =
          this.npcThoughtId === this.nearbyNpcId ||
          !thoughtNpc ||
          thoughtNpc.poseMode !== 'stand';
        if (blockedBySpeech) {
          this.npcThoughtId = null;
          this.npcThoughtText = null;
          this.npcThoughtTimer = 0;
        } else {
          this.npcThoughtTimer = Math.max(0, this.npcThoughtTimer - dt);
          if (this.npcThoughtTimer === 0) {
            this.npcThoughtId = null;
            this.npcThoughtText = null;
            this.npcThoughtCooldown = 4.5 + Math.random() * 4.0;
          }
        }
      } else {
        this.npcThoughtCooldown -= dt;
        if (this.npcThoughtCooldown <= 0) {
          const candidates: string[] = [];
          for (const [id, npc] of this.npcs.entries()) {
            if (!this.isNpcOnDuty(npc.shift) || npc.poseMode !== 'stand' || id === this.nearbyNpcId) continue;
            const dHero = Math.hypot(this.heroPos.x - npc.x, this.heroPos.z - npc.z);
            if (dHero < 26) candidates.push(id);
          }
          if (candidates.length > 0) {
            const chosenId = candidates[Math.floor(Math.random() * candidates.length)];
            this.npcThoughtId = chosenId;
            this.npcThoughtText = this.pickNpcIdleThought(chosenId);
            this.npcThoughtTimer = 4.5;
          } else {
            this.npcThoughtCooldown = 3.0;
          }
        }
      }
    } else if (this.npcThoughtTimer > 0 || this.npcThoughtText) {
      this.npcThoughtId = null;
      this.npcThoughtText = null;
      this.npcThoughtTimer = 0;
    }

    const updateCollectibleMatrices = !throttleUpload || (this.animFrameCounter & 1) === 0;
    let anyCollectibleUpdated = false;
    for (let i = 0; i < this.collectibles.length; i++) {
      const c = this.collectibles[i];
      if (!c.active) {
        if (!c.matrixInit) {
          _dummy.position.set(0, -80, 0);
          _dummy.scale.setScalar(0.001);
          _dummy.updateMatrix();
          this.diamondInstanced.setMatrixAt(i, _dummy.matrix);
          this.heartInstanced.setMatrixAt(i, _dummy.matrix);
          c.matrixInit = true;
          anyCollectibleUpdated = true;
        }
        if (this.phase === 'playing') {
          c.respawnTimer -= dt;
          if (c.respawnTimer <= 0) {
            c.active = true;
            c.matrixInit = false;
          }
        }
        continue;
      }
      const dxH = this.heroPos.x - c.x;
      const dzH = this.heroPos.z - c.z;
      const dxC = camX - c.x;
      const dzC = camZ - c.z;
      const nearViewer = Math.min(dxH * dxH + dzH * dzH, dxC * dxC + dzC * dzC) <= 95 * 95;
      if (c.matrixInit && (!nearViewer || !updateCollectibleMatrices)) {
        continue;
      }

      _dummy.position.set(c.x, c.y + 1.3 + Math.sin(this.elapsed * 3.2 + c.phase) * 0.26, c.z);
      _dummy.rotation.set(0, this.elapsed * 2.2 + c.phase, 0);
      _dummy.scale.setScalar(1);
      _dummy.updateMatrix();

      if (c.kind === 'diamond') {
        this.diamondInstanced.setMatrixAt(i, _dummy.matrix);
        if (!c.matrixInit) {
          _dummy.position.set(0, -80, 0);
          _dummy.scale.setScalar(0.001);
          _dummy.updateMatrix();
          this.heartInstanced.setMatrixAt(i, _dummy.matrix);
        }
      } else {
        this.heartInstanced.setMatrixAt(i, _dummy.matrix);
        if (!c.matrixInit) {
          _dummy.position.set(0, -80, 0);
          _dummy.scale.setScalar(0.001);
          _dummy.updateMatrix();
          this.diamondInstanced.setMatrixAt(i, _dummy.matrix);
        }
      }
      c.matrixInit = true;
      anyCollectibleUpdated = true;
    }
    if (anyCollectibleUpdated) {
      this.diamondInstanced.instanceMatrix.needsUpdate = true;
      this.heartInstanced.instanceMatrix.needsUpdate = true;
    }
  }

  private updatePlaying(dt: number): void {
    this.autoSaveTimer += dt;
    if (this.autoSaveTimer >= 6.0) {
      this.autoSaveTimer = 0;
      this.saveProgress();
    }
    // Passive Regen timers (Bab 8)
    if (this.hp < this.maxHp) {
      this.hpRegenTimer += dt;
      if (this.hpRegenTimer >= DIFF_CONFIG[this.settings.difficulty].regenSec) {
        this.hpRegenTimer = 0;
        this.hp += 1;
        soundEngine.playPick();
        this.showBanner('Regenerasi Hati (+1 ❤️)!', 2.0);
      }
    } else {
      this.hpRegenTimer = 0;
    }

    const ambushActive = Boolean(this.villageAmbushState?.active && !this.villageAmbushState.resolved);
    if (this.ownedWeapons.has('ketapel') && this.weaponAmmo.ketapel < 5) {
      this.ketapelRegenTimer += dt;
      if (this.ketapelRegenTimer >= (ambushActive ? 4 : 20)) {
        this.ketapelRegenTimer = 0;
        this.weaponAmmo.ketapel += 1;
      }
    } else {
      this.ketapelRegenTimer = 0;
    }

    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    this.planeFireCooldown = Math.max(0, this.planeFireCooldown - dt);
    this.allyHelpCooldown = Math.max(0, this.allyHelpCooldown - dt);
    if (this.multiplayerActive && this.remotePeers.size > 0) {
      let bestInjured: NearbyInjuredPeer | null = null;
      let bestDist = 6.5;
      for (const peer of this.remotePeers.values()) {
        if (peer.state.worldMode !== this.worldMode) continue;
        const php = peer.state.hp;
        const pmhp = peer.state.maxHp;
        if (typeof php !== 'number' || typeof pmhp !== 'number' || php <= 0 || php >= pmhp) continue;
        const d = Math.hypot(peer.pos.x - this.heroPos.x, peer.pos.z - this.heroPos.z);
        if (d < bestDist) {
          bestDist = d;
          bestInjured = {
            uid: peer.state.uid,
            displayName: peer.state.displayName,
            hp: php,
            maxHp: pmhp,
            distance: Math.round(d * 10) / 10,
          };
        }
      }
      this.nearbyInjuredPeer = bestInjured;
    } else {
      this.nearbyInjuredPeer = null;
    }
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }
    if (this.jumpLandTimer > 0) {
      this.jumpLandTimer = Math.max(0, this.jumpLandTimer - dt);
    }
    if (this.hitMarkerTimer > 0) {
      this.hitMarkerTimer = Math.max(0, this.hitMarkerTimer - dt);
      if (this.hitMarkerTimer === 0) this.hitMarkerKind = 'none';
    }
    if (this.damageFlashTimer > 0) {
      this.damageFlashTimer = Math.max(0, this.damageFlashTimer - dt);
    }
    if (this.cameraShakeTimer > 0) {
      this.cameraShakeTimer = Math.max(0, this.cameraShakeTimer - dt);
    }
    this.recoilPitch = THREE.MathUtils.damp(this.recoilPitch, 0, 11, dt);
    this.crosshairSpread = THREE.MathUtils.damp(this.crosshairSpread, 0, 9, dt);

    const isManualAim = this.settings.aimMode === 'manual';
    const hasEquippedWeapon =
      this.activeHotbarSlot <= 7 && this.ownedWeapons.has(this.activeWeapon);
    if ((!hasEquippedWeapon || !isManualAim) && this.isAiming) {
      this.isAiming = false;
      this.aimToggled = false;
    }
    const wantAds =
      isManualAim &&
      this.isAiming &&
      hasEquippedWeapon &&
      (this.cameraMode === 'third_back' || this.cameraMode === 'first_person');
    this.aimBlend = THREE.MathUtils.damp(this.aimBlend, wantAds ? 1 : 0, 14, dt);

    if (!hasEquippedWeapon || (this.weaponAmmo[this.activeWeapon] || 0) <= 0) {
      this.pendingTurnShot = null;
      this.voiceAutoFire = false;
    }
    const continuousHold =
      this.carMode === 'none' &&
      this.planeMode === 'none' &&
      (this.hudFireHeld ||
        this.leftFireHeld ||
        this.voiceAutoFire ||
        this.heldKeys.has('Space'));
    if (continuousHold && this.fireCooldown <= 0 && !this.pendingTurnShot && hasEquippedWeapon) {
      this.fireActiveWeapon(true);
    }

    // 1. Movement (Car / Plane Physics OR On-Foot Keyboard + Analog + Voice + Tap-to-Move)
    let mx = 0;
    let mz = 0;
    const prevHeroY = this.heroPos.y;
    const wasAirborne = !this.heroOnGround;
    const wasSwimming = this.isSwimming;

    if (this.worldMode === 'overworld' && this.carMode !== 'none') {
      this.nearCar = true;
      this.nearPlaneId = null;
      soundEngine.setPlaneEngine(false, 0);
      this.updateCarPhysicsAndAnimation(dt);
    } else if (this.worldMode === 'overworld' && this.planeMode !== 'none') {
      this.nearCar = false;
      this.nearPlaneId = null;
      soundEngine.setCarEngine(false, 0);
      this.updatePlanePhysicsAndAnimation(dt);
    } else {
      mx = this.virtualMove.x;
      mz = -this.virtualMove.z; // screen up = +forward
      if (this.heldKeys.has('KeyW') || this.heldKeys.has('ArrowUp')) mz += 1;
      if (this.heldKeys.has('KeyS') || this.heldKeys.has('ArrowDown')) mz -= 1;
      if (this.heldKeys.has('KeyA') || this.heldKeys.has('ArrowLeft')) mx -= 1;
      if (this.heldKeys.has('KeyD') || this.heldKeys.has('ArrowRight')) mx += 1;

      const hasManualMove = Math.hypot(mx, mz) > 0.08;
      if (hasManualMove) {
        this.voiceMoveTimer = 0;
        this.voiceMoveVec = { x: 0, z: 0 };
        this.voiceSprint = false;
      if (this.diveTransition?.stage === 'swim_to_water') {
        this.diveTransition = null;
        this.pushHud(true);
      }
    } else if (this.voiceMoveTimer !== 0) {
      mx = this.voiceMoveVec.x;
      mz = this.voiceMoveVec.z;
      if (this.voiceMoveTimer > 0) {
        this.voiceMoveTimer = Math.max(0, this.voiceMoveTimer - dt);
        if (this.voiceMoveTimer === 0) {
          this.voiceMoveVec = { x: 0, z: 0 };
          this.voiceSprint = false;
        }
      }
    }

    if (Math.hypot(mx, mz) > 0.08) {
      this.tapMoveTarget = null;
      if (this.cameraMode === 'orbit') {
        this.camera.getWorldDirection(_forward);
        _forward.y = 0;
        if (_forward.lengthSq() < 0.001) _forward.set(0, 0, -1);
        _forward.normalize();
        _right.set(-_forward.z, 0, _forward.x).normalize();
      } else {
        _forward.set(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw));
        _right.set(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));
      }

      const isSprinting =
        (this.heldKeys.has('ShiftLeft') || this.heldKeys.has('ShiftRight') || this.voiceSprint) &&
        !wantAds;
      const swimSpeedByStyle: Record<SwimStyleId, number> = {
        surface_paddle: 0.72,
        front_crawl: 0.88,
        underwater_glide: 1.04,
        jump_dive: 0.92,
        deep_submerge: 0.78,
        scuba_explore: 0.82,
        water_tread: 0.58,
        quick_dodge: 0.96,
        water_dash: 1.14,
        backstroke: 0.62,
      };
      const swimPrefMult =
        this.swimStylePreference === 'auto'
          ? isSprinting
            ? 1.12
            : 0.86
          : isSprinting
          ? Math.max(swimSpeedByStyle[this.swimStylePreference], 1.04)
          : swimSpeedByStyle[this.swimStylePreference];
      const sprint = this.isSwimming
        ? swimPrefMult
        : isSprinting
        ? 1.35
        : wantAds
        ? 0.78
        : 1.0;
      _v3.set(0, 0, 0).addScaledVector(_forward, mz).addScaledVector(_right, mx);
      if (_v3.lengthSq() > 1) _v3.normalize();
      this.heroVel.addScaledVector(_v3, 76 * sprint * dt);
      if (
        this.cameraMode !== 'first_person' &&
        !wantAds &&
        this.shootAimTimer <= 0 &&
        !this.pendingTurnShot
      ) {
        const targetYaw = Math.atan2(_v3.x, _v3.z);
        let diff = targetYaw - this.heroYaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.heroYaw += diff * (1 - Math.exp(-15 * dt));
      }
    } else if (this.tapMoveTarget) {
      const dx = this.tapMoveTarget.x - this.heroPos.x;
      const dz = this.tapMoveTarget.z - this.heroPos.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.8) {
        this.tapMoveTarget = null;
      } else {
        _v3.set(dx / dist, 0, dz / dist);
        const tapSwimMult =
          this.swimStylePreference === 'auto'
            ? 1.15
            : this.swimStylePreference === 'water_dash' || this.swimStylePreference === 'underwater_glide'
            ? 1.4
            : 1.0;
        const tapAccel = this.isSwimming ? 54 * tapSwimMult : 72;
        this.heroVel.addScaledVector(_v3, tapAccel * dt);
        if (
          this.cameraMode !== 'first_person' &&
          !wantAds &&
          this.shootAimTimer <= 0 &&
          !this.pendingTurnShot
        ) {
          this.heroYaw = Math.atan2(_v3.x, _v3.z);
        }
      }
    }

    if (
      this.cameraMode === 'first_person' ||
      (this.cameraMode === 'third_back' &&
        isManualAim &&
        (wantAds || (this.shootAimTimer > 0 && !this.pendingTurnShot)))
    ) {
      const targetAimYaw = this.cameraYaw + Math.PI;
      let diff = targetAimYaw - this.heroYaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.heroYaw += diff * (1 - Math.exp(-22 * dt));
    } else if (this.shootAimYaw !== null && (this.shootAimTimer > 0 || this.pendingTurnShot)) {
      let diff = this.shootAimYaw - this.heroYaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const turnRate = this.pendingTurnShot ? 30 : 22;
      this.heroYaw += diff * (1 - Math.exp(-turnRate * dt));
      if (this.pendingTurnShot && Math.abs(diff) <= 0.14) {
        const pending = this.pendingTurnShot;
        this.pendingTurnShot = null;
        this.heroYaw = this.shootAimYaw;
        this.hero.body.rotation.y = this.heroYaw;
        if (hasEquippedWeapon && this.fireCooldown <= 0) {
          this.fireActiveWeapon(pending.fromHold, true);
        }
      }
    }

    this.heroVel.multiplyScalar(Math.exp(-(this.heroOnIce ? 1.85 : 7.5) * dt));
    const prevHeroX = this.heroPos.x;
    const prevHeroZ = this.heroPos.z;

    this.swimLeapTimer = Math.max(0, this.swimLeapTimer - dt);
    this.coyoteTimer = this.heroOnGround && !this.isSwimming ? 0.14 : Math.max(0, this.coyoteTimer - dt);

    if (!this.isSwimming) {
      this.heroVelY -= 28 * dt;
    }
    this.heroPos.addScaledVector(this.heroVel, dt);
    this.heroPos.y += this.heroVelY * dt;

    if (this.worldMode === 'ocean' && this.oceanRig) {
      this.heroOnIce = false;
      this.isSwimming = true;
      this.heroOnGround = false;
      this.swimLeapTimer = 0;

      // Boost movement speed from equipped diving gear & turtle mount
      let oceanSpeedMult = this.ridingTurtle ? 1.48 : 1.0;
      for (const gId of this.oceanGear) {
        oceanSpeedMult += DIVING_GEAR_DEFS[gId].speedBonus;
      }
      this.heroPos.x += this.heroVel.x * Math.max(0, oceanSpeedMult - 1) * dt;
      this.heroPos.z += this.heroVel.z * Math.max(0, oceanSpeedMult - 1) * dt;

      const upHeld =
        this.heldKeys.has('Space') || this.heldKeys.has('KeyJ') || this.oceanAscendHeld;
      const downHeld =
        this.heldKeys.has('ControlLeft') ||
        this.heldKeys.has('ControlRight') ||
        this.heldKeys.has('KeyZ') ||
        this.oceanDescendHeld;
      let targetVelY = 0;
      if (this.diveTransition?.active && this.diveTransition.stage === 'surface') {
        this.diveTransition.timer += dt;
        this.diveTransition.bubbleTimer += dt;
        targetVelY = 8.4;
        if (this.diveTransition.bubbleTimer >= 0.12) {
          this.diveTransition.bubbleTimer = 0;
          this.spawnBurst(this.heroPos.x, this.heroPos.y + 0.5, this.heroPos.z, 0xbae6fd, 6);
        }
      } else if (upHeld && !downHeld) {
        targetVelY = 6.4 * (this.ridingTurtle ? 1.2 : 1.0);
      } else if (downHeld && !upHeld) {
        targetVelY = -6.4 * (this.ridingTurtle ? 1.2 : 1.0);
      } else if (Math.hypot(mx, mz) > 0.12 && this.cameraMode !== 'orbit') {
        targetVelY = THREE.MathUtils.clamp(-Math.sin(this.cameraPitch) * 3.8, -3.5, 3.5);
      }
      this.heroVelY = THREE.MathUtils.damp(this.heroVelY, targetVelY, 8.5, dt);
      this.heroPos.y += this.heroVelY * dt;

      this.heroPos.x = THREE.MathUtils.clamp(this.heroPos.x, -42, 42);
      this.heroPos.z = THREE.MathUtils.clamp(this.heroPos.z, -49, 36);
      const seabedY = getOceanFloorY(this.heroPos.x, this.heroPos.z) + 0.45;
      this.heroPos.y = THREE.MathUtils.clamp(this.heroPos.y, seabedY, -1.05);
      resolveOceanSolidCollisions(this.heroPos, this.oceanRig.colliders, 0.68, 2.2);

      if (
        this.diveTransition?.active &&
        this.diveTransition.stage === 'surface' &&
        (this.heroPos.y >= -1.18 || this.diveTransition.timer >= 2.6)
      ) {
        this.diveTransition = null;
        this.exitOceanToSurface();
        return;
      }

      // Dynamic underwater lighting & fog transitioning smoothly from sunny Coral Sanctuary to Abyssal Trench
      const depthRatio = THREE.MathUtils.clamp((-this.heroPos.y - 2) / 23, 0, 1);
      const zAbyssRatio = THREE.MathUtils.clamp((-this.heroPos.z + 2) / 42, 0, 1);
      const darkT = Math.min(1, Math.max(depthRatio * 0.72, zAbyssRatio * 0.85));
      _skyColorScratch.setHex(0x0e7490).lerp(_skyNightCol, darkT * 0.86);
      if (this.diveTransition?.active && this.diveTransition.stage === 'surface') {
        const surfT = THREE.MathUtils.clamp((this.heroPos.y + 4.5) / 3.4, 0, 1);
        _skyColorScratch.lerp(_skyDayCol, surfT * 0.65);
      }
      if (this.scene.background instanceof THREE.Color) {
        this.scene.background.copy(_skyColorScratch);
      }
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.copy(_skyColorScratch);
        this.scene.fog.density = 0.011 + darkT * 0.021;
      }
      this.hemiLight.intensity = THREE.MathUtils.lerp(1.12, 0.44, darkT);
      this.sunLight.intensity = THREE.MathUtils.lerp(1.28, 0.28, darkT);

      // Update animated corals, bubbles, sunbeams, air vents, chests, pickups & 20 solid sea biota
      updateOceanWorld(
        this.oceanRig,
        dt,
        this.elapsed,
        this.heroPos,
        this.heroYaw,
        this.oceanGear,
        this.isMobileDevice || this.isLowEndMobile || this.settings.fxLevel !== 'full',
        this.ridingTurtle,
      );

      // Separate Hero from abyssal sea predators so neither swims through the other's body
      for (const m of this.oceanMonsters) {
        if (!m.alive) continue;
        const my = m.y ?? MONSTER_SPECS[m.type].hoverY;
        if (Math.abs(this.heroPos.y + 0.6 - my) > 2.2) continue;
        const spec = MONSTER_SPECS[m.type];
        const minD = 0.68 + spec.hitRadius * 0.72;
        const dx = this.heroPos.x - m.x;
        const dz = this.heroPos.z - m.z;
        const dSq = dx * dx + dz * dz;
        if (dSq >= minD * minD) continue;
        const d = dSq > 0.0001 ? Math.sqrt(dSq) : 0.01;
        const nx = dSq > 0.0001 ? dx / d : 1;
        const nz = dSq > 0.0001 ? dz / d : 0;
        const push = minD - d;
        if (m.type === 'charybdis_maw') {
          this.heroPos.x += nx * push;
          this.heroPos.z += nz * push;
        } else {
          this.heroPos.x += nx * push * 0.55;
          this.heroPos.z += nz * push * 0.55;
          m.x -= nx * push * 0.45;
          m.z -= nz * push * 0.45;
          m.mesh.position.set(m.x, my, m.z);
        }
      }
      this.heroPos.x = THREE.MathUtils.clamp(this.heroPos.x, -42, 42);
      this.heroPos.z = THREE.MathUtils.clamp(this.heroPos.z, -49, 36);
      resolveOceanSolidCollisions(this.heroPos, this.oceanRig.colliders, 0.68, 2.2);
      this.heroPos.y = THREE.MathUtils.clamp(
        this.heroPos.y,
        getOceanFloorY(this.heroPos.x, this.heroPos.z) + 0.45,
        -1.05,
      );

      // Oxygen survival check: unlimited O₂ when wearing Swimsuit or Diving Gear; only drains if diving without equipment!
      const maxO2 = this.getOceanMaxOxygen();
      if (this.hasUnlimitedOceanOxygen()) {
        this.oceanOxygen = maxO2;
        this.oceanSuffocateTimer = 0;
      } else {
        let nearAirRefill = this.heroPos.y >= -2.15;
        if (!nearAirRefill) {
          for (const vent of this.oceanRig.airVents) {
            if (
              Math.hypot(this.heroPos.x - vent.x, this.heroPos.z - vent.z) < 4.4 &&
              this.heroPos.y <= vent.y + 8.5
            ) {
              nearAirRefill = true;
              break;
            }
          }
        }
        if (nearAirRefill) {
          this.oceanOxygen = Math.min(maxO2, this.oceanOxygen + 44 * dt);
          this.oceanSuffocateTimer = 0;
        } else {
          const depthPressure = 1.0 + Math.max(0, -this.heroPos.y - 3) * 0.085;
          const drainRate = 3.8 * depthPressure;
          this.oceanOxygen = Math.max(0, this.oceanOxygen - drainRate * dt);
          if (this.oceanOxygen <= 0) {
            this.oceanSuffocateTimer += dt;
            if (this.oceanSuffocateTimer >= 2.0) {
              this.oceanSuffocateTimer = 0;
              this.hp = Math.max(0, this.hp - 1);
              soundEngine.playHurt();
              this.spawnBurst(this.heroPos.x, this.heroPos.y + 1.2, this.heroPos.z, 0x38bdf8, 12);
              this.showBanner(
                '🫧 Kehabisan napas! Cari Gelembung O₂, naik ke permukaan, atau ambil Pakaian Renang! (-1 ❤️)',
                2.5,
              );
              this.triggerDamageFlash(1, 'Kehabisan oksigen di bawah laut');
              if (this.hp <= 0) {
                this.triggerDefeatExit();
                return;
              }
            }
          } else {
            this.oceanSuffocateTimer = 0;
          }
        }
      }

      if (this.fireCoralStingTimer > 0) {
        this.fireCoralStingTimer = Math.max(0, this.fireCoralStingTimer - dt);
      }

      // Collect underwater Hearts, Diamonds, and Weapons
      for (const pk of this.oceanRig.pickups) {
        if (!pk.active) continue;
        const dp = Math.hypot(
          this.heroPos.x - pk.x,
          this.heroPos.y + 0.85 - pk.y,
          this.heroPos.z - pk.z,
        );
        if (dp < 2.25) {
          this.collectOceanPickup(pk);
        }
      }

      // Discover all 20 Sea Biota & detect nearest interactables
      let bestBiota: OceanBiotaNode | null = null;
      let bestBiotaDist = 4.0;
      let nearTurtle = false;
      for (const node of this.oceanRig.biotaNodes) {
        const d3 = Math.hypot(
          this.heroPos.x - node.x,
          this.heroPos.y + 0.6 - node.y,
          this.heroPos.z - node.z,
        );
        if (d3 < 6.5 && !this.discoveredBiota.has(node.speciesId)) {
          this.discoveredBiota.add(node.speciesId);
          this.gainXp(10);
          this.addScore(35);
          soundEngine.playPick();
          const info = SEA_BIOTA_BY_ID[node.speciesId];
          this.showBanner(
            `🐠 Biota Baru Ditemukan: ${info?.indoName ?? node.speciesId} (${this.discoveredBiota.size}/20)!`,
            3.0,
          );
          this.saveProgress();
        }
        if (node.speciesId === 'fire_coral' && d3 < 1.9 && this.fireCoralStingTimer <= 0) {
          this.fireCoralStingTimer = 2.8;
          this.hp = Math.max(0, this.hp - 1);
          soundEngine.playHurt();
          this.spawnBurst(this.heroPos.x, this.heroPos.y + 0.9, this.heroPos.z, 0xf97316, 12);
          this.showBanner('🔥 Tersengat Karang Api! Menjauh sedikit dari koral jingga (-1 ❤️)', 2.4);
          this.triggerDamageFlash(1, 'Sengatan Karang Api', { x: node.x, z: node.z });
          if (this.hp <= 0) {
            this.triggerDefeatExit();
            return;
          }
        }
        if (node.speciesId === 'sea_turtle' && d3 < 4.4) {
          nearTurtle = true;
        }
        const entry = SEA_BIOTA_BY_ID[node.speciesId];
        const canInteract =
          Boolean(entry?.mountable) ||
          (Boolean(entry?.yieldKind) && node.harvestCooldown <= 0);
        if (canInteract && d3 < bestBiotaDist) {
          bestBiotaDist = d3;
          bestBiota = node;
        }
      }
      this.nearBiotaNode = bestBiota;
      this.nearOceanTurtle = nearTurtle;

      let bestChest: OceanSupplyChest | null = null;
      let bestChestDist = 4.2;
      for (const ch of this.oceanRig.chests) {
        if (ch.opened) continue;
        const dc = Math.hypot(
          this.heroPos.x - ch.x,
          this.heroPos.y + 0.5 - ch.y,
          this.heroPos.z - ch.z,
        );
        if (dc < 2.35) {
          this.interactWithOceanChest(ch);
          break;
        }
        if (dc < bestChestDist) {
          bestChestDist = dc;
          bestChest = ch;
        }
      }
      this.nearOceanChest = bestChest;
    } else if (this.worldMode !== 'overworld') {
      this.heroOnIce = false;
      this.isSwimming = false;
      this.swimLeapTimer = 0;
      const roomBound = this.worldMode === 'academy' ? 23.0 : 18.5;
      this.heroPos.x = THREE.MathUtils.clamp(this.heroPos.x, -roomBound, roomBound);
      this.heroPos.z = THREE.MathUtils.clamp(this.heroPos.z, -roomBound, roomBound);
      if (this.worldMode === 'dungeon' && this.dungeonRig) {
        this.resolveCaveBlockCollisions();
        for (const m of this.dungeonMonsters) {
          if (!m.alive) continue;
          if (!m.isCaveMob && !m.combatOnly && this.encounterGraceTimer <= 0) continue;
          const minD = 0.68 + MONSTER_SPECS[m.type].hitRadius * 0.65;
          const dx = this.heroPos.x - m.x;
          const dz = this.heroPos.z - m.z;
          const dSq = dx * dx + dz * dz;
          if (dSq < minD * minD && dSq > 0.0001) {
            const d = Math.sqrt(dSq);
            const push = (minD - d) * 0.55;
            this.heroPos.x += (dx / d) * push;
            this.heroPos.z += (dz / d) * push;
          }
        }
        for (const s of this.shooters) {
          if (!s.alive) continue;
          const dx = this.heroPos.x - s.x;
          const dz = this.heroPos.z - s.z;
          const dSq = dx * dx + dz * dz;
          if (dSq < 1.05 * 1.05 && dSq > 0.0001) {
            const d = Math.sqrt(dSq);
            this.heroPos.x += (dx / d) * (1.05 - d);
            this.heroPos.z += (dz / d) * (1.05 - d);
          }
        }
      } else if (this.worldMode === 'academy' && this.academyRig) {
        const heroRadAc = 0.72;
        for (const col of this.academyRig.colliders) {
          if (col.maxY <= 0.7 && prevHeroY >= col.maxY - 0.65) continue;
          if (this.heroPos.y >= col.maxY - 0.15) continue;
          const cx = THREE.MathUtils.clamp(this.heroPos.x, col.x - col.halfW, col.x + col.halfW);
          const cz = THREE.MathUtils.clamp(this.heroPos.z, col.z - col.halfD, col.z + col.halfD);
          const dx = this.heroPos.x - cx;
          const dz = this.heroPos.z - cz;
          const dSq = dx * dx + dz * dz;
          if (dSq < heroRadAc * heroRadAc) {
            if (dSq > 0.0001) {
              const d = Math.sqrt(dSq);
              this.heroPos.x += (dx / d) * (heroRadAc - d);
              this.heroPos.z += (dz / d) * (heroRadAc - d);
            } else {
              this.heroPos.z = col.z + col.halfD + heroRadAc;
            }
          }
        }
        for (const npc of this.academyNpcs.values()) {
          const dx = this.heroPos.x - npc.x;
          const dz = this.heroPos.z - npc.z;
          const dSq = dx * dx + dz * dz;
          if (dSq < 1.05 * 1.05 && dSq > 0.0001) {
            const d = Math.sqrt(dSq);
            this.heroPos.x += (dx / d) * (1.05 - d);
            this.heroPos.z += (dz / d) * (1.05 - d);
          }
        }
        for (const cit of this.academyCitizens) {
          const dx = this.heroPos.x - cit.x;
          const dz = this.heroPos.z - cit.z;
          const dSq = dx * dx + dz * dz;
          if (dSq < 0.98 * 0.98 && dSq > 0.0001) {
            const d = Math.sqrt(dSq);
            this.heroPos.x += (dx / d) * (0.98 - d);
            this.heroPos.z += (dz / d) * (0.98 - d);
          }
        }
      }
      const supportY = this.getDungeonSupportHeight(this.heroPos.x, this.heroPos.z, prevHeroY);
      if (this.heroPos.y <= supportY) {
        this.heroPos.y = supportY;
        this.heroVelY = 0;
        this.heroOnGround = true;
      } else {
        this.heroOnGround = false;
      }
    } else {
      constrainHeroToWorldBounds(this.heroPos, 0.85);

      // 3D Step-Up vs Cliff-Wall Sliding: allow beaches/docks (<=0.95m) from water, swim-leaps to mantle ledges, and stairs on land!
      const climbLimit =
        wasSwimming || this.swimLeapTimer > 0
          ? this.heroPos.y < -1.65
            ? prevHeroY + 0.85
            : Math.max(0.95, Math.max(prevHeroY, this.heroPos.y) + 1.15)
          : prevHeroY + 1.02;
      const isUnderElevatedDeck = (s: ReturnType<typeof sampleArchipelagoTerrain>): boolean =>
        s.isLandOrBridge && !s.isDryLand && prevHeroY < s.groundY - 1.35 && this.heroVelY <= 1.5;

      const trySample = sampleArchipelagoTerrain(this.heroPos.x, this.heroPos.z);
      if (trySample.isLandOrBridge && !isUnderElevatedDeck(trySample) && trySample.groundY > climbLimit) {
        const sX = sampleArchipelagoTerrain(this.heroPos.x, prevHeroZ);
        const sZ = sampleArchipelagoTerrain(prevHeroX, this.heroPos.z);
        const canX = !sX.isLandOrBridge || isUnderElevatedDeck(sX) || sX.groundY <= climbLimit;
        const canZ = !sZ.isLandOrBridge || isUnderElevatedDeck(sZ) || sZ.groundY <= climbLimit;
        if (canX && (!canZ || Math.abs(this.heroPos.x - prevHeroX) >= Math.abs(this.heroPos.z - prevHeroZ))) {
          this.heroPos.z = prevHeroZ;
          this.heroVel.z = 0;
        } else if (canZ) {
          this.heroPos.x = prevHeroX;
          this.heroVel.x = 0;
        } else {
          this.heroPos.x = prevHeroX;
          this.heroPos.z = prevHeroZ;
          this.heroVel.x = 0;
          this.heroVel.z = 0;
        }
      }

      // 8-direction body-radius terrain cliff wall separation so limbs/weapon never clip into raised ledges
      const rWall = 0.62;
      const resolveHeroTerrainWalls = () => {
        for (let iter = 0; iter < 2; iter++) {
          let pushX = 0;
          let pushZ = 0;
          let blocked = 0;
          for (let i = 0; i < 8; i++) {
            const ang = (i / 8) * Math.PI * 2;
            const dx = Math.cos(ang);
            const dz = Math.sin(ang);
            const s = sampleArchipelagoTerrain(this.heroPos.x + dx * rWall, this.heroPos.z + dz * rWall);
            if (s.isLandOrBridge && !isUnderElevatedDeck(s) && s.groundY > climbLimit) {
              pushX -= dx;
              pushZ -= dz;
              blocked++;
            }
          }
          if (blocked === 0) break;
          const len = Math.hypot(pushX, pushZ);
          if (len > 0.001) {
            const nx = pushX / len;
            const nz = pushZ / len;
            this.heroPos.x += nx * 0.24;
            this.heroPos.z += nz * 0.24;
            const dot = this.heroVel.x * nx + this.heroVel.z * nz;
            if (dot < 0) {
              this.heroVel.x -= nx * dot;
              this.heroVel.z -= nz * dot;
            }
          }
        }
      };
      resolveHeroTerrainWalls();
      if (this.isInDesaSapaanArea(this.heroPos.x, this.heroPos.z)) {
        resolveCircleDesaVisualTerrain(this.archipelagoRig, this.heroPos, 0.58, climbLimit);
      }

      // Resolve smooth collisions against cottages, rocks, fences, towers & walls
      const heroRad = 0.62;
      resolveObstacleBoxes(this.heroPos, heroRad, this.villageRig.obstacles, this.heroPos.y, 2.2);
      this.resolveActiveDesaPickupBoxes(this.heroPos, heroRad);

      // Prevent clipping through moving & parked vehicles (Bus, Sedan, Taxi, Police Car, Minecart)
      const vehicleCol = resolveArchipelagoVehicleCollisions(
        this.archipelagoRig,
        this.heroPos,
        heroRad,
        2.2,
      );
      this.resolveHeroParkedCarCollision();

      // Prevent clipping through solid obstacle housings (pistons, vents, turrets, lasers, moving platform sides)
      if (this.worldObstaclesRig) {
        resolveSolidObstacleCollisions(this.worldObstaclesRig, this.heroPos, heroRad, 2.2);
      }

      const pushHeroCircle = (ex: number, ey: number, ez: number, minD: number, verticalTol = 2.2) => {
        if (Math.abs(this.heroPos.y - ey) > verticalTol) return;
        const dx = this.heroPos.x - ex;
        if (dx > minD || dx < -minD) return;
        const dz = this.heroPos.z - ez;
        if (dz > minD || dz < -minD) return;
        const dSq = dx * dx + dz * dz;
        if (dSq >= minD * minD) return;
        if (dSq > 0.0001) {
          const d = Math.sqrt(dSq);
          this.heroPos.x += (dx / d) * (minD - d);
          this.heroPos.z += (dz / d) * (minD - d);
        } else {
          this.heroPos.z += minD;
        }
      };

      // Prevent Hero from walking straight through Quest NPCs
      for (const npc of this.npcs.values()) {
        if (npc.koTimer > 0 || !this.isNpcOnDuty(npc.shift)) continue;
        const ny = getArchipelagoGroundY(npc.x, npc.z);
        pushHeroCircle(npc.x, ny, npc.z, 1.05, 2.4);
      }

      // Prevent Hero from walking through Villagers, Golems, Llamas, Critters & Pillagers
      for (const v of this.villageRig.villagers) {
        if (!v.alive || !v.root.visible || v.drivingVehicleId) continue;
        pushHeroCircle(v.x, v.root.position.y, v.z, 1.02);
      }
      for (const g of this.villageRig.golems) {
        if (!g.root.visible) continue;
        pushHeroCircle(g.x, g.root.position.y, g.z, 1.38, 2.8);
      }
      for (const l of this.villageRig.llamas) {
        if (!l.root.visible) continue;
        pushHeroCircle(l.root.position.x, l.root.position.y, l.root.position.z, 1.12);
      }
      for (const c of this.villageRig.critters) {
        if (!c.root.visible) continue;
        pushHeroCircle(c.root.position.x, c.root.position.y, c.root.position.z, 0.88, 1.8);
      }
      for (const p of this.villageRig.pillagers) {
        if (!p.root.visible) continue;
        pushHeroCircle(p.root.position.x, p.root.position.y, p.root.position.z, 1.05);
      }
      for (const zc of this.archipelagoRig.zooCritters) {
        if (!zc.root.visible) continue;
        pushHeroCircle(zc.root.position.x, zc.root.position.y, zc.root.position.z, 1.38, 2.8);
      }
      for (const s of this.shooters) {
        if (!s.alive) continue;
        pushHeroCircle(s.x, getArchipelagoGroundY(s.x, s.z), s.z, 1.05);
      }
      for (const m of this.monsters) {
        if (!m.alive) continue;
        const inDesa = this.isInDesaSapaanArea(m.x, m.z);
        if (!m.isCaveMob && !m.combatOnly && this.encounterGraceTimer <= 0 && !inDesa) continue;
        const spec = MONSTER_SPECS[m.type];
        const minD =
          !m.combatOnly && inDesa
            ? Math.min(2.05, 0.68 + spec.hitRadius * 0.65)
            : 0.68 + spec.hitRadius * 0.65;
        const my = m.y ?? getArchipelagoGroundY(m.x, m.z);
        pushHeroCircle(m.x, my, m.z, minD, 2.4);
      }

      if (this.multiplayerActive && this.remotePeers.size > 0) {
        for (const peer of this.remotePeers.values()) {
          if (peer.state.worldMode !== this.worldMode) continue;
          pushHeroCircle(peer.pos.x, peer.pos.y, peer.pos.z, 1.05, 2.2);
        }
      }

      if (this.isInDesaSapaanArea(this.heroPos.x, this.heroPos.z)) {
        resolveObstacleBoxes(this.heroPos, heroRad, this.villageRig.obstacles, this.heroPos.y, 2.2);
        this.resolveActiveDesaPickupBoxes(this.heroPos, heroRad);
        resolveArchipelagoVehicleCollisions(this.archipelagoRig, this.heroPos, heroRad, 2.2);
        this.resolveHeroParkedCarCollision();
        if (this.worldObstaclesRig) {
          resolveSolidObstacleCollisions(this.worldObstaclesRig, this.heroPos, heroRad, 2.2);
        }
        resolveCircleDesaVisualTerrain(this.archipelagoRig, this.heroPos, 0.58, climbLimit);
      }

      resolveHeroTerrainWalls();

      // Ensure obstacle/vehicle/entity push never shoves hero inside an unclimbable steep cliff wall
      const postPushSample = sampleArchipelagoTerrain(this.heroPos.x, this.heroPos.z);
      if (
        postPushSample.isLandOrBridge &&
        !isUnderElevatedDeck(postPushSample) &&
        postPushSample.groundY > climbLimit
      ) {
        this.heroPos.x = prevHeroX;
        this.heroPos.z = prevHeroZ;
        this.heroVel.x = 0;
        this.heroVel.z = 0;
      }

      const curSample = sampleArchipelagoTerrain(this.heroPos.x, this.heroPos.z);
      const obsSupportY = this.worldObstaclesRig
        ? getObstacleSupportHeight(this.worldObstaclesRig, this.heroPos.x, this.heroPos.z, prevHeroY)
        : null;
      let combinedSupportY: number | null = obsSupportY;
      if (vehicleCol.supportY !== null) {
        combinedSupportY =
          combinedSupportY === null ? vehicleCol.supportY : Math.max(combinedSupportY, vehicleCol.supportY);
      }
      const hasObsSupport = combinedSupportY !== null && this.heroPos.y >= combinedSupportY - 1.35;
      const effGroundY = hasObsSupport ? Math.max(curSample.groundY, combinedSupportY!) : curSample.groundY;
      const effLandOrBridge = curSample.isLandOrBridge || hasObsSupport;
      const effSurface = hasObsSupport && combinedSupportY! >= curSample.groundY ? 'bridge' : curSample.surface;

      const underDeckNow =
        curSample.isLandOrBridge &&
        !curSample.isDryLand &&
        !hasObsSupport &&
        prevHeroY < curSample.groundY - 1.35 &&
        !(this.swimLeapTimer > 0 && this.heroVelY > 0.5);
      const inWaterZone = !effLandOrBridge || effGroundY < -0.15 || underDeckNow;
      // Lower pivot so swimming poses skim at water surface y=0; raise pivot when riding sea turtle so shell stays above water!
      const floatOffset =
        this.activeSwimStyle === 'deep_submerge' || this.activeSwimStyle === 'underwater_glide'
          ? -0.04
          : this.activeSwimStyle === 'backstroke' || this.activeSwimStyle === 'surface_paddle'
          ? 0.03
          : 0;
      const SWIM_FLOAT_Y = this.ridingTurtle ? -0.58 : -1.16 + floatOffset;

      const activeDiveSubmerge =
        this.diveTransition?.active &&
        (this.diveTransition.stage === 'plunge' ||
          this.diveTransition.stage === 'submerge' ||
          this.diveTransition.stage === 'surface');

      if (
        (inWaterZone || activeDiveSubmerge) &&
        this.heroPos.y <= 0.14 &&
        !(this.swimLeapTimer > 0.18 && this.heroVelY > 1.8)
      ) {
        this.isSwimming = true;
        this.heroOnGround = false;
        this.swimLeapTimer = 0;
        if (!wasSwimming) {
          const wasCannonball = this.activeJumpTrick === 'cannonball';
          if (!this.jumpToSwimPlayedForAir) {
            soundEngine.playSplash(
              wasCannonball ? 1.3 : Math.min(1.3, 0.72 + Math.abs(this.heroVelY) * 0.06),
            );
          }
          this.spawnBurst(
            this.heroPos.x,
            0.14,
            this.heroPos.z,
            0xbae6fd,
            wasCannonball ? 26 : 15,
          );
          if (prevHeroY > -0.25 && this.heroVelY < -2.2) {
            this.swimDiveTimer = 0.72;
          }
          this.activeJumpTrick = null;
          this.jumpTrickElapsed = 0;
          this.jumpToSwimPlayedForAir = false;
          this.heroVelY *= 0.25;
        }
        const localSeabedY = getArchipelagoSeabedY(this.heroPos.x, this.heroPos.z);
        const upHeld =
          this.heldKeys.has('Space') || this.heldKeys.has('KeyJ') || this.oceanAscendHeld;
        const downHeld =
          this.heldKeys.has('ControlLeft') ||
          this.heldKeys.has('ControlRight') ||
          this.heldKeys.has('KeyZ') ||
          this.oceanDescendHeld;

        if (this.diveTransition?.active && this.diveTransition.stage === 'plunge') {
          this.diveTransition.timer += dt;
          const p = THREE.MathUtils.clamp(this.diveTransition.timer / 0.48, 0, 1);
          const targetDiveY = Math.max(
            localSeabedY + 0.55,
            THREE.MathUtils.lerp(-1.16, -2.15, p),
          );
          this.heroVelY = (targetDiveY - this.heroPos.y) * 10;
          this.heroPos.y += this.heroVelY * dt;
          _forward.set(Math.sin(this.heroYaw), 0, Math.cos(this.heroYaw));
          this.heroPos.addScaledVector(_forward, 2.4 * dt);
          this.diveTransition.bubbleTimer += dt;
          if (this.diveTransition.bubbleTimer >= 0.1) {
            this.diveTransition.bubbleTimer = 0;
            this.spawnBurst(this.heroPos.x, 0.08, this.heroPos.z, 0xbae6fd, 7);
          }
          if (p >= 1) {
            this.diveTransition.stage = 'submerge';
            this.diveTransition.timer = 0;
            this.diveTransition.bubbleTimer = 0;
          }
        } else if (this.diveTransition?.active && this.diveTransition.stage === 'submerge') {
          this.diveTransition.timer += dt;
          const p = THREE.MathUtils.clamp(this.diveTransition.timer / 1.35, 0, 1);
          const eased = p * p * (3 - 2 * p);
          const diveGoalY = Math.max(localSeabedY + 0.65, -4.6);
          const targetSubY = THREE.MathUtils.lerp(-2.15, diveGoalY, eased);
          this.heroVelY = (targetSubY - this.heroPos.y) * 9;
          this.heroPos.y += this.heroVelY * dt;
          _forward.set(Math.sin(this.heroYaw), 0, Math.cos(this.heroYaw));
          this.heroPos.addScaledVector(_forward, 2.8 * dt);
          this.diveTransition.bubbleTimer += dt;
          if (this.diveTransition.bubbleTimer >= 0.12) {
            this.diveTransition.bubbleTimer = 0;
            this.spawnBurst(this.heroPos.x, this.heroPos.y + 0.45, this.heroPos.z, 0x67e8f9, 8);
          }
          if (p >= 1) {
            this.diveTransition = null;
            this.heroDiveActive = true;
            this.showBanner(
              '🌊 Kamu berada di bawah laut! Berenang bebas antar-pulau atau tekan Naik kapan saja.',
              3.0,
            );
            this.pushHud(true);
          }
        } else if (this.diveTransition?.active && this.diveTransition.stage === 'surface') {
          this.diveTransition.timer += dt;
          this.diveTransition.bubbleTimer += dt;
          this.heroVelY = THREE.MathUtils.damp(this.heroVelY, 7.4, 8.5, dt);
          this.heroPos.y = THREE.MathUtils.clamp(
            this.heroPos.y + this.heroVelY * dt,
            localSeabedY + 0.45,
            -1.05,
          );
          if (this.diveTransition.bubbleTimer >= 0.12) {
            this.diveTransition.bubbleTimer = 0;
            this.spawnBurst(this.heroPos.x, this.heroPos.y + 0.45, this.heroPos.z, 0xbae6fd, 6);
          }
          if (this.heroPos.y >= -1.24 || this.diveTransition.timer >= 4.2) {
            this.diveTransition = null;
            this.heroDiveActive = false;
            this.ridingTurtle = false;
            this.heroPos.y = Math.max(-1.18, this.heroPos.y);
            this.heroVelY = 1.6;
            this.activeSwimStyle = 'surface_paddle';
            this.spawnBurst(this.heroPos.x, 0.16, this.heroPos.z, 0xbae6fd, 22);
            soundEngine.playSplash(0.95);
            this.showBanner('🌊 Berhasil berenang naik ke permukaan laut!', 2.4);
            this.saveProgress();
            this.pushHud(true);
          }
        } else {
          if (!this.heroDiveActive && downHeld && !upHeld && this.swimSuitPicked) {
            this.heroDiveActive = true;
          }
          if (this.heroDiveActive) {
            let oceanSpeedMult = this.ridingTurtle ? 1.48 : 1.0;
            for (const gId of this.oceanGear) {
              oceanSpeedMult += DIVING_GEAR_DEFS[gId].speedBonus;
            }
            this.heroPos.x += this.heroVel.x * Math.max(0, oceanSpeedMult - 1) * dt;
            this.heroPos.z += this.heroVel.z * Math.max(0, oceanSpeedMult - 1) * dt;

            let targetVelY = 0;
            if (upHeld && !downHeld) {
              targetVelY = 6.4 * (this.ridingTurtle ? 1.2 : 1.0);
            } else if (downHeld && !upHeld) {
              targetVelY = -6.4 * (this.ridingTurtle ? 1.2 : 1.0);
            } else if (Math.hypot(mx, mz) > 0.12 && this.cameraMode !== 'orbit') {
              targetVelY = THREE.MathUtils.clamp(-Math.sin(this.cameraPitch) * 3.8, -3.5, 3.5);
            }
            this.heroVelY = THREE.MathUtils.damp(this.heroVelY, targetVelY, 8.5, dt);
            this.heroPos.y = THREE.MathUtils.clamp(
              this.heroPos.y + this.heroVelY * dt,
              localSeabedY + 0.45,
              this.ridingTurtle ? -0.58 : -1.05,
            );
            if (this.heroPos.y >= (this.ridingTurtle ? -0.66 : -1.22) && (upHeld || this.heroVelY > 0.35)) {
              this.heroDiveActive = false;
            }
          } else {
            if (this.ridingTurtle) {
              this.heroPos.x += this.heroVel.x * 0.48 * dt;
              this.heroPos.z += this.heroVel.z * 0.48 * dt;
            }
            const waveBobY = SWIM_FLOAT_Y + Math.sin(this.elapsed * 3.1 + this.heroPos.x * 0.2) * 0.07;
            this.heroVelY += (waveBobY - this.heroPos.y) * 20 * dt;
            this.heroVelY *= Math.exp(-6.5 * dt);
            this.heroPos.y += this.heroVelY * dt;
          }
        }
      } else {
        const shoreOrLeap = wasSwimming || this.swimLeapTimer > 0;
        const bridgeLedgeCatch =
          (effSurface === 'bridge' || effSurface === 'parkour') && this.heroVelY <= 2.0 ? 0.42 : 0.12;
        const aboveCatch = shoreOrLeap && effGroundY <= 2.9 ? 1.15 : bridgeLedgeCatch;
        const belowCatch = shoreOrLeap && effGroundY <= 2.9 ? 1.45 : 1.05;
        const canStandOnSolid =
          !inWaterZone &&
          this.heroPos.y <= effGroundY + aboveCatch &&
          (this.heroPos.y >= effGroundY - belowCatch ||
            (curSample.isDryLand && (!wasSwimming || effGroundY <= climbLimit)));
        if (canStandOnSolid) {
          this.heroPos.y = effGroundY;
          this.heroVelY = 0;
          this.heroOnGround = true;
          this.isSwimming = false;
          this.heroDiveActive = false;
          this.ridingTurtle = false;
          if (this.diveTransition?.stage !== 'swim_to_water') {
            this.diveTransition = null;
          }
          this.swimLeapTimer = 0;
        } else if (
          !inWaterZone &&
          !wasAirborne &&
          !wasSwimming &&
          effGroundY < prevHeroY &&
          prevHeroY - effGroundY <= 0.85 &&
          this.heroVelY <= 0.25
        ) {
          this.heroPos.y = effGroundY;
          this.heroVelY = 0;
          this.heroOnGround = true;
          this.isSwimming = false;
          this.heroDiveActive = false;
          this.ridingTurtle = false;
        } else {
          this.heroOnGround = false;
          this.isSwimming = false;
        }
      }

      if (this.worldObstaclesRig) {
        const obsEval = updateAndEvaluateObstacles(
          this.worldObstaclesRig,
          dt,
          this.elapsed,
          this.heroPos,
          this.heroVel,
          this.heroOnGround,
          this.phase === 'playing' && this.encounterGraceTimer <= 0,
          this.camera.position,
          this.phase === 'playing',
        );
        this.heroOnIce = obsEval.onIce;
        if (obsEval.pushX !== 0 || obsEval.pushZ !== 0) {
          this.heroVel.x += obsEval.pushX * dt;
          this.heroVel.z += obsEval.pushZ * dt;
        }
        if (obsEval.bounceVelY > 0) {
          this.heroVelY = obsEval.bounceVelY;
          this.heroOnGround = false;
          this.coyoteTimer = 0;
          soundEngine.playDash();
          this.spawnBurst(this.heroPos.x, this.heroPos.y + 0.3, this.heroPos.z, 0xf43f5e, 14);
          this.showBanner('🚀 Bouncy Pad melontarkanmu tinggi ke udara!', 1.8);
        }
        if (obsEval.hazardHit && this.phase === 'playing' && this.encounterGraceTimer <= 0) {
          this.hp = Math.max(0, this.hp - 1);
          this.encounterGraceTimer = 1.45;
          soundEngine.playHurt();
          this.heroVel.set(obsEval.hazardHit.knockX, 0, obsEval.hazardHit.knockZ);
          this.heroVelY = 5.4;
          this.heroOnGround = false;
          this.spawnBurst(this.heroPos.x, this.heroPos.y + 1.1, this.heroPos.z, 0xef4444, 16);
          this.showBanner(
            `⚠️ Terkena ${obsEval.hazardHit.name}! ${obsEval.hazardHit.hint} (-1 ❤️)`,
            2.8,
          );
          this.triggerDamageFlash(1, `Rintangan ${obsEval.hazardHit.name}`, {
            x: this.heroPos.x - obsEval.hazardHit.knockX,
            z: this.heroPos.z - obsEval.hazardHit.knockZ,
          });
          if (this.hp <= 0) {
            this.phase = 'gameover';
            soundEngine.playLose();
            this.pushHud(true);
            return;
          }
        }
      }

      if (this.archipelagoUnderwaterRig && this.isHeroUnderwater()) {
        resolveOceanSolidCollisions(
          this.heroPos,
          this.archipelagoUnderwaterRig.colliders,
          0.68,
          2.2,
        );
        for (const m of this.seaMonsters) {
          if (!m.alive) continue;
          const my = m.y ?? MONSTER_SPECS[m.type].hoverY;
          if (Math.abs(this.heroPos.y + 0.6 - my) > 2.2) continue;
          const spec = MONSTER_SPECS[m.type];
          const minD = 0.68 + spec.hitRadius * 0.72;
          const dx = this.heroPos.x - m.x;
          const dz = this.heroPos.z - m.z;
          const dSq = dx * dx + dz * dz;
          if (dSq >= minD * minD) continue;
          const d = dSq > 0.0001 ? Math.sqrt(dSq) : 0.01;
          const nx = dSq > 0.0001 ? dx / d : 1;
          const nz = dSq > 0.0001 ? dz / d : 0;
          const push = minD - d;
          this.heroPos.x += nx * push * 0.55;
          this.heroPos.z += nz * push * 0.55;
          m.x -= nx * push * 0.45;
          m.z -= nz * push * 0.45;
          m.mesh.position.set(m.x, my, m.z);
        }
        resolveOceanSolidCollisions(
          this.heroPos,
          this.archipelagoUnderwaterRig.colliders,
          0.68,
          2.2,
        );

        const maxO2 = this.getOceanMaxOxygen();
        if (this.hasUnlimitedOceanOxygen()) {
          this.oceanOxygen = maxO2;
          this.oceanSuffocateTimer = 0;
        } else {
          let nearAirRefill = this.heroPos.y >= -2.15;
          if (!nearAirRefill) {
            for (const vent of this.archipelagoUnderwaterRig.airVents) {
              if (
                Math.hypot(this.heroPos.x - vent.x, this.heroPos.z - vent.z) < 4.6 &&
                this.heroPos.y <= vent.y + 9.0
              ) {
                nearAirRefill = true;
                break;
              }
            }
          }
          if (nearAirRefill) {
            this.oceanOxygen = Math.min(maxO2, this.oceanOxygen + 44 * dt);
            this.oceanSuffocateTimer = 0;
          } else {
            const depthPressure = 1.0 + Math.max(0, -this.heroPos.y - 3) * 0.085;
            const drainRate = 3.8 * depthPressure;
            this.oceanOxygen = Math.max(0, this.oceanOxygen - drainRate * dt);
            if (this.oceanOxygen <= 0) {
              this.oceanSuffocateTimer += dt;
              if (this.oceanSuffocateTimer >= 2.0) {
                this.oceanSuffocateTimer = 0;
                this.hp = Math.max(0, this.hp - 1);
                soundEngine.playHurt();
                this.spawnBurst(this.heroPos.x, this.heroPos.y + 1.2, this.heroPos.z, 0x38bdf8, 12);
                this.showBanner(
                  '🫧 Kehabisan napas! Cari Gelembung O₂, berenang naik, atau ambil Pakaian Renang! (-1 ❤️)',
                  2.5,
                );
                this.triggerDamageFlash(1, 'Kehabisan oksigen di bawah laut');
                if (this.hp <= 0) {
                  this.phase = 'gameover';
                  soundEngine.playLose();
                  this.pushHud(true);
                  return;
                }
              }
            } else {
              this.oceanSuffocateTimer = 0;
            }
          }
        }

        if (this.fireCoralStingTimer > 0) {
          this.fireCoralStingTimer = Math.max(0, this.fireCoralStingTimer - dt);
        }

        // Collect underwater Hearts, Diamonds, and Weapons in Archipelago Straits
        for (const pk of this.archipelagoUnderwaterRig.pickups) {
          if (!pk.active) continue;
          const dp = Math.hypot(
            this.heroPos.x - pk.x,
            this.heroPos.y + 0.85 - pk.y,
            this.heroPos.z - pk.z,
          );
          if (dp < 2.25) {
            this.collectOceanPickup(pk);
          }
        }

        let bestBiota: OceanBiotaNode | null = null;
        let bestBiotaDist = 4.2;
        let nearTurtle = false;
        for (const node of this.archipelagoUnderwaterRig.biotaNodes) {
          const d3 = Math.hypot(
            this.heroPos.x - node.x,
            this.heroPos.y + 0.6 - node.y,
            this.heroPos.z - node.z,
          );
          if (d3 < 7.0 && !this.discoveredBiota.has(node.speciesId)) {
            this.discoveredBiota.add(node.speciesId);
            this.gainXp(10);
            this.addScore(35);
            soundEngine.playPick();
            const info = SEA_BIOTA_BY_ID[node.speciesId];
            this.showBanner(
              `🐠 Biota Baru Ditemukan: ${info?.indoName ?? node.speciesId} (${this.discoveredBiota.size}/20)!`,
              3.0,
            );
            this.saveProgress();
          }
          if (node.speciesId === 'fire_coral' && d3 < 1.9 && this.fireCoralStingTimer <= 0) {
            this.fireCoralStingTimer = 2.8;
            this.hp = Math.max(0, this.hp - 1);
            soundEngine.playHurt();
            this.spawnBurst(this.heroPos.x, this.heroPos.y + 0.9, this.heroPos.z, 0xf97316, 12);
            this.showBanner('🔥 Tersengat Karang Api! Menjauh sedikit dari koral jingga (-1 ❤️)', 2.4);
            this.triggerDamageFlash(1, 'Sengatan Karang Api', { x: node.x, z: node.z });
            if (this.hp <= 0) {
              this.phase = 'gameover';
              soundEngine.playLose();
              this.pushHud(true);
              return;
            }
          }
          if (node.speciesId === 'sea_turtle' && d3 < 4.6) {
            nearTurtle = true;
          }
          const entry = SEA_BIOTA_BY_ID[node.speciesId];
          const canInteract =
            Boolean(entry?.mountable) ||
            (Boolean(entry?.yieldKind) && node.harvestCooldown <= 0);
          if (canInteract && d3 < bestBiotaDist) {
            bestBiotaDist = d3;
            bestBiota = node;
          }
        }
        this.nearBiotaNode = bestBiota;
        this.nearOceanTurtle = nearTurtle;

        let bestChest: OceanSupplyChest | null = null;
        let bestChestDist = 4.4;
        for (const ch of this.archipelagoUnderwaterRig.chests) {
          if (ch.opened) continue;
          const dc = Math.hypot(
            this.heroPos.x - ch.x,
            this.heroPos.y + 0.5 - ch.y,
            this.heroPos.z - ch.z,
          );
          if (dc < 2.4) {
            this.interactWithOceanChest(ch);
            break;
          }
          if (dc < bestChestDist) {
            bestChestDist = dc;
            bestChest = ch;
          }
        }
        this.nearOceanChest = bestChest;
      } else {
        this.oceanOxygen = Math.min(this.getOceanMaxOxygen(), this.oceanOxygen + 44 * dt);
        this.oceanSuffocateTimer = 0;
        this.nearBiotaNode = null;
        this.nearOceanChest = null;
        this.nearOceanTurtle = false;
      }

      if (this.isSwimming !== wasSwimming) {
        this.refreshWeaponVisual();
      }
      if (this.isSwimming && Math.hypot(this.heroVel.x, this.heroVel.z) > 1.2) {
        this.swimFxTimer -= dt;
        if (this.swimFxTimer <= 0) {
          const isBubbleStyle =
            this.activeSwimStyle === 'underwater_glide' ||
            this.activeSwimStyle === 'deep_submerge' ||
            this.activeSwimStyle === 'scuba_explore' ||
            this.activeSwimStyle === 'water_dash';
          this.swimFxTimer = isBubbleStyle ? 0.1 : 0.15;
          this.spawnBurst(
            this.heroPos.x,
            this.isHeroUnderwater() ? this.heroPos.y + 0.45 : 0.06,
            this.heroPos.z,
            isBubbleStyle ? 0x67e8f9 : 0xe0f2fe,
            isBubbleStyle ? 5 : 3,
          );
        }
      }

      if (this.diveTransition?.active && this.diveTransition.stage === 'swim_to_water') {
        this.diveTransition.timer += dt;
        if (this.isSwimming || !effLandOrBridge || effGroundY < -0.15) {
          this.savedOverworldHeroPos.copy(this.heroPos);
          this.tapMoveTarget = null;
          this.heroVel.multiplyScalar(0.35);
          this.isSwimming = true;
          this.heroDiveActive = true;
          this.heroOnGround = false;
          this.activeSwimStyle = 'jump_dive';
          this.diveTransition.stage = 'plunge';
          this.diveTransition.timer = 0;
          this.diveTransition.bubbleTimer = 0;
          soundEngine.playJumpToSwim();
          this.spawnBurst(this.heroPos.x, 0.14, this.heroPos.z, 0xbae6fd, 18);
          this.showBanner('🤿 Menyelam perlahan masuk ke dalam laut...', 2.2);
          this.pushHud(true);
        } else if (this.diveTransition.timer >= 9.0) {
          this.diveTransition = null;
          this.tapMoveTarget = null;
          this.showBanner('🌊 Dekati tepi laut lalu tekan tombol Selam lagi.', 2.6);
          this.pushHud(true);
        }
      }
      }
      if (this.worldMode === 'overworld' && this.worldVehicles.length > 0) {
        let bestVeh: WorldVehicle | null = null;
        let bestScore = Infinity;
        for (let i = 0; i < this.worldVehicles.length; i++) {
          const v = this.worldVehicles[i];
          if (v.driverKind !== 'none') continue;
          if (Math.abs(this.heroPos.y - v.pos.y) > 3.5) continue;
          const distCenter = Math.hypot(this.heroPos.x - v.pos.x, this.heroPos.z - v.pos.z);
          const doorPt = this.getVehicleWorldPoint(v, v.boardOffset);
          const distDoor = Math.hypot(this.heroPos.x - doorPt.x, this.heroPos.z - doorPt.z);
          const reachCenter = v.kind === 'bus' ? 7.4 : 6.0;
          if (distCenter < reachCenter || distDoor < 4.4) {
            const score = Math.min(distCenter, distDoor);
            if (score < bestScore) {
              bestScore = score;
              bestVeh = v;
            }
          }
        }
        this.nearCar = Boolean(bestVeh);
        this.nearVehicleId = bestVeh?.id ?? null;
        const heroCar = this.worldVehicles.find((v) => v.id === 'hero_car');
        if (heroCar) {
          this.syncCarFieldsFromVehicle(heroCar);
        }
      } else {
        this.nearCar = false;
        this.nearVehicleId = null;
      }
      if (this.worldMode === 'overworld' && this.worldPlanes.length > 0) {
        let bestPlane: WorldPlane | null = null;
        let bestPlaneScore = Infinity;
        for (let pi = 0; pi < this.worldPlanes.length; pi++) {
          const pl = this.worldPlanes[pi];
          const boardPt = this.getPlaneWorldPoint(pl, pl.rig.boardOutsideOffset);
          const distCenter = Math.hypot(this.heroPos.x - pl.pos.x, this.heroPos.z - pl.pos.z);
          const distBoard = Math.hypot(this.heroPos.x - boardPt.x, this.heroPos.z - boardPt.z);
          if (Math.abs(this.heroPos.y - pl.pos.y) < 3.8 && (distCenter < 7.8 || distBoard < 5.2)) {
            const score = Math.min(distCenter, distBoard);
            if (score < bestPlaneScore) {
              bestPlaneScore = score;
              bestPlane = pl;
            }
          }
        }
        this.nearPlaneId = bestPlane?.id ?? null;
      } else {
        this.nearPlaneId = null;
      }
      soundEngine.setCarEngine(false, 0);
      soundEngine.setPlaneEngine(false, 0);
    }

    if (wasAirborne && this.heroOnGround && this.carMode === 'none' && this.planeMode === 'none') {
      this.jumpLandTimer = 0.16;
    }

    if (
      this.carMode === 'none' &&
      this.planeMode === 'none' &&
      (this.heroOnGround || this.coyoteTimer > 0 || this.isSwimming) &&
      this.jumpBufferTimer > 0
    ) {
      this.jumpHero();
    }

    if (this.manualLookHoldTimer > 0) {
      this.manualLookHoldTimer = Math.max(0, this.manualLookHoldTimer - dt);
    }

    if (this.shootAimTimer > 0) {
      if (!isManualAim && this.shootAimTargetId) {
        let tx: number | null = null;
        let ty = 0;
        let tz = 0;
        const tm = this.getActiveMonsters().find((item) => item.id === this.shootAimTargetId && item.alive);
        if (tm) {
          const spec = MONSTER_SPECS[tm.type];
          const mBaseY =
            tm.y ??
            (this.worldMode === 'overworld'
              ? getArchipelagoGroundY(tm.x, tm.z) + spec.hoverY
              : spec.hoverY);
          tx = tm.x;
          ty = mBaseY + (tm.isBoss ? 2.1 : spec.hitCenterY);
          tz = tm.z;
        } else if (this.worldMode === 'overworld') {
          const ts = this.shooters.find((item) => item.id === this.shootAimTargetId && item.alive);
          if (ts) {
            tx = ts.x;
            ty = getArchipelagoGroundY(ts.x, ts.z) + 1.65;
            tz = ts.z;
          }
        }
        if (tx !== null) {
          this.shootTargetPos = { x: tx, y: ty, z: tz };
          this.shootAimYaw = Math.atan2(tx - this.heroPos.x, tz - this.heroPos.z);
          const horiz = Math.max(0.25, Math.hypot(tx - this.heroPos.x, tz - this.heroPos.z));
          const targetPitch = Math.atan2(ty - (this.heroPos.y + 1.9), horiz);
          this.shootAimPitch = THREE.MathUtils.damp(this.shootAimPitch, targetPitch, 16, dt);
        } else {
          this.shootAimTargetId = null;
          this.shootTargetPos = null;
        }
      }
      this.shootAimTimer = Math.max(0, this.shootAimTimer - dt);
      if (this.shootAimTimer === 0 && !this.pendingTurnShot) {
        this.shootAimYaw = null;
        this.shootAimPitch = 0;
        this.shootAimTargetId = null;
        this.shootTargetPos = null;
      }
    }
    if (this.shootRecoilTimer > 0) {
      this.shootRecoilTimer = Math.max(0, this.shootRecoilTimer - dt);
    }

    const speed = Math.hypot(this.heroVel.x, this.heroVel.z);
    let yawDelta = this.heroYaw - this.prevHeroYaw;
    while (yawDelta > Math.PI) yawDelta -= Math.PI * 2;
    while (yawDelta < -Math.PI) yawDelta += Math.PI * 2;
    this.prevHeroYaw = this.heroYaw;
    this.swimDiveTimer = Math.max(0, this.swimDiveTimer - dt);
    this.swimDodgeTimer = Math.max(0, this.swimDodgeTimer - dt);
    if (this.isSwimming && dt > 0.001 && Math.abs(yawDelta) / dt > 2.4 && speed > 2.2) {
      this.swimDodgeTimer = 0.36;
      this.swimDodgeRoll = THREE.MathUtils.clamp((-yawDelta / dt) * 0.14, -0.55, 0.55);
    }

    const isSprintingSwim =
      this.heldKeys.has('ShiftLeft') || this.heldKeys.has('ShiftRight') || this.voiceSprint;
    if (this.isSwimming) {
      if (this.diveTransition?.active && this.diveTransition.stage === 'plunge') {
        this.activeSwimStyle = 'jump_dive';
      } else if (this.diveTransition?.active && this.diveTransition.stage === 'submerge') {
        this.activeSwimStyle = 'deep_submerge';
      } else if (this.diveTransition?.active && this.diveTransition.stage === 'surface') {
        this.activeSwimStyle = 'front_crawl';
      } else if (this.swimStylePreference !== 'auto') {
        this.activeSwimStyle = this.swimStylePreference;
      } else if ((this.worldMode === 'ocean' || this.isHeroUnderwater()) && this.oceanGear.has('wetsuit_tank')) {
        this.activeSwimStyle = 'scuba_explore';
      } else if ((this.worldMode === 'ocean' || this.isHeroUnderwater()) && (this.heroVelY < -1.8 || this.heroPos.y < -12)) {
        this.activeSwimStyle = 'deep_submerge';
      } else if ((this.worldMode === 'ocean' || this.isHeroUnderwater()) && speed > 0.8) {
        this.activeSwimStyle = 'underwater_glide';
      } else if (this.swimDiveTimer > 0) {
        this.activeSwimStyle = 'jump_dive';
      } else if (speed <= 0.6) {
        this.activeSwimStyle = 'water_tread';
      } else if (this.swimDodgeTimer > 0) {
        this.activeSwimStyle = 'quick_dodge';
      } else if (isSprintingSwim || speed > 8.6) {
        this.activeSwimStyle = 'water_dash';
      } else {
        this.activeSwimStyle = 'front_crawl';
      }
    }

    if (this.heroOnGround || this.isSwimming || this.worldMode !== 'overworld') {
      this.activeJumpTrick = null;
      this.jumpTrickElapsed = 0;
      this.jumpToSwimPlayedForAir = false;
    }

    let effectivePoseSwimStyle: SwimStyleId | undefined = this.isSwimming
      ? this.activeSwimStyle
      : undefined;
    if (!this.isSwimming && !this.heroOnGround && this.worldMode === 'overworld') {
      const airSample = sampleArchipelagoTerrain(this.heroPos.x, this.heroPos.z);
      if ((!airSample.isLandOrBridge || airSample.groundY < -0.15) && this.heroPos.y > -0.15) {
        if (!this.activeJumpTrick) {
          this.activeJumpTrick = this.pickRandomJumpTrick();
          this.jumpTrickElapsed = 0;
        }
        if (!this.jumpToSwimPlayedForAir) {
          soundEngine.playJumpToSwim();
          this.jumpToSwimPlayedForAir = true;
        }
        if (this.heroVelY < -1.8) {
          effectivePoseSwimStyle = 'jump_dive';
        }
      }
      if (this.activeJumpTrick) {
        this.jumpTrickElapsed += dt;
      }
    }

    if (this.isSwimming) {
      this.walkCycle += dt * (speed > 0.6 ? 6.5 + speed * 0.55 : 2.8);
    } else if (speed > 0.6 && this.heroOnGround) {
      this.walkCycle += dt * (8 + speed * 0.45);
    }
    soundEngine.setWalking(
      speed > 0.8 && this.heroOnGround && !this.isSwimming && this.carMode === 'none' && this.planeMode === 'none',
      speed > 10.5 ? 1.2 : 1.0,
    );
    const isMovingInWater =
      this.isSwimming &&
      (speed > 0.35 ||
        Math.abs(this.heroVelY) > 0.35 ||
        this.oceanAscendHeld ||
        this.oceanDescendHeld ||
        this.swimDiveTimer > 0 ||
        (this.swimStylePreference !== 'auto' && this.swimStylePreference !== 'water_tread'));
    soundEngine.setSwimmingAudio(
      isMovingInWater,
      isSprintingSwim || speed > 8.6 || this.activeSwimStyle === 'water_dash' ? 1.18 : 1.0,
    );

    // Track Hero idle state: any joystick/key/tap move, jump, aim, or shoot immediately cancels idle pose & thought bubble
    const hasMoveInput =
      Math.hypot(mx, mz) > 0.08 ||
      Boolean(this.tapMoveTarget) ||
      speed > 0.45;
    const isBusyAction =
      !this.heroOnGround ||
      this.isSwimming ||
      this.carMode !== 'none' ||
      this.planeMode !== 'none' ||
      this.jumpBufferTimer > 0 ||
      continuousHold ||
      this.isAiming ||
      this.shootAimTimer > 0 ||
      this.shootRecoilTimer > 0 ||
      Boolean(this.pendingTurnShot) ||
      this.fpSwingTimer > 0;
    if (hasMoveInput || isBusyAction) {
      this.heroIdleTime = 0;
      this.heroThoughtText = null;
      this.heroThoughtTimer = 0;
      this.heroThoughtCooldown = Math.min(this.heroThoughtCooldown, 3.2);
    } else {
      this.heroIdleTime += dt;
      if (this.heroThoughtTimer > 0) {
        this.heroThoughtTimer = Math.max(0, this.heroThoughtTimer - dt);
        if (this.heroThoughtTimer === 0) {
          this.heroThoughtText = null;
          this.heroThoughtCooldown = 4.2 + Math.random() * 3.5;
        }
      } else if (this.heroIdleTime >= 2.6) {
        this.heroThoughtCooldown -= dt;
        if (this.heroThoughtCooldown <= 0) {
          this.heroThoughtText = this.pickHeroIdleThought();
          this.heroThoughtTimer = 4.8;
        }
      }
    }

    this.hero.root.position.copy(this.heroPos);
    this.hero.body.rotation.y = this.heroYaw;
    if (this.worldMode === 'dungeon') {
      this.playerCaveLight.position.set(this.heroPos.x, this.heroPos.y + 2.8, this.heroPos.z);
    }

    const skyPeekAlpha =
      this.cameraMode === 'third_back' && this.cameraPitch < -0.15
        ? THREE.MathUtils.clamp((-this.cameraPitch - 0.15) / 0.35, 0, 0.78)
        : 0;
    const fireAimAlpha = this.shootAimTimer > 0 ? Math.min(1, this.shootAimTimer * 3.5) : 0;
    const aimAlpha = Math.max(fireAimAlpha, this.aimBlend, skyPeekAlpha);
    const recoil =
      this.shootRecoilTimer > 0 ? Math.sin((this.shootRecoilTimer / 0.22) * Math.PI) : 0;
    const landImpulse =
      this.jumpLandTimer > 0 ? Math.sin((this.jumpLandTimer / 0.16) * Math.PI) : 0;

    const heroAimPitch =
      isManualAim || this.cameraMode === 'first_person'
        ? -(this.cameraPitch - this.recoilPitch)
        : this.shootAimTimer > 0 || this.pendingTurnShot
        ? this.shootAimPitch
        : this.cameraMode === 'third_back' && this.cameraPitch < -0.15
        ? -this.cameraPitch * 0.92
        : 0;

    const underwaterNow = this.worldMode === 'ocean' || this.isHeroUnderwater();
    const canHoldInCurrentEnv =
      hasEquippedWeapon &&
      this.carMode === 'none' &&
      this.planeMode === 'none' &&
      (!this.isSwimming || underwaterNow || SEA_CAPABLE_WEAPONS.has(this.activeWeapon));
    const isHeroRigCar = Boolean(this.getActiveVehicle()?.rig);
    const carSeatedNow =
      this.carMode === 'driving' ||
      (this.carMode === 'entering' && this.carAnimTimer > (isHeroRigCar ? 1.35 : 0.45)) ||
      (this.carMode === 'exiting' && this.carAnimTimer < (isHeroRigCar ? 0.72 : 0.3));
    const activePlanePose = this.planeMode !== 'none' ? this.getActivePlane() : undefined;
    const planeSeatedNow =
      this.planeMode === 'taxi' ||
      this.planeMode === 'flying' ||
      (this.planeMode === 'entering' && this.planeAnimTimer > 1.08) ||
      (this.planeMode === 'exiting' && this.planeAnimTimer < 0.48);
    applyHeroWeaponPose(this.hero, this.activeWeapon, canHoldInCurrentEnv, {
      speed: this.carMode !== 'none' || this.planeMode !== 'none' ? 0 : speed,
      walkCycle: this.walkCycle,
      aimAlpha,
      recoil,
      dt,
      elapsed: this.elapsed,
      aimPitch: heroAimPitch,
      onGround: this.heroOnGround,
      velY: this.heroVelY,
      landImpulse,
      idleDuration: this.heroIdleTime,
      isSwimming: this.isSwimming,
      swimStyle: effectivePoseSwimStyle,
      swimBankRoll: this.swimDodgeTimer > 0 ? this.swimDodgeRoll : 0,
      divingGear: underwaterNow ? Array.from(this.oceanGear) : [],
      wearingSwimsuit: this.swimSuitPicked,
      ridingTurtle: this.isSwimming && this.ridingTurtle,
      jumpDiveTrick: this.activeJumpTrick,
      jumpDiveElapsed: this.jumpTrickElapsed,
      carPose: planeSeatedNow && activePlanePose
        ? {
            seated: true,
            steerAngle: activePlanePose.steerAngle,
            speedRatio: THREE.MathUtils.clamp(activePlanePose.speed / 44, -1, 1),
          }
        : carSeatedNow
        ? {
            seated: true,
            steerAngle: this.carSteerAngle,
            speedRatio: THREE.MathUtils.clamp(this.carSpeed / 24, -1, 1),
          }
        : null,
    });

    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.hero.swimRing.visible = this.isSwimming && this.heroPos.y > -1.75;
    if (this.hero.swimRing.visible) {
      this.hero.swimRing.position.y = Math.max(0.05, -this.heroPos.y + 0.05);
      const rScale = (speed > 0.6 ? 1.08 : 0.92) + Math.sin(this.elapsed * 5.2) * 0.08;
      this.hero.swimRing.scale.setScalar(rScale);
    }
    if (this.pulseRingTimer > 0) {
      this.pulseRingTimer = Math.max(0, this.pulseRingTimer - dt);
      const prog = 1 - this.pulseRingTimer / 0.4;
      this.hero.dashRing.scale.setScalar(1 + prog * 3.5);
      (this.hero.dashRing.material as THREE.MeshBasicMaterial).opacity = (1 - prog) * 0.8;
    } else {
      (this.hero.dashRing.material as THREE.MeshBasicMaterial).opacity = 0;
    }

    if (this.fpSwingTimer > 0) {
      this.fpSwingTimer = Math.max(0, this.fpSwingTimer - dt);
    }

    // Auto-Aim Camera Follow: in Bidik Otomatis, smoothly rotate & pitch camera toward locked sky/ground/sea target (or firing direction)
    const userDraggingCam = Boolean(this.lookPointer?.moved) || this.manualLookHoldTimer > 0;
    if (
      !isManualAim &&
      !userDraggingCam &&
      (this.cameraMode === 'third_back' || this.cameraMode === 'first_person')
    ) {
      if ((this.shootAimTimer > 0 || Boolean(this.pendingTurnShot)) && this.shootAimYaw !== null) {
        const desiredCamYaw = this.shootAimYaw + Math.PI;
        let camYawDiff = desiredCamYaw - this.cameraYaw;
        while (camYawDiff > Math.PI) camYawDiff -= Math.PI * 2;
        while (camYawDiff < -Math.PI) camYawDiff += Math.PI * 2;
        const yawRate =
          this.cameraMode === 'first_person' ? 16 : this.shootTargetPos ? 11.5 : 8.5;
        this.cameraYaw += camYawDiff * (1 - Math.exp(-yawRate * dt));

        if (this.cameraMode === 'first_person') {
          const desiredCamPitch = THREE.MathUtils.clamp(-this.shootAimPitch, -1.25, 1.12);
          this.cameraPitch = THREE.MathUtils.damp(this.cameraPitch, desiredCamPitch, 14, dt);
          this.autoCamPitchActive = true;
        } else if (this.shootAimPitch > 0.06) {
          // Target is elevated / in the sky: pitch camera up smoothly so sky & target are clearly framed
          const desiredCamPitch = THREE.MathUtils.clamp(-this.shootAimPitch - 0.05, -1.18, -0.08);
          this.cameraPitch = THREE.MathUtils.damp(this.cameraPitch, desiredCamPitch, 10.5, dt);
          this.autoCamPitchActive = true;
        } else if (this.shootAimPitch < -0.14) {
          // Target is below Hero (cliff edge / deep underwater): tilt camera slightly downward
          const desiredCamPitch = THREE.MathUtils.clamp(-this.shootAimPitch + 0.12, 0.18, 1.05);
          this.cameraPitch = THREE.MathUtils.damp(this.cameraPitch, desiredCamPitch, 10, dt);
          this.autoCamPitchActive = true;
        } else if (this.shootTargetPos) {
          if (this.cameraPitch < 0.06 || this.cameraPitch > 0.48) {
            this.cameraPitch = THREE.MathUtils.damp(this.cameraPitch, 0.18, 8.5, dt);
          }
          this.autoCamPitchActive = true;
        }
      } else if (this.autoCamPitchActive && (hasMoveInput || speed > 0.8 || this.cameraPitch < -0.18)) {
        this.cameraPitch = THREE.MathUtils.damp(this.cameraPitch, 0.22, 4.2, dt);
        if (Math.abs(this.cameraPitch - 0.22) < 0.02) {
          this.cameraPitch = 0.22;
          this.autoCamPitchActive = false;
        }
      }
    }

    // Auto-Chase Camera Follow while Driving Car or Piloting Plane
    if (
      this.carMode === 'driving' &&
      !userDraggingCam &&
      (this.cameraMode === 'third_back' || this.cameraMode === 'first_person')
    ) {
      if (this.cameraMode === 'first_person' || Math.abs(this.carSpeed) > 1.0) {
        const desiredCamYaw = this.carYaw + Math.PI;
        let camYawDiff = desiredCamYaw - this.cameraYaw;
        while (camYawDiff > Math.PI) camYawDiff -= Math.PI * 2;
        while (camYawDiff < -Math.PI) camYawDiff += Math.PI * 2;
        const rate = this.cameraMode === 'first_person' ? 8.5 : 4.5;
        this.cameraYaw += camYawDiff * (1 - Math.exp(-rate * dt));
      }
      if (this.cameraMode === 'third_back' && this.cameraPitch > 0.35) {
        this.cameraPitch = THREE.MathUtils.damp(this.cameraPitch, 0.24, 3.2, dt);
      }
    }

    const activeCamPlane = this.planeMode !== 'none' ? this.getActivePlane() : undefined;
    if (
      (this.planeMode === 'taxi' || this.planeMode === 'flying') &&
      activeCamPlane &&
      !userDraggingCam &&
      (this.cameraMode === 'third_back' || this.cameraMode === 'first_person')
    ) {
      const desiredCamYaw = activeCamPlane.yaw + Math.PI;
      let camYawDiff = desiredCamYaw - this.cameraYaw;
      while (camYawDiff > Math.PI) camYawDiff -= Math.PI * 2;
      while (camYawDiff < -Math.PI) camYawDiff += Math.PI * 2;
      const rate = this.cameraMode === 'first_person' ? 9.5 : 4.8;
      this.cameraYaw += camYawDiff * (1 - Math.exp(-rate * dt));
      if (this.cameraMode === 'third_back') {
        const targetFlightPitch = this.planeMode === 'flying' ? 0.16 - activeCamPlane.pitch * 0.45 : 0.22;
        this.cameraPitch = THREE.MathUtils.damp(this.cameraPitch, THREE.MathUtils.clamp(targetFlightPitch, -0.25, 0.38), 3.6, dt);
      }
    }

    // Update Camera Rig (Over-the-Shoulder TPS + ADS Scope Zoom when Bidik Bebas, or Centered Classic RPG when Bidik Otomatis)
    const sinY = Math.sin(this.cameraYaw);
    const cosY = Math.cos(this.cameraYaw);
    const effPitch = THREE.MathUtils.clamp(
      this.cameraPitch - (isManualAim ? this.recoilPitch : 0),
      this.cameraMode === 'first_person' ? -1.25 : -1.18,
      1.12,
    );
    const cosP = Math.cos(effPitch);
    const sinP = Math.sin(effPitch);
    const isInCarView = this.carMode !== 'none';
    const isInPlaneView = this.planeMode !== 'none' && Boolean(activeCamPlane);
    const isInVehicleView = isInCarView || isInPlaneView;
    const focusX = isInPlaneView && activeCamPlane ? activeCamPlane.pos.x : isInCarView ? this.carPos.x : this.heroPos.x;
    const focusZ = isInPlaneView && activeCamPlane ? activeCamPlane.pos.z : isInCarView ? this.carPos.z : this.heroPos.z;
    const targetY = isInPlaneView && activeCamPlane ? activeCamPlane.pos.y + 1.95 : isInCarView ? this.carPos.y + 2.25 : this.heroPos.y + 1.92;

    const carSpeedFov =
      this.carMode === 'driving'
        ? Math.min(10, Math.abs(this.carSpeed) * 0.28) +
          ((this.carCtrl.boost || this.heldKeys.has('ShiftLeft') || this.heldKeys.has('ShiftRight')) &&
          Math.abs(this.carSpeed) > 6
            ? 4
            : 0)
        : 0;
    const planeSpeedFov =
      isInPlaneView && activeCamPlane && (this.planeMode === 'flying' || this.planeMode === 'taxi')
        ? Math.min(14, Math.abs(activeCamPlane.speed) * 0.25) +
          ((this.planeCtrl.boost || this.heldKeys.has('ShiftLeft') || this.heldKeys.has('ShiftRight')) &&
          activeCamPlane.speed > 18
            ? 5
            : 0)
        : 0;
    const targetFov = isInPlaneView
      ? 60 + planeSpeedFov
      : isInCarView
      ? 58 + carSpeedFov
      : !isManualAim
      ? 58
      : this.cameraMode === 'first_person'
      ? THREE.MathUtils.lerp(58, 40, this.aimBlend)
      : this.cameraMode === 'third_back'
      ? THREE.MathUtils.lerp(58, 43, this.aimBlend)
      : 58;
    if (Math.abs(this.camera.fov - targetFov) > 0.06) {
      this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 14, dt);
      this.camera.updateProjectionMatrix();
    }

    if (this.cameraMode === 'third_back' || this.cameraMode === 'third_front') {
      const sign = this.cameraMode === 'third_front' ? -1 : 1;
      const baseDist = isInPlaneView
        ? Math.max(this.thirdPersonDist + 6.4, 13.5)
        : isInCarView
        ? Math.max(this.thirdPersonDist + 3.2, 9.6)
        : this.worldMode === 'dungeon'
        ? Math.min(this.thirdPersonDist, 6.2)
        : this.thirdPersonDist;
      const skyUpT =
        this.cameraMode === 'third_back' && effPitch < -0.15
          ? THREE.MathUtils.clamp((-effPitch - 0.15) / 0.88, 0, 1)
          : 0;
      const skyShortenDist = THREE.MathUtils.lerp(baseDist, Math.min(baseDist, 4.8), skyUpT);
      const desiredDist =
        !isInVehicleView && isManualAim && this.cameraMode === 'third_back'
          ? THREE.MathUtils.lerp(skyShortenDist, Math.min(skyShortenDist, 3.45), this.aimBlend)
          : skyShortenDist;

      // Offset camera to Hero's right shoulder only in Bidik Bebas TPS so center crosshair stays clear
      const shoulderRight =
        !isInVehicleView && isManualAim && this.cameraMode === 'third_back'
          ? THREE.MathUtils.lerp(0.86, 1.06, this.aimBlend)
          : 0;
      const pivotX = focusX + cosY * shoulderRight;
      const pivotY =
        !isInVehicleView && isManualAim && this.cameraMode === 'third_back'
          ? this.heroPos.y + THREE.MathUtils.lerp(2.04, 2.22, this.aimBlend)
          : targetY;
      const pivotZ = focusZ - sinY * shoulderRight;

      const dirX = sign * sinY * cosP;
      const dirY = sinP;
      const dirZ = sign * cosY * cosP;

      // Trace spring-arm from Hero/Car/Plane center toward desired camera position (terrain-aware floor!)
      const goalX = pivotX + dirX * desiredDist;
      const goalZ = pivotZ + dirZ * desiredDist;
      const camFloorY =
        (this.worldMode === 'overworld'
          ? getArchipelagoGroundY(goalX, goalZ)
          : this.worldMode === 'ocean'
          ? getOceanFloorY(goalX, goalZ)
          : 0) + 0.55;
      const goalY = Math.max(camFloorY, pivotY + dirY * desiredDist);
      const rx = goalX - focusX;
      const ry = goalY - pivotY;
      const rz = goalZ - focusZ;
      const rayLen = Math.hypot(rx, ry, rz) || 1;
      const blockedDist = isInPlaneView && this.planeMode === 'flying'
        ? rayLen
        : this.computeSpringArmDist(
            focusX,
            pivotY,
            focusZ,
            rx / rayLen,
            ry / rayLen,
            rz / rayLen,
            rayLen,
          );

      // Snap inward ultra-fast when hitting a wall/pillar; ease outward smoothly when clear
      const distAlpha =
        blockedDist < this.currentCamDist
          ? 1 - Math.exp(-32 * dt)
          : 1 - Math.exp(-9.5 * dt);
      this.currentCamDist += (blockedDist - this.currentCamDist) * distAlpha;

      const camX = focusX + (rx / rayLen) * this.currentCamDist;
      const camZ = focusZ + (rz / rayLen) * this.currentCamDist;
      const liveCamFloorY =
        (this.worldMode === 'overworld'
          ? getArchipelagoGroundY(camX, camZ)
          : this.worldMode === 'ocean'
          ? getOceanFloorY(camX, camZ)
          : 0) + 0.55;
      let camY = Math.max(liveCamFloorY, pivotY + (ry / rayLen) * this.currentCamDist);
      if (this.worldMode === 'ocean') {
        camY = Math.min(-0.45, camY);
      } else if (this.worldMode === 'overworld' && this.isSwimming && this.heroPos.y < -1.55) {
        const subT = THREE.MathUtils.clamp((-this.heroPos.y - 1.55) / 1.4, 0, 1);
        camY = Math.min(camY, THREE.MathUtils.lerp(camY, -0.35, subT));
      }

      _v1.set(camX, camY, camZ);
      this.camera.position.lerp(_v1, 1 - Math.exp(-28 * dt));
      if (isInPlaneView && activeCamPlane && this.cameraMode === 'third_back') {
        const lookAhead = this.planeMode === 'flying' ? 14 : 6;
        this.camera.lookAt(
          activeCamPlane.pos.x + Math.sin(activeCamPlane.yaw) * lookAhead,
          activeCamPlane.pos.y + 1.85 + Math.sin(activeCamPlane.pitch) * lookAhead * 0.65,
          activeCamPlane.pos.z + Math.cos(activeCamPlane.yaw) * lookAhead,
        );
      } else if (isManualAim && this.cameraMode === 'third_back') {
        this.camera.lookAt(
          pivotX - dirX * 24,
          pivotY - dirY * 24,
          pivotZ - dirZ * 24,
        );
      } else if (
        this.cameraMode === 'third_back' &&
        !isManualAim &&
        (this.shootAimTimer > 0 || Boolean(this.pendingTurnShot)) &&
        this.shootTargetPos
      ) {
        const tdx = this.shootTargetPos.x - this.heroPos.x;
        const tdy = this.shootTargetPos.y - targetY;
        const tdz = this.shootTargetPos.z - this.heroPos.z;
        const tDist = Math.hypot(tdx, tdy, tdz) || 1;
        const clampDist = Math.min(tDist, 14);
        const refX = this.heroPos.x + (tdx / tDist) * clampDist;
        const refY = targetY + (tdy / tDist) * clampDist;
        const refZ = this.heroPos.z + (tdz / tDist) * clampDist;
        const elevAlpha = THREE.MathUtils.clamp(this.shootAimPitch / 0.85, 0, 1);
        const fade = this.pendingTurnShot ? 1 : Math.min(1, this.shootAimTimer * 2.5);
        const lookBlend = THREE.MathUtils.lerp(0.32, 0.72, elevAlpha) * fade;
        this.camera.lookAt(
          THREE.MathUtils.lerp(this.heroPos.x, refX, lookBlend),
          THREE.MathUtils.lerp(targetY, refY, lookBlend),
          THREE.MathUtils.lerp(this.heroPos.z, refZ, lookBlend),
        );
      } else if (this.cameraMode === 'third_back' && effPitch < -0.04) {
        const skyLookT = THREE.MathUtils.clamp((-effPitch - 0.04) / 0.5, 0, 1);
        this.camera.lookAt(
          THREE.MathUtils.lerp(this.heroPos.x, pivotX - dirX * 24, skyLookT),
          THREE.MathUtils.lerp(targetY, pivotY - dirY * 24, skyLookT),
          THREE.MathUtils.lerp(this.heroPos.z, pivotZ - dirZ * 24, skyLookT),
        );
      } else {
        this.camera.lookAt(focusX, targetY, focusZ);
      }
    } else if (this.cameraMode === 'first_person') {
      const eyeX = isInPlaneView && activeCamPlane ? activeCamPlane.pos.x : this.heroPos.x;
      const eyeY = isInPlaneView && activeCamPlane ? activeCamPlane.pos.y + 2.05 : this.heroPos.y + 2.55;
      const eyeZ = isInPlaneView && activeCamPlane ? activeCamPlane.pos.z : this.heroPos.z;
      this.camera.position.set(eyeX, eyeY, eyeZ);
      this.camera.lookAt(
        eyeX - sinY * cosP * 10,
        eyeY - sinP * 10,
        eyeZ - cosY * cosP * 10,
      );
      const walkBob = speed > 0.6 ? Math.sin(this.walkCycle) : 0;
      const swing = this.fpSwingTimer > 0 ? Math.sin((1 - this.fpSwingTimer / 0.24) * Math.PI) : 0;
      this.fpViewRig.handPivot.position.set(
        THREE.MathUtils.lerp(0.42, 0.22, this.aimBlend) + walkBob * 0.02,
        THREE.MathUtils.lerp(-0.36, -0.28, this.aimBlend) + Math.abs(walkBob) * 0.024 - swing * 0.06,
        THREE.MathUtils.lerp(-0.68, -0.58, this.aimBlend) - swing * 0.14,
      );
      this.fpViewRig.handPivot.rotation.set(
        0.28 - swing * 0.62,
        THREE.MathUtils.lerp(-0.34, -0.1, this.aimBlend) + swing * 0.2,
        0.14 + walkBob * 0.05,
      );
    } else {
      _v1.set(this.heroPos.x, 2.0, this.heroPos.z);
      _v2.subVectors(_v1, this.controls.target).multiplyScalar(1 - Math.exp(-7 * dt));
      this.controls.target.add(_v2);
      this.camera.position.add(_v2);
    }

    this.crosshairOnEnemy =
      hasEquippedWeapon &&
      (this.cameraMode === 'first_person' || (isManualAim && this.cameraMode === 'third_back'))
        ? this.getCrosshairAimInfo().hitEnemy
        : false;

    if (this.encounterGraceTimer > 0) {
      this.encounterGraceTimer = Math.max(0, this.encounterGraceTimer - dt);
    }

    if (this.worldMode === 'dungeon' && this.dungeonRig) {
      this.updateCaveTargeting();
    } else {
      this.targetedCaveBlock = null;
    }

    // Update Shooters & Projectiles
    this.updateShootersAndProjectiles(dt);

    if (this.worldMode === 'overworld') {
      // Starter Weapon Pickup in Desa Sapaan
      const sw = OVERWORLD_ANCHORS.starterWeapon;
      const swY = getArchipelagoGroundY(sw.x, sw.z);
      if (
        !this.starterWeaponPicked &&
        Math.hypot(this.heroPos.x - sw.x, this.heroPos.z - sw.z) < 2.6 &&
        Math.abs(this.heroPos.y - swY) < 3.2
      ) {
        this.starterWeaponPicked = true;
        this.ownedWeapons.add('ketapel');
        this.activeWeapon = 'ketapel';
        this.activeHotbarSlot = 0;
        this.weaponAmmo.ketapel = Math.min(MAX_AMMO, this.weaponAmmo.ketapel + 8);
        this.refreshWeaponVisual();
        this.spawnBurst(sw.x, swY + 1.5, sw.z, 0xfacc15, 26);
        soundEngine.playPick();
        const rescuePending = Boolean(
          this.villageAmbushState?.active && !this.villageAmbushState.resolved,
        );
        this.showBanner(
          rescuePending
            ? '✨ Senjata Pemula Didapat! Cepat tembak & habisi monster yang mengejar warga di alun-alun!'
            : '✨ Senjata Pemula Didapat! (Damage Kecil: 1 · Jelajahi Gua & kalahkan Bos untuk senjata kuat!)',
          4.8,
        );
        this.saveProgress();
      }

      // Swimsuit Pickup in Desa Sapaan
      const ss = OVERWORLD_ANCHORS.swimSuit;
      const ssY = getArchipelagoGroundY(ss.x, ss.z);
      if (
        !this.swimSuitPicked &&
        Math.hypot(this.heroPos.x - ss.x, this.heroPos.z - ss.z) < 2.6 &&
        Math.abs(this.heroPos.y - ssY) < 3.2
      ) {
        this.swimSuitPicked = true;
        this.oceanOxygen = this.getOceanMaxOxygen();
        this.oceanSuffocateTimer = 0;
        this.refreshWeaponVisual();
        this.spawnBurst(ss.x, ssY + 1.5, ss.z, 0x22d3ee, 26);
        soundEngine.playPick();
        this.showBanner(
          '🤿 Pakaian Renang Didapat! O₂ kini Tak Terbatas di bawah laut — tekan Selam untuk menjelajah!',
          5.0,
        );
        this.saveProgress();
      }

      for (const c of this.collectibles) {
        if (!c.active) continue;
        const cy = c.y;
        if (
          Math.hypot(this.heroPos.x - c.x, this.heroPos.z - c.z) < 2.2 &&
          Math.abs(this.heroPos.y - cy) < 3.2
        ) {
          c.active = false;
          c.matrixInit = false;
          c.respawnTimer = TUNE.itemBackSec;
          if (c.kind === 'diamond') {
            this.diamonds += 1;
            this.addScore(80);
            this.gainXp(15);
            this.spawnBurst(c.x, cy + 1.5, c.z, 0x38bdf8, 12);
            soundEngine.playPick();
          } else {
            this.hp = Math.min(this.maxHp, this.hp + 1);
            this.addScore(40);
            this.spawnBurst(c.x, cy + 1.5, c.z, 0xf43f5e, 12);
            soundEngine.playPick();
          }
          this.saveProgress();
        }
      }

      let bestNpc: string | null = null;
      let bestNpcScore = Infinity;
      if (this.carMode === 'none' && this.planeMode === 'none') {
        for (const npc of ALL_OVERWORLD_NPCS) {
          const live = this.npcs.get(npc.id);
          if (live && (live.koTimer > 0 || !this.isNpcOnDuty(live.shift))) continue;
          const nx = live?.x ?? npc.x;
          const nz = live?.z ?? npc.z;
          const ny = getArchipelagoGroundY(nx, nz);
          if (Math.abs(this.heroPos.y - ny) > 3.5) continue;
          const d = Math.hypot(this.heroPos.x - nx, this.heroPos.z - nz);
          if (d >= 5.6) continue;
          const onDuty = live ? this.isNpcOnDuty(live.shift) : npc.shiftRole !== 'night';
          if (!onDuty) continue;
          const score = d - 0.65;
          if (score < bestNpcScore) {
            bestNpcScore = score;
            bestNpc = npc.id;
          }
        }
      }
      this.nearbyNpcId = bestNpc;
      let bestZoneDoor: ZoneId | null = null;
      let bestZoneDoorDist = 4.8;
      if (this.carMode === 'none' && this.planeMode === 'none') {
        for (const [zKey, door] of Object.entries(OVERWORLD_ZONE_DOORS) as Array<
          [ZoneId, (typeof OVERWORLD_ZONE_DOORS)[ZoneId]]
        >) {
          if (Math.abs(this.heroPos.y - door.y) > 4.0) continue;
          const d = Math.hypot(this.heroPos.x - door.x, this.heroPos.z - door.z);
          if (d < bestZoneDoorDist) {
            bestZoneDoorDist = d;
            bestZoneDoor = zKey;
          }
        }
      }
      this.nearbyOverworldZoneDoor = bestZoneDoor;
      this.nearbyDoorIndex = null;
      this.nearbyDungeonGuardian = false;
      this.nearPrisonKey = false;
      this.nearHiddenPrison = false;
      const pp = OVERWORLD_ANCHORS.portal;
      this.nearPortal =
        Math.hypot(this.heroPos.x - pp.x, this.heroPos.z - (pp.z + 2.5)) < 6.4 &&
        Math.abs(this.heroPos.y - getArchipelagoGroundY(pp.x, pp.z)) < 3.6;
      this.nearDungeonExit = false;
    } else if (this.worldMode === 'dungeon' && this.dungeonState) {
      this.nearbyNpcId = null;
      this.nearbyOverworldZoneDoor = null;
      this.nearPortal = false;
      this.nearDungeonExit =
        Math.hypot(this.heroPos.x - this.dungeonExitPos.x, this.heroPos.z - this.dungeonExitPos.z) < 4.4;
      this.nearCraftingTable =
        Boolean(this.dungeonRig) &&
        Math.hypot(
          this.heroPos.x - this.dungeonRig!.craftingTablePos.x,
          this.heroPos.z - this.dungeonRig!.craftingTablePos.z,
        ) < 4.3;
      this.nearbyDungeonGuardian =
        Boolean(this.dungeonRig) &&
        Math.hypot(
          this.heroPos.x - this.dungeonRig!.guardianPos.x,
          this.heroPos.z - this.dungeonRig!.guardianPos.z,
        ) < 4.2;

      const keyDist = Math.hypot(this.heroPos.x, this.heroPos.z + 9);
      this.nearPrisonKey =
        Boolean(this.dungeonRig && this.dungeonState.prisonKeySpawned && !this.dungeonState.prisonKeyCollected) &&
        keyDist < 4.4;
      if (this.nearPrisonKey && keyDist < 2.15) {
        this.collectPrisonKey();
      }

      const prisonDist = this.dungeonRig
        ? Math.hypot(
            this.heroPos.x - this.dungeonRig.prisonPos.x,
            this.heroPos.z - this.dungeonRig.prisonPos.z,
          )
        : 99;
      this.nearHiddenPrison = Boolean(this.dungeonRig && !this.dungeonState.prisonUnlocked) && prisonDist < 4.3;
      if (
        this.nearHiddenPrison &&
        this.dungeonState.prisonKeyCollected &&
        !this.dungeonState.prisonUnlocked &&
        prisonDist < 2.65
      ) {
        this.interactWithHiddenPrison();
        return;
      }

      if (
        this.dungeonRig &&
        !this.dungeonRig.weaponChest.collected &&
        !this.chestAmbushTriggered &&
        Math.hypot(
          this.heroPos.x - this.dungeonRig.weaponChest.x,
          this.heroPos.z - this.dungeonRig.weaponChest.z,
        ) < 6.4
      ) {
        this.chestAmbushTriggered = true;
        const chestDetail = this.getOrCreateZoneCaveDetail(this.dungeonState.zoneId);
        chestDetail.chestAmbushTriggered = true;
        const chestAmbush = this.spawnCaveAmbushMonster(
          this.dungeonRig.weaponChest.x,
          this.dungeonRig.weaponChest.z,
          'Penjaga Peti Rahasia',
          0x38bdf8,
          `ambush_chest_${this.dungeonState.zoneId}`,
        );
        if (chestAmbush) {
          chestDetail.chestAmbushInfo = {
            isCombatAmbush: chestAmbush.isCombatAmbush,
            wordIds: chestAmbush.wordIds,
          };
        }
        this.saveProgress();
        this.showBanner('AWAS! Penjaga Peti Rahasia muncul melindungi Ketapel Kerikil!', 3.2);
      }

      if (
        this.dungeonRig &&
        !this.dungeonRig.weaponChest.collected &&
        Math.hypot(
          this.heroPos.x - this.dungeonRig.weaponChest.x,
          this.heroPos.z - this.dungeonRig.weaponChest.z,
        ) < 2.25 &&
        Math.abs(this.heroPos.y - this.dungeonRig.weaponChest.y) < 1.5
      ) {
        this.collectCaveWeaponChest();
      }

      let bestDoor: number | null = null;
      let bestDoorDist = 4.2;
      for (const door of ZONE_DOORS[this.dungeonState.zoneId]) {
        const d = Math.hypot(this.heroPos.x - door.x, this.heroPos.z - door.z);
        if (d < bestDoorDist) {
          bestDoorDist = d;
          bestDoor = door.index;
        }
      }
      this.nearbyDoorIndex = bestDoor;
    } else if (this.worldMode === 'academy') {
      this.nearbyDoorIndex = null;
      this.nearbyOverworldZoneDoor = null;
      this.nearbyDungeonGuardian = false;
      this.nearPrisonKey = false;
      this.nearHiddenPrison = false;
      this.nearPortal = false;
      this.nearCraftingTable = false;
      this.nearDungeonExit =
        Math.hypot(this.heroPos.x - this.dungeonExitPos.x, this.heroPos.z - this.dungeonExitPos.z) < 4.4;

      let bestNpc: string | null = null;
      let bestNpcDist = 5.0;
      for (const npc of ACADEMY_NPCS) {
        const d = Math.hypot(this.heroPos.x - npc.x, this.heroPos.z - npc.z);
        if (d < bestNpcDist) {
          bestNpcDist = d;
          bestNpc = npc.id;
        }
      }
      this.nearbyNpcId = bestNpc;
    } else if (this.worldMode === 'ocean' && this.oceanRig) {
      this.nearbyNpcId = null;
      this.nearbyOverworldZoneDoor = null;
      this.nearbyDoorIndex = null;
      this.nearbyDungeonGuardian = false;
      this.nearPrisonKey = false;
      this.nearHiddenPrison = false;
      this.nearPortal = false;
      this.nearCraftingTable = false;
      this.nearDungeonExit =
        Math.hypot(
          this.heroPos.x - this.oceanRig.buoyPos.x,
          this.heroPos.z - this.oceanRig.buoyPos.z,
        ) < 5.2 ||
        (this.heroPos.y > -1.75 && this.heroPos.z > 24);
    } else {
      this.nearbyOverworldZoneDoor = null;
      this.nearCraftingTable = false;
      this.nearbyDungeonGuardian = false;
      this.nearPrisonKey = false;
      this.nearHiddenPrison = false;
    }

    // Word Monster Contact -> Duel Rebutan (skip cave mobs & 40% combatOnly brawlers!)
    let bestMonster: RoamingMonster | null = null;
    let bestMonsterDist = 5.0;
    for (const m of this.getActiveMonsters()) {
      if (!m.alive || m.angryTimer > 0 || m.isCaveMob || m.combatOnly) continue;
      if (m.isSkyMonster && Math.abs((m.y ?? 12) - (this.heroPos.y + 1.4)) > 3.4) continue;
      const d = Math.hypot(this.heroPos.x - m.x, this.heroPos.z - m.z);
      if (d < bestMonsterDist) {
        bestMonsterDist = d;
        bestMonster = m;
      }
      let triggerDist = TUNE.contactDist;
      if (this.worldMode === 'dungeon') {
        for (const t of this.caveTorches) {
          if (Math.hypot(m.x - t.x, m.z - t.z) < 6.0) {
            triggerDist = 1.65;
            break;
          }
        }
      }
      if (this.carMode === 'none' && this.planeMode === 'none' && d < triggerDist && this.encounterGraceTimer <= 0) {
        this.engageMonster(m);
        break;
      }
    }
    this.nearbyMonsterId = bestMonster?.id ?? null;

    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.bannerMessage = null;
    }
  }

  private spawnCaveBoulder(tx: number, tz: number): void {
    if (!this.dungeonRig) return;
    const rockGeo = new THREE.DodecahedronGeometry(0.95, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      emissive: 0x7c2d12,
      emissiveIntensity: 0.35,
      roughness: 0.85,
      metalness: 0.12,
    });
    const rockMesh = new THREE.Mesh(rockGeo, rockMat);
    rockMesh.position.set(tx, 9.2, tz);
    rockMesh.castShadow = true;

    const ringGeo = new THREE.RingGeometry(0.95, 1.55, 20);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(tx, 0.06, tz);

    this.dungeonRig.group.add(rockMesh, ringMesh);
    const maxTime = this.settings.difficulty === 'pendekar' ? 1.15 : 1.4;
    this.caveBoulders.push({
      x: tx,
      z: tz,
      timer: maxTime,
      maxTime,
      rockMesh,
      ringMesh,
    });
  }

  private updateDungeonHazards(dt: number): void {
    const rig = this.dungeonRig;
    if (!rig) return;

    // 1. Alternating Environmental Floor Traps (disarmed once Boss is defeated!)
    const bossCleared = Boolean(this.dungeonState?.bossDefeated);
    const period = 4.6;
    for (const trap of rig.traps) {
      const phaseT = (this.elapsed + (trap.phaseOffset > 0 ? 2.3 : 0)) % period;
      if (bossCleared || phaseT < 2.2) {
        trap.active = false;
        trap.coreMat.emissive.setHex(trap.kind === 'lava' ? 0x7c2d12 : 0x334155);
        trap.coreMat.emissiveIntensity = bossCleared ? 0.1 : 0.25;
        if (trap.spikesGroup) {
          trap.spikesGroup.position.y = THREE.MathUtils.lerp(
            trap.spikesGroup.position.y,
            -0.42,
            1 - Math.exp(-12 * dt),
          );
        }
      } else if (phaseT < 3.0) {
        trap.active = false;
        trap.coreMat.emissive.setHex(0xf59e0b);
        trap.coreMat.emissiveIntensity = 0.75 + Math.sin(this.elapsed * 26) * 0.35;
        if (trap.spikesGroup) {
          trap.spikesGroup.position.y = -0.2 + Math.sin(this.elapsed * 32) * 0.04;
        }
      } else {
        trap.active = true;
        trap.coreMat.emissive.setHex(trap.kind === 'lava' ? 0xf97316 : 0xe11d48);
        trap.coreMat.emissiveIntensity = 1.65;
        if (trap.spikesGroup) {
          trap.spikesGroup.position.y = THREE.MathUtils.lerp(
            trap.spikesGroup.position.y,
            0.36,
            1 - Math.exp(-18 * dt),
          );
        }
      }

      if (
        !bossCleared &&
        this.phase === 'playing' &&
        trap.active &&
        this.encounterGraceTimer <= 0 &&
        Math.abs(this.heroPos.x - trap.x) < trap.halfW &&
        Math.abs(this.heroPos.z - trap.z) < trap.halfW
      ) {
        this.hp = Math.max(0, this.hp - 1);
        this.encounterGraceTimer = 1.6;
        soundEngine.playHurt();
        this.spawnBurst(
          trap.x,
          1.0,
          trap.z,
          trap.kind === 'lava' ? 0xf97316 : 0xf43f5e,
          14,
        );
        const px = this.heroPos.x - trap.x;
        const pz = this.heroPos.z - trap.z;
        const pLen = Math.max(0.2, Math.hypot(px, pz));
        this.heroVel.set((px / pLen) * 14, 0, (pz / pLen) * 14);
        this.showBanner(
          trap.kind === 'lava'
            ? 'Awas Lantai Lava! Tunggu meredup sebelum melangkah (-1 ❤️)'
            : 'Kena Jebakan Duri! Tunggu duri turun sebelum lewat (-1 ❤️)',
          2.4,
        );
        this.triggerDamageFlash(
          1,
          trap.kind === 'lava' ? 'Lantai Lava Gua' : 'Jebakan Duri Gua',
          { x: trap.x, z: trap.z },
        );
        if (this.hp <= 0) {
          this.triggerDefeatExit(this.dungeonState?.zoneId);
          return;
        }
      }
    }

    // 2. Boss-Phase Falling Stalactite Boulders
    if (
      this.phase === 'playing' &&
      this.dungeonState?.bossSpawned &&
      !this.dungeonState.bossDefeated
    ) {
      this.bossBoulderTimer -= dt;
      if (this.bossBoulderTimer <= 0 && this.caveBoulders.length < 3) {
        this.bossBoulderTimer = this.settings.difficulty === 'pendekar' ? 2.1 : 2.9;
        const tx = THREE.MathUtils.clamp(
          this.heroPos.x + (Math.random() - 0.5) * 4.8,
          -17,
          17,
        );
        const tz = THREE.MathUtils.clamp(
          this.heroPos.z + (Math.random() - 0.5) * 4.8,
          -17,
          17,
        );
        this.spawnCaveBoulder(tx, tz);
      }
    }

    for (let i = this.caveBoulders.length - 1; i >= 0; i--) {
      const b = this.caveBoulders[i];
      if (this.phase === 'playing') {
        b.timer -= dt;
      }
      const frac = Math.max(0, b.timer / b.maxTime);
      b.rockMesh.position.y = 0.85 + 8.4 * frac * frac;
      b.rockMesh.rotation.x += dt * 3.2;
      b.rockMesh.rotation.y += dt * 2.4;
      b.ringMesh.scale.setScalar(0.88 + Math.sin(this.elapsed * 24) * 0.14);

      if (b.timer <= 0) {
        if (b.rockMesh.parent) b.rockMesh.parent.remove(b.rockMesh);
        if (b.ringMesh.parent) b.ringMesh.parent.remove(b.ringMesh);
        b.rockMesh.geometry.dispose();
        (b.rockMesh.material as THREE.Material).dispose();
        b.ringMesh.geometry.dispose();
        (b.ringMesh.material as THREE.Material).dispose();
        this.caveBoulders.splice(i, 1);

        this.spawnBurst(b.x, 0.9, b.z, 0xf97316, 18);
        soundEngine.playBoom();

        // Placed Blok Pelindung absorbs falling boulders!
        let absorbedByShield = false;
        for (const blk of rig.caveBlocks) {
          if (
            blk.alive &&
            blk.kind === 'player_shield' &&
            Math.hypot(blk.x - b.x, blk.z - b.z) < 1.65
          ) {
            absorbedByShield = true;
            blk.hp -= 1;
            blk.mesh.scale.setScalar(0.9);
            if (blk.hp <= 0) {
              blk.alive = false;
              blk.mesh.visible = false;
              if (blk.crackMesh) blk.crackMesh.visible = false;
              this.spawnBurst(blk.x, blk.y + 0.1, blk.z, 0x38bdf8, 14);
              this.showBanner('Blok Pelindung pecah menahan batu runtuh gua!', 2.2);
            } else {
              this.updateBlockCrackVisual(blk);
              this.showBanner('Blok Pelindung menahan batu runtuh gua!', 1.8);
            }
            break;
          }
        }

        if (
          !absorbedByShield &&
          this.phase === 'playing' &&
          this.encounterGraceTimer <= 0 &&
          Math.hypot(this.heroPos.x - b.x, this.heroPos.z - b.z) < 1.75
        ) {
          this.hp = Math.max(0, this.hp - 1);
          this.encounterGraceTimer = 1.6;
          soundEngine.playHurt();
          this.showBanner(
            'Kena Batu Runtuh Bos! Hindari lingkaran merah di lantai (-1 ❤️)',
            2.4,
          );
          this.triggerDamageFlash(1, 'Batu Runtuh Bos Gua', { x: b.x, z: b.z });
          if (this.hp <= 0) {
            this.triggerDefeatExit(this.dungeonState?.zoneId);
            return;
          }
        }
      }
    }

    // 3. Lava Chasm Trenches (must Jump across or bridge with Blok Pelindung)
    for (const chasm of rig.chasms) {
      chasm.lavaMat.emissiveIntensity = 1.2 + Math.sin(this.elapsed * 4.5 + chasm.x) * 0.35;
      if (
        this.phase === 'playing' &&
        this.encounterGraceTimer <= 0 &&
        Math.abs(this.heroPos.x - chasm.x) < chasm.halfW &&
        Math.abs(this.heroPos.z - chasm.z) < chasm.halfD &&
        this.heroPos.y <= 0.35
      ) {
        this.hp = Math.max(0, this.hp - 1);
        this.encounterGraceTimer = 1.5;
        this.heroVelY = 9.5;
        this.heroOnGround = false;
        const pushDirZ = this.heroPos.z >= chasm.z ? 1 : -1;
        this.heroVel.z = pushDirZ * 12;
        soundEngine.playHurt();
        this.spawnBurst(this.heroPos.x, 0.7, this.heroPos.z, 0xf97316, 16);
        this.showBanner(
          'Awas Jurang Lava! Lompat (⬆️ / J) atau pasang Blok Pelindung sebagai jembatan (-1 ❤️)',
          2.6,
        );
        this.triggerDamageFlash(1, 'Jatuh ke Jurang Lava Gua', { x: chasm.x, z: chasm.z });
        if (this.hp <= 0) {
          this.triggerDefeatExit(this.dungeonState?.zoneId);
          return;
        }
      }
    }

    // 4. Placed Mining TNT Fuse & Detonation
    for (let i = this.activeTnts.length - 1; i >= 0; i--) {
      const tnt = this.activeTnts[i];
      if (this.phase === 'playing') {
        tnt.timer -= dt;
      }
      const pulse = 1 + Math.abs(Math.sin(this.elapsed * 22)) * 0.16;
      tnt.mesh.scale.setScalar(pulse);
      if (tnt.timer <= 0) {
        if (tnt.mesh.parent) tnt.mesh.parent.remove(tnt.mesh);
        this.activeTnts.splice(i, 1);
        soundEngine.playBoom();
        this.spawnBurst(tnt.x, tnt.y + 1.0, tnt.z, 0xf97316, 40);
        this.spawnBurst(tnt.x, tnt.y + 1.2, tnt.z, 0xfacc15, 22);

        let blocksBroken = 0;
        let shieldsCracked = 0;
        let mobsSlain = 0;
        let shieldSavedHero = false;

        for (const blk of rig.caveBlocks) {
          if (!blk.alive) continue;
          const dist = Math.hypot(blk.x - tnt.x, blk.z - tnt.z);
          if (blk.kind === 'player_shield') {
            if (dist < 4.5) shieldSavedHero = true;
            continue;
          }
          if (dist < 4.35) {
            if (blk.kind === 'word_seal' && blk.hp > 3) {
              blk.hp -= 3;
              this.updateBlockCrackVisual(blk);
            } else {
              this.shatterCaveBlock(blk, false);
              blocksBroken += 1;
            }
          }
        }

        for (const m of this.dungeonMonsters) {
          if (!m.alive) continue;
          if (Math.hypot(m.x - tnt.x, m.z - tnt.z) < 5.2) {
            if (m.isCaveMob) {
              m.alive = false;
              m.mesh.visible = false;
              m.respawnTimer = 0;
              mobsSlain += 1;
              this.monstersDefeated += 1;
              this.gainXp(15);
              this.addScore(m.rewardScore);
              this.spawnBurst(m.x, (m.y ?? 0) + 1.2, m.z, 0xfbbf24, 18);
            } else if (m.combatOnly) {
              m.mobHp = (m.mobHp ?? m.maxMobHp ?? 4) - 3;
              m.aggroActive = true;
              m.hitFlashTimer = 0.25;
              if (m.mobHp <= 0) {
                mobsSlain += 1;
                this.handleRealTimeMonsterDefeated(m);
              } else {
                this.spawnBurst(m.x, 1.8, m.z, 0xef4444, 16);
              }
            } else {
              m.stanceHp = 0;
              m.angryTimer = 0.55;
              shieldsCracked += 1;
              this.spawnBurst(m.x, 1.8, m.z, 0xf59e0b, 14);
            }
          }
        }

        for (const s of this.shooters) {
          if (!s.alive) continue;
          if (Math.hypot(s.x - tnt.x, s.z - tnt.z) < 5.0) {
            s.alive = false;
            s.mesh.visible = false;
            s.respawnTimer = 0;
            mobsSlain += 1;
            this.monstersDefeated += 1;
            if (s.isNightShooter) {
              const savedEntry = this.nightShooterSaved.find((entry) => entry.id === s.id);
              if (savedEntry) savedEntry.alive = false;
            } else if (this.worldMode === 'dungeon' && this.dungeonState) {
              this.markDungeonEnemyDefeated(this.dungeonState.zoneId, s.id);
            } else if (this.worldMode === 'academy') {
              this.defeatedAcademyEnemyIds.add(s.id);
            }
            this.gainXp(5);
            this.addScore(120);
            this.spawnBurst(s.x, 1.5, s.z, 0xfbbf24, 16);
          }
        }
        this.syncDungeonMonsterStats();

        const heroDist = Math.hypot(this.heroPos.x - tnt.x, this.heroPos.z - tnt.z);
        if (
          !shieldSavedHero &&
          this.phase === 'playing' &&
          this.encounterGraceTimer <= 0 &&
          heroDist < 3.1
        ) {
          this.hp = Math.max(0, this.hp - 1);
          this.encounterGraceTimer = 1.4;
          soundEngine.playHurt();
          this.triggerDamageFlash(1, 'Ledakan TNT di jarak dekat', { x: tnt.x, z: tnt.z });
          if (this.hp <= 0) {
            this.triggerDefeatExit(this.dungeonState?.zoneId);
            return;
          }
        }

        this.showBanner(
          `💥 BOOM TNT! ${blocksBroken} balok hancur · ${shieldsCracked} perisai retak · ${mobsSlain} monster tumbang!`,
          3.2,
        );
        this.saveProgress();
        this.pushHud(true);
      }
    }
  }

  private resolveCaveBlockCollisions(): void {
    if (!this.dungeonRig) return;
    const heroR = 0.65;
    const pushBox = (bx: number, bz: number, hw: number, hd = hw) => {
      const cx = THREE.MathUtils.clamp(this.heroPos.x, bx - hw, bx + hw);
      const cz = THREE.MathUtils.clamp(this.heroPos.z, bz - hd, bz + hd);
      const dx = this.heroPos.x - cx;
      const dz = this.heroPos.z - cz;
      const distSq = dx * dx + dz * dz;
      if (distSq < heroR * heroR) {
        if (distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const overlap = heroR - dist;
          this.heroPos.x += (dx / dist) * overlap;
          this.heroPos.z += (dz / dist) * overlap;
        } else {
          const penX = hw + heroR - Math.abs(this.heroPos.x - bx);
          const penZ = hd + heroR - Math.abs(this.heroPos.z - bz);
          if (penX < penZ) {
            this.heroPos.x += this.heroPos.x >= bx ? penX : -penX;
          } else {
            this.heroPos.z += this.heroPos.z >= bz ? penZ : -penZ;
          }
        }
      }
    };

    for (const col of this.dungeonRig.caveColliders) {
      pushBox(col.x, col.z, col.halfW);
    }
    pushBox(this.dungeonRig.guardianPos.x, this.dungeonRig.guardianPos.z, 0.7);
    if (!this.dungeonState?.prisonUnlocked) {
      pushBox(this.dungeonRig.prisonPos.x, this.dungeonRig.prisonPos.z, 1.8);
    }
    for (const p of this.dungeonRig.platforms) {
      if (this.heroPos.y < p.topY - 0.55) {
        pushBox(p.x, p.z, p.halfW, p.halfD);
      }
    }
    for (const blk of this.dungeonRig.caveBlocks) {
      if (!blk.alive) continue;
      const topY = blk.y + 1.1;
      const botY = blk.y - 1.1;
      if (this.heroPos.y < topY - 0.55 && this.heroPos.y + 1.8 > botY) {
        pushBox(blk.x, blk.z, blk.halfW);
      }
    }
  }

  private updateCaveTargeting(): void {
    const rig = this.dungeonRig;
    if (!rig) return;

    let bestBlock: CaveBlockDef | null = null;
    if (this.cameraMode === 'first_person') {
      this.pointerNdc.set(0, 0);
      this.raycaster.setFromCamera(this.pointerNdc, this.camera);
      const aliveMeshes = rig.caveBlocks.filter((b) => b.alive).map((b) => b.mesh);
      const hits = this.raycaster.intersectObjects(aliveMeshes, false);
      if (hits.length > 0 && hits[0].distance <= 7.2) {
        const id = hits[0].object.userData.caveBlockId as string | undefined;
        if (id) {
          bestBlock = rig.caveBlocks.find((b) => b.id === id && b.alive) || null;
        }
      }
    }

    if (!bestBlock) {
      const fX =
        this.cameraMode === 'first_person'
          ? -Math.sin(this.cameraYaw)
          : Math.sin(this.heroYaw);
      const fZ =
        this.cameraMode === 'first_person'
          ? -Math.cos(this.cameraYaw)
          : Math.cos(this.heroYaw);

      let bestScore = Infinity;
      for (const blk of rig.caveBlocks) {
        if (!blk.alive) continue;
        const dx = blk.x - this.heroPos.x;
        const dz = blk.z - this.heroPos.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 4.2) continue;
        const dot = (dx * fX + dz * fZ) / Math.max(0.01, dist);
        if (dot > 0.25) {
          const score = dist - dot * 1.4;
          if (score < bestScore) {
            bestScore = score;
            bestBlock = blk;
          }
        }
      }
    }

    this.targetedCaveBlock = bestBlock;
    if (bestBlock) {
      rig.blockHighlight.position.set(bestBlock.x, bestBlock.y, bestBlock.z);
      rig.blockHighlight.visible = true;
    } else {
      rig.blockHighlight.visible = false;
    }

    if (this.activeHotbarSlot === 9 && this.caveTorchesLeft > 0) {
      const dirX =
        this.cameraMode === 'first_person'
          ? -Math.sin(this.cameraYaw)
          : Math.sin(this.heroYaw);
      const dirZ =
        this.cameraMode === 'first_person'
          ? -Math.cos(this.cameraYaw)
          : Math.cos(this.heroYaw);
      const px = THREE.MathUtils.clamp(this.heroPos.x + dirX * 2.1, -19.2, 19.2);
      const pz = THREE.MathUtils.clamp(this.heroPos.z + dirZ * 2.1, -19.2, 19.2);
      rig.torchPreview.position.set(px, 0.04, pz);
      rig.torchPreview.visible = true;
    } else {
      rig.torchPreview.visible = false;
    }

    if (this.activeHotbarSlot === 10 && this.caveShieldBlocksLeft > 0) {
      const { x: bx, y: by, z: bz } = this.getShieldPlacementCoords();
      rig.blockPlacePreview.position.set(bx, by, bz);
      rig.blockPlacePreview.visible = true;
    } else {
      rig.blockPlacePreview.visible = false;
    }
  }

  private updateShootersAndProjectiles(dt: number): void {
    const diff = DIFF_CONFIG[this.settings.difficulty];

    const isOverworldGuest =
      this.worldMode === 'overworld' && this.multiplayerActive && !this.isWorldAuthority();
    const guestBlend = 1 - Math.exp(-10 * dt);

    const hideShootersInPrologue =
      this.phase === 'story' && this.storyDialog?.kind === 'prologue';
    for (const s of this.shooters) {
      if (hideShootersInPrologue) {
        s.mesh.visible = false;
        continue;
      }
      if (!s.alive) {
        if (
          !isOverworldGuest &&
          s.respawnTimer > 0 &&
          !s.isNightShooter &&
          this.worldMode !== 'dungeon' &&
          this.worldMode !== 'academy' &&
          !(s.id.startsWith('boss_guard_') && this.dungeonState?.bossDefeated)
        ) {
          s.respawnTimer -= dt;
          if (s.respawnTimer <= 0) {
            s.alive = true;
            s.hp = 3;
            s.x = s.homeX;
            s.z = s.homeZ;
            s.prevX = s.homeX;
            s.prevZ = s.homeZ;
            s.recoilTimer = 0;
            s.hitSquashTimer = 0;
            s.mesh.visible = true;
          }
        }
        continue;
      }

      if (isOverworldGuest) {
        s.hitSquashTimer = Math.max(0, s.hitSquashTimer - dt);
        const tgt = this.peerMonsterTargets.get(`sh_${s.id}`);
        let sSpd = 0;
        if (tgt) {
          const prevX = s.x;
          const prevZ = s.z;
          s.x = THREE.MathUtils.lerp(s.x, tgt.x, guestBlend);
          s.z = THREE.MathUtils.lerp(s.z, tgt.z, guestBlend);
          sSpd = Math.hypot(s.x - prevX, s.z - prevZ) / Math.max(0.001, dt);
        }
        s.walkPhase += dt * (4.2 + sSpd * 1.4);
        const sGroundY = getArchipelagoGroundY(s.x, s.z);
        s.mesh.position.set(s.x, sGroundY, s.z);
        s.mesh.rotation.y = Math.atan2(this.heroPos.x - s.x, this.heroPos.z - s.z);
        animateShooterRig(s.mesh, {
          speed: sSpd,
          walkPhase: s.walkPhase,
          aimAlpha: 0.25,
          recoil: 0,
          hitSquash: s.hitSquashTimer > 0 ? s.hitSquashTimer / 0.24 : 0,
          elapsed: this.elapsed,
          phase: s.phase,
          dt,
        });
        continue;
      }

      if (s.sunburnTimer !== undefined) {
        s.sunburnTimer -= dt;
        s.mesh.position.set(
          s.x + Math.sin(this.elapsed * 50 + s.phase) * 0.14,
          Math.abs(Math.sin(this.elapsed * 22)) * 0.25,
          s.z + Math.cos(this.elapsed * 45 + s.phase) * 0.14,
        );
        if (s.sunburnTimer <= 0) {
          s.sunburnTimer = undefined;
          s.alive = false;
          s.mesh.visible = false;
          if (s.isNightShooter) {
            const savedEntry = this.nightShooterSaved.find((entry) => entry.id === s.id);
            if (savedEntry) savedEntry.alive = false;
          }
          if (s.mesh.parent) s.mesh.parent.remove(s.mesh);
          soundEngine.playBoom();
          this.spawnBurst(s.x, 1.5, s.z, 0xff7a00, 26);
          this.spawnBurst(s.x, 2.0, s.z, 0xfacc15, 14);
        }
        continue;
      }

      s.recoilTimer = Math.max(0, s.recoilTimer - dt);
      s.hitSquashTimer = Math.max(0, s.hitSquashTimer - dt);

      if (s.patrolClock === undefined) {
        s.patrolClock = s.phase;
        s.idleRoamTimer = 4.2 + (s.phase % 3.0);
        s.idleRestTimer = 0;
      }
      const distToHeroPre = Math.hypot(this.heroPos.x - s.x, this.heroPos.z - s.z);
      let nextSx = s.x;
      let nextSz = s.z;
      if (distToHeroPre >= 22 && (s.idleRestTimer ?? 0) > 0) {
        s.idleRestTimer = Math.max(0, (s.idleRestTimer ?? 0) - dt);
        if ((s.idleRestTimer ?? 0) <= 0) {
          s.idleRoamTimer = 4.5 + Math.random() * 3.5;
        }
      } else {
        s.patrolClock += dt * 0.9;
        if (distToHeroPre >= 22) {
          s.idleRoamTimer = (s.idleRoamTimer ?? 4.5) - dt;
          if ((s.idleRoamTimer ?? 0) <= 0) {
            s.idleRestTimer = 2.8 + Math.random() * 2.6;
          }
        }
        const p = s.patrolClock;
        nextSx = s.homeX + Math.cos(p) * 3.5;
        nextSz = s.homeZ + Math.sin(p) * 2.5;
      }
      const sRad = 0.88;
      const pushShooterBox = (bx: number, bz: number, hw: number, hd = hw) => {
        const cx = THREE.MathUtils.clamp(nextSx, bx - hw, bx + hw);
        const cz = THREE.MathUtils.clamp(nextSz, bz - hd, bz + hd);
        const dx = nextSx - cx;
        const dz = nextSz - cz;
        const distSq = dx * dx + dz * dz;
        if (distSq < sRad * sRad && distSq > 0.0001) {
          const d = Math.sqrt(distSq);
          nextSx += (dx / d) * (sRad - d);
          nextSz += (dz / d) * (sRad - d);
        }
      };

      if (this.worldMode === 'overworld') {
        const sClamp = this._desaColScratch;
        sClamp.x = nextSx;
        sClamp.z = nextSz;
        const sPreY = getArchipelagoGroundY(s.x, s.z);
        resolveObstacleBoxes(sClamp, sRad, this.villageRig.obstacles, sPreY, 2.2);
        this.resolveActiveDesaPickupBoxes(sClamp, sRad);
        resolveArchipelagoVehicleCollisions(this.archipelagoRig, sClamp, sRad, 2.2);
        this.resolveWorldVehiclesCollision(sClamp, sRad, 2.2);
        if (this.worldObstaclesRig) {
          resolveSolidObstacleCollisions(this.worldObstaclesRig, sClamp, sRad, 2.2);
        }
        if (this.isInDesaSapaanArea(sClamp.x, sClamp.z)) {
          resolveCircleDesaVisualTerrain(this.archipelagoRig, sClamp, sRad, sPreY + 0.95);
          this.resolveDesaLivingSeparation(
            sClamp,
            sRad,
            getArchipelagoGroundY(sClamp.x, sClamp.z),
            undefined,
            s,
          );
          resolveObstacleBoxes(sClamp, sRad, this.villageRig.obstacles, sPreY, 2.2);
          this.resolveActiveDesaPickupBoxes(sClamp, sRad);
          resolveArchipelagoVehicleCollisions(this.archipelagoRig, sClamp, sRad, 2.2);
          this.resolveWorldVehiclesCollision(sClamp, sRad, 2.2);
          if (this.worldObstaclesRig) {
            resolveSolidObstacleCollisions(this.worldObstaclesRig, sClamp, sRad, 2.2);
          }
          resolveCircleDesaVisualTerrain(this.archipelagoRig, sClamp, sRad, sPreY + 0.95);
        } else {
          for (const npc of this.npcs.values()) {
            this.pushCircle2d(sClamp, npc.x, npc.z, sRad + 0.7);
          }
        }
        constrainToWalkableArchipelago(sClamp, 0.88);
        nextSx = sClamp.x;
        nextSz = sClamp.z;
      } else if (this.worldMode === 'dungeon' && this.dungeonRig) {
        for (const col of this.dungeonRig.caveColliders) {
          pushShooterBox(col.x, col.z, col.halfW);
        }
        for (const blk of this.dungeonRig.caveBlocks) {
          if (blk.alive) pushShooterBox(blk.x, blk.z, blk.halfW);
        }
        nextSx = THREE.MathUtils.clamp(nextSx, -18, 18);
        nextSz = THREE.MathUtils.clamp(nextSz, -18, 18);
      }

      const sSpeed = Math.hypot(nextSx - s.prevX, nextSz - s.prevZ) / Math.max(0.001, dt);
      s.x = nextSx;
      s.z = nextSz;
      s.prevX = nextSx;
      s.prevZ = nextSz;
      s.walkPhase += dt * (4.2 + sSpeed * 1.4);

      const sGroundY = this.worldMode === 'overworld' ? getArchipelagoGroundY(s.x, s.z) : 0;
      s.mesh.position.set(s.x, sGroundY, s.z);
      const nearestPlayer =
        this.worldMode === 'overworld' && this.multiplayerActive
          ? this.getNearestPlayerTarget(s.x, s.z, 'overworld')
          : {
              dx: this.heroPos.x - s.x,
              dz: this.heroPos.z - s.z,
              dist: Math.hypot(this.heroPos.x - s.x, this.heroPos.z - s.z),
            };
      const lookYaw = Math.atan2(nearestPlayer.dx, nearestPlayer.dz);
      s.mesh.rotation.y = lookYaw;

      s.cooldown -= dt;
      const distToHero = nearestPlayer.dist;
      const aimAlpha =
        distToHero < 26 && s.cooldown < 0.75
          ? THREE.MathUtils.clamp(1 - s.cooldown / 0.75, 0.25, 1)
          : distToHero < 26
          ? 0.22
          : 0.02;

      if (s.cooldown <= 0 && distToHero < 26) {
        s.cooldown = diff.shooterCooldown;
        s.recoilTimer = 0.28;
        const muzzleX = s.x + Math.sin(lookYaw) * 1.15;
        const muzzleZ = s.z + Math.cos(lookYaw) * 1.15;
        const vx = Math.sin(lookYaw) * diff.shooterBulletSpeed;
        const vz = Math.cos(lookYaw) * diff.shooterBulletSpeed;
        this.spawnBurst(muzzleX, sGroundY + 1.48, muzzleZ, 0xf43f5e, 6);
        this.spawnProjectile({
          fromPlayer: false,
          x: muzzleX,
          y: sGroundY + 1.48,
          z: muzzleZ,
          vx,
          vz,
          damage: 1,
          shieldDamage: 1,
          pierceLeft: 0,
          colorHex: 0xf43f5e,
        });
        if (this.worldMode === 'overworld' && this.multiplayerActive && this.hasConnectedPeers && this.isWorldAuthority()) {
          this.emitMultiplayerPacket({
            t: 'shot',
            fp: false,
            x: Math.round(muzzleX * 100) / 100,
            y: Math.round((sGroundY + 1.48) * 100) / 100,
            z: Math.round(muzzleZ * 100) / 100,
            vx: Math.round(vx * 100) / 100,
            vy: 0,
            vz: Math.round(vz * 100) / 100,
            col: 0xf43f5e,
            dmg: 1,
            md: 'overworld',
          });
        }
      }

      animateShooterRig(s.mesh, {
        speed: sSpeed,
        walkPhase: s.walkPhase,
        aimAlpha,
        recoil: s.recoilTimer > 0 ? Math.sin((s.recoilTimer / 0.28) * Math.PI) : 0,
        hitSquash: s.hitSquashTimer > 0 ? s.hitSquashTimer / 0.24 : 0,
        elapsed: this.elapsed,
        phase: s.phase,
        dt,
      });
    }

    for (const p of this.projectiles) {
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }
      if (p.gravity) {
        p.vy -= p.gravity * dt;
      }
      if (p.homingTargetId) {
        let tx: number | null = null;
        let ty = 0;
        let tz = 0;
        const tm = this.getActiveMonsters().find((item) => item.id === p.homingTargetId && item.alive);
        if (tm) {
          const spec = MONSTER_SPECS[tm.type];
          const mBaseY =
            tm.y ??
            (this.worldMode === 'overworld'
              ? getArchipelagoGroundY(tm.x, tm.z) + spec.hoverY
              : spec.hoverY);
          tx = tm.x;
          ty = mBaseY + (tm.isBoss ? 2.1 : spec.hitCenterY);
          tz = tm.z;
        } else {
          const ts = this.shooters.find((item) => item.id === p.homingTargetId && item.alive);
          if (ts) {
            tx = ts.x;
            ty = (this.worldMode === 'overworld' ? getArchipelagoGroundY(ts.x, ts.z) : 0) + 1.45;
            tz = ts.z;
          }
        }
        if (tx !== null) {
          const curSpd = Math.max(12, Math.hypot(p.vx, p.vy, p.vz));
          const dx = tx - p.x;
          const dy = ty - (p.y ?? 1.35);
          const dz = tz - p.z;
          const d3 = Math.max(0.5, Math.hypot(dx, dy, dz));
          const steerAlpha = 1 - Math.exp(-5.6 * dt);
          p.vx = THREE.MathUtils.lerp(p.vx, (dx / d3) * curSpd, steerAlpha);
          p.vy = THREE.MathUtils.lerp(p.vy, (dy / d3) * curSpd, steerAlpha);
          p.vz = THREE.MathUtils.lerp(p.vz, (dz / d3) * curSpd, steerAlpha);
        }
      }
      p.x += p.vx * dt;
      p.y = (p.y ?? 1.35) + p.vy * dt;
      p.z += p.vz * dt;
      const projFloor =
        this.worldMode === 'overworld'
          ? getArchipelagoGroundY(p.x, p.z)
          : this.worldMode === 'ocean'
          ? getOceanFloorY(p.x, p.z)
          : 0;
      if (p.y < projFloor + 0.06) {
        p.active = false;
        p.mesh.visible = false;
        if (p.fromPlayer && p.aoeRadius) {
          this.triggerPlaneExplosionAoe(
            p.x,
            projFloor + 0.25,
            p.z,
            p.aoeRadius,
            p.damage,
            p.shieldDamage,
            p.explosionColor ?? 0xf97316,
          );
        } else {
          this.spawnBurst(p.x, projFloor + 0.12, p.z, 0x94a3b8, 5);
        }
        continue;
      }
      p.mesh.position.set(p.x, p.y, p.z);
      p.mesh.rotation.y += dt * 8;

      if (this.worldMode === 'overworld') {
        let hitSolid = false;
        for (const obs of this.villageRig.obstacles) {
          let insideObs = false;
          if (obs.rotY) {
            const span = obs.halfW + obs.halfD + 0.16;
            const rx = p.x - obs.x;
            const rz = p.z - obs.z;
            if (Math.abs(rx) <= span && Math.abs(rz) <= span) {
              const cos = Math.cos(obs.rotY);
              const sin = Math.sin(obs.rotY);
              const lx = rx * cos - rz * sin;
              const lz = rx * sin + rz * cos;
              insideObs = Math.abs(lx) < obs.halfW + 0.16 && Math.abs(lz) < obs.halfD + 0.16;
            }
          } else {
            insideObs = Math.abs(p.x - obs.x) < obs.halfW + 0.16 && Math.abs(p.z - obs.z) < obs.halfD + 0.16;
          }
          if (insideObs) {
            const baseY = getArchipelagoGroundY(obs.x, obs.z);
            const obsH = obs.halfW >= 2.2 ? 6.8 : 4.0;
            if (p.y >= baseY - 0.2 && p.y <= baseY + obsH) {
              hitSolid = true;
              break;
            }
          }
        }
        if (!hitSolid && this.archipelagoUnderwaterRig && (p.y ?? 0) < -0.5) {
          const pTmp = { x: p.x, y: p.y ?? 0, z: p.z };
          if (resolveOceanSolidCollisions(pTmp, this.archipelagoUnderwaterRig.colliders, 0.18, 0.35)) {
            hitSolid = true;
          }
        }
        if (hitSolid) {
          p.active = false;
          p.mesh.visible = false;
          if (p.fromPlayer && p.aoeRadius) {
            this.triggerPlaneExplosionAoe(
              p.x,
              p.y,
              p.z,
              p.aoeRadius,
              p.damage,
              p.shieldDamage,
              p.explosionColor ?? 0xf97316,
            );
          } else {
            this.spawnBurst(p.x, p.y, p.z, 0x94a3b8, 5);
          }
          continue;
        }
      } else if (this.worldMode === 'ocean' && this.oceanRig) {
        const pTmp = { x: p.x, y: p.y ?? 0, z: p.z };
        if (resolveOceanSolidCollisions(pTmp, this.oceanRig.colliders, 0.18, 0.35)) {
          p.active = false;
          p.mesh.visible = false;
          this.spawnBurst(p.x, p.y, p.z, 0x38bdf8, 6);
          continue;
        }
      }

      if (this.worldMode === 'dungeon' && this.dungeonRig) {
        let hitWall = false;
        let hitColor = 0x94a3b8;
        for (const col of this.dungeonRig.caveColliders) {
          if (Math.abs(p.x - col.x) < col.halfW + 0.25 && Math.abs(p.z - col.z) < col.halfW + 0.25) {
            hitWall = true;
            break;
          }
        }
        if (!hitWall) {
          for (const blk of this.dungeonRig.caveBlocks) {
            if (!blk.alive) continue;
            // Player shots pass over/through their own placed shield blocks!
            if (p.fromPlayer && blk.kind === 'player_shield') continue;
            if (
              Math.abs(p.x - blk.x) < blk.halfW + 0.25 &&
              Math.abs(p.z - blk.z) < blk.halfW + 0.25 &&
              Math.abs(p.y - blk.y) < 1.35
            ) {
              hitWall = true;
              if (!p.fromPlayer && blk.kind === 'player_shield') {
                hitColor = 0x38bdf8;
                blk.hp -= 1;
                blk.mesh.scale.setScalar(0.9);
                soundEngine.playHit();
                if (blk.hp <= 0) {
                  blk.alive = false;
                  blk.mesh.visible = false;
                  if (blk.crackMesh) blk.crackMesh.visible = false;
                  if (this.dungeonState) {
                    const detail = this.getOrCreateZoneCaveDetail(this.dungeonState.zoneId);
                    detail.placedShieldBlocks = detail.placedShieldBlocks.filter(
                      (item) => item.id !== blk.id,
                    );
                    this.saveProgress();
                  }
                  this.spawnBurst(blk.x, blk.y + 0.1, blk.z, 0x38bdf8, 16);
                  this.showBanner('Blok Pelindung hancur menahan tembakan musuh!', 2.2);
                } else {
                  this.updateBlockCrackVisual(blk);
                  if (this.dungeonState) {
                    const savedSb = this.getOrCreateZoneCaveDetail(
                      this.dungeonState.zoneId,
                    ).placedShieldBlocks.find((item) => item.id === blk.id);
                    if (savedSb) savedSb.hp = blk.hp;
                    this.saveProgress();
                  }
                }
              }
              break;
            }
          }
        }
        if (hitWall) {
          p.active = false;
          p.mesh.visible = false;
          this.spawnBurst(p.x, p.y, p.z, hitColor, 6);
          continue;
        }
      }

      if (p.fromPlayer && !p.visualOnly) {
        // Check Hit on Shooters (3 HP -> kills for XP + Ammo + Gem)
        let consumed = false;
        for (const s of this.shooters) {
          if (!s.alive || p.hitIds.has(s.id)) continue;
          const sy = this.worldMode === 'overworld' ? getArchipelagoGroundY(s.x, s.z) : 0;
          const hitDist = p.fromPlane ? 2.4 : 1.6;
          const hitAlt = p.fromPlane ? 2.4 : 1.75;
          if (Math.hypot(p.x - s.x, p.z - s.z) < hitDist && Math.abs(p.y - (sy + 1.35)) < hitAlt) {
            p.hitIds.add(s.id);
            if (p.aoeRadius) {
              this.triggerPlaneExplosionAoe(
                p.x,
                p.y,
                p.z,
                p.aoeRadius,
                p.damage,
                p.shieldDamage,
                p.explosionColor ?? 0xf97316,
              );
              consumed = true;
              break;
            }
            if (this.worldMode === 'overworld' && this.multiplayerActive && this.hasConnectedPeers && !this.isWorldAuthority()) {
              s.hitSquashTimer = 0.24;
              s.hp = Math.max(1, s.hp - p.damage);
              soundEngine.playHit();
              this.spawnBurst(s.x, sy + 1.4, s.z, 0xf43f5e, 10);
              this.triggerHitMarker(false);
              this.emitMultiplayerPacket({
                t: 'm_hit',
                id: s.id,
                dmg: p.damage,
                dx: p.vx,
                dz: p.vz,
                md: 'overworld',
                isSh: true,
              });
              if (p.pierceLeft > 0) p.pierceLeft -= 1;
              else {
                consumed = true;
                break;
              }
              continue;
            }
            if (this.worldMode === 'overworld' && this.multiplayerActive && this.hasConnectedPeers) {
              let contribs = this.monsterDamageContributors.get(`sh_${s.id}`);
              if (!contribs) {
                contribs = new Set();
                this.monsterDamageContributors.set(`sh_${s.id}`, contribs);
              }
              contribs.add(this.localMultiplayerUid || 'host');
            }
            s.hp -= p.damage;
            s.hitSquashTimer = 0.24;
            s.x += (p.vx / Math.max(1, Math.hypot(p.vx, p.vz))) * 1.8;
            s.z += (p.vz / Math.max(1, Math.hypot(p.vx, p.vz))) * 1.8;
            soundEngine.playHit();
            this.spawnBurst(s.x, sy + 1.4, s.z, 0xf43f5e, 10);
            this.triggerHitMarker(s.hp <= 0);

            if (s.hp <= 0) {
              s.alive = false;
              s.mesh.visible = false;
              s.respawnTimer = 0;
              this.monstersDefeated += 1;
              this.localMabarStats.kills += 1;
              if (this.worldMode === 'overworld' && this.multiplayerActive && this.hasConnectedPeers && this.isWorldAuthority()) {
                const hostUid = this.localMultiplayerUid || 'host';
                const contribs = this.monsterDamageContributors.get(`sh_${s.id}`);
                const assists = contribs ? Array.from(contribs).filter((uid) => uid !== hostUid) : [];
                this.monsterDamageContributors.delete(`sh_${s.id}`);
                this.peerMonsterTargets.delete(`sh_${s.id}`);
                this.emitMultiplayerPacket({
                  t: 'm_kill',
                  id: s.id,
                  killerUid: hostUid,
                  killerName: this.localPlayerName,
                  assists,
                  isSh: true,
                  md: 'overworld',
                });
              }
              if (s.isNightShooter) {
                const savedEntry = this.nightShooterSaved.find((entry) => entry.id === s.id);
                if (savedEntry) savedEntry.alive = false;
              } else if (this.worldMode === 'dungeon' && this.dungeonState) {
                this.markDungeonEnemyDefeated(this.dungeonState.zoneId, s.id);
              } else if (this.worldMode === 'academy') {
                this.defeatedAcademyEnemyIds.add(s.id);
              }
              this.gainXp(5);
              this.addScore(120);
              soundEngine.playBoom();
              this.spawnBurst(s.x, sy + 1.6, s.z, 0xfbbf24, 20);
              let dropText = '+5 XP';
              if (Math.random() < 0.5 && this.ownedWeapons.size > 0) {
                this.weaponAmmo[this.activeWeapon] = Math.min(
                  MAX_AMMO,
                  this.weaponAmmo[this.activeWeapon] + 4,
                );
                dropText += ' · +4 Peluru!';
              }
              if (this.shooterGemsThisArea < 3 && Math.random() < 0.35) {
                this.shooterGemsThisArea += 1;
                this.diamonds += 1;
                dropText += ' · +1 💎!';
              }
              this.syncDungeonMonsterStats();
              this.showBanner(`Penembak Kalah! ${dropText}`, 2.4);
              this.saveProgress();
              this.pushHud(true);
            }

            if (p.pierceLeft > 0) p.pierceLeft -= 1;
            else {
              consumed = true;
              break;
            }
          }
        }
        if (consumed) {
          p.active = false;
          p.mesh.visible = false;
          continue;
        }

        // Check Hit on Cave Mobs, 70% Combat Brawlers, & 30% Word Monsters
        for (const m of this.getActiveMonsters()) {
          if (!m.alive || m.angryTimer > 0) continue;
          const spec = MONSTER_SPECS[m.type];
          const hitRadius = (m.isBoss ? Math.max(2.1, spec.hitRadius * 1.15) : spec.hitRadius + 0.35) + (p.fromPlane ? 1.1 : 0);
          const mBaseY =
            m.y ??
            (this.worldMode === 'overworld'
              ? getArchipelagoGroundY(m.x, m.z) + spec.hoverY
              : spec.hoverY);
          const targetCenterY = mBaseY + (m.isBoss ? 2.1 : spec.hitCenterY);
          const halfH = (m.isBoss ? Math.max(2.4, spec.hitHalfH * 1.2) : spec.hitHalfH + 0.35) + (p.fromPlane ? 0.85 : 0);
          if (Math.hypot(p.x - m.x, p.z - m.z) < hitRadius && Math.abs(p.y - targetCenterY) < halfH) {
            p.active = false;
            p.mesh.visible = false;

            if (p.aoeRadius) {
              this.triggerPlaneExplosionAoe(
                p.x,
                p.y,
                p.z,
                p.aoeRadius,
                p.damage,
                p.shieldDamage,
                p.explosionColor ?? 0xf97316,
              );
              break;
            }

            if (m.isSeaMonster && this.worldMode === 'overworld' && !p.fromPlane) {
              const eff = spec.effectiveWeapons;
              if (eff && (!p.weaponId || !eff.includes(p.weaponId))) {
                soundEngine.playNo();
                this.spawnBurst(m.x, mBaseY + 1.5, m.z, 0x38bdf8, 10);
                const usedName = p.weaponId ? WEAPONS[p.weaponId].name : 'Senjata ini';
                const minReq =
                  eff[0] === 'emas'
                    ? 'Emas / Cepat / Hijau / Langit / Berat / Kristal'
                    : eff[0] === 'saus'
                    ? 'Cepat / Hijau / Langit / Berat / Kristal'
                    : 'Hijau / Langit / Berat / Kristal';
                this.showBanner(
                  `🛡️ ${usedName} memantul dari kulit ${m.name}! Pakai senjata laut: ${minReq}!`,
                  2.6,
                );
                break;
              }
            }
            if (m.isCaveMob || m.combatOnly) {
              this.damageRealTimeMonster(m, p.damage, p.vx, p.vz);
              break;
            }

            const maxStance = spec.stanceHp;
            const curStance = m.stanceHp ?? maxStance;
            const nextStance = Math.max(0, curStance - p.shieldDamage);
            m.stanceHp = nextStance;
            soundEngine.playHit();
            this.triggerHitMarker(nextStance <= 0);

            if (nextStance > 0) {
              const spd = Math.max(1, Math.hypot(p.vx, p.vz));
              const kbX = m.x + (p.vx / spd) * 0.7;
              const kbZ = m.z + (p.vz / spd) * 0.7;
              if (m.isSkyMonster) {
                const rLimit = WORLD_OCEAN_LIMIT - 20;
                const dOut = Math.hypot(kbX, kbZ);
                if (dOut > rLimit && dOut > 0.001) {
                  m.x = (kbX / dOut) * rLimit;
                  m.z = (kbZ / dOut) * rLimit;
                } else {
                  m.x = kbX;
                  m.z = kbZ;
                }
              } else if (this.worldMode === 'overworld') {
                const kbPt = { x: kbX, z: kbZ };
                constrainToWalkableArchipelago(kbPt, 0.95);
                m.x = kbPt.x;
                m.z = kbPt.z;
              } else {
                m.x = THREE.MathUtils.clamp(kbX, -18, 18);
                m.z = THREE.MathUtils.clamp(kbZ, -18, 18);
              }
              this.spawnBurst(m.x, mBaseY + 1.8, m.z, 0x38bdf8, 8);
              this.showBanner(
                `Kena ${m.name}! Perisai Kata ${nextStance}/${maxStance} — bidik lagi!`,
                1.6,
              );
            } else if (p.fromPlane) {
              this.handleRealTimeMonsterDefeated(m);
            } else {
              m.stanceHp = maxStance;
              m.angryTimer = 0.65;
              this.spawnBurst(m.x, mBaseY + 1.8, m.z, 0xf59e0b, 14);
              this.showBanner(
                `Perisai ${m.name} pecah! Bersiap Duel Rebutan!`,
                1.6,
              );
            }
            break;
          }
        }
      } else if (!p.fromPlayer && !p.visualOnly) {
        if (this.worldMode === 'overworld') {
          let blockedByCar = false;
          for (let vi = 0; vi < this.worldVehicles.length; vi++) {
            const v = this.worldVehicles[vi];
            if (this.isPointInsideVehicleOBB(v, p.x, p.y, p.z, 0.25, 0.25, 0.35)) {
              p.active = false;
              p.mesh.visible = false;
              this.spawnBurst(p.x, p.y, p.z, 0xfbbf24, 6);
              blockedByCar = true;
              break;
            }
          }
          if (blockedByCar) continue;
          const activePlaneHit = this.planeMode !== 'none' ? this.getActivePlane() : undefined;
          if (
            activePlaneHit &&
            Math.hypot(p.x - activePlaneHit.pos.x, p.z - activePlaneHit.pos.z) < 3.4 &&
            Math.abs(p.y - (activePlaneHit.pos.y + 1.1)) < 1.9
          ) {
            p.active = false;
            p.mesh.visible = false;
            this.spawnBurst(p.x, p.y, p.z, 0x38bdf8, 6);
            continue;
          }
        }
        // Enemy projectile hitting Hoot (blocked when protected inside any car or fighter plane)
        if (
          this.carMode === 'none' &&
          this.planeMode === 'none' &&
          this.encounterGraceTimer <= 0 &&
          Math.hypot(p.x - this.heroPos.x, p.z - this.heroPos.z) < 1.35 &&
          Math.abs(p.y - (this.heroPos.y + 1.35)) < 1.85
        ) {
          p.active = false;
          p.mesh.visible = false;
          this.hp = Math.max(0, this.hp - 1);
          this.encounterGraceTimer = 1.6;
          soundEngine.playHurt();
          this.spawnBurst(this.heroPos.x, this.heroPos.y + 1.5, this.heroPos.z, 0xf43f5e, 14);
          this.triggerDamageFlash(1, 'Tembakan proyektil monster', {
            x: this.heroPos.x - p.vx,
            z: this.heroPos.z - p.vz,
          });
          if (this.hp <= 0) {
            if (this.worldMode !== 'overworld') {
              this.triggerDefeatExit(this.dungeonState?.zoneId);
            } else {
              this.phase = 'gameover';
              soundEngine.playLose();
              this.pushHud(true);
            }
          } else {
            this.showBanner('💥 Terkena tembakan monster! (-1 ❤️)', 1.9);
          }
        }
      }
    }
  }

  private updateRemotePeers(dt: number): void {
    if (this.multiplayerActive && this.remotePeers.size > 0) {
      const blend = 1 - Math.exp(-14 * dt);
      const nowMs = Date.now();
      for (const peer of this.remotePeers.values()) {
        const visible = peer.state.worldMode === this.worldMode && this.phase !== 'title';
        peer.rig.root.visible = visible;
        if (!visible) continue;

        peer.pos.lerp(peer.targetPos, blend);
        let yawDiff = peer.targetYaw - peer.yaw;
        while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
        while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
        peer.yaw += yawDiff * blend;

        peer.rig.root.position.copy(peer.pos);
        peer.rig.body.rotation.y = peer.yaw;

        const wKey = `${peer.state.activeWeapon}:${peer.state.weaponOwned ? 1 : 0}`;
        if (peer.weaponKey !== wKey) {
          peer.weaponKey = wKey;
          setHeroWeaponVisual(peer.rig, peer.state.activeWeapon, peer.state.weaponOwned);
        }

        const dSq =
          (peer.pos.x - this.heroPos.x) ** 2 + (peer.pos.z - this.heroPos.z) ** 2;
        if (dSq < 68 * 68) {
          const staleSpeed = nowMs - peer.state.updatedAtMs > 1200 ? 0 : peer.state.speed;
          applyHeroWeaponPose(peer.rig, peer.state.activeWeapon, peer.state.weaponOwned, {
            speed: staleSpeed,
            walkCycle: peer.state.walkCycle,
            aimAlpha: 0,
            recoil: 0,
            dt,
            elapsed: this.elapsed,
            aimPitch: peer.state.aimPitch,
            onGround: peer.state.onGround,
            isSwimming: peer.state.isSwimming,
          });
        }
      }
    }

    if (this.departingPeerEffects.length > 0) {
      for (let i = this.departingPeerEffects.length - 1; i >= 0; i--) {
        const fx = this.departingPeerEffects[i];
        fx.elapsed += dt;
        const t = Math.min(1, fx.elapsed / fx.duration);
        const ease = t * t;
        const scale = Math.max(0.01, 1 - ease);
        fx.rig.root.visible = this.phase !== 'title';
        fx.rig.root.scale.setScalar(scale);
        fx.rig.root.position.y = fx.startY + ease * 1.65;
        fx.rig.body.rotation.y = fx.startYaw + t * Math.PI * 3.0;
        if (t >= 1) {
          this.scene.remove(fx.rig.root);
          this.departingPeerEffects.splice(i, 1);
        }
      }
    }
  }

  private updateParticles(dt: number): void {
    if (!this.hasActiveParticles) {
      if (this.particleMesh.visible) this.particleMesh.visible = false;
      return;
    }
    let anyActive = false;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) {
        _dummy.position.set(0, -80, 0);
        _dummy.scale.setScalar(0.001);
        _dummy.updateMatrix();
        this.particleMesh.setMatrixAt(i, _dummy.matrix);
        continue;
      }
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        _dummy.position.set(0, -80, 0);
        _dummy.scale.setScalar(0.001);
        _dummy.updateMatrix();
        this.particleMesh.setMatrixAt(i, _dummy.matrix);
        continue;
      }
      anyActive = true;
      p.vy -= 16 * dt;
      p.x += p.vx * dt;
      p.y = Math.max(0.2, p.y + p.vy * dt);
      p.z += p.vz * dt;
      const s = 1 - p.life / p.maxLife;
      _dummy.position.set(p.x, p.y, p.z);
      _dummy.rotation.set(p.life * 5, p.life * 4, 0);
      _dummy.scale.setScalar(Math.max(0.05, s));
      _dummy.updateMatrix();
      this.particleMesh.setMatrixAt(i, _dummy.matrix);
    }
    this.particleMesh.instanceMatrix.needsUpdate = true;
    if (!anyActive) {
      this.hasActiveParticles = false;
      this.particleMesh.visible = false;
    }
  }

  private computeLabels(): ProjectedLabel[] {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    const labels: ProjectedLabel[] = [];

    const projectPoint = (wx: number, wy: number, wz: number): { x: number; y: number } | null => {
      _proj.set(wx, wy, wz).project(this.camera);
      if (_proj.z > 1 || _proj.z < -1) return null;
      const sx = ((_proj.x + 1) / 2) * w;
      const sy = ((-_proj.y + 1) / 2) * h;
      if (sx < 40 || sx > w - 40 || sy < 50 || sy > h - 60) return null;
      return { x: Math.round(sx), y: Math.round(sy) };
    };

    if (
      this.phase === 'story' &&
      this.storyDialog?.kind === 'prologue' &&
      this.storyDialog.step === 0 &&
      this.prologueRig
    ) {
      const t = this.storyTimer;
      const rig = this.prologueRig;
      if (t >= 4.3 && t <= 8.3) {
        const kp = projectPoint(
          rig.king.root.position.x,
          rig.king.root.position.y + 3.4,
          rig.king.root.position.z,
        );
        if (kp) {
          labels.push({
            id: 'prologue_king_hi',
            x: kp.x,
            y: kp.y,
            title: '👑 Selamat pagi, rakyat Kerajaan Kata!',
            kind: 'speech',
          });
        }
        const firstAtt = rig.royalCrowd[0];
        if (firstAtt && t >= 5.1) {
          const ap = projectPoint(
            firstAtt.mesh.position.x,
            firstAtt.mesh.position.y + 2.7,
            firstAtt.mesh.position.z,
          );
          if (ap) {
            labels.push({
              id: 'prologue_att_hi',
              x: ap.x,
              y: ap.y,
              title: 'Salam sejahtera, Baginda Raja!',
              kind: 'speech',
            });
          }
        }
      } else if (t > 8.3 && t <= 12.8) {
        const pairA = rig.villagers[0];
        const pairB = rig.villagers[3];
        const dancer = rig.villagers[6];
        if (pairA) {
          const p1 = projectPoint(pairA.x, getArchipelagoGroundY(pairA.x, pairA.z) + 2.6, pairA.z);
          if (p1) {
            labels.push({
              id: 'prologue_vil_greet',
              x: p1.x,
              y: p1.y,
              title: 'Good morning, neighbor!',
              kind: 'speech',
            });
          }
        }
        if (pairB && t >= 9.0) {
          const p2 = projectPoint(pairB.x, getArchipelagoGroundY(pairB.x, pairB.z) + 2.6, pairB.z);
          if (p2) {
            labels.push({
              id: 'prologue_vil_reply',
              x: p2.x,
              y: p2.y,
              title: 'Hello, friend! How are you?',
              kind: 'speech',
            });
          }
        }
        if (dancer && t >= 9.4) {
          const p3 = projectPoint(dancer.x, getArchipelagoGroundY(dancer.x, dancer.z) + 2.5, dancer.z);
          if (p3) {
            labels.push({
              id: 'prologue_vil_song',
              x: p3.x,
              y: p3.y,
              title: '♪ La la la ~ ♪',
              kind: 'speech',
            });
          }
        }
      } else if (t > 12.8) {
        const lp = projectPoint(
          rig.lilaMesh.position.x,
          rig.lilaMesh.position.y + 2.45,
          rig.lilaMesh.position.z,
        );
        if (lp) {
          labels.push({
            id: 'prologue_lila_hi',
            x: lp.x,
            y: lp.y,
            title:
              t < 15.6
                ? '🎀 Kak Hoot! Pita merahku bagus, kan?'
                : '🌸 Kerajaan Kata damai sekali, Kak!',
            kind: 'speech',
          });
        }
        if (t >= 14.0) {
          const hp = projectPoint(this.heroPos.x, this.heroPos.y + 2.85, this.heroPos.z);
          if (hp) {
            labels.push({
              id: 'prologue_hoot_hi',
              x: hp.x,
              y: hp.y,
              title: 'Bagus sekali, Lila! Ayo menyapa warga!',
              kind: 'speech',
            });
          }
        }
      }
      return labels;
    }

    if (
      this.phase === 'story' &&
      this.storyDialog?.kind === 'prologue' &&
      this.storyDialog.step === 4 &&
      this.prologueRig
    ) {
      const t = this.storyTimer;
      const op = projectPoint(
        this.owlRig.root.position.x,
        this.owlRig.root.position.y + 1.55,
        this.owlRig.root.position.z,
      );
      if (op) {
        const msg =
          t < 2.8
            ? '🔍 Mencari Hoot melewati Gerbang Kota...'
            : t < 5.6
            ? '🌫️ Menembus kabut malam di atas Pasar Rasa...'
            : t < 9.2
            ? '🕯️ Menara Waktu & Hutan Satwa masih sunyi...'
            : t < 11.8
            ? '✨ Pulau terakhir! Itu Hoot di Desa Sapaan!'
            : '✉️ Membawa surat bersampul merah dari Lila!';
        labels.push({
          id: 'prologue_owl_search',
          x: op.x,
          y: op.y,
          title: msg,
          kind: 'thought',
        });
      }
      if (t >= 10.8) {
        const hp = projectPoint(this.heroPos.x, this.heroPos.y + 2.85, this.heroPos.z);
        if (hp) {
          labels.push({
            id: 'prologue_hoot_wait',
            x: hp.x,
            y: hp.y,
            title: '🦉 Burung Hantu utusan Istana?!',
            kind: 'speech',
          });
        }
      }
      return labels;
    }

    if (this.villageAmbushState?.active) {
      const amb = this.villageAmbushState;
      const showAmbNpcLabels =
        amb.stage === 'ambush' ||
        amb.stage === 'escort' ||
        amb.stage === 'awaiting_guardian_talk' ||
        amb.stage === 'walking_home';
      if (showAmbNpcLabels) {
        for (const n of amb.npcs) {
          if (!n.alive) continue;
          const p = projectPoint(n.x, n.y + 2.65, n.z);
          if (!p) continue;
          const msg =
            n.role === 'abducted'
              ? amb.timer >= 1.65
                ? '😱 Tidaaak! Tolooong!!'
                : n.shoutCutscene
              : amb.inCutscene
              ? n.shoutCutscene
              : n.shoutLive;
          labels.push({
            id: `amb_npc_${n.id}`,
            x: p.x,
            y: p.y,
            title: msg,
            kind: 'speech',
          });
        }
      }
      if (amb.inCutscene) {
        if (this.starterPickupMesh.visible) {
          const sw = OVERWORLD_ANCHORS.starterWeapon;
          const sp = projectPoint(sw.x, getArchipelagoGroundY(sw.x, sw.z) + 3.2, sw.z);
          if (sp) {
            labels.push({
              id: 'amb_starter_hint',
              x: sp.x,
              y: sp.y,
              title: '✨ Senjata Pemula (Ambil di sini!)',
              kind: 'pickup',
            });
          }
        }
        return labels;
      }
      if (amb.stage === 'escort' || amb.stage === 'awaiting_guardian_talk') {
        const gDef = getActiveZoneNpcDef('desa_sapaan', this.getCurrentDayPhase() === 'malam');
        const gLive = this.npcs.get(gDef.id);
        const gx = gLive?.x ?? gDef.x;
        const gz = gLive?.z ?? gDef.z;
        const gy = getArchipelagoGroundY(gx, gz);
        const gp = projectPoint(gx, gy + 5.1, gz);
        if (gp) {
          labels.push({
            id: 'amb_guardian_tutorial',
            x: gp.x,
            y: gp.y,
            title:
              amb.stage === 'awaiting_guardian_talk'
                ? `👇 Tekan BICARA (E) pada ${gDef.name}!`
                : `🛡️ ${gDef.name} (Penjaga Pulau)`,
            kind: 'npc_alert',
          });
        }
        if (amb.stage === 'escort') {
          return labels;
        }
      }
    }

    if (this.phase !== 'playing' && this.phase !== 'title') return [];

    if (
      this.phase === 'playing' &&
      this.cameraMode !== 'first_person' &&
      this.heroThoughtText
    ) {
      const heroBubblePos = projectPoint(this.heroPos.x, this.heroPos.y + 3.85, this.heroPos.z);
      if (heroBubblePos) {
        labels.push({
          id: 'hero_thought',
          x: heroBubblePos.x,
          y: heroBubblePos.y,
          title: `💭 ${this.heroThoughtText}`,
          kind: 'thought',
        });
      }
    }

    if (this.multiplayerActive && this.phase === 'playing' && this.remotePeers.size > 0) {
      const nowMs = Date.now();
      for (const peer of this.remotePeers.values()) {
        if (peer.state.worldMode !== this.worldMode) continue;
        const dSq = (peer.pos.x - this.heroPos.x) ** 2 + (peer.pos.z - this.heroPos.z) ** 2;
        if (dSq > 85 * 85) continue;
        const namePos = projectPoint(peer.pos.x, peer.pos.y + 3.45, peer.pos.z);
        if (namePos) {
          const hp = peer.state.hp;
          const mhp = peer.state.maxHp;
          const lowHpTag = typeof hp === 'number' && hp > 0 && hp <= 2 ? ' 🆘' : '';
          const hpText = typeof hp === 'number' && typeof mhp === 'number' ? ` · ❤️${hp}/${mhp}` : '';
          const quizTag = peer.state.inChallenge ? ' · 📘 Kuis' : '';
          labels.push({
            id: `peer_name_${peer.state.uid}`,
            x: namePos.x,
            y: namePos.y,
            title: `${peer.state.speaking ? '🔊 ' : ''}${peer.state.displayName}${hpText}${lowHpTag}${quizTag}`,
            kind: 'player',
          });
        }
        if (
          peer.state.lastChatText &&
          peer.state.lastChatAt &&
          nowMs - peer.state.lastChatAt < 5500
        ) {
          const chatPos = projectPoint(peer.pos.x, peer.pos.y + 4.3, peer.pos.z);
          if (chatPos) {
            labels.push({
              id: `peer_chat_${peer.state.uid}`,
              x: chatPos.x,
              y: chatPos.y,
              title: peer.state.lastChatText,
              kind: 'speech',
            });
          }
        }
      }
    }

    if (this.worldMode === 'dungeon') {
      // Cave spots, doors, chests, crafting tables, and monsters are tracked cleanly on the 3D Radar Minimap
      return labels;
    }

    if (this.worldMode === 'ocean') {
      if (this.oceanRig) {
        const bp = projectPoint(
          this.oceanRig.buoyPos.x,
          this.oceanRig.buoyPos.y + 3.2,
          this.oceanRig.buoyPos.z,
        );
        if (bp) {
          labels.push({
            id: 'ocean_buoy',
            x: bp.x,
            y: bp.y,
            title: '🫧 Pelampung Permukaan (Keluar)',
            kind: 'portal',
          });
        }
        for (const ch of this.oceanRig.chests) {
          if (ch.opened) continue;
          const dSq = (ch.x - this.heroPos.x) ** 2 + (ch.z - this.heroPos.z) ** 2;
          if (dSq > 32 * 32) continue;
          const cp = projectPoint(ch.x, ch.y + 2.4, ch.z);
          if (cp) {
            labels.push({
              id: `och_${ch.id}`,
              x: cp.x,
              y: cp.y,
              title: `🧰 ${ch.label}`,
              kind: 'pickup',
            });
          }
        }
        for (const pk of this.oceanRig.pickups) {
          if (!pk.active) continue;
          const dSq = (pk.x - this.heroPos.x) ** 2 + (pk.z - this.heroPos.z) ** 2;
          if (dSq > 24 * 24) continue;
          const pp = projectPoint(pk.x, pk.y + 1.3, pk.z);
          if (pp) {
            labels.push({
              id: `opk_${pk.id}`,
              x: pp.x,
              y: pp.y,
              title: pk.label,
              kind: 'pickup',
            });
          }
        }
        for (const m of this.oceanMonsters) {
          if (!m.alive) continue;
          const dSq = (m.x - this.heroPos.x) ** 2 + (m.z - this.heroPos.z) ** 2;
          if (dSq > 34 * 34) continue;
          const spec = MONSTER_SPECS[m.type];
          const mp = projectPoint(
            m.x,
            (m.y ?? spec.hoverY) + Math.max(2.6, spec.hitHalfH * 1.9),
            m.z,
          );
          if (mp) {
            labels.push({
              id: `oc_mob_${m.id}`,
              x: mp.x,
              y: mp.y,
              title: `🦈 ${m.name} (${m.mobHp ?? spec.hitHp}/${m.maxMobHp ?? spec.hitHp})`,
              subtext: 'Monster Palung Abyssal',
              kind: 'monster',
            });
          }
        }
      }
      return labels;
    }

    if (this.worldMode === 'academy') {
      for (const npc of ACADEMY_NPCS) {
        const pos = projectPoint(npc.x, 4.2, npc.z);
        if (pos) {
          labels.push({
            id: `ac_npc_${npc.id}`,
            x: pos.x,
            y: pos.y,
            title: npc.name,
            subtext: npc.speechBubble,
            kind: 'zone',
          });
        }
      }
      for (const m of this.academyMonsters) {
        if (!m.alive) continue;
        const pos = projectPoint(m.x, 2.8, m.z);
        if (pos) {
          labels.push({
            id: `am_${m.id}`,
            x: pos.x,
            y: pos.y,
            title: m.name,
            kind: 'monster',
          });
        }
      }
      return labels;
    }

    if (this.starterPickupMesh.visible && this.phase === 'playing') {
      const sw = OVERWORLD_ANCHORS.starterWeapon;
      const sp = projectPoint(sw.x, getArchipelagoGroundY(sw.x, sw.z) + 3.2, sw.z);
      if (sp) {
        labels.push({
          id: 'starter_gun',
          x: sp.x,
          y: sp.y,
          title: '✨ Senjata Pertama (Ambil)',
          subtext: 'Damage Kecil · Senjata Awal',
          kind: 'pickup',
        });
      }
    }

    if (this.swimSuitPickupMesh.visible && this.phase === 'playing') {
      const ss = OVERWORLD_ANCHORS.swimSuit;
      const ssp = projectPoint(ss.x, getArchipelagoGroundY(ss.x, ss.z) + 3.2, ss.z);
      if (ssp) {
        labels.push({
          id: 'swimsuit_pickup',
          x: ssp.x,
          y: ssp.y,
          title: '🤿 Pakaian Renang (Ambil)',
          subtext: 'Perlengkapan Selam & Masuk Laut',
          kind: 'pickup',
        });
      }
    }

    if (this.phase === 'playing' && this.carMode === 'none' && this.planeMode === 'none') {
      for (let vi = 0; vi < this.worldVehicles.length; vi++) {
        const v = this.worldVehicles[vi];
        const carDistSq = (this.heroPos.x - v.pos.x) ** 2 + (this.heroPos.z - v.pos.z) ** 2;
        if (carDistSq > 26 * 26) continue;
        const carLabelPos = projectPoint(v.pos.x, v.pos.y + v.height + 1.2, v.pos.z);
        if (!carLabelPos) continue;
        const isNearThis = v.id === this.nearVehicleId;
        const isNpcDriving = v.driverKind === 'npc';
        labels.push({
          id: `car_${v.id}`,
          x: carLabelPos.x,
          y: carLabelPos.y,
          title: isNpcDriving
            ? `🚕 ${v.name} (Dikendarai NPC)`
            : isNearThis
            ? `🚗 ${v.name} (Tekan E untuk Masuk)`
            : `🚗 ${v.name}`,
          subtext: isNpcDriving
            ? 'Sedang dipakai NPC'
            : isNearThis
            ? 'Klik atau tekan Masuk Mobil'
            : 'Kosong — bisa dikendarai!',
          kind: 'pickup',
        });
      }
      for (let pi = 0; pi < this.worldPlanes.length; pi++) {
        const pl = this.worldPlanes[pi];
        const plDistSq = (this.heroPos.x - pl.pos.x) ** 2 + (this.heroPos.z - pl.pos.z) ** 2;
        if (plDistSq > 40 * 40) continue;
        const plLabelPos = projectPoint(pl.pos.x, pl.pos.y + pl.rig.height + 1.5, pl.pos.z);
        if (!plLabelPos) continue;
        const isNearPl = pl.id === this.nearPlaneId;
        labels.push({
          id: `plane_${pl.id}`,
          x: plLabelPos.x,
          y: plLabelPos.y,
          title: isNearPl ? `✈️ ${pl.name} (Tekan E untuk Naik)` : `✈️ ${pl.name}`,
          subtext: isNearPl ? 'Siap lepas landas!' : 'Pesawat Tempur — bisa diterbangkan!',
          kind: 'pickup',
        });
      }
    }

    const isNightLabels = this.getCurrentDayPhase() === 'malam';
    for (const npc of ALL_OVERWORLD_NPCS) {
      const liveNpc = this.npcs.get(npc.id);
      if (liveNpc && liveNpc.koTimer > 0) continue;
      const isOnDuty = liveNpc ? this.isNpcOnDuty(liveNpc.shift) : npc.shiftRole !== 'night';
      if (!isOnDuty) continue;
      const nx = liveNpc?.x ?? npc.x;
      const nz = liveNpc?.z ?? npc.z;
      const ny = getArchipelagoGroundY(nx, nz);
      if (isOnDuty) {
        const pos = projectPoint(nx, ny - 0.2, nz + 2.2);
        if (pos) {
          const isLiberated = this.liberatedZones.has(npc.zoneId as ZoneId);
          labels.push({
            id: `zone_${npc.id}`,
            x: pos.x,
            y: pos.y,
            title: isLiberated ? `✓ ${npc.zoneName}` : npc.zoneName,
            kind: 'zone',
          });
        }
      }
      if (this.phase === 'playing') {
        const distHero = Math.hypot(this.heroPos.x - nx, this.heroPos.z - nz);
        const showSpeech = npc.id === this.nearbyNpcId || (isOnDuty && isNightLabels && distHero < 8.5);
        const bubblePos = projectPoint(nx, ny + 4.9, nz);
        if (bubblePos && showSpeech) {
          const partnerDef = getZoneNpcById(npc.partnerNpcId);
          labels.push({
            id: `speech_${npc.id}`,
            x: bubblePos.x,
            y: bubblePos.y,
            title: !isOnDuty
              ? `💬 Lepas piket · ${partnerDef?.name ?? 'Rekanku'} yang jaga pintu`
              : isNightLabels
              ? `🔑 "${npc.speechBubble} Silakan masuk ke ${npc.zoneName}!"`
              : npc.speechBubble,
            kind: 'speech',
          });
        } else if (
          bubblePos &&
          liveNpc?.poseMode === 'stand' &&
          this.npcThoughtId === npc.id &&
          this.npcThoughtText
        ) {
          labels.push({
            id: `npc_thought_${npc.id}`,
            x: bubblePos.x,
            y: bubblePos.y,
            title: `💭 ${this.npcThoughtText}`,
            kind: 'thought',
          });
        }
      }
    }

    if (this.phase === 'playing' && isNightLabels) {
      for (const [zKey, door] of Object.entries(OVERWORLD_ZONE_DOORS) as Array<
        [ZoneId, (typeof OVERWORLD_ZONE_DOORS)[ZoneId]]
      >) {
        const activeNightDef = getActiveZoneNpcDef(zKey, true);
        if (this.nearbyNpcId === activeNightDef.id) continue;
        const dHero = Math.hypot(this.heroPos.x - door.x, this.heroPos.z - door.z);
        if (dHero > 22) continue;
        const doorPos = projectPoint(door.x, door.y + 3.4, door.z);
        if (!doorPos) continue;
        const permitted = this.nightPermittedZones.has(zKey);
        labels.push({
          id: `zone_door_${zKey}`,
          x: doorPos.x,
          y: doorPos.y,
          title: permitted
            ? `🔑 ${door.label} (Dijaga ${activeNightDef.name})`
            : `🌙 ${door.label} · ${activeNightDef.name} Siaga`,
          kind: 'door',
        });
      }
    }

    const pp = OVERWORLD_ANCHORS.portal;
    const portalPos = projectPoint(pp.x, getArchipelagoGroundY(pp.x, pp.z) + 8.8, pp.z);
    if (portalPos) {
      const locked = IELTS_TEMPORARILY_LOCKED || (this.settings.storyLocked && this.ribbons.size < 6);
      labels.push({
        id: 'portal_ielts',
        x: portalPos.x,
        y: portalPos.y,
        title: IELTS_TEMPORARILY_LOCKED
          ? '🔒 Istana IELTS (Ditutup Sementara)'
          : locked
          ? `🔒 Istana IELTS (${this.ribbons.size}/6 Mahkota)`
          : '🏰 Istana IELTS / Akademi Ujian',
        kind: 'portal',
      });
    }

    for (const m of this.seaMonsters) {
      if (!m.alive) continue;
      const distSq = (m.x - this.heroPos.x) ** 2 + (m.z - this.heroPos.z) ** 2;
      if (distSq > 26 * 26) continue;
      const spec = MONSTER_SPECS[m.type];
      const pos = projectPoint(
        m.x,
        (m.y ?? spec.hoverY) + Math.max(2.6, spec.hitHalfH * 1.9),
        m.z,
      );
      if (pos) {
        const canHurt =
          this.ownedWeapons.has(this.activeWeapon) &&
          (!spec.effectiveWeapons || spec.effectiveWeapons.includes(this.activeWeapon));
        const minReq =
          spec.effectiveWeapons?.[0] === 'emas'
            ? 'Emas+'
            : spec.effectiveWeapons?.[0] === 'saus'
            ? 'Cepat+'
            : 'Hijau+';
        labels.push({
          id: `sea_${m.id}`,
          x: pos.x,
          y: pos.y,
          title: `🌊 ${m.name} (${m.mobHp ?? spec.hitHp}/${m.maxMobHp ?? spec.hitHp})`,
          subtext: canHurt ? 'Senjata cocok untuk berburu' : `Butuh Senjata ${minReq}`,
          kind: 'monster',
        });
      }
    }

    if (this.archipelagoUnderwaterRig && this.isHeroUnderwater()) {
      for (const ch of this.archipelagoUnderwaterRig.chests) {
        if (ch.opened) continue;
        const dSq = (ch.x - this.heroPos.x) ** 2 + (ch.z - this.heroPos.z) ** 2;
        if (dSq > 34 * 34) continue;
        const cp = projectPoint(ch.x, ch.y + 2.4, ch.z);
        if (cp) {
          labels.push({
            id: `och_${ch.id}`,
            x: cp.x,
            y: cp.y,
            title: `🧰 ${ch.label}`,
            kind: 'pickup',
          });
        }
      }
      for (const pk of this.archipelagoUnderwaterRig.pickups) {
        if (!pk.active) continue;
        const dSq = (pk.x - this.heroPos.x) ** 2 + (pk.z - this.heroPos.z) ** 2;
        if (dSq > 24 * 24) continue;
        const pp = projectPoint(pk.x, pk.y + 1.3, pk.z);
        if (pp) {
          labels.push({
            id: `opk_${pk.id}`,
            x: pp.x,
            y: pp.y,
            title: pk.label,
            kind: 'pickup',
          });
        }
      }
    }

    for (const m of this.skyMonsters) {
      if (!m.alive) continue;
      const distSq = (m.x - this.heroPos.x) ** 2 + (m.z - this.heroPos.z) ** 2;
      if (distSq > 34 * 34) continue;
      const spec = MONSTER_SPECS[m.type];
      const pos = projectPoint(
        m.x,
        (m.y ?? spec.hoverY) + Math.max(2.3, spec.hitHalfH + 1.3),
        m.z,
      );
      if (pos) {
        if (m.combatOnly) {
          labels.push({
            id: `sky_${m.id}`,
            x: pos.x,
            y: pos.y,
            title: `🦅 ${m.name} (${m.mobHp ?? spec.hitHp}/${m.maxMobHp ?? spec.hitHp})`,
            subtext: 'Monster Angkasa · Mematikan',
            kind: 'monster',
          });
        } else {
          labels.push({
            id: `sky_${m.id}`,
            x: pos.x,
            y: pos.y,
            title: `🦅 ${m.name}`,
            subtext: `Perisai Kata ${m.stanceHp ?? spec.stanceHp}/${spec.stanceHp} · Bawa Kuis`,
            kind: 'monster',
          });
        }
      }
    }

    return labels;
  }

  private updateSeaMonster(m: RoamingMonster, dt: number, baseSpeedMult: number): void {
    const spec = MONSTER_SPECS[m.type];
    const nearestSeaTgt =
      this.worldMode === 'overworld' && this.multiplayerActive
        ? this.getNearestPlayerTarget(m.x, m.z, 'overworld')
        : {
            x: this.heroPos.x,
            y: this.heroPos.y,
            z: this.heroPos.z,
            dx: this.heroPos.x - m.x,
            dz: this.heroPos.z - m.z,
            distSq: (this.heroPos.x - m.x) ** 2 + (this.heroPos.z - m.z) ** 2,
            dist: Math.hypot(this.heroPos.x - m.x, this.heroPos.z - m.z),
            isLocal: true,
          };
    const dxHero = nearestSeaTgt.dx;
    const dzHero = nearestSeaTgt.dz;
    const distSqHero = nearestSeaTgt.distSq;
    if (distSqHero > 82 * 82 && !m.aggroActive) {
      return;
    }

    const distH = nearestSeaTgt.dist;
    if (m.hitFlashTimer && m.hitFlashTimer > 0) {
      m.hitFlashTimer = Math.max(0, m.hitFlashTimer - dt);
    }
    if (m.attackCooldown && m.attackCooldown > 0) {
      m.attackCooldown = Math.max(0, m.attackCooldown - dt);
    }
    if (m.attackAnimTimer && m.attackAnimTimer > 0) {
      m.attackAnimTimer = Math.max(0, m.attackAnimTimer - dt);
    }

    const ring = m.mesh.userData.combatRing as THREE.Object3D | undefined;
    if (ring) {
      ring.rotation.z += dt * 1.9;
    }

    // Swimmers trigger predators from far away; on dry land, beasts only lock on if hero stands close to shore
    const effectiveAggro = this.isSwimming
      ? spec.aggroRange
      : Math.min(11.5, spec.aggroRange * 0.48);

    if (this.phase === 'playing' && distH < effectiveAggro) {
      if (!m.aggroActive && this.isSwimming) {
        soundEngine.playMonster();
      }
      m.aggroActive = true;
    } else if (distH > spec.aggroRange + 10) {
      m.aggroActive = false;
    }

    // Charybdis Maw & Abyssal Kraken whirlpool suction current when hero is swimming nearby!
    if (
      this.phase === 'playing' &&
      this.isSwimming &&
      (m.type === 'charybdis_maw' || m.type === 'abyssal_kraken')
    ) {
      const pullRad = m.type === 'charybdis_maw' ? 14.0 : 9.5;
      if (distH < pullRad && distH > 1.2) {
        const pullStrength = (m.type === 'charybdis_maw' ? 3.8 : 2.3) * (1 - distH / pullRad);
        const pullPtX = this.heroPos.x - (dxHero / distH) * pullStrength * dt;
        const pullPtZ = this.heroPos.z - (dzHero / distH) * pullStrength * dt;
        if (this.worldMode === 'ocean') {
          this.heroPos.x = THREE.MathUtils.clamp(pullPtX, -41, 41);
          this.heroPos.z = THREE.MathUtils.clamp(pullPtZ, -48, 34);
        } else if (!sampleArchipelagoTerrain(pullPtX, pullPtZ).isLandOrBridge) {
          this.heroPos.x = pullPtX;
          this.heroPos.z = pullPtZ;
        }
      }
    }

    let nextMx = m.x;
    let nextMz = m.z;
    const isCharybdis = m.type === 'charybdis_maw';
    let monMode: 'idle' | 'patrol' | 'windup' | 'attack' | 'shoot' | 'hit' = 'patrol';
    let monAttackProg = 0;
    const meleeReach = 2.2 + spec.hitRadius * 0.55;
    const inOceanVerticalRange =
      this.worldMode === 'ocean' || this.isHeroUnderwater()
        ? Math.abs(this.heroPos.y - (m.y ?? spec.hoverY)) < 4.5
        : this.heroPos.y < 2.2;

    if (m.lungeTimer && m.lungeTimer > 0) {
      m.lungeTimer = Math.max(0, m.lungeTimer - dt);
      if (!isCharybdis && this.phase === 'playing' && distH > 0.2) {
        const spd = 10.2 * spec.speedMult * dt;
        nextMx += (dxHero / distH) * spd;
        nextMz += (dzHero / distH) * spd;
      }
      m.mesh.rotation.y = Math.atan2(dxHero, dzHero);
      monMode = 'attack';
      monAttackProg = 1 - m.lungeTimer / 0.32;

      if (
        this.carMode === 'none' &&
        this.planeMode === 'none' &&
        nearestSeaTgt.isLocal &&
        this.phase === 'playing' &&
        this.encounterGraceTimer <= 0 &&
        distH < meleeReach &&
        inOceanVerticalRange
      ) {
        const dmg = spec.atkDamageHearts;
        this.hp = Math.max(0, this.hp - dmg);
        this.encounterGraceTimer = 1.5;
        soundEngine.playHurt();
        const len = Math.max(0.2, distH);
        this.heroVel.set((dxHero / len) * 16, 0, (dzHero / len) * 16);
        this.heroVelY = this.worldMode === 'ocean' ? 2.6 : 4.2;
        this.spawnBurst(this.heroPos.x, this.heroPos.y + 1.1, this.heroPos.z, 0x22d3ee, 16);
        this.showBanner(
          this.worldMode === 'ocean'
            ? `🦈 Diserang ${m.name}! Bidik & tembak balik (-${dmg} ❤️)`
            : `🌊 Diserang ${m.name}! Pakai senjata wilayah untuk membunuhnya (-${dmg} ❤️)`,
          2.6,
        );
        this.triggerDamageFlash(dmg, `Serangan ${m.name}`, { x: m.x, z: m.z });
        if (this.hp <= 0) {
          this.phase = 'gameover';
          soundEngine.playLose();
          this.pushHud(true);
          return;
        }
      }
    } else if (m.windupTimer !== undefined && m.windupTimer > 0) {
      m.windupTimer -= dt;
      m.mesh.rotation.y = Math.atan2(dxHero, dzHero);
      monMode = 'windup';
      if (m.windupTimer <= 0) {
        m.windupTimer = -1;
        m.lungeTimer = 0.32;
        soundEngine.playHit();
      }
    } else if (this.phase === 'playing' && m.aggroActive && distH > 0.2) {
      m.mesh.rotation.y = Math.atan2(dxHero, dzHero);
      if (distH < meleeReach + 0.6 && (m.attackCooldown ?? 0) <= 0 && inOceanVerticalRange) {
        m.windupTimer = 0.48;
        m.attackCooldown = this.settings.difficulty === 'pendekar' ? 1.7 : 2.2;
        soundEngine.playMonster();
      } else {
        if (!isCharybdis && this.isSwimming && distH > 1.8) {
          const spd = 4.0 * spec.speedMult * baseSpeedMult;
          nextMx += (dxHero / distH) * spd * dt;
          nextMz += (dzHero / distH) * spd * dt;
        } else if (!isCharybdis && !this.isSwimming && distH > 3.2) {
          // Hover menacingly near coastal water if hero fights from shore
          const spd = 2.4 * spec.speedMult * baseSpeedMult;
          nextMx += (dxHero / distH) * spd * dt;
          nextMz += (dzHero / distH) * spd * dt;
        }

        if (
          spec.ranged &&
          distH >= 4.2 &&
          distH < 20.5 &&
          (m.attackCooldown ?? 0) <= 0 &&
          (this.isSwimming || nearestSeaTgt.y < 4.5)
        ) {
          const pSpeed = this.settings.difficulty === 'pendekar' ? 11.2 : 9.2;
          const mFireY = (m.y ?? spec.hoverY) + spec.hitCenterY;
          const aimY = nearestSeaTgt.y + 1.25 - mFireY;
          const dist3D = Math.max(0.5, Math.hypot(dxHero, aimY, dzHero));
          const spitColor =
            m.type === 'electric_eel_drakon'
              ? 0xfacc15
              : m.type === 'toxic_sea_viper'
              ? 0x4ade80
              : m.type === 'venomous_box_jelly'
              ? 0xe879f9
              : m.type === 'abyssal_kraken'
              ? 0xa855f7
              : 0x2dd4bf;
          const px = m.x + (dxHero / distH) * (0.9 * spec.baseScale);
          const pz = m.z + (dzHero / distH) * (0.9 * spec.baseScale);
          const pvx = (dxHero / dist3D) * pSpeed;
          const pvy = (aimY / dist3D) * pSpeed;
          const pvz = (dzHero / dist3D) * pSpeed;
          this.spawnProjectile({
            fromPlayer: false,
            x: px,
            y: mFireY,
            z: pz,
            vx: pvx,
            vy: pvy,
            vz: pvz,
            damage: 1,
            shieldDamage: 1,
            pierceLeft: 0,
            colorHex: spitColor,
          });
          if (this.worldMode === 'overworld' && this.multiplayerActive && this.hasConnectedPeers && this.isWorldAuthority()) {
            this.emitMultiplayerPacket({
              t: 'shot',
              fp: false,
              x: Math.round(px * 100) / 100,
              y: Math.round(mFireY * 100) / 100,
              z: Math.round(pz * 100) / 100,
              vx: Math.round(pvx * 100) / 100,
              vy: Math.round(pvy * 100) / 100,
              vz: Math.round(pvz * 100) / 100,
              col: spitColor,
              dmg: 1,
              md: 'overworld',
            });
          }
          m.attackCooldown = this.settings.difficulty === 'pendekar' ? 2.4 : 3.2;
          m.attackAnimTimer = 0.32;
        }
      }
    } else {
      m.patrolClock = (m.patrolClock ?? m.patrolPhase) + dt * 0.62 * spec.speedMult * baseSpeedMult;
      if (!isCharybdis) {
        const p = m.patrolClock;
        const patrolRad = this.worldMode === 'ocean' ? 6.5 : spec.tier === 'giant' ? 8.5 : 10.5;
        nextMx = m.homeX + Math.cos(p) * patrolRad;
        nextMz = m.homeZ + Math.sin(p * 0.78) * (patrolRad * 0.78);
        m.mesh.rotation.y = Math.atan2(
          -Math.sin(p) * patrolRad,
          Math.cos(p * 0.78) * (patrolRad * 0.78) * 0.78,
        );
      }
    }

    if (m.hitFlashTimer && m.hitFlashTimer > 0) {
      monMode = 'hit';
    } else if ((m.attackAnimTimer ?? 0) > 0 && monMode === 'patrol') {
      monMode = 'shoot';
      monAttackProg = 1 - (m.attackAnimTimer ?? 0) / 0.32;
    }

    const prevX = m.x;
    const prevZ = m.z;
    if (this.worldMode === 'ocean') {
      // Strictly keep deep-sea predators inside Palung Abyssal (z <= -16) and outside cliff/ruin colliders
      const ocPt = {
        x: THREE.MathUtils.clamp(nextMx, -40, 40),
        y: m.y ?? m.homeY ?? -18,
        z: THREE.MathUtils.clamp(nextMz, -49, -16),
      };
      if (this.oceanRig) {
        resolveOceanSolidCollisions(ocPt, this.oceanRig.colliders, spec.hitRadius * 0.72, 2.2);
      }
      m.x = THREE.MathUtils.clamp(ocPt.x, -40, 40);
      m.z = THREE.MathUtils.clamp(ocPt.z, -49, -16);
      const seaSpd = Math.hypot(m.x - prevX, m.z - prevZ) / Math.max(0.001, dt);
      m.walkPhase = (m.walkPhase ?? m.patrolPhase) + dt * (2.6 + seaSpd * 0.8);
      const minMy = getOceanFloorY(m.x, m.z) + spec.hoverY + 0.8;
      const targetMy = m.aggroActive
        ? THREE.MathUtils.clamp(this.heroPos.y + 0.8, minMy, -4.5)
        : Math.max(minMy, (m.homeY ?? -18) + Math.sin(this.elapsed * 2.1 + m.patrolPhase) * 0.45);
      m.y = THREE.MathUtils.damp(m.y ?? targetMy, targetMy, 4.5, dt);
      m.mesh.position.set(m.x, m.y, m.z);
      m.mesh.scale.setScalar(spec.baseScale);
      if (distSqHero <= 66 * 66) {
        animateMonsterRig(m.mesh, {
          mode: monMode,
          speed: seaSpd,
          walkPhase: m.walkPhase,
          elapsed: this.elapsed,
          phase: m.patrolPhase,
          attackProgress: monAttackProg,
          dt,
        });
      }
      return;
    }

    const seaPt = { x: nextMx, y: m.y ?? spec.hoverY, z: nextMz };
    if (this.archipelagoUnderwaterRig) {
      resolveOceanSolidCollisions(
        seaPt,
        this.archipelagoUnderwaterRig.colliders,
        spec.hitRadius * 0.68,
        2.0,
      );
    }
    this.constrainSeaMonsterToWater(seaPt, prevX, prevZ, 2.6);
    m.x = seaPt.x;
    m.z = seaPt.z;

    const seaSpd = Math.hypot(m.x - prevX, m.z - prevZ) / Math.max(0.001, dt);
    m.walkPhase = (m.walkPhase ?? m.patrolPhase) + dt * (2.6 + seaSpd * 0.8);
    const seaFloorMin = getArchipelagoSeabedY(m.x, m.z) + Math.max(0.8, spec.hoverY + 0.6);
    const surfaceTargetY = spec.hoverY + Math.sin(this.elapsed * 2.4 + m.patrolPhase) * 0.14;
    const targetSeaY =
      m.aggroActive && this.isHeroUnderwater()
        ? THREE.MathUtils.clamp(this.heroPos.y + 0.4, seaFloorMin, -0.8)
        : surfaceTargetY;
    m.y = THREE.MathUtils.damp(m.y ?? surfaceTargetY, targetSeaY, 4.2, dt);
    m.mesh.position.set(m.x, m.y, m.z);
    m.mesh.scale.setScalar(spec.baseScale);

    if (distSqHero <= 66 * 66) {
      animateMonsterRig(m.mesh, {
        mode: monMode,
        speed: seaSpd,
        walkPhase: m.walkPhase,
        elapsed: this.elapsed,
        phase: m.patrolPhase,
        attackProgress: monAttackProg,
        dt,
      });
    }
  }

  private updateSkyMonster(m: RoamingMonster, dt: number, baseSpeedMult: number): void {
    const spec = MONSTER_SPECS[m.type];
    const nearestSkyTgt =
      this.worldMode === 'overworld' && this.multiplayerActive
        ? this.getNearestPlayerTarget(m.x, m.z, 'overworld')
        : {
            x: this.heroPos.x,
            y: this.heroPos.y,
            z: this.heroPos.z,
            dx: this.heroPos.x - m.x,
            dz: this.heroPos.z - m.z,
            distSq: (this.heroPos.x - m.x) ** 2 + (this.heroPos.z - m.z) ** 2,
            dist: Math.hypot(this.heroPos.x - m.x, this.heroPos.z - m.z),
            isLocal: true,
          };
    const dxHero = nearestSkyTgt.dx;
    const dzHero = nearestSkyTgt.dz;
    const distSqHero = nearestSkyTgt.distSq;
    if (distSqHero > 86 * 86 && !m.aggroActive) {
      return;
    }

    const distH = nearestSkyTgt.dist;
    if (m.hitFlashTimer && m.hitFlashTimer > 0) {
      m.hitFlashTimer = Math.max(0, m.hitFlashTimer - dt);
    }
    if (m.attackCooldown && m.attackCooldown > 0) {
      m.attackCooldown = Math.max(0, m.attackCooldown - dt);
    }
    if (m.attackAnimTimer && m.attackAnimTimer > 0) {
      m.attackAnimTimer = Math.max(0, m.attackAnimTimer - dt);
    }

    const ring = m.mesh.userData.combatRing as THREE.Object3D | undefined;
    if (ring) {
      ring.rotation.z += dt * 2.1;
    }

    const groundY = getArchipelagoGroundY(m.x, m.z);
    const cruiseY = Math.max(groundY + spec.hoverY, spec.hoverY);

    if (this.phase === 'playing' && distH < spec.aggroRange) {
      if (!m.aggroActive) {
        soundEngine.playMonster();
      }
      m.aggroActive = true;
    } else if (distH > spec.aggroRange + 14) {
      m.aggroActive = false;
      m.windupTimer = -1;
      m.lungeTimer = 0;
    }

    let nextMx = m.x;
    let nextMz = m.z;
    let targetYaw = m.mesh.rotation.y;
    let monMode: 'idle' | 'patrol' | 'windup' | 'attack' | 'shoot' | 'hit' = 'patrol';
    let monAttackProg = 0;
    let desiredDive = 0;

    if (m.lungeTimer && m.lungeTimer > 0) {
      m.lungeTimer = Math.max(0, m.lungeTimer - dt);
      const swoopArc = Math.sin((m.lungeTimer / 0.58) * Math.PI);
      desiredDive = swoopArc * Math.max(2.5, cruiseY - (this.heroPos.y + 1.55));
      if (this.phase === 'playing' && distH > 0.35) {
        const spd = 13.5 * spec.speedMult * dt;
        nextMx += (dxHero / distH) * spd;
        nextMz += (dzHero / distH) * spd;
      }
      targetYaw = Math.atan2(dxHero, dzHero);
      monMode = 'attack';
      monAttackProg = 1 - m.lungeTimer / 0.58;

      if (
        this.carMode === 'none' &&
        this.planeMode === 'none' &&
        nearestSkyTgt.isLocal &&
        this.phase === 'playing' &&
        this.encounterGraceTimer <= 0 &&
        distH < 2.4 + spec.hitRadius * 0.45 &&
        Math.abs((m.y ?? cruiseY) - (this.heroPos.y + 1.45)) < 2.85
      ) {
        if (!m.combatOnly) {
          this.engageMonster(m);
          return;
        }
        const dmg = spec.atkDamageHearts;
        this.hp = Math.max(0, this.hp - dmg);
        this.encounterGraceTimer = 1.45;
        soundEngine.playHurt();
        const len = Math.max(0.25, distH);
        this.heroVel.set((dxHero / len) * 12, 0, (dzHero / len) * 12);
        this.heroVelY = 3.8;
        this.spawnBurst(this.heroPos.x, this.heroPos.y + 1.4, this.heroPos.z, 0xf97316, 16);
        this.showBanner(`🦅 Diserang ${m.name} dari langit! (-${dmg} ❤️)`, 2.4);
        this.triggerDamageFlash(dmg, `Serangan ${m.name} dari langit`, { x: m.x, z: m.z });
        if (this.hp <= 0) {
          this.phase = 'gameover';
          soundEngine.playLose();
          this.pushHud(true);
          return;
        }
      }
    } else if (m.windupTimer !== undefined && m.windupTimer > 0) {
      m.windupTimer -= dt;
      desiredDive = -1.25;
      targetYaw = Math.atan2(dxHero, dzHero);
      monMode = 'windup';
      if (m.windupTimer <= 0) {
        m.windupTimer = -1;
        m.lungeTimer = 0.58;
        soundEngine.playMonster();
      }
    } else if (this.phase === 'playing' && m.aggroActive && distH > 0.25) {
      targetYaw = Math.atan2(dxHero, dzHero);
      if (spec.ranged) {
        const orbitDir = m.patrolPhase % 2 < 1 ? 1 : -1;
        const nx = dxHero / distH;
        const nz = dzHero / distH;
        const strafeSpd = 3.8 * spec.speedMult * baseSpeedMult;
        nextMx += (-nz * orbitDir) * strafeSpd * dt;
        nextMz += (nx * orbitDir) * strafeSpd * dt;
        if (distH > 19) {
          const chaseSpd = 5.4 * spec.speedMult * baseSpeedMult;
          nextMx += nx * chaseSpd * dt;
          nextMz += nz * chaseSpd * dt;
        } else if (distH < 10.5) {
          const backSpd = 3.2 * spec.speedMult * baseSpeedMult;
          nextMx -= nx * backSpd * dt;
          nextMz -= nz * backSpd * dt;
        }

        if (distH >= 4.5 && distH < 30 && (m.attackCooldown ?? 0) <= 0) {
          const pSpeed = this.settings.difficulty === 'pendekar' ? 13.4 : 10.8;
          const mFireY = (m.y ?? cruiseY) + spec.hitCenterY * 0.6;
          const aimY = nearestSkyTgt.y + 1.35 - mFireY;
          const dist3D = Math.max(0.5, Math.hypot(dxHero, aimY, dzHero));
          const skyShotColor =
            m.type === 'crimson_phoenix'
              ? 0xfef08a
              : m.type === 'giant_phantom'
              ? 0x38bdf8
              : m.type === 'toxic_chimera'
              ? 0x4ade80
              : m.type === 'guardian_sentinel'
              ? 0xef4444
              : m.type === 'ice_shard_griffin'
              ? 0x7dd3fc
              : m.type === 'acidic_sky_wyrm'
              ? 0x84cc16
              : 0xf97316;
          const px = m.x + nx * (0.95 * spec.baseScale);
          const pz = m.z + nz * (0.95 * spec.baseScale);
          const pvx = (dxHero / dist3D) * pSpeed;
          const pvy = (aimY / dist3D) * pSpeed;
          const pvz = (dzHero / dist3D) * pSpeed;
          this.spawnProjectile({
            fromPlayer: false,
            x: px,
            y: mFireY,
            z: pz,
            vx: pvx,
            vy: pvy,
            vz: pvz,
            damage: 1,
            shieldDamage: 1,
            pierceLeft: 0,
            colorHex: skyShotColor,
          });
          if (this.worldMode === 'overworld' && this.multiplayerActive && this.hasConnectedPeers && this.isWorldAuthority()) {
            this.emitMultiplayerPacket({
              t: 'shot',
              fp: false,
              x: Math.round(px * 100) / 100,
              y: Math.round(mFireY * 100) / 100,
              z: Math.round(pz * 100) / 100,
              vx: Math.round(pvx * 100) / 100,
              vy: Math.round(pvy * 100) / 100,
              vz: Math.round(pvz * 100) / 100,
              col: skyShotColor,
              dmg: 1,
              md: 'overworld',
            });
          }
          m.attackCooldown = this.settings.difficulty === 'pendekar' ? 2.2 : 2.9;
          m.attackAnimTimer = 0.34;
        }
      } else {
        // Fast aerial swoopers: shadow_harpy, blight_hornet, volcanic_giant_bat
        if (distH < 9.5 && (m.attackCooldown ?? 0) <= 0) {
          m.windupTimer = 0.44;
          m.attackCooldown = this.settings.difficulty === 'pendekar' ? 2.1 : 2.7;
          soundEngine.playMonster();
        } else if (distH > 2.2) {
          const spd = 6.2 * spec.speedMult * baseSpeedMult;
          nextMx += (dxHero / distH) * spd * dt;
          nextMz += (dzHero / distH) * spd * dt;
        }
      }
    } else {
      m.patrolClock = (m.patrolClock ?? m.patrolPhase) + dt * 0.58 * spec.speedMult * baseSpeedMult;
      const p = m.patrolClock;
      const patrolRad = spec.tier === 'giant' ? 14 : 11;
      nextMx = m.homeX + Math.cos(p) * patrolRad;
      nextMz = m.homeZ + Math.sin(p * 0.72) * (patrolRad * 0.8);
      targetYaw = Math.atan2(
        -Math.sin(p) * patrolRad,
        Math.cos(p * 0.72) * (patrolRad * 0.8) * 0.72,
      );
    }

    if (m.hitFlashTimer && m.hitFlashTimer > 0) {
      monMode = 'hit';
    } else if ((m.attackAnimTimer ?? 0) > 0 && monMode === 'patrol') {
      monMode = 'shoot';
      monAttackProg = 1 - (m.attackAnimTimer ?? 0) / 0.34;
    }

    const skyLimit = WORLD_OCEAN_LIMIT - 22;
    const dOut = Math.hypot(nextMx, nextMz);
    if (dOut > skyLimit && dOut > 0.001) {
      nextMx = (nextMx / dOut) * skyLimit;
      nextMz = (nextMz / dOut) * skyLimit;
    }

    const prevX = m.x;
    const prevZ = m.z;
    m.x = nextMx;
    m.z = nextMz;

    const skySpd = Math.hypot(m.x - prevX, m.z - prevZ) / Math.max(0.001, dt);
    m.walkPhase = (m.walkPhase ?? m.patrolPhase) + dt * (4.2 + skySpd * 0.65);
    m.diveOffset = THREE.MathUtils.damp(m.diveOffset ?? 0, desiredDive, 10, dt);
    m.y = cruiseY - m.diveOffset + Math.sin(this.elapsed * 2.1 + m.patrolPhase) * 0.55;

    let yawDiff = targetYaw - m.mesh.rotation.y;
    while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
    while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
    m.mesh.rotation.y += yawDiff * (1 - Math.exp(-8.5 * dt));
    const bankRoll = THREE.MathUtils.clamp(-yawDiff * 0.38, -0.35, 0.35);
    const divePitch = THREE.MathUtils.clamp((m.diveOffset ?? 0) * 0.055, -0.25, 0.42);
    m.mesh.rotation.z = THREE.MathUtils.damp(m.mesh.rotation.z, bankRoll, 8, dt);
    m.mesh.rotation.x = THREE.MathUtils.damp(m.mesh.rotation.x, divePitch, 8, dt);

    m.mesh.position.set(m.x, m.y, m.z);
    m.mesh.scale.setScalar(spec.baseScale);

    if (distSqHero <= 76 * 76) {
      animateMonsterRig(m.mesh, {
        mode: monMode,
        speed: skySpd,
        walkPhase: m.walkPhase,
        elapsed: this.elapsed,
        phase: m.patrolPhase,
        attackProgress: monAttackProg,
        dt,
      });
    }
  }

  private pickHeroIdleThought(): string {
    let nearestName = '';
    let nearestDist = Infinity;
    for (const m of this.getActiveMonsters()) {
      if (!m.alive) continue;
      const d = Math.hypot(m.x - this.heroPos.x, m.z - this.heroPos.z);
      if (d < nearestDist) {
        nearestDist = d;
        nearestName = m.name;
      }
    }
    for (const s of this.shooters) {
      if (!s.alive) continue;
      const d = Math.hypot(s.x - this.heroPos.x, s.z - this.heroPos.z);
      if (d < nearestDist) {
        nearestDist = d;
        nearestName = 'Penembak Liar';
      }
    }

    if (nearestDist < 17.5 && Math.random() < 0.68) {
      const mRounded = Math.max(1, Math.round(nearestDist));
      const alerts = [
        `Waspada! Ada ${nearestName} sekitar ${mRounded}m di dekat sini!`,
        `Hmm... seperti ada suara langkah ${nearestName} (${mRounded}m).`,
        `Tetap siaga... ${nearestName} mengintai tidak jauh dari sini!`,
      ];
      return alerts[Math.floor(Math.random() * alerts.length)];
    }

    if (this.hp <= 2 && Math.random() < 0.55) {
      return `Nyawa tinggal ${this.hp}/${this.maxHp}... cari Hati atau jaga jarak aman.`;
    }

    if (this.worldMode === 'overworld' && this.getCurrentDayPhase() === 'malam' && Math.random() < 0.4) {
      return 'Malam makin gelap... monster malam bisa muncul kapan saja!';
    }

    if (Math.random() < 0.48 && VOCAB_CATALOG.length > 0) {
      const unmastered = VOCAB_CATALOG.filter((v) => (this.wordProgress[v.id]?.b ?? 0) < 3);
      const pool = unmastered.length > 0 ? unmastered : VOCAB_CATALOG;
      const v = pool[Math.floor(Math.random() * pool.length)];
      const styles = [
        `Ingat kata ini? "${v.word}" artinya "${v.meaningId}"!`,
        `Latih memori: "${v.word}" (${v.phonetic}) = ${v.meaningId}`,
        `Kosakata ${v.cefr}: "${v.word}" -> ${v.meaningId}`,
      ];
      return styles[Math.floor(Math.random() * styles.length)];
    }

    const idleThoughts = [
      '*Krucuk...* Perut mulai keroncongan nih.',
      '*Huff...* Tarik napas dalam dulu biar fokus.',
      '*Hoaam...* Sebentar lagi lanjut berburu kata & mahkota!',
      'Dengar suara angin dan suasana sekitar... tenang juga.',
      'Sedang melamun... kira-kira rahasia apa lagi di Istana IELTS?',
      'Cek kesiapan dulu... semoga otot tidak pegal waktu bertarung!',
    ];
    if (this.worldMode === 'dungeon') {
      idleThoughts.push('Suara gema di dalam gua terdengar cukup menyeramkan...');
    }
    return idleThoughts[Math.floor(Math.random() * idleThoughts.length)];
  }

  private pickNpcIdleThought(npcId: string): string {
    const npcDef = getZoneNpcById(npcId);
    const npcState = this.npcs.get(npcId);
    const isOnDuty = npcState ? this.isNpcOnDuty(npcState.shift) : true;
    if (npcState) {
      for (const m of this.getActiveMonsters()) {
        if (!m.alive) continue;
        if (Math.hypot(m.x - npcState.x, m.z - npcState.z) < 15) {
          return `Hati-hati... ada ${m.name} berkeliaran di dekat sini.`;
        }
      }
    }

    if (!isOnDuty) {
      const partnerDef = getZoneNpcById(npcState?.partnerNpcId);
      const offDutyThoughts = [
        `Senangnya berbaur sebagai warga biasa sambil menunggu giliran jaga!`,
        `Sekarang ${partnerDef?.name ?? 'rekanku'} yang berjaga di pintu ${npcDef?.zoneName ?? 'wilayah'}.`,
        'Udara pulau terasa segar setelah lepas piket...',
        'Mengamati warga sekitar... pulau tetap aman berkat kerja sama shift!',
      ];
      return offDutyThoughts[Math.floor(Math.random() * offDutyThoughts.length)];
    }

    if (npcDef && Math.random() < 0.45) {
      const zoneWords = VOCAB_CATALOG.filter((v) => v.zoneId === npcDef.zoneId);
      const pool = zoneWords.length > 0 ? zoneWords : VOCAB_CATALOG;
      const v = pool[Math.floor(Math.random() * pool.length)];
      return `Sambil jaga pintu, ingat kata "${v.word}" = ${v.meaningId}.`;
    }

    const npcThoughts = [
      'Mengawasi pintu masuk... aman terkendali sepanjang shift.',
      '*Krucuk...* Nanti habis pergantian shift makan apa ya?',
      'Melirik sekitar... situasi pintu wilayah tampaknya aman terkendali.',
      `Tarik napas pelan... tetap semangat menjaga ${npcDef?.zoneName ?? 'desa'}!`,
      'Berdiri lama bikin kaki pegal, goyang lutut sebentar ah...',
    ];
    return npcThoughts[Math.floor(Math.random() * npcThoughts.length)];
  }

  private buildRadarState(): RadarState | null {
    if (this.phase !== 'playing') return null;

    this.camera.getWorldDirection(_v1);
    _v1.y = 0;
    if (_v1.lengthSq() < 0.001) _v1.set(0, 0, -1);
    _v1.normalize();

    const blips: RadarBlip[] = [];

    if (this.worldMode === 'overworld') {
      if (!this.starterWeaponPicked) {
        blips.push({
          id: 'starter',
          x: OVERWORLD_ANCHORS.starterWeapon.x,
          z: OVERWORLD_ANCHORS.starterWeapon.z,
          kind: 'starter',
          color: '#38bdf8',
          needsHelp: true,
          label: 'Senjata Pertama',
        });
      }
      if (!this.swimSuitPicked) {
        blips.push({
          id: 'swimsuit',
          x: OVERWORLD_ANCHORS.swimSuit.x,
          z: OVERWORLD_ANCHORS.swimSuit.z,
          kind: 'swimsuit',
          color: '#06b6d4',
          needsHelp: true,
          label: 'Pakaian Renang',
        });
      }
      for (let vi = 0; vi < this.worldVehicles.length; vi++) {
        const v = this.worldVehicles[vi];
        blips.push({
          id: `car_${v.id}`,
          x: v.pos.x,
          z: v.pos.z,
          kind: 'car',
          color: v.driverKind === 'npc' ? '#f59e0b' : v.radarColor,
          label: v.driverKind === 'npc' ? `${v.name} (NPC)` : v.name,
        });
      }
      for (let bi = 0; bi < AIRBASE_ISLANDS.length; bi++) {
        const b = AIRBASE_ISLANDS[bi];
        blips.push({
          id: b.id,
          x: b.cx,
          z: b.cz,
          kind: 'airbase',
          color: b.radarColor,
          label: b.name,
        });
      }
      for (let pi = 0; pi < this.worldPlanes.length; pi++) {
        const pl = this.worldPlanes[pi];
        blips.push({
          id: `plane_${pl.id}`,
          x: pl.pos.x,
          z: pl.pos.z,
          kind: 'plane',
          color: pl.occupied ? '#38bdf8' : '#7dd3fc',
          label: pl.name,
        });
      }
      const spotKindByZone: Record<ZoneId, RadarBlipKind> = {
        desa_sapaan: 'spot_desa',
        pasar_rasa: 'spot_pasar',
        hutan_satwa: 'spot_satwa',
        gerbang_kota: 'spot_gerbang',
        menara_waktu: 'spot_menara',
        gua_portal: 'spot_gua',
      };
      const isNightRadar = this.getCurrentDayPhase() === 'malam';
      for (const npc of NPC_CATALOG) {
        const zId = npc.zoneId as ZoneId;
        const liberated = this.liberatedZones.has(zId);
        const activeDef = getActiveZoneNpcDef(zId, isNightRadar);
        const live = this.npcs.get(activeDef.id);
        blips.push({
          id: `npc_${npc.id}`,
          x: live?.x ?? activeDef.x,
          z: live?.z ?? activeDef.z,
          kind: spotKindByZone[zId] ?? 'npc',
          color: activeDef.accentColor,
          liberated,
          needsHelp: !liberated,
          label: ZONE_INFO[zId].name,
        });
      }
      blips.push({
        id: 'portal',
        x: OVERWORLD_ANCHORS.portal.x,
        z: OVERWORLD_ANCHORS.portal.z,
        kind: 'portal',
        color: '#a855f7',
        needsHelp: !IELTS_TEMPORARILY_LOCKED && !this.ieltsCleared,
        label: IELTS_TEMPORARILY_LOCKED
          ? 'Istana IELTS (Ditutup Sementara)'
          : 'Portal Istana IELTS',
      });
      for (const m of this.monsters) {
        if (!m.alive) continue;
        blips.push({
          id: `om_${m.id}`,
          x: m.x,
          z: m.z,
          kind: m.combatOnly ? 'monster_brawl' : 'monster_quiz',
          color: m.combatOnly ? '#ef4444' : '#a855f7',
          label: m.name,
        });
      }
      for (const m of this.seaMonsters) {
        if (!m.alive) continue;
        blips.push({
          id: `sea_${m.id}`,
          x: m.x,
          z: m.z,
          kind: 'sea_monster',
          color: '#fb7185',
          label: m.name,
        });
      }
      for (const m of this.skyMonsters) {
        if (!m.alive) continue;
        blips.push({
          id: `sky_${m.id}`,
          x: m.x,
          z: m.z,
          kind: 'sky_monster',
          color: m.combatOnly ? '#f97316' : '#c084fc',
          label: m.name,
        });
      }
      if (this.multiplayerActive && this.remotePeers.size > 0) {
        for (const peer of this.remotePeers.values()) {
          if (peer.state.worldMode !== this.worldMode) continue;
          const peerLowHp =
            typeof peer.state.hp === 'number' && peer.state.hp > 0 && peer.state.hp <= 2;
          blips.push({
            id: `peer_${peer.state.uid}`,
            x: peer.pos.x,
            z: peer.pos.z,
            kind: 'hero_friend',
            color: peerLowHp ? '#fb7185' : '#34d399',
            needsHelp: peerLowHp,
            label: peer.state.displayName,
          });
        }
      }
      if (this.archipelagoUnderwaterRig && this.isHeroUnderwater()) {
        for (const ch of this.archipelagoUnderwaterRig.chests) {
          if (ch.opened) continue;
          blips.push({
            id: `och_${ch.id}`,
            x: ch.x,
            z: ch.z,
            kind: 'chest',
            color: '#facc15',
            label: ch.label,
          });
        }
        for (const pk of this.archipelagoUnderwaterRig.pickups) {
          if (!pk.active) continue;
          blips.push({
            id: `opk_${pk.id}`,
            x: pk.x,
            z: pk.z,
            kind: pk.kind === 'weapon' ? 'chest' : 'collectible',
            color: pk.kind === 'heart' ? '#fb7185' : pk.kind === 'diamond' ? '#38bdf8' : '#facc15',
            label: pk.label,
          });
        }
      }
    } else if (this.worldMode === 'dungeon' && this.dungeonState) {
      blips.push({
        id: 'exit',
        x: this.dungeonExitPos.x,
        z: this.dungeonExitPos.z,
        kind: 'exit',
        color: '#22d3ee',
      });
      if (this.dungeonRig) {
        blips.push({
          id: 'guardian',
          x: this.dungeonRig.guardianPos.x,
          z: this.dungeonRig.guardianPos.z,
          kind: 'guardian',
          color: this.dungeonState.liberated ? '#22c55e' : '#fde047',
          liberated: this.dungeonState.liberated,
          needsHelp: !this.dungeonState.liberated,
        });
        if (this.dungeonState.prisonKeySpawned && !this.dungeonState.prisonKeyCollected) {
          blips.push({
            id: 'prison_key',
            x: 0,
            z: -9,
            kind: 'key',
            color: '#facc15',
            needsHelp: true,
          });
        }
        blips.push({
          id: 'hidden_prison',
          x: this.dungeonRig.prisonPos.x,
          z: this.dungeonRig.prisonPos.z,
          kind: 'prison',
          color: this.dungeonState.prisonUnlocked
            ? '#22c55e'
            : this.dungeonState.prisonKeyCollected
            ? '#facc15'
            : '#fb7185',
          liberated: this.dungeonState.prisonUnlocked,
          needsHelp: this.dungeonState.prisonKeyCollected && !this.dungeonState.prisonUnlocked,
        });
        blips.push({
          id: 'craft',
          x: this.dungeonRig.craftingTablePos.x,
          z: this.dungeonRig.craftingTablePos.z,
          kind: 'craft',
          color: '#d97706',
        });
        if (!this.dungeonRig.weaponChest.collected) {
          blips.push({
            id: 'chest',
            x: this.dungeonRig.weaponChest.x,
            z: this.dungeonRig.weaponChest.z,
            kind: 'chest',
            color: '#facc15',
          });
        }
        const cleared = new Set(this.dungeonState.doorsCleared);
        for (const d of this.dungeonRig.doors) {
          blips.push({
            id: `door_${d.index}`,
            x: d.def.x,
            z: d.def.z,
            kind: 'door',
            color: cleared.has(d.index) ? '#22c55e' : '#fde047',
            liberated: cleared.has(d.index),
          });
        }
      }
      for (const m of this.dungeonMonsters) {
        if (!m.alive) continue;
        blips.push({
          id: `dm_${m.id}`,
          x: m.x,
          z: m.z,
          kind: m.isBoss
            ? 'boss'
            : m.combatOnly || m.isCaveMob
            ? 'monster_brawl'
            : 'monster_quiz',
          color: m.isBoss ? '#dc2626' : m.combatOnly || m.isCaveMob ? '#ef4444' : '#a855f7',
        });
      }
    } else if (this.worldMode === 'academy') {
      blips.push({
        id: 'exit',
        x: this.dungeonExitPos.x,
        z: this.dungeonExitPos.z,
        kind: 'exit',
        color: '#22d3ee',
      });
      for (const npc of ACADEMY_NPCS) {
        blips.push({
          id: `ac_${npc.id}`,
          x: npc.x,
          z: npc.z,
          kind: 'npc',
          color: '#a855f7',
        });
      }
      for (const m of this.academyMonsters) {
        if (!m.alive) continue;
        blips.push({
          id: `am_${m.id}`,
          x: m.x,
          z: m.z,
          kind: 'monster_quiz',
          color: '#a855f7',
        });
      }
    } else if (this.worldMode === 'ocean' && this.oceanRig) {
      blips.push({
        id: 'ocean_exit',
        x: this.oceanRig.buoyPos.x,
        z: this.oceanRig.buoyPos.z,
        kind: 'exit',
        color: '#22d3ee',
        label: 'Pelampung Naik',
      });
      for (const ch of this.oceanRig.chests) {
        if (ch.opened) continue;
        blips.push({
          id: `och_${ch.id}`,
          x: ch.x,
          z: ch.z,
          kind: 'chest',
          color: '#facc15',
          label: ch.label,
        });
      }
      for (const pk of this.oceanRig.pickups) {
        if (!pk.active) continue;
        blips.push({
          id: `opk_${pk.id}`,
          x: pk.x,
          z: pk.z,
          kind: pk.kind === 'weapon' ? 'chest' : 'collectible',
          color: pk.kind === 'heart' ? '#fb7185' : pk.kind === 'diamond' ? '#38bdf8' : '#facc15',
          label: pk.label,
        });
      }
      for (const m of this.oceanMonsters) {
        if (!m.alive) continue;
        blips.push({
          id: `oc_${m.id}`,
          x: m.x,
          z: m.z,
          kind: 'sea_monster',
          color: '#f43f5e',
          label: m.name,
        });
      }
    }

    return {
      heroX: this.heroPos.x,
      heroZ: this.heroPos.z,
      heroYaw: this.heroYaw,
      camForwardX: _v1.x,
      camForwardZ: _v1.z,
      worldMode: this.worldMode,
      blips,
    };
  }

  public getLiveMapSnapshot(kind: 'minimap' | 'full'): LiveMapSnapshot | null {
    if (this.disposed) return null;
    const isMini = kind === 'minimap';
    const canvas = isMini ? this.mapCanvasMinimap : this.mapCanvasFull;
    const ctx = isMini ? this.mapCtxMinimap : this.mapCtxFull;
    const imgData = isMini ? this.mapImageDataMinimap : this.mapImageDataFull;
    const rt = isMini ? this.mapRtMinimap : this.mapRtFull;
    const pixels = isMini ? this.mapPixelsMinimap : this.mapPixelsFull;
    const w = isMini ? MAP_MINI_SIZE : MAP_FULL_W;
    const h = isMini ? MAP_MINI_SIZE : MAP_FULL_H;
    if (!ctx || !imgData) return null;

    const bounds: LiveMapBounds =
      this.worldMode === 'overworld'
        ? isMini
          ? {
              worldMode: 'overworld',
              centerX: THREE.MathUtils.clamp(this.heroPos.x, -225, 245),
              centerZ: THREE.MathUtils.clamp(this.heroPos.z, -225, 220),
              halfW: 36,
              halfH: 36,
            }
          : {
              worldMode: 'overworld',
              centerX: -4,
              centerZ: -20,
              halfW: 410,
              halfH: 256,
            }
        : this.worldMode === 'ocean'
        ? isMini
          ? {
              worldMode: 'ocean',
              centerX: THREE.MathUtils.clamp(this.heroPos.x, -26, 26),
              centerZ: THREE.MathUtils.clamp(this.heroPos.z, -38, 22),
              halfW: 18,
              halfH: 18,
            }
          : {
              worldMode: 'ocean',
              centerX: 0,
              centerZ: -12,
              halfW: 60.8,
              halfH: 38,
            }
        : isMini
        ? {
            worldMode: this.worldMode,
            centerX: THREE.MathUtils.clamp(this.heroPos.x, -8, 8),
            centerZ: THREE.MathUtils.clamp(this.heroPos.z, -8, 8),
            halfW: 15,
            halfH: 15,
          }
        : {
            worldMode: this.worldMode,
            centerX: 0,
            centerZ: 0,
            halfW: 36.8,
            halfH: 23,
          };

    const now = performance.now();
    const key = `${this.worldMode}:${this.dungeonState?.zoneId ?? ''}:${this.phase}`;
    const lastMs = isMini ? this.lastMinimapCaptureMs : this.lastFullMapCaptureMs;
    const lastKey = isMini ? this.lastMinimapKey : this.lastFullMapKey;
    const minInterval = isMini
      ? this.isLowEndMobile
        ? 1400
        : this.isMobileDevice
        ? 950
        : 450
      : this.isMobileDevice
      ? 650
      : 350;

    if (key === lastKey) {
      if (now - lastMs < minInterval) {
        return {
          canvas,
          bounds: isMini ? this.lastMinimapBounds : this.lastFullMapBounds,
        };
      }
      const miniDistThresh = this.isLowEndMobile ? 1.8 : 1.1;
      if (
        isMini &&
        Math.hypot(this.heroPos.x - this.lastMiniHeroX, this.heroPos.z - this.lastMiniHeroZ) <
          miniDistThresh &&
        now - lastMs < 3800
      ) {
        return {
          canvas,
          bounds: this.lastMinimapBounds,
        };
      }
    }

    if (isMini) {
      this.lastMinimapCaptureMs = now;
      this.lastMinimapKey = key;
      this.lastMinimapBounds = bounds;
      this.lastMiniHeroX = this.heroPos.x;
      this.lastMiniHeroZ = this.heroPos.z;
    } else {
      this.lastFullMapCaptureMs = now;
      this.lastFullMapKey = key;
      this.lastFullMapBounds = bounds;
    }

    this.mapCamera.left = -bounds.halfW;
    this.mapCamera.right = bounds.halfW;
    this.mapCamera.top = bounds.halfH;
    this.mapCamera.bottom = -bounds.halfH;
    this.mapCamera.near = 0.5;
    this.mapCamera.far = 320;
    this.mapCamera.updateProjectionMatrix();
    this.mapCamera.position.set(bounds.centerX, 125, bounds.centerZ);
    this.mapCamera.up.set(0, 0, -1);
    this.mapCamera.lookAt(bounds.centerX, 0, bounds.centerZ);

    const mapHiddenList =
      this.worldMode === 'dungeon' && this.dungeonRig
        ? this.mapHiddenDungeon
        : this.worldMode === 'academy' && this.academyRig
        ? this.mapHiddenAcademy
        : this.worldMode === 'ocean' && this.oceanRig
        ? this.mapHiddenOcean
        : this.mapHiddenOverworld;
    const hiddenTemp: THREE.Object3D[] = [];
    for (let i = 0; i < mapHiddenList.length; i++) {
      const obj = mapHiddenList[i];
      if (obj.visible) {
        obj.visible = false;
        hiddenTemp.push(obj);
      }
    }
    const prevFpVisible = this.fpViewRig.root.visible;
    this.fpViewRig.root.visible = false;

    const prevFog = this.scene.fog;
    this.scene.fog = null;
    const prevBgHex =
      this.scene.background instanceof THREE.Color ? this.scene.background.getHex() : null;
    const prevHemi = this.hemiLight.intensity;
    const prevSun = this.sunLight.intensity;
    const prevRim = this.rimLight.intensity;
    const prevEnv = this.scene.environmentIntensity;
    const prevShadowAuto = this.renderer.shadowMap.autoUpdate;

    if (this.worldMode === 'dungeon') {
      if (this.scene.background instanceof THREE.Color) {
        this.scene.background.setHex(0x0b1220);
      }
      this.hemiLight.intensity = Math.max(prevHemi, 1.38);
      this.sunLight.intensity = Math.max(prevSun, 1.42);
      this.rimLight.intensity = Math.max(prevRim, 0.55);
      this.scene.environmentIntensity = Math.max(prevEnv, 0.85);
    } else if (this.worldMode === 'ocean') {
      if (this.scene.background instanceof THREE.Color) {
        this.scene.background.setHex(0x072c48);
      }
      this.hemiLight.intensity = 1.45;
      this.sunLight.intensity = 1.4;
      this.rimLight.intensity = 0.55;
      this.scene.environmentIntensity = 0.85;
    } else if (this.worldMode === 'overworld' && prevHemi < 0.74) {
      this.hemiLight.intensity = 0.74;
      this.sunLight.intensity = Math.max(prevSun, 0.88);
      this.scene.environmentIntensity = Math.max(prevEnv, 0.65);
    }

    const prevRt = this.renderer.getRenderTarget();
    try {
      this.renderer.shadowMap.autoUpdate = false;
      this.renderer.setRenderTarget(rt);
      this.renderer.clear();
      this.renderer.render(this.scene, this.mapCamera);
      this.renderer.readRenderTargetPixels(rt, 0, 0, w, h, pixels);
    } finally {
      this.renderer.setRenderTarget(prevRt);
      this.renderer.shadowMap.autoUpdate = prevShadowAuto;
      this.scene.fog = prevFog;
      if (prevBgHex !== null && this.scene.background instanceof THREE.Color) {
        this.scene.background.setHex(prevBgHex);
      }
      this.hemiLight.intensity = prevHemi;
      this.sunLight.intensity = prevSun;
      this.rimLight.intensity = prevRim;
      this.scene.environmentIntensity = prevEnv;
      this.fpViewRig.root.visible = prevFpVisible;
      for (const obj of hiddenTemp) {
        obj.visible = true;
      }
    }

    const dst = imgData.data;
    const rowBytes = w * 4;
    for (let y = 0; y < h; y++) {
      const srcRowStart = (h - 1 - y) * rowBytes;
      const dstRowStart = y * rowBytes;
      for (let i = 0; i < rowBytes; i += 4) {
        dst[dstRowStart + i] = LINEAR_TO_SRGB_LUT[pixels[srcRowStart + i]];
        dst[dstRowStart + i + 1] = LINEAR_TO_SRGB_LUT[pixels[srcRowStart + i + 1]];
        dst[dstRowStart + i + 2] = LINEAR_TO_SRGB_LUT[pixels[srcRowStart + i + 2]];
        dst[dstRowStart + i + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    return { canvas, bounds };
  }

  private pushHud(force: boolean): void {
    const now = performance.now();
    const baseHudMinMs = this.isLowEndMobile ? 250 : this.isMobileDevice ? 200 : 140;
    if (!force) {
      const moved =
        Math.abs(this.heroPos.x - this.lastHudHeroX) +
        Math.abs(this.heroPos.z - this.lastHudHeroZ);
      const camDelta = Math.abs(this.cameraYaw - this.lastHudCamYaw);
      const heroSpd = Math.abs(this.heroVel.x) + Math.abs(this.heroVel.z);
      const isIdleHud =
        moved < 0.05 &&
        camDelta < 0.015 &&
        heroSpd < 0.05 &&
        !this.leftFireHeld &&
        !this.hudFireHeld &&
        this.fireCooldown <= 0 &&
        this.bannerTimer <= 0 &&
        !this.nearbyNpcId &&
        !this.nearbyMonsterId;
      const hudMinMs = isIdleHud
        ? this.isLowEndMobile
          ? 480
          : this.isMobileDevice
          ? 420
          : 340
        : baseHudMinMs;
      if (now - this.lastHudPushMs < hudMinMs) return;
    }
    this.lastHudPushMs = now;
    this.lastHudHeroX = this.heroPos.x;
    this.lastHudHeroZ = this.heroPos.z;
    this.lastHudCamYaw = this.cameraYaw;

    const lv = getLevelInfo(this.xp);
    const zoneId =
      this.worldMode === 'dungeon' && this.dungeonState
        ? this.dungeonState.zoneId
        : getZoneForPosition(this.heroPos.x, this.heroPos.z);

    if (this.wordProgressDirty) {
      let seen = 0;
      let mastered = 0;
      const legacyMastery: Record<string, number> = {};
      const learnedIds: string[] = [];
      for (const [id, p] of Object.entries(this.wordProgress)) {
        if (p.r + p.w > 0) {
          seen++;
          learnedIds.push(id);
        }
        if (p.b >= 3) mastered++;
        legacyMastery[id] = p.b;
      }
      this.cachedWordSummary = {
        seen,
        mastered,
        learnedIds,
        legacyMastery,
        wordProgressCopy: { ...this.wordProgress },
      };
      this.wordProgressDirty = false;
    }
    const { seen, mastered, learnedIds, legacyMastery, wordProgressCopy } = this.cachedWordSummary;

    this.callbacks.onHudUpdate({
      phase: this.phase,
      worldMode: this.worldMode,
      cameraMode: this.cameraMode,
      activeHotbarSlot: this.activeHotbarSlot,
      level: lv.level,
      xp: lv.xpInLevel,
      xpToNext: lv.xpNeeded,
      hp: this.hp,
      maxHp: this.maxHp,
      diamonds: this.diamonds,
      score: this.score,
      streak: this.streak,
      maxStreak: this.maxStreak,
      dailyCount: this.dailyCount,
      dailyGoal: DAILY_GOAL,
      activeWeapon: this.activeWeapon,
      ownedWeapons: Array.from(this.ownedWeapons),
      weaponAmmo: { ...this.weaponAmmo },
      starterWeaponPicked: this.starterWeaponPicked,
      starterWeaponGuide: (() => {
        if (this.starterWeaponPicked || this.worldMode !== 'overworld' || this.phase !== 'playing') {
          return null;
        }
        const sw = OVERWORLD_ANCHORS.starterWeapon;
        const tx = sw.x - this.heroPos.x;
        const tz = sw.z - this.heroPos.z;
        const distance = Math.max(1, Math.round(Math.hypot(tx, tz)));
        this.camera.getWorldDirection(_v1);
        _v1.y = 0;
        if (_v1.lengthSq() < 0.001) _v1.set(0, 0, -1);
        _v1.normalize();
        const fx = _v1.x;
        const fz = _v1.z;
        const rx = -fz;
        const rz = fx;
        const forwardDot = tx * fx + tz * fz;
        const rightDot = tx * rx + tz * rz;
        const angleDeg = Math.round((Math.atan2(rightDot, forwardDot) * 180) / Math.PI);
        const absA = Math.abs(angleDeg);
        const directionLabel =
          absA < 30
            ? 'Lurus Depan'
            : absA > 150
            ? 'Belakang'
            : angleDeg > 0
            ? absA < 115
              ? 'Kanan'
              : 'Kanan Belakang'
            : absA < 115
            ? 'Kiri'
            : 'Kiri Belakang';
        return { distance, angleDeg, directionLabel };
      })(),
      swimSuitPicked: this.swimSuitPicked,
      swimSuitGuide: (() => {
        if (this.swimSuitPicked || this.worldMode !== 'overworld' || this.phase !== 'playing') {
          return null;
        }
        const ss = OVERWORLD_ANCHORS.swimSuit;
        const tx = ss.x - this.heroPos.x;
        const tz = ss.z - this.heroPos.z;
        const distance = Math.max(1, Math.round(Math.hypot(tx, tz)));
        this.camera.getWorldDirection(_v1);
        _v1.y = 0;
        if (_v1.lengthSq() < 0.001) _v1.set(0, 0, -1);
        _v1.normalize();
        const fx = _v1.x;
        const fz = _v1.z;
        const rx = -fz;
        const rz = fx;
        const forwardDot = tx * fx + tz * fz;
        const rightDot = tx * rx + tz * rz;
        const angleDeg = Math.round((Math.atan2(rightDot, forwardDot) * 180) / Math.PI);
        const absA = Math.abs(angleDeg);
        const directionLabel =
          absA < 30
            ? 'Lurus Depan'
            : absA > 150
            ? 'Belakang'
            : angleDeg > 0
            ? absA < 115
              ? 'Kanan'
              : 'Kanan Belakang'
            : absA < 115
            ? 'Kiri'
            : 'Kiri Belakang';
        return { distance, angleDeg, directionLabel };
      })(),
      nearSeaShore: this.isHeroNearSeaShore(),
      diveTransitionStage: this.diveTransition?.active ? this.diveTransition.stage : 'idle',
      radarState: this.buildRadarState(),
      ownedRelics: Array.from(this.ownedRelics),
      crowns: this.ribbons.size,
      ribbons: Array.from(this.ribbons),
      monstersDefeated: this.monstersDefeated,
      wordsMastered: mastered,
      wordsSeen: seen,
      learnedVocabIds: learnedIds,
      wordProgress: wordProgressCopy,
      wordMastery: legacyMastery,
      activeZoneId: zoneId,
      activeZoneName:
        this.worldMode === 'academy'
          ? 'Istana IELTS'
          : this.worldMode === 'ocean'
          ? getOceanZoneInfo(this.heroPos.z, this.heroPos.y).label
          : this.isHeroUnderwater()
          ? `${ZONE_INFO[zoneId].name} · ${getArchipelagoOceanZoneInfo(this.heroPos.y).label}`
          : ZONE_INFO[zoneId].name,
      rankTitle: getRankTitle(this.xp, this.ribbons.size, this.ieltsCleared),
      nearbyNpcId: this.nearbyNpcId,
      guardianTalkTutorial: Boolean(
        this.phase === 'playing' &&
          this.worldMode === 'overworld' &&
          this.villageAmbushState?.active &&
          this.villageAmbushState.stage === 'awaiting_guardian_talk' &&
          this.nearbyNpcId ===
            getActiveZoneNpcDef('desa_sapaan', this.getCurrentDayPhase() === 'malam').id,
      ),
      nearbyOverworldZoneDoor: this.nearbyOverworldZoneDoor,
      nightPermittedZones: Array.from(this.nightPermittedZones),
      nearbyMonsterId: this.nearbyMonsterId,
      nearbyDoorIndex: this.nearbyDoorIndex,
      nearbyDungeonGuardian: this.nearbyDungeonGuardian,
      nearPrisonKey: this.nearPrisonKey,
      nearHiddenPrison: this.nearHiddenPrison,
      nearPortal: this.nearPortal,
      nearDungeonExit: this.nearDungeonExit,
      portalUnlocked:
        !IELTS_TEMPORARILY_LOCKED && (!this.settings.storyLocked || this.ribbons.size >= 6),
      dungeonState: this.dungeonState ? { ...this.dungeonState } : null,
      areaMonsterStats: this.buildAreaMonsterStats(zoneId),
      liberatedZones: Array.from(this.liberatedZones),
      areaDoorsCleared: {
        desa_sapaan: [...(this.areaDoorsCleared.desa_sapaan || [])],
        pasar_rasa: [...(this.areaDoorsCleared.pasar_rasa || [])],
        hutan_satwa: [...(this.areaDoorsCleared.hutan_satwa || [])],
        gerbang_kota: [...(this.areaDoorsCleared.gerbang_kota || [])],
        menara_waktu: [...(this.areaDoorsCleared.menara_waktu || [])],
        gua_portal: [...(this.areaDoorsCleared.gua_portal || [])],
      },
      ieltsScores: { ...this.ieltsScores },
      quests: this.quests.map((q) => ({ ...q })),
      projectedLabels: this.computeLabels(),
      bannerMessage: this.bannerMessage,
      storyDialog: this.storyDialog ? { ...this.storyDialog } : null,
      settings: { ...this.settings },
      hasSavedGame: this.hasSave,
      caveTorchesLeft: this.caveTorchesLeft,
      caveShieldBlocksLeft: this.caveShieldBlocksLeft,
      caveTntLeft: this.caveTntLeft,
      pickaxeTier: this.pickaxeTier,
      nearCraftingTable: this.nearCraftingTable,
      caveBlocksMined: this.caveBlocksMined,
      targetedBlock:
        this.worldMode === 'dungeon' && this.targetedCaveBlock && this.targetedCaveBlock.alive
          ? {
              id: this.targetedCaveBlock.id,
              kind: this.targetedCaveBlock.kind,
              label: this.targetedCaveBlock.label,
              hp: this.targetedCaveBlock.hp,
              maxHp: this.targetedCaveBlock.maxHp,
            }
          : null,
      isAiming: this.isAiming,
      hitMarkerKind: this.hitMarkerTimer > 0 ? this.hitMarkerKind : 'none',
      damageFlashSeq: this.damageFlashTimer > 0 ? this.damageFlashSeq : 0,
      lastDamageAmount: this.lastDamageAmount,
      lastDamageDir: this.lastDamageDir,
      defeatReason: this.phase === 'gameover' ? this.lastDefeatReason : null,
      crosshairOnEnemy: this.crosshairOnEnemy,
      crosshairSpread: Math.min(
        1,
        this.crosshairSpread + (Math.hypot(this.heroVel.x, this.heroVel.z) > 1.2 ? 0.24 : 0),
      ),
      pointerLocked: this.pointerLocked,
      isSwimming: this.isSwimming,
      swimStylePreference: this.swimStylePreference,
      activeSwimStyle: this.activeSwimStyle,
      oceanSurvival: this.buildOceanSurvivalState(),
      worldTime: this.getWorldTimeState(),
      nearbyInjuredPeer: this.nearbyInjuredPeer,
      allyHelpCooldownSec: Math.ceil(this.allyHelpCooldown),
      squadName: this.currentSquadName || undefined,
      waveMission: this.getWaveMissionState(),
      localMabarStats: { ...this.localMabarStats },
      carState: this.buildCarHudState(),
      planeState: this.buildPlaneHudState(),
    });
  }

  private buildOceanSurvivalState(): OceanSurvivalState | null {
    if (this.worldMode !== 'ocean' && !this.isHeroUnderwater() && !this.ridingTurtle) return null;
    const zone =
      this.worldMode === 'ocean'
        ? getOceanZoneInfo(this.heroPos.z, this.heroPos.y)
        : getArchipelagoOceanZoneInfo(this.heroPos.y);
    const maxOxygen = this.getOceanMaxOxygen();
    const unlimitedOxygen = this.hasUnlimitedOceanOxygen();
    return {
      oxygen: Math.round(unlimitedOxygen ? maxOxygen : this.oceanOxygen),
      maxOxygen,
      unlimitedOxygen,
      depthMeters: Math.max(1, Math.round(-this.heroPos.y)),
      zoneKind: zone.kind,
      zoneLabel: zone.label,
      discoveredBiota: Array.from(this.discoveredBiota),
      ownedGear: Array.from(this.oceanGear),
      materials: { ...this.oceanMaterials },
      nearBiotaId: this.nearBiotaNode?.speciesId ?? null,
      nearBiotaName: this.nearBiotaNode
        ? SEA_BIOTA_BY_ID[this.nearBiotaNode.speciesId]?.indoName ?? null
        : null,
      nearBiotaAction: this.nearBiotaNode
        ? getBiotaActionLabel(this.nearBiotaNode.speciesId)
        : null,
      nearChestLabel: this.nearOceanChest?.label ?? null,
      nearTurtleMount: this.nearOceanTurtle,
      ridingTurtle: this.ridingTurtle,
      nearSurfaceExit: this.nearDungeonExit,
      suffocating: !unlimitedOxygen && this.oceanOxygen <= 0,
    };
  }

  private buildAreaMonsterStats(zoneId: ZoneId): AreaMonsterStats {
    if (this.worldMode === 'dungeon' && this.dungeonState) {
      const remaining =
        this.dungeonMonsters.filter((m) => m.alive).length +
        this.shooters.filter((s) => s.alive).length;
      const total = Math.max(this.dungeonTotalSpawned, remaining);
      const defeated = Math.max(0, total - remaining);
      const guardiansTotal = this.dungeonState.monstersTotal;
      const guardiansRemaining = this.dungeonState.monstersRemaining;
      const guardiansDefeated = Math.max(0, guardiansTotal - guardiansRemaining);
      return {
        context: 'dungeon',
        areaName: `Gua ${this.dungeonState.zoneName}`,
        defeated,
        remaining,
        total,
        guardiansDefeated,
        guardiansTotal,
        bossPending: !this.dungeonState.bossSpawned && !this.dungeonState.bossDefeated,
        bossActive: this.dungeonState.bossSpawned && !this.dungeonState.bossDefeated,
        bossDefeated: this.dungeonState.bossDefeated,
      };
    }

    if (this.worldMode === 'ocean') {
      const remaining = this.oceanMonsters.filter((m) => m.alive).length;
      const total = Math.max(this.oceanTotalSpawned, remaining);
      const defeated = Math.max(0, total - remaining);
      return {
        context: 'ocean',
        areaName: getOceanZoneInfo(this.heroPos.z, this.heroPos.y).label,
        defeated,
        remaining,
        total,
      };
    }

    if (this.worldMode === 'academy') {
      const remaining =
        this.academyMonsters.filter((m) => m.alive).length +
        this.shooters.filter((s) => s.alive).length;
      const total = Math.max(this.academyTotalSpawned, remaining);
      const defeated = Math.max(0, total - remaining);
      return {
        context: 'academy',
        areaName: 'Istana IELTS',
        defeated,
        remaining,
        total,
      };
    }

    const baseCaveTotal = 9 + DIFF_CONFIG[this.settings.difficulty].maxShooters;
    const zoneLiberated =
      this.liberatedZones.has(zoneId) || this.defeatedBossZones.has(zoneId);
    const savedCave = this.zoneCaveProgress[zoneId];
    const caveTotal = zoneLiberated
      ? savedCave?.total ?? baseCaveTotal
      : savedCave?.total ?? baseCaveTotal;
    const caveRemaining = zoneLiberated
      ? 0
      : savedCave?.remaining ?? baseCaveTotal;
    const caveDefeated = zoneLiberated
      ? caveTotal
      : Math.max(0, caveTotal - caveRemaining);

    const seaSkyCount = this.seaMonsters.length + this.skyMonsters.length;
    const remainingAll =
      this.monsters.filter((m) => m.alive).length +
      this.seaMonsters.filter((m) => m.alive).length +
      this.skyMonsters.filter((m) => m.alive).length;
    const expectedTotal = (this.getCurrentDayPhase() === 'malam' ? 50 : 30) + seaSkyCount;
    const totalAll = Math.max(
      (this.missionWaveCount || this.nightWaveTotal || (this.getCurrentDayPhase() === 'malam' ? 50 : 30)) +
        seaSkyCount,
      expectedTotal,
      remainingAll,
    );
    const defeatedAll = Math.max(0, totalAll - remainingAll);

    const zoneSurfaceRemaining =
      this.monsters.filter((m) => m.alive && m.zoneId === zoneId).length +
      this.seaMonsters.filter((m) => m.alive && m.zoneId === zoneId).length +
      this.skyMonsters.filter((m) => m.alive && m.zoneId === zoneId).length;
    const zoneFallbackTotal =
      this.monsters.filter((m) => m.zoneId === zoneId).length +
      this.seaMonsters.filter((m) => m.zoneId === zoneId).length +
      this.skyMonsters.filter((m) => m.zoneId === zoneId).length;
    const zoneSurfaceTotal = Math.max(
      this.nightZoneTotals[zoneId] || zoneFallbackTotal,
      zoneSurfaceRemaining,
    );
    const zoneSurfaceDefeated = Math.max(0, zoneSurfaceTotal - zoneSurfaceRemaining);
    const surfaceCombatRemaining =
      this.monsters.filter((m) => m.alive && m.combatOnly).length +
      this.seaMonsters.filter((m) => m.alive && m.combatOnly).length +
      this.skyMonsters.filter((m) => m.alive && m.combatOnly).length;
    const surfaceQuizRemaining =
      this.monsters.filter((m) => m.alive && !m.combatOnly).length +
      this.seaMonsters.filter((m) => m.alive && !m.combatOnly).length +
      this.skyMonsters.filter((m) => m.alive && !m.combatOnly).length;

    const phase = this.getCurrentDayPhase();
    if (phase === 'malam') {
      return {
        context: 'overworld_night',
        areaName: ZONE_INFO[zoneId].name,
        defeated: defeatedAll,
        remaining: remainingAll,
        total: totalAll,
        zoneNightDefeated: zoneSurfaceDefeated,
        zoneNightRemaining: zoneSurfaceRemaining,
        zoneNightTotal: zoneSurfaceTotal,
        zoneSurfaceDefeated,
        zoneSurfaceRemaining,
        zoneSurfaceTotal,
        surfaceCombatRemaining,
        surfaceQuizRemaining,
        caveDefeated,
        caveRemaining,
        caveTotal,
        caveLiberated: zoneLiberated,
      };
    }

    return {
      context: 'overworld_day',
      areaName: ZONE_INFO[zoneId].name,
      defeated: defeatedAll,
      remaining: remainingAll,
      total: totalAll,
      zoneSurfaceDefeated,
      zoneSurfaceRemaining,
      zoneSurfaceTotal,
      surfaceCombatRemaining,
      surfaceQuizRemaining,
      caveDefeated,
      caveRemaining,
      caveTotal,
      caveLiberated: zoneLiberated,
    };
  }

  public voiceShowFeedback(text: string): void {
    this.showBanner(text, 2.2);
  }

  public voiceMove(
    dir: 'forward' | 'backward' | 'left' | 'right' | 'stop',
    durationSec = 1.6,
    sprint = false,
  ): void {
    if (this.phase !== 'playing') return;
    if (dir === 'stop') {
      this.voiceMoveTimer = 0;
      this.voiceMoveVec = { x: 0, z: 0 };
      this.voiceSprint = false;
      this.voiceAutoFire = false;
      this.tapMoveTarget = null;
      this.heroVel.multiplyScalar(0.15);
      this.showBanner('🎙️ Berhenti di tempat.', 1.6);
      return;
    }

    this.tapMoveTarget = null;
    this.voiceSprint = sprint;
    this.voiceMoveTimer = durationSec < 0 ? -1 : Math.max(0.5, durationSec);
    if (dir === 'forward') this.voiceMoveVec = { x: 0, z: 1 };
    else if (dir === 'backward') this.voiceMoveVec = { x: 0, z: -1 };
    else if (dir === 'left') this.voiceMoveVec = { x: -1, z: 0 };
    else if (dir === 'right') this.voiceMoveVec = { x: 1, z: 0 };

    const dirLabel =
      dir === 'forward'
        ? sprint
          ? 'Lari ke depan'
          : 'Maju'
        : dir === 'backward'
        ? 'Mundur'
        : dir === 'left'
        ? 'Ke kiri'
        : 'Ke kanan';
    this.showBanner(
      durationSec < 0 ? `🎙️ ${dirLabel} terus... (bilang "Berhenti" untuk stop)` : `🎙️ ${dirLabel}`,
      1.8,
    );
  }

  public voiceLook(dir: 'back' | 'left' | 'right' | 'up' | 'down' | 'center'): void {
    if (this.phase !== 'playing') return;
    const minP = this.cameraMode === 'first_person' ? -1.25 : -1.18;
    if (dir === 'back') {
      this.cameraYaw += Math.PI;
      this.showBanner('🎙️ Melihat ke arah belakang!', 1.8);
    } else if (dir === 'left') {
      this.cameraYaw += Math.PI * 0.42;
      this.showBanner('🎙️ Menoleh ke kiri', 1.6);
    } else if (dir === 'right') {
      this.cameraYaw -= Math.PI * 0.42;
      this.showBanner('🎙️ Menoleh ke kanan', 1.6);
    } else if (dir === 'up') {
      this.cameraPitch = THREE.MathUtils.clamp(this.cameraPitch - 0.34, minP, 1.12);
      this.showBanner('🎙️ Melihat ke atas', 1.6);
    } else if (dir === 'down') {
      this.cameraPitch = THREE.MathUtils.clamp(this.cameraPitch + 0.34, minP, 1.12);
      this.showBanner('🎙️ Melihat ke bawah', 1.6);
    } else {
      this.cameraYaw = this.heroYaw + Math.PI;
      this.cameraPitch = 0.22;
      this.showBanner('🎙️ Kamera diluruskan ke depan', 1.6);
    }
    if (this.cameraMode === 'orbit') {
      this.cameraMode = 'third_back';
      this.applyCameraVisibilityAndControls();
    }
    this.pushHud(true);
  }

  public voiceSetCameraMode(mode: CameraMode | 'toggle'): void {
    if (this.phase !== 'playing') return;
    if (mode === 'toggle') {
      this.toggleCameraMode();
      return;
    }
    this.cameraMode = mode;
    this.applyCameraVisibilityAndControls();
    if (mode === 'orbit') {
      this.controls.target.set(this.heroPos.x, 2.0, this.heroPos.z);
      if (this.camera.position.distanceTo(this.controls.target) < 12) {
        this.camera.position.set(this.heroPos.x, 18, this.heroPos.z + 22);
      }
      this.controls.update();
    }
    const labels: Record<CameraMode, string> = {
      third_back: '🎙️ Kamera Belakang (TPS)',
      first_person: '🎙️ Kamera Orang Pertama (FPS)',
      third_front: '🎙️ Kamera Depan',
      orbit: '🎙️ Kamera Bebas 3D',
    };
    this.showBanner(labels[mode], 2.0);
    this.pushHud(true);
  }

  public voiceGoToTarget(
    target:
      | 'forward_point'
      | 'nearest_monster'
      | 'nearest_npc'
      | 'portal'
      | 'door'
      | 'key'
      | 'prison'
      | 'crafting'
      | 'exit'
      | 'starter_weapon',
  ): void {
    if (this.phase !== 'playing') return;
    this.voiceMoveTimer = 0;
    this.voiceMoveVec = { x: 0, z: 0 };
    this.voiceSprint = false;

    const moveTo = (x: number, z: number, label: string) => {
      if (this.worldMode === 'overworld') {
        const pt = { x, z };
        constrainToWalkableArchipelago(pt, 0.72);
        this.tapMoveTarget = new THREE.Vector3(pt.x, getArchipelagoGroundY(pt.x, pt.z), pt.z);
      } else {
        const cx = THREE.MathUtils.clamp(x, -17.5, 17.5);
        const cz = THREE.MathUtils.clamp(z, -17.5, 17.5);
        this.tapMoveTarget = new THREE.Vector3(cx, 0, cz);
      }
      this.showBanner(`🎙️ ${label}`, 2.1);
    };

    const findNearestMonster = () => {
      let best: { x: number; z: number; name: string; d: number } | null = null;
      for (const m of this.getActiveMonsters()) {
        if (!m.alive) continue;
        const d = Math.hypot(m.x - this.heroPos.x, m.z - this.heroPos.z);
        if (!best || d < best.d) best = { x: m.x, z: m.z, name: m.name, d };
      }
      if (this.worldMode === 'overworld') {
        for (const s of this.shooters) {
          if (!s.alive) continue;
          const d = Math.hypot(s.x - this.heroPos.x, s.z - this.heroPos.z);
          if (!best || d < best.d) best = { x: s.x, z: s.z, name: 'Penembak', d };
        }
      }
      return best;
    };

    if (target === 'nearest_monster') {
      const m = findNearestMonster();
      if (m) moveTo(m.x, m.z, `Menuju ${m.name}...`);
      else this.showBanner('🎙️ Tidak ada monster aktif di area ini.', 2.0);
      return;
    }

    if (target === 'nearest_npc') {
      let best: { x: number; z: number; name: string; d: number } | null = null;
      if (this.worldMode === 'overworld') {
        for (const [id, npc] of this.npcs.entries()) {
          if (!this.isNpcOnDuty(npc.shift)) continue;
          const d = Math.hypot(npc.x - this.heroPos.x, npc.z - this.heroPos.z);
          const def = getZoneNpcById(id);
          if (!best || d < best.d) best = { x: npc.x, z: npc.z, name: def?.name || 'Penjaga', d };
        }
      } else if (this.worldMode === 'academy') {
        for (const [id, npc] of this.academyNpcs.entries()) {
          const d = Math.hypot(npc.x - this.heroPos.x, npc.z - this.heroPos.z);
          const def = ACADEMY_NPCS.find((n) => n.id === id);
          if (!best || d < best.d) best = { x: npc.x, z: npc.z, name: def?.name || 'Penguji', d };
        }
      } else if (this.dungeonRig) {
        best = {
          x: this.dungeonRig.guardianPos.x,
          z: this.dungeonRig.guardianPos.z,
          name: this.dungeonState?.guardianName || 'Penjaga Gua',
          d: 0,
        };
      }
      if (best) moveTo(best.x, best.z, `Mendekati ${best.name}...`);
      else this.showBanner('🎙️ Tidak ada NPC di sekitar sini.', 1.8);
      return;
    }

    if (target === 'portal') {
      if (this.worldMode === 'overworld') {
        moveTo(
          this.portalRig.root.position.x,
          this.portalRig.root.position.z + 2.5,
          'Menuju Portal Istana IELTS...',
        );
      } else {
        moveTo(this.dungeonExitPos.x, this.dungeonExitPos.z, 'Menuju Pintu Keluar...');
      }
      return;
    }

    if (target === 'starter_weapon') {
      if (this.worldMode === 'overworld' && !this.starterWeaponPicked) {
        moveTo(
          OVERWORLD_ANCHORS.starterWeapon.x,
          OVERWORLD_ANCHORS.starterWeapon.z,
          'Menuju Senjata Pertama...',
        );
      } else {
        this.showBanner('🎙️ Senjata pertama sudah kamu ambil.', 1.8);
      }
      return;
    }

    if (target === 'door' && this.worldMode === 'dungeon' && this.dungeonRig && this.dungeonState) {
      let bestDoor: { x: number; z: number; idx: number; d: number } | null = null;
      this.dungeonRig.doors.forEach((dr, idx) => {
        if (this.dungeonState!.doorsCleared.includes(idx)) return;
        const d = Math.hypot(dr.def.x - this.heroPos.x, dr.def.z - this.heroPos.z);
        if (!bestDoor || d < bestDoor.d) bestDoor = { x: dr.def.x, z: dr.def.z, idx, d };
      });
      if (bestDoor) {
        const chosen = bestDoor as { x: number; z: number; idx: number; d: number };
        moveTo(chosen.x, chosen.z, `Menuju Pintu ${chosen.idx + 1}...`);
      } else {
        this.showBanner('🎙️ Semua pintu tantangan di gua ini sudah terbuka!', 2.0);
      }
      return;
    }

    if (target === 'key') {
      if (this.worldMode === 'dungeon' && this.dungeonState && !this.dungeonState.prisonKeyCollected) {
        moveTo(0, -9, 'Menuju Kunci Penjara...');
      } else {
        this.showBanner('🎙️ Kunci penjara tidak ada atau sudah diambil.', 1.8);
      }
      return;
    }

    if (target === 'prison') {
      if (this.worldMode === 'dungeon' && this.dungeonRig) {
        moveTo(
          this.dungeonRig.prisonPos.x,
          this.dungeonRig.prisonPos.z,
          `Menuju Penjara (${this.dungeonState?.captiveName || 'Tawanan'})...`,
        );
      } else {
        this.showBanner('🎙️ Masuk ke dalam gua terlebih dahulu.', 1.8);
      }
      return;
    }

    if (target === 'crafting') {
      if (this.worldMode === 'dungeon' && this.dungeonRig) {
        moveTo(
          this.dungeonRig.craftingTablePos.x,
          this.dungeonRig.craftingTablePos.z,
          'Menuju Meja Crafting...',
        );
      } else {
        this.showBanner('🎙️ Meja crafting tersedia di dalam gua.', 1.8);
      }
      return;
    }

    if (target === 'exit') {
      if (this.worldMode !== 'overworld') {
        moveTo(this.dungeonExitPos.x, this.dungeonExitPos.z, 'Menuju Pintu Keluar...');
      } else {
        this.showBanner('🎙️ Kamu sedang berada di dunia utama.', 1.8);
      }
      return;
    }

    // forward_point ("coba ke tempat itu"): cari objek di kerucut pandang depan kamera, jika tidak ada jalan 9m ke depan arah kamera
    const fx = -Math.sin(this.cameraYaw);
    const fz = -Math.cos(this.cameraYaw);
    let bestInView: { x: number; z: number; label: string; score: number } | null = null;
    const consider = (x: number, z: number, label: string) => {
      const dx = x - this.heroPos.x;
      const dz = z - this.heroPos.z;
      const d = Math.hypot(dx, dz);
      if (d < 1.5 || d > 28) return;
      const dot = (dx / d) * fx + (dz / d) * fz;
      if (dot > 0.72) {
        const sc = dot * 20 - d * 0.35;
        if (!bestInView || sc > bestInView.score) {
          bestInView = { x, z, label, score: sc };
        }
      }
    };

    if (this.worldMode === 'overworld') {
      if (!this.starterWeaponPicked) {
        consider(
          OVERWORLD_ANCHORS.starterWeapon.x,
          OVERWORLD_ANCHORS.starterWeapon.z,
          'Senjata Pertama',
        );
      }
      if (!this.swimSuitPicked) {
        consider(
          OVERWORLD_ANCHORS.swimSuit.x,
          OVERWORLD_ANCHORS.swimSuit.z,
          'Pakaian Renang',
        );
      }
      consider(this.portalRig.root.position.x, this.portalRig.root.position.z + 2.5, 'Portal Istana IELTS');
      for (const [id, npc] of this.npcs.entries()) {
        const def = getZoneNpcById(id);
        consider(npc.x, npc.z, def?.name || 'NPC');
      }
    } else if (this.worldMode === 'dungeon' && this.dungeonRig) {
      consider(this.dungeonExitPos.x, this.dungeonExitPos.z, 'Pintu Keluar Gua');
      consider(this.dungeonRig.craftingTablePos.x, this.dungeonRig.craftingTablePos.z, 'Meja Crafting');
      consider(this.dungeonRig.prisonPos.x, this.dungeonRig.prisonPos.z, 'Penjara Tersembunyi');
      this.dungeonRig.doors.forEach((dr, idx) => {
        if (!this.dungeonState?.doorsCleared.includes(idx)) {
          consider(dr.def.x, dr.def.z, `Pintu ${idx + 1}`);
        }
      });
    } else if (this.worldMode === 'academy') {
      consider(this.dungeonExitPos.x, this.dungeonExitPos.z, 'Pintu Keluar Istana');
      for (const [id, npc] of this.academyNpcs.entries()) {
        const def = ACADEMY_NPCS.find((n) => n.id === id);
        consider(npc.x, npc.z, def?.name || 'Penguji IELTS');
      }
    }
    for (const m of this.getActiveMonsters()) {
      if (m.alive) consider(m.x, m.z, m.name);
    }

    if (bestInView) {
      const chosen = bestInView as { x: number; z: number; label: string };
      moveTo(chosen.x, chosen.z, `Menuju ke ${chosen.label}...`);
    } else {
      moveTo(this.heroPos.x + fx * 9, this.heroPos.z + fz * 9, 'Menuju tempat di depanmu...');
    }
  }

  public voiceShootMonster(mode: 'single' | 'auto_start' | 'auto_stop' | 'aim_enemy'): void {
    if (this.phase !== 'playing') return;
    if (mode === 'auto_stop') {
      this.voiceAutoFire = false;
      this.leftFireHeld = false;
      this.hudFireHeld = false;
      this.showBanner('🎙️ Berhenti menembak.', 1.6);
      return;
    }

    // Pastikan jika sedang memegang alat gua, pindah ke senjata aktif untuk menembak monster
    if (mode !== 'aim_enemy' && this.activeHotbarSlot > 7 && this.ownedWeapons.size > 0) {
      const slotIdx = WEAPON_ORDER.indexOf(this.activeWeapon);
      if (slotIdx >= 0) this.selectHotbarSlot(slotIdx);
    }

    // Cari monster / penembak terdekat (termasuk monster terbang di angkasa)
    let bestTarget: { id: string; x: number; y: number; z: number; name: string; dist: number } | null = null;
    for (const m of this.getActiveMonsters()) {
      if (!m.alive) continue;
      const d = Math.hypot(m.x - this.heroPos.x, m.z - this.heroPos.z);
      const reach = m.isSkyMonster ? TUNE.autoAimRange + 12 : TUNE.autoAimRange + 6;
      if (d <= reach && (!bestTarget || d < bestTarget.dist)) {
        const spec = MONSTER_SPECS[m.type];
        const mBaseY =
          m.y ??
          (this.worldMode === 'overworld'
            ? getArchipelagoGroundY(m.x, m.z) + spec.hoverY
            : spec.hoverY);
        bestTarget = {
          id: m.id,
          x: m.x,
          y: mBaseY + (m.isBoss ? 2.1 : spec.hitCenterY),
          z: m.z,
          name: m.name,
          dist: d,
        };
      }
    }
    if (this.worldMode === 'overworld') {
      for (const s of this.shooters) {
        if (!s.alive) continue;
        const d = Math.hypot(s.x - this.heroPos.x, s.z - this.heroPos.z);
        if (d <= TUNE.autoAimRange + 6 && (!bestTarget || d < bestTarget.dist)) {
          bestTarget = {
            id: s.id,
            x: s.x,
            y: getArchipelagoGroundY(s.x, s.z) + 1.45,
            z: s.z,
            name: 'Penembak',
            dist: d,
          };
        }
      }
    }

    if (bestTarget) {
      const aimYaw = Math.atan2(bestTarget.x - this.heroPos.x, bestTarget.z - this.heroPos.z);
      this.heroYaw = aimYaw;
      this.hero.body.rotation.y = aimYaw;
      this.shootAimYaw = aimYaw;
      this.shootAimTargetId = bestTarget.id;
      this.shootTargetPos = { x: bestTarget.x, y: bestTarget.y, z: bestTarget.z };
      this.autoCamPitchActive = true;
      // Arahkan kamera agar langsung menghadap target yang dibidik
      this.cameraYaw = aimYaw + Math.PI;
      const horiz = Math.max(0.5, bestTarget.dist);
      const dy = bestTarget.y - (this.heroPos.y + 2.05);
      this.shootAimPitch = Math.atan2(dy, horiz);
      const targetPitch = THREE.MathUtils.clamp(
        -Math.atan2(dy, horiz),
        this.cameraMode === 'first_person' ? -1.25 : -1.18,
        0.75,
      );
      this.cameraPitch = targetPitch;
    }

    if (mode === 'aim_enemy') {
      if (bestTarget) {
        if (this.settings.aimMode === 'manual' && this.ownedWeapons.has(this.activeWeapon)) {
          this.aimToggled = true;
          this.isAiming = true;
        }
        this.showBanner(`🎙️ Membidik ${bestTarget.name}!`, 1.8);
      } else {
        this.showBanner('🎙️ Tidak ada monster di jarak tembak.', 1.8);
      }
      this.pushHud(true);
      return;
    }

    if (mode === 'auto_start') {
      this.voiceAutoFire = true;
      this.showBanner(
        bestTarget
          ? `🎙️ Menembak ${bestTarget.name} terus! (bilang "Berhenti" untuk stop)`
          : '🎙️ Menembak terus!',
        2.0,
      );
    } else if (bestTarget) {
      this.showBanner(`🎙️ Menembak ${bestTarget.name}!`, 1.6);
    }

    this.fireActiveWeapon(false, true);
  }

  public voiceEquipWeapon(target: WeaponId | 'next' | 'prev'): void {
    if (this.phase !== 'playing') return;
    const ownedList = WEAPON_ORDER.filter((id) => this.ownedWeapons.has(id));
    if (ownedList.length === 0) {
      this.showBanner('🎙️ Belum punya senjata! Ambil Ketapel di kiri Alun-Alun.', 2.2);
      return;
    }

    let nextId: WeaponId;
    if (target === 'next' || target === 'prev') {
      const idx = Math.max(0, ownedList.indexOf(this.activeWeapon));
      const step = target === 'next' ? 1 : -1;
      nextId = ownedList[(idx + step + ownedList.length) % ownedList.length];
    } else {
      if (!this.ownedWeapons.has(target)) {
        this.showBanner(
          `🎙️ ${WEAPONS[target].name} belum terbuka (${WEAPONS[target].originLabel})`,
          2.2,
        );
        return;
      }
      nextId = target;
    }

    this.equipWeapon(nextId);
    this.showBanner(`🎙️ Senjata: ${WEAPONS[nextId].name}`, 1.8);
  }

  public voiceSetAimMode(mode: 'auto' | 'manual'): void {
    if (this.phase !== 'playing') return;
    this.updateSettings({ aimMode: mode });
    this.showBanner(
      mode === 'auto' ? '🎙️ Mode Bidik Otomatis aktif' : '🎙️ Mode Bidik Bebas (Manual) aktif',
      2.0,
    );
  }

  public dispose(): void {
    this.setMultiplayerActive(false);
    this.onPageHideSave();
    this.disposed = true;
    soundEngine.setWalking(false);
    soundEngine.setSwimmingAudio(false);
    soundEngine.setCarEngine(false, 0);
    soundEngine.setPlaneEngine(false, 0);
    soundEngine.setAmbientMode('none');
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);
    window.removeEventListener('pagehide', this.onPageHideSave);
    window.removeEventListener('beforeunload', this.onPageHideSave);
    document.removeEventListener('visibilitychange', this.onVisibilitySave);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onPointerDown);
    dom.removeEventListener('pointermove', this.onPointerMove);
    dom.removeEventListener('pointerup', this.onPointerUp);
    dom.removeEventListener('pointercancel', this.onPointerCancel);
    dom.removeEventListener('wheel', this.onWheel);
    dom.removeEventListener('contextmenu', this.onContextMenu);

    this.controls.dispose();
    this.archipelagoRig?.disposables.forEach((d) => d.dispose());
    this.archipelagoUnderwaterRig?.disposables.forEach((d) => d.dispose());
    this.villageRig?.disposables.forEach((d) => d.dispose());
    this.worldObstaclesRig?.disposables.forEach((d) => d.dispose());
    this.oceanRig?.disposables.forEach((d) => d.dispose());
    this.carRig?.disposables.forEach((d) => d.dispose());
    this.worldPlanes.forEach((p) => p.rig.disposables.forEach((d) => d.dispose()));
    if (this.bombReticleMesh) {
      this.bombReticleMesh.geometry.dispose();
      (this.bombReticleMesh.material as THREE.Material).dispose();
    }
    this.palette.dispose();
    this.mapRtMinimap.dispose();
    this.mapRtFull.dispose();
    this.diamondInstanced.geometry.dispose();
    (this.diamondInstanced.material as THREE.Material).dispose();
    this.heartInstanced.geometry.dispose();
    (this.heartInstanced.material as THREE.Material).dispose();
    this.particleMesh.geometry.dispose();
    (this.particleMesh.material as THREE.Material).dispose();
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && !obj.geometry.userData?.shared) {
        obj.geometry.dispose();
      }
    });
    this.renderer.dispose();
    if (dom.parentElement === this.container) {
      this.container.removeChild(dom);
    }
  }
}
