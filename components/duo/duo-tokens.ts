/**
 * DUO TOKENS — Duolingo'nun resmi tasarım dilinin dökümante edilmiş replikası.
 *
 * Renk isimlendirmesi Duolingo'nun kendi tasarım sisteminden ("Hoo-Dini") alıntıdır.
 * Buton stili "3D push" — alt kenarda 4px sert gölge, basıldığında düzleşir.
 *
 * Kullanım:
 *   import { DUO } from "@/components/duo/duo-tokens";
 *   ... color: DUO.green ...
 */

export const DUO = {
  // === BRAND ===
  green:      "#58CC02",   // Duo green (primary)
  greenDark:  "#58A700",   // 3D buton alt gölge
  greenLight: "#89E219",
  treeGreen:  "#4FC308",

  // === STATE ===
  cardinal:    "#FF4B4B",  // error/wrong
  cardinalDark:"#E53935",
  bee:         "#FFC800",  // gold/star
  beeDark:     "#E5B400",
  fox:         "#FF9600",  // streak fire
  foxDark:     "#E08000",
  macaw:       "#1CB0F6",  // info blue
  macawDark:   "#1899D6",
  beetle:      "#CE82FF",  // purple
  beetleDark:  "#A560E8",
  flamingo:    "#FF86D0",  // pink

  // === GRAYSCALE ===
  snow:   "#FFFFFF",
  polar:  "#F7F7F7",  // bg light mode
  swan:   "#E5E5E5",  // border, divider, locked node
  hare:   "#AFAFAF",  // disabled text
  wolf:   "#777777",  // secondary text
  eel:    "#4B4B4B",  // primary dark text
  ink:    "#3C3C3C",

  // === DARK MODE ===
  midnight: "#131F24",  // night bg
  carbon:   "#1F2C34",
  iron:     "#37464F",  // dark border

  // === SHADOWS ===
  shadowLight: "rgba(0,0,0,0.10)",
  shadowMd:    "rgba(0,0,0,0.16)",
};

// === TYPOGRAPHY (DIN Round + Feather Bold = Nunito + Fredoka fallback) ===
export const DUO_TYPO = {
  hero:    { fontFamily: "Fredoka_700Bold", fontSize: 32, letterSpacing: -0.5 },
  display: { fontFamily: "Fredoka_700Bold", fontSize: 26, letterSpacing: -0.3 },
  h1:      { fontFamily: "Fredoka_700Bold", fontSize: 22 },
  h2:      { fontFamily: "Fredoka_700Bold", fontSize: 18 },
  h3:      { fontFamily: "Fredoka_600SemiBold", fontSize: 16 },
  body:    { fontFamily: "Nunito_700Bold", fontSize: 15 },
  bodyReg: { fontFamily: "Nunito_400Regular", fontSize: 15 },
  caption: { fontFamily: "Nunito_700Bold", fontSize: 12, letterSpacing: 0.5 },
  micro:   { fontFamily: "Nunito_800ExtraBold", fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" as const },
  // Buton tipografisi (büyük, capslock)
  button:  { fontFamily: "Fredoka_700Bold", fontSize: 15, letterSpacing: 0.8, textTransform: "uppercase" as const },
};

export const DUO_RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  pill: 999,
};

export const DUO_SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, huge: 40,
};

/**
 * 3D Buton stili — Duolingo imzası.
 * Alt kenarda sert gölge (blur=0) + basıldığında bottom 0 olur (düzleşir).
 *
 * Kullanım:
 *   <Pressable style={({pressed}) => [duoButton('green', pressed)]}>
 */
export type DuoButtonVariant = "green" | "blue" | "yellow" | "red" | "outline" | "disabled";

export function duoButtonStyle(variant: DuoButtonVariant, pressed: boolean) {
  const map: Record<DuoButtonVariant, { bg: string; bottom: string; text: string; border: string }> = {
    green:    { bg: DUO.green,    bottom: DUO.greenDark,    text: DUO.snow, border: DUO.greenDark },
    blue:     { bg: DUO.macaw,    bottom: DUO.macawDark,    text: DUO.snow, border: DUO.macawDark },
    yellow:   { bg: DUO.bee,      bottom: DUO.beeDark,      text: DUO.eel,  border: DUO.beeDark },
    red:      { bg: DUO.cardinal, bottom: DUO.cardinalDark, text: DUO.snow, border: DUO.cardinalDark },
    outline:  { bg: DUO.snow,     bottom: DUO.swan,         text: DUO.macaw, border: DUO.swan },
    disabled: { bg: DUO.swan,     bottom: DUO.hare,         text: DUO.hare, border: DUO.swan },
  };
  const c = map[variant];
  return {
    backgroundColor: c.bg,
    borderBottomWidth: pressed ? 0 : 4,
    borderBottomColor: c.bottom,
    borderRadius: DUO_RADIUS.md,
    paddingHorizontal: DUO_SPACING.lg,
    paddingVertical: pressed ? 14 : 12,  // basıldıkça aşağı in
    alignItems: "center" as const,
    justifyContent: "center" as const,
    transform: [{ translateY: pressed ? 2 : 0 }],
    _color: c.text, // çağıran erişebilir
  };
}
