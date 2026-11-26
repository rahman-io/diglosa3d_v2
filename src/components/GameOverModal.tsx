import React from 'react';
import { Flame, Home, Pause, Play, RotateCcw, Trophy } from 'lucide-react';
import { RpgHudSnapshot } from '../types/game';
import {
  RpgAvatarFrame,
  RpgBoardPanel,
  RpgNameplate,
  RpgPillButton,
} from './RpgUiKit';

interface GameOverModalProps {
  hud: RpgHudSnapshot;
  playerName?: string;
  onResume: () => void;
  onRestart: () => void;
  onQuitToTitle: () => void;
  onOpenLeaderboard: () => void;
  cloudSyncNote: string | null;
}

const STAT_PLAQUE_STYLE: React.CSSProperties = {
  borderStyle: 'solid',
  borderColor: 'transparent',
  borderWidth: '8px 10px 8px 10px',
  borderImageSource: "url('./assets/ui/ui_choice_card.png')",
  borderImageSlice: '52 52 52 52 fill',
  borderImageWidth: '8px 10px 8px 10px',
  borderImageRepeat: 'stretch',
};

export const GameOverModal: React.FC<GameOverModalProps> = ({
  hud,
  playerName,
  onResume,
  onRestart,
  onQuitToTitle,
  onOpenLeaderboard,
  cloudSyncNote,
}) => {
  if (hud.phase !== 'paused' && hud.phase !== 'gameover') return null;

  const isGameOver = hud.phase === 'gameover';
  const resolvedPlayerName = playerName?.trim() || 'Petualang';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto overscroll-contain touch-pan-y bg-[#060b16]/78 p-2 sm:p-4">
      <div className="my-auto max-h-[94dvh] w-full max-w-lg overflow-y-auto overscroll-contain touch-pan-y">
        <RpgBoardPanel>
          {/* Ornate RPG Crest / Avatar + Parchment Nameplate Header */}
          {isGameOver ? (
            <div className="flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center">
                <img
                  src="./assets/ui/icon_gameover_crest.png"
                  alt={`Emblem Nyawa ${resolvedPlayerName} Habis`}
                  className="h-20 w-20 select-none object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.75)] sm:h-24 sm:w-24"
                  draggable={false}
                />
              </div>

              <span className="mt-1 inline-block rounded-lg border border-rose-400/60 bg-rose-950/90 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-200 shadow sm:text-[11px]">
                Nyawa {resolvedPlayerName} Habis
              </span>

              {hud.defeatReason && (
                <div className="mt-1.5 max-w-full rounded-xl border border-rose-400/45 bg-rose-950/75 px-3 py-1 text-[11px] font-extrabold text-rose-100 shadow-inner sm:text-xs">
                  Penyebab <span className="text-amber-200">{hud.defeatReason}</span>
                </div>
              )}

              <RpgNameplate className="mt-2 max-w-full">
                <div className="min-w-0 text-center leading-tight">
                  <h2 className="truncate text-sm font-black tracking-tight text-[#3b1b06] sm:text-base">
                    Catatan Petualangan {resolvedPlayerName}
                  </h2>
                  <p className="truncate text-[10px] font-extrabold text-[#78350f] sm:text-[11px]">
                    Lv. {hud.level} · {hud.rankTitle}
                  </p>
                </div>
              </RpgNameplate>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 max-w-full items-center gap-2.5">
                <RpgAvatarFrame accentColor="#d97706">
                  <Pause className="h-6 w-6 text-amber-50 drop-shadow" />
                </RpgAvatarFrame>

                <RpgNameplate className="min-w-0">
                  <div className="min-w-0 leading-tight">
                    <h2 className="truncate text-sm font-black tracking-tight text-[#3b1b06] sm:text-base">
                      Menu Jeda Diglosa
                    </h2>
                    <p className="truncate text-[10px] font-extrabold text-[#78350f] sm:text-[11px]">
                      Lv. {hud.level} · {hud.rankTitle}
                    </p>
                  </div>
                </RpgNameplate>
              </div>

              <span className="ml-auto shrink-0 rounded-lg border border-amber-300/60 bg-amber-950/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200 shadow sm:text-[11px]">
                Petualangan Dijeda
              </span>
            </div>
          )}

          {/* Dark Stone & Antique Gold Stat Plaques */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
            <div style={STAT_PLAQUE_STYLE} className="rounded-xl px-2 py-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-amber-200/90">
                <img
                  src="./assets/ui/menu_trophy.png"
                  alt=""
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 object-contain"
                  draggable={false}
                />
                <span>Total Skor</span>
              </div>
              <div className="mt-1 font-mono-nums text-xl font-black text-amber-300 drop-shadow">
                {hud.score.toLocaleString('id-ID')}
              </div>
            </div>

            <div style={STAT_PLAQUE_STYLE} className="rounded-xl px-2 py-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-emerald-200/90">
                <img
                  src="./assets/ui/icon_kamus.png"
                  alt=""
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 object-contain"
                  draggable={false}
                />
                <span>Kosakata Dikuasai</span>
              </div>
              <div className="mt-1 font-mono-nums text-xl font-black text-emerald-300 drop-shadow">
                {hud.wordsMastered} Kata
              </div>
            </div>

            <div style={STAT_PLAQUE_STYLE} className="rounded-xl px-2 py-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-amber-200/90">
                <img
                  src="./assets/ui/icon_crown.png"
                  alt=""
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 object-contain"
                  draggable={false}
                />
                <span>Mahkota Raja</span>
              </div>
              <div className="mt-1 font-mono-nums text-lg font-black text-amber-200 drop-shadow">
                {hud.crowns}/6
              </div>
            </div>

            <div style={STAT_PLAQUE_STYLE} className="rounded-xl px-2 py-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-cyan-200/90">
                <Flame className="h-4 w-4 shrink-0 text-cyan-300" />
                <span>Streak Terbaik</span>
              </div>
              <div className="mt-1 font-mono-nums text-lg font-black text-cyan-300 drop-shadow">
                x{hud.maxStreak}
              </div>
            </div>
          </div>

          {cloudSyncNote && (
            <div className="mt-3.5 rounded-xl border border-emerald-400/45 bg-emerald-950/65 px-3.5 py-2 text-center text-xs font-extrabold text-emerald-200 shadow-inner">
              {cloudSyncNote}
            </div>
          )}

          {/* 9-Slice RPG Pill Actions */}
          <div className="mt-4 flex flex-col gap-2.5">
            {!isGameOver && (
              <RpgPillButton variant="green" onClick={onResume} className="w-full">
                <Play className="h-4 w-4 shrink-0 fill-current" />
                <span>Lanjutkan Petualangan</span>
              </RpgPillButton>
            )}

            <RpgPillButton
              variant={isGameOver ? 'orange' : 'gold'}
              onClick={onRestart}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 shrink-0" />
              <span>{isGameOver ? 'Mulai Petualangan Baru' : 'Ulangi dari Awal'}</span>
            </RpgPillButton>

            <RpgPillButton variant="cream" onClick={onOpenLeaderboard} className="w-full">
              <Trophy className="h-4 w-4 shrink-0 text-amber-700" />
              <span>Lihat Papan Peringkat Daring</span>
            </RpgPillButton>

            <RpgPillButton
              variant="red"
              size="sm"
              onClick={onQuitToTitle}
              className="mt-0.5 w-full"
            >
              <Home className="h-3.5 w-3.5 shrink-0" />
              <span>Kembali ke Layar Utama</span>
            </RpgPillButton>
          </div>
        </RpgBoardPanel>
      </div>
    </div>
  );
};
