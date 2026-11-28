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

export const FAMILY_VOCAB_IDS = [
  'v_3_parent',
  'v_3_father',
  'v_3_mother',
  'v_3_dad',
  'v_3_mom',
  'v_3_wife',
  'v_3_husband',
  'v_3_child',
  'v_3_son',
  'v_3_daughter',
  'v_3_sister',
  'v_3_brother',
  'v_3_family',
  'v_3_grandmother',
  'v_3_grandfather',
  'v_3_grandchild',
  'v_3_aunt',
  'v_3_uncle',
  'v_3_niece',
  'v_3_nephew',
  'v_3_cousin',
] as const;

export const DESA_ILLUSTRATED_VOCAB_IDS = [
  ...PEOPLE_VOCAB_IDS,
  ...FAMILY_VOCAB_IDS,
] as const;

export type PeopleVocabId = (typeof PEOPLE_VOCAB_IDS)[number];
export type FamilyVocabId = (typeof FAMILY_VOCAB_IDS)[number];
export type DesaVocabId = (typeof DESA_ILLUSTRATED_VOCAB_IDS)[number];

export const VOCAB_IMAGE_BY_ID: Record<string, string> = {
  // People (14)
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

  // Family (21)
  v_3_parent: './assets/vocab/family/parent.png',
  v_3_father: './assets/vocab/family/father.png',
  v_3_mother: './assets/vocab/family/mother.png',
  v_3_dad: './assets/vocab/family/dad.png',
  v_3_mom: './assets/vocab/family/mom.png',
  v_3_wife: './assets/vocab/family/wife.png',
  v_3_husband: './assets/vocab/family/husband.png',
  v_3_child: './assets/vocab/family/child.png',
  v_3_son: './assets/vocab/family/son.png',
  v_3_daughter: './assets/vocab/family/daughter.png',
  v_3_sister: './assets/vocab/family/sister.png',
  v_3_brother: './assets/vocab/family/brother.png',
  v_3_family: './assets/vocab/family/family.png',
  v_3_grandmother: './assets/vocab/family/grandmother.png',
  v_3_grandfather: './assets/vocab/family/grandfather.png',
  v_3_grandchild: './assets/vocab/family/grandchild.png',
  v_3_aunt: './assets/vocab/family/aunt.png',
  v_3_uncle: './assets/vocab/family/uncle.png',
  v_3_niece: './assets/vocab/family/niece_nephew.png',
  v_3_nephew: './assets/vocab/family/niece_nephew.png',
  v_3_cousin: './assets/vocab/family/cousin.png',
};

export function getVocabImage(vocabId: string): string | null {
  return VOCAB_IMAGE_BY_ID[vocabId] ?? null;
}

function getCategoryTag(vocabId: string): { upper: string; title: string } {
  if (vocabId.startsWith('v_3_')) return { upper: 'FAMILY', title: 'Family' };
  return { upper: 'PEOPLE', title: 'People' };
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
// 1. WORD BANK TRANSLATE DATA (PEOPLE + FAMILY — EN -> ID & ID -> EN)
// ============================================================================
interface WordBankSeed {
  vocabId: DesaVocabId;
  direction: 'en_to_id' | 'id_to_en';
  speakerId: DesaVocabId;
  sourceText: string;
  targetTokens: string[];
  acceptedVariants?: string[];
  distractors: string[];
  wordHints: Record<string, string>;
  translationNote: string;
}

const WORD_BANK_SEEDS: WordBankSeed[] = [
  // ---- PEOPLE ----
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

  // ---- FAMILY ----
  {
    vocabId: 'v_3_parent',
    direction: 'en_to_id',
    speakerId: 'v_3_parent',
    sourceText: 'Love your parents',
    targetTokens: ['Sayangi', 'orang', 'tuamu'],
    acceptedVariants: ['cintai orang tuamu', 'sayangi kedua orang tua'],
    distractors: ['teman', 'sepupu'],
    wordHints: { love: 'sayangi / cintai', your: '-mu', parents: 'orang tua' },
    translationNote: 'Sayangi orang tuamu',
  },
  {
    vocabId: 'v_3_father',
    direction: 'en_to_id',
    speakerId: 'v_3_father',
    sourceText: 'My father is strong',
    targetTokens: ['Ayah', 'saya', 'kuat'],
    acceptedVariants: ['ayahku kuat'],
    distractors: ['ibu', 'nenek'],
    wordHints: { my: 'saya', father: 'ayah', strong: 'kuat' },
    translationNote: 'Ayah saya kuat',
  },
  {
    vocabId: 'v_3_father',
    direction: 'id_to_en',
    speakerId: 'v_3_father',
    sourceText: 'Ayahku bekerja setiap hari',
    targetTokens: ['My', 'father', 'works', 'every', 'day'],
    distractors: ['mother', 'sister'],
    wordHints: { ayahku: 'my father', bekerja: 'works', 'setiap hari': 'every day' },
    translationNote: 'My father works every day',
  },
  {
    vocabId: 'v_3_mother',
    direction: 'en_to_id',
    speakerId: 'v_3_mother',
    sourceText: 'Thank you, Mother!',
    targetTokens: ['Terima', 'kasih,', 'Ibu!'],
    acceptedVariants: ['terima kasih mama'],
    distractors: ['Ayah', 'Paman'],
    wordHints: { thank: 'terima', you: 'kasih', mother: 'ibu' },
    translationNote: 'Terima kasih, Ibu!',
  },
  {
    vocabId: 'v_3_mother',
    direction: 'id_to_en',
    speakerId: 'v_3_mother',
    sourceText: 'Ibuku sangat ramah',
    targetTokens: ['My', 'mother', 'is', 'very', 'kind'],
    acceptedVariants: ['my mother is very friendly'],
    distractors: ['father', 'uncle'],
    wordHints: { ibuku: 'my mother', sangat: 'very', ramah: 'kind / friendly' },
    translationNote: 'My mother is very kind',
  },
  {
    vocabId: 'v_3_dad',
    direction: 'id_to_en',
    speakerId: 'v_3_dad',
    sourceText: 'Selamat pagi, Papa!',
    targetTokens: ['Good', 'morning,', 'Dad!'],
    distractors: ['Mom!', 'Grandpa!'],
    wordHints: { 'selamat pagi': 'good morning', papa: 'Dad' },
    translationNote: 'Good morning, Dad!',
  },
  {
    vocabId: 'v_3_mom',
    direction: 'id_to_en',
    speakerId: 'v_3_mom',
    sourceText: 'Mama membaca buku denganku',
    targetTokens: ['Mom', 'reads', 'a', 'book', 'with', 'me'],
    distractors: ['Dad', 'Uncle'],
    wordHints: { mama: 'Mom', membaca: 'reads', buku: 'book', denganku: 'with me' },
    translationNote: 'Mom reads a book with me',
  },
  {
    vocabId: 'v_3_wife',
    direction: 'en_to_id',
    speakerId: 'v_3_wife',
    sourceText: 'She is his wife',
    targetTokens: ['Dia', 'adalah', 'istrinya'],
    acceptedVariants: ['dia istrinya'],
    distractors: ['suaminya', 'bibinya'],
    wordHints: { she: 'dia (pr)', is: 'adalah', his: '-nya (lk)', wife: 'istri' },
    translationNote: 'Dia adalah istrinya',
  },
  {
    vocabId: 'v_3_husband',
    direction: 'en_to_id',
    speakerId: 'v_3_husband',
    sourceText: 'He is my husband',
    targetTokens: ['Dia', 'adalah', 'suami', 'saya'],
    acceptedVariants: ['dia suamiku'],
    distractors: ['istri', 'paman'],
    wordHints: { he: 'dia (lk)', is: 'adalah', my: 'saya', husband: 'suami' },
    translationNote: 'Dia adalah suami saya',
  },
  {
    vocabId: 'v_3_child',
    direction: 'en_to_id',
    speakerId: 'v_3_child',
    sourceText: 'The child plays happily',
    targetTokens: ['Anak', 'itu', 'bermain', 'dengan', 'senang'],
    acceptedVariants: ['anak bermain dengan senang'],
    distractors: ['kakek', 'nenek'],
    wordHints: { the: 'itu', child: 'anak', plays: 'bermain', happily: 'dengan senang' },
    translationNote: 'Anak itu bermain dengan senang',
  },
  {
    vocabId: 'v_3_son',
    direction: 'en_to_id',
    speakerId: 'v_3_son',
    sourceText: 'He is our son',
    targetTokens: ['Dia', 'adalah', 'anak', 'laki-laki', 'kami'],
    acceptedVariants: ['dia anak laki laki kandung kami', 'dia putra kami'],
    distractors: ['perempuan', 'cucu'],
    wordHints: { he: 'dia', our: 'kami', son: 'anak laki-laki kandung' },
    translationNote: 'Dia adalah anak laki-laki kami',
  },
  {
    vocabId: 'v_3_daughter',
    direction: 'en_to_id',
    speakerId: 'v_3_daughter',
    sourceText: 'My daughter loves reading',
    targetTokens: ['Anak', 'perempuan', 'saya', 'suka', 'membaca'],
    acceptedVariants: ['putri saya suka membaca'],
    distractors: ['laki-laki', 'paman'],
    wordHints: { my: 'saya', daughter: 'anak perempuan kandung', loves: 'suka', reading: 'membaca' },
    translationNote: 'Anak perempuan saya suka membaca',
  },
  {
    vocabId: 'v_3_sister',
    direction: 'id_to_en',
    speakerId: 'v_3_sister',
    sourceText: 'Dia saudara perempuanku',
    targetTokens: ['She', 'is', 'my', 'sister'],
    distractors: ['brother', 'aunt'],
    wordHints: { dia: 'she', 'saudara perempuanku': 'my sister' },
    translationNote: 'She is my sister',
  },
  {
    vocabId: 'v_3_brother',
    direction: 'id_to_en',
    speakerId: 'v_3_brother',
    sourceText: 'Saya punya saudara laki-laki',
    targetTokens: ['I', 'have', 'a', 'brother'],
    distractors: ['sister', 'cousin'],
    wordHints: { saya: 'I', punya: 'have', 'saudara laki-laki': 'brother' },
    translationNote: 'I have a brother',
  },
  {
    vocabId: 'v_3_family',
    direction: 'en_to_id',
    speakerId: 'v_3_family',
    sourceText: 'I love my big family',
    targetTokens: ['Saya', 'menyayangi', 'keluarga', 'besar', 'saya'],
    acceptedVariants: ['aku cinta keluarga besarku', 'saya cinta keluarga besar saya'],
    distractors: ['teman', 'sendiri'],
    wordHints: { love: 'menyayangi', big: 'besar', family: 'keluarga' },
    translationNote: 'Saya menyayangi keluarga besar saya',
  },
  {
    vocabId: 'v_3_grandmother',
    direction: 'en_to_id',
    speakerId: 'v_3_grandmother',
    sourceText: 'Grandmother makes sweet cookies',
    targetTokens: ['Nenek', 'membuat', 'kue', 'manis'],
    acceptedVariants: ['nenek membuat kue yang manis'],
    distractors: ['Kakek', 'Bibi'],
    wordHints: { grandmother: 'nenek', makes: 'membuat', sweet: 'manis', cookies: 'kue' },
    translationNote: 'Nenek membuat kue manis',
  },
  {
    vocabId: 'v_3_grandfather',
    direction: 'id_to_en',
    speakerId: 'v_3_grandfather',
    sourceText: 'Kakek berjalan dengan tongkat',
    targetTokens: ['Grandfather', 'walks', 'with', 'a', 'cane'],
    distractors: ['Grandmother', 'Uncle'],
    wordHints: { kakek: 'grandfather', berjalan: 'walks', tongkat: 'cane' },
    translationNote: 'Grandfather walks with a cane',
  },
  {
    vocabId: 'v_3_grandchild',
    direction: 'en_to_id',
    speakerId: 'v_3_grandchild',
    sourceText: 'The grandfather hugs his grandchild',
    targetTokens: ['Kakek', 'memeluk', 'cucunya'],
    acceptedVariants: ['kakek itu memeluk cucunya'],
    distractors: ['sepupunya', 'keponakannya'],
    wordHints: { grandfather: 'kakek', hugs: 'memeluk', grandchild: 'cucu' },
    translationNote: 'Kakek memeluk cucunya',
  },
  {
    vocabId: 'v_3_aunt',
    direction: 'en_to_id',
    speakerId: 'v_3_aunt',
    sourceText: 'My aunt brings a gift',
    targetTokens: ['Bibi', 'saya', 'membawa', 'hadiah'],
    acceptedVariants: ['tante saya membawa hadiah', 'bibiku membawa sebuah hadiah'],
    distractors: ['Paman', 'Sepupu'],
    wordHints: { aunt: 'bibi / tante', brings: 'membawa', gift: 'hadiah' },
    translationNote: 'Bibi saya membawa hadiah',
  },
  {
    vocabId: 'v_3_uncle',
    direction: 'id_to_en',
    speakerId: 'v_3_uncle',
    sourceText: 'Paman saya sangat lucu',
    targetTokens: ['My', 'uncle', 'is', 'very', 'funny'],
    distractors: ['aunt', 'nephew'],
    wordHints: { paman: 'uncle', sangat: 'very', lucu: 'funny' },
    translationNote: 'My uncle is very funny',
  },
  {
    vocabId: 'v_3_niece',
    direction: 'en_to_id',
    speakerId: 'v_3_niece',
    sourceText: 'She is my niece',
    targetTokens: ['Dia', 'adalah', 'keponakan', 'perempuan', 'saya'],
    acceptedVariants: ['dia keponakan perempuanku'],
    distractors: ['laki-laki', 'sepupu'],
    wordHints: { she: 'dia (pr)', my: 'saya', niece: 'keponakan perempuan' },
    translationNote: 'Dia adalah keponakan perempuan saya',
  },
  {
    vocabId: 'v_3_nephew',
    direction: 'en_to_id',
    speakerId: 'v_3_nephew',
    sourceText: 'He is my nephew',
    targetTokens: ['Dia', 'adalah', 'keponakan', 'laki-laki', 'saya'],
    acceptedVariants: ['dia keponakan laki-lakiku'],
    distractors: ['perempuan', 'cucu'],
    wordHints: { he: 'dia (lk)', my: 'saya', nephew: 'keponakan laki-laki' },
    translationNote: 'Dia adalah keponakan laki-laki saya',
  },
  {
    vocabId: 'v_3_cousin',
    direction: 'id_to_en',
    speakerId: 'v_3_cousin',
    sourceText: 'Sepupu saya tinggal di dekat sini',
    targetTokens: ['My', 'cousin', 'lives', 'near', 'here'],
    distractors: ['brother', 'grandchild'],
    wordHints: { sepupu: 'cousin', tinggal: 'lives', 'dekat sini': 'near here' },
    translationNote: 'My cousin lives near here',
  },
];

// ============================================================================
// 2. SPEAK CHALLENGES (PEOPLE + FAMILY — UCAPKAN KALIMAT INI)
// ============================================================================
interface SpeakSeed {
  vocabId: DesaVocabId;
  speakerId: DesaVocabId;
  sentence: string;
  wordHints: Record<string, string>;
  translationNote: string;
}

const SPEAK_SEEDS: SpeakSeed[] = [
  // ---- PEOPLE ----
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

  // ---- FAMILY ----
  {
    vocabId: 'v_3_parent',
    speakerId: 'v_3_parent',
    sentence: 'I love my parents.',
    wordHints: { love: 'menyayangi', parents: 'orang tua' },
    translationNote: 'Saya menyayangi orang tua saya.',
  },
  {
    vocabId: 'v_3_father',
    speakerId: 'v_3_father',
    sentence: 'My father is very kind.',
    wordHints: { father: 'ayah', very: 'sangat', kind: 'baik' },
    translationNote: 'Ayah saya sangat baik.',
  },
  {
    vocabId: 'v_3_mother',
    speakerId: 'v_3_mother',
    sentence: 'My mother is at home.',
    wordHints: { mother: 'ibu', home: 'rumah' },
    translationNote: 'Ibu saya ada di rumah.',
  },
  {
    vocabId: 'v_3_dad',
    speakerId: 'v_3_dad',
    sentence: 'Let us play, Dad!',
    wordHints: { play: 'bermain', dad: 'papa / ayah' },
    translationNote: 'Ayo kita bermain, Papa!',
  },
  {
    vocabId: 'v_3_mom',
    speakerId: 'v_3_mom',
    sentence: 'Good morning, Mom!',
    wordHints: { good: 'selamat', morning: 'pagi', mom: 'mama / ibu' },
    translationNote: 'Selamat pagi, Mama!',
  },
  {
    vocabId: 'v_3_wife',
    speakerId: 'v_3_wife',
    sentence: 'She is my lovely wife.',
    wordHints: { lovely: 'tercinta', wife: 'istri' },
    translationNote: 'Dia adalah istri tercinta saya.',
  },
  {
    vocabId: 'v_3_husband',
    speakerId: 'v_3_husband',
    sentence: 'He is a good husband.',
    wordHints: { good: 'baik', husband: 'suami' },
    translationNote: 'Dia adalah suami yang baik.',
  },
  {
    vocabId: 'v_3_child',
    speakerId: 'v_3_child',
    sentence: 'The child has a toy.',
    wordHints: { child: 'anak', has: 'memiliki', toy: 'mainan' },
    translationNote: 'Anak itu memiliki sebuah mainan.',
  },
  {
    vocabId: 'v_3_son',
    speakerId: 'v_3_son',
    sentence: 'He is my little son.',
    wordHints: { little: 'kecil', son: 'anak laki-laki kandung' },
    translationNote: 'Dia adalah anak laki-laki kecil saya.',
  },
  {
    vocabId: 'v_3_daughter',
    speakerId: 'v_3_daughter',
    sentence: 'She is my sweet daughter.',
    wordHints: { sweet: 'manis', daughter: 'anak perempuan kandung' },
    translationNote: 'Dia adalah anak perempuan manis saya.',
  },
  {
    vocabId: 'v_3_sister',
    speakerId: 'v_3_sister',
    sentence: 'My sister is very smart.',
    wordHints: { sister: 'saudara perempuan', smart: 'pintar' },
    translationNote: 'Saudara perempuan saya sangat pintar.',
  },
  {
    vocabId: 'v_3_brother',
    speakerId: 'v_3_brother',
    sentence: 'My brother is my best friend.',
    wordHints: { brother: 'saudara laki-laki', best: 'terbaik', friend: 'teman' },
    translationNote: 'Saudara laki-laki saya adalah teman terbaik saya.',
  },
  {
    vocabId: 'v_3_family',
    speakerId: 'v_3_family',
    sentence: 'We are one happy family.',
    wordHints: { happy: 'bahagia', family: 'keluarga' },
    translationNote: 'Kami adalah satu keluarga yang bahagia.',
  },
  {
    vocabId: 'v_3_grandmother',
    speakerId: 'v_3_grandmother',
    sentence: 'My grandmother is smiling.',
    wordHints: { grandmother: 'nenek', smiling: 'tersenyum' },
    translationNote: 'Nenek saya sedang tersenyum.',
  },
  {
    vocabId: 'v_3_grandfather',
    speakerId: 'v_3_grandfather',
    sentence: 'My grandfather tells a story.',
    wordHints: { grandfather: 'kakek', tells: 'menceritakan', story: 'cerita' },
    translationNote: 'Kakek saya bercerita.',
  },
  {
    vocabId: 'v_3_grandchild',
    speakerId: 'v_3_grandchild',
    sentence: 'I love my cute grandchild.',
    wordHints: { cute: 'lucu', grandchild: 'cucu' },
    translationNote: 'Saya menyayangi cucu lucu saya.',
  },
  {
    vocabId: 'v_3_aunt',
    speakerId: 'v_3_aunt',
    sentence: 'My aunt is very cool.',
    wordHints: { aunt: 'bibi / tante', cool: 'keren' },
    translationNote: 'Bibi saya sangat keren.',
  },
  {
    vocabId: 'v_3_uncle',
    speakerId: 'v_3_uncle',
    sentence: 'My uncle gives me ice cream.',
    wordHints: { uncle: 'paman / om', gives: 'memberi' },
    translationNote: 'Paman saya memberi saya es krim.',
  },
  {
    vocabId: 'v_3_niece',
    speakerId: 'v_3_niece',
    sentence: 'Lina is my dear niece.',
    wordHints: { dear: 'tersayang', niece: 'keponakan perempuan' },
    translationNote: 'Lina adalah keponakan perempuan tersayang saya.',
  },
  {
    vocabId: 'v_3_nephew',
    speakerId: 'v_3_nephew',
    sentence: 'Bimo is my young nephew.',
    wordHints: { young: 'muda', nephew: 'keponakan laki-laki' },
    translationNote: 'Bimo adalah keponakan laki-laki saya.',
  },
  {
    vocabId: 'v_3_cousin',
    speakerId: 'v_3_cousin',
    sentence: 'Hello, my dear cousin!',
    wordHints: { hello: 'halo', cousin: 'sepupu' },
    translationNote: 'Halo, sepupu tersayangku!',
  },
];

// ============================================================================
// 3. DIALOGUE COMPLETE CHALLENGES (LENGKAPI KALIMATNYA)
// ============================================================================
interface DialogueSeed {
  vocabId: DesaVocabId;
  speakerAId: DesaVocabId;
  speakerAName: string;
  speakerALine: string;
  speakerAHints: Record<string, string>;
  speakerBId: DesaVocabId;
  speakerBName: string;
  correctReply: string;
  distractorReplies: string[];
  translationNote: string;
}

const DIALOGUE_SEEDS: DialogueSeed[] = [
  // ---- PEOPLE ----
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

  // ---- FAMILY ----
  {
    vocabId: 'v_3_father',
    speakerAId: 'v_3_son',
    speakerAName: 'Dimas',
    speakerALine: 'Who is carrying you on his shoulders?',
    speakerAHints: { who: 'siapa', carrying: 'menggendong', shoulders: 'bahu' },
    speakerBId: 'v_3_father',
    speakerBName: 'Rafi',
    correctReply: 'That is my father!',
    distractorReplies: ['That is my grandmother!', 'Good night, aunt!'],
    translationNote: 'Itu adalah ayah saya!',
  },
  {
    vocabId: 'v_3_mother',
    speakerAId: 'v_3_daughter',
    speakerAName: 'Putri',
    speakerALine: 'Who always hugs you before school?',
    speakerAHints: { who: 'siapa', always: 'selalu', hugs: 'memeluk' },
    speakerBId: 'v_3_mother',
    speakerBName: 'Siti',
    correctReply: 'My mother hugs me every morning.',
    distractorReplies: ['My grandfather is sleeping.', 'Goodbye, husband!'],
    translationNote: 'Ibu saya memeluk saya setiap pagi.',
  },
  {
    vocabId: 'v_3_dad',
    speakerAId: 'v_3_dad',
    speakerAName: 'Dad',
    speakerALine: 'Ready to kick the soccer ball?',
    speakerAHints: { ready: 'siap', kick: 'menendang', ball: 'bola' },
    speakerBId: 'v_3_son',
    speakerBName: 'Bimo',
    correctReply: 'Yes! Pass it to me, Dad!',
    distractorReplies: ['Good night, Mom!', 'She is my niece.'],
    translationNote: 'Ya! Oper ke aku, Papa!',
  },
  {
    vocabId: 'v_3_mom',
    speakerAId: 'v_3_daughter',
    speakerAName: 'Nisa',
    speakerALine: 'Can we read this storybook together?',
    speakerAHints: { read: 'membaca', storybook: 'buku cerita', together: 'bersama' },
    speakerBId: 'v_3_mom',
    speakerBName: 'Mom',
    correctReply: 'Sure, sit beside Mom!',
    distractorReplies: ['No, uncle is a baby.', 'Thank you, Dad!'],
    translationNote: 'Tentu, duduk di sebelah Mama!',
  },
  {
    vocabId: 'v_3_wife',
    speakerAId: 'v_3_husband',
    speakerAName: 'Hendra',
    speakerALine: 'Look at the ring on her finger!',
    speakerAHints: { look: 'lihat', ring: 'cincin', finger: 'jari' },
    speakerBId: 'v_3_wife',
    speakerBName: 'Dewi',
    correctReply: 'Yes, I am his happy wife!',
    distractorReplies: ['Yes, I am his uncle!', 'Goodbye, children!'],
    translationNote: 'Ya, saya adalah istrinya yang bahagia!',
  },
  {
    vocabId: 'v_3_husband',
    speakerAId: 'v_3_wife',
    speakerAName: 'Dewi',
    speakerALine: 'Who is wearing the gray vest?',
    speakerAHints: { who: 'siapa', wearing: 'memakai', vest: 'rompi' },
    speakerBId: 'v_3_husband',
    speakerBName: 'Hendra',
    correctReply: 'He is my new husband!',
    distractorReplies: ['He is my little sister!', 'Sorry, grandmother.'],
    translationNote: 'Dia adalah suami baru saya!',
  },
  {
    vocabId: 'v_3_grandmother',
    speakerAId: 'v_3_grandchild',
    speakerAName: 'Fajar',
    speakerALine: 'Mmm! Who baked these warm cookies?',
    speakerAHints: { who: 'siapa', baked: 'memanggang', cookies: 'kue' },
    speakerBId: 'v_3_grandmother',
    speakerBName: 'Nenek',
    correctReply: 'Grandmother baked them for you!',
    distractorReplies: ['The baby baked them!', 'She is my nephew.'],
    translationNote: 'Nenek memanggangnya untukmu!',
  },
  {
    vocabId: 'v_3_grandfather',
    speakerAId: 'v_1_boy',
    speakerAName: 'Riko',
    speakerALine: 'Who is the wise elder with glasses?',
    speakerAHints: { wise: 'bijaksana', elder: 'sesepuh', glasses: 'kacamata' },
    speakerBId: 'v_3_grandfather',
    speakerBName: 'Dina',
    correctReply: 'That is my grandfather.',
    distractorReplies: ['That is my daughter.', 'Yes, she is my aunt.'],
    translationNote: 'Itu adalah kakek saya.',
  },
  {
    vocabId: 'v_3_aunt',
    speakerAId: 'v_3_aunt',
    speakerAName: 'Tante Maya',
    speakerALine: 'Surprise! I brought a gift for you!',
    speakerAHints: { surprise: 'kejutan', brought: 'membawa', gift: 'hadiah' },
    speakerBId: 'v_3_nephew',
    speakerBName: 'Bagas',
    correctReply: 'Thank you so much, Aunt Maya!',
    distractorReplies: ['Thank you, Grandfather!', 'Good night, wife!'],
    translationNote: 'Terima kasih banyak, Bibi Maya!',
  },
  {
    vocabId: 'v_3_uncle',
    speakerAId: 'v_3_uncle',
    speakerAName: 'Om Rudi',
    speakerALine: 'Do you want some strawberry ice cream?',
    speakerAHints: { want: 'ingin', ice: 'es', cream: 'krim' },
    speakerBId: 'v_3_child',
    speakerBName: 'Tono',
    correctReply: 'Yes, please, Uncle Rudi!',
    distractorReplies: ['No, Mom is a cousin!', 'Hello, sister!'],
    translationNote: 'Ya, tolong, Paman Rudi!',
  },
  {
    vocabId: 'v_3_sister',
    speakerAId: 'v_3_sister',
    speakerAName: 'Alya',
    speakerALine: 'Hold my hand when we walk!',
    speakerAHints: { hold: 'pegang', hand: 'tangan', walk: 'berjalan' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Nadia',
    correctReply: 'Okay, big sister!',
    distractorReplies: ['Okay, grandfather!', 'Yes, I am your husband.'],
    translationNote: 'Baik, kakak perempuan!',
  },
  {
    vocabId: 'v_3_brother',
    speakerAId: 'v_3_brother',
    speakerAName: 'Ilham',
    speakerALine: 'Great teamwork today, little buddy!',
    speakerAHints: { teamwork: 'kerja sama', little: 'kecil' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Rama',
    correctReply: 'Fist bump, big brother!',
    distractorReplies: ['Fist bump, grandmother!', 'See you, daughter!'],
    translationNote: 'Tos, kakak laki-laki!',
  },
  {
    vocabId: 'v_3_cousin',
    speakerAId: 'v_3_cousin',
    speakerAName: 'Salsa',
    speakerALine: 'Hey! Wave from your window!',
    speakerAHints: { wave: 'melambai', window: 'jendela' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Damar',
    correctReply: 'Hi, cousin! Nice to see you!',
    distractorReplies: ['Hi, wife! Good night!', 'One hundred parents!'],
    translationNote: 'Hai, sepupu! Senang melihatmu!',
  },
];

// ============================================================================
// 4. LISTEN WORD BANK CHALLENGES (PILIH YANG KAMU DENGAR)
// ============================================================================
interface ListenSeed {
  vocabId: DesaVocabId;
  sentence: string;
  tokens: string[];
  distractors: string[];
  translationNote: string;
}

const LISTEN_SEEDS: ListenSeed[] = [
  // ---- PEOPLE ----
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

  // ---- FAMILY ----
  {
    vocabId: 'v_3_parent',
    sentence: 'Love your parents.',
    tokens: ['Love', 'your', 'parents.'],
    distractors: ['cousin', 'baby'],
    translationNote: 'Sayangi orang tuamu.',
  },
  {
    vocabId: 'v_3_father',
    sentence: 'My father is strong.',
    tokens: ['My', 'father', 'is', 'strong.'],
    distractors: ['mother', 'sister'],
    translationNote: 'Ayah saya kuat.',
  },
  {
    vocabId: 'v_3_mother',
    sentence: 'Thank you, Mother!',
    tokens: ['Thank', 'you,', 'Mother!'],
    distractors: ['Father!', 'Uncle!'],
    translationNote: 'Terima kasih, Ibu!',
  },
  {
    vocabId: 'v_3_dad',
    sentence: 'Play with me, Dad!',
    tokens: ['Play', 'with', 'me,', 'Dad!'],
    distractors: ['Mom!', 'Aunt!'],
    translationNote: 'Bermainlah denganku, Papa!',
  },
  {
    vocabId: 'v_3_mom',
    sentence: 'I love you, Mom!',
    tokens: ['I', 'love', 'you,', 'Mom!'],
    distractors: ['Dad!', 'Nephew!'],
    translationNote: 'Aku sayang kamu, Mama!',
  },
  {
    vocabId: 'v_3_wife',
    sentence: 'She is his wife.',
    tokens: ['She', 'is', 'his', 'wife.'],
    distractors: ['husband', 'aunt'],
    translationNote: 'Dia adalah istrinya.',
  },
  {
    vocabId: 'v_3_husband',
    sentence: 'He is my husband.',
    tokens: ['He', 'is', 'my', 'husband.'],
    distractors: ['wife', 'brother'],
    translationNote: 'Dia adalah suami saya.',
  },
  {
    vocabId: 'v_3_child',
    sentence: 'One happy child.',
    tokens: ['One', 'happy', 'child.'],
    distractors: ['parent', 'uncle'],
    translationNote: 'Satu anak yang bahagia.',
  },
  {
    vocabId: 'v_3_son',
    sentence: 'That is my son.',
    tokens: ['That', 'is', 'my', 'son.'],
    distractors: ['daughter', 'mother'],
    translationNote: 'Itu adalah anak laki-laki saya.',
  },
  {
    vocabId: 'v_3_daughter',
    sentence: 'That is my daughter.',
    tokens: ['That', 'is', 'my', 'daughter.'],
    distractors: ['son', 'father'],
    translationNote: 'Itu adalah anak perempuan saya.',
  },
  {
    vocabId: 'v_3_sister',
    sentence: 'My sister smiles.',
    tokens: ['My', 'sister', 'smiles.'],
    distractors: ['brother', 'uncle'],
    translationNote: 'Saudara perempuan saya tersenyum.',
  },
  {
    vocabId: 'v_3_brother',
    sentence: 'My brother is cool.',
    tokens: ['My', 'brother', 'is', 'cool.'],
    distractors: ['sister', 'grandmother'],
    translationNote: 'Saudara laki-laki saya keren.',
  },
  {
    vocabId: 'v_3_family',
    sentence: 'My big happy family.',
    tokens: ['My', 'big', 'happy', 'family.'],
    distractors: ['friend', 'baby'],
    translationNote: 'Keluarga besar saya yang bahagia.',
  },
  {
    vocabId: 'v_3_grandmother',
    sentence: 'Kind old grandmother.',
    tokens: ['Kind', 'old', 'grandmother.'],
    distractors: ['grandfather', 'child'],
    translationNote: 'Nenek tua yang baik hati.',
  },
  {
    vocabId: 'v_3_grandfather',
    sentence: 'Hello, Grandfather!',
    tokens: ['Hello,', 'Grandfather!'],
    distractors: ['Grandmother!', 'Cousin!'],
    translationNote: 'Halo, Kakek!',
  },
  {
    vocabId: 'v_3_grandchild',
    sentence: 'The cute grandchild.',
    tokens: ['The', 'cute', 'grandchild.'],
    distractors: ['husband', 'aunt'],
    translationNote: 'Cucu yang lucu.',
  },
  {
    vocabId: 'v_3_aunt',
    sentence: 'Welcome, Aunt Maya!',
    tokens: ['Welcome,', 'Aunt', 'Maya!'],
    distractors: ['Uncle', 'Son'],
    translationNote: 'Selamat datang, Bibi Maya!',
  },
  {
    vocabId: 'v_3_uncle',
    sentence: 'My funny uncle.',
    tokens: ['My', 'funny', 'uncle.'],
    distractors: ['aunt', 'niece'],
    translationNote: 'Paman saya yang lucu.',
  },
  {
    vocabId: 'v_3_niece',
    sentence: 'She is my niece.',
    tokens: ['She', 'is', 'my', 'niece.'],
    distractors: ['nephew', 'wife'],
    translationNote: 'Dia adalah keponakan perempuan saya.',
  },
  {
    vocabId: 'v_3_nephew',
    sentence: 'He is my nephew.',
    tokens: ['He', 'is', 'my', 'nephew.'],
    distractors: ['niece', 'dad'],
    translationNote: 'Dia adalah keponakan laki-laki saya.',
  },
  {
    vocabId: 'v_3_cousin',
    sentence: 'Wave to my cousin!',
    tokens: ['Wave', 'to', 'my', 'cousin!'],
    distractors: ['parent', 'wife'],
    translationNote: 'Lambaikan tangan ke sepupu saya!',
  },
];

// ============================================================================
// BUILDERS FOR EACH OF THE 6 CHALLENGE TYPES
// ============================================================================

export function buildPeoplePictureChoice(targetId?: DesaVocabId): DuolingoChallenge {
  const target = targetId ?? pickRandom(DESA_ILLUSTRATED_VOCAB_IDS);
  const entry = VOCAB_BY_ID[target]!;
  const targetImg = VOCAB_IMAGE_BY_ID[target];
  const tag = getCategoryTag(target);

  // Prefer same-category distractors first, ensuring distinct images so cards are unambiguous
  const sameCatPool = target.startsWith('v_3_') ? FAMILY_VOCAB_IDS : PEOPLE_VOCAB_IDS;
  const distinctSameCat = shuffle(
    sameCatPool.filter((id) => id !== target && VOCAB_IMAGE_BY_ID[id] !== targetImg),
  );
  const distinctAll = shuffle(
    DESA_ILLUSTRATED_VOCAB_IDS.filter(
      (id) => id !== target && VOCAB_IMAGE_BY_ID[id] !== targetImg,
    ),
  );

  const chosenOthers: string[] = [];
  const usedImgs = new Set<string>([targetImg]);
  for (const id of [...distinctSameCat, ...distinctAll]) {
    if (chosenOthers.length >= 2) break;
    const img = VOCAB_IMAGE_BY_ID[id];
    if (!usedImgs.has(img)) {
      usedImgs.add(img);
      chosenOthers.push(id);
    }
  }

  const optionIds = shuffle([target, ...chosenOthers]);
  const correctIndex = optionIds.indexOf(target);

  return {
    type: 'picture_choice',
    id: `pic_${target}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    vocabId: target,
    kicker: `KOSAKATA BARU · ${tag.upper}`,
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

export function buildPeopleWordBankTranslate(targetId?: DesaVocabId): DuolingoChallenge {
  const candidates = targetId
    ? WORD_BANK_SEEDS.filter((s) => s.vocabId === targetId)
    : WORD_BANK_SEEDS;
  const seed = pickRandom(candidates.length > 0 ? candidates : WORD_BANK_SEEDS);
  const speakerEntry = VOCAB_BY_ID[seed.speakerId];
  const tag = getCategoryTag(seed.vocabId);

  return {
    type: 'word_bank_translate',
    id: `wb_${seed.vocabId}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    vocabId: seed.vocabId,
    kicker: `SUSUN KATA · ${tag.upper}`,
    promptTitle:
      seed.direction === 'en_to_id'
        ? 'Tuliskan dalam bahasa Indonesia'
        : 'Tuliskan dalam bahasa Inggris',
    categoryLabel: tag.title,
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

export function buildPeopleSpeak(targetId?: DesaVocabId): DuolingoChallenge {
  const candidates = targetId ? SPEAK_SEEDS.filter((s) => s.vocabId === targetId) : SPEAK_SEEDS;
  const seed = pickRandom(candidates.length > 0 ? candidates : SPEAK_SEEDS);
  const speakerEntry = VOCAB_BY_ID[seed.speakerId];
  const tag = getCategoryTag(seed.vocabId);

  return {
    type: 'speak',
    id: `spk_${seed.vocabId}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    vocabId: seed.vocabId,
    kicker: `UCAPKAN · ${tag.upper}`,
    promptTitle: 'Ucapkan kalimat ini',
    speakerImage: VOCAB_IMAGE_BY_ID[seed.speakerId],
    speakerName: speakerEntry?.word ?? 'Warga Desa',
    targetSentence: seed.sentence,
    wordHints: seed.wordHints,
    translationNote: seed.translationNote,
  };
}

export function buildPeopleDialogueComplete(targetId?: DesaVocabId): DuolingoChallenge {
  const candidates = targetId
    ? DIALOGUE_SEEDS.filter((s) => s.vocabId === targetId)
    : DIALOGUE_SEEDS;
  const sameCategoryFallback =
    targetId && targetId.startsWith('v_3_')
      ? DIALOGUE_SEEDS.filter((s) => s.vocabId.startsWith('v_3_'))
      : targetId
      ? DIALOGUE_SEEDS.filter((s) => s.vocabId.startsWith('v_1_'))
      : DIALOGUE_SEEDS;
  const seed = pickRandom(
    candidates.length > 0
      ? candidates
      : sameCategoryFallback.length > 0
      ? sameCategoryFallback
      : DIALOGUE_SEEDS,
  );
  const rawChoices = [seed.correctReply, ...seed.distractorReplies.slice(0, 2)];
  const indexed = shuffle(rawChoices.map((c, idx) => ({ text: c, ok: idx === 0 })));
  const correctIndex = indexed.findIndex((i) => i.ok);
  const tag = getCategoryTag(seed.vocabId);

  return {
    type: 'dialogue_complete',
    id: `dlg_${seed.vocabId}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    vocabId: seed.vocabId,
    kicker: `PERCAKAPAN · ${tag.upper}`,
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

export function buildPeopleListenWordBank(targetId?: DesaVocabId): DuolingoChallenge {
  const candidates = targetId ? LISTEN_SEEDS.filter((s) => s.vocabId === targetId) : LISTEN_SEEDS;
  const seed = pickRandom(candidates.length > 0 ? candidates : LISTEN_SEEDS);
  const tag = getCategoryTag(seed.vocabId);

  return {
    type: 'listen_word_bank',
    id: `lst_${seed.vocabId}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    vocabId: seed.vocabId,
    kicker: `DENGARKAN · ${tag.upper}`,
    promptTitle: 'Pilih yang kamu dengar',
    audioSentence: seed.sentence,
    targetTokens: seed.tokens,
    distractorTokens: seed.distractors,
    translationNote: seed.translationNote,
  };
}

export function buildPeopleMatchPairs(preferredId?: DesaVocabId): DuolingoChallenge {
  const target = preferredId ?? pickRandom(DESA_ILLUSTRATED_VOCAB_IDS);
  const samePool = target.startsWith('v_3_') ? FAMILY_VOCAB_IDS : PEOPLE_VOCAB_IDS;
  const rest = shuffle(samePool.filter((id) => id !== target));
  const picked = [target, ...rest.slice(0, 4)];
  const primaryId = picked[0];
  const tag = getCategoryTag(primaryId);

  return {
    type: 'match_pairs',
    id: `mat_${primaryId}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    vocabId: primaryId,
    kicker: `PASANGKAN · ${tag.upper}`,
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
  targetVocabId?: DesaVocabId,
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
): DesaVocabId {
  const pool = DESA_ILLUSTRATED_VOCAB_IDS.filter((id) => id !== excludeVocabId);
  const scored = (pool.length > 0 ? pool : DESA_ILLUSTRATED_VOCAB_IDS).map((id) => ({
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
 * Builds a balanced deck of N Desa Sapaan (People + Family) Duolingo challenges
 * ensuring all 6 challenge types appear randomly in the session
 * (no two consecutive challenges of the same type).
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
  const vocabCycle = shuffle(DESA_ILLUSTRATED_VOCAB_IDS);

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

    const vocabId: DesaVocabId =
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
  lets: 'let us',
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
