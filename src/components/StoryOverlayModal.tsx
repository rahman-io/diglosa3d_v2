import React, { useEffect, useRef, useState } from 'react';
import { Award, Bookmark, BookOpen, ChevronRight, Compass, Heart, Languages, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { personalizePlayerText, ZONE_CAVE_STORIES } from '../data/diglosaCatalog';
import { CharacterPresetId, ProjectedLabel, StoryDialogState } from '../types/game';
import { DialogueSpeakerKind } from './DialoguePortraitCanvas';
import { HarvestDialogueBox } from './HarvestDialogueBox';
import { RpgPillButton } from './RpgUiKit';

interface StoryOverlayModalProps {
  story: StoryDialogState | null;
  characterId?: CharacterPresetId;
  playerName?: string;
  projectedLabels?: ProjectedLabel[];
  muted?: boolean;
  onToggleMute?: () => void;
  onAdvance: () => void;
  onSkip: () => void;
  onDefeatChoice: (returnToZone: boolean) => void;
  onHutanSatwaChoice?: (continueMission: boolean) => void;
}

const StorybookPrologueBox: React.FC<{
  story: StoryDialogState;
  playerName?: string;
  projectedLabels?: ProjectedLabel[];
  muted?: boolean;
  onToggleMute?: () => void;
  onAdvance: () => void;
  onSkip: () => void;
}> = ({ story, playerName = 'Hoot', projectedLabels = [], muted = false, onToggleMute, onAdvance, onSkip }) => {
  const [showEn, setShowEn] = useState(false);
  const resolvedTextId = personalizePlayerText(story.textId, playerName);
  const resolvedTextEn = story.textEn ? personalizePlayerText(story.textEn, playerName) : undefined;
  const fullText = showEn && resolvedTextEn ? resolvedTextEn : resolvedTextId;
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
      cursor = Math.min(fullText.length, cursor + 2);
      setRevealedCount(cursor);
      if (cursor >= fullText.length) {
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 32);

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
    <>
      {projectedLabels.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
          {projectedLabels.map((lbl) => (
            <div
              key={lbl.id}
              style={{ transform: `translate3d(${lbl.x}px, ${lbl.y}px, 0) translate(-50%, -100%)` }}
              className={`absolute left-0 top-0 whitespace-nowrap shadow-lg transition-opacity duration-300 ${
                lbl.kind === 'speech'
                  ? 'rounded-2xl border-2 border-amber-300/90 bg-white/95 px-3 py-1 text-xs font-extrabold text-[#78350f]'
                  : 'rounded-xl border border-amber-200/80 bg-slate-950/85 px-2.5 py-1 text-[11px] font-bold text-amber-100'
              }`}
            >
              {lbl.title}
            </div>
          ))}
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center px-3 pb-2.5 sm:px-6 sm:pb-4">
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
          className="cursor-pointer select-none rounded-2xl border border-amber-300/45 bg-slate-950/76 px-4 py-2.5 text-amber-50 shadow-[0_8px_28px_rgba(0,0,0,0.55)] transition focus:outline-none sm:px-5 sm:py-3"
        >
          {/* Header Bar */}
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-1.5">
            <div className="flex min-w-0 items-center gap-2 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300/45 bg-slate-950/35 px-2.5 py-0.5 text-[11px] font-black tracking-wide text-amber-200">
                <BookOpen className="h-3.5 w-3.5" />
                <span>
                  Adegan {currentNum} dari {totalSteps}
                </span>
              </span>
              {story.sceneTitle && (
                <span className="truncate text-xs font-extrabold tracking-wide text-amber-100 sm:text-sm">
                  {story.sceneTitle}
                </span>
              )}
            </div>

            <div
              className="flex shrink-0 items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {resolvedTextEn && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowEn((prev) => !prev)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-extrabold [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] transition ${
                      showEn
                        ? 'border-sky-300/80 bg-sky-600/75 text-white'
                        : 'border-white/25 bg-slate-950/35 text-amber-100 hover:bg-slate-900/55'
                    }`}
                  >
                    <Languages className="h-3 w-3 shrink-0" />
                    <span>{showEn ? 'ID' : 'EN'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => soundEngine.speakEnglish(resolvedTextEn)}
                    title="Dengarkan Bahasa Inggris"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/25 bg-slate-950/35 text-amber-100 transition hover:bg-slate-900/55"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              {onToggleMute && (
                <button
                  type="button"
                  onClick={onToggleMute}
                  title={muted ? 'Nyalakan Musik & Suara' : 'Bisukan Musik & Suara'}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                    muted
                      ? 'border-rose-400/60 bg-rose-950/65 text-rose-200 hover:bg-rose-900/75'
                      : 'border-white/25 bg-slate-950/35 text-amber-100 hover:bg-slate-900/55'
                  }`}
                >
                  {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
              )}
              <button
                type="button"
                onClick={onSkip}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-300/45 bg-slate-950/35 px-2.5 py-1 text-[11px] font-extrabold text-amber-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] shadow transition hover:bg-slate-900/55"
              >
                <span>Lewati Prolog</span>
                <SkipForward className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Storybook Narrative Body */}
          <p className="min-h-[52px] text-[13.5px] font-bold leading-relaxed text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.98),0_2px_8px_rgba(0,0,0,0.9)] sm:min-h-[58px] sm:text-[15.5px] sm:leading-relaxed">
            {fullText.slice(0, revealedCount)}
          </p>

          {/* Footer Step Dots + Next Action */}
          <div className="mt-2 flex items-center justify-between gap-3 pt-0.5">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === story.step
                      ? 'w-6 bg-amber-300 shadow-[0_1px_4px_rgba(0,0,0,0.85)]'
                      : idx < story.step
                      ? 'w-2 bg-emerald-400/90'
                      : 'w-2 bg-white/35'
                  }`}
                />
              ))}
              <span className="ml-2 hidden text-[11px] font-semibold text-amber-100/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] sm:inline">
                {isTyping ? 'Klik untuk percepat teks' : 'Klik Lanjut atau tekan Spasi'}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleInteract();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200/75 bg-gradient-to-r from-amber-400/90 to-yellow-300/90 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-md transition hover:brightness-105 active:scale-95 sm:px-4 sm:text-sm"
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
    </>
  );
};

export const StoryOverlayModal: React.FC<StoryOverlayModalProps> = ({
  story,
  characterId = 'hoot_emerald',
  playerName = 'Hoot',
  projectedLabels,
  muted,
  onToggleMute,
  onAdvance,
  onSkip,
  onDefeatChoice,
  onHutanSatwaChoice,
}) => {
  if (!story) return null;

  if (story.kind === 'owl_depart') {
    return null;
  }

  if (story.kind === 'village_ambush') {
    return (
      <>
        {projectedLabels && projectedLabels.length > 0 && (
          <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
            {projectedLabels.map((lbl) => (
              <div
                key={lbl.id}
                style={{ transform: `translate3d(${lbl.x}px, ${lbl.y}px, 0) translate(-50%, -100%)` }}
                className={`absolute left-0 top-0 whitespace-nowrap shadow-lg ${
                  lbl.kind === 'speech'
                    ? 'rounded-2xl border-2 border-rose-400 bg-white/95 px-3 py-1 text-xs font-extrabold text-rose-700'
                    : 'rounded-xl border border-rose-300/80 bg-slate-950/85 px-2.5 py-1 text-[11px] font-bold text-rose-200'
                }`}
              >
                {lbl.title}
              </div>
            ))}
          </div>
        )}
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center px-3 pb-3 sm:px-6 sm:pb-5">
          <div className="pointer-events-auto flex w-full max-w-3xl flex-col gap-2.5 rounded-2xl border-2 border-rose-400/70 bg-slate-950/88 px-4 py-3 text-amber-50 shadow-[0_10px_32px_rgba(0,0,0,0.6)] sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-rose-400/70 bg-rose-600/85 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-white">
                  {story.speakerName}
                </span>
                {onToggleMute && (
                  <button
                    type="button"
                    onClick={onToggleMute}
                    title={muted ? 'Nyalakan Musik & Suara' : 'Bisukan Musik & Suara'}
                    className={`flex h-6 w-6 items-center justify-center rounded-lg border transition ${
                      muted
                        ? 'border-rose-400/60 bg-rose-950/75 text-rose-200 hover:bg-rose-900/75'
                        : 'border-white/25 bg-slate-900/60 text-amber-100 hover:bg-slate-800/75'
                    }`}
                  >
                    {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
              <p className="text-xs font-bold leading-relaxed text-white sm:text-sm">
                {story.textId}
              </p>
            </div>
            <button
              type="button"
              onClick={onAdvance}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border-2 border-amber-200 bg-gradient-to-r from-emerald-500 to-lime-400 px-5 py-2.5 text-sm font-black text-slate-950 shadow-lg transition hover:brightness-105 active:scale-95"
            >
              <span>Mulai Main</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </>
    );
  }

  if (story.kind === 'village_rescue_escort' || (story.kind === 'dungeon_reunion_exit' && story.step === 0)) {
    return (
      <>
        {projectedLabels && projectedLabels.length > 0 && (
          <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
            {projectedLabels.map((lbl) => (
              <div
                key={lbl.id}
                style={{ transform: `translate3d(${lbl.x}px, ${lbl.y}px, 0) translate(-50%, -100%)` }}
                className={`absolute left-0 top-0 whitespace-nowrap shadow-lg ${
                  lbl.kind === 'speech'
                    ? 'rounded-2xl border-2 border-emerald-400 bg-white/95 px-3 py-1 text-xs font-extrabold text-emerald-800'
                    : 'rounded-xl border border-amber-300/80 bg-slate-950/85 px-2.5 py-1 text-[11px] font-bold text-amber-100'
                }`}
              >
                {lbl.title}
              </div>
            ))}
          </div>
        )}
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center px-3 pb-3 sm:px-6 sm:pb-5">
          <div className="pointer-events-auto flex w-full max-w-2xl items-center justify-between gap-3 rounded-2xl border-2 border-emerald-400/75 bg-slate-950/88 px-4 py-3 text-amber-50 shadow-[0_10px_32px_rgba(0,0,0,0.55)] sm:px-5">
            <div className="min-w-0 flex-1">
              <span className="mb-1 inline-flex items-center rounded-full border border-emerald-400/60 bg-emerald-600/80 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-white">
                {story.speakerName}
              </span>
              <p className="text-xs font-bold leading-relaxed text-white sm:text-sm">
                {personalizePlayerText(story.textId, playerName)}
              </p>
            </div>
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-amber-300/60 bg-slate-900/85 px-3.5 py-2 text-xs font-extrabold text-amber-100 shadow transition hover:bg-slate-800 active:scale-95"
            >
              <span>Percepat</span>
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </>
    );
  }

  if (story.kind === 'prologue') {
    return (
      <StorybookPrologueBox
        story={story}
        playerName={playerName}
        projectedLabels={projectedLabels}
        muted={muted}
        onToggleMute={onToggleMute}
        onAdvance={onAdvance}
        onSkip={onSkip}
      />
    );
  }

  const resolvedPlayerName = playerName.trim() || 'Hoot';

  const isBossDefeatCinema =
    story.kind === 'dungeon_boss_defeat' &&
    (story.dungeonBossDefeatBeat === 'boss_remorse_crumble' ||
      story.dungeonBossDefeatBeat === 'key_emerge' ||
      story.dungeonBossDefeatBeat === 'prisoners_celebrate');

  const isRibbonReunionCinema =
    story.kind === 'dungeon_ribbon_reunion' &&
    (story.dungeonRibbonReunionBeat === 'walk_to_guardian' ||
      story.dungeonRibbonReunionBeat === 'garden_transform');

  const isIslandLiberationCinema =
    story.kind === 'island_liberation' &&
    (story.islandLiberationBeat === 'mist_clearing' ||
      story.islandLiberationBeat === 'villagers_emerge' ||
      story.islandLiberationBeat === 'return_to_life');

  const isHutanSatwaCinema =
    story.kind === 'hutan_satwa_refugee' &&
    (story.hutanSatwaRefugeeBeat === 'flashback_mist' ||
      story.hutanSatwaRefugeeBeat === 'flashback_siege' ||
      story.hutanSatwaRefugeeBeat === 'flashback_kiki' ||
      story.hutanSatwaRefugeeBeat === 'flashback_escape' ||
      story.hutanSatwaRefugeeBeat === 'guide_desa_exit' ||
      story.hutanSatwaRefugeeBeat === 'guide_citadel_cross' ||
      story.hutanSatwaRefugeeBeat === 'guide_satwa_arrival');

  const isHutanSatwaGuideCinema =
    isHutanSatwaCinema && Boolean(story.hutanSatwaRefugeeBeat?.startsWith('guide_'));

  if (
    (story.kind === 'dungeon_intro' &&
      (story.dungeonIntroBeat === 'emerge' || story.dungeonIntroBeat === 'retreat')) ||
    (story.kind === 'dungeon_boss_summon' &&
      (story.dungeonBossSummonBeat === 'emerge_shock' ||
        story.dungeonBossSummonBeat === 'boss_furious_summon')) ||
    (story.kind === 'dungeon_boss_solo_rage' && story.dungeonBossSoloBeat === 'rage_erupt') ||
    (story.kind === 'dungeon_prison_plea' && story.dungeonPrisonPleaBeat === 'discover') ||
    isBossDefeatCinema ||
    isRibbonReunionCinema ||
    isIslandLiberationCinema ||
    isHutanSatwaCinema
  ) {
    const isPrisonPleaDiscover = story.kind === 'dungeon_prison_plea';
    const isPrisonerCelebrate =
      story.kind === 'dungeon_boss_defeat' &&
      story.dungeonBossDefeatBeat === 'prisoners_celebrate';
    const isKeyEmerge =
      story.kind === 'dungeon_boss_defeat' &&
      story.dungeonBossDefeatBeat === 'key_emerge';
    const isGardenTransform =
      story.kind === 'dungeon_ribbon_reunion' &&
      story.dungeonRibbonReunionBeat === 'garden_transform';
    const isWalkToGuardian =
      story.kind === 'dungeon_ribbon_reunion' &&
      story.dungeonRibbonReunionBeat === 'walk_to_guardian';
    const isLibMist =
      story.kind === 'island_liberation' && story.islandLiberationBeat === 'mist_clearing';
    const isLibEmerge =
      story.kind === 'island_liberation' && story.islandLiberationBeat === 'villagers_emerge';
    const isLibReturn =
      story.kind === 'island_liberation' && story.islandLiberationBeat === 'return_to_life';
    const cinemaBadge =
      isHutanSatwaCinema
        ? story.storySceneBadge || 'Reka Adegan Hutan Satwa'
        : isLibMist
        ? 'Kabut Pulau Menghilang Cerah'
        : isLibEmerge
        ? 'Seluruh Warga Desa Keluar Bersorak'
        : isLibReturn
        ? 'Warga Kembali Beraktivitas Bahagia'
        : isGardenTransform
        ? 'Taman Asri & Kupu-Kupu'
        : isWalkToGuardian
        ? 'Menuju Pintu Depan Gua'
        : isPrisonerCelebrate
        ? 'Tahanan Bersukacita & Haru'
        : isKeyEmerge
        ? 'Kunci Penjara Muncul'
        : story.kind === 'dungeon_boss_defeat'
        ? 'Penyesalan Sang Bos'
        : isPrisonPleaDiscover
        ? 'Penjara Tersembunyi Ditemukan'
        : story.kind === 'dungeon_boss_solo_rage'
        ? 'Amarah Puncak Sang Bos'
        : story.kind === 'dungeon_boss_summon'
        ? story.dungeonBossSummonBeat === 'emerge_shock'
          ? 'Pintu Terakhir Terbuka'
          : 'Panggilan Delapan Awan Hitam'
        : story.dungeonIntroBeat === 'emerge'
          ? 'Pusaran Kabut Hitam'
          : 'Kembalinya Sang Bos';
    const isJoyfulCinema =
      isPrisonerCelebrate ||
      isGardenTransform ||
      isWalkToGuardian ||
      isLibEmerge ||
      isLibReturn ||
      isHutanSatwaGuideCinema;
    const isGoldenCinema = isKeyEmerge || isLibMist;
    return (
      <>
        {projectedLabels && projectedLabels.length > 0 && (
          <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
            {projectedLabels.map((lbl) => (
              <div
                key={lbl.id}
                style={{ transform: `translate3d(${lbl.x}px, ${lbl.y}px, 0) translate(-50%, -100%)` }}
                className={`absolute left-0 top-0 whitespace-nowrap shadow-lg ${
                  lbl.kind === 'speech'
                    ? isJoyfulCinema
                      ? 'rounded-2xl border-2 border-emerald-300 bg-slate-950/95 px-3 py-1 text-xs font-black text-emerald-100'
                      : isGoldenCinema
                      ? 'rounded-2xl border-2 border-amber-300 bg-slate-950/95 px-3 py-1 text-xs font-black text-amber-100'
                      : isPrisonPleaDiscover
                      ? 'rounded-2xl border-2 border-sky-300 bg-slate-950/95 px-3 py-1 text-xs font-black text-sky-100'
                      : 'rounded-2xl border-2 border-rose-400 bg-slate-950/95 px-3 py-1 text-xs font-black text-rose-200'
                    : 'rounded-xl border border-purple-400/80 bg-slate-950/90 px-2.5 py-1 text-[11px] font-extrabold text-purple-200'
                }`}
              >
                {lbl.title}
              </div>
            ))}
          </div>
        )}
        {/* Top thin cinema letterbox bar */}
        <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-gradient-to-b from-black/95 via-black/80 to-transparent px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider sm:text-xs ${
                isJoyfulCinema
                  ? 'border-emerald-300/80 bg-emerald-950/90 text-emerald-100'
                  : isGoldenCinema
                  ? 'border-amber-300/80 bg-amber-950/90 text-amber-100'
                  : isPrisonPleaDiscover
                  ? 'border-sky-300/75 bg-sky-950/90 text-sky-100'
                  : 'border-rose-400/70 bg-rose-950/90 text-rose-200'
              }`}
            >
              {cinemaBadge}
            </span>
            <span className="truncate text-xs font-extrabold text-amber-100 drop-shadow sm:text-sm">
              {personalizePlayerText(story.speakerName, resolvedPlayerName)}
            </span>
          </div>
          <div className="pointer-events-auto flex shrink-0 items-center gap-1.5">
            {onToggleMute && (
              <button
                type="button"
                onClick={onToggleMute}
                title={muted ? 'Nyalakan Musik & Suara' : 'Bisukan Musik & Suara'}
                className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                  muted
                    ? 'border-rose-400/60 bg-rose-950/80 text-rose-200 hover:bg-rose-900'
                    : 'border-white/25 bg-slate-950/75 text-amber-100 hover:bg-slate-900'
                }`}
              >
                {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
            )}
            {isPrisonerCelebrate && (
              <button
                type="button"
                onClick={onAdvance}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300/80 bg-emerald-600/90 px-3 py-1 text-[11px] font-black text-white shadow transition hover:bg-emerald-500"
              >
                <span>Ambil Kunci Emas →</span>
              </button>
            )}
            {isHutanSatwaCinema && (
              <button
                type="button"
                onClick={onAdvance}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-300/80 bg-amber-500/90 px-3 py-1 text-[11px] font-black text-slate-950 shadow transition hover:bg-amber-400"
              >
                <span>Lanjut →</span>
              </button>
            )}
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-300/60 bg-slate-950/85 px-3 py-1 text-[11px] font-extrabold text-amber-100 shadow transition hover:bg-slate-900"
            >
              <span>{isHutanSatwaGuideCinema ? 'Lewati Panduan' : 'Lewati Adegan'}</span>
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {/* Bottom thin cinema letterbox bar with dramatic subtitle */}
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center bg-gradient-to-t from-black/95 via-black/82 to-transparent px-4 pb-3.5 pt-6 text-center sm:px-8 sm:pb-5">
          <p className="max-w-3xl text-xs font-extrabold leading-relaxed text-amber-50 [text-shadow:0_2px_6px_rgba(0,0,0,0.95)] sm:text-sm">
            {personalizePlayerText(story.textId, resolvedPlayerName)}
          </p>
          {story.textEn && (
            <p className="mt-0.5 max-w-2xl text-[11px] font-semibold italic text-rose-200/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.95)] sm:text-xs">
              {personalizePlayerText(story.textEn, resolvedPlayerName)}
            </p>
          )}
        </div>
      </>
    );
  }

  const canSkip =
    story.kind === 'opening' ||
    story.kind === 'village_rescue_talk' ||
    story.kind === 'dungeon_intro' ||
    story.kind === 'dungeon_prison_torment' ||
    story.kind === 'dungeon_door_guide' ||
    story.kind === 'dungeon_boss_summon' ||
    story.kind === 'dungeon_boss_solo_rage' ||
    story.kind === 'dungeon_boss_defeat' ||
    story.kind === 'dungeon_prison_plea' ||
    story.kind === 'cave_guardian' ||
    story.kind === 'dungeon_rescue' ||
    story.kind === 'dungeon_ribbon_reunion' ||
    story.kind === 'dungeon_reunion_exit' ||
    story.kind === 'island_liberation' ||
    (story.kind === 'hutan_satwa_refugee' && !story.awaitingChoice);

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
      ? resolvedPlayerName
      : personalizePlayerText(story.speakerName, resolvedPlayerName);

  const topAccessory =
    story.rewardSummary || story.ribbonQuote || (story.kind === 'defeat_exit' && story.defeatReason) ? (
      <div className="flex max-w-xl flex-col gap-1.5 rounded-2xl border-2 border-amber-300/70 bg-slate-950/90 px-3.5 py-2.5 text-amber-50 shadow-xl">
        {story.kind === 'defeat_exit' && story.defeatReason && (
          <div className="flex items-center gap-2 text-xs font-extrabold text-rose-200">
            <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
              Kalah
            </span>
            <span>Penyebabnya adalah {personalizePlayerText(story.defeatReason, resolvedPlayerName)}</span>
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
    ) : story.kind === 'hutan_satwa_refugee' && story.awaitingChoice ? (
      <>
        <RpgPillButton variant="green" size="sm" onClick={() => onHutanSatwaChoice?.(true)}>
          <Compass className="h-3.5 w-3.5 shrink-0" />
          <span>Lanjut Misi ke Pulau Hutan Satwa</span>
        </RpgPillButton>
        <RpgPillButton variant="cream" size="sm" onClick={() => onHutanSatwaChoice?.(false)}>
          <Heart className="h-3.5 w-3.5 shrink-0 text-rose-500" />
          <span>Nanti Dulu</span>
        </RpgPillButton>
      </>
    ) : null;

  return (
    <>
      {(story.kind === 'dungeon_intro' ||
        story.kind === 'dungeon_prison_torment' ||
        story.kind === 'dungeon_door_guide' ||
        story.kind === 'dungeon_boss_summon' ||
        story.kind === 'dungeon_boss_solo_rage' ||
        story.kind === 'dungeon_boss_defeat' ||
        story.kind === 'dungeon_prison_plea' ||
        story.kind === 'dungeon_ribbon_reunion' ||
        story.kind === 'island_liberation' ||
        story.kind === 'hutan_satwa_refugee') &&
        projectedLabels &&
        projectedLabels.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
          {projectedLabels.map((lbl) => (
            <div
              key={lbl.id}
              style={{ transform: `translate3d(${lbl.x}px, ${lbl.y}px, 0) translate(-50%, -100%)` }}
              className={`absolute left-0 top-0 whitespace-nowrap shadow-lg ${
                lbl.kind === 'speech'
                  ? story.kind === 'island_liberation'
                    ? lbl.id.includes('hero')
                      ? 'rounded-2xl border-2 border-amber-300 bg-slate-950/95 px-3 py-1 text-xs font-black text-amber-100'
                      : 'rounded-2xl border-2 border-emerald-300 bg-slate-950/95 px-3 py-1 text-xs font-black text-emerald-100'
                    : story.kind === 'dungeon_prison_plea' ||
                      (story.kind === 'dungeon_prison_torment' && lbl.id.includes('captive'))
                      ? 'rounded-2xl border-2 border-sky-300 bg-slate-950/95 px-3 py-1 text-xs font-black text-sky-100'
                      : story.kind === 'dungeon_door_guide'
                        ? 'rounded-2xl border-2 border-emerald-300 bg-slate-950/95 px-3 py-1 text-xs font-black text-emerald-100'
                        : story.kind === 'dungeon_boss_defeat'
                          ? lbl.id.includes('hero')
                            ? 'rounded-2xl border-2 border-sky-300 bg-slate-950/95 px-3 py-1 text-xs font-black text-sky-100'
                            : 'rounded-2xl border-2 border-amber-300 bg-slate-950/95 px-3 py-1 text-xs font-black text-amber-100'
                          : 'rounded-2xl border-2 border-rose-400 bg-slate-950/95 px-3 py-1 text-xs font-black text-rose-100'
                  : 'rounded-xl border border-amber-300/80 bg-slate-950/90 px-2.5 py-1 text-[11px] font-extrabold text-amber-100'
              }`}
            >
              {lbl.title}
            </div>
          ))}
        </div>
      )}
      <HarvestDialogueBox
        speakerName={displaySpeakerName}
        speakerRole={personalizePlayerText(story.speakerRole, resolvedPlayerName)}
        speakerKind={speakerKind}
        characterId={characterId}
        npcId={npcId}
        villagerArchetypes={story.villagerArchetypes}
        captiveKind={captiveKind}
        captiveColor={captiveColor}
        captiveMembers={story.captiveMembers}
        monsterType={story.speakerMonsterType}
        heroExpression={story.heroExpression}
        bossExpression={story.bossExpression}
        captiveExpression={story.captiveExpression}
        speakerSide={speakerSide}
        textId={personalizePlayerText(story.textId, resolvedPlayerName)}
        textEn={story.textEn ? personalizePlayerText(story.textEn, resolvedPlayerName) : undefined}
        topAccessory={topAccessory}
        footerActions={footerActions}
        canAdvance={story.kind !== 'defeat_exit' && !story.awaitingChoice}
        onAdvance={onAdvance}
        onSkip={canSkip ? onSkip : undefined}
      />
    </>
  );
};
