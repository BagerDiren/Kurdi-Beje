import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence, withDelay,
} from "react-native-reanimated";

import { KevoMascot } from "@/components/kevo-mascot";
import { speakKurmanciKid } from "@/data/sound-fx";
import type { KidsCategory } from "@/data/kids-content";

const { width: SW } = Dimensions.get("window");

/**
 * Çocuk kategorisine girerken oynayan kısa hikaye sahnesi.
 * Her kategoriye özel 3-4 emoji animasyonlu giriş + Kevo karşılama.
 *
 * `onDone` çağrıldığında ders runner devreye girer.
 */
const SCENES: Record<string, { emojis: string[]; story: string; greeting: string; bg?: string }> = {
  hayvan: {
    emojis: ["🌳", "🐮", "🐔", "🐑", "🐶"],
    story: "Kevo çiftliğe geliyor...",
    greeting: "Hayvanlarla tanışmaya hazır mısın?",
    bg: "https://images.pexels.com/photos/2255801/pexels-photo-2255801.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  reng: {
    emojis: ["🌈", "🔴", "🟢", "🟡", "🔵"],
    story: "Gökkuşağı çıktı!",
    greeting: "Hadi renkleri öğrenelim!",
    bg: "https://images.pexels.com/photos/207666/pexels-photo-207666.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  hejmar: {
    emojis: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"],
    story: "Sayılar dans ediyor...",
    greeting: "1, 2, 3 sayalım mı?",
    bg: "https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  xwarin: {
    emojis: ["🍎", "🍇", "🍞", "🥛", "🍲"],
    story: "Mutfakta lezzetler var!",
    greeting: "Karnın aç mı? Bakalım!",
    bg: "https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  las: {
    emojis: ["👁️", "👂", "👃", "👄", "✋"],
    story: "Vücudumuzu keşfedelim!",
    greeting: "Hangi parçayı biliyor musun?",
    bg: "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  malbat: {
    emojis: ["👨", "👩", "👶", "👴", "👵"],
    story: "Aile bir arada!",
    greeting: "Aileni Kürtçe söyle!",
    bg: "https://images.pexels.com/photos/4476377/pexels-photo-4476377.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
};

type Props = {
  category: KidsCategory;
  onDone: () => void;
};

export function StoryIntro({ category, onDone }: Props) {
  const scene = SCENES[category.key] ?? {
    emojis: [category.emoji, category.emoji, category.emoji],
    story: "Yeni bir macera başlıyor!",
    greeting: "Hadi başlayalım!",
  };

  const [phase, setPhase] = useState<"emojis" | "kevo" | "ready">("emojis");

  // Emoji animasyon değerleri (5 emoji için)
  const emojiAnims = scene.emojis.map(() => ({
    scale: useSharedValue(0),
    y: useSharedValue(40),
  }));
  const titleY = useSharedValue(40);
  const titleOp = useSharedValue(0);
  const kevoScale = useSharedValue(0);
  const greetingY = useSharedValue(20);
  const greetingOp = useSharedValue(0);
  const ctaScale = useSharedValue(0);

  useEffect(() => {
    // Faz 1: emoji'ler sırayla pop yapar (her biri 200ms gecikme)
    emojiAnims.forEach((a, i) => {
      a.scale.value = withDelay(i * 200, withSpring(1, { damping: 6 }));
      a.y.value = withDelay(i * 200, withSpring(0, { damping: 8 }));
    });
    // Title gelir
    titleY.value = withDelay(800, withSpring(0));
    titleOp.value = withDelay(800, withTiming(1, { duration: 400 }));

    // Faz 2: Kevo zıplayarak gelir (1.6sn)
    setTimeout(() => {
      setPhase("kevo");
      kevoScale.value = withSequence(
        withTiming(1.2, { duration: 400 }),
        withSpring(1, { damping: 6 }),
      );
      greetingY.value = withDelay(400, withSpring(0));
      greetingOp.value = withDelay(400, withTiming(1, { duration: 400 }));
      // Kevo söylesin (çocuk dostu yüksek pitch, tekrarlı)
      speakKurmanciKid(category.titleKu);
    }, 1800);

    // Faz 3: CTA görünür (3.2sn)
    setTimeout(() => {
      setPhase("ready");
      ctaScale.value = withSpring(1, { damping: 6 });
    }, 3200);
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOp.value,
    transform: [{ translateY: titleY.value }],
  }));
  const kevoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: kevoScale.value }],
  }));
  const greetingStyle = useAnimatedStyle(() => ({
    opacity: greetingOp.value,
    transform: [{ translateY: greetingY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  return (
    <View style={styles.root}>
      {/* Foto bg (varsa) */}
      {scene.bg && (
        <Image
          source={{ uri: scene.bg }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      )}
      {/* Renkli gradient overlay */}
      <LinearGradient
        colors={[
          category.bgGradient[0] + "DD",
          category.bgGradient[1] + "EE",
        ] as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Üst sahne: emoji'ler */}
      <View style={styles.scene}>
        {scene.emojis.map((emoji, i) => {
          const aStyle = useAnimatedStyle(() => ({
            transform: [
              { scale: emojiAnims[i].scale.value },
              { translateY: emojiAnims[i].y.value },
            ],
          }));
          return (
            <Animated.View key={i} style={[styles.emojiBubble, aStyle]}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </Animated.View>
          );
        })}
      </View>

      <Animated.Text style={[styles.story, titleStyle]}>
        {scene.story}
      </Animated.Text>

      {/* Kevo + greeting */}
      {(phase === "kevo" || phase === "ready") && (
        <>
          <Animated.View style={[styles.kevoBox, kevoStyle]}>
            <KevoMascot size={130} mood="excited" speaking idle />
          </Animated.View>

          <Animated.Text style={[styles.greeting, greetingStyle]}>
            {scene.greeting}
          </Animated.Text>
        </>
      )}

      {/* CTA */}
      {phase === "ready" && (
        <Animated.View style={[styles.ctaWrap, ctaStyle]}>
          <Pressable
            onPress={onDone}
            style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.85 : 1, transform: pressed ? [{ scale: 0.97 }] : [] }]}
          >
            <Text style={styles.ctaText}>HADİ BAŞLAYALIM! 🚀</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Skip */}
      <Pressable onPress={onDone} style={styles.skip} hitSlop={12}>
        <Text style={styles.skipText}>Atla →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, position: "relative" },
  scene: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    marginBottom: 18,
  },
  emojiBubble: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  emojiText: { fontSize: 38 },
  story: {
    fontSize: 16,
    fontWeight: "800",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 24,
  },
  kevoBox: { alignItems: "center", marginBottom: 16 },
  greeting: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 16,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  ctaWrap: { marginTop: 28, width: "100%", paddingHorizontal: 12 },
  cta: {
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#5C4033",
    letterSpacing: 0.5,
  },
  skip: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  skipText: { color: "#fff", fontSize: 12, fontWeight: "800" },
});
