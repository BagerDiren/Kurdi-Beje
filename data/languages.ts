export type LangCode = "ku" | "tr" | "en" | "ar" | "fa" | "fr" | "sv" | "ru";

export const LANGS: { code: LangCode; name: string; color: string; rtl?: boolean }[] = [
  { code: "ku", name: "Kurmancî", color: "#4CAF50" },
  { code: "tr", name: "Türkçe", color: "#E53935" },
  { code: "en", name: "English", color: "#1565C0" },
  { code: "ar", name: "العربية", color: "#2E7D32", rtl: true },
  { code: "fa", name: "فارسی", color: "#6A1B9A", rtl: true },
  { code: "fr", name: "Français", color: "#0D47A1" },
  { code: "sv", name: "Svenska", color: "#F9A825" },
  { code: "ru", name: "Русский", color: "#37474F" },
];
