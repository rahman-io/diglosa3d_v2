import * as THREE from 'three';
import type { MaterialPalette } from './materials';
import { createCaptiveMesh, type CaptiveAnimRig, type DungeonArenaRig } from './rpgModels';
import { sampleDesaCaveGroundY } from './desaCaveWorld';

export type DesaCitizenActivity =
  | 'irrigate'
  | 'water_plants'
  | 'fetch_water'
  | 'cook_share'
  | 'carry_crate'
  | 'repair_lantern'
  | 'sweep_bridge'
  | 'teach_read'
  | 'play_kids'
  | 'tend_river'
  | 'compost_soil'
  | 'greet_gate';

export interface DesaCommunityScenarioDef {
  id: number;
  location: 'inside' | 'outside';
  title: string;
  actors: string;
  areaLabel: string;
  summary: string;
  englishPhrase: string;
}

export const DESA_COMMUNITY_SCENARIOS: DesaCommunityScenarioDef[] = [
  {
    id: 1,
    location: 'inside',
    title: 'Mengaliri Saluran Irigasi Sungai Kristal',
    actors: 'Pak Darma',
    areaLabel: 'Tepi Sungai Kristal Tenggara (Gua)',
    summary: 'Memasang saluran bambu dan kincir air mini untuk mengalirkan air Sungai Kristal ke petak kebun gua.',
    englishPhrase: 'Let us channel the clean river water to our garden!',
  },
  {
    id: 2,
    location: 'inside',
    title: 'Berkebun & Menyiram Sayur Segar Gua',
    actors: 'Bu Sari',
    areaLabel: 'Kebun Sayur Tenggara (eks-Sel 3)',
    summary: 'Menanam wortel, kubis, dan tomat subur di tanah gua yang kini terang serta menyiramnya rutin.',
    englishPhrase: 'Good morning! I am watering the fresh vegetables.',
  },
  {
    id: 3,
    location: 'inside',
    title: 'Menimba Air Bersih dari Sumur Tua Bersama',
    actors: 'Pak Tono',
    areaLabel: 'Sumur Tua Plaza Bawah (Gua)',
    summary: 'Menimba air jernih dari sumur batu untuk kebutuhan dapur umum dan menyiram tanaman plaza.',
    englishPhrase: 'Thank you for helping me carry fresh water!',
  },
  {
    id: 4,
    location: 'inside',
    title: 'Dapur Umum & Berbagi Hasil Panen Hangat',
    actors: 'Mbak Wulan',
    areaLabel: 'Pelataran Tengah Plaza Bawah (Gua)',
    summary: 'Memasak sup sayur hangat di kuali dan membagikannya kepada warga yang bekerja bakti.',
    englishPhrase: 'Welcome! Please enjoy this warm meal together.',
  },
  {
    id: 5,
    location: 'inside',
    title: 'Gotong Royong Mengangkut Keranjang Panen',
    actors: 'Bang Jaka',
    areaLabel: 'Jalur Plaza Bawah – Tangga Keluar (Gua)',
    summary: 'Mengangkut peti sayur dan buah panen dari kebun gua menuju dapur umum dan pintu keluar desa.',
    englishPhrase: 'Many hands make heavy work light!',
  },
  {
    id: 6,
    location: 'inside',
    title: 'Merawat Tanaman Obat & Bunga Taman Barat',
    actors: 'Sinta',
    areaLabel: 'Taman Labirin Barat (Gua)',
    summary: 'Menyiram herba obat dan merawat bunga lavender di koridor barat gua yang sejuk.',
    englishPhrase: 'Take care of the herbs and flowers every day.',
  },
  {
    id: 7,
    location: 'inside',
    title: 'Menyalakan & Merawat Lentera Jalan Gua',
    actors: 'Tobi',
    areaLabel: 'Teras Pintu Depan Gua',
    summary: 'Memeriksa nyala lentera di jalur keluar-masuk agar seluruh warga berjalan terang dan nyaman.',
    englishPhrase: 'Good evening! The cave path is bright and safe.',
  },
  {
    id: 8,
    location: 'inside',
    title: 'Membersihkan & Merawat Jembatan Batu Lengkung',
    actors: 'Kang Ujang',
    areaLabel: 'Jembatan Batu Sungai Kristal (Gua)',
    summary: 'Menyapu lumut licin dan memeriksa pagar jembatan batu agar aman dilalui anak-anak maupun lansia.',
    englishPhrase: 'Please cross the stone bridge safely!',
  },
  {
    id: 9,
    location: 'inside',
    title: 'Taman Baca & Belajar Kosakata Bersama',
    actors: 'Rani & Kakak Raka',
    areaLabel: 'Teras Tinggi Atas (eks-Sel 1)',
    summary: 'Mengubah pelataran atas menjadi taman baca terbuka untuk belajar sapaan dan kosakata bersama.',
    englishPhrase: 'Hello, friend! Let us read and learn together.',
  },
  {
    id: 10,
    location: 'inside',
    title: 'Anak-Anak Bermain Aman di Halaman Gua',
    actors: 'Bimo & Naya',
    areaLabel: 'Halaman Plaza Bawah (Gua)',
    summary: 'Bermain kejar-kejaran dan berlatih sapaan ceria di taman bunga plaza tanpa rasa takut lagi.',
    englishPhrase: 'Goodbye fear, hello happy playtime!',
  },
  {
    id: 11,
    location: 'inside',
    title: 'Menjaga Kejernihan Air & Ekosistem Sungai',
    actors: 'Paman Rudi',
    areaLabel: 'Tanjung Tengah Dekat Air Terjun (Gua)',
    summary: 'Memantau kejernihan air terjun Sungai Kristal dan menjaga ikan serta biota sungai tetap lestari.',
    englishPhrase: 'Keep the crystal river clean for everyone.',
  },
  {
    id: 12,
    location: 'inside',
    title: 'Mengolah Kompos Daun & Pembibitan Pohon',
    actors: 'Ibu Lilis',
    areaLabel: 'Pelataran Lumbung Timur (Gua)',
    summary: 'Mengolah guguran daun menjadi pupuk kompos alami untuk menyuburkan bibit pohon baru.',
    englishPhrase: 'Healthy soil grows strong trees and food.',
  },
  {
    id: 13,
    location: 'inside',
    title: 'Pemandu Warga Keluar-Masuk Pintu Depan Gua',
    actors: 'Kakek Salim',
    areaLabel: 'Ambang Pintu Depan Gua (Gua)',
    summary: 'Menyambut warga desa yang masuk berkebun atau pulang membawa hasil panen melalui pintu gua yang terbuka.',
    englishPhrase: 'Welcome inside! Feel safe and at home.',
  },
  {
    id: 14,
    location: 'outside',
    title: 'Warga Desa Keluar-Masuk Gerbang Gua Membawa Panen',
    actors: 'Pemuda Tani Bagas & Perangkai Bunga Rina',
    areaLabel: 'Dek Kayu Mulut Gua Hutan Kata (Luar)',
    summary: 'Berjalan aman pulang-pergi melintasi gerbang kayu gua yang terbuka membawa hasil panen dan bunga.',
    englishPhrase: 'We walk in and out of the cave safely!',
  },
  {
    id: 15,
    location: 'outside',
    title: 'Kerja Bakti Merawat Ladang Gandum & Irigasi Desa',
    actors: 'Petani Desa & Bagas',
    areaLabel: 'Ladang Gandum Timur Desa Sapaan',
    summary: 'Mengolah tanah gandum emas dan membagi air irigasi bersih secara bergantian antar petak ladang.',
    englishPhrase: 'We harvest golden wheat together.',
  },
  {
    id: 16,
    location: 'outside',
    title: 'Menghias Plaza & Jalan Setapak dengan Bunga Segar',
    actors: 'Florist Desa & Perangkai Bunga Rina',
    areaLabel: 'Taman Bunga Barat & Gerbang Gua',
    summary: 'Menata rangkaian bunga aster dan bunga desa di sepanjang jalur menuju gerbang gua.',
    englishPhrase: 'These fresh flowers welcome every visitor.',
  },
  {
    id: 17,
    location: 'outside',
    title: 'Menyiapkan Jamu & Teh Hangat untuk Pekerja Bakti',
    actors: 'Nenek Jamu Desa',
    areaLabel: 'Halaman Utara & Balai Desa',
    summary: 'Meracik minuman herbal hangat untuk memulihkan tenaga warga yang selesai bergotong royong.',
    englishPhrase: 'Drink some warm tea and thank you!',
  },
  {
    id: 18,
    location: 'outside',
    title: 'Sesepuh & Pak Budi Memandu Warga & Pendatang',
    actors: 'Pak Budi, Rani & Sesepuh Gerbang Utara',
    areaLabel: 'Gerbang Gua & Alun-Alun Desa Sapaan',
    summary: 'Membimbing tamu dan warga tentang sopan santun sapaan serta menjaga kerukunan antar keluarga.',
    englishPhrase: 'Good afternoon! Welcome to peaceful Desa Sapaan.',
  },
  {
    id: 19,
    location: 'outside',
    title: 'Anak-Anak & Siswi Desa Belajar Sapaan Sambil Bermain',
    actors: 'Bocah Desa Dani, Siswi Sinta & Anak Desa',
    areaLabel: 'Halaman Bermain & Sekolah Desa Sapaan',
    summary: 'Bermain petak umpet dengan aman serta mencatat kosakata sapaan baru di halaman desa.',
    englishPhrase: 'Hello! Good morning, my dear friend!',
  },
  {
    id: 20,
    location: 'outside',
    title: 'Ronda Ramah Iron Golem & Penjaga Keamanan Malam',
    actors: 'Iron Golem Desa & Penjaga Gerbang',
    areaLabel: 'Plaza Desa hingga Mulut Gua Hutan Kata',
    summary: 'Berpatroli ramah bersama lebah dan warga sepanjang hari untuk menjamin desa tetap aman sentosa.',
    englishPhrase: 'Our village and cave are safe day and night.',
  },
];

export interface DesaAdmireLine {
  id: string;
  en: string;
}

export interface DesaCaveCitizenActor {
  id: string;
  name: string;
  roleBadge: string;
  scenarioTitle: string;
  dialogueId: string;
  dialogueEn: string;
  admireLines: ReadonlyArray<DesaAdmireLine>;
  activity: DesaCitizenActivity;
  mesh: THREE.Group;
  waypoints: Array<[number, number]>;
  wpIdx: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  speed: number;
  pauseTimer: number;
  phase: number;
  gateTransit?: boolean;
  transitHideTimer: number;
  greetTimer: number;
  greetCooldown: number;
  greetVariant: number;
  wasHeroNear: boolean;
}

export interface DesaCaveLivingWorldState {
  propsGroup: THREE.Group;
  waterwheel: THREE.Object3D | null;
  actors: DesaCaveCitizenActor[];
  actorById: Map<string, DesaCaveCitizenActor>;
  greetChimeRequested: boolean;
}

const _citizenTargetPos = { x: 0, z: 0 };

function createHandheldProp(
  kind: 'crate' | 'watering_can' | 'broom' | 'hoe' | 'bucket' | 'book' | 'lantern',
  palette: MaterialPalette,
  disposables: Array<{ dispose: () => void }>,
): THREE.Group {
  const g = new THREE.Group();
  const makeBox = (
    w: number,
    h: number,
    d: number,
    color: number,
    px: number,
    py: number,
    pz: number,
    mode: 'matte' | 'emissive' | 'metal' = 'matte',
  ) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    disposables.push(geo);
    const m = new THREE.Mesh(geo, palette.getMat(color, mode));
    m.position.set(px, py, pz);
    g.add(m);
    return m;
  };

  if (kind === 'crate') {
    makeBox(0.56, 0.4, 0.44, 0x92400e, 0, -0.35, 0.34);
    makeBox(0.18, 0.14, 0.18, 0xf97316, -0.12, -0.1, 0.32);
    makeBox(0.18, 0.14, 0.18, 0x22c55e, 0.12, -0.1, 0.36);
  } else if (kind === 'watering_can') {
    makeBox(0.28, 0.26, 0.32, 0x0284c7, 0, -0.48, 0.12, 'metal');
    makeBox(0.09, 0.09, 0.24, 0x38bdf8, 0, -0.42, 0.34);
  } else if (kind === 'broom') {
    makeBox(0.08, 1.05, 0.08, 0x854d0e, 0, -0.45, 0.18);
    makeBox(0.32, 0.2, 0.18, 0xfbbf24, 0, -0.96, 0.2);
  } else if (kind === 'hoe') {
    makeBox(0.08, 1.05, 0.08, 0x78350f, 0, -0.45, 0.16);
    makeBox(0.12, 0.12, 0.36, 0x64748b, 0, -0.92, 0.26, 'metal');
  } else if (kind === 'bucket') {
    makeBox(0.3, 0.32, 0.3, 0x92400e, 0, -0.58, 0.06);
    makeBox(0.24, 0.06, 0.24, 0x38bdf8, 0, -0.44, 0.06, 'emissive');
  } else if (kind === 'book') {
    makeBox(0.32, 0.08, 0.24, 0x2563eb, 0, -0.46, 0.18);
    makeBox(0.28, 0.05, 0.2, 0xfef9c3, 0, -0.41, 0.18);
  } else if (kind === 'lantern') {
    makeBox(0.22, 0.28, 0.22, 0xfbbf24, 0, -0.55, 0.16, 'emissive');
    makeBox(0.26, 0.08, 0.26, 0x334155, 0, -0.4, 0.16, 'metal');
  }
  return g;
}

function buildDesaLivingProps(
  palette: MaterialPalette,
  disposables: Array<{ dispose: () => void }>,
): { propsGroup: THREE.Group; waterwheel: THREE.Object3D | null } {
  const propsGroup = new THREE.Group();
  const addBox = (
    parent: THREE.Object3D,
    w: number,
    h: number,
    d: number,
    color: number,
    x: number,
    y: number,
    z: number,
    rotY = 0,
    mode: 'matte' | 'emissive' | 'metal' = 'matte',
  ) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    disposables.push(geo);
    const mesh = new THREE.Mesh(geo, palette.getMat(color, mode));
    mesh.position.set(x, y, z);
    if (rotY !== 0) mesh.rotation.y = rotY;
    mesh.castShadow = mode === 'matte';
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // 1. Bamboo Irrigation Channel & Mini Waterwheel (SE Crystal Riverbank -> SE Garden)
  {
    const irrGrp = new THREE.Group();
    // Bamboo aqueduct bridge from riverbank edge (27.8, 0.72, 40.4) to SE garden (34.4, 0.68, 39.1)
    addBox(irrGrp, 6.8, 0.22, 0.65, 0x65a30d, 31.1, 0.78, 39.75, 0.19);
    addBox(irrGrp, 6.6, 0.1, 0.42, 0x22d3ee, 31.1, 0.91, 39.75, 0.19, 'emissive');
    [28.2, 31.1, 34.0].forEach((px, idx) => {
      const pz = 40.3 - idx * 0.55;
      addBox(irrGrp, 0.24, 0.85, 0.24, 0x854d0e, px, 0.42, pz);
    });
    // Rotating waterwheel poised cleanly over the crystal river edge
    const wheelHub = new THREE.Group();
    wheelHub.position.set(27.4, 0.75, 40.5);
    wheelHub.rotation.y = 0.19;
    addBox(wheelHub, 0.28, 1.85, 0.24, 0x92400e, 0, 0, 0);
    addBox(wheelHub, 1.85, 0.28, 0.24, 0x92400e, 0, 0, 0);
    addBox(wheelHub, 0.36, 0.36, 0.44, 0x451a03, 0, 0, 0);
    irrGrp.add(wheelHub);
    propsGroup.add(irrGrp);

    // 2. SE Raised Vegetable Garden Beds (clear of riverside tree & Sel 3 tree)
    const buildGardenBed = (bx: number, by: number, bz: number) => {
      addBox(propsGroup, 4.2, 0.34, 1.6, 0x78350f, bx, by + 0.17, bz);
      addBox(propsGroup, 3.85, 0.14, 1.28, 0x451a03, bx, by + 0.36, bz);
      for (let i = -1; i <= 1; i++) {
        const cx = bx + i * 1.15;
        addBox(propsGroup, 0.36, 0.34, 0.36, 0x22c55e, cx, by + 0.52, bz - 0.26);
        addBox(propsGroup, 0.24, 0.24, 0.24, i === 0 ? 0xef4444 : 0xf97316, cx, by + 0.48, bz + 0.26);
      }
    };
    buildGardenBed(36.5, 0.0, 31.8);
    buildGardenBed(36.5, 0.0, 41.8);

    // 3. West Maze Herb Garden Beds (tucked safely along z=17.5 corridor)
    buildGardenBed(-27.8, 2.0, 17.5);

    // 4. Water Buckets & Shoulder Yoke beside Sumur Tua
    addBox(propsGroup, 0.42, 0.44, 0.42, 0x854d0e, 11.4, 0.22, 40.4);
    addBox(propsGroup, 0.34, 0.08, 0.34, 0x38bdf8, 11.4, 0.42, 40.4, 0, 'emissive');
    addBox(propsGroup, 1.35, 0.1, 0.12, 0xa16207, 11.9, 0.25, 41.2, 0.4);

    // 5. Community Kitchen & Sharing Picnic Mat in Lower Courtyard
    addBox(propsGroup, 2.8, 0.06, 2.2, 0xd97706, 3.0, 0.03, 39.2, 0.15);
    addBox(propsGroup, 0.9, 0.65, 0.9, 0x334155, 4.1, 0.32, 38.4, 0, 'metal');
    addBox(propsGroup, 0.58, 0.22, 0.58, 0xf97316, 4.1, 0.68, 38.4, 0, 'emissive');
    addBox(propsGroup, 0.68, 0.42, 0.54, 0x92400e, 2.2, 0.24, 39.7);
    addBox(propsGroup, 0.44, 0.2, 0.36, 0xfacc15, 2.2, 0.5, 39.7);

    // 6. High Courtyard Open-Air Reading Bench & Book Stack (Teras Atas y=9.5)
    addBox(propsGroup, 3.0, 0.22, 0.9, 0x854d0e, 2.0, 9.95, -30.8);
    addBox(propsGroup, 0.32, 0.45, 0.72, 0x713f12, 0.85, 9.72, -30.8);
    addBox(propsGroup, 0.32, 0.45, 0.72, 0x713f12, 3.15, 9.72, -30.8);
    addBox(propsGroup, 0.5, 0.26, 0.4, 0x2563eb, 2.0, 10.18, -30.8);
    addBox(propsGroup, 0.42, 0.18, 0.34, 0xf43f5e, 2.05, 10.38, -30.8, 0.25);

    // 7. Compost Bin & Potted Saplings (East Guardhouse Courtyard y=3.5)
    addBox(propsGroup, 1.8, 0.8, 1.4, 0x713f12, 31.2, 3.9, 7.2);
    addBox(propsGroup, 1.5, 0.24, 1.1, 0x3f6212, 31.2, 4.35, 7.2);
    addBox(propsGroup, 0.55, 0.45, 0.55, 0x92400e, 29.4, 3.72, 7.2);
    addBox(propsGroup, 0.45, 0.65, 0.45, 0x22c55e, 29.4, 4.25, 7.2);

    // 8. Exit Terrace Lantern Stand & Supply Rack (y=3.5)
    addBox(propsGroup, 0.25, 1.75, 0.25, 0x451a03, -17.5, 4.37, 27.6);
    addBox(propsGroup, 0.42, 0.48, 0.42, 0xfde047, -17.5, 5.42, 27.6, 0, 'emissive');

    return { propsGroup, waterwheel: wheelHub };
  }
}

export function initDesaCaveLivingWorld(
  rig: DungeonArenaRig,
  palette: MaterialPalette,
  dungeonClickables: THREE.Object3D[],
): DesaCaveLivingWorldState {
  const { propsGroup, waterwheel } = buildDesaLivingProps(palette, rig.disposables);
  rig.group.add(propsGroup);

  // Gather the 11 rescued captives from the 3 prison cells cleanly
  const byId = new Map<string, THREE.Group>();
  if (rig.prisonCells) {
    for (const cell of rig.prisonCells) {
      for (const cap of cell.captives) {
        byId.set(cap.id, cap.mesh);
      }
    }
  }

  const getOrCreateMesh = (
    id: string,
    kind: 'girl' | 'mother' | 'student',
    color: number,
    hairColor?: number,
    scale?: number,
    hideRibbon?: boolean,
  ): THREE.Group => {
    const existing = byId.get(id);
    if (existing) return existing;
    return createCaptiveMesh(kind, color, palette, { hairColor, scale, hideRibbon });
  };

  const plans: Array<{
    id: string;
    name: string;
    roleBadge: string;
    scenarioTitle: string;
    dialogueId: string;
    dialogueEn: string;
    admireLines: ReadonlyArray<DesaAdmireLine>;
    activity: DesaCitizenActivity;
    mesh: THREE.Group;
    prop?: 'crate' | 'watering_can' | 'broom' | 'hoe' | 'bucket' | 'book' | 'lantern';
    waypoints: Array<[number, number]>;
    speed: number;
    gateTransit?: boolean;
  }> = [
    {
      id: 'adult_1',
      name: 'Pak Darma',
      roleBadge: 'Petani Irigasi',
      scenarioTitle: 'Irigasi Sungai Kristal',
      dialogueId: 'Air Sungai Kristal kini jernih! Kami alirkan lewat saluran bambu untuk menyuburkan kebun gua.',
      dialogueEn: 'Let us channel the clean river water to our garden!',
      admireLines: [
        {
          id: 'Halo {player}, pahlawan kebanggaan kami! Sungai ini jernih berkat jasamu!',
          en: 'Hello {player}! You are our beloved hero!',
        },
        {
          id: 'Wah, sang penyelamat {player} lewat! Semua warga kagum padamu!',
          en: 'Everyone here admires you, {player}!',
        },
      ],
      activity: 'irrigate',
      mesh: getOrCreateMesh('adult_1', 'mother', 0x0f766e, 0x1e293b, 1.06, true),
      prop: 'hoe',
      waypoints: [
        [28.6, 41.5],
        [31.0, 40.8],
        [34.2, 40.0],
      ],
      speed: 1.55,
    },
    {
      id: 'adult_2',
      name: 'Bu Sari',
      roleBadge: 'Pekebun Gua',
      scenarioTitle: 'Berkebun Sayur Segar Gua',
      dialogueId: 'Wortel, kubis, dan tomat tumbuh subur sekali di sini! Ayo ikut panen bersama!',
      dialogueEn: 'Good morning! I am watering the fresh vegetables.',
      admireLines: [
        {
          id: 'Selamat datang {player}! Berkat kamu, kebun kami damai dan subur!',
          en: 'Welcome, {player}! Thank you for saving us!',
        },
        {
          id: 'Lihat siapa yang datang! {player} pahlawan paling disenangi di desa ini!',
          en: 'Good morning, dear hero {player}!',
        },
      ],
      activity: 'water_plants',
      mesh: getOrCreateMesh('adult_2', 'mother', 0xe11d48, 0x451a03, 1.02),
      prop: 'watering_can',
      waypoints: [
        [35.2, 30.2],
        [35.2, 40.0],
        [39.5, 40.0],
        [39.5, 30.2],
      ],
      speed: 1.5,
    },
    {
      id: 'adult_5',
      name: 'Pak Tono',
      roleBadge: 'Penimba Sumur',
      scenarioTitle: 'Menimba Air Sumur Tua',
      dialogueId: 'Sumur tua ini airnya sejuk dan segar. Cukup untuk dapur umum maupun menyiram bunga!',
      dialogueEn: 'Thank you for helping me carry fresh water!',
      admireLines: [
        {
          id: 'Salam hormat, {player}! Nama besarmu selalu kami kenang di Desa Sapaan!',
          en: 'Thank you forever, {player}!',
        },
        {
          id: 'Senang sekali melihat {player} lewat! Terima kasih telah membebaskan kami!',
          en: 'So happy to see you, {player}!',
        },
      ],
      activity: 'fetch_water',
      mesh: getOrCreateMesh('adult_5', 'mother', 0x4d7c0f, 0x64748b, 1.05, true),
      prop: 'bucket',
      waypoints: [
        [6.9, 42.0],
        [7.1, 39.0],
        [11.8, 39.0],
        [7.1, 39.0],
      ],
      speed: 1.45,
    },
    {
      id: 'adult_4',
      name: 'Mbak Wulan',
      roleBadge: 'Dapur Warga',
      scenarioTitle: 'Dapur Umum & Berbagi Panen',
      dialogueId: 'Sup sayur hangat sudah siap! Warga yang selesai berkebun silakan mampir mencicipi.',
      dialogueEn: 'Welcome! Please enjoy this warm meal together.',
      admireLines: [
        {
          id: 'Hai {player} sang pahlawan! Sup hangat ini khusus untuk tamu teristimewa!',
          en: 'Welcome {player}! Our greatest hero!',
        },
        {
          id: 'Kami semua senang dan kagum sama {player}! Desa ini aman berkatmu!',
          en: 'We all adore you, {player}!',
        },
      ],
      activity: 'cook_share',
      mesh: getOrCreateMesh('adult_4', 'mother', 0xd97706, 0x27272a, 1.0),
      waypoints: [
        [1.1, 38.8],
        [2.9, 37.3],
        [4.9, 40.6],
      ],
      speed: 1.5,
    },
    {
      id: 'adult_3',
      name: 'Bang Jaka',
      roleBadge: 'Pengangkut Panen',
      scenarioTitle: 'Mengangkut Hasil Panen',
      dialogueId: 'Dengan gotong royong, mengangkut keranjang panen ke desa jadi terasa ringan dan cepat!',
      dialogueEn: 'Many hands make heavy work light!',
      admireLines: [
        {
          id: 'Mantap, {player}! Kamu pahlawan terkenal sejagat Desa Sapaan!',
          en: 'Hello legend {player}! Awesome to see you!',
        },
        {
          id: 'Luar biasa {player}! Berkat keberanianmu, kami bisa bekerja dengan tenang!',
          en: 'Thank you for bringing peace, {player}!',
        },
      ],
      activity: 'carry_crate',
      mesh: getOrCreateMesh('adult_3', 'student', 0x2563eb, 0x0f172a, 1.08, true),
      prop: 'crate',
      waypoints: [
        [-3.4, 43.8],
        [1.2, 43.6],
        [-1.0, 39.4],
        [-3.0, 42.2],
      ],
      speed: 1.75,
    },
    {
      id: 'child_2',
      name: 'Sinta',
      roleBadge: 'Perawat Herba',
      scenarioTitle: 'Merawat Taman Obat Barat',
      dialogueId: 'Tanaman obat dan bunga di taman barat wangi sekali! Kami menyiramnya bergantian tiap pagi.',
      dialogueEn: 'Take care of the herbs and flowers every day.',
      admireLines: [
        {
          id: 'Kak {player}!! Hebat banget sudah menyelamatkan gua dan pulau kami!',
          en: 'Hi {player}! You are my favorite hero!',
        },
        {
          id: 'Halo Kak {player}! Semua bunga ikut mekar menyambut sang penyelamat!',
          en: 'Welcome back, hero {player}!',
        },
      ],
      activity: 'water_plants',
      mesh: getOrCreateMesh('child_2', 'girl', 0xa855f7, 0x1e293b, 0.76),
      prop: 'watering_can',
      waypoints: [
        [-23.8, 15.6],
        [-27.6, 15.6],
        [-30.2, 15.2],
      ],
      speed: 1.65,
    },
    {
      id: 'child_3',
      name: 'Tobi',
      roleBadge: 'Penjaga Lentera',
      scenarioTitle: 'Merawat Lentera Jalan Gua',
      dialogueId: 'Semua lentera teras depan menyala hangat supaya warga bisa keluar-masuk gua dengan aman.',
      dialogueEn: 'Good evening! The cave path is bright and safe.',
      admireLines: [
        {
          id: 'Halo Kak {player}! Kamu keren sekali, seluruh warga mengagumimu!',
          en: 'Hello {player}! You are so brave!',
        },
        {
          id: 'Wah ada Kak {player}! Jalan gua terang dan aman berkat Kakak!',
          en: 'Our hero {player} is here!',
        },
      ],
      activity: 'repair_lantern',
      mesh: getOrCreateMesh('child_3', 'student', 0x10b981, 0x713f12, 0.74, true),
      prop: 'lantern',
      waypoints: [
        [-16.4, 26.2],
        [-12.6, 25.4],
        [-11.0, 28.4],
        [-16.2, 28.4],
      ],
      speed: 1.75,
    },
    {
      id: 'helper_ujang',
      name: 'Kang Ujang',
      roleBadge: 'Perawat Jembatan',
      scenarioTitle: 'Merawat & Menyapu Jembatan Batu',
      dialogueId: 'Jembatan batu sungai sudah kubersihkan dari lumut licin. Silakan menyeberang dengan nyaman!',
      dialogueEn: 'Please cross the stone bridge safely!',
      admireLines: [
        {
          id: 'Sugeng rawuh, {player}! Jembatan ini bersih dan aman untuk sang pahlawan!',
          en: 'Welcome, {player}! Cross safely, hero!',
        },
        {
          id: 'Wah, pahlawan {player} lewat! Semua warga bangga padamu!',
          en: 'So proud to greet you, {player}!',
        },
      ],
      activity: 'sweep_bridge',
      mesh: getOrCreateMesh('helper_ujang', 'student', 0x0ea5e9, 0x334155, 1.02, true),
      prop: 'broom',
      waypoints: [
        [-6.2, 21.75],
        [-1.5, 19.0],
        [3.3, 16.2],
        [-1.5, 19.0],
      ],
      speed: 1.55,
    },
    {
      id: 'raka',
      name: 'Kakak Raka',
      roleBadge: 'Taman Baca',
      scenarioTitle: 'Taman Baca & Belajar Kosakata',
      dialogueId: 'Teras atas ini sekarang jadi Taman Baca Desa! Ayo latihan kosakata baru bersama kami.',
      dialogueEn: 'Hello, friend! Let us read and learn together.',
      admireLines: [
        {
          id: 'Halo {player}! Kisah heroikmu jadi panutan di Taman Baca kami!',
          en: 'Hello {player}! You inspire everyone here!',
        },
        {
          id: 'Senang sekali melihat {player}! Terima kasih telah memulihkan kedamaian!',
          en: 'Good day, savior {player}!',
        },
      ],
      activity: 'teach_read',
      mesh: getOrCreateMesh('raka', 'student', 0x0284c7, 0x1e293b, 1.05, true),
      prop: 'book',
      waypoints: [
        [0.4, -32.6],
        [3.6, -32.6],
      ],
      speed: 1.35,
    },
    {
      id: 'rani',
      name: 'Rani',
      roleBadge: 'Sahabat Desa',
      scenarioTitle: 'Belajar Ceria di Taman Atas',
      dialogueId: 'Terima kasih Kakak Pahlawan! Sekarang aku, Kak Raka, dan semua warga bebas beraktivitas di gua!',
      dialogueEn: 'Hello! Thank you for making our home peaceful!',
      admireLines: [
        {
          id: 'Kak {player}!! Aku dan seluruh warga tidak akan pernah lupa kebaikanmu!',
          en: 'Thank you so much, {player}!',
        },
        {
          id: 'Horeee Kak {player} datang! Pahlawan paling baik dan hebat!',
          en: 'Hello, my hero {player}!',
        },
      ],
      activity: 'teach_read',
      mesh: getOrCreateMesh('rani', 'girl', 0xf43f5e),
      waypoints: [
        [-1.2, -33.4],
        [2.2, -35.0],
        [4.6, -33.2],
      ],
      speed: 1.65,
    },
    {
      id: 'child_1',
      name: 'Bimo',
      roleBadge: 'Anak Ceria',
      scenarioTitle: 'Bermain Aman di Halaman Gua',
      dialogueId: 'Hore! Tidak ada monster lagi! Kami bebas bermain petak umpet di taman bunga plaza!',
      dialogueEn: 'Goodbye fear, hello happy playtime!',
      admireLines: [
        {
          id: 'Yey, Kak {player} lewat! Kakak keren banget sudah mengusir semua monster!',
          en: 'Yay, hello hero {player}!',
        },
        {
          id: 'Halo Kak {player}! Aku mau jadi sekuat dan sebaik Kakak nanti!',
          en: 'You are so cool, {player}!',
        },
      ],
      activity: 'play_kids',
      mesh: getOrCreateMesh('child_1', 'student', 0xf97316, 0x451a03, 0.78, true),
      waypoints: [
        [-10.2, 43.2],
        [-6.2, 45.2],
        [-2.8, 45.2],
      ],
      speed: 2.15,
    },
    {
      id: 'child_4',
      name: 'Naya',
      roleBadge: 'Penyambut Cilik',
      scenarioTitle: 'Bermain & Menyapa Warga',
      dialogueId: 'Lihat kupu-kupunya beterbangan! Aku suka membantu menyapa tamu di halaman gua!',
      dialogueEn: 'Good morning! Look at the pretty butterflies!',
      admireLines: [
        {
          id: 'Halo Kak {player} yang terkenal! Semua anak di desa kagum sekali padamu!',
          en: 'Hello famous hero {player}!',
        },
        {
          id: 'Selamat datang kembali, Kak {player}! Kami senang sekali lihat Kakak!',
          en: 'Welcome! So happy to see you, {player}!',
        },
      ],
      activity: 'play_kids',
      mesh: getOrCreateMesh('child_4', 'girl', 0xec4899, 0x3b0764, 0.72),
      waypoints: [
        [-2.8, 45.2],
        [-7.2, 43.4],
        [-10.2, 44.8],
      ],
      speed: 2.05,
    },
    {
      id: 'helper_rudi',
      name: 'Paman Rudi',
      roleBadge: 'Penjaga Sungai',
      scenarioTitle: 'Menjaga Kejernihan Sungai Kristal',
      dialogueId: 'Aliran air terjun Sungai Kristal tetap bersih dan ikannya mulai berenang kembali!',
      dialogueEn: 'Keep the crystal river clean for everyone.',
      admireLines: [
        {
          id: 'Salam hangat, {player}! Berkatmu, Sungai Kristal kembali tenang dan indah!',
          en: 'Warm greetings, hero {player}!',
        },
        {
          id: 'Lihat, pahlawan kita {player} hadir! Terima kasih sudah menjaga desa kami!',
          en: 'Thank you for protecting us, {player}!',
        },
      ],
      activity: 'tend_river',
      mesh: getOrCreateMesh('helper_rudi', 'mother', 0x0d9488, 0x1e293b, 1.04, true),
      waypoints: [
        [2.8, 5.5],
        [3.6, 8.2],
        [2.8, 11.2],
      ],
      speed: 1.45,
    },
    {
      id: 'helper_lilis',
      name: 'Ibu Lilis',
      roleBadge: 'Pembibit Pohon',
      scenarioTitle: 'Mengolah Kompos & Bibit Pohon',
      dialogueId: 'Guguran daun dari taman kami olah jadi kompos untuk bibit pohon baru di sayap timur!',
      dialogueEn: 'Healthy soil grows strong trees and food.',
      admireLines: [
        {
          id: 'Nak {player}! Wajahmu selalu bikin hati warga tenteram dan gembira!',
          en: 'Bless you, dear {player}!',
        },
        {
          id: 'Salam hangat, {player}! Desa Sapaan makmur karena jasa penyelamatanmu!',
          en: 'Welcome home, hero {player}!',
        },
      ],
      activity: 'compost_soil',
      mesh: getOrCreateMesh('helper_lilis', 'mother', 0x84cc16, 0x451a03, 1.0),
      prop: 'hoe',
      waypoints: [
        [24.6, 9.4],
        [29.6, 9.4],
        [32.8, 10.2],
      ],
      speed: 1.45,
    },
    {
      id: 'helper_salim',
      name: 'Kakek Salim',
      roleBadge: 'Sesepuh Gerbang',
      scenarioTitle: 'Penyambut Pintu Depan Gua',
      dialogueId: 'Pintu gua sekarang terbuka lebar! Warga desa bebas keluar masuk membantu kebun di dalam gua.',
      dialogueEn: 'Welcome inside! Feel safe and at home.',
      admireLines: [
        {
          id: 'Selamat datang, {player} sang penyelamat! Pintu desa selalu terbuka untukmu!',
          en: 'Welcome, our beloved savior {player}!',
        },
        {
          id: 'Kakek dan semua warga amat berterima kasih padamu, {player}!',
          en: 'We are forever grateful, {player}!',
        },
      ],
      activity: 'greet_gate',
      mesh: getOrCreateMesh('helper_salim', 'mother', 0x78350f, 0xe2e8f0, 1.02, true),
      waypoints: [
        [-10.2, 31.4],
        [-12.6, 30.0],
        [-14.3, 29.1],
      ],
      speed: 1.35,
      gateTransit: true,
    },
  ];

  const actors: DesaCaveCitizenActor[] = [];
  const actorById = new Map<string, DesaCaveCitizenActor>();

  plans.forEach((p, idx) => {
    const startX = p.waypoints[0][0];
    const startZ = p.waypoints[0][1];
    const startY = sampleDesaCaveGroundY(startX, startZ, 10);
    p.mesh.visible = true;
    p.mesh.position.set(startX, startY, startZ);
    p.mesh.userData.caveCitizenId = p.id;
    p.mesh.traverse((child) => {
      child.userData.caveCitizenId = p.id;
    });
    if (p.prop) {
      const rigAnim = p.mesh.userData.captiveRig as CaptiveAnimRig | undefined;
      const anchor = p.prop === 'crate' ? rigAnim?.bodyPivot : rigAnim?.rightArm;
      if (anchor) {
        const propMesh = createHandheldProp(p.prop, palette, rig.disposables);
        if (p.prop === 'crate') {
          propMesh.position.set(0, 1.05, 0.25);
        }
        anchor.add(propMesh);
      }
    }
    rig.group.add(p.mesh);
    if (!dungeonClickables.includes(p.mesh)) {
      dungeonClickables.push(p.mesh);
    }

    const actor: DesaCaveCitizenActor = {
      id: p.id,
      name: p.name,
      roleBadge: p.roleBadge,
      scenarioTitle: p.scenarioTitle,
      dialogueId: p.dialogueId,
      dialogueEn: p.dialogueEn,
      admireLines: p.admireLines,
      activity: p.activity,
      mesh: p.mesh,
      waypoints: p.waypoints,
      wpIdx: p.waypoints.length > 1 ? 1 : 0,
      x: startX,
      y: startY,
      z: startZ,
      yaw: 0,
      speed: p.speed,
      pauseTimer: (idx % 4) * 0.65,
      phase: idx * 0.77,
      gateTransit: p.gateTransit,
      transitHideTimer: 0,
      greetTimer: 0,
      greetCooldown: (idx % 5) * 0.15,
      greetVariant: idx % p.admireLines.length,
      wasHeroNear: false,
    };
    actors.push(actor);
    actorById.set(actor.id, actor);
  });

  return { propsGroup, waterwheel, actors, actorById, greetChimeRequested: false };
}

function animateCaveCitizenPose(
  actor: DesaCaveCitizenActor,
  elapsed: number,
  moving: boolean,
  heroNear: boolean,
  isGreeting: boolean,
): void {
  const rig = actor.mesh.userData.captiveRig as CaptiveAnimRig | undefined;
  if (!rig) return;
  const t = elapsed + actor.phase;

  if (rig.sadGroup) rig.sadGroup.visible = false;
  if (rig.injuryArmBandage) rig.injuryArmBandage.visible = false;
  if (rig.sparkleGroup) rig.sparkleGroup.visible = heroNear || isGreeting;

  const breath = Math.sin(t * 2.8);
  const sy = 1 + breath * 0.036;
  const sXZ = 1 / Math.sqrt(sy);
  rig.bodyPivot.scale.set(sXZ, sy, sXZ);

  if (rig.leftLeg && rig.rightLeg) {
    if (moving) {
      const legSwing = Math.sin(t * 8.2) * 0.46;
      rig.leftLeg.rotation.x = legSwing;
      rig.rightLeg.rotation.x = -legSwing;
    } else {
      rig.leftLeg.rotation.x = 0;
      rig.rightLeg.rotation.x = 0;
    }
  }

  if (rig.headGroup) {
    if ((heroNear || isGreeting) && !moving) {
      rig.headGroup.rotation.y = Math.sin(t * 2.8) * 0.16;
      rig.headGroup.rotation.x = -0.06 + Math.sin(t * 4.6) * 0.04;
    } else {
      rig.headGroup.rotation.y = Math.sin(t * 1.6) * 0.18;
      rig.headGroup.rotation.x =
        !moving && (actor.activity === 'water_plants' || actor.activity === 'irrigate' || actor.activity === 'compost_soil')
          ? 0.14 + Math.sin(t * 3.1) * 0.06
          : 0;
    }
  }

  if (!rig.leftArm || !rig.rightArm) return;

  if ((heroNear || isGreeting) && !moving) {
    // Cheerful friendly wave to hero
    rig.rightArm.rotation.x = -2.08 + Math.sin(t * 10.2) * 0.36;
    rig.rightArm.rotation.z = -0.2;
    rig.leftArm.rotation.x = isGreeting ? -0.35 + Math.cos(t * 5.0) * 0.12 : -0.22;
    rig.leftArm.rotation.z = isGreeting ? 0.1 : 0;
    rig.bodyPivot.rotation.x = 0;
    return;
  }

  if (actor.activity === 'carry_crate') {
    rig.leftArm.rotation.x = -1.05;
    rig.rightArm.rotation.x = -1.05;
    rig.leftArm.rotation.z = -0.18;
    rig.rightArm.rotation.z = 0.18;
    rig.bodyPivot.rotation.x = 0.06;
    return;
  }

  if (moving) {
    const armSwing = Math.sin(t * 8.2) * 0.44;
    rig.leftArm.rotation.x = armSwing;
    rig.rightArm.rotation.x = actor.activity === 'sweep_bridge' ? -0.55 + Math.sin(t * 4.5) * 0.25 : -armSwing;
    rig.leftArm.rotation.z = 0;
    rig.rightArm.rotation.z = 0;
    rig.bodyPivot.rotation.x = 0;
    return;
  }

  // Activity-specific stationary gotong-royong poses
  switch (actor.activity) {
    case 'irrigate':
    case 'compost_soil': {
      const chop = Math.sin(t * 3.4);
      rig.rightArm.rotation.x = -0.85 + chop * 0.42;
      rig.leftArm.rotation.x = -0.55 + chop * 0.24;
      rig.bodyPivot.rotation.x = 0.1 + Math.max(0, chop) * 0.06;
      break;
    }
    case 'water_plants':
    case 'tend_river': {
      rig.rightArm.rotation.x = -0.92 + Math.sin(t * 2.8) * 0.22;
      rig.leftArm.rotation.x = -0.25;
      rig.bodyPivot.rotation.x = 0.08;
      break;
    }
    case 'fetch_water': {
      const pull = Math.sin(t * 3.6);
      rig.rightArm.rotation.x = -1.1 + pull * 0.45;
      rig.leftArm.rotation.x = -1.1 - pull * 0.45;
      rig.bodyPivot.rotation.x = 0.06;
      break;
    }
    case 'cook_share': {
      rig.rightArm.rotation.x = -0.95 + Math.sin(t * 4.2) * 0.18;
      rig.rightArm.rotation.z = Math.cos(t * 4.2) * 0.22;
      rig.leftArm.rotation.x = -0.4;
      rig.bodyPivot.rotation.x = 0.04;
      break;
    }
    case 'sweep_bridge': {
      rig.rightArm.rotation.x = -0.75;
      rig.rightArm.rotation.z = Math.sin(t * 4.5) * 0.34;
      rig.leftArm.rotation.x = -0.55;
      rig.bodyPivot.rotation.x = 0.08;
      break;
    }
    case 'repair_lantern': {
      rig.rightArm.rotation.x = -1.55 + Math.sin(t * 3.2) * 0.18;
      rig.leftArm.rotation.x = -0.35;
      rig.bodyPivot.rotation.x = 0;
      break;
    }
    case 'teach_read': {
      rig.rightArm.rotation.x = -1.15 + Math.sin(t * 3.8) * 0.18;
      rig.leftArm.rotation.x = -0.65 + Math.cos(t * 2.5) * 0.14;
      rig.bodyPivot.rotation.x = 0;
      break;
    }
    case 'play_kids': {
      rig.rightArm.rotation.x = -1.75 + Math.sin(t * 8.5) * 0.4;
      rig.leftArm.rotation.x = -1.75 - Math.sin(t * 8.5) * 0.4;
      rig.bodyPivot.rotation.x = 0;
      break;
    }
    default: {
      rig.rightArm.rotation.x = -1.6 + Math.sin(t * 3.6) * 0.28;
      rig.leftArm.rotation.x = -0.25;
      rig.bodyPivot.rotation.x = 0;
      break;
    }
  }
}

export function updateDesaCaveLivingWorld(
  state: DesaCaveLivingWorldState,
  dt: number,
  elapsed: number,
  heroX: number,
  heroZ: number,
  lowEndMode: boolean,
  heroFullyLiberated = false,
): void {
  state.greetChimeRequested = false;

  if (state.waterwheel) {
    state.waterwheel.rotation.z -= dt * 1.45;
  }

  const maxBoneAnimDistSq = lowEndMode ? 24 * 24 : 46 * 46;

  for (let i = 0; i < state.actors.length; i++) {
    const a = state.actors[i];
    if (a.greetTimer > 0) {
      a.greetTimer = Math.max(0, a.greetTimer - dt);
    }
    if (a.greetCooldown > 0) {
      a.greetCooldown = Math.max(0, a.greetCooldown - dt);
    }

    if (a.transitHideTimer > 0) {
      a.transitHideTimer = Math.max(0, a.transitHideTimer - dt);
      if (a.transitHideTimer === 0) {
        a.mesh.visible = true;
        a.wpIdx = 0;
      } else {
        a.mesh.visible = false;
        a.wasHeroNear = false;
        continue;
      }
    }

    const dxHero = heroX - a.x;
    const dzHero = heroZ - a.z;
    const heroDistSq = dxHero * dxHero + dzHero * dzHero;
    const heroNear = heroDistSq < 4.5 * 4.5;
    if (heroDistSq > 7.4 * 7.4 && a.greetCooldown > 0.75) {
      // Leaving range lets returning players always receive another warm greeting
      a.greetCooldown = 0.75;
    }

    if (heroFullyLiberated && heroNear) {
      if ((!a.wasHeroNear && a.greetCooldown <= 0) || (a.greetTimer <= 0 && a.greetCooldown <= 0)) {
        a.greetTimer = 3.8;
        a.greetCooldown = 8.5;
        a.greetVariant = (a.greetVariant + 1) % a.admireLines.length;
        state.greetChimeRequested = true;
      }
    }
    a.wasHeroNear = heroNear;

    let isMoving = false;
    const isGreetingStop = heroNear || (heroFullyLiberated && a.greetTimer > 1.8);

    if (isGreetingStop) {
      const targetYaw = Math.atan2(dxHero, dzHero);
      let diff = targetYaw - a.yaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      a.yaw += diff * (1 - Math.exp(-10 * dt));
    } else if (a.pauseTimer > 0) {
      a.pauseTimer -= dt;
    } else if (a.waypoints.length > 1) {
      const wp = a.waypoints[a.wpIdx];
      _citizenTargetPos.x = wp[0];
      _citizenTargetPos.z = wp[1];
      const dx = _citizenTargetPos.x - a.x;
      const dz = _citizenTargetPos.z - a.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.35) {
        if (a.gateTransit && a.wpIdx === a.waypoints.length - 1) {
          // Simulates stepping briefly through the open Front Door toward outside village & back!
          a.transitHideTimer = 3.2;
          a.mesh.visible = false;
          continue;
        }
        a.wpIdx = (a.wpIdx + 1) % a.waypoints.length;
        a.pauseTimer = a.activity === 'play_kids' ? 0.65 : 2.2 + (i % 3) * 0.9;
      } else {
        isMoving = true;
        const step = Math.min(dist, a.speed * dt);
        a.x += (dx / dist) * step;
        a.z += (dz / dist) * step;
        const targetYaw = Math.atan2(dx, dz);
        let diff = targetYaw - a.yaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        a.yaw += diff * (1 - Math.exp(-9 * dt));
      }
    }

    const supY = sampleDesaCaveGroundY(a.x, a.z, a.y + 0.7);
    a.y = THREE.MathUtils.lerp(a.y, supY, 1 - Math.exp(-12 * dt));
    const isGreeting = heroFullyLiberated && a.greetTimer > 0;
    const hop =
      isMoving || a.activity === 'play_kids'
        ? Math.abs(Math.sin(elapsed * (a.activity === 'play_kids' ? 9.5 : 8.2) + a.phase)) * 0.08
        : isGreeting && heroNear
        ? Math.abs(Math.sin(elapsed * 5.2 + a.phase)) * 0.065
        : 0;
    a.mesh.position.set(a.x, a.y + hop, a.z);
    a.mesh.rotation.y = a.yaw;

    if (!lowEndMode || heroDistSq <= maxBoneAnimDistSq) {
      animateCaveCitizenPose(a, elapsed, isMoving, heroNear, isGreeting);
    }
  }
}
