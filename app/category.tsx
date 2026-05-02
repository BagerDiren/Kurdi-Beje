import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { useApp } from "@/data/app-context";
import { getCategoryByKey } from "@/data/categories";

type Tab = "lessons" | "words";

export default function CategoryScreen() {
  const { th, activeCategory, completed, startLesson } = useApp();
  const [tab, setTab] = useState<Tab>("lessons");

  const cat = activeCategory ? getCategoryByKey(activeCategory) : undefined;

  if (!cat) {
    router.replace("/(tabs)");
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <LinearGradient colors={[cat.color, cat.color + "AA"]} style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={{ fontSize: 18, color: "#fff" }}>←</Text>
            </Pressable>
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>{cat.level.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.heroIconWrap}>
            <View style={styles.heroIcon}>
              <Text style={{ fontSize: 44 }}>{cat.icon}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{cat.title}</Text>
          <Text style={styles.heroTitleTr}>{cat.titleTr}</Text>
          <Text style={styles.heroDesc}>{cat.description}</Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{cat.lessons.length}</Text>
              <Text style={styles.heroStatLabel}>Ders</Text>
            </View>
            <View style={styles.heroDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{cat.words.length}</Text>
              <Text style={styles.heroStatLabel}>Peyv</Text>
            </View>
            <View style={styles.heroDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>
                {cat.lessons.reduce((acc, l) => acc + l.xp, 0)}
              </Text>
              <Text style={styles.heroStatLabel}>XP</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tab switcher */}
        <View style={[styles.tabs, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
          <Pressable
            onPress={() => setTab("lessons")}
            style={[styles.tab, tab === "lessons" && { backgroundColor: cat.color }]}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "800",
                color: tab === "lessons" ? "#fff" : th.text,
              }}
            >
              📖 Ders
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("words")}
            style={[styles.tab, tab === "words" && { backgroundColor: cat.color }]}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "800",
                color: tab === "words" ? "#fff" : th.text,
              }}
            >
              🗂️ Peyv ({cat.words.length})
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        {tab === "lessons" ? (
          <View style={styles.list}>
            {cat.lessons.map((lesson, i) => {
              const done = completed.includes(lesson.id);
              const stepsCount = lesson.steps?.length ?? 0;
              return (
                <Pressable
                  key={lesson.id}
                  onPress={() => lesson.steps && startLesson(lesson)}
                  disabled={!lesson.steps}
                  style={[
                    styles.lessonCard,
                    {
                      backgroundColor: th.card,
                      borderColor: done ? cat.color : th.cardBorder,
                      borderWidth: done ? 2 : 1.5,
                      opacity: !lesson.steps ? 0.5 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.lessonIcon,
                      { backgroundColor: done ? cat.color : cat.color + "20" },
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{done ? "👑" : lesson.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: th.text }}>
                      Beş {i + 1}: {lesson.title}
                    </Text>
                    <Text style={{ fontSize: 11, color: th.textLight, marginTop: 2 }}>
                      {lesson.titleTr}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
                      <Text style={{ fontSize: 10, color: cat.color, fontWeight: "700" }}>
                        ⭐ {lesson.xp} XP
                      </Text>
                      {stepsCount > 0 && (
                        <Text style={{ fontSize: 10, color: th.textMid, fontWeight: "600" }}>
                          🧩 {stepsCount} gav
                        </Text>
                      )}
                      {!lesson.steps && (
                        <Text style={{ fontSize: 10, color: th.textLight, fontWeight: "600" }}>
                          🔜 Tê amade kirin
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={{ fontSize: 18, color: th.textLight }}>›</Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.list}>
            {cat.words.map((w, i) => (
              <View
                key={i}
                style={[styles.wordCard, { backgroundColor: th.card, borderColor: th.cardBorder }]}
              >
                <View style={[styles.wordEmoji, { backgroundColor: cat.color + "18" }]}>
                  <Text style={{ fontSize: 22 }}>{w.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: th.text }}>
                    {w.ku}
                  </Text>
                  <Text style={{ fontSize: 12, color: th.textMid, marginTop: 2 }}>
                    {w.tr}
                  </Text>
                  {w.example && (
                    <View style={[styles.exBox, { borderColor: th.cardBorder, backgroundColor: th.bgDark }]}>
                      <Text style={{ fontSize: 11, fontStyle: "italic", color: th.text }}>
                        "{w.example.ku}"
                      </Text>
                      <Text style={{ fontSize: 10, color: th.textLight, marginTop: 2 }}>
                        {w.example.tr}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  levelPill: {
    backgroundColor: "rgba(0,0,0,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  levelPillText: { fontSize: 11, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  heroIconWrap: { alignItems: "center", marginTop: 16 },
  heroIcon: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { fontSize: 24, fontWeight: "900", color: "#fff", textAlign: "center", marginTop: 12 },
  heroTitleTr: { fontSize: 13, fontWeight: "700", color: "rgba(255,255,255,0.8)", textAlign: "center", marginTop: 2 },
  heroDesc: { fontSize: 12, color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: 8, paddingHorizontal: 16 },
  heroStats: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 14,
    paddingVertical: 10,
    marginTop: 16,
    alignItems: "center",
  },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatVal: { fontSize: 18, fontWeight: "900", color: "#fff" },
  heroStatLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  heroDiv: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.2)" },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 18,
    marginTop: 16,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    gap: 4,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10 },
  list: { padding: 18, gap: 10 },
  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
  },
  lessonIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  wordCard: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  wordEmoji: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  exBox: {
    marginTop: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});
