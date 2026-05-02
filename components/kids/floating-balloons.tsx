import { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const { width: SW, height: SH } = Dimensions.get("window");

const BALLOON_COLORS = [
  "#FF6B9D", "#F39C12", "#1CB0F6", "#27AE60",
  "#E74C3C", "#8E44AD", "#FFC72C", "#16A085",
];

const BALLOON_EMOJIS = ["🎈", "🎈", "🎈", "🎁", "⭐", "🌟", "🎊"];

type Balloon = {
  id: number;
  x: number;          // başlangıç x (%)
  size: number;       // 50–90 px
  color: string;
  delay: number;      // animasyon gecikmesi
  duration: number;   // tam tur süresi
  drift: number;      // sağ-sol salınım
  emoji: string;
};

/**
 * Çocuk modu eğlenceli arka plan — sürekli aşağıdan yukarıya yüzen
 * renkli balonlar, hafif sağ-sol salınımla.
 *
 * `count` ile balon sayısı kontrol edilir (varsayılan 7).
 */
export function FloatingBalloons({ count = 7 }: { count?: number }) {
  const balloons: Balloon[] = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: 5 + Math.random() * 85,
        size: 45 + Math.random() * 35,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
        delay: Math.random() * 4000,
        duration: 8000 + Math.random() * 6000,
        drift: 15 + Math.random() * 25,
        emoji: BALLOON_EMOJIS[Math.floor(Math.random() * BALLOON_EMOJIS.length)],
      })),
    [count],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {balloons.map((b) => (
        <Balloon key={b.id} {...b} />
      ))}
    </View>
  );
}

function Balloon({ x, size, color, delay, duration, drift, emoji }: Balloon) {
  const translateY = useSharedValue(SH + 60);
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-100, { duration, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(drift, { duration: duration / 3, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.balloon,
        {
          left: `${x}%`,
          width: size,
          height: size * 1.2,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.body,
          {
            width: size,
            height: size * 1.15,
            backgroundColor: color,
            shadowColor: color,
          },
        ]}
      >
        <Text style={{ fontSize: size * 0.55 }}>{emoji}</Text>
      </View>
      {/* String */}
      <View style={[styles.string, { backgroundColor: color + "AA" }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  balloon: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
  },
  body: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.85,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
  },
  string: {
    width: 1.5,
    height: 22,
    marginTop: -2,
  },
});
