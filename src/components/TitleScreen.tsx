import React, { useEffect, useState } from 'react';
import {
  Download,
  HelpCircle,
  LogOut,
  RefreshCw,
  Sparkles,
  Trophy,
  User as UserIcon,
  Volume2,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { soundEngine } from '../audio/soundEngine';
import { getCharacterPreset } from '../data/characterPresets';
import { getWordOfTheDay } from '../data/vocabCatalog';
import { CharacterPresetId, LearningModeType } from '../types/game';
import { isFullscreenActive, toggleAppFullscreen } from '../utils/fullscreen';
import { PWAInstallButton } from './PwaControls';

interface TitleScreenProps {
  hasSavedGame: boolean;
  hasResumableRoom?: boolean;
  onContinue: () => void;
  onStartNew: () => void;
  onPlayMenu?: () => void;
  onQuickLearn: (mode: LearningModeType) => void;
  onOpenLeaderboard: () => void;
  onOpenGuide: () => void;
  onOpenProfile?: () => void;
  playerName?: string;
  characterId?: CharacterPresetId;
  bestLocalScore: number;
  user: User | null;
  onSignOut?: () => Promise<void>;
  muted: boolean;
  onToggleMute: () => void;
  disableShortcuts?: boolean;
  offlineReady?: boolean;
  offlineVersion?: string | null;
  onOpenOfflineSync?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasSavedGame,
  hasResumableRoom = false,
  onContinue,
  onStartNew,
  onPlayMenu,
  onQuickLearn,
  onOpenLeaderboard,
  onOpenGuide,
  onOpenProfile,
  playerName = 'Petualang',
  characterId = 'hoot_emerald',
  bestLocalScore,
  user,
  onSignOut,
  muted,
  onToggleMute,
  disableShortcuts = false,
  offlineReady = false,
  offlineVersion = null,
  onOpenOfflineSync,
}) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const wotd = getWordOfTheDay();
  const preset = getCharacterPreset(characterId);
  const resolvedPlayerName = playerName.trim() || 'Petualang';

  useEffect(() => {
    const onFsChange = () => setIsFs(isFullscreenActive());
    onFsChange();
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (disableShortcuts || showQuickMenu || showInfoSheet) return;
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        if (onPlayMenu) onPlayMenu();
        else if (hasSavedGame) onContinue();
        else onStartNew();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [disableShortcuts, hasSavedGame, onContinue, onStartNew, onPlayMenu, showQuickMenu, showInfoSheet]);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3 sm:p-6">
      {/* TOP BAR: Title Logo Upper-Center + Top-Left Profile & Install CTA + Top-Right Medallions */}
      <div className="relative flex w-full items-start justify-center">
        <div className="pointer-events-auto absolute left-0 top-0 flex items-center gap-1.5 sm:gap-2">
          {onOpenProfile && (
            <button
              type="button"
              onClick={() => {
                setShowInfoSheet(false);
                setShowQuickMenu(false);
                onOpenProfile();
              }}
              title="Menu Profil & Nama Karakter"
              className="inline-flex max-w-[140px] items-center gap-1.5 rounded-full border-2 border-amber-300/65 bg-slate-950/85 py-1 pl-1 pr-2.5 text-left text-white shadow-lg backdrop-blur-md transition hover:border-amber-300 hover:bg-slate-900 sm:max-w-[200px] sm:pr-3"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/40 text-xs font-black text-white shadow sm:h-8 sm:w-8"
                style={{ backgroundColor: preset.badgeColor }}
              >
                {resolvedPlayerName.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[11px] font-black text-amber-100 sm:text-xs">
                  {resolvedPlayerName}
                </span>
                <span className="block truncate text-[9px] font-bold text-cyan-300">
                  Menu Profil
                </span>
              </span>
            </button>
          )}
          <PWAInstallButton compact />
        </div>

        <div className="pointer-events-none mx-auto flex flex-col items-center pt-0.5 text-center sm:pt-1">
          <img
            src="./assets/ui/diglosa_logo.png"
            alt="Diglosa - Taklukkan Monster, Kuasai Bahasa!"
            draggable={false}
            className="pointer-events-none h-auto w-[190px] max-h-[28dvh] select-none object-contain drop-shadow-[0_10px_22px_rgba(15,23,42,0.58)] sm:w-[275px] md:w-[340px] lg:w-[390px]"
          />
        </div>

        {/* Top-Right Icon-Only Wood-Gold Medallions */}
        <div className="pointer-events-auto absolute right-0 top-0 flex items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={() => {
              setShowInfoSheet(false);
              onOpenLeaderboard();
            }}
            aria-label="Papan Peringkat"
            title="Papan Peringkat"
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 sm:h-12 sm:w-12"
          >
            <img
              src="./assets/ui/menu_trophy.png"
              alt="Peringkat"
              className="pointer-events-none h-full w-full select-none object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
              draggable={false}
            />
          </button>

          <button
            type="button"
            onClick={() => {
              setShowQuickMenu(false);
              setShowInfoSheet((v) => !v);
            }}
            aria-label="Info, Rekor & Petunjuk"
            title="Info, Rekor & Petunjuk"
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 sm:h-12 sm:w-12 ${
              showInfoSheet ? 'scale-105 ring-2 ring-amber-300' : ''
            }`}
          >
            <img
              src="./assets/ui/menu_guide.png"
              alt="Info & Petunjuk"
              className="pointer-events-none h-full w-full select-none object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
              draggable={false}
            />
            {user && !showInfoSheet && (
              <span className="pointer-events-none absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border border-slate-950 bg-emerald-400 shadow" />
            )}
            {showInfoSheet && (
              <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-amber-200 bg-slate-950/95 text-amber-200 shadow">
                <X className="h-3 w-3" />
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Aktifkan Suara' : 'Matikan Suara'}
            title={muted ? 'Aktifkan Suara' : 'Matikan Suara'}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 sm:h-12 sm:w-12"
          >
            <img
              src={muted ? './assets/ui/menu_sound_off.png' : './assets/ui/menu_sound_on.png'}
              alt={muted ? 'Suara Mati' : 'Suara Nyala'}
              className="pointer-events-none h-full w-full select-none object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
              draggable={false}
            />
          </button>

          <button
            type="button"
            data-fullscreen-toggle="true"
            onClick={() => void toggleAppFullscreen()}
            aria-label={isFs ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            title={isFs ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 sm:h-12 sm:w-12 ${
              isFs ? 'ring-2 ring-cyan-300/80' : ''
            }`}
          >
            <img
              src="./assets/ui/menu_fullscreen.png"
              alt="Layar Penuh"
              className="pointer-events-none h-full w-full select-none object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
              draggable={false}
            />
          </button>

          {/* Unified Info & Menu Popover */}
          {showInfoSheet && (
            <div className="absolute right-0 top-14 z-30 w-72 rounded-2xl border-2 border-amber-300/45 bg-slate-950/92 p-3.5 text-white shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <div className="text-xs font-extrabold text-amber-300">Diglosa 3D RPG</div>
                  <div className="text-[10px] text-slate-300">Petualangan Kata A1 hingga IELTS</div>
                </div>
                {bestLocalScore > 0 && (
                  <div className="rounded-lg bg-amber-500/20 px-2 py-1 text-right">
                    <div className="text-[9px] uppercase text-amber-200">Rekor</div>
                    <div className="font-mono-nums text-xs font-black text-amber-300">
                      {bestLocalScore.toLocaleString('id-ID')}
                    </div>
                  </div>
                )}
              </div>

              {user && (
                <div className="mt-2.5 space-y-2 rounded-xl border border-emerald-400/25 bg-emerald-950/35 px-2.5 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-300/50 bg-emerald-500/25 text-xs font-black text-emerald-200">
                        {(user.displayName || user.email || 'P').slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-black text-white">
                          {resolvedPlayerName}
                        </div>
                        <div className="truncate text-[10px] text-emerald-200/85">
                          {user.email || user.displayName || 'Akun Google Aktif'}
                        </div>
                      </div>
                    </div>
                    {onSignOut && (
                      <button
                        type="button"
                        disabled={logoutBusy}
                        onClick={() => {
                          setLogoutBusy(true);
                          void onSignOut()
                            .catch(() => undefined)
                            .finally(() => {
                              setLogoutBusy(false);
                              setShowInfoSheet(false);
                            });
                        }}
                        title="Logout dari Akun Google"
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-400/45 bg-rose-500/20 px-2.5 py-1.5 text-[10px] font-black text-rose-100 transition hover:bg-rose-500/35 disabled:opacity-50"
                      >
                        <LogOut className="h-3 w-3" />
                        <span>{logoutBusy ? '...' : 'Logout'}</span>
                      </button>
                    )}
                  </div>
                  {onOpenProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowInfoSheet(false);
                        onOpenProfile();
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-300/45 bg-amber-500/20 py-1.5 text-[11px] font-extrabold text-amber-200 transition hover:bg-amber-500/35"
                    >
                      <UserIcon className="h-3.5 w-3.5" />
                      <span>Buka Menu Profil &amp; Ganti Nama</span>
                    </button>
                  )}
                </div>
              )}

              <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
                    <Sparkles className="h-3 w-3" />
                    <span>Kata Hari Ini</span>
                  </div>
                  <div className="truncate text-xs">
                    <strong className="font-black text-white">{wotd.word}</strong>
                    <span className="mx-1 text-slate-400">=</span>
                    <span className="font-semibold text-emerald-300">{wotd.meaningId}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => soundEngine.speakEnglish(wotd.word)}
                  aria-label="Dengar Kata Hari Ini"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/25 text-amber-200 hover:bg-amber-500/40"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowInfoSheet(false);
                    onOpenLeaderboard();
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 py-2 text-xs font-bold text-white hover:bg-white/20"
                >
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  <span>Peringkat</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInfoSheet(false);
                    onOpenGuide();
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 py-2 text-xs font-bold text-white hover:bg-white/20"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-cyan-300" />
                  <span>Petunjuk</span>
                </button>
              </div>

              {onOpenOfflineSync && (
                <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-300">
                      {offlineReady ? 'Aset Offline Terverifikasi' : 'Aset Offline Belum Lengkap'}
                    </div>
                    {offlineVersion && (
                      <div className="truncate font-mono-nums text-[10px] text-emerald-300">
                        v{offlineVersion}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInfoSheet(false);
                      onOpenOfflineSync();
                    }}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-400/20 px-2.5 py-1.5 text-[11px] font-extrabold text-amber-200 hover:bg-amber-400/35 whitespace-nowrap"
                  >
                    {offlineReady ? (
                      <RefreshCw className="h-3 w-3" />
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                    <span>{offlineReady ? 'Cek Update' : 'Unduh'}</span>
                  </button>
                </div>
              )}

              <div className="mt-2 flex justify-center">
                <PWAInstallButton className="w-full" />
              </div>

              <div className="mt-2.5 text-center text-[10px] text-slate-400">
                Gerak: Joystick Kiri / WASD · Kamera: Geser Layar · Aksi: E / Spasi
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM HERO ACTION CLUSTER: Giant Center Play + Flanking Icon Buttons (Zero Text) */}
      <div className="flex flex-col items-center gap-2.5 pb-1 sm:pb-2">
        {showQuickMenu && (
          <div className="pointer-events-auto flex flex-wrap justify-center gap-1.5 rounded-2xl border-2 border-amber-300/40 bg-slate-950/85 p-2 shadow-2xl backdrop-blur-md">
            {(
              [
                ['cards', 'Kartu'],
                ['quiz', 'Kuis'],
                ['listen', 'Dengar'],
                ['type', 'Ejaan'],
                ['match', 'Cocok'],
              ] as Array<[LearningModeType, string]>
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setShowQuickMenu(false);
                  onQuickLearn(m);
                }}
                className="rounded-xl border border-amber-300/25 bg-white/10 px-3.5 py-1.5 text-xs font-extrabold text-amber-100 transition hover:bg-amber-500/30"
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="pointer-events-auto flex items-center justify-center gap-4 sm:gap-6">
          {hasSavedGame && (
            <button
              type="button"
              onClick={onStartNew}
              title="Petualangan Baru (Reset)"
              aria-label="Petualangan Baru"
              className="flex h-[58px] w-[58px] items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 sm:h-[68px] sm:w-[68px]"
            >
              <img
                src="./assets/ui/menu_restart.png"
                alt="Petualangan Baru"
                className="pointer-events-none h-full w-full select-none object-contain drop-shadow-[0_6px_14px_rgba(245,158,11,0.45)]"
                draggable={false}
              />
            </button>
          )}

          {/* Giant Centerpiece Play Button */}
          <button
            type="button"
            onClick={onPlayMenu ? onPlayMenu : hasSavedGame ? onContinue : onStartNew}
            title={
              hasResumableRoom || hasSavedGame
                ? 'Lanjutkan Permainan'
                : 'Mulai Petualangan'
            }
            aria-label={
              hasResumableRoom || hasSavedGame
                ? 'Lanjutkan Permainan'
                : 'Mulai Petualangan'
            }
            className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 sm:h-[108px] sm:w-[108px]"
          >
            <img
              src="./assets/ui/menu_play.png"
              alt="Main"
              className="pointer-events-none h-full w-full select-none object-contain drop-shadow-[0_10px_24px_rgba(34,197,94,0.55)]"
              draggable={false}
            />
            {hasResumableRoom && (
              <span className="pointer-events-none absolute right-1 top-1 h-4 w-4 animate-pulse rounded-full border-2 border-slate-950 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            )}
          </button>

          {/* Quick Learn Spellbook Button */}
          <button
            type="button"
            onClick={() => {
              setShowInfoSheet(false);
              setShowQuickMenu((s) => !s);
            }}
            title="Belajar Cepat"
            aria-label="Belajar Cepat"
            className={`relative flex h-[58px] w-[58px] items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 sm:h-[68px] sm:w-[68px] ${
              showQuickMenu ? 'scale-105 ring-2 ring-sky-300' : ''
            }`}
          >
            <img
              src="./assets/ui/menu_learn.png"
              alt="Belajar Cepat"
              className="pointer-events-none h-full w-full select-none object-contain drop-shadow-[0_6px_14px_rgba(59,130,246,0.45)]"
              draggable={false}
            />
            {showQuickMenu && (
              <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-sky-200 bg-slate-950/95 text-sky-200 shadow">
                <X className="h-3 w-3" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
