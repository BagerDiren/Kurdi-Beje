import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Bar, Btn } from "@/components/ui-kit";
import type { MatchStep } from "@/data/lessons";
import type { AppTheme } from "@/data/themes";
import type { Translations } from "@/data/translations";

type Props = {
  step: MatchStep;
  onNext: () => void;
  onCorrect?: () => void;
  lp: number; ts: number;
  th: AppTheme; t: Translations;
};

export function MatchScreen({ step, onNext, onCorrect, lp, ts, th, t }: Props) {
  const [sw, setSw] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ word: string; meaning: string } | null>(null);
  const [shuffled] = useState(() => [...step.pairs].sort(() => Math.random() - 0.5));

  const allDone = matched.length === step.pairs.length;

  const handleMeaning = (meaning: string) => {
    if (!sw || allDone) return;
    const pair = step.pairs.find(x => x.word === sw);
    if (pair && pair.meaning === meaning) {
      const nm = [...matched, sw];
      setMatched(nm);
      setSw(null);
      if (nm.length === step.pairs.length) onCorrect?.();
    } else {
      setWrongPair({ word: sw, meaning });
      setTimeout(() => { setWrongPair(null); setSw(null); }, 600);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: th.bg }} contentContainerStyle={styles.container}>
      <Bar value={lp} max={ts} th={th} />

      <View style={[styles.instrCard, { backgroundColor: th.card }]}>
        <Text style={[styles.instrText, { color: th.text }]}>🔗 {step.instruction}</Text>
      </View>

      {allDone && (
        <View style={[styles.feedback, { backgroundColor: th.correct + "15", borderColor: th.correct + "40" }]}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: th.correct }}>Hemû rast! 🎉</Text>
        </View>
      )}

      <View style={styles.columns}>
        {/* Sol: kelimeler */}
        <View style={styles.col}>
          {step.pairs.map(p => {
            const im = matched.includes(p.word);
            const is = sw === p.word;
            const iw = wrongPair?.word === p.word;
            return (
              <Pressable key={p.word} onPress={() => !im && setSw(p.word)} style={[
                styles.cell,
                { backgroundColor: im ? th.correct + "15" : iw ? th.wrong + "15" : is ? th.primary + "15" : th.card,
                  borderColor: im ? th.correct : iw ? th.wrong : is ? th.primary : th.cardBorder,
                  opacity: im ? 0.5 : 1 },
              ]}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: im ? th.correct : is ? th.primary : th.text }}>
                  {im ? "✓ " : ""}{p.word}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Sağ: anlamlar */}
        <View style={styles.col}>
          {shuffled.map(p => {
            const mw = step.pairs.find(x => x.meaning === p.meaning);
            const im = matched.includes(mw?.word ?? "");
            const iw = wrongPair?.meaning === p.meaning;
            return (
              <Pressable key={p.meaning} onPress={() => handleMeaning(p.meaning)} style={[
                styles.cell,
                { backgroundColor: im ? th.correct + "15" : iw ? th.wrong + "15" : th.card,
                  borderColor: im ? th.correct : iw ? th.wrong : th.cardBorder,
                  opacity: im ? 0.5 : 1 },
              ]}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: im ? th.correct : th.text }}>
                  {im ? "✓ " : ""}{p.meaning}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {allDone && <Btn onPress={onNext} th={th} variant="correct">{t.next}</Btn>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 32, gap: 10 },
  instrCard: { borderRadius: 14, padding: 10, alignItems: "center" },
  instrText: { fontSize: 14, fontWeight: "700" },
  feedback: { borderWidth: 2, borderRadius: 12, padding: 8, alignItems: "center" },
  columns: { flexDirection: "row", gap: 10, flex: 1 },
  col: { flex: 1, gap: 6 },
  cell: { padding: 10, borderRadius: 10, borderWidth: 2, alignItems: "center" },
});
