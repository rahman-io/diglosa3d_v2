import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  X,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import {
  DESA_SCHOOL_TOPICS,
  DesaTopicGuide,
  getDesaWordExplanation,
} from '../data/desaSchoolExplanations';
import {
  ALL_DUOLINGO_TYPES,
  buildChallengeOfType,
  DesaVocabId,
  DuolingoChallenge,
  DuolingoChallengeType,
  VOCAB_IMAGE_BY_ID,
} from '../data/duolingoChallenges';
import { getWordsForZone, VOCAB_BY_ID } from '../data/vocabCatalog';
import { VocabEntry, WordProgress } from '../types/game';
import { DuolingoChallengeView } from './DuolingoChallengeView';
import { RpgBoardPanel, RpgPillButton } from './RpgUiKit';

interface DesaSchoolModalProps {
  open: boolean;
  playerName: string;
  wordProgress: Record<string, WordProgress>;
  onRecordWord: (vocabId: string, correct: boolean, suppressLevelUp?: boolean) => void;
  onClose: () => void;
}

type SchoolTab = 'study' | 'practice';

const CHALLENGE_MODE_LABEL: Record<DuolingoChallengeType, string> = {
  picture_choice: 'Pilih Gambar',
  word_bank_translate: 'Susun Terjemahan',
  speak: 'Ucapkan Kata',
  dialogue_complete: 'Lengkapi Dialog',
  listen_word_bank: 'Dengar & Susun',
  match_pairs: 'Pasangkan Kata',
};

function findTopicGuide(catId: number): DesaTopicGuide {
  return DESA_SCHOOL_TOPICS.find((t) => t.catId === catId) ?? DESA_SCHOOL_TOPICS[0];
}

export const DesaSchoolModal: React.FC<DesaSchoolModalProps> = ({
  open,
  playerName,
  wordProgress,
  onRecordWord,
  onClose,
}) => {
  const desaWords = useMemo(() => getWordsForZone('desa_sapaan'), []);
  const [activeTab, setActiveTab] = useState<SchoolTab>('study');
  const [selectedCatId, setSelectedCatId] = useState<number | 'all'>('all');
  const [onlyUnmastered, setOnlyUnmastered] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState<string>(() => desaWords[0]?.id ?? 'v_0_hello');

  // Practice deck state
  const [deck, setDeck] = useState<DuolingoChallenge[]>([]);
  const [deckIdx, setDeckIdx] = useState(0);
  const [deckCorrect, setDeckCorrect] = useState(0);
  const [answeredChallenge, setAnsweredChallenge] = useState<{
    vocabId: string;
    correct: boolean;
  } | null>(null);
  const [showTeacherHint, setShowTeacherHint] = useState(true);
  const [practiceFinished, setPracticeFinished] = useState(false);

  const filteredWords = useMemo(() => {
    return desaWords.filter((w) => {
      if (selectedCatId !== 'all' && w.catId !== selectedCatId) return false;
      if (onlyUnmastered && (wordProgress[w.id]?.b ?? 0) >= 3) return false;
      return true;
    });
  }, [desaWords, selectedCatId, onlyUnmastered, wordProgress]);

  const masteredCount = useMemo(
    () => desaWords.filter((w) => (wordProgress[w.id]?.b ?? 0) >= 3).length,
    [desaWords, wordProgress],
  );

  const activeWord: VocabEntry | null = useMemo(() => {
    const byId = VOCAB_BY_ID[selectedWordId];
    if (byId && filteredWords.some((w) => w.id === byId.id)) return byId;
    return filteredWords[0] ?? desaWords[0] ?? null;
  }, [selectedWordId, filteredWords, desaWords]);

  const activeExplanation = useMemo(
    () => (activeWord ? getDesaWordExplanation(activeWord.id) : null),
    [activeWord],
  );

  const activeTopicGuide = useMemo(() => {
    if (selectedCatId !== 'all') return findTopicGuide(selectedCatId);
    if (activeWord) return findTopicGuide(activeWord.catId);
    return DESA_SCHOOL_TOPICS[0];
  }, [selectedCatId, activeWord]);

  const buildPracticeDeck = (
    catFilter: number | 'all' = selectedCatId,
    unmasteredOnly: boolean = onlyUnmastered,
  ) => {
    let pool = desaWords.filter((w) => (catFilter === 'all' ? true : w.catId === catFilter));
    if (unmasteredOnly) {
      const unm = pool.filter((w) => (wordProgress[w.id]?.b ?? 0) < 3);
      if (unm.length > 0) pool = unm;
    }
    if (pool.length === 0) pool = desaWords;

    const sorted = [...pool].sort((a, b) => {
      const ab = wordProgress[a.id]?.b ?? 0;
      const bb = wordProgress[b.id]?.b ?? 0;
      if (ab !== bb) return ab - bb;
      return Math.random() - 0.5;
    });
    const sessionWords = sorted.slice(0, Math.min(12, sorted.length));

    const challenges: DuolingoChallenge[] = [];
    for (let i = 0; i < sessionWords.length; i++) {
      const target = sessionWords[i];
      const preferredType = ALL_DUOLINGO_TYPES[i % ALL_DUOLINGO_TYPES.length];
      let built = buildChallengeOfType(preferredType, target.id as DesaVocabId, wordProgress);
      if (!built) {
        for (const fallbackType of ALL_DUOLINGO_TYPES) {
          built = buildChallengeOfType(fallbackType, target.id as DesaVocabId, wordProgress);
          if (built) break;
        }
      }
      if (built) challenges.push(built);
    }

    setDeck(challenges);
    setDeckIdx(0);
    setDeckCorrect(0);
    setAnsweredChallenge(null);
    setPracticeFinished(false);
  };

  if (!open) return null;

  const currentChallenge = deck[deckIdx] ?? null;
  const currentChallengeWord = currentChallenge ? VOCAB_BY_ID[currentChallenge.vocabId] : null;
  const currentChallengeExp = currentChallenge ? getDesaWordExplanation(currentChallenge.vocabId) : null;
  const currentChallengeTopic = currentChallengeWord
    ? findTopicGuide(currentChallengeWord.catId)
    : activeTopicGuide;
  const activeWordImage = activeWord ? VOCAB_IMAGE_BY_ID[activeWord.id] : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/82 p-2.5 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden">
        <RpgBoardPanel className="flex max-h-[94dvh] flex-col overflow-hidden p-3 text-slate-100 shadow-2xl sm:p-5">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-300/25 pb-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-emerald-300/75 bg-emerald-500/20 text-emerald-200 shadow">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[10px] font-black uppercase tracking-wider text-emerald-300 sm:text-xs">
                  Sekolah Desa Sapaan · Ibu Guru Ratna
                </div>
                <h2 className="truncate text-sm font-black text-amber-50 sm:text-lg">
                  Belajar & Ulangi {desaWords.length} Kosakata + Penjelasan Guru
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-xl border border-amber-300/40 bg-slate-900/90 px-2.5 py-1 font-mono-nums text-[11px] font-black text-amber-200">
                Dikuasai: {masteredCount}/{desaWords.length}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup Sekolah"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-slate-900/80 text-slate-100 hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mode Tabs & Category Filter */}
          <div className="mt-2.5 flex flex-col gap-2 border-b border-white/10 pb-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <RpgPillButton
                  variant={activeTab === 'study' ? 'green' : 'cream'}
                  size="sm"
                  onClick={() => setActiveTab('study')}
                >
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span>Materi & Penjelasan Guru</span>
                </RpgPillButton>
                <RpgPillButton
                  variant={activeTab === 'practice' ? 'gold' : 'cream'}
                  size="sm"
                  onClick={() => {
                    setActiveTab('practice');
                    if (deck.length === 0) buildPracticeDeck(selectedCatId, onlyUnmastered);
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span>Tantangan 6 Mode + Penjelasan</span>
                </RpgPillButton>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-slate-900/75 px-2.5 py-1 text-[11px] font-bold text-slate-200">
                <input
                  type="checkbox"
                  checked={onlyUnmastered}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setOnlyUnmastered(next);
                    if (activeTab === 'practice') buildPracticeDeck(selectedCatId, next);
                  }}
                  className="accent-emerald-400"
                />
                <span>Hanya yang belum dikuasai</span>
              </label>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedCatId('all');
                  if (activeTab === 'practice') buildPracticeDeck('all', onlyUnmastered);
                }}
                className={`shrink-0 rounded-xl border px-2.5 py-1 text-[11px] font-black transition ${
                  selectedCatId === 'all'
                    ? 'border-amber-300 bg-amber-500/25 text-amber-100'
                    : 'border-white/15 bg-slate-900/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Semua ({desaWords.length})
              </button>
              {DESA_SCHOOL_TOPICS.map((topic) => {
                const count = desaWords.filter((w) => w.catId === topic.catId).length;
                const active = selectedCatId === topic.catId;
                return (
                  <button
                    key={topic.catId}
                    type="button"
                    onClick={() => {
                      setSelectedCatId(topic.catId);
                      const firstInCat = desaWords.find((w) => w.catId === topic.catId);
                      if (firstInCat) setSelectedWordId(firstInCat.id);
                      if (activeTab === 'practice') buildPracticeDeck(topic.catId, onlyUnmastered);
                    }}
                    className={`shrink-0 rounded-xl border px-2.5 py-1 text-[11px] font-bold transition ${
                      active
                        ? 'border-emerald-300 bg-emerald-500/25 text-emerald-100'
                        : 'border-white/15 bg-slate-900/70 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {topic.titleId} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body */}
          <div className="mt-2.5 flex-1 overflow-y-auto overscroll-contain pr-0.5">
            {activeTab === 'study' ? (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                {/* Word list */}
                <div className="space-y-2 lg:col-span-5">
                  <div className="rounded-xl border border-emerald-300/30 bg-emerald-950/35 px-3 py-2 text-[11px] text-emerald-100">
                    <div className="font-black text-emerald-200">
                      Topik: {activeTopicGuide.titleId} ({activeTopicGuide.subtitleEn})
                    </div>
                    <p className="mt-0.5 text-emerald-100/90">{activeTopicGuide.summaryId}</p>
                    <p className="mt-1 text-[10px] font-bold text-amber-200">
                      Aturan Guru: {activeTopicGuide.grammarRuleId}
                    </p>
                  </div>

                  <div className="grid max-h-[340px] grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2 lg:max-h-[420px] lg:grid-cols-1">
                    {filteredWords.length === 0 ? (
                      <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-center text-xs text-slate-300">
                        Semua kosakata di topik ini sudah kamu kuasai! Nonaktifkan centang &ldquo;Hanya yang belum
                        dikuasai&rdquo; untuk mengulang semuanya.
                      </div>
                    ) : (
                      filteredWords.map((w) => {
                        const isSelected = activeWord?.id === w.id;
                        const box = wordProgress[w.id]?.b ?? 0;
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => {
                              setSelectedWordId(w.id);
                              soundEngine.speakEnglish(w.word);
                            }}
                            className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition ${
                              isSelected
                                ? 'border-amber-300 bg-amber-500/20 text-amber-50 shadow'
                                : 'border-white/10 bg-slate-900/75 text-slate-200 hover:border-white/30'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="truncate text-xs font-black text-white sm:text-sm">{w.word}</div>
                              <div className="truncate text-[11px] text-slate-300">{w.meaningId}</div>
                            </div>
                            <span
                              className={`shrink-0 rounded-lg px-2 py-0.5 font-mono-nums text-[10px] font-black ${
                                box >= 3
                                  ? 'bg-emerald-500/25 text-emerald-200'
                                  : box > 0
                                  ? 'bg-sky-500/25 text-sky-200'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {box >= 3 ? 'Kuasai' : `Lv ${box}`}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Detailed Teacher Explanation Panel */}
                <div className="lg:col-span-7">
                  {activeWord && activeExplanation && (
                    <div className="space-y-3 rounded-2xl border border-amber-300/35 bg-slate-900/90 p-3.5 shadow-inner sm:p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-3">
                          {activeWordImage && (
                            <img
                              src={activeWordImage}
                              alt={activeWord.word}
                              className="h-14 w-14 shrink-0 rounded-xl border border-amber-300/40 bg-slate-950 object-contain p-1"
                            />
                          )}
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-lg font-black text-amber-200 sm:text-2xl">
                                {activeWord.word}
                              </span>
                              <span className="rounded-lg border border-sky-300/40 bg-sky-950/60 px-2 py-0.5 text-[10px] font-extrabold text-sky-200">
                                {activeExplanation.wordTypeId}
                              </span>
                            </div>
                            <div className="mt-0.5 text-xs font-bold text-slate-300">
                              Pelafalan: <span className="font-mono text-amber-100">{activeWord.phonetic}</span> · Arti:{' '}
                              <span className="font-black text-emerald-300">{activeWord.meaningId}</span>
                            </div>
                          </div>
                        </div>

                        <RpgPillButton
                          variant="gold"
                          size="sm"
                          onClick={() => soundEngine.speakEnglish(activeWord.word)}
                        >
                          <Volume2 className="h-4 w-4" />
                          <span>Dengar</span>
                        </RpgPillButton>
                      </div>

                      <div className="rounded-xl border border-emerald-300/35 bg-emerald-950/40 p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-black text-emerald-200">
                          <GraduationCap className="h-4 w-4" />
                          <span>Penjelasan Ibu Guru Ratna</span>
                        </div>
                        <p className="text-xs leading-relaxed text-emerald-50 sm:text-sm">
                          {activeExplanation.explanationId}
                        </p>
                      </div>

                      <div className="rounded-xl border border-amber-300/30 bg-amber-950/30 p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-black text-amber-200">
                          <Lightbulb className="h-4 w-4" />
                          <span>Tips Pemakaian & Tata Bahasa</span>
                        </div>
                        <p className="text-xs leading-relaxed text-amber-50 sm:text-sm">
                          {activeExplanation.usageTipId}
                        </p>
                      </div>

                      <div className="rounded-xl border border-sky-300/30 bg-slate-950/75 p-3">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-sky-200">Contoh Kalimat</span>
                          <button
                            type="button"
                            onClick={() => soundEngine.speakEnglish(activeExplanation.exampleEn)}
                            className="inline-flex items-center gap-1 rounded-lg border border-sky-300/40 bg-sky-900/50 px-2 py-0.5 text-[10px] font-bold text-sky-100 hover:bg-sky-800/60"
                          >
                            <Volume2 className="h-3 w-3" />
                            <span>Putar Contoh</span>
                          </button>
                        </div>
                        <p className="text-xs font-extrabold text-white sm:text-sm">
                          &ldquo;{activeExplanation.exampleEn}&rdquo;
                        </p>
                        <p className="mt-1 text-xs text-slate-300">
                          Artinya: &ldquo;{activeExplanation.exampleId}&rdquo;
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-slate-400">
                          Catatan Guru untuk {playerName || 'Murid'}: baca contoh lalu uji pemahamanmu.
                        </span>
                        <RpgPillButton
                          variant="green"
                          size="sm"
                          onClick={() => {
                            setActiveTab('practice');
                            buildPracticeDeck(selectedCatId, onlyUnmastered);
                          }}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Uji di Latihan Tantangan</span>
                        </RpgPillButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : practiceFinished ? (
              <div className="mx-auto max-w-xl space-y-3 rounded-2xl border border-emerald-300/45 bg-slate-900/90 p-5 text-center">
                <Trophy className="mx-auto h-12 w-12 text-amber-300" />
                <h3 className="text-lg font-black text-amber-100">
                  Sesi Belajar Sekolah Desa Selesai!
                </h3>
                <p className="text-xs text-slate-200 sm:text-sm">
                  Kamu menjawab benar <span className="font-black text-emerald-300">{deckCorrect}</span> dari{' '}
                  <span className="font-black text-amber-200">{deck.length}</span> tantangan. Terus ulangi{' '}
                  {desaWords.length} kosakata Desa Sapaan agar penguasaanmu makin mantap!
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <RpgPillButton
                    variant="gold"
                    size="sm"
                    onClick={() => buildPracticeDeck(selectedCatId, onlyUnmastered)}
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Latihan Sesi Baru</span>
                  </RpgPillButton>
                  <RpgPillButton variant="cream" size="sm" onClick={() => setActiveTab('study')}>
                    <BookOpen className="h-4 w-4" />
                    <span>Kembali ke Catatan Guru</span>
                  </RpgPillButton>
                </div>
              </div>
            ) : currentChallenge ? (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                <div className="space-y-2.5 lg:col-span-7">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/15 bg-slate-900/80 px-3 py-2 text-xs">
                    <span className="font-black text-amber-200">
                      Soal {deckIdx + 1}/{deck.length} · {CHALLENGE_MODE_LABEL[currentChallenge.type]}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-nums font-black text-emerald-300">Benar: {deckCorrect}</span>
                      <button
                        type="button"
                        onClick={() => buildPracticeDeck(selectedCatId, onlyUnmastered)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-200 hover:bg-slate-700"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Acak Baru</span>
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-300/30 bg-slate-900/90 p-3.5 sm:p-4">
                    <DuolingoChallengeView
                      key={`${deckIdx}_${currentChallenge.vocabId}_${currentChallenge.type}`}
                      challenge={currentChallenge}
                      onResolved={(outcome) => {
                        onRecordWord(outcome.vocabId, outcome.correct, false);
                        if (outcome.correct) setDeckCorrect((c) => c + 1);
                        setAnsweredChallenge({
                          vocabId: outcome.vocabId,
                          correct: outcome.correct,
                        });
                      }}
                    />

                    {answeredChallenge && (
                      <div className="mt-3 flex justify-end border-t border-white/10 pt-3">
                        <RpgPillButton
                          variant="green"
                          size="sm"
                          onClick={() => {
                            if (deckIdx + 1 < deck.length) {
                              setDeckIdx((i) => i + 1);
                              setAnsweredChallenge(null);
                            } else {
                              setPracticeFinished(true);
                            }
                          }}
                        >
                          <span>{deckIdx + 1 < deck.length ? 'Soal Berikutnya →' : 'Lihat Hasil Belajar'}</span>
                        </RpgPillButton>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Teacher Explanation alongside Challenge */}
                <div className="space-y-2.5 lg:col-span-5">
                  <div className="rounded-2xl border border-emerald-300/40 bg-emerald-950/35 p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-200">
                        <GraduationCap className="h-4 w-4" />
                        <span>Papan Penjelasan Ibu Guru</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTeacherHint((v) => !v)}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-300/35 bg-slate-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-100"
                      >
                        <HelpCircle className="h-3 w-3" />
                        <span>{showTeacherHint ? 'Sembunyikan' : 'Tampilkan'}</span>
                      </button>
                    </div>

                    {showTeacherHint && (
                      <div className="mt-2.5 space-y-2.5 text-xs">
                        <div className="rounded-xl border border-white/10 bg-slate-950/65 p-2.5">
                          <div className="font-black text-amber-200">
                            Topik: {currentChallengeTopic.titleId} ({currentChallengeTopic.subtitleEn})
                          </div>
                          <p className="mt-1 leading-relaxed text-slate-200">
                            {currentChallengeTopic.summaryId}
                          </p>
                          <p className="mt-1 text-[11px] font-bold text-emerald-200">
                            Aturan Guru: {currentChallengeTopic.grammarRuleId}
                          </p>
                        </div>

                        {answeredChallenge && currentChallengeExp && currentChallengeWord ? (
                          <div className="space-y-2 rounded-xl border border-amber-300/40 bg-slate-950/80 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 font-black text-amber-200">
                                <CheckCircle2
                                  className={`h-4 w-4 ${
                                    answeredChallenge.correct ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                />
                                <span>
                                  Pembahasan: {currentChallengeWord.word} ({currentChallengeWord.meaningId})
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => soundEngine.speakEnglish(currentChallengeWord.word)}
                                className="rounded-lg border border-white/20 bg-slate-800 p-1 text-amber-200 hover:bg-slate-700"
                                title="Dengar pengucapan"
                              >
                                <Volume2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="font-mono text-[11px] text-sky-200">
                              {currentChallengeExp.wordTypeId} · {currentChallengeWord.phonetic}
                            </p>
                            <p className="leading-relaxed text-emerald-50">{currentChallengeExp.explanationId}</p>
                            <p className="rounded-lg bg-amber-950/50 p-2 text-[11px] text-amber-100">
                              <span className="font-black">Tips Guru:</span> {currentChallengeExp.usageTipId}
                            </p>
                            <div className="text-[11px] text-slate-300">
                              <span className="font-bold text-white">Contoh:</span> &ldquo;
                              {currentChallengeExp.exampleEn}&rdquo; ({currentChallengeExp.exampleId})
                            </div>
                          </div>
                        ) : (
                          currentChallengeExp && (
                            <div className="rounded-xl border border-sky-300/25 bg-sky-950/35 p-2.5 text-sky-100">
                              <div className="font-black text-sky-200">Petunjuk Guru Sebelum Menjawab</div>
                              <p className="mt-1 leading-relaxed">{currentChallengeExp.usageTipId}</p>
                              <p className="mt-1 text-[10px] text-sky-200/80">
                                Penjelasan lengkap kata & contoh kalimat otomatis muncul setelah kamu menjawab soal
                                ini.
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </RpgBoardPanel>
      </div>
    </div>
  );
};
