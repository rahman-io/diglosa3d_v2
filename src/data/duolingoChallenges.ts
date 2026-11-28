import { WordProgress } from '../types/game';
import { VOCAB_BY_ID } from './vocabCatalog';

export type DuolingoChallengeType =
  | 'picture_choice'
  | 'word_bank_translate'
  | 'speak'
  | 'dialogue_complete'
  | 'listen_word_bank'
  | 'match_pairs';

export const PEOPLE_VOCAB_IDS = [
  'v_1_man',
  'v_1_woman',
  'v_1_boy',
  'v_1_girl',
  'v_1_friend',
  'v_1_boyfriend',
  'v_1_girlfriend',
  'v_1_person',
  'v_1_people',
  'v_1_adult',
  'v_1_baby',
  'v_1_mr',
  'v_1_mrs',
  'v_1_miss',
] as const;

export type PeopleVocabId = (typeof PEOPLE_VOCAB_IDS)[number];

export const VOCAB_IMAGE_BY_ID: Record<string, string> = {
  v_1_man: './assets/vocab/people/man.png',
  v_1_woman: './assets/vocab/people/woman.png',
  v_1_boy: './assets/vocab/people/boy.png',
  v_1_girl: './assets/vocab/people/girl.png',
  v_1_friend: './assets/vocab/people/friend.png',
  v_1_boyfriend: './assets/vocab/people/boyfriend.png',
  v_1_girlfriend: './assets/vocab/people/girlfriend.png',
  v_1_person: './assets/vocab/people/person.png',
  v_1_people: './assets/vocab/people/people.png',
  v_1_adult: './assets/vocab/people/adult.png',
  v_1_baby: './assets/vocab/people/baby.png',
  v_1_mr: './assets/vocab/people/mr.png',
  v_1_mrs: './assets/vocab/people/mrs.png',
  v_1_miss: './assets/vocab/people/miss.png',
};

export function getVocabImage(vocabId: string): string | null {
  return VOCAB_IMAGE_BY_ID[vocabId] ?? null;
}

export interface PictureChoiceOption {
  vocabId: string;
  label: string;
  imageSrc: string;
}

export interface WordBankChallengeBase {
  id: string;
  vocabId: string;
  categoryLabel: string;
  speakerImage: string;
  speakerName: string;
  sourceText: string;
  audioText: string;
  audioLang: 'en' | 'none';
  wordHints: Record<string, string>;
  targetTokens: string[];
  acceptedVariants?: string[];
  distractorTokens: string[];
  translationNote: string;
}

export type DuolingoChallenge =
  | {
      type: 'picture_choice';
      id: string;
      vocabId: string;
      kicker: string;
      prompt: string;
      audioWord: string;
      options: PictureChoiceOption[];
      correctIndex: number;
      translationNote: string;
    }
  | ({
      type: 'word_bank_translate';
      kicker: string;
      promptTitle: string;
    } & WordBankChallengeBase)
  | {
      type: 'speak';
      id: string;
      vocabId: string;
      kicker: string;
      promptTitle: string;
      speakerImage: string;
      speakerName: string;
      targetSentence: string;
      wordHints: Record<string, string>;
      translationNote: string;
    }
  | {
      type: 'dialogue_complete';
      id: string;
      vocabId: string;
      kicker: string;
      promptTitle: string;
      speakerAImage: string;
      speakerAName: string;
      speakerALine: string;
      speakerAHints: Record<string, string>;
      speakerBImage: string;
      speakerBName: string;
      choices: string[];
      correctIndex: number;
      translationNote: string;
    }
  | {
      type: 'listen_word_bank';
      id: string;
      vocabId: string;
      kicker: string;
      promptTitle: string;
      audioSentence: string;
      targetTokens: string[];
      distractorTokens: string[];
      translationNote: string;
    }
  | {
      type: 'match_pairs';
      id: string;
      vocabId: string;
      kicker: string;
      promptTitle: string;
      pairs: Array<{
        vocabId: string;
        leftText: string;
        rightText: string;
        audioWord: string;
      }>;
    };

function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// ============================================================================
// 1. WORD BANK TRANSLATE DATA (PEOPLE FOCUS — EN -> ID & ID -> EN)
// ============================================================================
interface WordBankSeed {
  vocabId: PeopleVocabId;
  direction: 'en_to_id' | 'id_to_en';
  speakerId: PeopleVocabId;
  sourceText: string;
  targetTokens: string[];
  acceptedVariants?: string[];
  distractors: string[];
  wordHints: Record<string, string>;
  translationNote: string;
}

const PEOPLE_WORD_BANK_SEEDS: WordBankSeed[] = [
  {
    vocabId: 'v_1_man',
    direction: 'en_to_id',
    speakerId: 'v_1_man',
    sourceText: 'The friendly man',
    targetTokens: ['Pria', 'yang', 'ramah'],
    acceptedVariants: ['pria ramah', 'pria dewasa yang ramah'],
    distractors: ['wanita', 'bayi'],
    wordHints: { the: 'itu / tersebut', friendly: 'ramah', man: 'pria dewasa' },
    translationNote: 'Pria yang ramah',
  },
  {
    vocabId: 'v_1_man',
    direction: 'id_to_en',
    speakerId: 'v_1_boy',
    sourceText: 'Dia seorang pria dewasa',
    targetTokens: ['He', 'is', 'a', 'man'],
    distractors: ['woman', 'baby'],
    wordHints: { dia: 'he / she', seorang: 'a', 'pria dewasa': 'man' },
    translationNote: 'He is a man',
  },
  {
    vocabId: 'v_1_woman',
    direction: 'en_to_id',
    speakerId: 'v_1_woman',
    sourceText: 'Good morning, woman!',
    targetTokens: ['Selamat', 'pagi,', 'wanita!'],
    acceptedVariants: ['selamat pagi wanita', 'selamat pagi wanita dewasa'],
    distractors: ['malam', 'pria'],
    wordHints: { good: 'selamat', morning: 'pagi', woman: 'wanita dewasa' },
    translationNote: 'Selamat pagi, wanita!',
  },
  {
    vocabId: 'v_1_woman',
    direction: 'id_to_en',
    speakerId: 'v_1_woman',
    sourceText: 'Wanita itu temanku',
    targetTokens: ['That', 'woman', 'is', 'my', 'friend'],
    acceptedVariants: ['the woman is my friend'],
    distractors: ['man', 'boy'],
    wordHints: { wanita: 'woman', itu: 'that / the', temanku: 'my friend' },
    translationNote: 'That woman is my friend',
  },
  {
    vocabId: 'v_1_boy',
    direction: 'en_to_id',
    speakerId: 'v_1_boy',
    sourceText: 'A happy boy',
    targetTokens: ['Seorang', 'anak', 'laki-laki', 'bahagia'],
    acceptedVariants: ['anak laki laki bahagia', 'seorang anak laki laki yang bahagia'],
    distractors: ['perempuan', 'kakek'],
    wordHints: { a: 'seorang', happy: 'bahagia / senang', boy: 'anak laki-laki' },
    translationNote: 'Seorang anak laki-laki bahagia',
  },
  {
    vocabId: 'v_1_boy',
    direction: 'id_to_en',
    speakerId: 'v_1_girl',
    sourceText: 'Anak laki-laki dan anak perempuan',
    targetTokens: ['The', 'boy', 'and', 'the', 'girl'],
    acceptedVariants: ['a boy and a girl', 'boy and girl'],
    distractors: ['man', 'baby'],
    wordHints: { 'anak laki-laki': 'boy', dan: 'and', 'anak perempuan': 'girl' },
    translationNote: 'The boy and the girl',
  },
  {
    vocabId: 'v_1_girl',
    direction: 'en_to_id',
    speakerId: 'v_1_girl',
    sourceText: 'The young girl smiles',
    targetTokens: ['Anak', 'perempuan', 'muda', 'tersenyum'],
    acceptedVariants: ['anak perempuan itu tersenyum'],
    distractors: ['pria', 'menangis'],
    wordHints: { the: 'itu', young: 'muda / kecil', girl: 'anak perempuan', smiles: 'tersenyum' },
    translationNote: 'Anak perempuan muda tersenyum',
  },
  {
    vocabId: 'v_1_friend',
    direction: 'en_to_id',
    speakerId: 'v_1_friend',
    sourceText: 'Hello, my friend!',
    targetTokens: ['Halo,', 'temanku!'],
    acceptedVariants: ['halo teman saya', 'halo teman ku'],
    distractors: ['selamat tinggal', 'bayi'],
    wordHints: { hello: 'halo', my: 'saya / -ku', friend: 'teman' },
    translationNote: 'Halo, temanku!',
  },
  {
    vocabId: 'v_1_friend',
    direction: 'id_to_en',
    speakerId: 'v_1_friend',
    sourceText: 'Kamu adalah teman baikku',
    targetTokens: ['You', 'are', 'my', 'good', 'friend'],
    distractors: ['baby', 'stranger'],
    wordHints: { kamu: 'you', teman: 'friend', baikku: 'my good' },
    translationNote: 'You are my good friend',
  },
  {
    vocabId: 'v_1_boyfriend',
    direction: 'en_to_id',
    speakerId: 'v_1_boyfriend',
    sourceText: 'Meet my boyfriend',
    targetTokens: ['Temui', 'pacar', 'laki-laki', 'saya'],
    acceptedVariants: ['kenalan dengan pacar laki laki saya', 'temui pacar laki-lakiku'],
    distractors: ['perempuan', 'keluarga'],
    wordHints: { meet: 'temui / kenali', my: 'saya', boyfriend: 'pacar laki-laki' },
    translationNote: 'Temui pacar laki-laki saya',
  },
  {
    vocabId: 'v_1_girlfriend',
    direction: 'en_to_id',
    speakerId: 'v_1_girlfriend',
    sourceText: 'Thank you, my girlfriend',
    targetTokens: ['Terima', 'kasih,', 'pacar', 'perempuan', 'saya'],
    acceptedVariants: ['terima kasih pacar perempuanku'],
    distractors: ['maaf', 'laki-laki'],
    wordHints: { thank: 'terima', you: 'kasih', my: 'saya', girlfriend: 'pacar perempuan' },
    translationNote: 'Terima kasih, pacar perempuan saya',
  },
  {
    vocabId: 'v_1_person',
    direction: 'en_to_id',
    speakerId: 'v_1_person',
    sourceText: 'One nice person',
    targetTokens: ['Satu', 'orang', 'yang', 'baik'],
    acceptedVariants: ['seorang individu yang baik', 'satu individu baik'],
    distractors: ['banyak', 'bayi'],
    wordHints: { one: 'satu', nice: 'baik / ramah', person: 'orang / individu' },
    translationNote: 'Satu orang yang baik',
  },
  {
    vocabId: 'v_1_person',
    direction: 'id_to_en',
    speakerId: 'v_1_person',
    sourceText: 'Dia orang yang baik',
    targetTokens: ['She', 'is', 'a', 'good', 'person'],
    acceptedVariants: ['he is a good person'],
    distractors: ['people', 'baby'],
    wordHints: { dia: 'she / he', orang: 'person', baik: 'good' },
    translationNote: 'She is a good person',
  },
  {
    vocabId: 'v_1_people',
    direction: 'en_to_id',
    speakerId: 'v_1_people',
    sourceText: 'Many people say hello',
    targetTokens: ['Banyak', 'orang-orang', 'menyapa', 'halo'],
    acceptedVariants: ['banyak orang menyapa halo', 'orang orang menyapa halo'],
    distractors: ['sendiri', 'tidur'],
    wordHints: { many: 'banyak', people: 'orang-orang', say: 'berkata / menyapa', hello: 'halo' },
    translationNote: 'Banyak orang-orang menyapa halo',
  },
  {
    vocabId: 'v_1_people',
    direction: 'id_to_en',
    speakerId: 'v_1_people',
    sourceText: 'Orang-orang di desa',
    targetTokens: ['The', 'people', 'in', 'the', 'village'],
    acceptedVariants: ['people in village'],
    distractors: ['person', 'baby'],
    wordHints: { 'orang-orang': 'people', di: 'in', desa: 'village' },
    translationNote: 'The people in the village',
  },
  {
    vocabId: 'v_1_adult',
    direction: 'en_to_id',
    speakerId: 'v_1_adult',
    sourceText: 'An adult helps the child',
    targetTokens: ['Orang', 'dewasa', 'membantu', 'anak', 'itu'],
    distractors: ['bayi', 'pergi'],
    wordHints: { an: 'seorang', adult: 'orang dewasa', helps: 'membantu', child: 'anak' },
    translationNote: 'Orang dewasa membantu anak itu',
  },
  {
    vocabId: 'v_1_baby',
    direction: 'en_to_id',
    speakerId: 'v_1_baby',
    sourceText: 'Good night, cute baby',
    targetTokens: ['Selamat', 'tidur,', 'bayi', 'lucu'],
    acceptedVariants: ['selamat tidur bayi yang lucu'],
    distractors: ['pagi', 'kakek'],
    wordHints: { good: 'selamat', night: 'tidur / malam', cute: 'lucu', baby: 'bayi' },
    translationNote: 'Selamat tidur, bayi lucu',
  },
  {
    vocabId: 'v_1_baby',
    direction: 'id_to_en',
    speakerId: 'v_1_baby',
    sourceText: 'Bayi kecil itu tersenyum',
    targetTokens: ['The', 'little', 'baby', 'smiles'],
    distractors: ['adult', 'man'],
    wordHints: { bayi: 'baby', kecil: 'little', tersenyum: 'smiles' },
    translationNote: 'The little baby smiles',
  },
  {
    vocabId: 'v_1_mr',
    direction: 'en_to_id',
    speakerId: 'v_1_mr',
    sourceText: 'Good morning, Mr. Budi',
    targetTokens: ['Selamat', 'pagi,', 'Bapak', 'Budi'],
    acceptedVariants: ['selamat pagi tuan budi'],
    distractors: ['Ibu', 'Nona'],
    wordHints: { good: 'selamat', morning: 'pagi', mr: 'Tuan / Bapak' },
    translationNote: 'Selamat pagi, Bapak Budi',
  },
  {
    vocabId: 'v_1_mrs',
    direction: 'en_to_id',
    speakerId: 'v_1_mrs',
    sourceText: 'Welcome, Mrs. Sari!',
    targetTokens: ['Selamat', 'datang,', 'Ibu', 'Sari!'],
    acceptedVariants: ['selamat datang nyonya sari'],
    distractors: ['Tuan', 'Nona'],
    wordHints: { welcome: 'selamat datang', mrs: 'Nyonya / Ibu' },
    translationNote: 'Selamat datang, Ibu Sari!',
  },
  {
    vocabId: 'v_1_miss',
    direction: 'en_to_id',
    speakerId: 'v_1_miss',
    sourceText: 'Thank you, Miss Rani',
    targetTokens: ['Terima', 'kasih,', 'Nona', 'Rani'],
    distractors: ['Bapak', 'Nyonya'],
    wordHints: { thank: 'terima', you: 'kasih', miss: 'Nona' },
    translationNote: 'Terima kasih, Nona Rani',
  },
  {
    vocabId: 'v_1_miss',
    direction: 'id_to_en',
    speakerId: 'v_1_miss',
    sourceText: 'Selamat siang, Nona!',
    targetTokens: ['Good', 'afternoon,', 'Miss!'],
    distractors: ['Mr.', 'Mrs.'],
    wordHints: { 'selamat siang': 'good afternoon', nona: 'Miss' },
    translationNote: 'Good afternoon, Miss!',
  },
];

// ============================================================================
// 2. SPEAK CHALLENGES (PEOPLE FOCUS — UCAPKAN KALIMAT INI)
// ============================================================================
interface SpeakSeed {
  vocabId: PeopleVocabId;
  speakerId: PeopleVocabId;
  sentence: string;
  wordHints: Record<string, string>;
  translationNote: string;
}

const PEOPLE_SPEAK_SEEDS: SpeakSeed[] = [
  {
    vocabId: 'v_1_man',
    speakerId: 'v_1_man',
    sentence: 'Hello, I am a man.',
    wordHints: { hello: 'halo', am: 'adalah', man: 'pria dewasa' },
    translationNote: 'Halo, saya seorang pria dewasa.',
  },
  {
    vocabId: 'v_1_woman',
    speakerId: 'v_1_woman',
    sentence: 'She is a friendly woman.',
    wordHints: { she: 'dia (pr)', friendly: 'ramah', woman: 'wanita dewasa' },
    translationNote: 'Dia seorang wanita yang ramah.',
  },
  {
    vocabId: 'v_1_boy',
    speakerId: 'v_1_boy',
    sentence: 'The boy is very happy!',
    wordHints: { boy: 'anak laki-laki', very: 'sangat', happy: 'senang' },
    translationNote: 'Anak laki-laki itu sangat senang!',
  },
  {
    vocabId: 'v_1_girl',
    speakerId: 'v_1_girl',
    sentence: 'That girl is my sister.',
    wordHints: { girl: 'anak perempuan', my: 'milikku', sister: 'saudari' },
    translationNote: 'Anak perempuan itu adalah saudari perempuanku.',
  },
  {
    vocabId: 'v_1_friend',
    speakerId: 'v_1_friend',
    sentence: 'Good morning, my friend!',
    wordHints: { good: 'selamat', morning: 'pagi', friend: 'teman' },
    translationNote: 'Selamat pagi, temanku!',
  },
  {
    vocabId: 'v_1_boyfriend',
    speakerId: 'v_1_boyfriend',
    sentence: 'He is my boyfriend.',
    wordHints: { he: 'dia (lk)', my: 'milikku', boyfriend: 'pacar laki-laki' },
    translationNote: 'Dia adalah pacar laki-laki saya.',
  },
  {
    vocabId: 'v_1_girlfriend',
    speakerId: 'v_1_girlfriend',
    sentence: 'She is my girlfriend.',
    wordHints: { she: 'dia (pr)', my: 'milikku', girlfriend: 'pacar perempuan' },
    translationNote: 'Dia adalah pacar perempuan saya.',
  },
  {
    vocabId: 'v_1_person',
    speakerId: 'v_1_person',
    sentence: 'You are a good person.',
    wordHints: { you: 'kamu', good: 'baik', person: 'orang' },
    translationNote: 'Kamu adalah orang yang baik.',
  },
  {
    vocabId: 'v_1_people',
    speakerId: 'v_1_people',
    sentence: 'Many people are here today.',
    wordHints: { many: 'banyak', people: 'orang-orang', here: 'di sini', today: 'hari ini' },
    translationNote: 'Banyak orang-orang berada di sini hari ini.',
  },
  {
    vocabId: 'v_1_adult',
    speakerId: 'v_1_adult',
    sentence: 'I am an adult now.',
    wordHints: { adult: 'orang dewasa', now: 'sekarang' },
    translationNote: 'Saya seorang orang dewasa sekarang.',
  },
  {
    vocabId: 'v_1_baby',
    speakerId: 'v_1_baby',
    sentence: 'The baby is so cute!',
    wordHints: { baby: 'bayi', cute: 'lucu / menggemaskan' },
    translationNote: 'Bayi itu sangat lucu!',
  },
  {
    vocabId: 'v_1_mr',
    speakerId: 'v_1_mr',
    sentence: 'Welcome, Mister Budi!',
    wordHints: { welcome: 'selamat datang', mister: 'Tuan / Bapak' },
    translationNote: 'Selamat datang, Bapak Budi!',
  },
  {
    vocabId: 'v_1_mrs',
    speakerId: 'v_1_mrs',
    sentence: 'Thank you, Missus Sari!',
    wordHints: { thank: 'terima kasih', missus: 'Nyonya / Ibu' },
    translationNote: 'Terima kasih, Ibu Sari!',
  },
  {
    vocabId: 'v_1_miss',
    speakerId: 'v_1_miss',
    sentence: 'Good afternoon, Miss Rani!',
    wordHints: { afternoon: 'siang', miss: 'Nona' },
    translationNote: 'Selamat siang, Nona Rani!',
  },
];

// ============================================================================
// 3. DIALOGUE COMPLETE CHALLENGES (LENGKAPI KALIMATNYA)
// ============================================================================
interface DialogueSeed {
  vocabId: PeopleVocabId;
  speakerAId: PeopleVocabId;
  speakerAName: string;
  speakerALine: string;
  speakerAHints: Record<string, string>;
  speakerBId: PeopleVocabId;
  speakerBName: string;
  correctReply: string;
  distractorReplies: string[];
  translationNote: string;
}

const PEOPLE_DIALOGUE_SEEDS: DialogueSeed[] = [
  {
    vocabId: 'v_1_friend',
    speakerAId: 'v_1_boy',
    speakerAName: 'Bima',
    speakerALine: 'Hi! Who is that girl beside you?',
    speakerAHints: { who: 'siapa', girl: 'anak perempuan', beside: 'di sebelah' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Lina',
    correctReply: 'She is my friend, Rani.',
    distractorReplies: ['Goodbye, see you!', 'Yes, one hundred.'],
    translationNote: 'Dia adalah teman saya, Rani.',
  },
  {
    vocabId: 'v_1_mr',
    speakerAId: 'v_1_mr',
    speakerAName: 'Mr. Dani',
    speakerALine: 'Good morning! Are you ready to learn?',
    speakerAHints: { morning: 'pagi', ready: 'siap', learn: 'belajar' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Adi',
    correctReply: 'Yes, good morning, Mr. Dani!',
    distractorReplies: ['Good night, baby!', 'No, goodbye.'],
    translationNote: 'Ya, selamat pagi, Bapak Dani!',
  },
  {
    vocabId: 'v_1_mrs',
    speakerAId: 'v_1_mrs',
    speakerAName: 'Mrs. Sari',
    speakerALine: 'Welcome to Desa Sapaan!',
    speakerAHints: { welcome: 'selamat datang' },
    speakerBId: 'v_1_woman',
    speakerBName: 'Maya',
    correctReply: 'Thank you, Mrs. Sari!',
    distractorReplies: ['Sorry, Mr. Sari.', 'One baby, please.'],
    translationNote: 'Terima kasih, Ibu Sari!',
  },
  {
    vocabId: 'v_1_miss',
    speakerAId: 'v_1_miss',
    speakerAName: 'Miss Nia',
    speakerALine: 'Hello! Are you married?',
    speakerAHints: { married: 'menikah' },
    speakerBId: 'v_1_man',
    speakerBName: 'Raka',
    correctReply: 'No, I am single, Miss Nia.',
    distractorReplies: ['Yes, good night!', 'Many people.'],
    translationNote: 'Tidak, saya lajang, Nona Nia.',
  },
  {
    vocabId: 'v_1_baby',
    speakerAId: 'v_1_woman',
    speakerAName: 'Tari',
    speakerALine: 'Look! Who is sleeping in the crib?',
    speakerAHints: { look: 'lihat', sleeping: 'sedang tidur' },
    speakerBId: 'v_1_man',
    speakerBName: 'Budi',
    correctReply: 'That is our cute baby.',
    distractorReplies: ['That is an old adult.', 'Hello, goodbye!'],
    translationNote: 'Itu adalah bayi lucu kami.',
  },
  {
    vocabId: 'v_1_boyfriend',
    speakerAId: 'v_1_girlfriend',
    speakerAName: 'Sinta',
    speakerALine: 'He brings a red rose for me.',
    speakerAHints: { brings: 'membawa', rose: 'mawar' },
    speakerBId: 'v_1_friend',
    speakerBName: 'Nadia',
    correctReply: 'Oh, he is your boyfriend!',
    distractorReplies: ['Oh, he is a baby!', 'Good evening, sir.'],
    translationNote: 'Oh, dia adalah pacar laki-lakimu!',
  },
  {
    vocabId: 'v_1_girlfriend',
    speakerAId: 'v_1_boyfriend',
    speakerAName: 'Arya',
    speakerALine: 'I have a small gift for her.',
    speakerAHints: { gift: 'hadiah', for: 'untuk' },
    speakerBId: 'v_1_man',
    speakerBName: 'Dito',
    correctReply: 'She is your girlfriend, right?',
    distractorReplies: ['She is a boy, right?', 'Bye, thank you!'],
    translationNote: 'Dia adalah pacar perempuanmu, kan?',
  },
  {
    vocabId: 'v_1_people',
    speakerAId: 'v_1_adult',
    speakerAName: 'Pak Guru',
    speakerALine: 'How many guests are in the hall?',
    speakerAHints: { many: 'berapa banyak', guests: 'tamu' },
    speakerBId: 'v_1_person',
    speakerBName: 'Wulan',
    correctReply: 'There are many people inside.',
    distractorReplies: ['Only one baby.', 'Good morning, man.'],
    translationNote: 'Ada banyak orang-orang di dalam.',
  },
  {
    vocabId: 'v_1_adult',
    speakerAId: 'v_1_boy',
    speakerAName: 'Tobi',
    speakerALine: 'Can that child drive a car?',
    speakerAHints: { child: 'anak', drive: 'menyetir' },
    speakerBId: 'v_1_adult',
    speakerBName: 'Kak Rian',
    correctReply: 'No, only an adult can drive.',
    distractorReplies: ['Yes, a baby can drive.', 'Welcome, people!'],
    translationNote: 'Tidak, hanya orang dewasa yang boleh menyetir.',
  },
  {
    vocabId: 'v_1_person',
    speakerAId: 'v_1_girl',
    speakerAName: 'Rani',
    speakerALine: 'Thank you for helping me!',
    speakerAHints: { thank: 'terima kasih', helping: 'membantu' },
    speakerBId: 'v_1_person',
    speakerBName: 'Eko',
    correctReply: 'You are a kind person, welcome!',
    distractorReplies: ['Goodbye, night!', 'Ten people, please.'],
    translationNote: 'Kamu orang yang baik, sama-sama!',
  },
  {
    vocabId: 'v_1_man',
    speakerAId: 'v_1_woman',
    speakerAName: 'Ibu Ani',
    speakerALine: 'Who is wearing the blue shirt?',
    speakerAHints: { who: 'siapa', wearing: 'memakai' },
    speakerBId: 'v_1_man',
    speakerBName: 'Pak Eko',
    correctReply: 'That man over there.',
    distractorReplies: ['That baby over there.', 'Thank you very much.'],
    translationNote: 'Pria dewasa di sebelah sana itu.',
  },
  {
    vocabId: 'v_1_boy',
    speakerAId: 'v_1_girl',
    speakerAName: 'Dewi',
    speakerALine: 'Who is waving happily?',
    speakerAHints: { waving: 'melambai', happily: 'dengan ceria' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Bimo',
    correctReply: 'The boy in the white shirt.',
    distractorReplies: ['The woman in red.', 'Good evening, Mrs.'],
    translationNote: 'Anak laki-laki berbaju putih itu.',
  },
];

// ============================================================================
// 4. LISTEN WORD BANK CHALLENGES (PILIH YANG KAMU DENGAR)
// ============================================================================
interface ListenSeed {
  vocabId: PeopleVocabId;
  sentence: string;
  tokens: string[];
  distractors: string[];
  translationNote: string;
}

const PEOPLE_LISTEN_SEEDS: ListenSeed[] = [
  {
    vocabId: 'v_1_man',
    sentence: 'Hello, friendly man!',
    tokens: ['Hello,', 'friendly', 'man!'],
    distractors: ['woman', 'baby'],
    translationNote: 'Halo, pria yang ramah!',
  },
  {
    vocabId: 'v_1_woman',
    sentence: 'Good morning, woman.',
    tokens: ['Good', 'morning,', 'woman.'],
    distractors: ['man', 'night'],
    translationNote: 'Selamat pagi, wanita.',
  },
  {
    vocabId: 'v_1_boy',
    sentence: 'The happy boy.',
    tokens: ['The', 'happy', 'boy.'],
    distractors: ['girl', 'adult'],
    translationNote: 'Anak laki-laki yang bahagia.',
  },
  {
    vocabId: 'v_1_girl',
    sentence: 'She is a girl.',
    tokens: ['She', 'is', 'a', 'girl.'],
    distractors: ['boy', 'man'],
    translationNote: 'Dia seorang anak perempuan.',
  },
  {
    vocabId: 'v_1_friend',
    sentence: 'Meet my friend.',
    tokens: ['Meet', 'my', 'friend.'],
    distractors: ['baby', 'people'],
    translationNote: 'Kenalkan teman saya.',
  },
  {
    vocabId: 'v_1_boyfriend',
    sentence: 'He is my boyfriend.',
    tokens: ['He', 'is', 'my', 'boyfriend.'],
    distractors: ['girlfriend', 'adult'],
    translationNote: 'Dia pacar laki-laki saya.',
  },
  {
    vocabId: 'v_1_girlfriend',
    sentence: 'My nice girlfriend.',
    tokens: ['My', 'nice', 'girlfriend.'],
    distractors: ['boyfriend', 'mr'],
    translationNote: 'Pacar perempuan saya yang baik.',
  },
  {
    vocabId: 'v_1_person',
    sentence: 'One good person.',
    tokens: ['One', 'good', 'person.'],
    distractors: ['people', 'baby'],
    translationNote: 'Satu orang yang baik.',
  },
  {
    vocabId: 'v_1_people',
    sentence: 'Many happy people.',
    tokens: ['Many', 'happy', 'people.'],
    distractors: ['person', 'boy'],
    translationNote: 'Banyak orang-orang yang bahagia.',
  },
  {
    vocabId: 'v_1_adult',
    sentence: 'A smart adult.',
    tokens: ['A', 'smart', 'adult.'],
    distractors: ['baby', 'girl'],
    translationNote: 'Seorang dewasa yang cerdas.',
  },
  {
    vocabId: 'v_1_baby',
    sentence: 'Cute little baby.',
    tokens: ['Cute', 'little', 'baby.'],
    distractors: ['man', 'adult'],
    translationNote: 'Bayi kecil yang lucu.',
  },
  {
    vocabId: 'v_1_mr',
    sentence: 'Welcome, Mister Budi!',
    tokens: ['Welcome,', 'Mister', 'Budi!'],
    distractors: ['Miss', 'Baby'],
    translationNote: 'Selamat datang, Bapak Budi!',
  },
  {
    vocabId: 'v_1_mrs',
    sentence: 'Thank you, Missus Sari!',
    tokens: ['Thank', 'you,', 'Missus', 'Sari!'],
    distractors: ['Mister', 'Girl'],
    translationNote: 'Terima kasih, Ibu Sari!',
  },
  {
    vocabId: 'v_1_miss',
    sentence: 'Goodbye, Miss Rani!',
    tokens: ['Goodbye,', 'Miss', 'Rani!'],
    distractors: ['Mister', 'People'],
    translationNote: 'Selamat tinggal, Nona Rani!',
  },
];

// ============================================================================
// BUILDERS FOR EACH OF THE 6 CHALLENGE TYPES
// ============================================================================

export function buildPeoplePictureChoice(targetId?: PeopleVocabId): DuolingoChallenge {
  const target = targetId ?? pickRandom(PEOPLE_VOCAB_IDS);
  const entry = VOCAB_BY_ID[target]!;
  const others = shuffle(PEOPLE_VOCAB_IDS.filter((id) => id !== target)).slice(0, 2);
  const optionIds = shuffle([target, ...others]);
  const correctIndex = optionIds.indexOf(target);

  return {
    type: 'picture_choice',
    id: `pic_${target}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    vocabId: target,
    kicker: 'KOSAKATA BARU · PEOPLE',
    prompt: `Mana yang artinya “${entry.meaningId}”?`,
    audioWord: entry.word,
    options: optionIds.map((id) => ({
      vocabId: id,
      label: VOCAB_BY_ID[id]?.word ?? id,
      imageSrc: VOCAB_IMAGE_BY_ID[id],
    })),
    correctIndex,
    translationNote: `${entry.word} = ${entry.meaningId}`,
  };
}

export function buildPeopleWordBankTranslate(targetId?: PeopleVocabId): DuolingoChallenge {
  const candidates = targetId
    ? PEOPLE_WORD_BANK_SEEDS.filter((s) => s.vocabId === targetId)
    : PEOPLE_WORD_BANK_SEEDS;
  const seed = pickRandom(candidates.length > 0 ? candidates : PEOPLE_WORD_BANK_SEEDS);
  const speakerEntry = VOCAB_BY_ID[seed.speakerId];

  return {
    type: 'word_bank_translate',
    id: `wb_${seed.vocabId}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    vocabId: seed.vocabId,
    kicker: 'SUSUN KATA · PEOPLE',
    promptTitle:
      seed.direction === 'en_to_id'
        ? 'Tuliskan dalam bahasa Indonesia'
        : 'Tuliskan dalam bahasa Inggris',
    categoryLabel: 'People',
    speakerImage: VOCAB_IMAGE_BY_ID[seed.speakerId],
    speakerName: speakerEntry?.word ?? 'Warga Desa',
    sourceText: seed.sourceText,
    audioText: seed.direction === 'en_to_id' ? seed.sourceText : seed.targetTokens.join(' '),
    audioLang: seed.direction === 'en_to_id' ? 'en' : 'none',
    wordHints: seed.wordHints,
    targetTokens: seed.targetTokens,
    acceptedVariants: seed.acceptedVariants,
    distractorTokens: seed.distractors,
    translationNote: seed.translationNote,
  };
}

export function buildPeopleSpeak(targetId?: PeopleVocabId): DuolingoChallenge {
  const candidates = targetId
    ? PEOPLE_SPEAK_SEEDS.filter((s) => s.vocabId === targetId)
    : PEOPLE_SPEAK_SEEDS;
  const seed = pickRandom(candidates.length > 0 ? candidates : PEOPLE_SPEAK_SEEDS);
  const speakerEntry = VOCAB_BY_ID[seed.speakerId];

  return {
    type: 'speak',
    id: `spk_${seed.vocabId}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    vocabId: seed.vocabId,
    kicker: 'UCAPKAN · PEOPLE',
    promptTitle: 'Ucapkan kalimat ini',
    speakerImage: VOCAB_IMAGE_BY_ID[seed.speakerId],
    speakerName: speakerEntry?.word ?? 'Warga Desa',
    targetSentence: seed.sentence,
    wordHints: seed.wordHints,
    translationNote: seed.translationNote,
  };
}

export function buildPeopleDialogueComplete(targetId?: PeopleVocabId): DuolingoChallenge {
  const candidates = targetId
    ? PEOPLE_DIALOGUE_SEEDS.filter((s) => s.vocabId === targetId)
    : PEOPLE_DIALOGUE_SEEDS;
  const seed = pickRandom(candidates.length > 0 ? candidates : PEOPLE_DIALOGUE_SEEDS);
  const rawChoices = [seed.correctReply, ...seed.distractorReplies.slice(0, 2)];
  const indexed = shuffle(rawChoices.map((c, idx) => ({ text: c, ok: idx === 0 })));
  const correctIndex = indexed.findIndex((i) => i.ok);

  return {
    type: 'dialogue_complete',
    id: `dlg_${seed.vocabId}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    vocabId: seed.vocabId,
    kicker: 'PERCAKAPAN · PEOPLE',
    promptTitle: 'Lengkapi kalimatnya',
    speakerAImage: VOCAB_IMAGE_BY_ID[seed.speakerAId],
    speakerAName: seed.speakerAName,
    speakerALine: seed.speakerALine,
    speakerAHints: seed.speakerAHints,
    speakerBImage: VOCAB_IMAGE_BY_ID[seed.speakerBId],
    speakerBName: seed.speakerBName,
    choices: indexed.map((i) => i.text),
    correctIndex,
    translationNote: seed.translationNote,
  };
}

export function buildPeopleListenWordBank(targetId?: PeopleVocabId): DuolingoChallenge {
  const candidates = targetId
    ? PEOPLE_LISTEN_SEEDS.filter((s) => s.vocabId === targetId)
    : PEOPLE_LISTEN_SEEDS;
  const seed = pickRandom(candidates.length > 0 ? candidates : PEOPLE_LISTEN_SEEDS);

  return {
    type: 'listen_word_bank',
    id: `lst_${seed.vocabId}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    vocabId: seed.vocabId,
    kicker: 'DENGARKAN · PEOPLE',
    promptTitle: 'Pilih yang kamu dengar',
    audioSentence: seed.sentence,
    targetTokens: seed.tokens,
    distractorTokens: seed.distractors,
    translationNote: seed.translationNote,
  };
}

export function buildPeopleMatchPairs(preferredId?: PeopleVocabId): DuolingoChallenge {
  const rest = shuffle(PEOPLE_VOCAB_IDS.filter((id) => id !== preferredId));
  const picked = preferredId ? [preferredId, ...rest.slice(0, 4)] : rest.slice(0, 5);
  const primaryId = picked[0];

  return {
    type: 'match_pairs',
    id: `mat_${primaryId}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    vocabId: primaryId,
    kicker: 'PASANGKAN · PEOPLE',
    promptTitle: 'Pilih pasangan yang cocok',
    pairs: picked.map((id) => {
      const entry = VOCAB_BY_ID[id]!;
      return {
        vocabId: id,
        leftText: entry.meaningId,
        rightText: entry.word,
        audioWord: entry.word,
      };
    }),
  };
}

export const ALL_DUOLINGO_TYPES: DuolingoChallengeType[] = [
  'picture_choice',
  'word_bank_translate',
  'speak',
  'dialogue_complete',
  'listen_word_bank',
  'match_pairs',
];

export function buildChallengeOfType(
  type: DuolingoChallengeType,
  targetVocabId?: PeopleVocabId,
): DuolingoChallenge {
  switch (type) {
    case 'picture_choice':
      return buildPeoplePictureChoice(targetVocabId);
    case 'word_bank_translate':
      return buildPeopleWordBankTranslate(targetVocabId);
    case 'speak':
      return buildPeopleSpeak(targetVocabId);
    case 'dialogue_complete':
      return buildPeopleDialogueComplete(targetVocabId);
    case 'listen_word_bank':
      return buildPeopleListenWordBank(targetVocabId);
    case 'match_pairs':
      return buildPeopleMatchPairs(targetVocabId);
  }
}

export function pickSmartPeopleVocabId(
  progress: Record<string, WordProgress> = {},
  excludeVocabId?: string | null,
): PeopleVocabId {
  const pool = PEOPLE_VOCAB_IDS.filter((id) => id !== excludeVocabId);
  const scored = (pool.length > 0 ? pool : PEOPLE_VOCAB_IDS).map((id) => ({
    id,
    score: (progress[id]?.b || 0) + Math.random() * 2.5,
  }));
  scored.sort((a, b) => a.score - b.score);
  return scored[0].id;
}

export function pickRandomPeopleChallenge(options?: {
  wordProgress?: Record<string, WordProgress>;
  excludeType?: DuolingoChallengeType | null;
  excludeVocabId?: string | null;
  allowSpeak?: boolean;
  allowMatch?: boolean;
}): DuolingoChallenge {
  const allowSpeak = options?.allowSpeak ?? true;
  const allowMatch = options?.allowMatch ?? true;
  let types = ALL_DUOLINGO_TYPES.filter((t) => {
    if (!allowSpeak && t === 'speak') return false;
    if (!allowMatch && t === 'match_pairs') return false;
    return true;
  });
  const nonRepeatTypes = types.filter((t) => t !== options?.excludeType);
  if (nonRepeatTypes.length > 0) types = nonRepeatTypes;

  const chosenType = pickRandom(types);
  const targetId = pickSmartPeopleVocabId(
    options?.wordProgress ?? {},
    options?.excludeVocabId,
  );
  return buildChallengeOfType(chosenType, targetId);
}

/**
 * Builds a balanced deck of N People Duolingo challenges ensuring all 6 challenge types
 * appear randomly in the session (no two consecutive challenges of the same type).
 */
export function buildPeopleDuolingoDeck(
  count = 10,
  options?: { allowSpeak?: boolean; wordProgress?: Record<string, WordProgress> },
): DuolingoChallenge[] {
  const allowSpeak = options?.allowSpeak ?? true;
  const baseTypes = ALL_DUOLINGO_TYPES.filter((t) => (allowSpeak ? true : t !== 'speak'));
  const deck: DuolingoChallenge[] = [];
  let prevType: DuolingoChallengeType | null = null;
  let prevVocab: string | null = null;

  // Ensure every enabled type appears at least once in the first batch
  const guaranteed = shuffle(baseTypes);
  const vocabCycle = shuffle(PEOPLE_VOCAB_IDS);

  for (let i = 0; i < count; i++) {
    let type: DuolingoChallengeType;
    if (i < guaranteed.length) {
      type = guaranteed[i];
      if (type === prevType && guaranteed.length > 1) {
        const swapIdx = (i + 1) % guaranteed.length;
        [guaranteed[i], guaranteed[swapIdx]] = [guaranteed[swapIdx], guaranteed[i]];
        type = guaranteed[i];
      }
    } else {
      const choices = baseTypes.filter((t) => t !== prevType);
      type = pickRandom(choices.length > 0 ? choices : baseTypes);
    }

    const vocabId: PeopleVocabId =
      vocabCycle[i % vocabCycle.length] === prevVocab
        ? vocabCycle[(i + 1) % vocabCycle.length]
        : vocabCycle[i % vocabCycle.length];

    const challenge = buildChallengeOfType(type, vocabId);
    deck.push(challenge);
    prevType = type;
    prevVocab = vocabId;
  }

  return deck;
}

// ============================================================================
// NORMALIZATION & FUZZY GRADING FOR WORD BANK & SPEAKING
// ============================================================================
export function normalizeSentenceText(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function evaluateWordBankAnswer(
  selectedTokens: string[],
  targetTokens: string[],
  acceptedVariants?: string[],
): boolean {
  const userNorm = normalizeSentenceText(selectedTokens.join(' '));
  const targetNorm = normalizeSentenceText(targetTokens.join(' '));
  if (userNorm === targetNorm) return true;
  if (acceptedVariants) {
    return acceptedVariants.some((v) => normalizeSentenceText(v) === userNorm);
  }
  return false;
}

const SPEECH_SYNONYMS: Record<string, string> = {
  mr: 'mister',
  mrs: 'missus',
  ms: 'miss',
  im: 'i am',
  youre: 'you are',
  hes: 'he is',
  shes: 'she is',
  its: 'it is',
  thats: 'that is',
  dont: 'do not',
  cant: 'can not',
  cannot: 'can not',
};

function tokenizeSpoken(text: string): string[] {
  const norm = normalizeSentenceText(text);
  const words = norm.split(' ').filter(Boolean);
  const expanded: string[] = [];
  for (const w of words) {
    const rep = SPEECH_SYNONYMS[w];
    if (rep) expanded.push(...rep.split(' '));
    else expanded.push(w);
  }
  return expanded;
}

export function evaluateSpokenEnglish(
  transcript: string,
  targetSentence: string,
): { matched: boolean; score: number } {
  const spoken = tokenizeSpoken(transcript);
  const target = tokenizeSpoken(targetSentence);
  if (target.length === 0 || spoken.length === 0) {
    return { matched: false, score: 0 };
  }

  const spokenSet = new Set(spoken);
  let hits = 0;
  for (const word of target) {
    if (spokenSet.has(word)) {
      hits += 1;
    } else {
      // Allow 1-char typo/phonetic fuzz for longer words
      const fuzzy = spoken.some(
        (sw) =>
          sw.length >= 4 &&
          word.length >= 4 &&
          (sw.startsWith(word.slice(0, 3)) || word.startsWith(sw.slice(0, 3))),
      );
      if (fuzzy) hits += 0.75;
    }
  }
  const score = hits / target.length;
  return {
    matched: score >= 0.7,
    score,
  };
}

let speakingDisabledUntilMs = 0;

export function isSpeakingTemporarilyDisabled(): boolean {
  return Date.now() < speakingDisabledUntilMs;
}

export function disableSpeakingTemporarily(minutes = 15): void {
  speakingDisabledUntilMs = Date.now() + minutes * 60 * 1000;
}

