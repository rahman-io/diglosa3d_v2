import { CharacterPreset, CharacterPresetId, SpawnPointDef } from '../types/game';

export const CHARACTER_PRESETS: CharacterPreset[] = [
  {
    id: 'hoot_emerald',
    name: 'Hoot',
    roleTitle: 'Burung Hantu Penolong',
    ageLabel: 'Youth',
    tagline: 'Jubah bulu burung hantu & lentera penuntun malam',
    perkText: 'Sangat lincah dengan penglihatan malam (Night Vision).',
    hpStat: 120,
    atkStat: 15,
    nrgStat: 180,
    badgeColor: '#b45309',
    colors: {
      tunicHex: 0xa1622e,
      pantsHex: 0x4d4a32,
      hatHex: 0x8c5a32,
      skinHex: 0xfed7aa,
      packHex: 0x7c4a21,
      featherHex: 0xfacc15,
    },
  },
  {
    id: 'aria_sky',
    name: 'Aria',
    roleTitle: 'Penerjemah Agung',
    ageLabel: 'Youth',
    tagline: 'Hijab tenun Nusantara, mantel cendekiawan & kitab rune',
    perkText: 'Ahli mengurai rune kuno & menerjemahkan bahasa.',
    hpStat: 130,
    atkStat: 20,
    nrgStat: 160,
    badgeColor: '#0d9488',
    colors: {
      tunicHex: 0x14b8a6,
      pantsHex: 0x1e293b,
      hatHex: 0x0d9488,
      skinHex: 0xf1b288,
      packHex: 0x47413c,
      featherHex: 0xec4899,
    },
  },
  {
    id: 'karsa_crimson',
    name: 'Karsa',
    roleTitle: 'Petualang Tangguh',
    ageLabel: 'Young Adult',
    tagline: 'Rompi taktik tanpa lengan, pelindung lengan & beliung tambang',
    perkText: 'Pertahanan tinggi & efisiensi menambang di gua.',
    hpStat: 200,
    atkStat: 45,
    nrgStat: 120,
    badgeColor: '#65a30d',
    colors: {
      tunicHex: 0x6b7048,
      pantsHex: 0x44403c,
      hatHex: 0x4a2f1d,
      skinHex: 0xf3b489,
      packHex: 0x3f3f46,
      featherHex: 0x94a3b8,
    },
  },
  {
    id: 'raka_gold',
    name: 'Raka',
    roleTitle: 'Sain Saintis Muda',
    ageLabel: 'Youth',
    tagline: 'Kacamata pemindai siber, jaket neon biru & tablet pemeta',
    perkText: 'Pemetaan cerdas berbasis pemindai (Scanner Mapping).',
    hpStat: 110,
    atkStat: 25,
    nrgStat: 150,
    badgeColor: '#0284c7',
    colors: {
      tunicHex: 0x1e293b,
      pantsHex: 0x0f172a,
      hatHex: 0x5c3a21,
      skinHex: 0xfed7aa,
      packHex: 0x0ea5e9,
      featherHex: 0x22d3ee,
    },
  },
  {
    id: 'luna_violet',
    name: 'Luna',
    roleTitle: 'Penjaga Alam',
    ageLabel: 'Youth',
    tagline: 'Mahkota bunga rimba, rambut kepang, jubah hijau & busur alam',
    perkText: 'Berbisik dengan satwa & kecepatan melacak di hutan.',
    hpStat: 150,
    atkStat: 30,
    nrgStat: 170,
    badgeColor: '#16a34a',
    colors: {
      tunicHex: 0x15803d,
      pantsHex: 0x3f2e21,
      hatHex: 0x6b3e26,
      skinHex: 0xffe4e6,
      packHex: 0x78350f,
      featherHex: 0x4ade80,
    },
  },
  {
    id: 'nusa_teal',
    name: 'Nusa',
    roleTitle: 'Pengembara Bahari',
    ageLabel: 'Youth',
    tagline: 'Sirip telinga bahari, zirah sisik biru-emas & trisula samudra',
    perkText: 'Kecepatan berenang bawah air & napas tanpa batas.',
    hpStat: 160,
    atkStat: 35,
    nrgStat: 140,
    badgeColor: '#0ea5e9',
    colors: {
      tunicHex: 0x0ea5e9,
      pantsHex: 0x1e3a8a,
      hatHex: 0x5c3a21,
      skinHex: 0xfdba74,
      packHex: 0x0284c7,
      featherHex: 0xfacc15,
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

/**
 * Titik spawn seragam di Alun-Alun Desa Sapaan untuk seluruh 2-6 pemain dalam satu room.
 * Setiap pemain berjarak ~2.6 meter melingkar agar langsung bertemu tanpa bertumpuk.
 */
export function getMultiplayerGroupSpawnPoint(spawnIndex: number): SpawnPointDef {
  const idx = Math.abs(Math.floor(Number.isFinite(spawnIndex) ? spawnIndex : 0)) % 6;
  const centerX = -6;
  const centerZ = 126;
  const radius = 2.6;
  const angle = idx * ((Math.PI * 2) / 6);
  const x = Math.round((centerX + Math.cos(angle) * radius) * 100) / 100;
  const z = Math.round((centerZ + Math.sin(angle) * radius) * 100) / 100;
  const yaw = Math.atan2(centerX - x, centerZ - z);
  return {
    id: `group_alun_${idx + 1}`,
    label: `Alun-Alun Desa (Formasi #${idx + 1})`,
    x,
    z,
    yaw,
  };
}
