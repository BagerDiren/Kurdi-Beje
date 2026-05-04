/**
 * Uygulama UI dili. Sadece 3 seçenek:
 *   • Türkçe (tr)  — varsayılan
 *   • İngilizce (en)
 *   • Kürtçe / Kurmancî (ku)
 *
 * Öğrenilen dil her durumda Kurmancî'dir.
 * UI dili çeviriler için de kullanılır (ders kelimeleri TR↔EN).
 */

export type LangCode = "ku" | "tr" | "en";

export const LANGS: { code: LangCode; name: string; nativeName: string; flag: string; color: string }[] = [
  { code: "tr", name: "Türkçe",   nativeName: "Türkçe",   flag: "🇹🇷", color: "#E53935" },
  { code: "en", name: "English",  nativeName: "English",  flag: "🇬🇧", color: "#1565C0" },
  { code: "ku", name: "Kurmancî", nativeName: "Kurmancî", flag: "🟢", color: "#4CAF50" },
];
