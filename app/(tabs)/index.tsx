import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { KevoMascot } from "@/components/kevo-mascot";
import { Bar } from "@/components/ui-kit";
import { useApp } from "@/data/app-context";

export default function HomeLearnTab() {
  const { th, t, lvl, xp, streak, hearts, completed, levelLessons, lessonsToday, correctToday, startLesson } = useApp();

  const lessons = levelLessons.map((l, i) => ({
    ...l,
    completed: completed.includes(l.id),
    current: !completed.includes(l.id) && (i === 0 || completed.includes(levelLessons[i - 1]?.id)),
    locked: i > 0 && !completed.includes(levelLessons[i - 1]?.id) && !completed.includes(l.id),
  }));

  const goalsPct = Math.round((
    Math.min(xp, 50) / 50 * 0.35 +
    Math.min(lessonsToday, 1) / 1 * 0.25 +
    Math.min(correctToday, 5) / 5 * 0.25 +
    (streak > 0 ? 1 : 0) * 0.15
  ) * 100);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <LinearGradient colors={th.headerGrad as unknown as string[]} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerHello}>{t.hello}! 👋</Text>
              <Text style={styles.headerSub}>{t.todayCont}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{lvl?.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            {[
              { i: "🔥", v: streak, l: t.streak },
              { i: "⭐", v: xp, l: "XP" },
              { i: "❤️", v: `${hearts}/5`, l: t.hearts },
              { i: "🏆", v: lvl?.toUpperCase(), l: t.level },
            ].map((s, idx) => (
              <View key={idx} style={styles.stat}>
                <Text style={{ fontSize: 17 }}>{s.i}</Text>
                <Text style={styles.statVal}>{s.v}</Text>
                <Text style={styles.statLabel}>{s.l}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Kevo greeting */}
        <View style={[styles.kevoRow, { backgroundColor: th.primary + "10", borderColor: th.primary + "20" }]}>
          <KevoMascot size={48} mood="happy" />
          <View style={[styles.kevoBubble, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
            <Text style={{ fontSize: 12, color: th.text, fontWeight: "600" }}>{t.touchKevo}</Text>
          </View>
        </View>

        {/* Goals summary */}
        <Pressable onPress={() => router.push("/goals")} style={[styles.goalCard, { borderColor: th.cardBorder }]}>
          <LinearGradient colors={th.goalGrad as unknown as string[]} style={styles.goalGrad}>
            <View style={styles.goalIcon}>
              <Text style={{ fontSize: 22 }}>🎯</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.goalTitle, { color: th.primaryDark }]}>{t.dailyGoal}</Text>
              <View style={[styles.goalBar, { backgroundColor: "rgba(255,255,255,0.6)" }]}>
                <LinearGradient colors={[th.primary, th.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.goalBarFill, { width: `${goalsPct}%` }]} />
              </View>
            </View>
            <Text style={[styles.goalPct, { color: th.primaryDark }]}>{goalsPct}%</Text>
            <Text style={{ fontSize: 16, color: th.primary }}>→</Text>
          </LinearGradient>
        </Pressable>

        {/* Lesson path */}
        <Text style={[styles.sectionTitle, { color: th.text }]}>📚 {t.lessons} ({lvl?.toUpperCase()})</Text>

        <View style={styles.path}>
          {lessons.map((l, i) => {
            const isLeft = i % 2 === 0;
            const nodeSize = l.current ? 56 : 48;

            return (
              <View key={l.id} style={[styles.pathRow, { justifyContent: isLeft ? "flex-start" : "flex-end" }]}>
                <Pressable
                  onPress={() => !l.locked && l.steps && startLesson(l)}
                  disabled={l.locked || !l.steps}
                  style={[styles.lessonNode, {
                    backgroundColor: l.locked ? th.bgDark : l.current ? th.accent + "15" : th.card,
                    borderColor: l.current ? th.accent : l.completed ? th.correct + "40" : th.cardBorder,
                    borderWidth: l.current ? 2.5 : 1.5,
                    opacity: l.locked ? 0.35 : 1,
                  }]}
                >
                  <View style={[styles.lessonIcon, {
                    width: nodeSize, height: nodeSize,
                    backgroundColor: l.completed ? th.correct : l.current ? th.accent : th.bgDark,
                  }]}>
                    <Text style={{ fontSize: l.current ? 24 : 20 }}>{l.locked ? "🔒" : l.completed ? "👑" : l.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.lessonTitle, { color: th.text }]} numberOfLines={1}>{l.title}</Text>
                    <Text style={{ fontSize: 10, color: th.textLight }}>{l.titleTr}{!l.steps ? " 🔜" : ""}</Text>
                    {l.completed && <Text style={{ fontSize: 9, color: th.correct, fontWeight: "600", marginTop: 2 }}>✓ Qediya · +{l.xp} XP</Text>}
                    {l.current && l.steps && <Text style={{ fontSize: 9, color: th.accent, fontWeight: "700", marginTop: 2 }}>▶ {t.cont}</Text>}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 30 },
  header: { padding: 18, paddingBottom: 22, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  headerHello: { fontSize: 17, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  levelBadge: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  levelBadgeText: { fontSize: 11, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 10 },
  stat: { alignItems: "center", gap: 2 },
  statVal: { fontSize: 14, fontWeight: "800", color: "#fff" },
  statLabel: { fontSize: 9, color: "rgba(255,255,255,0.6)" },
  kevoRow: { marginHorizontal: 18, marginTop: 14, marginBottom: 8, padding: 10, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1 },
  kevoBubble: { flex: 1, borderRadius: 12, padding: 8, borderWidth: 1 },
  goalCard: { marginHorizontal: 18, marginBottom: 10, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  goalGrad: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  goalIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.8)", alignItems: "center", justifyContent: "center" },
  goalTitle: { fontSize: 13, fontWeight: "800" },
  goalBar: { height: 6, borderRadius: 3, overflow: "hidden", marginTop: 6 },
  goalBarFill: { height: "100%", borderRadius: 3 },
  goalPct: { fontSize: 16, fontWeight: "800" },
  sectionTitle: { fontSize: 13, fontWeight: "700", marginHorizontal: 18, marginBottom: 12, marginTop: 8 },
  path: { paddingHorizontal: 18, paddingBottom: 20 },
  pathRow: { flexDirection: "row", paddingVertical: 4 },
  lessonNode: { width: "60%", flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 16 },
  lessonIcon: { borderRadius: 14, alignItems: "center", justifyContent: "center" },
  lessonTitle: { fontSize: 13, fontWeight: "700" },
});
