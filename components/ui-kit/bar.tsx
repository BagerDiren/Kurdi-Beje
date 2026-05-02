import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { AppTheme } from "@/data/themes";

type BarProps = { value: number; max: number; th: AppTheme };

export function Bar({ value, max, th }: BarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <View style={[styles.track, { backgroundColor: th.bgDark }]}>
      <LinearGradient
        colors={[th.primary, th.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${pct}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: "100%", height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
});
