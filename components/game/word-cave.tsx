import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Btn } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import { CAVE_WORDS } from "@/data/game-data";
import type { AppTheme } from "@/data/themes";
import type { Translations } from "@/data/translations";

type Props = { th: AppTheme; t: Translations; onXp?: (n: number) => void; onBack?: () => void };

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const TOTAL = 6;
const EXTRAS = "ABCDEFGHİJKLMNOPRSTUVWXYZ";

function makeLetters(word: string) {
  const base = word.split("");
  const extra: string[] = [];
  while (extra.length < 3) {
    const c = EXTRAS[Math.floor(Math.random() * EXTRAS.length)];
    if (!base.includes(c) && !extra.includes(c)) extra.push(c);
  }
  return shuffle([...base, ...extra]);
}

export function WordCaveGame({ th, t, onXp, onBack }: Props) {
  const rounds = useMemo(() => shuffle(CAVE_WORDS).slice(0, TOTAL), []);
  const [idx, setIdx] = useState(0);
  const [filled, setFilled] = useState<string[]>([]);
  const [letters, setLetters] = useState<string[]>(() => makeLetters(rounds[0].word));
  const [wrongLetter, setWrongLetter] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = idx >= TOTAL;
  const current = rounds[idx] as (typeof CAVE_WORDS)[0] | undefined;
  const wordDone = current ? filled.length >= current.word.length : false;

  const tapLetter = (letter: string, li: number) => {
    if (!current || wordDone) return;
    const expected = current.word[filled.length];
    if (letter === expected) {
      setFilled(f => [...f, letter]);
      if (filled.length + 1 === current.word.length) setScore(s => s + 1);
    } else {
      setWrongLetter(li);
      setTimeout(() => setWrongLetter(null), 400);
    }
  };

  const next = () => {
    const ni = idx + 1;
    setIdx(ni);
    setFilled([]);
    if (ni < TOTAL) setLetters(makeLetters(rounds[ni].word));
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

  return (
    <LinearGradient colors={[th.bg, th.bgDark]} style={s.fill}>
      <ScrollView contentContainerStyle={s.center}>
        <View style={s.topRow}>
          <Pressable onPress={onBack}><Text style={{ color: th.textMid, fontSize: 18 }}>{"<"}</Text></Pressable>
          <Text style={{ color: th.textMid }}>{idx + 1}/{TOTAL}</Text>
        </View>
        <Text style={{ fontSize: th.emojiSize, marginBottom: 8 }}>{current?.emoji}</Text>
        <Text style={{ color: th.textLight, fontSize: 14, marginBottom: 12 }}>{current?.tr}</Text>
        <View style={s.slotsRow}>
          {current?.word.split("").map((ch, i) => (
            <View key={i} style={[s.slot, { borderColor: th.primary, backgroundColor: filled[i] ? th.primaryLight : th.cardAlt }]}>
              <Text style={[s.slotTxt, { color: th.text }]}>{filled[i] || ""}</Text>
            </View>
          ))}
        </View>
        <View style={s.lettersRow}>
          {letters.map((l, i) => (
            <Pressable key={i} onPress={() => tapLetter(l, i)}
              style={[s.letterBtn, { backgroundColor: wrongLetter === i ? th.wrong : th.card, borderColor: th.cardBorder }]}>
              <Text style={[s.letterTxt, { color: th.text }]}>{l}</Text>
            </Pressable>
          ))}
        </View>
        {wordDone && (
          <View style={{ width: "80%", marginTop: 16 }}>
            <Text style={{ color: th.correct, textAlign: "center", fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
              {t.great}
            </Text>
            <Btn th={th} onPress={next}>Sonraki</Btn>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 16 },
  topRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", marginTop: 8 },
  slotsRow: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  slot: { width: 44, height: 52, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center", marginHorizontal: 4 },
  slotTxt: { fontSize: 22, fontWeight: "800" },
  lettersRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  letterBtn: { width: 50, height: 50, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center", margin: 5 },
  letterTxt: { fontSize: 20, fontWeight: "700" },
});
