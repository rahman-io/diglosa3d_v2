import { registerSW } from 'virtual:pwa-register';

export const OFFLINE_CACHE_NAME = 'diglosa-offline-assets-v3';
const LEGACY_OFFLINE_CACHE_NAMES = ['diglosa-offline-assets-v2'];

const LS_ENROLLED = 'diglosa_offline_enrolled';
const LS_BUILD_HASH = 'diglosa_offline_build_hash';
const LS_CODE_HASH = 'diglosa_offline_code_hash';
const LS_VERSION = 'diglosa_offline_version';
const LS_FILE_HASHES = 'diglosa_offline_file_hashes';
const LS_TOTAL_BYTES = 'diglosa_offline_total_bytes';
const LS_FILE_COUNT = 'diglosa_offline_file_count';
const LS_UPDATED_AT = 'diglosa_offline_updated_at';
const SS_RELOADED_CODE_HASH = 'diglosa_auto_reloaded_code_hash';

export interface OfflineAssetEntry {
  url: string;
  hash: string;
  size: number;
  kind: 'ui' | 'audio' | 'image' | 'bundle' | 'document';
}

export interface OfflineManifest {
  version: string;
  buildHash: string;
  codeHash: string;
  generatedAt: string;
  totalBytes: number;
  assets: OfflineAssetEntry[];
}

export interface LocalOfflineState {
  enrolled: boolean;
  buildHash: string | null;
  codeHash: string | null;
  version: string | null;
  fileHashes: Record<string, string>;
  totalBytes: number;
  fileCount: number;
  updatedAt: string | null;
}

export type SyncPhase =
  | 'checking'
  | 'prompt_download'
  | 'downloading'
  | 'updating'
  | 'verifying'
  | 'install_prompt'
  | 'offline_ready'
  | 'offline_empty'
  | 'error'
  | 'ready';

export interface SyncProgressState {
  phase: SyncPhase;
  percent: number;
  downloadedBytes: number;
  totalBytes: number;
  completedFiles: number;
  totalFiles: number;
  currentFile: string;
  statusLabel: string;
  versionLabel: string;
  isUpdate: boolean;
  errorMessage?: string;
  manifest?: OfflineManifest | null;
}

let swRegistration: ServiceWorkerRegistration | null = null;
let swInitialized = false;

export function getLocalOfflineState(): LocalOfflineState {
  try {
    const rawHashes = localStorage.getItem(LS_FILE_HASHES);
    const parsedHashes = rawHashes ? (JSON.parse(rawHashes) as Record<string, string>) : {};
    return {
      enrolled: localStorage.getItem(LS_ENROLLED) === '1',
      buildHash: localStorage.getItem(LS_BUILD_HASH),
      codeHash: localStorage.getItem(LS_CODE_HASH),
      version: localStorage.getItem(LS_VERSION),
      fileHashes: parsedHashes && typeof parsedHashes === 'object' ? parsedHashes : {},
      totalBytes: Number(localStorage.getItem(LS_TOTAL_BYTES) || '0') || 0,
      fileCount: Number(localStorage.getItem(LS_FILE_COUNT) || '0') || 0,
      updatedAt: localStorage.getItem(LS_UPDATED_AT),
    };
  } catch {
    return {
      enrolled: false,
      buildHash: null,
      codeHash: null,
      version: null,
      fileHashes: {},
      totalBytes: 0,
      fileCount: 0,
      updatedAt: null,
    };
  }
}

function saveLocalOfflineState(manifest: OfflineManifest): void {
  try {
    const map: Record<string, string> = {};
    for (const item of manifest.assets) {
      map[item.url] = item.hash;
    }
    localStorage.setItem(LS_ENROLLED, '1');
    localStorage.setItem(LS_BUILD_HASH, manifest.buildHash);
    localStorage.setItem(LS_CODE_HASH, manifest.codeHash);
    localStorage.setItem(LS_VERSION, manifest.version);
    localStorage.setItem(LS_FILE_HASHES, JSON.stringify(map));
    localStorage.setItem(LS_TOTAL_BYTES, String(manifest.totalBytes));
    localStorage.setItem(LS_FILE_COUNT, String(manifest.assets.length));
    localStorage.setItem(LS_UPDATED_AT, new Date().toISOString());
  } catch {
    // ignore storage quota edge cases
  }
}

export function resolveAssetAbsoluteUrl(assetUrl: string): string {
  const baseHref =
    typeof document !== 'undefined' && document.baseURI
      ? document.baseURI
      : typeof window !== 'undefined'
      ? window.location.href
      : 'http://localhost/';
  return new URL(assetUrl, baseHref).href;
}

export function formatBytesMb(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0.0 MB';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function fetchServerManifest(timeoutMs = 4500): Promise<OfflineManifest | null> {
  if (typeof window === 'undefined') return null;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`./offline-manifest.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as OfflineManifest;
    if (!data || !Array.isArray(data.assets) || !data.buildHash) return null;
    return data;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

export async function inspectLocalCache(
  manifest?: OfflineManifest | null,
): Promise<{
  hasAnyCachedAssets: boolean;
  cachedCount: number;
  missingAssets: OfflineAssetEntry[];
  staleUrls: string[];
}> {
  if (typeof caches === 'undefined') {
    return {
      hasAnyCachedAssets: false,
      cachedCount: 0,
      missingAssets: manifest?.assets ?? [],
      staleUrls: [],
    };
  }

  // Drop legacy poisoned caches automatically
  for (const legacyName of LEGACY_OFFLINE_CACHE_NAMES) {
    caches.delete(legacyName).catch(() => false);
  }

  const cache = await caches.open(OFFLINE_CACHE_NAME);
  const cachedRequests = await cache.keys();
  const cachedUrls = new Set(cachedRequests.map((r) => r.url));

  if (!manifest) {
    return {
      hasAnyCachedAssets: cachedUrls.size > 0,
      cachedCount: cachedUrls.size,
      missingAssets: [],
      staleUrls: [],
    };
  }

  const localState = getLocalOfflineState();
  const manifestUrlSet = new Set<string>();
  const missingAssets: OfflineAssetEntry[] = [];

  for (const entry of manifest.assets) {
    const absUrl = resolveAssetAbsoluteUrl(entry.url);
    manifestUrlSet.add(absUrl);
    const storedHash = localState.fileHashes[entry.url];
    const isPresent = cachedUrls.has(absUrl);
    if (!isPresent || storedHash !== entry.hash) {
      missingAssets.push(entry);
      continue;
    }
    if (entry.kind === 'ui' || entry.kind === 'image' || entry.kind === 'audio') {
      const matched = await cache.match(new Request(absUrl));
      const ctype = (matched?.headers.get('Content-Type') || '').toLowerCase();
      if (!matched || ctype.includes('text/html')) {
        await cache.delete(new Request(absUrl)).catch(() => false);
        missingAssets.push(entry);
      }
    }
  }

  const staleUrls: string[] = [];
  for (const reqUrl of cachedUrls) {
    if (!manifestUrlSet.has(reqUrl)) {
      staleUrls.push(reqUrl);
    }
  }

  return {
    hasAnyCachedAssets: cachedUrls.size > 0,
    cachedCount: cachedUrls.size,
    missingAssets,
    staleUrls,
  };
}

export function initPwaAutoUpdateWorker(onNewVersionActivating?: () => void): void {
  if (swInitialized || typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  swInitialized = true;

  try {
    registerSW({
      immediate: true,
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;
        swRegistration = registration;

        const checkSw = () => {
          if (navigator.onLine) {
            registration.update().catch(() => {});
          }
        };

        window.addEventListener('online', checkSw);
        window.addEventListener('focus', checkSw);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            checkSw();
          }
        });
      },
      onNeedRefresh() {
        onNewVersionActivating?.();
      },
    });
  } catch {
    // ignore SW registration failure in unsupported contexts
  }
}

export async function triggerServiceWorkerUpdateCheck(): Promise<void> {
  if (!swRegistration) return;
  try {
    await swRegistration.update();
  } catch {
    // ignore
  }
}

async function fetchAssetAndCache(
  cache: Cache,
  entry: OfflineAssetEntry,
  onChunkBytes: (deltaBytes: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  const absUrl = resolveAssetAbsoluteUrl(entry.url);
  // Bust HTTP cache during sync so server updates are guaranteed fresh
  const fetchUrl = `${absUrl}${absUrl.includes('?') ? '&' : '?'}v=${encodeURIComponent(entry.hash)}`;
  const response = await fetch(fetchUrl, {
    cache: 'reload',
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} saat mengunduh ${entry.url}`);
  }

  const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
  const lowerContentType = contentType.toLowerCase();
  if (
    (entry.kind === 'ui' || entry.kind === 'image') &&
    (lowerContentType.includes('text/html') || !lowerContentType.startsWith('image/'))
  ) {
    throw new Error(`Respons gambar tidak valid (${contentType}) untuk ${entry.url}`);
  }
  if (entry.kind === 'audio' && lowerContentType.includes('text/html')) {
    throw new Error(`Respons audio tidak valid (${contentType}) untuk ${entry.url}`);
  }
  let finalResponse: Response;

  if (response.body) {
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        received += value.byteLength;
        onChunkBytes(value.byteLength);
      }
    }

    if (received === 0 && entry.size > 0) {
      onChunkBytes(entry.size);
    }

    const merged = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', String(merged.byteLength));
    headers.set('Cache-Control', 'public, max-age=31536000');

    finalResponse = new Response(merged, {
      status: 200,
      statusText: 'OK',
      headers,
    });
  } else {
    const buf = await response.arrayBuffer();
    onChunkBytes(buf.byteLength || entry.size);
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', String(buf.byteLength));
    finalResponse = new Response(buf, {
      status: 200,
      statusText: 'OK',
      headers,
    });
  }

  await cache.put(new Request(absUrl), finalResponse);
}

export async function runOfflineSyncDownload(
  manifest: OfflineManifest,
  assetsToDownload: OfflineAssetEntry[],
  staleUrls: string[],
  isUpdate: boolean,
  onProgress: (state: SyncProgressState) => void,
  signal?: AbortSignal,
): Promise<{ requiresCodeReload: boolean }> {
  const prevState = getLocalOfflineState();
  const codeChanged =
    Boolean(prevState.codeHash) && prevState.codeHash !== manifest.codeHash;

  const cache = await caches.open(OFFLINE_CACHE_NAME);

  // Clean obsolete cached files
  if (staleUrls.length > 0) {
    await Promise.all(staleUrls.map((u) => cache.delete(new Request(u)).catch(() => false)));
  }

  const totalBytes = Math.max(
    1,
    assetsToDownload.reduce((acc, a) => acc + Math.max(1024, a.size), 0),
  );
  let downloadedBytes = 0;
  let completedFiles = 0;
  const totalFiles = assetsToDownload.length;

  const reportProgress = (currentFile: string) => {
    const clampedBytes = Math.min(totalBytes, downloadedBytes);
    const pct = totalFiles === 0 ? 100 : Math.min(99, Math.round((clampedBytes / totalBytes) * 100));
    onProgress({
      phase: isUpdate ? 'updating' : 'downloading',
      percent: pct,
      downloadedBytes: clampedBytes,
      totalBytes,
      completedFiles,
      totalFiles,
      currentFile,
      statusLabel: isUpdate
        ? `Memperbarui otomatis (${completedFiles}/${totalFiles}): ${currentFile}`
        : `Mengunduh aset offline (${completedFiles}/${totalFiles}): ${currentFile}`,
      versionLabel: `v${manifest.version}`,
      isUpdate,
      manifest,
    });
  };

  if (totalFiles > 0) {
    reportProgress(assetsToDownload[0].url.split('/').pop() || 'assets');

    // Concurrent worker pool (4 parallel streams)
    let cursor = 0;
    const workerCount = Math.min(4, totalFiles);

    const workers = Array.from({ length: workerCount }, async () => {
      while (cursor < totalFiles) {
        if (signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        const idx = cursor++;
        const entry = assetsToDownload[idx];
        const shortName = entry.url.split('/').pop() || entry.url;
        let fileCountedBytes = 0;

        await fetchAssetAndCache(
          cache,
          entry,
          (delta) => {
            fileCountedBytes += delta;
            downloadedBytes += delta;
            reportProgress(shortName);
          },
          signal,
        );

        // Normalize byte accounting if server sent compressed size vs raw file size
        if (entry.size > 0 && fileCountedBytes < entry.size) {
          downloadedBytes += entry.size - fileCountedBytes;
        }
        completedFiles += 1;
        reportProgress(shortName);
      }
    });

    await Promise.all(workers);
  }

  // Also refresh root HTML in cache + trigger SW update check
  try {
    const rootRes = await fetch('./index.html', { cache: 'reload', signal });
    if (rootRes.ok) {
      await cache.put(new Request(resolveAssetAbsoluteUrl('./index.html')), rootRes.clone());
      await cache.put(new Request(resolveAssetAbsoluteUrl('./')), rootRes);
    }
  } catch {
    // ignore in dev if index.html redirects
  }

  await triggerServiceWorkerUpdateCheck();
  saveLocalOfflineState(manifest);

  let alreadyReloadedForThisHash = false;
  try {
    alreadyReloadedForThisHash =
      sessionStorage.getItem(SS_RELOADED_CODE_HASH) === manifest.codeHash;
  } catch {
    alreadyReloadedForThisHash = false;
  }

  const requiresCodeReload = isUpdate && codeChanged && !alreadyReloadedForThisHash;
  if (requiresCodeReload) {
    try {
      sessionStorage.setItem(SS_RELOADED_CODE_HASH, manifest.codeHash);
    } catch {
      // ignore
    }
  }

  onProgress({
    phase: 'ready',
    percent: 100,
    downloadedBytes: totalBytes,
    totalBytes,
    completedFiles: totalFiles,
    totalFiles,
    currentFile: '',
    statusLabel: requiresCodeReload
      ? 'Pembaruan sistem selesai · Memuat ulang versi terbaru...'
      : 'Semua aset offline siap & terverifikasi 100%',
    versionLabel: `v${manifest.version}`,
    isUpdate,
    manifest,
  });

  return { requiresCodeReload };
}

export async function clearOfflineCacheAndReset(): Promise<void> {
  try {
    if (typeof caches !== 'undefined') {
      await caches.delete(OFFLINE_CACHE_NAME);
      for (const legacyName of LEGACY_OFFLINE_CACHE_NAMES) {
        await caches.delete(legacyName);
      }
    }
    localStorage.removeItem(LS_ENROLLED);
    localStorage.removeItem(LS_BUILD_HASH);
    localStorage.removeItem(LS_CODE_HASH);
    localStorage.removeItem(LS_VERSION);
    localStorage.removeItem(LS_FILE_HASHES);
    localStorage.removeItem(LS_TOTAL_BYTES);
    localStorage.removeItem(LS_FILE_COUNT);
    localStorage.removeItem(LS_UPDATED_AT);
    sessionStorage.removeItem(SS_RELOADED_CODE_HASH);
  } catch {
    // ignore
  }
}
