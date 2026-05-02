import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { KevoMascot } from "@/components/kevo-mascot";
import { useApp } from "@/data/app-context";
import { CATEGORIES } from "@/data/categories";
import {
  ACHIEVEMENTS,
  computeAchievements,
  getCurrentLeague,
} from "@/data/achievements";

export default function ProfileTab() {
  const { age } = useApp();
  if (age === "adult") return <AdultProfile />;
  return <ChildProfile />;
}

// =====================================================================
//  YETİŞKİN PROFİLİ — Stats + League + Streak + Achievements
// =====================================================================

function AdultProfile() {
  const {
    th, lvl, xp, streak, hearts, completed, studyDates,
    unlockedAchievements, resetProgress, setHearts,
  } = useApp();

  // Türetilen istatistikler
  const lessonsCompleted = completed.length;
  const wordsLearned = lessonsCompleted * 4; // ~4 yeni peyv per ders (yaklaşık)
  const categoriesCompleted = CATEGORIES.filter((c) =>
    c.lessons.length > 0 && c.lessons.every((l) => completed.includes(l.id)),
  ).length;
  const minutesEstimate = Math.round(lessonsCompleted * 4); // ~4 dk per ders

  // Lig
  const league = getCurrentLeague(xp);

  // Madalyalar
  const achievementProgress = computeAchievements({
    xp, streak, lessonsCompleted, categoriesCompleted,
  });
  const unlockedCount = achievementProgress.filter((a) => a.unlocked).length;

  // Son 7 gün takvim
  const today = new Date();
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today.getTime() - (6 - i) * 86400000);
    const iso = d.toISOString().slice(0, 10);
    return {
      iso,
      day: ["P", "P", "S", "Ç", "P", "C", "C"][d.getDay()] || "?",
      dayKu: ["Yek", "Du", "Sê", "Çar", "Pênc", "În", "Şem"][d.getDay()] || "?",
      studied: studyDates.includes(iso),
      isToday: iso === today.toISOString().slice(0, 10),
    };
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero header */}
        <LinearGradient colors={th.headerGrad as unknown as readonly [string, string, ...string[]]} style={styles.hero}>
          <View style={styles.avatarWrap}>
            <KevoMascot size={70} mood="happy" />
          </View>
          <Text style={styles.name}>KurdîBêje</Text>
          <Text style={styles.subline}>{lvl?.toUpperCase()} · {league.current.titleTr}</Text>
        </LinearGradient>

        {/* League card */}
        <View style={[styles.card, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
          <View style={styles.leagueRow}>
            <View style={[styles.leagueIcon, { backgroundColor: league.current.color + "22" }]}>
              <Text style={{ fontSize: 32 }}>{league.current.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: th.textLight, fontWeight: "700" }}>LİGÊN ME</Text>
              <Text style={{ fontSize: 18, fontWeight: "900", color: th.text }}>
                {league.current.title}
              </Text>
              <Text style={{ fontSize: 11, color: th.textMid, marginTop: 2 }}>
                {league.next ? `${league.next.minXp - xp} XP → ${league.next.titleTr}` : "Asta herî bilind!"}
              </Text>
              <View style={[styles.leagueBar, { backgroundColor: th.bgDark }]}>
                <View style={[styles.leagueBarFill, { width: `${league.pct}%`, backgroundColor: league.current.color }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {[
            { i: "🔥", v: streak, l: "Rêz · Streak", c: "#F49000" },
            { i: "⭐", v: xp, l: "XP", c: "#FFC200" },
            { i: "📚", v: lessonsCompleted, l: "Ders", c: "#1CB0F6" },
            { i: "🗂️", v: `${categoriesCompleted}/${CATEGORIES.length}`, l: "Kategorî", c: "#A560E8" },
            { i: "🔤", v: wordsLearned, l: "Peyv", c: "#58CC02" },
            { i: "⏱️", v: `${minutesEstimate}dk`, l: "Wext", c: "#FF4B4B" },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
              <View style={[styles.statIcon, { backgroundColor: s.c + "22" }]}>
                <Text style={{ fontSize: 20 }}>{s.i}</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: "900", color: th.text }}>{s.v}</Text>
              <Text style={{ fontSize: 10, color: th.textLight, fontWeight: "600" }}>{s.l}</Text>
            </View>
          ))}
        </View>

        {/* Streak calendar (last 7 days) */}
        <View style={[styles.card, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
          <View style={styles.cardHeader}>
            <Text style={{ fontSize: 13, fontWeight: "800", color: th.text }}>📅 Heft Rojên Dawî</Text>
            <Text style={{ fontSize: 10, color: th.textLight }}>Son 7 Gün</Text>
          </View>
          <View style={styles.weekRow}>
            {last7.map((d, i) => (
              <View key={i} style={styles.weekDay}>
                <Text style={{ fontSize: 9, color: th.textLight, fontWeight: "700" }}>{d.dayKu}</Text>
                <View
                  style={[
                    styles.weekDot,
                    {
                      backgroundColor: d.studied ? th.primary : th.bgDark,
                      borderColor: d.isToday ? th.accent : "transparent",
                    },
                  ]}
                >
                  <Text style={{ fontSize: 14, color: d.studied ? "#fff" : th.textLight }}>
                    {d.studied ? "✓" : "·"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements preview */}
        <View style={[styles.card, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
          <View style={styles.cardHeader}>
            <Text style={{ fontSize: 13, fontWeight: "800", color: th.text }}>
              🏆 Madalya ({achievementProgress.filter(a => a.unlocked).length}/{ACHIEVEMENTS.length})
            </Text>
          </View>
          <View style={styles.achGrid}>
            {achievementProgress.slice(0, 8).map((a) => (
              <View
                key={a.achievement.id}
                style={[
                  styles.achBadge,
                  {
                    backgroundColor: a.unlocked ? a.achievement.color + "22" : th.bgDark,
                    borderColor: a.unlocked ? a.achievement.color : th.cardBorder,
                    opacity: a.unlocked ? 1 : 0.5,
                  },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{a.unlocked ? a.achievement.icon : "🔒"}</Text>
                <Text style={{ fontSize: 9, fontWeight: "700", color: th.text, textAlign: "center", marginTop: 2 }} numberOfLines={2}>
                  {a.achievement.titleTr}
                </Text>
                {!a.unlocked && (
                  <Text style={{ fontSize: 8, color: th.textLight, marginTop: 2 }}>
                    {a.current}/{a.achievement.threshold}
                  </Text>
                )}
              </View>
            ))}
          </View>
          <Pressable
            onPress={() => router.push("/achievements" as never)}
            style={[styles.viewAllBtn, { borderColor: th.primary, backgroundColor: th.primary + "12" }]}
          >
            <Text style={{ fontSize: 12, fontWeight: "800", color: th.primary }}>Hemûyan Bibîne →</Text>
          </Pressable>
        </View>

        {/* Hearts refill */}
        {hearts < 5 && (
          <Pressable
            onPress={() => setHearts(5)}
            style={[styles.heartBtn, { borderColor: th.accent, backgroundColor: th.accent + "22" }]}
          >
            <Text style={{ fontSize: 16 }}>❤️</Text>
            <Text style={{ fontSize: 13, fontWeight: "800", color: th.accent }}>
              Dilan dîsa tijî bike (5/5)
            </Text>
          </Pressable>
        )}

        {/* Settings */}
        <View style={styles.settings}>
          <Pressable
            onPress={() => router.push("/practice" as never)}
            style={[styles.settBtn, { backgroundColor: th.card, borderColor: th.cardBorder }]}
          >
            <Text>🎯</Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: th.text }}>
              Pratîka Bilez (Hızlı Pratik)
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace("/onboarding/level")}
            style={[styles.settBtn, { backgroundColor: th.card, borderColor: th.cardBorder }]}
          >
            <Text>🏆</Text>
            <Text style={{ fontSize: 13, color: th.text }}>Astê biguherîne (Seviye değiştir)</Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace("/onboarding/language")}
            style={[styles.settBtn, { backgroundColor: th.card, borderColor: th.cardBorder }]}
          >
            <Text>🌍</Text>
            <Text style={{ fontSize: 13, color: th.text }}>Zimanê biguherîne (Dil)</Text>
          </Pressable>
          <Pressable
            onPress={resetProgress}
            style={[styles.settBtn, { backgroundColor: th.wrong + "10", borderColor: th.wrong + "30" }]}
          >
            <Text>🗑️</Text>
            <Text style={{ fontSize: 13, color: th.wrong }}>
              Pêşveçûnê jê bibe (Sıfırla)
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================================
//  ÇOCUK PROFİLİ (eski) — korunuyor
// =====================================================================

function ChildProfile() {
  const { th, lvl, xp, streak, hearts, completed, resetProgress, setHearts } = useApp();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.cardChild, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
          <KevoMascot size={60} mood="happy" />
          <Text style={[styles.nameChild, { color: th.text }]}>KurdîBêje</Text>
          <Text style={{ fontSize: 12, color: th.textMid }}>{lvl?.toUpperCase()} · {completed.length} ders temam</Text>
        </View>
        <View style={[styles.cardChild, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
          <View style={styles.statsRowChild}>
            {[
              { icon: "🔥", val: streak, lbl: "Streak" },
              { icon: "⭐", val: xp, lbl: "XP" },
              { icon: "📚", val: completed.length, lbl: "Ders" },
            ].map((s, i) => (
              <View key={i} style={styles.statChild}>
                <Text style={{ fontSize: 22 }}>{s.icon}</Text>
                <Text style={[styles.statValChild, { color: th.text }]}>{s.val}</Text>
                <Text style={{ fontSize: 9, color: th.textLight }}>{s.lbl}</Text>
              </View>
            ))}
          </View>
        </View>
        {hearts < 5 && (
          <Pressable onPress={() => setHearts(5)} style={[styles.heartBtn, { borderColor: th.accent, backgroundColor: th.accent + "20" }]}>
            <Text style={{ fontSize: 16 }}>📺</Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: th.accent }}>Reklam izle → ❤️ 5 can!</Text>
          </Pressable>
        )}
        <View style={styles.settings}>
          <Pressable onPress={() => router.replace("/onboarding/level")} style={[styles.settBtn, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
            <Text>🏆</Text>
            <Text style={{ fontSize: 13, color: th.text }}>Astê biguherîne</Text>
          </Pressable>
          <Pressable onPress={resetProgress} style={[styles.settBtn, { backgroundColor: th.wrong + "10", borderColor: th.wrong + "30" }]}>
            <Text>🗑️</Text>
            <Text style={{ fontSize: 13, color: th.wrong }}>Sıfırla</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, gap: 12, paddingBottom: 30 },
  hero: {
    margin: -18,
    marginBottom: 0,
    padding: 24,
    paddingTop: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: "center",
  },
  avatarWrap: {
    width: 90, height: 90, borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  name: { fontSize: 22, fontWeight: "900", color: "#fff", marginTop: 10 },
  subline: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2, fontWeight: "700" },

  card: { borderRadius: 18, padding: 16, borderWidth: 1, gap: 8 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  leagueRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  leagueIcon: { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  leagueBar: { height: 5, borderRadius: 3, marginTop: 8, overflow: "hidden" },
  leagueBarFill: { height: "100%", borderRadius: 3 },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statCard: { width: "31.5%", padding: 10, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  weekRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  weekDay: { alignItems: "center", gap: 4 },
  weekDot: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2,
  },

  achGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  achBadge: {
    width: "23%", aspectRatio: 1,
    borderRadius: 14, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
    padding: 6,
  },
  viewAllBtn: { borderRadius: 10, padding: 10, borderWidth: 1.5, alignItems: "center", marginTop: 8 },

  heartBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1.5 },

  settings: { gap: 6 },
  settBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },

  // Child styles (unchanged)
  cardChild: { borderRadius: 18, padding: 20, alignItems: "center", borderWidth: 1, gap: 8 },
  nameChild: { fontSize: 18, fontWeight: "800", marginTop: 8 },
  statsRowChild: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
  statChild: { alignItems: "center" },
  statValChild: { fontSize: 18, fontWeight: "800" },
});
