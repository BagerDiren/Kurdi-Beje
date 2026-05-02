/**
 * Animasyonlu sahne komponenti — kategoriye özel "çizgi film" sahnesi.
 *
 * Her sahne 3 katmandan oluşur:
 *   1. SKY      — gradient arka plan
 *   2. GROUND   — yer (toprak / deniz / parke)
 *   3. PROPS    — hareketli/duran nesneler (bulut, hayvan, ağaç...)
 *   4. ACTOR    — Kevo veya kategori ana karakteri (yürür, zıplar, döner)
 *
 * Her katman Reanimated ile sürekli animasyon alır.
 */
import { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withSequence, withDelay, Easing,
} from "react-native-reanimated";

const { width: SW } = Dimensions.get("window");

type SceneKey = "hayvan" | "reng" | "hejmar" | "xwarin" | "las" | "malbat";

const SCENES: Record<SceneKey, {
  sky: readonly [string, string, string];
  ground: string;
  groundEmoji?: string;
  clouds: string[];
  props: { emoji: string; x: string; y: number; size: number; sway?: boolean }[];
  actor: { emoji: string; size: number };
}> = {
  hayvan: {
    sky: ["#87CEEB", "#A6D9F2", "#C9E9F8"] as const,
    ground: "#A4D65E",
    groundEmoji: "🌾",
    clouds: ["☁️", "☁️", "☁️"],
    props: [
      { emoji: "🌳", x: "10%", y: 20, size: 50, sway: true },
      { emoji: "🌳", x: "75%", y: 30, size: 44, sway: true },
      { emoji: "🐮", x: "55%", y: 18, size: 36 },
      { emoji: "🐔", x: "30%", y: 12, size: 28 },
      { emoji: "🌻", x: "15%", y: 8, size: 24 },
    ],
    actor: { emoji: "🐦", size: 48 },
  },
  reng: {
    sky: ["#FFD180", "#FFAB91", "#FF8A65"] as const,
    ground: "#F4A460",
    clouds: ["☁️", "☁️"],
    props: [
      { emoji: "🌈", x: "50%", y: 80, size: 80 },
      { emoji: "🔴", x: "20%", y: 30, size: 32 },
      { emoji: "🟢", x: "35%", y: 50, size: 32 },
      { emoji: "🟡", x: "65%", y: 50, size: 32 },
      { emoji: "🔵", x: "80%", y: 30, size: 32 },
    ],
    actor: { emoji: "🦋", size: 44 },
  },
  hejmar: {
    sky: ["#1E1B4B", "#3730A3", "#6366F1"] as const,
    ground: "#1E1B4B",
    clouds: [],
    props: [
      { emoji: "⭐", x: "10%", y: 80, size: 24, sway: true },
      { emoji: "⭐", x: "30%", y: 60, size: 30, sway: true },
      { emoji: "⭐", x: "55%", y: 90, size: 28, sway: true },
      { emoji: "⭐", x: "80%", y: 70, size: 26, sway: true },
      { emoji: "🌙", x: "75%", y: 40, size: 50 },
      { emoji: "🪐", x: "20%", y: 30, size: 40 },
    ],
    actor: { emoji: "🚀", size: 50 },
  },
  xwarin: {
    sky: ["#FFE0B2", "#FFCC80", "#FFB74D"] as const,
    ground: "#8B4513",
    clouds: ["☁️"],
    props: [
      { emoji: "🍎", x: "15%", y: 25, size: 40 },
      { emoji: "🍇", x: "75%", y: 30, size: 40 },
      { emoji: "🥛", x: "40%", y: 18, size: 36 },
      { emoji: "🍞", x: "60%", y: 22, size: 38 },
      { emoji: "🍵", x: "25%", y: 55, size: 32, sway: true },
    ],
    actor: { emoji: "👩‍🍳", size: 50 },
  },
  las: {
    sky: ["#E1BEE7", "#CE93D8", "#BA68C8"] as const,
    ground: "#8E24AA",
    clouds: ["☁️", "☁️"],
    props: [
      { emoji: "👁️", x: "20%", y: 60, size: 40 },
      { emoji: "👂", x: "75%", y: 50, size: 40 },
      { emoji: "✋", x: "10%", y: 25, size: 44 },
      { emoji: "🦶", x: "85%", y: 20, size: 40 },
      { emoji: "❤️", x: "50%", y: 70, size: 36, sway: true },
    ],
    actor: { emoji: "🧒", size: 56 },
  },
  malbat: {
    sky: ["#FFCDD2", "#F48FB1", "#F06292"] as const,
    ground: "#AD1457",
    clouds: ["☁️", "❤️", "☁️"],
    props: [
      { emoji: "🏠", x: "75%", y: 18, size: 60 },
      { emoji: "🌳", x: "10%", y: 22, size: 52 },
      { emoji: "👴", x: "30%", y: 18, size: 38 },
      { emoji: "👵", x: "45%", y: 18, size: 38 },
    ],
    actor: { emoji: "👨‍👩‍👧", size: 56 },
  },
};

type Props = {
  category: SceneKey;
  height?: number;
};

export function AnimatedScene({ category, height = 220 }: Props) {
  const scene = SCENES[category];

  return (
    <View style={[styles.root, { height }]}>
      {/* Gökyüzü */}
      <LinearGradient
        colors={scene.sky as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Hareketli bulutlar */}
      {scene.clouds.map((c, i) => (
        <Cloud key={i} emoji={c} index={i} />
      ))}

      {/* Sahne nesneleri */}
      {scene.props.map((p, i) => (
        <SceneProp key={i} {...p} />
      ))}

      {/* Yer */}
      <View style={[styles.ground, { backgroundColor: scene.ground }]} />

      {/* Yer detayı (otlar vb.) */}
      {scene.groundEmoji && (
        <View style={styles.groundDeco}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Text key={i} style={{ fontSize: 18 }}>{scene.groundEmoji}</Text>
          ))}
        </View>
      )}

      {/* Ana aktör — yürüyen Kevo/karakter */}
      <Actor emoji={scene.actor.emoji} size={scene.actor.size} />
    </View>
  );
}

// =====================================================================
//  BULUT — sağdan sola sürüklenir
// =====================================================================
function Cloud({ emoji, index }: { emoji: string; index: number }) {
  const x = useSharedValue(SW + 60);
  const y = 12 + index * 18;
  const size = 40 + index * 6;

  useEffect(() => {
    x.value = withDelay(
      index * 1500,
      withRepeat(
        withTiming(-100, { duration: 16000 + index * 3000, easing: Easing.linear }),
        -1, false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <Animated.View style={[{ position: "absolute", top: y }, style]}>
      <Text style={{ fontSize: size, opacity: 0.85 }}>{emoji}</Text>
    </Animated.View>
  );
}

// =====================================================================
//  SAHNE NESNESİ — sallanma efekti opsiyonel
// =====================================================================
function SceneProp({ emoji, x, y, size, sway }: {
  emoji: string; x: string; y: number; size: number; sway?: boolean;
}) {
  const rot = useSharedValue(0);

  useEffect(() => {
    if (sway) {
      rot.value = withRepeat(
        withSequence(
          withTiming(8, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          withTiming(-8, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, true,
      );
    }
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x as any,
          bottom: y,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size }}>{emoji}</Text>
    </Animated.View>
  );
}

// =====================================================================
//  AKTÖR — sürekli yürüyen + zıplayan ana karakter
// =====================================================================
function Actor({ emoji, size }: { emoji: string; size: number }) {
  const x = useSharedValue(-50);
  const y = useSharedValue(0);
  const flip = useSharedValue(1);

  useEffect(() => {
    // Ekranı sağa-sola yürüyen döngü
    x.value = withRepeat(
      withSequence(
        withTiming(SW - size - 20, { duration: 5500, easing: Easing.inOut(Easing.cubic) }),
        withTiming(-30, { duration: 5500, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1, false,
    );
    // Zıplama (her 800ms)
    y.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) }),
      ),
      -1, false,
    );
    // Yön değiştirirken flip (5.5sn)
    flip.value = withRepeat(
      withSequence(
        withDelay(5500, withTiming(-1, { duration: 100 })),
        withDelay(5500, withTiming(1, { duration: 100 })),
      ),
      -1, false,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scaleX: flip.value },
    ],
  }));

  return (
    <Animated.View style={[styles.actor, style]}>
      <Text style={{ fontSize: size }}>{emoji}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  ground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  groundDeco: {
    position: "absolute",
    bottom: 4,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actor: {
    position: "absolute",
    bottom: 28,
  },
});
