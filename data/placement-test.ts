/**
 * YERLEŞTİRME SINAVI (Placement Test)
 *
 * Yetişkinler için seviye belirleme — Duolingo'nun "Test out" sistemine benzer.
 * 12 soru, kademeli zorluk:
 *   • Q1-3   → A1 başlangıç (selamlaşma, sayılar, temel zamir)
 *   • Q4-6   → A1 ileri (aile, renk, ben/sen olmak)
 *   • Q7-9   → A2 (yiyecek, ev, possessive, basit cümle)
 *   • Q10-12 → B1 (geçmiş zaman, gramer, karmaşık cümle)
 *
 * Skor → Önerilen başlangıç:
 *   0-3   → A1 sıfırdan (hiçbir ders atlanmaz)
 *   4-6   → A1'in son ünitelerinden başla (ilk 4 ünite "tamam" işaretlenir)
 *   7-9   → A2'den başla (A1'in tamamı işaretlenir, 8 ünite ~34 ders)
 *   10-12 → B1'den başla (A1+A2 tamamı, 15 ünite ~64 ders)
 */

export type PtChoice = { kuOrTr: string; correct: boolean };

export type PtQuestion = {
  id: string;
  /** Hangi seviye sorusu (zorluk takibi) */
  level: "A1" | "A2" | "B1";
  /** Soru tipi: tr→ku veya ku→tr */
  prompt: string;
  promptLang: "tr" | "ku";
  /** 4 seçenek, biri doğru */
  choices: PtChoice[];
  /** İsteğe bağlı kısa açıklama (yanlış cevap sonrası gösterilir) */
  hint?: string;
};

export const PLACEMENT_TEST: PtQuestion[] = [
  // === A1 Başlangıç ===
  {
    id: "p1", level: "A1",
    promptLang: "tr", prompt: "Merhaba (Kürtçe)?",
    choices: [
      { kuOrTr: "Silav",   correct: true },
      { kuOrTr: "Spas",    correct: false },
      { kuOrTr: "Roj baş", correct: false },
      { kuOrTr: "Bav",     correct: false },
    ],
    hint: "'Silav' = Merhaba",
  },
  {
    id: "p2", level: "A1",
    promptLang: "ku", prompt: "Spas",
    choices: [
      { kuOrTr: "Teşekkür ederim", correct: true },
      { kuOrTr: "Merhaba",          correct: false },
      { kuOrTr: "Hoşça kal",        correct: false },
      { kuOrTr: "Ben",              correct: false },
    ],
  },
  {
    id: "p3", level: "A1",
    promptLang: "tr", prompt: "Beş (Kürtçe)?",
    choices: [
      { kuOrTr: "Pênc", correct: true },
      { kuOrTr: "Sê",   correct: false },
      { kuOrTr: "Heft", correct: false },
      { kuOrTr: "Du",   correct: false },
    ],
  },

  // === A1 İleri ===
  {
    id: "p4", level: "A1",
    promptLang: "ku", prompt: "Ez baş im.",
    choices: [
      { kuOrTr: "Ben iyiyim.",     correct: true },
      { kuOrTr: "Sen iyisin.",     correct: false },
      { kuOrTr: "O iyidir.",       correct: false },
      { kuOrTr: "Biz iyiyiz.",     correct: false },
    ],
    hint: "'im' eki 'ben' anlamına gelir",
  },
  {
    id: "p5", level: "A1",
    promptLang: "tr", prompt: "Annem (Kürtçe)?",
    choices: [
      { kuOrTr: "Dayika min", correct: true },
      { kuOrTr: "Bavê min",   correct: false },
      { kuOrTr: "Birayê min", correct: false },
      { kuOrTr: "Xwişka min", correct: false },
    ],
  },
  {
    id: "p6", level: "A1",
    promptLang: "ku", prompt: "Sêv sor e.",
    choices: [
      { kuOrTr: "Elma kırmızıdır.",  correct: true },
      { kuOrTr: "Su mavidir.",       correct: false },
      { kuOrTr: "Ev büyüktür.",      correct: false },
      { kuOrTr: "Köpek küçüktür.",   correct: false },
    ],
  },

  // === A2 Temel ===
  {
    id: "p7", level: "A2",
    promptLang: "tr", prompt: "Ben su istiyorum (Kürtçe)?",
    choices: [
      { kuOrTr: "Ez av dixwazim.",       correct: true },
      { kuOrTr: "Ez av vexwim.",         correct: false },
      { kuOrTr: "Ez nan dixwim.",        correct: false },
      { kuOrTr: "Ew av dixwaze.",        correct: false },
    ],
    hint: "'dixwazim' = istiyorum (ez ile birlikte)",
  },
  {
    id: "p8", level: "A2",
    promptLang: "ku", prompt: "Mala min mezin e.",
    choices: [
      { kuOrTr: "Evim büyük.",       correct: true },
      { kuOrTr: "Evim küçük.",       correct: false },
      { kuOrTr: "Ailem büyük.",      correct: false },
      { kuOrTr: "Köpeğim büyük.",    correct: false },
    ],
  },
  {
    id: "p9", level: "A2",
    promptLang: "tr", prompt: "Bugün hava sıcak (Kürtçe)?",
    choices: [
      { kuOrTr: "Îro hewa germ e.",  correct: true },
      { kuOrTr: "Duh hewa sar bû.",  correct: false },
      { kuOrTr: "Sibe hewa baş e.",  correct: false },
      { kuOrTr: "Îro hewa sar e.",   correct: false },
    ],
  },

  // === B1 Orta ===
  {
    id: "p10", level: "B1",
    promptLang: "ku", prompt: "Duh ez çûm bajar.",
    choices: [
      { kuOrTr: "Dün şehre gittim.",         correct: true },
      { kuOrTr: "Yarın şehre gideceğim.",   correct: false },
      { kuOrTr: "Bugün şehirdeyim.",         correct: false },
      { kuOrTr: "Sen dün geldin.",           correct: false },
    ],
    hint: "'çûm' = gittim (geçmiş zaman -m eki)",
  },
  {
    id: "p11", level: "B1",
    promptLang: "tr", prompt: "Hangisi geçmiş zamanda?",
    choices: [
      { kuOrTr: "Min got",     correct: true },
      { kuOrTr: "Ez dibêjim",  correct: false },
      { kuOrTr: "Ew dibêje",   correct: false },
      { kuOrTr: "Em dibêjin",  correct: false },
    ],
    hint: "Geçmiş zamanda özne 'min/te/wî' (oblique) olur",
  },
  {
    id: "p12", level: "B1",
    promptLang: "tr", prompt: "Doktor hastanede çalışıyor (Kürtçe)?",
    choices: [
      { kuOrTr: "Bijîşk li nexweşxaneyê kar dike.", correct: true },
      { kuOrTr: "Mamoste li dibistanê kar dike.",   correct: false },
      { kuOrTr: "Bijîşk li mal e.",                  correct: false },
      { kuOrTr: "Bijîşk nexweş e.",                  correct: false },
    ],
  },
];

/**
 * Skoru CEFR seviyesine ve hangi derslerin "tamam" işaretleneceğine çevirir.
 *
 * Skip stratejisi:
 *   • Hiç soru yanlışsa (12/12) → A1+A2'nin tamamını "tamam" işaretle, B1'den başla
 *   • Çok iyi (10-11) → A1+A2 işaretle, B1
 *   • İyi (7-9)       → A1 işaretle, A2'den başla
 *   • Orta (4-6)      → A1'in ilk 4 ünitesini işaretle (Silav, Zamirler, Tanışma, Hejmar)
 *   • Az (0-3)        → Hiçbiri işaretlenmez, sıfırdan başla
 */
export type PlacementResult = {
  score: number;
  total: number;
  cefr: "A1" | "A2" | "B1";
  startMessage: string;
  startMessageEn: string;
  startMessageKu: string;
  /** Otomatik tamamlanmış işaretlenecek lesson ID prefix'leri (örn ["u1-", "u2-"]) */
  prefilledLessonPrefixes: string[];
};

export function computePlacement(score: number, total: number): PlacementResult {
  if (score >= 10) {
    return {
      score, total,
      cefr: "B1",
      startMessage: "Mükemmel! B1 (Orta) seviyeden başlayabilirsin.",
      startMessageEn: "Excellent! You can start from B1 (Intermediate).",
      startMessageKu: "Bêkêmasî! Tu dikarî ji asta B1 dest pê bikî.",
      prefilledLessonPrefixes: [
        "u1-", "u2-", "u3-", "u4-", "u5-", "u6-", "u7-", "u8-",  // tüm A1
        "u9-", "u10-", "u11-", "u12-", "u13-", "u14-", "u15-",   // tüm A2
      ],
    };
  }
  if (score >= 7) {
    return {
      score, total,
      cefr: "A2",
      startMessage: "İyi gidiyorsun. A2 (Temel) seviyeden devam et.",
      startMessageEn: "Nice work. You can continue from A2 (Elementary).",
      startMessageKu: "Baş diçî. Tu dikarî ji asta A2 berdewam bikî.",
      prefilledLessonPrefixes: [
        "u1-", "u2-", "u3-", "u4-", "u5-", "u6-", "u7-", "u8-",  // tüm A1
      ],
    };
  }
  if (score >= 4) {
    return {
      score, total,
      cefr: "A1",
      startMessage: "Temellerin var. A1'in ortasından başlayalım.",
      startMessageEn: "You have the basics. Let's start from middle of A1.",
      startMessageKu: "Bingehên te hene. Em ji nava A1 dest pê bikin.",
      prefilledLessonPrefixes: ["u1-", "u2-", "u3-", "u4-"],  // ilk 4 ünite
    };
  }
  return {
    score, total,
    cefr: "A1",
    startMessage: "Sıfırdan güzel bir yolculuk başlıyor!",
    startMessageEn: "Starting fresh from the beginning!",
    startMessageKu: "Ji destpêkê rêwîtiyek xweş dest pê dike!",
    prefilledLessonPrefixes: [],
  };
}

/**
 * Lesson ID'leri prefix listesine göre uygun olanlara filtre uygular.
 * Prefix'ler "u1-", "u2-" gibi → "u1-l1", "u1-l2" eşleşir.
 */
export function lessonsToMarkComplete(prefixes: string[], allLessonIds: string[]): string[] {
  if (prefixes.length === 0) return [];
  return allLessonIds.filter((id) => prefixes.some((p) => id.startsWith(p)));
}
