import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Bar, Btn } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import type { FillStep } from "@/data/lessons";
import type { AppTheme } from "@/data/themes";
import type { Translations } from "@/data/translations";

type Props = {
  step: FillStep;
  onNext: () => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  lp: number; ts: number;
  th: AppTheme; t: Translations;
};

export function FillScreen({ step, onNext, onCorrect, onWrong, lp, ts, th, t }: Props) {
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const ok = sel === step.correct;
  const parts = step.sentence.split("___");

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
        <KevoMascot size={th.kevoSize - 10} mood={done ? (ok ? "happy" : "sad") : "neutral"} />
      </View>

      {done && (
        <View style={[styles.feedback, { backgroundColor: (ok ? th.correct : th.wrong) + "15", borderColor: (ok ? th.correct : th.wrong) + "40" }]}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: ok ? th.correct : th.wrong }}>
            {ok ? "Aferîn! 🎉" : `Rast: "${step.options[step.correct]}" 😅`}
          </Text>
        </View>
      )}

      {step.hint ? <Text style={styles.hint}>{step.hint}</Text> : null}

      <View style={[styles.card, { backgroundColor: th.card }]}>
        <Text style={{ fontSize: 10, color: th.textLight, fontWeight: "700", marginBottom: 6 }}>{t.fillTitle}</Text>
        <Text style={[styles.sentenceText, { color: th.text }]}>
          {parts[0]}
          <Text style={{
            borderBottomWidth: 3,
            borderBottomColor: done ? (ok ? th.correct : th.wrong) : th.primary,
            color: done ? (ok ? th.correct : th.wrong) : th.primary,
            fontWeight: "800",
          }}>
            {sel !== null ? step.options[sel] : "?"}
          </Text>
          {parts[1]}
        </Text>
        <Text style={{ fontSize: 12, color: th.textLight, marginTop: 6 }}>{step.sentenceTr}</Text>
      </View>

      <View style={styles.opts}>
        {step.options.map((o, i) => {
          let bg = th.card;
          let bc = th.cardBorder;
          if (done && i === step.correct) { bg = th.correct + "15"; bc = th.correct; }
          else if (done && i === sel && !ok) { bg = th.wrong + "15"; bc = th.wrong; }
          return (
            <Pressable key={i} onPress={() => pick(i)} style={[styles.opt, { backgroundColor: bg, borderColor: bc }]}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: th.text, textAlign: "center" }}>{o}</Text>
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
  hint: { fontSize: 26, textAlign: "center" },
  card: { borderRadius: 18, padding: 20, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  sentenceText: { fontSize: 20, fontWeight: "700", lineHeight: 32, textAlign: "center" },
  opts: { flexDirection: "row", gap: 8 },
  opt: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 2, alignItems: "center" },
});
