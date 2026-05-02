import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { DUO } from "@/data/duo-colors";

type ProgressBarProps = {
  /** 0 ile 1 arası */
  value: number;
  /** Bar yüksekliği */
  height?: number;
  style?: any;
};

/**
 * Onboarding progress bar — Duolingo'dan üstün:
 * - Gradient dolgu (yeşil → açık yeşil)
 * - İç highlight çizgisi (glossy hissi)
 * - Smooth animated fill
 * - Yuvarlatılmış uç
 */
export function ProgressBar({ value, height = 14, style }: ProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.max(0, Math.min(1, value)) * 100, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as `${number}%`,
  }));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
      <Animated.View style={[styles.fillWrap, { borderRadius: height / 2 }, fillStyle]}>
        <LinearGradient
          colors={[DUO.greenLight, DUO.green]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: height / 2 }]}
        />
        {/* Üst highlight (glossy strip) */}
        <View
          style={[
            styles.highlight,
            {
              height: height / 3,
              borderRadius: height / 4,
              top: 2,
              left: 4,
              right: 4,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flex: 1,
    backgroundColor: DUO.progressBg,
    overflow: "hidden",
  },
  fillWrap: {
    height: "100%",
    overflow: "hidden",
  },
  highlight: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.35)",
  },
});
