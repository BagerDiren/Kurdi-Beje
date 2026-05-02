import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Btn } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import { SOUND_POOL } from "@/data/game-data";
import type { AppTheme } from "@/data/themes";
import type { Translations } from "@/data/translations";

type Props = { th: AppTheme; t: Translations; onXp?: (n: number) => void; onBack?: () => void };

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const TOTAL = 8;

export function AnimalSoundGame({ th, t, onXp, onBack }: Props) {
  const rounds = useMemo(() => {
    const pool = shuffle(SOUND_POOL);
    return pool.slice(0, TOTAL).map(target => {
      const wrongs = shuffle(pool.filter(p => p.emoji !== target.emoji)).slice(0, 3);
      const opts = shuffle([target, ...wrongs]);
      return { target, opts, correctIdx: opts.findIndex(o => o.emoji === target.emoji) };
    });
  }, []);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const done = idx >= TOTAL;

  const choose = (i: number) => {
    if (selected !== null) return;
    const round = rounds[idx];
    if (i === round.correctIdx) {
      setSelected(i);
      setScore(s => s + 1);
      setTimeout(() => { setSelected(null); setIdx(x => x + 1); }, 600);
    } else {
      setWrongPick(i);
      setTimeout(() => setWrongPick(null), 500);
    }
  };

  if (done) {
    return (
      <LinearGradient colors={[th.bg, th.bgDark]} style={s.fill}>
        <ScrollView contentContainerStyle={s.center}>
          <KevoMascot size={th.kevoSize} mood="happy" />
          <Text style={[s.title, { color: th.text }]}>{t.score}: {score}/{TOTAL}</Text>
          <Text style={{ color: th.accent, fontSize: 18 }}>+{score} XP</Text>
          <View style={{ width: "80%", marginTop: 16 }}>
            <Btn th={th} onPress={() => { onXp?.(score); onBack?.(); }}>{t.backHome}</Btn>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  const round = rounds[idx];
  return (
    <LinearGradient colors={[th.bg, th.bgDark]} style={s.fill}>
      <ScrollView contentContainerStyle={s.center}>
        <View style={s.topRow}>
          <Pressable onPress={onBack}><Text style={{ color: th.textMid, fontSize: 18 }}>{"<"}</Text></Pressable>
          <Text style={{ color: th.textMid }}>{idx + 1}/{TOTAL}</Text>
        </View>
        <Pressable style={[s.speaker, { backgroundColor: th.accent }]}>
          <Text style={{ fontSize: 48 }}>🔊</Text>
        </Pressable>
        <Text style={[s.hint, { color: th.textMid }]}>{round.target.ku}</Text>
        <View style={s.grid}>
          {round.opts.map((o, i) => {
            const bg = selected === i ? th.correct : wrongPick === i ? th.wrong : th.card;
            return (
              <Pressable key={i} onPress={() => choose(i)}
                style={[s.emojiCard, { backgroundColor: bg, borderColor: th.cardBorder }]}>
                <Text style={{ fontSize: th.emojiSize }}>{o.emoji}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 16 },
  topRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", marginTop: 8 },
  speaker: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginVertical: 12 },
  hint: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", width: "100%" },
  emojiCard: { width: "42%", aspectRatio: 1, margin: "3%", borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
