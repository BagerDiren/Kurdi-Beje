import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Btn } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import { SENTENCES } from "@/data/game-data";
import type { AppTheme } from "@/data/themes";

type Props = { th: AppTheme; onXp?: (n: number) => void; onBack?: () => void };

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const TOTAL = 5;

export function SentenceGame({ th, onXp, onBack }: Props) {
  const rounds = useMemo(() => shuffle(SENTENCES).slice(0, TOTAL), []);
  const [idx, setIdx] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>(() => shuffle([...rounds[0].ku]));
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const done = idx >= TOTAL;

  const current = rounds[idx] as (typeof SENTENCES)[0] | undefined;

  const tapWord = (word: string, fromPlaced: boolean) => {
    if (result) return;
    if (fromPlaced) {
      setPlaced(p => { const i = p.indexOf(word); return [...p.slice(0, i), ...p.slice(i + 1)]; });
      setAvailable(a => [...a, word]);
    } else {
      setAvailable(a => { const i = a.indexOf(word); return [...a.slice(0, i), ...a.slice(i + 1)]; });
      setPlaced(p => [...p, word]);
    }
  };

  const check = () => {
    if (!current) return;
    const ok = placed.join(" ") === current.ku.join(" ");
    setResult(ok ? "correct" : "wrong");
    if (ok) setScore(s => s + 1);
  };

  const next = () => {
    const ni = idx + 1;
    setIdx(ni);
    setResult(null);
    setPlaced([]);
    if (ni < TOTAL) setAvailable(shuffle([...rounds[ni].ku]));
  };

  if (done) {
    return (
      <LinearGradient colors={[th.bg, th.bgDark]} style={st.fill}>
        <ScrollView contentContainerStyle={st.center}>
          <KevoMascot size={th.kevoSize} mood="happy" />
          <Text style={[st.title, { color: th.text }]}>{score}/{TOTAL}</Text>
          <Text style={{ color: th.accent, fontSize: 18 }}>+{score} XP</Text>
          <View style={{ width: "80%", marginTop: 16 }}>
            <Btn th={th} onPress={() => { onXp?.(score); onBack?.(); }}>Geri</Btn>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[th.bg, th.bgDark]} style={st.fill}>
      <ScrollView contentContainerStyle={st.center}>
        <View style={st.topRow}>
          <Pressable onPress={onBack}><Text style={{ color: th.textMid, fontSize: 18 }}>{"<"}</Text></Pressable>
          <Text style={{ color: th.textMid }}>{idx + 1}/{TOTAL}</Text>
        </View>
        <Text style={[st.trText, { color: th.textMid }]}>{current?.tr}</Text>
        <View style={[st.slotArea, { borderColor: th.cardBorder, backgroundColor: th.cardAlt }]}>
          {placed.length === 0 && <Text style={{ color: th.textLight }}>...</Text>}
          <View style={st.row}>
            {placed.map((w, i) => (
              <Pressable key={i} onPress={() => tapWord(w, true)}
                style={[st.chip, { backgroundColor: result === "wrong" ? th.wrong : th.primary }]}>
                <Text style={st.chipTxt}>{w}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={st.row}>
          {available.map((w, i) => (
            <Pressable key={i} onPress={() => tapWord(w, false)}
              style={[st.chip, { backgroundColor: th.card, borderWidth: 1, borderColor: th.cardBorder }]}>
              <Text style={[st.chipTxt, { color: th.text }]}>{w}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ width: "80%", marginTop: 16 }}>
          {result ? (
            <Btn th={th} onPress={next}>Sonraki</Btn>
          ) : (
            <Btn th={th} onPress={check} disabled={placed.length === 0}>Kontrol Et</Btn>
          )}
        </View>
        {result && (
          <Text style={{ color: result === "correct" ? th.correct : th.wrong, fontSize: 18, marginTop: 8, fontWeight: "700" }}>
            {result === "correct" ? "Rast e!" : current?.ku.join(" ")}
          </Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 16 },
  topRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", marginTop: 8 },
  trText: { fontSize: 20, fontWeight: "600", marginBottom: 12, textAlign: "center" },
  slotArea: { width: "100%", minHeight: 56, borderRadius: 14, borderWidth: 1, padding: 10, marginBottom: 16, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, margin: 4 },
  chipTxt: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
