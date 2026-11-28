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
  playerName?: string;
}

export const GuideTabContent: React.FC<GuideTabContentProps> = ({ hud, playerName }) => {
  const [section, setSection] = useState<GuideSection>('all');
  const resolvedPlayerName = playerName?.trim() || 'Petualang';

  const show = (key: Exclude<GuideSection, 'all'>) =>
    section === 'all' || section === key;

  return (
    <div className="space-y-3">
      {/* Sub-navigation + Live Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/20 bg-slate-950/35 p-2.5">
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
              className={`rounded-xl border px-2.5 py-1 text-xs font-extrabold transition ${
                section === id
                  ? 'border-amber-300/80 bg-amber-500/75 text-slate-950 shadow-sm'
                  : 'border-white/20 bg-slate-950/35 text-slate-200 hover:bg-slate-900/55'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono-nums text-[11px] font-extrabold text-amber-200">
          <span className="rounded-lg border border-white/15 bg-slate-950/45 px-2 py-0.5">
            👑 {hud.crowns}/6
          </span>
          <span className="rounded-lg border border-white/15 bg-slate-950/45 px-2 py-0.5">
            ⛏️ T{hud.pickaxeTier}
          </span>
          <span className="rounded-lg border border-white/15 bg-slate-950/45 px-2 py-0.5">
            🧱 {hud.caveShieldBlocksLeft}
          </span>
          <span className="rounded-lg border border-white/15 bg-slate-950/45 px-2 py-0.5">
            🧨 {hud.caveTntLeft}
          </span>
          <span className="rounded-lg border border-white/15 bg-slate-950/45 px-2 py-0.5">
            🔦 {hud.caveTorchesLeft}
          </span>
        </div>
      </div>

      {/* 1. Alur Petualangan Utama */}
      {show('flow') && (
        <section className="rounded-xl border border-white/20 bg-slate-950/25 p-3.5">
          <div className="flex items-center gap-2 text-sm font-black text-amber-200 [text-shadow:0_1px_2px_rgba(0,0,0,0.92)]">
            <Compass className="h-4 w-4 text-amber-300" />
            <span>1. Apa yang Harus Dilakukan? (Alur Petualangan)</span>
          </div>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-white/15 bg-slate-950/35 p-3">
              <div className="text-xs font-black text-amber-200">
                ① Ambil Ketapel &amp; Bicara NPC
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-200">
                Ambil <strong>Ketapel Kata (Slot 1)</strong> yang bersinar di rumput Hutan Kata, lalu dekati <strong>Penjaga Wilayah</strong> (tekan <strong>E</strong> / ketuk) untuk belajar kosakata dan mengambil misi.
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-slate-950/35 p-3">
              <div className="text-xs font-black text-amber-200">
                ② Jelajahi Gua &amp; Buka 5 Pintu
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-200">
                Masuk ke <strong>Gua Wilayah</strong> lewat gerbang, NPC, atau menu <strong>Peta</strong>. Buka <strong>5 Pintu Misi</strong> dan kalahkan <strong>Monster Kata</strong> agar <strong>Bos Wilayah</strong> muncul.
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-slate-950/35 p-3">
              <div className="text-xs font-black text-amber-200">
                ③ Raih 6 Mahkota &amp; Istana IELTS
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-200">
                Setiap Bos yang kalah memberi <strong>Mahkota</strong> &amp; <strong>Senjata Bos</strong> baru. Kumpulkan 6 Mahkota untuk menantang <strong>4 Penguji &amp; Raja IELTS 3D</strong>!
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 2. Panduan Gua Voxel ala Minecraft */}
      {show('cave') && (
        <section className="rounded-xl border border-cyan-300/35 bg-slate-950/25 p-3.5">
          <div className="flex items-center gap-2 text-sm font-black text-cyan-200 [text-shadow:0_1px_2px_rgba(0,0,0,0.92)]">
            <Pickaxe className="h-4 w-4 text-cyan-300" />
            <span>2. Taktik Gua Voxel (Beliung, Obor &amp; Blok Pelindung)</span>
          </div>

          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-amber-300/30 bg-amber-950/20 p-3">
              <div className="flex items-center justify-between text-xs font-black text-amber-200">
                <span>⛏️ Beliung Voxel</span>
                <span className="rounded border border-amber-300/40 bg-slate-950/60 px-1.5 py-0.5 font-mono-nums text-[10px] text-amber-200">
                  Slot 9
                </span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-200">
                Arahkan ke balok gua lalu tekan <strong>Spasi / Gali</strong> (atau ketuk balok).
              </p>
              <ul className="mt-1.5 space-y-1 text-[11px] text-slate-200">
                <li>• <strong>Batu / Lumut</strong> untuk membuka jalur &amp; dapat <strong>+1 Blok Pelindung</strong>.</li>
                <li>• <strong>Bijih Berlian (💎)</strong> untuk menambah berlian beli peluru.</li>
                <li>• <strong>Kristal Hati (❤️)</strong> untuk memulihkan +1 nyawa {resolvedPlayerName}.</li>
                <li>• <strong>Segel Kata (🔮)</strong> dapat digali atau tekan <strong>E</strong> untuk Kuis Kilat!</li>
              </ul>
            </div>

            <div className="rounded-xl border border-yellow-300/30 bg-yellow-950/20 p-3">
              <div className="flex items-center justify-between text-xs font-black text-yellow-200">
                <span>🔦 Obor Voxel</span>
                <span className="rounded border border-yellow-300/40 bg-slate-950/60 px-1.5 py-0.5 font-mono-nums text-[10px] text-yellow-200">
                  Slot 0
                </span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-200">
                Tekan <strong>Spasi / Obor</strong> untuk menaruh obor bercahaya di lantai gua.
              </p>
              <div className="mt-2 rounded-lg border border-yellow-300/20 bg-slate-950/45 p-2 text-[11px] font-semibold text-yellow-100">
                ✨ Kegunaan obor yaitu menerangi lorong gelap <strong>dan membuat monster di dekat cahaya lebih tenang / lambat mengejar</strong>.
              </div>
            </div>

            <div className="rounded-xl border border-sky-300/35 bg-sky-950/25 p-3">
              <div className="flex items-center justify-between text-xs font-black text-sky-200">
                <span className="inline-flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Blok Pelindung</span>
                </span>
                <span className="rounded border border-sky-300/40 bg-slate-950/60 px-1.5 py-0.5 font-mono-nums text-[10px] text-sky-200">
                  Slot B
                </span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-200">
                Lihat kotak pratinjau biru di depanmu, lalu tekan <strong>Spasi / Pasang</strong> untuk menaruh benteng kubus (<strong>4 HP</strong>).
              </p>
              <ul className="mt-1.5 space-y-1 text-[11px] text-slate-200">
                <li>• Menahan laju monster &amp; memblokir peluru Penembak Gelap.</li>
                <li>• <strong>Pelurumu tetap tembus</strong> melewati blok pelindungmu sendiri!</li>
                <li>• Gali dengan <strong>Slot 9 (⛏️)</strong> untuk ambil bloknya lagi.</li>
              </ul>
            </div>
          </div>

          <div className="mt-2.5 space-y-2">
            <div className="flex items-start gap-2 rounded-xl border border-cyan-300/35 bg-cyan-950/25 px-3 py-2 text-[11px] font-semibold text-cyan-100">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <span>
                <strong>Peti Senjata Rahasia Acak</strong>, di setiap gua selalu tersembunyi <strong>1 Peti Bercahaya Biru</strong> di sudut acak. Hampiri, ketuk, atau tekan <strong>E</strong> untuk mendapat <strong>Ketapel Kerikil (Slot 8)</strong> + bonus peluru!
              </span>
            </div>
            <div className="rounded-xl border border-rose-300/35 bg-rose-950/25 px-3 py-2 text-[11px] font-semibold text-rose-100">
              🔥 <strong>Monster &amp; Medan Gua Baru</strong>
              <ul className="mt-1 space-y-0.5 font-medium text-slate-200">
                <li>• <strong>Creeper Kata &amp; Kelelawar Gua</strong> siap menghadang karena Creeper berdesis lalu meledak (tahan pakai <strong>Blok Pelindung</strong>!) dan Kelelawar menukik dari langit-langit (tembak jatuh untuk +Peluru &amp; +Obor).</li>
                <li>• <strong>Undakan Tebing &amp; Jurang Lava</strong> dapat dilewati memakai tombol <strong>⬆️ Lompat (J / Shift)</strong> atau susun <strong>Blok Pelindung</strong> sebagai tangga &amp; jembatan untuk mengambil harta di tebing tinggi.</li>
                <li>• <strong>⚒️ Meja Craft &amp; TNT (Slot T)</strong> tersedia di dekat pintu masuk gua untuk membuat <strong>Beliung Tier 2/3 (2×–3× cepat)</strong> &amp; <strong>TNT Tambang</strong>!</li>
                <li>• <strong>Retakan Balok &amp; Jebakan</strong> akan menampilkan pola retakan bertahap saat digali. Waspadai Lantai Lava/Duri, Penjaga Kejutan, &amp; Batu Runtuh Bos!</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 3. Senjata, Kekuatan & Cara Duel */}
      {show('weapons') && (
        <section className="rounded-xl border border-white/20 bg-slate-950/25 p-3.5">
          <div className="flex items-center gap-2 text-sm font-black text-amber-200 [text-shadow:0_1px_2px_rgba(0,0,0,0.92)]">
            <Crosshair className="h-4 w-4 text-rose-300" />
            <span>3. Senjata, Kekuatan &amp; Cara Duel Monster</span>
          </div>

          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-xl border border-white/15 bg-slate-950/35 p-3">
              <div className="text-xs font-black text-amber-200">
                🛡️ Perisai Kata Monster (3 Poin)
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-200">
                Setiap senjata punya <strong>Kekuatan Perisai</strong> berbeda untuk memunculkan Kuis Duel monster.
              </p>
              <ul className="mt-1.5 space-y-1 text-[11px] text-slate-200">
                <li>• <strong>Kekuatan 1 (3× tembakan)</strong> pada Ketapel Kata (1) &amp; Ketapel Kerikil gua (8).</li>
                <li>• <strong>Kekuatan 2 (2× tembakan)</strong> pada Senjata Bos awal &amp; menengah (Slot 2–5).</li>
                <li>• <strong>Kekuatan 3 (1× tembakan)</strong> pada Senjata Bos akhir (Slot 6–7).</li>
              </ul>
            </div>

            <div className="rounded-xl border border-white/15 bg-slate-950/35 p-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-200">
                <Swords className="h-3.5 w-3.5 text-rose-300" />
                <span>⚡ Mencari Peluru &amp; Taktik Duel</span>
              </div>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-slate-200">
                <li>• <strong>Cari Peluru</strong> dengan mengalahkan <strong>Penembak Gelap</strong> bermata merah, buka <strong>Peti Rahasia Gua</strong> &amp; <strong>Kuil Sungai Gua</strong> (Harpun), atau buka <strong>Tas → Latihan Kuis Peluru / Beli dengan 💎</strong>.</li>
                <li>• <strong>Duel Rebutan</strong> dimulai begitu kuis muncul, tekan <strong>AMBIL GILIRAN!</strong> secepatnya agar monster tidak menyerang duluan, lalu pilih jawaban yang tepat!</li>
              </ul>
            </div>
          </div>

          {/* Compact 9-Weapon Power Table */}
          <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {WEAPON_ORDER.map((id, idx) => {
              const w = WEAPONS[id];
              const owned = hud.ownedWeapons.includes(id);
              const shotsNeeded = Math.ceil(3 / Math.max(1, w.shieldDamage));
              return (
                <div
                  key={id}
                  className={`rounded-xl border px-2.5 py-1.5 text-[11px] ${
                    owned
                      ? 'border-emerald-300/75 bg-emerald-950/25 text-emerald-100'
                      : 'border-white/15 bg-slate-950/25 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-black text-slate-100">
                    <span className="truncate">
                      {idx + 1}. {w.name}
                    </span>
                    <span
                      className="ml-1 h-2.5 w-2.5 shrink-0 rounded-sm border border-white/60"
                      style={{ backgroundColor: w.color }}
                    />
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[10px] font-bold text-amber-200/90">
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
        <section className="rounded-xl border border-white/20 bg-slate-950/25 p-3.5">
          <div className="flex items-center gap-2 text-sm font-black text-amber-200 [text-shadow:0_1px_2px_rgba(0,0,0,0.92)]">
            <Gamepad2 className="h-4 w-4 text-emerald-300" />
            <span>4. Kontrol Bermain (HP &amp; Laptop/Browser)</span>
          </div>

          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-300/35 bg-emerald-950/20 p-3">
              <div className="text-xs font-black text-emerald-200">
                📱 HP / Layar Sentuh
              </div>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-slate-200">
                <li>• <strong>Jalan (Floating Joystick)</strong> cukup dengan sentuh &amp; geser di <strong>mana saja area kiri layar</strong>, lalu joystick langsung muncul di bawah jarimu (atau ketuk lantai sisi kanan).</li>
                <li>• <strong>Putar Kamera</strong> dengan menggeser jari di <strong>area kanan layar</strong> (bisa bersamaan sambil berjalan!).</li>
                <li>• <strong>Lompat &amp; Aksi Cepat</strong> memakai tombol <strong>⬆️ Lompat</strong> untuk naik tebing/menyeberangi jurang, dan tombol bulat biru kanan bawah untuk <strong>Tembak / Gali / Obor / Pasang / TNT</strong>.</li>
                <li>• <strong>Pilih Alat/Senjata</strong> dengan mengetuk kotak Hotbar bawah (<strong>1–8</strong>, <strong>⛏️</strong>, <strong>🔦</strong>, <strong>🧱</strong>, <strong>🧨</strong>).</li>
                <li>• <strong>Gaya Membidik</strong> pada <strong>Bidik Otomatis</strong> mengarahkan peluru mengunci musuh terdekat, sedangkan di <strong>Bidik Bebas</strong> arahkan crosshair secara manual &amp; tekan tombol <strong>Crosshair</strong> untuk Scope!</li>
                <li>• <strong>Interaksi</strong> dilakukan dengan mengetuk langsung NPC, Meja Craft, Pintu Misi, Peti, atau Balok, atau tekan tombol pop-up kanan bawah.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-indigo-300/35 bg-indigo-950/20 p-3">
              <div className="text-xs font-black text-indigo-200">
                💻 Laptop / Browser PC
              </div>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-slate-200">
                <li>• <strong>Jalan &amp; Lompat</strong> memakai tombol <strong>WASD</strong> / <strong>Panah</strong> untuk jalan · <strong>J</strong> atau <strong>Shift</strong> untuk lompat.</li>
                <li>• <strong>Kamera</strong> digerakkan dengan menggeser mouse pada layar · Tekan <strong>C</strong> / <strong>F5</strong> untuk ganti mode (3D Belakang / FPS / Depan / Orbit).</li>
                <li>• <strong>Gaya Membidik (Opsi)</strong> terdiri dari <strong>Bidik Otomatis</strong> (kunci target cerdas) atau <strong>Bidik Bebas</strong> (crosshair 360°, Scope via <strong>Klik Kanan / Q</strong>, kunci mouse via <strong>L</strong>).</li>
                <li>• <strong>Hotbar</strong> meliputi <strong>1–8</strong> Senjata · <strong>9</strong> Beliung (⛏️) · <strong>0</strong> Obor (🔦) · <strong>B</strong> Blok Pelindung (🧱) · <strong>T</strong> TNT Tambang (🧨).</li>
                <li>• <strong>Aksi &amp; Interaksi</strong> memakai <strong>Spasi</strong> / <strong>Klik Kiri</strong> (Tembak/Gali/Obor/Pasang/TNT) · <strong>E</strong> (Bicara/Meja Craft/Pintu/Peti/Segel).</li>
                <li>• <strong>Pintasan Menu</strong> meliputi <strong>M</strong> Peta · <strong>H</strong> Petunjuk · <strong>Esc</strong> Jeda/Tutup.</li>
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
