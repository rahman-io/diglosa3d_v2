import React, { useEffect, useRef, useState } from 'react';
import {
  Heart,
  HelpCircle,
  Info,
  Lightbulb,
  Lock,
  Mic,
  MicOff,
  ParkingCircle,
  RotateCw,
  Search,
  User as UserIcon,
  X,
  Zap,
} from 'lucide-react';
import {
  VOICE_COMMAND_CATALOG,
  VoiceCommandCategory,
} from '../services/voiceCommandService';
import {
  ACADEMY_NPCS,
  AMMO_COST,
  getActiveZoneNpcDef,
  getZoneNpcById,
  MAX_AMMO,
  NPC_CATALOG,
  WEAPON_ORDER,
  getHotbarSlotForWeapon,
  isWeaponHotbarSlot,
  WEAPONS,
  ZONE_DOORS,
} from '../data/diglosaCatalog';
import { CameraMode, DivingGearId, LiveMapSnapshot, OceanMaterials, PlaneAmmoType, RpgHudSnapshot, SwimStyleId, SwimStylePreference, WeaponId } from '../types/game';
import { DIVING_GEAR_DEFS } from '../three/oceanWorld';
import { SEA_BIOTA_CATALOG } from '../three/seaBiotaCatalog';
import { getWeaponThumbnails } from '../utils/weaponThumbnails';
import { RadarMinimap, StarterWeaponPixelIcon, SwimSuitIcon } from './RadarMinimap';
import { WeaponPreviewCanvas } from './WeaponPreviewCanvas';
import { HUD_TUTORIAL_STEPS, HudTutorialOverlay } from './HudTutorialOverlay';
import { scrollFieldIntoView, useVisualViewport } from '../utils/useVisualViewport';

const CAMERA_VIEW_LABELS: Record<CameraMode, string> = {
  third_back: 'Kamera Belakang',
  first_person: 'Sudut Orang Pertama (FPS)',
  third_front: 'Kamera Depan',
  orbit: 'Kamera Bebas',
};

const SWIM_STYLE_OPTIONS: Array<{
  num: number;
  id: SwimStyleId;
  name: string;
  indo: string;
  spd: string;
}> = [
  { num: 1, id: 'surface_paddle', name: 'Surface Paddle', indo: 'Gaya Dada', spd: 'Normal' },
  { num: 2, id: 'front_crawl', name: 'Front Crawl', indo: 'Gaya Bebas', spd: 'Fast' },
  { num: 3, id: 'underwater_glide', name: 'Underwater Glide', indo: 'Meluncur', spd: 'Very Fast' },
  { num: 4, id: 'jump_dive', name: 'Jump Dive', indo: 'Terjun Bebas', spd: 'Fast' },
  { num: 5, id: 'deep_submerge', name: 'Deep Submerge', indo: 'Menyelam Dalam', spd: 'Depth' },
  { num: 6, id: 'scuba_explore', name: 'Scuba Explore', indo: 'Eksplorasi Scuba', spd: 'Gear' },
  { num: 7, id: 'water_tread', name: 'Water Tread', indo: 'Mengapung', spd: 'Idle' },
  { num: 8, id: 'quick_dodge', name: 'Quick Dodge', indo: 'Manuver Aman', spd: 'Fast' },
  { num: 9, id: 'water_dash', name: 'Water Dash', indo: 'Mencoba Cepat', spd: 'Burst' },
  { num: 10, id: 'backstroke', name: 'Backstroke', indo: 'Gaya Punggung', spd: 'Slow' },
];

const PLANE_AMMO_OPTIONS: Array<{
  id: PlaneAmmoType;
  key: string;
  label: string;
  shortLabel: string;
  img: string;
  activeBorder: string;
}> = [
  {
    id: 'vulcan',
    key: '1',
    label: '20mm Vulcan (Cepat)',
    shortLabel: 'Vulcan',
    img: './assets/ui/ammo_plane_vulcan.png',
    activeBorder: 'border-sky-300 bg-sky-500/25 text-sky-100 ring-1 ring-sky-300/80',
  },
  {
    id: 'missile',
    key: '2',
    label: 'Rudal Pencari Target',
    shortLabel: 'Rudal',
    img: './assets/ui/ammo_plane_missile.png',
    activeBorder: 'border-emerald-300 bg-emerald-500/25 text-emerald-100 ring-1 ring-emerald-300/80',
  },
  {
    id: 'bomb',
    key: '3',
    label: 'Bom Pintar AoE (Jatuh)',
    shortLabel: 'Bom',
    img: './assets/ui/ammo_plane_bomb.png',
    activeBorder: 'border-amber-300 bg-amber-500/25 text-amber-100 ring-1 ring-amber-300/80',
  },
  {
    id: 'plasma',
    key: '4',
    label: 'Roket Plasma Penembus',
    shortLabel: 'Plasma',
    img: './assets/ui/ammo_plane_plasma.png',
    activeBorder: 'border-cyan-300 bg-cyan-500/25 text-cyan-100 ring-1 ring-cyan-300/80',
  },
];

interface RpgHudProps {
  hud: RpgHudSnapshot;
  muted: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onSelectHotbar: (slot: number) => void;
  onPause: () => void;
  onOpenBag: () => void;
  onOpenKamus: () => void;
  onOpenQuests: () => void;
  onOpenMap: () => void;
  onOpenGuide: () => void;
  onOpenOptions: () => void;
  onOpenLeaderboard: () => void;
  onOpenProfile?: () => void;
  onPrimaryAction: () => void;
  onFireWeapon: () => void;
  onSetFireHeld: (held: boolean) => void;
  onBuyAmmo?: () => void;
  onToggleAim: () => void;
  onToggleAimMode: () => void;
  onSetSwimStyle?: (style: SwimStylePreference) => void;
  onCycleSwimStyle?: () => void;
  onTogglePointerLock: () => void;
  onJump: () => void;
  onOpenCrafting: () => void;
  onVirtualMove: (vx: number, vz: number) => void;
  onExitDungeon: () => void;
  onEnterOcean?: () => void;
  onDiveOcean?: () => void;
  onGoToSwimSuit?: () => void;
  onOceanVertical?: (dir: 'up' | 'down', held: boolean) => void;
  onToggleOceanTurtle?: () => void;
  onCraftDivingGear?: (gearId: DivingGearId, method: 'craft' | 'diamond') => void;
  onEatOceanFood?: () => void;
  getLiveMapSnapshot?: (kind: 'minimap' | 'full') => LiveMapSnapshot | null;
  voiceListening?: boolean;
  voiceSupported?: boolean;
  voiceTranscript?: string;
  voiceLastAction?: string;
  onToggleVoice?: () => void;
  multiplayerActive?: boolean;
  onHelpTeammate?: () => void;
  onToggleCar?: () => void;
  onCarControl?: (
    ctrl: 'gas' | 'brake' | 'left' | 'right' | 'handbrake' | 'boost',
    held: boolean,
  ) => void;
  onToggleCarHandbrake?: () => void;
  onToggleCarHeadlights?: () => void;
  onCarHorn?: () => void;
  onTogglePlane?: () => void;
  onPlaneControl?: (
    ctrl: 'gas' | 'brake' | 'left' | 'right' | 'climb' | 'descend' | 'boost',
    held: boolean,
  ) => void;
  onSelectPlaneAmmo?: (ammo: PlaneAmmoType) => void;
  onFirePlaneWeapon?: () => void;
  onSetPlaneFireHeld?: (held: boolean) => void;
  tutorialRunKey?: number;
  suppressTutorial?: boolean;
}

const ResilientMedallionImg: React.FC<{
  src: string;
  className?: string;
  fallback: React.ReactNode;
}> = ({ src, className = 'scale-[1.12] object-cover', fallback }) => {
  const [attempt, setAttempt] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [cacheBust, setCacheBust] = useState<number>(() => Date.now());

  useEffect(() => {
    setAttempt(0);
    setCacheBust(Date.now());
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [src]);

  useEffect(() => {
    if (attempt !== 1) return;
    let cancelled = false;
    const controller = new AbortController();
    const bustUrl = `${src}${src.includes('?') ? '&' : '?'}cb=${Date.now()}`;
    fetch(bustUrl, { cache: 'no-store', signal: controller.signal })
      .then(async (res) => {
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        if (!res.ok || ct.includes('text/html')) {
          throw new Error(`Invalid image response: ${res.status} ${ct}`);
        }
        const blob = await res.blob();
        if (blob.size === 0 || (blob.type && blob.type.includes('html'))) {
          throw new Error('Invalid image blob');
        }
        const objUrl = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(objUrl);
          return;
        }
        setBlobUrl(objUrl);
      })
      .catch((err) => {
        if (cancelled || (err instanceof Error && err.name === 'AbortError')) return;
        setCacheBust(Date.now());
        setAttempt(2);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [attempt, src]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  if (attempt >= 3) {
    return (
      <span className="pointer-events-none flex h-full w-full items-center justify-center rounded-full bg-slate-900/95">
        {fallback}
      </span>
    );
  }

  const resolvedSrc =
    blobUrl ??
    (attempt === 2 ? `${src}${src.includes('?') ? '&' : '?'}v=${cacheBust}` : src);

  return (
    <span className="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-slate-950">
      <img
        src={resolvedSrc}
        alt=""
        className={`pointer-events-none h-full w-full select-none ${className}`}
        draggable={false}
        onLoad={(e) => {
          if (e.currentTarget.naturalWidth === 0) {
            setAttempt((prev) => (prev < 3 ? prev + 1 : 3));
          }
        }}
        onError={() => {
          setBlobUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
          setAttempt((prev) => (prev < 3 ? prev + 1 : 3));
        }}
      />
    </span>
  );
};

export const RpgHud: React.FC<RpgHudProps> = ({
  hud,
  muted,
  onToggleMute,
  onToggleCamera,
  onSelectHotbar,
  onPause,
  onOpenBag,
  onOpenKamus,
  onOpenQuests,
  onOpenMap,
  onOpenGuide,
  onOpenOptions,
  onOpenLeaderboard,
  onOpenProfile,
  onPrimaryAction,
  onFireWeapon,
  onSetFireHeld,
  onBuyAmmo,
  onToggleAim,
  onToggleAimMode,
  onSetSwimStyle,
  onCycleSwimStyle,
  onTogglePointerLock,
  onJump,
  onOpenCrafting,
  onVirtualMove,
  onExitDungeon,
  onEnterOcean,
  onDiveOcean,
  onGoToSwimSuit,
  onOceanVertical,
  onToggleOceanTurtle,
  onCraftDivingGear,
  onEatOceanFood,
  getLiveMapSnapshot,
  voiceListening = false,
  voiceSupported = true,
  voiceTranscript = '',
  voiceLastAction = '',
  onToggleVoice,
  multiplayerActive = false,
  onHelpTeammate,
  onToggleCar,
  onCarControl,
  onToggleCarHandbrake,
  onToggleCarHeadlights,
  onCarHorn,
  onTogglePlane,
  onPlaneControl,
  onSelectPlaneAmmo,
  onFirePlaneWeapon,
  onSetPlaneFireHeld,
  tutorialRunKey = 0,
  suppressTutorial = false,
}) => {
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [touchUsed, setTouchUsed] = useState(false);
  const [isSmallViewport, setIsSmallViewport] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hotbarOpen, setHotbarOpen] = useState(false);
  const [swimMenuOpen, setSwimMenuOpen] = useState(false);
  const [oceanGearOpen, setOceanGearOpen] = useState(false);
  const [voiceHelpOpen, setVoiceHelpOpen] = useState(false);
  const [voiceSearch, setVoiceSearch] = useState('');
  const voiceModalVp = useVisualViewport(voiceHelpOpen);
  const [inspectedHotbar, setInspectedHotbar] = useState<
    | { kind: 'weapon'; id: WeaponId }
    | { kind: 'tool'; id: 'pickaxe' | 'torch' | 'shield_block' | 'tnt' }
  >({ kind: 'weapon', id: hud.activeWeapon });
  const [weaponThumbs] = useState<Partial<Record<WeaponId, string>>>(() => getWeaponThumbnails());
  const [showInfoHud, setShowInfoHud] = useState(false);
  const [tutorialDismissed, setTutorialDismissed] = useState(true);
  const [tutorialStepIdx, setTutorialStepIdx] = useState(0);
  const [tutorialJustDone, setTutorialJustDone] = useState(false);
  const tutorialAdvancingRef = useRef(false);
  const tutorialAdvanceTimerRef = useRef<number | null>(null);
  const lastTutorialKeyRef = useRef<number>(0);
  const [floatingOrigin, setFloatingOrigin] = useState<{ x: number; y: number } | null>(null);
  const knobImgRef = useRef<HTMLImageElement | null>(null);
  const lastStickMoveRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const stickOriginRef = useRef<{ x: number; y: number } | null>(null);
  const stickPointerId = useRef<number | null>(null);
  const firePointerId = useRef<number | null>(null);
  const onVirtualMoveRef = useRef(onVirtualMove);
  onVirtualMoveRef.current = onVirtualMove;
  const onSetFireHeldRef = useRef(onSetFireHeld);
  onSetFireHeldRef.current = onSetFireHeld;
  const onCarControlRef = useRef(onCarControl);
  onCarControlRef.current = onCarControl;
  const onPlaneControlRef = useRef(onPlaneControl);
  onPlaneControlRef.current = onPlaneControl;
  const onSetPlaneFireHeldRef = useRef(onSetPlaneFireHeld);
  onSetPlaneFireHeldRef.current = onSetPlaneFireHeld;

  const carMode = hud.carState?.mode ?? 'none';
  const inCar = carMode !== 'none';
  const isCarDriving = carMode === 'driving';

  const planeMode = hud.planeState?.mode ?? 'none';
  const inPlane = planeMode !== 'none';
  const isPlanePiloting = planeMode === 'taxi' || planeMode === 'flying';

  useEffect(() => {
    if (!isCarDriving) {
      onCarControlRef.current?.('gas', false);
      onCarControlRef.current?.('brake', false);
      onCarControlRef.current?.('left', false);
      onCarControlRef.current?.('right', false);
      onCarControlRef.current?.('handbrake', false);
      onCarControlRef.current?.('boost', false);
    }
  }, [isCarDriving]);

  useEffect(() => {
    if (!isPlanePiloting) {
      onPlaneControlRef.current?.('gas', false);
      onPlaneControlRef.current?.('brake', false);
      onPlaneControlRef.current?.('left', false);
      onPlaneControlRef.current?.('right', false);
      onPlaneControlRef.current?.('climb', false);
      onPlaneControlRef.current?.('descend', false);
      onPlaneControlRef.current?.('boost', false);
      onSetPlaneFireHeldRef.current?.(false);
    }
  }, [isPlanePiloting]);

  useEffect(() => {
    if (hud.phase !== 'playing' || hud.worldMode !== 'ocean') {
      setOceanGearOpen(false);
    }
  }, [hud.phase, hud.worldMode]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: coarse)');
    setIsCoarsePointer(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsCoarsePointer(e.matches);
    mq.addEventListener?.('change', handler);
    const onGlobalPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch') setTouchUsed(true);
    };
    window.addEventListener('pointerdown', onGlobalPointer, { passive: true });
    const checkWidth = () => setIsSmallViewport(window.innerWidth < 640);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => {
      mq.removeEventListener?.('change', handler);
      window.removeEventListener('pointerdown', onGlobalPointer);
      window.removeEventListener('resize', checkWidth);
    };
  }, []);

  useEffect(() => {
    if (!hud.isSwimming) {
      setSwimMenuOpen(false);
    }
  }, [hud.isSwimming]);

  const showTouchControls =
    hud.phase === 'playing' &&
    (hud.settings.touchControls === 'on' ||
      (hud.settings.touchControls === 'auto' && (isCoarsePointer || touchUsed)));

  useEffect(() => {
    if (!showTouchControls) {
      stickPointerId.current = null;
      stickOriginRef.current = null;
      lastStickMoveRef.current = { dx: 0, dy: 0 };
      setFloatingOrigin(null);
      if (knobImgRef.current) {
        knobImgRef.current.style.transform = 'translate3d(0px, 0px, 0)';
      }
      onVirtualMoveRef.current(0, 0);
    }
  }, [showTouchControls]);

  useEffect(() => {
    if (hud.phase !== 'playing') {
      setMenuOpen(false);
      setHotbarOpen(false);
      setVoiceHelpOpen(false);
      firePointerId.current = null;
      onSetFireHeldRef.current(false);
    }
  }, [hud.phase]);

  useEffect(() => {
    if (tutorialRunKey > 0 && tutorialRunKey !== lastTutorialKeyRef.current) {
      lastTutorialKeyRef.current = tutorialRunKey;
      if (tutorialAdvanceTimerRef.current !== null) {
        window.clearTimeout(tutorialAdvanceTimerRef.current);
        tutorialAdvanceTimerRef.current = null;
      }
      tutorialAdvancingRef.current = false;
      setTutorialJustDone(false);
      setTutorialStepIdx(0);
      setTutorialDismissed(false);
    }
  }, [tutorialRunKey]);

  useEffect(() => {
    return () => {
      if (tutorialAdvanceTimerRef.current !== null) {
        window.clearTimeout(tutorialAdvanceTimerRef.current);
      }
    };
  }, []);

  const tutorialSteps = HUD_TUTORIAL_STEPS.filter((step) => {
    if (step.id === 'touch_joystick' && !showTouchControls) return false;
    if ((step.id === 'voice_toggle' || step.id === 'voice_help') && !onToggleVoice) return false;
    return true;
  });

  const tutorialActive =
    !tutorialDismissed &&
    !suppressTutorial &&
    hud.phase === 'playing' &&
    !inCar &&
    !inPlane &&
    tutorialStepIdx < tutorialSteps.length;

  const activeTutorialStep = tutorialActive ? tutorialSteps[tutorialStepIdx] ?? null : null;
  const activeTutorialStepId = activeTutorialStep?.id ?? null;

  const isTutorialTarget = (id: string) => activeTutorialStepId === id;

  const completeTutorialStep = (id: string) => {
    if (!tutorialActive || activeTutorialStepId !== id || tutorialAdvancingRef.current) return;
    tutorialAdvancingRef.current = true;
    setTutorialJustDone(true);
    tutorialAdvanceTimerRef.current = window.setTimeout(() => {
      tutorialAdvanceTimerRef.current = null;
      tutorialAdvancingRef.current = false;
      setTutorialJustDone(false);
      setTutorialStepIdx((prev) => {
        const next = prev + 1;
        if (next >= tutorialSteps.length) {
          setTutorialDismissed(true);
        }
        return next;
      });
    }, 340);
  };

  const handleSkipTutorial = () => {
    if (tutorialAdvanceTimerRef.current !== null) {
      window.clearTimeout(tutorialAdvanceTimerRef.current);
      tutorialAdvanceTimerRef.current = null;
    }
    tutorialAdvancingRef.current = false;
    setTutorialJustDone(false);
    setTutorialDismissed(true);
  };

  if (hud.phase !== 'playing') {
    return null;
  }

  const hpPct = Math.max(0, Math.min(100, Math.round((hud.hp / Math.max(1, hud.maxHp)) * 100)));
  const isLowHp = hud.hp > 0 && (hud.hp <= 1 || hpPct <= 25);
  const damageFlashSeq = hud.damageFlashSeq ?? 0;
  const lastDamageAmount = Math.max(1, hud.lastDamageAmount ?? 1);
  const lastDamageDir = hud.lastDamageDir ?? 'center';
  const activeQuestCount = hud.quests.filter((q) => q.accepted && !q.claimed).length;

  const nearbyOverworldNpc =
    hud.worldMode === 'overworld' && hud.nearbyNpcId
      ? getZoneNpcById(hud.nearbyNpcId)
      : null;
  const nearbyOverworldDoorNpc =
    hud.worldMode === 'overworld' && hud.nearbyOverworldZoneDoor
      ? getActiveZoneNpcDef(hud.nearbyOverworldZoneDoor, hud.worldTime.phase === 'malam')
      : null;
  const overworldDoorHasNightPermission =
    !hud.nearbyOverworldZoneDoor ||
    hud.worldTime.phase !== 'malam' ||
    hud.nightPermittedZones.includes(hud.nearbyOverworldZoneDoor);
  const nearbyAcademyNpc =
    hud.worldMode === 'academy' && hud.nearbyNpcId
      ? ACADEMY_NPCS.find((n) => n.id === hud.nearbyNpcId)
      : null;
  const nearbyDoor =
    hud.worldMode === 'dungeon' && hud.nearbyDoorIndex !== null && hud.dungeonState
      ? ZONE_DOORS[hud.dungeonState.zoneId]?.[hud.nearbyDoorIndex]
      : null;

  const activeWeaponDef = WEAPONS[hud.activeWeapon];
  const activeAmmo = hud.weaponAmmo[hud.activeWeapon] || 0;
  const openWeaponSwitcher = () => {
    setMenuOpen(false);
    setHotbarOpen((prev) => {
      const next = !prev;
      if (next) {
        if (hud.activeHotbarSlot === 8) setInspectedHotbar({ kind: 'tool', id: 'pickaxe' });
        else if (hud.activeHotbarSlot === 9) setInspectedHotbar({ kind: 'tool', id: 'torch' });
        else if (hud.activeHotbarSlot === 10)
          setInspectedHotbar({ kind: 'tool', id: 'shield_block' });
        else if (hud.activeHotbarSlot === 11) setInspectedHotbar({ kind: 'tool', id: 'tnt' });
        else setInspectedHotbar({ kind: 'weapon', id: hud.activeWeapon });
      }
      return next;
    });
  };

  const activeItemIconSrc =
    hud.activeHotbarSlot === 8
      ? './assets/ui/icon_pickaxe.png'
      : hud.activeHotbarSlot === 9
      ? './assets/ui/icon_torch.png'
      : hud.activeHotbarSlot === 10
      ? './assets/ui/icon_shield_block.png'
      : hud.activeHotbarSlot === 11
      ? './assets/ui/icon_tnt.png'
      : hud.ownedWeapons.length > 0 && weaponThumbs[hud.activeWeapon]
      ? weaponThumbs[hud.activeWeapon]!
      : './assets/ui/icon_slingshot.png';

  const activeSlotBadgeText =
    hud.activeHotbarSlot === 8
      ? `T${hud.pickaxeTier}`
      : hud.activeHotbarSlot === 9
      ? String(hud.caveTorchesLeft)
      : hud.activeHotbarSlot === 10
      ? String(hud.caveShieldBlocksLeft)
      : hud.activeHotbarSlot === 11
      ? String(hud.caveTntLeft)
      : hud.ownedWeapons.length > 0
      ? String(activeAmmo)
      : null;

  const updateJoystickFromPointer = (clientX: number, clientY: number) => {
    const origin = stickOriginRef.current;
    if (!origin) return;
    const maxR = 36;
    let dx = clientX - origin.x;
    let dy = clientY - origin.y;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    const prev = lastStickMoveRef.current;
    if (Math.abs(dx - prev.dx) < 0.4 && Math.abs(dy - prev.dy) < 0.4) return;
    lastStickMoveRef.current = { dx, dy };
    if (knobImgRef.current) {
      knobImgRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    }
    onVirtualMoveRef.current(dx / maxR, dy / maxR);
  };

  const resetFloatingJoystick = () => {
    stickPointerId.current = null;
    stickOriginRef.current = null;
    lastStickMoveRef.current = { dx: 0, dy: 0 };
    setFloatingOrigin(null);
    if (knobImgRef.current) {
      knobImgRef.current.style.transform = 'translate3d(0px, 0px, 0)';
    }
    onVirtualMoveRef.current(0, 0);
  };

  const drawerItems: Array<{
    label: string;
    iconSrc?: string;
    customIcon?: React.ReactNode;
    onClick: () => void;
    badge?: number;
  }> = [
    { label: 'Tas', iconSrc: './assets/ui/icon_bag.png', onClick: onOpenBag, badge: hud.ownedWeapons.length },
    { label: 'Kamus', iconSrc: './assets/ui/icon_kamus.png', onClick: onOpenKamus, badge: hud.wordsMastered },
    { label: 'Misi', iconSrc: './assets/ui/icon_quest.png', onClick: onOpenQuests, badge: activeQuestCount },
    { label: 'Peta', iconSrc: './assets/ui/icon_map.png', onClick: onOpenMap },
    { label: 'Petunjuk', iconSrc: './assets/ui/menu_guide.png', onClick: onOpenGuide },
    {
      label: 'Tutorial',
      iconSrc: './assets/aistudio/image_d988e3c5.png',
      onClick: () => {
        setMenuOpen(false);
        setHotbarOpen(false);
        setVoiceHelpOpen(false);
        tutorialAdvancingRef.current = false;
        setTutorialJustDone(false);
        setTutorialStepIdx(0);
        setTutorialDismissed(false);
      },
    },
    ...(onOpenProfile
      ? [
          {
            label: 'Profil',
            customIcon: (
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/60 bg-cyan-500/20 text-cyan-200 sm:h-9 sm:w-9">
                <UserIcon className="h-5 w-5" />
              </span>
            ),
            onClick: onOpenProfile,
          },
        ]
      : []),
    { label: 'Opsi', iconSrc: './assets/ui/icon_settings.png', onClick: onOpenOptions },
    { label: 'Ranking', iconSrc: './assets/ui/menu_trophy.png', onClick: onOpenLeaderboard },
    { label: 'Jeda', iconSrc: './assets/ui/btn_pause.png', onClick: onPause },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {/* Critical Low-HP Persistent Edge Pulse */}
      {isLowHp && (
        <div
          aria-hidden="true"
          className="animate-low-hp-pulse pointer-events-none fixed inset-0 z-[14]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(220,38,38,0) 56%, rgba(185,28,28,0.28) 82%, rgba(127,29,29,0.62) 100%)',
            boxShadow: 'inset 0 0 42px 8px rgba(220,38,38,0.48)',
          }}
        />
      )}

      {/* Full-Screen Red Border Flash on Damage */}
      {damageFlashSeq > 0 && (
        <div
          key={`dmg-flash-${damageFlashSeq}`}
          aria-hidden="true"
          className="animate-damage-flash pointer-events-none fixed inset-0 z-[15]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(239,68,68,0) 46%, rgba(220,38,38,0.42) 78%, rgba(185,28,28,0.82) 100%)',
            boxShadow:
              'inset 0 0 64px 16px rgba(239,68,68,0.78), inset 0 0 18px 4px rgba(248,113,113,0.72)',
          }}
        />
      )}

      {/* Directional Attack Edge Indicator (front / back / left / right) */}
      {damageFlashSeq > 0 && lastDamageDir !== 'center' && (
        <div
          key={`dmg-dir-${damageFlashSeq}`}
          aria-hidden="true"
          className={`animate-dir-flash pointer-events-none fixed z-[16] flex items-center justify-center ${
            lastDamageDir === 'front'
              ? 'inset-x-0 top-0 h-16 bg-gradient-to-b from-rose-500/85 via-rose-600/35 to-transparent'
              : lastDamageDir === 'back'
              ? 'inset-x-0 bottom-0 h-16 bg-gradient-to-t from-rose-500/85 via-rose-600/35 to-transparent'
              : lastDamageDir === 'left'
              ? 'inset-y-0 left-0 w-16 bg-gradient-to-r from-rose-500/85 via-rose-600/35 to-transparent'
              : 'inset-y-0 right-0 w-16 bg-gradient-to-l from-rose-500/85 via-rose-600/35 to-transparent'
          }`}
        >
          <span className="rounded-full border border-rose-200/80 bg-rose-600/95 px-2.5 py-0.5 text-xs font-black text-white shadow-[0_0_16px_rgba(244,63,94,0.95)]">
            {lastDamageDir === 'front'
              ? '▲'
              : lastDamageDir === 'back'
              ? '▼'
              : lastDamageDir === 'left'
              ? '◀'
              : '▶'}
          </span>
        </div>
      )}

      {/* Subtle World-Space Nameplates (hidden by default; shown when Info HUD toggle is active) */}
      {showInfoHud &&
        hud.projectedLabels.map((lbl) => (
        <div
          key={lbl.id}
          style={{ transform: `translate3d(${lbl.x}px, ${lbl.y}px, 0) translate(-50%, -100%)` }}
          className={`absolute left-0 top-0 whitespace-nowrap font-bold shadow-md ${
            lbl.kind === 'speech'
              ? 'rounded-xl border border-[#78350f] bg-white/95 px-2.5 py-0.5 text-[11px] font-extrabold text-[#78350f]'
              : lbl.kind === 'thought'
              ? 'max-w-[230px] whitespace-normal rounded-2xl border border-sky-200/80 bg-slate-900/90 px-3 py-1 text-center text-[10px] font-bold leading-snug text-sky-50 shadow-lg'
              : lbl.kind === 'portal'
              ? 'rounded-lg border border-purple-300/60 bg-[#2e1065]/90 px-2.5 py-0.5 text-[11px] font-extrabold text-white'
              : lbl.kind === 'door'
              ? 'rounded-lg border border-amber-300/60 bg-slate-950/85 px-2 py-0.5 text-[10px] font-extrabold text-amber-100'
              : lbl.kind === 'pickup'
              ? 'rounded-lg border border-cyan-300/70 bg-cyan-950/85 px-2 py-0.5 text-[10px] font-extrabold text-cyan-100'
              : lbl.kind === 'monster'
              ? 'rounded-lg border border-rose-400/70 bg-rose-950/85 px-2 py-0.5 text-[10px] font-extrabold text-amber-200'
              : lbl.kind === 'player'
              ? 'rounded-full border border-emerald-300/80 bg-slate-950/90 px-2.5 py-0.5 text-[10.5px] font-black text-emerald-200 shadow-lg'
              : 'rounded-lg border border-white/20 bg-slate-950/85 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-100'
          }`}
        >
          <div>{lbl.title}</div>
          {lbl.subtext && (
            <div className="text-[9px] font-semibold text-amber-200">{lbl.subtext}</div>
          )}
          {lbl.kind === 'thought' && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-2.5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-0.5"
            >
              <span className="h-1.5 w-1.5 rounded-full border border-sky-200/70 bg-slate-900/80" />
              <span className="h-1 w-1 rounded-full border border-sky-200/70 bg-slate-900/80" />
            </span>
          )}
        </div>
      ))}

      {/* TOP-LEFT: Minimalist GTA Circular Minimap Radar + ML-style Gold Weapon/Tool Switcher */}
      <div className="pointer-events-none fixed left-2.5 top-2.5 z-20 flex flex-col items-start gap-1.5 sm:left-4 sm:top-4">
        {hud.radarState && (
          <RadarMinimap
            radar={hud.radarState}
            size={isSmallViewport ? 94 : 118}
            getLiveMapSnapshot={getLiveMapSnapshot}
            onOpenMap={onOpenMap}
          />
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-tutorial-target="weapon_switcher"
            onClick={(e) => {
              (e.currentTarget as HTMLButtonElement).blur();
              if (isTutorialTarget('weapon_switcher')) {
                completeTutorialStep('weapon_switcher');
                return;
              }
              openWeaponSwitcher();
            }}
            title={hotbarOpen ? 'Tutup Daftar Senjata & Alat' : 'Pilih Senjata & Alat'}
            aria-label={hotbarOpen ? 'Tutup Daftar Senjata & Alat' : 'Pilih Senjata & Alat'}
            className={`pointer-events-auto relative flex h-[48px] w-[48px] touch-none select-none items-center justify-center rounded-full shadow-[0_4px_12px_rgba(245,158,11,0.45)] transition-transform active:scale-90 sm:h-[54px] sm:w-[54px] ${
              hotbarOpen ? 'scale-105 ring-2 ring-amber-300' : 'hover:scale-105'
            }`}
          >
            <img
              src="./assets/ui/btn_weapons.png"
              alt="Senjata & Alat"
              className="pointer-events-none h-full w-full select-none object-contain"
              draggable={false}
            />
            {hotbarOpen ? (
              <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-amber-200 bg-slate-950/90 text-amber-200 shadow">
                <X className="h-3 w-3" />
              </span>
            ) : (
              <span className="pointer-events-none absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-amber-300/75 bg-slate-950/85 p-0.5 shadow-md sm:h-6 sm:w-6">
                <img
                  src={activeItemIconSrc}
                  alt="Aktif"
                  className="pointer-events-none h-full w-full object-contain"
                  draggable={false}
                />
              </span>
            )}
            {activeSlotBadgeText !== null && (
              <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-amber-300/60 bg-slate-950/85 px-1.5 font-mono-nums text-[9px] font-black leading-tight text-amber-200 shadow">
                {activeSlotBadgeText}
              </span>
            )}
          </button>

          {showInfoHud &&
            hud.worldMode === 'overworld' &&
            ((!hud.starterWeaponPicked && hud.starterWeaponGuide) ||
              (!hud.swimSuitPicked && hud.swimSuitGuide)) && (
            <div className="flex flex-col items-start gap-1">
              {!hud.starterWeaponPicked && hud.starterWeaponGuide && (
                <div className="flex items-center gap-1.5 rounded-full border border-cyan-300/40 bg-slate-950/85 px-2.5 py-0.5 text-[10px] font-bold text-cyan-100">
                  <StarterWeaponPixelIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>Senjata ({hud.starterWeaponGuide.distance}m)</span>
                </div>
              )}
              {!hud.swimSuitPicked && hud.swimSuitGuide && (
                <button
                  type="button"
                  onClick={onGoToSwimSuit}
                  title="Klik untuk berjalan mengambil Pakaian Renang"
                  className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-slate-950/85 px-2.5 py-0.5 text-[10px] font-bold text-amber-100 shadow transition hover:border-cyan-300 hover:bg-slate-900 active:scale-95"
                >
                  <SwimSuitIcon className="h-3.5 w-3.5" />
                  <span>Pakaian Renang ({hud.swimSuitGuide.distance}m)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TOP-CENTER kept clear so nothing blocks hero or camera sightline */}

      {/* TOP-RIGHT: RPG Minimalist HP / Stats + Weapon Square + Utility Medallion Bar */}
      <div className="pointer-events-auto fixed right-2.5 top-2.5 z-20 flex flex-col items-end gap-1.5 sm:right-4 sm:top-4">
        <div className="flex items-center gap-2">
          {/* Sleek RPG Health & Compact Stats Pill */}
          <div className="relative">
            <div
              key={damageFlashSeq > 0 ? `hp-pill-${damageFlashSeq}` : 'hp-pill-idle'}
              className={`flex flex-col items-end rounded-xl border bg-slate-950/85 px-2.5 py-1.5 text-white shadow-lg transition-colors ${
                damageFlashSeq > 0
                  ? 'animate-hp-shake border-rose-400 ring-2 ring-rose-500/85'
                  : isLowHp
                  ? 'border-rose-500/85 ring-2 ring-rose-500/60'
                  : 'border-amber-300/25'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <img
                  src="./assets/ui/icon_heart.png"
                  alt="Nyawa"
                  className="h-4 w-4 shrink-0 object-contain"
                  draggable={false}
                />
                <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-900/90 ring-1 ring-white/15 sm:w-24">
                  <div
                    className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-200"
                    style={{ width: `${hpPct}%` }}
                  />
                </div>
                <span className="font-mono-nums text-[10px] font-black text-rose-200">
                  {hud.hp}/{hud.maxHp}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2.5 font-mono-nums text-[10px] font-bold">
                <span className="text-amber-300">Lv.{String(hud.level).padStart(2, '0')}</span>
                <span className="flex items-center gap-1 text-cyan-300">
                  <img
                    src="./assets/ui/icon_diamond.png"
                    alt="Berlian"
                    className="h-3.5 w-3.5 shrink-0 object-contain"
                    draggable={false}
                  />
                  {hud.diamonds}
                </span>
                <span className="flex items-center gap-1 text-amber-300">
                  <img
                    src="./assets/ui/icon_crown.png"
                    alt="Mahkota"
                    className="h-3.5 w-3.5 shrink-0 object-contain"
                    draggable={false}
                  />
                  {hud.crowns}/6
                </span>
              </div>
            </div>

            {damageFlashSeq > 0 && (
              <span
                key={`dmg-pop-${damageFlashSeq}`}
                className="animate-dmg-float pointer-events-none absolute -bottom-6 right-1 z-30 whitespace-nowrap rounded-full border border-rose-200/85 bg-rose-600 px-2 py-0.5 font-mono-nums text-[11px] font-black text-white shadow-[0_4px_12px_rgba(225,29,72,0.85)]"
              >
                -{lastDamageAmount} ❤️
              </span>
            )}
          </div>

          {/* Active Weapon & Tool Box (tap to open Tas) */}
          <button
            type="button"
            data-tutorial-target="bag_slot"
            onClick={() => {
              if (isTutorialTarget('bag_slot')) {
                completeTutorialStep('bag_slot');
                return;
              }
              onOpenBag();
            }}
            title={
              hud.ownedWeapons.length > 0
                ? `${activeWeaponDef.name} (${activeAmmo}), Buka Tas`
                : 'Buka Tas & Senjata'
            }
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border-2 border-amber-300/50 bg-slate-950/85 p-1 text-white shadow-lg transition hover:border-amber-300"
          >
            <img
              src={activeItemIconSrc}
              alt="Item Aktif"
              className={`h-8 w-8 object-contain ${
                hud.ownedWeapons.length === 0 && isWeaponHotbarSlot(hud.activeHotbarSlot) ? 'opacity-45 grayscale' : ''
              }`}
              draggable={false}
            />
            {activeSlotBadgeText !== null && (
              <span className="absolute -bottom-1 right-0.5 rounded bg-slate-950/95 px-1 font-mono-nums text-[9px] font-black text-amber-300 ring-1 ring-amber-400/30">
                {activeSlotBadgeText}
              </span>
            )}
          </button>
        </div>

        {/* Top-Right Utility Medallion Row (Icon-Only: Mouse Lock, Camera Eye View, Fullscreen, Mute, Menu) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {!inCar &&
            !inPlane &&
            !showTouchControls &&
            hud.phase === 'playing' &&
            hud.settings.aimMode === 'manual' &&
            (hud.cameraMode === 'third_back' || hud.cameraMode === 'first_person') && (
            <button
              type="button"
              onClick={onTogglePointerLock}
              title={hud.pointerLocked ? 'Lepas Kunci Bidik Mouse (Esc / L)' : 'Kunci Mouse untuk Bidik Bebas PC (L)'}
              aria-label="Kunci Bidik Mouse"
              className={`relative flex h-9 w-9 items-center justify-center rounded-full shadow-[0_3px_8px_rgba(34,211,238,0.42)] transition-transform hover:scale-105 active:scale-90 sm:h-10 sm:w-10 ${
                hud.pointerLocked ? 'scale-105 ring-2 ring-cyan-300' : ''
              }`}
            >
              <img
                src="./assets/ui/btn_aim_lock.png"
                alt="Kunci Bidik Mouse"
                className="pointer-events-none h-full w-full select-none object-contain"
                draggable={false}
              />
            </button>
          )}

          {!inCar && !inPlane && (
            <button
              type="button"
              data-tutorial-target="aim_mode"
              onClick={() => {
                onToggleAimMode();
                completeTutorialStep('aim_mode');
              }}
              title={
                hud.settings.aimMode === 'auto'
                  ? 'Mode Bidik Otomatis (Klik untuk ganti ke Bidik Bebas)'
                  : 'Mode Bidik Bebas / Crosshair (Klik untuk ganti ke Bidik Otomatis)'
              }
              aria-label={
                hud.settings.aimMode === 'auto'
                  ? 'Ganti Mode Bidik (Aktif Bidik Otomatis)'
                  : 'Ganti Mode Bidik (Aktif Bidik Bebas)'
              }
              className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 sm:h-10 sm:w-10 ${
                hud.settings.aimMode === 'auto'
                  ? 'shadow-[0_3px_8px_rgba(251,191,36,0.42)]'
                  : 'shadow-[0_3px_8px_rgba(34,211,238,0.42)]'
              }`}
            >
              <img
                src={
                  hud.settings.aimMode === 'auto'
                    ? './assets/ui/btn_aim_auto.png'
                    : './assets/ui/btn_aim_manual.png'
                }
                alt={hud.settings.aimMode === 'auto' ? 'Bidik Otomatis' : 'Bidik Bebas'}
                className="pointer-events-none h-full w-full select-none object-contain"
                draggable={false}
              />
            </button>
          )}

          <button
            type="button"
            data-tutorial-target="camera_view"
            onClick={() => {
              onToggleCamera();
              completeTutorialStep('camera_view');
            }}
            title={`Ganti Sudut Pandang ${CAMERA_VIEW_LABELS[hud.cameraMode]} (C / F5)`}
            aria-label={`Ganti Sudut Pandang ${CAMERA_VIEW_LABELS[hud.cameraMode]}`}
            className="relative flex h-9 w-9 items-center justify-center rounded-full shadow-[0_3px_8px_rgba(34,211,238,0.38)] transition-transform hover:scale-105 active:scale-90 sm:h-10 sm:w-10"
          >
            <img
              src="./assets/ui/btn_view.png"
              alt="Ganti Sudut Pandang Kamera"
              className="pointer-events-none h-full w-full select-none object-contain"
              draggable={false}
            />
          </button>

          <button
            type="button"
            data-tutorial-target="info_toggle"
            onClick={() => {
              setShowInfoHud((v) => !v);
              completeTutorialStep('info_toggle');
            }}
            title={showInfoHud ? 'Sembunyikan Info & Label Layar' : 'Tampilkan Info & Label Layar'}
            aria-label={showInfoHud ? 'Sembunyikan Info & Label Layar' : 'Tampilkan Info & Label Layar'}
            aria-pressed={showInfoHud}
            className={`relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full shadow-[0_3px_8px_rgba(34,211,238,0.34)] transition-transform hover:scale-105 active:scale-90 sm:h-10 sm:w-10 ${
              showInfoHud ? 'scale-105 ring-2 ring-cyan-300' : 'opacity-90'
            }`}
          >
            <ResilientMedallionImg
              src="./assets/aistudio/image_d988e3c5.png"
              fallback={<Info className="h-4 w-4 text-cyan-300" />}
            />
          </button>

          <button
            type="button"
            data-tutorial-target="sound_toggle"
            onClick={() => {
              onToggleMute();
              completeTutorialStep('sound_toggle');
            }}
            title={muted ? 'Nyalakan Suara' : 'Matikan Suara'}
            aria-label={muted ? 'Nyalakan Suara' : 'Matikan Suara'}
            className="relative flex h-9 w-9 items-center justify-center rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.42)] transition-transform hover:scale-105 active:scale-90 sm:h-10 sm:w-10"
          >
            <img
              src={muted ? './assets/ui/btn_sound_off.png' : './assets/ui/btn_sound_on.png'}
              alt={muted ? 'Suara Mati' : 'Suara Nyala'}
              className="pointer-events-none h-full w-full select-none object-contain"
              draggable={false}
            />
          </button>

          <button
            type="button"
            data-tutorial-target="main_menu"
            onClick={() => {
              if (isTutorialTarget('main_menu')) {
                completeTutorialStep('main_menu');
                return;
              }
              setHotbarOpen(false);
              setMenuOpen((v) => !v);
            }}
            title="Menu (Tas, Kamus, Misi, Peta, Opsi)"
            aria-label="Menu"
            className={`relative flex h-9 w-9 items-center justify-center rounded-full shadow-[0_3px_8px_rgba(245,158,11,0.38)] transition-transform hover:scale-105 active:scale-90 sm:h-10 sm:w-10 ${
              menuOpen ? 'scale-105 ring-2 ring-amber-300' : ''
            }`}
          >
            <img
              src="./assets/ui/btn_menu.png"
              alt="Menu"
              className="pointer-events-none h-full w-full select-none object-contain"
              draggable={false}
            />
            {menuOpen ? (
              <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-amber-200 bg-slate-950/95 text-amber-200 shadow">
                <X className="h-2.5 w-2.5" />
              </span>
            ) : (
              activeQuestCount > 0 && (
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-slate-950 bg-rose-600 px-1 font-mono-nums text-[9px] font-black text-white shadow">
                  {activeQuestCount}
                </span>
              )
            )}
          </button>
        </div>

        {/* Right-Side Location/Clock Strip + Area Monster Progress Tracker (shown when Info HUD toggle is active) */}
        {!showInfoHud && (hud.worldMode === 'dungeon' || hud.worldMode === 'academy' || hud.oceanSurvival) && (
          <div className="pointer-events-auto mt-0.5 flex items-center justify-end gap-1">
            {hud.oceanSurvival && (
              <>
                <button
                  type="button"
                  onClick={() => setOceanGearOpen((v) => !v)}
                  className="rounded-full border border-cyan-300/50 bg-cyan-700/85 px-2.5 py-1 text-[10px] font-black text-white shadow-md hover:bg-cyan-600"
                >
                  🤿 Gear
                </button>
                <button
                  type="button"
                  onClick={() =>
                    hud.worldMode === 'ocean' ? onExitDungeon() : (onDiveOcean ?? onExitDungeon)()
                  }
                  className="rounded-full bg-amber-600/90 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-md hover:bg-amber-500"
                >
                  🫧 Naik
                </button>
              </>
            )}
            {(hud.worldMode === 'dungeon' || hud.worldMode === 'academy') && !hud.oceanSurvival && (
              <button
                type="button"
                onClick={onExitDungeon}
                className="rounded-full bg-cyan-600/90 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-md hover:bg-cyan-500"
              >
                Keluar
              </button>
            )}
          </div>
        )}
        {showInfoHud && (
        <div className="pointer-events-none mt-0.5 flex w-[212px] flex-col items-end gap-1 sm:w-[238px]">
          {hud.worldMode === 'overworld' && hud.worldTime && (
            <div
              className={`flex w-full items-center justify-between gap-1.5 rounded-full border px-2.5 py-0.5 text-white shadow-md ${
                hud.worldTime.phase === 'malam'
                  ? 'border-indigo-300/45 bg-slate-950/88'
                  : hud.worldTime.phase === 'sore'
                  ? 'border-orange-300/50 bg-amber-950/85'
                  : hud.worldTime.phase === 'pagi'
                  ? 'border-amber-200/55 bg-amber-900/85'
                  : 'border-sky-200/40 bg-slate-950/85'
              }`}
            >
              <span className="flex min-w-0 items-center gap-1 font-mono-nums text-[10px] font-extrabold tracking-wide text-amber-100">
                <span className="text-[11px] leading-none">
                  {hud.worldTime.phase === 'pagi'
                    ? '🌅'
                    : hud.worldTime.phase === 'siang'
                    ? '☀️'
                    : hud.worldTime.phase === 'sore'
                    ? '🌇'
                    : '🌙'}
                </span>
                <span className="truncate">
                  Hari {hud.worldTime.dayCount} · {hud.worldTime.phaseLabel}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 font-mono-nums text-[9px] font-bold text-slate-200">
                {Math.floor(hud.worldTime.phaseRemainingSec / 60)}.
                {String(hud.worldTime.phaseRemainingSec % 60).padStart(2, '0')}
              </span>
            </div>
          )}

          {hud.worldMode === 'dungeon' && hud.dungeonState && (
            <div className="pointer-events-auto flex w-full items-center justify-between gap-1.5 rounded-full border border-white/15 bg-slate-950/88 px-2.5 py-0.5 text-white shadow-md">
              <span className="min-w-0 truncate font-mono-nums text-[10px] font-extrabold text-amber-200">
                {hud.dungeonState.zoneName} · Pintu {hud.dungeonState.doorsCleared.length}/5
                {hud.dungeonState.prisonCells && hud.dungeonState.prisonCells.length > 0
                  ? ` · Sel ${hud.dungeonState.prisonCells.filter((c) => c.unlocked).length}/${hud.dungeonState.prisonCells.length}`
                  : ''}
                {hud.dungeonState.bossSpawned && !hud.dungeonState.bossDefeated
                  ? ' · BOS!'
                  : hud.dungeonState.bossDefeated && !hud.dungeonState.prisonKeyCollected
                  ? ' · Ambil Kunci'
                  : hud.dungeonState.prisonKeyCollected && !hud.dungeonState.prisonUnlocked
                  ? ` · Bebaskan ${hud.dungeonState.prisonCells ? '3 Sel' : hud.dungeonState.captiveName}`
                  : hud.dungeonState.prisonUnlocked && !hud.dungeonState.caveRibbonCollected
                  ? ' · Cari Pita 3D'
                  : hud.dungeonState.prisonUnlocked
                  ? ' · Bawa Keluar ✓'
                  : ''}
              </span>
              <button
                type="button"
                onClick={onExitDungeon}
                className="shrink-0 rounded-full bg-cyan-600/90 px-2 py-0.5 text-[9px] font-extrabold text-white hover:bg-cyan-500"
              >
                Keluar
              </button>
            </div>
          )}

          {hud.worldMode === 'academy' && (
            <div className="pointer-events-auto flex w-full items-center justify-between gap-1.5 rounded-full border border-purple-300/35 bg-slate-950/88 px-2.5 py-0.5 text-white shadow-md">
              <span className="min-w-0 truncate font-mono-nums text-[10px] font-extrabold text-purple-200">
                IELTS · L{hud.ieltsScores.listening}% R{hud.ieltsScores.reading}% W
                {hud.ieltsScores.writing}% S{hud.ieltsScores.speaking}%
              </span>
              <button
                type="button"
                onClick={onExitDungeon}
                className="shrink-0 rounded-full bg-cyan-600/90 px-2 py-0.5 text-[9px] font-extrabold text-white hover:bg-cyan-500"
              >
                Keluar
              </button>
            </div>
          )}

          {hud.oceanSurvival && (
            <div className="pointer-events-auto flex w-full items-center justify-between gap-1.5 rounded-full border border-cyan-400/45 bg-slate-950/92 px-2.5 py-0.5 text-white shadow-md">
              <span className="min-w-0 truncate font-mono-nums text-[10px] font-extrabold text-cyan-200">
                🌊 {hud.oceanSurvival.zoneLabel} · -{hud.oceanSurvival.depthMeters}m
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOceanGearOpen((v) => !v)}
                  className="rounded-full border border-cyan-300/50 bg-cyan-700/85 px-2 py-0.5 text-[9px] font-black text-white hover:bg-cyan-600"
                >
                  🤿 Gear
                </button>
                <button
                  type="button"
                  onClick={() =>
                    hud.worldMode === 'ocean' ? onExitDungeon() : (onDiveOcean ?? onExitDungeon)()
                  }
                  className="rounded-full bg-amber-600/90 px-2 py-0.5 text-[9px] font-extrabold text-white hover:bg-amber-500"
                >
                  🫧 Naik
                </button>
              </div>
            </div>
          )}

          {(() => {
            const stats = hud.areaMonsterStats;
            const pct = stats.total > 0 ? Math.min(100, Math.round((stats.defeated / stats.total) * 100)) : 100;

            if (hud.worldMode === 'dungeon') {
              return (
                <div className="w-full rounded-xl border border-amber-300/30 bg-slate-950/88 px-2.5 py-1 text-white shadow-md">
                  <div className="flex items-center justify-between gap-1.5 font-mono-nums text-[9.5px] font-extrabold sm:text-[10px]">
                    <span className="truncate text-slate-200">⚔️ Monster Gua</span>
                    <span className="shrink-0">
                      <span className="text-emerald-300">
                        Kalah {stats.defeated}/{stats.total}
                      </span>
                      <span className="mx-1 text-slate-500">·</span>
                      <span className={stats.remaining > 0 ? 'text-rose-300' : 'text-emerald-300'}>
                        {stats.remaining > 0 ? `Sisa ${stats.remaining}` : 'Bersih ✓'}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-800/90">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-200"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-0.5 truncate font-mono-nums text-[8.5px] font-bold text-slate-300 sm:text-[9px]">
                    {stats.bossDefeated ? (
                      <span className="text-emerald-300">
                        ✓ Bos Kalah ·{' '}
                        {hud.dungeonState?.prisonUnlocked
                          ? hud.dungeonState.caveRibbonCollected
                            ? `Pita 3D & ${hud.dungeonState.captiveName} Aman · Keluar!`
                            : `Cari Pita Merah 3D lalu Keluar!`
                          : `Selamatkan ${hud.dungeonState?.captiveName}`}
                      </span>
                    ) : stats.bossActive ? (
                      <span className="font-black text-rose-300">⚠️ BOS AREA AKTIF!</span>
                    ) : (
                      <span>
                        Monster Kata {stats.guardiansDefeated ?? 0}/{stats.guardiansTotal ?? 3} ·
                        Bos Pintu 5
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            if (hud.worldMode === 'academy') {
              return (
                <div className="w-full rounded-xl border border-purple-300/30 bg-slate-950/88 px-2.5 py-1 text-white shadow-md">
                  <div className="flex items-center justify-between gap-1.5 font-mono-nums text-[9.5px] font-extrabold sm:text-[10px]">
                    <span className="truncate text-purple-200">⚔️ Penjaga IELTS</span>
                    <span className="shrink-0">
                      <span className="text-emerald-300">
                        Kalah {stats.defeated}/{stats.total}
                      </span>
                      <span className="mx-1 text-slate-500">·</span>
                      <span className={stats.remaining > 0 ? 'text-rose-300' : 'text-emerald-300'}>
                        {stats.remaining > 0 ? `Sisa ${stats.remaining}` : 'Bersih ✓'}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-800/90">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-200"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            }

            if (hud.oceanSurvival) {
              const oc = hud.oceanSurvival;
              const isUnlimited = Boolean(oc.unlimitedOxygen);
              const o2Pct = isUnlimited
                ? 100
                : Math.max(0, Math.min(100, Math.round((oc.oxygen / Math.max(1, oc.maxOxygen)) * 100)));
              return (
                <div
                  className={`pointer-events-auto w-full rounded-xl border px-2.5 py-1.5 text-white shadow-md ${
                    oc.suffocating && !isUnlimited
                      ? 'animate-pulse border-rose-400 bg-rose-950/92'
                      : isUnlimited
                      ? 'border-emerald-400/50 bg-slate-950/92'
                      : 'border-cyan-400/40 bg-slate-950/92'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 font-mono-nums text-[9.5px] font-extrabold sm:text-[10px]">
                    <span className={oc.suffocating && !isUnlimited ? 'text-rose-200' : isUnlimited ? 'text-emerald-200' : 'text-cyan-200'}>
                      {isUnlimited
                        ? '🫧 O₂ Tak Terbatas'
                        : oc.suffocating
                        ? '⚠️ NAPAS HABIS!'
                        : '🫧 Oksigen (O₂)'}
                    </span>
                    <span className={!isUnlimited && o2Pct <= 25 ? 'text-rose-300' : isUnlimited ? 'text-emerald-300' : 'text-cyan-200'}>
                      {isUnlimited ? '∞ Selam' : `${Math.round(oc.oxygen)}/${oc.maxOxygen}`}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full transition-all duration-200 ${
                        isUnlimited
                          ? 'bg-gradient-to-r from-emerald-400 via-cyan-300 to-sky-400'
                          : o2Pct <= 25
                          ? 'bg-gradient-to-r from-rose-600 to-amber-400'
                          : 'bg-gradient-to-r from-cyan-400 to-sky-300'
                      }`}
                      style={{ width: `${o2Pct}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-1.5 font-mono-nums text-[8.5px] font-bold text-slate-200 sm:text-[9px]">
                    <button
                      type="button"
                      onClick={() => setOceanGearOpen(true)}
                      className="rounded bg-cyan-900/80 px-1.5 py-0.5 text-cyan-200 hover:bg-cyan-800"
                    >
                      🐠 Biota {oc.discoveredBiota.length}/20
                    </button>
                    <span>
                      ⚔️ {stats.context === 'ocean' ? 'Palung' : 'Wilayah'} {stats.defeated}/{stats.total}
                    </span>
                  </div>
                  {!isUnlimited && oc.ownedGear.length === 0 && oc.depthMeters >= 6 && (
                    <div className="mt-1 text-[8.5px] font-extrabold text-amber-300">
                      💡 Ambil Pakaian Renang atau buat Baju Selam agar O₂ tak terbatas!
                    </div>
                  )}
                </div>
              );
            }

            // Overworld (Luar Gua / Gelombang Misi Acak 20-50 Monster)
            const wm = hud.waveMission;
            const missionLabel = wm
              ? `🎯 ${wm.squadName}`
              : stats.context === 'overworld_night'
              ? '⚔️ Monster Malam'
              : '⚔️ Monster Wilayah';
            const displayDefeated = wm ? wm.defeated : stats.defeated;
            const displayTotal = wm ? wm.total : stats.total;
            const displayRemaining = wm ? wm.remaining : stats.remaining;
            const displayPct =
              displayTotal > 0 ? Math.min(100, Math.round((displayDefeated / displayTotal) * 100)) : pct;
            const isNightCtx = stats.context === 'overworld_night';

            return (
              <div
                className={`w-full rounded-xl border bg-slate-950/88 px-2.5 py-1 text-white shadow-md ${
                  isNightCtx ? 'border-rose-400/35' : 'border-amber-300/30'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 font-mono-nums text-[9.5px] font-extrabold sm:text-[10px]">
                  <span
                    className={`truncate ${
                      wm ? 'text-cyan-200' : isNightCtx ? 'text-rose-200' : 'text-amber-100'
                    }`}
                  >
                    {missionLabel}
                  </span>
                  <span className="shrink-0">
                    <span className="text-emerald-300">
                      Kalah {displayDefeated}/{displayTotal}
                    </span>
                    <span className="mx-1 text-slate-500">·</span>
                    <span
                      className={
                        displayRemaining > 0
                          ? isNightCtx
                            ? 'text-rose-300'
                            : 'text-amber-300'
                          : 'text-emerald-300'
                      }
                    >
                      {displayRemaining > 0 ? `Sisa ${displayRemaining}` : 'Misi Tuntas ✓'}
                    </span>
                  </span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-800/90">
                  <div
                    className={`h-full transition-all duration-200 ${
                      isNightCtx
                        ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400'
                        : 'bg-gradient-to-r from-amber-400 to-emerald-400'
                    }`}
                    style={{ width: `${displayPct}%` }}
                  />
                </div>
                <div className="mt-0.5 flex flex-wrap items-center justify-between gap-x-1.5 font-mono-nums text-[8.5px] font-bold text-slate-300 sm:text-[9px]">
                  <span className="truncate">
                    📍 {stats.areaName}
                    {(stats.zoneSurfaceTotal ?? stats.zoneNightTotal ?? 0) > 0
                      ? ` · Pulau ${stats.zoneSurfaceDefeated ?? stats.zoneNightDefeated ?? 0}/${stats.zoneSurfaceTotal ?? stats.zoneNightTotal}`
                      : ''}
                  </span>
                  <span className="text-slate-300">
                    <span className="text-rose-300">⚔️{stats.surfaceCombatRemaining ?? 0}</span>
                    {' · '}
                    <span className="text-purple-300">📘{stats.surfaceQuizRemaining ?? 0}</span>
                    {' · '}
                    <span
                      className={
                        stats.caveLiberated || stats.captiveRescued
                          ? 'text-emerald-300'
                          : 'text-amber-200'
                      }
                    >
                      {stats.caveLiberated || stats.captiveRescued
                        ? 'Tawanan ✓'
                        : `Gua ${stats.caveRemaining ?? 0}`}
                    </span>
                  </span>
                </div>
                {stats.captiveRescued &&
                  !hud.liberatedZones.includes(hud.activeZoneId) &&
                  (stats.zoneIslandRemaining ?? 0) > 0 && (
                    <div className="mt-0.5 truncate font-mono-nums text-[8.5px] font-extrabold text-amber-300 sm:text-[9px]">
                      🌫️ Misi Akhir: Habisi sisa {stats.zoneIslandRemaining} monster pulau agar kabut hilang!
                    </div>
                  )}
                {hud.liberatedZones.includes(hud.activeZoneId) && (
                  <div className="mt-0.5 truncate font-mono-nums text-[8.5px] font-extrabold text-emerald-300 sm:text-[9px]">
                    ☀️ Kabut Pulau Hilang · Wilayah Cerah
                  </div>
                )}
              </div>
            );
          })()}
        </div>
        )}
      </div>

      {/* CENTERED TRANSPARENT RPG MENU PANEL (Tas, Kamus, Misi, Peta, Petunjuk, Opsi, Ranking, Jeda) */}
      {menuOpen && (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center px-3">
          <div className="pointer-events-auto flex max-h-[78dvh] w-full max-w-[min(28rem,calc(100vw-110px))] flex-col overflow-hidden rounded-2xl border border-amber-300/45 bg-slate-950/88 p-3 text-slate-100 shadow-2xl sm:max-w-[32rem] sm:p-4">
            <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-white/15 pb-1.5">
              <h3 className="truncate text-xs font-black uppercase tracking-wider text-amber-200 [text-shadow:0_1px_2px_rgba(0,0,0,0.92)] sm:text-sm">
                Menu Petualangan
              </h3>
              <button
                type="button"
                onClick={(e) => {
                  (e.currentTarget as HTMLButtonElement).blur();
                  setMenuOpen(false);
                }}
                aria-label="Tutup Menu"
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/25 bg-slate-950/35 px-2.5 py-1 text-[10px] font-extrabold text-slate-100 hover:bg-slate-900/55"
              >
                <X className="h-3.5 w-3.5" />
                <span>Tutup</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 overflow-y-auto overscroll-contain touch-pan-y sm:grid-cols-4">
              {drawerItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    item.onClick();
                  }}
                  className="relative flex flex-col items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-slate-950/18 px-2.5 py-3 text-center text-[11px] font-extrabold text-slate-100 transition hover:border-amber-300/60 hover:bg-slate-900/35 sm:py-3.5"
                >
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-rose-600 px-1.5 py-0.5 font-mono-nums text-[9px] font-black leading-none text-white shadow">
                      {item.badge}
                    </span>
                  )}
                  {item.customIcon ?? (
                    <img
                      src={item.iconSrc}
                      alt={item.label}
                      className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
                      draggable={false}
                    />
                  )}
                  <span className="line-clamp-1 w-full [text-shadow:0_1px_2px_rgba(0,0,0,0.92)]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transient Event Toast (single slim pill near top edge) */}
      {hud.bannerMessage && (
        <div
          className={`pointer-events-none fixed left-1/2 z-20 -translate-x-1/2 ${
            multiplayerActive ? 'top-12 sm:top-14' : 'top-2.5 sm:top-3.5'
          }`}
        >
          <div className="max-w-[78vw] truncate rounded-full border border-amber-300/50 bg-slate-950/90 px-3.5 py-0.5 text-[10px] font-extrabold text-amber-100 shadow-lg sm:text-[11px]">
            {hud.bannerMessage}
          </div>
        </div>
      )}

      {/* Cave Post-Cutscene 3-2-1 Battle Countdown */}
      {hud.phase === 'playing' && hud.caveCountdown && (() => {
        const isGo = hud.caveCountdown.step === 'go';
        return (
          <div
            role="status"
            aria-live="assertive"
            aria-label="Hitung mundur siap bertempur"
            className={`pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-center px-4 text-center select-none transition-colors duration-300 ${
              isGo ? 'bg-transparent' : 'bg-slate-950/30'
            }`}
          >
            <div
              key={String(hud.caveCountdown.step)}
              className={`flex max-w-md flex-col items-center rounded-3xl border px-7 py-5 shadow-2xl backdrop-blur-md transition-transform duration-200 sm:px-10 sm:py-6 ${
                isGo
                  ? 'border-emerald-300/80 bg-gradient-to-b from-emerald-700/92 to-slate-950/92 shadow-[0_0_55px_rgba(52,211,153,0.45)]'
                  : 'border-amber-300/75 bg-gradient-to-b from-slate-900/92 to-slate-950/95 shadow-[0_0_50px_rgba(245,158,11,0.35)]'
              }`}
            >
              <span className="text-xs font-bold tracking-wide text-amber-200/90 sm:text-sm">
                {hud.caveCountdown.zoneName}
              </span>
              <h2 className="mt-1 text-base font-extrabold tracking-tight text-white sm:text-lg">
                {isGo ? 'Ayo Kalahkan Semua Monster!' : 'Siap! Ayo Kalahkan Semua Monster!'}
              </h2>

              {isGo ? (
                <div className="mt-2 flex flex-col items-center">
                  <span className="text-4xl font-black tracking-tight text-emerald-300 drop-shadow-[0_4px_14px_rgba(0,0,0,0.65)] sm:text-5xl">
                    MULAI!
                  </span>
                  <span className="mt-1 text-xs font-semibold text-emerald-100 sm:text-sm">
                    Serang dan buka semua pintu gua!
                  </span>
                </div>
              ) : (
                <div className="mt-2 flex flex-col items-center">
                  <span className="font-mono-nums text-6xl font-black leading-none text-amber-300 drop-shadow-[0_6px_18px_rgba(245,158,11,0.55)] sm:text-8xl">
                    {hud.caveCountdown.step}
                  </span>
                  <span className="mt-1.5 text-xs font-semibold tracking-wider text-slate-300">
                    Bersiap... pertarungan segera dimulai
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Compact Swim Hint & 10-Pose Style Selector when Hero is swimming in the sea */}
      {hud.phase === 'playing' && hud.isSwimming && (() => {
        const pref = hud.swimStylePreference ?? 'auto';
        const activeId = hud.activeSwimStyle ?? 'water_tread';
        const activeMeta = SWIM_STYLE_OPTIONS.find((s) => s.id === activeId) ?? SWIM_STYLE_OPTIONS[6];
        return (
          <div
            className={`pointer-events-auto fixed left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 ${
              multiplayerActive ? 'top-[4.5rem] sm:top-[5rem]' : 'top-9 sm:top-11'
            }`}
          >
            <div className="flex max-w-[92vw] items-center gap-1.5 rounded-full border border-cyan-400/50 bg-slate-950/90 px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-100 shadow-lg sm:text-[11px]">
              <span className="truncate">
                🏊 {pref === 'auto' ? `Auto · ${activeMeta.indo}` : `${activeMeta.num}. ${activeMeta.name} (${activeMeta.indo})`}
              </span>
              <button
                type="button"
                onClick={() => setSwimMenuOpen((v) => !v)}
                className="shrink-0 rounded-full border border-cyan-300/60 bg-cyan-600/80 px-2 py-0.5 text-[9px] font-black text-white transition hover:bg-cyan-500 sm:text-[10px]"
                title="Pilih 10 Gaya Renang (Tombol G)"
              >
                Gaya ▾
              </button>
              {onCycleSwimStyle && (
                <button
                  type="button"
                  onClick={onCycleSwimStyle}
                  className="shrink-0 rounded-full border border-slate-600 bg-slate-800/90 px-1.5 py-0.5 text-[9px] font-black text-cyan-200 transition hover:bg-slate-700 sm:text-[10px]"
                  title="Ganti Gaya Berikutnya (G)"
                >
                  ↻
                </button>
              )}
              {hud.worldMode === 'overworld' && (onDiveOcean || onEnterOcean) && (
                <button
                  type="button"
                  onClick={() => (onDiveOcean ?? onEnterOcean)?.()}
                  className="shrink-0 rounded-full border border-emerald-300/70 bg-emerald-600/90 px-2 py-0.5 text-[9px] font-black text-white transition hover:bg-emerald-500 sm:text-[10px]"
                  title={
                    hud.oceanSurvival
                      ? 'Berenang Naik ke Permukaan Laut (Tombol X)'
                      : 'Masuk ke Dunia Survival Bawah Laut (Tombol X)'
                  }
                >
                  {hud.oceanSurvival ? '🫧 Naik (X)' : '🤿 Menyelam (X)'}
                </button>
              )}
            </div>

            {swimMenuOpen && (
              <div className="w-[90vw] max-w-[430px] rounded-xl border border-cyan-400/45 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-md">
                <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
                  <span className="text-[10px] font-black tracking-wide text-cyan-200">
                    10 GAYA RENANG & SELAM
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onSetSwimStyle?.('auto');
                        setSwimMenuOpen(false);
                      }}
                      className={`rounded-md border px-2 py-0.5 text-[9px] font-black transition ${
                        pref === 'auto'
                          ? 'border-cyan-300 bg-cyan-500 text-slate-950'
                          : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      Auto
                    </button>
                    <button
                      type="button"
                      onClick={() => setSwimMenuOpen(false)}
                      className="rounded-md border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-300 hover:bg-slate-700"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {SWIM_STYLE_OPTIONS.map((opt) => {
                    const selected = pref === opt.id;
                    const running = pref === 'auto' && activeId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onSetSwimStyle?.(opt.id);
                          setSwimMenuOpen(false);
                        }}
                        className={`flex items-center justify-between gap-1 rounded-lg border px-2 py-1 text-left transition ${
                          selected
                            ? 'border-cyan-300 bg-cyan-500/25 text-white'
                            : running
                            ? 'border-cyan-400/50 bg-slate-800/90 text-cyan-100'
                            : 'border-slate-800 bg-slate-900/85 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-[10px] font-extrabold leading-tight">
                            {opt.num}. {opt.name}
                          </div>
                          <div className="truncate text-[8.5px] font-semibold text-cyan-300/85">
                            {opt.indo}
                          </div>
                        </div>
                        <span className="shrink-0 rounded bg-slate-950/80 px-1 py-0.5 text-[8px] font-bold text-amber-300">
                          {opt.spd}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* UNDERWATER SURVIVAL: DIVING GEAR CRAFTING & 20 SEA BIOTA ENCYCLOPEDIA DRAWER */}
      {hud.phase === 'playing' &&
        hud.oceanSurvival &&
        oceanGearOpen && (() => {
          const oc = hud.oceanSurvival!;
          const mats = oc.materials;
          const matEntries: Array<{ key: keyof OceanMaterials; label: string; icon: string }> = [
            { key: 'pearl', label: 'Mutiara', icon: '⚪' },
            { key: 'fiber', label: 'Serat', icon: '🌿' },
            { key: 'calcium', label: 'Kalsium', icon: '🪸' },
            { key: 'shell', label: 'Cangkang', icon: '🐚' },
            { key: 'food', label: 'Makanan', icon: '🍤' },
          ];
          return (
            <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-2 sm:p-4">
              <div className="flex max-h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-cyan-400/50 bg-slate-950/95 p-3 text-slate-100 shadow-2xl sm:p-4">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div>
                    <h3 className="text-sm font-black text-cyan-200 sm:text-base">
                      🤿 Perlengkapan Selam &amp; Ensiklopedia 20 Biota Laut
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Kumpulkan bahan dari biota &amp; peti karang untuk membuat Baju Selam menuju Palung Abyssal.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOceanGearOpen(false)}
                    aria-label="Tutup Panel Laut"
                    className="rounded-lg border border-white/15 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-200 hover:bg-slate-800"
                  >
                    ✕ Tutup
                  </button>
                </div>

                {/* Materials + Quick Heal Bar */}
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-400/25 bg-slate-900/90 px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2.5 font-mono-nums text-[11px] font-extrabold">
                    {matEntries.map((m) => (
                      <span key={m.key} className="inline-flex items-center gap-1 rounded-md bg-slate-950 px-2 py-0.5 text-cyan-100">
                        <span>{m.icon}</span>
                        <span>{m.label}</span>
                        <span className="text-amber-300">{mats[m.key]}</span>
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={mats.food <= 0 || hud.hp >= hud.maxHp || !onEatOceanFood}
                    onClick={() => onEatOceanFood?.()}
                    className="rounded-lg border border-emerald-400/60 bg-emerald-600/90 px-2.5 py-1 text-[10px] font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    🍤 Makan (+1 ❤️)
                  </button>
                </div>

                <div className="mt-2.5 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain touch-pan-y pr-1">
                  {/* Section 1: Diving Gear Crafting */}
                  <div>
                    <h4 className="mb-1.5 text-xs font-black uppercase tracking-wider text-amber-300">
                      Perlengkapan Selam ({oc.ownedGear.length}/3 Dimiliki)
                    </h4>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {(Object.keys(DIVING_GEAR_DEFS) as DivingGearId[]).map((gId) => {
                        const def = DIVING_GEAR_DEFS[gId];
                        const owned = oc.ownedGear.includes(gId);
                        const canCraft = (Object.entries(def.craftCost) as Array<[keyof OceanMaterials, number]>).every(
                          ([k, req]) => mats[k] >= req,
                        );
                        const canDiamond = hud.diamonds >= def.diamondCost;
                        const costText = (Object.entries(def.craftCost) as Array<[keyof OceanMaterials, number]>)
                          .map(([k, req]) => {
                            const labelMap: Record<keyof OceanMaterials, string> = {
                              pearl: 'Mutiara',
                              fiber: 'Serat',
                              calcium: 'Kalsium',
                              shell: 'Cangkang',
                              food: 'Makanan',
                            };
                            return `${req} ${labelMap[k]}`;
                          })
                          .join(' · ');

                        return (
                          <div
                            key={gId}
                            className={`flex flex-col justify-between rounded-xl border p-2.5 ${
                              owned
                                ? 'border-emerald-400/60 bg-emerald-950/35'
                                : 'border-cyan-400/25 bg-slate-900/85'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <span className="text-xs font-black text-white">{def.name}</span>
                                {owned && (
                                  <span className="shrink-0 rounded bg-emerald-500/25 px-1.5 py-0.5 text-[9px] font-black text-emerald-300">
                                    ✓ Dipakai
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-[10px] leading-snug text-cyan-100/85">{def.subtitle}</p>
                              <p className="mt-1.5 font-mono-nums text-[9.5px] font-bold text-amber-200">
                                Bahan {costText}
                              </p>
                            </div>
                            {!owned && (
                              <div className="mt-2 flex gap-1.5">
                                <button
                                  type="button"
                                  disabled={!canCraft || !onCraftDivingGear}
                                  onClick={() => onCraftDivingGear?.(gId, 'craft')}
                                  className="flex-1 rounded-lg bg-cyan-600 px-2 py-1 text-[10px] font-black text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  Buat (Bahan)
                                </button>
                                <button
                                  type="button"
                                  disabled={!canDiamond || !onCraftDivingGear}
                                  onClick={() => onCraftDivingGear?.(gId, 'diamond')}
                                  className="rounded-lg border border-amber-400/50 bg-amber-600/85 px-2 py-1 font-mono-nums text-[10px] font-black text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  💎 {def.diamondCost}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 2: 20 Sea Biota Sheet Encyclopedia */}
                  <div>
                    <h4 className="mb-1.5 text-xs font-black uppercase tracking-wider text-cyan-300">
                      20 Spesies Biota Laut ({oc.discoveredBiota.length}/20 Ditemukan)
                    </h4>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-4">
                      {SEA_BIOTA_CATALOG.map((sp) => {
                        const found = oc.discoveredBiota.includes(sp.id);
                        return (
                          <div
                            key={sp.id}
                            className={`rounded-xl border px-2.5 py-2 ${
                              found
                                ? 'border-emerald-400/50 bg-slate-900/90'
                                : 'border-slate-800 bg-slate-900/55 opacity-80'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 text-[9.5px] font-black">
                              <span className="font-mono-nums text-amber-300">
                                #{sp.num} · {sp.rarity}
                              </span>
                              <span className={found ? 'text-emerald-300' : 'text-slate-400'}>
                                {found ? '✓ Ditemukan' : '? Belum'}
                              </span>
                            </div>
                            <div className="mt-0.5 truncate text-[11px] font-black text-white">
                              {sp.indoName}
                            </div>
                            <div className="truncate text-[9.5px] font-semibold text-cyan-300">
                              {sp.name} · {sp.category}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1 text-[8.5px] font-bold">
                              {sp.mountable && (
                                <span className="rounded bg-emerald-900/80 px-1 py-0.5 text-emerald-200">
                                  Tunggangan Ya
                                </span>
                              )}
                              {sp.yieldKind && (
                                <span className="rounded bg-cyan-900/80 px-1 py-0.5 text-cyan-200">
                                  Hasil {sp.yieldKind}
                                </span>
                              )}
                              {sp.lightRadius && (
                                <span className="rounded bg-sky-900/80 px-1 py-0.5 text-sky-200">
                                  Cahaya {sp.lightRadius}m
                                </span>
                              )}
                              <span
                                className={`rounded px-1 py-0.5 ${
                                  sp.id === 'fire_coral'
                                    ? 'bg-rose-900/80 text-rose-200'
                                    : 'bg-slate-800 text-slate-200'
                                }`}
                              >
                                {sp.statText}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Dynamic Tactical Crosshair & Hit Marker in Bidik Bebas TPS & FPS Modes (hidden in Car/Plane Mode) */}
      {!inCar &&
        !inPlane &&
        hud.phase === 'playing' &&
        (hud.cameraMode === 'first_person' ||
          (hud.settings.aimMode === 'manual' &&
            hud.cameraMode === 'third_back' &&
            (hud.ownedWeapons.length > 0 || hud.isAiming))) && (() => {
          const gap = hud.isAiming
            ? 4 + hud.crosshairSpread * 5
            : 8 + hud.crosshairSpread * 13;
          const colorClass = hud.crosshairOnEnemy
            ? 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.95)]'
            : hud.isAiming
            ? 'bg-cyan-200 shadow-[0_0_4px_rgba(0,0,0,0.9)]'
            : 'bg-white shadow-[0_0_3px_rgba(0,0,0,0.9)]';
          const tickLen = hud.isAiming ? 8 : 7;
          return (
            <div
              aria-hidden="true"
              className="pointer-events-none fixed left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
            >
              {/* ADS Outer Precision Ring */}
              {hud.isAiming && (
                <div
                  className={`absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors ${
                    hud.crosshairOnEnemy ? 'border-rose-400/75' : 'border-cyan-300/45'
                  }`}
                />
              )}
              {/* Center Precision Dot */}
              <span
                className={`absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors ${
                  hud.crosshairOnEnemy
                    ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,1)]'
                    : 'bg-white shadow-[0_0_3px_#000]'
                }`}
              />
              {/* 4 Dynamic Reticle Ticks */}
              <span
                style={{ height: tickLen, transform: `translate(-50%, calc(-100% - ${gap}px))` }}
                className={`absolute left-1/2 top-1/2 w-[2px] rounded-full transition-[background-color] ${colorClass}`}
              />
              <span
                style={{ height: tickLen, transform: `translate(-50%, ${gap}px)` }}
                className={`absolute left-1/2 top-1/2 w-[2px] rounded-full transition-[background-color] ${colorClass}`}
              />
              <span
                style={{ width: tickLen, transform: `translate(calc(-100% - ${gap}px), -50%)` }}
                className={`absolute left-1/2 top-1/2 h-[2px] rounded-full transition-[background-color] ${colorClass}`}
              />
              <span
                style={{ width: tickLen, transform: `translate(${gap}px, -50%)` }}
                className={`absolute left-1/2 top-1/2 h-[2px] rounded-full transition-[background-color] ${colorClass}`}
              />
              {/* Hit / Kill X Marker */}
              {hud.hitMarkerKind !== 'none' && (
                <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2">
                  <span
                    className={`absolute left-1/2 top-0 h-2.5 w-[2.5px] -translate-x-1/2 rotate-45 rounded-full ${
                      hud.hitMarkerKind === 'kill'
                        ? 'bg-amber-300 shadow-[0_0_8px_#f59e0b]'
                        : 'bg-white shadow-[0_0_5px_#000]'
                    }`}
                  />
                  <span
                    className={`absolute left-1/2 bottom-0 h-2.5 w-[2.5px] -translate-x-1/2 rotate-45 rounded-full ${
                      hud.hitMarkerKind === 'kill'
                        ? 'bg-amber-300 shadow-[0_0_8px_#f59e0b]'
                        : 'bg-white shadow-[0_0_5px_#000]'
                    }`}
                  />
                  <span
                    className={`absolute left-1/2 top-0 h-2.5 w-[2.5px] -translate-x-1/2 -rotate-45 rounded-full ${
                      hud.hitMarkerKind === 'kill'
                        ? 'bg-amber-300 shadow-[0_0_8px_#f59e0b]'
                        : 'bg-white shadow-[0_0_5px_#000]'
                    }`}
                  />
                  <span
                    className={`absolute left-1/2 bottom-0 h-2.5 w-[2.5px] -translate-x-1/2 -rotate-45 rounded-full ${
                      hud.hitMarkerKind === 'kill'
                        ? 'bg-amber-300 shadow-[0_0_8px_#f59e0b]'
                        : 'bg-white shadow-[0_0_5px_#000]'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })()}

      {/* Targeted Cave Voxel Block Pill (only when aiming at a cave block) */}
      {hud.worldMode === 'dungeon' && hud.targetedBlock && (
        <div className="pointer-events-none fixed bottom-16 left-1/2 z-20 -translate-x-1/2 sm:bottom-20">
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/88 px-3 py-1 text-[11px] font-extrabold text-slate-100 shadow-lg">
            <span>{hud.targetedBlock.label}</span>
            <span className="font-mono-nums text-[10px] text-amber-300">
              {hud.targetedBlock.hp}/{hud.targetedBlock.maxHp}
            </span>
          </div>
        </div>
      )}

      {/* Clean GTA-style Left Floating Joystick Zone (active On-Foot AND in Car Mode!) */}
      {showTouchControls && (
        <>
          <div
            data-tutorial-target="touch_joystick"
            onPointerDown={(e) => {
              if (stickPointerId.current !== null) return;
              stickPointerId.current = e.pointerId;
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              const origin = { x: e.clientX, y: e.clientY };
              stickOriginRef.current = origin;
              lastStickMoveRef.current = { dx: 0, dy: 0 };
              setFloatingOrigin(origin);
              if (knobImgRef.current) {
                knobImgRef.current.style.transform = 'translate3d(0px, 0px, 0)';
              }
              onVirtualMoveRef.current(0, 0);
            }}
            onPointerMove={(e) => {
              if (stickPointerId.current === e.pointerId) {
                updateJoystickFromPointer(e.clientX, e.clientY);
                if (
                  isTutorialTarget('touch_joystick') &&
                  stickOriginRef.current &&
                  Math.hypot(e.clientX - stickOriginRef.current.x, e.clientY - stickOriginRef.current.y) >= 10
                ) {
                  completeTutorialStep('touch_joystick');
                }
              }
            }}
            onPointerUp={(e) => {
              if (stickPointerId.current === e.pointerId) {
                resetFloatingJoystick();
                if (isTutorialTarget('touch_joystick')) {
                  completeTutorialStep('touch_joystick');
                }
              }
            }}
            onPointerCancel={(e) => {
              if (stickPointerId.current === e.pointerId) {
                resetFloatingJoystick();
              }
            }}
            className="pointer-events-auto fixed bottom-12 left-0 top-28 z-10 w-[44vw] touch-none sm:bottom-16 sm:top-32 sm:w-[40vw]"
            aria-label={inPlane ? 'Area Joystick Terbang' : inCar ? 'Area Joystick Kemudi Mobil' : 'Area Floating Joystick'}
          />

          {(inCar || inPlane) && !floatingOrigin && (
            <div
              aria-hidden="true"
              className="pointer-events-none fixed bottom-16 left-5 z-10 flex h-[104px] w-[104px] items-center justify-center opacity-55 sm:bottom-20 sm:left-8 sm:h-[118px] sm:w-[118px]"
            >
              <img
                src="./assets/ui/joystick_base.png"
                alt=""
                className="pointer-events-none h-full w-full select-none object-contain"
                draggable={false}
              />
              <img
                src="./assets/ui/joystick_knob.png"
                alt=""
                className="pointer-events-none absolute h-[42px] w-[42px] select-none object-contain sm:h-[48px] sm:w-[48px]"
                draggable={false}
              />
            </div>
          )}

          {floatingOrigin && (
            <div
              aria-hidden="true"
              style={{
                left: floatingOrigin.x,
                top: floatingOrigin.y,
                transform: 'translate(-50%, -50%)',
              }}
              className="pointer-events-none fixed z-20 flex h-[112px] w-[112px] items-center justify-center sm:h-[126px] sm:w-[126px]"
            >
              <img
                src="./assets/ui/joystick_base.png"
                alt=""
                className="pointer-events-none h-full w-full select-none object-contain"
                draggable={false}
              />
              <img
                ref={knobImgRef}
                src="./assets/ui/joystick_knob.png"
                alt=""
                className="pointer-events-none absolute h-[46px] w-[46px] select-none object-contain will-change-transform sm:h-[52px] sm:w-[52px]"
                style={{ transform: 'translate3d(0px, 0px, 0)' }}
                draggable={false}
              />
            </div>
          )}
        </>
      )}

      {/* STORY/CHALLENGE-SIZED TRANSPARENT 3D WEAPON & TOOL SHOWCASE POPUP */}
      {hotbarOpen && (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-start justify-center px-2 pt-7 sm:pt-9 lg:items-center lg:pt-0">
          <div className="pointer-events-auto flex max-h-[68dvh] w-full max-w-[calc(100vw-130px)] flex-col overflow-hidden rounded-2xl border border-amber-300/45 bg-slate-950/88 p-2.5 text-slate-100 shadow-2xl sm:max-h-[76dvh] sm:max-w-[min(36rem,calc(100vw-220px))] sm:p-3.5">
            <div className="mb-2 flex items-center justify-between gap-2 border-b border-white/15 pb-1.5">
              <div className="min-w-0">
                <h3 className="truncate text-xs font-black uppercase tracking-wider text-amber-200 [text-shadow:0_1px_2px_rgba(0,0,0,0.92)] sm:text-sm">
                  Senjata 3D &amp; Alat ({hud.ownedWeapons.length}/8)
                </h3>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  (e.currentTarget as HTMLButtonElement).blur();
                  setHotbarOpen(false);
                }}
                aria-label="Tutup Panel Senjata"
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/25 bg-slate-950/35 px-2.5 py-1 text-[10px] font-extrabold text-slate-100 hover:bg-slate-900/55"
              >
                <X className="h-3.5 w-3.5" />
                <span>Tutup</span>
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-2.5 overflow-y-auto overscroll-contain touch-pan-y sm:grid-cols-[205px_1fr]">
              {/* Left Column: Live 3D Rotating Model Showcase */}
              <div className="flex flex-col justify-between rounded-xl border border-white/20 bg-slate-950/15 p-2">
                {inspectedHotbar.kind === 'weapon' ? (
                  (() => {
                    const wId = inspectedHotbar.id;
                    const wSlot = getHotbarSlotForWeapon(wId);
                    const w = WEAPONS[wId];
                    const owned = hud.ownedWeapons.includes(wId);
                    const ammo = hud.weaponAmmo[wId] || 0;
                    const equipped = owned && hud.activeHotbarSlot === wSlot;
                    return (
                      <>
                        <div>
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span
                                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-white/75"
                                style={{ backgroundColor: w.color }}
                              />
                              <span className="truncate text-xs font-black text-amber-200 [text-shadow:0_1px_2px_rgba(0,0,0,0.92)] sm:text-sm">
                                {w.name}
                              </span>
                            </div>
                            {owned ? (
                              <span className="shrink-0 rounded-full bg-slate-950/60 px-1.5 py-0.5 font-mono-nums text-[10px] font-black text-amber-200">
                                {ammo}/{MAX_AMMO}
                              </span>
                            ) : (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-950/65 px-1.5 py-0.5 text-[9px] font-bold text-slate-300">
                                <Lock className="h-2.5 w-2.5" />
                                Terkunci
                              </span>
                            )}
                          </div>

                          <div className="relative my-1 overflow-hidden rounded-xl border border-white/15 bg-slate-950/12">
                            <WeaponPreviewCanvas
                              weaponId={wId}
                              owned={owned}
                              className="h-28 sm:h-36"
                            />
                            <span className="pointer-events-none absolute bottom-1 right-1.5 rounded bg-slate-950/55 px-1.5 py-0.5 text-[9px] font-bold text-slate-200">
                              Geser Putar 3D
                            </span>
                          </div>

                          <p className="line-clamp-2 text-[10px] font-semibold leading-snug text-slate-200 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
                            {w.desc}
                          </p>
                          <p className="mt-0.5 text-[9px] font-bold text-amber-200/90">
                            Asal: {w.originLabel}
                          </p>
                        </div>

                        <div className="mt-2 flex items-center gap-1.5">
                          {owned ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                (e.currentTarget as HTMLButtonElement).blur();
                                onSelectHotbar(wSlot);
                                setHotbarOpen(false);
                              }}
                              className={`w-full rounded-xl border px-2.5 py-1.5 text-[11px] font-black transition ${
                                equipped
                                  ? 'border-emerald-300/80 bg-emerald-600/75 text-white hover:bg-emerald-500/85'
                                  : 'border-amber-300/80 bg-amber-500/75 text-slate-950 hover:bg-amber-400/90'
                              }`}
                            >
                              {equipped ? 'Dipakai · Tutup' : 'Pakai Senjata'}
                            </button>
                          ) : (
                            <div className="w-full rounded-xl border border-white/15 bg-slate-950/45 px-2.5 py-1.5 text-center text-[10px] font-bold text-slate-300">
                              Buka di {w.originLabel}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()
                ) : (
                  (() => {
                    const toolMeta =
                      inspectedHotbar.id === 'pickaxe'
                        ? {
                            slot: 8,
                            title: 'Beliung Tambang',
                            badge: `Tier ${hud.pickaxeTier}`,
                            icon: './assets/ui/icon_pickaxe.png',
                            desc: 'Gali batu gua, bongkar blok pelindung, atau serang jarak dekat.',
                          }
                        : inspectedHotbar.id === 'torch'
                        ? {
                            slot: 9,
                            title: 'Obor Gua',
                            badge: `Stok ${hud.caveTorchesLeft}`,
                            icon: './assets/ui/icon_torch.png',
                            desc: 'Terangi lorong gelap gua dengan cahaya obor permanen.',
                          }
                        : inspectedHotbar.id === 'shield_block'
                        ? {
                            slot: 10,
                            title: 'Blok Pelindung',
                            badge: `Stok ${hud.caveShieldBlocksLeft}`,
                            icon: './assets/ui/icon_shield_block.png',
                            desc: 'Bangun benteng penahan peluru & jembatan di atas jurang lava.',
                          }
                        : {
                            slot: 11,
                            title: 'TNT Tambang',
                            badge: `Stok ${hud.caveTntLeft}`,
                            icon: './assets/ui/icon_tnt.png',
                            desc: 'Ledakkan banyak batu gua sekaligus dan hantam monster sekitar.',
                          };
                    const equipped = hud.activeHotbarSlot === toolMeta.slot;
                    return (
                      <>
                        <div>
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="truncate text-xs font-black text-cyan-200 [text-shadow:0_1px_2px_rgba(0,0,0,0.92)] sm:text-sm">
                              {toolMeta.title}
                            </span>
                            <span className="shrink-0 rounded-full bg-slate-950/60 px-1.5 py-0.5 font-mono-nums text-[10px] font-black text-cyan-200">
                              {toolMeta.badge}
                            </span>
                          </div>
                          <div className="my-1 flex h-28 items-center justify-center rounded-xl border border-white/15 bg-slate-950/12 sm:h-36">
                            <img
                              src={toolMeta.icon}
                              alt={toolMeta.title}
                              className="h-20 w-20 object-contain sm:h-24 sm:w-24"
                              draggable={false}
                            />
                          </div>
                          <p className="line-clamp-3 text-[10px] font-semibold leading-snug text-slate-200 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
                            {toolMeta.desc}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            (e.currentTarget as HTMLButtonElement).blur();
                            onSelectHotbar(toolMeta.slot);
                            setHotbarOpen(false);
                          }}
                          className={`mt-2 w-full rounded-xl border px-2.5 py-1.5 text-[11px] font-black transition ${
                            equipped
                              ? 'border-emerald-300/80 bg-emerald-600/75 text-white hover:bg-emerald-500/85'
                              : 'border-cyan-300/80 bg-cyan-500/75 text-slate-950 hover:bg-cyan-400/90'
                          }`}
                        >
                          {equipped ? 'Dipakai · Tutup' : 'Pakai Alat'}
                        </button>
                      </>
                    );
                  })()
                )}
              </div>

              {/* Right Column: All 8 Weapons (3D Model Thumbnails) + 4 Tools */}
              <div className="grid grid-cols-3 content-start gap-1.5 sm:grid-cols-4">
                {WEAPON_ORDER.map((wId, idx) => {
                  const w = WEAPONS[wId];
                  const wSlot = getHotbarSlotForWeapon(wId);
                  const owned = hud.ownedWeapons.includes(wId);
                  const ammo = hud.weaponAmmo[wId] || 0;
                  const isEquipped = owned && hud.activeHotbarSlot === wSlot;
                  const isInspected =
                    inspectedHotbar.kind === 'weapon' && inspectedHotbar.id === wId;
                  const thumbSrc = weaponThumbs[wId] || './assets/ui/icon_slingshot.png';
                  const keyHint = idx < 8 ? `${idx + 1}. ` : wId === 'harpun' ? 'U. ' : '';
                  return (
                    <button
                      key={wId}
                      type="button"
                      onClick={(e) => {
                        (e.currentTarget as HTMLButtonElement).blur();
                        setInspectedHotbar({ kind: 'weapon', id: wId });
                        if (owned) {
                          onSelectHotbar(wSlot);
                        }
                      }}
                      title={owned ? `${keyHint}${w.name} (${ammo})` : `${w.name} (${w.originLabel})`}
                      className={`relative flex flex-col items-center justify-between gap-1 rounded-xl border px-1.5 py-1.5 text-center transition ${
                        isEquipped
                          ? 'border-emerald-300/90 bg-emerald-950/28 text-emerald-100 ring-1 ring-emerald-300/80'
                          : isInspected
                          ? 'border-amber-300/90 bg-amber-950/28 text-amber-100 ring-1 ring-amber-300/80'
                          : owned
                          ? 'border-white/20 bg-slate-950/15 text-slate-100 hover:border-white/45 hover:bg-slate-900/30'
                          : 'border-white/15 bg-slate-950/12 text-slate-300/90 hover:border-white/30'
                      }`}
                    >
                      {owned ? (
                        <span className="absolute right-1 top-1 rounded-full bg-slate-950/65 px-1 font-mono-nums text-[9px] font-black text-amber-200">
                          {ammo}
                        </span>
                      ) : (
                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950/70 text-slate-300">
                          <Lock className="h-2.5 w-2.5" />
                        </span>
                      )}
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg sm:h-11 sm:w-11"
                        style={{
                          background: `radial-gradient(circle, ${w.color}${
                            owned ? '38' : '16'
                          } 0%, transparent 72%)`,
                        }}
                      >
                        <img
                          src={thumbSrc}
                          alt={w.name}
                          className={`h-10 w-10 object-contain sm:h-11 sm:w-11 ${
                            owned ? '' : 'opacity-55 grayscale'
                          }`}
                          draggable={false}
                        />
                      </div>
                      <span className="line-clamp-1 w-full text-[9px] font-extrabold leading-tight [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] sm:text-[10px]">
                        {w.name}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={(e) => {
                    (e.currentTarget as HTMLButtonElement).blur();
                    setInspectedHotbar({ kind: 'tool', id: 'pickaxe' });
                    onSelectHotbar(8);
                  }}
                  title={`9. Beliung Tier ${hud.pickaxeTier}`}
                  className={`relative flex flex-col items-center justify-between gap-1 rounded-xl border px-1.5 py-1.5 text-center transition ${
                    hud.activeHotbarSlot === 8
                      ? 'border-emerald-300/90 bg-emerald-950/28 text-emerald-100 ring-1 ring-emerald-300/80'
                      : inspectedHotbar.kind === 'tool' && inspectedHotbar.id === 'pickaxe'
                      ? 'border-cyan-300/90 bg-cyan-950/28 text-cyan-100 ring-1 ring-cyan-300/80'
                      : 'border-white/20 bg-slate-950/15 text-slate-100 hover:border-white/45 hover:bg-slate-900/30'
                  }`}
                >
                  <span className="absolute right-1 top-1 rounded-full bg-slate-950/65 px-1 font-mono-nums text-[9px] font-black text-cyan-200">
                    T{hud.pickaxeTier}
                  </span>
                  <img
                    src="./assets/ui/icon_pickaxe.png"
                    alt="Beliung"
                    className="h-9 w-9 object-contain sm:h-10 sm:w-10"
                    draggable={false}
                  />
                  <span className="line-clamp-1 w-full text-[9px] font-extrabold leading-tight [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] sm:text-[10px]">
                    Beliung
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    (e.currentTarget as HTMLButtonElement).blur();
                    setInspectedHotbar({ kind: 'tool', id: 'torch' });
                    onSelectHotbar(9);
                  }}
                  title={`0. Obor (${hud.caveTorchesLeft})`}
                  className={`relative flex flex-col items-center justify-between gap-1 rounded-xl border px-1.5 py-1.5 text-center transition ${
                    hud.activeHotbarSlot === 9
                      ? 'border-emerald-300/90 bg-emerald-950/28 text-emerald-100 ring-1 ring-emerald-300/80'
                      : inspectedHotbar.kind === 'tool' && inspectedHotbar.id === 'torch'
                      ? 'border-amber-300/90 bg-amber-950/28 text-amber-100 ring-1 ring-amber-300/80'
                      : 'border-white/20 bg-slate-950/15 text-slate-100 hover:border-white/45 hover:bg-slate-900/30'
                  }`}
                >
                  <span className="absolute right-1 top-1 rounded-full bg-slate-950/65 px-1 font-mono-nums text-[9px] font-black text-amber-200">
                    {hud.caveTorchesLeft}
                  </span>
                  <img
                    src="./assets/ui/icon_torch.png"
                    alt="Obor"
                    className="h-9 w-9 object-contain sm:h-10 sm:w-10"
                    draggable={false}
                  />
                  <span className="line-clamp-1 w-full text-[9px] font-extrabold leading-tight [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] sm:text-[10px]">
                    Obor
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    (e.currentTarget as HTMLButtonElement).blur();
                    setInspectedHotbar({ kind: 'tool', id: 'shield_block' });
                    onSelectHotbar(10);
                  }}
                  title={`B. Blok Pelindung (${hud.caveShieldBlocksLeft})`}
                  className={`relative flex flex-col items-center justify-between gap-1 rounded-xl border px-1.5 py-1.5 text-center transition ${
                    hud.activeHotbarSlot === 10
                      ? 'border-emerald-300/90 bg-emerald-950/28 text-emerald-100 ring-1 ring-emerald-300/80'
                      : inspectedHotbar.kind === 'tool' && inspectedHotbar.id === 'shield_block'
                      ? 'border-cyan-300/90 bg-cyan-950/28 text-cyan-100 ring-1 ring-cyan-300/80'
                      : 'border-white/20 bg-slate-950/15 text-slate-100 hover:border-white/45 hover:bg-slate-900/30'
                  }`}
                >
                  <span className="absolute right-1 top-1 rounded-full bg-slate-950/65 px-1 font-mono-nums text-[9px] font-black text-cyan-200">
                    {hud.caveShieldBlocksLeft}
                  </span>
                  <img
                    src="./assets/ui/icon_shield_block.png"
                    alt="Blok Pelindung"
                    className="h-9 w-9 object-contain sm:h-10 sm:w-10"
                    draggable={false}
                  />
                  <span className="line-clamp-1 w-full text-[9px] font-extrabold leading-tight [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] sm:text-[10px]">
                    Pelindung
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    (e.currentTarget as HTMLButtonElement).blur();
                    setInspectedHotbar({ kind: 'tool', id: 'tnt' });
                    onSelectHotbar(11);
                  }}
                  title={`T. TNT Tambang (${hud.caveTntLeft})`}
                  className={`relative flex flex-col items-center justify-between gap-1 rounded-xl border px-1.5 py-1.5 text-center transition ${
                    hud.activeHotbarSlot === 11
                      ? 'border-emerald-300/90 bg-emerald-950/28 text-emerald-100 ring-1 ring-emerald-300/80'
                      : inspectedHotbar.kind === 'tool' && inspectedHotbar.id === 'tnt'
                      ? 'border-rose-300/90 bg-rose-950/28 text-rose-100 ring-1 ring-rose-300/80'
                      : 'border-white/20 bg-slate-950/15 text-slate-100 hover:border-white/45 hover:bg-slate-900/30'
                  }`}
                >
                  <span className="absolute right-1 top-1 rounded-full bg-slate-950/65 px-1 font-mono-nums text-[9px] font-black text-rose-200">
                    {hud.caveTntLeft}
                  </span>
                  <img
                    src="./assets/ui/icon_tnt.png"
                    alt="TNT"
                    className="h-9 w-9 object-contain sm:h-10 sm:w-10"
                    draggable={false}
                  />
                  <span className="line-clamp-1 w-full text-[9px] font-extrabold leading-tight [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] sm:text-[10px]">
                    TNT
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEXTUAL ACTION MEDALLIONS (Mobile Legends style icon row left of Jump & Dive buttons) */}
      <div
        className={`pointer-events-auto fixed bottom-[16px] z-20 flex items-center gap-2.5 sm:bottom-[24px] sm:gap-3 ${
          (hud.worldMode === 'overworld' || hud.worldMode === 'ocean') &&
          Boolean(onDiveOcean || onEnterOcean)
            ? 'right-[218px] sm:right-[250px]'
            : 'right-[168px] sm:right-[198px]'
        }`}
      >
        {nearbyOverworldNpc && (
          <div className="relative flex flex-col items-center">
            {hud.guardianTalkTutorial && (
              <div className="pointer-events-none absolute bottom-full right-0 mb-2.5 flex flex-col items-end sm:right-auto sm:items-center">
                <div className="animate-bounce max-w-[235px] rounded-xl border-2 border-amber-300 bg-emerald-950/95 px-3 py-1.5 text-center text-[11px] font-black leading-snug text-amber-100 shadow-[0_6px_20px_rgba(16,185,129,0.55)] sm:max-w-none sm:whitespace-nowrap">
                  👆 Tutorial · Tekan tombol ini (atau E) untuk bicara dengan {nearbyOverworldNpc.name}!
                </div>
                <div className="mr-5 h-2.5 w-2.5 -mt-1.5 rotate-45 border-b-2 border-r-2 border-amber-300 bg-emerald-950 sm:mr-0" />
              </div>
            )}
            <button
              type="button"
              onClick={onPrimaryAction}
              title={`Bicara dengan ${nearbyOverworldNpc.name}`}
              aria-label={`Bicara dengan ${nearbyOverworldNpc.name}`}
              className={`relative flex h-[54px] w-[54px] items-center justify-center rounded-full shadow-[0_5px_14px_rgba(245,158,11,0.48)] transition-transform hover:scale-105 active:scale-90 sm:h-[62px] sm:w-[62px] ${
                hud.guardianTalkTutorial
                  ? 'ring-4 ring-emerald-400 ring-offset-2 ring-offset-slate-950/80 animate-pulse'
                  : ''
              }`}
            >
              <img
                src="./assets/ui/btn_talk.png"
                alt={nearbyOverworldNpc.name}
                className="pointer-events-none h-full w-full select-none object-contain"
                draggable={false}
              />
            </button>
          </div>
        )}

        {hud.worldMode === 'dungeon' &&
          hud.nearCaveRibbon &&
          !hud.dungeonState?.caveRibbonCollected && (
            <button
              type="button"
              onClick={onPrimaryAction}
              title="Ambil Pita Merah 3D"
              aria-label="Ambil Pita Merah 3D"
              className="relative flex h-[54px] w-[54px] animate-pulse items-center justify-center rounded-full border-2 border-rose-300/90 bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_5px_16px_rgba(244,63,94,0.62)] transition-transform hover:scale-105 active:scale-90 sm:h-[62px] sm:w-[62px]"
            >
              <span className="pointer-events-none select-none text-2xl leading-none">🎀</span>
              <span className="pointer-events-none absolute -bottom-0.5 rounded-full border border-rose-200/90 bg-slate-950/95 px-1.5 text-[9px] font-black leading-tight text-rose-100 shadow">
                Ambil Pita
              </span>
            </button>
          )}

        {nearbyOverworldDoorNpc && !nearbyOverworldNpc && !hud.nearPortal && (
          <button
            type="button"
            onClick={onPrimaryAction}
            title={
              hud.worldTime.phase === 'malam'
                ? overworldDoorHasNightPermission
                  ? `Masuk ${nearbyOverworldDoorNpc.zoneName} (Izin Malam Diberikan)`
                  : `Pintu ${nearbyOverworldDoorNpc.zoneName}, minta izin ke ${nearbyOverworldDoorNpc.name}`
                : `Bicara Penjaga & Masuk ${nearbyOverworldDoorNpc.zoneName}`
            }
            aria-label={
              hud.worldTime.phase === 'malam'
                ? overworldDoorHasNightPermission
                  ? `Masuk ${nearbyOverworldDoorNpc.zoneName}`
                  : `Butuh izin ${nearbyOverworldDoorNpc.name}`
                : `Bicara Penjaga ${nearbyOverworldDoorNpc.zoneName}`
            }
            className={`relative flex h-[54px] w-[54px] items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 sm:h-[62px] sm:w-[62px] ${
              overworldDoorHasNightPermission
                ? 'shadow-[0_5px_14px_rgba(16,185,129,0.52)]'
                : 'shadow-[0_5px_14px_rgba(245,158,11,0.52)]'
            }`}
          >
            <img
              src="./assets/ui/btn_door.png"
              alt={nearbyOverworldDoorNpc.zoneName}
              className="pointer-events-none h-full w-full select-none object-contain"
              draggable={false}
            />
            <span
              className={`pointer-events-none absolute -bottom-0.5 rounded-full border px-1.5 text-[9px] font-black leading-tight shadow ${
                hud.worldTime.phase === 'malam'
                  ? overworldDoorHasNightPermission
                    ? 'border-emerald-300/80 bg-slate-950/95 text-emerald-200'
                    : 'border-amber-300/80 bg-slate-950/95 text-amber-200'
                  : 'border-emerald-300/70 bg-slate-950/95 text-emerald-200'
              }`}
            >
              {hud.worldTime.phase === 'malam'
                ? overworldDoorHasNightPermission
                  ? '🔑 Izin'
                  : '🔒 Izin'
                : 'Masuk'}
            </span>
          </button>
        )}

        {nearbyAcademyNpc && (
          <button
            type="button"
            onClick={onPrimaryAction}
            title={`Bicara dengan ${nearbyAcademyNpc.name}`}
            aria-label={`Bicara dengan ${nearbyAcademyNpc.name}`}
            className="relative flex h-[54px] w-[54px] items-center justify-center rounded-full shadow-[0_5px_14px_rgba(168,85,247,0.48)] transition-transform hover:scale-105 active:scale-90 sm:h-[62px] sm:w-[62px]"
          >
            <img
              src="./assets/ui/btn_talk.png"
              alt={nearbyAcademyNpc.name}
              className="pointer-events-none h-full w-full select-none object-contain"
              draggable={false}
            />
          </button>
        )}

        {nearbyDoor && (
          <button
            type="button"
            onClick={onPrimaryAction}
            title={`Buka ${nearbyDoor.name}`}
            aria-label={`Buka ${nearbyDoor.name}`}
            className="relative flex h-[54px] w-[54px] items-center justify-center rounded-full shadow-[0_5px_14px_rgba(16,185,129,0.52)] transition-transform hover:scale-105 active:scale-90 sm:h-[62px] sm:w-[62px]"
          >
            <img
              src="./assets/ui/btn_door.png"
              alt={`Buka ${nearbyDoor.name}`}
              className="pointer-events-none h-full w-full select-none object-contain"
              draggable={false}
            />
            {hud.nearbyDoorIndex !== null && (
              <span className="pointer-events-none absolute -bottom-0.5 rounded-full border border-emerald-300/70 bg-slate-950/95 px-1.5 font-mono-nums text-[9px] font-black leading-tight text-emerald-200 shadow">
                {hud.nearbyDoorIndex + 1}
              </span>
            )}
          </button>
        )}

        {hud.nearPortal && hud.worldMode === 'overworld' && (
          <button
            type="button"
            onClick={onPrimaryAction}
            title="Masuk Istana IELTS"
            aria-label="Masuk Istana IELTS"
            className="relative flex h-[54px] w-[54px] items-center justify-center rounded-full shadow-[0_5px_14px_rgba(168,85,247,0.56)] transition-transform hover:scale-105 active:scale-90 sm:h-[62px] sm:w-[62px]"
          >
            <img
              src="./assets/ui/btn_portal.png"
              alt="Istana IELTS"
              className="pointer-events-none h-full w-full select-none object-contain"
              draggable={false}
            />
          </button>
        )}

        {multiplayerActive && hud.nearbyInjuredPeer && onHelpTeammate && (
          <button
            type="button"
            onClick={onHelpTeammate}
            title={`Bantu ${hud.nearbyInjuredPeer.displayName} (+1 ❤️) [R]`}
            aria-label={`Bantu ${hud.nearbyInjuredPeer.displayName}`}
            className={`relative flex items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-black shadow-lg transition-transform hover:scale-105 active:scale-95 ${
              (hud.allyHelpCooldownSec ?? 0) > 0
                ? 'border-slate-400/50 bg-slate-900/90 text-slate-300'
                : 'border-emerald-300/80 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_5px_16px_rgba(16,185,129,0.5)]'
            }`}
          >
            <Heart className="h-4 w-4 shrink-0 fill-current" />
            <span className="max-w-[96px] truncate">
              {(hud.allyHelpCooldownSec ?? 0) > 0
                ? `${Math.ceil(hud.allyHelpCooldownSec ?? 0)}d`
                : `Bantu ${hud.nearbyInjuredPeer.displayName}`}
            </span>
            <span className="rounded bg-slate-950/60 px-1 py-0.5 font-mono-nums text-[9px] text-emerald-100">
              R
            </span>
          </button>
        )}

        {hud.nearDungeonExit && hud.worldMode !== 'overworld' && (
          <button
            type="button"
            onClick={onExitDungeon}
            title="Keluar ke Dunia Utama"
            aria-label="Keluar"
            className="relative flex h-[54px] w-[54px] items-center justify-center rounded-full shadow-[0_5px_14px_rgba(34,211,238,0.52)] transition-transform hover:scale-105 active:scale-90 sm:h-[62px] sm:w-[62px]"
          >
            <img
              src="./assets/ui/btn_exit.png"
              alt="Keluar"
              className="pointer-events-none h-full w-full select-none object-contain"
              draggable={false}
            />
          </button>
        )}

        {hud.worldMode === 'dungeon' &&
          hud.nearCraftingTable &&
          !nearbyDoor &&
          !hud.nearDungeonExit && (
            <button
              type="button"
              onClick={onOpenCrafting}
              title="Meja Craft"
              aria-label="Craft"
              className="relative flex h-[54px] w-[54px] items-center justify-center rounded-full shadow-[0_5px_14px_rgba(249,115,22,0.52)] transition-transform hover:scale-105 active:scale-90 sm:h-[62px] sm:w-[62px]"
            >
              <img
                src="./assets/ui/btn_craft.png"
                alt="Craft"
                className="pointer-events-none h-full w-full select-none object-contain"
                draggable={false}
              />
            </button>
          )}

        {hud.worldMode === 'dungeon' &&
          hud.nearPrisonKey &&
          !hud.dungeonState?.prisonKeyCollected && (
            <button
              type="button"
              onClick={onPrimaryAction}
              title="Ambil Kunci Penjara"
              aria-label="Ambil Kunci"
              className="relative flex h-[54px] w-[54px] animate-pulse items-center justify-center rounded-full shadow-[0_5px_14px_rgba(250,204,21,0.56)] transition-transform hover:scale-105 active:scale-90 sm:h-[62px] sm:w-[62px]"
            >
              <img
                src="./assets/ui/btn_key.png"
                alt="Ambil Kunci"
                className="pointer-events-none h-full w-full select-none object-contain"
                draggable={false}
              />
            </button>
          )}

        {hud.worldMode === 'dungeon' &&
          hud.nearHiddenPrison &&
          hud.dungeonState &&
          !hud.dungeonState.prisonUnlocked && (() => {
            const cellLabel = hud.dungeonState.nearPrisonCellLabel || hud.dungeonState.captiveName;
            return (
            <button
              type="button"
              onClick={onPrimaryAction}
              title={
                hud.dungeonState.prisonKeyCollected
                  ? `Bebaskan ${cellLabel}`
                  : `${cellLabel} Terkunci (Butuh Kunci)`
              }
              aria-label={
                hud.dungeonState.prisonKeyCollected
                  ? `Bebaskan ${cellLabel}`
                  : 'Terkunci'
              }
              className={`relative flex h-[54px] w-[54px] items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 sm:h-[62px] sm:w-[62px] ${
                hud.dungeonState.prisonKeyCollected
                  ? 'shadow-[0_5px_14px_rgba(16,185,129,0.56)]'
                  : 'opacity-80 grayscale-[35%] shadow-[0_5px_12px_rgba(244,63,94,0.48)]'
              }`}
            >
              <img
                src="./assets/ui/btn_unlock.png"
                alt={hud.dungeonState.prisonKeyCollected ? 'Bebaskan' : 'Terkunci'}
                className="pointer-events-none h-full w-full select-none object-contain"
                draggable={false}
              />
              {!hud.dungeonState.prisonKeyCollected && (
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-rose-300 bg-rose-950/95 text-rose-200 shadow">
                  <Lock className="h-3 w-3" />
                </span>
              )}
            </button>
            );
          })()}

        {hud.worldMode === 'dungeon' &&
          hud.nearbyDungeonGuardian &&
          !nearbyDoor &&
          !hud.nearDungeonExit &&
          !hud.nearPrisonKey &&
          !hud.nearHiddenPrison && (
            <button
              type="button"
              onClick={onPrimaryAction}
              title={`Bicara dengan ${hud.dungeonState?.guardianName || 'Penjaga'}`}
              aria-label={hud.dungeonState?.guardianName || 'Penjaga'}
              className="relative flex h-[54px] w-[54px] items-center justify-center rounded-full shadow-[0_5px_14px_rgba(245,158,11,0.48)] transition-transform hover:scale-105 active:scale-90 sm:h-[62px] sm:w-[62px]"
            >
              <img
                src="./assets/ui/btn_talk.png"
                alt={hud.dungeonState?.guardianName || 'Penjaga'}
                className="pointer-events-none h-full w-full select-none object-contain"
                draggable={false}
              />
            </button>
          )}

        {hud.worldMode === 'dungeon' &&
          hud.targetedBlock?.kind === 'word_seal' &&
          !nearbyDoor &&
          !hud.nearDungeonExit &&
          !hud.nearCraftingTable && (
            <button
              type="button"
              onClick={onPrimaryAction}
              title="Hancurkan Segel Kata"
              aria-label="Segel Kata"
              className="relative flex h-[54px] w-[54px] items-center justify-center rounded-full shadow-[0_5px_14px_rgba(168,85,247,0.56)] transition-transform hover:scale-105 active:scale-90 sm:h-[62px] sm:w-[62px]"
            >
              <img
                src="./assets/ui/btn_seal.png"
                alt="Segel Kata"
                className="pointer-events-none h-full w-full select-none object-contain"
                draggable={false}
              />
            </button>
          )}

        {hud.oceanSurvival?.nearChestLabel && (
          <button
            type="button"
            onClick={onPrimaryAction}
            title={hud.oceanSurvival.nearChestLabel}
            className="flex h-[52px] items-center gap-1.5 rounded-full border-2 border-amber-300 bg-amber-600/95 px-3.5 text-xs font-black text-white shadow-[0_5px_14px_rgba(245,158,11,0.55)] transition-transform hover:scale-105 active:scale-90"
          >
            <span>🧰</span>
            <span>Buka Peti</span>
          </button>
        )}

        {hud.oceanSurvival?.nearBiotaId && (
          <button
            type="button"
            onClick={onPrimaryAction}
            title={hud.oceanSurvival.nearBiotaAction || hud.oceanSurvival.nearBiotaName || 'Interaksi Biota'}
            className="flex h-[52px] items-center gap-1.5 rounded-full border-2 border-cyan-300 bg-cyan-700/95 px-3.5 text-xs font-black text-white shadow-[0_5px_14px_rgba(34,211,238,0.55)] transition-transform hover:scale-105 active:scale-90"
          >
            <span>🌿</span>
            <span className="max-w-[120px] truncate">
              {hud.oceanSurvival.nearBiotaAction || hud.oceanSurvival.nearBiotaName}
            </span>
          </button>
        )}

        {!inCar &&
          !inPlane &&
          hud.worldMode === 'overworld' &&
          hud.carState?.nearCar &&
          onToggleCar && (
              <button
                type="button"
                onClick={onToggleCar}
                title={`Buka Pintu & Masuk ${hud.carState.carName || 'Mobil'} (E)`}
                aria-label={`Masuk ${hud.carState.carName || 'Mobil'}`}
                className="relative flex h-[54px] w-[54px] items-center justify-center rounded-full shadow-[0_5px_16px_rgba(14,165,233,0.62)] ring-2 ring-sky-300/80 transition-transform hover:scale-105 active:scale-90 sm:h-[62px] sm:w-[62px]"
              >
              <span className="pointer-events-none h-full w-full overflow-hidden rounded-full bg-slate-950">
                <img
                  src="./assets/aistudio/btn_car_enter_7623e10e.jpeg"
                  alt="Masuk Mobil"
                  className="pointer-events-none h-full w-full scale-[1.24] select-none object-cover"
                  draggable={false}
                />
              </span>
              <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-sky-300/75 bg-slate-950/92 px-1.5 text-[8px] font-black leading-tight text-sky-100 shadow sm:text-[9px]">
                Masuk (E)
              </span>
            </button>
          )}

        {!inCar &&
          !inPlane &&
          hud.worldMode === 'overworld' &&
          hud.planeState?.nearPlane &&
          onTogglePlane && (
            <button
              type="button"
              onClick={onTogglePlane}
              title={`Naik ke Kokpit ${hud.planeState.planeName || 'Pesawat'} (E)`}
              aria-label={`Naik ${hud.planeState.planeName || 'Pesawat'}`}
              className="relative flex h-[56px] w-[56px] items-center justify-center rounded-full shadow-[0_5px_18px_rgba(56,189,248,0.65)] ring-2 ring-cyan-300/85 transition-transform hover:scale-105 active:scale-90 sm:h-[64px] sm:w-[64px]"
            >
              <span className="pointer-events-none h-full w-full overflow-hidden rounded-full bg-slate-950">
                <img
                  src="./assets/ui/btn_plane_board.png"
                  alt="Naik Pesawat"
                  className="pointer-events-none h-full w-full select-none object-cover"
                  draggable={false}
                />
              </span>
              <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-300/80 bg-slate-950/92 px-1.5 text-[8px] font-black leading-tight text-cyan-100 shadow sm:text-[9px]">
                Naik (E)
              </span>
            </button>
          )}

        {(hud.oceanSurvival?.nearTurtleMount || hud.oceanSurvival?.ridingTurtle) &&
          !inCar &&
          !inPlane &&
          onToggleOceanTurtle && (
            <button
              type="button"
              onClick={onToggleOceanTurtle}
              title={hud.oceanSurvival.ridingTurtle ? 'Turun dari Penyu' : 'Tunggangi Penyu Laut'}
              className="flex h-[52px] items-center gap-1.5 rounded-full border-2 border-emerald-300 bg-emerald-600/95 px-3.5 text-xs font-black text-white shadow-[0_5px_14px_rgba(16,185,129,0.55)] transition-transform hover:scale-105 active:scale-90"
            >
              <span>🐢</span>
              <span>{hud.oceanSurvival.ridingTurtle ? 'Turun Penyu' : 'Naik Penyu'}</span>
            </button>
          )}
      </div>

      {/* OCEAN DEPTH CONTROLS (Holdable Naik / Turun buttons cleanly above Attack) */}
      {!inCar &&
        !inPlane &&
        hud.phase === 'playing' &&
        (hud.worldMode === 'ocean' || Boolean(hud.oceanSurvival)) &&
        onOceanVertical && (
          <div className="pointer-events-auto fixed bottom-[92px] right-3 z-20 flex flex-col gap-1.5 sm:bottom-[108px] sm:right-5">
            <button
              type="button"
              data-no-click-sfx="true"
              onPointerDown={(e) => {
                e.preventDefault();
                onOceanVertical('up', true);
              }}
              onPointerUp={() => onOceanVertical('up', false)}
              onPointerCancel={() => onOceanVertical('up', false)}
              onPointerLeave={() => onOceanVertical('up', false)}
              title="Berenang Naik (Spasi)"
              className="flex h-8 w-[74px] touch-none select-none items-center justify-center gap-1 rounded-full border border-cyan-300/70 bg-cyan-800/95 text-[10px] font-black text-white shadow-lg transition active:scale-95 sm:h-9 sm:w-[82px] sm:text-[11px]"
            >
              <span>▲ Naik</span>
            </button>
            <button
              type="button"
              data-no-click-sfx="true"
              onPointerDown={(e) => {
                e.preventDefault();
                onOceanVertical('down', true);
              }}
              onPointerUp={() => onOceanVertical('down', false)}
              onPointerCancel={() => onOceanVertical('down', false)}
              onPointerLeave={() => onOceanVertical('down', false)}
              title="Menyelam Turun (Z / Ctrl)"
              className="flex h-8 w-[74px] touch-none select-none items-center justify-center gap-1 rounded-full border border-sky-300/70 bg-slate-900/95 text-[10px] font-black text-cyan-200 shadow-lg transition active:scale-95 sm:h-9 sm:w-[82px] sm:text-[11px]"
            >
              <span>▼ Turun</span>
            </button>
          </div>
        )}

      {/* BOTTOM-RIGHT: On-Foot / Combat / Swim Thumb Cluster (hidden completely when in Car or Plane Mode!) */}
      {!inCar && !inPlane && (
        <div className="pointer-events-none fixed bottom-3 right-3 z-20 h-[144px] w-[216px] sm:bottom-5 sm:right-5 sm:h-[168px] sm:w-[244px]">
          {/* Dive / Surface Ocean Medallion right next to Jump (hidden when inland far from beach/sea) */}
          {(hud.worldMode === 'ocean' ||
            (hud.worldMode === 'overworld' &&
              (Boolean(hud.nearSeaShore) ||
                Boolean(hud.isSwimming) ||
                Boolean(hud.oceanSurvival) ||
                (hud.diveTransitionStage !== undefined && hud.diveTransitionStage !== 'idle')))) &&
            Boolean(onDiveOcean || onEnterOcean) && (() => {
              const isUnderwaterHud = hud.worldMode === 'ocean' || Boolean(hud.oceanSurvival);
              return (
                <button
                  type="button"
                  data-no-click-sfx="true"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    (onDiveOcean ?? onEnterOcean)?.();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      (onDiveOcean ?? onEnterOcean)?.();
                    }
                  }}
                  title={
                    isUnderwaterHud
                      ? 'Berenang Naik ke Permukaan Laut (X)'
                      : hud.swimSuitPicked
                      ? 'Berenang & Menyelam Masuk ke Laut (X)'
                      : 'Ambil Pakaian Renang di Dekat Desa untuk Menyelam'
                  }
                  aria-label={
                    isUnderwaterHud
                      ? 'Berenang Naik ke Permukaan Laut'
                      : hud.swimSuitPicked
                      ? 'Menyelam ke Laut'
                      : 'Cari Pakaian Renang'
                  }
                  className={`pointer-events-auto absolute bottom-[10px] right-[152px] flex h-[52px] w-[52px] touch-none select-none items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 sm:bottom-[14px] sm:right-[176px] sm:h-[58px] sm:w-[58px] ${
                    hud.diveTransitionStage && hud.diveTransitionStage !== 'idle'
                      ? 'animate-pulse ring-2 ring-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.85)]'
                      : isUnderwaterHud
                      ? 'shadow-[0_5px_14px_rgba(16,185,129,0.58)] ring-2 ring-emerald-300/75'
                      : hud.swimSuitPicked
                      ? 'shadow-[0_5px_14px_rgba(34,211,238,0.56)] ring-2 ring-cyan-300/75'
                      : 'opacity-90 shadow-[0_5px_14px_rgba(245,158,11,0.45)] ring-2 ring-amber-300/70'
                  }`}
                >
                  <span className="pointer-events-none h-full w-full overflow-hidden rounded-full bg-slate-950">
                    <img
                      src={
                        isUnderwaterHud
                          ? './assets/aistudio/Gemini_Generated_Image_aoej87aoej87aoej_de96d052.jpeg'
                          : './assets/aistudio/Gemini_Generated_Image_p9qrl3p9qrl3p9qr_c81c9878.jpeg'
                      }
                      alt={isUnderwaterHud ? 'Naik ke Permukaan' : 'Menyelam ke Laut'}
                      className="pointer-events-none h-full w-full scale-[1.09] select-none object-cover"
                      draggable={false}
                    />
                  </span>
                  {!isUnderwaterHud && !hud.swimSuitPicked && (
                    <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-amber-300 bg-slate-950/95 text-amber-200 shadow sm:h-5 sm:w-5">
                      <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </span>
                  )}
                  <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-300/65 bg-slate-950/90 px-1.5 text-[8px] font-black leading-tight text-cyan-100 shadow sm:text-[9px]">
                    {isUnderwaterHud ? 'Naik' : hud.swimSuitPicked ? 'Selam' : 'Baju'}
                  </span>
                </button>
              );
            })()}

          {/* Button 2 (Arc Left): Winged-Boot Jump Medallion */}
          <button
            type="button"
            data-tutorial-target="jump"
            data-no-click-sfx="true"
            onPointerDown={(e) => {
              e.preventDefault();
              onJump();
              completeTutorialStep('jump');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onJump();
                completeTutorialStep('jump');
              }
            }}
            title={hud.isSwimming ? 'Lompat Naik dari Air (J / Spasi)' : 'Lompat (J)'}
            aria-label={hud.isSwimming ? 'Lompat Naik dari Air' : 'Lompat'}
            className="pointer-events-auto absolute bottom-[6px] right-[88px] flex h-[58px] w-[58px] touch-none select-none items-center justify-center rounded-full shadow-[0_5px_14px_rgba(16,185,129,0.44)] transition-transform hover:scale-105 active:scale-90 sm:bottom-[8px] sm:right-[102px] sm:h-[66px] sm:w-[66px]"
          >
            <img
              src="./assets/ui/btn_jump.png"
              alt="Lompat"
              className="pointer-events-none h-full w-full select-none object-contain"
              draggable={false}
            />
          </button>

          {/* Optional ADS / Scope Bidik Button (shows in Bidik Bebas mode when holding an owned weapon, or during Scope tutorial step) */}
          {((hud.settings.aimMode === 'manual' &&
            isWeaponHotbarSlot(hud.activeHotbarSlot) &&
            hud.ownedWeapons.includes(hud.activeWeapon)) ||
            isTutorialTarget('scope')) && (
            <button
              type="button"
              data-tutorial-target="scope"
              onClick={() => {
                if (
                  hud.settings.aimMode === 'manual' &&
                  isWeaponHotbarSlot(hud.activeHotbarSlot) &&
                  hud.ownedWeapons.includes(hud.activeWeapon)
                ) {
                  onToggleAim();
                }
                completeTutorialStep('scope');
              }}
              title={hud.isAiming ? 'Keluar Mode Scope (Klik Kanan / Q)' : 'Mode Scope / Bidik Presisi (Klik Kanan / Q)'}
              aria-label="Mode Scope"
              className={`pointer-events-auto absolute bottom-[88px] right-[82px] flex h-[54px] w-[54px] items-center justify-center rounded-full transition-transform active:scale-90 sm:bottom-[102px] sm:right-[96px] sm:h-[60px] sm:w-[60px] ${
                hud.isAiming
                  ? 'scale-110 ring-2 ring-rose-300 shadow-[0_0_16px_rgba(244,63,94,0.85)]'
                  : 'shadow-[0_5px_14px_rgba(244,63,94,0.45)] hover:scale-105'
              }`}
            >
              <img
                src="./assets/ui/btn_scope.png"
                alt="Mode Scope"
                className="pointer-events-none h-full w-full select-none object-contain"
                draggable={false}
              />
            </button>
          )}

          {/* Quick Ammo Refill Medallion directly above Attack (shows live availability, or preview during tutorial) */}
          {((hud.ownedWeapons.length > 0 && Boolean(onBuyAmmo)) ||
            isTutorialTarget('buy_ammo')) &&
            (() => {
              const tutorialPracticeAmmo = isTutorialTarget('buy_ammo');
              const ammoFull = activeAmmo >= MAX_AMMO;
              const hasEnoughDiamonds = hud.diamonds >= AMMO_COST;
              const canBuyAmmo = hasEnoughDiamonds && !ammoFull;
              const isUnderwaterHud = hud.worldMode === 'ocean' || Boolean(hud.oceanSurvival);
              const reloadTitle = ammoFull
                ? `Peluru ${activeWeaponDef.name} penuh (${activeAmmo}/${MAX_AMMO})`
                : hasEnoughDiamonds
                ? `Isi +${activeWeaponDef.packSize} Peluru (${AMMO_COST} 💎)`
                : `Berlian kurang (${hud.diamonds}/${AMMO_COST} 💎) untuk isi peluru`;
              return (
                <button
                  type="button"
                  data-tutorial-target="buy_ammo"
                  disabled={!tutorialPracticeAmmo && !canBuyAmmo}
                  onClick={() => {
                    if (tutorialPracticeAmmo) {
                      completeTutorialStep('buy_ammo');
                      return;
                    }
                    onBuyAmmo?.();
                  }}
                  title={reloadTitle}
                  aria-label={reloadTitle}
                  className={`pointer-events-auto absolute right-[10px] flex h-[52px] w-[52px] touch-none select-none items-center justify-center rounded-full transition-transform sm:right-[12px] sm:h-[58px] sm:w-[58px] ${
                    isUnderwaterHud
                      ? 'bottom-[170px] sm:bottom-[196px]'
                      : 'bottom-[88px] sm:bottom-[102px]'
                  } ${
                    canBuyAmmo || tutorialPracticeAmmo
                      ? `ring-2 ring-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.72)] hover:scale-105 active:scale-90 ${
                          activeAmmo === 0 ? 'animate-pulse' : ''
                        }`
                      : ammoFull
                      ? 'cursor-not-allowed opacity-45 grayscale ring-1 ring-emerald-400/55'
                      : 'cursor-not-allowed opacity-45 grayscale ring-1 ring-rose-400/70'
                  }`}
                >
                  <ResilientMedallionImg
                    src="./assets/aistudio/image_b5910649.png"
                    fallback={<RotateCw className="h-5 w-5 text-cyan-300" />}
                  />
                  <span
                    className={`pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-1.5 font-mono-nums text-[8px] font-black leading-tight shadow sm:text-[9px] ${
                      canBuyAmmo || tutorialPracticeAmmo
                        ? 'border-cyan-300/80 bg-cyan-950/95 text-cyan-100'
                        : ammoFull
                        ? 'border-emerald-400/65 bg-slate-950/95 text-emerald-200'
                        : 'border-rose-400/75 bg-slate-950/95 text-rose-200'
                    }`}
                  >
                    {ammoFull && !tutorialPracticeAmmo ? 'MAX' : `${AMMO_COST}💎`}
                  </span>
                </button>
              );
            })()}

          {/* Button 3 (Primary Thumb Anchor): Large Attack / Active Tool Medallion (Hold to Spray!) */}
          <button
            type="button"
            data-tutorial-target="attack"
            data-no-click-sfx="true"
            onPointerDown={(e) => {
              e.preventDefault();
              firePointerId.current = e.pointerId;
              try {
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              } catch {
                // ignore
              }
              onSetFireHeld(true);
              completeTutorialStep('attack');
            }}
            onPointerUp={(e) => {
              if (firePointerId.current === null || firePointerId.current === e.pointerId) {
                firePointerId.current = null;
                onSetFireHeld(false);
              }
            }}
            onPointerCancel={(e) => {
              if (firePointerId.current === null || firePointerId.current === e.pointerId) {
                firePointerId.current = null;
                onSetFireHeld(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onFireWeapon();
                completeTutorialStep('attack');
              }
            }}
            title="Tahan / Tekan untuk Menembak ke Crosshair (Spasi / Klik Kiri)"
            aria-label="Tembak"
            className="pointer-events-auto absolute bottom-0 right-0 flex h-[78px] w-[78px] touch-none select-none items-center justify-center rounded-full shadow-[0_6px_16px_rgba(34,211,238,0.48)] transition-transform hover:scale-105 active:scale-90 sm:h-[90px] sm:w-[90px]"
          >
            <img
              src="./assets/ui/btn_attack.png"
              alt="Tembak"
              className="pointer-events-none h-full w-full select-none object-contain"
              draggable={false}
            />
            {!isWeaponHotbarSlot(hud.activeHotbarSlot) && (
              <span className="pointer-events-none absolute flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/60 bg-slate-950/88 p-1 shadow-inner sm:h-12 sm:w-12">
                <img
                  src={activeItemIconSrc}
                  alt="Alat Aktif"
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </span>
            )}
            {activeSlotBadgeText !== null && (
              <span className="pointer-events-none absolute -bottom-0.5 rounded-full border border-cyan-300/60 bg-slate-950/90 px-1.5 font-mono-nums text-[10px] font-black leading-tight text-amber-300 shadow">
                {activeSlotBadgeText}
              </span>
            )}
          </button>
        </div>
      )}

      {/* FULL DRIVING HUD (Joystick steers & moves left side; right thumb holds Gas/Brake/Turbo/Horn/Lights/Exit medallions!) */}
      {inCar && hud.carState && (() => {
        const cs = hud.carState;
        const bindHold = (ctrl: 'gas' | 'brake' | 'boost') => ({
          onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
            e.preventDefault();
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              // ignore
            }
            onCarControl?.(ctrl, true);
          },
          onPointerUp: () => onCarControl?.(ctrl, false),
          onPointerCancel: () => onCarControl?.(ctrl, false),
          onPointerLeave: () => onCarControl?.(ctrl, false),
        });

        return (
          <>
            {/* Bottom-Center Speedometer & Gear Dashboard (shifted cleanly above pedals on narrow portrait screens) */}
            <div className="pointer-events-none fixed bottom-[154px] left-1/2 z-20 -translate-x-1/2 sm:bottom-5">
              {carMode === 'entering' || carMode === 'exiting' ? (
                <div className="flex items-center gap-2.5 rounded-2xl border border-sky-300/65 bg-slate-950/92 px-3.5 py-2 text-xs font-black text-sky-100 shadow-2xl">
                  <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-sky-300/70 bg-slate-900">
                    <img
                      src={
                        carMode === 'entering'
                          ? './assets/aistudio/btn_car_enter_7623e10e.jpeg'
                          : './assets/aistudio/btn_car_exit_18ede182.jpeg'
                      }
                      alt=""
                      className="h-full w-full scale-[1.2] object-cover"
                      draggable={false}
                    />
                  </span>
                  <span>
                    {carMode === 'entering'
                      ? 'Membuka pintu & masuk ke kursi pengemudi...'
                      : 'Menghentikan mobil & membuka pintu keluar...'}
                  </span>
                </div>
              ) : (
                <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-sky-300/50 bg-slate-950/92 px-3.5 py-2 text-white shadow-2xl">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border font-mono-nums text-base font-black ${
                      cs.gear === 'R'
                        ? 'border-rose-400 bg-rose-600/35 text-rose-200'
                        : cs.gear === 'D'
                        ? 'border-emerald-400 bg-emerald-600/35 text-emerald-200'
                        : 'border-slate-500 bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    {cs.gear}
                  </div>
                  <div className="flex flex-col leading-none">
                    <div className="flex items-baseline gap-1 font-mono-nums">
                      <span className="text-xl font-black text-sky-200 sm:text-2xl">
                        {cs.speedKmh}
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400">KM/H</span>
                      {cs.carName && (
                        <span className="ml-1.5 max-w-[115px] truncate rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-sky-200">
                          {cs.carName}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[9px] font-black">
                      <button
                        type="button"
                        onClick={() => onToggleCarHandbrake?.()}
                        title="Aktif / Lepas Rem Parkir (Spasi / P)"
                        className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 transition active:scale-95 ${
                          cs.handbrakeOn
                            ? 'bg-rose-600/85 text-white ring-1 ring-rose-300/80'
                            : 'bg-white/10 text-slate-300 hover:bg-white/15'
                        }`}
                      >
                        <ParkingCircle className="h-2.5 w-2.5" />
                        <span>{cs.handbrakeOn ? 'REM PARKIR' : 'Joystick / WASD'}</span>
                      </button>
                      {cs.headlightsOn && (
                        <span className="inline-flex items-center gap-0.5 text-amber-300">
                          <Lightbulb className="h-2.5 w-2.5" />
                          <span>LAMPU</span>
                        </span>
                      )}
                      {cs.turboActive && (
                        <span className="inline-flex items-center gap-0.5 text-cyan-300">
                          <Zap className="h-2.5 w-2.5" />
                          <span>TURBO</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom-Right Ergonomic Medallion Cluster: Gas, Brake, Turbo, Horn, Lights, Exit */}
            <div className="pointer-events-none fixed bottom-3 right-3 z-20 h-[156px] w-[212px] sm:bottom-5 sm:right-5 sm:h-[184px] sm:w-[248px]">
              {/* Horn Medallion (Left of Brake) */}
              <button
                type="button"
                data-no-click-sfx="true"
                onClick={() => onCarHorn?.()}
                title="Bunyikan Klakson (H)"
                aria-label="Klakson"
                className="pointer-events-auto absolute bottom-[8px] right-[156px] flex h-[48px] w-[48px] touch-none select-none items-center justify-center rounded-full shadow-[0_5px_14px_rgba(245,158,11,0.52)] ring-2 ring-amber-300/80 transition-transform hover:scale-105 active:scale-90 sm:bottom-[10px] sm:right-[184px] sm:h-[56px] sm:w-[56px]"
              >
                <span className="pointer-events-none h-full w-full overflow-hidden rounded-full bg-slate-950">
                  <img
                    src="./assets/aistudio/btn_car_horn_e2392958.jpeg"
                    alt="Klakson"
                    className="pointer-events-none h-full w-full scale-[1.18] select-none object-cover"
                    draggable={false}
                  />
                </span>
                <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-300/70 bg-slate-950/92 px-1.5 text-[8px] font-black leading-tight text-amber-100 shadow sm:text-[9px]">
                  Klakson
                </span>
              </button>

              {/* Headlights Medallion (Upper-Left of Brake) */}
              <button
                type="button"
                onClick={() => onToggleCarHeadlights?.()}
                title="Nyalakan / Matikan Lampu Depan (L)"
                aria-label="Lampu Depan"
                className={`pointer-events-auto absolute bottom-[68px] right-[140px] flex h-[48px] w-[48px] touch-none select-none items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 sm:bottom-[80px] sm:right-[166px] sm:h-[56px] sm:w-[56px] ${
                  cs.headlightsOn
                    ? 'ring-2 ring-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.85)]'
                    : 'opacity-80 ring-2 ring-slate-400/60 grayscale-[25%] shadow-[0_5px_12px_rgba(15,23,42,0.7)]'
                }`}
              >
                <span className="pointer-events-none h-full w-full overflow-hidden rounded-full bg-slate-950">
                  <img
                    src="./assets/aistudio/btn_car_lights_8d7f17c4.jpeg"
                    alt="Lampu"
                    className="pointer-events-none h-full w-full scale-[1.16] select-none object-cover"
                    draggable={false}
                  />
                </span>
                <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-300/70 bg-slate-950/92 px-1.5 text-[8px] font-black leading-tight text-amber-100 shadow sm:text-[9px]">
                  Lampu
                </span>
              </button>

              {/* Turbo Boost Medallion (Upper-Left Arc above Gas & Brake) */}
              <button
                type="button"
                disabled={!isCarDriving}
                data-no-click-sfx="true"
                {...bindHold('boost')}
                title="Tahan untuk Turbo (Shift)"
                aria-label="Turbo"
                className={`pointer-events-auto absolute bottom-[84px] right-[72px] flex h-[54px] w-[54px] touch-none select-none items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 disabled:opacity-45 sm:bottom-[98px] sm:right-[86px] sm:h-[62px] sm:w-[62px] ${
                  cs.turboActive
                    ? 'scale-110 ring-2 ring-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.95)]'
                    : 'ring-2 ring-cyan-300/80 shadow-[0_5px_15px_rgba(34,211,238,0.55)]'
                }`}
              >
                <span className="pointer-events-none h-full w-full overflow-hidden rounded-full bg-slate-950">
                  <img
                    src="./assets/aistudio/btn_car_turbo_7ad55721.jpeg"
                    alt="Turbo"
                    className="pointer-events-none h-full w-full scale-[1.14] select-none object-cover"
                    draggable={false}
                  />
                </span>
                <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-300/75 bg-slate-950/92 px-1.5 text-[8px] font-black leading-tight text-cyan-100 shadow sm:text-[9px]">
                  TURBO
                </span>
              </button>

              {/* Exit Car Medallion (Directly above Gas) */}
              {onToggleCar && (
                <button
                  type="button"
                  disabled={!isCarDriving}
                  onClick={onToggleCar}
                  title="Berhenti & Keluar Mobil (E)"
                  aria-label="Keluar Mobil"
                  className="pointer-events-auto absolute bottom-[90px] right-[4px] flex h-[52px] w-[52px] touch-none select-none items-center justify-center rounded-full shadow-[0_5px_15px_rgba(249,115,22,0.58)] ring-2 ring-amber-300/85 transition-transform hover:scale-105 active:scale-90 disabled:opacity-45 sm:bottom-[106px] sm:right-[6px] sm:h-[60px] sm:w-[60px]"
                >
                  <span className="pointer-events-none h-full w-full overflow-hidden rounded-full bg-slate-950">
                    <img
                      src="./assets/aistudio/btn_car_exit_18ede182.jpeg"
                      alt="Keluar Mobil"
                      className="pointer-events-none h-full w-full scale-[1.16] select-none object-cover"
                      draggable={false}
                    />
                  </span>
                  <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-300/75 bg-slate-950/92 px-1.5 text-[8px] font-black leading-tight text-amber-100 shadow sm:text-[9px]">
                    Keluar (E)
                  </span>
                </button>
              )}

              {/* Brake / Reverse Medallion (Left of Gas) */}
              <button
                type="button"
                disabled={!isCarDriving}
                data-no-click-sfx="true"
                {...bindHold('brake')}
                title="Tahan untuk Rem / Mundur (S / Panah Bawah)"
                aria-label="Rem dan Mundur"
                className="pointer-events-auto absolute bottom-[4px] right-[86px] flex h-[60px] w-[60px] touch-none select-none items-center justify-center rounded-full shadow-[0_5px_16px_rgba(244,63,94,0.58)] ring-2 ring-rose-400/85 transition-transform hover:scale-105 active:scale-90 disabled:opacity-45 sm:bottom-[6px] sm:right-[102px] sm:h-[70px] sm:w-[70px]"
              >
                <span className="pointer-events-none h-full w-full overflow-hidden rounded-full bg-slate-950">
                  <img
                    src="./assets/aistudio/btn_car_brake_ea27cd8a.jpeg"
                    alt="Rem dan Mundur"
                    className="pointer-events-none h-full w-full scale-[1.1] select-none object-cover"
                    draggable={false}
                  />
                </span>
                <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-rose-300/75 bg-slate-950/92 px-1.5 text-[8px] font-black leading-tight text-rose-100 shadow sm:text-[9px]">
                  REM
                </span>
              </button>

              {/* Gas / Accelerator Primary Thumb Medallion */}
              <button
                type="button"
                disabled={!isCarDriving}
                data-no-click-sfx="true"
                {...bindHold('gas')}
                title="Tahan untuk Gas Maju (W / Panah Atas)"
                aria-label="Gas Maju"
                className="pointer-events-auto absolute bottom-0 right-0 flex h-[76px] w-[76px] touch-none select-none items-center justify-center rounded-full shadow-[0_6px_18px_rgba(16,185,129,0.62)] ring-2 ring-emerald-300/90 transition-transform hover:scale-105 active:scale-90 disabled:opacity-45 sm:h-[90px] sm:w-[90px]"
              >
                <span className="pointer-events-none h-full w-full overflow-hidden rounded-full bg-slate-950">
                  <img
                    src="./assets/aistudio/btn_car_gas_3821c6db.jpeg"
                    alt="Gas Maju"
                    className="pointer-events-none h-full w-full scale-[1.1] select-none object-cover"
                    draggable={false}
                  />
                </span>
                <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-emerald-300/80 bg-slate-950/92 px-2 text-[9px] font-black leading-tight text-emerald-100 shadow sm:text-[10px]">
                  GAS
                </span>
              </button>
            </div>
          </>
        );
      })()}

      {/* URGENT FLIGHT HUD: Telemetry + 4 Aerial Munitions + 5 Core Flight Medallions */}
      {inPlane && hud.planeState && (() => {
        const ps = hud.planeState;
        const bindPlaneHold = (ctrls: Array<'gas' | 'brake' | 'climb' | 'descend' | 'boost'>) => ({
          onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
            e.preventDefault();
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              // ignore
            }
            for (const c of ctrls) onPlaneControl?.(c, true);
          },
          onPointerUp: () => {
            for (const c of ctrls) onPlaneControl?.(c, false);
          },
          onPointerCancel: () => {
            for (const c of ctrls) onPlaneControl?.(c, false);
          },
          onPointerLeave: () => {
            for (const c of ctrls) onPlaneControl?.(c, false);
          },
        });

        const releasePlaneFire = () => {
          onSetPlaneFireHeld?.(false);
        };

        return (
          <>
            {/* Bottom-Center Flight Telemetry & 4-Weapon Ordnance Bar */}
            <div className="pointer-events-none fixed bottom-[162px] left-1/2 z-20 -translate-x-1/2 sm:bottom-5">
              {planeMode === 'entering' || planeMode === 'exiting' ? (
                <div className="flex items-center gap-2.5 rounded-2xl border border-sky-300/65 bg-slate-950/92 px-3.5 py-2 text-xs font-black text-sky-100 shadow-2xl">
                  <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-sky-300/70 bg-slate-900">
                    <img
                      src={
                        planeMode === 'entering'
                          ? './assets/ui/btn_plane_board.png'
                          : './assets/ui/btn_plane_exit.png'
                      }
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </span>
                  <span>
                    {planeMode === 'entering'
                      ? `Membuka kokpit & naik ${ps.planeName || 'Pesawat'}...`
                      : `Menutup mesin & keluar dari ${ps.planeName || 'Pesawat'}...`}
                  </span>
                </div>
              ) : (
                <div className="pointer-events-auto flex flex-col gap-1.5 rounded-2xl border border-sky-300/55 bg-slate-950/92 px-3 py-2 text-white shadow-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-lg border px-2 py-0.5 text-[10px] font-black tracking-wide ${
                          planeMode === 'flying'
                            ? ps.canLand
                              ? 'border-emerald-300/80 bg-emerald-600/35 text-emerald-100'
                              : 'border-sky-300/80 bg-sky-600/35 text-sky-100'
                            : 'border-amber-300/80 bg-amber-600/35 text-amber-100'
                        }`}
                      >
                        {planeMode === 'flying'
                          ? ps.canLand
                            ? 'SIAP MENDARAT'
                            : 'TERBANG'
                          : 'LANDASAN'}
                      </span>
                      <div className="flex items-baseline gap-1 font-mono-nums">
                        <span className="text-lg font-black text-sky-200 sm:text-xl">
                          {ps.speedKmh}
                        </span>
                        <span className="text-[9px] font-extrabold text-slate-400">KM/H</span>
                      </div>
                      <div className="flex items-baseline gap-1 border-l border-slate-700/80 pl-2 font-mono-nums">
                        <span className="text-sm font-black text-cyan-200 sm:text-base">
                          {ps.altitudeMeters}m
                        </span>
                        <span className="text-[9px] font-extrabold text-slate-400">ALT</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] font-black">
                      {ps.lockedTargetName && (
                        <span className="max-w-[110px] truncate rounded border border-rose-400/75 bg-rose-600/35 px-1.5 py-0.5 text-rose-100">
                          🎯 {ps.lockedTargetName}
                        </span>
                      )}
                      {ps.nearestAirbaseName && (
                        <span className="hidden max-w-[130px] truncate rounded bg-sky-500/20 px-1.5 py-0.5 text-sky-200 sm:inline-block">
                          {ps.nearestAirbaseName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4 Adjusted Aerial Munitions Selector (Keys 1-4) */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {PLANE_AMMO_OPTIONS.map((opt) => {
                      const active = ps.activeAmmo === opt.id;
                      const count = ps.ammoCounts[opt.id] ?? 0;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onSelectPlaneAmmo?.(opt.id)}
                          title={`${opt.label} [Tombol ${opt.key}]`}
                          className={`flex items-center gap-1 rounded-xl border px-1.5 py-1 text-left transition active:scale-95 ${
                            active
                              ? opt.activeBorder
                              : 'border-slate-700/80 bg-slate-900/85 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <img
                            src={opt.img}
                            alt={opt.shortLabel}
                            className="h-6 w-6 shrink-0 rounded-md object-cover sm:h-7 sm:w-7"
                            draggable={false}
                          />
                          <div className="min-w-0 leading-tight">
                            <div className="truncate text-[9px] font-black">{opt.shortLabel}</div>
                            <div className="font-mono-nums text-[9px] font-extrabold text-amber-200">
                              {count}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom-Right 5 Urgent Flight Controls: Fire, Takeoff/Climb, Brake/Land, Turbo, Exit */}
            <div className="pointer-events-none fixed bottom-3 right-3 z-20 h-[156px] w-[212px] sm:bottom-5 sm:right-5 sm:h-[184px] sm:w-[248px]">
              {/* Brake / Descend to Land Medallion (Left of Fire) */}
              <button
                type="button"
                disabled={!isPlanePiloting}
                data-no-click-sfx="true"
                {...bindPlaneHold(planeMode === 'flying' ? ['brake', 'descend'] : ['brake'])}
                title={
                  planeMode === 'flying'
                    ? 'Tahan untuk Turun & Mendarat di Pulau (Ctrl / S)'
                    : 'Tahan untuk Rem di Landasan (S)'
                }
                aria-label={planeMode === 'flying' ? 'Turun dan Mendarat' : 'Rem Pesawat'}
                className="pointer-events-auto absolute bottom-[6px] right-[90px] flex h-[58px] w-[58px] touch-none select-none items-center justify-center rounded-full shadow-[0_5px_16px_rgba(244,63,94,0.58)] ring-2 ring-rose-400/85 transition-transform hover:scale-105 active:scale-90 disabled:opacity-45 sm:bottom-[8px] sm:right-[106px] sm:h-[68px] sm:w-[68px]"
              >
                <span className="pointer-events-none h-full w-full overflow-hidden rounded-full bg-slate-950">
                  <img
                    src="./assets/ui/btn_plane_brake.png"
                    alt="Rem / Turun"
                    className="pointer-events-none h-full w-full select-none object-cover"
                    draggable={false}
                  />
                </span>
                <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-rose-300/80 bg-slate-950/92 px-1.5 text-[8px] font-black leading-tight text-rose-100 shadow sm:text-[9px]">
                  {planeMode === 'flying' ? 'Mendarat' : 'Rem'}
                </span>
              </button>

              {/* Takeoff / Climb Medallion (Upper-Left of Fire) */}
              <button
                type="button"
                disabled={!isPlanePiloting}
                data-no-click-sfx="true"
                {...bindPlaneHold(['climb', 'gas'])}
                title={
                  planeMode === 'taxi'
                    ? 'Tahan untuk Akselerasi & Lepas Landas (Spasi)'
                    : 'Tahan untuk Terbang Naik (Spasi)'
                }
                aria-label={planeMode === 'taxi' ? 'Lepas Landas' : 'Terbang Naik'}
                className="pointer-events-auto absolute bottom-[74px] right-[88px] flex h-[56px] w-[56px] touch-none select-none items-center justify-center rounded-full shadow-[0_5px_16px_rgba(16,185,129,0.62)] ring-2 ring-emerald-300/85 transition-transform hover:scale-105 active:scale-90 disabled:opacity-45 sm:bottom-[88px] sm:right-[104px] sm:h-[64px] sm:w-[64px]"
              >
                <span className="pointer-events-none h-full w-full overflow-hidden rounded-full bg-slate-950">
                  <img
                    src="./assets/ui/btn_plane_takeoff.png"
                    alt="Lepas Landas"
                    className="pointer-events-none h-full w-full select-none object-cover"
                    draggable={false}
                  />
                </span>
                <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-emerald-300/80 bg-slate-950/92 px-1.5 text-[8px] font-black leading-tight text-emerald-100 shadow sm:text-[9px]">
                  {planeMode === 'taxi' ? 'Lepas Landas' : 'Naik'}
                </span>
              </button>

              {/* Turbo Boost Medallion (Upper-Left Arc) */}
              <button
                type="button"
                disabled={!isPlanePiloting}
                data-no-click-sfx="true"
                {...bindPlaneHold(['boost'])}
                title="Tahan untuk Turbo Akselerasi (Shift)"
                aria-label="Turbo Pesawat"
                className={`pointer-events-auto absolute bottom-[100px] right-[150px] flex h-[48px] w-[48px] touch-none select-none items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 disabled:opacity-45 sm:bottom-[118px] sm:right-[176px] sm:h-[56px] sm:w-[56px] ${
                  ps.turboActive
                    ? 'scale-110 ring-2 ring-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.95)]'
                    : 'ring-2 ring-amber-300/85 shadow-[0_5px_14px_rgba(245,158,11,0.55)]'
                }`}
              >
                <span className="pointer-events-none h-full w-full overflow-hidden rounded-full bg-slate-950">
                  <img
                    src="./assets/ui/btn_plane_turbo.png"
                    alt="Turbo"
                    className="pointer-events-none h-full w-full select-none object-cover"
                    draggable={false}
                  />
                </span>
                <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-300/80 bg-slate-950/92 px-1.5 text-[8px] font-black leading-tight text-amber-100 shadow sm:text-[9px]">
                  Turbo
                </span>
              </button>

              {/* Exit Plane Medallion (Directly above Fire) */}
              {onTogglePlane && (
                <button
                  type="button"
                  disabled={!isPlanePiloting}
                  onClick={onTogglePlane}
                  title="Turun / Keluar Pesawat (E)"
                  aria-label="Turun Pesawat"
                  className="pointer-events-auto absolute bottom-[92px] right-[4px] flex h-[52px] w-[52px] touch-none select-none items-center justify-center rounded-full shadow-[0_5px_15px_rgba(249,115,22,0.58)] ring-2 ring-orange-300/85 transition-transform hover:scale-105 active:scale-90 disabled:opacity-45 sm:bottom-[108px] sm:right-[6px] sm:h-[60px] sm:w-[60px]"
                >
                  <span className="pointer-events-none h-full w-full overflow-hidden rounded-full bg-slate-950">
                    <img
                      src="./assets/ui/btn_plane_exit.png"
                      alt="Turun Pesawat"
                      className="pointer-events-none h-full w-full select-none object-cover"
                      draggable={false}
                    />
                  </span>
                  <span className="pointer-events-none absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-orange-300/80 bg-slate-950/92 px-1.5 text-[8px] font-black leading-tight text-orange-100 shadow sm:text-[9px]">
                    Keluar (E)
                  </span>
                </button>
              )}

              {/* Primary Fire Aerial Weapon Medallion (Thumb Anchor) */}
              <button
                type="button"
                disabled={!isPlanePiloting}
                data-no-click-sfx="true"
                onPointerDown={(e) => {
                  e.preventDefault();
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {
                    // ignore
                  }
                  onSetPlaneFireHeld?.(true);
                }}
                onPointerUp={releasePlaneFire}
                onPointerCancel={releasePlaneFire}
                onPointerLeave={releasePlaneFire}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onFirePlaneWeapon?.();
                  }
                }}
                title="Tahan untuk Menembak Sasaran Udara / Darat (F / Klik Kiri)"
                aria-label="Tembak Sasaran"
                className="pointer-events-auto absolute bottom-0 right-0 flex h-[78px] w-[78px] touch-none select-none items-center justify-center rounded-full shadow-[0_6px_20px_rgba(249,115,22,0.65)] ring-2 ring-amber-300/90 transition-transform hover:scale-105 active:scale-90 disabled:opacity-45 sm:h-[90px] sm:w-[90px]"
              >
                <span className="pointer-events-none h-full w-full overflow-hidden rounded-full bg-slate-950">
                  <img
                    src="./assets/ui/btn_plane_fire.png"
                    alt="Tembak Sasaran"
                    className="pointer-events-none h-full w-full select-none object-cover"
                    draggable={false}
                  />
                </span>
                <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-300/80 bg-slate-950/92 px-2 text-[9px] font-black leading-tight text-amber-100 shadow sm:text-[10px]">
                  TEMBAK
                </span>
              </button>
            </div>
          </>
        );
      })()}

      {/* VOICE COMMAND BUTTON CLUSTER (Bottom-left below floating joystick zone so it never overlaps tracker or combat buttons) */}
      {onToggleVoice && (
        <div className="pointer-events-auto fixed bottom-2.5 left-2.5 z-20 flex items-center gap-2 sm:bottom-3.5 sm:left-4">
          <button
            type="button"
            data-tutorial-target="voice_toggle"
            data-no-click-sfx="true"
            onClick={(e) => {
              (e.currentTarget as HTMLButtonElement).blur();
              if (isTutorialTarget('voice_toggle')) {
                completeTutorialStep('voice_toggle');
                return;
              }
              onToggleVoice();
            }}
            title={
              !voiceSupported
                ? 'Perintah suara tidak didukung browser ini'
                : voiceListening
                ? 'Matikan Perintah Suara (Mic Aktif)'
                : 'Aktifkan Kontrol Suara (Ucapkan perintah Bahasa Indonesia)'
            }
            aria-label={voiceListening ? 'Matikan Kontrol Suara' : 'Aktifkan Kontrol Suara'}
            aria-pressed={voiceListening}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 sm:h-11 sm:w-11 ${
              voiceListening
                ? 'ring-2 ring-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.85)]'
                : 'opacity-90 shadow-[0_3px_10px_rgba(34,211,238,0.35)]'
            }`}
          >
            {voiceListening && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-emerald-400/35"
              />
            )}
            <ResilientMedallionImg
              src="./assets/aistudio/Gemini_Generated_Image_9841t9841t9841t9_2a41b1ca.jpeg"
              className={`scale-[1.14] object-cover ${voiceListening ? '' : 'opacity-85 saturate-75'}`}
              fallback={
                voiceListening ? (
                  <Mic className="h-4 w-4 text-emerald-300 sm:h-5 sm:w-5" />
                ) : (
                  <MicOff className="h-4 w-4 text-cyan-300 sm:h-5 sm:w-5" />
                )
              }
            />
            {voiceListening && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400 shadow"
              />
            )}
          </button>

          <button
            type="button"
            data-tutorial-target="voice_help"
            onClick={() => {
              if (isTutorialTarget('voice_help')) {
                completeTutorialStep('voice_help');
                return;
              }
              setVoiceHelpOpen((v) => !v);
            }}
            title={`Daftar ${VOICE_COMMAND_CATALOG.length}+ Perintah Suara`}
            aria-label="Daftar Perintah Suara"
            aria-pressed={voiceHelpOpen}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-90 sm:h-10 sm:w-10 ${
              voiceHelpOpen
                ? 'scale-105 ring-2 ring-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.7)]'
                : 'opacity-90 shadow-[0_3px_8px_rgba(34,211,238,0.32)]'
            }`}
          >
            <ResilientMedallionImg
              src="./assets/aistudio/Gemini_Generated_Image_h625wih625wih625_e6bd6711.jpeg"
              className="scale-[1.14] object-cover"
              fallback={<HelpCircle className="h-4 w-4 text-cyan-300" />}
            />
          </button>
        </div>
      )}

      {/* LIVE VOICE TRANSCRIPT / FEEDBACK PILL */}
      {(voiceListening || voiceLastAction || voiceTranscript) && (
        <div className="pointer-events-none fixed left-1/2 top-9 z-20 -translate-x-1/2 sm:top-11">
          <div className="flex max-w-[78vw] items-center gap-1.5 rounded-full border border-emerald-300/45 bg-slate-950/92 px-3 py-0.5 text-[10px] font-bold text-emerald-100 shadow-lg sm:text-[11px]">
            <Mic className={`h-3 w-3 shrink-0 ${voiceListening ? 'animate-pulse text-emerald-300' : 'text-cyan-300'}`} />
            <span className="truncate">
              {voiceTranscript
                ? `"${voiceTranscript}"`
                : voiceLastAction || 'Ucapkan perintah... (mis. "eh coba ke kiri", "tembak monster itu")'}
            </span>
          </div>
        </div>
      )}

      {/* PANEL DAFTAR 100+ PERINTAH SUARA (Ultra-transparan & non-blocking agar pemain tetap terlihat dan bisa digerakkan) */}
      {voiceHelpOpen && (
        <div
          style={{ top: `${voiceModalVp.offsetTop}px`, height: `${voiceModalVp.height}px` }}
          className="pointer-events-none fixed left-0 right-0 z-30 flex items-center justify-center p-2 sm:p-4"
        >
          <div className="pointer-events-auto flex max-h-[64dvh] w-full max-w-[min(32rem,calc(100vw-88px))] flex-col overflow-hidden rounded-2xl border border-cyan-300/35 bg-slate-950/22 p-2.5 text-slate-100 shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-[1.5px] sm:max-h-[70dvh] sm:max-w-lg sm:p-3.5">
            <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-1.5">
              <div className="[text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                <h3 className="text-xs font-black text-cyan-200 sm:text-sm">
                  Daftar {VOICE_COMMAND_CATALOG.length}+ Perintah Suara
                </h3>
                {!voiceModalVp.isKeyboardOpen && (
                  <p className="text-[10px] font-semibold text-slate-100/90 sm:text-[11px]">
                    Ketuk tombol <strong>Suara</strong> lalu ucapkan perintah di bawah sambil tetap bergerak.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setVoiceHelpOpen(false)}
                aria-label="Tutup Daftar Perintah Suara"
                className="rounded-lg border border-white/20 bg-slate-950/35 p-1.5 text-slate-100 hover:bg-slate-900/55"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-2 shrink-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cyan-200/80" />
              <input
                type="text"
                value={voiceSearch}
                onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                onChange={(e) => setVoiceSearch(e.target.value)}
                placeholder="Cari perintah (mis. kiri, tembak, belakang, obor, portal)..."
                className="w-full rounded-xl border border-white/20 bg-slate-950/32 py-1.5 pl-8 pr-3 text-xs font-semibold text-white placeholder-slate-200/75 [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] focus:border-cyan-300/80 focus:bg-slate-950/48 focus:outline-none sm:py-2"
              />
            </div>

            <div className="mt-2 min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain touch-pan-y pr-1">
              {(
                [
                  'Gerak & Navigasi',
                  'Kamera & Pandangan',
                  'Menuju Target',
                  'Pertempuran & Senjata',
                  'Gua & Alat',
                  'Interaksi & Menu',
                ] as VoiceCommandCategory[]
              ).map((category) => {
                const q = voiceSearch.trim().toLowerCase();
                const items = VOICE_COMMAND_CATALOG.filter((entry) => {
                  if (entry.category !== category) return false;
                  if (!q) return true;
                  return (
                    entry.phrase.toLowerCase().includes(q) ||
                    entry.description.toLowerCase().includes(q) ||
                    (entry.aliases || []).some((a) => a.toLowerCase().includes(q))
                  );
                });
                if (items.length === 0) return null;
                return (
                  <div key={category} className="rounded-xl border border-white/15 bg-slate-950/15 p-2">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-extrabold text-amber-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                      <span>{category}</span>
                      <span className="font-mono-nums text-[10px] text-slate-100/90">{items.length} perintah</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-white/15 bg-slate-950/24 px-2.5 py-1.5 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]"
                        >
                          <div className="text-[11px] font-extrabold text-cyan-200">
                            &ldquo;{item.phrase}&rdquo;
                          </div>
                          <div className="text-[10px] font-medium text-slate-100/90">{item.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE SPOTLIGHT COACH-MARK TUTORIAL */}
      <HudTutorialOverlay
        active={tutorialActive}
        step={activeTutorialStep}
        stepIndex={tutorialStepIdx}
        totalSteps={tutorialSteps.length}
        justCompletedStep={tutorialJustDone}
        onSkip={handleSkipTutorial}
      />
    </div>
  );
};
