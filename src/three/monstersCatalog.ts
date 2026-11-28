import * as THREE from 'three';
import { MonsterType, WeaponId, ZoneId } from '../types/game';
import { MaterialPalette } from './materials';

export type MonsterTier = 'small' | 'medium' | 'large' | 'giant';

export interface MonsterSheetSpec {
  id: MonsterType;
  sheetNumber: number;
  name: string;
  tier: MonsterTier;
  tierLabel: string;
  stats: { hp: number; atk: number; nrg: number };
  baseScale: number;
  arenaScale: number;
  hitHp: number;
  quizHp: number;
  stanceHp: number;
  atkDamageHearts: number;
  rewardXp: number;
  rewardDiamonds: number;
  rewardScore: number;
  speedMult: number;
  aggroRange: number;
  hoverY: number;
  ranged: boolean;
  hitRadius: number;
  hitCenterY: number;
  hitHalfH: number;
  isSeaMonster?: boolean;
  isSkyMonster?: boolean;
  effectiveWeapons?: WeaponId[];
}

export const MONSTER_SPECS: Record<MonsterType, MonsterSheetSpec> = {
  forest_slime: {
    id: 'forest_slime',
    sheetNumber: 1,
    name: 'Forest Slime',
    tier: 'small',
    tierLabel: 'Kecil',
    stats: { hp: 50, atk: 10, nrg: 30 },
    baseScale: 0.78,
    arenaScale: 0.96,
    hitHp: 2,
    quizHp: 2,
    stanceHp: 2,
    atkDamageHearts: 1,
    rewardXp: 14,
    rewardDiamonds: 1,
    rewardScore: 140,
    speedMult: 0.95,
    aggroRange: 13.5,
    hoverY: 0,
    ranged: false,
    hitRadius: 1.45,
    hitCenterY: 0.72,
    hitHalfH: 1.15,
  },
  poison_beetle: {
    id: 'poison_beetle',
    sheetNumber: 2,
    name: 'Poison Beetle',
    tier: 'small',
    tierLabel: 'Kecil',
    stats: { hp: 70, atk: 15, nrg: 40 },
    baseScale: 0.82,
    arenaScale: 0.96,
    hitHp: 2,
    quizHp: 2,
    stanceHp: 2,
    atkDamageHearts: 1,
    rewardXp: 16,
    rewardDiamonds: 1,
    rewardScore: 160,
    speedMult: 1.08,
    aggroRange: 14.0,
    hoverY: 0,
    ranged: false,
    hitRadius: 1.5,
    hitCenterY: 0.7,
    hitHalfH: 1.15,
  },
  cave_spider: {
    id: 'cave_spider',
    sheetNumber: 3,
    name: 'Cave Spider',
    tier: 'small',
    tierLabel: 'Kecil',
    stats: { hp: 90, atk: 22, nrg: 55 },
    baseScale: 0.86,
    arenaScale: 0.94,
    hitHp: 3,
    quizHp: 2,
    stanceHp: 2,
    atkDamageHearts: 1,
    rewardXp: 18,
    rewardDiamonds: 1,
    rewardScore: 180,
    speedMult: 1.16,
    aggroRange: 15.0,
    hoverY: 0,
    ranged: false,
    hitRadius: 1.65,
    hitCenterY: 0.75,
    hitHalfH: 1.2,
  },
  thorn_goblin: {
    id: 'thorn_goblin',
    sheetNumber: 4,
    name: 'Thorn Goblin',
    tier: 'small',
    tierLabel: 'Kecil',
    stats: { hp: 120, atk: 28, nrg: 60 },
    baseScale: 0.88,
    arenaScale: 0.98,
    hitHp: 3,
    quizHp: 2,
    stanceHp: 2,
    atkDamageHearts: 1,
    rewardXp: 20,
    rewardDiamonds: 1,
    rewardScore: 200,
    speedMult: 1.12,
    aggroRange: 15.5,
    hoverY: 0,
    ranged: false,
    hitRadius: 1.55,
    hitCenterY: 1.0,
    hitHalfH: 1.4,
  },
  wild_boar: {
    id: 'wild_boar',
    sheetNumber: 5,
    name: 'Wild Boar',
    tier: 'small',
    tierLabel: 'Kecil',
    stats: { hp: 160, atk: 35, nrg: 75 },
    baseScale: 0.94,
    arenaScale: 0.96,
    hitHp: 4,
    quizHp: 2,
    stanceHp: 2,
    atkDamageHearts: 1,
    rewardXp: 22,
    rewardDiamonds: 1,
    rewardScore: 220,
    speedMult: 1.15,
    aggroRange: 16.0,
    hoverY: 0,
    ranged: false,
    hitRadius: 1.7,
    hitCenterY: 0.92,
    hitHalfH: 1.35,
  },
  dire_wolf: {
    id: 'dire_wolf',
    sheetNumber: 6,
    name: 'Dire Wolf',
    tier: 'medium',
    tierLabel: 'Sedang',
    stats: { hp: 210, atk: 45, nrg: 90 },
    baseScale: 1.02,
    arenaScale: 0.96,
    hitHp: 4,
    quizHp: 3,
    stanceHp: 3,
    atkDamageHearts: 1,
    rewardXp: 25,
    rewardDiamonds: 1,
    rewardScore: 250,
    speedMult: 1.2,
    aggroRange: 17.5,
    hoverY: 0,
    ranged: false,
    hitRadius: 1.75,
    hitCenterY: 1.05,
    hitHalfH: 1.45,
  },
  skeleton_warrior: {
    id: 'skeleton_warrior',
    sheetNumber: 7,
    name: 'Skeleton Warrior',
    tier: 'medium',
    tierLabel: 'Sedang',
    stats: { hp: 250, atk: 52, nrg: 80 },
    baseScale: 1.0,
    arenaScale: 0.98,
    hitHp: 5,
    quizHp: 3,
    stanceHp: 3,
    atkDamageHearts: 1,
    rewardXp: 28,
    rewardDiamonds: 1,
    rewardScore: 270,
    speedMult: 1.04,
    aggroRange: 16.5,
    hoverY: 0,
    ranged: false,
    hitRadius: 1.7,
    hitCenterY: 1.25,
    hitHalfH: 1.65,
  },
  swamp_lizardman: {
    id: 'swamp_lizardman',
    sheetNumber: 8,
    name: 'Swamp Lizardman',
    tier: 'medium',
    tierLabel: 'Sedang',
    stats: { hp: 310, atk: 60, nrg: 100 },
    baseScale: 1.06,
    arenaScale: 0.95,
    hitHp: 5,
    quizHp: 3,
    stanceHp: 3,
    atkDamageHearts: 1,
    rewardXp: 30,
    rewardDiamonds: 1,
    rewardScore: 290,
    speedMult: 1.06,
    aggroRange: 16.5,
    hoverY: 0,
    ranged: false,
    hitRadius: 1.78,
    hitCenterY: 1.3,
    hitHalfH: 1.7,
  },
  sand_scorpion: {
    id: 'sand_scorpion',
    sheetNumber: 9,
    name: 'Sand Scorpion',
    tier: 'medium',
    tierLabel: 'Sedang',
    stats: { hp: 380, atk: 72, nrg: 110 },
    baseScale: 1.08,
    arenaScale: 0.94,
    hitHp: 6,
    quizHp: 3,
    stanceHp: 3,
    atkDamageHearts: 1,
    rewardXp: 34,
    rewardDiamonds: 2,
    rewardScore: 320,
    speedMult: 1.08,
    aggroRange: 17.0,
    hoverY: 0,
    ranged: true,
    hitRadius: 1.85,
    hitCenterY: 1.15,
    hitHalfH: 1.6,
  },
  lava_imp: {
    id: 'lava_imp',
    sheetNumber: 10,
    name: 'Lava Imp',
    tier: 'medium',
    tierLabel: 'Sedang',
    stats: { hp: 440, atk: 85, nrg: 130 },
    baseScale: 0.98,
    arenaScale: 0.96,
    hitHp: 5,
    quizHp: 3,
    stanceHp: 3,
    atkDamageHearts: 1,
    rewardXp: 36,
    rewardDiamonds: 2,
    rewardScore: 350,
    speedMult: 1.14,
    aggroRange: 18.0,
    hoverY: 0.9,
    ranged: true,
    hitRadius: 1.75,
    hitCenterY: 1.35,
    hitHalfH: 1.75,
  },
  stone_gargoyle: {
    id: 'stone_gargoyle',
    sheetNumber: 11,
    name: 'Stone Gargoyle',
    tier: 'large',
    tierLabel: 'Besar',
    stats: { hp: 550, atk: 95, nrg: 120 },
    baseScale: 1.16,
    arenaScale: 0.9,
    hitHp: 7,
    quizHp: 4,
    stanceHp: 3,
    atkDamageHearts: 1,
    rewardXp: 42,
    rewardDiamonds: 2,
    rewardScore: 400,
    speedMult: 1.0,
    aggroRange: 17.5,
    hoverY: 0.35,
    ranged: true,
    hitRadius: 2.0,
    hitCenterY: 1.45,
    hitHalfH: 1.95,
  },
  jungle_troll: {
    id: 'jungle_troll',
    sheetNumber: 12,
    name: 'Jungle Troll',
    tier: 'large',
    tierLabel: 'Besar',
    stats: { hp: 680, atk: 115, nrg: 140 },
    baseScale: 1.22,
    arenaScale: 0.86,
    hitHp: 7,
    quizHp: 4,
    stanceHp: 3,
    atkDamageHearts: 1,
    rewardXp: 46,
    rewardDiamonds: 2,
    rewardScore: 440,
    speedMult: 0.94,
    aggroRange: 17.0,
    hoverY: 0,
    ranged: false,
    hitRadius: 2.1,
    hitCenterY: 1.55,
    hitHalfH: 2.1,
  },
  crystal_golem: {
    id: 'crystal_golem',
    sheetNumber: 13,
    name: 'Crystal Golem',
    tier: 'large',
    tierLabel: 'Besar',
    stats: { hp: 850, atk: 130, nrg: 160 },
    baseScale: 1.26,
    arenaScale: 0.84,
    hitHp: 8,
    quizHp: 4,
    stanceHp: 3,
    atkDamageHearts: 1,
    rewardXp: 52,
    rewardDiamonds: 2,
    rewardScore: 480,
    speedMult: 0.88,
    aggroRange: 17.5,
    hoverY: 0,
    ranged: true,
    hitRadius: 2.2,
    hitCenterY: 1.65,
    hitHalfH: 2.2,
  },
  minotaur_brute: {
    id: 'minotaur_brute',
    sheetNumber: 14,
    name: 'Minotaur Brute',
    tier: 'large',
    tierLabel: 'Besar',
    stats: { hp: 1050, atk: 155, nrg: 175 },
    baseScale: 1.32,
    arenaScale: 0.82,
    hitHp: 9,
    quizHp: 4,
    stanceHp: 4,
    atkDamageHearts: 1,
    rewardXp: 58,
    rewardDiamonds: 2,
    rewardScore: 540,
    speedMult: 0.94,
    aggroRange: 18.0,
    hoverY: 0,
    ranged: false,
    hitRadius: 2.25,
    hitCenterY: 1.75,
    hitHalfH: 2.3,
  },
  magma_elemental: {
    id: 'magma_elemental',
    sheetNumber: 15,
    name: 'Magma Elemental',
    tier: 'large',
    tierLabel: 'Besar',
    stats: { hp: 1300, atk: 180, nrg: 210 },
    baseScale: 1.36,
    arenaScale: 0.8,
    hitHp: 9,
    quizHp: 4,
    stanceHp: 4,
    atkDamageHearts: 1,
    rewardXp: 64,
    rewardDiamonds: 3,
    rewardScore: 600,
    speedMult: 0.9,
    aggroRange: 18.5,
    hoverY: 0.15,
    ranged: true,
    hitRadius: 2.3,
    hitCenterY: 1.85,
    hitHalfH: 2.4,
  },
  frost_ogre: {
    id: 'frost_ogre',
    sheetNumber: 16,
    name: 'Frost Ogre',
    tier: 'giant',
    tierLabel: 'Raksasa',
    stats: { hp: 1600, atk: 210, nrg: 200 },
    baseScale: 1.44,
    arenaScale: 0.76,
    hitHp: 10,
    quizHp: 5,
    stanceHp: 4,
    atkDamageHearts: 2,
    rewardXp: 70,
    rewardDiamonds: 3,
    rewardScore: 680,
    speedMult: 0.85,
    aggroRange: 18.0,
    hoverY: 0,
    ranged: false,
    hitRadius: 2.4,
    hitCenterY: 1.95,
    hitHalfH: 2.55,
  },
  iron_juggernaut: {
    id: 'iron_juggernaut',
    sheetNumber: 17,
    name: 'Iron Juggernaut',
    tier: 'giant',
    tierLabel: 'Raksasa',
    stats: { hp: 1900, atk: 245, nrg: 230 },
    baseScale: 1.48,
    arenaScale: 0.74,
    hitHp: 11,
    quizHp: 5,
    stanceHp: 4,
    atkDamageHearts: 2,
    rewardXp: 76,
    rewardDiamonds: 3,
    rewardScore: 740,
    speedMult: 0.82,
    aggroRange: 18.0,
    hoverY: 0,
    ranged: false,
    hitRadius: 2.45,
    hitCenterY: 2.0,
    hitHalfH: 2.6,
  },
  ancient_treant: {
    id: 'ancient_treant',
    sheetNumber: 18,
    name: 'Ancient Treant',
    tier: 'giant',
    tierLabel: 'Raksasa',
    stats: { hp: 2200, atk: 270, nrg: 280 },
    baseScale: 1.54,
    arenaScale: 0.7,
    hitHp: 11,
    quizHp: 5,
    stanceHp: 4,
    atkDamageHearts: 2,
    rewardXp: 82,
    rewardDiamonds: 3,
    rewardScore: 820,
    speedMult: 0.78,
    aggroRange: 18.5,
    hoverY: 0,
    ranged: true,
    hitRadius: 2.55,
    hitCenterY: 2.2,
    hitHalfH: 2.9,
  },
  obsidian_hydra: {
    id: 'obsidian_hydra',
    sheetNumber: 19,
    name: 'Obsidian Hydra',
    tier: 'giant',
    tierLabel: 'Raksasa',
    stats: { hp: 2600, atk: 320, nrg: 340 },
    baseScale: 1.6,
    arenaScale: 0.68,
    hitHp: 12,
    quizHp: 5,
    stanceHp: 4,
    atkDamageHearts: 2,
    rewardXp: 90,
    rewardDiamonds: 4,
    rewardScore: 920,
    speedMult: 0.84,
    aggroRange: 19.5,
    hoverY: 0.12,
    ranged: true,
    hitRadius: 2.65,
    hitCenterY: 2.15,
    hitHalfH: 2.85,
  },
  titan_colossus: {
    id: 'titan_colossus',
    sheetNumber: 20,
    name: 'Titan Colossus',
    tier: 'giant',
    tierLabel: 'Raksasa',
    stats: { hp: 3200, atk: 450, nrg: 500 },
    baseScale: 1.7,
    arenaScale: 0.65,
    hitHp: 13,
    quizHp: 5,
    stanceHp: 4,
    atkDamageHearts: 2,
    rewardXp: 105,
    rewardDiamonds: 4,
    rewardScore: 1100,
    speedMult: 0.76,
    aggroRange: 20.0,
    hoverY: 0,
    ranged: true,
    hitRadius: 2.75,
    hitCenterY: 2.35,
    hitHalfH: 3.1,
  },
  goring_shark: {
    id: 'goring_shark',
    sheetNumber: 21,
    name: 'Goring Shark (Hiu Ganas)',
    tier: 'large',
    tierLabel: 'Monster Laut · Ganas',
    stats: { hp: 520, atk: 120, nrg: 140 },
    baseScale: 1.35,
    arenaScale: 0.9,
    hitHp: 6,
    quizHp: 3,
    stanceHp: 3,
    atkDamageHearts: 1,
    rewardXp: 48,
    rewardDiamonds: 2,
    rewardScore: 460,
    speedMult: 1.32,
    aggroRange: 25.0,
    hoverY: -0.15,
    ranged: false,
    hitRadius: 2.35,
    hitCenterY: 0.75,
    hitHalfH: 1.65,
    isSeaMonster: true,
    effectiveWeapons: ['emas', 'saus', 'biji', 'kertas', 'jarum', 'kristal', 'harpun'],
  },
  abyssal_kraken: {
    id: 'abyssal_kraken',
    sheetNumber: 22,
    name: 'Abyssal Kraken',
    tier: 'giant',
    tierLabel: 'Monster Laut · Raksasa',
    stats: { hp: 1400, atk: 240, nrg: 260 },
    baseScale: 1.45,
    arenaScale: 0.78,
    hitHp: 11,
    quizHp: 4,
    stanceHp: 4,
    atkDamageHearts: 2,
    rewardXp: 85,
    rewardDiamonds: 4,
    rewardScore: 860,
    speedMult: 0.76,
    aggroRange: 24.0,
    hoverY: 0.0,
    ranged: true,
    hitRadius: 2.9,
    hitCenterY: 1.9,
    hitHalfH: 2.8,
    isSeaMonster: true,
    effectiveWeapons: ['biji', 'kertas', 'jarum', 'kristal', 'harpun'],
  },
  electric_eel_drakon: {
    id: 'electric_eel_drakon',
    sheetNumber: 23,
    name: 'Electric Eel-Drakon',
    tier: 'large',
    tierLabel: 'Monster Laut · Listrik',
    stats: { hp: 780, atk: 155, nrg: 210 },
    baseScale: 1.3,
    arenaScale: 0.85,
    hitHp: 7,
    quizHp: 3,
    stanceHp: 3,
    atkDamageHearts: 1,
    rewardXp: 58,
    rewardDiamonds: 3,
    rewardScore: 560,
    speedMult: 1.24,
    aggroRange: 25.0,
    hoverY: 0.06,
    ranged: true,
    hitRadius: 2.45,
    hitCenterY: 0.95,
    hitHalfH: 1.75,
    isSeaMonster: true,
    effectiveWeapons: ['saus', 'biji', 'kertas', 'jarum', 'kristal', 'harpun'],
  },
  leviathan_serpent: {
    id: 'leviathan_serpent',
    sheetNumber: 24,
    name: 'Leviathan Serpent',
    tier: 'giant',
    tierLabel: 'Monster Laut · Raksasa',
    stats: { hp: 1650, atk: 260, nrg: 280 },
    baseScale: 1.5,
    arenaScale: 0.76,
    hitHp: 12,
    quizHp: 4,
    stanceHp: 4,
    atkDamageHearts: 2,
    rewardXp: 95,
    rewardDiamonds: 5,
    rewardScore: 950,
    speedMult: 1.08,
    aggroRange: 27.0,
    hoverY: -0.05,
    ranged: true,
    hitRadius: 2.85,
    hitCenterY: 2.0,
    hitHalfH: 2.85,
    isSeaMonster: true,
    effectiveWeapons: ['biji', 'kertas', 'jarum', 'kristal', 'harpun'],
  },
  venomous_box_jelly: {
    id: 'venomous_box_jelly',
    sheetNumber: 25,
    name: 'Venomous Box Jelly (Ubur-Ubur Maut)',
    tier: 'medium',
    tierLabel: 'Monster Laut · Racun',
    stats: { hp: 410, atk: 110, nrg: 180 },
    baseScale: 1.25,
    arenaScale: 0.92,
    hitHp: 5,
    quizHp: 3,
    stanceHp: 3,
    atkDamageHearts: 1,
    rewardXp: 42,
    rewardDiamonds: 2,
    rewardScore: 410,
    speedMult: 0.88,
    aggroRange: 20.5,
    hoverY: 1.15,
    ranged: true,
    hitRadius: 1.95,
    hitCenterY: 1.15,
    hitHalfH: 1.95,
    isSeaMonster: true,
    effectiveWeapons: ['emas', 'saus', 'biji', 'kertas', 'jarum', 'kristal', 'harpun'],
  },
  giant_bone_jaw: {
    id: 'giant_bone_jaw',
    sheetNumber: 26,
    name: 'Giant Bone-Jaw (Ikan Purba)',
    tier: 'medium',
    tierLabel: 'Monster Laut · Zirah',
    stats: { hp: 620, atk: 145, nrg: 130 },
    baseScale: 1.28,
    arenaScale: 0.9,
    hitHp: 6,
    quizHp: 3,
    stanceHp: 3,
    atkDamageHearts: 1,
    rewardXp: 50,
    rewardDiamonds: 2,
    rewardScore: 480,
    speedMult: 1.18,
    aggroRange: 23.0,
    hoverY: -0.1,
    ranged: false,
    hitRadius: 2.1,
    hitCenterY: 0.72,
    hitHalfH: 1.6,
    isSeaMonster: true,
    effectiveWeapons: ['emas', 'saus', 'biji', 'kertas', 'jarum', 'kristal', 'harpun'],
  },
  toxic_sea_viper: {
    id: 'toxic_sea_viper',
    sheetNumber: 27,
    name: 'Toxic Sea Viper (Naga Laut Beracun)',
    tier: 'large',
    tierLabel: 'Monster Laut · Racun',
    stats: { hp: 820, atk: 165, nrg: 200 },
    baseScale: 1.34,
    arenaScale: 0.84,
    hitHp: 7,
    quizHp: 3,
    stanceHp: 3,
    atkDamageHearts: 1,
    rewardXp: 60,
    rewardDiamonds: 3,
    rewardScore: 580,
    speedMult: 1.22,
    aggroRange: 24.5,
    hoverY: 0.0,
    ranged: true,
    hitRadius: 2.35,
    hitCenterY: 1.05,
    hitHalfH: 1.8,
    isSeaMonster: true,
    effectiveWeapons: ['saus', 'biji', 'kertas', 'jarum', 'kristal', 'harpun'],
  },
  shadow_angler: {
    id: 'shadow_angler',
    sheetNumber: 28,
    name: 'Shadow Angler (Monster Laut Dalam)',
    tier: 'medium',
    tierLabel: 'Monster Laut · Abisal',
    stats: { hp: 740, atk: 175, nrg: 170 },
    baseScale: 1.32,
    arenaScale: 0.88,
    hitHp: 7,
    quizHp: 3,
    stanceHp: 3,
    atkDamageHearts: 2,
    rewardXp: 56,
    rewardDiamonds: 3,
    rewardScore: 540,
    speedMult: 1.1,
    aggroRange: 23.5,
    hoverY: 0.0,
    ranged: false,
    hitRadius: 2.2,
    hitCenterY: 0.95,
    hitHalfH: 1.75,
    isSeaMonster: true,
    effectiveWeapons: ['saus', 'biji', 'kertas', 'jarum', 'kristal', 'harpun'],
  },
  spiny_mega_stingray: {
    id: 'spiny_mega_stingray',
    sheetNumber: 29,
    name: 'Spiny Mega-Stingray (Pari Berduri)',
    tier: 'large',
    tierLabel: 'Monster Laut · Berduri',
    stats: { hp: 640, atk: 140, nrg: 150 },
    baseScale: 1.32,
    arenaScale: 0.88,
    hitHp: 6,
    quizHp: 3,
    stanceHp: 3,
    atkDamageHearts: 1,
    rewardXp: 52,
    rewardDiamonds: 2,
    rewardScore: 500,
    speedMult: 1.28,
    aggroRange: 24.0,
    hoverY: -0.06,
    ranged: false,
    hitRadius: 2.55,
    hitCenterY: 0.55,
    hitHalfH: 1.4,
    isSeaMonster: true,
    effectiveWeapons: ['emas', 'saus', 'biji', 'kertas', 'jarum', 'kristal', 'harpun'],
  },
  charybdis_maw: {
    id: 'charybdis_maw',
    sheetNumber: 30,
    name: 'Charybdis Maw',
    tier: 'giant',
    tierLabel: 'Monster Laut · Pusaran Maut',
    stats: { hp: 1850, atk: 280, nrg: 300 },
    baseScale: 1.55,
    arenaScale: 0.72,
    hitHp: 13,
    quizHp: 4,
    stanceHp: 4,
    atkDamageHearts: 2,
    rewardXp: 110,
    rewardDiamonds: 6,
    rewardScore: 1100,
    speedMult: 0.42,
    aggroRange: 23.0,
    hoverY: 0.04,
    ranged: false,
    hitRadius: 3.7,
    hitCenterY: 0.95,
    hitHalfH: 2.0,
    isSeaMonster: true,
    effectiveWeapons: ['biji', 'kertas', 'jarum', 'kristal', 'harpun'],
  },
  giga_wyvern: {
    id: 'giga_wyvern',
    sheetNumber: 31,
    name: 'Giga-Wyvern (Naga Pembom)',
    tier: 'giant',
    tierLabel: 'Monster Angkasa · Naga Pembom',
    stats: { hp: 1680, atk: 245, nrg: 260 },
    baseScale: 1.38,
    arenaScale: 0.78,
    hitHp: 11,
    quizHp: 4,
    stanceHp: 3,
    atkDamageHearts: 2,
    rewardXp: 88,
    rewardDiamonds: 5,
    rewardScore: 880,
    speedMult: 1.04,
    aggroRange: 30.0,
    hoverY: 12.2,
    ranged: true,
    hitRadius: 3.1,
    hitCenterY: 0.9,
    hitHalfH: 2.1,
    isSkyMonster: true,
  },
  crimson_phoenix: {
    id: 'crimson_phoenix',
    sheetNumber: 32,
    name: 'Crimson Phoenix (Burung Api)',
    tier: 'large',
    tierLabel: 'Monster Angkasa · Burung Api',
    stats: { hp: 1320, atk: 210, nrg: 240 },
    baseScale: 1.24,
    arenaScale: 0.84,
    hitHp: 8,
    quizHp: 3,
    stanceHp: 2,
    atkDamageHearts: 1,
    rewardXp: 68,
    rewardDiamonds: 4,
    rewardScore: 680,
    speedMult: 1.18,
    aggroRange: 29.0,
    hoverY: 11.4,
    ranged: true,
    hitRadius: 2.6,
    hitCenterY: 0.9,
    hitHalfH: 1.95,
    isSkyMonster: true,
  },
  shadow_harpy: {
    id: 'shadow_harpy',
    sheetNumber: 33,
    name: 'Shadow Harpy (Harpi Kegelapan)',
    tier: 'medium',
    tierLabel: 'Monster Angkasa · Harpi Kegelapan',
    stats: { hp: 920, atk: 175, nrg: 205 },
    baseScale: 1.12,
    arenaScale: 0.92,
    hitHp: 6,
    quizHp: 3,
    stanceHp: 2,
    atkDamageHearts: 1,
    rewardXp: 52,
    rewardDiamonds: 3,
    rewardScore: 520,
    speedMult: 1.32,
    aggroRange: 27.5,
    hoverY: 9.8,
    ranged: false,
    hitRadius: 2.2,
    hitCenterY: 1.0,
    hitHalfH: 1.85,
    isSkyMonster: true,
  },
  giant_phantom: {
    id: 'giant_phantom',
    sheetNumber: 34,
    name: 'Giant Phantom (Pari Udara Raksasa)',
    tier: 'large',
    tierLabel: 'Monster Angkasa · Pari Udara',
    stats: { hp: 1240, atk: 190, nrg: 220 },
    baseScale: 1.28,
    arenaScale: 0.82,
    hitHp: 8,
    quizHp: 3,
    stanceHp: 2,
    atkDamageHearts: 1,
    rewardXp: 64,
    rewardDiamonds: 3,
    rewardScore: 640,
    speedMult: 1.14,
    aggroRange: 29.0,
    hoverY: 13.4,
    ranged: true,
    hitRadius: 2.75,
    hitCenterY: 0.65,
    hitHalfH: 1.75,
    isSkyMonster: true,
  },
  toxic_chimera: {
    id: 'toxic_chimera',
    sheetNumber: 35,
    name: 'Toxic Chimera (Beast Berbisa Sungging)',
    tier: 'large',
    tierLabel: 'Monster Angkasa · Chimera',
    stats: { hp: 1450, atk: 225, nrg: 230 },
    baseScale: 1.26,
    arenaScale: 0.84,
    hitHp: 9,
    quizHp: 3,
    stanceHp: 3,
    atkDamageHearts: 2,
    rewardXp: 76,
    rewardDiamonds: 4,
    rewardScore: 760,
    speedMult: 1.08,
    aggroRange: 28.0,
    hoverY: 10.6,
    ranged: true,
    hitRadius: 2.65,
    hitCenterY: 0.95,
    hitHalfH: 1.95,
    isSkyMonster: true,
  },
  guardian_sentinel: {
    id: 'guardian_sentinel',
    sheetNumber: 36,
    name: 'Guardian Sentinel (Drone Penjaga)',
    tier: 'medium',
    tierLabel: 'Monster Angkasa · Drone Penjaga',
    stats: { hp: 1120, atk: 205, nrg: 250 },
    baseScale: 1.16,
    arenaScale: 0.88,
    hitHp: 7,
    quizHp: 3,
    stanceHp: 2,
    atkDamageHearts: 1,
    rewardXp: 60,
    rewardDiamonds: 3,
    rewardScore: 600,
    speedMult: 1.0,
    aggroRange: 30.5,
    hoverY: 11.8,
    ranged: true,
    hitRadius: 2.2,
    hitCenterY: 0.95,
    hitHalfH: 1.85,
    isSkyMonster: true,
  },
  ice_shard_griffin: {
    id: 'ice_shard_griffin',
    sheetNumber: 37,
    name: 'Ice Shard Griffin (Griffin Badai Es)',
    tier: 'large',
    tierLabel: 'Monster Angkasa · Griffin Es',
    stats: { hp: 1480, atk: 220, nrg: 245 },
    baseScale: 1.3,
    arenaScale: 0.82,
    hitHp: 9,
    quizHp: 3,
    stanceHp: 3,
    atkDamageHearts: 2,
    rewardXp: 78,
    rewardDiamonds: 4,
    rewardScore: 780,
    speedMult: 1.16,
    aggroRange: 29.0,
    hoverY: 12.6,
    ranged: true,
    hitRadius: 2.75,
    hitCenterY: 1.0,
    hitHalfH: 2.0,
    isSkyMonster: true,
  },
  blight_hornet: {
    id: 'blight_hornet',
    sheetNumber: 38,
    name: 'Blight Hornet (Tawon Raksasa Beracun)',
    tier: 'medium',
    tierLabel: 'Monster Angkasa · Tawon Beracun',
    stats: { hp: 860, atk: 165, nrg: 215 },
    baseScale: 1.1,
    arenaScale: 0.95,
    hitHp: 6,
    quizHp: 2,
    stanceHp: 2,
    atkDamageHearts: 1,
    rewardXp: 48,
    rewardDiamonds: 3,
    rewardScore: 480,
    speedMult: 1.38,
    aggroRange: 27.0,
    hoverY: 9.6,
    ranged: false,
    hitRadius: 2.05,
    hitCenterY: 0.78,
    hitHalfH: 1.75,
    isSkyMonster: true,
  },
  acidic_sky_wyrm: {
    id: 'acidic_sky_wyrm',
    sheetNumber: 39,
    name: 'Acidic Sky-Wyrm (Naga Asam Udara)',
    tier: 'giant',
    tierLabel: 'Monster Angkasa · Naga Asam',
    stats: { hp: 1620, atk: 240, nrg: 265 },
    baseScale: 1.32,
    arenaScale: 0.78,
    hitHp: 10,
    quizHp: 4,
    stanceHp: 3,
    atkDamageHearts: 2,
    rewardXp: 86,
    rewardDiamonds: 5,
    rewardScore: 860,
    speedMult: 1.12,
    aggroRange: 30.0,
    hoverY: 14.0,
    ranged: true,
    hitRadius: 2.85,
    hitCenterY: 0.88,
    hitHalfH: 2.0,
    isSkyMonster: true,
  },
  volcanic_giant_bat: {
    id: 'volcanic_giant_bat',
    sheetNumber: 40,
    name: 'Volcanic Giant Bat (Kelelawar Lava)',
    tier: 'medium',
    tierLabel: 'Monster Angkasa · Kelelawar Lava',
    stats: { hp: 980, atk: 185, nrg: 220 },
    baseScale: 1.16,
    arenaScale: 0.9,
    hitHp: 7,
    quizHp: 3,
    stanceHp: 2,
    atkDamageHearts: 1,
    rewardXp: 58,
    rewardDiamonds: 3,
    rewardScore: 580,
    speedMult: 1.28,
    aggroRange: 28.0,
    hoverY: 10.4,
    ranged: false,
    hitRadius: 2.25,
    hitCenterY: 0.85,
    hitHalfH: 1.85,
    isSkyMonster: true,
  },
};

export const ALL_MONSTER_TYPES: MonsterType[] = Object.keys(MONSTER_SPECS) as MonsterType[];

export const SKY_MONSTER_TYPES = new Set<MonsterType>(
  ALL_MONSTER_TYPES.filter((t) => MONSTER_SPECS[t].isSkyMonster),
);
export const FLYING_MONSTER_TYPES = new Set<MonsterType>([
  'lava_imp',
  'stone_gargoyle',
  ...SKY_MONSTER_TYPES,
]);
export const SEA_MONSTER_TYPES = new Set<MonsterType>(
  ALL_MONSTER_TYPES.filter((t) => MONSTER_SPECS[t].isSeaMonster),
);
export const SEA_CAPABLE_WEAPONS = new Set<WeaponId>([
  'emas',
  'saus',
  'biji',
  'kertas',
  'jarum',
  'kristal',
  'harpun',
]);
export const RANGED_MONSTER_TYPES = new Set<MonsterType>(
  ALL_MONSTER_TYPES.filter((t) => MONSTER_SPECS[t].ranged),
);

export interface MonsterAnimRig {
  type: MonsterType;
  bodyPivot: THREE.Group;
  upperBody?: THREE.Group;
  headGroup?: THREE.Group;
  extraHeads?: THREE.Group[];
  leftArm?: THREE.Group;
  rightArm?: THREE.Group;
  legs?: THREE.Group[];
  leftWing?: THREE.Group;
  rightWing?: THREE.Group;
  weaponGroup?: THREE.Group;
  tailPivot?: THREE.Group;
  eyes?: THREE.Mesh[];
  extraSpin?: THREE.Object3D;
  tentacles?: THREE.Group[];
  jawPivot?: THREE.Group;
  vortexRing?: THREE.Object3D;
  segments?: THREE.Group[];
}

function addBox(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  mat: THREE.Material,
  shadow = true,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  parent.add(m);
  return m;
}

function makeBipedLeg(
  lx: number,
  legHeight: number,
  footW: number,
  footD: number,
  legMat: THREE.Material,
  bootMat?: THREE.Material,
): THREE.Group {
  const leg = new THREE.Group();
  leg.position.set(lx, legHeight, 0);
  const shin = new THREE.Mesh(new THREE.BoxGeometry(footW, legHeight * 0.74, footD * 0.85), legMat);
  shin.position.y = -legHeight * 0.37;
  shin.castShadow = true;
  leg.add(shin);
  const boot = new THREE.Mesh(
    new THREE.BoxGeometry(footW * 1.08, legHeight * 0.28, footD * 1.12),
    bootMat ?? legMat,
  );
  boot.position.set(0, -legHeight * 0.86, footD * 0.08);
  boot.castShadow = true;
  leg.add(boot);
  return leg;
}

export function buildMonsterRig(
  type: MonsterType,
  palette: MaterialPalette,
  scaleOverride?: number,
): THREE.Group {
  const spec = MONSTER_SPECS[type] ?? MONSTER_SPECS.forest_slime;
  const root = new THREE.Group();

  const shadowRadius =
    spec.tier === 'giant' ? 1.55 : spec.tier === 'large' ? 1.3 : spec.tier === 'medium' ? 1.05 : 0.85;
  if (!spec.isSeaMonster && !spec.isSkyMonster) {
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(shadowRadius * 2.1, shadowRadius * 2.1),
      palette.contactShadowMat,
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.04;
    root.add(shadow);
  }

  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);
  const rig: MonsterAnimRig = { type, bodyPivot };

  const darkEye = palette.getMat(0x0f172a, 'matte');
  const whiteBone = palette.getMat(0xe2e8f0, 'matte');
  const ironMetal = palette.getMat(0x94a3b8, 'metal');
  const darkIron = palette.getMat(0x334155, 'metal');
  const woodMat = palette.getMat(0x78350f, 'matte');
  const leatherMat = palette.getMat(0x5c3a21, 'matte');

  if (type === 'forest_slime') {
    const limeOuter = palette.getMat(0x4ade80, 'gloss');
    const limeCore = palette.getMat(0x16a34a, 'emissive');
    const blush = palette.getMat(0xf472b6, 'matte');
    addBox(bodyPivot, 1.35, 1.05, 1.32, 0, 0.54, 0, limeOuter);
    addBox(bodyPivot, 0.96, 0.36, 0.96, 0, 1.18, 0, limeOuter);
    addBox(bodyPivot, 0.64, 0.52, 0.64, 0, 0.56, 0, limeCore, false);
    const eL = addBox(bodyPivot, 0.16, 0.22, 0.08, -0.26, 0.64, 0.67, darkEye, false);
    const eR = addBox(bodyPivot, 0.16, 0.22, 0.08, 0.26, 0.64, 0.67, darkEye, false);
    addBox(bodyPivot, 0.14, 0.09, 0.06, -0.44, 0.48, 0.66, blush, false);
    addBox(bodyPivot, 0.14, 0.09, 0.06, 0.44, 0.48, 0.66, blush, false);
    const lArm = new THREE.Group();
    lArm.position.set(-0.76, 0.48, 0.1);
    addBox(lArm, 0.24, 0.34, 0.24, 0, -0.1, 0, limeOuter);
    const rArm = new THREE.Group();
    rArm.position.set(0.76, 0.48, 0.1);
    addBox(rArm, 0.24, 0.34, 0.24, 0, -0.1, 0, limeOuter);
    bodyPivot.add(lArm, rArm);
    rig.leftArm = lArm;
    rig.rightArm = rArm;
    rig.eyes = [eL, eR];
  } else if (type === 'poison_beetle') {
    const shellPurple = palette.getMat(0x7e22ce, 'gloss');
    const toxicGreen = palette.getMat(0x22c55e, 'emissive');
    const darkChitin = palette.getMat(0x1e1b4b, 'matte');
    addBox(bodyPivot, 1.05, 0.56, 1.38, 0, 0.52, -0.05, shellPurple);
    addBox(bodyPivot, 0.88, 0.22, 1.12, 0, 0.84, -0.1, toxicGreen, false);
    const head = new THREE.Group();
    head.position.set(0, 0.48, 0.72);
    addBox(head, 0.62, 0.42, 0.48, 0, 0, 0.12, darkChitin);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.55, 5), shellPurple);
    horn.rotation.x = Math.PI * 0.34;
    horn.position.set(0, 0.22, 0.46);
    head.add(horn);
    const eL = addBox(head, 0.12, 0.12, 0.08, -0.2, 0.08, 0.36, toxicGreen, false);
    const eR = addBox(head, 0.12, 0.12, 0.08, 0.2, 0.08, 0.36, toxicGreen, false);
    bodyPivot.add(head);
    const legs: THREE.Group[] = [];
    for (const lz of [0.42, 0.0, -0.44]) {
      for (const side of [-1, 1]) {
        const leg = new THREE.Group();
        leg.position.set(side * 0.52, 0.42, lz);
        const seg = addBox(leg, 0.44, 0.12, 0.12, side * 0.22, -0.14, 0, darkChitin);
        seg.rotation.z = side * -0.58;
        legs.push(leg);
        bodyPivot.add(leg);
      }
    }
    rig.headGroup = head;
    rig.legs = legs;
    rig.eyes = [eL, eR];
  } else if (type === 'cave_spider') {
    const spiderBody = palette.getMat(0x1e293b, 'matte');
    const spiderStripe = palette.getMat(0x475569, 'matte');
    const spiderEye = palette.getMat(0xe879f9, 'emissive');
    addBox(bodyPivot, 0.96, 0.74, 1.06, 0, 0.68, -0.52, spiderBody);
    addBox(bodyPivot, 0.78, 0.16, 0.72, 0, 1.08, -0.52, spiderStripe, false);
    const head = new THREE.Group();
    head.position.set(0, 0.62, 0.24);
    addBox(head, 0.72, 0.54, 0.64, 0, 0, 0.15, spiderBody);
    const eL = addBox(head, 0.14, 0.14, 0.08, -0.18, 0.08, 0.48, spiderEye, false);
    const eR = addBox(head, 0.14, 0.14, 0.08, 0.18, 0.08, 0.48, spiderEye, false);
    addBox(head, 0.09, 0.09, 0.08, -0.28, -0.04, 0.47, spiderEye, false);
    addBox(head, 0.09, 0.09, 0.08, 0.28, -0.04, 0.47, spiderEye, false);
    addBox(head, 0.1, 0.22, 0.12, -0.14, -0.24, 0.46, darkIron);
    addBox(head, 0.1, 0.22, 0.12, 0.14, -0.24, 0.46, darkIron);
    bodyPivot.add(head);
    const legs: THREE.Group[] = [];
    for (const lz of [0.35, 0.08, -0.22, -0.52]) {
      for (const side of [-1, 1]) {
        const leg = new THREE.Group();
        leg.position.set(side * 0.4, 0.56, lz);
        const upper = addBox(leg, 0.52, 0.11, 0.11, side * 0.26, 0.14, 0, spiderBody);
        upper.rotation.z = side * 0.55;
        const lower = addBox(leg, 0.12, 0.66, 0.11, side * 0.54, -0.14, 0, spiderStripe);
        lower.rotation.z = side * -0.18;
        legs.push(leg);
        bodyPivot.add(leg);
      }
    }
    rig.headGroup = head;
    rig.legs = legs;
    rig.eyes = [eL, eR];
  } else if (type === 'thorn_goblin') {
    const gobSkin = palette.getMat(0x22c55e, 'matte');
    const hair = palette.getMat(0x78350f, 'matte');
    const eyeYellow = palette.getMat(0xfef08a, 'emissive');
    const legs = [
      makeBipedLeg(-0.24, 0.52, 0.26, 0.28, gobSkin, leatherMat),
      makeBipedLeg(0.24, 0.52, 0.26, 0.28, gobSkin, leatherMat),
    ];
    bodyPivot.add(...legs);
    const upper = new THREE.Group();
    upper.position.set(0, 0.52, 0);
    bodyPivot.add(upper);
    addBox(upper, 0.78, 0.72, 0.48, 0, 0.36, 0, leatherMat);
    addBox(upper, 0.64, 0.22, 0.44, 0, 0.58, 0.02, gobSkin);
    const head = new THREE.Group();
    head.position.set(0, 0.74, 0);
    addBox(head, 0.68, 0.62, 0.64, 0, 0.31, 0, gobSkin);
    addBox(head, 0.74, 0.24, 0.68, 0, 0.64, 0, hair);
    addBox(head, 0.38, 0.16, 0.18, -0.5, 0.36, 0, gobSkin);
    addBox(head, 0.38, 0.16, 0.18, 0.5, 0.36, 0, gobSkin);
    const eL = addBox(head, 0.14, 0.12, 0.08, -0.16, 0.34, 0.33, eyeYellow, false);
    const eR = addBox(head, 0.14, 0.12, 0.08, 0.16, 0.34, 0.33, eyeYellow, false);
    upper.add(head);
    const lArm = new THREE.Group();
    lArm.position.set(-0.5, 0.62, 0);
    addBox(lArm, 0.24, 0.58, 0.24, 0, -0.26, 0, gobSkin);
    const rArm = new THREE.Group();
    rArm.position.set(0.5, 0.62, 0);
    addBox(rArm, 0.24, 0.58, 0.24, 0, -0.26, 0, gobSkin);
    const club = new THREE.Group();
    club.position.set(0, -0.52, 0.16);
    addBox(club, 0.16, 0.16, 0.92, 0, 0, 0.38, woodMat);
    addBox(club, 0.26, 0.26, 0.34, 0, 0, 0.76, woodMat);
    addBox(club, 0.08, 0.36, 0.08, 0, 0, 0.76, palette.getMat(0x16a34a, 'matte'), false);
    rArm.add(club);
    upper.add(lArm, rArm);
    rig.legs = legs;
    rig.upperBody = upper;
    rig.headGroup = head;
    rig.leftArm = lArm;
    rig.rightArm = rArm;
    rig.weaponGroup = club;
    rig.eyes = [eL, eR];
  } else if (type === 'wild_boar') {
    const boarHide = palette.getMat(0x57534e, 'matte');
    const mane = palette.getMat(0x292524, 'matte');
    const snoutMat = palette.getMat(0xfca5a5, 'matte');
    const legs: THREE.Group[] = [];
    for (const [lx, lz] of [
      [-0.32, 0.48],
      [0.32, 0.48],
      [-0.32, -0.46],
      [0.32, -0.46],
    ]) {
      legs.push(makeBipedLeg(lx, 0.5, 0.24, 0.24, boarHide, mane));
      legs[legs.length - 1].position.z = lz;
    }
    bodyPivot.add(...legs);
    addBox(bodyPivot, 0.94, 0.78, 1.38, 0, 0.88, -0.02, boarHide);
    addBox(bodyPivot, 0.24, 0.22, 1.15, 0, 1.34, -0.02, mane);
    const head = new THREE.Group();
    head.position.set(0, 0.88, 0.72);
    addBox(head, 0.72, 0.62, 0.54, 0, 0.04, 0.22, boarHide);
    addBox(head, 0.42, 0.28, 0.24, 0, -0.08, 0.54, snoutMat);
    addBox(head, 0.1, 0.28, 0.1, -0.24, 0.02, 0.56, whiteBone);
    addBox(head, 0.1, 0.28, 0.1, 0.24, 0.02, 0.56, whiteBone);
    const eL = addBox(head, 0.12, 0.12, 0.08, -0.26, 0.16, 0.48, darkEye, false);
    const eR = addBox(head, 0.12, 0.12, 0.08, 0.26, 0.16, 0.48, darkEye, false);
    bodyPivot.add(head);
    const tail = new THREE.Group();
    tail.position.set(0, 1.0, -0.72);
    addBox(tail, 0.12, 0.12, 0.34, 0, 0, -0.15, mane);
    bodyPivot.add(tail);
    rig.legs = legs;
    rig.headGroup = head;
    rig.tailPivot = tail;
    rig.eyes = [eL, eR];
  } else if (type === 'dire_wolf') {
    const darkFur = palette.getMat(0x1e293b, 'matte');
    const silverRuff = palette.getMat(0x94a3b8, 'matte');
    const amberEye = palette.getMat(0xfacc15, 'emissive');
    const legs: THREE.Group[] = [];
    for (const [lx, lz] of [
      [-0.32, 0.54],
      [0.32, 0.54],
      [-0.32, -0.52],
      [0.32, -0.52],
    ]) {
      const leg = makeBipedLeg(lx, 0.68, 0.22, 0.24, darkFur, silverRuff);
      leg.position.z = lz;
      legs.push(leg);
    }
    bodyPivot.add(...legs);
    addBox(bodyPivot, 0.84, 0.72, 1.48, 0, 1.02, -0.02, darkFur);
    addBox(bodyPivot, 0.96, 0.68, 0.52, 0, 1.08, 0.56, silverRuff);
    const head = new THREE.Group();
    head.position.set(0, 1.18, 0.82);
    addBox(head, 0.68, 0.56, 0.58, 0, 0.08, 0.2, darkFur);
    addBox(head, 0.36, 0.28, 0.44, 0, -0.04, 0.62, darkFur);
    addBox(head, 0.16, 0.28, 0.14, -0.24, 0.46, 0.1, darkFur);
    addBox(head, 0.16, 0.28, 0.14, 0.24, 0.46, 0.1, darkFur);
    const eL = addBox(head, 0.12, 0.1, 0.08, -0.18, 0.16, 0.5, amberEye, false);
    const eR = addBox(head, 0.12, 0.1, 0.08, 0.18, 0.16, 0.5, amberEye, false);
    bodyPivot.add(head);
    const tail = new THREE.Group();
    tail.position.set(0, 1.15, -0.76);
    addBox(tail, 0.24, 0.24, 0.68, 0, 0.06, -0.32, darkFur);
    bodyPivot.add(tail);
    rig.legs = legs;
    rig.headGroup = head;
    rig.tailPivot = tail;
    rig.eyes = [eL, eR];
  } else if (type === 'skeleton_warrior') {
    const legs = [
      makeBipedLeg(-0.24, 0.78, 0.22, 0.26, whiteBone),
      makeBipedLeg(0.24, 0.78, 0.22, 0.26, whiteBone),
    ];
    bodyPivot.add(...legs);
    const upper = new THREE.Group();
    upper.position.set(0, 0.78, 0);
    bodyPivot.add(upper);
    addBox(upper, 0.64, 0.22, 0.36, 0, 0.11, 0, whiteBone);
    addBox(upper, 0.22, 0.68, 0.22, 0, 0.5, -0.06, whiteBone);
    addBox(upper, 0.72, 0.16, 0.38, 0, 0.72, 0, whiteBone);
    addBox(upper, 0.66, 0.12, 0.36, 0, 0.48, 0, whiteBone);
    const head = new THREE.Group();
    head.position.set(0, 0.88, 0);
    addBox(head, 0.64, 0.64, 0.64, 0, 0.34, 0, whiteBone);
    const eL = addBox(head, 0.14, 0.14, 0.08, -0.15, 0.38, 0.33, darkEye, false);
    const eR = addBox(head, 0.14, 0.14, 0.08, 0.15, 0.38, 0.33, darkEye, false);
    addBox(head, 0.28, 0.12, 0.08, 0, 0.14, 0.33, darkEye, false);
    upper.add(head);
    const lArm = new THREE.Group();
    lArm.position.set(-0.48, 0.76, 0);
    addBox(lArm, 0.18, 0.68, 0.18, 0, -0.32, 0, whiteBone);
    // Shield on left arm
    addBox(lArm, 0.12, 0.78, 0.62, -0.12, -0.42, 0.18, woodMat);
    addBox(lArm, 0.14, 0.56, 0.42, -0.14, -0.42, 0.18, ironMetal, false);
    const rArm = new THREE.Group();
    rArm.position.set(0.48, 0.76, 0);
    addBox(rArm, 0.18, 0.68, 0.18, 0, -0.32, 0, whiteBone);
    const sword = new THREE.Group();
    sword.position.set(0, -0.64, 0.16);
    addBox(sword, 0.1, 0.1, 0.3, 0, 0, 0.08, woodMat);
    addBox(sword, 0.32, 0.1, 0.08, 0, 0, 0.24, darkIron);
    addBox(sword, 0.08, 0.16, 0.88, 0, 0, 0.7, ironMetal);
    rArm.add(sword);
    upper.add(lArm, rArm);
    rig.legs = legs;
    rig.upperBody = upper;
    rig.headGroup = head;
    rig.leftArm = lArm;
    rig.rightArm = rArm;
    rig.weaponGroup = sword;
    rig.eyes = [eL, eR];
  } else if (type === 'swamp_lizardman') {
    const scaleGreen = palette.getMat(0x16a34a, 'matte');
    const bellyLime = palette.getMat(0x84cc16, 'matte');
    const crestOrange = palette.getMat(0xf59e0b, 'matte');
    const legs = [
      makeBipedLeg(-0.28, 0.74, 0.3, 0.34, scaleGreen),
      makeBipedLeg(0.28, 0.74, 0.3, 0.34, scaleGreen),
    ];
    bodyPivot.add(...legs);
    const upper = new THREE.Group();
    upper.position.set(0, 0.74, 0);
    bodyPivot.add(upper);
    addBox(upper, 0.88, 0.9, 0.56, 0, 0.45, 0, scaleGreen);
    addBox(upper, 0.56, 0.72, 0.14, 0, 0.45, 0.26, bellyLime, false);
    addBox(upper, 0.94, 0.18, 0.62, 0, 0.1, 0, leatherMat);
    const tail = new THREE.Group();
    tail.position.set(0, 0.22, -0.28);
    addBox(tail, 0.32, 0.28, 0.9, 0, -0.05, -0.45, scaleGreen);
    addBox(tail, 0.12, 0.22, 0.78, 0, 0.14, -0.42, crestOrange);
    upper.add(tail);
    const head = new THREE.Group();
    head.position.set(0, 0.94, 0.08);
    addBox(head, 0.64, 0.52, 0.88, 0, 0.26, 0.18, scaleGreen);
    addBox(head, 0.14, 0.24, 0.66, 0, 0.58, 0.06, crestOrange);
    const eL = addBox(head, 0.12, 0.14, 0.08, -0.28, 0.34, 0.42, palette.getMat(0xfef08a, 'emissive'), false);
    const eR = addBox(head, 0.12, 0.14, 0.08, 0.28, 0.34, 0.42, palette.getMat(0xfef08a, 'emissive'), false);
    upper.add(head);
    const lArm = new THREE.Group();
    lArm.position.set(-0.56, 0.78, 0);
    addBox(lArm, 0.26, 0.68, 0.26, 0, -0.32, 0, scaleGreen);
    const rArm = new THREE.Group();
    rArm.position.set(0.56, 0.78, 0);
    addBox(rArm, 0.26, 0.68, 0.26, 0, -0.32, 0, scaleGreen);
    const spear = new THREE.Group();
    spear.position.set(0, -0.62, 0.1);
    addBox(spear, 0.09, 0.09, 1.75, 0, 0, 0.42, woodMat);
    const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 4), ironMetal);
    spearTip.rotation.x = Math.PI / 2;
    spearTip.position.z = 1.42;
    spear.add(spearTip);
    rArm.add(spear);
    upper.add(lArm, rArm);
    rig.legs = legs;
    rig.upperBody = upper;
    rig.headGroup = head;
    rig.tailPivot = tail;
    rig.leftArm = lArm;
    rig.rightArm = rArm;
    rig.weaponGroup = spear;
    rig.eyes = [eL, eR];
  } else if (type === 'sand_scorpion') {
    const sandTan = palette.getMat(0xd97706, 'gloss');
    const sandLight = palette.getMat(0xfbbf24, 'matte');
    const venomGlow = palette.getMat(0x22c55e, 'emissive');
    addBox(bodyPivot, 1.02, 0.48, 1.32, 0, 0.48, -0.05, sandTan);
    addBox(bodyPivot, 0.78, 0.22, 1.05, 0, 0.76, -0.05, sandLight);
    const eL = addBox(bodyPivot, 0.12, 0.12, 0.08, -0.22, 0.56, 0.63, darkEye, false);
    const eR = addBox(bodyPivot, 0.12, 0.12, 0.08, 0.22, 0.56, 0.63, darkEye, false);
    const legs: THREE.Group[] = [];
    for (const lz of [0.34, 0.0, -0.34]) {
      for (const side of [-1, 1]) {
        const leg = new THREE.Group();
        leg.position.set(side * 0.48, 0.4, lz);
        const seg = addBox(leg, 0.48, 0.12, 0.14, side * 0.24, -0.14, 0, sandTan);
        seg.rotation.z = side * -0.55;
        legs.push(leg);
        bodyPivot.add(leg);
      }
    }
    const makePincer = (side: number): THREE.Group => {
      const arm = new THREE.Group();
      arm.position.set(side * 0.52, 0.52, 0.55);
      addBox(arm, 0.22, 0.2, 0.52, side * 0.12, 0, 0.26, sandTan);
      addBox(arm, 0.36, 0.26, 0.44, side * 0.16, 0, 0.64, sandLight);
      return arm;
    };
    const lArm = makePincer(-1);
    const rArm = makePincer(1);
    const tail = new THREE.Group();
    tail.position.set(0, 0.62, -0.62);
    addBox(tail, 0.34, 0.52, 0.34, 0, 0.26, -0.18, sandTan);
    addBox(tail, 0.3, 0.58, 0.3, 0, 0.78, -0.1, sandLight);
    addBox(tail, 0.26, 0.32, 0.52, 0, 1.12, 0.22, sandTan);
    const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.38, 5), venomGlow);
    stinger.rotation.x = Math.PI * 0.68;
    stinger.position.set(0, 1.04, 0.52);
    tail.add(stinger);
    bodyPivot.add(lArm, rArm, tail);
    rig.legs = legs;
    rig.leftArm = lArm;
    rig.rightArm = rArm;
    rig.tailPivot = tail;
    rig.eyes = [eL, eR];
  } else if (type === 'lava_imp') {
    const crimson = palette.getMat(0xdc2626, 'gloss');
    const darkRed = palette.getMat(0x7f1d1d, 'matte');
    const emberEye = palette.getMat(0xfef08a, 'emissive');
    const wingMat = palette.getMat(0x450a0a, 'matte');
    const legs = [
      makeBipedLeg(-0.2, 0.56, 0.2, 0.22, darkRed),
      makeBipedLeg(0.2, 0.56, 0.2, 0.22, darkRed),
    ];
    bodyPivot.add(...legs);
    const upper = new THREE.Group();
    upper.position.set(0, 0.56, 0);
    bodyPivot.add(upper);
    addBox(upper, 0.68, 0.72, 0.44, 0, 0.36, 0, crimson);
    const head = new THREE.Group();
    head.position.set(0, 0.74, 0);
    addBox(head, 0.62, 0.58, 0.58, 0, 0.28, 0, crimson);
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.44, 5), darkIron);
    hornL.position.set(-0.22, 0.72, 0.04);
    hornL.rotation.z = 0.28;
    const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.44, 5), darkIron);
    hornR.position.set(0.22, 0.72, 0.04);
    hornR.rotation.z = -0.28;
    const eL = addBox(head, 0.14, 0.12, 0.08, -0.15, 0.32, 0.31, emberEye, false);
    const eR = addBox(head, 0.14, 0.12, 0.08, 0.15, 0.32, 0.31, emberEye, false);
    head.add(hornL, hornR);
    upper.add(head);
    const lArm = new THREE.Group();
    lArm.position.set(-0.46, 0.62, 0);
    addBox(lArm, 0.2, 0.54, 0.2, 0, -0.26, 0, crimson);
    const rArm = new THREE.Group();
    rArm.position.set(0.46, 0.62, 0);
    addBox(rArm, 0.2, 0.54, 0.2, 0, -0.26, 0, crimson);
    const leftWing = new THREE.Group();
    leftWing.position.set(-0.26, 0.55, -0.22);
    addBox(leftWing, 0.85, 0.52, 0.08, -0.45, 0.12, -0.05, wingMat);
    const rightWing = new THREE.Group();
    rightWing.position.set(0.26, 0.55, -0.22);
    addBox(rightWing, 0.85, 0.52, 0.08, 0.45, 0.12, -0.05, wingMat);
    const tail = new THREE.Group();
    tail.position.set(0, 0.15, -0.24);
    addBox(tail, 0.1, 0.1, 0.65, 0, 0.05, -0.32, darkRed);
    upper.add(lArm, rArm, leftWing, rightWing, tail);
    rig.legs = legs;
    rig.upperBody = upper;
    rig.headGroup = head;
    rig.leftArm = lArm;
    rig.rightArm = rArm;
    rig.leftWing = leftWing;
    rig.rightWing = rightWing;
    rig.tailPivot = tail;
    rig.eyes = [eL, eR];
  } else if (type === 'stone_gargoyle') {
    const stone = palette.getMat(0x64748b, 'matte');
    const stoneDark = palette.getMat(0x475569, 'matte');
    const eyeGlow = palette.getMat(0xfde047, 'emissive');
    const legs = [
      makeBipedLeg(-0.3, 0.72, 0.3, 0.36, stoneDark),
      makeBipedLeg(0.3, 0.72, 0.3, 0.36, stoneDark),
    ];
    bodyPivot.add(...legs);
    const upper = new THREE.Group();
    upper.position.set(0, 0.72, 0);
    bodyPivot.add(upper);
    addBox(upper, 1.02, 0.92, 0.68, 0, 0.46, 0, stone);
    const head = new THREE.Group();
    head.position.set(0, 0.94, 0.06);
    addBox(head, 0.68, 0.6, 0.68, 0, 0.3, 0, stone);
    addBox(head, 0.16, 0.44, 0.16, -0.28, 0.72, -0.08, stoneDark);
    addBox(head, 0.16, 0.44, 0.16, 0.28, 0.72, -0.08, stoneDark);
    const eL = addBox(head, 0.15, 0.12, 0.08, -0.16, 0.34, 0.36, eyeGlow, false);
    const eR = addBox(head, 0.15, 0.12, 0.08, 0.16, 0.34, 0.36, eyeGlow, false);
    upper.add(head);
    const lArm = new THREE.Group();
    lArm.position.set(-0.64, 0.78, 0);
    addBox(lArm, 0.28, 0.74, 0.28, 0, -0.36, 0, stone);
    const rArm = new THREE.Group();
    rArm.position.set(0.64, 0.78, 0);
    addBox(rArm, 0.28, 0.74, 0.28, 0, -0.36, 0, stone);
    const leftWing = new THREE.Group();
    leftWing.position.set(-0.42, 0.72, -0.3);
    addBox(leftWing, 1.15, 0.68, 0.1, -0.62, 0.24, -0.06, stoneDark);
    const rightWing = new THREE.Group();
    rightWing.position.set(0.42, 0.72, -0.3);
    addBox(rightWing, 1.15, 0.68, 0.1, 0.62, 0.24, -0.06, stoneDark);
    upper.add(lArm, rArm, leftWing, rightWing);
    rig.legs = legs;
    rig.upperBody = upper;
    rig.headGroup = head;
    rig.leftArm = lArm;
    rig.rightArm = rArm;
    rig.leftWing = leftWing;
    rig.rightWing = rightWing;
    rig.eyes = [eL, eR];
  } else if (type === 'jungle_troll') {
    const tealSkin = palette.getMat(0x0d9488, 'matte');
    const orangeHair = palette.getMat(0xea580c, 'matte');
    const eyeYellow = palette.getMat(0xfef08a, 'emissive');
    const legs = [
      makeBipedLeg(-0.34, 0.78, 0.34, 0.36, tealSkin, leatherMat),
      makeBipedLeg(0.34, 0.78, 0.34, 0.36, tealSkin, leatherMat),
    ];
    bodyPivot.add(...legs);
    const upper = new THREE.Group();
    upper.position.set(0, 0.78, 0);
    bodyPivot.add(upper);
    addBox(upper, 1.12, 0.32, 0.7, 0, 0.14, 0, leatherMat);
    addBox(upper, 1.16, 0.84, 0.68, 0, 0.62, 0, tealSkin);
    const head = new THREE.Group();
    head.position.set(0, 1.06, 0.05);
    addBox(head, 0.72, 0.64, 0.66, 0, 0.32, 0, tealSkin);
    addBox(head, 0.76, 0.24, 0.68, 0, 0.68, 0, orangeHair);
    addBox(head, 0.1, 0.2, 0.1, -0.18, 0.14, 0.35, whiteBone);
    addBox(head, 0.1, 0.2, 0.1, 0.18, 0.14, 0.35, whiteBone);
    const eL = addBox(head, 0.14, 0.12, 0.08, -0.18, 0.38, 0.34, eyeYellow, false);
    const eR = addBox(head, 0.14, 0.12, 0.08, 0.18, 0.38, 0.34, eyeYellow, false);
    upper.add(head);
    const lArm = new THREE.Group();
    lArm.position.set(-0.74, 0.92, 0);
    addBox(lArm, 0.34, 0.82, 0.34, 0, -0.38, 0, tealSkin);
    const rArm = new THREE.Group();
    rArm.position.set(0.74, 0.92, 0);
    addBox(rArm, 0.34, 0.82, 0.34, 0, -0.38, 0, tealSkin);
    const club = new THREE.Group();
    club.position.set(0, -0.78, 0.14);
    addBox(club, 0.2, 0.2, 1.18, 0, 0, 0.45, woodMat);
    addBox(club, 0.34, 0.34, 0.44, 0, 0, 0.88, woodMat);
    addBox(club, 0.46, 0.1, 0.1, 0, 0, 0.88, whiteBone, false);
    addBox(club, 0.1, 0.46, 0.1, 0, 0, 0.88, whiteBone, false);
    rArm.add(club);
    upper.add(lArm, rArm);
    rig.legs = legs;
    rig.upperBody = upper;
    rig.headGroup = head;
    rig.leftArm = lArm;
    rig.rightArm = rArm;
    rig.weaponGroup = club;
    rig.eyes = [eL, eR];
  } else if (type === 'crystal_golem') {
    const rock = palette.getMat(0x57534e, 'matte');
    const rockLight = palette.getMat(0x78716c, 'matte');
    const crystal = palette.getMat(0xc084fc, 'emissive');
    const legs = [
      makeBipedLeg(-0.38, 0.82, 0.4, 0.44, rock),
      makeBipedLeg(0.38, 0.82, 0.4, 0.44, rock),
    ];
    bodyPivot.add(...legs);
    const upper = new THREE.Group();
    upper.position.set(0, 0.82, 0);
    bodyPivot.add(upper);
    addBox(upper, 1.28, 1.02, 0.78, 0, 0.52, 0, rockLight);
    const chestCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), crystal);
    chestCrystal.position.set(0, 0.56, 0.44);
    upper.add(chestCrystal);
    const addSpire = (px: number, py: number, pz: number, rz: number, h = 0.65) => {
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.16, h, 5), crystal);
      sp.position.set(px, py, pz);
      sp.rotation.z = rz;
      upper.add(sp);
    };
    addSpire(-0.56, 1.15, -0.1, 0.38, 0.75);
    addSpire(0.56, 1.15, -0.1, -0.38, 0.75);
    addSpire(0, 1.0, -0.42, 0, 0.68);
    const head = new THREE.Group();
    head.position.set(0, 1.06, 0.04);
    addBox(head, 0.66, 0.58, 0.62, 0, 0.29, 0, rock);
    const eL = addBox(head, 0.16, 0.12, 0.08, -0.15, 0.32, 0.32, crystal, false);
    const eR = addBox(head, 0.16, 0.12, 0.08, 0.15, 0.32, 0.32, crystal, false);
    upper.add(head);
    const lArm = new THREE.Group();
    lArm.position.set(-0.84, 0.88, 0);
    addBox(lArm, 0.4, 0.92, 0.4, 0, -0.44, 0, rock);
    const rArm = new THREE.Group();
    rArm.position.set(0.84, 0.88, 0);
    addBox(rArm, 0.4, 0.92, 0.4, 0, -0.44, 0, rock);
    upper.add(lArm, rArm);
    rig.legs = legs;
    rig.upperBody = upper;
    rig.headGroup = head;
    rig.leftArm = lArm;
    rig.rightArm = rArm;
    rig.extraSpin = chestCrystal;
    rig.eyes = [eL, eR];
  } else if (type === 'minotaur_brute') {
    const bullBrown = palette.getMat(0x78350f, 'matte');
    const bullDark = palette.getMat(0x451a03, 'matte');
    const ringGold = palette.getMat(0xfacc15, 'metal');
    const legs = [
      makeBipedLeg(-0.38, 0.86, 0.38, 0.42, bullDark),
      makeBipedLeg(0.38, 0.86, 0.38, 0.42, bullDark),
    ];
    bodyPivot.add(...legs);
    const upper = new THREE.Group();
    upper.position.set(0, 0.86, 0);
    bodyPivot.add(upper);
    addBox(upper, 1.32, 1.06, 0.78, 0, 0.54, 0, bullBrown);
    addBox(upper, 1.24, 0.26, 0.76, 0, 0.16, 0, darkIron);
    const head = new THREE.Group();
    head.position.set(0, 1.1, 0.08);
    addBox(head, 0.76, 0.68, 0.76, 0, 0.34, 0, bullDark);
    addBox(head, 0.52, 0.32, 0.3, 0, 0.16, 0.42, bullBrown);
    addBox(head, 0.2, 0.16, 0.08, 0, 0.06, 0.58, ringGold, false);
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.64, 5), whiteBone);
    hornL.position.set(-0.48, 0.56, 0.08);
    hornL.rotation.z = 0.78;
    const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.64, 5), whiteBone);
    hornR.position.set(0.48, 0.56, 0.08);
    hornR.rotation.z = -0.78;
    const eL = addBox(head, 0.14, 0.12, 0.08, -0.18, 0.42, 0.4, palette.getMat(0xef4444, 'emissive'), false);
    const eR = addBox(head, 0.14, 0.12, 0.08, 0.18, 0.42, 0.4, palette.getMat(0xef4444, 'emissive'), false);
    head.add(hornL, hornR);
    upper.add(head);
    const lArm = new THREE.Group();
    lArm.position.set(-0.86, 0.94, 0);
    addBox(lArm, 0.38, 0.88, 0.38, 0, -0.42, 0, bullBrown);
    const rArm = new THREE.Group();
    rArm.position.set(0.86, 0.94, 0);
    addBox(rArm, 0.38, 0.88, 0.38, 0, -0.42, 0, bullBrown);
    const axe = new THREE.Group();
    axe.position.set(0, -0.82, 0.14);
    addBox(axe, 0.12, 0.12, 1.48, 0, 0, 0.52, woodMat);
    addBox(axe, 0.86, 0.44, 0.16, 0, 0, 1.06, ironMetal);
    rArm.add(axe);
    upper.add(lArm, rArm);
    rig.legs = legs;
    rig.upperBody = upper;
    rig.headGroup = head;
    rig.leftArm = lArm;
    rig.rightArm = rArm;
    rig.weaponGroup = axe;
    rig.eyes = [eL, eR];
  } else if (type === 'magma_elemental') {
    const obsidian = palette.getMat(0x1c1917, 'matte');
    const lavaGlow = palette.getMat(0xf97316, 'emissive');
    const lavaCore = palette.getMat(0xfef08a, 'emissive');
    const legs = [
      makeBipedLeg(-0.36, 0.84, 0.36, 0.4, obsidian, lavaGlow),
      makeBipedLeg(0.36, 0.84, 0.36, 0.4, obsidian, lavaGlow),
    ];
    bodyPivot.add(...legs);
    const upper = new THREE.Group();
    upper.position.set(0, 0.84, 0);
    bodyPivot.add(upper);
    addBox(upper, 1.24, 1.04, 0.76, 0, 0.54, 0, obsidian);
    addBox(upper, 0.68, 0.52, 0.8, 0, 0.58, 0, lavaGlow, false);
    const coreGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), lavaCore);
    coreGem.position.set(0, 0.58, 0.44);
    upper.add(coreGem);
    const head = new THREE.Group();
    head.position.set(0, 1.12, 0);
    addBox(head, 0.68, 0.62, 0.64, 0, 0.31, 0, obsidian);
    addBox(head, 0.46, 0.22, 0.46, 0, 0.64, 0, lavaGlow, false);
    const eL = addBox(head, 0.16, 0.12, 0.08, -0.16, 0.34, 0.34, lavaCore, false);
    const eR = addBox(head, 0.16, 0.12, 0.08, 0.16, 0.34, 0.34, lavaCore, false);
    upper.add(head);
    const lArm = new THREE.Group();
    lArm.position.set(-0.84, 0.94, 0);
    addBox(lArm, 0.38, 0.38, 0.38, 0, -0.18, 0, obsidian);
    addBox(lArm, 0.42, 0.48, 0.42, 0, -0.68, 0, lavaGlow);
    const rArm = new THREE.Group();
    rArm.position.set(0.84, 0.94, 0);
    addBox(rArm, 0.38, 0.38, 0.38, 0, -0.18, 0, obsidian);
    addBox(rArm, 0.42, 0.48, 0.42, 0, -0.68, 0, lavaGlow);
    upper.add(lArm, rArm);
    rig.legs = legs;
    rig.upperBody = upper;
    rig.headGroup = head;
    rig.leftArm = lArm;
    rig.rightArm = rArm;
    rig.extraSpin = coreGem;
    rig.eyes = [eL, eR];
  } else if (type === 'frost_ogre') {
    const frostBlue = palette.getMat(0x38bdf8, 'matte');
    const frostDeep = palette.getMat(0x0284c7, 'matte');
    const snowBeard = palette.getMat(0xf8fafc, 'matte');
    const iceCrystal = palette.getMat(0xbae6fd, 'emissive');
    const legs = [
      makeBipedLeg(-0.4, 0.88, 0.42, 0.46, frostDeep, leatherMat),
      makeBipedLeg(0.4, 0.88, 0.42, 0.46, frostDeep, leatherMat),
    ];
    bodyPivot.add(...legs);
    const upper = new THREE.Group();
    upper.position.set(0, 0.88, 0);
    bodyPivot.add(upper);
    addBox(upper, 1.38, 1.12, 0.86, 0, 0.56, 0, frostBlue);
    addBox(upper, 1.34, 0.34, 0.84, 0, 0.16, 0, leatherMat);
    const head = new THREE.Group();
    head.position.set(0, 1.16, 0.04);
    addBox(head, 0.78, 0.72, 0.72, 0, 0.36, 0, frostBlue);
    addBox(head, 0.82, 0.24, 0.76, 0, 0.72, 0, snowBeard);
    addBox(head, 0.62, 0.44, 0.24, 0, 0.08, 0.36, snowBeard);
    const eL = addBox(head, 0.15, 0.12, 0.08, -0.18, 0.42, 0.38, iceCrystal, false);
    const eR = addBox(head, 0.15, 0.12, 0.08, 0.18, 0.42, 0.38, iceCrystal, false);
    upper.add(head);
    const lArm = new THREE.Group();
    lArm.position.set(-0.9, 0.96, 0);
    addBox(lArm, 0.4, 0.94, 0.4, 0, -0.45, 0, frostDeep);
    const rArm = new THREE.Group();
    rArm.position.set(0.9, 0.96, 0);
    addBox(rArm, 0.4, 0.94, 0.4, 0, -0.45, 0, frostDeep);
    const iceClub = new THREE.Group();
    iceClub.position.set(0, -0.88, 0.16);
    addBox(iceClub, 0.22, 0.22, 1.34, 0, 0, 0.48, woodMat);
    addBox(iceClub, 0.44, 0.44, 0.52, 0, 0, 0.96, iceCrystal);
    rArm.add(iceClub);
    upper.add(lArm, rArm);
    rig.legs = legs;
    rig.upperBody = upper;
    rig.headGroup = head;
    rig.leftArm = lArm;
    rig.rightArm = rArm;
    rig.weaponGroup = iceClub;
    rig.eyes = [eL, eR];
  } else if (type === 'iron_juggernaut') {
    const steel = palette.getMat(0x64748b, 'metal');
    const darkSteel = palette.getMat(0x334155, 'metal');
    const cyanCore = palette.getMat(0x22d3ee, 'emissive');
    const legs = [
      makeBipedLeg(-0.42, 0.9, 0.46, 0.48, darkSteel, steel),
      makeBipedLeg(0.42, 0.9, 0.46, 0.48, darkSteel, steel),
    ];
    bodyPivot.add(...legs);
    const upper = new THREE.Group();
    upper.position.set(0, 0.9, 0);
    bodyPivot.add(upper);
    addBox(upper, 1.44, 1.18, 0.92, 0, 0.6, 0, steel);
    addBox(upper, 1.1, 0.72, 0.96, 0, 0.68, 0, darkSteel);
    addBox(upper, 0.32, 0.28, 0.12, 0, 0.72, 0.48, cyanCore, false);
    const head = new THREE.Group();
    head.position.set(0, 1.22, 0);
    addBox(head, 0.72, 0.64, 0.72, 0, 0.32, 0, steel);
    const visor = addBox(head, 0.52, 0.14, 0.1, 0, 0.34, 0.37, cyanCore, false);
    upper.add(head);
    const makeMechArm = (ax: number): THREE.Group => {
      const arm = new THREE.Group();
      arm.position.set(ax, 1.06, 0);
      addBox(arm, 0.54, 0.46, 0.54, 0, -0.12, 0, steel);
      addBox(arm, 0.44, 0.66, 0.44, 0, -0.62, 0, darkSteel);
      return arm;
    };
    const lArm = makeMechArm(-0.96);
    const rArm = makeMechArm(0.96);
    upper.add(lArm, rArm);
    rig.legs = legs;
    rig.upperBody = upper;
    rig.headGroup = head;
    rig.leftArm = lArm;
    rig.rightArm = rArm;
    rig.eyes = [visor];
  } else if (type === 'ancient_treant') {
    const bark = palette.getMat(0x5c3a21, 'matte');
    const darkBark = palette.getMat(0x3f2715, 'matte');
    const leafDark = palette.getMat(0x15803d, 'matte');
    const leafBright = palette.getMat(0x22c55e, 'matte');
    const amberEye = palette.getMat(0xfbbf24, 'emissive');
    const legs = [
      makeBipedLeg(-0.42, 0.92, 0.44, 0.54, darkBark),
      makeBipedLeg(0.42, 0.92, 0.44, 0.54, darkBark),
    ];
    bodyPivot.add(...legs);
    const upper = new THREE.Group();
    upper.position.set(0, 0.92, 0);
    bodyPivot.add(upper);
    addBox(upper, 1.18, 1.38, 0.92, 0, 0.7, 0, bark);
    const eL = addBox(upper, 0.18, 0.14, 0.1, -0.24, 1.04, 0.48, amberEye, false);
    const eR = addBox(upper, 0.18, 0.14, 0.1, 0.24, 1.04, 0.48, amberEye, false);
    const head = new THREE.Group();
    head.position.set(0, 1.42, 0);
    addBox(head, 2.15, 0.76, 1.85, 0, 0.34, 0, leafDark);
    addBox(head, 1.55, 0.56, 1.4, 0, 0.88, 0, leafBright);
    upper.add(head);
    const lArm = new THREE.Group();
    lArm.position.set(-0.8, 1.06, 0);
    addBox(lArm, 0.34, 1.06, 0.34, 0, -0.48, 0, bark);
    addBox(lArm, 0.56, 0.34, 0.52, -0.1, 0.06, 0, leafBright);
    const rArm = new THREE.Group();
    rArm.position.set(0.8, 1.06, 0);
    addBox(rArm, 0.34, 1.06, 0.34, 0, -0.48, 0, bark);
    addBox(rArm, 0.56, 0.34, 0.52, 0.1, 0.06, 0, leafBright);
    upper.add(lArm, rArm);
    rig.legs = legs;
    rig.upperBody = upper;
    rig.headGroup = head;
    rig.leftArm = lArm;
    rig.rightArm = rArm;
    rig.eyes = [eL, eR];
  } else if (type === 'obsidian_hydra') {
    const obsDark = palette.getMat(0x1e1b4b, 'gloss');
    const obsPurple = palette.getMat(0x4c1d95, 'gloss');
    const bellyFire = palette.getMat(0xf97316, 'emissive');
    const hydraEye = palette.getMat(0xe879f9, 'emissive');
    const legs = [
      makeBipedLeg(-0.46, 0.78, 0.38, 0.44, obsDark),
      makeBipedLeg(0.46, 0.78, 0.38, 0.44, obsDark),
    ];
    bodyPivot.add(...legs);
    const upper = new THREE.Group();
    upper.position.set(0, 0.78, 0);
    bodyPivot.add(upper);
    addBox(upper, 1.38, 1.02, 1.15, 0, 0.54, 0, obsDark);
    addBox(upper, 0.88, 0.68, 0.18, 0, 0.52, 0.56, bellyFire, false);
    const extraHeads: THREE.Group[] = [];
    const eyes: THREE.Mesh[] = [];
    const makeHydraHead = (hx: number, hy: number, hz: number, ry: number): THREE.Group => {
      const h = new THREE.Group();
      h.position.set(hx, hy, hz);
      h.rotation.y = ry;
      addBox(h, 0.32, 0.68, 0.32, 0, 0.34, 0.08, obsPurple);
      addBox(h, 0.5, 0.42, 0.68, 0, 0.72, 0.24, obsDark);
      addBox(h, 0.1, 0.28, 0.1, -0.18, 1.0, 0.06, obsPurple);
      addBox(h, 0.1, 0.28, 0.1, 0.18, 1.0, 0.06, obsPurple);
      const e1 = addBox(h, 0.1, 0.1, 0.08, -0.15, 0.76, 0.59, hydraEye, false);
      const e2 = addBox(h, 0.1, 0.1, 0.08, 0.15, 0.76, 0.59, hydraEye, false);
      eyes.push(e1, e2);
      return h;
    };
    const centerHead = makeHydraHead(0, 1.08, 0.24, 0);
    const leftHead = makeHydraHead(-0.62, 0.96, 0.22, 0.26);
    const rightHead = makeHydraHead(0.62, 0.96, 0.22, -0.26);
    extraHeads.push(leftHead, rightHead);
    upper.add(centerHead, leftHead, rightHead);
    const leftWing = new THREE.Group();
    leftWing.position.set(-0.62, 0.88, -0.34);
    addBox(leftWing, 1.48, 0.82, 0.1, -0.78, 0.3, -0.06, obsPurple);
    const rightWing = new THREE.Group();
    rightWing.position.set(0.62, 0.88, -0.34);
    addBox(rightWing, 1.48, 0.82, 0.1, 0.78, 0.3, -0.06, obsPurple);
    const tail = new THREE.Group();
    tail.position.set(0, 0.32, -0.58);
    addBox(tail, 0.38, 0.34, 1.15, 0, -0.06, -0.56, obsDark);
    upper.add(leftWing, rightWing, tail);
    rig.legs = legs;
    rig.upperBody = upper;
    rig.headGroup = centerHead;
    rig.extraHeads = extraHeads;
    rig.leftWing = leftWing;
    rig.rightWing = rightWing;
    rig.tailPivot = tail;
    rig.eyes = eyes;
  } else if (type === 'titan_colossus') {
    // titan_colossus (#20), Ancient stone + gold rune monolith colossus
    const colStone = palette.getMat(0x94a3b8, 'matte');
    const colDark = palette.getMat(0x475569, 'matte');
    const goldRune = palette.getMat(0xd97706, 'metal');
    const cyanEye = palette.getMat(0x22d3ee, 'emissive');
    const legs = [
      makeBipedLeg(-0.46, 0.98, 0.5, 0.52, colDark, colStone),
      makeBipedLeg(0.46, 0.98, 0.5, 0.52, colDark, colStone),
    ];
    bodyPivot.add(...legs);
    const upper = new THREE.Group();
    upper.position.set(0, 0.98, 0);
    bodyPivot.add(upper);
    addBox(upper, 1.56, 1.28, 0.98, 0, 0.64, 0, colStone);
    addBox(upper, 1.52, 0.24, 0.98, 0, 0.16, 0, goldRune);
    addBox(upper, 0.88, 0.56, 1.02, 0, 0.72, 0, colDark);
    addBox(upper, 0.34, 0.34, 0.12, 0, 0.72, 0.52, cyanEye, false);
    const head = new THREE.Group();
    head.position.set(0, 1.32, 0);
    addBox(head, 0.78, 0.74, 0.74, 0, 0.37, 0, colStone);
    addBox(head, 0.84, 0.16, 0.78, 0, 0.74, 0, goldRune);
    const visor = addBox(head, 0.46, 0.16, 0.1, 0, 0.38, 0.39, cyanEye, false);
    upper.add(head);
    const makeTitanArm = (ax: number): THREE.Group => {
      const arm = new THREE.Group();
      arm.position.set(ax, 1.14, 0);
      addBox(arm, 0.58, 0.48, 0.58, 0, -0.14, 0, goldRune);
      addBox(arm, 0.48, 0.84, 0.48, 0, -0.74, 0, colStone);
      return arm;
    };
    const lArm = makeTitanArm(-1.04);
    const rArm = makeTitanArm(1.04);
    upper.add(lArm, rArm);
    rig.legs = legs;
    rig.upperBody = upper;
    rig.headGroup = head;
    rig.leftArm = lArm;
    rig.rightArm = rArm;
    rig.eyes = [visor];
  } else if (type === 'goring_shark') {
    // Sea #1: Goring Shark (Hiu Ganas) berupa slate-grey shark, pale belly, crimson scars, red eyes, bloody teeth
    const sharkGrey = palette.getMat(0x334155, 'gloss');
    const sharkDark = palette.getMat(0x1e293b, 'matte');
    const bellyMat = palette.getMat(0xcbd5e1, 'matte');
    const scarRed = palette.getMat(0xb91c1c, 'emissive');
    const eyeRed = palette.getMat(0xef4444, 'emissive');
    const toothBone = palette.getMat(0xf8fafc, 'matte');

    // Main muscular torpedo torso
    addBox(bodyPivot, 0.98, 0.88, 2.15, 0, 0.56, 0.05, sharkGrey);
    addBox(bodyPivot, 0.86, 0.24, 1.85, 0, 0.18, 0.08, bellyMat);
    // Battle scars on sides
    addBox(bodyPivot, 0.06, 0.24, 0.55, -0.5, 0.62, 0.35, scarRed, false).rotation.x = 0.4;
    addBox(bodyPivot, 0.06, 0.24, 0.5, 0.5, 0.66, 0.1, scarRed, false).rotation.x = -0.35;
    addBox(bodyPivot, 0.06, 0.2, 0.35, 0.5, 0.52, 0.55, scarRed, false).rotation.x = 0.3;
    // Tall menacing dorsal fin
    const dorsal = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.95, 0.68), sharkDark);
    dorsal.position.set(0, 1.32, -0.08);
    dorsal.rotation.x = -0.32;
    dorsal.castShadow = true;
    bodyPivot.add(dorsal);
    addBox(bodyPivot, 0.1, 0.32, 0.24, 0, 1.05, -0.82, sharkDark); // rear dorsal finlet

    // Swept pectoral fins (flap slightly via wings)
    const lFin = new THREE.Group();
    lFin.position.set(-0.48, 0.34, 0.35);
    const lBlade = addBox(lFin, 0.92, 0.1, 0.46, -0.44, -0.08, -0.14, sharkDark);
    lBlade.rotation.y = 0.32;
    lBlade.rotation.z = 0.18;
    const rFin = new THREE.Group();
    rFin.position.set(0.48, 0.34, 0.35);
    const rBlade = addBox(rFin, 0.92, 0.1, 0.46, 0.44, -0.08, -0.14, sharkDark);
    rBlade.rotation.y = -0.32;
    rBlade.rotation.z = -0.18;
    bodyPivot.add(lFin, rFin);

    // Snout & open bloody jaw
    const head = new THREE.Group();
    head.position.set(0, 0.58, 1.12);
    addBox(head, 0.88, 0.46, 0.92, 0, 0.16, 0.42, sharkGrey);
    addBox(head, 0.68, 0.28, 0.46, 0, 0.18, 0.92, sharkGrey);
    const eL = addBox(head, 0.12, 0.12, 0.16, -0.45, 0.22, 0.38, eyeRed, false);
    const eR = addBox(head, 0.12, 0.12, 0.16, 0.45, 0.22, 0.38, eyeRed, false);
    // Upper teeth
    for (const tz of [0.28, 0.5, 0.72, 0.94]) {
      addBox(head, 0.08, 0.14, 0.08, -0.32, -0.1, tz, toothBone, false);
      addBox(head, 0.08, 0.14, 0.08, 0.32, -0.1, tz, toothBone, false);
    }
    addBox(head, 0.08, 0.16, 0.08, -0.14, -0.11, 1.0, scarRed, false);
    addBox(head, 0.08, 0.16, 0.08, 0.14, -0.11, 1.0, toothBone, false);
    const jaw = new THREE.Group();
    jaw.position.set(0, -0.14, 0.04);
    addBox(jaw, 0.72, 0.2, 0.84, 0, -0.12, 0.42, bellyMat);
    addBox(jaw, 0.58, 0.06, 0.68, 0, -0.01, 0.42, scarRed, false);
    for (const tz of [0.24, 0.46, 0.68]) {
      addBox(jaw, 0.07, 0.13, 0.07, -0.26, 0.05, tz, toothBone, false);
      addBox(jaw, 0.07, 0.13, 0.07, 0.26, 0.05, tz, toothBone, false);
    }
    jaw.rotation.x = 0.28;
    head.add(jaw);
    bodyPivot.add(head);

    // Caudal tail fin
    const tail = new THREE.Group();
    tail.position.set(0, 0.56, -1.02);
    addBox(tail, 0.56, 0.54, 0.88, 0, 0, -0.44, sharkGrey);
    addBox(tail, 0.36, 0.36, 0.65, 0, 0.02, -1.08, sharkDark);
    const upperTail = addBox(tail, 0.14, 1.05, 0.44, 0, 0.44, -1.42, sharkDark);
    upperTail.rotation.x = -0.42;
    const lowerTail = addBox(tail, 0.12, 0.62, 0.34, 0, -0.28, -1.36, sharkDark);
    lowerTail.rotation.x = 0.42;
    bodyPivot.add(tail);

    rig.headGroup = head;
    rig.jawPivot = jaw;
    rig.leftWing = lFin;
    rig.rightWing = rFin;
    rig.tailPivot = tail;
    rig.eyes = [eL, eR];
  } else if (type === 'abyssal_kraken') {
    // Sea #2: Abyssal Kraken dengan massive purple mantle, glowing amber eyes, 8 curled tentacle arms + water swirl base
    const krakPurple = palette.getMat(0x4c1d95, 'gloss');
    const krakDark = palette.getMat(0x2e1065, 'matte');
    const suckerLilac = palette.getMat(0xc084fc, 'matte');
    const eyeAmber = palette.getMat(0xfbbf24, 'emissive');
    const foamCyan = palette.getMat(0x67e8f9, 'emissive');
    const foamWhite = palette.getMat(0xe0f2fe, 'glass');

    // Swirling ocean vortex ring at waterline
    const vortex = new THREE.Group();
    vortex.position.set(0, 0.08, 0);
    const swirlOuter = new THREE.Mesh(new THREE.RingGeometry(1.15, 2.35, 24), foamWhite);
    swirlOuter.rotation.x = -Math.PI / 2;
    vortex.add(swirlOuter);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const wave = addBox(vortex, 0.72, 0.24, 0.34, Math.cos(a) * 1.65, 0.1, Math.sin(a) * 1.65, foamCyan, false);
      wave.rotation.y = -a + 0.45;
    }
    bodyPivot.add(vortex);

    const head = new THREE.Group();
    head.position.set(0, 0.65, 0);
    addBox(head, 1.18, 1.05, 1.18, 0, 0.55, 0, krakPurple);
    // Tall pointed cephalopod mantle tilted backward
    const mantle = new THREE.Group();
    mantle.position.set(0, 1.1, -0.1);
    mantle.rotation.x = -0.26;
    addBox(mantle, 1.12, 1.48, 1.12, 0, 0.74, 0, krakPurple);
    addBox(mantle, 0.78, 0.72, 0.78, 0, 1.72, 0, krakDark);
    addBox(mantle, 1.76, 0.82, 0.26, 0, 1.56, 0, krakDark); // spear fins
    head.add(mantle);
    const eL = addBox(head, 0.24, 0.24, 0.14, -0.48, 0.55, 0.58, eyeAmber, false);
    const eR = addBox(head, 0.24, 0.24, 0.14, 0.48, 0.55, 0.58, eyeAmber, false);
    bodyPivot.add(head);

    // 8 radiating articulated tentacle groups
    const tentacles: THREE.Group[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + 0.2;
      const tGrp = new THREE.Group();
      tGrp.position.set(Math.cos(angle) * 0.72, 0.52, Math.sin(angle) * 0.72);
      tGrp.rotation.y = -angle + Math.PI / 2;
      addBox(tGrp, 0.32, 0.32, 0.76, 0, -0.08, 0.36, krakDark);
      addBox(tGrp, 0.24, 0.12, 0.68, 0, -0.22, 0.36, suckerLilac, false);
      const mid = addBox(tGrp, 0.26, 0.26, 0.74, 0, 0.12, 0.96, krakPurple);
      mid.rotation.x = -0.45;
      const tip = addBox(tGrp, 0.18, 0.18, 0.58, 0, 0.48, 1.42, krakDark);
      tip.rotation.x = -0.95;
      bodyPivot.add(tGrp);
      tentacles.push(tGrp);
    }

    rig.headGroup = head;
    rig.tentacles = tentacles;
    rig.vortexRing = vortex;
    rig.eyes = [eL, eR];
  } else if (type === 'electric_eel_drakon') {
    // Sea #3: Electric Eel-Drakon berupa S-curved aqua dragon-eel with golden belly/dorsal ridge & crackling lightning arcs
    const eelCyan = palette.getMat(0x06b6d4, 'gloss');
    const eelTeal = palette.getMat(0x0f766e, 'matte');
    const goldSpine = palette.getMat(0xfacc15, 'emissive');
    const boltNeon = palette.getMat(0x7dd3fc, 'emissive');
    const toothWhite = palette.getMat(0xf8fafc, 'matte');

    const head = new THREE.Group();
    head.position.set(0, 0.78, 1.45);
    addBox(head, 0.82, 0.54, 0.95, 0, 0.14, 0.25, eelTeal);
    addBox(head, 0.68, 0.18, 0.78, 0, -0.18, 0.28, goldSpine, false);
    // Dragon horns + whiskers
    addBox(head, 0.1, 0.42, 0.14, -0.32, 0.5, -0.1, goldSpine, false).rotation.x = -0.5;
    addBox(head, 0.1, 0.42, 0.14, 0.32, 0.5, -0.1, goldSpine, false).rotation.x = -0.5;
    addBox(head, 0.38, 0.07, 0.07, -0.45, 0.04, 0.62, goldSpine, false);
    addBox(head, 0.38, 0.07, 0.07, 0.45, 0.04, 0.62, goldSpine, false);
    const eL = addBox(head, 0.14, 0.14, 0.1, -0.36, 0.24, 0.58, goldSpine, false);
    const eR = addBox(head, 0.14, 0.14, 0.1, 0.36, 0.24, 0.58, goldSpine, false);
    addBox(head, 0.08, 0.14, 0.08, -0.22, -0.08, 0.65, toothWhite, false);
    addBox(head, 0.08, 0.14, 0.08, 0.22, -0.08, 0.65, toothWhite, false);
    bodyPivot.add(head);

    // S-curved undulating serpent body segments + electric lightning fins
    const segments: THREE.Group[] = [];
    for (let i = 0; i < 6; i++) {
      const seg = new THREE.Group();
      const zOff = 0.82 - i * 0.62;
      const xWave = Math.sin(i * 0.95) * 0.52;
      const size = Math.max(0.36, 0.78 - i * 0.07);
      seg.position.set(xWave, 0.48 + (i === 1 || i === 2 ? 0.24 : 0), zOff);
      addBox(seg, size, size * 0.88, 0.72, 0, 0, 0, i % 2 === 0 ? eelCyan : eelTeal);
      addBox(seg, size * 0.72, 0.18, 0.66, 0, -size * 0.42, 0, goldSpine, false);
      addBox(seg, 0.12, 0.48, 0.48, 0, size * 0.56, 0, goldSpine, false); // dorsal ridge
      if (i % 2 === 0) {
        addBox(seg, 0.08, 0.08, 0.62, -size * 0.68, 0.18, 0, boltNeon, false).rotation.z = 0.5;
        addBox(seg, 0.08, 0.08, 0.62, size * 0.68, 0.18, 0, boltNeon, false).rotation.z = -0.5;
      }
      bodyPivot.add(seg);
      segments.push(seg);
    }

    rig.headGroup = head;
    rig.segments = segments;
    rig.eyes = [eL, eR];
  } else if (type === 'leviathan_serpent') {
    // Sea #4: Leviathan Serpent berupa towering sea-green horned dragon serpent rising out of crashing water splash
    const levGreen = palette.getMat(0x0f766e, 'gloss');
    const levScale = palette.getMat(0x134e4a, 'matte');
    const levBelly = palette.getMat(0x5eead4, 'matte');
    const hornDark = palette.getMat(0x1e293b, 'matte');
    const eyeOrange = palette.getMat(0xf59e0b, 'emissive');
    const toothWhite = palette.getMat(0xf8fafc, 'matte');
    const foamMat = palette.getMat(0xe0f2fe, 'glass');

    // Splash collar around base
    const vortex = new THREE.Group();
    const splashRing = new THREE.Mesh(new THREE.RingGeometry(0.95, 2.05, 20), foamMat);
    splashRing.rotation.x = -Math.PI / 2;
    splashRing.position.y = 0.08;
    vortex.add(splashRing);
    bodyPivot.add(vortex);

    // Towering arched serpent neck & ridged tail
    const upper = new THREE.Group();
    upper.position.set(0, 0.35, 0.1);
    addBox(upper, 1.08, 1.15, 0.98, 0, 0.55, 0, levGreen);
    addBox(upper, 0.88, 1.15, 0.95, 0, 1.55, 0.22, levGreen);
    addBox(upper, 0.72, 2.05, 0.22, 0, 1.05, 0.56, levBelly);
    for (let i = 0; i < 4; i++) {
      addBox(upper, 0.16, 0.36, 0.34, 0, 0.45 + i * 0.48, -0.54 + i * 0.08, hornDark);
    }
    bodyPivot.add(upper);

    const head = new THREE.Group();
    head.position.set(0, 2.25, 0.48);
    addBox(head, 1.08, 0.62, 1.24, 0, 0.2, 0.42, levScale);
    addBox(head, 0.82, 0.42, 0.62, 0, 0.16, 1.15, levGreen);
    // Swept horns
    const hL = addBox(head, 0.18, 0.82, 0.2, -0.44, 0.68, -0.14, hornDark);
    hL.rotation.x = -0.68;
    hL.rotation.z = 0.25;
    const hR = addBox(head, 0.18, 0.82, 0.2, 0.44, 0.68, -0.14, hornDark);
    hR.rotation.x = -0.68;
    hR.rotation.z = -0.25;
    const eL = addBox(head, 0.18, 0.14, 0.12, -0.52, 0.24, 0.56, eyeOrange, false);
    const eR = addBox(head, 0.18, 0.14, 0.12, 0.52, 0.24, 0.56, eyeOrange, false);
    for (const tz of [0.65, 0.95, 1.26]) {
      addBox(head, 0.09, 0.2, 0.09, -0.34, -0.16, tz, toothWhite, false);
      addBox(head, 0.09, 0.2, 0.09, 0.34, -0.16, tz, toothWhite, false);
    }
    const jaw = new THREE.Group();
    jaw.position.set(0, -0.14, 0.12);
    addBox(jaw, 0.82, 0.22, 1.05, 0, -0.14, 0.62, levScale);
    for (const tz of [0.45, 0.78, 1.05]) {
      addBox(jaw, 0.08, 0.16, 0.08, -0.28, 0.02, tz, toothWhite, false);
      addBox(jaw, 0.08, 0.16, 0.08, 0.28, 0.02, tz, toothWhite, false);
    }
    jaw.rotation.x = 0.28;
    head.add(jaw);
    upper.add(head);

    // Trailing surging serpent coils behind splash
    const tail = new THREE.Group();
    tail.position.set(0, 0.35, -0.78);
    addBox(tail, 0.72, 0.76, 1.15, -0.26, 0.18, -0.56, levGreen);
    addBox(tail, 0.52, 0.62, 1.05, 0.22, 0.28, -1.48, levScale);
    bodyPivot.add(tail);

    rig.upperBody = upper;
    rig.headGroup = head;
    rig.jawPivot = jaw;
    rig.tailPivot = tail;
    rig.vortexRing = vortex;
    rig.eyes = [eL, eR];
  } else if (type === 'venomous_box_jelly') {
    // Sea #5: Venomous Box Jelly (Ubur-Ubur Maut) dengan translucent glowing ice-cyan cube bell + neon magenta inner core & tentacles
    const bellGlass = palette.getMat(0x38bdf8, 'glass');
    const bellEdge = palette.getMat(0x67e8f9, 'emissive');
    const coreMagenta = palette.getMat(0xe879f9, 'emissive');
    const tentaclePurple = palette.getMat(0xc026d3, 'emissive');

    const bell = new THREE.Group();
    bell.position.set(0, 0.95, 0);
    addBox(bell, 1.38, 1.24, 1.38, 0, 0.32, 0, bellGlass, false);
    addBox(bell, 0.72, 0.88, 0.72, 0, 0.36, 0, coreMagenta, false);
    // Glowing box corners/ribs
    for (const sx of [-0.66, 0.66]) {
      for (const sz of [-0.66, 0.66]) {
        addBox(bell, 0.1, 1.26, 0.1, sx, 0.32, sz, bellEdge, false);
      }
    }
    bodyPivot.add(bell);

    // 8 long trailing neon-magenta tentacles underneath
    const tentacles: THREE.Group[] = [];
    const offsets = [
      [-0.45, -0.45],
      [0.45, -0.45],
      [-0.45, 0.45],
      [0.45, 0.45],
      [0, -0.5],
      [0, 0.5],
      [-0.5, 0],
      [0.5, 0],
    ];
    for (const [tx, tz] of offsets) {
      const t = new THREE.Group();
      t.position.set(tx, 0.62, tz);
      addBox(t, 0.11, 0.82, 0.11, 0, -0.42, 0, coreMagenta, false);
      addBox(t, 0.08, 0.85, 0.08, 0.05, -1.18, -0.04, tentaclePurple, false);
      bodyPivot.add(t);
      tentacles.push(t);
    }

    rig.upperBody = bell;
    rig.tentacles = tentacles;
  } else if (type === 'giant_bone_jaw') {
    // Sea #6: Giant Bone-Jaw (Ikan Purba / Dunkleosteus) dengan dark brown-tan plated armor fish & massive bone shear jaws
    const armorDark = palette.getMat(0x451a03, 'matte');
    const armorPlate = palette.getMat(0x78350f, 'matte');
    const bonePlate = palette.getMat(0xd6b88d, 'matte');
    const eyeOrange = palette.getMat(0xf97316, 'emissive');

    // Armored segmented torso
    addBox(bodyPivot, 1.05, 0.94, 1.42, 0, 0.58, -0.15, armorDark);
    addBox(bodyPivot, 1.12, 0.48, 0.68, 0, 0.78, 0.28, armorPlate);
    addBox(bodyPivot, 0.96, 0.36, 0.58, 0, 0.74, -0.48, bonePlate);
    addBox(bodyPivot, 0.16, 0.52, 0.52, 0, 1.18, -0.2, armorPlate).rotation.x = -0.35; // dorsal fin
    addBox(bodyPivot, 0.72, 0.1, 0.42, -0.68, 0.32, 0.1, armorPlate).rotation.y = 0.28;
    addBox(bodyPivot, 0.72, 0.1, 0.42, 0.68, 0.32, 0.1, armorPlate).rotation.y = -0.28;

    // Massive prehistoric bone-shear skull
    const head = new THREE.Group();
    head.position.set(0, 0.62, 0.62);
    addBox(head, 1.08, 0.68, 0.92, 0, 0.16, 0.42, bonePlate);
    addBox(head, 0.98, 0.24, 0.86, 0, 0.48, 0.38, armorDark);
    const eL = addBox(head, 0.16, 0.16, 0.16, -0.54, 0.22, 0.48, eyeOrange, false);
    const eR = addBox(head, 0.16, 0.16, 0.16, 0.54, 0.22, 0.48, eyeOrange, false);
    // Chunky bony shear fangs upper
    addBox(head, 0.16, 0.24, 0.18, -0.34, -0.22, 0.78, bonePlate);
    addBox(head, 0.16, 0.24, 0.18, 0.34, -0.22, 0.78, bonePlate);
    addBox(head, 0.14, 0.2, 0.14, -0.34, -0.18, 0.45, bonePlate);
    addBox(head, 0.14, 0.2, 0.14, 0.34, -0.18, 0.45, bonePlate);

    const jaw = new THREE.Group();
    jaw.position.set(0, -0.2, 0.08);
    addBox(jaw, 0.86, 0.24, 0.84, 0, -0.14, 0.42, bonePlate);
    addBox(jaw, 0.16, 0.22, 0.16, -0.28, 0.04, 0.72, bonePlate);
    addBox(jaw, 0.16, 0.22, 0.16, 0.28, 0.04, 0.72, bonePlate);
    jaw.rotation.x = 0.25;
    head.add(jaw);
    bodyPivot.add(head);

    const tail = new THREE.Group();
    tail.position.set(0, 0.56, -0.84);
    addBox(tail, 0.58, 0.56, 0.78, 0, 0, -0.38, armorDark);
    addBox(tail, 0.14, 0.92, 0.42, 0, 0.28, -0.88, armorPlate).rotation.x = -0.35;
    addBox(tail, 0.12, 0.52, 0.32, 0, -0.24, -0.82, armorPlate).rotation.x = 0.35;
    bodyPivot.add(tail);

    rig.headGroup = head;
    rig.jawPivot = jaw;
    rig.tailPivot = tail;
    rig.eyes = [eL, eR];
  } else if (type === 'toxic_sea_viper') {
    // Sea #7: Toxic Sea Viper (Naga Laut Beracun) dengan violet snake body, neon lime belly scutes, fin-frill & dripping venom fangs
    const viperPurple = palette.getMat(0x581c87, 'gloss');
    const viperFrill = palette.getMat(0x7e22ce, 'matte');
    const venomGreen = palette.getMat(0x4ade80, 'emissive');
    const venomDark = palette.getMat(0x16a34a, 'matte');

    const head = new THREE.Group();
    head.position.set(0, 1.05, 1.05);
    addBox(head, 0.86, 0.44, 0.98, 0, 0.14, 0.35, viperPurple);
    addBox(head, 0.96, 0.26, 0.38, 0, 0.42, 0.05, viperFrill); // hood crest
    const eL = addBox(head, 0.16, 0.12, 0.12, -0.38, 0.2, 0.58, venomGreen, false);
    const eR = addBox(head, 0.16, 0.12, 0.12, 0.38, 0.2, 0.58, venomGreen, false);
    // Long dripping neon-green venom fangs
    addBox(head, 0.09, 0.32, 0.09, -0.24, -0.18, 0.76, venomGreen, false);
    addBox(head, 0.09, 0.32, 0.09, 0.24, -0.18, 0.76, venomGreen, false);
    const jaw = new THREE.Group();
    jaw.position.set(0, -0.1, 0.08);
    addBox(jaw, 0.64, 0.16, 0.82, 0, -0.1, 0.4, viperPurple);
    addBox(jaw, 0.08, 0.18, 0.08, -0.18, -0.24, 0.72, venomGreen, false); // venom drip
    jaw.rotation.x = 0.24;
    head.add(jaw);
    bodyPivot.add(head);

    const segments: THREE.Group[] = [];
    for (let i = 0; i < 6; i++) {
      const seg = new THREE.Group();
      const xCoil = Math.sin(i * 1.1) * 0.58;
      const yLift = i === 0 ? 0.88 : i === 1 ? 0.58 : 0.36;
      const zCoil = 0.45 - i * 0.58;
      seg.position.set(xCoil, yLift, zCoil);
      const w = Math.max(0.38, 0.72 - i * 0.05);
      addBox(seg, w, w * 0.86, 0.72, 0, 0, 0, viperPurple);
      addBox(seg, w * 0.74, 0.16, 0.66, 0, -w * 0.4, 0, venomDark, false);
      addBox(seg, 0.1, 0.48, 0.56, 0, w * 0.56, 0, viperFrill); // dorsal fin ridge
      bodyPivot.add(seg);
      segments.push(seg);
    }

    rig.headGroup = head;
    rig.jawPivot = jaw;
    rig.segments = segments;
    rig.eyes = [eL, eR];
  } else if (type === 'shadow_angler') {
    // Sea #8: Shadow Angler (Monster Laut Dalam) dengan pitch-black blocky body, giant needle teeth jaw, cyan eyes, golden lantern stalk
    const abyssBlack = palette.getMat(0x090d16, 'gloss');
    const abyssSlate = palette.getMat(0x1e293b, 'matte');
    const cyanEye = palette.getMat(0x22d3ee, 'emissive');
    const goldLure = palette.getMat(0xfbbf24, 'emissive');
    const needleTooth = palette.getMat(0xf8fafc, 'matte');

    const head = new THREE.Group();
    head.position.set(0, 0.72, 0.15);
    addBox(head, 1.32, 1.24, 1.48, 0, 0.24, -0.08, abyssBlack);
    addBox(head, 1.18, 0.22, 1.25, 0, 0.92, -0.15, abyssSlate);
    const eL = addBox(head, 0.16, 0.16, 0.14, -0.58, 0.48, 0.52, cyanEye, false);
    const eR = addBox(head, 0.16, 0.16, 0.14, 0.58, 0.48, 0.52, cyanEye, false);
    // Ragged side fins
    addBox(head, 0.66, 0.44, 0.1, -0.88, 0.12, -0.25, abyssSlate).rotation.y = 0.4;
    addBox(head, 0.66, 0.44, 0.1, 0.88, 0.12, -0.25, abyssSlate).rotation.y = -0.4;
    // Upper fangs
    for (const fx of [-0.46, -0.22, 0, 0.22, 0.46]) {
      addBox(head, 0.06, 0.28, 0.06, fx, -0.18, 0.64, needleTooth, false);
    }

    // Jutting underbite jaw bristling with long upward needle teeth
    const jaw = new THREE.Group();
    jaw.position.set(0, -0.24, 0.06);
    addBox(jaw, 1.24, 0.34, 1.15, 0, -0.16, 0.44, abyssBlack);
    for (const fx of [-0.48, -0.24, 0, 0.24, 0.48]) {
      addBox(jaw, 0.06, 0.42, 0.06, fx, 0.16, 0.94, needleTooth, false);
    }
    for (const fz of [0.42, 0.68]) {
      addBox(jaw, 0.06, 0.34, 0.06, -0.54, 0.12, fz, needleTooth, false);
      addBox(jaw, 0.06, 0.34, 0.06, 0.54, 0.12, fz, needleTooth, false);
    }
    jaw.rotation.x = 0.2;
    head.add(jaw);

    // Arched forehead illicium stalk + glowing amber bioluminescent lantern bulb!
    const lurePivot = new THREE.Group();
    lurePivot.position.set(0, 0.88, 0.48);
    addBox(lurePivot, 0.09, 0.72, 0.09, 0, 0.34, 0.14, abyssSlate).rotation.x = 0.4;
    addBox(lurePivot, 0.08, 0.08, 0.76, 0, 0.66, 0.62, abyssSlate);
    addBox(lurePivot, 0.06, 0.32, 0.06, 0, 0.46, 0.98, abyssSlate);
    const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 1), goldLure);
    orb.position.set(0, 0.28, 0.98);
    lurePivot.add(orb);
    head.add(lurePivot);

    bodyPivot.add(head);

    const tail = new THREE.Group();
    tail.position.set(0, 0.65, -0.65);
    addBox(tail, 0.56, 0.68, 0.62, 0, 0, -0.3, abyssBlack);
    addBox(tail, 0.12, 0.88, 0.44, 0, 0, -0.78, abyssSlate);
    bodyPivot.add(tail);

    rig.headGroup = head;
    rig.jawPivot = jaw;
    rig.tailPivot = tail;
    rig.weaponGroup = lurePivot;
    rig.eyes = [eL, eR];
  } else if (type === 'spiny_mega_stingray') {
    // Sea #9: Spiny Mega-Stingray (Pari Berduri) dengan wide navy diamond wings w/ cyan glowing spots, steel dorsal spines & barbed whip tail
    const rayNavy = palette.getMat(0x1e3a5f, 'gloss');
    const rayDark = palette.getMat(0x0f172a, 'matte');
    const spotCyan = palette.getMat(0x38bdf8, 'emissive');
    const spineGrey = palette.getMat(0x94a3b8, 'metal');
    const eyeYellow = palette.getMat(0xfacc15, 'emissive');

    // Central ridge + armor spine row
    addBox(bodyPivot, 0.96, 0.46, 1.95, 0, 0.34, 0, rayDark);
    for (const sz of [0.55, 0.18, -0.18, -0.55]) {
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.48, 4), spineGrey);
      sp.position.set(0, 0.72, sz);
      sp.rotation.x = -0.25;
      bodyPivot.add(sp);
    }
    const eL = addBox(bodyPivot, 0.14, 0.12, 0.16, -0.34, 0.56, 0.76, eyeYellow, false);
    const eR = addBox(bodyPivot, 0.14, 0.12, 0.16, 0.34, 0.56, 0.76, eyeYellow, false);

    // Wide undulating triangular-block wings with cyan spots
    const lWing = new THREE.Group();
    lWing.position.set(-0.45, 0.32, 0);
    addBox(lWing, 0.92, 0.2, 1.48, -0.46, 0, -0.05, rayNavy);
    addBox(lWing, 0.72, 0.12, 0.96, -1.16, 0, -0.18, rayNavy);
    addBox(lWing, 0.22, 0.08, 0.22, -0.52, 0.11, 0.28, spotCyan, false);
    addBox(lWing, 0.2, 0.08, 0.2, -0.98, 0.08, -0.12, spotCyan, false);
    addBox(lWing, 0.18, 0.08, 0.18, -0.58, 0.11, -0.48, spotCyan, false);

    const rWing = new THREE.Group();
    rWing.position.set(0.45, 0.32, 0);
    addBox(rWing, 0.92, 0.2, 1.48, 0.46, 0, -0.05, rayNavy);
    addBox(rWing, 0.72, 0.12, 0.96, 1.16, 0, -0.18, rayNavy);
    addBox(rWing, 0.22, 0.08, 0.22, 0.52, 0.11, 0.28, spotCyan, false);
    addBox(rWing, 0.2, 0.08, 0.2, 0.98, 0.08, -0.12, spotCyan, false);
    addBox(rWing, 0.18, 0.08, 0.18, 0.58, 0.11, -0.48, spotCyan, false);
    bodyPivot.add(lWing, rWing);

    // Long barbed whip tail
    const tail = new THREE.Group();
    tail.position.set(0, 0.32, -0.96);
    addBox(tail, 0.24, 0.22, 0.92, 0, 0, -0.44, rayDark);
    addBox(tail, 0.14, 0.14, 1.08, 0, 0.06, -1.35, rayNavy);
    for (const tz of [-0.55, -0.95, -1.35, -1.72]) {
      const barb = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.34, 4), spineGrey);
      barb.position.set(0, 0.22, tz);
      barb.rotation.x = -0.35;
      tail.add(barb);
    }
    bodyPivot.add(tail);

    rig.leftWing = lWing;
    rig.rightWing = rWing;
    rig.tailPivot = tail;
    rig.eyes = [eL, eR];
  } else if (type === 'charybdis_maw') {
    // Sea #10: Charybdis Maw berupa massive rotating whirlpool ringed by coral reef crust & concentric rings of sharp fangs
    const abyssCore = palette.getMat(0x020617, 'matte');
    const rockRim = palette.getMat(0x475569, 'matte');
    const coralPink = palette.getMat(0xf472b6, 'gloss');
    const coralOrange = palette.getMat(0xfb7185, 'gloss');
    const toothBone = palette.getMat(0xfef3c7, 'matte');
    const foamCyan = palette.getMat(0x38bdf8, 'emissive');
    const foamWhite = palette.getMat(0xe0f2fe, 'glass');

    // Deep pitch-black abyssal throat pit
    const pit = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 0.85, 0.52, 18), abyssCore);
    pit.position.y = 0.06;
    bodyPivot.add(pit);

    // Rotating vortex & coral-tooth crater ring
    const vortex = new THREE.Group();
    vortex.position.set(0, 0.12, 0);
    const outerSwirl = new THREE.Mesh(new THREE.RingGeometry(1.75, 2.75, 24), foamWhite);
    outerSwirl.rotation.x = -Math.PI / 2;
    outerSwirl.position.y = -0.02;
    vortex.add(outerSwirl);

    const coralCount = 12;
    for (let i = 0; i < coralCount; i++) {
      const a = (i / coralCount) * Math.PI * 2;
      const rx = Math.cos(a) * 1.56;
      const rz = Math.sin(a) * 1.56;
      const rock = addBox(vortex, 0.72, 0.44, 0.62, rx, 0.18, rz, rockRim);
      rock.rotation.y = -a;
      if (i % 2 === 0) {
        addBox(vortex, 0.34, 0.46, 0.28, rx * 1.12, 0.46, rz * 1.12, i % 4 === 0 ? coralPink : coralOrange);
      }
      // Swirling ocean crest outside the coral rim
      const foam = addBox(vortex, 0.82, 0.18, 0.28, Math.cos(a + 0.3) * 2.15, 0.06, Math.sin(a + 0.3) * 2.15, foamCyan, false);
      foam.rotation.y = -(a + 0.3) + 0.42;
    }

    // Double concentric rings of menacing inward-curved teeth!
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const tOut = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.56, 4), toothBone);
      tOut.position.set(Math.cos(a) * 1.24, 0.34, Math.sin(a) * 1.24);
      tOut.rotation.z = Math.cos(a) * 0.55;
      tOut.rotation.x = -Math.sin(a) * 0.55;
      vortex.add(tOut);

      if (i % 2 === 0) {
        const tIn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.42, 4), toothBone);
        tIn.position.set(Math.cos(a + 0.18) * 0.86, 0.2, Math.sin(a + 0.18) * 0.86);
        tIn.rotation.z = Math.cos(a + 0.18) * 0.72;
        tIn.rotation.x = -Math.sin(a + 0.18) * 0.72;
        vortex.add(tIn);
      }
    }
    bodyPivot.add(vortex);

    rig.vortexRing = vortex;
    rig.extraSpin = vortex;
  } else if (type === 'giga_wyvern') {
    // Sky #1: Giga-Wyvern (Naga Pembom) dengan obsidian charcoal dragon, blazing crimson belly/wings, glowing ember throat, wide bat wings & whip tail
    const wyvCharcoal = palette.getMat(0x1f2430, 'matte');
    const wyvDark = palette.getMat(0x0f172a, 'matte');
    const wyvRedScale = palette.getMat(0xdc2626, 'gloss');
    const wyvWingGlow = palette.getMat(0xef4444, 'emissive');
    const wyvFire = palette.getMat(0xf97316, 'emissive');

    // Armored serpentine chest & crimson underbelly
    addBox(bodyPivot, 1.02, 0.92, 1.56, 0, 0.72, 0, wyvCharcoal);
    addBox(bodyPivot, 0.78, 0.36, 1.44, 0, 0.32, 0.04, wyvRedScale);
    for (const sz of [0.42, 0.0, -0.42]) {
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.42, 4), wyvRedScale);
      sp.position.set(0, 1.28, sz);
      sp.rotation.x = -0.25;
      bodyPivot.add(sp);
    }

    // Neck & fierce dragon skull with glowing ember throat
    const head = new THREE.Group();
    head.position.set(0, 1.05, 0.78);
    addBox(head, 0.64, 0.66, 0.74, 0, 0.08, 0.12, wyvCharcoal);
    addBox(head, 0.76, 0.48, 0.96, 0, 0.24, 0.72, wyvCharcoal);
    addBox(head, 0.56, 0.34, 0.54, 0, 0.22, 1.28, wyvCharcoal);
    addBox(head, 0.46, 0.22, 0.36, 0, 0.06, 1.08, wyvFire, false); // glowing mouth flame
    const eL = addBox(head, 0.16, 0.14, 0.12, -0.34, 0.32, 0.96, wyvFire, false);
    const eR = addBox(head, 0.16, 0.14, 0.12, 0.34, 0.32, 0.96, wyvFire, false);
    const hL = addBox(head, 0.12, 0.68, 0.14, -0.3, 0.64, 0.38, wyvDark);
    hL.rotation.x = -0.68;
    hL.rotation.z = 0.24;
    const hR = addBox(head, 0.12, 0.68, 0.14, 0.3, 0.64, 0.38, wyvDark);
    hR.rotation.x = -0.68;
    hR.rotation.z = -0.24;

    const jaw = new THREE.Group();
    jaw.position.set(0, -0.02, 0.56);
    addBox(jaw, 0.62, 0.18, 0.86, 0, -0.08, 0.42, wyvCharcoal);
    for (const fx of [-0.2, 0.2]) {
      addBox(jaw, 0.08, 0.16, 0.08, fx, 0.06, 0.74, whiteBone, false);
    }
    jaw.rotation.x = 0.26;
    head.add(jaw);
    bodyPivot.add(head);

    // Huge crimson-veined dragon wings
    const lWing = new THREE.Group();
    lWing.position.set(-0.48, 1.04, 0.15);
    addBox(lWing, 1.48, 0.14, 0.18, -0.72, 0.24, 0.08, wyvDark);
    addBox(lWing, 1.56, 0.08, 1.18, -0.82, 0.16, -0.36, wyvRedScale);
    addBox(lWing, 1.42, 0.12, 0.16, -2.02, 0.04, -0.1, wyvDark).rotation.z = -0.24;
    addBox(lWing, 1.38, 0.08, 1.24, -1.96, -0.06, -0.58, wyvWingGlow, false);

    const rWing = new THREE.Group();
    rWing.position.set(0.48, 1.04, 0.15);
    addBox(rWing, 1.48, 0.14, 0.18, 0.72, 0.24, 0.08, wyvDark);
    addBox(rWing, 1.56, 0.08, 1.18, 0.82, 0.16, -0.36, wyvRedScale);
    addBox(rWing, 1.42, 0.12, 0.16, 2.02, 0.04, -0.1, wyvDark).rotation.z = 0.24;
    addBox(rWing, 1.38, 0.08, 1.24, 1.96, -0.06, -0.58, wyvWingGlow, false);
    bodyPivot.add(lWing, rWing);

    // Tucked clawed legs & spiked dragon whip tail
    const legL = makeBipedLeg(-0.36, 0.56, 0.24, 0.28, wyvCharcoal, wyvDark);
    legL.position.set(-0.36, 0.52, -0.18);
    legL.rotation.x = 0.35;
    const legR = makeBipedLeg(0.36, 0.56, 0.24, 0.28, wyvCharcoal, wyvDark);
    legR.position.set(0.36, 0.52, -0.18);
    legR.rotation.x = 0.35;
    bodyPivot.add(legL, legR);

    const tail = new THREE.Group();
    tail.position.set(0, 0.68, -0.78);
    addBox(tail, 0.42, 0.38, 0.98, 0, 0, -0.46, wyvCharcoal);
    addBox(tail, 0.24, 0.24, 0.94, 0, 0.06, -1.32, wyvRedScale);
    const spade = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.52, 4), wyvRedScale);
    spade.rotation.x = -Math.PI / 2;
    spade.position.set(0, 0.08, -1.94);
    tail.add(spade);
    bodyPivot.add(tail);

    rig.headGroup = head;
    rig.jawPivot = jaw;
    rig.leftWing = lWing;
    rig.rightWing = rWing;
    rig.legs = [legL, legR];
    rig.tailPivot = tail;
    rig.eyes = [eL, eR];
  } else if (type === 'crimson_phoenix') {
    // Sky #2: Crimson Phoenix (Burung Api) dengan blazing crimson body, layered flame-orange & gold feathers, fiery crest & fanned flame tail
    const phxRed = palette.getMat(0xdc2626, 'gloss');
    const phxOrange = palette.getMat(0xf97316, 'emissive');
    const phxGold = palette.getMat(0xfacc15, 'emissive');
    const phxBeak = palette.getMat(0xf59e0b, 'matte');

    addBox(bodyPivot, 0.86, 0.98, 1.18, 0, 0.78, 0, phxRed);
    addBox(bodyPivot, 0.68, 0.54, 0.76, 0, 0.66, 0.26, phxOrange, false);

    const head = new THREE.Group();
    head.position.set(0, 1.38, 0.36);
    addBox(head, 0.54, 0.52, 0.56, 0, 0.22, 0.08, phxRed);
    // 3 radiant head crest plumes
    addBox(head, 0.14, 0.52, 0.14, 0, 0.62, -0.06, phxGold, false).rotation.x = -0.48;
    addBox(head, 0.1, 0.42, 0.12, -0.14, 0.54, -0.12, phxOrange, false).rotation.x = -0.58;
    addBox(head, 0.1, 0.42, 0.12, 0.14, 0.54, -0.12, phxOrange, false).rotation.x = -0.58;
    // Hooked golden raptor beak
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.36, 4), phxBeak);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.18, 0.48);
    head.add(beak);
    const eL = addBox(head, 0.12, 0.12, 0.1, -0.24, 0.26, 0.24, phxGold, false);
    const eR = addBox(head, 0.12, 0.12, 0.1, 0.24, 0.26, 0.24, phxGold, false);
    bodyPivot.add(head);

    // Sweeping blazing phoenix wings (3 layered flame feather tiers per wing)
    const lWing = new THREE.Group();
    lWing.position.set(-0.42, 1.02, 0.04);
    addBox(lWing, 0.96, 0.16, 0.74, -0.5, 0.12, -0.08, phxRed);
    addBox(lWing, 0.88, 0.12, 0.68, -1.24, 0.26, -0.12, phxOrange, false);
    addBox(lWing, 0.72, 0.08, 0.54, -1.94, 0.38, -0.18, phxGold, false);
    addBox(lWing, 0.42, 0.08, 0.36, -1.56, 0.14, -0.54, phxGold, false);

    const rWing = new THREE.Group();
    rWing.position.set(0.42, 1.02, 0.04);
    addBox(rWing, 0.96, 0.16, 0.74, 0.5, 0.12, -0.08, phxRed);
    addBox(rWing, 0.88, 0.12, 0.68, 1.24, 0.26, -0.12, phxOrange, false);
    addBox(rWing, 0.72, 0.08, 0.54, 1.94, 0.38, -0.18, phxGold, false);
    addBox(rWing, 0.42, 0.08, 0.36, 1.56, 0.14, -0.54, phxGold, false);
    bodyPivot.add(lWing, rWing);

    // Golden talons
    const legL = makeBipedLeg(-0.22, 0.44, 0.16, 0.22, phxBeak, phxGold);
    legL.position.set(-0.22, 0.42, 0.08);
    legL.rotation.x = 0.28;
    const legR = makeBipedLeg(0.22, 0.44, 0.16, 0.22, phxBeak, phxGold);
    legR.position.set(0.22, 0.42, 0.08);
    legR.rotation.x = 0.28;
    bodyPivot.add(legL, legR);

    // Fanned flame tail plumes
    const tail = new THREE.Group();
    tail.position.set(0, 0.64, -0.58);
    for (const [tx, rz, mat] of [
      [-0.26, 0.3, phxOrange],
      [0, 0, phxGold],
      [0.26, -0.3, phxOrange],
    ] as const) {
      const plume = addBox(tail, 0.22, 0.1, 1.18, tx, 0.06, -0.56, mat, false);
      plume.rotation.y = rz;
    }
    bodyPivot.add(tail);

    rig.headGroup = head;
    rig.leftWing = lWing;
    rig.rightWing = rWing;
    rig.legs = [legL, legR];
    rig.tailPivot = tail;
    rig.eyes = [eL, eR];
  } else if (type === 'shadow_harpy') {
    // Sky #3: Shadow Harpy (Harpi Kegelapan) berupa charcoal-slate shadowed harpy maiden, wide raven wings, clawed hands & hooked talons
    const hrpDark = palette.getMat(0x111827, 'matte');
    const hrpFeather = palette.getMat(0x1e293b, 'gloss');
    const hrpSkin = palette.getMat(0x475569, 'matte');
    const hrpEye = palette.getMat(0xfde047, 'emissive');

    const legs = [
      makeBipedLeg(-0.22, 0.72, 0.22, 0.28, hrpSkin, hrpDark),
      makeBipedLeg(0.22, 0.72, 0.22, 0.28, hrpSkin, hrpDark),
    ];
    legs[0].rotation.x = 0.28;
    legs[1].rotation.x = 0.16;
    bodyPivot.add(...legs);

    const upper = new THREE.Group();
    upper.position.set(0, 0.72, 0);
    bodyPivot.add(upper);
    addBox(upper, 0.76, 0.94, 0.5, 0, 0.46, 0, hrpSkin);
    addBox(upper, 0.84, 0.34, 0.56, 0, 0.82, -0.02, hrpFeather); // feathered shoulder mantle

    const head = new THREE.Group();
    head.position.set(0, 0.98, 0.06);
    addBox(head, 0.56, 0.54, 0.54, 0, 0.28, 0, hrpSkin);
    addBox(head, 0.64, 0.62, 0.58, 0, 0.3, -0.1, hrpDark); // swept shadow hair hood
    const eL = addBox(head, 0.13, 0.1, 0.08, -0.15, 0.3, 0.27, hrpEye, false);
    const eR = addBox(head, 0.13, 0.1, 0.08, 0.15, 0.3, 0.27, hrpEye, false);
    upper.add(head);

    // Wide raven-feathered wing-arms with claws
    const lWing = new THREE.Group();
    lWing.position.set(-0.42, 0.84, -0.06);
    addBox(lWing, 0.92, 0.22, 0.68, -0.46, 0.12, -0.08, hrpFeather);
    addBox(lWing, 1.06, 0.14, 0.86, -1.32, 0.28, -0.16, hrpDark);
    addBox(lWing, 0.2, 0.28, 0.18, -0.52, -0.12, 0.32, hrpSkin); // forearm claw hand

    const rWing = new THREE.Group();
    rWing.position.set(0.42, 0.84, -0.06);
    addBox(rWing, 0.92, 0.22, 0.68, 0.46, 0.12, -0.08, hrpFeather);
    addBox(rWing, 1.06, 0.14, 0.86, 1.32, 0.28, -0.16, hrpDark);
    addBox(rWing, 0.2, 0.28, 0.18, 0.52, -0.12, 0.32, hrpSkin);
    upper.add(lWing, rWing);

    const tail = new THREE.Group();
    tail.position.set(0, 0.12, -0.26);
    addBox(tail, 0.58, 0.1, 0.72, 0, -0.18, -0.34, hrpDark).rotation.x = -0.35;
    upper.add(tail);

    rig.upperBody = upper;
    rig.headGroup = head;
    rig.leftWing = lWing;
    rig.rightWing = rWing;
    rig.legs = legs;
    rig.tailPivot = tail;
    rig.eyes = [eL, eR];
  } else if (type === 'giant_phantom') {
    // Sky #4: Giant Phantom (Pari Udara Raksasa) berupa deep astral-navy manta glider with glowing sky-cyan aura spots, cyan eyes & forked whip tail
    const phmNavy = palette.getMat(0x1e293b, 'gloss');
    const phmMidnight = palette.getMat(0x0f172a, 'matte');
    const phmCyan = palette.getMat(0x38bdf8, 'emissive');
    const phmAura = palette.getMat(0x7dd3fc, 'emissive');

    addBox(bodyPivot, 1.15, 0.44, 1.85, 0, 0.48, 0, phmMidnight);
    addBox(bodyPivot, 1.36, 0.24, 0.68, 0, 0.48, 0.72, phmNavy); // wide crescent manta head
    const eL = addBox(bodyPivot, 0.22, 0.16, 0.14, -0.44, 0.52, 1.02, phmAura, false);
    const eR = addBox(bodyPivot, 0.22, 0.16, 0.14, 0.44, 0.52, 1.02, phmAura, false);
    // Glowing cyan dorsal stripes
    addBox(bodyPivot, 0.24, 0.08, 1.1, 0, 0.72, -0.12, phmCyan, false);

    // Swept aerodynamic sky-manta wings with glowing edge highlights
    const lWing = new THREE.Group();
    lWing.position.set(-0.56, 0.48, 0.08);
    addBox(lWing, 1.05, 0.16, 1.36, -0.52, 0, -0.14, phmNavy);
    addBox(lWing, 1.15, 0.1, 0.78, -1.42, 0.04, -0.42, phmMidnight);
    addBox(lWing, 1.85, 0.08, 0.12, -1.06, 0.08, 0.36, phmCyan, false);

    const rWing = new THREE.Group();
    rWing.position.set(0.56, 0.48, 0.08);
    addBox(rWing, 1.05, 0.16, 1.36, 0.52, 0, -0.14, phmNavy);
    addBox(rWing, 1.15, 0.1, 0.78, 1.42, 0.04, -0.42, phmMidnight);
    addBox(rWing, 1.85, 0.08, 0.12, 1.06, 0.08, 0.36, phmCyan, false);
    bodyPivot.add(lWing, rWing);

    // Long trailing phantom whip tail
    const tail = new THREE.Group();
    tail.position.set(0, 0.44, -0.95);
    addBox(tail, 0.24, 0.18, 0.96, 0, 0, -0.48, phmNavy);
    addBox(tail, 0.12, 0.1, 1.05, 0, 0.02, -1.36, phmCyan, false);
    bodyPivot.add(tail);

    rig.leftWing = lWing;
    rig.rightWing = rWing;
    rig.tailPivot = tail;
    rig.eyes = [eL, eR];
  } else if (type === 'toxic_chimera') {
    // Sky #5: Toxic Chimera (Beast Berbisa Sungging) berupa olive-green lion beast, purple mane, green horns, dragon wings & venomous serpent tail
    const chiOlive = palette.getMat(0x65a30d, 'matte');
    const chiDark = palette.getMat(0x3f6212, 'matte');
    const chiMane = palette.getMat(0x7e22ce, 'matte');
    const chiVenom = palette.getMat(0x4ade80, 'emissive');

    const legs: THREE.Group[] = [];
    for (const [lx, lz] of [
      [-0.38, 0.52],
      [0.38, 0.52],
      [-0.38, -0.52],
      [0.38, -0.52],
    ]) {
      const leg = makeBipedLeg(lx, 0.68, 0.24, 0.26, chiOlive, chiDark);
      leg.position.z = lz;
      legs.push(leg);
    }
    bodyPivot.add(...legs);

    addBox(bodyPivot, 0.94, 0.76, 1.48, 0, 0.96, 0, chiOlive);

    const head = new THREE.Group();
    head.position.set(0, 1.18, 0.78);
    addBox(head, 1.04, 0.98, 0.48, 0, 0.08, -0.08, chiMane); // thick purple lion mane
    addBox(head, 0.68, 0.62, 0.68, 0, 0.08, 0.22, chiOlive);
    addBox(head, 0.48, 0.3, 0.34, 0, -0.06, 0.62, chiDark);
    const eL = addBox(head, 0.14, 0.12, 0.1, -0.2, 0.18, 0.58, chiVenom, false);
    const eR = addBox(head, 0.14, 0.12, 0.1, 0.2, 0.18, 0.58, chiVenom, false);
    addBox(head, 0.12, 0.54, 0.12, -0.24, 0.52, 0.08, chiVenom, false).rotation.x = -0.35;
    addBox(head, 0.12, 0.54, 0.12, 0.24, 0.52, 0.08, chiVenom, false).rotation.x = -0.35;
    bodyPivot.add(head);

    // Purple-veined green dragon wings
    const lWing = new THREE.Group();
    lWing.position.set(-0.44, 1.28, 0.18);
    addBox(lWing, 1.12, 0.12, 0.78, -0.56, 0.2, -0.14, chiMane);
    addBox(lWing, 1.06, 0.08, 0.88, -1.48, 0.14, -0.28, chiDark);
    addBox(lWing, 1.38, 0.1, 0.12, -1.16, 0.28, 0.2, chiVenom, false);

    const rWing = new THREE.Group();
    rWing.position.set(0.44, 1.28, 0.18);
    addBox(rWing, 1.12, 0.12, 0.78, 0.56, 0.2, -0.14, chiMane);
    addBox(rWing, 1.06, 0.08, 0.88, 1.48, 0.14, -0.28, chiDark);
    addBox(rWing, 1.38, 0.1, 0.12, 1.16, 0.28, 0.2, chiVenom, false);
    bodyPivot.add(lWing, rWing);

    // Snapping venomous serpent tail!
    const tail = new THREE.Group();
    tail.position.set(0, 1.02, -0.74);
    addBox(tail, 0.26, 0.26, 0.82, 0, 0.18, -0.36, chiDark);
    addBox(tail, 0.22, 0.74, 0.24, 0, 0.56, -0.76, chiOlive);
    addBox(tail, 0.44, 0.34, 0.52, 0, 0.96, -0.62, chiMane);
    addBox(tail, 0.08, 0.18, 0.08, -0.12, 0.82, -0.38, chiVenom, false);
    addBox(tail, 0.08, 0.18, 0.08, 0.12, 0.82, -0.38, chiVenom, false);
    bodyPivot.add(tail);

    rig.headGroup = head;
    rig.leftWing = lWing;
    rig.rightWing = rWing;
    rig.legs = legs;
    rig.tailPivot = tail;
    rig.eyes = [eL, eR];
  } else if (type === 'guardian_sentinel') {
    // Sky #6: Guardian Sentinel (Drone Penjaga) berupa ancient carved stone temple cube, glowing crimson cyclops laser lens, gold trim & 4 mech drone legs
    const senStone = palette.getMat(0xa8a29e, 'matte');
    const senDark = palette.getMat(0x57534e, 'matte');
    const senGold = palette.getMat(0xf59e0b, 'metal');
    const senLaser = palette.getMat(0xf43f5e, 'emissive');

    const upper = new THREE.Group();
    upper.position.set(0, 1.18, 0);
    addBox(upper, 1.18, 1.08, 1.18, 0, 0.28, 0, senStone);
    addBox(upper, 1.24, 0.16, 1.24, 0, 0.52, 0, senDark);
    addBox(upper, 0.74, 0.56, 0.18, 0, 0.24, 0.58, senGold);
    addBox(upper, 0.56, 0.38, 0.14, 0, 0.24, 0.62, senDark);
    const eye = addBox(upper, 0.28, 0.24, 0.12, 0, 0.24, 0.68, senLaser, false);
    // Spinning golden rune stabilizer ring around top
    const spin = new THREE.Group();
    spin.position.set(0, 0.94, 0);
    addBox(spin, 0.96, 0.1, 0.14, 0, 0, 0, senGold);
    addBox(spin, 0.14, 0.1, 0.96, 0, 0, 0, senGold);
    upper.add(spin);
    bodyPivot.add(upper);

    // 4 dangling golden-jointed mechanical drone legs
    const legs: THREE.Group[] = [];
    for (const [lx, lz] of [
      [-0.56, 0.56],
      [0.56, 0.56],
      [-0.56, -0.56],
      [0.56, -0.56],
    ]) {
      const leg = new THREE.Group();
      leg.position.set(lx, 0.74, lz);
      addBox(leg, 0.2, 0.24, 0.2, Math.sign(lx) * 0.1, -0.1, Math.sign(lz) * 0.1, senGold);
      const shin = addBox(leg, 0.18, 0.62, 0.18, Math.sign(lx) * 0.18, -0.44, Math.sign(lz) * 0.18, senDark);
      shin.rotation.z = Math.sign(lx) * -0.18;
      legs.push(leg);
      bodyPivot.add(leg);
    }

    rig.upperBody = upper;
    rig.extraSpin = spin;
    rig.legs = legs;
    rig.eyes = [eye];
  } else if (type === 'ice_shard_griffin') {
    // Sky #7: Ice Shard Griffin (Griffin Badai Es) dengan warm tan beast hindquarters, glacial frost-blue feathered shoulders, eagle beak & crystalline ice wings
    const grfFur = palette.getMat(0xa16207, 'matte');
    const grfIce = palette.getMat(0x38bdf8, 'gloss');
    const grfFrost = palette.getMat(0xe0f2fe, 'matte');
    const grfGold = palette.getMat(0xfacc15, 'matte');
    const grfEye = palette.getMat(0x67e8f9, 'emissive');

    const legs: THREE.Group[] = [];
    for (const [lx, lz, mat] of [
      [-0.36, 0.52, grfGold],
      [0.36, 0.52, grfGold],
      [-0.36, -0.52, grfFur],
      [0.36, -0.52, grfFur],
    ] as const) {
      const leg = makeBipedLeg(lx, 0.68, 0.22, 0.24, mat, grfGold);
      leg.position.z = lz;
      legs.push(leg);
    }
    bodyPivot.add(...legs);

    addBox(bodyPivot, 0.92, 0.74, 1.48, 0, 0.96, 0, grfFur);
    addBox(bodyPivot, 0.98, 0.84, 0.72, 0, 1.02, 0.42, grfIce);
    addBox(bodyPivot, 0.78, 0.58, 0.34, 0, 0.98, 0.74, grfFrost);

    const head = new THREE.Group();
    head.position.set(0, 1.48, 0.66);
    addBox(head, 0.62, 0.58, 0.62, 0, 0.14, 0.08, grfFrost);
    addBox(head, 0.68, 0.38, 0.44, 0, 0.36, -0.06, grfIce); // icy crest ruff
    addBox(head, 0.1, 0.44, 0.12, -0.22, 0.54, -0.06, grfIce).rotation.x = -0.52;
    addBox(head, 0.1, 0.44, 0.12, 0.22, 0.54, -0.06, grfIce).rotation.x = -0.52;
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.42, 4), grfGold);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.08, 0.52);
    head.add(beak);
    const eL = addBox(head, 0.13, 0.11, 0.1, -0.24, 0.22, 0.28, grfEye, false);
    const eR = addBox(head, 0.13, 0.11, 0.1, 0.24, 0.22, 0.28, grfEye, false);
    bodyPivot.add(head);

    const lWing = new THREE.Group();
    lWing.position.set(-0.44, 1.32, 0.22);
    addBox(lWing, 1.04, 0.14, 0.78, -0.52, 0.14, -0.1, grfIce);
    addBox(lWing, 0.98, 0.1, 0.66, -1.36, 0.28, -0.18, grfFrost);

    const rWing = new THREE.Group();
    rWing.position.set(0.44, 1.32, 0.22);
    addBox(rWing, 1.04, 0.14, 0.78, 0.52, 0.14, -0.1, grfIce);
    addBox(rWing, 0.98, 0.1, 0.66, 1.36, 0.28, -0.18, grfFrost);
    bodyPivot.add(lWing, rWing);

    const tail = new THREE.Group();
    tail.position.set(0, 1.02, -0.76);
    addBox(tail, 0.14, 0.14, 0.86, 0, 0.1, -0.4, grfFur);
    addBox(tail, 0.34, 0.24, 0.38, 0, 0.2, -0.92, grfIce);
    bodyPivot.add(tail);

    rig.headGroup = head;
    rig.leftWing = lWing;
    rig.rightWing = rWing;
    rig.legs = legs;
    rig.tailPivot = tail;
    rig.eyes = [eL, eR];
  } else if (type === 'blight_hornet') {
    // Sky #8: Blight Hornet (Tawon Raksasa Beracun) dengan jet-black wasp thorax, striped green-toxic glowing abdomen, giant lime compound eyes & 4 translucent veined wings
    const hrnBlack = palette.getMat(0x0f172a, 'gloss');
    const hrnSlate = palette.getMat(0x1e293b, 'matte');
    const hrnToxic = palette.getMat(0x4ade80, 'emissive');
    const hrnWing = palette.getMat(0x86efac, 'glass');

    addBox(bodyPivot, 0.74, 0.68, 0.86, 0, 0.76, 0.14, hrnBlack); // thorax

    const head = new THREE.Group();
    head.position.set(0, 0.74, 0.68);
    addBox(head, 0.62, 0.54, 0.48, 0, 0, 0.12, hrnBlack);
    const eL = addBox(head, 0.24, 0.26, 0.22, -0.26, 0.06, 0.24, hrnToxic, false);
    const eR = addBox(head, 0.24, 0.26, 0.22, 0.26, 0.06, 0.24, hrnToxic, false);
    addBox(head, 0.06, 0.34, 0.06, -0.16, 0.34, 0.26, hrnBlack).rotation.x = 0.48;
    addBox(head, 0.06, 0.34, 0.06, 0.16, 0.34, 0.26, hrnBlack).rotation.x = 0.48;
    bodyPivot.add(head);

    // Striped toxic glowing hornet abdomen + sharp stinger
    const tail = new THREE.Group();
    tail.position.set(0, 0.72, -0.32);
    addBox(tail, 0.72, 0.68, 0.44, 0, -0.06, -0.28, hrnToxic, false);
    addBox(tail, 0.76, 0.7, 0.24, 0, -0.08, -0.54, hrnBlack);
    addBox(tail, 0.62, 0.58, 0.3, 0, -0.14, -0.78, hrnToxic, false);
    addBox(tail, 0.48, 0.44, 0.28, 0, -0.2, -1.04, hrnBlack);
    const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.46, 5), hrnSlate);
    stinger.rotation.x = -Math.PI * 0.56;
    stinger.position.set(0, -0.28, -1.32);
    tail.add(stinger);
    bodyPivot.add(tail);

    // 4 translucent buzzing hornet wings
    const lWing = new THREE.Group();
    lWing.position.set(-0.34, 1.06, 0.14);
    addBox(lWing, 1.38, 0.04, 0.52, -0.68, 0.08, -0.06, hrnWing, false).rotation.y = 0.18;
    addBox(lWing, 0.96, 0.04, 0.38, -0.48, 0.02, -0.42, hrnWing, false).rotation.y = 0.44;

    const rWing = new THREE.Group();
    rWing.position.set(0.34, 1.06, 0.14);
    addBox(rWing, 1.38, 0.04, 0.52, 0.68, 0.08, -0.06, hrnWing, false).rotation.y = -0.18;
    addBox(rWing, 0.96, 0.04, 0.38, 0.48, 0.02, -0.42, hrnWing, false).rotation.y = -0.44;
    bodyPivot.add(lWing, rWing);

    // 6 jointed wasp legs tucked under thorax
    const legs: THREE.Group[] = [];
    for (const lz of [0.32, 0.06, -0.18]) {
      for (const side of [-1, 1]) {
        const leg = new THREE.Group();
        leg.position.set(side * 0.34, 0.46, lz);
        addBox(leg, 0.12, 0.42, 0.12, side * 0.14, -0.2, 0, hrnSlate).rotation.z = side * -0.42;
        legs.push(leg);
        bodyPivot.add(leg);
      }
    }

    rig.headGroup = head;
    rig.leftWing = lWing;
    rig.rightWing = rWing;
    rig.tailPivot = tail;
    rig.legs = legs;
    rig.eyes = [eL, eR];
  } else if (type === 'acidic_sky_wyrm') {
    // Sky #9: Acidic Sky-Wyrm (Naga Asam Udara) berupa flying emerald & chartreuse Eastern sky dragon with undulating S-coil segments & glowing acid fins
    const wyrmGreen = palette.getMat(0x16a34a, 'gloss');
    const wyrmDark = palette.getMat(0x14532d, 'matte');
    const wyrmAcid = palette.getMat(0x84cc16, 'emissive');
    const wyrmEye = palette.getMat(0xfef08a, 'emissive');

    const head = new THREE.Group();
    head.position.set(0, 1.02, 1.48);
    addBox(head, 0.84, 0.52, 0.98, 0, 0.12, 0.25, wyrmGreen);
    addBox(head, 0.96, 0.28, 0.34, 0, 0.22, -0.08, wyrmAcid, false); // acidic mane collar
    addBox(head, 0.12, 0.46, 0.12, -0.28, 0.48, -0.05, wyrmAcid, false).rotation.x = -0.5;
    addBox(head, 0.12, 0.46, 0.12, 0.28, 0.48, -0.05, wyrmAcid, false).rotation.x = -0.5;
    const eL = addBox(head, 0.15, 0.13, 0.1, -0.36, 0.22, 0.56, wyrmEye, false);
    const eR = addBox(head, 0.15, 0.13, 0.1, 0.36, 0.22, 0.56, wyrmEye, false);
    const jaw = new THREE.Group();
    jaw.position.set(0, -0.1, 0.1);
    addBox(jaw, 0.66, 0.18, 0.86, 0, -0.1, 0.44, wyrmDark);
    addBox(jaw, 0.08, 0.16, 0.08, -0.22, 0.04, 0.72, whiteBone, false);
    addBox(jaw, 0.08, 0.16, 0.08, 0.22, 0.04, 0.72, whiteBone, false);
    jaw.rotation.x = 0.24;
    head.add(jaw);
    bodyPivot.add(head);

    // 7 undulating flying dragon body coils
    const segments: THREE.Group[] = [];
    for (let i = 0; i < 7; i++) {
      const seg = new THREE.Group();
      const xCoil = Math.sin(i * 0.95) * 0.56;
      const yCoil = 0.78 + Math.cos(i * 0.85) * 0.26;
      const zCoil = 0.82 - i * 0.58;
      seg.position.set(xCoil, yCoil, zCoil);
      const sz = Math.max(0.36, 0.78 - i * 0.055);
      addBox(seg, sz, sz * 0.88, 0.68, 0, 0, 0, i % 2 === 0 ? wyrmGreen : wyrmDark);
      addBox(seg, sz * 0.7, 0.16, 0.64, 0, -sz * 0.42, 0, wyrmAcid, false);
      addBox(seg, 0.1, 0.44, 0.42, 0, sz * 0.54, 0, wyrmAcid, false); // glowing acid crest
      bodyPivot.add(seg);
      segments.push(seg);
    }

    rig.headGroup = head;
    rig.jawPivot = jaw;
    rig.segments = segments;
    rig.eyes = [eL, eR];
  } else if (type === 'volcanic_giant_bat') {
    // Sky #10: Volcanic Giant Bat (Kelelawar Lava) berupa dark obsidian furry bat, tall ears, molten magma eyes & wide glowing lava-veined wings
    const batFur = palette.getMat(0x271915, 'matte');
    const batChar = palette.getMat(0x111827, 'matte');
    const batLava = palette.getMat(0xf97316, 'emissive');
    const batCore = palette.getMat(0xfacc15, 'emissive');

    addBox(bodyPivot, 0.74, 0.88, 0.64, 0, 0.78, 0, batFur);

    const head = new THREE.Group();
    head.position.set(0, 1.32, 0.16);
    addBox(head, 0.64, 0.56, 0.58, 0, 0.1, 0.08, batFur);
    // Tall pointed bat ears
    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.52, 4), batChar);
    earL.position.set(-0.22, 0.56, 0.04);
    const earR = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.52, 4), batChar);
    earR.position.set(0.22, 0.56, 0.04);
    head.add(earL, earR);
    addBox(head, 0.24, 0.18, 0.14, 0, -0.02, 0.36, batChar); // snout
    const eL = addBox(head, 0.14, 0.12, 0.1, -0.18, 0.14, 0.36, batCore, false);
    const eR = addBox(head, 0.14, 0.12, 0.1, 0.18, 0.14, 0.36, batCore, false);
    addBox(head, 0.07, 0.14, 0.07, -0.1, -0.14, 0.38, whiteBone, false);
    addBox(head, 0.07, 0.14, 0.07, 0.1, -0.14, 0.38, whiteBone, false);
    bodyPivot.add(head);

    // Wide glowing volcanic magma bat wings
    const lWing = new THREE.Group();
    lWing.position.set(-0.36, 0.98, 0.04);
    addBox(lWing, 1.24, 0.12, 0.14, -0.62, 0.18, 0.08, batChar);
    addBox(lWing, 1.22, 0.07, 0.94, -0.66, 0.08, -0.26, batLava, false);
    addBox(lWing, 1.08, 0.11, 0.14, -1.66, 0.06, -0.06, batChar).rotation.z = -0.22;
    addBox(lWing, 1.04, 0.07, 0.88, -1.62, -0.04, -0.44, batCore, false);

    const rWing = new THREE.Group();
    rWing.position.set(0.36, 0.98, 0.04);
    addBox(rWing, 1.24, 0.12, 0.14, 0.62, 0.18, 0.08, batChar);
    addBox(rWing, 1.22, 0.07, 0.94, 0.66, 0.08, -0.26, batLava, false);
    addBox(rWing, 1.08, 0.11, 0.14, 1.66, 0.06, -0.06, batChar).rotation.z = 0.22;
    addBox(rWing, 1.04, 0.07, 0.88, 1.62, -0.04, -0.44, batCore, false);
    bodyPivot.add(lWing, rWing);

    const legL = makeBipedLeg(-0.18, 0.36, 0.14, 0.18, batChar, batChar);
    legL.position.set(-0.18, 0.38, 0.04);
    const legR = makeBipedLeg(0.18, 0.36, 0.14, 0.18, batChar, batChar);
    legR.position.set(0.18, 0.38, 0.04);
    bodyPivot.add(legL, legR);

    rig.headGroup = head;
    rig.leftWing = lWing;
    rig.rightWing = rWing;
    rig.legs = [legL, legR];
    rig.eyes = [eL, eR];
  }

  root.userData.monsterRig = rig;
  const finalScale = scaleOverride !== undefined ? scaleOverride : spec.baseScale;
  if (finalScale !== 1) {
    root.scale.setScalar(finalScale);
  }
  return root;
}

export interface OverworldSurfaceSpawnTemplate {
  zoneId: ZoneId;
  name: string;
  type: MonsterType;
  x: number;
  z: number;
  combatOnly: boolean;
}

// 30 Monster Siang (Pagi/Siang/Sore): 21 Tanpa Tantangan Inggris (70%) + 9 Tantangan Inggris (30%)
export const DAY_SURFACE_SPAWNS: OverworldSurfaceSpawnTemplate[] = [
  // Desa Sapaan (4: 3 combat + 1 quiz)
  { zoneId: 'desa_sapaan', name: 'Forest Slime', type: 'forest_slime', x: 18, z: 98, combatOnly: true },
  { zoneId: 'desa_sapaan', name: 'Poison Beetle', type: 'poison_beetle', x: -32, z: 98, combatOnly: true },
  { zoneId: 'desa_sapaan', name: 'Thorn Goblin', type: 'thorn_goblin', x: 34, z: 128, combatOnly: true },
  { zoneId: 'desa_sapaan', name: 'Wild Boar Kata', type: 'wild_boar', x: -36, z: 140, combatOnly: false },

  // Pasar Rasa (4: 3 combat + 1 quiz)
  { zoneId: 'pasar_rasa', name: 'Thorn Goblin', type: 'thorn_goblin', x: -92, z: 76, combatOnly: true },
  { zoneId: 'pasar_rasa', name: 'Wild Boar', type: 'wild_boar', x: -146, z: 68, combatOnly: true },
  { zoneId: 'pasar_rasa', name: 'Sand Scorpion', type: 'sand_scorpion', x: -148, z: 26, combatOnly: true },
  { zoneId: 'pasar_rasa', name: 'Swamp Lizardman Kata', type: 'swamp_lizardman', x: -118, z: 22, combatOnly: false },

  // Hutan Satwa (5: 3 combat + 2 quiz)
  { zoneId: 'hutan_satwa', name: 'Forest Slime', type: 'forest_slime', x: 90, z: 82, combatOnly: true },
  { zoneId: 'hutan_satwa', name: 'Dire Wolf', type: 'dire_wolf', x: 148, z: 76, combatOnly: true },
  { zoneId: 'hutan_satwa', name: 'Jungle Troll', type: 'jungle_troll', x: 156, z: 42, combatOnly: true },
  { zoneId: 'hutan_satwa', name: 'Swamp Lizardman Kata', type: 'swamp_lizardman', x: 126, z: 20, combatOnly: false },
  { zoneId: 'hutan_satwa', name: 'Ancient Treant Kata', type: 'ancient_treant', x: 118, z: 98, combatOnly: false },

  // Gerbang Kota (4: 3 combat + 1 quiz)
  { zoneId: 'gerbang_kota', name: 'Skeleton Warrior', type: 'skeleton_warrior', x: -86, z: -72, combatOnly: true },
  { zoneId: 'gerbang_kota', name: 'Stone Gargoyle', type: 'stone_gargoyle', x: -148, z: -64, combatOnly: true },
  { zoneId: 'gerbang_kota', name: 'Minotaur Brute', type: 'minotaur_brute', x: -152, z: -124, combatOnly: true },
  { zoneId: 'gerbang_kota', name: 'Iron Juggernaut Kata', type: 'iron_juggernaut', x: -94, z: -134, combatOnly: false },

  // Menara Waktu (4: 3 combat + 1 quiz)
  { zoneId: 'menara_waktu', name: 'Stone Gargoyle', type: 'stone_gargoyle', x: 112, z: -112, combatOnly: true },
  { zoneId: 'menara_waktu', name: 'Crystal Golem', type: 'crystal_golem', x: 174, z: -120, combatOnly: true },
  { zoneId: 'menara_waktu', name: 'Iron Juggernaut', type: 'iron_juggernaut', x: 178, z: -64, combatOnly: true },
  { zoneId: 'menara_waktu', name: 'Titan Colossus Kata', type: 'titan_colossus', x: 144, z: -52, combatOnly: false },

  // Gua Portal (5: 3 combat + 2 quiz)
  { zoneId: 'gua_portal', name: 'Cave Spider', type: 'cave_spider', x: -24, z: -154, combatOnly: true },
  { zoneId: 'gua_portal', name: 'Lava Imp', type: 'lava_imp', x: 54, z: -150, combatOnly: true },
  { zoneId: 'gua_portal', name: 'Crystal Golem', type: 'crystal_golem', x: 58, z: -196, combatOnly: true },
  { zoneId: 'gua_portal', name: 'Magma Elemental Kata', type: 'magma_elemental', x: -22, z: -198, combatOnly: false },
  { zoneId: 'gua_portal', name: 'Obsidian Hydra Kata', type: 'obsidian_hydra', x: 24, z: -214, combatOnly: false },

  // Central Hub Citadel Reruntuhan (4: 3 combat + 1 quiz)
  { zoneId: 'desa_sapaan', name: 'Skeleton Warrior', type: 'skeleton_warrior', x: -30, z: 10, combatOnly: true },
  { zoneId: 'hutan_satwa', name: 'Dire Wolf', type: 'dire_wolf', x: 32, z: 6, combatOnly: true },
  { zoneId: 'gerbang_kota', name: 'Minotaur Brute', type: 'minotaur_brute', x: -34, z: -38, combatOnly: true },
  { zoneId: 'menara_waktu', name: 'Frost Ogre Kata', type: 'frost_ogre', x: 32, z: -42, combatOnly: false },
];

// 50 Monster Malam: 35 Tanpa Tantangan Inggris (70%) + 15 Tantangan Inggris (30%)
export const NIGHT_SURFACE_SPAWNS: OverworldSurfaceSpawnTemplate[] = [
  // Desa Sapaan (7: 5 combat + 2 quiz)
  { zoneId: 'desa_sapaan', name: 'Forest Slime', type: 'forest_slime', x: 16, z: 96, combatOnly: true },
  { zoneId: 'desa_sapaan', name: 'Forest Slime', type: 'forest_slime', x: -26, z: 86, combatOnly: true },
  { zoneId: 'desa_sapaan', name: 'Poison Beetle', type: 'poison_beetle', x: -38, z: 108, combatOnly: true },
  { zoneId: 'desa_sapaan', name: 'Thorn Goblin', type: 'thorn_goblin', x: 36, z: 120, combatOnly: true },
  { zoneId: 'desa_sapaan', name: 'Thorn Goblin', type: 'thorn_goblin', x: 22, z: 148, combatOnly: true },
  { zoneId: 'desa_sapaan', name: 'Wild Boar Kata', type: 'wild_boar', x: -34, z: 144, combatOnly: false },
  { zoneId: 'desa_sapaan', name: 'Dire Wolf Kata', type: 'dire_wolf', x: 2, z: 78, combatOnly: false },

  // Pasar Rasa (7: 5 combat + 2 quiz)
  { zoneId: 'pasar_rasa', name: 'Thorn Goblin', type: 'thorn_goblin', x: -88, z: 72, combatOnly: true },
  { zoneId: 'pasar_rasa', name: 'Wild Boar', type: 'wild_boar', x: -144, z: 72, combatOnly: true },
  { zoneId: 'pasar_rasa', name: 'Sand Scorpion', type: 'sand_scorpion', x: -152, z: 44, combatOnly: true },
  { zoneId: 'pasar_rasa', name: 'Sand Scorpion', type: 'sand_scorpion', x: -124, z: 86, combatOnly: true },
  { zoneId: 'pasar_rasa', name: 'Swamp Lizardman', type: 'swamp_lizardman', x: -142, z: 16, combatOnly: true },
  { zoneId: 'pasar_rasa', name: 'Swamp Lizardman Kata', type: 'swamp_lizardman', x: -102, z: 18, combatOnly: false },
  { zoneId: 'pasar_rasa', name: 'Jungle Troll Kata', type: 'jungle_troll', x: -122, z: 48, combatOnly: false },

  // Hutan Satwa (8: 6 combat + 2 quiz)
  { zoneId: 'hutan_satwa', name: 'Forest Slime', type: 'forest_slime', x: 86, z: 84, combatOnly: true },
  { zoneId: 'hutan_satwa', name: 'Poison Beetle', type: 'poison_beetle', x: 102, z: 22, combatOnly: true },
  { zoneId: 'hutan_satwa', name: 'Dire Wolf', type: 'dire_wolf', x: 144, z: 86, combatOnly: true },
  { zoneId: 'hutan_satwa', name: 'Dire Wolf', type: 'dire_wolf', x: 162, z: 54, combatOnly: true },
  { zoneId: 'hutan_satwa', name: 'Swamp Lizardman', type: 'swamp_lizardman', x: 136, z: 18, combatOnly: true },
  { zoneId: 'hutan_satwa', name: 'Jungle Troll', type: 'jungle_troll', x: 152, z: 28, combatOnly: true },
  { zoneId: 'hutan_satwa', name: 'Jungle Troll Kata', type: 'jungle_troll', x: 112, z: 104, combatOnly: false },
  { zoneId: 'hutan_satwa', name: 'Ancient Treant Kata', type: 'ancient_treant', x: 128, z: 72, combatOnly: false },

  // Gerbang Kota (7: 5 combat + 2 quiz)
  { zoneId: 'gerbang_kota', name: 'Skeleton Warrior', type: 'skeleton_warrior', x: -82, z: -66, combatOnly: true },
  { zoneId: 'gerbang_kota', name: 'Skeleton Warrior', type: 'skeleton_warrior', x: -148, z: -62, combatOnly: true },
  { zoneId: 'gerbang_kota', name: 'Stone Gargoyle', type: 'stone_gargoyle', x: -160, z: -104, combatOnly: true },
  { zoneId: 'gerbang_kota', name: 'Stone Gargoyle', type: 'stone_gargoyle', x: -84, z: -130, combatOnly: true },
  { zoneId: 'gerbang_kota', name: 'Minotaur Brute', type: 'minotaur_brute', x: -146, z: -136, combatOnly: true },
  { zoneId: 'gerbang_kota', name: 'Iron Juggernaut Kata', type: 'iron_juggernaut', x: -116, z: -148, combatOnly: false },
  { zoneId: 'gerbang_kota', name: 'Iron Juggernaut Kata', type: 'iron_juggernaut', x: -120, z: -56, combatOnly: false },

  // Menara Waktu (7: 5 combat + 2 quiz)
  { zoneId: 'menara_waktu', name: 'Stone Gargoyle', type: 'stone_gargoyle', x: 108, z: -114, combatOnly: true },
  { zoneId: 'menara_waktu', name: 'Crystal Golem', type: 'crystal_golem', x: 176, z: -122, combatOnly: true },
  { zoneId: 'menara_waktu', name: 'Crystal Golem', type: 'crystal_golem', x: 184, z: -86, combatOnly: true },
  { zoneId: 'menara_waktu', name: 'Iron Juggernaut', type: 'iron_juggernaut', x: 170, z: -52, combatOnly: true },
  { zoneId: 'menara_waktu', name: 'Frost Ogre', type: 'frost_ogre', x: 140, z: -136, combatOnly: true },
  { zoneId: 'menara_waktu', name: 'Ancient Treant Kata', type: 'ancient_treant', x: 132, z: -50, combatOnly: false },
  { zoneId: 'menara_waktu', name: 'Titan Colossus Kata', type: 'titan_colossus', x: 152, z: -94, combatOnly: false },

  // Gua Portal (7: 5 combat + 2 quiz)
  { zoneId: 'gua_portal', name: 'Cave Spider', type: 'cave_spider', x: -26, z: -150, combatOnly: true },
  { zoneId: 'gua_portal', name: 'Cave Spider', type: 'cave_spider', x: 56, z: -148, combatOnly: true },
  { zoneId: 'gua_portal', name: 'Lava Imp', type: 'lava_imp', x: -24, z: -194, combatOnly: true },
  { zoneId: 'gua_portal', name: 'Lava Imp', type: 'lava_imp', x: 60, z: -194, combatOnly: true },
  { zoneId: 'gua_portal', name: 'Crystal Golem', type: 'crystal_golem', x: 26, z: -134, combatOnly: true },
  { zoneId: 'gua_portal', name: 'Magma Elemental Kata', type: 'magma_elemental', x: -4, z: -214, combatOnly: false },
  { zoneId: 'gua_portal', name: 'Obsidian Hydra Kata', type: 'obsidian_hydra', x: 36, z: -212, combatOnly: false },

  // Central Hub Citadel Reruntuhan (7: 4 combat + 3 quiz)
  { zoneId: 'desa_sapaan', name: 'Skeleton Warrior', type: 'skeleton_warrior', x: -28, z: 14, combatOnly: true },
  { zoneId: 'hutan_satwa', name: 'Lava Imp', type: 'lava_imp', x: 32, z: 12, combatOnly: true },
  { zoneId: 'gerbang_kota', name: 'Minotaur Brute', type: 'minotaur_brute', x: -38, z: -34, combatOnly: true },
  { zoneId: 'menara_waktu', name: 'Magma Elemental', type: 'magma_elemental', x: 36, z: -36, combatOnly: true },
  { zoneId: 'desa_sapaan', name: 'Frost Ogre Kata', type: 'frost_ogre', x: 2, z: -56, combatOnly: false },
  { zoneId: 'gua_portal', name: 'Obsidian Hydra Kata', type: 'obsidian_hydra', x: -14, z: -48, combatOnly: false },
  { zoneId: 'menara_waktu', name: 'Titan Colossus Kata', type: 'titan_colossus', x: 18, z: -18, combatOnly: false },
];

export interface SeaMonsterSpawnTemplate {
  zoneId: ZoneId;
  name: string;
  type: MonsterType;
  x: number;
  z: number;
}

// 12 Predator Laut Ganas (semua 10 jenis monster laut dari lembar desain) tersebar di selat & lautan antar pulau!
export const SEA_MONSTER_SPAWNS: SeaMonsterSpawnTemplate[] = [
  // Selat Desa Sapaan <-> Pasar Rasa & Teluk Selatan
  { zoneId: 'desa_sapaan', name: 'Goring Shark (Hiu Ganas)', type: 'goring_shark', x: -82, z: 100 },
  { zoneId: 'desa_sapaan', name: 'Venomous Box Jelly (Ubur-Ubur Maut)', type: 'venomous_box_jelly', x: 36, z: 48 },
  { zoneId: 'desa_sapaan', name: 'Goring Shark (Hiu Ganas)', type: 'goring_shark', x: 68, z: 134 },

  // Selat Pasar Rasa <-> Hub & Laut Barat
  { zoneId: 'pasar_rasa', name: 'Giant Bone-Jaw (Ikan Purba)', type: 'giant_bone_jaw', x: -94, z: -4 },
  { zoneId: 'pasar_rasa', name: 'Venomous Box Jelly (Ubur-Ubur Maut)', type: 'venomous_box_jelly', x: -78, z: 156 },
  { zoneId: 'pasar_rasa', name: 'Shadow Angler (Monster Laut Dalam)', type: 'shadow_angler', x: -178, z: 18 },

  // Selat Hutan Satwa <-> Menara Waktu
  { zoneId: 'hutan_satwa', name: 'Spiny Mega-Stingray (Pari Berduri)', type: 'spiny_mega_stingray', x: 116, z: -24 },

  // Selat Gerbang Kota <-> Gua Portal
  { zoneId: 'gerbang_kota', name: 'Toxic Sea Viper (Naga Laut Beracun)', type: 'toxic_sea_viper', x: -46, z: -124 },

  // Selat Menara Waktu <-> Gua Portal & Laut Timur
  { zoneId: 'menara_waktu', name: 'Electric Eel-Drakon', type: 'electric_eel_drakon', x: 88, z: -138 },
  { zoneId: 'menara_waktu', name: 'Charybdis Maw', type: 'charybdis_maw', x: 66, z: -98 },
  { zoneId: 'menara_waktu', name: 'Abyssal Kraken', type: 'abyssal_kraken', x: 212, z: -22 },

  // Samudra Utara Gua Portal
  { zoneId: 'gua_portal', name: 'Leviathan Serpent', type: 'leviathan_serpent', x: 106, z: -218 },
];

export interface SkyMonsterSpawnTemplate {
  zoneId: ZoneId;
  name: string;
  type: MonsterType;
  x: number;
  z: number;
  combatOnly: boolean;
}

// 20 Monster Terbang Angkasa (semua 10 jenis monster langit, masing-masing 2 ekor)
// 14 Penyerang Tempur Langit (70%) + 6 Pembawa Tantangan Kata Langit (30%)
export const SKY_MONSTER_SPAWNS: SkyMonsterSpawnTemplate[] = [
  // Desa Sapaan & Langit Pesisir Luar (3 yaitu 2 combat + 1 quiz, aman dari area spawn awal desa)
  { zoneId: 'desa_sapaan', name: 'Crimson Phoenix (Burung Api)', type: 'crimson_phoenix', x: 64, z: 168, combatOnly: true },
  { zoneId: 'desa_sapaan', name: 'Blight Hornet (Tawon Beracun)', type: 'blight_hornet', x: -74, z: 132, combatOnly: true },
  { zoneId: 'desa_sapaan', name: 'Giant Phantom Kata', type: 'giant_phantom', x: 46, z: 54, combatOnly: false },

  // Pasar Rasa & Langit Barat (3: 2 combat + 1 quiz)
  { zoneId: 'pasar_rasa', name: 'Shadow Harpy (Harpi Kegelapan)', type: 'shadow_harpy', x: -112, z: 62, combatOnly: true },
  { zoneId: 'pasar_rasa', name: 'Toxic Chimera (Beast Berbisa)', type: 'toxic_chimera', x: -136, z: 36, combatOnly: true },
  { zoneId: 'pasar_rasa', name: 'Crimson Phoenix Kata', type: 'crimson_phoenix', x: -100, z: 32, combatOnly: false },

  // Hutan Satwa & Langit Timur (3: 2 combat + 1 quiz)
  { zoneId: 'hutan_satwa', name: 'Blight Hornet (Tawon Beracun)', type: 'blight_hornet', x: 114, z: 68, combatOnly: true },
  { zoneId: 'hutan_satwa', name: 'Acidic Sky-Wyrm (Naga Asam)', type: 'acidic_sky_wyrm', x: 146, z: 54, combatOnly: true },
  { zoneId: 'hutan_satwa', name: 'Toxic Chimera Kata', type: 'toxic_chimera', x: 118, z: 34, combatOnly: false },

  // Gerbang Kota & Langit Barat Laut (3: 2 combat + 1 quiz)
  { zoneId: 'gerbang_kota', name: 'Guardian Sentinel (Drone Penjaga)', type: 'guardian_sentinel', x: -118, z: -88, combatOnly: true },
  { zoneId: 'gerbang_kota', name: 'Shadow Harpy (Harpi Kegelapan)', type: 'shadow_harpy', x: -140, z: -112, combatOnly: true },
  { zoneId: 'gerbang_kota', name: 'Ice Shard Griffin Kata', type: 'ice_shard_griffin', x: -98, z: -118, combatOnly: false },

  // Menara Waktu & Langit Timur Laut (3: 2 combat + 1 quiz)
  { zoneId: 'menara_waktu', name: 'Ice Shard Griffin (Griffin Es)', type: 'ice_shard_griffin', x: 138, z: -96, combatOnly: true },
  { zoneId: 'menara_waktu', name: 'Giant Phantom (Pari Udara)', type: 'giant_phantom', x: 162, z: -74, combatOnly: true },
  { zoneId: 'menara_waktu', name: 'Acidic Sky-Wyrm Kata', type: 'acidic_sky_wyrm', x: 126, z: -64, combatOnly: false },

  // Gua Portal & Langit Vulkanik Utara (3: 2 combat + 1 quiz)
  { zoneId: 'gua_portal', name: 'Giga-Wyvern (Naga Pembom)', type: 'giga_wyvern', x: 14, z: -176, combatOnly: true },
  { zoneId: 'gua_portal', name: 'Volcanic Giant Bat (Kelelawar Lava)', type: 'volcanic_giant_bat', x: 44, z: -164, combatOnly: true },
  { zoneId: 'gua_portal', name: 'Volcanic Giant Bat Kata', type: 'volcanic_giant_bat', x: -14, z: -182, combatOnly: false },

  // Angkasa Alun-Alun Tengah Citadel (2: 2 combat)
  { zoneId: 'desa_sapaan', name: 'Guardian Sentinel (Drone Penjaga)', type: 'guardian_sentinel', x: -18, z: -14, combatOnly: true },
  { zoneId: 'gua_portal', name: 'Giga-Wyvern (Naga Pembom)', type: 'giga_wyvern', x: 20, z: -26, combatOnly: true },

  // Koridor Udara 3 Pulau Pangkalan Pesawat (6: 4 combat + 2 quiz)
  { zoneId: 'desa_sapaan', name: 'Blight Hornet (Patroli Pangkalan Selatan)', type: 'blight_hornet', x: -124, z: 162, combatOnly: true },
  { zoneId: 'pasar_rasa', name: 'Shadow Harpy (Penghadang Langit Barat)', type: 'shadow_harpy', x: -162, z: -38, combatOnly: true },
  { zoneId: 'hutan_satwa', name: 'Crimson Phoenix (Pengawal Langit Timur)', type: 'crimson_phoenix', x: 186, z: 96, combatOnly: true },
  { zoneId: 'menara_waktu', name: 'Ice Shard Griffin (Patroli Pangkalan Timur)', type: 'ice_shard_griffin', x: 204, z: -12, combatOnly: false },
  { zoneId: 'gerbang_kota', name: 'Giga-Wyvern (Raja Awan Utara)', type: 'giga_wyvern', x: -148, z: -162, combatOnly: true },
  { zoneId: 'gua_portal', name: 'Guardian Sentinel Kata (Langit Utara)', type: 'guardian_sentinel', x: -96, z: -188, combatOnly: false },
];
