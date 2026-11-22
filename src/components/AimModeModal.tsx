import React, { useEffect, useState } from 'react';
import { Check, Crosshair, Sparkles, X } from 'lucide-react';
import { AimMode } from '../types/game';
import { RpgBoardPanel, RpgNameplate, RpgPillButton } from './RpgUiKit';

interface AimModeModalProps {
  open: boolean;
  initialMode: AimMode;
  onConfirm: (mode: AimMode) => void;
  onCancel: () => void;
}

export const AimModeModal: React.FC<AimModeModalProps> = ({
  open,
  initialMode,
  onConfirm,
  onCancel,
}) => {
  const [selected, setSelected] = useState<AimMode>(initialMode);

  useEffect(() => {
    if (open) setSelected(initialMode);
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.code === 'Enter') {
        e.preventDefault();
        onConfirm(selected);
      } else if (e.code === 'ArrowLeft' || e.code === 'Digit1') {
        setSelected('auto');
      } else if (e.code === 'ArrowRight' || e.code === 'Digit2') {
        setSelected('manual');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel, onConfirm, selected]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-[#060b16]/82 p-3 sm:p-5">
      <div className="my-auto w-full max-w-2xl">
        <RpgBoardPanel>
          <div className="mb-3 flex items-center justify-between gap-2">
            <RpgNameplate className="min-w-0">
              <span className="truncate text-sm font-black tracking-tight text-[#3b1b06] sm:text-base">
                Petualangan Baru · Pilih Gaya Membidik
              </span>
            </RpgNameplate>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Kembali"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-amber-300/60 bg-slate-900/95 text-amber-100 shadow transition hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-3.5 text-center text-xs font-bold leading-relaxed text-amber-100/95 sm:text-sm">
            Bagaimana gaya membidik &amp; menembak yang ingin kamu gunakan dalam petualangan ini?
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Mode 1: Bidik Otomatis */}
            <button
              type="button"
              onClick={() => setSelected('auto')}
              className={`group relative flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition ${
                selected === 'auto'
                  ? 'border-amber-300 bg-gradient-to-b from-amber-950/90 to-slate-950/95 ring-2 ring-amber-400/70 shadow-[0_0_24px_rgba(251,191,36,0.28)]'
                  : 'border-white/15 bg-slate-950/70 hover:border-amber-300/50 hover:bg-slate-900/85'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/50 bg-amber-500/20 text-amber-300">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-sm font-black text-white sm:text-base">
                        1. Bidik Otomatis
                      </div>
                      <div className="text-[11px] font-bold text-amber-300">
                        Kunci Target Cerdas
                      </div>
                    </div>
                  </div>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      selected === 'auto'
                        ? 'border-amber-300 bg-amber-400 text-slate-950'
                        : 'border-white/25 bg-white/5 text-transparent'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                </div>

                <p className="mt-2.5 text-xs font-medium leading-relaxed text-slate-200">
                  Peluru otomatis mengunci &amp; mengarah ke musuh terdekat. Praktis dan santai agar kamu bisa fokus menjelajah &amp; belajar kosakata.
                </p>
              </div>

              <ul className="mt-3 space-y-1 border-t border-white/10 pt-2.5 text-[11px] font-semibold text-amber-100/90">
                <li>• Otomatis mengunci monster terdekat</li>
                <li>• Kamera tengah klasik (RPG santai)</li>
                <li>• Ketuk tanah layar untuk berjalan</li>
              </ul>
            </button>

            {/* Mode 2: Bidik Bebas */}
            <button
              type="button"
              onClick={() => setSelected('manual')}
              className={`group relative flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition ${
                selected === 'manual'
                  ? 'border-cyan-300 bg-gradient-to-b from-cyan-950/90 to-slate-950/95 ring-2 ring-cyan-400/70 shadow-[0_0_24px_rgba(34,211,238,0.28)]'
                  : 'border-white/15 bg-slate-950/70 hover:border-cyan-300/50 hover:bg-slate-900/85'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/50 bg-cyan-500/20 text-cyan-300">
                      <Crosshair className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-sm font-black text-white sm:text-base">
                        2. Bidik Bebas
                      </div>
                      <div className="text-[11px] font-bold text-cyan-300">
                        Crosshair &amp; Scope Presisi
                      </div>
                    </div>
                  </div>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      selected === 'manual'
                        ? 'border-cyan-300 bg-cyan-400 text-slate-950'
                        : 'border-white/25 bg-white/5 text-transparent'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </span>
                </div>

                <p className="mt-2.5 text-xs font-medium leading-relaxed text-slate-200">
                  Kendalikan arah tembakan 100% secara manual lewat crosshair ke segala sudut (atas/bawah), lengkap dengan zoom Scope, recoil &amp; hit marker!
                </p>
              </div>

              <ul className="mt-3 space-y-1 border-t border-white/10 pt-2.5 text-[11px] font-semibold text-cyan-100/90">
                <li>• Bidik crosshair manual 360° &amp; vertikal</li>
                <li>• Mode Scope Zoom (Klik Kanan / Q / Tombol Bidik)</li>
                <li>• Tahan Klik Kiri / Spasi untuk tembak beruntun</li>
              </ul>
            </button>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <span className="text-[11px] font-semibold text-amber-200/85">
              Pilihan ini tetap bisa kamu ubah kapan saja lewat Menu → Opsi.
            </span>
            <RpgPillButton
              variant="green"
              onClick={() => onConfirm(selected)}
              className="w-full sm:w-auto sm:min-w-[210px]"
            >
              <span>
                Mulai ({selected === 'auto' ? 'Bidik Otomatis' : 'Bidik Bebas'})
              </span>
            </RpgPillButton>
          </div>
        </RpgBoardPanel>
      </div>
    </div>
  );
};
