import React, { useEffect, useLayoutEffect, useState } from 'react';
import { CheckCircle2, SkipForward } from 'lucide-react';

export interface HudTutorialStep {
  id: string;
  title: string;
  description: string;
  actionHint: string;
  shape?: 'circle' | 'rounded';
  padding?: number;
}

interface HudTutorialOverlayProps {
  active: boolean;
  step: HudTutorialStep | null;
  stepIndex: number;
  totalSteps: number;
  justCompletedStep?: boolean;
  onSkip: () => void;
}

interface RectBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const HUD_TUTORIAL_STEPS: HudTutorialStep[] = [
  {
    id: 'touch_joystick',
    title: 'Area Joystick Gerak',
    description:
      'Sentuh dan geser jari di area kiri layar untuk berjalan, berlari, berenang, atau menyetir mobil ke segala arah.',
    actionHint: 'Sentuh & geser area kiri yang disorot untuk mencoba.',
    shape: 'rounded',
    padding: 4,
  },
  {
    id: 'camera_view',
    title: 'Toggle Ganti View (Kamera)',
    description:
      'Ketuk ikon Mata ini untuk berganti sudut pandang kamera antara Kamera Belakang, Orang Pertama (FPS), Kamera Depan, atau Bebas.',
    actionHint: 'Ketuk ikon Mata sekarang untuk mengganti view.',
    shape: 'circle',
    padding: 7,
  },
  {
    id: 'aim_mode',
    title: 'Mode Bidik (Bebas / Otomatis)',
    description:
      'Ketuk tombol ini untuk berpindah antara Bidik Bebas (Crosshair manual) dan Bidik Otomatis ke monster terdekat.',
    actionHint: 'Ketuk tombol Mode Bidik untuk mencoba.',
    shape: 'circle',
    padding: 7,
  },
  {
    id: 'scope',
    title: 'Tombol Ngeker (Scope)',
    description:
      'Saat membawa senjata di mode Bidik Bebas, ketuk ikon Scope ini untuk membidik presisi (zoom) agar tembakan makin akurat.',
    actionHint: 'Ketuk tombol Scope untuk mencoba ngeker.',
    shape: 'circle',
    padding: 8,
  },
  {
    id: 'attack',
    title: 'Tombol Tembak & Serang',
    description:
      'Ketuk atau tahan tombol utama ini untuk menembakkan senjata ke arah bidikan atau memukul jarak dekat.',
    actionHint: 'Ketuk tombol Tembak sekarang untuk mencoba.',
    shape: 'circle',
    padding: 9,
  },
  {
    id: 'buy_ammo',
    title: 'Tombol Isi Peluru (3 Berlian)',
    description:
      'Ketuk tombol ini untuk mengisi +6 peluru secara instan memakai 3 berlian. Menyala biru saat berlian cukup & peluru belum penuh.',
    actionHint: 'Ketuk tombol Isi Peluru untuk mencoba.',
    shape: 'circle',
    padding: 9,
  },
  {
    id: 'jump',
    title: 'Tombol Lompat',
    description:
      'Ketuk ikon Sepatu Bersayap untuk melompati tebing, rintangan batu, atau melompat naik dari air.',
    actionHint: 'Ketuk tombol Lompat untuk mencoba.',
    shape: 'circle',
    padding: 8,
  },
  {
    id: 'info_toggle',
    title: 'Toggle Info & Minimap',
    description:
      'Ketuk ikon Info (i) untuk menampilkan atau menyembunyikan radar minimap, target misi, dan label layar agar pandangan tetap bersih.',
    actionHint: 'Ketuk tombol Info (i) sekarang untuk mencoba.',
    shape: 'circle',
    padding: 7,
  },
  {
    id: 'sound_toggle',
    title: 'Tombol Audio & Musik',
    description:
      'Ketuk ikon Speaker untuk mematikan atau menyalakan musik latar dan seluruh efek suara permainan.',
    actionHint: 'Ketuk tombol Speaker untuk mencoba.',
    shape: 'circle',
    padding: 7,
  },
  {
    id: 'bag_slot',
    title: 'Kotak Senjata Aktif & Tas',
    description:
      'Menampilkan senjata atau alat yang sedang dipakai beserta sisa pelurunya. Ketuk kotak ini untuk langsung membuka Tas.',
    actionHint: 'Ketuk kotak Senjata untuk mencoba.',
    shape: 'rounded',
    padding: 7,
  },
  {
    id: 'weapon_switcher',
    title: 'Ganti Senjata & Alat Cepat',
    description:
      'Ketuk medali Pedang ini untuk memilih senjata 3D, Beliung tambang, Obor, Blok Pelindung, atau TNT secara cepat.',
    actionHint: 'Ketuk medali Senjata & Alat untuk mencoba.',
    shape: 'circle',
    padding: 7,
  },
  {
    id: 'main_menu',
    title: 'Menu Utama',
    description:
      'Ketuk tombol Menu untuk membuka Tas Senjata, Kamus Bahasa Inggris, Daftar Misi, Peta Dunia, Panduan, dan Opsi.',
    actionHint: 'Ketuk tombol Menu untuk mencoba.',
    shape: 'circle',
    padding: 7,
  },
  {
    id: 'voice_toggle',
    title: 'Kontrol Perintah Suara (Mic)',
    description:
      'Ketuk ikon Mikrofon untuk memberi perintah suara Bahasa Indonesia langsung ke game (seperti "maju", "lompat", "tembak").',
    actionHint: 'Ketuk tombol Mikrofon untuk mencoba.',
    shape: 'circle',
    padding: 7,
  },
  {
    id: 'voice_help',
    title: 'Daftar 107+ Perintah Suara',
    description:
      'Ketuk ikon tanda tanya (?) untuk membuka panel daftar perintah suara yang transparan sambil tetap bisa melihat karakter bergerak.',
    actionHint: 'Ketuk tombol (?) untuk mencoba & selesaikan panduan!',
    shape: 'circle',
    padding: 7,
  },
];

export const HudTutorialOverlay: React.FC<HudTutorialOverlayProps> = ({
  active,
  step,
  stepIndex,
  totalSteps,
  justCompletedStep = false,
  onSkip,
}) => {
  const [targetRect, setTargetRect] = useState<RectBox | null>(null);
  const [viewport, setViewport] = useState<{ w: number; h: number }>({
    w: typeof window !== 'undefined' ? window.innerWidth : 1024,
    h: typeof window !== 'undefined' ? window.innerHeight : 640,
  });
  const [nudgeTick, setNudgeTick] = useState(0);

  useLayoutEffect(() => {
    if (!active || !step) {
      setTargetRect(null);
      return;
    }

    let rafId = 0;
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const el = document.querySelector<HTMLElement>(`[data-tutorial-target="${step.id}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          const pad = step.padding ?? 7;
          const next: RectBox = {
            left: Math.max(2, r.left - pad),
            top: Math.max(2, r.top - pad),
            width: Math.min(vw - 4, r.width + pad * 2),
            height: Math.min(vh - 4, r.height + pad * 2),
          };
          setTargetRect((prev) => {
            if (
              prev &&
              Math.abs(prev.left - next.left) < 1 &&
              Math.abs(prev.top - next.top) < 1 &&
              Math.abs(prev.width - next.width) < 1 &&
              Math.abs(prev.height - next.height) < 1
            ) {
              return prev;
            }
            return next;
          });
        }
      }
      setViewport((prev) => (prev.w === vw && prev.h === vh ? prev : { w: vw, h: vh }));
      rafId = window.requestAnimationFrame(measure);
    };

    rafId = window.requestAnimationFrame(measure);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [active, step]);

  useEffect(() => {
    if (!active) return;
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active]);

  if (!active || !step) return null;

  const r = targetRect;
  const isCircle = step.shape !== 'rounded';

  // Compute smart card placement that never covers the spotlighted target
  const cardWidth = Math.min(340, Math.max(240, viewport.w - 24));
  let cardLeft = (viewport.w - cardWidth) / 2;
  let cardTop = Math.max(12, viewport.h * 0.32);

  if (r) {
    const targetCenterX = r.left + r.width / 2;
    const targetCenterY = r.top + r.height / 2;
    const isJoystickZone = step.id === 'touch_joystick';

    if (isJoystickZone) {
      cardLeft = Math.min(viewport.w - cardWidth - 14, r.left + r.width + 16);
      if (cardLeft < r.left + r.width + 8) {
        cardLeft = Math.max(12, viewport.w - cardWidth - 14);
      }
      cardTop = Math.max(16, Math.min(viewport.h - 210, targetCenterY - 90));
    } else if (targetCenterY < viewport.h * 0.45) {
      // Target is near top -> place card cleanly below target
      cardTop = Math.min(viewport.h - 198, r.top + r.height + 24);
      cardLeft = Math.max(12, Math.min(viewport.w - cardWidth - 12, targetCenterX - cardWidth / 2));
    } else {
      // Target is near bottom -> place card cleanly above target
      cardTop = Math.max(12, r.top - 196);
      cardLeft = Math.max(12, Math.min(viewport.w - cardWidth - 12, targetCenterX - cardWidth / 2));
    }
  }

  // Hand pointer position relative to target cutout
  let handLeft = r ? r.left + r.width * 0.72 : viewport.w / 2;
  let handTop = r ? r.top + r.height * 0.72 : viewport.h / 2;
  let handFlip = false;
  if (r) {
    if (step.id === 'touch_joystick') {
      handLeft = r.left + r.width * 0.46;
      handTop = r.top + r.height * 0.54;
    } else {
      if (r.left + r.width > viewport.w - 58) {
        handLeft = r.left - 34;
        handFlip = true;
      } else {
        handLeft = r.left + r.width - 10;
      }
      if (r.top + r.height > viewport.h - 58) {
        handTop = r.top - 28;
      } else {
        handTop = r.top + r.height - 12;
      }
    }
  }

  const handleBlockedTap = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNudgeTick((t) => t + 1);
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[45] select-none"
      role="dialog"
      aria-modal="false"
      aria-label={`Panduan Tombol ${step.title}`}
    >
      {/* 4 Invisible Interactive Blocker Strips around the Spotlight Cutout (so user MUST tap the spotlighted button or Skip!) */}
      {r ? (
        <>
          <div
            onPointerDown={handleBlockedTap}
            onClick={handleBlockedTap}
            style={{ left: 0, top: 0, right: 0, height: Math.max(0, r.top) }}
            className="pointer-events-auto fixed z-[45]"
          />
          <div
            onPointerDown={handleBlockedTap}
            onClick={handleBlockedTap}
            style={{ left: 0, top: r.top + r.height, right: 0, bottom: 0 }}
            className="pointer-events-auto fixed z-[45]"
          />
          <div
            onPointerDown={handleBlockedTap}
            onClick={handleBlockedTap}
            style={{ left: 0, top: r.top, width: Math.max(0, r.left), height: r.height }}
            className="pointer-events-auto fixed z-[45]"
          />
          <div
            onPointerDown={handleBlockedTap}
            onClick={handleBlockedTap}
            style={{ left: r.left + r.width, top: r.top, right: 0, height: r.height }}
            className="pointer-events-auto fixed z-[45]"
          />
        </>
      ) : (
        <div
          onPointerDown={handleBlockedTap}
          onClick={handleBlockedTap}
          className="pointer-events-auto fixed inset-0 z-[45] bg-slate-950/75"
        />
      )}

      {/* Spotlight Cutout & Soft Radial White Glow (mirrors Pirate Bay example) */}
      {r && (
        <div
          key={`spot-${step.id}-${nudgeTick}`}
          style={{
            left: r.left,
            top: r.top,
            width: r.width,
            height: r.height,
            borderRadius: isCircle ? '9999px' : '18px',
            boxShadow:
              '0 0 0 9999px rgba(6, 10, 22, 0.78), 0 0 26px 8px rgba(255, 255, 255, 0.58), inset 0 0 12px rgba(34, 211, 238, 0.55)',
          }}
          className="pointer-events-none fixed z-[46] ring-2 ring-white/90 transition-all duration-200"
        >
          <span
            style={{ borderRadius: isCircle ? '9999px' : '18px' }}
            className="pointer-events-none absolute -inset-1.5 animate-pulse border-2 border-cyan-300/80"
          />
        </div>
      )}

      {/* Animated Cartoon White-Gloved Pointing Hand */}
      {r && (
        <div
          style={{
            left: handLeft,
            top: handTop,
            transform: handFlip ? 'scaleX(-1)' : undefined,
          }}
          className="pointer-events-none fixed z-[48] animate-bounce drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]"
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="-rotate-[32deg]"
          >
            <path
              d="M17 6C17 3.8 18.8 2 21 2C23.2 2 25 3.8 25 6V18.5C25.8 18.1 26.8 18 27.8 18.2C29.4 18.5 30.7 19.6 31.2 21.1C32.1 20.6 33.2 20.5 34.2 20.8C35.8 21.3 37 22.7 37.2 24.4C38.4 24.4 39.6 25 40.3 26C41 27 41.2 28.3 40.9 29.5L39.1 37.3C38.1 41.8 34.1 45 29.4 45H22.5C18.6 45 15.1 42.9 13.3 39.5L8.6 30.8C7.6 28.9 8.3 26.5 10.2 25.5C12.1 24.5 14.5 25.2 15.5 27.1L17 29.8V6Z"
              fill="#FFFFFF"
              stroke="#1E293B"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            <path d="M22 25V33" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M27.5 25V33" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M33 26V33" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Clean Cream Speech Card + Mandatory Action Hint + Skip Button */}
      <div
        style={{
          left: cardLeft,
          top: cardTop,
          width: cardWidth,
        }}
        className="pointer-events-auto fixed z-[50] rounded-2xl border-2 border-amber-400/90 bg-[#faf6eb] p-3.5 text-slate-900 shadow-[0_14px_38px_rgba(0,0,0,0.65)] transition-all duration-200 sm:p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
            <span>Panduan {stepIndex + 1}/{totalSteps}</span>
          </span>
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95"
          >
            <span>Lewati</span>
            <SkipForward className="h-3 w-3" />
          </button>
        </div>

        <h3 className="mt-2 text-sm font-black tracking-tight text-slate-900 sm:text-[15px]">
          {step.title}
        </h3>
        <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">
          {step.description}
        </p>

        <div
          className={`mt-2.5 flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-extrabold ${
            justCompletedStep
              ? 'border-emerald-400 bg-emerald-100 text-emerald-900'
              : nudgeTick > 0
              ? 'animate-pulse border-amber-500 bg-amber-100 text-amber-950'
              : 'border-cyan-500/40 bg-cyan-50 text-cyan-950'
          }`}
        >
          <CheckCircle2
            className={`h-3.5 w-3.5 shrink-0 ${
              justCompletedStep ? 'text-emerald-600' : 'text-cyan-700'
            }`}
          />
          <span>
            {justCompletedStep ? 'Bagus! Lanjut ke tombol berikutnya...' : step.actionHint}
          </span>
        </div>
      </div>
    </div>
  );
};
