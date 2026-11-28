import React, { useEffect, useState } from 'react';
import { ChevronRight, Compass, Flame, Heart, X } from 'lucide-react';
import { DifficultyMode } from '../types/game';

interface DifficultyModeModalProps {
  open: boolean;
  initialDifficulty: DifficultyMode;
  onConfirm: (difficulty: DifficultyMode) => void;
  onCancel: () => void;
}

interface DifficultyCardSpec {
  id: DifficultyMode;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  accentHex: string;
  borderSelected: string;
  glowClass: string;
  badgeClass: string;
  bottomBarClass: string;
  iconBgClass: string;
  highlights: string[];
  Icon: React.ComponentType<{ className?: string }>;
}

const DIFFICULTY_CARDS: DifficultyCardSpec[] = [
  {
    id: 'santai',
    title: 'Santai',
    subtitle: 'Belajar & Eksplorasi',
    badge: 'RAMAH PEMULA',
    image: './assets/aistudio/Easy_e28c90a2.jpeg',
    accentHex: '#4ade80',
    borderSelected: 'border-emerald-300 ring-2 ring-emerald-400/80',
    glowClass: 'shadow-[0_0_32px_rgba(74,222,128,0.35)]',
    badgeClass: 'border-emerald-300/60 bg-emerald-500/25 text-emerald-200',
    bottomBarClass: 'from-emerald-400 via-teal-300 to-emerald-400',
    iconBgClass: 'border-emerald-300/60 bg-emerald-500/25 text-emerald-200',
    highlights: [
      '6 ❤️ awal · Regen cepat 55 dtk',
      '20 monster gua · 0 penembak',
      'Timer kuis 20 dtk · Duel bebas waktu',
    ],
    Icon: Heart,
  },
  {
    id: 'petualang',
    title: 'Petualang',
    subtitle: 'Seimbang & Seru',
    badge: 'STANDAR',
    image: './assets/aistudio/Medium_868df2a3.jpeg',
    accentHex: '#38bdf8',
    borderSelected: 'border-sky-300 ring-2 ring-cyan-400/85',
    glowClass: 'shadow-[0_0_34px_rgba(56,189,248,0.4)]',
    badgeClass: 'border-sky-300/60 bg-sky-500/25 text-sky-100',
    bottomBarClass: 'from-sky-400 via-cyan-300 to-amber-300',
    iconBgClass: 'border-sky-300/60 bg-sky-500/25 text-sky-100',
    highlights: [
      '5 ❤️ awal · 1 monster penembak',
      '30 monster gua (darat, terbang, air)',
      'Timer kuis 12 dtk · Bonus Skor 1.25x',
    ],
    Icon: Compass,
  },
  {
    id: 'pendekar',
    title: 'Pendekar',
    subtitle: 'Tantangan & Skor Tinggi',
    badge: 'TANTANGAN',
    image: './assets/aistudio/Hard_9eb17eeb.jpeg',
    accentHex: '#f97316',
    borderSelected: 'border-amber-300 ring-2 ring-orange-400/85',
    glowClass: 'shadow-[0_0_36px_rgba(249,115,22,0.42)]',
    badgeClass: 'border-orange-300/65 bg-orange-500/25 text-amber-100',
    bottomBarClass: 'from-amber-400 via-orange-500 to-rose-500',
    iconBgClass: 'border-orange-300/60 bg-orange-500/25 text-amber-200',
    highlights: [
      '4 ❤️ awal · 2 penembak cepat',
      '40 monster gua · Gerak 1.3x cepat',
      'Kuis 8 dtk · Duel 12 dtk · Skor & XP 1.5x',
    ],
    Icon: Flame,
  },
];

const ORDER: DifficultyMode[] = ['santai', 'petualang', 'pendekar'];

export const DifficultyModeModal: React.FC<DifficultyModeModalProps> = ({
  open,
  initialDifficulty,
  onConfirm,
  onCancel,
}) => {
  const [selected, setSelected] = useState<DifficultyMode>(initialDifficulty);

  useEffect(() => {
    if (open) setSelected(initialDifficulty);
  }, [open, initialDifficulty]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.code === 'Enter') {
        e.preventDefault();
        onConfirm(selected);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setSelected((prev) => {
          const idx = ORDER.indexOf(prev);
          return ORDER[(idx + ORDER.length - 1) % ORDER.length];
        });
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setSelected((prev) => {
          const idx = ORDER.indexOf(prev);
          return ORDER[(idx + 1) % ORDER.length];
        });
      } else if (e.code === 'Digit1') {
        setSelected('santai');
      } else if (e.code === 'Digit2') {
        setSelected('petualang');
      } else if (e.code === 'Digit3') {
        setSelected('pendekar');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel, onConfirm, selected]);

  if (!open) return null;

  const activeSpec =
    DIFFICULTY_CARDS.find((card) => card.id === selected) || DIFFICULTY_CARDS[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_50%_20%,rgba(30,58,138,0.58),rgba(4,9,22,0.96))] p-3 sm:p-5">
      <div className="my-auto flex w-full max-w-5xl flex-col gap-3 sm:gap-4">
        {/* Top Lobby Header */}
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="inline-flex shrink-0 items-center rounded-lg border border-sky-300/35 bg-sky-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-200 sm:text-xs">
              Petualangan Baru
            </span>
            <h2 className="truncate text-base font-black tracking-tight text-white drop-shadow sm:text-xl">
              Pilih Mode Permainan
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Tutup"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-slate-900/75 text-slate-100 transition hover:border-white/50 hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 3 Portrait Mode Cards (Lobby Style) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {DIFFICULTY_CARDS.map((card) => {
            const isSelected = selected === card.id;
            const Icon = card.Icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelected(card.id)}
                onDoubleClick={() => onConfirm(card.id)}
                className={`group relative flex min-h-[210px] flex-col justify-between overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 sm:min-h-[340px] md:min-h-[395px] ${
                  isSelected
                    ? `${card.borderSelected} ${card.glowClass} scale-[1.015] brightness-105`
                    : 'border-white/20 opacity-85 hover:border-white/45 hover:opacity-100'
                }`}
              >
                {/* Full-bleed Artwork */}
                <img
                  src={card.image}
                  alt={card.title}
                  className={`absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 ${
                    isSelected ? 'scale-105' : 'group-hover:scale-105'
                  }`}
                />

                {/* Top & Bottom Atmospheric Gradient */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/65 via-transparent to-[#040918]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#030714] via-[#050b1d]/90 to-transparent" />

                {/* Top Badge Row */}
                <div className="relative z-10 flex items-center justify-between gap-2 p-3 sm:p-3.5">
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black tracking-wider ${card.badgeClass}`}
                  >
                    {card.badge}
                  </span>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border ${card.iconBgClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </div>

                {/* Bottom Card Title & Stats */}
                <div className="relative z-10 mt-auto p-3.5 sm:p-4">
                  <div className="text-[11px] font-bold tracking-wide text-slate-200/90">
                    {card.subtitle}
                  </div>
                  <div className="mt-0.5 text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] sm:text-[26px]">
                    {card.title}
                  </div>

                  <ul className="mt-2.5 space-y-1 border-t border-white/15 pt-2 text-[11px] font-semibold leading-snug text-slate-100/95">
                    {card.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: card.accentHex }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Glowing Bottom Edge Strip when Active */}
                <div
                  className={`relative z-10 h-1.5 w-full bg-gradient-to-r transition-opacity ${card.bottomBarClass} ${
                    isSelected ? 'opacity-100' : 'opacity-25 group-hover:opacity-65'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Footer Action Bar */}
        <div className="flex flex-col items-center justify-between gap-2.5 rounded-2xl border border-white/15 bg-slate-950/88 px-4 py-3 sm:flex-row">
          <span className="text-center text-xs font-semibold text-slate-200/90 sm:text-left">
            Mode terpilih:{' '}
            <strong className="font-black text-white">{activeSpec.title}</strong> ({activeSpec.subtitle}) · Bisa diubah kapan saja di Menu → Opsi.
          </span>
          <button
            type="button"
            onClick={() => onConfirm(selected)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sky-300/60 bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-[0_6px_22px_rgba(14,165,233,0.4)] transition hover:brightness-110 active:translate-y-0.5 sm:w-auto sm:min-w-[240px]"
          >
            <span>Mulai Petualangan</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
