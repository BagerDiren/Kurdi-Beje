/**
 * Çocuk modu — görsel ve işitsel öğrenme için optimize edilmiş içerik.
 * Sade kelime listeleri, büyük emoji, basit cümle yapısı.
 *
 * Her kategori 8-12 kelime, her ders 3 tip step:
 *  • picture-learn    → büyük emoji + kelime + ses (öğret)
 *  • picture-pick     → kelime → 4 emoji (anlamı bul)
 *  • emoji-pick       → emoji → 4 kelime (kelimeyi bul)
 */

export type KidsWord = {
  ku: string;        // Kurmancî
  tr: string;        // Türkçe
  emoji: string;     // büyük görsel
  sound?: string;    // varsa farklı TTS metni (Kürtçe okunamayan harfler için)
  photo?: string;    // telifsiz gerçek fotoğraf URL (Pexels CDN, opsiyonel)
};

export type KidsStep =
  | { type: "learn"; word: KidsWord }                               // öğren
  | { type: "pickEmoji"; target: KidsWord; options: KidsWord[]; correct: number } // emoji seç
  | { type: "pickWord"; target: KidsWord; options: KidsWord[]; correct: number };  // kelime seç

export type KidsLesson = {
  id: string;
  title: string;       // Türkçe
  titleKu: string;
  steps: KidsStep[];
  xp: number;
};

export type KidsCategory = {
  key: string;
  title: string;       // Türkçe
  titleKu: string;
  emoji: string;       // kategorinin temsil emojisi
  color: string;
  bgGradient: readonly [string, string];
  words: KidsWord[];
};

// =============================================================
//  ÇOCUK KATEGORİLERİ (görsel-işitsel)
// =============================================================

export const KIDS_CATEGORIES: KidsCategory[] = [
  {
    key: "hayvan",
    title: "Hayvanlar",
    titleKu: "Heywan",
    emoji: "🐶",
    color: "#F39C12",
    bgGradient: ["#FFB740", "#F39C12"] as const,
    words: [
      // Telifsiz Pexels CDN gerçek fotoğraflar (auto-compress 600px)
      { ku: "Kûçik",   tr: "Köpek",  emoji: "🐶", photo: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Pisîk",   tr: "Kedi",   emoji: "🐱", photo: "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Ga",      tr: "İnek",   emoji: "🐮", photo: "https://images.pexels.com/photos/735968/pexels-photo-735968.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Hesp",    tr: "At",     emoji: "🐴", photo: "https://images.pexels.com/photos/52500/horse-herd-fog-nebel-52500.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Mirîşk",  tr: "Tavuk",  emoji: "🐔", photo: "https://images.pexels.com/photos/1300357/pexels-photo-1300357.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Pez",     tr: "Koyun",  emoji: "🐑", photo: "https://images.pexels.com/photos/288621/pexels-photo-288621.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Şêr",     tr: "Aslan",  emoji: "🦁", photo: "https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Fîl",     tr: "Fil",    emoji: "🐘", photo: "https://images.pexels.com/photos/66898/elephant-cub-tsavo-kenya-66898.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Teyr",    tr: "Kuş",    emoji: "🐦", photo: "https://images.pexels.com/photos/45853/grey-crowned-crane-bird-crane-animal-45853.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Masî",    tr: "Balık",  emoji: "🐟", photo: "https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg?auto=compress&cs=tinysrgb&w=600" },
    ],
  },
  {
    key: "reng",
    title: "Renkler",
    titleKu: "Reng",
    emoji: "🎨",
    color: "#E74C3C",
    bgGradient: ["#FF7B6F", "#E74C3C"] as const,
    words: [
      { ku: "Sor",       tr: "Kırmızı",  emoji: "🔴" },
      { ku: "Kesk",      tr: "Yeşil",    emoji: "🟢" },
      { ku: "Zer",       tr: "Sarı",     emoji: "🟡" },
      { ku: "Şîn",       tr: "Mavi",     emoji: "🔵" },
      { ku: "Spî",       tr: "Beyaz",    emoji: "⚪" },
      { ku: "Reş",       tr: "Siyah",    emoji: "⚫" },
      { ku: "Porteqalî", tr: "Turuncu",  emoji: "🟠" },
      { ku: "Binefşî",   tr: "Mor",      emoji: "🟣" },
    ],
  },
  {
    key: "hejmar",
    title: "Sayılar",
    titleKu: "Hejmar",
    emoji: "🔢",
    color: "#1CB0F6",
    bgGradient: ["#5DADE2", "#1CB0F6"] as const,
    words: [
      { ku: "Yek",   tr: "Bir",  emoji: "1️⃣" },
      { ku: "Du",    tr: "İki",  emoji: "2️⃣" },
      { ku: "Sê",    tr: "Üç",   emoji: "3️⃣" },
      { ku: "Çar",   tr: "Dört", emoji: "4️⃣" },
      { ku: "Pênc",  tr: "Beş",  emoji: "5️⃣" },
      { ku: "Şeş",   tr: "Altı", emoji: "6️⃣" },
      { ku: "Heft",  tr: "Yedi", emoji: "7️⃣" },
      { ku: "Heşt",  tr: "Sekiz",emoji: "8️⃣" },
      { ku: "Neh",   tr: "Dokuz",emoji: "9️⃣" },
      { ku: "Deh",   tr: "On",   emoji: "🔟" },
    ],
  },
  {
    key: "xwarin",
    title: "Yiyecekler",
    titleKu: "Xwarin",
    emoji: "🍎",
    color: "#27AE60",
    bgGradient: ["#52C77E", "#27AE60"] as const,
    words: [
      { ku: "Sêv",    tr: "Elma",    emoji: "🍎", photo: "https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Tirî",   tr: "Üzüm",    emoji: "🍇", photo: "https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Hinar",  tr: "Nar",     emoji: "🍑", photo: "https://images.pexels.com/photos/8336965/pexels-photo-8336965.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Nan",    tr: "Ekmek",   emoji: "🍞", photo: "https://images.pexels.com/photos/209403/pexels-photo-209403.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Av",     tr: "Su",      emoji: "💧", photo: "https://images.pexels.com/photos/2995299/pexels-photo-2995299.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Şîr",    tr: "Süt",     emoji: "🥛", photo: "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Hêk",    tr: "Yumurta", emoji: "🥚", photo: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Penîr",  tr: "Peynir",  emoji: "🧀", photo: "https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Çay",    tr: "Çay",     emoji: "🍵", photo: "https://images.pexels.com/photos/904616/pexels-photo-904616.jpeg?auto=compress&cs=tinysrgb&w=600" },
      { ku: "Şorbe",  tr: "Çorba",   emoji: "🍲", photo: "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=600" },
    ],
  },
  {
    key: "las",
    title: "Vücut",
    titleKu: "Laş",
    emoji: "👁️",
    color: "#8E44AD",
    bgGradient: ["#B57BC7", "#8E44AD"] as const,
    words: [
      { ku: "Çav",   tr: "Göz",   emoji: "👁️" },
      { ku: "Guh",   tr: "Kulak", emoji: "👂" },
      { ku: "Poz",   tr: "Burun", emoji: "👃" },
      { ku: "Dev",   tr: "Ağız",  emoji: "👄" },
      { ku: "Diran", tr: "Diş",   emoji: "🦷" },
      { ku: "Dest",  tr: "El",    emoji: "✋" },
      { ku: "Ling",  tr: "Ayak",  emoji: "🦶" },
      { ku: "Ser",   tr: "Baş",   emoji: "🧠" },
      { ku: "Dil",   tr: "Kalp",  emoji: "❤️" },
      { ku: "Por",   tr: "Saç",   emoji: "💇" },
    ],
  },
  {
    key: "malbat",
    title: "Aile",
    titleKu: "Malbat",
    emoji: "👨‍👩‍👧",
    color: "#FF6B9D",
    bgGradient: ["#FFA1C5", "#FF6B9D"] as const,
    words: [
      { ku: "Dayik",  tr: "Anne",       emoji: "👩" },
      { ku: "Bav",    tr: "Baba",       emoji: "👨" },
      { ku: "Bira",   tr: "Erkek kardeş", emoji: "👦" },
      { ku: "Xwişk",  tr: "Kız kardeş",   emoji: "👧" },
      { ku: "Kalik",  tr: "Dede",         emoji: "👴" },
      { ku: "Dapîr",  tr: "Nine",         emoji: "👵" },
      { ku: "Kur",    tr: "Oğul",         emoji: "👶" },
      { ku: "Keç",    tr: "Kız",          emoji: "👧" },
      { ku: "Mal",    tr: "Ev",           emoji: "🏠" },
    ],
  },
];

// =============================================================
//  DERS ÜRETİCİ — kelime havuzundan otomatik 5 ders üretir
// =============================================================

function pickDistractors(target: KidsWord, pool: KidsWord[], n: number, seed: number): KidsWord[] {
  const others = pool.filter((w) => w.ku !== target.ku);
  const result: KidsWord[] = [];
  for (let i = 0; i < n && others.length > 0; i++) {
    const idx = (seed * 7 + i * 13 + 3) % others.length;
    result.push(others.splice(idx, 1)[0]);
  }
  return result;
}

function placeAt<T>(arr: T[], correctIdx: number): T[] {
  const c = [...arr];
  if (correctIdx === 0) return c;
  [c[0], c[correctIdx]] = [c[correctIdx], c[0]];
  return c;
}

function buildLesson(cat: KidsCategory, num: number): KidsLesson {
  const wordsPerLesson = 4;
  const offset = ((num - 1) * 2) % cat.words.length;
  const block: KidsWord[] = [];
  for (let i = 0; i < wordsPerLesson; i++) {
    block.push(cat.words[(offset + i) % cat.words.length]);
  }

  const steps: KidsStep[] = [];

  // 1. Her kelimeyi öğret (4 learn step)
  block.forEach((w) => steps.push({ type: "learn", word: w }));

  // 2. Her kelime için emoji-pick (resim seç)
  block.forEach((w, i) => {
    const distractors = pickDistractors(w, cat.words, 3, num + i);
    const allOpts = [w, ...distractors];
    const correctPos = i % 4;
    steps.push({ type: "pickEmoji", target: w, options: placeAt(allOpts, correctPos), correct: correctPos });
  });

  // 3. Tersi: emoji → kelime (2 pick word)
  block.slice(0, 2).forEach((w, i) => {
    const distractors = pickDistractors(w, cat.words, 3, num + i + 5);
    const allOpts = [w, ...distractors];
    const correctPos = (i + 1) % 4;
    steps.push({ type: "pickWord", target: w, options: placeAt(allOpts, correctPos), correct: correctPos });
  });

  return {
    id: `kid-${cat.key}-${num}`,
    title: `Bölüm ${num}`,
    titleKu: `Beş ${num}`,
    xp: 15 + num * 2,
    steps,
  };
}

export function getKidsLessons(cat: KidsCategory, count = 5): KidsLesson[] {
  return Array.from({ length: count }).map((_, i) => buildLesson(cat, i + 1));
}

export const getKidsCategoryByKey = (key: string): KidsCategory | undefined =>
  KIDS_CATEGORIES.find((c) => c.key === key);
