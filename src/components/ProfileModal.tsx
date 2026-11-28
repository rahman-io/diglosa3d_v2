import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  Award,
  Check,
  Crown,
  Edit3,
  LogOut,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  X,
} from 'lucide-react';
import {
  CHARACTER_PRESETS,
  getCharacterPreset,
  sanitizeCharacterName,
} from '../data/characterPresets';
import { CharacterPresetId, UserProfileRecord } from '../types/game';
import { scrollFieldIntoView, useVisualViewport } from '../utils/useVisualViewport';
import { HeroPreviewCanvas } from './HeroPreviewCanvas';
import { RpgAvatarFrame, RpgBoardPanel, RpgNameplate, RpgPillButton } from './RpgUiKit';

interface ProfileModalProps {
  open: boolean;
  user: User | null;
  userProfile: UserProfileRecord | null;
  bestLocalScore: number;
  playerName: string;
  characterId: CharacterPresetId;
  onSaveProfileName: (nextName: string) => Promise<void>;
  onSelectCharacter?: (nextId: CharacterPresetId) => void;
  onSignOut?: () => Promise<void>;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  user,
  userProfile,
  bestLocalScore,
  playerName,
  characterId,
  onSaveProfileName,
  onSelectCharacter,
  onSignOut,
  onClose,
}) => {
  const [nameDraft, setNameDraft] = useState(playerName);
  const [saving, setSaving] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const vp = useVisualViewport(open);

  useEffect(() => {
    if (open) {
      setNameDraft(playerName);
      setStatusMsg(null);
    }
  }, [open, playerName]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const activePreset = getCharacterPreset(characterId);
  const cleanDraft = sanitizeCharacterName(nameDraft);
  const isDraftValid = cleanDraft.length >= 2;
  const hasNameChanged = cleanDraft !== sanitizeCharacterName(playerName);
  const displayBestScore = Math.max(bestLocalScore, userProfile?.bestScore || 0);
  const highestLevel = userProfile?.highestLevel || 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDraftValid || saving) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      await onSaveProfileName(cleanDraft);
      setNameDraft(cleanDraft);
      setStatusMsg({
        kind: 'ok',
        text: `Nama karakter akun berhasil diperbarui menjadi "${cleanDraft}".`,
      });
    } catch (err) {
      setStatusMsg({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Gagal menyimpan nama karakter.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ top: `${vp.offsetTop}px`, height: `${vp.height}px` }}
      className="fixed left-0 right-0 z-[65] flex items-center justify-center overflow-y-auto overscroll-contain bg-[#060b16]/80 p-2 backdrop-blur-md sm:p-4"
    >
      <div className="my-auto max-h-[94dvh] w-full max-w-2xl overflow-y-auto overscroll-contain">
        <RpgBoardPanel>
          {/* Header */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <RpgAvatarFrame accentColor={activePreset.badgeColor}>
                <UserIcon className="h-6 w-6 text-white drop-shadow" />
              </RpgAvatarFrame>
              <RpgNameplate className="min-w-0">
                <div className="min-w-0 leading-tight">
                  <h2 className="truncate text-sm font-black tracking-tight text-[#3b1b06] sm:text-base">
                    Profil Akun &amp; Nama Karakter
                  </h2>
                  <p className="truncate text-[10px] font-extrabold text-[#78350f] sm:text-[11px]">
                    1 Akun Google = 1 Nama Karakter Tetap
                  </p>
                </div>
              </RpgNameplate>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Profil"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:scale-105 active:scale-95"
            >
              <img
                src="./assets/ui/btn_exit.png"
                alt="Tutup"
                className="h-full w-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                draggable={false}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
            {/* Left Column: 3D Character Preview & Stats */}
            <div className="flex flex-col justify-between gap-2.5 rounded-2xl border border-sky-300/25 bg-[#0b1a36]/85 p-3">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/60">
                <HeroPreviewCanvas characterId={characterId} className="h-44 sm:h-48" />
              </div>

              <div className="space-y-1 text-center">
                <div className="truncate text-sm font-black text-white">
                  {cleanDraft || playerName || activePreset.name}
                </div>
                <span
                  className="inline-flex rounded-md border border-white/25 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white"
                  style={{ backgroundColor: activePreset.badgeColor }}
                >
                  {activePreset.name} · {activePreset.roleTitle}
                </span>
              </div>

              {onSelectCharacter && (
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                    Karakter Bawaan Akun
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {CHARACTER_PRESETS.map((preset) => {
                      const active = preset.id === characterId;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => onSelectCharacter(preset.id)}
                          className={`truncate rounded-lg border px-1.5 py-1 text-[10px] font-black transition ${
                            active
                              ? 'border-amber-300 bg-amber-500/25 text-amber-100 ring-1 ring-amber-300/60'
                              : 'border-white/15 bg-slate-950/70 text-slate-300 hover:border-white/35 hover:text-white'
                          }`}
                        >
                          {preset.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Google Account Info + Character Name Form */}
            <div className="flex flex-col justify-between gap-3">
              {/* Google Account Card */}
              <div className="rounded-2xl border border-emerald-400/30 bg-slate-950/65 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Avatar'}
                        className="h-10 w-10 shrink-0 rounded-full border-2 border-emerald-300/60 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-300/60 bg-emerald-600/30 text-sm font-black text-emerald-100">
                        {(user?.displayName || user?.email || playerName || 'P')
                          .slice(0, 1)
                          .toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-black text-white">
                          {user?.displayName || 'Akun Petualang'}
                        </span>
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      </div>
                      <div className="truncate text-[11px] font-medium text-emerald-200/85">
                        {user?.email || 'Sesi Akun Aktif'}
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
                            onClose();
                          });
                      }}
                      className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-rose-400/45 bg-rose-950/60 px-2.5 py-1.5 text-[11px] font-black text-rose-100 transition hover:bg-rose-900/75 disabled:opacity-50"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>{logoutBusy ? '...' : 'Logout'}</span>
                    </button>
                  )}
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-white/10 pt-2.5">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/75 px-2.5 py-1.5">
                    <Award className="h-4 w-4 shrink-0 text-amber-300" />
                    <div className="min-w-0">
                      <div className="text-[9.5px] font-bold uppercase text-slate-400">
                        Rekor Skor
                      </div>
                      <div className="truncate font-mono-nums text-xs font-black text-amber-200">
                        {displayBestScore.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/75 px-2.5 py-1.5">
                    <Crown className="h-4 w-4 shrink-0 text-cyan-300" />
                    <div className="min-w-0">
                      <div className="text-[9.5px] font-bold uppercase text-slate-400">
                        Level Tertinggi
                      </div>
                      <div className="truncate font-mono-nums text-xs font-black text-cyan-200">
                        Lv. {highestLevel}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Character Name Editor (the ONLY place to change account character name) */}
              <form
                onSubmit={(e) => void handleSubmit(e)}
                className="flex flex-col gap-2.5 rounded-2xl border border-amber-300/35 bg-slate-950/70 p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-200">
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Nama Karakter Akun</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-cyan-300/35 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-200">
                    <Sparkles className="h-3 w-3" />
                    <span>Khusus Menu Profil</span>
                  </span>
                </div>

                <p className="text-[11px] font-medium leading-relaxed text-slate-300">
                  Satu akun Google menggunakan 1 nama karakter tetap untuk mode Solo, Multiplayer,
                  dan Papan Peringkat, sehingga kamu tidak akan ditanya isi nama lagi saat bermain.
                </p>

                <div>
                  <label
                    htmlFor="profile-character-name"
                    className="mb-1 block text-[11px] font-extrabold text-slate-200"
                  >
                    Nama Karakter (2–24 karakter)
                  </label>
                  <input
                    id="profile-character-name"
                    type="text"
                    maxLength={24}
                    value={nameDraft}
                    onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                    onChange={(e) => {
                      setNameDraft(e.target.value);
                      setStatusMsg(null);
                    }}
                    placeholder="Masukkan nama karakter..."
                    className="w-full rounded-xl border-2 border-amber-300/35 bg-slate-900/95 px-3.5 py-2.5 text-sm font-black text-white outline-none transition focus:border-amber-300"
                  />
                  <div className="mt-1 flex items-center justify-between text-[10.5px] font-bold">
                    <span className={isDraftValid ? 'text-emerald-300' : 'text-rose-300'}>
                      {isDraftValid
                        ? `Aktif sebagai "${cleanDraft}"`
                        : 'Minimal 2 karakter diperlukan.'}
                    </span>
                    <span className="font-mono-nums text-slate-400">
                      {nameDraft.trim().length}/24
                    </span>
                  </div>
                </div>

                {statusMsg && (
                  <div
                    className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                      statusMsg.kind === 'ok'
                        ? 'border-emerald-400/50 bg-emerald-950/70 text-emerald-100'
                        : 'border-rose-400/50 bg-rose-950/70 text-rose-100'
                    }`}
                  >
                    {statusMsg.kind === 'ok' ? '✓ ' : '⚠️ '}
                    {statusMsg.text}
                  </div>
                )}

                <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
                  <RpgPillButton variant="cream" size="sm" onClick={onClose}>
                    <span>Tutup</span>
                  </RpgPillButton>
                  <RpgPillButton
                    type="submit"
                    variant="green"
                    size="sm"
                    disabled={!isDraftValid || saving || !hasNameChanged}
                  >
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    <span>{saving ? 'Menyimpan...' : 'Simpan Nama Karakter'}</span>
                  </RpgPillButton>
                </div>
              </form>
            </div>
          </div>
        </RpgBoardPanel>
      </div>
    </div>
  );
};
