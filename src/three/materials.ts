import * as THREE from 'three';

export type PixelMatKind =
  | 'cobble'
  | 'oak_plank'
  | 'spruce_plank'
  | 'oak_log'
  | 'birch_log'
  | 'leaves_oak'
  | 'leaves_birch'
  | 'grass_side'
  | 'hay'
  | 'farmland'
  | 'wool_yellow'
  | 'wool_red'
  | 'wool_white'
  | 'glass_pane'
  | 'crafting'
  | 'furnace'
  | 'snow_grass';

export type SurfaceMaterial = THREE.MeshStandardMaterial | THREE.MeshLambertMaterial;

export interface SurfaceMatParams {
  color?: THREE.ColorRepresentation;
  map?: THREE.Texture | null;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
  transparent?: boolean;
  opacity?: number;
  polygonOffset?: boolean;
  polygonOffsetFactor?: number;
  polygonOffsetUnits?: number;
  side?: THREE.Side;
}

export interface MaterialPalette {
  readonly isLiteShader: boolean;
  meadowMat: SurfaceMaterial;
  roadMat: SurfaceMaterial;
  pathMat: SurfaceMaterial;
  waterMat: SurfaceMaterial;
  contactShadowMat: THREE.MeshBasicMaterial;
  createSurfaceMat: (params: SurfaceMatParams) => SurfaceMaterial;
  getMat: (hex: number, kind?: 'matte' | 'gloss' | 'metal' | 'emissive' | 'glass') => SurfaceMaterial;
  getPixelMat: (kind: PixelMatKind, tintHex?: number) => SurfaceMaterial;
  dispose: () => void;
}

function makePixelCanvas(
  size: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  maxAnisotropy: number,
  repeatX = 1,
  repeatY = 1,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestMipmapLinearFilter;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createMeadowTexture(maxAnisotropy: number): THREE.CanvasTexture {
  return makePixelCanvas(
    64,
    (ctx) => {
      const shades = ['#62ad35', '#589e2e', '#6fb93e', '#529329', '#77c344'];
      for (let y = 0; y < 64; y += 2) {
        for (let x = 0; x < 64; x += 2) {
          const h = ((x * 37 + y * 91 + x * y * 13) >>> 0) % shades.length;
          ctx.fillStyle = shades[h];
          ctx.fillRect(x, y, 2, 2);
        }
      }
      // Tiny bright grass blades & subtle wildflower specks
      for (let i = 0; i < 42; i++) {
        const bx = ((i * 23 + 7) % 31) * 2;
        const by = ((i * 41 + 11) % 31) * 2;
        ctx.fillStyle = i % 5 === 0 ? '#84cc16' : '#4d7c0f';
        ctx.fillRect(bx, by, 2, 2);
      }
    },
    maxAnisotropy,
    46,
    46,
  );
}

function createAsphaltTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#383e47';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 900; i++) {
    const x = (i * 73) % 256;
    const y = (i * 137) % 256;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.fillStyle = '#5c6470';
  ctx.fillRect(0, 0, 256, 12);
  ctx.fillRect(0, 244, 256, 12);

  ctx.fillStyle = '#f1f5f9';
  for (let x = 8; x < 256; x += 64) {
    ctx.fillRect(x, 124, 34, 8);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createStonePathTexture(maxAnisotropy: number): THREE.CanvasTexture {
  return makePixelCanvas(
    32,
    (ctx) => {
      const dirtPalette = ['#b88a4c', '#ab7e43', '#c49655', '#9c713a'];
      for (let y = 0; y < 32; y += 2) {
        for (let x = 0; x < 32; x += 2) {
          const h = ((x * 53 + y * 29 + x * y * 7) >>> 0) % dirtPalette.length;
          ctx.fillStyle = dirtPalette[h];
          ctx.fillRect(x, y, 2, 2);
        }
      }
      // Village cobblestone pebbles scattered along dirt trail
      const pebbles: Array<[number, number, number, number, string]> = [
        [2, 4, 4, 4, '#94a3b8'],
        [10, 12, 4, 4, '#cbd5e1'],
        [20, 6, 4, 4, '#94a3b8'],
        [16, 22, 6, 4, '#a8a29e'],
        [4, 24, 4, 4, '#cbd5e1'],
        [26, 18, 4, 4, '#94a3b8'],
      ];
      pebbles.forEach(([px, py, pw, ph, col]) => {
        ctx.fillStyle = col;
        ctx.fillRect(px, py, pw, ph);
      });
    },
    maxAnisotropy,
    18,
    2,
  );
}

function createPixelKindTexture(kind: PixelMatKind, maxAnisotropy: number): THREE.CanvasTexture {
  return makePixelCanvas(
    16,
    (ctx) => {
      if (kind === 'cobble') {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(0, 0, 16, 16);
        const stones = [
          [0, 0, 7, 5, '#94a3b8'],
          [8, 0, 8, 6, '#78716c'],
          [1, 6, 6, 4, '#cbd5e1'],
          [8, 7, 7, 4, '#94a3b8'],
          [0, 11, 8, 5, '#78716c'],
          [9, 12, 7, 4, '#cbd5e1'],
        ] as const;
        stones.forEach(([x, y, w, h, c]) => {
          ctx.fillStyle = c;
          ctx.fillRect(x, y, w - 1, h - 1);
        });
      } else if (kind === 'oak_plank' || kind === 'spruce_plank') {
        const dark = kind === 'spruce_plank' ? '#5c3b1e' : '#85582d';
        const mid = kind === 'spruce_plank' ? '#704926' : '#a67441';
        const light = kind === 'spruce_plank' ? '#82552d' : '#bc884f';
        ctx.fillStyle = mid;
        ctx.fillRect(0, 0, 16, 16);
        for (let row = 0; row < 16; row += 4) {
          ctx.fillStyle = dark;
          ctx.fillRect(0, row, 16, 1);
          ctx.fillStyle = light;
          ctx.fillRect(0, row + 1, 16, 1);
        }
        ctx.fillStyle = dark;
        ctx.fillRect(7, 0, 1, 4);
        ctx.fillRect(13, 4, 1, 4);
        ctx.fillRect(4, 8, 1, 4);
        ctx.fillRect(11, 12, 1, 4);
      } else if (kind === 'oak_log') {
        ctx.fillStyle = '#5c3a1e';
        ctx.fillRect(0, 0, 16, 16);
        for (let x = 0; x < 16; x += 2) {
          ctx.fillStyle = x % 4 === 0 ? '#472c15' : '#6e4726';
          ctx.fillRect(x, 0, 1, 16);
        }
        ctx.fillStyle = '#3b2410';
        ctx.fillRect(4, 3, 1, 6);
        ctx.fillRect(10, 7, 1, 7);
      } else if (kind === 'birch_log') {
        ctx.fillStyle = '#eef2f6';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(0, 4, 16, 1);
        ctx.fillRect(0, 12, 16, 1);
        const marks: Array<[number, number, number, number]> = [
          [2, 2, 4, 1],
          [10, 4, 4, 2],
          [4, 7, 3, 1],
          [11, 9, 3, 1],
          [1, 12, 5, 2],
          [8, 14, 4, 1],
        ];
        ctx.fillStyle = '#1e293b';
        marks.forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
      } else if (kind === 'leaves_oak' || kind === 'leaves_birch') {
        const base = kind === 'leaves_birch' ? '#4d8f29' : '#2f7a24';
        const hi = kind === 'leaves_birch' ? '#70b83c' : '#4aa336';
        const lo = kind === 'leaves_birch' ? '#336319' : '#1b4f15';
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 16, 16);
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const h = (x * 19 + y * 43 + x * y * 7) % 11;
            if (h < 3) {
              ctx.fillStyle = lo;
              ctx.fillRect(x, y, 1, 1);
            } else if (h > 7) {
              ctx.fillStyle = hi;
              ctx.fillRect(x, y, 1, 1);
            }
          }
        }
      } else if (kind === 'grass_side') {
        ctx.fillStyle = '#79553a';
        ctx.fillRect(0, 0, 16, 16);
        for (let y = 4; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const h = (x * 29 + y * 53) % 7;
            ctx.fillStyle = h < 2 ? '#5d402a' : h === 5 ? '#8d6546' : '#79553a';
            ctx.fillRect(x, y, 1, 1);
          }
        }
        for (let x = 0; x < 16; x++) {
          const drop = 3 + ((x * 5 + 2) % 3);
          ctx.fillStyle = x % 2 === 0 ? '#5fa832' : '#71bd3d';
          ctx.fillRect(x, 0, 1, drop);
        }
      } else if (kind === 'snow_grass') {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 16, 16);
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            if ((x * 17 + y * 31) % 7 === 0) {
              ctx.fillStyle = '#e2e8f0';
              ctx.fillRect(x, y, 1, 1);
            }
          }
        }
      } else if (kind === 'hay') {
        ctx.fillStyle = '#eab308';
        ctx.fillRect(0, 0, 16, 16);
        for (let x = 0; x < 16; x += 2) {
          ctx.fillStyle = x % 4 === 0 ? '#ca8a04' : '#facc15';
          ctx.fillRect(x, 0, 1, 16);
        }
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, 4, 16, 2);
        ctx.fillRect(0, 11, 16, 2);
      } else if (kind === 'farmland') {
        ctx.fillStyle = '#4a311e';
        ctx.fillRect(0, 0, 16, 16);
        for (let y = 0; y < 16; y += 3) {
          ctx.fillStyle = '#332012';
          ctx.fillRect(0, y, 16, 1);
        }
      } else if (kind === 'wool_yellow' || kind === 'wool_red' || kind === 'wool_white') {
        const palette =
          kind === 'wool_yellow'
            ? ['#facc15', '#eab308', '#fde047']
            : kind === 'wool_red'
            ? ['#dc2626', '#b91c1c', '#ef4444']
            : ['#f8fafc', '#e2e8f0', '#ffffff'];
        for (let y = 0; y < 16; y += 2) {
          for (let x = 0; x < 16; x += 2) {
            ctx.fillStyle = palette[(x + y) % palette.length];
            ctx.fillRect(x, y, 2, 2);
          }
        }
      } else if (kind === 'glass_pane') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(1, 1, 14, 14);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(2, 2, 4, 2);
        ctx.fillRect(3, 4, 2, 2);
        ctx.fillRect(10, 11, 3, 2);
        ctx.fillStyle = '#5c3b1e';
        ctx.fillRect(0, 0, 16, 1);
        ctx.fillRect(0, 15, 16, 1);
        ctx.fillRect(0, 0, 1, 16);
        ctx.fillRect(15, 0, 1, 16);
      } else if (kind === 'crafting') {
        ctx.fillStyle = '#9a6635';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#573619';
        ctx.fillRect(0, 0, 16, 2);
        ctx.fillRect(0, 14, 16, 2);
        ctx.fillRect(0, 0, 2, 16);
        ctx.fillRect(14, 0, 2, 16);
        ctx.fillRect(5, 2, 1, 12);
        ctx.fillRect(10, 2, 1, 12);
        ctx.fillRect(2, 5, 12, 1);
        ctx.fillRect(2, 10, 12, 1);
      } else if (kind === 'furnace') {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(1, 1, 14, 4);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(4, 7, 8, 7);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(5, 10, 6, 3);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(6, 11, 4, 2);
      }
    },
    maxAnisotropy,
    1,
    1,
  );
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
  grad.addColorStop(0, 'rgba(18, 35, 14, 0.52)');
  grad.addColorStop(0.55, 'rgba(18, 35, 14, 0.24)');
  grad.addColorStop(1, 'rgba(18, 35, 14, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createMaterialPalette(
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean,
  preferLiteShader = isSoftwareGl,
): MaterialPalette {
  const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const textures: THREE.Texture[] = [];
  const matCache = new Map<string, SurfaceMaterial>();
  const pixelTexCache = new Map<PixelMatKind, THREE.CanvasTexture>();
  const pixelMatCache = new Map<string, SurfaceMaterial>();

  const createSurfaceMat = (params: SurfaceMatParams): SurfaceMaterial => {
    if (preferLiteShader) {
      return new THREE.MeshLambertMaterial({
        color: params.color ?? 0xffffff,
        map: params.map ?? undefined,
        emissive: params.emissive ?? 0x000000,
        emissiveIntensity: params.emissiveIntensity ?? 1,
        transparent: params.transparent ?? false,
        opacity: params.opacity ?? 1,
        polygonOffset: params.polygonOffset ?? false,
        polygonOffsetFactor: params.polygonOffsetFactor ?? 0,
        polygonOffsetUnits: params.polygonOffsetUnits ?? 0,
        side: params.side ?? THREE.FrontSide,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: params.color ?? 0xffffff,
      map: params.map ?? undefined,
      emissive: params.emissive ?? 0x000000,
      emissiveIntensity: params.emissiveIntensity ?? 1,
      roughness: params.roughness ?? 0.82,
      metalness: params.metalness ?? 0.04,
      transparent: params.transparent ?? false,
      opacity: params.opacity ?? 1,
      polygonOffset: params.polygonOffset ?? false,
      polygonOffsetFactor: params.polygonOffsetFactor ?? 0,
      polygonOffsetUnits: params.polygonOffsetUnits ?? 0,
      side: params.side ?? THREE.FrontSide,
    });
  };

  const meadowTex = createMeadowTexture(maxAniso);
  const asphaltTex = createAsphaltTexture(maxAniso);
  const stoneTex = createStonePathTexture(maxAniso);
  const shadowTex = createContactShadowTexture();
  textures.push(meadowTex, asphaltTex, stoneTex, shadowTex);

  const meadowMat = createSurfaceMat({
    map: meadowTex,
    roughness: 0.94,
    metalness: 0.0,
  });

  const roadMat = createSurfaceMat({
    map: asphaltTex,
    roughness: 0.85,
    metalness: 0.04,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const pathMat = createSurfaceMat({
    map: stoneTex,
    roughness: 0.92,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const waterMat = createSurfaceMat({
    color: 0x0ea5e9,
    emissive: preferLiteShader ? 0x0284c7 : 0x0369a1,
    emissiveIntensity: preferLiteShader ? 0.16 : 0.18,
    roughness: 0.08,
    metalness: 0.28,
    transparent: true,
    opacity: isSoftwareGl ? 0.86 : 0.88,
  });

  const contactShadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.72,
  });

  const getMat = (
    hex: number,
    kind: 'matte' | 'gloss' | 'metal' | 'emissive' | 'glass' = 'matte',
  ): SurfaceMaterial => {
    const key = `${hex.toString(16)}_${kind}`;
    const existing = matCache.get(key);
    if (existing) return existing;

    let mat: SurfaceMaterial;
    if (kind === 'metal') {
      mat = createSurfaceMat({
        color: hex,
        emissive: preferLiteShader ? hex : 0x000000,
        emissiveIntensity: preferLiteShader ? 0.14 : 1,
        roughness: 0.18,
        metalness: 0.88,
      });
    } else if (kind === 'gloss') {
      mat = createSurfaceMat({
        color: hex,
        emissive: preferLiteShader ? hex : 0x000000,
        emissiveIntensity: preferLiteShader ? 0.06 : 1,
        roughness: 0.22,
        metalness: 0.14,
      });
    } else if (kind === 'emissive') {
      mat = createSurfaceMat({
        color: hex,
        emissive: hex,
        emissiveIntensity: 1.25,
        roughness: 0.22,
        metalness: 0.1,
      });
    } else if (kind === 'glass') {
      mat = createSurfaceMat({
        color: hex,
        roughness: 0.08,
        metalness: 0.22,
        transparent: true,
        opacity: 0.72,
      });
    } else {
      mat = createSurfaceMat({
        color: hex,
        roughness: 0.82,
        metalness: 0.04,
      });
    }
    matCache.set(key, mat);
    return mat;
  };

  const getPixelMat = (
    kind: PixelMatKind,
    tintHex = 0xffffff,
  ): SurfaceMaterial => {
    const key = `${kind}_${tintHex.toString(16)}`;
    const existing = pixelMatCache.get(key);
    if (existing) return existing;

    let tex = pixelTexCache.get(kind);
    if (!tex) {
      tex = createPixelKindTexture(kind, maxAniso);
      pixelTexCache.set(kind, tex);
      textures.push(tex);
    }
    const isGlass = kind === 'glass_pane';
    const mat = createSurfaceMat({
      map: tex,
      color: tintHex,
      roughness: isGlass ? 0.18 : 0.88,
      metalness: isGlass ? 0.15 : 0.03,
      transparent: isGlass,
      opacity: isGlass ? 0.82 : 1,
    });
    pixelMatCache.set(key, mat);
    return mat;
  };

  return {
    isLiteShader: preferLiteShader,
    meadowMat,
    roadMat,
    pathMat,
    waterMat,
    contactShadowMat,
    createSurfaceMat,
    getMat,
    getPixelMat,
    dispose: () => {
      textures.forEach((t) => t.dispose());
      meadowMat.dispose();
      roadMat.dispose();
      pathMat.dispose();
      waterMat.dispose();
      contactShadowMat.dispose();
      matCache.forEach((m) => m.dispose());
      matCache.clear();
      pixelMatCache.forEach((m) => m.dispose());
      pixelMatCache.clear();
      pixelTexCache.clear();
    },
  };
}
