import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Mic,
  MicOff,
  SkipForward,
  Turtle,
  Volume2,
  XCircle,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import {
  DuolingoChallenge,
  evaluateSpokenEnglish,
  evaluateWordBankAnswer,
  VocabVisualSpec,
} from '../data/duolingoChallenges';
import { RpgChoiceCard, RpgChoiceTone, RpgPillButton } from './RpgUiKit';

interface BankToken {
  uid: number;
  text: string;
  isDistractor: boolean;
}

interface MatchTile {
  vocabId: string;
  text: string;
  audioWord: string;
}

export interface DuolingoChallengeOutcome {
  correct: boolean;
  skipped: boolean;
  vocabId: string;
  mistakes: number;
}

interface DuolingoChallengeViewProps {
  challenge: DuolingoChallenge;
  disabled?: boolean;
  streak?: number;
  /** Incrementing counter triggered by Peluit relic to eliminate 1 distractor/option */
  relicEliminateTick?: number;
  /** Optional custom skip label */
  allowSkip?: boolean;
  /** Called immediately when the user checks/completes/skips the challenge */
  onResolved: (outcome: DuolingoChallengeOutcome) => void;
  /** Called when user clicks LANJUTKAN after seeing feedback (for LearningModeModal). If omitted, parent auto-advances via timer. */
  onContinue?: () => void;
  /** Called when user clicks "Tak bisa bicara sekarang" */
  onDisableSpeaking?: () => void;
  /** Optional callback on individual match-pair mistake (useful in duel mode) */
  onMatchMistake?: (vocabId: string, mistakesSoFar: number) => void;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  0: SpeechRecognitionAlternativeLike;
  [index: number]: SpeechRecognitionAlternativeLike | undefined;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function shuffleArr<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const PRAISE_WORDS = ['Hebat!', 'Keren!', 'Luar biasa!', 'Mantap!', 'Tepat sekali!'];

const InteractiveSentence: React.FC<{
  text: string;
  hints: Record<string, string>;
}> = ({ text, hints }) => {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const tokens = text.split(' ');

  useEffect(() => {
    if (!openKey) return;
    const dismiss = () => setOpenKey(null);
    window.addEventListener('pointerdown', dismiss);
    return () => window.removeEventListener('pointerdown', dismiss);
  }, [openKey]);

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
      {tokens.map((tok, i) => {
        const clean = tok
          .toLowerCase()
          .replace(/['’]/g, '')
          .replace(/[^a-z0-9-]/g, '');
        const hint = hints[clean];
        if (!hint) {
          return <span key={`${tok}_${i}`}>{tok}</span>;
        }
        const key = `${clean}_${i}`;
        const isOpen = openKey === key;
        return (
          <span key={key} className="relative inline-block">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenKey((prev) => (prev === key ? null : key));
              }}
              onMouseEnter={() => setOpenKey(key)}
              onMouseLeave={() => setOpenKey((prev) => (prev === key ? null : prev))}
              className="border-b-2 border-dotted border-amber-300/75 font-extrabold text-amber-100 transition hover:text-amber-300"
            >
              {tok}
            </button>
            {isOpen && (
              <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg border border-amber-300/60 bg-slate-950 px-2.5 py-1 text-[11px] font-bold text-amber-200 shadow-lg">
                {hint}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
};

export const DuolingoChallengeView: React.FC<DuolingoChallengeViewProps> = ({
  challenge,
  disabled = false,
  streak = 0,
  relicEliminateTick = 0,
  allowSkip = true,
  onResolved,
  onContinue,
  onDisableSpeaking,
  onMatchMistake,
}) => {
  const [phase, setPhase] = useState<'answering' | 'feedback'>('answering');
  const [isCorrect, setIsCorrect] = useState(false);
  const [wasSkipped, setWasSkipped] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [praiseTitle, setPraiseTitle] = useState('Hebat!');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // 1. picture_choice & dialogue_complete selection
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [eliminatedChoiceIdxs, setEliminatedChoiceIdxs] = useState<number[]>([]);

  // 2. word_bank_translate & listen_word_bank
  const [bankTokens, setBankTokens] = useState<BankToken[]>([]);
  const [placedUids, setPlacedUids] = useState<number[]>([]);
  const [eliminatedTokenUids, setEliminatedTokenUids] = useState<number[]>([]);

  // 3. speak state
  const [isListening, setIsListening] = useState(false);
  const [isStoppingSpeak, setIsStoppingSpeak] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [speakError, setSpeakError] = useState<string | null>(null);
  const [waveLevels, setWaveLevels] = useState<number[]>(() => Array(22).fill(0.18));
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speakSessionIdRef = useRef(0);
  const speakFinalizedRef = useRef(false);
  const latestTranscriptRef = useRef('');
  const bestCandidatesRef = useRef<string[]>([]);
  const stopSafetyTimerRef = useRef<number | null>(null);
  const maxListenTimerRef = useRef<number | null>(null);
  const speechSupported = useMemo(() => Boolean(getSpeechRecognitionCtor()), []);

  // 4. match_pairs state
  const [leftTiles, setLeftTiles] = useState<MatchTile[]>([]);
  const [rightTiles, setRightTiles] = useState<MatchTile[]>([]);
  const [selSide, setSelSide] = useState<{ side: 'left' | 'right'; vocabId: string } | null>(null);
  const [matchedVocabIds, setMatchedVocabIds] = useState<string[]>([]);
  const [wrongPairFlash, setWrongPairFlash] = useState<{ leftId: string; rightId: string } | null>(
    null,
  );
  const [matchMistakes, setMatchMistakes] = useState(0);

  const lastRelicTickRef = useRef(relicEliminateTick);
  const resolvedRef = useRef(false);
  const continuedRef = useRef(false);
  const pendingTimersRef = useRef<number[]>([]);

  const clearPendingTimers = useCallback(() => {
    for (const id of pendingTimersRef.current) {
      window.clearTimeout(id);
    }
    pendingTimersRef.current = [];
  }, []);

  const scheduleSafeTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      pendingTimersRef.current = pendingTimersRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    pendingTimersRef.current.push(id);
    return id;
  }, []);

  const clearSpeakTimers = useCallback(() => {
    if (stopSafetyTimerRef.current !== null) {
      window.clearTimeout(stopSafetyTimerRef.current);
      stopSafetyTimerRef.current = null;
    }
    if (maxListenTimerRef.current !== null) {
      window.clearTimeout(maxListenTimerRef.current);
      maxListenTimerRef.current = null;
    }
  }, []);

  const stopMicResources = useCallback(() => {
    speakSessionIdRef.current += 1;
    clearSpeakTimers();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setIsStoppingSpeak(false);
    setWaveLevels(Array(22).fill(0.18));
  }, [clearSpeakTimers]);

  // Reset state whenever challenge.id changes
  useEffect(() => {
    stopMicResources();
    clearPendingTimers();
    soundEngine.stopSpeech();
    resolvedRef.current = false;
    continuedRef.current = false;
    speakFinalizedRef.current = false;
    latestTranscriptRef.current = '';
    bestCandidatesRef.current = [];
    setPhase('answering');
    setIsCorrect(false);
    setWasSkipped(false);
    setFeedbackNote('');
    setPraiseTitle(PRAISE_WORDS[Math.floor(Math.random() * PRAISE_WORDS.length)]);
    setSelectedChoiceIdx(null);
    setEliminatedChoiceIdxs([]);
    setPlacedUids([]);
    setEliminatedTokenUids([]);
    setSpokenText('');
    setSpeakError(null);
    setSelSide(null);
    setMatchedVocabIds([]);
    setWrongPairFlash(null);
    setMatchMistakes(0);
    lastRelicTickRef.current = relicEliminateTick;

    if (challenge.type === 'word_bank_translate' || challenge.type === 'listen_word_bank') {
      const combined: BankToken[] = [
        ...challenge.targetTokens.map((t, idx) => ({
          uid: idx + 1,
          text: t,
          isDistractor: false,
        })),
        ...challenge.distractorTokens.map((t, idx) => ({
          uid: 100 + idx,
          text: t,
          isDistractor: true,
        })),
      ];
      setBankTokens(shuffleArr(combined));
    } else {
      setBankTokens([]);
    }

    if (challenge.type === 'match_pairs') {
      setLeftTiles(
        shuffleArr(
          challenge.pairs.map((p) => ({
            vocabId: p.vocabId,
            text: p.leftText,
            audioWord: p.audioWord,
          })),
        ),
      );
      setRightTiles(
        shuffleArr(
          challenge.pairs.map((p) => ({
            vocabId: p.vocabId,
            text: p.rightText,
            audioWord: p.audioWord,
          })),
        ),
      );
    } else {
      setLeftTiles([]);
      setRightTiles([]);
    }

    // Auto-play audio for listen / word_bank / dialogue when unlocked
    if (!disabled) {
      if (challenge.type === 'listen_word_bank') {
        scheduleSafeTimeout(() => soundEngine.speakEnglish(challenge.audioSentence, 0.9), 250);
      } else if (challenge.type === 'word_bank_translate' && challenge.audioLang === 'en') {
        scheduleSafeTimeout(() => soundEngine.speakEnglish(challenge.audioText, 0.92), 250);
      } else if (challenge.type === 'dialogue_complete') {
        scheduleSafeTimeout(() => soundEngine.speakEnglish(challenge.speakerALine, 0.92), 250);
      }
    }

    return () => {
      stopMicResources();
      clearPendingTimers();
      soundEngine.stopSpeech();
    };
  }, [challenge.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // When transitioning from locked (`disabled = true`, e.g. grab phase) to unlocked (`disabled = false`), speak listen prompt
  // Also abort active mic/speech if parent locks the view mid-turn (e.g., duel timeout)
  const prevDisabledRef = useRef(disabled);
  useEffect(() => {
    if (!prevDisabledRef.current && disabled) {
      stopMicResources();
      soundEngine.stopSpeech();
    } else if (prevDisabledRef.current && !disabled) {
      if (challenge.type === 'listen_word_bank') {
        soundEngine.speakEnglish(challenge.audioSentence, 0.9);
      } else if (challenge.type === 'word_bank_translate' && challenge.audioLang === 'en') {
        soundEngine.speakEnglish(challenge.audioText, 0.92);
      } else if (challenge.type === 'dialogue_complete') {
        soundEngine.speakEnglish(challenge.speakerALine, 0.92);
      } else if (challenge.type === 'picture_choice') {
        soundEngine.speakEnglish(challenge.audioWord, 0.92);
      } else if (challenge.type === 'speak') {
        soundEngine.speakEnglish(challenge.targetSentence, 0.9);
      }
    }
    prevDisabledRef.current = disabled;
  }, [disabled, challenge, stopMicResources]);

  // Peluit relic elimination support
  useEffect(() => {
    if (relicEliminateTick === lastRelicTickRef.current) return;
    lastRelicTickRef.current = relicEliminateTick;
    if (phase !== 'answering') return;

    if (challenge.type === 'picture_choice') {
      const wrong = challenge.options
        .map((_, idx) => idx)
        .filter((idx) => idx !== challenge.correctIndex && !eliminatedChoiceIdxs.includes(idx));
      if (wrong.length > 0) {
        setEliminatedChoiceIdxs((prev) => [...prev, wrong[0]]);
      }
    } else if (challenge.type === 'dialogue_complete') {
      const wrong = challenge.choices
        .map((_, idx) => idx)
        .filter((idx) => idx !== challenge.correctIndex && !eliminatedChoiceIdxs.includes(idx));
      if (wrong.length > 0) {
        setEliminatedChoiceIdxs((prev) => [...prev, wrong[0]]);
      }
    } else if (
      challenge.type === 'word_bank_translate' ||
      challenge.type === 'listen_word_bank'
    ) {
      const distractors = bankTokens.filter(
        (t) =>
          t.isDistractor &&
          !eliminatedTokenUids.includes(t.uid) &&
          !placedUids.includes(t.uid),
      );
      if (distractors.length > 0) {
        setEliminatedTokenUids((prev) => [...prev, distractors[0].uid]);
      }
    } else if (challenge.type === 'match_pairs') {
      const remaining = challenge.pairs.filter((p) => !matchedVocabIds.includes(p.vocabId));
      if (remaining.length > 1) {
        const autoMatch = remaining[0];
        const nextMatched = [...matchedVocabIds, autoMatch.vocabId];
        setMatchedVocabIds(nextMatched);
        setSelSide(null);
      }
    }
  }, [
    relicEliminateTick,
    phase,
    challenge,
    eliminatedChoiceIdxs,
    bankTokens,
    eliminatedTokenUids,
    placedUids,
    matchedVocabIds,
  ]);

  const finishOutcome = useCallback(
    (ok: boolean, skipped: boolean, note: string, mistakes = 0) => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      stopMicResources();
      setPhase('feedback');
      setIsCorrect(ok);
      setWasSkipped(skipped);
      setFeedbackNote(note);
      if (ok) {
        soundEngine.playOk();
      } else {
        soundEngine.playWrongAnswer();
      }
      onResolved({
        correct: ok,
        skipped,
        vocabId: challenge.vocabId,
        mistakes,
      });
    },
    [challenge.vocabId, onResolved, stopMicResources],
  );

  const canCheck = useMemo(() => {
    if (disabled || phase !== 'answering') return false;
    switch (challenge.type) {
      case 'picture_choice':
      case 'dialogue_complete':
        return selectedChoiceIdx !== null;
      case 'word_bank_translate':
      case 'listen_word_bank':
        return placedUids.length > 0;
      case 'speak':
        return false; // Speak auto-resolves on match or via skip
      case 'match_pairs':
        return false; // Match pairs auto-resolves once all 5 pairs match
    }
  }, [disabled, phase, challenge.type, selectedChoiceIdx, placedUids.length]);

  const handleCheck = useCallback(() => {
    if (!canCheck || phase !== 'answering') return;

    if (challenge.type === 'picture_choice') {
      const ok = selectedChoiceIdx === challenge.correctIndex;
      const correctWord = challenge.options[challenge.correctIndex]?.label ?? '';
      finishOutcome(
        ok,
        false,
        ok
          ? `Arti: ${challenge.translationNote}`
          : `Jawaban yang benar: "${correctWord}" (${challenge.translationNote})`,
      );
    } else if (challenge.type === 'dialogue_complete') {
      const ok = selectedChoiceIdx === challenge.correctIndex;
      const correctReply = challenge.choices[challenge.correctIndex] ?? '';
      finishOutcome(
        ok,
        false,
        ok
          ? `Arti: ${challenge.translationNote}`
          : `Jawaban yang benar: "${correctReply}" (${challenge.translationNote})`,
      );
    } else if (challenge.type === 'word_bank_translate') {
      const selectedWords = placedUids
        .map((uid) => bankTokens.find((t) => t.uid === uid)?.text)
        .filter((t): t is string => Boolean(t));
      const ok = evaluateWordBankAnswer(
        selectedWords,
        challenge.targetTokens,
        challenge.acceptedVariants,
      );
      const correctStr = challenge.targetTokens.join(' ');
      finishOutcome(
        ok,
        false,
        ok ? `Arti: ${challenge.translationNote}` : `Jawaban yang benar: "${correctStr}"`,
      );
    } else if (challenge.type === 'listen_word_bank') {
      const selectedWords = placedUids
        .map((uid) => bankTokens.find((t) => t.uid === uid)?.text)
        .filter((t): t is string => Boolean(t));
      const ok = evaluateWordBankAnswer(selectedWords, challenge.targetTokens);
      finishOutcome(
        ok,
        false,
        ok
          ? `Arti: ${challenge.translationNote}`
          : `Kalimat yang benar: "${challenge.audioSentence}" (${challenge.translationNote})`,
      );
    }
  }, [canCheck, phase, challenge, selectedChoiceIdx, placedUids, bankTokens, finishOutcome]);

  const handleSkip = useCallback(() => {
    if (disabled || phase !== 'answering') return;
    if (challenge.type === 'speak') {
      onDisableSpeaking?.();
      finishOutcome(
        true,
        true,
        `Soal bicara dilewati sementara. Kalimat: "${challenge.targetSentence}" (${challenge.translationNote})`,
      );
      return;
    }

    let answerHint = '';
    if (challenge.type === 'picture_choice') {
      answerHint = challenge.options[challenge.correctIndex]?.label ?? '';
    } else if (challenge.type === 'dialogue_complete') {
      answerHint = challenge.choices[challenge.correctIndex] ?? '';
    } else if (challenge.type === 'word_bank_translate') {
      answerHint = challenge.targetTokens.join(' ');
    } else if (challenge.type === 'listen_word_bank') {
      answerHint = challenge.audioSentence;
    } else if (challenge.type === 'match_pairs') {
      answerHint = challenge.pairs.map((p) => `${p.rightText}=${p.leftText}`).join(', ');
    }

    finishOutcome(false, true, `Dilewati. Jawaban benar: ${answerHint}`);
  }, [disabled, phase, challenge, finishOutcome, onDisableSpeaking]);

  // Finalize & grade captured speech cleanly (used both by rec.onend and stop safety fallback)
  const finalizeSpeakAttempt = useCallback(
    (sessionId: number, emptyMessage?: string) => {
      if (sessionId !== speakSessionIdRef.current || speakFinalizedRef.current) return;
      speakFinalizedRef.current = true;
      clearSpeakTimers();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }

      setIsListening(false);
      setIsStoppingSpeak(false);
      setWaveLevels(Array(22).fill(0.18));

      if (resolvedRef.current || challenge.type !== 'speak') return;

      const candidates = [
        latestTranscriptRef.current,
        ...bestCandidatesRef.current,
      ].filter((t) => t.trim().length > 0);

      for (const candidate of candidates) {
        const evalRes = evaluateSpokenEnglish(candidate, challenge.targetSentence);
        if (evalRes.matched) {
          finishOutcome(true, false, `Arti: ${challenge.translationNote}`);
          return;
        }
      }

      const heard = latestTranscriptRef.current.trim();
      if (heard) {
        setSpeakError(
          `Terdengar "${heard}" — pelafalan belum cocok. Coba ucapkan lebih jelas atau klik "Tak bisa bicara sekarang".`,
        );
      } else {
        setSpeakError(
          emptyMessage ??
            'Suara belum terekam. Pastikan izin mikrofon aktif, ucapkan lebih jelas, lalu tekan berhenti.',
        );
      }
    },
    [challenge, clearSpeakTimers, finishOutcome],
  );

  const triggerStopSpeak = useCallback(
    (sessionId: number) => {
      if (sessionId !== speakSessionIdRef.current || speakFinalizedRef.current) return;
      setIsStoppingSpeak(true);

      const rec = recognitionRef.current;
      if (rec) {
        try {
          rec.stop();
        } catch {
          finalizeSpeakAttempt(sessionId);
          return;
        }
      } else {
        finalizeSpeakAttempt(sessionId);
        return;
      }

      if (stopSafetyTimerRef.current !== null) {
        window.clearTimeout(stopSafetyTimerRef.current);
      }
      stopSafetyTimerRef.current = window.setTimeout(() => {
        try {
          recognitionRef.current?.abort();
        } catch {
          // ignore
        }
        finalizeSpeakAttempt(sessionId);
      }, 850);
    },
    [finalizeSpeakAttempt],
  );

  const stopAndEvaluateSpeak = useCallback(() => {
    if (!isListening || isStoppingSpeak) return;
    triggerStopSpeak(speakSessionIdRef.current);
  }, [isListening, isStoppingSpeak, triggerStopSpeak]);

  // Speaking challenge microphone handler (synchronous start for browser user-gesture compatibility)
  const handleStartSpeak = useCallback(() => {
    if (disabled || phase !== 'answering' || challenge.type !== 'speak') return;
    if (isListening) {
      stopAndEvaluateSpeak();
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setSpeakError(
        'Browser ini belum mendukung pengenalan suara otomatis. Gunakan tombol "Tak bisa bicara sekarang".',
      );
      return;
    }

    // Stop any TTS playback before turning on microphone so TTS does not bleed into mic
    soundEngine.stopSpeech();
    stopMicResources();

    const sessionId = speakSessionIdRef.current;
    speakFinalizedRef.current = false;
    latestTranscriptRef.current = '';
    bestCandidatesRef.current = [];
    setSpeakError(null);
    setSpokenText('');
    setIsStoppingSpeak(false);
    setIsListening(true);

    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 4;
    recognitionRef.current = rec;

    let handledMatch = false;

    rec.onresult = (event) => {
      if (sessionId !== speakSessionIdRef.current || handledMatch || resolvedRef.current) return;

      const combinedParts: string[] = [];
      const altCandidates: string[] = [];
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        if (!res) continue;
        const primary = res[0]?.transcript?.trim() ?? '';
        if (primary) combinedParts.push(primary);
        const altCount = typeof res.length === 'number' ? res.length : 1;
        for (let a = 0; a < altCount; a++) {
          const altText = res[a]?.transcript?.trim() ?? '';
          if (altText) altCandidates.push(altText);
        }
      }

      const fullTranscript = combinedParts.join(' ').trim();
      if (fullTranscript) {
        latestTranscriptRef.current = fullTranscript;
        setSpokenText(fullTranscript);
      }

      const allToCheck = [fullTranscript, ...altCandidates].filter(Boolean);
      bestCandidatesRef.current = Array.from(new Set(allToCheck));

      for (const cand of bestCandidatesRef.current) {
        const evalRes = evaluateSpokenEnglish(cand, challenge.targetSentence);
        if (evalRes.matched) {
          handledMatch = true;
          speakFinalizedRef.current = true;
          clearSpeakTimers();
          try {
            rec.onresult = null;
            rec.onerror = null;
            rec.onend = null;
            rec.stop();
          } catch {
            // ignore
          }
          recognitionRef.current = null;
          setIsListening(false);
          setIsStoppingSpeak(false);
          finishOutcome(true, false, `Arti: ${challenge.translationNote}`);
          return;
        }
      }
    };

    rec.onerror = (ev) => {
      if (sessionId !== speakSessionIdRef.current || handledMatch) return;
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        finalizeSpeakAttempt(
          sessionId,
          'Izin mikrofon ditolak. Aktifkan mic atau tekan "Tak bisa bicara sekarang".',
        );
      } else if (ev.error === 'audio-capture') {
        finalizeSpeakAttempt(
          sessionId,
          'Perangkat mikrofon tidak ditemukan atau sedang dipakai aplikasi lain.',
        );
      } else if (ev.error === 'network') {
        finalizeSpeakAttempt(
          sessionId,
          'Koneksi pengenalan suara terganggu. Coba ulangi atau klik "Tak bisa bicara sekarang".',
        );
      } else if (ev.error === 'language-not-supported') {
        finalizeSpeakAttempt(
          sessionId,
          'Bahasa Inggris belum didukung pengenalan suara browser ini. Klik "Tak bisa bicara sekarang".',
        );
      } else if (ev.error === 'no-speech') {
        finalizeSpeakAttempt(
          sessionId,
          'Suara belum terdeteksi. Dekatkan mikrofon lalu coba ucapkan lagi.',
        );
      } else if (ev.error !== 'aborted') {
        finalizeSpeakAttempt(
          sessionId,
          'Gagal menangkap suara. Coba lagi atau klik "Tak bisa bicara sekarang".',
        );
      } else {
        finalizeSpeakAttempt(sessionId);
      }
    };

    rec.onend = () => {
      if (sessionId !== speakSessionIdRef.current || handledMatch) return;
      finalizeSpeakAttempt(sessionId);
    };

    try {
      rec.start();
      // Safety auto-stop after 12 seconds using unified stop flow
      maxListenTimerRef.current = window.setTimeout(() => {
        triggerStopSpeak(sessionId);
      }, 12000);
    } catch {
      finalizeSpeakAttempt(
        sessionId,
        'Mikrofon sedang sibuk. Coba tekan lagi atau klik "Tak bisa bicara sekarang".',
      );
    }
  }, [
    disabled,
    phase,
    challenge,
    isListening,
    stopAndEvaluateSpeak,
    stopMicResources,
    clearSpeakTimers,
    finishOutcome,
    finalizeSpeakAttempt,
    triggerStopSpeak,
  ]);

  // Animated wave bars while microphone is active
  useEffect(() => {
    if (!isListening) return;
    const id = window.setInterval(() => {
      const t = Date.now() / 130;
      const boost = spokenText ? 0.14 : 0;
      setWaveLevels(
        Array.from({ length: 22 }, (_, i) =>
          Math.max(0.18, Math.min(0.98, 0.34 + boost + 0.48 * Math.abs(Math.sin(t + i * 0.45)))),
        ),
      );
    }, 90);
    return () => window.clearInterval(id);
  }, [isListening, spokenText]);

  // Match-pair tile handler
  const handlePickMatchTile = useCallback(
    (side: 'left' | 'right', tile: MatchTile) => {
      if (disabled || phase !== 'answering' || challenge.type !== 'match_pairs') return;
      if (matchedVocabIds.includes(tile.vocabId)) return;

      if (side === 'right') {
        soundEngine.speakEnglish(tile.audioWord, 0.92);
      }

      if (!selSide || selSide.side === side) {
        setSelSide({ side, vocabId: tile.vocabId });
        return;
      }

      const leftId = side === 'left' ? tile.vocabId : selSide.vocabId;
      const rightId = side === 'right' ? tile.vocabId : selSide.vocabId;
      setSelSide(null);

      if (leftId === rightId) {
        soundEngine.playOk();
        const nextMatched = [...matchedVocabIds, leftId];
        setMatchedVocabIds(nextMatched);
        if (nextMatched.length >= challenge.pairs.length) {
          finishOutcome(true, false, 'Semua 5 pasangan kosakata cocok!', matchMistakes);
        }
      } else {
        soundEngine.playWrongAnswer();
        const nextMistakes = matchMistakes + 1;
        setMatchMistakes(nextMistakes);
        setWrongPairFlash({ leftId, rightId });
        onMatchMistake?.(leftId, nextMistakes);
        scheduleSafeTimeout(() => setWrongPairFlash(null), 460);
      }
    },
    [
      disabled,
      phase,
      challenge,
      matchedVocabIds,
      selSide,
      finishOutcome,
      matchMistakes,
      onMatchMistake,
      scheduleSafeTimeout,
    ],
  );

  const safeContinue = useCallback(() => {
    if (!onContinue || continuedRef.current) return;
    continuedRef.current = true;
    soundEngine.stopSpeech();
    onContinue();
  }, [onContinue]);

  // Keyboard shortcuts
  useEffect(() => {
    if (disabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'feedback') {
        if ((e.key === 'Enter' || e.code === 'Space') && onContinue) {
          e.preventDefault();
          safeContinue();
        }
        return;
      }

      if (e.key === 'Enter' && canCheck) {
        e.preventDefault();
        handleCheck();
        return;
      }

      if (
        (challenge.type === 'word_bank_translate' || challenge.type === 'listen_word_bank') &&
        e.key === 'Backspace' &&
        placedUids.length > 0
      ) {
        e.preventDefault();
        setPlacedUids((prev) => prev.slice(0, -1));
        return;
      }

      if (challenge.type === 'picture_choice' || challenge.type === 'dialogue_complete') {
        const maxOpts =
          challenge.type === 'picture_choice' ? challenge.options.length : challenge.choices.length;
        const num = Number(e.key);
        if (num >= 1 && num <= maxOpts) {
          const idx = num - 1;
          if (!eliminatedChoiceIdxs.includes(idx)) {
            setSelectedChoiceIdx(idx);
            if (challenge.type === 'picture_choice') {
              const word = challenge.options[idx]?.label;
              if (word) soundEngine.speakEnglish(word, 0.92);
            }
          }
        }
      } else if (challenge.type === 'match_pairs') {
        const keyMapLeft: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4 };
        const keyMapRight: Record<string, number> = { '6': 0, '7': 1, '8': 2, '9': 3, '0': 4 };
        if (e.key in keyMapLeft) {
          const tile = leftTiles[keyMapLeft[e.key]];
          if (tile) handlePickMatchTile('left', tile);
        } else if (e.key in keyMapRight) {
          const tile = rightTiles[keyMapRight[e.key]];
          if (tile) handlePickMatchTile('right', tile);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    disabled,
    phase,
    onContinue,
    safeContinue,
    canCheck,
    handleCheck,
    challenge,
    eliminatedChoiceIdxs,
    placedUids.length,
    leftTiles,
    rightTiles,
    handlePickMatchTile,
  ]);

  const placedTokens = useMemo(
    () =>
      placedUids
        .map((uid) => bankTokens.find((t) => t.uid === uid))
        .filter((t): t is BankToken => Boolean(t)),
    [placedUids, bankTokens],
  );

  const renderVisualTile = (visual: VocabVisualSpec, compact = false) => {
    if (visual.kind === 'color') {
      if (visual.pattern === 'rainbow') {
        return (
          <div
            className="flex h-full w-full items-center justify-center rounded-xl border-2 border-white/80 shadow-inner"
            style={{
              background:
                'conic-gradient(from 0deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #a855f7, #ec4899, #ef4444)',
            }}
          >
            <div className="h-1/3 w-1/3 rounded-full border-2 border-white/90 bg-white/85 shadow" />
          </div>
        );
      }
      if (visual.pattern === 'dark') {
        return (
          <div
            className="flex h-full w-full items-center justify-center rounded-xl border-2 shadow-inner"
            style={{
              background: 'linear-gradient(135deg, #020617 0%, #1e1b4b 55%, #0f172a 100%)',
              borderColor: visual.borderHex ?? '#334155',
            }}
          >
            <span className={compact ? 'text-xl' : 'text-3xl'}>🌑</span>
          </div>
        );
      }
      if (visual.pattern === 'light') {
        return (
          <div
            className="flex h-full w-full items-center justify-center rounded-xl border-2 shadow-inner"
            style={{
              background: 'linear-gradient(135deg, #fefce8 0%, #fef08a 52%, #e0f2fe 100%)',
              borderColor: visual.borderHex ?? '#eab308',
            }}
          >
            <span className={compact ? 'text-xl' : 'text-3xl'}>✨</span>
          </div>
        );
      }
      return (
        <div
          className="h-full w-full rounded-xl border-2 shadow-inner"
          style={{
            backgroundColor: visual.hex,
            borderColor: visual.borderHex ?? 'rgba(255,255,255,0.65)',
          }}
        />
      );
    }

    if (visual.kind === 'numeral') {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-xl border border-amber-300/60 bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-200 shadow-inner">
          <span
            className={`font-mono-nums font-black tracking-tight text-[#451a03] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] ${
              compact
                ? visual.text.length >= 3
                  ? 'text-base'
                  : 'text-xl'
                : visual.text.length >= 3
                ? 'text-3xl sm:text-4xl'
                : 'text-4xl sm:text-5xl'
            }`}
          >
            {visual.text}
          </span>
        </div>
      );
    }

    return (
      <div
        className={`flex h-full w-full items-center justify-center rounded-xl border border-white/60 bg-gradient-to-br ${visual.gradient} shadow-inner`}
      >
        <span className={compact ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'}>
          {visual.emoji}
        </span>
      </div>
    );
  };

  const renderPeopleAvatar = (
    src: string,
    alt: string,
    visual?: VocabVisualSpec,
    sizeClass = 'h-16 w-16 sm:h-20 sm:w-20',
  ) => {
    if (visual) {
      return (
        <div
          className={`flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-300/45 bg-amber-50/95 p-1 shadow-md`}
        >
          {renderVisualTile(visual, true)}
        </div>
      );
    }
    if (!src || brokenImages[src]) {
      return (
        <div
          className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-2xl border border-amber-300/40 bg-amber-100/90 px-1 text-center text-xs font-black text-amber-900`}
        >
          {alt}
        </div>
      );
    }
    return (
      <div
        className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-2xl border border-amber-300/45 bg-gradient-to-b from-amber-50/95 to-amber-100/90 p-1 shadow-md`}
      >
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          draggable={false}
          onError={() => setBrokenImages((prev) => ({ ...prev, [src]: true }))}
          className="h-full w-full select-none object-contain drop-shadow-[0_3px_4px_rgba(0,0,0,0.2)]"
        />
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header Metadata & Streak */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-wide text-amber-300/90">
          <span>{challenge.kicker}</span>
        </div>
        {streak >= 2 && (
          <div className="font-mono-nums text-[11px] font-black uppercase tracking-wider text-emerald-300">
            {streak} BERUNTUN
          </div>
        )}
      </div>

      {/* Challenge Prompt Title */}
      <h3 className="text-base font-black leading-snug text-white sm:text-xl">
        {challenge.type === 'picture_choice' ? challenge.prompt : challenge.promptTitle}
      </h3>

      {/* ==================================================================== */}
      {/* TYPE 1: PICTURE CHOICE (3 ILLUSTRATED PEOPLE CARDS)                  */}
      {/* ==================================================================== */}
      {challenge.type === 'picture_choice' && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {challenge.options.map((opt, idx) => {
            const isElim = eliminatedChoiceIdxs.includes(idx);
            const isSelected = selectedChoiceIdx === idx;
            const isCorrectOpt = idx === challenge.correctIndex;

            let tone: RpgChoiceTone = 'default';
            if (isElim) tone = 'locked';
            else if (disabled) tone = 'muted';
            else if (phase === 'feedback') {
              if (isCorrectOpt) tone = 'correct';
              else if (isSelected && !isCorrect) tone = 'wrong';
              else tone = 'muted';
            } else if (isSelected) {
              tone = 'selected';
            }

            return (
              <RpgChoiceCard
                key={opt.vocabId}
                tone={tone}
                disabled={disabled || phase !== 'answering' || isElim}
                onClick={() => {
                  setSelectedChoiceIdx(idx);
                  soundEngine.speakEnglish(opt.label, 0.92);
                }}
                className="flex flex-col items-center justify-between gap-2 p-2 text-center sm:p-3"
              >
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-amber-900/15 bg-gradient-to-b from-[#fffdf7] to-[#fef3c7] p-1.5 shadow-inner">
                  {opt.visual ? (
                    renderVisualTile(opt.visual)
                  ) : !opt.imageSrc || brokenImages[opt.imageSrc] ? (
                    <span className="text-sm font-black text-amber-900">{opt.label}</span>
                  ) : (
                    <img
                      src={opt.imageSrc}
                      alt={opt.label}
                      referrerPolicy="no-referrer"
                      draggable={false}
                      onError={() =>
                        setBrokenImages((prev) => ({ ...prev, [opt.imageSrc]: true }))
                      }
                      className="h-full w-full select-none object-contain transition-transform duration-150"
                    />
                  )}
                </div>

                <div className="flex w-full items-center justify-between gap-1.5 px-0.5">
                  <span className="truncate text-xs font-extrabold sm:text-sm">{opt.label}</span>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border font-mono-nums text-[10px] font-black ${
                      tone === 'correct'
                        ? 'border-emerald-300 bg-emerald-600 text-white'
                        : tone === 'wrong'
                        ? 'border-rose-300 bg-rose-600 text-white'
                        : isSelected
                        ? 'border-amber-200 bg-amber-400 text-slate-950'
                        : 'border-amber-300/45 bg-slate-950/60 text-amber-200'
                    }`}
                  >
                    {idx + 1}
                  </span>
                </div>
              </RpgChoiceCard>
            );
          })}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TYPE 2: WORD BANK TRANSLATE                                          */}
      {/* ==================================================================== */}
      {challenge.type === 'word_bank_translate' && (
        <div className="space-y-3">
          {/* Character + Speech Bubble */}
          <div className="flex items-center gap-3">
            {renderPeopleAvatar(
              challenge.speakerImage,
              challenge.speakerName,
              challenge.speakerVisual,
            )}
            <div className="relative flex-1 rounded-2xl border border-amber-300/35 bg-slate-950/60 px-3.5 py-2.5 shadow-inner">
              <div className="flex items-center gap-2.5 text-sm font-bold text-white sm:text-base">
                {challenge.audioLang === 'en' && (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => soundEngine.speakEnglish(challenge.audioText, 0.9)}
                    aria-label="Putar suara kalimat"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-sky-300/50 bg-sky-500/25 text-sky-200 transition hover:bg-sky-500/40 disabled:opacity-50"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                )}
                <InteractiveSentence
                  key={challenge.id}
                  text={challenge.sourceText}
                  hints={challenge.wordHints}
                />
              </div>
              <div className="mt-1 text-[10px] font-semibold text-amber-200/65">
                Sentuh kata bergaris putus-putus untuk melihat artinya
              </div>
            </div>
          </div>

          {/* Answer Tray */}
          <div className="min-h-[56px] rounded-2xl border-2 border-dashed border-amber-300/35 bg-slate-950/50 p-2.5">
            {placedTokens.length === 0 ? (
              <div className="flex h-8 items-center justify-center text-xs font-bold text-slate-400">
                Ketuk kata di bawah untuk menyusun terjemahan...
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {placedTokens.map((tok) => (
                  <button
                    key={tok.uid}
                    type="button"
                    disabled={disabled || phase !== 'answering'}
                    onClick={() =>
                      setPlacedUids((prev) => prev.filter((id) => id !== tok.uid))
                    }
                    className="min-h-[38px] rounded-xl border-2 border-amber-300/65 bg-amber-100 px-3 py-1.5 text-xs font-extrabold text-[#3b1b06] shadow-sm transition hover:bg-white active:translate-y-0.5 disabled:opacity-80 sm:text-sm"
                  >
                    {tok.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Word Bank */}
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {bankTokens.map((tok) => {
              const isPlaced = placedUids.includes(tok.uid);
              const isElim = eliminatedTokenUids.includes(tok.uid);
              if (isPlaced || isElim) {
                return (
                  <span
                    key={tok.uid}
                    aria-hidden="true"
                    className="min-h-[38px] select-none rounded-xl border border-slate-700/50 bg-slate-900/60 px-3 py-1.5 text-xs font-extrabold text-transparent sm:text-sm"
                  >
                    {tok.text}
                  </span>
                );
              }
              return (
                <button
                  key={tok.uid}
                  type="button"
                  disabled={disabled || phase !== 'answering'}
                  onClick={() => setPlacedUids((prev) => [...prev, tok.uid])}
                  className="min-h-[38px] rounded-xl border-2 border-amber-300/40 bg-slate-900/90 px-3 py-1.5 text-xs font-extrabold text-amber-50 shadow transition hover:border-amber-300 hover:bg-slate-800 active:translate-y-0.5 disabled:opacity-50 sm:text-sm"
                >
                  {tok.text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TYPE 3: SPEAK CHALLENGE                                              */}
      {/* ==================================================================== */}
      {challenge.type === 'speak' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {renderPeopleAvatar(
              challenge.speakerImage,
              challenge.speakerName,
              challenge.speakerVisual,
            )}
            <div className="flex-1 rounded-2xl border border-amber-300/35 bg-slate-950/60 px-3.5 py-2.5 shadow-inner">
              <div className="flex items-center gap-2.5 text-sm font-bold text-white sm:text-base">
                <button
                  type="button"
                  disabled={disabled || isListening}
                  onClick={() => soundEngine.speakEnglish(challenge.targetSentence, 0.88)}
                  aria-label="Dengar contoh pengucapan"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-sky-300/50 bg-sky-500/25 text-sky-200 transition hover:bg-sky-500/40 disabled:opacity-50"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                <InteractiveSentence
                  key={challenge.id}
                  text={challenge.targetSentence}
                  hints={challenge.wordHints}
                />
              </div>
              <div className="mt-1 text-[10px] font-semibold text-amber-200/65">
                Dengar contoh atau sentuh kata untuk arti
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={disabled || phase !== 'answering' || isStoppingSpeak}
            onClick={handleStartSpeak}
            className={`flex min-h-[64px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-4 py-2.5 font-black transition ${
              phase === 'feedback' && isCorrect
                ? 'border-emerald-400 bg-emerald-950/65 text-emerald-200'
                : isListening
                ? 'border-sky-400 bg-sky-950/80 text-sky-100 shadow-[0_0_20px_rgba(56,189,248,0.35)] hover:border-rose-300'
                : 'border-amber-300/45 bg-slate-950/70 text-sky-200 hover:border-sky-400 hover:bg-slate-900/90'
            }`}
          >
            {phase === 'feedback' && isCorrect ? (
              <span className="inline-flex items-center gap-2 text-base">
                <Check className="h-6 w-6 text-emerald-400" />
                <span>Pengucapan Cocok!</span>
              </span>
            ) : isListening ? (
              <>
                <div className="flex h-7 items-center gap-1.5" aria-label="Sedang mendengarkan">
                  {waveLevels.map((lvl, idx) => (
                    <span
                      key={idx}
                      style={{ height: `${Math.round(8 + lvl * 20)}px` }}
                      className="w-1 rounded-full bg-sky-400 transition-all duration-75"
                    />
                  ))}
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-200">
                  {isStoppingSpeak ? 'MENILAI REKAMAN SUARA...' : 'KETUK UNTUK BERHENTI & NILAI'}
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider sm:text-sm">
                {speechSupported ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                <span>KLIK UNTUK BICARA</span>
              </span>
            )}
          </button>

          {spokenText && phase === 'answering' && (
            <div className="text-center text-xs font-bold text-sky-200">
              Terdengar: &ldquo;{spokenText}&rdquo;
            </div>
          )}
          {speakError && phase === 'answering' && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-950/60 px-3 py-1.5 text-center text-xs font-bold text-amber-200">
              {speakError}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TYPE 4: DIALOGUE COMPLETE                                            */}
      {/* ==================================================================== */}
      {challenge.type === 'dialogue_complete' && (
        <div className="space-y-3">
          {/* Two-person chat exchange */}
          <div className="space-y-2 rounded-2xl border border-amber-300/25 bg-slate-950/50 p-3">
            {/* Speaker A */}
            <div className="flex items-center gap-2.5">
              {renderPeopleAvatar(
                challenge.speakerAImage,
                challenge.speakerAName,
                challenge.speakerAVisual,
                'h-12 w-12 sm:h-14 sm:w-14',
              )}
              <div className="rounded-2xl border border-amber-300/30 bg-slate-900/90 px-3 py-2 text-xs font-bold text-white sm:text-sm">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => soundEngine.speakEnglish(challenge.speakerALine, 0.9)}
                    aria-label="Putar dialog"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-sky-300/45 bg-sky-500/20 text-sky-200 hover:bg-sky-500/35"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                  <InteractiveSentence
                    key={challenge.id}
                    text={challenge.speakerALine}
                    hints={challenge.speakerAHints}
                  />
                </div>
              </div>
            </div>

            {/* Speaker B (Blank -> Filled preview) */}
            <div className="flex items-center justify-end gap-2.5">
              <div
                className={`rounded-2xl border px-3.5 py-2 text-xs font-extrabold sm:text-sm ${
                  selectedChoiceIdx !== null
                    ? 'border-amber-300/60 bg-amber-500/20 text-amber-100'
                    : 'border-dashed border-slate-500/70 bg-slate-900/70 text-slate-400'
                }`}
              >
                {selectedChoiceIdx !== null
                  ? challenge.choices[selectedChoiceIdx]
                  : '__________________'}
              </div>
              {renderPeopleAvatar(
                challenge.speakerBImage,
                challenge.speakerBName,
                challenge.speakerBVisual,
                'h-12 w-12 sm:h-14 sm:w-14',
              )}
            </div>
          </div>

          {/* Reply choices */}
          <div className="space-y-2">
            {challenge.choices.map((choice, idx) => {
              const isElim = eliminatedChoiceIdxs.includes(idx);
              const isSelected = selectedChoiceIdx === idx;
              const isCorrectOpt = idx === challenge.correctIndex;

              let tone: RpgChoiceTone = 'default';
              if (isElim) tone = 'locked';
              else if (disabled) tone = 'muted';
              else if (phase === 'feedback') {
                if (isCorrectOpt) tone = 'correct';
                else if (isSelected && !isCorrect) tone = 'wrong';
                else tone = 'muted';
              } else if (isSelected) {
                tone = 'selected';
              }

              return (
                <RpgChoiceCard
                  key={`${choice}_${idx}`}
                  tone={tone}
                  disabled={disabled || phase !== 'answering' || isElim}
                  onClick={() => {
                    setSelectedChoiceIdx(idx);
                    soundEngine.speakEnglish(choice, 0.92);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-xs sm:text-sm"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono-nums text-xs font-black ${
                      tone === 'correct'
                        ? 'border-emerald-300 bg-emerald-600 text-white'
                        : tone === 'wrong'
                        ? 'border-rose-300 bg-rose-600 text-white'
                        : isSelected
                        ? 'border-amber-200 bg-amber-400 text-slate-950'
                        : 'border-amber-300/50 bg-amber-500/20 text-amber-200'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-extrabold">{choice}</span>
                </RpgChoiceCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TYPE 5: LISTEN WORD BANK (NORMAL + TURTLE SLOW AUDIO)                */}
      {/* ==================================================================== */}
      {challenge.type === 'listen_word_bank' && (
        <div className="space-y-3">
          {/* Normal + Turtle Slow Speaker Buttons */}
          <div className="flex items-end justify-center gap-3 py-1">
            <button
              type="button"
              disabled={disabled}
              onClick={() => soundEngine.speakEnglish(challenge.audioSentence, 0.9)}
              aria-label="Putar audio kecepatan normal"
              className="flex h-16 w-20 items-center justify-center rounded-2xl border-2 border-sky-300/70 bg-gradient-to-b from-sky-400 to-sky-600 text-white shadow-[0_6px_0_rgba(3,105,161,0.9)] transition hover:brightness-110 active:translate-y-0.5 disabled:opacity-50"
            >
              <Volume2 className="h-8 w-8" />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => soundEngine.speakEnglish(challenge.audioSentence, 0.55)}
              title="Putar lambat"
              aria-label="Putar audio perlahan"
              className="flex h-11 w-14 items-center justify-center rounded-2xl border-2 border-sky-300/60 bg-gradient-to-b from-sky-500 to-sky-700 text-white shadow-[0_4px_0_rgba(3,105,161,0.9)] transition hover:brightness-110 active:translate-y-0.5 disabled:opacity-50"
            >
              <Turtle className="h-5 w-5" />
            </button>
          </div>

          {/* Answer Tray */}
          <div className="min-h-[54px] rounded-2xl border-2 border-dashed border-amber-300/35 bg-slate-950/50 p-2.5">
            {placedTokens.length === 0 ? (
              <div className="flex h-8 items-center justify-center text-xs font-bold text-slate-400">
                Susun kata bahasa Inggris sesuai suara yang terdengar...
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {placedTokens.map((tok) => (
                  <button
                    key={tok.uid}
                    type="button"
                    disabled={disabled || phase !== 'answering'}
                    onClick={() =>
                      setPlacedUids((prev) => prev.filter((id) => id !== tok.uid))
                    }
                    className="min-h-[38px] rounded-xl border-2 border-amber-300/65 bg-amber-100 px-3 py-1.5 text-xs font-extrabold text-[#3b1b06] shadow-sm transition hover:bg-white active:translate-y-0.5 disabled:opacity-80 sm:text-sm"
                  >
                    {tok.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Word Bank */}
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {bankTokens.map((tok) => {
              const isPlaced = placedUids.includes(tok.uid);
              const isElim = eliminatedTokenUids.includes(tok.uid);
              if (isPlaced || isElim) {
                return (
                  <span
                    key={tok.uid}
                    aria-hidden="true"
                    className="min-h-[38px] select-none rounded-xl border border-slate-700/50 bg-slate-900/60 px-3 py-1.5 text-xs font-extrabold text-transparent sm:text-sm"
                  >
                    {tok.text}
                  </span>
                );
              }
              return (
                <button
                  key={tok.uid}
                  type="button"
                  disabled={disabled || phase !== 'answering'}
                  onClick={() => {
                    soundEngine.speakEnglish(tok.text, 0.95);
                    setPlacedUids((prev) => [...prev, tok.uid]);
                  }}
                  className="min-h-[38px] rounded-xl border-2 border-amber-300/40 bg-slate-900/90 px-3 py-1.5 text-xs font-extrabold text-amber-50 shadow transition hover:border-amber-300 hover:bg-slate-800 active:translate-y-0.5 disabled:opacity-50 sm:text-sm"
                >
                  {tok.text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TYPE 6: MATCH PAIRS (5 LEFT ID <-> 5 RIGHT EN)                       */}
      {/* ==================================================================== */}
      {challenge.type === 'match_pairs' && (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* Left Column (1-5) */}
          <div className="space-y-2">
            {leftTiles.map((tile, idx) => {
              const isMatched = matchedVocabIds.includes(tile.vocabId);
              const isSel = selSide?.side === 'left' && selSide.vocabId === tile.vocabId;
              const isWrong = wrongPairFlash?.leftId === tile.vocabId;

              let tone: RpgChoiceTone = 'default';
              if (isMatched || disabled) tone = 'muted';
              else if (isWrong) tone = 'wrong';
              else if (isSel) tone = 'selected';

              return (
                <RpgChoiceCard
                  key={`L_${tile.vocabId}`}
                  tone={tone}
                  disabled={disabled || phase !== 'answering' || isMatched}
                  onClick={() => handlePickMatchTile('left', tile)}
                  className={`flex w-full items-center gap-2 px-2.5 py-2 text-xs transition-opacity duration-300 sm:text-sm ${
                    isMatched ? 'opacity-30' : ''
                  }`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-amber-300/45 bg-slate-950/60 font-mono-nums text-[10px] font-black text-amber-200">
                    {idx + 1}
                  </span>
                  <span className="truncate font-extrabold">{tile.text}</span>
                </RpgChoiceCard>
              );
            })}
          </div>

          {/* Right Column (6-0) */}
          <div className="space-y-2">
            {rightTiles.map((tile, idx) => {
              const isMatched = matchedVocabIds.includes(tile.vocabId);
              const isSel = selSide?.side === 'right' && selSide.vocabId === tile.vocabId;
              const isWrong = wrongPairFlash?.rightId === tile.vocabId;
              const shortcut = idx === 4 ? '0' : String(idx + 6);

              let tone: RpgChoiceTone = 'default';
              if (isMatched || disabled) tone = 'muted';
              else if (isWrong) tone = 'wrong';
              else if (isSel) tone = 'selected';

              return (
                <RpgChoiceCard
                  key={`R_${tile.vocabId}`}
                  tone={tone}
                  disabled={disabled || phase !== 'answering' || isMatched}
                  onClick={() => handlePickMatchTile('right', tile)}
                  className={`flex w-full items-center gap-2 px-2.5 py-2 text-xs transition-opacity duration-300 sm:text-sm ${
                    isMatched ? 'opacity-30' : ''
                  }`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-amber-300/45 bg-slate-950/60 font-mono-nums text-[10px] font-black text-amber-200">
                    {shortcut}
                  </span>
                  <span className="truncate font-extrabold">{tile.text}</span>
                </RpgChoiceCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* BOTTOM ACTION / FEEDBACK BAR (DUOLINGO FLOW + RPG PILLS)             */}
      {/* ==================================================================== */}
      {phase === 'answering' ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-amber-300/20 pt-3">
          {allowSkip ? (
            <RpgPillButton
              variant="cream"
              size="sm"
              disabled={disabled}
              onClick={handleSkip}
            >
              <SkipForward className="h-3.5 w-3.5 shrink-0" />
              <span>
                {challenge.type === 'speak' ? 'TAK BISA BICARA SEKARANG' : 'LOMPATI'}
              </span>
            </RpgPillButton>
          ) : (
            <span />
          )}

          {challenge.type !== 'speak' && challenge.type !== 'match_pairs' && (
            <RpgPillButton
              variant="green"
              size="sm"
              disabled={!canCheck}
              onClick={handleCheck}
              className="min-w-[120px]"
            >
              <span>PERIKSA</span>
            </RpgPillButton>
          )}
        </div>
      ) : (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 px-3.5 py-2.5 ${
            isCorrect
              ? 'border-emerald-400/65 bg-emerald-950/75 text-emerald-100'
              : 'border-rose-400/65 bg-rose-950/75 text-rose-100'
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              }`}
            >
              {isCorrect ? <Check className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black">
                {wasSkipped && isCorrect
                  ? 'Dilewati sementara'
                  : isCorrect
                  ? praiseTitle
                  : 'Kurang tepat!'}
              </div>
              <div className="truncate text-xs font-bold opacity-90">{feedbackNote}</div>
            </div>
          </div>

          {onContinue && (
            <RpgPillButton
              variant={isCorrect ? 'green' : 'red'}
              size="sm"
              onClick={safeContinue}
            >
              <span>LANJUTKAN</span>
            </RpgPillButton>
          )}
        </div>
      )}
    </div>
  );
};
