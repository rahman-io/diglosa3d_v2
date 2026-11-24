import * as THREE from 'three';
import { WEAPON_ORDER, ZONE_CAVE_STORIES, ZONE_DOORS, ZONE_INFO } from '../data/diglosaCatalog';
import {
  CaveBlockKind,
  CharacterPresetId,
  DivingGearId,
  DoorDef,
  HeroAppearanceColors,
  JumpDiveTrick,
  MonsterType,
  SwimStyleId,
  WeaponId,
  ZoneId,
} from '../types/game';
import { MaterialPalette, SurfaceMaterial } from './materials';
import {
  getArchipelagoGroundY,
  getArchipelagoZoneForPosition,
} from './archipelagoWorld';
import { createMinecraftHouse } from './minecraftVillage';
import { createEnemyBlasterMesh, createWeaponMesh } from './weaponModels';
import {
  buildDiverseNpcRig,
  NpcAppearanceVariant,
  NpcArchetypeId,
  resolveNpcArchetype,
} from './diverseNpcs';
import {
  buildMonsterRig,
  MonsterAnimRig,
} from './monstersCatalog';
export type { MonsterAnimRig } from './monstersCatalog';

export interface HeroAvatarRig {
  root: THREE.Group;
  body: THREE.Group;
  upperBody: THREE.Group;
  headGroup: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  dashRing: THREE.Mesh;
  swimRing: THREE.Mesh;
  scubaMask: THREE.Group;
  scubaTanks: THREE.Group;
  scubaTorch: THREE.Group;
  wetsuitAccents: THREE.Mesh[];
  flippers: THREE.Group[];
  turtleMount: THREE.Group;
  weaponGroup: THREE.Group;
  weaponMeshes: Record<WeaponId, THREE.Group>;
  weaponTipMat: SurfaceMaterial;
  activePresetId?: CharacterPresetId;
  variantGroups?: Record<CharacterPresetId, THREE.Object3D[]>;
  leftSleeveMesh?: THREE.Mesh;
  rightSleeveMesh?: THREE.Mesh;
  appearanceMats?: {
    skin: SurfaceMaterial;
    tunic: SurfaceMaterial;
    pants: SurfaceMaterial;
    hat: SurfaceMaterial;
    pack: SurfaceMaterial;
    feather: SurfaceMaterial;
  };
}

export interface OwlMessengerRig {
  root: THREE.Group;
  leftWing: THREE.Group;
  rightWing: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  envelope: THREE.Group;
}

export function computeBlinkScale(elapsed: number, phase = 0): number {
  const period = 3.4 + (Math.abs(Math.sin(phase * 3.17)) * 1.1);
  const cycle = (elapsed + Math.abs(phase) * 2.13) % period;
  if (cycle < 0.14) {
    return Math.max(0.08, 1 - Math.sin((cycle / 0.14) * Math.PI) * 0.92);
  }
  // Occasional quick natural double-blink
  if (cycle > 0.24 && cycle < 0.36 && Math.sin(phase * 7.3) > 0.25) {
    return Math.max(0.08, 1 - Math.sin(((cycle - 0.24) / 0.12) * Math.PI) * 0.92);
  }
  // Rare micro-flutter / eyelid twitch
  const twitchCycle = (elapsed + Math.abs(phase) * 4.7) % 10.7;
  if (twitchCycle < 0.08) {
    return 0.45 + 0.55 * Math.cos((twitchCycle / 0.08) * Math.PI * 2);
  }
  return 1;
}

type IdleActionKind =
  | 'none'
  | 'scan'
  | 'scratch'
  | 'yawn_stretch'
  | 'posture_shift'
  | 'leg_bounce'
  | 'chin_daydream';

interface IdleBehaviorSample {
  action: IdleActionKind;
  /** Smooth 0..1..0 envelope across active gesture */
  env: number;
  /** Raw 0..1 progress inside active gesture */
  t: number;
  /** Periodic deep sigh boost (0..1) */
  deepBreath: number;
  /** Subtle swallow reflex head nod */
  swallowNod: number;
  /** Brief micro-twitch impulse */
  twitch: number;
  /** Pseudo-random direction sign (-1 or +1) */
  side: number;
}

function computeIdleBehavior(elapsed: number, phase = 0): IdleBehaviorSample {
  const deepCycle = (elapsed + Math.abs(phase) * 3.1) % 10.5;
  const deepBreath = deepCycle < 2.8 ? Math.sin((deepCycle / 2.8) * Math.PI) : 0;

  const swallowCycle = (elapsed + Math.abs(phase) * 5.3) % 9.2;
  const swallowNod = swallowCycle < 0.28 ? Math.sin((swallowCycle / 0.28) * Math.PI) * 0.085 : 0;

  const twitchCycle = (elapsed + Math.abs(phase) * 6.7) % 7.4;
  const twitch = twitchCycle < 0.14 ? Math.sin((twitchCycle / 0.14) * Math.PI * 2) * 0.055 : 0;

  const slotDur = 5.4;
  const shifted = Math.max(0, elapsed + Math.abs(phase) * 3.7);
  const slot = Math.floor(shifted / slotDur);
  const localT = (shifted - slot * slotDur) / slotDur; // 0..1

  const h = Math.abs(Math.sin((slot + 1) * 12.9898 + phase * 78.233) * 43758.5453) % 1;
  const side = Math.sin(slot * 9.13 + phase * 3.1) >= 0 ? 1 : -1;

  const actions: IdleActionKind[] = [
    'scan',
    'scratch',
    'posture_shift',
    'yawn_stretch',
    'leg_bounce',
    'chin_daydream',
    'none',
  ];
  const action = actions[Math.min(actions.length - 1, Math.floor(h * actions.length))];

  // Active gesture occupies localT 0.14..0.84 with smooth fade-in / fade-out
  if (action === 'none' || localT < 0.14 || localT > 0.84) {
    return { action: 'none', env: 0, t: 0, deepBreath, swallowNod, twitch, side };
  }
  const t = (localT - 0.14) / 0.7;
  const env = Math.min(1, Math.sin(t * Math.PI) * 1.45);
  return { action, env, t, deepBreath, swallowNod, twitch, side };
}

export interface PortalArchRig {
  root: THREE.Group;
  ringOuter: THREE.Mesh;
  ringInner: THREE.Mesh;
  coreDisc: THREE.Mesh;
}

export interface DungeonDoorRig {
  index: number;
  def: DoorDef;
  group: THREE.Group;
  orbMesh: THREE.Mesh;
  frameMat: SurfaceMaterial;
  orbMat: SurfaceMaterial;
}

export interface CaveBlockDef {
  id: string;
  kind: CaveBlockKind;
  label: string;
  x: number;
  y: number;
  z: number;
  halfW: number;
  hp: number;
  maxHp: number;
  mesh: THREE.Mesh;
  alive: boolean;
  hasAmbush?: boolean;
  crackMesh?: THREE.Mesh;
}

export interface CaveStaticCollider {
  x: number;
  z: number;
  halfW: number;
}

export interface CaveCliffPlatform {
  id: string;
  x: number;
  z: number;
  halfW: number;
  halfD: number;
  topY: number;
}

export interface CaveLavaChasm {
  id: string;
  x: number;
  z: number;
  halfW: number;
  halfD: number;
  lavaMat: SurfaceMaterial;
}

export interface CaveTrapRig {
  id: string;
  kind: 'lava' | 'spikes';
  x: number;
  z: number;
  halfW: number;
  phaseOffset: number;
  group: THREE.Group;
  coreMat: SurfaceMaterial;
  spikesGroup?: THREE.Group;
  active: boolean;
}

export interface CaveWeaponChestRig {
  x: number;
  y: number;
  z: number;
  group: THREE.Group;
  orb: THREE.Mesh;
  collected: boolean;
}

export interface DungeonArenaRig {
  group: THREE.Group;
  animatables: THREE.Object3D[];
  doors: DungeonDoorRig[];
  exitPadPos: THREE.Vector3;
  exitClickable: THREE.Object3D;
  craftingTablePos: THREE.Vector3;
  caveBlocks: CaveBlockDef[];
  caveColliders: CaveStaticCollider[];
  platforms: CaveCliffPlatform[];
  chasms: CaveLavaChasm[];
  traps: CaveTrapRig[];
  blockHighlight: THREE.LineSegments;
  blockPlacePreview: THREE.LineSegments;
  torchPreview: THREE.Group;
  shieldBlockMat: THREE.Material;
  shieldBlockGeo: THREE.BufferGeometry;
  crackMaterials: THREE.MeshBasicMaterial[];
  crackGeo: THREE.BufferGeometry;
  weaponChest: CaveWeaponChestRig;
  guardianPos: THREE.Vector3;
  guardianMesh: THREE.Group;
  guardianAuraMat: THREE.MeshBasicMaterial;
  prisonPos: THREE.Vector3;
  prisonGroup: THREE.Group;
  prisonBars: THREE.Group;
  prisonLockMat: SurfaceMaterial;
  captiveMesh: THREE.Group;
  prisonKeyGroup: THREE.Group;
  cameraOccluders: THREE.Object3D[];
  disposables: Array<{ dispose: () => void }>;
}

export interface AcademyHallRig {
  group: THREE.Group;
  animatables: THREE.Object3D[];
  exitPadPos: THREE.Vector3;
  exitClickable: THREE.Object3D;
  cameraOccluders: THREE.Object3D[];
  colliders: Array<{ x: number; z: number; halfW: number; halfD: number; maxY: number }>;
}

function addShadow(group: THREE.Group, palette: MaterialPalette, radius: number): void {
  const s = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 2.2, radius * 2.2),
    palette.contactShadowMat,
  );
  s.rotation.x = -Math.PI / 2;
  s.position.y = 0.04;
  group.add(s);
}

export const DEFAULT_HERO_APPEARANCE: HeroAppearanceColors = {
  tunicHex: 0x16a34a,
  pantsHex: 0x1e3a8a,
  hatHex: 0x92400e,
  skinHex: 0xfed7aa,
  packHex: 0xb45309,
  featherHex: 0xef4444,
};

// 1. Composite 3D Hero Explorer ("Hoot Sang Petualang Kata")
export function createHeroAvatar(
  palette: MaterialPalette,
  appearance: HeroAppearanceColors = DEFAULT_HERO_APPEARANCE,
  presetId: CharacterPresetId = 'hoot_emerald',
): HeroAvatarRig {
  const root = new THREE.Group();
  const body = new THREE.Group();
  // Use YXZ Euler order so yaw (Y) always resolves first for 360-deg swimming & diving pitch/roll
  body.rotation.order = 'YXZ';
  root.add(body);
  addShadow(root, palette, 1.0);

  const skin = palette.createSurfaceMat({ color: appearance.skinHex, roughness: 0.85, metalness: 0.04 });
  const tunic = palette.createSurfaceMat({ color: appearance.tunicHex, roughness: 0.85, metalness: 0.04 });
  const pants = palette.createSurfaceMat({ color: appearance.pantsHex, roughness: 0.85, metalness: 0.04 });
  const boot = palette.getMat(0x78350f, 'matte');
  const pack = palette.createSurfaceMat({ color: appearance.packHex, roughness: 0.85, metalness: 0.04 });
  const hatMat = palette.createSurfaceMat({ color: appearance.hatHex, roughness: 0.85, metalness: 0.04 });
  const featherMat = palette.createSurfaceMat({ color: appearance.featherHex, roughness: 0.3, metalness: 0.12 });
  const gold = palette.getMat(0xfbbf24, 'metal');

  // Legs
  const makeLeg = (x: number): THREE.Group => {
    const leg = new THREE.Group();
    leg.position.set(x, 1.05, 0);
    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.7, 0.38), pants);
    thigh.position.y = -0.35;
    thigh.castShadow = true;
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.35, 0.52), boot);
    shoe.position.set(0, -0.87, 0.06);
    shoe.castShadow = true;
    leg.add(thigh, shoe);
    return leg;
  };

  const rightLeg = makeLeg(-0.24);
  const leftLeg = makeLeg(0.24);
  body.add(leftLeg, rightLeg);

  const upperBody = new THREE.Group();
  upperBody.position.set(0, 1.1, 0);
  body.add(upperBody);

  // Torso & Belt
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.05, 0.58), tunic);
  torso.position.y = 0.48;
  torso.castShadow = true;
  upperBody.add(torso);

  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.16, 0.62), boot);
  belt.position.y = 0.08;
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.08), gold);
  buckle.position.set(0, 0.08, 0.32);
  upperBody.add(belt, buckle);

  // Head pivoted at neck
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.05, 0);
  upperBody.add(headGroup);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.84, 0.82), skin);
  head.position.y = 0.4;
  head.castShadow = true;
  headGroup.add(head);

  const eyeMat = palette.getMat(0x0f172a, 'gloss');
  const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.06), eyeMat);
  rightEye.position.set(-0.2, 0.41, 0.42);
  const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.06), eyeMat);
  leftEye.position.set(0.2, 0.41, 0.42);
  headGroup.add(leftEye, rightEye);

  // Weapon tip custom material fallback
  const weaponTipMat = palette.createSurfaceMat({
    color: 0x4fd8ff,
    emissive: 0x4fd8ff,
    emissiveIntensity: 1.35,
    roughness: 0.2,
  });

  const weaponGroup = new THREE.Group();
  const weaponMeshes = {} as Record<WeaponId, THREE.Group>;
  let leftSleeveMesh!: THREE.Mesh;
  let rightSleeveMesh!: THREE.Mesh;
  const makeArm = (x: number, withWeapon: boolean): THREE.Group => {
    const arm = new THREE.Group();
    arm.position.set(x, 0.88, 0);
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.32), tunic);
    sleeve.position.y = -0.18;
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.42, 0.28), skin);
    hand.position.y = -0.56;
    arm.add(sleeve, hand);
    if (withWeapon) {
      rightSleeveMesh = sleeve;
      weaponGroup.position.set(0, -0.72, 0.06);
      weaponGroup.rotation.x = Math.PI / 2;
      WEAPON_ORDER.forEach((wId) => {
        const wMesh = createWeaponMesh(wId, palette, 0.92);
        wMesh.visible = wId === 'ketapel';
        weaponMeshes[wId] = wMesh;
        weaponGroup.add(wMesh);
      });
      arm.add(weaponGroup);
    } else {
      leftSleeveMesh = sleeve;
    }
    return arm;
  };

  // When Hero faces +Z with +Y up, Hero's true RIGHT side is -X and LEFT side is +X
  const rightArm = makeArm(-0.62, true);
  const leftArm = makeArm(0.62, false);
  upperBody.add(leftArm, rightArm);

  // =========================================================================
  // 6 SHEET-ACCURATE 3D HERO VARIANTS (Hoot, Aria, Karsa, Raka, Luna, Nusa)
  // =========================================================================
  const variantGroups: Record<CharacterPresetId, THREE.Object3D[]> = {
    hoot_emerald: [],
    aria_sky: [],
    karsa_crimson: [],
    raka_gold: [],
    luna_violet: [],
    nusa_teal: [],
  };
  const regVariant = (id: CharacterPresetId, parent: THREE.Object3D, obj: THREE.Object3D) => {
    parent.add(obj);
    variantGroups[id].push(obj);
    obj.visible = id === presetId;
  };

  const hairDarkBrown = palette.getMat(0x4a2f1d, 'matte');
  const hairWarmBrown = palette.getMat(0x6b3e26, 'matte');
  const owlBrown = palette.getMat(0x8c5a32, 'matte');
  const owlCream = palette.getMat(0xfef3c7, 'matte');
  const owlWingDark = palette.getMat(0x6d4120, 'matte');
  const amberGlow = palette.getMat(0xfef08a, 'emissive');
  const cyanGlow = palette.getMat(0x22d3ee, 'emissive');
  const aquaGlow = palette.getMat(0x67e8f9, 'emissive');
  const darkSlate = palette.getMat(0x1e293b, 'matte');
  const steelMat = palette.getMat(0xcbd5e1, 'metal');
  const greenLeaf = palette.getMat(0x22c55e, 'matte');
  const pinkAccent = palette.getMat(0xec4899, 'matte');
  const purpleAccent = palette.getMat(0x9333ea, 'matte');
  const tealCoat = palette.getMat(0x0d9488, 'matte');
  const scholarCoat = palette.getMat(0x47413c, 'matte');
  const oceanPlate = palette.getMat(0x38bdf8, 'metal');

  // --- 1. HOOT (Burung Hantu Penolong): Owl Hood + Ears + Wing Sleeves + Golden Lantern ---
  {
    const hHead = new THREE.Group();
    const hoodTop = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.34, 0.92), owlBrown);
    hoodTop.position.set(0, 0.78, -0.02);
    const hoodBack = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.72, 0.32), owlBrown);
    hoodBack.position.set(0, 0.44, -0.34);
    const hoodSideL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.68, 0.78), owlBrown);
    hoodSideL.position.set(0.43, 0.46, -0.02);
    const hoodSideR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.68, 0.78), owlBrown);
    hoodSideR.position.set(-0.43, 0.46, -0.02);
    const hoodFaceTrim = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.14, 0.16), owlCream);
    hoodFaceTrim.position.set(0, 0.66, 0.38);
    const earL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.22), owlWingDark);
    earL.position.set(0.36, 0.98, 0.14);
    earL.rotation.z = -0.25;
    const earR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.22), owlWingDark);
    earR.position.set(-0.36, 0.98, 0.14);
    earR.rotation.z = 0.25;
    const owlEyeL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.08), amberGlow);
    owlEyeL.position.set(0.2, 0.8, 0.44);
    const owlEyeR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.08), amberGlow);
    owlEyeR.position.set(-0.2, 0.8, 0.44);
    const beak = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.12), gold);
    beak.position.set(0, 0.71, 0.46);
    const bangs = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.12, 0.1), hairDarkBrown);
    bangs.position.set(0, 0.56, 0.41);
    hHead.add(hoodTop, hoodBack, hoodSideL, hoodSideR, hoodFaceTrim, earL, earR, owlEyeL, owlEyeR, beak, bangs);
    regVariant('hoot_emerald', headGroup, hHead);

    const hBody = new THREE.Group();
    const plumage = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.62, 0.1), owlCream);
    plumage.position.set(0, 0.56, 0.28);
    const hPack = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.82, 0.36), pack);
    hPack.position.set(0, 0.52, -0.44);
    hBody.add(plumage, hPack);
    regVariant('hoot_emerald', upperBody, hBody);

    for (const [arm, dir] of [[leftArm, 1], [rightArm, -1]] as const) {
      const wing = new THREE.Group();
      const wMain = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.56, 0.42), owlWingDark);
      wMain.position.set(dir * 0.16, -0.24, -0.04);
      const wTrim = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.38), owlCream);
      wTrim.position.set(dir * 0.17, -0.48, -0.05);
      wing.add(wMain, wTrim);
      regVariant('hoot_emerald', arm, wing);
    }

    const lantern = new THREE.Group();
    lantern.position.set(0.06, -0.86, 0.12);
    const lTop = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.22), darkSlate);
    lTop.position.y = 0.15;
    const lCore = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.18), amberGlow);
    const lBot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.22), darkSlate);
    lBot.position.y = -0.15;
    lantern.add(lTop, lCore, lBot);
    regVariant('hoot_emerald', leftArm, lantern);
  }

  // --- 2. ARIA (Penerjemah Agung): Woven Nusantara Hijab + Scholar Coat + Rune Tome ---
  {
    const aHead = new THREE.Group();
    const wrapTop = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.28, 0.92), tealCoat);
    wrapTop.position.set(0, 0.78, -0.02);
    const wrapBack = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.86, 0.32), tealCoat);
    wrapBack.position.set(0, 0.36, -0.34);
    const wrapSideL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.78, 0.78), tealCoat);
    wrapSideL.position.set(0.42, 0.4, -0.02);
    const wrapSideR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.78, 0.78), tealCoat);
    wrapSideR.position.set(-0.42, 0.4, -0.02);
    const bandPink = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.12, 0.94), pinkAccent);
    bandPink.position.set(0, 0.68, 0.01);
    const bandPurple = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.1, 0.94), purpleAccent);
    bandPurple.position.set(0, 0.82, -0.01);
    const neckDrape = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.22, 0.72), pinkAccent);
    neckDrape.position.set(0, 0.02, -0.04);
    aHead.add(wrapTop, wrapBack, wrapSideL, wrapSideR, bandPink, bandPurple, neckDrape);
    regVariant('aria_sky', headGroup, aHead);

    const aBody = new THREE.Group();
    const coatL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.96, 0.62), scholarCoat);
    coatL.position.set(0.32, 0.46, 0);
    const coatR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.96, 0.62), scholarCoat);
    coatR.position.set(-0.32, 0.46, 0);
    const coatBack = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.96, 0.22), scholarCoat);
    coatBack.position.set(0, 0.46, -0.24);
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.16, 0.65), pinkAccent);
    sash.position.y = 0.18;
    const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.82, 0.06), gold);
    goldTrim.position.set(0, 0.56, 0.29);
    aBody.add(coatL, coatR, coatBack, sash, goldTrim);
    regVariant('aria_sky', upperBody, aBody);

    const tome = new THREE.Group();
    tome.position.set(0.06, -0.76, 0.16);
    tome.rotation.set(-0.35, 0.2, 0);
    const cover = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.34), boot);
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.28), owlCream);
    pages.position.y = 0.04;
    const runeGlow = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.18), aquaGlow);
    runeGlow.position.y = 0.08;
    tome.add(cover, pages, runeGlow);
    regVariant('aria_sky', leftArm, tome);
  }

  // --- 3. KARSA (Petualang Tangguh): Spiky Hair + Tactical Vest + Bare Muscular Arms + Bracers + Pickaxe ---
  {
    const kHead = new THREE.Group();
    const hairBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.24, 0.88), hairDarkBrown);
    hairBase.position.set(0, 0.82, -0.02);
    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.66, 0.24), hairDarkBrown);
    hairBack.position.set(0, 0.5, -0.36);
    const spike1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.24), hairDarkBrown);
    spike1.position.set(-0.22, 0.98, 0.12);
    spike1.rotation.z = 0.2;
    const spike2 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 0.26), hairDarkBrown);
    spike2.position.set(0.04, 1.02, 0.14);
    const spike3 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.22), hairDarkBrown);
    spike3.position.set(0.26, 0.96, 0.08);
    spike3.rotation.z = -0.22;
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.08, 0.08), hairDarkBrown);
    brow.position.set(0, 0.55, 0.42);
    kHead.add(hairBase, hairBack, spike1, spike2, spike3, brow);
    regVariant('karsa_crimson', headGroup, kHead);

    const kBody = new THREE.Group();
    const chestSkin = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.08), skin);
    chestSkin.position.set(0, 0.82, 0.28);
    const pouchL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.14), boot);
    pouchL.position.set(-0.28, 0.34, 0.31);
    const pouchR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.14), boot);
    pouchR.position.set(0.28, 0.34, 0.31);
    kBody.add(chestSkin, pouchL, pouchR);
    regVariant('karsa_crimson', upperBody, kBody);

    for (const arm of [leftArm, rightArm]) {
      const bracer = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.34), darkSlate);
      bracer.position.y = -0.52;
      regVariant('karsa_crimson', arm, bracer);
    }

    const pickaxe = new THREE.Group();
    pickaxe.position.set(0.04, -0.76, 0.12);
    pickaxe.rotation.set(Math.PI / 2 - 0.3, 0, 0);
    const pHandle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.92, 0.09), boot);
    pHandle.position.y = 0.18;
    const pHead = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.13, 0.13), steelMat);
    pHead.position.y = 0.58;
    pickaxe.add(pHandle, pHead);
    regVariant('karsa_crimson', leftArm, pickaxe);
  }

  // --- 4. RAKA (Sain Saintis Muda): Tech Goggles + Neon Cyan Jacket + Scanner Pack + Tablet ---
  {
    const rHead = new THREE.Group();
    const rHairTop = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.26, 0.88), hairWarmBrown);
    rHairTop.position.set(0, 0.82, -0.02);
    const rHairBack = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.62, 0.24), hairWarmBrown);
    rHairBack.position.set(0, 0.48, -0.35);
    const goggleStrap = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.16, 0.88), darkSlate);
    goggleStrap.position.set(0, 0.68, 0);
    const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.12), cyanGlow);
    lensL.position.set(0.2, 0.69, 0.44);
    const lensR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.12), cyanGlow);
    lensR.position.set(-0.2, 0.69, 0.44);
    rHead.add(rHairTop, rHairBack, goggleStrap, lensL, lensR);
    regVariant('raka_gold', headGroup, rHead);

    const rBody = new THREE.Group();
    const neonStripeL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.82, 0.64), cyanGlow);
    neonStripeL.position.set(0.28, 0.54, 0);
    const neonStripeR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.82, 0.64), cyanGlow);
    neonStripeR.position.set(-0.28, 0.54, 0);
    const techPack = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.8, 0.34), darkSlate);
    techPack.position.set(0, 0.52, -0.44);
    const holoRing = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.045, 8, 20), cyanGlow);
    holoRing.position.set(0, 0.64, -0.62);
    rBody.add(neonStripeL, neonStripeR, techPack, holoRing);
    regVariant('raka_gold', upperBody, rBody);

    for (const arm of [leftArm, rightArm]) {
      const cuff = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.1, 0.35), cyanGlow);
      cuff.position.y = -0.36;
      regVariant('raka_gold', arm, cuff);
    }

    const tablet = new THREE.Group();
    tablet.position.set(0.05, -0.74, 0.16);
    tablet.rotation.set(-0.4, 0.15, 0);
    const tFrame = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.06, 0.44), darkSlate);
    const tScreen = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, 0.36), aquaGlow);
    tScreen.position.y = 0.01;
    tablet.add(tFrame, tScreen);
    regVariant('raka_gold', leftArm, tablet);
  }

  // --- 5. LUNA (Penjaga Alam): Forest Flower Circlet + Braided Hair + Quiver + Nature Bow ---
  {
    const lHead = new THREE.Group();
    const lHairTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.24, 0.86), hairWarmBrown);
    lHairTop.position.set(0, 0.8, -0.02);
    const lHairBack = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.86, 0.26), hairWarmBrown);
    lHairBack.position.set(0, 0.34, -0.36);
    const braidL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.72, 0.22), hairWarmBrown);
    braidL.position.set(0.42, 0.14, 0.16);
    const braidR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.72, 0.22), hairWarmBrown);
    braidR.position.set(-0.42, 0.14, 0.16);
    const circlet = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.13, 0.9), greenLeaf);
    circlet.position.set(0, 0.68, 0);
    const flower1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.1), pinkAccent);
    flower1.position.set(0.24, 0.72, 0.44);
    const flower2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.1), gold);
    flower2.position.set(-0.22, 0.72, 0.44);
    lHead.add(lHairTop, lHairBack, braidL, braidR, circlet, flower1, flower2);
    regVariant('luna_violet', headGroup, lHead);

    const lBody = new THREE.Group();
    const sashStrap = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.04, 0.64), boot);
    sashStrap.position.set(0, 0.52, 0);
    sashStrap.rotation.z = 0.55;
    const quiver = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.76, 0.28), boot);
    quiver.position.set(0.18, 0.64, -0.44);
    quiver.rotation.z = -0.3;
    const arrowFletch = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.26), greenLeaf);
    arrowFletch.position.set(0.3, 1.02, -0.44);
    lBody.add(sashStrap, quiver, arrowFletch);
    regVariant('luna_violet', upperBody, lBody);

    for (const arm of [leftArm, rightArm]) {
      const vineWrap = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.34), greenLeaf);
      vineWrap.position.y = -0.46;
      regVariant('luna_violet', arm, vineWrap);
    }

    const bow = new THREE.Group();
    bow.position.set(0.12, -0.68, 0.14);
    const bowGrip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.46, 0.12), boot);
    const bowTop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 0.1), greenLeaf);
    bowTop.position.set(0, 0.38, -0.1);
    bowTop.rotation.x = 0.45;
    const bowBot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 0.1), greenLeaf);
    bowBot.position.set(0, -0.38, -0.1);
    bowBot.rotation.x = -0.45;
    const bowString = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.15, 0.03), owlCream);
    bowString.position.set(0, 0, -0.2);
    bow.add(bowGrip, bowTop, bowBot, bowString);
    regVariant('luna_violet', leftArm, bow);
  }

  // --- 6. NUSA (Pengembara Bahari): Aquatic Ear-Fins + Blue-Gold Scale Armor + Trisula ---
  {
    const nHead = new THREE.Group();
    const nHairTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.26, 0.86), hairWarmBrown);
    nHairTop.position.set(0, 0.81, -0.02);
    const nHairBack = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.58, 0.24), hairWarmBrown);
    nHairBack.position.set(0, 0.48, -0.34);
    const finL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.26), cyanGlow);
    finL.position.set(0.5, 0.48, -0.04);
    finL.rotation.z = -0.35;
    const finR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.26), cyanGlow);
    finR.position.set(-0.5, 0.48, -0.04);
    finR.rotation.z = 0.35;
    nHead.add(nHairTop, nHairBack, finL, finR);
    regVariant('nusa_teal', headGroup, nHead);

    const nBody = new THREE.Group();
    const armorChest = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.72, 0.64), oceanPlate);
    armorChest.position.set(0, 0.64, 0);
    const goldCrest = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.68), gold);
    goldCrest.position.set(0, 0.72, 0);
    const goldHem = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.14, 0.66), gold);
    goldHem.position.set(0, 0.24, 0);
    nBody.add(armorChest, goldCrest, goldHem);
    regVariant('nusa_teal', upperBody, nBody);

    for (const [arm, dir] of [[leftArm, 1], [rightArm, -1]] as const) {
      const pauldron = new THREE.Group();
      const pTop = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.44), oceanPlate);
      pTop.position.set(dir * 0.06, -0.02, 0);
      const pTrim = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 0.46), gold);
      pTrim.position.set(dir * 0.06, -0.14, 0);
      pauldron.add(pTop, pTrim);
      regVariant('nusa_teal', arm, pauldron);
    }

    const trisula = new THREE.Group();
    trisula.position.set(0.12, -0.4, 0.18);
    const tShaft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.55, 0.08), gold);
    const tCross = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.1), aquaGlow);
    tCross.position.y = 0.76;
    const tMid = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.1), aquaGlow);
    tMid.position.y = 0.96;
    const tProngL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.08), aquaGlow);
    tProngL.position.set(0.18, 0.92, 0);
    const tProngR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.08), aquaGlow);
    tProngR.position.set(-0.18, 0.92, 0);
    trisula.add(tShaft, tCross, tMid, tProngL, tProngR);
    regVariant('nusa_teal', leftArm, trisula);
  }

  // Apply bare arms immediately if Karsa is initial preset
  if (presetId === 'karsa_crimson') {
    leftSleeveMesh.material = skin;
    rightSleeveMesh.material = skin;
  }

  // Scuba Explore Gear (visible exclusively during scuba_explore pose)
  const scubaSlate = palette.getMat(0x1e293b, 'matte');
  const scubaTankMetal = palette.getMat(0x94a3b8, 'metal');
  const scubaAccent = palette.getMat(0x06b6d4, 'emissive');
  const scubaLens = palette.createSurfaceMat({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
    roughness: 0.15,
  });

  const scubaMask = new THREE.Group();
  const gogglesRim = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.28, 0.12), scubaSlate);
  gogglesRim.position.set(0, 0.41, 0.43);
  const gogglesVisor = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.2, 0.06), scubaLens);
  gogglesVisor.position.set(0, 0.41, 0.47);
  const maskStrap = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.86), scubaSlate);
  maskStrap.position.set(0, 0.41, 0);
  const snorkelTube = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.62, 0.1), palette.getMat(0xf59e0b, 'matte'));
  snorkelTube.position.set(0.46, 0.56, 0.18);
  scubaMask.add(gogglesRim, gogglesVisor, maskStrap, snorkelTube);
  scubaMask.visible = false;
  headGroup.add(scubaMask);

  const scubaTanks = new THREE.Group();
  for (const tx of [-0.17, 0.17]) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.78, 10), scubaTankMetal);
    tank.position.set(tx, 0.52, -0.7);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 10), palette.getMat(0xfacc15, 'matte'));
    band.position.set(tx, 0.62, -0.7);
    scubaTanks.add(tank, band);
  }
  scubaTanks.visible = false;
  upperBody.add(scubaTanks);

  const scubaTorch = new THREE.Group();
  scubaTorch.position.set(0, -0.76, 0.12);
  scubaTorch.rotation.x = Math.PI / 2;
  const torchBody = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.42, 8), scubaSlate);
  torchBody.rotation.x = Math.PI / 2;
  torchBody.position.z = 0.14;
  const torchGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.08, 10), scubaAccent);
  torchGlow.rotation.x = Math.PI / 2;
  torchGlow.position.z = 0.36;
  const torchBeam = new THREE.Mesh(
    new THREE.ConeGeometry(0.46, 1.45, 12, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  torchBeam.rotation.x = -Math.PI / 2;
  torchBeam.position.z = 1.1;
  scubaTorch.add(torchBody, torchGlow, torchBeam);
  scubaTorch.visible = false;
  rightArm.add(scubaTorch);

  // Dash / Pulse ring
  const dashRing = new THREE.Mesh(
    new THREE.RingGeometry(1.1, 1.45, 28),
    new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  dashRing.rotation.x = -Math.PI / 2;
  dashRing.position.y = 0.08;
  root.add(dashRing);

  // Diving Wetsuit Vest + Cyan Trim + Flippers + Turtle Mount (toggled via worn DivingGear / mount)
  const wetsuitSlate = palette.getMat(0x0f172a, 'matte');
  const wetsuitTrim = palette.getMat(0x06b6d4, 'emissive');
  const finYellow = palette.getMat(0xfacc15, 'matte');

  const wetsuitChest = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.96, 0.64), wetsuitSlate);
  wetsuitChest.position.y = 0.5;
  wetsuitChest.visible = false;
  const wetsuitStripe = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.16, 0.66), wetsuitTrim);
  wetsuitStripe.position.y = 0.72;
  wetsuitStripe.visible = false;
  upperBody.add(wetsuitChest, wetsuitStripe);
  const wetsuitAccents: THREE.Mesh[] = [wetsuitChest, wetsuitStripe];

  const flippers: THREE.Group[] = [];
  for (const leg of [leftLeg, rightLeg]) {
    const fin = new THREE.Group();
    fin.position.set(0, -0.98, 0.34);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.68), finYellow);
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.14, 0.22), wetsuitSlate);
    strap.position.z = -0.22;
    fin.add(blade, strap);
    fin.visible = false;
    leg.add(fin);
    flippers.push(fin);
  }

  // Rideable Sea Turtle Mount ("MOUNT: Yes") - saddle-proportioned so Hero sits cleanly ON TOP of shell
  const turtleMount = new THREE.Group();
  const tShell = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.48, 1.78), palette.getMat(0x166534, 'matte'));
  tShell.position.y = 0.36;
  const tShellRim = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.14, 1.92), palette.getMat(0x14532d, 'matte'));
  tShellRim.position.y = 0.2;
  const tShellCap = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.22, 1.32), palette.getMat(0x22c55e, 'matte'));
  tShellCap.position.y = 0.68;
  const tHead = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.44, 0.68), palette.getMat(0x4ade80, 'matte'));
  tHead.position.set(0, 0.46, 1.12);
  const tEyeMat = palette.getMat(0x0f172a, 'gloss');
  const tEyeL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), tEyeMat);
  tEyeL.position.set(0.26, 0.56, 1.28);
  const tEyeR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), tEyeMat);
  tEyeR.position.set(-0.26, 0.56, 1.28);
  const tFlapL = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 0.46), palette.getMat(0x22c55e, 'matte'));
  tFlapL.position.set(1.06, 0.26, 0.44);
  const tFlapR = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 0.46), palette.getMat(0x22c55e, 'matte'));
  tFlapR.position.set(-1.06, 0.26, 0.44);
  const tRearL = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.1, 0.38), palette.getMat(0x16a34a, 'matte'));
  tRearL.position.set(0.72, 0.22, -0.78);
  const tRearR = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.1, 0.38), palette.getMat(0x16a34a, 'matte'));
  tRearR.position.set(-0.72, 0.22, -0.78);
  turtleMount.add(tShell, tShellRim, tShellCap, tHead, tEyeL, tEyeR, tFlapL, tFlapR, tRearL, tRearR);
  turtleMount.userData.flaps = [tFlapL, tFlapR, tRearL, tRearR];
  turtleMount.visible = false;
  root.add(turtleMount);

  // Water surface swim ripple ring (positioned dynamically at water y=0 in engine)
  const swimRing = new THREE.Mesh(
    new THREE.RingGeometry(0.78, 1.12, 24),
    new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  swimRing.rotation.x = -Math.PI / 2;
  swimRing.position.y = 0.06;
  swimRing.visible = false;
  root.add(swimRing);

  return {
    root,
    body,
    upperBody,
    headGroup,
    leftEye,
    rightEye,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    dashRing,
    swimRing,
    scubaMask,
    scubaTanks,
    scubaTorch,
    wetsuitAccents,
    flippers,
    turtleMount,
    weaponGroup,
    weaponMeshes,
    weaponTipMat,
    activePresetId: presetId,
    variantGroups,
    leftSleeveMesh,
    rightSleeveMesh,
    appearanceMats: {
      skin,
      tunic,
      pants,
      hat: hatMat,
      pack,
      feather: featherMat,
    },
  };
}

export function applyHeroAppearance(
  rig: HeroAvatarRig,
  colors: HeroAppearanceColors,
  presetId?: CharacterPresetId,
): void {
  const mats = rig.appearanceMats;
  if (!mats) return;
  mats.skin.color.setHex(colors.skinHex);
  mats.tunic.color.setHex(colors.tunicHex);
  mats.pants.color.setHex(colors.pantsHex);
  mats.hat.color.setHex(colors.hatHex);
  mats.pack.color.setHex(colors.packHex);
  mats.feather.color.setHex(colors.featherHex);

  if (presetId && rig.variantGroups) {
    rig.activePresetId = presetId;
    (Object.keys(rig.variantGroups) as CharacterPresetId[]).forEach((id) => {
      const visible = id === presetId;
      for (const obj of rig.variantGroups![id]) {
        obj.visible = visible;
      }
    });
    const sleeveMat = presetId === 'karsa_crimson' ? mats.skin : mats.tunic;
    if (rig.leftSleeveMesh) rig.leftSleeveMesh.material = sleeveMat;
    if (rig.rightSleeveMesh) rig.rightSleeveMesh.material = sleeveMat;
  }
}

export function setHeroWeaponVisual(
  rig: HeroAvatarRig,
  weaponOrColorHex: WeaponId | number,
  owned: boolean,
): void {
  rig.weaponGroup.visible = owned;
  if (typeof weaponOrColorHex === 'string') {
    WEAPON_ORDER.forEach((id) => {
      const m = rig.weaponMeshes[id];
      if (m) m.visible = id === weaponOrColorHex;
    });
  } else {
    rig.weaponTipMat.color.setHex(weaponOrColorHex);
    rig.weaponTipMat.emissive.setHex(weaponOrColorHex);
  }
}

export type WeaponPoseClass =
  | 'pistol'
  | 'handcannon'
  | 'cqb_smg'
  | 'rifle_twohand'
  | 'heavy_gatling';

export function getWeaponPoseClass(weaponId: WeaponId): WeaponPoseClass {
  if (weaponId === 'ketapel') return 'pistol';
  if (weaponId === 'emas') return 'handcannon';
  if (weaponId === 'saus' || weaponId === 'kristal') return 'cqb_smg';
  if (weaponId === 'jarum') return 'heavy_gatling';
  return 'rifle_twohand'; // kerikil, biji, kertas
}

export interface HeroWeaponPoseInput {
  speed: number;
  walkCycle: number;
  aimAlpha: number; // 0 = carry/ready stance, 1 = full aiming stance
  recoil: number; // 0..1 kickback impulse right after shooting
  dt: number;
  elapsed?: number;
  aimPitch?: number; // + = aiming up, - = aiming down
  onGround?: boolean;
  velY?: number;
  landImpulse?: number;
  idleDuration?: number;
  isSwimming?: boolean;
  swimStyle?: SwimStyleId;
  swimBankRoll?: number;
  divingGear?: DivingGearId[];
  wearingSwimsuit?: boolean;
  ridingTurtle?: boolean;
  jumpDiveTrick?: JumpDiveTrick | null;
  jumpDiveElapsed?: number;
  carPose?: {
    seated: boolean;
    steerAngle: number;
    speedRatio: number;
  } | null;
}

/**
 * Smoothly animates legs, torso lean/twist, head counter-look, both arms,
 * swimming stroke/kick, and weapon grip angle for distinct weapons.
 */
export function applyHeroWeaponPose(
  rig: HeroAvatarRig,
  weaponId: WeaponId,
  hasWeapon: boolean,
  input: HeroWeaponPoseInput,
): void {
  const {
    speed,
    walkCycle,
    aimAlpha,
    recoil,
    dt,
    elapsed = 0,
    aimPitch = 0,
    onGround = true,
    velY = 0,
    landImpulse = 0,
    idleDuration = 0,
    isSwimming = false,
    swimStyle,
    swimBankRoll = 0,
    divingGear = [],
    wearingSwimsuit = false,
    ridingTurtle = false,
    jumpDiveTrick = null,
    jumpDiveElapsed = 0,
    carPose = null,
  } = input;
  const clampedAimPitch = THREE.MathUtils.clamp(aimPitch, -0.68, 1.32);
  const moving = speed > 0.6;
  const airborne = !onGround && !isSwimming;
  const jumpRise = THREE.MathUtils.clamp(velY / 11.4, -1, 1);
  const swing = moving ? Math.sin(walkCycle) * 0.6 : 0;
  const idleActive = !moving && !airborne && !isSwimming && aimAlpha < 0.08 && idleDuration >= 1.8;
  const idleBlend = idleActive ? THREE.MathUtils.clamp((idleDuration - 1.8) / 0.55, 0, 1) : 0;
  const idle = computeIdleBehavior(elapsed, 0.25);

  const breathWave = Math.sin(elapsed * 2.5);
  const deepExpand = !moving && !airborne && !isSwimming ? idle.deepBreath * 0.038 : 0;
  const breath = breathWave * 0.025 + deepExpand * 0.4;
  const dampRate = Math.min(28, 18);

  // Living Hero breathing & jump squash-and-stretch (volume preserving, grounded at feet!)
  const strideBounce = moving && onGround ? Math.abs(Math.sin(walkCycle)) * 0.048 : 0;
  const jumpStretch = airborne
    ? Math.max(0, jumpRise) * 0.095 + Math.max(0, -jumpRise) * 0.045
    : -landImpulse * 0.16;
  const targetBodySy =
    1 +
    (airborne
      ? jumpStretch
      : breathWave * 0.042 + deepExpand + strideBounce + jumpStretch) -
    recoil * 0.065;
  const curBodySy = THREE.MathUtils.damp(rig.body.scale.y, targetBodySy, 16, dt);
  const safeBodySy = Math.max(0.76, curBodySy);
  const bodySxz = 1 / Math.sqrt(safeBodySy);
  rig.body.scale.set(bodySxz, safeBodySy, bodySxz);

  // Natural eye blinking on Hero
  const blinkY = computeBlinkScale(elapsed, 0.25);
  rig.leftEye.scale.y = blinkY;
  rig.rightEye.scale.y = blinkY;

  // Target leg & body height
  const jumpLead = moving && Math.sin(walkCycle) < 0 ? -1 : 1;
  const airBlend = (jumpRise + 1) * 0.5; // 1 = rising takeoff, 0 = falling
  let targetLeftLegX = airborne
    ? jumpLead * THREE.MathUtils.lerp(-0.42, -0.86, airBlend)
    : moving
    ? swing
    : -landImpulse * 0.24;
  let targetRightLegX = airborne
    ? jumpLead * THREE.MathUtils.lerp(0.32, 0.68, airBlend)
    : moving
    ? -swing
    : landImpulse * 0.24;
  let targetLeftLegZ = airborne ? 0.1 : landImpulse * 0.14;
  let targetRightLegZ = airborne ? -0.1 : -landImpulse * 0.14;
  let targetBodyY = airborne
    ? Math.max(0, jumpRise) * 0.08
    : (moving ? Math.abs(Math.sin(walkCycle)) * 0.12 : 0) - landImpulse * 0.14;

  let targetUpperX = airborne
    ? THREE.MathUtils.lerp(0.22, 0.08, airBlend)
    : breath * 0.75 + landImpulse * 0.18;
  let targetUpperY = !moving && !airborne && aimAlpha < 0.35 ? Math.sin(elapsed * 1.15) * 0.045 : 0;
  let targetHeadX = airborne
    ? -0.09
    : !moving && aimAlpha < 0.35
    ? Math.sin(elapsed * 1.55) * 0.04
    : 0;
  let targetHeadY = !moving && !airborne && aimAlpha < 0.35 ? Math.sin(elapsed * 0.85) * 0.14 : 0;
  let targetHeadZ = !moving && !airborne && aimAlpha < 0.35 ? Math.sin(elapsed * 1.05) * 0.025 : 0;

  let targetRightArmX = airborne
    ? THREE.MathUtils.lerp(-0.68, -1.48, airBlend)
    : moving
    ? swing * 0.55
    : breathWave * 0.055;
  let targetRightArmY = 0;
  let targetRightArmZ = airborne
    ? THREE.MathUtils.lerp(-0.42, -0.22, airBlend)
    : !moving
    ? -0.03 - breathWave * 0.015
    : 0;

  let targetLeftArmX = airborne
    ? THREE.MathUtils.lerp(-0.78, -1.25, airBlend)
    : moving
    ? -swing * 0.65
    : -breathWave * 0.055;
  let targetLeftArmY = 0;
  let targetLeftArmZ = airborne
    ? THREE.MathUtils.lerp(0.42, 0.24, airBlend)
    : !moving
    ? 0.03 + breathWave * 0.015
    : 0;

  let targetWeaponPosY = -0.72;
  let targetWeaponPosZ = 0.06;
  let targetWeaponRotY = 0;
  let targetWeaponRotZ = 0;

  if (hasWeapon) {
    const cls = getWeaponPoseClass(weaponId);

    if (cls === 'pistol') {
      // Tactical Pistol: right-hand trigger grip, left hand cups under right wrist when aiming
      targetUpperY = THREE.MathUtils.lerp(-0.08, -0.18, aimAlpha);
      targetHeadY = -targetUpperY * 0.9;
      targetUpperX = aimAlpha * 0.04 - recoil * 0.06;

      targetRightArmX = THREE.MathUtils.lerp(
        moving ? -0.58 + swing * 0.22 : -0.64,
        -1.56 - recoil * 0.34,
        aimAlpha,
      );
      targetRightArmZ = THREE.MathUtils.lerp(0.06, 0.14, aimAlpha);

      // Left arm swings naturally while walking with pistol, or cups under right wrist when aiming!
      targetLeftArmX = THREE.MathUtils.lerp(
        moving ? -swing * 0.68 : 0.14,
        -1.36 - recoil * 0.2,
        aimAlpha,
      );
      targetLeftArmZ = THREE.MathUtils.lerp(-0.04, -0.52, aimAlpha);
      targetWeaponRotY = THREE.MathUtils.lerp(0, -0.14, aimAlpha);
    } else if (cls === 'handcannon') {
      // Golden Revolver: right-handed gunslinger stance & strong muzzle flip recoil
      targetUpperY = THREE.MathUtils.lerp(-0.22, -0.32, aimAlpha);
      targetHeadY = -targetUpperY * 0.92;
      targetUpperX = -recoil * 0.1;

      targetRightArmX = THREE.MathUtils.lerp(
        moving ? -0.75 + swing * 0.18 : -0.88,
        -1.58 - recoil * 0.48,
        aimAlpha,
      );
      targetRightArmZ = THREE.MathUtils.lerp(0.1, 0.22, aimAlpha);

      // Counterweight left arm swept outward behind hip when firing
      targetLeftArmX = THREE.MathUtils.lerp(
        moving ? -swing * 0.55 : 0.28,
        0.46 + recoil * 0.18,
        aimAlpha,
      );
      targetLeftArmZ = THREE.MathUtils.lerp(0.08, 0.28, aimAlpha);
      targetWeaponRotY = THREE.MathUtils.lerp(-0.05, -0.24, aimAlpha);
    } else if (cls === 'cqb_smg') {
      // Drum SMG / Crystal Fang Blaster: right-handed tight two-hand CQB stance across chest
      targetUpperY = THREE.MathUtils.lerp(-0.2, -0.28, aimAlpha);
      targetHeadY = -targetUpperY * 0.92;
      targetUpperX = THREE.MathUtils.lerp(0.06, 0.11 - recoil * 0.09, aimAlpha);

      targetRightArmX = THREE.MathUtils.lerp(
        -0.96 + (moving ? swing * 0.12 : 0),
        -1.46 - recoil * 0.16,
        aimAlpha,
      );
      targetRightArmZ = THREE.MathUtils.lerp(0.2, 0.24, aimAlpha);
      targetRightArmY = THREE.MathUtils.lerp(-0.14, -0.18, aimAlpha);

      targetLeftArmX = THREE.MathUtils.lerp(
        -0.9 + (moving ? -swing * 0.1 : 0),
        -1.4 - recoil * 0.14,
        aimAlpha,
      );
      targetLeftArmZ = THREE.MathUtils.lerp(-0.46, -0.54, aimAlpha);
      targetWeaponRotY = THREE.MathUtils.lerp(-0.22, -0.28, aimAlpha);
      targetWeaponPosZ = 0.08;
    } else if (cls === 'rifle_twohand') {
      // Combat Shotgun / Precision Sniper / Sky Railgun: right-shoulder two-handed shooter stance!
      targetUpperY = THREE.MathUtils.lerp(-0.34, -0.44, aimAlpha);
      targetHeadY = -targetUpperY * 0.94;
      targetHeadZ = -aimAlpha * 0.08;
      targetHeadX = aimAlpha * 0.06;
      targetUpperX = THREE.MathUtils.lerp(0.04, 0.09 - recoil * 0.14, aimAlpha);

      targetRightArmX = THREE.MathUtils.lerp(
        -0.82 + (moving ? swing * 0.1 : 0),
        -1.52 - recoil * 0.24,
        aimAlpha,
      );
      targetRightArmZ = THREE.MathUtils.lerp(0.22, 0.26, aimAlpha);
      targetRightArmY = THREE.MathUtils.lerp(-0.18, -0.22, aimAlpha);

      targetLeftArmX = THREE.MathUtils.lerp(
        -0.98 + (moving ? -swing * 0.1 : 0),
        -1.46 - recoil * 0.18,
        aimAlpha,
      );
      targetLeftArmZ = THREE.MathUtils.lerp(-0.48, -0.58, aimAlpha);
      targetLeftArmY = 0.15;

      targetWeaponRotY = THREE.MathUtils.lerp(-0.26, -0.34, aimAlpha);
      targetWeaponPosY = -0.68;
      targetWeaponPosZ = 0.08;

      if (!moving && aimAlpha > 0.3) {
        targetLeftLegZ = 0.1 * aimAlpha;
        targetRightLegZ = -0.1 * aimAlpha;
        targetLeftLegX = 0.18 * aimAlpha;
        targetRightLegX = -0.16 * aimAlpha;
      }
    } else {
      // Heavy Triple-Barrel Gatling ('jarum'): right-side braced hip-carry, left hand gripping top carry bar!
      targetUpperY = THREE.MathUtils.lerp(-0.22, -0.28, aimAlpha);
      targetHeadY = -targetUpperY * 0.9;
      targetUpperX = THREE.MathUtils.lerp(-0.08, -0.15 - recoil * 0.1, aimAlpha);

      targetRightArmX = THREE.MathUtils.lerp(
        -0.52 + (moving ? swing * 0.1 : 0),
        -1.15 - recoil * 0.16,
        aimAlpha,
      );
      targetRightArmZ = 0.18;

      targetLeftArmX = THREE.MathUtils.lerp(
        -0.98 + (moving ? -swing * 0.08 : 0),
        -1.26 - recoil * 0.14,
        aimAlpha,
      );
      targetLeftArmZ = THREE.MathUtils.lerp(-0.46, -0.56, aimAlpha);
      targetWeaponRotY = THREE.MathUtils.lerp(-0.18, -0.24, aimAlpha);
      targetWeaponPosY = -0.76;

      if (!moving) {
        targetLeftLegZ = 0.12;
        targetRightLegZ = -0.12;
      }
    }
    // Apply vertical crosshair aim pitch across torso, head, and weapon arms (including steep skyward aiming)!
    if (aimAlpha > 0.02 && Math.abs(clampedAimPitch) > 0.005) {
      const pitchShift = clampedAimPitch * aimAlpha;
      targetRightArmX -= pitchShift;
      if (cls !== 'handcannon') {
        targetLeftArmX -= pitchShift;
      } else if (pitchShift > 0.22) {
        targetLeftArmX -= (pitchShift - 0.22) * 0.35;
      }
      targetHeadX -= pitchShift * 0.72;
      targetUpperX -= pitchShift * 0.34;
    }
  }

  let targetUpperZ = 0;
  if (idleBlend > 0.01) {
    // Autonomous swallow reflex & subtle shoulder twitch
    targetHeadX += (idle.swallowNod + idle.twitch * 0.4) * idleBlend;
    targetLeftArmZ += idle.twitch * 0.9 * idleBlend;

    const e = idle.env * idleBlend;
    if (idle.action === 'scan') {
      const lookSweep = Math.sin(idle.t * Math.PI * 2) * 0.42 * idle.side;
      targetHeadY += lookSweep * e;
      targetUpperY += lookSweep * 0.24 * e;
      targetHeadX += -0.06 * Math.sin(idle.t * Math.PI) * e;
    } else if (idle.action === 'scratch') {
      // Raise free left hand toward back/side of head & gently scratch
      const rub = Math.sin(idle.t * Math.PI * 7) * 0.14;
      targetLeftArmX = THREE.MathUtils.lerp(targetLeftArmX, -2.05 + rub, e);
      targetLeftArmZ = THREE.MathUtils.lerp(targetLeftArmZ, -0.34, e);
      targetHeadZ += -0.14 * e;
      targetHeadY += 0.16 * e;
      targetHeadX += 0.08 * e;
    } else if (idle.action === 'yawn_stretch') {
      // Deep yawn tilt + arm/shoulder stretch
      targetHeadX += -0.26 * e;
      targetUpperX += -0.1 * e;
      targetLeftArmX = THREE.MathUtils.lerp(targetLeftArmX, -1.05, e);
      targetLeftArmZ = THREE.MathUtils.lerp(targetLeftArmZ, 0.36, e);
      if (!hasWeapon) {
        targetRightArmX = THREE.MathUtils.lerp(targetRightArmX, -1.05, e);
        targetRightArmZ = THREE.MathUtils.lerp(targetRightArmZ, -0.36, e);
      } else {
        targetRightArmX = THREE.MathUtils.lerp(targetRightArmX, -0.55, e);
      }
    } else if (idle.action === 'posture_shift') {
      // Shift body weight onto one leg & relax shoulders
      targetUpperZ += 0.065 * idle.side * e;
      targetHeadZ += -0.05 * idle.side * e;
      if (idle.side > 0) {
        targetLeftLegX += 0.13 * e;
        targetLeftLegZ += 0.06 * e;
      } else {
        targetRightLegX += 0.13 * e;
        targetRightLegZ -= 0.06 * e;
      }
    } else if (idle.action === 'leg_bounce') {
      // Nervous/bored rhythmic foot tap & leg bounce
      const tap = Math.abs(Math.sin(idle.t * Math.PI * 6)) * 0.24;
      if (idle.side > 0) {
        targetRightLegX -= tap * e;
      } else {
        targetLeftLegX -= tap * e;
      }
      targetHeadY += Math.sin(idle.t * Math.PI * 2) * 0.08 * e;
    } else if (idle.action === 'chin_daydream') {
      // Hand to chin or inspect weapon while daydreaming upward
      targetHeadX += -0.19 * e;
      targetHeadY += 0.22 * idle.side * e;
      targetHeadZ += 0.09 * idle.side * e;
      if (hasWeapon) {
        targetWeaponRotZ += 0.38 * Math.sin(idle.t * Math.PI * 2) * e;
        targetRightArmX = THREE.MathUtils.lerp(targetRightArmX, -1.05, e);
        targetLeftArmX = THREE.MathUtils.lerp(targetLeftArmX, -1.28, e);
        targetLeftArmZ = THREE.MathUtils.lerp(targetLeftArmZ, -0.32, e);
      } else {
        targetLeftArmX = THREE.MathUtils.lerp(targetLeftArmX, -1.72, e);
        targetLeftArmZ = THREE.MathUtils.lerp(targetLeftArmZ, -0.4, e);
      }
    }
  }

  let targetBodyRotX = 0;
  let targetBodyRotZ = 0;
  let showScuba = false;
  const activeJumpTrick = !isSwimming && airborne ? jumpDiveTrick : null;

  if (activeJumpTrick === 'backflip') {
    // 1. Backflip: backward 360° somersault into the sea
    targetBodyRotX = -Math.min(Math.PI * 2.15, jumpDiveElapsed * 8.4);
    targetBodyY = 0.45;
    targetUpperX = 0.22;
    targetHeadX = 0.24;
    targetRightArmX = -2.15;
    targetRightArmZ = -0.28;
    targetLeftArmX = -2.15;
    targetLeftArmZ = 0.28;
    targetLeftLegX = -1.25;
    targetRightLegX = -1.25;
    targetLeftLegZ = 0.08;
    targetRightLegZ = -0.08;
  } else if (activeJumpTrick === 'cannonball') {
    // 2. Cannonball: tight curled knee-hug ball plunge
    const t = Math.min(1, jumpDiveElapsed * 2.4);
    targetBodyRotX = 0.42 + Math.sin(t * Math.PI) * 0.36;
    targetBodyRotZ = 0.14;
    targetBodyY = 0.26;
    targetUpperX = 0.46;
    targetHeadX = 0.44;
    targetRightArmX = -1.24;
    targetRightArmZ = 0.34;
    targetLeftArmX = -1.24;
    targetLeftArmZ = -0.34;
    targetLeftLegX = -1.56;
    targetRightLegX = -1.56;
    targetLeftLegZ = 0.12;
    targetRightLegZ = -0.12;
  } else if (activeJumpTrick === 'spreadeagle') {
    // 3. Spreadeagle: wide X-shape star jump above the waves
    targetBodyRotX = 0.48;
    targetBodyY = 0.42;
    targetUpperX = -0.1;
    targetHeadX = -0.36;
    targetRightArmX = -2.35;
    targetRightArmZ = -1.06;
    targetLeftArmX = -2.35;
    targetLeftArmZ = 1.06;
    targetLeftLegX = -0.14;
    targetRightLegX = -0.14;
    targetLeftLegZ = 0.58;
    targetRightLegZ = -0.58;
  } else if (activeJumpTrick === 'swan_dive') {
    // 4. Swan Dive: proud arched wings pitching into a clean dive
    const noseT = Math.min(1, jumpDiveElapsed * 1.65);
    targetBodyRotX = THREE.MathUtils.lerp(0.66, 1.48, noseT);
    targetBodyY = 0.48;
    targetUpperX = -0.26;
    targetHeadX = -0.68;
    targetRightArmX = -1.35;
    targetRightArmZ = -1.18;
    targetLeftArmX = -1.35;
    targetLeftArmZ = 1.18;
    targetLeftLegX = 0.36;
    targetRightLegX = 0.36;
    targetLeftLegZ = 0.03;
    targetRightLegZ = -0.03;
  } else if (activeJumpTrick === 'front_flip') {
    // 5. Front Flip: crisp forward tucked somersault
    targetBodyRotX = Math.min(Math.PI * 2.32, jumpDiveElapsed * 8.6);
    targetBodyY = 0.44;
    targetUpperX = 0.36;
    targetHeadX = 0.32;
    targetRightArmX = -1.45;
    targetRightArmZ = -0.22;
    targetLeftArmX = -1.45;
    targetLeftArmZ = 0.22;
    targetLeftLegX = -1.18;
    targetRightLegX = -1.18;
    targetLeftLegZ = 0.06;
    targetRightLegZ = -0.06;
  } else if (activeJumpTrick === 'corkscrew') {
    // 6. Corkscrew Dive: streamlined dive with mid-air spiral spin
    targetBodyRotX = 1.06;
    targetBodyY = 0.46;
    targetUpperX = 0.08;
    targetHeadX = -0.68;
    targetRightArmX = -2.72;
    targetRightArmZ = -0.16;
    targetLeftArmX = -2.72;
    targetLeftArmZ = 0.16;
    targetLeftLegX = 0.24;
    targetRightLegX = 0.2;
    targetLeftLegZ = 0.04;
    targetRightLegZ = -0.04;
    rig.body.rotation.y += jumpDiveElapsed * 9.5;
  } else if (!isSwimming && airborne && swimStyle === 'jump_dive') {
    // Fallback Jump Dive (Terjun Bebas) while airborne plunging toward water
    targetBodyRotX = 0.86;
    targetBodyY = 0.35;
    targetUpperX = 0.08;
    targetHeadX = -0.68;
    targetRightArmX = -2.55;
    targetRightArmZ = -0.14;
    targetLeftArmX = -2.55;
    targetLeftArmZ = 0.14;
    targetLeftLegX = 0.28;
    targetRightLegX = 0.24;
    targetLeftLegZ = 0.05;
    targetRightLegZ = -0.05;
  } else if (isSwimming) {
    if (hasWeapon && aimAlpha > 0.12) {
      const tread = Math.sin(elapsed * 3.8);
      targetBodyRotX = 0.08;
      targetBodyY = 0.1 + Math.sin(elapsed * 2.6) * 0.05;
      targetLeftLegX = tread * 0.42;
      targetRightLegX = -tread * 0.42;
    } else {
      const effectiveStyle: SwimStyleId = swimStyle ?? (moving ? 'front_crawl' : 'water_tread');
      if (effectiveStyle === 'surface_paddle') {
        // 1. Surface Paddle (Gaya Dada)
        const stroke = walkCycle * 0.92;
        const kick = Math.max(0, Math.sin(stroke + 0.6));
        targetBodyRotX = 0.56;
        targetBodyY = 0.64 + Math.sin(stroke * 2) * 0.04;
        targetUpperX = 0.06;
        targetUpperZ = 0;
        targetHeadX = -0.46;
        targetHeadY = Math.sin(stroke * 0.5) * 0.08;
        targetHeadZ = 0;
        targetRightArmX = -1.25 + Math.cos(stroke) * 0.54;
        targetRightArmZ = -0.52 - Math.max(0, Math.sin(stroke)) * 0.66;
        targetLeftArmX = targetRightArmX;
        targetLeftArmZ = -targetRightArmZ;
        targetLeftLegX = 0.16 + kick * 0.54;
        targetRightLegX = 0.16 + kick * 0.54;
        targetLeftLegZ = 0.14 + kick * 0.24;
        targetRightLegZ = -0.14 - kick * 0.24;
      } else if (effectiveStyle === 'underwater_glide') {
        // 3. Underwater Glide (Meluncur)
        targetBodyRotX = 1.42;
        targetBodyY = 0.88 + Math.sin(elapsed * 4.2) * 0.03;
        targetUpperX = 0.02;
        targetUpperZ = Math.sin(walkCycle * 0.5) * 0.06;
        targetHeadX = -1.16;
        targetHeadY = 0;
        targetHeadZ = 0;
        targetRightArmX = -2.92 + Math.sin(walkCycle * 0.8) * 0.08;
        targetRightArmZ = -0.14;
        targetLeftArmX = -2.92 - Math.sin(walkCycle * 0.8) * 0.08;
        targetLeftArmZ = 0.14;
        targetLeftLegX = 0.12 + Math.sin(walkCycle * 2.1) * 0.36;
        targetRightLegX = 0.12 - Math.sin(walkCycle * 2.1) * 0.36;
        targetLeftLegZ = 0.04;
        targetRightLegZ = -0.04;
      } else if (effectiveStyle === 'jump_dive') {
        // 4. Jump Dive (Terjun Bebas) in water entry glide
        targetBodyRotX = 1.1;
        targetBodyY = 1.04 + Math.abs(Math.sin(walkCycle * 0.8)) * 0.08;
        targetUpperX = 0.08;
        targetUpperZ = 0;
        targetHeadX = -0.82;
        targetHeadY = 0;
        targetHeadZ = 0;
        targetRightArmX = -2.68 + Math.sin(walkCycle * 0.9) * 0.14;
        targetRightArmZ = -0.12;
        targetLeftArmX = -2.68 + Math.sin(walkCycle * 0.9) * 0.14;
        targetLeftArmZ = 0.12;
        targetLeftLegX = 0.24 + Math.sin(walkCycle * 1.4) * 0.18;
        targetRightLegX = 0.24 - Math.sin(walkCycle * 1.4) * 0.18;
        targetLeftLegZ = 0.05;
        targetRightLegZ = -0.05;
      } else if (effectiveStyle === 'deep_submerge') {
        // 5. Deep Submerge (Menyelam Dalam)
        const pull = walkCycle * 0.95;
        targetBodyRotX = 1.54;
        targetBodyY = 0.88 + Math.sin(walkCycle * 1.2) * 0.04;
        targetUpperX = 0.08;
        targetUpperZ = 0;
        targetHeadX = -1.24;
        targetHeadY = 0;
        targetHeadZ = 0;
        targetRightArmX = -2.05 + Math.cos(pull) * 0.85;
        targetRightArmZ = -0.34 - Math.max(0, Math.sin(pull)) * 0.45;
        targetLeftArmX = targetRightArmX;
        targetLeftArmZ = -targetRightArmZ;
        targetLeftLegX = 0.16 + Math.sin(walkCycle * 1.6) * 0.48;
        targetRightLegX = 0.16 - Math.sin(walkCycle * 1.6) * 0.48;
        targetLeftLegZ = 0.08;
        targetRightLegZ = -0.08;
      } else if (effectiveStyle === 'scuba_explore') {
        // 6. Scuba Explore (Eksplorasi Scuba - With Gear)
        showScuba = true;
        targetBodyRotX = 1.38;
        targetBodyY = 0.9 + Math.sin(elapsed * 2.8) * 0.04;
        targetUpperX = 0.04;
        targetUpperZ = Math.sin(walkCycle * 0.45) * 0.08;
        targetHeadX = -1.08;
        targetHeadY = Math.sin(elapsed * 1.2) * 0.18;
        targetHeadZ = 0;
        targetRightArmX = -1.62 + Math.sin(elapsed * 2.2) * 0.06;
        targetRightArmZ = -0.14;
        targetLeftArmX = -1.15 + Math.sin(walkCycle * 0.85) * 0.35;
        targetLeftArmZ = 0.42 + Math.cos(walkCycle * 0.85) * 0.2;
        targetLeftLegX = 0.1 + Math.sin(walkCycle * 1.25) * 0.54;
        targetRightLegX = 0.1 - Math.sin(walkCycle * 1.25) * 0.54;
        targetLeftLegZ = 0.07;
        targetRightLegZ = -0.07;
      } else if (effectiveStyle === 'quick_dodge') {
        // 8. Quick Dodge (Manuver Aman)
        const bank = Math.abs(swimBankRoll) > 0.08 ? swimBankRoll : Math.sin(walkCycle * 0.95) * 0.46;
        targetBodyRotX = 1.12;
        targetBodyRotZ = THREE.MathUtils.clamp(bank, -0.58, 0.58);
        targetBodyY = 0.9 + Math.sin(walkCycle * 2) * 0.04;
        targetUpperX = 0.04;
        targetUpperZ = -targetBodyRotZ * 0.42;
        targetHeadX = -0.92;
        targetHeadY = 0;
        targetHeadZ = -targetBodyRotZ * 0.55;
        targetRightArmX = -1.55 + Math.sin(walkCycle * 1.3) * 0.95;
        targetRightArmZ = -0.42 - Math.cos(walkCycle * 1.3) * 0.35;
        targetLeftArmX = -1.55 - Math.sin(walkCycle * 1.3) * 0.95;
        targetLeftArmZ = 0.42 + Math.cos(walkCycle * 1.3) * 0.35;
        targetLeftLegX = Math.sin(walkCycle * 1.8) * 0.68;
        targetRightLegX = -Math.sin(walkCycle * 1.8) * 0.68;
        targetLeftLegZ = 0.1;
        targetRightLegZ = -0.1;
      } else if (effectiveStyle === 'water_dash') {
        // 9. Water Dash (Mencoba Cepat - Butterfly Burst)
        const fly = walkCycle * 1.35;
        const dolphin = Math.sin(fly + 0.5) * 0.58;
        targetBodyRotX = 1.28;
        targetBodyY = 0.98 + Math.sin(fly) * 0.08;
        targetUpperX = 0.1 + Math.cos(fly) * 0.14;
        targetUpperZ = 0;
        targetHeadX = -1.04 + Math.cos(fly) * 0.16;
        targetHeadY = 0;
        targetHeadZ = 0;
        targetRightArmX = -1.85 + Math.sin(fly) * 1.25;
        targetRightArmZ = -0.34 - Math.cos(fly) * 0.36;
        targetLeftArmX = targetRightArmX;
        targetLeftArmZ = -targetRightArmZ;
        targetLeftLegX = dolphin;
        targetRightLegX = dolphin;
        targetLeftLegZ = 0.04;
        targetRightLegZ = -0.04;
      } else if (effectiveStyle === 'backstroke') {
        // 10. Backstroke (Gaya Punggung)
        const bCycle = walkCycle * 0.85;
        targetBodyRotX = -1.24;
        targetBodyY = 1.04 + Math.sin(elapsed * 2.8) * 0.04;
        targetUpperX = -0.05;
        targetUpperZ = Math.sin(bCycle) * 0.18;
        targetHeadX = 0.52;
        targetHeadY = 0;
        targetHeadZ = Math.sin(bCycle) * 0.08;
        targetRightArmX = -2.45 + Math.sin(bCycle) * 1.25;
        targetRightArmZ = -0.28 - Math.cos(bCycle) * 0.28;
        targetLeftArmX = -2.45 - Math.sin(bCycle) * 1.25;
        targetLeftArmZ = 0.28 + Math.cos(bCycle) * 0.28;
        targetLeftLegX = -0.18 + Math.sin(walkCycle * 1.4) * 0.45;
        targetRightLegX = -0.18 - Math.sin(walkCycle * 1.4) * 0.45;
        targetLeftLegZ = 0.07;
        targetRightLegZ = -0.07;
      } else if (effectiveStyle === 'front_crawl') {
        // 2. Front Crawl (Gaya Bebas)
        targetBodyRotX = 1.24;
        targetBodyY = 0.94 + Math.sin(walkCycle * 2) * 0.04;
        targetUpperX = 0.04;
        targetUpperZ = Math.sin(walkCycle) * 0.28;
        targetHeadX = -0.96;
        targetHeadY = Math.sin(walkCycle) * 0.1;
        targetHeadZ = -Math.sin(walkCycle) * 0.14;
        targetRightArmX = -1.82 + Math.sin(walkCycle) * 1.22;
        targetRightArmZ = -0.26 - Math.cos(walkCycle) * 0.24;
        targetLeftArmX = -1.82 - Math.sin(walkCycle) * 1.22;
        targetLeftArmZ = 0.26 + Math.cos(walkCycle) * 0.24;
        targetLeftLegX = Math.sin(walkCycle * 1.7) * 0.64;
        targetRightLegX = -Math.sin(walkCycle * 1.7) * 0.64;
        targetLeftLegZ = 0.08;
        targetRightLegZ = -0.08;
      } else {
        // 7. Water Tread (Mengapung)
        const tread = Math.sin(elapsed * 3.1);
        targetBodyRotX = 0.1;
        targetBodyY = 0.14 + Math.sin(elapsed * 2.6) * 0.05;
        targetUpperX = 0.04;
        targetUpperZ = 0;
        targetHeadX = -0.05;
        targetHeadY = Math.sin(elapsed * 0.9) * 0.15;
        targetHeadZ = 0;
        targetRightArmX = -0.78 + tread * 0.22;
        targetRightArmZ = -0.64 - tread * 0.34;
        targetLeftArmX = -0.78 - tread * 0.22;
        targetLeftArmZ = 0.64 + tread * 0.34;
        targetLeftLegX = tread * 0.36;
        targetRightLegX = -tread * 0.36;
        targetLeftLegZ = 0.08;
        targetRightLegZ = -0.08;
      }
    }
  }

  const turtleBobY = Math.sin(elapsed * 3.2) * 0.04;
  if (isSwimming && ridingTurtle) {
    // Lower body so pelvis (y=1.10) lands at y=0.84 directly ON TOP of the turtle shell (top=0.79)
    // and straddle thighs outward around the shell sides!
    targetBodyRotX = 0.08;
    targetBodyRotZ = 0;
    targetBodyY = -0.25 + turtleBobY;
    targetUpperX = 0.24;
    targetUpperY = 0;
    targetUpperZ = 0;
    targetHeadX = -0.22;
    targetHeadY = 0;
    targetHeadZ = 0;
    targetRightArmX = -0.88;
    targetRightArmZ = -0.16;
    targetLeftArmX = -0.88;
    targetLeftArmZ = 0.16;
    targetLeftLegX = -0.92;
    targetRightLegX = -0.92;
    targetLeftLegZ = 0.62;
    targetRightLegZ = -0.62;
  }

  if (carPose?.seated) {
    const steer = THREE.MathUtils.clamp(carPose.steerAngle, -0.7, 0.7);
    const engineVib = Math.sin(elapsed * 26) * 0.008 * (0.35 + Math.abs(carPose.speedRatio));
    targetBodyRotX = 0;
    targetBodyRotZ = 0;
    targetBodyY = -0.32 + engineVib;
    targetUpperX = 0.05;
    targetUpperY = 0;
    targetUpperZ = -steer * 0.09;
    targetHeadX = -0.02;
    targetHeadY = steer * 0.24;
    targetHeadZ = 0;
    targetLeftLegX = -1.42;
    targetRightLegX = -1.42;
    targetLeftLegZ = 0.06;
    targetRightLegZ = -0.06;
    targetLeftArmX = -1.18 + steer * 0.22;
    targetRightArmX = -1.18 - steer * 0.22;
    targetLeftArmY = -0.18;
    targetRightArmY = 0.18;
    targetLeftArmZ = -0.16;
    targetRightArmZ = 0.16;
  }

  const showSwimSuitLook = Boolean(wearingSwimsuit && isSwimming);
  const showMask = showScuba || showSwimSuitLook || divingGear.includes('snorkel');
  const showTank = showScuba || divingGear.includes('wetsuit_tank');
  const showWetsuit = showTank || showSwimSuitLook;
  const showTorch = showScuba || divingGear.includes('fins_torch');
  const showFins = showTorch || showSwimSuitLook;

  rig.scubaMask.visible = showMask;
  rig.scubaTanks.visible = showTank;
  for (const acc of rig.wetsuitAccents) {
    acc.visible = showWetsuit;
  }
  rig.scubaTorch.visible = showTorch;
  for (const fin of rig.flippers) {
    fin.visible = showFins;
  }
  rig.turtleMount.visible = ridingTurtle && isSwimming;
  if (rig.turtleMount.visible) {
    rig.turtleMount.rotation.y = rig.body.rotation.y;
    rig.turtleMount.rotation.x = 0.08;
    rig.turtleMount.position.y = turtleBobY;
    const flaps = rig.turtleMount.userData.flaps as THREE.Mesh[] | undefined;
    if (flaps) {
      const f = Math.sin(elapsed * 4.2) * 0.34;
      if (flaps[0]) flaps[0].rotation.z = f;
      if (flaps[1]) flaps[1].rotation.z = -f;
      if (flaps[2]) flaps[2].rotation.z = -f * 0.65;
      if (flaps[3]) flaps[3].rotation.z = f * 0.65;
    }
  }

  if (!activeJumpTrick) {
    // Normalize wrapped rotations cleanly after 360° flips so returning to swim/stand never unwinds backward
    if (Math.abs(rig.body.rotation.x) > Math.PI) {
      rig.body.rotation.x = THREE.MathUtils.euclideanModulo(rig.body.rotation.x + Math.PI, Math.PI * 2) - Math.PI;
    }
    if (Math.abs(rig.body.rotation.z) > Math.PI) {
      rig.body.rotation.z = THREE.MathUtils.euclideanModulo(rig.body.rotation.z + Math.PI, Math.PI * 2) - Math.PI;
    }
  }
  const bodyRotDamp = activeJumpTrick ? 28 : 14;
  rig.body.rotation.x = THREE.MathUtils.damp(rig.body.rotation.x, targetBodyRotX, bodyRotDamp, dt);
  rig.body.rotation.z = THREE.MathUtils.damp(rig.body.rotation.z, targetBodyRotZ, bodyRotDamp, dt);
  rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, targetLeftLegX, dampRate, dt);
  rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, targetRightLegX, dampRate, dt);
  rig.leftLeg.rotation.z = THREE.MathUtils.damp(rig.leftLeg.rotation.z, targetLeftLegZ, dampRate, dt);
  rig.rightLeg.rotation.z = THREE.MathUtils.damp(rig.rightLeg.rotation.z, targetRightLegZ, dampRate, dt);
  rig.body.position.y = THREE.MathUtils.damp(rig.body.position.y, targetBodyY, dampRate, dt);

  rig.upperBody.rotation.x = THREE.MathUtils.damp(rig.upperBody.rotation.x, targetUpperX, dampRate, dt);
  rig.upperBody.rotation.y = THREE.MathUtils.damp(rig.upperBody.rotation.y, targetUpperY, dampRate, dt);
  rig.upperBody.rotation.z = THREE.MathUtils.damp(rig.upperBody.rotation.z, targetUpperZ, dampRate, dt);
  rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, targetHeadX, dampRate, dt);
  rig.headGroup.rotation.y = THREE.MathUtils.damp(rig.headGroup.rotation.y, targetHeadY, dampRate, dt);
  rig.headGroup.rotation.z = THREE.MathUtils.damp(rig.headGroup.rotation.z, targetHeadZ, dampRate, dt);

  rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, targetRightArmX, 24, dt);
  rig.rightArm.rotation.y = THREE.MathUtils.damp(rig.rightArm.rotation.y, targetRightArmY, 24, dt);
  rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, targetRightArmZ, 24, dt);

  rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, targetLeftArmX, 24, dt);
  rig.leftArm.rotation.y = THREE.MathUtils.damp(rig.leftArm.rotation.y, targetLeftArmY, 24, dt);
  rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, targetLeftArmZ, 24, dt);

  rig.weaponGroup.position.y = THREE.MathUtils.damp(rig.weaponGroup.position.y, targetWeaponPosY, dampRate, dt);
  rig.weaponGroup.position.z = THREE.MathUtils.damp(rig.weaponGroup.position.z, targetWeaponPosZ, dampRate, dt);
  rig.weaponGroup.rotation.y = THREE.MathUtils.damp(rig.weaponGroup.rotation.y, targetWeaponRotY, dampRate, dt);
  rig.weaponGroup.rotation.z = THREE.MathUtils.damp(rig.weaponGroup.rotation.z, targetWeaponRotZ, dampRate, dt);
}

// 2. Flying 3D Owl Messenger for Opening Story
export function createOwlMessengerRig(palette: MaterialPalette): OwlMessengerRig {
  const root = new THREE.Group();
  const brown = palette.getMat(0x92400e, 'matte');
  const cream = palette.getMat(0xfef3c7, 'matte');
  const gold = palette.getMat(0xfacc15, 'emissive');
  const dark = palette.getMat(0x0f172a, 'gloss');

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.1, 0.85), brown);
  body.castShadow = true;
  const belly = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.72, 0.2), cream);
  belly.position.set(0, -0.05, 0.4);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 4), gold);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.16, 0.54);
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.08), dark);
  eyeL.position.set(-0.22, 0.28, 0.44);
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.08), dark);
  eyeR.position.set(0.22, 0.28, 0.44);
  const earL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.18), brown);
  earL.position.set(-0.34, 0.62, 0.1);
  const earR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.18), brown);
  earR.position.set(0.34, 0.62, 0.1);
  root.add(body, belly, beak, eyeL, eyeR, earL, earR);

  const leftWing = new THREE.Group();
  leftWing.position.set(-0.48, 0.18, 0);
  const lwMesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.14, 0.62), brown);
  lwMesh.position.set(-0.58, 0, 0);
  leftWing.add(lwMesh);

  const rightWing = new THREE.Group();
  rightWing.position.set(0.48, 0.18, 0);
  const rwMesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.14, 0.62), brown);
  rwMesh.position.set(0.58, 0, 0);
  rightWing.add(rwMesh);
  root.add(leftWing, rightWing);

  const envelope = new THREE.Group();
  envelope.position.set(0, -0.75, 0.18);
  const paper = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.12), cream);
  const seal = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.15), palette.getMat(0xef4444, 'emissive'));
  envelope.add(paper, seal);
  root.add(envelope);

  return { root, leftWing, rightWing, leftEye: eyeL, rightEye: eyeR, envelope };
}

// 3. Starter Weapon Pickup in Hutan Kata Grass
export function createStarterWeaponPickup(palette: MaterialPalette): THREE.Group {
  const group = new THREE.Group();
  const basePad = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.25, 2.1),
    palette.getMat(0x334155, 'matte'),
  );
  basePad.position.y = 0.125;

  const baseRing = new THREE.Mesh(
    new THREE.RingGeometry(1.05, 1.48, 24),
    palette.getMat(0xfacc15, 'emissive'),
  );
  baseRing.rotation.x = -Math.PI / 2;
  baseRing.position.y = 0.27;
  baseRing.userData.animRing = true;

  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.52, 13, 12, 1, true), beaconMat);
  beacon.position.y = 6.7;
  beacon.userData.animBeacon = true;

  const orb = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55, 0),
    palette.getMat(0x4fd8ff, 'emissive'),
  );
  orb.position.y = 1.08;
  orb.userData.animOrb = true;

  const gun = createWeaponMesh('ketapel', palette, 1.55);
  gun.position.set(0, 1.78, 0);
  gun.rotation.set(0.16, 0.6, 0.12);
  gun.userData.animOrb = true;

  const topDiamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.32, 0),
    palette.getMat(0xfacc15, 'emissive'),
  );
  topDiamond.position.y = 3.2;
  topDiamond.userData.animOrb = true;

  group.add(basePad, baseRing, beacon, orb, gun, topDiamond);
  return group;
}

// 3b. Swimsuit (Pakaian Renang) Pickup near Desa Sapaan
export function createSwimSuitPickup(palette: MaterialPalette): THREE.Group {
  const group = new THREE.Group();
  const basePad = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.25, 2.1),
    palette.getMat(0x0f172a, 'matte'),
  );
  basePad.position.y = 0.125;

  const baseRing = new THREE.Mesh(
    new THREE.RingGeometry(1.05, 1.48, 24),
    palette.getMat(0x22d3ee, 'emissive'),
  );
  baseRing.rotation.x = -Math.PI / 2;
  baseRing.position.y = 0.27;
  baseRing.userData.animRing = true;

  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.52, 13, 12, 1, true), beaconMat);
  beacon.position.y = 6.7;
  beacon.userData.animBeacon = true;

  const orb = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.5, 0),
    palette.getMat(0x38bdf8, 'emissive'),
  );
  orb.position.y = 1.02;
  orb.userData.animOrb = true;

  // Voxel Swimsuit Ensemble (Wetsuit torso + sleeves + goggles + snorkel + flippers)
  const suitGroup = new THREE.Group();
  suitGroup.position.set(0, 1.85, 0);
  suitGroup.userData.animOrb = true;

  const navyMat = palette.getMat(0x0f172a, 'matte');
  const tealMat = palette.getMat(0x14b8a6, 'emissive');
  const skyMat = palette.getMat(0x38bdf8, 'emissive');
  const goldMat = palette.getMat(0xfacc15, 'emissive');

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.84, 0.42), navyMat);
  const stripeL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.8, 0.46), tealMat);
  stripeL.position.x = -0.26;
  const stripeR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.8, 0.46), tealMat);
  stripeR.position.x = 0.26;
  const sleeveL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.55, 0.28), tealMat);
  sleeveL.position.set(-0.5, 0.14, 0);
  sleeveL.rotation.z = 0.24;
  const sleeveR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.55, 0.28), tealMat);
  sleeveR.position.set(0.5, 0.14, 0);
  sleeveR.rotation.z = -0.24;

  const goggles = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.22, 0.18), skyMat);
  goggles.position.set(0, 0.62, 0.12);
  const snorkel = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.52, 0.09), goldMat);
  snorkel.position.set(0.38, 0.72, 0.08);

  const finL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.44), tealMat);
  finL.position.set(-0.2, -0.58, 0.08);
  const finR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.44), tealMat);
  finR.position.set(0.2, -0.58, 0.08);

  suitGroup.add(chest, stripeL, stripeR, sleeveL, sleeveR, goggles, snorkel, finL, finR);

  const topDiamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.32, 0),
    palette.getMat(0x22d3ee, 'emissive'),
  );
  topDiamond.position.y = 3.2;
  topDiamond.userData.animOrb = true;

  group.add(basePad, baseRing, beacon, orb, suitGroup, topDiamond);
  return group;
}

export interface ZoneNpcRig {
  bodyPivot: THREE.Group;
  upperBody: THREE.Group;
  headGroup: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  tailPivot?: THREE.Group;
  propSpin?: THREE.Object3D;
  baseRightArmX: number;
  baseLeftArmX: number;
  baseRightArmZ?: number;
  baseLeftArmZ?: number;
  baseScaleXZ?: number;
  baseScaleY?: number;
  archetype?: NpcArchetypeId;
}



export interface ShooterAnimRig {
  bodyPivot: THREE.Group;
  upperBody: THREE.Group;
  headGroup: THREE.Group;
  visor: THREE.Mesh;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  weaponGroup: THREE.Group;
}

export interface CaptiveAnimRig {
  bodyPivot: THREE.Group;
  headGroup?: THREE.Group;
  leftEye?: THREE.Mesh;
  rightEye?: THREE.Mesh;
  leftArm?: THREE.Group;
  rightArm?: THREE.Group;
  tailPivot?: THREE.Group;
  halo?: THREE.Object3D;
}

// 4. All Distinct Zone, Story, and Academy Examiner 3D NPCs (20 Diverse World NPCs Sheet)
export function createZoneNpc(
  npcId: string,
  palette: MaterialPalette,
  variant?: NpcAppearanceVariant,
): THREE.Group {
  const archetype = resolveNpcArchetype(npcId);
  const rig = buildDiverseNpcRig(archetype, palette, false, variant);
  addShadow(rig.root, palette, rig.baseScaleXZ);

  const npcRig: ZoneNpcRig = {
    bodyPivot: rig.bodyPivot,
    upperBody: rig.upperBody,
    headGroup: rig.headGroup,
    leftEye: rig.leftEye,
    rightEye: rig.rightEye,
    leftArm: rig.leftArm,
    rightArm: rig.rightArm,
    leftLeg: rig.leftLeg,
    rightLeg: rig.rightLeg,
    propSpin: rig.propSpin,
    baseRightArmX: rig.baseRightArmX,
    baseLeftArmX: rig.baseLeftArmX,
    baseRightArmZ: rig.baseRightArmZ,
    baseLeftArmZ: rig.baseLeftArmZ,
    baseScaleXZ: rig.baseScaleXZ,
    baseScaleY: rig.baseScaleY,
    archetype: rig.archetype,
  };
  rig.root.userData.npcRig = npcRig;
  return rig.root;
}

export function animateZoneNpc(
  mesh: THREE.Object3D,
  elapsed: number,
  phase: number,
  isNearHero = false,
  dt = 0.016,
  poseMode: 'stand' | 'walk' | 'sleep' = 'stand',
): void {
  const rig = mesh.userData.npcRig as ZoneNpcRig | undefined;
  if (!rig) return;

  const baseXZ = rig.baseScaleXZ ?? 1;
  const baseY = rig.baseScaleY ?? 1;
  const restRightZ = rig.baseRightArmZ ?? 0;
  const restLeftZ = rig.baseLeftArmZ ?? 0;

  if (poseMode === 'sleep') {
    const sleepBreath = Math.sin(elapsed * 1.45 + phase);
    const sy = 1 + sleepBreath * 0.025;
    const sxz = 1 / Math.sqrt(sy);
    rig.bodyPivot.scale.set(baseXZ * sxz, baseY * sy, baseXZ * sxz);
    rig.bodyPivot.rotation.x = THREE.MathUtils.damp(rig.bodyPivot.rotation.x, -Math.PI / 2, 10, dt);
    rig.bodyPivot.position.y = THREE.MathUtils.damp(rig.bodyPivot.position.y, 0.92, 10, dt);
    rig.bodyPivot.position.z = THREE.MathUtils.damp(rig.bodyPivot.position.z, -0.78, 10, dt);

    rig.leftEye.scale.y = 0.08;
    rig.rightEye.scale.y = 0.08;

    rig.upperBody.rotation.z = THREE.MathUtils.damp(rig.upperBody.rotation.z, 0, 8, dt);
    rig.upperBody.rotation.x = THREE.MathUtils.damp(rig.upperBody.rotation.x, 0, 8, dt);
    rig.headGroup.rotation.y = THREE.MathUtils.damp(
      rig.headGroup.rotation.y,
      Math.sin(elapsed * 0.65 + phase) * 0.08,
      6,
      dt,
    );
    rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, 0.08, 6, dt);
    rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0.04, 10, dt);
    rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0.04, 10, dt);
    rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, 0.14, 10, dt);
    rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, restRightZ, 10, dt);
    rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, 0.14, 10, dt);
    rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, 0.08, 10, dt);
    if (rig.tailPivot) {
      rig.tailPivot.rotation.y = Math.sin(elapsed * 1.6 + phase) * 0.1;
    }
    return;
  }

  // Stand / Walk upright posture
  rig.bodyPivot.rotation.x = THREE.MathUtils.damp(rig.bodyPivot.rotation.x, 0, 14, dt);
  rig.bodyPivot.position.z = THREE.MathUtils.damp(rig.bodyPivot.position.z, 0, 14, dt);

  // Living breathing squash-and-stretch (volume preserving, feet stay flush at y=0!)
  const breath = Math.sin(elapsed * 2.4 + phase);
  const sy = 1 + breath * 0.036;
  const sxz = 1 / Math.sqrt(sy);
  rig.bodyPivot.scale.set(baseXZ * sxz, baseY * sy, baseXZ * sxz);

  const blinkY = computeBlinkScale(elapsed, phase + 0.8);
  rig.leftEye.scale.y = blinkY;
  rig.rightEye.scale.y = blinkY;

  if (poseMode === 'walk') {
    const stride = elapsed * 8.5 + phase;
    const swing = Math.sin(stride) * 0.56;
    const bounce = Math.abs(Math.sin(stride)) * 0.08;
    rig.bodyPivot.position.y = THREE.MathUtils.damp(rig.bodyPivot.position.y, bounce, 16, dt);
    rig.leftLeg.rotation.x = swing;
    rig.rightLeg.rotation.x = -swing;
    rig.upperBody.rotation.z = Math.sin(stride) * 0.04;
    rig.upperBody.rotation.x = THREE.MathUtils.damp(rig.upperBody.rotation.x, 0.08, 10, dt);
    rig.headGroup.rotation.y = THREE.MathUtils.damp(rig.headGroup.rotation.y, 0, 8, dt);
    rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, 0, 8, dt);
    const keepHeldArm =
      rig.archetype === 'pastry_chef' ||
      rig.archetype === 'ranger_guide' ||
      rig.archetype === 'crystal_scholar';
    const armAmp = keepHeldArm ? 0.1 : 0.45;
    rig.rightArm.rotation.x = THREE.MathUtils.damp(
      rig.rightArm.rotation.x,
      rig.baseRightArmX + swing * armAmp,
      12,
      dt,
    );
    rig.leftArm.rotation.x = THREE.MathUtils.damp(
      rig.leftArm.rotation.x,
      rig.baseLeftArmX - swing * armAmp,
      12,
      dt,
    );
    rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, restRightZ, 10, dt);
    rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, restLeftZ + 0.04, 10, dt);
  } else {
    const idle = computeIdleBehavior(elapsed, phase + 1.1);
    const sway = Math.sin(elapsed * 1.4 + phase) * 0.035;
    let targetUpperZ = sway * 0.5;
    let targetUpperX = isNearHero
      ? 0.08
      : Math.sin(elapsed * 2.4 + phase) * 0.03 - idle.deepBreath * 0.04;
    let targetHeadY = Math.sin(elapsed * 0.95 + phase * 1.7) * (isNearHero ? 0.14 : 0.24);
    let targetHeadX = isNearHero
      ? -0.06 + Math.sin(elapsed * 3.8 + phase) * 0.06
      : Math.sin(elapsed * 1.7 + phase) * 0.04 + idle.swallowNod;
    let targetHeadZ = 0;

    let targetRightX = isNearHero
      ? rig.baseRightArmX - 0.35 + Math.sin(elapsed * 5.2) * 0.18
      : rig.baseRightArmX + Math.sin(elapsed * 2.1 + phase) * 0.08;
    let targetLeftX = isNearHero
      ? rig.baseLeftArmX - 0.3 + Math.sin(elapsed * 5.2) * 0.14
      : rig.baseLeftArmX - Math.sin(elapsed * 2.1 + phase) * 0.06;
    let targetLeftZ = isNearHero ? restLeftZ + 0.18 : restLeftZ + 0.04;
    let targetRightZ = restRightZ;
    let targetLeftLegX = 0;
    let targetRightLegX = 0;

    // Distinct profession habits during standing duty
    if (!isNearHero) {
      if (rig.archetype === 'clockmaker') {
        const inspect = Math.max(0, Math.sin(elapsed * 1.15 + phase));
        targetRightX = rig.baseRightArmX - 0.32 * inspect;
        targetHeadX += 0.16 * inspect;
      } else if (rig.archetype === 'pastry_chef') {
        targetRightX = rig.baseRightArmX + Math.sin(elapsed * 1.8) * 0.04;
        targetLeftX = rig.baseLeftArmX + Math.sin(elapsed * 1.8) * 0.04;
      } else if (rig.archetype === 'ranger_guide') {
        const scan = Math.max(0, Math.sin(elapsed * 0.85 + phase));
        targetRightX = rig.baseRightArmX - 0.34 * scan;
        targetLeftX = rig.baseLeftArmX - 0.34 * scan;
        targetHeadY = Math.sin(elapsed * 1.4 + phase) * (0.28 + 0.2 * scan);
      } else if (rig.archetype === 'city_policeman') {
        const signal = Math.max(0, Math.sin(elapsed * 1.5 + phase));
        targetRightX = rig.baseRightArmX - 0.28 * signal;
        targetLeftX = rig.baseLeftArmX - 0.18 * Math.sin(elapsed * 2.2);
      } else if (rig.archetype === 'crystal_scholar' || rig.archetype === 'school_teacher') {
        targetHeadX += 0.12 + Math.sin(elapsed * 1.9 + phase) * 0.06;
        targetRightX = rig.baseRightArmX + Math.sin(elapsed * 1.6) * 0.05;
        targetLeftX = rig.baseLeftArmX + Math.sin(elapsed * 1.6) * 0.05;
      } else if (rig.archetype === 'village_elder' || rig.archetype === 'ielts_dean') {
        targetHeadX += Math.sin(elapsed * 1.5 + phase) * 0.06;
      }
    }

    if (!isNearHero && idle.env > 0.01) {
      const e = idle.env;
      targetLeftZ += idle.twitch * 0.5;
      if (idle.action === 'scan') {
        targetHeadY += Math.sin(idle.t * Math.PI * 2) * 0.42 * idle.side * e;
        targetUpperZ += Math.sin(idle.t * Math.PI * 2) * 0.03 * idle.side * e;
      } else if (idle.action === 'scratch') {
        const rub = Math.sin(idle.t * Math.PI * 7) * 0.14;
        if (Math.abs(rig.baseLeftArmX) < 0.35) {
          targetLeftX = THREE.MathUtils.lerp(targetLeftX, -1.95 + rub, e);
          targetLeftZ = THREE.MathUtils.lerp(targetLeftZ, -0.32, e);
        }
        targetHeadZ += -0.14 * e;
        targetHeadY += 0.15 * e;
      } else if (idle.action === 'yawn_stretch') {
        targetHeadX += -0.22 * e;
        targetUpperX += -0.07 * e;
      } else if (idle.action === 'posture_shift') {
        targetUpperZ += 0.065 * idle.side * e;
        targetHeadZ += -0.05 * idle.side * e;
        if (idle.side > 0) targetLeftLegX = 0.12 * e;
        else targetRightLegX = 0.12 * e;
      } else if (idle.action === 'leg_bounce') {
        const tap = Math.abs(Math.sin(idle.t * Math.PI * 6)) * 0.22;
        if (idle.side > 0) targetRightLegX = -tap * e;
        else targetLeftLegX = -tap * e;
      } else if (idle.action === 'chin_daydream') {
        targetHeadX += -0.18 * e;
        targetHeadZ += 0.09 * idle.side * e;
      }
    }

    rig.bodyPivot.position.y = THREE.MathUtils.damp(rig.bodyPivot.position.y, 0, 14, dt);
    rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, targetLeftLegX, 14, dt);
    rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, targetRightLegX, 14, dt);
    rig.upperBody.rotation.z = THREE.MathUtils.damp(rig.upperBody.rotation.z, targetUpperZ, 10, dt);
    rig.upperBody.rotation.x = THREE.MathUtils.damp(rig.upperBody.rotation.x, targetUpperX, 10, dt);
    rig.headGroup.rotation.y = THREE.MathUtils.damp(rig.headGroup.rotation.y, targetHeadY, 8, dt);
    rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, targetHeadX, 8, dt);
    rig.headGroup.rotation.z = THREE.MathUtils.damp(rig.headGroup.rotation.z, targetHeadZ, 8, dt);
    rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, targetRightX, 10, dt);
    rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, targetRightZ, 10, dt);
    rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, targetLeftX, 10, dt);
    rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, targetLeftZ, 10, dt);
  }

  if (rig.tailPivot) {
    rig.tailPivot.rotation.y = Math.sin(elapsed * 6.2 + phase) * 0.35;
  }
  if (rig.propSpin) {
    rig.propSpin.rotation.y += dt * 2.2;
  }
}

// 5. 20 Distinct 3D Dangerous Land Monsters (Small to Giant) with Living Articulated Rigs
export function createMonsterMesh(
  type: MonsterType,
  palette: MaterialPalette,
  scale?: number,
): THREE.Group {
  return buildMonsterRig(type, palette, scale);
}

export interface MonsterAnimInput {
  mode: 'idle' | 'patrol' | 'windup' | 'attack' | 'shoot' | 'hit' | 'ko' | 'celebrate';
  speed?: number;
  walkPhase?: number;
  elapsed: number;
  phase?: number;
  attackProgress?: number; // 0..1
  dt?: number;
}

export function animateMonsterRig(mesh: THREE.Object3D, input: MonsterAnimInput): void {
  const rig = mesh.userData.monsterRig as MonsterAnimRig | undefined;
  if (!rig) return;

  const { mode, speed = 0, walkPhase = 0, elapsed, phase = 0, attackProgress = 0, dt = 0.016 } = input;
  const damp = 16;

  const monsterIdle = mode === 'idle' && speed <= 0.25 ? computeIdleBehavior(elapsed, phase + 2.3) : null;

  // Volume-preserving living squash-and-stretch target!
  const breath = Math.sin(elapsed * 3.1 + phase);
  let targetScaleY = 1 + breath * 0.048 + (monsterIdle ? monsterIdle.deepBreath * 0.045 : 0);
  let targetBodyX = 0;
  let targetBodyZ = 0;
  let targetUpperX = breath * 0.04;
  let targetHeadY = Math.sin(elapsed * 1.4 + phase) * 0.16;
  let targetHeadX = monsterIdle ? monsterIdle.swallowNod : 0;
  let targetRightArmX = -0.28 + Math.sin(elapsed * 2.5 + phase) * 0.14;
  let targetLeftArmX = -0.22 - Math.sin(elapsed * 2.5 + phase) * 0.14;
  let targetRightArmZ = -0.1;
  let targetLeftArmZ = 0.1;

  const swing = speed > 0.25 ? Math.sin(walkPhase) * 0.56 : Math.sin(elapsed * 3.2 + phase) * 0.12;
  const strideBounce = speed > 0.25 ? Math.abs(Math.sin(walkPhase)) : 0;

  if (mode === 'idle' && monsterIdle && monsterIdle.env > 0.01) {
    const e = monsterIdle.env;
    targetLeftArmZ += monsterIdle.twitch * 0.8;
    if (monsterIdle.action === 'scan') {
      targetHeadY += Math.sin(monsterIdle.t * Math.PI * 2) * 0.44 * monsterIdle.side * e;
      targetBodyZ += Math.sin(monsterIdle.t * Math.PI * 2) * 0.04 * monsterIdle.side * e;
    } else if (monsterIdle.action === 'scratch') {
      const rub = Math.sin(monsterIdle.t * Math.PI * 7) * 0.16;
      targetLeftArmX = THREE.MathUtils.lerp(targetLeftArmX, -1.85 + rub, e);
      targetLeftArmZ = THREE.MathUtils.lerp(targetLeftArmZ, -0.34, e);
    } else if (monsterIdle.action === 'yawn_stretch') {
      targetHeadX += -0.25 * e;
      targetUpperX += -0.12 * e;
      targetRightArmX = THREE.MathUtils.lerp(targetRightArmX, -1.15, e);
      targetLeftArmX = THREE.MathUtils.lerp(targetLeftArmX, -1.15, e);
      targetRightArmZ = THREE.MathUtils.lerp(targetRightArmZ, -0.35, e);
      targetLeftArmZ = THREE.MathUtils.lerp(targetLeftArmZ, 0.35, e);
    } else if (monsterIdle.action === 'posture_shift') {
      targetBodyZ += 0.065 * monsterIdle.side * e;
    } else if (monsterIdle.action === 'chin_daydream') {
      targetHeadX += -0.18 * e;
      targetHeadY += 0.24 * monsterIdle.side * e;
    }
  } else if (mode === 'patrol') {
    targetScaleY = 1 + breath * 0.045 + strideBounce * 0.065;
    targetBodyZ = Math.sin(walkPhase * 0.5) * 0.05;
    if (rig.weaponGroup) {
      targetRightArmX = -0.68 + swing * 0.18;
      targetLeftArmX = -0.58 - swing * 0.14;
    } else {
      targetRightArmX = -0.3 + swing * 0.62;
      targetLeftArmX = -0.3 - swing * 0.62;
    }
  } else if (mode === 'windup') {
    // Deep crouch squash before pounce / fire!
    targetScaleY = 0.8 + Math.sin(elapsed * 28) * 0.035;
    targetUpperX = -0.24;
    targetRightArmX = rig.weaponGroup ? -1.45 : -1.95;
    targetLeftArmX = rig.weaponGroup ? -1.35 : -1.75;
    targetRightArmZ = -0.22;
    targetLeftArmZ = 0.42;
  } else if (mode === 'attack' || mode === 'shoot') {
    // Explosive stretch forward + weapon aim / slash recoil!
    const punch = Math.sin(Math.min(1, attackProgress) * Math.PI);
    targetScaleY = 1.15 - punch * 0.08;
    targetBodyX = mode === 'attack' ? 0.22 * punch : -0.1 * punch;
    targetUpperX = mode === 'shoot' ? -0.14 * punch : 0.26 * punch;
    if (rig.weaponGroup) {
      targetRightArmX = -1.56 - punch * 0.34;
      targetRightArmZ = -0.22;
      targetLeftArmX = -1.42 - punch * 0.2;
      targetLeftArmZ = 0.48;
    } else {
      targetRightArmX = -1.75 * punch;
      targetLeftArmX = -1.65 * punch;
    }
  } else if (mode === 'hit') {
    targetScaleY = 0.82;
    targetBodyX = -0.22;
    targetRightArmX = 0.45;
    targetLeftArmX = 0.45;
  } else if (mode === 'ko') {
    targetScaleY = 0.72;
    targetRightArmX = 0.25;
    targetLeftArmX = 0.25;
  } else if (mode === 'celebrate') {
    targetScaleY = 1 + Math.abs(Math.sin(elapsed * 8.5)) * 0.12;
    targetRightArmX = -2.25 + Math.sin(elapsed * 10) * 0.3;
    targetLeftArmX = -2.15 - Math.sin(elapsed * 10) * 0.3;
  }

  const curSy = THREE.MathUtils.damp(rig.bodyPivot.scale.y, targetScaleY, damp, dt);
  const safeSy = Math.max(0.55, curSy);
  const sXZ = 1 / Math.sqrt(safeSy);
  rig.bodyPivot.scale.set(sXZ, safeSy, sXZ);
  rig.bodyPivot.rotation.x = THREE.MathUtils.damp(rig.bodyPivot.rotation.x, targetBodyX, damp, dt);
  rig.bodyPivot.rotation.z = THREE.MathUtils.damp(rig.bodyPivot.rotation.z, targetBodyZ, damp, dt);

  if (rig.upperBody) {
    rig.upperBody.rotation.x = THREE.MathUtils.damp(rig.upperBody.rotation.x, targetUpperX, damp, dt);
  }
  if (rig.headGroup) {
    rig.headGroup.rotation.y = THREE.MathUtils.damp(rig.headGroup.rotation.y, targetHeadY, 10, dt);
    rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, targetHeadX, 10, dt);
  }
  if (rig.extraHeads) {
    rig.extraHeads.forEach((eh, idx) => {
      const sign = idx === 0 ? 1 : -1;
      const sway = Math.sin(elapsed * 2.4 + phase + idx * 1.9) * 0.22;
      eh.rotation.y = sign * 0.26 + sway;
      eh.rotation.x = targetHeadX + Math.cos(elapsed * 1.9 + idx * 2.3) * 0.1;
    });
  }
  if (rig.tailPivot) {
    rig.tailPivot.rotation.y = Math.sin(elapsed * (speed > 0.25 ? 7.5 : 3.2) + phase) * 0.26;
    rig.tailPivot.rotation.x = mode === 'attack' || mode === 'shoot' ? 0.35 : 0;
  }
  if (rig.rightArm) {
    rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, targetRightArmX, 22, dt);
    rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, targetRightArmZ, 18, dt);
  }
  if (rig.leftArm) {
    rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, targetLeftArmX, 22, dt);
    rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, targetLeftArmZ, 18, dt);
  }
  if (rig.legs) {
    const legCount = rig.legs.length;
    rig.legs.forEach((leg, idx) => {
      let sign = idx % 2 === 0 ? 1 : -1;
      if (legCount === 4) {
        // Quadruped diagonal gait: [FL, FR, BL, BR]
        sign = idx === 0 || idx === 3 ? 1 : -1;
      } else if (legCount >= 6) {
        // Insect / arachnid tripod wave gait
        sign = ((Math.floor(idx / 2) + (idx % 2)) % 2 === 0) ? 1 : -1;
      }
      let targetLegX = mode === 'ko' ? 0 : swing * sign;
      if (mode === 'idle' && monsterIdle?.action === 'leg_bounce' && monsterIdle.env > 0.01 && idx === 0) {
        targetLegX = -Math.abs(Math.sin(monsterIdle.t * Math.PI * 6)) * 0.22 * monsterIdle.env;
      }
      leg.rotation.x = THREE.MathUtils.damp(leg.rotation.x, targetLegX, 18, dt);
    });
  }
  if (rig.leftWing && rig.rightWing) {
    const isRay = rig.type === 'spiny_mega_stingray' || rig.type === 'giant_phantom';
    const isHornet = rig.type === 'blight_hornet';
    const isHeavyFlyer =
      rig.type === 'obsidian_hydra' ||
      rig.type === 'giga_wyvern' ||
      rig.type === 'ice_shard_griffin' ||
      rig.type === 'toxic_chimera';
    const flapSpeed = isHornet ? 34 : isRay ? 4.8 : isHeavyFlyer ? 10.5 : 15.5;
    const flapAmp = isHornet ? 0.38 : isRay ? 0.28 : isHeavyFlyer ? 0.46 : 0.62;
    const flap = Math.sin(elapsed * flapSpeed + phase) * flapAmp;
    rig.leftWing.rotation.z = flap;
    rig.rightWing.rotation.z = -flap;
  }
  if (rig.type === 'guardian_sentinel' && rig.upperBody) {
    rig.upperBody.position.y = 1.18 + Math.sin(elapsed * 3.4 + phase) * 0.14;
  }
  if (rig.jawPivot) {
    const snapCycle =
      mode === 'attack' || mode === 'shoot'
        ? 0.06 + Math.sin(Math.min(1, attackProgress) * Math.PI) * 0.56
        : mode === 'windup'
        ? 0.48 + Math.sin(elapsed * 18) * 0.08
        : 0.16 + Math.sin(elapsed * 3.2 + phase) * 0.11;
    rig.jawPivot.rotation.x = THREE.MathUtils.damp(rig.jawPivot.rotation.x, snapCycle, 16, dt);
  }
  if (rig.tentacles) {
    const tSpd = mode === 'attack' || mode === 'shoot' ? 6.4 : 3.2;
    rig.tentacles.forEach((tent, idx) => {
      const wave = Math.sin(elapsed * tSpd + phase + idx * 0.85);
      tent.rotation.x = wave * (rig.type === 'venomous_box_jelly' ? 0.22 : 0.28);
      tent.rotation.z = Math.cos(elapsed * (tSpd * 0.82) + idx * 1.1) * 0.18;
    });
  }
  if (rig.segments) {
    const sSpd = speed > 0.25 ? 7.2 : 3.6;
    rig.segments.forEach((seg, idx) => {
      const sWave = Math.sin(elapsed * sSpd + phase - idx * 0.65);
      seg.rotation.y = sWave * 0.26;
      seg.position.y += Math.sin(elapsed * 2.4 + idx) * 0.0015;
    });
  }
  if (rig.vortexRing) {
    rig.vortexRing.rotation.y += dt * (mode === 'windup' || mode === 'attack' ? 3.8 : 1.75);
  }
  if (rig.type === 'shadow_angler' && rig.weaponGroup) {
    rig.weaponGroup.rotation.x = Math.sin(elapsed * 3.4 + phase) * 0.16;
    rig.weaponGroup.rotation.z = Math.cos(elapsed * 2.3 + phase) * 0.14;
  }
  if (rig.extraSpin && rig.extraSpin !== rig.vortexRing) {
    rig.extraSpin.rotation.y += dt * 2.4;
  }
  if (rig.eyes) {
    const blinkY = mode === 'ko' ? 0.14 : computeBlinkScale(elapsed, phase + 1.4);
    for (let i = 0; i < rig.eyes.length; i++) {
      rig.eyes[i].scale.y = blinkY;
    }
  }
}

// 3D Armed Raider Shooter Enemy (Articulated Limbs, Roblox-Style Blaster & Aim/Recoil Stance)
export function createShooterMesh(palette: MaterialPalette): THREE.Group {
  const root = new THREE.Group();
  addShadow(root, palette, 0.95);

  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const darkArmor = palette.getMat(0x1e293b, 'metal');
  const slateArmor = palette.getMat(0x334155, 'metal');
  const redTrim = palette.getMat(0x991b1b, 'metal');
  const redGlow = palette.getMat(0xf43f5e, 'emissive');

  const makeLeg = (lx: number): THREE.Group => {
    const leg = new THREE.Group();
    leg.position.set(lx, 0.86, 0);
    const shin = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.56, 0.36), slateArmor);
    shin.position.y = -0.28;
    shin.castShadow = true;
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.46), darkArmor);
    boot.position.set(0, -0.7, 0.04);
    boot.castShadow = true;
    leg.add(shin, boot);
    return leg;
  };
  const leftLeg = makeLeg(-0.23);
  const rightLeg = makeLeg(0.23);
  bodyPivot.add(leftLeg, rightLeg);

  const upperBody = new THREE.Group();
  upperBody.position.set(0, 0.88, 0);
  bodyPivot.add(upperBody);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.98, 0.62), darkArmor);
  torso.position.y = 0.5;
  torso.castShadow = true;
  const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.54, 0.14), redTrim);
  chestPlate.position.set(0, 0.58, 0.3);
  const coreGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), redGlow);
  coreGem.position.set(0, 0.58, 0.4);
  upperBody.add(torso, chestPlate, coreGem);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.02, 0);
  upperBody.add(headGroup);

  const helm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.74, 0.8), slateArmor);
  helm.position.y = 0.38;
  helm.castShadow = true;
  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.68), redTrim);
  crest.position.y = 0.8;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 0.1), redGlow);
  visor.position.set(0, 0.4, 0.42);
  headGroup.add(helm, crest, visor);

  const weaponGroup = new THREE.Group();
  const makeShooterArm = (ax: number, withBlaster: boolean): THREE.Group => {
    const arm = new THREE.Group();
    arm.position.set(ax, 0.86, 0);
    const pauldron = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.38), redTrim);
    pauldron.position.y = -0.14;
    pauldron.castShadow = true;
    const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.5, 0.3), slateArmor);
    forearm.position.y = -0.46;
    forearm.castShadow = true;
    const glove = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.28), darkArmor);
    glove.position.y = -0.74;
    arm.add(pauldron, forearm, glove);
    if (withBlaster) {
      weaponGroup.position.set(0, -0.74, 0.08);
      weaponGroup.rotation.x = Math.PI / 2;
      weaponGroup.add(createEnemyBlasterMesh(palette, 'raider', 0.98));
      arm.add(weaponGroup);
    }
    return arm;
  };
  const leftArm = makeShooterArm(-0.62, false);
  const rightArm = makeShooterArm(0.62, true);
  upperBody.add(leftArm, rightArm);

  const shooterRig: ShooterAnimRig = {
    bodyPivot,
    upperBody,
    headGroup,
    visor,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    weaponGroup,
  };
  root.userData.shooterRig = shooterRig;
  return root;
}

export interface ShooterAnimInput {
  speed: number;
  walkPhase: number;
  aimAlpha: number; // 0 = patrol ready, 1 = full aiming telegraph
  recoil: number; // 0..1 barrel kickback impulse
  hitSquash: number; // 0..1 hit impact squash
  elapsed: number;
  phase: number;
  dt: number;
}

export function animateShooterRig(mesh: THREE.Object3D, input: ShooterAnimInput): void {
  const rig = mesh.userData.shooterRig as ShooterAnimRig | undefined;
  if (!rig) return;

  const { speed, walkPhase, aimAlpha, recoil, hitSquash, elapsed, phase, dt } = input;
  const moving = speed > 0.25;
  const swing = moving ? Math.sin(walkPhase) * 0.58 : 0;
  const breath = Math.sin(elapsed * 2.8 + phase);
  const shooterIdle = !moving && aimAlpha < 0.08 ? computeIdleBehavior(elapsed, phase + 3.1) : null;

  // Volume-preserving living breathing + windup/hit squash-and-stretch!
  const stepBounce = moving ? Math.abs(Math.sin(walkPhase)) * 0.05 : 0;
  const targetSy =
    1 +
    breath * 0.04 +
    (shooterIdle ? shooterIdle.deepBreath * 0.036 : 0) +
    stepBounce -
    aimAlpha * 0.07 +
    recoil * 0.09 -
    hitSquash * 0.16;
  const curSy = THREE.MathUtils.damp(rig.bodyPivot.scale.y, targetSy, 18, dt);
  const safeSy = Math.max(0.65, curSy);
  const sXZ = 1 / Math.sqrt(safeSy);
  rig.bodyPivot.scale.set(sXZ, safeSy, sXZ);

  // Legs stride (with occasional bored leg bounce when idle)
  const idleTap =
    shooterIdle && shooterIdle.action === 'leg_bounce' && shooterIdle.env > 0.01
      ? -Math.abs(Math.sin(shooterIdle.t * Math.PI * 6)) * 0.2 * shooterIdle.env
      : 0;
  rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, swing + idleTap, 18, dt);
  rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, -swing, 18, dt);

  // Torso twists into two-handed rifle aim stance + kicks back on recoil!
  const scanYaw =
    shooterIdle && shooterIdle.action === 'scan' && shooterIdle.env > 0.01
      ? Math.sin(shooterIdle.t * Math.PI * 2) * 0.34 * shooterIdle.side * shooterIdle.env
      : 0;
  const targetUpperY = THREE.MathUtils.lerp(-0.18, -0.38, aimAlpha) + scanYaw * 0.3;
  const targetUpperX =
    THREE.MathUtils.lerp(0.03, 0.08 - recoil * 0.16, aimAlpha) - hitSquash * 0.2;
  rig.upperBody.rotation.y = THREE.MathUtils.damp(rig.upperBody.rotation.y, targetUpperY, 16, dt);
  rig.upperBody.rotation.x = THREE.MathUtils.damp(rig.upperBody.rotation.x, targetUpperX, 18, dt);

  // Head counter-rotates to lock eyes on target or scans surroundings when idle!
  rig.headGroup.rotation.y = THREE.MathUtils.damp(
    rig.headGroup.rotation.y,
    -targetUpperY * 0.92 + scanYaw,
    14,
    dt,
  );
  rig.headGroup.rotation.x = THREE.MathUtils.damp(
    rig.headGroup.rotation.x,
    aimAlpha * 0.06 - recoil * 0.1 + (shooterIdle ? shooterIdle.swallowNod : 0),
    16,
    dt,
  );

  // Right arm (trigger + blaster) & Left arm (foregrip support)
  const targetRightArmX = THREE.MathUtils.lerp(-0.78 + swing * 0.14, -1.52 - recoil * 0.34, aimAlpha);
  const targetRightArmZ = THREE.MathUtils.lerp(-0.18, -0.24, aimAlpha);
  const targetRightArmY = THREE.MathUtils.lerp(0.14, 0.2, aimAlpha);

  const targetLeftArmX = THREE.MathUtils.lerp(-0.9 - swing * 0.1, -1.44 - recoil * 0.22, aimAlpha);
  const targetLeftArmZ = THREE.MathUtils.lerp(0.44, 0.56, aimAlpha);
  const targetLeftArmY = -0.14;

  rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, targetRightArmX, 24, dt);
  rig.rightArm.rotation.y = THREE.MathUtils.damp(rig.rightArm.rotation.y, targetRightArmY, 20, dt);
  rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, targetRightArmZ, 20, dt);

  rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, targetLeftArmX, 24, dt);
  rig.leftArm.rotation.y = THREE.MathUtils.damp(rig.leftArm.rotation.y, targetLeftArmY, 20, dt);
  rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, targetLeftArmZ, 20, dt);

  rig.weaponGroup.rotation.y = THREE.MathUtils.damp(
    rig.weaponGroup.rotation.y,
    THREE.MathUtils.lerp(0.22, 0.3, aimAlpha),
    20,
    dt,
  );
  rig.weaponGroup.position.z = THREE.MathUtils.damp(
    rig.weaponGroup.position.z,
    0.08 - recoil * 0.07,
    24,
    dt,
  );
  rig.visor.scale.y = computeBlinkScale(elapsed, phase + 2.1);
}

// 6. Swirling Stone Portal to Istana IELTS ("Portal Kerajaan")
export function createPortalArch(palette: MaterialPalette): PortalArchRig {
  const root = new THREE.Group();
  const stone = palette.getPixelMat('cobble', 0x94a3b8);
  const darkStone = palette.getPixelMat('cobble', 0x475569);

  const base = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.75, 4.4), darkStone);
  base.position.y = 0.375;
  base.receiveShadow = true;
  root.add(base);

  const step = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.38, 5.2), stone);
  step.position.y = 0.19;
  step.receiveShadow = true;
  root.add(step);

  const pillarL = new THREE.Mesh(new THREE.BoxGeometry(2.0, 7.2, 2.2), stone);
  pillarL.position.set(-3.9, 3.8, 0);
  pillarL.castShadow = true;
  const pillarR = new THREE.Mesh(new THREE.BoxGeometry(2.0, 7.2, 2.2), stone);
  pillarR.position.set(3.9, 3.8, 0);
  pillarR.castShadow = true;
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(10.6, 1.8, 2.5), darkStone);
  lintel.position.set(0, 7.8, 0);
  lintel.castShadow = true;
  root.add(pillarL, pillarR, lintel);

  const torchL = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), palette.getMat(0xf59e0b, 'emissive'));
  torchL.position.set(-4.2, 1.8, 1.5);
  const torchR = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), palette.getMat(0xf59e0b, 'emissive'));
  torchR.position.set(4.2, 1.8, 1.5);
  root.add(torchL, torchR);

  const ringOuter = new THREE.Mesh(
    new THREE.TorusGeometry(2.75, 0.25, 10, 28),
    palette.getMat(0xa855f7, 'emissive'),
  );
  ringOuter.position.set(0, 4.1, 0);

  const ringInner = new THREE.Mesh(
    new THREE.TorusGeometry(1.9, 0.2, 8, 24),
    palette.getMat(0x22d3ee, 'emissive'),
  );
  ringInner.position.set(0, 4.1, 0.08);

  const coreDisc = new THREE.Mesh(
    new THREE.CircleGeometry(2.65, 24),
    new THREE.MeshBasicMaterial({
      color: 0x7e22ce,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
    }),
  );
  coreDisc.position.set(0, 4.1, -0.05);
  root.add(ringOuter, ringInner, coreDisc);

  return { root, ringOuter, ringInner, coreDisc };
}

// 7. 6 Atmospheric Area Mists across Islands (lift dramatically when Zone Boss is beaten!)
export function createAreaMists(): Map<ZoneId, THREE.Mesh> {
  const mists = new Map<ZoneId, THREE.Mesh>();
  const zones = Object.keys(ZONE_INFO) as ZoneId[];
  for (const zId of zones) {
    const info = ZONE_INFO[zId];
    const gy = getArchipelagoGroundY(info.x, info.z);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(info.badgeColor),
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(12.5, 14.5, 4.4, 24, 1, true), mat);
    ring.position.set(info.x, gy + 2.2, info.z);
    mists.set(zId, ring);
  }
  return mists;
}

// 8. Minecraft-Styled RPG Desa Sapaan Cottages on Archipelago Island
export function createZoneLandmarks(palette: MaterialPalette): THREE.Group {
  const group = new THREE.Group();

  // Desa Sapaan 12m x 10m Village Houses placed cleanly on stepped terraces
  const c1 = createMinecraftHouse(palette, {
    x: -13.5,
    z: 84.0,
    rotY: 0.35,
    width: 12.0,
    depth: 10.0,
    wallHeight: 5.2,
    roofTint: 0xd97706,
    flowerBox: true,
  });
  c1.position.y = getArchipelagoGroundY(-13.5, 84.0);

  const c2 = createMinecraftHouse(palette, {
    x: -20.0,
    z: 118.0,
    rotY: 1.15,
    width: 12.0,
    depth: 10.0,
    wallHeight: 5.2,
    roofTint: 0xea580c,
    flowerBox: true,
  });
  c2.position.y = getArchipelagoGroundY(-20.0, 118.0);

  group.add(c1, c2);
  return group;
}

export function getZoneForPosition(x: number, z: number): ZoneId {
  return getArchipelagoZoneForPosition(x, z);
}

function createDoorSignSprite(
  def: DoorDef,
  disposables: Array<{ dispose: () => void }>,
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Dark carved RPG wooden plaque
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.beginPath();
  ctx.roundRect(10, 10, 492, 108, 22);
  ctx.fill();

  ctx.lineWidth = 6;
  ctx.strokeStyle = def.index === 4 ? '#f43f5e' : '#f59e0b';
  ctx.beginPath();
  ctx.roundRect(10, 10, 492, 108, 22);
  ctx.stroke();

  // Inner subtle highlight border
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(253, 230, 138, 0.45)';
  ctx.beginPath();
  ctx.roundRect(18, 18, 476, 92, 16);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#fef3c7';
  ctx.fillText(`${def.index + 1}. ${def.name}`, 256, 48);

  ctx.font = 'bold 21px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(def.modeLabel, 256, 88);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
  });
  disposables.push(tex, mat);

  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4.1, 1.02, 1);
  // Ignore raycasts on text billboard so clicks/camera pass cleanly to solid meshes
  sprite.raycast = () => {};
  return sprite;
}

// 9. Distinct 3D Mission Landmarks inside Zone Dungeons (Pool, Tunnel, Echo Shrine, Bridge, Boss Gate)
export function createDungeonDoorRig(
  def: DoorDef,
  palette: MaterialPalette,
  disposables: Array<{ dispose: () => void }> = [],
): DungeonDoorRig {
  const group = new THREE.Group();
  group.position.set(def.x, 0, def.z);
  group.userData.doorIndex = def.index;
  // Face inward toward arena center
  group.rotation.y = Math.atan2(-def.x, -def.z);

  const frameMat = palette.createSurfaceMat({
    color: 0xf59e0b,
    roughness: 0.45,
    metalness: 0.25,
  });
  const orbMat = palette.createSurfaceMat({
    color: 0xfacc15,
    emissive: 0xfacc15,
    emissiveIntensity: 1.2,
    roughness: 0.2,
  });
  disposables.push(frameMat, orbMat);

  const stoneDark = palette.getMat(0x334155, 'matte');
  const stoneMid = palette.getMat(0x475569, 'matte');
  const stoneLight = palette.getMat(0x64748b, 'matte');
  const woodDark = palette.getMat(0x78350f, 'matte');
  const woodWarm = palette.getMat(0xb45309, 'matte');

  let orbBaseY = 3.6;

  if (def.mode === 'cards') {
    // Landmark 1: Luminous Memory Pool / Sacred Well (Kolam Ingatan / Sumur Tua / Genangan)
    const outerRim = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.55, 0.48, 8), stoneMid);
    outerRim.position.y = 0.24;
    outerRim.castShadow = true;
    outerRim.receiveShadow = true;

    const stoneCurb = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.24, 6, 8), frameMat);
    stoneCurb.rotation.x = Math.PI / 2;
    stoneCurb.rotation.z = Math.PI / 8;
    stoneCurb.position.y = 0.52;

    const waterMat = palette.createSurfaceMat({
      color: 0x0284c7,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.72,
      roughness: 0.15,
      metalness: 0.15,
    });
    disposables.push(waterMat);
    const waterPool = new THREE.Mesh(new THREE.CylinderGeometry(1.88, 1.88, 0.14, 16), waterMat);
    waterPool.position.y = 0.46;

    // Floating rune lilypads/memory tiles inside the pool
    const runeMat = palette.getMat(0xa7f3d0, 'emissive');
    [
      [-0.7, 0.56, 0.4],
      [0.65, 0.56, -0.5],
      [0.15, 0.56, 0.75],
    ].forEach(([rx, ry, rz]) => {
      const tile = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.45), runeMat);
      tile.position.set(rx, ry, rz);
      tile.rotation.y = rx;
      group.add(tile);
    });

    // Four carved corner lantern posts supporting a well roof canopy
    const postOffsets: Array<[number, number]> = [
      [-1.55, -1.55],
      [1.55, -1.55],
      [-1.55, 1.55],
      [1.55, 1.55],
    ];
    postOffsets.forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.25, 0.28), woodDark);
      post.position.set(px, 1.45, pz);
      post.castShadow = true;
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.4), frameMat);
      cap.position.set(px, 2.55, pz);
      group.add(post, cap);
    });

    const canopyFrame = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.22, 3.4), woodWarm);
    canopyFrame.position.y = 2.68;
    const canopyPeak = new THREE.Mesh(new THREE.ConeGeometry(2.15, 0.85, 4), frameMat);
    canopyPeak.position.y = 3.18;
    canopyPeak.rotation.y = Math.PI / 4;

    group.add(outerRim, stoneCurb, waterPool, canopyFrame, canopyPeak);
    orbBaseY = 4.15;
  } else if (def.mode === 'duel') {
    // Landmark 2: Vaulted Lightning Duel Corridor / Tunnel (Lorong Kilat / Jalur / Jalan)
    const floorRunner = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.18, 3.8), stoneDark);
    floorRunner.position.y = 0.09;
    floorRunner.receiveShadow = true;

    const duelCarpet = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.06, 3.6),
      palette.getMat(0xbe123c, 'matte'),
    );
    duelCarpet.position.y = 0.2;

    // 3 sequential archways forming a genuine 3D walk-in corridor!
    [-1.25, 0, 1.25].forEach((az) => {
      const archL = new THREE.Mesh(new THREE.BoxGeometry(0.46, 3.0, 0.5), stoneMid);
      archL.position.set(-1.32, 1.5, az);
      archL.castShadow = true;
      const archR = new THREE.Mesh(new THREE.BoxGeometry(0.46, 3.0, 0.5), stoneMid);
      archR.position.set(1.32, 1.5, az);
      archR.castShadow = true;
      const archTop = new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.55, 0.56), frameMat);
      archTop.position.set(0, 3.15, az);
      group.add(archL, archR, archTop);
    });

    // Corridor side beams connecting the 3 arches along top edges
    const sideBeamL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.35, 3.3), woodWarm);
    sideBeamL.position.set(-1.32, 2.85, 0);
    const sideBeamR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.35, 3.3), woodWarm);
    sideBeamR.position.set(1.32, 2.85, 0);

    // Twin crackling lightning/duel crystals flanking the corridor mouth
    [-1.78, 1.78].forEach((cx, i) => {
      const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.55, 5), orbMat);
      crystal.position.set(cx, 1.1, 1.45);
      crystal.rotation.z = i === 0 ? 0.22 : -0.22;
      group.add(crystal);
    });

    group.add(floorRunner, duelCarpet, sideBeamL, sideBeamR);
    orbBaseY = 4.1;
  } else if (def.mode === 'listen') {
    // Landmark 3: Acoustic Echo Shrine & Golden Resonance Bell (Lorong Gema / Ruang Lonceng)
    const stage = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.28, 12), stoneDark);
    stage.position.y = 0.14;
    stage.receiveShadow = true;

    // Semicircular acoustic echo shell wall behind the bell
    const shellOffsets: Array<[number, number, number]> = [
      [-1.45, -0.55, 0.45],
      [-0.78, -1.22, 0.22],
      [0, -1.42, 0],
      [0.78, -1.22, -0.22],
      [1.45, -0.55, -0.45],
    ];
    shellOffsets.forEach(([sx, sz, rot]) => {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.65, 3.3, 0.45), stoneMid);
      rib.position.set(sx, 1.65, sz);
      rib.rotation.y = rot;
      rib.castShadow = true;
      group.add(rib);
    });

    // Timber & gold bell-hanging frame
    const bellBeam = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.38, 0.55), frameMat);
    bellBeam.position.set(0, 3.35, -0.3);
    const bellBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.68, 0.95, 12),
      palette.getMat(0xfbbf24, 'metal'),
    );
    bellBody.position.set(0, 2.55, -0.2);
    const clapper = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), orbMat);
    clapper.position.set(0, 2.0, -0.2);

    // Concentric glowing sound-wave echo rings in front of the bell
    const waveMat = palette.getMat(0x22d3ee, 'emissive');
    const waveInner = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.08, 8, 24), waveMat);
    waveInner.position.set(0, 2.15, 0.45);
    const waveOuter = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.08, 8, 28), waveMat);
    waveOuter.position.set(0, 2.15, 0.72);

    group.add(stage, bellBeam, bellBody, clapper, waveInner, waveOuter);
    orbBaseY = 4.25;
  } else if (def.mode === 'type') {
    // Landmark 4: Arched Timber-and-Stone Bridge over Underground Stream (Jembatan Huruf / Parit)
    const streamMat = palette.createSurfaceMat({
      color: 0x0369a1,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.75,
      roughness: 0.18,
    });
    disposables.push(streamMat);

    // Shimmering underground stream bed beneath the bridge
    const streamBed = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.1, 2.3), streamMat);
    streamBed.position.set(0, 0.05, 0);

    // Mossy stone riverbanks flanking the water
    const bankN = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.28, 0.45), stoneLight);
    bankN.position.set(0, 0.14, -1.32);
    const bankS = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.28, 0.45), stoneLight);
    bankS.position.set(0, 0.14, 1.32);

    // 3-step arched wooden deck spanning across the stream (walk-up ramp -> crest -> down ramp)
    const rampFront = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.24, 1.05), woodWarm);
    rampFront.position.set(0, 0.35, 1.05);
    rampFront.rotation.x = 0.24;
    const bridgeCrest = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.26, 1.35), woodWarm);
    bridgeCrest.position.set(0, 0.64, 0);
    bridgeCrest.castShadow = true;
    const rampBack = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.24, 1.05), woodWarm);
    rampBack.position.set(0, 0.35, -1.05);
    rampBack.rotation.x = -0.24;

    // Glowing letter-rune tiles inlaid on the bridge crest
    [-0.65, 0, 0.65].forEach((rx) => {
      const rune = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.42), orbMat);
      rune.position.set(rx, 0.8, 0);
      group.add(rune);
    });

    // Bridge handrail posts & side railings
    [-1.15, 1.15].forEach((px) => {
      [-1.15, 0, 1.15].forEach((pz) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.45, 0.22), frameMat);
        post.position.set(px, pz === 0 ? 1.3 : 1.0, pz);
        group.add(post);
      });
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 2.75), woodDark);
      rail.position.set(px, 1.72, 0);
      group.add(rail);
    });

    // Small arch span above center of bridge
    const spanTop = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.32, 0.38), frameMat);
    spanTop.position.set(0, 2.45, 0);

    group.add(streamBed, bankN, bankS, rampFront, bridgeCrest, rampBack, spanTop);
    orbBaseY = 3.45;
  } else {
    // Landmark 5 (Boss Gate): Grand Ancient Double Seal Portal (Pintu Teka-Teki -> Bos)
    const dais = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.34, 2.5), stoneDark);
    dais.position.y = 0.17;
    dais.receiveShadow = true;

    const pL = new THREE.Mesh(new THREE.BoxGeometry(0.85, 4.1, 0.85), stoneMid);
    pL.position.set(-1.6, 2.15, 0);
    pL.castShadow = true;
    const pR = new THREE.Mesh(new THREE.BoxGeometry(0.85, 4.1, 0.85), stoneMid);
    pR.position.set(1.6, 2.15, 0);
    pR.castShadow = true;

    const trimL = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.4, 0.95), frameMat);
    trimL.position.set(-1.6, 4.25, 0);
    const trimR = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.4, 0.95), frameMat);
    trimR.position.set(1.6, 4.25, 0);

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.72, 1.05), frameMat);
    lintel.position.set(0, 4.45, 0);

    // Double paneled doors with central boss seal ring
    const doorLeft = new THREE.Mesh(new THREE.BoxGeometry(1.12, 3.6, 0.24), woodDark);
    doorLeft.position.set(-0.58, 2.1, 0);
    const doorRight = new THREE.Mesh(new THREE.BoxGeometry(1.12, 3.6, 0.24), woodDark);
    doorRight.position.set(0.58, 2.1, 0);

    const lockRing = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.12, 8, 20), orbMat);
    lockRing.position.set(0, 2.15, 0.18);

    // Twin flaming corner braziers at door steps
    [-2.05, 2.05].forEach((bx) => {
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.22, 0.55, 8), stoneMid);
      bowl.position.set(bx, 0.55, 0.9);
      const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), orbMat);
      flame.position.set(bx, 1.0, 0.9);
      group.add(bowl, flame);
    });

    group.add(dais, pL, pR, trimL, trimR, lintel, doorLeft, doorRight, lockRing);
    orbBaseY = 5.4;
  }

  const orbMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), orbMat);
  orbMesh.position.set(0, orbBaseY, 0);
  orbMesh.userData.baseY = orbBaseY;

  const signSprite = createDoorSignSprite(def, disposables);
  signSprite.position.set(0, orbBaseY + 1.05, 0);

  group.add(orbMesh, signSprite);
  return { index: def.index, def, group, orbMesh, frameMat, orbMat };
}

export function updateDoorRigVisual(
  rig: DungeonDoorRig,
  status: 'locked' | 'open' | 'cleared',
): void {
  if (status === 'cleared') {
    rig.frameMat.color.setHex(0x10b981);
    rig.orbMat.color.setHex(0x34d399);
    rig.orbMat.emissive.setHex(0x10b981);
  } else if (status === 'locked') {
    rig.frameMat.color.setHex(0x64748b);
    rig.orbMat.color.setHex(0xef4444);
    rig.orbMat.emissive.setHex(0xdc2626);
  } else {
    rig.frameMat.color.setHex(0xf59e0b);
    rig.orbMat.color.setHex(0xfacc15);
    rig.orbMat.emissive.setHex(0xf59e0b);
  }
}

function createPixelVoxelTexture(
  baseHex: string,
  darkHex: string,
  lightHex: string,
  speckHex?: string,
  pattern: 'stone' | 'moss' | 'ore' | 'obsidian' | 'shield' = 'stone',
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 16, 16);

  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const h = (x * 37 + y * 91 + x * y * 13) % 19;
      if (h < 4) {
        ctx.fillStyle = darkHex;
        ctx.fillRect(x, y, 1, 1);
      } else if (h > 14) {
        ctx.fillStyle = lightHex;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  if (pattern === 'moss') {
    ctx.fillStyle = speckHex || '#22c55e';
    for (let x = 0; x < 16; x++) {
      const drop = 2 + ((x * 5) % 4);
      ctx.fillRect(x, 0, 1, drop);
    }
  } else if (pattern === 'ore' && speckHex) {
    ctx.fillStyle = speckHex;
    const spots = [
      [3, 3, 2, 2],
      [10, 4, 3, 2],
      [5, 10, 3, 2],
      [11, 11, 2, 3],
      [2, 12, 2, 2],
    ];
    spots.forEach(([sx, sy, sw, sh]) => ctx.fillRect(sx, sy, sw, sh));
  } else if (pattern === 'obsidian' && speckHex) {
    ctx.fillStyle = speckHex;
    ctx.fillRect(2, 2, 12, 1);
    ctx.fillRect(2, 13, 12, 1);
    ctx.fillRect(2, 2, 1, 12);
    ctx.fillRect(13, 2, 1, 12);
    ctx.fillRect(6, 5, 4, 2);
    ctx.fillRect(5, 9, 6, 2);
  } else if (pattern === 'shield' && speckHex) {
    // Timber & iron barricade frame with central shield cross
    ctx.fillStyle = darkHex;
    ctx.fillRect(0, 0, 16, 2);
    ctx.fillRect(0, 14, 16, 2);
    ctx.fillRect(0, 0, 2, 16);
    ctx.fillRect(14, 0, 2, 16);
    ctx.fillStyle = speckHex;
    ctx.fillRect(7, 4, 2, 8);
    ctx.fillRect(4, 7, 8, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

export function createCaveTorchMesh(palette: MaterialPalette): THREE.Group {
  const g = new THREE.Group();
  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.95, 0.18),
    palette.getMat(0x78350f, 'matte'),
  );
  handle.position.y = 0.475;
  handle.castShadow = true;

  const collar = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.14, 0.24),
    palette.getMat(0x334155, 'metal'),
  );
  collar.position.y = 0.88;

  const ember = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.18, 0.22),
    palette.getMat(0xf97316, 'emissive'),
  );
  ember.position.y = 1.04;

  const flame = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.26, 0.18),
    palette.getMat(0xfef08a, 'emissive'),
  );
  flame.position.y = 1.24;
  flame.userData.isFlame = true;

  g.add(handle, collar, ember, flame);
  return g;
}

export function createCaveTntMesh(palette: MaterialPalette): THREE.Group {
  const g = new THREE.Group();
  const redMat = palette.getMat(0xdc2626, 'matte');
  const bandMat = palette.getMat(0xf8fafc, 'matte');
  const topCap = palette.getMat(0x991b1b, 'matte');
  const core = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.35, 1.35), redMat);
  core.position.y = 0.68;
  core.castShadow = true;
  const band = new THREE.Mesh(new THREE.BoxGeometry(1.39, 0.42, 1.39), bandMat);
  band.position.y = 0.68;
  const fuse = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.22), topCap);
  fuse.position.y = 1.44;
  const spark = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.18, 0),
    palette.getMat(0xfacc15, 'emissive'),
  );
  spark.position.y = 1.66;
  spark.userData.isTntSpark = true;
  g.add(core, band, fuse, spark);
  return g;
}

function createCrackOverlayTextures(): THREE.CanvasTexture[] {
  const segments: Array<Array<[number, number, number, number]>> = [
    [
      [7, 7, 2, 2],
      [6, 5, 1, 2],
      [9, 8, 2, 1],
    ],
    [
      [5, 3, 1, 3],
      [10, 9, 2, 2],
      [3, 8, 3, 1],
    ],
    [
      [2, 2, 3, 2],
      [11, 2, 2, 4],
      [12, 11, 2, 3],
      [3, 12, 3, 2],
    ],
    [
      [1, 5, 4, 2],
      [8, 1, 2, 5],
      [8, 10, 2, 5],
      [1, 13, 5, 2],
      [11, 7, 4, 2],
    ],
  ];

  const textures: THREE.CanvasTexture[] = [];
  for (let stage = 0; stage < 4; stage++) {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 16, 16);
    for (let s = 0; s <= stage; s++) {
      ctx.fillStyle = s >= 2 ? 'rgba(9, 13, 22, 0.9)' : 'rgba(15, 23, 42, 0.72)';
      for (const [rx, ry, rw, rh] of segments[s]) {
        ctx.fillRect(rx, ry, rw, rh);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    textures.push(tex);
  }
  return textures;
}

export function createCaptiveMesh(
  kind: 'girl' | 'mother' | 'fox_kit' | 'student' | 'spirit',
  colorHex: number,
  palette: MaterialPalette,
): THREE.Group {
  const root = new THREE.Group();
  addShadow(root, palette, 0.72);
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const skin = palette.getMat(0xfed7aa, 'matte');
  const outfit = palette.getMat(colorHex, 'matte');
  const darkEye = palette.getMat(0x0f172a, 'matte');
  const rig: CaptiveAnimRig = { bodyPivot };

  if (kind === 'fox_kit') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.72, 0.85), outfit);
    body.position.y = 0.56;
    body.castShadow = true;
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.15, 0.16);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.6, 0.68), outfit);
    const earL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.14), outfit);
    earL.position.set(-0.2, 0.42, -0.04);
    const earR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.14), outfit);
    earR.position.set(0.2, 0.42, -0.04);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.06), darkEye);
    eyeL.position.set(-0.15, 0.04, 0.36);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.06), darkEye);
    eyeR.position.set(0.15, 0.04, 0.36);
    headGroup.add(head, earL, earR, eyeL, eyeR);

    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.58, -0.38);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.62), palette.getMat(0xf8fafc, 'matte'));
    tail.position.set(0, 0.06, -0.26);
    tailPivot.add(tail);

    bodyPivot.add(body, headGroup, tailPivot);
    rig.headGroup = headGroup;
    rig.leftEye = eyeL;
    rig.rightEye = eyeR;
    rig.tailPivot = tailPivot;
    root.userData.captiveRig = rig;
    return root;
  }

  if (kind === 'spirit') {
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), palette.getMat(colorHex, 'emissive'));
    core.position.y = 1.45;
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.08, 6, 18), palette.getMat(0xfef08a, 'emissive'));
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 1.45;
    const baseOrb = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.95, 6), palette.getMat(0x7c3aed, 'gloss'));
    baseOrb.position.y = 0.65;
    bodyPivot.add(baseOrb, core, halo);
    rig.halo = halo;
    root.userData.captiveRig = rig;
    return root;
  }

  const heightScale = kind === 'girl' ? 0.86 : 0.98;
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.88, 0.46), outfit);
  torso.position.y = 0.88;
  torso.castShadow = true;

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.38, 0);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.64, 0.64), skin);
  head.position.y = 0.32;
  head.castShadow = true;
  const hair = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.24, 0.68),
    palette.getMat(kind === 'mother' ? 0x57534e : 0x3b2008, 'matte'),
  );
  hair.position.y = 0.62;
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.06), darkEye);
  eyeL.position.set(-0.15, 0.32, 0.33);
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.06), darkEye);
  eyeR.position.set(0.15, 0.32, 0.33);
  headGroup.add(head, hair, eyeL, eyeR);
  if (kind === 'girl') {
    const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.14), palette.getMat(0xe11d48, 'matte'));
    ribbon.position.set(0.24, 0.72, 0.12);
    headGroup.add(ribbon);
  }

  const makeCaptiveArm = (ax: number): THREE.Group => {
    const arm = new THREE.Group();
    arm.position.set(ax, 1.24, 0);
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.34, 0.26), outfit);
    sleeve.position.y = -0.14;
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.22), skin);
    hand.position.y = -0.44;
    arm.add(sleeve, hand);
    return arm;
  };
  const leftArm = makeCaptiveArm(-0.48);
  const rightArm = makeCaptiveArm(0.48);

  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.45, 0.26), palette.getMat(0x1e293b, 'matte'));
  legL.position.set(-0.18, 0.24, 0);
  const legR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.45, 0.26), palette.getMat(0x1e293b, 'matte'));
  legR.position.set(0.18, 0.24, 0);

  bodyPivot.add(legL, legR, torso, headGroup, leftArm, rightArm);
  rig.headGroup = headGroup;
  rig.leftEye = eyeL;
  rig.rightEye = eyeR;
  rig.leftArm = leftArm;
  rig.rightArm = rightArm;
  root.userData.captiveRig = rig;
  root.scale.setScalar(heightScale);
  return root;
}

export function animateCaptiveMesh(mesh: THREE.Object3D, elapsed: number, happy = false): void {
  const rig = mesh.userData.captiveRig as CaptiveAnimRig | undefined;
  if (!rig) return;
  const breath = Math.sin(elapsed * (happy ? 5.8 : 2.8));
  const sy = 1 + breath * (happy ? 0.08 : 0.045);
  const sXZ = 1 / Math.sqrt(sy);
  rig.bodyPivot.scale.set(sXZ, sy, sXZ);
  if (rig.headGroup) {
    rig.headGroup.rotation.y = Math.sin(elapsed * 2.2) * 0.2;
  }
  if (rig.leftEye && rig.rightEye) {
    const blinkY = computeBlinkScale(elapsed, 3.3);
    rig.leftEye.scale.y = blinkY;
    rig.rightEye.scale.y = blinkY;
  }
  if (rig.leftArm && rig.rightArm) {
    if (happy) {
      rig.leftArm.rotation.x = -2.1 + Math.sin(elapsed * 10) * 0.35;
      rig.rightArm.rotation.x = -2.1 - Math.sin(elapsed * 10) * 0.35;
    } else {
      rig.leftArm.rotation.x = -0.35 + Math.sin(elapsed * 4.5) * 0.2;
      rig.rightArm.rotation.x = -0.35 - Math.sin(elapsed * 4.5) * 0.2;
    }
  }
  if (rig.tailPivot) {
    rig.tailPivot.rotation.y = Math.sin(elapsed * 7) * 0.38;
  }
  if (rig.halo) {
    rig.halo.rotation.z = elapsed * 2.4;
  }
}

export function createPrisonKeyMesh(palette: MaterialPalette): THREE.Group {
  const root = new THREE.Group();
  const goldMat = palette.getMat(0xfacc15, 'metal');
  const glowMat = palette.getMat(0xfef08a, 'emissive');

  const beaconRing = new THREE.Mesh(
    new THREE.RingGeometry(1.15, 1.55, 24),
    new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    }),
  );
  beaconRing.rotation.x = -Math.PI / 2;
  beaconRing.position.y = 0.06;

  const keyPivot = new THREE.Group();
  keyPivot.position.y = 1.45;
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.1, 8, 16), goldMat);
  bow.position.x = -0.38;
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.14), goldMat);
  shaft.position.x = 0.2;
  const tooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 0.14), goldMat);
  tooth1.position.set(0.48, -0.14, 0);
  const tooth2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.14), goldMat);
  tooth2.position.set(0.28, -0.11, 0);
  const coreGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), glowMat);
  coreGem.position.set(-0.38, 0, 0);
  keyPivot.add(bow, shaft, tooth1, tooth2, coreGem);
  keyPivot.userData.animKind = 'bob';
  keyPivot.userData.baseY = 1.45;
  keyPivot.userData.phase = 0.2;

  root.add(beaconRing, keyPivot);
  root.userData.keyPivot = keyPivot;
  return root;
}

// 10. Minecraft-Style 3D Voxel Cave Arena (with Roof, Stalactites, Mineable Blocks & 5 Mission Doors!)
export function createDungeonEnvironment(
  zoneId: ZoneId,
  palette: MaterialPalette,
): DungeonArenaRig {
  const group = new THREE.Group();
  const animatables: THREE.Object3D[] = [];
  const caveBlocks: CaveBlockDef[] = [];
  const caveColliders: CaveStaticCollider[] = [];
  const cameraOccluders: THREE.Object3D[] = [];
  const disposables: Array<{ dispose: () => void }> = [];
  const exitPadPos = new THREE.Vector3(0, 0, 17);

  const zoneStoneColors: Record<ZoneId, [string, string, string]> = {
    desa_sapaan: ['#6b7280', '#4b5563', '#9ca3af'],
    pasar_rasa: ['#9a3412', '#7c2d12', '#c2410c'],
    hutan_satwa: ['#3f6212', '#365314', '#65a30d'],
    gerbang_kota: ['#475569', '#334155', '#64748b'],
    menara_waktu: ['#312e81', '#1e1b4b', '#4338ca'],
    gua_portal: ['#3f3cbb', '#1e1b4b', '#6366f1'],
  };
  const [stBase, stDark, stLight] = zoneStoneColors[zoneId];

  const stoneTex = createPixelVoxelTexture(stBase, stDark, stLight, undefined, 'stone');
  const floorTex = createPixelVoxelTexture(stDark, '#0f172a', stBase, undefined, 'stone');
  floorTex.wrapS = THREE.RepeatWrapping;
  floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(18, 18);

  const mossTex = createPixelVoxelTexture('#78350f', '#451a03', '#92400e', '#22c55e', 'moss');
  const diamondOreTex = createPixelVoxelTexture('#475569', '#1e293b', '#64748b', '#22d3ee', 'ore');
  const heartOreTex = createPixelVoxelTexture('#475569', '#1e293b', '#64748b', '#fb7185', 'ore');
  const wordSealTex = createPixelVoxelTexture('#1e1b4b', '#090d16', '#312e81', '#c084fc', 'obsidian');
  const shieldBlockTex = createPixelVoxelTexture('#b45309', '#78350f', '#d97706', '#38bdf8', 'shield');
  disposables.push(
    stoneTex,
    floorTex,
    mossTex,
    diamondOreTex,
    heartOreTex,
    wordSealTex,
    shieldBlockTex,
  );

  const wallMat = palette.createSurfaceMat({ map: stoneTex, roughness: 0.9, metalness: 0.05 });
  const floorMat = palette.createSurfaceMat({ map: floorTex, roughness: 0.92, metalness: 0.04 });
  const roofMat = palette.createSurfaceMat({ map: floorTex, roughness: 0.95, metalness: 0.02 });
  const stoneBlockMat = palette.createSurfaceMat({ map: stoneTex, roughness: 0.85, metalness: 0.08 });
  const mossBlockMat = palette.createSurfaceMat({ map: mossTex, roughness: 0.9, metalness: 0.02 });
  const diamondOreMat = palette.createSurfaceMat({
    map: diamondOreTex,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.25,
    roughness: 0.55,
    metalness: 0.35,
  });
  const heartOreMat = palette.createSurfaceMat({
    map: heartOreTex,
    emissive: 0xf43f5e,
    emissiveIntensity: 0.25,
    roughness: 0.55,
    metalness: 0.25,
  });
  const wordSealMat = palette.createSurfaceMat({
    map: wordSealTex,
    emissive: 0xa855f7,
    emissiveIntensity: 0.45,
    roughness: 0.35,
    metalness: 0.4,
  });
  const shieldBlockMat = palette.createSurfaceMat({
    map: shieldBlockTex,
    emissive: 0x0284c7,
    emissiveIntensity: 0.14,
    roughness: 0.7,
    metalness: 0.2,
  });
  disposables.push(
    wallMat,
    floorMat,
    roofMat,
    stoneBlockMat,
    mossBlockMat,
    diamondOreMat,
    heartOreMat,
    wordSealMat,
    shieldBlockMat,
  );

  // Cave Floor Slab (2m voxel-tiled surface)
  const arenaFloor = new THREE.Mesh(new THREE.BoxGeometry(44, 0.5, 44), floorMat);
  arenaFloor.position.y = -0.25;
  arenaFloor.receiveShadow = true;
  group.add(arenaFloor);

  // Voxel Cave Ceiling Slab (closed cavern ceiling at y = 9.8!)
  const ceilingSlab = new THREE.Mesh(new THREE.BoxGeometry(45, 0.8, 45), roofMat);
  ceilingSlab.position.y = 10.0;
  ceilingSlab.userData.isMapHidden = true;
  group.add(ceilingSlab);
  cameraOccluders.push(ceilingSlab);

  const ringHex =
    zoneId === 'gua_portal'
      ? 0xa855f7
      : zoneId === 'menara_waktu'
      ? 0xfacc15
      : zoneId === 'hutan_satwa'
      ? 0x34d399
      : zoneId === 'pasar_rasa'
      ? 0xf97316
      : zoneId === 'gerbang_kota'
      ? 0x38bdf8
      : 0xfbbf24;

  const centerRune = new THREE.Mesh(
    new THREE.RingGeometry(4.0, 4.7, 28),
    palette.getMat(ringHex, 'emissive'),
  );
  centerRune.rotation.x = -Math.PI / 2;
  centerRune.position.y = 0.03;
  group.add(centerRune);

  // Tall Voxel Cave Perimeter Walls (height = 10)
  const wallHeight = 10;
  const addWall = (x: number, z: number, w: number, h: number, d: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    m.position.set(x, h / 2, z);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    cameraOccluders.push(m);
  };
  addWall(0, -21.5, 45, wallHeight, 2);
  addWall(-21.5, 0, 2, wallHeight, 45);
  addWall(21.5, 0, 2, wallHeight, 45);
  addWall(-13.5, 21.5, 17, wallHeight, 2);
  addWall(13.5, 21.5, 17, wallHeight, 2);
  addWall(0, 21.5, 10, 4.5, 2); // South archway lintel above exit portal
  group.children[group.children.length - 1].position.y = 7.75;

  // Hanging Voxel Stalactites & Glowing Ceiling Crystals
  const stalactiteCoords: Array<[number, number, number, boolean]> = [
    [-16, -15, 2.4, true],
    [-6, -14, 2.1, false],
    [6, -14, 2.3, true],
    [16, -15, 2.5, false],
    [-12, -3, 2.2, false],
    [0, -7, 1.9, true],
    [12, -3, 2.2, false],
    [-16, 4, 2.4, true],
    [16, 4, 2.3, true],
    [-8, 10, 2.0, false],
    [8, 10, 2.0, false],
    [-16, 15, 2.2, true],
    [16, 15, 2.2, false],
  ];
  const crystalMat = palette.getMat(ringHex, 'emissive');
  stalactiteCoords.forEach(([sx, sz, len, glow]) => {
    const topBlk = new THREE.Mesh(new THREE.BoxGeometry(1.6, len * 0.55, 1.6), wallMat);
    topBlk.position.set(sx, 9.6 - len * 0.275, sz);
    topBlk.userData.isMapHidden = true;
    const tipBlk = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, len * 0.55, 0.85),
      glow ? crystalMat : wallMat,
    );
    tipBlk.position.set(sx, 9.6 - len * 0.8, sz);
    tipBlk.userData.isMapHidden = true;
    group.add(topBlk, tipBlk);
  });

  // Natural Voxel Cave Pillars (static colliders that form tunnels & alcoves)
  const pillarCoords: Array<[number, number]> = [
    [-10, 10],
    [-10, 2],
    [10, 10],
    [10, 2],
    [-4, -4],
    [4, -4],
    [-11, -14],
    [11, -14],
  ];
  pillarCoords.forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(2, 9.8, 2), wallMat);
    pillar.position.set(px, 4.9, pz);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    group.add(pillar);
    cameraOccluders.push(pillar);
    caveColliders.push({ x: px, z: pz, halfW: 1.0 });
  });

  const caveStory = ZONE_CAVE_STORIES[zoneId];
  const prisonX = caveStory.prisonCorner === 'nw' ? -17.4 : 17.4;
  const prisonZ = -17.4;

  // Mineable Minecraft-style Voxel Blocks (2x2.2x2) guarding shortcuts, ores & hidden prison!
  const blockLayout: Array<[number, number, CaveBlockKind]> = [
    // Left Wing Barricade & Secret Alcove
    [-10, 8, 'moss_dirt'],
    [-10, 6, 'stone'],
    [-10, 4, 'moss_dirt'],
    [-18, 1, 'diamond_ore'],
    [-18, -1, 'stone'],
    [-16, 13, 'moss_dirt'],
    [-18, 13, 'heart_ore'],
    // Right Wing Barricade & Secret Alcove
    [10, 8, 'moss_dirt'],
    [10, 6, 'stone'],
    [10, 4, 'moss_dirt'],
    [18, 1, 'heart_ore'],
    [18, -1, 'stone'],
    [16, 13, 'moss_dirt'],
    [18, 13, 'diamond_ore'],
    // Central North Cavern Ridge (Word Seal shortcut!)
    [-2, -4, 'stone'],
    [0, -4, 'word_seal'],
    [2, -4, 'stone'],
    // Hidden Prison Alcove Concealed Wall + Opposite Corner Ores
    ...(caveStory.prisonCorner === 'nw'
      ? ([
          [-14.6, -17.2, 'stone'],
          [-17.2, -14.6, 'moss_dirt'],
          [18, -16, 'diamond_ore'],
          [16, -18, 'moss_dirt'],
        ] as Array<[number, number, CaveBlockKind]>)
      : ([
          [-18, -16, 'diamond_ore'],
          [-16, -18, 'moss_dirt'],
          [14.6, -17.2, 'stone'],
          [17.2, -14.6, 'moss_dirt'],
        ] as Array<[number, number, CaveBlockKind]>)),
    [-9, -16, 'word_seal'],
    [9, -16, 'word_seal'],
    [-18, -12, 'heart_ore'],
    [18, -12, 'stone'],
    // Mid-side pockets
    [-4, 5, 'moss_dirt'],
    [4, 5, 'moss_dirt'],
  ];

  const blockMeta: Record<CaveBlockKind, { label: string; hp: number; mat: THREE.Material }> = {
    stone: { label: 'Batu Gua', hp: 2, mat: stoneBlockMat },
    moss_dirt: { label: 'Tanah Berlumut', hp: 1, mat: mossBlockMat },
    diamond_ore: { label: 'Bijih Berlian', hp: 3, mat: diamondOreMat },
    heart_ore: { label: 'Kristal Hati', hp: 2, mat: heartOreMat },
    word_seal: { label: 'Obsidian Segel Kata', hp: 5, mat: wordSealMat },
    player_shield: { label: 'Blok Pelindung', hp: 4, mat: shieldBlockMat },
  };

  const blockGeo = new THREE.BoxGeometry(2.0, 2.2, 2.0);
  disposables.push(blockGeo);

  const crackTextures = createCrackOverlayTextures();
  const crackMaterials = crackTextures.map((tex) => {
    disposables.push(tex);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    disposables.push(mat);
    return mat;
  });
  const crackGeo = new THREE.BoxGeometry(2.04, 2.24, 2.04);
  disposables.push(crackGeo);

  // Elevated Voxel Cliff Terraces (for 3D Jump & Stair-Building Verticality!)
  const platforms: CaveCliffPlatform[] = [
    { id: 'cliff_sw', x: -17, z: 14, halfW: 2.2, halfD: 2.2, topY: 1.65 },
    { id: 'step_sw', x: -13.6, z: 14, halfW: 1.2, halfD: 1.2, topY: 0.85 },
    { id: 'cliff_se', x: 17, z: 14, halfW: 2.2, halfD: 2.2, topY: 1.65 },
    { id: 'step_se', x: 13.6, z: 14, halfW: 1.2, halfD: 1.2, topY: 0.85 },
  ];
  platforms.forEach((p) => {
    const platMesh = new THREE.Mesh(
      new THREE.BoxGeometry(p.halfW * 2, p.topY, p.halfD * 2),
      wallMat,
    );
    platMesh.position.set(p.x, p.topY / 2, p.z);
    platMesh.castShadow = true;
    platMesh.receiveShadow = true;
    group.add(platMesh);
  });

  // Molten Lava Chasm Trenches (jump across or bridge using Blok Pelindung!)
  const chasms: CaveLavaChasm[] = [];
  const chasmCoords: Array<[string, number, number]> = [
    ['chasm_nw', -15.5, -10.5],
    ['chasm_ne', 15.5, -10.5],
  ];
  const chasmRimGeoX = new THREE.BoxGeometry(5.3, 0.22, 0.25);
  const chasmRimGeoZ = new THREE.BoxGeometry(0.25, 0.22, 3.3);
  const chasmLavaGeo = new THREE.BoxGeometry(4.8, 0.08, 2.8);
  disposables.push(chasmRimGeoX, chasmRimGeoZ, chasmLavaGeo);

  chasmCoords.forEach(([cid, cx, cz]) => {
    const cGroup = new THREE.Group();
    cGroup.position.set(cx, 0, cz);
    const rimN = new THREE.Mesh(chasmRimGeoX, wallMat);
    rimN.position.set(0, 0.1, -1.52);
    const rimS = new THREE.Mesh(chasmRimGeoX, wallMat);
    rimS.position.set(0, 0.1, 1.52);
    const rimW = new THREE.Mesh(chasmRimGeoZ, wallMat);
    rimW.position.set(-2.52, 0.1, 0);
    const rimE = new THREE.Mesh(chasmRimGeoZ, wallMat);
    rimE.position.set(2.52, 0.1, 0);
    const lavaMat = palette.createSurfaceMat({
      color: 0xea580c,
      emissive: 0xf97316,
      emissiveIntensity: 1.35,
      roughness: 0.3,
      metalness: 0.1,
    });
    disposables.push(lavaMat);
    const lavaBed = new THREE.Mesh(chasmLavaGeo, lavaMat);
    lavaBed.position.y = 0.02;
    cGroup.add(rimN, rimS, rimW, rimE, lavaBed);
    group.add(cGroup);
    chasms.push({ id: cid, x: cx, z: cz, halfW: 2.35, halfD: 1.35, lavaMat });
  });

  // Composite Voxel Crafting Bench & Furnace Station near Cave Entrance!
  const craftingTablePos = new THREE.Vector3(-4.5, 0, 11.5);
  const craftStation = new THREE.Group();
  craftStation.position.copy(craftingTablePos);
  craftStation.userData.craftingTable = true;
  const tableBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.1, 1.4),
    palette.getMat(0x78350f, 'matte'),
  );
  tableBase.position.set(-0.4, 0.55, 0);
  tableBase.castShadow = true;
  const tableTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.62, 0.22, 1.52),
    palette.getMat(0xd97706, 'matte'),
  );
  tableTop.position.set(-0.4, 1.18, 0);
  const furnaceBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.25, 1.2),
    palette.getMat(0x475569, 'matte'),
  );
  furnaceBody.position.set(0.85, 0.625, 0);
  furnaceBody.castShadow = true;
  const furnaceMouth = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.45, 0.14),
    palette.getMat(0xf97316, 'emissive'),
  );
  furnaceMouth.position.set(0.85, 0.45, 0.62);
  const craftOrb = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.32, 0),
    palette.getMat(0x38bdf8, 'emissive'),
  );
  craftOrb.position.set(0.2, 2.05, 0);
  craftOrb.userData.animKind = 'bob';
  craftOrb.userData.baseY = 2.05;
  craftOrb.userData.phase = 1.1;
  animatables.push(craftOrb);
  craftStation.add(tableBase, tableTop, furnaceBody, furnaceMouth, craftOrb);
  group.add(craftStation);
  cameraOccluders.push(tableBase, furnaceBody);
  caveColliders.push({ x: craftingTablePos.x, z: craftingTablePos.z, halfW: 1.2 });

  blockLayout.forEach(([bx, bz, kind], idx) => {
    const info = blockMeta[kind];
    const id = `cb_${zoneId}_${idx}`;
    let basePlatformY = 0;
    for (const p of platforms) {
      if (Math.abs(bx - p.x) <= p.halfW && Math.abs(bz - p.z) <= p.halfD) {
        basePlatformY = Math.max(basePlatformY, p.topY);
      }
    }
    const blockY = basePlatformY + 1.1;
    const mesh = new THREE.Mesh(blockGeo, info.mat);
    mesh.position.set(bx, blockY, bz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.caveBlockId = id;
    group.add(mesh);

    caveBlocks.push({
      id,
      kind,
      label: info.label,
      x: bx,
      y: blockY,
      z: bz,
      halfW: 1.0,
      hp: info.hp,
      maxHp: info.hp,
      mesh,
      alive: true,
      hasAmbush: false,
    });
  });

  // Randomly hide Mine Ambush Guardians inside 2 mineable cave blocks per run!
  const ambushCandidates = caveBlocks.filter(
    (b) => b.kind === 'stone' || b.kind === 'moss_dirt' || b.kind === 'diamond_ore',
  );
  for (let i = ambushCandidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = ambushCandidates[i];
    ambushCandidates[i] = ambushCandidates[j];
    ambushCandidates[j] = tmp;
  }
  ambushCandidates.slice(0, 2).forEach((b) => {
    b.hasAmbush = true;
  });

  // Alternating Minecraft-style Voxel Environmental Floor Traps (Lava & Retractable Spikes!)
  const traps: CaveTrapRig[] = [];
  const trapLayout: Array<[number, number, 'lava' | 'spikes', number]> = [
    [-6, 8, 'lava', 0],
    [6, 8, 'spikes', Math.PI],
    [-14, 1, 'spikes', Math.PI],
    [14, 1, 'lava', 0],
    [-5, -12, 'lava', 0],
    [5, -12, 'spikes', Math.PI],
  ];
  const trapFrameMat = palette.getMat(0x1e293b, 'matte');
  const trapSpikeMat = palette.getMat(0xe11d48, 'metal');
  const trapFrameXGeo = new THREE.BoxGeometry(2.3, 0.14, 0.2);
  const trapFrameZGeo = new THREE.BoxGeometry(0.2, 0.14, 2.3);
  const trapCoreGeo = new THREE.BoxGeometry(1.9, 0.08, 1.9);
  const spikeConeGeo = new THREE.ConeGeometry(0.22, 0.72, 4);
  disposables.push(trapFrameXGeo, trapFrameZGeo, trapCoreGeo, spikeConeGeo);

  trapLayout.forEach(([tx, tz, kind, phaseOffset], idx) => {
    const tGroup = new THREE.Group();
    tGroup.position.set(tx, 0.02, tz);

    const frameN = new THREE.Mesh(trapFrameXGeo, trapFrameMat);
    frameN.position.set(0, 0.05, -1.05);
    const frameS = new THREE.Mesh(trapFrameXGeo, trapFrameMat);
    frameS.position.set(0, 0.05, 1.05);
    const frameW = new THREE.Mesh(trapFrameZGeo, trapFrameMat);
    frameW.position.set(-1.05, 0.05, 0);
    const frameE = new THREE.Mesh(trapFrameZGeo, trapFrameMat);
    frameE.position.set(1.05, 0.05, 0);
    tGroup.add(frameN, frameS, frameW, frameE);

    const coreMat = palette.createSurfaceMat({
      color: kind === 'lava' ? 0x7c2d12 : 0x334155,
      emissive: kind === 'lava' ? 0xea580c : 0x991b1b,
      emissiveIntensity: 0.25,
      roughness: kind === 'lava' ? 0.35 : 0.75,
      metalness: kind === 'lava' ? 0.1 : 0.4,
    });
    disposables.push(coreMat);

    const coreMesh = new THREE.Mesh(trapCoreGeo, coreMat);
    coreMesh.position.y = 0.03;
    tGroup.add(coreMesh);

    let spikesGroup: THREE.Group | undefined;
    if (kind === 'spikes') {
      spikesGroup = new THREE.Group();
      const offsets: Array<[number, number]> = [
        [-0.48, -0.48],
        [0.48, -0.48],
        [-0.48, 0.48],
        [0.48, 0.48],
      ];
      offsets.forEach(([sx, sz]) => {
        const sp = new THREE.Mesh(spikeConeGeo, trapSpikeMat);
        sp.position.set(sx, 0, sz);
        sp.rotation.y = Math.PI / 4;
        spikesGroup!.add(sp);
      });
      spikesGroup.position.y = -0.42;
      tGroup.add(spikesGroup);
    }

    group.add(tGroup);
    traps.push({
      id: `ctrap_${zoneId}_${idx}`,
      kind,
      x: tx,
      z: tz,
      halfW: 1.0,
      phaseOffset,
      group: tGroup,
      coreMat,
      spikesGroup,
      active: false,
    });
  });

  // Zone-specific ambient cave accents
  if (zoneId === 'menara_waktu') {
    const goldMat = palette.getMat(0xfbbf24, 'metal');
    const glowMat = palette.getMat(0x38bdf8, 'emissive');
    const gearGroup = new THREE.Group();
    gearGroup.position.set(0, 6.2, -19.5);
    const gearRing = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.36, 8, 24), goldMat);
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.22, 8, 18), glowMat);
    gearGroup.add(gearRing, innerRing);
    gearGroup.userData.animKind = 'spinZ';
    group.add(gearGroup);
    animatables.push(gearGroup);
  }

  // Add the 5 Zone Mission Landmarks (Pool, Corridor Tunnel, Echo Shrine, Bridge, Boss Gate)!
  const doorDefs = ZONE_DOORS[zoneId];
  const doors: DungeonDoorRig[] = doorDefs.map((def) => {
    const dRig = createDungeonDoorRig(def, palette, disposables);
    dRig.orbMesh.userData.animKind = 'bob';
    dRig.orbMesh.userData.baseY = dRig.orbMesh.userData.baseY ?? 4.0;
    dRig.orbMesh.userData.phase = def.index * 0.9;
    animatables.push(dRig.orbMesh);
    group.add(dRig.group);
    cameraOccluders.push(dRig.group);
    return dRig;
  });

  // Exit Portal Gate at South Center (0, 0, 17)
  const exitGate = new THREE.Group();
  exitGate.position.copy(exitPadPos);
  exitGate.userData.dungeonExit = true;

  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(2.8, 3.0, 0.25, 20),
    palette.getMat(0x0ea5e9, 'emissive'),
  );
  pad.position.y = 0.12;
  const archL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.4, 0.8), palette.getMat(0x475569, 'matte'));
  archL.position.set(-2.3, 2.2, 0);
  const archR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.4, 0.8), palette.getMat(0x475569, 'matte'));
  archR.position.set(2.3, 2.2, 0);
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.9, 1.0), palette.getMat(0x334155, 'matte'));
  archTop.position.set(0, 4.6, 0);
  cameraOccluders.push(archL, archR, archTop);
  const exitRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.75, 0.18, 8, 24),
    palette.getMat(0x22d3ee, 'emissive'),
  );
  exitRing.position.set(0, 2.35, 0);
  exitRing.userData.animKind = 'spinZ';
  animatables.push(exitRing);

  exitGate.add(pad, archL, archR, archTop, exitRing);
  group.add(exitGate);

  // Minecraft-style Block Selection Wireframe Highlight
  const edgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.08, 2.28, 2.08));
  const edgesMat = new THREE.LineBasicMaterial({ color: 0xfef08a });
  const blockHighlight = new THREE.LineSegments(edgesGeo, edgesMat);
  blockHighlight.visible = false;
  group.add(blockHighlight);
  disposables.push(edgesGeo, edgesMat);

  // Ghost Block Placement Preview (when holding Blok Pelindung)
  const placeEdgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.02, 2.22, 2.02));
  const placeEdgesMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
  const blockPlacePreview = new THREE.LineSegments(placeEdgesGeo, placeEdgesMat);
  blockPlacePreview.visible = false;
  group.add(blockPlacePreview);
  disposables.push(placeEdgesGeo, placeEdgesMat);

  // Ghost Torch Placement Preview
  const torchPreview = createCaveTorchMesh(palette);
  torchPreview.scale.setScalar(0.95);
  torchPreview.visible = false;
  group.add(torchPreview);

  // Random Hidden Cave Weapon Chest (spawns in an alcove away from the Hidden Prison!)
  const safeChestSpots: Array<[number, number]> = [
    [-17, 15],
    [17, 15],
    [-17, -2],
    [17, -2],
    caveStory.prisonCorner === 'nw' ? [17, -17] : [-17, -17],
    [-14, 11],
    [14, 11],
  ];
  const [chestX, chestZ] = safeChestSpots[Math.floor(Math.random() * safeChestSpots.length)];
  let chestY = 0;
  for (const p of platforms) {
    if (Math.abs(chestX - p.x) <= p.halfW && Math.abs(chestZ - p.z) <= p.halfD) {
      chestY = Math.max(chestY, p.topY);
    }
  }
  const chestGroup = new THREE.Group();
  chestGroup.position.set(chestX, chestY, chestZ);
  chestGroup.userData.caveWeaponChest = true;

  const chestBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.95, 1.15),
    palette.getMat(0x92400e, 'matte'),
  );
  chestBase.position.y = 0.475;
  chestBase.castShadow = true;
  const chestBand = new THREE.Mesh(
    new THREE.BoxGeometry(1.52, 0.2, 1.22),
    palette.getMat(0xfbbf24, 'metal'),
  );
  chestBand.position.y = 0.88;
  const chestOrb = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.36, 0),
    palette.getMat(0x38bdf8, 'emissive'),
  );
  chestOrb.position.set(0, 2.38, 0);
  chestOrb.userData.animKind = 'bob';
  chestOrb.userData.baseY = 2.38;
  chestOrb.userData.phase = 0.4;
  animatables.push(chestOrb);

  const chestGun = createWeaponMesh('kerikil', palette, 1.25);
  chestGun.position.set(0, 1.56, 0);
  chestGun.rotation.set(0.18, 0.4, 0.1);
  chestGun.userData.animKind = 'spin';
  animatables.push(chestGun);

  chestGroup.add(chestBase, chestBand, chestOrb, chestGun);
  group.add(chestGroup);

  const weaponChest: CaveWeaponChestRig = {
    x: chestX,
    y: chestY,
    z: chestZ,
    group: chestGroup,
    orb: chestOrb,
    collected: false,
  };

  // Cave Guardian NPC standing inside the cave entrance foyer
  const guardianPos = new THREE.Vector3(4.8, 0, 11.8);
  const guardianMesh = createZoneNpc(caveStory.guardianId, palette);
  guardianMesh.position.copy(guardianPos);
  guardianMesh.rotation.y = -0.65;
  guardianMesh.userData.caveGuardian = true;
  const guardianAuraMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(caveStory.accentColor),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.72,
  });
  const guardianRingGeo = new THREE.RingGeometry(1.1, 1.42, 22);
  const guardianAura = new THREE.Mesh(guardianRingGeo, guardianAuraMat);
  guardianAura.rotation.x = -Math.PI / 2;
  guardianAura.position.y = 0.07;
  guardianMesh.add(guardianAura);
  disposables.push(guardianAuraMat, guardianRingGeo);
  group.add(guardianMesh);

  // Hidden Prison Cell in the deep corner alcove with Captive Character inside!
  const prisonPos = new THREE.Vector3(prisonX, 0, prisonZ);
  const prisonGroup = new THREE.Group();
  prisonGroup.position.copy(prisonPos);
  prisonGroup.userData.hiddenPrison = true;

  const cellPad = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.22, 3.6),
    palette.getMat(0x334155, 'matte'),
  );
  cellPad.position.y = 0.11;
  cellPad.receiveShadow = true;
  prisonGroup.add(cellPad);

  const prisonBars = new THREE.Group();
  const barMat = palette.getMat(0x64748b, 'metal');
  const prisonLockMat = palette.createSurfaceMat({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 0.9,
    roughness: 0.35,
    metalness: 0.4,
  });
  disposables.push(prisonLockMat);

  const barCoords: Array<[number, number]> = [
    [-1.55, -1.55], [-0.55, -1.55], [0.55, -1.55], [1.55, -1.55],
    [-1.55, 1.55], [-0.55, 1.55], [0.55, 1.55], [1.55, 1.55],
    [-1.55, -0.55], [-1.55, 0.55],
    [1.55, -0.55], [1.55, 0.55],
  ];
  barCoords.forEach(([bx, bz]) => {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.2, 0.16), barMat);
    bar.position.set(bx, 1.7, bz);
    bar.castShadow = true;
    prisonBars.add(bar);
  });
  const cageTop = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.28, 3.5), barMat);
  cageTop.position.y = 3.35;
  const padlock = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.78, 0.35), prisonLockMat);
  padlock.position.set(0, 1.65, 1.62);
  prisonBars.add(cageTop, padlock);
  prisonGroup.add(prisonBars);

  const captiveMesh = createCaptiveMesh(caveStory.captiveKind, caveStory.captiveColor, palette);
  captiveMesh.position.set(0, 0.22, 0);
  captiveMesh.rotation.y = caveStory.prisonCorner === 'nw' ? 0.75 : -0.75;
  prisonGroup.add(captiveMesh);
  group.add(prisonGroup);

  // Golden Prison Key (dropped in center boss arena upon boss defeat)
  const prisonKeyGroup = createPrisonKeyMesh(palette);
  prisonKeyGroup.position.set(0, 0, -9);
  prisonKeyGroup.visible = false;
  prisonKeyGroup.userData.prisonKey = true;
  if (prisonKeyGroup.userData.keyPivot) {
    animatables.push(prisonKeyGroup.userData.keyPivot as THREE.Object3D);
  }
  group.add(prisonKeyGroup);

  return {
    group,
    animatables,
    doors,
    exitPadPos,
    exitClickable: exitGate,
    craftingTablePos,
    caveBlocks,
    caveColliders,
    platforms,
    chasms,
    traps,
    blockHighlight,
    blockPlacePreview,
    torchPreview,
    shieldBlockMat,
    shieldBlockGeo: blockGeo,
    crackMaterials,
    crackGeo,
    weaponChest,
    guardianPos,
    guardianMesh,
    guardianAuraMat,
    prisonPos,
    prisonGroup,
    prisonBars,
    prisonLockMat,
    captiveMesh,
    prisonKeyGroup,
    cameraOccluders,
    disposables,
  };
}

// 11. Grand 3D Istana IELTS / Akademi Ujian Hall (Interior #8)
export function createAcademyHallEnvironment(palette: MaterialPalette): AcademyHallRig {
  const group = new THREE.Group();
  const animatables: THREE.Object3D[] = [];
  const cameraOccluders: THREE.Object3D[] = [];
  const exitPadPos = new THREE.Vector3(0, 0, 16);

  const outerFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 240),
    palette.getMat(0x1e1b4b, 'matte'),
  );
  outerFloor.rotation.x = -Math.PI / 2;
  outerFloor.position.y = -0.05;
  group.add(outerFloor);

  // Royal Marble Floor
  const marbleFloor = new THREE.Mesh(
    new THREE.BoxGeometry(44, 0.4, 44),
    palette.getMat(0xf8fafc, 'gloss'),
  );
  marbleFloor.position.y = -0.2;
  marbleFloor.receiveShadow = true;
  group.add(marbleFloor);

  // Royal Purple Carpet Runner
  const carpet = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 0.08, 34),
    palette.getMat(0x6d28d9, 'matte'),
  );
  carpet.position.set(0, 0.04, 1);
  const goldTrim = new THREE.Mesh(
    new THREE.BoxGeometry(7.2, 0.05, 34.4),
    palette.getMat(0xfbbf24, 'metal'),
  );
  goldTrim.position.set(0, 0.02, 1);
  group.add(goldTrim, carpet);

  // Royal Golden Throne Platform at North (Raja Penguji)
  const dais = new THREE.Mesh(
    new THREE.BoxGeometry(9.5, 0.65, 6.2),
    palette.getMat(0xfbbf24, 'metal'),
  );
  dais.position.set(0, 0.32, -14.5);
  group.add(dais);

  // Perimeter Palace Columns
  const pillarMat = palette.getMat(0xe2e8f0, 'matte');
  const goldMat = palette.getMat(0xfbbf24, 'metal');
  const crystalMat = palette.getMat(0xa855f7, 'emissive');
  const colPositions: Array<[number, number]> = [
    [-19, -18],
    [-19, -6],
    [-19, 6],
    [-19, 18],
    [19, -18],
    [19, -6],
    [19, 6],
    [19, 18],
  ];
  colPositions.forEach(([px, pz], idx) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 8.2, 12), pillarMat);
    col.position.set(px, 4.1, pz);
    col.castShadow = true;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 2.4), goldMat);
    cap.position.set(px, 8.3, pz);
    const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), crystalMat);
    orb.position.set(px, 9.4, pz);
    orb.userData.animKind = 'bob';
    orb.userData.baseY = 9.4;
    orb.userData.phase = idx * 0.7;
    animatables.push(orb);
    group.add(col, cap, orb);
    cameraOccluders.push(col, cap);
  });

  // Back Royal Wall
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(44, 6.5, 1.5),
    palette.getMat(0x312e81, 'matte'),
  );
  backWall.position.set(0, 3.25, -21.5);
  group.add(backWall);
  cameraOccluders.push(backWall, dais);

  // Exit Portal back to Hutan Kata
  const exitGate = new THREE.Group();
  exitGate.position.copy(exitPadPos);
  exitGate.userData.academyExit = true;
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 2.8, 0.25, 20),
    palette.getMat(0x06b6d4, 'emissive'),
  );
  pad.position.y = 0.12;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.7, 0.18, 8, 24),
    palette.getMat(0x38bdf8, 'emissive'),
  );
  ring.position.set(0, 2.3, 0);
  ring.userData.animKind = 'spinZ';
  animatables.push(ring);
  exitGate.add(pad, ring);
  group.add(exitGate);

  const colliders: AcademyHallRig['colliders'] = [
    { x: 0, z: -21.5, halfW: 22.0, halfD: 0.9, maxY: 6.8 },
    { x: 0, z: -14.5, halfW: 4.75, halfD: 3.1, maxY: 0.65 },
  ];
  colPositions.forEach(([px, pz]) => {
    colliders.push({ x: px, z: pz, halfW: 1.05, halfD: 1.05, maxY: 8.6 });
  });

  return { group, animatables, exitPadPos, exitClickable: exitGate, cameraOccluders, colliders };
}

// 12. First-Person Hand & Held Item Viewmodel (Minecraft-style bottom-right viewmodel)
export interface FirstPersonViewRig {
  root: THREE.Group;
  handPivot: THREE.Group;
  weaponGroup: THREE.Group;
  weaponMeshes: Record<WeaponId, THREE.Group>;
  weaponTipMat: SurfaceMaterial;
  pickaxeGroup: THREE.Group;
  pickaxeHeadMat: SurfaceMaterial;
  torchGroup: THREE.Group;
  shieldBlockGroup: THREE.Group;
  tntGroup: THREE.Group;
}

export function createFirstPersonViewRig(palette: MaterialPalette): FirstPersonViewRig {
  const root = new THREE.Group();
  const handPivot = new THREE.Group();
  handPivot.position.set(0.42, -0.36, -0.68);
  handPivot.rotation.set(0.28, -0.34, 0.14);
  root.add(handPivot);

  const skin = palette.getMat(0xfed7aa, 'matte');
  const tunic = palette.getMat(0x16a34a, 'matte');

  const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.34), tunic);
  sleeve.position.set(0, -0.05, 0.18);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.38), skin);
  arm.position.set(0, 0, -0.08);
  handPivot.add(sleeve, arm);

  // 1) Stylized Roblox-grade 3D Blaster / Weapon Viewmodels
  const weaponTipMat = palette.createSurfaceMat({
    color: 0x4fd8ff,
    emissive: 0x4fd8ff,
    emissiveIntensity: 1.3,
    roughness: 0.2,
  });
  const weaponGroup = new THREE.Group();
  weaponGroup.position.set(-0.04, 0.13, -0.26);
  // Rotate PI on Y so +Z barrel from createWeaponMesh points forward (-Z in camera space)
  weaponGroup.rotation.y = Math.PI;
  const weaponMeshes = {} as Record<WeaponId, THREE.Group>;
  WEAPON_ORDER.forEach((wId) => {
    const wMesh = createWeaponMesh(wId, palette, 0.62);
    wMesh.visible = wId === 'ketapel';
    weaponMeshes[wId] = wMesh;
    weaponGroup.add(wMesh);
  });
  handPivot.add(weaponGroup);

  // 2) Voxel Pickaxe viewmodel (color shifts with Pickaxe Tier!)
  const pickaxeGroup = new THREE.Group();
  pickaxeGroup.position.set(-0.06, 0.18, -0.25);
  pickaxeGroup.rotation.set(-0.4, 0.15, 0.2);
  const shaft = new THREE.Mesh(
    new THREE.BoxGeometry(0.055, 0.48, 0.055),
    palette.getMat(0x92400e, 'matte'),
  );
  const pickaxeHeadMat = palette.createSurfaceMat({
    color: 0x94a3b8,
    roughness: 0.45,
    metalness: 0.65,
  });
  const headMain = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.07), pickaxeHeadMat);
  headMain.position.set(0, 0.22, 0);
  const tipL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.065), pickaxeHeadMat);
  tipL.position.set(-0.2, 0.17, 0);
  const tipR = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.065), pickaxeHeadMat);
  tipR.position.set(0.2, 0.17, 0);
  pickaxeGroup.add(shaft, headMain, tipL, tipR);
  pickaxeGroup.visible = false;
  handPivot.add(pickaxeGroup);

  // 3) Voxel Torch viewmodel
  const torchGroup = new THREE.Group();
  torchGroup.position.set(-0.04, 0.16, -0.24);
  torchGroup.rotation.set(-0.2, 0, 0.08);
  const stick = new THREE.Mesh(
    new THREE.BoxGeometry(0.075, 0.42, 0.075),
    palette.getMat(0x78350f, 'matte'),
  );
  const flame = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.13, 0.11),
    palette.getMat(0xfacc15, 'emissive'),
  );
  flame.position.set(0, 0.26, 0);
  torchGroup.add(stick, flame);
  torchGroup.visible = false;
  handPivot.add(torchGroup);

  // 4) Held Voxel Shield Block viewmodel (Place Block)
  const shieldBlockGroup = new THREE.Group();
  shieldBlockGroup.position.set(-0.05, 0.14, -0.26);
  shieldBlockGroup.rotation.set(0.12, 0.35, 0);
  const shieldCube = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.24, 0.24),
    palette.getMat(0xd97706, 'matte'),
  );
  const shieldCore = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.08, 0.08),
    palette.getMat(0x38bdf8, 'emissive'),
  );
  shieldBlockGroup.add(shieldCube, shieldCore);
  shieldBlockGroup.visible = false;
  handPivot.add(shieldBlockGroup);

  // 5) Held Voxel TNT Block viewmodel
  const tntGroup = new THREE.Group();
  tntGroup.position.set(-0.05, 0.14, -0.26);
  tntGroup.rotation.set(0.12, 0.35, 0);
  const tntCube = new THREE.Mesh(
    new THREE.BoxGeometry(0.23, 0.23, 0.23),
    palette.getMat(0xdc2626, 'matte'),
  );
  const tntBand = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.08, 0.24),
    palette.getMat(0xf8fafc, 'matte'),
  );
  tntGroup.add(tntCube, tntBand);
  tntGroup.visible = false;
  handPivot.add(tntGroup);

  return {
    root,
    handPivot,
    weaponGroup,
    weaponMeshes,
    weaponTipMat,
    pickaxeGroup,
    pickaxeHeadMat,
    torchGroup,
    shieldBlockGroup,
    tntGroup,
  };
}

export function setFirstPersonHeldVisual(
  rig: FirstPersonViewRig,
  mode: 'bare' | 'weapon' | 'pickaxe' | 'torch' | 'shield_block' | 'tnt',
  weaponOrColorHex: WeaponId | number = 'ketapel',
  pickaxeTier: 1 | 2 | 3 = 1,
): void {
  rig.weaponGroup.visible = mode === 'weapon';
  rig.pickaxeGroup.visible = mode === 'pickaxe';
  rig.torchGroup.visible = mode === 'torch';
  rig.shieldBlockGroup.visible = mode === 'shield_block';
  rig.tntGroup.visible = mode === 'tnt';
  if (typeof weaponOrColorHex === 'string') {
    WEAPON_ORDER.forEach((id) => {
      const m = rig.weaponMeshes[id];
      if (m) m.visible = id === weaponOrColorHex;
    });
  } else {
    rig.weaponTipMat.color.setHex(weaponOrColorHex);
    rig.weaponTipMat.emissive.setHex(weaponOrColorHex);
  }
  const tierHex = pickaxeTier === 3 ? 0x22d3ee : pickaxeTier === 2 ? 0xe2e8f0 : 0x94a3b8;
  rig.pickaxeHeadMat.color.setHex(tierHex);
}

// 13. Blocky Minecraft-style Voxel Sky Clouds (high altitude well above Title camera & mountain peaks)
export function createVoxelClouds(count = 36, useLiteShader = false): THREE.InstancedMesh {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = useLiteShader
    ? new THREE.MeshLambertMaterial({
        color: 0xffffff,
        emissive: 0xe2e8f0,
        emissiveIntensity: 0.18,
        transparent: true,
        opacity: 0.88,
      })
    : new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.95,
        metalness: 0.0,
        transparent: true,
        opacity: 0.88,
      });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const x = ((i * 73) % 470) - 235;
    const z = ((i * 97) % 470) - 235;
    const y = 86 + (i % 4) * 5.0;
    const sx = 11 + (i % 4) * 5.5;
    const sz = 7 + ((i * 3) % 4) * 3.8;
    dummy.position.set(x, y, z);
    dummy.scale.set(sx, 1.5, sz);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  return mesh;
}

