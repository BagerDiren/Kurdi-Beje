import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Bar, Btn } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import type { PickStep } from "@/data/lessons";
import type { AppTheme } from "@/data/themes";
import type { Translations } from "@/data/translations";

type Props = {
  step: PickStep;
  onNext: () => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  lp: number; ts: number;
  th: AppTheme; t: Translations;
};

export function PickScreen({ step, onNext, onCorrect, onWrong, lp, ts, th, t }: Props) {
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
        <KevoMascot size={th.kevoSize - 10} mood={done ? (ok ? "happy" : "sad") : "neutral"} speaking={done} />
      </View>

      {done && (
        <View style={[styles.feedback, { backgroundColor: (ok ? th.correct : th.wrong) + "15", borderColor: (ok ? th.correct : th.wrong) + "40" }]}>
          <Text style={[styles.feedbackText, { color: ok ? th.correct : th.wrong }]}>
            {ok ? "Aferîn! 🎉" : `Rast: "${step.options[step.correct]}" 😅`}
          </Text>
        </View>
      )}

      <View style={[styles.qCard, { backgroundColor: th.card }]}>
        <Text style={[styles.qText, { color: th.text }]}>{step.question}</Text>
      </View>

      <View style={styles.options}>
        {step.options.map((o, i) => {
          let bg = th.card;
          let bc = th.cardBorder;
          if (done && i === step.correct) { bg = th.correct + "15"; bc = th.correct; }
          else if (done && i === sel && !ok) { bg = th.wrong + "15"; bc = th.wrong; }

          return (
            <Pressable key={i} onPress={() => pick(i)} style={[styles.option, { backgroundColor: bg, borderColor: bc }]}>
              <View style={[styles.optCircle, {
                backgroundColor: done && i === step.correct ? th.correct : done && i === sel && !ok ? th.wrong : th.bgDark,
              }]}>
                <Text style={[styles.optCircleText, {
                  color: done && (i === step.correct || (i === sel && !ok)) ? "#fff" : th.textMid,
                }]}>
                  {done && i === step.correct ? "✓" : done && i === sel && !ok ? "✗" : String.fromCharCode(65 + i)}
                </Text>
              </View>
              <Text style={[styles.optText, { color: th.text }]}>{o}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />
      {done && <Btn onPress={onNext} th={th} variant={ok ? "correct" : "primary"}>{t.next}</Btn>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 32, gap: 12 },
  kevo: { alignItems: "center" },
  feedback: { borderWidth: 2, borderRadius: 14, padding: 10, alignItems: "center" },
  feedbackText: { fontSize: 14, fontWeight: "700" },
  qCard: { borderRadius: 16, padding: 16, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  qText: { fontSize: 15, fontWeight: "700", textAlign: "center" },
  options: { gap: 8 },
  option: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 2 },
  optCircle: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  optCircleText: { fontSize: 13, fontWeight: "700" },
  optText: { fontSize: 15, fontWeight: "600" },
});
