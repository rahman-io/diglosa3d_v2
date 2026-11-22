# DOKUMENTASI TEKNIS & PANDUAN LENGKAP GAME **DIGLOSA: PETUALANGAN KATA**

**Versi Aplikasi:** `2.41.0` (`package.json`)  
**Kode Penyimpanan Lokal:** `hoot-a1-v1`  
**Nama Resmi / Pengelola:** Diglosa Edukasi Digital  
**Kontak Resmi:** `rahman.udemy.manager@gmail.com` | WhatsApp CS: `+62 877-5393-5810` | Jam Operasional: Senin–Jumat (08:00–17:00 WIB) | Alamat Operasional: `84316 - SUMBAWA - NUSA TENGGARA BARAT`

---

## DAFTAR ISI

1. [Ringkasan Eksekutif, Identitas & Visi Produk](#bab-1-ringkasan-eksekutif-identitas--visi-produk)
2. [Arsitektur Sistem, Pipeline Build & Server Full-Stack](#bab-2-arsitektur-sistem-pipeline-build--server-full-stack)
3. [Inventaris Struktur Berkas & Aset Lengkap](#bab-3-inventaris-struktur-berkas--aset-lengkap)
4. [Alur Cerita Utama, Tokoh Kunci & Sekuens Pembukaan](#bab-4-alur-cerita-utama-tokoh-kunci--sekuens-pembukaan)
5. [Kurikulum Kosakata A1 (826 Kata / 26 Kategori), Penguasaan & Pemilih Cerdas](#bab-5-kurikulum-kosakata-a1-826-kata--26-kategori-penguasaan--pemilih-cerdas)
6. [Peta Dunia, Navigasi A* & Enam Dunia Dalam](#bab-6-peta-dunia-navigasi-a--enam-dunia-dalam)
7. [Lima Mode Belajar, Kamus Kata & Sistem Timer (`qstrip`)](#bab-7-lima-mode-belajar-kamus-kata--sistem-timer-qstrip)
8. [Sistem Pertarungan, Duel Rebutan, 7 Senjata, Penembak & 6 Pusaka](#bab-8-sistem-pertarungan-duel-rebutan-7-senjata-penembak--6-pusaka)
9. [Istana IELTS / Akademi Ujian (`IX` & `AE`)](#bab-9-istana-ielts--akademi-ujian-ix--ae)
10. [Antarmuka Pengguna (UI), Kontrol & Aksesibilitas](#bab-10-antarmuka-pengguna-ui-kontrol--aksesibilitas)
11. [Sistem Grafis Fluid 2D, Partikel SVG (`FX`), Audio Sintesis & Performa](#bab-11-sistem-grafis-fluid-2d-partikel-svg-fx-audio-sintesis--performa)
12. [Monetisasi VIP, Pembayaran Midtrans, Lisensi B2B & Firestore](#bab-12-monetisasi-vip-pembayaran-midtrans-lisensi-b2b--firestore)
13. [Engine PWA Offline, Pembaruan Otomatis, Keamanan, Analitik & Suite Uji (53 Tes)](#bab-13-engine-pwa-offline-pembaruan-otomatis-keamanan-analitik--suite-uji-53-tes)

---

## Bab 1: Ringkasan Eksekutif, Identitas & Visi Produk

**Diglosa: Petualangan Kata** adalah game petualangan edukasi RPG 2D berbasis web (PWA & Desktop/Mobile) yang menggabungkan pembelajaran **826 kosakata Bahasa Inggris level A1** (dalam 26 kategori tematik) serta latihan persiapan **4 keterampilan Ujian/IELTS** (*Listening, Reading, Writing, Speaking*) ke dalam eksplorasi dunia fantasi kerajaan kata.

Pemain berperan sebagai **Hoot**, anak burung hantu pengelana bertopi petualang, yang dipanggil melalui sepucuk surat dari temannya **Lila** untuk membebaskan **Kerajaan Kata** dari kabut sihir jahat dan monster-monster pelupa kata. Untuk melakukannya, pemain menjelajahi dunia hub (**Hutan Kata**), masuk ke **6 Dunia Dalam** guna menyelamatkan warga dan mengalahkan **6 Bos Besar**, mengumpulkan **6 Mahkota Raja Aksara**, **6 Pita Merah**, **6 Pusaka Ajaib**, dan **7 Senjata**, hingga akhirnya membuka portal menuju **Istana IELTS / Akademi Ujian** di puncak cerita.

### Kemampuan Teknis & Produk Utama
- **Standalone Offline Bundle (`dist/diglosa.html`)**: Seluruh game inti (HTML, CSS, JS, database kata, modul ujian, dan ratusan sprite WebP base64) dapat dikompilasi oleh `build.py` menjadi **satu berkas HTML mandiri** yang bisa berjalan 100% offline.
- **Full-Stack Hybrid Wrapper (`server.ts` + `src/App.tsx`)**: Di lingkungan web/deployment modern, game disajikan melalui Express + Vite SPA yang membungkus `/diglosa.html` dalam `<iframe>` berlayar penuh (`allow="autoplay; fullscreen; microphone; clipboard-write"`) serta menyediakan API pembayaran **Midtrans**, aktivasi **VIP Seumur Hidup**, klaim **Lisensi B2B Sekolah/Bimbel**, dan pemulihan akses berbasis **Firebase Firestore**.
- **Audio Sintesis 100% Prosedural**: Tidak bergantung pada aset audio eksternal (MP3/WAV). Seluruh 14 efek suara dibuat langsung melalui **Web Audio API**, sedangkan pelafalan bahasa Inggris memanfaatkan **Web Speech API (`speechSynthesis`)** dan latihan berbicara memanfaatkan **SpeechRecognition API**.

---

## Bab 2: Arsitektur Sistem, Pipeline Build & Server Full-Stack

Proyek ini memiliki dua lapisan arsitektur yang bekerja berdampingan serta satu set modul React alternatif di repositori:

### 2.1. Arsitektur Runtime Aktif (Express + Vite + Iframe Standalone)
1. **Server Entry (`server.ts`)**:
   - Berjalan di port `3000` (konfigurasi `tsx server.ts` di dev, `node server.ts` di produksi).
   - Menginisialisasi `firebase-admin` menggunakan konfigurasi dari `firebase-applet-config.json` dengan fallback in-memory Map jika kredensial admin belum aktif (misalnya untuk uji coba lokal).
   - Menangani rute API backend `/api/payment/*` dan `/api/license/*`.
   - Memasang middleware Vite (`vite.middlewares`) dalam mode development dan menyajikan static bundle + fallback `index.html` di produksi.
2. **Shell React (`src/App.tsx`)**:
   - Merender `<iframe id="diglosa-game" src="/diglosa.html" />` penuh layar (`w-screen h-screen overflow-hidden`).
   - Mengatur pemfokusan otomatis ke dalam iframe saat halaman dimuat maupun saat pengguna mengklik atau menekan tombol keyboard, sehingga kontrol WASD/Panah langsung responsif tanpa klik tambahan.
3. **Catatan Modul React Alternatif (`src/components/*`, `src/data/*`, `src/utils/*`)**:
   - Di dalam `src/` terdapat pula komponen-komponen React/TypeScript terpisah seperti `TitleScreen.tsx`, `IeltsAcademy.tsx`, `gameData.ts`, `ieltsData.ts`, `vocab.ts`, dan `AppContext.tsx` (yang merupakan versi penulisan ulang/komponen React murni).
   - Pada runtime aktif saat ini, yang benar-benar dimainkan pengguna adalah hasil kompilasi `src/template.html` (`/diglosa.html` di dalam iframe), sementara `IeltsAcademy.tsx` dan berkas `src/data/*` tidak langsung dipanggil oleh `src/App.tsx`. Terdapat perbedaan penting antara keduanya (misalnya `ielts.template.html` memakai skor persentase `>=70%`, sedangkan `IeltsAcademy.tsx` memakai simulasi Band `3.5–9.0`).

### 2.2. Pipeline Build Game Inti (`build.py`)
Skrip Python `build.py` merakit seluruh game inti ke `dist/diglosa.html` dan `dist/preview.jpg`:
1. **Validasi & Parsing Kosakata (`src/words.txt`)**:
   - Membaca format `# Nama Kategori|Emoji` dan baris pasangan `kata_inggris=arti_indonesia`.
   - Melakukan validasi ketat (`assert`): minimal **700 kata** dan setiap kata Inggris wajib **unik** (saat ini terverifikasi tepat **826 kosakata unik level A1** dalam **26 kategori**).
2. **Kompilasi Sub-Modul Ujian (`src/ielts.template.html`)**:
   - Mengubah HTML/CSS/JS `ielts.template.html` via regex menjadi modul terenkapsulasi `const IX = (() => { ... })()`.
   - Menyuntikkan jembatan `HOST`:
     - `HOST.S()` -> berbagi objek penyimpanan state utama `S`.
     - `HOST.win(mode, pct)` -> setiap penyelesaian modul Ujian menambahkan `Math.round(pct / 5)` XP (maks +20 XP), dan `full` test menambah **+30 XP**, serta menyalakan `sfx.win()`.
     - `HOST.back()` -> menutup Akademi (`IX.close()`) dan mengembalikan pemain ke Peta Dunia `hutan`.
   - Menyuntikkan `src/mq_ielts.js.txt` ke placeholder `/*__MQ_JS__*/` sebagai engine `AE` (*Academy Engine* untuk monster bayangan & 21 soal mini Ujian di aula Istana).
3. **Penskoping CSS (`src/css_scope.py`)**:
   - Mem-parsing CSS secara struktural (`scope_css`) sambil tetap mempertahankan blok `@keyframes` global:
     - `src/adventure.css` (528 baris) -> di-scope di bawah `html[data-skin="petualangan"]`.
     - `src/ielts_adv.css` (75 baris) -> di-scope di bawah `#xapp` (`keep_keyframes=False`).
     - CSS perjalanan (`travel_css`), strip timer (`strip_css`), dan layar judul (`title.css`) dirangkai ke slot masing-masing.
4. **Inlining Aset Grafis Base64 WebP**:
   - Mengonversi seluruh aset `.webp` dari `src/maps/`, `src/hero/`, `src/weapons/`, `src/monsters/`, `src/npc/`, `src/portraits/`, `src/ui/forest/`, `src/ui/common/`, dan `src/owl/` menjadi Data URI `data:image/webp;base64,...` beserta metadata JSON posisi grip/frame NPC.
5. **Injeksi JavaScript Judul (`src/title.js.txt`) & Output**:
   - Menghasilkan `dist/diglosa.html` yang mandiri serta menyalin `src/title/preview.jpg` menjadi `dist/preview.jpg`.

### 2.3. Pipeline Sanitasi & Deployment (`tools/make_deploy.py`)
Saat aplikasi disiapkan untuk rilis/hosting statis atau GitHub Pages:
- **Netralisasi Merek Ujian**: Mengganti string `"IELTS"` menjadi `"Ujian"` / `"Exam"` dan menghapus tautan `ielts.org` pada hasil deploy publik.
- **Anti-Index Mesin Pencari**: Menyisipkan `<meta name="robots" content="noindex, nofollow">`, serta membuat `robots.txt` dan `.nojekyll`.
- **Self-Hosting Font**: Mengganti tautan Google Fonts dengan `@font-face` lokal menunjuk ke `fonts/*.woff2` (Nunito, Cinzel, Fredoka, Lilita One).
- **Analitik GoatCounter**: Menyuntikkan skrip `<script data-goatcounter="https://<gc>.goatcounter.com/count">` jika flag analytics diaktifkan.
- **PWA Fingerprinting (`precache.json`)**: Menghitung hash SHA-1 seluruh file statis deploy, menyisipkan tag `<meta name="dg-pwa" content="<sha1-10>" data-mb="...">`, manifest, apple-touch-icon, dan menuliskan daftar aset ke `precache.json`.

### 2.4. Pipeline CI/CD (`.github/workflows/`)
- **`ci.yml`**: Berjalan dengan Node 22 dan Python 3.12 (timeout 30 menit). Menjalankan `python build.py`, menginstal dependensi tes (`npm ci` di `tests/`), menjalankan seluruh 53 berkas uji (`npm test`), dan mengunggah artefak `dist/diglosa.html` serta `dist/preview.jpg`.
- **`pages.yml`**: Pada push ke branch `main`, membangun versi deploy publik dengan OpenGraph URL (`SITE_URL`), `sitemap.xml`, dan memublikasikannya ke GitHub Pages.

---

## Bab 3: Inventaris Struktur Berkas & Aset Lengkap

### 3.1. Akar Repositori & Konfigurasi
- `package.json`: Skrip `dev` (`tsx server.ts`), `build` (`vite build`), `start` (`node server.ts`), `lint`; dependensi utama `express`, `firebase`, `firebase-admin`, `midtrans-client`, `lucide-react`, `react`, `react-dom`, `dotenv`, serta Tailwind CSS v4.
- `metadata.json`: Identitas proyek `"Diglosa"` beserta izin `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`.
- `firebase-blueprint.json`, `firebase-applet-config.json`, `firestore.rules`: Definisi skema dan aturan keamanan Firestore.
- `manifest.webmanifest`, `sw.js`, `precache.json`: Manifest PWA (`standalone`, orientasi `any`, tema `#1b5e3a`) dan Service Worker cache-first + pembaruan delta.

### 3.2. Sumber Inti (`/src/`)
- `src/template.html` (3.298 baris): Jantung seluruh game petualangan, peta SVG, logika duel, 5 mode belajar, audio, FX, cerita, VIP modal, dan diagnostic hook.
- `src/ielts.template.html` (849 baris): Aplikasi terintegrasi untuk Istana IELTS / Akademi Ujian (4 keterampilan + Full Test).
- `src/words.txt` (852 baris): Kurikulum 826 kata A1 dalam 26 kategori.
- `src/title.js.txt` & `src/title/`: Skrip dan gaya menu pembuka permainan.
- `src/mq_ielts.js.txt`: Engine AI monster bayangan Akademi dan 21 bank soal mini (`MQ`).
- `src/adventure.css` (528 baris) & `src/ielts_adv.css` (75 baris): Seluruh animasi NPC, hero, duel, kabut, tombol HUD, dan tema Istana.
- `src/css_scope.py`: Parser CSS ke cakupan HTML tertentu.

### 3.3. Aset Visual Tersedia (Base64-Inlined saat Build)
- **Peta & Layar Judul (`src/maps/`)**: 9 gambar WebP (Hutan Kata, Desa Sapaan, Pasar Rasa, Hutan Satwa, Gerbang Kota, Menara Waktu, Gua Portal, Istana IELTS, dan latar belakang Title Screen).
- **Sprite Hero (`src/hero/`)**: 6 sprite sheet (pose diam/idle, jalan 6-frame, lari/sepatu, berkedip `hb1`/`hb2`, dan pose menembak 6 kolom — 3 sudut bidik x 2 fase hentak).
- **Senjata & Peluru (`src/weapons/`)**: 1 sprite sheet senjata & ikon peluru baterai (`WCELL`).
- **Monster (`src/monsters/`)**: 12 sprite sheet monster berkedip (*blink*) + 7 sprite sheet monster berjalan (*walk*).
- **NPC Beranimasi (`src/npc/`)**: 8 set karakter (Kakek Sapa, Koki Mimi, Rimba, Penjaga Gerbang, Penjaga Waktu, Nyonya Portal, Lila, Raja Aksara) — masing-masing memiliki 5 gambar state (`idle`, `blink`, `walk`/`call`, `happy`, dll.) beserta berkas `.json` koordinat pivot/ukuran.
- **Potret Penguji & NPC Dialog (`src/portraits/`)**: 4 potret penguji IELTS beresolusi tinggi (Sera, Bima, Ayu, Rangga / Penguji).
- **Burung Hantu Hoot (`src/owl/`)**: 9 frame animasi terbang, meluncur, mendarat, diam, dan terbang menjauh.
- **Ikon Antarmuka (`src/ui/forest/` & `src/ui/common/`)**: 26 ikon UI bertema hutan (seperti ikon `well`, `bridge`, `pot`, `shop`, `clock`, `cave`, dll.) dan 8 ikon umum antarmuka.

### 3.4. Perangkat Bantu (`/tools/` — 19 Berkas)
Kumpulan skrip Python pengolah aset dan geometri peta:
- Penghasil mask & rintangan lingkaran otomatis per peta: `village_mask.py`, `village_obstacles.py`, `market_mask.py`, `market_obstacles.py`, `satwa_mask.py`, `satwa_obstacles.py`, `kota_mask.py`, `kota_obstacles.py`, `waktu_mask.py`, `waktu_obstacles.py`.
- Generator sprite & UI: `make_sprites.py`, `make_npc.py`, `make_owl.py`, `make_ielts_portraits.py`, `make_forest_ui.py`, `make_forest_interact.py`, `make_common_ui.py`, `make_icons.py`.
- Script sanitasi & distribusi: `make_deploy.py`.

---

## Bab 4: Alur Cerita Utama, Tokoh Kunci & Sekuens Pembukaan

### 4.1. Premis Cerita
Kerajaan Kata diselimuti kabut kelupaan yang mencuri kemampuan warga untuk berbicara dan mengingat kata-kata Bahasa Inggris dasar. Setiap wilayah dikuasai oleh seorang bos monster dan para pengikutnya yang mengunci pintu-pintu pengetahuan.

### 4.2. Sekuens Pembukaan Interaktif (*Opening Story*)
Ketika simpanan baru dimulai (`S.xp === 0` dan belum ada tanda `intro`), pemain langsung disambut sekuens pembuka tanpa menu kaku:
1. **Kedatangan Burung Hantu Hoot (`owlFly` — 2,8 detik)**: Burung hantu pos terbang melintasi layar sambil mengepakkan sayap dan menjatuhkan sepucuk **surat beramplop (`✉️`)**. Pemain dapat menekan tombol `Lewati cerita ▶▶` kapan saja untuk melompat langsung ke depan Pintu Ungu.
2. **Surat dari Lila (`RPG_LILA`)**: Lila menulis dari **Desa Sapaan**, memohon bantuan Hoot untuk datang karena warga desa tiba-tiba lupa cara menyapa dan cucunya, **Rani**, ikut hilang di balik kabut.
3. **Berlari ke Portal Ungu (`rpgRunToDoor`)**: Hoot secara otomatis berjalan/berlari menuju `Portal Ungu` (`DOOR`).
4. **Amanat Raja Aksara (`RPG_RAJA`)**: Dari balik portal kerajaan, **Raja Aksara** menjelaskan kondisi Kerajaan Kata: 6 area harus diselamatkan untuk mengumpulkan **6 Mahkota Raja** guna membuka **Istana IELTS**.
5. **Petunjuk Terakhir & Kepergian Hoot (`owlLand` 1,1 detik -> `RPG_HINT` -> `owlLeave` 0,9 detik)**: Burung hantu pembawa pesan mendarat di dekat Hoot, menjelaskan kontrol dasar bergerak, senjata pertama di rumput, dan cara belajar lewat pintu/monster, lalu terbang pergi meninggalkan Hoot memulai petualangan.

### 4.3. Sistem Progresi Cerita: Kabut, Pita Merah, Mahkota & Mode Cerita
- **Kabut Wilayah (`.mist`)**: Setiap dunia dalam ditutupi kabut atmosferik yang menyala-nyala redup. Begitu bos wilayah dikalahkan (`areaDone(id) === true`), kabut terangkat dramatis selama 2,6 detik (`.mist.lift`) disertai `sfx.win()`, lalu penjaga NPC area berjalan menghampiri Hoot (`rpgWalkThenOpen`) mengucapkan terima kasih (`THANKS` + dialog khas area).
- **6 Pita Merah (`RIBBONS`) & 6 Mahkota (`crowns`)**:
  - Setiap menaklukkan bos di satu dunia dalam, pemain menerima **1 Mahkota** (dari total 6 untuk membuka Istana IELTS) dan **1 Pita Merah** tanda kehormatan area yang tercatat di status & tas petualangan.
- **Dialog Kekalahan (`defeatExit`)**: Jika nyawa Hoot habis di dalam dunia dalam, ia **tidak mengalami Game Over permanen**. Hoot dikembalikan ke Hutan Kata dengan nyawa dipulihkan setengah dari kapasitas maksimal (`Math.ceil(S.maxhp / 2)`), mendapat kekebalan sementara `6 detik` (plus minimal `3 detik` saat tiba), dan penjaga area yang bersangkutan langsung menyapanya memberi pilihan **"Kembali ke sana"** atau **"Istirahat dulu"**.
- **Mode Cerita vs Bebas (`storyLocked`)**: Dalam pengaturan default (`Mode Cerita`), pintu menuju **Istana IELTS** terkunci hingga ke-6 mahkota terkumpul. Jika pemain mengganti Opsi ke mode **Bebas** (`S.free`), kunci cerita dibuka (tetap memperhatikan gerbang VIP).

---

## Bab 5: Kurikulum Kosakata A1 (826 Kata / 26 Kategori), Penguasaan & Pemilih Cerdas

### 5.1. Struktur Data Kosakata (`WORDS` & `CATS`)
Database `src/words.txt` membagi **826 kata Bahasa Inggris A1** ke dalam **26 kategori tematik** yang tersebar di 6 Wilayah Kerajaan:

| Indeks | Kategori | Ikon | Jml Kata | Area Penempatan |
|---:|---|---:|---:|---|
| 0 | Salam & Dasar | 👋 | 26 | Area 0 — Desa Sapaan |
| 1 | Angka & Urutan | 🔢 | 30 | Area 0 — Desa Sapaan |
| 2 | Warna | 🎨 | 12 | Area 0 — Desa Sapaan |
| 3 | Keluarga & Orang | 👨‍👩‍👧 | 26 | Area 0 — Desa Sapaan |
| 4 | Tubuh | 🧍 | 24 | Area 0 — Desa Sapaan |
| 5 | Makanan | 🍎 | 42 | Area 1 — Pasar Rasa |
| 6 | Minuman & Dapur | 🥤 | 13 | Area 1 — Pasar Rasa |
| 7 | Hewan | 🐶 | 30 | Area 2 — Hutan Satwa |
| 8 | Rumah | 🏠 | 32 | Area 3 — Gerbang Kota |
| 9 | Pakaian & Barang | 👕 | 22 | Area 1 — Pasar Rasa |
| 10 | Sekolah & Kantor | 🎒 | 25 | Area 3 — Gerbang Kota |
| 11 | Pekerjaan | 💼 | 20 | Area 3 — Gerbang Kota |
| 12 | Kota & Tempat | 🏙️ | 34 | Area 3 — Gerbang Kota |
| 13 | Transportasi | 🚗 | 16 | Area 3 — Gerbang Kota |
| 14 | Alam & Cuaca | ☀️ | 24 | Area 2 — Hutan Satwa |
| 15 | Waktu | ⏰ | 40 | Area 4 — Menara Waktu |
| 16 | Kata Kerja | 🏃 | 80 | Area 4 — Menara Waktu |
| 17 | Kata Sifat | ✨ | 70 | Area 4 — Menara Waktu |
| 18 | Tanya, Depan & Sambung | ❓ | 40 | Area 5 — Gua Portal |
| 19 | Kata Ganti & Penentu | 👤 | 30 | Area 5 — Gua Portal |
| 20 | Kata Keterangan | ⚡ | 22 | Area 4 — Menara Waktu |
| 21 | Hobi & Hiburan | ⚽ | 20 | Area 2 — Hutan Satwa |
| 22 | Belanja & Kesehatan | 💰 | 22 | Area 1 — Pasar Rasa |
| 23 | Kata Bantu & Dasar Tambahan | 🧩 | 37 | Area 5 — Gua Portal |
| 24 | Pelengkap Topik A1 | 🧺 | 21 | Area 5 — Gua Portal |
| 25 | Persiapan IELTS A1 | 🎓 | 68 | Area 5 — Gua Portal |
| **TOTAL** | **26 Kategori** | | **826** | **6 Area (Desa s.d. Gua)** |

### 5.1.1. Rekapitulasi Total Kosakata A1 & Distribusi Tantangan per Area
Total keseluruhan kosakata Bahasa Inggris level A1 yang menjadi tantangan inti di Kerajaan Kata berjumlah tepat **826 kata unik** (lebih dari batas minimal 700 kata pada pemeriksaan build). Seluruh 826 kata tersebut dibagi habis ke 6 Dunia Dalam sebagai berikut:

| Area | Dunia Dalam | Kategori Tercakup | Total Kata | Alokasi Pintu Misi (Kartu/Telinga/Ejaan/Pasang) | Sisa Kata Dibawa Monster Peta |
|---:|---|---|---:|---:|---:|
| 0 | **Desa Sapaan** (`desa`) | 5 kategori (Salam, Angka, Warna, Keluarga, Tubuh) | **118 kata** | 38 kata (10 + 10 + 10 + 8) | **80 kata** |
| 1 | **Pasar Rasa** (`pasar`) | 4 kategori (Makanan, Minuman & Dapur, Pakaian, Belanja & Kesehatan) | **99 kata** | 38 kata (10 + 10 + 10 + 8) | **61 kata** |
| 2 | **Hutan Satwa** (`satwa`) | 3 kategori (Hewan, Alam & Cuaca, Hobi & Hiburan) | **74 kata** | 38 kata (10 + 10 + 10 + 8) | **36 kata** |
| 3 | **Gerbang Kota** (`kota`) | 5 kategori (Rumah, Sekolah & Kantor, Pekerjaan, Kota & Tempat, Transportasi) | **127 kata** | 38 kata (10 + 10 + 10 + 8) | **89 kata** |
| 4 | **Menara Waktu** (`menara`) | 4 kategori (Waktu, Kata Kerja, Kata Sifat, Kata Keterangan) | **212 kata** | 38 kata (10 + 10 + 10 + 8) | **174 kata** |
| 5 | **Gua Portal** (`gua`) | 5 kategori (Tanya/Depan/Sambung, Ganti/Penentu, Kata Bantu, Pelengkap A1, Persiapan IELTS A1) | **196 kata** | 38 kata (10 + 10 + 10 + 8) | **158 kata** |
| **TOTAL** | **6 Dunia Dalam** | **26 Kategori** | **826 kata** | **228 kata misi pintu** | **598 kata monster** |

> **Catatan Tantangan Tambahan di Istana IELTS / Akademi Ujian:** Di luar 826 kosakata A1 tersebut, area puncak Istana juga menantang pemain melalui **21 soal mini bergaya IELTS (`MQ`)** milik Bayangan Akademi (9 soal *True/False/Not Given*, 6 pilihan ganda, 6 isian singkat; dicampur 40% dengan kosakata kategori IELTS/A1) serta modul ujian penuh **Listening (20 soal)**, **Reading (15 soal Academic + 15 soal General Training)**, **Writing (2 tugas)**, dan **Speaking (3 bagian / 7 prompt)**.

### 5.2. Sistem Penguasaan Kata (`MAST_B = 3`) & Status
Setiap entri kata disimpan dalam `S.p[id]` berisi `{ b, r, w }`:
- `r`: jumlah jawaban benar (*right*).
- `w`: jumlah jawaban salah (*wrong*).
- `b`: tingkat kotak penguasaan (*box/mastery*, rentang `0–5`):
  - Jawaban benar bersih (`ok && !noLevel`): `b = Math.min(5, b + 1)`.
  - Jawaban salah (`!ok`): `b = Math.max(0, b - 1)`.
  - Flag `noLevel = true` (terjadi jika pemain mengintip arti di mode Telinga Tajam): `r` bertambah namun `b` **tidak naik**.
- **Tiga Status Kata (`status(w)`)**:
  - `new` (Baru): `r + w === 0`.
  - `learn` (Sedang dipelajari): `r + w > 0` dan `b < 3`.
  - `mast` (Dikuasai): `b >= 3`.
- **Target Harian (`GOAL = 20`)**: Menghitung jumlah jawaban harian pada kunci tanggal berjalan (`S.day`). **Kata Hari Ini (`wotd`)** dipilih deterministik berdasarkan tanggal hari itu agar stabil sepanjang hari.

### 5.3. Sistem Level Pemain (`LV` 1–8)
Setiap kelipatan **150 XP** menaikkan level pemain hingga Level 8 (pada `1050+ XP`):
1. Lv 1 (`0 XP`): **Telur Pemula**
2. Lv 2 (`150 XP`): **Anak Burung**
3. Lv 3 (`300 XP`): **Burung Kecil**
4. Lv 4 (`450 XP`): **Terbang Rendah**
5. Lv 5 (`600 XP`): **Penjelajah Kata**
6. Lv 6 (`750 XP`): **Hoot Cerdik**
7. Lv 7 (`900 XP`): **Kakak Hoot**
8. Lv 8 (`1050+ XP`): **Master A1**

### 5.4. Pemilih Cerdas (`pick`, `distract`) & Pembagian Gelombang (`ensureDeal` v3)
- **`pick(cat, n)`**: Mengurutkan kumpulan kata berdasarkan bobot `(S.p[w.id]?.b || 0) + Math.random() * 2.5` secara menaik, sehingga kata yang belum pernah muncul atau penguasaannya rendah selalu diprioritaskan keluar.
- **`distract(word, n)`**: Mengambil separuh pengecoh dari **kategori yang sama** (`same`) agar cukup menantang, dan sisanya dari kategori lain.
- **Wave Deal (`ensureDeal(ai)` v3)**: Ketika masuk sebuah dunia dalam untuk pertama kalinya (atau belum terbagi), seluruh kata di area tersebut dibagi otomatis secara permanen per berkas simpanan:
  - Misi Pintu 1 (`cards`): **10 kata**.
  - Misi Pintu 3 (`listen`): **10 kata**.
  - Misi Pintu 4 (`type`): **10 kata** yang memenuhi syarat ejaan huruf/spasi/petik panjang 2–14 karakter (`/^[A-Za-z' ]{2,14}$/`).
  - Misi Pintu 5 (`match`): **8 kata**.
  - **Sisa seluruh kata area**: Dipecah ke kelompok-kelompok monster liar yang berkeliaran di peta dengan ukuran siklus **`[10, 5, 3, 5, 10, 3, 5, 10, 5, 3]`**. Artinya, untuk menuntaskan pintu ke-5 dan memunculkan bos, pemain harus membersihkan monster liar yang membawa seluruh sisa kata area tersebut!

---

## Bab 6: Peta Dunia, Navigasi A* & Enam Dunia Dalam

### 6.1. Sistem Geometri Peta & Pathfinding Cerdas
Seluruh peta berdimensi **1000 × 640 unit dunia** (dengan batas bergerak `FB` yang aman dari tepian).
- **Deteksi Rintangan Lingkaran (`SOLID`)**: Setiap pohon, rumah, batu, meja, dinding, hingga posisi NPC memiliki lingkaran tumbukan `[x, y, radius]` hasil pengukuran piksel alat `tools/*_obstacles.py` agar hero dapat meluncur (*wall-sliding*) di sisi objek tanpa nyangkut.
- **`mainRegion()` (Flood-Fill Grid 5-unit)**: Menghitung daerah lantai utama yang benar-benar terhubung dari titik spawn awal sehingga item, monster, dan hadiah pintu tidak akan pernah muncul terkurung di atas genteng, sungai, atau celah terisolasi.
- **`planPath` (Algoritma A* Grid 10-unit)**: Ketika pemain mengetuk layar (*tap-to-move*) atau mengklik objek/NPC jauh, Hoot menghitung rute terpendek dengan pencegahan memotong sudut (*corner-cut prevention*) dan pemangkasan garis lurus (*line-of-sight smoothing*). Jika tersangkut lebih dari 20 frame berturut-turut (*stuck*), rute direset bersih.

### 6.2. Inventaris Lengkap 8 Peta Dunia

#### 1. **Hutan Kata (`hutan`) — Peta Hub Utama**
- **Latar & Konten**: Alun-alun hijau dengan 6 NPC gerbang area dan **Portal Ungu (`DOOR`)** menuju Istana IELTS di bagian atas.
- **Pickups Awal**: **5 Berlian (`gem`)**, **3 Hati (`heart`)**, serta **Senjata Pemula (`ketapel`)** yang tergeletak bersinar kuning di rumput hingga diambil.
- **6 Gerbang Area & NPC**:
  1. `Kakek Sapa` -> Desa Sapaan
  2. `Koki Mimi` -> Pasar Rasa
  3. `Rimba` -> Hutan Satwa
  4. `Penjaga Gerbang` -> Gerbang Kota
  5. `Penjaga Waktu` -> Menara Waktu
  6. `Nyonya Portal` -> Gua Portal (juga menawarkan mode opsional **Tantangan Portal** berisi 15 kata campuran seluruh kategori)
- **Monster & Penembak**: Monster liar berkeliaran sesuai tingkat kesulitan untuk latihan kosakata umum/campuran.

#### 2. **Desa Sapaan (`desa`, Area 0 — 118 Kata)**
- **Konflik Cerita**: Warga lupa salam sapaan dasar; cucu Kakek Sapa bernama **Rani** hilang terkunci di rumahnya.
- **NPC Penjaga**: `Kakek Sapa` (setiap pintu terbuka memulihkan ucapan sapaan desa: *"Good morning... How are you?..."*).
- **5 Pintu Misi**:
  1. `Sumur Tua` -> **Kartu Kilat** (`cards`)
  2. `Jembatan Batu` -> **Duel Rebutan** vs *Gumpal Kecil* (3 HP)
  3. `Lumbung` -> **Telinga Tajam** (`listen`, min 60%)
  4. `Parit` -> **Jago Ejaan** (`type`, min 60%)
  5. `Rumah Rani` -> **Pasang Kartu** (`match`, syarat: 4 pintu + semua monster kata area habis) -> Memicu **Bos Gumpal Salam**
- **Bos Besar**: **Gumpal Salam** (3 Fase × 10 HP = 30 HP total; mekanik standar eskalasi waktu antar fase).
- **Hadiah Penaklukan**: **Pusaka `🗡️ Pedang Kata`**, **Mahkota 1**, **Pita Merah 1**, dan membuka senjata **`Senjata Emas` (`emas`)**.

#### 3. **Pasar Rasa (`pasar`, Area 1 — 99 Kata)**
- **Konflik Cerita**: Pasar makanan sepi dan Mama pemilik kedai sakit karena resep dan nama bahan makanan terlupakan.
- **NPC Penjaga**: `Koki Mimi`.
- **5 Pintu Misi**:
  1. `Panci Bening` -> **Kartu Kilat**
  2. `Lorong Lapak` -> **Duel Rebutan** vs *Lendir Kecil* (3 HP)
  3. `Gudang Bawah` -> **Telinga Tajam**
  4. `Sungai Kuah` -> **Jago Ejaan**
  5. `Lemari Bumbu` -> **Pasang Kartu** -> Memicu **Bos Lendir Kuali**
- **Bos Besar & Mekanik Unik**: **Lendir Kuali** (3 Fase × 10 HP). Pada Fase 2 dan 3, efek **`slime`** memiliki **peluang 55%** untuk melumuri dan menyembunyikan 1 tombol pilihan jawaban salah menjadi **`🟢 ???`**.
- **Hadiah Penaklukan**: **Pusaka `🛡️ Perisai Panci`**, **Mahkota 2**, **Pita Merah 2**, dan senjata **`Senjata Cepat` (`saus`)**.

#### 4. **Hutan Satwa (`satwa`, Area 2 — 74 Kata)**
- **Konflik Cerita**: Hewan-hewan dan saudara kembar/adik bernama **Kiki** tersesat di belantara yang semaknya tumbuh ganas.
- **NPC Penjaga**: `Rimba`.
- **5 Pintu Misi**:
  1. `Genangan` -> **Kartu Kilat**
  2. `Jalur Semak` -> **Duel Rebutan** vs *Semak Kecil* (3 HP)
  3. `Ceruk Pohon` -> **Telinga Tajam**
  4. `Batang Tumbang` -> **Jago Ejaan**
  5. `Akar Berpola` -> **Pasang Kartu** -> Memicu **Bos Semak Gigit**
- **Bos Besar & Mekanik Unik**: **Semak Gigit** (3 Fase × 10 HP). Pada Fase 2 dan 3, efek **`grow: 2`** memulihkan diri bos sebesar **+1 HP (dan +1 max HP fase)** setiap kali pemain menjawab salah (hingga maksimal **2 kali** penyembuhan per fase).
- **Hadiah Penaklukan**: **Pusaka `🎵 Peluit Rimba`**, **Mahkota 3**, **Pita Merah 3**, dan senjata **`Senjata Hijau` (`biji`)**.

#### 5. **Gerbang Kota (`gerbang` / `kota`, Area 3 — 127 Kata)**
- **Konflik Cerita**: Pintu menuju kota tertutup kabut abu-abu; anak perempuan penjaga bernama **Dewi** terjebak di dekat gerbang sekolah.
- **NPC Penjaga**: `Penjaga Gerbang`.
- **5 Pintu Misi**:
  1. `Papan Peta` -> **Kartu Kilat**
  2. `Jalan Bus` -> **Duel Rebutan** vs *Bayangan Kecil* (3 HP)
  3. `Terowongan` -> **Telinga Tajam**
  4. `Titian Layang` -> **Jago Ejaan**
  5. `Pintu Sekolah` -> **Pasang Kartu** -> Memicu **Bos Bayangan Gerbang**
- **Bos Besar & Mekanik Unik**: **Bayangan Gerbang** (3 Fase × 10 HP). Pada Fase 2 dan 3, mekanik **`close`** aktif setiap putaran ke-2: mengunci 1 opsi salah dengan ikon gembok **`🔒`** serta **memangkas waktu reaksi `AMBIL!` sebesar -1 detik** (minimal tersisa 2 detik). Pusaka Sepatu Angin dapat menangkal pengurangan waktu ini.
- **Hadiah Penaklukan**: **Pusaka `👟 Sepatu Angin`**, **Mahkota 4**, **Pita Merah 4**, dan senjata **`Senjata Langit` (`kertas`)**.

#### 6. **Menara Waktu (`waktu` / `menara`, Area 4 — 212 Kata)**
- **Konflik Cerita**: Jam besar menara macet di pukul 7; Penjaga Waktu tak sempat berpamitan ketika muridnya pergi kemarin karena kata kerja, waktu, dan sifat terhenti.
- **NPC Penjaga**: `Penjaga Waktu` (setiap pintu terbuka menggerakkan jarum jam dari *Seven -> Eight -> Nine -> Ten -> Eleven*).
- **5 Pintu Misi**:
  1. `Permukaan Jam` -> **Kartu Kilat**
  2. `Lorong Roda` -> **Duel Rebutan** vs *Jam Pasir Kecil* (3 HP)
  3. `Ruang Lonceng` -> **Telinga Tajam**
  4. `Bandul Panjang` -> **Jago Ejaan**
  5. `Pintu Jam` -> **Pasang Kartu** -> Memicu **Bos Jam Pasir Liar**
- **Bos Besar & Mekanik Unik**: **Jam Pasir Liar** (3 Fase × 10 HP). Pada Fase 2 dan 3, mekanik **`rewind`** aktif setelah setiap 2 soal baru: bos memutar ulang waktu dan memaksa soal sebelumnya (`lastQ`) muncul kembali. Pusaka Jam Pasir Emas dapat membekukan kemampuan ini.
- **Hadiah Penaklukan**: **Pusaka `⏳ Jam Pasir Emas`**, **Mahkota 5**, **Pita Merah 5**, dan senjata **`Senjata Berat` (`jarum`)**.

#### 7. **Gua Portal (`gua`, Area 5 — 196 Kata)**
- **Geometri Khusus**: Area lantai berjalan didefinisikan secara presisi menggunakan poligon gua (`CAVE_POLY`).
- **Konflik Cerita**: Nyonya Portal kehilangan suaranya dan tak bisa melafalkan kata tanya (*Who, What, Where, When, Why*).
- **NPC Penjaga**: `Nyonya Portal` (juga menyertakan pintu keluar serta pintu portal khusus bila seluruh 6 wilayah sudah bebas).
- **5 Pintu Misi**:
  1. `Kolam Ingatan` -> **Kartu Kilat**
  2. `Lorong Kilat` -> **Duel Rebutan** vs *Bayangan Kilat* (**4 HP** — lebih tangguh dari area 0–4)
  3. `Lorong Gema` -> **Telinga Tajam**
  4. `Jembatan Huruf` -> **Jago Ejaan**
  5. `Pintu Teka-Teki` -> **Pasang Kartu** -> Memicu **Bos Hantu Portal**
- **Bos Besar**: **Hantu Portal** (3 Fase × 10 HP).
- **Hadiah Penaklukan**: **Pusaka `🧭 Kompas Tanya`**, **Mahkota 6**, **Pita Merah 6**, dan senjata pamungkas **`Senjata Kristal` (`kristal`)**.

#### 8. **Istana IELTS / Akademi Ujian (`ielts` / `akademi`)**
- Area puncak tempat berkumpulnya **4 Penguji** (`Sera` Listening, `Bima` Reading, `Ayu` Writing, `Rangga` Speaking), **`Raja Penguji`** (Full Test), **`Penjaga Portal`** (kembali ke Hutan Kata), serta **4 tipe Bayangan Akademi** penantang kuis mini (`MQ`). Dibahas mendetail di **Bab 9**.

---

## Bab 7: Lima Mode Belajar, Kamus Kata & Sistem Timer (`qstrip`)

Seluruh 5 mode belajar inti (+ 1 Kamus Kata) dapat diakses langsung dari Pintu Misi dunia dalam maupun melalui daftar permainan cepat (ketika memilih kategori atau semua kata).

### 7.1. Rincian Setiap Mode
1. **Kartu Kilat (`cards`)**:
   - Menampilkan kartu bolak-balik: sisi depan berisi label kategori, kata Bahasa Inggris, dan tombol pelafalan suara TTS; sisi belakang menampilkan arti Bahasa Indonesia beserta kata Inggrisnya.
   - Pintasan keyboard: `Space` / `Enter` untuk membalik kartu, `Panah Kiri` / `Panah Kanan` untuk berpindah/menandai.
   - Tombol **"Sudah hafal"** memberi **`+5 XP`** per kata dan menaikkan status penguasaan.
   - **Mekanik Khusus Pintu Gelombang (*Cek Cepat*)**: Jika mode Kartu Kilat berasal dari misi pembuka pintu dunia dalam (`G.wave && cards && !chk`), setelah kartu selesai dibalik akan langsung memicu **Cek Cepat** berupa **3 soal Kuis Pilihan Ganda** acak dari kartu tersebut. Pintu tetap terbuka apa pun hasilnya, tetapi **hadiah item hati (`addDrop`)** hanya dijatuhkan di luar pintu jika pemain menjawab benar **`>= 2 dari 3`**.
2. **Kuis Kilat (`quiz`)**:
   - Soal pilihan ganda 4 opsi, rasio acak 50/50 antara Inggris -> Indonesia (`en2id`) dan Indonesia -> Inggris (`id2en`).
   - Poin: **`+10 XP` dasar + bonus kombo `Math.min(combo - 1, 5) * 2`** (maksimal **`+20 XP`** per soal).
   - Pintasan keyboard: tombol angka `1`–`4` untuk memilih opsi, `Enter` untuk lanjut.
3. **Telinga Tajam (`listen`)**:
   - Memutar pelafalan kata secara otomatis setelah jeda `350ms` (aksen `en-US`, kecepatan `0.85`), pemain menebak artinya.
   - Poin: **`+12 XP` + bonus kombo**.
   - **Tombol `👁️ Intip arti`**: Menampilkan petunjuk arti Bahasa Inggris/kata, tetapi **memotong XP menjadi separuh (`Math.ceil(gain / 2)`)** dan mengaktifkan `noLevel = true` sehingga tingkat penguasaan `b` kata tersebut tidak naik.
4. **Jago Ejaan (`type`)**:
   - Menampilkan terjemahan + kolom kotak huruf kosong yang harus diketik pemain.
   - Memberikan **maksimal 2 kali percobaan** per kata.
   - **Tombol `Petunjuk`**: Membuka 1 huruf secara bertahap. Poin XP dihitung `Math.max(5, 15 - 3 * jumlah_petunjuk)` (15 XP tanpa petunjuk, turun 3 XP per huruf bantuan, minimal 5 XP).
   - **Timer Lebih Panjang**: Diberi waktu **`1.5x`** lebih lama daripada timer standar (`qSecs`).
5. **Pasang Kartu (`match`)**:
   - Papan pasangan kata Inggris dan artinya (8 pasang pada misi pintu).
   - Menggunakan **1 timer papan keseluruhan (`M_SEC`)**:
     - Santai: **180 detik**
     - Petualang: **120 detik**
     - Pendekar: **90 detik**
   - Poin: **`+8 XP`** per pasangan benar. Skor penyelesaian akhir dihitung `total / Math.max(total, moves)`.
6. **Kamus Kata (`dict`)**:
   - Pencarian langsung seluruh 826 kata, filter status (`Semua`, `Baru`, `Belajar`, `Dikuasai`) dan filter kategori, dilengkapi pemutar pelafalan TTS.

### 7.2. Strip Timer Visual (`qstrip`) & Layar Hasil
- **Durasi Pertanyaan (`Q_SEC`)**:
  - **Santai**: `20 detik` | **Petualang**: `12 detik` | **Pendekar**: `8 detik` *(Mode Jago Ejaan x1.5)*.
  - Dapat dimatikan seluruhnya melalui Opsi (`S.qtimer = 'off'`).
- **Visualisasi Strip (`--p`)**: Memperlihatkan ikon Hoot di sisi kiri dan ikon monster area dari sisi kanan yang terus mendekat seiring progres waktu habis.
- **Layar Hasil & Kelulusan Pintu**:
  - **Bonus Kelulusan (`>= 70%`)**: Mendapat tambahan **`+20 XP`** bonus selesai sesi.
  - **Penilaian Bintang**:
    - `>= 90%` -> **3 Bintang (★★★)** + ledakan **70 konfeti** warna-warni (`sfx.fanfare()`).
    - `>= 60%` -> **2 Bintang (★★)** + syarat minimal membuka pintu misi dalam (`listen`, `type`, `match`).
    - `< 60%` -> **1 Bintang (★)** + efek hujan kelabu `loseFx()` (`sfx.lose()`).

---

## Bab 8: Sistem Pertarungan, Duel Rebutan, 7 Senjata, Penembak & 6 Pusaka

### 8.1. Parameter Keseimbangan Utama (`TUNE`)
Konstanta `TUNE` mengatur ritme petualangan di seluruh peta:
- `hpStart: 5` (nyawa awal), `hpCap: 8` (batas maksimal nyawa melalui hadiah trofi area).
- `regenSec: 90` (1 hati terisi otomatis setiap 90 detik jika di bawah maks).
- `respawnSec: 30` (monster mati muncul kembali setelah 30 detik jika belum selesai).
- `itemBackSec: 90` (item berlian/hati bebas di lantai muncul lagi setelah 90 detik).
- `aggro: 150` (jarak kejar monster), `contact: 38` (jarak sentuh duel), `safe: 90` (radius aman spawn), `spread: 170` (jarak sebar).
- `invHit: 4` detik (kebal setelah kalah/terkena serang), `invKill: 2.5` detik (kebal singkat setelah menang duel).

### 8.2. Tiga Tingkat Kesulitan (`diff`)
| Aspek | **Santai** | **Petualang** | **Pendekar** |
|---|---:|---:|---:|
| Jml Monster Berkeliaran | 0 | 3 | 5 |
| Kecepatan Monster | 0 | 78 | 105 |
| Timer Jawab Soal Duel | Tidak ada | Tidak ada | 12 detik |
| Maks Penembak (*Shooter*) Bersamaan | 0 | 1 | 2 |
| Jeda & Kecepatan Peluru Musuh | — | 2,4 dtk / 150 spd | 1,5 dtk / 230 spd |
| Waktu Reaksi Tombol **`AMBIL!`** | **5 detik** | **3 detik** | **3 detik** |
| Akurasi Tebakan Monster | **40%** | **60%** | **80%** |

### 8.3. Alur & Fase Duel Rebutan
Duel Rebutan berlangsung waktu-nyata menggunakan soal dari kelompok kata monster (atau 30 HP bos terbagi 3 fase):
1. **Fase `ask` (Muncul Tombol `AMBIL!` — atau tombol `Space`)**:
   - Pemain berlomba cepat dengan monster untuk merebut hak menjawab soal.
   - Jika pemain menekan `AMBIL!` sebelum timer `take` habis -> pemain menjawab soal dengan aman tanpa terkena serangan.
   - Jika waktu `take` habis -> **monster yang merebut giliran menebak** menggunakan peluang `guess` (40%/60%/80%). Jika tebakan monster tepat, Hoot kehilangan **`-1 ❤️` nyawa**!
2. **Fase `answer` & `reveal` -> `between`**:
   - Jawaban benar: monster menerima **`1 damage`** (+1 lagi jika memiliki *Pedang Kata* di duel biasa -> 2 dmg/hit). Pemain mendapat **`+2 XP`**, dan setiap pukulan memberi **`+1 peluru`** senjata aktif (setiap kelipatan beruntun ke-3 memberi **`+2 peluru`**, maksimal **10 peluru per duel**).
   - Jawaban salah: pemain kehilangan **`-1 ❤️`** (kecuali ditangkis *Perisai Panci* 1x per duel) dan kombo reset.
3. **Menang / Kabur / Pingsan**:
   - **Menang (`win`)**: Mendapat **`+10 XP`** + **`+1 💎 Berlian`** (di peta dalam dengan aturan `noGems: true`, berlian 0, hadiah diganti drop pintu/trofi), serta seluruh kata milik monster tersebut otomatis tercatat selesai.
   - **Kabur**: Menekan tombol kabur mengakibatkan penalti **`-1 ❤️`** dan efek dorong (*knockback*).
   - **Pingsan (`hp <= 0`)**: Di Hutan Kata nyawa direset dan monster menjauh; di Dunia Dalam memicu `defeatExit` kembali ke Hutan Kata.
4. **Mekanik Khusus Pertarungan Bos (3 Fase × 10 HP)**:
   - Setiap bos berdurasi 30 jawaban benar total (Fase 1, Fase 2, Fase 3 masing-masing 10 HP).
   - Di antara pergantian fase muncul spanduk ancaman bos (`sfx.boss()`).
   - Jika pemain terus bertahan, peluru senjata tetap terisi setiap jawaban benar.

### 8.4. Daftar Lengkap 7 Senjata (`WEAPONS`, Maks 40 Peluru)
Pemain harus mengambil `Senjata Pemula` di rumput Hutan Kata untuk membuka fitur tembak (`gunOwned()`).
- **Isi Ulang Peluru**:
  - Bonus harian: **`+6 peluru ketapel`**.
  - Regenerasi pasif ketapel: **+1 peluru setiap 20 detik** hingga maksimal 5 peluru.
  - Jawab soal duel: **+1 peluru** (+2 setiap 3 beruntun, cap 10).
  - Beli di Tas Senjata: **3 💎 Berlian (`AMMO_COST = 3`)** atau menyelesaikan **kuis 3 soal gratis** untuk mendapat **`+6 peluru`**.

| ID | Nama Senjata | Asal Dunia | Proyektil & Warna | Dmg | Jeda (CD) | Kec. | Pack Beli | Efek Khusus |
|---|---|---|---|---:|---:|---:|---:|---|
| `ketapel` | Senjata Pemula | Hutan Kata | Orb `#4fd8ff` | 1 | 0,50 dtk | 470 | 6 | Regen otomatis s/d 5 peluru |
| `emas` | Senjata Emas | Desa Sapaan | Orb `#ffd24a` | 1 | 0,32 dtk | 500 | 8 | Tembakan cepat stabil |
| `saus` | Senjata Cepat | Pasar Rasa | Orb `#ff7a3a` | 1 | 0,24 dtk | 420 | 10 | *Fire-rate* tercepat |
| `biji` | Senjata Hijau | Hutan Satwa | Orb `#7cf04a` | 1 | 0,55 dtk | 540 | 6 | **`pierce: 1`** (menembus 1 musuh) |
| `kertas` | Senjata Langit | Gerbang Kota | Laser `#7fdcff` | 1 | 0,45 dtk | 600 | 6 | Proyektil sangat cepat |
| `jarum` | Senjata Berat | Menara Waktu | Besar `#ffb347` | **2** | 0,90 dtk | 620 | 4 | **Damage ganda (2 dmg)** |
| `kristal` | Senjata Kristal | Gua Portal | Berlian `#b57cff` | 1 | 0,60 dtk | 500 | 6 | **`spread: 3`** (3 peluru kipas ±0,22 rad) |

- **Perilaku Tembakan (Auto-Aim dalam radius `340 unit`)**:
  - Jika mengenai **Penembak (*Shooter* bersenjata, 3 HP)**: mengurangi HP penembak + mendorongnya mundur. Penembak yang mati memberikan **`+5 XP`**, **peluang 50%** menjatuhkan kotak peluru (`+4` peluru), dan **peluang 35%** menjatuhkan berlian (maks 3 berlian shooter per area).
  - Jika mengenai **Monster Kata atau Bos**: **tidak membunuh mereka**, melainkan memicu animasi marah (`angry` selama 0,65 dtk) dan langsung memulai **Duel Rebutan**!

### 8.5. Enam Pusaka Area (`ITEMS`)
| ID | Nama Pusaka | Area | Efek di Duel Biasa & Bos |
|---|---|---|---|
| `pedang` | `🗡️ Pedang Kata` | Desa Sapaan | `+1 damage` (2 dmg/pukulan) pada duel biasa; di pertarungan **Bos**, setiap **4 jawaban benar beruntun memulihkan `+1 ❤️` nyawa**. |
| `perisai` | `🛡️ Perisai Panci` | Pasar Rasa | Menangkis **1x jawaban salah pertama** per duel tanpa kehilangan nyawa. |
| `peluit` | `🎵 Peluit Rimba` | Hutan Satwa | **Sekali per duel**, menghapus 1 pilihan jawaban salah secara gratis. |
| `sepatu` | `👟 Sepatu Angin` | Gerbang Kota | Menambah **`+1 detik`** waktu reaksi tombol `AMBIL!` (termasuk menangkal efek Bos Bayangan Gerbang). |
| `jam` | `⏳ Jam Pasir Emas` | Menara Waktu | **Sekali per duel**, membekukan giliran monster saat waktu habis sehingga ia gagal menebak/mengulang soal (*rewind*). |
| `kompas` | `🧭 Kompas Tanya` | Gua Portal | Memberikan lencana penanda khusus pada kata yang lebih sering salah daripada benar (`w > r`) agar pemain waspada. |

### 8.6. Trofi Penguasaan Area (`checkWins`)
Setiap area memiliki pencapaian penguasaan kata jangka panjang: jika pemain telah menemui minimal **60% kata area** dan **menguasai penuh (`b >= 3`) minimal 20% katanya**, pemain dianugerahi **`+5 💎 Berlian`**, pemulihan nyawa penuh, dan kenaikan kapasitas maksimal nyawa **`+1 maxhp`** (hingga batas `8 HP`).

---

## Bab 9: Istana IELTS / Akademi Ujian (`IX` & `AE`)

Berlokasi di peta ke-8 (`ielts` / `akademi`), Istana menjadi muara akhir perjalanan setelah pemain menguasai kosakata A1 (atau jika Mode Cerita dibuka ke `Bebas`).

### 9.1. NPC Penguji & Bayangan Akademi (`AE` & `MQ`)
Di lobi Istana terdapat:
- **4 Penguji Spesialis**: `Sera` (Listening), `Bima` (Reading), `Ayu` (Writing), `Rangga` (Speaking).
- **`Raja Penguji`**: Menawarkan **Full Test** gabungan keempat sesi berurutan.
- **`Penjaga Portal`**: Gerbang kembali ke Hutan Kata.
- **Monster Bayangan Akademi (`AE`)**: Terdapat 4 tipe monster patroli (*Bayangan Dengar, Bayangan Baca, Bayangan Tulis, Bayangan Bicara*) yang menantang pemain dengan **21 bank soal mini (`MQ`)** khas Akademi!

### 9.2. Modul Latihan Ujian Terintegrasi (`IX` dari `src/ielts.template.html`)
- **Mode Ujian**: Mendukung pemilihan jalur **Academic** vs **General Training**, serta mode **Latihan (*Practice*)** vs **Ujian (*Exam*)** dengan pengatur waktu resmi.
- **Sistem Skor `IX`**: Menggunakan persentase akurasi murni (`pct`), dengan ambang kelulusan **`>= 70% = Lulus A1`** (secara eksplisit **bukan skor Band 1–9 resmi**; berbeda dari komponen React tak terpakai `IeltsAcademy.tsx` yang memetakan Band 3.5–9.0).
  - Setiap sesi selesai menyumbangkan **`+Math.round(pct / 5)` XP** ke progres global Hoot.
  - Menyelesaikan **Full Test** memberikan **`+30 XP`** ekstra.
- **Rincian 4 Keterampilan di `IX`**:
  1. **Listening (4 Bagian / 20 Soal)**: Menggunakan *SpeechSynthesis* multi-suara (dialog dua pembicara dengan profil nada berbeda) beserta transkrip yang terbuka setelah selesai di mode latihan.
  2. **Reading (3 Bagian / 15 Soal)**: Menyajikan bacaan terpisah untuk jalur Academic maupun General Training dengan soal pilihan ganda, isian singkat, dan Benar/Salah/Tidak Disebutkan.
  3. **Writing (2 Tugas — Task 1 & Task 2)**: Dilengkapi penghitung jumlah kata otomatis, detektor kata penghubung (*connectors*), pemeriksa struktur paragraf, serta tombol **Salin Prompt Umpan Balik** agar tulisan dapat dikoreksi mendetail menggunakan AI eksternal bila diinginkan.
  4. **Speaking (3 Bagian / 7 Prompt — Intro, Cue Card, Discussion)**: Dilengkapi timer persiapan & timer bicara untuk Cue Card, perekaman suara langsung ke teks memakai **Web Speech API (`SpeechRecognition`)**, dan contoh jawaban model.

---

## Bab 10: Antarmuka Pengguna (UI), Kontrol & Aksesibilitas

### 10.1. Layar Judul (`src/title.js.txt`) & Menu Jeda (`PM`)
- **Layar Judul**: Menampilkan ilustrasi istana/hutan dengan judul **Diglosa**, status progres simpanan, tombol **"Lanjutkan"** / **"Petualangan Baru"**, akses cepat **"Mode Belajar"** / **"Peta"**, dan info versi.
- **Menu Jeda (`PM`)**: Dibuka dengan tombol `☰` atau `Esc`. Memuat akses ke **Tas Kata & Senjata**, **Peta Dunia**, **Daftar Misi**, **Pesan Surat**, **Opsi**, **Panduan Bantuan Hoot (`rpgHelp`)**, **Informasi Bisnis & Legalitas**, dan kembali ke Layar Judul.

### 10.2. HUD & Panel Dalam Game
- **HUD Atas & Bawah**: Menampilkan foto/avatar Hoot, Bar Level & XP, jumlah Nyawa (`❤️`), Berlian (`💎`), tombol Senjata & Peluru aktif (`🔫`), pintasan Tas (`🎒`), Misi, Opsi, dan status VIP/Promo.
- **Panel Tas (`Tas Kata & Senjata`)**: Menampilkan daftar **7 Senjata** (ganti senjata aktif & isi ulang peluru dengan 3 berlian atau kuis gratis), **6 Pusaka** beserta status kepemilikannya, dan **6 Pita Merah**.
- **Peta Dunia (`M` / Ikon Peta)**: Memvisualisasikan keenam area + Istana + status kabut/selesai serta tombol teleportasi cepat ke area yang sudah pernah dimasuki.

### 10.3. Kontrol Multi-Perangkat & Aksesibilitas
- **Keyboard Desktop**: `WASD` atau `Tombol Panah` untuk bergerak, `Space`/`Enter` untuk interaksi & tembak/aksi kontekstual, `1–4` saat kuis/duel, `M` buka peta, `Esc` jeda.
- **Kontrol Layar Sentuh Mobile**:
  - **Joystick Dinamis**: Muncul otomatis di area sentuh sebelah kiri untuk pergerakan analog 360 derajat yang halus (opsi dapat diganti ke D-Pad 4 arah di pengaturan).
  - **Tombol Aksi & Tembak Kontekstual**: Di sisi kanan layar (ikon tembak & ikon bicara/buka pintu).
  - **Tap-to-Move**: Mengklik/mengetuk sembarang titik di lantai peta langsung memicu navigasi A* otomatis ke titik tersebut.
  - **`.no-kb` & Auto-Fullscreen**: Deteksi sentuhan otomatis menyembunyikan petunjuk tombol keyboard dan menawarkan mode layar penuh pada perangkat ponsel.

---

## Bab 11: Sistem Grafis Fluid 2D, Partikel SVG (`FX`), Audio Sintesis & Performa

### 11.1. Animasi Karakter Fluid 2D (`frame()` & `HERO_GRIP`)
Untuk mengatasi kekakuan gerakan sprite 2D biasa, Hoot dianimasikan secara prosedural tiap frame:
- **Siklus Langkah Tersinkron Jarak (`HERO_STEP = 6 / 80`)**: Pemilihan frame berjalan mengikuti jarak tempuh aktual (`ADV.wd`), bukan timer tetap, sehingga kaki tidak "tergelincir" di lantai.
- **Fisika Gerak Tubuh**:
  - **`bobY`**: Pantulan vertikal mengikuti sinus siklus langkah.
  - **Bayangan Dinamis**: Bayangan di bawah kaki menyusut sedikit saat Hoot melompat di puncak langkah.
  - **`runTilt` & `stepStr`**: Kemiringan tubuh (*lean*) sebanding kecepatan lari serta efek *squash-and-stretch* halus saat kaki menapak.
  - **Animasi Berhenti (`settle = 0.22 dtk`)**: Osilasi teredam (`sin * exp(-4.5t)`) saat Hoot berhenti tiba-tiba agar terasa membal alami.
  - **Pose Membidik & Hentakan (`HERO_GRIP` & `kick = 0.16 dtk`)**: Memilih 1 dari 3 sudut tembakan (lurus `[24.31, -61.31]`, atas `[21.39, -72.23]`, bawah `[22.37, -46.64]`), memutar objek senjata sesuai sudut bidik ke musuh, dan memundurkan tubuh sesaat akibat rekoil.
  - **Kedipan Mata (`hb1`/`hb2`)**: Timer acak membuat mata Hoot berkedip alami saat diam maupun berjalan.

### 11.2. Animasi NPC & Monster (`adventure.css`)
- **NPC Penjaga**: Memiliki animasi CSS berlapis: napas berirama (`3.8 detik`), kedipan mata periodik (`6.3 detik`), animasi memanggil bantuan/melompat ganda setiap `11 detik` (memunculkan gelembung **"Help! / Tolong!"** saat area belum bebas), serta animasi `near` gembira memantul (`1.25 detik`) saat pemain mendekat.
- **Monster**: Animasi mengambang/berjalan (`.walk`), berkedip, marah sesaat saat ditembak peluru sebelum masuk layar duel, serta penanda jumlah kata yang dibawanya di atas kepala.

### 11.3. Sistem Partikel SVG (`FX`)
Dibatasi ketat hingga maksimal **170 partikel SVG simultan** demi menjaga kelancaran ponsel kelas bawah:
- `fxBurst(x, y, warna, n)`: Pecahan kotak berputar dengan gravitasi (`260`) dan usia acak.
- `fxRing(x, y, warna, r1)`: Gelombang cincin mengembang.
- `fxText(x, y, teks, warna)`: Teks kerusakan/XP melayang dengan outline kontras (`#2b1a10`).
- **Tiga Mode Efek (`fxMode`)**: `full` (penuh), `lite` (jumlah partikel dibagi 3 — aktif otomatis jika OS menyalakan *prefers-reduced-motion*), dan `off`.

### 11.4. Audio Sintesis WebAudio (`sfx` — 14 Efek)
Dibangun dengan osilator gelombang `square`, `triangle`, `sawtooth`, serta `AudioBufferSource` white-noise melalui fungsi `beep()` dan `noise()`:
1. `tick`: bunyi ketukan halus timer (`980Hz`, 18ms).
2. `fanfare`: arpeggio C5–C6 diikuti G5–G6 + noise tepuk tangan (bintang 3).
3. `lose`: nada turun minor beruntun (kekalahan / bintang 1).
4. `shoot`: tembakan dua lapis `640Hz` + `330Hz`.
5. `hit`: tumbukan noise + `210Hz`.
6. `boom`: ledakan berat `95Hz` + `60Hz` + noise `0.38s`.
7. `hurt`: efek terkena serangan `160Hz` sawtooth + noise.
8. `pick`: petik barang `880Hz` -> `1320Hz`.
9. `door`: akor buka pintu naik (`330 -> 495 -> 660Hz`).
10. `boss`: gemuruh kemunculan bos (`110Hz` + `82Hz` + noise panjang).
11. `ok`: konfirmasi jawaban benar (`660 -> 990Hz`).
12. `no`: penolakan / salah / peluru habis (`190Hz`).
13. `win`: melodi kemenangan area (`523 -> 659 -> 784 -> 1047Hz`).
14. `flip`: suara balik kartu (`440Hz`, 50ms).

### 11.5. Mode Diagnostik (`?tes=...`)
Pengembang/penguji dapat menambahkan parameter URL untuk uji performa:
`?tes=fps` (tampilkan penghitung FPS), `tanpakabut` (matikan overlay kabut), `tanpaanim` (hentikan animasi ekstra), `tanpabayangan` (hapus bayangan), atau `semua` (kombinasi lengkap).

---

## Bab 12: Monetisasi VIP, Pembayaran Midtrans, Lisensi B2B & Firestore

### 12.1. Pembatasan Akses Demo vs VIP (`gateOk`)
- **Area Gratis (Demo)**: **Hutan Kata (`hutan`)** sepenuhnya terbuka gratis agar calon pengguna bisa mencoba eksplorasi, pergerakan, menembak, bertarung dengan monster liar, dan mencoba kuis pembuka.
- **Area Berbayar (VIP)**: Masuk ke **Desa Sapaan**, **Pasar Rasa**, **Hutan Satwa**, **Gerbang Kota**, **Menara Waktu**, **Gua Portal**, dan **Istana IELTS** memeriksa `gateOk(to)` (di definisi final `template.html` baris 2992). Jika `S.isVip !== true`, game menahan perpindahan dan membuka **`vipModalHTML`**.
  - *Catatan Teknis*: Meskipun pengguna sudah VIP (`S.isVip === true`), gerbang masuk ke Istana IELTS tetap menghormati progres `storyLocked()` (wajib 6 mahkota kecuali Mode Cerita disetel ke `Bebas`).

### 12.2. Paket Harga & Kode Promo / B2B
Di dalam modal VIP dan server:
1. **Paket VIP Individu (`vip`)**: **Rp 49.000** (*Promo Peluncuran Seumur Hidup*, harga normal Rp 149.000). Membuka seluruh 6 dunia dalam, 826 kata, 6 bos, 7 senjata, dan Istana IELTS.
2. **Paket Lisensi Sekolah / Bimbel (`b2b`)**: **Rp 149.000** (mendapatkan kode kelas untuk maksimal **30 siswa**).
3. **Kode Lisensi Demo / Kampanye Bawaan**:
   - `ENGLISHFIRST2026` (kuota maks 500)
   - `BIMBELVIP2026` (kuota maks 200)
   - `DIGLOSAB2B` (kuota maks 1.000)

### 12.3. API Backend (`server.ts`)
1. `POST /api/payment/create`: Membuat transaksi Midtrans Snap (`midtrans-client`), menghasilkan `orderId`, `snapToken`, `redirectUrl`, serta mendukung mode simulasi sandbox jika kunci server Midtrans belum dikonfigurasi. Mencatat status `pending` ke `vip_purchases`.
2. `POST /api/payment/sandbox-confirm`: Menandai transaksi sandbox sebagai `paid`, menghasilkan `licenseKey` baru (jika paket `b2b`) untuk 30 kursi, dan menyimpannya ke Firestore.
3. `POST /api/payment/webhook`: Menerima notifikasi HTTP resmi Midtrans (`settlement`, `capture`, `cancel`, `deny`, `expire`), memvalidasi tanda tangan & memperbarui status pembayaran secara real-time di Firestore.
4. `POST /api/license/claim`: Memvalidasi kode lisensi/promo dari siswa (`b2b_licenses`), mencegah penggunaan ganda oleh email yang sama di satu kode namun tetap mengembalikan sukses (idempoten), dan menambah `usedSeats` secara atomik selama `< maxSeats`.
5. `POST /api/license/restore`: Mengembalikan status VIP pemain di perangkat baru berdasarkan `email` atau `orderId` yang tercatat `paid` di `vip_purchases` atau klaim aktif di `b2b_licenses`.

### 12.4. Skema Firestore & Security Rules (`firebase-blueprint.json` & `firestore.rules`)
- **`/vip_purchases/{purchaseId}`**: Menyimpan `orderId`, `email`, `plan`, `amount`, `status`, `licenseKey`, `createdAt`, `paidAt`.
- **`/b2b_licenses/{licenseId}`**: Menyimpan `licenseKey`, `orderId`, `maxSeats`, `usedSeats`, `claimedEmails`, `createdAt`.
- **`/users/{userId}`**: Data profil dan hak akses pengguna (`allow read, write: if request.auth != null && request.auth.uid == userId`).
- Pada `firestore.rules`, koleksi `vip_purchases` dan `b2b_licenses` **diblokir untuk penulisan langsung dari sisi klien (`allow write: if false`)** — hanya boleh ditulis oleh server Express via `firebase-admin`.

---

## Bab 13: Engine PWA Offline, Pembaruan Otomatis, Keamanan, Analitik & Suite Uji (53 Tes)

### 13.1. Progressive Web App & Pembaruan Otomatis (`sw.js`, `manifest.webmanifest`, `PWA`)
- **Instalasi Offline (`Pasang di HP` vs `Mainkan dulu`)**: Game mendeteksi event `beforeinstallprompt` (atau panduan manual iOS Safari) dan menampilkan dialog instalasi yang tidak memaksa.
- **Service Worker (`sw.js`) & `precache.json`**:
  - Menyimpan seluruh aset statis (HTML, manifest, ikon, font `.woff2`) secara lokal agar game bisa dibuka tanpa koneksi internet.
- **Pembaruan Delta Otomatis**:
  - Objek `PWA` di dalam game memeriksa berkas `precache.json` setiap **15 menit**, saat jendela kembali fokus (`focus`), atau saat perangkat kembali tersambung (`online`).
  - Jika hash versi (`v`) berubah, sistem hanya mengunduh berkas yang hash SHA-1-nya berbeda, bukan mengunduh ulang seluruh aplikasi.
  - **Reload Aman**: Agar tidak memutus pemain yang sedang bertarung atau mengerjakan kuis, pemuatan ulang halaman (*reload*) hanya dilakukan ketika game berada di **Layar Judul (`TITLE.on`)** dan **tidak ada modal yang terbuka**.

### 13.2. Keamanan Sisi Klien (`lockdown()`) & Analitik
- Fungsi `lockdown()` membekukan/melindungi perilaku runtime penting terhadap manipulasi konsol dasar dan memastikan integritas berjalan bersih di dalam sandbox iFrame.
- **Analitik Event (`track(event, title)`)**: Mengirimkan penghitungan event non-invasif (seperti `mulai-baru`, `cerita-dilewati`, `peluru-habis`, `kalah-<area>`, `area-selamat-<area>`) ke endpoint **GoatCounter** apabila diaktifkan saat build deploy.

### 13.3. Hook Pengujian & Suite Uji Otomatis (53 Berkas Uji)
- **Test Hook (`window.__DG`)**: Aktif hanya apabila `window.__DG_TEST` dinyalakan oleh runner tes. Mengekspos inspeksi langsung ke state `S`, `ADV`, `G`, `PWA`, `CM()`, `owl`, `gun`, `fx`, `sfx`, `planPath`, `ensureDeal`, `bossHere`, dan `areaStats`.
- **Suite Uji (`tests/run_all.js` — 53 Tes Terverifikasi)**:
  1. `01_vocab_games.js` — Logika 5 mode belajar & kurasi kata.
  2. `02_ielts_exam_flows.js` — Alur L/R/W/S & Full Test Istana.
  3. `03_single_style.js` — Konsistensi gaya visual tunggal.
  4. `04_forest_adventure.js` — Peta hub Hutan Kata.
  5. `05_academy_adventure.js` — Eksplorasi Istana & Penguji.
  6. `06_travel_between_maps.js` — Transisi antar peta & animasi.
  7. `07_monsters_lives_gems.js` — Sistem nyawa, berlian, dan monster.
  8. `08_mobile_fullscreen.js` — Responsivitas ponsel & layar penuh.
  9. `09_onscreen_controls.js` — Joystick dinamis & tombol aksi layar.
  10. `10_dialog_style.js` — Tata letak & gaya dialog NPC/RPG.
  11. `11_keyboard_hints.js` — Pintasan keyboard & penyembunyian `.no-kb`.
  12. `12_restrictions.js` — Pembatasan area/mode & penguncian.
  13. `13_npc_solid_and_fullscreen.js` — Tumbukan solid NPC & layar penuh.
  14. `14_spawn_clearance.js` — Radius aman spawn dari musuh & rintangan.
  15. `15_title_and_menu.js` — Layar Judul & Menu Jeda.
  16. `16_css_scope.js` — Penskoping CSS (`css_scope.py`) agar tidak bocor.
  17. `17_painted_forest.js` — Aset gambar Hutan Kata & area bebas.
  18. `18_painted_castle.js` — Aset gambar Istana IELTS.
  19. `19_hero_sprite.js` — Sprite hero berjalan, diam, dan berkedip.
  20. `20_painted_title.js` — Aset visual layar judul.
  21. `21_portal_cave.js` — Geometri poligon & NPC Gua Portal.
  22. `22_branding_seo.js` — Metadata branding, SEO, dan info legalitas.
  23. `23_story_items.js` — 6 Pita Merah, Mahkota, & 6 Pusaka.
  24. `24_area_cleared.js` — Transisi area bebas & pembersihan monster.
  25. `25_village.js` — Pintu, bos, dan cerita Desa Sapaan.
  26. `26_market.js` — Pintu, mekanik `slime`, dan cerita Pasar Rasa.
  27. `27_animal_forest.js` — Pintu, mekanik `grow`, dan cerita Hutan Satwa.
  28. `28_city_gate.js` — Pintu, mekanik `close`, dan cerita Gerbang Kota.
  29. `29_time_tower.js` — Pintu, mekanik `rewind`, dan cerita Menara Waktu.
  30. `30_words_missions_monsters.js` — Pembagian gelombang 826 kata (`ensureDeal`).
  31. `31_shooters_and_effects.js` — Penembak bersenjata & partikel FX.
  32. `32_movement_and_placement.js` — Pathfinding A*, `mainRegion`, & anti-nyangkut.
  33. `33_phone_layout.js` — Tata letak layar sempit di ponsel.
  34. `34_listen_meaning.js` — Fitur `Intip arti` & `noLevel` Telinga Tajam.
  35. `35_weapons_and_ammo.js` — 7 senjata, kapasitas 40, regen, & beli peluru.
  36. `36_shooting_pose.js` — 3 sudut pose menembak & `HERO_GRIP`.
  37. `37_duel_scene.js` — Visual arena Duel Rebutan & rekoil.
  38. `38_question_timer.js` — Strip timer `qstrip` & skala kecepatan.
  39. `39_rpg_dialog_and_fog.js` — Dialog RPG berurutan & pengangkatan kabut.
  40. `40_defeat_shooting_challenge_and_opening_story.js` — Kekalahan `defeatExit` & cerita awal.
  41. `41_opening_story_and_first_weapon.js` — Pengambilan senjata pemula di Hutan.
  42. `42_published_file_and_event_counting.js` — Sanitasi `make_deploy.py` & GoatCounter.
  43. `43_light_fog_and_performance_switches.js` — Switch `?tes=` & mode efek `lite/off`.
  44. `44_install_choice_and_offline_dialog.js` — Dialog pilihan instalasi PWA.
  45. `45_offline_install_in_real_browser.js` — Uji instalasi offline di browser nyata.
  46. `46_automatic_updates_and_install_recommendation.js` — Pembaruan delta `precache.json` otomatis.
  47. `47_animated_npc_sprites.js` — Frame JSON & sprite NPC beranimasi.
  48. `48_npc_animation_in_real_browser.js` — Verifikasi animasi NPC di browser nyata.
  49. `49_lila_dialog_sprite.js` — Sprite dialog karakter Lila.
  50. `50_raja_castle_sprite.js` — Sprite dialog Raja Aksara di Istana.
  51. `51_owl_animation.js` — Animasi 9 frame Burung Hantu Hoot (terbang, mendarat, pergi).
  52. `52_dialog_portraits.js` — Potret dialog 4 penguji IELTS.
  53. `53_forest_ui_assets.js` — Seluruh 26 ikon UI bertema hutan.
