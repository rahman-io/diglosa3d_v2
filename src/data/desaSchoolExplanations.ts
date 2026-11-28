import { CATEGORIES, VOCAB_BY_ID } from './vocabCatalog';
import { VocabEntry } from '../types/game';

export interface DesaTopicGuide {
  catId: number;
  titleId: string;
  subtitleEn: string;
  icon: string;
  summaryId: string;
  grammarRuleId: string;
}

export interface DesaWordExplanation {
  vocabId: string;
  word: string;
  ipa: string;
  artiId: string;
  wordTypeId: string;
  explanationId: string;
  usageTipId: string;
  exampleEn: string;
  exampleId: string;
  categoryTitleId: string;
  categorySummaryId: string;
}

export const DESA_SCHOOL_TOPICS: DesaTopicGuide[] = [
  {
    catId: 0,
    titleId: 'Sapaan & Perpisahan',
    subtitleEn: 'Hello and Goodbye',
    icon: '👋',
    summaryId:
      'Kosakata dasar untuk menyapa, berpamitan, berterima kasih, meminta tolong, meminta maaf, serta menyatakan setuju atau tidak.',
    grammarRuleId:
      'Bedakan "Good evening" (sapaan saat bertemu di malam hari) dengan "Good night" (ucapan berpisah atau sebelum tidur).',
  },
  {
    catId: 1,
    titleId: 'Orang & Panggilan Sopan',
    subtitleEn: 'People',
    icon: '🧑',
    summaryId:
      'Kosakata tentang orang berdasarkan usia, jenis kelamin, hubungan pertemanan, serta gelar sapaan resmi (Mr, Mrs, Miss).',
    grammarRuleId:
      '"Person" dipakai untuk 1 orang (tunggal), sedangkan "People" untuk banyak orang (jamak, tidak perlu ditambah -s).',
  },
  {
    catId: 2,
    titleId: 'Angka 0 sampai 100',
    subtitleEn: 'Numbers 0 to 100',
    icon: '🔢',
    summaryId:
      'Bilangan dasar 0–12, belasan berakhiran -teen (13–19), puluhan berakhiran -ty (20–90), hingga seratus (Hundred).',
    grammarRuleId:
      'Belasan berakhir "-teen" (tekanan di akhir, mis. thir-TEEN), puluhan berakhir "-ty" (tekanan di awal, mis. THIR-ty).',
  },
  {
    catId: 3,
    titleId: 'Keluarga',
    subtitleEn: 'Family',
    icon: '👨‍👩‍👧',
    summaryId:
      'Kosakata anggota keluarga inti dan keluarga besar dalam Bahasa Inggris dari orang tua, anak, kakek-nenek, hingga sepupu dan keponakan.',
    grammarRuleId:
      '"Niece" (keponakan perempuan) dan "Nephew" (keponakan laki-laki) dibedakan gendernya, sedangkan "Cousin" (sepupu) berlaku untuk keduanya.',
  },
  {
    catId: 4,
    titleId: 'Warna-warna',
    subtitleEn: 'Colors',
    icon: '🎨',
    summaryId:
      'Kosakata warna dasar sehari-hari beserta kata keterangan tingkat kecerahan warna seperti Dark (tua/gelap) dan Light (muda/terang).',
    grammarRuleId:
      'Gabungkan "Dark" atau "Light" di depan nama warna untuk menyebut tua/muda, contoh: "light blue" (biru muda), "dark green" (hijau tua).',
  },
  {
    catId: 5,
    titleId: 'Informasi Pribadi',
    subtitleEn: 'Personal Information',
    icon: '🪪',
    summaryId:
      'Kosakata identitas diri untuk perkenalan, pengisian formulir, paspor, alamat, tanggal lahir, dan tanya jawab dasar.',
    grammarRuleId:
      '"Birthday" merujuk pada hari & bulan ulang tahun yang dirayakan tiap tahun, sedangkan "Birthdate" lengkap dengan tahun lahir.',
  },
  {
    catId: 6,
    titleId: 'Bagian Tubuh',
    subtitleEn: 'The Body',
    icon: '🧍',
    summaryId:
      'Kosakata anggota badan utama dari kepala, tangan, lengan, tungkai kaki, lutut, punggung, hingga perut.',
    grammarRuleId:
      '"Leg" adalah keseluruhan tungkai kaki (paha hingga pergelangan), sedangkan "Foot" khusus bagian telapak kaki untuk berpijak.',
  },
  {
    catId: 7,
    titleId: 'Kepala & Wajah',
    subtitleEn: 'The Head and Face',
    icon: '😊',
    summaryId:
      'Kosakata rinci bagian kepala dan wajah seperti rambut, mata, hidung, telinga, pipi, dagu, mulut, gigi, dan bibir.',
    grammarRuleId:
      'Untuk anggota tubuh berpasangan (eye, ear, cheek, lip), tambahkan -s jika menyebut keduanya: "two eyes", "two ears". Bentuk jamak "tooth" adalah "teeth".',
  },
];

const TOPIC_MAP: Record<number, DesaTopicGuide> = Object.fromEntries(
  DESA_SCHOOL_TOPICS.map((t) => [t.catId, t]),
);

interface SpecificWordNote {
  wordTypeId?: string;
  explanationId: string;
  usageTipId: string;
  exampleEn: string;
  exampleId: string;
}

const SPECIFIC_WORD_NOTES: Record<string, SpecificWordNote> = {
  // Cat 0: Hello and Goodbye
  hello: {
    wordTypeId: 'Kata Sapaan (Interjection)',
    explanationId:
      '"Hello" adalah sapaan netral dan sopan yang cocok dipakai kapan saja, baik ke teman maupun orang yang baru ditemui.',
    usageTipId: 'Gunakan di awal percakapan atau saat mengangkat telepon.',
    exampleEn: 'Hello! Nice to meet you today.',
    exampleId: 'Halo! Senang bertemu denganmu hari ini.',
  },
  goodbye: {
    wordTypeId: 'Kata Perpisahan (Interjection)',
    explanationId:
      '"Goodbye" adalah ucapan berpisah yang lebih lengkap dan sopan dibanding "Bye".',
    usageTipId: 'Cocok dipakai kepada guru, orang tua, atau saat berpisah cukup lama.',
    exampleEn: 'Goodbye, teacher! See you tomorrow.',
    exampleId: 'Selamat tinggal, Ibu Guru! Sampai jumpa besok.',
  },
  hi: {
    wordTypeId: 'Kata Sapaan Santai (Interjection)',
    explanationId:
      '"Hi" adalah bentuk santai dan akrab dari "Hello" untuk menyapa teman, keluarga, atau anak seusiamu.',
    usageTipId: 'Hindari memakai "Hi" sendirian pada surat resmi; gunakan "Hello" atau "Dear".',
    exampleEn: 'Hi, Maya! How are you doing?',
    exampleId: 'Hai, Maya! Apa kabarmu?',
  },
  bye: {
    wordTypeId: 'Kata Perpisahan Santai (Interjection)',
    explanationId:
      '"Bye" merupakan bentuk singkat dari "Goodbye" yang sering dipakai dalam percakapan sehari-hari.',
    usageTipId: 'Boleh diucapkan santai seperti "Bye!" atau "Bye-bye!" kepada teman dekat.',
    exampleEn: 'Bye! Have a safe trip home.',
    exampleId: 'Sampai jumpa! Hati-hati di jalan pulang.',
  },
  'good morning': {
    wordTypeId: 'Sapaan Pagi (Interjection)',
    explanationId:
      '"Good morning" digunakan untuk menyapa sejak matahari terbit hingga menjelang pukul 12.00 siang.',
    usageTipId: 'Selalu diucapkan sebagai salam pertemuan di pagi hari.',
    exampleEn: 'Good morning, everyone! Let us study together.',
    exampleId: 'Selamat pagi semuanya! Ayo kita belajar bersama.',
  },
  'good afternoon': {
    wordTypeId: 'Sapaan Siang/Sore (Interjection)',
    explanationId:
      '"Good afternoon" dipakai setelah pukul 12.00 siang hingga sekitar pukul 17.30 sore.',
    usageTipId: 'Dalam Bahasa Indonesia artinya mencakup selamat siang sampai sore.',
    exampleEn: 'Good afternoon, sir. May I ask a question?',
    exampleId: 'Selamat siang, Pak. Bolehkah saya bertanya?',
  },
  'good evening': {
    wordTypeId: 'Sapaan Malam (Interjection)',
    explanationId:
      '"Good evening" adalah sapaan ketika BERTEMU seseorang di petang hingga malam hari (sekitar pukul 18.00 ke atas).',
    usageTipId: 'Jangan tertukar dengan "Good night"! Gunakan "Good evening" saat datang/menyapa.',
    exampleEn: 'Good evening, welcome to Desa Sapaan!',
    exampleId: 'Selamat malam, selamat datang di Desa Sapaan!',
  },
  'good night': {
    wordTypeId: 'Ucapan Tidur/Berpisah Malam',
    explanationId:
      '"Good night" BUKAN sapaan saat bertemu, melainkan ucapan perpisahan malam hari atau ucapan sebelum tidur.',
    usageTipId: 'Ucapkan saat hendak pulang malam atau saat keluarga bersiap tidur.',
    exampleEn: 'Good night, Mom. Sleep well!',
    exampleId: 'Selamat tidur, Ibu. Tidur yang nyenyak ya!',
  },
  'thank you': {
    wordTypeId: 'Ungkapan Terima Kasih',
    explanationId:
      '"Thank you" adalah ungkapan rasa syukur/terima kasih yang sopan dalam situasi formal maupun santai.',
    usageTipId: 'Bisa ditambahkan "very much" atau "so much" untuk penekanan lebih hangat.',
    exampleEn: 'Thank you very much for helping the village.',
    exampleId: 'Terima kasih banyak sudah membantu desa.',
  },
  thanks: {
    wordTypeId: 'Ungkapan Terima Kasih Santai',
    explanationId:
      '"Thanks" adalah bentuk ringkas dan santai dari "Thank you" untuk teman atau situasi akrab.',
    usageTipId: 'Akhiran -s di "Thanks" wajib selalu ada; jangan lupa huruf s!',
    exampleEn: 'Thanks for lending me your notebook!',
    exampleId: 'Makasih sudah meminjamkanku buku catatanmu!',
  },
  please: {
    wordTypeId: 'Kata Kesopanan (Adverb)',
    explanationId:
      '"Please" digunakan untuk memperhalus permintaan ("tolong") atau mempersilakan ("silakan").',
    usageTipId: 'Letakkan di awal atau akhir kalimat agar permintaan terdengar jauh lebih sopan.',
    exampleEn: 'Please sit down and open your book.',
    exampleId: 'Silakan duduk dan buka bukumu.',
  },
  ok: {
    wordTypeId: 'Ungkapan Persetujuan',
    explanationId:
      '"OK" dipakai untuk menyatakan setuju, mengerti, atau keadaan yang baik-baik saja.',
    usageTipId: 'Ditulis huruf kapital "OK" atau "okay" dalam kalimat santai.',
    exampleEn: 'OK, I understand the lesson now.',
    exampleId: 'Baiklah, sekarang saya mengerti pelajarannya.',
  },
  yes: {
    wordTypeId: 'Kata Jawaban Setuju',
    explanationId:
      '"Yes" menyatakan persetujuan atau membenarkan suatu pertanyaan/pernyataan.',
    usageTipId: 'Tambahkan "Yes, please" saat menerima tawaran dengan sopan.',
    exampleEn: 'Yes, I am ready to answer the quiz.',
    exampleId: 'Ya, saya siap menjawab kuisnya.',
  },
  no: {
    wordTypeId: 'Kata Jawaban Tidak/Tolak',
    explanationId:
      '"No" dipakai untuk menolak atau menyatakan bahwa sesuatu tidak benar.',
    usageTipId: 'Tambahkan "No, thank you" saat menolak tawaran dengan sopan.',
    exampleEn: 'No, that is not my bag.',
    exampleId: 'Tidak, itu bukan tas saya.',
  },
  sorry: {
    wordTypeId: 'Ungkapan Maaf',
    explanationId:
      '"Sorry" dipakai untuk meminta maaf atas kesalahan atau rasa kurang enak hati.',
    usageTipId: 'Bentuk lengkapnya "I am sorry" atau "I\'m sorry".',
    exampleEn: 'Sorry, I am late for class today.',
    exampleId: 'Maaf, saya terlambat masuk kelas hari ini.',
  },
  welcome: {
    wordTypeId: 'Ucapan Selamat Datang',
    explanationId:
      '"Welcome" dipakai untuk menyambut tamu yang baru tiba. Dalam ungkapan "You\'re welcome", artinya "sama-sama".',
    usageTipId: 'Pelajari dua fungsinya: menyambut tamu ("Welcome!") dan membalas terima kasih ("You\'re welcome").',
    exampleEn: 'Welcome to our little school in Desa Sapaan!',
    exampleId: 'Selamat datang di sekolah kecil kami di Desa Sapaan!',
  },

  // Cat 1: People
  man: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId:
      '"Man" berarti pria dewasa (tunggal). Bentuk jamaknya tidak memakai -s, melainkan berubah menjadi "men".',
    usageTipId: 'Ingat pasangan: 1 man → 2 men.',
    exampleEn: 'That man is our village baker.',
    exampleId: 'Pria itu adalah pembuat roti desa kami.',
  },
  woman: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId:
      '"Woman" berarti wanita dewasa (tunggal). Bentuk jamaknya adalah "women" (dibaca /ˈwɪmɪn/).',
    usageTipId: 'Perhatikan cara baca jamaknya: "women" dibaca "wi-min", bukan "wo-men".',
    exampleEn: 'The woman in front of the school is a teacher.',
    exampleId: 'Wanita di depan sekolah itu adalah seorang guru.',
  },
  boy: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId:
      '"Boy" merujuk pada anak laki-laki dari usia kanak-kanak hingga remaja.',
    usageTipId: 'Untuk anak laki-laki yang sudah dewasa, gunakan "man".',
    exampleEn: 'The little boy waves his hand happily.',
    exampleId: 'Anak laki-laki kecil itu melambaikan tangannya dengan riang.',
  },
  girl: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId:
      '"Girl" merujuk pada anak perempuan atau gadis muda.',
    usageTipId: 'Untuk perempuan dewasa, gunakan "woman".',
    exampleEn: 'That girl wears a bright red ribbon.',
    exampleId: 'Anak perempuan itu memakai pita merah cerah.',
  },
  friend: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId:
      '"Friend" berarti teman yang kita kenal baik dan percaya, di luar ikatan keluarga inti.',
    usageTipId: 'Tambahkan -s ("friends") jika lebih dari satu teman.',
    exampleEn: 'She is my best friend at school.',
    exampleId: 'Dia adalah teman terbaikku di sekolah.',
  },
  boyfriend: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId:
      '"Boyfriend" berarti kekasih atau pacar laki-laki.',
    usageTipId: 'Jangan tertukar dengan "male friend" (sekadar teman biasa laki-laki).',
    exampleEn: 'Her boyfriend gave her a blue flower.',
    exampleId: 'Pacarnya memberinya bunga berwarna biru.',
  },
  girlfriend: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId:
      '"Girlfriend" berarti kekasih atau pacar perempuan.',
    usageTipId: 'Jika hanya teman perempuan biasa, cukup sebut "friend".',
    exampleEn: 'He walks in the park with his girlfriend.',
    exampleId: 'Ia berjalan-jalan di taman bersama pacarnya.',
  },
  person: {
    wordTypeId: 'Kata Benda Tunggal (Noun)',
    explanationId:
      '"Person" adalah 1 orang individu tanpa memandang usia atau gender.',
    usageTipId: 'Gunakan "one person" untuk satu orang, dan "many people" untuk banyak orang.',
    exampleEn: 'Every person has a unique name.',
    exampleId: 'Setiap orang memiliki nama yang unik.',
  },
  people: {
    wordTypeId: 'Kata Benda Jamak (Noun)',
    explanationId:
      '"People" berarti sekumpulan orang (jamak), mencakup laki-laki, perempuan, dan anak-anak.',
    usageTipId: 'Karena sudah jamak, gunakan kata kerja jamak: "People ARE happy" (bukan is).',
    exampleEn: 'The people in this village are very kind.',
    exampleId: 'Orang-orang di desa ini sangat ramah.',
  },
  adult: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId:
      '"Adult" berarti orang yang sudah dewasa sepenuhnya (lawan kata dari child/baby).',
    usageTipId: 'Gunakan artikel "an" di depannya karena berawalan bunyi vokal: "an adult".',
    exampleEn: 'An adult helps the children cross the bridge.',
    exampleId: 'Seorang dewasa membantu anak-anak menyeberangi jembatan.',
  },
  baby: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId:
      '"Baby" adalah anak yang masih sangat kecil (bayi), biasanya belum bisa berjalan atau berbicara.',
    usageTipId: 'Bentuk jamak dari "baby" adalah "babies" (y berubah menjadi ies).',
    exampleEn: 'The baby is sleeping peacefully.',
    exampleId: 'Bayi itu sedang tidur dengan pulas.',
  },
  mr: {
    wordTypeId: 'Gelar Sapaan (Title)',
    explanationId:
      '"Mr" (dibaca Mister) adalah gelar sopan sebelum nama laki-laki dewasa (baik sudah menikah maupun belum).',
    usageTipId: 'Selalu diikuti nama orang, contoh: "Mr Budi" atau "Mr Smith" (tidak berdiri sendiri tanpa nama).',
    exampleEn: 'Good morning, Mr Rahman!',
    exampleId: 'Selamat pagi, Pak Rahman!',
  },
  mrs: {
    wordTypeId: 'Gelar Sapaan (Title)',
    explanationId:
      '"Mrs" (dibaca Misses /ˈmɪsɪz/) dipakai di depan nama perempuan yang sudah menikah.',
    usageTipId: 'Jika tidak yakin status pernikahannya, dalam bahasa modern sering dipakai "Ms" (/mɪz/).',
    exampleEn: 'Mrs Sari teaches English in the morning.',
    exampleId: 'Ibu Sari mengajar Bahasa Inggris di pagi hari.',
  },
  miss: {
    wordTypeId: 'Gelar Sapaan (Title)',
    explanationId:
      '"Miss" dipakai sebelum nama perempuan atau guru perempuan yang belum menikah.',
    usageTipId: 'Sering juga dipakai siswa untuk memanggil guru perempuan muda di kelas.',
    exampleEn: 'Excuse me, Miss Nina, can you explain again?',
    exampleId: 'Permisi, Bu Nina, bisakah dijelaskan ulang?',
  },

  // Cat 2 key tricky numbers
  zero: {
    wordTypeId: 'Bilangan (Number 0)',
    explanationId: '"Zero" adalah angka nol (0). Untuk nomor telepon, sering juga dibaca "oh".',
    usageTipId: 'Dalam skor olahraga atau suhu, gunakan "zero".',
    exampleEn: 'The score starts at zero to zero.',
    exampleId: 'Skor dimulai dari nol sama.',
  },
  thirteen: {
    wordTypeId: 'Bilangan Belasan (13)',
    explanationId: '"Thirteen" adalah 13. Perhatikan ejaan "thir-" (bukan threeteen) dan akhiran "-teen".',
    usageTipId: 'Tekanan suara ada di suku kata kedua: thir-TEEN.',
    exampleEn: 'There are thirteen chairs in our classroom.',
    exampleId: 'Ada tiga belas kursi di ruang kelas kita.',
  },
  fifteen: {
    wordTypeId: 'Bilangan Belasan (15)',
    explanationId: '"Fifteen" (15) berubah dari "five" menjadi "fif-" + "teen" (huruf v berubah jadi f).',
    usageTipId: 'Jangan tulis "fiveteen"! Ejaan yang benar adalah "fifteen".',
    exampleEn: 'Fifteen minutes until break time!',
    exampleId: 'Lima belas menit lagi menuju waktu istirahat!',
  },
  forty: {
    wordTypeId: 'Bilangan Puluhan (40)',
    explanationId: '"Forty" berarti 40. Perhatikan ejaannya TIDAK memakai huruf "u" seperti pada "four".',
    usageTipId: 'Ini jebakan ejaan klasik: Four (4) → Fourteen (14) → Forty (40, tanpa huruf u!).',
    exampleEn: 'There are forty pages in this workbook.',
    exampleId: 'Ada empat puluh halaman di buku latihan ini.',
  },
  fifty: {
    wordTypeId: 'Bilangan Puluhan (50)',
    explanationId: '"Fifty" (50) dibentuk dari "fif-" + "-ty". Tekanan suara di awal: FIF-ty.',
    usageTipId: 'Bedakan pelafalan "fifteen" (15) dan "fifty" (50) lewat akhiran bunyi -n vs -ty.',
    exampleEn: 'She walked fifty steps to the school.',
    exampleId: 'Ia berjalan lima puluh langkah menuju sekolah.',
  },
  hundred: {
    wordTypeId: 'Bilangan Ratusan (100)',
    explanationId: '"Hundred" berarti ratus. Untuk angka 100 utuh, sebutkan "one hundred" atau "a hundred".',
    usageTipId: 'Untuk angka seperti 200, tetap "two hundred" (tanpa -s di belakang hundred).',
    exampleEn: 'One hundred students joined the morning greeting.',
    exampleId: 'Seratus murid mengikuti sapaan pagi.',
  },

  // Cat 3 key family distinctions
  parent: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId: '"Parent" merujuk pada salah satu orang tua (ayah atau ibu). Jika keduanya, pakai "parents".',
    usageTipId: 'Selalu tambahkan -s ("my parents") saat memaksudkan ayah dan ibu bersama-sama.',
    exampleEn: 'My parents are proud of my progress.',
    exampleId: 'Orang tuaku bangga dengan kemajuanku.',
  },
  dad: {
    wordTypeId: 'Kata Benda Santai (Noun)',
    explanationId: '"Dad" adalah panggilan akrab dan hangat untuk ayah (seperti "Papa" atau "Ayah").',
    usageTipId: 'Lebih sering dipakai saat memanggil langsung daripada "Father".',
    exampleEn: 'Hi, Dad! Look at the crown shard I found.',
    exampleId: 'Hai, Ayah! Lihat pecahan mahkota yang kutemukan.',
  },
  mom: {
    wordTypeId: 'Kata Benda Santai (Noun)',
    explanationId: '"Mom" adalah panggilan akrab untuk ibu (seperti "Mama" atau "Ibu").',
    usageTipId: 'Ejaan Amerika memakai "Mom", sedangkan ejaan Inggris sering menulis "Mum".',
    exampleEn: 'Mom makes warm tea every morning.',
    exampleId: 'Ibu membuat teh hangat setiap pagi.',
  },
  cousin: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId: '"Cousin" berarti sepupu (anak dari paman atau bibi), berlaku untuk laki-laki maupun perempuan.',
    usageTipId: 'Bahasa Inggris tidak membedakan sepupu laki-laki/perempuan dengan kata khusus.',
    exampleEn: 'My cousin lives near the windmill.',
    exampleId: 'Sepupuku tinggal di dekat kincir angin.',
  },
  niece: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId: '"Niece" berarti keponakan perempuan (anak perempuan dari saudara kandungmu).',
    usageTipId: 'Pasangannya untuk keponakan laki-laki adalah "Nephew".',
    exampleEn: 'My niece loves reading English picture books.',
    exampleId: 'Keponakan perempuanku suka membaca buku bergambar Bahasa Inggris.',
  },
  nephew: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId: '"Nephew" berarti keponakan laki-laki (anak laki-laki dari saudara kandungmu).',
    usageTipId: 'Gabungan "ph" di tengah kata ini dibaca seperti huruf "f" (/ˈnɛfjuː/).',
    exampleEn: 'Her nephew plays near the village well.',
    exampleId: 'Keponakan laki-lakinya bermain di dekat sumur desa.',
  },

  // Cat 4 key colors
  dark: {
    wordTypeId: 'Kata Sifat Warna (Adjective)',
    explanationId: '"Dark" menunjukkan warna yang tua, pekat, atau gelap, serta suasana yang minim cahaya.',
    usageTipId: 'Pasangkan di depan warna, contoh: "dark blue" (biru dongker/tua).',
    exampleEn: 'The night sky looks dark blue.',
    exampleId: 'Langit malam tampak berwarna biru tua.',
  },
  light: {
    wordTypeId: 'Kata Sifat Warna (Adjective)',
    explanationId: '"Light" dalam topik warna berarti muda/cerah/pucat, lawan kata dari "Dark".',
    usageTipId: 'Contoh: "light green" (hijau muda), "light brown" (cokelat muda).',
    exampleEn: 'Our school wall is painted light yellow.',
    exampleId: 'Dinding sekolah kita dicat kuning muda.',
  },

  // Cat 5 personal info
  'last name': {
    wordTypeId: 'Frasa Kata Benda (Noun Phrase)',
    explanationId: '"Last name" berarti nama belakang atau nama keluarga/marga yang diwariskan bersama keluarga.',
    usageTipId: 'Sering disebut juga "family name" atau "surname" pada formulir resmi.',
    exampleEn: 'Please write your first name and last name.',
    exampleId: 'Silakan tulis nama depan dan nama belakangmu.',
  },
  birthday: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId: '"Birthday" adalah hari ulang tahun (tanggal dan bulan kelahiran yang dirayakan tiap tahun).',
    usageTipId: 'Ucapkan "Happy birthday!" untuk memberi selamat ulang tahun.',
    exampleEn: 'My birthday is in May!',
    exampleId: 'Hari ulang tahunku di bulan Mei!',
  },
  birthdate: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId: '"Birthdate" adalah tanggal lahir lengkap mencakup tanggal, bulan, dan tahun kelahiran.',
    usageTipId: 'Dipakai saat mengisi formulir identitas, sekolah, atau paspor.',
    exampleEn: 'Write your birthdate clearly on the form.',
    exampleId: 'Tulis tanggal lahirmu dengan jelas pada formulir.',
  },
  single: {
    wordTypeId: 'Kata Sifat Status (Adjective)',
    explanationId: '"Single" menyatakan belum menikah atau lajang pada data informasi pribadi.',
    usageTipId: 'Lawan katanya adalah "Married" (sudah menikah).',
    exampleEn: 'He checked "single" on his travel card.',
    exampleId: 'Ia mencentang "lajang" pada kartu perjalanannya.',
  },
  married: {
    wordTypeId: 'Kata Sifat Status (Adjective)',
    explanationId: '"Married" berarti sudah menikah (memiliki suami atau istri).',
    usageTipId: 'Gunakan preposisi "to": "married to..." (menikah dengan...), bukan "with".',
    exampleEn: 'My sister is married and lives in Kota Gerbang.',
    exampleId: 'Kakak perempuanku sudah menikah dan tinggal di Kota Gerbang.',
  },

  // Cat 6 & 7 body / face distinctions
  hand: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId: '"Hand" adalah telapak tangan beserta jari di ujung lengan untuk memegang benda.',
    usageTipId: 'Bedakan dengan "Arm" (lengan dari bahu sampai pergelangan tangan).',
    exampleEn: 'Raise your hand if you know the answer!',
    exampleId: 'Angkat tanganmu jika kamu tahu jawabannya!',
  },
  arm: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId: '"Arm" adalah keseluruhan lengan dari bahu hingga pergelangan tangan.',
    usageTipId: 'Ingat: "arm" = lengan, "hand" = tangan.',
    exampleEn: 'My arm feels strong after swimming.',
    exampleId: 'Lenganku terasa kuat setelah berenang.',
  },
  foot: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId: '"Foot" berarti telapak kaki (bagian bawah tempat berpijak). Jamaknya adalah "Feet".',
    usageTipId: 'Ingat bentuk jamak tak beraturan: 1 foot → 2 feet.',
    exampleEn: 'Put your shoes on your feet.',
    exampleId: 'Pasang sepatumu di kedua kakimu.',
  },
  leg: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId: '"Leg" berarti tungkai kaki dari pinggul/paha ke pergelangan kaki.',
    usageTipId: 'Saat berjalan atau berlari, kita menggerakkan kedua "legs".',
    exampleEn: 'The hero runs fast with strong legs.',
    exampleId: 'Pahlawan berlari cepat dengan kaki yang kuat.',
  },
  tooth: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId: '"Tooth" berarti satu buah gigi. Jika lebih dari satu gigi, gunakan "Teeth".',
    usageTipId: 'Mirip dengan foot → feet, kata tooth → teeth!',
    exampleEn: 'Brush your teeth every morning and night.',
    exampleId: 'Sikat gigimu setiap pagi dan malam.',
  },
  cheek: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId: '"Cheek" berarti pipi, yaitu bagian lembut di sisi kanan dan kiri wajah di bawah mata.',
    usageTipId: 'Karena ada dua pipi, bentuk jamaknya adalah "cheeks".',
    exampleEn: 'The cold wind makes her cheeks rosy.',
    exampleId: 'Angin sejuk membuat pipinya kemerahan.',
  },
  chin: {
    wordTypeId: 'Kata Benda (Noun)',
    explanationId: '"Chin" berarti dagu, bagian paling bawah pada wajah di bawah bibir.',
    usageTipId: 'Jangan tertukar dengan "Cheek" (pipi).',
    exampleEn: 'He rests his chin on his hand while thinking.',
    exampleId: 'Ia menopang dagunya dengan tangan sambil berpikir.',
  },
};

function inferWordTypeId(entry: VocabEntry): string {
  const m = entry.exampleEn.match(/^\(([^)]+)\)/);
  const pos = m?.[1]?.trim().toLowerCase() || '';
  if (pos === 'intj.') return 'Kata Seru / Sapaan (Interjection)';
  if (pos === 'adv.') return 'Kata Keterangan (Adverb)';
  if (pos === 'num.') return 'Bilangan (Number)';
  if (pos === 'adj.') return 'Kata Sifat (Adjective)';
  if (pos === 'n.') return 'Kata Benda (Noun)';
  return 'Kosakata A1';
}

function stripPosPrefix(text: string): string {
  return text.replace(/^\([^)]+\)\s*/, '').trim();
}

export function getDesaWordExplanation(vocabId: string): DesaWordExplanation | null {
  const entry = VOCAB_BY_ID[vocabId];
  if (!entry) return null;

  const topic = TOPIC_MAP[entry.catId] ?? {
    catId: entry.catId,
    titleId: CATEGORIES.find((c) => c.id === entry.catId)?.name ?? 'Kosakata Desa',
    subtitleEn: CATEGORIES.find((c) => c.id === entry.catId)?.name ?? 'Desa Vocab',
    icon: '📘',
    summaryId: 'Pelajari arti, pelafalan, dan pemakaian kosakata dasar Bahasa Inggris A1.',
    grammarRuleId: 'Latih pelafalan dan perhatikan ejaannya dengan teliti.',
  };

  const specific = SPECIFIC_WORD_NOTES[entry.word.toLowerCase()];
  const wordTypeId = specific?.wordTypeId ?? inferWordTypeId(entry);

  if (specific) {
    return {
      vocabId: entry.id,
      word: entry.word,
      ipa: entry.phonetic,
      artiId: entry.meaningId,
      wordTypeId,
      explanationId: specific.explanationId,
      usageTipId: specific.usageTipId,
      exampleEn: specific.exampleEn,
      exampleId: specific.exampleId,
      categoryTitleId: topic.titleId,
      categorySummaryId: topic.summaryId,
    };
  }

  const cleanDef = stripPosPrefix(entry.exampleEn);
  let fallbackExplanation = `"${entry.word}" berarti "${entry.meaningId}" dalam topik ${topic.titleId}. `;
  if (entry.catId === 2) {
    const valMatch = entry.meaningId.match(/\((\d+)\)/);
    const numVal = valMatch ? Number(valMatch[1]) : -1;
    if (numVal >= 13 && numVal <= 19) {
      fallbackExplanation +=
        'Termasuk kelompok angka belasan yang berakhiran "-teen" dengan penekanan bunyi di suku kata belakang.';
    } else if (numVal >= 20 && numVal <= 90) {
      fallbackExplanation +=
        'Termasuk kelompok angka puluhan yang berakhiran "-ty" dengan penekanan bunyi di suku kata depan.';
    } else {
      fallbackExplanation +=
        'Termasuk bilangan dasar wajib hafal untuk menyebut jumlah, umur, jam, dan nomor telepon.';
    }
  } else if (entry.catId === 3) {
    fallbackExplanation +=
      'Kata ini dipakai untuk menyebut hubungan anggota keluarga dalam percakapan sehari-hari maupun saat bercerita tentang keluarga.';
  } else if (entry.catId === 4) {
    fallbackExplanation +=
      'Kata sifat warna ini dapat langsung diletakkan di depan kata benda (mis. "a ' +
      entry.word.toLowerCase() +
      ' book") untuk mendeskripsikan benda.';
  } else if (entry.catId === 5) {
    fallbackExplanation +=
      'Sering muncul pada percakapan perkenalan diri serta pengisian data identitas resmi.';
  } else if (entry.catId === 6 || entry.catId === 7) {
    fallbackExplanation +=
      'Biasa dipakai saat menjelaskan kondisi fisik, ciri penampilan seseorang, atau saat berolahraga/berobat.';
  } else {
    fallbackExplanation += `Penjelasan dasar: ${cleanDef}`;
  }

  const fallbackExampleEn =
    entry.catId === 2
      ? `I can count to "${entry.word}" in English!`
      : entry.catId === 4
      ? `The flower is ${entry.word.toLowerCase()}.`
      : entry.catId === 3
      ? `That is my ${entry.word.toLowerCase()}.`
      : entry.catId === 6 || entry.catId === 7
      ? `Point to your ${entry.word.toLowerCase()} carefully.`
      : `We learn the word "${entry.word}" at Desa Sapaan School.`;

  const fallbackExampleId =
    entry.catId === 2
      ? `Saya bisa berhitung angka "${entry.meaningId}" dalam Bahasa Inggris!`
      : entry.catId === 4
      ? `Bunga itu berwarna ${entry.meaningId}.`
      : entry.catId === 3
      ? `Itu adalah ${entry.meaningId} saya.`
      : entry.catId === 6 || entry.catId === 7
      ? `Tunjuk bagian ${entry.meaningId}-mu dengan tepat.`
      : `Kita mempelajari kata "${entry.word}" (${entry.meaningId}) di Sekolah Desa Sapaan.`;

  return {
    vocabId: entry.id,
    word: entry.word,
    ipa: entry.phonetic,
    artiId: entry.meaningId,
    wordTypeId,
    explanationId: fallbackExplanation,
    usageTipId: topic.grammarRuleId,
    exampleEn: fallbackExampleEn,
    exampleId: fallbackExampleId,
    categoryTitleId: topic.titleId,
    categorySummaryId: topic.summaryId,
  };
}
