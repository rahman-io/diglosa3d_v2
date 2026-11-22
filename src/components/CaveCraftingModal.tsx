import React from 'react';
import { Bomb, Flame, Hammer, Pickaxe, Sparkles, X } from 'lucide-react';
import { WEAPONS } from '../data/diglosaCatalog';
import { RpgHudSnapshot } from '../types/game';

export type CaveCraftRecipe = 'pickaxe_2' | 'pickaxe_3' | 'torches' | 'ammo' | 'tnt';

interface CaveCraftingModalProps {
  open: boolean;
  hud: RpgHudSnapshot;
  onCraft: (recipe: CaveCraftRecipe) => void;
  onClose: () => void;
}

export const CaveCraftingModal: React.FC<CaveCraftingModalProps> = ({
  open,
  hud,
  onCraft,
  onClose,
}) => {
  if (!open) return null;

  const activeWeaponName =
    hud.ownedWeapons.length > 0 ? WEAPONS[hud.activeWeapon].name : 'Belum punya senjata';

  const pickaxeSpeedLabel =
    hud.pickaxeTier === 3
      ? 'Beliung Berlian (3× Cepat)'
      : hud.pickaxeTier === 2
      ? 'Beliung Besi (2× Cepat)'
      : 'Beliung Batu (1× Dasar)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain touch-pan-y bg-[#0f172a]/75 p-2 sm:p-4">
      <div className="my-auto max-h-[92dvh] w-full max-w-2xl overflow-y-auto overscroll-contain touch-pan-y rounded-3xl border-4 border-[#78350f] bg-[#fef3c7] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-[#92400e] bg-[#5c340f] px-5 py-3.5 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-amber-300 bg-amber-600 text-white">
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-amber-200 sm:text-lg">
                ⚒️ Meja Craft &amp; Tungku Gua
              </h2>
              <p className="text-[11px] font-semibold text-amber-100/85">
                Tukar hasil tambang gua menjadi Upgrade Beliung, Obor, Peluru &amp; TNT!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Meja Craft"
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-amber-300/60 bg-[#78350f] text-amber-100 transition hover:bg-[#92400e]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Stock Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#d6b67c] bg-[#f5e3be] px-5 py-2.5 text-xs font-extrabold text-[#5c340f]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-[#c4a472] bg-white px-2.5 py-1 font-mono-nums">
              🧱 Blok: {hud.caveShieldBlocksLeft}
            </span>
            <span className="rounded-lg border border-[#c4a472] bg-white px-2.5 py-1 font-mono-nums text-cyan-800">
              💎 Berlian: {hud.diamonds}
            </span>
            <span className="rounded-lg border border-[#c4a472] bg-white px-2.5 py-1 font-mono-nums text-amber-800">
              🔦 Obor: {hud.caveTorchesLeft}/24
            </span>
            <span className="rounded-lg border border-[#c4a472] bg-white px-2.5 py-1 font-mono-nums text-rose-700">
              🧨 TNT: {hud.caveTntLeft}/16
            </span>
          </div>
          <span className="rounded-lg bg-[#78350f] px-2.5 py-1 text-[11px] text-amber-100">
            ⛏️ {pickaxeSpeedLabel}
          </span>
        </div>

        {/* Recipe Cards */}
        <div className="max-h-[68vh] space-y-2.5 overflow-y-auto p-5">
          {/* 1. Upgrade Beliung Besi (Tier 2) */}
          <div className="flex flex-col justify-between gap-3 rounded-2xl border-2 border-[#c4a472] bg-white p-3.5 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                <Pickaxe className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-black text-[#3b2008]">
                  <span>Upgrade Beliung Besi (Tier 2)</span>
                  {hud.pickaxeTier >= 2 && (
                    <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white">
                      ✓ Dimiliki
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[#5c340f]">
                  Kecepatan menggali <strong>2× lebih cepat</strong> — bijih &amp; batu keras hancur dalam sekejap.
                </p>
                <div className="mt-1 text-[11px] font-extrabold text-amber-800">
                  Bahan: 4 🧱 Blok
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={hud.pickaxeTier >= 2 || hud.caveShieldBlocksLeft < 4}
              onClick={() => onCraft('pickaxe_2')}
              className="shrink-0 rounded-xl border-2 border-[#475569] bg-slate-700 px-4 py-2 text-xs font-black text-white shadow transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {hud.pickaxeTier >= 2 ? 'Sudah Punya' : 'Buat (4 🧱)'}
            </button>
          </div>

          {/* 2. Upgrade Beliung Berlian (Tier 3) */}
          <div className="flex flex-col justify-between gap-3 rounded-2xl border-2 border-cyan-400/70 bg-cyan-50/70 p-3.5 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-black text-cyan-950">
                  <span>Upgrade Beliung Berlian (Tier 3)</span>
                  {hud.pickaxeTier >= 3 && (
                    <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white">
                      ✓ Maksimal
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-cyan-900">
                  Kecepatan menggali <strong>3× lebih cepat</strong> — hancurkan Bijih Berlian dalam 1× ayun!
                </p>
                <div className="mt-1 text-[11px] font-extrabold text-cyan-800">
                  Bahan: 4 🧱 Blok + 2 💎 Berlian (Perlu Tier 2 dulu)
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={
                hud.pickaxeTier < 2 ||
                hud.pickaxeTier >= 3 ||
                hud.caveShieldBlocksLeft < 4 ||
                hud.diamonds < 2
              }
              onClick={() => onCraft('pickaxe_3')}
              className="shrink-0 rounded-xl border-2 border-cyan-800 bg-cyan-600 px-4 py-2 text-xs font-black text-white shadow transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {hud.pickaxeTier >= 3
                ? 'Maksimal'
                : hud.pickaxeTier < 2
                ? 'Butuh Tier 2'
                : 'Buat (4 🧱 + 2 💎)'}
            </button>
          </div>

          {/* 3. TNT Tambang */}
          <div className="flex flex-col justify-between gap-3 rounded-2xl border-2 border-rose-400/70 bg-rose-50/70 p-3.5 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
                <Bomb className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-black text-rose-950">
                  TNT Tambang (+2 🧨 · Slot T)
                </div>
                <p className="mt-0.5 text-xs text-rose-900">
                  Pasang di lantai lalu menjauh: meledakkan banyak batu tambang, menjatuhkan Kelelawar/Creeper &amp; memecah perisai Monster Kata sekaligus!
                </p>
                <div className="mt-1 text-[11px] font-extrabold text-rose-800">
                  Bahan: 3 🧱 Blok
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={hud.caveShieldBlocksLeft < 3 || hud.caveTntLeft >= 16}
              onClick={() => onCraft('tnt')}
              className="shrink-0 rounded-xl border-2 border-rose-800 bg-rose-600 px-4 py-2 text-xs font-black text-white shadow transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {hud.caveTntLeft >= 16 ? 'Penuh' : 'Buat +2 🧨 (3 🧱)'}
            </button>
          </div>

          {/* 4. Obor Ekstra & Paket Peluru */}
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="flex flex-col justify-between gap-2.5 rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-3.5">
              <div className="flex items-start gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-[#78350f]">
                    Obor Gua Ekstra (+6 🔦)
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#5c340f]">
                    Terangi gua &amp; tenangkan monster. Bahan: <strong>2 🧱</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={hud.caveShieldBlocksLeft < 2 || hud.caveTorchesLeft >= 24}
                onClick={() => onCraft('torches')}
                className="w-full rounded-xl border-2 border-[#78350f] bg-amber-600 px-3 py-1.5 text-xs font-black text-white shadow transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {hud.caveTorchesLeft >= 24 ? 'Obor Penuh' : 'Buat +6 🔦 (2 🧱)'}
              </button>
            </div>

            <div className="flex flex-col justify-between gap-2.5 rounded-2xl border-2 border-indigo-300 bg-indigo-50/80 p-3.5">
              <div>
                <div className="text-xs font-black text-indigo-950">
                  Amunisi Tambang (+10 Peluru)
                </div>
                <p className="mt-0.5 text-[11px] text-indigo-900">
                  Untuk: <strong>{activeWeaponName}</strong>. Bahan: <strong>2 🧱 + 1 💎</strong>
                </p>
              </div>
              <button
                type="button"
                disabled={
                  hud.ownedWeapons.length === 0 ||
                  hud.caveShieldBlocksLeft < 2 ||
                  hud.diamonds < 1
                }
                onClick={() => onCraft('ammo')}
                className="w-full rounded-xl border-2 border-indigo-800 bg-indigo-600 px-3 py-1.5 text-xs font-black text-white shadow transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {hud.ownedWeapons.length === 0
                  ? 'Ambil Senjata Dulu'
                  : 'Buat +10 Peluru (2 🧱 + 1 💎)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
