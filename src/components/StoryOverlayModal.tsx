import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  Bookmark,
  Crown,
  FastForward,
  Feather,
  Heart,
  Languages,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { StoryDialogState } from '../types/game';
import { RpgAvatarFrame, RpgBoardPanel, RpgNameplate, RpgPillButton } from './RpgUiKit';

interface StoryOverlayModalProps {
  story: StoryDialogState | null;
  onAdvance: () => void;
  onSkip: () => void;
  onDefeatChoice: (returnToZone: boolean) => void;
}

export const StoryOverlayModal: React.FC<StoryOverlayModalProps> = ({
  story,
  onAdvance,
  onSkip,
  onDefeatChoice,
}) => {
  const [showEn, setShowEn] = useState(false);

  useEffect(() => {
    setShowEn(false);
  }, [story?.kind, story?.step, story?.speakerName, story?.textId]);

  if (!story) return null;

  const canSkip =
    story.kind === 'opening' ||
    story.kind === 'dungeon_intro' ||
    story.kind === 'dungeon_rescue';

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center overflow-y-auto overscroll-contain touch-pan-y bg-[#060b16]/70 p-2 sm:items-center sm:p-4">
      <div className="my-auto max-h-[94dvh] w-full max-w-xl overflow-y-auto overscroll-contain touch-pan-y">
        <RpgBoardPanel>
          {/* Balanced Inside-Frame Avatar + Parchment Nameplate Header */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 max-w-full items-center gap-2">
              <RpgAvatarFrame accentColor={story.accentColor}>
                {story.kind === 'area_cleared' ? (
                  <Crown className="h-5 w-5" />
                ) : story.kind === 'defeat_exit' ? (
                  <Heart className="h-5 w-5" />
                ) : (
                  <Feather className="h-5 w-5" />
                )}
              </RpgAvatarFrame>

              <RpgNameplate className="min-w-0">
                <div className="min-w-0 leading-tight">
                  <h3 className="truncate text-sm font-black tracking-tight text-[#3b1b06] sm:text-base">
                    {story.speakerName}
                  </h3>
                  <p className="truncate text-[10px] font-extrabold text-[#78350f] sm:text-[11px]">
                    {story.speakerRole}
                  </p>
                </div>
              </RpgNameplate>
            </div>

            {canSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-amber-300/45 bg-slate-900/95 px-3 py-1.5 text-xs font-extrabold text-amber-200 shadow-md transition hover:bg-slate-800"
              >
                <span>Lewati cerita</span>
                <FastForward className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Story Content Body */}
          <div className="space-y-2.5 sm:space-y-3">
            {story.rewardSummary && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-500/15 px-3.5 py-2 text-xs font-extrabold text-amber-200">
                <Award className="h-4 w-4 shrink-0 text-amber-300" />
                <span>{story.rewardSummary}</span>
              </div>
            )}

            {/* Main Story Card — Indonesian First + On-Demand English Toggle */}
            <div className="rounded-2xl border border-amber-300/25 bg-slate-950/50 px-3.5 py-3 shadow-inner sm:px-4 sm:py-3.5">
              <p className="text-sm font-bold leading-relaxed text-white sm:text-[15px]">
                {story.textId}
              </p>

              {showEn && story.textEn && (
                <div className="mt-2.5 rounded-xl border border-sky-400/25 bg-slate-900/75 px-3 py-2">
                  <span className="mr-1.5 inline-block rounded bg-sky-500/25 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-200">
                    English
                  </span>
                  <span className="text-xs font-semibold leading-relaxed text-sky-100 sm:text-sm">
                    {story.textEn}
                  </span>
                </div>
              )}

              {story.textEn && (
                <div className="mt-2.5 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowEn((prev) => !prev)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-extrabold transition ${
                      showEn
                        ? 'border-sky-400/50 bg-sky-500/25 text-sky-100 hover:bg-sky-500/35'
                        : 'border-amber-300/30 bg-slate-900/80 text-amber-200 hover:bg-slate-800'
                    }`}
                  >
                    <Languages className="h-3.5 w-3.5 shrink-0" />
                    <span>{showEn ? 'Tutup Inggris' : 'Lihat Bahasa Inggris'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => soundEngine.speakEnglish(story.textEn)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-400/20 text-amber-200 transition hover:bg-amber-400/35"
                    title="Dengarkan Bahasa Inggris"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {story.sageQuote && story.sageQuote !== story.textId && (
              <div className="rounded-xl border border-amber-300/20 bg-slate-900/60 px-3.5 py-2.5 text-xs font-bold leading-relaxed text-amber-100/90">
                {story.sageQuote}
              </div>
            )}

            {story.ribbonQuote && (
              <div className="rounded-2xl border border-rose-400/45 bg-rose-950/45 p-3.5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-200">
                  <Bookmark className="h-4 w-4 fill-rose-400 text-rose-300" />
                  <span>Pita Merah dari Lila</span>
                  {story.ribbonName && (
                    <span className="ml-auto rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold normal-case tracking-normal text-white">
                      {story.ribbonName}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-extrabold italic leading-relaxed text-rose-50">
                  &ldquo;{story.ribbonQuote}&rdquo;
                </p>
              </div>
            )}

            {/* RPG Pill Action Footer */}
            {story.kind === 'defeat_exit' ? (
              <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:gap-3">
                <RpgPillButton
                  variant="green"
                  onClick={() => onDefeatChoice(true)}
                  className="w-full sm:flex-1"
                >
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  <span>Kembali ke sana</span>
                </RpgPillButton>
                <RpgPillButton
                  variant="cream"
                  onClick={() => onDefeatChoice(false)}
                  className="w-full sm:flex-1"
                >
                  <Heart className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>Istirahat dulu</span>
                </RpgPillButton>
              </div>
            ) : (
              <div className="pt-1">
                <RpgPillButton variant="gold" onClick={onAdvance} className="w-full">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>
                    {story.kind === 'area_cleared'
                      ? 'Hore! Lanjutkan Petualangan'
                      : story.kind === 'dungeon_intro'
                      ? story.step >= 2
                        ? 'Mulai Petualangan Gua!'
                        : 'Lanjut'
                      : story.kind === 'dungeon_rescue'
                      ? story.step >= 2
                        ? 'Hore! Wilayah Bebas!'
                        : 'Lanjut'
                      : story.step >= 3
                      ? 'Mulai Menjelajah Hutan Kata!'
                      : 'Lanjut'}
                  </span>
                  {((story.kind === 'opening' && story.step < 3) ||
                    ((story.kind === 'dungeon_intro' || story.kind === 'dungeon_rescue') &&
                      story.step < 2)) && <ArrowRight className="h-4 w-4 shrink-0" />}
                </RpgPillButton>
              </div>
            )}
          </div>
        </RpgBoardPanel>
      </div>
    </div>
  );
};
