// Complete Istana IELTS / Akademi Ujian Data (4 Listening sections / 20 Qs, Reading Academic & General / 15 Qs each, Writing Task 1 & 2, Speaking 7 Prompts)

export interface IeltsListeningQuestion {
  id: string;
  prompt: string;
  choices: [string, string, string, string];
  correctIndex: number;
}

export interface IeltsListeningSection {
  id: string;
  title: string;
  context: string;
  dialogue: Array<{ speaker: 'A' | 'B'; name: string; line: string }>;
  questions: IeltsListeningQuestion[];
}

export interface IeltsReadingQuestion {
  id: string;
  kind: 'mcq' | 'tfng' | 'short';
  prompt: string;
  choices?: string[];
  answer: string; // exact choice or short answer
}

export interface IeltsReadingPassage {
  id: string;
  track: 'academic' | 'general';
  title: string;
  passage: string;
  questions: IeltsReadingQuestion[];
}

export interface IeltsWritingTask {
  id: string;
  taskNumber: 1 | 2;
  track: 'academic' | 'general';
  title: string;
  prompt: string;
  minWords: number;
  tips: string[];
  sampleConnectors: string[];
}

export interface IeltsSpeakingPrompt {
  id: string;
  part: 1 | 2 | 3;
  title: string;
  prompt: string;
  bulletPoints?: string[];
  prepSec: number;
  speakSec: number;
  modelAnswer: string;
}

export const LISTENING_SECTIONS: IeltsListeningSection[] = [
  {
    id: 'l_sec1',
    title: 'Bagian 1, Pendaftaran Perpustakaan Kota',
    context: 'Percakapan antara Petugas (Budi) dan Mahasiswa Baru (Nadia).',
    dialogue: [
      { speaker: 'A', name: 'Budi', line: 'Good morning! Welcome to the Central City Library. Would you like to apply for a membership card?' },
      { speaker: 'B', name: 'Nadia', line: 'Yes, please. My name is Nadia Kusuma. What documents do I need?' },
      { speaker: 'A', name: 'Budi', line: 'Just your student card and proof of address. The yearly fee is fifteen dollars, but students pay only ten dollars.' },
      { speaker: 'B', name: 'Nadia', line: 'Great! When does the library open on Saturdays?' },
      { speaker: 'A', name: 'Budi', line: 'On weekdays we open from eight to eight, and on Saturdays from nine until five PM. You can borrow up to six books for two weeks.' },
    ],
    questions: [
      { id: 'l1_q1', prompt: 'Dokumen apa yang harus ditunjukkan Nadia selain bukti alamat?', choices: ['Paspor', 'Kartu mahasiswa (Student card)', 'SIM', 'Akta lahir'], correctIndex: 1 },
      { id: 'l1_q2', prompt: 'Berapa biaya keanggotaan tahunan khusus pelajar?', choices: ['$15', '$12', '$10', '$5'], correctIndex: 2 },
      { id: 'l1_q3', prompt: 'Jam buka perpustakaan pada hari Sabtu adalah...', choices: ['08.00 – 20.00', '09.00 – 17.00', '10.00 – 16.00', 'Tutup'], correctIndex: 1 },
      { id: 'l1_q4', prompt: 'Berapa maksimal buku yang boleh dipinjam sekaligus?', choices: ['2 buku', '4 buku', '6 buku', '8 buku'], correctIndex: 2 },
      { id: 'l1_q5', prompt: 'Berapa lama masa peminjaman buku?', choices: ['1 minggu', '2 minggu', '1 bulan', '3 hari'], correctIndex: 1 },
    ],
  },
  {
    id: 'l_sec2',
    title: 'Bagian 2, Tur Museum Sains Nusantara',
    context: 'Pemandu menjelaskan jadwal dan zona pameran museum.',
    dialogue: [
      { speaker: 'A', name: 'Guide', line: 'Welcome everyone to the Science Museum! Today the Space Hall on the second floor is closed for maintenance.' },
      { speaker: 'B', name: 'Visitor', line: 'Oh, what about the Ocean Discovery Gallery?' },
      { speaker: 'A', name: 'Guide', line: 'The Ocean Gallery is open on the ground floor, right next to the cafe. The live robot show starts at eleven thirty in the Main Auditorium.' },
      { speaker: 'B', name: 'Visitor', line: 'Can we take photos inside?' },
      { speaker: 'A', name: 'Guide', line: 'Yes, photos without flash are allowed everywhere except the Dark Crystal Room. Please leave large backpacks in the free lockers by the entrance.' },
    ],
    questions: [
      { id: 'l2_q1', prompt: 'Ruangan mana yang sedang ditutup untuk perawatan?', choices: ['Ocean Gallery', 'Space Hall', 'Main Auditorium', 'Dark Crystal Room'], correctIndex: 1 },
      { id: 'l2_q2', prompt: 'Di mana letak Ocean Discovery Gallery?', choices: ['Lantai dasar dekat kafe', 'Lantai dua', 'Di luar gedung', 'Dekat pintu keluar'], correctIndex: 0 },
      { id: 'l2_q3', prompt: 'Pukul berapa pertunjukan robot dimulai?', choices: ['10.30', '11.00', '11.30', '13.30'], correctIndex: 2 },
      { id: 'l2_q4', prompt: 'Di mana pengunjung TIDAK diperbolehkan memotret?', choices: ['Ocean Gallery', 'Cafe', 'Auditorium', 'Dark Crystal Room'], correctIndex: 3 },
      { id: 'l2_q5', prompt: 'Berapa biaya menyewa loker tas di pintu masuk?', choices: ['$2', '$5', 'Gratis (Free)', '$1'], correctIndex: 2 },
    ],
  },
  {
    id: 'l_sec3',
    title: 'Bagian 3, Diskusi Riset Energi Hijau',
    context: 'Dua mahasiswa (Raka & Maya) membahas tugas presentasi kampus.',
    dialogue: [
      { speaker: 'A', name: 'Raka', line: 'Maya, our professor asked us to compare solar panels and wind turbines for rural islands.' },
      { speaker: 'B', name: 'Maya', line: 'Right! Our survey of twenty villages showed solar panels are easier to repair locally, even though wind turbines produce more power at night.' },
      { speaker: 'A', name: 'Raka', line: 'Let us include the cost chart in Section Two, and submit the draft slides by Thursday afternoon.' },
      { speaker: 'B', name: 'Maya', line: 'Agreed. Remember the presentation itself is next Monday morning, and each of us speaks for six minutes.' },
    ],
    questions: [
      { id: 'l3_q1', prompt: 'Apa topik utama perbandingan tugas Raka dan Maya?', choices: ['Mobil listrik vs kereta', 'Panel surya vs turbin angin', 'Batu bara vs gas', 'Hutan vs laut'], correctIndex: 1 },
      { id: 'l3_q2', prompt: 'Berapa desa yang disurvei oleh mereka?', choices: ['10 desa', '15 desa', '20 desa', '30 desa'], correctIndex: 2 },
      { id: 'l3_q3', prompt: 'Keunggulan panel surya menurut survei adalah...', choices: ['Lebih mudah diperbaiki warga lokal', 'Menghasilkan listrik lebih besar saat malam', 'Tidak butuh matahari', 'Gratis sepenuhnya'], correctIndex: 0 },
      { id: 'l3_q4', prompt: 'Kapan draf slide harus dikumpulkan?', choices: ['Senin pagi', 'Rabu malam', 'Kamis siang/sore', 'Jumat pagi'], correctIndex: 2 },
      { id: 'l3_q5', prompt: 'Berapa menit masing-masing pembicara tampil saat presentasi?', choices: ['4 menit', '6 menit', '10 menit', '12 menit'], correctIndex: 1 },
    ],
  },
  {
    id: 'l_sec4',
    title: 'Bagian 4, Kuliah Singkat Kota Berkelanjutan',
    context: 'Profesor menjelaskan strategi mengurangi panas kota modern.',
    dialogue: [
      { speaker: 'A', name: 'Prof', line: 'Modern cities suffer from the urban heat island effect, making downtown areas up to four degrees warmer than nearby forests.' },
      { speaker: 'A', name: 'Prof', line: 'Two effective methods to mitigate this issue are planting vertical gardens on office buildings and using reflective white roofs.' },
      { speaker: 'A', name: 'Prof', line: 'A 2024 study in Singapore found that shaded streets encouraged thirty five percent more people to walk or cycle to work.' },
      { speaker: 'A', name: 'Prof', line: 'In conclusion, urban trees are not merely decorative; they are essential public infrastructure for health and energy savings.' },
    ],
    questions: [
      { id: 'l4_q1', prompt: 'Berapa derajat lebih panas pusat kota dibanding hutan sekitar?', choices: ['1°C', '2°C', 'Hingga 4°C', '10°C'], correctIndex: 2 },
      { id: 'l4_q2', prompt: 'Metode apa yang disebut untuk mengurangi panas?', choices: ['Taman vertikal & atap putih reflektif', 'Menambah jalan tol', 'Mengurangi jendela', 'Menebang pohon tua'], correctIndex: 0 },
      { id: 'l4_q3', prompt: 'Kata "mitigate" dalam kuliah tersebut berarti...', choices: ['Memperparah', 'Mengurangi dampak', 'Mengabaikan', 'Memindahkan'], correctIndex: 1 },
      { id: 'l4_q4', prompt: 'Berapa persen peningkatan warga berjalan/bersepeda di jalan rindang Singapura?', choices: ['15%', '25%', '35%', '50%'], correctIndex: 2 },
      { id: 'l4_q5', prompt: 'Kesimpulan utama profesor mengenai pohon kota adalah...', choices: ['Hanya hiasan taman', 'Infrastruktur publik esensial', 'Terlalu mahal dirawat', 'Hanya cocok di desa'], correctIndex: 1 },
    ],
  },
];

export const READING_PASSAGES: IeltsReadingPassage[] = [
  // Academic (3 passages / 15 Qs)
  {
    id: 'ra_1',
    track: 'academic',
    title: 'Passage 1, The Rise of Vertical Farming',
    passage:
      'Vertical farming grows crops indoors in stacked layers using controlled light, water, and nutrients. Because water is recycled continuously, vertical farms use up to 95 percent less water than traditional open fields. They can be placed inside empty city warehouses, cutting transport emissions dramatically. However, high electricity bills for LED lighting remain a major challenge for staple grains like wheat and rice.',
    questions: [
      { id: 'ra1_1', kind: 'tfng', prompt: 'Vertical farms require more water than open-field farms.', choices: ['True', 'False', 'Not Given'], answer: 'False' },
      { id: 'ra1_2', kind: 'tfng', prompt: 'Growing crops inside city warehouses lowers transport pollution.', choices: ['True', 'False', 'Not Given'], answer: 'True' },
      { id: 'ra1_3', kind: 'tfng', prompt: 'Japan currently operates the largest vertical farm in Asia.', choices: ['True', 'False', 'Not Given'], answer: 'Not Given' },
      { id: 'ra1_4', kind: 'mcq', prompt: 'What is the main obstacle for growing wheat in vertical farms?', choices: ['Lack of soil', 'High electricity cost for LEDs', 'Too much rain', 'Short buildings'], answer: 'High electricity cost for LEDs' },
      { id: 'ra1_5', kind: 'short', prompt: 'Up to what percentage of water can vertical farms save? (write number + %)', answer: '95%' },
    ],
  },
  {
    id: 'ra_2',
    track: 'academic',
    title: 'Passage 2, How Bilingual Brains Switch Languages',
    passage:
      'Neuroscience research shows that people who speak two or more languages daily develop stronger executive control, which is the brain skill responsible for focus and ignoring distractions. When bilingual speakers hear a word, both language systems activate simultaneously for a fraction of a second before the brain selects the right word. Regular language practice builds cognitive resilience across all age groups.',
    questions: [
      { id: 'ra2_1', kind: 'tfng', prompt: 'Bilingual speakers only activate one language at a time when listening.', choices: ['True', 'False', 'Not Given'], answer: 'False' },
      { id: 'ra2_2', kind: 'tfng', prompt: 'Daily bilingual practice supports focus and cognitive resilience.', choices: ['True', 'False', 'Not Given'], answer: 'True' },
      { id: 'ra2_3', kind: 'tfng', prompt: 'Learning a third language takes exactly six months.', choices: ['True', 'False', 'Not Given'], answer: 'Not Given' },
      { id: 'ra2_4', kind: 'mcq', prompt: 'What does "executive control" help the brain do?', choices: ['Sleep faster', 'Stay focused and ignore distractions', 'Speak louder', 'Forget grammar'], answer: 'Stay focused and ignore distractions' },
      { id: 'ra2_5', kind: 'short', prompt: 'Which word in the text means "ketangguhan kognitif" (two words)?', answer: 'cognitive resilience' },
    ],
  },
  {
    id: 'ra_3',
    track: 'academic',
    title: 'Passage 3, Coral Reefs & Coastal Protection',
    passage:
      'Although coral reefs cover less than one percent of the ocean floor, they support roughly 25 percent of all marine species. Beyond biodiversity, healthy reefs absorb up to 90 percent of wave energy during tropical storms, protecting millions of coastal residents from flooding. Marine biologists warn that warming oceans trigger coral bleaching, making reef restoration urgent.',
    questions: [
      { id: 'ra3_1', kind: 'tfng', prompt: 'Coral reefs cover more than half of the ocean floor.', choices: ['True', 'False', 'Not Given'], answer: 'False' },
      { id: 'ra3_2', kind: 'tfng', prompt: 'Healthy reefs help reduce coastal flooding during storms.', choices: ['True', 'False', 'Not Given'], answer: 'True' },
      { id: 'ra3_3', kind: 'tfng', prompt: 'Every country has banned coastal tourism since 2020.', choices: ['True', 'False', 'Not Given'], answer: 'Not Given' },
      { id: 'ra3_4', kind: 'mcq', prompt: 'What causes coral bleaching according to the passage?', choices: ['Cold winters', 'Warming oceans', 'Deep submarines', 'Heavy rain'], answer: 'Warming oceans' },
      { id: 'ra3_5', kind: 'short', prompt: 'Roughly what percent of marine species depend on coral reefs? (number + %)', answer: '25%' },
    ],
  },

  // General Training (3 passages / 15 Qs)
  {
    id: 'rg_1',
    track: 'general',
    title: 'Notice 1, Community Sports Center Timetable',
    passage:
      'Greenfield Sports Center welcomes members from 6.00 AM to 10.00 PM daily. Morning yoga starts at 7.00 AM on Monday, Wednesday, and Friday. Swimming pool lanes are reserved for children under 12 between 3.00 PM and 4.30 PM. Locker coins ($1 refundable) are available at the reception desk.',
    questions: [
      { id: 'rg1_1', kind: 'tfng', prompt: 'The center opens before 7.00 AM every day.', choices: ['True', 'False', 'Not Given'], answer: 'True' },
      { id: 'rg1_2', kind: 'tfng', prompt: 'Morning yoga runs on Tuesdays and Thursdays.', choices: ['True', 'False', 'Not Given'], answer: 'False' },
      { id: 'rg1_3', kind: 'tfng', prompt: 'You get your $1 locker coin back after use.', choices: ['True', 'False', 'Not Given'], answer: 'True' },
      { id: 'rg1_4', kind: 'mcq', prompt: 'Who uses the pool between 3.00 PM and 4.30 PM?', choices: ['Adult swimmers', 'Children under 12', 'Yoga instructors', 'Staff only'], answer: 'Children under 12' },
      { id: 'rg1_5', kind: 'short', prompt: 'Where can you get locker coins? (two words)', answer: 'reception desk' },
    ],
  },
  {
    id: 'rg_2',
    track: 'general',
    title: 'Email 2, Office Remote-Work Policy Update',
    passage:
      'Dear Team, starting next month, full-time staff may work from home two days a week (Tuesday and Thursday). All remote employees must join the 9.30 AM video check-in and keep chat status active until 5.00 PM. Laptops must be returned for security updates on the last Friday of every quarter.',
    questions: [
      { id: 'rg2_1', kind: 'tfng', prompt: 'Staff can work from home five days a week.', choices: ['True', 'False', 'Not Given'], answer: 'False' },
      { id: 'rg2_2', kind: 'tfng', prompt: 'There is a morning video meeting at 9.30 AM.', choices: ['True', 'False', 'Not Given'], answer: 'True' },
      { id: 'rg2_3', kind: 'tfng', prompt: 'The company pays for home internet bills.', choices: ['True', 'False', 'Not Given'], answer: 'Not Given' },
      { id: 'rg2_4', kind: 'mcq', prompt: 'Which two days are allowed for remote work?', choices: ['Monday & Friday', 'Tuesday & Thursday', 'Wednesday & Friday', 'Saturday & Sunday'], answer: 'Tuesday & Thursday' },
      { id: 'rg2_5', kind: 'short', prompt: 'Why must laptops be brought back every quarter? (two words)', answer: 'security updates' },
    ],
  },
  {
    id: 'rg_3',
    track: 'general',
    title: 'Guide 3, Packing Tips for Rainy Mountain Trips',
    passage:
      'Mountain weather changes rapidly, even in sunny months. Always pack a lightweight waterproof jacket, quick-dry socks, and at least two liters of drinking water. Store phones inside sealed plastic pouches to prevent moisture damage, and inform the park office before hiking after 4.00 PM.',
    questions: [
      { id: 'rg3_1', kind: 'tfng', prompt: 'Rain never happens in sunny mountain seasons.', choices: ['True', 'False', 'Not Given'], answer: 'False' },
      { id: 'rg3_2', kind: 'tfng', prompt: 'Hikers should bring at least two liters of water.', choices: ['True', 'False', 'Not Given'], answer: 'True' },
      { id: 'rg3_3', kind: 'tfng', prompt: 'Park rangers offer free hot tea at the peak.', choices: ['True', 'False', 'Not Given'], answer: 'Not Given' },
      { id: 'rg3_4', kind: 'mcq', prompt: 'How should phones be protected from moisture?', choices: ['In woolen socks', 'Inside sealed plastic pouches', 'Left in the car', 'Wrapped in paper'], answer: 'Inside sealed plastic pouches' },
      { id: 'rg3_5', kind: 'short', prompt: 'Who should you notify before hiking after 4.00 PM? (two words)', answer: 'park office' },
    ],
  },
];

export const WRITING_TASKS: IeltsWritingTask[] = [
  {
    id: 'w_t1_acad',
    taskNumber: 1,
    track: 'academic',
    title: 'Task 1 (Academic), Grafik Transportasi Mahasiswa',
    prompt:
      'Describe the trend between 2018 and 2024 as students cycling to campus rose from 18% to 42%, bus usage stayed steady at 35%, while private motorcycle trips dropped from 47% to 23%. Summarize the main features and make comparisons.',
    minWords: 60,
    tips: [
      'Paragraf 1 berisi paraphrase topik grafik.',
      'Paragraf 2 berisi overview tren paling menonjol (sepeda naik tajam, motor turun).',
      'Paragraf 3 berisi angka detail 2018 vs 2024 dengan kata sambung perbandingan.',
    ],
    sampleConnectors: ['whereas', 'however', 'in contrast', 'meanwhile', 'significantly', 'overall'],
  },
  {
    id: 'w_t1_gen',
    taskNumber: 1,
    track: 'general',
    title: 'Task 1 (General), Surat Permohonan Kursus Bahasa Inggris',
    prompt:
      'Write a formal letter to the Director of an English Language Center asking about evening IELTS classes, schedule options, and tuition discounts for early registration.',
    minWords: 60,
    tips: [
      'Gunakan salam pembuka formal seperti Dear Sir or Madam atau Dear Director.',
      'Jelaskan tujuan surat di kalimat pertama.',
      'Gunakan kata sambung sopan & tutup dengan Yours faithfully.',
    ],
    sampleConnectors: ['furthermore', 'however', 'therefore', 'in addition', 'additionally', 'consequently'],
  },
  {
    id: 'w_t2_both',
    taskNumber: 2,
    track: 'academic',
    title: 'Task 2 (Essay), Belajar Kosakata Lewat Game vs Buku',
    prompt:
      'Some people believe educational 3D games help students master English vocabulary faster than traditional textbooks. To what extent do you agree or disagree? Give reasons and examples.',
    minWords: 90,
    tips: [
      'Pendahuluan berisi paraphrase isu lalu nyatakan posisi jelas (Agree atau Balanced).',
      'Body 1 membahas alasan & contoh cara game interaktif meningkatkan daya ingat.',
      'Body 2 membahas peran buku/latihan menulis & kesimpulan yang kuat.',
    ],
    sampleConnectors: ['although', 'however', 'therefore', 'for example', 'moreover', 'in conclusion'],
  },
];

export const SPEAKING_PROMPTS: IeltsSpeakingPrompt[] = [
  {
    id: 'sp_p1_1',
    part: 1,
    title: 'Part 1, Hometown & Daily Routine',
    prompt: 'Where do you live, and what do you enjoy most about your neighborhood?',
    prepSec: 10,
    speakSec: 45,
    modelAnswer: 'I live in a peaceful town surrounded by green hills. What I enjoy most is the friendly community and the morning market near my house where everything feels fresh and lively.',
  },
  {
    id: 'sp_p1_2',
    part: 1,
    title: 'Part 1, Learning English',
    prompt: 'How do you usually practice English vocabulary every day?',
    prepSec: 10,
    speakSec: 45,
    modelAnswer: 'Usually, I learn ten to twenty new words using flashcards and interactive games, and then I try to use them in short spoken sentences.',
  },
  {
    id: 'sp_p1_3',
    part: 1,
    title: 'Part 1, Food & Cooking',
    prompt: 'Do you prefer home-cooked meals or eating at restaurants? Why?',
    prepSec: 10,
    speakSec: 45,
    modelAnswer: 'I prefer home-cooked meals because they are healthier and cheaper, although I occasionally visit local restaurants on weekends with my family.',
  },
  {
    id: 'sp_p2_1',
    part: 2,
    title: 'Part 2 (Cue Card), A Memorable Journey',
    prompt: 'Describe a memorable trip or adventure you had recently.',
    bulletPoints: [
      'Where you went and who went with you',
      'What activities you did there',
      'What unexpected challenge happened',
      'And explain why this trip was unforgettable',
    ],
    prepSec: 30,
    speakSec: 90,
    modelAnswer: 'Two months ago, I traveled to a quiet mountain village with my cousin. We hiked through lush forests, visited a waterfall, and got caught in sudden rain. Although our shoes got muddy, helping each other reach the warm cafe made the journey unforgettable.',
  },
  {
    id: 'sp_p2_2',
    part: 2,
    title: 'Part 2 (Cue Card), A Helpful Teacher or Guide',
    prompt: 'Describe a person who inspired you to keep learning.',
    bulletPoints: [
      'Who this person is',
      'How you met them',
      'What advice or lesson they shared',
      'And explain how they influenced your progress',
    ],
    prepSec: 30,
    speakSec: 90,
    modelAnswer: 'My English mentor always encouraged me never to fear mistakes. Instead of memorizing long lists silently, she taught me to speak aloud daily. Therefore, my confidence improved dramatically within three months.',
  },
  {
    id: 'sp_p3_1',
    part: 3,
    title: 'Part 3 (Discussion), Technology in Education',
    prompt: 'Do you think interactive digital games will replace traditional classrooms in the future?',
    prepSec: 15,
    speakSec: 60,
    modelAnswer: 'On the one hand, digital games make practice engaging and provide instant feedback. On the other hand, human teachers offer empathy and real discussion. Therefore, combining both approaches is the smartest strategy.',
  },
  {
    id: 'sp_p3_2',
    part: 3,
    title: 'Part 3 (Discussion), Global Communication',
    prompt: 'Why is learning a second language becoming essential for young people today?',
    prepSec: 15,
    speakSec: 60,
    modelAnswer: 'In our global economy, speaking English opens doors to international research, scholarships, and cross-cultural friendships. Moreover, bilingual thinking trains the brain to stay adaptable.',
  },
];
