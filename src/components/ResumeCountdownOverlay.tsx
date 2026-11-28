import React, { useEffect, useRef, useState } from 'react';
import { soundEngine } from '../audio/soundEngine';

interface ResumeCountdownOverlayProps {
  active: boolean;
  subtitle?: string;
  playerName?: string;
  onComplete: () => void;
}

type CountdownStep = 3 | 2 | 1 | 'go';

export const ResumeCountdownOverlay: React.FC<ResumeCountdownOverlayProps> = ({
  active,
  subtitle = 'Melanjutkan Petualangan',
  playerName,
  onComplete,
}) => {
  const [step, setStep] = useState<CountdownStep>(3);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) return;

    setStep(3);
    soundEngine.playCountdownTick(3);

    const t1 = window.setTimeout(() => {
      setStep(2);
      soundEngine.playCountdownTick(2);
    }, 750);

    const t2 = window.setTimeout(() => {
      setStep(1);
      soundEngine.playCountdownTick(1);
    }, 1500);

    const t3 = window.setTimeout(() => {
      setStep('go');
      soundEngine.playCountdownTick('go');
    }, 2250);

    const t4 = window.setTimeout(() => {
      onCompleteRef.current();
    }, 2900);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [active]);

  if (!active) return null;

  const isGo = step === 'go';

  return (
    <div
      role="dialog"
      aria-live="assertive"
      aria-label="Hitung mundur siap bermain"
      className="fixed inset-0 z-[75] flex flex-col items-center justify-center bg-slate-950/76 px-4 text-center select-none"
    >
      <div className="mb-4 flex flex-col items-center gap-1.5">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-slate-950/90 px-4 py-1 text-xs font-black uppercase tracking-wider text-amber-200 shadow-lg sm:text-sm">
          {subtitle}
        </span>
        {playerName && (
          <span className="text-xs font-extrabold text-cyan-200 drop-shadow sm:text-sm">
            Petualang: {playerName}
          </span>
        )}
      </div>

      <div
        key={String(step)}
        className={`flex items-center justify-center rounded-3xl border-2 px-8 py-5 shadow-[0_0_50px_rgba(251,191,36,0.38)] transition-transform duration-200 ${
          isGo
            ? 'border-emerald-300/85 bg-gradient-to-b from-emerald-600/90 to-teal-900/90 shadow-[0_0_60px_rgba(52,211,153,0.55)]'
            : 'border-amber-300/80 bg-gradient-to-b from-slate-900/92 to-slate-950/95'
        }`}
      >
        {isGo ? (
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-black tracking-tight text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.65)] sm:text-5xl">
              SIAP MULAI!
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-100">
              Ayo Lanjutkan!
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="font-mono-nums text-7xl font-black leading-none text-amber-300 drop-shadow-[0_6px_18px_rgba(245,158,11,0.55)] sm:text-8xl">
              {step}
            </span>
            <span className="mt-1 text-[11px] font-extrabold uppercase tracking-widest text-slate-300">
              Bersiap...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
