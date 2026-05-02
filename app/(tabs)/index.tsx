import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { KevoMascot } from "@/components/kevo-mascot";
import { useApp } from "@/data/app-context";
import { CATEGORIES, LEVELS, type Category } from "@/data/categories";
import { getCurrentLeague } from "@/data/achievements";
import type { LevelKey } from "@/data/lessons";

function timeOfDayGreetingTr(): string {
  const h = new Date().getHours();
  if (h < 6) return "İyi geceler";
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

function timeOfDayGreetingKu(): string {
  const h = new Date().getHours();
  if (h < 6) return "Şev baş";
  if (h < 12) return "Roj baş";
  if (h < 18) return "Roj baş";
  return "Êvar baş";
}

export default function HomeLearnTab() {
  const { age } = useApp();
  if (age === "adult") return <AdultHome />;
  return <ChildHome />;
}

// =====================================================================
//  YETİŞKİN — TEMA (KATEGORİ) GRID
// =====================================================================

function AdultHome() {
  const { th, t, lvl, xp, streak, hearts, completed, lessonsToday, correctToday, setActiveCategory, startLesson } = useApp();
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>(lvl ?? "a1");

  const goalsPct = Math.round((
    Math.min(xp, 50) / 50 * 0.35 +
    Math.min(lessonsToday, 1) / 1 * 0.25 +
    Math.min(correctToday, 5) / 5 * 0.25 +
    (streak > 0 ? 1 : 0) * 0.15
  ) * 100);

  const filteredCats = CATEGORIES.filter((c) => c.level === selectedLevel);
  // Sadece kategorisi olan seviyeleri göster
  const availableLevels = LEVELS.filter((lv) =>
    CATEGORIES.some((c) => c.level === lv.key),
  );

  // CONTINUE: bul son tamamlanan kategoriyi ve içindeki sıradaki dersi
  const continueData = (() => {
    for (const c of CATEGORIES) {
      const nextLesson = c.lessons.find((l) => !completed.includes(l.id) && l.steps);
      if (nextLesson && c.lessons.some((l) => completed.includes(l.id))) {
        return { cat: c, lesson: nextLesson };
      }
    }
    // Tamamlanan kategori yoksa: ilk A1 kategorisinin ilk dersi
    const a1 = CATEGORIES.find((c) => c.level === "a1");
    if (a1 && a1.lessons[0]) return { cat: a1, lesson: a1.lessons[0] };
    return null;
  })();

  const league = getCurrentLeague(xp);

  const openCategory = (cat: Category) => {
    setActiveCategory(cat.key);
    router.push("/category" as never);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <LinearGradient colors={th.headerGrad as unknown as readonly [string, string, ...string[]]} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerHello}>{timeOfDayGreetingTr()}! 👋</Text>
              <Text style={styles.headerSub}>{timeOfDayGreetingKu()} · Hadi devam edelim</Text>
            </View>
            <View style={[styles.leagueChip, { backgroundColor: league.current.color + "33" }]}>
              <Text style={{ fontSize: 16 }}>{league.current.icon}</Text>
              <Text style={styles.leagueChipText}>{league.current.title}</Text>
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

        {/* CONTINUE CARD */}
        {continueData && (
          <Pressable
            onPress={() => continueData.lesson.steps && startLesson(continueData.lesson)}
            style={[styles.continueCard, { backgroundColor: th.card, borderColor: continueData.cat.color }]}
          >
            <View style={[styles.continueIcon, { backgroundColor: continueData.cat.color }]}>
              <Text style={{ fontSize: 28 }}>{continueData.lesson.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: "800", color: continueData.cat.color, letterSpacing: 0.4 }}>
                ▶ KALDIĞIN YERDEN DEVAM ET
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "900", color: th.text, marginTop: 2 }} numberOfLines={1}>
                {continueData.lesson.title}
              </Text>
              <Text style={{ fontSize: 11, color: th.textMid, marginTop: 1 }} numberOfLines={1}>
                {continueData.cat.titleTr} · +{continueData.lesson.xp} XP
              </Text>
            </View>
            <Text style={{ fontSize: 22, color: continueData.cat.color }}>→</Text>
          </Pressable>
        )}

        {/* STREAK BANNER */}
        {streak >= 1 && (
          <View style={[styles.streakBanner, { backgroundColor: "#F49000" + "18", borderColor: "#F49000" }]}>
            <Text style={{ fontSize: 22 }}>🔥</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "900", color: "#F49000" }}>
                {streak} günlük serindesin!
              </Text>
              <Text style={{ fontSize: 10, color: th.textMid, fontWeight: "600" }}>
                Yarın da gel, serini kaybetme · Bişopîne!
              </Text>
            </View>
          </View>
        )}

        {/* PRACTICE QUICK ACCESS */}
        <Pressable
          onPress={() => router.push("/practice" as never)}
          style={[styles.practiceCard, { backgroundColor: th.accent + "15", borderColor: th.accent }]}
        >
          <View style={[styles.practiceIcon, { backgroundColor: th.accent }]}>
            <Text style={{ fontSize: 22 }}>🎯</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "900", color: th.text }}>Hızlı Pratik</Text>
            <Text style={{ fontSize: 10, color: th.textMid, fontWeight: "600", marginTop: 1 }}>
              10 sorulu mini quiz · +5 XP / doğru
            </Text>
          </View>
          <Text style={{ fontSize: 18, color: th.accent }}>→</Text>
        </Pressable>

        {/* Goal card */}
        <Pressable onPress={() => router.push("/goals")} style={[styles.goalCard, { borderColor: th.cardBorder }]}>
          <LinearGradient colors={th.goalGrad as unknown as readonly [string, string, ...string[]]} style={styles.goalGrad}>
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
        <Text style={[styles.sectionTitle, { color: th.text }]}>📚 Seviyeler · Ast</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.levelTabs}
        >
          {availableLevels.map((lv) => {
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

        {/* Category list — büyük temiz kartlar (Türkçe öncelikli) */}
        <Text style={[styles.sectionTitle, { color: th.text, marginTop: 14 }]}>
          🗂️ Konular  ·  {filteredCats.length} kategori
        </Text>

        <View style={styles.catList}>
          {filteredCats.map((cat) => {
            const lessonIds = cat.lessons.map((l) => l.id);
            const doneCount = lessonIds.filter((id) => completed.includes(id)).length;
            const totalLessons = cat.lessons.length;
            const pct = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;
            const isStarted = doneCount > 0;
            const isComplete = doneCount === totalLessons;
            return (
              <Pressable
                key={cat.key}
                onPress={() => openCategory(cat)}
                style={({ pressed }) => [
                  styles.catRow,
                  {
                    backgroundColor: th.card,
                    borderColor: isComplete ? "#FFC200" : isStarted ? cat.color : th.cardBorder,
                    borderWidth: isComplete ? 2.5 : isStarted ? 2 : 1.5,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <View style={[styles.catRowIcon, { backgroundColor: cat.color }]}>
                  <Text style={{ fontSize: 30 }}>{isComplete ? "👑" : cat.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.catRowTitle}>
                    <Text style={{ fontSize: 16, fontWeight: "900", color: th.text }} numberOfLines={1}>
                      {cat.titleTr}
                    </Text>
                    <View style={[styles.levelDot, { backgroundColor: cat.color + "22" }]}>
                      <Text style={{ fontSize: 9, fontWeight: "800", color: cat.color }}>
                        {cat.level.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11, color: th.textLight, marginTop: 2, fontWeight: "600" }} numberOfLines={1}>
                    {cat.title} · {cat.words.length} kelime · {totalLessons} ders
                  </Text>
                  <View style={styles.catRowProgress}>
                    <View style={[styles.catRowBar, { backgroundColor: th.bgDark }]}>
                      <View
                        style={[
                          styles.catRowBarFill,
                          { width: `${pct}%`, backgroundColor: cat.color },
                        ]}
                      />
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: "800", color: cat.color, minWidth: 38, textAlign: "right" }}>
                      {doneCount}/{totalLessons}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 22, color: cat.color, fontWeight: "900" }}>›</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Kevo encouragement */}
        <View style={[styles.kevoRow, { backgroundColor: th.primary + "12", borderColor: th.primary + "30" }]}>
          <KevoMascot size={48} mood="happy" />
          <View style={[styles.kevoBubble, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
            <Text style={{ fontSize: 12, color: th.text, fontWeight: "700" }}>
              Bir konudan başla — kelime kelime ilerle! 💪
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
        <LinearGradient colors={th.headerGrad as unknown as readonly [string, string, ...string[]]} style={styles.header}>
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
          <LinearGradient colors={th.goalGrad as unknown as readonly [string, string, ...string[]]} style={styles.goalGrad}>
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
  leagueChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  leagueChipText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  continueCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginHorizontal: 18, marginTop: 12, padding: 14,
    borderRadius: 18, borderWidth: 2,
  },
  continueIcon: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  streakBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginHorizontal: 18, marginTop: 8, padding: 12,
    borderRadius: 14, borderWidth: 1.5,
  },
  practiceCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    marginHorizontal: 18, marginTop: 8, padding: 12,
    borderRadius: 14, borderWidth: 1.5,
  },
  practiceIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  levelTabs: { paddingHorizontal: 18, gap: 8, paddingVertical: 4 },
  levelTab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, alignItems: "center", minWidth: 96 },

  // Yeni liste tipi kategori kartları
  catList: { paddingHorizontal: 18, gap: 10 },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 18,
  },
  catRowIcon: {
    width: 60, height: 60, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  catRowTitle: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  levelDot: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  catRowProgress: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  catRowBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  catRowBarFill: { height: "100%", borderRadius: 3 },
});
