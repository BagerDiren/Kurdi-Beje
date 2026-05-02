/**
 * KurdîBêje Çocuk Tasarım Dili
 *
 * Referans: Lingokids, Drops, Khan Academy Kids
 *
 * Felsefe:
 * - Yumuşak hatlar (24px+ radius)
 * - Yumuşak gölgeler (kategori rengi tabanlı renkli shadow)
 * - Doygun ama göz yormaz renkler
 * - Tek tipografi sistemi (sans, weight 600/800/900)
 * - Bol white space (cluttered DEĞİL, breathing DEĞİL)
 * - 8/12/16/24/32/40 spacing system
 *
 * Her ekran bu token'lara bağlı kalır.
 */

export const KIDS_THEME = {
  // === ANA RENK PALETİ ===
  // 6 doygun ama yumuşak renk, her kategori için bir adet
  primary: "#FF6B9D",       // pembe (ana brand)
  primaryDark: "#E91E63",
  primarySoft: "#FFE4F0",

  yellow: "#FFB740",
  yellowDark: "#FF9800",
  yellowSoft: "#FFF3E0",

  blue: "#4FC3F7",
  blueDark: "#0288D1",
  blueSoft: "#E1F5FE",

  green: "#66BB6A",
  greenDark: "#388E3C",
  greenSoft: "#E8F5E9",

  purple: "#AB47BC",
  purpleDark: "#7B1FA2",
  purpleSoft: "#F3E5F5",

  red: "#EF5350",
  redDark: "#C62828",
  redSoft: "#FFEBEE",

  // === ARKA PLAN ===
  bg: "#FFFAF5",        // çok hafif krem
  bgSoft: "#FFF5F8",    // pembeye dönük krem
  card: "#FFFFFF",
  overlay: "rgba(0,0,0,0.5)",

  // === METİN ===
  ink: "#2C1810",       // kahve-siyah, sıcak ton
  graphite: "#5C4033",  // alt metin
  smoke: "#8B7355",     // yardımcı metin
  silver: "#D7CCC8",    // ayraçlar, soluk
  paper: "#FFFFFF",

  // === SPECIAL ===
  star: "#FFC72C",      // yıldız altın
  heart: "#E91E63",     // kalp
  fire: "#FF5722",      // streak ateş
  success: "#4CAF50",
  danger: "#F44336",
};

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, huge: 40,
};

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

// Kategori rengi shadow renkli olur (renkli ışıltı efekti)
export const SHADOW = (color: string, intensity: "sm" | "md" | "lg" | "glow" = "md") => {
  switch (intensity) {
    case "sm":
      return {
        shadowColor: color,
        shadowOpacity: 0.18,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
      };
    case "md":
      return {
        shadowColor: color,
        shadowOpacity: 0.28,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      };
    case "lg":
      return {
        shadowColor: color,
        shadowOpacity: 0.40,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 10,
      };
    case "glow":
      return {
        shadowColor: color,
        shadowOpacity: 0.55,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 0 },
        elevation: 12,
      };
  }
};

/**
 * Lingokids/Drops tarzı premium tipografi.
 * Başlıklar Fredoka (yuvarlak, eğlenceli), gövde Nunito (okunabilir).
 */
const FONT_DISPLAY = "Fredoka_700Bold";
const FONT_HEADING = "Fredoka_600SemiBold";
const FONT_TITLE   = "Fredoka_500Medium";
const FONT_BODY    = "Nunito_700Bold";
const FONT_BODY_REG = "Nunito_400Regular";
const FONT_BODY_HEAVY = "Nunito_800ExtraBold";

export const TYPO = {
  hero:    { fontSize: 36, fontFamily: FONT_DISPLAY, letterSpacing: -1 },
  display: { fontSize: 28, fontFamily: FONT_DISPLAY, letterSpacing: -0.6 },
  h1:      { fontSize: 24, fontFamily: FONT_DISPLAY, letterSpacing: -0.3 },
  h2:      { fontSize: 20, fontFamily: FONT_HEADING, letterSpacing: -0.2 },
  h3:      { fontSize: 17, fontFamily: FONT_HEADING },
  body:    { fontSize: 14, fontFamily: FONT_BODY },
  bodyLg:  { fontSize: 15, fontFamily: FONT_BODY_HEAVY },
  bodyReg: { fontSize: 14, fontFamily: FONT_BODY_REG },
  caption: { fontSize: 11, fontFamily: FONT_BODY, letterSpacing: 0.5 },
  micro:   { fontSize: 9, fontFamily: FONT_BODY_HEAVY, letterSpacing: 1.5, textTransform: "uppercase" as const },
  // Buton tipografisi (büyük, kalın)
  button:  { fontSize: 16, fontFamily: FONT_DISPLAY, letterSpacing: 0.3 },
};
