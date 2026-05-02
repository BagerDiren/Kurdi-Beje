import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing,
} from "react-native-reanimated";

import { KevoMascot } from "@/components/kevo-mascot";
import { BRAND, SHADOWS } from "@/data/brand";
import { useApp } from "@/data/app-context";

const { width } = Dimensions.get("window");

/**
 * Karşılama ekranı — KurdîBêje özgün hikâyesi.
 * Tamamen Türkçe. Hedef: Türkçe konuşanlara Kürtçe öğretmek.
 *
 * Görsel: gece sona ermiş, gün ışığında dağlar, Kevo karşılıyor,
 * altında 3 küçük "değer önerisi" kartı, en altta CTA'lar.
 */
export default function WelcomeScreen() {
  const { setAge, setLvl } = useApp();

  // Animasyonlar
  const heroOpacity = useSharedValue(0);
  const heroY = useSharedValue(30);
  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(40);

  useEffect(() => {
    heroOpacity.value = withTiming(1, { duration: 600 });
    heroY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) });
    cardOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    cardY.value = withDelay(300, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroY.value }],
  }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));

  const skipToTabs = () => {
    setAge("adult");
    setLvl("a1");
    router.replace("/(tabs)");
  };

  const features = [
    { icon: "🏔️", title: "Dağdan gelen kelimeler", sub: "Otantik Kurmancî" },
    { icon: "☀️",  title: "Her gün 5 dakika",        sub: "Düzenli pratik" },
    { icon: "🎯", title: "23 konu, 1000+ ders",     sub: "Yeni başlayandan ileri seviyeye" },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Background gradient (krem → gün ışığı) */}
      <LinearGradient
        colors={[BRAND.cream, BRAND.dawn, "#FFE0A8"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top decorative sun */}
      <View style={styles.sunDeco} />

      {/* Mountain silhouettes (subtle, top corner) */}
      <View style={styles.mountainsBg}>
        <View style={[styles.mountainSm, { left: width * 0.05, height: 60 }]} />
        <View style={[styles.mountainSm, { left: width * 0.32, height: 80 }]} />
        <View style={[styles.mountainSm, { left: width * 0.6, height: 50 }]} />
      </View>

      <View style={styles.content}>
        {/* Hero */}
        <Animated.View style={[styles.hero, heroStyle]}>
          <View style={styles.kevoBox}>
            <KevoMascot size={170} mood="happy" idle />
          </View>

          <Text style={styles.brandName}>KurdîBêje</Text>
          <View style={styles.brandUnderline} />

          <Text style={styles.headline}>
            Türkçe konuşanlar için{"\n"}
            <Text style={{ color: BRAND.sun }}>Kürtçe</Text> öğrenmenin yolu
          </Text>

          <Text style={styles.subhead}>
            Mezopotamya'nın binlerce yıllık dilini Kevo ile keşfet
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.features, cardStyle]}>
          {features.map((f, i) => (
            <View key={i} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Text style={{ fontSize: 22 }}>{f.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push("/onboarding/mode")}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
          >
            <LinearGradient
              colors={[BRAND.mountainLight, BRAND.mountain] as unknown as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtnInner}
            >
              <Text style={styles.primaryBtnText}>Hadi Başlayalım</Text>
              <Text style={styles.primaryBtnArrow}>→</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={skipToTabs}
            style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.secondaryBtnText}>Zaten hesabım var</Text>
          </Pressable>

          <Text style={styles.legal}>
            Devam ederek <Text style={{ fontWeight: "700" }}>Şartlar</Text>'ı ve{" "}
            <Text style={{ fontWeight: "700" }}>Gizlilik</Text>'i kabul ediyorsun
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BRAND.cream },

  // Decorative sun (top right)
  sunDeco: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: BRAND.sunLight,
    opacity: 0.55,
  },
  mountainsBg: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    height: 100,
    opacity: 0.18,
  },
  mountainSm: {
    position: "absolute",
    bottom: 0,
    width: 0,
    borderStyle: "solid",
    borderLeftWidth: 80,
    borderRightWidth: 80,
    borderBottomWidth: 0,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    backgroundColor: BRAND.mountain,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    zIndex: 1,
  },

  // Hero
  hero: {
    alignItems: "center",
    marginTop: 24,
  },
  kevoBox: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  brandName: {
    fontSize: 38,
    fontWeight: "900",
    color: BRAND.mountainDark,
    letterSpacing: -1.2,
    marginTop: 4,
  },
  brandUnderline: {
    width: 72,
    height: 4,
    borderRadius: 2,
    backgroundColor: BRAND.sun,
    marginTop: 6,
  },
  headline: {
    fontSize: 20,
    fontWeight: "800",
    color: BRAND.ink,
    textAlign: "center",
    marginTop: 18,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  subhead: {
    fontSize: 13,
    fontWeight: "500",
    color: BRAND.charcoal,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 19,
    paddingHorizontal: 8,
  },

  // Features
  features: {
    marginTop: 28,
    gap: 10,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...SHADOWS.sm,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BRAND.sunSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: BRAND.ink,
  },
  featureSub: {
    fontSize: 11,
    fontWeight: "500",
    color: BRAND.charcoal,
    marginTop: 1,
  },

  // Actions
  actions: {
    marginTop: "auto",
    gap: 10,
  },
  primaryBtn: {
    borderRadius: 16,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  primaryBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.3,
  },
  primaryBtnArrow: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "900",
  },
  secondaryBtn: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BRAND.mountain + "55",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: BRAND.mountainDark,
  },
  legal: {
    fontSize: 10,
    color: BRAND.smoke,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 16,
    lineHeight: 14,
  },
});
