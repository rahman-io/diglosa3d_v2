import React, { useEffect, useState } from 'react';
import { Crown, Globe, LogOut, Play, PlusCircle, Sparkles, User as UserIcon, Users } from 'lucide-react';
import { getCharacterPreset } from '../data/characterPresets';
import { readSavedGameSummary } from '../three/RpgWorldEngine';
import { CharacterPresetId, MultiplayerRoomDoc } from '../types/game';
import { RpgAvatarFrame, RpgBoardPanel, RpgNameplate, RpgPillButton } from './RpgUiKit';

interface ResumeSessionModalProps {
  open: boolean;
  playerName: string;
  characterId: CharacterPresetId;
  hasSavedGame: boolean;
  resumableRoom: {
    room: MultiplayerRoomDoc;
    spawnIndex: number;
    isHost: boolean;
  } | null;
  onContinueSolo: () => void;
  onRejoinRoom: () => Promise<void>;
  onDismissResumableRoom: () => Promise<void>;
  onOpenNewModeLobby: () => void;
  onClose: () => void;
}

export const ResumeSessionModal: React.FC<ResumeSessionModalProps> = ({
  open,
  playerName,
  characterId,
  hasSavedGame,
  resumableRoom,
  onContinueSolo,
  onRejoinRoom,
  onDismissResumableRoom,
  onOpenNewModeLobby,
  onClose,
}) => {
  const [busyAction, setBusyAction] = useState<'room' | 'solo' | 'leave' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setBusyAction(null);
      setErrorMsg(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && !busyAction) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, busyAction, onClose]);

  if (!open) return null;

  const summary = hasSavedGame ? readSavedGameSummary() : null;
  const resolvedCharId = summary?.characterId || characterId;
  const preset = getCharacterPreset(resolvedCharId);
  const resolvedName = playerName.trim() || 'Petualang';

  const handleRoomResume = async () => {
    setBusyAction('room');
    setErrorMsg(null);
    try {
      await onRejoinRoom();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal menyambung kembali ke room mabar.',
      );
      setBusyAction(null);
    }
  };

  const handleSoloResume = async () => {
    setBusyAction('solo');
    setErrorMsg(null);
    try {
      if (resumableRoom) {
        await onDismissResumableRoom();
      }
      onContinueSolo();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal melanjutkan progres tersimpan.');
      setBusyAction(null);
    }
  };

  const handleDismissRoom = async () => {
    setBusyAction('leave');
    setErrorMsg(null);
    try {
      await onDismissResumableRoom();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal keluar dari room sebelumnya.');
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-[#060b16]/88 p-2 sm:p-4">
      <div className="my-auto max-h-[94dvh] w-full max-w-xl overflow-y-auto overscroll-contain">
        <RpgBoardPanel>
          {/* Header */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <RpgAvatarFrame accentColor={preset.badgeColor}>
                <Play className="h-6 w-6 fill-current text-white drop-shadow" />
              </RpgAvatarFrame>
              <RpgNameplate className="min-w-0">
                <div className="min-w-0 leading-tight">
                  <h2 className="truncate text-sm font-black tracking-tight text-[#3b1b06] sm:text-base">
                    Lanjutkan Sesi Bermain
                  </h2>
                  <p className="truncate text-[10px] font-extrabold text-[#78350f] sm:text-[11px]">
                    {resolvedName} · {preset.name} ({preset.roleTitle})
                  </p>
                </div>
              </RpgNameplate>
            </div>

            <button
              type="button"
              disabled={Boolean(busyAction)}
              onClick={onClose}
              aria-label="Tutup"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <img
                src="./assets/ui/btn_exit.png"
                alt="Tutup"
                className="h-full w-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                draggable={false}
              />
            </button>
          </div>

          <div className="mb-3 rounded-xl border border-cyan-400/45 bg-cyan-950/60 px-3.5 py-2.5 text-xs leading-relaxed text-cyan-100 shadow-inner">
            <span className="font-black text-amber-200">ℹ️ Melanjutkan Permainan:</span>{' '}
            Menekan tombol <strong>Lanjutkan</strong> akan meneruskan petualangan dari{' '}
            <strong>progres terakhir yang tersimpan</strong> (bukan mengulang dari awal).
          </div>

          {errorMsg && (
            <div className="mb-3 rounded-xl border border-rose-400/50 bg-rose-950/75 px-3 py-2 text-xs font-bold text-rose-100">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="space-y-3">
            {/* Active Multiplayer Room Session */}
            {resumableRoom && (
              <div className="rounded-2xl border border-emerald-400/50 bg-gradient-to-br from-emerald-950/85 via-slate-900/90 to-cyan-950/80 p-3.5 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-200">
                      {resumableRoom.room.mode === 'group' ? (
                        <Users className="h-3 w-3" />
                      ) : (
                        <Globe className="h-3 w-3" />
                      )}
                      <span>
                        {resumableRoom.room.status === 'playing'
                          ? 'Sesi Mabar Sedang Berlangsung'
                          : 'Room Mabar Menunggu'}
                      </span>
                    </span>
                    <span className="rounded-lg border border-amber-300/50 bg-slate-950/85 px-2 py-0.5 font-mono-nums text-xs font-black tracking-widest text-amber-300">
                      {resumableRoom.room.code}
                    </span>
                  </div>
                  <span className="font-mono-nums text-xs font-black text-emerald-200">
                    {resumableRoom.room.memberCount}/{resumableRoom.room.maxPlayers} Pemain
                  </span>
                </div>

                <div className="mt-2 text-xs font-bold text-slate-200">
                  {resumableRoom.room.groupName || 'ELITE SQUAD'} · Level{' '}
                  <span className="capitalize text-white">{resumableRoom.room.difficulty}</span>
                </div>
                <p className="mt-0.5 text-[11px] font-medium text-slate-300">
                  Langsung sambung kembali ke room tanpa perlu pilih karakter atau isi nama ulang.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <RpgPillButton
                    variant="green"
                    disabled={Boolean(busyAction)}
                    onClick={() => void handleRoomResume()}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 shrink-0 fill-current" />
                    <span>
                      {busyAction === 'room'
                        ? 'Menyambungkan...'
                        : `Lanjutkan Room (${resumableRoom.room.code})`}
                    </span>
                  </RpgPillButton>
                  <button
                    type="button"
                    disabled={Boolean(busyAction)}
                    onClick={() => void handleDismissRoom()}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-400/45 bg-rose-950/60 px-3 py-2.5 text-xs font-black text-rose-100 transition hover:bg-rose-900/75 disabled:opacity-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Keluar Room</span>
                  </button>
                </div>
              </div>
            )}

            {/* Active Solo Save Progress */}
            {hasSavedGame && (
              <div className="rounded-2xl border border-amber-300/45 bg-slate-950/65 p-3.5 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-200">
                    <UserIcon className="h-3 w-3" />
                    <span>Progres Petualangan Solo Aktif</span>
                  </span>
                  {summary && (
                    <span className="rounded-lg border border-white/15 bg-slate-900/80 px-2 py-0.5 text-[10.5px] font-extrabold capitalize text-cyan-200">
                      Mode {summary.difficulty} · {summary.zoneName}
                    </span>
                  )}
                </div>

                {summary && (
                  <div className="mt-2.5 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-center">
                      <div className="text-[10px] font-bold text-slate-400">Level &amp; Skor</div>
                      <div className="font-mono-nums text-xs font-black text-amber-300">
                        Lv.{summary.level} · {summary.score.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
                        <Crown className="h-3 w-3 text-amber-300" />
                        <span>Mahkota</span>
                      </div>
                      <div className="font-mono-nums text-xs font-black text-amber-200">
                        {summary.crowns}/6
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/80 px-2.5 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
                        <Sparkles className="h-3 w-3 text-emerald-300" />
                        <span>Kata</span>
                      </div>
                      <div className="font-mono-nums text-xs font-black text-emerald-300">
                        {summary.wordsMastered} Dikuasai
                      </div>
                    </div>
                  </div>
                )}

                <p className="mt-2 text-[11px] font-medium text-slate-300">
                  Klik lanjutkan untuk langsung masuk ke petualangan dengan hitung mundur 3, 2, 1,
                  Siap Mulai!
                </p>

                <div className="mt-3">
                  <RpgPillButton
                    variant="orange"
                    disabled={Boolean(busyAction)}
                    onClick={() => void handleSoloResume()}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 shrink-0 fill-current" />
                    <span>
                      {busyAction === 'solo' ? 'Memuat Dunia...' : 'Lanjutkan Main Sekarang'}
                    </span>
                  </RpgPillButton>
                </div>
              </div>
            )}

            {/* Secondary Option: Start New / Switch Mode */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5">
              <span className="text-[11px] font-semibold text-slate-300">
                Ingin mulai baru, ganti karakter, atau buat room mabar baru?
              </span>
              <RpgPillButton
                variant="cream"
                size="sm"
                disabled={Boolean(busyAction)}
                onClick={onOpenNewModeLobby}
              >
                <PlusCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Main Baru / Mode Lain</span>
              </RpgPillButton>
            </div>
          </div>
        </RpgBoardPanel>
      </div>
    </div>
  );
};
