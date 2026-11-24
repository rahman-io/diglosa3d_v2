import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import {
  CharacterPresetId,
  DifficultyMode,
  LocalPlayerSyncPacket,
  MultiplayerMemberDoc,
  MultiplayerPlayerStats,
  MultiplayerRoomDoc,
  P2pReliableMessage,
  RemotePlayerState,
  RoomChatMessage,
  WebRtcSignalDoc,
} from '../types/game';
import {
  generateRandomWaveSeed,
  rollRandomWaveCount,
} from '../three/waveGenerator';

const ROOMS_COLLECTION = 'rooms';
export const MAX_MULTIPLAYER_PLAYERS = 6;
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ACTIVE_ROOM_STORAGE_KEY = 'diglosa_active_room_v1';

interface StoredRoomSession {
  uid: string;
  roomId: string;
  code?: string;
  mode?: 'group' | 'public';
  savedAt: number;
}

function getTimestampMs(val: unknown): number {
  if (!val || typeof val !== 'object') return 0;
  const maybeTs = val as { toMillis?: () => number; seconds?: number };
  if (typeof maybeTs.toMillis === 'function') return maybeTs.toMillis();
  if (typeof maybeTs.seconds === 'number') return maybeTs.seconds * 1000;
  return 0;
}

export function saveLastActiveRoomSession(
  uid: string,
  roomId: string,
  code?: string,
  mode?: 'group' | 'public',
): void {
  try {
    const payload: StoredRoomSession = { uid, roomId, code, mode, savedAt: Date.now() };
    localStorage.setItem(ACTIVE_ROOM_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage quota/privacy errors
  }
}

export function clearLastActiveRoomSession(): void {
  try {
    localStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getLastActiveRoomSession(uid: string): string | null {
  try {
    const raw = localStorage.getItem(ACTIVE_ROOM_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredRoomSession>;
    if (!parsed || parsed.uid !== uid || typeof parsed.roomId !== 'string' || !parsed.roomId) {
      return null;
    }
    // Expire stale cached sessions older than 12 hours
    if (typeof parsed.savedAt === 'number' && Date.now() - parsed.savedAt > 12 * 60 * 60 * 1000) {
      localStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
      return null;
    }
    return parsed.roomId;
  } catch {
    return null;
  }
}

function sanitizeDisplayName(raw: string | null | undefined, fallback = 'Petualang'): string {
  const cleaned = (raw || fallback).trim().replace(/\s+/g, ' ');
  return (cleaned || fallback).slice(0, 40);
}

export function sanitizeGroupName(raw: string | null | undefined, fallback = 'ELITE SQUAD'): string {
  const cleaned = (raw || fallback).trim().replace(/\s+/g, ' ');
  const sliced = (cleaned || fallback).slice(0, 32);
  return sliced.length >= 2 ? sliced : fallback;
}

export function generateRoomCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
  }
  return code;
}

export function normalizeRoomCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
}

function pickDeterministicSpawnIndex(uid: string, offset = 0): number {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = (hash * 31 + uid.charCodeAt(i)) >>> 0;
  }
  return (hash + Math.max(0, offset)) % 8;
}

export interface JoinOrCreateRoomResult {
  room: MultiplayerRoomDoc;
  spawnIndex: number;
  isHost: boolean;
}

const ROOM_META_PREFIX = '__DIGLOSA_META__:';
const ROOM_META_DOC_ID = 'squad_meta';
const roomsCreatedMetaByMe = new Set<string>();
const roomsWithFallbackChatSent = new Set<string>();
const myFallbackChatDocIds = new Map<string, string[]>();
const roomsWithRelayEventsSent = new Set<string>();
const myRelayEventDocIds = new Map<string, string[]>();
const loggedLiveStateErrors = new Set<string>();

export interface RoomSquadMeta {
  g?: string;
  ws?: number;
  wc?: number;
  ts?: number;
}

function encodeRoomMetaText(meta: RoomSquadMeta): string {
  const payload: RoomSquadMeta = {};
  if (meta.g) payload.g = sanitizeGroupName(meta.g, 'ELITE SQUAD');
  if (typeof meta.ws === 'number' && Number.isFinite(meta.ws) && meta.ws > 0) {
    payload.ws = Math.floor(meta.ws);
  }
  if (typeof meta.wc === 'number' && Number.isFinite(meta.wc) && meta.wc >= 20 && meta.wc <= 50) {
    payload.wc = Math.floor(meta.wc);
  }
  payload.ts = typeof meta.ts === 'number' ? meta.ts : Date.now();
  return `${ROOM_META_PREFIX}${JSON.stringify(payload)}`.slice(0, 160);
}

export function parseRoomMetaText(text: string): RoomSquadMeta | null {
  if (!text.startsWith(ROOM_META_PREFIX)) return null;
  try {
    const raw = JSON.parse(text.slice(ROOM_META_PREFIX.length)) as RoomSquadMeta;
    if (!raw || typeof raw !== 'object') return null;
    return {
      g: typeof raw.g === 'string' && raw.g.trim().length >= 2 ? raw.g.trim().slice(0, 32) : undefined,
      ws: typeof raw.ws === 'number' && raw.ws > 0 ? Math.floor(raw.ws) : undefined,
      wc: typeof raw.wc === 'number' && raw.wc >= 20 && raw.wc <= 50 ? Math.floor(raw.wc) : undefined,
      ts: typeof raw.ts === 'number' ? raw.ts : 0,
    };
  } catch {
    return null;
  }
}

async function publishRoomMeta(
  roomId: string,
  meta: RoomSquadMeta,
  useFixedDocOnly = false,
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;
  const path = `${ROOMS_COLLECTION}/${roomId}/messages`;
  const cleanText = encodeRoomMetaText(meta);

  if (useFixedDocOnly || roomsCreatedMetaByMe.has(roomId)) {
    try {
      if (!useFixedDocOnly && roomsCreatedMetaByMe.has(roomId)) {
        await deleteDoc(doc(db, path, ROOM_META_DOC_ID)).catch(() => undefined);
      }
      await setDoc(doc(db, path, ROOM_META_DOC_ID), {
        roomId,
        senderUid: user.uid,
        senderName: '__SQUAD_META__',
        text: cleanText,
        createdAt: serverTimestamp(),
      });
      roomsCreatedMetaByMe.add(roomId);
      return;
    } catch {
      if (useFixedDocOnly) return;
    }
  }

  try {
    await addDoc(collection(db, path), {
      roomId,
      senderUid: user.uid,
      senderName: '__SQUAD_META__',
      text: cleanText,
      createdAt: serverTimestamp(),
    });
    roomsWithFallbackChatSent.add(roomId);
  } catch {
    // Best-effort live meta publish
  }
}

export async function readLatestRoomMeta(roomId: string): Promise<RoomSquadMeta> {
  const path = `${ROOMS_COLLECTION}/${roomId}/messages`;
  let best: RoomSquadMeta = {};

  // Fast path: 1 single getDoc on fixed squad_meta document
  try {
    const fixedSnap = await getDoc(doc(db, path, ROOM_META_DOC_ID));
    if (fixedSnap.exists()) {
      const txt = (fixedSnap.data() as { text?: string }).text;
      const parsed = txt ? parseRoomMetaText(txt) : null;
      if (parsed) {
        best = {
          g: parsed.g,
          ws: parsed.ws,
          wc: parsed.wc,
          ts: parsed.ts ?? 0,
        };
        if (best.g && best.ws && best.wc) {
          return best;
        }
      }
    }
  } catch {
    // ignore and fallback to recent messages query
  }

  let bestTs = best.ts ?? -1;
  try {
    const q = query(
      collection(db, path),
      where('roomId', '==', roomId),
      limit(15),
    );
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      const txt = (d.data() as { text?: string }).text;
      if (!txt) continue;
      const parsed = parseRoomMetaText(txt);
      if (!parsed) continue;
      const ts = parsed.ts ?? 0;
      if (ts >= bestTs) {
        best = {
          g: parsed.g ?? best.g,
          ws: parsed.ws ?? best.ws,
          wc: parsed.wc ?? best.wc,
          ts,
        };
        bestTs = ts;
      }
    }
  } catch {
    // ignore
  }

  return best;
}

export async function createGroupRoom(params: {
  displayName: string;
  groupName?: string;
  characterId: CharacterPresetId;
  difficulty: DifficultyMode;
}): Promise<JoinOrCreateRoomResult> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    throw new Error('Silakan masuk dengan akun Google terverifikasi terlebih dahulu.');
  }

  const hostName = sanitizeDisplayName(params.displayName, user.displayName || 'Host');
  const firstWord = hostName.split(' ')[0]?.toUpperCase() || 'ELITE';
  const groupName = sanitizeGroupName(params.groupName, `${firstWord} SQUAD`);
  const waveSeed = generateRandomWaveSeed();
  const waveCount = rollRandomWaveCount(waveSeed);
  const code = generateRoomCode(6);
  const roomId = code;
  const roomPath = `${ROOMS_COLLECTION}/${roomId}`;
  const memberPath = `${ROOMS_COLLECTION}/${roomId}/members/${user.uid}`;
  const spawnIndex = Math.floor(Math.random() * 8);

  const roomDocForDb: MultiplayerRoomDoc = {
    roomId,
    code,
    mode: 'group',
    status: 'waiting',
    hostUid: user.uid,
    hostName,
    difficulty: params.difficulty,
    maxPlayers: MAX_MULTIPLAYER_PLAYERS,
    memberCount: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, ROOMS_COLLECTION, roomId), roomDocForDb);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, roomPath);
  }

  const memberDoc: MultiplayerMemberDoc = {
    uid: user.uid,
    roomId,
    displayName: hostName,
    characterId: params.characterId,
    spawnIndex,
    isHost: true,
    online: true,
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, ROOMS_COLLECTION, roomId, 'members', user.uid), memberDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, memberPath);
  }

  await publishRoomMeta(
    roomId,
    { g: groupName, ws: waveSeed, wc: waveCount, ts: Date.now() },
    true,
  );

  saveLastActiveRoomSession(user.uid, roomId, code, 'group');
  return {
    room: { ...roomDocForDb, groupName, waveSeed, waveCount },
    spawnIndex,
    isHost: true,
  };
}

export async function joinRoomByCode(params: {
  code: string;
  displayName: string;
  characterId: CharacterPresetId;
}): Promise<JoinOrCreateRoomResult> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    throw new Error('Silakan masuk dengan akun Google terverifikasi terlebih dahulu.');
  }

  const cleanCode = normalizeRoomCode(params.code);
  if (cleanCode.length < 4) {
    throw new Error('Kode room minimal 4 karakter.');
  }

  const roomId = cleanCode;
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  const roomPath = `${ROOMS_COLLECTION}/${roomId}`;
  const memberRef = doc(db, ROOMS_COLLECTION, roomId, 'members', user.uid);
  const memberPath = `${ROOMS_COLLECTION}/${roomId}/members/${user.uid}`;
  const displayName = sanitizeDisplayName(params.displayName, user.displayName || 'Petualang');

  let alreadyMember: MultiplayerMemberDoc | null = null;
  try {
    const myMemberSnap = await getDoc(memberRef);
    if (myMemberSnap.exists()) {
      alreadyMember = myMemberSnap.data() as MultiplayerMemberDoc;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, memberPath);
  }

  let joinedRoom: MultiplayerRoomDoc | null = null;
  try {
    joinedRoom = await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) {
        throw new Error(`Room dengan kode "${cleanCode}" tidak ditemukan.`);
      }
      const data = snap.data() as MultiplayerRoomDoc;
      if (!alreadyMember && data.memberCount >= data.maxPlayers) {
        throw new Error(`Room sudah penuh (${data.memberCount}/${data.maxPlayers} pemain).`);
      }

      const nextCount = alreadyMember ? data.memberCount : data.memberCount + 1;
      if (!alreadyMember) {
        tx.update(roomRef, {
          memberCount: nextCount,
          updatedAt: serverTimestamp(),
        });
      }
      return {
        ...data,
        memberCount: nextCount,
      };
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('penuh') ||
        error.message.includes('ditutup') ||
        error.message.includes('tidak ditemukan'))
    ) {
      throw error;
    }
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }

  const spawnIndex = alreadyMember
    ? alreadyMember.spawnIndex
    : pickDeterministicSpawnIndex(user.uid, joinedRoom.memberCount);
  try {
    if (alreadyMember) {
      await updateDoc(memberRef, {
        displayName,
        characterId: params.characterId,
        spawnIndex,
        isHost: joinedRoom.hostUid === user.uid,
        online: true,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(memberRef, {
        uid: user.uid,
        roomId,
        displayName,
        characterId: params.characterId,
        spawnIndex,
        isHost: joinedRoom.hostUid === user.uid,
        online: true,
        joinedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, memberPath);
  }

  const roomMeta = await readLatestRoomMeta(roomId);
  saveLastActiveRoomSession(user.uid, roomId, joinedRoom.code, joinedRoom.mode);
  return {
    room: {
      ...joinedRoom,
      groupName: roomMeta.g ?? joinedRoom.groupName,
      waveSeed: roomMeta.ws ?? joinedRoom.waveSeed,
      waveCount: roomMeta.wc ?? joinedRoom.waveCount,
    },
    spawnIndex,
    isHost: joinedRoom.hostUid === user.uid,
  };
}

export async function findOrCreatePublicRoom(params: {
  displayName: string;
  groupName?: string;
  characterId: CharacterPresetId;
  difficulty: DifficultyMode;
}): Promise<JoinOrCreateRoomResult> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    throw new Error('Silakan masuk dengan akun Google terverifikasi terlebih dahulu.');
  }

  const displayName = sanitizeDisplayName(params.displayName, user.displayName || 'Petualang');
  const path = ROOMS_COLLECTION;

  let candidates: MultiplayerRoomDoc[] = [];
  try {
    const q = query(
      collection(db, ROOMS_COLLECTION),
      where('mode', '==', 'public'),
      where('status', 'in', ['waiting', 'playing']),
      limit(6),
    );
    const snap = await getDocs(q);
    const nowMs = Date.now();
    candidates = snap.docs
      .map((d) => d.data() as MultiplayerRoomDoc)
      .filter((r) => {
        if (r.memberCount <= 0 || r.memberCount >= r.maxPlayers) return false;
        const updatedMs = getTimestampMs(r.updatedAt);
        // Ignore stale abandoned public rooms (>25 mins without host heartbeat/update)
        if (updatedMs > 0 && nowMs - updatedMs > 25 * 60 * 1000) return false;
        return true;
      });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }

  // Prefer rooms that already have players waiting/playing so players match together
  candidates.sort((a, b) => b.memberCount - a.memberCount);

  for (const cand of candidates) {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, cand.roomId);
      const memberRef = doc(db, ROOMS_COLLECTION, cand.roomId, 'members', user.uid);
      const myMemberSnap = await getDoc(memberRef);
      const already = myMemberSnap.exists()
        ? (myMemberSnap.data() as MultiplayerMemberDoc)
        : null;

      const joined = await runTransaction(db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) return null;
        const latest = snap.data() as MultiplayerRoomDoc;
        if (!already && latest.memberCount >= latest.maxPlayers) return null;
        const nextCount = already ? latest.memberCount : latest.memberCount + 1;
        if (!already) {
          tx.update(roomRef, {
            memberCount: nextCount,
            updatedAt: serverTimestamp(),
          });
        }
        return { ...latest, memberCount: nextCount };
      });
      if (!joined) continue;

      const spawnIndex = already
        ? already.spawnIndex
        : pickDeterministicSpawnIndex(user.uid, joined.memberCount);
      if (already) {
        await updateDoc(memberRef, {
          displayName,
          characterId: params.characterId,
          spawnIndex,
          isHost: joined.hostUid === user.uid,
          online: true,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(memberRef, {
          uid: user.uid,
          roomId: cand.roomId,
          displayName,
          characterId: params.characterId,
          spawnIndex,
          isHost: joined.hostUid === user.uid,
          online: true,
          joinedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      const roomMeta = await readLatestRoomMeta(cand.roomId);
      saveLastActiveRoomSession(user.uid, cand.roomId, joined.code, 'public');
      return {
        room: {
          ...joined,
          groupName: roomMeta.g ?? joined.groupName,
          waveSeed: roomMeta.ws ?? joined.waveSeed,
          waveCount: roomMeta.wc ?? joined.waveCount,
        },
        spawnIndex,
        isHost: joined.hostUid === user.uid,
      };
    } catch {
      // Try next candidate room if race occurred
    }
  }

  // No open public room found -> create a new public room
  const code = generateRoomCode(6);
  const roomId = `PUB_${code}`;
  const roomPath = `${ROOMS_COLLECTION}/${roomId}`;
  const spawnIndex = Math.floor(Math.random() * 8);
  const groupName = sanitizeGroupName(params.groupName, `SKUAD ${code}`);
  const waveSeed = generateRandomWaveSeed();
  const waveCount = rollRandomWaveCount(waveSeed);

  const roomDocForDb: MultiplayerRoomDoc = {
    roomId,
    code,
    mode: 'public',
    status: 'waiting',
    hostUid: user.uid,
    hostName: displayName,
    difficulty: params.difficulty,
    maxPlayers: MAX_MULTIPLAYER_PLAYERS,
    memberCount: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, ROOMS_COLLECTION, roomId), roomDocForDb);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, roomPath);
  }

  const memberPath = `${ROOMS_COLLECTION}/${roomId}/members/${user.uid}`;
  try {
    await setDoc(doc(db, ROOMS_COLLECTION, roomId, 'members', user.uid), {
      uid: user.uid,
      roomId,
      displayName,
      characterId: params.characterId,
      spawnIndex,
      isHost: true,
      online: true,
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, memberPath);
  }

  await publishRoomMeta(
    roomId,
    { g: groupName, ws: waveSeed, wc: waveCount, ts: Date.now() },
    true,
  );

  saveLastActiveRoomSession(user.uid, roomId, code, 'public');
  return {
    room: { ...roomDocForDb, groupName, waveSeed, waveCount },
    spawnIndex,
    isHost: true,
  };
}

export async function updateMyMemberProfile(params: {
  roomId: string;
  displayName: string;
  characterId: CharacterPresetId;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;
  const memberPath = `${ROOMS_COLLECTION}/${params.roomId}/members/${user.uid}`;
  try {
    await updateDoc(doc(db, ROOMS_COLLECTION, params.roomId, 'members', user.uid), {
      displayName: sanitizeDisplayName(params.displayName, user.displayName || 'Petualang'),
      characterId: params.characterId,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, memberPath);
  }
}

export async function updateRoomGroupName(
  roomId: string,
  groupName: string,
): Promise<void> {
  const cleaned = sanitizeGroupName(groupName, 'ELITE SQUAD');
  await publishRoomMeta(roomId, { g: cleaned, ts: Date.now() }, false);
}

export async function startMultiplayerMatch(
  roomId: string,
  difficulty?: DifficultyMode,
  presetWave?: { waveSeed: number; waveCount: number; groupName?: string; skipMetaWrite?: boolean },
): Promise<{ waveSeed: number; waveCount: number }> {
  const waveSeed = presetWave?.waveSeed || generateRandomWaveSeed();
  const waveCount = presetWave?.waveCount || rollRandomWaveCount(waveSeed);
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return { waveSeed, waveCount };
  const roomPath = `${ROOMS_COLLECTION}/${roomId}`;
  if (!presetWave?.skipMetaWrite) {
    await publishRoomMeta(
      roomId,
      {
        g: presetWave?.groupName,
        ws: waveSeed,
        wc: waveCount,
        ts: Date.now(),
      },
      false,
    );
  }
  try {
    const payload: Record<string, unknown> = {
      status: 'playing',
      updatedAt: serverTimestamp(),
    };
    if (difficulty) {
      payload.difficulty = difficulty;
    }
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }
  return { waveSeed, waveCount };
}

export async function checkSavedRoomMembership(
  uid: string,
): Promise<JoinOrCreateRoomResult | null> {
  const savedRoomId = getLastActiveRoomSession(uid);
  if (!savedRoomId) return null;
  try {
    const roomSnap = await getDoc(doc(db, ROOMS_COLLECTION, savedRoomId));
    if (!roomSnap.exists()) {
      clearLastActiveRoomSession();
      return null;
    }
    const room = roomSnap.data() as MultiplayerRoomDoc;
    const memberSnap = await getDoc(doc(db, ROOMS_COLLECTION, savedRoomId, 'members', uid));
    if (!memberSnap.exists()) {
      // Slot might have been freed when player exited/disconnected; still allow rejoin if room has space
      if (room.memberCount >= room.maxPlayers) {
        clearLastActiveRoomSession();
        return null;
      }
      const roomMeta = await readLatestRoomMeta(savedRoomId);
      return {
        room: {
          ...room,
          groupName: roomMeta.g ?? room.groupName,
          waveSeed: roomMeta.ws ?? room.waveSeed,
          waveCount: roomMeta.wc ?? room.waveCount,
        },
        spawnIndex: Math.floor(Math.random() * 8),
        isHost: room.hostUid === uid,
      };
    }
    const member = memberSnap.data() as MultiplayerMemberDoc;
    const roomMeta = await readLatestRoomMeta(savedRoomId);
    return {
      room: {
        ...room,
        groupName: roomMeta.g ?? room.groupName,
        waveSeed: roomMeta.ws ?? room.waveSeed,
        waveCount: roomMeta.wc ?? room.waveCount,
      },
      spawnIndex: member.spawnIndex,
      isHost: room.hostUid === uid,
    };
  } catch {
    return null;
  }
}

export async function rejoinRoomById(params: {
  roomId: string;
  displayName: string;
  characterId: CharacterPresetId;
}): Promise<JoinOrCreateRoomResult> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    throw new Error('Silakan masuk dengan akun Google terverifikasi terlebih dahulu.');
  }

  const roomId = params.roomId.trim();
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  const roomPath = `${ROOMS_COLLECTION}/${roomId}`;
  const memberRef = doc(db, ROOMS_COLLECTION, roomId, 'members', user.uid);
  const memberPath = `${ROOMS_COLLECTION}/${roomId}/members/${user.uid}`;
  const displayName = sanitizeDisplayName(params.displayName, user.displayName || 'Petualang');

  let alreadyMember: MultiplayerMemberDoc | null = null;
  try {
    const myMemberSnap = await getDoc(memberRef);
    if (myMemberSnap.exists()) {
      alreadyMember = myMemberSnap.data() as MultiplayerMemberDoc;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, memberPath);
  }

  let joinedRoom: MultiplayerRoomDoc | null = null;
  try {
    joinedRoom = await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) {
        clearLastActiveRoomSession();
        throw new Error('Room sebelumnya sudah ditutup atau selesai.');
      }
      const data = snap.data() as MultiplayerRoomDoc;
      if (!alreadyMember && data.memberCount >= data.maxPlayers) {
        throw new Error(`Room sudah penuh (${data.memberCount}/${data.maxPlayers} pemain).`);
      }
      const nextCount = alreadyMember ? data.memberCount : data.memberCount + 1;
      if (!alreadyMember) {
        tx.update(roomRef, {
          memberCount: nextCount,
          updatedAt: serverTimestamp(),
        });
      }
      return {
        ...data,
        memberCount: nextCount,
      };
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('penuh') ||
        error.message.includes('ditutup') ||
        error.message.includes('selesai'))
    ) {
      throw error;
    }
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }

  const spawnIndex = alreadyMember
    ? alreadyMember.spawnIndex
    : pickDeterministicSpawnIndex(user.uid, joinedRoom.memberCount);
  try {
    if (alreadyMember) {
      await updateDoc(memberRef, {
        displayName,
        characterId: params.characterId,
        spawnIndex,
        isHost: joinedRoom.hostUid === user.uid,
        online: true,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(memberRef, {
        uid: user.uid,
        roomId,
        displayName,
        characterId: params.characterId,
        spawnIndex,
        isHost: joinedRoom.hostUid === user.uid,
        online: true,
        joinedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, memberPath);
  }

  const roomMeta = await readLatestRoomMeta(roomId);
  saveLastActiveRoomSession(user.uid, roomId, joinedRoom.code, joinedRoom.mode);
  return {
    room: {
      ...joinedRoom,
      groupName: roomMeta.g ?? joinedRoom.groupName,
      waveSeed: roomMeta.ws ?? joinedRoom.waveSeed,
      waveCount: roomMeta.wc ?? joinedRoom.waveCount,
    },
    spawnIndex,
    isHost: joinedRoom.hostUid === user.uid,
  };
}

async function deleteUserMessagesAndSignals(
  roomId: string,
  uid: string,
  keepRoomMeta = false,
): Promise<void> {
  // Clean up incoming signals targeted at me
  try {
    const sigSnap = await getDocs(
      query(
        collection(db, ROOMS_COLLECTION, roomId, 'signals'),
        where('roomId', '==', roomId),
        where('toUid', '==', uid),
        limit(15),
      ),
    );
    await Promise.all(sigSnap.docs.map((d) => deleteDoc(d.ref).catch(() => undefined)));
  } catch {
    // ignore
  }

  const hadOwnMeta = !keepRoomMeta && roomsCreatedMetaByMe.has(roomId);
  const hadFallbackMessages = roomsWithFallbackChatSent.has(roomId);
  const hadRelayEvents = roomsWithRelayEventsSent.has(roomId);
  roomsCreatedMetaByMe.delete(roomId);
  roomsWithFallbackChatSent.delete(roomId);
  myFallbackChatDocIds.delete(roomId);
  roomsWithRelayEventsSent.delete(roomId);
  myRelayEventDocIds.delete(roomId);

  if (hadOwnMeta) {
    await deleteDoc(doc(db, ROOMS_COLLECTION, roomId, 'messages', ROOM_META_DOC_ID)).catch(
      () => undefined,
    );
  }

  if (hadRelayEvents) {
    try {
      const evSnap = await getDocs(
        query(
          collection(db, ROOMS_COLLECTION, roomId, 'events'),
          where('roomId', '==', roomId),
          limit(20),
        ),
      );
      const myEvs = evSnap.docs.filter((d) => (d.data() as { fromUid?: string }).fromUid === uid);
      await Promise.all(myEvs.map((d) => deleteDoc(d.ref).catch(() => undefined)));
    } catch {
      // ignore
    }
  }

  // Only query messages subcollection if this user actually sent fallback chat/meta docs in this room
  if (!hadFallbackMessages) return;

  try {
    const msgSnap = await getDocs(
      query(
        collection(db, ROOMS_COLLECTION, roomId, 'messages'),
        where('roomId', '==', roomId),
        limit(15),
      ),
    );
    const toDelete = msgSnap.docs.filter((d) => {
      const data = d.data() as { senderUid?: string; text?: string };
      if (data.senderUid !== uid) return false;
      if (keepRoomMeta && typeof data.text === 'string' && data.text.startsWith(ROOM_META_PREFIX)) {
        return false;
      }
      return true;
    });
    await Promise.all(toDelete.map((d) => deleteDoc(d.ref).catch(() => undefined)));
  } catch {
    // ignore
  }
}

export async function pruneDisconnectedMember(
  roomId: string,
  targetUid: string,
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified || targetUid === user.uid) return;
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  try {
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;
    const roomData = roomSnap.data() as MultiplayerRoomDoc;
    if (roomData.hostUid !== user.uid) return;

    await deleteDoc(doc(db, ROOMS_COLLECTION, roomId, 'members', targetUid)).catch(() => undefined);
    await deleteDoc(doc(db, ROOMS_COLLECTION, roomId, 'states', targetUid)).catch(() => undefined);

    const remainingSnap = await getDocs(
      query(
        collection(db, ROOMS_COLLECTION, roomId, 'members'),
        where('roomId', '==', roomId),
        limit(10),
      ),
    );
    const actualCount = Math.max(1, remainingSnap.docs.length);
    if (actualCount !== roomData.memberCount) {
      await updateDoc(roomRef, {
        memberCount: actualCount,
        updatedAt: serverTimestamp(),
      });
    }
  } catch {
    // Best-effort cleanup
  }
}

export async function claimHostAndRemoveDeadHost(
  roomId: string,
  deadHostUid: string,
  myDisplayName: string,
): Promise<boolean> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified || deadHostUid === user.uid) return false;
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  const hostName = sanitizeDisplayName(myDisplayName, user.displayName || 'Host');
  try {
    const claimed = await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return false;
      const data = snap.data() as MultiplayerRoomDoc;
      if (data.hostUid !== deadHostUid) return false;
      if (data.memberCount < 2) return false;
      tx.update(roomRef, {
        hostUid: user.uid,
        hostName,
        memberCount: data.memberCount - 1,
        updatedAt: serverTimestamp(),
      });
      return true;
    });
    if (!claimed) return false;

    await deleteDoc(doc(db, ROOMS_COLLECTION, roomId, 'members', deadHostUid)).catch(() => undefined);
    await deleteDoc(doc(db, ROOMS_COLLECTION, roomId, 'states', deadHostUid)).catch(() => undefined);
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId, 'members', user.uid), {
      isHost: true,
      updatedAt: serverTimestamp(),
    }).catch(() => undefined);
    return true;
  } catch {
    return false;
  }
}

export async function touchRoomHeartbeat(roomId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;
  try {
    await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Ignore non-host / teardown errors
  }
}

export async function leaveMultiplayerRoom(
  roomId: string,
  activePeerUids?: string[],
): Promise<void> {
  clearLastActiveRoomSession();
  const user = auth.currentUser;
  if (!user) return;

  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  const myMemberRef = doc(db, ROOMS_COLLECTION, roomId, 'members', user.uid);
  const myStateRef = doc(db, ROOMS_COLLECTION, roomId, 'states', user.uid);

  // Clean up my member & state docs first (ignore if already removed)
  try {
    await Promise.all([
      deleteDoc(myMemberRef).catch(() => undefined),
      deleteDoc(myStateRef).catch(() => undefined),
    ]);
  } catch {
    // ignore
  }

  try {
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) {
      await deleteUserMessagesAndSignals(roomId, user.uid, false);
      return;
    }
    const roomData = roomSnap.data() as MultiplayerRoomDoc;

    const remainingSnap = await getDocs(
      query(
        collection(db, ROOMS_COLLECTION, roomId, 'members'),
        where('roomId', '==', roomId),
        limit(10),
      ),
    );
    const remaining = remainingSnap.docs
      .map((d) => d.data() as MultiplayerMemberDoc)
      .filter((m) => m.uid !== user.uid);

    const activePeerSet = Array.isArray(activePeerUids) ? new Set(activePeerUids) : null;

    if (remaining.length === 0) {
      // No remaining members in Firestore -> close and clean up the empty room
      await deleteUserMessagesAndSignals(roomId, user.uid, false);
      if (roomData.hostUid === user.uid) {
        await deleteDoc(roomRef).catch(() => undefined);
      } else if (roomData.memberCount >= 2) {
        try {
          const claimed = await runTransaction(db, async (tx) => {
            const snap = await tx.get(roomRef);
            if (!snap.exists()) return false;
            const latest = snap.data() as MultiplayerRoomDoc;
            if (latest.memberCount < 2) return false;
            tx.update(roomRef, {
              hostUid: user.uid,
              hostName: sanitizeDisplayName(user.displayName, 'Host'),
              memberCount: latest.memberCount - 1,
              updatedAt: serverTimestamp(),
            });
            return true;
          });
          if (claimed) {
            await deleteDoc(roomRef).catch(() => undefined);
          }
        } catch {
          // ignore
        }
      }
      return;
    }

    if (roomData.hostUid === user.uid) {
      // Migrate Host cleanly to a remaining member (prefer P2P-active peer, otherwise any Cloud Relay member)
      await deleteUserMessagesAndSignals(roomId, user.uid, true);
      const nextHost =
        (activePeerSet ? remaining.find((m) => activePeerSet.has(m.uid)) : undefined) ?? remaining[0];
      const nextCount = Math.max(1, remaining.length);
      await updateDoc(roomRef, {
        hostUid: nextHost.uid,
        hostName: sanitizeDisplayName(nextHost.displayName, 'Host'),
        memberCount: nextCount,
        updatedAt: serverTimestamp(),
      });
    } else {
      await deleteUserMessagesAndSignals(roomId, user.uid, false);
      const nextCount = Math.max(1, remaining.length);
      await updateDoc(roomRef, {
        memberCount: nextCount,
        updatedAt: serverTimestamp(),
      });
    }
  } catch {
    // Best-effort cleanup on leave
  }
}

export function subscribeRoom(
  roomId: string,
  onData: (room: MultiplayerRoomDoc | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = `${ROOMS_COLLECTION}/${roomId}`;
  return onSnapshot(
    doc(db, ROOMS_COLLECTION, roomId),
    (snap) => {
      onData(snap.exists() ? (snap.data() as MultiplayerRoomDoc) : null);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    },
  );
}

export function subscribeRoomMembers(
  roomId: string,
  onData: (members: MultiplayerMemberDoc[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = `${ROOMS_COLLECTION}/${roomId}/members`;
  const q = query(collection(db, path), where('roomId', '==', roomId), limit(10));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as MultiplayerMemberDoc);
      list.sort((a, b) => (a.isHost === b.isHost ? a.uid.localeCompare(b.uid) : a.isHost ? -1 : 1));
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) onError(wrapped);
      }
    },
  );
}

export async function sendWebRtcSignal(params: {
  roomId: string;
  toUid: string;
  kind: 'offer' | 'answer' | 'ice';
  payload: string;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;
  const path = `${ROOMS_COLLECTION}/${params.roomId}/signals`;
  try {
    await addDoc(collection(db, path), {
      roomId: params.roomId,
      fromUid: user.uid,
      toUid: params.toUid,
      kind: params.kind,
      payload: params.payload.slice(0, 8190),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeIncomingSignals(
  roomId: string,
  myUid: string,
  onSignal: (signal: WebRtcSignalDoc) => void,
): Unsubscribe {
  const path = `${ROOMS_COLLECTION}/${roomId}/signals`;
  const q = query(
    collection(db, path),
    where('roomId', '==', roomId),
    where('toUid', '==', myUid),
    limit(40),
  );
  const seenIds = new Set<string>();
  return onSnapshot(
    q,
    (snap) => {
      snap.docChanges().forEach((chg) => {
        if (chg.type !== 'added') return;
        const id = chg.doc.id;
        if (seenIds.has(id)) return;
        seenIds.add(id);
        const data = chg.doc.data() as WebRtcSignalDoc;
        onSignal({ ...data, id });
        // Immediately delete ephemeral signaling doc after receipt
        void deleteDoc(chg.doc.ref).catch(() => undefined);
      });
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Ignore transient signal listener errors on room teardown
      }
    },
  );
}

export async function sendFallbackChatMessage(params: {
  roomId: string;
  senderName: string;
  text: string;
  msgId?: string;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;
  const cleanText = params.text.trim().slice(0, 160);
  if (!cleanText) return;
  const path = `${ROOMS_COLLECTION}/${params.roomId}/messages`;
  const payload = {
    roomId: params.roomId,
    senderUid: user.uid,
    senderName: sanitizeDisplayName(params.senderName, user.displayName || 'Petualang'),
    text: cleanText,
    createdAt: serverTimestamp(),
  };
  try {
    let writtenId: string;
    const validMsgId =
      params.msgId && /^[a-zA-Z0-9_-]{4,64}$/.test(params.msgId) ? params.msgId : null;
    if (validMsgId) {
      await setDoc(doc(db, path, validMsgId), payload);
      writtenId = validMsgId;
    } else {
      const docRef = await addDoc(collection(db, path), payload);
      writtenId = docRef.id;
    }
    roomsWithFallbackChatSent.add(params.roomId);
    const list = myFallbackChatDocIds.get(params.roomId) ?? [];
    list.push(writtenId);
    if (list.length > 6) {
      const oldestId = list.shift();
      if (oldestId) {
        void deleteDoc(doc(db, path, oldestId)).catch(() => undefined);
      }
    }
    myFallbackChatDocIds.set(params.roomId, list);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeFallbackChatMessages(
  roomId: string,
  onMessage: (msg: RoomChatMessage) => void,
  onRoomMeta?: (meta: RoomSquadMeta) => void,
): Unsubscribe {
  const path = `${ROOMS_COLLECTION}/${roomId}/messages`;
  // Use single-field where('roomId', '==', roomId) without orderBy to avoid requiring a custom composite index
  const q = query(
    collection(db, path),
    where('roomId', '==', roomId),
    limit(30),
  );
  const seen = new Set<string>();
  let initialized = false;
  return onSnapshot(
    q,
    (snap) => {
      const additions: Array<RoomChatMessage & { _sortTs: number }> = [];
      const metaAdditions: Array<RoomSquadMeta & { _sortTs: number }> = [];
      snap.docChanges().forEach((chg) => {
        if (chg.type !== 'added') return;
        if (seen.has(chg.doc.id)) return;
        seen.add(chg.doc.id);
        const d = chg.doc.data() as {
          roomId: string;
          senderUid: string;
          senderName: string;
          text: string;
          createdAt?: unknown;
        };
        const sortTs = getTimestampMs(d.createdAt) || Date.now();
        const parsedMeta = parseRoomMetaText(d.text);
        if (parsedMeta) {
          metaAdditions.push({ ...parsedMeta, _sortTs: parsedMeta.ts ?? sortTs });
          return;
        }
        additions.push({
          id: chg.doc.id,
          roomId: d.roomId,
          senderUid: d.senderUid,
          senderName: d.senderName,
          text: d.text,
          createdAtMs: sortTs,
          source: 'firestore',
          _sortTs: sortTs,
        });
      });
      if (metaAdditions.length > 1) {
        metaAdditions.sort((a, b) => a._sortTs - b._sortTs);
      }
      if (additions.length > 1) {
        additions.sort((a, b) => a._sortTs - b._sortTs);
      }
      if (!initialized) {
        initialized = true;
      }
      metaAdditions.forEach(({ _sortTs: _ignored, ...m }) => onRoomMeta?.(m));
      additions.forEach(({ _sortTs: _ignored, ...msg }) => onMessage(msg));
    },
    () => {
      // Ignore fallback chat listener teardown errors
    },
  );
}

function clampNum(val: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(val)) return fallback;
  return Math.min(max, Math.max(min, val));
}

export async function publishPlayerLiveState(
  roomId: string,
  pkt: LocalPlayerSyncPacket,
  stats?: MultiplayerPlayerStats,
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified || !roomId) return;
  const worldMode =
    pkt.w === 'dungeon' || pkt.w === 'academy' || pkt.w === 'ocean' ? pkt.w : 'overworld';
  const payload: Record<string, unknown> = {
    uid: user.uid,
    roomId,
    displayName: sanitizeDisplayName(pkt.nm, user.displayName || 'Petualang'),
    characterId: (pkt.ch || 'hoot_emerald').slice(0, 40),
    worldMode,
    x: Math.round(clampNum(pkt.x, -1000, 1000, -6) * 100) / 100,
    y: Math.round(clampNum(pkt.y, -200, 500, 2.6) * 100) / 100,
    z: Math.round(clampNum(pkt.z, -1000, 1000, 126) * 100) / 100,
    yaw: Math.round(clampNum(pkt.yaw, -100, 100, 0) * 1000) / 1000,
    spd: Math.round(clampNum(pkt.spd, 0, 120, 0) * 100) / 100,
    og: Boolean(pkt.og),
    sw: Boolean(pkt.sw),
    wp: (pkt.wp || 'ketapel').slice(0, 32),
    wo: Boolean(pkt.wo),
    hp: Math.round(clampNum(pkt.hp ?? 5, 0, 20, 5)),
    mhp: Math.round(clampNum(pkt.mhp ?? 5, 1, 20, 5)),
    ic: Boolean(pkt.ic),
    zn: (pkt.zn || 'Desa Sapaan').slice(0, 60),
    updatedAt: serverTimestamp(),
  };

  if (stats) {
    payload.kl = Math.round(clampNum(stats.kills, 0, 100000, 0));
    payload.as = Math.round(clampNum(stats.assists, 0, 100000, 0));
    payload.hl = Math.round(clampNum(stats.helps, 0, 100000, 0));
    payload.chc = Math.round(clampNum(stats.challenges, 0, 100000, 0));
    payload.zc = Math.round(clampNum(stats.zonesCleared, 0, 100, 0));
    payload.sc = Math.round(clampNum(stats.personalScore, 0, 99999999, 0));
  }

  try {
    await setDoc(doc(db, ROOMS_COLLECTION, roomId, 'states', user.uid), payload);
  } catch (error) {
    const errKey = `pub_${roomId}`;
    if (!loggedLiveStateErrors.has(errKey)) {
      loggedLiveStateErrors.add(errKey);
      console.warn('[Diglosa Relay] Failed publishing player live state:', error);
    }
  }
}

export function subscribePlayerLiveStates(
  roomId: string,
  myUid: string,
  onStates: (states: RemotePlayerState[]) => void,
  onStats?: (stats: MultiplayerPlayerStats[]) => void,
): Unsubscribe {
  const path = `${ROOMS_COLLECTION}/${roomId}/states`;
  const q = query(collection(db, path), where('roomId', '==', roomId), limit(10));
  return onSnapshot(
    q,
    (snap) => {
      const now = Date.now();
      const out: RemotePlayerState[] = [];
      const statsOut: MultiplayerPlayerStats[] = [];
      snap.docs.forEach((docSnap) => {
        const d = docSnap.data() as {
          uid?: string;
          displayName?: string;
          characterId?: string;
          worldMode?: RemotePlayerState['worldMode'];
          x?: number;
          y?: number;
          z?: number;
          yaw?: number;
          spd?: number;
          og?: boolean;
          sw?: boolean;
          wp?: RemotePlayerState['activeWeapon'];
          wo?: boolean;
          hp?: number;
          mhp?: number;
          ic?: boolean;
          zn?: string;
          kl?: number;
          as?: number;
          hl?: number;
          chc?: number;
          zc?: number;
          sc?: number;
          updatedAt?: unknown;
        };
        if (!d.uid || d.uid === myUid) return;
        const updatedAtMs = getTimestampMs(d.updatedAt);
        // Allow up to 10 minutes tolerance for device clock skew across continents
        if (updatedAtMs > 0 && now - updatedAtMs > 10 * 60 * 1000) return;

        const cleanName = (d.displayName || 'Teman').slice(0, 32);
        const charId = (d.characterId || 'hoot_emerald') as CharacterPresetId;
        const worldMode = d.worldMode || 'overworld';
        const hpVal = typeof d.hp === 'number' ? d.hp : 5;
        const mhpVal = typeof d.mhp === 'number' ? d.mhp : 5;
        const zoneLabel = typeof d.zn === 'string' && d.zn ? d.zn : 'Kepulauan';

        out.push({
          uid: d.uid,
          displayName: cleanName,
          characterId: charId,
          worldMode,
          x: typeof d.x === 'number' && Number.isFinite(d.x) ? d.x : -6,
          y: typeof d.y === 'number' && Number.isFinite(d.y) ? d.y : 2.6,
          z: typeof d.z === 'number' && Number.isFinite(d.z) ? d.z : 126,
          yaw: typeof d.yaw === 'number' && Number.isFinite(d.yaw) ? d.yaw : 0,
          speed: typeof d.spd === 'number' && Number.isFinite(d.spd) ? d.spd : 0,
          walkCycle: 0,
          onGround: Boolean(d.og),
          isSwimming: Boolean(d.sw),
          activeWeapon: d.wp || 'ketapel',
          weaponOwned: Boolean(d.wo),
          aimPitch: 0,
          hp: typeof d.hp === 'number' ? d.hp : undefined,
          maxHp: typeof d.mhp === 'number' ? d.mhp : undefined,
          inChallenge: typeof d.ic === 'boolean' ? d.ic : undefined,
          zoneName: zoneLabel,
          updatedAtMs: updatedAtMs || now,
        });

        statsOut.push({
          uid: d.uid,
          displayName: cleanName,
          characterId: charId,
          kills: typeof d.kl === 'number' ? d.kl : 0,
          assists: typeof d.as === 'number' ? d.as : 0,
          helps: typeof d.hl === 'number' ? d.hl : 0,
          challenges: typeof d.chc === 'number' ? d.chc : 0,
          zonesCleared: typeof d.zc === 'number' ? d.zc : 0,
          personalScore: typeof d.sc === 'number' ? d.sc : 0,
          hp: hpVal,
          maxHp: mhpVal,
          worldMode,
          zoneName: zoneLabel,
          inChallenge: Boolean(d.ic),
          updatedAtMs: updatedAtMs || now,
        });
      });
      onStates(out);
      onStats?.(statsOut);
    },
    (error) => {
      const errKey = `sub_${roomId}`;
      if (!loggedLiveStateErrors.has(errKey)) {
        loggedLiveStateErrors.add(errKey);
        console.warn('[Diglosa Relay] Live state listener error:', error);
      }
    },
  );
}

const RELAYABLE_EVENT_KINDS = new Set(['m_hit', 'm_kill', 'heal', 'prog', 'clock']);

export async function publishRoomRelayEvent(
  roomId: string,
  pkt: P2pReliableMessage,
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified || !roomId) return;
  if (!RELAYABLE_EVENT_KINDS.has(pkt.t)) return;

  const serialized = JSON.stringify(pkt);
  if (serialized.length < 2 || serialized.length > 4096) return;

  const path = `${ROOMS_COLLECTION}/${roomId}/events`;
  try {
    const docRef = await addDoc(collection(db, path), {
      roomId,
      fromUid: user.uid,
      kind: pkt.t,
      payload: serialized,
      createdAt: serverTimestamp(),
    });
    roomsWithRelayEventsSent.add(roomId);
    const list = myRelayEventDocIds.get(roomId) ?? [];
    list.push(docRef.id);
    if (list.length > 8) {
      const oldestId = list.shift();
      if (oldestId) {
        void deleteDoc(doc(db, path, oldestId)).catch(() => undefined);
      }
    }
    myRelayEventDocIds.set(roomId, list);
  } catch (error) {
    const errKey = `ev_pub_${roomId}`;
    if (!loggedLiveStateErrors.has(errKey)) {
      loggedLiveStateErrors.add(errKey);
      console.warn('[Diglosa Relay] Relay event publish error:', error);
    }
  }
}

export function subscribeRoomRelayEvents(
  roomId: string,
  myUid: string,
  onEvent: (fromUid: string, pkt: P2pReliableMessage) => void,
): Unsubscribe {
  const path = `${ROOMS_COLLECTION}/${roomId}/events`;
  const q = query(collection(db, path), where('roomId', '==', roomId), limit(30));
  const seen = new Set<string>();
  let initialized = false;
  return onSnapshot(
    q,
    (snap) => {
      const batch: Array<{ fromUid: string; pkt: P2pReliableMessage; ts: number }> = [];
      const now = Date.now();
      snap.docChanges().forEach((chg) => {
        if (chg.type !== 'added') return;
        if (seen.has(chg.doc.id)) return;
        seen.add(chg.doc.id);
        const d = chg.doc.data() as {
          fromUid?: string;
          kind?: string;
          payload?: string;
          createdAt?: unknown;
        };
        if (!d.fromUid || d.fromUid === myUid || !d.payload) return;
        const ts = getTimestampMs(d.createdAt) || now;
        if (!initialized && d.kind !== 'prog' && d.kind !== 'clock' && now - ts > 20_000) {
          return;
        }
        try {
          const parsed = JSON.parse(d.payload) as P2pReliableMessage;
          if (parsed && typeof parsed === 'object' && typeof parsed.t === 'string') {
            batch.push({ fromUid: d.fromUid, pkt: parsed, ts });
          }
        } catch {
          // ignore malformed event payload
        }
      });
      initialized = true;
      if (batch.length > 1) {
        batch.sort((a, b) => a.ts - b.ts);
      }
      batch.forEach((ev) => onEvent(ev.fromUid, ev.pkt));
    },
    (error) => {
      const errKey = `ev_sub_${roomId}`;
      if (!loggedLiveStateErrors.has(errKey)) {
        loggedLiveStateErrors.add(errKey);
        console.warn('[Diglosa Relay] Relay event listener error:', error);
      }
    },
  );
}
