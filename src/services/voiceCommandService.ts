import { CameraMode, WeaponId, ZoneId } from '../types/game';

export type VoiceAction =
  | { type: 'move'; dir: 'forward' | 'backward' | 'left' | 'right' | 'stop'; durationSec?: number; sprint?: boolean }
  | { type: 'jump'; withForward?: boolean }
  | { type: 'dodge' }
  | { type: 'look'; dir: 'back' | 'left' | 'right' | 'up' | 'down' | 'center' }
  | { type: 'camera_mode'; mode: CameraMode | 'toggle' }
  | {
      type: 'goto';
      target:
        | 'forward_point'
        | 'nearest_monster'
        | 'nearest_npc'
        | 'portal'
        | 'door'
        | 'key'
        | 'prison'
        | 'crafting'
        | 'exit'
        | 'starter_weapon';
    }
  | { type: 'exit_dungeon' }
  | { type: 'shoot'; mode: 'single' | 'auto_start' | 'auto_stop' | 'aim_enemy' }
  | { type: 'aim'; mode: 'toggle_scope' | 'auto' | 'manual' | 'pointer_lock' }
  | { type: 'equip_weapon'; target: WeaponId | 'next' | 'prev' }
  | { type: 'ammo'; mode: 'buy' | 'quiz' }
  | { type: 'cave_tool'; tool: 'select_pickaxe' | 'select_torch' | 'select_shield' | 'select_tnt' | 'mine' | 'place_torch' | 'place_shield' | 'trigger_tnt' | 'open_crafting' | 'open_seal' }
  | { type: 'interact' }
  | { type: 'teleport'; zoneId: ZoneId }
  | { type: 'ui'; panel: 'bag' | 'kamus' | 'quests' | 'map' | 'guide' | 'options' | 'leaderboard' | 'quick_learn' | 'pause' }
  | { type: 'audio'; muted: boolean }
  | { type: 'fullscreen' };

export type VoiceCommandCategory =
  | 'Gerak & Navigasi'
  | 'Kamera & Pandangan'
  | 'Menuju Target'
  | 'Pertempuran & Senjata'
  | 'Gua & Alat'
  | 'Interaksi & Menu';

export interface VoiceCommandCatalogEntry {
  id: string;
  category: VoiceCommandCategory;
  phrase: string;
  aliases?: string[];
  description: string;
  action: VoiceAction;
  keywords: string[][]; // Each inner array is a set of substrings/words that together match this command
  priority?: number;
}

export interface VoiceMatchResult {
  entry: VoiceCommandCatalogEntry;
  action: VoiceAction;
  normalizedTranscript: string;
  score: number;
}

/**
 * 120+ Perintah Suara Bahasa Indonesia Natural untuk kontrol penuh gameplay Diglosa 3D.
 */
export const VOICE_COMMAND_CATALOG: VoiceCommandCatalogEntry[] = [
  // ========================
  // 1. GERAK & NAVIGASI (26)
  // ========================
  {
    id: 'move_forward_short',
    category: 'Gerak & Navigasi',
    phrase: 'Jalan sebentar ke depan',
    aliases: ['coba ke depan', 'maju sebentar', 'jalan ke depan', 'maju dikit'],
    description: 'Berjalan maju sebentar lalu berhenti otomatis',
    action: { type: 'move', dir: 'forward', durationSec: 1.7 },
    keywords: [['jalan', 'depan'], ['maju', 'sebentar'], ['maju', 'dikit'], ['coba', 'depan'], ['langkah', 'depan'], ['jalan', 'sebentar'], ['ke depan']],
    priority: 18,
  },
  {
    id: 'move_forward_plain',
    category: 'Gerak & Navigasi',
    phrase: 'Maju',
    aliases: ['ayo maju', 'jalan dong', 'gas maju'],
    description: 'Berjalan maju 2 detik',
    action: { type: 'move', dir: 'forward', durationSec: 2.0 },
    keywords: [['maju'], ['ke depan'], ['jalan']],
    priority: 8,
  },
  {
    id: 'move_forward_cont',
    category: 'Gerak & Navigasi',
    phrase: 'Jalan terus ke depan',
    aliases: ['maju terus', 'jalan terus', 'terus maju'],
    description: 'Berjalan maju terus sampai diperintah berhenti',
    action: { type: 'move', dir: 'forward', durationSec: -1 },
    keywords: [['maju', 'terus'], ['jalan', 'terus'], ['terus', 'depan']],
    priority: 28,
  },
  {
    id: 'move_forward_sprint',
    category: 'Gerak & Navigasi',
    phrase: 'Lari ke depan',
    aliases: ['lari cepat', 'ngebut maju', 'lari terus'],
    description: 'Berlari cepat ke depan',
    action: { type: 'move', dir: 'forward', durationSec: 2.6, sprint: true },
    keywords: [['lari'], ['ngebut'], ['cepat', 'depan'], ['lari', 'terus']],
    priority: 24,
  },
  {
    id: 'move_forward_slow',
    category: 'Gerak & Navigasi',
    phrase: 'Jalan pelan-pelan',
    aliases: ['pelan pelan maju', 'maju pelan'],
    description: 'Melangkah maju sebentar dengan hati-hati',
    action: { type: 'move', dir: 'forward', durationSec: 1.1 },
    keywords: [['pelan'], ['hati hati', 'maju']],
    priority: 16,
  },
  {
    id: 'move_left_short',
    category: 'Gerak & Navigasi',
    phrase: 'Eh coba ke kiri',
    aliases: ['ke kiri', 'jalan ke kiri', 'geser ke kiri', 'belok kiri', 'ke kiri sebentar'],
    description: 'Bergerak/berbelok ke kiri',
    action: { type: 'move', dir: 'left', durationSec: 1.5 },
    keywords: [['ke kiri'], ['belok', 'kiri'], ['geser', 'kiri'], ['coba', 'kiri'], ['arah', 'kiri'], ['kiri']],
    priority: 14,
  },
  {
    id: 'move_left_dikit',
    category: 'Gerak & Navigasi',
    phrase: 'Geser kiri dikit',
    aliases: ['ke kiri sedikit', 'miring kiri'],
    description: 'Geser ke kiri sedikit',
    action: { type: 'move', dir: 'left', durationSec: 0.9 },
    keywords: [['kiri', 'dikit'], ['kiri', 'sedikit'], ['kiri', 'sebentar']],
    priority: 22,
  },
  {
    id: 'move_left_cont',
    category: 'Gerak & Navigasi',
    phrase: 'Jalan ke kiri terus',
    aliases: ['belok kiri terus', 'ke kiri terus'],
    description: 'Bergerak ke kiri terus sampai berhenti',
    action: { type: 'move', dir: 'left', durationSec: -1 },
    keywords: [['kiri', 'terus']],
    priority: 28,
  },
  {
    id: 'move_right_short',
    category: 'Gerak & Navigasi',
    phrase: 'Eh coba ke kanan',
    aliases: ['ke kanan', 'jalan ke kanan', 'geser ke kanan', 'belok kanan', 'ke kanan sebentar'],
    description: 'Bergerak/berbelok ke kanan',
    action: { type: 'move', dir: 'right', durationSec: 1.5 },
    keywords: [['ke kanan'], ['belok', 'kanan'], ['geser', 'kanan'], ['coba', 'kanan'], ['arah', 'kanan'], ['kanan']],
    priority: 14,
  },
  {
    id: 'move_right_dikit',
    category: 'Gerak & Navigasi',
    phrase: 'Geser kanan dikit',
    aliases: ['ke kanan sedikit', 'miring kanan'],
    description: 'Geser ke kanan sedikit',
    action: { type: 'move', dir: 'right', durationSec: 0.9 },
    keywords: [['kanan', 'dikit'], ['kanan', 'sedikit'], ['kanan', 'sebentar']],
    priority: 22,
  },
  {
    id: 'move_right_cont',
    category: 'Gerak & Navigasi',
    phrase: 'Jalan ke kanan terus',
    aliases: ['belok kanan terus', 'ke kanan terus'],
    description: 'Bergerak ke kanan terus sampai berhenti',
    action: { type: 'move', dir: 'right', durationSec: -1 },
    keywords: [['kanan', 'terus']],
    priority: 28,
  },
  {
    id: 'move_back_short',
    category: 'Gerak & Navigasi',
    phrase: 'Mundur sebentar',
    aliases: ['mundur', 'jalan ke belakang', 'mundur dikit', 'langkah mundur'],
    description: 'Berjalan mundur sebentar',
    action: { type: 'move', dir: 'backward', durationSec: 1.4 },
    keywords: [['mundur'], ['jalan', 'belakang'], ['langkah', 'belakang'], ['atret']],
    priority: 18,
  },
  {
    id: 'move_back_cont',
    category: 'Gerak & Navigasi',
    phrase: 'Mundur terus',
    aliases: ['terus mundur'],
    description: 'Berjalan mundur terus sampai berhenti',
    action: { type: 'move', dir: 'backward', durationSec: -1 },
    keywords: [['mundur', 'terus'], ['terus', 'mundur']],
    priority: 28,
  },
  {
    id: 'move_stop',
    category: 'Gerak & Navigasi',
    phrase: 'Berhenti',
    aliases: ['stop', 'diam di tempat', 'jangan gerak', 'cukup', 'udah'],
    description: 'Menghentikan semua gerakan & tembakan otomatis',
    action: { type: 'move', dir: 'stop' },
    keywords: [['berhenti'], ['stop'], ['diam'], ['jangan gerak'], ['tahan']],
    priority: 26,
  },
  {
    id: 'jump_basic',
    category: 'Gerak & Navigasi',
    phrase: 'Lompat',
    aliases: ['loncat', 'lompat ke atas', 'ayo lompat'],
    description: 'Melompat di tempat atau sambil bergerak',
    action: { type: 'jump', withForward: false },
    keywords: [['lompat'], ['loncat']],
    priority: 20,
  },
  {
    id: 'jump_forward',
    category: 'Gerak & Navigasi',
    phrase: 'Lompat ke depan',
    aliases: ['loncat ke depan', 'maju lalu lompat', 'lompati itu'],
    description: 'Bergerak maju sekaligus melompat',
    action: { type: 'jump', withForward: true },
    keywords: [['lompat', 'depan'], ['loncat', 'depan'], ['maju', 'lompat'], ['lompati']],
    priority: 28,
  },
  {
    id: 'dodge_move',
    category: 'Gerak & Navigasi',
    phrase: 'Menghindar',
    aliases: ['elak', 'hindari serangan', 'geser cepat'],
    description: 'Bergerak menghindar cepat + melompat',
    action: { type: 'dodge' },
    keywords: [['menghindar'], ['hindar'], ['elak']],
    priority: 24,
  },
  {
    id: 'turn_around_walk',
    category: 'Gerak & Navigasi',
    phrase: 'Putar balik',
    aliases: ['balik badan', 'balik arah'],
    description: 'Membalikkan arah kamera 180 derajat ke belakang',
    action: { type: 'look', dir: 'back' },
    keywords: [['putar balik'], ['balik badan'], ['balik arah']],
    priority: 26,
  },
  {
    id: 'step_back_dodge',
    category: 'Gerak & Navigasi',
    phrase: 'Menjauh dulu',
    aliases: ['jauhi dulu', 'kabur sebentar'],
    description: 'Mundur cepat menjauhi ancaman',
    action: { type: 'move', dir: 'backward', durationSec: 2.0, sprint: true },
    keywords: [['menjauh'], ['jauhi'], ['kabur']],
    priority: 20,
  },
  {
    id: 'step_forward_little',
    category: 'Gerak & Navigasi',
    phrase: 'Maju satu langkah',
    aliases: ['maju sedikit', 'dekat sedikit'],
    description: 'Maju satu langkah singkat',
    action: { type: 'move', dir: 'forward', durationSec: 0.85 },
    keywords: [['satu langkah'], ['selangkah'], ['maju', 'sedikit']],
    priority: 24,
  },
  {
    id: 'strafe_left_quick',
    category: 'Gerak & Navigasi',
    phrase: 'Minggir ke kiri',
    aliases: ['menepi ke kiri', 'hindar kiri'],
    description: 'Menghindar ke sisi kiri',
    action: { type: 'move', dir: 'left', durationSec: 1.2, sprint: true },
    keywords: [['minggir', 'kiri'], ['menepi', 'kiri'], ['hindar', 'kiri']],
    priority: 24,
  },
  {
    id: 'strafe_right_quick',
    category: 'Gerak & Navigasi',
    phrase: 'Minggir ke kanan',
    aliases: ['menepi ke kanan', 'hindar kanan'],
    description: 'Menghindar ke sisi kanan',
    action: { type: 'move', dir: 'right', durationSec: 1.2, sprint: true },
    keywords: [['minggir', 'kanan'], ['menepi', 'kanan'], ['hindar', 'kanan']],
    priority: 24,
  },
  {
    id: 'run_keep',
    category: 'Gerak & Navigasi',
    phrase: 'Lari terus',
    aliases: ['lari terus ke depan', 'sprint terus'],
    description: 'Berlari terus ke depan tanpa berhenti',
    action: { type: 'move', dir: 'forward', durationSec: -1, sprint: true },
    keywords: [['lari', 'terus'], ['sprint']],
    priority: 30,
  },
  {
    id: 'walk_explore',
    category: 'Gerak & Navigasi',
    phrase: 'Ayo jelajah',
    aliases: ['jalan jalan', 'mulai jalan'],
    description: 'Mulai berjalan maju menjelajah',
    action: { type: 'move', dir: 'forward', durationSec: 2.8 },
    keywords: [['jelajah'], ['jalan jalan'], ['mulai jalan']],
    priority: 18,
  },
  {
    id: 'stand_still',
    category: 'Gerak & Navigasi',
    phrase: 'Tunggu sebentar',
    aliases: ['rem', 'berhenti dulu'],
    description: 'Berhenti sejenak di tempat',
    action: { type: 'move', dir: 'stop' },
    keywords: [['tunggu'], ['berhenti dulu'], ['rem']],
    priority: 24,
  },
  {
    id: 'jump_high',
    category: 'Gerak & Navigasi',
    phrase: 'Loncat tinggi',
    aliases: ['lompat tinggi'],
    description: 'Melompat ke udara',
    action: { type: 'jump', withForward: false },
    keywords: [['lompat', 'tinggi'], ['loncat', 'tinggi']],
    priority: 22,
  },

  // ==========================
  // 2. KAMERA & PANDANGAN (19)
  // ==========================
  {
    id: 'look_back_behind',
    category: 'Kamera & Pandangan',
    phrase: 'Lihat ada di belakang mu',
    aliases: ['lihat di belakang', 'lihat ke belakang', 'ada apa di belakang', 'cek belakang', 'tengok belakang', 'noleh ke belakang'],
    description: 'Memutar kamera 180° untuk melihat apa yang ada di belakangmu',
    action: { type: 'look', dir: 'back' },
    keywords: [
      ['lihat', 'belakang'],
      ['cek', 'belakang'],
      ['tengok', 'belakang'],
      ['noleh', 'belakang'],
      ['nengok', 'belakang'],
      ['ada', 'belakang'],
      ['belakang mu'],
      ['belakangmu'],
    ],
    priority: 36,
  },
  {
    id: 'look_left',
    category: 'Kamera & Pandangan',
    phrase: 'Lihat ke kiri',
    aliases: ['tengok kiri', 'cek kiri', 'noleh ke kiri', 'hadapi kiri'],
    description: 'Menolehkan sudut pandang kamera ke kiri',
    action: { type: 'look', dir: 'left' },
    keywords: [['lihat', 'kiri'], ['tengok', 'kiri'], ['cek', 'kiri'], ['noleh', 'kiri'], ['nengok', 'kiri'], ['pandang', 'kiri']],
    priority: 30,
  },
  {
    id: 'look_right',
    category: 'Kamera & Pandangan',
    phrase: 'Lihat ke kanan',
    aliases: ['tengok kanan', 'cek kanan', 'noleh ke kanan', 'hadapi kanan'],
    description: 'Menolehkan sudut pandang kamera ke kanan',
    action: { type: 'look', dir: 'right' },
    keywords: [['lihat', 'kanan'], ['tengok', 'kanan'], ['cek', 'kanan'], ['noleh', 'kanan'], ['nengok', 'kanan'], ['pandang', 'kanan']],
    priority: 30,
  },
  {
    id: 'look_up',
    category: 'Kamera & Pandangan',
    phrase: 'Lihat ke atas',
    aliases: ['dongak ke atas', 'cek atas', 'lihat langit'],
    description: 'Mengarahkan kamera ke atas',
    action: { type: 'look', dir: 'up' },
    keywords: [['lihat', 'atas'], ['dongak'], ['tengok', 'atas'], ['lihat langit'], ['cek atas']],
    priority: 26,
  },
  {
    id: 'look_down',
    category: 'Kamera & Pandangan',
    phrase: 'Lihat ke bawah',
    aliases: ['tunduk ke bawah', 'cek bawah', 'lihat tanah'],
    description: 'Mengarahkan kamera ke bawah',
    action: { type: 'look', dir: 'down' },
    keywords: [['lihat', 'bawah'], ['tunduk'], ['tengok', 'bawah'], ['lihat tanah'], ['cek bawah']],
    priority: 26,
  },
  {
    id: 'look_center',
    category: 'Kamera & Pandangan',
    phrase: 'Luruskan kamera',
    aliases: ['lihat lurus', 'lihat ke depan', 'reset kamera', 'kamera normal'],
    description: 'Meluruskan pandangan kamera searah karakter',
    action: { type: 'look', dir: 'center' },
    keywords: [['luruskan', 'kamera'], ['lihat lurus'], ['lihat', 'depan'], ['reset kamera']],
    priority: 28,
  },
  {
    id: 'camera_toggle',
    category: 'Kamera & Pandangan',
    phrase: 'Ganti kamera',
    aliases: ['ganti sudut pandang', 'ubah kamera', 'tukar kamera'],
    description: 'Berpindah mode kamera berikutnya',
    action: { type: 'camera_mode', mode: 'toggle' },
    keywords: [['ganti kamera'], ['ubah kamera'], ['sudut pandang'], ['tukar kamera']],
    priority: 26,
  },
  {
    id: 'camera_fps',
    category: 'Kamera & Pandangan',
    phrase: 'Kamera orang pertama',
    aliases: ['mode fps', 'sudut pandang fps', 'kamera dekat'],
    description: 'Mengaktifkan mode kamera First-Person (FPS)',
    action: { type: 'camera_mode', mode: 'first_person' },
    keywords: [['orang pertama'], ['fps'], ['first person']],
    priority: 30,
  },
  {
    id: 'camera_tps',
    category: 'Kamera & Pandangan',
    phrase: 'Kamera belakang',
    aliases: ['mode tps', 'kamera orang ketiga', 'kamera biasa'],
    description: 'Mengaktifkan kamera belakang Third-Person',
    action: { type: 'camera_mode', mode: 'third_back' },
    keywords: [['kamera belakang'], ['tps'], ['orang ketiga'], ['kamera biasa']],
    priority: 30,
  },
  {
    id: 'camera_front',
    category: 'Kamera & Pandangan',
    phrase: 'Kamera depan',
    aliases: ['lihat muka karakter', 'kamera selfie'],
    description: 'Mengaktifkan kamera depan menghadap karakter',
    action: { type: 'camera_mode', mode: 'third_front' },
    keywords: [['kamera depan'], ['selfie'], ['muka karakter']],
    priority: 30,
  },
  {
    id: 'camera_orbit',
    category: 'Kamera & Pandangan',
    phrase: 'Kamera bebas',
    aliases: ['mode orbit', 'kamera 3d bebas'],
    description: 'Mengaktifkan kamera orbit bebas 3D',
    action: { type: 'camera_mode', mode: 'orbit' },
    keywords: [['kamera bebas'], ['mode orbit'], ['orbit']],
    priority: 30,
  },
  {
    id: 'look_around_left',
    category: 'Kamera & Pandangan',
    phrase: 'Ada apa di kiri',
    aliases: ['intip kiri'],
    description: 'Menengok keadaan di sebelah kiri',
    action: { type: 'look', dir: 'left' },
    keywords: [['ada apa', 'kiri'], ['intip kiri']],
    priority: 32,
  },
  {
    id: 'look_around_right',
    category: 'Kamera & Pandangan',
    phrase: 'Ada apa di kanan',
    aliases: ['intip kanan'],
    description: 'Menengok keadaan di sebelah kanan',
    action: { type: 'look', dir: 'right' },
    keywords: [['ada apa', 'kanan'], ['intip kanan']],
    priority: 32,
  },
  {
    id: 'look_behind_watch',
    category: 'Kamera & Pandangan',
    phrase: 'Awas di belakang',
    aliases: ['waspada belakang', 'periksa belakang'],
    description: 'Langsung menengok waspada ke arah belakang',
    action: { type: 'look', dir: 'back' },
    keywords: [['awas', 'belakang'], ['waspada', 'belakang'], ['periksa', 'belakang']],
    priority: 34,
  },
  {
    id: 'camera_zoom_view',
    category: 'Kamera & Pandangan',
    phrase: 'Perbesar pandangan',
    aliases: ['fokus pandangan'],
    description: 'Masuk ke mode kamera FPS agar lebih fokus',
    action: { type: 'camera_mode', mode: 'first_person' },
    keywords: [['perbesar pandangan'], ['fokus pandangan']],
    priority: 24,
  },
  {
    id: 'camera_wide_view',
    category: 'Kamera & Pandangan',
    phrase: 'Jauhkan kamera',
    aliases: ['lihat sekitar luas'],
    description: 'Kembali ke kamera belakang yang lebih luas',
    action: { type: 'camera_mode', mode: 'third_back' },
    keywords: [['jauhkan kamera'], ['sekitar luas']],
    priority: 24,
  },
  {
    id: 'look_center_alt',
    category: 'Kamera & Pandangan',
    phrase: 'Hadap depan lagi',
    aliases: ['kembali menghadap depan'],
    description: 'Meluruskan pandangan ke depan karakter',
    action: { type: 'look', dir: 'center' },
    keywords: [['hadap depan'], ['menghadap depan']],
    priority: 26,
  },
  {
    id: 'look_ceiling',
    category: 'Kamera & Pandangan',
    phrase: 'Cek kelelawar di atas',
    aliases: ['lihat atap gua'],
    description: 'Mengarahkan pandangan ke atas untuk cek kelelawar/langit',
    action: { type: 'look', dir: 'up' },
    keywords: [['kelelawar', 'atas'], ['atap gua']],
    priority: 28,
  },
  {
    id: 'look_floor',
    category: 'Kamera & Pandangan',
    phrase: 'Cek blok di bawah',
    aliases: ['lihat kaki'],
    description: 'Mengarahkan pandangan ke bawah',
    action: { type: 'look', dir: 'down' },
    keywords: [['blok', 'bawah'], ['lihat kaki']],
    priority: 26,
  },

  // ==========================
  // 3. MENUJU TARGET & DUNIA (20)
  // ==========================
  {
    id: 'goto_forward_spot',
    category: 'Menuju Target',
    phrase: 'Coba ke tempat itu',
    aliases: ['pergi ke tempat itu', 'jalan ke sana', 'ke tempat itu', 'pergi ke sana', 'dekati tempat itu', 'kesana', 'samperin itu'],
    description: 'Berjalan otomatis ke objek/titik di depan arah pandang kamera',
    action: { type: 'goto', target: 'forward_point' },
    keywords: [
      ['tempat itu'],
      ['ke sana'],
      ['kesana'],
      ['titik itu'],
      ['arah situ'],
      ['situ'],
      ['samperin itu'],
      ['dekati itu'],
    ],
    priority: 30,
  },
  {
    id: 'goto_monster',
    category: 'Menuju Target',
    phrase: 'Dekati monster itu',
    aliases: ['kejar monster', 'samperin monster', 'cari monster', 'datangi musuh'],
    description: 'Berjalan menuju monster aktif terdekat',
    action: { type: 'goto', target: 'nearest_monster' },
    keywords: [['dekati', 'monster'], ['kejar', 'monster'], ['samperin', 'monster'], ['cari monster'], ['cari musuh'], ['ke monster']],
    priority: 30,
  },
  {
    id: 'goto_npc',
    category: 'Menuju Target',
    phrase: 'Samperin NPC',
    aliases: ['dekati npc', 'pergi ke warga', 'cari pemandu', 'ke orang itu'],
    description: 'Berjalan menuju NPC/pemandu terdekat',
    action: { type: 'goto', target: 'nearest_npc' },
    keywords: [['samperin', 'npc'], ['dekati', 'npc'], ['ke npc'], ['cari npc'], ['ke warga'], ['orang itu']],
    priority: 30,
  },
  {
    id: 'goto_portal',
    category: 'Menuju Target',
    phrase: 'Pergi ke portal',
    aliases: ['ke portal istana', 'dekati portal', 'menuju istana ielts'],
    description: 'Berjalan menuju Portal Istana IELTS',
    action: { type: 'goto', target: 'portal' },
    keywords: [['ke portal'], ['dekati portal'], ['istana ielts'], ['ke istana']],
    priority: 30,
  },
  {
    id: 'goto_door',
    category: 'Menuju Target',
    phrase: 'Dekati pintu gua',
    aliases: ['pergi ke pintu', 'ke pintu tantangan', 'cari pintu'],
    description: 'Berjalan menuju pintu tantangan gua terdekat',
    action: { type: 'goto', target: 'door' },
    keywords: [['ke pintu'], ['dekati pintu'], ['cari pintu'], ['pintu gua']],
    priority: 28,
  },
  {
    id: 'goto_starter_weapon',
    category: 'Menuju Target',
    phrase: 'Ambil senjata awal',
    aliases: ['ke senjata pertama', 'cari ketapel pertama'],
    description: 'Berjalan menuju titik pengambilan senjata pertama',
    action: { type: 'goto', target: 'starter_weapon' },
    keywords: [['senjata awal'], ['senjata pertama'], ['cari ketapel']],
    priority: 32,
  },
  {
    id: 'goto_key',
    category: 'Menuju Target',
    phrase: 'Cari kunci penjara',
    aliases: ['ambil kunci penjara', 'ke kunci'],
    description: 'Berjalan menuju kunci penjara di dalam gua',
    action: { type: 'goto', target: 'key' },
    keywords: [['kunci penjara'], ['cari kunci'], ['ke kunci']],
    priority: 30,
  },
  {
    id: 'goto_prison',
    category: 'Menuju Target',
    phrase: 'Pergi ke penjara rahasia',
    aliases: ['ke penjara', 'selamatkan sandera'],
    description: 'Berjalan menuju penjara rahasia di dalam gua',
    action: { type: 'goto', target: 'prison' },
    keywords: [['penjara'], ['tawanan'], ['sandera']],
    priority: 28,
  },
  {
    id: 'goto_crafting',
    category: 'Menuju Target',
    phrase: 'Pergi ke meja crafting',
    aliases: ['ke meja craft', 'cari meja pembuatan'],
    description: 'Berjalan menuju meja crafting di dalam gua',
    action: { type: 'goto', target: 'crafting' },
    keywords: [['meja craft'], ['meja crafting'], ['ke crafting']],
    priority: 32,
  },
  {
    id: 'goto_exit',
    category: 'Menuju Target',
    phrase: 'Menuju pintu keluar',
    aliases: ['ke pintu keluar', 'cari jalan keluar'],
    description: 'Berjalan menuju pintu keluar gua/istana',
    action: { type: 'goto', target: 'exit' },
    keywords: [['jalan keluar'], ['ke keluar'], ['pintu keluar']],
    priority: 32,
  },
  {
    id: 'exit_dungeon_cmd',
    category: 'Menuju Target',
    phrase: 'Keluar dari gua',
    aliases: ['keluar gua', 'keluar dari istana', 'pulang ke desa'],
    description: 'Keluar dari gua/istana kembali ke dunia utama',
    action: { type: 'exit_dungeon' },
    keywords: [['keluar dari gua'], ['keluar gua'], ['keluar istana'], ['pulang ke desa']],
    priority: 36,
  },
  {
    id: 'tp_desa_sapaan',
    category: 'Menuju Target',
    phrase: 'Pindah ke Desa Sapaan',
    aliases: ['ke hutan kata', 'teleport ke desa sapaan'],
    description: 'Teleport langsung ke Zona 1 (Hutan Kata / Desa Sapaan)',
    action: { type: 'teleport', zoneId: 'desa_sapaan' },
    keywords: [['desa sapaan'], ['hutan kata']],
    priority: 34,
  },
  {
    id: 'tp_pasar_rasa',
    category: 'Menuju Target',
    phrase: 'Pindah ke Pasar Rasa',
    aliases: ['teleport ke pasar rasa', 'ke pasar rasa'],
    description: 'Teleport langsung ke Zona 2 (Pasar Rasa)',
    action: { type: 'teleport', zoneId: 'pasar_rasa' },
    keywords: [['pasar rasa']],
    priority: 34,
  },
  {
    id: 'tp_hutan_satwa',
    category: 'Menuju Target',
    phrase: 'Pindah ke Hutan Satwa',
    aliases: ['teleport ke hutan satwa', 'ke hutan satwa'],
    description: 'Teleport langsung ke Zona 3 (Hutan Satwa)',
    action: { type: 'teleport', zoneId: 'hutan_satwa' },
    keywords: [['hutan satwa']],
    priority: 34,
  },
  {
    id: 'tp_gerbang_kota',
    category: 'Menuju Target',
    phrase: 'Pindah ke Gerbang Kota',
    aliases: ['teleport ke gerbang kota', 'ke gerbang kota'],
    description: 'Teleport langsung ke Zona 4 (Gerbang Kota)',
    action: { type: 'teleport', zoneId: 'gerbang_kota' },
    keywords: [['gerbang kota']],
    priority: 34,
  },
  {
    id: 'tp_menara_waktu',
    category: 'Menuju Target',
    phrase: 'Pindah ke Menara Waktu',
    aliases: ['teleport ke menara waktu', 'ke menara waktu'],
    description: 'Teleport langsung ke Zona 5 (Menara Waktu)',
    action: { type: 'teleport', zoneId: 'menara_waktu' },
    keywords: [['menara waktu']],
    priority: 34,
  },
  {
    id: 'tp_gua_portal',
    category: 'Menuju Target',
    phrase: 'Pindah ke Gua Portal',
    aliases: ['teleport ke gua portal', 'ke gua portal'],
    description: 'Teleport langsung ke Zona 6 (Gua Portal)',
    action: { type: 'teleport', zoneId: 'gua_portal' },
    keywords: [['gua portal']],
    priority: 34,
  },
  {
    id: 'approach_front_obj',
    category: 'Menuju Target',
    phrase: 'Hampiri benda di depan',
    aliases: ['dekati objek di depan', 'ambil itu'],
    description: 'Menghampiri objek terdekat di depan arah kamera',
    action: { type: 'goto', target: 'forward_point' },
    keywords: [['hampiri'], ['benda di depan'], ['objek di depan']],
    priority: 26,
  },

  // ==========================
  // 4. PERTEMPURAN & SENJATA (30)
  // ==========================
  {
    id: 'shoot_monster_target',
    category: 'Pertempuran & Senjata',
    phrase: 'Tembak monster itu',
    aliases: ['tembak musuh', 'serang monster itu', 'hajar monster', 'tembak dia', 'serang dia'],
    description: 'Otomatis mengarahkan bidikan ke monster terdekat lalu menembak',
    action: { type: 'shoot', mode: 'single' },
    keywords: [
      ['tembak', 'monster'],
      ['tembak', 'musuh'],
      ['serang', 'monster'],
      ['serang', 'musuh'],
      ['hajar', 'monster'],
      ['tembak', 'dia'],
      ['tembak', 'itu'],
    ],
    priority: 36,
  },
  {
    id: 'shoot_single',
    category: 'Pertempuran & Senjata',
    phrase: 'Tembak',
    aliases: ['serang', 'dor', 'lepaskan tembakan', 'tembak sekarang'],
    description: 'Membidik target terdekat atau arah crosshair dan menembak',
    action: { type: 'shoot', mode: 'single' },
    keywords: [['tembak'], ['serang'], ['hajar'], ['dor']],
    priority: 18,
  },
  {
    id: 'shoot_auto_start',
    category: 'Pertempuran & Senjata',
    phrase: 'Tembak terus',
    aliases: ['serang terus', 'brondong monster', 'tembaki terus'],
    description: 'Menembak bertubi-tubi secara otomatis hingga diperintah berhenti',
    action: { type: 'shoot', mode: 'auto_start' },
    keywords: [['tembak', 'terus'], ['serang', 'terus'], ['tembaki'], ['brondong']],
    priority: 34,
  },
  {
    id: 'shoot_auto_stop',
    category: 'Pertempuran & Senjata',
    phrase: 'Berhenti menembak',
    aliases: ['stop tembak', 'jangan menembak', 'tahan tembakan'],
    description: 'Menghentikan mode tembak otomatis',
    action: { type: 'shoot', mode: 'auto_stop' },
    keywords: [['berhenti', 'tembak'], ['stop', 'tembak'], ['jangan', 'tembak'], ['tahan tembakan']],
    priority: 38,
  },
  {
    id: 'aim_lock_enemy',
    category: 'Pertempuran & Senjata',
    phrase: 'Bidik monster itu',
    aliases: ['kunci target', 'arahkan ke monster', 'lihat monsternya'],
    description: 'Mengarahkan kamera dan karakter langsung ke monster terdekat',
    action: { type: 'shoot', mode: 'aim_enemy' },
    keywords: [['bidik', 'monster'], ['kunci target'], ['kunci monster'], ['arahkan', 'monster'], ['bidik musuh']],
    priority: 34,
  },
  {
    id: 'aim_toggle_scope',
    category: 'Pertempuran & Senjata',
    phrase: 'Buka scope',
    aliases: ['mode scope', 'tutup scope', 'zoom bidik', 'bidik presisi'],
    description: 'Menyalakan atau mematikan mode Scope / ADS',
    action: { type: 'aim', mode: 'toggle_scope' },
    keywords: [['scope'], ['zoom bidik'], ['bidik presisi'], ['kekar']],
    priority: 30,
  },
  {
    id: 'aim_mode_auto',
    category: 'Pertempuran & Senjata',
    phrase: 'Mode bidik otomatis',
    aliases: ['pakai auto aim', 'bidik otomatis'],
    description: 'Mengubah setelan ke Bidik Otomatis',
    action: { type: 'aim', mode: 'auto' },
    keywords: [['bidik otomatis'], ['auto aim']],
    priority: 32,
  },
  {
    id: 'aim_mode_manual',
    category: 'Pertempuran & Senjata',
    phrase: 'Mode bidik bebas',
    aliases: ['pakai aim manual', 'bidik manual'],
    description: 'Mengubah setelan ke Bidik Bebas (Manual)',
    action: { type: 'aim', mode: 'manual' },
    keywords: [['bidik bebas'], ['bidik manual'], ['aim manual']],
    priority: 32,
  },
  {
    id: 'aim_pointer_lock',
    category: 'Pertempuran & Senjata',
    phrase: 'Kunci kursor mouse',
    aliases: ['kunci mouse', 'lepas kunci mouse'],
    description: 'Mengaktifkan / melepas kunci mouse untuk bidik PC',
    action: { type: 'aim', mode: 'pointer_lock' },
    keywords: [['kunci mouse'], ['kursor']],
    priority: 30,
  },
  {
    id: 'weapon_next',
    category: 'Pertempuran & Senjata',
    phrase: 'Ganti senjata',
    aliases: ['tukar senjata', 'senjata berikutnya', 'senjata lain'],
    description: 'Berpindah ke senjata berikutnya yang sudah dimiliki',
    action: { type: 'equip_weapon', target: 'next' },
    keywords: [['ganti senjata'], ['tukar senjata'], ['senjata berikutnya'], ['senjata lain']],
    priority: 28,
  },
  {
    id: 'weapon_prev',
    category: 'Pertempuran & Senjata',
    phrase: 'Senjata sebelumnya',
    aliases: ['balik ke senjata tadi'],
    description: 'Kembali ke senjata sebelumnya',
    action: { type: 'equip_weapon', target: 'prev' },
    keywords: [['senjata sebelumnya'], ['senjata tadi']],
    priority: 30,
  },
  {
    id: 'weapon_ketapel',
    category: 'Pertempuran & Senjata',
    phrase: 'Pakai ketapel',
    aliases: ['pilih ketapel', 'senjata ketapel'],
    description: 'Memasang senjata Ketapel Kata',
    action: { type: 'equip_weapon', target: 'ketapel' },
    keywords: [['ketapel']],
    priority: 30,
  },
  {
    id: 'weapon_emas',
    category: 'Pertempuran & Senjata',
    phrase: 'Pakai senjata emas',
    aliases: ['pilih senjata emas', 'senjata cepat'],
    description: 'Memasang senjata cepat Desa Sapaan',
    action: { type: 'equip_weapon', target: 'emas' },
    keywords: [['senjata emas'], ['pilih emas'], ['pakai emas']],
    priority: 30,
  },
  {
    id: 'weapon_saus',
    category: 'Pertempuran & Senjata',
    phrase: 'Pakai senjata saus',
    aliases: ['pilih senjata saus', 'senjata pasar'],
    description: 'Memasang senjata Pasar Rasa',
    action: { type: 'equip_weapon', target: 'saus' },
    keywords: [['saus']],
    priority: 30,
  },
  {
    id: 'weapon_biji',
    category: 'Pertempuran & Senjata',
    phrase: 'Pakai senjata biji',
    aliases: ['pilih senjata biji', 'senjata rimba'],
    description: 'Memasang senjata Hutan Satwa',
    action: { type: 'equip_weapon', target: 'biji' },
    keywords: [['biji'], ['senjata rimba']],
    priority: 30,
  },
  {
    id: 'weapon_kertas',
    category: 'Pertempuran & Senjata',
    phrase: 'Pakai laser',
    aliases: ['pakai senjata kertas', 'senjata laser'],
    description: 'Memasang senjata laser Gerbang Kota',
    action: { type: 'equip_weapon', target: 'kertas' },
    keywords: [['laser'], ['kertas']],
    priority: 30,
  },
  {
    id: 'weapon_jarum',
    category: 'Pertempuran & Senjata',
    phrase: 'Pakai senjata berat',
    aliases: ['pakai jarum', 'senjata menara waktu'],
    description: 'Memasang senjata berat Menara Waktu',
    action: { type: 'equip_weapon', target: 'jarum' },
    keywords: [['senjata berat'], ['jarum']],
    priority: 30,
  },
  {
    id: 'weapon_kristal',
    category: 'Pertempuran & Senjata',
    phrase: 'Pakai senjata kristal',
    aliases: ['pakai kristal', 'pilih kristal'],
    description: 'Memasang Senjata Kristal (3 peluru kipas)',
    action: { type: 'equip_weapon', target: 'kristal' },
    keywords: [['kristal']],
    priority: 30,
  },
  {
    id: 'weapon_kerikil',
    category: 'Pertempuran & Senjata',
    phrase: 'Pakai kerikil',
    aliases: ['pilih senjata kerikil'],
    description: 'Memasang senjata Kerikil',
    action: { type: 'equip_weapon', target: 'kerikil' },
    keywords: [['kerikil']],
    priority: 30,
  },
  {
    id: 'weapon_harpun',
    category: 'Pertempuran & Senjata',
    phrase: 'Pakai harpun',
    aliases: ['pilih harpun', 'harpun kristal', 'senjata laut', 'senjata harpun'],
    description: 'Memasang Harpun Kristal Laut untuk menumpas monster laut',
    action: { type: 'equip_weapon', target: 'harpun' },
    keywords: [['harpun'], ['senjata laut']],
    priority: 32,
  },
  {
    id: 'ammo_buy',
    category: 'Pertempuran & Senjata',
    phrase: 'Beli peluru',
    aliases: ['tambah peluru pakai berlian', 'isi amunisi'],
    description: 'Membeli peluru senjata aktif dengan berlian',
    action: { type: 'ammo', mode: 'buy' },
    keywords: [['beli peluru'], ['beli amunisi'], ['tambah peluru']],
    priority: 32,
  },
  {
    id: 'ammo_quiz',
    category: 'Pertempuran & Senjata',
    phrase: 'Isi peluru lewat kuis',
    aliases: ['kuis peluru', 'cari peluru gratis'],
    description: 'Membuka kuis kosakata untuk mengisi peluru',
    action: { type: 'ammo', mode: 'quiz' },
    keywords: [['kuis peluru'], ['peluru gratis'], ['peluru kuis'], ['isi peluru']],
    priority: 34,
  },

  // ==========================
  // 5. GUA, BLOK & ALAT (12)
  // ==========================
  {
    id: 'tool_select_pickaxe',
    category: 'Gua & Alat',
    phrase: 'Pakai beliung',
    aliases: ['pegang beliung', 'pilih beliung'],
    description: 'Memilih Beliung untuk menambang batu gua',
    action: { type: 'cave_tool', tool: 'select_pickaxe' },
    keywords: [['beliung'], ['pacul']],
    priority: 28,
  },
  {
    id: 'tool_mine_block',
    category: 'Gua & Alat',
    phrase: 'Gali batu',
    aliases: ['tambang blok', 'hancurkan batu', 'pecahkan batu', 'gali depan'],
    description: 'Menambang blok gua yang sedang dibidik',
    action: { type: 'cave_tool', tool: 'mine' },
    keywords: [['gali'], ['tambang'], ['hancurkan batu'], ['hancurkan blok'], ['pecahkan batu']],
    priority: 30,
  },
  {
    id: 'tool_select_torch',
    category: 'Gua & Alat',
    phrase: 'Pilih obor',
    aliases: ['pegang obor'],
    description: 'Memilih slot Obor di hotbar',
    action: { type: 'cave_tool', tool: 'select_torch' },
    keywords: [['pilih obor'], ['pegang obor']],
    priority: 28,
  },
  {
    id: 'tool_place_torch',
    category: 'Gua & Alat',
    phrase: 'Pasang obor',
    aliases: ['taruh obor', 'nyalakan obor', 'pakai obor'],
    description: 'Memasang obor penerang di dalam gua',
    action: { type: 'cave_tool', tool: 'place_torch' },
    keywords: [['pasang obor'], ['taruh obor'], ['nyalakan obor'], ['pakai obor'], ['obor']],
    priority: 24,
  },
  {
    id: 'tool_select_shield',
    category: 'Gua & Alat',
    phrase: 'Pilih blok pelindung',
    aliases: ['pegang pelindung'],
    description: 'Memilih slot Blok Pelindung di hotbar',
    action: { type: 'cave_tool', tool: 'select_shield' },
    keywords: [['pilih', 'pelindung'], ['pegang pelindung']],
    priority: 28,
  },
  {
    id: 'tool_place_shield',
    category: 'Gua & Alat',
    phrase: 'Pasang blok pelindung',
    aliases: ['taruh pelindung', 'pasang perisai gua', 'pakai pelindung'],
    description: 'Memasang blok pelindung untuk menahan serangan di gua',
    action: { type: 'cave_tool', tool: 'place_shield' },
    keywords: [['pasang pelindung'], ['blok pelindung'], ['taruh pelindung'], ['pakai pelindung']],
    priority: 30,
  },
  {
    id: 'tool_select_tnt',
    category: 'Gua & Alat',
    phrase: 'Pilih TNT',
    aliases: ['pegang tnt', 'siapkan bom'],
    description: 'Memilih slot TNT Tambang di hotbar',
    action: { type: 'cave_tool', tool: 'select_tnt' },
    keywords: [['pilih tnt'], ['pegang tnt']],
    priority: 28,
  },
  {
    id: 'tool_trigger_tnt',
    category: 'Gua & Alat',
    phrase: 'Ledakkan TNT',
    aliases: ['lempar tnt', 'pasang tnt', 'pakai tnt', 'ledakkan bom'],
    description: 'Memasang dan meledakkan TNT tambang',
    action: { type: 'cave_tool', tool: 'trigger_tnt' },
    keywords: [['tnt'], ['ledakkan'], ['bom']],
    priority: 26,
  },
  {
    id: 'tool_open_crafting',
    category: 'Gua & Alat',
    phrase: 'Buka crafting',
    aliases: ['buat alat', 'rakit item', 'upgrade beliung'],
    description: 'Membuka meja crafting saat berada di dekatnya',
    action: { type: 'cave_tool', tool: 'open_crafting' },
    keywords: [['crafting'], ['craft'], ['buat alat'], ['upgrade beliung'], ['rakit']],
    priority: 30,
  },
  {
    id: 'tool_open_seal',
    category: 'Gua & Alat',
    phrase: 'Pecahkan segel kata',
    aliases: ['buka segel', 'tantangan segel'],
    description: 'Membuka tantangan Segel Kata yang dibidik di gua',
    action: { type: 'cave_tool', tool: 'open_seal' },
    keywords: [['segel kata'], ['buka segel'], ['pecahkan segel']],
    priority: 32,
  },

  // ==========================
  // 6. INTERAKSI & MENU HUD (20)
  // ==========================
  {
    id: 'interact_primary',
    category: 'Interaksi & Menu',
    phrase: 'Bicara sama NPC',
    aliases: ['ajak ngobrol', 'ngobrol', 'buka pintu', 'ambil kunci', 'bebaskan tawanan', 'masuk portal', 'interaksi'],
    description: 'Menjalankan aksi interaksi terdekat (NPC, Pintu, Kunci, Penjara, Portal)',
    action: { type: 'interact' },
    keywords: [
      ['bicara'],
      ['ngobrol'],
      ['buka pintu'],
      ['ambil kunci'],
      ['bebaskan'],
      ['masuk portal'],
      ['interaksi'],
      ['masuk istana'],
    ],
    priority: 26,
  },
  {
    id: 'ui_bag',
    category: 'Interaksi & Menu',
    phrase: 'Buka tas',
    aliases: ['lihat inventaris', 'buka ransel', 'lihat senjata'],
    description: 'Membuka jendela Tas & Senjata',
    action: { type: 'ui', panel: 'bag' },
    keywords: [['buka tas'], ['lihat tas'], ['inventaris'], ['ransel']],
    priority: 30,
  },
  {
    id: 'ui_kamus',
    category: 'Interaksi & Menu',
    phrase: 'Buka kamus',
    aliases: ['lihat kosakata', 'buku kata'],
    description: 'Membuka jendela Kamus kosakata',
    action: { type: 'ui', panel: 'kamus' },
    keywords: [['kamus'], ['kosakata'], ['buku kata']],
    priority: 30,
  },
  {
    id: 'ui_quests',
    category: 'Interaksi & Menu',
    phrase: 'Buka misi',
    aliases: ['cek misi', 'daftar quest', 'tugas sekarang'],
    description: 'Membuka daftar Misi aktif',
    action: { type: 'ui', panel: 'quests' },
    keywords: [['misi'], ['quest'], ['tugas']],
    priority: 28,
  },
  {
    id: 'ui_map',
    category: 'Interaksi & Menu',
    phrase: 'Buka peta',
    aliases: ['lihat map', 'peta dunia'],
    description: 'Membuka Peta 3D Dunia & Teleportasi',
    action: { type: 'ui', panel: 'map' },
    keywords: [['buka peta'], ['lihat peta'], ['buka map'], ['peta dunia']],
    priority: 30,
  },
  {
    id: 'ui_guide',
    category: 'Interaksi & Menu',
    phrase: 'Buka petunjuk',
    aliases: ['bantuan', 'cara main'],
    description: 'Membuka panduan bermain Diglosa 3D',
    action: { type: 'ui', panel: 'guide' },
    keywords: [['petunjuk'], ['panduan'], ['cara main'], ['bantuan']],
    priority: 28,
  },
  {
    id: 'ui_options',
    category: 'Interaksi & Menu',
    phrase: 'Buka pengaturan',
    aliases: ['buka opsi', 'setting game'],
    description: 'Membuka menu Pengaturan',
    action: { type: 'ui', panel: 'options' },
    keywords: [['pengaturan'], ['opsi'], ['setting']],
    priority: 28,
  },
  {
    id: 'ui_leaderboard',
    category: 'Interaksi & Menu',
    phrase: 'Buka ranking',
    aliases: ['papan peringkat', 'lihat skor tertinggi'],
    description: 'Membuka Papan Peringkat Global',
    action: { type: 'ui', panel: 'leaderboard' },
    keywords: [['ranking'], ['peringkat'], ['leaderboard']],
    priority: 28,
  },
  {
    id: 'ui_quick_learn',
    category: 'Interaksi & Menu',
    phrase: 'Mulai kuis belajar',
    aliases: ['latihan kosakata', 'belajar kata sekarang'],
    description: 'Membuka sesi latihan kosakata cepat',
    action: { type: 'ui', panel: 'quick_learn' },
    keywords: [['latihan kosakata'], ['belajar kata'], ['kuis belajar']],
    priority: 30,
  },
  {
    id: 'audio_mute',
    category: 'Interaksi & Menu',
    phrase: 'Matikan suara game',
    aliases: ['bisukan suara', 'mute audio', 'diamkan musik'],
    description: 'Membisukan suara & musik permainan',
    action: { type: 'audio', muted: true },
    keywords: [['matikan suara'], ['bisukan'], ['mute'], ['matikan musik'], ['matikan audio']],
    priority: 32,
  },
  {
    id: 'audio_unmute',
    category: 'Interaksi & Menu',
    phrase: 'Nyalakan suara game',
    aliases: ['aktifkan suara', 'hidupkan musik', 'unmute'],
    description: 'Menyalakan kembali suara & musik permainan',
    action: { type: 'audio', muted: false },
    keywords: [['nyalakan suara'], ['aktifkan suara'], ['hidupkan suara'], ['nyalakan musik'], ['unmute']],
    priority: 32,
  },
  {
    id: 'ui_fullscreen',
    category: 'Interaksi & Menu',
    phrase: 'Layar penuh',
    aliases: ['mode fullscreen', 'perbesar layar'],
    description: 'Mengaktifkan / keluar mode layar penuh',
    action: { type: 'fullscreen' },
    keywords: [['layar penuh'], ['fullscreen'], ['perbesar layar']],
    priority: 30,
  },
  {
    id: 'ui_pause',
    category: 'Interaksi & Menu',
    phrase: 'Jeda game',
    aliases: ['pause', 'istirahat sebentar'],
    description: 'Menjeda permainan sementara',
    action: { type: 'ui', panel: 'pause' },
    keywords: [['jeda'], ['pause'], ['istirahat']],
    priority: 28,
  },
];

// Hitung total frasa unik (phrase + aliases) untuk verifikasi & UI
export const TOTAL_VOICE_PHRASE_VARIATIONS = VOICE_COMMAND_CATALOG.reduce(
  (acc, item) => acc + 1 + (item.aliases?.length || 0),
  0,
);

const FILLER_WORDS = new Set([
  'eh',
  'hei',
  'hai',
  'halo',
  'tolong',
  'coba',
  'dong',
  'deh',
  'yuk',
  'ya',
  'nih',
  'sih',
  'lah',
  'kah',
  'ayo',
  'sekarang',
  'dulu',
]);

export function normalizeVoiceText(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripFillers(normalized: string): string {
  return normalized
    .split(' ')
    .filter((w) => w && !FILLER_WORDS.has(w))
    .join(' ');
}

export function matchVoiceCommand(rawTranscript: string): VoiceMatchResult | null {
  const normalized = normalizeVoiceText(rawTranscript);
  if (!normalized || normalized.length < 2) return null;

  const stripped = stripFillers(normalized);
  const candidates = [normalized, stripped].filter(Boolean);

  let bestEntry: VoiceCommandCatalogEntry | null = null;
  let bestScore = -1;

  for (const entry of VOICE_COMMAND_CATALOG) {
    const basePriority = entry.priority ?? 10;

    // 1. Cek kecocokan langsung dengan phrase utama atau aliases
    const allPhrases = [entry.phrase, ...(entry.aliases || [])].map(normalizeVoiceText);
    for (const p of allPhrases) {
      if (!p) continue;
      for (const text of candidates) {
        if (text === p) {
          const score = 100 + basePriority + p.length;
          if (score > bestScore) {
            bestScore = score;
            bestEntry = entry;
          }
        } else if (text.includes(p)) {
          const score = 60 + basePriority + p.length;
          if (score > bestScore) {
            bestScore = score;
            bestEntry = entry;
          }
        }
      }
    }

    // 2. Cek kecocokan kombinasi kata kunci (keyword group)
    for (const group of entry.keywords) {
      for (const text of candidates) {
        const allMatched = group.every((kw) => {
          if (kw.includes(' ')) {
            return text.includes(kw);
          }
          const tokens = text.split(' ');
          return tokens.includes(kw) || (kw.length >= 4 && text.includes(kw));
        });
        if (allMatched) {
          const specificity = group.reduce((s, k) => s + k.length, 0);
          const score = 40 + basePriority + group.length * 10 + specificity * 0.5;
          if (score > bestScore) {
            bestScore = score;
            bestEntry = entry;
          }
        }
      }
    }
  }

  if (!bestEntry) return null;

  // Sesuaikan durasi secara dinamis jika pengguna menyebut kata waktu ("sebentar", "dikit", "terus")
  let resolvedAction: VoiceAction = bestEntry.action;
  if (resolvedAction.type === 'move' && resolvedAction.dir !== 'stop') {
    let duration = resolvedAction.durationSec ?? 1.6;
    let sprint = Boolean(resolvedAction.sprint);
    if (/\b(terus|selamanya|sampai berhenti)\b/.test(normalized)) {
      duration = -1;
    } else if (/\b(dikit|sedikit|selangkah|sebentar|bentar)\b/.test(normalized)) {
      duration = Math.min(duration > 0 ? duration : 1.4, 1.45);
    }
    if (/\b(lari|cepat|ngebut|sprint)\b/.test(normalized)) {
      sprint = true;
    }
    resolvedAction = {
      ...resolvedAction,
      durationSec: duration,
      sprint,
    };
  }

  return {
    entry: bestEntry,
    action: resolvedAction,
    normalizedTranscript: normalized,
    score: bestScore,
  };
}

// ======================================================
// Browser SpeechRecognition Adapter (id-ID)
// ======================================================

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognitionLike, ev: Event) => unknown) | null;
  onend: ((this: SpeechRecognitionLike, ev: Event) => unknown) | null;
  onerror: ((this: SpeechRecognitionLike, ev: SpeechRecognitionErrorEventLike) => unknown) | null;
  onresult: ((this: SpeechRecognitionLike, ev: SpeechRecognitionEventLike) => unknown) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isVoiceCommandSupported(): boolean {
  return Boolean(getSpeechRecognitionCtor());
}

export interface VoiceListenerCallbacks {
  onStatusChange: (listening: boolean) => void;
  onTranscript: (text: string, isFinal: boolean) => void;
  onCommandMatched: (match: VoiceMatchResult) => void;
  onUnmatched?: (transcript: string) => void;
  onError?: (message: string) => void;
}

export class VoiceCommandController {
  private recognition: SpeechRecognitionLike | null = null;
  private wantListening = false;
  private callbacks: VoiceListenerCallbacks;
  private executedResultIndexes = new Set<number>();
  private lastExecAt = 0;
  private lastExecCmdId = '';
  private interimTimer: number | null = null;
  private restartTimer: number | null = null;

  constructor(callbacks: VoiceListenerCallbacks) {
    this.callbacks = callbacks;
  }

  public isListening(): boolean {
    return this.wantListening;
  }

  public start(): boolean {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      this.callbacks.onError?.('Browser ini belum mendukung pengenalan suara (gunakan Chrome/Edge/Safari terbaru).');
      return false;
    }

    if (this.wantListening && this.recognition) {
      return true;
    }

    this.wantListening = true;
    this.spawnRecognition(Ctor);
    return true;
  }

  public stop(): void {
    this.wantListening = false;
    this.clearTimers();
    this.executedResultIndexes.clear();
    if (this.recognition) {
      try {
        this.recognition.onend = null;
        this.recognition.onerror = null;
        this.recognition.onresult = null;
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
    this.callbacks.onStatusChange(false);
  }

  public toggle(): boolean {
    if (this.wantListening) {
      this.stop();
      return false;
    }
    return this.start();
  }

  private clearTimers(): void {
    if (this.interimTimer !== null) {
      window.clearTimeout(this.interimTimer);
      this.interimTimer = null;
    }
    if (this.restartTimer !== null) {
      window.clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
  }

  private spawnRecognition(Ctor: SpeechRecognitionCtor): void {
    this.clearTimers();
    this.executedResultIndexes.clear();

    const rec = new Ctor();
    rec.lang = 'id-ID';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      if (this.wantListening) {
        this.callbacks.onStatusChange(true);
      }
    };

    rec.onresult = (event) => {
      if (!this.wantListening) return;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const transcript = res[0]?.transcript?.trim() || '';
        if (!transcript) continue;

        this.callbacks.onTranscript(transcript, res.isFinal);

        if (this.executedResultIndexes.has(i)) {
          continue;
        }

        if (res.isFinal) {
          if (this.interimTimer !== null) {
            window.clearTimeout(this.interimTimer);
            this.interimTimer = null;
          }
          this.executedResultIndexes.add(i);
          this.tryDispatchTranscript(transcript, true);
        } else {
          // Debounce interim agar ucapan seperti "eh coba ke kiri" cepat dieksekusi tanpa menunggu lama
          if (this.interimTimer !== null) {
            window.clearTimeout(this.interimTimer);
          }
          const segIndex = i;
          const capturedText = transcript;
          this.interimTimer = window.setTimeout(() => {
            this.interimTimer = null;
            if (!this.wantListening || this.executedResultIndexes.has(segIndex)) return;
            const matched = matchVoiceCommand(capturedText);
            if (matched) {
              this.executedResultIndexes.add(segIndex);
              this.dispatchMatch(matched);
            }
          }, 340);
        }
      }
    };

    rec.onerror = (event) => {
      const code = event.error;
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        this.wantListening = false;
        this.callbacks.onStatusChange(false);
        this.callbacks.onError?.('Izin mikrofon ditolak. Aktifkan akses mikrofon pada browser untuk memakai perintah suara.');
        return;
      }
      if (code === 'audio-capture') {
        this.wantListening = false;
        this.callbacks.onStatusChange(false);
        this.callbacks.onError?.('Mikrofon tidak terdeteksi di perangkat ini.');
        return;
      }
      if (code === 'network') {
        this.callbacks.onError?.('Koneksi ke layanan suara terganggu. Periksa internet atau paket suara offline.');
      }
      // Untuk no-speech / aborted, biarkan onend melakukan restart jika masih wantListening
    };

    rec.onend = () => {
      if (!this.wantListening) {
        this.callbacks.onStatusChange(false);
        return;
      }
      // Auto-restart agar tetap aktif mendengarkan selama tombol Mic menyala
      this.restartTimer = window.setTimeout(() => {
        if (!this.wantListening) return;
        const LatestCtor = getSpeechRecognitionCtor();
        if (LatestCtor) {
          try {
            this.spawnRecognition(LatestCtor);
          } catch {
            this.wantListening = false;
            this.callbacks.onStatusChange(false);
          }
        }
      }, 180);
    };

    this.recognition = rec;
    try {
      rec.start();
    } catch {
      this.wantListening = false;
      this.callbacks.onStatusChange(false);
      this.callbacks.onError?.('Gagal mengaktifkan mikrofon.');
    }
  }

  private tryDispatchTranscript(transcript: string, notifyUnmatched: boolean): void {
    const match = matchVoiceCommand(transcript);
    if (match) {
      this.dispatchMatch(match);
    } else if (notifyUnmatched) {
      this.callbacks.onUnmatched?.(transcript);
    }
  }

  private dispatchMatch(match: VoiceMatchResult): void {
    const now = performance.now();
    if (match.entry.id === this.lastExecCmdId && now - this.lastExecAt < 450) {
      return;
    }
    this.lastExecCmdId = match.entry.id;
    this.lastExecAt = now;
    this.callbacks.onCommandMatched(match);
  }
}
