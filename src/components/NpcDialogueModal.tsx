import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DoorOpen,
  Languages,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { NPC_CATALOG, ZONE_DOORS } from '../data/diglosaCatalog';
import { getWordsForZone, getWordStatus } from '../data/vocabCatalog';
import { RpgQuestState, WordProgress, ZoneId } from '../types/game';
import { RpgAvatarFrame, RpgBoardPanel, RpgNameplate, RpgPillButton } from './RpgUiKit';

interface NpcDialogueModalProps {
  npcId: string | null;
  quests: RpgQuestState[];
  wordProgress: Record<string, WordProgress>;
  liberatedZones: ZoneId[];
  areaDoorsCleared: Record<ZoneId, number[]>;
  onClose: () => void;
  onAcceptOrClaimQuest: (npcId: string) => void;
  onLearnVocab: (vocabIds: string[]) => void;
  onEnterDungeon: (zoneId: ZoneId, isMixedChallenge?: boolean) => void;
}

export const NpcDialogueModal: React.FC<NpcDialogueModalProps> = ({
  npcId,
  quests,
  wordProgress,
  liberatedZones,
  areaDoorsCleared,
  onClose,
  onAcceptOrClaimQuest,
  onLearnVocab,
  onEnterDungeon,
}) => {
  const [showVocab, setShowVocab] = useState(false);
  const [showEn1, setShowEn1] = useState(false);
  const [showEn2, setShowEn2] = useState(false);

  const npc = NPC_CATALOG.find((n) => n.id === npcId) ?? null;
  const zoneId = npc ? (npc.zoneId as ZoneId) : null;
  const zoneVocab = zoneId ? getWordsForZone(zoneId) : [];

  useEffect(() => {
    setShowVocab(false);
    setShowEn1(false);
    setShowEn2(false);
  }, [npc]);

  if (!npc || !zoneId) return null;

  const quest = quests.find((q) => q.npcId === npc.id);
  const readyToClaim = Boolean(
    quest && quest.accepted && !quest.claimed && quest.progress >= quest.target,
  );
  const isLiberated = liberatedZones.includes(zoneId);
  const clearedDoors = areaDoorsCleared[zoneId] || [];
  const doors = ZONE_DOORS[zoneId] || [];

  const learnedCount = zoneVocab.filter((v) => getWordStatus(wordProgress[v.id]) !== 'new').length;
  const masteredCount = zoneVocab.filter((v) => getWordStatus(wordProgress[v.id]) === 'mast').length;
  const allLearned = learnedCount === zoneVocab.length;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center overflow-y-auto overscroll-contain touch-pan-y bg-[#060b16]/72 p-2 sm:items-center sm:p-4">
      <div className="my-auto max-h-[94dvh] w-full max-w-xl overflow-y-auto overscroll-contain touch-pan-y">
        <RpgBoardPanel>
          {/* Balanced Inside-Frame RPG Header */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 max-w-full items-center gap-2">
              <RpgAvatarFrame accentColor={npc.accentColor}>
                <span className="text-lg font-black">{npc.name.charAt(0)}</span>
              </RpgAvatarFrame>

              <RpgNameplate className="min-w-0">
                <div className="min-w-0 leading-tight">
                  <div className="flex items-center gap-1.5">
                    <h2 className="truncate text-sm font-black tracking-tight text-[#3b1b06] sm:text-base">
                      {npc.name}
                    </h2>
                    {isLiberated && (
                      <span className="shrink-0 rounded bg-emerald-700 px-1.5 py-0.5 text-[9px] font-black text-white">
                        ✓ Bebas
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[10px] font-extrabold text-[#78350f] sm:text-[11px]">
                    {npc.zoneName} · {npc.title}
                  </p>
                </div>
              </RpgNameplate>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup dialog"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-amber-300/60 bg-slate-900/95 text-amber-100 shadow-lg transition hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {(npc.demographicLabel || npc.stats) && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300/25 bg-slate-950/60 px-3 py-1.5 text-[11px] font-bold text-amber-100">
                <div className="min-w-0 truncate">
                  {npc.demographicLabel && (
                    <span className="text-amber-200">{npc.demographicLabel}</span>
                  )}
                  {npc.habitSummary && (
                    <span className="ml-2 text-slate-300">· {npc.habitSummary}</span>
                  )}
                </div>
                {npc.stats && (
                  <div className="flex shrink-0 items-center gap-2 font-mono-nums text-[10px] font-black">
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-300">
                      HP {npc.stats.hp}
                    </span>
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-rose-300">
                      ATK {npc.stats.atk}
                    </span>
                    <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-sky-300">
                      NRG {npc.stats.nrg}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Two RPG Story Dialogue Boxes — Indonesian First + On-Demand English Toggle */}
            <div className="space-y-2">
              <div className="rounded-2xl border border-amber-300/25 bg-slate-950/50 px-3.5 py-2.5 shadow-inner">
                <p className="text-sm font-bold leading-relaxed text-white sm:text-[15px]">
                  {npc.storyLine1Id}
                </p>

                {showEn1 && (
                  <div className="mt-2 rounded-xl border border-sky-400/25 bg-slate-900/75 px-3 py-2">
                    <span className="mr-1.5 inline-block rounded bg-sky-500/25 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-200">
                      English
                    </span>
                    <span className="text-xs font-semibold leading-relaxed text-sky-100 sm:text-sm">
                      {npc.storyLine1En}
                    </span>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowEn1((prev) => !prev)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-extrabold transition ${
                      showEn1
                        ? 'border-sky-400/50 bg-sky-500/25 text-sky-100 hover:bg-sky-500/35'
                        : 'border-amber-300/30 bg-slate-900/80 text-amber-200 hover:bg-slate-800'
                    }`}
                  >
                    <Languages className="h-3.5 w-3.5 shrink-0" />
                    <span>{showEn1 ? 'Tutup Inggris' : 'Lihat Bahasa Inggris'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => soundEngine.speakEnglish(npc.storyLine1En)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-400/20 text-amber-200 transition hover:bg-amber-400/35"
                    title="Dengarkan Bahasa Inggris"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-300/25 bg-slate-950/50 px-3.5 py-2.5 shadow-inner">
                <p className="text-sm font-bold leading-relaxed text-white sm:text-[15px]">
                  {npc.storyLine2Id}
                </p>

                {showEn2 && (
                  <div className="mt-2 rounded-xl border border-sky-400/25 bg-slate-900/75 px-3 py-2">
                    <span className="mr-1.5 inline-block rounded bg-sky-500/25 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-200">
                      English
                    </span>
                    <span className="text-xs font-semibold leading-relaxed text-sky-100 sm:text-sm">
                      {npc.storyLine2En}
                    </span>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowEn2((prev) => !prev)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-extrabold transition ${
                      showEn2
                        ? 'border-sky-400/50 bg-sky-500/25 text-sky-100 hover:bg-sky-500/35'
                        : 'border-amber-300/30 bg-slate-900/80 text-amber-200 hover:bg-slate-800'
                    }`}
                  >
                    <Languages className="h-3.5 w-3.5 shrink-0" />
                    <span>{showEn2 ? 'Tutup Inggris' : 'Lihat Bahasa Inggris'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => soundEngine.speakEnglish(npc.storyLine2En)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-400/20 text-amber-200 transition hover:bg-amber-400/35"
                    title="Dengarkan Bahasa Inggris"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Zone Mastery + 5 Doors Status */}
            <div className="rounded-2xl border border-amber-300/20 bg-slate-950/40 p-3">
              <div className="text-xs font-extrabold leading-snug text-amber-200">
                {npc.zoneName}: Dipelajari{' '}
                <span className="font-mono-nums text-white">
                  {learnedCount}/{zoneVocab.length}
                </span>{' '}
                · Dikuasai{' '}
                <span className="font-mono-nums text-emerald-300">
                  {masteredCount}/{zoneVocab.length}
                </span>{' '}
                <span className="font-semibold text-amber-100/70">(butuh 3x benar bersih)</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {doors.map((d) => {
                  const done = clearedDoors.includes(d.index);
                  return (
                    <span
                      key={d.id}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${
                        done
                          ? 'bg-emerald-600/90 text-white shadow-sm'
                          : 'border border-amber-300/25 bg-slate-900/75 text-amber-100/85'
                      }`}
                    >
                      <DoorOpen className="h-3 w-3 shrink-0" />
                      <span>
                        {d.index + 1}. {d.name}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Quest Claim Banner if ready */}
            {readyToClaim && quest && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-400/50 bg-emerald-950/60 px-3.5 py-2.5">
                <div className="text-xs font-extrabold text-emerald-100">
                  Misi Selesai: {quest.title} (+{quest.rewardXp} XP, +{quest.rewardDiamonds} 💎)
                </div>
                <button
                  type="button"
                  onClick={() => onAcceptOrClaimQuest(npc.id)}
                  className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-black text-white shadow transition hover:bg-emerald-400"
                >
                  Klaim Hadiah!
                </button>
              </div>
            )}

            {/* Stacked Full-Width RPG Actions: 1. Kosakata -> 2. Masuk ke Gua -> 3. Abaikan */}
            <div className="flex flex-col gap-2 pt-0.5">
              <RpgPillButton
                variant="gold"
                onClick={() => setShowVocab((prev) => !prev)}
                className="w-full"
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <span>Kosakata ({zoneVocab.length}) · Belajar Sebelum Masuk</span>
                {showVocab ? (
                  <ChevronUp className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                )}
              </RpgPillButton>

              {/* Collapsible Zone Vocabulary Study Drawer */}
              {showVocab && (
                <div className="rounded-2xl border border-amber-300/25 bg-slate-950/65 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-200">
                      Daftar Kosakata {npc.zoneName}
                    </span>
                    {!allLearned && (
                      <button
                        type="button"
                        onClick={() => onLearnVocab(zoneVocab.map((v) => v.id))}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Catat Semua (+XP)</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-2 max-h-44 space-y-1.5 overflow-y-auto pr-1">
                    {zoneVocab.map((v) => {
                      const status = getWordStatus(wordProgress[v.id]);
                      const mastery = Math.min(3, wordProgress[v.id]?.b || 0);
                      return (
                        <div
                          key={v.id}
                          className="flex items-center justify-between gap-2 rounded-xl border border-amber-300/20 bg-slate-900/80 px-3 py-1.5"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-sm font-extrabold text-white">{v.word}</span>
                              <span className="font-mono-nums text-[11px] text-amber-200/80">
                                {v.phonetic}
                              </span>
                              <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-200">
                                {v.cefr}
                              </span>
                              <span className="font-mono-nums text-[10px] font-bold text-emerald-300">
                                {mastery}/3
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-300">{v.meaningId}</div>
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
                </div>
              )}

              <RpgPillButton
                variant="green"
                onClick={() => {
                  onClose();
                  onEnterDungeon(zoneId, false);
                }}
                className="w-full"
              >
                <span>⚔️ {npc.enterLabel} (5 Pintu + Bos)</span>
              </RpgPillButton>

              <RpgPillButton variant="cream" onClick={onClose} className="w-full">
                <span>Abaikan</span>
              </RpgPillButton>
            </div>
          </div>
        </RpgBoardPanel>
      </div>
    </div>
  );
};
