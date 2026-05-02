import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Bar } from "@/components/ui-kit";
import { useApp } from "@/data/app-context";

export default function GoalsScreen() {
  const { th, t, xp, lessonsToday, correctToday, streak } = useApp();

  const goals = [
    { icon: "📝", text: t.dailyWords, val: Math.min(xp, 50), max: 50, color: th.accent },
    { icon: "📚", text: t.dailyLesson, val: Math.min(lessonsToday, 1), max: 1, color: th.primary },
    { icon: "✅", text: t.dailyQuiz, val: Math.min(correctToday, 5), max: 5, color: th.correct },
    { icon: "🔥", text: t.dailyStreak, val: streak > 0 ? 1 : 0, max: 1, color: "#FF6B35" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }}>
      <LinearGradient colors={th.headerGrad as unknown as string[]} style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 18, color: "#fff" }}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>🎯 {t.dailyGoal}</Text>
        </View>
        <Text style={styles.headerSub}>Armancên îro — pêşveçûna xwe bibîne</Text>
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

        <View style={[styles.tipCard, { backgroundColor: th.accent + "15", borderColor: th.accent + "30" }]}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: th.accent, textAlign: "center" }}>💡 Her roj dest pê bike!</Text>
          <Text style={{ fontSize: 11, color: th.textMid, marginTop: 4, textAlign: "center" }}>Rêzê bêhtir bike û XP wergire!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 18, paddingBottom: 24, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { backgroundColor: "rgba(255,255,255,0.15)", width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 6, marginLeft: 44 },
  scroll: { padding: 18, gap: 10 },
  goalCard: { borderRadius: 20, padding: 14, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  goalRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  goalIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tipCard: { borderRadius: 16, padding: 14, borderWidth: 1, marginTop: 8 },
});
