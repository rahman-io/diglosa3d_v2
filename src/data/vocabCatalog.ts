import { CategoryDef, VocabEntry, WordProgress, ZoneId } from '../types/game';

export const MAST_B = 3;

export const CATEGORIES: CategoryDef[] = [
  { id: 0, name: 'Salam & Dasar', icon: '👋', zoneId: 'desa_sapaan' },
  { id: 1, name: 'Angka & Urutan', icon: '🔢', zoneId: 'desa_sapaan' },
  { id: 2, name: 'Warna', icon: '🎨', zoneId: 'desa_sapaan' },
  { id: 3, name: 'Keluarga & Orang', icon: '👨‍👩‍👧', zoneId: 'desa_sapaan' },
  { id: 4, name: 'Tubuh', icon: '🧍', zoneId: 'desa_sapaan' },
  { id: 5, name: 'Makanan', icon: '🍎', zoneId: 'pasar_rasa' },
  { id: 6, name: 'Minuman & Dapur', icon: '🥤', zoneId: 'pasar_rasa' },
  { id: 7, name: 'Hewan', icon: '🐶', zoneId: 'hutan_satwa' },
  { id: 8, name: 'Rumah', icon: '🏠', zoneId: 'gerbang_kota' },
  { id: 9, name: 'Pakaian & Barang', icon: '👕', zoneId: 'pasar_rasa' },
  { id: 10, name: 'Sekolah & Kantor', icon: '🎒', zoneId: 'gerbang_kota' },
  { id: 11, name: 'Pekerjaan', icon: '💼', zoneId: 'gerbang_kota' },
  { id: 12, name: 'Kota & Tempat', icon: '🏙️', zoneId: 'gerbang_kota' },
  { id: 13, name: 'Transportasi', icon: '🚗', zoneId: 'gerbang_kota' },
  { id: 14, name: 'Alam & Cuaca', icon: '☀️', zoneId: 'hutan_satwa' },
  { id: 15, name: 'Waktu', icon: '⏰', zoneId: 'menara_waktu' },
  { id: 16, name: 'Kata Kerja', icon: '🏃', zoneId: 'menara_waktu' },
  { id: 17, name: 'Kata Sifat', icon: '✨', zoneId: 'menara_waktu' },
  { id: 18, name: 'Tanya, Depan & Sambung', icon: '❓', zoneId: 'gua_portal' },
  { id: 19, name: 'Kata Ganti & Penentu', icon: '👤', zoneId: 'gua_portal' },
  { id: 20, name: 'Kata Keterangan', icon: '⚡', zoneId: 'menara_waktu' },
  { id: 21, name: 'Hobi & Hiburan', icon: '⚽', zoneId: 'hutan_satwa' },
  { id: 22, name: 'Belanja & Kesehatan', icon: '💰', zoneId: 'pasar_rasa' },
  { id: 23, name: 'Kata Bantu & Dasar Tambahan', icon: '🧩', zoneId: 'gua_portal' },
  { id: 24, name: 'Pelengkap Topik A1', icon: '🧺', zoneId: 'gua_portal' },
  { id: 25, name: 'Persiapan IELTS A1', icon: '🎓', zoneId: 'gua_portal' },
];

// Compact curriculum rows across all 26 thematic categories (~450+ unique A1->IELTS words)
const RAW_CATEGORY_WORDS: Record<number, string> = {
  0: `hello=halo|hi=hai|good morning=selamat pagi|good afternoon=selamat siang|good evening=selamat malam|good night=selamat tidur|goodbye=selamat tinggal|bye=sampai jumpa|welcome=selamat datang|please=tolong / silakan|thank you=terima kasih|thanks=makasih|sorry=maaf|excuse me=permisi|yes=ya|no=tidak|okay=baiklah|name=nama|friend=teman|nice=senang / baik|fine=baik-baik saja|great=hebat|help=tolong / bantuan|see you=sampai bertemu lagi|congratulations=selamat|pardon=maaf / ulangi`,
  1: `one=satu|two=dua|three=tiga|four=empat|five=lima|six=enam|seven=tujuh|eight=delapan|nine=sembilan|ten=sepuluh|eleven=sebelas|twelve=dua belas|thirteen=tiga belas|fourteen=empat belas|fifteen=lima belas|sixteen=enam belas|seventeen=tujuh belas|eighteen=delapan belas|nineteen=sembilan belas|twenty=dua puluh|thirty=tiga puluh|forty=empat puluh|fifty=lima puluh|hundred=seratus|thousand=seribu|first=pertama|second=kedua|third=ketiga|number=angka|zero=nol`,
  2: `red=merah|blue=biru|green=hijau|yellow=kuning|black=hitam|white=putih|orange=jingga|pink=merah muda|purple=ungu|brown=cokelat|gray=abu-abu|gold=emas`,
  3: `family=keluarga|mother=ibu|father=ayah|parents=orang tua|brother=saudara laki-laki|sister=saudara perempuan|son=anak laki-laki|daughter=anak perempuan|baby=bayi|child=anak|children=anak-anak|grandmother=nenek|grandfather=kakek|uncle=paman|aunt=bibi|cousin=sepupu|husband=suami|wife=istri|man=pria|woman=wanita|boy=anak laki-laki|girl=anak perempuan|person=orang|people=orang-orang|neighbor=tetangga|guest=tamu`,
  4: `body=tubuh|head=kepala|hair=rambut|face=wajah|eye=mata|ear=telinga|nose=hidung|mouth=mulut|tooth=gigi|neck=leher|shoulder=bahu|arm=lengan|hand=tangan|finger=jari|leg=kaki|foot=telapak kaki|knee=lutut|back=punggung|heart=jantung|stomach=perut|skin=kulit|blood=darah|voice=suara|smile=senyuman`,
  5: `food=makanan|bread=roti|rice=nasi|meat=daging|chicken=ayam|fish=ikan|egg=telur|cheese=keju|butter=mentega|soup=sup|salad=salad|fruit=buah|apple=apel|banana=pisang|grape=anggur|mango=mangga|watermelon=semangka|vegetable=sayuran|carrot=wortel|potato=kentang|tomato=tomat|onion=bawang merah|garlic=bawang putih|sugar=gula|salt=garam|cake=kue|sandwich=roti lapis|pizza=pizza|noodle=mi|chocolate=cokelat|honey=madu|breakfast=sarapan|lunch=makan siang|dinner=makan malam|snack=camilan`,
  6: `water=air|tea=teh|coffee=kopi|milk=susu|juice=jus|lemonade=limun|cup=cangkir|glass=gelas|bottle=botol|plate=piring|bowl=mangkuk|spoon=sendok|fork=garpu`,
  7: `animal=hewan|dog=anjing|cat=kucing|bird=burung|cow=sapi|horse=kuda|sheep=domba|goat=kambing|pig=babi|duck=bebek|lion=singa|tiger=harimau|elephant=gajah|monkey=monyet|bear=beruang|rabbit=kelinci|mouse=tikus|snake=ular|frog=katak|turtle=kura-kura|whale=paus|dolphin=lumba-lumba|shark=hiu|bee=lebah|butterfly=kupu-kupu|ant=semut|eagle=elang|squirrel=tupai|owl=burung hantu|fox=rubah`,
  8: `house=rumah|home=tempat tinggal|room=kamar|bedroom=kamar tidur|bathroom=kamar mandi|kitchen=dapur|living room=ruang tamu|door=pintu|window=jendela|wall=dinding|floor=lantai|roof=atap|garden=taman|bed=tempat tidur|chair=kursi|table=meja|sofa=sofa|lamp=lampu|mirror=cermin|clock=jam dinding|key=kunci|pillow=bantal|blanket=selimut|stairs=tangga|gate=gerbang`,
  9: `clothes=pakaian|shirt=kemeja|t-shirt=kaos|pants=celana panjang|shorts=celana pendek|dress=gaun|skirt=rok|jacket=jaket|coat=mantel|sweater=sweter|shoes=sepatu|socks=kaus kaki|hat=topi|cap=topi pet|glasses=kacamata|watch=jam tangan|bag=tas|umbrella=payung|ring=cincin|belt=ikat pinggang|pocket=saku|wallet=dompet`,
  10: `school=sekolah|classroom=ruang kelas|teacher=guru|student=murid|book=buku|notebook=buku catatan|pen=pulpen|pencil=pensil|eraser=penghapus|ruler=penggaris|desk=meja belajar|blackboard=papan tulis|paper=kertas|page=halaman|homework=pekerjaan rumah|exam=ujian|test=tes|grade=nilai|lesson=pelajaran|subject=mata pelajaran|library=perpustakaan|computer=komputer|office=kantor|letter=surat|dictionary=kamus`,
  11: `job=pekerjaan|work=kerja|doctor=dokter|nurse=perawat|farmer=petani|driver=sopir|chef=koki|cook=juru masak|police=polisi|pilot=pilot|singer=penyanyi|artist=seniman|writer=penulis|engineer=insinyur|manager=manajer|waiter=pelayan|soldier=tentara|dentist=dokter gigi|tailor=penjahit|baker=pembuat roti`,
  12: `city=kota|town=kota kecil|village=desa|street=jalan|road=jalan raya|bridge=jembatan|park=taman kota|market=pasar|shop=toko|supermarket=swalayan|mall=mal|bank=bank|hospital=rumah sakit|station=stasiun|airport=bandara|hotel=hotel|restaurant=restoran|cafe=kafe|museum=museum|mosque=masjid|church=gereja|temple=kuil|beach=pantai|cinema=bioskop|zoo=kebun binatang|center=pusat`,
  13: `car=mobil|bus=bus|train=kereta api|plane=pesawat|ship=kapal|boat=perahu|bicycle=sepeda|motorcycle=sepeda motor|taxi=taksi|truck=truk|ticket=tiket|map=peta|trip=perjalanan|travel=bepergian|wheel=roda|traffic=lalu lintas`,
  14: `sun=matahari|moon=bulan|star=bintang|sky=langit|cloud=awan|rain=hujan|wind=angin|snow=salju|storm=badai|weather=cuaca|tree=pohon|flower=bunga|grass=rumput|leaf=daun|forest=hutan|mountain=gunung|hill=bukit|river=sungai|lake=danau|sea=laut|ocean=samudra|island=pulau|stone=batu|sand=pasir`,
  15: `time=waktu|today=hari ini|tomorrow=besok|yesterday=kemarin|now=sekarang|morning=pagi|afternoon=sore|evening=petang|night=malam|midnight=tengah malam|day=hari|week=minggu|month=bulan|year=tahun|hour=jam|minute=menit|Monday=Senin|Tuesday=Selasa|Wednesday=Rabu|Thursday=Kamis|Friday=Jumat|Saturday=Sabtu|Sunday=Minggu|January=Januari|February=Februari|weekend=akhir pekan|early=lebih awal|late=terlambat`,
  16: `be=menjadi|have=mempunyai|do=melakukan|go=pergi|come=datang|walk=berjalan|run=berlari|jump=melompat|sit=duduk|stand=berdiri|sleep=tidur|wake=bangun|eat=makan|drink=minum|read=membaca|write=menulis|speak=berbicara|talk=bercakap|listen=mendengarkan|hear=mendengar|look=melihat|watch=menonton|play=bermain|learn=belajar|study=mempelajari|teach=mengajar|know=mengetahui|think=berpikir|remember=mengingat|forget=melupakan|love=mencintai|like=menyukai|want=ingin|need=membutuhkan|give=memberi|take=mengambil|buy=membeli|sell=menjual|pay=membayar|open=membuka|close=menutup|start=memulai|stop=berhenti|finish=menyelesaikan|make=membuat|build=membangun|find=menemukan|lose=kehilangan|protect=melindungi|save=menyelamatkan|wait=menunggu|travel=pergi jauh|smile=tersenyum|laugh=tertawa|cry=menangis|sing=menyanyi|dance=menari|cook=memasak|clean=membersihkan|wash=mencuci`,
  17: `good=baik|bad=buruk|big=besar|small=kecil|tall=tinggi|short=pendek|long=panjang|new=baru|old=lama / tua|young=muda|hot=panas|cold=dingin|warm=hangat|cool=sejuk|fast=cepat|slow=lambat|easy=mudah|difficult=sulit|hard=keras / sulit|soft=lembut|happy=bahagia|sad=sedih|angry=marah|tired=lelah|hungry=lapar|thirsty=haus|rich=kaya|poor=miskin|clean=bersih|dirty=kotor|beautiful=indah|ugly=buruk rupa|strong=kuat|weak=lemah|heavy=berat|light=ringan|bright=terang|dark=gelap|delicious=lezat|spicy=pedas|fresh=segar|expensive=mahal|cheap=murah|crowded=ramai|quiet=tenang|safe=aman|dangerous=berbahaya|punctual=tepat waktu|important=penting|famous=terkenal`,
  18: `what=apa|who=siapa|where=di mana|when=kapan|why=mengapa|how=bagaimana|which=yang mana|in=di dalam|on=di atas|under=di bawah|near=dekat|behind=di belakang|between=di antara|inside=di dalam|outside=di luar|with=dengan|without=tanpa|for=untuk|from=dari|to=ke|and=dan|but=tetapi|or=atau|because=karena|so=jadi|if=jika|although=meskipun|however=namun|therefore=oleh karena itu|meanwhile=sementara itu|unless=kecuali jika|until=sampai`,
  19: `I=saya|you=kamu|he=dia laki-laki|she=dia perempuan|it=itu (benda)|we=kami / kita|they=mereka|my=milikku|your=milikmu|his=miliknya (lk)|her=miliknya (pr)|our=milik kami|their=milik mereka|this=ini|that=itu|these=ini semua|those=itu semua|some=beberapa|any=apa pun|many=banyak (terhitung)|much=banyak|all=semua|every=setiap|other=lainnya`,
  20: `always=selalu|usually=biasanya|often=sering|sometimes=kadang-kadang|seldom=jarang|never=tidak pernah|here=di sini|there=di sana|everywhere=di mana-mana|soon=segera|already=sudah|still=masih|together=bersama|alone=sendirian|very=sangat|really=benar-benar|quickly=dengan cepat|slowly=dengan perlahan|straight=lurus|carefully=dengan hati-hati`,
  21: `hobby=hobi|game=permainan|sport=olahraga|football=sepak bola|basketball=bola basket|swimming=berenang|music=musik|song=lagu|movie=film|story=cerita|picture=gambar|photo=foto|camera=kamera|guitar=gitar|piano=piano|party=pesta|gift=hadiah|holiday=liburan|fun=menyenangkan|adventure=petualangan`,
  22: `money=uang|price=harga|cost=biaya|coin=koin|bill=tagihan|sale=diskon|customer=pelanggan|receipt=struk|health=kesehatan|medicine=obat|pain=nyeri|fever=demam|cough=batuk|headache=sakit kepala|healthy=sehat|sick=sakit|rest=istirahat|sleepy=mengantuk|doctor visit=periksa dokter|clinic=klinik`,
  23: `can=dapat|could=bisa / dapat|will=akan|would=akan / mau|must=harus|should=sebaiknya|may=boleh|might=mungkin|really want=sangat ingin|true=benar|false=salah|right=benar / kanan|left=kiri|north=utara|south=selatan|east=timur|west=barat|thing=benda|idea=ide|fact=fakta|reason=alasan|problem=masalah|answer=jawaban|question=pertanyaan|way=cara / jalan|place=tempat`,
  24: `box=kotak|cupboard=lemari|basket=keranjang|rope=tali|candle=lilin|fire=api|wood=kayu|iron=besi|silver=perak|diamond=berlian|crystal=kristal|crown=mahkota|ribbon=pita|shield=perisai|sword=pedang|compass=kompas|hourglass=jam pasir|potion=ramuan|magic=sihir|castle=istana`,
  25: `abundant=berlimpah|achieve=mencapai|advantage=keuntungan|analyze=menganalisis|approach=pendekatan|appropriate=sesuai|benefit=manfaat|challenge=tantangan|coherent=terstruktur jelas|compare=membandingkan|conclusion=kesimpulan|consider=mempertimbangkan|context=konteks|contrast=perbedaan|contribute=berkontribusi|create=menciptakan|crucial=sangat penting|culture=budaya|data=data|debate=debat|decision=keputusan|describe=menggambarkan|develop=mengembangkan|difference=perbedaan|discuss=mendiskusikan|economy=ekonomi|education=pendidikan|effect=dampak|efficient=efisien|environment=lingkungan|essential=esensial|evidence=bukti|example=contoh|experience=pengalaman|explain=menjelaskan|factor=faktor|feature=fitur|global=global|goal=tujuan|impact=pengaruh|improve=meningkatkan|increase=meningkat|inevitable=tak terhindarkan|influence=memengaruhi|information=informasi|issue=isu / topik|knowledge=pengetahuan|method=metode|mitigate=mengurangi dampak|modern=modern|opportunity=kesempatan|opinion=pendapat|percent=persen|pollution=polusi|population=populasi|process=proses|progress=kemajuan|quality=kualitas|reduce=mengurangi|research=penelitian|resilient=tangguh|resource=sumber daya|result=hasil|similar=serupa|solution=solusi|strategy=strategi|summary=ringkasan|support=mendukung|technology=teknologi|trend=tren|ubiquitous=ada di mana-mana`,
};

function buildCatalog(): VocabEntry[] {
  const seen = new Set<string>();
  const out: VocabEntry[] = [];

  for (const cat of CATEGORIES) {
    const raw = RAW_CATEGORY_WORDS[cat.id] || '';
    const pairs = raw.split('|').filter(Boolean);
    for (const pair of pairs) {
      const eqIdx = pair.indexOf('=');
      if (eqIdx <= 0) continue;
      const word = pair.slice(0, eqIdx).trim();
      const meaningId = pair.slice(eqIdx + 1).trim();
      const norm = word.toLowerCase();
      if (seen.has(norm)) continue;
      seen.add(norm);

      const safeId = `v_${cat.id}_${norm.replace(/[^a-z0-9]+/g, '_')}`;
      const cefr: VocabEntry['cefr'] =
        cat.id === 25 ? 'IELTS' : cat.zoneId === 'menara_waktu' || cat.zoneId === 'gua_portal' ? 'B1' : cat.zoneId === 'hutan_satwa' ? 'A2' : 'A1';

      out.push({
        id: safeId,
        word,
        meaningId,
        phonetic: `/${norm}/`,
        exampleEn: `Practice using "${word}" in a sentence.`,
        exampleId: `Latih penggunaan kata "${word}" (${meaningId}) dalam kalimat.`,
        catId: cat.id,
        zoneId: cat.zoneId,
        cefr,
      });
    }
  }
  return out;
}

export const VOCAB_CATALOG: VocabEntry[] = buildCatalog();

export const VOCAB_BY_ID: Record<string, VocabEntry> = Object.fromEntries(
  VOCAB_CATALOG.map((v) => [v.id, v]),
);

export function getWordsForZone(zoneId: ZoneId): VocabEntry[] {
  return VOCAB_CATALOG.filter((v) => v.zoneId === zoneId);
}

export function getWordsForCategory(catId: number): VocabEntry[] {
  return VOCAB_CATALOG.filter((v) => v.catId === catId);
}

export function getWordStatus(p?: WordProgress): 'new' | 'learn' | 'mast' {
  if (!p || p.r + p.w === 0) return 'new';
  return p.b >= MAST_B ? 'mast' : 'learn';
}

export function getWordOfTheDay(): VocabEntry {
  const now = new Date();
  const seed =
    now.getFullYear() * 372 + (now.getMonth() + 1) * 31 + now.getDate();
  return VOCAB_CATALOG[seed % VOCAB_CATALOG.length];
}

// Smart Picker: prioritizes unseen & low-mastery words
export function pickSmartWords(
  pool: VocabEntry[],
  count: number,
  progress: Record<string, WordProgress>,
): VocabEntry[] {
  const scored = pool.map((w) => ({
    w,
    score: (progress[w.id]?.b || 0) + Math.random() * 2.5,
  }));
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, Math.min(count, scored.length)).map((s) => s.w);
}

// Smart Distractors: half from the same category, half from others
export function pickDistractors(target: VocabEntry, count = 3): VocabEntry[] {
  const same = VOCAB_CATALOG.filter(
    (v) => v.catId === target.catId && v.id !== target.id,
  ).sort(() => Math.random() - 0.5);
  const other = VOCAB_CATALOG.filter(
    (v) => v.catId !== target.catId && v.id !== target.id,
  ).sort(() => Math.random() - 0.5);

  const half = Math.ceil(count / 2);
  const picked = [...same.slice(0, half), ...other.slice(0, count - half)];
  if (picked.length < count) {
    const extra = other.slice(half, half + (count - picked.length));
    picked.push(...extra);
  }
  return picked.slice(0, count);
}

// Wave Deal (v3): splits area words across Doors 1,3,4,5 + patrolling Monster squads
export interface AreaWaveDeal {
  doorWords: Record<number, string[]>; // doorIndex -> wordIds
  monsterWaves: string[][]; // wave groups for patrolling monsters
}

export function computeAreaWaveDeal(zoneId: ZoneId): AreaWaveDeal {
  const pool = [...getWordsForZone(zoneId)].sort(() => Math.random() - 0.5);
  const used = new Set<string>();

  const take = (n: number, filterFn?: (v: VocabEntry) => boolean): string[] => {
    const picked: string[] = [];
    for (const v of pool) {
      if (used.has(v.id)) continue;
      if (filterFn && !filterFn(v)) continue;
      used.add(v.id);
      picked.push(v.id);
      if (picked.length >= n) break;
    }
    return picked;
  };

  // Door 0 (cards): 10, Door 2 (listen): 10, Door 3 (type: /^[A-Za-z' ]{2,14}$/): 10, Door 4 (match): 8
  const door0 = take(10);
  const door2 = take(10);
  const door3 = take(10, (v) => /^[A-Za-z' ]{2,14}$/.test(v.word));
  const door4 = take(8);

  // Remaining area words grouped into monster squads using cycle [10,5,3,5,10,3,5,10,5,3]
  const remaining = pool.filter((v) => !used.has(v.id)).map((v) => v.id);
  const cycle = [10, 5, 3, 5, 10, 3, 5, 10, 5, 3];
  const monsterWaves: string[][] = [];
  let idx = 0;
  let c = 0;
  while (idx < remaining.length) {
    const size = cycle[c % cycle.length];
    monsterWaves.push(remaining.slice(idx, idx + size));
    idx += size;
    c++;
  }

  // Group into 4 tangible 3D squads inside the dungeon arena so players fight 4 waves holding all remaining words
  const mergedSquads: string[][] = [[], [], [], []];
  monsterWaves.forEach((w, i) => {
    mergedSquads[i % 4].push(...w);
  });

  return {
    doorWords: {
      0: door0,
      2: door2,
      3: door3,
      4: door4,
    },
    monsterWaves: mergedSquads.filter((s) => s.length > 0),
  };
}
