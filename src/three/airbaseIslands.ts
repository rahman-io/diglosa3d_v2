import * as THREE from 'three';
import { PlaneVariant, ZoneId } from '../types/game';
import type { TerrainSample } from './archipelagoWorld';
import { MaterialPalette } from './materials';
import { VillageObstacle } from './minecraftVillage';

export interface AirbaseIslandDef {
  id: 'airbase_south' | 'airbase_east' | 'airbase_north';
  name: string;
  zoneId: ZoneId;
  cx: number;
  cy: number;
  cz: number;
  yaw: number; // Runway forward takeoff direction (+Z in local island space)
  halfW: number;
  halfL: number;
  planeId: string;
  planeName: string;
  planeVariant: PlaneVariant;
  accentHex: number;
  radarColor: string;
  floating: boolean;
}

export interface SkyRingTarget {
  id: string;
  airbaseId: string;
  pos: THREE.Vector3;
  yaw: number;
  radius: number;
  mesh: THREE.Mesh;
  ringColor: number;
  cooldown: number;
}

export interface AirbaseResupplyPad {
  airbaseId: string;
  name: string;
  pos: THREE.Vector3;
  ringMesh: THREE.Mesh;
}

export interface AirbaseWorldRig {
  group: THREE.Group;
  rings: SkyRingTarget[];
  radarDishes: THREE.Object3D[];
  windsocks: THREE.Object3D[];
  resupplyPads: AirbaseResupplyPad[];
  obstacles: VillageObstacle[];
  disposables: Array<{ dispose: () => void }>;
}

// 3 Strategic Airbase Islands forming an aerial triangle around the Archipelago:
// 1. Selatan (near Desa Sapaan, linked by wide sky-pier ramp so Hero can walk straight onto Runway 1!)
// 2. Timur (floating sky airbase over eastern ocean near Hutan Satwa & Menara Waktu)
// 3. Utara (high floating sky airbase over NW ocean overlooking Gerbang Kota & Gua Portal)
export const AIRBASE_ISLANDS: AirbaseIslandDef[] = [
  {
    id: 'airbase_south',
    name: 'Pangkalan Garuda Selatan',
    zoneId: 'desa_sapaan',
    cx: -86,
    cy: 7.5,
    cz: 198,
    yaw: -Math.PI * 0.28,
    halfW: 32,
    halfL: 34,
    planeId: 'jet_garuda',
    planeName: 'Garuda V-1 Interceptor',
    planeVariant: 'garuda',
    accentHex: 0x38bdf8,
    radarColor: '#38bdf8',
    floating: false,
  },
  {
    id: 'airbase_east',
    name: 'Pangkalan Rajawali Timur',
    zoneId: 'hutan_satwa',
    cx: 224,
    cy: 20.0,
    cz: 62,
    yaw: -Math.PI * 0.82,
    halfW: 31,
    halfL: 33,
    planeId: 'jet_rajawali',
    planeName: 'Rajawali Heavy Striker',
    planeVariant: 'rajawali',
    accentHex: 0xfacc15,
    radarColor: '#facc15',
    floating: true,
  },
  {
    id: 'airbase_north',
    name: 'Pangkalan Elang Utara',
    zoneId: 'gerbang_kota',
    cx: -196,
    cy: 30.0,
    cz: -192,
    yaw: Math.PI * 0.32,
    halfW: 31,
    halfL: 33,
    planeId: 'jet_elang',
    planeName: 'Elang Stealth Raptor',
    planeVariant: 'elang',
    accentHex: 0x22d3ee,
    radarColor: '#22d3ee',
    floating: true,
  },
];

// Wide walkable/driveable ramp connecting Desa Sapaan SW beach (-46, 2.6, 160) straight up onto Airbase Selatan (-70, 7.5, 184)
export const AIRBASE_SOUTH_RAMP = {
  ax: -46.0,
  ay: 2.6,
  az: 160.0,
  bx: -70.0,
  by: 7.5,
  bz: 184.0,
  halfWidth: 2.8,
} as const;

export function getAirbaseWorldPoint(
  base: AirbaseIslandDef,
  lx: number,
  ly: number,
  lz: number,
  out = new THREE.Vector3(),
): THREE.Vector3 {
  const sinY = Math.sin(base.yaw);
  const cosY = Math.cos(base.yaw);
  out.set(
    base.cx + lx * cosY + lz * sinY,
    base.cy + ly,
    base.cz - lx * sinY + lz * cosY,
  );
  return out;
}

function evalSouthRampSample(x: number, z: number): {
  onRamp: boolean;
  y: number;
  perp: number;
  t: number;
} {
  const r = AIRBASE_SOUTH_RAMP;
  const vx = r.bx - r.ax;
  const vz = r.bz - r.az;
  const lenSq = vx * vx + vz * vz || 1;
  const len = Math.sqrt(lenSq);
  const rawT = ((x - r.ax) * vx + (z - r.az) * vz) / lenSq;
  if (rawT < -0.04 || rawT > 1.04) {
    return { onRamp: false, y: 0, perp: Infinity, t: rawT };
  }
  const t = THREE.MathUtils.clamp(rawT, 0, 1);
  const cx = r.ax + vx * t;
  const cz = r.az + vz * t;
  const perp = Math.hypot(x - cx, z - cz);
  const y = THREE.MathUtils.lerp(r.ay, r.by, t);
  return {
    onRamp: perp <= r.halfWidth + 0.35,
    y,
    perp,
    t,
  };
}

/**
 * Samples the 3 Airbase Islands (and South connecting ramp) in world (x,z) coordinates.
 * None of the 3 Airbase footprints overlap any existing ground island disk or islet.
 */
export function sampleAirbaseTerrain(x: number, z: number): TerrainSample | null {
  for (let i = 0; i < AIRBASE_ISLANDS.length; i++) {
    const b = AIRBASE_ISLANDS[i];
    const dx = x - b.cx;
    const dz = z - b.cz;
    if (Math.abs(dx) > b.halfW + b.halfL || Math.abs(dz) > b.halfW + b.halfL) continue;
    const cosY = Math.cos(b.yaw);
    const sinY = Math.sin(b.yaw);
    const lx = dx * cosY - dz * sinY;
    const lz = dx * sinY + dz * cosY;
    // Rounded-corner rectangular airbase island plateau
    const cornerInset = 4.5;
    if (Math.abs(lx) <= b.halfW && Math.abs(lz) <= b.halfL) {
      const ex = Math.max(0, Math.abs(lx) - (b.halfW - cornerInset));
      const ez = Math.max(0, Math.abs(lz) - (b.halfL - cornerInset));
      if (ex * ex + ez * ez <= cornerInset * cornerInset + 2.5) {
        const onRunway = Math.abs(lx) <= 9.5 && Math.abs(lz) <= 27.5;
        const onApron = lx >= 8 && lx <= 24 && Math.abs(lz) <= 18;
        return {
          groundY: b.cy,
          isLandOrBridge: true,
          isDryLand: true,
          surface: onRunway || onApron ? 'road' : 'land',
        };
      }
    }
  }

  const ramp = evalSouthRampSample(x, z);
  if (ramp.onRamp) {
    return {
      groundY: ramp.y,
      isLandOrBridge: true,
      isDryLand: true,
      surface: 'bridge',
    };
  }

  return null;
}

export function isWalkableAirbase(x: number, z: number, margin = 0): boolean {
  for (let i = 0; i < AIRBASE_ISLANDS.length; i++) {
    const b = AIRBASE_ISLANDS[i];
    const dx = x - b.cx;
    const dz = z - b.cz;
    if (Math.abs(dx) > b.halfW + b.halfL || Math.abs(dz) > b.halfW + b.halfL) continue;
    const cosY = Math.cos(b.yaw);
    const sinY = Math.sin(b.yaw);
    const lx = dx * cosY - dz * sinY;
    const lz = dx * sinY + dz * cosY;
    if (Math.abs(lx) <= b.halfW - margin && Math.abs(lz) <= b.halfL - margin) {
      return true;
    }
  }
  const ramp = evalSouthRampSample(x, z);
  return ramp.onRamp && ramp.perp <= AIRBASE_SOUTH_RAMP.halfWidth - margin * 0.4;
}

export function getAirbaseRunwaySpawn(base: AirbaseIslandDef): {
  pos: THREE.Vector3;
  yaw: number;
} {
  // Parked neatly on runway threshold ready to taxi forward (+Z) and take off through the sky rings!
  return {
    pos: getAirbaseWorldPoint(base, 0, 0, -14),
    yaw: base.yaw,
  };
}

export function buildAirbaseIslands(
  palette: MaterialPalette,
  lowDetail = false,
): AirbaseWorldRig {
  const group = new THREE.Group();
  const rings: SkyRingTarget[] = [];
  const radarDishes: THREE.Object3D[] = [];
  const windsocks: THREE.Object3D[] = [];
  const resupplyPads: AirbaseResupplyPad[] = [];
  const obstacles: VillageObstacle[] = [];
  const disposables: Array<{ dispose: () => void }> = [];

  const track = <T extends { dispose: () => void }>(d: T): T => {
    disposables.push(d);
    return d;
  };

  // Shared materials styled directly after DIGLOSA AIRBASE concept art
  const turfMat = palette.getMat(0x62ad35, 'matte');
  const turfDarkMat = palette.getMat(0x4d8e29, 'matte');
  const dirtMat = palette.getMat(0x8c5a32, 'matte');
  const rockMat = palette.getMat(0x475569, 'matte');
  const asphaltMat = palette.getMat(0x272d36, 'matte');
  const concreteMat = palette.getMat(0x64748b, 'matte');
  const whitePaintMat = palette.getMat(0xf8fafc, 'matte');
  const yellowPaintMat = palette.getMat(0xfacc15, 'emissive');
  const hangarMetalMat = palette.getMat(0x94a3b8, 'metal');
  const hangarRibMat = palette.getMat(0x334155, 'metal');
  const towerBrickMat = palette.getMat(0xb45309, 'matte');
  const towerGlassMat = palette.getMat(0x38bdf8, 'glass');
  const greenBeaconMat = track(new THREE.MeshBasicMaterial({ color: 0x22c55e }));
  const redBeaconMat = track(new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  const cyanGlowMat = track(
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.78 }),
  );
  const goldGlowMat = track(
    new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.78 }),
  );
  const cloudMat = palette.getMat(0xf8fafc, 'matte');

  const addBox = (
    parent: THREE.Object3D,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    rx = 0,
    ry = 0,
    rz = 0,
    castShadow = !lowDetail,
  ) => {
    const mesh = new THREE.Mesh(track(new THREE.BoxGeometry(w, h, d)), mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  for (let bIdx = 0; bIdx < AIRBASE_ISLANDS.length; bIdx++) {
    const base = AIRBASE_ISLANDS[bIdx];
    const islandRoot = new THREE.Group();
    islandRoot.position.set(base.cx, base.cy, base.cz);
    islandRoot.rotation.y = base.yaw;
    group.add(islandRoot);

    const W = base.halfW * 2;
    const L = base.halfL * 2;

    // 1. Stepped Voxel Turf Plateau & Cliff Underside
    addBox(islandRoot, W, 1.4, L, turfMat, 0, -0.7, 0);
    addBox(islandRoot, W - 4, 2.2, L - 4, dirtMat, 0, -2.5, 0);
    addBox(islandRoot, W - 11, 3.0, L - 11, rockMat, 0, -5.1, 0);
    addBox(islandRoot, W * 0.56, 3.4, L * 0.56, rockMat, 0, -8.2, 0);

    // Decorative green edge turf steps & rocks
    addBox(islandRoot, 8, 0.7, 10, turfDarkMat, -24, 0.35, -24);
    addBox(islandRoot, 7, 0.7, 9, turfDarkMat, 22, 0.35, 25);

    if (base.floating) {
      // Soft atmospheric cloud puffs cradling the floating sky island
      const cloudCoords: Array<[number, number, number, number]> = [
        [-22, -10.2, -18, 13],
        [24, -10.8, 16, 14],
        [-18, -11.4, 24, 11],
        [18, -9.8, -22, 12],
      ];
      for (const [cx, cy, cz, cs] of cloudCoords) {
        addBox(islandRoot, cs, 2.5, cs * 0.78, cloudMat, cx, cy, cz, 0, 0, 0, false);
      }
    } else {
      // Concrete sea-pillars anchoring Airbase Selatan into the ocean bed
      for (const [px, pz] of [
        [-20, -20],
        [20, -20],
        [-20, 20],
        [20, 20],
      ]) {
        addBox(islandRoot, 3.6, base.cy + 8, 3.6, rockMat, px, -(base.cy * 0.5 + 4), pz);
      }
    }

    // 2. Main Asphalt Runway (18m wide x 56m long, centered at x=0, pointing +Z)
    addBox(islandRoot, 18.4, 0.14, 56.0, asphaltMat, 0, 0.07, 0);
    // Side Concrete Taxi Apron on Left (-X) for Hangar & Resupply
    addBox(islandRoot, 16.0, 0.12, 36.0, concreteMat, -17.2, 0.06, -2.0);
    // Side Apron on Right (+X) for Control Tower & Parking
    addBox(islandRoot, 13.0, 0.12, 34.0, concreteMat, 15.7, 0.06, -3.0);

    // Runway Zebra Thresholds & Centerline Dashes
    for (const endZ of [-24.5, 24.5]) {
      for (let s = -6; s <= 6; s += 3) {
        addBox(islandRoot, 1.3, 0.04, 4.6, whitePaintMat, s, 0.15, endZ, 0, 0, 0, false);
      }
    }
    for (let z = -19; z <= 19; z += 6) {
      addBox(islandRoot, 0.7, 0.04, 3.2, yellowPaintMat, 0, 0.15, z, 0, 0, 0, false);
    }

    // Runway Green/Red Edge Beacons
    for (let z = -24; z <= 24; z += 8) {
      const mat = z > 0 ? greenBeaconMat : redBeaconMat;
      addBox(islandRoot, 0.42, 0.35, 0.42, mat, -9.3, 0.22, z, 0, 0, 0, false);
      addBox(islandRoot, 0.42, 0.35, 0.42, mat, 9.3, 0.22, z, 0, 0, 0, false);
    }

    // 3. Curved Aircraft Hangar on Left Apron (-19.5, z=-10)
    const hangarX = -20.5;
    const hangarZ = -9.5;
    addBox(islandRoot, 1.0, 6.2, 16.0, hangarRibMat, hangarX - 6.2, 3.1, hangarZ);
    addBox(islandRoot, 1.0, 6.2, 16.0, hangarRibMat, hangarX + 6.2, 3.1, hangarZ);
    addBox(islandRoot, 13.6, 1.1, 16.4, hangarMetalMat, hangarX, 6.6, hangarZ);
    addBox(islandRoot, 11.4, 0.9, 16.4, hangarMetalMat, hangarX, 7.5, hangarZ);
    addBox(islandRoot, 13.4, 6.2, 1.0, hangarRibMat, hangarX, 3.1, hangarZ - 7.8);
    // Hangar interior ammo/supply crates
    addBox(islandRoot, 1.8, 1.4, 1.8, yellowPaintMat, hangarX - 4.0, 0.7, hangarZ - 4.2);
    addBox(islandRoot, 1.8, 1.4, 1.8, towerBrickMat, hangarX + 3.8, 0.7, hangarZ - 4.5);

    // Add world obstacles for hangar left/right/back walls so hero cannot walk through walls
    const pushLocalObs = (lx: number, lz: number, hw: number, hd: number) => {
      const wp = getAirbaseWorldPoint(base, lx, 0, lz);
      obstacles.push({
        x: wp.x,
        z: wp.z,
        halfW: hw,
        halfD: hd,
        rotY: base.yaw,
      });
    };
    pushLocalObs(hangarX - 6.2, hangarZ, 0.8, 8.2);
    pushLocalObs(hangarX + 6.2, hangarZ, 0.8, 8.2);
    pushLocalObs(hangarX, hangarZ - 7.8, 6.6, 0.8);

    // Glowing Cyan Resupply / Repair Pad in front of hangar
    const resupplyLocalX = -15.0;
    const resupplyLocalZ = 6.5;
    const padGeo = track(new THREE.RingGeometry(3.2, 4.1, 24));
    const padMesh = new THREE.Mesh(padGeo, cyanGlowMat);
    padMesh.rotation.x = -Math.PI / 2;
    padMesh.position.set(resupplyLocalX, 0.16, resupplyLocalZ);
    islandRoot.add(padMesh);
    resupplyPads.push({
      airbaseId: base.id,
      name: base.name,
      pos: getAirbaseWorldPoint(base, resupplyLocalX, 0.2, resupplyLocalZ),
      ringMesh: padMesh,
    });

    // 4. Diglosa Airbase Control Tower on Right Apron (+18.5, z=-6)
    const towerX = 18.8;
    const towerZ = -6.0;
    addBox(islandRoot, 6.2, 12.2, 6.2, towerBrickMat, towerX, 6.1, towerZ);
    addBox(islandRoot, 7.6, 2.8, 7.6, hangarRibMat, towerX, 13.4, towerZ);
    addBox(islandRoot, 7.9, 2.1, 7.9, towerGlassMat, towerX, 13.5, towerZ, 0, 0, 0, false);
    addBox(islandRoot, 8.4, 0.75, 8.4, concreteMat, towerX, 15.1, towerZ);
    // Tower side ops office
    addBox(islandRoot, 5.4, 4.2, 7.4, towerBrickMat, towerX, 2.1, towerZ + 6.5);
    addBox(islandRoot, 5.8, 0.55, 7.8, palette.getMat(base.accentHex, 'gloss'), towerX, 4.45, towerZ + 6.5);
    pushLocalObs(towerX, towerZ, 3.3, 3.3);
    pushLocalObs(towerX, towerZ + 6.5, 2.9, 3.9);

    // Rotating Radar Dish atop Control Tower
    const radarPivot = new THREE.Group();
    radarPivot.position.set(towerX, 15.6, towerZ);
    islandRoot.add(radarPivot);
    addBox(radarPivot, 0.6, 1.4, 0.6, hangarRibMat, 0, 0.7, 0);
    addBox(radarPivot, 2.8, 1.6, 0.4, whitePaintMat, 0, 1.8, 0.2, -0.25);
    addBox(radarPivot, 0.5, 0.5, 1.1, redBeaconMat, 0, 1.8, 0.65);
    radarDishes.push(radarPivot);

    // Mast beacon
    addBox(islandRoot, 0.25, 4.2, 0.25, hangarRibMat, towerX - 2.6, 17.2, towerZ - 2.4);
    addBox(islandRoot, 0.5, 0.5, 0.5, redBeaconMat, towerX - 2.6, 19.4, towerZ - 2.4, 0, 0, 0, false);

    // 5. Windsock near runway takeoff end
    const sockBase = new THREE.Group();
    sockBase.position.set(11.4, 0, 21.5);
    islandRoot.add(sockBase);
    addBox(sockBase, 0.28, 4.8, 0.28, hangarRibMat, 0, 2.4, 0);
    const sockArm = new THREE.Group();
    sockArm.position.set(0, 4.6, 0);
    sockBase.add(sockArm);
    addBox(sockArm, 0.65, 0.65, 1.1, redBeaconMat, 0, 0, 0.55);
    addBox(sockArm, 0.52, 0.52, 1.0, whitePaintMat, 0, -0.05, 1.55);
    addBox(sockArm, 0.4, 0.4, 0.9, redBeaconMat, 0, -0.1, 2.45);
    windsocks.push(sockArm);

    // 6. Safety perimeter fence bars behind apron/tower
    addBox(islandRoot, 18, 1.2, 0.3, hangarRibMat, 0, 0.6, -29.5);

    // 7. Three Glowing Sky Takeoff / Flight Rings stretching off runway (+Z)
    const ringGeo = track(new THREE.TorusGeometry(6.8, 0.48, 10, 28));
    const ringConfigs = [
      { lz: 38, ly: 8.5, col: 0x38bdf8, mat: cyanGlowMat },
      { lz: 64, ly: 17.0, col: 0xfacc15, mat: goldGlowMat },
      { lz: 96, ly: 26.5, col: 0x38bdf8, mat: cyanGlowMat },
    ];
    for (let rIdx = 0; rIdx < ringConfigs.length; rIdx++) {
      const rc = ringConfigs[rIdx];
      const worldRingPos = getAirbaseWorldPoint(base, 0, rc.ly, rc.lz);
      const ringMesh = new THREE.Mesh(ringGeo, rc.mat);
      ringMesh.position.copy(worldRingPos);
      ringMesh.rotation.y = base.yaw;
      group.add(ringMesh);
      rings.push({
        id: `${base.id}_ring_${rIdx}`,
        airbaseId: base.id,
        pos: worldRingPos,
        yaw: base.yaw,
        radius: 7.4,
        mesh: ringMesh,
        ringColor: rc.col,
        cooldown: 0,
      });
    }
  }

  // 8. Build Wide Connecting Taxi Ramp Bridge from Desa Sapaan SW coast up to Airbase Selatan
  const r = AIRBASE_SOUTH_RAMP;
  const rDx = r.bx - r.ax;
  const rDy = r.by - r.ay;
  const rDz = r.bz - r.az;
  const rLen = Math.hypot(rDx, rDz);
  const rYaw = Math.atan2(rDx, rDz);
  const rampSlope = Math.atan2(rDy, rLen);
  const rampGroup = new THREE.Group();
  rampGroup.position.set((r.ax + r.bx) * 0.5, (r.ay + r.by) * 0.5, (r.az + r.bz) * 0.5);
  rampGroup.rotation.y = rYaw;
  group.add(rampGroup);
  addBox(rampGroup, r.halfWidth * 2, 0.55, rLen + 3.0, concreteMat, 0, -0.27, 0, -rampSlope, 0, 0);
  addBox(rampGroup, 0.35, 1.0, rLen + 2.5, yellowPaintMat, -r.halfWidth + 0.18, 0.45, 0, -rampSlope, 0, 0);
  addBox(rampGroup, 0.35, 1.0, rLen + 2.5, yellowPaintMat, r.halfWidth - 0.18, 0.45, 0, -rampSlope, 0, 0);
  addBox(rampGroup, 2.2, 6.5, 2.2, rockMat, 0, -3.5, 0);

  return {
    group,
    rings,
    radarDishes,
    windsocks,
    resupplyPads,
    obstacles,
    disposables,
  };
}

export function updateAirbaseIslands(
  rig: AirbaseWorldRig,
  elapsed: number,
  dt: number,
): void {
  for (let i = 0; i < rig.radarDishes.length; i++) {
    rig.radarDishes[i].rotation.y = elapsed * 1.15 + i * 1.2;
  }
  for (let i = 0; i < rig.windsocks.length; i++) {
    rig.windsocks[i].rotation.y = Math.sin(elapsed * 2.2 + i) * 0.28 + 0.15;
    rig.windsocks[i].rotation.x = Math.sin(elapsed * 4.5 + i) * 0.08;
  }
  for (let i = 0; i < rig.resupplyPads.length; i++) {
    const s = 1.0 + Math.sin(elapsed * 3.0 + i) * 0.06;
    rig.resupplyPads[i].ringMesh.scale.set(s, s, 1);
  }
  for (let i = 0; i < rig.rings.length; i++) {
    const ring = rig.rings[i];
    if (ring.cooldown > 0) ring.cooldown = Math.max(0, ring.cooldown - dt);
    const pulse = 1.0 + Math.sin(elapsed * 2.8 + i * 0.9) * 0.04;
    ring.mesh.scale.setScalar(ring.cooldown > 0 ? 0.92 : pulse);
    ring.mesh.rotation.z = elapsed * 0.45 + i;
  }
}
