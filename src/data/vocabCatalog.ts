import { CategoryDef, VocabEntry, WordProgress, ZoneId } from '../types/game';

export const MAST_B = 3;

export const CATEGORIES: CategoryDef[] = [
  // Zone 1: desa_sapaan (126 A1 words)
  { id: 0, name: 'Hello and Goodbye', icon: '👋', zoneId: 'desa_sapaan' },
  { id: 1, name: 'People', icon: '🧑', zoneId: 'desa_sapaan' },
  { id: 2, name: 'Numbers 0 to 100', icon: '🔢', zoneId: 'desa_sapaan' },
  { id: 3, name: 'Family', icon: '👨‍👩‍👧', zoneId: 'desa_sapaan' },
  { id: 4, name: 'Colors', icon: '🎨', zoneId: 'desa_sapaan' },
  { id: 5, name: 'Personal Information', icon: '🪪', zoneId: 'desa_sapaan' },
  { id: 6, name: 'The Body', icon: '🧍', zoneId: 'desa_sapaan' },
  { id: 7, name: 'The Head and Face', icon: '😊', zoneId: 'desa_sapaan' },

  // Zone 2: pasar_rasa (82 A1 words)
  { id: 8, name: 'Clothes and Shoes', icon: '👕', zoneId: 'pasar_rasa' },
  { id: 9, name: 'Household Items', icon: '🍽️', zoneId: 'pasar_rasa' },
  { id: 10, name: 'Food and Ingredients', icon: '🥗', zoneId: 'pasar_rasa' },
  { id: 11, name: 'Food and Drinks', icon: '☕', zoneId: 'pasar_rasa' },

  // Zone 3: hutan_satwa (57 A1 words)
  { id: 12, name: 'Animals', icon: '🐾', zoneId: 'hutan_satwa' },
  { id: 13, name: 'The Weather and Nature', icon: '🌦️', zoneId: 'hutan_satwa' },
  { id: 14, name: 'Free Time Activities', icon: '⚽', zoneId: 'hutan_satwa' },

  // Zone 4: gerbang_kota (110 A1 words)
  { id: 15, name: 'House and Apartment', icon: '🏠', zoneId: 'gerbang_kota' },
  { id: 16, name: 'Furniture and Home Appliances', icon: '🛋️', zoneId: 'gerbang_kota' },
  { id: 17, name: 'Jobs', icon: '💼', zoneId: 'gerbang_kota' },
  { id: 18, name: 'School', icon: '🎒', zoneId: 'gerbang_kota' },
  { id: 19, name: 'City', icon: '🏙️', zoneId: 'gerbang_kota' },
  { id: 20, name: 'Countries and Nationalities', icon: '🌍', zoneId: 'gerbang_kota' },
  { id: 21, name: 'Transportation', icon: '🚗', zoneId: 'gerbang_kota' },

  // Zone 5: menara_waktu (174 A1 words)
  { id: 22, name: 'Months and Seasons', icon: '📅', zoneId: 'menara_waktu' },
  { id: 23, name: 'Time and Date', icon: '⏰', zoneId: 'menara_waktu' },
  { id: 24, name: 'Opposite Adjectives', icon: '⚖️', zoneId: 'menara_waktu' },

  // Zone 6: gua_portal (59 A1 words + 71 IELTS words)
  // NOTE: catId 25 MUST remain 'Persiapan IELTS A1' because diglosaCatalog filters catId === 25.
  { id: 25, name: 'Persiapan IELTS A1', icon: '🎓', zoneId: 'gua_portal' },

  // Remaining Zone 5: menara_waktu
  { id: 26, name: 'Basic Verbs', icon: '🏃', zoneId: 'menara_waktu' },
  { id: 27, name: 'Describing People', icon: '🎭', zoneId: 'menara_waktu' },
  { id: 28, name: 'Useful Verbs', icon: '💡', zoneId: 'menara_waktu' },
  { id: 29, name: 'Simple Verbs', icon: '⚡', zoneId: 'menara_waktu' },

  // Remaining Zone 6: gua_portal
  { id: 30, name: 'Directions and Continents', icon: '🧭', zoneId: 'gua_portal' },
  { id: 31, name: 'Adverbs and Pronouns', icon: '❓', zoneId: 'gua_portal' },
  { id: 32, name: 'Prepositions and Determiners', icon: '📍', zoneId: 'gua_portal' },
];

type RawPdfRow = [word: string, phonetic: string, pos: string, defEn: string, meaningId: string];

// 100% Complete English A1 Wordlist extracted from English-wordlist-A1.pdf (32 topics, 608 entries)
const PDF_A1_ROWS: Record<number, RawPdfRow[]> = {
  0: [
    ['Hello', '/hɛˈloʊ/', 'intj.', 'A word we say when greeting someone or starting a phone call.', 'halo'],
    ['Goodbye', '/ɡʊdˈbaɪ/', 'intj.', 'A word we say when leaving or ending a phone call.', 'selamat tinggal'],
    ['Hi', '/haɪ/', 'intj.', 'A casual word used to greet someone.', 'hai'],
    ['Bye', '/baɪ/', 'intj.', 'A word we say when leaving or someone is leaving.', 'sampai jumpa'],
    ['Good morning', '/ɡʊd ˈmɔrnɪŋ/', 'intj.', 'A greeting used in the morning.', 'selamat pagi'],
    ['Good afternoon', '/ɡʊd ˌæftɚˈnun/', 'intj.', 'A greeting used in the afternoon.', 'selamat siang'],
    ['Good evening', '/ɡʊd ˈivnɪŋ/', 'intj.', 'A greeting used in the evening.', 'selamat malam'],
    ['Good night', '/ɡʊd ˈnaɪt/', 'intj.', 'A word we say to say goodbye at night or before bed.', 'selamat tidur'],
    ['Thank you', '/θæŋk ju/', 'intj.', 'A phrase to show gratitude.', 'terima kasih'],
    ['Thanks', '/θæŋks/', 'intj.', 'A casual way to express gratitude.', 'makasih'],
    ['Please', '/pliːz/', 'adv.', 'Used to politely ask for something.', 'tolong / silakan'],
    ['OK', '/oʊˈkeɪ/', 'intj.', 'Used to show agreement.', 'oke / baiklah'],
    ['Yes', '/jɛs/', 'intj.', 'Used to show agreement or that something is true.', 'ya'],
    ['No', '/noʊ/', 'intj.', 'Used to show disagreement or that something is untrue.', 'tidak'],
    ['Sorry', '/ˈsɑːri/', 'intj.', 'Used to apologize or express embarrassment.', 'maaf'],
    ['Welcome', '/ˈwɛlkəm/', 'intj.', 'Used to greet someone upon arrival.', 'selamat datang'],
  ],
  1: [
    ['Man', '/mæn/', 'n.', 'A person who is a male adult.', 'pria dewasa'],
    ['Woman', '/ˈwʊmən/', 'n.', 'A person who is a female adult.', 'wanita dewasa'],
    ['Boy', '/bɔɪ/', 'n.', 'Someone who is a child and a male.', 'anak laki-laki'],
    ['Girl', '/ɡɝːl/', 'n.', 'Someone who is a child and a female.', 'anak perempuan'],
    ['Friend', '/frɛnd/', 'n.', 'Someone we know well and trust, but they are normally not part of our family.', 'teman'],
    ['Boyfriend', '/ˈbɔɪfrɛnd/', 'n.', 'A man that you love and are in a relationship with.', 'pacar laki-laki'],
    ['Girlfriend', '/ˈɡɝːlfrɛnd/', 'n.', 'A lady that you love and are in a relationship with.', 'pacar perempuan'],
    ['Person', '/ˈpɝːsən/', 'n.', 'One human being, when gender or age is not relevant.', 'orang / individu'],
    ['People', '/ˈpiːpəl/', 'n.', 'Human beings as a group, including men, women, and children.', 'orang-orang'],
    ['Adult', '/əˈdʌlt/', 'n.', 'A fully grown man or woman.', 'orang dewasa'],
    ['Baby', '/ˈbeɪbi/', 'n.', 'A child who is very young, usually too young to walk or speak.', 'bayi'],
    ['Mr', '/ˈmɪstɚ/', 'n.', "A title used before a man's name to address or refer to him politely or formally.", 'Tuan / Bapak'],
    ['Mrs', '/ˈmɪsɪz/', 'n.', "A title used before a woman's surname or full name to address or refer to a married woman.", 'Nyonya / Ibu'],
    ['Miss', '/mɪs/', 'n.', "A title we use before an unmarried woman's family name or full name to address or refer to her.", 'Nona'],
  ],
  2: [
    ['Zero', '/ˈzɪroʊ/', 'num.', 'The number 0.', 'nol (0)'],
    ['One', '/wʌn/', 'num.', 'The number 1.', 'satu (1)'],
    ['Two', '/tuː/', 'num.', 'The number 2.', 'dua (2)'],
    ['Three', '/θriː/', 'num.', 'The number 3.', 'tiga (3)'],
    ['Four', '/fɔːr/', 'num.', 'The number 4.', 'empat (4)'],
    ['Five', '/faɪv/', 'num.', 'The number 5.', 'lima (5)'],
    ['Six', '/sɪks/', 'num.', 'The number 6.', 'enam (6)'],
    ['Seven', '/ˈsɛvən/', 'num.', 'The number 7.', 'tujuh (7)'],
    ['Eight', '/eɪt/', 'num.', 'The number 8.', 'delapan (8)'],
    ['Nine', '/naɪn/', 'num.', 'The number 9.', 'sembilan (9)'],
    ['Ten', '/tɛn/', 'num.', 'The number 10.', 'sepuluh (10)'],
    ['Eleven', '/ɪˈlɛvən/', 'num.', 'The number 11.', 'sebelas (11)'],
    ['Twelve', '/twɛlv/', 'num.', 'The number 12.', 'dua belas (12)'],
    ['Thirteen', '/ˈθɝːˌtiːn/', 'num.', 'The number 13.', 'tiga belas (13)'],
    ['Fourteen', '/ˈfɔːrˌtiːn/', 'num.', 'The number 14.', 'empat belas (14)'],
    ['Fifteen', '/ˈfɪfˌtiːn/', 'num.', 'The number 15.', 'lima belas (15)'],
    ['Sixteen', '/ˈsɪksˌtiːn/', 'num.', 'The number 16.', 'enam belas (16)'],
    ['Seventeen', '/ˈsɛvənˌtiːn/', 'num.', 'The number 17.', 'tujuh belas (17)'],
    ['Eighteen', '/ˈeɪˌtiːn/', 'num.', 'The number 18.', 'delapan belas (18)'],
    ['Nineteen', '/ˈnaɪnˌtiːn/', 'num.', 'The number 19.', 'sembilan belas (19)'],
    ['Twenty', '/ˈtwɛnti/', 'num.', 'The number 20.', 'dua puluh (20)'],
    ['Thirty', '/ˈθɝːti/', 'num.', 'The number 30.', 'tiga puluh (30)'],
    ['Forty', '/ˈfɔːrti/', 'num.', 'The number 40.', 'empat puluh (40)'],
    ['Fifty', '/ˈfɪfti/', 'num.', 'The number 50.', 'lima puluh (50)'],
    ['Sixty', '/ˈsɪksti/', 'num.', 'The number 60.', 'enam puluh (60)'],
    ['Seventy', '/ˈsɛvənˌti/', 'num.', 'The number 70.', 'tujuh puluh (70)'],
    ['Eighty', '/ˈeɪti/', 'num.', 'The number 80.', 'delapan puluh (80)'],
    ['Ninety', '/ˈnaɪnti/', 'num.', 'The number 90.', 'sembilan puluh (90)'],
    ['Hundred', '/ˈhʌndrəd/', 'num.', 'The number 100.', 'seratus (100)'],
  ],
  3: [
    ['Parent', '/ˈpɛr.ənt/', 'n.', 'A mother or father.', 'orang tua'],
    ['Father', '/ˈfɑː.ðɚ/', 'n.', 'A male parent.', 'ayah'],
    ['Mother', '/ˈmʌð.ɚ/', 'n.', 'A female parent.', 'ibu'],
    ['Dad', '/dæd/', 'n.', 'Informal word for father.', 'papa / ayah (santai)'],
    ['Mom', '/mɑːm/', 'n.', 'Informal word for mother.', 'mama / ibu (santai)'],
    ['Wife', '/waɪf/', 'n.', 'A married woman.', 'istri'],
    ['Husband', '/ˈhʌz.bənd/', 'n.', 'A married man.', 'suami'],
    ['Child', '/tʃaɪld/', 'n.', 'A son or daughter.', 'anak'],
    ['Son', '/sʌn/', 'n.', 'A male child.', 'anak laki-laki kandung'],
    ['Daughter', '/ˈdɑː.tɚ/', 'n.', 'A female child.', 'anak perempuan kandung'],
    ['Sister', '/ˈsɪs.tɚ/', 'n.', 'A female sibling.', 'saudara perempuan'],
    ['Brother', '/ˈbrʌð.ɚ/', 'n.', 'A male sibling.', 'saudara laki-laki'],
    ['Family', '/ˈfæ.mə.li/', 'n.', 'Relatives by blood or marriage.', 'keluarga'],
    ['Grandmother', '/ˈɡræn.mʌð.ɚ/', 'n.', "A mother's or father's mom.", 'nenek'],
    ['Grandfather', '/ˈɡræn.fɑː.ðɚ/', 'n.', "A mother's or father's dad.", 'kakek'],
    ['Grandchild', '/ˈɡræn.tʃaɪld/', 'n.', "A person's child's child.", 'cucu'],
    ['Aunt', '/ænt/ or /ɑːnt/', 'n.', "A parent's sister or their wife.", 'bibi / tante'],
    ['Uncle', '/ˈʌŋ.kəl/', 'n.', "A parent's brother or their husband.", 'paman / om'],
    ['Niece', '/niːs/', 'n.', "A sibling's daughter.", 'keponakan perempuan'],
    ['Nephew', '/ˈnɛ.fju/', 'n.', "A sibling's son.", 'keponakan laki-laki'],
    ['Cousin', '/ˈkʌ.zɪn/', 'n.', 'A child of an aunt or uncle.', 'sepupu'],
  ],
  4: [
    ['Black', '/blæk/', 'adj.', 'Having the color that is the darkest, like most crows.', 'hitam'],
    ['White', '/waɪt/', 'adj.', 'Having the color that is the lightest, like snow.', 'putih'],
    ['Blue', '/bluː/', 'adj.', 'Having the color of the ocean or clear sky at daytime.', 'biru'],
    ['Green', '/ɡriːn/', 'adj.', 'Having the color of fresh grass or most plant leaves.', 'hijau'],
    ['Yellow', '/ˈjɛloʊ/', 'adj.', 'Having the color of lemons or the sun.', 'kuning'],
    ['Red', '/rɛd/', 'adj.', 'Having the color of tomatoes or blood.', 'merah'],
    ['Pink', '/pɪŋk/', 'adj.', 'Having the color of strawberry ice cream.', 'merah muda / pink'],
    ['Orange', '/ˈɔrɪndʒ/', 'adj.', 'Having the color of carrots or pumpkins.', 'jingga / oranye'],
    ['Purple', '/ˈpɝːpəl/', 'adj.', 'Having the color of most ripe eggplants.', 'ungu'],
    ['Gray', '/ɡreɪ/', 'adj.', 'Having a color between white and black, like most koalas or dolphins.', 'abu-abu'],
    ['Brown', '/braʊn/', 'adj.', 'Having the color of chocolate ice cream.', 'cokelat'],
    ['Dark', '/dɑrk/', 'adj.', '(Of a color) having a deep or intense hue.', 'gelap (warna)'],
    ['Light', '/laɪt/', 'adj.', '(Of color) having less intensity, often because of a small amount of pigment.', 'terang / cerah (warna)'],
    ['Color', '/ˈkʌlər/', 'n.', 'A quality such as red, green, blue, yellow, etc., that we see when we look at something.', 'warna'],
  ],
  5: [
    ['Name', '/neɪm/', 'n.', 'The word someone or something is called or known by.', 'nama'],
    ['Last name', '/læst neɪm/', 'n.', 'The name we share with our family, parents, or siblings.', 'nama belakang / marga'],
    ['Age', '/eɪdʒ/', 'n.', 'The number of years something has existed or someone has been alive.', 'usia / umur'],
    ['Address', '/ˈæd.rɛs/', 'n.', 'The information that helps us find a place so we can go there or send a letter or package to that place.', 'alamat'],
    ['Birthday', '/ˈbɝːθ.deɪ/', 'n.', 'The day and month of your birth in every year.', 'hari ulang tahun'],
    ['Birthdate', '/ˈbɝːθ.deɪt/', 'n.', 'The date, including the day, month, and year, on which someone was born.', 'tanggal lahir'],
    ['Single', '/ˈsɪŋ.ɡəl/', 'adj.', 'Not in a relationship or marriage.', 'lajang / belum menikah'],
    ['Married', '/ˈmær.id/', 'adj.', 'Having a wife or husband.', 'menikah'],
    ['Passport', '/ˈpæs.pɔrt/', 'n.', 'An official document issued by a government that identifies someone as a citizen of a particular country, needed when leaving a country and entering another one.', 'paspor'],
    ['Phone number', '/foʊn ˈnʌm.bɚ/', 'n.', "The number used for calling someone's phone.", 'nomor telepon'],
    ['Question', '/ˈkwɛs.tʃən/', 'n.', "A sentence, phrase, or word used to ask for information or to test someone's knowledge.", 'pertanyaan'],
    ['Answer', '/ˈæn.sɚ/', 'n.', 'Something we say, write, or do when replying to a question.', 'jawaban'],
  ],
  6: [
    ['Body', '/ˈbɑː.di/', 'n.', "Our or an animal's hands, legs, head, and every other part together.", 'tubuh / badan'],
    ['Hand', '/hænd/', 'n.', 'The part of our body at the end of our arm that we use to grab, move, or feel things.', 'tangan'],
    ['Arm', '/ɑrm/', 'n.', 'One of the two body parts connected to the shoulder and ending with fingers.', 'lengan'],
    ['Foot', '/fʊt/', 'n.', 'The body part at the end of our leg that we stand and walk on.', 'telapak kaki'],
    ['Head', '/hɛd/', 'n.', 'The top part of the body, where the brain and face are located.', 'kepala'],
    ['Leg', '/lɛɡ/', 'n.', 'Each of the two long body parts that we use when walking.', 'kaki / tungkai'],
    ['Knee', '/niː/', 'n.', 'The body part in the middle of the leg that helps it bend.', 'lutut'],
    ['Back', '/bæk/', 'n.', 'The part of our body between the neck and legs that we cannot see.', 'punggung'],
    ['Stomach', '/ˈstʌ.mək/', 'n.', 'The body part inside our body where the food we eat goes.', 'perut / lambung'],
  ],
  7: [
    ['Hair', '/hɛr/', 'n.', 'The thin thread-like things that grow on our head.', 'rambut'],
    ['Neck', '/nɛk/', 'n.', 'The body part that connects the head to the shoulders.', 'leher'],
    ['Face', '/feɪs/', 'n.', 'The front part of our head, where our eyes, lips, and nose are located.', 'wajah'],
    ['Eye', '/aɪ/', 'n.', 'A body part on our face that we use for seeing.', 'mata'],
    ['Nose', '/noʊz/', 'n.', 'The body part in the middle of our face used for smelling and breathing.', 'hidung'],
    ['Ear', '/ɪr/', 'n.', 'Each of the two body parts we use for hearing.', 'telinga'],
    ['Cheek', '/tʃiːk/', 'n.', 'Any of the two soft sides of our face that are below our eyes.', 'pipi'],
    ['Chin', '/tʃɪn/', 'n.', 'The lowest part of our face, below the mouth.', 'dagu'],
    ['Mouth', '/maʊθ/', 'n.', 'The body part used for eating, speaking, and breathing.', 'mulut'],
    ['Tooth', '/tuːθ/', 'n.', 'One of the hard, white parts in our mouth used for chewing and biting food.', 'gigi'],
    ['Lip', '/lɪp/', 'n.', 'Each of the two soft body parts that surround our mouth.', 'bibir'],
  ],
  8: [
    ['Clothes', '/kloʊðz/', 'n.', 'Things we wear to cover our body.', 'pakaian'],
    ['Shirt', '/ʃɝːt/', 'n.', 'A top with sleeves and buttons.', 'kemeja'],
    ['T-shirt', '/ˈtiː.ʃɝːt/', 'n.', 'A casual short-sleeved top.', 'kaus oblong'],
    ['Pants', '/pænts/', 'n.', 'Clothing that covers both legs.', 'celana panjang'],
    ['Dress', '/drɛs/', 'n.', 'One-piece clothing for women.', 'gaun / rok terusan'],
    ['Skirt', '/skɝːt/', 'n.', 'A piece of clothing worn around the waist.', 'rok'],
    ['Coat', '/koʊt/', 'n.', 'Outerwear for warmth or rain.', 'mantel'],
    ['Jacket', '/ˈdʒæk.ɪt/', 'n.', 'A short coat with sleeves.', 'jaket'],
    ['Jeans', '/dʒiːnz/', 'n.', 'Denim pants for casual wear.', 'celana jin'],
    ['Sweater', '/ˈswɛ.tɚ/', 'n.', 'A warm long-sleeved top.', 'sweter'],
    ['Suit', '/suːt/', 'n.', 'A matching jacket and pants.', 'setelan jas'],
    ['Tie', '/taɪ/', 'n.', 'A narrow fabric worn around the collar.', 'dasi'],
    ['Hat', '/hæt/', 'n.', 'Clothing worn on the head.', 'topi'],
    ['Purse', '/pɝːs/', 'n.', 'A small bag for carrying items.', 'dompet / tas tangan'],
    ['Shoe', '/ʃuː/', 'n.', 'Footwear for protection.', 'sepatu'],
    ['Boot', '/buːt/', 'n.', 'A strong shoe covering the ankle.', 'sepatu bot'],
    ['Sock', '/sɑːk/', 'n.', 'Soft fabric worn on feet.', 'kaus kaki'],
    ['Pajamas', '/pəˈdʒæ.məz/', 'n.', 'Clothes worn for sleeping.', 'piyama / baju tidur'],
    ['Underwear', '/ˈʌn.dɚ.wɛr/', 'n.', 'Clothes worn under other clothing.', 'pakaian dalam'],
    ['Swimsuit', '/ˈswɪm.suːt/', 'n.', 'Clothing worn for swimming.', 'baju renang'],
  ],
  9: [
    ['Dish', '/dɪʃ/', 'n.', 'A shallow container for food.', 'wadah / piring saji'],
    ['Spoon', '/spuːn/', 'n.', 'A tool for eating or stirring.', 'sendok'],
    ['Fork', '/fɔːrk/', 'n.', 'A tool with prongs for eating.', 'garpu'],
    ['Knife', '/naɪf/', 'n.', 'A sharp tool for cutting.', 'pisau'],
    ['Plate', '/pleɪt/', 'n.', 'A flat dish for food.', 'piring'],
    ['Glass', '/ɡlæs/', 'n.', 'A container for drinks.', 'gelas'],
    ['Bottle', '/ˈbɑː.t̬əl/', 'n.', 'A container for liquids.', 'botol'],
    ['Cup', '/kʌp/', 'n.', 'A small container for drinks.', 'cangkir'],
    ['Soap', '/soʊp/', 'n.', 'A substance for washing.', 'sabun'],
    ['Brush', '/brʌʃ/', 'n.', 'A tool for cleaning or grooming.', 'sikat / kuas'],
    ['Toothbrush', '/ˈtuːθ.brʌʃ/', 'n.', 'A brush for cleaning teeth.', 'sikat gigi'],
    ['Pillow', '/ˈpɪl.oʊ/', 'n.', 'A soft cushion for the head.', 'bantal'],
    ['Trash can', '/træʃ kæn/', 'n.', 'A container for garbage.', 'tempat sampah'],
    ['Box', '/bɑːks/', 'n.', 'A container for storing things.', 'kotak'],
    ['Thing', '/θɪŋ/', 'n.', 'An object with no specific name.', 'benda / barang'],
    ['Ball', '/bɔːl/', 'n.', 'A round object used in games.', 'bola'],
    ['Doll', '/dɑːl/', 'n.', 'A toy shaped like a small baby.', 'boneka'],
  ],
  10: [
    ['Food', '/fuːd/', 'n.', 'What people and animals eat.', 'makanan'],
    ['Meat', '/miːt/', 'n.', 'Animal flesh used as food.', 'daging'],
    ['Fish', '/fɪʃ/', 'n.', 'Edible flesh of a fish.', 'daging ikan'],
    ['Chicken', '/ˈtʃɪ.kɪn/', 'n.', 'Meat from a chicken.', 'daging ayam'],
    ['Vegetable', '/ˈvɛ.dʒ.tə.bəl/', 'n.', 'A plant used as food.', 'sayuran'],
    ['Cucumber', '/ˈkjuː.kʌm.bɚ/', 'n.', 'A long green fruit used in salads.', 'mentimun'],
    ['Potato', '/pəˈteɪ.toʊ/', 'n.', 'A round vegetable grown underground.', 'kentang'],
    ['Onion', '/ˈʌn.jən/', 'n.', 'A strong-smelling vegetable with layers.', 'bawang bombai / merah'],
    ['Tomato', '/təˈmeɪ.toʊ/', 'n.', 'A red soft fruit used in salads.', 'tomat'],
    ['Carrot', '/ˈkæ.rət/', 'n.', 'A long orange vegetable.', 'wortel'],
    ['Pepper', '/ˈpɛ.pɚ/', 'n.', 'A spicy seasoning.', 'lada / merica'],
    ['Fruit', '/fruːt/', 'n.', 'Edible plant growth from trees or bushes.', 'buah'],
    ['Apple', '/ˈæ.pəl/', 'n.', 'A round fruit with red, yellow, or green skin.', 'apel'],
    ['Orange', '/ˈɔːr.ɪndʒ/', 'n.', 'A juicy round fruit with thick skin.', 'jeruk'],
    ['Grape', '/ɡreɪp/', 'n.', 'A small round fruit growing in bunches.', 'anggur'],
    ['Banana', '/bəˈnæ.nə/', 'n.', 'A long curved yellow fruit.', 'pisang'],
    ['Peach', '/piːtʃ/', 'n.', 'A soft juicy fruit with a pit.', 'persik'],
    ['Lemon', '/ˈlɛ.mən/', 'n.', 'A sour yellow fruit.', 'lemon'],
    ['Milk', '/mɪlk/', 'n.', 'A white liquid from cows, goats, or sheep.', 'susu'],
    ['Cheese', '/tʃiːz/', 'n.', 'A soft or hard dairy product.', 'keju'],
    ['Butter', '/ˈbʌ.tɚ/', 'n.', 'A soft yellow spread made from cream.', 'mentega'],
    ['Egg', '/ɛɡ/', 'n.', 'A round food item produced by chickens.', 'telur'],
    ['Cream', '/kriːm/', 'n.', 'The thick part of milk.', 'krim'],
  ],
  11: [
    ['Meal', '/miːl/', 'n.', 'Food eaten at different times of day.', 'hidangan / waktu makan'],
    ['Breakfast', '/ˈbrɛk.fəst/', 'n.', 'The first meal of the day.', 'sarapan'],
    ['Lunch', '/lʌntʃ/', 'n.', 'A meal eaten in the middle of the day.', 'makan siang'],
    ['Dinner', '/ˈdɪn.ɚ/', 'n.', 'The main meal, usually in the evening.', 'makan malam'],
    ['Tea', '/tiː/', 'n.', 'A drink made from dried tea leaves.', 'teh'],
    ['Coffee', '/ˈkɑː.fi/', 'n.', 'A hot drink made from coffee beans.', 'kopi'],
    ['Cake', '/keɪk/', 'n.', 'A sweet baked dessert.', 'kue'],
    ['Cookie', '/ˈkʊk.i/', 'n.', 'A small, sweet baked treat.', 'kue kering / biskuit'],
    ['Bread', '/brɛd/', 'n.', 'A baked food made from flour.', 'roti'],
    ['Honey', '/ˈhʌ.ni/', 'n.', 'A sweet liquid made by bees.', 'madu'],
    ['Jam', '/dʒæm/', 'n.', 'A thick sweet spread made from fruit.', 'selai'],
    ['Juice', '/dʒuːs/', 'n.', 'A drink made from fruits or vegetables.', 'jus'],
    ['Ice cream', '/ˈaɪs kriːm/', 'n.', 'A cold sweet dessert made from milk.', 'es krim'],
    ['Water', '/ˈwɔː.tɚ/', 'n.', 'A clear liquid needed for life.', 'air'],
    ['Rice', '/raɪs/', 'n.', 'Small white or brown grains used for food.', 'nasi / beras'],
    ['Chocolate milk', '/ˈtʃɑː.kə.lət mɪlk/', 'n.', 'Milk mixed with chocolate.', 'susu cokelat'],
    ['Soup', '/suːp/', 'n.', 'Liquid food made by boiling ingredients.', 'sup'],
    ['Salad', '/ˈsæl.əd/', 'n.', 'A mix of vegetables with sauce.', 'salad'],
    ['Pizza', '/ˈpiːt.sə/', 'n.', 'A flatbread topped with cheese and tomatoes.', 'pizza'],
    ['Sandwich', '/ˈsæn.wɪtʃ/', 'n.', 'Bread with meat, cheese, etc. inside.', 'roti lapis'],
    ['Sugar', '/ˈʃʊɡ.ɚ/', 'n.', 'A sweet substance from plants.', 'gula'],
    ['Salt', '/sɔːlt/', 'n.', 'A white substance used in food.', 'garam'],
  ],
  12: [
    ['Animal', '/ˈæn.ɪ.məl/', 'n.', 'A living thing that moves and needs food.', 'hewan'],
    ['Cat', '/kæt/', 'n.', 'A small furry pet with a tail.', 'kucing'],
    ['Dog', '/dɔːɡ/', 'n.', 'A loyal pet with four legs and a tail.', 'anjing'],
    ['Horse', '/hɔːrs/', 'n.', 'A large animal used for riding and racing.', 'kuda'],
    ['Sheep', '/ʃiːp/', 'n.', 'A farm animal raised for wool and meat.', 'domba'],
    ['Cow', '/kaʊ/', 'n.', 'A farm animal raised for milk and meat.', 'sapi'],
    ['Pig', '/pɪɡ/', 'n.', 'A fat farm animal with a curly tail.', 'babi'],
    ['Lion', '/ˈlaɪ.ən/', 'n.', 'A big wild cat with a mane.', 'singa'],
    ['Rabbit', '/ˈræb.ɪt/', 'n.', 'A small animal with long ears and soft fur.', 'kelinci'],
    ['Mouse', '/maʊs/', 'n.', 'A tiny animal with a long tail.', 'tikus'],
    ['Snake', '/sneɪk/', 'n.', 'A long, legless animal that can bite.', 'ular'],
    ['Fish', '/fɪʃ/', 'n.', 'A water animal with fins and gills.', 'ikan (hewan air)'],
    ['Elephant', '/ˈɛ.lɪ.fənt/', 'n.', 'A huge animal with a trunk.', 'gajah'],
    ['Bird', '/bɝːd/', 'n.', 'An animal with feathers and wings.', 'burung'],
    ['Chicken', '/ˈtʃɪ.kɪn/', 'n.', 'A farm bird raised for meat and eggs.', 'ayam (unggas)'],
  ],
  13: [
    ['Weather', '/ˈwɛ.ðɚ/', 'n.', 'Conditions of air and sky.', 'cuaca'],
    ['Fire', '/faɪr/', 'n.', 'Burning that creates heat and light.', 'api'],
    ['Hot', '/hɑːt/', 'adj.', 'Having a high temperature.', 'panas'],
    ['Cold', '/koʊld/', 'adj.', 'Having a low temperature.', 'dingin'],
    ['Sunny', '/ˈsʌ.ni/', 'adj.', 'Bright because of the sun.', 'cerah / terik'],
    ['Cloud', '/klaʊd/', 'n.', 'A white or gray mass in the sky.', 'awan'],
    ['Cloudy', '/ˈklaʊ.di/', 'adj.', 'Full of clouds.', 'berawan / mendung'],
    ['Rain', '/reɪn/', 'n.', 'Water falling from the sky.', 'hujan'],
    ['Rainy', '/ˈreɪ.ni/', 'adj.', 'Having lots of rain.', 'berhujan'],
    ['Snowy', '/ˈsnoʊ.i/', 'adj.', 'Having lots of snow.', 'bersalju'],
    ['Ice', '/aɪs/', 'n.', 'Frozen water.', 'es'],
    ['Nature', '/ˈneɪ.tʃɚ/', 'n.', 'Everything natural on Earth.', 'alam'],
    ['Sun', '/sʌn/', 'n.', 'The bright star that gives light.', 'matahari'],
    ['Moon', '/muːn/', 'n.', 'A round object seen at night.', 'bulan (satelit)'],
    ['Earth', '/ɝːθ/', 'n.', 'The planet we live on.', 'Bumi'],
    ['Sky', '/skaɪ/', 'n.', 'The space above Earth.', 'langit'],
    ['River', '/ˈrɪ.vɚ/', 'n.', 'A long flow of water.', 'sungai'],
    ['Sea', '/siː/', 'n.', 'Large salty water area.', 'laut'],
    ['Mountain', '/ˈmaʊn.tən/', 'n.', 'A tall natural landform.', 'gunung'],
    ['Beach', '/biːtʃ/', 'n.', 'Sandy land next to water.', 'pantai'],
    ['Forest', '/ˈfɔː.rɪst/', 'n.', 'A large area of trees.', 'hutan'],
    ['Island', '/ˈaɪ.lənd/', 'n.', 'Land surrounded by water.', 'pulau'],
    ['Star', '/stɑːr/', 'n.', 'A bright point in the sky.', 'bintang'],
    ['Tree', '/triː/', 'n.', 'A tall plant with leaves.', 'pohon'],
    ['Flower', '/ˈflaʊ.ɚ/', 'n.', 'A flower is the colorful part of a plant that makes seeds or fruit.', 'bunga'],
  ],
  14: [
    ['Hobby', '/ˈhɑː.bi/', 'n.', 'A fun activity done in free time.', 'hobi'],
    ['Movie', '/ˈmuː.vi/', 'n.', 'A story told with moving pictures.', 'film'],
    ['Music', '/ˈmjuː.zɪk/', 'n.', 'Sounds arranged in a pleasant way.', 'musik'],
    ['Guitar', '/ɡɪˈtɑːr/', 'n.', 'A six-string instrument played by plucking.', 'gitar'],
    ['Piano', '/piˈæn.oʊ/', 'n.', 'A keyboard instrument played by pressing keys.', 'piano'],
    ['Violin', '/ˌvaɪ.əˈlɪn/', 'n.', 'A string instrument played with a bow.', 'biola'],
    ['Swimming', '/ˈswɪ.mɪŋ/', 'n.', 'Moving through water using arms and legs.', 'berenang'],
    ['Soccer', '/ˈsɑː.kɚ/', 'n.', 'A sport where players kick a ball to score.', 'sepak bola'],
    ['Volleyball', '/ˈvɑː.liˌbɔːl/', 'n.', 'A sport where players hit a ball over a net.', 'bola voli'],
    ['Hiking', '/ˈhaɪ.kɪŋ/', 'n.', 'Walking long distances in nature for fun.', 'mendaki / jelajah alam'],
    ['Tennis', '/ˈtɛn.ɪs/', 'n.', 'A sport played with rackets and a ball.', 'tenis'],
    ['Bicycle', '/ˈbaɪ.sɪ.kəl/', 'n.', 'A two-wheeled vehicle powered by pedaling.', 'sepeda'],
    ['Sport', '/spɔːrt/', 'n.', 'A competitive physical activity.', 'olahraga'],
    ['Game', '/ɡeɪm/', 'n.', 'A fun activity using imagination or toys.', 'permainan'],
    ['Video game', '/ˈvɪ.di.oʊ ˌɡeɪm/', 'n.', 'A digital game played on a computer or console.', 'gim video'],
    ['Newspaper', '/ˈnuːzˌpeɪ.pɚ/', 'n.', 'Printed sheets with news and information.', 'koran'],
    ['Magazine', '/ˈmæɡ.əˌziːn/', 'n.', 'A colorful thin book with stories and pictures.', 'majalah'],
  ],
  15: [
    ['Building', '/ˈbɪl.dɪŋ/', 'n.', 'A structure with walls and a roof.', 'bangunan / gedung'],
    ['House', '/haʊs/', 'n.', 'A building where people live.', 'rumah'],
    ['Home', '/hoʊm/', 'n.', 'The place where we live.', 'tempat tinggal / hunian'],
    ['Apartment', '/əˈpɑːrt.mənt/', 'n.', 'A living space in a larger building.', 'apartemen'],
    ['Floor', '/flɔːr/', 'n.', 'The surface we walk on in a room.', 'lantai'],
    ['Door', '/dɔːr/', 'n.', 'A movable barrier to enter or exit.', 'pintu'],
    ['Window', '/ˈwɪn.doʊ/', 'n.', 'A glass space for light or air.', 'jendela'],
    ['Wall', '/wɔːl/', 'n.', 'A vertical structure for dividing spaces.', 'dinding / tembok'],
    ['Room', '/ruːm/', 'n.', 'A space in a building for activities.', 'ruangan / kamar'],
    ['Roof', '/ruːf/', 'n.', 'The top covering of a building.', 'atap'],
    ['Ceiling', '/ˈsiː.lɪŋ/', 'n.', 'The upper inside surface of a room.', 'langit-langit / plafon'],
    ['Living room', '/ˈlɪv.ɪŋ ruːm/', 'n.', 'A room for relaxing or socializing.', 'ruang keluarga / tamu'],
    ['Dining room', '/ˈdaɪ.nɪŋ ruːm/', 'n.', 'A room for eating meals.', 'ruang makan'],
    ['Kitchen', '/ˈkɪtʃ.ən/', 'n.', 'A room for cooking food.', 'dapur'],
    ['Bedroom', '/ˈbɛd.ruːm/', 'n.', 'A room for sleeping.', 'kamar tidur'],
    ['Bathroom', '/ˈbæθ.ruːm/', 'n.', 'A room with a toilet and sink.', 'kamar mandi'],
    ['Garden', '/ˈɡɑːr.dən/', 'n.', 'Land near a house for growing plants.', 'taman / kebun'],
    ['Upstairs', '/ʌpˈstɛrz/', 'adv.', 'On a higher level of a building.', 'di lantai atas'],
    ['Downstairs', '/ˈdaʊn.stɛrz/', 'adv.', 'On a lower level of a building.', 'di lantai bawah'],
    ['Closet', '/ˈklɑː.zɪt/', 'n.', 'A small storage space in a wall.', 'lemari pakaian / gudang kecil'],
    ['Part', '/pɑːrt/', 'n.', 'A piece of something bigger.', 'bagian'],
    ['Elevator', '/ˈɛ.lɪ.veɪ.tɚ/', 'n.', 'A moving box for going up or down.', 'lift'],
    ['Yard', '/jɑːrd/', 'n.', 'Land near a house for grass or plants.', 'halaman rumah'],
  ],
  16: [
    ['Desk', '/dɛsk/', 'n.', 'Furniture for working or writing.', 'meja kerja / belajar'],
    ['Chair', '/tʃɛr/', 'n.', 'Furniture for sitting.', 'kursi'],
    ['Table', '/ˈteɪ.bəl/', 'n.', 'Furniture for placing things or eating.', 'meja'],
    ['Sofa', '/ˈsoʊ.fə/', 'n.', 'A soft seat for multiple people.', 'sofa'],
    ['Bed', '/bɛd/', 'n.', 'Furniture for sleeping.', 'tempat tidur'],
    ['Cabinet', '/ˈkæb.ɪ.nət/', 'n.', 'Storage furniture with shelves or drawers.', 'lemari kabinet'],
    ['Fridge', '/frɪdʒ/', 'n.', 'A device to keep food cold.', 'kulkas'],
    ['TV', '/ˈtiː.viː/', 'n.', 'A screen for watching programs.', 'televisi'],
    ['Stove', '/stoʊv/', 'n.', 'Equipment for cooking food.', 'kompor'],
  ],
  17: [
    ['Money', '/ˈmʌ.ni/', 'n.', 'What we use to buy and sell things.', 'uang'],
    ['Job', '/dʒɑːb/', 'n.', 'Work we do to earn money.', 'pekerjaan / profesi'],
    ['Work', '/wɝːk/', 'n.', 'An activity done to earn money.', 'kerja / pekerjaan'],
    ['Doctor', '/ˈdɑːk.tɚ/', 'n.', 'A person who treats sick people.', 'dokter'],
    ['Dentist', '/ˈdɛn.tɪst/', 'n.', 'A person who takes care of teeth.', 'dokter gigi'],
    ['Nurse', '/nɝːs/', 'n.', 'Someone trained to care for sick people.', 'perawat'],
    ['Teacher', '/ˈtiː.tʃɚ/', 'n.', 'A person who teaches in a school.', 'guru'],
    ['Engineer', '/ˌɛn.dʒɪˈnɪr/', 'n.', 'A person who designs or builds things.', 'insinyur'],
    ['Actor', '/ˈæk.tɚ/', 'n.', 'A person who performs in movies or plays.', 'aktor'],
    ['Actress', '/ˈæk.trɪs/', 'n.', 'A woman who performs in movies or plays.', 'aktris'],
    ['Police officer', '/pəˈliːs ˈɑː.fɪ.sɚ/', 'n.', 'Someone who protects people and enforces laws.', 'petugas polisi'],
    ['Waiter', '/ˈweɪ.tɚ/', 'n.', 'A man who serves food in restaurants.', 'pelayan pria'],
    ['Waitress', '/ˈweɪ.trɪs/', 'n.', 'A woman who serves food in restaurants.', 'pelayan wanita'],
    ['Driver', '/ˈdraɪ.vɚ/', 'n.', 'A person who drives a vehicle.', 'pengemudi / sopir'],
  ],
  18: [
    ['School', '/skuːl/', 'n.', 'A place where children learn.', 'sekolah'],
    ['College', '/ˈkɑː.lɪdʒ/', 'n.', 'A place for higher education.', 'perguruan tinggi / akademi'],
    ['University', '/ˌjuː.nɪˈvɝː.sə.ti/', 'n.', 'A place for advanced studies and degrees.', 'universitas'],
    ['Preschool', '/ˈpriː.skuːl/', 'n.', 'A place for young children to learn and play.', 'prasekolah / TK'],
    ['Classroom', '/ˈklæs.ruːm/', 'n.', 'A room where students are taught.', 'ruang kelas'],
    ['Student', '/ˈstuː.dənt/', 'n.', 'A person studying at school or university.', 'siswa / mahasiswa'],
    ['Book', '/bʊk/', 'n.', 'Printed pages bound together for reading.', 'buku'],
    ['Notebook', '/ˈnoʊt.bʊk/', 'n.', 'A small book for writing or drawing.', 'buku catatan'],
    ['Bag', '/bæɡ/', 'n.', 'A container used to carry things.', 'tas'],
    ['Pen', '/pɛn/', 'n.', 'A tool for writing with ink.', 'pulpen'],
    ['Pencil', '/ˈpɛn.səl/', 'n.', 'A tool for writing or drawing with lead.', 'pensil'],
    ['Eraser', '/ɪˈreɪ.sɚ/', 'n.', 'A tool for removing pencil marks.', 'penghapus'],
    ['Marker', '/ˈmɑːr.kɚ/', 'n.', 'A pen with a thick tip.', 'spidol'],
    ['Homework', '/ˈhoʊm.wɝːk/', 'n.', 'Schoolwork done at home.', 'pekerjaan rumah (PR)'],
    ['History', '/ˈhɪs.tɚ.i/', 'n.', 'The study of past events.', 'sejarah'],
    ['Language', '/ˈlæŋ.ɡwɪdʒ/', 'n.', 'A system of spoken or written communication.', 'bahasa'],
    ['Science', '/ˈsaɪ.əns/', 'n.', 'The study of the natural world.', 'sains / IPA'],
    ['Class', '/klæs/', 'n.', 'A group of students learning together.', 'kelas'],
  ],
  19: [
    ['City', '/ˈsɪ.ti/', 'n.', 'A large populated area.', 'kota'],
    ['Town', '/taʊn/', 'n.', 'A smaller area than a city.', 'kota kecil'],
    ['Street', '/striːt/', 'n.', 'A public path for vehicles.', 'jalan'],
    ['Bank', '/bæŋk/', 'n.', 'A place for keeping and lending money.', 'bank'],
    ['Hospital', '/ˈhɑː.spɪ.təl/', 'n.', 'A place for medical care.', 'rumah sakit'],
    ['Restaurant', '/ˈrɛs.tə.rɑːnt/', 'n.', 'A place to eat meals.', 'restoran'],
    ['Movie theater', '/ˈmuː.vi ˈθiː.ə.tɚ/', 'n.', 'A place to watch movies.', 'bioskop'],
    ['Supermarket', '/ˈsuː.pɚˌmɑːr.kɪt/', 'n.', 'A large store for food and supplies.', 'supermarket / swalayan'],
    ['Post office', '/ˈpoʊst ˈɑː.fɪs/', 'n.', 'A place to send letters and packages.', 'kantor pos'],
    ['Bench', '/bɛntʃ/', 'n.', 'A long seat for multiple people.', 'bangku panjang'],
    ['Museum', '/mjuːˈziː.əm/', 'n.', 'A place for cultural and historical items.', 'museum'],
    ['Park', '/pɑːrk/', 'n.', 'A public place with grass and trees.', 'taman kota'],
    ['Hotel', '/hoʊˈtɛl/', 'n.', 'A place to stay while traveling.', 'hotel'],
    ['Police', '/pəˈliːs/', 'n.', 'People who enforce laws.', 'polisi'],
    ['Map', '/mæp/', 'n.', 'An image showing locations.', 'peta'],
  ],
  20: [
    ['Country', '/ˈkʌn.tri/', 'n.', 'A land with borders and a government.', 'negara'],
    ['United States', '/juːˌnaɪ.tɪd ˈsteɪts/', 'n.', 'A country in North America with 50 states.', 'Amerika Serikat'],
    ['American', '/əˈmɛ.rɪ.kən/', 'adj.', 'Relating to the U.S. or its people.', 'berasal dari Amerika'],
    ['Canada', '/ˈkæn.ə.də/', 'n.', 'A large country in North America.', 'Kanada'],
    ['Canadian', '/kəˈneɪ.di.ən/', 'adj.', 'Relating to Canada or its people.', 'berasal dari Kanada'],
    ['United Kingdom', '/juːˌnaɪ.tɪd ˈkɪŋ.dəm/', 'n.', 'A country in Europe with four parts.', 'Inggris Raya (UK)'],
    ['British', '/ˈbrɪ.tɪʃ/', 'adj.', 'Relating to the U.K. or its people.', 'berasal dari Inggris / Britania'],
    ['Germany', '/ˈdʒɝː.mə.ni/', 'n.', 'A country in central Europe.', 'Jerman'],
    ['German', '/ˈdʒɝː.mən/', 'adj.', 'Relating to Germany or its people.', 'berasal dari Jerman'],
    ['France', '/fræns/', 'n.', 'A European country with famous landmarks.', 'Prancis'],
    ['French', '/frɛntʃ/', 'adj.', 'Relating to France or its people.', 'berasal dari Prancis'],
    ['Spain', '/speɪn/', 'n.', 'A country in southwest Europe.', 'Spanyol'],
    ['Spanish', '/ˈspæn.ɪʃ/', 'adj.', 'Relating to Spain or its people.', 'berasal dari Spanyol'],
    ['Italy', '/ˈɪ.t̬əl.i/', 'n.', 'A European country with a long coastline.', 'Italia'],
    ['Italian', '/ɪˈtæl.jən/', 'adj.', 'Relating to Italy or its people.', 'berasal dari Italia'],
  ],
  21: [
    ['Car', '/kɑːr/', 'n.', 'A four-wheeled vehicle for roads.', 'mobil'],
    ['Motorcycle', '/ˈmoʊ.t̬ɚˌsaɪ.kəl/', 'n.', 'A two-wheeled engine-powered vehicle.', 'sepeda motor'],
    ['Bus', '/bʌs/', 'n.', 'A large vehicle for many passengers.', 'bus'],
    ['Truck', '/trʌk/', 'n.', 'A big vehicle for carrying goods.', 'truk'],
    ['Train', '/treɪn/', 'n.', 'Connected carriages that travel on rails.', 'kereta api'],
    ['Taxi', '/ˈtæk.si/', 'n.', 'A paid car service for transportation.', 'taksi'],
    ['Subway', '/ˈsʌb.weɪ/', 'n.', 'An underground railway system.', 'kereta bawah tanah'],
    ['Airplane', '/ˈɛr.pleɪn/', 'n.', 'A flying vehicle with wings.', 'pesawat terbang'],
    ['Helicopter', '/ˈhɛ.lɪ.kɑːp.tɚ/', 'n.', 'A flying vehicle with rotating blades.', 'helikopter'],
    ['Ship', '/ʃɪp/', 'n.', 'A large boat for crossing the sea.', 'kapal laut'],
    ['Boat', '/boʊt/', 'n.', 'A small vehicle for water travel.', 'perahu'],
    ['Ticket', '/ˈtɪ.kɪt/', 'n.', 'A paper or card for entry or travel.', 'tiket'],
    ['Van', '/væn/', 'n.', 'A big vehicle for carrying people or things.', 'mobil van'],
    ['Station', '/ˈsteɪ.ʃən/', 'n.', 'A place to get on or off a train or bus.', 'stasiun'],
    ['Airport', '/ˈɛr.pɔːrt/', 'n.', 'A place for planes to take off and land.', 'bandara'],
    ['Train station', '/treɪn ˈsteɪ.ʃən/', 'n.', 'A stop for passengers boarding trains.', 'stasiun kereta'],
  ],
  22: [
    ['Month', '/mʌnθ/', 'n.', 'Each of the twelve named divisions of the year, like January, February, etc.', 'bulan (kalender)'],
    ['January', '/ˈdʒæn.juˌɛr.i/', 'n.', 'The first month of the year, after December and before February.', 'Januari'],
    ['February', '/ˈfɛb.ruˌɛr.i/', 'n.', 'The second month of the year, after January and before March.', 'Februari'],
    ['March', '/mɑrtʃ/', 'n.', 'The third month of the year, after February and before April.', 'Maret'],
    ['April', '/ˈeɪ.prəl/', 'n.', 'The fourth month of the year, after March and before May.', 'April'],
    ['May', '/meɪ/', 'n.', 'The fifth month of the year, after April and before June.', 'Mei'],
    ['June', '/dʒuːn/', 'n.', 'The sixth month of the year, after May and before July.', 'Juni'],
    ['July', '/dʒʊˈlaɪ/', 'n.', 'The seventh month of the year, after June and before August.', 'Juli'],
    ['August', '/ˈɔː.gəst/', 'n.', 'The eighth month of the year, after July and before September.', 'Agustus'],
    ['September', '/sɛpˈtɛm.bɚ/', 'n.', 'The ninth month of the year, after August and before October.', 'September'],
    ['October', '/ɑkˈtoʊ.bɚ/', 'n.', 'The tenth month of the year, after September and before November.', 'Oktober'],
    ['November', '/noʊˈvɛm.bɚ/', 'n.', 'The 11th month of the year, after October and before December.', 'November'],
    ['December', '/dɪˈsɛm.bɚ/', 'n.', 'The 12th and last month of the year, after November and before January.', 'Desember'],
    ['Season', '/ˈsiː.zən/', 'n.', 'A period of time that a year is divided into, such as winter and summer, with each having three months.', 'musim'],
    ['Spring', '/sprɪŋ/', 'n.', 'The season that comes after winter, when in most countries trees and flowers begin to grow again.', 'musim semi'],
    ['Summer', '/ˈsʌ.mɚ/', 'n.', 'The season that comes after spring and in most countries is the warmest season.', 'musim panas'],
    ['Fall', '/fɔːl/', 'n.', 'The season that comes after summer, when in most countries leaves change color and fall from trees.', 'musim gugur'],
    ['Winter', '/ˈwɪn.tɚ/', 'n.', 'The season that comes after fall and in most countries is the coldest season.', 'musim dingin'],
  ],
  23: [
    ['Clock', '/klɑːk/', 'n.', 'A device used to measure and show time.', 'jam dinding'],
    ['Year', '/jɪr/', 'n.', 'A period of time made up of twelve months, particularly one starting on January first and ending on December thirty-first.', 'tahun'],
    ['Time', '/taɪm/', 'n.', 'The quantity measured in seconds, minutes, hours, etc., using a device like a clock.', 'waktu'],
    ['Date', '/deɪt/', 'n.', 'A specific day in a month or year, shown using a number and sometimes a name.', 'tanggal'],
    ['Day', '/deɪ/', 'n.', 'A period of time made up of twenty-four hours, from sunrise to sunset.', 'hari'],
    ['Hour', '/aʊr/', 'n.', 'Each of the twenty-four time periods in a day, made up of sixty minutes.', 'jam (durasi)'],
    ["O'clock", '/əˈklɑːk/', 'adv.', 'Put after numbers one to twelve to show the exact hour.', 'pukul / tepat jam'],
    ['Minute', '/ˈmɪnɪt/', 'n.', 'Each of the sixty parts that make up one hour, consisting of sixty seconds.', 'menit'],
    ['Second', '/ˈsɛkənd/', 'n.', 'The standard SI unit of time, equal to one-sixtieth of a minute.', 'detik'],
    ['Morning', '/ˈmɔːrnɪŋ/', 'n.', 'The time of day between sunrise and noon.', 'pagi hari'],
    ['Afternoon', '/ˌæftɚˈnuːn/', 'n.', 'The time of day between noon and sunset.', 'siang / sore'],
    ['Evening', '/ˈiːvnɪŋ/', 'n.', 'The time of day between sunset and complete darkness.', 'petang / awal malam'],
    ['Night', '/naɪt/', 'n.', 'The time when the sun goes down, it gets dark outside, and we sleep.', 'malam hari'],
    ['Week', '/wiːk/', 'n.', 'A period of time made up of seven days in a calendar.', 'minggu / pekan'],
    ['Sunday', '/ˈsʌndeɪ/', 'n.', 'The day that comes after Saturday.', 'hari Minggu'],
    ['Monday', '/ˈmʌndeɪ/', 'n.', 'The day that comes after Sunday.', 'hari Senin'],
    ['Tuesday', '/ˈtuːzdeɪ/', 'n.', 'The day that comes after Monday.', 'hari Selasa'],
    ['Wednesday', '/ˈwɛnzdeɪ/', 'n.', 'The day that comes after Tuesday.', 'hari Rabu'],
    ['Thursday', '/ˈθɝːzdeɪ/', 'n.', 'The day that comes after Wednesday.', 'hari Kamis'],
    ['Friday', '/ˈfraɪdeɪ/', 'n.', 'The day that comes after Thursday.', 'hari Jumat'],
    ['Saturday', '/ˈsætɚdeɪ/', 'n.', 'The day that comes after Friday.', 'hari Sabtu'],
    ['Weekend', '/ˈwiːkˌɛnd/', 'n.', 'The days of the week, usually Saturday and Sunday, when people do not have to go to work or school.', 'akhir pekan'],
    ['Next', '/nɛkst/', 'adj.', 'Coming immediately after a person or thing in time, place, or rank.', 'berikutnya'],
    ['Half', '/hæf/', 'n.', 'either one of two equal parts of a thing', 'setengah'],
  ],
  24: [
    ['Good', '/ɡʊd/', 'adj.', 'Having a quality that is satisfying; behaving in a way that is morally right.', 'baik'],
    ['Bad', '/bæd/', 'adj.', 'Having a quality that is not satisfying; morally unacceptable.', 'buruk'],
    ['High', '/haɪ/', 'adj.', 'Having a value or level greater than usual or expected, often in terms of numbers or measurements.', 'tinggi (nilai / letak)'],
    ['Low', '/loʊ/', 'adj.', 'Small or below average in degree, value, level, or amount.', 'rendah'],
    ['Big', '/bɪɡ/', 'adj.', 'Above average in size or extent.', 'besar'],
    ['Small', '/smɔːl/', 'adj.', 'Below average in physical size.', 'kecil'],
    ['Heavy', '/ˈhɛ.vi/', 'adj.', 'Having a lot of weight and not easy to move or pick up.', 'berat'],
    ['Light', '/laɪt/', 'adj.', 'Having very little weight and easy to move or pick up.', 'ringan'],
    ['Expensive', '/ɪkˈspɛn.sɪv/', 'adj.', 'Having a high price.', 'mahal'],
    ['Cheap', '/tʃiːp/', 'adj.', 'Having a low price.', 'murah'],
    ['Old', '/oʊld/', 'adj.', '(Of a thing) having been used or existing for a long period of time.', 'lama / tua (benda)'],
    ['New', '/nuː/', 'adj.', 'Recently invented, made, etc.', 'baru'],
    ['Beautiful', '/ˈbjuː.t̬ɪ.fəl/', 'adj.', 'Extremely pleasing to the mind or senses.', 'indah / cantik'],
    ['Ugly', '/ˈʌɡ.li/', 'adj.', 'Not pleasant to the mind or senses.', 'buruk rupa / jelek'],
    ['Clean', '/kliːn/', 'adj.', 'Not having any bacteria, marks, or dirt.', 'bersih'],
    ['Dirty', '/ˈdɝː.t̬i/', 'adj.', 'Having stains, bacteria, marks, or dirt.', 'kotor'],
    ['Easy', '/ˈiː.zi/', 'adj.', 'Needing little skill or effort to do or understand.', 'mudah'],
    ['Difficult', '/ˈdɪ.fɪ.kəlt/', 'adj.', 'Needing a lot of work or skill to do, understand, or deal with.', 'sulit'],
    ['Fast', '/fæst/', 'adj.', 'Having a high speed when doing something, especially moving.', 'cepat'],
    ['Slow', '/sloʊ/', 'adj.', 'Moving, happening, or being done at a speed that is low.', 'lambat'],
    ['Different', '/ˈdɪ.fɚ.rənt/', 'adj.', 'Not like another thing or person in form, quality, nature, etc.', 'berbeda'],
    ['Same', '/seɪm/', 'adj.', 'Like another thing or person in every way.', 'sama'],
    ['Right', '/raɪt/', 'adj.', 'Based on facts or the truth.', 'benar / tepat'],
    ['Wrong', '/rɔːŋ/', 'adj.', 'Not based on facts or the truth.', 'salah'],
    ['Open', '/ˈoʊ.pən/', 'adj.', 'Letting people or things pass through.', 'terbuka'],
    ['Closed', '/kloʊzd/', 'adj.', 'Not letting things, people, etc. go in or out.', 'tertutup'],
    ['True', '/truː/', 'adj.', 'According to reality or facts.', 'benar (sesuai fakta)'],
    ['False', '/fɔːls/', 'adj.', 'Not according to reality or facts.', 'salah / palsu'],
    ['Rich', '/rɪtʃ/', 'adj.', 'Owning a great amount of money or things that cost a lot.', 'kaya'],
    ['Poor', '/pʊr/', 'adj.', 'Owning a very small amount of money or a very small number of things.', 'miskin'],
    ['Sure', '/ʃʊr/', 'adj.', '(Of a person) feeling confident about something being correct or true.', 'yakin'],
    ['Unsure', '/ʌnˈʃʊr/', 'adj.', 'Having doubts about or no confidence in someone or something.', 'tidak yakin / ragu'],
    ['Correct', '/kəˈrɛkt/', 'adj.', 'Accurate and in accordance with reality or truth.', 'tepat / betul'],
    ['Incorrect', '/ˌɪn.kəˈrɛkt/', 'adj.', 'Having mistakes or inaccuracies.', 'tidak tepat / keliru'],
  ],
  26: [
    ['Be', '/biː/', 'v.', 'To exist.', 'ada / menjadi'],
    ['Wake up', '/weɪk ʌp/', 'v.', 'To stop sleeping.', 'bangun tidur'],
    ['Sleep', '/sliːp/', 'v.', 'To rest with eyes closed.', 'tidur'],
    ['Work', '/wɝːk/', 'v.', 'To do a job for money.', 'bekerja'],
    ['Drive', '/draɪv/', 'v.', 'To control a moving vehicle.', 'mengemudi'],
    ['Buy', '/baɪ/', 'v.', 'To get something by paying money.', 'membeli'],
    ['Sell', '/sɛl/', 'v.', 'To give something for money.', 'menjual'],
    ['Read', '/riːd/', 'v.', 'To understand written words.', 'membaca'],
    ['Write', '/raɪt/', 'v.', 'To form words on paper.', 'menulis'],
    ['Play', '/pleɪ/', 'v.', 'To do an activity for fun.', 'bermain'],
    ['Pay', '/peɪ/', 'v.', 'To give money for goods or services.', 'membayar'],
    ['Rest', '/rɛst/', 'v.', 'To stop working and relax.', 'beristirahat'],
    ['Wash', '/wɑːʃ/', 'v.', 'To clean with water or soap.', 'mencuci'],
    ['Drink', '/drɪŋk/', 'v.', 'To swallow liquids.', 'minum'],
    ['Cook', '/kʊk/', 'v.', 'To prepare food with heat.', 'memasak'],
    ['Eat', '/iːt/', 'v.', 'To chew and swallow food.', 'makan'],
    ['Have', '/hæv/', 'v.', 'To own or consume something.', 'mempunyai'],
    ['Make', '/meɪk/', 'v.', 'To create or build something.', 'membuat'],
    ['Wear', '/wɛr/', 'v.', 'To have clothes on.', 'memakai (pakaian)'],
    ['Clean', '/kliːn/', 'v.', 'To remove dirt or bacteria.', 'membersihkan'],
    ['Think', '/θɪŋk/', 'v.', 'To have an idea or belief.', 'berpikir'],
    ['Take', '/teɪk/', 'v.', 'To reach for and hold something.', 'mengambil'],
    ['Stand', '/stænd/', 'v.', 'To be upright on feet.', 'berdiri'],
    ['Speak', '/spiːk/', 'v.', 'To use words to express something.', 'berbicara'],
    ['Spell', '/spɛl/', 'v.', 'To say or write the letters of a word.', 'mengeja'],
    ['Dislike', '/dɪsˈlaɪk/', 'v.', 'To not like something.', 'tidak menyukai'],
    ['Add', '/æd/', 'v.', 'To combine things together.', 'menambahkan'],
    ['Call', '/kɔːl/', 'v.', 'To give a name or title.', 'memanggil / menyebut'],
    ['Create', '/kriːˈeɪt/', 'v.', 'To bring something into existence.', 'menciptakan'],
    ['Cut', '/kʌt/', 'v.', 'To divide with a sharp object.', 'memotong'],
  ],
  27: [
    ['Young', '/jʌŋ/', 'adj.', 'In the early stages of life.', 'muda'],
    ['Old', '/oʊld/', 'adj.', 'In the later stages of life.', 'tua (usia)'],
    ['Stupid', '/ˈstuː.pɪd/', 'adj.', 'Not able to understand quickly.', 'bodoh / kurang paham'],
    ['Thirsty', '/ˈθɝː.sti/', 'adj.', 'Needing a drink.', 'haus'],
    ['Fat', '/fæt/', 'adj.', 'Weighing more than is healthy.', 'gemuk'],
    ['Thin', '/θɪn/', 'adj.', 'Weighing less than is healthy.', 'kurus / tipis'],
    ['Tall', '/tɔːl/', 'adj.', 'Having a greater than average height.', 'tinggi (postur)'],
    ['Smart', '/smɑːrt/', 'adj.', 'Able to learn and think well.', 'pintar / cerdas'],
    ['Angry', '/ˈæŋ.ɡri/', 'adj.', 'Feeling very annoyed.', 'marah'],
    ['Fine', '/faɪn/', 'adj.', 'Not ill, injured, or bad.', 'baik-baik saja'],
    ['Sad', '/sæd/', 'adj.', 'Feeling bad emotionally.', 'sedih'],
    ['Happy', '/ˈhæ.pi/', 'adj.', 'Feeling good emotionally.', 'bahagia / senang'],
    ['Hungry', '/ˈhʌŋ.ɡri/', 'adj.', 'Needing food.', 'lapar'],
    ['Excited', '/ɪkˈsaɪ.tɪd/', 'adj.', 'Feeling happy and energetic.', 'bersemangat / antusias'],
    ['Ready', '/ˈrɛ.di/', 'adj.', 'Prepared for a situation or task.', 'siap'],
  ],
  28: [
    ['Hear', '/hɪr/', 'v.', 'To notice a sound.', 'mendengar'],
    ['Listen', '/ˈlɪ.sən/', 'v.', 'To focus on a sound.', 'mendengarkan'],
    ['See', '/siː/', 'v.', 'To notice with your eyes.', 'melihat'],
    ['Look', '/lʊk/', 'v.', 'To turn your eyes toward something.', 'memandang / menatap'],
    ['Watch', '/wɑːtʃ/', 'v.', 'To look at something for a while.', 'menonton'],
    ['Touch', '/tʌtʃ/', 'v.', 'To put your hand on something.', 'menyentuh'],
    ['Feel', '/fiːl/', 'v.', 'To sense or experience emotions.', 'merasakan'],
    ['Talk', '/tɔːk/', 'v.', 'To express thoughts with words.', 'bercakap / mengobrol'],
    ['Call', '/kɔːl/', 'v.', 'To phone someone.', 'menelepon'],
    ['Like', '/laɪk/', 'v.', 'To enjoy or find something good.', 'menyukai'],
    ['Love', '/lʌv/', 'v.', 'To care deeply about someone or something.', 'mencintai'],
    ['Hate', '/heɪt/', 'v.', 'To strongly dislike something.', 'membenci'],
    ['Know', '/noʊ/', 'v.', 'To have information.', 'mengetahui'],
    ['Learn', '/lɝːn/', 'v.', 'To gain knowledge or skills.', 'belajar'],
    ['Ask', '/æsk/', 'v.', 'To request information.', 'bertanya / meminta'],
    ['Study', '/ˈstʌ.di/', 'v.', 'To learn through reading or school.', 'mempelajari'],
    ['Teach', '/tiːtʃ/', 'v.', 'To give lessons to others.', 'mengajar'],
    ['Need', '/niːd/', 'v.', 'To require something important.', 'membutuhkan'],
    ['Want', '/wɑːnt/', 'v.', 'To wish to have something.', 'menginginkan'],
    ['Share', '/ʃɛr/', 'v.', 'To use or give something with others.', 'berbagi'],
    ['Put', '/pʊt/', 'v.', 'To move something to a place.', 'meletakkan'],
    ['Prepare', '/prɪˈpɛr/', 'v.', 'To get ready for something.', 'mempersiapkan'],
    ['Plan', '/plæn/', 'v.', 'To decide ahead of time.', 'merencanakan'],
    ['Explain', '/ɪkˈspleɪn/', 'v.', 'To make something clear.', 'menjelaskan'],
    ['Fill', '/fɪl/', 'v.', 'To make full.', 'mengisi'],
    ['Fly', '/flaɪ/', 'v.', 'To move through the air.', 'terbang'],
    ['Get', '/ɡɛt/', 'v.', 'To experience a condition.', 'mengalami / menjadi'],
    ['Become', '/bɪˈkʌm/', 'v.', 'To start being something.', 'menjadi'],
  ],
  29: [
    ['Walk', '/wɔːk/', 'v.', 'To move forward on foot.', 'berjalan'],
    ['Run', '/rʌn/', 'v.', 'To move fast on foot.', 'berlari'],
    ['Go', '/ɡoʊ/', 'v.', 'To move to another place.', 'pergi'],
    ['Come', '/kʌm/', 'v.', 'To move toward someone or something.', 'datang'],
    ['Sit', '/sɪt/', 'v.', 'To rest with your bottom on a surface.', 'duduk'],
    ['Fall', '/fɔːl/', 'v.', 'To move quickly downward.', 'jatuh'],
    ['Jump', '/dʒʌmp/', 'v.', 'To push off the ground into the air.', 'melompat'],
    ['Bring', '/brɪŋ/', 'v.', 'To take something to a place.', 'membawa'],
    ['Give', '/ɡɪv/', 'v.', 'To hand something to someone.', 'memberi'],
    ['Find', '/faɪnd/', 'v.', 'To discover something lost.', 'menemukan'],
    ['Open', '/ˈoʊ.pən/', 'v.', 'To move something so it is not closed.', 'membuka'],
    ['Close', '/kloʊz/', 'v.', 'To shut something.', 'menutup'],
    ['Start', '/stɑːrt/', 'v.', 'To begin something.', 'memulai'],
    ['Stop', '/stɑːp/', 'v.', 'To make something not move.', 'berhenti / menghentikan'],
    ['Finish', '/ˈfɪ.nɪʃ/', 'v.', 'To bring something to an end.', 'menyelesaikan'],
    ['Build', '/bɪld/', 'v.', 'To make something by putting parts together.', 'membangun'],
    ['Do', '/duː/', 'v.', 'To perform an action.', 'melakukan'],
    ['Get', '/ɡɛt/', 'v.', 'To receive or obtain something.', 'mendapatkan'],
    ['Turn', '/tɝːn/', 'v.', 'To rotate or move in another direction.', 'berbelok / memutar'],
    ['Introduce', '/ˌɪn.trəˈduːs/', 'v.', "To say someone's name for the first time.", 'memperkenalkan'],
    ['Travel', '/ˈtræv.əl/', 'v.', 'To go somewhere far.', 'bepergian'],
    ['Let', '/lɛt/', 'v.', 'To allow something to happen.', 'membiarkan / mengizinkan'],
    ['Choose', '/tʃuːz/', 'v.', 'To pick one option from a group.', 'memilih'],
    ['Help', '/hɛlp/', 'v.', 'To assist someone.', 'membantu'],
    ['Swim', '/swɪm/', 'v.', 'To move through water.', 'berenang (aksi)'],
  ],
  30: [
    ['Place', '/pleɪs/', 'n.', 'A location where something is.', 'tempat / lokasi'],
    ['North', '/nɔːrθ/', 'n.', 'The direction left of sunrise.', 'utara'],
    ['South', '/saʊθ/', 'n.', 'The direction right of sunrise.', 'selatan'],
    ['East', '/iːst/', 'n.', 'The direction of sunrise.', 'timur'],
    ['West', '/wɛst/', 'n.', 'The direction of sunset.', 'barat'],
    ['Back', '/bæk/', 'adv.', 'Toward the rear or behind something.', 'ke belakang'],
    ['Right', '/raɪt/', 'adv.', 'Toward the right side.', 'ke kanan'],
    ['Left', '/lɛft/', 'adv.', 'Toward the left side.', 'ke kiri'],
    ['Far', '/fɑːr/', 'adv.', 'At a great distance.', 'jauh'],
    ['Continent', '/ˈkɑːn.tɪ.nənt/', 'n.', 'A large landmass on Earth.', 'benua'],
    ['Asia', '/ˈeɪ.ʒə/', 'n.', 'The largest continent.', 'Asia'],
    ['Asian', '/ˈeɪ.ʒən/', 'adj.', 'Related to Asia or its people.', 'berasal dari Asia'],
    ['Europe', '/ˈjʊr.əp/', 'n.', 'A small continent west of Asia.', 'Eropa'],
    ['European', '/ˌjʊr.əˈpiː.ən/', 'adj.', 'Related to Europe or its people.', 'berasal dari Eropa'],
    ['Africa', '/ˈæ.frɪ.kə/', 'n.', 'The second largest continent.', 'Afrika'],
    ['African', '/ˈæ.frɪ.kən/', 'adj.', 'Related to Africa or its people.', 'berasal dari Afrika'],
  ],
  31: [
    ['Outside', '/ˈaʊt.saɪd/', 'adv.', 'In an open area, not inside.', 'di luar'],
    ['Always', '/ˈɔːl.weɪz/', 'adv.', 'At all times, no exceptions.', 'selalu'],
    ['Never', '/ˈnɛ.vɚ/', 'adv.', 'Not at any time.', 'tidak pernah'],
    ['Usually', '/ˈjuː.ʒə.li/', 'adv.', 'In most cases.', 'biasanya'],
    ['Often', '/ˈɔː.fən/', 'adv.', 'Many times.', 'sering'],
    ['Sometimes', '/ˈsʌm.taɪmz/', 'adv.', 'Not always, but occasionally.', 'kadang-kadang'],
    ['Now', '/naʊ/', 'adv.', 'At this moment.', 'sekarang'],
    ['Soon', '/suːn/', 'adv.', 'In a short time.', 'segera'],
    ['Too', '/tuː/', 'adv.', 'Also, in addition.', 'juga / terlalu'],
    ['Here', '/hɪr/', 'adv.', 'At this place.', 'di sini'],
    ['There', '/ðɛr/', 'adv.', 'At another place.', 'di sana'],
    ['Again', '/əˈɡɛn/', 'adv.', 'One more time.', 'lagi'],
    ['Of course', '/ʌv ˈkɔrs/', 'adv.', 'Certainly, without a doubt.', 'tentu saja'],
    ['Really', '/ˈrɪə.li/', 'adv.', 'Actually, truly.', 'sungguh / benar-benar'],
    ['Why', '/waɪ/', 'adv.', 'Asking for a reason.', 'mengapa'],
    ['Where', '/wɛr/', 'adv.', 'Asking for a place.', 'di mana'],
    ['When', '/wɛn/', 'adv.', 'Asking for a time.', 'kapan'],
    ['What', '/wʌt/', 'pron.', 'Asking for information.', 'apa (kata tanya)'],
    ['Who', '/huː/', 'pron.', 'Asking about a person.', 'siapa'],
    ['How', '/haʊ/', 'adv.', 'Asking about a way or manner.', 'bagaimana'],
    ['Else', '/ɛls/', 'adv.', 'In addition, other than.', 'lainnya / lagi'],
  ],
  32: [
    ['Before', '/bɪˈfɔːr/', 'prep.', 'Earlier than something.', 'sebelum'],
    ['After', '/ˈæf.tɚ/', 'prep.', 'Later than something.', 'setelah / sesudah'],
    ['At', '/æt/', 'prep.', 'Showing place or time.', 'di / pada'],
    ['In', '/ɪn/', 'prep.', 'Inside something.', 'di dalam'],
    ['On', '/ɑːn/', 'prep.', 'Attached to a surface or a date.', 'di atas / pada'],
    ['Below', '/bɪˈloʊ/', 'prep.', 'Beneath something.', 'di bawah'],
    ['Above', '/əˈbʌv/', 'prep.', 'Higher than something.', 'di atas (lebih tinggi)'],
    ['Across', '/əˈkrɔːs/', 'prep.', 'On the other side of something.', 'di seberang / melintasi'],
    ['Near', '/nɪr/', 'prep.', 'Close to something.', 'dekat'],
    ['Between', '/bɪˈtwiːn/', 'prep.', 'In the middle of two things.', 'di antara'],
    ['Next to', '/nɛkst tuː/', 'prep.', 'Very close to something.', 'di sebelah'],
    ['Behind', '/bɪˈhaɪnd/', 'prep.', 'At the back of something.', 'di belakang'],
    ['With', '/wɪð/', 'prep.', 'Together in one place.', 'dengan / bersama'],
    ['To', '/tuː/', 'prep.', 'Showing movement or direction.', 'ke / kepada'],
    ['Another', '/əˈnʌ.ðɚ/', 'det.', 'One more of the same kind.', 'yang lain (satu lagi)'],
    ['This', '/ðɪs/', 'det.', 'Referring to something close.', 'ini'],
    ['That', '/ðæt/', 'det.', 'Referring to something far.', 'itu'],
    ['Both', '/boʊθ/', 'det.', 'Referring to two things.', 'keduanya'],
    ['What', '/wʌt/', 'det.', 'Introducing a general clause.', 'apa yang (penentu)'],
    ['A', '/ə/', 'det.', 'Used for an unspecified thing.', 'sebuah / seorang'],
    ['Over', '/ˈoʊ.vɚ/', 'prep.', 'Higher than something.', 'di atas (melewati)'],
    ['Under', '/ˈʌn.dɚ/', 'prep.', 'Beneath something.', 'di bawah (terlindung)'],
  ],
};

// Retained IELTS Prep A1 words on catId 25 (used by isIeltsBoss in diglosaCatalog.ts)
const IELTS_PREP_WORDS =
  'abundant=berlimpah|achieve=mencapai|advantage=keuntungan|analyze=menganalisis|approach=pendekatan|appropriate=sesuai|benefit=manfaat|challenge=tantangan|coherent=terstruktur jelas|compare=membandingkan|conclusion=kesimpulan|consider=mempertimbangkan|context=konteks|contrast=kontras / perbedaan|contribute=berkontribusi|create=menciptakan|crucial=sangat penting|culture=budaya|data=data|debate=debat|decision=keputusan|describe=menggambarkan|develop=mengembangkan|difference=perbedaan|discuss=mendiskusikan|economy=ekonomi|education=pendidikan|effect=dampak|efficient=efisien|environment=lingkungan|essential=esensial|evidence=bukti|example=contoh|experience=pengalaman|explain=menjelaskan|factor=faktor|feature=fitur|global=global|goal=tujuan|impact=pengaruh|improve=meningkatkan|increase=meningkat|inevitable=tak terhindarkan|influence=memengaruhi|information=informasi|issue=isu / topik|knowledge=pengetahuan|method=metode|mitigate=mengurangi dampak|modern=modern|opportunity=kesempatan|opinion=pendapat|percent=persen|pollution=polusi|population=populasi|process=proses|progress=kemajuan|quality=kualitas|reduce=mengurangi|research=penelitian|resilient=tangguh|resource=sumber daya|result=hasil|similar=serupa|solution=solusi|strategy=strategi|summary=ringkasan|support=mendukung|technology=teknologi|trend=tren|ubiquitous=ada di mana-mana';

function buildCatalog(): VocabEntry[] {
  // Dedupe ONLY within the same category so cross-topic dual-sense words (e.g., Fish, Chicken, Orange, Right, Open, Work, Call, Get, What) are preserved 100%
  const seen = new Set<string>();
  const out: VocabEntry[] = [];

  for (const cat of CATEGORIES) {
    if (cat.id === 25) {
      const pairs = IELTS_PREP_WORDS.split('|').filter(Boolean);
      for (const pair of pairs) {
        const eqIdx = pair.indexOf('=');
        if (eqIdx <= 0) continue;
        const word = pair.slice(0, eqIdx).trim();
        const meaningId = pair.slice(eqIdx + 1).trim();
        const norm = word.toLowerCase();
        const key = `${cat.id}:${norm}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const safeId = `v_${cat.id}_${norm.replace(/[^a-z0-9]+/g, '_')}`;
        out.push({
          id: safeId,
          word,
          meaningId,
          phonetic: `/${norm}/`,
          exampleEn: `Practice using "${word}" in a sentence.`,
          exampleId: `Latih penggunaan kata "${word}" (${meaningId}) dalam kalimat.`,
          catId: cat.id,
          zoneId: cat.zoneId,
          cefr: 'IELTS',
        });
      }
      continue;
    }

    const rows = PDF_A1_ROWS[cat.id] || [];
    for (const [word, phonetic, pos, defEn, meaningId] of rows) {
      const norm = word.toLowerCase();
      const key = `${cat.id}:${norm}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const safeId = `v_${cat.id}_${norm.replace(/[^a-z0-9]+/g, '_')}`;
      out.push({
        id: safeId,
        word,
        meaningId,
        phonetic,
        exampleEn: `(${pos}) ${defEn}`,
        exampleId: `(${pos}) ${meaningId}`,
        catId: cat.id,
        zoneId: cat.zoneId,
        cefr: 'A1',
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

// Smart Distractors: half from the same category, half from others;
// excludes duplicate English words or Indonesian meanings so MCQ options never collide across cross-topic words
export function pickDistractors(target: VocabEntry, count = 3): VocabEntry[] {
  const usedWords = new Set<string>([target.word.toLowerCase()]);
  const usedMeanings = new Set<string>([target.meaningId.toLowerCase()]);

  const same = VOCAB_CATALOG.filter(
    (v) => v.catId === target.catId && v.id !== target.id,
  ).sort(() => Math.random() - 0.5);
  const other = VOCAB_CATALOG.filter(
    (v) => v.catId !== target.catId && v.id !== target.id,
  ).sort(() => Math.random() - 0.5);

  const picked: VocabEntry[] = [];
  const tryPickFrom = (list: VocabEntry[], limit: number) => {
    for (const candidate of list) {
      if (picked.length >= limit) break;
      const wNorm = candidate.word.toLowerCase();
      const mNorm = candidate.meaningId.toLowerCase();
      if (usedWords.has(wNorm) || usedMeanings.has(mNorm)) continue;
      usedWords.add(wNorm);
      usedMeanings.add(mNorm);
      picked.push(candidate);
    }
  };

  const half = Math.ceil(count / 2);
  tryPickFrom(same, half);
  tryPickFrom(other, count);
  if (picked.length < count) {
    tryPickFrom(same, count);
  }
  return picked.slice(0, count);
}

// Wave Deal (v3): splits area words across Doors 1,3,4,5 + patrolling Monster squads
export interface AreaWaveDeal {
  doorWords: Record<number, string[]>; // doorIndex -> wordIds
  monsterWaves: string[][]; // wave groups for patrolling monsters
}

export function computeAreaWaveDeal(
  zoneId: ZoneId,
  wordProgress: Record<string, WordProgress> = {},
): AreaWaveDeal {
  const pool = [...getWordsForZone(zoneId)]
    .map((v) => ({ v, score: (wordProgress[v.id]?.b || 0) + Math.random() * 2.2 }))
    .sort((a, b) => a.score - b.score)
    .map((x) => x.v);
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

  // Door 0 (cards): 10, Door 2 (listen): 10, Door 3 (type: /^[A-Za-z' -]{2,16}$/): 10, Door 4 (match): 8 unique
  const door0 = take(10);
  const door2 = take(10);
  const door3 = take(10, (v) => /^[A-Za-z' -]{2,16}$/.test(v.word));
  if (door3.length < 10) {
    door3.push(...take(10 - door3.length));
  }
  const matchWords = new Set<string>();
  const matchMeanings = new Set<string>();
  const door4 = take(8, (v) => {
    const w = v.word.toLowerCase();
    const m = v.meaningId.toLowerCase();
    if (matchWords.has(w) || matchMeanings.has(m)) return false;
    matchWords.add(w);
    matchMeanings.add(m);
    return true;
  });

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
