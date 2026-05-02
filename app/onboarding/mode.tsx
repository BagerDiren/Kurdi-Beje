import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { KidCharacter } from "@/components/kids/kid-character";
import { KIDS_THEME, RADIUS, SHADOW, SPACING, TYPO } from "@/components/kids/design";
import { useApp } from "@/data/app-context";

/**
 * Yaş grubu seçimi — premium tasarım sistemi.
 * Çocuk → renkli/oyunlu mod
 * Yetişkin → profesyonel mod (kategori sistemi)
 */
export default function ModeScreen() {
  const { age, setAge, setLvl } = useApp();

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

      <SafeAreaView style={styles.safe}>
        {/* Üst: Kevo selamlıyor */}
        <View style={styles.heroSlot}>
          <KidCharacter character="kevo" size={110} bounce />
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>Senin için en iyi{"\n"}deneyimi seç!</Text>
          <Text style={styles.sub}>Yaş grubuna göre uygulama kişiselleşir</Text>
        </View>

        {/* 2 mod kartı */}
        <View style={styles.cards}>
          <ModeCard
            label="Çocuk"
            sublabel="4 - 12 yaş"
            description="Renkli oyunlar, çizgi filmler, şarkılar"
            emoji="🧒"
            features={["🎮", "🎨", "🎵", "📺"]}
            isActive={age === "child"}
            color={KIDS_THEME.primary}
            colorDark={KIDS_THEME.primaryDark}
            onPress={() => setAge("child")}
          />
          <ModeCard
            label="Yetişkin"
            sublabel="13+ yaş"
            description="Yapılandırılmış dersler, kategoriler, lig"
            emoji="🧑"
            features={["📚", "🏆", "🎯", "📊"]}
            isActive={age === "adult"}
            color={KIDS_THEME.green}
            colorDark={KIDS_THEME.greenDark}
            onPress={() => setAge("adult")}
          />
        </View>

        <View style={{ flex: 1 }} />

        {/* CTA */}
        <Pressable
          onPress={continueFlow}
          disabled={!age}
          style={({ pressed }) => [
            styles.cta,
            !age && { opacity: 0.4 },
            age && SHADOW(age === "child" ? KIDS_THEME.primary : KIDS_THEME.green, "lg"),
            pressed && age && { transform: [{ scale: 0.97 }] },
          ]}
        >
          <LinearGradient
            colors={
              age === "child"
                ? [KIDS_THEME.primary, KIDS_THEME.primaryDark] as unknown as readonly [string, string, ...string[]]
                : age === "adult"
                ? [KIDS_THEME.green, KIDS_THEME.greenDark] as unknown as readonly [string, string, ...string[]]
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
//  MOD KARTI
// =====================================================================
function ModeCard({
  label, sublabel, description, emoji, features, isActive, color, colorDark, onPress,
}: {
  label: string;
  sublabel: string;
  description: string;
  emoji: string;
  features: string[];
  isActive: boolean;
  color: string;
  colorDark: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: isActive ? color : "rgba(0,0,0,0.06)",
          borderWidth: isActive ? 3 : 1.5,
          backgroundColor: isActive ? color + "10" : KIDS_THEME.card,
          transform: [{ scale: isActive ? 1.02 : pressed ? 0.98 : 1 }],
        },
        isActive ? SHADOW(color, "md") : SHADOW("#000", "sm"),
      ]}
    >
      <View style={[styles.cardIcon, { backgroundColor: isActive ? color : color + "22" }]}>
        <Text style={{ fontSize: 36 }}>{emoji}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.cardLabel, { color: isActive ? color : KIDS_THEME.ink }]}>{label}</Text>
        <Text style={styles.cardSub}>{sublabel}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{description}</Text>
        <View style={styles.cardTags}>
          {features.map((f, i) => (
            <View key={i} style={[styles.cardTag, { backgroundColor: isActive ? color + "22" : "#0000000A" }]}>
              <Text style={{ fontSize: 14 }}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      {isActive && (
        <View style={[styles.cardCheck, { backgroundColor: color }]}>
          <Text style={{ color: "#fff", fontFamily: "Fredoka_700Bold", fontSize: 14 }}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: KIDS_THEME.bg },
  safe: { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: SPACING.lg },

  heroSlot: { alignItems: "center", marginBottom: SPACING.lg },

  titleBlock: { alignItems: "center", gap: 6, marginBottom: SPACING.xl },
  title: {
    ...TYPO.display,
    color: KIDS_THEME.ink,
    textAlign: "center",
    lineHeight: 32,
  },
  sub: {
    ...TYPO.body,
    color: KIDS_THEME.smoke,
    textAlign: "center",
  },

  cards: { gap: SPACING.md },
  card: {
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    alignItems: "center",
  },
  cardIcon: {
    width: 72, height: 72, borderRadius: RADIUS.lg,
    alignItems: "center", justifyContent: "center",
  },
  cardLabel: { ...TYPO.h1 },
  cardSub: { ...TYPO.caption, color: KIDS_THEME.smoke, marginTop: 2 },
  cardDesc: { ...TYPO.body, color: KIDS_THEME.graphite, marginTop: 6, lineHeight: 18 },
  cardTags: { flexDirection: "row", gap: 6, marginTop: 8 },
  cardTag: {
    width: 30, height: 30, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  cardCheck: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },

  // CTA
  cta: { borderRadius: RADIUS.xl, overflow: "hidden" },
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
