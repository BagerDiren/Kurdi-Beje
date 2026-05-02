/**
 * KurdîBêje marka kimliği — Duolingo'dan ayrışan özgün palette.
 *
 * İlham: Mezopotamya'nın sıcak toprakları, Kürt dağları, Newroz ateşi,
 * sarı güneş motifi. Sıcak ve insan odaklı.
 *
 * Üç temel marka rengi:
 *  • mountain  — derin orman/dağ yeşili (ana eylem rengi)
 *  • sun       — sıcak turuncu/sarı güneş (ödüller, vurgular)
 *  • sumac     — koyu kırmızı (uyarı, sınırlı kullanım)
 *
 * Toprak tonları:
 *  • soil      — toprak rengi (kart kenarları)
 *  • cream     — ana arka plan (yumuşak krem)
 *  • dawn      — şafak rengi (sub-arka planlar)
 */

export const BRAND = {
  // === ANA RENKLER ===
  mountain: "#1F6B41",        // dağ yeşili
  mountainDark: "#0F4D2C",
  mountainLight: "#3FA371",
  mountainSoft: "#D4F0DD",

  sun: "#F39C12",             // güneş turuncusu
  sunDark: "#D87B0A",
  sunLight: "#FFB740",
  sunSoft: "#FFEDB8",

  sumac: "#C0392B",           // sumak kırmızısı
  sumacDark: "#962419",
  sumacSoft: "#FFE4DD",

  // === TOPRAK & DOĞA ===
  soil: "#8B6F47",
  soilLight: "#C9B68F",
  cream: "#FFFAF0",           // ana bg
  dawn: "#FFF4DC",
  dusk: "#3D3528",

  // === METİN ===
  ink: "#1A1A1A",             // en koyu metin
  graphite: "#3A3A3A",
  charcoal: "#5A5A5A",
  smoke: "#8A8A8A",
  mist: "#C0C0C0",
  silver: "#E0E0E0",
  paper: "#FFFFFF",

  // === SEMANTIC ===
  success: "#2E8B57",
  warning: "#F39C12",
  danger: "#C0392B",
  info: "#5DADE2",

  // === GRADYENT TANIMLARI ===
  heroGrad: ["#0F4D2C", "#1F6B41", "#3FA371"] as const,    // splash hero
  sunsetGrad: ["#F39C12", "#E67E22", "#C0392B"] as const,  // newroz/celebration
  dawnGrad: ["#FFF4DC", "#FFEDB8", "#FFFAF0"] as const,    // welcome bg
  mountainGrad: ["#3FA371", "#1F6B41"] as const,           // adult headers
};

export const BRAND_FONTS = {
  // Hierarchy weights tutarlılık için
  display: { fontWeight: "900" as const, letterSpacing: -1 },
  title:   { fontWeight: "800" as const, letterSpacing: -0.3 },
  heading: { fontWeight: "700" as const, letterSpacing: 0 },
  body:    { fontWeight: "500" as const, letterSpacing: 0.1 },
  caption: { fontWeight: "600" as const, letterSpacing: 0.5 },
};

export const SHADOWS = {
  sm: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  md: { shadowColor: "#000", shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  lg: { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
};
