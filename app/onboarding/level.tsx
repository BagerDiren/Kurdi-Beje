import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { KevoMascot } from "@/components/kevo-mascot";
import { Btn } from "@/components/ui-kit";
import { useApp } from "@/data/app-context";
import { LESSONS } from "@/data/lessons";

const LEVELS = [
  { id: "a1" as const, label: "A1 — Destpêk", icon: "🌱", count: LESSONS.a1.length },
  { id: "a2" as const, label: "A2 — Bingehîn", icon: "🌿", count: LESSONS.a2.length },
  { id: "b1" as const, label: "B1 — Navîn", icon: "🌳", count: LESSONS.b1.length },
  { id: "b2" as const, label: "B2 — Pêşketî", icon: "🏔️", count: LESSONS.b2.length },
];

export default function LevelScreen() {
  const { lvl, setLvl, th, t } = useApp();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: th.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.kevo}>
          <KevoMascot size={65} mood="happy" />
        </View>

        <Text style={[styles.title, { color: th.primary }]}>{t.chooseLevel}</Text>

        <View style={styles.levels}>
          {LEVELS.map(lv => (
            <Pressable
              key={lv.id}
              onPress={() => setLvl(lv.id)}
              style={[styles.levelBtn, {
                borderColor: lvl === lv.id ? th.primary : th.cardBorder,
                backgroundColor: lvl === lv.id ? th.primary + "10" : th.card,
              }]}
            >
              <Text style={{ fontSize: 28 }}>{lv.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.levelLabel, { color: th.primary }]}>{lv.label}</Text>
                <Text style={{ fontSize: 11, color: th.textLight }}>{lv.count} ders</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Btn onPress={() => lvl && router.replace("/(tabs)")} disabled={!lvl} th={th}>
          {t.start}
        </Btn>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingHorizontal: 24, paddingTop: 40, gap: 12 },
  kevo: { alignItems: "center" },
  title: { textAlign: "center", fontSize: 17, fontWeight: "800" },
  levels: { gap: 8 },
  levelBtn: { flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderRadius: 14, borderWidth: 2 },
  levelLabel: { fontSize: 14, fontWeight: "700" },
  bottom: { paddingHorizontal: 24, paddingBottom: 24 },
});
