import React, { useMemo, useState } from 'react';
import {
  Backpack,
  Bookmark,
  BookOpen,
  CheckCircle2,
  Crosshair,
  Crown,
  HelpCircle,
  Lock,
  LogOut,
  RefreshCw,
  ScrollText,
  Search,
  Settings,
  User as UserIcon,
  Volume2,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { soundEngine } from '../audio/soundEngine';
import { formatBytesMb, getLocalOfflineState } from '../services/offlineSyncService';
import { DIVING_GEAR_DEFS } from '../three/oceanWorld';
import {
  AMMO_COST,
  DIFF_CONFIG,
  MAX_AMMO,
  RELICS,
  RELIC_ORDER,
  RIBBONS,
  WEAPONS,
  WEAPON_ORDER,
  ZONE_DOORS,
  ZONE_INFO,
  ZONE_ORDER,
} from '../data/diglosaCatalog';
import { CATEGORIES, getWordStatus, VOCAB_CATALOG } from '../data/vocabCatalog';
import {
  AimMode,
  DifficultyMode,
  FxLevel,
  GameSettings,
  LearningModeType,
  LiveMapSnapshot,
  RadarBlipKind,
  RpgHudSnapshot,
  WeaponId,
  ZoneId,
} from '../types/game';

import { GuideTabContent } from './GuideTabContent';
import { PWAInstallButton } from './PwaControls';
import { Kingdom3DMap, SpotLegendIcon } from './RadarMinimap';
import { IELTS_TEMPORARILY_LOCKED } from '../three/archipelagoWorld';
import { RpgAvatarFrame, RpgBoardPanel, RpgNameplate, RpgPillButton } from './RpgUiKit';
import { WeaponPreviewCanvas } from './WeaponPreviewCanvas';
import { scrollFieldIntoView, useVisualViewport } from '../utils/useVisualViewport';

export type SideModalTab = 'bag' | 'kamus' | 'quests' | 'map' | 'options' | 'guide' | null;

interface RpgSideModalsProps {
  tab: SideModalTab;
  hud: RpgHudSnapshot;
  playerName?: string;
  getLiveMapSnapshot?: (kind: 'minimap' | 'full') => LiveMapSnapshot | null;
  onClose: () => void;
  onOpenGuide?: () => void;
  onEquipWeapon: (id: WeaponId) => void;
  onStartAmmoQuiz: () => void;
  onStartQuickLearn: (mode: LearningModeType, catId?: number, zoneId?: ZoneId) => void;
  onTeleportZone: (zoneId: ZoneId) => void;
  onEnterDungeon: (zoneId: ZoneId) => void;
  onEnterIelts: () => void;
  onExitDungeon?: () => void;
  onWalkToSwimSuit?: () => void;
  onDiveOcean?: () => void;
  onUpdateSettings: (partial: Partial<GameSettings>) => void;
  onOpenOfflineSync?: () => void;
  onOpenProfile?: () => void;
  user?: User | null;
  onSignOut?: () => Promise<void>;
}

export const RpgSideModals: React.FC<RpgSideModalsProps> = ({
  tab,
  hud,
  playerName,
  getLiveMapSnapshot,
  onClose,
  onOpenGuide,
  onEquipWeapon,
  onStartAmmoQuiz,
  onStartQuickLearn,
  onTeleportZone,
  onEnterDungeon,
  onEnterIelts,
  onExitDungeon,
  onWalkToSwimSuit,
  onDiveOcean,
  onUpdateSettings,
  onOpenOfflineSync,
  onOpenProfile,
  user,
  onSignOut,
}) => {
  const resolvedPlayerName = playerName?.trim() || 'Petualang';
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'learn' | 'mast'>('all');
  const [selectedCat, setSelectedCat] = useState<number | 'all'>('all');
  const [showRpgHelp, setShowRpgHelp] = useState(false);
  const [previewWeapon, setPreviewWeapon] = useState<WeaponId | null>(null);
  const vp = useVisualViewport(Boolean(tab));

  const filteredWords = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return VOCAB_CATALOG.filter((v) => {
      if (selectedCat !== 'all' && v.catId !== selectedCat) return false;
      const st = getWordStatus(hud.wordProgress[v.id]);
      if (statusFilter !== 'all' && st !== statusFilter) return false;
      if (q) {
        return (
          v.word.toLowerCase().includes(q) ||
          v.meaningId.toLowerCase().includes(q)
        );
      }
      return true;
    }).slice(0, 80);
  }, [searchText, statusFilter, selectedCat, hud.wordProgress]);

  if (!tab) return null;

  const activeWeaponDef = WEAPONS[hud.activeWeapon];
  const activeAmmo = hud.weaponAmmo[hud.activeWeapon] || 0;
  const portalLocked =
    IELTS_TEMPORARILY_LOCKED || (hud.settings.storyLocked && hud.crowns < 6);

  if (tab === 'map') {
    const mapHeading =
      hud.worldMode === 'dungeon' && hud.dungeonState
        ? `Peta Gua ${hud.dungeonState.zoneName}`
        : hud.worldMode === 'academy'
        ? 'Peta Istana IELTS 3D'
        : hud.worldMode === 'ocean'
        ? 'Peta Dunia Bawah Laut 3D'
        : 'Peta Wilayah Kerajaan Kata';
    const mapSubtitle =
      hud.worldMode === 'dungeon' && hud.dungeonState
        ? `Peta 3D Nyata Gua · Pintu ${hud.dungeonState.doorsCleared.length}/5`
        : hud.worldMode === 'academy'
        ? 'Peta 3D Nyata Aula Ujian Kerajaan'
        : hud.worldMode === 'ocean'
        ? 'Taman Karang Dangkal → Terumbu Senja → Palung Abyssal'
        : `Peta 3D Nyata · ${hud.liberatedZones.length}/6 Wilayah Bebas`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain touch-pan-y bg-[#060b16]/75 p-2 sm:p-4">
        <div className="my-auto flex max-h-[94dvh] w-full max-w-3xl flex-col">
          <RpgBoardPanel className="flex max-h-[94dvh] flex-col" bodyClassName="flex min-h-0 flex-1 flex-col">
            {/* Carved Wood + Parchment Nameplate Header matching Story & Challenge panels */}
            <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
              <div className="flex min-w-0 max-w-full items-center gap-2">
                <RpgAvatarFrame accentColor="#0f172a">
                  <img
                    src="./assets/ui/icon_map.png"
                    alt="Peta 3D"
                    className="h-7 w-7 object-contain drop-shadow"
                    draggable={false}
                  />
                </RpgAvatarFrame>

                <RpgNameplate className="min-w-0">
                  <div className="min-w-0 leading-tight">
                    <h2 className="truncate text-sm font-black tracking-tight text-[#3b1b06] sm:text-base">
                      {mapHeading}
                    </h2>
                    <p className="truncate text-[10px] font-extrabold text-[#78350f] sm:text-[11px]">
                      {mapSubtitle}
                    </p>
                  </div>
                </RpgNameplate>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup Peta"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:scale-105 active:scale-95"
              >
                <img
                  src="./assets/ui/btn_exit.png"
                  alt="Tutup"
                  className="h-full w-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                  draggable={false}
                />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain touch-pan-y pr-0.5">
              <Kingdom3DMap
                radar={hud.radarState}
                liberatedZones={hud.liberatedZones}
                starterPicked={hud.starterWeaponPicked}
                swimSuitPicked={hud.swimSuitPicked}
                dungeonName={hud.dungeonState?.zoneName}
                getLiveMapSnapshot={getLiveMapSnapshot}
                onSelectZone={(zId) => {
                  onClose();
                  onTeleportZone(zId);
                }}
                onSelectPortal={() => {
                  onClose();
                  onEnterIelts();
                }}
                onSelectSwimSuit={() => {
                  onClose();
                  onWalkToSwimSuit?.();
                }}
              />

              {hud.worldMode === 'dungeon' && hud.dungeonState && (
                <div className="space-y-2.5 rounded-2xl border border-amber-300/30 bg-slate-950/60 p-3.5 shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <div>
                      <div className="text-xs font-black text-amber-200 sm:text-sm">
                        Misi Gua {hud.dungeonState.zoneName}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-300">
                        Penjaga {hud.dungeonState.guardianName} · Tawanan {hud.dungeonState.captiveName}
                      </div>
                    </div>
                    <span className="font-mono-nums text-xs font-black text-cyan-300">
                      Pintu {hud.dungeonState.doorsCleared.length}/5 · Monster {hud.dungeonState.monstersRemaining}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(ZONE_DOORS[hud.dungeonState.zoneId] || []).map((d) => {
                      const done = hud.dungeonState!.doorsCleared.includes(d.index);
                      return (
                        <div
                          key={d.id}
                          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-bold ${
                            done
                              ? 'border-emerald-400/50 bg-emerald-950/50 text-emerald-200'
                              : 'border-amber-300/25 bg-slate-900/75 text-amber-100'
                          }`}
                        >
                          <span className="truncate">
                            {done ? '✓' : '○'} {d.name}
                          </span>
                          <span className="ml-2 shrink-0 text-[10px] font-extrabold text-slate-300">
                            {d.modeLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {onExitDungeon && (
                    <RpgPillButton
                      variant="cream"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onExitDungeon();
                      }}
                      className="w-full"
                    >
                      <span>Keluar dari Gua ke Hutan Kata</span>
                    </RpgPillButton>
                  )}
                </div>
              )}

              {hud.worldMode === 'academy' && (
                <div className="space-y-2.5 rounded-2xl border border-purple-300/35 bg-slate-950/60 p-3.5 shadow-inner">
                  <div className="text-xs font-black text-purple-200 sm:text-sm">
                    Skor Ujian Istana IELTS 3D
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(
                      [
                        ['Listening', hud.ieltsScores.listening],
                        ['Reading', hud.ieltsScores.reading],
                        ['Writing', hud.ieltsScores.writing],
                        ['Speaking', hud.ieltsScores.speaking],
                      ] as Array<[string, number]>
                    ).map(([label, val]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-purple-300/25 bg-slate-900/80 px-3 py-2 text-center"
                      >
                        <div className="text-[11px] font-bold text-purple-200">{label}</div>
                        <div className="font-mono-nums text-sm font-black text-amber-200">
                          {val}%
                        </div>
                      </div>
                    ))}
                  </div>
                  {onExitDungeon && (
                    <RpgPillButton
                      variant="cream"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onExitDungeon();
                      }}
                      className="w-full"
                    >
                      <span>Keluar ke Kerajaan Kata</span>
                    </RpgPillButton>
                  )}
                </div>
              )}

              {hud.oceanSurvival && (
                <div className="space-y-2.5 rounded-2xl border border-cyan-400/35 bg-slate-950/85 p-3.5 shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <div>
                      <div className="text-xs font-black text-cyan-200 sm:text-sm">
                        Zona Saat Ini {hud.oceanSurvival.zoneLabel}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-300">
                        Kedalaman -{hud.oceanSurvival.depthMeters}m ·{' '}
                        {hud.oceanSurvival.unlimitedOxygen
                          ? 'O₂ Tak Terbatas (∞ · Pakaian Renang)'
                          : `O₂ ${Math.round(hud.oceanSurvival.oxygen)}/${hud.oceanSurvival.maxOxygen}`}
                      </div>
                    </div>
                    <span className="font-mono-nums text-xs font-black text-emerald-300">
                      Biota {hud.oceanSurvival.discoveredBiota.length}/20 ·{' '}
                      {hud.areaMonsterStats.context === 'ocean' ? 'Monster Palung' : 'Monster Wilayah'}{' '}
                      {hud.areaMonsterStats.defeated}/{hud.areaMonsterStats.total}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-200">
                    <span className="text-cyan-300">Perlengkapan Selam</span>
                    {hud.oceanSurvival.unlimitedOxygen && hud.oceanSurvival.ownedGear.length === 0 ? (
                      <span className="rounded-lg border border-emerald-400/40 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-extrabold text-emerald-200">
                        ✓ Pakaian Renang Aktif (O₂ Tak Terbatas)
                      </span>
                    ) : hud.oceanSurvival.ownedGear.length === 0 ? (
                      <span className="text-amber-300">
                        Belum ada (Cepat kehabisan O₂ saat menyelam dalam!)
                      </span>
                    ) : (
                      hud.oceanSurvival.ownedGear.map((gId) => (
                        <span
                          key={gId}
                          className="rounded-lg border border-cyan-400/40 bg-cyan-950/60 px-2 py-0.5 text-[10px] font-extrabold text-cyan-200"
                        >
                          ✓ {DIVING_GEAR_DEFS[gId].name}
                        </span>
                      ))
                    )}
                  </div>

                  {(onDiveOcean || onExitDungeon) && (
                    <RpgPillButton
                      variant="cream"
                      size="sm"
                      onClick={() => {
                        onClose();
                        if (hud.worldMode === 'ocean') {
                          onExitDungeon?.();
                        } else {
                          (onDiveOcean ?? onExitDungeon)?.();
                        }
                      }}
                      className="w-full"
                    >
                      <span>Naik ke Permukaan (Keluar Bawah Laut)</span>
                    </RpgPillButton>
                  )}
                </div>
              )}

              {hud.worldMode === 'overworld' && (
                <>
                  {/* Info Pakaian Renang & Lokasi Menyelam */}
                  <div className="grid grid-cols-1 gap-2 rounded-2xl border border-cyan-400/35 bg-slate-950/85 p-2.5 shadow-inner sm:grid-cols-2 sm:p-3">
                    <div className="flex items-center justify-between gap-2.5 rounded-xl border border-cyan-300/25 bg-slate-900/75 px-2.5 py-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-amber-300/70 bg-slate-950 shadow">
                          <img
                            src="./assets/aistudio/Gemini_Generated_Image_o4clnqo4clnqo4cl_c0838042.jpeg"
                            alt="Pakaian Renang"
                            className="h-full w-full scale-[1.42] object-cover"
                            draggable={false}
                          />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-black text-cyan-200">
                            Pakaian Renang
                          </div>
                          <div className="truncate text-[10px] font-bold text-slate-300">
                            {hud.swimSuitPicked
                              ? 'Sudah terpasang · Siap menyelam'
                              : hud.swimSuitGuide
                              ? `${hud.swimSuitGuide.distance}m (${hud.swimSuitGuide.directionLabel}) · Jalur Desa`
                              : 'Dekat jalur dermaga Desa Sapaan'}
                          </div>
                        </div>
                      </div>
                      {!hud.swimSuitPicked && onWalkToSwimSuit ? (
                        <RpgPillButton
                          variant="gold"
                          size="sm"
                          onClick={() => {
                            onClose();
                            onWalkToSwimSuit();
                          }}
                          className="shrink-0 whitespace-nowrap"
                        >
                          <span>Pergi Ambil</span>
                        </RpgPillButton>
                      ) : (
                        <span className="shrink-0 rounded-full border border-emerald-400/50 bg-emerald-950/70 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                          ✓ Aktif
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2.5 rounded-xl border border-cyan-300/25 bg-slate-900/75 px-2.5 py-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-300/70 bg-slate-950 shadow">
                          <img
                            src="./assets/aistudio/Gemini_Generated_Image_q4s0n7q4s0n7q4s0_03737224.jpeg"
                            alt="Akses Dunia Laut"
                            className="h-full w-full scale-[1.14] object-cover"
                            draggable={false}
                          />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-black text-amber-200">
                            Akses Laut & Menyelam
                          </div>
                          <div className="truncate text-[10px] font-bold text-slate-300">
                            {hud.swimSuitPicked
                              ? 'Tekan tombol Menyelam di sebelah Loncat'
                              : 'Ambil pakaian renang dulu di dekat Desa'}
                          </div>
                        </div>
                      </div>
                      {onDiveOcean && (
                        <RpgPillButton
                          variant="green"
                          size="sm"
                          onClick={() => {
                            onClose();
                            onDiveOcean();
                          }}
                          className="shrink-0 whitespace-nowrap"
                        >
                          <span>
                            {hud.oceanSurvival
                              ? 'Naik Permukaan'
                              : hud.swimSuitPicked
                              ? 'Menyelam'
                              : 'Cari Baju'}
                          </span>
                        </RpgPillButton>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {ZONE_ORDER.map((zId) => {
                      const info = ZONE_INFO[zId];
                      const isHere = hud.activeZoneId === zId;
                      const isLib = hud.liberatedZones.includes(zId);
                      const isRescued = (hud.captiveRescuedZones ?? []).includes(zId);
                      const doorsDone = (hud.areaDoorsCleared[zId] || []).length;
                      const spotKindMap: Record<ZoneId, RadarBlipKind> = {
                        desa_sapaan: 'spot_desa',
                        pasar_rasa: 'spot_pasar',
                        hutan_satwa: 'spot_satwa',
                        gerbang_kota: 'spot_gerbang',
                        menara_waktu: 'spot_menara',
                        gua_portal: 'spot_gua',
                      };
                      return (
                        <div
                          key={zId}
                          style={{
                            borderStyle: 'solid',
                            borderColor: 'transparent',
                            borderWidth: '8px 10px 8px 10px',
                            borderImageSource: "url('./assets/ui/ui_choice_card.png')",
                            borderImageSlice: '52 52 52 52 fill',
                            borderImageWidth: '8px 10px 8px 10px',
                            borderImageRepeat: 'stretch',
                          }}
                          className={`flex flex-col justify-between rounded-xl px-2 py-1.5 text-slate-100 ${
                            isHere ? 'ring-2 ring-emerald-400/80' : ''
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex min-w-0 items-center gap-2.5 text-sm font-black text-amber-100">
                                <SpotLegendIcon kind={spotKindMap[zId]} className="h-10 w-10 shrink-0" />
                                <span className="truncate">{info.name}</span>
                              </span>
                              <span
                                className={`shrink-0 font-mono-nums text-[11px] font-extrabold ${
                                  isLib
                                    ? 'text-emerald-300'
                                    : isRescued
                                    ? 'text-amber-300'
                                    : 'text-rose-300'
                                }`}
                              >
                                {isLib ? '☀️ Cerah' : isRescued ? 'Tawanan ✓ · Kabut' : `${doorsDone}/5 Pintu`}
                              </span>
                            </div>
                            <p className="mt-1 text-xs font-medium leading-snug text-slate-200/90">
                              {info.conflict}
                            </p>
                          </div>

                          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            <RpgPillButton
                              variant="cream"
                              size="sm"
                              onClick={() => {
                                onClose();
                                onTeleportZone(zId);
                              }}
                              className="flex-1 whitespace-nowrap"
                            >
                              <span>Peta Luar</span>
                            </RpgPillButton>
                            <RpgPillButton
                              variant="green"
                              size="sm"
                              onClick={() => {
                                onClose();
                                onEnterDungeon(zId);
                              }}
                              className="flex-1 whitespace-nowrap"
                            >
                              <span>Masuk Area</span>
                            </RpgPillButton>
                            <RpgPillButton
                              variant="gold"
                              size="sm"
                              onClick={() => {
                                onClose();
                                onStartQuickLearn('cards', undefined, zId);
                              }}
                              className="whitespace-nowrap"
                            >
                              <span>Latih Kata</span>
                            </RpgPillButton>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <RpgPillButton
                    variant="gold"
                    disabled={IELTS_TEMPORARILY_LOCKED}
                    onClick={() => {
                      if (IELTS_TEMPORARILY_LOCKED) return;
                      onClose();
                      onEnterIelts();
                    }}
                    className="w-full"
                  >
                    {portalLocked ? (
                      <Lock className="h-4 w-4 shrink-0" />
                    ) : (
                      <SpotLegendIcon kind="portal" className="h-5 w-5 shrink-0" />
                    )}
                    <span>
                      {IELTS_TEMPORARILY_LOCKED
                        ? 'Istana IELTS Ditutup Sementara (Segera Hadir!)'
                        : `Masuk Istana IELTS 3D ${
                            portalLocked
                              ? `(${hud.crowns}/6 Mahkota atau buka di Opsi)`
                              : '(Terbuka!)'
                          }`}
                    </span>
                  </RpgPillButton>
                </>
              )}
            </div>
          </RpgBoardPanel>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ top: `${vp.offsetTop}px`, height: `${vp.height}px` }}
      className={`fixed left-0 right-0 z-50 flex justify-center overscroll-contain bg-transparent px-2 ${
        vp.isKeyboardOpen
          ? 'items-center py-1.5'
          : 'items-start pt-7 sm:pt-9 lg:items-center lg:pt-0'
      }`}
    >
      <div
        className={`flex flex-col overflow-hidden rounded-2xl border border-amber-300/45 bg-slate-950/88 p-2.5 text-slate-100 shadow-2xl sm:p-3.5 ${
          vp.isKeyboardOpen
            ? 'max-h-full w-full max-w-3xl'
            : 'max-h-[76dvh] w-full max-w-[calc(100vw-130px)] sm:max-h-[82dvh] sm:max-w-[min(46rem,calc(100vw-210px))]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between gap-2 border-b border-white/15 ${
            vp.isKeyboardOpen ? 'mb-1.5 pb-1' : 'mb-2.5 pb-1.5'
          }`}
        >
          <div className="flex min-w-0 items-center gap-2">
            {tab === 'bag' && <Backpack className="h-4 w-4 shrink-0 text-amber-300 sm:h-5 sm:w-5" />}
            {tab === 'kamus' && <BookOpen className="h-4 w-4 shrink-0 text-amber-300 sm:h-5 sm:w-5" />}
            {tab === 'quests' && <ScrollText className="h-4 w-4 shrink-0 text-amber-300 sm:h-5 sm:w-5" />}
            {tab === 'options' && <Settings className="h-4 w-4 shrink-0 text-amber-300 sm:h-5 sm:w-5" />}
            {tab === 'guide' && <HelpCircle className="h-4 w-4 shrink-0 text-amber-300 sm:h-5 sm:w-5" />}
            <h2 className="truncate text-xs font-black uppercase tracking-wider text-amber-200 [text-shadow:0_1px_2px_rgba(0,0,0,0.92)] sm:text-sm">
              {tab === 'bag' && `Tas ${resolvedPlayerName} · 8 Senjata, 6 Pusaka & Mahkota`}
              {tab === 'kamus' && `Kamus Kata (${hud.wordsMastered}/${VOCAB_CATALOG.length} Dikuasai)`}
              {tab === 'quests' && 'Misi Wilayah & Checklist 5 Pintu'}
              {tab === 'options' && `Opsi, Kesulitan & Panduan ${resolvedPlayerName}`}
              {tab === 'guide' && 'Petunjuk Bermain & Taktik Gua Voxel'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/25 bg-slate-950/35 px-2.5 py-1 text-[10px] font-extrabold text-slate-100 hover:bg-slate-900/55"
          >
            <X className="h-3.5 w-3.5" />
            <span>Tutup</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y pr-0.5">
          {/* TAB 1: TAS (7 WEAPONS + AMMO + 6 RELICS + 6 RIBBONS) */}
          {tab === 'bag' && (
            <div className="space-y-4">
              {/* Ammo Refill Panel */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/35 bg-slate-950/30 p-3.5">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-200">
                    Senjata Aktif
                  </div>
                  <div className="text-sm font-black text-slate-100 sm:text-base">
                    {hud.ownedWeapons.length > 0
                      ? `${activeWeaponDef.name} (${activeAmmo}/${MAX_AMMO} Peluru)`
                      : 'Belum punya senjata! Ambil di rumput Hutan Kata'}
                  </div>
                  <div className="text-xs font-semibold text-slate-300">
                    Berlian {hud.diamonds} 💎 · Paket +{activeWeaponDef.packSize} peluru seharga{' '}
                    {AMMO_COST} 💎
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={hud.ownedWeapons.length === 0}
                    onClick={() => {
                      onClose();
                      onStartAmmoQuiz();
                    }}
                    className="rounded-xl border border-emerald-300/70 bg-emerald-600/80 px-3.5 py-2 text-xs font-black text-white shadow disabled:cursor-not-allowed disabled:opacity-45 hover:bg-emerald-500/90"
                  >
                    Kuis Peluru Gratis (+6)
                  </button>
                </div>
              </div>

              {/* 8 Weapons 3D Interactive Showcase + Grid */}
              <div>
                <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-amber-200">
                  Koleksi Senjata 3D ({hud.ownedWeapons.length}/8)
                </h3>

                {/* 3D Interactive Turntable Showcase */}
                {(() => {
                  const inspectedId = previewWeapon ?? hud.activeWeapon;
                  const inspectedDef = WEAPONS[inspectedId];
                  const inspectedOwned = hud.ownedWeapons.includes(inspectedId);
                  return (
                    <div className="mb-3 overflow-hidden rounded-xl border border-white/20 bg-slate-950/35 text-white">
                      <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-3 w-3 shrink-0 rounded-full border border-white/70"
                              style={{ backgroundColor: inspectedDef.color }}
                            />
                            <span className="truncate text-sm font-black text-amber-200">
                              {inspectedDef.name}
                            </span>
                            {!inspectedOwned && (
                              <span className="rounded bg-slate-950/65 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
                                Terkunci
                              </span>
                            )}
                          </div>
                          <div className="truncate text-[11px] font-medium text-slate-300">
                            {inspectedDef.desc}
                          </div>
                        </div>
                        <span className="hidden shrink-0 rounded-lg border border-amber-300/35 bg-slate-950/55 px-2 py-0.5 text-[10px] font-bold text-amber-200 sm:inline-block">
                          Geser untuk Putar 360°
                        </span>
                      </div>
                      <WeaponPreviewCanvas weaponId={inspectedId} owned={inspectedOwned} />
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {WEAPON_ORDER.map((wId) => {
                    const w = WEAPONS[wId];
                    const owned = hud.ownedWeapons.includes(wId);
                    const equipped = hud.activeWeapon === wId && owned;
                    const inspected = (previewWeapon ?? hud.activeWeapon) === wId;
                    const ammo = hud.weaponAmmo[wId] || 0;
                    return (
                      <div
                        key={wId}
                        onClick={() => setPreviewWeapon(wId)}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                          equipped
                            ? 'border-emerald-300/90 bg-emerald-950/30 text-emerald-100 ring-1 ring-emerald-300/80'
                            : inspected
                            ? 'border-amber-300/90 bg-amber-950/30 text-amber-100 ring-1 ring-amber-300/80'
                            : owned
                            ? 'border-white/20 bg-slate-950/20 text-slate-100 hover:border-white/45 hover:bg-slate-900/35'
                            : 'border-white/15 bg-slate-950/15 text-slate-300/85 hover:border-white/30'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-white/75"
                              style={{ backgroundColor: w.color }}
                            />
                            <span className="truncate text-sm font-black">{w.name}</span>
                            {owned && (
                              <span className="font-mono-nums text-[11px] font-bold text-amber-200">
                                {ammo}/{MAX_AMMO}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 text-[11px] font-semibold text-slate-200">
                            {w.desc}
                          </div>
                          <div className="text-[10px] font-bold text-amber-200/90">
                            Asal {w.originLabel}
                          </div>
                        </div>
                        {owned ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewWeapon(wId);
                              onEquipWeapon(wId);
                            }}
                            disabled={equipped}
                            className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-black ${
                              equipped
                                ? 'border-emerald-300/80 bg-emerald-600/75 text-white'
                                : 'border-amber-300/80 bg-amber-500/75 text-slate-950 hover:bg-amber-400/90'
                            }`}
                          >
                            {equipped ? 'Dipakai' : 'Pakai'}
                          </button>
                        ) : (
                          <Lock className="h-4 w-4 shrink-0 text-slate-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6 Relics */}
              <div>
                <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-amber-200">
                  6 Pusaka Duel ({hud.ownedRelics.length}/6)
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {RELIC_ORDER.map((rId) => {
                    const r = RELICS[rId];
                    const owned = hud.ownedRelics.includes(rId);
                    return (
                      <div
                        key={rId}
                        className={`rounded-xl border px-3 py-2.5 ${
                          owned
                            ? 'border-amber-300/75 bg-amber-950/25 text-slate-100'
                            : 'border-white/15 bg-slate-950/20 text-slate-300 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-black">
                          <span>
                            {r.icon} {r.name}
                          </span>
                          <span className="text-[10px] text-amber-200/90">
                            {owned ? '✓ Aktif' : `Bos ${ZONE_INFO[r.zoneId].name}`}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-slate-200">{r.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6 Ribbons / Crowns + Lila's Red Ribbon Messages */}
              <div>
                <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-amber-200">
                  Mahkota &amp; Pita Merah dari Lila ({hud.crowns}/6)
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {ZONE_ORDER.map((zId) => {
                    const rb = RIBBONS[zId];
                    const has = hud.ribbons.includes(zId);
                    return (
                      <div
                        key={zId}
                        className={`rounded-xl border px-3 py-2.5 ${
                          has
                            ? 'border-rose-300/75 bg-rose-950/25 text-slate-100'
                            : 'border-white/15 bg-slate-950/20 text-slate-300 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs font-black">
                          <span className="inline-flex items-center gap-1.5">
                            {has ? (
                              <Bookmark className="h-3.5 w-3.5 fill-rose-400 text-rose-300" />
                            ) : (
                              <Lock className="h-3.5 w-3.5 text-slate-400" />
                            )}
                            <span>{rb.name}</span>
                          </span>
                          {has && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-300/50 bg-amber-500/25 px-1.5 py-0.5 text-[10px] font-black text-amber-200">
                              <Crown className="h-3 w-3 text-amber-300" />
                              <span>#{rb.number}</span>
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-[11px] font-semibold italic leading-snug text-rose-100/90">
                          {has
                            ? `“${rb.quote}”`
                            : `Kalahkan bos ${ZONE_INFO[zId].name} untuk menemukan Pita Merah Lila.`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KAMUS KATA (A1 PDF + IELTS WORDS, SEARCH, STATUS, DYNAMIC CATEGORIES) */}
          {tab === 'kamus' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-amber-300" />
                  <input
                    type="text"
                    value={searchText}
                    onFocus={(e) => scrollFieldIntoView(e.currentTarget)}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Cari kata Inggris atau arti Indonesia..."
                    className="w-full rounded-xl border border-white/25 bg-slate-950/55 py-2 pl-9 pr-3 text-xs font-bold text-slate-100 placeholder:text-slate-400 focus:border-amber-300/75 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                  />
                </div>
                <select
                  value={selectedCat}
                  onChange={(e) =>
                    setSelectedCat(e.target.value === 'all' ? 'all' : Number(e.target.value))
                  }
                  className="rounded-xl border border-white/25 bg-slate-950/65 px-3 py-2 text-xs font-bold text-slate-100 focus:border-amber-300/75 focus:outline-none"
                >
                  <option value="all" className="bg-slate-900 text-slate-100">
                    Semua {CATEGORIES.length} Tema ({VOCAB_CATALOG.length})
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  {(
                    [
                      ['all', 'Semua'],
                      ['new', 'Baru'],
                      ['learn', 'Belajar'],
                      ['mast', 'Dikuasai (3+)'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStatusFilter(key)}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-extrabold transition ${
                        statusFilter === key
                          ? 'border-amber-300/80 bg-amber-500/75 text-slate-950'
                          : 'border-white/20 bg-slate-950/35 text-slate-200 hover:bg-slate-900/55'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {selectedCat !== 'all' && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartQuickLearn('cards', selectedCat);
                    }}
                    className="rounded-lg border border-emerald-300/75 bg-emerald-600/80 px-3 py-1 text-[11px] font-black text-white hover:bg-emerald-500"
                  >
                    Latih Tema Ini
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {filteredWords.map((v) => {
                  const st = getWordStatus(hud.wordProgress[v.id]);
                  const box = Math.min(3, hud.wordProgress[v.id]?.b || 0);
                  return (
                    <div
                      key={v.id}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                        st === 'mast'
                          ? 'border-emerald-300/75 bg-emerald-950/25 text-slate-100'
                          : st === 'learn'
                          ? 'border-amber-300/75 bg-amber-950/25 text-slate-100'
                          : 'border-white/15 bg-slate-950/20 text-slate-100'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-black">{v.word}</span>
                          <span className="rounded border border-amber-300/35 bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-200">
                            {v.cefr}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 font-mono-nums text-[10px] font-bold ${
                              st === 'mast'
                                ? 'bg-emerald-500/25 text-emerald-200'
                                : st === 'learn'
                                ? 'bg-amber-500/25 text-amber-200'
                                : 'bg-slate-950/60 text-slate-300'
                            }`}
                          >
                            {st === 'mast' ? '✓ 3/3' : `${box}/3`}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-300">{v.meaningId}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {st === 'mast' && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
                        <button
                          type="button"
                          onClick={() => soundEngine.speakEnglish(v.word)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-slate-950/45 text-amber-200 hover:bg-slate-900/70"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredWords.length === 0 && (
                <div className="py-8 text-center text-xs font-bold text-amber-200/80">
                  Tidak ada kata yang cocok dengan pencarianmu.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MISI & 5 PINTU CHECKLIST */}
          {tab === 'quests' && (
            <div className="space-y-3">
              {hud.quests.map((q) => {
                const doors = ZONE_DOORS[q.zoneId] || [];
                const cleared = hud.areaDoorsCleared[q.zoneId] || [];
                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-white/20 bg-slate-950/25 p-3.5 text-slate-100"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md border border-amber-300/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-200">
                            {q.zoneName}
                          </span>
                          <span className="text-xs font-bold text-amber-200/90">{q.npcName}</span>
                        </div>
                        <div className="mt-1 text-sm font-extrabold text-slate-100">{q.title}</div>
                        <p className="mt-0.5 text-[11px] font-medium leading-snug text-slate-300">
                          {ZONE_INFO[q.zoneId]?.conflict}
                        </p>
                        <div className="mt-1 font-mono-nums text-xs text-amber-200">
                          Hadiah +{q.rewardXp} XP · +{q.rewardDiamonds} 💎 · {cleared.length}/5 Pintu
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onTeleportZone(q.zoneId);
                          }}
                          className="rounded-lg border border-amber-300/80 bg-amber-500/80 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-950 hover:bg-amber-400"
                        >
                          Ke NPC
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onEnterDungeon(q.zoneId);
                          }}
                          className="rounded-lg border border-emerald-300/75 bg-emerald-600/80 px-2.5 py-1.5 text-[11px] font-extrabold text-white hover:bg-emerald-500"
                        >
                          Masuk Area
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-white/10 pt-2">
                      {doors.map((d) => {
                        const ok = cleared.includes(d.index);
                        return (
                          <span
                            key={d.id}
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                              ok
                                ? 'border-emerald-400/50 bg-emerald-950/40 text-emerald-200'
                                : 'border-white/15 bg-slate-950/45 text-slate-300'
                            }`}
                          >
                            {ok ? '✓' : '○'} {d.name} ({d.modeLabel})
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 5 OPSI & PANDUAN */}
          {tab === 'options' && (
            <div className="space-y-3.5">
              {/* Aim Mode (Bidik Otomatis vs Bidik Bebas) */}
              <div className="rounded-xl border border-white/20 bg-slate-950/25 p-3.5">
                <div className="text-xs font-black uppercase tracking-wider text-amber-200">
                  Gaya Membidik &amp; Menembak
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(
                    [
                      {
                        mode: 'auto' as AimMode,
                        title: 'Bidik Otomatis',
                        sub: 'Kunci Target Cerdas',
                        desc: 'Peluru otomatis mengunci & mengarah ke monster terdekat. Santai & praktis.',
                      },
                      {
                        mode: 'manual' as AimMode,
                        title: 'Bidik Bebas',
                        sub: 'Crosshair & Scope Presisi',
                        desc: 'Bidik manual 360° lewat crosshair, lengkap dengan zoom Scope (ADS) & recoil.',
                      },
                    ]
                  ).map((item) => {
                    const active = hud.settings.aimMode === item.mode;
                    return (
                      <button
                        key={item.mode}
                        type="button"
                        onClick={() => onUpdateSettings({ aimMode: item.mode })}
                        className={`rounded-xl border p-3 text-left transition ${
                          active
                            ? 'border-cyan-300/85 bg-cyan-950/35 text-cyan-100 ring-1 ring-cyan-300/70'
                            : 'border-white/15 bg-slate-950/25 text-slate-200 hover:border-white/35 hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-black">{item.title}</span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-black ${
                              active
                                ? 'bg-cyan-400/90 text-slate-950'
                                : 'border border-white/15 bg-slate-950/55 text-amber-200'
                            }`}
                          >
                            {active ? 'Aktif' : item.sub}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] font-medium text-slate-300">
                          {item.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty */}
              <div className="rounded-xl border border-white/20 bg-slate-950/25 p-3.5">
                <div className="text-xs font-black uppercase tracking-wider text-amber-200">
                  Tingkat Kesulitan
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {(['santai', 'petualang', 'pendekar'] as DifficultyMode[]).map((d) => {
                    const cfg = DIFF_CONFIG[d];
                    const active = hud.settings.difficulty === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => onUpdateSettings({ difficulty: d })}
                        className={`rounded-xl border p-3 text-left transition ${
                          active
                            ? 'border-emerald-300/85 bg-emerald-950/35 text-emerald-100 ring-1 ring-emerald-300/70'
                            : 'border-white/15 bg-slate-950/25 text-slate-200 hover:border-white/35 hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="text-sm font-black">{cfg.label}</div>
                        <div className="mt-0.5 text-[11px] font-medium text-slate-300">
                          {cfg.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={IELTS_TEMPORARILY_LOCKED}
                  onClick={() => {
                    if (IELTS_TEMPORARILY_LOCKED) return;
                    onUpdateSettings({ storyLocked: !hud.settings.storyLocked });
                  }}
                  className="flex items-center justify-between rounded-xl border border-white/20 bg-slate-950/25 p-3 text-left text-slate-100 hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <div>
                    <div className="text-xs font-black">Akses Istana IELTS</div>
                    <div className="text-[11px] text-slate-300">
                      {IELTS_TEMPORARILY_LOCKED
                        ? 'Ditutup sementara untuk fokus petualangan 6 pulau Nusantara Kata'
                        : hud.settings.storyLocked
                        ? 'Mode Cerita (Butuh 6 Mahkota)'
                        : 'Mode Bebas (Langsung Masuk)'}
                    </div>
                  </div>
                  <span className="rounded-lg border border-purple-300/40 bg-purple-500/25 px-2.5 py-1 text-xs font-black text-purple-200">
                    {IELTS_TEMPORARILY_LOCKED
                      ? 'Ditutup'
                      : hud.settings.storyLocked
                      ? 'Cerita'
                      : 'Bebas'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateSettings({ qtimer: !hud.settings.qtimer })}
                  className="flex items-center justify-between rounded-xl border border-white/20 bg-slate-950/25 p-3 text-left text-slate-100 hover:border-white/35"
                >
                  <div>
                    <div className="text-xs font-black">Timer Soal Pintu</div>
                    <div className="text-[11px] text-slate-300">
                      Bilah {resolvedPlayerName} vs Monster saat belajar
                    </div>
                  </div>
                  <span className="rounded-lg border border-amber-300/40 bg-amber-500/25 px-2.5 py-1 text-xs font-black text-amber-200">
                    {hud.settings.qtimer ? 'Aktif' : 'Nonaktif'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const order: FxLevel[] = ['full', 'lite', 'off'];
                    const next = order[(order.indexOf(hud.settings.fxLevel) + 1) % 3];
                    onUpdateSettings({ fxLevel: next });
                  }}
                  className="flex items-center justify-between rounded-xl border border-white/20 bg-slate-950/25 p-3 text-left text-slate-100 hover:border-white/35"
                >
                  <div>
                    <div className="text-xs font-black">Efek Partikel 3D</div>
                    <div className="text-[11px] text-slate-300">Kepadatan percikan pertempuran</div>
                  </div>
                  <span className="rounded-lg border border-sky-300/40 bg-sky-500/25 px-2.5 py-1 text-xs font-black uppercase text-sky-200">
                    {hud.settings.fxLevel}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const order: GameSettings['touchControls'][] = ['auto', 'on', 'off'];
                    const next = order[(order.indexOf(hud.settings.touchControls) + 1) % 3];
                    onUpdateSettings({ touchControls: next });
                  }}
                  className="flex items-center justify-between rounded-xl border border-white/20 bg-slate-950/25 p-3 text-left text-slate-100 hover:border-white/35"
                >
                  <div>
                    <div className="text-xs font-black">Kontrol Sentuh (Floating Joystick)</div>
                    <div className="text-[11px] text-slate-300">
                      Joystick muncul di area kiri yang disentuh &amp; tombol layar
                    </div>
                  </div>
                  <span className="rounded-lg border border-emerald-300/40 bg-emerald-500/25 px-2.5 py-1 text-xs font-black uppercase text-emerald-200">
                    {hud.settings.touchControls}
                  </span>
                </button>
              </div>

              {/* Offline Cache & PWA Install */}
              {(() => {
                const offlineMeta = getLocalOfflineState();
                return (
                  <div className="rounded-xl border border-white/20 bg-slate-950/25 p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-amber-200">
                          Mode Offline Penuh &amp; Auto-Update
                        </div>
                        <div className="mt-0.5 text-[11px] font-medium text-slate-300">
                          {offlineMeta.enrolled && offlineMeta.buildHash
                            ? `Tersimpan di perangkat · ${offlineMeta.fileCount} berkas (${formatBytesMb(offlineMeta.totalBytes)}) · v${offlineMeta.version || '-'}`
                            : 'Aset offline belum diunduh lengkap. Unduh agar bisa main tanpa kuota.'}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {onOpenOfflineSync && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenOfflineSync();
                            }}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-amber-300/80 bg-amber-500/85 px-3 py-2 text-xs font-black text-slate-950 hover:bg-amber-400"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>
                              {offlineMeta.enrolled
                                ? 'Periksa Update Server'
                                : 'Unduh Aset Offline'}
                            </span>
                          </button>
                        )}
                        <PWAInstallButton />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Panduan & Diglosa Credits */}
              <div className="rounded-xl border border-white/20 bg-slate-950/30 p-3.5">
                <button
                  type="button"
                  onClick={() => setShowRpgHelp((s) => !s)}
                  className="flex w-full items-center justify-between text-xs font-black text-amber-200"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4" />
                    <span>Panduan Kontrol &amp; Mekanik Game</span>
                  </span>
                  <span>{showRpgHelp ? 'Tutup ▲' : 'Buka ▼'}</span>
                </button>
                {showRpgHelp && (
                  <ul className="mt-2.5 space-y-1 text-xs font-medium text-slate-200">
                    <li>• <strong>Gerak</strong> dengan WASD / Panah, Ketuk lantai 3D, atau Joystick Virtual.</li>
                    <li>• <strong>Senjata &amp; Kekuatan</strong> pada senjata kecil (Ketapel / Kerikil) butuh <strong>3× tembakan</strong> untuk mematahkan perisai monster sebelum Kuis Duel muncul.</li>
                    <li>• <strong>Gua Voxel (Minecraft)</strong> memakai Slot <strong>9 (⛏️)</strong> gali balok, Slot <strong>0 (🔦)</strong> pasang obor, Slot <strong>B (🧱)</strong> pasang Blok Pelindung, serta cari <strong>Peti Senjata Gua</strong> acak!</li>
                    <li>• <strong>Interaksi</strong> dengan tekan <strong>E</strong> / klik langsung NPC, Pintu Misi (1–5), Peti Senjata, Monster, atau Portal.</li>
                    <li>• <strong>Taktik Duel</strong> yakni tekan <strong>AMBIL GILIRAN!</strong> secepatnya agar monster tidak menyerang duluan, dan manfaatkan 6 Pusaka.</li>
                  </ul>
                )}

                {onOpenGuide && (
                  <button
                    type="button"
                    onClick={onOpenGuide}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-amber-300/75 bg-amber-500/80 px-3 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Buka Menu Petunjuk Lengkap</span>
                  </button>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] font-bold text-slate-300">
                  <span>Diglosa Petualangan Kata 3D · Diglosa Edukasi Digital</span>
                  <span className="inline-flex items-center gap-1 text-amber-200">
                    <Crosshair className="h-3.5 w-3.5" />
                    <span>Target Harian {hud.dailyCount}/{hud.dailyGoal}</span>
                  </span>
                </div>
              </div>

              {/* Profil Akun Google & Logout Sistem */}
              {user && (
                <div className="rounded-xl border border-white/20 bg-slate-950/25 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-950/60 text-sm font-black text-emerald-200">
                        {resolvedPlayerName.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-black text-slate-100">
                          {resolvedPlayerName} · {user.displayName || 'Akun Google'}
                        </div>
                        <div className="truncate text-[11px] font-medium text-slate-300">
                          {user.email || 'Sesi aktif tersimpan di perangkat ini'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {onOpenProfile && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenProfile();
                          }}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-amber-300/65 bg-amber-500/85 px-3.5 py-2 text-xs font-black text-slate-950 transition hover:bg-amber-400"
                        >
                          <UserIcon className="h-3.5 w-3.5" />
                          <span>Edit Profil &amp; Nama</span>
                        </button>
                      )}
                      {onSignOut && (
                        <button
                          type="button"
                          onClick={() => void onSignOut()}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-rose-300/60 bg-rose-600/85 px-3.5 py-2 text-xs font-black text-white transition hover:bg-rose-500"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Logout Akun</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'guide' && <GuideTabContent hud={hud} playerName={playerName} />}
        </div>
      </div>
    </div>
  );
};
