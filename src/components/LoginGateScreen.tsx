import React, { useState } from 'react';
import { Check, Download, Loader2, RefreshCw, Users } from 'lucide-react';

interface LoginGateScreenProps {
  authChecked: boolean;
  offlineVersion?: string | null;
  offlineReady?: boolean;
  onSignIn: (selectAccount?: boolean) => Promise<void>;
  onOpenOfflineSync?: () => void;
}

const GoogleLogoIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.09.73-2.48 1.16-4.22 1.16-3.24 0-5.98-2.19-6.96-5.13H1.04v3.14C3.05 21.14 7.21 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.04 14.02c-.25-.73-.39-1.51-.39-2.32s.14-1.59.39-2.32V6.24H1.04C.38 7.55 0 9.03 0 11.7s.38 4.15 1.04 5.46l4-3.14Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.8 0 3.41.62 4.68 1.84l3.51-3.51C18.07 1.19 15.3 0 12 0 7.21 0 3.05 2.86 1.04 7.04l4 3.14c.98-2.94 3.72-5.43 6.96-5.43Z"
    />
  </svg>
);

export const LoginGateScreen: React.FC<LoginGateScreenProps> = ({
  authChecked,
  offlineVersion = null,
  offlineReady = false,
  onSignIn,
  onOpenOfflineSync,
}) => {
  const [busyMode, setBusyMode] = useState<'default' | 'switch' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(true);

  const handleLogin = async (selectAccount: boolean) => {
    if (!agreedTerms || busyMode) return;
    setBusyMode(selectAccount ? 'switch' : 'default');
    setErrorMsg(null);
    try {
      await onSignIn(selectAccount);
    } catch (err) {
      const code = (err as { code?: string } | null)?.code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setErrorMsg('Login Google dibatalkan. Silakan coba lagi.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg('Pop-up login diblokir browser. Izinkan pop-up lalu ketuk lagi.');
      } else if (code === 'auth/network-request-failed') {
        setErrorMsg('Butuh koneksi internet untuk login Google pertama kali.');
      } else if (code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        setErrorMsg(
          `Domain "${host}" belum didaftarkan di Firebase Console → Authentication → Settings → Authorized domains.`,
        );
      } else {
        setErrorMsg(
          err instanceof Error && err.message
            ? err.message
            : 'Gagal masuk dengan Akun Google. Silakan coba kembali.',
        );
      }
    } finally {
      setBusyMode(null);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between bg-[radial-gradient(circle_at_50%_28%,rgba(15,23,42,0.12),rgba(4,9,22,0.82))] p-4 sm:p-6">
      {/* Top Bar: Logo Top-Left & Version + Sync Top-Right */}
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex flex-col items-start">
          <img
            src="./assets/ui/diglosa_logo.png"
            alt="Diglosa - Taklukkan Monster, Kuasai Bahasa!"
            draggable={false}
            className="pointer-events-none h-auto w-[155px] select-none object-contain drop-shadow-[0_8px_22px_rgba(15,23,42,0.75)] sm:w-[225px]"
          />
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
          <div className="text-[11px] font-semibold leading-tight text-slate-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] sm:text-xs">
            <div>Diglosa 3D RPG · Petualangan Kata</div>
            <div className="font-mono-nums text-slate-300">
              Versi: {offlineVersion ? `v${offlineVersion}` : 'Online'}
            </div>
          </div>

          {onOpenOfflineSync && (
            <button
              type="button"
              onClick={onOpenOfflineSync}
              title={offlineReady ? 'Periksa Update Aset' : 'Unduh Aset Offline'}
              aria-label={offlineReady ? 'Periksa Update Aset' : 'Unduh Aset Offline'}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-slate-950/75 text-slate-100 shadow-lg backdrop-blur-sm transition hover:border-white/60 hover:bg-slate-900"
            >
              {offlineReady ? (
                <RefreshCw className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Center-Bottom Auth Action Cluster (Google Account Only) */}
      <div className="mx-auto flex w-full max-w-[360px] flex-col items-center gap-2.5 pb-2 sm:pb-5">
        {!authChecked ? (
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-slate-950/80 px-5 py-2.5 text-xs font-bold text-slate-100 shadow-xl backdrop-blur-md">
            <Loader2 className="h-4 w-4 animate-spin text-sky-300" />
            <span>Memeriksa sesi login tersimpan...</span>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="w-full rounded-xl border border-rose-400/50 bg-rose-950/85 px-3.5 py-2 text-center text-xs font-bold text-rose-100 shadow-lg backdrop-blur-sm">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Primary White Google Login / Register CTA */}
            <button
              type="button"
              disabled={Boolean(busyMode) || !agreedTerms}
              onClick={() => void handleLogin(false)}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-900 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition hover:bg-slate-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {busyMode === 'default' ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
              ) : (
                <GoogleLogoIcon className="h-5 w-5 shrink-0" />
              )}
              <span>
                {busyMode === 'default' ? 'Menghubungkan Google...' : 'Masuk dengan Google'}
              </span>
            </button>

            {/* Divider */}
            <div className="flex w-full items-center gap-3 px-2">
              <div className="h-px flex-1 bg-white/30" />
              <span className="text-[11px] font-bold text-slate-200/90 drop-shadow">Atau</span>
              <div className="h-px flex-1 bg-white/30" />
            </div>

            {/* Secondary Muted Switch Account Button */}
            <button
              type="button"
              disabled={Boolean(busyMode) || !agreedTerms}
              onClick={() => void handleLogin(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-slate-200/85 px-5 py-2 text-xs font-extrabold text-slate-900 shadow-lg backdrop-blur-sm transition hover:bg-white active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {busyMode === 'switch' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-800" />
              ) : (
                <Users className="h-3.5 w-3.5 text-slate-800" />
              )}
              <span>
                {busyMode === 'switch' ? 'Membuka Pilihan Akun...' : 'Gunakan Akun Google Lain'}
              </span>
            </button>

            {/* Consent & Persistence Note */}
            <button
              type="button"
              onClick={() => setAgreedTerms((v) => !v)}
              className="mt-1 flex items-center justify-center gap-2 text-center text-[11px] font-medium text-slate-200/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                  agreedTerms
                    ? 'border-sky-300 bg-sky-500 text-white'
                    : 'border-white/45 bg-slate-950/60 text-transparent'
                }`}
              >
                <Check className="h-3 w-3" />
              </span>
              <span>
                Sesi Google tersimpan otomatis di perangkat untuk main{' '}
                <span className="text-sky-300 underline decoration-sky-300/50">
                  Solo &amp; Multiplayer
                </span>
                .
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
