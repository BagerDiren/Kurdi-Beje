import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { KevoMascot } from "@/components/kevo-mascot";
import { Btn } from "@/components/ui-kit";
import { useApp } from "@/data/app-context";
import { LANGS } from "@/data/languages";

export default function LanguageScreen() {
  const { lang, setLang, th, t } = useApp();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: th.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.kevo}>
          <KevoMascot size={75} mood="happy" />
        </View>

        <Text style={[styles.title, { color: th.primary }]}>Zimanê xwe hilbijêre</Text>
        <Text style={{ textAlign: "center", color: th.textLight, fontSize: 11 }}>
          {lang ? t.chooseLang : "Choose language / Dil seçin"}
        </Text>

        <View style={styles.grid}>
          {LANGS.map(l => (
            <Pressable
              key={l.code}
              onPress={() => setLang(l.code)}
              style={[styles.langBtn, {
                borderColor: lang === l.code ? th.primary : th.cardBorder,
                backgroundColor: lang === l.code ? th.primary + "12" : th.card,
              }]}
            >
              <View style={[styles.langBadge, { backgroundColor: l.color }]}>
                <Text style={styles.langBadgeText}>{l.code.toUpperCase()}</Text>
              </View>
              <Text style={[styles.langName, {
                color: lang === l.code ? th.primary : th.textMid,
                fontWeight: lang === l.code ? "700" : "500",
              }]}>{l.name}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Btn onPress={() => lang && router.push("/onboarding/level")} disabled={!lang} th={th}>
          {t.next}
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
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 },
  langBtn: { width: "48%", flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 12, borderWidth: 2 },
  langBadge: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  langBadgeText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  langName: { fontSize: 13 },
  bottom: { paddingHorizontal: 24, paddingBottom: 24 },
});
