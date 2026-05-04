/**
 * YERLEŞTİRME SINAVI (Placement Test) — yeniden tasarım v2
 *
 * Açık kaynak araştırma:
 *   • CEFR vocabulary thresholds (Milton & Alexiou, 2009):
 *       A1: <1500 kelime · A2: 1500-2500 · B1: 2750-3250 · B2: 3250-3750
 *   • Kurmanji course structures (kurdishlessons.com, languagecanvas.com)
 *   • A1 typical topics (esl-lounge.com): family, numbers, food, body, time
 *   • B2 progression: subjunctive, conditional, comparison, idioms
 *
 * 12 soru, 4 seviyede 3'er soru:
 *   • Q1-3   → A1 (selamlaşma, sayı, basit zamir)
 *   • Q4-6   → A2 (possessive, present-tense fiil, basit cümle)
 *   • Q7-9   → B1 (geçmiş zaman, ergative, daha kompleks cümle)
 *   • Q10-12 → B2 (gelecek zaman, şart kipi, karşılaştırma, atasözü)
 *
 * Skor → CEFR seviyesi:
 *   0-2   → A1 sıfırdan başla (hiçbir ders işaretlenmez)
 *   3-5   → A1 ileri (ilk 4 ünite işaretlenir)
 *   6-8   → A2 (tüm A1 işaretlenir)
 *   9-10  → B1 (tüm A1+A2 işaretlenir)
 *   11-12 → B2 (tüm A1+A2+B1 işaretlenir)
 */

export type PtChoice = { kuOrTr: string; correct: boolean };

export type PtQuestion = {
  id: string;
  level: "A1" | "A2" | "B1" | "B2";
  prompt: string;
  promptLang: "tr" | "ku";
  choices: PtChoice[];
  hint?: string;
};

export const PLACEMENT_TEST: PtQuestion[] = [
  // === A1 Başlangıç (3 soru) ===
  {
    id: "p1", level: "A1",
    promptLang: "tr", prompt: "Merhaba (Kürtçe)?",
    choices: [
      { kuOrTr: "Silav",   correct: true },
      { kuOrTr: "Spas",    correct: false },
      { kuOrTr: "Roj baş", correct: false },
      { kuOrTr: "Bav",     correct: false },
    ],
    hint: "'Silav' = Merhaba, 'Spas' = Teşekkür, 'Roj baş' = Günaydın",
  },
  {
    id: "p2", level: "A1",
    promptLang: "ku", prompt: "Pênc",
    choices: [
      { kuOrTr: "Beş",   correct: true },
      { kuOrTr: "Üç",    correct: false },
      { kuOrTr: "Yedi",  correct: false },
      { kuOrTr: "İki",   correct: false },
    ],
  },
  {
    id: "p3", level: "A1",
    promptLang: "tr", prompt: "Ben (Kürtçe)?",
    choices: [
      { kuOrTr: "Ez",  correct: true },
      { kuOrTr: "Tu",  correct: false },
      { kuOrTr: "Ew",  correct: false },
      { kuOrTr: "Em",  correct: false },
    ],
    hint: "Ez=Ben, Tu=Sen, Ew=O, Em=Biz",
  },

  // === A2 Temel (3 soru) — possessive, fiil çekimi ===
  {
    id: "p4", level: "A2",
    promptLang: "tr", prompt: "Annem (Kürtçe)?",
    choices: [
      { kuOrTr: "Dayika min", correct: true },
      { kuOrTr: "Bavê min",   correct: false },
      { kuOrTr: "Dayik",      correct: false },
      { kuOrTr: "Min dayik",  correct: false },
    ],
    hint: "Dişil isimde sahiplik için '-a min' eki: dayik+a min = annem",
  },
  {
    id: "p5", level: "A2",
    promptLang: "ku", prompt: "Ez nan dixwim.",
    choices: [
      { kuOrTr: "Ben ekmek yiyorum.", correct: true },
      { kuOrTr: "Sen ekmek yiyorsun.", correct: false },
      { kuOrTr: "Ben su içiyorum.",   correct: false },
      { kuOrTr: "O ekmek yiyor.",     correct: false },
    ],
    hint: "'dixwim' = (ben) yiyorum (Ez ile birlikte)",
  },
  {
    id: "p6", level: "A2",
    promptLang: "tr", prompt: "Bugün hava sıcak (Kürtçe)?",
    choices: [
      { kuOrTr: "Îro hewa germ e.",  correct: true },
      { kuOrTr: "Duh hewa sar bû.",  correct: false },
      { kuOrTr: "Sibe hewa baş e.",  correct: false },
      { kuOrTr: "Îro hewa sar e.",   correct: false },
    ],
  },

  // === B1 Orta (3 soru) — geçmiş zaman, ergative, kompleks ===
  {
    id: "p7", level: "B1",
    promptLang: "ku", prompt: "Duh ez çûm bajar.",
    choices: [
      { kuOrTr: "Dün şehre gittim.",         correct: true },
      { kuOrTr: "Yarın şehre gideceğim.",   correct: false },
      { kuOrTr: "Bugün şehirdeyim.",         correct: false },
      { kuOrTr: "Sen dün geldin.",           correct: false },
    ],
    hint: "'çûm' = gittim (geçmiş zaman -m eki), 'duh' = dün",
  },
  {
    id: "p8", level: "B1",
    promptLang: "tr", prompt: "Ergative (geçişli) past tense'de hangisi doğru?",
    choices: [
      { kuOrTr: "Min nan xwar = Ben ekmek yedim",     correct: true },
      { kuOrTr: "Ez nan xwarim = Ben ekmek yedim",    correct: false },
      { kuOrTr: "Nan ez xwar = Ben ekmek yedim",      correct: false },
      { kuOrTr: "Ez nan dixwim = Ben ekmek yedim",    correct: false },
    ],
    hint: "Geçişli fiilde geçmiş zamanda özne 'oblique' (Min) olur, fiil çekimsiz kalır.",
  },
  {
    id: "p9", level: "B1",
    promptLang: "tr", prompt: "Doktor hastanede çalışıyor (Kürtçe)?",
    choices: [
      { kuOrTr: "Bijîşk li nexweşxaneyê kar dike.", correct: true },
      { kuOrTr: "Mamoste li dibistanê kar dike.",   correct: false },
      { kuOrTr: "Bijîşk li mal e.",                  correct: false },
      { kuOrTr: "Bijîşk nexweş e.",                  correct: false },
    ],
  },

  // === B2 Üst-Orta (3 soru) — gelecek zaman, şart, karşılaştırma, atasözü ===
  {
    id: "p10", level: "B2",
    promptLang: "tr", prompt: "Yarın geleceğim (Kürtçe)?",
    choices: [
      { kuOrTr: "Sibe ez ê bêm.",        correct: true },
      { kuOrTr: "Sibe ez hatim.",        correct: false },
      { kuOrTr: "Duh ez ê bêm.",         correct: false },
      { kuOrTr: "Sibe ez têm.",          correct: false },
    ],
    hint: "Gelecek zaman: 'Ez ê' + present-stem. 'bêm' = geleyim (subjunctive)",
  },
  {
    id: "p11", level: "B2",
    promptLang: "ku", prompt: "Eger baran bibare, ez nayêm.",
    choices: [
      { kuOrTr: "Eğer yağmur yağarsa, gelmem.",     correct: true },
      { kuOrTr: "Yağmur yağdı, gelmedim.",          correct: false },
      { kuOrTr: "Yağmur yağarsa geleceğim.",        correct: false },
      { kuOrTr: "Eğer ben yağmurda kalsam.",        correct: false },
    ],
    hint: "'Eger' = Eğer, 'bibare' = yağarsa (subjunctive), 'nayêm' = gelmem",
  },
  {
    id: "p12", level: "B2",
    promptLang: "tr", prompt: "'Wext zêr e' atasözünün anlamı?",
    choices: [
      { kuOrTr: "Vakit altındır.",        correct: true },
      { kuOrTr: "Su hayattır.",           correct: false },
      { kuOrTr: "Sabır şifadır.",         correct: false },
      { kuOrTr: "İyi arkadaş kardeşten iyidir.", correct: false },
    ],
    hint: "'Wext' = vakit, 'zêr' = altın. Klasik bir Kürt atasözüdür.",
  },
];

// =====================================================================
//  SKORLAMA: 4 seviyeye dağılım
// =====================================================================

export type PlacementResult = {
  score: number;
  total: number;
  cefr: "A1" | "A2" | "B1" | "B2";
  startMessage: string;
  startMessageEn: string;
  startMessageKu: string;
  prefilledLessonPrefixes: string[];
};

export function computePlacement(score: number, total: number): PlacementResult {
  // 11-12 → B2
  if (score >= 11) {
    return {
      score, total,
      cefr: "B2",
      startMessage: "Etkileyici! B2 (Üst-Orta) seviyeden başlayabilirsin.",
      startMessageEn: "Impressive! You can start from B2 (Upper-Intermediate).",
      startMessageKu: "Karekî baş! Tu dikarî ji asta B2 dest pê bikî.",
      prefilledLessonPrefixes: [
        // tüm A1 (8 ünite)
        "u1-", "u2-", "u3-", "u4-", "u5-", "u6-", "u7-", "u8-",
        // tüm A2 (7 ünite)
        "u9-", "u10-", "u11-", "u12-", "u13-", "u14-", "u15-",
        // tüm B1 (4 ünite)
        "u16-", "u17-", "u18-", "u19-",
      ],
    };
  }
  // 9-10 → B1
  if (score >= 9) {
    return {
      score, total,
      cefr: "B1",
      startMessage: "Mükemmel! B1 (Orta) seviyeden başlayabilirsin.",
      startMessageEn: "Excellent! You can start from B1 (Intermediate).",
      startMessageKu: "Bêkêmasî! Tu dikarî ji asta B1 dest pê bikî.",
      prefilledLessonPrefixes: [
        "u1-", "u2-", "u3-", "u4-", "u5-", "u6-", "u7-", "u8-",
        "u9-", "u10-", "u11-", "u12-", "u13-", "u14-", "u15-",
      ],
    };
  }
  // 6-8 → A2
  if (score >= 6) {
    return {
      score, total,
      cefr: "A2",
      startMessage: "İyi gidiyorsun. A2 (Temel) seviyeden devam et.",
      startMessageEn: "Nice work. You can continue from A2 (Elementary).",
      startMessageKu: "Baş diçî. Tu dikarî ji asta A2 berdewam bikî.",
      prefilledLessonPrefixes: [
        "u1-", "u2-", "u3-", "u4-", "u5-", "u6-", "u7-", "u8-",
      ],
    };
  }
  // 3-5 → A1 ileri
  if (score >= 3) {
    return {
      score, total,
      cefr: "A1",
      startMessage: "Temellerin var. A1'in ortasından başlayalım.",
      startMessageEn: "You have the basics. Let's start from middle of A1.",
      startMessageKu: "Bingehên te hene. Em ji nava A1 dest pê bikin.",
      prefilledLessonPrefixes: ["u1-", "u2-", "u3-", "u4-"],
    };
  }
  // 0-2 → A1 sıfırdan
  return {
    score, total,
    cefr: "A1",
    startMessage: "Sıfırdan güzel bir yolculuk başlıyor!",
    startMessageEn: "Starting fresh from the beginning!",
    startMessageKu: "Ji destpêkê rêwîtiyek xweş dest pê dike!",
    prefilledLessonPrefixes: [],
  };
}

export function lessonsToMarkComplete(prefixes: string[], allLessonIds: string[]): string[] {
  if (prefixes.length === 0) return [];
  return allLessonIds.filter((id) => prefixes.some((p) => id.startsWith(p)));
}
