/**
 * DUO CONTENT — Profesyonel Kurmancî öğrenme müfredatı.
 *
 * Tasarım ilkeleri (pedagoji):
 *   1. Frekans öncelikli  → en sık kullanılan kelimeler önce
 *   2. Aralıklı tekrar    → yeni kelime sonraki 2-3 derste tekrar görünür
 *   3. Yapı taşı          → her ders öncekilerin üzerine inşa eder
 *   4. CEFR uyumlu        → A1 (başlangıç) → A2 (temel) → B1 (orta)
 *   5. İki kanal          → "kid" ve "adult" yolları (ortak çekirdek + farklılaşan ünite)
 *   6. Egzersiz çeşitliliği → her ders 5-9 egzersiz, 6 farklı tipte karışık
 *
 * Hiyerarşi:
 *   Section (A1/A2/B1) → Unit (tema) → Lesson (ders) → Exercise
 *
 * Track sistemi:
 *   • "all"   → her iki yolda görünür
 *   • "kid"   → sadece çocuk modunda (hayvan, basit hikaye)
 *   • "adult" → sadece yetişkin modunda (gramer, geçmiş zaman, iş)
 *
 * Toplam: 18 ünite · ~76 ders · ~600 egzersiz · ~280 ayrı kelime
 */

// =====================================================================
//  TİPLER
// =====================================================================

export type ExerciseType =
  | "new-word"
  | "translate-ku-tr"
  | "translate-tr-ku"
  | "tap-audio"
  | "match-pairs"
  | "select-image"
  | "fill-blank";

export type Exercise =
  | { type: "new-word"; ku: string; tr: string; emoji: string; sample?: { ku: string; tr: string } }
  | { type: "translate-ku-tr"; sentenceKu: string; sentenceTr: string; words: string[] }
  | { type: "translate-tr-ku"; sentenceTr: string; sentenceKu: string; words: string[] }
  | { type: "tap-audio"; audioKu: string; words: string[]; trHint?: string }
  | { type: "match-pairs"; pairs: { ku: string; tr: string }[] }
  | { type: "select-image"; ku: string; tr: string; options: { ku: string; tr: string; emoji: string }[]; correctIdx: number }
  | { type: "fill-blank"; sentenceParts: [string, string]; options: string[]; correctIdx: number; trHint: string };

export type DuoLesson = {
  id: string;
  title: string;
  subTitle?: string;
  exercises: Exercise[];
  xp: number;
};

export type Track = "all" | "kid" | "adult";

export type DuoUnit = {
  id: string;
  no: number;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  track: Track;
  /** Bu ünitede kazanılan ana hedefler (path ekranında popup) */
  objectives?: string[];
  lessons: DuoLesson[];
};

export type DuoSection = {
  id: string;
  cefr: "A1" | "A2" | "B1";
  title: string;
  subtitle: string;
  units: DuoUnit[];
};

// =====================================================================
//  HELPERS — uzun datayı yönetilebilir hale getirir
// =====================================================================

const nw = (ku: string, tr: string, emoji: string, sample?: { ku: string; tr: string }): Exercise =>
  ({ type: "new-word", ku, tr, emoji, ...(sample && { sample }) });

const mp = (...pairs: { ku: string; tr: string }[]): Exercise =>
  ({ type: "match-pairs", pairs });

/** Doğru cevap her zaman options[0] — runtime karıştırır + correctIdx'i takip eder */
const si = (ku: string, tr: string, options: { ku: string; tr: string; emoji: string }[]): Exercise =>
  ({ type: "select-image", ku, tr, options, correctIdx: 0 });

const ta = (audioKu: string, words: string[], trHint?: string): Exercise =>
  ({ type: "tap-audio", audioKu, words, trHint });

/** Doğru cevap her zaman options[0] */
const fb = (parts: [string, string], options: string[], trHint: string): Exercise =>
  ({ type: "fill-blank", sentenceParts: parts, options, correctIdx: 0, trHint });

const tk = (sentenceKu: string, sentenceTr: string, distractors: string[] = []): Exercise => {
  const words = [...sentenceTr.split(" "), ...distractors];
  return { type: "translate-ku-tr", sentenceKu, sentenceTr, words };
};

const tt = (sentenceTr: string, sentenceKu: string, distractors: string[] = []): Exercise => {
  const words = [...sentenceKu.split(" "), ...distractors];
  return { type: "translate-tr-ku", sentenceTr, sentenceKu, words };
};

// Kısa fabrika: Lesson
const L = (id: string, title: string, subTitle: string, xp: number, exercises: Exercise[]): DuoLesson =>
  ({ id, title, subTitle, exercises, xp });

// =====================================================================
//  SECTION 1 — A1 BAŞLANGIÇ (DESTPÊK)
// =====================================================================

const SECTION_A1: DuoSection = {
  id: "s1",
  cefr: "A1",
  title: "Başlangıç",
  subtitle: "A1 · Destpêk",
  units: [
    // ─────────────────────────────────────────────────────
    // UNIT 1: Silav û Spas (Greetings)
    // ─────────────────────────────────────────────────────
    {
      id: "u1", no: 1, title: "Silav", subtitle: "Selamlaş ve teşekkür et",
      emoji: "👋", color: "#58CC02", track: "all",
      objectives: ["Merhaba/teşekkür/evet/hayır", "Sabah-akşam selamı", "Kendini tanıt"],
      lessons: [
        L("u1-l1", "Lesson 1", "Merhaba ve teşekkür", 10, [
          nw("Silav", "Merhaba", "👋", { ku: "Silav, ez Aram im.", tr: "Merhaba, ben Aram'ım." }),
          si("Silav", "Merhaba", [
            { ku: "Silav", tr: "Merhaba", emoji: "👋" },
            { ku: "Mal", tr: "Ev", emoji: "🏠" },
            { ku: "Av", tr: "Su", emoji: "💧" },
            { ku: "Sêv", tr: "Elma", emoji: "🍎" },
          ]),
          nw("Spas", "Teşekkürler", "🙏", { ku: "Spas dikim.", tr: "Teşekkür ederim." }),
          nw("Erê", "Evet", "✅"),
          nw("Na", "Hayır", "❌"),
          mp(
            { ku: "Silav", tr: "Merhaba" },
            { ku: "Spas", tr: "Teşekkürler" },
            { ku: "Erê", tr: "Evet" },
            { ku: "Na", tr: "Hayır" },
          ),
          ta("Silav", ["Silav"], "Merhaba"),
        ]),
        L("u1-l2", "Lesson 2", "Günaydın · iyi akşamlar", 12, [
          nw("Roj baş", "Günaydın", "🌅", { ku: "Roj baş, çawa yî?", tr: "Günaydın, nasılsın?" }),
          nw("Êvar baş", "İyi akşamlar", "🌆"),
          nw("Şev baş", "İyi geceler", "🌙"),
          nw("Bi xêr hatî", "Hoş geldin", "🤗"),
          si("Roj baş", "Günaydın", [
            { ku: "Roj baş", tr: "Günaydın", emoji: "🌅" },
            { ku: "Şev baş", tr: "İyi geceler", emoji: "🌙" },
            { ku: "Êvar baş", tr: "İyi akşamlar", emoji: "🌆" },
            { ku: "Spas", tr: "Teşekkürler", emoji: "🙏" },
          ]),
          mp(
            { ku: "Roj baş", tr: "Günaydın" },
            { ku: "Êvar baş", tr: "İyi akşamlar" },
            { ku: "Şev baş", tr: "İyi geceler" },
            { ku: "Bi xêr hatî", tr: "Hoş geldin" },
          ),
          tk("Roj baş", "Günaydın", ["İyi", "geceler", "akşamlar"]),
          ta("Şev baş", ["Şev", "baş"], "İyi geceler"),
        ]),
        L("u1-l3", "Lesson 3", "Nasılsın? İyiyim", 12, [
          nw("Çawa", "Nasıl", "❓"),
          nw("Çawa yî?", "Nasılsın?", "🤔", { ku: "Tu çawa yî?", tr: "Sen nasılsın?" }),
          nw("Baş im", "İyiyim", "👍", { ku: "Spas, ez baş im.", tr: "Teşekkürler, iyiyim." }),
          nw("Ne baş", "İyi değil", "👎"),
          mp(
            { ku: "Çawa yî?", tr: "Nasılsın?" },
            { ku: "Baş im", tr: "İyiyim" },
            { ku: "Spas", tr: "Teşekkürler" },
            { ku: "Erê", tr: "Evet" },
          ),
          fb(["Spas, ez ", " im."], ["baş", "mal", "sor", "av"], "Teşekkürler, iyiyim."),
          tt("Sen nasılsın?", "Tu çawa yî?", ["Ez", "baş", "im"]),
          ta("Ez baş im", ["Ez", "baş", "im"], "Ben iyiyim"),
        ]),
        L("u1-l4", "Lesson 4", "Hoşça kal · görüşürüz", 12, [
          nw("Bi xatirê te", "Hoşça kal", "👋", { ku: "Bi xatirê te, heval.", tr: "Hoşça kal, dostum." }),
          nw("Heval", "Arkadaş", "🤝"),
          nw("Dîsa bibînim", "Tekrar görüşürüz", "🔁"),
          nw("Roja te xweş", "İyi günler", "☀️"),
          mp(
            { ku: "Bi xatirê te", tr: "Hoşça kal" },
            { ku: "Heval", tr: "Arkadaş" },
            { ku: "Dîsa bibînim", tr: "Görüşürüz" },
            { ku: "Roja te xweş", tr: "İyi günler" },
          ),
          tk("Bi xatirê te, heval", "Hoşça kal, arkadaş", ["İyi", "günler"]),
          ta("Bi xatirê te", ["Bi", "xatirê", "te"], "Hoşça kal"),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 2: Ez kim im (Pronouns + to-be)
    // ─────────────────────────────────────────────────────
    {
      id: "u2", no: 2, title: "Zamirler", subtitle: "Ez, tu, ew · Ben, sen, o",
      emoji: "👤", color: "#1CB0F6", track: "all",
      objectives: ["6 kişi zamiri", "im / î / e / in çekimleri", "Olumsuz: ne"],
      lessons: [
        L("u2-l1", "Lesson 1", "Ben · sen · o", 12, [
          nw("Ez", "Ben", "🙋"),
          nw("Tu", "Sen", "👉"),
          nw("Ew", "O", "🧍"),
          mp(
            { ku: "Ez", tr: "Ben" },
            { ku: "Tu", tr: "Sen" },
            { ku: "Ew", tr: "O" },
            { ku: "Silav", tr: "Merhaba" },
          ),
          si("Ez", "Ben", [
            { ku: "Ez", tr: "Ben", emoji: "🙋" },
            { ku: "Tu", tr: "Sen", emoji: "👉" },
            { ku: "Ew", tr: "O", emoji: "🧍" },
            { ku: "Em", tr: "Biz", emoji: "👫" },
          ]),
          ta("Ez", ["Ez"], "Ben"),
        ]),
        L("u2-l2", "Lesson 2", "Biz · siz · onlar", 12, [
          nw("Em", "Biz", "👫"),
          nw("Hûn", "Siz", "👥"),
          nw("Ew (jê)", "Onlar", "👨‍👩‍👧"),
          mp(
            { ku: "Em", tr: "Biz" },
            { ku: "Hûn", tr: "Siz" },
            { ku: "Ez", tr: "Ben" },
            { ku: "Tu", tr: "Sen" },
          ),
          fb(["", " li vir in."], ["Em", "Tu", "Sêv", "Spas"], "Biz buradayız."),
          ta("Em", ["Em"], "Biz"),
        ]),
        L("u2-l3", "Lesson 3", "im · î · e (Olmak)", 14, [
          nw("im", "(ben) ...im", "👤", { ku: "Ez baş im.", tr: "Ben iyiyim." }),
          nw("î", "(sen) ...sin", "👤", { ku: "Tu Kurd î?", tr: "Sen Kürt müsün?" }),
          nw("e", "(o) ...dir", "👤", { ku: "Ew baş e.", tr: "O iyidir." }),
          mp(
            { ku: "Ez baş im", tr: "İyiyim" },
            { ku: "Tu baş î", tr: "İyisin" },
            { ku: "Ew baş e", tr: "İyidir" },
            { ku: "Spas", tr: "Teşekkürler" },
          ),
          fb(["Tu Kurd ", "?"], ["î", "im", "e", "in"], "Sen Kürt müsün?"),
          tt("Ben iyiyim.", "Ez baş im.", ["Tu", "Ew"]),
          ta("Ew baş e", ["Ew", "baş", "e"], "O iyidir"),
        ]),
        L("u2-l4", "Lesson 4", "in (çoğul olmak)", 12, [
          nw("in", "(biz/siz/onlar) ...iz/siniz/dirler", "👤"),
          nw("Em baş in", "Biz iyiyiz", "👫"),
          nw("Hûn baş in?", "Siz iyi misiniz?", "🤝"),
          nw("Ew baş in", "Onlar iyidirler", "👨‍👩‍👧"),
          mp(
            { ku: "Em baş in", tr: "İyiyiz" },
            { ku: "Hûn baş in", tr: "İyisiniz" },
            { ku: "Ew baş in", tr: "İyidirler" },
            { ku: "Ez baş im", tr: "İyiyim" },
          ),
          fb(["Em ", " in."], ["baş", "im", "ne", "ku"], "Biz iyiyiz."),
          tt("Onlar iyidirler.", "Ew baş in.", ["Em", "Hûn"]),
        ]),
        L("u2-l5", "Lesson 5", "Olumsuz: ne", 14, [
          nw("Ne", "Değil", "❌", { ku: "Ez ne baş im.", tr: "Ben iyi değilim." }),
          nw("Ne baş im", "İyi değilim", "🙁"),
          nw("Ew ne li vir e", "O burada değil", "🚫"),
          mp(
            { ku: "Ne", tr: "Değil" },
            { ku: "Ne baş im", tr: "İyi değilim" },
            { ku: "Ne baş î", tr: "İyi değilsin" },
            { ku: "Ne baş e", tr: "İyi değil" },
          ),
          fb(["Ez ", " baş im."], ["ne", "im", "ku", "e"], "Ben iyi değilim."),
          tt("O iyi değil.", "Ew ne baş e.", ["Ez", "Tu"]),
          ta("Ez ne baş im", ["Ez", "ne", "baş", "im"], "Ben iyi değilim"),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 3: Min naskirin (Self-introduction)
    // ─────────────────────────────────────────────────────
    {
      id: "u3", no: 3, title: "Kendini Tanıt", subtitle: "Adın · nereli · yaş",
      emoji: "🪪", color: "#CE82FF", track: "all",
      objectives: ["İsim sor/söyle", "Memleket söyle", "Yaş söyle", "Kimliğini sor"],
      lessons: [
        L("u3-l1", "Lesson 1", "Adın ne?", 12, [
          nw("Nav", "İsim", "🔤"),
          nw("Navê min", "Benim adım", "🪪", { ku: "Navê min Leyla ye.", tr: "Benim adım Leyla." }),
          nw("Navê te çi ye?", "Adın ne?", "❓"),
          nw("ye", "(o) ...dır (sesli sonrası)", "📌"),
          mp(
            { ku: "Nav", tr: "İsim" },
            { ku: "Navê min", tr: "Benim adım" },
            { ku: "Navê te", tr: "Senin adın" },
            { ku: "ye", tr: "...dır" },
          ),
          fb(["Navê min ", " ye."], ["Aram", "av", "spas", "mal"], "Benim adım Aram."),
          tt("Adım Leyla.", "Navê min Leyla ye.", ["Navê", "te", "çi"]),
          ta("Navê te çi ye?", ["Navê", "te", "çi", "ye?"], "Adın ne?"),
        ]),
        L("u3-l2", "Lesson 2", "Nerelisin?", 14, [
          nw("Ji", "...den", "📍", { ku: "Ez ji Amedê me.", tr: "Ben Amed'denim." }),
          nw("Ku", "Nereli/nerede", "📌"),
          nw("Ji ku yî?", "Nerelisin?", "❓"),
          nw("Welat", "Ülke", "🌍"),
          mp(
            { ku: "Ji", tr: "...den" },
            { ku: "Welat", tr: "Ülke" },
            { ku: "Bajar", tr: "Şehir" },
            { ku: "Ji ku?", tr: "Nereden?" },
          ),
          fb(["Ez ji ", " me."], ["Stenbolê", "spas", "av", "ne"], "Ben İstanbul'luyum."),
          tt("Ben Diyarbakırlıyım.", "Ez ji Amedê me.", ["Tu", "ji", "Stenbolê", "yî"]),
          ta("Ji ku yî?", ["Ji", "ku", "yî?"], "Nerelisin?"),
        ]),
        L("u3-l3", "Lesson 3", "Kaç yaşındasın?", 14, [
          nw("Sal", "Yaş / yıl", "📅"),
          nw("Salî", "Yaşında", "🎂", { ku: "Ez 25 salî me.", tr: "Ben 25 yaşındayım." }),
          nw("Çend salî", "Kaç yaşında", "❓"),
          nw("Tu çend salî yî?", "Kaç yaşındasın?", "🤔"),
          mp(
            { ku: "Sal", tr: "Yaş" },
            { ku: "Salî", tr: "Yaşında" },
            { ku: "Çend", tr: "Kaç" },
            { ku: "yî", tr: "...sin" },
          ),
          fb(["Ez ", " salî me."], ["bîst", "ku", "spas", "ne"], "Ben yirmi yaşındayım."),
          tt("Ben on yaşındayım.", "Ez deh salî me.", ["Tu", "salî", "yî"]),
          ta("Tu çend salî yî?", ["Tu", "çend", "salî", "yî?"], "Kaç yaşındasın?"),
        ]),
        L("u3-l4", "Lesson 4", "Sen Kürt müsün?", 14, [
          nw("Kurd", "Kürt", "🇰🇲", { ku: "Ez Kurd im.", tr: "Ben Kürdüm." }),
          nw("Tirk", "Türk", "🇹🇷"),
          nw("Tu Kurd î?", "Sen Kürt müsün?", "❓"),
          nw("Erê, ez Kurd im", "Evet, ben Kürdüm", "✅"),
          mp(
            { ku: "Kurd", tr: "Kürt" },
            { ku: "Tirk", tr: "Türk" },
            { ku: "Tu Kurd î?", tr: "Sen Kürt müsün?" },
            { ku: "Ez Kurd im", tr: "Ben Kürdüm" },
          ),
          fb(["Tu ", " î?"], ["Kurd", "spas", "av", "ne"], "Sen Kürt müsün?"),
          tt("Evet, ben Kürdüm.", "Erê, ez Kurd im.", ["Tu", "Tirk", "yî"]),
          ta("Ez Kurd im", ["Ez", "Kurd", "im"], "Ben Kürdüm"),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 4: Hejmar 1-20 (Numbers)
    // ─────────────────────────────────────────────────────
    {
      id: "u4", no: 4, title: "Sayılar", subtitle: "Hejmar 1-20",
      emoji: "🔢", color: "#FF9600", track: "all",
      objectives: ["1-10 say", "11-20 say", "Sayı + isim"],
      lessons: [
        L("u4-l1", "Lesson 1", "1, 2, 3, 4, 5", 10, [
          nw("Yek", "Bir", "1️⃣"),
          nw("Du", "İki", "2️⃣"),
          nw("Sê", "Üç", "3️⃣"),
          nw("Çar", "Dört", "4️⃣"),
          nw("Pênc", "Beş", "5️⃣"),
          mp(
            { ku: "Yek", tr: "Bir" },
            { ku: "Du", tr: "İki" },
            { ku: "Sê", tr: "Üç" },
            { ku: "Çar", tr: "Dört" },
          ),
          si("Pênc", "Beş", [
            { ku: "Pênc", tr: "Beş", emoji: "5️⃣" },
            { ku: "Du", tr: "İki", emoji: "2️⃣" },
            { ku: "Yek", tr: "Bir", emoji: "1️⃣" },
            { ku: "Sê", tr: "Üç", emoji: "3️⃣" },
          ]),
          ta("Du", ["Du"], "İki"),
        ]),
        L("u4-l2", "Lesson 2", "6, 7, 8, 9, 10", 10, [
          nw("Şeş", "Altı", "6️⃣"),
          nw("Heft", "Yedi", "7️⃣"),
          nw("Heşt", "Sekiz", "8️⃣"),
          nw("Neh", "Dokuz", "9️⃣"),
          nw("Deh", "On", "🔟"),
          mp(
            { ku: "Şeş", tr: "Altı" },
            { ku: "Heft", tr: "Yedi" },
            { ku: "Heşt", tr: "Sekiz" },
            { ku: "Deh", tr: "On" },
          ),
          si("Deh", "On", [
            { ku: "Deh", tr: "On", emoji: "🔟" },
            { ku: "Heft", tr: "Yedi", emoji: "7️⃣" },
            { ku: "Şeş", tr: "Altı", emoji: "6️⃣" },
            { ku: "Neh", tr: "Dokuz", emoji: "9️⃣" },
          ]),
          ta("Heft", ["Heft"], "Yedi"),
        ]),
        L("u4-l3", "Lesson 3", "11-20", 14, [
          nw("Yanzdeh", "On bir", "1️⃣1️⃣"),
          nw("Diwanzdeh", "On iki", "1️⃣2️⃣"),
          nw("Pazdeh", "On beş", "1️⃣5️⃣"),
          nw("Bîst", "Yirmi", "2️⃣0️⃣"),
          mp(
            { ku: "Yanzdeh", tr: "On bir" },
            { ku: "Diwanzdeh", tr: "On iki" },
            { ku: "Pazdeh", tr: "On beş" },
            { ku: "Bîst", tr: "Yirmi" },
          ),
          fb(["Ez ", " salî me."], ["bîst", "ku", "ne", "ye"], "Ben yirmi yaşındayım."),
          ta("Bîst", ["Bîst"], "Yirmi"),
        ]),
        L("u4-l4", "Lesson 4", "Sayı + nesne", 14, [
          nw("Du sêv", "İki elma", "🍎🍎"),
          nw("Sê kûçik", "Üç köpek", "🐶🐶🐶"),
          nw("Pênc heval", "Beş arkadaş", "🤝"),
          mp(
            { ku: "Du sêv", tr: "İki elma" },
            { ku: "Sê kûçik", tr: "Üç köpek" },
            { ku: "Pênc heval", tr: "Beş arkadaş" },
            { ku: "Deh sal", tr: "On yıl" },
          ),
          fb(["Min ", " sêv hene."], ["du", "ji", "ne", "spas"], "Benim iki elmam var."),
          tt("Üç köpek var.", "Sê kûçik hene.", ["Du", "ne", "yek"]),
          ta("Pênc heval", ["Pênc", "heval"], "Beş arkadaş"),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 5: Malbat (Family)
    // ─────────────────────────────────────────────────────
    {
      id: "u5", no: 5, title: "Aile", subtitle: "Malbat · anne, baba, kardeş",
      emoji: "👨‍👩‍👧", color: "#FF86D0", track: "all",
      objectives: ["Aile fertleri", "Bu benim ...m", "Geniş aile"],
      lessons: [
        L("u5-l1", "Lesson 1", "Anne ve baba", 12, [
          nw("Dayik", "Anne", "👩", { ku: "Dayika min mamoste ye.", tr: "Annem öğretmen." }),
          nw("Bav", "Baba", "👨"),
          nw("Dê û bav", "Anne ve baba", "👫"),
          mp(
            { ku: "Dayik", tr: "Anne" },
            { ku: "Bav", tr: "Baba" },
            { ku: "Heval", tr: "Arkadaş" },
            { ku: "Mal", tr: "Ev" },
          ),
          si("Dayik", "Anne", [
            { ku: "Dayik", tr: "Anne", emoji: "👩" },
            { ku: "Bav", tr: "Baba", emoji: "👨" },
            { ku: "Bira", tr: "Erkek kardeş", emoji: "👦" },
            { ku: "Xwişk", tr: "Kız kardeş", emoji: "👧" },
          ]),
          ta("Bav", ["Bav"], "Baba"),
        ]),
        L("u5-l2", "Lesson 2", "Erkek/kız kardeş", 12, [
          nw("Bira", "Erkek kardeş", "👦"),
          nw("Xwişk", "Kız kardeş", "👧"),
          nw("Zarok", "Çocuk", "🧒"),
          mp(
            { ku: "Bira", tr: "Erkek kardeş" },
            { ku: "Xwişk", tr: "Kız kardeş" },
            { ku: "Zarok", tr: "Çocuk" },
            { ku: "Heval", tr: "Arkadaş" },
          ),
          fb(["Ev ", " min e."], ["bira", "av", "ku", "ne"], "Bu benim erkek kardeşim."),
          tt("Bu kız kardeşim.", "Ev xwişka min e.", ["bira", "bav"]),
          ta("Zarok", ["Zarok"], "Çocuk"),
        ]),
        L("u5-l3", "Lesson 3", "Dede, nine, amca", 14, [
          nw("Kalik", "Dede", "👴"),
          nw("Dapîr", "Nine", "👵"),
          nw("Ap", "Amca", "👨"),
          nw("Met", "Hala", "👩"),
          mp(
            { ku: "Kalik", tr: "Dede" },
            { ku: "Dapîr", tr: "Nine" },
            { ku: "Ap", tr: "Amca" },
            { ku: "Met", tr: "Hala" },
          ),
          ta("Kalik", ["Kalik"], "Dede"),
        ]),
        L("u5-l4", "Lesson 4", "Benim ailem (-ê min)", 14, [
          nw("Dayika min", "Annem", "👩"),
          nw("Bavê min", "Babam", "👨"),
          nw("Birayê min", "Erkek kardeşim", "👦"),
          nw("Xwişka min", "Kız kardeşim", "👧"),
          mp(
            { ku: "Dayika min", tr: "Annem" },
            { ku: "Bavê min", tr: "Babam" },
            { ku: "Birayê min", tr: "Erkek kardeşim" },
            { ku: "Xwişka min", tr: "Kız kardeşim" },
          ),
          tt("Annem öğretmendir.", "Dayika min mamoste ye.", ["Bavê", "min"]),
          ta("Bavê min", ["Bavê", "min"], "Babam"),
        ]),
        L("u5-l5", "Lesson 5", "Aile cümleleri", 14, [
          nw("Malbata min", "Ailem", "👨‍👩‍👧"),
          nw("Mezin", "Büyük", "📏"),
          nw("Biçûk", "Küçük", "🤏"),
          mp(
            { ku: "Malbata min", tr: "Ailem" },
            { ku: "Mezin", tr: "Büyük" },
            { ku: "Biçûk", tr: "Küçük" },
            { ku: "Zarok", tr: "Çocuk" },
          ),
          fb(["Malbata min ", " e."], ["mezin", "av", "spas", "yek"], "Ailem büyük."),
          tt("Bu benim küçük kardeşim.", "Ev birayê min ê biçûk e.", ["mezin", "ne"]),
          ta("Malbata min mezin e", ["Malbata", "min", "mezin", "e"], "Ailem büyüktür"),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 6: Reng (Colors)
    // ─────────────────────────────────────────────────────
    {
      id: "u6", no: 6, title: "Renkler", subtitle: "Reng · sor, şîn, kesk",
      emoji: "🌈", color: "#9B5DE5", track: "all",
      objectives: ["Temel 7 renk", "Renk + nesne", "Renk soruları"],
      lessons: [
        L("u6-l1", "Lesson 1", "Kırmızı, mavi, yeşil", 10, [
          nw("Sor", "Kırmızı", "🔴"),
          nw("Şîn", "Mavi", "🔵"),
          nw("Kesk", "Yeşil", "🟢"),
          nw("Zer", "Sarı", "🟡"),
          mp(
            { ku: "Sor", tr: "Kırmızı" },
            { ku: "Şîn", tr: "Mavi" },
            { ku: "Kesk", tr: "Yeşil" },
            { ku: "Zer", tr: "Sarı" },
          ),
          si("Sor", "Kırmızı", [
            { ku: "Sor", tr: "Kırmızı", emoji: "🔴" },
            { ku: "Şîn", tr: "Mavi", emoji: "🔵" },
            { ku: "Kesk", tr: "Yeşil", emoji: "🟢" },
            { ku: "Zer", tr: "Sarı", emoji: "🟡" },
          ]),
        ]),
        L("u6-l2", "Lesson 2", "Beyaz, siyah, mor", 10, [
          nw("Spî", "Beyaz", "⬜"),
          nw("Reş", "Siyah", "⬛"),
          nw("Mor", "Mor", "🟣"),
          nw("Qehweyî", "Kahverengi", "🟫"),
          mp(
            { ku: "Spî", tr: "Beyaz" },
            { ku: "Reş", tr: "Siyah" },
            { ku: "Mor", tr: "Mor" },
            { ku: "Qehweyî", tr: "Kahverengi" },
          ),
          si("Reş", "Siyah", [
            { ku: "Reş", tr: "Siyah", emoji: "⬛" },
            { ku: "Spî", tr: "Beyaz", emoji: "⬜" },
            { ku: "Mor", tr: "Mor", emoji: "🟣" },
            { ku: "Qehweyî", tr: "Kahve", emoji: "🟫" },
          ]),
        ]),
        L("u6-l3", "Lesson 3", "Renk + nesne", 12, [
          nw("Mala sor", "Kırmızı ev", "🏠"),
          nw("Sêva kesk", "Yeşil elma", "🍏"),
          nw("Av şîn", "Mavi su", "💧"),
          mp(
            { ku: "Mala sor", tr: "Kırmızı ev" },
            { ku: "Sêva kesk", tr: "Yeşil elma" },
            { ku: "Reng", tr: "Renk" },
            { ku: "Spî", tr: "Beyaz" },
          ),
          fb(["Sêv ", " e."], ["sor", "ne", "ji", "spas"], "Elma kırmızıdır."),
          tt("Bu mavi.", "Ev şîn e.", ["sor", "kesk"]),
          ta("Sêv sor e", ["Sêv", "sor", "e"], "Elma kırmızıdır"),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 7: Xwarin û Vexwarin (Food & Drinks)
    // ─────────────────────────────────────────────────────
    {
      id: "u7", no: 7, title: "Yeme İçme", subtitle: "Xwarin û vexwarin",
      emoji: "🍽️", color: "#FF6B6B", track: "all",
      objectives: ["İçecekler", "Meyveler", "Temel yiyecekler", "Yeme cümleleri"],
      lessons: [
        L("u7-l1", "Lesson 1", "İçecekler", 12, [
          nw("Av", "Su", "💧"),
          nw("Çay", "Çay", "🍵"),
          nw("Şîr", "Süt", "🥛"),
          nw("Qehwe", "Kahve", "☕"),
          mp(
            { ku: "Av", tr: "Su" },
            { ku: "Çay", tr: "Çay" },
            { ku: "Şîr", tr: "Süt" },
            { ku: "Qehwe", tr: "Kahve" },
          ),
          si("Av", "Su", [
            { ku: "Av", tr: "Su", emoji: "💧" },
            { ku: "Çay", tr: "Çay", emoji: "🍵" },
            { ku: "Şîr", tr: "Süt", emoji: "🥛" },
            { ku: "Qehwe", tr: "Kahve", emoji: "☕" },
          ]),
          ta("Çay", ["Çay"], "Çay"),
        ]),
        L("u7-l2", "Lesson 2", "Meyveler", 12, [
          nw("Sêv", "Elma", "🍎"),
          nw("Tirî", "Üzüm", "🍇"),
          nw("Hinar", "Nar", "🍑"),
          nw("Mûz", "Muz", "🍌"),
          mp(
            { ku: "Sêv", tr: "Elma" },
            { ku: "Tirî", tr: "Üzüm" },
            { ku: "Hinar", tr: "Nar" },
            { ku: "Mûz", tr: "Muz" },
          ),
          si("Sêv", "Elma", [
            { ku: "Sêv", tr: "Elma", emoji: "🍎" },
            { ku: "Mûz", tr: "Muz", emoji: "🍌" },
            { ku: "Tirî", tr: "Üzüm", emoji: "🍇" },
            { ku: "Hinar", tr: "Nar", emoji: "🍑" },
          ]),
        ]),
        L("u7-l3", "Lesson 3", "Et, ekmek, peynir", 12, [
          nw("Nan", "Ekmek", "🍞"),
          nw("Goşt", "Et", "🥩"),
          nw("Penîr", "Peynir", "🧀"),
          nw("Hêk", "Yumurta", "🥚"),
          mp(
            { ku: "Nan", tr: "Ekmek" },
            { ku: "Goşt", tr: "Et" },
            { ku: "Penîr", tr: "Peynir" },
            { ku: "Hêk", tr: "Yumurta" },
          ),
          ta("Nan", ["Nan"], "Ekmek"),
        ]),
        L("u7-l4", "Lesson 4", "Çorba, pilav", 12, [
          nw("Şorbe", "Çorba", "🍲"),
          nw("Birinc", "Pilav", "🍚"),
          nw("Salata", "Salata", "🥗"),
          nw("Masî", "Balık", "🐟"),
          mp(
            { ku: "Şorbe", tr: "Çorba" },
            { ku: "Birinc", tr: "Pilav" },
            { ku: "Salata", tr: "Salata" },
            { ku: "Masî", tr: "Balık" },
          ),
        ]),
        L("u7-l5", "Lesson 5", "Yeme/içme cümleleri", 14, [
          nw("Dixwim", "yiyorum", "🍴", { ku: "Ez nan dixwim.", tr: "Ben ekmek yiyorum." }),
          nw("Vexwim", "içiyorum", "🥤", { ku: "Ez av vexwim.", tr: "Ben su içiyorum." }),
          nw("Dixwazim", "istiyorum", "🙏", { ku: "Ez çay dixwazim.", tr: "Çay istiyorum." }),
          mp(
            { ku: "Dixwim", tr: "yiyorum" },
            { ku: "Vexwim", tr: "içiyorum" },
            { ku: "Dixwazim", tr: "istiyorum" },
            { ku: "Spas", tr: "Teşekkürler" },
          ),
          fb(["Ez ", " dixwim."], ["nan", "av", "spas", "ne"], "Ben ekmek yiyorum."),
          tt("Ben su istiyorum.", "Ez av dixwazim.", ["çay", "nan", "vexwim"]),
          ta("Ez çay vexwim", ["Ez", "çay", "vexwim"], "Ben çay içiyorum"),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 8: Dem û Roj (Time & Days)
    // ─────────────────────────────────────────────────────
    {
      id: "u8", no: 8, title: "Zaman", subtitle: "Dem · gün, saat, hafta",
      emoji: "⏰", color: "#1CB0F6", track: "all",
      objectives: ["Gün/gece", "Hafta günleri", "Bugün/yarın/dün"],
      lessons: [
        L("u8-l1", "Lesson 1", "Gün, gece, sabah", 10, [
          nw("Roj", "Gün", "☀️"),
          nw("Şev", "Gece", "🌙"),
          nw("Sibê", "Sabah", "🌅"),
          nw("Êvar", "Akşam", "🌆"),
          mp(
            { ku: "Roj", tr: "Gün" },
            { ku: "Şev", tr: "Gece" },
            { ku: "Sibê", tr: "Sabah" },
            { ku: "Êvar", tr: "Akşam" },
          ),
          si("Roj", "Gün", [
            { ku: "Roj", tr: "Gün", emoji: "☀️" },
            { ku: "Şev", tr: "Gece", emoji: "🌙" },
            { ku: "Sibê", tr: "Sabah", emoji: "🌅" },
            { ku: "Êvar", tr: "Akşam", emoji: "🌆" },
          ]),
        ]),
        L("u8-l2", "Lesson 2", "Bugün, yarın, dün", 12, [
          nw("Îro", "Bugün", "📅", { ku: "Îro hewa baş e.", tr: "Bugün hava güzel." }),
          nw("Sibe", "Yarın", "📅"),
          nw("Duh", "Dün", "📅"),
          nw("Hefte", "Hafta", "📆"),
          mp(
            { ku: "Îro", tr: "Bugün" },
            { ku: "Sibe", tr: "Yarın" },
            { ku: "Duh", tr: "Dün" },
            { ku: "Hefte", tr: "Hafta" },
          ),
          fb(["", " ez li mal im."], ["Îro", "Şev", "Spas", "Ne"], "Bugün evdeyim."),
        ]),
        L("u8-l3", "Lesson 3", "Hafta günleri 1", 12, [
          nw("Yekşem", "Pazar", "📅"),
          nw("Duşem", "Pazartesi", "📅"),
          nw("Sêşem", "Salı", "📅"),
          nw("Çarşem", "Çarşamba", "📅"),
          mp(
            { ku: "Yekşem", tr: "Pazar" },
            { ku: "Duşem", tr: "Pazartesi" },
            { ku: "Sêşem", tr: "Salı" },
            { ku: "Çarşem", tr: "Çarşamba" },
          ),
        ]),
        L("u8-l4", "Lesson 4", "Hafta günleri 2", 14, [
          nw("Pêncşem", "Perşembe", "📅"),
          nw("În", "Cuma", "📅"),
          nw("Şemî", "Cumartesi", "📅"),
          mp(
            { ku: "Pêncşem", tr: "Perşembe" },
            { ku: "În", tr: "Cuma" },
            { ku: "Şemî", tr: "Cumartesi" },
            { ku: "Yekşem", tr: "Pazar" },
          ),
          fb(["Îro ", " ye."], ["În", "Mal", "Spas", "Ne"], "Bugün cuma."),
          tt("Bugün pazartesi.", "Îro Duşem e.", ["Sêşem", "ne"]),
        ]),
      ],
    },
  ],
};

// =====================================================================
//  SECTION 2 — A2 TEMEL (BINGEHÎN)
// =====================================================================

const SECTION_A2: DuoSection = {
  id: "s2",
  cefr: "A2",
  title: "Temel",
  subtitle: "A2 · Bingehîn",
  units: [
    // ─────────────────────────────────────────────────────
    // UNIT 9: Mal û Jiyan (Home & Life)
    // ─────────────────────────────────────────────────────
    {
      id: "u9", no: 9, title: "Ev", subtitle: "Mal · oda, mutfak, salon",
      emoji: "🏠", color: "#FF9600", track: "all",
      objectives: ["Ev odaları", "Mobilyalar", "Komşu/köy/şehir", "Ev cümleleri"],
      lessons: [
        L("u9-l1", "Lesson 1", "Ev ve odalar", 12, [
          nw("Mal", "Ev", "🏠"),
          nw("Ode", "Oda", "🚪"),
          nw("Derve", "Dışarı", "🌳"),
          nw("Hundir", "İçeri", "🏚️"),
          mp(
            { ku: "Mal", tr: "Ev" },
            { ku: "Ode", tr: "Oda" },
            { ku: "Derve", tr: "Dışarı" },
            { ku: "Hundir", tr: "İçeri" },
          ),
          ta("Mal", ["Mal"], "Ev"),
        ]),
        L("u9-l2", "Lesson 2", "Mutfak, banyo, salon", 12, [
          nw("Metbex", "Mutfak", "🍳"),
          nw("Serşok", "Banyo", "🛁"),
          nw("Salon", "Salon", "🛋️"),
          nw("Razgeh", "Yatak odası", "🛏️"),
          mp(
            { ku: "Metbex", tr: "Mutfak" },
            { ku: "Serşok", tr: "Banyo" },
            { ku: "Salon", tr: "Salon" },
            { ku: "Razgeh", tr: "Yatak odası" },
          ),
          si("Metbex", "Mutfak", [
            { ku: "Metbex", tr: "Mutfak", emoji: "🍳" },
            { ku: "Serşok", tr: "Banyo", emoji: "🛁" },
            { ku: "Salon", tr: "Salon", emoji: "🛋️" },
            { ku: "Razgeh", tr: "Yatak", emoji: "🛏️" },
          ]),
        ]),
        L("u9-l3", "Lesson 3", "Mobilya", 14, [
          nw("Mase", "Masa", "🪑"),
          nw("Kursî", "Sandalye", "🪑"),
          nw("Tev", "Yatak", "🛏️"),
          nw("Pencere", "Pencere", "🪟"),
          nw("Derî", "Kapı", "🚪"),
          mp(
            { ku: "Mase", tr: "Masa" },
            { ku: "Kursî", tr: "Sandalye" },
            { ku: "Pencere", tr: "Pencere" },
            { ku: "Derî", tr: "Kapı" },
          ),
          fb(["Ez li ser ", " rûniştî me."], ["kursiyê", "spas", "ne", "Mal"], "Sandalyede oturuyorum."),
        ]),
        L("u9-l4", "Lesson 4", "Komşu, köy, şehir", 14, [
          nw("Cîran", "Komşu", "👥"),
          nw("Gund", "Köy", "🏘️"),
          nw("Bajar", "Şehir", "🏙️"),
          nw("Welat", "Ülke", "🌍"),
          mp(
            { ku: "Cîran", tr: "Komşu" },
            { ku: "Gund", tr: "Köy" },
            { ku: "Bajar", tr: "Şehir" },
            { ku: "Welat", tr: "Ülke" },
          ),
          tt("Ben Diyarbakır şehrinden geliyorum.", "Ez ji bajarê Amedê têm.", ["gund", "ne"]),
        ]),
        L("u9-l5", "Lesson 5", "Ev cümleleri", 14, [
          nw("Mezin", "Büyük", "📏"),
          nw("Biçûk", "Küçük", "🤏"),
          nw("Nû", "Yeni", "✨"),
          nw("Kevn", "Eski", "📜"),
          mp(
            { ku: "Mezin", tr: "Büyük" },
            { ku: "Biçûk", tr: "Küçük" },
            { ku: "Nû", tr: "Yeni" },
            { ku: "Kevn", tr: "Eski" },
          ),
          fb(["Mala min ", " e."], ["mezin", "av", "spas", "ne"], "Evim büyük."),
          tt("Yeni evim küçük.", "Mala min ya nû biçûk e.", ["mezin", "kevn"]),
          ta("Mala min mezin e", ["Mala", "min", "mezin", "e"], "Evim büyüktür"),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 10: Bedena Me (Body)
    // ─────────────────────────────────────────────────────
    {
      id: "u10", no: 10, title: "Vücut", subtitle: "Bedena me · göz, kulak, el",
      emoji: "👁️", color: "#9B5DE5", track: "all",
      objectives: ["Yüz organları", "Kol/bacak", "İç organlar", "Vücudum cümleleri"],
      lessons: [
        L("u10-l1", "Lesson 1", "Yüz organları", 12, [
          nw("Ser", "Baş", "🧠"),
          nw("Çav", "Göz", "👁️"),
          nw("Guh", "Kulak", "👂"),
          nw("Poz", "Burun", "👃"),
          nw("Dev", "Ağız", "👄"),
          mp(
            { ku: "Çav", tr: "Göz" },
            { ku: "Guh", tr: "Kulak" },
            { ku: "Poz", tr: "Burun" },
            { ku: "Dev", tr: "Ağız" },
          ),
          si("Çav", "Göz", [
            { ku: "Çav", tr: "Göz", emoji: "👁️" },
            { ku: "Guh", tr: "Kulak", emoji: "👂" },
            { ku: "Poz", tr: "Burun", emoji: "👃" },
            { ku: "Dev", tr: "Ağız", emoji: "👄" },
          ]),
        ]),
        L("u10-l2", "Lesson 2", "El, ayak, parmak", 12, [
          nw("Dest", "El", "✋"),
          nw("Ling", "Ayak", "🦶"),
          nw("Tilî", "Parmak", "👆"),
          nw("Pê", "Ayak (alt)", "🦶"),
          mp(
            { ku: "Dest", tr: "El" },
            { ku: "Ling", tr: "Ayak" },
            { ku: "Tilî", tr: "Parmak" },
            { ku: "Pê", tr: "Ayak alt" },
          ),
          ta("Dest", ["Dest"], "El"),
        ]),
        L("u10-l3", "Lesson 3", "Kalp, beyin, mide", 14, [
          nw("Dil", "Kalp", "❤️"),
          nw("Mejî", "Beyin", "🧠"),
          nw("Zik", "Mide", "🫃"),
          nw("Por", "Saç", "💇"),
          mp(
            { ku: "Dil", tr: "Kalp" },
            { ku: "Mejî", tr: "Beyin" },
            { ku: "Zik", tr: "Mide" },
            { ku: "Por", tr: "Saç" },
          ),
        ]),
        L("u10-l4", "Lesson 4", "Vücudum (-ê min)", 14, [
          nw("Serê min", "Başım", "🧠"),
          nw("Çavên min", "Gözlerim", "👀"),
          nw("Destê min", "Elim", "✋"),
          nw("Dilê min", "Kalbim", "❤️"),
          mp(
            { ku: "Serê min", tr: "Başım" },
            { ku: "Çavên min", tr: "Gözlerim" },
            { ku: "Destê min", tr: "Elim" },
            { ku: "Dilê min", tr: "Kalbim" },
          ),
          fb(["", " min diêşe."], ["Serê", "Spas", "Mal", "Ne"], "Başım ağrıyor."),
          tt("Gözlerim mavi.", "Çavên min şîn in.", ["sor", "kesk"]),
          ta("Destê min", ["Destê", "min"], "Elim"),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 11: Cil û Berg (Clothes)
    // ─────────────────────────────────────────────────────
    {
      id: "u11", no: 11, title: "Giysiler", subtitle: "Cil û berg",
      emoji: "👔", color: "#FF86D0", track: "all",
      objectives: ["Temel giysiler", "Aksesuarlar", "Giyinmek"],
      lessons: [
        L("u11-l1", "Lesson 1", "Gömlek, pantolon, ayakkabı", 12, [
          nw("Kiras", "Gömlek", "👔"),
          nw("Şal", "Pantolon", "👖"),
          nw("Sol", "Ayakkabı", "👟"),
          nw("Çapk", "Şapka", "🎩"),
          mp(
            { ku: "Kiras", tr: "Gömlek" },
            { ku: "Şal", tr: "Pantolon" },
            { ku: "Sol", tr: "Ayakkabı" },
            { ku: "Çapk", tr: "Şapka" },
          ),
          si("Sol", "Ayakkabı", [
            { ku: "Sol", tr: "Ayakkabı", emoji: "👟" },
            { ku: "Kiras", tr: "Gömlek", emoji: "👔" },
            { ku: "Çapk", tr: "Şapka", emoji: "🎩" },
            { ku: "Şal", tr: "Pantolon", emoji: "👖" },
          ]),
        ]),
        L("u11-l2", "Lesson 2", "Çorap, kemer, çanta", 12, [
          nw("Goreb", "Çorap", "🧦"),
          nw("Bermal", "Kemer", "👜"),
          nw("Tûrik", "Çanta", "🎒"),
          nw("Berg", "Elbise", "👗"),
          mp(
            { ku: "Goreb", tr: "Çorap" },
            { ku: "Bermal", tr: "Kemer" },
            { ku: "Tûrik", tr: "Çanta" },
            { ku: "Berg", tr: "Elbise" },
          ),
        ]),
        L("u11-l3", "Lesson 3", "Renk + giysi", 14, [
          nw("Lixwe dikim", "giyiyorum", "👕"),
          nw("Kirasê sor", "Kırmızı gömlek", "👔"),
          nw("Şalê reş", "Siyah pantolon", "👖"),
          mp(
            { ku: "Lixwe dikim", tr: "giyiyorum" },
            { ku: "Kirasê sor", tr: "Kırmızı gömlek" },
            { ku: "Şalê reş", tr: "Siyah pantolon" },
            { ku: "Solê spî", tr: "Beyaz ayakkabı" },
          ),
          fb(["Ez ", " lixwe dikim."], ["kirasekî", "spas", "ne", "av"], "Gömlek giyiyorum."),
          tt("Siyah pantolon giyiyorum.", "Ez şalekî reş lixwe dikim.", ["sor", "kesk"]),
          ta("Ez kirasekî sor lixwe dikim", ["Ez", "kirasekî", "sor", "lixwe", "dikim"], "Kırmızı gömlek giyiyorum"),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 12: Hewa û Demsalan (Weather & Seasons)
    // ─────────────────────────────────────────────────────
    {
      id: "u12", no: 12, title: "Hava ve Mevsim", subtitle: "Hewa û demsalan",
      emoji: "🌦️", color: "#1CB0F6", track: "all",
      objectives: ["4 mevsim", "Sıcak/soğuk", "Yağmur/kar", "Hava cümleleri"],
      lessons: [
        L("u12-l1", "Lesson 1", "4 mevsim", 12, [
          nw("Bihar", "İlkbahar", "🌷"),
          nw("Havîn", "Yaz", "☀️"),
          nw("Payiz", "Sonbahar", "🍂"),
          nw("Zivistan", "Kış", "❄️"),
          mp(
            { ku: "Bihar", tr: "İlkbahar" },
            { ku: "Havîn", tr: "Yaz" },
            { ku: "Payiz", tr: "Sonbahar" },
            { ku: "Zivistan", tr: "Kış" },
          ),
          si("Havîn", "Yaz", [
            { ku: "Havîn", tr: "Yaz", emoji: "☀️" },
            { ku: "Zivistan", tr: "Kış", emoji: "❄️" },
            { ku: "Bihar", tr: "İlkbahar", emoji: "🌷" },
            { ku: "Payiz", tr: "Sonbahar", emoji: "🍂" },
          ]),
        ]),
        L("u12-l2", "Lesson 2", "Sıcak, soğuk, ılık", 12, [
          nw("Germ", "Sıcak", "🔥"),
          nw("Sar", "Soğuk", "🥶"),
          nw("Şilî", "Yağışlı", "🌧️"),
          nw("Hewa", "Hava", "🌤️"),
          mp(
            { ku: "Germ", tr: "Sıcak" },
            { ku: "Sar", tr: "Soğuk" },
            { ku: "Şilî", tr: "Yağışlı" },
            { ku: "Hewa", tr: "Hava" },
          ),
          fb(["Îro hewa ", " e."], ["germ", "spas", "av", "ne"], "Bugün hava sıcak."),
        ]),
        L("u12-l3", "Lesson 3", "Yağmur, kar, güneş", 12, [
          nw("Baran", "Yağmur", "🌧️"),
          nw("Berf", "Kar", "❄️"),
          nw("Roj", "Güneş", "☀️"),
          nw("Ba", "Rüzgar", "💨"),
          mp(
            { ku: "Baran", tr: "Yağmur" },
            { ku: "Berf", tr: "Kar" },
            { ku: "Roj", tr: "Güneş" },
            { ku: "Ba", tr: "Rüzgar" },
          ),
          ta("Berf", ["Berf"], "Kar"),
        ]),
        L("u12-l4", "Lesson 4", "Hava cümleleri", 14, [
          nw("Baran dibare", "Yağmur yağıyor", "🌧️"),
          nw("Berf dibare", "Kar yağıyor", "❄️"),
          nw("Roj heye", "Güneş var", "☀️"),
          mp(
            { ku: "Baran dibare", tr: "Yağmur yağıyor" },
            { ku: "Berf dibare", tr: "Kar yağıyor" },
            { ku: "Roj heye", tr: "Güneş var" },
            { ku: "Hewa germ e", tr: "Hava sıcak" },
          ),
          fb(["Îro ", " dibare."], ["baran", "spas", "ne", "ku"], "Bugün yağmur yağıyor."),
          tt("Yaz mevsiminde sıcak.", "Di havînê de germ e.", ["zivistan", "sar"]),
          ta("Hewa sar e", ["Hewa", "sar", "e"], "Hava soğuk"),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 13: Heywan (Animals)
    // ─────────────────────────────────────────────────────
    {
      id: "u13", no: 13, title: "Hayvanlar", subtitle: "Heywan · evcil ve yabani",
      emoji: "🐶", color: "#58CC02", track: "all",
      objectives: ["Evcil hayvanlar", "Çiftlik", "Vahşi hayvanlar", "Hayvan cümleleri"],
      lessons: [
        L("u13-l1", "Lesson 1", "Evcil hayvanlar", 12, [
          nw("Kûçik", "Köpek", "🐶"),
          nw("Pisîk", "Kedi", "🐱"),
          nw("Çûk", "Kuş", "🐦"),
          nw("Masî", "Balık", "🐟"),
          mp(
            { ku: "Kûçik", tr: "Köpek" },
            { ku: "Pisîk", tr: "Kedi" },
            { ku: "Çûk", tr: "Kuş" },
            { ku: "Masî", tr: "Balık" },
          ),
          si("Kûçik", "Köpek", [
            { ku: "Kûçik", tr: "Köpek", emoji: "🐶" },
            { ku: "Pisîk", tr: "Kedi", emoji: "🐱" },
            { ku: "Çûk", tr: "Kuş", emoji: "🐦" },
            { ku: "Masî", tr: "Balık", emoji: "🐟" },
          ]),
        ]),
        L("u13-l2", "Lesson 2", "Çiftlik hayvanları", 12, [
          nw("Ga", "İnek", "🐮"),
          nw("Pez", "Koyun", "🐑"),
          nw("Hesp", "At", "🐴"),
          nw("Mirîşk", "Tavuk", "🐔"),
          mp(
            { ku: "Ga", tr: "İnek" },
            { ku: "Pez", tr: "Koyun" },
            { ku: "Hesp", tr: "At" },
            { ku: "Mirîşk", tr: "Tavuk" },
          ),
          si("Ga", "İnek", [
            { ku: "Ga", tr: "İnek", emoji: "🐮" },
            { ku: "Pez", tr: "Koyun", emoji: "🐑" },
            { ku: "Hesp", tr: "At", emoji: "🐴" },
            { ku: "Mirîşk", tr: "Tavuk", emoji: "🐔" },
          ]),
        ]),
        L("u13-l3", "Lesson 3", "Vahşi hayvanlar", 14, [
          nw("Şêr", "Aslan", "🦁"),
          nw("Fîl", "Fil", "🐘"),
          nw("Hirç", "Ayı", "🐻"),
          nw("Rovî", "Tilki", "🦊"),
          mp(
            { ku: "Şêr", tr: "Aslan" },
            { ku: "Fîl", tr: "Fil" },
            { ku: "Hirç", tr: "Ayı" },
            { ku: "Rovî", tr: "Tilki" },
          ),
          ta("Şêr", ["Şêr"], "Aslan"),
        ]),
        L("u13-l4", "Lesson 4", "Hayvan + sayı", 12, [
          nw("Du kûçik", "İki köpek", "🐶🐶"),
          nw("Sê pisîk", "Üç kedi", "🐱🐱🐱"),
          nw("Pênc mirîşk", "Beş tavuk", "🐔"),
          mp(
            { ku: "Du kûçik", tr: "İki köpek" },
            { ku: "Sê pisîk", tr: "Üç kedi" },
            { ku: "Pênc mirîşk", tr: "Beş tavuk" },
            { ku: "Yek hesp", tr: "Bir at" },
          ),
          fb(["Min ", " kûçik hene."], ["du", "spas", "ne", "ku"], "İki köpeğim var."),
        ]),
        L("u13-l5", "Lesson 5", "Hayvan cümleleri", 14, [
          nw("Hez dikim", "seviyorum", "❤️", { ku: "Ez ji pisîkan hez dikim.", tr: "Kedileri seviyorum." }),
          nw("Heye", "var", "✅", { ku: "Min kûçikek heye.", tr: "Bir köpeğim var." }),
          nw("Tune", "yok", "❌"),
          mp(
            { ku: "Hez dikim", tr: "seviyorum" },
            { ku: "Heye", tr: "var" },
            { ku: "Tune", tr: "yok" },
            { ku: "Kûçik", tr: "Köpek" },
          ),
          fb(["Min kûçikek ", "."], ["heye", "spas", "ne", "ku"], "Bir köpeğim var."),
          tt("Kedileri seviyorum.", "Ez ji pisîkan hez dikim.", ["kûçik", "hesp"]),
          ta("Min hespek heye", ["Min", "hespek", "heye"], "Bir atım var"),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 14: Tevgerên Rojane (Daily Routines) — adult focused
    // ─────────────────────────────────────────────────────
    {
      id: "u14", no: 14, title: "Günlük Rutin", subtitle: "Tevgerên rojane",
      emoji: "🕐", color: "#FF9600", track: "adult",
      objectives: ["Sık fiiller", "Kalkma/yatma", "İş/ev rutini"],
      lessons: [
        L("u14-l1", "Lesson 1", "Şiyar/raz (uyan/yat)", 14, [
          nw("Şiyar dibim", "uyanıyorum", "⏰", { ku: "Ez sibê şiyar dibim.", tr: "Sabahları uyanırım." }),
          nw("Razim", "uyuyorum", "💤"),
          nw("Şuştim", "yıkanıyorum", "🚿"),
          nw("Rabûm", "kalktım", "🛏️"),
          mp(
            { ku: "Şiyar dibim", tr: "uyanıyorum" },
            { ku: "Razim", tr: "uyuyorum" },
            { ku: "Şuştim", tr: "yıkanıyorum" },
            { ku: "Rabûm", tr: "kalktım" },
          ),
          fb(["Ez sibê ", " dibim."], ["şiyar", "spas", "ne", "ku"], "Sabah uyanıyorum."),
          ta("Ez razim", ["Ez", "razim"], "Uyuyorum"),
        ]),
        L("u14-l2", "Lesson 2", "Yemek yeme rutini", 14, [
          nw("Taştê", "Kahvaltı", "🍳"),
          nw("Firavîn", "Öğle yemeği", "🍱"),
          nw("Şîv", "Akşam yemeği", "🍽️"),
          nw("Dixwim", "yiyorum", "🍴"),
          mp(
            { ku: "Taştê", tr: "Kahvaltı" },
            { ku: "Firavîn", tr: "Öğle" },
            { ku: "Şîv", tr: "Akşam" },
            { ku: "Dixwim", tr: "yiyorum" },
          ),
          fb(["Sibê ", " dixwim."], ["taştê", "ku", "spas", "ne"], "Sabah kahvaltı yapıyorum."),
        ]),
        L("u14-l3", "Lesson 3", "İşe gitmek", 14, [
          nw("Diçim", "gidiyorum", "➡️"),
          nw("Têm", "geliyorum", "⬅️"),
          nw("Kar", "İş", "💼"),
          nw("Diçim kar", "İşe gidiyorum", "🚶"),
          mp(
            { ku: "Diçim", tr: "gidiyorum" },
            { ku: "Têm", tr: "geliyorum" },
            { ku: "Kar", tr: "İş" },
            { ku: "Mal", tr: "Ev" },
          ),
          fb(["Sibê ez diçim ", "."], ["kar", "spas", "ne", "av"], "Sabah işe gidiyorum."),
          tt("Eve geliyorum.", "Ez têm malê.", ["diçim", "kar"]),
        ]),
        L("u14-l4", "Lesson 4", "Eve dönüş", 14, [
          nw("Vegerim", "dönüyorum", "🔄"),
          nw("Êvarê", "Akşamleyin", "🌆"),
          nw("Mal", "Ev", "🏠"),
          mp(
            { ku: "Vegerim", tr: "dönüyorum" },
            { ku: "Êvarê", tr: "Akşamleyin" },
            { ku: "Şîv", tr: "Akşam yemeği" },
            { ku: "Razim", tr: "uyuyorum" },
          ),
          tt("Akşam eve dönüyorum.", "Êvarê ez vedigerim malê.", ["sibê", "diçim"]),
          ta("Ez vegerim malê", ["Ez", "vegerim", "malê"], "Eve dönüyorum"),
        ]),
        L("u14-l5", "Lesson 5", "Tüm gün özet", 14, [
          nw("Pirr", "Çok", "📈"),
          nw("Kêm", "Az", "📉"),
          nw("Bêrî dikim", "özlüyorum", "💔"),
          mp(
            { ku: "Pirr", tr: "Çok" },
            { ku: "Kêm", tr: "Az" },
            { ku: "Bêrî dikim", tr: "özlüyorum" },
            { ku: "Hez dikim", tr: "seviyorum" },
          ),
          fb(["Ez pirr ", " dikim."], ["kar", "spas", "ne", "av"], "Çok çalışıyorum."),
          tt("Aileyi özlüyorum.", "Ez bêrîya malbatê dikim.", ["hez", "kar"]),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 15: Bajar û Rê (City & Roads)
    // ─────────────────────────────────────────────────────
    {
      id: "u15", no: 15, title: "Şehir", subtitle: "Bajar · sokak, dükkan, yol",
      emoji: "🏙️", color: "#CE82FF", track: "all",
      objectives: ["Şehir yerleri", "Yön sorma", "Ulaşım"],
      lessons: [
        L("u15-l1", "Lesson 1", "Şehirde", 12, [
          nw("Bajar", "Şehir", "🏙️"),
          nw("Kolan", "Sokak", "🛣️"),
          nw("Dukan", "Dükkan", "🏪"),
          nw("Mizgeft", "Cami", "🕌"),
          mp(
            { ku: "Bajar", tr: "Şehir" },
            { ku: "Kolan", tr: "Sokak" },
            { ku: "Dukan", tr: "Dükkan" },
            { ku: "Mizgeft", tr: "Cami" },
          ),
        ]),
        L("u15-l2", "Lesson 2", "Yön sorma", 14, [
          nw("Çep", "Sol", "👈"),
          nw("Rast", "Sağ", "👉"),
          nw("Raste-rast", "Düz", "⬆️"),
          nw("Li ku ye?", "Nerede?", "❓"),
          mp(
            { ku: "Çep", tr: "Sol" },
            { ku: "Rast", tr: "Sağ" },
            { ku: "Raste-rast", tr: "Düz" },
            { ku: "Li ku ye?", tr: "Nerede?" },
          ),
          fb(["Mal li aliyê ", " ye."], ["rast", "ku", "spas", "ne"], "Ev sağ tarafta."),
          tt("Düz git.", "Raste-rast biçe.", ["çep", "rast"]),
        ]),
        L("u15-l3", "Lesson 3", "Ulaşım", 14, [
          nw("Otomobîl", "Araba", "🚗"),
          nw("Otobûs", "Otobüs", "🚌"),
          nw("Tren", "Tren", "🚂"),
          nw("Bisiklet", "Bisiklet", "🚴"),
          mp(
            { ku: "Otomobîl", tr: "Araba" },
            { ku: "Otobûs", tr: "Otobüs" },
            { ku: "Tren", tr: "Tren" },
            { ku: "Bisiklet", tr: "Bisiklet" },
          ),
          si("Otobûs", "Otobüs", [
            { ku: "Otobûs", tr: "Otobüs", emoji: "🚌" },
            { ku: "Otomobîl", tr: "Araba", emoji: "🚗" },
            { ku: "Tren", tr: "Tren", emoji: "🚂" },
            { ku: "Bisiklet", tr: "Bisiklet", emoji: "🚴" },
          ]),
        ]),
        L("u15-l4", "Lesson 4", "Şehir cümleleri", 14, [
          nw("Diçim bajar", "Şehre gidiyorum", "🚶"),
          nw("Bi otobûsê", "Otobüsle", "🚌"),
          nw("Pirr dûr", "Çok uzak", "📏"),
          mp(
            { ku: "Diçim bajar", tr: "Şehre gidiyorum" },
            { ku: "Bi otobûsê", tr: "Otobüsle" },
            { ku: "Pirr dûr", tr: "Çok uzak" },
            { ku: "Nêzîk", tr: "Yakın" },
          ),
          fb(["Ez bi ", " diçim."], ["otobûsê", "spas", "ne", "ku"], "Otobüsle gidiyorum."),
          tt("Şehir uzak.", "Bajar dûr e.", ["nêzîk", "ne"]),
          ta("Ez diçim bajar", ["Ez", "diçim", "bajar"], "Şehre gidiyorum"),
        ]),
      ],
    },
  ],
};

// =====================================================================
//  SECTION 3 — B1 ORTA (NAVÎN)
// =====================================================================

const SECTION_B1: DuoSection = {
  id: "s3",
  cefr: "B1",
  title: "Orta",
  subtitle: "B1 · Navîn",
  units: [
    // ─────────────────────────────────────────────────────
    // UNIT 16: Demên Buhurî (Past Tense) — adult only
    // ─────────────────────────────────────────────────────
    {
      id: "u16", no: 16, title: "Geçmiş Zaman", subtitle: "Demên buhurî",
      emoji: "📜", color: "#9B5DE5", track: "adult",
      objectives: ["Geçmiş zaman ekleri", "Yaygın geçmiş fiiller", "Olumsuz geçmiş", "Hikaye anlatımı"],
      lessons: [
        L("u16-l1", "Lesson 1", "Geçmişe giriş", 14, [
          nw("Çûm", "Gittim", "✈️", { ku: "Ez çûm bajar.", tr: "Şehre gittim." }),
          nw("Hatim", "Geldim", "🚶"),
          nw("Xwarim", "Yedim", "🍴"),
          nw("Vexwarim", "İçtim", "🥤"),
          mp(
            { ku: "Çûm", tr: "Gittim" },
            { ku: "Hatim", tr: "Geldim" },
            { ku: "Xwarim", tr: "Yedim" },
            { ku: "Vexwarim", tr: "İçtim" },
          ),
          fb(["Duh ez ", " bajar."], ["çûm", "spas", "ne", "ku"], "Dün şehre gittim."),
          ta("Ez çûm mal", ["Ez", "çûm", "mal"], "Eve gittim"),
        ]),
        L("u16-l2", "Lesson 2", "Yaygın geçmiş fiiller", 14, [
          nw("Got", "söyledi", "🗣️"),
          nw("Kir", "yaptı", "🛠️"),
          nw("Dît", "gördü", "👀"),
          nw("Bihîst", "duydu", "👂"),
          mp(
            { ku: "Got", tr: "söyledi" },
            { ku: "Kir", tr: "yaptı" },
            { ku: "Dît", tr: "gördü" },
            { ku: "Bihîst", tr: "duydu" },
          ),
          tt("Babam dedi.", "Bavê min got.", ["dît", "kir"]),
        ]),
        L("u16-l3", "Lesson 3", "Geçmiş cümleler", 14, [
          nw("Min got", "Söyledim", "🗣️"),
          nw("Te got", "Söyledin", "👉"),
          nw("Wî/Wê got", "O söyledi", "🧍"),
          mp(
            { ku: "Min got", tr: "Söyledim" },
            { ku: "Te got", tr: "Söyledin" },
            { ku: "Wî got", tr: "O (e) söyledi" },
            { ku: "Wê got", tr: "O (k) söyledi" },
          ),
          fb(["", " heval xwe dîtim."], ["Min", "Spas", "Mal", "Ne"], "Arkadaşımı gördüm."),
          tt("Sen ekmek yedin.", "Te nan xwar.", ["min", "wê"]),
        ]),
        L("u16-l4", "Lesson 4", "Olumsuz geçmiş", 14, [
          nw("Neçûm", "Gitmedim", "❌"),
          nw("Nehat", "Gelmedi", "❌"),
          nw("Nexwar", "Yemedi", "❌"),
          mp(
            { ku: "Neçûm", tr: "Gitmedim" },
            { ku: "Nehat", tr: "Gelmedi" },
            { ku: "Nexwar", tr: "Yemedi" },
            { ku: "Çûm", tr: "Gittim" },
          ),
          fb(["Ez ", " bajar."], ["neçûm", "spas", "ne", "ku"], "Şehre gitmedim."),
          tt("Hiç bir şey yemedim.", "Ez tu tişt nexwarim.", ["xwar", "vexwar"]),
        ]),
        L("u16-l5", "Lesson 5", "Mini hikaye", 16, [
          nw("Duh sibê", "Dün sabah", "📅"),
          nw("Heval min", "Arkadaşım", "🤝"),
          nw("Heval kişt e", "Arkadaş geldi", "👋"),
          mp(
            { ku: "Duh", tr: "Dün" },
            { ku: "Sibê", tr: "Sabah" },
            { ku: "Heval", tr: "Arkadaş" },
            { ku: "Çay", tr: "Çay" },
          ),
          tt("Dün sabah arkadaşım geldi.", "Duh sibê hevalê min hat.", ["çay", "min"]),
          tt("Çay içtik ve konuştuk.", "Me çay vexwar û axivîm.", ["nan", "xwar"]),
          ta("Duh ez çûm bajar", ["Duh", "ez", "çûm", "bajar"], "Dün şehre gittim"),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 17: Karûbar (Jobs)
    // ─────────────────────────────────────────────────────
    {
      id: "u17", no: 17, title: "Meslekler", subtitle: "Karûbar · doktor, öğretmen, ...",
      emoji: "💼", color: "#FF6B6B", track: "all",
      objectives: ["Sık meslekler", "Ne iş yapıyorsun", "İş yerleri"],
      lessons: [
        L("u17-l1", "Lesson 1", "Doktor, öğretmen", 12, [
          nw("Mamoste", "Öğretmen", "👨‍🏫"),
          nw("Bijîşk", "Doktor", "👨‍⚕️"),
          nw("Hosta", "Usta/zanaatkar", "🛠️"),
          nw("Karker", "İşçi", "👷"),
          mp(
            { ku: "Mamoste", tr: "Öğretmen" },
            { ku: "Bijîşk", tr: "Doktor" },
            { ku: "Hosta", tr: "Usta" },
            { ku: "Karker", tr: "İşçi" },
          ),
          si("Mamoste", "Öğretmen", [
            { ku: "Mamoste", tr: "Öğretmen", emoji: "👨‍🏫" },
            { ku: "Bijîşk", tr: "Doktor", emoji: "👨‍⚕️" },
            { ku: "Hosta", tr: "Usta", emoji: "🛠️" },
            { ku: "Karker", tr: "İşçi", emoji: "👷" },
          ]),
        ]),
        L("u17-l2", "Lesson 2", "Daha fazla meslek", 14, [
          nw("Cotkar", "Çiftçi", "👨‍🌾"),
          nw("Bazirgan", "Tüccar", "🛒"),
          nw("Polîs", "Polis", "👮"),
          nw("Şofêr", "Şoför", "🚕"),
          mp(
            { ku: "Cotkar", tr: "Çiftçi" },
            { ku: "Bazirgan", tr: "Tüccar" },
            { ku: "Polîs", tr: "Polis" },
            { ku: "Şofêr", tr: "Şoför" },
          ),
        ]),
        L("u17-l3", "Lesson 3", "Ne iş yaparsın?", 14, [
          nw("Karê te çi ye?", "İşin ne?", "❓"),
          nw("Ez mamoste me", "Ben öğretmenim", "👨‍🏫"),
          nw("Karê min", "İşim", "💼"),
          mp(
            { ku: "Karê te çi ye?", tr: "İşin ne?" },
            { ku: "Karê min", tr: "İşim" },
            { ku: "Ez mamoste me", tr: "Ben öğretmenim" },
            { ku: "Ez bijîşk im", tr: "Ben doktorum" },
          ),
          fb(["Ez ", " im."], ["mamoste", "spas", "ne", "ku"], "Ben öğretmenim."),
          tt("İşin ne?", "Karê te çi ye?", ["min", "ku"]),
          ta("Karê te çi ye?", ["Karê", "te", "çi", "ye?"], "İşin ne?"),
        ]),
        L("u17-l4", "Lesson 4", "İş yerleri", 14, [
          nw("Dibistan", "Okul", "🏫"),
          nw("Nexweşxane", "Hastane", "🏥"),
          nw("Ofîs", "Ofis", "🏢"),
          mp(
            { ku: "Dibistan", tr: "Okul" },
            { ku: "Nexweşxane", tr: "Hastane" },
            { ku: "Ofîs", tr: "Ofis" },
            { ku: "Mizgeft", tr: "Cami" },
          ),
          fb(["Mamoste li ", " kar dike."], ["dibistanê", "ne", "spas", "ku"], "Öğretmen okulda çalışıyor."),
          tt("Doktor hastanede çalışıyor.", "Bijîşk li nexweşxaneyê kar dike.", ["mamoste", "ofîs"]),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 18: Tenduristî (Health)
    // ─────────────────────────────────────────────────────
    {
      id: "u18", no: 18, title: "Sağlık", subtitle: "Tenduristî · doktor, ağrı",
      emoji: "🏥", color: "#FF4B4B", track: "adult",
      objectives: ["Sağlık şikayetleri", "Doktor ifadeleri", "Reçete"],
      lessons: [
        L("u18-l1", "Lesson 1", "Hastayım", 14, [
          nw("Nexweş", "Hasta", "🤒", { ku: "Ez nexweş im.", tr: "Ben hastayım." }),
          nw("Diêşe", "ağrıyor", "😣"),
          nw("Tendurist", "Sağlıklı", "💪"),
          nw("Derman", "İlaç", "💊"),
          mp(
            { ku: "Nexweş", tr: "Hasta" },
            { ku: "Diêşe", tr: "ağrıyor" },
            { ku: "Tendurist", tr: "Sağlıklı" },
            { ku: "Derman", tr: "İlaç" },
          ),
          fb(["Serê min ", "."], ["diêşe", "spas", "ne", "ku"], "Başım ağrıyor."),
          ta("Ez nexweş im", ["Ez", "nexweş", "im"], "Ben hastayım"),
        ]),
        L("u18-l2", "Lesson 2", "Doktorda", 14, [
          nw("Bijîşk", "Doktor", "👨‍⚕️"),
          nw("Pêşkar", "Hemşire", "👩‍⚕️"),
          nw("Pirsîn", "sormak", "❓"),
          mp(
            { ku: "Bijîşk", tr: "Doktor" },
            { ku: "Pêşkar", tr: "Hemşire" },
            { ku: "Derman", tr: "İlaç" },
            { ku: "Nexweşxane", tr: "Hastane" },
          ),
          tt("Doktora gidiyorum.", "Ez diçim ba bijîşk.", ["mamoste", "mal"]),
        ]),
        L("u18-l3", "Lesson 3", "Ağrılar", 14, [
          nw("Serêş", "Baş ağrısı", "🤕"),
          nw("Diran êş", "Diş ağrısı", "🦷"),
          nw("Hemd", "Ateş", "🌡️"),
          mp(
            { ku: "Serêş", tr: "Baş ağrısı" },
            { ku: "Diran êş", tr: "Diş ağrısı" },
            { ku: "Hemd", tr: "Ateş" },
            { ku: "Nexweş", tr: "Hasta" },
          ),
          fb(["Min ", " heye."], ["serêş", "spas", "ne", "ku"], "Baş ağrım var."),
        ]),
        L("u18-l4", "Lesson 4", "İyileşme", 14, [
          nw("Baş bûm", "İyileştim", "✅"),
          nw("Êdî", "Artık", "📍"),
          nw("Dermanan vexwarim", "İlaçları içtim", "💊"),
          mp(
            { ku: "Baş bûm", tr: "İyileştim" },
            { ku: "Êdî", tr: "Artık" },
            { ku: "Dermanan vexwarim", tr: "İlaçları içtim" },
            { ku: "Tendurist", tr: "Sağlıklı" },
          ),
          tt("Artık iyiyim.", "Ez êdî baş im.", ["nexweş", "ne"]),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 19: Çîrok (Stories) — short narratives
    // ─────────────────────────────────────────────────────
    {
      id: "u19", no: 19, title: "Hikayeler", subtitle: "Çîrok · kısa anlatılar",
      emoji: "📖", color: "#1CB0F6", track: "all",
      objectives: ["Hikaye dinleme", "Karakterler", "Anlama soruları"],
      lessons: [
        L("u19-l1", "Lesson 1", "Köyde sabah", 16, [
          nw("Gund", "Köy", "🏘️"),
          nw("Sibê", "Sabah", "🌅"),
          nw("Roj derket", "Güneş doğdu", "☀️"),
          mp(
            { ku: "Gund", tr: "Köy" },
            { ku: "Sibê", tr: "Sabah" },
            { ku: "Roj derket", tr: "Güneş doğdu" },
            { ku: "Mirîşk", tr: "Tavuk" },
          ),
          tt("Köyde sabah erkenden güneş doğdu.", "Li gund sibê zû roj derket.", ["êvarê", "şev"]),
          tt("Tavuklar uyandı.", "Mirîşkan şiyar bûn.", ["razin", "çûn"]),
          ta("Roj derket", ["Roj", "derket"], "Güneş doğdu"),
        ]),
        L("u19-l2", "Lesson 2", "Çocuk ve elma", 16, [
          nw("Zarok", "Çocuk", "🧒"),
          nw("Sêv", "Elma", "🍎"),
          nw("Kiriya", "Aldı", "🛒"),
          mp(
            { ku: "Zarok", tr: "Çocuk" },
            { ku: "Sêv", tr: "Elma" },
            { ku: "Kiriya", tr: "Aldı" },
            { ku: "Xwar", tr: "Yedi" },
          ),
          tt("Çocuk dükkana gitti.", "Zarok çû dukanê.", ["mal", "ne"]),
          tt("Bir elma aldı ve yedi.", "Sêvek kiriya û xwar.", ["şîr", "vexwar"]),
        ]),
        L("u19-l3", "Lesson 3", "Anlama soruları", 16, [
          nw("Ji bo çi?", "Ne için?", "❓"),
          nw("Ji ber ku", "Çünkü", "📌"),
          nw("Bersiv", "Cevap", "💬"),
          mp(
            { ku: "Ji bo çi?", tr: "Ne için?" },
            { ku: "Ji ber ku", tr: "Çünkü" },
            { ku: "Bersiv", tr: "Cevap" },
            { ku: "Pirs", tr: "Soru" },
          ),
          fb(["Ez nan dixwim ji ber ku ", "."], ["birçî me", "spas", "ne", "av"], "Yiyorum çünkü açım."),
          tt("Ne için geldin?", "Ji bo çi hatî?", ["çûyî", "ne"]),
        ]),
      ],
    },
  ],
};

// =====================================================================
//  TÜM SECTIONS
// =====================================================================

export const DUO_SECTIONS: DuoSection[] = [SECTION_A1, SECTION_A2, SECTION_B1];

// =====================================================================
//  YARDIMCI FONKSİYONLAR
// =====================================================================

export function getAllLessons(): { lesson: DuoLesson; unit: DuoUnit; section: DuoSection }[] {
  const out: { lesson: DuoLesson; unit: DuoUnit; section: DuoSection }[] = [];
  for (const section of DUO_SECTIONS) {
    for (const unit of section.units) {
      for (const lesson of unit.lessons) {
        out.push({ lesson, unit, section });
      }
    }
  }
  return out;
}

export function findLessonById(id: string): { lesson: DuoLesson; unit: DuoUnit; section: DuoSection } | null {
  for (const section of DUO_SECTIONS) {
    for (const unit of section.units) {
      for (const lesson of unit.lessons) {
        if (lesson.id === id) return { lesson, unit, section };
      }
    }
  }
  return null;
}

/**
 * Track filtresi: kullanıcının yaşına göre uygun section/unit'leri döner.
 *   • child  → "all" + "kid" üniteleri (yetişkin gramer/iş gizlenir)
 *   • adult  → "all" + "adult" üniteleri (kid-only varsa gizlenir)
 *
 * Section'ları içlerindeki uygun unit varsa korur, yoksa atar.
 */
export function getSectionsForAudience(audience: "child" | "adult"): DuoSection[] {
  return DUO_SECTIONS
    .map(section => ({
      ...section,
      units: section.units.filter(unit =>
        unit.track === "all" ||
        (audience === "child" && unit.track === "kid") ||
        (audience === "adult" && unit.track === "adult"),
      ),
    }))
    .filter(section => section.units.length > 0);
}

export const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
