import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

export interface OfflineAssetManifestEntry {
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
  assets: OfflineAssetManifestEntry[];
}

const REFERENCED_AISTUDIO_IMAGES = new Set([
  'Easy_e28c90a2.jpeg',
  'Medium_868df2a3.jpeg',
  'Hard_9eb17eeb.jpeg',
  'Gemini_Generated_Image_o4clnqo4clnqo4cl_c0838042.jpeg',
  'Gemini_Generated_Image_p9qrl3p9qrl3p9qr_c81c9878.jpeg',
  'Gemini_Generated_Image_q4s0n7q4s0n7q4s0_03737224.jpeg',
  'Gemini_Generated_Image_aoej87aoej87aoej_de96d052.jpeg',
  'btn_car_brake_ea27cd8a.jpeg',
  'btn_car_enter_7623e10e.jpeg',
  'btn_car_exit_18ede182.jpeg',
  'btn_car_gas_3821c6db.jpeg',
  'btn_car_horn_e2392958.jpeg',
  'btn_car_lights_8d7f17c4.jpeg',
  'btn_car_turbo_7ad55721.jpeg',
  'image_d988e3c5.png',
  'image_b5910649.png',
  'Gemini_Generated_Image_h625wih625wih625_e6bd6711.jpeg',
  'Gemini_Generated_Image_9841t9841t9841t9_2a41b1ca.jpeg',
  'image_e351f895.png',
  'image_9e22ed89.png',
  'image_f9399c64.png',
  'image_7946ae08.png',
  'image_505cd4e3.png',
  'image_389ec840.png',
]);

const PWA_ICONS = [
  'pwa-192x192.png',
  'pwa-512x512.png',
  'pwa-maskable-512x512.png',
  'apple-touch-icon.png',
];

function sha256File(filePath: string): { hash: string; size: number } {
  const buf = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
  return { hash, size: buf.byteLength };
}

function walkFiles(dir: string, exts?: Set<string>): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full, exts));
    } else if (entry.isFile()) {
      if (!exts || exts.has(path.extname(entry.name).toLowerCase())) {
        out.push(full);
      }
    }
  }
  return out;
}

function collectPublicRuntimeAssets(rootDir: string): OfflineAssetManifestEntry[] {
  const publicDir = path.join(rootDir, 'public');
  const entries: OfflineAssetManifestEntry[] = [];

  // 1. UI sprites (public/assets/ui/*.png)
  const uiDir = path.join(publicDir, 'assets', 'ui');
  if (fs.existsSync(uiDir)) {
    const files = fs.readdirSync(uiDir).filter((f) => f.endsWith('.png')).sort();
    for (const file of files) {
      const full = path.join(uiDir, file);
      const { hash, size } = sha256File(full);
      entries.push({
        url: `./assets/ui/${file}`,
        hash,
        size,
        kind: 'ui',
      });
    }
  }

  // 1b. Vocabulary illustrations (public/assets/vocab/**/*.png)
  const vocabDir = path.join(publicDir, 'assets', 'vocab');
  if (fs.existsSync(vocabDir)) {
    const files = walkFiles(vocabDir, new Set(['.png']));
    for (const full of files) {
      const rel = path.relative(publicDir, full).split(path.sep).join('/');
      const { hash, size } = sha256File(full);
      entries.push({
        url: `./${rel}`,
        hash,
        size,
        kind: 'image',
      });
    }
  }

  // 2. Referenced MP3 audio + difficulty JPEGs (public/assets/aistudio/*)
  const aiStudioDir = path.join(publicDir, 'assets', 'aistudio');
  if (fs.existsSync(aiStudioDir)) {
    const files = fs.readdirSync(aiStudioDir).sort();
    for (const file of files) {
      const isMp3 = file.endsWith('.mp3');
      const isRefImg = REFERENCED_AISTUDIO_IMAGES.has(file);
      if (!isMp3 && !isRefImg) continue;
      const full = path.join(aiStudioDir, file);
      const { hash, size } = sha256File(full);
      entries.push({
        url: `./assets/aistudio/${file}`,
        hash,
        size,
        kind: isMp3 ? 'audio' : 'image',
      });
    }
  }

  // 3. Root PWA icons
  for (const icon of PWA_ICONS) {
    const full = path.join(publicDir, icon);
    if (fs.existsSync(full)) {
      const { hash, size } = sha256File(full);
      entries.push({
        url: `./${icon}`,
        hash,
        size,
        kind: 'image',
      });
    }
  }

  return entries;
}

function buildDevManifest(rootDir: string): OfflineManifest {
  const assets = collectPublicRuntimeAssets(rootDir);

  // Hash source files so ANY small code/vocab/CSS edit triggers update detection in dev
  const srcHash = crypto.createHash('sha256');
  const codeFiles = [
    ...walkFiles(path.join(rootDir, 'src'), new Set(['.ts', '.tsx', '.css', '.jpg', '.png'])),
    path.join(rootDir, 'index.html'),
    path.join(rootDir, 'vite.config.ts'),
  ].filter((p) => fs.existsSync(p));

  for (const file of codeFiles) {
    const rel = path.relative(rootDir, file);
    srcHash.update(rel);
    srcHash.update(fs.readFileSync(file));
  }
  const codeHash = srcHash.digest('hex').slice(0, 16);

  const combined = crypto.createHash('sha256').update(codeHash);
  let totalBytes = 0;
  for (const item of assets) {
    combined.update(`${item.url}:${item.hash}`);
    totalBytes += item.size;
  }
  const buildHash = combined.digest('hex').slice(0, 16);
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');

  return {
    version: `${y}.${m}.${d}-${buildHash.slice(0, 6)}`,
    buildHash,
    codeHash,
    generatedAt: now.toISOString(),
    totalBytes,
    assets,
  };
}

function buildDistManifest(rootDir: string, distDir: string): OfflineManifest {
  const entries: OfflineAssetManifestEntry[] = [];
  const seenUrls = new Set<string>();

  const addEntry = (url: string, fullPath: string, kind: OfflineAssetManifestEntry['kind']) => {
    if (seenUrls.has(url) || !fs.existsSync(fullPath)) return;
    seenUrls.add(url);
    const { hash, size } = sha256File(fullPath);
    entries.push({ url, hash, size, kind });
  };

  // Core document & manifest
  addEntry('./index.html', path.join(distDir, 'index.html'), 'document');
  addEntry('./manifest.webmanifest', path.join(distDir, 'manifest.webmanifest'), 'document');

  // Emitted JS/CSS/media bundles in dist/assets/
  const distAssetsDir = path.join(distDir, 'assets');
  if (fs.existsSync(distAssetsDir)) {
    const bundleFiles = fs.readdirSync(distAssetsDir).sort();
    for (const file of bundleFiles) {
      const full = path.join(distAssetsDir, file);
      if (!fs.statSync(full).isFile()) continue;
      if (file.endsWith('.map')) continue;
      const kind: OfflineAssetManifestEntry['kind'] =
        file.endsWith('.js') || file.endsWith('.css') ? 'bundle' : 'image';
      addEntry(`./assets/${file}`, full, kind);
    }
  }

  // Also include public runtime assets (already copied to dist/)
  for (const pubEntry of collectPublicRuntimeAssets(rootDir)) {
    const rel = pubEntry.url.replace(/^\.\//, '');
    addEntry(pubEntry.url, path.join(distDir, rel), pubEntry.kind);
  }

  const codeHasher = crypto.createHash('sha256');
  const allHasher = crypto.createHash('sha256');
  let totalBytes = 0;

  for (const item of entries) {
    if (item.kind === 'bundle' || item.kind === 'document') {
      codeHasher.update(`${item.url}:${item.hash}`);
    }
    allHasher.update(`${item.url}:${item.hash}`);
    totalBytes += item.size;
  }

  const codeHash = codeHasher.digest('hex').slice(0, 16);
  const buildHash = allHasher.digest('hex').slice(0, 16);
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');

  return {
    version: `${y}.${m}.${d}-${buildHash.slice(0, 6)}`,
    buildHash,
    codeHash,
    generatedAt: now.toISOString(),
    totalBytes,
    assets: entries,
  };
}

export function diglosaOfflineManifestPlugin(): Plugin {
  let rootDir = process.cwd();
  let outDir = 'dist';

  return {
    name: 'diglosa-offline-manifest',
    configResolved(config) {
      rootDir = config.root;
      outDir = config.build.outDir;
    },
    configureServer(server) {
      server.middlewares.use('/offline-manifest.json', (_req, res) => {
        const manifest = buildDevManifest(rootDir);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.end(JSON.stringify(manifest));
      });
    },
    closeBundle(error?: Error) {
      if (error) return;
      const distDir = path.resolve(rootDir, outDir);
      if (!fs.existsSync(distDir)) return;
      const manifest = buildDistManifest(rootDir, distDir);
      fs.writeFileSync(
        path.join(distDir, 'offline-manifest.json'),
        JSON.stringify(manifest, null, 2),
        'utf-8',
      );
    },
  };
}
