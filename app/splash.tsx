import { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withSequence, withRepeat, Easing,
} from "react-native-reanimated";

import { KevoMascot } from "@/components/kevo-mascot";
import { BRAND } from "@/data/brand";

const { width } = Dimensions.get("window");

/**
 * Açılış ekranı — KurdîBêje özgün kimliği.
 * Sinematik: gece dağ silüeti → güneş yükselir → Kevo görünür → logo açılır
 * Tamamen Türkçe (uygulamanın hedef kitlesi Türkçe konuşanlar)
 */
export default function SplashScreen() {
  // Animasyon değerleri
  const sunY = useSharedValue(150);
  const sunScale = useSharedValue(0.4);
  const sunGlow = useSharedValue(0);
  const kevoOpacity = useSharedValue(0);
  const kevoScale = useSharedValue(0.6);
  const brandOpacity = useSharedValue(0);
  const brandY = useSharedValue(20);
  const subOpacity = useSharedValue(0);
  const barWidth = useSharedValue(0);
  const mountainOpacity = useSharedValue(0);

  useEffect(() => {
    // 1. Dağ silüeti belirir
    mountainOpacity.value = withTiming(1, { duration: 600 });

    // 2. Güneş doğar (yukarı çıkar + büyür)
    sunY.value = withDelay(200, withTiming(0, { duration: 1100, easing: Easing.out(Easing.cubic) }));
    sunScale.value = withDelay(200, withTiming(1, { duration: 1100, easing: Easing.out(Easing.back(1.1)) }));

    // 3. Güneş parıltısı (sürekli pulse)
    sunGlow.value = withDelay(900, withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.5, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      ),
      -1, true
    ));

    // 4. Kevo görünür
    kevoOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    kevoScale.value = withDelay(800, withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.3)) }));

    // 5. Logo + slogan
    brandOpacity.value = withDelay(1200, withTiming(1, { duration: 500 }));
    brandY.value = withDelay(1200, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
    subOpacity.value = withDelay(1700, withTiming(1, { duration: 400 }));

    // 6. Yükleme barı
    barWidth.value = withDelay(900, withTiming(100, {
      duration: 2400,
      easing: Easing.inOut(Easing.quad),
    }));

    const tm = setTimeout(() => router.replace("/welcome"), 3500);
    return () => clearTimeout(tm);
  }, []);

  const mountainStyle = useAnimatedStyle(() => ({ opacity: mountainOpacity.value }));
  const sunStyle = useAnimatedStyle(() => ({
    opacity: 1,
    transform: [{ translateY: sunY.value }, { scale: sunScale.value }],
  }));
  const sunGlowStyle = useAnimatedStyle(() => ({
    opacity: sunGlow.value * 0.6,
    transform: [{ scale: 1 + sunGlow.value * 0.1 }],
  }));
  const kevoStyle = useAnimatedStyle(() => ({
    opacity: kevoOpacity.value,
    transform: [{ scale: kevoScale.value }],
  }));
  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    transform: [{ translateY: brandY.value }],
  }));
  const subStyle = useAnimatedStyle(() => ({ opacity: subOpacity.value }));
  const barStyle = useAnimatedStyle(() => ({ width: `${barWidth.value}%` as `${number}%` }));

  return (
    <View style={styles.root}>
      {/* Sky gradient */}
      <LinearGradient
        colors={["#FFE4B0", "#FFD180", "#FFAB91"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Sun + glow */}
      <View style={styles.sunWrap}>
        <Animated.View style={[styles.sunGlow, sunGlowStyle]} />
        <Animated.View style={[styles.sun, sunStyle]} />
      </View>

      {/* Mountain silhouettes */}
      <Animated.View style={[styles.mountainsWrap, mountainStyle]}>
        {/* Back layer */}
        <View style={[styles.mountain, styles.mountainBack, { left: -40 }]} />
        <View style={[styles.mountain, styles.mountainBack, { left: width * 0.25 }]} />
        <View style={[styles.mountain, styles.mountainBack, { left: width * 0.55 }]} />
        {/* Front layer */}
        <View style={[styles.mountain, styles.mountainFront, { left: -80, height: 120 }]} />
        <View style={[styles.mountain, styles.mountainFront, { left: width * 0.35, height: 140 }]} />
        <View style={[styles.mountain, styles.mountainFront, { left: width * 0.7, height: 100 }]} />
      </Animated.View>

      {/* Ground */}
      <View style={styles.ground} />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.spacer} />

        <Animated.View style={[styles.kevoWrap, kevoStyle]}>
          <KevoMascot size={160} mood="happy" speaking idle={false} />
        </Animated.View>

        <Animated.View style={brandStyle}>
          <Text style={styles.brand}>KurdîBêje</Text>
        </Animated.View>

        <Animated.View style={[{ marginTop: 6 }, subStyle]}>
          <Text style={styles.tagline}>Türkçe konuşanlar için Kürtçe</Text>
          <Text style={styles.taglineSm}>Dağlardan gelen ses</Text>
        </Animated.View>

        <View style={styles.spacer} />

        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, barStyle]} />
        </View>
        <Text style={styles.loading}>Yükleniyor…</Text>

        <View style={{ height: 32 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.dawn },

  // Güneş
  sunWrap: {
    position: "absolute",
    top: "18%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  sun: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: BRAND.sun,
    shadowColor: BRAND.sun,
    shadowOpacity: 0.8,
    shadowRadius: 50,
    shadowOffset: { width: 0, height: 0 },
  },
  sunGlow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: BRAND.sunLight,
  },

  // Dağ silüetleri
  mountainsWrap: {
    position: "absolute",
    bottom: "22%",
    width: "100%",
    height: 200,
  },
  mountain: {
    position: "absolute",
    width: 0,
    height: 0,
    bottom: 0,
    borderStyle: "solid",
    borderLeftWidth: 130,
    borderRightWidth: 130,
    borderBottomWidth: 0,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  mountainBack: {
    borderTopWidth: 0,
    height: 100,
    borderTopColor: "transparent",
    backgroundColor: "transparent",
    width: 260,
    borderTopLeftRadius: 0,
    transform: [{ skewX: "0deg" }],
  },
  mountainFront: {},

  // Yer
  ground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "22%",
    backgroundColor: BRAND.mountainDark,
  },

  // İçerik
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingBottom: 16,
    alignItems: "center",
    zIndex: 2,
  },
  spacer: { flex: 1 },
  kevoWrap: { alignItems: "center" },
  brand: {
    fontSize: 44,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1,
    textAlign: "center",
    marginTop: 16,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  taglineSm: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: 4,
    fontStyle: "italic",
  },
  barTrack: {
    width: 160,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: BRAND.sun,
  },
  loading: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    marginTop: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});
