import React, { useEffect } from 'react';
import { AlertTriangle, Crown, RotateCcw, Sparkles, X } from 'lucide-react';
import { readSavedGameSummary } from '../three/RpgWorldEngine';
import { RpgAvatarFrame, RpgBoardPanel, RpgNameplate, RpgPillButton } from './RpgUiKit';

interface RetryConfirmModalProps {
  open: boolean;
  hasSavedGame: boolean;
  inActiveRun?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RetryConfirmModal: React.FC<RetryConfirmModalProps> = ({
  open,
  hasSavedGame,
  inActiveRun = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const summary = hasSavedGame ? readSavedGameSummary() : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto overscroll-contain bg-[#060b16]/90 p-2 sm:p-4">
      <div className="my-auto max-h-[94dvh] w-full max-w-md overflow-y-auto overscroll-contain">
        <RpgBoardPanel>
          {/* Header */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <RpgAvatarFrame accentColor="#dc2626">
                <AlertTriangle className="h-6 w-6 text-amber-100 drop-shadow" />
              </RpgAvatarFrame>
              <RpgNameplate className="min-w-0">
                <div className="min-w-0 leading-tight">
                  <h2 className="truncate text-sm font-black tracking-tight text-[#3b1b06] sm:text-base">
                    Ulangi dari Awal (Reset)?
                  </h2>
                  <p className="truncate text-[10px] font-extrabold text-[#78350f] sm:text-[11px]">
                    Konfirmasi Penghapusan Progres
                  </p>
                </div>
              </RpgNameplate>
            </div>

            <button
              type="button"
              onClick={onCancel}
              aria-label="Batal"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:scale-105 active:scale-95"
            >
              <img
                src="./assets/ui/btn_exit.png"
                alt="Batal"
                className="h-full w-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                draggable={false}
              />
            </button>
          </div>

          <div className="space-y-3">
            {/* Warning Notice */}
            <div className="rounded-2xl border border-rose-400/55 bg-gradient-to-br from-rose-950/90 via-slate-900/95 to-amber-950/75 p-3.5 text-xs leading-relaxed text-rose-100 shadow-inner">
              <p className="font-black text-amber-200">
                ⚠️ Perhatian! Semua progres permainan akan hilang permanen.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 font-medium text-slate-200">
                <li>
                  Progres yang tersimpan{' '}
                  <strong className="text-rose-200">tidak dapat dikembalikan (restore)</strong>{' '}
                  setelah kamu setuju.
                </li>
                <li>
                  Level, skor, senjata, amunisi, mahkota, dan kemajuan zona{' '}
                  <strong className="text-white">akan diulang dari awal</strong>.
                </li>
                <li>
                  {inActiveRun
                    ? 'Kamu akan dibawa ke menu pemilihan karakter & mode baru sebelum masuk ke dunia permainan.'
                    : 'Setelah itu kamu akan masuk ke halaman pemilihan karakter & mode baru.'}
                </li>
              </ul>
            </div>

            {/* Existing Save Snapshot */}
            {summary && (
              <div className="rounded-2xl border border-amber-300/35 bg-slate-950/75 p-3">
                <div className="mb-2 flex items-center justify-between gap-2 text-[10.5px] font-extrabold text-amber-200">
                  <span>PROGRES YANG AKAN DIHAPUS</span>
                  <span className="capitalize text-cyan-200">
                    Mode {summary.difficulty} · {summary.zoneName}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-white/10 bg-slate-900/80 px-2 py-1.5">
                    <div className="text-[10px] font-bold text-slate-400">Level &amp; Skor</div>
                    <div className="font-mono-nums text-xs font-black text-amber-300">
                      Lv.{summary.level} · {summary.score.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-900/80 px-2 py-1.5">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
                      <Crown className="h-3 w-3 text-amber-300" />
                      <span>Mahkota</span>
                    </div>
                    <div className="font-mono-nums text-xs font-black text-amber-200">
                      {summary.crowns}/6
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-900/80 px-2 py-1.5">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
                      <Sparkles className="h-3 w-3 text-emerald-300" />
                      <span>Kata</span>
                    </div>
                    <div className="font-mono-nums text-xs font-black text-emerald-300">
                      {summary.wordsMastered} Kata
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-end">
              <RpgPillButton variant="cream" onClick={onCancel} className="sm:min-w-[125px]">
                <X className="h-4 w-4 shrink-0" />
                <span>Batal</span>
              </RpgPillButton>
              <RpgPillButton variant="red" onClick={onConfirm} className="flex-1 sm:flex-initial">
                <RotateCcw className="h-4 w-4 shrink-0" />
                <span>Setuju, Hapus &amp; Mulai Baru</span>
              </RpgPillButton>
            </div>
          </div>
        </RpgBoardPanel>
      </div>
    </div>
  );
};
