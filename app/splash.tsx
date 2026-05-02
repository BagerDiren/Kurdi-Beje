import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withSequence, Easing,
} from "react-native-reanimated";

import { KevoMascot } from "@/components/kevo-mascot";
import { DUO } from "@/data/duo-colors";
import { TYPO } from "@/data/typography";

/**
 * Açılış splash ekranı — tamamen beyaz, Duolingo stili.
 * Kevo + KurdîBêje logosu + yükleme barı. 3 saniyede welcome'a geçer.
 */
export default function SplashScreen() {
  const kevoScale = useSharedValue(0.6);
  const kevoOpacity = useSharedValue(0);
  const brandOpacity = useSharedValue(0);
  const brandY = useSharedValue(20);
  const subOpacity = useSharedValue(0);
  const barWidth = useSharedValue(0);

  useEffect(() => {
    kevoOpacity.value = withTiming(1, { duration: 500 });
    kevoScale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.3)) });

    brandOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    brandY.value = withDelay(400, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    subOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));

    barWidth.value = withDelay(300, withTiming(100, {
      duration: 2400,
      easing: Easing.inOut(Easing.quad),
    }));

    const tm = setTimeout(() => router.replace("/welcome"), 3000);
    return () => clearTimeout(tm);
  }, []);

  const kevoStyle = useAnimatedStyle(() => ({
    opacity: kevoOpacity.value,
    transform: [{ scale: kevoScale.value }],
  }));

  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    transform: [{ translateY: brandY.value }],
  }));

  const subStyle = useAnimatedStyle(() => ({
    opacity: subOpacity.value,
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%` as `${number}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />

      <Animated.View style={[styles.kevoWrap, kevoStyle]}>
        <KevoMascot size={180} mood="happy" speaking idle={false} />
      </Animated.View>

      <Animated.View style={brandStyle}>
        <Text style={styles.brand}>KurdîBêje</Text>
      </Animated.View>

      <Animated.View style={[{ marginTop: 8 }, subStyle]}>
        <Text style={styles.sub}>Bi Kevo re Kurmancî fêr bibe</Text>
      </Animated.View>

      <View style={styles.spacer} />

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, barStyle]} />
      </View>

      <View style={{ height: 48 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DUO.bg,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  spacer: { flex: 1 },
  kevoWrap: { alignItems: "center" },
  brand: {
    ...TYPO.h1,
    color: DUO.green,
    textAlign: "center",
    marginTop: 12,
  },
  sub: {
    ...TYPO.bodyLg,
    color: DUO.textMuted,
    textAlign: "center",
  },
  barTrack: {
    width: 140,
    height: 5,
    borderRadius: 3,
    backgroundColor: DUO.border,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: DUO.green,
  },
});
