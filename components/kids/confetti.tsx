import { useEffect, useMemo } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing,
} from "react-native-reanimated";

const { width: SW } = Dimensions.get("window");

const COLORS = ["#FF6B9D", "#F39C12", "#1CB0F6", "#27AE60", "#E74C3C", "#8E44AD", "#FFC72C", "#FF7043"];
const SHAPES = ["●", "★", "▲", "♥", "■", "♦"];

type Particle = {
  id: number;
  startX: number;
  endX: number;
  endY: number;
  rotEnd: number;
  delay: number;
  color: string;
  shape: string;
  size: number;
};

type Props = {
  visible: boolean;
  count?: number;
  duration?: number;
};

/**
 * Tek seferlik kutlama efekti — tepe noktasından her yöne fırlayan
 * 40 renkli partikül. Yer çekimine benzer aşağı kayma.
 *
 * `visible` true olduğunda 1.5 saniye boyunca animasyon oynar.
 */
export function Confetti({ visible, count = 40, duration = 1500 }: Props) {
  const particles: Particle[] = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        startX: SW / 2,
        endX: SW / 2 + (Math.random() - 0.5) * SW * 1.4,
        endY: 200 + Math.random() * 400,
        rotEnd: (Math.random() - 0.5) * 720,
        delay: Math.random() * 200,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        size: 14 + Math.random() * 12,
      })),
    [visible, count],
  );

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 999 }]}>
      {particles.map((p) => (
        <Particle key={p.id} {...p} duration={duration} />
      ))}
    </View>
  );
}

function Particle({
  startX, endX, endY, rotEnd, delay, color, shape, size, duration,
}: Particle & { duration: number }) {
  const x = useSharedValue(startX);
  const y = useSharedValue(0);
  const rot = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    x.value = withDelay(delay, withTiming(endX, { duration, easing: Easing.out(Easing.quad) }));
    y.value = withDelay(delay, withTiming(endY, { duration, easing: Easing.bezier(0.3, 0, 0.7, 1) }));
    rot.value = withDelay(delay, withTiming(rotEnd, { duration }));
    opacity.value = withDelay(delay + duration * 0.7, withTiming(0, { duration: duration * 0.3 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rot.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 100,
          left: -size / 2,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size, color, fontWeight: "900" }}>{shape}</Text>
    </Animated.View>
  );
}
