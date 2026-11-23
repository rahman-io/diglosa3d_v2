import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { soundEngine } from '../audio/soundEngine';
import {
  ACADEMY_INHABITANTS,
  ACADEMY_NPCS,
  ACADEMY_SHADOWS,
  AMMO_COST,
  BOSSES,
  DAILY_GOAL,
  DIFF_CONFIG,
  DOOR_MINI_MONSTER,
  DOOR_RESTORED_STORY,
  getLevelInfo,
  getRankTitle,
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
  AimMode,
  AreaMonsterStats,
  BattleContext,
  CameraMode,
  CaveSealContext,
  DayPhaseId,
  DifficultyMode,
  DungeonZoneState,
  GamePhase,
  GameSettings,
  LearningSessionContext,
  LiveMapBounds,
  LiveMapSnapshot,
  MonsterType,
  PickaxeTier,
  ProjectedLabel,
  RadarBlip,
  RadarBlipKind,
  RadarState,
  RelicId,
  RpgHudSnapshot,
  RpgQuestState,
  StoryDialogState,
  WeaponId,
  WordProgress,
  WorldLocationMode,
  WorldTimeState,
  ZoneId,
} from '../types/game';
import { createMaterialPalette, MaterialPalette } from './materials';
import {
  createMinecraftVillageWorld,
  createNpcGuardPost,
  GuardPostRig,
  MinecraftVillageRig,
  updateMinecraftVillage,
  VillageObstacle,
} from './minecraftVillage';
import {
  ArchipelagoRig,
  constrainHeroToWorldBounds,
  constrainToWalkableArchipelago,
  createArchipelagoWorld,
  freezeStaticSubtree,
  getArchipelagoGroundY,
  IELTS_TEMPORARILY_LOCKED,
  isWalkableArchipelago,
  OVERWORLD_ANCHORS,
  sampleArchipelagoTerrain,
  updateArchipelagoWorld,
  WORLD_OCEAN_LIMIT,
} from './archipelagoWorld';
import {
  AcademyHallRig,
  animateCaptiveMesh,
  animateMonsterRig,
  animateShooterRig,
  animateZoneNpc,
  applyHeroWeaponPose,
  CaveBlockDef,
  computeBlinkScale,
  createAcademyHallEnvironment,
  createAreaMists,
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
  createWorldObstacles,
  getObstacleSupportHeight,
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
  weaponId?: WeaponId;
  x: number;
  y?: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  damage: number;
  shieldDamage: number;
  pierceLeft: number;
  hitIds: Set<string>;
  life: number;
  mesh: THREE.Mesh;
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
  nightZoneTotals?: Partial<Record<ZoneId, number>>;
  nightMonsterSeq?: number;
  savedNightMonsters?: SavedOverworldNightMonster[];
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
}

const MAX_COLLECTIBLES = 56;
const MAX_PARTICLES = 110;
const MAX_PROJECTILES = 36;
const TICKS_PER_DAY = 24000;
const TICKS_PER_SEC = 20;

const OVERWORLD_GUARD_POSTS = OVERWORLD_ANCHORS.guardPosts;

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
  private areaMists: Map<ZoneId, THREE.Mesh>;
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
  private elapsed = 0;
  private disposed = false;
  private lastHudHeroX = 9999;
  private lastHudHeroZ = 9999;
  private lastHudCamYaw = 9999;
  private mapHiddenOverworld: THREE.Object3D[] = [];
  private mapHiddenDungeon: THREE.Object3D[] = [];
  private mapHiddenAcademy: THREE.Object3D[] = [];

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

  // World containers & entities
  private worldMode: WorldLocationMode = 'overworld';
  private overworldGroup: THREE.Group;
  private archipelagoRig!: ArchipelagoRig;
  private villageRig!: MinecraftVillageRig;
  private worldObstaclesRig!: WorldObstaclesRig;
  private heroOnIce = false;
  private extraVillageColliders: VillageObstacle[] = [];
  private dungeonRig: DungeonArenaRig | null = null;
  private academyRig: AcademyHallRig | null = null;
  private dungeonAnimatables: THREE.Object3D[] = [];
  private dungeonExitPos = new THREE.Vector3(0, 0, 17);
  private dungeonState: DungeonZoneState | null = null;
  private savedOverworldHeroPos = new THREE.Vector3(
    OVERWORLD_ANCHORS.desaSpawn.x,
    OVERWORLD_ANCHORS.desaSpawn.y,
    OVERWORLD_ANCHORS.desaSpawn.z,
  );

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
      x: number;
      z: number;
      standX: number;
      standY: number;
      standZ: number;
      standRotY: number;
      yaw: number;
      guardPost: GuardPostRig;
      poseMode: 'stand' | 'walk' | 'sleep';
      nightAwake: boolean;
      lastWakeBannerMs: number;
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
  private dungeonMonsters: RoamingMonster[] = [];
  private dungeonTotalSpawned = 0;
  private academyMonsters: RoamingMonster[] = [];
  private academyTotalSpawned = 0;
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
  private swimFxTimer = 0;
  private swimLeapTimer = 0;
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
  private owlState: 'hidden' | 'fly' | 'land' | 'leave' = 'hidden';
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

    this.starterPickupMesh = createStarterWeaponPickup(this.palette);
    const sw = OVERWORLD_ANCHORS.starterWeapon;
    this.starterPickupMesh.position.set(sw.x, getArchipelagoGroundY(sw.x, sw.z), sw.z);
    this.starterPickupMesh.userData.starterPickup = true;
    this.overworldGroup.add(this.starterPickupMesh);
    this.overworldClickables.push(this.starterPickupMesh);

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

    this.hero = createHeroAvatar(this.palette);
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
    dyn.add(this.cloudsMesh);
    dyn.add(this.diamondInstanced);
    dyn.add(this.heartInstanced);
    this.areaMists.forEach((m) => dyn.add(m));
    this.npcs.forEach((n) => {
      dyn.add(n.mesh);
      dyn.add(n.alertMesh);
      dyn.add(n.guardPost.torchFlame);
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
    const minFloor = this.isSoftwareGl ? 1 : this.isMobileDevice ? 1.0 : 1.1;
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
        nightZoneTotals: { ...this.nightZoneTotals },
        nightMonsterSeq: this.nightMonsterSeq,
        savedNightMonsters,
        savedNightShooters: this.nightShooterSaved.map((s) => ({ ...s })),
        savedCollectibles: this.collectibles.map((c) => ({
          active: c.active,
          respawnTimer: c.respawnTimer,
        })),
        defeatedAcademyEnemyIds: Array.from(this.defeatedAcademyEnemyIds),
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
        if (this.restoredWorldMode === 'overworld' && !isWalkableArchipelago(lx, lz)) {
          const sp = OVERWORLD_ANCHORS.desaSpawn;
          this.restoredHeroPos = { x: sp.x, y: getArchipelagoGroundY(sp.x, sp.z), z: sp.z, yaw: sp.yaw };
        } else {
          this.restoredHeroPos = {
            ...data.lastHeroPos,
            y: this.restoredWorldMode === 'overworld' ? getArchipelagoGroundY(lx, lz) : data.lastHeroPos.y,
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
      this.nightZoneTotals = data.nightZoneTotals ? { ...data.nightZoneTotals } : {};
      this.nightMonsterSeq = data.nightMonsterSeq || 0;
      this.restoredNightMonsters = Array.isArray(data.savedNightMonsters)
        ? data.savedNightMonsters.map((m) => ({ ...m }))
        : [];
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
    this.villageRig.obstacles.push(
      // Desa Sapaan 12m x 10m Village Houses (left stepped terraces)
      { x: -13.5, z: 84.0, halfW: 6.0, halfD: 5.0 },
      { x: -20.0, z: 118.0, halfW: 5.5, halfD: 6.2 },
      // Portal Arch stone piers in Gua Portal (center doorway stays passable)
      { x: px - 3.9, z: pz, halfW: 1.15, halfD: 1.25 },
      { x: px + 3.9, z: pz, halfW: 1.15, halfD: 1.25 },
    );
    this.villageRig.torchesFlame.push(...this.archipelagoRig.torchesFlame);
    this.overworldGroup.add(this.villageRig.group);
    this.overworldClickables.push(...this.villageRig.clickables);

    this.worldObstaclesRig = createWorldObstacles(this.palette);
    this.overworldGroup.add(this.worldObstaclesRig.group);
  }

  private initNpcs(): void {
    const alertGeo = new THREE.OctahedronGeometry(0.42, 0);
    const alertMat = this.palette.getMat(0xfacc15, 'emissive');

    for (const def of NPC_CATALOG) {
      const ny = getArchipelagoGroundY(def.x, def.z);
      const postDef = OVERWORLD_GUARD_POSTS[def.id] ?? {
        x: def.x - 2.6,
        z: def.z + 1.8,
        rotY: def.rotationY,
        bedTint: 0xdc2626,
      };
      const guardPost = createNpcGuardPost(this.palette, postDef);
      this.overworldGroup.add(guardPost.group);
      this.villageRig.obstacles.push(...guardPost.obstacles);
      this.villageRig.torchesFlame.push(guardPost.torchFlame);

      const mesh = createZoneNpc(def.id, this.palette);
      mesh.position.set(def.x, ny, def.z);
      mesh.rotation.y = def.rotationY;
      mesh.userData.npcId = def.id;
      this.overworldGroup.add(mesh);
      this.overworldClickables.push(mesh);

      const alertMesh = new THREE.Mesh(alertGeo, alertMat);
      alertMesh.position.set(def.x, ny + 4.4, def.z);
      this.overworldGroup.add(alertMesh);

      this.npcs.set(def.id, {
        mesh,
        alertMesh,
        x: def.x,
        z: def.z,
        standX: def.x,
        standY: ny,
        standZ: def.z,
        standRotY: def.rotationY,
        yaw: def.rotationY,
        guardPost,
        poseMode: 'stand',
        nightAwake: false,
        lastWakeBannerMs: 0,
      });
    }
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
    let activeNightShooters = 0;
    for (let i = 0; i < this.shooters.length; i++) {
      const s = this.shooters[i];
      if (s.alive && s.isNightShooter) activeNightShooters++;
    }
    const activeNightCount = activeNightMobs + activeNightShooters;
    const expectedTotal = phase === 'malam' ? 50 : 30;
    const waveTotal = Math.max(this.nightWaveTotal || expectedTotal, activeSurfaceCount);
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
    // Nudge out of village buildings/trees/obstacles
    for (let pass = 0; pass < 2; pass++) {
      for (const obs of this.villageRig.obstacles) {
        const cx = THREE.MathUtils.clamp(sx, obs.x - obs.halfW, obs.x + obs.halfW);
        const cz = THREE.MathUtils.clamp(sz, obs.z - obs.halfD, obs.z + obs.halfD);
        const dx = sx - cx;
        const dz = sz - cz;
        const distSq = dx * dx + dz * dz;
        if (distSq < 1.8 * 1.8) {
          if (distSq > 0.001) {
            const d = Math.sqrt(distSq);
            sx += (dx / d) * (1.85 - d);
            sz += (dz / d) * (1.85 - d);
          } else {
            sx += obs.halfW + 1.8;
          }
        }
      }
    }
    const clampPt = { x: sx, z: sz };
    constrainToWalkableArchipelago(clampPt, 1.3);
    return clampPt;
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
    this.syncShootersForDifficulty(mode === 'night');
    const zoneTotals: Partial<Record<ZoneId, number>> = {};
    for (const m of this.monsters) {
      if (m.alive) {
        zoneTotals[m.zoneId] = (zoneTotals[m.zoneId] || 0) + 1;
      }
    }
    this.nightZoneTotals = zoneTotals;
    this.nightWaveTotal = this.monsters.filter((m) => m.alive).length;
    this.rebuildOverworldMonsterPool();
    if (this.worldMode === 'overworld') {
      if (mode === 'night') {
        soundEngine.playBoss();
        this.showBanner(
          `🌙 Malam Hari ke-${this.dayCount}! ${this.nightWaveTotal} monster (35 Duel · 15 Inggris) muncul di seluruh pulau!`,
          5.0,
        );
      } else {
        this.showBanner(
          `☀️ Hari ke-${this.dayCount}! ${this.nightWaveTotal} monster wilayah (21 Duel · 9 Inggris) berkeliaran di 6 pulau!`,
          4.5,
        );
      }
    }
    this.pushHud(true);
  }

  private triggerMorningSunlightDestruction(): void {
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
      this.activeHotbarSlot <= 7 &&
      this.ownedWeapons.has(this.activeWeapon) &&
      (!this.isSwimming || SEA_CAPABLE_WEAPONS.has(this.activeWeapon));
    setHeroWeaponVisual(this.hero, this.activeWeapon, canHoldWeapon);

    if (this.isSwimming) {
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
    this.fpViewRig.root.visible = inFirstPerson;
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

  public continueGame(): void {
    if (!this.loadProgress()) {
      this.startNewGame();
      return;
    }
    this.clearSubScenes();
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
    if (canRestoreNight || canRestoreDay) {
      this.restoreNightMonstersFromSave();
    } else {
      this.clearOverworldNightMonsters();
    }

    this.updateOverworldDayNightAtmosphere(0, false);

    if (this.restoredWorldMode === 'dungeon' && this.restoredDungeonZoneId) {
      this.enterZoneDungeon(this.restoredDungeonZoneId, this.restoredDungeonMixed, true);
      this.showBanner('Selamat datang kembali, Hoot! Lanjutkan petualanganmu di gua!', 3.6);
      soundEngine.playWin();
      this.pushHud(true);
      return;
    }

    if (this.restoredWorldMode === 'academy' && !IELTS_TEMPORARILY_LOCKED) {
      this.enterAcademy(true);
      this.showBanner('Selamat datang kembali, Hoot! Lanjutkan di Istana IELTS!', 3.6);
      soundEngine.playWin();
      this.pushHud(true);
      return;
    }

    this.syncShootersForDifficulty();
    this.syncOverworldMonstersByDiff();
    this.initSeaMonsters();
    this.initSkyMonsters();

    const sp = OVERWORLD_ANCHORS.desaSpawn;
    if (
      this.restoredHeroPos &&
      this.restoredWorldMode === 'overworld' &&
      isWalkableArchipelago(this.restoredHeroPos.x, this.restoredHeroPos.z)
    ) {
      const hy = getArchipelagoGroundY(this.restoredHeroPos.x, this.restoredHeroPos.z);
      this.heroPos.set(this.restoredHeroPos.x, hy, this.restoredHeroPos.z);
      this.heroYaw = this.restoredHeroPos.yaw;
    } else if (isWalkableArchipelago(this.savedOverworldHeroPos.x, this.savedOverworldHeroPos.z)) {
      const hy = getArchipelagoGroundY(this.savedOverworldHeroPos.x, this.savedOverworldHeroPos.z);
      this.heroPos.set(this.savedOverworldHeroPos.x, hy, this.savedOverworldHeroPos.z);
      this.heroYaw = sp.yaw;
    } else {
      this.heroPos.set(sp.x, getArchipelagoGroundY(sp.x, sp.z), sp.z);
      this.heroYaw = sp.yaw;
    }
    this.savedOverworldHeroPos.copy(this.heroPos);
    this.hero.root.position.copy(this.heroPos);
    this.hero.body.rotation.y = this.heroYaw;
    this.heroVel.set(0, 0, 0);
    this.heroVelY = 0;
    this.heroOnGround = true;
    this.isSwimming = false;
    this.refreshWeaponVisual();
    this.tapMoveTarget = null;
    this.encounterGraceTimer = 2.0;

    if (this.cameraMode === 'orbit') this.cameraMode = 'third_back';
    this.applyCameraVisibilityAndControls();
    this.snapCameraBehindHero();

    this.showBanner(
      this.restoredWorldMode === 'academy' && IELTS_TEMPORARILY_LOCKED
        ? '🔒 Istana IELTS ditutup sementara — selamat datang kembali di Desa Sapaan!'
        : 'Selamat datang kembali, Hoot! Lanjutkan petualanganmu!',
      3.8,
    );
    soundEngine.playWin();
    this.pushHud(true);
  }

  public startNewGame(aimMode?: AimMode, difficulty?: DifficultyMode): void {
    this.clearSubScenes();
    this.clearOverworldNightMonsters();
    this.worldMode = 'overworld';
    this.overworldGroup.visible = true;
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
    this.ownedRelics.clear();
    this.ribbons.clear();
    this.liberatedZones.clear();
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
    this.restoredWorldMode = 'overworld';
    this.restoredDungeonZoneId = null;
    this.restoredDungeonMixed = false;
    this.restoredHeroPos = null;
    this.restoredNightMonsters = [];
    this.restoredNightShooters = [];
    this.restoredCollectibles = null;
    this.worldTimeTick = this.pickRandomWorldTimeTick();
    this.dayCount = 1;
    this.lastOverworldDayPhase = this.getDayPhaseForTick(this.worldTimeTick);
    this.nightWaveDaySpawned = 0;
    this.dayWaveDaySpawned = 0;
    this.surfaceWaveMode = this.lastOverworldDayPhase === 'malam' ? 'night' : 'day';
    this.pendingDayWaveTimer = -1;
    this.nightWaveTotal = 0;
    this.nightZoneTotals = {};
    this.nightShooterSaved = [];
    this.nightMonsterSeq = 0;
    this.autoSaveTimer = 0;

    this.initDefaultQuests();
    this.spawnCollectibles();
    this.refreshAreaMists();
    this.refreshWeaponVisual();
    this.syncShootersForDifficulty(true);
    this.syncOverworldMonstersByDiff();
    this.initSeaMonsters();
    this.initSkyMonsters();
    this.shootAimPitch = 0;
    this.shootAimTargetId = null;
    this.updateOverworldDayNightAtmosphere(0, false);

    const sp = OVERWORLD_ANCHORS.desaSpawn;
    this.heroPos.set(sp.x, getArchipelagoGroundY(sp.x, sp.z), sp.z);
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

    // Begin Bab 4 Opening Story Sequence!
    this.startOpeningStory();
    this.saveProgress();
  }

  private startOpeningStory(): void {
    this.phase = 'story';
    this.applyCameraVisibilityAndControls();
    this.storyTimer = 0;
    this.owlState = 'fly';
    this.owlRig.root.visible = true;
    this.owlRig.envelope.visible = true;
    this.owlRig.root.position.set(-28, 18, 120);
    this.storyDialog = {
      kind: 'opening',
      step: 0,
      speakerName: 'Prolog · Serangan Malam Hari',
      speakerRole: 'Istana Kerajaan Kata · Kepulauan Nusantara Kata',
      textEn: 'Armed shadow monsters raided the Palace in the dead of night, shattered the Royal Crown into 6 shards, and stole English words across the kingdom.',
      textId: 'Pada suatu malam gelap, monster bayangan bersenjata menyerbu Istana Kerajaan Kata, memecah Mahkota Kerajaan menjadi enam keping, dan mencuri kata Bahasa Inggris. Seekor burung hantu pos melintas menjatuhkan surat bersampul merah di Desa Sapaan...',
      accentColor: '#f59e0b',
    };
    soundEngine.playDoor();
    this.pushHud(true);
  }

  public advanceStory(): void {
    if (!this.storyDialog) return;

    if (this.storyDialog.kind === 'opening') {
      const nextStep = this.storyDialog.step + 1;
      if (nextStep === 1) {
        // Surat bersampul merah dari Lila (adik kandung Hoot)
        this.owlRig.envelope.visible = false;
        this.storyDialog = {
          kind: 'opening',
          step: 1,
          speakerName: 'Lila (Surat Bersampul Merah)',
          speakerRole: 'Adik Kandung Hoot · Di Balik Pintu Ungu',
          textEn: 'Dear brother Hoot, monsters attacked the palace and shattered the crown! I hid behind the Purple Gate with Raja Aksara—I am scared and waiting for you.',
          textId: 'Kak Hoot, monster menyerang istana malam itu dan memecah mahkota! Aku dan Raja Aksara berlindung di balik Pintu Ungu di pulau paling utara. Aku takut, Kak—aku menunggumu.',
          accentColor: '#e11d48',
        };
        soundEngine.speakEnglish('Dear brother Hoot, please save our kingdom and meet me at the palace!');
      } else if (nextStep === 2) {
        // Hoot inspects Portal Ungu on north Gua Portal island & Raja Aksara speaks
        const pp = OVERWORLD_ANCHORS.portal;
        const pGroundY = getArchipelagoGroundY(pp.x, pp.z);
        this.heroPos.set(pp.x - 1.5, pGroundY, pp.z + 9.0);
        this.heroYaw = Math.PI;
        this.hero.root.position.copy(this.heroPos);
        this.controls.target.set(pp.x, pGroundY + 2.6, pp.z + 3.5);
        this.camera.position.set(pp.x, pGroundY + 20, pp.z + 24);
        this.owlState = 'land';
        this.owlRig.root.position.set(pp.x - 3.5, pGroundY + 4.5, pp.z + 9.5);
        this.storyDialog = {
          kind: 'opening',
          step: 2,
          speakerName: 'Raja Aksara',
          speakerRole: 'Raja Kerajaan Kata · Pulau Gua Portal',
          textEn: 'Only a few words remain inside the palace. Six crown shards are scattered across 6 islands, each guarded by a mighty boss monster!',
          textId: 'Hanya tersisa sedikit kata di istana, sementara enam pecahan mahkota tersebar di enam pulau kepulauan kita yang dijaga monster bos besar. Bebaskan keenam pulau dimulai dari Desa Sapaan!',
          accentColor: '#8b5cf6',
        };
        soundEngine.speakEnglish('Six crown shards are scattered across six islands. Free them all!');
      } else if (nextStep === 3) {
        // Owl hint + Senjata Pemula + 6 Pita Merah Lila
        const pp = OVERWORLD_ANCHORS.portal;
        const pGroundY = getArchipelagoGroundY(pp.x, pp.z);
        this.owlRig.root.position.set(pp.x - 1.5, pGroundY + 1.8, pp.z + 10.5);
        this.storyDialog = {
          kind: 'opening',
          step: 3,
          speakerName: 'Burung Hantu Pembimbing',
          speakerRole: 'Pesan Terakhir Sebelum Berangkat',
          textEn: 'You have no weapon yet! Wake up at Desa Sapaan, pick up your Starter Weapon in the meadow grass, and march across the bridges through all 6 islands!',
          textId: 'Kamu belum memiliki senjata! Mulailah dari Desa Sapaan, ambil Senjata Pemula yang terjatuh di sebelah kiri alun-alun desa, lalu jelajahi jembatan menuju 6 pulau dan temukan 6 helai pita merah dari Lila.',
          accentColor: '#10b981',
        };
      } else {
        this.finishOpeningStory(false);
      }
      this.pushHud(true);
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
          speakerName: 'Hadiah Kebebasan & Pita Merah Lila',
          speakerRole: `${ZONE_INFO[zId].name} Bebas · Pecahan Mahkota ${rb.number}/6`,
          textEn: `Area liberated! Earned Crown Shard #${rb.number}/6, ${RELICS[boss.rewardRelic].name}, and ${wDef.name}!`,
          textId: `${story.captiveName} kembali bersama ${story.guardianName}! Gua kini terang benderang dan bebas dari bayangan monster.`,
          accentColor: '#e11d48',
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
      this.pushHud(true);
      return;
    }
  }

  public skipStory(): void {
    if (!this.storyDialog) return;
    if (this.storyDialog.kind === 'opening') {
      this.finishOpeningStory(true);
    } else if (this.storyDialog.kind === 'dungeon_intro') {
      this.finishDungeonIntroCutscene();
    } else if (this.storyDialog.kind === 'dungeon_rescue') {
      this.finishDungeonRescueCutscene(this.storyDialog.zoneId);
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
    this.introDone = true;
    this.storyDialog = null;
    this.owlState = 'leave';
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
      skipped
        ? '🎯 Misi Awal (Desa Sapaan): Ikuti cahaya biru di kiri desa untuk ambil Senjata Pemula!'
        : '🎯 Misi Pertama (Desa Sapaan): Ambil Senjata Pemula di sisi kiri desa lalu temui Tetua Adat!',
      5.0,
    );
    soundEngine.playBuild();
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
    if (advanceClock && this.phase === 'playing') {
      const prevPhase = this.getCurrentDayPhase();
      this.worldTimeTick += TICKS_PER_SEC * dt;
      if (this.worldTimeTick >= TICKS_PER_DAY) {
        this.worldTimeTick -= TICKS_PER_DAY;
        this.dayCount += 1;
      }
      const nextPhase = this.getCurrentDayPhase();
      this.lastOverworldDayPhase = nextPhase;

      if (prevPhase !== nextPhase) {
        if (nextPhase === 'sore') {
          this.showBanner(
            '🌇 Sore tiba! Warga pulang ke rumah & penjaga bersiap istirahat di pos...',
            4.5,
          );
        } else if (nextPhase === 'malam') {
          this.spawnNightSurfaceWave();
        } else if (nextPhase === 'pagi') {
          this.triggerMorningSunlightDestruction();
          this.syncShootersForDifficulty();
          this.showBanner(
            '🌅 Fajar menyingsing! Panas matahari menghancurkan monster malam & warga keluar kembali!',
            5.0,
          );
        } else if (nextPhase === 'siang') {
          this.clearOverworldNightMonsters();
          this.syncShootersForDifficulty();
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

    (this.scene.background as THREE.Color).copy(_skyColorScratch);
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.copy(_skyColorScratch);
      this.scene.fog.density = THREE.MathUtils.lerp(0.0068, 0.0034, daylight);
    }

    _hemiSkyScratch
      .copy(_hemiSkyNightCol)
      .lerp(_hemiSkyDayCol, daylight)
      .lerp(_hemiSkyDuskCol, twilightGlow * 0.35);
    _hemiGndScratch.copy(_hemiGndNightCol).lerp(_hemiGndDayCol, daylight);
    this.hemiLight.color.copy(_hemiSkyScratch);
    this.hemiLight.groundColor.copy(_hemiGndScratch);
    this.hemiLight.intensity =
      THREE.MathUtils.lerp(0.34, 0.98, daylight) + (this.preferLiteShader ? 0.2 : 0);

    _sunColorScratch
      .copy(_sunNightCol)
      .lerp(isDawn ? _sunDawnCol : _sunDayCol, THREE.MathUtils.clamp(daylight * 1.15, 0, 1));
    this.sunLight.color.copy(_sunColorScratch);
    this.sunLight.intensity =
      THREE.MathUtils.lerp(0.46, 1.95, daylight) + twilightGlow * 0.22;

    const focusX = this.phase === 'title' ? 4 : Math.round(this.heroPos.x * 0.5) * 2;
    const focusZ = this.phase === 'title' ? -4 : Math.round(this.heroPos.z * 0.5) * 2;
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
      this.scene.environmentIntensity = THREE.MathUtils.lerp(0.32, 1.0, daylight);
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
      this.villageRig.moonGroup.visible = my > -14;
    }
    if (this.villageRig?.starMat) {
      this.villageRig.starMat.opacity = THREE.MathUtils.clamp((0.35 - daylight) * 2.4, 0, 0.92);
    }
  }

  private applyAtmosphere(mode: WorldLocationMode, zoneId?: ZoneId, dungeonBright = false): void {
    const liteBoost = this.preferLiteShader ? 0.2 : 0;
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
    } else {
      this.updateOverworldDayNightAtmosphere(0, false);
    }
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
    this.dungeonClickables = [];
    this.academyClickables = [];
    this.academyNpcs.clear();
    this.academyCitizens = [];
    this.dungeonState = null;
    this.nearDungeonExit = false;
    this.nearbyDoorIndex = null;
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

    const npc = lastZoneId ? NPC_CATALOG.find((n) => n.zoneId === lastZoneId) : NPC_CATALOG[0];
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
    };
    soundEngine.playLose();
    this.saveProgress();
    this.pushHud(true);
  }

  public setPhase(next: GamePhase): void {
    this.phase = next;
    this.forceRenderNextFrame = true;
    this.lastFrameRenderMs = 0;
    this.heldKeys.clear();
    this.lookPointer = null;
    if (next !== 'playing') {
      this.voiceMoveTimer = 0;
      this.voiceMoveVec = { x: 0, z: 0 };
      this.voiceSprint = false;
      this.voiceAutoFire = false;
      this.isAiming = false;
      this.aimToggled = false;
      this.rightAimHeld = false;
      this.leftFireHeld = false;
      this.hudFireHeld = false;
      if (document.pointerLockElement === this.renderer.domElement) {
        try {
          document.exitPointerLock?.();
        } catch {
          // ignore
        }
      }
    }
    this.applyCameraVisibilityAndControls();
    if ((next === 'paused' || next === 'title') && this.hasSave) {
      this.saveProgress();
    }
    this.pushHud(true);
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
        if (this.worldMode !== 'overworld') {
          this.triggerDefeatExit(battle.zoneId);
        } else {
          this.phase = 'gameover';
          soundEngine.playLose();
        }
      } else {
        this.phase = 'playing';
        this.showBanner('Berhasil kabur dari duel (-1 ❤️)', 2.4);
      }
      this.saveProgress();
      this.pushHud(true);
      return;
    }

    if (outcome === 'defeat' || this.hp <= 0) {
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
        m.respawnTimer = m.isSkyMonster ? 50 : 0;
        m.mesh.visible = false;
        if (!m.isSkyMonster) {
          if (m.mesh.parent) m.mesh.parent.remove(m.mesh);
          const clickIdx = this.overworldClickables.indexOf(m.mesh);
          if (clickIdx >= 0) this.overworldClickables.splice(clickIdx, 1);
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
      this.phase = 'dialogue';
      this.heldKeys.clear();
      this.callbacks.onOpenNpcDialogue(this.nearbyNpcId);
      this.pushHud(true);
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
    if (!this.dungeonState) return;
    const zId = this.dungeonState.zoneId;
    const story = ZONE_CAVE_STORIES[zId];
    soundEngine.playPick();
    if (this.dungeonState.liberated) {
      this.showBanner(`${story.guardianName}: "${story.rescueGuardianId}"`, 4.8);
      soundEngine.speakEnglish(story.rescueGuardianEn);
    } else if (this.dungeonState.prisonKeyCollected) {
      const corner =
        story.prisonCorner === 'nw' ? 'Kiri Atas (Barat Laut)' : 'Kanan Atas (Timur Laut)';
      this.showBanner(
        `${story.guardianName}: Kamu sudah pegang Kuncinya! Cepat buka sel rahasia di sudut ${corner} untuk selamatkan ${story.captiveName}!`,
        4.6,
      );
    } else if (this.dungeonState.bossDefeated) {
      this.showBanner(
        `${story.guardianName}: Gua sudah terang! Ambil Kunci Penjara Emas di tengah arena lalu bebaskan ${story.captiveName}!`,
        4.6,
      );
    } else {
      this.showBanner(
        `${story.guardianName}: Buka 5 Pintu Misi & kalahkan Bos agar ${story.captiveName} bisa diselamatkan!`,
        4.2,
      );
    }
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

    if (correct) {
      const blk = this.dungeonRig?.caveBlocks.find((b) => b.id === blockId && b.alive);
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
    m.mobHp = (m.mobHp ?? m.maxMobHp ?? 4) - damage;
    if (m.isCaveMob && m.type === 'cave_spider') {
      m.fuseTimer = -1;
      m.mesh.scale.setScalar(MONSTER_SPECS[m.type].baseScale);
    } else if (m.combatOnly) {
      m.aggroActive = true;
      m.hitFlashTimer = 0.22;
    }

    const len = Math.max(0.25, Math.hypot(dirX, dirZ));
    if (m.isSeaMonster && this.worldMode === 'overworld') {
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
    m.respawnTimer = m.isSeaMonster ? 45 : m.isSkyMonster ? 50 : 0;
    m.aggroActive = false;
    m.windupTimer = -1;
    m.lungeTimer = 0;
    m.mesh.visible = false;
    if (this.worldMode === 'overworld' && !m.isSeaMonster && !m.isSkyMonster) {
      if (m.mesh.parent) m.mesh.parent.remove(m.mesh);
      const clickIdx = this.overworldClickables.indexOf(m.mesh);
      if (clickIdx >= 0) this.overworldClickables.splice(clickIdx, 1);
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

  public jumpHero(): void {
    this.lastInputActivityMs = performance.now();
    if (this.phase !== 'playing') return;
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
    this.heroVelY = 11.8;
    this.heroOnGround = false;
    soundEngine.playDash();
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
    if (this.phase !== 'playing') return;
    if (this.isSwimming) {
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

    let turnDiff = aimYaw - this.heroYaw;
    while (turnDiff > Math.PI) turnDiff -= Math.PI * 2;
    while (turnDiff < -Math.PI) turnDiff += Math.PI * 2;
    if (!skipTurnWait && this.cameraMode !== 'first_person' && Math.abs(turnDiff) > 0.24) {
      this.shootAimYaw = aimYaw;
      this.shootAimPitch = aimPitch;
      this.shootAimTargetId = lockedTargetId;
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
    }
    this.pushHud(true);
  }

  private spawnProjectile(opts: {
    fromPlayer: boolean;
    weaponId?: WeaponId;
    x: number;
    y?: number;
    z: number;
    vx: number;
    vy?: number;
    vz: number;
    damage: number;
    shieldDamage: number;
    pierceLeft: number;
    colorHex: number;
  }): void {
    const slot = this.projectiles.find((p) => !p.active);
    if (!slot) return;
    slot.active = true;
    slot.fromPlayer = opts.fromPlayer;
    slot.weaponId = opts.weaponId;
    slot.x = opts.x;
    slot.y = opts.y ?? 1.35;
    slot.z = opts.z;
    slot.vx = opts.vx;
    slot.vy = opts.vy ?? 0;
    slot.vz = opts.vz;
    slot.damage = opts.damage;
    slot.shieldDamage = opts.shieldDamage;
    slot.pierceLeft = opts.pierceLeft;
    slot.hitIds.clear();
    const horizSpd = Math.hypot(opts.vx, opts.vz);
    slot.life = opts.fromPlayer && Math.abs(opts.vy ?? 0) > horizSpd * 0.18 ? 1.85 : 1.45;
    (slot.mesh.material as THREE.MeshBasicMaterial).color.setHex(opts.colorHex);
    slot.mesh.scale.setScalar(opts.damage > 1 ? 1.45 : 1.0);
    slot.mesh.position.set(opts.x, slot.y, opts.z);
    slot.mesh.visible = true;
  }

  private getActiveMonsters(): RoamingMonster[] {
    if (this.worldMode === 'dungeon') return this.dungeonMonsters;
    if (this.worldMode === 'academy') return this.academyMonsters;
    return this.overworldAllMonsters;
  }

  private engageMonster(m: RoamingMonster): void {
    if (m.combatOnly || m.isCaveMob) return;
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
    if (this.phase !== 'title' && this.hasSave) {
      this.saveProgress();
    }
  };

  private onVisibilitySave = (): void => {
    if (document.visibilityState === 'hidden') {
      if (this.phase !== 'title' && this.hasSave) {
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
  };

  private onWindowBlur = (): void => {
    this.heldKeys.clear();
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

    const lp = this.lookPointer;
    if (lp && lp.id === e.pointerId) {
      this.lookPointer = null;
      if (lp.moved) return;
    } else if (lp !== null) {
      return;
    }
    if (this.phase !== 'playing') return;
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
        : this.overworldClickables;
    const hits = this.raycaster.intersectObjects(targets, true);
    if (hits.length > 0) {
      let obj: THREE.Object3D | null = hits[0].object;
      while (
        obj &&
        !obj.userData.npcId &&
        !obj.userData.monsterId &&
        !obj.userData.portal &&
        !obj.userData.dungeonExit &&
        !obj.userData.academyExit &&
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
          } else {
            this.phase = 'dialogue';
            this.heldKeys.clear();
            this.callbacks.onOpenNpcDialogue(obj.userData.npcId as string);
          }
          this.pushHud(true);
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
      this.phase === 'paused' ||
      this.phase === 'gameover' ||
      this.phase === 'battle' ||
      this.phase === 'learning' ||
      this.phase === 'academy'
    ) {
      return 650;
    }
    if (this.phase === 'title') {
      return 32;
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
    this.updateParticles(dt);

    if (this.renderer.shadowMap.enabled) {
      this.shadowFrameCounter += 1;
      const shadowMod =
        this.phase === 'title'
          ? 5
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
        const timeRefresh = now - this.lastShadowUpdateMs > (this.isLowEndMobile ? 1250 : 900);
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

    this.renderer.render(this.scene, this.camera);
    const workMs = performance.now() - now;
    this.emaFrameWorkMs = this.emaFrameWorkMs * 0.9 + workMs * 0.1;

    // Adaptive resolution scaling on mobile Full mode: keep sharp DPR by default, step down only under sustained load
    if (this.isMobileDevice && this.phase === 'playing' && this.settings.fxLevel === 'full') {
      if (workMs > 13.5) {
        this.slowFrameStreak += 1;
        this.fastFrameStreak = 0;
        if (this.slowFrameStreak >= 45 && this.activeDprScale > 0.85) {
          this.activeDprScale = Math.max(0.85, this.activeDprScale - 0.08);
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

  private updateStoryAnimations(dt: number): void {
    this.storyTimer += dt;

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

      _v1.set(0.2, 3.1, 16.2);
      this.camera.position.lerp(_v1, 1 - Math.exp(-3.2 * dt));
      _v2.set(3.4, 1.75, 12.1);
      this.controls.target.lerp(_v2, 1 - Math.exp(-3.6 * dt));
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

      _v1.set(0.5, 3.1, 16.4);
      this.camera.position.lerp(_v1, 1 - Math.exp(-4.0 * dt));
      _v2.set(3.5, 1.75, 12.0);
      this.controls.target.lerp(_v2, 1 - Math.exp(-4.0 * dt));
      return;
    }

    const flap = Math.sin(this.elapsed * 16) * 0.65;
    this.owlRig.leftWing.rotation.z = flap;
    this.owlRig.rightWing.rotation.z = -flap;
    const owlBlink = computeBlinkScale(this.elapsed, 0.9);
    this.owlRig.leftEye.scale.y = owlBlink;
    this.owlRig.rightEye.scale.y = owlBlink;

    if (this.owlState === 'fly') {
      const p = Math.min(1, this.storyTimer / 2.6);
      this.owlRig.root.position.set(
        THREE.MathUtils.lerp(-24, 2, p),
        10 - Math.sin(p * Math.PI) * 3.5,
        THREE.MathUtils.lerp(18, 12, p),
      );
      this.owlRig.root.rotation.y = Math.PI * 0.45;
    } else if (this.owlState === 'land') {
      this.owlRig.root.position.y = 2.0 + Math.sin(this.elapsed * 3) * 0.2;
      this.owlRig.leftWing.rotation.z = 0.15;
      this.owlRig.rightWing.rotation.z = -0.15;
    }
  }

  private updateWorldAnimations(dt: number): void {
    this.waterUniforms.uTime.value = this.elapsed;
    this.updateOverworldDayNightAtmosphere(dt, this.worldMode === 'overworld');
    this.sunburnFxTimer += dt;
    const ambientMode =
      this.worldMode === 'overworld' &&
      this.phase !== 'title' &&
      this.phase !== 'paused' &&
      this.phase !== 'gameover'
        ? this.getCurrentDayPhase() === 'malam'
          ? 'night'
          : 'day'
        : 'none';
    soundEngine.setAmbientMode(ambientMode);
    if (this.phase !== 'playing') {
      soundEngine.setWalking(false);
    }

    // Keep Hero breathing, blinking & alive even on title/story/dialogue/pause screens!
    const inCaveCutscene =
      this.phase === 'story' &&
      (this.storyDialog?.kind === 'dungeon_intro' || this.storyDialog?.kind === 'dungeon_rescue');
    if (this.phase !== 'playing') {
      this.heroIdleTime = 0;
      this.heroThoughtText = null;
      this.heroThoughtTimer = 0;
    }
    if (this.phase !== 'playing' && !inCaveCutscene) {
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
    for (const m of this.getActiveMonsters()) {
      const spec = MONSTER_SPECS[m.type];
      if (!m.alive) {
        if (this.phase === 'playing' && m.respawnTimer > 0) {
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
          !canVisCull ||
          minDistSq <= visLim ||
          Boolean(m.aggroActive) ||
          m.sunburnTimer !== undefined ||
          m.angryTimer > 0;
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
      if (m.isSeaMonster && this.worldMode === 'overworld') {
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
          if (this.hp <= 0) {
            this.triggerDefeatExit(this.dungeonState?.zoneId);
            return;
          }
        }
        continue;
      }

      // Distance culling for far Overworld surface monsters (keeps 50-mob Night & 30-mob Day locked at 60 FPS)
      const dxHero = this.heroPos.x - m.x;
      const dzHero = this.heroPos.z - m.z;
      const distSqHero = dxHero * dxHero + dzHero * dzHero;
      if (this.worldMode === 'overworld' && distSqHero > 52 * 52 && !m.aggroActive) {
        continue;
      }

      // Special AI 3: Combat Brawlers (70% Overworld Day & Night Combat Monsters + Cave Guardians — NO QUIZ!)
      if (
        m.combatOnly &&
        ((this.worldMode === 'dungeon' && this.dungeonRig) || this.worldMode === 'overworld')
      ) {
        const distH = Math.sqrt(distSqHero);

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
        if (this.phase === 'playing' && distH < aggroRange) {
          if (!m.aggroActive) {
            soundEngine.playMonster();
          }
          m.aggroActive = true;
        } else if (this.worldMode === 'overworld' && distH > aggroRange + 7.0) {
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
              this.spawnProjectile({
                fromPlayer: false,
                x: m.x + (dxHero / distH) * (0.9 * spec.baseScale),
                y: mFireY,
                z: m.z + (dzHero / distH) * (0.9 * spec.baseScale),
                vx: (dxHero / distH) * pSpeed,
                vz: (dzHero / distH) * pSpeed,
                damage: 1,
                shieldDamage: 1,
                pierceLeft: 0,
                colorHex: 0xef4444,
              });
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
          for (const obs of this.villageRig.obstacles) {
            pushBrawlerBox(obs.x, obs.z, obs.halfW, obs.halfD);
          }
          const mobClamp = { x: nextMx, z: nextMz };
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
          for (const obs of this.villageRig.obstacles) {
            const cx = THREE.MathUtils.clamp(nextMx, obs.x - obs.halfW, obs.x + obs.halfW);
            const cz = THREE.MathUtils.clamp(nextMz, obs.z - obs.halfD, obs.z + obs.halfD);
            const dx = nextMx - cx;
            const dz = nextMz - cz;
            const distSq = dx * dx + dz * dz;
            if (distSq < mRad * mRad && distSq > 0.0001) {
              const d = Math.sqrt(distSq);
              nextMx += (dx / d) * (mRad - d);
              nextMz += (dz / d) * (mRad - d);
            }
          }
          const mobClamp = { x: nextMx, z: nextMz };
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
      if (this.liberatedZones.has(zId)) {
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

    const currentDayPhase = this.getCurrentDayPhase();

    this.extraVillageColliders.length = 0;
    this.extraVillageColliders.push({
      x: this.heroPos.x,
      z: this.heroPos.z,
      halfW: 0.65,
      halfD: 0.65,
    });
    for (const npc of this.npcs.values()) {
      this.extraVillageColliders.push({
        x: npc.x,
        z: npc.z,
        halfW: 0.65,
        halfD: 0.65,
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
    );

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

    const isNightShift = currentDayPhase === 'sore' || currentDayPhase === 'malam';
    let npcIdx = 0;
    for (const [npcId, npc] of this.npcs.entries()) {
      const def = NPC_CATALOG.find((item) => item.id === npcId);
      const q = this.quests.find((item) => item.npcId === npcId);
      const showAlert = !q?.claimed;
      const distHero = Math.hypot(this.heroPos.x - npc.x, this.heroPos.z - npc.z);

      if (!isNightShift) {
        // Pagi - Sore: kembali ke posisi jaga berdiri seperti biasa
        npc.nightAwake = false;
        const dx = npc.standX - npc.x;
        const dz = npc.standZ - npc.z;
        const distStand = Math.hypot(dx, dz);
        if (distStand > 0.25) {
          const step = Math.min(distStand, 3.2 * dt);
          npc.x += (dx / distStand) * step;
          npc.z += (dz / distStand) * step;
          npc.yaw = Math.atan2(dx, dz);
          npc.poseMode = 'walk';
          npc.mesh.position.set(npc.x, getArchipelagoGroundY(npc.x, npc.z), npc.z);
        } else {
          npc.x = npc.standX;
          npc.z = npc.standZ;
          npc.yaw = npc.standRotY;
          npc.poseMode = 'stand';
          npc.mesh.position.set(npc.standX, npc.standY, npc.standZ);
        }
      } else {
        // Sore / Malam: pindah ke pos penjaga & tidur; terbangun saat player mendekat!
        const bedX = npc.guardPost.bedX;
        const bedZ = npc.guardPost.bedZ;
        if (
          !npc.nightAwake &&
          this.phase === 'playing' &&
          distHero < 6.0 &&
          (npc.poseMode === 'sleep' || Math.hypot(npc.x - bedX, npc.z - bedZ) < 1.8)
        ) {
          npc.nightAwake = true;
          // Berdiri cepat di sisi pos menghadap Hero
          const toStandX = npc.standX - bedX;
          const toStandZ = npc.standZ - bedZ;
          const toStandLen = Math.hypot(toStandX, toStandZ) || 1;
          npc.x = bedX + (toStandX / toStandLen) * 1.85;
          npc.z = bedZ + (toStandZ / toStandLen) * 1.85;
          npc.poseMode = 'stand';
          npc.mesh.position.set(npc.x, getArchipelagoGroundY(npc.x, npc.z), npc.z);
          const nowMs = Date.now();
          if (nowMs - npc.lastWakeBannerMs > 6000) {
            npc.lastWakeBannerMs = nowMs;
            soundEngine.playPick();
            this.showBanner(
              `⚠️ ${def?.name ?? 'Penjaga'} terbangun: "${def?.storyLine1Id ?? def?.speechBubble ?? 'Tolong selamatkan wilayah kami!'}"`,
              5.0,
            );
          }
        }

        if (npc.nightAwake) {
          if (distHero > 9.5) {
            npc.nightAwake = false;
          } else {
            npc.poseMode = 'stand';
            npc.yaw = Math.atan2(this.heroPos.x - npc.x, this.heroPos.z - npc.z);
            npc.mesh.position.set(npc.x, getArchipelagoGroundY(npc.x, npc.z), npc.z);
          }
        }

        if (!npc.nightAwake) {
          const dx = bedX - npc.x;
          const dz = bedZ - npc.z;
          const distBed = Math.hypot(dx, dz);
          if (distBed > 0.4) {
            const spd = currentDayPhase === 'malam' ? 3.8 : 2.6;
            const step = Math.min(distBed, spd * dt);
            npc.x += (dx / distBed) * step;
            npc.z += (dz / distBed) * step;
            npc.yaw = Math.atan2(dx, dz);
            npc.poseMode = 'walk';
            npc.mesh.position.set(npc.x, getArchipelagoGroundY(npc.x, npc.z), npc.z);
          } else {
            npc.x = bedX;
            npc.z = bedZ;
            npc.yaw = npc.guardPost.bedYaw;
            npc.poseMode = 'sleep';
            npc.mesh.position.set(bedX, npc.guardPost.bedY, bedZ);
          }
        }
      }

      const npcGroundY =
        npc.poseMode === 'stand' && npc.x === npc.standX && npc.z === npc.standZ
          ? npc.standY
          : npc.poseMode === 'sleep'
          ? npc.guardPost.bedY
          : getArchipelagoGroundY(npc.x, npc.z);
      npc.mesh.rotation.y = npc.yaw;
      npc.alertMesh.visible = showAlert;
      if (showAlert && (distHero < 85 || this.phase === 'title')) {
        const alertY = npc.poseMode === 'sleep' ? npc.guardPost.bedY + 1.4 : npcGroundY + 4.2;
        npc.alertMesh.position.set(
          npc.x,
          alertY + Math.sin(this.elapsed * 3.5 + npc.x) * 0.28,
          npc.z,
        );
        npc.alertMesh.rotation.y += dt * 2.2;
      }
      const isNear = distHero < 5.5;
      if (distHero < 38 || npc.poseMode === 'walk') {
        animateZoneNpc(npc.mesh, this.elapsed, npcIdx * 1.15, isNear, dt, npc.poseMode);
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
          thoughtNpc.poseMode !== 'stand' ||
          thoughtNpc.nightAwake;
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
            if (npc.poseMode !== 'stand' || npc.nightAwake || id === this.nearbyNpcId) continue;
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

    if (this.ownedWeapons.has('ketapel') && this.weaponAmmo.ketapel < 5) {
      this.ketapelRegenTimer += dt;
      if (this.ketapelRegenTimer >= 20) {
        this.ketapelRegenTimer = 0;
        this.weaponAmmo.ketapel += 1;
      }
    } else {
      this.ketapelRegenTimer = 0;
    }

    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
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
      this.hudFireHeld ||
      this.leftFireHeld ||
      this.voiceAutoFire ||
      this.heldKeys.has('Space');
    if (continuousHold && this.fireCooldown <= 0 && !this.pendingTurnShot && hasEquippedWeapon) {
      this.fireActiveWeapon(true);
    }

    // 1. Movement (Keyboard + Virtual Analog Joystick + Voice Move + Tap-to-Move)
    let mx = this.virtualMove.x;
    let mz = -this.virtualMove.z; // screen up = +forward
    if (this.heldKeys.has('KeyW') || this.heldKeys.has('ArrowUp')) mz += 1;
    if (this.heldKeys.has('KeyS') || this.heldKeys.has('ArrowDown')) mz -= 1;
    if (this.heldKeys.has('KeyA') || this.heldKeys.has('ArrowLeft')) mx -= 1;
    if (this.heldKeys.has('KeyD') || this.heldKeys.has('ArrowRight')) mx += 1;

    const hasManualMove = Math.hypot(mx, mz) > 0.08;
    if (hasManualMove) {
      this.voiceMoveTimer = 0;
      this.voiceMoveVec = { x: 0, z: 0 };
      this.voiceSprint = false;
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
      const sprint = this.isSwimming
        ? isSprinting
          ? 1.02
          : 0.72
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
        const tapAccel = this.isSwimming ? 54 : 72;
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
    const prevHeroY = this.heroPos.y;
    const prevHeroZ = this.heroPos.z;
    const wasAirborne = !this.heroOnGround;
    const wasSwimming = this.isSwimming;

    this.swimLeapTimer = Math.max(0, this.swimLeapTimer - dt);
    this.coyoteTimer = this.heroOnGround && !this.isSwimming ? 0.14 : Math.max(0, this.coyoteTimer - dt);

    if (!this.isSwimming) {
      this.heroVelY -= 28 * dt;
    }
    this.heroPos.addScaledVector(this.heroVel, dt);
    this.heroPos.y += this.heroVelY * dt;

    if (this.worldMode !== 'overworld') {
      this.heroOnIce = false;
      this.isSwimming = false;
      this.swimLeapTimer = 0;
      this.heroPos.x = THREE.MathUtils.clamp(this.heroPos.x, -18.5, 18.5);
      this.heroPos.z = THREE.MathUtils.clamp(this.heroPos.z, -18.5, 18.5);
      if (this.worldMode === 'dungeon' && this.dungeonRig) {
        this.resolveCaveBlockCollisions();
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
          ? Math.max(0.95, Math.max(prevHeroY, this.heroPos.y) + 1.15)
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

      // Resolve smooth collisions against cottages, rocks, fences, towers & walls
      const heroRad = 0.72;
      for (const obs of this.villageRig.obstacles) {
        const cx = THREE.MathUtils.clamp(this.heroPos.x, obs.x - obs.halfW, obs.x + obs.halfW);
        const cz = THREE.MathUtils.clamp(this.heroPos.z, obs.z - obs.halfD, obs.z + obs.halfD);
        const dx = this.heroPos.x - cx;
        const dz = this.heroPos.z - cz;
        const distSq = dx * dx + dz * dz;
        if (distSq < heroRad * heroRad) {
          if (distSq > 0.0001) {
            const d = Math.sqrt(distSq);
            this.heroPos.x += (dx / d) * (heroRad - d);
            this.heroPos.z += (dz / d) * (heroRad - d);
          } else {
            this.heroPos.z = obs.z + obs.halfD + heroRad;
          }
        }
      }
      // Prevent Hero from walking straight through Quest NPCs
      for (const npc of this.npcs.values()) {
        const dx = this.heroPos.x - npc.x;
        const dz = this.heroPos.z - npc.z;
        const minD = 1.05;
        const dSq = dx * dx + dz * dz;
        if (dSq < minD * minD && dSq > 0.0001) {
          const d = Math.sqrt(dSq);
          this.heroPos.x += (dx / d) * (minD - d);
          this.heroPos.z += (dz / d) * (minD - d);
        }
      }

      // Ensure obstacle/NPC push never shoves hero inside an unclimbable steep cliff wall
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
      const hasObsSupport = obsSupportY !== null && this.heroPos.y >= obsSupportY - 1.35;
      const effGroundY = hasObsSupport ? Math.max(curSample.groundY, obsSupportY!) : curSample.groundY;
      const effLandOrBridge = curSample.isLandOrBridge || hasObsSupport;
      const effSurface = hasObsSupport && obsSupportY! >= curSample.groundY ? 'bridge' : curSample.surface;

      const underDeckNow =
        curSample.isLandOrBridge &&
        !curSample.isDryLand &&
        !hasObsSupport &&
        prevHeroY < curSample.groundY - 1.35 &&
        !(this.swimLeapTimer > 0 && this.heroVelY > 0.5);
      const inWaterZone = !effLandOrBridge || effGroundY < -0.15 || underDeckNow;
      // Lower pivot so standing/freestyle swimmer's chest, arms & head stay cleanly above water surface y=0!
      const SWIM_FLOAT_Y = -1.16;

      if (
        inWaterZone &&
        this.heroPos.y <= 0.14 &&
        !(this.swimLeapTimer > 0.18 && this.heroVelY > 1.8)
      ) {
        this.isSwimming = true;
        this.heroOnGround = false;
        this.swimLeapTimer = 0;
        if (!wasSwimming) {
          soundEngine.playSplash(Math.min(1.3, 0.72 + Math.abs(this.heroVelY) * 0.06));
          this.spawnBurst(this.heroPos.x, 0.12, this.heroPos.z, 0xbae6fd, 14);
          this.heroVelY *= 0.25;
        }
        const waveBobY = SWIM_FLOAT_Y + Math.sin(this.elapsed * 3.1 + this.heroPos.x * 0.2) * 0.07;
        this.heroVelY += (waveBobY - this.heroPos.y) * 20 * dt;
        this.heroVelY *= Math.exp(-6.5 * dt);
        this.heroPos.y += this.heroVelY * dt;
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
          if (this.hp <= 0) {
            this.phase = 'gameover';
            soundEngine.playLose();
            this.pushHud(true);
            return;
          }
        }
      }

      if (this.isSwimming !== wasSwimming) {
        this.refreshWeaponVisual();
      }
      if (this.isSwimming && Math.hypot(this.heroVel.x, this.heroVel.z) > 1.2) {
        this.swimFxTimer -= dt;
        if (this.swimFxTimer <= 0) {
          this.swimFxTimer = 0.15;
          this.spawnBurst(this.heroPos.x, 0.06, this.heroPos.z, 0xe0f2fe, 3);
        }
      }
    }

    if (wasAirborne && this.heroOnGround) {
      this.jumpLandTimer = 0.16;
    }

    if ((this.heroOnGround || this.coyoteTimer > 0 || this.isSwimming) && this.jumpBufferTimer > 0) {
      this.jumpHero();
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
          this.shootAimYaw = Math.atan2(tx - this.heroPos.x, tz - this.heroPos.z);
          const horiz = Math.max(0.25, Math.hypot(tx - this.heroPos.x, tz - this.heroPos.z));
          const targetPitch = Math.atan2(ty - (this.heroPos.y + 1.9), horiz);
          this.shootAimPitch = THREE.MathUtils.damp(this.shootAimPitch, targetPitch, 16, dt);
        }
      }
      this.shootAimTimer = Math.max(0, this.shootAimTimer - dt);
      if (this.shootAimTimer === 0 && !this.pendingTurnShot) {
        this.shootAimYaw = null;
        this.shootAimPitch = 0;
        this.shootAimTargetId = null;
      }
    }
    if (this.shootRecoilTimer > 0) {
      this.shootRecoilTimer = Math.max(0, this.shootRecoilTimer - dt);
    }

    const speed = Math.hypot(this.heroVel.x, this.heroVel.z);
    if (this.isSwimming) {
      this.walkCycle += dt * (speed > 0.6 ? 6.5 + speed * 0.55 : 2.8);
    } else if (speed > 0.6 && this.heroOnGround) {
      this.walkCycle += dt * (8 + speed * 0.45);
    }
    soundEngine.setWalking(
      speed > 0.8 && this.heroOnGround && !this.isSwimming,
      speed > 10.5 ? 1.2 : 1.0,
    );

    // Track Hero idle state: any joystick/key/tap move, jump, aim, or shoot immediately cancels idle pose & thought bubble
    const hasMoveInput =
      Math.hypot(mx, mz) > 0.08 ||
      Boolean(this.tapMoveTarget) ||
      speed > 0.45;
    const isBusyAction =
      !this.heroOnGround ||
      this.isSwimming ||
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

    const canHoldInCurrentEnv =
      hasEquippedWeapon && (!this.isSwimming || SEA_CAPABLE_WEAPONS.has(this.activeWeapon));
    applyHeroWeaponPose(this.hero, this.activeWeapon, canHoldInCurrentEnv, {
      speed,
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
    });

    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.hero.swimRing.visible = this.isSwimming;
    if (this.isSwimming) {
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
    const targetY = this.heroPos.y + 1.92;

    const targetFov = !isManualAim
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
      const baseDist =
        this.worldMode === 'dungeon' ? Math.min(this.thirdPersonDist, 6.2) : this.thirdPersonDist;
      const skyUpT =
        this.cameraMode === 'third_back' && effPitch < -0.15
          ? THREE.MathUtils.clamp((-effPitch - 0.15) / 0.88, 0, 1)
          : 0;
      const skyShortenDist = THREE.MathUtils.lerp(baseDist, Math.min(baseDist, 4.4), skyUpT);
      const desiredDist =
        isManualAim && this.cameraMode === 'third_back'
          ? THREE.MathUtils.lerp(skyShortenDist, Math.min(skyShortenDist, 3.45), this.aimBlend)
          : skyShortenDist;

      // Offset camera to Hero's right shoulder only in Bidik Bebas TPS so center crosshair stays clear
      const shoulderRight =
        isManualAim && this.cameraMode === 'third_back'
          ? THREE.MathUtils.lerp(0.86, 1.06, this.aimBlend)
          : 0;
      const pivotX = this.heroPos.x + cosY * shoulderRight;
      const pivotY =
        isManualAim && this.cameraMode === 'third_back'
          ? this.heroPos.y + THREE.MathUtils.lerp(2.04, 2.22, this.aimBlend)
          : targetY;
      const pivotZ = this.heroPos.z - sinY * shoulderRight;

      const dirX = sign * sinY * cosP;
      const dirY = sinP;
      const dirZ = sign * cosY * cosP;

      // Trace spring-arm from Hero center toward desired camera position (terrain-aware floor!)
      const goalX = pivotX + dirX * desiredDist;
      const goalZ = pivotZ + dirZ * desiredDist;
      const camFloorY =
        (this.worldMode === 'overworld' ? getArchipelagoGroundY(goalX, goalZ) : 0) + 0.55;
      const goalY = Math.max(camFloorY, pivotY + dirY * desiredDist);
      const rx = goalX - this.heroPos.x;
      const ry = goalY - pivotY;
      const rz = goalZ - this.heroPos.z;
      const rayLen = Math.hypot(rx, ry, rz) || 1;
      const blockedDist = this.computeSpringArmDist(
        this.heroPos.x,
        pivotY,
        this.heroPos.z,
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

      const camX = this.heroPos.x + (rx / rayLen) * this.currentCamDist;
      const camZ = this.heroPos.z + (rz / rayLen) * this.currentCamDist;
      const liveCamFloorY =
        (this.worldMode === 'overworld' ? getArchipelagoGroundY(camX, camZ) : 0) + 0.55;
      const camY = Math.max(liveCamFloorY, pivotY + (ry / rayLen) * this.currentCamDist);

      _v1.set(camX, camY, camZ);
      this.camera.position.lerp(_v1, 1 - Math.exp(-28 * dt));
      if (isManualAim && this.cameraMode === 'third_back') {
        this.camera.lookAt(
          pivotX - dirX * 24,
          pivotY - dirY * 24,
          pivotZ - dirZ * 24,
        );
      } else if (this.cameraMode === 'third_back' && effPitch < -0.04) {
        const skyLookT = THREE.MathUtils.clamp((-effPitch - 0.04) / 0.5, 0, 1);
        this.camera.lookAt(
          THREE.MathUtils.lerp(this.heroPos.x, pivotX - dirX * 24, skyLookT),
          THREE.MathUtils.lerp(targetY, pivotY - dirY * 24, skyLookT),
          THREE.MathUtils.lerp(this.heroPos.z, pivotZ - dirZ * 24, skyLookT),
        );
      } else {
        this.camera.lookAt(this.heroPos.x, targetY, this.heroPos.z);
      }
    } else if (this.cameraMode === 'first_person') {
      const eyeY = this.heroPos.y + 2.55;
      this.camera.position.set(this.heroPos.x, eyeY, this.heroPos.z);
      this.camera.lookAt(
        this.heroPos.x - sinY * cosP * 10,
        eyeY - sinP * 10,
        this.heroPos.z - cosY * cosP * 10,
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
        this.weaponAmmo.ketapel = Math.min(MAX_AMMO, this.weaponAmmo.ketapel + 6);
        this.refreshWeaponVisual();
        this.spawnBurst(sw.x, swY + 1.5, sw.z, 0xfacc15, 26);
        soundEngine.playPick();
        this.showBanner(
          '✨ Senjata Pemula Didapat! (Damage Kecil: 1 · Jelajahi Gua & kalahkan Bos untuk senjata kuat!)',
          4.8,
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
      let bestNpcDist = 5.6;
      for (const npc of NPC_CATALOG) {
        const live = this.npcs.get(npc.id);
        const nx = live?.x ?? npc.x;
        const nz = live?.z ?? npc.z;
        const ny = getArchipelagoGroundY(nx, nz);
        if (Math.abs(this.heroPos.y - ny) > 3.5) continue;
        const d = Math.hypot(this.heroPos.x - nx, this.heroPos.z - nz);
        if (d < bestNpcDist) {
          bestNpcDist = d;
          bestNpc = npc.id;
        }
      }
      this.nearbyNpcId = bestNpc;
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
    } else {
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
      if (d < triggerDist && this.encounterGraceTimer <= 0) {
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

    for (const s of this.shooters) {
      if (!s.alive) {
        if (
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
        for (const obs of this.villageRig.obstacles) {
          pushShooterBox(obs.x, obs.z, obs.halfW, obs.halfD);
        }
        for (const npc of this.npcs.values()) {
          pushShooterBox(npc.x, npc.z, 0.7);
        }
        const sClamp = { x: nextSx, z: nextSz };
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
      const lookYaw = Math.atan2(this.heroPos.x - s.x, this.heroPos.z - s.z);
      s.mesh.rotation.y = lookYaw;

      s.cooldown -= dt;
      const distToHero = Math.hypot(this.heroPos.x - s.x, this.heroPos.z - s.z);
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
        this.spawnBurst(muzzleX, sGroundY + 1.48, muzzleZ, 0xf43f5e, 6);
        this.spawnProjectile({
          fromPlayer: false,
          x: muzzleX,
          y: sGroundY + 1.48,
          z: muzzleZ,
          vx: Math.sin(lookYaw) * diff.shooterBulletSpeed,
          vz: Math.cos(lookYaw) * diff.shooterBulletSpeed,
          damage: 1,
          shieldDamage: 1,
          pierceLeft: 0,
          colorHex: 0xf43f5e,
        });
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
      p.x += p.vx * dt;
      p.y = (p.y ?? 1.35) + p.vy * dt;
      p.z += p.vz * dt;
      const projFloor =
        this.worldMode === 'overworld' && isWalkableArchipelago(p.x, p.z, 0)
          ? getArchipelagoGroundY(p.x, p.z)
          : 0;
      if (p.y < projFloor + 0.06) {
        p.active = false;
        p.mesh.visible = false;
        this.spawnBurst(p.x, projFloor + 0.12, p.z, 0x94a3b8, 5);
        continue;
      }
      p.mesh.position.set(p.x, p.y, p.z);
      p.mesh.rotation.y += dt * 8;

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

      if (p.fromPlayer) {
        // Check Hit on Shooters (3 HP -> kills for XP + Ammo + Gem)
        let consumed = false;
        for (const s of this.shooters) {
          if (!s.alive || p.hitIds.has(s.id)) continue;
          const sy = this.worldMode === 'overworld' ? getArchipelagoGroundY(s.x, s.z) : 0;
          if (Math.hypot(p.x - s.x, p.z - s.z) < 1.6 && Math.abs(p.y - (sy + 1.35)) < 1.75) {
            p.hitIds.add(s.id);
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
          const hitRadius = m.isBoss ? Math.max(2.1, spec.hitRadius * 1.15) : spec.hitRadius + 0.35;
          const mBaseY =
            m.y ??
            (this.worldMode === 'overworld'
              ? getArchipelagoGroundY(m.x, m.z) + spec.hoverY
              : spec.hoverY);
          const targetCenterY = mBaseY + (m.isBoss ? 2.1 : spec.hitCenterY);
          const halfH = m.isBoss ? Math.max(2.4, spec.hitHalfH * 1.2) : spec.hitHalfH + 0.35;
          if (Math.hypot(p.x - m.x, p.z - m.z) < hitRadius && Math.abs(p.y - targetCenterY) < halfH) {
            p.active = false;
            p.mesh.visible = false;

            if (m.isSeaMonster) {
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
      } else {
        // Enemy projectile hitting Hoot
        if (
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
          if (this.hp <= 0) {
            if (this.worldMode !== 'overworld') {
              this.triggerDefeatExit(this.dungeonState?.zoneId);
            } else {
              this.phase = 'gameover';
              soundEngine.playLose();
            }
          }
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
    if (this.phase !== 'playing' && this.phase !== 'title') return [];
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

    if (this.worldMode === 'dungeon') {
      // Cave spots, doors, chests, crafting tables, and monsters are tracked cleanly on the 3D Radar Minimap
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

    for (const npc of NPC_CATALOG) {
      const liveNpc = this.npcs.get(npc.id);
      const nx = liveNpc?.x ?? npc.x;
      const nz = liveNpc?.z ?? npc.z;
      const ny = getArchipelagoGroundY(nx, nz);
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
      if (this.phase === 'playing') {
        const isSleeping = liveNpc?.poseMode === 'sleep';
        const isAwakeWoken = Boolean(liveNpc?.nightAwake);
        const distHero = Math.hypot(this.heroPos.x - nx, this.heroPos.z - nz);
        const showSpeech = npc.id === this.nearbyNpcId || (isAwakeWoken && distHero < 8.5);
        const bubblePos = projectPoint(
          nx,
          isSleeping ? (liveNpc?.guardPost.bedY ?? ny) + 1.8 : ny + 4.9,
          nz,
        );
        if (bubblePos && showSpeech) {
          labels.push({
            id: `speech_${npc.id}`,
            x: bubblePos.x,
            y: bubblePos.y,
            title: isSleeping ? '💤 Sedang beristirahat di pos...' : npc.speechBubble,
            kind: 'speech',
          });
        } else if (
          bubblePos &&
          !isSleeping &&
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
    const dxHero = this.heroPos.x - m.x;
    const dzHero = this.heroPos.z - m.z;
    const distSqHero = dxHero * dxHero + dzHero * dzHero;
    if (distSqHero > 82 * 82 && !m.aggroActive) {
      return;
    }

    const distH = Math.sqrt(distSqHero);
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
        if (!sampleArchipelagoTerrain(pullPtX, pullPtZ).isLandOrBridge) {
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
        this.phase === 'playing' &&
        this.encounterGraceTimer <= 0 &&
        distH < meleeReach &&
        this.heroPos.y < 2.2
      ) {
        const dmg = spec.atkDamageHearts;
        this.hp = Math.max(0, this.hp - dmg);
        this.encounterGraceTimer = 1.5;
        soundEngine.playHurt();
        const len = Math.max(0.2, distH);
        this.heroVel.set((dxHero / len) * 16, 0, (dzHero / len) * 16);
        this.heroVelY = 4.2;
        this.spawnBurst(this.heroPos.x, Math.max(0.4, this.heroPos.y + 1.1), this.heroPos.z, 0x22d3ee, 16);
        this.showBanner(
          `🌊 Diserang ${m.name}! Pakai senjata wilayah untuk membunuhnya (-${dmg} ❤️)`,
          2.6,
        );
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
      if (distH < meleeReach + 0.6 && (m.attackCooldown ?? 0) <= 0 && this.heroPos.y < 2.4) {
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
          (this.isSwimming || this.heroPos.y < 4.5)
        ) {
          const pSpeed = this.settings.difficulty === 'pendekar' ? 11.2 : 9.2;
          const mFireY = (m.y ?? spec.hoverY) + spec.hitCenterY;
          const aimY = this.heroPos.y + 1.25 - mFireY;
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
          this.spawnProjectile({
            fromPlayer: false,
            x: m.x + (dxHero / distH) * (0.9 * spec.baseScale),
            y: mFireY,
            z: m.z + (dzHero / distH) * (0.9 * spec.baseScale),
            vx: (dxHero / dist3D) * pSpeed,
            vy: (aimY / dist3D) * pSpeed,
            vz: (dzHero / dist3D) * pSpeed,
            damage: 1,
            shieldDamage: 1,
            pierceLeft: 0,
            colorHex: spitColor,
          });
          m.attackCooldown = this.settings.difficulty === 'pendekar' ? 2.4 : 3.2;
          m.attackAnimTimer = 0.32;
        }
      }
    } else {
      m.patrolClock = (m.patrolClock ?? m.patrolPhase) + dt * 0.62 * spec.speedMult * baseSpeedMult;
      if (!isCharybdis) {
        const p = m.patrolClock;
        const patrolRad = spec.tier === 'giant' ? 8.5 : 10.5;
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
    const seaPt = { x: nextMx, z: nextMz };
    this.constrainSeaMonsterToWater(seaPt, prevX, prevZ, 2.6);
    m.x = seaPt.x;
    m.z = seaPt.z;

    const seaSpd = Math.hypot(m.x - prevX, m.z - prevZ) / Math.max(0.001, dt);
    m.walkPhase = (m.walkPhase ?? m.patrolPhase) + dt * (2.6 + seaSpd * 0.8);
    m.y = spec.hoverY + Math.sin(this.elapsed * 2.4 + m.patrolPhase) * 0.14;
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
    const dxHero = this.heroPos.x - m.x;
    const dzHero = this.heroPos.z - m.z;
    const distSqHero = dxHero * dxHero + dzHero * dzHero;
    if (distSqHero > 86 * 86 && !m.aggroActive) {
      return;
    }

    const distH = Math.sqrt(distSqHero);
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
          const aimY = this.heroPos.y + 1.35 - mFireY;
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
          this.spawnProjectile({
            fromPlayer: false,
            x: m.x + nx * (0.95 * spec.baseScale),
            y: mFireY,
            z: m.z + nz * (0.95 * spec.baseScale),
            vx: (dxHero / dist3D) * pSpeed,
            vy: (aimY / dist3D) * pSpeed,
            vz: (dzHero / dist3D) * pSpeed,
            damage: 1,
            shieldDamage: 1,
            pierceLeft: 0,
            colorHex: skyShotColor,
          });
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
    const npcDef = NPC_CATALOG.find((item) => item.id === npcId);
    const npcState = this.npcs.get(npcId);
    if (npcState) {
      for (const m of this.getActiveMonsters()) {
        if (!m.alive) continue;
        if (Math.hypot(m.x - npcState.x, m.z - npcState.z) < 15) {
          return `Hati-hati... ada ${m.name} berkeliaran di dekat pos.`;
        }
      }
    }

    if (npcDef && Math.random() < 0.45) {
      const zoneWords = VOCAB_CATALOG.filter((v) => v.zoneId === npcDef.zoneId);
      const pool = zoneWords.length > 0 ? zoneWords : VOCAB_CATALOG;
      const v = pool[Math.floor(Math.random() * pool.length)];
      return `Sambil jaga pos, ingat kata "${v.word}" = ${v.meaningId}.`;
    }

    const npcThoughts = [
      '*Hoaam...* Udara desa hari ini terasa sejuk.',
      '*Krucuk...* Nanti habis jaga makan apa ya?',
      'Melirik sekitar... situasi pos tampaknya aman terkendali.',
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
      const spotKindByZone: Record<ZoneId, RadarBlipKind> = {
        desa_sapaan: 'spot_desa',
        pasar_rasa: 'spot_pasar',
        hutan_satwa: 'spot_satwa',
        gerbang_kota: 'spot_gerbang',
        menara_waktu: 'spot_menara',
        gua_portal: 'spot_gua',
      };
      for (const npc of NPC_CATALOG) {
        const zId = npc.zoneId as ZoneId;
        const liberated = this.liberatedZones.has(zId);
        const live = this.npcs.get(npc.id);
        blips.push({
          id: `npc_${npc.id}`,
          x: live?.x ?? npc.x,
          z: live?.z ?? npc.z,
          kind: spotKindByZone[zId] ?? 'npc',
          color: npc.accentColor,
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
          color: '#06b6d4',
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
              centerX: THREE.MathUtils.clamp(this.heroPos.x, -210, 195),
              centerZ: THREE.MathUtils.clamp(this.heroPos.z, -215, 175),
              halfW: 36,
              halfH: 36,
            }
          : {
              worldMode: 'overworld',
              centerX: -6,
              centerZ: -26,
              halfW: 368,
              halfH: 230,
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
      activeZoneName: this.worldMode === 'academy' ? 'Istana IELTS' : ZONE_INFO[zoneId].name,
      rankTitle: getRankTitle(this.xp, this.ribbons.size, this.ieltsCleared),
      nearbyNpcId: this.nearbyNpcId,
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
      crosshairOnEnemy: this.crosshairOnEnemy,
      crosshairSpread: Math.min(
        1,
        this.crosshairSpread + (Math.hypot(this.heroVel.x, this.heroVel.z) > 1.2 ? 0.24 : 0),
      ),
      pointerLocked: this.pointerLocked,
      isSwimming: this.isSwimming,
      worldTime: this.getWorldTimeState(),
    });
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

    const remainingAll = this.monsters.filter((m) => m.alive).length;
    const expectedTotal = this.getCurrentDayPhase() === 'malam' ? 50 : 30;
    const totalAll = Math.max(this.nightWaveTotal || expectedTotal, remainingAll);
    const defeatedAll = Math.max(0, totalAll - remainingAll);

    const zoneSurfaceRemaining = this.monsters.filter((m) => m.alive && m.zoneId === zoneId).length;
    const zoneSurfaceTotal = Math.max(this.nightZoneTotals[zoneId] || 0, zoneSurfaceRemaining);
    const zoneSurfaceDefeated = Math.max(0, zoneSurfaceTotal - zoneSurfaceRemaining);
    const surfaceCombatRemaining = this.monsters.filter((m) => m.alive && m.combatOnly).length;
    const surfaceQuizRemaining = this.monsters.filter((m) => m.alive && !m.combatOnly).length;

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
          const d = Math.hypot(npc.x - this.heroPos.x, npc.z - this.heroPos.z);
          const def = NPC_CATALOG.find((n) => n.id === id);
          if (!best || d < best.d) best = { x: npc.x, z: npc.z, name: def?.name || 'NPC', d };
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
      consider(this.portalRig.root.position.x, this.portalRig.root.position.z + 2.5, 'Portal Istana IELTS');
      for (const [id, npc] of this.npcs.entries()) {
        const def = NPC_CATALOG.find((n) => n.id === id);
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
    this.onPageHideSave();
    this.disposed = true;
    soundEngine.setWalking(false);
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
    this.villageRig?.disposables.forEach((d) => d.dispose());
    this.worldObstaclesRig?.disposables.forEach((d) => d.dispose());
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
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
      }
    });
    this.renderer.dispose();
    if (dom.parentElement === this.container) {
      this.container.removeChild(dom);
    }
  }
}
