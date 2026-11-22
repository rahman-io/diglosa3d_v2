const LS_ALWAYS_FULLSCREEN_KEY = 'diglosa_always_fullscreen';
const LS_LANDSCAPE_ONLY_KEY = 'diglosa_landscape_only';

function readBoolPref(key: string, defaultVal: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      localStorage.setItem(key, defaultVal ? 'true' : 'false');
      return defaultVal;
    }
    return raw === 'true';
  } catch {
    return defaultVal;
  }
}

function writeBoolPref(key: string, val: boolean): void {
  try {
    localStorage.setItem(key, val ? 'true' : 'false');
  } catch {
    // Ignore storage errors
  }
}

export function initDisplayPreferences(): { alwaysFullscreen: boolean; landscapeOnly: boolean } {
  return {
    alwaysFullscreen: readBoolPref(LS_ALWAYS_FULLSCREEN_KEY, true),
    landscapeOnly: readBoolPref(LS_LANDSCAPE_ONLY_KEY, true),
  };
}

export function getAlwaysFullscreenPref(): boolean {
  return readBoolPref(LS_ALWAYS_FULLSCREEN_KEY, true);
}

export function setAlwaysFullscreenPref(val: boolean): void {
  writeBoolPref(LS_ALWAYS_FULLSCREEN_KEY, val);
}

export function getLandscapeOnlyPref(): boolean {
  return readBoolPref(LS_LANDSCAPE_ONLY_KEY, true);
}

export function setLandscapeOnlyPref(val: boolean): void {
  writeBoolPref(LS_LANDSCAPE_ONLY_KEY, val);
}

export function isTouchViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(pointer: coarse)').matches ||
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
  );
}

export function isFullscreenActive(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  return Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
}

export async function lockLandscapeOrientation(): Promise<boolean> {
  if (typeof window === 'undefined' || !getLandscapeOnlyPref()) return false;
  try {
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: 'landscape' | 'landscape-primary' | 'landscape-secondary') => Promise<void>;
    };
    if (orientation?.lock) {
      await orientation.lock('landscape');
      return true;
    }
  } catch {
    // Ignore browsers that block orientation lock or require fullscreen first
  }
  return false;
}

export async function requestAppFullscreen(force = false): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  if (!force && !getAlwaysFullscreenPref()) return false;

  let entered = isFullscreenActive();
  if (!entered) {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
      msRequestFullscreen?: () => Promise<void> | void;
    };
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen({ navigationUI: 'hide' });
        entered = true;
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
        entered = isFullscreenActive();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
        entered = isFullscreenActive();
      }
    } catch {
      // Ignore browser gesture/iframe blocks gracefully
    }
  }

  if (getLandscapeOnlyPref()) {
    await lockLandscapeOrientation();
  }
  return entered;
}

export async function toggleAppFullscreen(): Promise<void> {
  if (typeof document === 'undefined') return;
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void> | void;
  };
  try {
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      setAlwaysFullscreenPref(false);
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      }
    } else {
      setAlwaysFullscreenPref(true);
      await requestAppFullscreen(true);
    }
  } catch {
    // Ignore browser blocks gracefully
  }
}
