import { Analytics, getAnalytics, isSupported } from 'firebase/analytics';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';
import {
  doc,
  Firestore,
  FirestoreSettings,
  getDocFromServer,
  getFirestore,
  initializeFirestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export let analytics: Analytics | null = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  void isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => undefined);
}

function createFirestoreInstance(): Firestore {
  const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
  if (typeof window === 'undefined') {
    return getFirestore(app, databaseId);
  }
  try {
    const settings: FirestoreSettings = {
      experimentalForceLongPolling: true,
    };
    return initializeFirestore(app, settings, databaseId);
  } catch {
    return getFirestore(app, databaseId);
  }
}

export const db = createFirestoreInstance();
export const auth = getAuth(app);
if (typeof window !== 'undefined') {
  void setPersistence(auth, browserLocalPersistence).catch(() => undefined);
}
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogleAccount(
  selectAccount = false,
): Promise<UserCredential> {
  await setPersistence(auth, browserLocalPersistence).catch(() => undefined);
  if (selectAccount) {
    const selectorProvider = new GoogleAuthProvider();
    selectorProvider.setCustomParameters({ prompt: 'select_account' });
    return signInWithPopup(auth, selectorProvider);
  }
  return signInWithPopup(auth, googleProvider);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let reachabilityPromise: Promise<boolean> | null = null;
let lastReachableAt = 0;
let restConfigVerified = false;
const REACHABILITY_CACHE_MS = 5 * 60 * 1000;

export async function probeFirestoreReachable(timeoutMs = 4500): Promise<boolean> {
  if (!firebaseConfig?.projectId || !firebaseConfig?.apiKey) {
    restConfigVerified = false;
    return false;
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  if (lastReachableAt > 0 && Date.now() - lastReachableAt < REACHABILITY_CACHE_MS) {
    return true;
  }
  if (reachabilityPromise) {
    return reachabilityPromise;
  }

  reachabilityPromise = (async () => {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer =
      controller && typeof window !== 'undefined'
        ? window.setTimeout(() => controller.abort(), timeoutMs)
        : null;
    try {
      const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
      const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
        firebaseConfig.projectId,
      )}/databases/${encodeURIComponent(
        databaseId,
      )}/documents:runQuery?key=${encodeURIComponent(firebaseConfig.apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'leaderboard' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'score' },
                op: 'GREATER_THAN_OR_EQUAL',
                value: { integerValue: '0' },
              },
            },
            orderBy: [
              { field: { fieldPath: 'score' }, direction: 'DESCENDING' },
              { field: { fieldPath: '__name__' }, direction: 'DESCENDING' },
            ],
            limit: 1,
          },
        }),
        signal: controller?.signal,
      });
      if (res.ok || res.status === 403) {
        lastReachableAt = Date.now();
        restConfigVerified = true;
        return true;
      }
      if (res.status === 400 || res.status === 404) {
        restConfigVerified = false;
      }
      return false;
    } catch {
      return false;
    } finally {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      reachabilityPromise = null;
    }
  })();

  return reachabilityPromise;
}

let connectionTested = false;
let onlineRetryBound = false;
let visibleRetryBound = false;

function scheduleOnlineConnectionRetry(): void {
  if (typeof window === 'undefined' || onlineRetryBound) return;
  onlineRetryBound = true;
  window.addEventListener(
    'online',
    () => {
      onlineRetryBound = false;
      void testConnection();
    },
    { once: true },
  );
}

function scheduleVisibleConnectionRetry(): void {
  if (typeof document === 'undefined' || visibleRetryBound) return;
  visibleRetryBound = true;
  const onVisible = () => {
    if (document.visibilityState === 'visible') {
      document.removeEventListener('visibilitychange', onVisible);
      visibleRetryBound = false;
      void testConnection();
    }
  };
  document.addEventListener('visibilitychange', onVisible);
}

export async function testConnection(): Promise<void> {
  if (connectionTested) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    scheduleOnlineConnectionRetry();
    return;
  }
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    scheduleVisibleConnectionRetry();
    return;
  }
  const reachable = await probeFirestoreReachable();
  if (!reachable) {
    scheduleOnlineConnectionRetry();
    return;
  }
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    lastReachableAt = Date.now();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('the client is offline')) {
      if (!restConfigVerified) {
        console.error('Please check your Firebase configuration.');
      }
      connectionTested = false;
      lastReachableAt = 0;
      scheduleOnlineConnectionRetry();
    } else if (msg.includes('unavailable')) {
      connectionTested = false;
      lastReachableAt = 0;
      scheduleOnlineConnectionRetry();
    } else if (msg.includes('permission') || msg.includes('Missing or insufficient')) {
      // Server responded normally (rules denied reading test/connection), so Firestore is reachable
      lastReachableAt = Date.now();
    }
  }
}

function scheduleInitialConnectionTest(): void {
  if (typeof window === 'undefined') return;
  const run = () => {
    window.setTimeout(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        scheduleVisibleConnectionRetry();
        return;
      }
      if (typeof navigator === 'undefined' || navigator.onLine) {
        void testConnection();
      } else {
        scheduleOnlineConnectionRetry();
      }
    }, 350);
  };

  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run, { once: true });
  }
}

scheduleInitialConnectionTest();
