import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Crown,
  Heart,
  LogOut,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { getCharacterPreset } from '../data/characterPresets';
import { QUICK_CHAT_PHRASES } from '../services/p2pMeshTransport';
import {
  MultiplayerMemberDoc,
  MultiplayerPlayerStats,
  MultiplayerRoomDoc,
  RoomChatMessage,
} from '../types/game';

interface MultiplayerHudOverlayProps {
  room: MultiplayerRoomDoc;
  members: MultiplayerMemberDoc[];
  myUid: string | null;
  connectedPeers: number;
  messages: RoomChatMessage[];
  teamStats: MultiplayerPlayerStats[];
  micEnabled: boolean;
  localSpeaking: boolean;
  muteAllVoice: boolean;
  voiceError: string | null;
  onSendChat: (text: string) => void;
  onToggleMic: () => void;
  onToggleMuteAllVoice: () => void;
  onLeaveRoom: () => void;
}

export const MultiplayerHudOverlay: React.FC<MultiplayerHudOverlayProps> = ({
  room,
  members,
  myUid,
  connectedPeers,
  messages,
  teamStats,
  micEnabled,
  localSpeaking,
  muteAllVoice,
  voiceError,
  onSendChat,
  onToggleMic,
  onToggleMuteAllVoice,
  onLeaveRoom,
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const prevMsgCountRef = useRef(messages.length);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      if (!chatOpen) {
        setUnreadCount((c) => Math.min(99, c + (messages.length - prevMsgCountRef.current)));
      }
      prevMsgCountRef.current = messages.length;
    } else if (messages.length < prevMsgCountRef.current) {
      prevMsgCountRef.current = messages.length;
    }
  }, [messages.length, chatOpen]);

  useEffect(() => {
    if (chatOpen) {
      setUnreadCount(0);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [chatOpen, messages.length]);

  useEffect(() => {
    if (!confirmLeave) return;
    const t = window.setTimeout(() => setConfirmLeave(false), 3200);
    return () => window.clearTimeout(t);
  }, [confirmLeave]);

  const sortedTeamRows = useMemo(() => {
    const byUid = new Map<string, MultiplayerPlayerStats>();
    for (const s of teamStats) {
      byUid.set(s.uid, s);
    }
    const rows: MultiplayerPlayerStats[] = members.map((m) => {
      const existing = byUid.get(m.uid);
      if (existing) return existing;
      return {
        uid: m.uid,
        displayName: m.displayName,
        characterId: m.characterId,
        kills: 0,
        assists: 0,
        helps: 0,
        challenges: 0,
        zonesCleared: 0,
        personalScore: 0,
        hp: 5,
        maxHp: 5,
        worldMode: 'overworld',
        zoneName: 'Desa Sapaan',
        inChallenge: false,
        updatedAtMs: 0,
      };
    });
    for (const s of teamStats) {
      if (!rows.some((r) => r.uid === s.uid)) {
        rows.push(s);
      }
    }
    const contribScore = (r: MultiplayerPlayerStats) =>
      r.personalScore + r.kills * 50 + (r.helps + r.assists) * 40 + r.challenges * 60;
    return rows.sort((a, b) => contribScore(b) - contribScore(a));
  }, [members, teamStats]);

  const teamTotals = useMemo(() => {
    let totalScore = 0;
    let totalKills = 0;
    let totalHelps = 0;
    let totalChallenges = 0;
    for (const r of sortedTeamRows) {
      totalScore += r.personalScore;
      totalKills += r.kills;
      totalHelps += r.helps + r.assists;
      totalChallenges += r.challenges;
    }
    return { totalScore, totalKills, totalHelps, totalChallenges };
  }, [sortedTeamRows]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = draft.trim();
    if (!clean) return;
    onSendChat(clean);
    setDraft('');
  };

  return (
    <div className="pointer-events-none fixed left-1/2 top-2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 sm:top-2.5">
      {/* Compact Top-Center Multiplayer Bar (never covers joystick or right combat cluster) */}
      <div className="pointer-events-auto flex max-w-[92vw] items-center gap-1 rounded-full border border-cyan-300/45 bg-slate-950/90 px-2 py-1 text-[10px] font-extrabold text-white shadow-xl backdrop-blur-md sm:gap-1.5 sm:px-2.5 sm:text-[11px]">
        {/* Room Code & Peers Badge */}
        <button
          type="button"
          onClick={() => void handleCopyCode()}
          title={`Salin kode room ${room.code} (${
            connectedPeers > 0
              ? `P2P langsung: ${connectedPeers}`
              : members.length > 1
              ? 'Cloud Relay aktif'
              : 'Menunggu teman'
          })`}
          className="flex items-center gap-1.5 rounded-full bg-slate-900/90 px-2 py-0.5 text-cyan-100 transition hover:bg-slate-800"
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              connectedPeers > 0
                ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                : members.length > 1
                ? 'bg-sky-400 shadow-[0_0_6px_#38bdf8]'
                : 'bg-amber-400'
            }`}
          />
          <Users className="h-3 w-3 shrink-0 text-cyan-300" />
          {room.groupName && (
            <span className="hidden max-w-[108px] truncate text-emerald-200 sm:inline">
              {room.groupName} ·
            </span>
          )}
          <span className="font-mono-nums">
            {room.mode === 'group' ? room.code : 'PUBLIK'} · {members.length}/{room.maxPlayers}
          </span>
          {copied ? (
            <Check className="h-3 w-3 text-emerald-300" />
          ) : (
            <Copy className="h-2.5 w-2.5 text-slate-400" />
          )}
        </button>

        {/* Team Scoreboard Drawer Toggle */}
        <button
          type="button"
          data-no-click-sfx="true"
          onClick={() => {
            setTeamOpen((v) => !v);
            setChatOpen(false);
          }}
          title="Buka/Tutup Nilai & Kontribusi Tim"
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 transition ${
            teamOpen
              ? 'border-amber-300 bg-amber-600/80 text-white'
              : 'border-white/15 bg-slate-900/90 text-amber-200 hover:border-amber-300/60'
          }`}
        >
          <Trophy className="h-3 w-3" />
          <span className="hidden sm:inline">Tim</span>
          <span className="font-mono-nums text-[9.5px] text-amber-100">
            {teamTotals.totalScore}
          </span>
        </button>

        {/* Chat Drawer Toggle */}
        <button
          type="button"
          data-no-click-sfx="true"
          onClick={() => {
            setChatOpen((v) => !v);
            setTeamOpen(false);
          }}
          title="Buka/Tutup Chat Tim"
          className={`relative flex items-center gap-1 rounded-full border px-2 py-0.5 transition ${
            chatOpen
              ? 'border-cyan-300 bg-cyan-600/80 text-white'
              : 'border-white/15 bg-slate-900/90 text-slate-200 hover:border-cyan-300/60'
          }`}
        >
          <MessageSquare className="h-3 w-3" />
          <span className="hidden sm:inline">Chat</span>
          {!chatOpen && unreadCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-mono-nums text-[9px] font-black text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Mabar Voice Chat Mic Toggle */}
        <button
          type="button"
          data-no-click-sfx="true"
          onClick={onToggleMic}
          title={
            micEnabled
              ? 'Matikan Mikrofon Voice Chat Mabar'
              : 'Nyalakan Mikrofon Voice Chat Mabar (P2P)'
          }
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 transition ${
            micEnabled
              ? localSpeaking
                ? 'border-emerald-200 bg-emerald-500 text-slate-950 ring-2 ring-emerald-300/70'
                : 'border-emerald-300/70 bg-emerald-700/80 text-white'
              : 'border-white/15 bg-slate-900/90 text-slate-300 hover:border-white/35'
          }`}
        >
          {micEnabled ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
          <span className="hidden sm:inline">{micEnabled ? 'Mic ON' : 'Mic'}</span>
        </button>

        {/* Mute Incoming Peer Audio Toggle */}
        <button
          type="button"
          data-no-click-sfx="true"
          onClick={onToggleMuteAllVoice}
          title={muteAllVoice ? 'Nyalakan Suara Pemain Lain' : 'Bisukan Suara Pemain Lain'}
          className={`flex items-center justify-center rounded-full border p-1 transition ${
            muteAllVoice
              ? 'border-rose-400/60 bg-rose-900/80 text-rose-200'
              : 'border-white/15 bg-slate-900/90 text-slate-200 hover:border-white/35'
          }`}
        >
          {muteAllVoice ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
        </button>

        {/* Leave Room Button (2-tap confirm to avoid misclicks) */}
        <button
          type="button"
          onClick={() => {
            if (confirmLeave) {
              setConfirmLeave(false);
              onLeaveRoom();
            } else {
              setConfirmLeave(true);
            }
          }}
          title="Keluar dari Room Multiplayer"
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 transition ${
            confirmLeave
              ? 'border-rose-300 bg-rose-600 text-white'
              : 'border-white/15 bg-slate-900/90 text-slate-300 hover:border-rose-400/60 hover:text-rose-200'
          }`}
        >
          <LogOut className="h-3 w-3" />
          <span>{confirmLeave ? 'Yakin?' : 'Keluar'}</span>
        </button>
      </div>

      {voiceError && (
        <div className="pointer-events-none rounded-full border border-rose-400/60 bg-rose-950/90 px-3 py-0.5 text-[10px] font-bold text-rose-100 shadow-lg">
          {voiceError}
        </div>
      )}

      {/* Collapsible Team Contribution & Leaderboard Drawer */}
      {teamOpen && (
        <div className="pointer-events-auto flex w-[min(365px,92vw)] flex-col gap-2 rounded-2xl border border-amber-300/40 bg-slate-950/94 p-2.5 text-white shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-[10.5px] font-black uppercase tracking-wider text-amber-200">
                {room.groupName ? `Tim · ${room.groupName}` : 'Nilai & Kontribusi Tim'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setTeamOpen(false)}
              className="rounded-md p-0.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1 rounded-xl border border-white/10 bg-slate-900/80 px-2 py-1.5 text-center text-[10px]">
            <div>
              <div className="text-[9px] font-bold text-slate-400">Skor Tim</div>
              <div className="font-mono-nums font-black text-amber-300">{teamTotals.totalScore}</div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-400">Musuh</div>
              <div className="font-mono-nums font-black text-rose-300">{teamTotals.totalKills}</div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-400">Bantu</div>
              <div className="font-mono-nums font-black text-emerald-300">{teamTotals.totalHelps}</div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-400">Kuis EN</div>
              <div className="font-mono-nums font-black text-cyan-300">{teamTotals.totalChallenges}</div>
            </div>
          </div>

          <div className="flex max-h-48 flex-col gap-1 overflow-y-auto overscroll-contain pr-0.5">
            {sortedTeamRows.map((row, idx) => {
              const isMine = myUid === row.uid;
              const isMvp = idx === 0 && (row.personalScore > 0 || row.kills > 0 || row.helps > 0 || row.challenges > 0);
              const preset = getCharacterPreset(row.characterId);
              const lowHp = row.hp > 0 && row.hp <= 2;
              return (
                <div
                  key={row.uid}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-2 py-1.5 text-[10.5px] ${
                    isMine
                      ? 'border-cyan-400/50 bg-cyan-950/45'
                      : 'border-white/10 bg-slate-900/75'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/25 text-[10px] font-black text-white"
                      style={{ backgroundColor: preset.badgeColor }}
                    >
                      {row.displayName.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="truncate font-black text-white">
                          {row.displayName}
                        </span>
                        {isMvp && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/25 px-1 py-0.5 text-[8.5px] font-black text-amber-200">
                            <Crown className="h-2.5 w-2.5" /> MVP
                          </span>
                        )}
                        {row.inChallenge && (
                          <span className="rounded bg-violet-500/30 px-1 py-0.5 text-[8.5px] font-bold text-violet-200">
                            📘 Kuis
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-300">
                        <span className={`inline-flex items-center gap-0.5 ${lowHp ? 'text-rose-300' : 'text-emerald-300'}`}>
                          <Heart className="h-2.5 w-2.5 fill-current" />
                          {row.hp}/{row.maxHp}
                        </span>
                        <span className="truncate text-slate-400">{row.zoneName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 font-mono-nums text-[10px] font-black">
                    <span title="Musuh Dikalahkan" className="text-rose-300">⚔️{row.kills}</span>
                    <span title="Bantu Teman & Assist" className="text-emerald-300">🤝{row.helps + row.assists}</span>
                    <span title="Tantangan Bahasa Inggris" className="text-cyan-300">📘{row.challenges}</span>
                    <span title="Skor Pribadi" className="text-amber-300">{row.personalScore}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center text-[9.5px] font-medium text-slate-400">
            Kuis bahasa Inggris dikerjakan mandiri · Dekati teman terluka &amp; tekan <strong className="text-emerald-300">[R]</strong> untuk menolong!
          </div>
        </div>
      )}

      {/* Collapsible Compact Chat Drawer */}
      {chatOpen && (
        <div className="pointer-events-auto flex w-[min(325px,90vw)] flex-col gap-2 rounded-2xl border border-cyan-300/40 bg-slate-950/92 p-2.5 text-white shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-200">
              Obrolan Tim ({connectedPeers > 0 ? `${connectedPeers} P2P Aktif` : members.length > 1 ? 'Cloud Relay Aktif' : 'Siaga'})
            </span>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="rounded-md p-0.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex max-h-36 min-h-[72px] flex-col gap-1 overflow-y-auto overscroll-contain pr-1 text-[11px]"
          >
            {messages.length === 0 ? (
              <div className="my-auto text-center text-[10px] font-medium text-slate-400">
                Belum ada pesan. Sapa teman atau pakai Quick Chat di bawah!
              </div>
            ) : (
              messages.map((m) => {
                if (m.source === 'system' || m.senderUid === '__SYSTEM__') {
                  return (
                    <div
                      key={m.id}
                      className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold leading-snug text-amber-200"
                    >
                      {m.text}
                    </div>
                  );
                }
                const isMine = myUid && m.senderUid === myUid;
                return (
                  <div key={m.id} className="leading-snug">
                    <span
                      className={`font-black ${isMine ? 'text-amber-300' : 'text-cyan-300'}`}
                    >
                      {m.senderName}:{' '}
                    </span>
                    <span className="text-slate-100">{m.text}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* 1-Tap Quick Chat Pills */}
          <div className="flex flex-wrap gap-1">
            {QUICK_CHAT_PHRASES.map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => onSendChat(phrase)}
                className="rounded-lg border border-cyan-400/25 bg-slate-900 px-1.5 py-0.5 text-[9.5px] font-bold text-cyan-100 transition hover:border-cyan-300 hover:bg-slate-800"
              >
                {phrase}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-1.5"
            onKeyDown={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              maxLength={150}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Ketik pesan..."
              className="min-w-0 flex-1 rounded-xl border border-white/20 bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-300/60 bg-cyan-600 text-white transition hover:bg-cyan-500 disabled:opacity-40"
              aria-label="Kirim Pesan"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
