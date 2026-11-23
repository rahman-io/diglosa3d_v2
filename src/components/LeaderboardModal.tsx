import React, { useState } from 'react';
import { Award, CloudUpload, LogIn, Trophy, X } from 'lucide-react';
import { User } from 'firebase/auth';
import { LeaderboardRecord, UserProfileRecord } from '../types/game';

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
  entries: LeaderboardRecord[];
  loading: boolean;
  user: User | null;
  userProfile: UserProfileRecord | null;
  currentRunScore: number;
  onSignIn: () => Promise<void>;
  onManualSync: () => Promise<void>;
  syncing: boolean;
  syncStatus: string | null;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  open,
  onClose,
  entries,
  loading,
  user,
  userProfile,
  currentRunScore,
  onSignIn,
  onManualSync,
  syncing,
  syncStatus,
}) => {
  const [authBusy, setAuthBusy] = useState(false);

  if (!open) return null;

  const handleLogin = async () => {
    setAuthBusy(true);
    try {
      await onSignIn();
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain touch-pan-y bg-[#0f172a]/70 p-2 sm:p-4">
      <div className="my-auto max-h-[92dvh] w-full max-w-xl overflow-y-auto overscroll-contain touch-pan-y rounded-3xl border border-white/15 bg-[#0f172a] text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#1e293b] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Papan Peringkat Daring</h2>
              <p className="text-xs text-slate-400">Top 20 Arsitek Metropolis Voxelia Global</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 transition hover:bg-white/20 hover:text-white"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Account & Cloud Sync Strip */}
        <div className="border-b border-white/10 bg-[#162032] px-6 py-3.5">
          {user ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                  {(user.displayName || 'B')[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{user.displayName || 'Builder'}</div>
                  <div className="font-mono-nums text-[11px] text-slate-400">
                    Rekor Cloud: {(userProfile?.bestScore ?? 0).toLocaleString('id-ID')} · Tier{' '}
                    {userProfile?.highestLevel ?? 1}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentRunScore > 0 && (
                  <button
                    type="button"
                    disabled={syncing}
                    onClick={onManualSync}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    <CloudUpload className="h-3.5 w-3.5" />
                    <span>{syncing ? 'Menyimpan...' : `Unggah (${currentRunScore.toLocaleString('id-ID')})`}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                Masuk dengan Google untuk menyimpan progres &amp; bersaing di peringkat global.
              </div>
              <button
                type="button"
                disabled={authBusy}
                onClick={handleLogin}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{authBusy ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
              </button>
            </div>
          )}
          {syncStatus && (
            <div className="mt-2 text-xs font-semibold text-emerald-300">{syncStatus}</div>
          )}
        </div>

        {/* Rankings List */}
        <div className="max-h-[52vh] overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="py-10 text-center text-sm text-slate-400">Memuat peringkat daring...</div>
          ) : entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 py-10 text-center">
              <Award className="mx-auto h-8 w-8 text-amber-400/70" />
              <p className="mt-2 text-sm font-semibold text-slate-300">Belum ada rekor tercatat.</p>
              <p className="mt-1 text-xs text-slate-400">
                Jadilah arsitek pertama yang mengunggah skor terbaikmu!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, idx) => {
                const isSelf = user?.uid === entry.uid;
                const medalColor =
                  idx === 0
                    ? 'bg-amber-400 text-slate-950'
                    : idx === 1
                    ? 'bg-slate-300 text-slate-950'
                    : idx === 2
                    ? 'bg-amber-700 text-white'
                    : 'bg-white/10 text-slate-300';
                return (
                  <div
                    key={entry.uid}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-2.5 ${
                      isSelf
                        ? 'border-cyan-400/60 bg-cyan-500/15'
                        : 'border-white/10 bg-[#1e293b]/75'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg font-mono-nums text-xs font-extrabold ${medalColor}`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-white">
                          <span>{entry.playerName}</span>
                          {isSelf && (
                            <span className="rounded bg-cyan-400/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                              KAMU
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Lv. {entry.cityLevel} · {entry.districtTitle} · {entry.landmarksCount} Kosakata · Streak x
                          {entry.maxCombo}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono-nums text-sm font-extrabold text-amber-300">
                      {entry.score.toLocaleString('id-ID')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
