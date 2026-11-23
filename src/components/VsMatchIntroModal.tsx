import React, { useEffect, useMemo } from 'react';
import { BookOpen, Crown, RefreshCw, Shield, Sparkles, Swords, Trophy } from 'lucide-react';
import { getCharacterPreset } from '../data/characterPresets';
import { CharacterPresetId, WaveMissionState } from '../types/game';
import { getSquadPortraits } from '../utils/squadPortraits';

export interface VsSquadMember {
  uid: string;
  displayName: string;
  characterId: CharacterPresetId;
  isHost?: boolean;
  isMe?: boolean;
}

interface VsMatchIntroModalProps {
  open: boolean;
  variant: 'intro' | 'victory';
  squadName: string;
  isMultiplayer: boolean;
  canStartNewWave?: boolean;
  members: VsSquadMember[];
  wave: WaveMissionState | null;
  onEnterBattle?: () => void;
  onContinueWorld?: () => void;
  onNewWave?: () => void;
}

const TIER_STYLES: Record<
  'giant' | 'large' | 'medium' | 'small',
  { badge: string; border: string; glow: string }
> = {
  giant: {
    badge: 'bg-gradient-to-r from-amber-500 to-rose-600 text-white border-amber-200/80',
    border: 'border-amber-400/75',
    glow: 'from-amber-500/30 via-rose-900/40 to-slate-950/95',
  },
  large: {
    badge: 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-fuchsia-200/75',
    border: 'border-fuchsia-400/70',
    glow: 'from-fuchsia-500/25 via-purple-950/45 to-slate-950/95',
  },
  medium: {
    badge: 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-sky-200/70',
    border: 'border-sky-400/65',
    glow: 'from-sky-500/25 via-indigo-950/45 to-slate-950/95',
  },
  small: {
    badge: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-200/70',
    border: 'border-emerald-400/60',
    glow: 'from-emerald-500/20 via-teal-950/45 to-slate-950/95',
  },
};

export const VsMatchIntroModal: React.FC<VsMatchIntroModalProps> = ({
  open,
  variant,
  squadName,
  isMultiplayer,
  canStartNewWave = true,
  members,
  wave,
  onEnterBattle,
  onContinueWorld,
  onNewWave,
}) => {
  const featuredMonsters = useMemo(() => {
    if (!wave) return [];
    return wave.monsterGroups.slice(0, 8);
  }, [wave]);

  const portraits = useMemo(() => {
    if (!open || !wave) {
      return { heroes: {}, monsters: {} };
    }
    const heroIds = Array.from(new Set(members.map((m) => m.characterId)));
    const monsterTypes = Array.from(new Set(featuredMonsters.map((g) => g.type)));
    return getSquadPortraits(heroIds, monsterTypes);
  }, [open, wave, members, featuredMonsters]);

  useEffect(() => {
    if (!open || variant !== 'intro' || !onEnterBattle) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
        e.preventDefault();
        onEnterBattle();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, variant, onEnterBattle]);

  if (!open || !wave) return null;

  const displaySquadName = (squadName || wave.squadName || 'ELITE SQUAD').trim().toUpperCase();
  const extraSpeciesCount = Math.max(0, wave.monsterGroups.length - featuredMonsters.length);

  if (variant === 'victory') {
    return (
      <div className="fixed inset-0 z-[65] flex items-center justify-center overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_50%_20%,rgba(245,158,11,0.28),rgba(4,9,22,0.94))] p-3 backdrop-blur-md">
        <div className="w-full max-w-2xl rounded-2xl border-2 border-amber-300/65 bg-gradient-to-b from-[#132345] to-[#070f21] p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.88)] sm:p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-amber-300/75 bg-amber-500/20 shadow-[0_0_30px_rgba(251,191,36,0.35)]">
              <Trophy className="h-9 w-9 text-amber-300" />
            </div>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/60 bg-emerald-500/20 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Misi Gelombang Tuntas!</span>
            </span>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white drop-shadow sm:text-3xl">
              {displaySquadName} MENANG!
            </h2>
            <p className="mt-1 text-xs font-bold text-slate-200 sm:text-sm">
              Seluruh{' '}
              <span className="font-mono-nums font-black text-amber-300">
                {wave.total}/{wave.total} Monster Acak
              </span>{' '}
              berhasil ditaklukkan di Kepulauan Diglosa!
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/12 bg-slate-950/70 p-3 text-center">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Monster Dihabisi
              </div>
              <div className="font-mono-nums text-lg font-black text-emerald-300">
                {wave.defeated}/{wave.total}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tantangan A1 &amp; Duel
              </div>
              <div className="font-mono-nums text-sm font-black text-cyan-200 sm:text-base">
                📘 {wave.quizTotal} · ⚔️ {wave.combatTotal}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Bonus Misi
              </div>
              <div className="font-mono-nums text-sm font-black text-amber-300 sm:text-base">
                +150 XP · +5 💎
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] font-medium leading-relaxed text-slate-300">
            Kamu bebas melanjutkan petualangan menaklukkan <strong>6 Gua Penjaga</strong>,{' '}
            <strong>6 Penunggu Bos (6 Mahkota)</strong>, Lautan, &amp; kosakata A1, atau acak
            gelombang baru berisi 20–50 monster!
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onContinueWorld}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-300/70 bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-xs font-black text-white shadow-lg transition hover:brightness-110 sm:text-sm"
            >
              <Shield className="h-4 w-4" />
              <span>Lanjut Jelajah (6 Gua &amp; 6 Penunggu)</span>
            </button>

            {canStartNewWave && onNewWave && (
              <button
                type="button"
                onClick={onNewWave}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-300/75 bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-xs font-black text-slate-950 shadow-lg transition hover:brightness-110 sm:text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Gelombang Acak Baru (20–50 Monster)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-between overflow-y-auto overscroll-contain bg-[radial-gradient(ellipse_at_top,rgba(30,64,175,0.65),rgba(4,9,22,0.97)_55%,rgba(12,24,54,0.98))] p-2.5 text-white backdrop-blur-md sm:p-5">
      {/* Top Row: MONSTER SQUAD cards (left/center) + Bold "MONSTER SQUAD" title (right), matching VS Splash layout */}
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-stretch gap-2 overflow-x-auto pb-1 md:w-auto md:flex-1">
          {featuredMonsters.map((group) => {
            const st = TIER_STYLES[group.tier];
            const portraitUrl = portraits.monsters[group.type];
            return (
              <div
                key={group.type}
                className={`relative flex h-36 w-24 shrink-0 flex-col justify-between overflow-hidden rounded-xl border-2 bg-gradient-to-b ${st.glow} ${st.border} shadow-[0_10px_28px_rgba(0,0,0,0.65)] sm:h-44 sm:w-28`}
              >
                {/* Top tier badge + count */}
                <div className="relative z-10 flex items-center justify-between gap-1 p-1">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider border ${st.badge}`}
                  >
                    {group.tierLabel}
                  </span>
                  <span className="rounded bg-slate-950/90 px-1.5 py-0.5 font-mono-nums text-[10px] font-black text-amber-300 ring-1 ring-amber-300/40">
                    ×{group.count}
                  </span>
                </div>

                {/* 3D Monster Portrait */}
                <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                  {portraitUrl ? (
                    <img
                      src={portraitUrl}
                      alt={group.name}
                      className="h-full w-full scale-110 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.85)]"
                      draggable={false}
                    />
                  ) : (
                    <Swords className="h-8 w-8 text-rose-300/80" />
                  )}
                </div>

                {/* Bottom Name + Quiz indicator */}
                <div className="relative z-10 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent px-1.5 pb-1.5 pt-2 text-center">
                  <div className="truncate text-[10px] font-black leading-tight text-white">
                    {group.name}
                  </div>
                  <div className="mt-0.5 flex items-center justify-center gap-1 font-mono-nums text-[8.5px] font-bold">
                    {group.quizCount > 0 && (
                      <span className="text-violet-300">📘{group.quizCount}</span>
                    )}
                    {group.combatCount > 0 && (
                      <span className="text-rose-300">⚔️{group.combatCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {extraSpeciesCount > 0 && (
            <div className="flex h-36 w-20 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-rose-300/40 bg-slate-950/70 p-2 text-center sm:h-44">
              <span className="font-mono-nums text-lg font-black text-amber-300">
                +{extraSpeciesCount}
              </span>
              <span className="mt-0.5 text-[9.5px] font-extrabold uppercase text-slate-300">
                Jenis Lain
              </span>
            </div>
          )}
        </div>

        {/* Right Title: MONSTER SQUAD */}
        <div className="flex shrink-0 flex-col items-center text-center md:items-end md:pl-4 md:text-right">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/50 bg-rose-950/75 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-rose-200">
            <Swords className="h-3 w-3" />
            <span>Pasukan Acak Kepulauan</span>
          </div>
          <h2 className="mt-1 text-3xl font-black uppercase leading-none tracking-tight text-white [text-shadow:0_4px_0_#020617,0_0_24px_rgba(244,63,94,0.45)] sm:text-4xl lg:text-5xl">
            MONSTER
            <br className="hidden md:inline" /> SQUAD
          </h2>
          <div className="mt-1.5 font-mono-nums text-xs font-black tracking-wide text-amber-300 sm:text-sm">
            {wave.total} MONSTER WAJIB DIHABISI
          </div>
        </div>
      </div>

      {/* Center VS Beam + VS Badge + Mission Summary */}
      <div className="relative my-2 flex w-full flex-col items-center justify-center sm:my-3">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_22px_#38bdf8]" />
        <div className="pointer-events-none absolute inset-x-8 top-1/2 h-3 -translate-y-1/2 bg-gradient-to-r from-transparent via-sky-500/35 to-transparent blur-sm" />

        <div className="relative z-10 flex flex-col items-center gap-1.5">
          <img
            src="./assets/ui/ui_vs_badge.png"
            alt="VS"
            className="h-14 w-auto object-contain drop-shadow-[0_6px_22px_rgba(251,146,60,0.75)] sm:h-16"
            draggable={false}
          />
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-amber-300/60 bg-slate-950/95 px-4 py-1 text-center shadow-[0_0_24px_rgba(0,0,0,0.85)]">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 sm:text-xs">
              🎯 MISI WAJIB: HABISI {wave.total} MONSTER ACAK
            </span>
            <span className="hidden text-slate-500 sm:inline">|</span>
            <span className="inline-flex items-center gap-2 font-mono-nums text-[10px] font-extrabold text-slate-200 sm:text-[11px]">
              <span className="inline-flex items-center gap-1 text-violet-300">
                <BookOpen className="h-3 w-3" /> {wave.quizTotal} Kata A1
              </span>
              <span className="text-slate-500">·</span>
              <span className="inline-flex items-center gap-1 text-rose-300">
                <Swords className="h-3 w-3" /> {wave.combatTotal} Duel
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-300">🏰 6 Gua &amp; 6 Penunggu</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Bold Squad/Group Name (left) + Player/Team Hero Portrait Cards (right) */}
      <div className="mx-auto flex w-full max-w-6xl flex-col-reverse items-center gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left Title: Squad / Group Name */}
        <div className="flex shrink-0 flex-col items-center text-center md:items-start md:pr-4 md:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-950/75 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-200">
            <Shield className="h-3 w-3" />
            <span>{isMultiplayer ? `Tim Multiplayer (${members.length} Pemain)` : 'Petualang Solo'}</span>
          </div>
          <h2 className="mt-1 max-w-xs break-words text-3xl font-black uppercase leading-none tracking-tight text-white [text-shadow:0_4px_0_#020617,0_0_24px_rgba(16,185,129,0.45)] sm:max-w-sm sm:text-4xl lg:text-5xl">
            {displaySquadName}
          </h2>
          <p className="mt-1 text-[11px] font-bold text-cyan-200">
            608 Kosakata A1 aktif di seluruh pulau &amp; 6 gua!
          </p>
        </div>

        {/* Hero Portrait Cards */}
        <div className="flex w-full items-stretch justify-center gap-2 overflow-x-auto pb-1 md:w-auto md:flex-1 md:justify-end">
          {members.map((member) => {
            const preset = getCharacterPreset(member.characterId);
            const heroUrl = portraits.heroes[member.characterId];
            return (
              <div
                key={member.uid}
                className={`relative flex h-36 w-24 shrink-0 flex-col justify-between overflow-hidden rounded-xl border-2 bg-gradient-to-b from-cyan-500/25 via-slate-900/80 to-slate-950/95 shadow-[0_10px_28px_rgba(0,0,0,0.65)] sm:h-44 sm:w-28 ${
                  member.isMe ? 'border-cyan-300 ring-2 ring-cyan-400/50' : 'border-emerald-400/65'
                }`}
              >
                <div className="relative z-10 flex items-center justify-between gap-1 p-1">
                  <span className="inline-flex items-center gap-0.5 rounded border border-emerald-200/70 bg-gradient-to-r from-emerald-500 to-teal-600 px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-white">
                    {member.isHost && <Crown className="h-2.5 w-2.5 text-amber-200" />}
                    <span>{member.isHost ? 'HOST' : 'ELITE'}</span>
                  </span>
                  {member.isMe && (
                    <span className="rounded bg-cyan-500/30 px-1.5 py-0.5 text-[8.5px] font-black text-cyan-100">
                      KAMU
                    </span>
                  )}
                </div>

                <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                  {heroUrl ? (
                    <img
                      src={heroUrl}
                      alt={member.displayName}
                      className="h-full w-full scale-110 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.85)]"
                      draggable={false}
                    />
                  ) : (
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 text-xl font-black text-white"
                      style={{ backgroundColor: preset.badgeColor }}
                    >
                      {member.displayName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="relative z-10 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent px-1.5 pb-1.5 pt-2 text-center">
                  <div className="truncate text-[10.5px] font-black leading-tight text-white">
                    {member.displayName}
                  </div>
                  <div className="truncate text-[8.5px] font-bold text-cyan-300">
                    {preset.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Enter Battle CTA */}
      <div className="mx-auto mt-2 flex w-full max-w-md flex-col items-center gap-1.5 sm:mt-3">
        <button
          type="button"
          onClick={onEnterBattle}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-amber-200/80 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-950 shadow-[0_8px_28px_rgba(245,158,11,0.45)] transition hover:brightness-110 active:translate-y-0.5 sm:text-base"
        >
          <Swords className="h-5 w-5" />
          <span>TERJUN KE PERTEMPURAN!</span>
        </button>
      </div>
    </div>
  );
};
