import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, Easing,
} from "react-native-reanimated";

import { KevoMascot } from "@/components/kevo-mascot";

/**
 * Kevo'nun yanına 4 sevimli arkadaş ekledik. Her biri farklı kategoride
 * kullanılır (çocuk böylece her ekranda farklı bir karakterle karşılaşır).
 *
 * Karakterler (emoji-based, anime tarzı yumuşak yüz):
 * - Kevo (kuş)      → ana mascot
 * - Roj (güneş)     → renkler
 * - Stêrk (yıldız)  → sayılar
 * - Mêş (arı)       → yiyecekler
 * - Mar (kelebek)   → vücut + aile
 */

export type CharacterKey = "kevo" | "roj" | "sterk" | "mes" | "mar" | "kuçik" | "pisîk";

const CHARACTERS: Record<CharacterKey, { emoji: string; name: string; color: string }> = {
  kevo:  { emoji: "🐦", name: "Kevo",   color: "#FFB740" },
  roj:   { emoji: "☀️", name: "Roj",    color: "#FFC72C" },
  sterk: { emoji: "⭐", name: "Stêrk",  color: "#9B59B6" },
  mes:   { emoji: "🐝", name: "Mêş",    color: "#FFC107" },
  mar:   { emoji: "🦋", name: "Mar",    color: "#E91E63" },
  kuçik: { emoji: "🐶", name: "Kûçik",  color: "#F39C12" },
  pisîk: { emoji: "🐱", name: "Pisîk",  color: "#FF9800" },
};

/**
 * Kategori temasına göre uygun karakteri seç.
 */
export function characterForCategory(catKey: string): CharacterKey {
  switch (catKey) {
    case "hayvan":  return "kevo";
    case "reng":    return "roj";
    case "hejmar":  return "sterk";
    case "xwarin":  return "mes";
    case "las":     return "mar";
    case "malbat":  return "mar";
    default:        return "kevo";
  }
}

type Props = {
  character?: CharacterKey;
  size?: number;
  /** Sürekli yumuşak zıplama */
  bounce?: boolean;
  /** Yan-yana sallanma */
  wave?: boolean;
};

/**
 * Kevo veya arkadaşları için tutarlı karakter komponenti.
 * Sürekli "yaşayan" hissi vermek için animasyonlu.
 */
export function KidCharacter({ character = "kevo", size = 100, bounce = true, wave = false }: Props) {
  const y = useSharedValue(0);
  const rot = useSharedValue(0);

  useEffect(() => {
    if (bounce) {
      y.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, false,
      );
    }
    if (wave) {
      rot.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 600, easing: Easing.inOut(Easing.sin) }),
          withTiming(8, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, true,
      );
    }
  }, [bounce, wave]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value },
      { rotate: `${rot.value}deg` },
    ],
  }));

  // Kevo için özel mascot komponentini kullan, diğerleri için emoji
  if (character === "kevo") {
    return (
      <Animated.View style={[styles.wrap, style]}>
        <KevoMascot size={size} mood="happy" idle speaking={false} />
      </Animated.View>
    );
  }

  const c = CHARACTERS[character];
  return (
    <Animated.View style={[styles.wrap, style]}>
      <View style={[styles.bubble, { backgroundColor: c.color + "22", borderColor: c.color }]}>
        <Text style={{ fontSize: size * 0.65 }}>{c.emoji}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  bubble: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
});
