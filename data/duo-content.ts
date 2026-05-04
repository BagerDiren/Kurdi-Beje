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
  | "fill-blank"
  | "tip-card"     // yeni: gramer/kültür açıklaması
  | "story";       // yeni: çok satırlı diyalog

/**
 * Bazı egzersizlerde optional `explanation` alanı yer alır.
 * Yanlış cevap sonrası "Neden?" butonu basıldığında gösterilir
 * (Duolingo'nun "Explain My Answer" özelliği).
 */
type WithExplanation = { explanation?: string };

export type Exercise =
  | ({ type: "new-word"; ku: string; tr: string; emoji: string; sample?: { ku: string; tr: string } } & WithExplanation)
  | ({ type: "translate-ku-tr"; sentenceKu: string; sentenceTr: string; words: string[] } & WithExplanation)
  | ({ type: "translate-tr-ku"; sentenceTr: string; sentenceKu: string; words: string[] } & WithExplanation)
  | ({ type: "tap-audio"; audioKu: string; words: string[]; trHint?: string } & WithExplanation)
  | ({ type: "match-pairs"; pairs: { ku: string; tr: string }[] } & WithExplanation)
  | ({ type: "select-image"; ku: string; tr: string; options: { ku: string; tr: string; emoji: string }[]; correctIdx: number } & WithExplanation)
  | ({ type: "fill-blank"; sentenceParts: [string, string]; options: string[]; correctIdx: number; trHint: string } & WithExplanation)
  // Tip Card: gramer/kültür açıklaması, etkileşim yok, sadece "ANLADIM"
  | { type: "tip-card"; emoji: string; title: string; bodyTr: string; example?: { ku: string; tr: string } }
  // Story: çok satırlı bir diyalog, her satır KU + TR
  | { type: "story"; title: string; lines: { ku: string; tr: string; speaker?: "A" | "B" | "narrator" }[] };

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
  cefr: "A1" | "A2" | "B1" | "B2";
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

// Tip card: gramer/kültür açıklaması — etkileşim yok, sadece okutma
const tip = (emoji: string, title: string, bodyTr: string, example?: { ku: string; tr: string }): Exercise =>
  ({ type: "tip-card", emoji, title, bodyTr, ...(example && { example }) });

// Story: küçük diyalog — anlatım amacı
const story = (title: string, lines: { ku: string; tr: string; speaker?: "A" | "B" | "narrator" }[]): Exercise =>
  ({ type: "story", title, lines });

// Egzersize açıklama eklemek için yardımcı (değiştirici)
const ex = <E extends Exercise>(e: E, explanation: string): E => ({ ...e, explanation } as E);

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
          tip("💡", "Kürtçe zamirleri",
              "Türkçedeki gibi 6 zamir vardır. Ben/sen/o için Ez/Tu/Ew kullanılır. " +
              "Cümlede özne bellidir, çünkü fiile ek gelir (-im, -î, -e).",
              { ku: "Ez baş im. Tu baş î. Ew baş e.", tr: "Ben iyiyim. Sen iyisin. O iyidir." }),
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
          tip("📐", "Olmak fiili (kop)",
              "Türkçede '-im, -sin, -dir' eklerinin Kürtçe karşılığı:\n" +
              "Ez ___ im (ben), Tu ___ î (sen), Ew ___ e (o)\n" +
              "Sıfattan SONRA gelir — 'Ez baş im' = 'Ben iyi-yim'.",
              { ku: "Ez Kurd im. Tu Tirk î. Ew baş e.", tr: "Ben Kürdüm. Sen Türksün. O iyidir." }),
          nw("im", "(ben) ...im", "👤", { ku: "Ez baş im.", tr: "Ben iyiyim." }),
          nw("î", "(sen) ...sin", "👤", { ku: "Tu Kurd î?", tr: "Sen Kürt müsün?" }),
          nw("e", "(o) ...dir", "👤", { ku: "Ew baş e.", tr: "O iyidir." }),
          mp(
            { ku: "Ez baş im", tr: "İyiyim" },
            { ku: "Tu baş î", tr: "İyisin" },
            { ku: "Ew baş e", tr: "İyidir" },
            { ku: "Spas", tr: "Teşekkürler" },
          ),
          ex(fb(["Tu Kurd ", "?"], ["î", "im", "e", "in"], "Sen Kürt müsün?"),
             "'Tu' (sen) ile birlikte fiil eki '-î' olur. 'im' ben, 'e' o, 'in' biz/siz/onlar."),
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
          tip("🔑", "Sahiplik (-ê min, -a min)",
              "Türkçede 'annem' = 'anne+m'. Kürtçede sahiplik isimden SONRA + min ile yapılır.\n" +
              "Eril (erkek): bav (baba) → bavê min (babam)\n" +
              "Dişil (kadın): dayik (anne) → dayika min (annem)\n" +
              "Sondaki -ê erkek için, -a kadın için kullanılır.",
              { ku: "Dayika min mamoste ye. Bavê min bijîşk e.", tr: "Annem öğretmen. Babam doktor." }),
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
          tip("🍴", "SOV cümle yapısı",
              "Kürtçe Özne-Nesne-Yüklem (SOV) sırasını kullanır — Türkçeye çok benzer!\n" +
              "Ez (ben) + av (su) + vexwim (içiyorum) = 'Ben su içiyorum'\n" +
              "Fiil her zaman cümle SONUNDA olur.",
              { ku: "Ez nan dixwim.", tr: "Ben ekmek yiyorum." }),
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
    // ─────────────────────────────────────────────────────
    // UNIT 8b: Mesleklere Giriş + Hayvan Sesleri (yeni A1 ünite)
    // ─────────────────────────────────────────────────────
    {
      id: "u8b", no: 8.5, title: "Hayvan Sesleri", subtitle: "Dengên heywanan · ses + hayvan",
      emoji: "🔊", color: "#F39C12", track: "kid",
      objectives: ["Köpek havlar, kedi miyavlar", "Çiftlik sesleri"],
      lessons: [
        L("u8b-l1", "Lesson 1", "Köpek + kedi", 10, [
          nw("Diqîre", "Havlıyor", "🐶"),
          nw("Diqîqe", "Miyavlıyor", "🐱"),
          nw("Birûskek", "Bir kedi yavrusu", "🐱"),
          mp(
            { ku: "Kûçik diqîre", tr: "Köpek havlıyor" },
            { ku: "Pisîk diqîqe", tr: "Kedi miyavlıyor" },
            { ku: "Ga dirûse", tr: "İnek möğrür" },
            { ku: "Pez dibehe", tr: "Koyun melemler" },
          ),
          tt("Köpek havlıyor.", "Kûçik diqîre.", ["pisîk", "ga"]),
          ta("Kûçik diqîre", ["Kûçik", "diqîre"], "Köpek havlıyor"),
        ]),
        L("u8b-l2", "Lesson 2", "Çiftlik hayvanları", 10, [
          nw("Dirûse", "Möğrür", "🐮"),
          nw("Dibehe", "Melemler", "🐑"),
          nw("Diqewze", "Şahlanır", "🐴"),
          mp(
            { ku: "Mirîşk", tr: "Tavuk" },
            { ku: "Hesp", tr: "At" },
            { ku: "Pez", tr: "Koyun" },
            { ku: "Ga", tr: "İnek" },
          ),
          fb(["Mirîşk ", "."], ["dixwîne", "diqîre", "dibehe", "dirûse"],
             "Tavuk ötüyor."),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 8c: Hayır cümleleri ve sorular (A1 dilbilgisi)
    // ─────────────────────────────────────────────────────
    {
      id: "u8c", no: 8.7, title: "Soru Sorma", subtitle: "Pirsîn · kim, ne, nerede",
      emoji: "❓", color: "#E91E63", track: "all",
      objectives: ["Soru kelimeleri", "Yes/no soruları", "Wh-soruları"],
      lessons: [
        L("u8c-l1", "Lesson 1", "Soru kelimeleri", 12, [
          tip("❓", "Soru kelimeleri",
              "Kürtçede 5 temel soru kelimesi:\n" +
              "Kî = kim · Çi = ne · Ku = nerede\n" +
              "Kengî = ne zaman · Çawa = nasıl\n" +
              "Yes/No sorusunda cümle sonuna soru tonu yeter.",
              { ku: "Tu kî yî? Ev çi ye?", tr: "Sen kimsin? Bu ne?" }),
          nw("Kî", "Kim", "👤"),
          nw("Çi", "Ne", "🤔"),
          nw("Ku", "Nerede", "📍"),
          nw("Kengî", "Ne zaman", "🕐"),
          nw("Çawa", "Nasıl", "🤷"),
          mp(
            { ku: "Kî", tr: "Kim" },
            { ku: "Çi", tr: "Ne" },
            { ku: "Ku", tr: "Nerede" },
            { ku: "Kengî", tr: "Ne zaman" },
          ),
          tt("Sen kimsin?", "Tu kî yî?", ["çi", "ku", "yî"]),
        ]),
        L("u8c-l2", "Lesson 2", "Yes/No soruları", 12, [
          nw("Tu Kurd î?", "Sen Kürt müsün?", "❓"),
          nw("Erê", "Evet", "✅"),
          nw("Na", "Hayır", "❌"),
          mp(
            { ku: "Tu Kurd î?", tr: "Sen Kürt müsün?" },
            { ku: "Tu mamoste yî?", tr: "Sen öğretmen misin?" },
            { ku: "Erê, ez Kurd im", tr: "Evet, Kürdüm" },
            { ku: "Na, ez ne mamoste me", tr: "Hayır, öğretmen değilim" },
          ),
          ex(fb(["Tu mamoste ", "?"], ["yî", "im", "e", "ku"],
                "Sen öğretmen misin?"),
             "'Tu' (sen) ile yes/no sorusu: cümle sonuna 'yî' eki + soru tonu."),
          tt("Hayır, ben öğretmen değilim.", "Na, ez ne mamoste me.",
             ["erê", "Kurd", "yî"]),
        ]),
        L("u8c-l3", "Lesson 3", "Bu ne? Bu kim?", 12, [
          nw("Ev çi ye?", "Bu ne?", "❓"),
          nw("Ev kî ye?", "Bu kim?", "👀"),
          nw("Ev mal e", "Bu ev", "🏠"),
          nw("Ev hevalê min e", "Bu arkadaşım", "🤝"),
          mp(
            { ku: "Ev çi ye?", tr: "Bu ne?" },
            { ku: "Ev kî ye?", tr: "Bu kim?" },
            { ku: "Ev mal e", tr: "Bu ev" },
            { ku: "Ev sêv e", tr: "Bu elma" },
          ),
          tt("Bu benim arkadaşım.", "Ev hevalê min e.", ["çi", "ye", "yî"]),
          ta("Ev kî ye?", ["Ev", "kî", "ye?"], "Bu kim?"),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 8d: İşaret Sıfatları (Demonstratives) — Thackston §2
    // ─────────────────────────────────────────────────────
    {
      id: "u8d", no: 8.8, title: "Bu / Şu", subtitle: "Ev / Ew · işaret sıfatları",
      emoji: "👉", color: "#3949AB", track: "all",
      objectives: ["Ev (bu) vs Ew (şu/o)", "Eril/dişil farkı (eva/ewa)", "Çoğul (evana/ewana)"],
      lessons: [
        L("u8d-l1", "Lesson 1", "Ev (bu) — yakın", 12, [
          tip("👉", "İşaret sıfatları (Demonstratives)",
              "Kürtçede 2 temel işaret:\n" +
              "Ev = Bu (yakın)\n" +
              "Ew = Şu / O (uzak)\n" +
              "İsme uyum: ev mal (bu ev, eril/dişil aynı)\n" +
              "Oblique (yan hâl): vî / vê (eril/dişil)",
              { ku: "Ev mal nû ye. Ew mal kevn e.", tr: "Bu ev yeni. O ev eski." }),
          nw("Ev", "Bu", "👈"),
          nw("Ew", "Şu / O", "👉"),
          nw("Ev mal", "Bu ev", "🏠"),
          nw("Ew sêv", "O elma", "🍎"),
          mp(
            { ku: "Ev", tr: "Bu" },
            { ku: "Ew", tr: "Şu / O" },
            { ku: "Ev mal", tr: "Bu ev" },
            { ku: "Ew sêv", tr: "O elma" },
          ),
          tt("Bu kitap güzel.", "Ev pirtûk xweş e.", ["ew", "ne", "ye"]),
          ta("Ev mal", ["Ev", "mal"], "Bu ev"),
        ]),
        L("u8d-l2", "Lesson 2", "Vî / Vê (oblique)", 14, [
          tip("📐", "Yan hâl (oblique) işaretleri",
              "İşaret sıfatı bir prepositionun nesnesi olunca yan hâle girer:\n" +
              "Eril: Vî (li vî bajarî = bu şehirde)\n" +
              "Dişil: Vê (di vê malê de = bu evde)\n" +
              "Çoğul: Van (li van mal- = bu evlerde)",
              { ku: "Li vî bajarî pirr xweş e.", tr: "Bu şehir çok güzel." }),
          nw("Vî", "Bu (eril yan)", "♂️"),
          nw("Vê", "Bu (dişil yan)", "♀️"),
          nw("Van", "Bunlar", "👥"),
          mp(
            { ku: "Vî bajarî", tr: "Bu şehri" },
            { ku: "Vê malê", tr: "Bu evi" },
            { ku: "Van zarokan", tr: "Bu çocukları" },
            { ku: "Wan kesan", tr: "O kişileri" },
          ),
          ex(fb(["Li ", " bajarî pirr xweş e."], ["vî", "ev", "ku", "ne"],
                "Bu şehir çok güzel."),
             "Preposition 'li' sonrası eril isim → 'vî' (oblique)."),
          tt("Bu evde yaşıyorum.", "Ez di vê malê de dijîm.",
             ["bajarî", "vî", "ne"]),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 8e: 🎵 ŞARKI ZAMANI — Kid-only (Zarok TV ilhamı)
    // ─────────────────────────────────────────────────────
    {
      id: "u8e", no: 8.85, title: "Şarkı Zamanı", subtitle: "Stranên zarokan · şarkıyla öğren",
      emoji: "🎵", color: "#FF6B9D", track: "kid",
      objectives: ["Alfabe şarkısı", "Sayma şarkısı", "Renkler şarkısı"],
      lessons: [
        L("u8e-l1", "Lesson 1", "Alfabe şarkısı", 10, [
          tip("🔤", "Kürtçe alfabe (31 harf)",
              "Kurmancî alfabesi 31 harften oluşur. Türkçeye benzer ama:\n" +
              "• Q, X, W harfleri var (Türkçede yok)\n" +
              "• Î, Û, Ê uzun ünlüleridir\n" +
              "• Ç, Ş, J Türkçe ile aynı",
              { ku: "A B C Ç D E Ê F G H I Î J K L M N O P Q R S Ş T U Û V W X Y Z", tr: "Kurmancî alfabe 31 harf" }),
          nw("A", "A harfi", "🅰️"),
          nw("B", "B harfi", "🅱️"),
          nw("Ê", "Ê (uzun e)", "🆔"),
          nw("Q", "Q (gırtlak)", "🆘"),
          mp(
            { ku: "A — Av", tr: "A — Su" },
            { ku: "B — Bav", tr: "B — Baba" },
            { ku: "Ç — Çav", tr: "Ç — Göz" },
            { ku: "D — Dest", tr: "D — El" },
          ),
          ta("A B C Ç", ["A", "B", "C", "Ç"], "İlk dört harf"),
        ]),
        L("u8e-l2", "Lesson 2", "Sayma şarkısı (1-10)", 10, [
          tip("🔢", "Şarkıyla say!",
              "Yek du sê — bu Kürtçe sayma melodisidir. Çocuklar şarkıyla öğrenir.\n" +
              "Yek (1), Du (2), Sê (3), Çar (4), Pênc (5),\n" +
              "Şeş (6), Heft (7), Heşt (8), Neh (9), Deh (10)",
              { ku: "Yek du sê, çar pênc şeş, heft heşt neh deh!", tr: "Bir iki üç, dört beş altı, yedi sekiz dokuz on!" }),
          mp(
            { ku: "Yek", tr: "Bir" },
            { ku: "Du", tr: "İki" },
            { ku: "Sê", tr: "Üç" },
            { ku: "Çar", tr: "Dört" },
          ),
          ta("Yek du sê", ["Yek", "du", "sê"], "Bir iki üç"),
          ta("Heft heşt neh deh", ["Heft", "heşt", "neh", "deh"], "Yedi sekiz dokuz on"),
        ]),
        L("u8e-l3", "Lesson 3", "Renkler şarkısı", 10, [
          tip("🌈", "Renkleri şarkıyla öğren",
              "Sor sêv, kesk dar, şîn av, zer roj — Kürtçede renkler doğa öğelerle eşleşir.",
              { ku: "Sor mîna sêvê, şîn mîna avê.", tr: "Elma gibi kırmızı, su gibi mavi." }),
          mp(
            { ku: "Sor — Sêv", tr: "Kırmızı — Elma" },
            { ku: "Şîn — Av", tr: "Mavi — Su" },
            { ku: "Kesk — Dar", tr: "Yeşil — Ağaç" },
            { ku: "Zer — Roj", tr: "Sarı — Güneş" },
          ),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 8f: 📖 KEV'İN MASALLARI — Kid-only
    // ─────────────────────────────────────────────────────
    {
      id: "u8f", no: 8.9, title: "Kev'in Masalları", subtitle: "Çîrokên Kev · kısa hikayeler",
      emoji: "📖", color: "#9B5DE5", track: "kid",
      objectives: ["Tilki ve karga", "Demirci Kawa (kısa)", "Bir hayvan günü"],
      lessons: [
        L("u8f-l1", "Lesson 1", "Tilki ve Tavşan", 12, [
          story("Tilki ve Tavşan", [
            { speaker: "narrator", ku: "Rojekê, rovî û keroşk hatin hev.", tr: "Bir gün, tilki ve tavşan karşılaştı." },
            { speaker: "A", ku: "Silav heval! Tu çawa yî?", tr: "Selam dostum! Nasılsın?" },
            { speaker: "B", ku: "Spas, ez baş im. Tu jî?", tr: "Sağol, iyiyim. Sen de?" },
            { speaker: "A", ku: "Erê, ez jî baş im. Hadê em bilîzin!", tr: "Evet, ben de iyiyim. Hadi oynayalım!" },
            { speaker: "narrator", ku: "Wan bi hev re lîst û kêfxweş bûn.", tr: "Birlikte oynadılar ve mutlu oldular." },
          ]),
          mp(
            { ku: "Rovî", tr: "Tilki" },
            { ku: "Keroşk", tr: "Tavşan" },
            { ku: "Heval", tr: "Arkadaş" },
            { ku: "Lîstin", tr: "Oynamak" },
          ),
          tt("Tilki ve tavşan oynadı.", "Rovî û keroşk lîstin.", ["çû", "ne"]),
        ]),
        L("u8f-l2", "Lesson 2", "Newroz Hikayesi (kısa)", 14, [
          tip("🔥", "Newroz nedir?",
              "21 Mart Kürt yeni yılı. Demirci Kawa zalim Dehak'ı yendi.\n" +
              "Ateş yakılır, halay (govend) çekilir.",
              { ku: "Newroz pîroz be!", tr: "Newroz kutlu olsun!" }),
          story("Demirci Kawa", [
            { speaker: "narrator", ku: "Demek dehak hebû. Ew gelek xirab bû.", tr: "Çok kötü bir Dehak vardı." },
            { speaker: "narrator", ku: "Kawayê hesinkar serê wî kar.", tr: "Demirci Kawa onu yendi." },
            { speaker: "narrator", ku: "Agir vêket, mirov şabûn.", tr: "Ateş yandı, insanlar sevindi." },
            { speaker: "narrator", ku: "Vê rojê em jê re Newroz dibêjin.", tr: "Bu güne Newroz diyoruz." },
          ]),
          nw("Agir", "Ateş", "🔥"),
          nw("Govend", "Halay", "💃"),
          nw("Pîroz be", "Kutlu olsun", "🎉"),
          mp(
            { ku: "Newroz", tr: "Yeni gün/yıl" },
            { ku: "Agir", tr: "Ateş" },
            { ku: "Govend", tr: "Halay" },
            { ku: "Pîroz be", tr: "Kutlu olsun" },
          ),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 8g: 🎨 BOYA & ÇİZ — Kid-only (Draw with Will tarzı)
    // ─────────────────────────────────────────────────────
    {
      id: "u8g", no: 8.95, title: "Boya & Çiz", subtitle: "Reng û resim · şekiller",
      emoji: "🎨", color: "#FF9600", track: "kid",
      objectives: ["Şekiller (yuvarlak, kare)", "Eylem fiilleri (çiz, boya)", "Sanat kelimeleri"],
      lessons: [
        L("u8g-l1", "Lesson 1", "Şekiller", 10, [
          nw("Çember", "Yuvarlak", "⭕"),
          nw("Çarçik", "Kare", "🟦"),
          nw("Sêgoşe", "Üçgen", "🔺"),
          nw("Çar goşe", "Dörtgen", "🟦"),
          nw("Stêr", "Yıldız", "⭐"),
          mp(
            { ku: "Çember", tr: "Yuvarlak" },
            { ku: "Çarçik", tr: "Kare" },
            { ku: "Sêgoşe", tr: "Üçgen" },
            { ku: "Stêr", tr: "Yıldız" },
          ),
          si("Stêr", "Yıldız", [
            { ku: "Stêr", tr: "Yıldız", emoji: "⭐" },
            { ku: "Çember", tr: "Yuvarlak", emoji: "⭕" },
            { ku: "Çarçik", tr: "Kare", emoji: "🟦" },
            { ku: "Sêgoşe", tr: "Üçgen", emoji: "🔺" },
          ]),
        ]),
        L("u8g-l2", "Lesson 2", "Çiz, boya, kes!", 12, [
          nw("Resim bikişîne", "Çiz!", "✏️"),
          nw("Reng bike", "Boya!", "🖍️"),
          nw("Bibire", "Kes!", "✂️"),
          nw("Bişîlêne", "Yapıştır!", "📎"),
          mp(
            { ku: "Resim bikişîne", tr: "Çiz!" },
            { ku: "Reng bike", tr: "Boya!" },
            { ku: "Bibire", tr: "Kes!" },
            { ku: "Bişîlêne", tr: "Yapıştır!" },
          ),
          ex(fb(["", " stêrekê!"], ["Resim bikişîne", "Bibire", "Reng bike", "Bişîlêne"],
                "Bir yıldız çiz!"),
             "Imperative + sêv-ekê (bir yıldızı). 'Bikişîne' = çiz (komut)."),
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
    // ─────────────────────────────────────────────────────
    // UNIT 15b: Para ve Çarşı (yeni A2 ünite)
    // ─────────────────────────────────────────────────────
    {
      id: "u15b", no: 15.5, title: "Para ve Çarşı", subtitle: "Pere û çarşû",
      emoji: "💰", color: "#1B5E20", track: "all",
      objectives: ["Para birimleri", "Pahalı/ucuz", "Almak/satmak", "Kaç para?"],
      lessons: [
        L("u15b-l1", "Lesson 1", "Para kavramı", 12, [
          nw("Pere", "Para", "💰"),
          nw("Çend", "Kaç", "🔢"),
          nw("Buha", "Pahalı", "💸"),
          nw("Erzan", "Ucuz", "🏷️"),
          mp(
            { ku: "Pere", tr: "Para" },
            { ku: "Buha", tr: "Pahalı" },
            { ku: "Erzan", tr: "Ucuz" },
            { ku: "Çend", tr: "Kaç" },
          ),
          tt("Bu çok pahalı.", "Ev pirr buha ye.", ["erzan", "ne"]),
        ]),
        L("u15b-l2", "Lesson 2", "Almak / satmak", 14, [
          tip("🛒", "Çarşı eylemleri",
              "Kirîn = satın almak, firotin = satmak.\n" +
              "Çend pere ye? = Kaç para?\n" +
              "Min kirî = Ben aldım (geçişli geçmiş)",
              { ku: "Min sêv kirîn.", tr: "Elma aldım." }),
          nw("Kirîn", "Satın almak", "🛒"),
          nw("Firotin", "Satmak", "🏪"),
          nw("Çend pere ye?", "Kaç para?", "💵"),
          nw("Bes", "Yeter", "✋"),
          mp(
            { ku: "Kirîn", tr: "Satın almak" },
            { ku: "Firotin", tr: "Satmak" },
            { ku: "Çend pere ye?", tr: "Kaç para?" },
            { ku: "Bes", tr: "Yeter" },
          ),
          ex(tt("Bu kaç para?", "Ev çend pere ye?", ["buha", "erzan", "kirîn"]),
             "'Çend pere ye?' standart 'kaç para?' sorusu."),
          ta("Min sêv kirîn", ["Min", "sêv", "kirîn"], "Elma aldım"),
        ]),
        L("u15b-l3", "Lesson 3", "Çarşı diyaloğu", 14, [
          story("Çarşıda alışveriş", [
            { speaker: "A", ku: "Roj baş! Ev sêv çend pere ye?", tr: "Günaydın! Bu elma kaç para?" },
            { speaker: "B", ku: "Sêvek deh lîre ye.", tr: "Bir elma on lira." },
            { speaker: "A", ku: "Pirr buha ye! Bes erzantir tune?", tr: "Çok pahalı! Daha ucuzu yok mu?" },
            { speaker: "B", ku: "Hene, ev jî pênc lîre ye.", tr: "Var, bu da beş lira." },
            { speaker: "A", ku: "Baş e, ez du heb dixwazim.", tr: "Tamam, iki tane istiyorum." },
          ]),
          mp(
            { ku: "Pere", tr: "Para" },
            { ku: "Buha", tr: "Pahalı" },
            { ku: "Erzan", tr: "Ucuz" },
            { ku: "Heb", tr: "Tane / adet" },
          ),
          tt("İki tane istiyorum.", "Ez du heb dixwazim.", ["pênc", "ne", "kirîn"]),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 15c: Sağlık temel (yeni A2 ünite)
    // ─────────────────────────────────────────────────────
    {
      id: "u15c", no: 15.7, title: "Sağlık Temel", subtitle: "Tenduristî · doktor, hasta",
      emoji: "🩺", color: "#C62828", track: "all",
      objectives: ["Hasta hissetme", "Vücut bölgesi ağrısı", "Doktor randevusu"],
      lessons: [
        L("u15c-l1", "Lesson 1", "Hasta hissetmek", 12, [
          nw("Nexweş", "Hasta", "🤒"),
          nw("Tenduristî", "Sağlık", "💪"),
          nw("Bijîşk", "Doktor", "👨‍⚕️"),
          nw("Diêşe", "Ağrıyor", "😣"),
          mp(
            { ku: "Nexweş", tr: "Hasta" },
            { ku: "Bijîşk", tr: "Doktor" },
            { ku: "Diêşe", tr: "Ağrıyor" },
            { ku: "Tenduristî", tr: "Sağlık" },
          ),
          fb(["Ez ", " im."], ["nexweş", "bijîşk", "kar", "ne"], "Hastayım."),
          tt("Başım ağrıyor.", "Serê min diêşe.", ["zikê", "kalbim"]),
        ]),
        L("u15c-l2", "Lesson 2", "Doktora gitmek", 14, [
          nw("Nexweşxane", "Hastane", "🏥"),
          nw("Derman", "İlaç", "💊"),
          nw("Pijaqe", "Reçete", "📋"),
          nw("Birîn", "Yara", "🩹"),
          mp(
            { ku: "Nexweşxane", tr: "Hastane" },
            { ku: "Derman", tr: "İlaç" },
            { ku: "Pijaqe", tr: "Reçete" },
            { ku: "Birîn", tr: "Yara" },
          ),
          ex(tt("Doktora gidiyorum.", "Ez diçim ba bijîşk.", ["nexweş", "diêşe"]),
             "'Ba bijîşk' = doktora (ba = yanına/-e doğru)"),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 15d: EZAFE (Construct case) — Thackston §4 ⭐⭐⭐ EN KRİTİK
    // ─────────────────────────────────────────────────────
    {
      id: "u15d", no: 15.8, title: "Ezafe (-ê / -a)", subtitle: "İsim + isim/sıfat bağlama",
      emoji: "🔗", color: "#7B1FA2", track: "all",
      objectives: ["Ezafe nedir", "Eril -ê, dişil -a", "Çoğul -ên", "Sıfat bağlama"],
      lessons: [
        L("u15d-l1", "Lesson 1", "Ezafe ne işe yarar?", 16, [
          tip("🔗", "Ezafe — Kürtçenin omurgası",
              "İki ismi/sıfatı bağlamak için isim sonuna ek gelir.\n" +
              "Türkçedeki '-(s)i' eki gibi (kapı kolu = derê maleê).\n\n" +
              "Eril isim → -ê: bavê min (babam), kûçikê reş (siyah köpek)\n" +
              "Dişil isim → -a: dayika min (annem), maleya nû (yeni ev)\n" +
              "Çoğul → -ên: hevalên min (arkadaşlarım)",
              { ku: "Mala bavê min mezin e.", tr: "Babamın evi büyük." }),
          nw("Bavê min", "Babam", "👨"),
          nw("Dayika min", "Annem", "👩"),
          nw("Hevalên min", "Arkadaşlarım", "👥"),
          mp(
            { ku: "Bavê min", tr: "Babam" },
            { ku: "Dayika min", tr: "Annem" },
            { ku: "Hevalên min", tr: "Arkadaşlarım" },
            { ku: "Mala min", tr: "Evim" },
          ),
          ex(fb(["Bav ", " min mamoste ye."], ["ê", "a", "ên", "yî"],
                "Babam öğretmen."),
             "'Bav' (eril) → 'bavê min'. Eril isimde -ê eki kullanılır."),
          ex(fb(["Dayik ", " min bijîşk e."], ["a", "ê", "ên", "yî"],
                "Annem doktor."),
             "'Dayik' (dişil) → 'dayika min'. Dişil isimde -a eki."),
          ta("Mala bavê min", ["Mala", "bavê", "min"], "Babamın evi"),
        ]),
        L("u15d-l2", "Lesson 2", "Sıfat bağlama (Ezafe)", 16, [
          tip("🎨", "İsim + sıfat: ezafe ile",
              "Sıfat ismin SONRASINA gelir, ezafe ile bağlanır:\n" +
              "Eril: kûçikê reş (siyah köpek)\n" +
              "Dişil: dayika baş (iyi anne)\n" +
              "Çoğul: kûçikên mezin (büyük köpekler)",
              { ku: "Mala mezin a min nû ye.", tr: "Benim büyük evim yeni." }),
          nw("Kûçikê reş", "Siyah köpek", "🐶"),
          nw("Mala mezin", "Büyük ev", "🏠"),
          nw("Sêva sor", "Kırmızı elma", "🍎"),
          nw("Çiyayên bilind", "Yüksek dağlar", "⛰️"),
          mp(
            { ku: "Kûçikê reş", tr: "Siyah köpek" },
            { ku: "Mala mezin", tr: "Büyük ev" },
            { ku: "Sêva sor", tr: "Kırmızı elma" },
            { ku: "Çiyayên bilind", tr: "Yüksek dağlar" },
          ),
          tt("Yeni evim güzel.", "Mala min a nû xweş e.",
             ["mezin", "ne", "kevn"]),
          tt("Bu kırmızı elmalar tatlı.", "Ev sêvên sor xweş in.",
             ["mezin", "ne", "ya"]),
        ]),
        L("u15d-l3", "Lesson 3", "İki isim arasında ezafe", 16, [
          tip("🔗", "İsim tamlaması (... yê ... )",
              "Türkçede 'Babamın evi' → Kürtçede 'Mala bavê min'\n" +
              "Sahip olunan isim ÖNCE, sahip SONRA. Aralarında ezafe.\n" +
              "Mal+a (dişil) + bav+ê (eril) + min = babamın evi",
              { ku: "Pirtûka mamosteyê min", tr: "Öğretmenimin kitabı" }),
          nw("Mala bav", "Babanın evi", "🏠"),
          nw("Pirtûka mamoste", "Öğretmenin kitabı", "📚"),
          nw("Navê dibistanê", "Okulun adı", "🏫"),
          mp(
            { ku: "Mala bavê min", tr: "Babamın evi" },
            { ku: "Pirtûka mamosteyê min", tr: "Öğretmenimin kitabı" },
            { ku: "Navê dibistana min", tr: "Okulumun adı" },
            { ku: "Rengê çavên te", tr: "Gözlerinin rengi" },
          ),
          ex(tt("Annemin arabası kırmızı.",
                "Otomobîla dayika min sor e.",
                ["bavê", "ne", "kevn"]),
             "Otomobîl (dişil) → otomobîl+a, dayik (dişil) → dayik+a. İki ezafe zincirleme."),
        ]),
        L("u15d-l4", "Lesson 4", "Ezafe çoğul (-ên)", 14, [
          nw("-ên", "Çoğul ezafe", "🔗"),
          nw("Hevalên min", "Arkadaşlarım", "👥"),
          nw("Pirtûkên xwendekar", "Öğrencinin kitapları", "📚"),
          mp(
            { ku: "Hevalên min", tr: "Arkadaşlarım" },
            { ku: "Pirtûkên min", tr: "Kitaplarım" },
            { ku: "Çavên te", tr: "Gözlerin" },
            { ku: "Bavê min", tr: "Babam (tekil)" },
          ),
          tt("Arkadaşlarım eve geldi.",
             "Hevalên min hatin malê.",
             ["hevalê", "ne", "çû"]),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 15e: Indefinite (-ek) — Thackston §3
    // ─────────────────────────────────────────────────────
    {
      id: "u15e", no: 15.9, title: "Bir / Birkaç (-ek)", subtitle: "Belirsiz hâl",
      emoji: "1️⃣", color: "#00897B", track: "all",
      objectives: ["-ek belirsiz eki", "İsim + ek kullanımı", "Hebûn ile var/yok"],
      lessons: [
        L("u15e-l1", "Lesson 1", "Bir kitap (pirtûkek)", 14, [
          tip("1️⃣", "Belirsiz hâl: -ek",
              "Türkçedeki 'bir' yerine isim sonuna -ek gelir:\n" +
              "Pirtûk = kitap → Pirtûkek = bir kitap\n" +
              "Sêv = elma → Sêvek = bir elma\n" +
              "Çoğul: -in (sêvin = elmalar/birkaç elma)",
              { ku: "Min sêvek kirî.", tr: "Bir elma aldım." }),
          nw("Pirtûkek", "Bir kitap", "📚"),
          nw("Sêvek", "Bir elma", "🍎"),
          nw("Hespek", "Bir at", "🐴"),
          nw("Mirovek", "Bir adam", "👤"),
          mp(
            { ku: "Pirtûkek", tr: "Bir kitap" },
            { ku: "Sêvek", tr: "Bir elma" },
            { ku: "Hespek", tr: "Bir at" },
            { ku: "Mirovek", tr: "Bir adam" },
          ),
          ex(tt("Bir köpeğim var.", "Min kûçikek heye.",
                ["pisîkek", "ne", "tu"]),
             "'Min ... heye' = sahip olma yapısı. Kûçik+ek = bir köpek."),
        ]),
        L("u15e-l2", "Lesson 2", "Bir kaç ... (-in)", 14, [
          tip("🔢", "Çoğul belirsiz: -in",
              "Birkaç X için: isim + in\n" +
              "Sêvin = (birkaç) elmalar\n" +
              "Hevalin = (birkaç) arkadaşlar\n" +
              "Belirli çoğul için ezafe -ên kullanılır.",
              { ku: "Min sêvin kirîn.", tr: "Birkaç elma aldım." }),
          nw("Sêvin", "Elmalar (birkaç)", "🍎"),
          nw("Pirtûkin", "Kitaplar (birkaç)", "📚"),
          nw("Hevalin", "Arkadaşlar (birkaç)", "👥"),
          mp(
            { ku: "Sêvin", tr: "Birkaç elma" },
            { ku: "Pirtûkin", tr: "Birkaç kitap" },
            { ku: "Hevalin", tr: "Birkaç arkadaş" },
            { ku: "Sêv", tr: "Elma (genel)" },
          ),
          tt("Birkaç kitabım var.", "Min pirtûkin hene.",
             ["pirtûkek", "ne", "tu"]),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 15f: Imperative (Emir kipi) — Thackston §17
    // ─────────────────────────────────────────────────────
    {
      id: "u15f", no: 15.95, title: "Emir Kipi", subtitle: "Were! Bixwe! · komutlar",
      emoji: "📣", color: "#D84315", track: "all",
      objectives: ["bi- + present-stem", "Tekil/çoğul emir", "Olumsuz emir (ne-)"],
      lessons: [
        L("u15f-l1", "Lesson 1", "Bi- öneki + emir", 14, [
          tip("📣", "Emir kipi (Imperative)",
              "Yapısı: bi- + present-stem (+ -e tekil / -in çoğul)\n" +
              "Were! = Gel! (sing.)\n" +
              "Werin! = Gelin! (pl.)\n" +
              "Bixwe! = Ye!  Bixwin! = Yiyin!\n" +
              "Bibêje! = Söyle!  Bibêjin! = Söyleyin!",
              { ku: "Were vir! Bixwe sêvê!", tr: "Buraya gel! Elmayı ye!" }),
          nw("Were!", "Gel! (sen)", "👋"),
          nw("Werin!", "Gelin! (siz)", "👋"),
          nw("Bixwe!", "Ye!", "🍴"),
          nw("Bibêje!", "Söyle!", "🗣️"),
          nw("Biçe!", "Git!", "🚶"),
          mp(
            { ku: "Were!", tr: "Gel! (sen)" },
            { ku: "Bixwe!", tr: "Ye!" },
            { ku: "Bibêje!", tr: "Söyle!" },
            { ku: "Biçe!", tr: "Git!" },
          ),
          ex(fb(["", " sêvê ji bo min."], ["Bixwe", "Were", "Biçe", "Bibêje"],
                "Benim için elmayı ye."),
             "Bixwe = Ye! (imperative, bi- + xwe-)"),
          ta("Were vir!", ["Were", "vir!"], "Buraya gel!"),
        ]),
        L("u15f-l2", "Lesson 2", "Olumsuz emir (Neke!)", 14, [
          tip("🚫", "Olumsuz emir: ne-",
              "Olumsuz emirde 'bi-' yerine 'ne-' gelir:\n" +
              "Neke! = Yapma!\n" +
              "Neçe! = Gitme!\n" +
              "Nexwe! = Yeme!",
              { ku: "Wê neke! Pirtûkê neke ji destê xwe.", tr: "Yapma! Kitabı elinden bırakma." }),
          nw("Neke!", "Yapma!", "🚫"),
          nw("Neçe!", "Gitme!", "🚷"),
          nw("Nexwe!", "Yeme!", "❌"),
          mp(
            { ku: "Neke!", tr: "Yapma!" },
            { ku: "Neçe!", tr: "Gitme!" },
            { ku: "Nexwe!", tr: "Yeme!" },
            { ku: "Bibêje!", tr: "Söyle!" },
          ),
          tt("Bunu söyleme!", "Vê tiştê nebêje!",
             ["bibêje", "biçe", "neke"]),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 15g: Modal Verbs (xwestin, karîn) — Thackston §16.2-16.3
    // ─────────────────────────────────────────────────────
    {
      id: "u15g", no: 15.97, title: "İstemek / Yapabilmek", subtitle: "Modal fiiller + subjunctive",
      emoji: "🙏", color: "#5E35B1", track: "all",
      objectives: ["xwestin (istemek)", "karîn (yapabilmek)", "Modal + subjunctive yapısı"],
      lessons: [
        L("u15g-l1", "Lesson 1", "Xwestin (istemek)", 14, [
          tip("🙏", "Xwestin + subjunctive",
              "İstemek için: dixwazim/î/e (present) + bi-fiil (subjunctive)\n" +
              "Ez dixwazim biçim = Gitmek istiyorum\n" +
              "Tu dixwazî bixwî = Yemek istiyorsun\n" +
              "Subjunctive (bi- + present-stem) zorunlu!",
              { ku: "Ez dixwazim Kurmancî hîn bibim.", tr: "Kürtçe öğrenmek istiyorum." }),
          nw("Dixwazim", "İstiyorum", "🙏"),
          nw("Dixwazî", "İstiyorsun", "🙏"),
          nw("Dixwaze", "İstiyor", "🙏"),
          nw("Bixwim", "yiyeyim (subj.)", "🍴"),
          mp(
            { ku: "Dixwazim", tr: "İstiyorum" },
            { ku: "Dixwazî", tr: "İstiyorsun" },
            { ku: "Dixwaze", tr: "İstiyor" },
            { ku: "Dixwazin", tr: "İstiyoruz/iz/ler" },
          ),
          ex(fb(["Ez dixwazim ", " sêvê."], ["bixwim", "dixwim", "xwarim", "ne"],
                "Elmayı yemek istiyorum."),
             "Modal 'dixwazim' SONRASI subjunctive: bi-xwim. Asla 'dixwim' değil!"),
          tt("Su içmek istiyorum.", "Ez dixwazim av vexwim.",
             ["dixwim", "ne", "tu"]),
        ]),
        L("u15g-l2", "Lesson 2", "Karîn (yapabilmek)", 14, [
          tip("💪", "Karîn + subjunctive",
              "Yapabilmek için: dikarim/î/e + bi-fiil (subjunctive)\n" +
              "Ez dikarim bibêjim = Söyleyebilirim\n" +
              "Tu dikarî biçî = Gidebilirsin\n" +
              "Olumsuz: Ez nikarim ... = Yapamam",
              { ku: "Ez dikarim bi Kurmancî biaxivim.", tr: "Kurmancî konuşabilirim." }),
          nw("Dikarim", "Yapabilirim", "💪"),
          nw("Dikarî", "Yapabilirsin", "💪"),
          nw("Dikare", "Yapabilir", "💪"),
          nw("Nikarim", "Yapamam", "🚫"),
          mp(
            { ku: "Dikarim", tr: "Yapabilirim" },
            { ku: "Dikarî", tr: "Yapabilirsin" },
            { ku: "Dikare", tr: "Yapabilir" },
            { ku: "Nikarim", tr: "Yapamam" },
          ),
          tt("Sana yardım edebilirim.",
             "Ez dikarim alîkariya te bikim.",
             ["nikarim", "ne", "dixwazim"]),
          ex(fb(["Ez ", " bibêjim."], ["dikarim", "nikarim", "diçim", "naxwim"],
                "Söyleyebilirim."),
             "'Dikarim' + subjunctive 'bibêjim' = söyleyebilirim."),
        ]),
        L("u15g-l3", "Lesson 3", "Lazım/gerek (divê + subj.)", 14, [
          tip("⚠️", "Divê / Gerek",
              "'Divê' = lazım/gerek. SONRA subjunctive gelir:\n" +
              "Divê ez biçim = Gitmem lazım\n" +
              "Divê tu biwerî = Gelmen lazım\n" +
              "Olumsuz: Divê ne-... veya nabe ku ...",
              { ku: "Divê em zû bigihîjin.", tr: "Çabuk varmamız lazım." }),
          nw("Divê", "Lazım / gerek", "⚠️"),
          nw("Divê biçim", "Gitmem lazım", "🚶"),
          nw("Lazim", "Lazım", "📋"),
          mp(
            { ku: "Divê biçim", tr: "Gitmem lazım" },
            { ku: "Divê biwerî", tr: "Gelmen lazım" },
            { ku: "Divê bibêjim", tr: "Söylemem lazım" },
            { ku: "Divê neçe", tr: "Gitmemesi lazım" },
          ),
          tt("Erken yatmam lazım.",
             "Divê ez zû razim.",
             ["dixwazim", "dikarim", "ne"]),
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
          tip("📜", "Geçmiş zaman ergatiflik",
              "Kürtçede geçmiş zamanın özel bir kuralı var: GEÇİŞSİZ fiillerde\n" +
              "(çûn=gitmek, hatin=gelmek) öznesi normaldir: 'Ez çûm' = Ben gittim.\n" +
              "Ama GEÇİŞLİ fiillerde (xwarin=yemek, dîtin=görmek) özne 'oblique' olur:\n" +
              "'Min nan xwar' = 'Ben ekmek yedim' (Ez yerine Min!)",
              { ku: "Ez çûm. Min nan xwar.", tr: "Ben gittim. Ben ekmek yedim." }),
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
          story("Köyde Bir Sabah", [
            { speaker: "narrator", ku: "Li gundekî biçûk, sibê zû.", tr: "Küçük bir köyde, sabah erkenden." },
            { speaker: "narrator", ku: "Roj derket. Mirîşkan şiyar bûn.", tr: "Güneş doğdu. Tavuklar uyandı." },
            { speaker: "A", ku: "Dayê, ez birçî me!", tr: "Anne, açım!" },
            { speaker: "B", ku: "Were, ez ji te re nan û şîr bidim.", tr: "Gel, sana ekmek ve süt vereyim." },
            { speaker: "narrator", ku: "Zarok kêfxweş bû.", tr: "Çocuk mutlu oldu." },
          ]),
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
    // ─────────────────────────────────────────────────────
    // UNIT 19b: Eğitim ve Okul (yeni B1 ünite)
    // ─────────────────────────────────────────────────────
    {
      id: "u19b", no: 19.5, title: "Eğitim", subtitle: "Perwerde · okul, ders, sınav",
      emoji: "🎓", color: "#1976D2", track: "all",
      objectives: ["Okul kelimeleri", "Ders takvimi", "Sınav ifadeleri"],
      lessons: [
        L("u19b-l1", "Lesson 1", "Okul kelimeleri", 14, [
          nw("Dibistan", "Okul", "🏫"),
          nw("Mamoste", "Öğretmen", "👨‍🏫"),
          nw("Xwendekar", "Öğrenci", "👨‍🎓"),
          nw("Ders", "Ders", "📚"),
          nw("Pirtûk", "Kitap", "📖"),
          mp(
            { ku: "Dibistan", tr: "Okul" },
            { ku: "Mamoste", tr: "Öğretmen" },
            { ku: "Xwendekar", tr: "Öğrenci" },
            { ku: "Ders", tr: "Ders" },
          ),
          tt("Öğrenci kitap okuyor.", "Xwendekar pirtûk dixwîne.", ["mamoste", "ne"]),
        ]),
        L("u19b-l2", "Lesson 2", "Sınav günü", 14, [
          nw("Tafîr", "Sınav", "📝"),
          nw("Bersiv", "Cevap", "💭"),
          nw("Pirs", "Soru", "❓"),
          nw("Not", "Not", "💯"),
          mp(
            { ku: "Tafîr", tr: "Sınav" },
            { ku: "Bersiv", tr: "Cevap" },
            { ku: "Pirs", tr: "Soru" },
            { ku: "Not", tr: "Not" },
          ),
          ex(tt("Sınavda iyi yaptım.", "Min di tafîrê de baş kir.", ["nexweş", "kar"]),
             "Geçişli geçmiş 'Min ... kir' yapısı + 'di tafîrê de' lokatif."),
        ]),
        L("u19b-l3", "Lesson 3", "Mektup ve yazma", 14, [
          tip("✍️", "Yazma fiili (nivîsîn)",
              "Nivîsîn = yazmak (geçişli).\n" +
              "Min name nivîsî = Mektup yazdım (ergative geçmiş).\n" +
              "Ez name dinivîsim = Mektup yazıyorum (present).",
              { ku: "Min name ji hevalê xwe re nivîsî.", tr: "Arkadaşıma mektup yazdım." }),
          nw("Nivîsîn", "Yazmak", "✍️"),
          nw("Name", "Mektup", "✉️"),
          nw("Dinivîsim", "Yazıyorum", "🖊️"),
          mp(
            { ku: "Nivîsîn", tr: "Yazmak" },
            { ku: "Name", tr: "Mektup" },
            { ku: "Pirtûk", tr: "Kitap" },
            { ku: "Pênûs", tr: "Kalem" },
          ),
          tt("Bir mektup yazdım.", "Min nameyek nivîsî.", ["pirtûk", "dinivîsim"]),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 19c: Teknoloji ve İletişim (yeni B1 ünite)
    // ─────────────────────────────────────────────────────
    {
      id: "u19c", no: 19.7, title: "Teknoloji", subtitle: "Teknolojî · telefon, internet",
      emoji: "📱", color: "#FF6F00", track: "adult",
      objectives: ["Telefon, mesaj", "İnternet, sosyal medya", "Uygulamalar"],
      lessons: [
        L("u19c-l1", "Lesson 1", "Telefon ve mesaj", 14, [
          nw("Telefon", "Telefon", "📞"),
          nw("Peyam", "Mesaj", "💬"),
          nw("Bang", "Çağrı / arama", "📲"),
          nw("Bigerîne", "Ara (telefonla)", "☎️"),
          mp(
            { ku: "Telefon", tr: "Telefon" },
            { ku: "Peyam", tr: "Mesaj" },
            { ku: "Bang", tr: "Çağrı" },
            { ku: "Bigerîne", tr: "Ara" },
          ),
          tt("Sana mesaj gönderdim.", "Min ji te re peyam şand.",
             ["bang", "ne", "kirîn"]),
        ]),
        L("u19c-l2", "Lesson 2", "İnternet", 14, [
          nw("Înternet", "İnternet", "🌐"),
          nw("Malper", "Web sitesi", "🔗"),
          nw("Bername", "Uygulama", "📱"),
          nw("Têketin", "Giriş yap", "🔐"),
          mp(
            { ku: "Înternet", tr: "İnternet" },
            { ku: "Malper", tr: "Web sitesi" },
            { ku: "Bername", tr: "Uygulama" },
            { ku: "Têketin", tr: "Giriş" },
          ),
          ex(tt("İnternet üzerinde Kürtçe öğreniyorum.",
                "Ez li ser înternetê Kurmancî hîn dibim.",
                ["dixwim", "kar"]),
             "'Li ser' = üzerinde, 'hîn dibim' = öğreniyorum (kontinüatif)."),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 19d: Reflexive (xwe) — Thackston §7.1
    // ─────────────────────────────────────────────────────
    {
      id: "u19d", no: 19.8, title: "Kendi (xwe)", subtitle: "Dönüşlü zamir",
      emoji: "🪞", color: "#00838F", track: "all",
      objectives: ["Xwe — kendisi", "İyelik (mala xwe)", "Dönüşlü fiil"],
      lessons: [
        L("u19d-l1", "Lesson 1", "Xwe — dönüşlü zamir", 14, [
          tip("🪞", "Xwe = kendi/kendisi",
              "Tüm şahıslar için DEĞİŞMEZ: Ez xwe dibînim = Kendimi görüyorum\n" +
              "Tu xwe dibînî = Kendini görüyorsun\n" +
              "Ew xwe dibîne = Kendisini görüyor\n" +
              "İyelik için 'xwe' = öznenin kendisi: Ez mala xwe difiroşim = Evimi (kendimin) satıyorum",
              { ku: "Ez navê xwe dibêjim.", tr: "Adımı (kendi adımı) söylüyorum." }),
          nw("Xwe", "Kendi/-mi/-ni", "🪞"),
          nw("Mala xwe", "Kendi evim/n", "🏠"),
          nw("Navê xwe", "Kendi adım/n", "🪪"),
          mp(
            { ku: "Xwe", tr: "Kendi" },
            { ku: "Mala xwe", tr: "Kendi evi" },
            { ku: "Navê xwe", tr: "Kendi adı" },
            { ku: "Hevalê xwe", tr: "Kendi arkadaşı" },
          ),
          ex(fb(["Ez navê ", " dibêjim."], ["xwe", "min", "te", "wî"],
                "Adımı söylüyorum."),
             "Özne 'ez' (ben) ise, 'kendi adım' için 'xwe' kullanılır, 'min' değil."),
        ]),
        L("u19d-l2", "Lesson 2", "Xwe vs min/te/wî", 16, [
          tip("⚖️", "Xwe vs min/te/wî farkı",
              "ÖZNE = SAHİP olduğunda → xwe\n" +
              "Ez mala xwe difiroşim = Kendi evimi satıyorum\n\n" +
              "ÖZNE ≠ SAHİP → min/te/wî\n" +
              "Ez mala te difiroşim = Senin evini satıyorum (xwe DEĞİL)",
              { ku: "Ew dîya xwe hez dike.", tr: "(Kendisi) annesini seviyor." }),
          mp(
            { ku: "Hevalê xwe", tr: "Kendi arkadaşı" },
            { ku: "Hevalê min", tr: "Benim arkadaşım" },
            { ku: "Hevalê te", tr: "Senin arkadaşın" },
            { ku: "Hevalê wî", tr: "Onun (eril) arkadaşı" },
          ),
          ex(tt("Annesini görüyor.",
                "Ew dîya xwe dibîne.",
                ["te", "min", "wî"]),
             "Özne 'ew' = sahip de aynı kişi → xwe kullan."),
          tt("Onun annesini görüyorum.",
             "Ez dîya wê dibînim.",
             ["xwe", "min", "te"]),
        ]),
      ],
    },
  ],
};

// =====================================================================
//  SECTION 4 — B2 ÜST-ORTA (SERWERÎ)
//
//  CEFR B2: karmaşık metinleri anlayabilir, akıcı konuşur, görüş bildirir.
//  Bu bölüm A1-B1'de OLMAYAN gramerler ve konular içerir:
//    • Gelecek zaman (dê + present) — "Ez ê biçim" = Gideceğim
//    • Şart kipi (eger ... bûya / heke ... bibe) — "Eğer gelirse"
//    • Karşılaştırma (ji ... mezintir) — "Ondan büyük"
//    • Subjunctive (bila + present) — "İçeri girsin"
//    • Edilgen yapı (...hat kirin) — "yapıldı"
//    • Bağlaç (ku, ji ber ku, eger) — karmaşık cümleler
//    • Atasözleri (gotinên pêşiyan)
//    • Kültür (Newroz, edebiyat, müzik)
// =====================================================================

const SECTION_B2: DuoSection = {
  id: "s4",
  cefr: "B2",
  title: "Üst-Orta",
  subtitle: "B2 · Serwerî",
  units: [
    // ─────────────────────────────────────────────────────
    // UNIT 20: Demên Bê (Future Tense)
    // ─────────────────────────────────────────────────────
    {
      id: "u20", no: 20, title: "Gelecek Zaman", subtitle: "Demên bê · ne yapacaksın?",
      emoji: "⏭️", color: "#7B1FA2", track: "adult",
      objectives: ["dê + fiil yapısı", "yarın/sonra için planlar", "Olumsuz gelecek"],
      lessons: [
        L("u20-l1", "Lesson 1", "dê + fiil = gelecek", 16, [
          tip("⏭️", "Gelecek zaman: dê + ê",
              "Kürtçede gelecek zaman 'dê' yardımcı kelimesiyle yapılır:\n" +
              "Ez ê biçim = Gideceğim\n" +
              "Tu yê biçî = Gideceksin\n" +
              "Ew dê biçe = Gidecek\n" +
              "Şahıs ekleri zamir + ê / dê + present-stem + şahıs.",
              { ku: "Sibe ez ê herim bajar.", tr: "Yarın şehre gideceğim." }),
          nw("Ez ê biçim", "Gideceğim", "✈️"),
          nw("Tu yê bixwî", "Yiyeceksin", "🍴"),
          nw("Ew dê bê", "Gelecek", "🚶"),
          nw("Em ê bibînin", "Göreceğiz", "👀"),
          mp(
            { ku: "Ez ê biçim", tr: "Gideceğim" },
            { ku: "Tu yê bixwî", tr: "Yiyeceksin" },
            { ku: "Ew dê bê", tr: "Gelecek" },
            { ku: "Em ê bibînin", tr: "Göreceğiz" },
          ),
          ex(fb(["Sibe ez ", " herim mektebê."], ["ê", "im", "dê", "yê"], "Yarın okula gideceğim."),
             "'Ez' (ben) ile birlikte 'ê' kullanılır. 'Tu' ile 'yê', 'ew' ile 'dê'."),
          tt("Yarın geleceğim.", "Sibe ez ê bêm.", ["dê", "yê", "biçim"]),
          ta("Em ê bixwin", ["Em", "ê", "bixwin"], "Yiyeceğiz"),
        ]),
        L("u20-l2", "Lesson 2", "Plan yapmak", 16, [
          nw("Plan", "Plan", "📋"),
          nw("Sibe", "Yarın", "📅"),
          nw("Hefteya tê", "Önümüzdeki hafta", "📆"),
          nw("Salê tê", "Önümüzdeki yıl", "🗓️"),
          mp(
            { ku: "Sibe", tr: "Yarın" },
            { ku: "Hefteya tê", tr: "Önümüzdeki hafta" },
            { ku: "Salê tê", tr: "Önümüzdeki yıl" },
            { ku: "Niha", tr: "Şimdi" },
          ),
          tt("Önümüzdeki hafta tatile gideceğim.", "Hefteya tê ez ê herim betlaneyê.",
             ["niha", "duh", "îro"]),
          ex(fb(["Salê tê em ", " bigihîjin Stenbolê."], ["ê", "yê", "bûn", "in"],
                "Önümüzdeki yıl İstanbul'a varacağız."),
             "Plural 'em' (biz) ile gelecek için 'em ê' kullanılır."),
          ta("Sibe ez ê bixebitim", ["Sibe", "ez", "ê", "bixebitim"], "Yarın çalışacağım"),
        ]),
        L("u20-l3", "Lesson 3", "Olumsuz gelecek", 16, [
          tip("❌", "Olumsuz gelecek",
              "Gelecekte olumsuzluk için 'na' kullanılır, 'ne' değil!\n" +
              "Ez ê neçim = Gitmeyeceğim\n" +
              "Tu yê nehêjî = Sevmeyeceksin",
              { ku: "Sibe ez ê neçim mektebê.", tr: "Yarın okula gitmeyeceğim." }),
          nw("Neçim", "Gitmeyeceğim", "🚫"),
          nw("Naxwim", "Yemeyeceğim", "🚫"),
          nw("Nabêjim", "Söylemeyeceğim", "🚫"),
          mp(
            { ku: "Ez ê neçim", tr: "Gitmeyeceğim" },
            { ku: "Tu yê nexwî", tr: "Yemeyeceksin" },
            { ku: "Ew dê neyê", tr: "Gelmeyecek" },
            { ku: "Em ê nebînin", tr: "Görmeyeceğiz" },
          ),
          ex(tt("Yarın çalışmayacağım.", "Sibe ez ê nexebitim.", ["bixebitim", "ne", "yê"]),
             "Olumsuz fiilde 'ne-' öneki: ne+xebitim → nexebitim. 'Ez ê' bunun başına gelir."),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 21: Şertî (Conditional)
    // ─────────────────────────────────────────────────────
    {
      id: "u21", no: 21, title: "Şart Kipi", subtitle: "Eger ... bibe · Eğer olursa",
      emoji: "🔀", color: "#C2185B", track: "adult",
      objectives: ["eger / heke yapısı", "Gerçek şart", "Hayali şart (bûya)"],
      lessons: [
        L("u21-l1", "Lesson 1", "eger / heke", 16, [
          tip("🔀", "Şart kipi (real)",
              "'Eger' veya 'heke' = Eğer.\n" +
              "Eger baran bibare, ez nayêm = Eğer yağmur yağarsa, gelmem.\n" +
              "Şart cümlesinde subjunctive (bibare) + ana cümlede present/future.",
              { ku: "Eger tu werî, ez kêfxweş im.", tr: "Eğer gelirsen, mutlu olurum." }),
          nw("Eger", "Eğer", "🔀"),
          nw("Heke", "Eğer (alt)", "🔀"),
          nw("Bibare", "yağarsa", "🌧️"),
          nw("Werî", "gelirsen", "🚶"),
          mp(
            { ku: "Eger", tr: "Eğer" },
            { ku: "Heke", tr: "Eğer (alt)" },
            { ku: "Bibare", tr: "yağarsa" },
            { ku: "Werî", tr: "gelirsen" },
          ),
          tt("Eğer yağmur yağarsa, evde kalırım.",
             "Eger baran bibare, ez li mal dimînim.",
             ["werî", "neyêm", "naxwim"]),
        ]),
        L("u21-l2", "Lesson 2", "Hayali şart (bûya)", 18, [
          tip("💭", "Hayali şart (counterfactual)",
              "Olmamış/imkansız durum için 'bûya' kullanılır:\n" +
              "Eger ez paqij bûma, min biçûya. = Olsa idim, giderdim.\n" +
              "Past stem + suffix + bûya. Edebiyatta yaygın.",
              { ku: "Eger min wext hebûya, min biçûya.", tr: "Vaktim olsaydı, giderdim." }),
          nw("Bûya", "olsa idi", "💭"),
          nw("Min biçûya", "giderdim", "✈️"),
          nw("Min hebûya", "olsa idi", "🤲"),
          mp(
            { ku: "Eger min hebûya", tr: "Sahip olsaydım" },
            { ku: "Min biçûya", tr: "Giderdim" },
            { ku: "Min bidîta", tr: "Görseydim" },
            { ku: "Eger werî", tr: "Eğer gelirsen" },
          ),
          ex(tt("Eğer param olsaydı, sana yardım ederdim.",
                "Eger min pere hebûya, min ji te re alîkarî bikira.",
                ["werî", "bibe", "naxwim"]),
             "'bûya' ile 'bikira' birleşik kullanılır — past counterfactual yapısı."),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 22: Berhevdan (Karşılaştırma)
    // ─────────────────────────────────────────────────────
    {
      id: "u22", no: 22, title: "Karşılaştırma", subtitle: "Ji ... mezintir · daha büyük",
      emoji: "📊", color: "#0288D1", track: "all",
      objectives: ["...tir karşılaştırma eki", "ji prepositionu", "Üstünlük (herî)"],
      lessons: [
        L("u22-l1", "Lesson 1", "Daha büyük / küçük", 14, [
          tip("📊", "Karşılaştırma eki -tir",
              "Sıfat + tir = daha [sıfat]:\n" +
              "mezin (büyük) → mezintir (daha büyük)\n" +
              "biçûk → biçûktir (daha küçük)\n" +
              "Karşılaştırma için 'ji' edatı kullanılır.",
              { ku: "Bavê min ji min mezintir e.", tr: "Babam benden büyüktür." }),
          nw("Mezintir", "Daha büyük", "📈"),
          nw("Biçûktir", "Daha küçük", "📉"),
          nw("Bilindtir", "Daha yüksek", "🔺"),
          nw("Nizmtir", "Daha alçak", "🔻"),
          mp(
            { ku: "Mezintir", tr: "Daha büyük" },
            { ku: "Biçûktir", tr: "Daha küçük" },
            { ku: "Bilindtir", tr: "Daha yüksek" },
            { ku: "Nizmtir", tr: "Daha alçak" },
          ),
          tt("Çocuk anneden küçüktür.", "Zarok ji dayikê biçûktir e.",
             ["mezintir", "ne", "ji ber ku"]),
        ]),
        L("u22-l2", "Lesson 2", "En üstünlük (herî)", 14, [
          tip("🏆", "Üstünlük: herî",
              "'Herî' = en. Sıfattan ÖNCE gelir:\n" +
              "herî mezin = en büyük\n" +
              "herî biçûk = en küçük\n" +
              "herî baş = en iyi",
              { ku: "Çiyayê herî bilind li Kurdistanê.", tr: "Kürdistan'ın en yüksek dağı." }),
          nw("Herî", "En", "🏆"),
          nw("Herî mezin", "En büyük", "🥇"),
          nw("Herî baş", "En iyi", "⭐"),
          nw("Herî kevn", "En eski", "📜"),
          mp(
            { ku: "Herî mezin", tr: "En büyük" },
            { ku: "Herî baş", tr: "En iyi" },
            { ku: "Herî kevn", tr: "En eski" },
            { ku: "Herî biçûk", tr: "En küçük" },
          ),
          ex(tt("Bu evdeki en büyük oda.", "Odeya herî mezin a vê malê.",
                ["mezintir", "biçûk", "ji"]),
             "'Herî mezin' ifadesi sıfattan önce, ezafe (-a) ile bağlanır."),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 23: Çand û Edebiyat (Kültür ve Edebiyat)
    // ─────────────────────────────────────────────────────
    {
      id: "u23", no: 23, title: "Kültür", subtitle: "Çand · Newroz, müzik, edebiyat",
      emoji: "🎭", color: "#388E3C", track: "all",
      objectives: ["Newroz bayramı", "Klasik şair: Ahmedê Xanî", "Müzik: Şivan Perwer"],
      lessons: [
        L("u23-l1", "Lesson 1", "Newroz bayramı", 16, [
          tip("🔥", "Newroz nedir?",
              "21 Mart Kürtler, İranlılar ve Orta Asya halklarının yeni yıl bayramı.\n" +
              "Mitoloji: Demirci Kawa, zalim kral Dehak'ı yendi.\n" +
              "Ateş yakılır, danslar (govend) edilir.",
              { ku: "Newroz pîroz be!", tr: "Newroz kutlu olsun!" }),
          nw("Newroz", "Newroz", "🔥"),
          nw("Pîroz", "Kutlu", "🎉"),
          nw("Govend", "Halay", "💃"),
          nw("Kawa", "Kawa (efsane)", "⚒️"),
          mp(
            { ku: "Newroz", tr: "Yeni gün/yıl" },
            { ku: "Pîroz", tr: "Kutlu" },
            { ku: "Govend", tr: "Halay" },
            { ku: "Agir", tr: "Ateş" },
          ),
          tt("Newroz baharın ilk günüdür.",
             "Newroz roja yekem a biharê ye.",
             ["zivistanê", "havînê"]),
          ta("Newroz pîroz be", ["Newroz", "pîroz", "be"], "Newroz kutlu olsun"),
        ]),
        L("u23-l2", "Lesson 2", "Müzik (Mûzîk)", 14, [
          nw("Mûzîk", "Müzik", "🎵"),
          nw("Stran", "Şarkı", "🎤"),
          nw("Stranbêj", "Şarkıcı", "👨‍🎤"),
          nw("Tembûr", "Tembûr (saz)", "🎸"),
          mp(
            { ku: "Mûzîk", tr: "Müzik" },
            { ku: "Stran", tr: "Şarkı" },
            { ku: "Stranbêj", tr: "Şarkıcı" },
            { ku: "Tembûr", tr: "Tembûr" },
          ),
          tt("Şivan Perwer ünlü bir Kürt şarkıcıdır.",
             "Şivan Perwer stranbêjekî navdar ê Kurd e.",
             ["mamoste", "bijîşk"]),
        ]),
        L("u23-l3", "Lesson 3", "Edebiyat (Wêje)", 16, [
          tip("📚", "Klasik Kürt edebiyatı",
              "Ahmedê Xanî (1651-1707) — 'Mem û Zîn' destanının yazarı.\n" +
              "Cizîrî (1567-1640) — sufi şair, 'Dîwan' eseri.\n" +
              "Bu eserler hâlâ Kürt edebiyatının temel taşlarıdır.",
              { ku: "Mem û Zîn berhema herî navdar a Xanî ye.", tr: "Mem û Zîn, Xanî'nin en ünlü eseri." }),
          nw("Wêje", "Edebiyat", "📚"),
          nw("Helbest", "Şiir", "📜"),
          nw("Pirtûk", "Kitap", "📖"),
          nw("Nivîskar", "Yazar", "✍️"),
          mp(
            { ku: "Wêje", tr: "Edebiyat" },
            { ku: "Helbest", tr: "Şiir" },
            { ku: "Pirtûk", tr: "Kitap" },
            { ku: "Nivîskar", tr: "Yazar" },
          ),
        ]),
      ],
    },
    // ─────────────────────────────────────────────────────
    // UNIT 24: Gotinên Pêşiyan (Atasözleri)
    // ─────────────────────────────────────────────────────
    {
      id: "u24", no: 24, title: "Atasözleri", subtitle: "Gotinên pêşiyan · halk bilgeliği",
      emoji: "🦉", color: "#5D4037", track: "adult",
      objectives: ["10 yaygın atasözü", "Anlam ve kullanım", "Kültürel arka plan"],
      lessons: [
        L("u24-l1", "Lesson 1", "Aile ve dostluk", 16, [
          tip("🦉", "Atasözleri Kürtçe öğretmek için harika!",
              "Atasözleri (gotinên pêşiyan) kültürel bilgeliğin özüdür.\n" +
              "Hem dilbilgisi pratiği hem kültürel ipuçları içerir.",
              { ku: "Gotinên pêşiyan kanîya zanînê ne.", tr: "Atasözleri bilginin pınarıdır." }),
          nw("Heval", "Arkadaş", "🤝"),
          nw("Mal", "Aile/ev", "🏠"),
          nw("Birîn", "Yara", "🩹"),
          mp(
            { ku: "Hevalê baş ji birayî zêdetir e", tr: "İyi arkadaş kardeşten daha iyidir" },
            { ku: "Mal mala mêr e", tr: "Ev erkeğin evidir" },
            { ku: "Zar zimanî dilî ye", tr: "Çocuk kalbin dilidir" },
            { ku: "Birîna ziman çênabe", tr: "Dilin yarası kapanmaz" },
          ),
        ]),
        L("u24-l2", "Lesson 2", "Hayat dersleri", 16, [
          mp(
            { ku: "Av jiyan e", tr: "Su hayattır" },
            { ku: "Sebr şîfa ye", tr: "Sabır şifadır" },
            { ku: "Pir bigotin kêm bibe", tr: "Çok söyleyen az olur" },
            { ku: "Wext zêr e", tr: "Vakit altındır" },
          ),
          tt("Vakit altın değerindedir.", "Wext zêr e.", ["av", "jiyan", "sebir"]),
          ex(fb(["Sebr ", " ye."], ["şîfa", "wext", "av", "mal"], "Sabır şifadır."),
             "Bu klasik bir Kürt atasözüdür: 'Sabır şifadır.'"),
        ]),
      ],
    },
  ],
};

// =====================================================================
//  TÜM SECTIONS
// =====================================================================

export const DUO_SECTIONS: DuoSection[] = [SECTION_A1, SECTION_A2, SECTION_B1, SECTION_B2];

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

/**
 * Fisher-Yates karıştırma — V8'de küçük dizilerde Math.random comparator
 * sürekli aynı sıralamayı döndürüyordu (Timsort + insertion sort optimization
 * yüzünden). Bu doğru rastgele dağılım verir.
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Match-pairs için: kimlik permütasyonunu (her eleman aynı yerde) önler.
 * 4 elemanlı dizi için %4 ihtimal aynı kalabiliyor — bu garantiler farklılığı.
 */
export function shuffleNotIdentity<T>(arr: T[]): T[] {
  if (arr.length <= 1) return [...arr];
  let result: T[];
  let attempts = 0;
  do {
    result = shuffle(arr);
    attempts++;
  } while (result.every((item, i) => item === arr[i]) && attempts < 10);
  return result;
}
