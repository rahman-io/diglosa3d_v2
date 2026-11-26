import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Sparkles, Volume2, X } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import {
  BOSSES,
  formatGuardianAddress,
  getZoneNpcById,
  personalizePlayerText,
  ZONE_CAVE_STORIES,
  ZONE_DOORS,
} from '../data/diglosaCatalog';
import { getWordsForZone, getWordStatus } from '../data/vocabCatalog';
import { CharacterPresetId, RpgQuestState, WordProgress, ZoneId } from '../types/game';
import { HarvestDialogueBox } from './HarvestDialogueBox';
import { RpgBoardPanel, RpgPillButton } from './RpgUiKit';

interface NpcDialogueModalProps {
  npcId: string | null;
  characterId?: CharacterPresetId;
  playerName?: string;
  quests: RpgQuestState[];
  wordProgress: Record<string, WordProgress>;
  liberatedZones: ZoneId[];
  captiveRescuedZones?: ZoneId[];
  ribbons?: ZoneId[];
  activeZoneId?: ZoneId;
  activeZoneIslandRemaining?: number;
  areaDoorsCleared: Record<ZoneId, number[]>;
  isNightTime?: boolean;
  nightPermittedZones?: ZoneId[];
  onClose: () => void;
  onAcceptOrClaimQuest: (npcId: string) => void;
  onLearnVocab: (vocabIds: string[]) => void;
  onEnterDungeon: (zoneId: ZoneId, isMixedChallenge?: boolean) => void;
}

interface DialogueBeat {
  speakerSide: 'npc' | 'hero';
  speakerName: string;
  speakerRole: string;
  textId: string;
  textEn?: string;
}

export const NpcDialogueModal: React.FC<NpcDialogueModalProps> = ({
  npcId,
  characterId = 'hoot_emerald',
  playerName = 'Hoot',
  quests,
  wordProgress,
  liberatedZones,
  captiveRescuedZones = [],
  ribbons = [],
  activeZoneId,
  activeZoneIslandRemaining,
  areaDoorsCleared,
  isNightTime = false,
  nightPermittedZones = [],
  onClose,
  onAcceptOrClaimQuest,
  onLearnVocab,
  onEnterDungeon,
}) => {
  const [turnIndex, setTurnIndex] = useState(0);
  const [showVocab, setShowVocab] = useState(false);

  const npc = getZoneNpcById(npcId);
  const zoneId = npc ? (npc.zoneId as ZoneId) : null;
  const zoneVocab = useMemo(() => (zoneId ? getWordsForZone(zoneId) : []), [zoneId]);

  useEffect(() => {
    setTurnIndex(0);
    setShowVocab(false);
  }, [npcId]);

  const heroDisplayName = playerName.trim() || 'Hoot';
  const guardianAddress = npc ? formatGuardianAddress(npc, heroDisplayName, characterId) : heroDisplayName;
  const isLiberated = zoneId ? liberatedZones.includes(zoneId) : false;
  const isCaptiveRescued = zoneId ? captiveRescuedZones.includes(zoneId) : false;
  const hasRibbon = zoneId ? ribbons.includes(zoneId) : false;
  const hasNightPermission = zoneId
    ? isNightTime || nightPermittedZones.includes(zoneId)
    : false;
  const clearedDoors = zoneId ? areaDoorsCleared[zoneId] || [] : [];
  const doors = zoneId ? ZONE_DOORS[zoneId] || [] : [];

  const turns = useMemo<DialogueBeat[]>(() => {
    if (!npc || !zoneId) return [];
    const caveStory = ZONE_CAVE_STORIES[zoneId];
    const boss = BOSSES[zoneId];

    if (isLiberated) {
      const ribbonReminderId = !hasRibbon
        ? ' Jika belum mengambil Pita Merah 3D tersembunyi di dalam gua, kamu masih bisa masuk lagi untuk mencarinya.'
        : '';
      const ribbonReminderEn = !hasRibbon
        ? ' If you have not grabbed the hidden 3D Red Ribbon inside the cave yet, you can go back in anytime.'
        : '';
      return [
        {
          speakerSide: 'npc',
          speakerName: npc.name,
          speakerRole: `${npc.zoneName} · Wilayah Bebas ✓`,
          textId: `${personalizePlayerText(npc.thanksId, guardianAddress)}${ribbonReminderId}`,
          textEn: `Thank you, ${guardianAddress}! ${caveStory.captiveName} is safe, ${boss.name} is defeated, and the island fog has lifted!${ribbonReminderEn}`,
        },
        {
          speakerSide: 'hero',
          speakerName: heroDisplayName,
          speakerRole: 'Penjelajah Nusantara Kata',
          textId: `Senang bisa membantu, ${npc.name}! Aku bisa masuk lagi ke ${npc.zoneName} kapan saja.`,
          textEn: `Happy to help, ${npc.name}! I can revisit ${npc.zoneName} anytime to practice.`,
        },
      ];
    }

    if (isCaptiveRescued) {
      const remMonsters =
        activeZoneId === zoneId && typeof activeZoneIslandRemaining === 'number'
          ? activeZoneIslandRemaining
          : null;
      const remLabelId =
        remMonsters !== null && remMonsters > 0
          ? `${remMonsters} monster tersisa di luar gua`
          : 'seluruh monster di luar gua';
      const remLabelEn =
        remMonsters !== null && remMonsters > 0
          ? `the remaining ${remMonsters} monsters outside the cave`
          : 'every monster outside the cave';
      const ribbonNoteId = !hasRibbon
        ? ' Pita Merah 3D tersembunyi juga masih menunggu di dalam gua jika ingin kamu ambil.'
        : ' Pita Merah 3D dari gua juga sudah berhasil kamu amankan!';
      const ribbonNoteEn = !hasRibbon
        ? ' The hidden 3D Red Ribbon is still waiting inside the cave whenever you want to claim it.'
        : ' You also secured the hidden 3D Red Ribbon from inside the cave!';

      return [
        {
          speakerSide: 'npc',
          speakerName: npc.name,
          speakerRole: `${npc.zoneName} · Reuni ${caveStory.captiveName}`,
          textId: `${personalizePlayerText(caveStory.rescueGuardianId, guardianAddress)} ${caveStory.captiveName} sudah selamat bersamaku, dan Bos ${boss.name} di dalam gua sudah kalah!${ribbonNoteId}`,
          textEn: `${personalizePlayerText(caveStory.rescueGuardianEn, guardianAddress)} ${caveStory.captiveName} is safe with me now, and ${boss.name} inside the cave is defeated!${ribbonNoteEn}`,
        },
        {
          speakerSide: 'npc',
          speakerName: npc.name,
          speakerRole: `${npc.zoneName} · Misi Terakhir (Kabut Pulau)`,
          textId: `Sekarang tinggal misi terakhir di pulau ini, ${guardianAddress}: habisi ${remLabelId} di area ${npc.zoneName} supaya kabut tebal di pulau ini hilang sepenuhnya!`,
          textEn: `Now for the final mission on this island, ${guardianAddress}: defeat ${remLabelEn} around ${npc.zoneName} so the island fog disappears completely!`,
        },
      ];
    }

    const nightNote =
      isNightTime && hasNightPermission
        ? ` Malam ini pintunya kubuka khusus untukmu (${clearedDoors.length}/${doors.length} pintu selesai).`
        : '';

    return [
      {
        speakerSide: 'npc',
        speakerName: npc.name,
        speakerRole: npc.zoneName,
        textId: personalizePlayerText(npc.storyLine1Id, guardianAddress),
        textEn: personalizePlayerText(npc.storyLine1En, guardianAddress),
      },
      {
        speakerSide: 'hero',
        speakerName: heroDisplayName,
        speakerRole: 'Penjelajah Nusantara Kata',
        textId: `Tenang, ${npc.name}! Aku akan masuk dan memulihkan kata-kata di ${npc.zoneName}.`,
        textEn: `Don't worry, ${npc.name}! I will enter ${npc.zoneName} and restore the lost words.`,
      },
      {
        speakerSide: 'npc',
        speakerName: npc.name,
        speakerRole: `${npc.zoneName} · Misi Gua (${clearedDoors.length}/${doors.length} Pintu)`,
        textId: personalizePlayerText(`${npc.storyLine2Id}${nightNote}`, guardianAddress),
        textEn: personalizePlayerText(npc.storyLine2En, guardianAddress),
      },
    ];
  }, [
    npc,
    zoneId,
    isLiberated,
    isCaptiveRescued,
    hasRibbon,
    activeZoneId,
    activeZoneIslandRemaining,
    heroDisplayName,
    guardianAddress,
    isNightTime,
    hasNightPermission,
    clearedDoors.length,
    doors.length,
  ]);

  if (!npc || !zoneId || turns.length === 0) return null;

  const questNpcId = npc.dayNpcId ?? npc.id;
  const quest = quests.find((q) => q.npcId === questNpcId || q.zoneId === zoneId);
  const readyToClaim = Boolean(
    quest && quest.accepted && !quest.claimed && quest.progress >= quest.target,
  );

  const learnedCount = zoneVocab.filter((v) => getWordStatus(wordProgress[v.id]) !== 'new').length;
  const masteredCount = zoneVocab.filter((v) => getWordStatus(wordProgress[v.id]) === 'mast').length;
  const allLearned = learnedCount === zoneVocab.length;

  const safeTurnIndex = Math.min(turnIndex, turns.length - 1);
  const currentTurn = turns[safeTurnIndex];
  const isFinalTurn = safeTurnIndex >= turns.length - 1;

  const vocabDrawer = showVocab ? (
    <div className="w-full max-w-xl">
      <RpgBoardPanel compact>
        <div className="flex items-center justify-between gap-2 pb-1.5">
          <div className="text-xs font-extrabold text-amber-200">
            Kosakata {npc.zoneName} · Dipelajari {learnedCount}/{zoneVocab.length} · Dikuasai{' '}
            {masteredCount}/{zoneVocab.length}
          </div>
          <div className="flex items-center gap-1.5">
            {!allLearned && (
              <button
                type="button"
                onClick={() => onLearnVocab(zoneVocab.map((v) => v.id))}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500"
              >
                <Sparkles className="h-3 w-3" />
                <span>Catat Semua</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowVocab(false)}
              className="rounded-lg bg-slate-800 p-1 text-amber-100 hover:bg-slate-700"
              aria-label="Tutup daftar kosakata"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
          {zoneVocab.map((v) => {
            const status = getWordStatus(wordProgress[v.id]);
            const mastery = Math.min(3, wordProgress[v.id]?.b || 0);
            return (
              <div
                key={v.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-amber-300/20 bg-slate-900/85 px-3 py-1.5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-extrabold text-white sm:text-sm">{v.word}</span>
                    <span className="font-mono-nums text-[10px] text-amber-200/80">
                      {v.phonetic}
                    </span>
                    <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-200">
                      {v.cefr}
                    </span>
                    <span className="font-mono-nums text-[10px] font-bold text-emerald-300">
                      {mastery}/3
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-300">{v.meaningId}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {status === 'mast' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.speakEnglish(v.word);
                      onLearnVocab([v.id]);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-400/20 text-amber-200 hover:bg-amber-400/35"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </RpgBoardPanel>
    </div>
  ) : null;

  const finalFooter = isFinalTurn ? (
    <>
      {readyToClaim && quest && (
        <RpgPillButton
          variant="orange"
          size="sm"
          onClick={() => onAcceptOrClaimQuest(questNpcId)}
        >
          <span>Klaim Hadiah (+{quest.rewardDiamonds} 💎)</span>
        </RpgPillButton>
      )}
      <RpgPillButton
        variant="gold"
        size="sm"
        onClick={() => setShowVocab((prev) => !prev)}
      >
        <BookOpen className="h-3.5 w-3.5 shrink-0" />
        <span>Kosakata ({zoneVocab.length})</span>
      </RpgPillButton>
      <RpgPillButton
        variant="green"
        size="sm"
        onClick={() => {
          onClose();
          onEnterDungeon(zoneId, false);
        }}
      >
        <span>{isNightTime ? '🔑 Masuk Gua' : `⚔️ ${npc.enterLabel}`}</span>
      </RpgPillButton>
      <RpgPillButton variant="cream" size="sm" onClick={onClose}>
        <span>Nanti</span>
      </RpgPillButton>
    </>
  ) : null;

  return (
    <HarvestDialogueBox
      speakerName={currentTurn.speakerName}
      speakerRole={currentTurn.speakerRole}
      speakerKind={currentTurn.speakerSide === 'hero' ? 'hero' : 'npc'}
      characterId={characterId}
      npcId={npc.id}
      speakerSide={currentTurn.speakerSide}
      textId={currentTurn.textId}
      textEn={currentTurn.textEn}
      topAccessory={vocabDrawer}
      footerActions={finalFooter}
      canAdvance={!isFinalTurn}
      onAdvance={() => {
        if (!isFinalTurn) {
          setTurnIndex((prev) => Math.min(turns.length - 1, prev + 1));
        }
      }}
      onSkip={
        !isFinalTurn
          ? () => {
              setTurnIndex(turns.length - 1);
            }
          : undefined
      }
    />
  );
};
