/**
 * Kurmancî → Türkçe TTS fonetik dönüştürücü.
 *
 * Kürtçe için doğal TTS yok. Türkçe motoru kullanıyoruz ama bazı harfler
 * (î, û, ê, ç, ş, x, q, w) Türkçe okunmasında sorun çıkarır.
 *
 * Kuralları:
 *   • î → "ii"     (uzun i, "Pisîk" → "Pisiik")
 *   • û → "uu"     (uzun u, "Kûçik" → "Kuuçik")
 *   • ê → "ee"     (kapalı e, "Sêv" → "Seev", "Pênc" → "Peenç")
 *   • x → "h"      (gırtlaktan h gibi, "Xal" → "Hal")
 *   • q → "k"      (dilcikten k, "Qedeh" → "Kedeh")
 *   • w → "v"      (dudaksıl, "Welat" → "Velat")
 *   • c → "c"      (Türkçe ile aynı)
 *   • ç → "ç"      (aynı)
 *   • ş → "ş"      (aynı)
 *
 * Ayrıca cümle uzunluğunu yumuşatmak için pitch ve hız ayarları.
 */

export type SpeakStyle = "normal" | "slow" | "happy" | "sad" | "praise" | "kid" | "kidSlow";

export type SpeakOptions = {
  language: string;
  rate: number;
  pitch: number;
};

const PHONETIC_MAP: [RegExp, string][] = [
  [/î/g, "ii"],
  [/Î/g, "İi"],
  [/û/g, "uu"],
  [/Û/g, "Uu"],
  [/ê/g, "ee"],
  [/Ê/g, "Ee"],
  [/x/g, "h"],
  [/X/g, "H"],
  [/q/g, "k"],
  [/Q/g, "K"],
  [/w/g, "v"],
  [/W/g, "V"],
];

/**
 * Bir Kurmancî kelime/cümleyi Türkçe TTS için fonetik dönüşüme tabi tutar.
 */
export function toTurkishPhonetic(text: string): string {
  let out = text;
  for (const [regex, replacement] of PHONETIC_MAP) {
    out = out.replace(regex, replacement);
  }
  return out;
}

/**
 * Konuşma stiline göre TTS opsiyonları.
 */
export function speakOptionsForStyle(style: SpeakStyle = "normal"): SpeakOptions {
  switch (style) {
    case "slow":
      return { language: "tr-TR", rate: 0.65, pitch: 1.0 };
    case "happy":
      return { language: "tr-TR", rate: 1.0, pitch: 1.25 };
    case "praise":
      return { language: "tr-TR", rate: 0.95, pitch: 1.3 };
    case "sad":
      return { language: "tr-TR", rate: 0.75, pitch: 0.85 };
    case "kid":
      // Çocuk dostu: yüksek pitch (cıvıl cıvıl), normal hız
      return { language: "tr-TR", rate: 0.78, pitch: 1.55 };
    case "kidSlow":
      // Çocuk için öğretici: yüksek pitch, çok yavaş, tane tane
      return { language: "tr-TR", rate: 0.55, pitch: 1.5 };
    case "normal":
    default:
      return { language: "tr-TR", rate: 0.85, pitch: 1.05 };
  }
}

// === Kısa kutlama/feedback metinleri (Türkçe + Kürtçe) ===
export const PRAISE_LINES = [
  "Aferin!",
  "Süpersin!",
  "Harika iş!",
  "Çok güzel!",
  "Bravo!",
  "Mükemmel!",
];

export const ENCOURAGE_LINES = [
  "Tekrar dene!",
  "Olsun, devam et!",
  "Hadi bir daha!",
  "Yapabilirsin!",
];

export function randomPraise(): string {
  return PRAISE_LINES[Math.floor(Math.random() * PRAISE_LINES.length)];
}

export function randomEncourage(): string {
  return ENCOURAGE_LINES[Math.floor(Math.random() * ENCOURAGE_LINES.length)];
}
