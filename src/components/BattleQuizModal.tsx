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
import { getCharacterPreset } from '../data/characterPresets';
import {
  BattleContext,
  CharacterPresetId,
  DifficultyMode,
  QuizQuestion,
  RelicId,
  WeaponId,
  WordProgress,
} from '../types/game';
import {
  disableSpeakingTemporarily,
  DuolingoChallenge,
  isSpeakingTemporarilyDisabled,
  pickRandomPeopleChallenge,
} from '../data/duolingoChallenges';
import { DuolingoChallengeOutcome, DuolingoChallengeView } from './DuolingoChallengeView';
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
  characterId?: CharacterPresetId;
  playerName?: string;
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
  characterId = 'hoot_emerald',
  playerName,
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
  const heroPreset = getCharacterPreset(characterId);
  const diffCfg = DIFF_CONFIG[difficulty];
  const hasPedang = ownedRelics.includes('pedang');
  const hasPerisai = ownedRelics.includes('perisai');
  const hasPeluit = ownedRelics.includes('peluit');
  const hasSepatu = ownedRelics.includes('sepatu');
  const hasJam = ownedRelics.includes('jam');
  const hasKompas = ownedRelics.includes('kompas');

  const isDesaDuolingo = Boolean(
    battle &&
      battle.zoneId === 'desa_sapaan' &&
      !battle.isAcademyShadow &&
      !battle.isMixedChallenge,
  );

  const [monsterHp, setMonsterHp] = useState(3);
  const [monsterMaxHp, setMonsterMaxHp] = useState(3);
  const [bossPhase, setBossPhase] = useState(1);
  const [turnPhase, setTurnPhase] = useState<'grab' | 'answer' | 'feedback'>('grab');
  const [grabTimer, setGrabTimer] = useState(diffCfg.grabSec);
  const [grabWindowMax, setGrabWindowMax] = useState(diffCfg.grabSec);
  const [answerTimer, setAnswerTimer] = useState(diffCfg.duelAnswerSec);

  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [prevQuestion, setPrevQuestion] = useState<QuizQuestion | null>(null);
  const [duoChallenge, setDuoChallenge] = useState<DuolingoChallenge | null>(null);
  const [peluitEliminateTick, setPeluitEliminateTick] = useState(0);
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
  const turnPhaseRef = useRef<'grab' | 'answer' | 'feedback'>('grab');
  const isTerminalRef = useRef(false);
  const outerScrollRef = useRef<HTMLDivElement | null>(null);
  const innerScrollRef = useRef<HTMLDivElement | null>(null);

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
      nextBossHp: number,
      nextTurnCount: number,
      lastQ: QuizQuestion | null,
      isFrozen: boolean,
    ): QuizQuestion => {
      const mechanic = b.isZoneBoss ? BOSSES[b.zoneId].mechanic : 'none';
      if (
        b.isZoneBoss &&
        mechanic === 'rewind' &&
        nextBossHp <= 10 &&
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

  const pickNextDuoChallenge = useCallback(
    (
      lastDuo: DuolingoChallenge | null,
      preferredVocabIds?: readonly string[],
    ): DuolingoChallenge =>
      pickRandomPeopleChallenge({
        wordProgress,
        preferredVocabIds,
        excludeType: lastDuo?.type ?? null,
        excludeVocabId: lastDuo?.vocabId ?? null,
        allowSpeak: !isSpeakingTemporarilyDisabled(),
        allowMatch: true,
      }),
    [wordProgress],
  );

  const getActiveDuelAnswerSec = useCallback(
    (b: BattleContext) => {
      if (diffCfg.duelAnswerSec <= 0) return 0;
      const useDesa =
        b.zoneId === 'desa_sapaan' && !b.isAcademyShadow && !b.isMixedChallenge;
      return useDesa ? Math.max(24, diffCfg.duelAnswerSec * 2) : diffCfg.duelAnswerSec;
    },
    [diffCfg.duelAnswerSec],
  );

  const setupTurnModifiers = useCallback(
    (b: BattleContext, q: QuizQuestion, curMonsterHp: number, tCount: number) => {
      const mechanic = b.isZoneBoss ? BOSSES[b.zoneId].mechanic : 'none';
      const enraged = Boolean(b.isZoneBoss && curMonsterHp <= 10);

      // Base grab time + Sepatu Angin (+1s) - Close boss mechanic (-1s unless Sepatu counters)
      let gSec = diffCfg.grabSec + (hasSepatu ? 1 : 0);
      if (enraged && mechanic === 'close' && !hasSepatu) {
        gSec = Math.max(1.8, gSec - 1);
      }
      const ansSec = getActiveDuelAnswerSec(b);
      grabTimerRef.current = gSec;
      answerTimerRef.current = ansSec;
      setGrabWindowMax(gSec);
      setGrabTimer(gSec);
      setAnswerTimer(ansSec);

      const wrongIndices = [0, 1, 2, 3].filter((i) => i !== q.correctIndex);

      // Slime mechanic: Boss HP <= 10 has 55% chance to obscure 1 wrong option
      if (enraged && mechanic === 'slime' && Math.random() < 0.55) {
        setSlimedChoiceIdx(wrongIndices[Math.floor(Math.random() * wrongIndices.length)]);
      } else {
        setSlimedChoiceIdx(null);
      }

      // Close mechanic: Boss HP <= 10 locks 1 wrong option every 2nd turn
      if (enraged && mechanic === 'close' && tCount % 2 === 1) {
        setLockedChoiceIdx(wrongIndices[Math.floor(Math.random() * wrongIndices.length)]);
      } else {
        setLockedChoiceIdx(null);
      }

      setEliminatedChoices([]);
      setSelectedIdx(null);
      setFeedbackMsg(null);
      setTurnFrozen(false);
    },
    [diffCfg.grabSec, getActiveDuelAnswerSec, hasSepatu],
  );

  // Initialize battle when battle changes
  useEffect(() => {
    clearPendingTimeout();
    soundEngine.stopSpeech();
    isTerminalRef.current = false;
    turnPhaseRef.current = 'grab';
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

    const firstQ = pickNextQuestion(battle, startHp, 0, null, false);
    setQuestion(firstQ);
    setPrevQuestion(null);
    if (battle.zoneId === 'desa_sapaan' && !battle.isAcademyShadow && !battle.isMixedChallenge) {
      setDuoChallenge(pickNextDuoChallenge(null, battle.wordIds));
    } else {
      setDuoChallenge(null);
    }
    setPeluitEliminateTick(0);
    setupTurnModifiers(battle, firstQ, startHp, 0);

    return () => {
      clearPendingTimeout();
      soundEngine.stopSpeech();
    };
  }, [battle]); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleNextTurn = useCallback(
    (
      b: BattleContext,
      curMonsterHp: number,
      nextTurnCount: number,
      currentQ: QuizQuestion | null,
      delayMs: number,
      currentDuo: DuolingoChallenge | null = null,
    ) => {
      clearPendingTimeout();
      timeoutRef.current = window.setTimeout(() => {
        if (isTerminalRef.current) return;
        const nextQ = pickNextQuestion(b, curMonsterHp, nextTurnCount, currentQ, false);
        setPrevQuestion(currentQ);
        setQuestion(nextQ);
        if (b.zoneId === 'desa_sapaan' && !b.isAcademyShadow && !b.isMixedChallenge) {
          setDuoChallenge(pickNextDuoChallenge(currentDuo, b.wordIds));
        }
        turnPhaseRef.current = 'grab';
        setTurnCount(nextTurnCount);
        setTurnPhase('grab');
        setAnimEvent('idle');
        setupTurnModifiers(b, nextQ, curMonsterHp, nextTurnCount);
      }, delayMs);
    },
    [pickNextQuestion, pickNextDuoChallenge, setupTurnModifiers],
  );

  const handleMonsterAttack = useCallback(
    (
      b: BattleContext,
      q: QuizQuestion | null,
      reasonMsg: string,
      nextMonsterHpOverride?: number,
    ) => {
      if (turnPhaseRef.current === 'feedback' || isTerminalRef.current) return;
      turnPhaseRef.current = 'feedback';
      soundEngine.stopSpeech();

      const effectiveMonsterHp = nextMonsterHpOverride ?? monsterHp;

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
        scheduleNextTurn(b, effectiveMonsterHp, turnCount + 1, q, 1300, duoChallenge);
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
      if (isDefeatKo) {
        isTerminalRef.current = true;
      }
      triggerAnim(isDefeatKo ? 'hero_ko' : 'monster_attack');

      clearPendingTimeout();
      timeoutRef.current = window.setTimeout(() => {
        if (isDefeatKo) {
          onBattleEnd('defeat', b);
        } else {
          const nextQ = pickNextQuestion(b, effectiveMonsterHp, turnCount + 1, q, false);
          setPrevQuestion(q);
          setQuestion(nextQ);
          if (b.zoneId === 'desa_sapaan' && !b.isAcademyShadow && !b.isMixedChallenge) {
            setDuoChallenge(pickNextDuoChallenge(duoChallenge, b.wordIds));
          }
          turnPhaseRef.current = 'grab';
          setTurnCount(turnCount + 1);
          setTurnPhase('grab');
          setAnimEvent('idle');
          setupTurnModifiers(b, nextQ, effectiveMonsterHp, turnCount + 1);
        }
      }, isDefeatKo ? 1850 : 1350);
    },
    [
      hasPerisai,
      shieldUsed,
      onAnswerResult,
      localPlayerHp,
      onBattleEnd,
      monsterHp,
      turnCount,
      pickNextQuestion,
      pickNextDuoChallenge,
      duoChallenge,
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
      if (turnPhaseRef.current !== 'grab' || isTerminalRef.current) return;
      const now = performance.now();
      const dt = (now - lastMs) / 1000;
      lastMs = now;
      const next = Math.max(0, grabTimerRef.current - dt);
      grabTimerRef.current = next;
      setGrabTimer(next);
      if (next <= 0) {
        window.clearInterval(interval);
        if (turnPhaseRef.current !== 'grab' || isTerminalRef.current) return;
        // Monster steals turn! Uses monsterGuessAcc from difficulty
        const monsterHits = Math.random() < diffCfg.monsterGuessAcc;
        if (monsterHits) {
          handleMonsterAttack(
            battle,
            question,
            `Terlambat! ${battle.monsterName} merebut giliran & tepat menyerangmu!`,
          );
        } else {
          turnPhaseRef.current = 'feedback';
          setTurnPhase('feedback');
          setFeedbackGood(true);
          setFeedbackMsg(
            `${battle.monsterName} merebut giliran, tapi tebakannya meleset! Giliran baru siap!`,
          );
          soundEngine.playFlip();
          scheduleNextTurn(battle, monsterHp, turnCount + 1, question, 1150, duoChallenge);
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
    duoChallenge,
    scheduleNextTurn,
    monsterHp,
    turnCount,
  ]);

  // Pendekar mode duel answer timer
  useEffect(() => {
    if (!battle || turnPhase !== 'answer' || diffCfg.duelAnswerSec <= 0 || turnFrozen) return;
    let lastMs = performance.now();
    const interval = window.setInterval(() => {
      if (turnPhaseRef.current !== 'answer' || isTerminalRef.current) return;
      const now = performance.now();
      const dt = (now - lastMs) / 1000;
      lastMs = now;
      const next = Math.max(0, answerTimerRef.current - dt);
      answerTimerRef.current = next;
      setAnswerTimer(next);
      if (next <= 0) {
        window.clearInterval(interval);
        if (turnPhaseRef.current !== 'answer' || isTerminalRef.current) return;
        handleMonsterAttack(
          battle,
          question,
          `Waktu jawab mode Pendekar (${getActiveDuelAnswerSec(battle)} dtk) habis!`,
        );
      }
    }, 100);
    return () => window.clearInterval(interval);
  }, [
    battle,
    turnPhase,
    diffCfg.duelAnswerSec,
    turnFrozen,
    handleMonsterAttack,
    question,
    getActiveDuelAnswerSec,
  ]);

  const handleGrab = useCallback(() => {
    if (!battle || turnPhaseRef.current !== 'grab' || isTerminalRef.current) return;
    turnPhaseRef.current = 'answer';
    setTurnPhase('answer');
    triggerAnim('grab_ready');
    soundEngine.playDash();
    if (!isDesaDuolingo && question) {
      soundEngine.speakEnglish(question.audioWord);
    }
  }, [battle, isDesaDuolingo, question, triggerAnim]);

  const handleUsePeluit = () => {
    if (peluitUsed || turnPhase !== 'answer') return;
    if (isDesaDuolingo && duoChallenge) {
      setPeluitEliminateTick((t) => t + 1);
      setPeluitUsed(true);
      soundEngine.playPick();
      return;
    }
    if (!question) return;
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
      if (!battle || !question || turnPhaseRef.current !== 'answer' || isTerminalRef.current) return;
      if (eliminatedChoices.includes(idx) || lockedChoiceIdx === idx) return;

      setSelectedIdx(idx);
      const isCorrect = idx === question.correctIndex;
      if (isCorrect) {
        turnPhaseRef.current = 'feedback';
        setTurnPhase('feedback');
        soundEngine.stopSpeech();

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

        // Pedang Kata: +1 dmg (2 dmg) on normal monsters; Boss & Boss Minions take 1 dmg per challenge & heal +1 ❤️ every 4 hits
        const isBossSquad = Boolean(battle.isZoneBoss || battle.isBossMinion);
        const dmg = !isBossSquad && hasPedang ? 2 : 1;
        let healNote = '';
        if (isBossSquad && hasPedang && nextStreak % 4 === 0 && localPlayerHp < playerMaxHp) {
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
        if (bossDef) {
          if (nextMonsterHp <= 5 && bossDef.taunts[2]) {
            setBossTaunt(bossDef.taunts[2]);
          } else if (nextMonsterHp <= 10 && bossDef.taunts[1]) {
            setBossTaunt(bossDef.taunts[1]);
          }
        }
        const isTerminalVictory =
          nextMonsterHp <= 0 && (!bossDef || bossPhase >= bossDef.phases);
        if (isTerminalVictory) {
          isTerminalRef.current = true;
        }
        triggerAnim(isTerminalVictory ? 'monster_ko' : 'hero_attack');

        clearPendingTimeout();
        timeoutRef.current = window.setTimeout(() => {
          if (nextMonsterHp <= 0) {
            if (bossDef && bossPhase < bossDef.phases) {
              const nextPhase = bossPhase + 1;
              setBossPhase(nextPhase);
              setMonsterHp(bossDef.hpPerPhase);
              setMonsterMaxHp(bossDef.hpPerPhase);
              setGrowHealsInPhase(0);
              setBossTaunt(bossDef.taunts[nextPhase - 1] || null);
              soundEngine.playBoss();
              const nextQ = pickNextQuestion(battle, bossDef.hpPerPhase, turnCount + 1, question, turnFrozen);
              setPrevQuestion(question);
              setQuestion(nextQ);
              turnPhaseRef.current = 'grab';
              setTurnCount(turnCount + 1);
              setTurnPhase('grab');
              setAnimEvent('idle');
              setupTurnModifiers(battle, nextQ, bossDef.hpPerPhase, turnCount + 1);
            } else {
              onBattleEnd('victory', { ...battle, monsterHp: 0 });
            }
          } else {
            const nextQ = pickNextQuestion(battle, nextMonsterHp, turnCount + 1, question, turnFrozen);
            setPrevQuestion(question);
            setQuestion(nextQ);
            turnPhaseRef.current = 'grab';
            setTurnCount(turnCount + 1);
            setTurnPhase('grab');
            setAnimEvent('idle');
            setupTurnModifiers(battle, nextQ, nextMonsterHp, turnCount + 1);
          }
        }, isTerminalVictory ? 1850 : 1050);
      } else {
        // Boss Grow mechanic: HP <= 10 heals boss +1 HP up to 2x
        const bossDef = battle.isZoneBoss ? BOSSES[battle.zoneId] : null;
        let growNote = '';
        let nextBossHpAfterHeal = monsterHp;
        if (bossDef && bossDef.mechanic === 'grow' && monsterHp <= 10 && growHealsInPhase < 2) {
          nextBossHpAfterHeal = Math.min(monsterMaxHp, monsterHp + 1);
          setMonsterHp(nextBossHpAfterHeal);
          setGrowHealsInPhase((c) => c + 1);
          growNote = ' (🌿 Akar Bos tumbuh +1 HP!)';
        }
        handleMonsterAttack(
          battle,
          question,
          `Salah! Jawaban yang benar adalah "${question.choices[question.correctIndex]}".${growNote}`,
          nextBossHpAfterHeal,
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

  const handleDuoBattleResolved = useCallback(
    (outcome: DuolingoChallengeOutcome) => {
      if (!battle || !duoChallenge || turnPhaseRef.current !== 'answer' || isTerminalRef.current) {
        return;
      }

      // Safe bypass if player cannot speak right now
      if (outcome.skipped && duoChallenge.type === 'speak') {
        turnPhaseRef.current = 'feedback';
        soundEngine.stopSpeech();
        disableSpeakingTemporarily(15);
        setTurnPhase('feedback');
        setFeedbackGood(true);
        setFeedbackMsg('Soal bicara dilewati sementara — menyiapkan tantangan baru!');
        scheduleNextTurn(battle, monsterHp, turnCount + 1, question, 950, duoChallenge);
        return;
      }

      const syntheticQ: QuizQuestion | null = question
        ? { ...question, vocabId: outcome.vocabId }
        : null;

      if (outcome.correct && !outcome.skipped) {
        turnPhaseRef.current = 'feedback';
        soundEngine.stopSpeech();
        setTurnPhase('feedback');

        const nextStreak = duelHitStreak + 1;
        setDuelHitStreak(nextStreak);

        const res = onAnswerResult(true, outcome.vocabId, {
          duelHitStreak: nextStreak,
          duelAmmoGained,
          isAcademyMini: battle.isAcademyShadow,
        });
        if (res && res.ammoAwarded > 0) {
          setDuelAmmoGained((g) => g + res.ammoAwarded);
        }

        const isBossSquad = Boolean(battle.isZoneBoss || battle.isBossMinion);
        const dmg = !isBossSquad && hasPedang ? 2 : 1;
        let healNote = '';
        if (isBossSquad && hasPedang && nextStreak % 4 === 0 && localPlayerHp < playerMaxHp) {
          setLocalPlayerHp((hp) => Math.min(playerMaxHp, hp + 1));
          onUseHealHeart();
          healNote = ' · 🗡️ Pedang Kata pulihkan +1 ❤️!';
        }

        const nextMonsterHp = Math.max(0, monsterHp - dmg);
        setMonsterHp(nextMonsterHp);
        setFeedbackGood(true);
        const ammoNote = res && res.ammoAwarded > 0 ? ` · +${res.ammoAwarded} Peluru` : '';
        setFeedbackMsg(`Tepat! ${dmg} Damage!${ammoNote}${healNote}`);

        const bossDef = battle.isZoneBoss ? BOSSES[battle.zoneId] : null;
        if (bossDef) {
          if (nextMonsterHp <= 5 && bossDef.taunts[2]) setBossTaunt(bossDef.taunts[2]);
          else if (nextMonsterHp <= 10 && bossDef.taunts[1]) setBossTaunt(bossDef.taunts[1]);
        }

        const isTerminalVictory =
          nextMonsterHp <= 0 && (!bossDef || bossPhase >= bossDef.phases);
        if (isTerminalVictory) {
          isTerminalRef.current = true;
        }
        triggerAnim(isTerminalVictory ? 'monster_ko' : 'hero_attack');

        clearPendingTimeout();
        timeoutRef.current = window.setTimeout(() => {
          if (nextMonsterHp <= 0) {
            if (bossDef && bossPhase < bossDef.phases) {
              const nextPhase = bossPhase + 1;
              setBossPhase(nextPhase);
              setMonsterHp(bossDef.hpPerPhase);
              setMonsterMaxHp(bossDef.hpPerPhase);
              setGrowHealsInPhase(0);
              setBossTaunt(bossDef.taunts[nextPhase - 1] || null);
              soundEngine.playBoss();
              const nextQ = pickNextQuestion(battle, bossDef.hpPerPhase, turnCount + 1, question, turnFrozen);
              setPrevQuestion(question);
              setQuestion(nextQ);
              setDuoChallenge(pickNextDuoChallenge(duoChallenge, battle.wordIds));
              turnPhaseRef.current = 'grab';
              setTurnCount(turnCount + 1);
              setTurnPhase('grab');
              setAnimEvent('idle');
              setupTurnModifiers(battle, nextQ, bossDef.hpPerPhase, turnCount + 1);
            } else {
              onBattleEnd('victory', { ...battle, monsterHp: 0 });
            }
          } else {
            const nextQ = pickNextQuestion(battle, nextMonsterHp, turnCount + 1, question, turnFrozen);
            setPrevQuestion(question);
            setQuestion(nextQ);
            setDuoChallenge(pickNextDuoChallenge(duoChallenge, battle.wordIds));
            turnPhaseRef.current = 'grab';
            setTurnCount(turnCount + 1);
            setTurnPhase('grab');
            setAnimEvent('idle');
            setupTurnModifiers(battle, nextQ, nextMonsterHp, turnCount + 1);
          }
        }, isTerminalVictory ? 1850 : 1200);
      } else {
        const bossDef = battle.isZoneBoss ? BOSSES[battle.zoneId] : null;
        let growNote = '';
        let nextBossHpAfterHeal = monsterHp;
        if (bossDef && bossDef.mechanic === 'grow' && monsterHp <= 10 && growHealsInPhase < 2) {
          nextBossHpAfterHeal = Math.min(monsterMaxHp, monsterHp + 1);
          setMonsterHp(nextBossHpAfterHeal);
          setGrowHealsInPhase((c) => c + 1);
          growNote = ' (🌿 Akar Bos tumbuh +1 HP!)';
        }
        handleMonsterAttack(
          battle,
          syntheticQ,
          outcome.skipped
            ? `Giliran dilewati! ${battle.monsterName} menyerangmu!${growNote}`
            : `Kurang tepat! ${battle.monsterName} menyerangmu!${growNote}`,
          nextBossHpAfterHeal,
        );
      }
    },
    [
      battle,
      duoChallenge,
      turnPhase,
      scheduleNextTurn,
      monsterHp,
      turnCount,
      question,
      duelHitStreak,
      onAnswerResult,
      duelAmmoGained,
      hasPedang,
      localPlayerHp,
      playerMaxHp,
      onUseHealHeart,
      bossPhase,
      triggerAnim,
      onBattleEnd,
      pickNextQuestion,
      turnFrozen,
      pickNextDuoChallenge,
      setupTurnModifiers,
      growHealsInPhase,
      monsterMaxHp,
      handleMonsterAttack,
    ],
  );

  // Keyboard shortcuts: Space to AMBIL, 1-4 to pick choice (classic mode only)
  useEffect(() => {
    if (!battle) return;
    const onKey = (e: KeyboardEvent) => {
      if (turnPhase === 'grab' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        handleGrab();
      } else if (turnPhase === 'answer' && !isDesaDuolingo) {
        if (e.key === '1') handlePickChoice(0);
        else if (e.key === '2') handlePickChoice(1);
        else if (e.key === '3') handlePickChoice(2);
        else if (e.key === '4') handlePickChoice(3);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [battle, turnPhase, isDesaDuolingo, handleGrab, handlePickChoice]);

  // Scroll back to top whenever a new turn/challenge begins so HP hearts & AMBIL GILIRAN are always in view
  useEffect(() => {
    if (!battle || turnPhase === 'feedback') return;
    const rafId = window.requestAnimationFrame(() => {
      outerScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      innerScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [battle, turnPhase, turnCount, question?.id, duoChallenge?.id]);

  if (!battle || !question) return null;

  const grabPct = Math.max(0, Math.min(100, (grabTimer / Math.max(0.5, grabWindowMax)) * 100));
  const activeAnsSec = getActiveDuelAnswerSec(battle);
  const timerPct =
    turnPhase === 'grab'
      ? grabPct
      : turnPhase === 'answer' && activeAnsSec > 0
      ? Math.max(0, (answerTimer / activeAnsSec) * 100)
      : 100;
  const bossDef = battle.isZoneBoss ? BOSSES[battle.zoneId] : null;

  const isKoWin = animEvent === 'monster_ko';
  const isKoLoss = animEvent === 'hero_ko';
  const showKoOverlay = isKoWin || isKoLoss;
  const isTerminalState = showKoOverlay || monsterHp <= 0 || localPlayerHp <= 0;

  const handleFlee = () => {
    if (isTerminalRef.current || isTerminalState) return;
    isTerminalRef.current = true;
    clearPendingTimeout();
    soundEngine.stopSpeech();
    onBattleEnd('fled', battle);
  };

  return (
    <div
      ref={outerScrollRef}
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto overscroll-contain touch-pan-y bg-[#060b16]/78 p-2 sm:p-4"
    >
      <div
        ref={innerScrollRef}
        className="my-auto max-h-[95dvh] w-full max-w-2xl overflow-y-auto overscroll-contain touch-pan-y"
      >
        <RpgBoardPanel>
          {/* Inside-Panel Top Clash VS Header */}
          <div className="mb-2.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
            {/* Hero Side HUD Box */}
            <div className="min-w-0 rounded-xl border border-emerald-400/35 bg-slate-950/60 px-2.5 py-1.5 shadow-inner">
              <div className="truncate text-xs font-black text-amber-100 drop-shadow sm:text-sm">
                {playerName?.trim() || heroPreset.name} ({heroPreset.name})
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
              {bossDef ? (
                <div className="-mt-1 rounded-full border border-purple-400/50 bg-purple-950/90 px-2 py-0.5 font-mono-nums text-[9px] font-black tracking-wider text-amber-200 shadow sm:text-[10px]">
                  BOS ZONA · {monsterMaxHp} TANTANGAN
                </div>
              ) : battle.isBossMinion ? (
                <div className="-mt-1 rounded-full border border-amber-400/50 bg-amber-950/90 px-2 py-0.5 font-mono-nums text-[9px] font-black tracking-wider text-amber-200 shadow sm:text-[10px]">
                  PENGAWAL BOS · {monsterMaxHp} SOAL
                </div>
              ) : null}
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
              characterId={characterId}
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
              {!isTerminalState &&
                hasPeluit &&
                turnPhase === 'answer' &&
                !peluitUsed &&
                !(isDesaDuolingo && duoChallenge?.type === 'speak') && (
                <button
                  type="button"
                  onClick={handleUsePeluit}
                  className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-600/95 px-2.5 py-0.5 text-[10px] font-black text-white shadow hover:bg-emerald-500 sm:text-[11px]"
                >
                  <span>🎵 Peluit (-1 Opsi)</span>
                </button>
              )}
              {!isTerminalState && hasJam && turnPhase !== 'feedback' && !jamUsed && (
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
              {isDesaDuolingo && duoChallenge ? duoChallenge.kicker : question.category}
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
            {!isDesaDuolingo && (
              <div className="flex items-start justify-between gap-2.5 rounded-2xl border border-amber-300/20 bg-slate-950/45 px-3.5 py-2.5">
                <div className="min-w-0">
                  {question.isDifficultyFlagged && (
                    <div className="mb-1 inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-200">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      <span>🧭 Kompas Tanya Kata Sulit</span>
                    </div>
                  )}
                  <h3 className="text-base font-extrabold leading-snug text-white sm:text-lg">
                    {question.prompt}
                  </h3>
                  {question.hintWord && turnPhase !== 'grab' && (
                    <div className="mt-0.5 font-mono-nums text-xs font-semibold text-amber-300">
                      Petunjuk {question.hintWord}
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
            )}

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
            ) : !isDesaDuolingo || turnPhase === 'feedback' ? (
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
                    activeAnsSec > 0 ? ` · Sisa ${answerTimer.toFixed(0)} dtk` : ''
                  }`}
              </div>
            ) : activeAnsSec > 0 ? (
              <div className="rounded-xl border border-amber-300/30 bg-slate-950/55 px-3 py-1 text-center text-[11px] font-extrabold text-amber-200">
                Mode Pendekar · Sisa {answerTimer.toFixed(0)} dtk
              </div>
            ) : null}

            {/* Desa Sapaan 6-Type People Duolingo Stage OR Classic 4-Option Tablets */}
            {isDesaDuolingo && duoChallenge ? (
              <div className="rounded-2xl border border-amber-300/20 bg-slate-950/40 p-2.5 sm:p-3">
                <DuolingoChallengeView
                  challenge={duoChallenge}
                  disabled={turnPhase !== 'answer'}
                  streak={duelHitStreak}
                  relicEliminateTick={peluitEliminateTick}
                  onResolved={handleDuoBattleResolved}
                  onDisableSpeaking={() => disableSpeakingTemporarily(15)}
                  onMatchMistake={(_, mistakes) => {
                    if (mistakes >= 2) {
                      handleMonsterAttack(
                        battle,
                        question ? { ...question, vocabId: duoChallenge.vocabId } : null,
                        `Terlalu banyak pasangan keliru! ${battle.monsterName} menyerangmu!`,
                      );
                    }
                  }}
                />
              </div>
            ) : (
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
            )}

            {/* Bottom Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-2 text-[11px] font-extrabold text-amber-200">
                {hasPedang && (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300/35 bg-amber-500/20 px-2 py-0.5 text-amber-200">
                    <Sparkles className="h-3 w-3" />
                    <span>{battle.isZoneBoss || battle.isBossMinion ? 'Pedang 4 hit = +1 ❤️' : 'Pedang 2 Dmg'}</span>
                  </span>
                )}
                <span>Streak Duel x{duelHitStreak}</span>
              </div>

              <RpgPillButton
                variant="red"
                size="sm"
                disabled={isTerminalState}
                onClick={handleFlee}
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
