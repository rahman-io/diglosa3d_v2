import type { SideModalTab } from '../components/RpgSideModals';
import type { VsSquadMember } from '../components/VsMatchIntroModal';
import type {
  CharacterPresetId,
  DifficultyMode,
  GamePhase,
  LearningSessionContext,
  PlayModeType,
  WaveMissionState,
} from '../types/game';

export type LobbyWizardStep = 'character' | 'mode';

export interface LobbyDraftState {
  wizardStep: LobbyWizardStep;
  playMode: PlayModeType;
  difficulty: DifficultyMode;
  joinCode: string;
}

export type ActiveSessionStageKind =
  | 'title'
  | 'lobby'
  | 'playing_solo'
  | 'playing_mp'
  | 'quick_learn';

export interface ActiveSessionSnapshot {
  version: 1;
  stage: ActiveSessionStageKind;
  phase: GamePhase;
  characterId: CharacterPresetId;
  playerName: string;
  groupName: string;
  lobbyOpen: boolean;
  lobbyDraft: LobbyDraftState;
  mpRoomId: string | null;
  sideTab: SideModalTab;
  leaderboardOpen: boolean;
  vsIntroData: {
    squadName: string;
    isMultiplayer: boolean;
    members: VsSquadMember[];
    wave: WaveMissionState;
  } | null;
  activeLearning: LearningSessionContext | null;
  updatedAt: number;
}

const SESSION_STAGE_KEY = 'diglosa_active_session_v1';

export function loadActiveSessionStage(): ActiveSessionSnapshot | null {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    const raw = window.sessionStorage.getItem(SESSION_STAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ActiveSessionSnapshot>;
    if (!parsed || parsed.version !== 1 || !parsed.stage) return null;
    return {
      version: 1,
      stage: parsed.stage,
      phase: parsed.phase ?? 'title',
      characterId: parsed.characterId ?? 'hoot_emerald',
      playerName: typeof parsed.playerName === 'string' ? parsed.playerName : '',
      groupName: typeof parsed.groupName === 'string' ? parsed.groupName : 'ELITE SQUAD',
      lobbyOpen: Boolean(parsed.lobbyOpen),
      lobbyDraft: {
        wizardStep:
          parsed.lobbyDraft?.wizardStep === 'character'
            ? 'character'
            : (parsed.lobbyDraft?.wizardStep as string) === 'name' ||
                parsed.lobbyDraft?.wizardStep === 'mode'
              ? 'mode'
              : 'character',
        playMode: parsed.lobbyDraft?.playMode ?? 'solo',
        difficulty: parsed.lobbyDraft?.difficulty ?? 'petualang',
        joinCode: typeof parsed.lobbyDraft?.joinCode === 'string' ? parsed.lobbyDraft.joinCode : '',
      },
      mpRoomId: typeof parsed.mpRoomId === 'string' ? parsed.mpRoomId : null,
      sideTab: parsed.sideTab ?? null,
      leaderboardOpen: Boolean(parsed.leaderboardOpen),
      vsIntroData: parsed.vsIntroData ?? null,
      activeLearning: parsed.activeLearning ?? null,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveActiveSessionStage(snapshot: ActiveSessionSnapshot): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    window.sessionStorage.setItem(SESSION_STAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore storage quota / privacy mode errors
  }
}

export function clearActiveSessionStage(): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    window.sessionStorage.removeItem(SESSION_STAGE_KEY);
  } catch {
    // ignore
  }
}
