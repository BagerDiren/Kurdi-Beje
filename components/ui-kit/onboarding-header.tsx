import { View, Pressable, Text, StyleSheet } from "react-native";
import { ProgressBar } from "./progress-bar";
import { DUO } from "@/data/duo-colors";

type OnboardingHeaderProps = {
  progress: number;      // 0-1
  onBack?: () => void;
  /** Geri butonu devre dışı */
  disableBack?: boolean;
};

/**
 * Onboarding üst barı: geri ok + progress bar yan yana.
 * Duolingo'nun yalın modelini alır, bizde:
 *  - Daha yumuşak gri ok rengi (hover state)
 *  - Ok dokunma alanı geniş (hitSlop)
 *  - Progress bar yanında sabit aralık
 */
export function OnboardingHeader({
  progress,
  onBack,
  disableBack = false,
}: OnboardingHeaderProps) {
  return (
    <View style={styles.container}>
      {!disableBack ? (
        <Pressable onPress={onBack} hitSlop={16} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
      ) : (
        <View style={styles.backBtn} />
      )}
      <View style={styles.barWrap}>
        <ProgressBar value={progress} height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 28,
    fontWeight: "500",
    color: DUO.textLight,
    lineHeight: 28,
  },
  barWrap: {
    flex: 1,
  },
});
