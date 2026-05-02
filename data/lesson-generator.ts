/**
 * Akıllı ders üreteci.
 * Her kategori için 50 benzersiz ders üretir.
 * Variyasyon kaynakları:
 *   - Kelime bloğu rotasyonu (kategori havuzunda kayan offset)
 *   - 8 farklı step kompozisyonu paterni
 *   - Farklı başlık, ikon, XP, ipucu
 *   - Farklı doğru cevap pozisyonu (deterministik karıştırma)
 */
import type {
  Lesson,
  LessonStep,
  TeachStep,
  PickStep,
  MatchStep,
  FillStep,
  SceneStep,
} from "./lessons";
import type { Category, CategoryWord } from "./categories";

// ===================== STARTING POOLS =====================

const TITLES: { ku: string; tr: string }[] = [
  { ku: "Pratîka Peyvan", tr: "Kelime Pratiği" },
  { ku: "Tekrar û Pêşveçûn", tr: "Tekrar ve İlerleme" },
  { ku: "Cûrbecûriya Peyvan", tr: "Kelime Çeşitliliği" },
  { ku: "Hêza Peyvan", tr: "Kelime Gücü" },
  { ku: "Bilezbûna Peyvan", tr: "Hızlı Pratik" },
  { ku: "Hêjabûna Peyvan", tr: "Kelime Değeri" },
  { ku: "Pratîka Hevokan", tr: "Cümle Pratiği" },
  { ku: "Bersivên Rast", tr: "Doğru Cevaplar" },
  { ku: "Cot bi Cot", tr: "Çift Çift Eşleştir" },
  { ku: "Quiz Master", tr: "Quiz Master" },
  { ku: "Aktîfbûn", tr: "Aktiflik" },
  { ku: "Test û Tekrar", tr: "Test ve Tekrar" },
  { ku: "Pratîka Berfireh", tr: "Geniş Pratik" },
  { ku: "Mîrasa Peyvan", tr: "Kelime Mirası" },
  { ku: "Wateyên Veşartî", tr: "Gizli Anlamlar" },
  { ku: "Bibîr Bîne", tr: "Hatırla" },
  { ku: "Pirsên Hişk", tr: "Zor Sorular" },
  { ku: "Ji Bîr Mekin", tr: "Unutmayın" },
  { ku: "Lêkolîna Peyvan", tr: "Kelime Araştırması" },
  { ku: "Şahmat", tr: "Şahmat" },
  { ku: "Roja Fêrbûnê", tr: "Öğrenme Günü" },
  { ku: "Çiyayê Peyvan", tr: "Kelime Dağı" },
  { ku: "Çemê Peyvan", tr: "Kelime Nehri" },
  { ku: "Şikefta Peyvan", tr: "Kelime Mağarası" },
  { ku: "Stêrkên Peyvan", tr: "Kelime Yıldızları" },
  { ku: "Mizgîn", tr: "Müjde" },
  { ku: "Hîz û Hêz", tr: "Hız ve Güç" },
  { ku: "Aqilê Tûj", tr: "Keskin Akıl" },
  { ku: "Bîranîn", tr: "Hatıra" },
  { ku: "Lêkolîn", tr: "Araştırma" },
  { ku: "Roja Pratîkê", tr: "Pratik Günü" },
  { ku: "Pirtûka Min", tr: "Kitabım" },
  { ku: "Werin Em Bibîn", tr: "Hadi Görelim" },
  { ku: "Bilez û Tûj", tr: "Hızlı ve Keskin" },
  { ku: "Wate û Peyv", tr: "Anlam ve Kelime" },
  { ku: "Pîrozbahî", tr: "Kutlama" },
  { ku: "Asta Pêşketî", tr: "İleri Seviye" },
  { ku: "Şahkar", tr: "Başyapıt" },
  { ku: "Bersivker", tr: "Yanıtçı" },
  { ku: "Rojname", tr: "Günlük" },
  { ku: "Rojev", tr: "Gündem" },
  { ku: "Mîrasa Zimanan", tr: "Dil Mirası" },
  { ku: "Bilêv", tr: "Telaffuz" },
  { ku: "Rê û Rêbaz", tr: "Yol ve Yöntem" },
  { ku: "Pêşbazî", tr: "Yarışma" },
  { ku: "Berhevkar", tr: "Toplayıcı" },
  { ku: "Şahidê Peyvan", tr: "Kelime Tanığı" },
  { ku: "Berbang", tr: "Şafak" },
  { ku: "Werzîşa Aqil", tr: "Akıl Sporu" },
  { ku: "Test a Dawî", tr: "Son Test" },
];

const TIPS = [
  "Bi gotina rojane peyvê bi kar bîne.",
  "Tekrar bingehê fêrbûnê ye.",
  "Wate û peyvê bi hev re bînin bîra xwe.",
  "Mînaka peyvê bi cumle bişopîne.",
  "Hîn bibe û tu yê serkeftî bî!",
  "Wext xerc bike, ji bo fêrbûnê hêjayî ye.",
  "Yek peyv carna deh wate vedişêre.",
  "Hîn bûyîna nû reng dide jiyana te.",
  "Her roj 5 deqîqe têra dike!",
  "Berdewamî girîngtir e ji lez.",
  "Ji şaşiyan netirse, fêr bibe.",
  "Peyvên nû bi mînak bêhtir tên fêmkirin.",
];

const ICONS = ["🌟", "🎯", "💎", "🏆", "🔥", "⚡", "✨", "🎓", "📖", "🧠", "🚀", "💡", "🎨", "🎭", "🪄"];

// ===================== HELPERS =====================

/** Deterministik blok seçici — her num için rotated pencere */
function buildBlock(words: CategoryWord[], num: number, size: number): CategoryWord[] {
  if (words.length === 0) return [];
  const realSize = Math.min(size, words.length);
  const offset = ((num - 1) * Math.max(1, Math.floor(realSize / 2))) % words.length;
  const block: CategoryWord[] = [];
  for (let i = 0; i < realSize; i++) {
    block.push(words[(offset + i) % words.length]);
  }
  return block;
}

/** Distractors: hedef olmayan kelimelerden deterministik şekilde N tane seç */
function pickDistractors(target: CategoryWord, pool: CategoryWord[], count: number, seed: number): CategoryWord[] {
  const others = pool.filter((w) => w.ku !== target.ku);
  const result: CategoryWord[] = [];
  for (let i = 0; i < count && others.length > 0; i++) {
    const idx = (seed * 13 + i * 7 + 3) % others.length;
    result.push(others.splice(idx, 1)[0]);
  }
  return result;
}

/** Doğru cevabı belirli pozisyona yerleştirir */
function placeAt<T>(items: T[], correctIdx: number): T[] {
  const arr = [...items];
  if (correctIdx === 0) return arr;
  const tmp = arr[0];
  arr[0] = arr[correctIdx];
  arr[correctIdx] = tmp;
  return arr;
}

// ===================== STEP BUILDERS =====================

function makeTeach(w: CategoryWord, num: number): TeachStep {
  return {
    type: "teach",
    word: w.ku,
    meaning: w.tr,
    emoji: w.emoji,
    sentence: w.example?.ku ?? `${w.ku} li vir e.`,
    sentenceTr: w.example?.tr ?? `${w.tr} burada.`,
    tip: TIPS[num % TIPS.length],
  };
}

function makeScene(w: CategoryWord, num: number): SceneStep {
  return {
    type: "scene",
    scene: w.emoji,
    verb: w.ku,
    meaning: w.tr,
    person: "Mînak",
    full: w.example?.ku ?? `${w.ku} girîng e.`,
    fullTr: w.example?.tr ?? `${w.tr} önemli.`,
    tip: TIPS[(num + 3) % TIPS.length],
  };
}

function makePickKuFromTr(target: CategoryWord, pool: CategoryWord[], num: number): PickStep {
  const distractors = pickDistractors(target, pool, 3, num);
  const allOpts = [target, ...distractors];
  const correctPos = num % 4;
  const opts = placeAt(allOpts, correctPos);
  return {
    type: "pick",
    question: `'${target.tr}' Kurmancî nedir?`,
    options: opts.map((o) => o.ku),
    correct: correctPos,
  };
}

function makePickTrFromKu(target: CategoryWord, pool: CategoryWord[], num: number): PickStep {
  const distractors = pickDistractors(target, pool, 3, num + 1);
  const allOpts = [target, ...distractors];
  const correctPos = (num + 1) % 4;
  const opts = placeAt(allOpts, correctPos);
  return {
    type: "pick",
    question: `'${target.ku}' ne demek?`,
    options: opts.map((o) => o.tr),
    correct: correctPos,
  };
}

function makePickEmoji(target: CategoryWord, pool: CategoryWord[], num: number): PickStep {
  const distractors = pickDistractors(target, pool, 3, num + 2);
  const allOpts = [target, ...distractors];
  const correctPos = (num + 2) % 4;
  const opts = placeAt(allOpts, correctPos);
  return {
    type: "pick",
    question: `${target.emoji} kîjan peyv e?`,
    options: opts.map((o) => o.ku),
    correct: correctPos,
  };
}

function makeMatch(block: CategoryWord[]): MatchStep {
  const four = block.slice(0, Math.min(4, block.length));
  return {
    type: "match",
    instruction: "Peyvê bi wateya wê re eşleştir!",
    pairs: four.map((w) => ({ word: w.ku, meaning: w.tr })),
  };
}

function makeFill(target: CategoryWord, pool: CategoryWord[], num: number): FillStep | null {
  if (!target.example) return null;
  const ku = target.example.ku;
  if (!ku.includes(target.ku)) return null;
  const blanked = ku.replace(target.ku, "___");
  const blankedTr = target.example.tr;
  const distractors = pickDistractors(target, pool, 2, num);
  const allOpts = [target, ...distractors];
  const correctPos = num % 3;
  const opts = placeAt(allOpts, correctPos);
  return {
    type: "fill",
    sentence: blanked,
    sentenceTr: blankedTr,
    hint: target.emoji,
    options: opts.map((o) => o.ku),
    correct: correctPos,
  };
}

// ===================== LESSON GENERATOR =====================

const PATTERNS = 8;

function generateLesson(cat: Category, num: number): Lesson {
  const { words, key } = cat;
  const block = buildBlock(words, num, Math.min(6, Math.max(4, words.length)));
  const safeBlock = block.length >= 4 ? block : [...block, ...words.slice(0, 4 - block.length)];

  const steps: LessonStep[] = [];
  const pattern = (num - 1) % PATTERNS;

  // Always start with one teach step (introduce the lesson's focus word)
  steps.push(makeTeach(safeBlock[0], num));

  if (pattern === 0) {
    // Pattern: Vocabulary bootstrap
    steps.push(makeTeach(safeBlock[1], num + 1));
    steps.push(makePickKuFromTr(safeBlock[0], words, num));
    steps.push(makePickKuFromTr(safeBlock[1], words, num + 1));
    steps.push(makeMatch(safeBlock));
    const f = makeFill(safeBlock[2], words, num);
    if (f) steps.push(f);
    steps.push(makePickEmoji(safeBlock[2], words, num + 2));
  } else if (pattern === 1) {
    // Pattern: Quiz heavy
    steps.push(makePickTrFromKu(safeBlock[0], words, num));
    steps.push(makePickKuFromTr(safeBlock[1], words, num));
    steps.push(makePickEmoji(safeBlock[2], words, num));
    steps.push(makeMatch(safeBlock));
    const f1 = makeFill(safeBlock[0], words, num);
    if (f1) steps.push(f1);
    const f2 = makeFill(safeBlock[2], words, num + 1);
    if (f2) steps.push(f2);
    steps.push(makePickKuFromTr(safeBlock[3], words, num + 3));
  } else if (pattern === 2) {
    // Pattern: Scene + match
    steps.push(makeScene(safeBlock[0], num));
    steps.push(makeScene(safeBlock[1], num + 1));
    steps.push(makeMatch(safeBlock));
    steps.push(makeTeach(safeBlock[2], num));
    steps.push(makePickKuFromTr(safeBlock[2], words, num));
    const f = makeFill(safeBlock[3], words, num);
    if (f) steps.push(f);
    steps.push(makePickEmoji(safeBlock[1], words, num));
  } else if (pattern === 3) {
    // Pattern: Teach heavy + cement
    steps.push(makeTeach(safeBlock[1], num + 1));
    steps.push(makeTeach(safeBlock[2], num + 2));
    steps.push(makeTeach(safeBlock[3], num + 3));
    steps.push(makePickKuFromTr(safeBlock[0], words, num));
    steps.push(makePickKuFromTr(safeBlock[2], words, num + 1));
    steps.push(makeMatch(safeBlock));
    const f = makeFill(safeBlock[1], words, num);
    if (f) steps.push(f);
  } else if (pattern === 4) {
    // Pattern: Fill heavy
    const f1 = makeFill(safeBlock[0], words, num);
    if (f1) steps.push(f1);
    const f2 = makeFill(safeBlock[1], words, num + 1);
    if (f2) steps.push(f2);
    const f3 = makeFill(safeBlock[2], words, num + 2);
    if (f3) steps.push(f3);
    steps.push(makePickKuFromTr(safeBlock[0], words, num));
    steps.push(makePickKuFromTr(safeBlock[1], words, num + 1));
    steps.push(makeMatch(safeBlock));
    steps.push(makePickEmoji(safeBlock[3], words, num));
  } else if (pattern === 5) {
    // Pattern: Mixed exploration
    steps.push(makeScene(safeBlock[0], num));
    steps.push(makePickEmoji(safeBlock[1], words, num));
    steps.push(makePickKuFromTr(safeBlock[2], words, num + 1));
    const f = makeFill(safeBlock[0], words, num);
    if (f) steps.push(f);
    steps.push(makeMatch(safeBlock));
    steps.push(makePickTrFromKu(safeBlock[3], words, num + 1));
    steps.push(makeTeach(safeBlock[2], num));
  } else if (pattern === 6) {
    // Pattern: Examination
    steps.push(makePickKuFromTr(safeBlock[1], words, num));
    steps.push(makePickKuFromTr(safeBlock[2], words, num + 1));
    steps.push(makePickKuFromTr(safeBlock[3], words, num + 2));
    steps.push(makePickEmoji(safeBlock[0], words, num + 3));
    steps.push(makeMatch(safeBlock));
    const f1 = makeFill(safeBlock[1], words, num);
    if (f1) steps.push(f1);
    const f2 = makeFill(safeBlock[3], words, num + 2);
    if (f2) steps.push(f2);
  } else {
    // Pattern: Wide review
    steps.push(makePickKuFromTr(safeBlock[1], words, num));
    const f = makeFill(safeBlock[0], words, num + 1);
    if (f) steps.push(f);
    steps.push(makeMatch(safeBlock));
    steps.push(makePickEmoji(safeBlock[2], words, num));
    steps.push(makeTeach(safeBlock[3], num + 2));
    steps.push(makePickTrFromKu(safeBlock[3], words, num + 1));
    steps.push(makePickKuFromTr(safeBlock[2], words, num + 3));
  }

  // Pad to at least 6 if we lost some
  let pad = 0;
  while (steps.length < 6 && pad < safeBlock.length) {
    steps.push(makePickKuFromTr(safeBlock[pad], words, num + pad + 5));
    pad++;
  }

  // Title varies
  const titleIdx = (num - 1) % TITLES.length;
  const t = TITLES[titleIdx];
  const headWord = safeBlock[0]?.ku ?? cat.title;
  const headWordTr = safeBlock[0]?.tr ?? cat.titleTr;

  // XP scales lightly with progress: 15..40
  const xp = 15 + Math.min(25, Math.floor(num / 2));

  return {
    id: `cat-${key}-${num}`,
    title: `Beş ${num} · ${t.ku}`,
    titleTr: `Bölüm ${num} · ${t.tr} (${headWordTr})`,
    icon: ICONS[num % ICONS.length],
    xp,
    steps,
  };
}

/** Kategoriyi 50 derse kadar üretici ile doldurur */
export function fillToFifty(cat: Category, target = 50): Category {
  const handcrafted = cat.lessons.length;
  if (handcrafted >= target) return cat;
  if (cat.words.length === 0) return cat;
  const generated: Lesson[] = [];
  for (let i = 0; i < target - handcrafted; i++) {
    const num = handcrafted + i + 1;
    generated.push(generateLesson(cat, num));
  }
  return { ...cat, lessons: [...cat.lessons, ...generated] };
}
