import * as THREE from 'three';
import { getArchipelagoGroundY, OVERWORLD_ANCHORS } from './archipelagoWorld';
import { MaterialPalette } from './materials';
import { createVillagerMesh, VillagerActor } from './minecraftVillage';
import {
  animateCaptiveMesh,
  animateMonsterRig,
  animateZoneNpc,
  computeBlinkScale,
  createCaptiveMesh,
  createMonsterMesh,
  createZoneNpc,
} from './rpgModels';
import { HutanSatwaRefugeeBeat } from '../types/game';

export const DESA_HEALING_SHELTER_SPOTS = {
  maya: { x: -7.4, z: 133.2, yaw: 0.95 },
  raka: { x: -5.6, z: 134.1, yaw: -2.15 },
  camp: { x: -6.5, z: 133.65 },
} as const;

export interface HutanSatwaGuideCheckpoint {
  id: string;
  x: number;
  z: number;
  title: string;
  subtext: string;
  hintShort: string;
}

export function getNextHutanSatwaGuideCheckpoint(
  heroX: number,
  heroZ: number,
): HutanSatwaGuideCheckpoint | null {
  if (heroZ > 64 && heroX < 38) {
    return {
      id: 'guide_wp_desa_bridge',
      x: -18.0,
      z: 62.5,
      title: '🧭 1️⃣ Jembatan Gantung Utara Desa',
      subtext: 'Keluar ke Utara Desa Sapaan lalu seberangi jembatan ke Citadel',
      hintShort: 'Utara Desa → Jembatan Gantung (-18, 62)',
    };
  }
  if (heroX < 28) {
    return {
      id: 'guide_wp_citadel_east',
      x: 32.0,
      z: 22.0,
      title: '🧭 2️⃣ Alun-Alun Citadel → Jalur Timur',
      subtext: 'Belok ke Timur Citadel menuju Jembatan Gantung Hutan Satwa',
      hintShort: 'Lintasi Citadel ke Timur (32, 22)',
    };
  }
  if (heroX < 62) {
    return {
      id: 'guide_wp_satwa_bridge',
      x: 46.0,
      z: 16.0,
      title: '🧭 3️⃣ Jembatan Gantung Hutan Satwa',
      subtext: 'Seberangi jembatan gantung ini untuk masuk Pulau Hutan Satwa',
      hintShort: 'Seberangi Jembatan Hutan Satwa (46, 16)',
    };
  }
  const rangerDist = Math.hypot(
    heroX - OVERWORLD_ANCHORS.npcs.npc_rubah.x,
    heroZ - OVERWORLD_ANCHORS.npcs.npc_rubah.z,
  );
  if (rangerDist > 12) {
    return {
      id: 'guide_wp_ranger',
      x: OVERWORLD_ANCHORS.npcs.npc_rubah.x,
      z: OVERWORLD_ANCHORS.npcs.npc_rubah.z,
      title: '🦊 4️⃣ Temui Ranger Rimba & Gua Kepala Harimau',
      subtext: 'Ikuti jalan setapak kuning ke Timur Pulau Hutan Satwa',
      hintShort: 'Ikuti Jalan Setapak ke Ranger Rimba (138, 43)',
    };
  }
  return null;
}

export function attachRefugeeBandage(
  actor: VillagerActor,
  palette: MaterialPalette,
  includeHeadWrap: boolean,
): THREE.BufferGeometry[] {
  const geos: THREE.BufferGeometry[] = [];
  const clothMat = palette.getMat(0xf8fafc, 'matte');
  const markMat = palette.getMat(0xef4444, 'matte');

  const armBandGeo = new THREE.BoxGeometry(0.31, 0.28, 0.31);
  geos.push(armBandGeo);
  const armBand = new THREE.Mesh(armBandGeo, clothMat);
  armBand.position.set(0, -0.34, 0);
  actor.rightArm.add(armBand);

  const patchGeo = new THREE.BoxGeometry(0.1, 0.1, 0.33);
  geos.push(patchGeo);
  const patch = new THREE.Mesh(patchGeo, markMat);
  patch.position.set(0, -0.34, 0);
  actor.rightArm.add(patch);

  if (includeHeadWrap) {
    const headWrapGeo = new THREE.BoxGeometry(0.56, 0.13, 0.56);
    geos.push(headWrapGeo);
    const headWrap = new THREE.Mesh(headWrapGeo, clothMat);
    headWrap.position.set(0, 0.34, 0);
    headWrap.rotation.z = 0.08;
    actor.headGroup.add(headWrap);
  }

  return geos;
}

export interface HutanSatwaFlashbackStage {
  group: THREE.Group;
  bossMesh: THREE.Group;
  wolves: THREE.Group[];
  trollMesh: THREE.Group;
  rangerMesh: THREE.Group;
  kikiMesh: THREE.Group;
  fleeingKids: VillagerActor[];
  mayaFlash: VillagerActor;
  rakaFlash: VillagerActor;
  mistMeshes: Array<{ mesh: THREE.Mesh; baseX: number; baseY: number; baseZ: number; phase: number }>;
  thornSpikes: THREE.Mesh[];
  guideMarkers: THREE.Group[];
  disposables: Array<{ dispose: () => void }>;
}

export function buildHutanSatwaFlashbackStage(
  palette: MaterialPalette,
): HutanSatwaFlashbackStage {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  // 1. Dark storm clouds hovering over Hutan Satwa plaza during flashback
  const mistGeo = new THREE.IcosahedronGeometry(1, 1);
  disposables.push(mistGeo);
  const mistMat = new THREE.MeshBasicMaterial({
    color: 0x1e1b4b,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  disposables.push(mistMat);

  const mistCoords: Array<[number, number, number, number]> = [
    [104, 15.5, 48, 12],
    [122, 17.5, 44, 14],
    [92, 14.5, 55, 11],
    [134, 16.0, 52, 13],
    [114, 14.0, 62, 12],
  ];
  const mistMeshes = mistCoords.map(([bx, by, bz, sc], i) => {
    const m = new THREE.Mesh(mistGeo, mistMat);
    m.position.set(bx, by, bz);
    m.scale.set(sc * 1.35, sc * 0.42, sc * 1.15);
    m.visible = false;
    group.add(m);
    return { mesh: m, baseX: bx, baseY: by, baseZ: bz, phase: i * 1.15 };
  });

  // 2. Thorny dark vines/spikes erupting around Kiki & Hutan Satwa trail
  const thornGeo = new THREE.ConeGeometry(0.45, 2.8, 5);
  disposables.push(thornGeo);
  const thornMat = palette.getMat(0x14532d, 'matte');
  const thornCoords: Array<[number, number, number]> = [
    [116.5, 45.2, 0.25],
    [118.4, 46.6, -0.32],
    [117.2, 48.2, 0.18],
    [115.6, 46.9, -0.22],
    [104.0, 50.5, 0.28],
    [107.2, 47.0, -0.2],
  ];
  const thornSpikes = thornCoords.map(([tx, tz, tilt], idx) => {
    const spike = new THREE.Mesh(thornGeo, thornMat);
    const gy = getArchipelagoGroundY(tx, tz);
    spike.position.set(tx, gy - 1.5, tz);
    spike.rotation.z = tilt;
    spike.rotation.x = idx % 2 === 0 ? 0.18 : -0.18;
    spike.visible = false;
    group.add(spike);
    return spike;
  });

  // 3. Boss Ancient Treant Rimba + Dire Wolves + Jungle Troll
  const bossMesh = createMonsterMesh('ancient_treant', palette, 1.85);
  const bx = 111.0;
  const bz = 47.0;
  bossMesh.position.set(bx, getArchipelagoGroundY(bx, bz), bz);
  bossMesh.visible = false;
  group.add(bossMesh);

  const wolfCoords: Array<[number, number]> = [
    [101.5, 49.5],
    [82.0, 41.0],
  ];
  const wolves = wolfCoords.map(([wx, wz]) => {
    const w = createMonsterMesh('dire_wolf', palette, 1.12);
    w.position.set(wx, getArchipelagoGroundY(wx, wz), wz);
    w.visible = false;
    group.add(w);
    return w;
  });

  const trollMesh = createMonsterMesh('jungle_troll', palette, 1.25);
  trollMesh.position.set(106.5, getArchipelagoGroundY(106.5, 53.5), 53.5);
  trollMesh.visible = false;
  group.add(trollMesh);

  // 4. Ranger Rimba, Kiki (fox_kit), 2 fleeing Hutan Satwa villagers, and Maya & Raka flashback actors
  const rangerMesh = createZoneNpc('npc_rubah', palette);
  rangerMesh.position.set(113.5, getArchipelagoGroundY(113.5, 48.0), 48.0);
  rangerMesh.visible = false;
  group.add(rangerMesh);

  const kikiMesh = createCaptiveMesh('fox_kit', 0xf97316, palette);
  kikiMesh.position.set(117.0, getArchipelagoGroundY(117.0, 46.8), 46.8);
  kikiMesh.visible = false;
  group.add(kikiMesh);

  const kid1 = createVillagerMesh(palette, 'village_kid', {
    shirtHex: 0x16a34a,
    accentHex: 0xfacc15,
  });
  const kid2 = createVillagerMesh(palette, 'schoolgirl', {
    hairHex: 0xf97316,
    pantsHex: 0x15803d,
  });
  kid1.x = 100.0;
  kid1.z = 52.0;
  kid2.x = 103.5;
  kid2.z = 54.0;
  kid1.root.position.set(kid1.x, getArchipelagoGroundY(kid1.x, kid1.z), kid1.z);
  kid2.root.position.set(kid2.x, getArchipelagoGroundY(kid2.x, kid2.z), kid2.z);
  kid1.root.visible = false;
  kid2.root.visible = false;
  group.add(kid1.root, kid2.root);

  const mayaFlash = createVillagerMesh(palette, 'zoo_keeper', {
    shirtHex: 0x15803d,
    pantsHex: 0x78350f,
    accentHex: 0xfbbf24,
  });
  disposables.push(...attachRefugeeBandage(mayaFlash, palette, false));
  mayaFlash.root.visible = false;
  group.add(mayaFlash.root);

  const rakaFlash = createVillagerMesh(palette, 'ranger_guide', {
    shirtHex: 0x0f766e,
    pantsHex: 0x451a03,
    accentHex: 0x22c55e,
  });
  disposables.push(...attachRefugeeBandage(rakaFlash, palette, false));
  rakaFlash.root.visible = false;
  group.add(rakaFlash.root);

  // 5. Glowing directional route pillars for the 3-step route-guidance film
  const pillarGeo = new THREE.CylinderGeometry(0.42, 0.72, 4.8, 8);
  const ringGeo = new THREE.TorusGeometry(1.15, 0.14, 6, 16);
  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  disposables.push(pillarGeo, ringGeo, beaconMat);

  const markerCoords: Array<[number, number]> = [
    [-18.0, 62.5], // Bridge Desa North
    [32.0, 22.0], // Citadel East Turn
    [65.0, 36.5], // Bridge Satwa Arrival
  ];
  const guideMarkers = markerCoords.map(([mx, mz]) => {
    const mg = new THREE.Group();
    const pillar = new THREE.Mesh(pillarGeo, beaconMat);
    pillar.position.y = 2.4;
    const ring = new THREE.Mesh(ringGeo, beaconMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.25;
    mg.add(pillar, ring);
    mg.position.set(mx, getArchipelagoGroundY(mx, mz), mz);
    mg.visible = false;
    group.add(mg);
    return mg;
  });

  return {
    group,
    bossMesh,
    wolves,
    trollMesh,
    rangerMesh,
    kikiMesh,
    fleeingKids: [kid1, kid2],
    mayaFlash,
    rakaFlash,
    mistMeshes,
    thornSpikes,
    guideMarkers,
    disposables,
  };
}

export function disposeHutanSatwaFlashbackStage(stage: HutanSatwaFlashbackStage): void {
  if (stage.group.parent) {
    stage.group.parent.remove(stage.group);
  }
  stage.disposables.forEach((d) => d.dispose());
  stage.group.traverse((obj) => {
    if (obj instanceof THREE.Mesh && !obj.geometry.userData?.shared) {
      obj.geometry.dispose();
    }
  });
}

export interface DesaRestingSurvivorsRig {
  group: THREE.Group;
  maya: VillagerActor;
  raka: VillagerActor;
  disposables: Array<{ dispose: () => void }>;
}

export function buildDesaRestingSurvivorsRig(
  palette: MaterialPalette,
): DesaRestingSurvivorsRig {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const maya = createVillagerMesh(palette, 'zoo_keeper', {
    shirtHex: 0x15803d,
    pantsHex: 0x78350f,
    accentHex: 0xfbbf24,
  });
  disposables.push(...attachRefugeeBandage(maya, palette, true));
  maya.displayName = 'Maya (Penyintas Hutan Satwa)';
  maya.roleBadge = 'Berobat di Desa';
  const my = getArchipelagoGroundY(DESA_HEALING_SHELTER_SPOTS.maya.x, DESA_HEALING_SHELTER_SPOTS.maya.z);
  maya.x = DESA_HEALING_SHELTER_SPOTS.maya.x;
  maya.z = DESA_HEALING_SHELTER_SPOTS.maya.z;
  maya.yaw = DESA_HEALING_SHELTER_SPOTS.maya.yaw;
  maya.root.position.set(maya.x, my, maya.z);
  maya.root.rotation.y = maya.yaw;
  group.add(maya.root);

  const raka = createVillagerMesh(palette, 'ranger_guide', {
    shirtHex: 0x0f766e,
    pantsHex: 0x451a03,
    accentHex: 0x22c55e,
  });
  disposables.push(...attachRefugeeBandage(raka, palette, false));
  raka.displayName = 'Raka (Penyintas Hutan Satwa)';
  raka.roleBadge = 'Berobat di Desa';
  const ry = getArchipelagoGroundY(DESA_HEALING_SHELTER_SPOTS.raka.x, DESA_HEALING_SHELTER_SPOTS.raka.z);
  raka.x = DESA_HEALING_SHELTER_SPOTS.raka.x;
  raka.z = DESA_HEALING_SHELTER_SPOTS.raka.z;
  raka.yaw = DESA_HEALING_SHELTER_SPOTS.raka.yaw;
  raka.root.position.set(raka.x, ry, raka.z);
  raka.root.rotation.y = raka.yaw;
  group.add(raka.root);

  // Cozy herbal bamboo mat + medicine bowl + warm lantern bottle right between them
  const cx = DESA_HEALING_SHELTER_SPOTS.camp.x;
  const cz = DESA_HEALING_SHELTER_SPOTS.camp.z;
  const cy = getArchipelagoGroundY(cx, cz);

  const matGeo = new THREE.BoxGeometry(2.6, 0.08, 1.8);
  const rimGeo = new THREE.BoxGeometry(2.74, 0.06, 1.94);
  const bowlGeo = new THREE.CylinderGeometry(0.26, 0.18, 0.18, 8);
  const herbGeo = new THREE.BoxGeometry(0.22, 0.1, 0.22);
  const flaskGeo = new THREE.BoxGeometry(0.2, 0.36, 0.2);
  disposables.push(matGeo, rimGeo, bowlGeo, herbGeo, flaskGeo);

  const wovenMat = new THREE.Mesh(matGeo, palette.getMat(0xd97706, 'matte'));
  wovenMat.position.set(cx, cy + 0.04, cz);
  wovenMat.rotation.y = 0.32;
  const matRim = new THREE.Mesh(rimGeo, palette.getMat(0x78350f, 'matte'));
  matRim.position.set(cx, cy + 0.02, cz);
  matRim.rotation.y = 0.32;

  const bowl = new THREE.Mesh(bowlGeo, palette.getMat(0x9a3412, 'matte'));
  bowl.position.set(cx - 0.15, cy + 0.16, cz + 0.1);
  const herbFill = new THREE.Mesh(herbGeo, palette.getMat(0x22c55e, 'emissive'));
  herbFill.position.set(cx - 0.15, cy + 0.24, cz + 0.1);
  const flask = new THREE.Mesh(flaskGeo, palette.getMat(0x38bdf8, 'gloss'));
  flask.position.set(cx + 0.3, cy + 0.22, cz - 0.12);

  group.add(matRim, wovenMat, bowl, herbFill, flask);

  return { group, maya, raka, disposables };
}

export function disposeDesaRestingSurvivorsRig(rig: DesaRestingSurvivorsRig): void {
  if (rig.group.parent) {
    rig.group.parent.remove(rig.group);
  }
  rig.disposables.forEach((d) => d.dispose());
  rig.group.traverse((obj) => {
    if (obj instanceof THREE.Mesh && !obj.geometry.userData?.shared) {
      obj.geometry.dispose();
    }
  });
}

export function animateInjuredLimping(
  actor: VillagerActor,
  elapsed: number,
  walkSpeed: number,
  phaseOffset = 0,
): void {
  const blink = computeBlinkScale(elapsed, phaseOffset);
  actor.leftEye.scale.y = blink;
  actor.rightEye.scale.y = blink;
  if (walkSpeed > 0.2) {
    const w = elapsed * (5.2 + walkSpeed * 1.1) + phaseOffset;
    const limp = Math.sin(w) * 0.44 + 0.12;
    actor.leftLeg.rotation.x = limp;
    actor.rightLeg.rotation.x = -limp * 0.65;
    actor.leftArm.rotation.x = -0.35 + Math.sin(w) * 0.25;
    // Holding injured right arm close to chest
    actor.rightArm.rotation.x = -1.05;
    actor.rightArm.rotation.z = 0.28;
    actor.bodyPivot.rotation.z = Math.sin(w) * 0.08;
    actor.headGroup.rotation.x = 0.16 + Math.abs(Math.sin(w)) * 0.08;
  } else {
    // Exhausted panting & cradling injured arm
    const pant = Math.sin(elapsed * 4.4 + phaseOffset);
    actor.leftLeg.rotation.x = 0;
    actor.rightLeg.rotation.x = 0;
    actor.bodyPivot.rotation.z = 0.05;
    actor.bodyPivot.position.y = -0.06 + pant * 0.025;
    actor.headGroup.rotation.x = 0.22 + pant * 0.05;
    actor.leftArm.rotation.x = -0.45 + pant * 0.08;
    actor.rightArm.rotation.x = -1.08;
    actor.rightArm.rotation.z = 0.26;
  }
}

export function animateRestingHealing(
  actor: VillagerActor,
  elapsed: number,
  phaseOffset: number,
  heroDist: number,
  heroX: number,
  heroZ: number,
): void {
  const blink = computeBlinkScale(elapsed, phaseOffset);
  actor.leftEye.scale.y = blink;
  actor.rightEye.scale.y = blink;
  const breath = Math.sin(elapsed * 2.1 + phaseOffset);
  actor.leftLeg.rotation.x = -0.18;
  actor.rightLeg.rotation.x = 0.14;
  actor.bodyPivot.position.y = -0.08 + breath * 0.015;
  actor.bodyPivot.rotation.z = breath * 0.025;
  actor.rightArm.rotation.x = -0.95;
  actor.rightArm.rotation.z = 0.22;

  if (heroDist < 6.5) {
    // Turn head toward Hero warmly and wave gently with healthy left hand
    const targetYaw = Math.atan2(heroX - actor.x, heroZ - actor.z);
    actor.root.rotation.y = targetYaw;
    actor.headGroup.rotation.x = -0.04 + Math.sin(elapsed * 2.4 + phaseOffset) * 0.05;
    actor.leftArm.rotation.x = -1.75 + Math.sin(elapsed * 5.2 + phaseOffset) * 0.25;
    actor.leftArm.rotation.z = 0.25;
  } else {
    actor.root.rotation.y = actor.yaw;
    actor.headGroup.rotation.x = 0.12 + breath * 0.04;
    actor.leftArm.rotation.x = -0.25;
    actor.leftArm.rotation.z = actor.baseLeftArmZ;
  }
}

export function animateFlashbackCutsceneRig(
  stage: HutanSatwaFlashbackStage,
  beat: HutanSatwaRefugeeBeat,
  t: number,
  elapsed: number,
  dt: number,
): void {
  const showMist =
    beat === 'flashback_mist' ||
    beat === 'flashback_siege' ||
    beat === 'flashback_kiki' ||
    beat === 'flashback_escape';
  const mistOpacity =
    beat === 'flashback_mist'
      ? Math.min(0.68, t * 0.28)
      : showMist
      ? 0.68
      : 0;
  stage.mistMeshes.forEach((entry, idx) => {
    entry.mesh.visible = mistOpacity > 0.02;
    if (entry.mesh.visible) {
      entry.mesh.position.set(
        entry.baseX + Math.sin(elapsed * 0.75 + entry.phase) * 2.6,
        entry.baseY + Math.cos(elapsed * 0.55 + entry.phase) * 0.6,
        entry.baseZ + Math.cos(elapsed * 0.68 + entry.phase) * 2.2,
      );
      entry.mesh.rotation.y += dt * (0.14 + idx * 0.04);
      const mat = entry.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = mistOpacity;
    }
  });

  const showThorns = beat === 'flashback_siege' || beat === 'flashback_kiki' || beat === 'flashback_escape';
  stage.thornSpikes.forEach((spike, i) => {
    spike.visible = showThorns;
    if (showThorns) {
      const baseY = getArchipelagoGroundY(spike.position.x, spike.position.z);
      const rise = beat === 'flashback_siege' ? Math.min(1, t / 1.1) : 1;
      spike.position.y = baseY - 1.3 + rise * (2.3 + (i % 2) * 0.25);
    }
  });

  // Hide flashback actors by default; enable per beat
  stage.bossMesh.visible = false;
  stage.trollMesh.visible = false;
  stage.wolves.forEach((w) => {
    w.visible = false;
  });
  stage.rangerMesh.visible = false;
  stage.kikiMesh.visible = false;
  stage.fleeingKids.forEach((k) => {
    k.root.visible = false;
  });
  stage.mayaFlash.root.visible = false;
  stage.rakaFlash.root.visible = false;
  stage.guideMarkers.forEach((gm, idx) => {
    const activeGuide =
      (beat === 'guide_desa_exit' && idx === 0) ||
      (beat === 'guide_citadel_cross' && idx === 1) ||
      (beat === 'guide_satwa_arrival' && idx === 2);
    gm.visible = activeGuide;
    if (activeGuide) {
      gm.rotation.y += dt * 2.1;
      const pulse = 1 + Math.sin(elapsed * 4.5) * 0.14;
      gm.children[1]?.scale.setScalar(pulse);
    }
  });

  if (beat === 'flashback_mist') {
    stage.rangerMesh.visible = true;
    stage.kikiMesh.visible = true;
    stage.fleeingKids.forEach((k) => {
      k.root.visible = true;
    });

    stage.rangerMesh.position.set(104.5, getArchipelagoGroundY(104.5, 49.0), 49.0);
    stage.rangerMesh.rotation.y = Math.sin(elapsed * 1.4) * 0.45;
    animateZoneNpc(stage.rangerMesh, elapsed, 0.55, false, dt, 'stand');

    stage.kikiMesh.position.set(106.5, getArchipelagoGroundY(106.5, 50.4), 50.4);
    stage.kikiMesh.rotation.y = -0.5;
    animateCaptiveMesh(stage.kikiMesh, elapsed, 'sad_injured');

    stage.fleeingKids.forEach((k, idx) => {
      const kx = idx === 0 ? 100.5 : 108.5;
      const kz = idx === 0 ? 52.0 : 47.0;
      k.root.position.set(kx, getArchipelagoGroundY(kx, kz), kz);
      k.root.rotation.y = Math.sin(elapsed * 2.2 + idx) * 0.6;
      animateInjuredLimping(k, elapsed, 0, idx * 1.3);
    });
  } else if (beat === 'flashback_siege') {
    stage.bossMesh.visible = true;
    stage.trollMesh.visible = true;
    stage.wolves[0].visible = true;
    stage.rangerMesh.visible = true;
    stage.fleeingKids.forEach((k) => {
      k.root.visible = true;
    });

    const bx = 110.5;
    const bz = 47.0;
    stage.bossMesh.position.set(bx, getArchipelagoGroundY(bx, bz), bz);
    stage.bossMesh.rotation.y = -1.25;
    animateMonsterRig(stage.bossMesh, {
      mode: 'taunt',
      elapsed,
      phase: 0.4,
      dt,
    });

    const tx = 105.0;
    const tz = 53.0;
    stage.trollMesh.position.set(tx, getArchipelagoGroundY(tx, tz), tz);
    stage.trollMesh.rotation.y = -1.1;
    animateMonsterRig(stage.trollMesh, {
      mode: 'attack',
      elapsed,
      phase: 1.2,
      attackProgress: (elapsed * 0.9) % 1,
      dt,
    });

    const wx = 100.5 + Math.sin(elapsed * 2.8) * 1.6;
    const wz = 45.0 + Math.cos(elapsed * 2.4) * 1.2;
    stage.wolves[0].position.set(wx, getArchipelagoGroundY(wx, wz), wz);
    stage.wolves[0].rotation.y = -1.4;
    animateMonsterRig(stage.wolves[0], {
      mode: 'patrol',
      speed: 4.5,
      walkPhase: elapsed * 10,
      elapsed,
      dt,
    });

    // Fleeing kids run west down the trail in panic
    stage.fleeingKids.forEach((k, idx) => {
      const p = Math.min(1, t / 3.8);
      const kx = THREE.MathUtils.lerp(103.5 - idx * 2, 89.0 - idx * 2.5, p);
      const kz = 49.5 + (idx === 0 ? 1.8 : -1.6);
      k.root.position.set(kx, getArchipelagoGroundY(kx, kz), kz);
      k.root.rotation.y = -Math.PI / 2;
      const sw = Math.sin(elapsed * 13 + idx) * 0.72;
      k.leftLeg.rotation.x = sw;
      k.rightLeg.rotation.x = -sw;
      k.leftArm.rotation.x = -2.1;
      k.rightArm.rotation.x = -2.1;
    });

    stage.rangerMesh.position.set(114.2, getArchipelagoGroundY(114.2, 48.0), 48.0);
    stage.rangerMesh.rotation.y = -Math.PI / 2;
    animateZoneNpc(stage.rangerMesh, elapsed, 0.9, false, dt, 'stand');
  } else if (beat === 'flashback_kiki') {
    stage.bossMesh.visible = true;
    stage.wolves[0].visible = true;
    stage.rangerMesh.visible = true;
    stage.kikiMesh.visible = true;

    const bx = 119.5;
    const bz = 46.0;
    stage.bossMesh.position.set(bx, getArchipelagoGroundY(bx, bz), bz);
    stage.bossMesh.rotation.y = Math.atan2(114 - bx, 48 - bz);
    animateMonsterRig(stage.bossMesh, { mode: 'angry', elapsed, dt });

    // Kiki dragged steadily east toward Tiger Head Cave
    const dragP = Math.min(1, t / 4.2);
    const kx = THREE.MathUtils.lerp(116.0, 134.0, dragP);
    const kz = THREE.MathUtils.lerp(47.0, 43.2, dragP);
    stage.kikiMesh.position.set(kx, getArchipelagoGroundY(kx, kz), kz);
    stage.kikiMesh.rotation.y = -Math.PI / 2;
    animateCaptiveMesh(stage.kikiMesh, elapsed, 'sad_injured');

    // Wolf snaps beside Kiki
    const wx = kx - 1.6;
    const wz = kz + 1.5;
    stage.wolves[0].position.set(wx, getArchipelagoGroundY(wx, wz), wz);
    stage.wolves[0].rotation.y = Math.PI / 2;
    animateMonsterRig(stage.wolves[0], {
      mode: 'patrol',
      speed: 3.8,
      walkPhase: elapsed * 9,
      elapsed,
      dt,
    });

    // Ranger Rimba lunges forward then stumbles helplessly
    const rx = THREE.MathUtils.lerp(111.5, 114.8, Math.min(1, t / 1.4));
    const rz = 48.2;
    stage.rangerMesh.position.set(rx, getArchipelagoGroundY(rx, rz), rz);
    stage.rangerMesh.rotation.y = Math.PI / 2;
    animateZoneNpc(stage.rangerMesh, elapsed, 0.4, false, dt, 'stand');
  } else if (beat === 'flashback_escape') {
    stage.mayaFlash.root.visible = true;
    stage.rakaFlash.root.visible = true;
    stage.wolves[1].visible = true;

    const runP = Math.min(1, t / 4.2);
    const mx = THREE.MathUtils.lerp(92.0, 66.5, runP);
    const mz = THREE.MathUtils.lerp(47.2, 37.2, runP);
    stage.mayaFlash.x = mx;
    stage.mayaFlash.z = mz;
    stage.mayaFlash.root.position.set(mx, getArchipelagoGroundY(mx, mz), mz);
    stage.mayaFlash.root.rotation.y = Math.atan2(66.5 - 92.0, 37.2 - 47.2);
    animateInjuredLimping(stage.mayaFlash, elapsed, 4.6, 0.2);

    const rx = mx + 1.8;
    const rz = mz + 1.4;
    stage.rakaFlash.x = rx;
    stage.rakaFlash.z = rz;
    stage.rakaFlash.root.position.set(rx, getArchipelagoGroundY(rx, rz), rz);
    stage.rakaFlash.root.rotation.y = stage.mayaFlash.root.rotation.y;
    animateInjuredLimping(stage.rakaFlash, elapsed, 4.8, 1.4);

    // Chasing dire wolf right behind them
    const wx = mx + 5.8;
    const wz = mz + 2.4;
    stage.wolves[1].position.set(wx, getArchipelagoGroundY(wx, wz), wz);
    stage.wolves[1].rotation.y = stage.mayaFlash.root.rotation.y;
    animateMonsterRig(stage.wolves[1], {
      mode: 'patrol',
      speed: 5.5,
      walkPhase: elapsed * 13,
      elapsed,
      dt,
    });
  } else if (beat === 'guide_desa_exit') {
    // Show Raka & Maya pointing along northern footpath to Bridge Desa (-18, 62.5)
    stage.mayaFlash.root.visible = true;
    stage.rakaFlash.root.visible = true;
    const stepP = Math.min(1, t / 3.8);
    const rx = THREE.MathUtils.lerp(-5.0, -17.5, stepP);
    const rz = THREE.MathUtils.lerp(86.0, 64.5, stepP);
    stage.rakaFlash.x = rx;
    stage.rakaFlash.z = rz;
    stage.rakaFlash.root.position.set(rx, getArchipelagoGroundY(rx, rz), rz);
    stage.rakaFlash.root.rotation.y = Math.atan2(-18 - -5, 62.5 - 86);
    animateInjuredLimping(stage.rakaFlash, elapsed, stepP < 0.92 ? 3.2 : 0, 0.3);

    const mx = rx + 1.7;
    const mz = rz + 1.1;
    stage.mayaFlash.x = mx;
    stage.mayaFlash.z = mz;
    stage.mayaFlash.root.position.set(mx, getArchipelagoGroundY(mx, mz), mz);
    stage.mayaFlash.root.rotation.y = stage.rakaFlash.root.rotation.y;
    animateInjuredLimping(stage.mayaFlash, elapsed, stepP < 0.92 ? 3.2 : 0, 1.1);
  } else if (beat === 'guide_citadel_cross') {
    stage.rakaFlash.root.visible = true;
    const crossP = Math.min(1, t / 3.8);
    const rx = THREE.MathUtils.lerp(-18.0, 32.0, crossP);
    const rz = THREE.MathUtils.lerp(24.0, 22.0, crossP);
    stage.rakaFlash.x = rx;
    stage.rakaFlash.z = rz;
    stage.rakaFlash.root.position.set(rx, getArchipelagoGroundY(rx, rz), rz);
    stage.rakaFlash.root.rotation.y = Math.PI / 2;
    animateInjuredLimping(stage.rakaFlash, elapsed, crossP < 0.92 ? 3.8 : 0, 0.4);
  } else if (beat === 'guide_satwa_arrival') {
    stage.rakaFlash.root.visible = true;
    const arrP = Math.min(1, t / 3.8);
    const rx = THREE.MathUtils.lerp(48.0, 79.0, arrP);
    const rz = THREE.MathUtils.lerp(18.0, 42.0, arrP);
    stage.rakaFlash.x = rx;
    stage.rakaFlash.z = rz;
    stage.rakaFlash.root.position.set(rx, getArchipelagoGroundY(rx, rz), rz);
    stage.rakaFlash.root.rotation.y = Math.atan2(79 - 48, 42 - 18);
    animateInjuredLimping(stage.rakaFlash, elapsed, arrP < 0.92 ? 3.6 : 0, 0.2);
  }
}
