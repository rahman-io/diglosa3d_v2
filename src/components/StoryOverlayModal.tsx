import React, { useEffect, useRef, useState } from 'react';
import { Award, Bookmark, BookOpen, ChevronRight, Heart, Languages, RotateCcw, SkipForward, Volume2 } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { ZONE_CAVE_STORIES } from '../data/diglosaCatalog';
import { CharacterPresetId, StoryDialogState } from '../types/game';
import { DialogueSpeakerKind } from './DialoguePortraitCanvas';
import { HarvestDialogueBox } from './HarvestDialogueBox';
import { RpgPillButton } from './RpgUiKit';

interface StoryOverlayModalProps {
  story: StoryDialogState | null;
  characterId?: CharacterPresetId;
  playerName?: string;
  onAdvance: () => void;
  onSkip: () => void;
  onDefeatChoice: (returnToZone: boolean) => void;
}

const StorybookPrologueBox: React.FC<{
  story: StoryDialogState;
  onAdvance: () => void;
  onSkip: () => void;
}> = ({ story, onAdvance, onSkip }) => {
  const [showEn, setShowEn] = useState(false);
  const fullText = showEn && story.textEn ? story.textEn : story.textId;
  const [revealedCount, setRevealedCount] = useState(0);
  const timerRef = useRef<number | null>(null);
  const isTyping = revealedCount < fullText.length;

  const totalSteps = (story.maxStep ?? 4) + 1;
  const currentNum = story.step + 1;
  const isLastScene = currentNum >= totalSteps;

  useEffect(() => {
    setShowEn(false);
  }, [story.step, story.textId, story.textEn]);

  useEffect(() => {
    setRevealedCount(0);
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!fullText) return;

    let cursor = 0;
    timerRef.current = window.setInterval(() => {
      cursor += 1;
      setRevealedCount(cursor);
      if (cursor >= fullText.length) {
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 18);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fullText]);

  const handleInteract = () => {
    if (isTyping) {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRevealedCount(fullText.length);
      return;
    }
    onAdvance();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
        e.preventDefault();
        if (isTyping) {
          if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setRevealedCount(fullText.length);
        } else {
          onAdvance();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isTyping, fullText.length, onAdvance]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center px-3 pb-3 sm:px-6 sm:pb-5">
      {/* Subtle top-right scene indicator + skip shortcut for quick access */}
      <div className="pointer-events-auto relative w-full max-w-4xl">
        <div
          role="button"
          tabIndex={0}
          data-no-click-sfx="true"
          onClick={handleInteract}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleInteract();
            }
          }}
          className="cursor-pointer select-none rounded-2xl border-2 border-amber-300/70 bg-gradient-to-b from-slate-950/88 via-slate-900/92 to-slate-950/95 px-4 py-3.5 text-amber-50 shadow-[0_18px_45px_rgba(2,6,23,0.75)] backdrop-blur-md transition focus:outline-none sm:px-6 sm:py-4"
        >
          {/* Header Bar */}
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-amber-300/20 pb-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300/50 bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-black tracking-wide text-amber-200">
                <BookOpen className="h-3.5 w-3.5" />
                <span>
                  Adegan {currentNum} dari {totalSteps}
                </span>
              </span>
              {story.sceneTitle && (
                <span className="truncate text-xs font-extrabold tracking-wide text-amber-100/90 sm:text-sm">
                  {story.sceneTitle}
                </span>
              )}
            </div>

            <div
              className="flex shrink-0 items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {story.textEn && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowEn((prev) => !prev)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-extrabold transition ${
                      showEn
                        ? 'border-sky-300 bg-sky-600 text-white'
                        : 'border-amber-300/40 bg-slate-800/80 text-amber-100 hover:bg-slate-700/90'
                    }`}
                  >
                    <Languages className="h-3 w-3 shrink-0" />
                    <span>{showEn ? 'ID' : 'EN'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => soundEngine.speakEnglish(story.textEn)}
                    title="Dengarkan Bahasa Inggris"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-300/40 bg-slate-800/80 text-amber-100 transition hover:bg-slate-700/90"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onSkip}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-300/60 bg-[#1e325c]/95 px-2.5 py-1 text-[11px] font-extrabold text-amber-100 shadow transition hover:bg-[#274075]"
              >
                <span>Lewati Prolog</span>
                <SkipForward className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Storybook Narrative Body */}
          <p className="min-h-[68px] text-[13.5px] font-semibold leading-relaxed text-amber-50/95 sm:min-h-[76px] sm:text-[15.5px] sm:leading-relaxed">
            {fullText.slice(0, revealedCount)}
          </p>

          {/* Footer Step Dots + Next Action */}
          <div className="mt-2.5 flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === story.step
                      ? 'w-6 bg-amber-300'
                      : idx < story.step
                      ? 'w-2 bg-emerald-400/80'
                      : 'w-2 bg-slate-600'
                  }`}
                />
              ))}
              <span className="ml-2 hidden text-[11px] font-medium text-amber-200/70 sm:inline">
                {isTyping ? 'Klik untuk percepat teks' : 'Klik Lanjut atau tekan Spasi'}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleInteract();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-400 to-yellow-300 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-md transition hover:brightness-105 active:scale-95 sm:px-4 sm:text-sm"
            >
              <span>
                {isTyping
                  ? 'Tampilkan'
                  : isLastScene
                  ? 'Temui Burung Hantu'
                  : 'Lanjut'}
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StoryOverlayModal: React.FC<StoryOverlayModalProps> = ({
  story,
  characterId = 'hoot_emerald',
  playerName = 'Hoot',
  onAdvance,
  onSkip,
  onDefeatChoice,
}) => {
  if (!story) return null;

  if (story.kind === 'prologue') {
    return (
      <StorybookPrologueBox
        story={story}
        onAdvance={onAdvance}
        onSkip={onSkip}
      />
    );
  }

  const canSkip =
    story.kind === 'opening' ||
    story.kind === 'dungeon_intro' ||
    story.kind === 'dungeon_rescue';

  const caveStory = story.zoneId ? ZONE_CAVE_STORIES[story.zoneId] : null;

  let speakerKind: DialogueSpeakerKind = story.speakerKind || 'npc';
  let npcId = story.speakerNpcId || caveStory?.guardianId || 'npc_tetua';
  let captiveKind = story.captiveKind || caveStory?.captiveKind || 'girl';
  let captiveColor = story.captiveColor ?? caveStory?.captiveColor ?? 0xf472b6;
  let speakerSide: 'npc' | 'hero' = story.speakerSide || 'npc';

  if (!story.speakerKind) {
    if (story.kind === 'opening') {
      if (story.step === 3) {
        speakerKind = 'hero';
        speakerSide = 'hero';
      } else {
        speakerKind = 'owl';
        speakerSide = 'npc';
      }
    } else if (story.kind === 'dungeon_intro') {
      if (story.step === 0) {
        speakerKind = 'hero';
        speakerSide = 'hero';
      } else {
        speakerKind = 'npc';
        speakerSide = 'npc';
      }
    } else if (story.kind === 'dungeon_rescue') {
      if (story.step === 0) {
        speakerKind = 'captive';
        speakerSide = 'npc';
      } else if (story.step === 1) {
        speakerKind = 'npc';
        speakerSide = 'npc';
      } else {
        speakerKind = 'hero';
        speakerSide = 'hero';
      }
    } else if (story.kind === 'area_cleared') {
      speakerKind = 'hero';
      speakerSide = 'hero';
    } else if (story.kind === 'defeat_exit') {
      speakerKind = 'npc';
      speakerSide = 'npc';
    }
  }

  const displaySpeakerName =
    speakerKind === 'hero' && (story.speakerName === 'Hoot' || story.speakerName === 'Kamu')
      ? playerName.trim() || 'Hoot'
      : story.speakerName;

  const topAccessory =
    story.rewardSummary || story.ribbonQuote || (story.kind === 'defeat_exit' && story.defeatReason) ? (
      <div className="flex max-w-xl flex-col gap-1.5 rounded-2xl border-2 border-amber-300/70 bg-slate-950/90 px-3.5 py-2.5 text-amber-50 shadow-xl">
        {story.kind === 'defeat_exit' && story.defeatReason && (
          <div className="flex items-center gap-2 text-xs font-extrabold text-rose-200">
            <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
              Kalah
            </span>
            <span>Penyebab: {story.defeatReason}</span>
          </div>
        )}
        {story.rewardSummary && (
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-200">
            <Award className="h-4 w-4 shrink-0 text-amber-300" />
            <span>{story.rewardSummary}</span>
          </div>
        )}
        {story.ribbonQuote && (
          <div className="flex items-start gap-2 text-xs font-bold text-rose-100">
            <Bookmark className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-rose-400 text-rose-300" />
            <div>
              {story.ribbonName && (
                <span className="mr-1.5 rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                  {story.ribbonName}
                </span>
              )}
              <span className="italic">&ldquo;{story.ribbonQuote}&rdquo;</span>
            </div>
          </div>
        )}
      </div>
    ) : null;

  const footerActions =
    story.kind === 'defeat_exit' ? (
      <>
        <RpgPillButton variant="green" size="sm" onClick={() => onDefeatChoice(true)}>
          <RotateCcw className="h-3.5 w-3.5 shrink-0" />
          <span>Kembali ke sana</span>
        </RpgPillButton>
        <RpgPillButton variant="cream" size="sm" onClick={() => onDefeatChoice(false)}>
          <Heart className="h-3.5 w-3.5 shrink-0 text-rose-500" />
          <span>Istirahat dulu</span>
        </RpgPillButton>
      </>
    ) : null;

  return (
    <HarvestDialogueBox
      speakerName={displaySpeakerName}
      speakerRole={story.speakerRole}
      speakerKind={speakerKind}
      characterId={characterId}
      npcId={npcId}
      captiveKind={captiveKind}
      captiveColor={captiveColor}
      speakerSide={speakerSide}
      textId={story.textId}
      textEn={story.textEn}
      topAccessory={topAccessory}
      footerActions={footerActions}
      canAdvance={story.kind !== 'defeat_exit'}
      onAdvance={onAdvance}
      onSkip={canSkip ? onSkip : undefined}
    />
  );
};
