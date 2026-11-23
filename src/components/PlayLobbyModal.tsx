import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  Check,
  ChevronRight,
  Compass,
  Copy,
  Crown,
  Flame,
  Globe,
  Heart,
  LogIn,
  LogOut,
  MapPin,
  Play,
  Shuffle,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import {
  CHARACTER_PRESETS,
  getCharacterPreset,
  RANDOM_SPAWN_POINTS,
} from '../data/characterPresets';
import {
  CharacterPresetId,
  DifficultyMode,
  MultiplayerMemberDoc,
  MultiplayerRoomDoc,
  PlayModeType,
  SpawnPreference,
} from '../types/game';

interface PlayLobbyModalProps {
  open: boolean;
  user: User | null;
  initialDifficulty: DifficultyMode;
  characterId: CharacterPresetId;
  playerName: string;
  activeRoom: MultiplayerRoomDoc | null;
  roomMembers: MultiplayerMemberDoc[];
  mySpawnIndex: number;
  onPreviewCharacter: (id: CharacterPresetId, name: string) => void;
  onSignIn: () => Promise<void>;
  onConfirmSolo: (difficulty: DifficultyMode, spawnMode: SpawnPreference) => void;
  onCreateGroupRoom: (difficulty: DifficultyMode) => Promise<void>;
  onJoinGroupRoom: (code: string) => Promise<void>;
  onJoinPublicRoom: (difficulty: DifficultyMode) => Promise<void>;
  onStartMultiplayerMatch: () => Promise<void>;
  onEnterPlayingRoom: () => void;
  onLeaveRoom: () => Promise<void>;
  onCancel: () => void;
}

interface DifficultyCardSpec {
  id: DifficultyMode;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  accentHex: string;
  borderSelected: string;
  glowClass: string;
  badgeClass: string;
  bottomBarClass: string;
  iconBgClass: string;
  highlights: string[];
  Icon: React.ComponentType<{ className?: string }>;
}

const DIFFICULTY_CARDS: DifficultyCardSpec[] = [
  {
    id: 'santai',
    title: 'Santai',
    subtitle: 'Belajar & Eksplorasi',
    badge: 'RAMAH PEMULA',
    image: './assets/aistudio/Easy_e28c90a2.jpeg',
    accentHex: '#4ade80',
    borderSelected: 'border-emerald-300 ring-2 ring-emerald-400/80',
    glowClass: 'shadow-[0_0_24px_rgba(74,222,128,0.3)]',
    badgeClass: 'border-emerald-300/60 bg-emerald-500/25 text-emerald-200',
    bottomBarClass: 'from-emerald-400 via-teal-300 to-emerald-400',
    iconBgClass: 'border-emerald-300/60 bg-emerald-500/25 text-emerald-200',
    highlights: [
      '6 ❤️ awal · Regen cepat 55 dtk',
      '4–6 monster malam · 0 penembak',
      'Timer kuis 20 dtk · Duel bebas waktu',
    ],
    Icon: Heart,
  },
  {
    id: 'petualang',
    title: 'Petualang',
    subtitle: 'Seimbang & Seru',
    badge: 'STANDAR',
    image: './assets/aistudio/Medium_868df2a3.jpeg',
    accentHex: '#38bdf8',
    borderSelected: 'border-sky-300 ring-2 ring-cyan-400/85',
    glowClass: 'shadow-[0_0_26px_rgba(56,189,248,0.35)]',
    badgeClass: 'border-sky-300/60 bg-sky-500/25 text-sky-100',
    bottomBarClass: 'from-sky-400 via-cyan-300 to-amber-300',
    iconBgClass: 'border-sky-300/60 bg-sky-500/25 text-sky-100',
    highlights: [
      '5 ❤️ awal · 1 monster penembak',
      '6–10 monster malam · 2 penjaga gua',
      'Timer kuis 12 dtk · Bonus Skor 1.25x',
    ],
    Icon: Compass,
  },
  {
    id: 'pendekar',
    title: 'Pendekar',
    subtitle: 'Tantangan & Skor Tinggi',
    badge: 'TANTANGAN',
    image: './assets/aistudio/Hard_9eb17eeb.jpeg',
    accentHex: '#f97316',
    borderSelected: 'border-amber-300 ring-2 ring-orange-400/85',
    glowClass: 'shadow-[0_0_28px_rgba(249,115,22,0.35)]',
    badgeClass: 'border-orange-300/65 bg-orange-500/25 text-amber-100',
    bottomBarClass: 'from-amber-400 via-orange-500 to-rose-500',
    iconBgClass: 'border-orange-300/60 bg-orange-500/25 text-amber-200',
    highlights: [
      '4 ❤️ awal · 2 penembak cepat',
      '9–13 monster malam · Gerak 1.3x',
      'Kuis 8 dtk · Duel 12 dtk · Skor & XP 1.5x',
    ],
    Icon: Flame,
  },
];

function toCssHex(num: number): string {
  return `#${num.toString(16).padStart(6, '0')}`;
}

export const PlayLobbyModal: React.FC<PlayLobbyModalProps> = ({
  open,
  user,
  initialDifficulty,
  characterId,
  playerName,
  activeRoom,
  roomMembers,
  mySpawnIndex,
  onPreviewCharacter,
  onSignIn,
  onConfirmSolo,
  onCreateGroupRoom,
  onJoinGroupRoom,
  onJoinPublicRoom,
  onStartMultiplayerMatch,
  onEnterPlayingRoom,
  onLeaveRoom,
  onCancel,
}) => {
  const [playMode, setPlayMode] = useState<PlayModeType>('solo');
  const [difficulty, setDifficulty] = useState<DifficultyMode>(initialDifficulty);
  const [spawnPref, setSpawnPref] = useState<SpawnPreference>('random');
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (open) {
      setDifficulty(initialDifficulty);
      setErrorMsg(null);
    }
  }, [open, initialDifficulty]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Escape' && !activeRoom) {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, activeRoom, onCancel]);

  if (!open) return null;

  const isVerifiedUser = Boolean(user && user.emailVerified);
  const isHost = Boolean(activeRoom && user && activeRoom.hostUid === user.uid);
  const activePreset = getCharacterPreset(characterId);
  const activeDiffSpec =
    DIFFICULTY_CARDS.find((c) => c.id === difficulty) || DIFFICULTY_CARDS[1];

  const handleCopyCode = async () => {
    if (!activeRoom?.code) return;
    try {
      await navigator.clipboard.writeText(activeRoom.code);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const runAction = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErrorMsg(null);
    try {
      await fn();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kendala saat menghubungkan room.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_50%_20%,rgba(30,58,138,0.5),rgba(4,9,22,0.94))] p-2.5 backdrop-blur-md sm:p-4">
      <div className="my-auto flex w-full max-w-5xl flex-col gap-3 rounded-3xl border border-white/15 bg-slate-950/75 p-3 shadow-2xl sm:gap-3.5 sm:p-5">
        {/* Top Lobby Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="inline-flex shrink-0 items-center rounded-lg border border-sky-300/40 bg-sky-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-200 sm:text-xs">
              {activeRoom ? 'Ruang Tunggu Mabar' : 'Petualangan Baru'}
            </span>
            <h2 className="truncate text-base font-black tracking-tight text-white drop-shadow sm:text-xl">
              {activeRoom
                ? activeRoom.mode === 'group'
                  ? `Room Grup · Kode ${activeRoom.code}`
                  : `Room Publik · Kode ${activeRoom.code}`
                : 'Pilih Karakter & Mode Permainan'}
            </h2>
          </div>

          {!activeRoom && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Tutup"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-slate-900/80 text-slate-100 transition hover:border-white/50 hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Section 1: Character & Name Selector (shared across Solo & Multiplayer) */}
        <div className="rounded-2xl border border-white/12 bg-slate-900/65 p-2.5 sm:p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/25 shadow"
                style={{ backgroundColor: activePreset.badgeColor }}
              >
                <UserIcon className="h-4 w-4 text-white" />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-black text-white">
                  Karakter: {activePreset.name}
                </div>
                <div className="truncate text-[10px] font-medium text-slate-300">
                  {activePreset.roleTitle} · {activePreset.tagline}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="lobby-player-name"
                className="shrink-0 text-[11px] font-bold text-slate-300"
              >
                Nama:
              </label>
              <input
                id="lobby-player-name"
                type="text"
                maxLength={24}
                value={playerName}
                onChange={(e) => onPreviewCharacter(characterId, e.target.value)}
                placeholder="Nama Petualang"
                className="w-full rounded-xl border border-white/20 bg-slate-950/85 px-3 py-1.5 text-xs font-bold text-white outline-none transition focus:border-cyan-400 sm:w-44"
              />
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-1.5 sm:grid-cols-6 sm:gap-2">
            {CHARACTER_PRESETS.map((preset) => {
              const selected = preset.id === characterId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onPreviewCharacter(preset.id, playerName)}
                  className={`flex flex-col items-start gap-1 rounded-xl border px-2 py-1.5 text-left transition ${
                    selected
                      ? 'border-cyan-300 bg-cyan-500/20 ring-1 ring-cyan-300/75'
                      : 'border-white/12 bg-slate-950/60 hover:border-white/35 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <span
                        className="h-3.5 w-3.5 rounded-sm border border-white/40"
                        style={{ backgroundColor: toCssHex(preset.colors.tunicHex) }}
                      />
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-white/35"
                        style={{ backgroundColor: toCssHex(preset.colors.featherHex) }}
                      />
                    </div>
                    {selected && <Check className="h-3.5 w-3.5 text-cyan-300" />}
                  </div>
                  <div className="w-full truncate text-[11px] font-extrabold text-white">
                    {preset.name.split(' ')[0]}
                  </div>
                  <div className="w-full truncate text-[9px] font-medium text-slate-300">
                    {preset.roleTitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="max-w-full overflow-hidden break-words rounded-xl border border-rose-400/50 bg-rose-950/75 px-3.5 py-2 text-xs font-bold text-rose-100 [overflow-wrap:anywhere]">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Section 2: Active Room Lobby OR Mode Selector */}
        {activeRoom ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-cyan-400/35 bg-slate-900/80 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/45 bg-cyan-500/15 px-3 py-1 text-xs font-black text-cyan-200">
                  {activeRoom.mode === 'group' ? (
                    <Users className="h-3.5 w-3.5" />
                  ) : (
                    <Globe className="h-3.5 w-3.5" />
                  )}
                  <span>{activeRoom.mode === 'group' ? 'Mode Grup' : 'Mode Publik'}</span>
                </span>

                <div className="flex items-center gap-1.5 rounded-xl border border-amber-300/45 bg-slate-950 px-3 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Kode:
                  </span>
                  <span className="font-mono-nums text-sm font-black tracking-widest text-amber-300">
                    {activeRoom.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleCopyCode()}
                    className="ml-1 inline-flex items-center gap-1 rounded-lg border border-white/15 bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-100 hover:bg-slate-700"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-300" />
                        <span>Disalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>

                <span className="rounded-full border border-white/15 bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold text-slate-200">
                  Level: <strong className="capitalize text-white">{activeRoom.difficulty}</strong>
                </span>
              </div>

              <span className="font-mono-nums text-xs font-black text-emerald-300">
                {roomMembers.length} / {activeRoom.maxPlayers} Pemain Siap
              </span>
            </div>

            {/* Member Grid */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {roomMembers.map((member) => {
                const preset = getCharacterPreset(member.characterId);
                const spawnInfo =
                  RANDOM_SPAWN_POINTS[
                    Math.abs(member.spawnIndex) % RANDOM_SPAWN_POINTS.length
                  ];
                const isMe = user?.uid === member.uid;
                return (
                  <div
                    key={member.uid}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${
                      isMe
                        ? 'border-cyan-300/60 bg-cyan-950/40'
                        : 'border-white/12 bg-slate-950/75'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/30 text-xs font-black text-white shadow"
                        style={{ backgroundColor: preset.badgeColor }}
                      >
                        {member.displayName.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-black text-white">
                            {member.displayName}
                          </span>
                          {member.isHost && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/25 px-1.5 py-0.5 text-[9px] font-black text-amber-200">
                              <Crown className="h-2.5 w-2.5" /> Host
                            </span>
                          )}
                          {isMe && (
                            <span className="rounded bg-cyan-500/25 px-1.5 py-0.5 text-[9px] font-black text-cyan-200">
                              Kamu
                            </span>
                          )}
                        </div>
                        <div className="truncate text-[10px] font-medium text-slate-300">
                          {preset.name} · 📍 {spawnInfo.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col justify-between gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 sm:flex-row sm:items-center">
              <div className="text-[11px] font-medium text-slate-300">
                <strong className="text-cyan-200">Titik Spawn Kamu:</strong>{' '}
                {RANDOM_SPAWN_POINTS[Math.abs(mySpawnIndex) % RANDOM_SPAWN_POINTS.length].label} ·
                Koneksi langsung WebRTC P2P (Chat & Suara aktif di dalam game).
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void runAction(onLeaveRoom)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/40 bg-rose-950/60 px-3.5 py-2 text-xs font-black text-rose-100 transition hover:bg-rose-900/70 disabled:opacity-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar Room</span>
                </button>

                {activeRoom.status === 'playing' ? (
                  <button
                    type="button"
                    onClick={onEnterPlayingRoom}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/70 bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-black text-white shadow-lg transition hover:brightness-110"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Masuk Dunia Sekarang</span>
                  </button>
                ) : isHost ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void runAction(onStartMultiplayerMatch)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300/70 bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-xs font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>{busy ? 'Memulai...' : 'Mulai Mabar Sekarang'}</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-amber-300/35 bg-amber-500/15 px-3.5 py-2 text-xs font-bold text-amber-100">
                    ⏳ Menunggu Host memulai permainan...
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 3 Game Mode Tabs: Solo / Group / Public */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPlayMode('solo');
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-black transition sm:text-sm ${
                  playMode === 'solo'
                    ? 'border-sky-300 bg-sky-500/25 text-white shadow-[0_0_18px_rgba(56,189,248,0.28)]'
                    : 'border-white/15 bg-slate-900/70 text-slate-300 hover:border-white/35 hover:text-white'
                }`}
              >
                <UserIcon className="h-4 w-4 shrink-0 text-sky-300" />
                <span className="truncate">Private (Sendiri)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlayMode('multiplayer_group');
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-black transition sm:text-sm ${
                  playMode === 'multiplayer_group'
                    ? 'border-amber-300 bg-amber-500/25 text-white shadow-[0_0_18px_rgba(245,158,11,0.28)]'
                    : 'border-white/15 bg-slate-900/70 text-slate-300 hover:border-white/35 hover:text-white'
                }`}
              >
                <Users className="h-4 w-4 shrink-0 text-amber-300" />
                <span className="truncate">Multiplayer Grup</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlayMode('multiplayer_public');
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-black transition sm:text-sm ${
                  playMode === 'multiplayer_public'
                    ? 'border-emerald-300 bg-emerald-500/25 text-white shadow-[0_0_18px_rgba(16,185,129,0.28)]'
                    : 'border-white/15 bg-slate-900/70 text-slate-300 hover:border-white/35 hover:text-white'
                }`}
              >
                <Globe className="h-4 w-4 shrink-0 text-emerald-300" />
                <span className="truncate">Multiplayer Publik</span>
              </button>
            </div>

            {playMode === 'solo' ? (
              <>
                {/* 3 Portrait Difficulty Cards */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
                  {DIFFICULTY_CARDS.map((card) => {
                    const isSelected = difficulty === card.id;
                    const Icon = card.Icon;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setDifficulty(card.id)}
                        onDoubleClick={() => onConfirmSolo(card.id, spawnPref)}
                        className={`group relative flex min-h-[165px] flex-col justify-between overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 sm:min-h-[245px] ${
                          isSelected
                            ? `${card.borderSelected} ${card.glowClass} scale-[1.01] brightness-105`
                            : 'border-white/20 opacity-85 hover:border-white/45 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={card.image}
                          alt={card.title}
                          className={`absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 ${
                            isSelected ? 'scale-105' : 'group-hover:scale-105'
                          }`}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-[#040918]" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-[#030714] via-[#050b1d]/90 to-transparent" />

                        <div className="relative z-10 flex items-center justify-between gap-2 p-2.5 sm:p-3">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[9.5px] font-black tracking-wider backdrop-blur-sm ${card.badgeClass}`}
                          >
                            {card.badge}
                          </span>
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-xl border backdrop-blur-sm ${card.iconBgClass}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                        </div>

                        <div className="relative z-10 mt-auto p-3">
                          <div className="text-[10px] font-bold tracking-wide text-slate-200/90">
                            {card.subtitle}
                          </div>
                          <div className="text-xl font-black tracking-tight text-white drop-shadow sm:text-2xl">
                            {card.title}
                          </div>
                          <ul className="mt-1.5 space-y-0.5 border-t border-white/15 pt-1.5 text-[10.5px] font-semibold leading-snug text-slate-100/95">
                            {card.highlights.map((item) => (
                              <li key={item} className="flex items-center gap-1.5">
                                <span
                                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                                  style={{ backgroundColor: card.accentHex }}
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div
                          className={`relative z-10 h-1.5 w-full bg-gradient-to-r transition-opacity ${card.bottomBarClass} ${
                            isSelected ? 'opacity-100' : 'opacity-25 group-hover:opacity-65'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Spawn Option + Solo CTA */}
                <div className="flex flex-col justify-between gap-2.5 rounded-2xl border border-white/12 bg-slate-900/75 px-3.5 py-2.5 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-300">Lokasi Spawn:</span>
                    <button
                      type="button"
                      onClick={() => setSpawnPref('random')}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[11px] font-extrabold transition ${
                        spawnPref === 'random'
                          ? 'border-cyan-300 bg-cyan-500/20 text-cyan-100'
                          : 'border-white/15 bg-slate-950/60 text-slate-300 hover:border-white/35'
                      }`}
                    >
                      <Shuffle className="h-3 w-3" />
                      <span>Acak Aman (8 Titik)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpawnPref('default')}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[11px] font-extrabold transition ${
                        spawnPref === 'default'
                          ? 'border-amber-300 bg-amber-500/20 text-amber-100'
                          : 'border-white/15 bg-slate-950/60 text-slate-300 hover:border-white/35'
                      }`}
                    >
                      <MapPin className="h-3 w-3" />
                      <span>Desa Sapaan (Standar)</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onConfirmSolo(difficulty, spawnPref)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sky-300/60 bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-[0_6px_22px_rgba(14,165,233,0.4)] transition hover:brightness-110 active:translate-y-0.5 sm:w-auto sm:min-w-[230px]"
                  >
                    <span>Mulai Solo ({activeDiffSpec.title})</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : !isVerifiedUser ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-cyan-400/30 bg-slate-900/75 p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-500/15 text-cyan-200">
                  <LogIn className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white sm:text-base">
                    Masuk Google untuk Bermain Multiplayer Gratis
                  </h3>
                  <p className="mt-1 max-w-md text-xs font-medium text-slate-300">
                    Akun Google menjaga room P2P WebRTC tetap aman tanpa spam dan sinkron antar
                    perangkat. 100% gratis tanpa biaya server tambahan.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void runAction(onSignIn)}
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-300/60 bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{busy ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
                </button>
              </div>
            ) : playMode === 'multiplayer_group' ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Create Group Room */}
                <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-300/30 bg-slate-900/75 p-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Buat Room Grup (Host)
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-300">
                      Buat kode room 6 huruf lalu bagikan ke teman (maks 6 pemain, spawn acak agar
                      tidak bertumpuk).
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {DIFFICULTY_CARDS.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDifficulty(d.id)}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-black transition ${
                            difficulty === d.id
                              ? 'border-amber-300 bg-amber-500/25 text-amber-100'
                              : 'border-white/15 bg-slate-950/70 text-slate-300 hover:border-white/35'
                          }`}
                        >
                          {d.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void runAction(() => onCreateGroupRoom(difficulty))}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-xs font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
                  >
                    <Users className="h-4 w-4" />
                    <span>{busy ? 'Membuat Room...' : 'Buat Room Grup Baru'}</span>
                  </button>
                </div>

                {/* Join Group Room */}
                <div className="flex flex-col justify-between gap-3 rounded-2xl border border-cyan-300/30 bg-slate-900/75 p-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-cyan-300">
                      Gabung Dengan Kode Teman
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-300">
                      Masukkan kode 6 karakter dari temanmu untuk langsung masuk ke pulau yang sama.
                    </p>
                    <input
                      type="text"
                      maxLength={12}
                      value={joinCode}
                      onChange={(e) =>
                        setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                      }
                      placeholder="CONTOH: K7M2XP"
                      className="mt-3 w-full rounded-xl border border-white/20 bg-slate-950 px-3.5 py-2.5 font-mono-nums text-sm font-black tracking-widest text-cyan-100 outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={busy || joinCode.trim().length < 4}
                    onClick={() => void runAction(() => onJoinGroupRoom(joinCode))}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/60 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-45"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span>{busy ? 'Mencari Room...' : 'Gabung Room Sekarang'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-between gap-3 rounded-2xl border border-emerald-300/35 bg-slate-900/75 p-4 sm:flex-row sm:items-center">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-200">
                    <Globe className="h-3 w-3" />
                    <span>Matchmaking Publik P2P Otomatis</span>
                  </div>
                  <h3 className="text-sm font-black text-white sm:text-base">
                    Main Bersama Siapa Saja di Mana Saja
                  </h3>
                  <p className="max-w-xl text-xs font-medium text-slate-300">
                    Sistem otomatis mencari room publik yang masih kosong (maks 6 pemain) atau
                    membuat room terbuka baru. Semua pemain muncul di titik acak aman Desa Sapaan
                    dengan Chat Teks &amp; Suara langsung.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-300">
                      Preferensi jika buat room baru:
                    </span>
                    {DIFFICULTY_CARDS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDifficulty(d.id)}
                        className={`rounded-lg border px-2 py-0.5 text-[10px] font-black transition ${
                          difficulty === d.id
                            ? 'border-emerald-300 bg-emerald-500/25 text-emerald-100'
                            : 'border-white/15 bg-slate-950/70 text-slate-300'
                        }`}
                      >
                        {d.title}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void runAction(() => onJoinPublicRoom(difficulty))}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-300/65 bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-xs font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
                >
                  <Globe className="h-4 w-4" />
                  <span>{busy ? 'Mencari Pemain...' : 'Cari & Gabung Room Publik'}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
