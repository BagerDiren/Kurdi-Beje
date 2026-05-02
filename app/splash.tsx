import { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withSpring, withRepeat, withSequence, Easing,
} from "react-native-reanimated";

import { KidCharacter } from "@/components/kids/kid-character";
import { KIDS_THEME, RADIUS, TYPO } from "@/components/kids/design";

const { width: SW } = Dimensions.get("window");

/**
 * KurdîBêje açılış ekranı — premium sinematik.
 *
 * Sahne kompozisyonu (3 sn):
 *  • Pembe→sarı→turkuaz gradient arka plan
 *  • Üstte parıldayan yıldızlar (3 farklı pozisyon)
 *  • Ortada Kevo (zıplayarak gelir)
 *  • Altta logo + tagline + yükleme barı
 *  • 4 köşede dekoratif balon emoji
 */
export default function SplashScreen() {
  // Animasyon state
  const kevoY = useSharedValue(80);
  const kevoOpacity = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(20);
  const tagOpacity = useSharedValue(0);
  const barWidth = useSharedValue(0);
  const star1 = useSharedValue(0);
  const star2 = useSharedValue(0);
  const star3 = useSharedValue(0);
  const balloon1 = useSharedValue(0);
  const balloon2 = useSharedValue(0);

  useEffect(() => {
    // Kevo zıplayarak gelir
    kevoOpacity.value = withTiming(1, { duration: 500 });
    kevoY.value = withSpring(0, { damping: 6, stiffness: 90 });

    // Logo
    logoOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    logoY.value = withDelay(500, withSpring(0, { damping: 10 }));

    // Tagline
    tagOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));

    // Yıldızlar parıldama döngüsü
    star1.value = withDelay(700, withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.3, { duration: 700 })),
      -1, true,
    ));
    star2.value = withDelay(900, withRepeat(
      withSequence(withTiming(1, { duration: 600 }), withTiming(0.3, { duration: 600 })),
      -1, true,
    ));
    star3.value = withDelay(1100, withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0.3, { duration: 800 })),
      -1, true,
    ));

    // Balonlar yumuşak salınım
    balloon1.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, false,
    );
    balloon2.value = withDelay(400, withRepeat(
      withSequence(
        withTiming(-10, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, false,
    ));

    // Yükleme barı 3sn'de dolar
    barWidth.value = withTiming(100, { duration: 2800, easing: Easing.inOut(Easing.quad) });

    // Welcome'a geçiş
    const t = setTimeout(() => router.replace("/welcome"), 3200);
    return () => clearTimeout(t);
  }, []);

  const kevoStyle = useAnimatedStyle(() => ({
    opacity: kevoOpacity.value,
    transform: [{ translateY: kevoY.value }],
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: tagOpacity.value }));
  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%` as `${number}%`,
  }));
  const star1Style = useAnimatedStyle(() => ({ opacity: star1.value }));
  const star2Style = useAnimatedStyle(() => ({ opacity: star2.value }));
  const star3Style = useAnimatedStyle(() => ({ opacity: star3.value }));
  const balloon1Style = useAnimatedStyle(() => ({ transform: [{ translateY: balloon1.value }] }));
  const balloon2Style = useAnimatedStyle(() => ({ transform: [{ translateY: balloon2.value }] }));

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#FFE0EC", "#FFF4DC", "#E0F7FA"] as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 4 köşe dekoratif balon */}
      <Animated.Text style={[styles.cornerEmoji, { top: 40, left: 30 }, balloon1Style]}>🎈</Animated.Text>
      <Animated.Text style={[styles.cornerEmoji, { top: 50, right: 30 }, balloon2Style]}>⭐</Animated.Text>
      <Animated.Text style={[styles.cornerEmoji, { bottom: 90, left: 40 }, balloon2Style]}>🎁</Animated.Text>
      <Animated.Text style={[styles.cornerEmoji, { bottom: 100, right: 30 }, balloon1Style]}>🌟</Animated.Text>

      {/* Parıldayan yıldızlar */}
      <Animated.Text style={[styles.starDeco, { top: 120, left: SW * 0.25 }, star1Style]}>✨</Animated.Text>
      <Animated.Text style={[styles.starDeco, { top: 80, right: SW * 0.30, fontSize: 22 }, star2Style]}>✨</Animated.Text>
      <Animated.Text style={[styles.starDeco, { top: 180, left: SW * 0.7 }, star3Style]}>✨</Animated.Text>

      {/* MERKEZ İÇERİK */}
      <View style={styles.center}>
        <Animated.View style={[styles.kevoCircle, kevoStyle]}>
          <KidCharacter character="kevo" size={150} bounce />
        </Animated.View>

        <Animated.View style={logoStyle}>
          <Text style={styles.logo}>KurdîBêje</Text>
          <View style={styles.logoUnderline} />
        </Animated.View>

        <Animated.Text style={[styles.tag, tagStyle]}>
          Kürtçe öğrenmenin{"\n"}<Text style={{ color: KIDS_THEME.primary }}>en eğlenceli</Text> yolu
        </Animated.Text>
      </View>

      {/* Alt: yükleme barı */}
      <View style={styles.bottom}>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, barStyle]}>
            <LinearGradient
              colors={[KIDS_THEME.primary, KIDS_THEME.yellowDark, KIDS_THEME.primary] as unknown as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        </View>
        <Text style={styles.loading}>HAZIRLANIYOR...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: KIDS_THEME.bg, alignItems: "center" },

  cornerEmoji: { position: "absolute", fontSize: 32, opacity: 0.85 },
  starDeco: { position: "absolute", fontSize: 18 },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  kevoCircle: {
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center", justifyContent: "center",
    shadowColor: KIDS_THEME.primary,
    shadowOpacity: 0.3, shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    borderWidth: 4, borderColor: "#fff",
  },
  logo: {
    fontSize: 46,
    fontWeight: "900",
    color: KIDS_THEME.ink,
    letterSpacing: -1.4,
    textAlign: "center",
    marginTop: 12,
    textShadowColor: KIDS_THEME.primary + "33",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  logoUnderline: {
    width: 80, height: 5, borderRadius: 3,
    backgroundColor: KIDS_THEME.primary,
    alignSelf: "center", marginTop: 6,
  },
  tag: {
    ...TYPO.h3,
    color: KIDS_THEME.graphite,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 24,
  },

  bottom: {
    paddingHorizontal: 32,
    paddingBottom: 60,
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  barTrack: {
    width: 200, height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 3 },
  loading: {
    ...TYPO.caption,
    color: KIDS_THEME.smoke,
    letterSpacing: 2.5,
  },
});
