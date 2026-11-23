export type ZoneId =
  | 'desa_sapaan'
  | 'pasar_rasa'
  | 'hutan_satwa'
  | 'gerbang_kota'
  | 'menara_waktu'
  | 'gua_portal';

export type WorldLocationMode = 'overworld' | 'dungeon' | 'academy' | 'ocean';

export type MonsterType =
  | 'forest_slime'
  | 'poison_beetle'
  | 'cave_spider'
  | 'thorn_goblin'
  | 'wild_boar'
  | 'dire_wolf'
  | 'skeleton_warrior'
  | 'swamp_lizardman'
  | 'sand_scorpion'
  | 'lava_imp'
  | 'stone_gargoyle'
  | 'jungle_troll'
  | 'crystal_golem'
  | 'minotaur_brute'
  | 'magma_elemental'
  | 'frost_ogre'
  | 'iron_juggernaut'
  | 'ancient_treant'
  | 'obsidian_hydra'
  | 'titan_colossus'
  | 'goring_shark'
  | 'abyssal_kraken'
  | 'electric_eel_drakon'
  | 'leviathan_serpent'
  | 'venomous_box_jelly'
  | 'giant_bone_jaw'
  | 'toxic_sea_viper'
  | 'shadow_angler'
  | 'spiny_mega_stingray'
  | 'charybdis_maw'
  | 'giga_wyvern'
  | 'crimson_phoenix'
  | 'shadow_harpy'
  | 'giant_phantom'
  | 'toxic_chimera'
  | 'guardian_sentinel'
  | 'ice_shard_griffin'
  | 'blight_hornet'
  | 'acidic_sky_wyrm'
  | 'volcanic_giant_bat';

export type PickaxeTier = 1 | 2 | 3;

export type GamePhase =
  | 'title'
  | 'story'
  | 'playing'
  | 'battle'
  | 'learning'
  | 'dialogue'
  | 'academy'
  | 'paused'
  | 'gameover';

export type CameraMode = 'third_back' | 'first_person' | 'third_front' | 'orbit';
export type AimMode = 'auto' | 'manual';
export type DifficultyMode = 'santai' | 'petualang' | 'pendekar';
export type LearningModeType = 'cards' | 'quiz' | 'listen' | 'type' | 'match';
export type FxLevel = 'full' | 'lite' | 'off';

export type SwimStyleId =
  | 'surface_paddle'
  | 'front_crawl'
  | 'underwater_glide'
  | 'jump_dive'
  | 'deep_submerge'
  | 'scuba_explore'
  | 'water_tread'
  | 'quick_dodge'
  | 'water_dash'
  | 'backstroke';

export type SwimStylePreference = 'auto' | SwimStyleId;

export type JumpDiveTrick =
  | 'backflip'
  | 'cannonball'
  | 'spreadeagle'
  | 'swan_dive'
  | 'front_flip'
  | 'corkscrew';

export type DivingGearId = 'snorkel' | 'wetsuit_tank' | 'fins_torch';

export type SeaBiotaId =
  | 'brain_coral'
  | 'fire_coral'
  | 'blue_staghorn'
  | 'sea_anemone'
  | 'giant_kelp'
  | 'seagrass'
  | 'bioluminescent_algae'
  | 'sea_fan'
  | 'tiger_cowrie'
  | 'giant_clam'
  | 'clownfish'
  | 'blue_tang'
  | 'sea_turtle'
  | 'spotted_stingray'
  | 'yellow_seahorse'
  | 'chameleon_octopus'
  | 'spiny_lobster'
  | 'box_crab'
  | 'starfish'
  | 'glowing_jellyfish';

export interface OceanMaterials {
  pearl: number;
  fiber: number;
  calcium: number;
  shell: number;
  food: number;
}

export interface OceanSurvivalState {
  oxygen: number;
  maxOxygen: number;
  depthMeters: number;
  zoneKind: 'sanctuary' | 'twilight' | 'abyss';
  zoneLabel: string;
  discoveredBiota: SeaBiotaId[];
  ownedGear: DivingGearId[];
  materials: OceanMaterials;
  nearBiotaId: SeaBiotaId | null;
  nearBiotaName: string | null;
  nearBiotaAction: string | null;
  nearChestLabel: string | null;
  nearTurtleMount: boolean;
  ridingTurtle: boolean;
  nearSurfaceExit: boolean;
  suffocating: boolean;
}

export type WeaponId =
  | 'ketapel'
  | 'kerikil'
  | 'emas'
  | 'saus'
  | 'biji'
  | 'kertas'
  | 'jarum'
  | 'kristal';

export type RelicId =
  | 'pedang'
  | 'perisai'
  | 'peluit'
  | 'sepatu'
  | 'jam'
  | 'kompas';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  originZone: ZoneId | 'hutan';
  originLabel: string;
  color: string;
  colorHex: number;
  damage: number;
  shieldDamage: number;
  cooldown: number;
  speed: number;
  packSize: number;
  pierce?: number;
  spread?: number;
  desc: string;
}

export interface RelicDef {
  id: RelicId;
  icon: string;
  name: string;
  zoneId: ZoneId;
  desc: string;
}

export interface WordProgress {
  b: number; // box mastery 0..5 (3+ = mastered)
  r: number; // right count
  w: number; // wrong count
}

export interface CategoryDef {
  id: number;
  name: string;
  icon: string;
  zoneId: ZoneId;
}

export interface VocabEntry {
  id: string;
  word: string;
  meaningId: string;
  phonetic: string;
  exampleEn: string;
  exampleId: string;
  catId: number;
  zoneId: ZoneId | 'ielts';
  cefr: 'A1' | 'A2' | 'B1' | 'IELTS';
}

export interface DoorDef {
  index: number; // 0..4
  id: string;
  name: string;
  mode: LearningModeType | 'duel';
  modeLabel: string;
  x: number;
  z: number;
  minPct: number;
}

export type BossSpecialMechanic = 'none' | 'slime' | 'grow' | 'close' | 'rewind';

export interface BossDef {
  id: string;
  name: string;
  monsterType: MonsterType;
  zoneId: ZoneId;
  phases: number; // 3
  hpPerPhase: number; // 10 (total 30 HP across 3 phases)
  mechanic: BossSpecialMechanic;
  mechanicDesc: string;
  taunts: [string, string, string];
  rewardRelic: RelicId;
  rewardWeapon: WeaponId;
  rewardRibbon: string;
}

export interface QuizQuestion {
  id: string;
  vocabId: string;
  prompt: string;
  hintWord?: string;
  choices: [string, string, string, string];
  correctIndex: number;
  category: string;
  audioWord: string;
  isDifficultyFlagged?: boolean;
  isMiniIelts?: boolean;
  shortAnswer?: string;
}

export interface NpcDefinition {
  id: string;
  name: string;
  title: string;
  zoneId: ZoneId | 'hutan' | 'akademi';
  zoneName: string;
  x: number;
  z: number;
  rotationY: number;
  storyLine1En: string;
  storyLine1Id: string;
  storyLine2En: string;
  storyLine2Id: string;
  thanksId: string;
  speechBubble: string;
  enterLabel: string;
  questTitle: string;
  questType: 'liberate_zone' | 'defeat' | 'collect_diamond' | 'ielts_trial';
  questTarget: number;
  rewardXp: number;
  rewardDiamonds: number;
  accentColor: string;
  academySkill?: 'listening' | 'reading' | 'writing' | 'speaking' | 'full' | 'exit';
  archetypeId?: string;
  demographicLabel?: string;
  habitSummary?: string;
  skillSummary?: string;
  stats?: { hp: number; atk: number; nrg: number };
}

export interface MonsterSpawnDef {
  id: string;
  type: MonsterType;
  name: string;
  zoneId: ZoneId;
  x: number;
  z: number;
  maxHp: number;
  rewardXp: number;
  rewardDiamonds: number;
  rewardScore: number;
  isBoss?: boolean;
  isAcademyShadow?: boolean;
  academySkill?: 'listening' | 'reading' | 'writing' | 'speaking';
  wordIds?: string[];
}

export interface RpgQuestState {
  id: string;
  npcId: string;
  npcName: string;
  zoneId: ZoneId;
  zoneName: string;
  title: string;
  type: 'liberate_zone' | 'defeat' | 'collect_diamond' | 'ielts_trial';
  target: number;
  progress: number;
  rewardXp: number;
  rewardDiamonds: number;
  accepted: boolean;
  claimed: boolean;
}

export interface BattleContext {
  monsterId: string;
  monsterType: MonsterType;
  monsterName: string;
  zoneId: ZoneId;
  isIeltsBoss: boolean;
  isZoneBoss?: boolean;
  isAcademyShadow?: boolean;
  academySkill?: 'listening' | 'reading' | 'writing' | 'speaking';
  isMixedChallenge?: boolean;
  bossMechanic?: BossSpecialMechanic;
  monsterHp: number;
  monsterMaxHp: number;
  bossPhase?: number;
  roundNumber: number;
  wordIds?: string[];
  doorIndex?: number;
}

export interface LearningSessionContext {
  mode: LearningModeType;
  title: string;
  zoneId?: ZoneId;
  doorIndex?: number;
  catId?: number;
  minPct: number;
  wordIds: string[];
  isAmmoQuiz?: boolean;
}

export type CaveBlockKind =
  | 'stone'
  | 'moss_dirt'
  | 'diamond_ore'
  | 'heart_ore'
  | 'word_seal'
  | 'player_shield';

export interface CaveSealContext {
  blockId: string;
  zoneId: ZoneId;
  vocabId: string;
}

export interface DungeonZoneState {
  zoneId: ZoneId;
  zoneName: string;
  doorsCleared: number[]; // indices 0..4
  monstersRemaining: number;
  monstersTotal: number;
  allEnemiesDefeated: number;
  allEnemiesRemaining: number;
  allEnemiesTotal: number;
  bossSpawned: boolean;
  bossDefeated: boolean;
  prisonKeySpawned: boolean;
  prisonKeyCollected: boolean;
  prisonUnlocked: boolean;
  captiveName: string;
  guardianName: string;
  liberated: boolean;
  isMixedChallenge: boolean;
}

export interface AreaMonsterStats {
  context: 'overworld_day' | 'overworld_night' | 'dungeon' | 'academy' | 'ocean';
  areaName: string;
  defeated: number;
  remaining: number;
  total: number;
  caveDefeated?: number;
  caveRemaining?: number;
  caveTotal?: number;
  caveLiberated?: boolean;
  zoneNightDefeated?: number;
  zoneNightRemaining?: number;
  zoneNightTotal?: number;
  zoneSurfaceDefeated?: number;
  zoneSurfaceRemaining?: number;
  zoneSurfaceTotal?: number;
  surfaceCombatRemaining?: number;
  surfaceQuizRemaining?: number;
  guardiansDefeated?: number;
  guardiansTotal?: number;
  bossPending?: boolean;
  bossActive?: boolean;
  bossDefeated?: boolean;
}

export interface ProjectedLabel {
  id: string;
  x: number;
  y: number;
  title: string;
  kind: 'zone' | 'npc_alert' | 'speech' | 'thought' | 'portal' | 'monster' | 'door' | 'pickup';
  subtext?: string;
}

export interface StoryDialogState {
  kind: 'opening' | 'area_cleared' | 'defeat_exit' | 'dungeon_intro' | 'dungeon_rescue';
  step: number;
  zoneId?: ZoneId;
  speakerName: string;
  speakerRole: string;
  textEn: string;
  textId: string;
  accentColor: string;
  ribbonName?: string;
  ribbonQuote?: string;
  sageQuote?: string;
  rewardSummary?: string;
}

export interface GameSettings {
  difficulty: DifficultyMode;
  aimMode: AimMode;
  storyLocked: boolean; // true = Mode Cerita (6 Crowns for Istana), false = Bebas
  qtimer: boolean;
  fxLevel: FxLevel;
  touchControls: 'auto' | 'on' | 'off';
  dpadMode: 'joystick' | 'dpad';
}

export type RadarBlipKind =
  | 'starter'
  | 'spot_desa'
  | 'spot_pasar'
  | 'spot_satwa'
  | 'spot_gerbang'
  | 'spot_menara'
  | 'spot_gua'
  | 'npc'
  | 'guardian'
  | 'key'
  | 'prison'
  | 'portal'
  | 'monster_quiz'
  | 'monster_brawl'
  | 'sea_monster'
  | 'sky_monster'
  | 'boss'
  | 'craft'
  | 'chest'
  | 'door'
  | 'exit';

export interface RadarBlip {
  id: string;
  x: number;
  z: number;
  kind: RadarBlipKind;
  color: string;
  liberated?: boolean;
  needsHelp?: boolean;
  label?: string;
}

export interface RadarState {
  heroX: number;
  heroZ: number;
  heroYaw: number;
  camForwardX: number;
  camForwardZ: number;
  worldMode: WorldLocationMode;
  blips: RadarBlip[];
}

export interface LiveMapBounds {
  worldMode: WorldLocationMode;
  centerX: number;
  centerZ: number;
  halfW: number;
  halfH: number;
}

export interface LiveMapSnapshot {
  canvas: HTMLCanvasElement;
  bounds: LiveMapBounds;
}

export type DayPhaseId = 'pagi' | 'siang' | 'sore' | 'malam';

export interface WorldTimeState {
  tick: number;
  phase: DayPhaseId;
  phaseLabel: string;
  dayCount: number;
  phaseRemainingSec: number;
  nightMonsterCount: number;
  nightWaveDefeated?: number;
  nightWaveTotal?: number;
  surfaceMonsterCount?: number;
  surfaceWaveDefeated?: number;
  surfaceWaveTotal?: number;
}

export interface RpgHudSnapshot {
  phase: GamePhase;
  worldMode: WorldLocationMode;
  cameraMode: CameraMode;
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  diamonds: number;
  score: number;
  streak: number;
  maxStreak: number;
  dailyCount: number;
  dailyGoal: number;
  activeWeapon: WeaponId;
  activeHotbarSlot: number;
  ownedWeapons: WeaponId[];
  weaponAmmo: Record<WeaponId, number>;
  starterWeaponPicked: boolean;
  starterWeaponGuide: {
    distance: number;
    angleDeg: number;
    directionLabel: string;
  } | null;
  radarState: RadarState | null;
  ownedRelics: RelicId[];
  crowns: number;
  ribbons: ZoneId[];
  monstersDefeated: number;
  wordsMastered: number;
  wordsSeen: number;
  learnedVocabIds: string[];
  wordProgress: Record<string, WordProgress>;
  wordMastery: Record<string, number>;
  activeZoneId: ZoneId;
  activeZoneName: string;
  rankTitle: string;
  nearbyNpcId: string | null;
  nearbyMonsterId: string | null;
  nearbyDoorIndex: number | null;
  nearbyDungeonGuardian: boolean;
  nearPrisonKey: boolean;
  nearHiddenPrison: boolean;
  nearPortal: boolean;
  nearDungeonExit: boolean;
  portalUnlocked: boolean;
  dungeonState: DungeonZoneState | null;
  areaMonsterStats: AreaMonsterStats;
  liberatedZones: ZoneId[];
  areaDoorsCleared: Record<ZoneId, number[]>;
  ieltsScores: Record<'listening' | 'reading' | 'writing' | 'speaking' | 'full', number>;
  quests: RpgQuestState[];
  projectedLabels: ProjectedLabel[];
  bannerMessage: string | null;
  storyDialog: StoryDialogState | null;
  settings: GameSettings;
  hasSavedGame: boolean;
  caveTorchesLeft: number;
  caveShieldBlocksLeft: number;
  caveTntLeft: number;
  pickaxeTier: PickaxeTier;
  nearCraftingTable: boolean;
  caveBlocksMined: number;
  targetedBlock: {
    id: string;
    kind: CaveBlockKind;
    label: string;
    hp: number;
    maxHp: number;
  } | null;
  isAiming: boolean;
  hitMarkerKind: 'none' | 'hit' | 'kill';
  crosshairOnEnemy: boolean;
  crosshairSpread: number;
  pointerLocked: boolean;
  isSwimming?: boolean;
  swimStylePreference?: SwimStylePreference;
  activeSwimStyle?: SwimStyleId;
  oceanSurvival?: OceanSurvivalState | null;
  worldTime: WorldTimeState;
}

export interface LeaderboardRecord {
  uid: string;
  playerName: string;
  score: number;
  cityLevel: number;
  landmarksCount: number;
  maxCombo: number;
  districtTitle: string;
  updatedAt?: unknown;
}

export interface UserProfileRecord {
  uid: string;
  playerName: string;
  bestScore: number;
  highestLevel: number;
  totalBuilt: number;
  questsCompleted: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}
