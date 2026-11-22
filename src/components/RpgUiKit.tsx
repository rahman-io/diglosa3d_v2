import React from 'react';

interface RpgBoardPanelProps {
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  compact?: boolean;
}

/**
 * 9-slice RPG dialogue/story/challenge board framed with carved wood & gold corners.
 * Uses matching borderWidth and borderImageWidth so inner content never overlaps
 * the wood/gold borders and maintains balanced margins at any viewport size.
 */
export const RpgBoardPanel: React.FC<RpgBoardPanelProps> = ({
  children,
  className = '',
  bodyClassName = '',
  compact = false,
}) => (
  <div
    style={{
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderWidth: compact ? '10px 14px 10px 14px' : '20px 24px 20px 24px',
      borderImageSource: "url('./assets/ui/ui_board_panel.png')",
      borderImageSlice: '64 74 64 74 fill',
      borderImageWidth: compact ? '10px 14px 10px 14px' : '20px 24px 20px 24px',
      borderImageRepeat: 'stretch',
    }}
    className={`relative text-slate-100 drop-shadow-[0_18px_36px_rgba(0,0,0,0.65)] ${className}`}
  >
    <div
      className={`${
        compact ? 'px-1.5 pb-1 pt-1' : 'px-2 pb-2 pt-1.5 sm:px-3 sm:pb-2.5 sm:pt-2'
      } ${bodyClassName}`}
    >
      {children}
    </div>
  </div>
);

interface RpgNameplateProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 9-slice parchment-and-wood nameplate banner (Lost Legends speaker ribbon).
 */
export const RpgNameplate: React.FC<RpgNameplateProps> = ({ children, className = '' }) => (
  <div
    style={{
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderWidth: '10px 20px 10px 20px',
      borderImageSource: "url('./assets/ui/ui_nameplate.png')",
      borderImageSlice: '36 68 36 68 fill',
      borderImageWidth: '10px 20px 10px 20px',
      borderImageRepeat: 'stretch',
    }}
    className={`inline-flex max-w-full items-center px-1.5 py-0.5 text-[#3b1b06] drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)] ${className}`}
  >
    {children}
  </div>
);

interface RpgAvatarFrameProps {
  accentColor: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Square carved wood-and-gold portrait frame with transparent inner window.
 */
export const RpgAvatarFrame: React.FC<RpgAvatarFrameProps> = ({
  accentColor,
  children,
  className = '',
}) => (
  <div
    className={`relative flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14 ${className}`}
  >
    <div
      className="flex h-[74%] w-[74%] items-center justify-center rounded-lg text-white shadow-inner"
      style={{ backgroundColor: accentColor }}
    >
      {children}
    </div>
    <img
      src="./assets/ui/ui_avatar_frame.png"
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]"
      draggable={false}
    />
  </div>
);

export type RpgPillVariant = 'green' | 'gold' | 'cream' | 'orange' | 'red';

interface RpgPillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: RpgPillVariant;
  size?: 'md' | 'sm';
  children: React.ReactNode;
}

const PILL_STYLES: Record<
  RpgPillVariant,
  { img: string; slice: string; textClass: string }
> = {
  green: {
    img: "url('./assets/ui/ui_pill_green.png')",
    slice: '32 76 32 76 fill',
    textClass: 'text-white drop-shadow-[0_1px_2px_rgba(6,78,59,0.95)]',
  },
  gold: {
    img: "url('./assets/ui/ui_pill_gold.png')",
    slice: '32 76 32 76 fill',
    textClass: 'text-[#3b1b06] drop-shadow-[0_1px_0_rgba(255,255,255,0.45)]',
  },
  cream: {
    img: "url('./assets/ui/ui_pill_cream.png')",
    slice: '32 76 32 76 fill',
    textClass: 'text-[#451a03]',
  },
  orange: {
    img: "url('./assets/ui/ui_pill_orange.png')",
    slice: '76 172 76 172 fill',
    textClass: 'text-white drop-shadow-[0_1.5px_3px_rgba(124,45,18,0.95)]',
  },
  red: {
    img: "url('./assets/ui/ui_pill_red.png')",
    slice: '76 172 76 172 fill',
    textClass: 'text-white drop-shadow-[0_1.5px_3px_rgba(127,29,29,0.95)]',
  },
};

/**
 * Horizontal 9-slice RPG capsule pill button that keeps circular end-caps at any width
 * and guarantees safe interior padding so text never touches the pill borders.
 */
export const RpgPillButton: React.FC<RpgPillButtonProps> = ({
  variant = 'gold',
  size = 'md',
  children,
  className = '',
  type = 'button',
  ...rest
}) => {
  const cfg = PILL_STYLES[variant];
  const borderWidth = size === 'sm' ? '7px 16px 7px 16px' : '10px 22px 10px 22px';
  const sizeClass =
    size === 'sm'
      ? 'min-h-[36px] px-1.5 py-0 text-xs leading-tight'
      : 'min-h-[46px] px-2 py-0.5 text-xs leading-snug sm:text-sm';

  return (
    <button
      type={type}
      {...rest}
      style={{
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderWidth,
        borderImageSource: cfg.img,
        borderImageSlice: cfg.slice,
        borderImageWidth: borderWidth,
        borderImageRepeat: 'stretch',
      }}
      className={`inline-flex items-center justify-center gap-2 text-center font-black transition hover:brightness-105 active:translate-y-0.5 disabled:opacity-50 ${sizeClass} ${cfg.textClass} ${className}`}
    >
      {children}
    </button>
  );
};

interface RpgTimerBarProps {
  pct: number;
  barClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Carved wood & gold RPG timer bezel with an animated glowing energy track inside.
 */
export const RpgTimerBar: React.FC<RpgTimerBarProps> = ({
  pct,
  barClassName = 'bg-amber-400',
  className = '',
  children,
}) => (
  <div
    style={{
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderWidth: '7px 20px 7px 20px',
      borderImageSource: "url('./assets/ui/ui_timer_frame.png')",
      borderImageSlice: '62 165 62 165 fill',
      borderImageWidth: '7px 20px 7px 20px',
      borderImageRepeat: 'stretch',
    }}
    className={`w-full ${className}`}
  >
    <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-950/85 px-0.5 sm:h-3.5">
      <div
        className={`h-full rounded-full transition-all duration-75 ${barClassName}`}
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
      {children}
    </div>
  </div>
);

export type RpgChoiceTone = 'default' | 'muted' | 'locked' | 'selected' | 'correct' | 'wrong';

interface RpgChoiceCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: RpgChoiceTone;
  children: React.ReactNode;
}

const CHOICE_TONE_CLASS: Record<RpgChoiceTone, string> = {
  default: 'text-white hover:brightness-115 active:translate-y-0.5',
  muted: 'text-slate-200/85 opacity-85 cursor-not-allowed',
  locked: 'text-slate-400 line-through opacity-50 cursor-not-allowed grayscale',
  selected:
    'text-amber-100 ring-2 ring-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.45)] brightness-110',
  correct:
    'text-emerald-100 ring-2 ring-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.55)] bg-emerald-900/45',
  wrong:
    'text-rose-100 ring-2 ring-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.45)] bg-rose-900/45',
};

/**
 * 9-slice dark slate-indigo stone tablet card with antique gold bevel for quiz options.
 */
export const RpgChoiceCard: React.FC<RpgChoiceCardProps> = ({
  tone = 'default',
  children,
  className = '',
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    {...rest}
    style={{
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderWidth: '8px 10px 8px 10px',
      borderImageSource: "url('./assets/ui/ui_choice_card.png')",
      borderImageSlice: '52 52 52 52 fill',
      borderImageWidth: '8px 10px 8px 10px',
      borderImageRepeat: 'stretch',
    }}
    className={`rounded-xl px-1.5 py-1 text-left font-bold transition ${CHOICE_TONE_CLASS[tone]} ${className}`}
  >
    {children}
  </button>
);
