import { Pressable, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { AppTheme } from "@/data/themes";

type BtnProps = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  th: AppTheme;
  variant?: "primary" | "correct";
};

export function Btn({ children, onPress, disabled, th, variant = "primary" }: BtnProps) {
  const colors: [string, string] =
    variant === "correct" ? [th.correct, "#66BB6A"] : [th.primary, th.primaryLight];

  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [
      styles.wrap,
      pressed && !disabled && styles.pressed,
    ]}>
      <LinearGradient
        colors={disabled ? [th.bgDark, th.bgDark] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.text, disabled && { color: th.textLight }]}>
          {children}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", borderRadius: 16, overflow: "hidden" },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  gradient: { paddingVertical: 15, alignItems: "center", borderRadius: 16 },
  text: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
