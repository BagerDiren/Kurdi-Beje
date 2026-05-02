import { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Btn } from "@/components/ui-kit";
import type { AppTheme } from "@/data/themes";

type WordItem = { ku: string; tr: string; emoji: string };
type Props = { th: AppTheme; pool: WordItem[]; onXp?: (n: number) => void; onBack?: () => void };

type Card = { id: number; text: string; pairId: number; flipped: boolean; matched: boolean };

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);

function buildDeck(pool: WordItem[]): Card[] {
  const items = shuffle(pool).slice(0, 6);
  const cards: Card[] = [];
  items.forEach((w, i) => {
    cards.push({ id: i * 2, text: w.ku, pairId: i, flipped: false, matched: false });
    cards.push({ id: i * 2 + 1, text: w.tr, pairId: i, flipped: false, matched: false });
  });
  return shuffle(cards);
}

export function WordMatchGame({ th, pool, onXp, onBack }: Props) {
  const [cards, setCards] = useState(() => buildDeck(pool));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const matched = cards.filter(c => c.matched).length;
  const won = matched === 12;

  const tap = useCallback((id: number) => {
    const card = cards.find(c => c.id === id);
    if (!card || card.matched || card.flipped || flipped.length >= 2) return;

    const next = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    const nextFlipped = [...flipped, id];
    setCards(next);
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = nextFlipped.map(fid => next.find(c => c.id === fid)!);
      if (a.pairId === b.pairId) {
        setCards(prev => prev.map(c => c.pairId === a.pairId ? { ...c, matched: true } : c));
        setFlipped([]);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => nextFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setFlipped([]);
        }, 700);
      }
    }
  }, [cards, flipped]);

  const reset = () => { setCards(buildDeck(pool)); setFlipped([]); setMoves(0); };

  if (won) {
    const xp = Math.max(1, 12 - moves);
    return (
      <LinearGradient colors={[th.bg, th.bgDark]} style={s.fill}>
        <ScrollView contentContainerStyle={s.center}>
          <Text style={{ fontSize: 48 }}>🎉</Text>
          <Text style={[s.title, { color: th.text }]}>{moves} hamle</Text>
          <Text style={{ color: th.accent, fontSize: 18, marginTop: 4 }}>+{xp} XP</Text>
          <View style={{ width: "80%", marginTop: 16 }}>
            <Btn th={th} onPress={reset}>Tekrar</Btn>
            <View style={{ height: 10 }} />
            <Btn th={th} onPress={() => { onXp?.(xp); onBack?.(); }}>Geri</Btn>
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
          <Text style={{ color: th.textMid, fontSize: 16 }}>Hamle: {moves}</Text>
        </View>
        <View style={s.grid}>
          {cards.map(c => {
            const show = c.flipped || c.matched;
            return (
              <Pressable key={c.id} onPress={() => tap(c.id)}
                style={[s.card, { backgroundColor: c.matched ? th.correct : show ? th.card : th.primary, borderColor: th.cardBorder }]}>
                <Text style={[s.cardTxt, { color: show ? th.text : "#fff" }]}>
                  {show ? c.text : "?"}
                </Text>
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
  title: { fontSize: 24, fontWeight: "800", marginTop: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", width: "100%" },
  card: { width: "30%", aspectRatio: 1, margin: "1.5%", borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  cardTxt: { fontSize: 16, fontWeight: "700", textAlign: "center" },
});
