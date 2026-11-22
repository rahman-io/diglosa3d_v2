import React, { useState } from 'react';
import {
  Compass,
  Crosshair,
  Gamepad2,
  Pickaxe,
  Shield,
  Sparkles,
  Swords,
} from 'lucide-react';
import { WEAPON_ORDER, WEAPONS } from '../data/diglosaCatalog';
import { RpgHudSnapshot } from '../types/game';

type GuideSection = 'all' | 'flow' | 'cave' | 'weapons' | 'controls';

interface GuideTabContentProps {
  hud: RpgHudSnapshot;
}

export const GuideTabContent: React.FC<GuideTabContentProps> = ({ hud }) => {
  const [section, setSection] = useState<GuideSection>('all');

  const show = (key: Exclude<GuideSection, 'all'>) =>
    section === 'all' || section === key;

  return (
    <div className="space-y-4">
      {/* Sub-navigation + Live Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#d6b67c] bg-[#f5e3be]/80 p-2.5">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['all', 'Semua'],
              ['flow', 'Alur Main'],
              ['cave', 'Gua & Blok'],
              ['weapons', 'Senjata & Peluru'],
              ['controls', 'Kontrol HP / PC'],
            ] as Array<[GuideSection, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={`rounded-xl px-2.5 py-1 text-xs font-extrabold transition ${
                section === id
                  ? 'bg-[#78350f] text-amber-100 shadow-sm'
                  : 'bg-[#fff7e6] text-[#5c340f] hover:bg-amber-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono-nums text-[11px] font-extrabold text-[#5c340f]">
          <span className="rounded-lg bg-white/80 px-2 py-0.5">
            👑 {hud.crowns}/6
          </span>
          <span className="rounded-lg bg-white/80 px-2 py-0.5">
            ⛏️ T{hud.pickaxeTier}
          </span>
          <span className="rounded-lg bg-white/80 px-2 py-0.5">
            🧱 {hud.caveShieldBlocksLeft}
          </span>
          <span className="rounded-lg bg-white/80 px-2 py-0.5">
            🧨 {hud.caveTntLeft}
          </span>
          <span className="rounded-lg bg-white/80 px-2 py-0.5">
            🔦 {hud.caveTorchesLeft}
          </span>
        </div>
      </div>

      {/* 1. Alur Petualangan Utama */}
      {show('flow') && (
        <section className="rounded-2xl border-2 border-[#c4a472] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-black text-[#78350f]">
            <Compass className="h-4 w-4 text-amber-600" />
            <span>1. Apa yang Harus Dilakukan? (Alur Petualangan)</span>
          </div>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-[#e7d3ad] bg-[#fffaf0] p-3">
              <div className="text-xs font-black text-[#78350f]">
                ① Ambil Ketapel &amp; Bicara NPC
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-[#5c340f]">
                Ambil <strong>Ketapel Kata (Slot 1)</strong> yang bersinar di rumput Hutan Kata, lalu dekati <strong>Penjaga Wilayah</strong> (tekan <strong>E</strong> / ketuk) untuk belajar kosakata dan mengambil misi.
              </p>
            </div>
            <div className="rounded-xl border border-[#e7d3ad] bg-[#fffaf0] p-3">
              <div className="text-xs font-black text-[#78350f]">
                ② Jelajahi Gua &amp; Buka 5 Pintu
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-[#5c340f]">
                Masuk ke <strong>Gua Wilayah</strong> lewat gerbang, NPC, atau menu <strong>Peta</strong>. Buka <strong>5 Pintu Misi</strong> dan kalahkan <strong>Monster Kata</strong> agar <strong>Bos Wilayah</strong> muncul.
              </p>
            </div>
            <div className="rounded-xl border border-[#e7d3ad] bg-[#fffaf0] p-3">
              <div className="text-xs font-black text-[#78350f]">
                ③ Raih 6 Mahkota &amp; Istana IELTS
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-[#5c340f]">
                Setiap Bos yang kalah memberi <strong>Mahkota</strong> &amp; <strong>Senjata Bos</strong> baru. Kumpulkan 6 Mahkota untuk menantang <strong>4 Penguji &amp; Raja IELTS 3D</strong>!
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 2. Panduan Gua Voxel ala Minecraft */}
      {show('cave') && (
        <section className="rounded-2xl border-2 border-[#0e7490]/50 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-black text-[#0c4a6e]">
            <Pickaxe className="h-4 w-4 text-cyan-600" />
            <span>2. Taktik Gua Voxel (Beliung, Obor &amp; Blok Pelindung)</span>
          </div>

          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
              <div className="flex items-center justify-between text-xs font-black text-[#78350f]">
                <span>⛏️ Beliung Voxel</span>
                <span className="rounded bg-[#78350f] px-1.5 py-0.5 font-mono-nums text-[10px] text-amber-100">
                  Slot 9
                </span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#5c340f]">
                Arahkan ke balok gua lalu tekan <strong>Spasi / Gali</strong> (atau ketuk balok):
              </p>
              <ul className="mt-1.5 space-y-1 text-[11px] text-[#5c340f]">
                <li>• <strong>Batu / Lumut:</strong> Buka jalur &amp; dapat <strong>+1 Blok Pelindung</strong>.</li>
                <li>• <strong>Bijih Berlian (💎):</strong> Tambah berlian untuk beli peluru.</li>
                <li>• <strong>Kristal Hati (❤️):</strong> Pulihkan +1 nyawa Hoot.</li>
                <li>• <strong>Segel Kata (🔮):</strong> Gali atau tekan <strong>E</strong> untuk Kuis Kilat!</li>
              </ul>
            </div>

            <div className="rounded-xl border border-yellow-300 bg-yellow-50/70 p-3">
              <div className="flex items-center justify-between text-xs font-black text-[#854d0e]">
                <span>🔦 Obor Voxel</span>
                <span className="rounded bg-[#854d0e] px-1.5 py-0.5 font-mono-nums text-[10px] text-yellow-100">
                  Slot 0
                </span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#713f12]">
                Tekan <strong>Spasi / Obor</strong> untuk menaruh obor bercahaya di lantai gua.
              </p>
              <div className="mt-2 rounded-lg bg-white/80 p-2 text-[11px] font-semibold text-[#713f12]">
                ✨ Kegunaan: Menerangi lorong gelap <strong>dan membuat monster di dekat cahaya lebih tenang / lambat mengejar</strong>.
              </div>
            </div>

            <div className="rounded-xl border border-sky-300 bg-sky-50/80 p-3">
              <div className="flex items-center justify-between text-xs font-black text-[#075985]">
                <span className="inline-flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Blok Pelindung</span>
                </span>
                <span className="rounded bg-[#0369a1] px-1.5 py-0.5 font-mono-nums text-[10px] text-white">
                  Slot B
                </span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#0c4a6e]">
                Lihat kotak pratinjau biru di depanmu, lalu tekan <strong>Spasi / Pasang</strong> untuk menaruh benteng kubus (<strong>4 HP</strong>):
              </p>
              <ul className="mt-1.5 space-y-1 text-[11px] text-[#0c4a6e]">
                <li>• Menahan laju monster &amp; memblokir peluru Penembak Gelap.</li>
                <li>• <strong>Pelurumu tetap tembus</strong> melewati blok pelindungmu sendiri!</li>
                <li>• Gali dengan <strong>Slot 9 (⛏️)</strong> untuk ambil bloknya lagi.</li>
              </ul>
            </div>
          </div>

          <div className="mt-2.5 space-y-2">
            <div className="flex items-start gap-2 rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-2 text-[11px] font-semibold text-cyan-950">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
              <span>
                <strong>Peti Senjata Rahasia Acak:</strong> Di setiap gua selalu tersembunyi <strong>1 Peti Bercahaya Biru</strong> di sudut acak. Hampiri, ketuk, atau tekan <strong>E</strong> untuk mendapat <strong>Ketapel Kerikil (Slot 8)</strong> + bonus peluru!
              </span>
            </div>
            <div className="rounded-xl border border-rose-300 bg-rose-50/80 px-3 py-2 text-[11px] font-semibold text-rose-950">
              🔥 <strong>Monster &amp; Medan Gua Baru:</strong>
              <ul className="mt-1 space-y-0.5 font-medium">
                <li>• <strong>Creeper Kata &amp; Kelelawar Gua:</strong> Creeper berdesis lalu meledak (tahan pakai <strong>Blok Pelindung</strong>!). Kelelawar menukik dari langit-langit (tembak jatuh untuk +Peluru &amp; +Obor).</li>
                <li>• <strong>Undakan Tebing &amp; Jurang Lava:</strong> Pakai tombol <strong>⬆️ Lompat (J / Shift)</strong> atau susun <strong>Blok Pelindung</strong> sebagai tangga &amp; jembatan untuk mengambil harta di tebing tinggi.</li>
                <li>• <strong>⚒️ Meja Craft &amp; TNT (Slot T):</strong> Temui meja craft dekat pintu masuk gua untuk membuat <strong>Beliung Tier 2/3 (2×–3× cepat)</strong> &amp; <strong>TNT Tambang</strong>!</li>
                <li>• <strong>Retakan Balok &amp; Jebakan:</strong> Balok menampilkan pola retakan bertahap saat digali. Waspadai Lantai Lava/Duri, Penjaga Kejutan, &amp; Batu Runtuh Bos!</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 3. Senjata, Kekuatan & Cara Duel */}
      {show('weapons') && (
        <section className="rounded-2xl border-2 border-[#c4a472] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-black text-[#78350f]">
            <Crosshair className="h-4 w-4 text-rose-600" />
            <span>3. Senjata, Kekuatan &amp; Cara Duel Monster</span>
          </div>

          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-xl border border-[#e7d3ad] bg-[#fffaf0] p-3">
              <div className="text-xs font-black text-[#78350f]">
                🛡️ Perisai Kata Monster (3 Poin)
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-[#5c340f]">
                Setiap senjata punya <strong>Kekuatan Perisai</strong> berbeda untuk memunculkan Kuis Duel monster:
              </p>
              <ul className="mt-1.5 space-y-1 text-[11px] text-[#5c340f]">
                <li>• <strong>Kekuatan 1 (3× tembakan):</strong> Ketapel Kata (1) &amp; Ketapel Kerikil gua (8).</li>
                <li>• <strong>Kekuatan 2 (2× tembakan):</strong> Senjata Bos awal &amp; menengah (Slot 2–5).</li>
                <li>• <strong>Kekuatan 3 (1× tembakan):</strong> Senjata Bos akhir (Slot 6–7).</li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#e7d3ad] bg-[#fffaf0] p-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#78350f]">
                <Swords className="h-3.5 w-3.5 text-rose-600" />
                <span>⚡ Mencari Peluru &amp; Taktik Duel</span>
              </div>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-[#5c340f]">
                <li>• <strong>Cari Peluru:</strong> Kalahkan <strong>Penembak Gelap</strong> bermata merah, buka <strong>Peti Rahasia Gua</strong>, atau buka <strong>Tas → Latihan Kuis Peluru / Beli dengan 💎</strong>.</li>
                <li>• <strong>Duel Rebutan:</strong> Begitu kuis muncul, tekan <strong>AMBIL GILIRAN!</strong> secepatnya agar monster tidak menyerang duluan, lalu pilih jawaban yang tepat!</li>
              </ul>
            </div>
          </div>

          {/* Compact 8-Weapon Power Table */}
          <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {WEAPON_ORDER.map((id, idx) => {
              const w = WEAPONS[id];
              const owned = hud.ownedWeapons.includes(id);
              const shotsNeeded = Math.ceil(3 / Math.max(1, w.shieldDamage));
              return (
                <div
                  key={id}
                  className={`rounded-xl border px-2.5 py-1.5 text-[11px] ${
                    owned
                      ? 'border-emerald-300 bg-emerald-50/70'
                      : 'border-[#e7d3ad] bg-[#fffaf0]/80'
                  }`}
                >
                  <div className="flex items-center justify-between font-black text-[#3b2008]">
                    <span className="truncate">
                      {idx + 1}. {w.name}
                    </span>
                    <span
                      className="ml-1 h-2.5 w-2.5 shrink-0 rounded-sm border border-black/30"
                      style={{ backgroundColor: w.color }}
                    />
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[10px] font-bold text-[#78350f]">
                    <span>Daya {w.shieldDamage}</span>
                    <span>{shotsNeeded}× bidik</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Kontrol HP & Laptop */}
      {show('controls') && (
        <section className="rounded-2xl border-2 border-[#c4a472] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-black text-[#78350f]">
            <Gamepad2 className="h-4 w-4 text-emerald-600" />
            <span>4. Kontrol Bermain (HP &amp; Laptop/Browser)</span>
          </div>

          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
              <div className="text-xs font-black text-emerald-900">
                📱 HP / Layar Sentuh
              </div>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-emerald-950">
                <li>• <strong>Jalan (Floating Joystick):</strong> Sentuh &amp; geser di <strong>mana saja area kiri layar</strong>, joystick langsung muncul di bawah jarimu (atau ketuk lantai sisi kanan).</li>
                <li>• <strong>Putar Kamera:</strong> Geser jari di <strong>area kanan layar</strong> (bisa bersamaan sambil berjalan!).</li>
                <li>• <strong>Lompat &amp; Aksi Cepat:</strong> Tekan <strong>⬆️ Lompat</strong> untuk naik tebing/menyeberangi jurang, dan tombol bulat biru kanan bawah untuk <strong>Tembak / Gali / Obor / Pasang / TNT</strong>.</li>
                <li>• <strong>Pilih Alat/Senjata:</strong> Ketuk kotak Hotbar bawah (<strong>1–8</strong>, <strong>⛏️</strong>, <strong>🔦</strong>, <strong>🧱</strong>, <strong>🧨</strong>).</li>
                <li>• <strong>Gaya Membidik:</strong> Di <strong>Bidik Otomatis</strong> peluru mengunci musuh terdekat. Di <strong>Bidik Bebas</strong> arahkan crosshair secara manual &amp; tekan tombol <strong>Crosshair</strong> untuk Scope!</li>
                <li>• <strong>Interaksi:</strong> Ketuk langsung NPC, Meja Craft, Pintu Misi, Peti, atau Balok, atau tekan tombol pop-up kanan bawah.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3">
              <div className="text-xs font-black text-indigo-900">
                💻 Laptop / Browser PC
              </div>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-indigo-950">
                <li>• <strong>Jalan &amp; Lompat:</strong> Tombol <strong>WASD</strong> / <strong>Panah</strong> untuk jalan · <strong>J</strong> atau <strong>Shift</strong> untuk lompat.</li>
                <li>• <strong>Kamera:</strong> Geser mouse pada layar · Tekan <strong>C</strong> / <strong>F5</strong> untuk ganti mode (3D Belakang / FPS / Depan / Orbit).</li>
                <li>• <strong>Gaya Membidik (Opsi):</strong> <strong>Bidik Otomatis</strong> (kunci target cerdas) atau <strong>Bidik Bebas</strong> (crosshair 360°, Scope via <strong>Klik Kanan / Q</strong>, kunci mouse via <strong>L</strong>).</li>
                <li>• <strong>Hotbar:</strong> <strong>1–8</strong> Senjata · <strong>9</strong> Beliung (⛏️) · <strong>0</strong> Obor (🔦) · <strong>B</strong> Blok Pelindung (🧱) · <strong>T</strong> TNT Tambang (🧨).</li>
                <li>• <strong>Aksi &amp; Interaksi:</strong> <strong>Spasi</strong> / <strong>Klik Kiri</strong> (Tembak/Gali/Obor/Pasang/TNT) · <strong>E</strong> (Bicara/Meja Craft/Pintu/Peti/Segel).</li>
                <li>• <strong>Pintasan Menu:</strong> <strong>M</strong> Peta · <strong>H</strong> Petunjuk · <strong>Esc</strong> Jeda/Tutup.</li>
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
