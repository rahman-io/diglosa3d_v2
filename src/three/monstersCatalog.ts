import * as THREE from 'three';
import { MonsterType, ZoneId } from '../types/game';
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
};

export const ALL_MONSTER_TYPES: MonsterType[] = Object.keys(MONSTER_SPECS) as MonsterType[];

export const FLYING_MONSTER_TYPES = new Set<MonsterType>(['lava_imp', 'stone_gargoyle']);
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
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(shadowRadius * 2.1, shadowRadius * 2.1),
    palette.contactShadowMat,
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.04;
  root.add(shadow);

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
  } else {
    // titan_colossus (#20) — Ancient stone + gold rune monolith colossus
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
