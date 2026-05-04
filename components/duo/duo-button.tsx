/**
 * DuoButton — Duolingo'nun imza 3D push buton.
 *
 * Özellikler:
 *   • Alt kenarda 4px sert gölge (blur yok — keskin "yükseltilmiş" his)
 *   • Basıldığında düzleşir (border-bottom 0, transform translateY +2)
 *   • Capslock metin, Fredoka font, 0.8 letter-spacing
 */
import { Pressable, Text, View, ViewStyle, StyleProp } from "react-native";
import { DUO, DUO_RADIUS, DUO_SPACING, DUO_TYPO, type DuoButtonVariant } from "./duo-tokens";

type Props = {
  label: string;
  variant?: DuoButtonVariant;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
};

export function DuoButton({ label, variant = "green", onPress, disabled, style, fullWidth = true }: Props) {
  const v: DuoButtonVariant = disabled ? "disabled" : variant;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => {
        const map: Record<DuoButtonVariant, { bg: string; bottom: string; text: string }> = {
          green:    { bg: DUO.green,    bottom: DUO.greenDark,    text: DUO.snow },
          blue:     { bg: DUO.macaw,    bottom: DUO.macawDark,    text: DUO.snow },
          yellow:   { bg: DUO.bee,      bottom: DUO.beeDark,      text: DUO.eel },
          red:      { bg: DUO.cardinal, bottom: DUO.cardinalDark, text: DUO.snow },
          outline:  { bg: DUO.snow,     bottom: DUO.swan,         text: DUO.macaw },
          disabled: { bg: DUO.swan,     bottom: DUO.hare,         text: DUO.hare },
        };
        const c = map[v];
        return [
          {
            backgroundColor: c.bg,
            borderRadius: DUO_RADIUS.md,
            borderBottomWidth: pressed ? 0 : 4,
            borderBottomColor: c.bottom,
            paddingHorizontal: DUO_SPACING.lg,
            paddingVertical: pressed ? 14 : 12,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 50,
          },
          fullWidth ? { width: "100%" as const } : null,
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const map: Record<DuoButtonVariant, string> = {
          green: DUO.snow, blue: DUO.snow, yellow: DUO.eel,
          red: DUO.snow, outline: DUO.macaw, disabled: DUO.hare,
        };
        return <Text style={[DUO_TYPO.button, { color: map[v] }]}>{label}</Text>;
      }}
    </Pressable>
  );
}

/**
 * DuoChip — 3D etkili kelime kartı (word bank'da, match pairs'de kullanılan).
 * Beyaz/açık zemin + alt kenarda gri gölge.
 */
export function DuoChip({
  label, onPress, selected, correct, wrong, disabled,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
  correct?: boolean;
  wrong?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => {
        let bg = DUO.snow;
        let border = DUO.swan;
        let bottomBorder = DUO.swan;
        let textColor = DUO.eel;
        if (selected)  { bg = "#DDF4FF"; border = DUO.macaw; bottomBorder = DUO.macaw; textColor = DUO.macawDark; }
        if (correct)   { bg = "#D7FFB8"; border = DUO.green; bottomBorder = DUO.green; textColor = DUO.treeGreen; }
        if (wrong)     { bg = "#FFDFE0"; border = DUO.cardinal; bottomBorder = DUO.cardinal; textColor = DUO.cardinalDark; }
        if (disabled)  { bg = DUO.polar; border = DUO.swan; bottomBorder = DUO.swan; textColor = DUO.hare; }
        return {
          backgroundColor: bg,
          borderWidth: 2,
          borderColor: border,
          borderBottomWidth: pressed ? 2 : 4,
          borderBottomColor: bottomBorder,
          borderRadius: DUO_RADIUS.md,
          paddingHorizontal: DUO_SPACING.md,
          paddingVertical: 10,
          marginBottom: pressed ? 0 : 0,
          opacity: 1,
          transform: [{ translateY: pressed ? 2 : 0 }],
        };
      }}
    >
      {({ pressed }) => {
        let textColor = DUO.eel;
        if (selected)  textColor = DUO.macawDark;
        if (correct)   textColor = DUO.treeGreen;
        if (wrong)     textColor = DUO.cardinalDark;
        if (disabled)  textColor = DUO.hare;
        return <Text style={[DUO_TYPO.body, { color: textColor }]}>{label}</Text>;
      }}
    </Pressable>
  );
}
