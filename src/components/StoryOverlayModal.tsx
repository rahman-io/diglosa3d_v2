import React from 'react';
import { Award, Bookmark, Heart, RotateCcw } from 'lucide-react';
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

export const StoryOverlayModal: React.FC<StoryOverlayModalProps> = ({
  story,
  characterId = 'hoot_emerald',
  playerName = 'Hoot',
  onAdvance,
  onSkip,
  onDefeatChoice,
}) => {
  if (!story) return null;

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
      if (story.step === 0 || story.step === 3) {
        speakerKind = 'owl';
      } else if (story.step === 1) {
        speakerKind = 'captive';
        captiveKind = 'girl';
        captiveColor = 0xe11d48;
      } else {
        speakerKind = 'npc';
        npcId = 'ielts_dean';
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
