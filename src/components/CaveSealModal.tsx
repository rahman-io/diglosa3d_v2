import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, Volume2, X } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { ZONE_INFO } from '../data/diglosaCatalog';
import { pickDistractors, VOCAB_BY_ID } from '../data/vocabCatalog';
import { CaveSealContext } from '../types/game';

interface CaveSealModalProps {
  seal: CaveSealContext | null;
  onResolve: (blockId: string, correct: boolean, vocabId: string) => void;
  onClose: () => void;
}

export const CaveSealModal: React.FC<CaveSealModalProps> = ({
  seal,
  onResolve,
  onClose,
}) => {
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);

  const challenge = useMemo(() => {
    if (!seal) return null;
    const entry = VOCAB_BY_ID[seal.vocabId];
    if (!entry) return null;
    const distractors = pickDistractors(entry, 3).map((d) => d.meaningId);
    const all = [entry.meaningId, ...distractors];
    // Deterministic-ish shuffle seeded per render
    const indexed = all.map((label, i) => ({ label, isCorrect: i === 0 }));
    for (let i = indexed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
    }
    const correctIndex = indexed.findIndex((item) => item.isCorrect);
    return {
      entry,
      choices: indexed.map((item) => item.label),
      correctIndex,
    };
  }, [seal]);

  useEffect(() => {
    setPickedIndex(null);
    if (challenge) {
      soundEngine.speakEnglish(challenge.entry.word);
    }
  }, [challenge]);

  const handleChoose = (idx: number) => {
    if (!seal || !challenge || pickedIndex !== null) return;
    setPickedIndex(idx);
    const ok = idx === challenge.correctIndex;
    if (ok) soundEngine.playOk();
    else soundEngine.playWrongAnswer();

    window.setTimeout(() => {
      onResolve(seal.blockId, ok, seal.vocabId);
    }, 520);
  };

  useEffect(() => {
    if (!seal || !challenge) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (pickedIndex !== null) return;
      if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3' || e.code === 'Digit4') {
        const idx = Number(e.code.slice(5)) - 1;
        if (idx >= 0 && idx < challenge.choices.length) {
          e.preventDefault();
          handleChoose(idx);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (!seal || !challenge) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto overscroll-contain touch-pan-y bg-slate-950/80 p-2 sm:p-4">
      <div className="my-auto max-h-[92dvh] w-full max-w-md overflow-y-auto overscroll-contain touch-pan-y rounded-2xl border-4 border-purple-500 bg-[#1e1b4b] p-4 text-white shadow-2xl sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-purple-300 bg-purple-700">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wide text-purple-300">
                Obsidian Segel Kata · {ZONE_INFO[seal.zoneId]?.name || 'Gua'}
              </div>
              <h3 className="text-base font-black text-white">
                Pecahkan Segel dengan 1 Soal Kilat!
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border-2 border-purple-400/40 bg-slate-900/90 p-4 text-center">
          <div className="text-[11px] font-bold text-purple-300">
            Apa arti kata Bahasa Inggris berikut?
          </div>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <span className="text-2xl font-black tracking-wide text-amber-300">
              {challenge.entry.word}
            </span>
            <button
              type="button"
              onClick={() => soundEngine.speakEnglish(challenge.entry.word)}
              title="Dengarkan pengucapan"
              className="rounded-lg bg-purple-700 p-1.5 text-white hover:bg-purple-600"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-1 text-xs font-medium text-slate-400">
            {challenge.entry.phonetic}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2">
          {challenge.choices.map((choice, idx) => {
            const isPicked = pickedIndex === idx;
            const isCorrect = idx === challenge.correctIndex;
            let btnClass =
              'border-purple-400/40 bg-slate-800/90 text-white hover:border-amber-300 hover:bg-slate-700';
            if (pickedIndex !== null) {
              if (isCorrect) {
                btnClass = 'border-emerald-400 bg-emerald-600 text-white';
              } else if (isPicked) {
                btnClass = 'border-rose-400 bg-rose-600 text-white';
              } else {
                btnClass = 'border-slate-700 bg-slate-900/60 text-slate-400';
              }
            }
            return (
              <button
                key={`${choice}_${idx}`}
                type="button"
                disabled={pickedIndex !== null}
                onClick={() => handleChoose(idx)}
                className={`flex items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left text-sm font-bold transition ${btnClass}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-black/30 font-mono-nums text-xs font-extrabold">
                  {idx + 1}
                </span>
                <span>{choice}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 text-center text-[11px] font-semibold text-purple-200/80">
          Benar: Segel hancur instan +2 💎 &amp; +4 Peluru · Salah: -1 ❤️
        </div>
      </div>
    </div>
  );
};
