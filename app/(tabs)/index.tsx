import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { KevoMascot } from "@/components/kevo-mascot";
import { useApp } from "@/data/app-context";
import { CATEGORIES, LEVELS, type Category } from "@/data/categories";
import type { LevelKey } from "@/data/lessons";

export default function HomeLearnTab() {
  const { age } = useApp();
  if (age === "adult") return <AdultHome />;
  return <ChildHome />;
}

// =====================================================================
//  YETİŞKİN — TEMA (KATEGORİ) GRID
// =====================================================================

function AdultHome() {
  const { th, t, lvl, xp, streak, hearts, completed, lessonsToday, correctToday, setActiveCategory } = useApp();
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>(lvl ?? "a1");

  const goalsPct = Math.round((
    Math.min(xp, 50) / 50 * 0.35 +
    Math.min(lessonsToday, 1) / 1 * 0.25 +
    Math.min(correctToday, 5) / 5 * 0.25 +
    (streak > 0 ? 1 : 0) * 0.15
  ) * 100);

  const filteredCats = CATEGORIES.filter((c) => c.level === selectedLevel);

  const openCategory = (cat: Category) => {
    setActiveCategory(cat.key);
    router.push("/category" as never);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <LinearGradient colors={th.headerGrad as unknown as string[]} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerHello}>{t.hello}, hevalê min! 👋</Text>
              <Text style={styles.headerSub}>Em fêr bibin, gav bi gav.</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{selectedLevel.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            {[
              { i: "🔥", v: streak, l: t.streak },
              { i: "⭐", v: xp, l: "XP" },
              { i: "❤️", v: `${hearts}/5`, l: t.hearts },
              { i: "📚", v: completed.length, l: "Ders" },
            ].map((s, idx) => (
              <View key={idx} style={styles.stat}>
                <Text style={{ fontSize: 17 }}>{s.i}</Text>
                <Text style={styles.statVal}>{s.v}</Text>
                <Text style={styles.statLabel}>{s.l}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Goal card */}
        <Pressable onPress={() => router.push("/goals")} style={[styles.goalCard, { borderColor: th.cardBorder }]}>
          <LinearGradient colors={th.goalGrad as unknown as string[]} style={styles.goalGrad}>
            <View style={styles.goalIcon}>
              <Text style={{ fontSize: 22 }}>🎯</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.goalTitle, { color: th.text }]}>{t.dailyGoal}</Text>
              <View style={[styles.goalBar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <LinearGradient
                  colors={[th.primary, th.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.goalBarFill, { width: `${goalsPct}%` }]}
                />
              </View>
            </View>
            <Text style={[styles.goalPct, { color: th.text }]}>{goalsPct}%</Text>
          </LinearGradient>
        </Pressable>

        {/* Level tabs */}
        <Text style={[styles.sectionTitle, { color: th.text }]}>📚 Astên Fêrbûnê (Seviyeler)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.levelTabs}
        >
          {LEVELS.map((lv) => {
            const active = lv.key === selectedLevel;
            return (
              <Pressable
                key={lv.key}
                onPress={() => setSelectedLevel(lv.key)}
                style={[
                  styles.levelTab,
                  {
                    backgroundColor: active ? th.primary : th.card,
                    borderColor: active ? th.primary : th.cardBorder,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color: active ? "#fff" : th.text,
                  }}
                >
                  {lv.titleTr}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: active ? "rgba(255,255,255,0.85)" : th.textLight,
                    marginTop: 2,
                  }}
                >
                  {lv.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Category grid */}
        <Text style={[styles.sectionTitle, { color: th.text, marginTop: 14 }]}>
          🗂️ Mijaran ({filteredCats.length} bab)
        </Text>

        <View style={styles.grid}>
          {filteredCats.map((cat) => {
            const lessonIds = cat.lessons.map((l) => l.id);
            const doneCount = lessonIds.filter((id) => completed.includes(id)).length;
            const totalLessons = cat.lessons.length;
            const pct = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;
            return (
              <Pressable
                key={cat.key}
                onPress={() => openCategory(cat)}
                style={[
                  styles.catCard,
                  {
                    backgroundColor: th.card,
                    borderColor: doneCount > 0 ? cat.color : th.cardBorder,
                  },
                ]}
              >
                <View style={[styles.catIcon, { backgroundColor: cat.color + "22" }]}>
                  <Text style={{ fontSize: 28 }}>{cat.icon}</Text>
                </View>
                <Text style={[styles.catTitle, { color: th.text }]} numberOfLines={1}>
                  {cat.title}
                </Text>
                <Text style={[styles.catSub, { color: th.textLight }]} numberOfLines={1}>
                  {cat.titleTr}
                </Text>
                <View style={styles.catMeta}>
                  <Text style={[styles.catMetaText, { color: th.textMid }]}>
                    {cat.words.length} peyv
                  </Text>
                  <Text style={[styles.catMetaText, { color: cat.color }]}>
                    {pct}%
                  </Text>
                </View>
                <View style={[styles.catBar, { backgroundColor: th.bgDark }]}>
                  <View
                    style={[
                      styles.catBarFill,
                      { width: `${pct}%`, backgroundColor: cat.color },
                    ]}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Kevo encouragement */}
        <View style={[styles.kevoRow, { backgroundColor: th.primary + "12", borderColor: th.primary + "30" }]}>
          <KevoMascot size={48} mood="happy" />
          <View style={[styles.kevoBubble, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
            <Text style={{ fontSize: 12, color: th.text, fontWeight: "600" }}>
              Ji babekê dest pê bike — peyv bi peyv pêş ve here!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================================
//  ÇOCUK — KLASİK PATH (eski layout korunuyor)
// =====================================================================

function ChildHome() {
  const {
    th, t, lvl, xp, streak, hearts, completed, levelLessons,
    lessonsToday, correctToday, startLesson,
  } = useApp();

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

        <View style={[styles.kevoRow, { backgroundColor: th.primary + "10", borderColor: th.primary + "20" }]}>
          <KevoMascot size={48} mood="happy" />
          <View style={[styles.kevoBubble, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
            <Text style={{ fontSize: 12, color: th.text, fontWeight: "600" }}>{t.touchKevo}</Text>
          </View>
        </View>

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
  goalCard: { marginHorizontal: 18, marginTop: 12, marginBottom: 4, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  goalGrad: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  goalIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.85)", alignItems: "center", justifyContent: "center" },
  goalTitle: { fontSize: 13, fontWeight: "800" },
  goalBar: { height: 6, borderRadius: 3, overflow: "hidden", marginTop: 6 },
  goalBarFill: { height: "100%", borderRadius: 3 },
  goalPct: { fontSize: 16, fontWeight: "800" },
  sectionTitle: { fontSize: 13, fontWeight: "800", marginHorizontal: 18, marginBottom: 10, marginTop: 14, letterSpacing: 0.3 },
  path: { paddingHorizontal: 18, paddingBottom: 20 },
  pathRow: { flexDirection: "row", paddingVertical: 4 },
  lessonNode: { width: "60%", flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 16 },
  lessonIcon: { borderRadius: 14, alignItems: "center", justifyContent: "center" },
  lessonTitle: { fontSize: 13, fontWeight: "700" },

  // === Adult-specific ===
  levelTabs: { paddingHorizontal: 18, gap: 8, paddingVertical: 4 },
  levelTab: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, alignItems: "center", minWidth: 86 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 10 },
  catCard: { width: "47%", padding: 14, borderRadius: 18, borderWidth: 1.5, marginHorizontal: "1.5%", marginBottom: 4 },
  catIcon: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  catTitle: { fontSize: 14, fontWeight: "800" },
  catSub: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  catMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  catMetaText: { fontSize: 10, fontWeight: "700" },
  catBar: { height: 4, borderRadius: 2, overflow: "hidden", marginTop: 4 },
  catBarFill: { height: "100%", borderRadius: 2 },
});
