import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Footprints,
  Heart,
  Lock,
  Shield,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import {
  BOSSES,
  DIFF_CONFIG,
  generateMiniIeltsQuestion,
  generateQuestionForZone,
  RELICS,
} from '../data/diglosaCatalog';
import {
  BattleContext,
  DifficultyMode,
  QuizQuestion,
  RelicId,
  WeaponId,
  WordProgress,
} from '../types/game';
import {
  RpgBoardPanel,
  RpgChoiceCard,
  RpgChoiceTone,
  RpgPillButton,
  RpgTimerBar,
} from './RpgUiKit';
import { BattleAnimEvent, BattleArenaCanvas } from './BattleArenaCanvas';

const WIN_CONFETTI_COLORS = [
  'bg-amber-300',
  'bg-emerald-400',
  'bg-sky-400',
  'bg-rose-400',
  'bg-yellow-200',
  'bg-orange-400',
];

const LOSS_CONFETTI_COLORS = [
  'bg-rose-500',
  'bg-purple-500',
  'bg-slate-400',
  'bg-amber-500/80',
];

const CONFETTI_PIECES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  leftPct: 6 + ((i * 4.7) % 88),
  delayMs: (i % 5) * 75,
  dxPx: ((i % 2 === 0 ? 1 : -1) * (10 + (i % 4) * 9)),
  rotDeg: (i % 2 === 0 ? 1 : -1) * (240 + (i % 5) * 65),
}));

interface BattleQuizModalProps {
  battle: BattleContext | null;
  playerHp: number;
  playerMaxHp: number;
  activeWeapon: WeaponId;
  hasWeapon: boolean;
  difficulty: DifficultyMode;
  ownedRelics: RelicId[];
  wordProgress: Record<string, WordProgress>;
  onUseHealHeart: () => void;
  onAnswerResult: (
    correct: boolean,
    vocabId: string,
    options?: {
      shieldBlocked?: boolean;
      duelHitStreak?: number;
      duelAmmoGained?: number;
      isAcademyMini?: boolean;
    },
  ) => { ammoAwarded: number } | undefined;
  onBattleEnd: (outcome: 'victory' | 'defeat' | 'fled', battle: BattleContext) => void;
}

export const BattleQuizModal: React.FC<BattleQuizModalProps> = ({
  battle,
  playerHp,
  playerMaxHp,
  activeWeapon,
  hasWeapon,
  difficulty,
  ownedRelics,
  wordProgress,
  onUseHealHeart,
  onAnswerResult,
  onBattleEnd,
}) => {
  const diffCfg = DIFF_CONFIG[difficulty];
  const hasPedang = ownedRelics.includes('pedang');
  const hasPerisai = ownedRelics.includes('perisai');
  const hasPeluit = ownedRelics.includes('peluit');
  const hasSepatu = ownedRelics.includes('sepatu');
  const hasJam = ownedRelics.includes('jam');
  const hasKompas = ownedRelics.includes('kompas');

  const [monsterHp, setMonsterHp] = useState(3);
  const [monsterMaxHp, setMonsterMaxHp] = useState(3);
  const [bossPhase, setBossPhase] = useState(1);
  const [turnPhase, setTurnPhase] = useState<'grab' | 'answer' | 'feedback'>('grab');
  const [grabTimer, setGrabTimer] = useState(diffCfg.grabSec);
  const [grabWindowMax, setGrabWindowMax] = useState(diffCfg.grabSec);
  const [answerTimer, setAnswerTimer] = useState(diffCfg.duelAnswerSec);

  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [prevQuestion, setPrevQuestion] = useState<QuizQuestion | null>(null);
  const [turnCount, setTurnCount] = useState(0);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [feedbackGood, setFeedbackGood] = useState(true);
  const [localPlayerHp, setLocalPlayerHp] = useState(playerHp);

  // Per-duel relic & mechanic states
  const [shieldUsed, setShieldUsed] = useState(false);
  const [peluitUsed, setPeluitUsed] = useState(false);
  const [jamUsed, setJamUsed] = useState(false);
  const [turnFrozen, setTurnFrozen] = useState(false);
  const [eliminatedChoices, setEliminatedChoices] = useState<number[]>([]);
  const [slimedChoiceIdx, setSlimedChoiceIdx] = useState<number | null>(null);
  const [lockedChoiceIdx, setLockedChoiceIdx] = useState<number | null>(null);
  const [growHealsInPhase, setGrowHealsInPhase] = useState(0);
  const [duelHitStreak, setDuelHitStreak] = useState(0);
  const [duelAmmoGained, setDuelAmmoGained] = useState(0);
  const [bossTaunt, setBossTaunt] = useState<string | null>(null);
  const [animEvent, setAnimEvent] = useState<BattleAnimEvent>('idle');
  const [animTick, setAnimTick] = useState(0);

  const timeoutRef = useRef<number | null>(null);
  const grabTimerRef = useRef(diffCfg.grabSec);
  const answerTimerRef = useRef(diffCfg.duelAnswerSec);

  const triggerAnim = useCallback((kind: BattleAnimEvent) => {
    setAnimEvent(kind);
    setAnimTick((t) => t + 1);
  }, []);

  const clearPendingTimeout = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const pickNextQuestion = useCallback(
    (
      b: BattleContext,
      nextPhase: number,
      nextTurnCount: number,
      lastQ: QuizQuestion | null,
      isFrozen: boolean,
    ): QuizQuestion => {
      const mechanic = b.isZoneBoss ? BOSSES[b.zoneId].mechanic : 'none';
      if (
        b.isZoneBoss &&
        mechanic === 'rewind' &&
        nextPhase >= 2 &&
        nextTurnCount > 0 &&
        nextTurnCount % 2 === 0 &&
        lastQ &&
        !isFrozen
      ) {
        return {
          ...lastQ,
          id: `${lastQ.id}_rewind_${nextTurnCount}`,
          category: `⏳ Rewind Bos! (${lastQ.category})`,
        };
      }
      if (b.isAcademyShadow) {
        return generateMiniIeltsQuestion(b.academySkill, wordProgress, hasKompas);
      }
      return generateQuestionForZone(
        b.zoneId,
        b.isIeltsBoss,
        b.isMixedChallenge,
        b.wordIds,
        wordProgress,
        hasKompas,
      );
    },
    [wordProgress, hasKompas],
  );

  const setupTurnModifiers = useCallback(
    (b: BattleContext, q: QuizQuestion, phaseNum: number, tCount: number) => {
      const mechanic = b.isZoneBoss ? BOSSES[b.zoneId].mechanic : 'none';

      // Base grab time + Sepatu Angin (+1s) - Close boss mechanic (-1s unless Sepatu counters)
      let gSec = diffCfg.grabSec + (hasSepatu ? 1 : 0);
      if (b.isZoneBoss && mechanic === 'close' && phaseNum >= 2 && !hasSepatu) {
        gSec = Math.max(1.8, gSec - 1);
      }
      grabTimerRef.current = gSec;
      answerTimerRef.current = diffCfg.duelAnswerSec;
      setGrabWindowMax(gSec);
      setGrabTimer(gSec);
      setAnswerTimer(diffCfg.duelAnswerSec);

      const wrongIndices = [0, 1, 2, 3].filter((i) => i !== q.correctIndex);

      // Slime mechanic: Phase 2-3 has 55% chance to obscure 1 wrong option
      if (b.isZoneBoss && mechanic === 'slime' && phaseNum >= 2 && Math.random() < 0.55) {
        setSlimedChoiceIdx(wrongIndices[Math.floor(Math.random() * wrongIndices.length)]);
      } else {
        setSlimedChoiceIdx(null);
      }

      // Close mechanic: Phase 2-3 locks 1 wrong option every 2nd turn
      if (b.isZoneBoss && mechanic === 'close' && phaseNum >= 2 && tCount % 2 === 1) {
        setLockedChoiceIdx(wrongIndices[Math.floor(Math.random() * wrongIndices.length)]);
      } else {
        setLockedChoiceIdx(null);
      }

      setEliminatedChoices([]);
      setSelectedIdx(null);
      setFeedbackMsg(null);
      setTurnFrozen(false);
    },
    [diffCfg.grabSec, diffCfg.duelAnswerSec, hasSepatu],
  );

  // Initialize battle when battle changes
  useEffect(() => {
    clearPendingTimeout();
    if (!battle) return;

    const bossDef = battle.isZoneBoss ? BOSSES[battle.zoneId] : null;
    const startMaxHp = bossDef ? bossDef.hpPerPhase : battle.monsterMaxHp;
    const startHp = bossDef ? bossDef.hpPerPhase : battle.monsterHp;

    setMonsterHp(startHp);
    setMonsterMaxHp(startMaxHp);
    setBossPhase(battle.bossPhase || 1);
    setLocalPlayerHp(playerHp);
    setTurnPhase('grab');
    setTurnCount(0);
    setShieldUsed(false);
    setPeluitUsed(false);
    setJamUsed(false);
    setGrowHealsInPhase(0);
    setDuelHitStreak(0);
    setDuelAmmoGained(0);
    setBossTaunt(bossDef ? bossDef.taunts[0] : null);
    setAnimEvent('idle');
    setAnimTick(0);

    const firstQ = pickNextQuestion(battle, 1, 0, null, false);
    setQuestion(firstQ);
    setPrevQuestion(null);
    setupTurnModifiers(battle, firstQ, 1, 0);

    return () => clearPendingTimeout();
  }, [battle]);

  const scheduleNextTurn = useCallback(
    (
      b: BattleContext,
      nextPhase: number,
      nextTurnCount: number,
      currentQ: QuizQuestion | null,
      delayMs: number,
    ) => {
      clearPendingTimeout();
      timeoutRef.current = window.setTimeout(() => {
        const nextQ = pickNextQuestion(b, nextPhase, nextTurnCount, currentQ, false);
        setPrevQuestion(currentQ);
        setQuestion(nextQ);
        setTurnCount(nextTurnCount);
        setTurnPhase('grab');
        setAnimEvent('idle');
        setupTurnModifiers(b, nextQ, nextPhase, nextTurnCount);
      }, delayMs);
    },
    [pickNextQuestion, setupTurnModifiers],
  );

  const handleMonsterAttack = useCallback(
    (b: BattleContext, q: QuizQuestion | null, reasonMsg: string) => {
      if (hasPerisai && !shieldUsed) {
        setShieldUsed(true);
        if (q) {
          onAnswerResult(false, q.vocabId, {
            shieldBlocked: true,
            isAcademyMini: b.isAcademyShadow,
          });
        }
        setTurnPhase('feedback');
        setFeedbackGood(true);
        setFeedbackMsg(`🛡️ Perisai Panci menangkis serangan! (${reasonMsg}) Nyawamu aman!`);
        soundEngine.playPick();
        triggerAnim('monster_attack');
        scheduleNextTurn(b, bossPhase, turnCount + 1, q, 1300);
        return;
      }

      if (q) {
        onAnswerResult(false, q.vocabId, {
          shieldBlocked: false,
          isAcademyMini: b.isAcademyShadow,
        });
      }
      setDuelHitStreak(0);
      const nextHp = Math.max(0, localPlayerHp - 1);
      setLocalPlayerHp(nextHp);
      setTurnPhase('feedback');
      setFeedbackGood(false);
      setFeedbackMsg(`${reasonMsg} (-1 ❤️)`);

      const isDefeatKo = nextHp <= 0;
      triggerAnim(isDefeatKo ? 'hero_ko' : 'monster_attack');

      clearPendingTimeout();
      timeoutRef.current = window.setTimeout(() => {
        if (isDefeatKo) {
          onBattleEnd('defeat', b);
        } else {
          const nextQ = pickNextQuestion(b, bossPhase, turnCount + 1, q, false);
          setPrevQuestion(q);
          setQuestion(nextQ);
          setTurnCount(turnCount + 1);
          setTurnPhase('grab');
          setAnimEvent('idle');
          setupTurnModifiers(b, nextQ, bossPhase, turnCount + 1);
        }
      }, isDefeatKo ? 1850 : 1350);
    },
    [
      hasPerisai,
      shieldUsed,
      onAnswerResult,
      localPlayerHp,
      onBattleEnd,
      bossPhase,
      turnCount,
      pickNextQuestion,
      setupTurnModifiers,
      scheduleNextTurn,
      triggerAnim,
    ],
  );

  // Reflex AMBIL! timer during grab phase
  useEffect(() => {
    if (!battle || turnPhase !== 'grab' || turnFrozen) return;
    let lastMs = performance.now();
    const interval = window.setInterval(() => {
      const now = performance.now();
      const dt = (now - lastMs) / 1000;
      lastMs = now;
      const next = Math.max(0, grabTimerRef.current - dt);
      grabTimerRef.current = next;
      setGrabTimer(next);
      if (next <= 0) {
        window.clearInterval(interval);
        // Monster steals turn! Uses monsterGuessAcc from difficulty
        const monsterHits = Math.random() < diffCfg.monsterGuessAcc;
        if (monsterHits) {
          handleMonsterAttack(
            battle,
            question,
            `Terlambat! ${battle.monsterName} merebut giliran & tepat menyerangmu!`,
          );
        } else {
          setTurnPhase('feedback');
          setFeedbackGood(true);
          setFeedbackMsg(
            `${battle.monsterName} merebut giliran, tapi tebakannya meleset! Giliran baru siap!`,
          );
          soundEngine.playFlip();
          scheduleNextTurn(battle, bossPhase, turnCount + 1, question, 1150);
        }
      }
    }, 50);
    return () => window.clearInterval(interval);
  }, [
    battle,
    turnPhase,
    turnFrozen,
    diffCfg.monsterGuessAcc,
    handleMonsterAttack,
    question,
    scheduleNextTurn,
    bossPhase,
    turnCount,
  ]);

  // Pendekar mode 12s duel answer timer
  useEffect(() => {
    if (!battle || turnPhase !== 'answer' || diffCfg.duelAnswerSec <= 0 || turnFrozen) return;
    let lastMs = performance.now();
    const interval = window.setInterval(() => {
      const now = performance.now();
      const dt = (now - lastMs) / 1000;
      lastMs = now;
      const next = Math.max(0, answerTimerRef.current - dt);
      answerTimerRef.current = next;
      setAnswerTimer(next);
      if (next <= 0) {
        window.clearInterval(interval);
        handleMonsterAttack(
          battle,
          question,
          'Waktu jawab mode Pendekar (12 dtk) habis!',
        );
      }
    }, 100);
    return () => window.clearInterval(interval);
  }, [battle, turnPhase, diffCfg.duelAnswerSec, turnFrozen, handleMonsterAttack, question]);

  const handleGrab = useCallback(() => {
    if (!battle || turnPhase !== 'grab') return;
    setTurnPhase('answer');
    triggerAnim('grab_ready');
    soundEngine.playDash();
    if (question) {
      soundEngine.speakEnglish(question.audioWord);
    }
  }, [battle, turnPhase, question, triggerAnim]);

  const handleUsePeluit = () => {
    if (!question || peluitUsed || turnPhase !== 'answer') return;
    const candidates = [0, 1, 2, 3].filter(
      (i) => i !== question.correctIndex && !eliminatedChoices.includes(i) && i !== lockedChoiceIdx,
    );
    if (candidates.length === 0) return;
    const victim = candidates[Math.floor(Math.random() * candidates.length)];
    setEliminatedChoices((prev) => [...prev, victim]);
    setPeluitUsed(true);
    soundEngine.playPick();
  };

  const handleUseJam = () => {
    if (jamUsed || turnPhase === 'feedback') return;
    setJamUsed(true);
    setTurnFrozen(true);
    soundEngine.playPick();
  };

  const handlePickChoice = useCallback(
    (idx: number) => {
      if (!battle || !question || turnPhase !== 'answer') return;
      if (eliminatedChoices.includes(idx) || lockedChoiceIdx === idx) return;

      setSelectedIdx(idx);
      const isCorrect = idx === question.correctIndex;
      setTurnPhase('feedback');

      if (isCorrect) {
        const nextStreak = duelHitStreak + 1;
        setDuelHitStreak(nextStreak);

        const res = onAnswerResult(true, question.vocabId, {
          duelHitStreak: nextStreak,
          duelAmmoGained,
          isAcademyMini: battle.isAcademyShadow,
        });
        if (res && res.ammoAwarded > 0) {
          setDuelAmmoGained((g) => g + res.ammoAwarded);
        }

        // Pedang Kata: +1 dmg (2 dmg) in normal duel; in Boss fight every 4 hit streak heals +1 ❤️
        const dmg = !battle.isZoneBoss && hasPedang ? 2 : 1;
        let healNote = '';
        if (battle.isZoneBoss && hasPedang && nextStreak % 4 === 0 && localPlayerHp < playerMaxHp) {
          setLocalPlayerHp((hp) => Math.min(playerMaxHp, hp + 1));
          onUseHealHeart();
          healNote = ' · 🗡️ Pedang Kata pulihkan +1 ❤️!';
        }

        const nextMonsterHp = Math.max(0, monsterHp - dmg);
        setMonsterHp(nextMonsterHp);
        setFeedbackGood(true);
        const ammoNote = res && res.ammoAwarded > 0 ? ` · +${res.ammoAwarded} Peluru` : '';
        setFeedbackMsg(
          `Tepat! "${question.choices[question.correctIndex]}" → ${dmg} Damage!${ammoNote}${healNote}`,
        );

        const bossDef = battle.isZoneBoss ? BOSSES[battle.zoneId] : null;
        const isTerminalVictory =
          nextMonsterHp <= 0 && (!bossDef || bossPhase >= bossDef.phases);
        triggerAnim(isTerminalVictory ? 'monster_ko' : 'hero_attack');

        clearPendingTimeout();
        timeoutRef.current = window.setTimeout(() => {
          if (nextMonsterHp <= 0) {
            // Check 3-Phase Zone Boss transition
            if (bossDef && bossPhase < bossDef.phases) {
              const nextPhase = bossPhase + 1;
              setBossPhase(nextPhase);
              setMonsterHp(bossDef.hpPerPhase);
              setMonsterMaxHp(bossDef.hpPerPhase);
              setGrowHealsInPhase(0);
              setBossTaunt(bossDef.taunts[nextPhase - 1] || null);
              soundEngine.playBoss();
              const nextQ = pickNextQuestion(battle, nextPhase, turnCount + 1, question, turnFrozen);
              setPrevQuestion(question);
              setQuestion(nextQ);
              setTurnCount(turnCount + 1);
              setTurnPhase('grab');
              setAnimEvent('idle');
              setupTurnModifiers(battle, nextQ, nextPhase, turnCount + 1);
            } else {
              onBattleEnd('victory', { ...battle, monsterHp: 0 });
            }
          } else {
            const nextQ = pickNextQuestion(battle, bossPhase, turnCount + 1, question, turnFrozen);
            setPrevQuestion(question);
            setQuestion(nextQ);
            setTurnCount(turnCount + 1);
            setTurnPhase('grab');
            setAnimEvent('idle');
            setupTurnModifiers(battle, nextQ, bossPhase, turnCount + 1);
          }
        }, isTerminalVictory ? 1850 : 1050);
      } else {
        // Boss Grow mechanic: Phase 2-3 heals boss +1 HP up to 2x per phase
        const bossDef = battle.isZoneBoss ? BOSSES[battle.zoneId] : null;
        let growNote = '';
        if (bossDef && bossDef.mechanic === 'grow' && bossPhase >= 2 && growHealsInPhase < 2) {
          setMonsterHp((hp) => Math.min(monsterMaxHp, hp + 1));
          setGrowHealsInPhase((c) => c + 1);
          growNote = ' (🌿 Akar Bos tumbuh +1 HP!)';
        }
        handleMonsterAttack(
          battle,
          question,
          `Salah! Jawaban benar: "${question.choices[question.correctIndex]}".${growNote}`,
        );
      }
    },
    [
      battle,
      question,
      turnPhase,
      eliminatedChoices,
      lockedChoiceIdx,
      duelHitStreak,
      onAnswerResult,
      duelAmmoGained,
      hasPedang,
      localPlayerHp,
      playerMaxHp,
      onUseHealHeart,
      monsterHp,
      bossPhase,
      turnCount,
      turnFrozen,
      pickNextQuestion,
      setupTurnModifiers,
      onBattleEnd,
      growHealsInPhase,
      monsterMaxHp,
      handleMonsterAttack,
      triggerAnim,
    ],
  );

  // Keyboard shortcuts: Space to AMBIL, 1-4 to pick choice
  useEffect(() => {
    if (!battle) return;
    const onKey = (e: KeyboardEvent) => {
      if (turnPhase === 'grab' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        handleGrab();
      } else if (turnPhase === 'answer') {
        if (e.key === '1') handlePickChoice(0);
        else if (e.key === '2') handlePickChoice(1);
        else if (e.key === '3') handlePickChoice(2);
        else if (e.key === '4') handlePickChoice(3);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [battle, turnPhase, handleGrab, handlePickChoice]);

  if (!battle || !question) return null;

  const grabPct = Math.max(0, Math.min(100, (grabTimer / Math.max(0.5, grabWindowMax)) * 100));
  const timerPct =
    turnPhase === 'grab'
      ? grabPct
      : turnPhase === 'answer' && diffCfg.duelAnswerSec > 0
      ? Math.max(0, (answerTimer / diffCfg.duelAnswerSec) * 100)
      : 100;
  const bossDef = battle.isZoneBoss ? BOSSES[battle.zoneId] : null;

  const isKoWin = animEvent === 'monster_ko';
  const isKoLoss = animEvent === 'hero_ko';
  const showKoOverlay = isKoWin || isKoLoss;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto overscroll-contain touch-pan-y bg-[#060b16]/78 p-2 sm:p-4">
      <div className="my-auto max-h-[95dvh] w-full max-w-2xl overflow-y-auto overscroll-contain touch-pan-y">
        <RpgBoardPanel>
          {/* Inside-Panel Top Clash VS Header */}
          <div className="mb-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
            {/* Hero Side HUD Box */}
            <div className="min-w-0 rounded-xl border border-emerald-400/35 bg-slate-950/60 px-2.5 py-1.5 shadow-inner">
              <div className="truncate text-xs font-black text-amber-100 drop-shadow sm:text-sm">
                Hoot (Pengelana)
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-0.5 sm:gap-1">
                {Array.from({ length: playerMaxHp }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                      i < localPlayerHp
                        ? 'fill-rose-500 text-rose-300 drop-shadow-[0_0_4px_rgba(244,63,94,0.7)]'
                        : 'fill-slate-800 text-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Center VS Winged Emblem */}
            <div className="flex flex-col items-center justify-center px-1">
              <img
                src="./assets/ui/ui_vs_badge.png"
                alt="VS"
                className="h-11 w-auto select-none object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)] sm:h-14"
                draggable={false}
              />
              {bossDef && (
                <div className="-mt-1 rounded-full border border-purple-400/50 bg-purple-950/90 px-2 py-0.5 font-mono-nums text-[9px] font-black tracking-wider text-amber-200 shadow sm:text-[10px]">
                  FASE {bossPhase}/{bossDef.phases}
                </div>
              )}
            </div>

            {/* Monster Side HUD Box */}
            <div className="min-w-0 rounded-xl border border-purple-400/35 bg-slate-950/60 px-2.5 py-1.5 text-right shadow-inner">
              <div className="truncate text-xs font-black text-amber-100 drop-shadow sm:text-sm">
                {battle.monsterName}
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-end gap-0.5">
                {Array.from({ length: monsterMaxHp }).map((_, i) => (
                  <Shield
                    key={i}
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                      i < monsterHp
                        ? 'fill-purple-500 text-purple-200 drop-shadow-[0_0_4px_rgba(168,85,247,0.65)]'
                        : 'fill-slate-800 text-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Boss Mechanic & Taunt Banner */}
          {bossDef && (
            <div className="mb-2 rounded-xl border border-purple-400/40 bg-purple-950/70 px-3 py-1 text-center text-[10px] font-bold text-amber-200 sm:text-[11px]">
              {bossTaunt || bossDef.mechanicDesc}
            </div>
          )}

          {/* Live 3D Character & Monster Battle Arena Stage */}
          <div className="relative h-28 overflow-hidden rounded-xl shadow-[0_6px_18px_rgba(0,0,0,0.55)] sm:h-36">
            <img
              src="./assets/ui/ui_battle_arena.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
              draggable={false}
            />

            {/* Real-Time Three.js Animated 3D Hero & Monster Fighters */}
            <BattleArenaCanvas
              monsterType={battle.monsterType}
              isBoss={Boolean(battle.isZoneBoss || battle.isIeltsBoss)}
              activeWeapon={activeWeapon}
              hasWeapon={hasWeapon}
              eventKind={animEvent}
              eventTick={animTick}
            />

            {/* Active Relic Badges Centered at Top */}
            <div className="pointer-events-none absolute inset-x-2 top-2 z-10 flex flex-wrap items-center justify-center gap-1.5">
              {hasPerisai && (
                <span
                  title={RELICS.perisai.desc}
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-black shadow ${
                    shieldUsed
                      ? 'border-slate-500/50 bg-slate-900/85 text-slate-400 line-through'
                      : 'border-sky-400/60 bg-sky-950/90 text-sky-200'
                  }`}
                >
                  🛡️ {shieldUsed ? 'Terpakai' : 'Perisai Siap'}
                </span>
              )}
              {hasPeluit && turnPhase === 'answer' && !peluitUsed && (
                <button
                  type="button"
                  onClick={handleUsePeluit}
                  className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-600/95 px-2.5 py-0.5 text-[10px] font-black text-white shadow hover:bg-emerald-500 sm:text-[11px]"
                >
                  <span>🎵 Peluit (-1 Opsi)</span>
                </button>
              )}
              {hasJam && turnPhase !== 'feedback' && !jamUsed && (
                <button
                  type="button"
                  onClick={handleUseJam}
                  className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-500/95 px-2.5 py-0.5 text-[10px] font-black text-slate-950 shadow hover:bg-amber-400 sm:text-[11px]"
                >
                  <span>⏳ Bekukan Giliran</span>
                </button>
              )}
              {turnFrozen && (
                <span className="rounded-full border border-cyan-300/60 bg-cyan-700/95 px-2.5 py-0.5 text-[10px] font-black text-white shadow">
                  ❄️ Waktu Dibekukan!
                </span>
              )}
            </div>

            {/* Bottom Corner Category & Monster HP Pills */}
            <div className="pointer-events-none absolute bottom-2 left-2.5 z-10 rounded-md border border-emerald-400/45 bg-slate-950/85 px-2 py-0.5 text-[9px] font-extrabold text-emerald-200 shadow sm:text-[10px]">
              {question.category}
            </div>
            <div className="pointer-events-none absolute bottom-2 right-2.5 z-10 rounded-md border border-amber-400/45 bg-slate-950/85 px-2 py-0.5 font-mono-nums text-[9px] font-extrabold text-amber-300 shadow sm:text-[10px]">
              HP {monsterHp}/{monsterMaxHp}
            </div>

            {/* Victory / Defeat Confetti & K.O.! Impact Stamp */}
            {showKoOverlay && (
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden">
                {CONFETTI_PIECES.map((c) => {
                  const palette = isKoWin ? WIN_CONFETTI_COLORS : LOSS_CONFETTI_COLORS;
                  const colorClass = palette[c.id % palette.length];
                  return (
                    <span
                      key={c.id}
                      style={
                        {
                          left: `${c.leftPct}%`,
                          top: '-10px',
                          animationDelay: `${c.delayMs}ms`,
                          '--confetti-dx': `${c.dxPx}px`,
                          '--confetti-rot': `${c.rotDeg}deg`,
                        } as React.CSSProperties
                      }
                      className={`animate-confetti-fall absolute h-2.5 w-1.5 rounded-sm shadow ${colorClass}`}
                    />
                  );
                })}
                <div
                  className={`animate-ko-pop rounded-2xl border-2 px-4 py-1.5 text-center shadow-[0_10px_28px_rgba(0,0,0,0.85)] ${
                    isKoWin
                      ? 'border-amber-200 bg-gradient-to-br from-amber-400 via-orange-500 to-emerald-600 text-white'
                      : 'border-rose-300 bg-gradient-to-br from-rose-600 via-red-700 to-purple-900 text-white'
                  }`}
                >
                  <div className="text-xl font-black tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-2xl">
                    K.O.! {isKoWin ? 'MENANG!' : 'KALAH!'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Question Box + Audio + Timer Gauge */}
          <div className="mt-2.5 space-y-2 sm:mt-3 sm:space-y-2.5">
            <div className="flex items-start justify-between gap-2.5 rounded-2xl border border-amber-300/20 bg-slate-950/45 px-3.5 py-2.5">
              <div className="min-w-0">
                {question.isDifficultyFlagged && (
                  <div className="mb-1 inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-200">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    <span>🧭 Kompas Tanya: Kata Sulit</span>
                  </div>
                )}
                <h3 className="text-base font-extrabold leading-snug text-white sm:text-lg">
                  {question.prompt}
                </h3>
                {question.hintWord && turnPhase !== 'grab' && (
                  <div className="mt-0.5 font-mono-nums text-xs font-semibold text-amber-300">
                    Petunjuk: {question.hintWord}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => soundEngine.speakEnglish(question.audioWord)}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-amber-300/40 bg-amber-400/20 px-2.5 py-1.5 text-xs font-extrabold text-amber-200 transition hover:bg-amber-400/35"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>Dengar</span>
              </button>
            </div>

            {/* Ornate Carved RPG Timer Bar */}
            <RpgTimerBar
              pct={timerPct}
              barClassName={
                turnFrozen
                  ? 'bg-gradient-to-r from-cyan-400 to-sky-400'
                  : grabPct > 45
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                  : 'bg-gradient-to-r from-rose-500 to-red-600'
              }
            />

            {/* Big Blazing Orange AMBIL! Reflex CTA or Feedback */}
            {turnPhase === 'grab' ? (
              <div>
                <RpgPillButton variant="orange" onClick={handleGrab} className="w-full text-sm sm:text-base">
                  <span>✋ AMBIL GILIRAN! (Spasi · {grabTimer.toFixed(1)}d)</span>
                </RpgPillButton>
                <p className="mt-1 text-center text-[10px] font-bold text-amber-200/85 sm:text-[11px]">
                  Tekan cepat sebelum monster merebut giliran!
                  {hasSepatu && ' (👟 Sepatu Angin aktif +1 dtk)'}
                </p>
              </div>
            ) : (
              <div
                className={`rounded-xl border px-3 py-1.5 text-center text-[11px] font-extrabold sm:py-2 sm:text-xs ${
                  turnPhase === 'feedback'
                    ? feedbackGood
                      ? 'border-emerald-400/50 bg-emerald-950/65 text-emerald-200'
                      : 'border-rose-400/50 bg-rose-950/65 text-rose-200'
                    : 'border-amber-300/30 bg-slate-950/55 text-amber-200'
                }`}
              >
                {feedbackMsg ??
                  `Pilih jawaban tepat (1–4)${
                    diffCfg.duelAnswerSec > 0 ? ` · Sisa ${answerTimer.toFixed(0)} dtk` : ''
                  }`}
              </div>
            )}

            {/* 4 Stone-Gold Answer Option Tablets */}
            <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
              {question.choices.map((choice, idx) => {
                const isPicked = selectedIdx === idx;
                const isCorrectChoice = idx === question.correctIndex;
                const isEliminated = eliminatedChoices.includes(idx);
                const isLocked = lockedChoiceIdx === idx;
                const isSlimed = slimedChoiceIdx === idx && turnPhase !== 'feedback';

                let tone: RpgChoiceTone = 'default';
                if (isEliminated || isLocked) {
                  tone = 'locked';
                } else if (turnPhase === 'grab') {
                  tone = 'muted';
                } else if (turnPhase === 'feedback') {
                  if (isCorrectChoice) tone = 'correct';
                  else if (isPicked && !feedbackGood) tone = 'wrong';
                }

                return (
                  <RpgChoiceCard
                    key={idx}
                    tone={tone}
                    disabled={turnPhase !== 'answer' || isEliminated || isLocked}
                    onClick={() => handlePickChoice(idx)}
                    className="flex items-center gap-2.5 px-2 py-1.5 text-xs sm:text-sm"
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono-nums text-xs font-black ${
                        tone === 'correct'
                          ? 'border-emerald-300 bg-emerald-600 text-white'
                          : tone === 'wrong'
                          ? 'border-rose-300 bg-rose-600 text-white'
                          : 'border-amber-300/50 bg-amber-500/20 text-amber-200'
                      }`}
                    >
                      {isLocked ? <Lock className="h-3.5 w-3.5" /> : idx + 1}
                    </span>
                    <span className="truncate font-extrabold">
                      {isSlimed ? '🟢 ??? (Tertutup Lendir)' : choice}
                    </span>
                  </RpgChoiceCard>
                );
              })}
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-2 text-[11px] font-extrabold text-amber-200">
                {hasPedang && (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300/35 bg-amber-500/20 px-2 py-0.5 text-amber-200">
                    <Sparkles className="h-3 w-3" />
                    <span>{battle.isZoneBoss ? 'Pedang: 4 hit=+1 ❤️' : 'Pedang: 2 Dmg'}</span>
                  </span>
                )}
                <span>Streak Duel: x{duelHitStreak}</span>
              </div>

              <RpgPillButton
                variant="red"
                size="sm"
                onClick={() => onBattleEnd('fled', battle)}
              >
                <Footprints className="h-3.5 w-3.5 shrink-0" />
                <span>Kabur (-1 ❤️)</span>
              </RpgPillButton>
            </div>
          </div>
        </RpgBoardPanel>
      </div>
    </div>
  );
};
