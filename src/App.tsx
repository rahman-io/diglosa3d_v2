import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { RotateCw, Smartphone } from 'lucide-react';
import { soundEngine } from './audio/soundEngine';
import { AssetDownloaderScreen } from './components/AssetDownloaderScreen';
import { BattleQuizModal } from './components/BattleQuizModal';
import { CaveCraftingModal } from './components/CaveCraftingModal';
import { CaveSealModal } from './components/CaveSealModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MultiplayerHudOverlay } from './components/MultiplayerHudOverlay';
import { PlayLobbyModal } from './components/PlayLobbyModal';
import { GameOverModal } from './components/GameOverModal';
import { AcademySkillMode, IeltsAcademyModal } from './components/IeltsAcademyModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LearningModeModal } from './components/LearningModeModal';
import { LoginGateScreen } from './components/LoginGateScreen';
import { NpcDialogueModal } from './components/NpcDialogueModal';
import {
  getGlobalPwaInstallState,
  OfflineIndicator,
  triggerGlobalPwaInstall,
  useOnlineStatus,
  usePWAInstall,
} from './components/PwaControls';
import { RpgHud } from './components/RpgHud';
import { RpgSideModals, SideModalTab } from './components/RpgSideModals';
import { StoryOverlayModal } from './components/StoryOverlayModal';
import { TitleScreen } from './components/TitleScreen';
import { VsMatchIntroModal, VsSquadMember } from './components/VsMatchIntroModal';
import { auth, probeFirestoreReachable, signInWithGoogleAccount } from './firebase';
import {
  fetchPublicLeaderboard,
  loadUserProgress,
  subscribeLeaderboard,
  syncRunToCloud,
} from './services/leaderboardService';
import {
  fetchServerManifest,
  getLocalOfflineState,
  initPwaAutoUpdateWorker,
  inspectLocalCache,
  OfflineAssetEntry,
  OfflineManifest,
  runOfflineSyncDownload,
  SyncProgressState,
} from './services/offlineSyncService';
import { RpgWorldEngine } from './three/RpgWorldEngine';
import {
  getAlwaysFullscreenPref,
  getLandscapeOnlyPref,
  initDisplayPreferences,
  isFullscreenActive,
  isTouchViewport,
  lockLandscapeOrientation,
  requestAppFullscreen,
  setAlwaysFullscreenPref,
  setLandscapeOnlyPref,
  toggleAppFullscreen,
} from './utils/fullscreen';
import {
  isVoiceCommandSupported,
  VoiceAction,
  VoiceCommandController,
} from './services/voiceCommandService';
import {
  loadSavedCharacterId,
  loadSavedPlayerName,
  saveCharacterId,
  savePlayerName,
} from './data/characterPresets';
import {
  checkSavedRoomMembership,
  claimHostAndRemoveDeadHost,
  clearLastActiveRoomSession,
  createGroupRoom,
  findOrCreatePublicRoom,
  JoinOrCreateRoomResult,
  joinRoomByCode,
  leaveMultiplayerRoom,
  normalizeRoomCode,
  pruneDisconnectedMember,
  readLatestRoomMeta,
  rejoinRoomById,
  RoomSquadMeta,
  sanitizeGroupName,
  sendFallbackChatMessage,
  startMultiplayerMatch,
  subscribeFallbackChatMessages,
  subscribeRoom,
  subscribeRoomMembers,
  touchRoomHeartbeat,
  updateMyMemberProfile,
  updateRoomGroupName,
} from './services/multiplayerRoomService';
import {
  generateRandomSurfaceWave,
  generateRandomWaveSeed,
  rollRandomWaveCount,
} from './three/waveGenerator';
import {
  filterChatProfanity,
  P2pMeshTransport,
} from './services/p2pMeshTransport';
import {
  BattleContext,
  CaveSealContext,
  CharacterPresetId,
  DifficultyMode,
  LeaderboardRecord,
  LearningSessionContext,
  MultiplayerMemberDoc,
  MultiplayerPlayerStats,
  MultiplayerRoomDoc,
  RoomChatMessage,
  RpgHudSnapshot,
  SpawnPreference,
  UserProfileRecord,
  WaveMissionState,
} from './types/game';

const INITIAL_HUD: RpgHudSnapshot = {
  phase: 'title',
  worldMode: 'overworld',
  cameraMode: 'third_back',
  activeHotbarSlot: 0,
  level: 1,
  xp: 0,
  xpToNext: 150,
  hp: 5,
  maxHp: 5,
  diamonds: 1,
  score: 0,
  streak: 0,
  maxStreak: 0,
  dailyCount: 0,
  dailyGoal: 20,
  activeWeapon: 'ketapel',
  ownedWeapons: [],
  weaponAmmo: {
    ketapel: 0,
    kerikil: 0,
    emas: 0,
    saus: 0,
    biji: 0,
    kertas: 0,
    jarum: 0,
    kristal: 0,
  },
  starterWeaponPicked: false,
  starterWeaponGuide: null,
  swimSuitPicked: false,
  swimSuitGuide: null,
  diveTransitionStage: 'idle',
  radarState: null,
  ownedRelics: [],
  crowns: 0,
  ribbons: [],
  monstersDefeated: 0,
  wordsMastered: 0,
  wordsSeen: 0,
  learnedVocabIds: [],
  wordProgress: {},
  wordMastery: {},
  activeZoneId: 'desa_sapaan',
  activeZoneName: 'Hutan Kata',
  rankTitle: 'Telur Pemula',
  nearbyNpcId: null,
  nearbyMonsterId: null,
  nearbyDoorIndex: null,
  nearbyDungeonGuardian: false,
  nearPrisonKey: false,
  nearHiddenPrison: false,
  nearPortal: false,
  nearDungeonExit: false,
  portalUnlocked: true,
  dungeonState: null,
  areaMonsterStats: {
    context: 'overworld_day',
    areaName: 'Hutan Kata',
    defeated: 0,
    remaining: 10,
    total: 10,
    caveDefeated: 0,
    caveRemaining: 10,
    caveTotal: 10,
    caveLiberated: false,
  },
  liberatedZones: [],
  areaDoorsCleared: {
    desa_sapaan: [],
    pasar_rasa: [],
    hutan_satwa: [],
    gerbang_kota: [],
    menara_waktu: [],
    gua_portal: [],
  },
  ieltsScores: {
    listening: 0,
    reading: 0,
    writing: 0,
    speaking: 0,
    full: 0,
  },
  quests: [],
  projectedLabels: [],
  bannerMessage: null,
  storyDialog: null,
  settings: {
    difficulty: 'petualang',
    aimMode: 'manual',
    storyLocked: false,
    qtimer: true,
    fxLevel: 'full',
    touchControls: 'auto',
    dpadMode: 'joystick',
  },
  hasSavedGame: false,
  caveTorchesLeft: 16,
  caveShieldBlocksLeft: 4,
  caveTntLeft: 1,
  pickaxeTier: 1,
  nearCraftingTable: false,
  caveBlocksMined: 0,
  targetedBlock: null,
  isAiming: false,
  hitMarkerKind: 'none',
  crosshairOnEnemy: false,
  crosshairSpread: 0,
  pointerLocked: false,
  worldTime: {
    tick: 600,
    phase: 'siang',
    phaseLabel: 'Siang',
    dayCount: 1,
    phaseRemainingSec: 570,
    nightMonsterCount: 0,
    nightWaveDefeated: 0,
    nightWaveTotal: 0,
  },
};

function DiglosaRpgApp() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<RpgWorldEngine | null>(null);
  const prevPhaseRef = useRef<RpgHudSnapshot['phase']>('title');

  const [hud, setHud] = useState<RpgHudSnapshot>(INITIAL_HUD);
  const [muted, setMuted] = useState(false);
  const [activeBattle, setActiveBattle] = useState<BattleContext | null>(null);
  const [activeLearning, setActiveLearning] = useState<LearningSessionContext | null>(null);
  const [activeAcademySkill, setActiveAcademySkill] = useState<AcademySkillMode | null>(null);
  const [activeCaveSeal, setActiveCaveSeal] = useState<CaveSealContext | null>(null);
  const [craftingOpen, setCraftingOpen] = useState(false);
  const [dialogueNpcId, setDialogueNpcId] = useState<string | null>(null);
  const [sideTab, setSideTab] = useState<SideModalTab>(null);
  const [difficultyPromptOpen, setDifficultyPromptOpen] = useState(false);
  const [pendingDifficulty, setPendingDifficulty] = useState<DifficultyMode>('petualang');

  const [characterId, setCharacterId] = useState<CharacterPresetId>(() => loadSavedCharacterId());
  const [playerName, setPlayerName] = useState<string>(() => loadSavedPlayerName());
  const [groupName, setGroupName] = useState<string>('ELITE SQUAD');
  const [vsIntroData, setVsIntroData] = useState<{
    squadName: string;
    isMultiplayer: boolean;
    members: VsSquadMember[];
    wave: WaveMissionState;
  } | null>(null);
  const [dismissedVictorySeed, setDismissedVictorySeed] = useState<number>(0);
  const [activeRoom, setActiveRoom] = useState<MultiplayerRoomDoc | null>(null);
  const [resumableRoom, setResumableRoom] = useState<JoinOrCreateRoomResult | null>(null);
  const [roomMembers, setRoomMembers] = useState<MultiplayerMemberDoc[]>([]);
  const [mySpawnIndex, setMySpawnIndex] = useState<number>(0);
  const [isMultiplayerPlaying, setIsMultiplayerPlaying] = useState(false);
  const [chatMessages, setChatMessages] = useState<RoomChatMessage[]>([]);
  const [micEnabled, setMicEnabled] = useState(false);
  const [muteAllVoice, setMuteAllVoice] = useState(false);
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [voiceChatError, setVoiceChatError] = useState<string | null>(null);
  const [p2pStats, setP2pStats] = useState<{ connectedPeers: number; totalPeers: number }>({
    connectedPeers: 0,
    totalPeers: 0,
  });
  const [teamStatsMap, setTeamStatsMap] = useState<Record<string, MultiplayerPlayerStats>>({});
  const transportRef = useRef<P2pMeshTransport | null>(null);
  const chatSeenIdsRef = useRef<Set<string>>(new Set());
  const lastPacketSigRef = useRef<string>('');
  const lastPacketSentAtRef = useRef<number>(0);
  const roomMetaRef = useRef<{ roomId: string; g?: string; ws?: number; wc?: number; ts: number }>({
    roomId: '',
    ts: 0,
  });
  const enteringPlayingRoomRef = useRef<string | null>(null);
  const activeRoomRef = useRef<MultiplayerRoomDoc | null>(null);
  const playerNameRef = useRef<string>(playerName);
  activeRoomRef.current = activeRoom;
  playerNameRef.current = playerName;

  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardRecord[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileRecord | null>(null);
  const [bestLocalScore, setBestLocalScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('voxelia_best_score') || '0') || 0;
    } catch {
      return 0;
    }
  });
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [cloudSyncNote, setCloudSyncNote] = useState<string | null>(null);
  const [isPortraitTouch, setIsPortraitTouch] = useState(false);
  const desktopAutoFsTriedRef = useRef(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceLastAction, setVoiceLastAction] = useState('');
  const voiceControllerRef = useRef<VoiceCommandController | null>(null);
  const voiceFeedbackTimerRef = useRef<number | null>(null);

  const isOnline = useOnlineStatus();
  const pwaInstall = usePWAInstall();
  const [showAssetDownloader, setShowAssetDownloader] = useState(true);
  const [worldBootReady, setWorldBootReady] = useState(false);
  const [offlineReady, setOfflineReady] = useState(() => {
    const st = getLocalOfflineState();
    return Boolean(st.enrolled && st.buildHash);
  });
  const [offlineVersion, setOfflineVersion] = useState<string | null>(
    () => getLocalOfflineState().version,
  );
  const pendingManifestRef = useRef<{
    manifest: OfflineManifest;
    missingAssets: OfflineAssetEntry[];
    staleUrls: string[];
    isUpdate: boolean;
  } | null>(null);
  const downloadAbortRef = useRef<AbortController | null>(null);
  const syncInFlightRef = useRef(false);
  const [syncState, setSyncState] = useState<SyncProgressState>({
    phase: 'checking',
    percent: 12,
    downloadedBytes: 0,
    totalBytes: 0,
    completedFiles: 0,
    totalFiles: 0,
    currentFile: '',
    statusLabel: 'Memeriksa pembaruan dari server...',
    versionLabel: getLocalOfflineState().version ? `v${getLocalOfflineState().version}` : '',
    isUpdate: false,
    manifest: null,
  });

  // Initialize local display preferences (alwaysFullscreen=true, landscapeOnly=true)
  // and automatically engage fullscreen + landscape lock on open & first tap
  useEffect(() => {
    initDisplayPreferences();
    void requestAppFullscreen();

    const checkPortraitLock = () => {
      const portrait =
        isTouchViewport() && getLandscapeOnlyPref() && window.innerHeight > window.innerWidth;
      setIsPortraitTouch(portrait);
    };
    checkPortraitLock();

    const onOrientationChange = () => {
      checkPortraitLock();
      window.setTimeout(() => {
        checkPortraitLock();
        window.dispatchEvent(new Event('resize'));
      }, 150);
    };

    const onFirstOrTouchInteraction = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('[data-fullscreen-toggle="true"]')) return;
      if (!getAlwaysFullscreenPref()) return;

      if (isTouchViewport()) {
        if (!isFullscreenActive()) {
          void requestAppFullscreen();
        } else if (getLandscapeOnlyPref()) {
          void lockLandscapeOrientation();
        }
      } else if (!desktopAutoFsTriedRef.current && !isFullscreenActive()) {
        desktopAutoFsTriedRef.current = true;
        void requestAppFullscreen();
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isFullscreenActive() && getLandscapeOnlyPref()) {
        void lockLandscapeOrientation();
      }
    };

    window.addEventListener('resize', checkPortraitLock);
    window.addEventListener('orientationchange', onOrientationChange);
    document.addEventListener('fullscreenchange', checkPortraitLock);
    document.addEventListener('webkitfullscreenchange', checkPortraitLock);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pointerdown', onFirstOrTouchInteraction, { capture: true, passive: true });
    window.addEventListener('keydown', onFirstOrTouchInteraction, { capture: true });

    return () => {
      window.removeEventListener('resize', checkPortraitLock);
      window.removeEventListener('orientationchange', onOrientationChange);
      document.removeEventListener('fullscreenchange', checkPortraitLock);
      document.removeEventListener('webkitfullscreenchange', checkPortraitLock);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pointerdown', onFirstOrTouchInteraction, { capture: true });
      window.removeEventListener('keydown', onFirstOrTouchInteraction, { capture: true });
    };
  }, []);

  const finishSyncAndPromptInstall = useCallback(async () => {
    const st = getGlobalPwaInstallState();
    const iosDismissedThisSession = (() => {
      try {
        return sessionStorage.getItem('diglosa_ios_install_prompted') === '1';
      } catch {
        return false;
      }
    })();

    if (!st.isInstalled && !st.isInIframe) {
      if (st.isInstallable) {
        // Coba picu dialog instalasi OS langsung begitu aset selesai terunduh
        const outcome = await triggerGlobalPwaInstall();
        if (outcome === 'accepted') {
          setShowAssetDownloader(false);
          return;
        }
        // Jika gesture browser kedaluwarsa selama unduhan async atau ditunda, tampilkan tombol Pasang 1-ketuk wajib
        if (outcome === 'blocked_gesture' || outcome === 'dismissed') {
          setSyncState((prev) => ({
            ...prev,
            phase: 'install_prompt',
            percent: 100,
            statusLabel: 'Aset 100% Terunduh · Ketuk Pasang Aplikasi ke Perangkat',
          }));
          return;
        }
      } else if (st.isIOS && !iosDismissedThisSession) {
        setSyncState((prev) => ({
          ...prev,
          phase: 'install_prompt',
          percent: 100,
          statusLabel: 'Aset 100% Terunduh · Tambahkan ke Layar Utama',
        }));
        return;
      }
    }

    window.setTimeout(() => {
      setShowAssetDownloader(false);
    }, 420);
  }, []);

  const executeOfflineDownload = useCallback(
    async (
      manifest: OfflineManifest,
      missingAssets: OfflineAssetEntry[],
      staleUrls: string[],
      isUpdate: boolean,
    ) => {
      if (syncInFlightRef.current) return;
      syncInFlightRef.current = true;
      downloadAbortRef.current?.abort();
      const controller = new AbortController();
      downloadAbortRef.current = controller;

      try {
        const { requiresCodeReload } = await runOfflineSyncDownload(
          manifest,
          missingAssets,
          staleUrls,
          isUpdate,
          (nextState) => setSyncState(nextState),
          controller.signal,
        );
        setOfflineReady(true);
        setOfflineVersion(manifest.version);

        if (requiresCodeReload) {
          window.setTimeout(() => {
            window.location.reload();
          }, 550);
          return;
        }

        await finishSyncAndPromptInstall();
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        setSyncState((prev) => ({
          ...prev,
          phase: 'error',
          statusLabel: 'Unduhan gagal atau terputus',
          errorMessage:
            err instanceof Error
              ? err.message
              : 'Sebagian berkas gagal diunduh dari server.',
        }));
      } finally {
        syncInFlightRef.current = false;
      }
    },
    [finishSyncAndPromptInstall],
  );

  const runServerAndCacheCheck = useCallback(
    async (forceShowOverlay = false) => {
      if (syncInFlightRef.current) return;
      if (forceShowOverlay) {
        setShowAssetDownloader(true);
      }

      const localState = getLocalOfflineState();
      setSyncState((prev) => ({
        ...prev,
        phase: 'checking',
        percent: 15,
        statusLabel: 'Memeriksa pembaruan dari server...',
        versionLabel: localState.version ? `v${localState.version}` : '',
      }));

      const serverManifest = await fetchServerManifest(4500);

      if (!serverManifest) {
        // Offline or server unreachable — verify local cache
        const cacheCheck = await inspectLocalCache(null);
        if (localState.enrolled && cacheCheck.hasAnyCachedAssets) {
          setOfflineReady(true);
          setOfflineVersion(localState.version);
          setSyncState({
            phase: 'offline_ready',
            percent: 100,
            downloadedBytes: localState.totalBytes,
            totalBytes: localState.totalBytes,
            completedFiles: localState.fileCount,
            totalFiles: localState.fileCount,
            currentFile: '',
            statusLabel: 'Mode Offline Aktif · Cache Lokal Terverifikasi',
            versionLabel: localState.version ? `v${localState.version}` : 'Offline',
            isUpdate: false,
            manifest: null,
          });
          window.setTimeout(() => setShowAssetDownloader(false), 550);
        } else {
          setOfflineReady(false);
          setSyncState({
            phase: 'offline_empty',
            percent: 0,
            downloadedBytes: 0,
            totalBytes: 0,
            completedFiles: 0,
            totalFiles: 0,
            currentFile: '',
            statusLabel: 'Tidak ada koneksi & aset offline belum tersedia',
            versionLabel: 'Offline',
            isUpdate: false,
            manifest: null,
          });
        }
        return;
      }

      const cacheStatus = await inspectLocalCache(serverManifest);
      const isUpToDate =
        localState.enrolled &&
        localState.buildHash === serverManifest.buildHash &&
        cacheStatus.missingAssets.length === 0;

      if (isUpToDate) {
        setOfflineReady(true);
        setOfflineVersion(serverManifest.version);
        setSyncState({
          phase: 'ready',
          percent: 100,
          downloadedBytes: serverManifest.totalBytes,
          totalBytes: serverManifest.totalBytes,
          completedFiles: serverManifest.assets.length,
          totalFiles: serverManifest.assets.length,
          currentFile: '',
          statusLabel: 'Diglosa Offline Shield · Aset Terverifikasi 100%',
          versionLabel: `v${serverManifest.version}`,
          isUpdate: false,
          manifest: serverManifest,
        });
        await finishSyncAndPromptInstall();
        return;
      }

      const isUpdate = Boolean(localState.enrolled && localState.buildHash);
      const assetsToFetch =
        cacheStatus.missingAssets.length > 0
          ? cacheStatus.missingAssets
          : serverManifest.assets;

      pendingManifestRef.current = {
        manifest: serverManifest,
        missingAssets: assetsToFetch,
        staleUrls: cacheStatus.staleUrls,
        isUpdate,
      };

      if (isUpdate || forceShowOverlay) {
        // Player already opted into offline mode -> auto-update seamlessly on refresh / open!
        await executeOfflineDownload(
          serverManifest,
          assetsToFetch,
          cacheStatus.staleUrls,
          isUpdate,
        );
      } else {
        // First time: ask player to download all assets for full offline + auto-update
        setOfflineReady(false);
        setSyncState({
          phase: 'prompt_download',
          percent: 0,
          downloadedBytes: 0,
          totalBytes: serverManifest.totalBytes,
          completedFiles: 0,
          totalFiles: serverManifest.assets.length,
          currentFile: '',
          statusLabel: 'Menunggu persetujuan unduhan aset offline...',
          versionLabel: `v${serverManifest.version}`,
          isUpdate: false,
          manifest: serverManifest,
        });
      }
    },
    [executeOfflineDownload, finishSyncAndPromptInstall],
  );

  // Initialize PWA auto-update SW + run initial asset/version check on mount
  useEffect(() => {
    initPwaAutoUpdateWorker(() => {
      const local = getLocalOfflineState();
      if (local.enrolled) {
        void runServerAndCacheCheck(true);
      }
    });
    void runServerAndCacheCheck(false);

    // Also auto-check when app returns to foreground or regains network
    const onCheckBackgroundUpdate = () => {
      if (!navigator.onLine) return;
      const local = getLocalOfflineState();
      if (!local.enrolled) return;
      void fetchServerManifest(3500).then((remote) => {
        if (remote && remote.buildHash !== local.buildHash) {
          void runServerAndCacheCheck(true);
        }
      });
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        onCheckBackgroundUpdate();
      }
    };

    window.addEventListener('online', onCheckBackgroundUpdate);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      downloadAbortRef.current?.abort();
      window.removeEventListener('online', onCheckBackgroundUpdate);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [runServerAndCacheCheck]);

  useEffect(() => {
    const introActive =
      !showAssetDownloader &&
      (hud.phase === 'title' || difficultyPromptOpen);
    soundEngine.setIntroMusic(introActive);
    return () => {
      soundEngine.setIntroMusic(false);
    };
  }, [showAssetDownloader, hud.phase, difficultyPromptOpen]);

  useEffect(() => {
    if (!showAssetDownloader) {
      setWorldBootReady(true);
    }
  }, [showAssetDownloader]);

  // Mount 100% 3D RpgWorldEngine once asset splash finishes (so WebGL init never stalls network boot)
  useEffect(() => {
    if (!worldBootReady) return;
    const el = mountRef.current;
    if (!el) return;
    let cancelled = false;
    let engine: RpgWorldEngine | null = null;
    const rafId = window.requestAnimationFrame(() => {
      if (cancelled) return;
      engine = new RpgWorldEngine(el, {
        onHudUpdate: (snapshot) => setHud(snapshot),
        onStartBattle: (battle) => setActiveBattle(battle),
        onStartLearning: (session) => setActiveLearning(session),
        onOpenNpcDialogue: (npcId) => setDialogueNpcId(npcId),
        onOpenAcademyExam: (skill) => setActiveAcademySkill(skill),
        onOpenCaveSeal: (seal) => setActiveCaveSeal(seal),
        onOpenCrafting: () => setCraftingOpen(true),
        onMultiplayerPacket: (pkt, targetUid) => {
          const transport = transportRef.current;
          if (!transport) return;
          if (targetUid) {
            transport.sendReliableToPeer(targetUid, pkt);
          } else {
            transport.sendReliableToAll(pkt);
          }
        },
      });
      engine.setLocalAppearance(characterId, playerName);
      engineRef.current = engine;
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      if (engine) {
        engine.dispose();
      }
      engineRef.current = null;
    };
    // characterId/playerName initial sync handled on mount; live updates call setLocalAppearance directly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worldBootReady]);

  // Auth & Online Leaderboard subscription
  useEffect(() => {
    let disposed = false;
    let unsubLeaderboard: (() => void) | null = null;

    const loadBoard = async () => {
      const reachable = await probeFirestoreReachable();
      if (disposed || !reachable) {
        setLeaderboardLoading(false);
        return;
      }
      fetchPublicLeaderboard()
        .then((rows) => {
          if (!disposed) {
            setLeaderboardEntries(rows);
            setLeaderboardLoading(false);
          }
        })
        .catch(() => {
          if (!disposed) setLeaderboardLoading(false);
        });
    };

    const initialLoadTimer = window.setTimeout(() => {
      void loadBoard();
    }, 650);
    const onOnlineRetry = () => {
      void loadBoard();
    };
    window.addEventListener('online', onOnlineRetry);

    const unsubAuth = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthChecked(true);
      if (nextUser?.displayName) {
        setPlayerName((prev) => {
          if (!prev || prev === 'Petualang') {
            const cleaned = nextUser.displayName!.trim().slice(0, 24);
            if (cleaned) savePlayerName(cleaned);
            return cleaned || prev;
          }
          return prev;
        });
      }
      if (unsubLeaderboard) {
        unsubLeaderboard();
        unsubLeaderboard = null;
      }
      if (nextUser) {
        const reachable = await probeFirestoreReachable();
        if (disposed || !reachable) {
          setLeaderboardLoading(false);
          return;
        }
        try {
          const profile = await loadUserProgress(nextUser.uid);
          if (!disposed) {
            setUserProfile(profile);
            if (profile) {
              setBestLocalScore((prev) => (profile.bestScore > prev ? profile.bestScore : prev));
            }
          }
        } catch {
          // first time player or offline
        }
        if (!disposed) {
          unsubLeaderboard = subscribeLeaderboard(
            (rows) => {
              setLeaderboardEntries(rows);
              setLeaderboardLoading(false);
            },
            () => setLeaderboardLoading(false),
          );
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      disposed = true;
      window.clearTimeout(initialLoadTimer);
      window.removeEventListener('online', onOnlineRetry);
      unsubAuth();
      if (unsubLeaderboard) unsubLeaderboard();
    };
  }, []);

  // Keyboard Pause & Map shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.code === 'Escape') {
        if (vsIntroData) {
          const wasMp = vsIntroData.isMultiplayer;
          setVsIntroData(null);
          if (wasMp) engineRef.current?.setPhase('playing');
          return;
        }
        if (difficultyPromptOpen) {
          if (!activeRoom) setDifficultyPromptOpen(false);
          return;
        }
        if (leaderboardOpen) {
          setLeaderboardOpen(false);
          return;
        }
        if (sideTab) {
          setSideTab(null);
          return;
        }
        if (activeLearning) {
          setActiveLearning(null);
          engineRef.current?.setPhase('playing');
          return;
        }
        if (activeCaveSeal) {
          setActiveCaveSeal(null);
          engineRef.current?.setPhase('playing');
          return;
        }
        if (craftingOpen) {
          setCraftingOpen(false);
          engineRef.current?.setPhase('playing');
          return;
        }
        if (activeAcademySkill) {
          setActiveAcademySkill(null);
          engineRef.current?.setPhase('playing');
          return;
        }
        if (dialogueNpcId) {
          setDialogueNpcId(null);
          engineRef.current?.setPhase('playing');
          return;
        }
        const eng = engineRef.current;
        if (!eng) return;
        if (hud.phase === 'playing') eng.setPhase('paused');
        else if (hud.phase === 'paused') eng.setPhase('playing');
      } else if (
        (e.code === 'KeyM' || e.code === 'KeyH') &&
        hud.phase === 'playing' &&
        !activeBattle &&
        !activeLearning &&
        !activeCaveSeal &&
        !craftingOpen &&
        !activeAcademySkill &&
        !dialogueNpcId
      ) {
        const target = e.code === 'KeyM' ? 'map' : 'guide';
        setSideTab((prev) => (prev === target ? null : target));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    vsIntroData,
    difficultyPromptOpen,
    activeRoom,
    hud.phase,
    leaderboardOpen,
    sideTab,
    dialogueNpcId,
    activeBattle,
    activeLearning,
    activeCaveSeal,
    craftingOpen,
    activeAcademySkill,
  ]);

  // Save best score & sync on Game Over
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = hud.phase;

    if (hud.score > bestLocalScore) {
      setBestLocalScore(hud.score);
      try {
        localStorage.setItem('voxelia_best_score', String(hud.score));
      } catch {
        // ignore
      }
    }

    if (prev !== 'gameover' && hud.phase === 'gameover') {
      setActiveBattle(null);
      const questsDone = hud.quests.filter((q) => q.claimed).length;
      if (auth.currentUser && auth.currentUser.emailVerified) {
        setSyncing(true);
        syncRunToCloud({
          score: hud.score,
          cityLevel: hud.level,
          landmarksCount: hud.wordsMastered,
          maxCombo: hud.maxStreak,
          questsCompleted: questsDone,
          districtTitle: hud.rankTitle,
        })
          .then(({ newPersonalBest }) => {
            setCloudSyncNote(
              newPersonalBest
                ? 'Rekor baru berhasil diunggah ke Papan Peringkat Daring!'
                : 'Progres petualangan tersinkronisasi ke Cloud.',
            );
            return loadUserProgress(auth.currentUser!.uid);
          })
          .then((profile) => {
            if (profile) setUserProfile(profile);
          })
          .catch(() => {
            setCloudSyncNote('Gagal mengunggah otomatis. Buka Papan Peringkat untuk coba lagi.');
          })
          .finally(() => setSyncing(false));
      } else {
        setCloudSyncNote(
          'Masuk dengan Google di Papan Peringkat untuk menyimpan skor ke ranking global.',
        );
      }
    }
  }, [
    hud.phase,
    hud.score,
    hud.level,
    hud.wordsMastered,
    hud.maxStreak,
    hud.rankTitle,
    hud.quests,
    bestLocalScore,
  ]);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  const showVoiceFeedbackPill = useCallback((actionLabel: string) => {
    setVoiceTranscript('');
    setVoiceLastAction(actionLabel);
    if (voiceFeedbackTimerRef.current !== null) {
      window.clearTimeout(voiceFeedbackTimerRef.current);
    }
    voiceFeedbackTimerRef.current = window.setTimeout(() => {
      setVoiceLastAction('');
      voiceFeedbackTimerRef.current = null;
    }, 2800);
  }, []);

  const executeVoiceAction = useCallback(
    (action: VoiceAction, label: string) => {
      const engine = engineRef.current;
      if (!engine) return;
      showVoiceFeedbackPill(`✓ ${label}`);

      switch (action.type) {
        case 'move':
          engine.voiceMove(action.dir, action.durationSec, action.sprint);
          break;
        case 'jump':
          if (action.withForward) {
            engine.voiceMove('forward', 1.2, false);
          }
          engine.jumpHero();
          break;
        case 'dodge':
          engine.voiceMove('left', 0.9, true);
          engine.jumpHero();
          break;
        case 'look':
          engine.voiceLook(action.dir);
          break;
        case 'camera_mode':
          engine.voiceSetCameraMode(action.mode);
          break;
        case 'goto':
          engine.voiceGoToTarget(action.target);
          break;
        case 'exit_dungeon':
          engine.exitDungeon();
          break;
        case 'shoot':
          engine.voiceShootMonster(action.mode);
          break;
        case 'aim':
          if (action.mode === 'toggle_scope') engine.toggleAimMode();
          else if (action.mode === 'pointer_lock') engine.togglePointerLock();
          else engine.voiceSetAimMode(action.mode);
          break;
        case 'equip_weapon':
          engine.voiceEquipWeapon(action.target);
          break;
        case 'ammo':
          if (action.mode === 'buy') engine.buyAmmoWithDiamonds();
          else engine.startAmmoQuiz();
          break;
        case 'cave_tool':
          if (action.tool === 'select_pickaxe') engine.selectHotbarSlot(8);
          else if (action.tool === 'select_torch') engine.selectHotbarSlot(9);
          else if (action.tool === 'select_shield') engine.selectHotbarSlot(10);
          else if (action.tool === 'select_tnt') engine.selectHotbarSlot(11);
          else if (action.tool === 'mine') {
            engine.selectHotbarSlot(8);
            engine.mineTargetedBlock();
          } else if (action.tool === 'place_torch') engine.placeCaveTorch();
          else if (action.tool === 'place_shield') engine.placeShieldBlock();
          else if (action.tool === 'trigger_tnt') engine.placeAndTriggerTnt();
          else if (action.tool === 'open_crafting') engine.openCraftingTable();
          else if (action.tool === 'open_seal') engine.openWordSealChallenge();
          break;
        case 'interact':
          engine.triggerPrimaryAction();
          break;
        case 'teleport':
          engine.teleportToZone(action.zoneId);
          break;
        case 'ui':
          if (action.panel === 'leaderboard') setLeaderboardOpen(true);
          else if (action.panel === 'quick_learn') engine.startQuickLearning('quiz');
          else if (action.panel === 'pause') engine.setPhase('paused');
          else setSideTab(action.panel);
          break;
        case 'audio':
          soundEngine.setMuted(action.muted);
          setMuted(action.muted);
          engine.voiceShowFeedback(action.muted ? '🎙️ Suara game dimatikan' : '🎙️ Suara game dinyalakan');
          break;
        case 'fullscreen':
          void toggleAppFullscreen();
          break;
      }
    },
    [showVoiceFeedbackPill],
  );

  const executeVoiceActionRef = useRef(executeVoiceAction);
  executeVoiceActionRef.current = executeVoiceAction;

  useEffect(() => {
    const controller = new VoiceCommandController({
      onStatusChange: (listening) => {
        setVoiceListening(listening);
        if (!listening) setVoiceTranscript('');
      },
      onTranscript: (text, isFinal) => {
        setVoiceTranscript(isFinal ? '' : text);
      },
      onCommandMatched: (match) => {
        executeVoiceActionRef.current(match.action, match.entry.phrase);
      },
      onUnmatched: (transcript) => {
        showVoiceFeedbackPill(`? "${transcript}" (tidak cocok)`);
      },
      onError: (msg) => {
        showVoiceFeedbackPill(msg);
        engineRef.current?.voiceShowFeedback(`🎙️ ${msg}`);
      },
    });
    voiceControllerRef.current = controller;
    return () => {
      controller.stop();
      if (voiceFeedbackTimerRef.current !== null) {
        window.clearTimeout(voiceFeedbackTimerRef.current);
      }
    };
  }, [showVoiceFeedbackPill]);

  useEffect(() => {
    if (hud.phase !== 'playing' && voiceControllerRef.current?.isListening()) {
      voiceControllerRef.current.stop();
    }
  }, [hud.phase]);

  const handleToggleVoice = useCallback(() => {
    voiceControllerRef.current?.toggle();
  }, []);

  const handleContinue = useCallback(() => {
    if (getAlwaysFullscreenPref()) void requestAppFullscreen();
    setDifficultyPromptOpen(false);
    setIsMultiplayerPlaying(false);
    setActiveBattle(null);
    setActiveLearning(null);
    setActiveAcademySkill(null);
    setActiveCaveSeal(null);
    setCraftingOpen(false);
    setDialogueNpcId(null);
    setSideTab(null);
    setCloudSyncNote(null);
    engineRef.current?.setLocalAppearance(characterId, playerName);
    engineRef.current?.setMultiplayerActive(false);
    engineRef.current?.continueGame();
  }, [characterId, playerName]);

  const appendChatMessage = useCallback((msg: RoomChatMessage) => {
    if (chatSeenIdsRef.current.has(msg.id)) return;
    chatSeenIdsRef.current.add(msg.id);
    setChatMessages((prev) => {
      const next = [...prev, msg];
      return next.length > 60 ? next.slice(next.length - 60) : next;
    });
  }, []);

  const buildWaveMissionPreview = useCallback(
    (waveSeed: number, waveCount: number, squadLabel: string): WaveMissionState => {
      const wavePreview = generateRandomSurfaceWave(waveSeed, waveCount);
      let quizTotal = 0;
      let combatTotal = 0;
      for (const g of wavePreview.summary) {
        quizTotal += g.quizCount;
        combatTotal += g.combatCount;
      }
      return {
        seed: wavePreview.seed,
        squadName: squadLabel,
        total: wavePreview.count,
        defeated: 0,
        remaining: wavePreview.count,
        quizTotal,
        combatTotal,
        completed: false,
        monsterGroups: wavePreview.summary,
      };
    },
    [],
  );

  const enterMultiplayerMatch = useCallback(
    (room: MultiplayerRoomDoc, spawnIdx: number, isRejoin = false) => {
      if (getAlwaysFullscreenPref()) void requestAppFullscreen();
      setDifficultyPromptOpen(false);
      setActiveBattle(null);
      setActiveLearning(null);
      setActiveAcademySkill(null);
      setActiveCaveSeal(null);
      setCraftingOpen(false);
      setDialogueNpcId(null);
      setSideTab(null);
      setCloudSyncNote(null);
      setSyncStatus(null);
      setTeamStatsMap({});
      setDismissedVictorySeed(0);
      setIsMultiplayerPlaying(true);

      const waveSeed = room.waveSeed || generateRandomWaveSeed();
      const waveCount = room.waveCount || rollRandomWaveCount(waveSeed);
      const squadName = room.groupName || sanitizeGroupName(groupName, 'ELITE SQUAD');

      const engine = engineRef.current;
      if (engine) {
        engine.setLocalAppearance(characterId, playerName);
        engine.setMultiplayerActive(true, user?.uid);
        engine.setMultiplayerRole(room.hostUid === user?.uid, false);
        engine.setAwaitingRejoinSync(isRejoin);
        engine.startNewGame(hud.settings.aimMode, room.difficulty, {
          spawnMode: 'random',
          spawnIndex: spawnIdx,
          skipStory: true,
          characterId,
          playerName,
          waveSeed,
          waveCount,
          squadName,
        });
        if (!isRejoin) {
          engine.setPhase('paused');
        }
      }

      if (!isRejoin) {
        const myUid = user?.uid || 'local';
        const baseMembers: VsSquadMember[] =
          roomMembers.length > 0
            ? [...roomMembers]
                .sort((a, b) => (a.isHost === b.isHost ? a.spawnIndex - b.spawnIndex : a.isHost ? -1 : 1))
                .map((m) => ({
                  uid: m.uid,
                  displayName: m.displayName,
                  characterId: m.characterId,
                  isHost: m.isHost,
                  isMe: m.uid === myUid,
                }))
            : [
                {
                  uid: myUid,
                  displayName: playerName || 'Petualang',
                  characterId,
                  isHost: room.hostUid === myUid,
                  isMe: true,
                },
              ];
        setVsIntroData({
          squadName,
          isMultiplayer: true,
          members: baseMembers,
          wave: buildWaveMissionPreview(waveSeed, waveCount, squadName),
        });
      } else {
        setVsIntroData(null);
      }
    },
    [
      characterId,
      playerName,
      groupName,
      hud.settings.aimMode,
      user?.uid,
      roomMembers,
      buildWaveMissionPreview,
    ],
  );

  const applyMetaToRoomRef = useCallback((roomId: string, meta: RoomSquadMeta) => {
    const prev = roomMetaRef.current;
    const nextTs = meta.ts ?? 0;
    if (prev.roomId !== roomId) {
      roomMetaRef.current = {
        roomId,
        g: meta.g,
        ws: meta.ws,
        wc: meta.wc,
        ts: nextTs,
      };
      return;
    }
    const isNewerOrEqual = nextTs >= prev.ts || prev.ts === 0;
    roomMetaRef.current = {
      roomId,
      g: isNewerOrEqual ? (meta.g ?? prev.g) : (prev.g ?? meta.g),
      ws: isNewerOrEqual ? (meta.ws ?? prev.ws) : (prev.ws ?? meta.ws),
      wc: isNewerOrEqual ? (meta.wc ?? prev.wc) : (prev.wc ?? meta.wc),
      ts: Math.max(prev.ts, nextTs),
    };
  }, []);

  const mergeRoomWithCachedMeta = useCallback((room: MultiplayerRoomDoc): MultiplayerRoomDoc => {
    const cached = roomMetaRef.current;
    if (cached.roomId !== room.roomId) return room;
    return {
      ...room,
      groupName: room.groupName ?? cached.g,
      waveSeed: room.waveSeed ?? cached.ws,
      waveCount: room.waveCount ?? cached.wc,
    };
  }, []);

  const handleLeaveMultiplayerRoom = useCallback(
    async (returnToTitle = true) => {
      const roomId = activeRoom?.roomId;
      const activePeers = transportRef.current?.getActivePeerUids() ?? [];
      transportRef.current?.broadcastLeave(playerNameRef.current || 'Rekan Tim');
      transportRef.current?.dispose();
      transportRef.current = null;
      roomMetaRef.current = { roomId: '', ts: 0 };
      enteringPlayingRoomRef.current = null;
      setActiveRoom(null);
      setResumableRoom(null);
      setRoomMembers([]);
      setTeamStatsMap({});
      setVsIntroData(null);
      setIsMultiplayerPlaying(false);
      setMicEnabled(false);
      setMuteAllVoice(false);
      setLocalSpeaking(false);
      setVoiceChatError(null);
      setP2pStats({ connectedPeers: 0, totalPeers: 0 });
      setChatMessages([]);
      chatSeenIdsRef.current.clear();
      clearLastActiveRoomSession();

      engineRef.current?.setMultiplayerActive(false);
      if (returnToTitle) {
        engineRef.current?.setPhase('title');
      }

      if (roomId) {
        await leaveMultiplayerRoom(roomId, activePeers);
      }
    },
    [activeRoom?.roomId],
  );

  const activeRoomId = activeRoom?.roomId ?? null;
  const activeUid = user?.uid ?? null;

  // Detect active room session left open before refresh/unexpected exit
  useEffect(() => {
    if (!activeUid || !user?.emailVerified || activeRoomId) {
      if (!activeUid || !user?.emailVerified) {
        setResumableRoom(null);
      }
      return;
    }
    let cancelled = false;
    void checkSavedRoomMembership(activeUid).then((found) => {
      if (!cancelled) {
        setResumableRoom(found);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeUid, user?.emailVerified, activeRoomId]);

  // Bind Firestore room + member + fallback chat listeners & WebRTC P2P Mesh when joined
  useEffect(() => {
    if (!activeRoomId || !activeUid) {
      transportRef.current?.dispose();
      transportRef.current = null;
      return;
    }

    const transport = new P2pMeshTransport(activeRoomId, activeUid, {
      onRemotePlayersChange: (players) => {
        engineRef.current?.upsertRemotePlayers(players);
      },
      onChatMessage: (msg) => {
        appendChatMessage(msg);
        engineRef.current?.triggerRemoteChatBubble(msg.senderUid, msg.text);
      },
      onConnectionStats: (stats) => {
        setP2pStats(stats);
      },
      onLocalSpeakingChange: (speaking) => {
        setLocalSpeaking(speaking);
      },
      onWorldEvent: (fromUid, pkt) => {
        if (pkt.t === 'stats') {
          setTeamStatsMap((prev) => ({
            ...prev,
            [pkt.st.uid]: pkt.st,
          }));
          return;
        }
        engineRef.current?.handleMultiplayerPacket(fromUid, pkt, activeUid);
      },
      onPeerChannelOpen: (peerUid) => {
        const engine = engineRef.current;
        if (!engine) return;
        transport.broadcastState(engine.getLocalSyncPacket());
        const statsPkt = engine.getLocalStatsPacket(activeUid);
        transport.sendReliableToPeer(peerUid, statsPkt);
        if (engine.isAwaitingRejoinSync()) {
          transport.sendReliableToPeer(peerUid, { t: 'wreq' });
        } else if (engine.isMultiplayerWorldHost()) {
          transport.sendReliableToPeer(peerUid, engine.buildWorldSyncPacket());
        }
      },
      onPeerDeparted: ({ uid, displayName, reason }) => {
        const currentRoom = activeRoomRef.current;
        if (!currentRoom) return;
        const label = reason === 'left' ? 'keluar dari grup' : 'terputus & keluar dari arena';
        const bannerTxt = `🚪 ${displayName} ${label} (masih bisa gabung lagi selama room aktif)`;
        engineRef.current?.showGroupNotice(bannerTxt, 3.2);
        appendChatMessage({
          id: `sys_leave_${uid}_${Date.now()}`,
          roomId: currentRoom.roomId,
          senderUid: '__SYSTEM__',
          senderName: 'Sistem Grup',
          text: bannerTxt,
          createdAtMs: Date.now(),
          source: 'system',
        });

        if (currentRoom.hostUid === activeUid) {
          void pruneDisconnectedMember(currentRoom.roomId, uid);
        } else if (currentRoom.hostUid === uid) {
          const survivingActive = [activeUid, ...transport.getActivePeerUids()].sort();
          if (survivingActive[0] === activeUid) {
            void claimHostAndRemoveDeadHost(
              currentRoom.roomId,
              uid,
              playerNameRef.current || 'Host',
            ).then((claimed) => {
              if (claimed) {
                engineRef.current?.showGroupNotice(
                  '👑 Host sebelumnya keluar — kamu sekarang menjadi Host grup!',
                  3.0,
                );
              }
            });
          }
        }
      },
      onPeerJoined: ({ uid, displayName }) => {
        const currentRoom = activeRoomRef.current;
        if (!currentRoom) return;
        const bannerTxt = `👋 ${displayName} bergabung kembali ke grup!`;
        engineRef.current?.showGroupNotice(bannerTxt, 2.8);
        appendChatMessage({
          id: `sys_join_${uid}_${Date.now()}`,
          roomId: currentRoom.roomId,
          senderUid: '__SYSTEM__',
          senderName: 'Sistem Grup',
          text: bannerTxt,
          createdAtMs: Date.now(),
          source: 'system',
        });
      },
    });
    transportRef.current = transport;

    const unsubRoom = subscribeRoom(activeRoomId, (nextRoom) => {
      if (!nextRoom) {
        void handleLeaveMultiplayerRoom(true);
        return;
      }
      setActiveRoom(mergeRoomWithCachedMeta(nextRoom));
    });

    const unsubMembers = subscribeRoomMembers(activeRoomId, (members) => {
      setRoomMembers(members);
      transport.syncMembers(members);
      const activeSet = new Set(members.map((m) => m.uid));
      setTeamStatsMap((prev) => {
        let pruned = false;
        const next: Record<string, MultiplayerPlayerStats> = {};
        for (const [k, v] of Object.entries(prev)) {
          if (activeSet.has(k)) {
            next[k] = v;
          } else {
            pruned = true;
          }
        }
        return pruned ? next : prev;
      });
      const me = members.find((m) => m.uid === activeUid);
      if (me) {
        setMySpawnIndex(me.spawnIndex);
      }
    });

    const unsubFallbackChat = subscribeFallbackChatMessages(
      activeRoomId,
      (msg) => {
        appendChatMessage(msg);
        if (msg.senderUid !== activeUid) {
          transport.applyRemoteChatBubble(msg.senderUid, msg.text);
          engineRef.current?.triggerRemoteChatBubble(msg.senderUid, msg.text);
        }
      },
      (meta) => {
        applyMetaToRoomRef(activeRoomId, meta);
        if (meta.g) {
          setGroupName(meta.g);
        }
        setActiveRoom((prev) => {
          if (!prev || prev.roomId !== activeRoomId) return prev;
          const nextGroupName = roomMetaRef.current.g ?? prev.groupName;
          const nextWaveSeed = roomMetaRef.current.ws ?? prev.waveSeed;
          const nextWaveCount = roomMetaRef.current.wc ?? prev.waveCount;
          if (
            nextGroupName === prev.groupName &&
            nextWaveSeed === prev.waveSeed &&
            nextWaveCount === prev.waveCount
          ) {
            return prev;
          }
          return {
            ...prev,
            groupName: nextGroupName,
            waveSeed: nextWaveSeed,
            waveCount: nextWaveCount,
          };
        });
      },
    );

    return () => {
      unsubRoom();
      unsubMembers();
      unsubFallbackChat();
      transport.dispose();
      if (transportRef.current === transport) {
        transportRef.current = null;
      }
    };
  }, [
    activeRoomId,
    activeUid,
    appendChatMessage,
    applyMetaToRoomRef,
    handleLeaveMultiplayerRoom,
    mergeRoomWithCachedMeta,
  ]);

  // Auto-enter match when Host sets room status to 'playing' while player waits in lobby
  useEffect(() => {
    if (
      !activeRoom ||
      activeRoom.status !== 'playing' ||
      !difficultyPromptOpen ||
      isMultiplayerPlaying
    ) {
      return;
    }

    if (activeRoom.waveSeed && activeRoom.waveCount && activeRoom.groupName) {
      enterMultiplayerMatch(activeRoom, mySpawnIndex);
      return;
    }

    if (enteringPlayingRoomRef.current === activeRoom.roomId) return;
    enteringPlayingRoomRef.current = activeRoom.roomId;
    let cancelled = false;
    void readLatestRoomMeta(activeRoom.roomId)
      .then((meta) => {
        if (cancelled) return;
        applyMetaToRoomRef(activeRoom.roomId, meta);
        const fallbackSeed = meta.ws ?? activeRoom.waveSeed ?? generateRandomWaveSeed();
        const fallbackCount = meta.wc ?? activeRoom.waveCount ?? rollRandomWaveCount(fallbackSeed);
        const resolvedRoom: MultiplayerRoomDoc = {
          ...activeRoom,
          groupName: meta.g ?? activeRoom.groupName ?? sanitizeGroupName(groupName, 'ELITE SQUAD'),
          waveSeed: fallbackSeed,
          waveCount: fallbackCount,
        };
        if (resolvedRoom.groupName) setGroupName(resolvedRoom.groupName);
        setActiveRoom(resolvedRoom);
        enterMultiplayerMatch(resolvedRoom, mySpawnIndex);
      })
      .finally(() => {
        if (enteringPlayingRoomRef.current === activeRoom.roomId) {
          enteringPlayingRoomRef.current = null;
        }
      });

    return () => {
      cancelled = true;
      if (enteringPlayingRoomRef.current === activeRoom.roomId) {
        enteringPlayingRoomRef.current = null;
      }
    };
  }, [
    activeRoom,
    difficultyPromptOpen,
    isMultiplayerPlaying,
    mySpawnIndex,
    groupName,
    applyMetaToRoomRef,
    enterMultiplayerMatch,
  ]);

  // ~12 Hz P2P player state broadcast while active in multiplayer match (zero extra cost, smart idle throttling)
  useEffect(() => {
    if (!isMultiplayerPlaying || !activeRoomId) return;
    lastPacketSigRef.current = '';
    lastPacketSentAtRef.current = 0;

    const id = window.setInterval(() => {
      const engine = engineRef.current;
      const transport = transportRef.current;
      if (!engine || !transport || transport.getOpenChannelCount() === 0) return;

      const pkt = engine.getLocalSyncPacket();
      const sig = `${pkt.w}|${Math.round(pkt.x * 20)}|${Math.round(pkt.y * 20)}|${Math.round(pkt.z * 20)}|${Math.round(pkt.yaw * 20)}|${pkt.spd.toFixed(1)}|${pkt.og ? 1 : 0}|${pkt.sw ? 1 : 0}|${pkt.wp}|${pkt.wo ? 1 : 0}|${pkt.ch}`;
      const now = Date.now();
      if (sig !== lastPacketSigRef.current || now - lastPacketSentAtRef.current >= 850) {
        lastPacketSigRef.current = sig;
        lastPacketSentAtRef.current = now;
        transport.broadcastState(pkt);
      }
    }, 85);

    return () => window.clearInterval(id);
  }, [isMultiplayerPlaying, activeRoomId]);

  const isHostInRoom = Boolean(activeRoom && activeUid && activeRoom.hostUid === activeUid);

  // Instant P2P leave broadcast & best-effort room cleanup if player closes tab/browser
  useEffect(() => {
    if (!activeRoomId || !activeUid) return;
    const handleTabExit = () => {
      const transport = transportRef.current;
      const activePeers = transport?.getActivePeerUids() ?? [];
      transport?.broadcastLeave(playerNameRef.current || 'Rekan Tim');
      void leaveMultiplayerRoom(activeRoomId, activePeers);
    };
    window.addEventListener('pagehide', handleTabExit);
    return () => {
      window.removeEventListener('pagehide', handleTabExit);
    };
  }, [activeRoomId, activeUid]);

  // Keep room updatedAt fresh while Host is actively playing/waiting (every 3 minutes)
  useEffect(() => {
    if (!activeRoomId || !activeUid || !isHostInRoom) return;
    const id = window.setInterval(() => {
      void touchRoomHeartbeat(activeRoomId);
    }, 180_000);
    return () => window.clearInterval(id);
  }, [activeRoomId, activeUid, isHostInRoom]);

  // Sync authoritative Host/Client role into 3D engine (supports seamless Host Migration)
  useEffect(() => {
    engineRef.current?.setMultiplayerRole(isHostInRoom, p2pStats.connectedPeers > 0);
  }, [isHostInRoom, p2pStats.connectedPeers, isMultiplayerPlaying]);

  // Host world clock/wave/monster sync (~4 Hz movement + 1.8s authoritative clock snapshot) & 1 Hz Team Stats
  useEffect(() => {
    if (!isMultiplayerPlaying || !activeRoomId || !activeUid) return;

    const moveIntervalId = isHostInRoom
      ? window.setInterval(() => {
          const engine = engineRef.current;
          const transport = transportRef.current;
          if (
            !engine ||
            !transport ||
            transport.getOpenChannelCount() === 0 ||
            engine.isAwaitingRejoinSync()
          ) {
            return;
          }
          transport.sendReliableToAll(engine.buildMonsterMovePacket());
        }, 250)
      : null;

    const worldSyncIntervalId = isHostInRoom
      ? window.setInterval(() => {
          const engine = engineRef.current;
          const transport = transportRef.current;
          if (
            !engine ||
            !transport ||
            transport.getOpenChannelCount() === 0 ||
            engine.isAwaitingRejoinSync()
          ) {
            return;
          }
          transport.sendReliableToAll(engine.buildWorldSyncPacket());
        }, 1800)
      : null;

    const statsIntervalId = window.setInterval(() => {
      const engine = engineRef.current;
      if (!engine) return;
      const statsPkt = engine.getLocalStatsPacket(activeUid);
      if (statsPkt.t === 'stats') {
        setTeamStatsMap((prev) => ({
          ...prev,
          [statsPkt.st.uid]: statsPkt.st,
        }));
      }
      const transport = transportRef.current;
      if (transport && transport.getOpenChannelCount() > 0) {
        transport.sendReliableToAll(statsPkt);
      }
    }, 1000);

    return () => {
      if (moveIntervalId !== null) window.clearInterval(moveIntervalId);
      if (worldSyncIntervalId !== null) window.clearInterval(worldSyncIntervalId);
      window.clearInterval(statsIntervalId);
    };
  }, [isMultiplayerPlaying, activeRoomId, activeUid, isHostInRoom]);

  const handlePreviewCharacter = useCallback(
    (nextId: CharacterPresetId, nextName: string) => {
      setCharacterId(nextId);
      setPlayerName(nextName);
      saveCharacterId(nextId);
      if (nextName.trim()) savePlayerName(nextName);
      engineRef.current?.setLocalAppearance(nextId, nextName);
      if (activeRoom?.roomId) {
        void updateMyMemberProfile({
          roomId: activeRoom.roomId,
          displayName: nextName || 'Petualang',
          characterId: nextId,
        }).catch(() => undefined);
      }
    },
    [activeRoom?.roomId],
  );

  const handleStartNew = useCallback(() => {
    if (getAlwaysFullscreenPref()) void requestAppFullscreen();
    setPendingDifficulty(hud.settings.difficulty);
    setDifficultyPromptOpen(true);
    if (user?.uid && user?.emailVerified && !activeRoom) {
      void checkSavedRoomMembership(user.uid).then((found) => {
        setResumableRoom(found);
      });
    }
  }, [hud.settings.difficulty, user?.uid, user?.emailVerified, activeRoom]);

  const handleConfirmSolo = useCallback(
    (difficulty: DifficultyMode, spawnMode: SpawnPreference) => {
      if (getAlwaysFullscreenPref()) void requestAppFullscreen();
      if (activeRoom) {
        void handleLeaveMultiplayerRoom(false);
      } else if (resumableRoom) {
        const oldRoomId = resumableRoom.room.roomId;
        setResumableRoom(null);
        clearLastActiveRoomSession();
        void leaveMultiplayerRoom(oldRoomId);
      }
      setIsMultiplayerPlaying(false);
      setPendingDifficulty(difficulty);
      setDifficultyPromptOpen(false);
      setActiveBattle(null);
      setActiveLearning(null);
      setActiveAcademySkill(null);
      setActiveCaveSeal(null);
      setCraftingOpen(false);
      setDialogueNpcId(null);
      setSideTab(null);
      setCloudSyncNote(null);
      setSyncStatus(null);
      setDismissedVictorySeed(0);

      const cleanPlayer = (playerName || 'HOOT').trim() || 'HOOT';
      const firstToken = cleanPlayer.split(/\s+/)[0].toUpperCase();
      const soloSquadName = `${firstToken} SQUAD`;
      const waveSeed = generateRandomWaveSeed();
      const waveCount = rollRandomWaveCount(waveSeed);

      engineRef.current?.setLocalAppearance(characterId, playerName);
      engineRef.current?.setMultiplayerActive(false);
      engineRef.current?.startNewGame(hud.settings.aimMode, difficulty, {
        spawnMode,
        characterId,
        playerName,
        waveSeed,
        waveCount,
        squadName: soloSquadName,
      });

      setVsIntroData({
        squadName: soloSquadName,
        isMultiplayer: false,
        members: [
          {
            uid: user?.uid || 'solo',
            displayName: cleanPlayer,
            characterId,
            isHost: true,
            isMe: true,
          },
        ],
        wave: buildWaveMissionPreview(waveSeed, waveCount, soloSquadName),
      });
    },
    [
      activeRoom,
      resumableRoom,
      handleLeaveMultiplayerRoom,
      characterId,
      playerName,
      user?.uid,
      hud.settings.aimMode,
      buildWaveMissionPreview,
    ],
  );

  const handleRejoinRoom = useCallback(async () => {
    if (!resumableRoom) return;
    const res = await rejoinRoomById({
      roomId: resumableRoom.room.roomId,
      displayName: playerName,
      characterId,
    });
    setResumableRoom(null);
    setMySpawnIndex(res.spawnIndex);
    applyMetaToRoomRef(res.room.roomId, {
      g: res.room.groupName,
      ws: res.room.waveSeed,
      wc: res.room.waveCount,
      ts: Date.now(),
    });
    if (res.room.groupName) setGroupName(res.room.groupName);
    setActiveRoom(res.room);
    if (res.room.status === 'playing') {
      enterMultiplayerMatch(res.room, res.spawnIndex, true);
    }
  }, [resumableRoom, playerName, characterId, applyMetaToRoomRef, enterMultiplayerMatch]);

  const handleDismissResumableRoom = useCallback(async () => {
    const targetRoomId = resumableRoom?.room.roomId;
    setResumableRoom(null);
    clearLastActiveRoomSession();
    if (targetRoomId) {
      await leaveMultiplayerRoom(targetRoomId);
    }
  }, [resumableRoom]);

  const handleCreateGroupRoom = useCallback(
    async (difficulty: DifficultyMode, customGroupName: string) => {
      if (resumableRoom) {
        const oldRoomId = resumableRoom.room.roomId;
        setResumableRoom(null);
        await leaveMultiplayerRoom(oldRoomId);
      }
      const cleanGroup = sanitizeGroupName(customGroupName, groupName);
      setGroupName(cleanGroup);
      const res = await createGroupRoom({
        displayName: playerName,
        groupName: cleanGroup,
        characterId,
        difficulty,
      });
      setMySpawnIndex(res.spawnIndex);
      applyMetaToRoomRef(res.room.roomId, {
        g: res.room.groupName ?? cleanGroup,
        ws: res.room.waveSeed,
        wc: res.room.waveCount,
        ts: Date.now(),
      });
      setActiveRoom(res.room);
    },
    [playerName, groupName, characterId, resumableRoom, applyMetaToRoomRef],
  );

  const handleJoinGroupRoom = useCallback(
    async (code: string) => {
      const clean = normalizeRoomCode(code);
      if (resumableRoom && resumableRoom.room.code !== clean) {
        const oldRoomId = resumableRoom.room.roomId;
        setResumableRoom(null);
        await leaveMultiplayerRoom(oldRoomId);
      }
      const res = await joinRoomByCode({
        code,
        displayName: playerName,
        characterId,
      });
      setResumableRoom(null);
      setMySpawnIndex(res.spawnIndex);
      applyMetaToRoomRef(res.room.roomId, {
        g: res.room.groupName,
        ws: res.room.waveSeed,
        wc: res.room.waveCount,
        ts: Date.now(),
      });
      if (res.room.groupName) setGroupName(res.room.groupName);
      setActiveRoom(res.room);
    },
    [playerName, characterId, resumableRoom, applyMetaToRoomRef],
  );

  const handleJoinPublicRoom = useCallback(
    async (difficulty: DifficultyMode, customGroupName: string) => {
      if (resumableRoom && resumableRoom.room.mode !== 'public') {
        const oldRoomId = resumableRoom.room.roomId;
        setResumableRoom(null);
        await leaveMultiplayerRoom(oldRoomId);
      }
      const cleanGroup = sanitizeGroupName(customGroupName, groupName);
      setGroupName(cleanGroup);
      const res = await findOrCreatePublicRoom({
        displayName: playerName,
        groupName: cleanGroup,
        characterId,
        difficulty,
      });
      setResumableRoom(null);
      setMySpawnIndex(res.spawnIndex);
      applyMetaToRoomRef(res.room.roomId, {
        g: res.room.groupName ?? cleanGroup,
        ws: res.room.waveSeed,
        wc: res.room.waveCount,
        ts: Date.now(),
      });
      if (res.room.groupName) setGroupName(res.room.groupName);
      setActiveRoom(res.room);
    },
    [playerName, groupName, characterId, resumableRoom, applyMetaToRoomRef],
  );

  const handleUpdateRoomGroupName = useCallback(
    async (nextGroupName: string) => {
      if (!activeRoom) return;
      const cleaned = sanitizeGroupName(nextGroupName);
      setGroupName(cleaned);
      applyMetaToRoomRef(activeRoom.roomId, { g: cleaned, ts: Date.now() });
      setActiveRoom((prev) =>
        prev && prev.roomId === activeRoom.roomId ? { ...prev, groupName: cleaned } : prev,
      );
      await updateRoomGroupName(activeRoom.roomId, cleaned);
    },
    [activeRoom, applyMetaToRoomRef],
  );

  const handleStartMultiplayerMatch = useCallback(async () => {
    if (!activeRoom) return;
    const resolvedGroupName = sanitizeGroupName(
      activeRoom.groupName || roomMetaRef.current.g || groupName,
      'ELITE SQUAD',
    );
    const seed = activeRoom.waveSeed || roomMetaRef.current.ws || generateRandomWaveSeed();
    const count = activeRoom.waveCount || roomMetaRef.current.wc || rollRandomWaveCount(seed);
    const presetWave = {
      waveSeed: seed,
      waveCount: count,
      groupName: resolvedGroupName,
    };
    const wave = await startMultiplayerMatch(
      activeRoom.roomId,
      activeRoom.difficulty,
      presetWave,
    );
    applyMetaToRoomRef(activeRoom.roomId, {
      g: resolvedGroupName,
      ws: wave.waveSeed,
      wc: wave.waveCount,
      ts: Date.now(),
    });
    const startedRoom: MultiplayerRoomDoc = {
      ...activeRoom,
      status: 'playing',
      groupName: resolvedGroupName,
      waveSeed: wave.waveSeed,
      waveCount: wave.waveCount,
    };
    setActiveRoom(startedRoom);
    enterMultiplayerMatch(startedRoom, mySpawnIndex);
  }, [activeRoom, groupName, mySpawnIndex, applyMetaToRoomRef, enterMultiplayerMatch]);

  const handleSendChat = useCallback(
    (rawText: string) => {
      if (!activeRoom || !user) return;
      const clean = filterChatProfanity(rawText);
      if (!clean) return;
      const senderName = (playerName || user.displayName || 'Petualang').trim().slice(0, 24);
      const res = transportRef.current?.broadcastChat(senderName, clean);
      const localMsg: RoomChatMessage = {
        id: `local_${user.uid.slice(0, 6)}_${Date.now().toString(36)}`,
        roomId: activeRoom.roomId,
        senderUid: user.uid,
        senderName,
        text: clean,
        createdAtMs: Date.now(),
        source: res && res.sentP2pCount > 0 ? 'p2p' : 'firestore',
      };
      appendChatMessage(localMsg);
      engineRef.current?.voiceShowFeedback(`💬 ${senderName}: ${clean}`);

      // Firestore fallback ensures message delivery even before P2P DataChannel opens
      if (!res || res.sentP2pCount === 0) {
        void sendFallbackChatMessage({
          roomId: activeRoom.roomId,
          senderName,
          text: clean,
        }).catch(() => undefined);
      }
    },
    [activeRoom, user, playerName, appendChatMessage],
  );

  const handleToggleMabarMic = useCallback(async () => {
    const transport = transportRef.current;
    if (!transport) return;
    setVoiceChatError(null);
    const next = !micEnabled;
    try {
      const actual = await transport.setMicEnabled(next);
      setMicEnabled(actual);
    } catch (err) {
      setMicEnabled(false);
      setVoiceChatError(
        err instanceof Error ? err.message : 'Gagal mengakses mikrofon untuk Voice Chat.',
      );
      window.setTimeout(() => setVoiceChatError(null), 3500);
    }
  }, [micEnabled]);

  const handleToggleMuteAllVoice = useCallback(() => {
    const next = !muteAllVoice;
    setMuteAllVoice(next);
    transportRef.current?.setMuteAllPeers(next);
  }, [muteAllVoice]);

  const handleSignIn = useCallback(async (selectAccount = false) => {
    await signInWithGoogleAccount(selectAccount);
  }, []);

  const handleSignOut = useCallback(async () => {
    if (activeRoom) {
      await handleLeaveMultiplayerRoom(true);
    } else if (resumableRoom) {
      const oldRoomId = resumableRoom.room.roomId;
      setResumableRoom(null);
      clearLastActiveRoomSession();
      await leaveMultiplayerRoom(oldRoomId).catch(() => undefined);
    }
    setSideTab(null);
    setDifficultyPromptOpen(false);
    setLeaderboardOpen(false);
    setActiveBattle(null);
    setActiveLearning(null);
    setActiveAcademySkill(null);
    setActiveCaveSeal(null);
    setCraftingOpen(false);
    setDialogueNpcId(null);
    setIsMultiplayerPlaying(false);
    engineRef.current?.setMultiplayerActive(false);
    engineRef.current?.setPhase('title');
    await signOut(auth);
    setSyncStatus(null);
  }, [activeRoom, resumableRoom, handleLeaveMultiplayerRoom]);

  const handleManualSync = useCallback(async () => {
    if (!auth.currentUser) return;
    setSyncing(true);
    setSyncStatus(null);
    try {
      const questsDone = hud.quests.filter((q) => q.claimed).length;
      const { newPersonalBest } = await syncRunToCloud({
        score: hud.score,
        cityLevel: hud.level,
        landmarksCount: hud.wordsMastered,
        maxCombo: hud.maxStreak,
        questsCompleted: questsDone,
        districtTitle: hud.rankTitle,
      });
      setSyncStatus(
        newPersonalBest ? 'Rekor baru tersimpan di Papan Peringkat!' : 'Skor berhasil diperbarui.',
      );
      const profile = await loadUserProgress(auth.currentUser.uid);
      if (profile) setUserProfile(profile);
    } finally {
      setSyncing(false);
    }
  }, [hud]);

  const isAuthenticatedUser = Boolean(user && user.emailVerified);
  const waveVictoryOpen =
    !vsIntroData &&
    hud.phase === 'playing' &&
    Boolean(hud.waveMission?.completed) &&
    (hud.waveMission?.seed ?? 0) > 0 &&
    hud.waveMission?.seed !== dismissedVictorySeed;

  const currentSquadMembers: VsSquadMember[] =
    isMultiplayerPlaying && roomMembers.length > 0
      ? [...roomMembers]
          .sort((a, b) => (a.isHost === b.isHost ? a.spawnIndex - b.spawnIndex : a.isHost ? -1 : 1))
          .map((m) => ({
            uid: m.uid,
            displayName: m.displayName,
            characterId: m.characterId,
            isHost: m.isHost,
            isMe: m.uid === (user?.uid || ''),
          }))
      : [
          {
            uid: user?.uid || 'solo',
            displayName: playerName || 'Petualang',
            characterId,
            isHost: true,
            isMe: true,
          },
        ];

  const handleStartNewRandomWave = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;
    const waveSeed = generateRandomWaveSeed();
    const waveCount = rollRandomWaveCount(waveSeed);
    const activeSquadName =
      activeRoom?.groupName ||
      hud.waveMission?.squadName ||
      `${(playerName || 'HOOT').trim().split(/\s+/)[0].toUpperCase()} SQUAD`;
    if (isMultiplayerPlaying && activeRoom && isHostInRoom) {
      await startMultiplayerMatch(activeRoom.roomId, activeRoom.difficulty, {
        waveSeed,
        waveCount,
        groupName: activeSquadName,
      });
      applyMetaToRoomRef(activeRoom.roomId, {
        g: activeSquadName,
        ws: waveSeed,
        wc: waveCount,
        ts: Date.now(),
      });
      setActiveRoom((prev) =>
        prev && prev.roomId === activeRoom.roomId
          ? { ...prev, groupName: activeSquadName, waveSeed, waveCount }
          : prev,
      );
    }
    const nextWave = engine.startNewRandomMissionWave(waveSeed, waveCount, activeSquadName);
    setDismissedVictorySeed(0);
    if (isMultiplayerPlaying) {
      engine.setPhase('paused');
    }
    setVsIntroData({
      squadName: activeSquadName,
      isMultiplayer: isMultiplayerPlaying,
      members: currentSquadMembers,
      wave: nextWave,
    });
  }, [
    activeRoom,
    hud.waveMission?.squadName,
    playerName,
    isMultiplayerPlaying,
    isHostInRoom,
    currentSquadMembers,
    applyMetaToRoomRef,
  ]);

  return (
    <div className="relative h-[100dvh] w-[100dvw] overflow-hidden">
      {/* Isolated 100% 3D World Viewport */}
      <div ref={mountRef} className="absolute inset-0 h-full w-full" />

      {!showAssetDownloader && (!authChecked || !isAuthenticatedUser) && (
        <LoginGateScreen
          authChecked={authChecked}
          offlineVersion={offlineVersion}
          offlineReady={offlineReady}
          onSignIn={handleSignIn}
          onOpenOfflineSync={() => void runServerAndCacheCheck(true)}
        />
      )}

      {hud.phase === 'title' && authChecked && isAuthenticatedUser && (
        <TitleScreen
          hasSavedGame={hud.hasSavedGame}
          hasResumableRoom={Boolean(resumableRoom)}
          onContinue={handleContinue}
          onStartNew={handleStartNew}
          onPlayMenu={handleStartNew}
          onQuickLearn={(mode) => {
            if (getAlwaysFullscreenPref()) void requestAppFullscreen();
            engineRef.current?.startQuickLearning(mode);
          }}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
          onOpenGuide={() => setSideTab('guide')}
          bestLocalScore={bestLocalScore}
          user={user}
          onSignOut={handleSignOut}
          muted={muted}
          onToggleMute={handleToggleMute}
          disableShortcuts={
            showAssetDownloader ||
            difficultyPromptOpen ||
            leaderboardOpen ||
            Boolean(sideTab)
          }
          offlineReady={offlineReady}
          offlineVersion={offlineVersion}
          onOpenOfflineSync={() => void runServerAndCacheCheck(true)}
        />
      )}

      {(hud.phase === 'playing' ||
        hud.phase === 'story' ||
        hud.phase === 'battle' ||
        hud.phase === 'learning' ||
        hud.phase === 'dialogue' ||
        hud.phase === 'academy' ||
        hud.phase === 'paused' ||
        hud.phase === 'gameover') && (
        <RpgHud
          hud={hud}
          muted={muted}
          onToggleMute={handleToggleMute}
          onToggleCamera={() => engineRef.current?.toggleCameraMode()}
          onSelectHotbar={(slot) => engineRef.current?.selectHotbarSlot(slot)}
          onPause={() =>
            engineRef.current?.setPhase(hud.phase === 'paused' ? 'playing' : 'paused')
          }
          onOpenBag={() => setSideTab('bag')}
          onOpenKamus={() => setSideTab('kamus')}
          onOpenQuests={() => setSideTab('quests')}
          onOpenMap={() => setSideTab('map')}
          onOpenGuide={() => setSideTab('guide')}
          onOpenOptions={() => setSideTab('options')}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
          onPrimaryAction={() => engineRef.current?.triggerPrimaryAction()}
          onFireWeapon={() => engineRef.current?.fireActiveWeapon(false)}
          onSetFireHeld={(held) => engineRef.current?.setFireHeld(held)}
          onToggleAim={() => engineRef.current?.toggleAimMode()}
          onToggleAimMode={() => engineRef.current?.toggleAimModeSetting()}
          onSetSwimStyle={(style) => engineRef.current?.setSwimStylePreference(style)}
          onCycleSwimStyle={() => engineRef.current?.cycleSwimStyle()}
          onTogglePointerLock={() => engineRef.current?.togglePointerLock()}
          onJump={() => engineRef.current?.jumpHero()}
          onOpenCrafting={() => engineRef.current?.openCraftingTable()}
          onVirtualMove={(vx, vz) => engineRef.current?.setVirtualMove(vx, vz)}
          onExitDungeon={() => engineRef.current?.exitDungeon()}
          onEnterOcean={() => engineRef.current?.toggleDiveOcean()}
          onDiveOcean={() => engineRef.current?.toggleDiveOcean()}
          onGoToSwimSuit={() => engineRef.current?.walkToSwimSuit()}
          onOceanVertical={(dir, held) => engineRef.current?.setOceanVerticalInput(dir, held)}
          onToggleOceanTurtle={() => engineRef.current?.toggleOceanTurtleMount()}
          onCraftDivingGear={(gearId, method) => engineRef.current?.craftOrBuyDivingGear(gearId, method)}
          onEatOceanFood={() => engineRef.current?.eatOceanFood()}
          getLiveMapSnapshot={(kind) => engineRef.current?.getLiveMapSnapshot(kind) ?? null}
          voiceListening={voiceListening}
          voiceSupported={isVoiceCommandSupported()}
          voiceTranscript={voiceTranscript}
          voiceLastAction={voiceLastAction}
          onToggleVoice={handleToggleVoice}
          multiplayerActive={Boolean(activeRoom && isMultiplayerPlaying)}
          onHelpTeammate={() => engineRef.current?.helpNearbyTeammate()}
        />
      )}

      {activeRoom && isMultiplayerPlaying && hud.phase === 'playing' && (
        <MultiplayerHudOverlay
          room={activeRoom}
          members={roomMembers}
          myUid={user?.uid ?? null}
          connectedPeers={p2pStats.connectedPeers}
          messages={chatMessages}
          teamStats={Object.values(teamStatsMap)}
          micEnabled={micEnabled}
          localSpeaking={localSpeaking}
          muteAllVoice={muteAllVoice}
          voiceError={voiceChatError}
          onSendChat={handleSendChat}
          onToggleMic={() => void handleToggleMabarMic()}
          onToggleMuteAllVoice={handleToggleMuteAllVoice}
          onLeaveRoom={() => void handleLeaveMultiplayerRoom(true)}
        />
      )}

      <StoryOverlayModal
        story={hud.phase === 'story' && !vsIntroData ? hud.storyDialog : null}
        onAdvance={() => engineRef.current?.advanceStory()}
        onSkip={() => engineRef.current?.skipStory()}
        onDefeatChoice={(returnToZone) => engineRef.current?.resolveDefeatExitChoice(returnToZone)}
      />

      <LearningModeModal
        session={activeLearning}
        difficulty={hud.settings.difficulty}
        qtimerEnabled={hud.settings.qtimer}
        onRecordWord={(vocabId, ok, noLevel) =>
          engineRef.current?.recordWordAttempt(vocabId, ok, noLevel)
        }
        onComplete={(ctx, pct, xpEarned, cekPassed) => {
          setActiveLearning(null);
          engineRef.current?.completeLearningSession(ctx, pct, xpEarned, cekPassed);
        }}
        onClose={() => {
          setActiveLearning(null);
          engineRef.current?.setPhase(hud.phase === 'title' ? 'title' : 'playing');
        }}
      />

      <IeltsAcademyModal
        skill={activeAcademySkill}
        onCompleteSkill={(skill, pct) => engineRef.current?.recordIeltsScore(skill, pct)}
        onClose={() => {
          setActiveAcademySkill(null);
          engineRef.current?.setPhase('playing');
        }}
      />

      <CaveSealModal
        seal={activeCaveSeal}
        onResolve={(blockId, correct, vocabId) => {
          setActiveCaveSeal(null);
          engineRef.current?.resolveWordSeal(blockId, correct, vocabId);
        }}
        onClose={() => {
          setActiveCaveSeal(null);
          engineRef.current?.setPhase('playing');
        }}
      />

      <CaveCraftingModal
        open={craftingOpen}
        hud={hud}
        onCraft={(recipe) => engineRef.current?.craftCaveItem(recipe)}
        onClose={() => {
          setCraftingOpen(false);
          engineRef.current?.setPhase('playing');
        }}
      />

      <BattleQuizModal
        battle={activeBattle}
        characterId={characterId}
        playerName={playerName}
        playerHp={hud.hp}
        playerMaxHp={hud.maxHp}
        activeWeapon={hud.activeWeapon}
        hasWeapon={hud.ownedWeapons.length > 0}
        difficulty={hud.settings.difficulty}
        ownedRelics={hud.ownedRelics}
        wordProgress={hud.wordProgress}
        onUseHealHeart={() => engineRef.current?.healOneHeart()}
        onAnswerResult={(correct, vocabId, opts) =>
          engineRef.current?.applyBattleAnswer(correct, vocabId, opts)
        }
        onBattleEnd={(outcome, battle) => {
          setActiveBattle(null);
          engineRef.current?.finishBattle(outcome, battle);
        }}
      />

      <NpcDialogueModal
        npcId={dialogueNpcId}
        quests={hud.quests}
        wordProgress={hud.wordProgress}
        liberatedZones={hud.liberatedZones}
        areaDoorsCleared={hud.areaDoorsCleared}
        onClose={() => {
          setDialogueNpcId(null);
          engineRef.current?.setPhase('playing');
        }}
        onAcceptOrClaimQuest={(npcId) => engineRef.current?.acceptQuest(npcId)}
        onLearnVocab={(ids) => engineRef.current?.learnVocabFromNpc(ids)}
        onEnterDungeon={(zoneId, isMixedChallenge) => {
          setDialogueNpcId(null);
          engineRef.current?.enterZoneDungeon(zoneId, isMixedChallenge);
        }}
      />

      <RpgSideModals
        tab={sideTab}
        hud={hud}
        getLiveMapSnapshot={(kind) => engineRef.current?.getLiveMapSnapshot(kind) ?? null}
        onClose={() => setSideTab(null)}
        onOpenGuide={() => setSideTab('guide')}
        onEquipWeapon={(id) => engineRef.current?.equipWeapon(id)}
        onBuyAmmo={() => engineRef.current?.buyAmmoWithDiamonds()}
        onStartAmmoQuiz={() => engineRef.current?.startAmmoQuiz()}
        onStartQuickLearn={(mode, catId, zoneId) =>
          engineRef.current?.startQuickLearning(mode, catId, zoneId)
        }
        onTeleportZone={(zoneId) => engineRef.current?.teleportToZone(zoneId)}
        onEnterDungeon={(zoneId) => engineRef.current?.enterZoneDungeon(zoneId, false)}
        onEnterIelts={() => engineRef.current?.startIeltsTrial()}
        onExitDungeon={() => engineRef.current?.exitDungeon()}
        onWalkToSwimSuit={() => engineRef.current?.walkToSwimSuit()}
        onDiveOcean={() => engineRef.current?.toggleDiveOcean()}
        onUpdateSettings={(partial) => engineRef.current?.updateSettings(partial)}
        onOpenOfflineSync={() => void runServerAndCacheCheck(true)}
        user={user}
        onSignOut={handleSignOut}
      />

      {!vsIntroData && (
        <GameOverModal
          hud={hud}
          onResume={() => engineRef.current?.setPhase('playing')}
          onRestart={handleStartNew}
          onQuitToTitle={() => {
            if (activeRoom) {
              void handleLeaveMultiplayerRoom(true);
            } else {
              window.location.reload();
            }
          }}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
          cloudSyncNote={cloudSyncNote}
        />
      )}

      <VsMatchIntroModal
        open={Boolean(vsIntroData)}
        variant="intro"
        squadName={vsIntroData?.squadName || ''}
        isMultiplayer={Boolean(vsIntroData?.isMultiplayer)}
        members={vsIntroData?.members || []}
        wave={vsIntroData?.wave || null}
        onEnterBattle={() => {
          const wasMp = vsIntroData?.isMultiplayer;
          setVsIntroData(null);
          if (wasMp) {
            engineRef.current?.setPhase('playing');
          }
        }}
      />

      <VsMatchIntroModal
        open={waveVictoryOpen}
        variant="victory"
        squadName={hud.waveMission?.squadName || groupName}
        isMultiplayer={isMultiplayerPlaying}
        canStartNewWave={!isMultiplayerPlaying || isHostInRoom}
        members={currentSquadMembers}
        wave={hud.waveMission || null}
        onContinueWorld={() => {
          if (hud.waveMission?.seed) {
            setDismissedVictorySeed(hud.waveMission.seed);
          }
        }}
        onNewWave={() => void handleStartNewRandomWave()}
      />

      <PlayLobbyModal
        open={difficultyPromptOpen}
        user={user}
        initialDifficulty={pendingDifficulty}
        characterId={characterId}
        playerName={playerName}
        groupName={groupName}
        hasSavedGame={hud.hasSavedGame}
        resumableRoom={resumableRoom}
        activeRoom={activeRoom}
        roomMembers={roomMembers}
        mySpawnIndex={mySpawnIndex}
        onPreviewCharacter={handlePreviewCharacter}
        onChangeGroupName={setGroupName}
        onUpdateRoomGroupName={handleUpdateRoomGroupName}
        onSignIn={handleSignIn}
        onContinueSolo={handleContinue}
        onConfirmSolo={handleConfirmSolo}
        onRejoinRoom={handleRejoinRoom}
        onDismissResumableRoom={handleDismissResumableRoom}
        onCreateGroupRoom={handleCreateGroupRoom}
        onJoinGroupRoom={handleJoinGroupRoom}
        onJoinPublicRoom={handleJoinPublicRoom}
        onStartMultiplayerMatch={handleStartMultiplayerMatch}
        onEnterPlayingRoom={() => {
          if (activeRoom) enterMultiplayerMatch(mergeRoomWithCachedMeta(activeRoom), mySpawnIndex);
        }}
        onLeaveRoom={() => handleLeaveMultiplayerRoom(false)}
        onCancel={() => setDifficultyPromptOpen(false)}
      />

      <LeaderboardModal
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        entries={leaderboardEntries}
        loading={leaderboardLoading}
        user={user}
        userProfile={userProfile}
        currentRunScore={hud.score}
        onSignIn={handleSignIn}
        onManualSync={handleManualSync}
        syncing={syncing}
        syncStatus={syncStatus}
      />

      {isPortraitTouch && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f172a]/95 p-6 text-center text-white backdrop-blur-md">
          <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-amber-300/60 bg-amber-500/15 text-amber-300 shadow-xl">
            <Smartphone className="h-10 w-10 rotate-90" />
            <RotateCw className="absolute -right-2 -top-2 h-6 w-6 animate-spin rounded-full bg-slate-900 p-1 text-cyan-300 [animation-duration:3s]" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-amber-200">
            Wajib Posisi Landscape
          </h2>
          <p className="mt-2 max-w-xs text-xs font-medium leading-relaxed text-slate-300">
            Putar HP ke posisi mendatar (landscape), atau ketuk tombol di bawah untuk mengunci
            layar penuh otomatis dalam mode landscape.
          </p>
          <button
            type="button"
            onClick={() => {
              setAlwaysFullscreenPref(true);
              setLandscapeOnlyPref(true);
              void requestAppFullscreen(true);
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-[#14532d] bg-gradient-to-b from-[#4ade80] to-[#16a34a] px-6 py-3 text-sm font-black text-white shadow-[0_4px_0_#14532d] transition active:translate-y-0.5"
          >
            <RotateCw className="h-4 w-4" />
            <span>Aktifkan Landscape &amp; Layar Penuh</span>
          </button>
        </div>
      )}

      {showAssetDownloader && (
        <AssetDownloaderScreen
          syncState={syncState}
          isOnline={isOnline}
          pwaInstall={{
            isInstallable: pwaInstall.isInstallable,
            isInstalled: pwaInstall.isInstalled,
            isIOS: pwaInstall.isIOS,
            onInstall: async () => {
              const outcome = await pwaInstall.install();
              if (outcome === 'accepted') {
                setShowAssetDownloader(false);
              }
              return outcome;
            },
            onContinueInBrowser: () => {
              try {
                sessionStorage.setItem('diglosa_ios_install_prompted', '1');
              } catch {
                // ignore
              }
              setShowAssetDownloader(false);
            },
          }}
          onStartDownload={() => {
            const pending = pendingManifestRef.current;
            if (pending) {
              void executeOfflineDownload(
                pending.manifest,
                pending.missingAssets,
                pending.staleUrls,
                pending.isUpdate,
              );
            } else {
              void runServerAndCacheCheck(true);
            }
          }}
          onSkipOnline={() => {
            downloadAbortRef.current?.abort();
            setShowAssetDownloader(false);
          }}
          onRetry={() => void runServerAndCacheCheck(true)}
        />
      )}

      {!showAssetDownloader && <OfflineIndicator />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <DiglosaRpgApp />
    </ErrorBoundary>
  );
}
