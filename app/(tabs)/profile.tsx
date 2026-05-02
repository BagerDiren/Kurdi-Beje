import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { KevoMascot } from "@/components/kevo-mascot";
import { useApp } from "@/data/app-context";

export default function ProfileTab() {
  const { th, lvl, xp, streak, hearts, completed, resetProgress, setHearts } = useApp();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile card */}
        <View style={[styles.card, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
          <KevoMascot size={60} mood="happy" />
          <Text style={[styles.name, { color: th.text }]}>KurdîBêje</Text>
          <Text style={{ fontSize: 12, color: th.textMid }}>{lvl?.toUpperCase()} · {completed.length} ders temam</Text>
        </View>

        {/* Stats */}
        <View style={[styles.card, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
          <View style={styles.statsRow}>
            {[
              { icon: "🔥", val: streak, lbl: "Streak" },
              { icon: "⭐", val: xp, lbl: "XP" },
              { icon: "📚", val: completed.length, lbl: "Ders" },
            ].map((s, i) => (
              <View key={i} style={styles.stat}>
                <Text style={{ fontSize: 22 }}>{s.icon}</Text>
                <Text style={[styles.statVal, { color: th.text }]}>{s.val}</Text>
                <Text style={{ fontSize: 9, color: th.textLight }}>{s.lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Hearts restore */}
        {hearts < 5 && (
          <Pressable onPress={() => setHearts(5)} style={[styles.heartBtn, { borderColor: th.accent, backgroundColor: th.accent + "20" }]}>
            <Text style={{ fontSize: 16 }}>📺</Text>
            <Text style={{ fontSize: 13, fontWeight: "700", color: th.accent }}>Reklam izle → ❤️ 5 can kazan!</Text>
          </Pressable>
        )}

        {/* Settings */}
        <View style={styles.settings}>
          <Pressable onPress={() => router.replace("/onboarding/level")} style={[styles.settBtn, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
            <Text>🏆</Text>
            <Text style={{ fontSize: 13, color: th.text }}>Astê biguherîne (Seviye değiştir)</Text>
          </Pressable>
          <Pressable onPress={() => router.replace("/onboarding/language")} style={[styles.settBtn, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
            <Text>🌍</Text>
            <Text style={{ fontSize: 13, color: th.text }}>Zimanê biguherîne (Dil değiştir)</Text>
          </Pressable>
          <Pressable onPress={resetProgress} style={[styles.settBtn, { backgroundColor: th.wrong + "10", borderColor: th.wrong + "30" }]}>
            <Text>🗑️</Text>
            <Text style={{ fontSize: 13, color: th.wrong }}>Pêşveçûnê jê bibe (Sıfırla)</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, gap: 12 },
  card: { borderRadius: 18, padding: 20, alignItems: "center", borderWidth: 1, gap: 8 },
  name: { fontSize: 18, fontWeight: "800", marginTop: 8 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
  stat: { alignItems: "center" },
  statVal: { fontSize: 18, fontWeight: "800" },
  heartBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1.5 },
  settings: { gap: 6 },
  settBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
});
