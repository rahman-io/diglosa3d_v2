import { CharacterPreset, CharacterPresetId, SpawnPointDef } from '../types/game';

export const CHARACTER_PRESETS: CharacterPreset[] = [
  {
    id: 'hoot_emerald',
    name: 'Hoot Penjelajah',
    roleTitle: 'Penjaga Desa Sapaan',
    tagline: 'Pakaian hijau zamrud klasik penjelajah kepulauan',
    badgeColor: '#16a34a',
    colors: {
      tunicHex: 0x16a34a,
      pantsHex: 0x1e3a8a,
      hatHex: 0x92400e,
      skinHex: 0xfed7aa,
      packHex: 0xb45309,
      featherHex: 0xef4444,
    },
  },
  {
    id: 'aria_sky',
    name: 'Aria Angkasa',
    roleTitle: 'Pelari Angin Biru',
    tagline: 'Jubah biru langit dengan bulu emas cerah',
    badgeColor: '#0284c7',
    colors: {
      tunicHex: 0x0284c7,
      pantsHex: 0x1e293b,
      hatHex: 0x0f172a,
      skinHex: 0xfde68a,
      packHex: 0x0369a1,
      featherHex: 0xfacc15,
    },
  },
  {
    id: 'karsa_crimson',
    name: 'Karsa Pemberani',
    roleTitle: 'Kesatria Api Delima',
    tagline: 'Tunik merah menyala dan sabuk petualang tangguh',
    badgeColor: '#dc2626',
    colors: {
      tunicHex: 0xdc2626,
      pantsHex: 0x292524,
      hatHex: 0x451a03,
      skinHex: 0xfdba74,
      packHex: 0x78350f,
      featherHex: 0xfbbf24,
    },
  },
  {
    id: 'raka_gold',
    name: 'Raka Surya',
    roleTitle: 'Pengelana Mentari',
    tagline: 'Pakaian kuning keemasan yang mudah terlihat di pulau',
    badgeColor: '#d97706',
    colors: {
      tunicHex: 0xd97706,
      pantsHex: 0x14532d,
      hatHex: 0x713f12,
      skinHex: 0xfed7aa,
      packHex: 0x92400e,
      featherHex: 0x22d3ee,
    },
  },
  {
    id: 'luna_violet',
    name: 'Luna Mistika',
    roleTitle: 'Ahli Mantra Kata',
    tagline: 'Seragam ungu mistik penakluk menara dan gua',
    badgeColor: '#7c3aed',
    colors: {
      tunicHex: 0x7c3aed,
      pantsHex: 0x312e81,
      hatHex: 0x4c1d95,
      skinHex: 0xffe4e6,
      packHex: 0x5b21b6,
      featherHex: 0xf472b6,
    },
  },
  {
    id: 'nusa_teal',
    name: 'Nusa Samudra',
    roleTitle: 'Penyelam Kepulauan',
    tagline: 'Tunik toska laut tropis dengan aksesori koral',
    badgeColor: '#0d9488',
    colors: {
      tunicHex: 0x0d9488,
      pantsHex: 0x0f172a,
      hatHex: 0xb45309,
      skinHex: 0xfdba74,
      packHex: 0x115e59,
      featherHex: 0xfb7185,
    },
  },
];

export const DEFAULT_CHARACTER_ID: CharacterPresetId = 'hoot_emerald';

export function getCharacterPreset(id?: string | null): CharacterPreset {
  const found = CHARACTER_PRESETS.find((c) => c.id === id);
  return found ?? CHARACTER_PRESETS[0];
}

const CHAR_STORAGE_KEY = 'diglosa_character_id';
const NAME_STORAGE_KEY = 'diglosa_player_name';

export function loadSavedCharacterId(): CharacterPresetId {
  try {
    const raw = localStorage.getItem(CHAR_STORAGE_KEY);
    if (CHARACTER_PRESETS.some((c) => c.id === raw)) {
      return raw as CharacterPresetId;
    }
  } catch {
    // ignore
  }
  return DEFAULT_CHARACTER_ID;
}

export function saveCharacterId(id: CharacterPresetId): void {
  try {
    localStorage.setItem(CHAR_STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

export function loadSavedPlayerName(fallback = 'Petualang'): string {
  try {
    const raw = localStorage.getItem(NAME_STORAGE_KEY);
    if (raw && raw.trim().length > 0) return raw.trim().slice(0, 24);
  } catch {
    // ignore
  }
  return fallback;
}

export function savePlayerName(name: string): void {
  try {
    const clean = name.trim().slice(0, 24);
    if (clean) localStorage.setItem(NAME_STORAGE_KEY, clean);
  } catch {
    // ignore
  }
}

/**
 * 8 pre-verified open, flat, obstacle-free spawn anchors across Desa Sapaan.
 * Also post-validated inside RpgWorldEngine against buildings, trees, and water.
 */
export const RANDOM_SPAWN_POINTS: SpawnPointDef[] = [
  { id: 'alun_timur', label: 'Alun-Alun Timur', x: -1.5, z: 124.5, yaw: Math.PI * 0.9 },
  { id: 'pelataran_selatan', label: 'Pelataran Selatan', x: -7.5, z: 133.5, yaw: Math.PI * 0.95 },
  { id: 'padang_utara', label: 'Padang Utara Desa', x: -10.5, z: 103.5, yaw: 0.12 },
  { id: 'taman_timur', label: 'Taman Timur Desa', x: 11.5, z: 125.0, yaw: -Math.PI * 0.55 },
  { id: 'jalan_barat', label: 'Jalan Barat Desa', x: -11.5, z: 132.0, yaw: Math.PI * 0.75 },
  { id: 'pesisir_selatan', label: 'Pesisir Selatan Desa', x: -12.5, z: 141.5, yaw: Math.PI },
  { id: 'padang_bunga', label: 'Padang Bunga Timur', x: 14.0, z: 114.5, yaw: -Math.PI * 0.65 },
  { id: 'gerbang_utara', label: 'Gerbang Jembatan Desa', x: -10.0, z: 91.5, yaw: 0.25 },
];
