// ===================== KID GAME LOCKS =====================
export const KID_LOCKS = { deng: 0, wene: 0, shkeft: 0, zevi: 0 };

// ===================== SOUND POOL (Dengê Kiye?) =====================
export const SOUND_POOL = [
  { emoji: "🐶", ku: "Kûçik", tr: "Köpek", cat: "ajal" },
  { emoji: "🐱", ku: "Pisîk", tr: "Kedi", cat: "ajal" },
  { emoji: "🐮", ku: "Ga", tr: "İnek", cat: "ajal" },
  { emoji: "🐴", ku: "Hesp", tr: "At", cat: "ajal" },
  { emoji: "🐔", ku: "Mirîşk", tr: "Tavuk", cat: "ajal" },
  { emoji: "🐑", ku: "Pez", tr: "Koyun", cat: "ajal" },
  { emoji: "🦁", ku: "Şêr", tr: "Aslan", cat: "ajal" },
  { emoji: "🐺", ku: "Gur", tr: "Kurt", cat: "ajal" },
  { emoji: "🐦", ku: "Teyr", tr: "Kuş", cat: "ajal" },
  { emoji: "🦢", ku: "Qaz", tr: "Kaz", cat: "ajal" },
  { emoji: "🐝", ku: "Mêş", tr: "Arı", cat: "ajal" },
  { emoji: "🐸", ku: "Beq", tr: "Kurbağa", cat: "ajal" },
  { emoji: "🪈", ku: "Bilûr", tr: "Kaval", cat: "muzîk" },
  { emoji: "🥁", ku: "Def", tr: "Davul", cat: "muzîk" },
  { emoji: "🎻", ku: "Kemençe", tr: "Kemençe", cat: "muzîk" },
  { emoji: "🪗", ku: "Akordiyon", tr: "Akordeon", cat: "muzîk" },
  { emoji: "🌬️", ku: "Ba", tr: "Rüzgâr", cat: "xweza" },
  { emoji: "🌧️", ku: "Baran", tr: "Yağmur", cat: "xweza" },
  { emoji: "⛈️", ku: "Birûsk", tr: "Şimşek", cat: "xweza" },
  { emoji: "🌊", ku: "Av", tr: "Su", cat: "xweza" },
  { emoji: "🔥", ku: "Agir", tr: "Ateş", cat: "xweza" },
  { emoji: "🚜", ku: "Traktor", tr: "Traktör", cat: "wesayît" },
  { emoji: "🚗", ku: "Erebe", tr: "Araba", cat: "wesayît" },
  { emoji: "🚂", ku: "Trên", tr: "Tren", cat: "wesayît" },
  { emoji: "🛵", ku: "Motorsîklet", tr: "Motosiklet", cat: "wesayît" },
  { emoji: "🔔", ku: "Zengil", tr: "Zil", cat: "wesayît" },
];

// ===================== HIDDEN IMAGE POOL (Wêneyê Veşartî) =====================
export const HIDDEN_POOL = [
  { emoji: "🐘", ku: "Fîl", tr: "Fil" },
  { emoji: "🦒", ku: "Zerafe", tr: "Zürafa" },
  { emoji: "🐢", ku: "Kîsok", tr: "Kaplumbağa" },
  { emoji: "🦋", ku: "Perperok", tr: "Kelebek" },
  { emoji: "🌻", ku: "Gulçîçek", tr: "Ayçiçeği" },
  { emoji: "🍎", ku: "Sêv", tr: "Elma" },
  { emoji: "🍇", ku: "Tirî", tr: "Üzüm" },
  { emoji: "🌙", ku: "Heyv", tr: "Ay" },
  { emoji: "⭐", ku: "Stêrk", tr: "Yıldız" },
  { emoji: "🏠", ku: "Mal", tr: "Ev" },
  { emoji: "🌳", ku: "Dar", tr: "Ağaç" },
  { emoji: "☀️", ku: "Roj", tr: "Güneş" },
];

// ===================== CAVE WORDS (Şikefta Peyvan) =====================
export const CAVE_WORDS = [
  { word: "SÊV", emoji: "🍎", tr: "Elma" },
  { word: "GA", emoji: "🐮", tr: "İnek" },
  { word: "ROJ", emoji: "☀️", tr: "Güneş" },
  { word: "AV", emoji: "💧", tr: "Su" },
  { word: "MAL", emoji: "🏠", tr: "Ev" },
  { word: "DAR", emoji: "🌳", tr: "Ağaç" },
  { word: "SOR", emoji: "🔴", tr: "Kırmızı" },
  { word: "HEYV", emoji: "🌙", tr: "Ay" },
  { word: "DEST", emoji: "✋", tr: "El" },
  { word: "NAN", emoji: "🍞", tr: "Ekmek" },
];

// ===================== SENTENCES (Hevok Çêbike) =====================
export const SENTENCES = [
  { ku: ["Ez","çay","vedixwim"], tr: "Ben çay içiyorum" },
  { ku: ["Ez","nan","dixwim"], tr: "Ben ekmek yiyorum" },
  { ku: ["Tu","ji","ku","yî?"], tr: "Sen nerelisin?" },
  { ku: ["Ez","ji","Wan","im"], tr: "Ben Vanlıyım" },
  { ku: ["Navê","min","Azad","e"], tr: "Benim adım Azad" },
  { ku: ["Ez","pirtûkê","dixwînim"], tr: "Ben kitap okuyorum" },
  { ku: ["Ez","serê","sibê","radibim"], tr: "Ben sabah kalkıyorum" },
  { ku: ["Min","nan","xwar"], tr: "Ben ekmek yedim" },
  { ku: ["Berf","spî","ye"], tr: "Kar beyazdır" },
  { ku: ["Sêv","sor","e"], tr: "Elma kırmızıdır" },
];

// ===================== FARM ITEMS (Zeviya Kalikê Min) =====================
export const FARM_ITEMS = [
  { emoji: "🐄", ku: "Ga", needs: "nan" as const, needEmoji: "🌾", verb: "Nan bide", done: "Spas!" },
  { emoji: "🐑", ku: "Pez", needs: "nan" as const, needEmoji: "🌾", verb: "Nan bide", done: "Spas!" },
  { emoji: "🐔", ku: "Mirîşk", needs: "nan" as const, needEmoji: "🌾", verb: "Nan bide", done: "Spas!" },
  { emoji: "🌻", ku: "Gulçîçek", needs: "av" as const, needEmoji: "💧", verb: "Av bide", done: "Mezin bûm!" },
  { emoji: "🌱", ku: "Riwek", needs: "av" as const, needEmoji: "💧", verb: "Av bide", done: "Mezin bûm!" },
  { emoji: "🐰", ku: "Kerguh", needs: "nan" as const, needEmoji: "🥕", verb: "Nan bide", done: "Spas!" },
  { emoji: "🌳", ku: "Dar", needs: "av" as const, needEmoji: "💧", verb: "Av bide", done: "Mezin bûm!" },
  { emoji: "🐴", ku: "Hesp", needs: "nan" as const, needEmoji: "🌾", verb: "Nan bide", done: "Spas!" },
];

// ===================== WORD POOL HELPER =====================
import { LESSONS } from "./lessons";

export const getWordPool = (completed: string[]) => {
  const pool: { ku: string; tr: string; emoji: string }[] = [];
  Object.values(LESSONS).flat().forEach(l => {
    if (completed.includes(l.id) && l.steps) {
      l.steps.forEach(s => {
        if (s.type === "teach") pool.push({ ku: s.word, tr: s.meaning, emoji: s.emoji });
        if (s.type === "scene") pool.push({ ku: s.verb, tr: s.meaning, emoji: s.scene });
      });
    }
  });
  return pool.length > 0 ? pool : [
    { ku: "Silav", tr: "Merhaba", emoji: "👋" }, { ku: "Rojbaş", tr: "Günaydın", emoji: "☀️" },
    { ku: "Spas", tr: "Teşekkürler", emoji: "🙏" }, { ku: "Sor", tr: "Kırmızı", emoji: "🔴" },
    { ku: "Kesk", tr: "Yeşil", emoji: "🟢" }, { ku: "Zer", tr: "Sarı", emoji: "🟡" },
    { ku: "Yek", tr: "1", emoji: "1️⃣" }, { ku: "Du", tr: "2", emoji: "2️⃣" },
  ];
};
