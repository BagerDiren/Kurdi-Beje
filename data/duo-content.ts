/**
 * DUO CONTENT — Duolingo'nun ders yapısının Kürtçe (Kurmancî) versiyonu.
 *
 * Hiyerarşi:
 *   Section (CEFR seviyesi: A1, A2, B1)
 *     └── Unit (tema: selamlaşma, aile, yiyecek...)
 *           └── Lesson (5-15 lesson per unit)
 *                 └── Exercise (5-12 egzersiz per lesson, 5 farklı tip)
 *
 * Egzersiz tipleri:
 *   • new-word     → Yeni kelime tanıtımı (büyük emoji + ses)
 *   • translate    → KU↔TR çeviri (kelime havuzu kullan)
 *   • tap-audio    → Ses dinle, kelimeleri sırala
 *   • match-pairs  → 4 KU + 4 TR çiftle
 *   • select-image → KU kelime, 4 emoji'den seç
 *   • fill-blank   → Cümlede boşluk doldur
 */

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
  | { type: "tap-audio"; audioKu: string; words: string[] /* doğru sıra */; trHint?: string }
  | { type: "match-pairs"; pairs: { ku: string; tr: string }[] }
  | { type: "select-image"; ku: string; tr: string; options: { ku: string; tr: string; emoji: string }[]; correctIdx: number }
  | { type: "fill-blank"; sentenceParts: [string, string]; options: string[]; correctIdx: number; trHint: string };

export type DuoLesson = {
  id: string;
  title: string;       // "Lesson 1"
  subTitle?: string;   // "merhaba, teşekkürler"
  exercises: Exercise[];
  xp: number;
};

export type DuoUnit = {
  id: string;
  no: number;
  title: string;       // "Selamlaşma"
  subtitle: string;    // "Form basic greetings"
  emoji: string;
  color: string;       // unit theme color (Duo green / blue / purple / etc.)
  lessons: DuoLesson[];
};

export type DuoSection = {
  id: string;
  cefr: "A1" | "A2" | "B1";
  title: string;       // "Section 1"
  subtitle: string;    // "Beginner — A1"
  units: DuoUnit[];
};

// =====================================================================
//  YARDIMCI: KELİME HAVUZU (üretim için sık kullanılan)
// =====================================================================

const W = (ku: string, tr: string, emoji = "") => ({ ku, tr, emoji });

// =====================================================================
//  SECTION 1 — A1 BAŞLANGIÇ
// =====================================================================

export const DUO_SECTIONS: DuoSection[] = [
  {
    id: "s1",
    cefr: "A1",
    title: "Section 1",
    subtitle: "Başlangıç (Destpêk) — A1",
    units: [
      // -------- UNIT 1: Selamlaşma --------
      {
        id: "u1",
        no: 1,
        title: "Selamlaşma",
        subtitle: "Form basic greetings",
        emoji: "👋",
        color: "#58CC02",
        lessons: [
          {
            id: "u1-l1",
            title: "Lesson 1",
            subTitle: "Merhaba, teşekkürler",
            xp: 10,
            exercises: [
              { type: "new-word", ku: "Silav", tr: "Merhaba", emoji: "👋", sample: { ku: "Silav, ez Leyla me.", tr: "Merhaba, ben Leyla'yım." } },
              { type: "select-image", ku: "Silav", tr: "Merhaba", options: [
                { ku: "Silav", tr: "Merhaba", emoji: "👋" },
                { ku: "Mal",   tr: "Ev",      emoji: "🏠" },
                { ku: "Av",    tr: "Su",      emoji: "💧" },
                { ku: "Sêv",   tr: "Elma",    emoji: "🍎" },
              ], correctIdx: 0 },
              { type: "new-word", ku: "Spas", tr: "Teşekkür ederim", emoji: "🙏", sample: { ku: "Spas dikim.", tr: "Teşekkür ederim." } },
              { type: "select-image", ku: "Spas", tr: "Teşekkür", options: [
                { ku: "Spas", tr: "Teşekkür",  emoji: "🙏" },
                { ku: "Çay",  tr: "Çay",        emoji: "🍵" },
                { ku: "Roj",  tr: "Güneş",      emoji: "☀️" },
                { ku: "Kûçik",tr: "Köpek",      emoji: "🐶" },
              ], correctIdx: 0 },
              { type: "match-pairs", pairs: [
                { ku: "Silav", tr: "Merhaba" },
                { ku: "Spas",  tr: "Teşekkür" },
                { ku: "Erê",   tr: "Evet" },
                { ku: "Na",    tr: "Hayır" },
              ]},
              { type: "tap-audio", audioKu: "Silav", words: ["Silav", "spas", "erê", "na"], trHint: "Merhaba" },
            ],
          },
          {
            id: "u1-l2",
            title: "Lesson 2",
            subTitle: "Günaydın, iyi geceler",
            xp: 10,
            exercises: [
              { type: "new-word", ku: "Roj baş", tr: "Günaydın", emoji: "🌅", sample: { ku: "Roj baş, çawa yî?", tr: "Günaydın, nasılsın?" } },
              { type: "new-word", ku: "Şev baş", tr: "İyi geceler", emoji: "🌙" },
              { type: "select-image", ku: "Roj baş", tr: "Günaydın", options: [
                { ku: "Roj baş", tr: "Günaydın",     emoji: "🌅" },
                { ku: "Şev baş", tr: "İyi geceler",  emoji: "🌙" },
                { ku: "Av",      tr: "Su",            emoji: "💧" },
                { ku: "Mal",     tr: "Ev",            emoji: "🏠" },
              ], correctIdx: 0 },
              { type: "match-pairs", pairs: [
                { ku: "Roj baş", tr: "Günaydın" },
                { ku: "Şev baş", tr: "İyi geceler" },
                { ku: "Spas",    tr: "Teşekkür" },
                { ku: "Silav",   tr: "Merhaba" },
              ]},
              { type: "translate-ku-tr", sentenceKu: "Roj baş", sentenceTr: "Günaydın", words: ["Günaydın", "İyi geceler", "Merhaba", "Teşekkür"] },
              { type: "tap-audio", audioKu: "Şev baş", words: ["Şev", "baş"], trHint: "İyi geceler" },
            ],
          },
          {
            id: "u1-l3",
            title: "Lesson 3",
            subTitle: "Nasılsın? İyiyim!",
            xp: 12,
            exercises: [
              { type: "new-word", ku: "Çawa yî?", tr: "Nasılsın?", emoji: "😊" },
              { type: "new-word", ku: "Baş im", tr: "İyiyim", emoji: "👍", sample: { ku: "Spas, ez baş im.", tr: "Teşekkürler, iyiyim." } },
              { type: "match-pairs", pairs: [
                { ku: "Çawa yî?", tr: "Nasılsın?" },
                { ku: "Baş im",   tr: "İyiyim" },
                { ku: "Spas",     tr: "Teşekkür" },
                { ku: "Erê",      tr: "Evet" },
              ]},
              { type: "fill-blank", sentenceParts: ["Spas, ez ", " im."], options: ["baş", "mal", "sor", "çay"], correctIdx: 0, trHint: "Teşekkürler, iyiyim." },
              { type: "translate-tr-ku", sentenceTr: "Nasılsın?", sentenceKu: "Çawa yî?", words: ["Çawa", "yî?", "baş", "im"] },
              { type: "tap-audio", audioKu: "Ez baş im", words: ["Ez", "baş", "im"], trHint: "Ben iyiyim" },
            ],
          },
        ],
      },
      // -------- UNIT 2: Aile --------
      {
        id: "u2",
        no: 2,
        title: "Aile",
        subtitle: "Talk about family",
        emoji: "👨‍👩‍👧",
        color: "#CE82FF",
        lessons: [
          {
            id: "u2-l1",
            title: "Lesson 1",
            subTitle: "Anne, baba",
            xp: 12,
            exercises: [
              { type: "new-word", ku: "Dayik", tr: "Anne", emoji: "👩" },
              { type: "new-word", ku: "Bav",   tr: "Baba", emoji: "👨" },
              { type: "select-image", ku: "Dayik", tr: "Anne", options: [
                { ku: "Dayik", tr: "Anne", emoji: "👩" },
                { ku: "Bav",   tr: "Baba", emoji: "👨" },
                { ku: "Bira",  tr: "Erkek kardeş", emoji: "👦" },
                { ku: "Xwişk", tr: "Kız kardeş",   emoji: "👧" },
              ], correctIdx: 0 },
              { type: "match-pairs", pairs: [
                { ku: "Dayik", tr: "Anne" },
                { ku: "Bav",   tr: "Baba" },
                { ku: "Bira",  tr: "Erkek kardeş" },
                { ku: "Xwişk", tr: "Kız kardeş" },
              ]},
              { type: "translate-tr-ku", sentenceTr: "Bu benim annem.", sentenceKu: "Ev dayika min e.", words: ["Ev", "dayika", "min", "e", "bav"] },
              { type: "tap-audio", audioKu: "Bav", words: ["Bav"], trHint: "Baba" },
            ],
          },
          {
            id: "u2-l2",
            title: "Lesson 2",
            subTitle: "Kardeşler",
            xp: 12,
            exercises: [
              { type: "new-word", ku: "Bira",   tr: "Erkek kardeş", emoji: "👦" },
              { type: "new-word", ku: "Xwişk",  tr: "Kız kardeş",   emoji: "👧" },
              { type: "new-word", ku: "Heval",  tr: "Arkadaş",      emoji: "🤝" },
              { type: "match-pairs", pairs: [
                { ku: "Bira",  tr: "Erkek kardeş" },
                { ku: "Xwişk", tr: "Kız kardeş" },
                { ku: "Heval", tr: "Arkadaş" },
                { ku: "Mal",   tr: "Ev" },
              ]},
              { type: "fill-blank", sentenceParts: ["Ew ", " min e."], options: ["bira", "av", "sor", "deh"], correctIdx: 0, trHint: "O benim erkek kardeşim." },
              { type: "translate-ku-tr", sentenceKu: "Heval", sentenceTr: "Arkadaş", words: ["Arkadaş", "Anne", "Baba", "Kardeş"] },
            ],
          },
        ],
      },
      // -------- UNIT 3: Sayılar --------
      {
        id: "u3",
        no: 3,
        title: "Sayılar",
        subtitle: "Count from 1 to 10",
        emoji: "🔢",
        color: "#1CB0F6",
        lessons: [
          {
            id: "u3-l1",
            title: "Lesson 1",
            subTitle: "1, 2, 3",
            xp: 10,
            exercises: [
              { type: "new-word", ku: "Yek", tr: "Bir", emoji: "1️⃣" },
              { type: "new-word", ku: "Du",  tr: "İki", emoji: "2️⃣" },
              { type: "new-word", ku: "Sê",  tr: "Üç",  emoji: "3️⃣" },
              { type: "match-pairs", pairs: [
                { ku: "Yek", tr: "Bir" },
                { ku: "Du",  tr: "İki" },
                { ku: "Sê",  tr: "Üç" },
                { ku: "Çar", tr: "Dört" },
              ]},
              { type: "tap-audio", audioKu: "Du", words: ["Du"], trHint: "İki" },
              { type: "select-image", ku: "Sê", tr: "Üç", options: [
                { ku: "Sê",  tr: "Üç",  emoji: "3️⃣" },
                { ku: "Du",  tr: "İki", emoji: "2️⃣" },
                { ku: "Yek", tr: "Bir", emoji: "1️⃣" },
                { ku: "Pênc",tr: "Beş", emoji: "5️⃣" },
              ], correctIdx: 0 },
            ],
          },
          {
            id: "u3-l2",
            title: "Lesson 2",
            subTitle: "4, 5, 6",
            xp: 10,
            exercises: [
              { type: "new-word", ku: "Çar",  tr: "Dört", emoji: "4️⃣" },
              { type: "new-word", ku: "Pênc", tr: "Beş",  emoji: "5️⃣" },
              { type: "new-word", ku: "Şeş",  tr: "Altı", emoji: "6️⃣" },
              { type: "match-pairs", pairs: [
                { ku: "Çar",  tr: "Dört" },
                { ku: "Pênc", tr: "Beş" },
                { ku: "Şeş",  tr: "Altı" },
                { ku: "Heft", tr: "Yedi" },
              ]},
              { type: "tap-audio", audioKu: "Pênc", words: ["Pênc"], trHint: "Beş" },
              { type: "fill-blank", sentenceParts: ["Ez ", " salî me."], options: ["pênc", "mal", "sor", "spas"], correctIdx: 0, trHint: "Ben 5 yaşındayım." },
            ],
          },
          {
            id: "u3-l3",
            title: "Lesson 3",
            subTitle: "7, 8, 9, 10",
            xp: 12,
            exercises: [
              { type: "new-word", ku: "Heft", tr: "Yedi",  emoji: "7️⃣" },
              { type: "new-word", ku: "Heşt", tr: "Sekiz", emoji: "8️⃣" },
              { type: "new-word", ku: "Neh",  tr: "Dokuz", emoji: "9️⃣" },
              { type: "new-word", ku: "Deh",  tr: "On",    emoji: "🔟" },
              { type: "match-pairs", pairs: [
                { ku: "Heft", tr: "Yedi" },
                { ku: "Heşt", tr: "Sekiz" },
                { ku: "Neh",  tr: "Dokuz" },
                { ku: "Deh",  tr: "On" },
              ]},
              { type: "tap-audio", audioKu: "Deh", words: ["Deh"], trHint: "On" },
            ],
          },
        ],
      },
      // -------- UNIT 4: Renkler --------
      {
        id: "u4",
        no: 4,
        title: "Renkler",
        subtitle: "Identify colors",
        emoji: "🌈",
        color: "#FF9600",
        lessons: [
          {
            id: "u4-l1",
            title: "Lesson 1",
            subTitle: "Kırmızı, mavi, yeşil",
            xp: 10,
            exercises: [
              { type: "new-word", ku: "Sor",  tr: "Kırmızı", emoji: "🔴" },
              { type: "new-word", ku: "Şîn",  tr: "Mavi",    emoji: "🔵" },
              { type: "new-word", ku: "Kesk", tr: "Yeşil",   emoji: "🟢" },
              { type: "match-pairs", pairs: [
                { ku: "Sor",  tr: "Kırmızı" },
                { ku: "Şîn",  tr: "Mavi" },
                { ku: "Kesk", tr: "Yeşil" },
                { ku: "Zer",  tr: "Sarı" },
              ]},
              { type: "select-image", ku: "Sor", tr: "Kırmızı", options: [
                { ku: "Sor",  tr: "Kırmızı", emoji: "🔴" },
                { ku: "Şîn",  tr: "Mavi",    emoji: "🔵" },
                { ku: "Kesk", tr: "Yeşil",   emoji: "🟢" },
                { ku: "Zer",  tr: "Sarı",    emoji: "🟡" },
              ], correctIdx: 0 },
              { type: "translate-tr-ku", sentenceTr: "Bu mavi.", sentenceKu: "Ev şîn e.", words: ["Ev", "şîn", "e", "sor", "kesk"] },
            ],
          },
          {
            id: "u4-l2",
            title: "Lesson 2",
            subTitle: "Sarı, beyaz, siyah",
            xp: 10,
            exercises: [
              { type: "new-word", ku: "Zer", tr: "Sarı",   emoji: "🟡" },
              { type: "new-word", ku: "Spî", tr: "Beyaz",  emoji: "⬜" },
              { type: "new-word", ku: "Reş", tr: "Siyah",  emoji: "⬛" },
              { type: "match-pairs", pairs: [
                { ku: "Zer", tr: "Sarı" },
                { ku: "Spî", tr: "Beyaz" },
                { ku: "Reş", tr: "Siyah" },
                { ku: "Sor", tr: "Kırmızı" },
              ]},
              { type: "fill-blank", sentenceParts: ["Mehê ", " e."], options: ["spî", "deh", "bira", "av"], correctIdx: 0, trHint: "Ay beyazdır." },
              { type: "tap-audio", audioKu: "Reş", words: ["Reş"], trHint: "Siyah" },
            ],
          },
        ],
      },
    ],
  },
  // =====================================================================
  //  SECTION 2 — A2 TEMEL
  // =====================================================================
  {
    id: "s2",
    cefr: "A2",
    title: "Section 2",
    subtitle: "Temel (Bingehîn) — A2",
    units: [
      {
        id: "u5",
        no: 5,
        title: "Yiyecekler",
        subtitle: "Order food and drinks",
        emoji: "🍽️",
        color: "#FF4B4B",
        lessons: [
          {
            id: "u5-l1",
            title: "Lesson 1",
            subTitle: "Su, ekmek",
            xp: 12,
            exercises: [
              { type: "new-word", ku: "Av",   tr: "Su",    emoji: "💧" },
              { type: "new-word", ku: "Nan",  tr: "Ekmek", emoji: "🍞" },
              { type: "new-word", ku: "Çay",  tr: "Çay",   emoji: "🍵" },
              { type: "new-word", ku: "Şîr",  tr: "Süt",   emoji: "🥛" },
              { type: "match-pairs", pairs: [
                { ku: "Av",  tr: "Su" },
                { ku: "Nan", tr: "Ekmek" },
                { ku: "Çay", tr: "Çay" },
                { ku: "Şîr", tr: "Süt" },
              ]},
              { type: "translate-tr-ku", sentenceTr: "Ben su istiyorum.", sentenceKu: "Ez av dixwazim.", words: ["Ez", "av", "dixwazim", "nan", "çay"] },
              { type: "fill-blank", sentenceParts: ["Ez ", " dixwim."], options: ["nan", "sor", "deh", "spî"], correctIdx: 0, trHint: "Ben ekmek yiyorum." },
            ],
          },
          {
            id: "u5-l2",
            title: "Lesson 2",
            subTitle: "Meyveler",
            xp: 12,
            exercises: [
              { type: "new-word", ku: "Sêv",   tr: "Elma", emoji: "🍎" },
              { type: "new-word", ku: "Tirî",  tr: "Üzüm", emoji: "🍇" },
              { type: "new-word", ku: "Hinar", tr: "Nar",  emoji: "🍑" },
              { type: "match-pairs", pairs: [
                { ku: "Sêv",   tr: "Elma" },
                { ku: "Tirî",  tr: "Üzüm" },
                { ku: "Hinar", tr: "Nar" },
                { ku: "Av",    tr: "Su" },
              ]},
              { type: "select-image", ku: "Sêv", tr: "Elma", options: [
                { ku: "Sêv",   tr: "Elma", emoji: "🍎" },
                { ku: "Tirî",  tr: "Üzüm", emoji: "🍇" },
                { ku: "Hinar", tr: "Nar",  emoji: "🍑" },
                { ku: "Nan",   tr: "Ekmek", emoji: "🍞" },
              ], correctIdx: 0 },
              { type: "tap-audio", audioKu: "Ez sêv dixwim", words: ["Ez", "sêv", "dixwim"], trHint: "Ben elma yiyorum." },
            ],
          },
        ],
      },
      {
        id: "u6",
        no: 6,
        title: "Doğa",
        subtitle: "Describe nature",
        emoji: "🌿",
        color: "#58CC02",
        lessons: [
          {
            id: "u6-l1",
            title: "Lesson 1",
            subTitle: "Güneş, ay, dağ",
            xp: 12,
            exercises: [
              { type: "new-word", ku: "Roj",  tr: "Güneş", emoji: "☀️" },
              { type: "new-word", ku: "Meh",  tr: "Ay",    emoji: "🌙" },
              { type: "new-word", ku: "Çiya", tr: "Dağ",   emoji: "⛰️" },
              { type: "new-word", ku: "Çem",  tr: "Nehir", emoji: "🏞️" },
              { type: "match-pairs", pairs: [
                { ku: "Roj",  tr: "Güneş" },
                { ku: "Meh",  tr: "Ay" },
                { ku: "Çiya", tr: "Dağ" },
                { ku: "Çem",  tr: "Nehir" },
              ]},
              { type: "translate-tr-ku", sentenceTr: "Güneş güzeldir.", sentenceKu: "Roj xweş e.", words: ["Roj", "xweş", "e", "meh", "çiya"] },
            ],
          },
        ],
      },
    ],
  },
];

// =====================================================================
//  YARDIMCILAR
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

export const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
