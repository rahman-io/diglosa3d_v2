import React, { useEffect, useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type PwaInstallOutcome =
  | 'accepted'
  | 'dismissed'
  | 'blocked_gesture'
  | 'unavailable';

export interface GlobalPwaState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  isInIframe: boolean;
}

const LS_PWA_INSTALLED = 'diglosa_pwa_installed';

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let globalInstalledFlag = false;
const pwaListeners = new Set<() => void>();

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function checkIsIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isAppleMobile = /iphone|ipad|ipod/.test(ua);
  const isIpadOS =
    window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
  return isAppleMobile || isIpadOS;
}

function checkIsInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function notifyPwaListeners(): void {
  pwaListeners.forEach((cb) => cb());
}

if (typeof window !== 'undefined') {
  try {
    if (checkIsStandalone()) {
      globalInstalledFlag = true;
      localStorage.setItem(LS_PWA_INSTALLED, '1');
    } else {
      globalInstalledFlag = localStorage.getItem(LS_PWA_INSTALLED) === '1';
    }
  } catch {
    globalInstalledFlag = checkIsStandalone();
  }

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    // If beforeinstallprompt fires again, the browser tells us it's not currently installed
    globalInstalledFlag = false;
    try {
      localStorage.removeItem(LS_PWA_INSTALLED);
    } catch {
      // ignore
    }
    notifyPwaListeners();
  });

  window.addEventListener('appinstalled', () => {
    globalInstalledFlag = true;
    globalDeferredPrompt = null;
    try {
      localStorage.setItem(LS_PWA_INSTALLED, '1');
    } catch {
      // ignore
    }
    notifyPwaListeners();
  });
}

export function getGlobalPwaInstallState(): GlobalPwaState {
  const isStandalone = checkIsStandalone();
  return {
    isInstallable: Boolean(globalDeferredPrompt),
    isInstalled: isStandalone || globalInstalledFlag,
    isStandalone,
    isIOS: checkIsIOS(),
    isInIframe: checkIsInIframe(),
  };
}

export async function triggerGlobalPwaInstall(): Promise<PwaInstallOutcome> {
  if (!globalDeferredPrompt) return 'unavailable';
  try {
    await globalDeferredPrompt.prompt();
    const { outcome } = await globalDeferredPrompt.userChoice;
    if (outcome === 'accepted') {
      globalInstalledFlag = true;
      globalDeferredPrompt = null;
      try {
        localStorage.setItem(LS_PWA_INSTALLED, '1');
      } catch {
        // ignore
      }
      notifyPwaListeners();
      return 'accepted';
    }
    notifyPwaListeners();
    return 'dismissed';
  } catch (err) {
    const msg = err instanceof Error ? err.message.toLowerCase() : '';
    const name = err instanceof Error ? err.name : '';
    if (
      name === 'NotAllowedError' ||
      msg.includes('gesture') ||
      msg.includes('user activation')
    ) {
      return 'blocked_gesture';
    }
    return 'unavailable';
  }
}

export function usePWAInstall() {
  const [state, setState] = useState<GlobalPwaState>(() => getGlobalPwaInstallState());

  useEffect(() => {
    const sync = () => setState(getGlobalPwaInstallState());
    pwaListeners.add(sync);
    sync();

    const mqStandalone = window.matchMedia('(display-mode: standalone)');
    const onMqChange = () => sync();
    mqStandalone.addEventListener?.('change', onMqChange);

    return () => {
      pwaListeners.delete(sync);
      mqStandalone.removeEventListener?.('change', onMqChange);
    };
  }, []);

  const install = async (): Promise<PwaInstallOutcome> => {
    return triggerGlobalPwaInstall();
  };

  return {
    ...state,
    install,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const PWAInstallButton: React.FC<{
  compact?: boolean;
  className?: string;
}> = ({ compact = false, className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className={`flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300/45 bg-emerald-500/20 px-3 py-2 text-xs font-extrabold text-emerald-200 transition hover:bg-emerald-500/35 whitespace-nowrap shrink-0 ${className}`}
      >
        <Download className="h-3.5 w-3.5 shrink-0" />
        <span>{compact ? 'Pasang App' : 'Pasang Aplikasi Offline'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center justify-center gap-1.5 rounded-xl border border-sky-300/35 bg-sky-500/15 px-3 py-2 text-xs font-bold text-sky-200 transition hover:bg-sky-500/25 whitespace-nowrap shrink-0 ${className}`}
        >
          <Smartphone className="h-3.5 w-3.5 shrink-0" />
          <span>{compact ? 'Pasang iOS' : 'Cara Pasang di iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-amber-300/35 bg-slate-950 p-5 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-extrabold text-amber-300">
                  Pasang Diglosa 3D di iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-xs leading-relaxed text-slate-200">
                <li>
                  1. Ketuk tombol <strong>Bagikan (Share)</strong> pada bilah Safari.
                </li>
                <li>
                  2. Gulir ke bawah dan pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.
                </li>
                <li>
                  3. Buka Diglosa 3D dari layar utama untuk bermain penuh secara offline.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-amber-400 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-2.5 left-2.5 z-[90] flex items-center gap-1.5 rounded-lg border border-amber-300/40 bg-slate-950/85 px-2.5 py-1 text-[11px] font-bold text-amber-200 shadow-lg backdrop-blur-sm"
    >
      <WifiOff className="h-3.5 w-3.5 text-amber-300" />
      <span>Mode Offline · Aset Lokal Aktif</span>
    </div>
  );
};
