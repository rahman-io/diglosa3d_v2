import * as THREE from 'three';
import { WeaponId } from '../types/game';
import { MaterialPalette } from './materials';

function beveledExtrude(
  points: Array<[number, number]>,
  thickness: number,
  bevelSize = 0.014,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  points.forEach(([x, y], idx) => {
    if (idx === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: bevelSize,
    bevelSize,
    bevelSegments: 2,
    steps: 1,
  });
  // Center Z depth around 0 so the profile lies in the X-Y side plane? Wait:
  // Shape is X (length/Z after Y-rotation) & Y (height). Center along extrusion axis Z.
  geo.translate(0, 0, -thickness / 2);
  // Rotate -90 deg around Y so Shape +X maps to +Z (barrel forward!) and Shape Z becomes thin X width.
  geo.rotateY(-Math.PI / 2);
  return geo;
}

function addAngledGrip(
  group: THREE.Group,
  gripMat: THREE.Material,
  accentMat: THREE.Material,
  guardMat: THREE.Material,
  zPos = -0.16,
  yPos = -0.16,
): void {
  const gripGeo = beveledExtrude(
    [
      [-0.08, 0.14],
      [0.09, 0.14],
      [0.02, -0.19],
      [-0.14, -0.17],
    ],
    0.09,
    0.012,
  );
  const grip = new THREE.Mesh(gripGeo, gripMat);
  grip.position.set(0, yPos, zPos);

  const pommel = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.045, 0.19), accentMat);
  pommel.position.set(0, yPos - 0.19, zPos - 0.06);

  // Trigger guard + trigger
  const guardBottom = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.024, 0.15), guardMat);
  guardBottom.position.set(0, yPos + 0.01, zPos + 0.12);
  const guardFront = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.11, 0.024), guardMat);
  guardFront.position.set(0, yPos + 0.06, zPos + 0.19);
  const trigger = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.065, 0.022), accentMat);
  trigger.position.set(0, yPos + 0.075, zPos + 0.11);
  trigger.rotation.x = 0.35;

  group.add(grip, pommel, guardBottom, guardFront, trigger);
}

/**
 * Creates a stylized, Roblox-grade composite 3D weapon model oriented along +Z (forward).
 * Each of the 8 WeaponIds has a distinct silhouette, beveled extrusions, and PBR materials.
 */
export function createWeaponMesh(
  weaponId: WeaponId,
  palette: MaterialPalette,
  scale = 1,
): THREE.Group {
  const root = new THREE.Group();
  const gun = new THREE.Group();
  root.add(gun);

  const gunmetal = palette.getMat(0x334155, 'metal');
  const darkPoly = palette.getMat(0x1e293b, 'matte');
  const charcoal = palette.getMat(0x0f172a, 'matte');
  const chrome = palette.getMat(0xe2e8f0, 'metal');
  const silver = palette.getMat(0x94a3b8, 'metal');
  const gold = palette.getMat(0xfbbf24, 'metal');
  const warmGold = palette.getMat(0xf59e0b, 'metal');

  if (weaponId === 'ketapel') {
    // 1. Tactical Cyber-Pistol (inspired by Roblox classic M9/Rivals Blaster)
    const cyan = palette.getMat(0x0ea5e9, 'metal');
    const glow = palette.getMat(0x4fd8ff, 'emissive');
    addAngledGrip(gun, charcoal, chrome, gunmetal, -0.17, -0.15);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.11, 0.54), darkPoly);
    frame.position.set(0, 0.01, 0.02);

    const slideGeo = beveledExtrude(
      [
        [-0.27, -0.05],
        [0.24, -0.05],
        [0.27, 0.04],
        [0.21, 0.085],
        [-0.25, 0.085],
        [-0.28, 0.02],
      ],
      0.135,
      0.014,
    );
    const slide = new THREE.Mesh(slideGeo, chrome);
    slide.position.set(0, 0.1, 0.02);

    // Side cyan energy ribs + core window
    const ribL = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.055, 0.28), cyan);
    ribL.position.set(0, 0.105, 0.04);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.046, 0.18, 12), gunmetal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.105, 0.34);

    const muzzleRing = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.014, 8, 16), glow);
    muzzleRing.position.set(0, 0.105, 0.43);

    const underCore = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.19), glow);
    underCore.position.set(0, -0.035, 0.17);

    const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.04, 0.045), charcoal);
    rearSight.position.set(0, 0.2, -0.2);
    const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.045, 0.045), glow);
    frontSight.position.set(0, 0.2, 0.23);

    gun.add(frame, slide, ribL, barrel, muzzleRing, underCore, rearSight, frontSight);
  } else if (weaponId === 'kerikil') {
    // 2. Heavy Chrome & Slate Combat Shotgun (inspired by Roblox pump shotgun)
    const orange = palette.getMat(0xf97316, 'gloss');
    const glow = palette.getMat(0xe2e8f0, 'emissive');
    addAngledGrip(gun, darkPoly, silver, gunmetal, -0.18, -0.15);

    // Angled compact stock behind grip
    const stockGeo = beveledExtrude(
      [
        [0, 0.06],
        [0, -0.06],
        [-0.28, -0.13],
        [-0.31, 0.03],
      ],
      0.11,
      0.012,
    );
    const stock = new THREE.Mesh(stockGeo, darkPoly);
    stock.position.set(0, 0.01, -0.24);

    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.42), gunmetal);
    receiver.position.set(0, 0.055, -0.01);

    const shellAccent = new THREE.Mesh(new THREE.BoxGeometry(0.175, 0.045, 0.09), orange);
    shellAccent.position.set(0, 0.06, 0.03);

    // Upper barrel + lower magazine tube
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.56, 12), chrome);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.095, 0.44);

    const magTube = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.48, 10), silver);
    magTube.rotation.x = Math.PI / 2;
    magTube.position.set(0, 0.015, 0.4);

    // Ribbed pump forend
    const pump = new THREE.Mesh(new THREE.BoxGeometry(0.145, 0.11, 0.24), charcoal);
    pump.position.set(0, 0.015, 0.36);

    const muzzleTip = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.054, 0.05, 12), glow);
    muzzleTip.rotation.x = Math.PI / 2;
    muzzleTip.position.set(0, 0.095, 0.72);

    const frontBead = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.03), orange);
    frontBead.position.set(0, 0.155, 0.68);

    gun.add(stock, receiver, shellAccent, barrel, magTube, pump, muzzleTip, frontBead);
  } else if (weaponId === 'emas') {
    // 3. Royal Golden Hand-Cannon Revolver
    const ivory = palette.getMat(0xfef3c7, 'gloss');
    const glow = palette.getMat(0xffd24a, 'emissive');
    addAngledGrip(gun, ivory, gold, warmGold, -0.2, -0.15);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.34), warmGold);
    frame.position.set(0, 0.02, -0.02);

    // Fluted golden cylinder drum
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.18, 8), gold);
    drum.rotation.x = Math.PI / 2;
    drum.position.set(0, 0.09, 0.03);

    const drumBand = new THREE.Mesh(new THREE.CylinderGeometry(0.112, 0.112, 0.04, 16), glow);
    drumBand.rotation.x = Math.PI / 2;
    drumBand.position.set(0, 0.09, 0.03);

    // Heavy octagonal long barrel with top vent rib
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.058, 0.44, 6), gold);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.105, 0.35);

    const underLug = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.34), ivory);
    underLug.position.set(0, 0.035, 0.31);

    const topRib = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.045, 0.42), ivory);
    topRib.position.set(0, 0.165, 0.33);

    const muzzleSun = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), glow);
    muzzleSun.position.set(0, 0.105, 0.59);

    const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.06), chrome);
    hammer.position.set(0, 0.155, -0.15);
    hammer.rotation.x = -0.45;

    gun.add(frame, drum, drumBand, barrel, underLug, topRib, muzzleSun, hammer);
  } else if (weaponId === 'saus') {
    // 4. Crimson & Flame Rotary Drum Blaster (inspired by Roblox Red Drum Launcher)
    const crimson = palette.getMat(0xdc2626, 'gloss');
    const glow = palette.getMat(0xff7a3a, 'emissive');
    addAngledGrip(gun, charcoal, crimson, gunmetal, -0.22, -0.15);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.44), gunmetal);
    body.position.set(0, 0.06, -0.02);

    // Big signature rotary drum magazine
    const drumOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.19, 14), crimson);
    drumOuter.rotation.z = Math.PI / 2;
    drumOuter.position.set(0, -0.06, 0.12);

    const drumCore = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.21, 12), glow);
    drumCore.rotation.z = Math.PI / 2;
    drumCore.position.set(0, -0.06, 0.12);

    const shroud = new THREE.Mesh(new THREE.BoxGeometry(0.185, 0.14, 0.24), crimson);
    shroud.position.set(0, 0.08, 0.27);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.072, 0.22, 12), silver);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.08, 0.45);

    const flareMuzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.086, 0.056, 0.09, 12), glow);
    flareMuzzle.rotation.x = Math.PI / 2;
    flareMuzzle.position.set(0, 0.08, 0.58);

    const reflexSight = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.12), darkPoly);
    reflexSight.position.set(0, 0.18, 0.02);
    const reflexDot = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.02), glow);
    reflexDot.position.set(0, 0.2, 0.04);

    gun.add(body, drumOuter, drumCore, shroud, barrel, flareMuzzle, reflexSight, reflexDot);
  } else if (weaponId === 'biji') {
    // 5. Emerald Forest Precision Sniper Rifle (inspired by Neon-Green Sniper in screenshot)
    const emerald = palette.getMat(0x22c55e, 'gloss');
    const glow = palette.getMat(0x7cf04a, 'emissive');
    addAngledGrip(gun, charcoal, emerald, gunmetal, -0.22, -0.15);

    const stockGeo = beveledExtrude(
      [
        [0, 0.09],
        [0, -0.07],
        [-0.3, -0.11],
        [-0.3, 0.09],
      ],
      0.11,
      0.012,
    );
    const stock = new THREE.Mesh(stockGeo, emerald);
    stock.position.set(0, 0.04, -0.26);

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.58), darkPoly);
    chassis.position.set(0, 0.04, 0.05);

    const sideStrip = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.045, 0.48), emerald);
    sideStrip.position.set(0, 0.06, 0.06);

    const longBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.042, 0.62, 10), gunmetal);
    longBarrel.rotation.x = Math.PI / 2;
    longBarrel.position.set(0, 0.08, 0.56);

    const suppressor = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.22, 12), emerald);
    suppressor.rotation.x = Math.PI / 2;
    suppressor.position.set(0, 0.08, 0.84);

    const muzzleGlow = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.015, 8, 16), glow);
    muzzleGlow.position.set(0, 0.08, 0.96);

    // Telescopic Sniper Scope
    const scopeTube = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.046, 0.36, 12), charcoal);
    scopeTube.rotation.x = Math.PI / 2;
    scopeTube.position.set(0, 0.2, 0.04);
    const scopeLensF = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.052, 0.07, 12), glow);
    scopeLensF.rotation.x = Math.PI / 2;
    scopeLensF.position.set(0, 0.2, 0.23);

    // Folded front bipod struts
    const bipodL = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 6), silver);
    bipodL.rotation.x = Math.PI / 2;
    bipodL.position.set(-0.07, -0.02, 0.44);
    const bipodR = bipodL.clone();
    bipodR.position.x = 0.07;

    gun.add(
      stock,
      chassis,
      sideStrip,
      longBarrel,
      suppressor,
      muzzleGlow,
      scopeTube,
      scopeLensF,
      bipodL,
      bipodR,
    );
  } else if (weaponId === 'kertas') {
    // 6. Aero-Titanium Sky Railgun (futuristic split-rail rifle)
    const skyBlue = palette.getMat(0x0284c7, 'metal');
    const glow = palette.getMat(0x7fdcff, 'emissive');
    addAngledGrip(gun, darkPoly, skyBlue, chrome, -0.2, -0.15);

    const bodyGeo = beveledExtrude(
      [
        [-0.45, -0.07],
        [0.24, -0.07],
        [0.29, 0.09],
        [-0.36, 0.11],
        [-0.47, 0.04],
      ],
      0.13,
      0.016,
    );
    const body = new THREE.Mesh(bodyGeo, chrome);
    body.position.set(0, 0.05, -0.06);

    // Upper & lower electromagnetic accelerator rails
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.048, 0.56), skyBlue);
    topRail.position.set(0, 0.14, 0.36);
    const botRail = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.052, 0.52), gunmetal);
    botRail.position.set(0, 0.01, 0.34);

    // Exposed glowing plasma core floating between rails
    const plasmaRod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.52, 10), glow);
    plasmaRod.rotation.x = Math.PI / 2;
    plasmaRod.position.set(0, 0.075, 0.38);

    // Twin cooling coils along the front barrel
    const coil1 = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.016, 8, 16), glow);
    coil1.position.set(0, 0.075, 0.44);
    const coil2 = coil1.clone();
    coil2.position.z = 0.58;

    // Holographic wing optic
    const holoFrame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.13), charcoal);
    holoFrame.position.set(0, 0.2, -0.02);
    const holoScreen = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.02), glow);
    holoScreen.position.set(0, 0.21, 0.02);

    gun.add(body, topRail, botRail, plasmaRod, coil1, coil2, holoFrame, holoScreen);
  } else if (weaponId === 'jarum') {
    // 7. Heavy Triple-Barrel Gatling Cannon (Amber & Gunmetal)
    const hazard = palette.getMat(0xf59e0b, 'metal');
    const glow = palette.getMat(0xffb347, 'emissive');
    addAngledGrip(gun, charcoal, hazard, gunmetal, -0.22, -0.15);

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.46), darkPoly);
    chassis.position.set(0, 0.07, -0.02);

    const armorTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.34), hazard);
    armorTop.position.set(0, 0.19, 0.02);

    // Underslung heavy fusion canister
    const cell = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.26, 12), glow);
    cell.rotation.x = Math.PI / 2;
    cell.position.set(0, -0.07, 0.1);

    // Top heavy carry handle bar
    const handleBar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.28), silver);
    handleBar.position.set(0, 0.27, 0.02);
    const handlePostF = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.045), silver);
    handlePostF.position.set(0, 0.23, 0.14);
    const handlePostB = handlePostF.clone();
    handlePostB.position.z = -0.1;

    // 3-barrel rotary cluster + clamp rings
    const barrelOffsets: Array<[number, number]> = [
      [0, 0.11],
      [-0.055, 0.02],
      [0.055, 0.02],
    ];
    barrelOffsets.forEach(([bx, by]) => {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.56, 8), chrome);
      b.rotation.x = Math.PI / 2;
      b.position.set(bx, by, 0.46);
      gun.add(b);
    });

    const clampMid = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 12), gunmetal);
    clampMid.rotation.x = Math.PI / 2;
    clampMid.position.set(0, 0.06, 0.44);

    const clampTip = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.055, 12), glow);
    clampTip.rotation.x = Math.PI / 2;
    clampTip.position.set(0, 0.06, 0.68);

    gun.add(chassis, armorTop, cell, handleBar, handlePostF, handlePostB, clampMid, clampTip);
  } else {
    // 8. 'kristal': Obsidian & Glowing Amethyst Crystal Fang Blaster (inspired by Roblox purple crystal gun in screenshot!)
    const obsidian = palette.getMat(0x1e1b2e, 'metal');
    const violet = palette.getMat(0x7c3aed, 'gloss');
    const glow = palette.getMat(0xc084fc, 'emissive');
    addAngledGrip(gun, violet, obsidian, gunmetal, -0.19, -0.15);

    // Jagged obsidian beveled housing
    const bodyGeo = beveledExtrude(
      [
        [-0.3, -0.06],
        [0.34, -0.02],
        [0.44, 0.1],
        [0.14, 0.16],
        [-0.22, 0.14],
        [-0.34, 0.04],
      ],
      0.16,
      0.018,
    );
    const body = new THREE.Mesh(bodyGeo, obsidian);
    body.position.set(0, 0.04, 0.02);

    // Signature jagged glowing purple crystal fang blade beneath barrel (like screenshot!)
    const fangGeo = beveledExtrude(
      [
        [0.02, 0.02],
        [0.5, 0.04],
        [0.38, -0.14],
        [0.24, -0.05],
        [0.14, -0.14],
      ],
      0.08,
      0.014,
    );
    const crystalFang = new THREE.Mesh(fangGeo, glow);
    crystalFang.position.set(0, -0.03, 0.06);

    // Socketed amethyst diamond crystal core on both sides of receiver
    const gemCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.085, 0), glow);
    gemCore.position.set(0, 0.06, -0.04);
    gemCore.scale.set(1.35, 0.9, 0.9);

    // Dorsal crystal spikes + spiked emitter barrel
    const spike1 = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.15, 4), glow);
    spike1.position.set(0, 0.21, 0.12);
    spike1.rotation.x = 0.25;
    const spike2 = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.13, 4), glow);
    spike2.position.set(0, 0.2, 0.28);
    spike2.rotation.x = 0.35;

    const crystalMuzzle = new THREE.Mesh(new THREE.ConeGeometry(0.082, 0.22, 6), glow);
    crystalMuzzle.rotation.x = Math.PI / 2;
    crystalMuzzle.position.set(0, 0.08, 0.56);

    gun.add(body, crystalFang, gemCore, spike1, spike2, crystalMuzzle);
  }

  root.scale.setScalar(scale);
  return root;
}

/**
 * Stylized 3D Enemy Blaster Rifle ('raider') and Boss Heavy Cannon ('boss')
 * oriented along +Z so armed monsters & shooters hold realistic 3D weapons.
 */
export function createEnemyBlasterMesh(
  palette: MaterialPalette,
  variant: 'raider' | 'boss' = 'raider',
  scale = 1,
): THREE.Group {
  const root = new THREE.Group();
  const gun = new THREE.Group();
  root.add(gun);

  const darkArmor = palette.getMat(0x1e293b, 'metal');
  const obsidian = palette.getMat(0x0f172a, 'matte');
  const steel = palette.getMat(0x64748b, 'metal');
  const coreGlow = palette.getMat(variant === 'boss' ? 0xd946ef : 0xf43f5e, 'emissive');
  const accentMetal = palette.getMat(variant === 'boss' ? 0x7e22ce : 0xbe123c, 'metal');

  addAngledGrip(gun, obsidian, accentMetal, steel, -0.18, -0.15);

  const receiverGeo = beveledExtrude(
    [
      [-0.42, -0.04],
      [0.44, -0.04],
      [0.48, 0.12],
      [0.16, 0.18],
      [-0.28, 0.16],
      [-0.44, 0.05],
    ],
    variant === 'boss' ? 0.18 : 0.14,
    0.016,
  );
  const receiver = new THREE.Mesh(receiverGeo, darkArmor);
  receiver.position.set(0, 0.04, 0.04);

  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.18, 0.28), obsidian);
  stock.position.set(0, 0.01, -0.44);

  const shroud = new THREE.Mesh(
    new THREE.BoxGeometry(variant === 'boss' ? 0.16 : 0.12, 0.13, 0.42),
    accentMetal,
  );
  shroud.position.set(0, 0.08, 0.34);

  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(variant === 'boss' ? 0.068 : 0.046, 0.058, 0.46, 10),
    steel,
  );
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.09, 0.56);

  const muzzleTip = new THREE.Mesh(
    new THREE.CylinderGeometry(variant === 'boss' ? 0.08 : 0.058, 0.06, 0.1, 8),
    coreGlow,
  );
  muzzleTip.rotation.x = Math.PI / 2;
  muzzleTip.position.set(0, 0.09, 0.8);

  const coilL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.07, 0.32), coreGlow);
  coilL.position.set(variant === 'boss' ? -0.1 : -0.08, 0.11, 0.2);
  const coilR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.07, 0.32), coreGlow);
  coilR.position.set(variant === 'boss' ? 0.1 : 0.08, 0.11, 0.2);

  const optic = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.18), steel);
  optic.position.set(0, 0.22, 0.04);
  const opticLens = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.03), coreGlow);
  opticLens.position.set(0, 0.22, 0.14);

  gun.add(receiver, stock, shroud, barrel, muzzleTip, coilL, coilR, optic, opticLens);
  root.scale.setScalar(scale);
  return root;
}

