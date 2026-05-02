import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Bar } from "@/components/ui-kit";
import { useApp } from "@/data/app-context";

export default function GoalsScreen() {
  const { age } = useApp();
  if (age === "adult") return <AdultGoals />;
  return <ChildGoals />;
}

// =====================================================================
//  YETİŞKİN GOALS — Haftalık grafik + günlük + uzun dönem
// =====================================================================

function AdultGoals() {
  const { th, t, xp, lessonsToday, correctToday, streak, dailyGoal, studyDates, completed } = useApp();
  const targetMin = dailyGoal ?? 10;
  const targetXp = targetMin * 4; // ~4 XP/dakika tahmini
  const targetLessons = Math.max(1, Math.round(targetMin / 5)); // 5dk → 1, 10dk → 2, 15dk → 3, 20dk → 4

  // Daily goals — kullanıcının seçtiği dailyGoal'e göre dinamik
  const daily = [
    { icon: "⭐", text: `${targetXp} XP berhev bike`, textTr: `${targetXp} XP topla`, val: Math.min(xp % 100, targetXp), max: targetXp, color: th.accent },
    { icon: "📚", text: `${targetLessons} ders qediya`, textTr: `${targetLessons} ders bitir`, val: Math.min(lessonsToday, targetLessons), max: targetLessons, color: th.primary },
    { icon: "✅", text: "5 bersiv rast", textTr: "5 doğru cevap", val: Math.min(correctToday, 5), max: 5, color: th.correct },
    { icon: "🔥", text: "Rêz biparêze", textTr: "Seriyi koru", val: streak > 0 ? 1 : 0, max: 1, color: "#F49000" },
  ];

  // Weekly grid (last 7 days)
  const today = new Date();
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today.getTime() - (6 - i) * 86400000);
    const iso = d.toISOString().slice(0, 10);
    const studied = studyDates.includes(iso);
    return {
      iso,
      day: ["Yek", "Du", "Sê", "Çar", "Pênc", "În", "Şem"][d.getDay()] || "?",
      dayTr: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"][d.getDay()] || "?",
      studied,
      isToday: iso === today.toISOString().slice(0, 10),
      height: studied ? 80 + (Math.abs(d.getDate()) % 30) * 0.5 : 12,
    };
  });

  const weeklyStudied = last7.filter((d) => d.studied).length;
  const weeklyPct = Math.round((weeklyStudied / 7) * 100);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
      <LinearGradient colors={th.headerGrad as unknown as readonly [string, string, ...string[]]} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 18, color: "#fff" }}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>🎯 Armanc</Text>
        </View>
        <Text style={styles.headerSub}>Armancên rojane û hefteyî · Günlük ve haftalık hedefler</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Daily goal banner */}
        <View style={[styles.dailyBanner, { backgroundColor: th.primary + "12", borderColor: th.primary }]}>
          <View style={[styles.dailyIcon, { backgroundColor: th.primary }]}>
            <Text style={{ fontSize: 22 }}>⏱️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "900", color: th.text }}>
              Armanca te ya rojane: {targetMin} deqîqe
            </Text>
            <Text style={{ fontSize: 11, color: th.textMid, fontWeight: "600", marginTop: 2 }}>
              Günlük hedefin: {targetMin} dakika · {targetXp} XP / {targetLessons} ders
            </Text>
          </View>
        </View>

        {/* Daily goals */}
        <Text style={[styles.sectionTitle, { color: th.text }]}>📅 Roja Îro</Text>
        {daily.map((g, i) => {
          const pct = Math.round((g.val / g.max) * 100);
          return (
            <View key={i} style={[styles.goalCard, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
              <View style={styles.goalRow}>
                <View style={[styles.goalIcon, { backgroundColor: g.color + "20" }]}>
                  <Text style={{ fontSize: 22 }}>{g.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "800", color: th.text }}>{g.text}</Text>
                  <Text style={{ fontSize: 10, color: th.textLight, marginTop: 1 }}>
                    {g.textTr} · {g.val}/{g.max}
                  </Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: "900", color: g.color }}>{pct}%</Text>
              </View>
              <View style={{ marginTop: 8 }}>
                <Bar value={g.val} max={g.max} th={{ ...th, primary: g.color, primaryLight: th.accentSoft }} />
              </View>
            </View>
          );
        })}

        {/* Weekly chart */}
        <Text style={[styles.sectionTitle, { color: th.text, marginTop: 16 }]}>
          📊 Hefteya Vê · Bu Hafta
        </Text>
        <View style={[styles.weeklyCard, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
          <View style={styles.weeklyHeader}>
            <View>
              <Text style={{ fontSize: 22, fontWeight: "900", color: th.text }}>
                {weeklyStudied}/7 roj
              </Text>
              <Text style={{ fontSize: 11, color: th.textMid }}>{weeklyPct}% serkeftin · başarı</Text>
            </View>
            <View style={[styles.weekStats, { backgroundColor: th.primary + "18" }]}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: th.primary }}>🔥 {streak} streak</Text>
            </View>
          </View>
          <View style={styles.barChart}>
            {last7.map((d, i) => (
              <View key={i} style={styles.barCol}>
                <View style={[styles.barTrack, { backgroundColor: th.bgDark }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: d.studied ? "100%" : "10%",
                        backgroundColor: d.isToday ? th.accent : d.studied ? th.primary : th.bgDark,
                      },
                    ]}
                  />
                </View>
                <Text style={{ fontSize: 9, fontWeight: "700", color: d.isToday ? th.accent : th.textLight, marginTop: 4 }}>
                  {d.day}
                </Text>
                {d.isToday && <View style={[styles.todayDot, { backgroundColor: th.accent }]} />}
              </View>
            ))}
          </View>
        </View>

        {/* Long-term progress */}
        <Text style={[styles.sectionTitle, { color: th.text, marginTop: 16 }]}>
          🏆 Pêşveçûn · İlerleme
        </Text>
        <View style={[styles.longCard, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
          <View style={styles.longRow}>
            <View style={styles.longStat}>
              <Text style={{ fontSize: 24, fontWeight: "900", color: th.primary }}>{xp}</Text>
              <Text style={{ fontSize: 10, color: th.textLight, fontWeight: "700" }}>XP TEV</Text>
            </View>
            <View style={[styles.longDiv, { backgroundColor: th.cardBorder }]} />
            <View style={styles.longStat}>
              <Text style={{ fontSize: 24, fontWeight: "900", color: th.accent }}>{completed.length}</Text>
              <Text style={{ fontSize: 10, color: th.textLight, fontWeight: "700" }}>DERS</Text>
            </View>
            <View style={[styles.longDiv, { backgroundColor: th.cardBorder }]} />
            <View style={styles.longStat}>
              <Text style={{ fontSize: 24, fontWeight: "900", color: "#F49000" }}>{streak}</Text>
              <Text style={{ fontSize: 10, color: th.textLight, fontWeight: "700" }}>RÊZ</Text>
            </View>
          </View>
        </View>

        {/* Tip */}
        <View style={[styles.tipCard, { backgroundColor: th.accent + "15", borderColor: th.accent + "40" }]}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: th.accent, textAlign: "center" }}>
            💡 Her roj 5 deqîqe, hêza zimanê te zêde dike!
          </Text>
          <Text style={{ fontSize: 11, color: th.textMid, marginTop: 4, textAlign: "center" }}>
            Günde 5 dakika dilini güçlendirir.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================================
//  ÇOCUK GOALS — eski layout
// =====================================================================

function ChildGoals() {
  const { th, t, xp, lessonsToday, correctToday, streak } = useApp();

  const goals = [
    { icon: "📝", text: t.dailyWords, val: Math.min(xp, 50), max: 50, color: th.accent },
    { icon: "📚", text: t.dailyLesson, val: Math.min(lessonsToday, 1), max: 1, color: th.primary },
    { icon: "✅", text: t.dailyQuiz, val: Math.min(correctToday, 5), max: 5, color: th.correct },
    { icon: "🔥", text: t.dailyStreak, val: streak > 0 ? 1 : 0, max: 1, color: "#FF6B35" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }}>
      <LinearGradient colors={th.headerGrad as unknown as readonly [string, string, ...string[]]} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 18, color: "#fff" }}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>🎯 {t.dailyGoal}</Text>
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.scroll}>
        {goals.map((g, i) => {
          const pct = Math.round((g.val / g.max) * 100);
          return (
            <View key={i} style={[styles.goalCard, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
              <View style={styles.goalRow}>
                <View style={[styles.goalIcon, { backgroundColor: g.color + "20" }]}>
                  <Text style={{ fontSize: 22 }}>{g.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: th.text }}>{g.text}</Text>
                  <Text style={{ fontSize: 10, color: th.textLight, marginTop: 2 }}>{g.val}/{g.max}</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "800", color: g.color }}>{pct}%</Text>
              </View>
              <View style={{ marginTop: 8 }}>
                <Bar value={g.val} max={g.max} th={{ ...th, primary: g.color, primaryLight: th.accentSoft }} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 18, paddingBottom: 24,
    borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 8, marginLeft: 46 },

  scroll: { padding: 18, gap: 10, paddingBottom: 30 },
  sectionTitle: { fontSize: 13, fontWeight: "800", marginBottom: 6, letterSpacing: 0.3 },
  dailyBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1.5 },
  dailyIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },

  goalCard: { borderRadius: 18, padding: 14, borderWidth: 1 },
  goalRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  goalIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },

  weeklyCard: { borderRadius: 18, padding: 16, borderWidth: 1 },
  weeklyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  weekStats: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  barChart: { flexDirection: "row", justifyContent: "space-between", height: 110, alignItems: "flex-end" },
  barCol: { flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" },
  barTrack: { width: 14, height: 80, borderRadius: 7, overflow: "hidden", justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 7 },
  todayDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },

  longCard: { borderRadius: 18, padding: 16, borderWidth: 1 },
  longRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  longStat: { alignItems: "center", flex: 1 },
  longDiv: { width: 1, height: 40 },

  tipCard: { borderRadius: 14, padding: 14, borderWidth: 1.5, marginTop: 8 },
});
