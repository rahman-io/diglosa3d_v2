import React, { useEffect, useRef } from 'react';
import {
  LiveMapBounds,
  LiveMapSnapshot,
  RadarBlipKind,
  RadarState,
  ZoneId,
} from '../types/game';
import { IELTS_TEMPORARILY_LOCKED, OVERWORLD_ANCHORS } from '../three/archipelagoWorld';

interface RadarMinimapProps {
  radar: RadarState;
  size?: number;
  getLiveMapSnapshot?: (kind: 'minimap' | 'full') => LiveMapSnapshot | null;
  onOpenMap: () => void;
}

interface Kingdom3DMapProps {
  radar: RadarState | null;
  liberatedZones: ZoneId[];
  starterPicked: boolean;
  swimSuitPicked?: boolean;
  dungeonName?: string;
  getLiveMapSnapshot?: (kind: 'minimap' | 'full') => LiveMapSnapshot | null;
  onSelectZone?: (zoneId: ZoneId) => void;
  onSelectPortal?: () => void;
  onSelectSwimSuit?: () => void;
}

/** Custom pixel-vector Blaster / Starter Weapon SVG icon (zero emojis) */
export const StarterWeaponPixelIcon: React.FC<{ className?: string }> = ({
  className = 'h-5 w-5',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M4 14h4v3l-2 4H3l2-5H4v-2z"
      fill="#b45309"
      stroke="#0f172a"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M5 10h11l3 2v3H8l-3-2v-3z"
      fill="#38bdf8"
      stroke="#0f172a"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <rect x="9" y="11" width="5" height="2" fill="#e0f2fe" />
    <path
      d="M19 6l1.3 2.5L23 9.8l-2.7 1.3L19 14l-1.3-2.9L15 9.8l2.7-1.3L19 6z"
      fill="#facc15"
      stroke="#0f172a"
      strokeWidth="1.1"
      strokeLinejoin="round"
    />
  </svg>
);

/** Custom Wetsuit & Diving Gear icon */
export const SwimSuitIcon: React.FC<{ className?: string }> = ({
  className = 'h-5 w-5',
}) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-amber-300/70 bg-slate-950 ${className}`}
  >
    <img
      src="./assets/aistudio/Gemini_Generated_Image_o4clnqo4clnqo4cl_c0838042.jpeg"
      alt="Pakaian Renang"
      className="h-full w-full scale-[1.42] object-cover"
      draggable={false}
    />
  </span>
);

/** Reusable custom SVG legend icon per spot kind (zero emojis) */
export const SpotLegendIcon: React.FC<{ kind: RadarBlipKind; className?: string }> = ({
  kind,
  className = 'h-4 w-4',
}) => {
  if (kind === 'starter') return <StarterWeaponPixelIcon className={className} />;
  if (kind === 'swimsuit') return <SwimSuitIcon className={className} />;
  if (kind === 'car') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <path
          d="M5 12l2-5h10l2 5v5h-2v-1.5H7V17H5v-5z"
          fill="#0ea5e9"
          stroke="#0f172a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <rect x="7.5" y="8" width="9" height="3" rx="0.8" fill="#bae6fd" />
        <circle cx="8" cy="14" r="1.2" fill="#fef08a" />
        <circle cx="16" cy="14" r="1.2" fill="#fef08a" />
      </svg>
    );
  }
  if (kind === 'spot_gua') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <path d="M3 20L6 7l6-3 6 3 3 13H3z" fill="#475569" stroke="#0f172a" strokeWidth="1.6" />
        <path d="M7.5 20v-6.5a4.5 4.5 0 0 1 9 0V20h-9z" fill="#0f172a" />
        <path d="M12 10l2.2 3.2L12 17l-2.2-3.8L12 10z" fill="#22d3ee" />
      </svg>
    );
  }
  if (kind === 'spot_satwa') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <path
          d="M5 5l4 4h6l4-4 1 8-8 7-8-7 1-8z"
          fill="#f97316"
          stroke="#0f172a"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M8 14l4 4 4-4-1.8 1.5h-4.4L8 14z" fill="#f8fafc" />
        <circle cx="9.5" cy="12" r="1.1" fill="#0f172a" />
        <circle cx="14.5" cy="12" r="1.1" fill="#0f172a" />
      </svg>
    );
  }
  if (kind === 'spot_desa') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <path d="M3 11l9-7 9 7H3z" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.6" />
        <rect x="6" y="11" width="12" height="9" fill="#fef3c7" stroke="#0f172a" strokeWidth="1.6" />
        <rect x="10.5" y="14" width="3" height="6" fill="#78350f" />
      </svg>
    );
  }
  if (kind === 'spot_pasar') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <path d="M3 7h18l-1.5 4h-15L3 7z" fill="#ef4444" stroke="#0f172a" strokeWidth="1.5" />
        <rect x="7" y="7" width="3.5" height="4" fill="#ffffff" />
        <rect x="13.5" y="7" width="3.5" height="4" fill="#ffffff" />
        <path
          d="M6 12h12v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-5z"
          fill="#334155"
          stroke="#0f172a"
          strokeWidth="1.5"
        />
      </svg>
    );
  }
  if (kind === 'spot_gerbang') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <rect x="4" y="6" width="5" height="14" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.5" />
        <rect x="15" y="6" width="5" height="14" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.5" />
        <rect x="3" y="4" width="18" height="4" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.5" />
      </svg>
    );
  }
  if (kind === 'spot_menara') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" fill="#8b5cf6" stroke="#0f172a" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="6" fill="#fef08a" />
        <path d="M12 8v4l-2.5 2.5" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'door') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <rect x="6" y="3" width="12" height="18" rx="1.5" fill="#facc15" stroke="#0f172a" strokeWidth="1.6" />
        <circle cx="15" cy="12" r="1.4" fill="#0f172a" />
      </svg>
    );
  }
  if (kind === 'craft') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2" fill="#d97706" stroke="#0f172a" strokeWidth="1.6" />
        <rect x="7" y="8" width="10" height="4" fill="#fef3c7" />
      </svg>
    );
  }
  if (kind === 'chest') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <rect x="4" y="7" width="16" height="11" rx="1.5" fill="#facc15" stroke="#0f172a" strokeWidth="1.6" />
        <path d="M4 11h16" stroke="#0f172a" strokeWidth="1.8" />
        <rect x="10.5" y="10" width="3" height="3.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
      </svg>
    );
  }
  if (kind === 'collectible') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <path d="M12 3l7 8-7 10-7-10 7-8z" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.6" />
        <path d="M12 3l3.2 8L12 21 8.8 11 12 3z" fill="#e0f2fe" opacity="0.65" />
      </svg>
    );
  }
  if (kind === 'key') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <circle cx="8" cy="12" r="4" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
        <path d="M12 12h8v3h-2v-1.5h-2V15" stroke="#facc15" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'prison') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" fill="#fb7185" stroke="#0f172a" strokeWidth="1.5" />
        <path d="M8 5v14M12 5v14M16 5v14" stroke="#0f172a" strokeWidth="1.8" />
      </svg>
    );
  }
  if (kind === 'exit') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <path d="M12 4l8 8-8 8v-5H4v-6h8V4z" fill="#22d3ee" stroke="#0f172a" strokeWidth="1.5" />
      </svg>
    );
  }
  if (kind === 'sea_monster') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <path
          d="M5 17c3.5-7 7-11 10-12-.8 4 .2 8.2 3 12H5z"
          fill="#06b6d4"
          stroke="#0f172a"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M3 18.5c3-1.2 6-1.2 9 0s6 1.2 9 0" stroke="#67e8f9" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'sky_monster') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <path
          d="M2 10l8 2 2-6 2 6 8-2-6 5 1 5-5-3-5 3 1-5-6-5z"
          fill="#f97316"
          stroke="#0f172a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === 'monster_brawl' || kind === 'boss' || kind === 'monster_quiz') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="7.5"
          fill={kind === 'monster_quiz' ? '#a855f7' : '#ef4444'}
          stroke="#0f172a"
          strokeWidth="1.6"
        />
        <path d="M9 9l6 6M15 9l-6 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M4 18V8l4 4 4-6 4 6 4-4v10H4z"
        fill="#a855f7"
        stroke="#0f172a"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect x="7" y="14" width="10" height="2" fill="#facc15" />
    </svg>
  );
};

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rad = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

function worldToMapPx(
  wx: number,
  wz: number,
  bounds: LiveMapBounds,
  offsetX: number,
  offsetY: number,
  viewW: number,
  viewH: number,
): { sx: number; sy: number } {
  const sx = offsetX + ((wx - (bounds.centerX - bounds.halfW)) / (2 * bounds.halfW)) * viewW;
  const sy = offsetY + ((wz - (bounds.centerZ - bounds.halfH)) / (2 * bounds.halfH)) * viewH;
  return { sx, sy };
}

function drawVisionCone(
  ctx: CanvasRenderingContext2D,
  hx: number,
  hy: number,
  camForwardX: number,
  camForwardZ: number,
  radius: number,
): void {
  const len = Math.hypot(camForwardX, camForwardZ);
  const fx = len > 0.001 ? camForwardX / len : 0;
  const fz = len > 0.001 ? camForwardZ / len : -1;
  const dirAngle = Math.atan2(fz, fx);
  const spread = 0.52;

  ctx.save();
  const grad = ctx.createRadialGradient(hx, hy, 2, hx, hy, radius);
  grad.addColorStop(0, 'rgba(254, 240, 138, 0.44)');
  grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.16)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.arc(hx, hy, radius, dirAngle - spread, dirAngle + spread);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}

function drawHeroArrow(
  ctx: CanvasRenderingContext2D,
  hx: number,
  hy: number,
  heroYaw: number,
  scale = 1,
): void {
  const hfx = Math.sin(heroYaw);
  const hfz = Math.cos(heroYaw);
  const rot = Math.atan2(hfx, -hfz);

  ctx.save();
  ctx.translate(hx, hy);
  ctx.scale(scale, scale);

  // Subtle MOBA Hero ring aura
  ctx.beginPath();
  ctx.arc(0, 0, 8.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.fill();
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
  ctx.stroke();

  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, -7.5);
  ctx.lineTo(5.4, 5.2);
  ctx.lineTo(0, 2.6);
  ctx.lineTo(-5.4, 5.2);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#0f172a';
  ctx.stroke();
  ctx.restore();
}

// =========================================================
// ZERO-EMOJI CUSTOM VECTOR & PIXEL MARKER SPRITES
// =========================================================
function drawIcon(
  ctx: CanvasRenderingContext2D,
  kind: RadarBlipKind,
  x: number,
  y: number,
  color: string,
  liberated: boolean,
  needsHelp: boolean,
  pulse: number,
  scale = 1,
): void {
  ctx.save();
  ctx.translate(x, y);
  if (scale !== 1) ctx.scale(scale, scale);

  if (kind === 'starter') {
    const r = 8.8 + Math.sin(pulse * 5) * 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -6.6);
    ctx.lineTo(6.6, 0);
    ctx.lineTo(0, 6.6);
    ctx.lineTo(-6.6, 0);
    ctx.closePath();
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-3.5, -1.5, 7, 2.2);
    ctx.fillRect(-3.5, 0.4, 2.2, 2.6);
    ctx.restore();
    return;
  }

  if (kind === 'swimsuit') {
    const r = 8.8 + Math.sin(pulse * 5) * 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(34, 211, 238, 0.28)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#67e8f9';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -6.6);
    ctx.lineTo(6.6, 0);
    ctx.lineTo(0, 6.6);
    ctx.lineTo(-6.6, 0);
    ctx.closePath();
    ctx.fillStyle = '#0891b2';
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    ctx.fillStyle = '#cffafe';
    ctx.fillRect(-3.6, -2.2, 3.0, 2.2);
    ctx.fillRect(0.6, -2.2, 3.0, 2.2);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-1.0, 0.8, 2.0, 2.6);
    ctx.restore();
    return;
  }

  if (kind === 'car') {
    ctx.beginPath();
    ctx.arc(0, 0, 8.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(14, 165, 233, 0.28)';
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = '#7dd3fc';
    ctx.stroke();

    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-5.6, -3.4, 11.2, 6.8, 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(-3.6, -2.0, 7.2, 2.6);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-4.4, 1.2, 2.2, 1.3);
    ctx.fillRect(2.2, 1.2, 2.2, 1.3);
    ctx.restore();
    return;
  }

  if (kind === 'spot_gua') {
    ctx.fillStyle = liberated ? '#166534' : '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(-7.2, 6);
    ctx.lineTo(-5.2, -3.2);
    ctx.lineTo(0, -6.8);
    ctx.lineTo(5.2, -3.2);
    ctx.lineTo(7.2, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(0, 2.8, 3.6, Math.PI, 0);
    ctx.lineTo(3.6, 6);
    ctx.lineTo(-3.6, 6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = liberated ? '#4ade80' : '#22d3ee';
    ctx.beginPath();
    ctx.moveTo(0, -0.8);
    ctx.lineTo(1.7, 2.2);
    ctx.lineTo(0, 4.8);
    ctx.lineTo(-1.7, 2.2);
    ctx.closePath();
    ctx.fill();
  } else if (kind === 'spot_satwa') {
    ctx.fillStyle = liberated ? '#22c55e' : '#f97316';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-6, -6.5);
    ctx.lineTo(-2.2, -2.5);
    ctx.lineTo(2.2, -2.5);
    ctx.lineTo(6, -6.5);
    ctx.lineTo(6.5, 1.5);
    ctx.lineTo(0, 6.2);
    ctx.lineTo(-6.5, 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-3.6, 2.0);
    ctx.lineTo(0, 5.2);
    ctx.lineTo(3.6, 2.0);
    ctx.lineTo(0, 3.0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-3.0, -0.4, 1.6, 1.6);
    ctx.fillRect(1.4, -0.4, 1.6, 1.6);
  } else if (kind === 'spot_desa' || kind === 'npc') {
    ctx.lineWidth = 1.7;
    ctx.strokeStyle = '#0f172a';
    ctx.fillStyle = liberated ? '#22c55e' : color;
    ctx.beginPath();
    ctx.moveTo(0, -6.6);
    ctx.lineTo(6.8, -0.6);
    ctx.lineTo(-6.8, -0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = liberated ? '#bbf7d0' : '#fef3c7';
    ctx.fillRect(-4.6, -0.6, 9.2, 6.2);
    ctx.strokeRect(-4.6, -0.6, 9.2, 6.2);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-1.4, 1.6, 2.8, 4.0);
  } else if (kind === 'spot_pasar') {
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#0f172a';
    ctx.fillStyle = liberated ? '#22c55e' : '#ef4444';
    ctx.fillRect(-6.5, -5.5, 13, 4.2);
    ctx.strokeRect(-6.5, -5.5, 13, 4.2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2.5, -5.5, 2.5, 4.2);
    ctx.fillRect(2.5, -5.5, 2.5, 4.2);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-4.8, -1.0, 9.6, 6.2);
    ctx.strokeRect(-4.8, -1.0, 9.6, 6.2);
  } else if (kind === 'spot_gerbang') {
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#0f172a';
    ctx.fillStyle = liberated ? '#22c55e' : '#3b82f6';
    ctx.fillRect(-7, -6, 14, 3.2);
    ctx.strokeRect(-7, -6, 14, 3.2);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-6, -2.8, 3.5, 8.2);
    ctx.strokeRect(-6, -2.8, 3.5, 8.2);
    ctx.fillRect(2.5, -2.8, 3.5, 8.2);
    ctx.strokeRect(2.5, -2.8, 3.5, 8.2);
  } else if (kind === 'spot_menara') {
    ctx.fillStyle = liberated ? '#22c55e' : '#8b5cf6';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(0, 0, 6.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, 4.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -3.0);
    ctx.lineTo(0, 0);
    ctx.lineTo(-2.2, 2.2);
    ctx.stroke();
  } else if (kind === 'portal') {
    ctx.lineWidth = 1.7;
    ctx.strokeStyle = '#0f172a';
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.moveTo(-6.5, 5);
    ctx.lineTo(-6.5, -3);
    ctx.lineTo(-3, 0.5);
    ctx.lineTo(0, -6);
    ctx.lineTo(3, 0.5);
    ctx.lineTo(6.5, -3);
    ctx.lineTo(6.5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-3.5, 1.5, 7, 2);
  } else if (kind === 'monster_brawl') {
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#fef2f2';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, 4.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-2.1, -2.1);
    ctx.lineTo(2.1, 2.1);
    ctx.moveTo(2.1, -2.1);
    ctx.lineTo(-2.1, 2.1);
    ctx.stroke();
  } else if (kind === 'sea_monster') {
    ctx.fillStyle = '#06b6d4';
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-4.8, 3.8);
    ctx.quadraticCurveTo(-1.2, -5.2, 2.8, -5.8);
    ctx.quadraticCurveTo(1.8, -0.5, 4.8, 3.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 1.4, 1.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'sky_monster') {
    ctx.fillStyle = color || '#f97316';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-6.2, -2.2);
    ctx.lineTo(-1.5, -0.6);
    ctx.lineTo(0, -4.6);
    ctx.lineTo(1.5, -0.6);
    ctx.lineTo(6.2, -2.2);
    ctx.lineTo(2.4, 2.6);
    ctx.lineTo(0, 5.2);
    ctx.lineTo(-2.4, 2.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'monster_quiz') {
    ctx.fillStyle = '#a855f7';
    ctx.strokeStyle = '#f5f3ff';
    ctx.lineWidth = 1.4;
    ctx.fillRect(-3.8, -3.8, 7.6, 7.6);
    ctx.strokeRect(-3.8, -3.8, 7.6, 7.6);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-1.3, -1.3, 2.6, 2.6);
  } else if (kind === 'boss') {
    const s = 6.5;
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'craft') {
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-4.5, -4.5, 9, 9);
    ctx.strokeRect(-4.5, -4.5, 9, 9);
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(-2.5, -2.5, 5, 2);
  } else if (kind === 'chest') {
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-5, -3.5, 10, 7);
    ctx.strokeRect(-5, -3.5, 10, 7);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5, -0.5, 10, 1.4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1.2, -1.2, 2.4, 2.4);
  } else if (kind === 'collectible') {
    ctx.fillStyle = color || '#38bdf8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -4.6);
    ctx.lineTo(4.2, 0);
    ctx.lineTo(0, 4.6);
    ctx.lineTo(-4.2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-0.9, -1.1, 1.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'guardian') {
    ctx.fillStyle = liberated ? '#22c55e' : color;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, 5.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(0, -0.6, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'key') {
    ctx.beginPath();
    ctx.arc(0, 0, 7.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.34)';
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-2.6, 0, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(0, -1.0, 5.4, 2.0);
    ctx.strokeRect(0, -1.0, 5.4, 2.0);
    ctx.fillRect(3.2, 1.0, 1.6, 2.2);
  } else if (kind === 'prison') {
    ctx.fillStyle = liberated ? '#16a34a' : needsHelp ? '#f59e0b' : '#475569';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.fillRect(-5, -5, 10, 10);
    ctx.strokeRect(-5, -5, 10, 10);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-3.2, -3.5, 1.2, 7);
    ctx.fillRect(-0.6, -3.5, 1.2, 7);
    ctx.fillRect(2.0, -3.5, 1.2, 7);
    if (needsHelp && !liberated) {
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-1.5, -1.5, 3, 3);
    }
  } else if (kind === 'door') {
    ctx.fillStyle = liberated ? '#22c55e' : '#fde047';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-4.0, -4.5, 8.0, 9.0);
    ctx.strokeRect(-4.0, -4.5, 8.0, 9.0);
  } else if (kind === 'hero_friend') {
    ctx.beginPath();
    ctx.arc(0, 0, 5.2, 0, Math.PI * 2);
    ctx.fillStyle = color || '#34d399';
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 2.0, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
  } else {
    // exit
    ctx.fillStyle = '#22d3ee';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -5.2);
    ctx.lineTo(5.2, 3.8);
    ctx.lineTo(-5.2, 3.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Help-Needed ('!') or Saved Checkmark Badge on top-right of key spots
  if (needsHelp && !liberated && kind !== 'portal') {
    ctx.translate(6.0, -6.0);
    ctx.beginPath();
    ctx.arc(0, 0, 3.9, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-0.8, -2.4, 1.6, 2.8);
    ctx.fillRect(-0.8, 1.1, 1.6, 1.3);
  } else if (liberated && (kind.startsWith('spot_') || kind === 'door')) {
    ctx.translate(5.8, -5.8);
    ctx.beginPath();
    ctx.arc(0, 0, 3.7, 0, Math.PI * 2);
    ctx.fillStyle = '#16a34a';
    ctx.fill();
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-1.7, 0);
    ctx.lineTo(-0.3, 1.4);
    ctx.lineTo(1.9, -1.3);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.3;
    ctx.stroke();
  }

  ctx.restore();
}

// =========================================================
// TOP-LEFT MOBA-STYLE LIVE SHRUNK 3D MINIMAP RADAR
// =========================================================
export const RadarMinimap: React.FC<RadarMinimapProps> = React.memo(({
  radar,
  size = 114,
  getLiveMapSnapshot,
  onOpenMap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bezelCacheRef = useRef<{
    key: string;
    outerCanvas: HTMLCanvasElement;
    overlayCanvas: HTMLCanvasElement;
  } | null>(null);
  const lastDrawSigRef = useRef<string>('');
  const lastSnapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const snapRevRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const total = size + 16;
    const targetW = Math.round(total * dpr);
    const targetH = Math.round(total * dpr);
    const resized = canvas.width !== targetW || canvas.height !== targetH;
    if (resized) {
      canvas.width = targetW;
      canvas.height = targetH;
      lastDrawSigRef.current = '';
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pad = 6;
    const viewSize = total - pad * 2;
    const cornerR = 13;

    // Cache static bezel + corner brackets + badges AND inner vignette + 3x3 grid offscreen
    const cacheKey = `${total}_${dpr}`;
    if (!bezelCacheRef.current || bezelCacheRef.current.key !== cacheKey) {
      const outerCanvas = document.createElement('canvas');
      outerCanvas.width = targetW;
      outerCanvas.height = targetH;
      const octx = outerCanvas.getContext('2d');
      if (octx) {
        octx.scale(dpr, dpr);
        // Dark Obsidian + Brushed Gold Outer Frame
        drawRoundedRectPath(octx, 2, 2, total - 4, total - 4, cornerR + 3);
        const bezelGrad = octx.createLinearGradient(0, 0, total, total);
        bezelGrad.addColorStop(0, '#facc15');
        bezelGrad.addColorStop(0.35, '#926018');
        bezelGrad.addColorStop(0.7, '#3b240b');
        bezelGrad.addColorStop(1, '#eab308');
        octx.fillStyle = '#090d16';
        octx.fill();
        octx.lineWidth = 2.6;
        octx.strokeStyle = bezelGrad;
        octx.stroke();

        // Inner Gold Trim
        drawRoundedRectPath(octx, pad, pad, viewSize, viewSize, cornerR - 2);
        octx.lineWidth = 1.1;
        octx.strokeStyle = 'rgba(253, 224, 71, 0.48)';
        octx.stroke();

        // Small gold corner brackets
        octx.strokeStyle = '#fef08a';
        octx.lineWidth = 1.6;
        const cLen = 7;
        octx.beginPath();
        octx.moveTo(4, 4 + cLen);
        octx.lineTo(4, 4);
        octx.lineTo(4 + cLen, 4);
        octx.moveTo(total - 4 - cLen, 4);
        octx.lineTo(total - 4, 4);
        octx.lineTo(total - 4, 4 + cLen);
        octx.moveTo(4, total - 4 - cLen);
        octx.lineTo(4, total - 4);
        octx.lineTo(4 + cLen, total - 4);
        octx.moveTo(total - 4 - cLen, total - 4);
        octx.lineTo(total - 4, total - 4);
        octx.lineTo(total - 4, total - 4 - cLen);
        octx.stroke();

        // North ('U') Badge centered on top edge
        const nx = total * 0.5;
        const ny = 6.5;
        octx.beginPath();
        octx.arc(nx, ny, 7.2, 0, Math.PI * 2);
        octx.fillStyle = '#090d16';
        octx.fill();
        octx.lineWidth = 1.3;
        octx.strokeStyle = '#facc15';
        octx.stroke();
        octx.fillStyle = '#fef08a';
        octx.font = '900 8.5px system-ui, -apple-system, sans-serif';
        octx.textAlign = 'center';
        octx.textBaseline = 'middle';
        octx.fillText('U', nx, ny + 0.4);

        // Bottom-right expand (+) tactical badge
        const ex = total - 12;
        const ey = total - 12;
        octx.beginPath();
        octx.arc(ex, ey, 7.5, 0, Math.PI * 2);
        octx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        octx.fill();
        octx.lineWidth = 1.2;
        octx.strokeStyle = '#38bdf8';
        octx.stroke();
        octx.strokeStyle = '#e0f2fe';
        octx.lineWidth = 1.5;
        octx.beginPath();
        octx.moveTo(ex - 3, ey);
        octx.lineTo(ex + 3, ey);
        octx.moveTo(ex, ey - 3);
        octx.lineTo(ex, ey + 3);
        octx.stroke();
      }

      const overlayCanvas = document.createElement('canvas');
      overlayCanvas.width = Math.max(1, Math.round(viewSize * dpr));
      overlayCanvas.height = Math.max(1, Math.round(viewSize * dpr));
      const vctx = overlayCanvas.getContext('2d');
      if (vctx) {
        vctx.scale(dpr, dpr);
        const vig = vctx.createRadialGradient(
          viewSize * 0.5,
          viewSize * 0.5,
          viewSize * 0.25,
          viewSize * 0.5,
          viewSize * 0.5,
          viewSize * 0.72,
        );
        vig.addColorStop(0, 'rgba(9, 13, 22, 0)');
        vig.addColorStop(1, 'rgba(9, 13, 22, 0.34)');
        vctx.fillStyle = vig;
        vctx.fillRect(0, 0, viewSize, viewSize);

        vctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        vctx.lineWidth = 0.7;
        for (let i = 1; i <= 2; i++) {
          const g = (viewSize * i) / 3;
          vctx.beginPath();
          vctx.moveTo(g, 0);
          vctx.lineTo(g, viewSize);
          vctx.moveTo(0, g);
          vctx.lineTo(viewSize, g);
          vctx.stroke();
        }
      }

      bezelCacheRef.current = { key: cacheKey, outerCanvas, overlayCanvas };
      lastDrawSigRef.current = '';
    }

    const snap = getLiveMapSnapshot?.('minimap') ?? null;
    if (snap?.canvas && snap.canvas !== lastSnapCanvasRef.current) {
      lastSnapCanvasRef.current = snap.canvas;
      snapRevRef.current += 1;
    }

    const hasStarter = radar.blips.some((b) => b.kind === 'starter' || b.kind === 'swimsuit');
    const nowMs = performance.now();
    const pulseBucket = hasStarter ? Math.floor(nowMs / 180) : 0;
    const blipSig = radar.blips
      .map(
        (b) =>
          `${b.id}:${Math.round(b.x * 2)}:${Math.round(b.z * 2)}:${b.liberated ? 1 : 0}:${b.needsHelp ? 1 : 0}`,
      )
      .join('|');
    const drawSig = [
      cacheKey,
      radar.worldMode,
      Math.round(radar.heroX * 4),
      Math.round(radar.heroZ * 4),
      Math.round(radar.heroYaw * 20),
      Math.round(radar.camForwardX * 20),
      Math.round(radar.camForwardZ * 20),
      snap ? `${snapRevRef.current}:${Math.round(snap.bounds.centerX * 2)}:${Math.round(snap.bounds.centerZ * 2)}` : 'nosnap',
      pulseBucket,
      blipSig,
    ].join(';');

    if (!resized && drawSig === lastDrawSigRef.current) {
      return;
    }
    lastDrawSigRef.current = drawSig;

    const pulse = nowMs / 1000;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, targetW, targetH);

    // 1. Blit pre-rendered gold bezel, trim, brackets, North & Expand badges in one drawImage
    const cached = bezelCacheRef.current!;
    ctx.drawImage(cached.outerCanvas, 0, 0);

    // 2. Clip Inner Rounded-Square Tactical Map Viewport in CSS coordinates
    ctx.scale(dpr, dpr);
    ctx.save();
    drawRoundedRectPath(ctx, pad, pad, viewSize, viewSize, cornerR - 2);
    ctx.clip();

    ctx.fillStyle =
      radar.worldMode === 'dungeon'
        ? '#0b1220'
        : radar.worldMode === 'ocean'
        ? '#042f4b'
        : '#0f1e2e';
    ctx.fillRect(pad, pad, viewSize, viewSize);

    const fallbackBounds: LiveMapBounds =
      radar.worldMode === 'overworld'
        ? {
            worldMode: 'overworld',
            centerX: Math.max(-210, Math.min(195, radar.heroX)),
            centerZ: Math.max(-215, Math.min(175, radar.heroZ)),
            halfW: 36,
            halfH: 36,
          }
        : radar.worldMode === 'ocean'
        ? {
            worldMode: 'ocean',
            centerX: Math.max(-28, Math.min(28, radar.heroX)),
            centerZ: Math.max(-34, Math.min(24, radar.heroZ)),
            halfW: 18,
            halfH: 18,
          }
        : {
            worldMode: radar.worldMode,
            centerX: Math.max(-8, Math.min(8, radar.heroX)),
            centerZ: Math.max(-8, Math.min(8, radar.heroZ)),
            halfW: 15,
            halfH: 15,
          };

    const bounds = snap ? snap.bounds : fallbackBounds;
    if (snap) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(snap.canvas, pad, pad, viewSize, viewSize);
    }

    // Composite cached subtle MOBA tactical vignette & faint 3x3 coordinate grid
    ctx.drawImage(cached.overlayCanvas, pad, pad, viewSize, viewSize);

    // 3. Draw MOBA Camera Vision Cone from Hero World Position
    const heroPt = worldToMapPx(radar.heroX, radar.heroZ, bounds, pad, pad, viewSize, viewSize);
    drawVisionCone(
      ctx,
      heroPt.sx,
      heroPt.sy,
      radar.camForwardX,
      radar.camForwardZ,
      viewSize * 0.34,
    );

    // 4. Draw Exact World-Aligned Tactical Blips (with edge clamping inside rounded-square)
    const rank = (k: RadarBlipKind) =>
      k === 'starter' || k === 'swimsuit'
        ? 6
        : k === 'portal' || k === 'boss' || k === 'exit' || k === 'car'
        ? 5
        : k.startsWith('spot_') || k === 'guardian' || k === 'key' || k === 'prison'
        ? 4
        : k === 'door' || k === 'npc'
        ? 3
        : k === 'sea_monster' || k === 'sky_monster'
        ? 2
        : 1;
    const orderedBlips = [...radar.blips].sort((a, b) => rank(a.kind) - rank(b.kind));

    const minClampX = pad + 9;
    const maxClampX = pad + viewSize - 9;
    const minClampY = pad + 9;
    const maxClampY = pad + viewSize - 9;

    for (const b of orderedBlips) {
      const keepClamped =
        b.kind === 'starter' ||
        b.kind === 'swimsuit' ||
        b.kind === 'car' ||
        b.kind.startsWith('spot_') ||
        b.kind === 'npc' ||
        b.kind === 'portal' ||
        b.kind === 'boss' ||
        b.kind === 'exit' ||
        b.kind === 'key' ||
        b.kind === 'prison' ||
        b.kind === 'hero_friend';

      const pt = worldToMapPx(b.x, b.z, bounds, pad, pad, viewSize, viewSize);
      const outOfBox =
        pt.sx < minClampX || pt.sx > maxClampX || pt.sy < minClampY || pt.sy > maxClampY;

      if (outOfBox && !keepClamped) continue;

      const drawX = Math.max(minClampX, Math.min(maxClampX, pt.sx));
      const drawY = Math.max(minClampY, Math.min(maxClampY, pt.sy));
      const scale = outOfBox
        ? 0.72
        : b.kind === 'sea_monster' || b.kind === 'sky_monster'
        ? 0.92
        : b.kind === 'monster_brawl' || b.kind === 'monster_quiz'
        ? 0.8
        : 0.86;

      drawIcon(
        ctx,
        b.kind,
        drawX,
        drawY,
        b.color,
        Boolean(b.liberated),
        Boolean(b.needsHelp),
        pulse,
        scale,
      );
    }

    // 5. Hero Directional Chevron
    drawHeroArrow(ctx, heroPt.sx, heroPt.sy, radar.heroYaw, 0.92);

    ctx.restore(); // end inner viewport clip

    // Redraw top badges & corner accents cleanly over the clipped viewport edge
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Only redraw the cached frame's crisp edge accents by clipping outside inner box or drawing frame on top?
    // Wait: North badge & expand badge overlap the inner viewport slightly, so compositing outerCanvas first clipped them under the map!
    // Solution: let's keep outer frame drawn first, and redraw only the 2 small top/bottom-right badges cleanly OR split bezel vs badges.
    // Even simpler: draw outerCanvas AFTER inner viewport would cover inner map because outerCanvas fills dark #090d16. Let's NOT change visual overlap — drawing North badge + Expand badge takes 8 canvas primitives (microseconds), while the linear gradient + vignette + 3x3 grid + rounded paths stay cached!
    ctx.scale(dpr, dpr);
    drawRoundedRectPath(ctx, pad, pad, viewSize, viewSize, cornerR - 2);
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.48)';
    ctx.stroke();

    const nx = total * 0.5;
    const ny = 6.5;
    ctx.beginPath();
    ctx.arc(nx, ny, 7.2, 0, Math.PI * 2);
    ctx.fillStyle = '#090d16';
    ctx.fill();
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.font = '900 8.5px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('U', nx, ny + 0.4);

    const ex = total - 12;
    const ey = total - 12;
    ctx.beginPath();
    ctx.arc(ex, ey, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ex - 3, ey);
    ctx.lineTo(ex + 3, ey);
    ctx.moveTo(ex, ey - 3);
    ctx.lineTo(ex, ey + 3);
    ctx.stroke();

    ctx.restore();
  }, [radar, size, getLiveMapSnapshot]);

  return (
    <button
      type="button"
      onClick={onOpenMap}
      title="Peta Taktis 3D Nyata (Klik untuk perbesar Peta Wilayah / Gua)"
      className="pointer-events-auto group relative flex items-center justify-center rounded-2xl shadow-xl transition-transform active:scale-95"
      style={{ width: size + 16, height: size + 16 }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size + 16, height: size + 16 }}
        className="block"
      />
    </button>
  );
});

// =========================================================
// INTERACTIVE LIVE 3D SHRUNK FULL-ZONE MAP (OVERWORLD / CAVE / ACADEMY)
// =========================================================
interface MapSpotDef {
  id: string;
  zoneId?: ZoneId;
  x: number;
  z: number;
  kind: RadarBlipKind;
  color: string;
  shortLabel: string;
}

const KINGDOM_SPOTS: MapSpotDef[] = [
  {
    id: 'starter',
    x: OVERWORLD_ANCHORS.starterWeapon.x,
    z: OVERWORLD_ANCHORS.starterWeapon.z,
    kind: 'starter',
    color: '#38bdf8',
    shortLabel: 'Senjata Awal',
  },
  {
    id: 'swimsuit',
    x: OVERWORLD_ANCHORS.swimSuit.x,
    z: OVERWORLD_ANCHORS.swimSuit.z,
    kind: 'swimsuit',
    color: '#22d3ee',
    shortLabel: 'Pakaian Renang',
  },
  {
    id: 'desa',
    zoneId: 'desa_sapaan',
    x: OVERWORLD_ANCHORS.zones.desa_sapaan.x,
    z: OVERWORLD_ANCHORS.zones.desa_sapaan.z,
    kind: 'spot_desa',
    color: '#f59e0b',
    shortLabel: 'Desa Sapaan',
  },
  {
    id: 'pasar',
    zoneId: 'pasar_rasa',
    x: OVERWORLD_ANCHORS.zones.pasar_rasa.x,
    z: OVERWORLD_ANCHORS.zones.pasar_rasa.z,
    kind: 'spot_pasar',
    color: '#ef4444',
    shortLabel: 'Pasar Rasa',
  },
  {
    id: 'satwa',
    zoneId: 'hutan_satwa',
    x: OVERWORLD_ANCHORS.zones.hutan_satwa.x,
    z: OVERWORLD_ANCHORS.zones.hutan_satwa.z,
    kind: 'spot_satwa',
    color: '#10b981',
    shortLabel: 'Kebun Satwa',
  },
  {
    id: 'gerbang',
    zoneId: 'gerbang_kota',
    x: OVERWORLD_ANCHORS.zones.gerbang_kota.x,
    z: OVERWORLD_ANCHORS.zones.gerbang_kota.z,
    kind: 'spot_gerbang',
    color: '#3b82f6',
    shortLabel: 'Gerbang Kota',
  },
  {
    id: 'menara',
    zoneId: 'menara_waktu',
    x: OVERWORLD_ANCHORS.zones.menara_waktu.x,
    z: OVERWORLD_ANCHORS.zones.menara_waktu.z,
    kind: 'spot_menara',
    color: '#8b5cf6',
    shortLabel: 'Menara Jam',
  },
  {
    id: 'gua',
    zoneId: 'gua_portal',
    x: OVERWORLD_ANCHORS.zones.gua_portal.x,
    z: OVERWORLD_ANCHORS.zones.gua_portal.z,
    kind: 'spot_gua',
    color: '#a855f7',
    shortLabel: 'Gua Kristal',
  },
  {
    id: 'portal',
    x: OVERWORLD_ANCHORS.istanaFloating.x,
    z: OVERWORLD_ANCHORS.istanaFloating.z,
    kind: 'portal',
    color: '#a855f7',
    shortLabel: IELTS_TEMPORARILY_LOCKED ? 'Istana (Segera)' : 'Istana IELTS',
  },
];

export const Kingdom3DMap: React.FC<Kingdom3DMapProps> = ({
  radar,
  liberatedZones,
  starterPicked,
  swimSuitPicked = false,
  dungeonName,
  getLiveMapSnapshot,
  onSelectZone,
  onSelectPortal,
  onSelectSwimSuit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hitZonesRef = useRef<
    Array<{ x: number; y: number; r: number; zoneId?: ZoneId; isPortal?: boolean; isSwimSuit?: boolean }>
  >([]);

  const radarRef = useRef(radar);
  radarRef.current = radar;
  const liberatedRef = useRef(liberatedZones);
  liberatedRef.current = liberatedZones;
  const starterPickedRef = useRef(starterPicked);
  starterPickedRef.current = starterPicked;
  const swimSuitPickedRef = useRef(swimSuitPicked);
  swimSuitPickedRef.current = swimSuitPicked;
  const getSnapRef = useRef(getLiveMapSnapshot);
  getSnapRef.current = getLiveMapSnapshot;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = 640;
    const height = 400;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawFrame = () => {
      const curRadar = radarRef.current;
      const curLiberated = liberatedRef.current;
      const curStarterPicked = starterPickedRef.current;
      const curSwimSuitPicked = swimSuitPickedRef.current;
      const snap = getSnapRef.current?.('full') ?? null;
      const worldMode = snap?.bounds.worldMode ?? curRadar?.worldMode ?? 'overworld';
      const pulse = performance.now() / 1000;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle =
        worldMode === 'dungeon'
          ? '#090e1a'
          : worldMode === 'academy'
          ? '#17153b'
          : worldMode === 'ocean'
          ? '#042f4b'
          : '#0b1824';
      ctx.fillRect(0, 0, width, height);

      const fallbackBounds: LiveMapBounds =
        worldMode === 'overworld'
          ? { worldMode: 'overworld', centerX: -6, centerZ: -26, halfW: 368, halfH: 230 }
          : worldMode === 'ocean'
          ? { worldMode: 'ocean', centerX: 0, centerZ: -6, halfW: 48, halfH: 30 }
          : { worldMode, centerX: 0, centerZ: 0, halfW: 36.8, halfH: 23 };
      const bounds = snap ? snap.bounds : fallbackBounds;

      if (snap) {
        ctx.drawImage(snap.canvas, 0, 0, width, height);
      }

      // Subtle Mobile Legends / Honor of Kings tactical grid & vignette overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let gx = 1; gx < 8; gx++) {
        const px = (width * gx) / 8;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, height);
        ctx.stroke();
      }
      for (let gy = 1; gy < 5; gy++) {
        const py = (height * gy) / 5;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
        ctx.stroke();
      }

      const hits: Array<{
        x: number;
        y: number;
        r: number;
        zoneId?: ZoneId;
        isPortal?: boolean;
        isSwimSuit?: boolean;
      }> = [];

      if (worldMode === 'overworld') {
        // Active night/roaming/sea/sky monsters from live radar blips
        if (curRadar) {
          for (const b of curRadar.blips) {
            if (
              b.kind !== 'monster_brawl' &&
              b.kind !== 'monster_quiz' &&
              b.kind !== 'sea_monster' &&
              b.kind !== 'sky_monster' &&
              b.kind !== 'car'
            ) {
              continue;
            }
            const mp = worldToMapPx(b.x, b.z, bounds, 0, 0, width, height);
            drawIcon(
              ctx,
              b.kind,
              mp.sx,
              mp.sy,
              b.color,
              false,
              false,
              pulse,
              b.kind === 'car' ? 1.05 : b.kind === 'sea_monster' || b.kind === 'sky_monster' ? 1.0 : 0.9,
            );
          }
        }

        for (const sp of KINGDOM_SPOTS) {
          if (sp.id === 'starter' && curStarterPicked) continue;
          if (sp.id === 'swimsuit' && curSwimSuitPicked) continue;
          const lib = sp.zoneId ? curLiberated.includes(sp.zoneId) : false;
          const pt = worldToMapPx(sp.x, sp.z, bounds, 0, 0, width, height);

          // Ground ring
          ctx.beginPath();
          ctx.arc(pt.sx, pt.sy, 13, 0, Math.PI * 2);
          ctx.fillStyle = lib ? 'rgba(34, 197, 94, 0.2)' : 'rgba(15, 23, 42, 0.55)';
          ctx.fill();
          ctx.strokeStyle =
            sp.kind === 'portal'
              ? '#c084fc'
              : sp.kind === 'swimsuit'
              ? '#22d3ee'
              : lib
              ? '#4ade80'
              : '#facc15';
          ctx.lineWidth = 1.6;
          ctx.stroke();

          drawIcon(
            ctx,
            sp.kind,
            pt.sx,
            pt.sy,
            sp.color,
            lib,
            !lib && sp.kind !== 'portal',
            pulse,
            1.1,
          );

          ctx.font = '800 10.5px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.lineWidth = 3.2;
          ctx.strokeStyle = '#090d16';
          ctx.strokeText(sp.shortLabel, pt.sx, pt.sy + 14);
          ctx.fillStyle =
            sp.kind === 'portal'
              ? '#e9d5ff'
              : sp.kind === 'swimsuit'
              ? '#67e8f9'
              : lib
              ? '#86efac'
              : '#fef08a';
          ctx.fillText(sp.shortLabel, pt.sx, pt.sy + 14);

          if (sp.zoneId) {
            hits.push({ x: pt.sx, y: pt.sy, r: 26, zoneId: sp.zoneId });
          } else if (sp.kind === 'portal') {
            hits.push({ x: pt.sx, y: pt.sy, r: 26, isPortal: true });
          } else if (sp.kind === 'swimsuit') {
            hits.push({ x: pt.sx, y: pt.sy, r: 26, isSwimSuit: true });
          }
        }
      } else if (curRadar) {
        // Cave ('dungeon') OR Istana IELTS ('academy'): render all live zone entities directly over true 3D capture!
        const labelForBlip = (kind: RadarBlipKind, id: string, raw?: string): string => {
          if (raw) return raw;
          if (kind === 'door') {
            const idx = Number(id.replace('door_', ''));
            return Number.isFinite(idx) ? `Pintu ${idx + 1}` : 'Pintu';
          }
          if (kind === 'craft') return 'Meja Craft';
          if (kind === 'chest') return 'Peti Senjata';
          if (kind === 'collectible') return 'Item Bawah Laut';
          if (kind === 'guardian') return 'Penjaga Gua';
          if (kind === 'key') return 'Kunci Penjara';
          if (kind === 'prison') return 'Penjara';
          if (kind === 'exit') return 'Keluar';
          if (kind === 'boss') return 'BOS GUA';
          if (kind === 'npc') return 'Penguji';
          return '';
        };

        for (const b of curRadar.blips) {
          const pt = worldToMapPx(b.x, b.z, bounds, 0, 0, width, height);
          const isMob =
            b.kind === 'monster_brawl' ||
            b.kind === 'monster_quiz' ||
            b.kind === 'sea_monster';
          drawIcon(
            ctx,
            b.kind,
            pt.sx,
            pt.sy,
            b.color,
            Boolean(b.liberated),
            Boolean(b.needsHelp),
            pulse,
            isMob ? 0.92 : 1.12,
          );
          if (!isMob) {
            const txt = labelForBlip(b.kind, b.id, b.label);
            if (txt) {
              ctx.font = '800 10px system-ui, -apple-system, sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';
              ctx.lineWidth = 3;
              ctx.strokeStyle = '#090d16';
              ctx.strokeText(txt, pt.sx, pt.sy + 11);
              ctx.fillStyle = b.liberated ? '#86efac' : b.kind === 'boss' ? '#fecaca' : '#fef08a';
              ctx.fillText(txt, pt.sx, pt.sy + 11);
            }
          }
        }
      }

      // Show Live Hero Arrow + Camera Vision Cone + 'KAMU' Label
      if (curRadar && curRadar.worldMode === worldMode) {
        const hp = worldToMapPx(curRadar.heroX, curRadar.heroZ, bounds, 0, 0, width, height);
        drawVisionCone(ctx, hp.sx, hp.sy, curRadar.camForwardX, curRadar.camForwardZ, 78);
        drawHeroArrow(ctx, hp.sx, hp.sy, curRadar.heroYaw, 1.18);

        ctx.font = '900 10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 3;
        ctx.strokeText('KAMU', hp.sx, hp.sy - 11);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('KAMU', hp.sx, hp.sy - 11);
      }

      // Tactical MOBA corner reticle accents + North Compass pill-free tag
      ctx.fillStyle = 'rgba(9, 13, 22, 0.78)';
      drawRoundedRectPath(ctx, 10, 10, 180, 24, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = '800 10.5px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const zoneTitle =
        worldMode === 'dungeon'
          ? `GUA: ${dungeonName || 'WILAYAH'}`
          : worldMode === 'academy'
          ? 'ISTANA IELTS 3D'
          : worldMode === 'ocean'
          ? 'LAUTAN SURVIVAL 3D'
          : 'KERAJAAN KATA 3D';
      ctx.fillText(zoneTitle.slice(0, 26), 18, 22);

      // North indicator top-right
      ctx.beginPath();
      ctx.arc(width - 22, 22, 11, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.font = '900 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('U', width - 22, 22.5);

      hitZonesRef.current = hits;
      ctx.restore();
    };

    drawFrame();
    const timer = window.setInterval(() => {
      if (!document.hidden) drawFrame();
    }, 280);
    return () => window.clearInterval(timer);
  }, [radar?.worldMode, dungeonName]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 640;
    const y = ((e.clientY - rect.top) / rect.height) * 400;
    for (const h of hitZonesRef.current) {
      if (Math.hypot(x - h.x, y - h.y) <= h.r) {
        if (h.isSwimSuit && onSelectSwimSuit) {
          onSelectSwimSuit();
          return;
        }
        if (h.isPortal && onSelectPortal) {
          onSelectPortal();
          return;
        }
        if (h.zoneId && onSelectZone) {
          onSelectZone(h.zoneId);
          return;
        }
      }
    }
  };

  const activeMode = radar?.worldMode ?? 'overworld';

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-amber-400/70 bg-[#090d16] shadow-[0_10px_28px_rgba(0,0,0,0.65)] ring-1 ring-amber-200/20">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className={`block aspect-[16/10] w-full ${
          activeMode === 'overworld' ? 'cursor-pointer' : 'cursor-default'
        }`}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-amber-300/30 bg-slate-950/90 px-3 py-2 text-[11px] font-bold text-slate-200">
        {activeMode === 'overworld' ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="spot_gua" className="h-4 w-4" />
                <span>Gua Portal</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="spot_satwa" className="h-4 w-4" />
                <span>Tempat Hewan</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="spot_desa" className="h-4 w-4" />
                <span>Desa</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="spot_pasar" className="h-4 w-4" />
                <span>Pasar</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="spot_gerbang" className="h-4 w-4" />
                <span>Gerbang</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="spot_menara" className="h-4 w-4" />
                <span>Menara</span>
              </span>
              {!swimSuitPicked && (
                <span className="inline-flex items-center gap-1">
                  <SpotLegendIcon kind="swimsuit" className="h-4 w-4" />
                  <span className="text-cyan-300">Pakaian Renang</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="car" className="h-4 w-4" />
                <span className="text-sky-300">Mobil</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="monster_brawl" className="h-4 w-4" />
                <span>Monster</span>
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-amber-300">
              Peta 3D Nyata · Klik spot wilayah untuk teleport
            </span>
          </>
        ) : activeMode === 'dungeon' ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="door" className="h-4 w-4" />
                <span>Pintu Kata</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="craft" className="h-4 w-4" />
                <span>Meja Craft</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="chest" className="h-4 w-4" />
                <span>Peti</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="key" className="h-4 w-4" />
                <span>Kunci</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="prison" className="h-4 w-4" />
                <span>Penjara</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="exit" className="h-4 w-4" />
                <span>Keluar</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="monster_brawl" className="h-4 w-4" />
                <span>Monster</span>
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-cyan-300">
              Peta 3D Nyata Gua · Atap dibuka otomatis agar jalur terlihat
            </span>
          </>
        ) : activeMode === 'ocean' ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="exit" className="h-4 w-4" />
                <span>Pelampung Naik</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="chest" className="h-4 w-4" />
                <span>Peti Selam</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="sea_monster" className="h-4 w-4" />
                <span>Monster Palung</span>
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-cyan-300">
              Peta 3D Nyata Bawah Laut · Karang Dangkal → Terumbu Senja → Palung Abyssal
            </span>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="portal" className="h-4 w-4" />
                <span>Penguji &amp; Tahta</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="monster_quiz" className="h-4 w-4" />
                <span>Bayangan Ujian</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <SpotLegendIcon kind="exit" className="h-4 w-4" />
                <span>Portal Keluar</span>
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-purple-300">
              Peta 3D Nyata Aula Istana IELTS
            </span>
          </>
        )}
      </div>
    </div>
  );
};
