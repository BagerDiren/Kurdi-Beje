import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/data/app-context";
import { CATEGORIES } from "@/data/categories";
import { ACHIEVEMENTS, computeAchievements } from "@/data/achievements";

export default function AchievementsScreen() {
  const { th, xp, streak, completed } = useApp();
  const lessonsCompleted = completed.length;
  const categoriesCompleted = CATEGORIES.filter(
    (c) => c.lessons.length > 0 && c.lessons.every((l) => completed.includes(l.id)),
  ).length;
  const list = computeAchievements({ xp, streak, lessonsCompleted, categoriesCompleted });

  const unlocked = list.filter((a) => a.unlocked);
  const locked = list.filter((a) => !a.unlocked);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
      <LinearGradient colors={th.headerGrad as unknown as readonly [string, string, ...string[]]} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 18, color: "#fff" }}>←</Text>
          </Pressable>
          <Text style={styles.title}>🏆 Madalya</Text>
        </View>
        <Text style={styles.sub}>
          {unlocked.length} / {ACHIEVEMENTS.length} vekirî · {Math.round((unlocked.length / ACHIEVEMENTS.length) * 100)}%
        </Text>
        <View style={[styles.headerBar, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
          <View style={[styles.headerBarFill, { width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }]} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {unlocked.length > 0 && (
          <>
            <Text style={[styles.section, { color: th.text }]}>🎉 Vekirî ({unlocked.length})</Text>
            <View style={styles.grid}>
              {unlocked.map((a) => (
                <View
                  key={a.achievement.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: a.achievement.color + "18",
                      borderColor: a.achievement.color,
                    },
                  ]}
                >
                  <View style={[styles.iconBox, { backgroundColor: a.achievement.color + "30" }]}>
                    <Text style={{ fontSize: 32 }}>{a.achievement.icon}</Text>
                  </View>
                  <Text style={[styles.cardTitle, { color: th.text }]} numberOfLines={2}>
                    {a.achievement.title}
                  </Text>
                  <Text style={[styles.cardSub, { color: th.textMid }]} numberOfLines={2}>
                    {a.achievement.titleTr}
                  </Text>
                  <Text style={{ fontSize: 9, color: a.achievement.color, fontWeight: "800", marginTop: 4 }}>
                    ✓ VEKIRÎ
                  </Text>
                  {a.achievement.xpReward && (
                    <Text style={{ fontSize: 9, color: th.accent, fontWeight: "700" }}>
                      +{a.achievement.xpReward} XP
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {locked.length > 0 && (
          <>
            <Text style={[styles.section, { color: th.text, marginTop: 16 }]}>
              🔒 Girtî ({locked.length})
            </Text>
            <View style={styles.grid}>
              {locked.map((a) => (
                <View
                  key={a.achievement.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: th.card,
                      borderColor: th.cardBorder,
                      opacity: 0.7,
                    },
                  ]}
                >
                  <View style={[styles.iconBox, { backgroundColor: th.bgDark }]}>
                    <Text style={{ fontSize: 28, opacity: 0.5 }}>{a.achievement.icon}</Text>
                  </View>
                  <Text style={[styles.cardTitle, { color: th.text }]} numberOfLines={2}>
                    {a.achievement.title}
                  </Text>
                  <Text style={[styles.cardSub, { color: th.textMid }]} numberOfLines={2}>
                    {a.achievement.titleTr}
                  </Text>
                  <View style={[styles.progBar, { backgroundColor: th.bgDark }]}>
                    <View
                      style={[
                        styles.progFill,
                        { width: `${a.pct}%`, backgroundColor: a.achievement.color },
                      ]}
                    />
                  </View>
                  <Text style={{ fontSize: 9, color: th.textLight, fontWeight: "700", marginTop: 2 }}>
                    {a.current}/{a.achievement.threshold}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "900", color: "#fff" },
  sub: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 4, fontWeight: "700" },
  headerBar: { height: 6, borderRadius: 3, marginTop: 10, overflow: "hidden" },
  headerBarFill: { height: "100%", borderRadius: 3, backgroundColor: "#FFC200" },
  scroll: { padding: 18, paddingBottom: 30 },
  section: { fontSize: 13, fontWeight: "800", marginBottom: 8, letterSpacing: 0.3 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: {
    width: "31.5%",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    minHeight: 130,
  },
  iconBox: {
    width: 54, height: 54, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    marginBottom: 6,
  },
  cardTitle: { fontSize: 11, fontWeight: "800", textAlign: "center" },
  cardSub: { fontSize: 9, fontWeight: "600", textAlign: "center", marginTop: 1 },
  progBar: { width: "100%", height: 4, borderRadius: 2, overflow: "hidden", marginTop: 6 },
  progFill: { height: "100%", borderRadius: 2 },
});
