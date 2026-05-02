import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Bar, Btn } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import type { TeachStep } from "@/data/lessons";
import type { AppTheme } from "@/data/themes";
import type { Translations } from "@/data/translations";

type Props = {
  step: TeachStep;
  onNext: () => void;
  lp: number; ts: number;
  th: AppTheme; t: Translations;
};

export function TeachScreen({ step, onNext, lp, ts, th, t }: Props) {
  const [rev, setRev] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: th.bg }} contentContainerStyle={styles.container}>
      <Bar value={lp} max={ts} th={th} />
      <View style={styles.kevo}><KevoMascot size={th.kevoSize} mood="happy" speaking /></View>

      <View style={[styles.card, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
        <Text style={{ fontSize: th.emojiSize, textAlign: "center" }}>{step.emoji}</Text>
        <Text style={[styles.word, { color: th.primary }]}>{step.word}</Text>
        <Text style={[styles.meaning, { color: th.textMid }]}>{step.meaning}</Text>

        <View style={[styles.divider, { backgroundColor: th.bgDark }]} />

        <View style={[styles.exampleBox, { backgroundColor: th.primary + "10" }]}>
          <Text style={{ fontSize: 10, color: th.textLight, fontWeight: "700" }}>{t.example}</Text>
          <Text style={[styles.sentence, { color: th.primary }]}>{step.sentence}</Text>
          <Text style={{ fontSize: 12, color: th.textMid, marginTop: 2 }}>{step.sentenceTr}</Text>
        </View>
      </View>

      {!rev ? (
        <Pressable onPress={() => setRev(true)} style={[styles.tipBtn, { borderColor: th.accent, backgroundColor: th.accent + "20" }]}>
          <Text style={{ fontSize: 12, color: th.accent, fontWeight: "600" }}>{t.tipLabel}</Text>
        </Pressable>
      ) : (
        <View style={[styles.tipBox, { borderColor: th.accent + "30", backgroundColor: th.accent + "15" }]}>
          <Text style={{ fontSize: 12, color: th.text, lineHeight: 20 }}>💡 {step.tip}</Text>
        </View>
      )}

      <View style={{ flex: 1 }} />
      <Btn onPress={onNext} th={th}>{t.next}</Btn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 32, gap: 12 },
  kevo: { alignItems: "center" },
  card: { borderRadius: 20, padding: 20, alignItems: "center", borderWidth: 1.5, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  word: { fontSize: 32, fontWeight: "800", marginTop: 6 },
  meaning: { fontSize: 15, fontWeight: "600", marginTop: 4 },
  divider: { height: 1, width: "100%", marginVertical: 14 },
  exampleBox: { borderRadius: 12, padding: 12, width: "100%", alignItems: "flex-start" },
  sentence: { fontSize: 15, fontWeight: "700", marginTop: 3 },
  tipBtn: { borderRadius: 12, borderWidth: 1.5, borderStyle: "dashed", padding: 12 },
  tipBox: { borderRadius: 12, borderWidth: 1, padding: 12 },
});
