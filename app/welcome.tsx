import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withRepeat, withSequence, Easing,
} from "react-native-reanimated";

import { KevoMascot } from "@/components/kevo-mascot";
import { FloatingBalloons } from "@/components/kids/floating-balloons";
import { BRAND, SHADOWS } from "@/data/brand";
import { useApp } from "@/data/app-context";

const { width: SW } = Dimensions.get("window");

/**
 * Karşılama ekranı — çocuk dostu eğlenceli versiyon.
 * Yüzen balonlar, animasyonlu Kevo, parıldayan yıldızlar, dans eden
 * hayvanlar… Türkçe konuşan çocuklara Kürtçe öğretiyoruz, keyifle!
 */
export default function WelcomeScreen() {
  const { setAge, setLvl } = useApp();

  // Hero animasyonları
  const kevoY = useSharedValue(50);
  const kevoOp = useSharedValue(0);
  const kevoBounce = useSharedValue(0);
  const brandScale = useSharedValue(0.6);
  const brandOp = useSharedValue(0);
  const sub1Op = useSharedValue(0);
  const featureY = useSharedValue(60);
  const featureOp = useSharedValue(0);
  const ctaOp = useSharedValue(0);
  const ctaScale = useSharedValue(0.7);
  const star1 = useSharedValue(0);
  const star2 = useSharedValue(0);
  const star3 = useSharedValue(0);

  useEffect(() => {
    // Faz 1: Kevo gelir
    kevoOp.value = withTiming(1, { duration: 600 });
    kevoY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.back(1.2)) });
    // Sürekli zıplama
    kevoBounce.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, false,
    );

    // Faz 2: Brand pop
    brandScale.value = withDelay(400, withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.4)) }));
    brandOp.value = withDelay(400, withTiming(1, { duration: 400 }));
    sub1Op.value = withDelay(700, withTiming(1, { duration: 400 }));

    // Faz 3: Yıldızlar parıldar
    star1.value = withDelay(900, withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0.3, { duration: 800 })),
      -1, true,
    ));
    star2.value = withDelay(1100, withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.3, { duration: 700 })),
      -1, true,
    ));
    star3.value = withDelay(1300, withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0.3, { duration: 900 })),
      -1, true,
    ));

    // Faz 4: Özellikler
    featureY.value = withDelay(900, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    featureOp.value = withDelay(900, withTiming(1, { duration: 500 }));

    // Faz 5: CTA
    ctaOp.value = withDelay(1200, withTiming(1, { duration: 400 }));
    ctaScale.value = withDelay(1200, withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.3)) }));
  }, []);

  const kevoStyle = useAnimatedStyle(() => ({
    opacity: kevoOp.value,
    transform: [
      { translateY: kevoY.value + kevoBounce.value },
    ],
  }));
  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOp.value,
    transform: [{ scale: brandScale.value }],
  }));
  const sub1Style = useAnimatedStyle(() => ({ opacity: sub1Op.value }));
  const star1Style = useAnimatedStyle(() => ({ opacity: star1.value }));
  const star2Style = useAnimatedStyle(() => ({ opacity: star2.value }));
  const star3Style = useAnimatedStyle(() => ({ opacity: star3.value }));
  const featureStyle = useAnimatedStyle(() => ({
    opacity: featureOp.value,
    transform: [{ translateY: featureY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOp.value,
    transform: [{ scale: ctaScale.value }],
  }));

  const skipToTabs = () => {
    setAge("adult");
    setLvl("a1");
    router.replace("/(tabs)");
  };

  const features = [
    { icon: "🎮", title: "Eğlenceli Oyunlar", color: "#FF6B9D" },
    { icon: "📺", title: "Çizgi Filmler",     color: "#1CB0F6" },
    { icon: "🎵", title: "Şarkı & Sesler",    color: "#F39C12" },
    { icon: "⭐", title: "Yıldız Topla",       color: "#9B59B6" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: BRAND.cream }}>
      {/* Renkli yumuşak gradient bg */}
      <LinearGradient
        colors={["#FFE4F3", "#FFF4DC", "#E0F7FA"] as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Yüzen balonlar */}
      <FloatingBalloons count={6} />

      {/* Parıldayan yıldızlar (hero arka plan) */}
      <Animated.Text style={[styles.starDeco, { top: 80, left: 40 }, star1Style]}>✨</Animated.Text>
      <Animated.Text style={[styles.starDeco, { top: 120, right: 50 }, star2Style]}>⭐</Animated.Text>
      <Animated.Text style={[styles.starDeco, { top: 200, left: 25 }, star3Style]}>✨</Animated.Text>
      <Animated.Text style={[styles.starDeco, { top: 60, right: 90, fontSize: 18 }, star2Style]}>🌟</Animated.Text>

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.content}>
          {/* HERO */}
          <View style={styles.hero}>
            <Animated.View style={[styles.kevoWrap, kevoStyle]}>
              <KevoMascot size={180} mood="happy" speaking idle />
            </Animated.View>

            <Animated.View style={brandStyle}>
              <Text style={styles.brand}>KurdîBêje</Text>
              <View style={styles.brandUnderline} />
            </Animated.View>

            <Animated.View style={sub1Style}>
              <Text style={styles.headline}>
                Kürtçe öğrenmenin{"\n"}<Text style={{ color: "#FF6B9D" }}>en eğlenceli</Text> yolu!
              </Text>
              <Text style={styles.sub}>🎉 Çocuklar ve yetişkinler için 🎉</Text>
            </Animated.View>
          </View>

          {/* ÖZELLİK BADGES */}
          <Animated.View style={[styles.features, featureStyle]}>
            {features.map((f, i) => (
              <View
                key={i}
                style={[
                  styles.feature,
                  {
                    backgroundColor: "#fff",
                    borderColor: f.color,
                  },
                ]}
              >
                <View style={[styles.featureIcon, { backgroundColor: f.color }]}>
                  <Text style={{ fontSize: 22 }}>{f.icon}</Text>
                </View>
                <Text style={[styles.featureTitle, { color: f.color }]}>{f.title}</Text>
              </View>
            ))}
          </Animated.View>

          {/* CTA */}
          <Animated.View style={[styles.actions, ctaStyle]}>
            <Pressable
              onPress={() => router.push("/onboarding/mode")}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.92, transform: [{ scale: 0.97 }] },
              ]}
            >
              <LinearGradient
                colors={["#FF6B9D", "#FF4778", "#E91E63"] as unknown as readonly [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtnInner}
              >
                <Text style={styles.primaryBtnEmoji}>🚀</Text>
                <Text style={styles.primaryBtnText}>HADİ BAŞLAYALIM</Text>
                <Text style={styles.primaryBtnArrow}>→</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={skipToTabs}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.secondaryBtnText}>Hesabım var · giriş yap</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 16,
  },

  starDeco: {
    position: "absolute",
    fontSize: 24,
    zIndex: 1,
  },

  // Hero
  hero: {
    alignItems: "center",
    marginTop: 28,
  },
  kevoWrap: {
    alignItems: "center",
    marginBottom: 6,
  },
  brand: {
    fontSize: 46,
    fontWeight: "900",
    color: BRAND.mountainDark,
    letterSpacing: -1.4,
    textAlign: "center",
    textShadowColor: "rgba(255,107,157,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  brandUnderline: {
    width: 80,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#FF6B9D",
    alignSelf: "center",
    marginTop: 4,
  },
  headline: {
    fontSize: 22,
    fontWeight: "900",
    color: BRAND.ink,
    textAlign: "center",
    marginTop: 18,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  sub: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND.charcoal,
    textAlign: "center",
    marginTop: 8,
  },

  // Özellik badges (4'lü grid)
  features: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: 24,
  },
  feature: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    ...SHADOWS.sm,
  },
  featureIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: "900",
    flex: 1,
  },

  // Actions
  actions: {
    marginTop: "auto",
    gap: 12,
  },
  primaryBtn: {
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#FF6B9D",
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  primaryBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
  },
  primaryBtnEmoji: { fontSize: 24 },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.5,
  },
  primaryBtnArrow: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "900",
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND.charcoal,
    textDecorationLine: "underline",
  },
});
