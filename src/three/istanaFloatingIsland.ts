import * as THREE from 'three';
import { MaterialPalette } from './materials';

export interface IstanaVoxelSpec {
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  color: number;
}

export interface IstanaFloatingRig {
  istanaGroup: THREE.Group;
  istanaDome: THREE.Mesh;
  domeUniforms: { uTime: { value: number } };
  bridgeUniforms: { uTime: { value: number } };
  skyBridgeGroup: THREE.Group;
  disposables: Array<{ dispose: () => void }>;
}

function hash2(x: number, z: number): number {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function buildInstancedBatch(
  specs: IstanaVoxelSpec[],
  material: THREE.Material,
  castShadow: boolean,
  receiveShadow: boolean,
): THREE.InstancedMesh {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mesh = new THREE.InstancedMesh(geo, material, Math.max(1, specs.length));
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  for (let i = 0; i < specs.length; i++) {
    const s = specs[i];
    dummy.position.set(s.x, s.y, s.z);
    dummy.scale.set(s.sx, s.sy, s.sz);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    col.setHex(s.color);
    mesh.setColorAt(i, col);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
  return mesh;
}

function createComingSoonTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  // Deep armored glass backdrop
  const grad = ctx.createLinearGradient(0, 0, 0, 160);
  grad.addColorStop(0, '#0f2942');
  grad.addColorStop(0.5, '#0c4a6e');
  grad.addColorStop(1, '#082f49');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 160);

  // Subtle pixel grid overlay
  ctx.fillStyle = 'rgba(103, 232, 249, 0.08)';
  for (let x = 0; x < 512; x += 16) {
    ctx.fillRect(x, 0, 1, 160);
  }
  for (let y = 0; y < 160; y += 16) {
    ctx.fillRect(0, y, 512, 1);
  }

  // Luminous cyan outer & inner frame
  ctx.strokeStyle = '#67e8f9';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 144);
  ctx.strokeStyle = '#e0f2fe';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, 476, 124);

  // Corner tech brackets
  ctx.fillStyle = '#a5f3fc';
  [
    [14, 14],
    [480, 14],
    [14, 128],
    [480, 128],
  ].forEach(([bx, by]) => {
    ctx.fillRect(bx, by, 18, 18);
  });

  // Main COMING SOON text with crisp cyan halo
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 54px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.shadowColor = '#22d3ee';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#e0f2fe';
  ctx.fillText('COMING SOON', 256, 82);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#083344';
  ctx.lineWidth = 3;
  ctx.strokeText('COMING SOON', 256, 82);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('COMING SOON', 256, 82);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createHexShieldMaterial(domeUniforms: { uTime: { value: number } }): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: domeUniforms.uTime,
      uColorCore: { value: new THREE.Color(0x22d3ee) },
      uColorRim: { value: new THREE.Color(0xa5f3fc) },
    },
    vertexShader: `
      varying vec3 vWorldNormal;
      varying vec3 vLocalPos;
      varying vec3 vViewDir;

      void main() {
        vLocalPos = position;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorCore;
      uniform vec3 uColorRim;
      varying vec3 vWorldNormal;
      varying vec3 vLocalPos;
      varying vec3 vViewDir;

      // Exact hexagonal distance field on 2D plane
      float hexDist(vec2 p) {
        p = abs(p);
        float c = dot(p, normalize(vec2(1.0, 1.7320508)));
        return max(c, p.x);
      }

      float hexGrid(vec2 uv) {
        vec2 r = vec2(1.0, 1.7320508);
        vec2 h = r * 0.5;
        vec2 a = mod(uv, r) - h;
        vec2 b = mod(uv - h, r) - h;
        vec2 gv = dot(a, a) < dot(b, b) ? a : b;
        float d = 0.5 - hexDist(gv);
        return smoothstep(0.0, 0.055, d);
      }

      void main() {
        vec3 n = normalize(vWorldNormal);
        vec3 v = normalize(vViewDir);
        float ndotv = abs(dot(n, v));
        float fresnel = pow(1.0 - clamp(ndotv, 0.0, 1.0), 2.15);

        // Seamless triplanar-blended hex coordinates across the 120m dome sphere
        vec3 dir = normalize(vLocalPos);
        float scale = 15.5;
        float hxY = hexGrid(dir.xz * scale);
        float hxX = hexGrid(dir.zy * scale);
        float hxZ = hexGrid(dir.xy * scale);
        vec3 w = abs(dir);
        w = pow(w, vec3(4.0));
        w /= max(0.001, w.x + w.y + w.z);
        float hexCell = hxX * w.x + hxY * w.y + hxZ * w.z;
        float hexEdge = 1.0 - hexCell;

        // Animated energy scan wave & equatorial ring glow near island rim (y ≈ -4..+6)
        float scan = 0.5 + 0.5 * sin(dir.y * 14.0 - uTime * 2.1);
        float crestHighlight = smoothstep(0.58, 0.98, dir.y) * 0.45;
        float equatorGlow = exp(-pow((vLocalPos.y + 1.5) / 5.5, 2.0)) * 0.52;

        // Cut cleanly below the cloud belly so bottom dome doesn't float awkwardly far below clouds
        float bottomFade = smoothstep(-28.0, -6.0, vLocalPos.y);

        float hexGlow = hexEdge * (0.36 + 0.54 * fresnel + 0.28 * crestHighlight + 0.25 * scan);
        float alpha = (0.10 + fresnel * 0.48 + hexGlow * 0.42 + equatorGlow * 0.35) * bottomFade;
        alpha = clamp(alpha, 0.0, 0.78);

        vec3 col = mix(uColorCore, uColorRim, clamp(fresnel * 0.85 + hexEdge * 0.55 + crestHighlight, 0.0, 1.0));
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

function pushVoxelDome(
  goldSpecs: IstanaVoxelSpec[],
  cx: number,
  baseY: number,
  cz: number,
  radius: number,
  height: number,
  step: number,
  goldPalette: number[],
): void {
  const layers = Math.max(4, Math.round(height / step));
  const layerH = height / layers;
  const maxGrid = Math.ceil(radius / step);

  for (let li = 0; li < layers; li++) {
    const t = (li + 0.35) / layers;
    // Slight onion-dome fullness matching the golden dome in the overview
    const profile = Math.cos(Math.pow(t, 1.18) * (Math.PI * 0.5));
    const rLayer = Math.max(step * 0.55, radius * profile);
    const rPrev =
      li === layers - 1
        ? 0
        : Math.max(0, radius * Math.cos(Math.pow((li + 1.35) / layers, 1.18) * (Math.PI * 0.5)));
    const innerBound = Math.max(0, rPrev - step * 0.95);
    const y = baseY + (li + 0.5) * layerH;

    for (let gx = -maxGrid; gx <= maxGrid; gx++) {
      for (let gz = -maxGrid; gz <= maxGrid; gz++) {
        const ox = gx * step;
        const oz = gz * step;
        const dist = Math.hypot(ox, oz);
        if (dist <= rLayer && dist >= innerBound) {
          const shadeIdx = Math.abs(gx * 3 + gz * 5 + li * 2) % goldPalette.length;
          goldSpecs.push({
            x: cx + ox,
            y,
            z: cz + oz,
            sx: step * 1.03,
            sy: layerH * 1.05,
            sz: step * 1.03,
            color: goldPalette[shadeIdx],
          });
        }
      }
    }
  }
}

export function buildIstanaFloatingIsland(
  palette: MaterialPalette,
  anchor: { x: number; y: number; z: number },
  bridgeStart: { x: number; y: number; z: number },
  lowDetail = false,
): IstanaFloatingRig {
  const disposables: Array<{ dispose: () => void }> = [];

  // Direction from Istana center to the bridgehead on Menara Waktu
  const toBridgeX = bridgeStart.x - anchor.x;
  const toBridgeZ = bridgeStart.z - anchor.z;
  const totalCenterDist = Math.hypot(toBridgeX, toBridgeZ) || 1;
  const dirX = toBridgeX / totalCenterDist;
  const dirZ = toBridgeZ / totalCenterDist;
  const yawToBridge = Math.atan2(dirX, dirZ);

  const istanaGroup = new THREE.Group();
  istanaGroup.position.set(anchor.x, anchor.y, anchor.z);
  istanaGroup.rotation.y = yawToBridge; // Local +Z faces directly toward Menara Waktu & Light Bridge!

  const terrainSpecs: IstanaVoxelSpec[] = [];
  const marbleSpecs: IstanaVoxelSpec[] = [];
  const goldSpecs: IstanaVoxelSpec[] = [];
  const glassSpecs: IstanaVoxelSpec[] = [];

  const grassGreens = [0x65a30d, 0x5fa832, 0x71bd3d, 0x4d7c0f];
  const dirtBrowns = [0x78543a, 0x5d402a, 0x6b4b33];
  const cliffSlates = [0x475569, 0x334155, 0x1e293b, 0x52525b];
  const cloudWhites = [0xffffff, 0xf8fafc, 0xf1f5f9, 0xe2e8f0];
  const marbleWhites = [0xf8fafc, 0xf1f5f9, 0xe2e8f0];
  const marbleTrim = 0xcbd5e1;
  const goldPalette = [0xfacc15, 0xeab308, 0xfde047, 0xca8a04];

  // ============================================================================
  // 1. FLOATING ISLAND BASE (Total Panjang: 115m / 115 Blok Voxel -> r = 57.5m)
  // ============================================================================
  const islandRadius = 57.5;
  const grassStep = lowDetail ? 3.2 : 2.5;
  const maxGrassIdx = Math.ceil((islandRadius + 1.5) / grassStep);

  for (let gx = -maxGrassIdx; gx <= maxGrassIdx; gx++) {
    for (let gz = -maxGrassIdx; gz <= maxGrassIdx; gz++) {
      const wx = gx * grassStep;
      const wz = gz * grassStep;
      const dist = Math.hypot(wx, wz);
      const ang = Math.atan2(wz, wx);
      // Slight crisp voxel edge modulation keeping overall diameter right at 115m
      const rimR = islandRadius + Math.sin(ang * 7) * 0.75 + Math.cos(ang * 11) * 0.5;
      if (dist > rimR) continue;

      const h = hash2(gx + 13, gz - 7);
      const onWalkway = wz >= 28.0 && Math.abs(wx) <= 5.0;
      const onWalkwayCurb = wz >= 28.5 && Math.abs(wx) > 5.0 && Math.abs(wx) <= 6.2;

      if (onWalkway) {
        terrainSpecs.push({
          x: wx,
          y: -0.42,
          z: wz,
          sx: grassStep * 1.02,
          sy: 1.05,
          sz: grassStep * 1.02,
          color: h > 0.5 ? 0xe2e8f0 : 0xcbd5e1,
        });
      } else if (onWalkwayCurb) {
        terrainSpecs.push({
          x: wx,
          y: -0.25,
          z: wz,
          sx: grassStep * 1.02,
          sy: 1.3,
          sz: grassStep * 1.02,
          color: 0x94a3b8,
        });
      } else {
        const gCol = grassGreens[Math.floor(h * grassGreens.length) % grassGreens.length];
        terrainSpecs.push({
          x: wx,
          y: -0.5,
          z: wz,
          sx: grassStep * 1.02,
          sy: 1.0,
          sz: grassStep * 1.02,
          color: gCol,
        });
      }

      // Earth sub-layer along perimeter & outer band (avoid hidden core bloat)
      if (dist > 30.0) {
        const dCol = dirtBrowns[Math.floor(h * dirtBrowns.length) % dirtBrowns.length];
        terrainSpecs.push({
          x: wx,
          y: -1.75,
          z: wz,
          sx: grassStep * 1.02,
          sy: 1.5,
          sz: grassStep * 1.02,
          color: dCol,
        });
      }
    }
  }

  // Tapered Dark Rock / Slate Cliff Underside (y = -2.5m down to -26m)
  const rockStep = lowDetail ? 4.8 : 4.0;
  const maxRockIdx = Math.ceil(56 / rockStep);
  for (let rx = -maxRockIdx; rx <= maxRockIdx; rx++) {
    for (let rz = -maxRockIdx; rz <= maxRockIdx; rz++) {
      const wx = rx * rockStep;
      const wz = rz * rockStep;
      const dist = Math.hypot(wx, wz);
      const ang = Math.atan2(wz, wx);
      const outerLimit = 54.5 + Math.sin(ang * 5) * 1.2;
      if (dist > outerLimit) continue;

      const tNorm = dist / outerLimit;
      const noise = hash2(rx * 3 + 5, rz * 3 - 11);
      // Taper inward toward center keel like an inverted jagged floating rock spire
      const colDepth = Math.max(
        4.5,
        (1.0 - Math.pow(tNorm, 1.35)) * 22.5 + noise * 5.2,
      );
      const cCol = cliffSlates[Math.floor(noise * cliffSlates.length) % cliffSlates.length];
      terrainSpecs.push({
        x: wx,
        y: -2.4 - colDepth * 0.5,
        z: wz,
        sx: rockStep * 1.03,
        sy: colDepth,
        sz: rockStep * 1.03,
        color: cCol,
      });
    }
  }

  // Billowing White Stepped Voxel Clouds hugging underside & outer perimeter
  const cloudAnchorRing: Array<[number, number, number, number, number, number]> = [
    // [x, y, z, sx, sy, sz]
    [0, -25.0, 0, 44, 6.5, 42],
    [-32, -16.5, 22, 34, 7.5, 28],
    [34, -15.5, 24, 32, 7.0, 28],
    [-36, -14.0, -22, 36, 8.0, 32],
    [36, -15.0, -26, 34, 7.5, 30],
    [0, -17.5, -42, 42, 7.5, 26],
    [0, -18.5, 36, 36, 6.5, 22],
    [-54, -9.5, 6, 22, 6.0, 24],
    [54, -10.5, -4, 24, 6.5, 26],
    [-48, -11.0, -34, 24, 6.5, 22],
    [48, -11.0, -36, 24, 6.5, 22],
    [42, -11.5, 38, 22, 6.0, 20],
    [-42, -12.0, 38, 20, 5.5, 18],
    // Stepped upper cloud puffs peeking softly around outer rim
    [-60, -5.5, -14, 16, 4.5, 16],
    [61, -6.0, -18, 18, 4.5, 16],
    [-22, -7.5, -58, 22, 5.0, 16],
    [24, -7.0, -58, 22, 5.0, 16],
  ];
  cloudAnchorRing.forEach(([cx, cy, cz, sx, sy, sz], ci) => {
    terrainSpecs.push({
      x: cx,
      y: cy,
      z: cz,
      sx,
      sy,
      sz,
      color: cloudWhites[ci % cloudWhites.length],
    });
    // Secondary stepped upper puff on each cloud bank for authentic blocky Minecraft cloud silhouette
    terrainSpecs.push({
      x: cx + (ci % 2 === 0 ? 3.5 : -3.5),
      y: cy + sy * 0.48,
      z: cz + (ci % 3 === 0 ? -2.5 : 2.5),
      sx: sx * 0.66,
      sy: sy * 0.58,
      sz: sz * 0.66,
      color: 0xffffff,
    });
  });

  // ============================================================================
  // 2. MANICURED GARDENS, HEDGES, FLOWERS & VOXEL PARK TREES (Human-Proportional)
  // ============================================================================
  const pushGardenHedgeRect = (x0: number, x1: number, z0: number, z1: number) => {
    const hH = 1.25;
    const hW = 1.3;
    const midX = (x0 + x1) * 0.5;
    const midZ = (z0 + z1) * 0.5;
    const lenX = x1 - x0;
    const lenZ = z1 - z0;
    // Outer frame edges (leaving front gap)
    terrainSpecs.push(
      { x: midX, y: hH * 0.5, z: z0, sx: lenX, sy: hH, sz: hW, color: 0x15803d },
      { x: midX, y: hH * 0.5, z: z1, sx: lenX, sy: hH, sz: hW, color: 0x166534 },
      { x: x0, y: hH * 0.5, z: midZ, sx: hW, sy: hH, sz: lenZ, color: 0x15803d },
      { x: x1, y: hH * 0.5, z: midZ, sx: hW, sy: hH, sz: lenZ, color: 0x166534 },
    );
    // Inner flower tufts & manicured shrub beds
    const flowerPalette = [0xf43f5e, 0xfacc15, 0xfb923c, 0xec4899, 0xfef08a];
    let fi = 0;
    for (let fx = x0 + 2.4; fx <= x1 - 2.4; fx += 3.2) {
      for (let fz = z0 + 2.4; fz <= z1 - 2.4; fz += 3.2) {
        if ((fi % 3) === 0) {
          terrainSpecs.push({ x: fx, y: 0.45, z: fz, sx: 1.5, sy: 0.9, sz: 1.5, color: 0x22c55e });
        } else {
          terrainSpecs.push({
            x: fx,
            y: 0.35,
            z: fz,
            sx: 1.0,
            sy: 0.65,
            sz: 1.0,
            color: flowerPalette[fi % flowerPalette.length],
          });
        }
        fi++;
      }
    }
  };

  // Symmetrical Front-Left & Front-Right Formal Palace Gardens (matching image!)
  pushGardenHedgeRect(-26.5, -10.5, 34.0, 48.5);
  pushGardenHedgeRect(10.5, 26.5, 34.0, 48.5);
  // Outer Side Garden Beds
  pushGardenHedgeRect(-43.0, -34.5, -12.0, 14.0);
  pushGardenHedgeRect(34.5, 43.0, -12.0, 14.0);

  const pushVoxelTree = (tx: number, tz: number, trunkH: number, crownW: number, shade: number) => {
    // Oak trunk (human-proportional 0.9m..1.1m wide)
    terrainSpecs.push({
      x: tx,
      y: trunkH * 0.5,
      z: tz,
      sx: 1.05,
      sy: trunkH,
      sz: 1.05,
      color: 0x5c3a1e,
    });
    // Tiered blocky voxel foliage canopy
    terrainSpecs.push(
      {
        x: tx,
        y: trunkH + crownW * 0.34,
        z: tz,
        sx: crownW,
        sy: crownW * 0.55,
        sz: crownW,
        color: shade === 0 ? 0x16a34a : 0x22c55e,
      },
      {
        x: tx,
        y: trunkH + crownW * 0.72,
        z: tz,
        sx: crownW * 0.68,
        sy: crownW * 0.44,
        sz: crownW * 0.68,
        color: 0x4ade80,
      },
    );
  };

  // Lush Voxel Trees framing Front Gardens, Side Lawns & Rear Parkland
  [
    [-33.0, 38.0, 3.6, 4.4, 0],
    [-21.0, 45.0, 3.2, 3.8, 1],
    [33.0, 38.0, 3.6, 4.4, 1],
    [21.0, 45.0, 3.2, 3.8, 0],
    [-40.5, 22.0, 4.0, 4.6, 0],
    [40.5, 22.0, 4.0, 4.6, 1],
    [-42.0, -4.0, 4.2, 4.8, 1],
    [42.0, -4.0, 4.2, 4.8, 0],
    [-39.0, -28.0, 3.8, 4.4, 0],
    [39.0, -28.0, 3.8, 4.4, 1],
    [-22.0, -40.0, 4.0, 4.5, 1],
    [22.0, -40.0, 4.0, 4.5, 0],
    [0.0, -44.0, 4.4, 5.0, 0],
  ].forEach(([tx, tz, th, cw, sh]) => pushVoxelTree(tx, tz, th, cw, sh));

  // Perimeter shrubs along the 115m circular grass rim + golden walkway bollards
  for (let a = 0; a < 24; a++) {
    const ang = (a / 24) * Math.PI * 2;
    const bx = Math.cos(ang) * 53.5;
    const bz = Math.sin(ang) * 53.5;
    if (bz > 49.0 && Math.abs(bx) < 9.0) continue; // keep front bridge gate open
    terrainSpecs.push({
      x: bx,
      y: 0.55,
      z: bz,
      sx: 1.8,
      sy: 1.1,
      sz: 1.8,
      color: a % 2 === 0 ? 0x15803d : 0x22c55e,
    });
  }
  [35.0, 42.0, 49.0].forEach((lz) => {
    [-5.8, 5.8].forEach((lx) => {
      marbleSpecs.push({ x: lx, y: 0.75, z: lz, sx: 0.75, sy: 1.5, sz: 0.75, color: marbleTrim });
      goldSpecs.push({ x: lx, y: 1.7, z: lz, sx: 0.62, sy: 0.55, sz: 0.62, color: 0xfde047 });
    });
  });

  // ============================================================================
  // 3. ISTANA MARMER & EMAS (65m x 55m footprint, Tinggi Kubah Istana: 48m!)
  // ============================================================================
  // 3a. Raised Marble Podium Plinth (y = 0 .. 3.5m)
  marbleSpecs.push(
    { x: 0, y: 0.9, z: 0, sx: 64.5, sy: 1.8, sz: 54.0, color: marbleTrim },
    { x: 0, y: 2.6, z: 0, sx: 62.5, sy: 1.8, sz: 51.5, color: marbleWhites[1] },
  );

  // Grand Central Front Marble Staircase (16.8m wide, z = +24.5..+32.5, 7 stepped tiers)
  for (let s = 0; s < 7; s++) {
    const sy = 0.5;
    const y = (s + 0.5) * sy;
    const zFront = 32.2 - s * 1.15;
    marbleSpecs.push({
      x: 0,
      y,
      z: zFront,
      sx: 16.4 - s * 0.12,
      sy,
      sz: 1.25,
      color: s % 2 === 0 ? marbleWhites[0] : marbleWhites[1],
    });
  }
  // Stepped Staircase Balustrade Cheek Walls + Golden Urns
  [-9.1, 9.1].forEach((cx) => {
    marbleSpecs.push({ x: cx, y: 1.8, z: 28.5, sx: 1.5, sy: 3.6, sz: 8.6, color: marbleTrim });
    goldSpecs.push({ x: cx, y: 4.0, z: 32.0, sx: 1.1, sy: 0.85, sz: 1.1, color: goldPalette[0] });
  });

  // 3b. Main Two-Story White Marble Palace Wings (57m between corner tower centers, y = 3.5 .. 21.5m)
  const wingBaseY = 3.5;
  const wingH = 18.0; // reaches y = 21.5m
  marbleSpecs.push({
    x: 0,
    y: wingBaseY + wingH * 0.5,
    z: -1.0,
    sx: 55.0,
    sy: wingH,
    sz: 42.5,
    color: marbleWhites[0],
  });
  // Horizontal Gold Belt Course (mid-story y = 12.2m) & Roof Cornice (y = 21.6m)
  goldSpecs.push(
    { x: 0, y: 12.2, z: -1.0, sx: 56.2, sy: 0.85, sz: 43.6, color: goldPalette[1] },
    { x: 0, y: 21.7, z: -1.0, sx: 57.0, sy: 1.1, sz: 44.4, color: goldPalette[0] },
  );
  // Golden Crenellated Parapet Battlements around the 22m Wing Roofline
  for (let px = -24.0; px <= 24.0; px += 3.0) {
    if (Math.abs(px) < 10.5) continue; // portico covers front center
    goldSpecs.push({ x: px, y: 22.85, z: 20.4, sx: 1.45, sy: 1.25, sz: 0.9, color: goldPalette[0] });
  }
  for (let px = -24.0; px <= 24.0; px += 3.0) {
    goldSpecs.push({ x: px, y: 22.85, z: -22.4, sx: 1.45, sy: 1.25, sz: 0.9, color: goldPalette[0] });
  }
  for (let pz = -18.0; pz <= 16.0; pz += 3.2) {
    goldSpecs.push(
      { x: -27.7, y: 22.85, z: pz, sx: 0.9, sy: 1.25, sz: 1.45, color: goldPalette[0] },
      { x: 27.7, y: 22.85, z: pz, sx: 0.9, sy: 1.25, sz: 1.45, color: goldPalette[0] },
    );
  }

  // Facade Pilasters & Two-Tier Tall Arched Palace Windows (Front, Back, Left, Right)
  const frontBackBaysX = [-21.5, -15.5, 15.5, 21.5];
  frontBackBaysX.forEach((bx) => {
    [20.4, -22.4].forEach((bz) => {
      // Recessed Lower & Upper Palace Windows
      glassSpecs.push(
        { x: bx, y: 8.0, z: bz, sx: 2.2, sy: 4.8, sz: 0.45, color: 0x1e3a8a },
        { x: bx, y: 16.6, z: bz, sx: 2.2, sy: 5.4, sz: 0.45, color: 0x1e3a8a },
      );
      goldSpecs.push(
        { x: bx, y: 5.4, z: bz + (bz > 0 ? 0.15 : -0.15), sx: 2.6, sy: 0.45, sz: 0.55, color: goldPalette[1] },
        { x: bx, y: 13.7, z: bz + (bz > 0 ? 0.15 : -0.15), sx: 2.6, sy: 0.45, sz: 0.55, color: goldPalette[1] },
      );
    });
  });
  // Center Back Bays
  [-6.5, 0, 6.5].forEach((bx) => {
    glassSpecs.push(
      { x: bx, y: 8.0, z: -22.4, sx: 2.2, sy: 4.8, sz: 0.45, color: 0x1e3a8a },
      { x: bx, y: 16.6, z: -22.4, sx: 2.2, sy: 5.4, sz: 0.45, color: 0x1e3a8a },
    );
  });
  // Vertical Pilasters along Front & Back Facades
  [-24.5, -18.5, -12.5, 12.5, 18.5, 24.5].forEach((px) => {
    [20.45, -22.45].forEach((pz) => {
      marbleSpecs.push({ x: px, y: 12.5, z: pz, sx: 1.15, sy: 18.0, sz: 0.85, color: marbleWhites[2] });
    });
  });

  // Side Wing Windows & Pilasters (Left x = -27.7, Right x = +27.7)
  [-15.0, -9.0, -3.0, 3.0, 9.0, 15.0].forEach((bz) => {
    [-27.7, 27.7].forEach((bx) => {
      glassSpecs.push(
        { x: bx, y: 8.0, z: bz, sx: 0.45, sy: 4.8, sz: 2.2, color: 0x1e3a8a },
        { x: bx, y: 16.6, z: bz, sx: 0.45, sy: 5.4, sz: 2.2, color: 0x1e3a8a },
      );
      goldSpecs.push(
        { x: bx + (bx > 0 ? 0.15 : -0.15), y: 13.7, z: bz, sx: 0.55, sy: 0.45, sz: 2.6, color: goldPalette[1] },
      );
    });
  });
  [-18.0, -12.0, -6.0, 0.0, 6.0, 12.0, 18.0].forEach((pz) => {
    [-27.75, 27.75].forEach((px) => {
      marbleSpecs.push({ x: px, y: 12.5, z: pz, sx: 0.85, sy: 18.0, sz: 1.15, color: marbleWhites[2] });
    });
  });

  // 3c. Grand Front Portico, 4 Marble Columns, Royal Double Doors & Stepped Golden Pediment
  // Portico floor extension
  marbleSpecs.push({ x: 0, y: 1.75, z: 23.6, sx: 21.5, sy: 3.5, sz: 7.2, color: marbleWhites[1] });
  // Royal Double Doors recessed at z = 20.55 (5.6m wide x 8.4m tall!)
  glassSpecs.push({ x: 0, y: 7.8, z: 20.5, sx: 5.6, sy: 8.4, sz: 0.55, color: 0x78350f });
  goldSpecs.push(
    { x: 0, y: 12.3, z: 20.6, sx: 6.8, sy: 1.0, sz: 0.75, color: goldPalette[0] },
    { x: -3.1, y: 7.8, z: 20.6, sx: 0.7, sy: 8.4, sz: 0.75, color: goldPalette[0] },
    { x: 3.1, y: 7.8, z: 20.6, sx: 0.7, sy: 8.4, sz: 0.75, color: goldPalette[0] },
  );
  // 4 Tall Marble Portico Columns (y = 3.5 .. 16.0m)
  [-8.2, -3.4, 3.4, 8.2].forEach((cx) => {
    marbleSpecs.push(
      { x: cx, y: 4.1, z: 26.2, sx: 2.1, sy: 1.2, sz: 2.1, color: marbleTrim },
      { x: cx, y: 9.8, z: 26.2, sx: 1.35, sy: 10.2, sz: 1.35, color: marbleWhites[0] },
    );
    goldSpecs.push({ x: cx, y: 15.4, z: 26.2, sx: 2.15, sy: 1.1, sz: 2.15, color: goldPalette[0] });
  });
  // Marble Entablature Beam + Triangular Stepped Golden Voxel Pediment Gable (y = 16.0 .. 23.2m)
  marbleSpecs.push({ x: 0, y: 16.4, z: 23.8, sx: 21.8, sy: 1.1, sz: 8.6, color: marbleWhites[1] });
  for (let p = 0; p < 6; p++) {
    const pw = 22.0 - p * 3.4;
    const py = 17.4 + p * 1.0;
    goldSpecs.push({
      x: 0,
      y: py,
      z: 24.0,
      sx: pw,
      sy: 1.05,
      sz: 9.0,
      color: goldPalette[p % goldPalette.length],
    });
    if (p < 4) {
      marbleSpecs.push({
        x: 0,
        y: py - 0.1,
        z: 28.4,
        sx: Math.max(2.0, pw - 3.0),
        sy: 0.9,
        sz: 0.45,
        color: marbleWhites[2],
      });
    }
  }

  // 3d. 4 Outer Corner Towers (at (±28.5, ±23.5) -> outer edges span exact 65.0m x 55.0m!)
  const cornerCoords: Array<[number, number]> = [
    [-28.5, 23.5],
    [28.5, 23.5],
    [-28.5, -23.5],
    [28.5, -23.5],
  ];
  cornerCoords.forEach(([tx, tz]) => {
    // 8.0m x 8.0m Marble Shaft (y = 3.5 .. 27.5m)
    marbleSpecs.push(
      { x: tx, y: 15.5, z: tz, sx: 8.0, sy: 24.0, sz: 8.0, color: marbleWhites[0] },
      { x: tx, y: 15.5, z: tz, sx: 8.4, sy: 24.0, sz: 1.6, color: marbleWhites[2] },
      { x: tx, y: 15.5, z: tz, sx: 1.6, sy: 24.0, sz: 8.4, color: marbleWhites[2] },
    );
    // Tall Tower Windows on outer faces
    const signX = tx > 0 ? 1 : -1;
    const signZ = tz > 0 ? 1 : -1;
    glassSpecs.push(
      { x: tx, y: 17.5, z: tz + signZ * 4.05, sx: 2.0, sy: 6.2, sz: 0.35, color: 0x1e3a8a },
      { x: tx + signX * 4.05, y: 17.5, z: tz, sx: 0.35, sy: 6.2, sz: 2.0, color: 0x1e3a8a },
      { x: tx, y: 8.5, z: tz + signZ * 4.05, sx: 2.0, sy: 4.5, sz: 0.35, color: 0x1e3a8a },
      { x: tx + signX * 4.05, y: 8.5, z: tz, sx: 0.35, sy: 4.5, sz: 2.0, color: 0x1e3a8a },
    );
    // Golden Mid-Belt & Crown Cornice Collar
    goldSpecs.push(
      { x: tx, y: 12.2, z: tz, sx: 8.7, sy: 0.85, sz: 8.7, color: goldPalette[1] },
      { x: tx, y: 27.6, z: tz, sx: 9.0, sy: 1.4, sz: 9.0, color: goldPalette[0] },
    );
    // Stepped Golden Voxel Cupola (y = 28.3 .. 35.8m) + Spire
    pushVoxelDome(goldSpecs, tx, 28.3, tz, 3.8, 7.2, 1.0, goldPalette);
    goldSpecs.push({ x: tx, y: 37.2, z: tz, sx: 0.65, sy: 3.4, sz: 0.65, color: goldPalette[2] });
  });

  // 3e. 4 Inner Minaret Turrets flanking the Central Dome at (±13.5, ±13.5)
  [
    [-13.5, 13.5],
    [13.5, 13.5],
    [-13.5, -13.5],
    [13.5, -13.5],
  ].forEach(([mx, mz]) => {
    marbleSpecs.push({ x: mx, y: 27.2, z: mz, sx: 5.2, sy: 11.4, sz: 5.2, color: marbleWhites[0] });
    glassSpecs.push(
      { x: mx, y: 28.0, z: mz + 2.65, sx: 1.6, sy: 4.4, sz: 0.3, color: 0x1e3a8a },
      { x: mx, y: 28.0, z: mz - 2.65, sx: 1.6, sy: 4.4, sz: 0.3, color: 0x1e3a8a },
      { x: mx + 2.65, y: 28.0, z: mz, sx: 0.3, sy: 4.4, sz: 1.6, color: 0x1e3a8a },
      { x: mx - 2.65, y: 28.0, z: mz, sx: 0.3, sy: 4.4, sz: 1.6, color: 0x1e3a8a },
    );
    goldSpecs.push({ x: mx, y: 33.0, z: mz, sx: 5.9, sy: 1.0, sz: 5.9, color: goldPalette[0] });
    pushVoxelDome(goldSpecs, mx, 33.5, mz, 2.55, 4.8, 0.85, goldPalette);
    goldSpecs.push({ x: mx, y: 39.6, z: mz, sx: 0.5, sy: 2.6, sz: 0.5, color: goldPalette[2] });
  });

  // 3f. Central Clerestory Drum (y = 21.5 .. 32.5m) + Colossal 48m Main Golden Voxel Dome!
  marbleSpecs.push(
    { x: 0, y: 27.0, z: 0, sx: 22.0, sy: 11.0, sz: 22.0, color: marbleWhites[0] },
    { x: 0, y: 27.0, z: 0, sx: 24.2, sy: 11.0, sz: 16.5, color: marbleWhites[1] },
    { x: 0, y: 27.0, z: 0, sx: 16.5, sy: 11.0, sz: 24.2, color: marbleWhites[1] },
  );
  // Clerestory arched windows around the drum
  [-5.2, 0, 5.2].forEach((off) => {
    glassSpecs.push(
      { x: off, y: 27.4, z: 12.15, sx: 2.0, sy: 5.2, sz: 0.35, color: 0x1e3a8a },
      { x: off, y: 27.4, z: -12.15, sx: 2.0, sy: 5.2, sz: 0.35, color: 0x1e3a8a },
      { x: 12.15, y: 27.4, z: off, sx: 0.35, sy: 5.2, sz: 2.0, color: 0x1e3a8a },
      { x: -12.15, y: 27.4, z: off, sx: 0.35, sy: 5.2, sz: 2.0, color: 0x1e3a8a },
    );
  });
  // Golden Drum Cornice Ring
  goldSpecs.push(
    { x: 0, y: 32.3, z: 0, sx: 23.4, sy: 1.2, sz: 23.4, color: goldPalette[0] },
    { x: 0, y: 32.3, z: 0, sx: 25.4, sy: 1.2, sz: 17.6, color: goldPalette[1] },
    { x: 0, y: 32.3, z: 0, sx: 17.6, sy: 1.2, sz: 25.4, color: goldPalette[1] },
  );

  // Main Central Stepped Golden Voxel Dome: y = 32.8m .. 48.0m! (Exact Tinggi Kubah Istana: 48m!)
  pushVoxelDome(goldSpecs, 0, 32.8, 0, 11.2, 15.2, 1.25, goldPalette);
  // Gleaming Royal Golden Finial Spire atop the 48m Dome (y = 48.0 .. 54.0m)
  goldSpecs.push(
    { x: 0, y: 48.6, z: 0, sx: 2.4, sy: 1.2, sz: 2.4, color: goldPalette[0] },
    { x: 0, y: 50.6, z: 0, sx: 1.1, sy: 3.4, sz: 1.1, color: goldPalette[2] },
    { x: 0, y: 53.1, z: 0, sx: 0.55, sy: 2.2, sz: 0.55, color: 0xfef08a },
  );

  // Build InstancedMesh batches inside istanaGroup
  const terrainVoxelMat = palette.createSurfaceMat({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.02,
  });
  const marbleVoxelMat = palette.createSurfaceMat({
    color: 0xffffff,
    roughness: 0.34,
    metalness: 0.08,
  });
  const goldVoxelMat = palette.createSurfaceMat({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.84,
  });
  const glassVoxelMat = palette.createSurfaceMat({
    color: 0xffffff,
    emissive: 0x0f172a,
    emissiveIntensity: 0.25,
    roughness: 0.14,
    metalness: 0.28,
  });

  const terrainBatch = buildInstancedBatch(terrainSpecs, terrainVoxelMat, true, true);
  const marbleBatch = buildInstancedBatch(marbleSpecs, marbleVoxelMat, true, true);
  const goldBatch = buildInstancedBatch(goldSpecs, goldVoxelMat, true, true);
  const glassBatch = buildInstancedBatch(glassSpecs, glassVoxelMat, false, true);
  istanaGroup.add(terrainBatch, marbleBatch, goldBatch, glassBatch);
  disposables.push(
    terrainVoxelMat,
    marbleVoxelMat,
    goldVoxelMat,
    glassVoxelMat,
    terrainBatch.geometry,
    marbleBatch.geometry,
    goldBatch.geometry,
    glassBatch.geometry,
  );

  // ============================================================================
  // 4. "COMING SOON" GATE ON FRONT RIM OF THE 115m FLOATING ISLAND
  // ============================================================================
  const gateGroup = new THREE.Group();
  gateGroup.position.set(0, 0, 56.2);

  const pylonMat = palette.getMat(0xf8fafc, 'gloss');
  const neonCyanMat = palette.createSurfaceMat({
    color: 0x67e8f9,
    emissive: 0x22d3ee,
    emissiveIntensity: 1.15,
    roughness: 0.15,
    metalness: 0.1,
  });
  const barrierSheetMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const signTex = createComingSoonTexture(4);
  const signMat = new THREE.MeshStandardMaterial({
    map: signTex,
    emissive: 0x0ea5e9,
    emissiveMap: signTex,
    emissiveIntensity: 0.72,
    roughness: 0.2,
    metalness: 0.1,
  });

  const pylonGeo = new THREE.BoxGeometry(1.35, 6.4, 1.35);
  const pylonTrimGeo = new THREE.BoxGeometry(0.42, 6.2, 1.48);
  [-4.8, 4.8].forEach((px) => {
    const pylon = new THREE.Mesh(pylonGeo, pylonMat);
    pylon.position.set(px, 3.2, 0);
    pylon.castShadow = true;
    const strip = new THREE.Mesh(pylonTrimGeo, neonCyanMat);
    strip.position.set(px, 3.2, 0);
    gateGroup.add(pylon, strip);
  });

  const signBoardGeo = new THREE.BoxGeometry(10.8, 3.0, 0.7);
  const signBoard = new THREE.Mesh(signBoardGeo, signMat);
  signBoard.position.set(0, 5.4, 0);
  const barrierGeo = new THREE.PlaneGeometry(8.4, 4.1);
  const barrierSheet = new THREE.Mesh(barrierGeo, barrierSheetMat);
  barrierSheet.position.set(0, 2.05, 0);
  gateGroup.add(signBoard, barrierSheet);
  istanaGroup.add(gateGroup);
  disposables.push(
    neonCyanMat,
    barrierSheetMat,
    signTex,
    signMat,
    pylonGeo,
    pylonTrimGeo,
    signBoardGeo,
    barrierGeo,
  );

  // ============================================================================
  // 5. PERISAI ENERGI (Diameter 120m -> Sphere Radius 60.0m) WITH HEX GRID SHADER
  // ============================================================================
  const domeUniforms = { uTime: { value: 0 } };
  const istanaDomeMat = createHexShieldMaterial(domeUniforms);
  const istanaDomeGeo = new THREE.SphereGeometry(60.0, 56, 38);
  const istanaDome = new THREE.Mesh(istanaDomeGeo, istanaDomeMat);
  istanaDome.position.set(0, 1.5, 0);
  istanaDome.renderOrder = 6;
  istanaGroup.add(istanaDome);
  disposables.push(istanaDomeGeo, istanaDomeMat);

  // ============================================================================
  // 6. JEMBATAN CAHAYA (Lebar 6m, Terputus) + GRASSY CLIFF BRIDGEHEAD POSTS
  // ============================================================================
  const skyBridgeGroup = new THREE.Group();
  const bridgeUniforms = { uTime: { value: 0 } };

  // End point on Istana rim at local (0, 0, 56.8) in world space
  const endWorldX = anchor.x + dirX * 56.8;
  const endWorldY = anchor.y;
  const endWorldZ = anchor.z + dirZ * 56.8;

  const bVecX = endWorldX - bridgeStart.x;
  const bVecY = endWorldY - bridgeStart.y;
  const bVecZ = endWorldZ - bridgeStart.z;
  const bridgeTotalLen = Math.hypot(bVecX, bVecY, bVecZ);
  const horizLen = Math.hypot(bVecX, bVecZ) || 1;
  const bridgePitch = Math.atan2(bVecY, horizLen);
  const bridgeYaw = Math.atan2(bVecX, bVecZ);

  const bridgeDeckMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.72,
    transparent: true,
    opacity: 0.56,
    roughness: 0.12,
    metalness: 0.2,
    depthWrite: false,
  });
  const bridgeRailMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x22d3ee,
    emissiveIntensity: 1.28,
    roughness: 0.15,
    metalness: 0.15,
  });
  disposables.push(bridgeDeckMat, bridgeRailMat);

  // Pivot bridge assembly at bridgeStart so local +Z runs straight up to Istana gate
  const spanPivot = new THREE.Group();
  spanPivot.position.set(bridgeStart.x, bridgeStart.y, bridgeStart.z);
  spanPivot.rotation.order = 'YXZ';
  spanPivot.rotation.y = bridgeYaw;
  spanPivot.rotation.x = -bridgePitch;

  // Segment 1 (t = 0.00 -> 0.30): Anchored to Menara Waktu grassy headland
  const seg1Len = bridgeTotalLen * 0.30;
  const seg1DeckGeo = new THREE.BoxGeometry(6.0, 0.55, seg1Len);
  const seg1Deck = new THREE.Mesh(seg1DeckGeo, bridgeDeckMat);
  seg1Deck.position.set(0, -0.22, seg1Len * 0.5);
  seg1Deck.renderOrder = 4;
  spanPivot.add(seg1Deck);

  const seg1RailGeo = new THREE.BoxGeometry(0.55, 1.05, seg1Len);
  [-2.85, 2.85].forEach((rx) => {
    const rail = new THREE.Mesh(seg1RailGeo, bridgeRailMat);
    rail.position.set(rx, 0.32, seg1Len * 0.5);
    spanPivot.add(rail);
  });

  // Segment 2 (t = 0.44 -> 1.00): Extending from Istana "COMING SOON" Gate out over the abyss
  const seg2Start = bridgeTotalLen * 0.44;
  const seg2Len = bridgeTotalLen * 0.56;
  const seg2Mid = seg2Start + seg2Len * 0.5;
  const seg2DeckGeo = new THREE.BoxGeometry(6.0, 0.55, seg2Len);
  const seg2Deck = new THREE.Mesh(seg2DeckGeo, bridgeDeckMat);
  seg2Deck.position.set(0, -0.22, seg2Mid);
  seg2Deck.renderOrder = 4;
  spanPivot.add(seg2Deck);

  const seg2RailGeo = new THREE.BoxGeometry(0.55, 1.05, seg2Len);
  [-2.85, 2.85].forEach((rx) => {
    const rail = new THREE.Mesh(seg2RailGeo, bridgeRailMat);
    rail.position.set(rx, 0.32, seg2Mid);
    spanPivot.add(rail);
  });

  // Jagged broken crystal-voxel teeth at the severed ends + floating debris shards in the gap
  const shardGeo = new THREE.BoxGeometry(1.15, 0.5, 1.25);
  [-2.1, -0.6, 1.4].forEach((sx, si) => {
    const endTooth1 = new THREE.Mesh(shardGeo, bridgeRailMat);
    endTooth1.position.set(sx, -0.18, seg1Len + 0.4 + (si % 2) * 0.55);
    const endTooth2 = new THREE.Mesh(shardGeo, bridgeRailMat);
    endTooth2.position.set(-sx, -0.18, seg2Start - 0.45 - (si % 2) * 0.6);
    spanPivot.add(endTooth1, endTooth2);
  });
  const gapMid = (seg1Len + seg2Start) * 0.5;
  [
    [-1.4, -0.45, gapMid - 1.2, 1.1, 0.4, 1.1],
    [1.6, 0.15, gapMid + 0.9, 0.95, 0.42, 0.95],
    [0.1, -0.85, gapMid + 0.1, 1.3, 0.38, 1.0],
  ].forEach(([fx, fy, fz, fsx, fsy, fsz]) => {
    const g = new THREE.BoxGeometry(fsx, fsy, fsz);
    disposables.push(g);
    const shard = new THREE.Mesh(g, bridgeRailMat);
    shard.position.set(fx, fy, fz);
    shard.rotation.set(0.25, 0.4, -0.2);
    spanPivot.add(shard);
  });

  // Two rustic stone/timber Bridgehead Gateposts standing upright on Menara Waktu cliff with sagging rope
  const gatePostPivot = new THREE.Group();
  gatePostPivot.position.set(bridgeStart.x, bridgeStart.y, bridgeStart.z);
  gatePostPivot.rotation.y = bridgeYaw;

  const postWoodMat = palette.getMat(0x5c3a1e, 'matte');
  const postStoneMat = palette.getMat(0x64748b, 'matte');
  const ropeMat = palette.getMat(0xa16207, 'matte');
  const postBaseGeo = new THREE.BoxGeometry(1.15, 1.0, 1.15);
  const postShaftGeo = new THREE.BoxGeometry(0.75, 2.8, 0.75);
  [-3.2, 3.2].forEach((px) => {
    const pBase = new THREE.Mesh(postBaseGeo, postStoneMat);
    pBase.position.set(px, 0.5, -0.35);
    const pShaft = new THREE.Mesh(postShaftGeo, postWoodMat);
    pShaft.position.set(px, 2.1, -0.35);
    pShaft.castShadow = true;
    gatePostPivot.add(pBase, pShaft);
  });
  const ropeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.0, 2.2, -0.35),
    new THREE.Vector3(-1.4, 1.65, -0.35),
    new THREE.Vector3(0.0, 1.48, -0.35),
    new THREE.Vector3(1.4, 1.65, -0.35),
    new THREE.Vector3(3.0, 2.2, -0.35),
  ]);
  const ropeGeo = new THREE.TubeGeometry(ropeCurve, 12, 0.1, 6, false);
  const ropeMesh = new THREE.Mesh(ropeGeo, ropeMat);
  gatePostPivot.add(ropeMesh);

  skyBridgeGroup.add(spanPivot, gatePostPivot);
  disposables.push(
    seg1DeckGeo,
    seg1RailGeo,
    seg2DeckGeo,
    seg2RailGeo,
    shardGeo,
    postBaseGeo,
    postShaftGeo,
    ropeGeo,
  );

  return {
    istanaGroup,
    istanaDome,
    domeUniforms,
    bridgeUniforms,
    skyBridgeGroup,
    disposables,
  };
}

export function updateIstanaFloatingIsland(
  rig: IstanaFloatingRig,
  anchorY: number,
  elapsed: number,
): void {
  rig.istanaGroup.position.y = anchorY + Math.sin(elapsed * 0.75) * 0.28;
  rig.domeUniforms.uTime.value = elapsed;
  rig.bridgeUniforms.uTime.value = elapsed;
}
