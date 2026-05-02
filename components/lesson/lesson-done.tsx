import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { KevoMascot } from "@/components/kevo-mascot";
import type { Lesson } from "@/data/lessons";
import type { AppTheme } from "@/data/themes";
import type { Translations } from "@/data/translations";

type Props = {
  lesson: Lesson;
  cc: number;
  tq: number;
  onFinish: () => void;
  th: AppTheme;
  t: Translations;
};

export function LessonDone({ lesson, cc, tq, onFinish, th, t }: Props) {
  const pct = tq > 0 ? Math.round((cc / tq) * 100) : 100;
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
  const isPerfect = pct === 100;

  // Animasyonlar
  const xpAnim = useRef(new Animated.Value(0)).current;
  const starAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const headerScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Header pop
    Animated.spring(headerScale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();

    // Stars: sırayla pop
    starAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(300 + i * 250),
        Animated.spring(anim, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    });

    // XP sayım animasyonu
    Animated.timing(xpAnim, {
      toValue: lesson.xp,
      duration: 1200,
      delay: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const xpText = xpAnim.interpolate({
    inputRange: [0, lesson.xp],
    outputRange: ["0", String(lesson.xp)],
  });

  // Encouraging message
  const messages = {
    perfect: { ku: "Bêkêmasî! Tu lehengî!", tr: "Kusursuz! Sen kahramansın!" },
    great:   { ku: "Pir baş!", tr: "Çok iyi!" },
    good:    { ku: "Aferîn, dewam bike!", tr: "Aferin, devam et!" },
    keep:    { ku: "Tekrar bike, tu yê fêr bibî!", tr: "Tekrarla, öğreneceksin!" },
  };
  const msg = isPerfect ? messages.perfect : pct >= 70 ? messages.great : pct >= 50 ? messages.good : messages.keep;

  return (
    <View style={{ flex: 1, backgroundColor: th.bg }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Hero header with gradient */}
        <Animated.View
          style={[
            styles.heroWrap,
            { transform: [{ scale: headerScale }] },
          ]}
        >
          <LinearGradient
            colors={isPerfect ? ["#FFC200", "#F49000"] : (th.headerGrad as unknown as readonly [string, string, ...string[]])}
            style={styles.hero}
          >
            <View style={styles.kevoBox}>
              <KevoMascot size={100} mood="happy" speaking />
            </View>
            <Text style={styles.heroTitle}>{isPerfect ? "🎉 Bêkêmasî!" : "🎓 Ders Qediya!"}</Text>
            <Text style={styles.heroSub}>"{lesson.title}"</Text>
          </LinearGradient>
        </Animated.View>

        {/* Stars */}
        <View style={styles.starsRow}>
          {[0, 1, 2].map((i) => (
            <Animated.Text
              key={i}
              style={[
                styles.star,
                {
                  opacity: starAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.15, i < stars ? 1 : 0.15] }),
                  transform: [
                    {
                      scale: starAnims[i].interpolate({
                        inputRange: [0, 1, 1.5],
                        outputRange: [0.5, 1.2, 1],
                        extrapolate: "clamp",
                      }),
                    },
                  ],
                },
              ]}
            >
              ⭐
            </Animated.Text>
          ))}
        </View>

        <Text style={[styles.encourage, { color: th.primary }]}>{msg.ku}</Text>
        <Text style={[styles.encourageSub, { color: th.textMid }]}>{msg.tr}</Text>

        {/* XP card with animated count */}
        <View style={[styles.xpCard, { backgroundColor: th.accent + "18", borderColor: th.accent }]}>
          <Text style={{ fontSize: 30 }}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: th.textLight, fontWeight: "700" }}>XP WERGIRT</Text>
            <View style={styles.xpRow}>
              <Text style={{ fontSize: 11, color: th.text, fontWeight: "700" }}>+</Text>
              <Animated.Text style={[styles.xpVal, { color: th.accent }]}>
                {xpText}
              </Animated.Text>
            </View>
          </View>
          {isPerfect && (
            <View style={[styles.bonusBadge, { backgroundColor: "#FFC200" }]}>
              <Text style={{ fontSize: 10, fontWeight: "900", color: "#fff" }}>BONUS</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
          {tq > 0 && (
            <View style={styles.statRow}>
              <Text style={{ fontSize: 13, color: th.textMid, fontWeight: "600" }}>✅ Bersivên rast</Text>
              <Text style={{ fontWeight: "900", color: th.correct, fontSize: 15 }}>{cc}/{tq}</Text>
            </View>
          )}
          <View style={styles.statRow}>
            <Text style={{ fontSize: 13, color: th.textMid, fontWeight: "600" }}>🎯 Serkeftin</Text>
            <Text style={{ fontWeight: "900", color: th.primary, fontSize: 15 }}>{pct}%</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={{ fontSize: 13, color: th.textMid, fontWeight: "600" }}>📚 Gavên qediya</Text>
            <Text style={{ fontWeight: "900", color: th.text, fontSize: 15 }}>{lesson.steps?.length ?? 0}</Text>
          </View>
        </View>

        {/* Words learned tags */}
        {lesson.steps && (() => {
          const learnedWords = lesson.steps
            .filter((s) => s.type === "teach" || s.type === "scene")
            .slice(0, 8);
          if (learnedWords.length === 0) return null;
          return (
            <View style={[styles.wordsBox, { backgroundColor: th.primary + "12", borderColor: th.primary + "33" }]}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: th.primary, marginBottom: 8, letterSpacing: 0.4 }}>
                🔤 PEYVÊN NÛ FÊR BÛYÎ
              </Text>
              <View style={styles.wordTags}>
                {learnedWords.map((s, i) => (
                  <View key={i} style={[styles.tag, { backgroundColor: th.card, borderColor: th.primary + "40" }]}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: th.primary }}>
                      {s.type === "teach" ? s.word : s.type === "scene" ? s.verb : ""}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })()}

        <View style={{ height: 12 }} />

        {/* Continue button */}
        <Pressable onPress={onFinish} style={[styles.contBtn, { backgroundColor: th.primary }]}>
          <Text style={styles.contBtnText}>BERDEWAM BIKE →</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 32, gap: 12, alignItems: "center" },
  heroWrap: { width: "100%", borderRadius: 24, overflow: "hidden" },
  hero: {
    paddingVertical: 28, paddingHorizontal: 20,
    alignItems: "center", borderRadius: 24,
  },
  kevoBox: { width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: 26, fontWeight: "900", color: "#fff", marginTop: 14 },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 4, fontWeight: "600" },

  starsRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  star: { fontSize: 48 },

  encourage: { fontSize: 18, fontWeight: "900", marginTop: 4, textAlign: "center" },
  encourageSub: { fontSize: 12, fontWeight: "500", textAlign: "center" },

  xpCard: {
    width: "100%",
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, borderRadius: 18, borderWidth: 2,
  },
  xpRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  xpVal: { fontSize: 30, fontWeight: "900" },
  bonusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },

  statsCard: { width: "100%", borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  wordsBox: { width: "100%", borderRadius: 16, padding: 14, borderWidth: 1.5 },
  wordTags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },

  contBtn: {
    width: "100%", padding: 18, borderRadius: 18, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  contBtnText: { fontSize: 15, fontWeight: "900", color: "#fff", letterSpacing: 1 },
});
