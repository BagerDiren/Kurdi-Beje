import { View, Text, Pressable, StyleSheet, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

import { KidCharacter } from "@/components/kids/kid-character";
import { KIDS_THEME, RADIUS, SHADOW, SPACING, TYPO } from "@/components/kids/design";
import { useApp } from "@/data/app-context";

const { width: SW } = Dimensions.get("window");

/**
 * Yaş grubu seçimi — Lingokids tarzı zengin görselli kartlar.
 *
 * Çocuk kartı: pembe gradient + Pexels mutlu çocuk fotoğrafı
 *               + Kevo karakteri overlay + 4 özellik chip
 * Yetişkin kartı: yeşil gradient + Pexels öğrenme/kitap fotoğrafı
 *                 + sofistike "Yetişkin" simgesi + 4 özellik chip
 */

// Telifsiz Pexels — çocuk eğlenceli illustrasyon ve yetişkin öğrenme
const KID_PHOTO   = "https://images.pexels.com/photos/8612967/pexels-photo-8612967.jpeg?auto=compress&cs=tinysrgb&w=600";
const ADULT_PHOTO = "https://images.pexels.com/photos/3768132/pexels-photo-3768132.jpeg?auto=compress&cs=tinysrgb&w=600";

export default function ModeScreen() {
  const { age, setAge, setLvl } = useApp();

  // Sürekli arka plan emoji animasyonu
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);

  useEffect(() => {
    float1.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, false,
    );
    float2.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
        withTiming(-14, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, false,
    );
  }, []);

  const f1 = useAnimatedStyle(() => ({ transform: [{ translateY: float1.value }] }));
  const f2 = useAnimatedStyle(() => ({ transform: [{ translateY: float2.value }] }));

  const continueFlow = () => {
    if (!age) return;
    setLvl("a1");
    if (age === "child") {
      router.push("/onboarding/language");
    } else {
      router.push("/intro/hello");
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#FFE0EC", "#FFF4DC", "#E1F5FE"] as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Dekoratif yüzen emoji'ler */}
      <Animated.Text style={[styles.deco, { top: 60, left: 30 }, f1]}>🎈</Animated.Text>
      <Animated.Text style={[styles.deco, { top: 90, right: 40 }, f2]}>⭐</Animated.Text>
      <Animated.Text style={[styles.deco, { top: 200, left: 16, fontSize: 24 }, f2]}>✨</Animated.Text>
      <Animated.Text style={[styles.deco, { top: 180, right: 20, fontSize: 24 }, f1]}>🌟</Animated.Text>

      <SafeAreaView style={styles.safe}>
        {/* Üst başlık */}
        <View style={styles.header}>
          <KidCharacter character="kevo" size={80} bounce />
          <Text style={styles.title}>Sen kimsin?</Text>
          <Text style={styles.subtitle}>Sana özel bir öğrenme deneyimi hazırlayalım</Text>
        </View>

        {/* 2 Kart YAN YANA TAM EKRAN */}
        <View style={styles.cards}>
          {/* === ÇOCUK === */}
          <ModeCard
            isActive={age === "child"}
            onPress={() => setAge("child")}
            label="Çocuk"
            sublabel="4 - 12 yaş"
            description="Renkli oyunlar, çizgi filmler, şarkılar"
            features={[
              { emoji: "🎮", text: "Oyunlar" },
              { emoji: "📺", text: "Çizgi" },
              { emoji: "🎵", text: "Şarkı" },
              { emoji: "🎨", text: "Renkli" },
            ]}
            photo={KID_PHOTO}
            color1="#FF6B9D"
            color2="#E91E63"
            characterEmoji="🧒"
          />

          {/* === YETİŞKİN === */}
          <ModeCard
            isActive={age === "adult"}
            onPress={() => setAge("adult")}
            label="Yetişkin"
            sublabel="13+ yaş"
            description="Yapılandırılmış dersler, kategoriler, lig"
            features={[
              { emoji: "📚", text: "Dersler" },
              { emoji: "🏆", text: "Lig" },
              { emoji: "🎯", text: "Hedef" },
              { emoji: "📊", text: "İlerleme" },
            ]}
            photo={ADULT_PHOTO}
            color1="#43A571"
            color2="#1B5E20"
            characterEmoji="🧑"
          />
        </View>

        {/* CTA */}
        <Pressable
          onPress={continueFlow}
          disabled={!age}
          style={({ pressed }) => [
            styles.cta,
            !age && { opacity: 0.4 },
            age && SHADOW(age === "child" ? "#FF6B9D" : "#43A571", "lg"),
            pressed && age && { transform: [{ scale: 0.97 }] },
          ]}
        >
          <LinearGradient
            colors={
              age === "child"
                ? ["#FF6B9D", "#E91E63"] as unknown as readonly [string, string, ...string[]]
                : age === "adult"
                ? ["#43A571", "#1B5E20"] as unknown as readonly [string, string, ...string[]]
                : ["#CCC", "#AAA"] as unknown as readonly [string, string, ...string[]]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGrad}
          >
            <Text style={styles.ctaText}>
              {age ? "DEVAM ET" : "BİR GRUP SEÇ"}
            </Text>
            {age && <Text style={styles.ctaArrow}>→</Text>}
          </LinearGradient>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

// =====================================================================
//  MOD KARTI - büyük, foto'lu, gradient'li
// =====================================================================
function ModeCard({
  isActive, onPress, label, sublabel, description, features, photo, color1, color2, characterEmoji,
}: {
  isActive: boolean; onPress: () => void;
  label: string; sublabel: string; description: string;
  features: { emoji: string; text: string }[];
  photo: string; color1: string; color2: string;
  characterEmoji: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        SHADOW(isActive ? color1 : "#000", isActive ? "lg" : "md"),
        {
          transform: [{ scale: isActive ? 1.02 : pressed ? 0.98 : 1 }],
          borderColor: isActive ? color1 : "rgba(0,0,0,0.06)",
          borderWidth: isActive ? 4 : 2,
        },
      ]}
    >
      {/* Foto bg */}
      <Image source={{ uri: photo }} style={styles.cardPhoto} resizeMode="cover" />

      {/* Gradient overlay */}
      <LinearGradient
        colors={[color1 + "77", color2 + "DD"] as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* İçerik */}
      <View style={styles.cardContent}>
        {/* Üst: ikon + label */}
        <View style={styles.cardTop}>
          <View style={styles.cardEmojiCircle}>
            <Text style={{ fontSize: 32 }}>{characterEmoji}</Text>
          </View>
          {isActive && (
            <View style={styles.checkBadge}>
              <Text style={{ color: color1, fontSize: 16, fontFamily: "Fredoka_700Bold" }}>✓</Text>
            </View>
          )}
        </View>

        {/* Orta: title + desc */}
        <View style={{ flex: 1 }}>
          <Text style={styles.cardLabel}>{label}</Text>
          <Text style={styles.cardSublabel}>{sublabel}</Text>
          <Text style={styles.cardDesc}>{description}</Text>
        </View>

        {/* Alt: features */}
        <View style={styles.cardFeatures}>
          {features.map((f, i) => (
            <View key={i} style={styles.cardFeature}>
              <Text style={{ fontSize: 16 }}>{f.emoji}</Text>
              <Text style={styles.cardFeatureText}>{f.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: KIDS_THEME.bg },
  safe: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.lg },

  deco: { position: "absolute", fontSize: 32, opacity: 0.85 },

  header: { alignItems: "center", marginBottom: SPACING.lg, gap: 8 },
  title: { ...TYPO.display, color: KIDS_THEME.ink, textAlign: "center", marginTop: 4 },
  subtitle: { ...TYPO.body, color: KIDS_THEME.smoke, textAlign: "center" },

  cards: {
    flex: 1,
    flexDirection: "row",
    gap: SPACING.md,
    marginVertical: SPACING.md,
  },

  // Kart — TAM ekran yükseklik
  card: {
    flex: 1,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    backgroundColor: KIDS_THEME.card,
    minHeight: 380,
  },
  cardPhoto: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: "space-between",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardEmojiCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.6)",
  },
  checkBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  cardLabel: {
    ...TYPO.display,
    color: "#fff",
    fontSize: 24,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  cardSublabel: {
    ...TYPO.body,
    color: "rgba(255,255,255,0.95)",
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardDesc: {
    ...TYPO.bodyReg,
    color: "rgba(255,255,255,0.95)",
    marginTop: 8,
    lineHeight: 18,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardFeatures: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: SPACING.md,
  },
  cardFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cardFeatureText: { ...TYPO.caption, color: KIDS_THEME.ink, fontSize: 10 },

  // CTA
  cta: { borderRadius: RADIUS.xl, overflow: "hidden", marginTop: SPACING.md },
  ctaGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  ctaText: { ...TYPO.button, color: "#fff" },
  ctaArrow: { fontSize: 22, color: "#fff", fontFamily: "Fredoka_700Bold" },
});
