/**
 * Kevo (HTML v3) içeriği — kullanıcının elle hazırladığı zengin Kürtçe ders setinin
 * React Native portu. 6 ders kategorisi + 3 gramer + 5 cümle + 7 telaffuz + 6 konuşma.
 *
 * Kaynak: KurdiBeje_v3.html (kullanıcının dosyası)
 */

export type KevoWord = {
  ku: string;
  tr: string;
  emoji: string;
};

export type KevoLesson = {
  id: string;
  emoji: string;
  level: "A1" | "A2" | "B1" | "B2";
  title: { tr: string; ku: string };
  color: string;       // primary
  bgGradient: readonly [string, string];
  words: KevoWord[];
};

export const KEVO_LESSONS: KevoLesson[] = [
  {
    id: "silav", emoji: "👋", level: "A1",
    color: "#FF5A8C",
    bgGradient: ["#FF9A9E", "#FAD0C4"] as const,
    title: { tr: "Selamlaşma", ku: "Silav" },
    words: [
      { ku: "Silav",     tr: "Merhaba",        emoji: "👋" },
      { ku: "Spas",      tr: "Teşekkür ederim", emoji: "🙏" },
      { ku: "Erê",       tr: "Evet",            emoji: "✅" },
      { ku: "Na",        tr: "Hayır",           emoji: "❌" },
      { ku: "Roj baş",   tr: "Günaydın",        emoji: "🌅" },
      { ku: "Şev baş",   tr: "İyi geceler",     emoji: "🌙" },
      { ku: "Çawa yî?",  tr: "Nasılsın?",       emoji: "😊" },
      { ku: "Baş e",     tr: "İyiyim",          emoji: "👍" },
    ],
  },
  {
    id: "reng", emoji: "🌈", level: "A1",
    color: "#4ECDC4",
    bgGradient: ["#A8EDEA", "#FED6E3"] as const,
    title: { tr: "Renkler", ku: "Reng" },
    words: [
      { ku: "Sor",  tr: "Kırmızı", emoji: "🔴" },
      { ku: "Kesk", tr: "Yeşil",   emoji: "🟢" },
      { ku: "Şîn",  tr: "Mavi",    emoji: "🔵" },
      { ku: "Zer",  tr: "Sarı",    emoji: "🟡" },
      { ku: "Spî",  tr: "Beyaz",   emoji: "⬜" },
      { ku: "Reş",  tr: "Siyah",   emoji: "⬛" },
      { ku: "Mor",  tr: "Mor",     emoji: "🟣" },
    ],
  },
  {
    id: "hejmar", emoji: "🔢", level: "A1",
    color: "#FF9F1C",
    bgGradient: ["#FFD6A5", "#FDFFB6"] as const,
    title: { tr: "Sayılar", ku: "Hejmar" },
    words: [
      { ku: "Yek",  tr: "Bir",   emoji: "1️⃣" },
      { ku: "Du",   tr: "İki",   emoji: "2️⃣" },
      { ku: "Sê",   tr: "Üç",    emoji: "3️⃣" },
      { ku: "Çar",  tr: "Dört",  emoji: "4️⃣" },
      { ku: "Pênc", tr: "Beş",   emoji: "5️⃣" },
      { ku: "Şeş",  tr: "Altı",  emoji: "6️⃣" },
      { ku: "Heft", tr: "Yedi",  emoji: "7️⃣" },
      { ku: "Deh",  tr: "On",    emoji: "🔟" },
    ],
  },
  {
    id: "malbat", emoji: "👨‍👩‍👧", level: "A2",
    color: "#9B5DE5",
    bgGradient: ["#E8C1FA", "#D4A5FF"] as const,
    title: { tr: "Aile", ku: "Malbat" },
    words: [
      { ku: "Dayik",       tr: "Anne",           emoji: "👩" },
      { ku: "Bav",         tr: "Baba",           emoji: "👨" },
      { ku: "Birayê min",  tr: "Erkek kardeşim", emoji: "👦" },
      { ku: "Xwişka min",  tr: "Kız kardeşim",   emoji: "👧" },
      { ku: "Zarok",       tr: "Çocuk",          emoji: "🧒" },
      { ku: "Malbat",      tr: "Aile",           emoji: "👨‍👩‍👧" },
      { ku: "Heval",       tr: "Arkadaş",        emoji: "🤝" },
    ],
  },
  {
    id: "xweza", emoji: "🌿", level: "A2",
    color: "#3BB273",
    bgGradient: ["#CAFFBF", "#9BF6FF"] as const,
    title: { tr: "Doğa", ku: "Xweza" },
    words: [
      { ku: "Roj",  tr: "Güneş",  emoji: "☀️" },
      { ku: "Meh",  tr: "Ay",     emoji: "🌙" },
      { ku: "Çiya", tr: "Dağ",    emoji: "⛰️" },
      { ku: "Çem",  tr: "Nehir",  emoji: "🏞️" },
      { ku: "Dar",  tr: "Ağaç",   emoji: "🌳" },
      { ku: "Gul",  tr: "Çiçek",  emoji: "🌸" },
    ],
  },
  {
    id: "xwarin", emoji: "🍽️", level: "B1",
    color: "#FF7C38",
    bgGradient: ["#FFBF69", "#FFD6A5"] as const,
    title: { tr: "Yiyecekler", ku: "Xwarin" },
    words: [
      { ku: "Av",   tr: "Su",    emoji: "💧" },
      { ku: "Nan",  tr: "Ekmek", emoji: "🍞" },
      { ku: "Goşt", tr: "Et",    emoji: "🥩" },
      { ku: "Çay",  tr: "Çay",   emoji: "🍵" },
      { ku: "Sêv",  tr: "Elma",  emoji: "🍎" },
      { ku: "Şîr",  tr: "Süt",   emoji: "🥛" },
    ],
  },
];

// === GRAMMAR ===
export type GrammarRow = { ku: string; tr: string; ex: string };
export type GrammarQuiz = { q: string; a: string; opts: string[] };
export type GrammarTopic = {
  id: string;
  title: string;
  icon: string;
  level: "A1" | "A2" | "B1" | "B2";
  intro: string;
  rows: GrammarRow[];
  quiz: GrammarQuiz[];
};

export const KEVO_GRAMMAR: GrammarTopic[] = [
  {
    id: "pronouns", title: "Kişi Zamirleri", icon: "👤", level: "A1",
    intro: "Kürtçede (Kurmancî) 6 temel zamir vardır.",
    rows: [
      { ku: "Ez",  tr: "Ben",   ex: "Ez baş im." },
      { ku: "Tu",  tr: "Sen",   ex: "Tu çawa yî?" },
      { ku: "Ew",  tr: "O",     ex: "Ew baş e." },
      { ku: "Em",  tr: "Biz",   ex: "Em li vir in." },
      { ku: "Hûn", tr: "Siz",   ex: "Hûn kî ne?" },
      { ku: "Ew",  tr: "Onlar", ex: "Ew xweş in." },
    ],
    quiz: [
      { q: '"Ben" zamiri?', a: "Ez",  opts: ["Ez", "Tu", "Ew", "Em"] },
      { q: '"Siz" zamiri?', a: "Hûn", opts: ["Em", "Hûn", "Ez", "Tu"] },
      { q: '"Biz" zamiri?', a: "Em",  opts: ["Ew", "Ez", "Em", "Hûn"] },
    ],
  },
  {
    id: "states", title: "Hal Ekleri", icon: "💬", level: "A1",
    intro: "Kürtçede hal ekleri cümle sonuna eklenir.",
    rows: [
      { ku: "Baş im", tr: "İyiyim", ex: "Ez baş im." },
      { ku: "Baş î",  tr: "İyisin", ex: "Tu baş î." },
      { ku: "Baş e",  tr: "İyidir", ex: "Ew baş e." },
      { ku: "Baş in", tr: "İyiyiz", ex: "Em baş in." },
    ],
    quiz: [
      { q: '"İyiyim" nasıl?',     a: "Baş im", opts: ["Baş im", "Baş î", "Baş e", "Baş in"] },
      { q: '"Baş î" ne demek?',   a: "İyisin", opts: ["İyiyim", "İyisin", "İyidir", "İyiyiz"] },
    ],
  },
  {
    id: "sov", title: "SOV Cümle Yapısı", icon: "📐", level: "A2",
    intro: "Kürtçe Özne-Nesne-Yüklem (SOV) sırasını kullanır.",
    rows: [
      { ku: "Ez av vexwim.",  tr: "Ben su içiyorum.", ex: "Ez=ben, av=su, vexwim=içiyorum" },
      { ku: "Ew nan dixwe.",  tr: "O ekmek yiyor.",   ex: "Ew=o, nan=ekmek, dixwe=yiyor" },
    ],
    quiz: [
      { q: "Kürtçe cümle sırası?",        a: "Özne-Nesne-Yüklem", opts: ["Özne-Yüklem-Nesne", "Nesne-Özne-Yüklem", "Özne-Nesne-Yüklem", "Yüklem-Özne-Nesne"] },
      { q: '"Ez av vexwim" ne anlama gelir?', a: "Ben su içiyorum", opts: ["Ben su içiyorum", "O ekmek yiyor", "Sen biliyor musun?", "Biz gidiyoruz"] },
    ],
  },
];

// === SENTENCES (cümle kurma için) ===
export type Sentence = {
  id: string;
  level: "A1" | "A2" | "B1" | "B2";
  tr: string;
  ku: string;
  words: string[];
};

export const KEVO_SENTENCES: Sentence[] = [
  { id: "s1", level: "A1", tr: "Ben iyiyim.",                   ku: "Ez baş im.",                  words: ["Ez", "baş", "im."] },
  { id: "s2", level: "A1", tr: "Merhaba, nasılsın?",            ku: "Silav, tu çawa yî?",          words: ["Silav,", "tu", "çawa", "yî?"] },
  { id: "s3", level: "A1", tr: "Adım Leyla.",                   ku: "Navê min Leyla ye.",          words: ["Navê", "min", "Leyla", "ye."] },
  { id: "s4", level: "A2", tr: "Su içmek istiyorum.",           ku: "Ez dixwazim av vexwim.",      words: ["Ez", "dixwazim", "av", "vexwim."] },
  { id: "s5", level: "B1", tr: "Kürtçe öğrenmek istiyorum.",    ku: "Ez dixwazim Kurdî hîn bibim.", words: ["Ez", "dixwazim", "Kurdî", "hîn", "bibim."] },
];

// === PRONUNCIATION (özel harfler rehberi) ===
export type Pronunciation = {
  letter: string;
  ipa: string;
  desc: string;
  example: { ku: string; tr: string };
  color: string;
};

export const KEVO_PRONUNCIATIONS: Pronunciation[] = [
  { letter: "ê", ipa: "/eː/", desc: 'Uzun E — "hey" deki e gibi',          example: { ku: "bêje",   tr: "söyle" },  color: "#FF6B9D" },
  { letter: "î", ipa: "/iː/", desc: 'Uzun İ — "feel" deki ee gibi',        example: { ku: "birîn",  tr: "yara" },   color: "#FF9F1C" },
  { letter: "û", ipa: "/uː/", desc: 'Uzun U — "moon" daki oo gibi',        example: { ku: "dûr",    tr: "uzak" },   color: "#4ECDC4" },
  { letter: "x", ipa: "/x/",  desc: 'Hırıltılı X — Almanca "Bach" gibi',   example: { ku: "xweş",   tr: "güzel" },  color: "#9B5DE5" },
  { letter: "q", ipa: "/q/",  desc: "Küçük dil Q — boğazın derininden",     example: { ku: "qelem",  tr: "kalem" },  color: "#C9A84C" },
  { letter: "w", ipa: "/w/",  desc: 'W — "water" daki w gibi',              example: { ku: "wext",   tr: "zaman" },  color: "#3BB273" },
  { letter: "j", ipa: "/ʒ/",  desc: 'JJ — Fransızca "je" deki j gibi',      example: { ku: "roj",    tr: "gün" },    color: "#FF5A8C" },
];

// === SPEAKING PRACTICE ===
export type SpeakingLine = { ku: string; tr: string };

export const KEVO_SPEAKING: SpeakingLine[] = [
  { ku: "Silav! Tu çawa yî?",        tr: "Merhaba! Nasılsın?" },
  { ku: "Ez baş im, spas!",          tr: "İyiyim, teşekkürler!" },
  { ku: "Navê min ... e.",           tr: "Adım ..." },
  { ku: "Tu bi Kurdî dizanî?",       tr: "Kürtçe biliyor musun?" },
  { ku: "Ez hinekî Kurdî dizanim.",  tr: "Biraz Kürtçe biliyorum." },
  { ku: "Ev çi ye?",                 tr: "Bu nedir?" },
];

// === Yardımcı ===
export const shuffleArr = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

export const KEVO_CHEERS = ["Harika! 🎉", "Süpersin! ⭐", "Aferin! 🥳", "Muhteşem! ✨"];
export const KEVO_WRONGS = ["Yeniden dene! 💪", "Neredeyse! 😅", "Olmaz! 🙈"];

export const randomCheer = () => KEVO_CHEERS[Math.floor(Math.random() * KEVO_CHEERS.length)];
export const randomWrong = () => KEVO_WRONGS[Math.floor(Math.random() * KEVO_WRONGS.length)];
