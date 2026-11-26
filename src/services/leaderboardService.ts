import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { LeaderboardRecord, UserProfileRecord } from '../types/game';

const LEADERBOARD_COLLECTION = 'leaderboard';
const USERS_COLLECTION = 'users';

function clampInt(value: number, min: number, max: number): number {
  const rounded = Math.round(Number.isFinite(value) ? value : min);
  return Math.max(min, Math.min(max, rounded));
}

function sanitizeName(raw: string | null | undefined, fallback = 'Builder'): string {
  const cleaned = (raw || fallback).trim().replace(/\s+/g, ' ');
  return (cleaned || fallback).slice(0, 40);
}

export async function fetchPublicLeaderboard(): Promise<LeaderboardRecord[]> {
  const path = LEADERBOARD_COLLECTION;
  try {
    const q = query(
      collection(db, path),
      where('score', '>=', 0),
      orderBy('score', 'desc'),
      limit(20),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as LeaderboardRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeLeaderboard(
  onData: (entries: LeaderboardRecord[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = LEADERBOARD_COLLECTION;
  const q = query(
    collection(db, path),
    where('score', '>=', 0),
    orderBy('score', 'desc'),
    limit(20),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as LeaderboardRecord);
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    },
  );
}

export async function loadUserProgress(uid: string): Promise<UserProfileRecord | null> {
  const path = `${USERS_COLLECTION}/${uid}`;
  try {
    const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfileRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function syncRunToCloud(params: {
  playerName?: string;
  score: number;
  cityLevel: number;
  landmarksCount: number;
  maxCombo: number;
  questsCompleted: number;
  districtTitle: string;
  cachedProfile?: UserProfileRecord | null;
  forceLeaderboardCheck?: boolean;
}): Promise<{ newPersonalBest: boolean; profile?: UserProfileRecord }> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    return { newPersonalBest: false };
  }

  const uid = user.uid;
  const playerName = sanitizeName(params.playerName || user.displayName, 'Builder');
  const safeScore = clampInt(params.score, 0, 99999999);
  const safeLevel = clampInt(params.cityLevel, 1, 100);
  const safeLandmarks = clampInt(params.landmarksCount, 0, 1000);
  const safeCombo = clampInt(params.maxCombo, 0, 10000);
  const safeQuests = clampInt(params.questsCompleted, 0, 1000000);
  const safeDistrict = sanitizeName(params.districtTitle, 'Desa Padang');

  // 1. Update private user progress record (reuse cachedProfile to skip redundant getDoc when known)
  const userPath = `${USERS_COLLECTION}/${uid}`;
  let previousBest = params.cachedProfile?.uid === uid ? (params.cachedProfile.bestScore || 0) : 0;
  let updatedProfile: UserProfileRecord | undefined;
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const knownExisting =
      params.cachedProfile && params.cachedProfile.uid === uid ? params.cachedProfile : null;

    if (knownExisting) {
      previousBest = knownExisting.bestScore || 0;
      updatedProfile = {
        uid,
        playerName,
        bestScore: Math.max(previousBest, safeScore),
        highestLevel: Math.max(knownExisting.highestLevel || 1, safeLevel),
        totalBuilt: clampInt((knownExisting.totalBuilt || 0) + safeLandmarks, 0, 1000000),
        questsCompleted: clampInt((knownExisting.questsCompleted || 0) + safeQuests, 0, 1000000),
      };
      await updateDoc(userRef, {
        playerName: updatedProfile.playerName,
        bestScore: updatedProfile.bestScore,
        highestLevel: updatedProfile.highestLevel,
        totalBuilt: updatedProfile.totalBuilt,
        questsCompleted: updatedProfile.questsCompleted,
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingSnap = await getDoc(userRef);

      if (!existingSnap.exists()) {
        updatedProfile = {
          uid,
          playerName,
          bestScore: safeScore,
          highestLevel: safeLevel,
          totalBuilt: safeLandmarks,
          questsCompleted: safeQuests,
        };
        await setDoc(userRef, {
          ...updatedProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        const existing = existingSnap.data() as UserProfileRecord;
        previousBest = existing.bestScore || 0;
        updatedProfile = {
          uid,
          playerName,
          bestScore: Math.max(previousBest, safeScore),
          highestLevel: Math.max(existing.highestLevel || 1, safeLevel),
          totalBuilt: clampInt((existing.totalBuilt || 0) + safeLandmarks, 0, 1000000),
          questsCompleted: clampInt((existing.questsCompleted || 0) + safeQuests, 0, 1000000),
        };
        await updateDoc(userRef, {
          playerName: updatedProfile.playerName,
          bestScore: updatedProfile.bestScore,
          highestLevel: updatedProfile.highestLevel,
          totalBuilt: updatedProfile.totalBuilt,
          questsCompleted: updatedProfile.questsCompleted,
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }

  // 2. Skip reading/writing leaderboard when score didn't beat an existing non-zero personal best
  const shouldCheckLeaderboard =
    Boolean(params.forceLeaderboardCheck) || previousBest === 0 || safeScore > previousBest;
  if (!shouldCheckLeaderboard) {
    return { newPersonalBest: false, profile: updatedProfile };
  }

  const lbPath = `${LEADERBOARD_COLLECTION}/${uid}`;
  let isNewBest = safeScore > previousBest;
  try {
    const lbRef = doc(db, LEADERBOARD_COLLECTION, uid);
    const lbSnap = await getDoc(lbRef);

    if (!lbSnap.exists()) {
      isNewBest = safeScore > 0;
      await setDoc(lbRef, {
        uid,
        playerName,
        score: safeScore,
        cityLevel: safeLevel,
        landmarksCount: safeLandmarks,
        maxCombo: safeCombo,
        districtTitle: safeDistrict,
        updatedAt: serverTimestamp(),
      });
    } else {
      const current = lbSnap.data() as LeaderboardRecord;
      if (safeScore >= (current.score || 0)) {
        isNewBest = safeScore > (current.score || 0);
        await updateDoc(lbRef, {
          playerName,
          score: safeScore,
          cityLevel: Math.max(current.cityLevel || 1, safeLevel),
          landmarksCount: Math.max(current.landmarksCount || 0, safeLandmarks),
          maxCombo: Math.max(current.maxCombo || 0, safeCombo),
          districtTitle: safeDistrict,
          updatedAt: serverTimestamp(),
        });
      } else {
        isNewBest = false;
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, lbPath);
  }

  return { newPersonalBest: isNewBest, profile: updatedProfile };
}

export async function saveAccountPlayerNameToCloud(params: {
  playerName: string;
  cachedProfile?: UserProfileRecord | null;
}): Promise<UserProfileRecord | undefined> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    return undefined;
  }

  const uid = user.uid;
  const safeName = sanitizeName(params.playerName, user.displayName || 'Petualang').slice(0, 24);
  if (safeName.length < 2) {
    throw new Error('Nama karakter minimal 2 karakter.');
  }

  const userPath = `${USERS_COLLECTION}/${uid}`;
  let updatedProfile: UserProfileRecord | undefined;

  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const known = params.cachedProfile && params.cachedProfile.uid === uid ? params.cachedProfile : null;
    if (known) {
      updatedProfile = {
        uid,
        playerName: safeName,
        bestScore: clampInt(known.bestScore || 0, 0, 99999999),
        highestLevel: clampInt(known.highestLevel || 1, 1, 100),
        totalBuilt: clampInt(known.totalBuilt || 0, 0, 1000000),
        questsCompleted: clampInt(known.questsCompleted || 0, 0, 1000000),
      };
      await updateDoc(userRef, {
        playerName: updatedProfile.playerName,
        bestScore: updatedProfile.bestScore,
        highestLevel: updatedProfile.highestLevel,
        totalBuilt: updatedProfile.totalBuilt,
        questsCompleted: updatedProfile.questsCompleted,
        updatedAt: serverTimestamp(),
      });
    } else {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        updatedProfile = {
          uid,
          playerName: safeName,
          bestScore: 0,
          highestLevel: 1,
          totalBuilt: 0,
          questsCompleted: 0,
        };
        await setDoc(userRef, {
          ...updatedProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        const existing = snap.data() as UserProfileRecord;
        updatedProfile = {
          uid,
          playerName: safeName,
          bestScore: clampInt(existing.bestScore || 0, 0, 99999999),
          highestLevel: clampInt(existing.highestLevel || 1, 1, 100),
          totalBuilt: clampInt(existing.totalBuilt || 0, 0, 1000000),
          questsCompleted: clampInt(existing.questsCompleted || 0, 0, 1000000),
        };
        await updateDoc(userRef, {
          playerName: updatedProfile.playerName,
          bestScore: updatedProfile.bestScore,
          highestLevel: updatedProfile.highestLevel,
          totalBuilt: updatedProfile.totalBuilt,
          questsCompleted: updatedProfile.questsCompleted,
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }

  const lbPath = `${LEADERBOARD_COLLECTION}/${uid}`;
  try {
    const lbRef = doc(db, LEADERBOARD_COLLECTION, uid);
    const lbSnap = await getDoc(lbRef);
    if (lbSnap.exists()) {
      await updateDoc(lbRef, {
        playerName: safeName,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, lbPath);
  }

  return updatedProfile;
}

