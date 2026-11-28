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
  unlimitedOxygen?: boolean;
}

export type WeaponId =
  | 'ketapel'
  | 'kerikil'
  | 'emas'
  | 'saus'
  | 'biji'
  | 'kertas'
  | 'jarum'
  | 'kristal'
  | 'harpun';

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
  y?: number;
  z: number;
  rotY?: number;
  minPct: number;
}

export type BossSpecialMechanic = 'none' | 'slime' | 'grow' | 'close' | 'rewind';

export interface BossDef {
  id: string;
  name: string;
  monsterType: MonsterType;
  zoneId: ZoneId;
  phases: number; // 1
  hpPerPhase: number; // 15 tantangan dalam 1 ronde bos
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
  ageYears?: number;
  habitSummary?: string;
  skillSummary?: string;
  stats?: { hp: number; atk: number; nrg: number };
  shiftRole?: 'day' | 'night';
  partnerNpcId?: string;
  dayNpcId?: string;
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
  isBossMinion?: boolean;
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

export interface CaptiveMemberSpec {
  id: string;
  name: string;
  kind: 'girl' | 'mother' | 'fox_kit' | 'student' | 'spirit';
  color: number;
  scale?: number;
  hairColor?: number;
  hideRibbon?: boolean;
}

export interface CavePrisonCellHudState {
  id: string;
  label: string;
  unlocked: boolean;
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
  prisonCells?: CavePrisonCellHudState[];
  nearPrisonCellId?: string | null;
  nearPrisonCellLabel?: string | null;
  captiveName: string;
  guardianName: string;
  liberated: boolean;
  caveRibbonCollected?: boolean;
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
  captiveRescued?: boolean;
  zoneIslandRemaining?: number;
  zoneIslandTotal?: number;
}

export interface ProjectedLabel {
  id: string;
  x: number;
  y: number;
  title: string;
  kind: 'zone' | 'npc_alert' | 'speech' | 'thought' | 'portal' | 'monster' | 'door' | 'pickup' | 'player';
  subtext?: string;
}

export interface StoryDialogState {
  kind:
    | 'prologue'
    | 'opening'
    | 'owl_depart'
    | 'village_ambush'
    | 'village_rescue_talk'
    | 'village_rescue_escort'
    | 'area_cleared'
    | 'defeat_exit'
    | 'dungeon_intro'
    | 'dungeon_prison_torment'
    | 'dungeon_boss_summon'
    | 'dungeon_boss_solo_rage'
    | 'dungeon_prison_plea'
    | 'dungeon_rescue'
    | 'dungeon_reunion_exit'
    | 'cave_guardian';
  step: number;
  maxStep?: number;
  sceneTitle?: string;
  zoneId?: ZoneId;
  speakerName: string;
  speakerRole: string;
  textEn: string;
  textId: string;
  accentColor: string;
  speakerKind?: 'hero' | 'npc' | 'captive' | 'owl' | 'villagers' | 'boss';
  speakerNpcId?: string;
  speakerMonsterType?: MonsterType;
  dungeonIntroBeat?: 'emerge' | 'boss_taunt' | 'hero_reply' | 'boss_farewell' | 'retreat' | 'guardian';
  dungeonPrisonTormentBeat?:
    | 'cell_1_threat'
    | 'cell_1_cry'
    | 'cell_2_threat'
    | 'cell_2_cry'
    | 'cell_3_threat'
    | 'cell_3_cry';
  dungeonBossSummonBeat?:
    | 'emerge_shock'
    | 'boss_shock_talk'
    | 'guard_angry_talk'
    | 'boss_furious_summon';
  dungeonBossSoloBeat?:
    | 'rage_erupt'
    | 'boss_threat'
    | 'hero_sharp_retort'
    | 'boss_shaken_clash';
  dungeonPrisonPleaBeat?:
    | 'discover'
    | 'captive_cry_plea'
    | 'hero_promise'
    | 'captive_hope';
  bossExpression?: 'laugh' | 'taunt' | 'menace' | 'shock' | 'angry';
  heroExpression?: 'neutral' | 'fierce';
  captiveExpression?: 'neutral' | 'sad_injured' | 'happy';
  villagerArchetypes?: string[];
  captiveKind?: 'girl' | 'mother' | 'fox_kit' | 'student' | 'spirit';
  captiveColor?: number;
  captiveMembers?: CaptiveMemberSpec[];
  speakerSide?: 'npc' | 'hero';
  ribbonName?: string;
  ribbonQuote?: string;
  sageQuote?: string;
  rewardSummary?: string;
  defeatReason?: string;
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
  | 'swimsuit'
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
  | 'collectible'
  | 'door'
  | 'exit'
  | 'hero_friend'
  | 'car'
  | 'plane'
  | 'airbase';

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
  swimSuitPicked: boolean;
  swimSuitGuide: {
    distance: number;
    angleDeg: number;
    directionLabel: string;
  } | null;
  nearSeaShore?: boolean;
  diveTransitionStage?: 'idle' | 'swim_to_water' | 'plunge' | 'submerge' | 'surface';
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
  guardianTalkTutorial?: boolean;
  nearbyOverworldZoneDoor: ZoneId | null;
  nightPermittedZones: ZoneId[];
  nearbyMonsterId: string | null;
  nearbyDoorIndex: number | null;
  nearbyDungeonGuardian: boolean;
  nearPrisonKey: boolean;
  nearHiddenPrison: boolean;
  nearCaveRibbon?: boolean;
  nearIslandRibbonZone?: ZoneId | null;
  nearIslandRibbonLocked?: boolean;
  nearPortal: boolean;
  nearDungeonExit: boolean;
  portalUnlocked: boolean;
  dungeonState: DungeonZoneState | null;
  areaMonsterStats: AreaMonsterStats;
  liberatedZones: ZoneId[];
  captiveRescuedZones?: ZoneId[];
  areaDoorsCleared: Record<ZoneId, number[]>;
  ieltsScores: Record<'listening' | 'reading' | 'writing' | 'speaking' | 'full', number>;
  quests: RpgQuestState[];
  projectedLabels: ProjectedLabel[];
  bannerMessage: string | null;
  caveCountdown?: {
    step: 3 | 2 | 1 | 'go';
    zoneName: string;
  } | null;
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
  damageFlashSeq?: number;
  lastDamageAmount?: number;
  lastDamageDir?: 'front' | 'back' | 'left' | 'right' | 'center';
  defeatReason?: string | null;
  crosshairOnEnemy: boolean;
  crosshairSpread: number;
  pointerLocked: boolean;
  isSwimming?: boolean;
  swimStylePreference?: SwimStylePreference;
  activeSwimStyle?: SwimStyleId;
  oceanSurvival?: OceanSurvivalState | null;
  worldTime: WorldTimeState;
  nearbyInjuredPeer?: NearbyInjuredPeer | null;
  allyHelpCooldownSec?: number;
  squadName?: string;
  waveMission?: WaveMissionState | null;
  localMabarStats?: {
    kills: number;
    assists: number;
    helps: number;
    challenges: number;
    zonesCleared: number;
  };
  carState?: CarHudState | null;
  planeState?: PlaneHudState | null;
}

export type PlaneVariant = 'garuda' | 'rajawali' | 'elang';
export type PlaneMode = 'none' | 'entering' | 'taxi' | 'flying' | 'exiting';
export type PlaneAmmoType = 'vulcan' | 'missile' | 'bomb' | 'plasma';

export interface PlaneHudState {
  available: boolean;
  mode: PlaneMode;
  nearPlane: boolean;
  planeId?: string;
  planeName?: string;
  variant?: PlaneVariant;
  speedKmh: number;
  altitudeMeters: number;
  canTakeoff: boolean;
  canLand: boolean;
  turboActive: boolean;
  activeAmmo: PlaneAmmoType;
  ammoCounts: Record<PlaneAmmoType, number>;
  lockedTargetName?: string | null;
  nearestAirbaseName?: string | null;
}

export interface CarHudState {
  available: boolean;
  nearCar: boolean;
  carName?: string;
  mode: 'none' | 'entering' | 'driving' | 'exiting';
  speedKmh: number;
  gear: 'R' | 'N' | 'D';
  headlightsOn: boolean;
  handbrakeOn: boolean;
  braking: boolean;
  turboActive: boolean;
  distanceMeters: number;
}

export interface WaveMonsterGroupSummary {
  type: MonsterType;
  name: string;
  tier: 'small' | 'medium' | 'large' | 'giant';
  tierLabel: string;
  count: number;
  quizCount: number;
  combatCount: number;
}

export interface WaveMissionState {
  seed: number;
  squadName: string;
  total: number;
  defeated: number;
  remaining: number;
  quizTotal: number;
  combatTotal: number;
  completed: boolean;
  monsterGroups: WaveMonsterGroupSummary[];
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

export type CharacterPresetId =
  | 'hoot_emerald'
  | 'aria_sky'
  | 'karsa_crimson'
  | 'raka_gold'
  | 'luna_violet'
  | 'nusa_teal';

export interface HeroAppearanceColors {
  tunicHex: number;
  pantsHex: number;
  hatHex: number;
  skinHex: number;
  packHex: number;
  featherHex: number;
}

export interface CharacterPreset {
  id: CharacterPresetId;
  name: string;
  roleTitle: string;
  ageLabel: string;
  ageYears: number;
  gender: 'male' | 'female';
  tagline: string;
  perkText: string;
  hpStat: number;
  atkStat: number;
  nrgStat: number;
  badgeColor: string;
  colors: HeroAppearanceColors;
}

export interface SpawnPointDef {
  id: string;
  label: string;
  x: number;
  z: number;
  yaw: number;
}

export type PlayModeType = 'solo' | 'multiplayer_group' | 'multiplayer_public';
export type SpawnPreference = 'default' | 'random';
export type MultiplayerRoomMode = 'group' | 'public';
export type MultiplayerRoomStatus = 'waiting' | 'playing';

export interface MultiplayerRoomDoc {
  roomId: string;
  code: string;
  mode: MultiplayerRoomMode;
  status: MultiplayerRoomStatus;
  hostUid: string;
  hostName: string;
  groupName?: string;
  difficulty: DifficultyMode;
  maxPlayers: number;
  memberCount: number;
  waveSeed?: number;
  waveCount?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MultiplayerMemberDoc {
  uid: string;
  roomId: string;
  displayName: string;
  characterId: CharacterPresetId;
  spawnIndex: number;
  isHost: boolean;
  online: boolean;
  joinedAt?: unknown;
  updatedAt?: unknown;
}

export interface WebRtcSignalDoc {
  id?: string;
  roomId: string;
  fromUid: string;
  toUid: string;
  kind: 'offer' | 'answer' | 'ice';
  payload: string;
  createdAt?: unknown;
}

export interface RoomChatMessage {
  id: string;
  roomId: string;
  senderUid: string;
  senderName: string;
  text: string;
  createdAtMs: number;
  source: 'p2p' | 'firestore' | 'system';
}

export interface NearbyInjuredPeer {
  uid: string;
  displayName: string;
  hp: number;
  maxHp: number;
  distance: number;
}

export interface MultiplayerPlayerStats {
  uid: string;
  displayName: string;
  characterId: CharacterPresetId;
  kills: number;
  assists: number;
  helps: number;
  challenges: number;
  zonesCleared: number;
  personalScore: number;
  hp: number;
  maxHp: number;
  worldMode: WorldLocationMode;
  zoneName: string;
  inChallenge: boolean;
  updatedAtMs: number;
}

export interface SyncMonsterSnapshot {
  id: string;
  tp: MonsterType;
  nm: string;
  zn: ZoneId;
  x: number;
  y: number;
  z: number;
  hx: number;
  hz: number;
  yaw: number;
  hp: number;
  mhp: number;
  shp?: number;
  cmb: boolean;
  ngt?: boolean;
  sea?: boolean;
  sky?: boolean;
  wids?: string[];
  rxp: number;
  rdm: number;
  rsc: number;
  al: boolean;
  agg?: boolean;
  sb?: boolean;
}

export interface SyncShooterSnapshot {
  id: string;
  x: number;
  z: number;
  hx: number;
  hz: number;
  zn?: ZoneId;
  hp: number;
  al: boolean;
  ngt?: boolean;
}

export interface RemotePlayerState {
  uid: string;
  displayName: string;
  characterId: CharacterPresetId;
  worldMode: WorldLocationMode;
  x: number;
  y: number;
  z: number;
  yaw: number;
  speed: number;
  walkCycle: number;
  onGround: boolean;
  isSwimming: boolean;
  activeWeapon: WeaponId;
  weaponOwned: boolean;
  aimPitch: number;
  hp?: number;
  maxHp?: number;
  inChallenge?: boolean;
  zoneName?: string;
  speaking?: boolean;
  lastChatText?: string;
  lastChatAt?: number;
  updatedAtMs: number;
}

export interface LocalPlayerSyncPacket {
  t: 'state';
  w: WorldLocationMode;
  x: number;
  y: number;
  z: number;
  yaw: number;
  spd: number;
  wc: number;
  og: boolean;
  sw: boolean;
  wp: WeaponId;
  wo: boolean;
  ap: number;
  ch: CharacterPresetId;
  nm: string;
  hp?: number;
  mhp?: number;
  ic?: boolean;
  zn?: string;
}

export type P2pReliableMessage =
  | {
      t: 'wsync';
      day: number;
      tick: number;
      mode: 'day' | 'night';
      wtot: number;
      ws?: number;
      wc?: number;
      wcmp?: boolean;
      sq?: string;
      nseq: number;
      m: SyncMonsterSnapshot[];
      s: SyncShooterSnapshot[];
      lz: ZoneId[];
      dbz: ZoneId[];
      dc: Record<ZoneId, number[]>;
    }
  | {
      t: 'msync';
      m: Array<{
        id: string;
        x: number;
        y: number;
        z: number;
        yaw: number;
        hp: number;
        al: boolean;
        agg?: boolean;
      }>;
      s: Array<{ id: string; x: number; z: number; hp: number; al: boolean }>;
    }
  | {
      t: 'm_hit';
      id: string;
      dmg: number;
      dx: number;
      dz: number;
      md: WorldLocationMode;
      zn?: ZoneId;
      isSh?: boolean;
    }
  | {
      t: 'm_kill';
      id: string;
      killerUid: string;
      killerName: string;
      assists: string[];
      isSh?: boolean;
      isQuiz?: boolean;
      md: WorldLocationMode;
      zn?: ZoneId;
    }
  | {
      t: 'shot';
      fp?: boolean;
      wid?: WeaponId;
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      col: number;
      dmg: number;
      md: WorldLocationMode;
    }
  | {
      t: 'heal';
      toUid: string;
      amt: number;
      fromName: string;
    }
  | {
      t: 'prog';
      lz: ZoneId[];
      dbz: ZoneId[];
      dc: Record<ZoneId, number[]>;
    }
  | {
      t: 'clock';
      day: number;
      tick: number;
      mode: 'day' | 'night';
      wtot: number;
      wcmp?: boolean;
    }
  | {
      t: 'stats';
      st: MultiplayerPlayerStats;
    }
  | {
      t: 'wreq';
    }
  | {
      t: 'leave';
      nm?: string;
    };


