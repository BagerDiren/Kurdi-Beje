import { Pressable, Text, StyleSheet, View } from "react-native";
import { DUO } from "@/data/duo-colors";
import { TYPO } from "@/data/typography";

type DuoButtonProps = {
  children: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  style?: any;
};

/**
 * Duolingo tarzı 3D buton. Token sistemine tamamen bağlı.
 * - Primary: yeşil dolgu + koyu yeşil 4px alt gölge (basılı hissi)
 * - Secondary: beyaz dolgu + gri alt gölge + yeşil yazı
 * - Basılınca ezilir (shadow kaybolur, yukarı kayar)
 */
export function DuoButton({
  children,
  onPress,
  disabled,
  variant = "primary",
  style,
}: DuoButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrap,
        { marginBottom: pressed ? 0 : 4 },
        style,
      ]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.button,
            isPrimary
              ? {
                  backgroundColor: DUO.primaryBg,
                  borderBottomColor: DUO.primaryBgDark,
                }
              : {
                  backgroundColor: DUO.secondaryBg,
                  borderBottomColor: DUO.secondaryBgDark,
                  borderWidth: 2,
                  borderColor: DUO.border,
                },
            { borderBottomWidth: pressed ? 0 : 4 },
            pressed && { transform: [{ translateY: 4 }] },
            disabled && styles.disabled,
          ]}
        >
          <Text
            style={[
              TYPO.button,
              { color: isPrimary ? DUO.white : DUO.green },
              disabled && { color: DUO.textLight },
            ]}
          >
            {children}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  disabled: { opacity: 0.5 },
});
