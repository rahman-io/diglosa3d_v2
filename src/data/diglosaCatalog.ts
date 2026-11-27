import {
  BossDef,
  CharacterPresetId,
  DifficultyMode,
  DoorDef,
  MonsterSpawnDef,
  MonsterType,
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
import { getCharacterPreset } from './characterPresets';
import { OVERWORLD_ANCHORS } from '../three/archipelagoWorld';
import type { NpcAppearanceVariant, NpcArchetypeId } from '../three/diverseNpcs';

export const SAVE_KEY = 'hoot-a1-v1';
export const DAILY_GOAL = 20;
export const MAX_AMMO = 40;
export const AMMO_COST = 3;

export function personalizePlayerText(text: string, playerName?: string): string {
  const resolved = playerName?.trim() || 'Hoot';
  return text.replace(/\{player\}/g, resolved);
}

export function formatOwlAddress(playerName?: string, includeLilaRelation = false): string {
  const resolved = playerName?.trim() || 'Hoot';
  return includeLilaRelation ? `Kakak ${resolved}, kakaknya Lila` : `Kakak ${resolved}`;
}

export function getGuardianAgeYears(npcOrId?: NpcDefinition | string | null): number {
  const def = typeof npcOrId === 'string' ? getZoneNpcById(npcOrId) : npcOrId;
  if (def?.ageYears !== undefined) return def.ageYears;
  const demo = def?.demographicLabel ?? '';
  if (demo.startsWith('Tua')) return 64;
  if (demo.startsWith('Dewasa')) return 32;
  if (demo.startsWith('Muda')) return 12;
  return 35;
}

export function formatGuardianAddress(
  npcOrId: NpcDefinition | string | null | undefined,
  playerName?: string,
  characterId?: CharacterPresetId,
): string {
  const resolved = playerName?.trim() || 'Hoot';
  const preset = getCharacterPreset(characterId);
  const guardianAge = getGuardianAgeYears(npcOrId);
  if (guardianAge > preset.ageYears) {
    return guardianAge >= 40 ? `Nak ${resolved}` : `Dek ${resolved}`;
  }
  return preset.gender === 'male' ? `Abang ${resolved}` : `Kakak ${resolved}`;
}

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
  caveExtraMobs: number;
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
    desc: '6 ❤️ awal · Regen cepat (55 dtk) · 20 Monster Gua · Tanpa penembak · Timer lembut (20 dtk)',
    startHp: 6,
    regenSec: 55,
    scoreMult: 1,
    xpMult: 1,
    roamingCount: 0,
    monsterSpeed: 0,
    duelAnswerSec: 0,
    maxShooters: 0,
    caveExtraMobs: 0,
    shooterCooldown: 99,
    shooterBulletSpeed: 0,
    grabSec: 5,
    monsterGuessAcc: 0.4,
    qSec: 20,
    matchSec: 180,
  },
  petualang: {
    label: 'Petualang',
    desc: '5 ❤️ awal · 30 Monster Gua (Darat, Terbang, Air) · 1 penembak · Timer 12 dtk · Skor 1.25x',
    startHp: 5,
    regenSec: 90,
    scoreMult: 1.25,
    xpMult: 1.15,
    roamingCount: 3,
    monsterSpeed: 4.8,
    duelAnswerSec: 0,
    maxShooters: 1,
    caveExtraMobs: 9,
    shooterCooldown: 2.4,
    shooterBulletSpeed: 14,
    grabSec: 3,
    monsterGuessAcc: 0.6,
    qSec: 12,
    matchSec: 120,
  },
  pendekar: {
    label: 'Pendekar',
    desc: '4 ❤️ awal · 40 Monster Gua (Darat, Terbang, Air) · 2 penembak · Monster 1.3x cepat · Skor & XP 1.5x',
    startHp: 4,
    regenSec: 120,
    scoreMult: 1.5,
    xpMult: 1.5,
    roamingCount: 5,
    monsterSpeed: 6.6,
    duelAnswerSec: 12,
    maxShooters: 2,
    caveExtraMobs: 18,
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
  { level: 6, minXp: 750, title: 'Penjaga Kata' },
  { level: 7, minXp: 900, title: 'Ksatria Kata' },
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
    desc: 'Senjata kecil pertama (1 Dmg · Regen s/d 5), lalu jelajahi Gua serta kalahkan Bos untuk senjata kuat!',
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
    quote: 'Pesan terukir di pita: "Sapaan yang tulus selalu membuka jalan menuju seseorang yang menanti di Istana."',
  },
  pasar_rasa: {
    number: 2,
    name: 'Pita Merah 2 · Pasar Rasa',
    color: '#dc2626',
    quote: 'Pesan terukir di pita: "Kehangatan sup dan nasi menjaga langkah seorang adik tetap kuat melewati kabut."',
  },
  hutan_satwa: {
    number: 3,
    name: 'Pita Merah 3 · Hutan Satwa',
    color: '#dc2626',
    quote: 'Pesan terukir di pita: "Di bawah pelangi hutan yang cerah sekaligus hujan, harapan kecil tetap bersinar."',
  },
  gerbang_kota: {
    number: 4,
    name: 'Pita Merah 4 · Gerbang Kota',
    color: '#dc2626',
    quote: 'Pesan terukir di pita: "Sebuah senyuman mengembalikan ingatan penjaga kota dan membuka rute bus ke puncak."',
  },
  menara_waktu: {
    number: 5,
    name: 'Pita Merah 5 · Menara Waktu',
    color: '#dc2626',
    quote: 'Pesan terukir di pita: "Delapan puluh anak tangga menara terlampaui meski waktu sempat membeku."',
  },
  gua_portal: {
    number: 6,
    name: 'Pita Merah 6 · Gua Portal',
    color: '#dc2626',
    quote: 'Pesan terukir di pita: "Keenam pita telah menyatu. Gerbang menuju Istana Sang Raja kini terbuka penuh."',
  },
};

export const DOOR_RESTORED_STORY: Record<ZoneId, string[]> = {
  desa_sapaan: [
    'Kata sapaan "Hello…" kembali bergema di Desa Sapaan!',
    'Kata sapaan "Hi…" memulihkan suara pintu desa!',
    'Kata "Good morning…" menyapa rumah-rumah warga!',
    'Kata "Thank you…" menghangatkan kembali hati desa!',
    'Kata "Goodbye…" menyatukan sapaan sehingga Bos penjaga Kunci Penjara muncul di depan Sel Tebing Rani!',
  ],
  pasar_rasa: [
    'Bahan "Rice" kembali memenuhi rak dapur Pasar Rasa!',
    'Aroma "Soup" hangat mulai tercium di lorong lapak!',
    'Daun "Tea" segar pulih di gudang bawah!',
    'Sayuran "Vegetables" kembali segar di sungai kuah!',
    'Buah "Fruit" pulih sempurna sehingga Lendir Kuali muncul di balik Lemari Bumbu!',
  ],
  hutan_satwa: [
    'Burung ("Bird") bebas berkicau dan ikut menjaga jalur hutan!',
    'Ikan ("Fish") kembali berenang bebas di genangan jernih!',
    'Kelinci ("Rabbit") lepas dari jeratan akar berduri!',
    'Rusa ("Deer") kembali melangkah bebas di belantara!',
    'Kupu-kupu ("Butterfly") beterbangan sehingga Semak Gigit muncul di depan Akar Berpola!',
  ],
  gerbang_kota: [
    'Ingatan kata "Home" kembali ke warga Gerbang Kota!',
    'Kata "School" menyala di papan peta sehingga jejak Dewi terlihat!',
    'Ingatan "Office" memulihkan para pekerja kota!',
    'Ingatan "Market" menggerakkan kembali lalu lintas warga!',
    'Ingatan "Station" pulih dan Bayangan Gerbang muncul mengurung Pintu Sekolah!',
  ],
  menara_waktu: [
    'Jarum jam menara bergerak dari Seven… menuju langkah baru!',
    'Jarum jam menara melangkah ke Eight!',
    'Lonceng ruang bergetar saat jarum jam menunjuk Nine!',
    'Roda gigi berputar menuju pukul Ten!',
    'Jarum jam mencapai Eleven sehingga Jam Pasir Liar muncul di depan Pintu Jam!',
  ],
  gua_portal: [
    'Suara Nyonya Portal mulai berbisik pelan, "Who…"',
    'Suara Nyonya Portal menguat sambil mengucapkan "What…"',
    'Kata "Where…" pulih bersama bisikan kenangan ketika aku membuka pintu ini untukmu dan adikmu sewaktu kalian masih kecil.',
    'Suara Nyonya Portal kian jelas saat mengucapkan "When…"',
    'Kata "Why…" pulih hingga Hantu Portal terbangun di depan Pintu Teka-Teki!',
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
  caveRibbonClueEn: string;
  caveRibbonClueId: string;
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
    prisonCorner: 'ne',
    accentColor: '#f59e0b',
    introSteps: [
      {
        speakerName: 'Gua Desa Sapaan',
        speakerRole: '5 Pintu Tantangan · Penjara Tebing Kanan',
        textEn: '{player} descends the mossy cobblestone steps into the dark cavern. Clear all 5 challenge doors, defeat Gumpal Salam to seize the Prison Key, and free Rani from the barred rock cell on the right!',
        textId: '{player} menuruni tangga batu berlumut ke ruang gua gelap. Selesaikan 5 pintu tantangan, kalahkan Bos Gumpal Salam untuk merebut Kunci Penjara, dan bebaskan Rani dari sel berjeruji di tebing kanan!',
      },
    ],
    rescueCaptiveEn: '{player}! You unlocked the cliff cell and defeated Gumpal Salam, the area boss! Thank you for freeing me!',
    rescueCaptiveId: '{player}! Kamu berhasil membuka jeruji batu dan mengalahkan Bos Gumpal Salam! Terima kasih sudah membebaskanku!',
    caveRibbonClueEn: 'Wait! Before we leave, I spotted a glowing 3D Red Ribbon hidden in the deep northwest alcove behind the mossy roots! Find and take it, and I will follow right behind you until we exit to meet Kakek Sapa!',
    caveRibbonClueId: 'Tunggu, {player}! Aku melihat Pita Merah 3D tersembunyi di ceruk barat laut paling dalam di balik akar lumut! Cari dan ambil pita itu dulu, dan aku akan terus mengikutimu sampai kita keluar menemui Kakek Sapa!',
    rescueGuardianEn: 'Rani is safe and Gumpal Salam is defeated! Thank you, {player}!',
    rescueGuardianId: 'Rani selamat dan Bos Gumpal Salam telah kalah! Terima kasih banyak, {player}!',
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
        textEn: 'Brown spice-less fog fills the cavern. {player} walks toward Koki Mimi, who leans weakly beside the entrance.',
        textId: 'Kabut kecokelatan tanpa aroma masakan menyelimuti gua. {player} berjalan menghampiri Koki Mimi yang tampak lemas dan hampir tak bersuara.',
      },
      {
        speakerName: 'Koki Mimi (Lemas)',
        speakerRole: 'Penjaga Gua Pasar Rasa',
        textEn: '{player}... I cannot even pronounce r-rice or s-soup... Lendir Kuali hid my sick Mama inside a locked secret pantry cell in this cave!',
        textId: '{player}… aku bahkan tak sanggup mengucap r-rice atau s-soup… Lendir Kuali menyembunyikan Mama yang sakit di dalam sel kurungan tersembunyi di sudut gua ini!',
      },
      {
        speakerName: 'Misi Gua Pasar Rasa',
        speakerRole: 'Petunjuk Penjaga Gua',
        textEn: 'Restore Rice, Soup, Tea, Vegetables, and Fruit across 5 doors, crush Lendir Kuali for the Prison Key, and free Mama!',
        textId: 'Pulihkan bahan makanan lewat 5 pintu, kalahkan Lendir Kuali hingga Kunci Penjara jatuh, lalu buka kurungan tersembunyi untuk mengobati dan menyelamatkan Mama!',
      },
    ],
    rescueCaptiveEn: 'Thank you, brave {player}! Lendir Kuali is defeated and warm soup aroma fills the air again!',
    rescueCaptiveId: 'Terima kasih, {player} yang pemberani! Bos Lendir Kuali telah kalah dan aku sudah sehat kembali!',
    caveRibbonClueEn: 'Before we head out to Koki Mimi, check the deep northwest stone corner because I saw a 3D Red Ribbon shimmering there! Take it and I will stay close behind you until we reach the exit!',
    caveRibbonClueId: 'Sebelum kita keluar menemui Koki Mimi, periksa sudut barat laut paling dalam karena tadi kulihat Pita Merah 3D tersembunyi di sana! Ambil pita itu, dan aku akan terus mengikutimu hingga keluar gua!',
    rescueGuardianEn: 'Mama is healed and Lendir Kuali is gone! Thank you, {player}!',
    rescueGuardianId: 'Mama selamat dan Bos Lendir Kuali telah dikalahkan! Terima kasih banyak, {player}!',
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
        textEn: 'Deep inside the silent mossy cavern, {player} rushes to Ranger Rimba, whose voice cracks with worry.',
        textId: 'Di gua lumut yang terlalu sunyi tanpa kicau satwa, {player} berjalan mendekati Ranger Rimba yang bersuara serak penuh cemas.',
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
    rescueCaptiveEn: '{player}! Semak Gigit is defeated and the thorns let me go!',
    rescueCaptiveId: 'Terima kasih, {player}! Bos Semak Gigit sudah kalah dan akar berduri melepaskanku!',
    caveRibbonClueEn: 'Hey, I saw a hidden 3D Red Ribbon tucked in the deep northeast corner behind the rocks! Let us grab it first, and I will follow right behind you all the way out to Ranger Rimba!',
    caveRibbonClueId: 'Hei, tadi kulihat Pita Merah 3D tersembunyi di sudut timur laut di balik bebatuan! Ayo cari dan ambil dulu, lalu aku akan terus mengikutimu sampai keluar menemui Kak Rimba!',
    rescueGuardianEn: 'Kiki is safe and Semak Gigit is defeated! Thank you, {player}!',
    rescueGuardianId: 'Kiki selamat dan Bos Semak Gigit telah kalah! Terima kasih banyak, {player}!',
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
        textEn: 'Gray-blue mist hangs low inside the stone vault. {player} approaches Pak Polisi Gerbang, who freezes stiffly at his post.',
        textId: 'Kabut biru kelabu menghentikan segalanya di ruang bawah gerbang. {player} berjalan menghampiri Pak Polisi Gerbang yang berdiri kaku kebingungan.',
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
        textId: 'Pulihkan kata tempat dan profesi lewat 5 pintu, kalahkan Bayangan Gerbang untuk merebut Kunci Penjara, lalu buka kurungan Dewi!',
      },
    ],
    rescueCaptiveEn: '{player}! Bayangan Gerbang is defeated and you unlocked my cell!',
    rescueCaptiveId: '{player}! Bos Bayangan Gerbang telah kalah dan kamu berhasil membebaskanku!',
    caveRibbonClueEn: 'I caught sight of a 3D Red Ribbon hidden in the deep northwest corner! Grab it before we leave, and I will walk right behind you until we exit to meet Dad outside!',
    caveRibbonClueId: 'Aku sempat melihat Pita Merah 3D tersembunyi di sudut barat laut paling ujung! Cari dan ambil dulu sebelum keluar, dan aku akan terus mengikutimu sampai kita keluar menemui Ayah di luar!',
    rescueGuardianEn: 'Dewi is safe and Bayangan Gerbang is defeated! Thank you from the bottom of my heart, {player}!',
    rescueGuardianId: 'Dewi selamat dan Bos Bayangan Gerbang telah dikalahkan! Terima kasih sebesar-besarnya, {player}!',
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
        textEn: 'Frozen golden dust floats in silence. {player} walks up to the Clockmaker, who stares blankly at a stopped golden pocket watch.',
        textId: 'Debu emas waktu membeku di udara gua. {player} berjalan menuju Pembuat Jam yang terus bergumam murung menatap arloji sakunya yang terhenti.',
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
    rescueCaptiveEn: 'Thank you, {player}! Jam Pasir Liar is shattered and time flows freely again!',
    rescueCaptiveId: 'Terima kasih, {player}! Bos Jam Pasir Liar sudah hancur dan aku bebas kembali!',
    caveRibbonClueEn: 'Look toward the deep northeast corner beyond the time pillars because there is a hidden 3D Red Ribbon waiting! Collect it, and I will follow close behind you until we exit to see Master Clockmaker!',
    caveRibbonClueId: 'Coba cari di sudut timur laut di balik pilar waktu karena ada Pita Merah 3D tersembunyi di sana! Ambil pita itu, dan aku akan selalu mengikutimu hingga keluar menemui Guru Pembuat Jam!',
    rescueGuardianEn: 'Laras is safe and Jam Pasir Liar is gone! Thank you, {player}!',
    rescueGuardianId: 'Laras selamat dan Bos Jam Pasir Liar telah kalah! Terima kasih banyak, {player}!',
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
        textEn: 'Inside the crystal cavern leading to the Palace, {player} approaches Lady Portal while her lips move without making a sound.',
        textId: 'Di dalam gua kristal terakhir menuju Istana, {player} berjalan mendekati Nyonya Portal. Bibirnya bergerak mencoba bicara, tetapi tak ada satu pun suara keluar.',
      },
      {
        speakerName: 'Nyonya Portal (Tak Bersuara)',
        speakerRole: 'Penjaga Gua Portal',
        textEn: '(Silent gesture pointing to the dark corner...) Hantu Portal stole my voice spirit along with the 5 question words Who, What, Where, When, Why, and locked my voice inside a hidden cage!',
        textId: '(Dengan isyarat tangan menunjuk sudut gelap…) Hantu Portal merampas suara Nyonya Portal serta 5 kata tanya (Who, What, Where, When, Why) dan mengurung Peri Suaranya di penjara tersembunyi!',
      },
      {
        speakerName: 'Misi Gua Portal',
        speakerRole: 'Petunjuk Penjaga Gua',
        textEn: 'Open all 5 doors to recover every question word, defeat Hantu Portal to drop the Prison Key, and restore Lady Portal’s voice to reach Lila!',
        textId: 'Buka 5 pintu untuk memulihkan Who hingga Why, kalahkan Hantu Portal untuk meraih Kunci Penjara, lalu bebaskan Peri Suara agar jalan ke Istana dan Lila terbuka!',
      },
    ],
    rescueCaptiveEn: 'Hantu Portal is defeated and my voice echoes free again!',
    rescueCaptiveId: 'Bos Hantu Portal telah kalah dan suaraku kembali bebas!',
    caveRibbonClueEn: 'A 3D Red Ribbon is hidden in the deep northwest corner behind the crystal pillar! Find and claim it, and I will stay beside you until we exit to greet Lady Portal outside!',
    caveRibbonClueId: 'Ada Pita Merah 3D tersembunyi di sudut barat laut di balik pilar kristal! Cari dan ambil dulu, dan aku akan terus mengikutimu sampai kita keluar menemui Nyonya Portal!',
    rescueGuardianEn: 'The Voice Spirit is safe and Hantu Portal is defeated! Thank you, {player}!',
    rescueGuardianId: 'Peri Suara selamat dan Bos Hantu Portal telah kalah! Terima kasih banyak, {player}!',
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
    conflict: 'Desa membisu karena kehilangan kata sapaan; cucu Kakek Sapa, Rani, diculik dan ditawan di balik jeruji penjara di dalam Gua Desa Sapaan.',
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
    { index: 0, id: 'desa_d0', name: 'Sumur Tua', mode: 'cards', modeLabel: 'Kartu Kilat', x: 12.8, y: 0, z: 44.5, rotY: -0.78, minPct: 0 },
    { index: 1, id: 'desa_d1', name: 'Jembatan Batu', mode: 'duel', modeLabel: 'Duel Rebutan (Gumpal Kecil)', x: 7.4, y: 3.5, z: 12.2, rotY: -0.82, minPct: 0 },
    { index: 2, id: 'desa_d2', name: 'Lumbung', mode: 'listen', modeLabel: 'Telinga Tajam', x: 37.0, y: 3.5, z: 10.5, rotY: -Math.PI / 2, minPct: 60 },
    { index: 3, id: 'desa_d3', name: 'Parit', mode: 'type', modeLabel: 'Jago Ejaan', x: -22.2, y: 3.5, z: 25.5, rotY: Math.PI / 2, minPct: 60 },
    { index: 4, id: 'desa_d4', name: 'Sel Tebing Rani', mode: 'match', modeLabel: 'Pasang Kartu → Bos', x: 2.0, y: 9.5, z: -47.2, rotY: 0, minPct: 60 },
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
  desa_sapaan: { name: 'Forest Slime Kecil', hp: 3, type: 'forest_slime' },
  pasar_rasa: { name: 'Thorn Goblin Kecil', hp: 3, type: 'thorn_goblin' },
  hutan_satwa: { name: 'Dire Wolf Muda', hp: 3, type: 'dire_wolf' },
  gerbang_kota: { name: 'Skeleton Penjaga', hp: 3, type: 'skeleton_warrior' },
  menara_waktu: { name: 'Stone Gargoyle Kecil', hp: 3, type: 'stone_gargoyle' },
  gua_portal: { name: 'Lava Imp Kilat', hp: 4, type: 'lava_imp' },
};

export const BOSS_MINION_HP = 8; // Masing-masing anak buah bos membawa 8 tantangan (< 10 pertanyaan)

export const BOSS_MINION_TYPES: Record<ZoneId, [MonsterType, MonsterType]> = {
  desa_sapaan: ['thorn_goblin', 'skeleton_warrior'],
  pasar_rasa: ['thorn_goblin', 'lava_imp'],
  hutan_satwa: ['dire_wolf', 'jungle_troll'],
  gerbang_kota: ['skeleton_warrior', 'minotaur_brute'],
  menara_waktu: ['stone_gargoyle', 'crystal_golem'],
  gua_portal: ['lava_imp', 'magma_elemental'],
};

export const BOSSES: Record<ZoneId, BossDef> = {
  desa_sapaan: {
    id: 'boss_desa',
    name: 'Raja Forest Slime',
    monsterType: 'forest_slime',
    zoneId: 'desa_sapaan',
    phases: 1,
    hpPerPhase: 15,
    mechanic: 'none',
    mechanicDesc: 'Bos terkuat di Gua Desa Sapaan dengan 15 tantangan kata sapaan!',
    taunts: [
      'Raja Forest Slime mengunci Kunci Penjara Rani di gua!',
      'Slime raksasa mulai terdesak, terus serang sampai tuntas!',
      'Sedikit lagi! Tuntaskan serangan terakhirmu!',
    ],
    rewardRelic: 'pedang',
    rewardWeapon: 'emas',
    rewardRibbon: 'Pita Salam Desa',
  },
  pasar_rasa: {
    id: 'boss_pasar',
    name: 'Sand Scorpion Raksasa',
    monsterType: 'sand_scorpion',
    zoneId: 'pasar_rasa',
    phases: 1,
    hpPerPhase: 15,
    mechanic: 'slime',
    mechanicDesc: '15 tantangan! Saat HP ≤ 10, racun pasir memiliki peluang 55% menyamarkan 1 pilihan salah (🟢 ???).',
    taunts: [
      'Sand Scorpion Raksasa mengadang di tengah pasar!',
      'Racun pasirnya mulai menyamarkan pilihan jawaban!',
      'Sengatan terakhir muncul, pilih arti yang benar dengan cermat!',
    ],
    rewardRelic: 'perisai',
    rewardWeapon: 'saus',
    rewardRibbon: 'Pita Dapur Rasa',
  },
  hutan_satwa: {
    id: 'boss_satwa',
    name: 'Ancient Treant Rimba',
    monsterType: 'ancient_treant',
    zoneId: 'hutan_satwa',
    phases: 1,
    hpPerPhase: 15,
    mechanic: 'grow',
    mechanicDesc: '15 tantangan! Saat HP ≤ 10, jawaban salah memulihkan HP bos +1 (maks 2x).',
    taunts: [
      'Ancient Treant menjerat akar-akar Hutan Satwa!',
      'Akarnya tumbuh lagi setiap kali kamu salah menjawab!',
      'Rimba berguncang! Taklukkan akar terakhirnya!',
    ],
    rewardRelic: 'peluit',
    rewardWeapon: 'biji',
    rewardRibbon: 'Pita Rimba Hijau',
  },
  gerbang_kota: {
    id: 'boss_kota',
    name: 'Iron Juggernaut Gerbang',
    monsterType: 'iron_juggernaut',
    zoneId: 'gerbang_kota',
    phases: 1,
    hpPerPhase: 15,
    mechanic: 'close',
    mechanicDesc: '15 tantangan! Saat HP ≤ 10, tiap 2 putaran mengunci 1 opsi 🔒 dan memangkas waktu AMBIL -1 dtk.',
    taunts: [
      'Iron Juggernaut mengunci Pintu Sekolah!',
      'Baja gerbang menyempit dan waktu reaksi berkurang!',
      'Serangan baja terakhir menuju kota, tetap fokus!',
    ],
    rewardRelic: 'sepatu',
    rewardWeapon: 'kertas',
    rewardRibbon: 'Pita Gerbang Kota',
  },
  menara_waktu: {
    id: 'boss_waktu',
    name: 'Titan Colossus Waktu',
    monsterType: 'titan_colossus',
    zoneId: 'menara_waktu',
    phases: 1,
    hpPerPhase: 15,
    mechanic: 'rewind',
    mechanicDesc: '15 tantangan! Saat HP ≤ 10, tiap 2 soal baru memutar ulang soal sebelumnya!',
    taunts: [
      'Titan Colossus membekukan jarum jam menara!',
      'Waktu berputar balik, ingat soal yang baru saja muncul!',
      'Dentang terakhir pukul tujuh berbunyi, kalahkan dia!',
    ],
    rewardRelic: 'jam',
    rewardWeapon: 'jarum',
    rewardRibbon: 'Pita Menara Waktu',
  },
  gua_portal: {
    id: 'boss_gua',
    name: 'Obsidian Hydra Portal',
    monsterType: 'obsidian_hydra',
    zoneId: 'gua_portal',
    phases: 1,
    hpPerPhase: 15,
    mechanic: 'none',
    mechanicDesc: 'Naga berkepala tiga dengan 15 tantangan terakhir sebelum gerbang Istana IELTS terbuka!',
    taunts: [
      'Obsidian Hydra membisikkan kata tanya di kegelapan gua!',
      'Tiga kepalanya bergema semakin kuat, gunakan kata sambungmu!',
      'Taklukkan Obsidian Hydra untuk Mahkota ke-6!',
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
    title: 'Sesepuh Desa Sapaan · Penjaga Siang (Babak 1)',
    zoneId: 'desa_sapaan',
    zoneName: 'Desa Sapaan',
    x: OVERWORLD_ANCHORS.npcs.npc_tetua.x,
    z: OVERWORLD_ANCHORS.npcs.npc_tetua.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_tetua.rotY,
    storyLine1En: '{player}... G-good... morning... Monsters silenced our village doors, kidnapped my granddaughter Rani, and locked her inside a barred prison cell in the cave!',
    storyLine1Id: '{player}… S-selamat… pa-pagi… Desa ini sunyi membisu karena semua pintunya kehilangan kata sapaan, dan cucuku Rani diculik lalu ditawan di dalam penjara berjeruji di Gua Desa Sapaan!',
    storyLine2En: 'Restore Hello, Hi, Good morning, Thank you, and Goodbye across 5 cave doors, {player}, defeat the Boss to seize the Prison Key, and free Rani!',
    storyLine2Id: 'Pulihkan kata Hello, Hi, Good morning, Thank you, & Goodbye di 5 pintu gua, {player}, kalahkan Bos penjaga Kunci Penjara, dan bebaskan cucuku Rani!',
    thanksId: 'Rani berlari memeluk kakeknya! Kakek Sapa berpesan kepadamu, {player}, "Sapalah dulu. Itulah pedang yang sebenarnya."',
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
    ageYears: 68,
    habitSummary: 'Bertumpu tongkat kayu & menyapa warga desa',
    skillSummary: 'Kebijaksanaan sejarah & sastra sapaan',
    stats: { hp: 110, atk: 18, nrg: 140 },
    shiftRole: 'day',
    partnerNpcId: 'npc_tetua_malam',
    dayNpcId: 'npc_tetua',
  },
  {
    id: 'npc_koki',
    name: 'Koki Mimi',
    title: 'Juru Masak Pastri · Penjaga Siang (Babak 2)',
    zoneId: 'pasar_rasa',
    zoneName: 'Pasar Rasa',
    x: OVERWORLD_ANCHORS.npcs.npc_koki.x,
    z: OVERWORLD_ANCHORS.npcs.npc_koki.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_koki.rotY,
    storyLine1En: '{player}, our spice market is starving under brown mist! The recipe book vanished, Mama fell ill, and I cannot even say rice, soup, or tea...',
    storyLine1Id: '{player}, pasar kuliner kelaparan di balik kabut kecokelatan! Buku resep hilang, Mama jatuh sakit, dan aku tak sanggup mengucapkan rice, soup, maupun tea.',
    storyLine2En: 'Please open all 5 market doors, {player}, to bring back Rice, Soup, Tea, Vegetables, & Fruit, then defeat Lendir Kuali!',
    storyLine2Id: 'Buka 5 pintu dapur untuk mengembalikan bahan makanan ke rak dan taklukkan raksasa Lendir Kuali di balik lemari bumbu, {player}!',
    thanksId: 'Sup hangat kembali mengepul dan Mama tersenyum sembuh! Koki Mimi berkata kepada {player}, "Makan dulu. Baru bertarung."',
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
    ageYears: 12,
    habitSummary: 'Memanggang roti & menyajikan nampan kue',
    skillSummary: 'Seni pastri & resep kerajaan',
    stats: { hp: 100, atk: 10, nrg: 130 },
    shiftRole: 'day',
    partnerNpcId: 'npc_koki_malam',
    dayNpcId: 'npc_koki',
  },
  {
    id: 'npc_rubah',
    name: 'Ranger Rimba',
    title: 'Pemandu Hutan Satwa · Penjaga Siang (Babak 3)',
    zoneId: 'hutan_satwa',
    zoneName: 'Hutan Satwa',
    x: OVERWORLD_ANCHORS.npcs.npc_rubah.x,
    z: OVERWORLD_ANCHORS.npcs.npc_rubah.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_rubah.rotY,
    storyLine1En: '{player}, the woods are too quiet! Living thorny bushes bite and tie up the animals, including my little sibling Kiki who ran into the thicket!',
    storyLine1Id: '{player}, rimba terlalu sunyi! Semak berduri hidup menggigit dan mengikat para hewan termasuk adikku Kiki yang lari ke dalam belukar. Teropongku menemukan jejak mereka, tetapi akarnya terlalu kuat!',
    storyLine2En: 'Free Bird, Fish, Rabbit, Deer, and Butterfly through the 5 doors, {player}, and defeat Semak Gigit at Akar Berpola!',
    storyLine2Id: 'Bebaskan satwa lewat 5 pintu agar hewan hutan ikut menjagamu, {player}, lalu tumbangkan Semak Gigit di depan Akar Berpola!',
    thanksId: 'Kiki melompat ke pelukan Ranger Rimba! Ia berbisik kepadamu, {player}, "Adikmu lewat di sini. Ia berjalan dengan pita merah. Ia pemberani."',
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
    ageYears: 24,
    habitSummary: 'Meneropong rimba dengan ransel ekspedisi',
    skillSummary: 'Navigasi hutan & pelestarian satwa',
    stats: { hp: 150, atk: 25, nrg: 160 },
    shiftRole: 'day',
    partnerNpcId: 'npc_rubah_malam',
    dayNpcId: 'npc_rubah',
  },
  {
    id: 'npc_penjaga',
    name: 'Pak Polisi Gerbang',
    title: 'Petugas Kota · Penjaga Siang (Babak 4)',
    zoneId: 'gerbang_kota',
    zoneName: 'Gerbang Kota',
    x: OVERWORLD_ANCHORS.npcs.npc_penjaga.x,
    z: OVERWORLD_ANCHORS.npcs.npc_penjaga.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_penjaga.rotY,
    storyLine1En: '{player}, gray-blue mist froze city traffic! I forgot the secret word to open the gate, and my daughter Dewi is lost near the brick school, yet I cannot leave my post!',
    storyLine1Id: '{player}, kabut biru kelabu menghentikan lalu lintas kota! Aku lupa kata rahasia gerbang, sementara putriku Dewi tersesat di dekat sekolah dan aku tak boleh meninggalkan pos patroli!',
    storyLine2En: 'Restore Home, School, Office, Market, and Station so workers remember their duties, {player}, then banish Bayangan Gerbang!',
    storyLine2Id: 'Pulihkan kata tempat dan profesi agar para pekerja ingat tugasnya, {player}, lalu kalahkan Bayangan Gerbang di depan Pintu Sekolah!',
    thanksId: 'Dewi berlari menyeberang jalan memeluk ayahnya! Pak Polisi Gerbang berseru kepada {player}, "Buka. Itulah katanya. Terima kasih!"',
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
    ageYears: 40,
    habitSummary: 'Mengatur lalu lintas & patroli gerbang kota',
    skillSummary: 'Disiplin lalu lintas & investigasi',
    stats: { hp: 180, atk: 35, nrg: 150 },
    shiftRole: 'day',
    partnerNpcId: 'npc_penjaga_malam',
    dayNpcId: 'npc_penjaga',
  },
  {
    id: 'npc_penyihir',
    name: 'Pembuat Jam',
    title: 'Ahli Menara Waktu · Penjaga Siang (Babak 5)',
    zoneId: 'menara_waktu',
    zoneName: 'Menara Waktu',
    x: OVERWORLD_ANCHORS.npcs.npc_penyihir.x,
    z: OVERWORLD_ANCHORS.npcs.npc_penyihir.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_penyihir.rotY,
    storyLine1En: '{player}, look at my golden pocket watch showing Seven o’clock... Yesterday my beloved student left before I could say goodbye, and all the clocktower gears froze at seven!',
    storyLine1Id: '{player}, lihat arloji saku emasku yang terhenti pada pukul tujuh… Kemarin murid kesayanganku pergi sebelum aku sempat berpamitan, dan seluruh roda gigi menara membeku di pukul tujuh!',
    storyLine2En: 'Advance the clock from Seven to Eleven across 5 doors, {player}, and shatter Jam Pasir Liar at Pintu Jam!',
    storyLine2Id: 'Majukan jarum jam selangkah demi selangkah (Seven → Eleven) lewat 5 pintu dan hancurkan Jam Pasir Liar di Pintu Jam, {player}!',
    thanksId: 'Lonceng pukul dua belas berdentang! Pembuat Jam berbisik lega kepadamu, {player}, "Selamat tinggal, muridku. Sekarang aku bisa mengatakannya."',
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
    ageYears: 62,
    habitSummary: 'Menyetel arloji saku emas & roda menara',
    skillSummary: 'Mekanika waktu & presisi jam',
    stats: { hp: 100, atk: 12, nrg: 130 },
    shiftRole: 'day',
    partnerNpcId: 'npc_penyihir_malam',
    dayNpcId: 'npc_penyihir',
  },
  {
    id: 'npc_portal',
    name: 'Nyonya Portal',
    title: 'Cendekiawan Kristal · Penjaga Siang (Babak 6)',
    zoneId: 'gua_portal',
    zoneName: 'Gua Portal',
    x: OVERWORLD_ANCHORS.npcs.npc_portal.x,
    z: OVERWORLD_ANCHORS.npcs.npc_portal.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_portal.rotY,
    storyLine1En: '(Her lips move silently toward {player}...) Hantu Portal stole my voice and all five question words from my ancient scroll, which are Who, What, Where, When, Why!',
    storyLine1Id: '(Bibirnya bergerak lembut ke arah {player} tanpa suara...) Lima kata tanya dari gulungan prasastiku seperti Who, What, Where, When, dan Why telah direnggut Hantu Portal yang menyegel pintu ke istana!',
    storyLine2En: 'Recover all 5 question words in the crystal cave, {player}, and defeat Hantu Portal to win the 6th Crown Shard and meet Lila!',
    storyLine2Id: 'Pulihkan 5 kata tanya di gua kristal ini, {player}, dan kalahkan bos terakhir Hantu Portal untuk meraih Pecahan Mahkota ke-6 & menyusul Lila!',
    thanksId: 'Suara Nyonya Portal kembali! Kepada {player} ia berkata, "Sekarang kamu boleh bertanya apa saja padaku!" Jalan menuju puncak kerajaan pun kembali terang!',
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
    ageYears: 34,
    habitSummary: 'Membaca gulungan prasasti di gua kristal',
    skillSummary: 'Arkeologi kata tanya & energi kristal',
    stats: { hp: 150, atk: 30, nrg: 200 },
    shiftRole: 'day',
    partnerNpcId: 'npc_portal_malam',
    dayNpcId: 'npc_portal',
  },
];

export const NIGHT_NPC_CATALOG: NpcDefinition[] = [
  {
    id: 'npc_tetua_malam',
    name: 'Ronda Bima',
    title: 'Penjaga Ronda Malam · Shift Malam (Babak 1)',
    zoneId: 'desa_sapaan',
    zoneName: 'Desa Sapaan',
    x: OVERWORLD_ANCHORS.npcs.npc_tetua.x,
    z: OVERWORLD_ANCHORS.npcs.npc_tetua.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_tetua.rotY,
    storyLine1En: 'Good evening, {player}! Elder Sapa finished his day shift, so I am guarding the cave gate tonight while his granddaughter Rani is still locked inside the cave prison!',
    storyLine1Id: 'Selamat malam, {player}! Kakek Sapa sudah selesai piket siang dan kembali menjadi warga biasa. Malam ini aku menggantikannya menjaga gerbang gua sementara cucunya Rani masih ditawan di penjara dalam gua!',
    storyLine2En: 'Restore Hello, Hi, Good morning, Thank you, and Goodbye across 5 cave doors, defeat the Boss for the Prison Key, and rescue Rani!',
    storyLine2Id: 'Pulihkan Hello, Hi, Good morning, Thank you, & Goodbye di 5 pintu gua, rebut Kunci Penjara dari Bos, dan selamatkan Rani! Aku beri izin masuk malam ini.',
    thanksId: 'Rani berlari ceria menyambut pagi! Ronda Bima tersenyum sambil berkata, "Jaga malam berhasil berkat keberanianmu, {player}!"',
    speechBubble: 'Piket malam siaga!',
    enterLabel: 'Masuk ke Desa Sapaan',
    questTitle: 'Bebaskan Desa Sapaan & Selamatkan Rani',
    questType: 'liberate_zone',
    questTarget: 1,
    rewardXp: 150,
    rewardDiamonds: 5,
    accentColor: '#fbbf24',
    archetypeId: 'night_watchman',
    demographicLabel: 'Dewasa · Laki-laki · Penjaga Ronda Malam',
    ageYears: 32,
    habitSummary: 'Membawa lentera ronda & kentongan patroli malam',
    skillSummary: 'Keamanan malam & sapaan warga',
    stats: { hp: 145, atk: 24, nrg: 155 },
    shiftRole: 'night',
    partnerNpcId: 'npc_tetua',
    dayNpcId: 'npc_tetua',
  },
  {
    id: 'npc_koki_malam',
    name: 'Chef Bara',
    title: 'Juru Masak Shift Malam · Pasar Rasa (Babak 2)',
    zoneId: 'pasar_rasa',
    zoneName: 'Pasar Rasa',
    x: OVERWORLD_ANCHORS.npcs.npc_koki.x,
    z: OVERWORLD_ANCHORS.npcs.npc_koki.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_koki.rotY,
    storyLine1En: 'Good evening, {player}! Chef Mimi handed over the night kitchen watch to me so I can keep this charcoal broth warm while Mama is still sick and the recipe book is missing!',
    storyLine1Id: 'Malam, {player}! Koki Mimi sudah lepas piket sore tadi sehingga aku mengambil alih jaga dapur malam. Tungku ini tetap kunyalakan agar Mama yang sakit bisa makan begitu buku resep kembali!',
    storyLine2En: 'Open all 5 market doors for Rice, Soup, Tea, Vegetables, & Fruit, then defeat Lendir Kuali because you have my night permission!',
    storyLine2Id: 'Buka 5 pintu dapur untuk memulihkan Rice, Soup, Tea, Vegetables, & Fruit dan tumbangkan Lendir Kuali! Silakan masuk malam ini, {player}.',
    thanksId: 'Aroma kaldu memenuhi Pasar Rasa dan Mama kembali sehat! Chef Bara tertawa bangga sambil berseru, "Dapur malam kembali hidup berkat {player}!"',
    speechBubble: 'Tungku malam siap!',
    enterLabel: 'Masuk ke Pasar Rasa',
    questTitle: 'Pulihkan Resep & Obati Mama',
    questType: 'liberate_zone',
    questTarget: 1,
    rewardXp: 180,
    rewardDiamonds: 5,
    accentColor: '#fb923c',
    archetypeId: 'night_chef',
    demographicLabel: 'Dewasa · Laki-laki · Juru Masak Malam',
    ageYears: 30,
    habitSummary: 'Menjaga panci kaldu panas sepanjang shift malam',
    skillSummary: 'Masak tungku arang & kulineri malam',
    stats: { hp: 135, atk: 22, nrg: 145 },
    shiftRole: 'night',
    partnerNpcId: 'npc_koki',
    dayNpcId: 'npc_koki',
  },
  {
    id: 'npc_rubah_malam',
    name: 'Penjelajah Kirana',
    title: 'Pengintai Hutan Malam · Shift Malam (Babak 3)',
    zoneId: 'hutan_satwa',
    zoneName: 'Hutan Satwa',
    x: OVERWORLD_ANCHORS.npcs.npc_rubah.x,
    z: OVERWORLD_ANCHORS.npcs.npc_rubah.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_rubah.rotY,
    storyLine1En: 'Hello {player}! Ranger Rimba ended his day patrol, so I took over the night shift with night-vision goggles! Thorny vines still bind the animals and young Kiki inside the thicket!',
    storyLine1Id: 'Halo {player}! Ranger Rimba sudah kembali ke plaza usai shift sore, dan aku menggantikannya berjaga malam ini dengan kacamata penglihatan malam! Semak berduri masih mengikat satwa dan adik kecil Kiki!',
    storyLine2En: 'Free Bird, Fish, Rabbit, Deer, and Butterfly through 5 doors and crush Semak Gigit, {player}, then I will unlock the cave door for you tonight!',
    storyLine2Id: 'Bebaskan kelima satwa lewat 5 pintu dan tumbangkan Semak Gigit, {player}! Pintu gua hutan kubuka untukmu malam ini.',
    thanksId: 'Kiki selamat dan para satwa bernyanyi di malam hari! Kirana mengangguk senang kepadamu, {player}, "Jejak hutan kini aman sampai fajar!"',
    speechBubble: 'Kacamata malam aktif!',
    enterLabel: 'Masuk ke Hutan Satwa',
    questTitle: 'Bebaskan Satwa & Temukan Kiki',
    questType: 'liberate_zone',
    questTarget: 1,
    rewardXp: 220,
    rewardDiamonds: 6,
    accentColor: '#34d399',
    archetypeId: 'night_ranger',
    demographicLabel: 'Muda · Perempuan Non-Hijab · Pengintai Malam',
    ageYears: 12,
    habitSummary: 'Memantau hutan gelap dengan goggle & lentera zamrud',
    skillSummary: 'Pelacakan malam & penyelamatan satwa',
    stats: { hp: 140, atk: 28, nrg: 170 },
    shiftRole: 'night',
    partnerNpcId: 'npc_rubah',
    dayNpcId: 'npc_rubah',
  },
  {
    id: 'npc_penjaga_malam',
    name: 'Inspektur Sinta',
    title: 'Komandan Patroli Malam · Gerbang Kota (Babak 4)',
    zoneId: 'gerbang_kota',
    zoneName: 'Gerbang Kota',
    x: OVERWORLD_ANCHORS.npcs.npc_penjaga.x,
    z: OVERWORLD_ANCHORS.npcs.npc_penjaga.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_penjaga.rotY,
    storyLine1En: 'Good evening, {player}! Officer Gerbang just went off duty after sunset, so now I am on night watch! The gate word is still sealed in mist and his daughter Dewi is waiting near the brick school.',
    storyLine1Id: 'Selamat malam, {player}! Pak Polisi Gerbang baru saja selesai shift sore dan pulang ke warga kota sehingga sekarang giliranku berjaga malam! Kata gerbang masih tersegel kabut dan putrinya Dewi terjebak dekat sekolah.',
    storyLine2En: 'Restore Home, School, Office, Market, and Station and banish Bayangan Gerbang! You are cleared to enter tonight, {player}!',
    storyLine2Id: 'Pulihkan 5 kata kota dan profesi lalu kalahkan Bayangan Gerbang! Aku beri izin penuh kepadamu, {player}, untuk menerobos gerbang malam ini.',
    thanksId: 'Lampu kota kembali menyala dan Dewi bersatu lagi dengan ayahnya! Inspektur Sinta memberi hormat kepada {player} sambil berseru, "Patroli malam tuntas!"',
    speechBubble: 'Patroli malam siaga!',
    enterLabel: 'Masuk ke Gerbang Kota',
    questTitle: 'Buka Gerbang & Selamatkan Dewi',
    questType: 'liberate_zone',
    questTarget: 1,
    rewardXp: 240,
    rewardDiamonds: 7,
    accentColor: '#38bdf8',
    archetypeId: 'night_officer',
    demographicLabel: 'Dewasa · Perempuan Berhijab · Inspektur Malam',
    ageYears: 35,
    habitSummary: 'Mengatur patroli malam dengan tongkat sinyal biru',
    skillSummary: 'Keamanan malam & navigasi kota',
    stats: { hp: 185, atk: 34, nrg: 165 },
    shiftRole: 'night',
    partnerNpcId: 'npc_penjaga',
    dayNpcId: 'npc_penjaga',
  },
  {
    id: 'npc_penyihir_malam',
    name: 'Astronom Astra',
    title: 'Penjaga Bintang Menara Waktu · Shift Malam (Babak 5)',
    zoneId: 'menara_waktu',
    zoneName: 'Menara Waktu',
    x: OVERWORLD_ANCHORS.npcs.npc_penyihir.x,
    z: OVERWORLD_ANCHORS.npcs.npc_penyihir.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_penyihir.rotY,
    storyLine1En: '{player}, the Clockmaker stepped down for the evening, so I guard the night shift by starlight! Even the night stars froze at seven o’clock along with the tower gears!',
    storyLine1Id: '{player}, Pembuat Jam sudah menyelesaikan tugas siangnya sehingga malam ini aku yang menjaga Menara Waktu bersama cahaya bintang! Roda gigi dan rasi bintang ikut membeku di pukul tujuh!',
    storyLine2En: 'Advance the clock from Seven to Eleven across 5 doors and shatter Jam Pasir Liar, {player}! Enter freely on my night watch!',
    storyLine2Id: 'Majukan jarum jam dari Seven ke Eleven di 5 pintu lalu hancurkan Jam Pasir Liar, {player}! Silakan masuk selama jaga malamku.',
    thanksId: 'Dentang tengah malam bergema di bawah taburan bintang! Astronom Astra tersenyum ramah kepada {player}, "Waktu kembali mengalir dengan indah!"',
    speechBubble: 'Bintang malam membeku!',
    enterLabel: 'Masuk ke Menara Waktu',
    questTitle: 'Alirkan Waktu & Kalahkan Jam Pasir Liar',
    questType: 'liberate_zone',
    questTarget: 1,
    rewardXp: 280,
    rewardDiamonds: 8,
    accentColor: '#a78bfa',
    archetypeId: 'night_astronomer',
    demographicLabel: 'Muda · Perempuan Non-Hijab · Astronom Malam',
    ageYears: 13,
    habitSummary: 'Membidik rasi bintang dengan astrolabe & monokel kuningan',
    skillSummary: 'Astronomi waktu & kalibrasi malam',
    stats: { hp: 120, atk: 18, nrg: 185 },
    shiftRole: 'night',
    partnerNpcId: 'npc_penyihir',
    dayNpcId: 'npc_penyihir',
  },
  {
    id: 'npc_portal_malam',
    name: 'Arkeolog Orion',
    title: 'Penjaga Malam Gua Portal · Shift Malam (Babak 6)',
    zoneId: 'gua_portal',
    zoneName: 'Gua Portal',
    x: OVERWORLD_ANCHORS.npcs.npc_portal.x,
    z: OVERWORLD_ANCHORS.npcs.npc_portal.z,
    rotationY: OVERWORLD_ANCHORS.npcs.npc_portal.rotY,
    storyLine1En: 'Good evening, {player}! Lady Portal is taking her off-duty evening break, so I am guarding the crystal entrance tonight! Hantu Portal still holds her voice and the 5 question words Who, What, Where, When, and Why!',
    storyLine1Id: 'Malam, {player}! Nyonya Portal sedang lepas piket sore ini dan berbaur sebagai warga pulau, sehingga sekarang aku yang berjaga malam di mulut Gua Portal! Hantu Portal masih menyekap 5 kata tanya yaitu Who, What, Where, When, dan Why!',
    storyLine2En: 'Recover all 5 question words and banish Hantu Portal to win the 6th Crown Shard, {player}! Enter with my night crystal clearance!',
    storyLine2Id: 'Pulihkan ke-5 kata tanya dan taklukkan Hantu Portal untuk meraih Pecahan Mahkota ke-6! Masuklah malam ini dengan izin kristal dariku, {player}.',
    thanksId: 'Kristal gua memancarkan pelangi dan suara Nyonya Portal kembali! Orion bersorak penuh semangat kepada {player}, "Jalan menuju puncak kini bebas selamanya!"',
    speechBubble: 'Kristal malam terjaga!',
    enterLabel: 'Masuk ke Gua Portal',
    questTitle: 'Pulihkan Suara & Pecahan Mahkota ke-6',
    questType: 'liberate_zone',
    questTarget: 1,
    rewardXp: 350,
    rewardDiamonds: 10,
    accentColor: '#c084fc',
    archetypeId: 'night_scholar',
    demographicLabel: 'Dewasa · Laki-laki · Arkeolog Kristal Malam',
    ageYears: 33,
    habitSummary: 'Meneliti resonansi gua malam dengan orb ametis',
    skillSummary: 'Arkeologi kristal & kata tanya malam',
    stats: { hp: 165, atk: 32, nrg: 210 },
    shiftRole: 'night',
    partnerNpcId: 'npc_portal',
    dayNpcId: 'npc_portal',
  },
];

export const ALL_OVERWORLD_NPCS: NpcDefinition[] = [...NPC_CATALOG, ...NIGHT_NPC_CATALOG];

export function getZoneNpcById(npcId: string | null | undefined): NpcDefinition | null {
  if (!npcId) return null;
  return ALL_OVERWORLD_NPCS.find((n) => n.id === npcId) ?? null;
}

export function getActiveZoneNpcDef(zoneId: ZoneId, isNight: boolean): NpcDefinition {
  const pool = isNight ? NIGHT_NPC_CATALOG : NPC_CATALOG;
  return pool.find((n) => n.zoneId === zoneId) ?? NPC_CATALOG[0];
}

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
    storyLine1En: 'Brave {player}! Lila is safe by my side, and all six crown shards are whole again! Ready for the Full Royal IELTS Trial?',
    storyLine1Id: '{player} yang pemberani! Adikmu Lila kini aman bersamaku, dan keenam keping mahkota telah bersatu kembali! Siap menghadapi Ujian Lengkap Istana IELTS?',
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
    storyLine2En: 'Safe travels, {player}!',
    storyLine2Id: 'Selamat jalan, {player}!',
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

export interface AcademyInhabitantDef {
  id: string;
  name: string;
  archetypeId: NpcArchetypeId;
  x: number;
  z: number;
  rotationY: number;
  message: string;
  variant?: NpcAppearanceVariant;
}

export const ACADEMY_INHABITANTS: AcademyInhabitantDef[] = [
  {
    id: 'acad_guard_nw',
    name: 'Pengawal Singgasana Barat',
    archetypeId: 'temple_guardian',
    x: -5.5,
    z: -15.5,
    rotationY: 0.2,
    message: 'Pengawal Singgasana Barat (Tua · Laki-laki) berkata bahwa "Kehadiranmu membawa cahaya baru ke Aula Istana IELTS, {player}!"',
  },
  {
    id: 'acad_guard_ne',
    name: 'Pengawal Singgasana Timur',
    archetypeId: 'temple_guardian',
    x: 5.5,
    z: -15.5,
    rotationY: -0.2,
    variant: { accentHex: 0x0284c7 },
    message: 'Pengawal Singgasana Timur (Tua · Laki-laki) berkata bahwa "Raja Aksara menanti hasil gemilangmu di keempat ujian istana!"',
  },
  {
    id: 'acad_scholar_w1',
    name: 'Peneliti Arsip Barat',
    archetypeId: 'crystal_scholar',
    x: -15.5,
    z: -12.0,
    rotationY: 1.0,
    variant: { shirtHex: 0x4338ca, hairHex: 0x6366f1 },
    message: 'Peneliti Arsip Barat (Dewasa · Perempuan Berhijab) berkata bahwa "Gulungan Listening dan Reading tersusun rapi menanti untuk kamu taklukkan."',
  },
  {
    id: 'acad_scholar_e1',
    name: 'Dekan Pustaka Timur',
    archetypeId: 'ielts_dean',
    x: 15.5,
    z: -12.0,
    rotationY: -1.0,
    variant: { shirtHex: 0x881337, hairHex: 0x4c0519 },
    message: 'Dekan Pustaka Timur (Tua · Perempuan Berhijab) berkata bahwa "Kuasai kata penghubung seperti However dan Therefore untuk nilai Writing tinggi!"',
  },
  {
    id: 'acad_student_w2',
    name: 'Siswi Beasiswa Salma',
    archetypeId: 'schoolgirl',
    x: -15.5,
    z: 0.0,
    rotationY: 1.3,
    variant: { hairHex: 0x38bdf8, pantsHex: 0x1e40af },
    message: 'Siswi Beasiswa Salma (Anak-anak · Perempuan Berhijab) berkata bahwa "Aku juga belajar keras setiap hari agar bisa lolos Ujian Istana seperti {player}!"',
  },
  {
    id: 'acad_student_e2',
    name: 'Pelajar Muda Tobi',
    archetypeId: 'village_kid',
    x: 15.5,
    z: 0.0,
    rotationY: -1.3,
    variant: { shirtHex: 0xeab308, accentHex: 0x0284c7 },
    message: 'Pelajar Muda Tobi (Anak-anak · Laki-laki) berkata bahwa "Penguji Rangga ramah sekali saat latihan Speaking, jadi jangan gugup ya!"',
  },
  {
    id: 'acad_student_w3',
    name: 'Mahasiswi Seni Nada',
    archetypeId: 'florist_girl',
    x: -15.5,
    z: 13.0,
    rotationY: 2.0,
    variant: { pantsHex: 0x059669, shirtHex: 0xfef3c7 },
    message: 'Mahasiswi Seni Nada (Muda · Perempuan Non-Hijab) berkata bahwa "Taman istana kini mekar indah setelah keenam pulau terbebas!"',
  },
  {
    id: 'acad_scholar_e3',
    name: 'Dosen Tata Bahasa Farah',
    archetypeId: 'school_teacher',
    x: 15.5,
    z: 13.0,
    rotationY: -2.0,
    variant: { hairHex: 0x7e22ce, shirtHex: 0x1e293b },
    message: 'Dosen Farah (Dewasa · Perempuan Berhijab) berkata bahwa "Fokus pada kata kunci pertanyaan sebelum memilih True, False, atau Not Given."',
  },
  {
    id: 'acad_elder_mid',
    name: 'Sesepuh Arsip Kerajaan',
    archetypeId: 'village_elder',
    x: -6.5,
    z: -10.5,
    rotationY: 0.4,
    message: 'Sesepuh Arsip (Tua · Laki-laki) berkata bahwa "Semua ilmu enam pulau bermuara di aula marmer megah ini."',
  },
  {
    id: 'acad_clock_mid',
    name: 'Pengatur Waktu Ujian',
    archetypeId: 'clockmaker',
    x: 6.5,
    z: 13.5,
    rotationY: -2.4,
    variant: { accentHex: 0x475569 },
    message: 'Pengatur Waktu Ujian (Tua · Laki-laki) berkata bahwa "Detik ujian berjalan tenang sehingga kamu dapat mengatur waktumu dengan bijak dan percaya diri!"',
  },
];

// Overworld roaming monsters reference (actual day 30 / night 50 waves driven by monstersCatalog)
export const MONSTER_SPAWNS: MonsterSpawnDef[] = [
  { id: 'm_slime_1', type: 'forest_slime', name: 'Forest Slime', zoneId: 'desa_sapaan', x: -14, z: 10, maxHp: 2, rewardXp: 20, rewardDiamonds: 1, rewardScore: 160 },
  { id: 'm_scorpion_1', type: 'sand_scorpion', name: 'Sand Scorpion', zoneId: 'pasar_rasa', x: -14, z: 24, maxHp: 3, rewardXp: 35, rewardDiamonds: 1, rewardScore: 280 },
  { id: 'm_troll_1', type: 'jungle_troll', name: 'Jungle Troll', zoneId: 'hutan_satwa', x: 19, z: 5, maxHp: 4, rewardXp: 45, rewardDiamonds: 2, rewardScore: 360 },
  { id: 'm_skeleton_1', type: 'skeleton_warrior', name: 'Skeleton Warrior', zoneId: 'gerbang_kota', x: 8, z: 18, maxHp: 3, rewardXp: 35, rewardDiamonds: 1, rewardScore: 260 },
  { id: 'm_golem_1', type: 'crystal_golem', name: 'Crystal Golem', zoneId: 'menara_waktu', x: -13, z: -16, maxHp: 4, rewardXp: 50, rewardDiamonds: 2, rewardScore: 420 },
];

export const ACADEMY_SHADOWS: MonsterSpawnDef[] = [
  { id: 'ae_listen', type: 'cave_spider', name: 'Cave Spider Dengar', zoneId: 'gua_portal', x: -7, z: -1, maxHp: 3, rewardXp: 45, rewardDiamonds: 1, rewardScore: 300, isAcademyShadow: true, academySkill: 'listening' },
  { id: 'ae_read', type: 'stone_gargoyle', name: 'Stone Gargoyle Baca', zoneId: 'gua_portal', x: 7, z: -1, maxHp: 3, rewardXp: 45, rewardDiamonds: 1, rewardScore: 300, isAcademyShadow: true, academySkill: 'reading' },
  { id: 'ae_write', type: 'magma_elemental', name: 'Magma Elemental Tulis', zoneId: 'gua_portal', x: -7, z: 5, maxHp: 4, rewardXp: 50, rewardDiamonds: 2, rewardScore: 340, isAcademyShadow: true, academySkill: 'writing' },
  { id: 'ae_speak', type: 'obsidian_hydra', name: 'Obsidian Hydra Bicara', zoneId: 'gua_portal', x: 7, z: 5, maxHp: 4, rewardXp: 55, rewardDiamonds: 2, rewardScore: 380, isAcademyShadow: true, academySkill: 'speaking' },
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
  { id: 'mq_1', skill: 'reading', kind: 'tfng', prompt: 'Dari teks "Solar energy is abundant in tropical regions.", apakah pernyataan "Energi surya sangat langka di daerah tropis" benar?', audioWord: 'Solar energy is abundant in tropical regions.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Partially True'], correctIndex: 1, hint: 'abundant = berlimpah' },
  { id: 'mq_2', skill: 'reading', kind: 'tfng', prompt: 'Dari teks "Urban parks reduce city heat by up to 3°C.", apakah pernyataan "Taman kota membantu mendinginkan suhu kota" benar?', audioWord: 'Urban parks reduce city heat.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Unclear'], correctIndex: 0, hint: 'reduce heat = menurunkan panas' },
  { id: 'mq_3', skill: 'reading', kind: 'tfng', prompt: 'Dari teks "The library opens at 8 AM on weekdays.", apakah pernyataan "Perpustakaan tutup setiap hari Minggu" disebutkan?', audioWord: 'The library opens at 8 AM on weekdays.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Always Open'], correctIndex: 2, hint: 'Tidak disebut jadwal Minggu' },
  { id: 'mq_4', skill: 'reading', kind: 'tfng', prompt: 'Dari teks "Electric buses cut air pollution in half.", apakah pernyataan "Bus listrik mengurangi polusi udara" benar?', audioWord: 'Electric buses cut air pollution.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Doubled'], correctIndex: 0, hint: 'cut pollution = mengurangi polusi' },
  { id: 'mq_5', skill: 'reading', kind: 'tfng', prompt: 'Dari teks "Students who sleep 8 hours score higher.", apakah pernyataan "Mahasiswa yang kurang tidur selalu mendapat nilai A" benar?', audioWord: 'Students who sleep eight hours score higher.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Equal'], correctIndex: 1, hint: 'Tidur cukup memberi skor lebih tinggi' },
  { id: 'mq_6', skill: 'reading', kind: 'tfng', prompt: 'Dari teks "Water covers 71% of Earth.", apakah pernyataan "Sebagian besar permukaan bumi tertutup air" benar?', audioWord: 'Water covers seventy one percent of Earth.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Minority'], correctIndex: 0, hint: '71% = mayoritas permukaan' },
  { id: 'mq_7', skill: 'reading', kind: 'tfng', prompt: 'Dari teks "The museum was built in 1920.", apakah pernyataan "Arsitek museum berasal dari London" disebutkan?', audioWord: 'The museum was built in 1920.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Built in 2020'], correctIndex: 2, hint: 'Asal arsitek tidak disebutkan' },
  { id: 'mq_8', skill: 'reading', kind: 'tfng', prompt: 'Dari teks "Resilient learners bounce back from errors.", apakah pernyataan "Pembelajar tangguh tidak pernah takut belajar dari kesalahan" benar?', audioWord: 'Resilient learners bounce back from errors.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Quit easily'], correctIndex: 0, hint: 'resilient = tangguh' },
  { id: 'mq_9', skill: 'reading', kind: 'tfng', prompt: 'Dari teks "Coffee exports rose by 12% last year.", apakah pernyataan "Ekspor kopi menurun tahun lalu" benar?', audioWord: 'Coffee exports rose by twelve percent.', choices: ['True (Benar)', 'False (Salah)', 'Not Given (Tidak Disebutkan)', 'Unchanged'], correctIndex: 1, hint: 'rose = naik / meningkat' },

  // 6 MCQ
  { id: 'mq_10', skill: 'listening', kind: 'mcq', prompt: 'Pada rekaman Listening "The train leaves from Platform 4 at quarter past nine.", pukul berapa kereta berangkat?', audioWord: 'The train leaves from Platform 4 at quarter past nine.', choices: ['09.15', '09.45', '08.45', '04.09'], correctIndex: 0, hint: 'quarter past nine = 09.15' },
  { id: 'mq_11', skill: 'listening', kind: 'mcq', prompt: 'Pada rekaman Listening "Bring your student card, not your passport, to register.", apa yang harus dibawa?', audioWord: 'Bring your student card, not your passport, to register.', choices: ['Paspor', 'Kartu pelajar', 'KTP', 'Surat izin'], correctIndex: 1, hint: 'student card = kartu pelajar' },
  { id: 'mq_12', skill: 'writing', kind: 'mcq', prompt: 'Untuk Writing Connector dalam kalimat "Rain fell heavily; ____, the outdoor match continued.", kata sambung apa yang tepat?', audioWord: 'however', choices: ['Therefore', 'However', 'Because', 'Meanwhile'], correctIndex: 1, hint: 'Menunjukkan pertentangan (Namun)' },
  { id: 'mq_13', skill: 'writing', kind: 'mcq', prompt: 'Dalam Writing Academic, apa sinonim formal paling tepat untuk "help reduce the problem"?', audioWord: 'mitigate', choices: ['mitigate', 'ignore', 'double', 'forget'], correctIndex: 0, hint: 'mitigate = mengurangi dampak buruk' },
  { id: 'mq_14', skill: 'speaking', kind: 'mcq', prompt: 'Pada Speaking Part 2, apa langkah terbaik selama 1 menit persiapan Cue Card?', audioWord: 'Make brief bullet notes', choices: ['Menghafal esai panjang', 'Membuat poin kata kunci singkat', 'Diam tanpa menulis', 'Membaca kamus'], correctIndex: 1, hint: 'Catat poin 5W+1H' },
  { id: 'mq_15', skill: 'speaking', kind: 'mcq', prompt: 'Pada Speaking Part 3, frasa terbaik untuk memberi opini seimbang adalah...', audioWord: 'On the one hand', choices: ['No comment', 'On the one hand... on the other hand...', 'Only yes', 'Ask someone else'], correctIndex: 1, hint: 'Menyeimbangkan dua sudut pandang' },

  // 6 Short/Context
  { id: 'mq_16', skill: 'writing', kind: 'short', prompt: 'Lengkapi kolokasi IELTS berikut ini, "Play a ____ role in education" (peran sangat penting).', audioWord: 'crucial', choices: ['crucial', 'tiny', 'sleepy', 'spicy'], correctIndex: 0, hint: 'crucial = krusial / sangat penting' },
  { id: 'mq_17', skill: 'writing', kind: 'short', prompt: 'Pilih kata penghubung sebab-akibat untuk awal kalimat "____ of heavy traffic, she arrived late."', audioWord: 'Because', choices: ['Because', 'Although', 'Unless', 'Whereas'], correctIndex: 0, hint: 'Because of + noun' },
  { id: 'mq_18', skill: 'listening', kind: 'short', prompt: 'Pada rekaman Listening "Fee is $40, with a 25% discount for students.", berapa biaya untuk pelajar?', audioWord: 'forty dollars with twenty five percent discount', choices: ['$30', '$35', '$25', '$15'], correctIndex: 0, hint: '40 - 10 = 30' },
  { id: 'mq_19', skill: 'listening', kind: 'short', prompt: 'Pada rekaman Listening "The workshop moved from Room 12 to Room 21.", di ruang mana sekarang?', audioWord: 'Room twenty one', choices: ['Room 12', 'Room 21', 'Room 2', 'Room 10'], correctIndex: 1, hint: 'moved to Room 21' },
  { id: 'mq_20', skill: 'speaking', kind: 'short', prompt: 'Pilih ekspresi paling natural untuk memperluas jawaban Speaking Part 1!', audioWord: 'For instance', choices: ['Yes.', 'No.', 'For instance, every weekend I...', 'Finished.'], correctIndex: 2, hint: 'Berikan contoh nyata!' },
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
