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
      { ku: "Kûçik",   tr: "Köpek",     emoji: "🐶" },
      { ku: "Pisîk",   tr: "Kedi",      emoji: "🐱" },
      { ku: "Ga",      tr: "İnek",      emoji: "🐮" },
      { ku: "Hesp",    tr: "At",        emoji: "🐴" },
      { ku: "Mirîşk",  tr: "Tavuk",     emoji: "🐔" },
      { ku: "Pez",     tr: "Koyun",     emoji: "🐑" },
      { ku: "Şêr",     tr: "Aslan",     emoji: "🦁" },
      { ku: "Fîl",     tr: "Fil",       emoji: "🐘" },
      { ku: "Teyr",    tr: "Kuş",       emoji: "🐦" },
      { ku: "Masî",    tr: "Balık",     emoji: "🐟" },
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
      { ku: "Sêv",    tr: "Elma",       emoji: "🍎" },
      { ku: "Tirî",   tr: "Üzüm",       emoji: "🍇" },
      { ku: "Hinar",  tr: "Nar",        emoji: "🍑" },
      { ku: "Nan",    tr: "Ekmek",      emoji: "🍞" },
      { ku: "Av",     tr: "Su",         emoji: "💧" },
      { ku: "Şîr",    tr: "Süt",        emoji: "🥛" },
      { ku: "Hêk",    tr: "Yumurta",    emoji: "🥚" },
      { ku: "Penîr",  tr: "Peynir",     emoji: "🧀" },
      { ku: "Çay",    tr: "Çay",        emoji: "🍵" },
      { ku: "Şorbe",  tr: "Çorba",      emoji: "🍲" },
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
