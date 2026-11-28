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

export const BODY_VOCAB_IDS = [
  'v_6_body',
  'v_6_hand',
  'v_6_arm',
  'v_6_foot',
  'v_6_head',
  'v_6_leg',
  'v_6_knee',
  'v_6_back',
  'v_6_stomach',
] as const;

export const HEAD_FACE_VOCAB_IDS = [
  'v_7_hair',
  'v_7_neck',
  'v_7_face',
  'v_7_eye',
  'v_7_nose',
  'v_7_ear',
  'v_7_cheek',
  'v_7_chin',
  'v_7_mouth',
  'v_7_tooth',
  'v_7_lip',
] as const;

export const PERSONAL_INFO_VOCAB_IDS = [
  'v_5_name',
  'v_5_last_name',
  'v_5_age',
  'v_5_address',
  'v_5_birthday',
  'v_5_birthdate',
  'v_5_single',
  'v_5_married',
  'v_5_passport',
  'v_5_phone_number',
  'v_5_question',
  'v_5_answer',
] as const;

export const GREETINGS_VOCAB_IDS = [
  'v_0_hello',
  'v_0_goodbye',
  'v_0_hi',
  'v_0_bye',
  'v_0_good_morning',
  'v_0_good_afternoon',
  'v_0_good_evening',
  'v_0_good_night',
  'v_0_thank_you',
  'v_0_thanks',
  'v_0_please',
  'v_0_ok',
  'v_0_yes',
  'v_0_no',
  'v_0_sorry',
  'v_0_welcome',
] as const;

export const NUMBERS_VOCAB_IDS = [
  'v_2_zero',
  'v_2_one',
  'v_2_two',
  'v_2_three',
  'v_2_four',
  'v_2_five',
  'v_2_six',
  'v_2_seven',
  'v_2_eight',
  'v_2_nine',
  'v_2_ten',
  'v_2_eleven',
  'v_2_twelve',
  'v_2_thirteen',
  'v_2_fourteen',
  'v_2_fifteen',
  'v_2_sixteen',
  'v_2_seventeen',
  'v_2_eighteen',
  'v_2_nineteen',
  'v_2_twenty',
  'v_2_thirty',
  'v_2_forty',
  'v_2_fifty',
  'v_2_sixty',
  'v_2_seventy',
  'v_2_eighty',
  'v_2_ninety',
  'v_2_hundred',
] as const;

export const COLORS_VOCAB_IDS = [
  'v_4_black',
  'v_4_white',
  'v_4_blue',
  'v_4_green',
  'v_4_yellow',
  'v_4_red',
  'v_4_pink',
  'v_4_orange',
  'v_4_purple',
  'v_4_gray',
  'v_4_brown',
  'v_4_dark',
  'v_4_light',
  'v_4_color',
] as const;

export const DESA_ALL_VOCAB_IDS = [
  ...GREETINGS_VOCAB_IDS,
  ...PEOPLE_VOCAB_IDS,
  ...NUMBERS_VOCAB_IDS,
  ...FAMILY_VOCAB_IDS,
  ...COLORS_VOCAB_IDS,
  ...PERSONAL_INFO_VOCAB_IDS,
  ...BODY_VOCAB_IDS,
  ...HEAD_FACE_VOCAB_IDS,
] as const;

export const DESA_ILLUSTRATED_VOCAB_IDS = DESA_ALL_VOCAB_IDS;

export type GreetingsVocabId = (typeof GREETINGS_VOCAB_IDS)[number];
export type PeopleVocabId = (typeof PEOPLE_VOCAB_IDS)[number];
export type NumbersVocabId = (typeof NUMBERS_VOCAB_IDS)[number];
export type FamilyVocabId = (typeof FAMILY_VOCAB_IDS)[number];
export type ColorsVocabId = (typeof COLORS_VOCAB_IDS)[number];
export type PersonalInfoVocabId = (typeof PERSONAL_INFO_VOCAB_IDS)[number];
export type BodyVocabId = (typeof BODY_VOCAB_IDS)[number];
export type HeadFaceVocabId = (typeof HEAD_FACE_VOCAB_IDS)[number];
export type DesaVocabId = (typeof DESA_ALL_VOCAB_IDS)[number];

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

  // The Body (9)
  v_6_body: './assets/vocab/body/body.png',
  v_6_hand: './assets/vocab/body/hand.png',
  v_6_arm: './assets/vocab/body/arm.png',
  v_6_foot: './assets/vocab/body/foot.png',
  v_6_head: './assets/vocab/body/head.png',
  v_6_leg: './assets/vocab/body/leg.png',
  v_6_knee: './assets/vocab/body/knee.png',
  v_6_back: './assets/vocab/body/back.png',
  v_6_stomach: './assets/vocab/body/stomach.png',

  // The Head and Face (11)
  v_7_hair: './assets/vocab/head_face/hair.png',
  v_7_neck: './assets/vocab/head_face/neck.png',
  v_7_face: './assets/vocab/head_face/face.png',
  v_7_eye: './assets/vocab/head_face/eye.png',
  v_7_nose: './assets/vocab/head_face/nose.png',
  v_7_ear: './assets/vocab/head_face/ear.png',
  v_7_cheek: './assets/vocab/head_face/cheek.png',
  v_7_chin: './assets/vocab/head_face/chin.png',
  v_7_mouth: './assets/vocab/head_face/mouth.png',
  v_7_tooth: './assets/vocab/head_face/tooth.png',
  v_7_lip: './assets/vocab/head_face/lip.png',

  // Personal Information (6)
  v_5_name: './assets/vocab/personal_info/name.png',
  v_5_address: './assets/vocab/personal_info/address.png',
  v_5_birthday: './assets/vocab/personal_info/birthday.png',
  v_5_married: './assets/vocab/personal_info/married.png',
  v_5_passport: './assets/vocab/personal_info/passport.png',
  v_5_phone_number: './assets/vocab/personal_info/phone_number.png',

  // Hello and Goodbye (8)
  v_0_hello: './assets/vocab/greetings/hello.png',
  v_0_goodbye: './assets/vocab/greetings/goodbye.png',
  v_0_good_morning: './assets/vocab/greetings/good_morning.png',
  v_0_good_afternoon: './assets/vocab/greetings/good_afternoon.png',
  v_0_good_evening: './assets/vocab/greetings/good_evening.png',
  v_0_good_night: './assets/vocab/greetings/good_night.png',
  v_0_thank_you: './assets/vocab/greetings/thank_you.png',
  v_0_welcome: './assets/vocab/greetings/welcome.png',
};

export type VocabVisualSpec =
  | { kind: 'color'; hex: string; borderHex?: string; pattern?: 'dark' | 'light' | 'rainbow' }
  | { kind: 'numeral'; text: string }
  | { kind: 'emblem'; emoji: string; gradient: string };

export const VOCAB_VISUAL_BY_ID: Record<string, VocabVisualSpec> = {
  // Greetings emblems (8)
  v_0_hi: { kind: 'emblem', emoji: '👋', gradient: 'from-amber-200 to-orange-300' },
  v_0_bye: { kind: 'emblem', emoji: '🚶', gradient: 'from-sky-200 to-indigo-300' },
  v_0_thanks: { kind: 'emblem', emoji: '💐', gradient: 'from-rose-200 to-pink-300' },
  v_0_please: { kind: 'emblem', emoji: '🙏', gradient: 'from-teal-200 to-emerald-300' },
  v_0_ok: { kind: 'emblem', emoji: '👌', gradient: 'from-lime-200 to-green-300' },
  v_0_yes: { kind: 'emblem', emoji: '✅', gradient: 'from-emerald-200 to-teal-300' },
  v_0_no: { kind: 'emblem', emoji: '❌', gradient: 'from-rose-200 to-red-300' },
  v_0_sorry: { kind: 'emblem', emoji: '🙇', gradient: 'from-violet-200 to-purple-300' },

  // Numbers 0..100 (29)
  v_2_zero: { kind: 'numeral', text: '0' },
  v_2_one: { kind: 'numeral', text: '1' },
  v_2_two: { kind: 'numeral', text: '2' },
  v_2_three: { kind: 'numeral', text: '3' },
  v_2_four: { kind: 'numeral', text: '4' },
  v_2_five: { kind: 'numeral', text: '5' },
  v_2_six: { kind: 'numeral', text: '6' },
  v_2_seven: { kind: 'numeral', text: '7' },
  v_2_eight: { kind: 'numeral', text: '8' },
  v_2_nine: { kind: 'numeral', text: '9' },
  v_2_ten: { kind: 'numeral', text: '10' },
  v_2_eleven: { kind: 'numeral', text: '11' },
  v_2_twelve: { kind: 'numeral', text: '12' },
  v_2_thirteen: { kind: 'numeral', text: '13' },
  v_2_fourteen: { kind: 'numeral', text: '14' },
  v_2_fifteen: { kind: 'numeral', text: '15' },
  v_2_sixteen: { kind: 'numeral', text: '16' },
  v_2_seventeen: { kind: 'numeral', text: '17' },
  v_2_eighteen: { kind: 'numeral', text: '18' },
  v_2_nineteen: { kind: 'numeral', text: '19' },
  v_2_twenty: { kind: 'numeral', text: '20' },
  v_2_thirty: { kind: 'numeral', text: '30' },
  v_2_forty: { kind: 'numeral', text: '40' },
  v_2_fifty: { kind: 'numeral', text: '50' },
  v_2_sixty: { kind: 'numeral', text: '60' },
  v_2_seventy: { kind: 'numeral', text: '70' },
  v_2_eighty: { kind: 'numeral', text: '80' },
  v_2_ninety: { kind: 'numeral', text: '90' },
  v_2_hundred: { kind: 'numeral', text: '100' },

  // Colors (14)
  v_4_black: { kind: 'color', hex: '#111827', borderHex: '#4b5563' },
  v_4_white: { kind: 'color', hex: '#ffffff', borderHex: '#94a3b8' },
  v_4_blue: { kind: 'color', hex: '#2563eb' },
  v_4_green: { kind: 'color', hex: '#16a34a' },
  v_4_yellow: { kind: 'color', hex: '#facc15', borderHex: '#ca8a04' },
  v_4_red: { kind: 'color', hex: '#dc2626' },
  v_4_pink: { kind: 'color', hex: '#ec4899' },
  v_4_orange: { kind: 'color', hex: '#f97316' },
  v_4_purple: { kind: 'color', hex: '#9333ea' },
  v_4_gray: { kind: 'color', hex: '#6b7280' },
  v_4_brown: { kind: 'color', hex: '#78350f' },
  v_4_dark: { kind: 'color', hex: '#090d16', borderHex: '#334155', pattern: 'dark' },
  v_4_light: { kind: 'color', hex: '#fef9c3', borderHex: '#eab308', pattern: 'light' },
  v_4_color: { kind: 'color', hex: '#f43f5e', pattern: 'rainbow' },

  // Personal Information emblems (6)
  v_5_last_name: { kind: 'emblem', emoji: '🏷️', gradient: 'from-amber-200 to-yellow-300' },
  v_5_age: { kind: 'emblem', emoji: '⏳', gradient: 'from-cyan-200 to-sky-300' },
  v_5_birthdate: { kind: 'emblem', emoji: '📅', gradient: 'from-indigo-200 to-blue-300' },
  v_5_single: { kind: 'emblem', emoji: '🧑', gradient: 'from-emerald-200 to-lime-300' },
  v_5_question: { kind: 'emblem', emoji: '❓', gradient: 'from-orange-200 to-amber-300' },
  v_5_answer: { kind: 'emblem', emoji: '💬', gradient: 'from-fuchsia-200 to-purple-300' },
};

export function getVocabImage(vocabId: string): string | null {
  return VOCAB_IMAGE_BY_ID[vocabId] ?? null;
}

export function getVocabVisual(vocabId: string): VocabVisualSpec | undefined {
  return VOCAB_VISUAL_BY_ID[vocabId];
}

function getVisualSignature(vocabId: string): string {
  const img = VOCAB_IMAGE_BY_ID[vocabId];
  if (img) return `img:${img}`;
  const vis = VOCAB_VISUAL_BY_ID[vocabId];
  if (!vis) return `id:${vocabId}`;
  if (vis.kind === 'color') return `clr:${vis.pattern || ''}:${vis.hex}`;
  if (vis.kind === 'numeral') return `num:${vis.text}`;
  return `emb:${vis.emoji}`;
}

function getCategoryTag(vocabId: string): { upper: string; title: string } {
  if (vocabId.startsWith('v_0_')) return { upper: 'GREETINGS', title: 'Hello and Goodbye' };
  if (vocabId.startsWith('v_2_')) return { upper: 'NUMBERS', title: 'Numbers 0 to 100' };
  if (vocabId.startsWith('v_3_')) return { upper: 'FAMILY', title: 'Family' };
  if (vocabId.startsWith('v_4_')) return { upper: 'COLORS', title: 'Colors' };
  if (vocabId.startsWith('v_5_')) return { upper: 'PERSONAL INFO', title: 'Personal Information' };
  if (vocabId.startsWith('v_6_')) return { upper: 'THE BODY', title: 'The Body' };
  if (vocabId.startsWith('v_7_')) return { upper: 'HEAD & FACE', title: 'The Head and Face' };
  return { upper: 'PEOPLE', title: 'People' };
}

function getCategoryPrefix(vocabId: string): string {
  const parts = vocabId.split('_');
  return parts.length >= 2 ? `${parts[0]}_${parts[1]}_` : 'v_1_';
}

function getCategoryPool(vocabId: string): readonly DesaVocabId[] {
  if (vocabId.startsWith('v_0_')) return GREETINGS_VOCAB_IDS;
  if (vocabId.startsWith('v_2_')) return NUMBERS_VOCAB_IDS;
  if (vocabId.startsWith('v_3_')) return FAMILY_VOCAB_IDS;
  if (vocabId.startsWith('v_4_')) return COLORS_VOCAB_IDS;
  if (vocabId.startsWith('v_5_')) return PERSONAL_INFO_VOCAB_IDS;
  if (vocabId.startsWith('v_6_')) return BODY_VOCAB_IDS;
  if (vocabId.startsWith('v_7_')) return HEAD_FACE_VOCAB_IDS;
  return PEOPLE_VOCAB_IDS;
}

export interface PictureChoiceOption {
  vocabId: string;
  label: string;
  imageSrc: string;
  visual?: VocabVisualSpec;
}

export interface WordBankChallengeBase {
  id: string;
  vocabId: string;
  categoryLabel: string;
  speakerImage: string;
  speakerVisual?: VocabVisualSpec;
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
      speakerVisual?: VocabVisualSpec;
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
      speakerAVisual?: VocabVisualSpec;
      speakerAName: string;
      speakerALine: string;
      speakerAHints: Record<string, string>;
      speakerBImage: string;
      speakerBVisual?: VocabVisualSpec;
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

  // ---- THE BODY ----
  {
    vocabId: 'v_6_body',
    direction: 'en_to_id',
    speakerId: 'v_6_body',
    sourceText: 'Keep your body healthy',
    targetTokens: ['Jaga', 'tubuhmu', 'tetap', 'sehat'],
    acceptedVariants: ['jaga badanmu tetap sehat', 'jaga tubuh kamu tetap sehat'],
    distractors: ['sakit', 'tidur'],
    wordHints: { keep: 'jaga', body: 'tubuh / badan', healthy: 'sehat' },
    translationNote: 'Jaga tubuhmu tetap sehat',
  },
  {
    vocabId: 'v_6_hand',
    direction: 'en_to_id',
    speakerId: 'v_1_boy',
    sourceText: 'Wash your hands first',
    targetTokens: ['Cuci', 'tanganmu', 'dulu'],
    acceptedVariants: ['cuci tangan kamu dulu'],
    distractors: ['kaki', 'kepala'],
    wordHints: { wash: 'cuci', hands: 'tangan', first: 'terlebih dahulu' },
    translationNote: 'Cuci tanganmu dulu',
  },
  {
    vocabId: 'v_6_hand',
    direction: 'id_to_en',
    speakerId: 'v_1_girl',
    sourceText: 'Angkat tangan kananmu',
    targetTokens: ['Raise', 'your', 'right', 'hand'],
    distractors: ['foot', 'head'],
    wordHints: { angkat: 'raise', kanan: 'right', tangan: 'hand' },
    translationNote: 'Raise your right hand',
  },
  {
    vocabId: 'v_6_arm',
    direction: 'en_to_id',
    speakerId: 'v_1_man',
    sourceText: 'He has strong arms',
    targetTokens: ['Dia', 'punya', 'lengan', 'yang', 'kuat'],
    acceptedVariants: ['dia memiliki lengan kuat'],
    distractors: ['lutut', 'perut'],
    wordHints: { has: 'punya', strong: 'kuat', arms: 'lengan' },
    translationNote: 'Dia punya lengan yang kuat',
  },
  {
    vocabId: 'v_6_foot',
    direction: 'en_to_id',
    speakerId: 'v_1_boy',
    sourceText: 'My left foot hurts',
    targetTokens: ['Telapak', 'kaki', 'kiri', 'saya', 'sakit'],
    acceptedVariants: ['kaki kiri saya sakit'],
    distractors: ['tangan', 'punggung'],
    wordHints: { left: 'kiri', foot: 'telapak kaki', hurts: 'sakit' },
    translationNote: 'Telapak kaki kiri saya sakit',
  },
  {
    vocabId: 'v_6_head',
    direction: 'id_to_en',
    speakerId: 'v_6_head',
    sourceText: 'Anggukkan kepalamu sekarang',
    targetTokens: ['Nod', 'your', 'head', 'now'],
    distractors: ['knee', 'stomach'],
    wordHints: { anggukkan: 'nod', kepalamu: 'your head', sekarang: 'now' },
    translationNote: 'Nod your head now',
  },
  {
    vocabId: 'v_6_leg',
    direction: 'id_to_en',
    speakerId: 'v_1_boy',
    sourceText: 'Saya berlari dengan kakiku',
    targetTokens: ['I', 'run', 'with', 'my', 'legs'],
    distractors: ['arms', 'head'],
    wordHints: { berlari: 'run', kakiku: 'my legs' },
    translationNote: 'I run with my legs',
  },
  {
    vocabId: 'v_6_knee',
    direction: 'en_to_id',
    speakerId: 'v_1_boy',
    sourceText: 'Bend your knees slowly',
    targetTokens: ['Tekuk', 'lututmu', 'perlahan'],
    acceptedVariants: ['tekuk lutut kamu perlahan'],
    distractors: ['lengan', 'kepala'],
    wordHints: { bend: 'tekuk', knees: 'lutut', slowly: 'perlahan' },
    translationNote: 'Tekuk lututmu perlahan',
  },
  {
    vocabId: 'v_6_back',
    direction: 'en_to_id',
    speakerId: 'v_1_man',
    sourceText: 'My back is tired',
    targetTokens: ['Punggung', 'saya', 'lelah'],
    acceptedVariants: ['punggungku capek'],
    distractors: ['perut', 'tangan'],
    wordHints: { back: 'punggung', tired: 'lelah / pegal' },
    translationNote: 'Punggung saya lelah',
  },
  {
    vocabId: 'v_6_stomach',
    direction: 'id_to_en',
    speakerId: 'v_1_boy',
    sourceText: 'Perut saya sudah kenyang',
    targetTokens: ['My', 'stomach', 'is', 'full'],
    distractors: ['knee', 'arm'],
    wordHints: { perut: 'stomach', kenyang: 'full' },
    translationNote: 'My stomach is full',
  },

  // ---- THE HEAD AND FACE ----
  {
    vocabId: 'v_7_hair',
    direction: 'en_to_id',
    speakerId: 'v_7_hair',
    sourceText: 'Brush your hair neatly',
    targetTokens: ['Sisir', 'rambutmu', 'dengan', 'rapi'],
    acceptedVariants: ['sisir rambut kamu dengan rapi', 'sisirlah rambutmu dengan rapi'],
    distractors: ['wajah', 'leher'],
    wordHints: { brush: 'sisir', hair: 'rambut', neatly: 'dengan rapi' },
    translationNote: 'Sisir rambutmu dengan rapi',
  },
  {
    vocabId: 'v_7_neck',
    direction: 'en_to_id',
    speakerId: 'v_7_neck',
    sourceText: 'My neck feels warm',
    targetTokens: ['Leher', 'saya', 'terasa', 'hangat'],
    acceptedVariants: ['leherku terasa hangat'],
    distractors: ['pipi', 'dagu'],
    wordHints: { neck: 'leher', feels: 'terasa', warm: 'hangat' },
    translationNote: 'Leher saya terasa hangat',
  },
  {
    vocabId: 'v_7_face',
    direction: 'id_to_en',
    speakerId: 'v_7_face',
    sourceText: 'Cuci wajahmu setiap pagi',
    targetTokens: ['Wash', 'your', 'face', 'every', 'morning'],
    distractors: ['ear', 'tooth'],
    wordHints: { cuci: 'wash', wajahmu: 'your face', pagi: 'morning' },
    translationNote: 'Wash your face every morning',
  },
  {
    vocabId: 'v_7_eye',
    direction: 'en_to_id',
    speakerId: 'v_7_eye',
    sourceText: 'Close both eyes slowly',
    targetTokens: ['Tutup', 'kedua', 'matamu', 'perlahan'],
    acceptedVariants: ['tutup kedua mata kamu perlahan'],
    distractors: ['telinga', 'bibir'],
    wordHints: { close: 'tutup', both: 'kedua', eyes: 'mata' },
    translationNote: 'Tutup kedua matamu perlahan',
  },
  {
    vocabId: 'v_7_nose',
    direction: 'id_to_en',
    speakerId: 'v_7_nose',
    sourceText: 'Saya mencium bunga dengan hidung',
    targetTokens: ['I', 'smell', 'flowers', 'with', 'my', 'nose'],
    distractors: ['mouth', 'chin'],
    wordHints: { mencium: 'smell', bunga: 'flowers', hidung: 'nose' },
    translationNote: 'I smell flowers with my nose',
  },
  {
    vocabId: 'v_7_ear',
    direction: 'en_to_id',
    speakerId: 'v_7_ear',
    sourceText: 'Listen with your ears',
    targetTokens: ['Dengarkan', 'dengan', 'telingamu'],
    acceptedVariants: ['dengarkan dengan telinga kamu'],
    distractors: ['hidungmu', 'matamu'],
    wordHints: { listen: 'dengarkan', with: 'dengan', ears: 'telinga' },
    translationNote: 'Dengarkan dengan telingamu',
  },
  {
    vocabId: 'v_7_cheek',
    direction: 'id_to_en',
    speakerId: 'v_7_cheek',
    sourceText: 'Pipinya berwarna merah muda',
    targetTokens: ['Her', 'cheeks', 'are', 'pink'],
    acceptedVariants: ['her cheek is pink'],
    distractors: ['chin', 'lip'],
    wordHints: { pipinya: 'her cheeks', merah: 'pink' },
    translationNote: 'Her cheeks are pink',
  },
  {
    vocabId: 'v_7_chin',
    direction: 'en_to_id',
    speakerId: 'v_7_chin',
    sourceText: 'Lift up your chin',
    targetTokens: ['Angkat', 'dagumu', 'ke', 'atas'],
    acceptedVariants: ['angkat dagu kamu ke atas'],
    distractors: ['lehermu', 'mulutmu'],
    wordHints: { lift: 'angkat', chin: 'dagu' },
    translationNote: 'Angkat dagumu ke atas',
  },
  {
    vocabId: 'v_7_mouth',
    direction: 'id_to_en',
    speakerId: 'v_7_mouth',
    sourceText: 'Buka mulutmu lebar-lebar',
    targetTokens: ['Open', 'your', 'mouth', 'wide'],
    distractors: ['nose', 'hair'],
    wordHints: { buka: 'open', mulutmu: 'your mouth', lebar: 'wide' },
    translationNote: 'Open your mouth wide',
  },
  {
    vocabId: 'v_7_tooth',
    direction: 'en_to_id',
    speakerId: 'v_7_tooth',
    sourceText: 'Brush your teeth tonight',
    targetTokens: ['Sikat', 'gigimu', 'malam', 'ini'],
    acceptedVariants: ['gosok gigimu malam ini', 'sikat gigi kamu malam ini'],
    distractors: ['bibirmu', 'matamu'],
    wordHints: { brush: 'sikat / gosok', teeth: 'gigi', tonight: 'malam ini' },
    translationNote: 'Sikat gigimu malam ini',
  },
  {
    vocabId: 'v_7_lip',
    direction: 'id_to_en',
    speakerId: 'v_7_lip',
    sourceText: 'Dia tersenyum dengan bibir manis',
    targetTokens: ['She', 'smiles', 'with', 'sweet', 'lips'],
    distractors: ['ears', 'neck'],
    wordHints: { tersenyum: 'smiles', bibir: 'lips', manis: 'sweet' },
    translationNote: 'She smiles with sweet lips',
  },

  // ---- PERSONAL INFORMATION ----
  {
    vocabId: 'v_5_name',
    direction: 'en_to_id',
    speakerId: 'v_5_name',
    sourceText: 'Write your full name here',
    targetTokens: ['Tulis', 'nama', 'lengkapmu', 'di', 'sini'],
    acceptedVariants: ['tulis nama lengkap kamu di sini', 'tuliskan nama lengkapmu di sini'],
    distractors: ['alamat', 'paspor'],
    wordHints: { write: 'tulis', full: 'lengkap', name: 'nama', here: 'di sini' },
    translationNote: 'Tulis nama lengkapmu di sini',
  },
  {
    vocabId: 'v_5_name',
    direction: 'id_to_en',
    speakerId: 'v_1_boy',
    sourceText: 'Nama saya adalah Bimo',
    targetTokens: ['My', 'name', 'is', 'Bimo'],
    distractors: ['address', 'passport'],
    wordHints: { nama: 'name', saya: 'my', adalah: 'is' },
    translationNote: 'My name is Bimo',
  },
  {
    vocabId: 'v_5_address',
    direction: 'en_to_id',
    speakerId: 'v_5_address',
    sourceText: 'What is your home address?',
    targetTokens: ['Apa', 'alamat', 'rumahmu?'],
    acceptedVariants: ['apa alamat rumah kamu', 'di mana alamat rumahmu'],
    distractors: ['ulang tahun', 'paspor'],
    wordHints: { home: 'rumah', address: 'alamat' },
    translationNote: 'Apa alamat rumahmu?',
  },
  {
    vocabId: 'v_5_birthday',
    direction: 'id_to_en',
    speakerId: 'v_5_birthday',
    sourceText: 'Hari ini adalah hari ulang tahun saya',
    targetTokens: ['Today', 'is', 'my', 'birthday'],
    distractors: ['passport', 'phone'],
    wordHints: { hari: 'day (hari ini = today)', ulang: 'repeat', tahun: 'ulang tahun = birthday' },
    translationNote: 'Today is my birthday',
  },
  {
    vocabId: 'v_5_married',
    direction: 'en_to_id',
    speakerId: 'v_5_married',
    sourceText: 'They are happily married now',
    targetTokens: ['Mereka', 'sudah', 'menikah', 'dengan', 'bahagia'],
    acceptedVariants: ['mereka menikah dengan bahagia sekarang'],
    distractors: ['lajang', 'alamat'],
    wordHints: { happily: 'dengan bahagia', married: 'menikah' },
    translationNote: 'Mereka sudah menikah dengan bahagia',
  },
  {
    vocabId: 'v_5_passport',
    direction: 'id_to_en',
    speakerId: 'v_5_passport',
    sourceText: 'Bawa paspor biru milikmu',
    targetTokens: ['Bring', 'your', 'blue', 'passport'],
    distractors: ['birthday', 'name'],
    wordHints: { bawa: 'bring', paspor: 'passport', biru: 'blue' },
    translationNote: 'Bring your blue passport',
  },
  {
    vocabId: 'v_5_phone_number',
    direction: 'en_to_id',
    speakerId: 'v_5_phone_number',
    sourceText: 'May I have your phone number?',
    targetTokens: ['Boleh', 'saya', 'minta', 'nomor', 'teleponmu?'],
    acceptedVariants: ['bolehkah saya minta nomor telepon kamu'],
    distractors: ['alamatmu', 'paspormu'],
    wordHints: { may: 'boleh', phone: 'telepon', number: 'nomor' },
    translationNote: 'Boleh saya minta nomor teleponmu?',
  },
  {
    vocabId: 'v_5_phone_number',
    direction: 'id_to_en',
    speakerId: 'v_1_girl',
    sourceText: 'Catat nomor telepon saya',
    targetTokens: ['Save', 'my', 'phone', 'number'],
    acceptedVariants: ['write my phone number'],
    distractors: ['birthday', 'address'],
    wordHints: { catat: 'save / write', nomor: 'number', telepon: 'phone' },
    translationNote: 'Save my phone number',
  },

  // ---- HELLO AND GOODBYE ----
  {
    vocabId: 'v_0_hello',
    direction: 'en_to_id',
    speakerId: 'v_0_hello',
    sourceText: 'Hello, nice to meet you!',
    targetTokens: ['Halo,', 'senang', 'bertemu', 'denganmu!'],
    acceptedVariants: ['halo senang bertemu kamu'],
    distractors: ['selamat tidur', 'sampai jumpa'],
    wordHints: { hello: 'halo', nice: 'senang', meet: 'bertemu' },
    translationNote: 'Halo, senang bertemu denganmu!',
  },
  {
    vocabId: 'v_0_goodbye',
    direction: 'id_to_en',
    speakerId: 'v_0_goodbye',
    sourceText: 'Selamat tinggal, teman baikku!',
    targetTokens: ['Goodbye,', 'my', 'good', 'friend!'],
    distractors: ['morning', 'welcome'],
    wordHints: { selamat: 'good', tinggal: 'selamat tinggal = goodbye', teman: 'friend' },
    translationNote: 'Goodbye, my good friend!',
  },
  {
    vocabId: 'v_0_good_morning',
    direction: 'en_to_id',
    speakerId: 'v_0_good_morning',
    sourceText: 'Good morning, let us wake up!',
    targetTokens: ['Selamat', 'pagi,', 'ayo', 'bangun!'],
    acceptedVariants: ['selamat pagi mari kita bangun'],
    distractors: ['malam', 'tidur'],
    wordHints: { good: 'selamat', morning: 'pagi', wake: 'bangun' },
    translationNote: 'Selamat pagi, ayo bangun!',
  },
  {
    vocabId: 'v_0_good_afternoon',
    direction: 'id_to_en',
    speakerId: 'v_0_good_afternoon',
    sourceText: 'Selamat siang, hari ini cerah',
    targetTokens: ['Good', 'afternoon,', 'today', 'is', 'sunny'],
    acceptedVariants: ['good afternoon it is sunny today'],
    distractors: ['night', 'evening'],
    wordHints: { selamat: 'good', siang: 'afternoon', cerah: 'sunny / bright' },
    translationNote: 'Good afternoon, today is sunny',
  },
  {
    vocabId: 'v_0_good_evening',
    direction: 'en_to_id',
    speakerId: 'v_0_good_evening',
    sourceText: 'Good evening along the quiet street',
    targetTokens: ['Selamat', 'malam', 'di', 'jalan', 'yang', 'tenang'],
    acceptedVariants: ['selamat sore di jalan yang tenang'],
    distractors: ['pagi', 'siang'],
    wordHints: { evening: 'malam / petang', quiet: 'tenang', street: 'jalan' },
    translationNote: 'Selamat malam di jalan yang tenang',
  },
  {
    vocabId: 'v_0_good_night',
    direction: 'id_to_en',
    speakerId: 'v_0_good_night',
    sourceText: 'Selamat tidur dan mimpi indah',
    targetTokens: ['Good', 'night', 'and', 'sweet', 'dreams'],
    distractors: ['morning', 'afternoon'],
    wordHints: { selamat: 'good', tidur: 'good night (sleep)', mimpi: 'dreams' },
    translationNote: 'Good night and sweet dreams',
  },
  {
    vocabId: 'v_0_thank_you',
    direction: 'en_to_id',
    speakerId: 'v_0_thank_you',
    sourceText: 'Thank you for this lovely gift!',
    targetTokens: ['Terima', 'kasih', 'atas', 'hadiah', 'indah', 'ini!'],
    acceptedVariants: ['terima kasih untuk hadiah indah ini'],
    distractors: ['maaf', 'selamat tinggal'],
    wordHints: { thank: 'terima kasih', lovely: 'indah', gift: 'hadiah' },
    translationNote: 'Terima kasih atas hadiah indah ini!',
  },
  {
    vocabId: 'v_0_welcome',
    direction: 'id_to_en',
    speakerId: 'v_0_welcome',
    sourceText: 'Selamat datang di rumah kami!',
    targetTokens: ['Welcome', 'to', 'our', 'home!'],
    acceptedVariants: ['welcome to our house'],
    distractors: ['goodbye', 'night'],
    wordHints: { selamat: 'welcome (selamat datang)', datang: 'come', rumah: 'home' },
    translationNote: 'Welcome to our home!',
  },
  // ---- GREETINGS REMAINING (8) ----
  {
    vocabId: 'v_0_hi',
    direction: 'en_to_id',
    speakerId: 'v_1_boy',
    sourceText: 'Hi, how are you today?',
    targetTokens: ['Hai,', 'apa', 'kabarmu', 'hari', 'ini?'],
    acceptedVariants: ['hai bagaimana kabarmu hari ini'],
    distractors: ['maaf', 'selamat tidur'],
    wordHints: { hi: 'hai', how: 'bagaimana', today: 'hari ini' },
    translationNote: 'Hai, apa kabarmu hari ini?',
  },
  {
    vocabId: 'v_0_bye',
    direction: 'id_to_en',
    speakerId: 'v_1_girl',
    sourceText: 'Sampai jumpa besok pagi!',
    targetTokens: ['Bye,', 'see', 'you', 'tomorrow', 'morning!'],
    acceptedVariants: ['bye see you tomorrow'],
    distractors: ['welcome', 'sorry'],
    wordHints: { sampai: 'sampai jumpa = bye', besok: 'tomorrow', pagi: 'morning' },
    translationNote: 'Bye, see you tomorrow morning!',
  },
  {
    vocabId: 'v_0_thanks',
    direction: 'en_to_id',
    speakerId: 'v_1_friend',
    sourceText: 'Thanks for your kind help!',
    targetTokens: ['Makasih', 'atas', 'bantuan', 'baikmu!'],
    acceptedVariants: ['terima kasih atas bantuan baikmu', 'makasih untuk bantuanmu'],
    distractors: ['tolong', 'tidak'],
    wordHints: { thanks: 'makasih', kind: 'baik', help: 'bantuan' },
    translationNote: 'Makasih atas bantuan baikmu!',
  },
  {
    vocabId: 'v_0_please',
    direction: 'id_to_en',
    speakerId: 'v_1_woman',
    sourceText: 'Tolong bantu teman saya',
    targetTokens: ['Please', 'help', 'my', 'friend'],
    distractors: ['sorry', 'goodbye'],
    wordHints: { tolong: 'please', bantu: 'help', teman: 'friend' },
    translationNote: 'Please help my friend',
  },
  {
    vocabId: 'v_0_ok',
    direction: 'en_to_id',
    speakerId: 'v_1_boy',
    sourceText: 'OK, let us go together!',
    targetTokens: ['Baiklah,', 'ayo', 'kita', 'pergi', 'bersama!'],
    acceptedVariants: ['oke ayo kita pergi bersama', 'ok ayo kita pergi bersama'],
    distractors: ['tidak', 'maaf'],
    wordHints: { ok: 'oke / baiklah', go: 'pergi', together: 'bersama' },
    translationNote: 'Baiklah, ayo kita pergi bersama!',
  },
  {
    vocabId: 'v_0_yes',
    direction: 'id_to_en',
    speakerId: 'v_1_girl',
    sourceText: 'Ya, saya sudah siap sekarang',
    targetTokens: ['Yes,', 'I', 'am', 'ready', 'now'],
    distractors: ['no', 'sorry'],
    wordHints: { ya: 'yes', siap: 'ready', sekarang: 'now' },
    translationNote: 'Yes, I am ready now',
  },
  {
    vocabId: 'v_0_no',
    direction: 'en_to_id',
    speakerId: 'v_1_man',
    sourceText: 'No, that is not my bag',
    targetTokens: ['Tidak,', 'itu', 'bukan', 'tas', 'saya'],
    distractors: ['ya', 'tolong'],
    wordHints: { no: 'tidak', not: 'bukan', bag: 'tas' },
    translationNote: 'Tidak, itu bukan tas saya',
  },
  {
    vocabId: 'v_0_sorry',
    direction: 'id_to_en',
    speakerId: 'v_1_boy',
    sourceText: 'Maaf, saya datang terlambat',
    targetTokens: ['Sorry,', 'I', 'came', 'late'],
    acceptedVariants: ['sorry i am late'],
    distractors: ['thanks', 'welcome'],
    wordHints: { maaf: 'sorry', datang: 'came', terlambat: 'late' },
    translationNote: 'Sorry, I came late',
  },
  // ---- PERSONAL INFO REMAINING (6) ----
  {
    vocabId: 'v_5_last_name',
    direction: 'en_to_id',
    speakerId: 'v_1_mr',
    sourceText: 'What is your last name?',
    targetTokens: ['Apa', 'nama', 'belakangmu?'],
    acceptedVariants: ['apa marga kamu', 'apa nama belakang kamu'],
    distractors: ['umurmu', 'paspor'],
    wordHints: { last: 'belakang / marga', name: 'nama' },
    translationNote: 'Apa nama belakangmu?',
  },
  {
    vocabId: 'v_5_age',
    direction: 'id_to_en',
    speakerId: 'v_1_girl',
    sourceText: 'Berapa umurmu sekarang?',
    targetTokens: ['What', 'is', 'your', 'age', 'now?'],
    acceptedVariants: ['how old are you now'],
    distractors: ['name', 'address'],
    wordHints: { umurmu: 'your age', sekarang: 'now' },
    translationNote: 'What is your age now?',
  },
  {
    vocabId: 'v_5_birthdate',
    direction: 'en_to_id',
    speakerId: 'v_1_woman',
    sourceText: 'Write your full birthdate here',
    targetTokens: ['Tulis', 'tanggal', 'lahirmu', 'di', 'sini'],
    acceptedVariants: ['tulis tanggal lahir kamu di sini'],
    distractors: ['alamatmu', 'namamu'],
    wordHints: { write: 'tulis', full: 'lengkap', birthdate: 'tanggal lahir', here: 'di sini' },
    translationNote: 'Tulis tanggal lahirmu di sini',
  },
  {
    vocabId: 'v_5_single',
    direction: 'id_to_en',
    speakerId: 'v_1_miss',
    sourceText: 'Kakak laki-lakiku masih lajang',
    targetTokens: ['My', 'brother', 'is', 'still', 'single'],
    distractors: ['married', 'passport'],
    wordHints: { masih: 'still', lajang: 'single' },
    translationNote: 'My brother is still single',
  },
  {
    vocabId: 'v_5_question',
    direction: 'en_to_id',
    speakerId: 'v_1_woman',
    sourceText: 'I have an easy question',
    targetTokens: ['Saya', 'punya', 'pertanyaan', 'yang', 'mudah'],
    acceptedVariants: ['saya ada satu pertanyaan mudah'],
    distractors: ['jawaban', 'nomor'],
    wordHints: { have: 'punya', easy: 'mudah', question: 'pertanyaan' },
    translationNote: 'Saya punya pertanyaan yang mudah',
  },
  {
    vocabId: 'v_5_answer',
    direction: 'id_to_en',
    speakerId: 'v_1_boy',
    sourceText: 'Saya tahu jawaban yang benar',
    targetTokens: ['I', 'know', 'the', 'right', 'answer'],
    acceptedVariants: ['i know the correct answer'],
    distractors: ['question', 'birthdate'],
    wordHints: { tahu: 'know', benar: 'right / correct', jawaban: 'answer' },
    translationNote: 'I know the right answer',
  },
  // ---- COLORS (14) ----
  {
    vocabId: 'v_4_black',
    direction: 'en_to_id',
    speakerId: 'v_4_black',
    sourceText: 'The cat is black',
    targetTokens: ['Kucing', 'itu', 'berwarna', 'hitam'],
    acceptedVariants: ['kucing itu hitam'],
    distractors: ['putih', 'merah'],
    wordHints: { cat: 'kucing', black: 'hitam' },
    translationNote: 'Kucing itu berwarna hitam',
  },
  {
    vocabId: 'v_4_white',
    direction: 'id_to_en',
    speakerId: 'v_4_white',
    sourceText: 'Gigi saya berwarna putih',
    targetTokens: ['My', 'teeth', 'are', 'white'],
    distractors: ['black', 'brown'],
    wordHints: { gigi: 'teeth', putih: 'white' },
    translationNote: 'My teeth are white',
  },
  {
    vocabId: 'v_4_blue',
    direction: 'en_to_id',
    speakerId: 'v_4_blue',
    sourceText: 'The ocean is bright blue',
    targetTokens: ['Lautan', 'berwarna', 'biru', 'cerah'],
    acceptedVariants: ['laut itu biru cerah'],
    distractors: ['hijau', 'ungu'],
    wordHints: { ocean: 'lautan', bright: 'cerah', blue: 'biru' },
    translationNote: 'Lautan berwarna biru cerah',
  },
  {
    vocabId: 'v_4_green',
    direction: 'id_to_en',
    speakerId: 'v_4_green',
    sourceText: 'Daun di taman berwarna hijau',
    targetTokens: ['Leaves', 'in', 'the', 'garden', 'are', 'green'],
    distractors: ['yellow', 'pink'],
    wordHints: { daun: 'leaves', taman: 'garden', hijau: 'green' },
    translationNote: 'Leaves in the garden are green',
  },
  {
    vocabId: 'v_4_yellow',
    direction: 'en_to_id',
    speakerId: 'v_4_yellow',
    sourceText: 'The morning sun is yellow',
    targetTokens: ['Matahari', 'pagi', 'berwarna', 'kuning'],
    acceptedVariants: ['matahari pagi kuning'],
    distractors: ['abu-abu', 'hitam'],
    wordHints: { sun: 'matahari', morning: 'pagi', yellow: 'kuning' },
    translationNote: 'Matahari pagi berwarna kuning',
  },
  {
    vocabId: 'v_4_red',
    direction: 'id_to_en',
    speakerId: 'v_4_red',
    sourceText: 'Saya membawa mawar merah',
    targetTokens: ['I', 'bring', 'a', 'red', 'rose'],
    distractors: ['blue', 'gray'],
    wordHints: { membawa: 'bring', mawar: 'rose', merah: 'red' },
    translationNote: 'I bring a red rose',
  },
  {
    vocabId: 'v_4_pink',
    direction: 'en_to_id',
    speakerId: 'v_4_pink',
    sourceText: 'She wears a pink scarf',
    targetTokens: ['Dia', 'memakai', 'syal', 'merah', 'muda'],
    acceptedVariants: ['dia memakai syal pink'],
    distractors: ['cokelat', 'biru'],
    wordHints: { wears: 'memakai', pink: 'merah muda', scarf: 'syal' },
    translationNote: 'Dia memakai syal merah muda',
  },
  {
    vocabId: 'v_4_orange',
    direction: 'id_to_en',
    speakerId: 'v_4_orange',
    sourceText: 'Langit senja berwarna oranye',
    targetTokens: ['The', 'sunset', 'sky', 'is', 'orange'],
    distractors: ['purple', 'white'],
    wordHints: { langit: 'sky', senja: 'sunset', oranye: 'orange' },
    translationNote: 'The sunset sky is orange',
  },
  {
    vocabId: 'v_4_purple',
    direction: 'en_to_id',
    speakerId: 'v_4_purple',
    sourceText: 'Look at that purple flower',
    targetTokens: ['Lihat', 'bunga', 'ungu', 'itu'],
    distractors: ['kuning', 'hitam'],
    wordHints: { look: 'lihat', purple: 'ungu', flower: 'bunga' },
    translationNote: 'Lihat bunga ungu itu',
  },
  {
    vocabId: 'v_4_gray',
    direction: 'id_to_en',
    speakerId: 'v_4_gray',
    sourceText: 'Awan hujan itu berwarna abu-abu',
    targetTokens: ['The', 'rain', 'cloud', 'is', 'gray'],
    distractors: ['yellow', 'pink'],
    wordHints: { awan: 'cloud', hujan: 'rain', 'abu-abu': 'gray' },
    translationNote: 'The rain cloud is gray',
  },
  {
    vocabId: 'v_4_brown',
    direction: 'en_to_id',
    speakerId: 'v_4_brown',
    sourceText: 'He has brown hair',
    targetTokens: ['Dia', 'punya', 'rambut', 'cokelat'],
    distractors: ['ungu', 'hijau'],
    wordHints: { brown: 'cokelat', hair: 'rambut' },
    translationNote: 'Dia punya rambut cokelat',
  },
  {
    vocabId: 'v_4_dark',
    direction: 'id_to_en',
    speakerId: 'v_4_dark',
    sourceText: 'Malam ini langit sangat gelap',
    targetTokens: ['Tonight', 'the', 'sky', 'is', 'very', 'dark'],
    distractors: ['light', 'pink'],
    wordHints: { malam: 'tonight', langit: 'sky', gelap: 'dark' },
    translationNote: 'Tonight the sky is very dark',
  },
  {
    vocabId: 'v_4_light',
    direction: 'en_to_id',
    speakerId: 'v_4_light',
    sourceText: 'I like light blue color',
    targetTokens: ['Saya', 'suka', 'warna', 'biru', 'terang'],
    acceptedVariants: ['saya suka warna biru cerah'],
    distractors: ['gelap', 'hitam'],
    wordHints: { like: 'suka', light: 'terang / cerah', blue: 'biru', color: 'warna' },
    translationNote: 'Saya suka warna biru terang',
  },
  {
    vocabId: 'v_4_color',
    direction: 'id_to_en',
    speakerId: 'v_4_color',
    sourceText: 'Apa warna kesukaanmu?',
    targetTokens: ['What', 'is', 'your', 'favorite', 'color?'],
    distractors: ['number', 'age'],
    wordHints: { warna: 'color', kesukaanmu: 'your favorite' },
    translationNote: 'What is your favorite color?',
  },
  // ---- NUMBERS 0..100 (29) ----
  {
    vocabId: 'v_2_zero',
    direction: 'en_to_id',
    speakerId: 'v_2_zero',
    sourceText: 'Start counting from zero',
    targetTokens: ['Mulai', 'menghitung', 'dari', 'nol'],
    distractors: ['sepuluh', 'seratus'],
    wordHints: { start: 'mulai', counting: 'menghitung', zero: 'nol' },
    translationNote: 'Mulai menghitung dari nol',
  },
  {
    vocabId: 'v_2_one',
    direction: 'id_to_en',
    speakerId: 'v_2_one',
    sourceText: 'Saya punya satu sahabat',
    targetTokens: ['I', 'have', 'one', 'best', 'friend'],
    distractors: ['two', 'ten'],
    wordHints: { satu: 'one', sahabat: 'best friend' },
    translationNote: 'I have one best friend',
  },
  {
    vocabId: 'v_2_two',
    direction: 'en_to_id',
    speakerId: 'v_2_two',
    sourceText: 'We have two bright eyes',
    targetTokens: ['Kita', 'punya', 'dua', 'mata', 'cerah'],
    distractors: ['lima', 'nol'],
    wordHints: { two: 'dua', bright: 'cerah', eyes: 'mata' },
    translationNote: 'Kita punya dua mata cerah',
  },
  {
    vocabId: 'v_2_three',
    direction: 'id_to_en',
    speakerId: 'v_2_three',
    sourceText: 'Ada tiga anak di taman',
    targetTokens: ['There', 'are', 'three', 'children', 'outside'],
    acceptedVariants: ['there are three children in the park'],
    distractors: ['four', 'zero'],
    wordHints: { tiga: 'three', anak: 'children' },
    translationNote: 'There are three children outside',
  },
  {
    vocabId: 'v_2_four',
    direction: 'en_to_id',
    speakerId: 'v_2_four',
    sourceText: 'Four people greet us',
    targetTokens: ['Empat', 'orang', 'menyapa', 'kita'],
    distractors: ['tujuh', 'sembilan'],
    wordHints: { four: 'empat', people: 'orang', greet: 'menyapa' },
    translationNote: 'Four people greet us',
  },
  {
    vocabId: 'v_2_five',
    direction: 'id_to_en',
    speakerId: 'v_2_five',
    sourceText: 'Lima jari di tangan kanan',
    targetTokens: ['Five', 'fingers', 'on', 'right', 'hand'],
    distractors: ['eight', 'two'],
    wordHints: { lima: 'five', jari: 'fingers', tangan: 'hand' },
    translationNote: 'Five fingers on right hand',
  },
  {
    vocabId: 'v_2_six',
    direction: 'en_to_id',
    speakerId: 'v_2_six',
    sourceText: 'Count up to six!',
    targetTokens: ['Hitung', 'sampai', 'enam!'],
    distractors: ['empat', 'dua belas'],
    wordHints: { count: 'hitung', six: 'enam' },
    translationNote: 'Hitung sampai enam!',
  },
  {
    vocabId: 'v_2_seven',
    direction: 'id_to_en',
    speakerId: 'v_2_seven',
    sourceText: 'Saya bangun pukul tujuh pagi',
    targetTokens: ['I', 'wake', 'up', 'at', 'seven'],
    distractors: ['eleven', 'zero'],
    wordHints: { bangun: 'wake up', tujuh: 'seven' },
    translationNote: 'I wake up at seven',
  },
  {
    vocabId: 'v_2_eight',
    direction: 'en_to_id',
    speakerId: 'v_2_eight',
    sourceText: 'Eight friends smile warmly',
    targetTokens: ['Delapan', 'teman', 'tersenyum', 'hangat'],
    distractors: ['sembilan', 'tiga'],
    wordHints: { eight: 'delapan', friends: 'teman', smile: 'tersenyum' },
    translationNote: 'Delapan teman tersenyum hangat',
  },
  {
    vocabId: 'v_2_nine',
    direction: 'id_to_en',
    speakerId: 'v_2_nine',
    sourceText: 'Adik saya berumur sembilan tahun',
    targetTokens: ['My', 'brother', 'is', 'nine', 'years', 'old'],
    distractors: ['six', 'thirty'],
    wordHints: { sembilan: 'nine', tahun: 'years' },
    translationNote: 'My brother is nine years old',
  },
  {
    vocabId: 'v_2_ten',
    direction: 'en_to_id',
    speakerId: 'v_2_ten',
    sourceText: 'We have ten clean fingers',
    targetTokens: ['Kita', 'punya', 'sepuluh', 'jari', 'bersih'],
    distractors: ['lima', 'seratus'],
    wordHints: { ten: 'sepuluh', fingers: 'jari', clean: 'bersih' },
    translationNote: 'Kita punya sepuluh jari bersih',
  },
  {
    vocabId: 'v_2_eleven',
    direction: 'id_to_en',
    speakerId: 'v_2_eleven',
    sourceText: 'Nomor rumahku adalah sebelas',
    targetTokens: ['My', 'house', 'number', 'is', 'eleven'],
    distractors: ['twelve', 'twenty'],
    wordHints: { nomor: 'number', rumahku: 'my house', sebelas: 'eleven' },
    translationNote: 'My house number is eleven',
  },
  {
    vocabId: 'v_2_twelve',
    direction: 'en_to_id',
    speakerId: 'v_2_twelve',
    sourceText: 'Twelve months in one year',
    targetTokens: ['Dua', 'belas', 'bulan', 'dalam', 'setahun'],
    distractors: ['sebelas', 'dua puluh'],
    wordHints: { twelve: 'dua belas', months: 'bulan', year: 'tahun' },
    translationNote: 'Dua belas bulan dalam setahun',
  },
  {
    vocabId: 'v_2_thirteen',
    direction: 'id_to_en',
    speakerId: 'v_2_thirteen',
    sourceText: 'Sepupuku berumur tiga belas',
    targetTokens: ['My', 'cousin', 'is', 'thirteen'],
    distractors: ['thirty', 'fourteen'],
    wordHints: { sepupuku: 'my cousin', tiga: 'three', belas: 'tiga belas = thirteen' },
    translationNote: 'My cousin is thirteen',
  },
  {
    vocabId: 'v_2_fourteen',
    direction: 'en_to_id',
    speakerId: 'v_2_fourteen',
    sourceText: 'Fourteen gifts on the table',
    targetTokens: ['Empat', 'belas', 'hadiah', 'di', 'meja'],
    distractors: ['empat puluh', 'lima belas'],
    wordHints: { fourteen: 'empat belas', gifts: 'hadiah', table: 'meja' },
    translationNote: 'Empat belas hadiah di meja',
  },
  {
    vocabId: 'v_2_fifteen',
    direction: 'id_to_en',
    speakerId: 'v_2_fifteen',
    sourceText: 'Lima belas anak bermain bola',
    targetTokens: ['Fifteen', 'children', 'play', 'soccer'],
    distractors: ['fifty', 'sixteen'],
    wordHints: { lima: 'five', belas: 'lima belas = fifteen', bola: 'soccer' },
    translationNote: 'Fifteen children play soccer',
  },
  {
    vocabId: 'v_2_sixteen',
    direction: 'en_to_id',
    speakerId: 'v_2_sixteen',
    sourceText: 'Sixteen blue flags wave',
    targetTokens: ['Enam', 'belas', 'bendera', 'biru', 'berkibar'],
    distractors: ['enam puluh', 'tujuh belas'],
    wordHints: { sixteen: 'enam belas', blue: 'biru', flags: 'bendera' },
    translationNote: 'Enam belas bendera biru berkibar',
  },
  {
    vocabId: 'v_2_seventeen',
    direction: 'id_to_en',
    speakerId: 'v_2_seventeen',
    sourceText: 'Tujuh belas lilin ulang tahun',
    targetTokens: ['Seventeen', 'birthday', 'candles'],
    distractors: ['seventy', 'eighteen'],
    wordHints: { tujuh: 'seven', belas: 'tujuh belas = seventeen', lilin: 'candles' },
    translationNote: 'Seventeen birthday candles',
  },
  {
    vocabId: 'v_2_eighteen',
    direction: 'en_to_id',
    speakerId: 'v_2_eighteen',
    sourceText: 'She turns eighteen today',
    targetTokens: ['Dia', 'berusia', 'delapan', 'belas', 'hari', 'ini'],
    distractors: ['delapan puluh', 'sembilan belas'],
    wordHints: { eighteen: 'delapan belas', today: 'hari ini' },
    translationNote: 'Dia berusia delapan belas hari ini',
  },
  {
    vocabId: 'v_2_nineteen',
    direction: 'id_to_en',
    speakerId: 'v_2_nineteen',
    sourceText: 'Ada sembilan belas buku biru',
    targetTokens: ['There', 'are', 'nineteen', 'blue', 'books'],
    distractors: ['ninety', 'twelve'],
    wordHints: { sembilan: 'nine', belas: 'sembilan belas = nineteen', buku: 'books' },
    translationNote: 'There are nineteen blue books',
  },
  {
    vocabId: 'v_2_twenty',
    direction: 'en_to_id',
    speakerId: 'v_2_twenty',
    sourceText: 'Twenty students say good morning',
    targetTokens: ['Dua', 'puluh', 'murid', 'menyapa', 'selamat', 'pagi'],
    distractors: ['dua belas', 'seratus'],
    wordHints: { twenty: 'dua puluh', students: 'murid' },
    translationNote: 'Dua puluh murid menyapa selamat pagi',
  },
  {
    vocabId: 'v_2_thirty',
    direction: 'id_to_en',
    speakerId: 'v_2_thirty',
    sourceText: 'Paman berumur tiga puluh tahun',
    targetTokens: ['Uncle', 'is', 'thirty', 'years', 'old'],
    distractors: ['thirteen', 'forty'],
    wordHints: { paman: 'uncle', tiga: 'three', puluh: 'tiga puluh = thirty' },
    translationNote: 'Uncle is thirty years old',
  },
  {
    vocabId: 'v_2_forty',
    direction: 'en_to_id',
    speakerId: 'v_2_forty',
    sourceText: 'Forty people live here',
    targetTokens: ['Empat', 'puluh', 'orang', 'tinggal', 'di', 'sini'],
    distractors: ['empat belas', 'lima puluh'],
    wordHints: { forty: 'empat puluh', people: 'orang', live: 'tinggal' },
    translationNote: 'Empat puluh orang tinggal di sini',
  },
  {
    vocabId: 'v_2_fifty',
    direction: 'id_to_en',
    speakerId: 'v_2_fifty',
    sourceText: 'Kakek memiliki lima puluh bunga',
    targetTokens: ['Grandfather', 'has', 'fifty', 'flowers'],
    distractors: ['fifteen', 'sixty'],
    wordHints: { kakek: 'grandfather', lima: 'five', puluh: 'lima puluh = fifty', bunga: 'flowers' },
    translationNote: 'Grandfather has fifty flowers',
  },
  {
    vocabId: 'v_2_sixty',
    direction: 'en_to_id',
    speakerId: 'v_2_sixty',
    sourceText: 'Sixty minutes in an hour',
    targetTokens: ['Enam', 'puluh', 'menit', 'dalam', 'sejam'],
    distractors: ['enam belas', 'tujuh puluh'],
    wordHints: { sixty: 'enam puluh', minutes: 'menit', hour: 'jam' },
    translationNote: 'Enam puluh menit dalam sejam',
  },
  {
    vocabId: 'v_2_seventy',
    direction: 'id_to_en',
    speakerId: 'v_2_seventy',
    sourceText: 'Nenek berusia tujuh puluh tahun',
    targetTokens: ['Grandmother', 'is', 'seventy', 'years', 'old'],
    distractors: ['seventeen', 'eighty'],
    wordHints: { nenek: 'grandmother', tujuh: 'seven', puluh: 'tujuh puluh = seventy' },
    translationNote: 'Grandmother is seventy years old',
  },
  {
    vocabId: 'v_2_eighty',
    direction: 'en_to_id',
    speakerId: 'v_2_eighty',
    sourceText: 'Eighty warm cookies for family',
    targetTokens: ['Delapan', 'puluh', 'kue', 'hangat', 'untuk', 'keluarga'],
    distractors: ['delapan belas', 'sembilan puluh'],
    wordHints: { eighty: 'delapan puluh', cookies: 'kue', family: 'keluarga' },
    translationNote: 'Delapan puluh kue hangat untuk keluarga',
  },
  {
    vocabId: 'v_2_ninety',
    direction: 'id_to_en',
    speakerId: 'v_2_ninety',
    sourceText: 'Nilai ujianku adalah sembilan puluh',
    targetTokens: ['My', 'test', 'score', 'is', 'ninety'],
    distractors: ['nineteen', 'hundred'],
    wordHints: { nilai: 'score', ujianku: 'my test', sembilan: 'nine', puluh: 'sembilan puluh = ninety' },
    translationNote: 'My test score is ninety',
  },
  {
    vocabId: 'v_2_hundred',
    direction: 'en_to_id',
    speakerId: 'v_2_hundred',
    sourceText: 'We scored one hundred percent!',
    targetTokens: ['Kita', 'meraih', 'seratus', 'persen!'],
    acceptedVariants: ['kami meraih seratus persen', 'kita mendapat seratus persen'],
    distractors: ['nol', 'sepuluh'],
    wordHints: { scored: 'meraih', hundred: 'seratus', percent: 'persen' },
    translationNote: 'Kita meraih seratus persen!',
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

  // ---- THE BODY ----
  {
    vocabId: 'v_6_body',
    speakerId: 'v_6_body',
    sentence: 'Move your body every morning.',
    wordHints: { move: 'gerakkan', body: 'tubuh / badan', morning: 'pagi' },
    translationNote: 'Gerakkan tubuhmu setiap pagi.',
  },
  {
    vocabId: 'v_6_hand',
    speakerId: 'v_1_boy',
    sentence: 'Wash your hands before eating.',
    wordHints: { wash: 'cuci', hands: 'tangan', before: 'sebelum', eating: 'makan' },
    translationNote: 'Cuci tanganmu sebelum makan.',
  },
  {
    vocabId: 'v_6_arm',
    speakerId: 'v_1_man',
    sentence: 'My arm is very strong.',
    wordHints: { arm: 'lengan', very: 'sangat', strong: 'kuat' },
    translationNote: 'Lengan saya sangat kuat.',
  },
  {
    vocabId: 'v_6_foot',
    speakerId: 'v_1_boy',
    sentence: 'Put shoes on your feet.',
    wordHints: { put: 'pakai', shoes: 'sepatu', feet: 'telapak kaki' },
    translationNote: 'Pakailah sepatu di kakimu.',
  },
  {
    vocabId: 'v_6_head',
    speakerId: 'v_6_head',
    sentence: 'Wear a hat on your head.',
    wordHints: { wear: 'pakai', hat: 'topi', head: 'kepala' },
    translationNote: 'Pakailah topi di kepalamu.',
  },
  {
    vocabId: 'v_6_leg',
    speakerId: 'v_1_boy',
    sentence: 'I have two long legs.',
    wordHints: { two: 'dua', long: 'panjang', legs: 'kaki / tungkai' },
    translationNote: 'Saya memiliki dua kaki yang panjang.',
  },
  {
    vocabId: 'v_6_knee',
    speakerId: 'v_1_boy',
    sentence: 'Ouch, my knee hurts a little.',
    wordHints: { ouch: 'aduh', knee: 'lutut', hurts: 'sakit' },
    translationNote: 'Aduh, lututku sedikit sakit.',
  },
  {
    vocabId: 'v_6_back',
    speakerId: 'v_1_man',
    sentence: 'Sit straight to protect your back.',
    wordHints: { straight: 'tegak', protect: 'melindungi', back: 'punggung' },
    translationNote: 'Duduk tegak untuk menjaga punggungmu.',
  },
  {
    vocabId: 'v_6_stomach',
    speakerId: 'v_1_boy',
    sentence: 'My stomach is full and happy!',
    wordHints: { stomach: 'perut', full: 'kenyang', happy: 'senang' },
    translationNote: 'Perutku kenyang dan senang!',
  },

  // ---- THE HEAD AND FACE ----
  {
    vocabId: 'v_7_hair',
    speakerId: 'v_7_hair',
    sentence: 'I brush my brown hair.',
    wordHints: { brush: 'menyisir', brown: 'cokelat', hair: 'rambut' },
    translationNote: 'Saya menyisir rambut cokelat saya.',
  },
  {
    vocabId: 'v_7_neck',
    speakerId: 'v_7_neck',
    sentence: 'Wear a scarf around your neck.',
    wordHints: { scarf: 'syal', around: 'di sekitar', neck: 'leher' },
    translationNote: 'Pakailah syal di sekeliling lehermu.',
  },
  {
    vocabId: 'v_7_face',
    speakerId: 'v_7_face',
    sentence: 'Wash your face every morning.',
    wordHints: { wash: 'cuci', face: 'wajah', morning: 'pagi' },
    translationNote: 'Cuci wajahmu setiap pagi.',
  },
  {
    vocabId: 'v_7_eye',
    speakerId: 'v_7_eye',
    sentence: 'I see blue sky with my eyes.',
    wordHints: { see: 'melihat', sky: 'langit', eyes: 'mata' },
    translationNote: 'Saya melihat langit biru dengan mata saya.',
  },
  {
    vocabId: 'v_7_nose',
    speakerId: 'v_7_nose',
    sentence: 'Touch the tip of your nose.',
    wordHints: { touch: 'sentuh', tip: 'ujung', nose: 'hidung' },
    translationNote: 'Sentuh ujung hidungmu.',
  },
  {
    vocabId: 'v_7_ear',
    speakerId: 'v_7_ear',
    sentence: 'Listen carefully with your two ears.',
    wordHints: { listen: 'dengarkan', carefully: 'baik-baik', ears: 'telinga' },
    translationNote: 'Dengarkan baik-baik dengan kedua telingamu.',
  },
  {
    vocabId: 'v_7_cheek',
    speakerId: 'v_7_cheek',
    sentence: 'Her cheeks glow bright pink.',
    wordHints: { cheeks: 'pipi', glow: 'bersinar', pink: 'merah muda' },
    translationNote: 'Pipinya merona merah muda cerah.',
  },
  {
    vocabId: 'v_7_chin',
    speakerId: 'v_7_chin',
    sentence: 'Hold your chin up high.',
    wordHints: { hold: 'angkat', chin: 'dagu', high: 'tinggi' },
    translationNote: 'Angkat dagumu tinggi-tinggi.',
  },
  {
    vocabId: 'v_7_mouth',
    speakerId: 'v_7_mouth',
    sentence: 'Open your mouth and say cheese!',
    wordHints: { open: 'buka', mouth: 'mulut', say: 'ucapkan' },
    translationNote: 'Buka mulutmu dan katakan cheese!',
  },
  {
    vocabId: 'v_7_tooth',
    speakerId: 'v_7_tooth',
    sentence: 'Brush your white teeth after meals.',
    wordHints: { brush: 'sikat', teeth: 'gigi', meals: 'makan' },
    translationNote: 'Sikat gigimu yang putih setelah makan.',
  },
  {
    vocabId: 'v_7_lip',
    speakerId: 'v_7_lip',
    sentence: 'A warm smile touches her lips.',
    wordHints: { smile: 'senyuman', touches: 'menghiasi', lips: 'bibir' },
    translationNote: 'Senyum hangat menghiasi bibirnya.',
  },

  // ---- PERSONAL INFORMATION ----
  {
    vocabId: 'v_5_name',
    speakerId: 'v_5_name',
    sentence: 'My name is written on this card.',
    wordHints: { name: 'nama', written: 'tertulis', card: 'kartu' },
    translationNote: 'Namaku tertulis di kartu ini.',
  },
  {
    vocabId: 'v_5_address',
    speakerId: 'v_5_address',
    sentence: 'Please write your home address.',
    wordHints: { please: 'silakan', write: 'tulis', address: 'alamat' },
    translationNote: 'Silakan tulis alamat rumahmu.',
  },
  {
    vocabId: 'v_5_birthday',
    speakerId: 'v_5_birthday',
    sentence: 'Happy birthday to my best friend!',
    wordHints: { happy: 'selamat', birthday: 'hari ulang tahun', friend: 'teman' },
    translationNote: 'Selamat ulang tahun untuk sahabatku!',
  },
  {
    vocabId: 'v_5_married',
    speakerId: 'v_5_married',
    sentence: 'My older sister is happily married.',
    wordHints: { sister: 'kakak perempuan', happily: 'bahagia', married: 'menikah' },
    translationNote: 'Kakak perempuanku sudah menikah dengan bahagia.',
  },
  {
    vocabId: 'v_5_passport',
    speakerId: 'v_5_passport',
    sentence: 'Do not forget your passport at home.',
    wordHints: { forget: 'lupa', passport: 'paspor', home: 'rumah' },
    translationNote: 'Jangan lupa paspormu di rumah.',
  },
  {
    vocabId: 'v_5_phone_number',
    speakerId: 'v_5_phone_number',
    sentence: 'Call my phone number this evening.',
    wordHints: { call: 'telepon', phone: 'telepon', number: 'nomor', evening: 'sore / malam' },
    translationNote: 'Hubungi nomor teleponku nanti sore.',
  },

  // ---- HELLO AND GOODBYE ----
  {
    vocabId: 'v_0_hello',
    speakerId: 'v_0_hello',
    sentence: 'Hello, my friend! How are you?',
    wordHints: { hello: 'halo', friend: 'teman', how: 'bagaimana' },
    translationNote: 'Halo, temanku! Apa kabarmu?',
  },
  {
    vocabId: 'v_0_goodbye',
    speakerId: 'v_0_goodbye',
    sentence: 'Goodbye and have a safe trip!',
    wordHints: { goodbye: 'selamat tinggal', safe: 'aman', trip: 'perjalanan' },
    translationNote: 'Selamat tinggal dan semoga perjalananmu aman!',
  },
  {
    vocabId: 'v_0_good_morning',
    speakerId: 'v_0_good_morning',
    sentence: 'Good morning! The sun is rising.',
    wordHints: { morning: 'pagi', sun: 'matahari', rising: 'terbit' },
    translationNote: 'Selamat pagi! Matahari sedang terbit.',
  },
  {
    vocabId: 'v_0_good_afternoon',
    speakerId: 'v_0_good_afternoon',
    sentence: 'Good afternoon under the bright sky!',
    wordHints: { afternoon: 'siang', bright: 'cerah', sky: 'langit' },
    translationNote: 'Selamat siang di bawah langit yang cerah!',
  },
  {
    vocabId: 'v_0_good_evening',
    speakerId: 'v_0_good_evening',
    sentence: 'Good evening as the street lights glow.',
    wordHints: { evening: 'malam / petang', lights: 'lampu', glow: 'menyala' },
    translationNote: 'Selamat malam saat lampu jalan mulai menyala.',
  },
  {
    vocabId: 'v_0_good_night',
    speakerId: 'v_0_good_night',
    sentence: 'Good night, sleep well under the moon.',
    wordHints: { night: 'tidur / malam', sleep: 'tidur', moon: 'bulan' },
    translationNote: 'Selamat tidur, tidurlah nyenyak di bawah rembulan.',
  },
  {
    vocabId: 'v_0_thank_you',
    speakerId: 'v_0_thank_you',
    sentence: 'Thank you very much for your kindness!',
    wordHints: { thank: 'terima kasih', much: 'banyak', kindness: 'kebaikan' },
    translationNote: 'Terima kasih banyak atas kebaikanmu!',
  },
  {
    vocabId: 'v_0_welcome',
    speakerId: 'v_0_welcome',
    sentence: 'Welcome home! Please come inside.',
    wordHints: { welcome: 'selamat datang', home: 'rumah', inside: 'ke dalam' },
    translationNote: 'Selamat datang di rumah! Silakan masuk.',
  },
  // ---- GREETINGS REMAINING (8) ----
  {
    vocabId: 'v_0_hi',
    speakerId: 'v_1_boy',
    sentence: 'Hi, how are you today?',
    wordHints: { hi: 'hai', how: 'apa kabar', today: 'hari ini' },
    translationNote: 'Hai, apa kabarmu hari ini?',
  },
  {
    vocabId: 'v_0_bye',
    speakerId: 'v_1_girl',
    sentence: 'Bye! See you tomorrow morning!',
    wordHints: { bye: 'sampai jumpa', tomorrow: 'besok', morning: 'pagi' },
    translationNote: 'Sampai jumpa! Ketemu lagi besok pagi!',
  },
  {
    vocabId: 'v_0_thanks',
    speakerId: 'v_1_friend',
    sentence: 'Thanks a lot, my good friend!',
    wordHints: { thanks: 'makasih', lot: 'banyak', friend: 'teman' },
    translationNote: 'Makasih banyak, teman baikku!',
  },
  {
    vocabId: 'v_0_please',
    speakerId: 'v_1_woman',
    sentence: 'Please help me open the door.',
    wordHints: { please: 'tolong / silakan', help: 'bantu', door: 'pintu' },
    translationNote: 'Tolong bantu saya membuka pintu.',
  },
  {
    vocabId: 'v_0_ok',
    speakerId: 'v_1_boy',
    sentence: 'OK, let us start right now!',
    wordHints: { ok: 'oke / baiklah', start: 'mulai', now: 'sekarang' },
    translationNote: 'Baiklah, ayo kita mulai sekarang!',
  },
  {
    vocabId: 'v_0_yes',
    speakerId: 'v_1_girl',
    sentence: 'Yes, I am ready to speak English!',
    wordHints: { yes: 'ya', ready: 'siap', speak: 'berbicara' },
    translationNote: 'Ya, saya siap berbicara bahasa Inggris!',
  },
  {
    vocabId: 'v_0_no',
    speakerId: 'v_1_man',
    sentence: 'No, that is not my passport.',
    wordHints: { no: 'tidak', not: 'bukan', passport: 'paspor' },
    translationNote: 'Tidak, itu bukan paspor saya.',
  },
  {
    vocabId: 'v_0_sorry',
    speakerId: 'v_1_boy',
    sentence: 'Sorry, I arrived a bit late.',
    wordHints: { sorry: 'maaf', arrived: 'tiba', late: 'terlambat' },
    translationNote: 'Maaf, saya tiba agak terlambat.',
  },
  // ---- PERSONAL INFO REMAINING (6) ----
  {
    vocabId: 'v_5_last_name',
    speakerId: 'v_1_mr',
    sentence: 'What is your family last name?',
    wordHints: { family: 'keluarga', last: 'belakang / marga', name: 'nama' },
    translationNote: 'Apa nama belakang keluargamu?',
  },
  {
    vocabId: 'v_5_age',
    speakerId: 'v_1_girl',
    sentence: 'My age is ten years old.',
    wordHints: { age: 'umur / usia', ten: 'sepuluh', years: 'tahun' },
    translationNote: 'Umur saya adalah sepuluh tahun.',
  },
  {
    vocabId: 'v_5_birthdate',
    speakerId: 'v_1_woman',
    sentence: 'Write your full birthdate on the form.',
    wordHints: { write: 'tulis', birthdate: 'tanggal lahir', form: 'formulir' },
    translationNote: 'Tulis tanggal lahir lengkapmu di formulir.',
  },
  {
    vocabId: 'v_5_single',
    speakerId: 'v_1_miss',
    sentence: 'My cousin is happy and still single.',
    wordHints: { cousin: 'sepupu', still: 'masih', single: 'lajang' },
    translationNote: 'Sepupu saya bahagia dan masih lajang.',
  },
  {
    vocabId: 'v_5_question',
    speakerId: 'v_1_woman',
    sentence: 'I have an easy question for you.',
    wordHints: { easy: 'mudah', question: 'pertanyaan' },
    translationNote: 'Saya punya pertanyaan mudah untukmu.',
  },
  {
    vocabId: 'v_5_answer',
    speakerId: 'v_1_boy',
    sentence: 'That is the right answer!',
    wordHints: { right: 'benar', answer: 'jawaban' },
    translationNote: 'Itu adalah jawaban yang benar!',
  },
  // ---- COLORS (14) ----
  {
    vocabId: 'v_4_black',
    speakerId: 'v_4_black',
    sentence: 'My hair is shiny black.',
    wordHints: { hair: 'rambut', shiny: 'berkilau', black: 'hitam' },
    translationNote: 'Rambut saya hitam berkilau.',
  },
  {
    vocabId: 'v_4_white',
    speakerId: 'v_4_white',
    sentence: 'The clouds look bright white.',
    wordHints: { clouds: 'awan', bright: 'cerah', white: 'putih' },
    translationNote: 'Awan itu tampak putih cerah.',
  },
  {
    vocabId: 'v_4_blue',
    speakerId: 'v_4_blue',
    sentence: 'The daytime sky is blue.',
    wordHints: { sky: 'langit', blue: 'biru' },
    translationNote: 'Langit siang hari berwarna biru.',
  },
  {
    vocabId: 'v_4_green',
    speakerId: 'v_4_green',
    sentence: 'Fresh grass in the yard is green.',
    wordHints: { grass: 'rumput', yard: 'halaman', green: 'hijau' },
    translationNote: 'Rumput segar di halaman berwarna hijau.',
  },
  {
    vocabId: 'v_4_yellow',
    speakerId: 'v_4_yellow',
    sentence: 'The morning sun shines bright yellow.',
    wordHints: { sun: 'matahari', shines: 'bersinar', yellow: 'kuning' },
    translationNote: 'Matahari pagi bersinar kuning cerah.',
  },
  {
    vocabId: 'v_4_red',
    speakerId: 'v_4_red',
    sentence: 'She brings a lovely red rose.',
    wordHints: { brings: 'membawa', red: 'merah', rose: 'mawar' },
    translationNote: 'Dia membawa mawar merah yang indah.',
  },
  {
    vocabId: 'v_4_pink',
    speakerId: 'v_4_pink',
    sentence: 'Her cheeks glow bright pink.',
    wordHints: { cheeks: 'pipi', pink: 'merah muda' },
    translationNote: 'Pipinya merona merah muda cerah.',
  },
  {
    vocabId: 'v_4_orange',
    speakerId: 'v_4_orange',
    sentence: 'The evening sunset is warm orange.',
    wordHints: { sunset: 'matahari terbenam', warm: 'hangat', orange: 'oranye' },
    translationNote: 'Senja sore hari berwarna oranye hangat.',
  },
  {
    vocabId: 'v_4_purple',
    speakerId: 'v_4_purple',
    sentence: 'I like that sweet purple flower.',
    wordHints: { like: 'suka', purple: 'ungu', flower: 'bunga' },
    translationNote: 'Saya suka bunga ungu yang manis itu.',
  },
  {
    vocabId: 'v_4_gray',
    speakerId: 'v_4_gray',
    sentence: 'Grandfather wears a neat gray suit.',
    wordHints: { grandfather: 'kakek', neat: 'rapi', gray: 'abu-abu' },
    translationNote: 'Kakek memakai setelan abu-abu yang rapi.',
  },
  {
    vocabId: 'v_4_brown',
    speakerId: 'v_4_brown',
    sentence: 'His eyes are warm brown.',
    wordHints: { eyes: 'mata', brown: 'cokelat' },
    translationNote: 'Matanya berwarna cokelat hangat.',
  },
  {
    vocabId: 'v_4_dark',
    speakerId: 'v_4_dark',
    sentence: 'The night sky becomes very dark.',
    wordHints: { night: 'malam', becomes: 'menjadi', dark: 'gelap' },
    translationNote: 'Langit malam menjadi sangat gelap.',
  },
  {
    vocabId: 'v_4_light',
    speakerId: 'v_4_light',
    sentence: 'She likes wearing light blue clothes.',
    wordHints: { wearing: 'memakai', light: 'terang / muda', blue: 'biru' },
    translationNote: 'Dia suka memakai pakaian biru muda.',
  },
  {
    vocabId: 'v_4_color',
    speakerId: 'v_4_color',
    sentence: 'Blue is my favorite color!',
    wordHints: { blue: 'biru', favorite: 'kesukaan', color: 'warna' },
    translationNote: 'Biru adalah warna kesukaanku!',
  },
  // ---- NUMBERS 0..100 (29) ----
  { vocabId: 'v_2_zero', speakerId: 'v_2_zero', sentence: 'Zero mistakes today!', wordHints: { zero: 'nol', mistakes: 'kesalahan' }, translationNote: 'Nol kesalahan hari ini!' },
  { vocabId: 'v_2_one', speakerId: 'v_2_one', sentence: 'I have one big family.', wordHints: { one: 'satu', family: 'keluarga' }, translationNote: 'Saya punya satu keluarga besar.' },
  { vocabId: 'v_2_two', speakerId: 'v_2_two', sentence: 'We have two eyes and two ears.', wordHints: { two: 'dua', eyes: 'mata', ears: 'telinga' }, translationNote: 'Kita punya dua mata dan dua telinga.' },
  { vocabId: 'v_2_three', speakerId: 'v_2_three', sentence: 'Count from one to three!', wordHints: { count: 'hitung', one: 'satu', three: 'tiga' }, translationNote: 'Hitung dari satu sampai tiga!' },
  { vocabId: 'v_2_four', speakerId: 'v_2_four', sentence: 'There are four people in my house.', wordHints: { four: 'empat', people: 'orang' }, translationNote: 'Ada empat orang di rumahku.' },
  { vocabId: 'v_2_five', speakerId: 'v_2_five', sentence: 'I have five fingers on each hand.', wordHints: { five: 'lima', fingers: 'jari', hand: 'tangan' }, translationNote: 'Saya punya lima jari di setiap tangan.' },
  { vocabId: 'v_2_six', speakerId: 'v_2_six', sentence: 'The clock strikes six in the morning.', wordHints: { clock: 'jam', six: 'enam', morning: 'pagi' }, translationNote: 'Jam berdentang enam kali di pagi hari.' },
  { vocabId: 'v_2_seven', speakerId: 'v_2_seven', sentence: 'Seven colorful flags wave outside.', wordHints: { seven: 'tujuh', flags: 'bendera' }, translationNote: 'Tujuh bendera warna-warni berkibar di luar.' },
  { vocabId: 'v_2_eight', speakerId: 'v_2_eight', sentence: 'My school starts at eight.', wordHints: { school: 'sekolah', starts: 'mulai', eight: 'delapan' }, translationNote: 'Sekolahku mulai pukul delapan.' },
  { vocabId: 'v_2_nine', speakerId: 'v_2_nine', sentence: 'My little brother is nine years old.', wordHints: { brother: 'adik', nine: 'sembilan' }, translationNote: 'Adik laki-lakiku berumur sembilan tahun.' },
  { vocabId: 'v_2_ten', speakerId: 'v_2_ten', sentence: 'Count from one to ten now!', wordHints: { count: 'hitung', ten: 'sepuluh' }, translationNote: 'Hitung dari satu sampai sepuluh sekarang!' },
  { vocabId: 'v_2_eleven', speakerId: 'v_2_eleven', sentence: 'My home number is eleven.', wordHints: { home: 'rumah', number: 'nomor', eleven: 'sebelas' }, translationNote: 'Nomor rumahku adalah sebelas.' },
  { vocabId: 'v_2_twelve', speakerId: 'v_2_twelve', sentence: 'There are twelve months every year.', wordHints: { twelve: 'dua belas', months: 'bulan', year: 'tahun' }, translationNote: 'Ada dua belas bulan setiap tahun.' },
  { vocabId: 'v_2_thirteen', speakerId: 'v_2_thirteen', sentence: 'My cousin is thirteen years old.', wordHints: { cousin: 'sepupu', thirteen: 'tiga belas' }, translationNote: 'Sepupuku berumur tiga belas tahun.' },
  { vocabId: 'v_2_fourteen', speakerId: 'v_2_fourteen', sentence: 'Fourteen students wave hello.', wordHints: { fourteen: 'empat belas', students: 'murid' }, translationNote: 'Empat belas murid melambaikan halo.' },
  { vocabId: 'v_2_fifteen', speakerId: 'v_2_fifteen', sentence: 'Wait for fifteen minutes, please.', wordHints: { wait: 'tunggu', fifteen: 'lima belas', minutes: 'menit' }, translationNote: 'Tolong tunggu selama lima belas menit.' },
  { vocabId: 'v_2_sixteen', speakerId: 'v_2_sixteen', sentence: 'Sixteen cookies are on the plate.', wordHints: { sixteen: 'enam belas', cookies: 'kue' }, translationNote: 'Enam belas kue ada di piring.' },
  { vocabId: 'v_2_seventeen', speakerId: 'v_2_seventeen', sentence: 'Seventeen bright stars shine tonight.', wordHints: { seventeen: 'tujuh belas', stars: 'bintang' }, translationNote: 'Tujuh belas bintang cerah bersinar malam ini.' },
  { vocabId: 'v_2_eighteen', speakerId: 'v_2_eighteen', sentence: 'My big sister is eighteen today!', wordHints: { sister: 'kakak', eighteen: 'delapan belas' }, translationNote: 'Kakak perempuanku berumur delapan belas hari ini!' },
  { vocabId: 'v_2_nineteen', speakerId: 'v_2_nineteen', sentence: 'Nineteen friends came to my party.', wordHints: { nineteen: 'sembilan belas', party: 'pesta' }, translationNote: 'Sembilan belas teman datang ke pestaku.' },
  { vocabId: 'v_2_twenty', speakerId: 'v_2_twenty', sentence: 'There are twenty houses in our village.', wordHints: { twenty: 'dua puluh', houses: 'rumah', village: 'desa' }, translationNote: 'Ada dua puluh rumah di desa kita.' },
  { vocabId: 'v_2_thirty', speakerId: 'v_2_thirty', sentence: 'My uncle is thirty years old.', wordHints: { uncle: 'paman', thirty: 'tiga puluh' }, translationNote: 'Pamanku berumur tiga puluh tahun.' },
  { vocabId: 'v_2_forty', speakerId: 'v_2_forty', sentence: 'Forty people gather in the square.', wordHints: { forty: 'empat puluh', gather: 'berkumpul' }, translationNote: 'Empat puluh orang berkumpul di alun-alun.' },
  { vocabId: 'v_2_fifty', speakerId: 'v_2_fifty', sentence: 'Number fifty is on the blue door.', wordHints: { number: 'nomor', fifty: 'lima puluh', door: 'pintu' }, translationNote: 'Nomor lima puluh ada di pintu biru.' },
  { vocabId: 'v_2_sixty', speakerId: 'v_2_sixty', sentence: 'One hour has sixty minutes.', wordHints: { hour: 'jam', sixty: 'enam puluh', minutes: 'menit' }, translationNote: 'Satu jam memiliki enam puluh menit.' },
  { vocabId: 'v_2_seventy', speakerId: 'v_2_seventy', sentence: 'Grandmother is seventy years old.', wordHints: { grandmother: 'nenek', seventy: 'tujuh puluh' }, translationNote: 'Nenek berusia tujuh puluh tahun.' },
  { vocabId: 'v_2_eighty', speakerId: 'v_2_eighty', sentence: 'Grandfather smiled at age eighty.', wordHints: { grandfather: 'kakek', eighty: 'delapan puluh' }, translationNote: 'Kakek tersenyum di usia delapan puluh.' },
  { vocabId: 'v_2_ninety', speakerId: 'v_2_ninety', sentence: 'Her score jumped to ninety!', wordHints: { score: 'nilai', ninety: 'sembilan puluh' }, translationNote: 'Nilainya melonjak ke sembilan puluh!' },
  { vocabId: 'v_2_hundred', speakerId: 'v_2_hundred', sentence: 'You get one hundred points!', wordHints: { one: 'satu', hundred: 'seratus', points: 'poin' }, translationNote: 'Kamu mendapat seratus poin!' },
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

  // ---- THE BODY ----
  {
    vocabId: 'v_6_hand',
    speakerAId: 'v_3_mom',
    speakerAName: 'Mama',
    speakerALine: 'Dinner is ready! Are you clean?',
    speakerAHints: { dinner: 'makan malam', ready: 'siap', clean: 'bersih' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Bimo',
    correctReply: 'Yes, I washed both my hands!',
    distractorReplies: ['Yes, my back is a hat!', 'Goodbye, stomach!'],
    translationNote: 'Ya, aku sudah mencuci kedua tanganku!',
  },
  {
    vocabId: 'v_6_arm',
    speakerAId: 'v_1_boy',
    speakerAName: 'Adi',
    speakerALine: 'Wow, can you lift that heavy box?',
    speakerAHints: { lift: 'mengangkat', heavy: 'berat', box: 'kotak' },
    speakerBId: 'v_1_man',
    speakerBName: 'Kak Rian',
    correctReply: 'Sure! My arms are strong!',
    distractorReplies: ['No, my knee is a book!', 'Good morning, hand!'],
    translationNote: 'Tentu! Lenganku kuat!',
  },
  {
    vocabId: 'v_6_head',
    speakerAId: 'v_1_girl',
    speakerAName: 'Lina',
    speakerALine: 'Where do you wear your helmet?',
    speakerAHints: { where: 'di mana', wear: 'memakai', helmet: 'helm' },
    speakerBId: 'v_6_head',
    speakerBName: 'Tobi',
    correctReply: 'I put it on my head!',
    distractorReplies: ['I put it on my stomach!', 'She is my sister.'],
    translationNote: 'Aku memakainya di kepalaku!',
  },
  {
    vocabId: 'v_6_knee',
    speakerAId: 'v_3_dad',
    speakerAName: 'Papa',
    speakerALine: 'Why did you stop running, buddy?',
    speakerAHints: { why: 'mengapa', stop: 'berhenti', running: 'berlari' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Raka',
    correctReply: 'I fell and hurt my knee.',
    distractorReplies: ['I hurt my grandmother.', 'Thank you, leg!'],
    translationNote: 'Aku terjatuh dan lututku terluka.',
  },
  {
    vocabId: 'v_6_stomach',
    speakerAId: 'v_3_grandmother',
    speakerAName: 'Nenek',
    speakerALine: 'Do you want another warm cookie?',
    speakerAHints: { want: 'ingin', another: 'lagi', cookie: 'kue' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Fajar',
    correctReply: 'No thanks, my stomach is full!',
    distractorReplies: ['No thanks, my head is tall!', 'Hello, my arm!'],
    translationNote: 'Tidak terima kasih, perutku sudah kenyang!',
  },
  {
    vocabId: 'v_6_foot',
    speakerAId: 'v_1_woman',
    speakerAName: 'Ibu Guru',
    speakerALine: 'Ready for the race? Lace up your shoes!',
    speakerAHints: { race: 'lomba lari', lace: 'ikat', shoes: 'sepatu' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Sinta',
    correctReply: 'Ready! My feet are fast today!',
    distractorReplies: ['Ready! My back is sleeping!', 'Welcome, body!'],
    translationNote: 'Siap! Kakiku cepat hari ini!',
  },

  // ---- THE HEAD AND FACE ----
  {
    vocabId: 'v_7_hair',
    speakerAId: 'v_3_mother',
    speakerAName: 'Ibu',
    speakerALine: 'Before school, please tidy up your head!',
    speakerAHints: { before: 'sebelum', tidy: 'rapikan', head: 'kepala' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Dina',
    correctReply: 'Yes Mom, I already brushed my hair.',
    distractorReplies: ['Yes Mom, I brushed my knee.', 'My ear is brown!'],
    translationNote: 'Ya Bu, aku sudah menyisir rambutku.',
  },
  {
    vocabId: 'v_7_neck',
    speakerAId: 'v_3_father',
    speakerAName: 'Ayah',
    speakerALine: 'It is chilly outside tonight!',
    speakerAHints: { chilly: 'dingin', outside: 'di luar', tonight: 'malam ini' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Raka',
    correctReply: 'I will wrap a scarf around my neck.',
    distractorReplies: ['I will put shoes on my nose.', 'Thank you, tooth!'],
    translationNote: 'Aku akan melilitkan syal di leherku.',
  },
  {
    vocabId: 'v_7_face',
    speakerAId: 'v_3_mom',
    speakerAName: 'Mama',
    speakerALine: 'Good morning! You just woke up.',
    speakerAHints: { morning: 'pagi', woke: 'bangun' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Bimo',
    correctReply: 'Morning! Let me wash my face first.',
    distractorReplies: ['Morning! Let me wash my chin.', 'My cheek is my uncle!'],
    translationNote: 'Pagi! Biar kucuci wajahku dulu.',
  },
  {
    vocabId: 'v_7_eye',
    speakerAId: 'v_1_girl',
    speakerAName: 'Lala',
    speakerALine: 'Look up at that bright rainbow!',
    speakerAHints: { look: 'lihat', bright: 'cerah', rainbow: 'pelangi' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Dani',
    correctReply: 'Wow, I can see it clearly with my eyes!',
    distractorReplies: ['Wow, I hear it with my teeth!', 'Goodbye, mouth!'],
    translationNote: 'Wah, aku bisa melihatnya jelas dengan mataku!',
  },
  {
    vocabId: 'v_7_nose',
    speakerAId: 'v_3_grandmother',
    speakerAName: 'Nenek',
    speakerALine: 'Something smells delicious in the kitchen!',
    speakerAHints: { smells: 'tercium', delicious: 'enak', kitchen: 'dapur' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Sinta',
    correctReply: 'My nose smells freshly baked cookies!',
    distractorReplies: ['My ear smells warm soup!', 'My lips are tall!'],
    translationNote: 'Hidungku mencium aroma kue yang baru matang!',
  },
  {
    vocabId: 'v_7_ear',
    speakerAId: 'v_1_man',
    speakerAName: 'Pak Guru',
    speakerALine: 'Can you hear the quiet bell ringing?',
    speakerAHints: { hear: 'mendengar', quiet: 'pelan', bell: 'lonceng' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Nadia',
    correctReply: 'Yes, my ears hear the bell clearly.',
    distractorReplies: ['Yes, my nose hears the bell.', 'My neck is singing!'],
    translationNote: 'Ya, telingaku mendengar lonceng itu dengan jelas.',
  },
  {
    vocabId: 'v_7_cheek',
    speakerAId: 'v_3_aunt',
    speakerAName: 'Bibi',
    speakerALine: 'Why are you blushing so happily?',
    speakerAHints: { why: 'mengapa', blushing: 'merona', happily: 'gembira' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Maya',
    correctReply: 'I smiled so much that my cheeks turned pink!',
    distractorReplies: ['My knee turned pink!', 'Hello, hair!'],
    translationNote: 'Aku banyak tersenyum sampai pipiku memerah muda!',
  },
  {
    vocabId: 'v_7_chin',
    speakerAId: 'v_1_woman',
    speakerAName: 'Dokter',
    speakerALine: 'Let me check your throat gently.',
    speakerAHints: { check: 'periksa', throat: 'tenggorokan', gently: 'perlahan' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Fajar',
    correctReply: 'Okay, I will lift up my chin.',
    distractorReplies: ['Okay, I will lift up my stomach.', 'See you, cheek!'],
    translationNote: 'Baik, aku akan mengangkat daguku.',
  },
  {
    vocabId: 'v_7_mouth',
    speakerAId: 'v_1_woman',
    speakerAName: 'Ibu Guru',
    speakerALine: 'Time to practice singing our greeting song!',
    speakerAHints: { practice: 'latihan', singing: 'bernyanyi', song: 'lagu' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Rani',
    correctReply: 'Let us open our mouths and sing loudly!',
    distractorReplies: ['Let us open our noses!', 'My hair is sleepy!'],
    translationNote: 'Ayo buka mulut kita dan bernyanyi dengan lantang!',
  },
  {
    vocabId: 'v_7_tooth',
    speakerAId: 'v_3_dad',
    speakerAName: 'Papa',
    speakerALine: 'It is almost bedtime. Are you ready to sleep?',
    speakerAHints: { bedtime: 'jam tidur', ready: 'siap', sleep: 'tidur' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Bimo',
    correctReply: 'Almost! I am brushing my teeth first.',
    distractorReplies: ['Almost! I am brushing my chin.', 'Thank you, ear!'],
    translationNote: 'Hampir! Aku sedang menyikat gigiku dulu.',
  },
  {
    vocabId: 'v_7_lip',
    speakerAId: 'v_1_girl',
    speakerAName: 'Sari',
    speakerALine: 'The wind is very dry today.',
    speakerAHints: { wind: 'angin', dry: 'kering', today: 'hari ini' },
    speakerBId: 'v_1_woman',
    speakerBName: 'Kakak',
    correctReply: 'Drink water to keep your lips soft!',
    distractorReplies: ['Drink water to keep your hair fast!', 'Hello, chin!'],
    translationNote: 'Minumlah air agar bibirmu tetap lembut!',
  },

  // ---- PERSONAL INFORMATION ----
  {
    vocabId: 'v_5_name',
    speakerAId: 'v_1_woman',
    speakerAName: 'Ibu Guru',
    speakerALine: 'Welcome to our village! May I ask your name?',
    speakerAHints: { welcome: 'selamat datang', ask: 'bertanya', name: 'nama' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Bimo',
    correctReply: 'Sure! My name is Bimo.',
    distractorReplies: ['Sure! My passport is blue.', 'My birthday is a cake!'],
    translationNote: 'Tentu! Nama saya adalah Bimo.',
  },
  {
    vocabId: 'v_5_address',
    speakerAId: 'v_1_man',
    speakerAName: 'Kurir',
    speakerALine: 'I have a gift letter for you! Where should I send it?',
    speakerAHints: { letter: 'surat', where: 'ke mana', send: 'kirim' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Sinta',
    correctReply: 'Please send it to my home address.',
    distractorReplies: ['Please send it to my phone number.', 'I am married today!'],
    translationNote: 'Tolong kirimkan ke alamat rumahku.',
  },
  {
    vocabId: 'v_5_birthday',
    speakerAId: 'v_1_friend',
    speakerAName: 'Teman',
    speakerALine: 'Why is there a colorful cake with candles on the table?',
    speakerAHints: { colorful: 'warna-warni', cake: 'kue', candles: 'lilin' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Dina',
    correctReply: 'Because today is my birthday!',
    distractorReplies: ['Because today is my passport!', 'My name is seven!'],
    translationNote: 'Karena hari ini adalah hari ulang tahunku!',
  },
  {
    vocabId: 'v_5_married',
    speakerAId: 'v_3_aunt',
    speakerAName: 'Bibi',
    speakerALine: 'Look at those two shiny gold rings!',
    speakerAHints: { look: 'lihat', shiny: 'berkilau', rings: 'cincin' },
    speakerBId: 'v_1_woman',
    speakerBName: 'Sari',
    correctReply: 'Yes! My brother and his wife just got married.',
    distractorReplies: ['Yes! My address just got married.', 'Call my cake!'],
    translationNote: 'Ya! Kakakku dan istrinya baru saja menikah.',
  },
  {
    vocabId: 'v_5_passport',
    speakerAId: 'v_1_man',
    speakerAName: 'Petugas',
    speakerALine: 'Are you ready for your flight to another country?',
    speakerAHints: { ready: 'siap', flight: 'penerbangan', country: 'negara' },
    speakerBId: 'v_1_woman',
    speakerBName: 'Ibu Rina',
    correctReply: 'Yes, I already packed my passport!',
    distractorReplies: ['Yes, I already packed my birthday!', 'My phone is married!'],
    translationNote: 'Ya, saya sudah membawa paspor saya!',
  },
  {
    vocabId: 'v_5_phone_number',
    speakerAId: 'v_1_boy',
    speakerAName: 'Raka',
    speakerALine: 'How can I call you when we get to the town square?',
    speakerAHints: { how: 'bagaimana', call: 'menghubungi', town: 'kota' },
    speakerBId: 'v_1_friend',
    speakerBName: 'Dani',
    correctReply: 'Here, write down my phone number!',
    distractorReplies: ['Here, wear my passport!', 'My birthday is an envelope!'],
    translationNote: 'Ini, catat nomor teleponku!',
  },

  // ---- HELLO AND GOODBYE ----
  {
    vocabId: 'v_0_hello',
    speakerAId: 'v_1_woman',
    speakerAName: 'Sari',
    speakerALine: 'We just met at the village gate!',
    speakerAHints: { met: 'bertemu', village: 'desa', gate: 'gerbang' },
    speakerBId: 'v_1_man',
    speakerBName: 'Budi',
    correctReply: 'Hello! So happy to see you today!',
    distractorReplies: ['Good night, let us sleep!', 'My address is a cake!'],
    translationNote: 'Halo! Senang sekali bertemu denganmu hari ini!',
  },
  {
    vocabId: 'v_0_goodbye',
    speakerAId: 'v_1_boy',
    speakerAName: 'Raka',
    speakerALine: 'I have my backpack on. My bus is leaving now!',
    speakerAHints: { backpack: 'ransel', leaving: 'berangkat', now: 'sekarang' },
    speakerBId: 'v_1_friend',
    speakerBName: 'Bimo',
    correctReply: 'Goodbye! See you again soon!',
    distractorReplies: ['Welcome home right now!', 'Good morning, sleep well!'],
    translationNote: 'Selamat tinggal! Sampai bertemu lagi segera!',
  },
  {
    vocabId: 'v_0_good_morning',
    speakerAId: 'v_3_mother',
    speakerAName: 'Ibu',
    speakerALine: 'The golden sun is rising and warm tea is ready!',
    speakerAHints: { golden: 'keemasan', rising: 'terbit', tea: 'teh' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Dani',
    correctReply: 'Good morning, Mom! I feel full of energy!',
    distractorReplies: ['Good night, Mom! Time for bed!', 'Goodbye, my pillow!'],
    translationNote: 'Selamat pagi, Bu! Aku merasa penuh semangat!',
  },
  {
    vocabId: 'v_0_good_afternoon',
    speakerAId: 'v_1_man',
    speakerAName: 'Pak Guru',
    speakerALine: 'The sun is high in the blue sky at one o’clock.',
    speakerAHints: { high: 'tinggi', blue: 'biru', sky: 'langit' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Sinta',
    correctReply: 'Good afternoon, Sir! What a bright day!',
    distractorReplies: ['Good night, Sir! See the moon!', 'Good evening under the stars!'],
    translationNote: 'Selamat siang, Pak! Sungguh hari yang cerah!',
  },
  {
    vocabId: 'v_0_good_evening',
    speakerAId: 'v_3_grandfather',
    speakerAName: 'Kakek',
    speakerALine: 'Look, the sunset sky is orange and the street lamps are glowing.',
    speakerAHints: { sunset: 'matahari terbenam', lamps: 'lampu', glowing: 'menyala' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Dina',
    correctReply: 'Good evening, Grandpa! Let us take a walk.',
    distractorReplies: ['Good morning! Wake up now!', 'Good afternoon at noon!'],
    translationNote: 'Selamat malam, Kakek! Ayo kita jalan-jalan.',
  },
  {
    vocabId: 'v_0_good_night',
    speakerAId: 'v_3_dad',
    speakerAName: 'Papa',
    speakerALine: 'The crescent moon is up and you look sleepy in bed.',
    speakerAHints: { moon: 'bulan', sleepy: 'mengantuk', bed: 'tempat tidur' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Fajar',
    correctReply: 'Good night, Dad! Sweet dreams!',
    distractorReplies: ['Good afternoon, Dad! Let us play soccer!', 'Welcome to the morning sun!'],
    translationNote: 'Selamat tidur, Papa! Mimpi indah!',
  },
  {
    vocabId: 'v_0_thank_you',
    speakerAId: 'v_1_woman',
    speakerAName: 'Nadia',
    speakerALine: 'Here is a special gift box and flowers for you!',
    speakerAHints: { special: 'spesial', gift: 'hadiah', flowers: 'bunga' },
    speakerBId: 'v_1_man',
    speakerBName: 'Arif',
    correctReply: 'Thank you so much! That is very kind!',
    distractorReplies: ['Good night, sleep in bed!', 'Goodbye forever, gift!'],
    translationNote: 'Terima kasih banyak! Itu sangat baik sekali!',
  },
  {
    vocabId: 'v_0_welcome',
    speakerAId: 'v_1_friend',
    speakerAName: 'Tamu',
    speakerALine: 'Knock, knock! I have arrived at your front door.',
    speakerAHints: { knock: 'tok tok', arrived: 'tiba', door: 'pintu' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Bimo',
    correctReply: 'Welcome! Come right inside our house!',
    distractorReplies: ['Good night! Close the moon!', 'Goodbye! Leave the gate!'],
    translationNote: 'Selamat datang! Silakan langsung masuk ke rumah kami!',
  },
  // ---- GREETINGS REMAINING (8) ----
  {
    vocabId: 'v_0_hi',
    speakerAId: 'v_1_boy',
    speakerAName: 'Bimo',
    speakerALine: 'Hi! Good to see you at the market!',
    speakerAHints: { hi: 'hai', market: 'pasar' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Lina',
    correctReply: 'Hi, Bimo! How are you?',
    distractorReplies: ['Good night, sleep well!', 'Number fifty, please!'],
    translationNote: 'Hai, Bimo! Apa kabarmu?',
  },
  {
    vocabId: 'v_0_bye',
    speakerAId: 'v_1_friend',
    speakerAName: 'Rani',
    speakerALine: 'The bus is leaving now. I have to go!',
    speakerAHints: { leaving: 'berangkat', now: 'sekarang' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Adi',
    correctReply: 'Bye! See you tomorrow!',
    distractorReplies: ['Welcome inside!', 'My favorite color is red!'],
    translationNote: 'Sampai jumpa! Ketemu besok!',
  },
  {
    vocabId: 'v_0_thanks',
    speakerAId: 'v_1_girl',
    speakerAName: 'Sinta',
    speakerALine: 'Here is a cup of warm tea for you!',
    speakerAHints: { warm: 'hangat', tea: 'teh' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Dani',
    correctReply: 'Thanks! You are so kind!',
    distractorReplies: ['Sorry, my tooth hurts!', 'Bye, number zero!'],
    translationNote: 'Makasih! Kamu sangat baik!',
  },
  {
    vocabId: 'v_0_please',
    speakerAId: 'v_1_woman',
    speakerAName: 'Ibu Guru',
    speakerALine: 'May I open the classroom window?',
    speakerAHints: { open: 'buka', window: 'jendela' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Raka',
    correctReply: 'Yes, please open it!',
    distractorReplies: ['No, my birthday is blue!', 'Goodbye, cheeks!'],
    translationNote: 'Ya, silakan buka saja!',
  },
  {
    vocabId: 'v_0_ok',
    speakerAId: 'v_1_man',
    speakerAName: 'Pak Budi',
    speakerALine: 'Let us practice ten words together!',
    speakerAHints: { practice: 'latihan', words: 'kata' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Nadia',
    correctReply: 'OK! Let us start right now!',
    distractorReplies: ['Goodbye, father!', 'My nose is purple!'],
    translationNote: 'Baiklah! Ayo kita mulai sekarang!',
  },
  {
    vocabId: 'v_0_yes',
    speakerAId: 'v_1_woman',
    speakerAName: 'Nadia',
    speakerALine: 'Are you ready for the adventure?',
    speakerAHints: { ready: 'siap', adventure: 'petualangan' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Bimo',
    correctReply: 'Yes, I am completely ready!',
    distractorReplies: ['Good evening, knee!', 'Sorry, eighty cookies.'],
    translationNote: 'Ya, aku benar-benar siap!',
  },
  {
    vocabId: 'v_0_no',
    speakerAId: 'v_1_boy',
    speakerAName: 'Fajar',
    speakerALine: 'Is this black bag yours?',
    speakerAHints: { black: 'hitam', bag: 'tas' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Dina',
    correctReply: 'No, my bag is blue.',
    distractorReplies: ['Yes, I am a baby!', 'Good morning, stomach!'],
    translationNote: 'Tidak, tasku berwarna biru.',
  },
  {
    vocabId: 'v_0_sorry',
    speakerAId: 'v_1_girl',
    speakerAName: 'Rani',
    speakerALine: 'Oops, you stepped on my shoe!',
    speakerAHints: { stepped: 'menginjak', shoe: 'sepatu' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Tobi',
    correctReply: 'Oh, sorry! I did not see it.',
    distractorReplies: ['Welcome, purple nose!', 'Happy birthday to ninety!'],
    translationNote: 'Oh, maaf! Aku tidak melihatnya.',
  },
  // ---- PERSONAL INFO REMAINING (6) ----
  {
    vocabId: 'v_5_last_name',
    speakerAId: 'v_1_mr',
    speakerAName: 'Petugas',
    speakerALine: 'Your first name is Bimo. What is your last name?',
    speakerAHints: { first: 'depan', last: 'belakang / marga' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Bimo',
    correctReply: 'My last name is Pratama.',
    distractorReplies: ['My last name is green.', 'Yes, ten knees!'],
    translationNote: 'Nama belakang saya adalah Pratama.',
  },
  {
    vocabId: 'v_5_age',
    speakerAId: 'v_1_woman',
    speakerAName: 'Ibu Sari',
    speakerALine: 'Look at those ten candles! What is your age today?',
    speakerAHints: { candles: 'lilin', age: 'umur / usia' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Lina',
    correctReply: 'My age is ten years old!',
    distractorReplies: ['My age is a blue passport!', 'Good night, answer!'],
    translationNote: 'Umur saya sepuluh tahun hari ini!',
  },
  {
    vocabId: 'v_5_birthdate',
    speakerAId: 'v_1_woman',
    speakerAName: 'Staf Desa',
    speakerALine: 'Could you share your full birthdate for our list?',
    speakerAHints: { share: 'berbagi', birthdate: 'tanggal lahir', list: 'daftar' },
    speakerBId: 'v_1_man',
    speakerBName: 'Raka',
    correctReply: 'Sure, my birthdate is May 12, 2005.',
    distractorReplies: ['Sure, my birthdate is yellow.', 'Bye, thank you chin!'],
    translationNote: 'Tentu, tanggal lahir saya 12 Mei 2005.',
  },
  {
    vocabId: 'v_5_single',
    speakerAId: 'v_3_aunt',
    speakerAName: 'Bibi',
    speakerALine: 'Does your big brother have a wife yet?',
    speakerAHints: { big: 'kakak', wife: 'istri', yet: 'sudah' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Maya',
    correctReply: 'Not yet, he is still single.',
    distractorReplies: ['Yes, he is one hundred.', 'No, my birthday is dark.'],
    translationNote: 'Belum, dia masih lajang.',
  },
  {
    vocabId: 'v_5_question',
    speakerAId: 'v_1_boy',
    speakerAName: 'Adi',
    speakerALine: 'Raise your hand if you do not understand!',
    speakerAHints: { raise: 'angkat', understand: 'mengerti' },
    speakerBId: 'v_1_girl',
    speakerBName: 'Sinta',
    correctReply: 'Excuse me, I have a question!',
    distractorReplies: ['Excuse me, I am brown!', 'Good night, passport!'],
    translationNote: 'Permisi, saya punya pertanyaan!',
  },
  {
    vocabId: 'v_5_answer',
    speakerAId: 'v_1_woman',
    speakerAName: 'Ibu Guru',
    speakerALine: 'Who knows the right answer to this riddle?',
    speakerAHints: { knows: 'tahu', answer: 'jawaban', riddle: 'teka-teki' },
    speakerBId: 'v_1_boy',
    speakerBName: 'Bimo',
    correctReply: 'Me! I know the correct answer!',
    distractorReplies: ['Me! My address is purple!', 'Sorry, twelve feet!'],
    translationNote: 'Saya! Saya tahu jawaban yang benar!',
  },
  // ---- COLORS (14) ----
  {
    vocabId: 'v_4_black',
    speakerAId: 'v_1_girl',
    speakerAName: 'Dina',
    speakerALine: 'Look at that crow in the tree! What color is it?',
    speakerAHints: { crow: 'gagak', color: 'warna' },
    speakerBId: 'v_4_black',
    speakerBName: 'Raka',
    correctReply: 'That crow is pitch black!',
    distractorReplies: ['That crow is pink!', 'No, two mothers!'],
    translationNote: 'Burung gagak itu berwarna hitam pekat!',
  },
  {
    vocabId: 'v_4_white',
    speakerAId: 'v_1_boy',
    speakerAName: 'Bimo',
    speakerALine: 'What color is fresh milk in the glass?',
    speakerAHints: { milk: 'susu', glass: 'gelas' },
    speakerBId: 'v_4_white',
    speakerBName: 'Lina',
    correctReply: 'Fresh milk is pure white!',
    distractorReplies: ['Fresh milk is black!', 'Goodbye, eighty!'],
    translationNote: 'Susu segar berwarna putih bersih!',
  },
  {
    vocabId: 'v_4_blue',
    speakerAId: 'v_1_man',
    speakerAName: 'Pak Budi',
    speakerALine: 'Look up! What color is the clear ocean and sky?',
    speakerAHints: { clear: 'cerah', ocean: 'lautan', sky: 'langit' },
    speakerBId: 'v_4_blue',
    speakerBName: 'Sinta',
    correctReply: 'Both are bright blue!',
    distractorReplies: ['Both are brown!', 'Yes, my chin is ten.'],
    translationNote: 'Keduanya berwarna biru cerah!',
  },
  {
    vocabId: 'v_4_green',
    speakerAId: 'v_1_woman',
    speakerAName: 'Ibu',
    speakerALine: 'The garden is full of healthy leaves!',
    speakerAHints: { garden: 'taman', leaves: 'daun' },
    speakerBId: 'v_4_green',
    speakerBName: 'Adi',
    correctReply: 'Yes! Everything looks fresh green!',
    distractorReplies: ['Yes! Everything looks orange.', 'My name is zero.'],
    translationNote: 'Ya! Semuanya tampak hijau segar!',
  },
  {
    vocabId: 'v_4_yellow',
    speakerAId: 'v_1_girl',
    speakerAName: 'Maya',
    speakerALine: 'What color are ripe lemons and the sun?',
    speakerAHints: { ripe: 'matang', lemons: 'lemon' },
    speakerBId: 'v_4_yellow',
    speakerBName: 'Fajar',
    correctReply: 'They are bright yellow!',
    distractorReplies: ['They are dark gray!', 'Thank you, birthdate!'],
    translationNote: 'Mereka berwarna kuning cerah!',
  },
  {
    vocabId: 'v_4_red',
    speakerAId: 'v_1_boy',
    speakerAName: 'Arya',
    speakerALine: 'What color are sweet strawberries and tomatoes?',
    speakerAHints: { sweet: 'manis', tomatoes: 'tomat' },
    speakerBId: 'v_4_red',
    speakerBName: 'Rani',
    correctReply: 'They are bright red!',
    distractorReplies: ['They are purple!', 'No, please sit down.'],
    translationNote: 'Mereka berwarna merah cerah!',
  },
  {
    vocabId: 'v_4_pink',
    speakerAId: 'v_1_girl',
    speakerAName: 'Sinta',
    speakerALine: 'Look at your strawberry ice cream cone!',
    speakerAHints: { ice: 'es', cream: 'krim' },
    speakerBId: 'v_4_pink',
    speakerBName: 'Lina',
    correctReply: 'Yes, strawberry ice cream is pink!',
    distractorReplies: ['Yes, it is pitch black!', 'Good night, thirty!'],
    translationNote: 'Ya, es krim stroberi berwarna merah muda!',
  },
  {
    vocabId: 'v_4_orange',
    speakerAId: 'v_1_woman',
    speakerAName: 'Mama',
    speakerALine: 'What color are fresh carrots in the basket?',
    speakerAHints: { carrots: 'wortel', basket: 'keranjang' },
    speakerBId: 'v_4_orange',
    speakerBName: 'Bimo',
    correctReply: 'Fresh carrots are bright orange!',
    distractorReplies: ['Fresh carrots are blue!', 'Sorry, my passport hurts.'],
    translationNote: 'Wortel segar berwarna oranye cerah!',
  },
  {
    vocabId: 'v_4_purple',
    speakerAId: 'v_1_girl',
    speakerAName: 'Nadia',
    speakerALine: 'Which crayon mixes red and blue together?',
    speakerAHints: { mixes: 'mencampur', together: 'bersama' },
    speakerBId: 'v_4_purple',
    speakerBName: 'Dina',
    correctReply: 'Red and blue make purple!',
    distractorReplies: ['Red and blue make white!', 'Ten eyes and arms!'],
    translationNote: 'Merah dan biru menghasilkan ungu!',
  },
  {
    vocabId: 'v_4_gray',
    speakerAId: 'v_1_man',
    speakerAName: 'Kakek',
    speakerALine: 'What color do you get by mixing black and white?',
    speakerAHints: { mixing: 'mencampur' },
    speakerBId: 'v_4_gray',
    speakerBName: 'Raka',
    correctReply: 'Black and white make gray!',
    distractorReplies: ['Black and white make yellow!', 'Hello, my age is brown!'],
    translationNote: 'Hitam dan putih menghasilkan abu-abu!',
  },
  {
    vocabId: 'v_4_brown',
    speakerAId: 'v_1_boy',
    speakerAName: 'Tobi',
    speakerALine: 'What color is chocolate ice cream and tree bark?',
    speakerAHints: { chocolate: 'cokelat', bark: 'kulit kayu' },
    speakerBId: 'v_4_brown',
    speakerBName: 'Fajar',
    correctReply: 'Chocolate and wood are brown!',
    distractorReplies: ['Chocolate is bright pink!', 'Yes, forty necks!'],
    translationNote: 'Cokelat dan kayu berwarna cokelat!',
  },
  {
    vocabId: 'v_4_dark',
    speakerAId: 'v_1_woman',
    speakerAName: 'Ibu',
    speakerALine: 'Do you want the bright blue shirt or the deep night shade?',
    speakerAHints: { shade: 'nuansa warna' },
    speakerBId: 'v_4_dark',
    speakerBName: 'Raka',
    correctReply: 'I prefer the dark blue one.',
    distractorReplies: ['I prefer nineteen ears!', 'Thank you, zero!'],
    translationNote: 'Saya lebih suka yang biru gelap.',
  },
  {
    vocabId: 'v_4_light',
    speakerAId: 'v_1_girl',
    speakerAName: 'Lina',
    speakerALine: 'This dark green paint feels too heavy.',
    speakerAHints: { paint: 'cat', heavy: 'pekat / berat' },
    speakerBId: 'v_4_light',
    speakerBName: 'Sari',
    correctReply: 'Let us try a soft light green instead!',
    distractorReplies: ['Let us try eighty lips!', 'No, my uncle is purple.'],
    translationNote: 'Ayo kita coba hijau terang yang lembut sebagai gantinya!',
  },
  {
    vocabId: 'v_4_color',
    speakerAId: 'v_1_friend',
    speakerAName: 'Teman',
    speakerALine: 'Blue, yellow, green, or red — which one do you like best?',
    speakerAHints: { which: 'yang mana', best: 'paling' },
    speakerBId: 'v_4_color',
    speakerBName: 'Bimo',
    correctReply: 'My favorite color is green!',
    distractorReplies: ['My favorite baby is sixty!', 'Goodbye, answer!'],
    translationNote: 'Warna kesukaan saya adalah hijau!',
  },
  // ---- NUMBERS 0..100 (29 grouped cleanly with category-exact focus) ----
  { vocabId: 'v_2_zero', speakerAId: 'v_1_woman', speakerAName: 'Ibu Guru', speakerALine: 'There are no apples left in the box. How many are inside?', speakerAHints: { apples: 'apel', left: 'tersisa' }, speakerBId: 'v_2_zero', speakerBName: 'Bimo', correctReply: 'There are zero apples inside!', distractorReplies: ['There are fifty apples!', 'Yes, bright orange!'], translationNote: 'Ada nol apel di dalamnya!' },
  { vocabId: 'v_2_one', speakerAId: 'v_1_boy', speakerAName: 'Adi', speakerALine: 'How many noses do you have on your face?', speakerAHints: { noses: 'hidung', face: 'wajah' }, speakerBId: 'v_2_one', speakerBName: 'Lina', correctReply: 'I have only one nose!', distractorReplies: ['I have ten noses!', 'My cheek is seventy!'], translationNote: 'Aku hanya punya satu hidung!' },
  { vocabId: 'v_2_two', speakerAId: 'v_1_girl', speakerAName: 'Sinta', speakerALine: 'Count our hands! How many hands do you have?', speakerAHints: { count: 'hitung', hands: 'tangan' }, speakerBId: 'v_2_two', speakerBName: 'Raka', correctReply: 'I have two hands!', distractorReplies: ['I have nine hands!', 'My foot is gray!'], translationNote: 'Aku punya dua tangan!' },
  { vocabId: 'v_2_three', speakerAId: 'v_1_boy', speakerAName: 'Dani', speakerALine: 'One, two, ... what number comes next?', speakerAHints: { comes: 'datang', next: 'berikutnya' }, speakerBId: 'v_2_three', speakerBName: 'Dina', correctReply: 'Number three comes next!', distractorReplies: ['Number eighty comes next!', 'My address is pink!'], translationNote: 'Angka tiga datang berikutnya!' },
  { vocabId: 'v_2_four', speakerAId: 'v_1_man', speakerAName: 'Pak Budi', speakerALine: 'Two plus two equals how many?', speakerAHints: { plus: 'tambah', equals: 'sama dengan' }, speakerBId: 'v_2_four', speakerBName: 'Bimo', correctReply: 'Two plus two equals four!', distractorReplies: ['It equals forty!', 'Good night, cousin!'], translationNote: 'Dua tambah dua sama dengan empat!' },
  { vocabId: 'v_2_five', speakerAId: 'v_1_woman', speakerAName: 'Mama', speakerALine: 'How many fingers are on one hand?', speakerAHints: { fingers: 'jari' }, speakerBId: 'v_2_five', speakerBName: 'Fajar', correctReply: 'There are five fingers on one hand!', distractorReplies: ['There are nineteen fingers!', 'My passport is brown!'], translationNote: 'Ada lima jari di satu tangan!' },
  { vocabId: 'v_2_six', speakerAId: 'v_1_boy', speakerAName: 'Raka', speakerALine: 'Three plus three makes what number?', speakerAHints: { makes: 'menghasilkan' }, speakerBId: 'v_2_six', speakerBName: 'Maya', correctReply: 'Three plus three makes six!', distractorReplies: ['It makes sixteen!', 'Sorry, dark blue!'], translationNote: 'Tiga tambah tiga menjadi enam!' },
  { vocabId: 'v_2_seven', speakerAId: 'v_1_woman', speakerAName: 'Ibu Guru', speakerALine: 'How many days are there in one week?', speakerAHints: { days: 'hari', week: 'minggu' }, speakerBId: 'v_2_seven', speakerBName: 'Rani', correctReply: 'There are seven days in one week!', distractorReplies: ['There are seventy days!', 'My stomach is black!'], translationNote: 'Ada tujuh hari dalam satu minggu!' },
  { vocabId: 'v_2_eight', speakerAId: 'v_1_girl', speakerAName: 'Nadia', speakerALine: 'How many legs does a spider have?', speakerAHints: { spider: 'laba-laba', legs: 'kaki' }, speakerBId: 'v_2_eight', speakerBName: 'Adi', correctReply: 'A spider has eight legs!', distractorReplies: ['A spider has zero legs!', 'Welcome, white neck!'], translationNote: 'Laba-laba memiliki delapan kaki!' },
  { vocabId: 'v_2_nine', speakerAId: 'v_1_boy', speakerAName: 'Tobi', speakerALine: 'Ten minus one leaves which number?', speakerAHints: { minus: 'dikurangi', leaves: 'menyisakan' }, speakerBId: 'v_2_nine', speakerBName: 'Sinta', correctReply: 'Ten minus one leaves nine!', distractorReplies: ['It leaves ninety!', 'Yes, my chin is married!'], translationNote: 'Sepuluh dikurangi satu menyisakan sembilan!' },
  { vocabId: 'v_2_ten', speakerAId: 'v_1_woman', speakerAName: 'Ibu', speakerALine: 'Count both hands together! Five plus five equals...', speakerAHints: { both: 'kedua' }, speakerBId: 'v_2_ten', speakerBName: 'Bimo', correctReply: 'Five plus five equals ten!', distractorReplies: ['It equals zero!', 'Goodbye, green ear!'], translationNote: 'Lima tambah lima sama dengan sepuluh!' },
  { vocabId: 'v_2_eleven', speakerAId: 'v_1_boy', speakerAName: 'Raka', speakerALine: 'Ten plus one makes which number?', speakerAHints: { plus: 'tambah' }, speakerBId: 'v_2_eleven', speakerBName: 'Lina', correctReply: 'Ten plus one is eleven!', distractorReplies: ['It is twenty!', 'My name is orange!'], translationNote: 'Sepuluh tambah satu adalah sebelas!' },
  { vocabId: 'v_2_twelve', speakerAId: 'v_1_man', speakerAName: 'Pak Guru', speakerALine: 'How many months are in a year?', speakerAHints: { months: 'bulan', year: 'tahun' }, speakerBId: 'v_2_twelve', speakerBName: 'Dina', correctReply: 'There are twelve months in a year!', distractorReplies: ['There are two months!', 'My lips are forty!'], translationNote: 'Ada dua belas bulan dalam setahun!' },
  { vocabId: 'v_2_thirteen', speakerAId: 'v_1_girl', speakerAName: 'Maya', speakerALine: 'What comes right after twelve?', speakerAHints: { after: 'setelah' }, speakerBId: 'v_2_thirteen', speakerBName: 'Fajar', correctReply: 'Thirteen comes after twelve!', distractorReplies: ['Thirty comes after twelve!', 'No, dark hair!'], translationNote: 'Tiga belas datang setelah dua belas!' },
  { vocabId: 'v_2_fourteen', speakerAId: 'v_1_boy', speakerAName: 'Adi', speakerALine: 'Seven plus seven equals how many?', speakerAHints: { equals: 'sama dengan' }, speakerBId: 'v_2_fourteen', speakerBName: 'Rani', correctReply: 'Seven plus seven equals fourteen!', distractorReplies: ['It equals forty!', 'Hi, yellow arm!'], translationNote: 'Tujuh tambah tujuh sama dengan empat belas!' },
  { vocabId: 'v_2_fifteen', speakerAId: 'v_1_woman', speakerAName: 'Ibu Sari', speakerALine: 'Ten plus five equals which number?', speakerAHints: { plus: 'tambah' }, speakerBId: 'v_2_fifteen', speakerBName: 'Bimo', correctReply: 'Ten plus five equals fifteen!', distractorReplies: ['It equals fifty!', 'My cousin is gray!'], translationNote: 'Sepuluh tambah lima sama dengan lima belas!' },
  { vocabId: 'v_2_sixteen', speakerAId: 'v_1_boy', speakerAName: 'Dani', speakerALine: 'Eight plus eight equals how much?', speakerAHints: { much: 'berapa' }, speakerBId: 'v_2_sixteen', speakerBName: 'Nadia', correctReply: 'Eight plus eight equals sixteen!', distractorReplies: ['It equals sixty!', 'Thank you, knee!'], translationNote: 'Delapan tambah delapan sama dengan enam belas!' },
  { vocabId: 'v_2_seventeen', speakerAId: 'v_1_girl', speakerAName: 'Sinta', speakerALine: 'What number stands between sixteen and eighteen?', speakerAHints: { between: 'di antara' }, speakerBId: 'v_2_seventeen', speakerBName: 'Raka', correctReply: 'Seventeen is right in the middle!', distractorReplies: ['Seventy is in the middle!', 'Please, black phone!'], translationNote: 'Tujuh belas tepat berada di tengah!' },
  { vocabId: 'v_2_eighteen', speakerAId: 'v_1_boy', speakerAName: 'Fajar', speakerALine: 'Nine plus nine equals which number?', speakerAHints: { equals: 'sama dengan' }, speakerBId: 'v_2_eighteen', speakerBName: 'Lina', correctReply: 'Nine plus nine equals eighteen!', distractorReplies: ['It equals eighty!', 'Good afternoon, tooth!'], translationNote: 'Sembilan tambah sembilan sama dengan delapan belas!' },
  { vocabId: 'v_2_nineteen', speakerAId: 'v_1_woman', speakerAName: 'Ibu Guru', speakerALine: 'One step before twenty is...', speakerAHints: { before: 'sebelum' }, speakerBId: 'v_2_nineteen', speakerBName: 'Adi', correctReply: 'One step before twenty is nineteen!', distractorReplies: ['It is ninety!', 'OK, pink stomach!'], translationNote: 'Satu langkah sebelum dua puluh adalah sembilan belas!' },
  { vocabId: 'v_2_twenty', speakerAId: 'v_1_man', speakerAName: 'Pak Budi', speakerALine: 'Ten plus ten makes how many?', speakerAHints: { makes: 'menghasilkan' }, speakerBId: 'v_2_twenty', speakerBName: 'Dina', correctReply: 'Ten plus ten makes twenty!', distractorReplies: ['Ten plus ten makes twelve!', 'Sorry, brown leg!'], translationNote: 'Sepuluh tambah sepuluh menjadi dua puluh!' },
  { vocabId: 'v_2_thirty', speakerAId: 'v_1_woman', speakerAName: 'Ibu Guru', speakerALine: 'How many days are there in most months?', speakerAHints: { days: 'hari', months: 'bulan' }, speakerBId: 'v_2_thirty', speakerBName: 'Raka', correctReply: 'Most months have thirty days!', distractorReplies: ['Most months have thirteen days!', 'Bye, my purple back!'], translationNote: 'Kebanyakan bulan memiliki tiga puluh hari!' },
  { vocabId: 'v_2_forty', speakerAId: 'v_1_boy', speakerAName: 'Bimo', speakerALine: 'Twenty plus twenty equals how many?', speakerAHints: { equals: 'sama dengan' }, speakerBId: 'v_2_forty', speakerBName: 'Maya', correctReply: 'Twenty plus twenty equals forty!', distractorReplies: ['It equals fourteen!', 'Yes, single hair!'], translationNote: 'Dua puluh tambah dua puluh sama dengan empat puluh!' },
  { vocabId: 'v_2_fifty', speakerAId: 'v_1_girl', speakerAName: 'Lina', speakerALine: 'Half of one hundred is which number?', speakerAHints: { half: 'setengah', hundred: 'seratus' }, speakerBId: 'v_2_fifty', speakerBName: 'Adi', correctReply: 'Half of one hundred is fifty!', distractorReplies: ['Half is fifteen!', 'No, my aunt is red!'], translationNote: 'Setengah dari seratus adalah lima puluh!' },
  { vocabId: 'v_2_sixty', speakerAId: 'v_1_man', speakerAName: 'Kakek', speakerALine: 'How many minutes make one full hour?', speakerAHints: { minutes: 'menit', hour: 'jam' }, speakerBId: 'v_2_sixty', speakerBName: 'Sinta', correctReply: 'Sixty minutes make one hour!', distractorReplies: ['Sixteen minutes make an hour!', 'Welcome, cheek!'], translationNote: 'Enam puluh menit menjadi satu jam!' },
  { vocabId: 'v_2_seventy', speakerAId: 'v_1_boy', speakerAName: 'Dani', speakerALine: 'Sixty plus ten equals which number?', speakerAHints: { plus: 'tambah' }, speakerBId: 'v_2_seventy', speakerBName: 'Fajar', correctReply: 'Sixty plus ten equals seventy!', distractorReplies: ['It equals seventeen!', 'Good night, white arm!'], translationNote: 'Enam puluh tambah sepuluh sama dengan tujuh puluh!' },
  { vocabId: 'v_2_eighty', speakerAId: 'v_1_girl', speakerAName: 'Nadia', speakerALine: 'Forty plus forty equals how many?', speakerAHints: { forty: 'empat puluh' }, speakerBId: 'v_2_eighty', speakerBName: 'Rani', correctReply: 'Forty plus forty equals eighty!', distractorReplies: ['It equals eighteen!', 'Thanks, light face!'], translationNote: 'Empat puluh tambah empat puluh sama dengan delapan puluh!' },
  { vocabId: 'v_2_ninety', speakerAId: 'v_1_woman', speakerAName: 'Ibu Sari', speakerALine: 'Ten less than one hundred is...', speakerAHints: { less: 'kurang dari', hundred: 'seratus' }, speakerBId: 'v_2_ninety', speakerBName: 'Bimo', correctReply: 'Ten less than one hundred is ninety!', distractorReplies: ['It is nineteen!', 'Bye, married question!'], translationNote: 'Sepuluh kurangnya dari seratus adalah sembilan puluh!' },
  { vocabId: 'v_2_hundred', speakerAId: 'v_1_man', speakerAName: 'Pak Guru', speakerALine: 'You answered every single question! What is your full score?', speakerAHints: { answered: 'menjawab', full: 'sempurna / penuh', score: 'skor' }, speakerBId: 'v_2_hundred', speakerBName: 'Bimo', correctReply: 'My score is one hundred!', distractorReplies: ['My score is zero!', 'Sorry, light yellow ear!'], translationNote: 'Skorku adalah seratus!' },
  // ---- REMAINING PEOPLE, FAMILY & BODY DIALOGUES (15) ----
  { vocabId: 'v_1_man', speakerAId: 'v_1_woman', speakerAName: 'Ibu Sari', speakerALine: 'Who is wearing the neat blue shirt over there?', speakerAHints: { wearing: 'memakai', neat: 'rapi', shirt: 'kemeja' }, speakerBId: 'v_1_man', speakerBName: 'Budi', correctReply: 'That friendly man is my teacher!', distractorReplies: ['That small baby is my teacher!', 'Good night, blue passport!'], translationNote: 'Pria ramah itu adalah guruku!' },
  { vocabId: 'v_1_woman', speakerAId: 'v_1_man', speakerAName: 'Pak Arif', speakerALine: 'Who is greeting the neighbors with a smile?', speakerAHints: { greeting: 'menyapa', neighbors: 'tetangga', smile: 'senyuman' }, speakerBId: 'v_1_woman', speakerBName: 'Nadia', correctReply: 'The kind woman in the colorful scarf!', distractorReplies: ['The little boy with soccer!', 'Sorry, my knee is twenty!'], translationNote: 'Wanita baik hati dengan syal warna-warni itu!' },
  { vocabId: 'v_1_boy', speakerAId: 'v_1_girl', speakerAName: 'Sinta', speakerALine: 'Who is waving cheerfully near the school gate?', speakerAHints: { waving: 'melambai', cheerfully: 'riang', gate: 'gerbang' }, speakerBId: 'v_1_boy', speakerBName: 'Raka', correctReply: 'That energetic boy is my classmate!', distractorReplies: ['That elderly grandfather is my classmate!', 'Please, green stomach!'], translationNote: 'Anak laki-laki energik itu teman sekelasku!' },
  { vocabId: 'v_1_girl', speakerAId: 'v_1_boy', speakerAName: 'Bimo', speakerALine: 'Who won first prize in the village story contest?', speakerAHints: { won: 'memenangkan', prize: 'hadiah', contest: 'lomba' }, speakerBId: 'v_1_girl', speakerBName: 'Lina', correctReply: 'The smart girl standing by the tree!', distractorReplies: ['The tall grandfather standing by the tree!', 'Goodbye, orange chin!'], translationNote: 'Anak perempuan pintar yang berdiri di dekat pohon itu!' },
  { vocabId: 'v_3_parent', speakerAId: 'v_1_woman', speakerAName: 'Ibu Guru', speakerALine: 'Who takes care of the baby with so much love?', speakerAHints: { takes: 'mengurus / menjaga', care: 'perhatian', love: 'kasih sayang' }, speakerBId: 'v_3_parent', speakerBName: 'Orang Tua', correctReply: 'Every caring parent loves their child!', distractorReplies: ['Every blue number loves zero!', 'Thanks, gray cheek!'], translationNote: 'Setiap orang tua yang penyayang menyayangi anaknya!' },
  { vocabId: 'v_3_child', speakerAId: 'v_3_grandfather', speakerAName: 'Kakek', speakerALine: 'Look how happy the little kid is playing with a toy plane!', speakerAHints: { happy: 'bahagia', playing: 'bermain', plane: 'pesawat' }, speakerBId: 'v_3_child', speakerBName: 'Anak', correctReply: 'Yes! A cheerful child makes the home bright!', distractorReplies: ['Yes! An adult passport makes tea!', 'No, dark birthday!'], translationNote: 'Ya! Anak yang ceria membuat rumah terasa cerah!' },
  { vocabId: 'v_3_son', speakerAId: 'v_3_father', speakerAName: 'Ayah', speakerALine: 'Did you bring the football boots for practice?', speakerAHints: { bring: 'membawa', boots: 'sepatu', practice: 'latihan' }, speakerBId: 'v_3_son', speakerBName: 'Putra', correctReply: 'Yes, Dad! Your proud son is ready!', distractorReplies: ['Yes, Dad! Your proud daughter is uncle!', 'Welcome, ninety lips!'], translationNote: 'Ya, Ayah! Putra kebanggaanmu sudah siap!' },
  { vocabId: 'v_3_daughter', speakerAId: 'v_3_mother', speakerAName: 'Ibu', speakerALine: 'Would you like to read this storybook together?', speakerAHints: { read: 'membaca', storybook: 'buku cerita', together: 'bersama' }, speakerBId: 'v_3_daughter', speakerBName: 'Putri', correctReply: 'Yes, Mom! Your daughter loves reading!', distractorReplies: ['Yes, Mom! Your grandfather loves sixty!', 'Bye, single stomach!'], translationNote: 'Ya, Bu! Putrimu suka sekali membaca!' },
  { vocabId: 'v_3_family', speakerAId: 'v_1_friend', speakerAName: 'Dani', speakerALine: 'Are grandparents, parents, and children coming to dinner?', speakerAHints: { dinner: 'makan malam', coming: 'datang' }, speakerBId: 'v_3_family', speakerBName: 'Keluarga', correctReply: 'Yes! The whole family will gather tonight!', distractorReplies: ['Yes! The whole passport will gather!', 'OK, yellow nose!'], translationNote: 'Ya! Seluruh keluarga akan berkumpul malam ini!' },
  { vocabId: 'v_3_grandchild', speakerAId: 'v_3_grandmother', speakerAName: 'Nenek', speakerALine: 'I baked warm chocolate cookies! Who gets the first one?', speakerAHints: { baked: 'memanggang', warm: 'hangat', cookies: 'kue' }, speakerBId: 'v_3_grandchild', speakerBName: 'Cucu', correctReply: 'Me, Grandma! Your lucky grandchild!', distractorReplies: ['Me, Grandma! Your adult address!', 'Sorry, dark arm!'], translationNote: 'Aku, Nenek! Cucu kesayanganmu yang beruntung!' },
  { vocabId: 'v_3_niece', speakerAId: 'v_3_aunt', speakerAName: 'Bibi', speakerALine: 'Who gave you that pretty pink birthday ribbon?', speakerAHints: { gave: 'memberi', pretty: 'cantik', ribbon: 'pita' }, speakerBId: 'v_3_niece', speakerBName: 'Keponakan', correctReply: 'My aunt! She loves her little niece!', distractorReplies: ['My nephew! She loves eighty tooth!', 'Good morning, brown ear!'], translationNote: 'Bibiku! Beliau sangat menyayangi keponakan perempuannya!' },
  { vocabId: 'v_3_nephew', speakerAId: 'v_3_uncle', speakerAName: 'Paman', speakerALine: 'Want an ice cream cone after our walk, buddy?', speakerAHints: { ice: 'es', walk: 'jalan-jalan', buddy: 'sobat' }, speakerBId: 'v_3_nephew', speakerBName: 'Keponakan', correctReply: 'Yes, Uncle! Your nephew would love one!', distractorReplies: ['Yes, Uncle! Your grandmother is forty!', 'Bye, red passport!'], translationNote: 'Mau, Paman! Keponakan laki-lakimu mau satu!' },
  { vocabId: 'v_6_body', speakerAId: 'v_1_man', speakerAName: 'Pelatih', speakerALine: 'Do we stretch every morning before running?', speakerAHints: { stretch: 'peregangan', running: 'berlari' }, speakerBId: 'v_6_body', speakerBName: 'Raka', correctReply: 'Yes! Exercise keeps our whole body healthy!', distractorReplies: ['Yes! Exercise keeps our blue answer!', 'Good night, white phone!'], translationNote: 'Ya! Olahraga menjaga seluruh tubuh kita tetap sehat!' },
  { vocabId: 'v_6_leg', speakerAId: 'v_1_boy', speakerAName: 'Bimo', speakerALine: 'Why do soccer players jump and sprint so well?', speakerAHints: { soccer: 'sepak bola', jump: 'melompat', sprint: 'lari cepat' }, speakerBId: 'v_6_leg', speakerBName: 'Adi', correctReply: 'Because every strong leg helps them run fast!', distractorReplies: ['Because every purple tooth helps them!', 'Hello, married cheek!'], translationNote: 'Karena setiap kaki yang kuat membantu mereka berlari cepat!' },
  { vocabId: 'v_6_back', speakerAId: 'v_1_woman', speakerAName: 'Dokter', speakerALine: 'Why should we sit up straight at our desk?', speakerAHints: { sit: 'duduk', straight: 'tegak', desk: 'meja belajar' }, speakerBId: 'v_6_back', speakerBName: 'Maya', correctReply: 'Good posture protects our upper back!', distractorReplies: ['Good posture protects our yellow birthday!', 'Thanks, fourteen lips!'], translationNote: 'Postur yang baik melindungi punggung atas kita!' },
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

  // ---- THE BODY ----
  {
    vocabId: 'v_6_body',
    sentence: 'Keep your body healthy.',
    tokens: ['Keep', 'your', 'body', 'healthy.'],
    distractors: ['knee', 'table'],
    translationNote: 'Jaga tubuhmu tetap sehat.',
  },
  {
    vocabId: 'v_6_hand',
    sentence: 'Clap your hands now!',
    tokens: ['Clap', 'your', 'hands', 'now!'],
    distractors: ['feet', 'head'],
    translationNote: 'Tepuk tanganmu sekarang!',
  },
  {
    vocabId: 'v_6_arm',
    sentence: 'Strong arm and hand.',
    tokens: ['Strong', 'arm', 'and', 'hand.'],
    distractors: ['leg', 'back'],
    translationNote: 'Lengan dan tangan yang kuat.',
  },
  {
    vocabId: 'v_6_foot',
    sentence: 'Wash your right foot.',
    tokens: ['Wash', 'your', 'right', 'foot.'],
    distractors: ['arm', 'head'],
    translationNote: 'Cuci telapak kaki kananmu.',
  },
  {
    vocabId: 'v_6_head',
    sentence: 'Touch your head gently.',
    tokens: ['Touch', 'your', 'head', 'gently.'],
    distractors: ['knee', 'stomach'],
    translationNote: 'Sentuh kepalamu dengan lembut.',
  },
  {
    vocabId: 'v_6_leg',
    sentence: 'Run with strong legs.',
    tokens: ['Run', 'with', 'strong', 'legs.'],
    distractors: ['hands', 'back'],
    translationNote: 'Berlari dengan kaki yang kuat.',
  },
  {
    vocabId: 'v_6_knee',
    sentence: 'Bend your left knee.',
    tokens: ['Bend', 'your', 'left', 'knee.'],
    distractors: ['head', 'arm'],
    translationNote: 'Tekuk lutut kirimu.',
  },
  {
    vocabId: 'v_6_back',
    sentence: 'Rest your tired back.',
    tokens: ['Rest', 'your', 'tired', 'back.'],
    distractors: ['hand', 'foot'],
    translationNote: 'Istirahatkan punggungmu yang lelah.',
  },
  {
    vocabId: 'v_6_stomach',
    sentence: 'My stomach is happy.',
    tokens: ['My', 'stomach', 'is', 'happy.'],
    distractors: ['knee', 'leg'],
    translationNote: 'Perut saya senang.',
  },

  // ---- THE HEAD AND FACE ----
  {
    vocabId: 'v_7_hair',
    sentence: 'Brush your soft hair.',
    tokens: ['Brush', 'your', 'soft', 'hair.'],
    distractors: ['chin', 'ear'],
    translationNote: 'Sisir rambutmu yang lembut.',
  },
  {
    vocabId: 'v_7_neck',
    sentence: 'Keep your neck warm.',
    tokens: ['Keep', 'your', 'neck', 'warm.'],
    distractors: ['lip', 'tooth'],
    translationNote: 'Jaga lehermu tetap hangat.',
  },
  {
    vocabId: 'v_7_face',
    sentence: 'Wash your clean face.',
    tokens: ['Wash', 'your', 'clean', 'face.'],
    distractors: ['knee', 'neck'],
    translationNote: 'Cuci wajahmu hingga bersih.',
  },
  {
    vocabId: 'v_7_eye',
    sentence: 'Open both bright eyes.',
    tokens: ['Open', 'both', 'bright', 'eyes.'],
    distractors: ['ears', 'lips'],
    translationNote: 'Buka kedua matamu yang cerah.',
  },
  {
    vocabId: 'v_7_nose',
    sentence: 'Breathe through your nose.',
    tokens: ['Breathe', 'through', 'your', 'nose.'],
    distractors: ['cheek', 'hair'],
    translationNote: 'Bernapaslah melalui hidungmu.',
  },
  {
    vocabId: 'v_7_ear',
    sentence: 'Listen with both ears.',
    tokens: ['Listen', 'with', 'both', 'ears.'],
    distractors: ['eyes', 'teeth'],
    translationNote: 'Dengarkan dengan kedua telingamu.',
  },
  {
    vocabId: 'v_7_cheek',
    sentence: 'Two rosy pink cheeks.',
    tokens: ['Two', 'rosy', 'pink', 'cheeks.'],
    distractors: ['chins', 'noses'],
    translationNote: 'Dua pipi berwarna merah muda.',
  },
  {
    vocabId: 'v_7_chin',
    sentence: 'Lift your chin up.',
    tokens: ['Lift', 'your', 'chin', 'up.'],
    distractors: ['neck', 'eye'],
    translationNote: 'Angkat dagumu ke atas.',
  },
  {
    vocabId: 'v_7_mouth',
    sentence: 'Open your mouth wide.',
    tokens: ['Open', 'your', 'mouth', 'wide.'],
    distractors: ['ear', 'face'],
    translationNote: 'Buka mulutmu lebar-lebar.',
  },
  {
    vocabId: 'v_7_tooth',
    sentence: 'One shiny white tooth.',
    tokens: ['One', 'shiny', 'white', 'tooth.'],
    distractors: ['lip', 'cheek'],
    translationNote: 'Satu gigi putih berkilau.',
  },
  {
    vocabId: 'v_7_lip',
    sentence: 'Smile with soft lips.',
    tokens: ['Smile', 'with', 'soft', 'lips.'],
    distractors: ['ears', 'hair'],
    translationNote: 'Tersenyum dengan bibir yang lembut.',
  },

  // ---- PERSONAL INFORMATION ----
  {
    vocabId: 'v_5_name',
    sentence: 'Write your full name.',
    tokens: ['Write', 'your', 'full', 'name.'],
    distractors: ['passport', 'cake'],
    translationNote: 'Tulis nama lengkapmu.',
  },
  {
    vocabId: 'v_5_address',
    sentence: 'Check the home address.',
    tokens: ['Check', 'the', 'home', 'address.'],
    distractors: ['birthday', 'phone'],
    translationNote: 'Periksa alamat rumahnya.',
  },
  {
    vocabId: 'v_5_birthday',
    sentence: 'Happy birthday to you!',
    tokens: ['Happy', 'birthday', 'to', 'you!'],
    distractors: ['passport', 'married'],
    translationNote: 'Selamat ulang tahun untukmu!',
  },
  {
    vocabId: 'v_5_married',
    sentence: 'They are happily married.',
    tokens: ['They', 'are', 'happily', 'married.'],
    distractors: ['address', 'name'],
    translationNote: 'Mereka menikah dengan bahagia.',
  },
  {
    vocabId: 'v_5_passport',
    sentence: 'Show your blue passport.',
    tokens: ['Show', 'your', 'blue', 'passport.'],
    distractors: ['birthday', 'number'],
    translationNote: 'Tunjukkan paspor birumu.',
  },
  {
    vocabId: 'v_5_phone_number',
    sentence: 'Dial this phone number.',
    tokens: ['Dial', 'this', 'phone', 'number.'],
    distractors: ['address', 'passport'],
    translationNote: 'Tekan nomor telepon ini.',
  },

  // ---- HELLO AND GOODBYE ----
  {
    vocabId: 'v_0_hello',
    sentence: 'Hello, my good friend!',
    tokens: ['Hello,', 'my', 'good', 'friend!'],
    distractors: ['night', 'goodbye'],
    translationNote: 'Halo, teman baikku!',
  },
  {
    vocabId: 'v_0_goodbye',
    sentence: 'Goodbye and see you!',
    tokens: ['Goodbye', 'and', 'see', 'you!'],
    distractors: ['morning', 'welcome'],
    translationNote: 'Selamat tinggal dan sampai jumpa!',
  },
  {
    vocabId: 'v_0_good_morning',
    sentence: 'Good morning, sunny day!',
    tokens: ['Good', 'morning,', 'sunny', 'day!'],
    distractors: ['night', 'evening'],
    translationNote: 'Selamat pagi, hari yang cerah!',
  },
  {
    vocabId: 'v_0_good_afternoon',
    sentence: 'Good afternoon to everyone!',
    tokens: ['Good', 'afternoon', 'to', 'everyone!'],
    distractors: ['night', 'morning'],
    translationNote: 'Selamat siang semuanya!',
  },
  {
    vocabId: 'v_0_good_evening',
    sentence: 'Good evening, quiet street.',
    tokens: ['Good', 'evening,', 'quiet', 'street.'],
    distractors: ['morning', 'afternoon'],
    translationNote: 'Selamat malam, jalan yang tenang.',
  },
  {
    vocabId: 'v_0_good_night',
    sentence: 'Good night, sleep well.',
    tokens: ['Good', 'night,', 'sleep', 'well.'],
    distractors: ['morning', 'welcome'],
    translationNote: 'Selamat tidur, tidurlah nyenyak.',
  },
  {
    vocabId: 'v_0_thank_you',
    sentence: 'Thank you very much!',
    tokens: ['Thank', 'you', 'very', 'much!'],
    distractors: ['sorry', 'goodbye'],
    translationNote: 'Terima kasih banyak!',
  },
  {
    vocabId: 'v_0_welcome',
    sentence: 'Welcome to our house!',
    tokens: ['Welcome', 'to', 'our', 'house!'],
    distractors: ['goodbye', 'night'],
    translationNote: 'Selamat datang di rumah kami!',
  },
  // ---- GREETINGS REMAINING (8) ----
  { vocabId: 'v_0_hi', sentence: 'Hi, my good friend!', tokens: ['Hi,', 'my', 'good', 'friend!'], distractors: ['bye', 'sorry'], translationNote: 'Hai, teman baikku!' },
  { vocabId: 'v_0_bye', sentence: 'Bye, see you soon!', tokens: ['Bye,', 'see', 'you', 'soon!'], distractors: ['hi', 'welcome'], translationNote: 'Sampai jumpa segera!' },
  { vocabId: 'v_0_thanks', sentence: 'Thanks for your help!', tokens: ['Thanks', 'for', 'your', 'help!'], distractors: ['sorry', 'no'], translationNote: 'Makasih atas bantuanmu!' },
  { vocabId: 'v_0_please', sentence: 'Please open the door.', tokens: ['Please', 'open', 'the', 'door.'], distractors: ['sorry', 'bye'], translationNote: 'Tolong buka pintunya.' },
  { vocabId: 'v_0_ok', sentence: 'Okay, let us start now!', tokens: ['Okay,', 'let', 'us', 'start', 'now!'], distractors: ['no', 'goodbye'], translationNote: 'Baiklah, ayo kita mulai sekarang!' },
  { vocabId: 'v_0_yes', sentence: 'Yes, I am ready!', tokens: ['Yes,', 'I', 'am', 'ready!'], distractors: ['No', 'Sorry'], translationNote: 'Ya, saya sudah siap!' },
  { vocabId: 'v_0_no', sentence: 'No, thank you very much.', tokens: ['No,', 'thank', 'you', 'very', 'much.'], distractors: ['Yes', 'Hi'], translationNote: 'Tidak, terima kasih banyak.' },
  { vocabId: 'v_0_sorry', sentence: 'Sorry, I am late.', tokens: ['Sorry,', 'I', 'am', 'late.'], distractors: ['Thanks', 'Welcome'], translationNote: 'Maaf, saya terlambat.' },
  // ---- PERSONAL INFO REMAINING (6) ----
  { vocabId: 'v_5_last_name', sentence: 'Write your last name.', tokens: ['Write', 'your', 'last', 'name.'], distractors: ['age', 'passport'], translationNote: 'Tulis nama belakangmu.' },
  { vocabId: 'v_5_age', sentence: 'What is your age?', tokens: ['What', 'is', 'your', 'age?'], distractors: ['address', 'color'], translationNote: 'Berapa usiamu?' },
  { vocabId: 'v_5_birthdate', sentence: 'Check your full birthdate.', tokens: ['Check', 'your', 'full', 'birthdate.'], distractors: ['answer', 'single'], translationNote: 'Periksa tanggal lahirmu.' },
  { vocabId: 'v_5_single', sentence: 'My cousin is still single.', tokens: ['My', 'cousin', 'is', 'still', 'single.'], distractors: ['married', 'question'], translationNote: 'Sepupuku masih lajang.' },
  { vocabId: 'v_5_question', sentence: 'Ask an easy question.', tokens: ['Ask', 'an', 'easy', 'question.'], distractors: ['answer', 'age'], translationNote: 'Ajukan pertanyaan yang mudah.' },
  { vocabId: 'v_5_answer', sentence: 'Give the right answer.', tokens: ['Give', 'the', 'right', 'answer.'], distractors: ['question', 'birthdate'], translationNote: 'Berikan jawaban yang benar.' },
  // ---- COLORS (14) ----
  { vocabId: 'v_4_black', sentence: 'Her cat is black.', tokens: ['Her', 'cat', 'is', 'black.'], distractors: ['white', 'pink'], translationNote: 'Kucingnya berwarna hitam.' },
  { vocabId: 'v_4_white', sentence: 'Clean white paper.', tokens: ['Clean', 'white', 'paper.'], distractors: ['black', 'orange'], translationNote: 'Kertas putih yang bersih.' },
  { vocabId: 'v_4_blue', sentence: 'Bright clear blue sky.', tokens: ['Bright', 'clear', 'blue', 'sky.'], distractors: ['brown', 'gray'], translationNote: 'Langit biru yang cerah.' },
  { vocabId: 'v_4_green', sentence: 'Fresh green garden grass.', tokens: ['Fresh', 'green', 'garden', 'grass.'], distractors: ['purple', 'red'], translationNote: 'Rumput taman yang hijau segar.' },
  { vocabId: 'v_4_yellow', sentence: 'Warm yellow morning sun.', tokens: ['Warm', 'yellow', 'morning', 'sun.'], distractors: ['black', 'blue'], translationNote: 'Matahari pagi kuning hangat.' },
  { vocabId: 'v_4_red', sentence: 'A sweet red rose.', tokens: ['A', 'sweet', 'red', 'rose.'], distractors: ['gray', 'green'], translationNote: 'Sekuntum mawar merah manis.' },
  { vocabId: 'v_4_pink', sentence: 'Soft pink strawberry cream.', tokens: ['Soft', 'pink', 'strawberry', 'cream.'], distractors: ['brown', 'dark'], translationNote: 'Krim stroberi merah muda lembut.' },
  { vocabId: 'v_4_orange', sentence: 'Sweet orange pumpkin.', tokens: ['Sweet', 'orange', 'pumpkin.'], distractors: ['purple', 'white'], translationNote: 'Labu berwarna oranye manis.' },
  { vocabId: 'v_4_purple', sentence: 'Nice purple flowers bloom.', tokens: ['Nice', 'purple', 'flowers', 'bloom.'], distractors: ['black', 'yellow'], translationNote: 'Bunga ungu yang indah bermekaran.' },
  { vocabId: 'v_4_gray', sentence: 'Soft gray rain clouds.', tokens: ['Soft', 'gray', 'rain', 'clouds.'], distractors: ['pink', 'orange'], translationNote: 'Awan hujan abu-abu lembut.' },
  { vocabId: 'v_4_brown', sentence: 'Warm brown chocolate.', tokens: ['Warm', 'brown', 'chocolate.'], distractors: ['blue', 'white'], translationNote: 'Cokelat berwarna cokelat hangat.' },
  { vocabId: 'v_4_dark', sentence: 'The night is dark.', tokens: ['The', 'night', 'is', 'dark.'], distractors: ['light', 'yellow'], translationNote: 'Malam itu gelap.' },
  { vocabId: 'v_4_light', sentence: 'Soft light blue shirt.', tokens: ['Soft', 'light', 'blue', 'shirt.'], distractors: ['dark', 'black'], translationNote: 'Kemeja biru muda yang lembut.' },
  { vocabId: 'v_4_color', sentence: 'My favorite bright color.', tokens: ['My', 'favorite', 'bright', 'color.'], distractors: ['number', 'name'], translationNote: 'Warna cerah kesukaanku.' },
  // ---- NUMBERS 0..100 (29) ----
  { vocabId: 'v_2_zero', sentence: 'Count from number zero.', tokens: ['Count', 'from', 'number', 'zero.'], distractors: ['hundred', 'ten'], translationNote: 'Hitung dari angka nol.' },
  { vocabId: 'v_2_one', sentence: 'One sunny morning.', tokens: ['One', 'sunny', 'morning.'], distractors: ['Two', 'Nine'], translationNote: 'Satu pagi yang cerah.' },
  { vocabId: 'v_2_two', sentence: 'Two clean hands.', tokens: ['Two', 'clean', 'hands.'], distractors: ['Five', 'Seven'], translationNote: 'Dua tangan yang bersih.' },
  { vocabId: 'v_2_three', sentence: 'One, two, three, go!', tokens: ['One,', 'two,', 'three,', 'go!'], distractors: ['five', 'eight'], translationNote: 'Satu, dua, tiga, mulai!' },
  { vocabId: 'v_2_four', sentence: 'Four happy friends.', tokens: ['Four', 'happy', 'friends.'], distractors: ['Forty', 'Nine'], translationNote: 'Empat teman yang bahagia.' },
  { vocabId: 'v_2_five', sentence: 'Five fingers on hand.', tokens: ['Five', 'fingers', 'on', 'hand.'], distractors: ['Fifty', 'Zero'], translationNote: 'Lima jari di tangan.' },
  { vocabId: 'v_2_six', sentence: 'Six green apples.', tokens: ['Six', 'green', 'apples.'], distractors: ['Sixty', 'Two'], translationNote: 'Enam apel hijau.' },
  { vocabId: 'v_2_seven', sentence: 'Seven days a week.', tokens: ['Seven', 'days', 'a', 'week.'], distractors: ['Seventy', 'Ten'], translationNote: 'Tujuh hari dalam seminggu.' },
  { vocabId: 'v_2_eight', sentence: 'Wake up at eight.', tokens: ['Wake', 'up', 'at', 'eight.'], distractors: ['eighteen', 'four'], translationNote: 'Bangun pada pukul delapan.' },
  { vocabId: 'v_2_nine', sentence: 'Nine bright stars.', tokens: ['Nine', 'bright', 'stars.'], distractors: ['Ninety', 'One'], translationNote: 'Sembilan bintang cerah.' },
  { vocabId: 'v_2_ten', sentence: 'Count from one to ten.', tokens: ['Count', 'from', 'one', 'to', 'ten.'], distractors: ['twenty', 'zero'], translationNote: 'Hitung dari satu sampai sepuluh.' },
  { vocabId: 'v_2_eleven', sentence: 'Number eleven is blue.', tokens: ['Number', 'eleven', 'is', 'blue.'], distractors: ['twelve', 'thirty'], translationNote: 'Nomor sebelas berwarna biru.' },
  { vocabId: 'v_2_twelve', sentence: 'Twelve months every year.', tokens: ['Twelve', 'months', 'every', 'year.'], distractors: ['Twenty', 'Five'], translationNote: 'Dua belas bulan setiap tahun.' },
  { vocabId: 'v_2_thirteen', sentence: 'Thirteen sweet cookies.', tokens: ['Thirteen', 'sweet', 'cookies.'], distractors: ['Thirty', 'Six'], translationNote: 'Tiga belas kue manis.' },
  { vocabId: 'v_2_fourteen', sentence: 'Fourteen yellow flowers.', tokens: ['Fourteen', 'yellow', 'flowers.'], distractors: ['Forty', 'Seven'], translationNote: 'Empat belas bunga kuning.' },
  { vocabId: 'v_2_fifteen', sentence: 'Fifteen minutes rest.', tokens: ['Fifteen', 'minutes', 'rest.'], distractors: ['Fifty', 'Ten'], translationNote: 'Istirahat lima belas menit.' },
  { vocabId: 'v_2_sixteen', sentence: 'Sixteen blue balloons.', tokens: ['Sixteen', 'blue', 'balloons.'], distractors: ['Sixty', 'Eight'], translationNote: 'Enam belas balon biru.' },
  { vocabId: 'v_2_seventeen', sentence: 'Seventeen birthday candles.', tokens: ['Seventeen', 'birthday', 'candles.'], distractors: ['Seventy', 'Nine'], translationNote: 'Tujuh belas lilin ulang tahun.' },
  { vocabId: 'v_2_eighteen', sentence: 'She turns eighteen today.', tokens: ['She', 'turns', 'eighteen', 'today.'], distractors: ['eighty', 'eleven'], translationNote: 'Dia berusia delapan belas hari ini.' },
  { vocabId: 'v_2_nineteen', sentence: 'Nineteen students smile.', tokens: ['Nineteen', 'students', 'smile.'], distractors: ['Ninety', 'Twelve'], translationNote: 'Sembilan belas murid tersenyum.' },
  { vocabId: 'v_2_twenty', sentence: 'Twenty houses in village.', tokens: ['Twenty', 'houses', 'in', 'village.'], distractors: ['Twelve', 'Two'], translationNote: 'Dua puluh rumah di desa.' },
  { vocabId: 'v_2_thirty', sentence: 'Thirty days this month.', tokens: ['Thirty', 'days', 'this', 'month.'], distractors: ['Thirteen', 'Three'], translationNote: 'Tiga puluh hari bulan ini.' },
  { vocabId: 'v_2_forty', sentence: 'Forty friendly people.', tokens: ['Forty', 'friendly', 'people.'], distractors: ['Fourteen', 'Four'], translationNote: 'Empat puluh orang yang ramah.' },
  { vocabId: 'v_2_fifty', sentence: 'Half of hundred is fifty.', tokens: ['Half', 'of', 'hundred', 'is', 'fifty.'], distractors: ['fifteen', 'five'], translationNote: 'Setengah dari seratus adalah lima puluh.' },
  { vocabId: 'v_2_sixty', sentence: 'Sixty minutes in hour.', tokens: ['Sixty', 'minutes', 'in', 'hour.'], distractors: ['Sixteen', 'Six'], translationNote: 'Enam puluh menit dalam sejam.' },
  { vocabId: 'v_2_seventy', sentence: 'Grandmother is seventy today.', tokens: ['Grandmother', 'is', 'seventy', 'today.'], distractors: ['seventeen', 'seven'], translationNote: 'Nenek berusia tujuh puluh hari ini.' },
  { vocabId: 'v_2_eighty', sentence: 'Grandfather turned eighty.', tokens: ['Grandfather', 'turned', 'eighty.'], distractors: ['eighteen', 'eight'], translationNote: 'Kakek berusia delapan puluh.' },
  { vocabId: 'v_2_ninety', sentence: 'She scored ninety points.', tokens: ['She', 'scored', 'ninety', 'points.'], distractors: ['nineteen', 'nine'], translationNote: 'Dia meraih sembilan puluh poin.' },
  { vocabId: 'v_2_hundred', sentence: 'One hundred percent great!', tokens: ['One', 'hundred', 'percent', 'great!'], distractors: ['zero', 'ten'], translationNote: 'Seratus persen hebat!' },
];

// ============================================================================
// BUILDERS FOR EACH OF THE 6 CHALLENGE TYPES
// ============================================================================

export function buildPeoplePictureChoice(targetId?: DesaVocabId): DuolingoChallenge {
  const target = targetId ?? pickRandom(DESA_ALL_VOCAB_IDS);
  const entry = VOCAB_BY_ID[target]!;
  const targetSig = getVisualSignature(target);
  const tag = getCategoryTag(target);

  // Prefer same-category distractors first, ensuring distinct images/visuals so cards are unambiguous
  const sameCatPool = getCategoryPool(target);
  const distinctSameCat = shuffle(
    sameCatPool.filter((id) => id !== target && getVisualSignature(id) !== targetSig),
  );
  const distinctAll = shuffle(
    DESA_ALL_VOCAB_IDS.filter(
      (id) => id !== target && getVisualSignature(id) !== targetSig,
    ),
  );

  const chosenOthers: string[] = [];
  const usedSigs = new Set<string>([targetSig]);
  for (const id of [...distinctSameCat, ...distinctAll]) {
    if (chosenOthers.length >= 2) break;
    const sig = getVisualSignature(id);
    if (!usedSigs.has(sig)) {
      usedSigs.add(sig);
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
      imageSrc: VOCAB_IMAGE_BY_ID[id] ?? '',
      visual: VOCAB_VISUAL_BY_ID[id],
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
    speakerImage: VOCAB_IMAGE_BY_ID[seed.speakerId] ?? '',
    speakerVisual: VOCAB_VISUAL_BY_ID[seed.speakerId],
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
    speakerImage: VOCAB_IMAGE_BY_ID[seed.speakerId] ?? '',
    speakerVisual: VOCAB_VISUAL_BY_ID[seed.speakerId],
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
  const prefix = targetId ? getCategoryPrefix(targetId) : '';
  const sameCategoryFallback = prefix
    ? DIALOGUE_SEEDS.filter((s) => s.vocabId.startsWith(prefix))
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
    speakerAImage: VOCAB_IMAGE_BY_ID[seed.speakerAId] ?? '',
    speakerAVisual: VOCAB_VISUAL_BY_ID[seed.speakerAId],
    speakerAName: seed.speakerAName,
    speakerALine: seed.speakerALine,
    speakerAHints: seed.speakerAHints,
    speakerBImage: VOCAB_IMAGE_BY_ID[seed.speakerBId] ?? '',
    speakerBVisual: VOCAB_VISUAL_BY_ID[seed.speakerBId],
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
  const target = preferredId ?? pickRandom(DESA_ALL_VOCAB_IDS);
  const samePool = getCategoryPool(target);
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

const DESA_VALID_SET = new Set<string>(DESA_ALL_VOCAB_IDS);

function sanitizeDesaVocabPool(preferredIds?: readonly string[]): DesaVocabId[] {
  if (!preferredIds || preferredIds.length === 0) return [];
  const unique: DesaVocabId[] = [];
  const seen = new Set<string>();
  for (const id of preferredIds) {
    if (DESA_VALID_SET.has(id) && !seen.has(id)) {
      seen.add(id);
      unique.push(id as DesaVocabId);
    }
  }
  return unique;
}

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
  preferredVocabIds?: readonly string[],
): DesaVocabId {
  const validPreferred = sanitizeDesaVocabPool(preferredVocabIds);
  const basePool = validPreferred.length > 0 ? validPreferred : DESA_ALL_VOCAB_IDS;
  const filtered = basePool.filter((id) => id !== excludeVocabId);
  const candidates = filtered.length > 0 ? filtered : basePool;
  const scored = candidates.map((id) => ({
    id,
    score: (progress[id]?.b || 0) + Math.random() * 2.5,
  }));
  scored.sort((a, b) => a.score - b.score);
  return scored[0].id;
}

export function pickRandomPeopleChallenge(options?: {
  wordProgress?: Record<string, WordProgress>;
  preferredVocabIds?: readonly string[];
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
    options?.preferredVocabIds,
  );
  return buildChallengeOfType(chosenType, targetId);
}

/**
 * Builds a balanced deck of N Desa Sapaan (all 126 A1 words across 8 topics) Duolingo challenges
 * ensuring all 6 challenge types appear randomly in the session
 * (no two consecutive challenges of the same type) and respecting assigned door wordIds when provided.
 */
export function buildPeopleDuolingoDeck(
  count = 10,
  options?: {
    allowSpeak?: boolean;
    wordProgress?: Record<string, WordProgress>;
    preferredVocabIds?: readonly string[];
  },
): DuolingoChallenge[] {
  const allowSpeak = options?.allowSpeak ?? true;
  const baseTypes = ALL_DUOLINGO_TYPES.filter((t) => (allowSpeak ? true : t !== 'speak'));
  const deck: DuolingoChallenge[] = [];
  let prevType: DuolingoChallengeType | null = null;
  let prevVocab: string | null = null;

  const guaranteed = shuffle(baseTypes);
  const progress = options?.wordProgress ?? {};
  const validPreferred = sanitizeDesaVocabPool(options?.preferredVocabIds);
  const sortByMastery = (ids: readonly DesaVocabId[]) =>
    [...ids]
      .map((id) => ({ id, score: (progress[id]?.b || 0) + Math.random() * 1.8 }))
      .sort((a, b) => a.score - b.score)
      .map((x) => x.id);

  const preferredOrdered = sortByMastery(validPreferred);
  const remainingAll = sortByMastery(
    DESA_ALL_VOCAB_IDS.filter((id) => !validPreferred.includes(id)),
  );
  const vocabCycle =
    preferredOrdered.length > 0 ? [...preferredOrdered, ...remainingAll] : remainingAll;

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

    let vocabId = vocabCycle[i % vocabCycle.length];
    if (vocabId === prevVocab && vocabCycle.length > 1) {
      vocabId = vocabCycle[(i + 1) % vocabCycle.length];
    }

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
    .replace(/-/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
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
  if (!userNorm || !targetNorm) return false;
  if (userNorm === targetNorm) return true;
  if (acceptedVariants) {
    return acceptedVariants.some((v) => normalizeSentenceText(v) === userNorm);
  }
  return false;
}

const NUMBER_WORDS_0_TO_100: Record<string, string> = {
  '0': 'zero',
  '1': 'one',
  '2': 'two',
  '3': 'three',
  '4': 'four',
  '5': 'five',
  '6': 'six',
  '7': 'seven',
  '8': 'eight',
  '9': 'nine',
  '10': 'ten',
  '11': 'eleven',
  '12': 'twelve',
  '13': 'thirteen',
  '14': 'fourteen',
  '15': 'fifteen',
  '16': 'sixteen',
  '17': 'seventeen',
  '18': 'eighteen',
  '19': 'nineteen',
  '20': 'twenty',
  '30': 'thirty',
  '40': 'forty',
  '50': 'fifty',
  '60': 'sixty',
  '70': 'seventy',
  '80': 'eighty',
  '90': 'ninety',
  '100': 'one hundred',
};

const SPEECH_SYNONYMS: Record<string, string> = {
  mr: 'mister',
  mrs: 'missus',
  ms: 'miss',
  ok: 'okay',
  grey: 'gray',
  hi: 'hi',
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
    const numRep = NUMBER_WORDS_0_TO_100[w];
    if (numRep) {
      expanded.push(...numRep.split(' '));
      continue;
    }
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
