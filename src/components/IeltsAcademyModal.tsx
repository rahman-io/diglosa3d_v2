import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ClipboardCopy,
  Headphones,
  Mic,
  PenTool,
  Play,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import {
  LISTENING_SECTIONS,
  READING_PASSAGES,
  SPEAKING_PROMPTS,
  WRITING_TASKS,
} from '../data/ieltsAcademyData';
import { scrollFieldIntoView, useVisualViewport } from '../utils/useVisualViewport';

export type AcademySkillMode = 'listening' | 'reading' | 'writing' | 'speaking' | 'full';

interface IeltsAcademyModalProps {
  skill: AcademySkillMode | null;
  onCompleteSkill: (skill: AcademySkillMode, pct: number) => void;
  onClose: () => void;
}

type SpeechRecInstance = {
  lang: string;
  interimResults: boolean;
  onresult: (ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: () => void;
  start: () => void;
  stop?: () => void;
  abort?: () => void;
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const IeltsAcademyModal: React.FC<IeltsAcademyModalProps> = ({
  skill,
  onCompleteSkill,
  onClose,
}) => {
  const [activeSkill, setActiveSkill] = useState<Exclude<AcademySkillMode, 'full'>>('listening');
  const [isFullFlow, setIsFullFlow] = useState(false);
  const [track, setTrack] = useState<'academic' | 'general'>('academic');
  const [examMode, setExamMode] = useState<'practice' | 'exam'>('practice');
  const [fullScores, setFullScores] = useState<number[]>([]);

  // Listening state
  const [listenSecIdx, setListenSecIdx] = useState(0);
  const [listenAnswers, setListenAnswers] = useState<Record<string, number>>({});
  const [showTranscript, setShowTranscript] = useState(false);

  // Reading state
  const [readPassIdx, setReadPassIdx] = useState(0);
  const [readAnswers, setReadAnswers] = useState<Record<string, string>>({});

  // Writing state
  const [writeTaskIdx, setWriteTaskIdx] = useState(0);
  const [essayText, setEssayText] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [writingHint, setWritingHint] = useState<string | null>(null);

  // Speaking state
  const [speakIdx, setSpeakIdx] = useState(0);
  const [recording, setRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [prepTimer, setPrepTimer] = useState(0);
  const [showModelAns, setShowModelAns] = useState(false);

  // Result summary
  const [summaryPct, setSummaryPct] = useState<number | null>(null);
  const vp = useVisualViewport(Boolean(skill));
  const recognitionRef = useRef<SpeechRecInstance | null>(null);

  const stopSpeechAndRec = () => {
    try {
      recognitionRef.current?.abort?.();
    } catch {
      // ignore
    }
    recognitionRef.current = null;
    setRecording(false);
    soundEngine.stopSpeech();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    if (!skill) {
      stopSpeechAndRec();
      return;
    }
    setSummaryPct(null);
    setFullScores([]);
    if (skill === 'full') {
      setIsFullFlow(true);
      setActiveSkill('listening');
    } else {
      setIsFullFlow(false);
      setActiveSkill(skill);
    }
    setListenSecIdx(0);
    setListenAnswers({});
    setShowTranscript(false);
    setReadPassIdx(0);
    setReadAnswers({});
    setWriteTaskIdx(0);
    setEssayText('');
    setWritingHint(null);
    setSpeakIdx(0);
    setSpokenText('');
    setMicError(null);
    setPrepTimer(0);
    setShowModelAns(false);
    return () => {
      stopSpeechAndRec();
    };
  }, [skill]);

  useEffect(() => {
    stopSpeechAndRec();
    setMicError(null);
    setWritingHint(null);
  }, [activeSkill, speakIdx]);

  useEffect(() => {
    if (prepTimer <= 0) return;
    const t = window.setInterval(() => {
      setPrepTimer((p) => (p <= 1 ? 0 : p - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [prepTimer]);

  if (!skill) return null;

  const filteredReadings = READING_PASSAGES.filter((p) => p.track === track);
  const filteredWritings = WRITING_TASKS.filter(
    (w) => w.track === track || w.taskNumber === 2,
  );
  const safeReadPassIdx = Math.min(readPassIdx, Math.max(0, filteredReadings.length - 1));
  const safeWriteTaskIdx = Math.min(writeTaskIdx, Math.max(0, filteredWritings.length - 1));

  const playDialogue = (lines: Array<{ speaker: 'A' | 'B'; name: string; line: string }>) => {
    if (soundEngine.isMuted()) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    lines.forEach((item) => {
      const u = new SpeechSynthesisUtterance(item.line);
      u.lang = 'en-US';
      u.rate = 0.9;
      u.pitch = item.speaker === 'A' ? 0.92 : 1.15;
      window.speechSynthesis.speak(u);
    });
  };

  const handleStartSpeechRec = () => {
    if (recording && recognitionRef.current) {
      try {
        recognitionRef.current.stop?.();
      } catch {
        recognitionRef.current.abort?.();
      }
      setRecording(false);
      return;
    }

    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRec) {
      setMicError('Browser tidak mendukung rekam suara otomatis; ketik latihan ucapanmu di kotak bawah.');
      return;
    }

    try {
      stopSpeechAndRec();
      const rec = new SpeechRec() as SpeechRecInstance;
      recognitionRef.current = rec;
      rec.lang = 'en-US';
      rec.interimResults = false;
      setMicError(null);
      setRecording(true);
      rec.onresult = (ev) => {
        const transcript = ev.results[0]?.[0]?.transcript || '';
        if (transcript.trim()) {
          setSpokenText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      rec.onerror = (ev) => {
        setRecording(false);
        recognitionRef.current = null;
        if (ev?.error === 'not-allowed' || ev?.error === 'service-not-allowed') {
          setMicError('Izin mikrofon ditolak; silakan izinkan mic atau ketik jawaban di bawah.');
        } else if (ev?.error === 'no-speech') {
          setMicError('Suara belum terdengar; coba ulangi atau ketik langsung.');
        } else {
          setMicError('Rekam suara terhenti; coba lagi atau ketik latihanmu di bawah.');
        }
      };
      rec.onend = () => {
        setRecording(false);
        recognitionRef.current = null;
      };
      rec.start();
    } catch {
      setRecording(false);
      recognitionRef.current = null;
      setMicError('Gagal memulai mikrofon; ketik jawaban latihanmu di kotak bawah.');
    }
  };

  const finishSection = (pct: number) => {
    if (isFullFlow) {
      const nextScores = [...fullScores, pct];
      setFullScores(nextScores);
      if (activeSkill === 'listening') {
        setActiveSkill('reading');
        return;
      }
      if (activeSkill === 'reading') {
        setActiveSkill('writing');
        return;
      }
      if (activeSkill === 'writing') {
        setActiveSkill('speaking');
        return;
      }
      const avg = Math.round(nextScores.reduce((a, b) => a + b, 0) / nextScores.length);
      setSummaryPct(avg);
      onCompleteSkill('full', avg);
    } else {
      setSummaryPct(pct);
      onCompleteSkill(activeSkill, pct);
    }
  };

  const submitListening = () => {
    const allQs = LISTENING_SECTIONS.flatMap((s) => s.questions);
    let ok = 0;
    allQs.forEach((q) => {
      if (listenAnswers[q.id] === q.correctIndex) ok++;
    });
    finishSection(Math.round((ok / allQs.length) * 100));
  };

  const submitReading = () => {
    const allQs = filteredReadings.flatMap((p) => p.questions);
    let ok = 0;
    allQs.forEach((q) => {
      const user = (readAnswers[q.id] || '').trim().toLowerCase();
      if (user === q.answer.trim().toLowerCase()) ok++;
    });
    finishSection(Math.round((ok / allQs.length) * 100));
  };

  const currentWritingTask = filteredWritings[safeWriteTaskIdx] || WRITING_TASKS[0];
  const essayWords = essayText
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const wordCount = essayWords.length;
  const uniqueEssayWords = new Set(essayWords).size;
  const detectedConnectors = currentWritingTask.sampleConnectors.filter((c) =>
    new RegExp(`\\b${escapeRegExp(c.toLowerCase())}\\b`, 'i').test(essayText),
  );
  const paragraphCount = essayText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean).length;

  const submitWriting = () => {
    const normEssay = essayText.trim().toLowerCase();
    const normPrompt = currentWritingTask.prompt.trim().toLowerCase();
    if (wordCount === 0) {
      setWritingHint('Tulis jawaban bahasa Inggris kamu terlebih dahulu sebelum dinilai.');
      return;
    }
    if (normPrompt && normEssay === normPrompt) {
      setWritingHint('Jangan menyalin soal langsung — tulis paragraf jawabanmu sendiri.');
      return;
    }
    setWritingHint(null);
    // Guard against single-word spam repetition using unique lexical variety factor
    const lexicalFactor =
      wordCount >= 12 ? Math.min(1, uniqueEssayWords / Math.max(8, Math.round(wordCount * 0.42))) : 1;
    const wcScore = Math.min(50, Math.round((wordCount / currentWritingTask.minWords) * 50 * lexicalFactor));
    const connScore = Math.min(30, detectedConnectors.length * 10);
    const paraScore = Math.min(20, paragraphCount * 10);
    finishSection(Math.min(100, wcScore + connScore + paraScore));
  };

  const submitSpeaking = () => {
    const spokenTokens = spokenText
      .toLowerCase()
      .replace(/[^a-z0-9'\s-]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (spokenTokens.length === 0) {
      setMicError('Rekam ucapan atau ketik latihan jawabanmu terlebih dahulu sebelum menghitung skor.');
      return;
    }
    const uniqueSpoken = new Set(spokenTokens).size;
    const variety =
      spokenTokens.length >= 10
        ? Math.min(1, uniqueSpoken / Math.max(6, Math.round(spokenTokens.length * 0.45)))
        : 1;
    const pct = Math.min(100, Math.round((spokenTokens.length / 24) * 100 * variety));
    finishSection(pct);
  };

  return (
    <div
      style={{ top: `${vp.offsetTop}px`, height: `${vp.height}px` }}
      className="fixed left-0 right-0 z-50 flex items-center justify-center overscroll-contain bg-[#0f172a]/80 p-1.5 sm:p-5"
    >
      <div className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-3xl border-4 border-[#4c1d95] bg-[#faf5ff] text-[#1e1b4b] shadow-2xl">
        {/* Header */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#ddd6fe] bg-[#ede9fe] ${
            vp.isKeyboardOpen ? 'px-3.5 py-1.5' : 'px-5 py-3'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-[#6d28d9] px-2 py-0.5 text-[10px] font-black uppercase text-white">
                Istana IELTS {isFullFlow ? '· Full Test' : ''}
              </span>
              <h2 className="truncate text-sm font-black sm:text-base">
                {activeSkill === 'listening' && 'Listening (4 Bagian / 20 Soal)'}
                {activeSkill === 'reading' && 'Reading (3 Bacaan / 15 Soal)'}
                {activeSkill === 'writing' && 'Writing (Analisis Kata & Struktur)'}
                {activeSkill === 'speaking' && 'Speaking (3 Bagian / 7 Prompt)'}
              </h2>
            </div>
            {!vp.isKeyboardOpen && (
              <div className="mt-1 flex items-center gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setTrack((t) => (t === 'academic' ? 'general' : 'academic'));
                    setReadPassIdx(0);
                    setWriteTaskIdx(0);
                  }}
                  className="rounded-md border border-[#7c3aed] bg-white px-2 py-0.5 text-[#5b21b6]"
                >
                  Jalur {track === 'academic' ? 'Academic' : 'General Training'}
                </button>
                <button
                  type="button"
                  onClick={() => setExamMode((m) => (m === 'practice' ? 'exam' : 'practice'))}
                  className="rounded-md border border-[#7c3aed] bg-white px-2 py-0.5 text-[#5b21b6]"
                >
                  Mode {examMode === 'practice' ? 'Latihan' : 'Ujian'}
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#4c1d95] hover:bg-[#ddd6fe] sm:h-9 sm:w-9"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y p-3.5 sm:p-5">
          {summaryPct !== null ? (
            <div className="space-y-4 py-6 text-center">
              <CheckCircle2
                className={`mx-auto h-14 w-14 ${
                  summaryPct >= 70 ? 'text-emerald-600' : 'text-amber-500'
                }`}
              />
              <h3 className="text-3xl font-black">{summaryPct}%</h3>
              <p className="text-sm font-extrabold">
                {summaryPct >= 70
                  ? 'LULUS A1! Kamu menaklukkan ujian Istana IELTS!'
                  : 'Terus berlatih! Target kelulusan Akademi adalah ≥ 70%.'}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl bg-[#6d28d9] px-8 py-3 text-sm font-black text-white shadow hover:bg-[#5b21b6]"
              >
                Kembali ke Istana
              </button>
            </div>
          ) : activeSkill === 'listening' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {LISTENING_SECTIONS.map((sec, i) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setListenSecIdx(i)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-extrabold ${
                      listenSecIdx === i
                        ? 'bg-[#6d28d9] text-white'
                        : 'border border-[#ddd6fe] bg-white text-[#4c1d95]'
                    }`}
                  >
                    Bagian {i + 1}
                  </button>
                ))}
              </div>

              {(() => {
                const sec = LISTENING_SECTIONS[listenSecIdx];
                return (
                  <div className="space-y-3">
                    <div className="rounded-2xl border-2 border-[#ddd6fe] bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-black">{sec.title}</div>
                          <div className="text-xs text-[#5b21b6]">{sec.context}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => playDialogue(sec.dialogue)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-black text-white hover:bg-sky-500"
                          >
                            <Headphones className="h-4 w-4" />
                            <span>Putar Dialog</span>
                          </button>
                          {examMode === 'practice' && (
                            <button
                              type="button"
                              onClick={() => setShowTranscript((s) => !s)}
                              className="rounded-xl border border-[#7c3aed] px-3 py-2 text-xs font-bold"
                            >
                              {showTranscript ? 'Tutup Transkrip' : 'Lihat Transkrip'}
                            </button>
                          )}
                        </div>
                      </div>

                      {showTranscript && examMode === 'practice' && (
                        <div className="mt-3 space-y-1 rounded-xl bg-[#f5f3ff] p-3 text-xs">
                          {sec.dialogue.map((d, i) => (
                            <div key={i}>
                              <strong>{d.name}</strong> berkata, &ldquo;{d.line}&rdquo;
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {sec.questions.map((q, qi) => (
                      <div key={q.id} className="rounded-2xl border border-[#ddd6fe] bg-white p-3.5">
                        <div className="text-xs font-extrabold">
                          {qi + 1}. {q.prompt}
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                          {q.choices.map((c, ci) => (
                            <button
                              key={ci}
                              type="button"
                              onClick={() =>
                                setListenAnswers((prev) => ({ ...prev, [q.id]: ci }))
                              }
                              className={`rounded-lg border px-3 py-2 text-left text-xs font-bold ${
                                listenAnswers[q.id] === ci
                                  ? 'border-[#6d28d9] bg-[#ede9fe] text-[#4c1d95]'
                                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={submitListening}
                className="w-full rounded-2xl bg-[#6d28d9] py-3 text-sm font-black text-white hover:bg-[#5b21b6]"
              >
                {isFullFlow ? 'Selesai Listening → Lanjut Reading' : 'Kirim Jawaban Listening'}
              </button>
            </div>
          ) : activeSkill === 'reading' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {filteredReadings.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setReadPassIdx(i)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-extrabold ${
                      safeReadPassIdx === i
                        ? 'bg-emerald-600 text-white'
                        : 'border border-[#ddd6fe] bg-white text-[#4c1d95]'
                    }`}
                  >
                    Bacaan {i + 1}
                  </button>
                ))}
              </div>

              {(() => {
                const p = filteredReadings[safeReadPassIdx];
                if (!p) return null;
                return (
                  <div className="space-y-3">
                    <div className="rounded-2xl border-2 border-[#ddd6fe] bg-white p-4">
                      <div className="flex items-center gap-2 text-sm font-black">
                        <BookOpen className="h-4 w-4 text-emerald-600" />
                        <span>{p.title}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-800">{p.passage}</p>
                    </div>
                    {p.questions.map((q, qi) => (
                      <div key={q.id} className="rounded-2xl border border-[#ddd6fe] bg-white p-3.5">
                        <div className="text-xs font-extrabold">
                          {qi + 1}. {q.prompt}
                        </div>
                        {q.choices ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {q.choices.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() =>
                                  setReadAnswers((prev) => ({ ...prev, [q.id]: c }))
                                }
                                className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                                  readAnswers[q.id] === c
                                    ? 'border-emerald-600 bg-emerald-100 text-emerald-950'
                                    : 'border-slate-200 bg-slate-50'
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={readAnswers[q.id] || ''}
                            onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                            onChange={(e) =>
                              setReadAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                            }
                            placeholder="Ketik jawaban singkat..."
                            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={submitReading}
                className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-500"
              >
                {isFullFlow ? 'Selesai Reading → Lanjut Writing' : 'Kirim Jawaban Reading'}
              </button>
            </div>
          ) : activeSkill === 'writing' ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                {filteredWritings.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setWriteTaskIdx(i)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-extrabold ${
                      safeWriteTaskIdx === i ? 'bg-amber-600 text-white' : 'bg-white text-amber-900'
                    }`}
                  >
                    Task {t.taskNumber}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border-2 border-[#ddd6fe] bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-black">
                  <PenTool className="h-4 w-4 text-amber-600" />
                  <span>{currentWritingTask.title}</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-800">{currentWritingTask.prompt}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {currentWritingTask.tips.map((tip, i) => (
                    <span key={i} className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                      • {tip}
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                rows={vp.isKeyboardOpen ? 4 : 7}
                value={essayText}
                onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                onChange={(e) => {
                  setEssayText(e.target.value);
                  if (writingHint) setWritingHint(null);
                }}
                placeholder="Tulis paragraf bahasa Inggris kamu di sini..."
                className="w-full rounded-2xl border-2 border-[#c4b5fd] bg-white p-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              {writingHint && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                  {writingHint}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-2 text-xs font-extrabold">
                <span>
                  Kata {wordCount}/{currentWritingTask.minWords}
                </span>
                <span>Paragraf {paragraphCount}</span>
                <span>
                  Kata Sambung ({detectedConnectors.length}) · {detectedConnectors.join(', ') || '-'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const p = `Evaluasi IELTS Writing (${currentWritingTask.title})\nTopik yaitu ${currentWritingTask.prompt}\nJawaban saya adalah\n${essayText}`;
                    navigator.clipboard?.writeText(p).catch(() => {});
                    setCopiedPrompt(true);
                    window.setTimeout(() => setCopiedPrompt(false), 1800);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#ede9fe] px-2.5 py-1 text-[#5b21b6]"
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  <span>{copiedPrompt ? 'Tersalin!' : 'Salin Prompt'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={submitWriting}
                className="w-full rounded-2xl bg-amber-600 py-3 text-sm font-black text-white hover:bg-amber-500"
              >
                {isFullFlow ? 'Selesai Writing → Lanjut Speaking' : 'Kirim & Nilai Writing'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {SPEAKING_PROMPTS.map((sp, i) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => {
                      setSpeakIdx(i);
                      setShowModelAns(false);
                    }}
                    className={`rounded-xl px-2.5 py-1 text-xs font-extrabold ${
                      speakIdx === i ? 'bg-pink-600 text-white' : 'bg-white text-pink-900'
                    }`}
                  >
                    P{sp.part}.{i + 1}
                  </button>
                ))}
              </div>

              {(() => {
                const sp = SPEAKING_PROMPTS[speakIdx];
                return (
                  <div className="space-y-3 rounded-2xl border-2 border-[#ddd6fe] bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-pink-100 px-2 py-0.5 text-xs font-black text-pink-900">
                        {sp.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => soundEngine.speakEnglish(sp.prompt)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>Dengar Soal</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrepTimer(sp.prepSec)}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 font-mono-nums text-xs font-bold text-amber-900"
                        >
                          <Play className="h-3 w-3" />
                          <span>{prepTimer > 0 ? `${prepTimer}s` : `Timer ${sp.prepSec}s`}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-base font-black">{sp.prompt}</p>
                    {sp.bulletPoints && (
                      <ul className="list-disc space-y-0.5 pl-5 text-xs font-semibold text-slate-700">
                        {sp.bulletPoints.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleStartSpeechRec}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black text-white ${
                          recording ? 'bg-rose-600' : 'bg-pink-600 hover:bg-pink-500'
                        }`}
                      >
                        {recording ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                        <span>{recording ? 'Stop Rekam' : 'Rekam Suara (Mic)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowModelAns((s) => !s)}
                        className="rounded-xl border border-pink-300 px-3 py-2 text-xs font-bold text-pink-900"
                      >
                        {showModelAns ? 'Sembunyikan Contoh' : 'Lihat Contoh Jawaban'}
                      </button>
                    </div>

                    {micError && (
                      <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                        {micError}
                      </div>
                    )}

                    <textarea
                      rows={3}
                      value={spokenText}
                      onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                      onChange={(e) => {
                        setSpokenText(e.target.value);
                        if (micError) setMicError(null);
                      }}
                      placeholder="Transkrip ucapanmu muncul di sini (atau ketik latihan jawaban)..."
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
                    />

                    {showModelAns && (
                      <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-950">
                        <strong>Model Answer</strong> · {sp.modelAnswer}
                      </div>
                    )}
                  </div>
                );
              })()}

              <button
                type="button"
                onClick={submitSpeaking}
                className="w-full rounded-2xl bg-pink-600 py-3 text-sm font-black text-white hover:bg-pink-500"
              >
                Selesai Speaking &amp; Hitung Skor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
