import * as THREE from 'three';
import { MaterialPalette, SurfaceMaterial } from './materials';

export interface DriveableCarRig {
  root: THREE.Group;
  chassisPivot: THREE.Group;
  doorPivot: THREE.Group;
  steeringPivot: THREE.Group;
  wheelFLSteer: THREE.Group;
  wheelFRSteer: THREE.Group;
  wheelFL: THREE.Group;
  wheelFR: THREE.Group;
  wheelRL: THREE.Group;
  wheelRR: THREE.Group;
  headlightMat: SurfaceMaterial;
  brakeLightMat: SurfaceMaterial;
  reverseLightMat: SurfaceMaterial;
  lightBeams: THREE.Group;
  beaconMat: SurfaceMaterial;
  driverSeatOffset: THREE.Vector3;
  boardOutsideOffset: THREE.Vector3;
  disposables: Array<{ dispose: () => void }>;
}

export function createDriveableCarRig(palette: MaterialPalette): DriveableCarRig {
  const root = new THREE.Group();
  const chassisPivot = new THREE.Group();
  root.add(chassisPivot);

  const disposables: Array<{ dispose: () => void }> = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposables.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    disposables.push(m);
    return m;
  };

  // Contact shadow under the car
  const shadowGeo = trackGeo(new THREE.PlaneGeometry(4.2, 7.2));
  const shadow = new THREE.Mesh(shadowGeo, palette.contactShadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.04;
  root.add(shadow);

  // Materials (varied PBR roughness & metalness)
  const paintBlue = trackMat(
    palette.createSurfaceMat({
      color: 0x0284c7,
      roughness: 0.24,
      metalness: 0.55,
    }),
  );
  const paintStripe = trackMat(
    palette.createSurfaceMat({
      color: 0xfacc15,
      roughness: 0.28,
      metalness: 0.3,
    }),
  );
  const trimDark = trackMat(
    palette.createSurfaceMat({
      color: 0x1e293b,
      roughness: 0.78,
      metalness: 0.14,
    }),
  );
  const interiorMat = trackMat(
    palette.createSurfaceMat({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.08,
    }),
  );
  const seatLeather = trackMat(
    palette.createSurfaceMat({
      color: 0x334155,
      roughness: 0.72,
      metalness: 0.08,
    }),
  );
  const chromeMat = trackMat(
    palette.createSurfaceMat({
      color: 0xe2e8f0,
      roughness: 0.18,
      metalness: 0.88,
    }),
  );
  const tireMat = trackMat(
    palette.createSurfaceMat({
      color: 0x111827,
      roughness: 0.9,
      metalness: 0.04,
    }),
  );
  const glassMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      roughness: 0.1,
      metalness: 0.18,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  const headlightMat = trackMat(
    palette.createSurfaceMat({
      color: 0xfef9c3,
      emissive: 0xfef08a,
      emissiveIntensity: 1.5,
      roughness: 0.18,
      metalness: 0.1,
    }),
  );
  const brakeLightMat = trackMat(
    palette.createSurfaceMat({
      color: 0xdc2626,
      emissive: 0xef4444,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.1,
    }),
  );
  const reverseLightMat = trackMat(
    palette.createSurfaceMat({
      color: 0xf8fafc,
      emissive: 0xe2e8f0,
      emissiveIntensity: 0.1,
      roughness: 0.25,
    }),
  );
  const beaconMat = trackMat(
    palette.createSurfaceMat({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    }),
  );
  const dashGlowMat = trackMat(
    palette.createSurfaceMat({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.15,
      roughness: 0.25,
    }),
  );

  // Dimensions (car faces +Z, width X = 3.0m, length Z = 5.9m, height ~3.45m)
  // Floor pan & rocker sills
  const floorPan = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.86, 0.26, 5.4)), trimDark);
  floorPan.position.set(0, 0.62, 0);
  floorPan.castShadow = true;
  chassisPivot.add(floorPan);

  // Front & Rear bumpers + skid plates
  const frontBumper = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.04, 0.44, 0.52)), trimDark);
  frontBumper.position.set(0, 0.72, 2.86);
  const rearBumper = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(3.04, 0.44, 0.52)), trimDark);
  rearBumper.position.set(0, 0.72, -2.84);
  const frontSkid = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.75, 0.22, 0.16)), chromeMat);
  frontSkid.position.set(0, 0.64, 3.12);
  const rearSkid = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.75, 0.22, 0.16)), chromeMat);
  rearSkid.position.set(0, 0.64, -3.1);
  chassisPivot.add(frontBumper, rearBumper, frontSkid, rearSkid);

  // Front Engine Hood & Grille (+Z)
  const hood = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.96, 0.96, 1.85)), paintBlue);
  hood.position.set(0, 1.24, 1.98);
  hood.castShadow = true;
  const hoodStripe = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.68, 0.06, 1.78)), paintStripe);
  hoodStripe.position.set(0, 1.74, 1.96);
  const grille = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.56, 0.46, 0.12)), trimDark);
  grille.position.set(0, 1.22, 2.93);
  const grilleBar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.42, 0.08, 0.14)), chromeMat);
  grilleBar.position.set(0, 1.24, 2.95);
  chassisPivot.add(hood, hoodStripe, grille, grilleBar);

  // Rear Cargo / Trunk Body (-Z)
  const rearBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.96, 1.02, 1.95)), paintBlue);
  rearBody.position.set(0, 1.26, -1.92);
  rearBody.castShadow = true;
  const rearStripeL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.06, 0.16, 1.92)), paintStripe);
  rearStripeL.position.set(1.49, 1.32, -1.92);
  const rearStripeR = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.06, 0.16, 1.92)), paintStripe);
  rearStripeR.position.set(-1.49, 1.32, -1.92);
  chassisPivot.add(rearBody, rearStripeL, rearStripeR);

  // Right Side Fixed Door (-X side)
  const rightDoor = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.18, 0.98, 1.94)), paintBlue);
  rightDoor.position.set(-1.4, 1.24, 0.08);
  rightDoor.castShadow = true;
  const rightDoorStripe = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.2, 0.16, 1.94)), paintStripe);
  rightDoorStripe.position.set(-1.4, 1.32, 0.08);
  const rightDoorHandle = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 0.09, 0.28)), chromeMat);
  rightDoorHandle.position.set(-1.52, 1.5, -0.35);
  const rightGlass = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 1.06, 1.72)), glassMat);
  rightGlass.position.set(-1.42, 2.26, 0.02);
  chassisPivot.add(rightDoor, rightDoorStripe, rightDoorHandle, rightGlass);

  // Left Side Rear Quarter + Sill beneath the hinged Driver Door (+X side)
  const leftSill = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.2, 2.02)), trimDark);
  leftSill.position.set(1.4, 0.72, 0.08);
  chassisPivot.add(leftSill);

  // Wheel Arch Flares (all 4 corners)
  const archGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.34, 1.36));
  [
    [1.46, 1.08, 1.82],
    [-1.46, 1.08, 1.82],
    [1.46, 1.08, -1.78],
    [-1.46, 1.08, -1.78],
  ].forEach(([ax, ay, az]) => {
    const arch = new THREE.Mesh(archGeo, trimDark);
    arch.position.set(ax, ay, az);
    chassisPivot.add(arch);
  });

  // Cabin Pillars & Roof (tall enough so explorer hat/feather never pokes roof)
  const pillarGeo = trackGeo(new THREE.BoxGeometry(0.2, 1.44, 0.22));
  [
    [1.36, 2.4, 1.04],
    [-1.36, 2.4, 1.04],
    [1.36, 2.4, -0.92],
    [-1.36, 2.4, -0.92],
    [1.36, 2.4, -2.58],
    [-1.36, 2.4, -2.58],
  ].forEach(([px, py, pz]) => {
    const p = new THREE.Mesh(pillarGeo, trimDark);
    p.position.set(px, py, pz);
    chassisPivot.add(p);
  });

  const roof = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.88, 0.24, 3.84)), paintBlue);
  roof.position.set(0, 3.18, -0.78);
  roof.castShadow = true;
  const roofStripe = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.68, 0.05, 3.74)), paintStripe);
  roofStripe.position.set(0, 3.32, -0.78);
  const spoiler = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.74, 0.14, 0.42)), trimDark);
  spoiler.position.set(0, 3.36, -2.72);
  const beaconBar = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.1, 0.16, 0.32)), beaconMat);
  beaconBar.position.set(0, 3.38, 0.48);
  chassisPivot.add(roof, roofStripe, spoiler, beaconBar);

  // Transparent Front Windshield & Rear Window (keeps driver clearly visible inside!)
  const windshield = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.54, 1.3, 0.08)), glassMat);
  windshield.position.set(0, 2.4, 1.12);
  windshield.rotation.x = -0.14;
  const rearWindow = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.54, 1.22, 0.08)), glassMat);
  rearWindow.position.set(0, 2.4, -2.62);
  const rightRearGlass = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 1.2, 1.38)), glassMat);
  rightRearGlass.position.set(-1.42, 2.34, -1.78);
  const leftRearGlass = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 1.2, 1.38)), glassMat);
  leftRearGlass.position.set(1.42, 2.34, -1.78);
  chassisPivot.add(windshield, rearWindow, rightRearGlass, leftRearGlass);

  // Cabin Interior: Dashboard, Center Console, Two Bucket Seats, Steering Wheel
  const dashboard = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.68, 0.62, 0.56)), interiorMat);
  dashboard.position.set(0, 1.48, 0.96);
  const dashScreen = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.86, 0.22, 0.06)), dashGlowMat);
  dashScreen.position.set(0.62, 1.66, 0.68);
  const consoleBox = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.4, 0.42, 1.85)), interiorMat);
  consoleBox.position.set(0, 0.94, 0.02);
  chassisPivot.add(dashboard, dashScreen, consoleBox);

  const buildSeat = (sx: number) => {
    const seat = new THREE.Group();
    seat.position.set(sx, 0.74, -0.16);
    const cushion = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.92, 0.2, 0.96)), seatLeather);
    cushion.position.set(0, 0.1, 0.08);
    const backrest = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.9, 1.18, 0.22)), seatLeather);
    backrest.position.set(0, 0.72, -0.38);
    backrest.rotation.x = -0.12;
    const headrest = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.46, 0.34, 0.2)), trimDark);
    headrest.position.set(0, 1.42, -0.46);
    seat.add(cushion, backrest, headrest);
    return seat;
  };
  // Driver seat on +X (Hero left side when facing +Z)
  chassisPivot.add(buildSeat(0.62), buildSeat(-0.62));

  // Steering Column + Rotating Steering Wheel
  const steerColumn = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.48, 8)), trimDark);
  steerColumn.rotation.x = Math.PI * 0.32;
  steerColumn.position.set(0.62, 1.84, 0.76);
  chassisPivot.add(steerColumn);

  const steeringPivot = new THREE.Group();
  steeringPivot.position.set(0.62, 1.96, 0.56);
  steeringPivot.rotation.x = -0.52;
  const wheelRim = new THREE.Mesh(trackGeo(new THREE.TorusGeometry(0.28, 0.045, 8, 18)), trimDark);
  const wheelHub = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 10)), chromeMat);
  wheelHub.rotation.x = Math.PI / 2;
  const spokeH = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.52, 0.05, 0.04)), chromeMat);
  const spokeV = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.05, 0.26, 0.04)), chromeMat);
  spokeV.position.y = -0.13;
  steeringPivot.add(wheelRim, wheelHub, spokeH, spokeV);
  chassisPivot.add(steeringPivot);

  // Hinged Front-Left Driver Door (hinged at front pillar x=+1.42, z=+1.02; swings outward +X via negative Y rotation)
  const doorPivot = new THREE.Group();
  doorPivot.position.set(1.42, 0.78, 1.02);
  const doorPanel = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.16, 0.96, 1.9)), paintBlue);
  doorPanel.position.set(0, 0.46, -0.95);
  doorPanel.castShadow = true;
  const doorStripe = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.18, 0.16, 1.9)), paintStripe);
  doorStripe.position.set(0, 0.54, -0.95);
  const doorHandle = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 0.09, 0.28)), chromeMat);
  doorHandle.position.set(0.1, 0.72, -1.48);
  const doorWindowFrameTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.12, 0.12, 1.78)), trimDark);
  doorWindowFrameTop.position.set(0, 2.2, -0.95);
  const doorWindowFrameRear = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.12, 1.24, 0.14)), trimDark);
  doorWindowFrameRear.position.set(0, 1.56, -1.82);
  const doorGlass = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.06, 1.16, 1.66)), glassMat);
  doorGlass.position.set(0, 1.54, -0.95);
  const sideMirrorArm = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.24, 0.08, 0.1)), trimDark);
  sideMirrorArm.position.set(0.14, 1.02, -0.26);
  const sideMirrorHead = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.18, 0.18, 0.24)), paintBlue);
  sideMirrorHead.position.set(0.26, 1.04, -0.26);
  doorPivot.add(
    doorPanel,
    doorStripe,
    doorHandle,
    doorWindowFrameTop,
    doorWindowFrameRear,
    doorGlass,
    sideMirrorArm,
    sideMirrorHead,
  );
  chassisPivot.add(doorPivot);

  // Headlights, Taillights, Exhaust Pipe, Light Beam Cones
  [-1.02, 1.02].forEach((lx) => {
    const hl = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.52, 0.3, 0.14)), headlightMat);
    hl.position.set(lx, 1.3, 2.94);
    const tl = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.54, 0.28, 0.14)), brakeLightMat);
    tl.position.set(lx, 1.34, -2.92);
    const rl = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.22, 0.14, 0.14)), reverseLightMat);
    rl.position.set(lx * 0.62, 1.18, -2.92);
    chassisPivot.add(hl, tl, rl);
  });

  const exhaust = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.11, 0.11, 0.42, 10)), chromeMat);
  exhaust.rotation.x = Math.PI / 2;
  exhaust.position.set(-0.92, 0.58, -3.02);
  chassisPivot.add(exhaust);

  const lightBeams = new THREE.Group();
  const beamGeo = trackGeo(new THREE.ConeGeometry(2.2, 11.5, 14, 1, true));
  const beamMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.13,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  [-1.02, 1.02].forEach((lx) => {
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.x = -Math.PI / 2 + 0.08;
    beam.position.set(lx, 1.05, 8.65);
    lightBeams.add(beam);
  });
  chassisPivot.add(lightBeams);

  // 4 Wheels (radius 0.56m so hub center is at y = 0.56)
  const buildWheel = () => {
    const w = new THREE.Group();
    const tire = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.56, 0.56, 0.44, 16)), tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    const rim = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.32, 0.32, 0.47, 12)), chromeMat);
    rim.rotation.z = Math.PI / 2;
    const crossA = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.5, 0.56, 0.09)), trimDark);
    const crossB = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.5, 0.09, 0.56)), trimDark);
    w.add(tire, rim, crossA, crossB);
    return w;
  };

  const wheelFLSteer = new THREE.Group();
  wheelFLSteer.position.set(1.42, 0.56, 1.82);
  const wheelFL = buildWheel();
  wheelFLSteer.add(wheelFL);

  const wheelFRSteer = new THREE.Group();
  wheelFRSteer.position.set(-1.42, 0.56, 1.82);
  const wheelFR = buildWheel();
  wheelFRSteer.add(wheelFR);

  const wheelRL = buildWheel();
  wheelRL.position.set(1.42, 0.56, -1.78);

  const wheelRR = buildWheel();
  wheelRR.position.set(-1.42, 0.56, -1.78);

  root.add(wheelFLSteer, wheelFRSteer, wheelRL, wheelRR);

  return {
    root,
    chassisPivot,
    doorPivot,
    steeringPivot,
    wheelFLSteer,
    wheelFRSteer,
    wheelFL,
    wheelFR,
    wheelRL,
    wheelRR,
    headlightMat,
    brakeLightMat,
    reverseLightMat,
    lightBeams,
    beaconMat,
    driverSeatOffset: new THREE.Vector3(0.62, 0.16, -0.14),
    boardOutsideOffset: new THREE.Vector3(2.48, 0, -0.05),
    disposables,
  };
}

export function updateCarRigVisuals(
  rig: DriveableCarRig,
  opts: {
    doorAngle: number;
    steerAngle: number;
    wheelSpin: number;
    headlightsOn: boolean;
    braking: boolean;
    reversing: boolean;
    pitchLean: number;
    rollLean: number;
  },
): void {
  // Negative Y rotation swings rear edge of left door (+X) outward away from cabin
  rig.doorPivot.rotation.y = -THREE.MathUtils.clamp(opts.doorAngle, 0, 1.25);

  rig.wheelFLSteer.rotation.y = opts.steerAngle;
  rig.wheelFRSteer.rotation.y = opts.steerAngle;
  rig.steeringPivot.rotation.z = -opts.steerAngle * 2.4;

  rig.wheelFL.rotation.x = opts.wheelSpin;
  rig.wheelFR.rotation.x = opts.wheelSpin;
  rig.wheelRL.rotation.x = opts.wheelSpin;
  rig.wheelRR.rotation.x = opts.wheelSpin;

  rig.chassisPivot.rotation.x = opts.pitchLean;
  rig.chassisPivot.rotation.z = opts.rollLean;

  rig.lightBeams.visible = opts.headlightsOn;
  rig.headlightMat.emissiveIntensity = opts.headlightsOn ? 1.85 : 0.25;
  rig.brakeLightMat.emissiveIntensity = opts.braking ? 2.6 : opts.headlightsOn ? 0.7 : 0.25;
  rig.reverseLightMat.emissiveIntensity = opts.reversing ? 2.1 : 0.08;
}
