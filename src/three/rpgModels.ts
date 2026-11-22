import * as THREE from 'three';
import { WEAPON_ORDER, ZONE_CAVE_STORIES, ZONE_DOORS, ZONE_INFO } from '../data/diglosaCatalog';
import { CaveBlockKind, DoorDef, MonsterType, WeaponId, ZoneId } from '../types/game';
import { MaterialPalette, SurfaceMaterial } from './materials';
import {
  getArchipelagoGroundY,
  getArchipelagoZoneForPosition,
} from './archipelagoWorld';
import { createMinecraftHouse } from './minecraftVillage';
import { createEnemyBlasterMesh, createWeaponMesh } from './weaponModels';

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
  weaponGroup: THREE.Group;
  weaponMeshes: Record<WeaponId, THREE.Group>;
  weaponTipMat: SurfaceMaterial;
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

// 1. Composite 3D Hero Explorer ("Hoot Sang Petualang Kata")
export function createHeroAvatar(palette: MaterialPalette): HeroAvatarRig {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  addShadow(root, palette, 1.0);

  const skin = palette.getMat(0xfed7aa, 'matte');
  const tunic = palette.getMat(0x16a34a, 'matte');
  const pants = palette.getMat(0x1e3a8a, 'matte');
  const boot = palette.getMat(0x78350f, 'matte');
  const pack = palette.getMat(0xb45309, 'matte');
  const hatMat = palette.getMat(0x92400e, 'matte');
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

  // Torso & Belt (children of upperBody, local Y = oldY - 1.1)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.05, 0.58), tunic);
  torso.position.y = 0.48;
  torso.castShadow = true;
  upperBody.add(torso);

  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.16, 0.62), boot);
  belt.position.y = 0.08;
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.08), gold);
  buckle.position.set(0, 0.08, 0.32);
  upperBody.add(belt, buckle);

  // Explorer Backpack
  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.88, 0.42), pack);
  backpack.position.set(0, 0.52, -0.45);
  backpack.castShadow = true;
  const bedroll = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.8, 8),
    palette.getMat(0xf59e0b, 'matte'),
  );
  bedroll.rotation.z = Math.PI / 2;
  bedroll.position.set(0, 1.02, -0.45);
  upperBody.add(backpack, bedroll);

  // Head & Adventurer Hat pivoted at neck (y = 2.15 => 1.05 inside upperBody)
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

  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.78, 0.1, 14), hatMat);
  hatBrim.position.set(0, 0.83, 0);
  const hatCrown = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.42, 0.72), hatMat);
  hatCrown.position.set(0, 1.07, 0);
  const hatBand = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.12, 0.76), gold);
  hatBand.position.set(0, 0.91, 0);
  const feather = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.18), palette.getMat(0xef4444, 'gloss'));
  feather.position.set(0.36, 1.17, -0.05);
  feather.rotation.z = -0.3;
  headGroup.add(hatBrim, hatCrown, hatBand, feather);

  // Weapon tip custom material fallback
  const weaponTipMat = palette.createSurfaceMat({
    color: 0x4fd8ff,
    emissive: 0x4fd8ff,
    emissiveIntensity: 1.35,
    roughness: 0.2,
  });

  const weaponGroup = new THREE.Group();
  const weaponMeshes = {} as Record<WeaponId, THREE.Group>;
  const makeArm = (x: number, withWeapon: boolean): THREE.Group => {
    const arm = new THREE.Group();
    arm.position.set(x, 0.88, 0);
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.32), tunic);
    sleeve.position.y = -0.18;
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.42, 0.28), skin);
    hand.position.y = -0.56;
    arm.add(sleeve, hand);
    if (withWeapon) {
      // Orient +PI/2 around X inside arm so when arm aims forward (-PI/2 around X),
      // weapon barrel (+Z) points straight forward and sights (+Y) stay upright!
      weaponGroup.position.set(0, -0.72, 0.06);
      weaponGroup.rotation.x = Math.PI / 2;
      WEAPON_ORDER.forEach((wId) => {
        const wMesh = createWeaponMesh(wId, palette, 0.92);
        wMesh.visible = wId === 'ketapel';
        weaponMeshes[wId] = wMesh;
        weaponGroup.add(wMesh);
      });
      arm.add(weaponGroup);
    }
    return arm;
  };

  // When Hero faces +Z with +Y up, Hero's true RIGHT side is -X and LEFT side is +X
  const rightArm = makeArm(-0.62, true);
  const leftArm = makeArm(0.62, false);
  upperBody.add(leftArm, rightArm);

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
    weaponGroup,
    weaponMeshes,
    weaponTipMat,
  };
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
}

/**
 * Smoothly animates legs, torso lean/twist, head counter-look, both arms,
 * and weapon grip angle for distinct light, medium, sniper, and heavy weapons.
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
  } = input;
  const clampedAimPitch = THREE.MathUtils.clamp(aimPitch, -0.58, 0.65);
  const moving = speed > 0.6;
  const airborne = !onGround;
  const jumpRise = THREE.MathUtils.clamp(velY / 11.4, -1, 1);
  const swing = moving ? Math.sin(walkCycle) * 0.6 : 0;
  const idleActive = !moving && !airborne && aimAlpha < 0.08 && idleDuration >= 1.8;
  const idleBlend = idleActive ? THREE.MathUtils.clamp((idleDuration - 1.8) / 0.55, 0, 1) : 0;
  const idle = computeIdleBehavior(elapsed, 0.25);

  const breathWave = Math.sin(elapsed * 2.5);
  const deepExpand = !moving && !airborne ? idle.deepBreath * 0.038 : 0;
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
    // Apply vertical crosshair aim pitch across torso, head, and weapon arms!
    if (aimAlpha > 0.02 && Math.abs(clampedAimPitch) > 0.005) {
      const pitchShift = clampedAimPitch * aimAlpha;
      targetRightArmX -= pitchShift;
      if (cls !== 'handcannon') {
        targetLeftArmX -= pitchShift;
      }
      targetHeadX -= pitchShift * 0.68;
      targetUpperX -= pitchShift * 0.24;
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
}

export interface MonsterAnimRig {
  type: MonsterType;
  bodyPivot: THREE.Group;
  upperBody?: THREE.Group;
  headGroup?: THREE.Group;
  eyes?: THREE.Object3D[];
  leftArm?: THREE.Group;
  rightArm?: THREE.Group;
  legs?: THREE.Group[];
  leftWing?: THREE.Group;
  rightWing?: THREE.Group;
  weaponGroup?: THREE.Group;
  extraSpin?: THREE.Object3D;
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

// 4. All Distinct Zone, Story, and Academy Examiner 3D NPCs (Jointed Arms, Hands & Living Rig)
export function createZoneNpc(npcId: string, palette: MaterialPalette): THREE.Group {
  const root = new THREE.Group();
  addShadow(root, palette, 1.0);

  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const skin = palette.getMat(0xfed7aa, 'matte');
  const foxFur = palette.getMat(0xf97316, 'matte');
  const handMat = npcId === 'npc_rubah' ? foxFur : npcId === 'npc_penjaga' ? palette.getMat(0x94a3b8, 'metal') : skin;
  const eyeMat = palette.getMat(0x0f172a, 'gloss');
  const darkPants = palette.getMat(0x1e293b, 'matte');
  const bootMat = palette.getMat(0x451a03, 'matte');

  let robeColor = 0xb45309;
  if (npcId === 'npc_koki') robeColor = 0xf8fafc;
  else if (npcId === 'npc_penjaga') robeColor = 0x1d4ed8;
  else if (npcId === 'npc_penyihir') robeColor = 0x312e81;
  else if (npcId === 'npc_rubah') robeColor = 0xea580c;
  else if (npcId === 'npc_portal') robeColor = 0x6d28d9;
  else if (npcId === 'npc_sera') robeColor = 0x0284c7;
  else if (npcId === 'npc_bima') robeColor = 0x059669;
  else if (npcId === 'npc_ayu') robeColor = 0xd97706;
  else if (npcId === 'npc_rangga') robeColor = 0xdb2777;
  else if (npcId === 'npc_raja_penguji' || npcId === 'npc_raja') robeColor = 0x6d28d9;
  else if (npcId === 'npc_exit_academy') robeColor = 0x0891b2;

  const robeMat = palette.getMat(robeColor, npcId === 'npc_penjaga' ? 'metal' : 'matte');

  // Grounded Legs + Boots
  const makeLeg = (lx: number): THREE.Group => {
    const leg = new THREE.Group();
    leg.position.set(lx, 0.9, 0);
    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.56, 0.34), darkPants);
    thigh.position.y = -0.28;
    thigh.castShadow = true;
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 0.44), bootMat);
    boot.position.set(0, -0.73, 0.04);
    boot.castShadow = true;
    leg.add(thigh, boot);
    return leg;
  };
  const leftLeg = makeLeg(-0.22);
  const rightLeg = makeLeg(0.22);
  bodyPivot.add(leftLeg, rightLeg);

  // Tunic / Robe Skirt hem overlapping upper legs cleanly
  const lowerRobe = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.62, 0.64),
    robeMat,
  );
  lowerRobe.position.y = 0.72;
  lowerRobe.castShadow = true;
  bodyPivot.add(lowerRobe);

  const upperBody = new THREE.Group();
  upperBody.position.set(0, 0.96, 0);
  bodyPivot.add(upperBody);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.98, 0.62), robeMat);
  torso.position.y = 0.52;
  torso.castShadow = true;
  const sash = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.16, 0.66),
    palette.getMat(npcId === 'npc_raja' || npcId === 'npc_raja_penguji' ? 0xfbbf24 : 0x78350f, 'metal'),
  );
  sash.position.y = 0.14;
  upperBody.add(torso, sash);

  // Neck + Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.06, 0);
  upperBody.add(headGroup);

  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.42), npcId === 'npc_rubah' ? foxFur : skin);
  neck.position.y = 0.04;
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.84, 0.82, 0.8),
    npcId === 'npc_rubah' ? foxFur : skin,
  );
  head.position.y = 0.46;
  head.castShadow = true;
  const lEye = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.15, 0.06), eyeMat);
  lEye.position.set(-0.2, 0.48, 0.41);
  const rEye = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.15, 0.06), eyeMat);
  rEye.position.set(0.2, 0.48, 0.41);
  const browMat = palette.getMat(npcId === 'npc_tetua' ? 0xf8fafc : 0x334155, 'matte');
  const lBrow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.05), browMat);
  lBrow.position.set(-0.2, 0.6, 0.41);
  const rBrow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.05), browMat);
  rBrow.position.set(0.2, 0.6, 0.41);
  headGroup.add(neck, head, lEye, rEye, lBrow, rBrow);

  // Full Proportionate Articulated Arms + Visible Hands (no tiny/cut-off arms!)
  const makeNpcArm = (ax: number): THREE.Group => {
    const arm = new THREE.Group();
    arm.position.set(ax, 0.9, 0);
    const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.36), robeMat);
    shoulder.position.y = -0.18;
    shoulder.castShadow = true;
    const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.3), robeMat);
    forearm.position.y = -0.48;
    forearm.castShadow = true;
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.26), handMat);
    hand.position.y = -0.7;
    hand.castShadow = true;
    arm.add(shoulder, forearm, hand);
    return arm;
  };
  const leftArm = makeNpcArm(-0.64);
  const rightArm = makeNpcArm(0.64);
  upperBody.add(leftArm, rightArm);

  let tailPivot: THREE.Group | undefined;
  let propSpin: THREE.Object3D | undefined;
  let baseRightArmX = -0.22;
  let baseLeftArmX = 0.06;

  if (npcId === 'npc_tetua') {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.78, 0.12, 12), palette.getMat(0x92400e, 'matte'));
    brim.position.y = 0.88;
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.34, 0.68), palette.getMat(0xb45309, 'matte'));
    crown.position.y = 1.1;
    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.46, 0.22), palette.getMat(0xf8fafc, 'matte'));
    beard.position.set(0, 0.18, 0.38);
    headGroup.add(brim, crown, beard);

    // Carved Wooden Staff held directly inside Right Hand!
    const staffGroup = new THREE.Group();
    staffGroup.position.set(0, -0.7, 0.12);
    staffGroup.rotation.x = 0.36;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 2.35, 8), palette.getMat(0x78350f, 'matte'));
    shaft.position.y = 0.45;
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), palette.getMat(0xfacc15, 'emissive'));
    gem.position.y = 1.72;
    staffGroup.add(shaft, gem);
    rightArm.add(staffGroup);
    propSpin = gem;
    baseRightArmX = -0.45;
  } else if (npcId === 'npc_koki') {
    const chefHatBase = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.4, 0.34, 12), palette.getMat(0xffffff, 'matte'));
    chefHatBase.position.y = 1.02;
    const chefPuff = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.42, 0.74), palette.getMat(0xffffff, 'matte'));
    chefPuff.position.y = 1.32;
    headGroup.add(chefHatBase, chefPuff);

    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.02, 0.1), palette.getMat(0xffffff, 'matte'));
    apron.position.set(0, 0.25, 0.34);
    upperBody.add(apron);

    // Soup Ladle in Right Hand + Serving Pan in Left Hand
    const ladle = new THREE.Group();
    ladle.position.set(0, -0.7, 0.14);
    ladle.rotation.x = 0.65;
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.15, 6), palette.getMat(0x92400e, 'matte'));
    handle.position.y = 0.35;
    const scoop = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.16, 8), palette.getMat(0x94a3b8, 'metal'));
    scoop.position.y = 0.95;
    ladle.add(handle, scoop);
    rightArm.add(ladle);

    const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.08, 10), palette.getMat(0xd97706, 'metal'));
    tray.position.set(0, -0.74, 0.2);
    leftArm.add(tray);
    baseRightArmX = -0.68;
    baseLeftArmX = -0.48;
  } else if (npcId === 'npc_penjaga') {
    const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.42, 0.88), palette.getMat(0x94a3b8, 'metal'));
    helmet.position.y = 0.92;
    const plume = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.4, 0.56), palette.getMat(0xef4444, 'gloss'));
    plume.position.set(0, 1.26, -0.04);
    headGroup.add(helmet, plume);

    // Royal Halberd held in Right Hand + Shield mounted on Left Forearm
    const spearGroup = new THREE.Group();
    spearGroup.position.set(0, -0.68, 0.1);
    spearGroup.rotation.x = 0.22;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.9, 6), palette.getMat(0x78350f, 'matte'));
    pole.position.y = 0.65;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 4), palette.getMat(0xfbbf24, 'metal'));
    tip.position.y = 2.25;
    spearGroup.add(pole, tip);
    rightArm.add(spearGroup);

    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.82, 0.62), palette.getMat(0x1e40af, 'metal'));
    shield.position.set(-0.2, -0.45, 0.08);
    const shieldRim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.36), palette.getMat(0xfbbf24, 'metal'));
    shieldRim.position.set(-0.2, -0.45, 0.08);
    leftArm.add(shield, shieldRim);
    baseRightArmX = -0.35;
    baseLeftArmX = -0.38;
  } else if (npcId === 'npc_penyihir') {
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.86, 0.12, 12), palette.getMat(0x1e1b4b, 'gloss'));
    hatBrim.position.y = 0.9;
    const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.54, 1.1, 8), palette.getMat(0x312e81, 'gloss'));
    hatCone.position.y = 1.48;
    headGroup.add(hatBrim, hatCone);

    // Luminous Time Hourglass crystal held above Right Hand
    const hg = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), palette.getMat(0xfacc15, 'emissive'));
    hg.position.set(0, -0.72, 0.26);
    rightArm.add(hg);
    propSpin = hg;
    baseRightArmX = -0.82;
  } else if (npcId === 'npc_rubah') {
    const earL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 0.18), palette.getMat(0xea580c, 'matte'));
    earL.position.set(-0.26, 0.98, 0);
    const earR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 0.18), palette.getMat(0xea580c, 'matte'));
    earR.position.set(0.26, 0.98, 0);
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.28), palette.getMat(0xfef3c7, 'matte'));
    snout.position.set(0, 0.34, 0.44);
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.1), eyeMat);
    nose.position.set(0, 0.4, 0.58);
    headGroup.add(earL, earR, snout, nose);

    const scarf = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.22, 0.72), palette.getMat(0x16a34a, 'matte'));
    scarf.position.y = 0.95;
    upperBody.add(scarf);

    tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.08, -0.32);
    const tailMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.44, 0.85), foxFur);
    tailMesh.position.set(0, 0.12, -0.4);
    const tailTip = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.26), palette.getMat(0xf8fafc, 'matte'));
    tailTip.position.set(0, 0.14, -0.86);
    tailPivot.add(tailMesh, tailTip);
    upperBody.add(tailPivot);
    baseRightArmX = -0.3;
    baseLeftArmX = -0.2;
  } else if (npcId === 'npc_portal') {
    const hood = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.52, 0.92), palette.getMat(0x7c3aed, 'gloss'));
    hood.position.y = 0.82;
    headGroup.add(hood);

    const staffGroup = new THREE.Group();
    staffGroup.position.set(0, -0.7, 0.12);
    staffGroup.rotation.x = 0.32;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.25, 6), palette.getMat(0x4c1d95, 'metal'));
    shaft.position.y = 0.45;
    const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), palette.getMat(0xe879f9, 'emissive'));
    orb.position.y = 1.68;
    staffGroup.add(shaft, orb);
    leftArm.add(staffGroup);
    propSpin = orb;
    baseLeftArmX = -0.45;
  } else if (npcId === 'npc_raja_penguji' || npcId === 'npc_raja') {
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.42, 0.38, 6), palette.getMat(0xfbbf24, 'metal'));
    crown.position.y = 1.04;
    headGroup.add(crown);

    const cape = new THREE.Mesh(new THREE.BoxGeometry(1.06, 1.55, 0.14), palette.getMat(0x991b1b, 'matte'));
    cape.position.set(0, 0.24, -0.38);
    upperBody.add(cape);

    const scepterGroup = new THREE.Group();
    scepterGroup.position.set(0, -0.7, 0.14);
    scepterGroup.rotation.x = 0.42;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.0, 6), palette.getMat(0xfbbf24, 'metal'));
    shaft.position.y = 0.4;
    const ruby = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), palette.getMat(0xef4444, 'emissive'));
    ruby.position.y = 1.48;
    scepterGroup.add(shaft, ruby);
    rightArm.add(scepterGroup);
    propSpin = ruby;
    baseRightArmX = -0.48;
  } else {
    // Examiners (Sera, Bima, Ayu, Rangga) & Penjaga Portal
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.14, 1.02), palette.getMat(0x1e293b, 'gloss'));
    cap.position.y = 0.92;
    const tassel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), palette.getMat(0xfacc15, 'metal'));
    tassel.position.set(0.46, 0.78, 0.25);
    headGroup.add(cap, tassel);

    const book = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.54, 0.16), palette.getMat(0xfbbf24, 'gloss'));
    book.position.set(-0.08, -0.7, 0.2);
    book.rotation.set(0.4, 0.3, 0);
    rightArm.add(book);
    baseRightArmX = -0.62;
  }

  const npcRig: ZoneNpcRig = {
    bodyPivot,
    upperBody,
    headGroup,
    leftEye: lEye,
    rightEye: rEye,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    tailPivot,
    propSpin,
    baseRightArmX,
    baseLeftArmX,
  };
  root.userData.npcRig = npcRig;
  return root;
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

  if (poseMode === 'sleep') {
    const sleepBreath = Math.sin(elapsed * 1.45 + phase);
    const sy = 1 + sleepBreath * 0.025;
    const sxz = 1 / Math.sqrt(sy);
    rig.bodyPivot.scale.set(sxz, sy, sxz);
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
  rig.bodyPivot.scale.set(sxz, sy, sxz);

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
    rig.rightArm.rotation.x = THREE.MathUtils.damp(
      rig.rightArm.rotation.x,
      rig.baseRightArmX + swing * 0.5,
      12,
      dt,
    );
    rig.leftArm.rotation.x = THREE.MathUtils.damp(
      rig.leftArm.rotation.x,
      rig.baseLeftArmX - swing * 0.5,
      12,
      dt,
    );
    rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, 0.05, 10, dt);
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
      ? -0.95 + Math.sin(elapsed * 6.5) * 0.25
      : rig.baseLeftArmX - Math.sin(elapsed * 2.1 + phase) * 0.08;
    let targetLeftZ = isNearHero ? 0.24 : 0.05;
    let targetRightZ = 0;
    let targetLeftLegX = 0;
    let targetRightLegX = 0;

    if (!isNearHero && idle.env > 0.01) {
      const e = idle.env;
      targetLeftZ += idle.twitch * 0.7;
      if (idle.action === 'scan') {
        targetHeadY += Math.sin(idle.t * Math.PI * 2) * 0.42 * idle.side * e;
        targetUpperZ += Math.sin(idle.t * Math.PI * 2) * 0.03 * idle.side * e;
      } else if (idle.action === 'scratch') {
        const rub = Math.sin(idle.t * Math.PI * 7) * 0.14;
        targetLeftX = THREE.MathUtils.lerp(targetLeftX, -1.95 + rub, e);
        targetLeftZ = THREE.MathUtils.lerp(targetLeftZ, -0.32, e);
        targetHeadZ += -0.14 * e;
        targetHeadY += 0.15 * e;
      } else if (idle.action === 'yawn_stretch') {
        targetHeadX += -0.24 * e;
        targetUpperX += -0.08 * e;
        targetLeftX = THREE.MathUtils.lerp(targetLeftX, -0.95, e);
        targetLeftZ = THREE.MathUtils.lerp(targetLeftZ, 0.34, e);
        targetRightX = THREE.MathUtils.lerp(targetRightX, -0.95, e);
        targetRightZ = THREE.MathUtils.lerp(targetRightZ, -0.34, e);
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
        targetLeftX = THREE.MathUtils.lerp(targetLeftX, -1.65, e);
        targetLeftZ = THREE.MathUtils.lerp(targetLeftZ, -0.36, e);
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

// 5. 5 Distinct 3D Word Monsters + Armed Bosses with Living Articulated Rigs
export function createMonsterMesh(
  type: MonsterType,
  palette: MaterialPalette,
  scale = 1,
): THREE.Group {
  const root = new THREE.Group();
  addShadow(root, palette, 1.05);

  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const rig: MonsterAnimRig = { type, bodyPivot };

  if (type === 'gumpal_salam') {
    const orange = palette.getMat(0xf97316, 'gloss');
    const lightOrange = palette.getMat(0xfb923c, 'gloss');
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.25, 1.45), orange);
    body.position.y = 0.65;
    body.castShadow = true;
    const topDrop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.9), lightOrange);
    topDrop.position.y = 1.42;
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.12), palette.getMat(0xfef08a, 'emissive'));
    eyeL.position.set(-0.32, 0.82, 0.74);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.12), palette.getMat(0xfef08a, 'emissive'));
    eyeR.position.set(0.32, 0.82, 0.74);

    // Expressive bouncy Slime/Gumpal arms
    const makeSlimeArm = (ax: number): THREE.Group => {
      const arm = new THREE.Group();
      arm.position.set(ax, 0.85, 0.08);
      const nub = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.56, 0.34), lightOrange);
      nub.position.y = -0.22;
      nub.castShadow = true;
      arm.add(nub);
      return arm;
    };
    const leftArm = makeSlimeArm(-0.88);
    const rightArm = makeSlimeArm(0.88);
    bodyPivot.add(body, topDrop, eyeL, eyeR, leftArm, rightArm);
    rig.leftArm = leftArm;
    rig.rightArm = rightArm;
    rig.eyes = [eyeL, eyeR];
    rig.extraSpin = topDrop;
  } else if (type === 'bayangan_kata') {
    const cloak = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.68, 6), palette.getMat(0x4c1d95, 'gloss'));
    cloak.position.y = 0.92;
    cloak.castShadow = true;
    const upperBody = new THREE.Group();
    upperBody.position.set(0, 1.15, 0);
    bodyPivot.add(cloak, upperBody);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.65, 0);
    const hood = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.85, 0.92), palette.getMat(0x5b21b6, 'gloss'));
    hood.position.y = 0.2;
    const eye = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), palette.getMat(0xf43f5e, 'emissive'));
    eye.position.set(0, 0.18, 0.48);
    headGroup.add(hood, eye);
    upperBody.add(headGroup);

    const clawMat = palette.getMat(0x3b0764, 'gloss');
    const glowMat = palette.getMat(0xe879f9, 'emissive');
    const makeWraithArm = (ax: number, withWand: boolean): THREE.Group => {
      const arm = new THREE.Group();
      arm.position.set(ax, 0.52, 0);
      const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.52, 0.3), cloak.material as THREE.Material);
      sleeve.position.y = -0.22;
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.3, 0.26), clawMat);
      hand.position.y = -0.58;
      arm.add(sleeve, hand);
      if (withWand) {
        const wGroup = new THREE.Group();
        wGroup.position.set(0, -0.68, 0.1);
        wGroup.rotation.x = Math.PI / 2;
        const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.35, 6), clawMat);
        staff.rotation.x = Math.PI / 2;
        staff.position.z = 0.45;
        const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), glowMat);
        tip.position.z = 1.18;
        wGroup.add(staff, tip);
        arm.add(wGroup);
        rig.weaponGroup = wGroup;
      }
      return arm;
    };
    const leftArm = makeWraithArm(-0.68, false);
    const rightArm = makeWraithArm(0.68, true);
    upperBody.add(leftArm, rightArm);
    rig.upperBody = upperBody;
    rig.headGroup = headGroup;
    rig.eyes = [eye];
    rig.leftArm = leftArm;
    rig.rightArm = rightArm;
  } else if (type === 'jam_pasir') {
    const brass = palette.getMat(0xf59e0b, 'metal');
    const botCap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 1.4), brass);
    botCap.position.y = 0.24;
    const upperBody = new THREE.Group();
    upperBody.position.set(0, 0.35, 0);
    bodyPivot.add(botCap, upperBody);

    const topCap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 1.4), brass);
    topCap.position.y = 1.82;
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.48, 8), palette.getMat(0x7c3aed, 'emissive'));
    glass.position.y = 0.92;
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.1, 0);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.1), palette.getMat(0xfef08a, 'emissive'));
    eyeL.position.set(-0.25, 0, 0.56);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.1), palette.getMat(0xfef08a, 'emissive'));
    eyeR.position.set(0.25, 0, 0.56);
    headGroup.add(eyeL, eyeR);
    upperBody.add(topCap, glass, headGroup);

    const makeBrassArm = (ax: number): THREE.Group => {
      const arm = new THREE.Group();
      arm.position.set(ax, 1.25, 0);
      const pauldron = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.32), brass);
      pauldron.position.y = -0.14;
      const fist = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.3), palette.getMat(0xb45309, 'metal'));
      fist.position.y = -0.52;
      arm.add(pauldron, fist);
      return arm;
    };
    const leftArm = makeBrassArm(-0.92);
    const rightArm = makeBrassArm(0.92);
    upperBody.add(leftArm, rightArm);
    rig.upperBody = upperBody;
    rig.headGroup = headGroup;
    rig.eyes = [eyeL, eyeR];
    rig.leftArm = leftArm;
    rig.rightArm = rightArm;
    rig.extraSpin = glass;
  } else if (type === 'semak_rimba') {
    const leafDark = palette.getMat(0x16a34a, 'matte');
    const leafLight = palette.getMat(0x22c55e, 'matte');
    const bush = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.35, 1.5), leafDark);
    bush.position.y = 0.72;
    bush.castShadow = true;
    const crown = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.48, 1.1), leafLight);
    crown.position.y = 1.55;
    const flower = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.42), palette.getMat(0xf472b6, 'emissive'));
    flower.position.y = 1.92;
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.1), palette.getMat(0xfef08a, 'emissive'));
    eyeL.position.set(-0.3, 0.88, 0.77);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.1), palette.getMat(0xfef08a, 'emissive'));
    eyeR.position.set(0.3, 0.88, 0.77);

    const makeVineArm = (ax: number): THREE.Group => {
      const arm = new THREE.Group();
      arm.position.set(ax, 1.05, 0.06);
      const vine = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.56, 0.32), leafLight);
      vine.position.y = -0.24;
      vine.castShadow = true;
      const claw = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.34), palette.getMat(0x78350f, 'matte'));
      claw.position.set(0, -0.58, 0.08);
      arm.add(vine, claw);
      return arm;
    };
    const leftArm = makeVineArm(-0.9);
    const rightArm = makeVineArm(0.9);
    bodyPivot.add(bush, crown, flower, eyeL, eyeR, leftArm, rightArm);
    rig.leftArm = leftArm;
    rig.rightArm = rightArm;
    rig.eyes = [eyeL, eyeR];
    rig.extraSpin = flower;
  } else if (type === 'creeper_kata') {
    const greenBody = palette.getMat(0x16a34a, 'matte');
    const greenHead = palette.getMat(0x22c55e, 'matte');
    const darkPixel = palette.getMat(0x0f172a, 'matte');
    const legGeo = new THREE.BoxGeometry(0.42, 0.56, 0.42);
    const legMat = palette.getMat(0x15803d, 'matte');
    const legs: THREE.Group[] = [];
    const legCoords: Array<[number, number]> = [
      [-0.36, 0.34],
      [0.36, 0.34],
      [-0.36, -0.34],
      [0.36, -0.34],
    ];
    legCoords.forEach(([lx, lz]) => {
      const legPivot = new THREE.Group();
      legPivot.position.set(lx, 0.56, lz);
      const m = new THREE.Mesh(legGeo, legMat);
      m.position.y = -0.28;
      m.castShadow = true;
      legPivot.add(m);
      legs.push(legPivot);
      bodyPivot.add(legPivot);
    });
    const upperBody = new THREE.Group();
    upperBody.position.set(0, 0.56, 0);
    bodyPivot.add(upperBody);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.88, 1.24, 0.62), greenBody);
    torso.position.y = 0.62;
    torso.castShadow = true;
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.24, 0);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.92, 0.96), greenHead);
    head.position.y = 0.44;
    head.castShadow = true;
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.08), darkPixel);
    eyeL.position.set(-0.22, 0.54, 0.49);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.08), darkPixel);
    eyeR.position.set(0.22, 0.54, 0.49);
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.26, 0.08), darkPixel);
    mouth.position.set(0, 0.22, 0.49);
    headGroup.add(head, eyeL, eyeR, mouth);

    const fuseCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), palette.getMat(0xf97316, 'emissive'));
    fuseCore.position.set(0, 0.78, 0.34);
    upperBody.add(torso, headGroup, fuseCore);

    rig.legs = legs;
    rig.upperBody = upperBody;
    rig.headGroup = headGroup;
    rig.eyes = [eyeL, eyeR];
    rig.extraSpin = fuseCore;
  } else if (type === 'kelelawar_gua') {
    const batBodyMat = palette.getMat(0x312e81, 'matte');
    const batWingMat = palette.getMat(0x1e1b4b, 'matte');
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.56, 0.74), batBodyMat);
    body.position.y = 0;
    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 4), batBodyMat);
    earL.position.set(-0.2, 0.42, 0.12);
    const earR = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 4), batBodyMat);
    earR.position.set(0.2, 0.42, 0.12);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), palette.getMat(0xf43f5e, 'emissive'));
    eyeL.position.set(-0.15, 0.08, 0.38);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), palette.getMat(0xf43f5e, 'emissive'));
    eyeR.position.set(0.15, 0.08, 0.38);
    const leftWing = new THREE.Group();
    leftWing.position.set(-0.31, 0.08, 0);
    const lwMesh = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.08, 0.64), batWingMat);
    lwMesh.position.x = -0.58;
    leftWing.add(lwMesh);
    const rightWing = new THREE.Group();
    rightWing.position.set(0.31, 0.08, 0);
    const rwMesh = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.08, 0.64), batWingMat);
    rwMesh.position.x = 0.58;
    rightWing.add(rwMesh);
    root.userData.leftWing = leftWing;
    root.userData.rightWing = rightWing;
    bodyPivot.add(body, earL, earR, eyeL, eyeR, leftWing, rightWing);
    rig.eyes = [eyeL, eyeR];
    rig.leftWing = leftWing;
    rig.rightWing = rightWing;
  } else {
    // Bosses / Ksatria IELTS — full articulated Overlord holding Boss Cannon!
    const darkArmor = palette.getMat(0x1e1b4b, 'metal');
    const midArmor = palette.getMat(0x312e81, 'metal');
    const glowMat = palette.getMat(0x22d3ee, 'emissive');
    const hornGlow = palette.getMat(0xe879f9, 'emissive');

    const legs: THREE.Group[] = [];
    [-0.36, 0.36].forEach((lx) => {
      const leg = new THREE.Group();
      leg.position.set(lx, 0.85, 0);
      const greave = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.85, 0.48), darkArmor);
      greave.position.y = -0.42;
      greave.castShadow = true;
      leg.add(greave);
      legs.push(leg);
      bodyPivot.add(leg);
    });

    const upperBody = new THREE.Group();
    upperBody.position.set(0, 0.88, 0);
    bodyPivot.add(upperBody);

    const armor = new THREE.Mesh(new THREE.BoxGeometry(1.36, 1.15, 0.96), darkArmor);
    armor.position.y = 0.56;
    armor.castShadow = true;
    const chestCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), hornGlow);
    chestCore.position.set(0, 0.68, 0.5);
    upperBody.add(armor, chestCore);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.16, 0);
    const helm = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.88, 0.98), midArmor);
    helm.position.y = 0.42;
    helm.castShadow = true;
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.58, 5), hornGlow);
    hornL.position.set(-0.46, 0.98, 0);
    const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.58, 5), hornGlow);
    hornR.position.set(0.46, 0.98, 0);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.2, 0.1), glowMat);
    visor.position.set(0, 0.44, 0.51);
    headGroup.add(helm, hornL, hornR, visor);
    upperBody.add(headGroup);

    const makeBossArm = (ax: number, withWeapon: boolean): THREE.Group => {
      const arm = new THREE.Group();
      arm.position.set(ax, 1.0, 0);
      const pauldron = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.44, 0.5), midArmor);
      pauldron.position.y = -0.14;
      pauldron.castShadow = true;
      const gauntlet = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.62, 0.4), darkArmor);
      gauntlet.position.y = -0.58;
      gauntlet.castShadow = true;
      arm.add(pauldron, gauntlet);
      if (withWeapon) {
        const wGroup = new THREE.Group();
        wGroup.position.set(0, -0.78, 0.08);
        wGroup.rotation.x = Math.PI / 2;
        const gun = createEnemyBlasterMesh(palette, 'boss', 1.05);
        wGroup.add(gun);
        arm.add(wGroup);
        rig.weaponGroup = wGroup;
      }
      return arm;
    };
    const leftArm = makeBossArm(-0.88, false);
    const rightArm = makeBossArm(0.88, true);
    upperBody.add(leftArm, rightArm);

    rig.legs = legs;
    rig.upperBody = upperBody;
    rig.headGroup = headGroup;
    rig.eyes = [visor];
    rig.leftArm = leftArm;
    rig.rightArm = rightArm;
  }

  root.userData.monsterRig = rig;
  if (scale !== 1) {
    root.scale.setScalar(scale);
  }

  return root;
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
  if (rig.rightArm) {
    rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, targetRightArmX, 22, dt);
    rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, targetRightArmZ, 18, dt);
  }
  if (rig.leftArm) {
    rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, targetLeftArmX, 22, dt);
    rig.leftArm.rotation.z = THREE.MathUtils.damp(rig.leftArm.rotation.z, targetLeftArmZ, 18, dt);
  }
  if (rig.legs) {
    rig.legs.forEach((leg, idx) => {
      const sign = idx % 2 === 0 ? 1 : -1;
      let targetLegX = mode === 'ko' ? 0 : swing * sign;
      if (mode === 'idle' && monsterIdle?.action === 'leg_bounce' && monsterIdle.env > 0.01 && idx === 0) {
        targetLegX = -Math.abs(Math.sin(monsterIdle.t * Math.PI * 6)) * 0.22 * monsterIdle.env;
      }
      leg.rotation.x = THREE.MathUtils.damp(leg.rotation.x, targetLegX, 18, dt);
    });
  }
  if (rig.leftWing && rig.rightWing) {
    const flap = Math.sin(elapsed * 16 + phase) * 0.64;
    rig.leftWing.rotation.z = flap;
    rig.rightWing.rotation.z = -flap;
  }
  if (rig.extraSpin) {
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

  // Desa Sapaan (0, y=1.6, z=54): two cozy timber cottages matching island village layout
  const dy = 1.6;
  const c1 = createMinecraftHouse(palette, {
    x: -10.5,
    z: 61.5,
    rotY: 2.35,
    width: 5.8,
    depth: 4.8,
    wallHeight: 3.2,
    roofTint: 0xd97706,
    flowerBox: true,
  });
  c1.position.y = dy;

  const c2 = createMinecraftHouse(palette, {
    x: -6.5,
    z: 45.2,
    rotY: 0.65,
    width: 5.6,
    depth: 4.6,
    wallHeight: 3.1,
    roofTint: 0xea580c,
    flowerBox: true,
  });
  c2.position.y = dy;

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

  return { group, animatables, exitPadPos, exitClickable: exitGate, cameraOccluders };
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

// 13. Blocky Minecraft-style Voxel Sky Clouds
export function createVoxelClouds(count = 26, useLiteShader = false): THREE.InstancedMesh {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = useLiteShader
    ? new THREE.MeshLambertMaterial({
        color: 0xffffff,
        emissive: 0xe2e8f0,
        emissiveIntensity: 0.18,
        transparent: true,
        opacity: 0.9,
      })
    : new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.95,
        metalness: 0.0,
        transparent: true,
        opacity: 0.9,
      });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const x = ((i * 37) % 190) - 95;
    const z = ((i * 53) % 190) - 95;
    const y = 40 + (i % 3) * 2.5;
    const sx = 9 + (i % 4) * 5;
    const sz = 6 + ((i * 3) % 4) * 3.5;
    dummy.position.set(x, y, z);
    dummy.scale.set(sx, 1.4, sz);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  return mesh;
}

