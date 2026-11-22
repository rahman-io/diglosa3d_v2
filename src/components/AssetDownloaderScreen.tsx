import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Download,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  WifiOff,
} from 'lucide-react';
import loadingSplashImg from '../assets/images/diglosa_loading_splash_1795294009280.jpg';
import {
  formatBytesMb,
  SyncProgressState,
} from '../services/offlineSyncService';
import type { PwaInstallOutcome } from './PwaControls';

interface AssetDownloaderScreenProps {
  syncState: SyncProgressState;
  isOnline: boolean;
  pwaInstall?: {
    isInstallable: boolean;
    isInstalled: boolean;
    isIOS: boolean;
    onInstall: () => Promise<PwaInstallOutcome>;
    onContinueInBrowser: () => void;
  };
  onStartDownload: () => void;
  onSkipOnline: () => void;
  onRetry: () => void;
}

const LOADING_TIPS = [
  'Semua audio, gambar UI, & dunia 3D disimpan di perangkat agar Anda bisa bermain 100% offline kapan saja.',
  'Setiap refresh atau saat membuka aplikasi kembali, Diglosa 3D otomatis memeriksa dan mengunduh pembaruan dari server.',
  'Gunakan Ketapel Kristal dan jawab kuis kosakata Inggris A1 hingga IELTS dengan tepat untuk memulihkan HP!',
  'Kosakata Hari Ini: "Resilient" berarti tangguh — terus berlatih di Menara Waktu dan Akademi IELTS.',
  'Tips Gua Kristal: Bawa cukup Obor dan Blok Pelindung sebelum memecahkan segel teka-teki bawah tanah.',
];

export const AssetDownloaderScreen: React.FC<AssetDownloaderScreenProps> = ({
  syncState,
  isOnline,
  pwaInstall,
  onStartDownload,
  onSkipOnline,
  onRetry,
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [splashLoaded, setSplashLoaded] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % LOADING_TIPS.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  const percent = Math.max(0, Math.min(100, Math.round(syncState.percent)));
  const isPrompting = syncState.phase === 'prompt_download';
  const isInstallPrompt = syncState.phase === 'install_prompt';
  const isOfflineEmpty = syncState.phase === 'offline_empty';
  const isError = syncState.phase === 'error';
  const isBusy =
    syncState.phase === 'checking' ||
    syncState.phase === 'downloading' ||
    syncState.phase === 'updating' ||
    syncState.phase === 'verifying';

  const badgeText =
    syncState.phase === 'updating'
      ? `UPDATING ${percent}%`
      : syncState.phase === 'ready' ||
          syncState.phase === 'offline_ready' ||
          syncState.phase === 'install_prompt'
        ? 'LOADING 100%'
        : `LOADING ${percent}%`;

  const sizeInfo =
    syncState.totalBytes > 0
      ? `${formatBytesMb(syncState.downloadedBytes)} / ${formatBytesMb(syncState.totalBytes)}`
      : syncState.manifest?.totalBytes
        ? `${formatBytesMb(syncState.manifest.totalBytes)} · ${syncState.manifest.assets.length} berkas`
        : 'Menyiapkan paket aset';

  return (
    <div
      className="fixed inset-0 z-[120] overflow-hidden bg-slate-950 text-white select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Memuat dan Mengunduh Aset Offline Diglosa 3D"
    >
      {/* Fullscreen 16:9 Action Key Art Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-amber-950">
        <img
          src={loadingSplashImg}
          alt="Ilustrasi Pertempuran Diglosa 3D"
          onLoad={() => setSplashLoaded(true)}
          draggable={false}
          referrerPolicy="no-referrer"
          className={`h-full w-full object-cover object-center transition-opacity duration-500 ${
            splashLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Measured Bottom Contrast Scrim + Subtle Top Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/25" />

      {/* Top-Left Minimal Status + Top-Right Brand Crest (Matches Reference Screenshot) */}
      <div className="relative z-10 flex w-full items-start justify-between px-4 pt-3 sm:px-8 sm:pt-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          {!isOnline && (
            <span className="inline-flex items-center gap-1.5 text-amber-300">
              <WifiOff className="h-3.5 w-3.5" />
              <span>Offline</span>
            </span>
          )}
          {syncState.versionLabel && (
            <span className="font-mono-nums text-white/80">
              {syncState.versionLabel}
            </span>
          )}
        </div>

        <img
          src="./assets/ui/diglosa_logo.png"
          alt="Diglosa 3D"
          draggable={false}
          className="pointer-events-none h-auto w-[125px] object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.8)] sm:w-[170px]"
        />
      </div>

      {/* Center Action Card ONLY when awaiting user consent, post-download install, or error/offline recovery */}
      {(isPrompting || isInstallPrompt || isOfflineEmpty || isError) && (
        <div className="absolute inset-x-0 bottom-20 z-20 flex justify-center px-4 sm:bottom-24">
          <div className="w-full max-w-lg rounded-2xl border border-amber-300/40 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-md sm:p-5">
            {isPrompting && (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-extrabold tracking-tight text-amber-300 sm:text-lg">
                      Unduh Aset Untuk Main 100% Offline
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-200 sm:text-[13px]">
                      Simpan semua audio, ikon UI, & sumber daya dunia 3D di perangkat Anda, pasang aplikasi ke HP/perangkat, dan nikmati{' '}
                      <strong className="text-white">pembaruan otomatis</strong> setiap kali dibuka kembali.
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-300 font-mono-nums">
                  <span>
                    Ukuran paket: {syncState.manifest ? formatBytesMb(syncState.manifest.totalBytes) : '18.4 MB'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {syncState.manifest ? `${syncState.manifest.assets.length} berkas` : 'Paket lengkap'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Auto-update aktif</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onStartDownload}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg transition hover:bg-amber-300 active:scale-[0.99] sm:text-sm whitespace-nowrap"
                  >
                    <Download className="h-4 w-4 shrink-0" />
                    <span>Unduh Semua Aset & Pasang</span>
                  </button>
                  <button
                    type="button"
                    onClick={onSkipOnline}
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-slate-100 transition hover:bg-white/20 whitespace-nowrap"
                  >
                    Main Online Dulu
                  </button>
                </div>
              </>
            )}

            {isInstallPrompt && pwaInstall && (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-300">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold tracking-tight text-emerald-300 sm:text-lg">
                      {pwaInstall.isInstallable
                        ? 'Aset 100% Terunduh · Pasang Aplikasi ke Perangkat'
                        : 'Aset 100% Terunduh · Pasang ke Layar Utama (iOS)'}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-200 sm:text-[13px]">
                      {pwaInstall.isInstallable
                        ? 'Semua berkas offline siap. Ketuk tombol di bawah untuk langsung menginstal Diglosa 3D ke HP/perangkat Anda.'
                        : 'Browser Safari iOS mewajibkan pemasangan lewat menu Bagikan agar ikon Diglosa 3D terpasang di Layar Utama:'}
                    </p>
                  </div>
                </div>

                {!pwaInstall.isInstallable && pwaInstall.isIOS && (
                  <ol className="mt-3 space-y-1.5 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-slate-200">
                    <li>
                      1. Ketuk ikon <strong>Bagikan (Share)</strong> pada bilah Safari.
                    </li>
                    <li>
                      2. Pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.
                    </li>
                    <li>
                      3. Buka Diglosa 3D langsung dari ikon Layar Utama untuk mode full offline.
                    </li>
                  </ol>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  {pwaInstall.isInstallable ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void pwaInstall.onInstall()}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg transition hover:bg-emerald-300 active:scale-[0.99] sm:text-sm whitespace-nowrap"
                      >
                        <Download className="h-4 w-4 shrink-0" />
                        <span>Pasang Aplikasi Sekarang</span>
                      </button>
                      <button
                        type="button"
                        onClick={pwaInstall.onContinueInBrowser}
                        className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-slate-100 transition hover:bg-white/20 whitespace-nowrap"
                      >
                        Lanjut di Browser
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={pwaInstall.onContinueInBrowser}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg transition hover:bg-amber-300 active:scale-[0.99] sm:text-sm whitespace-nowrap"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Saya Sudah Pasang / Mulai Main</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {isOfflineEmpty && (
              <>
                <h2 className="text-base font-extrabold text-amber-300">
                  Koneksi Internet Diperlukan
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-200">
                  Aset offline belum tersimpan di perangkat ini. Hubungkan ke internet untuk mengunduh paket aset sekali saja, lalu mainkan kapan pun tanpa koneksi.
                </p>
                <div className="mt-4 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-amber-300 whitespace-nowrap"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Coba Lagi</span>
                  </button>
                  <button
                    type="button"
                    onClick={onSkipOnline}
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-slate-100 transition hover:bg-white/20 whitespace-nowrap"
                  >
                    Lanjutkan ke Menu
                  </button>
                </div>
              </>
            )}

            {isError && (
              <>
                <h2 className="text-base font-extrabold text-rose-300">
                  Unduhan Aset Terhenti
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-200">
                  {syncState.errorMessage || 'Gagal mengunduh sebagian berkas dari server. Periksa koneksi Anda lalu coba lagi.'}
                </p>
                <div className="mt-4 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onStartDownload}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-amber-300 whitespace-nowrap"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Lanjutkan Unduhan</span>
                  </button>
                  <button
                    type="button"
                    onClick={onSkipOnline}
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-slate-100 transition hover:bg-white/20 whitespace-nowrap"
                  >
                    Main Online Dulu
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom PUBG-Style Tactical Progress HUD */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-3 sm:px-10 sm:pb-4">
        {/* Top Metadata Row Above Bar */}
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center rounded-[2px] bg-white px-2.5 py-0.5 text-xs font-black tracking-tight text-slate-950 shadow-md sm:text-sm tabular-nums">
              {badgeText}
            </span>
            <span className="font-mono-nums text-[11px] font-semibold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:text-xs">
              {sizeInfo}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:text-xs">
            {syncState.phase === 'offline_ready' ? (
              <WifiOff className="h-3.5 w-3.5 shrink-0 text-amber-300" />
            ) : syncState.phase === 'ready' ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
            ) : isBusy ? (
              <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin text-cyan-300" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
            )}
            <span className="max-w-[60vw] truncate sm:max-w-[44vw]">
              {syncState.statusLabel}
            </span>
          </div>
        </div>

        {/* Razor-Thin Full-Width Progress Bar */}
        <div className="relative h-[3px] w-full overflow-visible bg-white/25 sm:h-[4px]">
          <div
            className="relative h-full bg-gradient-to-r from-amber-300 via-white to-white transition-[width] duration-150 ease-out shadow-[0_0_12px_rgba(255,255,255,0.95)]"
            style={{ width: `${percent}%` }}
          >
            {percent > 0 && percent < 100 && (
              <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_#fff,0_0_16px_#fbbf24]" />
            )}
          </div>
        </div>

        {/* Centered Gameplay / Vocab Tip Below Progress Bar */}
        <p className="mt-2 text-center text-[11px] font-medium text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] sm:text-xs">
          {LOADING_TIPS[tipIndex]}
        </p>
      </div>
    </div>
  );
};
