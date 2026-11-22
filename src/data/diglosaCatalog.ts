import {
  BossDef,
  DifficultyMode,
  DoorDef,
  MonsterSpawnDef,
  NpcDefinition,
  QuizQuestion,
  RelicDef,
  RelicId,
  VocabEntry,
  WeaponDef,
  WeaponId,
  WordProgress,
  ZoneId,
} from '../types/game';
import {
  pickDistractors,
  pickSmartWords,
  VOCAB_BY_ID,
  VOCAB_CATALOG,
} from './vocabCatalog';
import { OVERWORLD_ANCHORS } from '../three/archipelagoWorld';

export const SAVE_KEY = 'hoot-a1-v1';
export const DAILY_GOAL = 20;
export const MAX_AMMO = 40;
export const AMMO_COST = 3;

export const TUNE = {
  hpStart: 5,
  hpCap: 8,
  regenSec: 90,
  respawnSec: 30,
  itemBackSec: 90,
  aggroDist: 16,
  contactDist: 2.35,
  invHit: 4,
  invKill: 2.5,
  autoAimRange: 34,
};

export interface DifficultyConfig {
  label: string;
  desc: string;
  startHp: number;
  regenSec: number;
  scoreMult: number;
  xpMult: number;
  roamingCount: number;
  monsterSpeed: number;
  duelAnswerSec: number; // 0 = no limit
  maxShooters: number;
  shooterCooldown: number;
  shooterBulletSpeed: number;
  grabSec: number;
  monsterGuessAcc: number;
  qSec: number;
  matchSec: number;
}

export const DIFF_CONFIG: Record<DifficultyMode, DifficultyConfig> = {
  santai: {
    label: 'Santai',
    desc: '6 ❤️ awal · Regen cepat (55 dtk) · Tanpa penembak · Timer lembut (20 dtk)',
    startHp: 6,
    regenSec: 55,
    scoreMult: 1,
    xpMult: 1,
    roamingCount: 0,
    monsterSpeed: 0,
    duelAnswerSec: 0,
    maxShooters: 0,
    shooterCooldown: 99,
    shooterBulletSpeed: 0,
    grabSec: 5,
    monsterGuessAcc: 0.4,
    qSec: 20,
    matchSec: 180,
  },
  petualang: {
    label: 'Petualang',
    desc: '5 ❤️ awal · 1 penembak · Timer seimbang (12 dtk) · Skor 1.25x',
    startHp: 5,
    regenSec: 90,
    scoreMult: 1.25,
    xpMult: 1.15,
    roamingCount: 3,
    monsterSpeed: 4.8,
    duelAnswerSec: 0,
    maxShooters: 1,
    shooterCooldown: 2.4,
    shooterBulletSpeed: 14,
    grabSec: 3,
    monsterGuessAcc: 0.6,
    qSec: 12,
    matchSec: 120,
  },
  pendekar: {
    label: 'Pendekar',
    desc: '4 ❤️ awal · 2 penembak · Monster 1.3x cepat · Duel 12 dtk · Skor & XP 1.5x',
    startHp: 4,
    regenSec: 120,
    scoreMult: 1.5,
    xpMult: 1.5,
    roamingCount: 5,
    monsterSpeed: 6.6,
    duelAnswerSec: 12,
    maxShooters: 2,
    shooterCooldown: 1.5,
    shooterBulletSpeed: 20,
    grabSec: 3,
    monsterGuessAcc: 0.8,
    qSec: 8,
    matchSec: 90,
  },
};

export const LEVELS = [
  { level: 1, minXp: 0, title: 'Telur Pemula' },
  { level: 2, minXp: 150, title: 'Anak Burung' },
  { level: 3, minXp: 300, title: 'Burung Kecil' },
  { level: 4, minXp: 450, title: 'Terbang Rendah' },
  { level: 5, minXp: 600, title: 'Penjelajah Kata' },
  { level: 6, minXp: 750, title: 'Hoot Cerdik' },
  { level: 7, minXp: 900, title: 'Kakak Hoot' },
  { level: 8, minXp: 1050, title: 'Master A1' },
];

export function getLevelInfo(xp: number): {
  level: number;
  title: string;
  xpInLevel: number;
  xpNeeded: number;
} {
  const safeXp = Math.max(0, xp);
  const idx = Math.min(LEVELS.length - 1, Math.floor(safeXp / 150));
  const cur = LEVELS[idx];
  const nextMin = idx < LEVELS.length - 1 ? LEVELS[idx + 1].minXp : cur.minXp + 150;
  return {
    level: cur.level,
    title: cur.title,
    xpInLevel: idx < LEVELS.length - 1 ? safeXp - cur.minXp : 150,
    xpNeeded: nextMin - cur.minXp,
  };
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  ketapel: {
    id: 'ketapel',
    name: 'Senjata Pemula',
    originZone: 'hutan',
    originLabel: 'Alun-Alun Desa',
    color: '#4fd8ff',
    colorHex: 0x4fd8ff,
    damage: 1,
    shieldDamage: 1,
    cooldown: 0.65,
    speed: 30,
    packSize: 6,
    desc: 'Senjata kecil pertama (1 Dmg · Regen s/d 5) — jelajahi Gua & kalahkan Bos untuk senjata kuat!',
  },
  kerikil: {
    id: 'kerikil',
    name: 'Ketapel Kerikil',
    originZone: 'hutan',
    originLabel: 'Peti Rahasia Gua',
    color: '#cbd5e1',
    colorHex: 0xcbd5e1,
    damage: 1,
    shieldDamage: 1,
    cooldown: 0.48,
    speed: 32,
    packSize: 10,
    desc: 'Senjata kecil acak di gua (3× tembak buka duel monster)',
  },
  emas: {
    id: 'emas',
    name: 'Senjata Emas',
    originZone: 'desa_sapaan',
    originLabel: 'Desa Sapaan',
    color: '#ffd24a',
    colorHex: 0xffd24a,
    damage: 2,
    shieldDamage: 2,
    cooldown: 0.32,
    speed: 38,
    packSize: 8,
    desc: 'Orb emas kuat (2× tembak buka duel · 2 Dmg) · Hadiah Desa Sapaan',
  },
  saus: {
    id: 'saus',
    name: 'Senjata Cepat',
    originZone: 'pasar_rasa',
    originLabel: 'Pasar Rasa',
    color: '#ff7a3a',
    colorHex: 0xff7a3a,
    damage: 2,
    shieldDamage: 2,
    cooldown: 0.24,
    speed: 34,
    packSize: 10,
    desc: 'Fire-rate tercepat (2× tembak buka duel) · Hadiah Pasar Rasa',
  },
  biji: {
    id: 'biji',
    name: 'Senjata Hijau',
    originZone: 'hutan_satwa',
    originLabel: 'Hutan Satwa',
    color: '#7cf04a',
    colorHex: 0x7cf04a,
    damage: 2,
    shieldDamage: 2,
    cooldown: 0.55,
    speed: 40,
    packSize: 6,
    pierce: 1,
    desc: 'Menembus 1 musuh (2× tembak buka duel) · Hadiah Hutan Satwa',
  },
  kertas: {
    id: 'kertas',
    name: 'Senjata Langit',
    originZone: 'gerbang_kota',
    originLabel: 'Gerbang Kota',
    color: '#7fdcff',
    colorHex: 0x7fdcff,
    damage: 2,
    shieldDamage: 2,
    cooldown: 0.45,
    speed: 46,
    packSize: 6,
    desc: 'Laser langit cepat (2× tembak buka duel) · Hadiah Gerbang Kota',
  },
  jarum: {
    id: 'jarum',
    name: 'Senjata Berat',
    originZone: 'menara_waktu',
    originLabel: 'Menara Waktu',
    color: '#ffb347',
    colorHex: 0xffb347,
    damage: 3,
    shieldDamage: 3,
    cooldown: 0.9,
    speed: 48,
    packSize: 4,
    desc: 'Super berat (1× tembak langsung buka duel!) · Hadiah Menara Waktu',
  },
  kristal: {
    id: 'kristal',
    name: 'Senjata Kristal',
    originZone: 'gua_portal',
    originLabel: 'Gua Portal',
    color: '#b57cff',
    colorHex: 0xb57cff,
    damage: 2,
    shieldDamage: 3,
    cooldown: 0.6,
    speed: 38,
    packSize: 6,
    spread: 3,
    desc: '3 peluru kipas (1× tembak langsung buka duel!) · Hadiah Gua Portal',
  },
};

export const WEAPON_ORDER: WeaponId[] = [
  'ketapel',
  'emas',
  'saus',
  'biji',
  'kertas',
  'jarum',
  'kristal',
  'kerikil',
];

export const RELICS: Record<RelicId, RelicDef> = {
  pedang: {
    id: 'pedang',
    icon: '🗡️',
    name: 'Pedang Kata',
    zoneId: 'desa_sapaan',
    desc: '+1 damage (2 dmg) di duel biasa; di Bos, pulih +1 ❤️ tiap 4 hit beruntun.',
  },
  perisai: {
    id: 'perisai',
    icon: '🛡️',
    name: 'Perisai Panci',
    zoneId: 'pasar_rasa',
    desc: 'Menangkis 1x jawaban salah pertama per duel tanpa kehilangan nyawa.',
  },
  peluit: {
    id: 'peluit',
    icon: '🎵',
    name: 'Peluit Rimba',
    zoneId: 'hutan_satwa',
    desc: 'Sekali per duel, menghapus 1 pilihan jawaban salah secara gratis.',
  },
  sepatu: {
    id: 'sepatu',
    icon: '👟',
    name: 'Sepatu Angin',
    zoneId: 'gerbang_kota',
    desc: '+1 detik waktu reaksi tombol AMBIL! (menangkal efek Bayangan Gerbang).',
  },
  jam: {
    id: 'jam',
    icon: '⏳',
    name: 'Jam Pasir Emas',
    zoneId: 'menara_waktu',
    desc: 'Sekali per duel, membekukan giliran monster / menangkal rewind Bos.',
  },
  kompas: {
    id: 'kompas',
    icon: '🧭',
    name: 'Kompas Tanya',
    zoneId: 'gua_portal',
    desc: 'Menandai kata sulit (salah > benar) agar kamu lebih waspada saat duel.',
  },
};

export const RELIC_ORDER: RelicId[] = [
  'pedang',
  'perisai',
  'peluit',
  'sepatu',
  'jam',
  'kompas',
];

export const RIBBONS: Record<
  ZoneId,
  { number: number; name: string; color: string; quote: string }
> = {
  desa_sapaan: {
    number: 1,
    name: 'Pita Merah 1 · Desa Sapaan',
    color: '#dc2626',
    quote: 'Halo, Kak. Namaku Lila. Aku adikmu. Sapalah aku.',
  },
  pasar_rasa: {
    number: 2,
    name: 'Pita Merah 2 · Pasar Rasa',
    color: '#dc2626',
    quote: 'Aku makan nasi dan sup di pasar. Enak. Apakah kamu lapar, Kak? Tolong makanlah.',
  },
  hutan_satwa: {
    number: 3,
    name: 'Pita Merah 3 · Hutan Satwa',
    color: '#dc2626',
    quote: 'Hari itu cerah dan hujan sekaligus. Aku melihat pelangi di hutan. Aku bahagia selama satu menit.',
  },
  gerbang_kota: {
    number: 4,
    name: 'Pita Merah 4 · Gerbang Kota',
    color: '#dc2626',
    quote: 'Aku naik bus ke istana. Sopirnya lupa pekerjaannya. Kubilang: kamu seorang sopir. Ia tersenyum.',
  },
  menara_waktu: {
    number: 5,
    name: 'Pita Merah 5 · Menara Waktu',
    color: '#dc2626',
    quote: 'Waktu berhenti, tapi aku tidak berhenti. Aku menaiki delapan puluh anak tangga. Aku lelah, tapi aku bahagia.',
  },
  gua_portal: {
    number: 6,
    name: 'Pita Merah 6 · Gua Portal',
    color: '#dc2626',
    quote: 'Aku di istana. Raja itu baik. Datanglah, Kak. Namaku Lila. Aku adikmu. Aku menunggu.',
  },
};

export const DOOR_RESTORED_STORY: Record<ZoneId, string[]> = {
  desa_sapaan: [
    'Kata sapaan "Hello…" kembali bergema di Desa Sapaan!',
    'Kata sapaan "Hi…" memulihkan suara pintu desa!',
    'Kata "Good morning…" menyapa rumah-rumah warga!',
    'Kata "Thank you…" menghangatkan kembali hati desa!',
    'Kata "Goodbye…" menyatukan sapaan — Gumpal Salam muncul di depan Rumah Rani!',
  ],
  pasar_rasa: [
    'Bahan "Rice" kembali memenuhi rak dapur Pasar Rasa!',
    'Aroma "Soup" hangat mulai tercium di lorong lapak!',
    'Daun "Tea" segar pulih di gudang bawah!',
    'Sayuran "Vegetables" kembali segar di sungai kuah!',
    'Buah "Fruit" pulih sempurna — Lendir Kuali muncul di balik Lemari Bumbu!',
  ],
  hutan_satwa: [
    'Burung ("Bird") bebas berkicau dan ikut menjaga jalur hutan!',
    'Ikan ("Fish") kembali berenang bebas di genangan jernih!',
    'Kelinci ("Rabbit") lepas dari jeratan akar berduri!',
    'Rusa ("Deer") kembali melangkah bebas di belantara!',
    'Kupu-kupu ("Butterfly") beterbangan — Semak Gigit muncul di depan Akar Berpola!',
  ],
  gerbang_kota: [
    'Ingatan kata "Home" kembali ke warga Gerbang Kota!',
    'Kata "School" menyala di papan peta — jejak Dewi terlihat!',
    'Ingatan "Office" memulihkan para pekerja kota!',
    'Ingatan "Market" menggerakkan kembali lalu lintas warga!',
    'Ingatan "Station" pulih — Bayangan Gerbang muncul mengurung Pintu Sekolah!',
  ],
  menara_waktu: [
    'Jarum jam menara bergerak dari Seven… menuju langkah baru!',
    'Jarum jam menara melangkah ke Eight!',
    'Lonceng ruang bergetar saat jarum jam menunjuk Nine!',
    'Roda gigi berputar menuju pukul Ten!',
    'Jarum jam mencapai Eleven — Jam Pasir Liar muncul di depan Pintu Jam!',
  ],
  gua_portal: [
    'Suara Nyonya Portal mulai berbisik: "Who…"',
    'Suara Nyonya Portal menguat: "What…"',
    'Kata "Where…" pulih! Bisikan kenangan: "Kamu dan adikmu… aku membuka pintu ini untukmu waktu kalian masih kecil."',
    'Suara Nyonya Portal kian jelas: "When…"',
    'Kata "Why…" pulih — Hantu Portal terbangun di depan Pintu Teka-Teki!',
  ],
};

export interface ZoneCaveStoryDef {
  guardianId: string;
  guardianName: string;
  captiveName: string;
  captiveRole: string;
  captiveColor: number;
  captiveKind: 'girl' | 'mother' | 'fox_kit' | 'student' | 'spirit';
  prisonCorner: 'nw' | 'ne';
  accentColor: string;
  introSteps: Array<{
    speakerName: string;
    speakerRole: string;
    textEn: string;
    textId: string;
  }>;
  rescueCaptiveEn: string;
  rescueCaptiveId: string;
  rescueGuardianEn: string;
  rescueGuardianId: string;
}

export const ZONE_CAVE_STORIES: Record<ZoneId, ZoneCaveStoryDef> = {
  desa_sapaan: {
    guardianId: 'npc_tetua',
    guardianName: 'Kakek Sapa',
    captiveName: 'Rani',
    captiveRole: 'Cucu Kakek Sapa',
    captiveColor: 0xf472b6,
    captiveKind: 'girl',
    prisonCorner: 'nw',
    accentColor: '#f59e0b',
    introSteps: [
      {
        speakerName: 'Masuk ke Gua Desa Sapaan',
        speakerRole: 'Adegan Gua · Babak 1',
        textEn: 'Hoot steps out of the cave entrance into the misty stone hall, where old Kakek Sapa waits trembling by the wall.',
        textId: 'Hoot melangkah masuk dari pintu gua menuju ruang batu berkabut. Di sana, Kakek Sapa berdiri gemetar dengan suara terbata-bata.',
      },
      {
        speakerName: 'Kakek Sapa (Terbata-bata)',
        speakerRole: 'Penjaga Gua Desa Sapaan',
        textEn: 'H-h-hoot... G-good... m-morn... My words are broken! Monsters locked my granddaughter Rani inside a secret prison cell hidden behind cave rocks!',
        textId: 'H-hoot… s-selamat… pa-pagi… Suaraku macet karena kata sapaan desa dirampas! Cucuku Rani disekap di kurungan tersembunyi di balik bebatuan sudut gua!',
      },
      {
        speakerName: 'Misi Gua Desa Sapaan',
        speakerRole: 'Petunjuk Penjaga Gua',
        textEn: 'Open all 5 doors to restore greetings, defeat Gumpal Salam to drop the golden Prison Key, then break the hidden rocks and rescue Rani!',
        textId: 'Buka 5 pintu untuk memulihkan kata sapaan (Hello → Goodbye), kalahkan Bos Gumpal Salam untuk mendapat Kunci Penjara, lalu cari kurungan tersembunyi untuk menyelamatkan Rani!',
      },
    ],
    rescueCaptiveEn: 'Hoot! You found the secret cell and saved me! Let us run back to Grandpa right now!',
    rescueCaptiveId: 'Kak Hoot! Kamu berhasil menemukan penjara rahasia dan menyelamatkanku! Ayo kita temui Kakek Sapa!',
    rescueGuardianEn: 'Rani! My voice is clear again! Thank you, Hoot—always greet first, that is the truest sword!',
    rescueGuardianId: 'Rani cucuku! Suaraku sudah pulih dan jernih lagi! Terima kasih banyak, Hoot! Ingatlah: “Sapalah dulu. Itulah pedang yang sebenarnya.”',
  },
  pasar_rasa: {
    guardianId: 'npc_koki',
    guardianName: 'Koki Mimi',
    captiveName: 'Mama (Ibu Mimi)',
    captiveRole: 'Ibu Koki Mimi',
    captiveColor: 0xfb923c,
    captiveKind: 'mother',
    prisonCorner: 'ne',
    accentColor: '#ef4444',
    introSteps: [
      {
        speakerName: 'Masuk ke Gua Pasar Rasa',
        speakerRole: 'Adegan Gua · Babak 2',
        textEn: 'Brown spice-less fog fills the cavern. Hoot walks toward Koki Mimi, who leans weakly beside the entrance.',
        textId: 'Kabut kecokelatan tanpa aroma masakan menyelimuti gua. Hoot berjalan menghampiri Koki Mimi yang tampak lemas dan hampir tak bersuara.',
      },
      {
        speakerName: 'Koki Mimi (Lemas)',
        speakerRole: 'Penjaga Gua Pasar Rasa',
        textEn: 'Hoot... I cannot even pronounce r-rice or s-soup... Lendir Kuali hid my sick Mama inside a locked secret pantry cell in this cave!',
        textId: 'Hoot… aku bahkan tak sanggup mengucap r-rice atau s-soup… Lendir Kuali menyembunyikan Mama yang sakit di dalam sel kurungan tersembunyi di sudut gua ini!',
      },
      {
        speakerName: 'Misi Gua Pasar Rasa',
        speakerRole: 'Petunjuk Penjaga Gua',
        textEn: 'Restore Rice, Soup, Tea, Vegetables, and Fruit across 5 doors, crush Lendir Kuali for the Prison Key, and free Mama!',
        textId: 'Pulihkan bahan makanan lewat 5 pintu, kalahkan Lendir Kuali hingga Kunci Penjara jatuh, lalu buka kurungan tersembunyi untuk mengobati & menyelamatkan Mama!',
      },
    ],
    rescueCaptiveEn: 'Thank you, brave Hoot! Warm soup aroma is back—I feel strong and healthy again!',
    rescueCaptiveId: 'Terima kasih, Hoot yang pemberani! Aroma sup hangat kembali tercium—aku sudah merasa sehat dan kuat lagi!',
    rescueGuardianEn: 'Mama is healed and my voice is back! Thank you, Hoot! Eat first before you fight!',
    rescueGuardianId: 'Mama sembuh dan suaraku kembali lancar! Terima kasih banyak, Hoot! Pesanku selalu: “Makan dulu. Baru bertarung.”',
  },
  hutan_satwa: {
    guardianId: 'npc_rubah',
    guardianName: 'Ranger Rimba',
    captiveName: 'Kiki',
    captiveRole: 'Adik Ranger Rimba',
    captiveColor: 0xf97316,
    captiveKind: 'fox_kit',
    prisonCorner: 'nw',
    accentColor: '#10b981',
    introSteps: [
      {
        speakerName: 'Masuk ke Gua Hutan Satwa',
        speakerRole: 'Adegan Gua · Babak 3',
        textEn: 'Deep inside the silent mossy cavern, Hoot rushes to Ranger Rimba, whose voice cracks with worry.',
        textId: 'Di gua lumut yang terlalu sunyi tanpa kicau satwa, Hoot berjalan mendekati Ranger Rimba yang bersuara serak penuh cemas.',
      },
      {
        speakerName: 'Ranger Rimba (Cemas)',
        speakerRole: 'Penjaga Gua Hutan Satwa',
        textEn: 'The woods lost every animal word! Thorns trapped my little sibling Kiki inside a hidden cage deep behind the corner rocks!',
        textId: 'Rimba kehilangan seluruh kata satwa! Semak berduri mengurung adik kecilku Kiki di sel rahasia di balik bebatuan sudut gua!',
      },
      {
        speakerName: 'Misi Gua Hutan Satwa',
        speakerRole: 'Petunjuk Penjaga Gua',
        textEn: 'Free Bird, Fish, Rabbit, Deer, and Butterfly through 5 doors, defeat Semak Gigit to claim the Prison Key, and unlock Kiki’s cage!',
        textId: 'Bebaskan Bird hingga Butterfly di 5 pintu, tumbangkan Semak Gigit untuk meraih Kunci Penjara, lalu selamatkan Kiki dari kurungan tersembunyi!',
      },
    ],
    rescueCaptiveEn: 'Hoot! Thank you! The thorns let go—I can run back to Ranger Rimba!',
    rescueCaptiveId: 'Terima kasih, Kak Hoot! Akar berduri sudah lepas—aku bisa berlari memeluk Kak Rimba!',
    rescueGuardianEn: 'Kiki is safe! Listen, Hoot—your little sister Lila passed by here wearing a red ribbon. She is so brave!',
    rescueGuardianId: 'Kiki selamat dan suaraku kembali ceria! Terima kasih, Hoot! Dengar: “Adikmu lewat di sini. Ia berjalan dengan pita merah. Ia pemberani.”',
  },
  gerbang_kota: {
    guardianId: 'npc_penjaga',
    guardianName: 'Pak Polisi Gerbang',
    captiveName: 'Dewi',
    captiveRole: 'Putri Pak Polisi Gerbang',
    captiveColor: 0x38bdf8,
    captiveKind: 'girl',
    prisonCorner: 'ne',
    accentColor: '#3b82f6',
    introSteps: [
      {
        speakerName: 'Masuk ke Gua Gerbang Kota',
        speakerRole: 'Adegan Gua · Babak 4',
        textEn: 'Gray-blue mist hangs low inside the stone vault. Hoot approaches Pak Polisi Gerbang, who freezes stiffly at his post.',
        textId: 'Kabut biru kelabu menghentikan segalanya di ruang bawah gerbang. Hoot berjalan menghampiri Pak Polisi Gerbang yang berdiri kaku kebingungan.',
      },
      {
        speakerName: 'Pak Polisi Gerbang (Linglung)',
        speakerRole: 'Penjaga Gua Gerbang Kota',
        textEn: 'I... I forgot the password to open the gate! My daughter Dewi is locked inside a hidden cell near the dark corner, and I cannot leave my post!',
        textId: 'Aku… aku lupa kata rahasia untuk membuka pintu! Putriku Dewi terkurung di penjara tersembunyi di sudut gua, dan aku tak boleh meninggalkan posku!',
      },
      {
        speakerName: 'Misi Gua Gerbang Kota',
        speakerRole: 'Petunjuk Penjaga Gua',
        textEn: 'Restore Home, School, Office, Market, and Station, defeat Bayangan Gerbang to seize the Prison Key, and bring Dewi home!',
        textId: 'Pulihkan kata tempat & profesi lewat 5 pintu, kalahkan Bayangan Gerbang untuk merebut Kunci Penjara, lalu buka kurungan Dewi!',
      },
    ],
    rescueCaptiveEn: 'Hoot! You unlocked the gate and rescued me! Dad is waiting right by the entrance!',
    rescueCaptiveId: 'Kak Hoot! Kamu membuka kunci penjara dan menyelamatkanku! Ayah pasti sangat merindukanku di depan!',
    rescueGuardianEn: 'Dewi! Now I remember the secret word: “Open!” Thank you from the bottom of my heart, Hoot!',
    rescueGuardianId: 'Dewi putriku! Akhirnya aku ingat kata rahasianya: “Buka. Itulah katanya. Terima kasih!” Seluruh kota kembali bergerak!',
  },
  menara_waktu: {
    guardianId: 'npc_penyihir',
    guardianName: 'Pembuat Jam',
    captiveName: 'Laras (Murid Menara)',
    captiveRole: 'Murid Pembuat Jam',
    captiveColor: 0xa78bfa,
    captiveKind: 'student',
    prisonCorner: 'nw',
    accentColor: '#8b5cf6',
    introSteps: [
      {
        speakerName: 'Masuk ke Gua Menara Waktu',
        speakerRole: 'Adegan Gua · Babak 5',
        textEn: 'Frozen golden dust floats in silence. Hoot walks up to the Clockmaker, who stares blankly at a stopped golden pocket watch.',
        textId: 'Debu emas waktu membeku di udara gua. Hoot berjalan menuju Pembuat Jam yang terus bergumam murung menatap arloji sakunya yang terhenti.',
      },
      {
        speakerName: 'Pembuat Jam (Murung)',
        speakerRole: 'Penjaga Gua Menara Waktu',
        textEn: 'What time is it? Seven o’clock... Always seven... Jam Pasir Liar trapped my dear student Laras inside a hidden time-cage before I could say goodbye!',
        textId: 'Jam berapa sekarang? Pukul tujuh… terus pukul tujuh… Jam Pasir Liar mengurung murid kesayanganku Laras di sel waktu tersembunyi sebelum aku sempat berpamitan!',
      },
      {
        speakerName: 'Misi Gua Menara Waktu',
        speakerRole: 'Petunjuk Penjaga Gua',
        textEn: 'Advance the clock from Seven to Eleven across 5 doors, shatter Jam Pasir Liar for the Prison Key, and free Laras!',
        textId: 'Majukan jarum jam (Seven → Eleven) lewat 5 pintu, hancurkan Jam Pasir Liar untuk merebut Kunci Penjara, lalu selamatkan Laras!',
      },
    ],
    rescueCaptiveEn: 'Thank you, Hoot! Time is flowing again—now I can say a proper goodbye to Master Clockmaker!',
    rescueCaptiveId: 'Terima kasih, Hoot! Waktu kembali mengalir—akhirnya aku bisa berpamitan dengan layak kepada Guru Pembuat Jam!',
    rescueGuardianEn: 'The twelve o’clock bell rings at last! Goodbye, my student—now I can say it with a peaceful heart. Thank you, Hoot!',
    rescueGuardianId: 'Lonceng pukul dua belas berdentang jernih! “Selamat tinggal, muridku. Sekarang aku bisa mengatakannya.” Terima kasih banyak, Hoot!',
  },
  gua_portal: {
    guardianId: 'npc_portal',
    guardianName: 'Nyonya Portal',
    captiveName: 'Peri Suara Portal',
    captiveRole: 'Suara Terkurung Nyonya Portal',
    captiveColor: 0xe879f9,
    captiveKind: 'spirit',
    prisonCorner: 'ne',
    accentColor: '#a855f7',
    introSteps: [
      {
        speakerName: 'Masuk ke Gua Portal',
        speakerRole: 'Adegan Gua · Babak 6 (Final)',
        textEn: 'Inside the crystal cavern leading to the Palace, Hoot approaches Lady Portal—her lips move, yet not a single sound comes out.',
        textId: 'Di dalam gua kristal terakhir menuju Istana, Hoot berjalan mendekati Nyonya Portal. Bibirnya bergerak mencoba bicara, tetapi tak ada satu pun suara keluar.',
      },
      {
        speakerName: 'Nyonya Portal (Tak Bersuara)',
        speakerRole: 'Penjaga Gua Portal',
        textEn: '(Silent gesture pointing to the dark corner...) Hantu Portal stole my voice spirit and the 5 question words—Who, What, Where, When, Why—and locked my voice inside a hidden cage!',
        textId: '(Dengan isyarat tangan menunjuk sudut gelap…) Hantu Portal merampas suara Nyonya Portal serta 5 kata tanya (Who, What, Where, When, Why) dan mengurung Peri Suaranya di penjara tersembunyi!',
      },
      {
        speakerName: 'Misi Gua Portal',
        speakerRole: 'Petunjuk Penjaga Gua',
        textEn: 'Open all 5 doors to recover every question word, defeat Hantu Portal to drop the Prison Key, and restore Lady Portal’s voice to reach Lila!',
        textId: 'Buka 5 pintu untuk memulihkan Who hingga Why, kalahkan Hantu Portal untuk meraih Kunci Penjara, lalu bebaskan Peri Suara agar jalan ke Istana & Lila terbuka!',
      },
    ],
    rescueCaptiveEn: 'My voice echoes free again! Let us return to Lady Portal so the royal gate to Lila shines bright!',
    rescueCaptiveId: 'Gema suara suci kembali bebas! Ayo kembali ke Nyonya Portal agar suara beliau pulih dan gerbang menuju Lila terbuka!',
    rescueGuardianEn: 'My voice has returned! Now you may ask me anything, Hoot! All six crown shards are ready—go meet Lila in Istana IELTS!',
    rescueGuardianId: 'Suaraku telah kembali jernih! “Sekarang kamu boleh bertanya apa saja padaku.” Terima kasih, Hoot! Keenam keping mahkota sudah lengkap—temui Lila di Istana IELTS!',
  },
};

export const ZONE_ORDER: ZoneId[] = [
  'desa_sapaan',
  'pasar_rasa',
  'hutan_satwa',
  'gerbang_kota',
  'menara_waktu',
  'gua_portal',
];

export const ZONE_INFO: Record<
  ZoneId,
  {
    order: number;
    name: string;
    subtitle: string;
    x: number;
    z: number;
    badgeColor: string;
    conflict: string;
  }
> = {
  desa_sapaan: {
    order: 0,
    name: 'Desa Sapaan',
    subtitle: 'Salam, Angka, Warna, Keluarga & Tubuh',
    x: OVERWORLD_ANCHORS.zones.desa_sapaan.x,
    z: OVERWORLD_ANCHORS.zones.desa_sapaan.z,
    badgeColor: '#f59e0b',
    conflict: 'Desa membisu karena kehilangan kata sapaan; cucu Kakek Sapa, Rani, bersembunyi ketakutan di balik pintu rumahnya.',
  },
  pasar_rasa: {
    order: 1,
    name: 'Pasar Rasa',
    subtitle: 'Makanan, Minuman, Pakaian & Belanja',
    x: OVERWORLD_ANCHORS.zones.pasar_rasa.x,
    z: OVERWORLD_ANCHORS.zones.pasar_rasa.z,
    badgeColor: '#ef4444',
    conflict: 'Kabut kecokelatan menghapus buku resep; Koki Mimi & warga kelaparan dan Mama jatuh sakit.',
  },
  hutan_satwa: {
    order: 2,
    name: 'Hutan Satwa',
    subtitle: 'Hewan, Alam, Cuaca & Hobi',
    x: OVERWORLD_ANCHORS.zones.hutan_satwa.x,
    z: OVERWORLD_ANCHORS.zones.hutan_satwa.z,
    badgeColor: '#10b981',
    conflict: 'Kabut hijau gelap membuat rimba sunyi; semak berduri mengikat hewan-hewan dan adik Rimba bernama Kiki.',
  },
  gerbang_kota: {
    order: 3,
    name: 'Gerbang Kota',
    subtitle: 'Rumah, Sekolah, Pekerjaan, Kota & Transportasi',
    x: OVERWORLD_ANCHORS.zones.gerbang_kota.x,
    z: OVERWORLD_ANCHORS.zones.gerbang_kota.z,
    badgeColor: '#3b82f6',
    conflict: 'Kabut biru kelabu membekukan lalu lintas; Penjaga Gerbang lupa kata rahasia saat putrinya Dewi tersesat di dekat sekolah.',
  },
  menara_waktu: {
    order: 4,
    name: 'Menara Waktu',
    subtitle: 'Waktu, Kata Kerja, Kata Sifat & Keterangan',
    x: OVERWORLD_ANCHORS.zones.menara_waktu.x,
    z: OVERWORLD_ANCHORS.zones.menara_waktu.z,
    badgeColor: '#8b5cf6',
    conflict: 'Kabut kuning membekukan waktu di pukul tujuh; Penjaga Waktu menyesal belum berpamitan pada muridnya.',
  },
  gua_portal: {
    order: 5,
    name: 'Gua Portal',
    subtitle: 'Tanya, Sambung, Ganti, Dasar & Persiapan IELTS',
    x: OVERWORLD_ANCHORS.zones.gua_portal.x,
    z: OVERWORLD_ANCHORS.zones.gua_portal.z,
    badgeColor: '#a855f7',
    conflict: 'Bayangan ungu merenggut suara Nyonya Portal dan lima kata tanya (Who, What, Where, When, Why).',
  },
};

// 5 Mission Doors inside each 3D Zone Dungeon (exact names & modes from Bab 6!)
const DOOR_POSITIONS: Array<[number, number]> = [
  [-14, 7],   // Door 0: Kartu Kilat
  [-14, -6],  // Door 1: Duel Rebutan
  [14, 7],    // Door 2: Telinga Tajam
  [14, -6],   // Door 3: Jago Ejaan
  [0, -15.5], // Door 4: Pasang Kartu -> Spawns 3-Phase Zone Boss!
];

export const ZONE_DOORS: Record<ZoneId, DoorDef[]> = {
  desa_sapaan: [
    { index: 0, id: 'desa_d0', name: 'Sumur Tua', mode: 'cards', modeLabel: 'Kartu Kilat', x: DOOR_POSITIONS[0][0], z: DOOR_POSITIONS[0][1], minPct: 0 },
    { index: 1, id: 'desa_d1', name: 'Jembatan Batu', mode: 'duel', modeLabel: 'Duel Rebutan (Gumpal Kecil)', x: DOOR_POSITIONS[1][0], z: DOOR_POSITIONS[1][1], minPct: 0 },
    { index: 2, id: 'desa_d2', name: 'Lumbung', mode: 'listen', modeLabel: 'Telinga Tajam', x: DOOR_POSITIONS[2][0], z: DOOR_POSITIONS[2][1], minPct: 60 },
    { index: 3, id: 'desa_d3', name: 'Parit', mode: 'type', modeLabel: 'Jago Ejaan', x: DOOR_POSITIONS[3][0], z: DOOR_POSITIONS[3][1], minPct: 60 },
    { index: 4, id: 'desa_d4', name: 'Rumah Rani', mode: 'match', modeLabel: 'Pasang Kartu → Bos', x: DOOR_POSITIONS[4][0], z: DOOR_POSITIONS[4][1], minPct: 60 },
  ],
  pasar_rasa: [
    { index: 0, id: 'pasar_d0', name: 'Panci Bening', mode: 'cards', modeLabel: 'Kartu Kilat', x: DOOR_POSITIONS[0][0], z: DOOR_POSITIONS[0][1], minPct: 0 },
    { index: 1, id: 'pasar_d1', name: 'Lorong Lapak', mode: 'duel', modeLabel: 'Duel Rebutan (Lendir Kecil)', x: DOOR_POSITIONS[1][0], z: DOOR_POSITIONS[1][1], minPct: 0 },
    { index: 2, id: 'pasar_d2', name: 'Gudang Bawah', mode: 'listen', modeLabel: 'Telinga Tajam', x: DOOR_POSITIONS[2][0], z: DOOR_POSITIONS[2][1], minPct: 60 },
    { index: 3, id: 'pasar_d3', name: 'Sungai Kuah', mode: 'type', modeLabel: 'Jago Ejaan', x: DOOR_POSITIONS[3][0], z: DOOR_POSITIONS[3][1], minPct: 60 },
    { index: 4, id: 'pasar_d4', name: 'Lemari Bumbu', mode: 'match', modeLabel: 'Pasang Kartu → Bos', x: DOOR_POSITIONS[4][0], z: DOOR_POSITIONS[4][1], minPct: 60 },
  ],
  hutan_satwa: [
    { index: 0, id: 'satwa_d0', name: 'Genangan', mode: 'cards', modeLabel: 'Kartu Kilat', x: DOOR_POSITIONS[0][0], z: DOOR_POSITIONS[0][1], minPct: 0 },
    { index: 1, id: 'satwa_d1', name: 'Jalur Semak', mode: 'duel', modeLabel: 'Duel Rebutan (Semak Kecil)', x: DOOR_POSITIONS[1][0], z: DOOR_POSITIONS[1][1], minPct: 0 },
    { index: 2, id: 'satwa_d2', name: 'Ceruk Pohon', mode: 'listen', modeLabel: 'Telinga Tajam', x: DOOR_POSITIONS[2][0], z: DOOR_POSITIONS[2][1], minPct: 60 },
    { index: 3, id: 'satwa_d3', name: 'Batang Tumbang', mode: 'type', modeLabel: 'Jago Ejaan', x: DOOR_POSITIONS[3][0], z: DOOR_POSITIONS[3][1], minPct: 60 },
    { index: 4, id: 'satwa_d4', name: 'Akar Berpola', mode: 'match', modeLabel: 'Pasang Kartu → Bos', x: DOOR_POSITIONS[4][0], z: DOOR_POSITIONS[4][1], minPct: 60 },
  ],
  gerbang_kota: [
    { index: 0, id: 'kota_d0', name: 'Papan Peta', mode: 'cards', modeLabel: 'Kartu Kilat', x: DOOR_POSITIONS[0][0], z: DOOR_POSITIONS[0][1], minPct: 0 },
    { index: 1, id: 'kota_d1', name: 'Jalan Bus', mode: 'duel', modeLabel: 'Duel Rebutan (Bayangan Kecil)', x: DOOR_POSITIONS[1][0], z: DOOR_POSITIONS[1][1], minPct: 0 },
    { index: 2, id: 'kota_d2', name: 'Terowongan', mode: 'listen', modeLabel: 'Telinga Tajam', x: DOOR_POSITIONS[2][0], z: DOOR_POSITIONS[2][1], minPct: 60 },
    { index: 3, id: 'kota_d3', name: 'Titian Layang', mode: 'type', modeLabel: 'Jago Ejaan', x: DOOR_POSITIONS[3][0], z: DOOR_POSITIONS[3][1], minPct: 60 },
    { index: 4, id: 'kota_d4', name: 'Pintu Sekolah', mode: 'match', modeLabel: 'Pasang Kartu → Bos', x: DOOR_POSITIONS[4][0], z: DOOR_POSITIONS[4][1], minPct: 60 },
  ],
  menara_waktu: [
    { index: 0, id: 'waktu_d0', name: 'Permukaan Jam', mode: 'cards', modeLabel: 'Kartu Kilat', x: DOOR_POSITIONS[0][0], z: DOOR_POSITIONS[0][1], minPct: 0 },
    { index: 1, id: 'waktu_d1', name: 'Lorong Roda', mode: 'duel', modeLabel: 'Duel Rebutan (Jam Pasir Kecil)', x: DOOR_POSITIONS[1][0], z: DOOR_POSITIONS[1][1], minPct: 0 },
    { index: 2, id: 'waktu_d2', name: 'Ruang Lonceng', mode: 'listen', modeLabel: 'Telinga Tajam', x: DOOR_POSITIONS[2][0], z: DOOR_POSITIONS[2][1], minPct: 60 },
    { index: 3, id: 'waktu_d3', name: 'Bandul Panjang', mode: 'type', modeLabel: 'Jago Ejaan', x: DOOR_POSITIONS[3][0], z: DOOR_POSITIONS[3][1], minPct: 60 },
    { index: 4, id: 'waktu_d4', name: 'Pintu Jam', mode: 'match', modeLabel: 'Pasang Kartu → Bos', x: DOOR_POSITIONS[4][0], z: DOOR_POSITIONS[4][1], minPct: 60 },
  ],
  gua_portal: [
    { index: 0, id: 'gua_d0', name: 'Kolam Ingatan', mode: 'cards', modeLabel: 'Kartu Kilat', x: DOOR_POSITIONS[0][0], z: DOOR_POSITIONS[0][1], minPct: 0 },
    { index: 1, id: 'gua_d1', name: 'Lorong Kilat', mode: 'duel', modeLabel: 'Duel Rebutan (Bayangan Kilat 4 HP)', x: DOOR_POSITIONS[1][0], z: DOOR_POSITIONS[1][1], minPct: 0 },
    { index: 2, id: 'gua_d2', name: 'Lorong Gema', mode: 'listen', modeLabel: 'Telinga Tajam', x: DOOR_POSITIONS[2][0], z: DOOR_POSITIONS[2][1], minPct: 60 },
    { index: 3, id: 'gua_d3', name: 'Jembatan Huruf', mode: 'type', modeLabel: 'Jago Ejaan', x: DOOR_POSITIONS[3][0], z: DOOR_POSITIONS[3][1], minPct: 60 },
    { index: 4, id: 'gua_d4', name: 'Pintu Teka-Teki', mode: 'match', modeLabel: 'Pasang Kartu → Bos', x: DOOR_POSITIONS[4][0], z: DOOR_POSITIONS[4][1], minPct: 60 },
  ],
};

export const DOOR_MINI_MONSTER: Record<ZoneId, { name: string; hp: number; type: MonsterSpawnDef['type'] }> = {
  desa_sapaan: { name: 'Gumpal Kecil', hp: 3, type: 'gumpal_salam' },
  pasar_rasa: { name: 'Lendir Kecil', hp: 3, type: 'bayangan_kata' },
  hutan_satwa: { name: 'Semak Kecil', hp: 3, type: 'semak_rimba' },
  gerbang_kota: { name: 'Bayangan Kecil', hp: 3, type: 'bayangan_kata' },
  menara_waktu: { name: 'Jam Pasir Kecil', hp: 3, type: 'jam_pasir' },
  gua_portal: { name: 'Bayangan Kilat', hp: 4, type: 'ksatria_ielts' },
};

export const BOSSES: Record<ZoneId, BossDef> = {
  desa_sapaan: {
    id: 'boss_desa',
    name: 'Gumpal Salam',
    monsterType: 'gumpal_salam',
    zoneId: 'desa_sapaan',
    phases: 3,
    hpPerPhase: 10,
    mechanic: 'none',
    mechanicDesc: 'Eskalasi tempo antar fase. Kalahkan 3 fase untuk menyelamatkan Rani!',
    taunts: [
      'Gumpal Salam menghalangi Rumah Rani!',
      'Fase 2: Gumpal Salam bergetar lebih cepat!',
      'Fase 3: Serangan salam terakhir! Jangan menyerah!',
    ],
    rewardRelic: 'pedang',
    rewardWeapon: 'emas',
    rewardRibbon: 'Pita Salam Desa',
  },
  pasar_rasa: {
    id: 'boss_pasar',
    name: 'Lendir Kuali',
    monsterType: 'bayangan_kata',
    zoneId: 'pasar_rasa',
    phases: 3,
    hpPerPhase: 10,
    mechanic: 'slime',
    mechanicDesc: 'Fase 2–3: Peluang 55% melumuri 1 pilihan salah menjadi 🟢 ???.',
    taunts: [
      'Lendir Kuali mendidih di tengah pasar!',
      'Fase 2: Lendir mulai menyamarkan pilihan jawaban!',
      'Fase 3: Kuali meluap! Pilih arti yang benar dengan cermat!',
    ],
    rewardRelic: 'perisai',
    rewardWeapon: 'saus',
    rewardRibbon: 'Pita Dapur Rasa',
  },
  hutan_satwa: {
    id: 'boss_satwa',
    name: 'Semak Gigit',
    monsterType: 'semak_rimba',
    zoneId: 'hutan_satwa',
    phases: 3,
    hpPerPhase: 10,
    mechanic: 'grow',
    mechanicDesc: 'Fase 2–3: Jawaban salah memulihkan HP bos +1 (maks 2x/fase).',
    taunts: [
      'Semak Gigit menjerat akar-akar Hutan Satwa!',
      'Fase 2: Akarnya tumbuh lagi setiap kali kamu salah!',
      'Fase 3: Rimba berguncang! Taklukkan akar terakhir!',
    ],
    rewardRelic: 'peluit',
    rewardWeapon: 'biji',
    rewardRibbon: 'Pita Rimba Hijau',
  },
  gerbang_kota: {
    id: 'boss_kota',
    name: 'Bayangan Gerbang',
    monsterType: 'ksatria_ielts',
    zoneId: 'gerbang_kota',
    phases: 3,
    hpPerPhase: 10,
    mechanic: 'close',
    mechanicDesc: 'Fase 2–3: Tiap 2 putaran mengunci 1 opsi 🔒 & memangkas waktu AMBIL -1 dtk.',
    taunts: [
      'Bayangan Gerbang mengunci Pintu Sekolah!',
      'Fase 2: Gerbang menyempit! Waktu reaksi berkurang!',
      'Fase 3: Bayangan terakhir menuju kota!',
    ],
    rewardRelic: 'sepatu',
    rewardWeapon: 'kertas',
    rewardRibbon: 'Pita Gerbang Kota',
  },
  menara_waktu: {
    id: 'boss_waktu',
    name: 'Jam Pasir Liar',
    monsterType: 'jam_pasir',
    zoneId: 'menara_waktu',
    phases: 3,
    hpPerPhase: 10,
    mechanic: 'rewind',
    mechanicDesc: 'Fase 2–3: Tiap 2 soal baru memutar ulang soal sebelumnya!',
    taunts: [
      'Jam Pasir Liar membekukan jarum jam menara!',
      'Fase 2: Waktu berputar balik! Ingat soal yang baru saja muncul!',
      'Fase 3: Dentang terakhir pukul tujuh!',
    ],
    rewardRelic: 'jam',
    rewardWeapon: 'jarum',
    rewardRibbon: 'Pita Menara Waktu',
  },
  gua_portal: {
    id: 'boss_gua',
    name: 'Hantu Portal',
    monsterType: 'ksatria_ielts',
    zoneId: 'gua_portal',
    phases: 3,
    hpPerPhase: 10,
    mechanic: 'none',
    mechanicDesc: 'Penjaga tekateki terakhir sebelum gerbang Istana IELTS terbuka!',
    taunts: [
      'Hantu Portal membisikkan kata tanya di kegelapan gua!',
      'Fase 2: Gema gua semakin kuat! Gunakan kata sambungmu!',
      'Fase 3: Taklukkan Hantu Portal untuk Mahkota ke-6!',
    ],
    rewardRelic: 'kompas',
    rewardWeapon: 'kristal',
    rewardRibbon: 'Pita Gua Portal',
  },
};

export const NPC_CATALOG: NpcDefinition[] = [
  {
    id: 'npc_tetua',
    name: 'Kakek Sapa',
    title: 'Sesepuh Desa Sapaan · Village Elder (Babak 1)',
    zoneId: 'desa_sapaan',
    zoneName: 'Desa Sapaan',
    x: OVERWORLD_ANCHORS.npcs.npc_tetua.x,
    z: OVERWORLD_ANCHORS.npcs.npc_tetua.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_tetua.rotY,
    storyLine1En: 'G-good... morning... All doors lost their greeting words, and my granddaughter Rani is hiding in fear behind her door!',
    storyLine1Id: 'S-selamat… pa-pagi… Desa ini sunyi membisu karena semua pintunya kehilangan kata sapaan, dan cucuku Rani ketakutan di balik pintu rumahnya!',
    storyLine2En: 'Restore Hello, Hi, Good morning, Thank you, and Goodbye across 5 doors, then defeat Gumpal Salam!',
    storyLine2Id: 'Pulihkan kata Hello, Hi, Good morning, Thank you, & Goodbye di 5 pintu desa, lalu kalahkan Gumpal Salam di depan rumah Rani!',
    thanksId: 'Rani berlari memeluk kakeknya! Kakek Sapa berpesan: "Sapalah dulu. Itulah pedang yang sebenarnya."',
    speechBubble: 'Sapalah dulu!',
    enterLabel: 'Masuk ke Desa Sapaan',
    questTitle: 'Bebaskan Desa Sapaan & Selamatkan Rani',
    questType: 'liberate_zone',
    questTarget: 1,
    rewardXp: 150,
    rewardDiamonds: 5,
    accentColor: '#f59e0b',
    archetypeId: 'village_elder',
    demographicLabel: 'Tua · Laki-laki · Sesepuh',
    habitSummary: 'Bertumpu tongkat kayu & menyapa warga desa',
    skillSummary: 'Kebijaksanaan sejarah & sastra sapaan',
    stats: { hp: 110, atk: 18, nrg: 140 },
  },
  {
    id: 'npc_koki',
    name: 'Koki Mimi',
    title: 'Juru Masak Pastri · Pastry Chef (Babak 2)',
    zoneId: 'pasar_rasa',
    zoneName: 'Pasar Rasa',
    x: OVERWORLD_ANCHORS.npcs.npc_koki.x,
    z: OVERWORLD_ANCHORS.npcs.npc_koki.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_koki.rotY,
    storyLine1En: 'Our spice market is starving under brown mist! The recipe book vanished, Mama fell ill, and I cannot even say rice, soup, or tea...',
    storyLine1Id: 'Pasar kuliner kelaparan di balik kabut kecokelatan! Buku resep hilang, Mama jatuh sakit, dan aku tak sanggup mengucapkan rice, soup, maupun tea.',
    storyLine2En: 'Open all 5 market doors to bring back Rice, Soup, Tea, Vegetables, & Fruit, then defeat Lendir Kuali!',
    storyLine2Id: 'Buka 5 pintu dapur untuk mengembalikan bahan makanan ke rak dan taklukkan raksasa Lendir Kuali di balik lemari bumbu!',
    thanksId: 'Sup hangat kembali mengepul dan Mama tersenyum sembuh! Koki Mimi berkata: "Makan dulu. Baru bertarung."',
    speechBubble: 'Resep kami hilang!',
    enterLabel: 'Masuk ke Pasar Rasa',
    questTitle: 'Pulihkan Resep & Obati Mama',
    questType: 'liberate_zone',
    questTarget: 1,
    rewardXp: 180,
    rewardDiamonds: 5,
    accentColor: '#ef4444',
    archetypeId: 'pastry_chef',
    demographicLabel: 'Muda · Perempuan Berhijab · Koki',
    habitSummary: 'Memanggang roti & menyajikan nampan kue',
    skillSummary: 'Seni pastri & resep kerajaan',
    stats: { hp: 100, atk: 10, nrg: 130 },
  },
  {
    id: 'npc_rubah',
    name: 'Ranger Rimba',
    title: 'Pemandu Hutan Satwa · Ranger Guide (Babak 3)',
    zoneId: 'hutan_satwa',
    zoneName: 'Hutan Satwa',
    x: OVERWORLD_ANCHORS.npcs.npc_rubah.x,
    z: OVERWORLD_ANCHORS.npcs.npc_rubah.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_rubah.rotY,
    storyLine1En: 'The woods are too quiet! Living thorny bushes bite and tie up the animals—including my little sibling Kiki who ran into the thicket!',
    storyLine1Id: 'Rimba terlalu sunyi! Semak berduri hidup menggigit dan mengikat para hewan—termasuk adikku Kiki yang lari ke dalam belukar. Teropongku menemukan jejak mereka, tapi akarnya terlalu kuat!',
    storyLine2En: 'Free Bird, Fish, Rabbit, Deer, and Butterfly through the 5 doors and defeat Semak Gigit at Akar Berpola!',
    storyLine2Id: 'Bebaskan satwa lewat 5 pintu agar hewan hutan ikut menjagamu, lalu tumbangkan Semak Gigit di depan Akar Berpola!',
    thanksId: 'Kiki melompat ke pelukan Ranger Rimba! Ia berbisik: "Adikmu lewat di sini. Ia berjalan dengan pita merah. Ia pemberani."',
    speechBubble: 'Tolong Kiki & Satwa!',
    enterLabel: 'Masuk ke Hutan Satwa',
    questTitle: 'Bebaskan Satwa & Temukan Kiki',
    questType: 'liberate_zone',
    questTarget: 1,
    rewardXp: 220,
    rewardDiamonds: 6,
    accentColor: '#10b981',
    archetypeId: 'ranger_guide',
    demographicLabel: 'Dewasa · Laki-laki · Pemandu Hutan',
    habitSummary: 'Meneropong rimba dengan ransel ekspedisi',
    skillSummary: 'Navigasi hutan & pelestarian satwa',
    stats: { hp: 150, atk: 25, nrg: 160 },
  },
  {
    id: 'npc_penjaga',
    name: 'Pak Polisi Gerbang',
    title: 'Petugas Kota · City Policeman (Babak 4)',
    zoneId: 'gerbang_kota',
    zoneName: 'Gerbang Kota',
    x: OVERWORLD_ANCHORS.npcs.npc_penjaga.x,
    z: OVERWORLD_ANCHORS.npcs.npc_penjaga.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_penjaga.rotY,
    storyLine1En: 'Gray-blue mist froze city traffic! I forgot the secret word to open the gate, and my daughter Dewi is lost near the brick school—yet I cannot leave my post!',
    storyLine1Id: 'Kabut biru kelabu menghentikan lalu lintas kota! Aku lupa kata rahasia gerbang, sementara putriku Dewi tersesat di dekat sekolah dan aku tak boleh meninggalkan pos patroli!',
    storyLine2En: 'Restore Home, School, Office, Market, and Station so workers remember their duties, then banish Bayangan Gerbang!',
    storyLine2Id: 'Pulihkan kata tempat & profesi agar para pekerja ingat tugasnya, lalu kalahkan Bayangan Gerbang di depan Pintu Sekolah!',
    thanksId: 'Dewi berlari menyeberang jalan memeluk ayahnya! Pak Polisi Gerbang berseru: "Buka. Itulah katanya. Terima kasih!"',
    speechBubble: 'Dewi terjebak!',
    enterLabel: 'Masuk ke Gerbang Kota',
    questTitle: 'Buka Gerbang & Selamatkan Dewi',
    questType: 'liberate_zone',
    questTarget: 1,
    rewardXp: 240,
    rewardDiamonds: 7,
    accentColor: '#3b82f6',
    archetypeId: 'city_policeman',
    demographicLabel: 'Dewasa · Laki-laki · Polisi Kota',
    habitSummary: 'Mengatur lalu lintas & patroli gerbang kota',
    skillSummary: 'Disiplin lalu lintas & investigasi',
    stats: { hp: 180, atk: 35, nrg: 150 },
  },
  {
    id: 'npc_penyihir',
    name: 'Pembuat Jam',
    title: 'Ahli Menara Waktu · Clockmaker (Babak 5)',
    zoneId: 'menara_waktu',
    zoneName: 'Menara Waktu',
    x: OVERWORLD_ANCHORS.npcs.npc_penyihir.x,
    z: OVERWORLD_ANCHORS.npcs.npc_penyihir.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_penyihir.rotY,
    storyLine1En: 'Look at my golden pocket watch: Seven o’clock... Yesterday my beloved student left before I could say goodbye, and all the clocktower gears froze at seven!',
    storyLine1Id: 'Lihat arloji saku emasku: Pukul tujuh… Kemarin murid kesayanganku pergi sebelum aku sempat berpamitan, dan seluruh roda gigi menara membeku di pukul tujuh!',
    storyLine2En: 'Advance the clock from Seven to Eleven across 5 doors and shatter Jam Pasir Liar at Pintu Jam!',
    storyLine2Id: 'Majukan jarum jam selangkah demi selangkah (Seven → Eleven) lewat 5 pintu dan hancurkan Jam Pasir Liar di Pintu Jam!',
    thanksId: 'Lonceng pukul dua belas berdentang! Pembuat Jam berbisik lega: "Selamat tinggal, muridku. Sekarang aku bisa mengatakannya."',
    speechBubble: 'Pukul tujuh terus...',
    enterLabel: 'Masuk ke Menara Waktu',
    questTitle: 'Alirkan Waktu & Kalahkan Jam Pasir Liar',
    questType: 'liberate_zone',
    questTarget: 1,
    rewardXp: 280,
    rewardDiamonds: 8,
    accentColor: '#8b5cf6',
    archetypeId: 'clockmaker',
    demographicLabel: 'Tua · Laki-laki · Ahli Jam',
    habitSummary: 'Menyetel arloji saku emas & roda menara',
    skillSummary: 'Mekanika waktu & presisi jam',
    stats: { hp: 100, atk: 12, nrg: 130 },
  },
  {
    id: 'npc_portal',
    name: 'Nyonya Portal',
    title: 'Cendekiawan Kristal · Crystal Scholar (Babak 6)',
    zoneId: 'gua_portal',
    zoneName: 'Gua Portal',
    x: OVERWORLD_ANCHORS.npcs.npc_portal.x,
    z: OVERWORLD_ANCHORS.npcs.npc_portal.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_portal.rotY,
    storyLine1En: '(Her lips move silently without a sound...) Hantu Portal stole my voice and all five question words from my ancient scroll: Who, What, Where, When, Why!',
    storyLine1Id: '(Bibirnya bergerak tanpa suara...) Lima kata tanya dari gulungan prasastiku—Who, What, Where, When, Why—telah direnggut Hantu Portal yang menyegel pintu ke istana!',
    storyLine2En: 'Recover all 5 question words in the crystal cave and defeat Hantu Portal to win the 6th Crown Shard and meet Lila!',
    storyLine2Id: 'Pulihkan 5 kata tanya di gua kristal ini dan kalahkan bos terakhir Hantu Portal untuk meraih Pecahan Mahkota ke-6 & menyusul Lila!',
    thanksId: 'Suara Nyonya Portal kembali! "Sekarang kamu boleh bertanya apa saja padaku!" Jalan menuju puncak kerajaan pun kembali terang!',
    speechBubble: '... (Tak bersuara)',
    enterLabel: 'Masuk ke Gua Portal',
    questTitle: 'Pulihkan Suara & Pecahan Mahkota ke-6',
    questType: 'liberate_zone',
    questTarget: 1,
    rewardXp: 350,
    rewardDiamonds: 10,
    accentColor: '#a855f7',
    archetypeId: 'crystal_scholar',
    demographicLabel: 'Dewasa · Perempuan Berhijab · Peneliti',
    habitSummary: 'Membaca gulungan prasasti di gua kristal',
    skillSummary: 'Arkeologi kata tanya & energi kristal',
    stats: { hp: 150, atk: 30, nrg: 200 },
  },
];

// Academy NPCs inside Istana IELTS 3D Hall (Epilog Kerajaan)
export const ACADEMY_NPCS: NpcDefinition[] = [
  {
    id: 'npc_sera',
    name: 'Dekan Sera',
    title: 'Dekan IELTS · Listening (4 Bagian / 20 Soal)',
    zoneId: 'akademi',
    zoneName: 'Istana IELTS',
    x: -13,
    z: -6,
    rotationY: 0.7,
    storyLine1En: 'Welcome to the Listening Wing! Now that all 6 regions can hear and speak again, test your ears on English dialogues.',
    storyLine1Id: 'Selamat datang di Sayap Listening! Setelah keenam wilayah kembali bersuara, uji ketajaman pendengaranmu pada dialog Bahasa Inggris.',
    storyLine2En: 'Reach 70% or higher to earn the Listening Pass and bonus XP.',
    storyLine2Id: 'Raih minimal 70% untuk Lulus Listening Istana dan bonus XP.',
    thanksId: 'Telingamu sangat tajam!',
    speechBubble: 'Listening Test',
    enterLabel: 'Mulai Ujian Listening',
    questTitle: 'Ujian Listening',
    questType: 'ielts_trial',
    questTarget: 1,
    rewardXp: 40,
    rewardDiamonds: 2,
    accentColor: '#0ea5e9',
    academySkill: 'listening',
    archetypeId: 'ielts_dean',
    demographicLabel: 'Tua · Perempuan Berhijab · Dekan',
    stats: { hp: 180, atk: 20, nrg: 220 },
  },
  {
    id: 'npc_bima',
    name: 'Penguji Bima',
    title: 'Penguji Istana · Reading (Academic & General)',
    zoneId: 'akademi',
    zoneName: 'Istana IELTS',
    x: 13,
    z: -6,
    rotationY: -0.7,
    storyLine1En: 'Choose Academic or General Training passages and master True/False/Not Given!',
    storyLine1Id: 'Pilih jalur Academic atau General Training dan buktikan ketelitianmu menjawab True/False/Not Given!',
    storyLine2En: 'Read carefully for details, main ideas, and writer claims.',
    storyLine2Id: 'Baca dengan teliti gagasan utama dan detail bacaan kerajaan.',
    thanksId: 'Pemahaman bacamu luar biasa!',
    speechBubble: 'Reading Test',
    enterLabel: 'Mulai Ujian Reading',
    questTitle: 'Ujian Reading',
    questType: 'ielts_trial',
    questTarget: 1,
    rewardXp: 40,
    rewardDiamonds: 2,
    accentColor: '#10b981',
    academySkill: 'reading',
    archetypeId: 'clockmaker',
    demographicLabel: 'Tua · Laki-laki · Ahli Teks',
    stats: { hp: 100, atk: 12, nrg: 130 },
  },
  {
    id: 'npc_ayu',
    name: 'Ibu Guru Ayu',
    title: 'Penguji Istana · Writing (Task 1 & Task 2)',
    zoneId: 'akademi',
    zoneName: 'Istana IELTS',
    x: -13,
    z: 8,
    rotationY: 2.3,
    storyLine1En: 'Craft coherent paragraphs using linking connectors like However, Therefore, and Although!',
    storyLine1Id: 'Rangkai kembali kata-kata Bahasa Inggris menjadi paragraf utuh memakai kata penghubung seperti However, Therefore, dan Although!',
    storyLine2En: 'Our analyzer checks word count, connectors, and paragraph structure.',
    storyLine2Id: 'Penilai otomatis akan memeriksa jumlah kata, kata penghubung, dan struktur paragraf.',
    thanksId: 'Tulisanmu sangat terstruktur!',
    speechBubble: 'Writing Task',
    enterLabel: 'Mulai Ujian Writing',
    questTitle: 'Ujian Writing',
    questType: 'ielts_trial',
    questTarget: 1,
    rewardXp: 40,
    rewardDiamonds: 2,
    accentColor: '#f59e0b',
    academySkill: 'writing',
    archetypeId: 'school_teacher',
    demographicLabel: 'Dewasa · Perempuan Berhijab · Pengajar',
    stats: { hp: 130, atk: 15, nrg: 170 },
  },
  {
    id: 'npc_rangga',
    name: 'Penguji Rangga',
    title: 'Penguji Istana · Speaking (3 Bagian / 7 Prompt)',
    zoneId: 'akademi',
    zoneName: 'Istana IELTS',
    x: 13,
    z: 8,
    rotationY: -2.3,
    storyLine1En: 'Speak clearly into your microphone across Part 1 Intro, Cue Card, and Discussion!',
    storyLine1Id: 'Bicaralah dengan berani dan jelas pada Bagian 1 Intro, Kartu Topik (Cue Card), dan Diskusi!',
    storyLine2En: 'Practice with preparation timers and compare with model answers.',
    storyLine2Id: 'Berlatihlah dengan timer persiapan & bicara serta contoh jawaban model.',
    thanksId: 'Keberanian bicaramu sangat mengesankan!',
    speechBubble: 'Speaking Test',
    enterLabel: 'Mulai Ujian Speaking',
    questTitle: 'Ujian Speaking',
    questType: 'ielts_trial',
    questTarget: 1,
    rewardXp: 40,
    rewardDiamonds: 2,
    accentColor: '#ec4899',
    academySkill: 'speaking',
    archetypeId: 'ranger_guide',
    demographicLabel: 'Dewasa · Laki-laki · Penguji',
    stats: { hp: 150, atk: 25, nrg: 160 },
  },
  {
    id: 'npc_raja_penguji',
    name: 'Raja Aksara (Penjaga Kuil)',
    title: 'Penguji Agung · Ujian Lengkap Istana IELTS',
    zoneId: 'akademi',
    zoneName: 'Istana IELTS',
    x: 0,
    z: -14,
    rotationY: 0,
    storyLine1En: 'Brave Hoot! Lila is safe by my side, and all six crown shards are whole again! Ready for the Full Royal IELTS Trial?',
    storyLine1Id: 'Hoot yang pemberani! Adikmu Lila kini aman bersamaku, dan keenam keping mahkota telah bersatu kembali! Siap menghadapi Ujian Lengkap Istana IELTS?',
    storyLine2En: 'Complete Listening, Reading, Writing, and Speaking consecutively to prove true mastery of English communication!',
    storyLine2Id: 'Selesaikan Listening, Reading, Writing, dan Speaking berurutan untuk membuktikan penguasaan komunikasi sejati!',
    thanksId: 'Selamat, Penyelamat Kerajaan Kata & Lulusan Agung Istana IELTS!',
    speechBubble: 'Lila menantimu! Full Test!',
    enterLabel: 'Mulai Full Test (4 Sesi)',
    questTitle: 'Full Test Istana IELTS',
    questType: 'ielts_trial',
    questTarget: 1,
    rewardXp: 300,
    rewardDiamonds: 10,
    accentColor: '#7c3aed',
    academySkill: 'full',
    archetypeId: 'temple_guardian',
    demographicLabel: 'Tua · Laki-laki · Penjaga Kuil',
    stats: { hp: 220, atk: 50, nrg: 180 },
  },
  {
    id: 'npc_exit_academy',
    name: 'Penjaga Portal',
    title: 'Gerbang Kembali ke Hutan Kata',
    zoneId: 'akademi',
    zoneName: 'Istana IELTS',
    x: 0,
    z: 16,
    rotationY: Math.PI,
    storyLine1En: 'Whenever you wish to sharpen your vocabulary back in Hutan Kata, step through this gate.',
    storyLine1Id: 'Jika suatu saat kamu ingin mengulang atau mengasah kata-katamu lagi di Hutan Kata, lewati gerbang ini.',
    storyLine2En: 'Safe travels, hero Hoot!',
    storyLine2Id: 'Selamat jalan, pahlawan Hoot!',
    thanksId: 'Sampai jumpa lagi!',
    speechBubble: 'Kembali ke Hutan Kata',
    enterLabel: 'Kembali ke Hutan Kata',
    questTitle: 'Keluar Istana',
    questType: 'ielts_trial',
    questTarget: 1,
    rewardXp: 0,
    rewardDiamonds: 0,
    accentColor: '#06b6d4',
    academySkill: 'exit',
    archetypeId: 'temple_guardian',
    demographicLabel: 'Tua · Laki-laki · Penjaga Gerbang',
    stats: { hp: 220, atk: 50, nrg: 180 },
  },
];

// Overworld roaming monsters (scaled dynamically by DIFF_CONFIG[diff].roamingCount)
export const MONSTER_SPAWNS: MonsterSpawnDef[] = [
  { id: 'm_gumpal_1', type: 'gumpal_salam', name: 'Gumpal Salam', zoneId: 'desa_sapaan', x: -14, z: 10, maxHp: 3, rewardXp: 30, rewardDiamonds: 1, rewardScore: 220 },
  { id: 'm_bayangan_1', type: 'bayangan_kata', name: 'Lendir Liar', zoneId: 'pasar_rasa', x: -14, z: 24, maxHp: 3, rewardXp: 35, rewardDiamonds: 1, rewardScore: 280 },
  { id: 'm_semak_1', type: 'semak_rimba', name: 'Semak Rimba', zoneId: 'hutan_satwa', x: 19, z: 5, maxHp: 3, rewardXp: 40, rewardDiamonds: 1, rewardScore: 300 },
  { id: 'm_gumpal_2', type: 'gumpal_salam', name: 'Bayangan Kota', zoneId: 'gerbang_kota', x: 8, z: 18, maxHp: 3, rewardXp: 40, rewardDiamonds: 1, rewardScore: 240 },
  { id: 'm_jam_1', type: 'jam_pasir', name: 'Jam Pasir Liar', zoneId: 'menara_waktu', x: -13, z: -16, maxHp: 4, rewardXp: 50, rewardDiamonds: 1, rewardScore: 380 },
];

export const ACADEMY_SHADOWS: MonsterSpawnDef[] = [
  { id: 'ae_listen', type: 'bayangan_kata', name: 'Bayangan Dengar', zoneId: 'gua_portal', x: -7, z: -1, maxHp: 3, rewardXp: 45, rewardDiamonds: 1, rewardScore: 300, isAcademyShadow: true, academySkill: 'listening' },
  { id: 'ae_read', type: 'jam_pasir', name: 'Bayangan Baca', zoneId: 'gua_portal', x: 7, z: -1, maxHp: 3, rewardXp: 45, rewardDiamonds: 1, rewardScore: 300, isAcademyShadow: true, academySkill: 'reading' },
  { id: 'ae_write', type: 'semak_rimba', name: 'Bayangan Tulis', zoneId: 'gua_portal', x: -7, z: 5, maxHp: 3, rewardXp: 45, rewardDiamonds: 1, rewardScore: 300, isAcademyShadow: true, academySkill: 'writing' },
  { id: 'ae_speak', type: 'ksatria_ielts', name: 'Bayangan Bicara', zoneId: 'gua_portal', x: 7, z: 5, maxHp: 3, rewardXp: 45, rewardDiamonds: 1, rewardScore: 300, isAcademyShadow: true, academySkill: 'speaking' },
];

// 21 Mini IELTS Questions (MQ) for Academy Shadows (9 TFNG, 6 MCQ, 6 Short/Vocab)
export interface MiniIeltsItem {
  id: string;
  skill: 'listening' | 'reading' | 'writing' | 'speaking';
  kind: 'tfng' | 'mcq' | 'short';
  prompt: string;
  audioWord: string;
  choices: [string, string, string, string];
  correctIndex: number;
  hint: string;
}

export const MINI_IELTS_QUESTIONS: MiniIeltsItem[] = [
  // 9 TFNG
  { id: 'mq_1', skill: 'reading', kind: 'tfng', prompt: 'Teks: "Solar energy is abundant in tropical regions." — Pernyataan: Energi surya sangat langka di daerah tropis.', audioWord: 'Solar energy is abundant in tropical regions.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Partially True'], correctIndex: 1, hint: 'abundant = berlimpah' },
  { id: 'mq_2', skill: 'reading', kind: 'tfng', prompt: 'Teks: "Urban parks reduce city heat by up to 3°C." — Pernyataan: Taman kota membantu mendinginkan suhu kota.', audioWord: 'Urban parks reduce city heat.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Unclear'], correctIndex: 0, hint: 'reduce heat = menurunkan panas' },
  { id: 'mq_3', skill: 'reading', kind: 'tfng', prompt: 'Teks: "The library opens at 8 AM on weekdays." — Pernyataan: Perpustakaan tutup setiap hari Minggu.', audioWord: 'The library opens at 8 AM on weekdays.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Always Open'], correctIndex: 2, hint: 'Tidak disebut jadwal Minggu' },
  { id: 'mq_4', skill: 'reading', kind: 'tfng', prompt: 'Teks: "Electric buses cut air pollution in half." — Pernyataan: Bus listrik mengurangi polusi udara.', audioWord: 'Electric buses cut air pollution.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Doubled'], correctIndex: 0, hint: 'cut pollution = mengurangi polusi' },
  { id: 'mq_5', skill: 'reading', kind: 'tfng', prompt: 'Teks: "Students who sleep 8 hours score higher." — Pernyataan: Mahasiswa yang kurang tidur selalu mendapat nilai A.', audioWord: 'Students who sleep eight hours score higher.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Equal'], correctIndex: 1, hint: 'Tidur cukup memberi skor lebih tinggi' },
  { id: 'mq_6', skill: 'reading', kind: 'tfng', prompt: 'Teks: "Water covers 71% of Earth." — Pernyataan: Sebagian besar permukaan bumi tertutup air.', audioWord: 'Water covers seventy one percent of Earth.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Minority'], correctIndex: 0, hint: '71% = mayoritas permukaan' },
  { id: 'mq_7', skill: 'reading', kind: 'tfng', prompt: 'Teks: "The museum was built in 1920." — Pernyataan: Arsitek museum berasal dari London.', audioWord: 'The museum was built in 1920.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Built in 2020'], correctIndex: 2, hint: 'Asal arsitek tidak disebutkan' },
  { id: 'mq_8', skill: 'reading', kind: 'tfng', prompt: 'Teks: "Resilient learners bounce back from errors." — Pernyataan: Pembelajar tangguh tidak pernah takut belajar dari kesalahan.', audioWord: 'Resilient learners bounce back from errors.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Quit easily'], correctIndex: 0, hint: 'resilient = tangguh' },
  { id: 'mq_9', skill: 'reading', kind: 'tfng', prompt: 'Teks: "Coffee exports rose by 12% last year." — Pernyataan: Ekspor kopi menurun tahun lalu.', audioWord: 'Coffee exports rose by twelve percent.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Unchanged'], correctIndex: 1, hint: 'rose = naik / meningkat' },

  // 6 MCQ
  { id: 'mq_10', skill: 'listening', kind: 'mcq', prompt: 'Listening: "The train leaves from Platform 4 at quarter past nine." Pukul berapa kereta berangkat?', audioWord: 'The train leaves from Platform 4 at quarter past nine.', choices: ['09.15', '09.45', '08.45', '04.09'], correctIndex: 0, hint: 'quarter past nine = 09.15' },
  { id: 'mq_11', skill: 'listening', kind: 'mcq', prompt: 'Listening: "Bring your student card, not your passport, to register." Apa yang harus dibawa?', audioWord: 'Bring your student card, not your passport, to register.', choices: ['Paspor', 'Kartu pelajar', 'KTP', 'Surat izin'], correctIndex: 1, hint: 'student card = kartu pelajar' },
  { id: 'mq_12', skill: 'writing', kind: 'mcq', prompt: 'Writing Connector: "Rain fell heavily; ____, the outdoor match continued." Kata sambung tepat?', audioWord: 'however', choices: ['Therefore', 'However', 'Because', 'Meanwhile'], correctIndex: 1, hint: 'Menunjukkan pertentangan (Namun)' },
  { id: 'mq_13', skill: 'writing', kind: 'mcq', prompt: 'Writing Academic: Sinonim formal paling tepat untuk "help reduce the problem"?', audioWord: 'mitigate', choices: ['mitigate', 'ignore', 'double', 'forget'], correctIndex: 0, hint: 'mitigate = mengurangi dampak buruk' },
  { id: 'mq_14', skill: 'speaking', kind: 'mcq', prompt: 'Speaking Part 2: Apa langkah terbaik selama 1 menit persiapan Cue Card?', audioWord: 'Make brief bullet notes', choices: ['Menghafal esai panjang', 'Membuat poin kata kunci singkat', 'Diam tanpa menulis', 'Membaca kamus'], correctIndex: 1, hint: 'Catat poin 5W+1H' },
  { id: 'mq_15', skill: 'speaking', kind: 'mcq', prompt: 'Speaking Part 3: Frasa terbaik untuk memberi opini seimbang adalah...', audioWord: 'On the one hand', choices: ['No comment', 'On the one hand... on the other hand...', 'Only yes', 'Ask someone else'], correctIndex: 1, hint: 'Menyeimbangkan dua sudut pandang' },

  // 6 Short/Context
  { id: 'mq_16', skill: 'writing', kind: 'short', prompt: 'Lengkapi kolokasi IELTS: "Play a ____ role in education" (peran sangat penting).', audioWord: 'crucial', choices: ['crucial', 'tiny', 'sleepy', 'spicy'], correctIndex: 0, hint: 'crucial = krusial / sangat penting' },
  { id: 'mq_17', skill: 'writing', kind: 'short', prompt: 'Kata penghubung sebab-akibat untuk awal kalimat: "____ of heavy traffic, she arrived late."', audioWord: 'Because', choices: ['Because', 'Although', 'Unless', 'Whereas'], correctIndex: 0, hint: 'Because of + noun' },
  { id: 'mq_18', skill: 'listening', kind: 'short', prompt: 'Listening: "Fee is $40, with a 25% discount for students." Berapa biaya untuk pelajar?', audioWord: 'forty dollars with twenty five percent discount', choices: ['$30', '$35', '$25', '$15'], correctIndex: 0, hint: '40 - 10 = 30' },
  { id: 'mq_19', skill: 'listening', kind: 'short', prompt: 'Listening: "The workshop moved from Room 12 to Room 21." Di ruang mana sekarang?', audioWord: 'Room twenty one', choices: ['Room 12', 'Room 21', 'Room 2', 'Room 10'], correctIndex: 1, hint: 'moved to Room 21' },
  { id: 'mq_20', skill: 'speaking', kind: 'short', prompt: 'Pilih ekspresi paling natural untuk memperluas jawaban Speaking Part 1:', audioWord: 'For instance', choices: ['Yes.', 'No.', 'For instance, every weekend I...', 'Finished.'], correctIndex: 2, hint: 'Berikan contoh nyata!' },
  { id: 'mq_21', skill: 'reading', kind: 'short', prompt: 'Dalam IELTS Academic, arti kata "ubiquitous" paling dekat dengan...', audioWord: 'ubiquitous', choices: ['Found everywhere', 'Very rare', 'Extremely old', 'Dangerous'], correctIndex: 0, hint: 'ubiquitous = ada di mana-mana' },
];

export function generateMiniIeltsQuestion(
  skill?: 'listening' | 'reading' | 'writing' | 'speaking',
  wordProgress: Record<string, WordProgress> = {},
  hasCompass = false,
): QuizQuestion {
  // 60% from MQ bank, 40% from IELTS A1/Prep vocabulary (Bab 5 note!)
  if (Math.random() < 0.6) {
    const pool = skill
      ? MINI_IELTS_QUESTIONS.filter((q) => q.skill === skill)
      : MINI_IELTS_QUESTIONS;
    const usable = pool.length > 0 ? pool : MINI_IELTS_QUESTIONS;
    const item = usable[Math.floor(Math.random() * usable.length)];
    return {
      id: `${item.id}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      vocabId: item.id,
      prompt: item.prompt,
      hintWord: item.hint,
      choices: item.choices,
      correctIndex: item.correctIndex,
      category: `Akademi IELTS · ${item.skill.toUpperCase()}`,
      audioWord: item.audioWord,
      isMiniIelts: true,
    };
  }
  return generateQuestionForZone('gua_portal', true, false, undefined, wordProgress, hasCompass);
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateQuestionForZone(
  zoneId: ZoneId,
  isIeltsBoss = false,
  isMixedChallenge = false,
  wordIds?: string[],
  wordProgress: Record<string, WordProgress> = {},
  hasCompass = false,
): QuizQuestion {
  let pool: VocabEntry[];
  if (wordIds && wordIds.length > 0) {
    pool = wordIds.map((id) => VOCAB_BY_ID[id]).filter(Boolean);
  } else if (isIeltsBoss) {
    pool = VOCAB_CATALOG.filter((v) => v.catId === 25);
  } else if (isMixedChallenge) {
    pool = VOCAB_CATALOG;
  } else {
    pool = VOCAB_CATALOG.filter((v) => v.zoneId === zoneId);
  }

  const usable = pool.length > 0 ? pool : VOCAB_CATALOG;
  const [target] = pickSmartWords(usable, 1, wordProgress);
  const askEnglishWord = Math.random() < 0.5;
  const distractors = pickDistractors(target, 3);

  const rawOptions = askEnglishWord
    ? [target.word, ...distractors.map((d) => d.word)]
    : [target.meaningId, ...distractors.map((d) => d.meaningId)];

  const indexed = rawOptions.map((text, idx) => ({ text, isCorrect: idx === 0 }));
  const shuffled = shuffleArray(indexed);
  const correctIndex = shuffled.findIndex((o) => o.isCorrect);

  const prog = wordProgress[target.id];
  const isDifficultyFlagged = hasCompass && Boolean(prog && prog.w > prog.r);

  const prompt = askEnglishWord
    ? `Bahasa Inggris dari "${target.meaningId}"?`
    : `Apa arti kata bahasa Inggris "${target.word}"?`;

  return {
    id: `q_${target.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    vocabId: target.id,
    prompt,
    hintWord: target.phonetic,
    choices: [shuffled[0].text, shuffled[1].text, shuffled[2].text, shuffled[3].text],
    correctIndex,
    category: isIeltsBoss
      ? 'Persiapan IELTS'
      : isMixedChallenge
      ? 'Tantangan Portal (Campuran)'
      : ZONE_INFO[zoneId].name,
    audioWord: target.word,
    isDifficultyFlagged,
  };
}

export function getRankTitle(
  xp: number,
  crowns: number,
  ieltsCleared: boolean,
): string {
  if (ieltsCleared) return 'Lulusan Istana IELTS';
  if (crowns >= 6) return 'Penyelamat Kerajaan Kata';
  return getLevelInfo(xp).title;
}
