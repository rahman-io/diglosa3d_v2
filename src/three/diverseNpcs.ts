import * as THREE from 'three';
import { MaterialPalette } from './materials';

export type NpcArchetypeId =
  | 'village_kid'
  | 'schoolgirl'
  | 'farmer_boy'
  | 'florist_girl'
  | 'street_vendor'
  | 'pastry_chef'
  | 'zoo_keeper'
  | 'ranger_guide'
  | 'school_teacher'
  | 'city_policeman'
  | 'bus_driver'
  | 'spice_merchant'
  | 'blacksmith'
  | 'clockmaker'
  | 'village_elder'
  | 'grandma_herbalist'
  | 'crystal_scholar'
  | 'mine_engineer'
  | 'temple_guardian'
  | 'ielts_dean'
  | 'night_watchman'
  | 'night_chef'
  | 'night_ranger'
  | 'night_officer'
  | 'night_astronomer'
  | 'night_scholar';

export type NpcAgeGroup = 'child' | 'youth' | 'adult' | 'elderly';
export type NpcGender = 'male' | 'female';

export interface NpcArchetypeSpec {
  id: NpcArchetypeId;
  sheetNumber: number;
  sheetTitle: string;
  displayNameId: string;
  ageGroup: NpcAgeGroup;
  ageLabelId: string;
  gender: NpcGender;
  genderLabelId: string;
  hijab: boolean;
  professionId: string;
  habitId: string;
  skillId: string;
  socialMessageId: string;
  stats: { hp: number; atk: number; nrg: number };
  scaleY: number;
  scaleXZ: number;
  skinHex: number;
  hairHex: number;
  shirtHex: number;
  pantsHex: number;
  shoeHex: number;
  accentHex: number;
  baseRightArmX: number;
  baseLeftArmX: number;
  baseRightArmZ?: number;
  baseLeftArmZ?: number;
}

export const NPC_ARCHETYPES: Record<NpcArchetypeId, NpcArchetypeSpec> = {
  village_kid: {
    id: 'village_kid',
    sheetNumber: 1,
    sheetTitle: 'VILLAGE KID',
    displayNameId: 'Bocah Desa',
    ageGroup: 'child',
    ageLabelId: 'Anak-anak',
    gender: 'male',
    genderLabelId: 'Laki-laki',
    hijab: false,
    professionId: 'Penjelajah Cilik Desa',
    habitId: 'Bermain riang & menyapa warga di sekitar sumur desa',
    skillId: 'Berlari lincah & menghafal sapaan',
    socialMessageId:
      'Bocah Desa (Anak-anak · Laki-laki) berkata, "Hei Kak {player}! Aku suka main dekat sumur desa sambil belajar Good morning!"',
    stats: { hp: 60, atk: 5, nrg: 100 },
    scaleY: 0.77,
    scaleXZ: 0.79,
    skinHex: 0xf6c69c,
    hairHex: 0x3b2314,
    shirtHex: 0xdc2626,
    pantsHex: 0x2563eb,
    shoeHex: 0x1e293b,
    accentHex: 0xef4444,
    baseRightArmX: -0.18,
    baseLeftArmX: 0.14,
  },
  schoolgirl: {
    id: 'schoolgirl',
    sheetNumber: 2,
    sheetTitle: 'SCHOOLGIRL',
    displayNameId: 'Siswi Sekolah',
    ageGroup: 'child',
    ageLabelId: 'Anak-anak',
    gender: 'female',
    genderLabelId: 'Perempuan',
    hijab: true,
    professionId: 'Pelajar Dasar Kerajaan',
    habitId: 'Berangkat belajar dengan tas ransel biru & menyapa ramah',
    skillId: 'Membaca cepat & menulis rapi',
    socialMessageId:
      'Siswi Sekolah (Anak-anak · Perempuan Berhijab) berkata, "Pagi! Tasku penuh buku kata baru. Ayo belajar bersama sebelum bel masuk!"',
    stats: { hp: 55, atk: 3, nrg: 110 },
    scaleY: 0.76,
    scaleXZ: 0.77,
    skinHex: 0xfad2ae,
    hairHex: 0xec4899,
    shirtHex: 0xf8fafc,
    pantsHex: 0xb91c1c,
    shoeHex: 0x1e293b,
    accentHex: 0x38bdf8,
    baseRightArmX: -0.12,
    baseLeftArmX: -0.16,
  },
  farmer_boy: {
    id: 'farmer_boy',
    sheetNumber: 3,
    sheetTitle: 'FARMER BOY',
    displayNameId: 'Pemuda Tani',
    ageGroup: 'youth',
    ageLabelId: 'Muda',
    gender: 'male',
    genderLabelId: 'Laki-laki',
    hijab: false,
    professionId: 'Petani Gandum Desa Sapaan',
    habitId: 'Mencangkul bedengan gandum & merawat irigasi ladang',
    skillId: 'Bertani & memanen hasil bumi',
    socialMessageId:
      'Pemuda Tani (Muda · Laki-laki) berkata, "Topi jeramiku siap di ladang! Panen gandum tahun ini subur berkat air sumur desa."',
    stats: { hp: 110, atk: 15, nrg: 130 },
    scaleY: 0.94,
    scaleXZ: 0.94,
    skinHex: 0xf3bf92,
    hairHex: 0x5c3a1e,
    shirtHex: 0x60a5fa,
    pantsHex: 0x2563eb,
    shoeHex: 0x451a03,
    accentHex: 0xeab308,
    baseRightArmX: -0.58,
    baseLeftArmX: -0.25,
  },
  florist_girl: {
    id: 'florist_girl',
    sheetNumber: 4,
    sheetTitle: 'FLORIST GIRL',
    displayNameId: 'Gadis Floris',
    ageGroup: 'youth',
    ageLabelId: 'Muda',
    gender: 'female',
    genderLabelId: 'Perempuan',
    hijab: false,
    professionId: 'Perangkai Bunga Taman',
    habitId: 'Merawat bunga warna-warni & membawa keranjang buket segar',
    skillId: 'Botani taman & merangkai bunga',
    socialMessageId:
      'Gadis Floris (Muda · Perempuan Non-Hijab) berkata, "Lihat keranjang bungaku! Lebah desa suka sekali menghampiri kelopak bunga segar."',
    stats: { hp: 95, atk: 8, nrg: 120 },
    scaleY: 0.92,
    scaleXZ: 0.9,
    skinHex: 0xfad2ae,
    hairHex: 0x6b3a1e,
    shirtHex: 0xfef3c7,
    pantsHex: 0x16a34a,
    shoeHex: 0x5c3a1e,
    accentHex: 0xf43f5e,
    baseRightArmX: -0.78,
    baseLeftArmX: -0.78,
    baseRightArmZ: -0.22,
    baseLeftArmZ: 0.22,
  },
  street_vendor: {
    id: 'street_vendor',
    sheetNumber: 5,
    sheetTitle: 'STREET VENDOR',
    displayNameId: 'Pedagang Sate',
    ageGroup: 'youth',
    ageLabelId: 'Muda',
    gender: 'male',
    genderLabelId: 'Laki-laki',
    hijab: false,
    professionId: 'Penjual Kuliner Kaki Lima',
    habitId: 'Memanggang tusuk sate panas & melayani pembeli pasar',
    skillId: 'Memasak cepat & berdagang ramah',
    socialMessageId:
      'Pedagang Sate (Muda · Laki-laki) berkata, "Sate hangat baru matang di Pasar Rasa! Kalau butuh tenaga berpetualang, mampir ya!"',
    stats: { hp: 120, atk: 12, nrg: 140 },
    scaleY: 0.95,
    scaleXZ: 0.96,
    skinHex: 0xd99b6c,
    hairHex: 0x1c1917,
    shirtHex: 0xc2410c,
    pantsHex: 0x475569,
    shoeHex: 0x451a03,
    accentHex: 0xf8fafc,
    baseRightArmX: -0.72,
    baseLeftArmX: -0.22,
  },
  pastry_chef: {
    id: 'pastry_chef',
    sheetNumber: 6,
    sheetTitle: 'PASTRY CHEF',
    displayNameId: 'Koki Mimi',
    ageGroup: 'youth',
    ageLabelId: 'Muda',
    gender: 'female',
    genderLabelId: 'Perempuan',
    hijab: true,
    professionId: 'Juru Masak Kue Pasar Rasa',
    habitId: 'Memanggang roti & menyajikan nampan kue keemasan',
    skillId: 'Seni pastri & resep kerajaan',
    socialMessageId:
      'Koki Mimi (Muda · Perempuan Berhijab) berkata, "Nampan roti croissant hangat siap! Ayo pulihkan buku resep Pasar Rasa!"',
    stats: { hp: 100, atk: 10, nrg: 130 },
    scaleY: 0.94,
    scaleXZ: 0.92,
    skinHex: 0xf7caa2,
    hairHex: 0xfda4af,
    shirtHex: 0x0f766e,
    pantsHex: 0x334155,
    shoeHex: 0x1e293b,
    accentHex: 0xf43f5e,
    baseRightArmX: -0.82,
    baseLeftArmX: -0.82,
    baseRightArmZ: -0.18,
    baseLeftArmZ: 0.18,
  },
  zoo_keeper: {
    id: 'zoo_keeper',
    sheetNumber: 7,
    sheetTitle: 'ZOO KEEPER',
    displayNameId: 'Penjaga Satwa',
    ageGroup: 'adult',
    ageLabelId: 'Dewasa',
    gender: 'female',
    genderLabelId: 'Perempuan',
    hijab: false,
    professionId: 'Perawat Kebun Binatang',
    habitId: 'Mencatat kondisi jerapah, zebra & panda di papan catatan',
    skillId: 'Perawatan satwa & observasi lapangan',
    socialMessageId:
      'Penjaga Satwa (Dewasa · Perempuan Non-Hijab) berkata, "Daftar cek kandang lengkap! Jerapah, zebra, dan panda sehat berkat bantuanmu."',
    stats: { hp: 140, atk: 20, nrg: 150 },
    scaleY: 0.98,
    scaleXZ: 0.95,
    skinHex: 0xf6c9a0,
    hairHex: 0x3b2314,
    shirtHex: 0xd6b88d,
    pantsHex: 0xa88b63,
    shoeHex: 0x5c3a1e,
    accentHex: 0x78350f,
    baseRightArmX: -0.58,
    baseLeftArmX: -0.78,
  },
  ranger_guide: {
    id: 'ranger_guide',
    sheetNumber: 8,
    sheetTitle: 'RANGER GUIDE',
    displayNameId: 'Ranger Rimba',
    ageGroup: 'adult',
    ageLabelId: 'Dewasa',
    gender: 'male',
    genderLabelId: 'Laki-laki',
    hijab: false,
    professionId: 'Pemandu Rimba & Pelindung Hutan',
    habitId: 'Meneropong jalur hutan dengan ransel ekspedisi lengkap',
    skillId: 'Navigasi hutan & pelestarian satwa',
    socialMessageId:
      'Ranger Rimba (Dewasa · Laki-laki) berkata, "Teropongku selalu mengawasi Hutan Satwa! Mari jaga keseimbangan alam rimba."',
    stats: { hp: 150, atk: 25, nrg: 160 },
    scaleY: 1.0,
    scaleXZ: 1.0,
    skinHex: 0xf3bf92,
    hairHex: 0x4a2e16,
    shirtHex: 0x4d7c0f,
    pantsHex: 0xb08d57,
    shoeHex: 0x451a03,
    accentHex: 0xa16207,
    baseRightArmX: -0.72,
    baseLeftArmX: -0.72,
    baseRightArmZ: -0.25,
    baseLeftArmZ: 0.25,
  },
  school_teacher: {
    id: 'school_teacher',
    sheetNumber: 9,
    sheetTitle: 'SCHOOL TEACHER',
    displayNameId: 'Ibu Guru Kota',
    ageGroup: 'adult',
    ageLabelId: 'Dewasa',
    gender: 'female',
    genderLabelId: 'Perempuan',
    hijab: true,
    professionId: 'Pengajar Sekolah Gerbang Kota',
    habitId: 'Membawa buku pelajaran & membimbing siswa di halaman sekolah',
    skillId: 'Pedagogi bahasa & literasi kota',
    socialMessageId:
      'Ibu Guru (Dewasa · Perempuan Berhijab) berkata, "Selamat datang di depan Sekolah Bata Merah! Rajinlah berlatih kosa kata setiap hari."',
    stats: { hp: 130, atk: 15, nrg: 170 },
    scaleY: 0.97,
    scaleXZ: 0.94,
    skinHex: 0xf7caa2,
    hairHex: 0x1e3a8a,
    shirtHex: 0x1e293b,
    pantsHex: 0x0f172a,
    shoeHex: 0x1e293b,
    accentHex: 0xea580c,
    baseRightArmX: -0.15,
    baseLeftArmX: -0.68,
    baseLeftArmZ: 0.14,
  },
  city_policeman: {
    id: 'city_policeman',
    sheetNumber: 10,
    sheetTitle: 'CITY POLICEMAN',
    displayNameId: 'Polisi Gerbang Kota',
    ageGroup: 'adult',
    ageLabelId: 'Dewasa',
    gender: 'male',
    genderLabelId: 'Laki-laki',
    hijab: false,
    professionId: 'Petugas Keamanan & Lalu Lintas Kota',
    habitId: 'Mengatur lalu lintas jalan raya & menjaga ketertiban gerbang',
    skillId: 'Disiplin lalu lintas & investigasi',
    socialMessageId:
      'Pak Polisi (Dewasa · Laki-laki) berkata, "Pos Gerbang Kota selalu sigap! Patuhi rambu lalu lintas dan jaga keamanan warga."',
    stats: { hp: 180, atk: 35, nrg: 150 },
    scaleY: 1.02,
    scaleXZ: 1.02,
    skinHex: 0xf3bf92,
    hairHex: 0x292524,
    shirtHex: 0x38bdf8,
    pantsHex: 0x1e3a8a,
    shoeHex: 0x0f172a,
    accentHex: 0xfacc15,
    baseRightArmX: -0.82,
    baseLeftArmX: -0.35,
  },
  bus_driver: {
    id: 'bus_driver',
    sheetNumber: 11,
    sheetTitle: 'BUS DRIVER',
    displayNameId: 'Sopir Bus Kota',
    ageGroup: 'adult',
    ageLabelId: 'Dewasa',
    gender: 'male',
    genderLabelId: 'Laki-laki',
    hijab: false,
    professionId: 'Pengemudi Transportasi Antar-Distrik',
    habitId: 'Memegang kemudi & memantau jalur jalan raya Gerbang Kota',
    skillId: 'Navigasi rute kota & ketepatan waktu',
    socialMessageId:
      'Sopir Bus (Dewasa · Laki-laki) berkata, "Semua penumpang aman menuju sekolah dan pasar! Pastikan tahu nama tempat dalam Bahasa Inggris!"',
    stats: { hp: 160, atk: 18, nrg: 160 },
    scaleY: 1.0,
    scaleXZ: 1.0,
    skinHex: 0xf1bc8d,
    hairHex: 0x3b2314,
    shirtHex: 0xf8fafc,
    pantsHex: 0x334155,
    shoeHex: 0x0f172a,
    accentHex: 0x1e3a8a,
    baseRightArmX: -0.86,
    baseLeftArmX: -0.86,
    baseRightArmZ: -0.22,
    baseLeftArmZ: 0.22,
  },
  spice_merchant: {
    id: 'spice_merchant',
    sheetNumber: 12,
    sheetTitle: 'SPICE MERCHANT',
    displayNameId: 'Pedagang Rempah',
    ageGroup: 'adult',
    ageLabelId: 'Dewasa',
    gender: 'female',
    genderLabelId: 'Perempuan',
    hijab: true,
    professionId: 'Saudagar Rempah Pasar Rasa',
    habitId: 'Menakar kunyit, cabai & rempah harum di lapak pasar',
    skillId: 'Meracik bumbu & niaga rempah',
    socialMessageId:
      'Pedagang Rempah (Dewasa · Perempuan Berhijab) berkata, "Aroma kunyit dan kayu manis asli Pasar Rasa! Bahan dapur terbaik ada di sini."',
    stats: { hp: 130, atk: 12, nrg: 140 },
    scaleY: 0.98,
    scaleXZ: 0.96,
    skinHex: 0xe6a87c,
    hairHex: 0xc2410c,
    shirtHex: 0x0f766e,
    pantsHex: 0x7c2d12,
    shoeHex: 0x451a03,
    accentHex: 0xf97316,
    baseRightArmX: -0.64,
    baseLeftArmX: -0.74,
  },
  blacksmith: {
    id: 'blacksmith',
    sheetNumber: 13,
    sheetTitle: 'BLACKSMITH',
    displayNameId: 'Pandai Besi',
    ageGroup: 'adult',
    ageLabelId: 'Dewasa',
    gender: 'male',
    genderLabelId: 'Laki-laki',
    hijab: false,
    professionId: 'Empu Besi Citadel Hub',
    habitId: 'Menempa baja panas dengan palu berat di atas paron besi',
    skillId: 'Tempa senjata & perawatan perlengkapan',
    socialMessageId:
      'Pandai Besi (Dewasa · Laki-laki) berkata, "CLANG! Baja yang kuat ditempa berulang kali, sama seperti latihan kosakata setiap hari!"',
    stats: { hp: 200, atk: 45, nrg: 150 },
    scaleY: 1.03,
    scaleXZ: 1.09,
    skinHex: 0xebaf84,
    hairHex: 0x291a10,
    shirtHex: 0xe2e8f0,
    pantsHex: 0x334155,
    shoeHex: 0x292524,
    accentHex: 0x78350f,
    baseRightArmX: -0.76,
    baseLeftArmX: -0.18,
  },
  clockmaker: {
    id: 'clockmaker',
    sheetNumber: 14,
    sheetTitle: 'CLOCKMAKER',
    displayNameId: 'Pembuat Jam',
    ageGroup: 'elderly',
    ageLabelId: 'Tua',
    gender: 'male',
    genderLabelId: 'Laki-laki',
    hijab: false,
    professionId: 'Ahli Jam Menara Waktu',
    habitId: 'Menyetel arloji saku emas & menyinkronkan roda gigi raksasa',
    skillId: 'Mekanika waktu & presisi jam',
    socialMessageId:
      'Pembuat Jam (Lansia · Laki-laki) berkata, "Detik demi detik harus selaras! Ayo bantu hidupkan kembali roda waktu di Menara Jam!"',
    stats: { hp: 100, atk: 12, nrg: 130 },
    scaleY: 0.96,
    scaleXZ: 0.96,
    skinHex: 0xf7ceb0,
    hairHex: 0xe2e8f0,
    shirtHex: 0xf8fafc,
    pantsHex: 0x5c3a1e,
    shoeHex: 0x292524,
    accentHex: 0xb45309,
    baseRightArmX: -0.78,
    baseLeftArmX: -0.18,
  },
  village_elder: {
    id: 'village_elder',
    sheetNumber: 15,
    sheetTitle: 'VILLAGE ELDER',
    displayNameId: 'Kakek Sapa',
    ageGroup: 'elderly',
    ageLabelId: 'Tua',
    gender: 'male',
    genderLabelId: 'Laki-laki',
    hijab: false,
    professionId: 'Sesepuh Bijak Desa Sapaan',
    habitId: 'Bertumpu pada tongkat kayu & memberi nasihat kebajikan',
    skillId: 'Kebijaksanaan sejarah & sastra sapaan',
    socialMessageId:
      'Kakek Sapa (Lansia · Laki-laki) berkata, "Salam hangat, {player}! Kata sapaan yang tulus membuka setiap pintu persahabatan."',
    stats: { hp: 110, atk: 18, nrg: 140 },
    scaleY: 0.96,
    scaleXZ: 0.98,
    skinHex: 0xf7ceb0,
    hairHex: 0xf1f5f9,
    shirtHex: 0xf3ead8,
    pantsHex: 0xd6c7b0,
    shoeHex: 0x5c3a1e,
    accentHex: 0x78350f,
    baseRightArmX: -0.42,
    baseLeftArmX: 0.06,
  },
  grandma_herbalist: {
    id: 'grandma_herbalist',
    sheetNumber: 16,
    sheetTitle: 'GRANDMA HERBALIST',
    displayNameId: 'Nenek Herbal',
    ageGroup: 'elderly',
    ageLabelId: 'Tua',
    gender: 'female',
    genderLabelId: 'Perempuan',
    hijab: true,
    professionId: 'Peracik Ramuan Herbal Hutan',
    habitId: 'Menumbuk daun obat dengan lumpang batu di taman herbal',
    skillId: 'Pengobatan alami & tanaman berkhasiat',
    socialMessageId:
      'Nenek Herbal (Lansia · Perempuan Berhijab) berkata, "Tumbuk perlahan daun penyembuh ini... Jangan lupa jaga kesehatanmu selama bertarung, Nak."',
    stats: { hp: 90, atk: 10, nrg: 150 },
    scaleY: 0.93,
    scaleXZ: 0.95,
    skinHex: 0xf6c9a5,
    hairHex: 0x84a98c,
    shirtHex: 0xa855f7,
    pantsHex: 0x15803d,
    shoeHex: 0x334155,
    accentHex: 0xf8fafc,
    baseRightArmX: -0.78,
    baseLeftArmX: -0.72,
    baseRightArmZ: -0.18,
    baseLeftArmZ: 0.18,
  },
  crystal_scholar: {
    id: 'crystal_scholar',
    sheetNumber: 17,
    sheetTitle: 'CRYSTAL SCHOLAR',
    displayNameId: 'Nyonya Portal',
    ageGroup: 'adult',
    ageLabelId: 'Dewasa',
    gender: 'female',
    genderLabelId: 'Perempuan',
    hijab: true,
    professionId: 'Peneliti Kristal & Naskah Gua Portal',
    habitId: 'Membaca gulungan prasasti kuno di antara kristal bercahaya',
    skillId: 'Arkeologi kata tanya & energi kristal',
    socialMessageId:
      'Nyonya Portal (Dewasa · Perempuan Berhijab) berkata, "Prasasti Who, What, Where, When, Why menyimpan kunci energi kristal Gua Portal!"',
    stats: { hp: 150, atk: 30, nrg: 200 },
    scaleY: 0.98,
    scaleXZ: 0.95,
    skinHex: 0xf6caa2,
    hairHex: 0x6d28d9,
    shirtHex: 0x5b21b6,
    pantsHex: 0x3b0764,
    shoeHex: 0x1e1b4b,
    accentHex: 0xfacc15,
    baseRightArmX: -0.78,
    baseLeftArmX: -0.78,
    baseRightArmZ: -0.22,
    baseLeftArmZ: 0.22,
  },
  mine_engineer: {
    id: 'mine_engineer',
    sheetNumber: 18,
    sheetTitle: 'MINE ENGINEER',
    displayNameId: 'Insinyur Tambang',
    ageGroup: 'adult',
    ageLabelId: 'Dewasa',
    gender: 'male',
    genderLabelId: 'Laki-laki',
    hijab: false,
    professionId: 'Ahli Tambang Ngarai Kristal',
    habitId: 'Memikul beliung & memeriksa jalur rel lori tambang',
    skillId: 'Teknik tambang & keselamatan tebing',
    socialMessageId:
      'Insinyur Tambang (Dewasa · Laki-laki) berkata, "Helm pengaman nyala! Rel lori tambang di Gua Portal sudah kucek aman sampai puncak!"',
    stats: { hp: 170, atk: 35, nrg: 160 },
    scaleY: 1.01,
    scaleXZ: 1.03,
    skinHex: 0xe6a87c,
    hairHex: 0x3b2314,
    shirtHex: 0x2563eb,
    pantsHex: 0x1d4ed8,
    shoeHex: 0x451a03,
    accentHex: 0xf97316,
    baseRightArmX: -1.12,
    baseLeftArmX: -0.15,
  },
  temple_guardian: {
    id: 'temple_guardian',
    sheetNumber: 19,
    sheetTitle: 'TEMPLE GUARDIAN',
    displayNameId: 'Penjaga Kuil',
    ageGroup: 'elderly',
    ageLabelId: 'Tua',
    gender: 'male',
    genderLabelId: 'Laki-laki',
    hijab: false,
    professionId: 'Ksatria Veteran Citadel Reruntuhan',
    habitId: 'Berpatroli membawa lentera hangat menjaga reruntuhan kuno',
    skillId: 'Pertahanan benteng & strategi tempur',
    socialMessageId:
      'Penjaga Kuil (Lansia · Laki-laki) berkata, "Lentera kuil ini menerangi jalan antar enam pulau. Tetap waspada bila malam tiba!"',
    stats: { hp: 220, atk: 50, nrg: 180 },
    scaleY: 1.02,
    scaleXZ: 1.08,
    skinHex: 0xf5c8a4,
    hairHex: 0xe2e8f0,
    shirtHex: 0x94a3b8,
    pantsHex: 0x475569,
    shoeHex: 0x334155,
    accentHex: 0xdc2626,
    baseRightArmX: -0.78,
    baseLeftArmX: -0.14,
  },
  ielts_dean: {
    id: 'ielts_dean',
    sheetNumber: 20,
    sheetTitle: 'IELTS DEAN',
    displayNameId: 'Dekan Istana IELTS',
    ageGroup: 'elderly',
    ageLabelId: 'Tua',
    gender: 'female',
    genderLabelId: 'Perempuan',
    hijab: true,
    professionId: 'Dekan Agung Istana IELTS',
    habitId: 'Membawa gulungan ijazah resmi & mengevaluasi kecakapan bahasa',
    skillId: 'Akademik Listening, Reading, Writing & Speaking',
    socialMessageId:
      'Dekan IELTS (Lansia · Perempuan Berhijab) berkata, "Selamat datang, Cendekiawan! Kuasai seluruh kosakata enam pulau untuk ujian Istana IELTS!"',
    stats: { hp: 180, atk: 20, nrg: 220 },
    scaleY: 0.97,
    scaleXZ: 0.95,
    skinHex: 0xf7ceb0,
    hairHex: 0x1e293b,
    shirtHex: 0x1e3a8a,
    pantsHex: 0x0f172a,
    shoeHex: 0x0f172a,
    accentHex: 0xfacc15,
    baseRightArmX: -0.68,
    baseLeftArmX: -0.14,
  },
  night_watchman: {
    id: 'night_watchman',
    sheetNumber: 21,
    sheetTitle: 'NIGHT WATCHMAN',
    displayNameId: 'Ronda Bima',
    ageGroup: 'adult',
    ageLabelId: 'Dewasa',
    gender: 'male',
    genderLabelId: 'Laki-laki',
    hijab: false,
    professionId: 'Penjaga Malam Desa Sapaan',
    habitId: 'Berpatroli malam membawa lentera & kentongan kayu',
    skillId: 'Ronda malam & penjagaan pintu desa',
    socialMessageId:
      'Ronda Bima (Dewasa · Laki-laki) berkata, "Malam aman terkendali! Kakek Sapa sedang beristirahat, biar aku yang berjaga di pintu Desa Sapaan."',
    stats: { hp: 145, atk: 24, nrg: 155 },
    scaleY: 0.99,
    scaleXZ: 1.0,
    skinHex: 0xc98b5b,
    hairHex: 0x1e293b,
    shirtHex: 0x1e3a8a,
    pantsHex: 0x334155,
    shoeHex: 0x1e293b,
    accentHex: 0xfbbf24,
    baseRightArmX: -0.78,
    baseLeftArmX: -0.32,
  },
  night_chef: {
    id: 'night_chef',
    sheetNumber: 22,
    sheetTitle: 'NIGHT CHEF',
    displayNameId: 'Chef Bara',
    ageGroup: 'adult',
    ageLabelId: 'Dewasa',
    gender: 'male',
    genderLabelId: 'Laki-laki',
    hijab: false,
    professionId: 'Juru Masak Shift Malam Pasar Rasa',
    habitId: 'Menjaga tungku sup hangat agar tetap menyala sepanjang malam',
    skillId: 'Masak tungku arang & kaldu malam',
    socialMessageId:
      'Chef Bara (Dewasa · Laki-laki) berkata, "Tungku malam menyala! Koki Mimi lepas piket, aku yang menjaga pintu Pasar Rasa sampai pagi."',
    stats: { hp: 135, atk: 22, nrg: 145 },
    scaleY: 0.97,
    scaleXZ: 1.01,
    skinHex: 0xe3a87d,
    hairHex: 0x3b2314,
    shirtHex: 0x991b1b,
    pantsHex: 0x1f2937,
    shoeHex: 0x111827,
    accentHex: 0xfb923c,
    baseRightArmX: -0.72,
    baseLeftArmX: -0.68,
    baseRightArmZ: -0.15,
    baseLeftArmZ: 0.15,
  },
  night_ranger: {
    id: 'night_ranger',
    sheetNumber: 23,
    sheetTitle: 'NIGHT RANGER',
    displayNameId: 'Penjelajah Kirana',
    ageGroup: 'youth',
    ageLabelId: 'Muda',
    gender: 'female',
    genderLabelId: 'Perempuan',
    hijab: false,
    professionId: 'Pengintai Malam Hutan Satwa',
    habitId: 'Memakai kacamata penglihatan malam & membawa lentera zamrud',
    skillId: 'Pelacakan jejak malam & perlindungan satwa',
    socialMessageId:
      'Penjelajah Kirana (Muda · Perempuan Non-Hijab) berkata, "Kacamata malamku aktif! Aku menggantikan Ranger Rimba memantau jejak Kiki di Hutan Satwa."',
    stats: { hp: 140, atk: 28, nrg: 170 },
    scaleY: 0.94,
    scaleXZ: 0.91,
    skinHex: 0xf4c19a,
    hairHex: 0x7c2d12,
    shirtHex: 0x065f46,
    pantsHex: 0x1e293b,
    shoeHex: 0x3f2e21,
    accentHex: 0x34d399,
    baseRightArmX: -0.76,
    baseLeftArmX: -0.18,
  },
  night_officer: {
    id: 'night_officer',
    sheetNumber: 24,
    sheetTitle: 'NIGHT OFFICER',
    displayNameId: 'Inspektur Sinta',
    ageGroup: 'adult',
    ageLabelId: 'Dewasa',
    gender: 'female',
    genderLabelId: 'Perempuan',
    hijab: true,
    professionId: 'Komandan Patroli Malam Gerbang Kota',
    habitId: 'Mengatur lampu lalu lintas malam dengan tongkat sinyal biru',
    skillId: 'Patroli malam & keamanan kota',
    socialMessageId:
      'Inspektur Sinta (Dewasa · Perempuan Berhijab) berkata, "Piket malam dimulai! Pak Polisi Gerbang sedang lepas tugas, biar aku yang kawal Gerbang Kota."',
    stats: { hp: 185, atk: 34, nrg: 165 },
    scaleY: 0.96,
    scaleXZ: 0.93,
    skinHex: 0xf7cbb0,
    hairHex: 0x0f172a,
    shirtHex: 0x1e293b,
    pantsHex: 0x0f172a,
    shoeHex: 0x090d16,
    accentHex: 0x38bdf8,
    baseRightArmX: -0.82,
    baseLeftArmX: -0.22,
  },
  night_astronomer: {
    id: 'night_astronomer',
    sheetNumber: 25,
    sheetTitle: 'NIGHT ASTRONOMER',
    displayNameId: 'Astronom Astra',
    ageGroup: 'youth',
    ageLabelId: 'Muda',
    gender: 'female',
    genderLabelId: 'Perempuan',
    hijab: false,
    professionId: 'Penjaga Bintang Menara Waktu',
    habitId: 'Mengamati gerak bintang & menjaga roda menara tetap aman saat malam',
    skillId: 'Astronomi waktu & kalibrasi malam',
    socialMessageId:
      'Astronom Astra (Muda · Perempuan Non-Hijab) berkata, "Bintang malam membimbing waktu! Pembuat Jam istirahat dulu, sekarang giliranku menjaga Menara Waktu."',
    stats: { hp: 120, atk: 18, nrg: 185 },
    scaleY: 0.95,
    scaleXZ: 0.91,
    skinHex: 0xf9d5bc,
    hairHex: 0xcbd5e1,
    shirtHex: 0x312e81,
    pantsHex: 0x1e1b4b,
    shoeHex: 0x1e293b,
    accentHex: 0xa78bfa,
    baseRightArmX: -0.74,
    baseLeftArmX: -0.2,
  },
  night_scholar: {
    id: 'night_scholar',
    sheetNumber: 26,
    sheetTitle: 'NIGHT SCHOLAR',
    displayNameId: 'Arkeolog Orion',
    ageGroup: 'adult',
    ageLabelId: 'Dewasa',
    gender: 'male',
    genderLabelId: 'Laki-laki',
    hijab: false,
    professionId: 'Penjaga Malam Gua Portal',
    habitId: 'Meneliti resonansi kristal gua pada malam hari dengan orb bercahaya',
    skillId: 'Arkeologi kristal & kata tanya malam',
    socialMessageId:
      'Arkeolog Orion (Dewasa · Laki-laki) berkata, "Kristal gua bersinar terang malam ini! Aku menggantikan Nyonya Portal menjaga pintu Gua Portal."',
    stats: { hp: 165, atk: 32, nrg: 210 },
    scaleY: 1.0,
    scaleXZ: 0.99,
    skinHex: 0xd9a177,
    hairHex: 0x27272a,
    shirtHex: 0x115e59,
    pantsHex: 0x0f172a,
    shoeHex: 0x18181b,
    accentHex: 0xc084fc,
    baseRightArmX: -0.78,
    baseLeftArmX: -0.35,
  },
};

export const WORLD_CITIZEN_ARCHETYPES: NpcArchetypeId[] = [
  'village_kid',
  'schoolgirl',
  'farmer_boy',
  'florist_girl',
  'street_vendor',
  'zoo_keeper',
  'school_teacher',
  'bus_driver',
  'spice_merchant',
  'blacksmith',
  'grandma_herbalist',
  'mine_engineer',
  'temple_guardian',
  'ielts_dean',
];

export function resolveNpcArchetype(npcId: string): NpcArchetypeId {
  if (npcId in NPC_ARCHETYPES) return npcId as NpcArchetypeId;
  switch (npcId) {
    case 'npc_tetua':
      return 'village_elder';
    case 'npc_tetua_malam':
      return 'night_watchman';
    case 'npc_koki':
      return 'pastry_chef';
    case 'npc_koki_malam':
      return 'night_chef';
    case 'npc_rubah':
      return 'ranger_guide';
    case 'npc_rubah_malam':
      return 'night_ranger';
    case 'npc_penjaga':
      return 'city_policeman';
    case 'npc_penjaga_malam':
      return 'night_officer';
    case 'npc_penyihir':
      return 'clockmaker';
    case 'npc_penyihir_malam':
      return 'night_astronomer';
    case 'npc_portal':
      return 'crystal_scholar';
    case 'npc_portal_malam':
      return 'night_scholar';
    case 'npc_sera':
      return 'ielts_dean';
    case 'npc_ayu':
      return 'school_teacher';
    case 'npc_bima':
      return 'clockmaker';
    case 'npc_rangga':
      return 'ranger_guide';
    case 'npc_exit_academy':
      return 'temple_guardian';
    case 'npc_raja_penguji':
    case 'npc_raja':
      return 'temple_guardian';
    default:
      return 'village_elder';
  }
}

export interface DiverseNpcRigResult {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  upperBody: THREE.Group;
  headGroup: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  propSpin?: THREE.Object3D;
  baseRightArmX: number;
  baseLeftArmX: number;
  baseRightArmZ: number;
  baseLeftArmZ: number;
  baseScaleXZ: number;
  baseScaleY: number;
  archetype: NpcArchetypeId;
}

export interface NpcAppearanceVariant {
  skinHex?: number;
  hairHex?: number;
  shirtHex?: number;
  pantsHex?: number;
  shoeHex?: number;
  accentHex?: number;
}

export function buildDiverseNpcRig(
  archetypeId: NpcArchetypeId,
  palette: MaterialPalette,
  withContactShadow = true,
  variant?: NpcAppearanceVariant,
): DiverseNpcRigResult {
  const spec = NPC_ARCHETYPES[archetypeId];
  const root = new THREE.Group();

  if (withContactShadow) {
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.75 * spec.scaleXZ, 1.75 * spec.scaleXZ),
      palette.contactShadowMat,
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.03;
    root.add(shadow);
  }

  const bodyPivot = new THREE.Group();
  bodyPivot.scale.set(spec.scaleXZ, spec.scaleY, spec.scaleXZ);
  root.add(bodyPivot);

  const skinHex = variant?.skinHex ?? spec.skinHex;
  const hairHex = variant?.hairHex ?? spec.hairHex;
  const shirtHex = variant?.shirtHex ?? spec.shirtHex;
  const pantsHex = variant?.pantsHex ?? spec.pantsHex;
  const shoeHex = variant?.shoeHex ?? spec.shoeHex;
  const accentHex = variant?.accentHex ?? spec.accentHex;

  const skinMat = palette.getMat(skinHex, 'matte');
  const hairMat = palette.getMat(hairHex, 'matte');
  const shirtMat = palette.getMat(shirtHex, archetypeId === 'temple_guardian' ? 'metal' : 'matte');
  const pantsMat = palette.getMat(pantsHex, 'matte');
  const shoeMat = palette.getMat(shoeHex, 'matte');
  const accentMat = palette.getMat(
    accentHex,
    archetypeId === 'clockmaker' ||
      archetypeId === 'crystal_scholar' ||
      archetypeId === 'ielts_dean' ||
      archetypeId === 'city_policeman'
      ? 'metal'
      : 'matte',
  );
  const eyeMat = palette.getMat(0x0f172a, 'gloss');
  const whiteMat = palette.getMat(0xf8fafc, 'matte');
  const woodMat = palette.getMat(0x78350f, 'matte');
  const ironMat = palette.getMat(0x94a3b8, 'metal');
  const darkMetalMat = palette.getMat(0x334155, 'metal');
  const goldMat = palette.getMat(0xfacc15, 'metal');

  const isBareCalves =
    archetypeId === 'village_kid' || archetypeId === 'zoo_keeper' || archetypeId === 'ranger_guide';
  const isSkirtOrRobe =
    archetypeId === 'schoolgirl' ||
    archetypeId === 'florist_girl' ||
    archetypeId === 'school_teacher' ||
    archetypeId === 'spice_merchant' ||
    archetypeId === 'village_elder' ||
    archetypeId === 'grandma_herbalist' ||
    archetypeId === 'crystal_scholar' ||
    archetypeId === 'ielts_dean' ||
    archetypeId === 'night_astronomer' ||
    archetypeId === 'night_scholar';

  // 1. Articulated Legs + Footwear
  const makeLeg = (lx: number): THREE.Group => {
    const leg = new THREE.Group();
    leg.position.set(lx, 0.9, 0);

    const upperLegMat = pantsMat;
    const lowerLegMat =
      archetypeId === 'schoolgirl'
        ? whiteMat
        : isBareCalves
        ? skinMat
        : pantsMat;

    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.36), upperLegMat);
    thigh.position.y = -0.19;
    thigh.castShadow = true;

    const calf = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.28, 0.32), lowerLegMat);
    calf.position.y = -0.49;
    calf.castShadow = true;

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.26, 0.44), shoeMat);
    shoe.position.set(0, -0.77, 0.04);
    shoe.castShadow = true;

    leg.add(thigh, calf, shoe);

    if (archetypeId === 'village_kid') {
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.37, 0.08, 0.45), whiteMat);
      sole.position.set(0, -0.86, 0.04);
      leg.add(sole);
    }
    return leg;
  };
  const leftLeg = makeLeg(-0.21);
  const rightLeg = makeLeg(0.21);
  bodyPivot.add(leftLeg, rightLeg);

  // Lower skirt / tunic hem for dresses, robes, aprons & long coats
  if (isSkirtOrRobe) {
    const hemColor =
      archetypeId === 'florist_girl' ||
      archetypeId === 'school_teacher' ||
      archetypeId === 'crystal_scholar' ||
      archetypeId === 'ielts_dean' ||
      archetypeId === 'village_elder' ||
      archetypeId === 'night_astronomer' ||
      archetypeId === 'night_scholar'
        ? shirtMat
        : pantsMat;
    const hemH = archetypeId === 'schoolgirl' ? 0.48 : 0.66;
    const skirtHem = new THREE.Mesh(new THREE.BoxGeometry(0.92, hemH, 0.62), hemColor);
    skirtHem.position.y = 0.72 + (0.66 - hemH) * 0.4;
    skirtHem.castShadow = true;
    bodyPivot.add(skirtHem);
  } else if (
    archetypeId === 'pastry_chef' ||
    archetypeId === 'street_vendor' ||
    archetypeId === 'blacksmith' ||
    archetypeId === 'temple_guardian' ||
    archetypeId === 'night_chef' ||
    archetypeId === 'night_officer'
  ) {
    const tunicHem = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.42, 0.62),
      shirtMat,
    );
    tunicHem.position.y = 0.82;
    tunicHem.castShadow = true;
    bodyPivot.add(tunicHem);
  }

  // 2. Upper Body & Outfit Layers
  const upperBody = new THREE.Group();
  upperBody.position.set(0, 0.96, 0);
  bodyPivot.add(upperBody);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.98, 0.58), shirtMat);
  torso.position.y = 0.5;
  torso.castShadow = true;
  upperBody.add(torso);

  // Outfit layering specific to each of the 20 characters
  if (archetypeId === 'schoolgirl') {
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.16, 0.61), whiteMat);
    collar.position.set(0, 0.9, 0.01);
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.76, 0.34), accentMat);
    backpack.position.set(0, 0.52, -0.44);
    backpack.castShadow = true;
    const packPocket = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.34, 0.12), palette.getMat(0x0284c7, 'matte'));
    packPocket.position.set(0, 0.34, -0.62);
    upperBody.add(collar, backpack, packPocket);
  } else if (archetypeId === 'farmer_boy' || archetypeId === 'mine_engineer') {
    const bibColor = archetypeId === 'farmer_boy' ? pantsMat : shirtMat;
    const bib = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.78, 0.62), bibColor);
    bib.position.set(0, 0.38, 0.01);
    const strapL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.62), bibColor);
    strapL.position.set(-0.26, 0.85, 0);
    const strapR = strapL.clone();
    strapR.position.x = 0.26;
    const btnL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.06), goldMat);
    btnL.position.set(-0.26, 0.72, 0.33);
    const btnR = btnL.clone();
    btnR.position.x = 0.26;
    upperBody.add(bib, strapL, strapR, btnL, btnR);
    if (archetypeId === 'mine_engineer') {
      const darkTee = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.3, 0.6), darkMetalMat);
      darkTee.position.set(0, 0.84, -0.01);
      upperBody.add(darkTee);
    }
  } else if (archetypeId === 'florist_girl') {
    const dress = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.82, 0.61), pantsMat);
    dress.position.set(0, 0.42, 0.01);
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.76, 0.08), whiteMat);
    apron.position.set(0, 0.28, 0.32);
    upperBody.add(dress, apron);
  } else if (archetypeId === 'street_vendor') {
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.92, 0.09), whiteMat);
    apron.position.set(0, 0.22, 0.32);
    const apronTie = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.1, 0.62), whiteMat);
    apronTie.position.y = 0.24;
    upperBody.add(apron, apronTie);
  } else if (archetypeId === 'pastry_chef') {
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.94, 0.09), accentMat);
    apron.position.set(0, 0.22, 0.32);
    const waistTie = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.1, 0.62), whiteMat);
    waistTie.position.y = 0.22;
    upperBody.add(apron, waistTie);
  } else if (archetypeId === 'zoo_keeper') {
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.61), shirtMat);
    collar.position.set(0, 0.91, 0.01);
    const pocketL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.06), accentMat);
    pocketL.position.set(-0.24, 0.56, 0.31);
    const pocketR = pocketL.clone();
    pocketR.position.x = 0.24;
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.13, 0.62), woodMat);
    belt.position.y = 0.14;
    upperBody.add(collar, pocketL, pocketR, belt);
  } else if (archetypeId === 'ranger_guide') {
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.14, 0.62), woodMat);
    belt.position.y = 0.12;
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.88, 0.44), palette.getMat(0xb08d57, 'matte'));
    pack.position.set(0, 0.52, -0.5);
    pack.castShadow = true;
    const bedroll = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.9, 8), palette.getMat(0x78350f, 'matte'));
    bedroll.rotation.z = Math.PI / 2;
    bedroll.position.set(0, 1.02, -0.5);
    upperBody.add(belt, pack, bedroll);
  } else if (archetypeId === 'school_teacher') {
    const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.72, 0.06), palette.getMat(0xfdba74, 'matte'));
    lapel.position.set(0, 0.56, 0.3);
    upperBody.add(lapel);
  } else if (archetypeId === 'city_policeman') {
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.58, 0.06), pantsMat);
    tie.position.set(0, 0.58, 0.3);
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.06), goldMat);
    badge.position.set(-0.24, 0.7, 0.3);
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.16, 0.63), darkMetalMat);
    belt.position.y = 0.12;
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.06), goldMat);
    buckle.position.set(0, 0.12, 0.33);
    const epL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.36), pantsMat);
    epL.position.set(-0.34, 1.01, 0);
    const epR = epL.clone();
    epR.position.x = 0.34;
    upperBody.add(tie, badge, belt, buckle, epL, epR);
  } else if (archetypeId === 'bus_driver') {
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.62, 0.06), accentMat);
    tie.position.set(0, 0.58, 0.3);
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.13, 0.62), darkMetalMat);
    belt.position.y = 0.1;
    const epL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.34), accentMat);
    epL.position.set(-0.35, 1.01, 0);
    const epR = epL.clone();
    epR.position.x = 0.35;
    upperBody.add(tie, belt, epL, epR);
  } else if (archetypeId === 'spice_merchant') {
    const shawl = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.54, 0.63), accentMat);
    shawl.position.set(0, 0.62, 0.01);
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.16, 0.64), goldMat);
    sash.position.y = 0.14;
    upperBody.add(shawl, sash);
  } else if (archetypeId === 'blacksmith') {
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.84, 1.08, 0.12), accentMat);
    apron.position.set(0, 0.24, 0.31);
    const strapL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.62), accentMat);
    strapL.position.set(-0.26, 0.86, 0);
    const strapR = strapL.clone();
    strapR.position.x = 0.26;
    upperBody.add(apron, strapL, strapR);
  } else if (archetypeId === 'clockmaker') {
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.84, 0.61), accentMat);
    vest.position.set(0, 0.42, 0.01);
    const shirtV = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.48, 0.06), whiteMat);
    shirtV.position.set(0, 0.74, 0.31);
    const chain = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.05), goldMat);
    chain.position.set(0.14, 0.36, 0.32);
    upperBody.add(vest, shirtV, chain);
  } else if (archetypeId === 'village_elder') {
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.16, 0.63), woodMat);
    sash.position.y = 0.16;
    upperBody.add(sash);
  } else if (archetypeId === 'grandma_herbalist') {
    const cardigan = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.72, 0.61), shirtMat);
    cardigan.position.set(0, 0.58, 0);
    const dressFront = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.84, 0.06), pantsMat);
    dressFront.position.set(0, 0.48, 0.29);
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.74, 0.08), whiteMat);
    apron.position.set(0, 0.16, 0.33);
    upperBody.add(cardigan, dressFront, apron);
  } else if (archetypeId === 'crystal_scholar') {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.16, 0.63), goldMat);
    trim.position.y = 0.14;
    const vTrim = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.72, 0.06), goldMat);
    vTrim.position.set(0, 0.56, 0.31);
    upperBody.add(trim, vTrim);
  } else if (archetypeId === 'temple_guardian') {
    const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.62), goldMat);
    pauldronL.position.set(-0.52, 0.96, 0);
    const pauldronR = pauldronL.clone();
    pauldronR.position.x = 0.52;
    const chestGold = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.42, 0.08), goldMat);
    chestGold.position.set(0, 0.62, 0.3);
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.2, 0.64), accentMat);
    sash.position.y = 0.14;
    upperBody.add(pauldronL, pauldronR, chestGold, sash);
  } else if (archetypeId === 'ielts_dean') {
    const trimL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.86, 0.06), goldMat);
    trimL.position.set(-0.18, 0.52, 0.3);
    const trimR = trimL.clone();
    trimR.position.x = 0.18;
    const innerShirt = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.52, 0.05), whiteMat);
    innerShirt.position.set(0, 0.7, 0.29);
    upperBody.add(trimL, trimR, innerShirt);
  } else if (archetypeId === 'night_watchman') {
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.74, 0.62), palette.getMat(0x0f172a, 'matte'));
    vest.position.set(0, 0.56, 0.01);
    const reflFront = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.14, 0.64), palette.getMat(0xfacc15, 'emissive'));
    reflFront.position.y = 0.34;
    const scarf = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.16, 0.62), accentMat);
    scarf.position.set(0, 0.92, 0.01);
    upperBody.add(vest, reflFront, scarf);
  } else if (archetypeId === 'night_chef') {
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.94, 0.09), palette.getMat(0x1e293b, 'matte'));
    apron.position.set(0, 0.24, 0.32);
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.14, 0.61), accentMat);
    collar.position.set(0, 0.89, 0.01);
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.12, 0.63), accentMat);
    sash.position.y = 0.22;
    upperBody.add(apron, collar, sash);
  } else if (archetypeId === 'night_ranger') {
    const poncho = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.62, 0.66), palette.getMat(0x064e3b, 'matte'));
    poncho.position.set(0, 0.66, 0.01);
    const leafClasp = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.08), palette.getMat(0x34d399, 'emissive'));
    leafClasp.position.set(0, 0.84, 0.34);
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.82, 0.36), woodMat);
    pack.position.set(0, 0.52, -0.44);
    upperBody.add(poncho, leafClasp, pack);
  } else if (archetypeId === 'night_officer') {
    const reflSash = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.16, 0.64), palette.getMat(0x38bdf8, 'emissive'));
    reflSash.position.y = 0.32;
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.06), goldMat);
    badge.position.set(-0.24, 0.72, 0.31);
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.56, 0.06), accentMat);
    tie.position.set(0, 0.6, 0.31);
    upperBody.add(reflSash, badge, tie);
  } else if (archetypeId === 'night_astronomer') {
    const cape = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.86, 0.22), palette.getMat(0x1e1b4b, 'matte'));
    cape.position.set(0, 0.45, -0.34);
    const starChest = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), palette.getMat(0xfde047, 'emissive'));
    starChest.position.set(0, 0.68, 0.33);
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.14, 0.62), goldMat);
    belt.position.y = 0.18;
    upperBody.add(cape, starChest, belt);
  } else if (archetypeId === 'night_scholar') {
    const stole = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.88, 0.64), palette.getMat(0x581c87, 'matte'));
    stole.position.set(0, 0.54, 0.01);
    const crystalPin = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), palette.getMat(0xc084fc, 'emissive'));
    crystalPin.position.set(0, 0.8, 0.34);
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.14, 0.63), goldMat);
    belt.position.y = 0.16;
    upperBody.add(stole, crystalPin, belt);
  }

  // 3. Neck, Head, Face, Hair / Hijab & Headgear
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.04, 0);
  if (spec.ageGroup === 'child') {
    headGroup.scale.setScalar(1.12);
  }
  upperBody.add(headGroup);

  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.38), skinMat);
  neck.position.y = 0.04;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.8, 0.78), skinMat);
  head.position.y = 0.46;
  head.castShadow = true;

  const lEye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.06), eyeMat);
  lEye.position.set(-0.19, 0.46, 0.4);
  const rEye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.06), eyeMat);
  rEye.position.set(0.19, 0.46, 0.4);
  const browMat = palette.getMat(
    spec.ageGroup === 'elderly' ? 0xf1f5f9 : spec.hairHex,
    'matte',
  );
  const lBrow = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.055, 0.05), browMat);
  lBrow.position.set(-0.19, 0.58, 0.4);
  const rBrow = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.055, 0.05), browMat);
  rBrow.position.set(0.19, 0.58, 0.4);
  headGroup.add(neck, head, lEye, rEye, lBrow, rBrow);

  // Hijab wrap for the 7 hijabi characters (#2, #6, #9, #12, #16, #17, #20)
  if (spec.hijab) {
    const hCrown = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.24, 0.88), hairMat);
    hCrown.position.set(0, 0.84, -0.02);
    const hBack = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.88, 0.28), hairMat);
    hBack.position.set(0, 0.44, -0.34);
    const hSideL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.78, 0.68), hairMat);
    hSideL.position.set(-0.4, 0.44, 0.02);
    const hSideR = hSideL.clone();
    hSideR.position.x = 0.4;
    const hDrape = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.34, 0.62), hairMat);
    hDrape.position.set(0, 0.02, 0.02);
    headGroup.add(hCrown, hBack, hSideL, hSideR, hDrape);

    if (archetypeId === 'spice_merchant') {
      const tealTrim = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.1, 0.84), shirtMat);
      tealTrim.position.set(0, 0.74, 0.02);
      headGroup.add(tealTrim);
    } else if (archetypeId === 'crystal_scholar') {
      const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.09, 0.84), goldMat);
      goldTrim.position.set(0, 0.75, 0.02);
      headGroup.add(goldTrim);
    } else if (archetypeId === 'night_officer') {
      const cyanTrim = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.09, 0.84), palette.getMat(0x38bdf8, 'emissive'));
      cyanTrim.position.set(0, 0.75, 0.02);
      headGroup.add(cyanTrim);
    }
  } else if (archetypeId === 'florist_girl') {
    // Non-Hijab long chestnut hair flowing past shoulders
    const topHair = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.86), hairMat);
    topHair.position.set(0, 0.84, -0.02);
    const backHair = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.06, 0.24), hairMat);
    backHair.position.set(0, 0.32, -0.36);
    const sideHairL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.82, 0.32), hairMat);
    sideHairL.position.set(-0.42, 0.38, -0.08);
    const sideHairR = sideHairL.clone();
    sideHairR.position.x = 0.42;
    headGroup.add(topHair, backHair, sideHairL, sideHairR);
  } else if (archetypeId === 'zoo_keeper' || archetypeId === 'night_ranger') {
    // Non-Hijab hair + rear ponytail/braid
    const topHair = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.16, 0.84), hairMat);
    topHair.position.set(0, 0.8, -0.02);
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.36), hairMat);
    sideL.position.set(-0.41, 0.56, -0.1);
    const sideR = sideL.clone();
    sideR.position.x = 0.41;
    const ponytail = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.68, 0.22), hairMat);
    ponytail.position.set(archetypeId === 'night_ranger' ? 0.22 : 0, 0.32, -0.5);
    ponytail.rotation.x = 0.25;
    headGroup.add(topHair, sideL, sideR, ponytail);
  } else if (archetypeId === 'night_astronomer') {
    // Sleek silver-streaked bob haircut + cheek rosy blush!
    const topHair = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.22, 0.86), hairMat);
    topHair.position.set(0, 0.84, -0.02);
    const bobL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.58, 0.52), hairMat);
    bobL.position.set(-0.42, 0.5, -0.08);
    const bobR = bobL.clone();
    bobR.position.x = 0.42;
    const bobBack = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.58, 0.2), hairMat);
    bobBack.position.set(0, 0.5, -0.36);
    const blushL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.03), palette.getMat(0xf472b6, 'matte'));
    blushL.position.set(-0.24, 0.34, 0.4);
    const blushR = blushL.clone();
    blushR.position.x = 0.24;
    headGroup.add(topHair, bobL, bobR, bobBack, blushL, blushR);
  } else if (archetypeId === 'village_elder') {
    // Bald crown with fluffy white side/back hair + long flowing beard!
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.4, 0.54), hairMat);
    sideL.position.set(-0.42, 0.5, -0.1);
    const sideR = sideL.clone();
    sideR.position.x = 0.42;
    const backH = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.44, 0.18), hairMat);
    backH.position.set(0, 0.48, -0.38);
    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.56, 0.24), hairMat);
    beard.position.set(0, 0.12, 0.38);
    headGroup.add(sideL, sideR, backH, beard);
  } else {
    // Standard short/medium male hair crown + back
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.18, 0.84), hairMat);
    hairTop.position.set(0, 0.82, -0.02);
    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.46, 0.18), hairMat);
    hairBack.position.set(0, 0.54, -0.36);
    headGroup.add(hairTop, hairBack);

    if (archetypeId === 'blacksmith' || archetypeId === 'mine_engineer') {
      const beard = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.28, 0.16), hairMat);
      beard.position.set(0, 0.2, 0.36);
      headGroup.add(beard);
    } else if (archetypeId === 'clockmaker') {
      const stache = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.12), hairMat);
      stache.position.set(0, 0.28, 0.41);
      headGroup.add(stache);
    } else if (archetypeId === 'temple_guardian') {
      const beard = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.46, 0.22), hairMat);
      beard.position.set(0, 0.14, 0.38);
      headGroup.add(beard);
    } else if (archetypeId === 'night_watchman') {
      const thickStache = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.11), hairMat);
      thickStache.position.set(0, 0.27, 0.41);
      headGroup.add(thickStache);
    } else if (archetypeId === 'night_chef') {
      const goatee = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.12), hairMat);
      goatee.position.set(0, 0.18, 0.39);
      const smile = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.04), whiteMat);
      smile.position.set(0, 0.28, 0.41);
      headGroup.add(goatee, smile);
    } else if (archetypeId === 'night_scholar') {
      const silverStubble = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.26, 0.14), palette.getMat(0x94a3b8, 'matte'));
      silverStubble.position.set(0, 0.2, 0.37);
      headGroup.add(silverStubble);
    }
  }

  // Headgear per archetype
  if (archetypeId === 'village_kid') {
    const capDome = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.24, 0.86), palette.getMat(0x1e293b, 'matte'));
    capDome.position.set(0, 0.9, 0);
    const capBill = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.08, 0.38), accentMat);
    capBill.position.set(0, 0.8, -0.52); // backwards baseball cap!
    headGroup.add(capDome, capBill);
  } else if (archetypeId === 'farmer_boy') {
    const strawMat = palette.getMat(0xeab308, 'matte');
    const brim = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.1, 1.38), strawMat);
    brim.position.y = 0.88;
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.28, 0.88), strawMat);
    crown.position.y = 1.06;
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.91, 0.09, 0.91), woodMat);
    band.position.y = 0.96;
    headGroup.add(brim, crown, band);
  } else if (archetypeId === 'pastry_chef') {
    const toqueBase = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.4, 0.28, 12), whiteMat);
    toqueBase.position.y = 1.04;
    const toquePuff = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.38, 0.78), whiteMat);
    toquePuff.position.y = 1.32;
    headGroup.add(toqueBase, toquePuff);
  } else if (archetypeId === 'zoo_keeper') {
    const capMat = palette.getMat(0xc2a375, 'matte');
    const capCrown = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.24, 0.86), capMat);
    capCrown.position.y = 0.88;
    const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.08, 0.38), capMat);
    capVisor.position.set(0, 0.8, 0.48);
    headGroup.add(capCrown, capVisor);
  } else if (archetypeId === 'ranger_guide') {
    const bushMat = palette.getMat(0xb08d57, 'matte');
    const brim = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.1, 1.32), bushMat);
    brim.position.y = 0.86;
    const crown = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.28, 0.86), bushMat);
    crown.position.y = 1.04;
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.89, 0.08, 0.89), shirtMat);
    band.position.y = 0.95;
    headGroup.add(brim, crown, band);
  } else if (archetypeId === 'city_policeman' || archetypeId === 'bus_driver') {
    const capDome = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.28, 0.88), pantsMat);
    capDome.position.y = 0.92;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.08, 0.34), darkMetalMat);
    visor.position.set(0, 0.8, 0.48);
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.08), goldMat);
    badge.position.set(0, 0.92, 0.46);
    headGroup.add(capDome, visor, badge);
  } else if (archetypeId === 'mine_engineer') {
    const hardHat = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.3, 0.9), accentMat);
    hardHat.position.y = 0.92;
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.08, 0.28), accentMat);
    brim.position.set(0, 0.82, 0.48);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.14), palette.getMat(0x67e8f9, 'emissive'));
    lamp.position.set(0, 0.94, 0.47);
    headGroup.add(hardHat, brim, lamp);
  } else if (archetypeId === 'ielts_dean') {
    // Glasses + Graduation Mortarboard Cap with Gold Tassel
    const glassRimL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.05), goldMat);
    glassRimL.position.set(-0.19, 0.46, 0.42);
    const glassRimR = glassRimL.clone();
    glassRimR.position.x = 0.19;
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.05), goldMat);
    bridge.position.set(0, 0.48, 0.42);
    const capBoard = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.12, 1.12), darkMetalMat);
    capBoard.position.y = 0.99;
    const capButton = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.14), goldMat);
    capButton.position.y = 1.07;
    const tassel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.08), goldMat);
    tassel.position.set(0.5, 0.8, 0.22);
    headGroup.add(glassRimL, glassRimR, bridge, capBoard, capButton, tassel);
  } else if (archetypeId === 'night_watchman') {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.24, 0.82), palette.getMat(0x0f172a, 'matte'));
    cap.position.y = 0.9;
    const emblem = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.06), goldMat);
    emblem.position.set(0, 0.9, 0.43);
    headGroup.add(cap, emblem);
  } else if (archetypeId === 'night_chef') {
    const bandana = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.18, 0.88), accentMat);
    bandana.position.set(0, 0.78, 0);
    const knot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.16), accentMat);
    knot.position.set(0, 0.76, -0.48);
    headGroup.add(bandana, knot);
  } else if (archetypeId === 'night_ranger') {
    // Glowing emerald night-vision goggles pushed on forehead!
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.1, 0.86), darkMetalMat);
    strap.position.y = 0.78;
    const gogL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 8), palette.getMat(0x34d399, 'emissive'));
    gogL.rotation.x = Math.PI / 2;
    gogL.position.set(-0.18, 0.78, 0.45);
    const gogR = gogL.clone();
    gogR.position.x = 0.18;
    headGroup.add(strap, gogL, gogR);
  } else if (archetypeId === 'night_officer') {
    const beret = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.2, 0.9), palette.getMat(0x1e3a8a, 'matte'));
    beret.position.set(0.06, 0.94, 0);
    beret.rotation.z = -0.14;
    const star = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.06), palette.getMat(0x38bdf8, 'emissive'));
    star.position.set(-0.14, 0.92, 0.46);
    headGroup.add(beret, star);
  } else if (archetypeId === 'night_astronomer') {
    // Brass monocle over right eye + crescent moon tiara!
    const monocle = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 6, 12), goldMat);
    monocle.position.set(0.19, 0.46, 0.43);
    const tiara = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.1, 0.12), goldMat);
    tiara.position.set(0, 0.95, 0.34);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), palette.getMat(0xa78bfa, 'emissive'));
    gem.position.set(0, 1.04, 0.36);
    headGroup.add(monocle, tiara, gem);
  } else if (archetypeId === 'night_scholar') {
    // Glowing amethyst crystal spectacles!
    const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.17, 0.05), palette.getMat(0xc084fc, 'emissive'));
    frameL.position.set(-0.19, 0.46, 0.42);
    const frameR = frameL.clone();
    frameR.position.x = 0.19;
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.05), goldMat);
    bridge.position.set(0, 0.48, 0.42);
    headGroup.add(frameL, frameR, bridge);
  }

  // 4. Full Articulated Arms & Profession Tools
  const sleeveMat =
    archetypeId === 'village_kid' ||
    archetypeId === 'street_vendor' ||
    archetypeId === 'zoo_keeper' ||
    archetypeId === 'ranger_guide' ||
    archetypeId === 'city_policeman' ||
    archetypeId === 'blacksmith'
      ? shirtMat
      : shirtMat;
  const shortSleeve =
    archetypeId === 'village_kid' ||
    archetypeId === 'street_vendor' ||
    archetypeId === 'ranger_guide' ||
    archetypeId === 'city_policeman' ||
    archetypeId === 'blacksmith';

  const makeArm = (ax: number): THREE.Group => {
    const arm = new THREE.Group();
    arm.position.set(ax, 0.88, 0);
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.34), sleeveMat);
    upper.position.y = -0.18;
    upper.castShadow = true;
    const fore = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.3, 0.3),
      shortSleeve ? skinMat : sleeveMat,
    );
    fore.position.y = -0.46;
    fore.castShadow = true;
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.26), skinMat);
    hand.position.y = -0.68;
    hand.castShadow = true;
    arm.add(upper, fore, hand);
    return arm;
  };
  const leftArm = makeArm(-0.63);
  const rightArm = makeArm(0.63);
  upperBody.add(leftArm, rightArm);

  let propSpin: THREE.Object3D | undefined;

  // Signature Tools & Props matching Image #1–#20
  if (archetypeId === 'farmer_boy') {
    const hoe = new THREE.Group();
    hoe.position.set(0, -0.68, 0.14);
    hoe.rotation.x = 0.5;
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 1.9, 6), woodMat);
    handle.position.y = 0.35;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.56), ironMat);
    blade.position.set(0, 1.25, 0.22);
    hoe.add(handle, blade);
    rightArm.add(hoe);
  } else if (archetypeId === 'florist_girl') {
    const basket = new THREE.Group();
    basket.position.set(0, 0.24, 0.58);
    const bowl = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.34, 0.5), palette.getMat(0xb45309, 'matte'));
    const soil = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.08, 0.4), palette.getMat(0x15803d, 'matte'));
    soil.position.y = 0.16;
    basket.add(bowl, soil);
    [
      [-0.2, 0.26, 0.06, 0xf43f5e],
      [0, 0.28, -0.05, 0xfacc15],
      [0.2, 0.25, 0.08, 0xa855f7],
      [-0.08, 0.24, 0.14, 0xfb923c],
    ].forEach(([fx, fy, fz, fc]) => {
      const fl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), palette.getMat(fc, 'matte'));
      fl.position.set(fx, fy, fz);
      basket.add(fl);
    });
    upperBody.add(basket);
  } else if (archetypeId === 'street_vendor') {
    const skewer = new THREE.Group();
    skewer.position.set(0, -0.68, 0.16);
    skewer.rotation.x = 0.45;
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.15, 6), woodMat);
    stick.position.y = 0.48;
    skewer.add(stick);
    [0.52, 0.72, 0.92].forEach((sy, si) => {
      const meat = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.15, 0.22),
        palette.getMat(si % 2 === 0 ? 0x9a3412 : 0x78350f, 'matte'),
      );
      meat.position.y = sy;
      skewer.add(meat);
    });
    rightArm.add(skewer);
  } else if (archetypeId === 'pastry_chef') {
    const tray = new THREE.Group();
    tray.position.set(0, 0.26, 0.62);
    const metal = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.08, 0.56), ironMat);
    tray.add(metal);
    [
      [-0.22, 0.11, -0.08],
      [0.02, 0.12, 0.06],
      [0.24, 0.11, -0.05],
    ].forEach(([px, py, pz]) => {
      const roll = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.18), palette.getMat(0xd97706, 'matte'));
      roll.position.set(px, py, pz);
      tray.add(roll);
    });
    upperBody.add(tray);
  } else if (archetypeId === 'zoo_keeper') {
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.58, 0.08), woodMat);
    board.position.set(0.08, -0.68, 0.24);
    board.rotation.set(-0.45, 0.2, 0);
    const paper = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.46, 0.04), whiteMat);
    paper.position.set(0, 0, 0.04);
    board.add(paper);
    leftArm.add(board);
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 6), accentMat);
    pen.position.set(0, -0.68, 0.18);
    pen.rotation.x = Math.PI / 2;
    rightArm.add(pen);
  } else if (archetypeId === 'ranger_guide') {
    const binoc = new THREE.Group();
    binoc.position.set(0, 0.58, 0.52);
    const tubeL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.32, 8), darkMetalMat);
    tubeL.rotation.x = Math.PI / 2;
    tubeL.position.x = -0.12;
    const tubeR = tubeL.clone();
    tubeR.position.x = 0.12;
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.12), darkMetalMat);
    binoc.add(tubeL, tubeR, bridge);
    upperBody.add(binoc);
  } else if (archetypeId === 'school_teacher') {
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.52, 0.44), accentMat);
    book.position.set(-0.08, -0.64, 0.22);
    book.rotation.set(0.25, 0.15, 0.15);
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.46, 0.38), whiteMat);
    pages.position.x = 0.03;
    book.add(pages);
    leftArm.add(book);
  } else if (archetypeId === 'city_policeman') {
    // Magnifier / whistle in right hand + police baton in left hand
    const glass = new THREE.Group();
    glass.position.set(0, -0.68, 0.2);
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.34, 6), darkMetalMat);
    handle.position.y = 0.12;
    const lens = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.035, 6, 12),
      palette.getMat(0x38bdf8, 'emissive'),
    );
    lens.position.y = 0.4;
    glass.add(handle, lens);
    rightArm.add(glass);
    const baton = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.85, 6), darkMetalMat);
    baton.position.set(0, -0.68, 0.22);
    baton.rotation.x = 0.65;
    leftArm.add(baton);
  } else if (archetypeId === 'bus_driver') {
    const wheel = new THREE.Group();
    wheel.position.set(0, 0.36, 0.62);
    wheel.rotation.x = 0.32;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 8, 16), darkMetalMat);
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.07, 0.06), darkMetalMat);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 8), ironMat);
    hub.rotation.x = Math.PI / 2;
    wheel.add(rim, spoke, hub);
    upperBody.add(wheel);
  } else if (archetypeId === 'spice_merchant') {
    const bowl = new THREE.Group();
    bowl.position.set(0, -0.64, 0.24);
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.22, 0.24, 10), woodMat);
    const spice = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.22, 8),
      palette.getMat(0xf97316, 'matte'),
    );
    spice.position.y = 0.16;
    bowl.add(basket, spice);
    leftArm.add(bowl);
  } else if (archetypeId === 'blacksmith') {
    const hammer = new THREE.Group();
    hammer.position.set(0, -0.68, 0.18);
    hammer.rotation.x = 0.65;
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.92, 6), woodMat);
    handle.position.y = 0.32;
    const headIron = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.46), darkMetalMat);
    headIron.position.y = 0.78;
    hammer.add(handle, headIron);
    rightArm.add(hammer);
  } else if (archetypeId === 'clockmaker') {
    const watch = new THREE.Group();
    watch.position.set(0, -0.68, 0.24);
    const caseGold = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12), goldMat);
    caseGold.rotation.x = Math.PI / 2;
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.09, 12), whiteMat);
    face.rotation.x = Math.PI / 2;
    watch.add(caseGold, face);
    rightArm.add(watch);
    propSpin = watch;
  } else if (archetypeId === 'village_elder') {
    const staff = new THREE.Group();
    staff.position.set(0, -0.7, 0.12);
    staff.rotation.x = 0.38;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 2.35, 8), woodMat);
    shaft.position.y = 0.45;
    const knob = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), palette.getMat(0xfacc15, 'emissive'));
    knob.position.y = 1.68;
    staff.add(shaft, knob);
    rightArm.add(staff);
    propSpin = knob;
  } else if (archetypeId === 'grandma_herbalist') {
    const mortar = new THREE.Group();
    mortar.position.set(0, 0.28, 0.56);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.28, 10), ironMat);
    const herbs = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 8), pantsMat);
    herbs.position.y = 0.11;
    const pestle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.42, 6), woodMat);
    pestle.position.set(0.05, 0.22, 0.02);
    pestle.rotation.z = -0.4;
    mortar.add(bowl, herbs, pestle);
    upperBody.add(mortar);
  } else if (archetypeId === 'crystal_scholar') {
    const scroll = new THREE.Group();
    scroll.position.set(0, 0.34, 0.58);
    scroll.rotation.x = -0.32;
    const parchment = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.48, 0.05),
      palette.getMat(0xfef3c7, 'matte'),
    );
    const rollL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.54, 8), woodMat);
    rollL.position.x = -0.36;
    const rollR = rollL.clone();
    rollR.position.x = 0.36;
    scroll.add(parchment, rollL, rollR);
    upperBody.add(scroll);
  } else if (archetypeId === 'mine_engineer') {
    const pick = new THREE.Group();
    pick.position.set(0.05, -0.65, 0.14);
    pick.rotation.x = -0.4;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.55, 6), woodMat);
    shaft.position.y = 0.45;
    const headPick = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.78), ironMat);
    headPick.position.y = 1.18;
    pick.add(shaft, headPick);
    rightArm.add(pick);
  } else if (archetypeId === 'temple_guardian') {
    const lantern = new THREE.Group();
    lantern.position.set(0, -0.72, 0.24);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 6, 8), darkMetalMat);
    handle.position.y = -0.08;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.28), darkMetalMat);
    frame.position.y = -0.34;
    const flame = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.24, 0.2),
      palette.getMat(0xf59e0b, 'emissive'),
    );
    flame.position.y = -0.34;
    lantern.add(handle, frame, flame);
    rightArm.add(lantern);
  } else if (archetypeId === 'ielts_dean') {
    const diploma = new THREE.Group();
    diploma.position.set(0, -0.68, 0.2);
    diploma.rotation.set(0.65, 0.2, 0.2);
    const roll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.68, 8),
      palette.getMat(0xfef3c7, 'matte'),
    );
    const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.1, 8), palette.getMat(0xdc2626, 'matte'));
    diploma.add(roll, ribbon);
    rightArm.add(diploma);
  } else if (archetypeId === 'night_watchman') {
    // Glowing brass night lantern in right hand + wooden kentongan baton in left hand
    const lantern = new THREE.Group();
    lantern.position.set(0, -0.72, 0.22);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.36, 0.26), darkMetalMat);
    frame.position.y = -0.28;
    const flame = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.18), palette.getMat(0xfde047, 'emissive'));
    flame.position.y = -0.28;
    lantern.add(frame, flame);
    rightArm.add(lantern);
    const kentongan = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.65, 8), woodMat);
    kentongan.position.set(0, -0.68, 0.18);
    kentongan.rotation.x = 0.4;
    leftArm.add(kentongan);
  } else if (archetypeId === 'night_chef') {
    // Glowing hot soup pot carried in front!
    const pot = new THREE.Group();
    pot.position.set(0, 0.28, 0.58);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.34, 12), darkMetalMat);
    const soup = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.06, 12), palette.getMat(0xfb923c, 'emissive'));
    soup.position.y = 0.15;
    pot.add(body, soup);
    upperBody.add(pot);
  } else if (archetypeId === 'night_ranger') {
    // Glowing emerald signal lantern
    const lantern = new THREE.Group();
    lantern.position.set(0, -0.7, 0.22);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.34, 0.24), darkMetalMat);
    frame.position.y = -0.24;
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), palette.getMat(0x34d399, 'emissive'));
    gem.position.y = -0.24;
    lantern.add(frame, gem);
    rightArm.add(lantern);
  } else if (archetypeId === 'night_officer') {
    // Glowing cyan traffic baton in right hand
    const wand = new THREE.Group();
    wand.position.set(0, -0.68, 0.2);
    wand.rotation.x = 0.55;
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.25, 6), darkMetalMat);
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.65, 8), palette.getMat(0x38bdf8, 'emissive'));
    glow.position.y = 0.44;
    wand.add(grip, glow);
    rightArm.add(wand);
  } else if (archetypeId === 'night_astronomer') {
    // Spinning golden/violet astrolabe in right hand
    const astrolabe = new THREE.Group();
    astrolabe.position.set(0, -0.68, 0.24);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 6, 14), goldMat);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), palette.getMat(0xa78bfa, 'emissive'));
    astrolabe.add(ring, core);
    rightArm.add(astrolabe);
    propSpin = astrolabe;
  } else if (archetypeId === 'night_scholar') {
    // Floating spinning amethyst crystal orb
    const orb = new THREE.Group();
    orb.position.set(0, -0.66, 0.26);
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), palette.getMat(0xc084fc, 'emissive'));
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 6, 12), goldMat);
    halo.rotation.x = Math.PI / 2;
    orb.add(crystal, halo);
    rightArm.add(orb);
    propSpin = orb;
  }

  const baseRightArmX = spec.baseRightArmX;
  const baseLeftArmX = spec.baseLeftArmX;
  const baseRightArmZ = spec.baseRightArmZ ?? 0;
  const baseLeftArmZ = spec.baseLeftArmZ ?? 0;
  rightArm.rotation.set(baseRightArmX, 0, baseRightArmZ);
  leftArm.rotation.set(baseLeftArmX, 0, baseLeftArmZ);

  return {
    root,
    bodyPivot,
    upperBody,
    headGroup,
    leftEye: lEye,
    rightEye: rEye,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    propSpin,
    baseRightArmX,
    baseLeftArmX,
    baseRightArmZ,
    baseLeftArmZ,
    baseScaleXZ: spec.scaleXZ,
    baseScaleY: spec.scaleY,
    archetype: archetypeId,
  };
}
