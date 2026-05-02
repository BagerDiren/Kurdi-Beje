import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Btn } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import type { AppTheme } from "@/data/themes";
import type { Translations } from "@/data/translations";

type WordItem = { ku: string; tr: string; emoji: string };
type Props = { th: AppTheme; t: Translations; pool: WordItem[]; onXp?: (n: number) => void; onBack?: () => void };

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const pick = (arr: WordItem[], n: number) => shuffle(arr).slice(0, n);

export function SpeedQuiz({ th, t, pool, onXp, onBack }: Props) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(8);
  const [selected, setSelected] = useState<number | null>(null);
  const [question, setQuestion] = useState<{ target: WordItem; opts: string[]; correctIdx: number; reverse: boolean } | null>(null);
  const over = lives <= 0;

  const buildQ = useCallback(() => {
    const reverse = round > 0 && (round + 1) % 3 === 0;
    const target = pool[Math.floor(Math.random() * pool.length)];
    const wrongs = pick(pool.filter(w => w.ku !== target.ku), 3).map(w => reverse ? w.ku : w.tr);
    const correct = reverse ? target.ku : target.tr;
    const opts = shuffle([correct, ...wrongs]);
    setQuestion({ target, opts, correctIdx: opts.indexOf(correct), reverse });
    const limit = Math.max(4, 8 - Math.floor(round / 3));
    setTime(limit);
    setSelected(null);
  }, [pool, round]);

  useEffect(() => { if (!over) buildQ(); }, [round, over]);

  useEffect(() => {
    if (over || selected !== null) return;
    if (time <= 0) { setLives(l => l - 1); setRound(r => r + 1); return; }
    const id = setTimeout(() => setTime(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [time, over, selected]);

  const choose = (i: number) => {
    if (selected !== null || !question) return;
    setSelected(i);
    if (i === question.correctIdx) setScore(s => s + 1);
    else setLives(l => l - 1);
    setTimeout(() => setRound(r => r + 1), 800);
  };

  if (over) {
    return (
      <LinearGradient colors={[th.bg, th.bgDark]} style={s.fill}>
        <ScrollView contentContainerStyle={s.center}>
          <KevoMascot size={th.kevoSize} mood="happy" />
          <Text style={[s.title, { color: th.text }]}>{t.score}: {score}</Text>
          <View style={{ width: "80%", marginTop: 16 }}>
            <Btn th={th} onPress={() => { setScore(0); setLives(3); setRound(0); }}>
              {t.tryAgain}
            </Btn>
            <View style={{ height: 10 }} />
            <Btn th={th} onPress={() => { onXp?.(score); onBack?.(); }}>{t.backHome}</Btn>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  if (!question) return null;

  return (
    <LinearGradient colors={[th.bg, th.bgDark]} style={s.fill}>
      <ScrollView contentContainerStyle={s.center}>
        <View style={s.topRow}>
          <Pressable onPress={onBack}><Text style={{ color: th.textMid, fontSize: 18 }}>{"<"} </Text></Pressable>
          <Text style={{ color: th.wrong, fontSize: 18 }}>{"❤️".repeat(lives)}</Text>
          <Text style={[s.timer, { color: time <= 3 ? th.wrong : th.accent }]}>{time}s</Text>
        </View>
        <Text style={{ fontSize: th.emojiSize, textAlign: "center", marginVertical: 8 }}>
          {question.reverse ? "" : question.target.emoji}
        </Text>
        <Text style={[s.word, { color: th.text }]}>
          {question.reverse ? question.target.tr : question.target.ku}
        </Text>
        <View style={{ width: "90%", marginTop: 12 }}>
          {question.opts.map((o, i) => {
            const isCorrect = i === question.correctIdx;
            const bg = selected === null ? th.card : isCorrect ? th.correct : i === selected ? th.wrong : th.card;
            return (
              <Pressable key={i} onPress={() => choose(i)} style={[s.opt, { backgroundColor: bg, borderColor: th.cardBorder }]}>
                <Text style={[s.optTxt, { color: selected !== null && isCorrect ? "#fff" : th.text }]}>{o}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={{ color: th.textLight, marginTop: 8 }}>{t.score}: {score}</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 16 },
  topRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 8 },
  timer: { fontSize: 22, fontWeight: "700" },
  word: { fontSize: 26, fontWeight: "700", textAlign: "center" },
  title: { fontSize: 28, fontWeight: "800", marginTop: 12 },
  opt: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  optTxt: { fontSize: 17, fontWeight: "600", textAlign: "center" },
});
