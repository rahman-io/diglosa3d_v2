import * as THREE from 'three';
import { PlaneVariant } from '../types/game';

export interface PlaneRig {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  canopyPivot: THREE.Group;
  gearPivot: THREE.Group;
  frontWheel: THREE.Mesh;
  leftFlap: THREE.Mesh;
  rightFlap: THREE.Mesh;
  rudders: THREE.Mesh[];
  flameCones: THREE.Mesh[];
  navGlows: THREE.Mesh[];
  pilotSeatOffset: THREE.Vector3;
  boardOutsideOffset: THREE.Vector3;
  leftWingMuzzle: THREE.Vector3;
  rightWingMuzzle: THREE.Vector3;
  bellyBombOffset: THREE.Vector3;
  halfW: number;
  halfL: number;
  height: number;
  disposables: Array<{ dispose: () => void }>;
}

export interface PlaneBuildOptions {
  variant: PlaneVariant;
}

const LIVERY_BY_VARIANT: Record<
  PlaneVariant,
  {
    primary: number;
    secondary: number;
    accent: number;
    trim: number;
    flame: number;
    cockpitTint: number;
  }
> = {
  garuda: {
    primary: 0x0284c7, // Vibrant sky-blue fuselage
    secondary: 0xe2e8f0, // Crisp white-silver wings
    accent: 0xf59e0b, // Garuda amber stripes
    trim: 0x1e293b,
    flame: 0x38bdf8,
    cockpitTint: 0x7dd3fc,
  },
  rajawali: {
    primary: 0x4d7c0f, // Tactical olive armor
    secondary: 0x334155, // Gunmetal wings
    accent: 0xeab308, // Gold striker chevrons
    trim: 0x1c1917,
    flame: 0xf97316,
    cockpitTint: 0xfde047,
  },
  elang: {
    primary: 0x1e293b, // Stealth dark slate (concept art hero jet)
    secondary: 0x334155, // Stealth chined wings
    accent: 0x22d3ee, // Neon cyan airbase trim
    trim: 0x0f172a,
    flame: 0x22d3ee,
    cockpitTint: 0x38bdf8,
  },
};

export function createPlaneModel(opts: PlaneBuildOptions): PlaneRig {
  const livery = LIVERY_BY_VARIANT[opts.variant];
  const disposables: Array<{ dispose: () => void }> = [];
  const track = <T extends { dispose: () => void }>(d: T): T => {
    disposables.push(d);
    return d;
  };

  const primaryMat = track(
    new THREE.MeshStandardMaterial({
      color: livery.primary,
      roughness: 0.34,
      metalness: 0.42,
    }),
  );
  const secondaryMat = track(
    new THREE.MeshStandardMaterial({
      color: livery.secondary,
      roughness: 0.4,
      metalness: 0.35,
    }),
  );
  const accentMat = track(
    new THREE.MeshStandardMaterial({
      color: livery.accent,
      roughness: 0.28,
      metalness: 0.45,
      emissive: opts.variant === 'elang' ? livery.accent : 0x000000,
      emissiveIntensity: opts.variant === 'elang' ? 0.32 : 0,
    }),
  );
  const darkMetalMat = track(
    new THREE.MeshStandardMaterial({
      color: livery.trim,
      roughness: 0.45,
      metalness: 0.72,
    }),
  );
  const chromeMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xdbeafe,
      roughness: 0.16,
      metalness: 0.9,
    }),
  );
  const tireMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.9,
      metalness: 0.05,
    }),
  );
  const seatMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.8,
      metalness: 0.1,
    }),
  );
  const canopyMat = track(
    new THREE.MeshStandardMaterial({
      color: livery.cockpitTint,
      roughness: 0.08,
      metalness: 0.28,
      transparent: true,
      opacity: 0.52,
    }),
  );
  const flameMat = track(
    new THREE.MeshBasicMaterial({
      color: livery.flame,
      transparent: true,
      opacity: 0.9,
    }),
  );
  const redNavMat = track(
    new THREE.MeshBasicMaterial({ color: 0xf43f5e }),
  );
  const greenNavMat = track(
    new THREE.MeshBasicMaterial({ color: 0x22c55e }),
  );

  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  // Base clearance keeps landing gear tires flush at y=0
  bodyPivot.position.y = 1.25;
  root.add(bodyPivot);

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
    castShadow = true,
  ) => {
    const geo = track(new THREE.BoxGeometry(w, h, d));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // 1. Central Fuselage Spine (+Z is forward nose, -Z is tail exhaust)
  addBox(bodyPivot, 1.55, 1.02, 5.2, primaryMat, 0, 0.18, 0.1);
  // Chined fuselage stealth side fairings
  addBox(bodyPivot, 2.25, 0.44, 4.1, primaryMat, 0, 0.08, 0.0);

  // 2. Sculpted Nose Cone & Pitot Probe (+Z)
  addBox(bodyPivot, 1.15, 0.78, 1.45, primaryMat, 0, 0.12, 3.25);
  addBox(bodyPivot, 0.72, 0.5, 1.15, accentMat, 0, 0.06, 4.35);
  const noseGeo = track(new THREE.ConeGeometry(0.32, 1.05, 6));
  const noseTip = new THREE.Mesh(noseGeo, darkMetalMat);
  noseTip.rotation.x = Math.PI / 2;
  noseTip.position.set(0, 0.04, 5.35);
  noseTip.castShadow = true;
  bodyPivot.add(noseTip);

  // 3. Cockpit Tub + Pilot Seat (visible inside canopy!)
  addBox(bodyPivot, 1.08, 0.25, 2.0, darkMetalMat, 0, 0.62, 1.5);
  addBox(bodyPivot, 0.74, 0.62, 0.22, seatMat, 0, 0.96, 0.95, -0.14);
  addBox(bodyPivot, 0.74, 0.18, 0.66, seatMat, 0, 0.68, 1.35);

  // 4. Hinged Tinted Glass Canopy
  const canopyPivot = new THREE.Group();
  canopyPivot.position.set(0, 0.72, 2.5);
  bodyPivot.add(canopyPivot);
  addBox(canopyPivot, 1.02, 0.56, 1.85, canopyMat, 0, 0.24, -0.92, 0.08);
  addBox(canopyPivot, 1.06, 0.1, 1.92, darkMetalMat, 0, 0.02, -0.92);
  addBox(canopyPivot, 0.94, 0.12, 0.12, darkMetalMat, 0, 0.44, -0.88);

  // 5. Twin Side Air Intakes + Dual Jet Exhaust Nozzles (-Z)
  const flameCones: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    addBox(bodyPivot, 0.64, 0.68, 2.75, darkMetalMat, side * 1.05, 0.12, 0.45);
    addBox(bodyPivot, 0.52, 0.52, 0.16, chromeMat, side * 1.05, 0.12, 1.86);
    addBox(bodyPivot, 0.68, 0.12, 1.6, accentMat, side * 1.05, 0.5, 0.15);

    const nozzleGeo = track(new THREE.CylinderGeometry(0.36, 0.42, 0.78, 8));
    const nozzle = new THREE.Mesh(nozzleGeo, darkMetalMat);
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position.set(side * 0.58, 0.15, -2.75);
    nozzle.castShadow = true;
    bodyPivot.add(nozzle);

    const flameGeo = track(new THREE.ConeGeometry(0.29, 1.45, 8));
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.rotation.x = -Math.PI / 2;
    flame.position.set(side * 0.58, 0.15, -3.65);
    bodyPivot.add(flame);
    flameCones.push(flame);
  }

  // 6. Main Swept / Delta Wings + Animated Aileron Flaps
  const wingSpan = opts.variant === 'rajawali' ? 4.35 : 3.9;
  const wingChord = opts.variant === 'elang' ? 3.2 : 2.35;
  const wingSweep = opts.variant === 'elang' ? 0.36 : 0.28;

  const leftWing = addBox(
    bodyPivot,
    wingSpan,
    0.18,
    wingChord,
    secondaryMat,
    -wingSpan * 0.5 - 0.75,
    0.05,
    -0.5,
    0,
    wingSweep,
    0,
  );
  const rightWing = addBox(
    bodyPivot,
    wingSpan,
    0.18,
    wingChord,
    secondaryMat,
    wingSpan * 0.5 + 0.75,
    0.05,
    -0.5,
    0,
    -wingSweep,
    0,
  );
  // Accent wing stripe bars
  addBox(leftWing, wingSpan * 0.82, 0.05, 0.38, accentMat, 0, 0.1, 0.25);
  addBox(rightWing, wingSpan * 0.82, 0.05, 0.38, accentMat, 0, 0.1, 0.25);

  const leftFlap = addBox(
    bodyPivot,
    wingSpan * 0.62,
    0.1,
    0.55,
    accentMat,
    -wingSpan * 0.48 - 0.75,
    0.04,
    -1.65,
    0,
    wingSweep * 0.5,
    0,
  );
  const rightFlap = addBox(
    bodyPivot,
    wingSpan * 0.62,
    0.1,
    0.55,
    accentMat,
    wingSpan * 0.48 + 0.75,
    0.04,
    -1.65,
    0,
    -wingSweep * 0.5,
    0,
  );

  // Underwing Weapon Pods / Ordinance Rails
  for (const side of [-1, 1]) {
    addBox(bodyPivot, 0.32, 0.28, 1.9, darkMetalMat, side * 2.3, -0.18, -0.2);
    addBox(
      bodyPivot,
      0.24,
      0.24,
      opts.variant === 'rajawali' ? 1.55 : 1.15,
      accentMat,
      side * 3.15,
      -0.2,
      -0.45,
    );
  }

  // Wingtip Navigation Lights (Port Red, Starboard Green)
  const navGlows: THREE.Mesh[] = [];
  const tipX = wingSpan + 0.62;
  const tipZ = -1.25;
  const portLight = new THREE.Mesh(track(new THREE.BoxGeometry(0.24, 0.16, 0.45)), redNavMat);
  portLight.position.set(-tipX, 0.12, tipZ);
  bodyPivot.add(portLight);
  navGlows.push(portLight);

  const stbdLight = new THREE.Mesh(track(new THREE.BoxGeometry(0.24, 0.16, 0.45)), greenNavMat);
  stbdLight.position.set(tipX, 0.12, tipZ);
  bodyPivot.add(stbdLight);
  navGlows.push(stbdLight);

  // 7. Rear Horizontal Stabilizers + Twin Canted Vertical Tail Fins
  for (const side of [-1, 1]) {
    addBox(
      bodyPivot,
      1.85,
      0.14,
      1.1,
      secondaryMat,
      side * 1.45,
      0.12,
      -2.45,
      0,
      -side * 0.24,
      0,
    );
    const tail = addBox(
      bodyPivot,
      0.14,
      1.45,
      1.35,
      primaryMat,
      side * 0.92,
      0.88,
      -2.25,
      -0.18,
      0,
      -side * 0.22,
    );
    addBox(tail, 0.16, 0.24, 1.22, accentMat, 0, 0.56, -0.04);
  }
  const rudders: THREE.Mesh[] = [];
  const centerTail = addBox(bodyPivot, 0.12, 0.72, 0.95, accentMat, 0, 0.65, -2.55, -0.15);
  rudders.push(centerTail);

  // 8. Retractable 3-Point Landing Gear
  const gearPivot = new THREE.Group();
  bodyPivot.add(gearPivot);

  const strutH = 0.88;
  const wheelGeo = track(new THREE.CylinderGeometry(0.32, 0.32, 0.24, 12));
  // Nose Gear
  addBox(gearPivot, 0.14, strutH, 0.14, chromeMat, 0, -0.45, 2.55);
  const frontWheel = new THREE.Mesh(wheelGeo, tireMat);
  frontWheel.rotation.z = Math.PI / 2;
  frontWheel.position.set(0, -0.92, 2.58);
  frontWheel.castShadow = true;
  gearPivot.add(frontWheel);

  // Main Rear Left/Right Gear
  for (const side of [-1, 1]) {
    addBox(gearPivot, 0.16, strutH, 0.16, chromeMat, side * 1.45, -0.45, -0.65, 0, 0, side * 0.12);
    const mainWheel = new THREE.Mesh(wheelGeo, tireMat);
    mainWheel.rotation.z = Math.PI / 2;
    mainWheel.position.set(side * 1.52, -0.92, -0.65);
    mainWheel.castShadow = true;
    gearPivot.add(mainWheel);
  }

  return {
    root,
    bodyPivot,
    canopyPivot,
    gearPivot,
    frontWheel,
    leftFlap,
    rightFlap,
    rudders,
    flameCones,
    navGlows,
    pilotSeatOffset: new THREE.Vector3(0, 1.48, 1.42),
    boardOutsideOffset: new THREE.Vector3(-2.55, 0, 1.35),
    leftWingMuzzle: new THREE.Vector3(-2.3, 1.15, 1.25),
    rightWingMuzzle: new THREE.Vector3(2.3, 1.15, 1.25),
    bellyBombOffset: new THREE.Vector3(0, 0.55, -0.1),
    halfW: 3.9,
    halfL: 4.9,
    height: 3.1,
    disposables,
  };
}

export function animatePlaneRig(
  rig: PlaneRig,
  opts: {
    speed: number;
    throttleRatio: number;
    turbo: boolean;
    canopyAngle: number;
    gearExtend: number; // 1 = extended, 0 = retracted
    steerAngle: number;
    pitchInput: number;
    rollBank: number;
    elapsed: number;
  },
): void {
  rig.canopyPivot.rotation.x = -opts.canopyAngle;

  // Landing gear smoothly tucks back & up into belly when airborne
  const g = THREE.MathUtils.clamp(opts.gearExtend, 0, 1);
  rig.gearPivot.rotation.x = -(1 - g) * 1.38;
  rig.gearPivot.position.y = (1 - g) * 0.72;
  rig.gearPivot.visible = g > 0.08;
  rig.frontWheel.rotation.y = opts.steerAngle * 0.65;

  // Aileron flaps respond to steering + pitch
  rig.leftFlap.rotation.x = THREE.MathUtils.clamp(opts.pitchInput * 0.35 + opts.rollBank * 0.4, -0.45, 0.45);
  rig.rightFlap.rotation.x = THREE.MathUtils.clamp(opts.pitchInput * 0.35 - opts.rollBank * 0.4, -0.45, 0.45);

  // Thruster flames grow with speed & turbo
  const flicker = 0.88 + Math.sin(opts.elapsed * 42) * 0.12;
  const activeScale = opts.throttleRatio > 0.05 || opts.speed > 1.5
    ? (0.45 + Math.min(1.4, opts.throttleRatio * 1.15) + (opts.turbo ? 0.95 : 0)) * flicker
    : 0.16 * flicker;
  for (let i = 0; i < rig.flameCones.length; i++) {
    const f = rig.flameCones[i];
    f.visible = opts.throttleRatio > 0.02 || opts.speed > 0.4;
    f.scale.set(opts.turbo ? 1.25 : 0.9, activeScale, opts.turbo ? 1.25 : 0.9);
  }

  // Wingtip strobe blink
  const blink = Math.sin(opts.elapsed * 6.5) > 0.65 ? 1.25 : 0.85;
  for (let i = 0; i < rig.navGlows.length; i++) {
    rig.navGlows[i].scale.setScalar(blink);
  }
}
