/**
 * KurdîBêje Typography sistemi — tüm uygulamada tek kaynak.
 * Her ekran bu token'ları kullanır — hardcoded font size/weight yok.
 */

export const WEIGHT = {
  regular: "500" as const,
  medium: "600" as const,
  semibold: "700" as const,
  bold: "800" as const,
  black: "900" as const,
};

export const SIZE = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  h3: 28,
  h2: 34,
  h1: 42,
  hero: 52,
};

export const TRACKING = {
  tight: -1,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.5,
};

export const LEADING = {
  tight: 20,
  normal: 24,
  relaxed: 28,
  loose: 32,
};

/**
 * Hazır tipografi preset'leri — style prop'una direkt spread edilebilir.
 * Kullanım: <Text style={TYPO.h1}>KurdîBêje</Text>
 */
export const TYPO = {
  // Display — logo, hero başlıkları
  hero: {
    fontSize: SIZE.hero,
    fontWeight: WEIGHT.black,
    letterSpacing: TRACKING.tight,
  },
  h1: {
    fontSize: SIZE.h1,
    fontWeight: WEIGHT.black,
    letterSpacing: TRACKING.tight,
  },
  h2: {
    fontSize: SIZE.h2,
    fontWeight: WEIGHT.bold,
    letterSpacing: TRACKING.tight,
  },
  h3: {
    fontSize: SIZE.h3,
    fontWeight: WEIGHT.bold,
    letterSpacing: TRACKING.normal,
  },

  // Titles — bölüm başlıkları
  titleLg: {
    fontSize: SIZE.xxl,
    fontWeight: WEIGHT.bold,
  },
  titleMd: {
    fontSize: SIZE.xl,
    fontWeight: WEIGHT.bold,
  },
  titleSm: {
    fontSize: SIZE.lg,
    fontWeight: WEIGHT.semibold,
  },

  // Body
  bodyLg: {
    fontSize: SIZE.md,
    fontWeight: WEIGHT.medium,
    lineHeight: LEADING.normal,
  },
  body: {
    fontSize: SIZE.base,
    fontWeight: WEIGHT.medium,
    lineHeight: LEADING.normal,
  },
  bodySm: {
    fontSize: SIZE.sm,
    fontWeight: WEIGHT.medium,
  },

  // Button
  button: {
    fontSize: SIZE.md,
    fontWeight: WEIGHT.bold,
    letterSpacing: TRACKING.wider,
    textTransform: "uppercase" as const,
  },
  buttonSm: {
    fontSize: SIZE.sm,
    fontWeight: WEIGHT.bold,
    letterSpacing: TRACKING.wide,
    textTransform: "uppercase" as const,
  },

  // Caption / meta
  caption: {
    fontSize: SIZE.xs,
    fontWeight: WEIGHT.semibold,
    letterSpacing: TRACKING.wide,
  },
  overline: {
    fontSize: SIZE.xs,
    fontWeight: WEIGHT.bold,
    letterSpacing: TRACKING.widest,
    textTransform: "uppercase" as const,
  },

  // Speech bubble
  bubble: {
    fontSize: SIZE.lg,
    fontWeight: WEIGHT.semibold,
    lineHeight: LEADING.relaxed,
  },
  bubbleBold: {
    fontSize: SIZE.lg,
    fontWeight: WEIGHT.black,
  },
};
