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
  MultiplayerMemberDoc,
  MultiplayerRoomDoc,
  RoomChatMessage,
  WebRtcSignalDoc,
} from '../types/game';

const ROOMS_COLLECTION = 'rooms';
export const MAX_MULTIPLAYER_PLAYERS = 6;
const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ACTIVE_ROOM_STORAGE_KEY = 'diglosa_active_room_v1';

interface StoredRoomSession {
  uid: string;
  roomId: string;
  savedAt: number;
}

export function saveLastActiveRoomSession(uid: string, roomId: string): void {
  try {
    const payload: StoredRoomSession = { uid, roomId, savedAt: Date.now() };
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

function pickUnusedSpawnIndex(existingMembers: MultiplayerMemberDoc[]): number {
  const used = new Set(existingMembers.map((m) => m.spawnIndex));
  const free: number[] = [];
  for (let i = 0; i < 8; i++) {
    if (!used.has(i)) free.push(i);
  }
  if (free.length > 0) {
    return free[Math.floor(Math.random() * free.length)];
  }
  return Math.floor(Math.random() * 8);
}

export interface JoinOrCreateRoomResult {
  room: MultiplayerRoomDoc;
  spawnIndex: number;
  isHost: boolean;
}

export async function createGroupRoom(params: {
  displayName: string;
  characterId: CharacterPresetId;
  difficulty: DifficultyMode;
}): Promise<JoinOrCreateRoomResult> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    throw new Error('Silakan masuk dengan akun Google terverifikasi terlebih dahulu.');
  }

  const hostName = sanitizeDisplayName(params.displayName, user.displayName || 'Host');
  const code = generateRoomCode(6);
  const roomId = code;
  const roomPath = `${ROOMS_COLLECTION}/${roomId}`;
  const memberPath = `${ROOMS_COLLECTION}/${roomId}/members/${user.uid}`;
  const spawnIndex = Math.floor(Math.random() * 8);

  const roomDoc: MultiplayerRoomDoc = {
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
    await setDoc(doc(db, ROOMS_COLLECTION, roomId), roomDoc);
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

  saveLastActiveRoomSession(user.uid, roomId);
  return { room: roomDoc, spawnIndex, isHost: true };
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
  const displayName = sanitizeDisplayName(params.displayName, user.displayName || 'Petualang');

  let roomSnap;
  try {
    roomSnap = await getDoc(roomRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, roomPath);
  }

  if (!roomSnap.exists()) {
    throw new Error(`Room dengan kode "${cleanCode}" tidak ditemukan.`);
  }

  const existingMembersPath = `${ROOMS_COLLECTION}/${roomId}/members`;
  let existingMembers: MultiplayerMemberDoc[] = [];
  try {
    const mSnap = await getDocs(
      query(collection(db, existingMembersPath), where('roomId', '==', roomId), limit(10)),
    );
    existingMembers = mSnap.docs.map((d) => d.data() as MultiplayerMemberDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, existingMembersPath);
  }

  const alreadyMember = existingMembers.find((m) => m.uid === user.uid);
  const spawnIndex = alreadyMember
    ? alreadyMember.spawnIndex
    : pickUnusedSpawnIndex(existingMembers);

  let joinedRoom: MultiplayerRoomDoc | null = null;
  try {
    joinedRoom = await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) {
        throw new Error(`Room "${cleanCode}" sudah ditutup.`);
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
    if (error instanceof Error && (error.message.includes('penuh') || error.message.includes('ditutup'))) {
      throw error;
    }
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }

  const memberRef = doc(db, ROOMS_COLLECTION, roomId, 'members', user.uid);
  const memberPath = `${ROOMS_COLLECTION}/${roomId}/members/${user.uid}`;
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

  saveLastActiveRoomSession(user.uid, roomId);
  return {
    room: joinedRoom,
    spawnIndex,
    isHost: joinedRoom.hostUid === user.uid,
  };
}

export async function findOrCreatePublicRoom(params: {
  displayName: string;
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
      limit(20),
    );
    const snap = await getDocs(q);
    candidates = snap.docs
      .map((d) => d.data() as MultiplayerRoomDoc)
      .filter((r) => r.memberCount > 0 && r.memberCount < r.maxPlayers);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }

  // Prefer rooms that already have players waiting/playing so players match together
  candidates.sort((a, b) => b.memberCount - a.memberCount);

  for (const cand of candidates) {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, cand.roomId);
      const membersPath = `${ROOMS_COLLECTION}/${cand.roomId}/members`;
      const mSnap = await getDocs(
        query(collection(db, membersPath), where('roomId', '==', cand.roomId), limit(10)),
      );
      const existingMembers = mSnap.docs.map((d) => d.data() as MultiplayerMemberDoc);
      const already = existingMembers.find((m) => m.uid === user.uid);
      if (!already && existingMembers.length >= cand.maxPlayers) continue;

      const spawnIndex = already ? already.spawnIndex : pickUnusedSpawnIndex(existingMembers);
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

      const memberRef = doc(db, ROOMS_COLLECTION, cand.roomId, 'members', user.uid);
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
      saveLastActiveRoomSession(user.uid, cand.roomId);
      return {
        room: joined,
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

  const roomDoc: MultiplayerRoomDoc = {
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
    await setDoc(doc(db, ROOMS_COLLECTION, roomId), roomDoc);
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

  saveLastActiveRoomSession(user.uid, roomId);
  return { room: roomDoc, spawnIndex, isHost: true };
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

export async function startMultiplayerMatch(
  roomId: string,
  difficulty?: DifficultyMode,
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;
  const roomPath = `${ROOMS_COLLECTION}/${roomId}`;
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
      clearLastActiveRoomSession();
      return null;
    }
    const member = memberSnap.data() as MultiplayerMemberDoc;
    return {
      room,
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
  const displayName = sanitizeDisplayName(params.displayName, user.displayName || 'Petualang');

  let roomSnap;
  try {
    roomSnap = await getDoc(roomRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, roomPath);
  }

  if (!roomSnap.exists()) {
    clearLastActiveRoomSession();
    throw new Error('Room sebelumnya sudah ditutup atau selesai.');
  }

  const existingMembersPath = `${ROOMS_COLLECTION}/${roomId}/members`;
  let existingMembers: MultiplayerMemberDoc[] = [];
  try {
    const mSnap = await getDocs(
      query(collection(db, existingMembersPath), where('roomId', '==', roomId), limit(10)),
    );
    existingMembers = mSnap.docs.map((d) => d.data() as MultiplayerMemberDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, existingMembersPath);
  }

  const alreadyMember = existingMembers.find((m) => m.uid === user.uid);
  const spawnIndex = alreadyMember
    ? alreadyMember.spawnIndex
    : pickUnusedSpawnIndex(existingMembers);

  let joinedRoom: MultiplayerRoomDoc | null = null;
  try {
    joinedRoom = await runTransaction(db, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) {
        throw new Error('Room sebelumnya sudah ditutup.');
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
    if (error instanceof Error && (error.message.includes('penuh') || error.message.includes('ditutup'))) {
      throw error;
    }
    handleFirestoreError(error, OperationType.UPDATE, roomPath);
  }

  const memberRef = doc(db, ROOMS_COLLECTION, roomId, 'members', user.uid);
  const memberPath = `${ROOMS_COLLECTION}/${roomId}/members/${user.uid}`;
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

  saveLastActiveRoomSession(user.uid, roomId);
  return {
    room: joinedRoom,
    spawnIndex,
    isHost: joinedRoom.hostUid === user.uid,
  };
}

export async function leaveMultiplayerRoom(roomId: string): Promise<void> {
  clearLastActiveRoomSession();
  const user = auth.currentUser;
  if (!user) return;

  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  const myMemberRef = doc(db, ROOMS_COLLECTION, roomId, 'members', user.uid);

  // Clean up my member doc first (ignore if already removed)
  try {
    await deleteDoc(myMemberRef);
  } catch {
    // ignore
  }

  // Clean up any incoming signals targeted at me
  try {
    const q = query(
      collection(db, ROOMS_COLLECTION, roomId, 'signals'),
      where('roomId', '==', roomId),
      where('toUid', '==', user.uid),
      limit(40),
    );
    const sigSnap = await getDocs(q);
    await Promise.all(sigSnap.docs.map((d) => deleteDoc(d.ref).catch(() => undefined)));
  } catch {
    // ignore
  }

  try {
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;
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

    if (remaining.length === 0) {
      if (roomData.hostUid === user.uid) {
        await deleteDoc(roomRef).catch(() => undefined);
      }
      return;
    }

    const nextCount = Math.max(1, roomData.memberCount - 1);
    if (roomData.hostUid === user.uid) {
      // Pick deterministic next host
      const nextHost = remaining[0];
      await updateDoc(roomRef, {
        hostUid: nextHost.uid,
        hostName: sanitizeDisplayName(nextHost.displayName, 'Host'),
        memberCount: nextCount,
        updatedAt: serverTimestamp(),
      });
    } else {
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
}): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;
  const cleanText = params.text.trim().slice(0, 160);
  if (!cleanText) return;
  const path = `${ROOMS_COLLECTION}/${params.roomId}/messages`;
  try {
    await addDoc(collection(db, path), {
      roomId: params.roomId,
      senderUid: user.uid,
      senderName: sanitizeDisplayName(params.senderName, user.displayName || 'Petualang'),
      text: cleanText,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeFallbackChatMessages(
  roomId: string,
  onMessage: (msg: RoomChatMessage) => void,
): Unsubscribe {
  const path = `${ROOMS_COLLECTION}/${roomId}/messages`;
  const q = query(
    collection(db, path),
    where('roomId', '==', roomId),
    orderBy('createdAt', 'desc'),
    limit(20),
  );
  const seen = new Set<string>();
  let initialized = false;
  return onSnapshot(
    q,
    (snap) => {
      const additions: RoomChatMessage[] = [];
      snap.docChanges().forEach((chg) => {
        if (chg.type !== 'added') return;
        if (seen.has(chg.doc.id)) return;
        seen.add(chg.doc.id);
        const d = chg.doc.data() as {
          roomId: string;
          senderUid: string;
          senderName: string;
          text: string;
        };
        additions.push({
          id: chg.doc.id,
          roomId: d.roomId,
          senderUid: d.senderUid,
          senderName: d.senderName,
          text: d.text,
          createdAtMs: Date.now(),
          source: 'firestore',
        });
      });
      if (!initialized) {
        initialized = true;
        additions.reverse().forEach(onMessage);
      } else {
        additions.forEach(onMessage);
      }
    },
    () => {
      // Ignore fallback chat listener teardown errors
    },
  );
}
