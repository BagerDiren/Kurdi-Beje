import { useEffect, useState } from "react";
import { View, Image, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing,
} from "react-native-reanimated";

import { KevoMascot } from "@/components/kevo-mascot";

const { width: SW } = Dimensions.get("window");

/**
 * Hero carousel — Pexels'tan telifsiz çocuk dostu fotoğraflar
 * her 5 saniyede otomatik kayıyor, üzerinde Kevo + selamlama overlay.
 */

const HERO_PHOTOS: { uri: string; emoji: string; tag: string }[] = [
  // Renkli oyuncak/lego — çocuk dünyası
  { uri: "https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=900", emoji: "🧱", tag: "Hadi öğrenelim!" },
  // Çocuk + boyama
  { uri: "https://images.pexels.com/photos/1620770/pexels-photo-1620770.jpeg?auto=compress&cs=tinysrgb&w=900", emoji: "🎨", tag: "Renkler eğlenceli!" },
  // Sevimli kedi yakın çekim
  { uri: "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=900", emoji: "🐱", tag: "Bugün hayvanlar günü!" },
  // Renkli kalemler
  { uri: "https://images.pexels.com/photos/207666/pexels-photo-207666.jpeg?auto=compress&cs=tinysrgb&w=900", emoji: "✏️", tag: "Yeni kelimeler bekliyor!" },
  // Mutlu oyun zamanı
  { uri: "https://images.pexels.com/photos/207697/pexels-photo-207697.jpeg?auto=compress&cs=tinysrgb&w=900", emoji: "🎁", tag: "Sürprizler var!" },
];

export function HeroCarousel({ height = 220 }: { height?: number }) {
  const [idx, setIdx] = useState(0);
  const opacity = useSharedValue(1);
  const float = useSharedValue(0);

  // 5sn'de bir foto değiştir, fade-out → değiştir → fade-in
  useEffect(() => {
    const interval = setInterval(() => {
      opacity.value = withTiming(0, { duration: 600 }, () => {
        // worklet üzerinden state set edilemez, ama setIdx zaten kapalı kapatma
      });
      setTimeout(() => {
        setIdx((i) => (i + 1) % HERO_PHOTOS.length);
        opacity.value = withTiming(1, { duration: 600 });
      }, 600);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Kevo'nun yumuşak salınımı
  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, false,
    );
  }, []);

  const photoStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const kevoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  const current = HERO_PHOTOS[idx];

  return (
    <View style={[styles.root, { height }]}>
      {/* Foto */}
      <Animated.View style={[StyleSheet.absoluteFillObject, photoStyle]}>
        <Image
          source={{ uri: current.uri }}
          style={styles.photo}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Gradient shade alttan yukarı + üstten aşağı */}
      <LinearGradient
        colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.55)"] as unknown as readonly [string, string, ...string[]]}
        style={[StyleSheet.absoluteFillObject, { top: "40%" }]}
      />

      {/* Üst sticker — Kevo + selamlama */}
      <View style={styles.topBadge}>
        <Animated.View style={kevoStyle}>
          <KevoMascot size={64} mood="happy" idle />
        </Animated.View>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{current.tag}</Text>
        </View>
      </View>

      {/* Alt etiket */}
      <View style={styles.tagBar}>
        <Text style={styles.tagEmoji}>{current.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.tagTitle}>Hadi başlayalım!</Text>
          <Text style={styles.tagSub}>Aşağıdan bir konu seç</Text>
        </View>
        {/* Slide göstergeleri */}
        <View style={styles.dots}>
          {HERO_PHOTOS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { opacity: i === idx ? 1 : 0.4, width: i === idx ? 18 : 6 },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#FFD180",
    position: "relative",
  },
  photo: { width: "100%", height: "100%" },

  topBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#5C4033",
  },

  tagBar: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  tagEmoji: { fontSize: 32 },
  tagTitle: { fontSize: 15, fontWeight: "900", color: "#1A1A1A" },
  tagSub: { fontSize: 11, color: "#8B7355", fontWeight: "600", marginTop: 1 },
  dots: { flexDirection: "row", gap: 4 },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF6B9D",
  },
});
