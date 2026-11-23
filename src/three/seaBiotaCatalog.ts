import * as THREE from 'three';
import { OceanMaterials, SeaBiotaId } from '../types/game';
import { MaterialPalette } from './materials';

export type SeaBiotaRarity = 'COM' | 'UNC' | 'RARE';

export interface SeaBiotaCatalogEntry {
  num: number;
  id: SeaBiotaId;
  name: string;
  indoName: string;
  rarity: SeaBiotaRarity;
  category: string;
  statText: string;
  yieldKind?: keyof OceanMaterials;
  yieldAmount?: number;
  lightRadius?: number;
  mountable?: boolean;
  colorHex: number;
  description: string;
}

export const SEA_BIOTA_CATALOG: SeaBiotaCatalogEntry[] = [
  {
    num: 1,
    id: 'brain_coral',
    name: 'Brain Coral',
    indoName: 'Karang Otak',
    rarity: 'COM',
    category: 'Flora',
    statText: 'HEALTH: 50',
    yieldKind: 'calcium',
    yieldAmount: 1,
    colorHex: 0xf472b6,
    description: 'Karang bundar merah muda berpola labirin yang melindungi ikan kecil.',
  },
  {
    num: 2,
    id: 'fire_coral',
    name: 'Fire Coral',
    indoName: 'Karang Api',
    rarity: 'COM',
    category: 'Flora',
    statText: 'DAMAGE: +2',
    yieldKind: 'calcium',
    yieldAmount: 1,
    colorHex: 0xf97316,
    description: 'Karang bercabang jingga menyala; indah dipandang namun menyengat bila disentuh terlalu dekat.',
  },
  {
    num: 3,
    id: 'blue_staghorn',
    name: 'Blue Staghorn',
    indoName: 'Karang Tanduk Biru',
    rarity: 'COM',
    category: 'Flora',
    statText: 'YIELD: Calcium',
    yieldKind: 'calcium',
    yieldAmount: 2,
    colorHex: 0x3b82f6,
    description: 'Sumber Kalsium Karang terbaik untuk memperkuat struktur baju selam.',
  },
  {
    num: 4,
    id: 'sea_anemone',
    name: 'Sea Anemone',
    indoName: 'Anemon Laut',
    rarity: 'COM',
    category: 'Flora',
    statText: 'EFFECT: Sticky',
    yieldKind: 'fiber',
    yieldAmount: 1,
    colorHex: 0xd946ef,
    description: 'Rumah favorit bagi Clownfish dengan tentakel ungu lembut yang melambai.',
  },
  {
    num: 5,
    id: 'giant_kelp',
    name: 'Giant Kelp',
    indoName: 'Rumput Kelp Raksasa',
    rarity: 'COM',
    category: 'Flora',
    statText: 'YIELD: Fiber',
    yieldKind: 'fiber',
    yieldAmount: 2,
    colorHex: 0x22c55e,
    description: 'Hutan rumput laut hijau tinggi penghasil Serat Kelp untuk baju selam & sirip.',
  },
  {
    num: 6,
    id: 'seagrass',
    name: 'Seagrass',
    indoName: 'Lamun Laut',
    rarity: 'COM',
    category: 'Flora',
    statText: 'YIELD: Fiber',
    yieldKind: 'fiber',
    yieldAmount: 1,
    colorHex: 0x84cc16,
    description: 'Padang lamun subur tempat kuda laut dan kepiting kecil bermain.',
  },
  {
    num: 7,
    id: 'bioluminescent_algae',
    name: 'Bioluminescent Algae',
    indoName: 'Alga Bercahaya',
    rarity: 'UNC',
    category: 'Flora',
    statText: 'LIGHT: 6m',
    yieldKind: 'pearl',
    yieldAmount: 1,
    lightRadius: 6,
    colorHex: 0x22d3ee,
    description: 'Alga bercahaya biru neon yang menerangi terumbu senja dan mengisi energi senter.',
  },
  {
    num: 8,
    id: 'sea_fan',
    name: 'Sea Fan',
    indoName: 'Kipas Laut',
    rarity: 'UNC',
    category: 'Flora',
    statText: 'YIELD: Fiber',
    yieldKind: 'fiber',
    yieldAmount: 2,
    colorHex: 0xfbbf24,
    description: 'Karang kipas keemasan yang menyaring arus laut dengan anggun.',
  },
  {
    num: 9,
    id: 'tiger_cowrie',
    name: 'Tiger Cowrie',
    indoName: 'Kerang Macan',
    rarity: 'UNC',
    category: 'Shell',
    statText: 'VALUE: 25g',
    yieldKind: 'shell',
    yieldAmount: 1,
    colorHex: 0xd97706,
    description: 'Cangkang porselen bercorak tutul harimau yang berharga tinggi.',
  },
  {
    num: 10,
    id: 'giant_clam',
    name: 'Giant Clam',
    indoName: 'Kima Raksasa',
    rarity: 'UNC',
    category: 'Shell',
    statText: 'YIELD: Pearl',
    yieldKind: 'pearl',
    yieldAmount: 1,
    colorHex: 0x14b8a6,
    description: 'Kima hijau-toska besar yang menyimpan Mutiara Langka untuk merakit Tabung Scuba.',
  },
  {
    num: 11,
    id: 'clownfish',
    name: 'Clownfish',
    indoName: 'Ikan Badut',
    rarity: 'COM',
    category: 'Fish',
    statText: 'HP: 10',
    colorHex: 0xf97316,
    description: 'Ikan badut jingga-putih ceria yang berenang berkelompok di sekitar anemon.',
  },
  {
    num: 12,
    id: 'blue_tang',
    name: 'Blue Tang',
    indoName: 'Ikan Dori Biru',
    rarity: 'COM',
    category: 'Fish',
    statText: 'HP: 12',
    colorHex: 0x2563eb,
    description: 'Ikan terumbu biru cerah berekor kuning yang lincah dan ramah.',
  },
  {
    num: 13,
    id: 'sea_turtle',
    name: 'Sea Turtle',
    indoName: 'Penyu Hijau',
    rarity: 'RARE',
    category: 'Reptile',
    statText: 'HP: 120 | MOUNT: Yes',
    mountable: true,
    colorHex: 0x16a34a,
    description: 'Penyu laut ramah berumur panjang — bisa ditunggangi (tekan E) untuk meluncur cepat!',
  },
  {
    num: 14,
    id: 'spotted_stingray',
    name: 'Spotted Stingray',
    indoName: 'Pari Tutul Ramah',
    rarity: 'UNC',
    category: 'Fish',
    statText: 'HP: 45',
    colorHex: 0x1d4ed8,
    description: 'Ikan pari biru berbintik putih yang melayang tenang bagai karpet terbang di atas pasir.',
  },
  {
    num: 15,
    id: 'yellow_seahorse',
    name: 'Yellow Seahorse',
    indoName: 'Kuda Laut Emas',
    rarity: 'UNC',
    category: 'Fish',
    statText: 'HP: 15',
    colorHex: 0xfacc15,
    description: 'Kuda laut kuning mungil menggemaskan yang menari vertikal di antara lamun.',
  },
  {
    num: 16,
    id: 'chameleon_octopus',
    name: 'Chameleon Octopus',
    indoName: 'Gurita Bunglon',
    rarity: 'RARE',
    category: 'Mollusk',
    statText: 'HP: 60',
    colorHex: 0xb45309,
    description: 'Gurita cerdas ramah dengan 8 tentakel lincah yang gemar berkamuflase.',
  },
  {
    num: 17,
    id: 'spiny_lobster',
    name: 'Spiny Lobster',
    indoName: 'Lobster Karang',
    rarity: 'UNC',
    category: 'Crustacean',
    statText: 'HP: 20 | YIELD: Food',
    yieldKind: 'food',
    yieldAmount: 1,
    colorHex: 0xdc2626,
    description: 'Lobster merah berduri dengan antena panjang; memulihkan stamina & nyawa (+1 ❤️).',
  },
  {
    num: 18,
    id: 'box_crab',
    name: 'Box Crab',
    indoName: 'Kepiting Kotak',
    rarity: 'COM',
    category: 'Crustacean',
    statText: 'HP: 15 | YIELD: Food',
    yieldKind: 'food',
    yieldAmount: 1,
    colorHex: 0xd97706,
    description: 'Kepiting kotak bercapit besar yang lucu berjalan menyamping di atas pasir.',
  },
  {
    num: 19,
    id: 'starfish',
    name: 'Starfish',
    indoName: 'Bintang Laut',
    rarity: 'COM',
    category: 'Echinoderm',
    statText: 'YIELD: Shell',
    yieldKind: 'shell',
    yieldAmount: 1,
    colorHex: 0xef4444,
    description: 'Bintang laut merah berbintik emas yang menghiasi pasir karang dangkal.',
  },
  {
    num: 20,
    id: 'glowing_jellyfish',
    name: 'Glowing Jellyfish',
    indoName: 'Ubur-Ubur Bercahaya',
    rarity: 'RARE',
    category: 'Cnidarian',
    statText: 'HP: 30 | LIGHT: 8m',
    lightRadius: 8,
    colorHex: 0xc084fc,
    description: 'Ubur-ubur ungu-biru berpendar lembut bak lentera hidup di perairan dalam.',
  },
];

export const SEA_BIOTA_BY_ID: Record<SeaBiotaId, SeaBiotaCatalogEntry> = Object.fromEntries(
  SEA_BIOTA_CATALOG.map((entry) => [entry.id, entry]),
) as Record<SeaBiotaId, SeaBiotaCatalogEntry>;

export interface SeaBiotaRig {
  id: SeaBiotaId;
  root: THREE.Group;
  body: THREE.Group;
  parts: THREE.Object3D[];
}

export function createSeaBiotaMesh(id: SeaBiotaId, palette: MaterialPalette): SeaBiotaRig {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const parts: THREE.Object3D[] = [];

  const eyeMat = palette.getMat(0x0f172a, 'gloss');
  const whiteMat = palette.getMat(0xffffff, 'matte');

  if (id === 'brain_coral') {
    const pink = palette.getMat(0xf472b6, 'matte');
    const ridge = palette.getMat(0xdb2777, 'matte');
    const dome = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.72, 1.18), pink);
    dome.position.y = 0.36;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.24, 0.9), pink);
    cap.position.y = 0.82;
    body.add(dome, cap);
    const grooves: Array<[number, number, number, number, number, number]> = [
      [0, 0.95, 0.16, 0.68, 0.1, 0.14],
      [-0.22, 0.95, -0.18, 0.36, 0.1, 0.14],
      [0.24, 0.72, 0.56, 0.52, 0.14, 0.14],
      [-0.56, 0.52, 0, 0.14, 0.38, 0.65],
    ];
    for (const [x, y, z, sx, sy, sz] of grooves) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), ridge);
      m.position.set(x, y, z);
      body.add(m);
    }
  } else if (id === 'fire_coral') {
    const orange = palette.getMat(0xf97316, 'matte');
    const red = palette.getMat(0xef4444, 'matte');
    const tip = palette.getMat(0xfbbf24, 'emissive');
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.28, 0.9), red);
    base.position.y = 0.14;
    body.add(base);
    const branches: Array<[number, number, number, number, number]> = [
      [-0.28, 0, 1.05, 0.24, 0.22],
      [0.24, 0.18, 1.28, 0.26, -0.18],
      [0.02, -0.22, 0.96, 0.22, 0.08],
      [-0.1, 0.24, 0.84, 0.2, -0.28],
    ];
    for (const [bx, bz, h, w, rz] of branches) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), orange);
      b.position.set(bx, h * 0.5 + 0.12, bz);
      b.rotation.z = rz;
      const t = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.2, w * 0.8), tip);
      t.position.set(bx - Math.sin(rz) * h * 0.45, h + 0.12, bz);
      body.add(b, t);
    }
  } else if (id === 'blue_staghorn') {
    const blue = palette.getMat(0x2563eb, 'matte');
    const lightBlue = palette.getMat(0x38bdf8, 'gloss');
    const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.85, 0.32), blue);
    trunk.position.y = 0.42;
    body.add(trunk);
    const arms: Array<[number, number, number, number, number, number]> = [
      [-0.3, 0.92, 0, 0.56, 0.22, 0.4],
      [0.32, 0.98, 0.08, 0.62, 0.22, -0.45],
      [0, 1.05, -0.28, 0.52, 0.2, 0.1],
      [-0.5, 1.24, 0.1, 0.44, 0.18, 0.25],
      [0.52, 1.3, -0.08, 0.46, 0.18, -0.2],
    ];
    for (const [x, y, z, h, w, rz] of arms) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), lightBlue);
      m.position.set(x, y, z);
      m.rotation.z = rz;
      body.add(m);
    }
  } else if (id === 'sea_anemone') {
    const mag = palette.getMat(0xc026d3, 'matte');
    const lav = palette.getMat(0xe879f9, 'emissive');
    const rock = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 1.1), palette.getMat(0x475569, 'matte'));
    rock.position.y = 0.11;
    body.add(rock);
    const stalks = [
      [-0.28, -0.18, 0.72],
      [0.24, -0.2, 0.86],
      [-0.08, 0.24, 0.92],
      [0.32, 0.22, 0.64],
    ];
    for (const [sx, sz, h] of stalks) {
      const tube = new THREE.Group();
      tube.position.set(sx, 0.2, sz);
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.3, h, 0.3), mag);
      col.position.y = h * 0.5;
      const crown = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.42), lav);
      crown.position.y = h + 0.06;
      tube.add(col, crown);
      body.add(tube);
      parts.push(tube);
    }
  } else if (id === 'giant_kelp') {
    const darkGreen = palette.getMat(0x15803d, 'matte');
    const brightGreen = palette.getMat(0x22c55e, 'matte');
    const stone = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.36, 1.1), palette.getMat(0x64748b, 'matte'));
    stone.position.y = 0.18;
    body.add(stone);
    for (const [kx, kz, segs] of [
      [-0.26, 0.08, 6],
      [0.24, -0.16, 7],
      [0.02, 0.26, 5],
    ] as Array<[number, number, number]>) {
      const stalk = new THREE.Group();
      stalk.position.set(kx, 0.32, kz);
      for (let i = 0; i < segs; i++) {
        const seg = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.76, 0.24),
          i % 2 === 0 ? darkGreen : brightGreen,
        );
        seg.position.y = i * 0.72 + 0.36;
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.22, 0.12), brightGreen);
        leaf.position.set((i % 2 === 0 ? 1 : -1) * 0.3, i * 0.72 + 0.45, 0);
        stalk.add(seg, leaf);
      }
      body.add(stalk);
      parts.push(stalk);
    }
  } else if (id === 'seagrass') {
    const g1 = palette.getMat(0x16a34a, 'matte');
    const g2 = palette.getMat(0xa3e635, 'matte');
    for (let i = 0; i < 6; i++) {
      const blade = new THREE.Group();
      const ang = (i / 6) * Math.PI * 2;
      blade.position.set(Math.cos(ang) * 0.32, 0, Math.sin(ang) * 0.32);
      const h = 0.75 + (i % 3) * 0.32;
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.14, h, 0.12), i % 2 === 0 ? g1 : g2);
      m.position.y = h * 0.5;
      blade.add(m);
      body.add(blade);
      parts.push(blade);
    }
  } else if (id === 'bioluminescent_algae') {
    const rock = palette.getMat(0x1e293b, 'matte');
    const neon = palette.createSurfaceMat({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.45,
      roughness: 0.25,
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.44, 1.3), rock);
    base.position.y = 0.22;
    body.add(base);
    const frondSpecs: Array<[number, number, number, number]> = [
      [0, 0, 1.25, 0],
      [-0.36, 0.14, 0.92, 0.28],
      [0.34, -0.14, 0.98, -0.24],
      [0.12, 0.32, 0.78, -0.14],
    ];
    for (const [fx, fz, fh, rz] of frondSpecs) {
      const stem = new THREE.Group();
      stem.position.set(fx, 0.42, fz);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.18, fh, 0.18), neon);
      bar.position.y = fh * 0.5;
      bar.rotation.z = rz;
      const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.32), neon);
      bulb.position.set(-Math.sin(rz) * fh * 0.5, fh, 0);
      stem.add(bar, bulb);
      body.add(stem);
      parts.push(stem);
    }
  } else if (id === 'sea_fan') {
    const gold = palette.getMat(0xf59e0b, 'matte');
    const amber = palette.getMat(0xfbbf24, 'gloss');
    const fan = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.36, 0.2), gold);
    stem.position.y = 0.18;
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.98, 0.12), amber);
    plate.position.y = 0.8;
    const notch = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.26, 0.16), gold);
    notch.position.y = 1.26;
    fan.add(stem, plate, notch);
    body.add(fan);
    parts.push(fan);
  } else if (id === 'tiger_cowrie') {
    const cream = palette.getMat(0xfef3c7, 'gloss');
    const spot = palette.getMat(0x78350f, 'matte');
    const shell = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.44, 1.05), cream);
    shell.position.y = 0.22;
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 0.84), cream);
    ridge.position.y = 0.48;
    body.add(shell, ridge);
    for (const [sx, sy, sz] of [
      [-0.22, 0.48, 0.2],
      [0.2, 0.52, -0.18],
      [0, 0.58, 0.04],
      [-0.18, 0.38, -0.3],
      [0.24, 0.4, 0.26],
    ]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.22), spot);
      m.position.set(sx, sy, sz);
      body.add(m);
    }
  } else if (id === 'giant_clam') {
    const shellMat = palette.getMat(0x0f766e, 'matte');
    const innerMat = palette.getMat(0x2dd4bf, 'gloss');
    const pearlMat = palette.createSurfaceMat({
      color: 0xf8fafc,
      emissive: 0xbae6fd,
      emissiveIntensity: 1.15,
      roughness: 0.1,
      metalness: 0.25,
    });
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.28, 1.12), shellMat);
    bottom.position.y = 0.14;
    const mantle = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.14, 0.9), innerMat);
    mantle.position.y = 0.28;
    const pearl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), pearlMat);
    pearl.position.set(0, 0.42, 0.08);
    const topLid = new THREE.Group();
    topLid.position.set(0, 0.28, -0.5);
    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.24, 1.1), shellMat);
    lidMesh.position.set(0, 0.08, 0.52);
    topLid.add(lidMesh);
    topLid.rotation.x = -0.68;
    body.add(bottom, mantle, pearl, topLid);
    parts.push(topLid, pearl);
  } else if (id === 'clownfish') {
    const orange = palette.getMat(0xf97316, 'matte');
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.52, 0.88), orange);
    const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.54, 0.18), whiteMat);
    stripe1.position.z = 0.12;
    const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.46, 0.14), whiteMat);
    stripe2.position.z = -0.22;
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.1), eyeMat);
    eyeL.position.set(0.24, 0.08, 0.32);
    const eyeR = eyeL.clone();
    eyeR.position.x = -0.24;
    const tail = new THREE.Group();
    tail.position.z = -0.46;
    const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.28), orange);
    tailFin.position.z = -0.14;
    tail.add(tailFin);
    const finL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.18), orange);
    finL.position.set(0.3, -0.05, 0.04);
    const finR = finL.clone();
    finR.position.x = -0.3;
    body.add(torso, stripe1, stripe2, eyeL, eyeR, tail, finL, finR);
    parts.push(tail);
  } else if (id === 'blue_tang') {
    const blue = palette.getMat(0x2563eb, 'matte');
    const yellow = palette.getMat(0xfacc15, 'gloss');
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.62, 0.96), blue);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.16, 0.58), eyeMat);
    stripe.position.set(0, 0.12, -0.04);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.1), eyeMat);
    eyeL.position.set(0.19, 0.1, 0.34);
    const eyeR = eyeL.clone();
    eyeR.position.x = -0.19;
    const tail = new THREE.Group();
    tail.position.z = -0.5;
    const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.46, 0.32), yellow);
    tailFin.position.z = -0.16;
    tail.add(tailFin);
    body.add(torso, stripe, eyeL, eyeR, tail);
    parts.push(tail);
  } else if (id === 'sea_turtle') {
    const shell = palette.getMat(0x15803d, 'matte');
    const rim = palette.getMat(0x4d7c0f, 'matte');
    const skin = palette.getMat(0x84cc16, 'matte');
    const carapace = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.56, 1.85), shell);
    carapace.position.y = 0.18;
    const topPlate = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.24, 1.42), rim);
    topPlate.position.y = 0.52;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.46, 0.62), skin);
    head.position.set(0, 0.18, 1.15);
    const eL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), eyeMat);
    eL.position.set(0.28, 0.26, 1.28);
    const eR = eL.clone();
    eR.position.x = -0.28;
    const flFrontL = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.14, 0.44), skin);
    flFrontL.position.set(1.05, 0.08, 0.56);
    const flFrontR = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.14, 0.44), skin);
    flFrontR.position.set(-1.05, 0.08, 0.56);
    const flBackL = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.12, 0.38), skin);
    flBackL.position.set(0.82, 0.05, -0.78);
    const flBackR = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.12, 0.38), skin);
    flBackR.position.set(-0.82, 0.05, -0.78);
    body.add(carapace, topPlate, head, eL, eR, flFrontL, flFrontR, flBackL, flBackR);
    parts.push(flFrontL, flFrontR, flBackL, flBackR);
  } else if (id === 'spotted_stingray') {
    const rayBlue = palette.getMat(0x1e40af, 'matte');
    const under = palette.getMat(0xcbd5e1, 'matte');
    const center = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 1.45), rayBlue);
    const belly = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.1, 1.2), under);
    belly.position.y = -0.12;
    const wingL = new THREE.Group();
    wingL.position.x = 0.52;
    const wMeshL = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 1.05), rayBlue);
    wMeshL.position.x = 0.45;
    wingL.add(wMeshL);
    const wingR = new THREE.Group();
    wingR.position.x = -0.52;
    const wMeshR = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 1.05), rayBlue);
    wMeshR.position.x = -0.45;
    wingR.add(wMeshR);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 1.35), rayBlue);
    tail.position.set(0, 0, -1.32);
    body.add(center, belly, wingL, wingR, tail);
    for (const [sx, sz] of [
      [0.24, 0.22],
      [-0.26, 0.18],
      [0.14, -0.24],
      [-0.18, -0.3],
      [0, 0.44],
    ]) {
      const dot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.12), whiteMat);
      dot.position.set(sx, 0.13, sz);
      body.add(dot);
    }
    parts.push(wingL, wingR);
  } else if (id === 'yellow_seahorse') {
    const gold = palette.getMat(0xfacc15, 'matte');
    const amber = palette.getMat(0xf59e0b, 'matte');
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.58, 0.34), gold);
    torso.position.y = 0.48;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.3, 0.34), gold);
    head.position.set(0, 0.9, 0.08);
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.32), amber);
    snout.position.set(0, 0.88, 0.36);
    const curl = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.32, 0.28), amber);
    curl.position.set(0, 0.14, -0.06);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.22), amber);
    fin.position.set(0, 0.52, -0.24);
    const eL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.08), eyeMat);
    eL.position.set(0.17, 0.94, 0.14);
    const eR = eL.clone();
    eR.position.x = -0.17;
    body.add(torso, head, snout, curl, fin, eL, eR);
    parts.push(fin);
  } else if (id === 'chameleon_octopus') {
    const terra = palette.getMat(0xb45309, 'matte');
    const coral = palette.getMat(0xd97706, 'gloss');
    const mantle = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.84, 0.86), terra);
    mantle.position.y = 0.58;
    const eL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.1), eyeMat);
    eL.position.set(0.24, 0.48, 0.44);
    const eR = eL.clone();
    eR.position.x = -0.24;
    body.add(mantle, eL, eR);
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const arm = new THREE.Group();
      arm.position.set(Math.cos(ang) * 0.36, 0.2, Math.sin(ang) * 0.36);
      arm.rotation.y = -ang;
      const limb = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.18, 0.2), i % 2 === 0 ? terra : coral);
      limb.position.x = 0.34;
      arm.add(limb);
      body.add(arm);
      parts.push(arm);
    }
  } else if (id === 'spiny_lobster') {
    const red = palette.getMat(0xdc2626, 'matte');
    const darkRed = palette.getMat(0x991b1b, 'matte');
    const carapace = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.34, 0.96), red);
    carapace.position.y = 0.26;
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 0.48), darkRed);
    tail.position.set(0, 0.22, -0.68);
    const antL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.88), red);
    antL.position.set(0.22, 0.36, 0.82);
    antL.rotation.y = 0.24;
    const antR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.88), red);
    antR.position.set(-0.22, 0.36, 0.82);
    antR.rotation.y = -0.24;
    body.add(carapace, tail, antL, antR);
    for (let i = 0; i < 3; i++) {
      const lL = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.1), darkRed);
      lL.position.set(0.42, 0.1, 0.24 - i * 0.28);
      const lR = lL.clone();
      lR.position.x = -0.42;
      body.add(lL, lR);
    }
    parts.push(antL, antR);
  } else if (id === 'box_crab') {
    const tan = palette.getMat(0xd97706, 'matte');
    const sand = palette.getMat(0xfbbf24, 'matte');
    const shell = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.42, 0.72), tan);
    shell.position.y = 0.32;
    const clawL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.34), sand);
    clawL.position.set(0.46, 0.28, 0.46);
    const clawR = clawL.clone();
    clawR.position.x = -0.46;
    const eL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.1), eyeMat);
    eL.position.set(0.2, 0.54, 0.32);
    const eR = eL.clone();
    eR.position.x = -0.2;
    body.add(shell, clawL, clawR, eL, eR);
    for (let i = 0; i < 3; i++) {
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.1), tan);
      legL.position.set(0.54, 0.12, 0.18 - i * 0.22);
      const legR = legL.clone();
      legR.position.x = -0.54;
      body.add(legL, legR);
    }
    parts.push(clawL, clawR);
  } else if (id === 'starfish') {
    const red = palette.getMat(0xef4444, 'matte');
    const gold = palette.getMat(0xfacc15, 'matte');
    const center = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.2, 0.44), red);
    center.position.y = 0.1;
    const stud = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.16), gold);
    stud.position.y = 0.22;
    body.add(center, stud);
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.64), red);
      arm.position.set(Math.sin(ang) * 0.36, 0.09, Math.cos(ang) * 0.36);
      arm.rotation.y = ang;
      body.add(arm);
    }
  } else if (id === 'glowing_jellyfish') {
    const bellMat = palette.createSurfaceMat({
      color: 0xc084fc,
      emissive: 0x9333ea,
      emissiveIntensity: 1.1,
      roughness: 0.2,
    });
    const tentMat = palette.createSurfaceMat({
      color: 0x38bdf8,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.25,
      roughness: 0.25,
    });
    const bell = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.58, 0.94), bellMat);
    bell.position.y = 0.36;
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.24, 0.68), tentMat);
    crown.position.y = 0.72;
    body.add(bell, crown);
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const tent = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.88, 0.1), tentMat);
      tent.position.set(Math.cos(ang) * 0.3, -0.34, Math.sin(ang) * 0.3);
      body.add(tent);
      parts.push(tent);
    }
  }

  return { id, root, body, parts };
}

export function animateSeaBiotaRig(rig: SeaBiotaRig, elapsed: number, phase: number): void {
  const t = elapsed + phase;
  if (rig.id === 'clownfish' || rig.id === 'blue_tang') {
    if (rig.parts[0]) rig.parts[0].rotation.y = Math.sin(t * 7.5) * 0.42;
    rig.body.rotation.z = Math.sin(t * 3.1) * 0.08;
  } else if (rig.id === 'sea_turtle') {
    const flap = Math.sin(t * 3.2) * 0.36;
    if (rig.parts[0]) rig.parts[0].rotation.z = flap;
    if (rig.parts[1]) rig.parts[1].rotation.z = -flap;
    if (rig.parts[2]) rig.parts[2].rotation.z = -flap * 0.5;
    if (rig.parts[3]) rig.parts[3].rotation.z = flap * 0.5;
  } else if (rig.id === 'spotted_stingray') {
    const wave = Math.sin(t * 3.6) * 0.28;
    if (rig.parts[0]) rig.parts[0].rotation.z = wave;
    if (rig.parts[1]) rig.parts[1].rotation.z = -wave;
  } else if (rig.id === 'yellow_seahorse') {
    rig.body.position.y = Math.sin(t * 2.6) * 0.14;
    if (rig.parts[0]) rig.parts[0].rotation.y = Math.sin(t * 8.0) * 0.35;
  } else if (rig.id === 'chameleon_octopus') {
    rig.body.position.y = Math.sin(t * 2.2) * 0.1;
    rig.parts.forEach((p, idx) => {
      p.rotation.z = Math.sin(t * 3.4 + idx * 0.8) * 0.24;
    });
  } else if (rig.id === 'glowing_jellyfish') {
    const pulse = Math.sin(t * 2.8);
    rig.body.scale.set(1 + pulse * 0.09, 1 - pulse * 0.12, 1 + pulse * 0.09);
    rig.body.position.y = Math.sin(t * 1.4) * 0.22;
    rig.parts.forEach((p, idx) => {
      p.rotation.x = Math.sin(t * 2.6 + idx) * 0.16;
    });
  } else if (rig.id === 'giant_clam') {
    const open = -0.58 - Math.sin(t * 1.1) * 0.22;
    if (rig.parts[0]) rig.parts[0].rotation.x = open;
    if (rig.parts[1]) rig.parts[1].rotation.y = elapsed * 0.9;
  } else if (rig.id === 'box_crab') {
    if (rig.parts[0]) rig.parts[0].rotation.x = Math.sin(t * 4.5) * 0.22;
    if (rig.parts[1]) rig.parts[1].rotation.x = -Math.sin(t * 4.5) * 0.22;
  } else if (rig.id === 'spiny_lobster') {
    if (rig.parts[0]) rig.parts[0].rotation.x = Math.sin(t * 3.8) * 0.14;
    if (rig.parts[1]) rig.parts[1].rotation.x = -Math.sin(t * 3.8) * 0.14;
  } else if (
    rig.id === 'giant_kelp' ||
    rig.id === 'seagrass' ||
    rig.id === 'sea_anemone' ||
    rig.id === 'sea_fan' ||
    rig.id === 'bioluminescent_algae'
  ) {
    rig.parts.forEach((p, idx) => {
      p.rotation.z = Math.sin(t * 1.8 + idx * 0.65) * 0.09;
    });
  }
}
