/** Çocuk teması — sıcak, renkli, büyük font/emoji */
export const CHILD_THEME = {
  bg: "#FFFBF2", bgDark: "#FCF0D9", card: "#FFFFFF", cardAlt: "#FFF8E7",
  primary: "#2E7D5C", primaryLight: "#43A57A", primaryDark: "#1F5A40",
  accent: "#F5B82E", accentSoft: "#FFD46B",
  text: "#2C1810", textMid: "#5C4033", textLight: "#9B8770",
  correct: "#4CAF50", wrong: "#E74C3C",
  headerGrad: ["#2E7D5C", "#1F5A40"] as const,
  gameGrad: ["#FFE9A8", "#FFD46B"] as const,
  goalGrad: ["#E8F5E9", "#C8E6C9"] as const,
  cardBorder: "#F5E6C8", shadow: "rgba(45,90,61,0.08)", shadowSoft: "rgba(0,0,0,0.04)",
  radius: 18, radiusLg: 22, radiusXl: 28,
  kevoSize: 80, fontSize: 16, emojiSize: 52,
};

/** Yetişkin teması — koyu, profesyonel, kompakt */
export const ADULT_THEME = {
  bg: "#0F2A1B", bgDark: "#1A3D2A", card: "#1E4D32", cardAlt: "#23583A",
  primary: "#6FCF7C", primaryLight: "#8EE89A", primaryDark: "#4CAF50",
  accent: "#E8B931", accentSoft: "#F5D76E",
  text: "#E8F5E9", textMid: "#A5D6A7", textLight: "#66996B",
  correct: "#81C784", wrong: "#EF5350",
  headerGrad: ["#1B5E30", "#0F3D1E"] as const,
  gameGrad: ["#1B5E30", "#0F3D1E"] as const,
  goalGrad: ["#1E4D32", "#0F3D1E"] as const,
  cardBorder: "#2E7D46", shadow: "rgba(0,0,0,0.35)", shadowSoft: "rgba(0,0,0,0.2)",
  radius: 16, radiusLg: 20, radiusXl: 24,
  kevoSize: 65, fontSize: 15, emojiSize: 40,
};

export type AppTheme = typeof CHILD_THEME;
