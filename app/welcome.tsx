import { useEffect, useState, useRef } from "react";
import {
  View, Text, Pressable, StyleSheet, Dimensions, ScrollView, Image,
  NativeSyntheticEvent, NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat,
  withSequence, Easing,
} from "react-native-reanimated";

import { KidCharacter } from "@/components/kids/kid-character";
import { KIDS_THEME, RADIUS, SHADOW, SPACING, TYPO } from "@/components/kids/design";
import { useApp } from "@/data/app-context";

const { width: SW } = Dimensions.get("window");

/**
 * Karşılama / onboarding — Babbel/Drops tarzı 3-slayt swipeable.
 * Her slayt:
 *   • Üstte büyük görsel/karakter
 *   • Ortada başlık (Fredoka)
 *   • Altta açıklama (Nunito)
 * Alt: 3 nokta indikatör + CTA
 */

type Slide = {
  id: string;
  title: string;
  description: string;
  character: "kevo" | "roj" | "sterk" | "mes";
  bgColors: readonly [string, string, string];
  emojiAround: string[];
};

const SLIDES: Slide[] = [
  {
    id: "1",
    title: "Kürtçe öğrenmek\neğlenceli!",
    description: "Türkçe konuşan çocuklar ve yetişkinler için Kurmancî öğrenme deneyimi.",
    character: "kevo",
    bgColors: ["#FFE0EC", "#FFF4DC", "#FFE0EC"] as const,
    emojiAround: ["🎈", "⭐", "🎁", "🌈"],
  },
  {
    id: "2",
    title: "Oyunlarla,\nşarkılarla!",
    description: "Çizgi filmler izle, mini oyunlar oyna, balon patlat, roketle aya çık.",
    character: "sterk",
    bgColors: ["#E1F5FE", "#FFF4DC", "#FFE0EC"] as const,
    emojiAround: ["🎮", "🚀", "🎵", "🎨"],
  },
  {
    id: "3",
    title: "Her gün\n5 dakika!",
    description: "Düzenli pratik. Yıldız topla, seri yap, ödüller kazan.",
    character: "roj",
    bgColors: ["#FFF4DC", "#FFEFD5", "#FFE0B2"] as const,
    emojiAround: ["⭐", "🔥", "🏆", "💎"],
  },
];

export default function WelcomeScreen() {
  const { setAge, setLvl } = useApp();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const newPage = Math.round(x / SW);
    if (newPage !== page) setPage(newPage);
  };

  const next = () => {
    if (page < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (page + 1) * SW, animated: true });
    } else {
      router.push("/onboarding/mode");
    }
  };

  const skipToTabs = () => {
    setAge("adult");
    setLvl("a1");
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide) => (
          <SlideView key={slide.id} slide={slide} />
        ))}
      </ScrollView>

      <SafeAreaView edges={["top"]} style={styles.topAbsolute}>
        <Pressable onPress={skipToTabs} style={styles.skipBtn}>
          <Text style={styles.skipText}>Atla</Text>
        </Pressable>
      </SafeAreaView>

      <SafeAreaView edges={["bottom"]} style={styles.bottomAbsolute}>
        {/* Sayfa indikatörü */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === page ? 24 : 8,
                  backgroundColor: i === page ? KIDS_THEME.primary : KIDS_THEME.silver,
                },
              ]}
            />
          ))}
        </View>

        {/* CTA */}
        <Pressable
          onPress={next}
          style={({ pressed }) => [
            styles.cta,
            SHADOW(KIDS_THEME.primary, "lg"),
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.95 },
          ]}
        >
          <LinearGradient
            colors={[KIDS_THEME.primary, KIDS_THEME.primaryDark] as unknown as readonly [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGrad}
          >
            <Text style={styles.ctaText}>
              {page < SLIDES.length - 1 ? "DEVAM" : "HADİ BAŞLAYALIM"}
            </Text>
            <Text style={styles.ctaArrow}>→</Text>
          </LinearGradient>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

// =====================================================================
//  TEK SLAYT
// =====================================================================
function SlideView({ slide }: { slide: Slide }) {
  // Etrafta yumuşak salınan emoji'ler
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);

  useEffect(() => {
    float1.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, false,
    );
    float2.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-14, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, false,
    );
  }, []);

  const f1 = useAnimatedStyle(() => ({ transform: [{ translateY: float1.value }] }));
  const f2 = useAnimatedStyle(() => ({ transform: [{ translateY: float2.value }] }));

  return (
    <View style={styles.slide}>
      <LinearGradient
        colors={slide.bgColors as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Etraf süsleri */}
      <Animated.Text style={[styles.cornerEmoji, { top: 90, left: 30 }, f1]}>
        {slide.emojiAround[0]}
      </Animated.Text>
      <Animated.Text style={[styles.cornerEmoji, { top: 110, right: 40 }, f2]}>
        {slide.emojiAround[1]}
      </Animated.Text>
      <Animated.Text style={[styles.cornerEmoji, { bottom: 220, left: 40 }, f2]}>
        {slide.emojiAround[2]}
      </Animated.Text>
      <Animated.Text style={[styles.cornerEmoji, { bottom: 240, right: 30 }, f1]}>
        {slide.emojiAround[3]}
      </Animated.Text>

      <View style={styles.slideCenter}>
        {/* Karakter dairesinde */}
        <View style={styles.characterCircle}>
          <KidCharacter character={slide.character} size={140} bounce />
        </View>

        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDesc}>{slide.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: KIDS_THEME.bg },

  topAbsolute: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  skipBtn: {
    paddingHorizontal: 16, paddingVertical: 10,
    margin: 12,
  },
  skipText: { ...TYPO.body, color: KIDS_THEME.smoke },

  // Slayt
  slide: {
    width: SW,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  cornerEmoji: { position: "absolute", fontSize: 32, opacity: 0.85 },
  slideCenter: { alignItems: "center", gap: 18 },
  characterCircle: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 4, borderColor: "#fff",
    ...SHADOW(KIDS_THEME.primary, "glow"),
    marginBottom: 8,
  },
  slideTitle: {
    ...TYPO.hero,
    color: KIDS_THEME.ink,
    textAlign: "center",
    lineHeight: 42,
  },
  slideDesc: {
    ...TYPO.bodyLg,
    color: KIDS_THEME.graphite,
    textAlign: "center",
    paddingHorizontal: 16,
    marginTop: 4,
    lineHeight: 22,
  },

  // Alt: indikatör + CTA
  bottomAbsolute: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 18,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  cta: {
    borderRadius: RADIUS.xl,
    overflow: "hidden",
  },
  ctaGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
  },
  ctaText: { ...TYPO.button, color: "#fff" },
  ctaArrow: { fontSize: 22, color: "#fff", fontFamily: "Fredoka_700Bold" },
});
