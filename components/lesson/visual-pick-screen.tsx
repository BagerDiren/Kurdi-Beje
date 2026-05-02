import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Bar, Btn } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import type { VisualPickStep } from "@/data/lessons";
import type { AppTheme } from "@/data/themes";
import type { Translations } from "@/data/translations";

// Action emoji map (ActionSVG yerine basit emoji)
const ACTION_EMOJI: Record<string, string> = {
  drink: "🍵", eat: "🍞", walk: "🚶", run: "🏃",
  read: "📖", sleep: "😴", write: "✍️",
};

type Props = {
  step: VisualPickStep;
  onNext: () => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  lp: number; ts: number;
  th: AppTheme; t: Translations;
};

export function VisualPickScreen({ step, onNext, onCorrect, onWrong, lp, ts, th, t }: Props) {
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const ok = sel === step.correct;

  const pick = (i: number) => {
    if (done) return;
    setSel(i);
    setDone(true);
    i === step.correct ? onCorrect?.() : onWrong?.();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: th.bg }} contentContainerStyle={styles.container}>
      <Bar value={lp} max={ts} th={th} />
      <View style={styles.kevo}>
        <KevoMascot size={50} mood={done ? (ok ? "happy" : "sad") : "neutral"} speaking={done} />
      </View>

      {done && (
        <View style={[styles.feedback, { backgroundColor: (ok ? th.correct : th.wrong) + "15", borderColor: (ok ? th.correct : th.wrong) + "40" }]}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: ok ? th.correct : th.wrong }}>
            {ok ? "Aferîn! 🎉" : `Rast: "${step.labels[step.correct]}" 😅`}
          </Text>
        </View>
      )}

      <View style={[styles.qCard, { backgroundColor: th.card }]}>
        <Text style={{ fontSize: 10, color: th.textLight, fontWeight: "700", marginBottom: 4 }}>🖼️ WÊNEYÊ RAST HILBIJÊRE</Text>
        <Text style={{ fontSize: 16, fontWeight: "700", color: th.text, textAlign: "center" }}>{step.question}</Text>
      </View>

      <View style={styles.grid}>
        {step.actions.map((a, i) => {
          let bc = th.cardBorder;
          if (done && i === step.correct) bc = th.correct;
          else if (done && i === sel && !ok) bc = th.wrong;

          return (
            <Pressable key={i} onPress={() => pick(i)} style={[styles.gridItem, {
              borderColor: bc,
              backgroundColor: done && i === step.correct ? th.correct + "10" : done && i === sel && !ok ? th.wrong + "10" : th.card,
            }]}>
              <Text style={{ fontSize: 46 }}>{ACTION_EMOJI[a] ?? "🎬"}</Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: th.textMid }}>{step.labels[i]}</Text>
            </Pressable>
          );
        })}
      </View>

      {done && <Btn onPress={onNext} th={th} variant={ok ? "correct" : "primary"}>{t.next}</Btn>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 32, gap: 12 },
  kevo: { alignItems: "center" },
  feedback: { borderWidth: 2, borderRadius: 14, padding: 10, alignItems: "center" },
  qCard: { borderRadius: 16, padding: 14, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridItem: { width: "47%", borderRadius: 16, borderWidth: 2.5, padding: 10, alignItems: "center", justifyContent: "center", gap: 4, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
});
