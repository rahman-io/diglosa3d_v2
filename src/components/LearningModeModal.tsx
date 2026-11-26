import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  HelpCircle,
  RotateCw,
  Star,
  Volume2,
  X,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { DIFF_CONFIG } from '../data/diglosaCatalog';
import {
  CATEGORIES,
  pickDistractors,
  VOCAB_BY_ID,
  VOCAB_CATALOG,
} from '../data/vocabCatalog';
import {
  DifficultyMode,
  LearningSessionContext,
  VocabEntry,
} from '../types/game';
import {
  RpgBoardPanel,
  RpgChoiceCard,
  RpgNameplate,
  RpgPillButton,
  RpgTimerBar,
} from './RpgUiKit';
import { scrollFieldIntoView, useVisualViewport } from '../utils/useVisualViewport';

interface LearningModeModalProps {
  session: LearningSessionContext | null;
  difficulty: DifficultyMode;
  qtimerEnabled: boolean;
  onRecordWord: (vocabId: string, ok: boolean, noLevel?: boolean) => void;
  onComplete: (
    ctx: LearningSessionContext,
    pct: number,
    xpEarned: number,
    cekCepatPassed?: boolean,
  ) => void;
  onClose: () => void;
}

interface McqRound {
  entry: VocabEntry;
  prompt: string;
  choices: string[];
  correctIdx: number;
}

function buildMcqRound(entry: VocabEntry, forceListen = false): McqRound {
  const distractors = pickDistractors(entry, 3);
  const askMeaning = forceListen ? true : Math.random() < 0.5;
  const raw = askMeaning
    ? [entry.meaningId, ...distractors.map((d) => d.meaningId)]
    : [entry.word, ...distractors.map((d) => d.word)];
  const indexed = raw.map((t, i) => ({ t, ok: i === 0 })).sort(() => Math.random() - 0.5);
  return {
    entry,
    prompt: forceListen
      ? 'Dengarkan pelafalan lalu pilih artinya'
      : askMeaning
      ? `Apa arti kata "${entry.word}"?`
      : `Bahasa Inggris dari "${entry.meaningId}"?`,
    choices: indexed.map((x) => x.t),
    correctIdx: indexed.findIndex((x) => x.ok),
  };
}

export const LearningModeModal: React.FC<LearningModeModalProps> = ({
  session,
  difficulty,
  qtimerEnabled,
  onRecordWord,
  onComplete,
  onClose,
}) => {
  const words = useMemo<VocabEntry[]>(() => {
    if (!session) return [];
    const list = session.wordIds.map((id) => VOCAB_BY_ID[id]).filter(Boolean);
    return list.length > 0 ? list : VOCAB_CATALOG.slice(0, 10);
  }, [session]);

  const vp = useVisualViewport(Boolean(session));

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [rightCount, setRightCount] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [combo, setCombo] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [peeked, setPeeked] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // Cek Cepat (3-question check after Cards in Door 0!)
  const [cekCepatPool, setCekCepatPool] = useState<McqRound[] | null>(null);
  const [cekIdx, setCekIdx] = useState(0);
  const [cekRight, setCekRight] = useState(0);

  // Quiz / Listen round
  const [mcq, setMcq] = useState<McqRound | null>(null);

  // Type mode
  const [typed, setTyped] = useState('');
  const [typeTries, setTypeTries] = useState(0);
  const [typeHints, setTypeHints] = useState(0);

  // Match mode
  const [matchLeft, setMatchLeft] = useState<VocabEntry[]>([]);
  const [matchRight, setMatchRight] = useState<VocabEntry[]>([]);
  const [selLeftId, setSelLeftId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [matchMoves, setMatchMoves] = useState(0);

  // Timer (qstrip / board)
  const diffCfg = DIFF_CONFIG[difficulty];
  const activeMaxSec = session
    ? session.mode === 'match'
      ? diffCfg.matchSec
      : session.mode === 'type'
      ? Math.round(diffCfg.qSec * 1.5)
      : diffCfg.qSec
    : 12;
  const [timeLeft, setTimeLeft] = useState(activeMaxSec);
  const timeLeftRef = useRef(activeMaxSec);
  const resetTimeLeft = (val: number) => {
    timeLeftRef.current = val;
    setTimeLeft(val);
  };

  // Result phase
  const [resultData, setResultData] = useState<{
    pct: number;
    stars: 1 | 2 | 3;
    cekCepatPassed?: boolean;
  } | null>(null);

  // Reset on session change
  useEffect(() => {
    if (!session || words.length === 0) return;
    setIdx(0);
    setFlipped(false);
    setRightCount(0);
    setTotalAttempted(0);
    setCombo(0);
    setXpEarned(0);
    setPeeked(false);
    setFeedback(null);
    setCekCepatPool(null);
    setCekIdx(0);
    setCekRight(0);
    setResultData(null);
    setTyped('');
    setTypeTries(0);
    setTypeHints(0);
    resetTimeLeft(activeMaxSec);

    if (session.mode === 'quiz' || session.mode === 'listen') {
      const round = buildMcqRound(words[0], session.mode === 'listen');
      setMcq(round);
      if (session.mode === 'listen') {
        window.setTimeout(() => soundEngine.speakEnglish(words[0].word, 0.85), 350);
      }
    } else if (session.mode === 'match') {
      const sub = words.slice(0, 8);
      setMatchLeft([...sub].sort(() => Math.random() - 0.5));
      setMatchRight([...sub].sort(() => Math.random() - 0.5));
      setSelLeftId(null);
      setMatchedIds([]);
      setMatchMoves(0);
    }
  }, [session, words, activeMaxSec]);

  // Countdown timer for qstrip / match board
  useEffect(() => {
    if (!session || resultData || !qtimerEnabled) return;
    if (session.mode === 'cards' && !cekCepatPool) return;
    if (feedback) return;

    let lastMs = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const dt = (now - lastMs) / 1000;
      lastMs = now;
      const next = Math.max(0, timeLeftRef.current - dt);
      timeLeftRef.current = next;
      setTimeLeft(next);
      if (next <= 0) {
        window.clearInterval(timer);
        handleTimeout();
      }
    }, 100);
    return () => window.clearInterval(timer);
  });

  const finishSession = (finalRight: number, finalTotal: number, cekPassed?: boolean) => {
    if (!session) return;
    const pct = finalTotal > 0 ? Math.round((finalRight / finalTotal) * 100) : 100;
    const stars: 1 | 2 | 3 = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;
    if (stars === 3) soundEngine.playFanfare();
    else if (stars === 2) soundEngine.playWin();
    else soundEngine.playWrongAnswer();
    setResultData({ pct, stars, cekCepatPassed: cekPassed });
  };

  const advanceQuestion = (nextIdx: number, nextRight: number, nextTotal: number) => {
    if (!session) return;
    if (nextIdx >= words.length) {
      finishSession(nextRight, nextTotal);
      return;
    }
    setIdx(nextIdx);
    setFlipped(false);
    setPeeked(false);
    setFeedback(null);
    setTyped('');
    setTypeTries(0);
    setTypeHints(0);
    resetTimeLeft(activeMaxSec);

    if (session.mode === 'quiz' || session.mode === 'listen') {
      const round = buildMcqRound(words[nextIdx], session.mode === 'listen');
      setMcq(round);
      if (session.mode === 'listen') {
        window.setTimeout(() => soundEngine.speakEnglish(words[nextIdx].word, 0.85), 350);
      }
    }
  };

  const handleTimeout = () => {
    if (!session || resultData) return;
    if (session.mode === 'match') {
      const subCount = matchLeft.length;
      finishSession(matchedIds.length, Math.max(subCount, matchMoves));
      return;
    }
    if (cekCepatPool) {
      handleCekCepatPick(-1);
      return;
    }
    const cur = words[idx];
    if (cur) onRecordWord(cur.id, false, false);
    soundEngine.playWrongAnswer();
    setCombo(0);
    setFeedback({ ok: false, msg: `Waktu habis! Jawaban benar yaitu "${cur?.word}" (${cur?.meaningId})` });
    const nextTotal = totalAttempted + 1;
    setTotalAttempted(nextTotal);
    window.setTimeout(() => advanceQuestion(idx + 1, rightCount, nextTotal), 1150);
  };

  const handleCardMark = (knewIt: boolean) => {
    if (!session) return;
    const cur = words[idx];
    if (!cur) return;
    onRecordWord(cur.id, knewIt, false);
    if (knewIt) {
      soundEngine.playOk();
      setXpEarned((x) => x + 5);
    } else {
      soundEngine.playFlip();
    }
    const nextRight = rightCount + (knewIt ? 1 : 0);
    const nextTotal = totalAttempted + 1;
    setRightCount(nextRight);
    setTotalAttempted(nextTotal);

    if (idx + 1 >= words.length) {
      // Door 0 triggers 3-question Cek Cepat!
      if (session.doorIndex === 0) {
        const sample = [...words].sort(() => Math.random() - 0.5).slice(0, 3);
        setCekCepatPool(sample.map((w) => buildMcqRound(w, false)));
        setCekIdx(0);
        setCekRight(0);
        resetTimeLeft(diffCfg.qSec);
      } else {
        finishSession(nextRight, nextTotal);
      }
    } else {
      setIdx(idx + 1);
      setFlipped(false);
    }
  };

  const handleCekCepatPick = (choiceIdx: number) => {
    if (!cekCepatPool || feedback) return;
    const round = cekCepatPool[cekIdx];
    const ok = choiceIdx === round.correctIdx;
    onRecordWord(round.entry.id, ok, false);
    if (ok) soundEngine.playOk();
    else soundEngine.playWrongAnswer();

    const nextCekRight = cekRight + (ok ? 1 : 0);
    setCekRight(nextCekRight);
    setFeedback({
      ok,
      msg: ok ? 'Benar!' : `Kurang tepat! Jawaban benar yaitu "${round.choices[round.correctIdx]}"`,
    });

    window.setTimeout(() => {
      setFeedback(null);
      if (cekIdx + 1 >= cekCepatPool.length) {
        finishSession(nextCekRight, cekCepatPool.length, nextCekRight >= 2);
      } else {
        setCekIdx(cekIdx + 1);
        resetTimeLeft(diffCfg.qSec);
      }
    }, 900);
  };

  const handleMcqPick = (choiceIdx: number) => {
    if (!session || !mcq || feedback) return;
    const ok = choiceIdx === mcq.correctIdx;
    const noLevel = session.mode === 'listen' && peeked;
    onRecordWord(mcq.entry.id, ok, noLevel);

    let nextCombo = combo;
    let nextRight = rightCount;
    const nextTotal = totalAttempted + 1;
    if (ok) {
      nextCombo += 1;
      nextRight += 1;
      const base = session.mode === 'listen' ? 12 : 10;
      const rawGain = base + Math.min(nextCombo - 1, 5) * 2;
      const gain = noLevel ? Math.ceil(rawGain / 2) : rawGain;
      setXpEarned((x) => x + gain);
      soundEngine.playOk();
      setFeedback({
        ok: true,
        msg: noLevel ? `Benar (+${gain} XP · Intip aktif)` : `Tepat! +${gain} XP`,
      });
    } else {
      nextCombo = 0;
      soundEngine.playWrongAnswer();
      setFeedback({
        ok: false,
        msg: `Salah! Jawaban benar yaitu "${mcq.choices[mcq.correctIdx]}"`,
      });
    }
    setCombo(nextCombo);
    setRightCount(nextRight);
    setTotalAttempted(nextTotal);
    window.setTimeout(() => advanceQuestion(idx + 1, nextRight, nextTotal), 1000);
  };

  const handleSubmitType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || feedback) return;
    const cur = words[idx];
    if (!cur) return;
    const cleanInput = typed.trim().toLowerCase();
    const cleanTarget = cur.word.trim().toLowerCase();
    if (cleanInput === cleanTarget) {
      const gain = Math.max(5, 15 - 3 * typeHints);
      onRecordWord(cur.id, true, false);
      setXpEarned((x) => x + gain);
      const nextRight = rightCount + 1;
      const nextTotal = totalAttempted + 1;
      setRightCount(nextRight);
      setTotalAttempted(nextTotal);
      soundEngine.playOk();
      setFeedback({ ok: true, msg: `Ejaan Sempurna! "${cur.word}" (+${gain} XP)` });
      window.setTimeout(() => advanceQuestion(idx + 1, nextRight, nextTotal), 1000);
    } else {
      const nextTries = typeTries + 1;
      setTypeTries(nextTries);
      soundEngine.playWrongAnswer();
      if (nextTries >= 2) {
        onRecordWord(cur.id, false, false);
        const nextTotal = totalAttempted + 1;
        setTotalAttempted(nextTotal);
        setFeedback({ ok: false, msg: `Jawaban benar yaitu "${cur.word}"` });
        window.setTimeout(() => advanceQuestion(idx + 1, rightCount, nextTotal), 1200);
      } else {
        setFeedback({ ok: false, msg: 'Masih kurang tepat, coba 1 kali lagi!' });
        window.setTimeout(() => setFeedback(null), 800);
      }
    }
  };

  const handlePickRightMatch = (rightEntry: VocabEntry) => {
    if (!selLeftId || matchedIds.includes(rightEntry.id)) return;
    const nextMoves = matchMoves + 1;
    setMatchMoves(nextMoves);
    if (selLeftId === rightEntry.id) {
      onRecordWord(rightEntry.id, true, false);
      setXpEarned((x) => x + 8);
      soundEngine.playOk();
      const nextMatched = [...matchedIds, rightEntry.id];
      setMatchedIds(nextMatched);
      setSelLeftId(null);
      if (nextMatched.length >= matchLeft.length) {
        finishSession(matchLeft.length, Math.max(matchLeft.length, nextMoves));
      }
    } else {
      onRecordWord(selLeftId, false, false);
      soundEngine.playWrongAnswer();
      setSelLeftId(null);
    }
  };

  if (!session) return null;

  const currentWord = words[idx];
  const cat = currentWord ? CATEGORIES.find((c) => c.id === currentWord.catId) : null;
  const timerRatio = Math.max(0, Math.min(1, timeLeft / Math.max(1, activeMaxSec)));
  const isCompactKeyboard = vp.isKeyboardOpen && session.mode === 'type' && !resultData;
  const isTightHeight = vp.isKeyboardOpen || vp.height < 460;

  return (
    <div
      style={{ top: `${vp.offsetTop}px`, height: `${vp.height}px` }}
      className={`fixed left-0 right-0 z-50 flex justify-center overflow-y-auto overscroll-contain touch-pan-y bg-[#060b16]/78 ${
        isTightHeight ? 'items-start p-1.5 sm:p-3' : 'items-center p-2 sm:p-4'
      }`}
    >
      <div className="my-auto w-full max-w-2xl pb-1">
        <RpgBoardPanel compact={isCompactKeyboard}>
          {isCompactKeyboard ? (
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs font-black text-amber-200">
                  <span className="truncate">{session.title}</span>
                  <span className="shrink-0 font-mono-nums text-[11px] text-amber-100/85">
                    {Math.min(idx + 1, words.length)}/{words.length} · +{xpEarned} XP
                  </span>
                </div>
                {qtimerEnabled && (
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-900/90 ring-1 ring-amber-300/30">
                    <div
                      className={`h-full transition-all duration-100 ${
                        timerRatio > 0.35
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                          : 'bg-gradient-to-r from-rose-500 to-red-600'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, timerRatio * 100))}%` }}
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup tantangan"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-300/60 bg-slate-900/95 text-amber-100 shadow"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              {/* RPG Nameplate Header */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <RpgNameplate className="min-w-0">
                  <div className="min-w-0 leading-tight">
                    <h2 className="truncate text-sm font-black tracking-tight text-[#3b1b06] sm:text-base">
                      {session.title}
                    </h2>
                    <p className="truncate text-[10px] font-extrabold text-[#78350f] sm:text-[11px]">
                      {session.mode === 'match'
                        ? `Pasangan ${matchedIds.length}/${matchLeft.length} · Langkah ${matchMoves}`
                        : cekCepatPool
                        ? `Cek Cepat Kartu ${cekIdx + 1}/${cekCepatPool.length}`
                        : `Kata ${Math.min(idx + 1, words.length)}/${words.length} · +${xpEarned} XP`}
                    </p>
                  </div>
                </RpgNameplate>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup tantangan"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-amber-300/60 bg-slate-900/95 text-amber-100 shadow-lg transition hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* qstrip Ornate RPG Timer Bar (Hoot on left, Monster approaching from right!) */}
              {qtimerEnabled && !resultData && (session.mode !== 'cards' || Boolean(cekCepatPool)) && (
                <div className="mb-3">
                  <RpgTimerBar
                    pct={timerRatio * 100}
                    barClassName={
                      timerRatio > 0.35
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                        : 'bg-gradient-to-r from-rose-500 to-red-600'
                    }
                  >
                    <span className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 text-[11px] leading-none">
                      🦉
                    </span>
                    <span
                      className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[11px] leading-none transition-all duration-100"
                      style={{ left: `${Math.max(10, timerRatio * 90)}%` }}
                    >
                      👾
                    </span>
                  </RpgTimerBar>
                </div>
              )}
            </>
          )}

          {/* Body */}
          <div>
            {resultData ? (
              <div className="space-y-4 rounded-2xl border border-amber-300/25 bg-slate-950/50 p-5 text-center">
                {resultData.stars === 3 && (
                  <div className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                    ★ Konfeti Kemenangan Sempurna! ★
                  </div>
                )}
                <div className="flex justify-center gap-2">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`h-10 w-10 ${
                        s <= resultData.stars
                          ? 'fill-amber-400 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.65)]'
                          : 'fill-slate-800 text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <h3 className="text-2xl font-black text-white">Skor {resultData.pct}%</h3>
                <p className="text-sm font-bold text-amber-200/90">
                  {resultData.pct >= session.minPct
                    ? `Hebat! Syarat minimal (${session.minPct}%) terpenuhi! ${resultData.pct >= 70 ? '(+20 XP Bonus Sesi!)' : ''}`
                    : `Butuh minimal ${session.minPct}% untuk menuntaskan pintu ini. Yuk coba lagi!`}
                </p>
                {resultData.cekCepatPassed !== undefined && (
                  <div className="rounded-xl border border-emerald-400/50 bg-emerald-950/60 px-4 py-2 text-xs font-extrabold text-emerald-200">
                    {resultData.cekCepatPassed
                      ? 'Cek Cepat Lulus (≥2/3)! Bonus +1 ❤️ ditemukan di luar pintu!'
                      : 'Pintu Kartu tetap terbuka! Jawab ≥2/3 Cek Cepat lain kali untuk hadiah ❤️.'}
                  </div>
                )}
                <RpgPillButton
                  variant="green"
                  onClick={() =>
                    onComplete(
                      session,
                      resultData.pct,
                      xpEarned,
                      resultData.cekCepatPassed,
                    )
                  }
                  className="w-full"
                >
                  <span>Selesai &amp; Lanjutkan</span>
                </RpgPillButton>
              </div>
            ) : cekCepatPool ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-amber-400/40 bg-amber-500/20 px-3 py-2 text-xs font-extrabold text-amber-200">
                  Cek Cepat 3 Soal! Jawab benar ≥ 2/3 untuk menjatuhkan Hati (+1 ❤️)!
                </div>
                <div className="rounded-2xl border border-amber-300/20 bg-slate-950/45 px-4 py-3">
                  <h3 className="text-base font-extrabold text-white sm:text-lg">
                    {cekCepatPool[cekIdx].prompt}
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {cekCepatPool[cekIdx].choices.map((c, i) => (
                    <RpgChoiceCard
                      key={i}
                      tone={feedback ? 'muted' : 'default'}
                      disabled={Boolean(feedback)}
                      onClick={() => handleCekCepatPick(i)}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-sm"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-amber-300/50 bg-amber-500/20 font-mono-nums text-xs font-black text-amber-200">
                        {i + 1}
                      </span>
                      <span className="font-extrabold">{c}</span>
                    </RpgChoiceCard>
                  ))}
                </div>
                {feedback && (
                  <div
                    className={`rounded-xl border px-3 py-2 text-center text-xs font-extrabold ${
                      feedback.ok
                        ? 'border-emerald-400/50 bg-emerald-950/65 text-emerald-200'
                        : 'border-rose-400/50 bg-rose-950/65 text-rose-200'
                    }`}
                  >
                    {feedback.msg}
                  </div>
                )}
              </div>
            ) : session.mode === 'cards' && currentWord ? (
              <div className="space-y-3.5">
                <RpgChoiceCard
                  onClick={() => {
                    soundEngine.playFlip();
                    setFlipped((f) => !f);
                  }}
                  className="flex min-h-[185px] w-full flex-col items-center justify-center px-5 py-6 text-center"
                >
                  <span className="rounded-full border border-amber-300/40 bg-amber-500/20 px-3 py-0.5 text-xs font-extrabold text-amber-200">
                    {cat?.icon} {cat?.name}
                  </span>
                  {!flipped ? (
                    <>
                      <div className="mt-3 text-3xl font-black text-white">{currentWord.word}</div>
                      <div className="mt-1 font-mono-nums text-xs text-amber-200/85">
                        {currentWord.phonetic}
                      </div>
                      <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-sky-200">
                        <RotateCw className="h-3.5 w-3.5" />
                        <span>Klik kartu untuk balik &amp; lihat arti</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mt-3 text-2xl font-black text-emerald-300">
                        {currentWord.meaningId}
                      </div>
                      <div className="mt-1 text-sm font-bold text-amber-200">{currentWord.word}</div>
                      <p className="mt-2 text-xs italic text-slate-300">{currentWord.exampleId}</p>
                    </>
                  )}
                </RpgChoiceCard>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <RpgPillButton
                    variant="gold"
                    size="sm"
                    onClick={() => soundEngine.speakEnglish(currentWord.word)}
                  >
                    <Volume2 className="h-4 w-4 shrink-0" />
                    <span>Dengar</span>
                  </RpgPillButton>
                  <div className="flex flex-1 gap-2">
                    <RpgPillButton
                      variant="cream"
                      size="sm"
                      onClick={() => handleCardMark(false)}
                      className="flex-1"
                    >
                      <span>Ulangi Nanti</span>
                    </RpgPillButton>
                    <RpgPillButton
                      variant="green"
                      size="sm"
                      onClick={() => handleCardMark(true)}
                      className="flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Sudah Hafal (+5 XP)</span>
                    </RpgPillButton>
                  </div>
                </div>
              </div>
            ) : (session.mode === 'quiz' || session.mode === 'listen') && mcq ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 rounded-2xl border border-amber-300/20 bg-slate-950/45 px-3.5 py-2.5">
                  <h3 className="text-base font-extrabold text-white sm:text-lg">{mcq.prompt}</h3>
                  <button
                    type="button"
                    onClick={() => soundEngine.speakEnglish(mcq.entry.word, 0.85)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-amber-300/40 bg-amber-400/20 px-3 py-1.5 text-xs font-extrabold text-amber-200 hover:bg-amber-400/35"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>Putar</span>
                  </button>
                </div>

                {session.mode === 'listen' && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300/20 bg-slate-950/40 px-3 py-2 text-xs">
                    {peeked ? (
                      <span className="font-extrabold text-amber-200">
                        Kata &ldquo;{mcq.entry.word}&rdquo; (XP separuh, penguasaan tidak naik)
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-100/80">
                        Dengar pelafalan atau intip kata jika ragu.
                      </span>
                    )}
                    {!peeked && (
                      <button
                        type="button"
                        onClick={() => setPeeked(true)}
                        className="inline-flex items-center gap-1 rounded-lg border border-amber-300/35 bg-amber-500/20 px-2.5 py-1 font-extrabold text-amber-200 hover:bg-amber-500/35"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Intip kata</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {mcq.choices.map((c, i) => (
                    <RpgChoiceCard
                      key={i}
                      tone={feedback ? 'muted' : 'default'}
                      disabled={Boolean(feedback)}
                      onClick={() => handleMcqPick(i)}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-sm"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-amber-300/50 bg-amber-500/20 font-mono-nums text-xs font-black text-amber-200">
                        {i + 1}
                      </span>
                      <span className="font-extrabold">{c}</span>
                    </RpgChoiceCard>
                  ))}
                </div>

                {feedback && (
                  <div
                    className={`rounded-xl border px-3 py-2 text-center text-xs font-extrabold ${
                      feedback.ok
                        ? 'border-emerald-400/50 bg-emerald-950/65 text-emerald-200'
                        : 'border-rose-400/50 bg-rose-950/65 text-rose-200'
                    }`}
                  >
                    {feedback.msg}
                  </div>
                )}
              </div>
            ) : session.mode === 'type' && currentWord ? (
              <form
                onSubmit={handleSubmitType}
                className={isCompactKeyboard ? 'space-y-1.5' : 'space-y-3.5'}
              >
                <div
                  className={`rounded-xl border border-amber-300/25 bg-slate-950/55 text-center shadow-inner ${
                    isCompactKeyboard
                      ? 'flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 px-3 py-1.5 text-left'
                      : 'rounded-2xl p-4'
                  }`}
                >
                  <div className={isCompactKeyboard ? 'flex items-baseline gap-2' : ''}>
                    <span
                      className={`font-extrabold uppercase tracking-wider text-amber-300 ${
                        isCompactKeyboard ? 'text-[10px]' : 'block text-xs'
                      }`}
                    >
                      Eja (Inggris)
                    </span>
                    <div
                      className={`font-black text-white ${
                        isCompactKeyboard ? 'text-base leading-tight' : 'mt-1 text-2xl'
                      }`}
                    >
                      {currentWord.meaningId}
                    </div>
                  </div>
                  <div
                    className={`font-mono-nums font-bold tracking-widest text-amber-200 ${
                      isCompactKeyboard ? 'text-xs' : 'mt-2 text-sm'
                    }`}
                  >
                    {currentWord.word
                      .split('')
                      .map((ch, i) => (ch === ' ' ? '  ' : i < typeHints ? ch : '_'))
                      .join(' ')}
                  </div>
                </div>

                <div className="flex items-stretch gap-1.5 sm:gap-2">
                  <input
                    type="text"
                    autoFocus
                    enterKeyHint="done"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={typed}
                    onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                    onChange={(e) => setTyped(e.target.value)}
                    placeholder="Ketik kata Inggris..."
                    className={`min-w-0 flex-1 rounded-xl border-2 border-amber-300/40 bg-slate-950/75 text-sm font-bold text-white placeholder-slate-400 focus:border-amber-300 focus:outline-none ${
                      isCompactKeyboard ? 'px-3 py-1.5' : 'px-4 py-2.5'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setTypeHints((h) => Math.min(currentWord.word.length - 1, h + 1))}
                    className={`inline-flex shrink-0 items-center gap-1 rounded-xl border border-amber-300/40 bg-amber-500/20 font-extrabold text-amber-200 hover:bg-amber-500/35 ${
                      isCompactKeyboard ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2 text-xs'
                    }`}
                  >
                    <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Petunjuk</span>
                  </button>
                </div>

                <RpgPillButton
                  type="submit"
                  variant="green"
                  size={isCompactKeyboard ? 'sm' : 'md'}
                  className="w-full"
                >
                  <span>Periksa Ejaan (Sisa {2 - typeTries}x)</span>
                </RpgPillButton>

                {feedback && (
                  <div
                    className={`rounded-xl border px-3 text-center text-xs font-extrabold ${
                      isCompactKeyboard ? 'py-1' : 'py-2'
                    } ${
                      feedback.ok
                        ? 'border-emerald-400/50 bg-emerald-950/65 text-emerald-200'
                        : 'border-rose-400/50 bg-rose-950/65 text-rose-200'
                    }`}
                  >
                    {feedback.msg}
                  </div>
                )}
              </form>
            ) : session.mode === 'match' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  {matchLeft.map((item) => {
                    const done = matchedIds.includes(item.id);
                    const sel = selLeftId === item.id;
                    return (
                      <RpgChoiceCard
                        key={item.id}
                        tone={done ? 'correct' : sel ? 'selected' : 'default'}
                        disabled={done}
                        onClick={() => {
                          setSelLeftId(item.id);
                          soundEngine.speakEnglish(item.word);
                        }}
                        className="w-full px-2.5 py-2 text-xs font-extrabold"
                      >
                        {item.word}
                      </RpgChoiceCard>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  {matchRight.map((item) => {
                    const done = matchedIds.includes(item.id);
                    return (
                      <RpgChoiceCard
                        key={item.id}
                        tone={done ? 'correct' : !selLeftId ? 'muted' : 'default'}
                        disabled={done || !selLeftId}
                        onClick={() => handlePickRightMatch(item)}
                        className="w-full px-2.5 py-2 text-xs font-bold"
                      >
                        {item.meaningId}
                      </RpgChoiceCard>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </RpgBoardPanel>
      </div>
    </div>
  );
};
