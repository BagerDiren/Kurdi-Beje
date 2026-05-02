import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Btn } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import { HIDDEN_POOL } from "@/data/game-data";
import type { AppTheme } from "@/data/themes";
import type { Translations } from "@/data/translations";

type Props = { th: AppTheme; t: Translations; onXp?: (n: number) => void; onBack?: () => void };

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const TOTAL = 6;
const TILES = 16;
const REVEAL_THRESHOLD = Math.ceil(TILES * 0.55);

export function HiddenImageGame({ th, t, onXp, onBack }: Props) {
  const rounds = useMemo(() => shuffle(HIDDEN_POOL).slice(0, TOTAL), []);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState<boolean[]>(Array(TILES).fill(false));
  const [asking, setAsking] = useState(false);
  const [opts, setOpts] = useState<string[]>([]);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const done = idx >= TOTAL;

  const revealedCount = revealed.filter(Boolean).length;
  const current = rounds[idx] as (typeof HIDDEN_POOL)[0] | undefined;

  const tapTile = (i: number) => {
    if (asking || revealed[i]) return;
    const next = [...revealed];
    next[i] = true;
    setRevealed(next);
    const count = next.filter(Boolean).length;
    if (count >= REVEAL_THRESHOLD && !asking) {
      const wrongs = shuffle(HIDDEN_POOL.filter(p => p.emoji !== current?.emoji)).slice(0, 3).map(p => p.tr);
      setOpts(shuffle([current!.tr, ...wrongs]));
      setAsking(true);
    }
  };

  const answer = (o: string) => {
    if (answered !== null) return;
    const ok = o === current?.tr;
    setAnswered(ok);
    if (ok) setScore(s => s + 1);
  };

  const next = () => {
    setIdx(i => i + 1);
    setRevealed(Array(TILES).fill(false));
    setAsking(false);
    setAnswered(null);
    setOpts([]);
  };

  if (done) {
    return (
      <LinearGradient colors={[th.bg, th.bgDark]} style={s.fill}>
        <ScrollView contentContainerStyle={s.center}>
          <KevoMascot size={th.kevoSize} mood="happy" />
          <Text style={[s.title, { color: th.text }]}>{t.score}: {score}/{TOTAL}</Text>
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
        <View style={[s.imgWrap, { backgroundColor: th.cardAlt }]}>
          <Text style={{ fontSize: 100, position: "absolute" }}>{current?.emoji}</Text>
          <View style={s.tileGrid}>
            {revealed.map((r, i) => (
              <Pressable key={i} onPress={() => tapTile(i)}
                style={[s.tile, { backgroundColor: r ? "transparent" : th.primary, borderColor: th.cardBorder }]} />
            ))}
          </View>
        </View>
        {asking && (
          <View style={{ width: "90%", marginTop: 12 }}>
            <Text style={[s.question, { color: th.text }]}>{t.whatIs}</Text>
            {opts.map((o, i) => {
              const bg = answered === null ? th.card : o === current?.tr ? th.correct : th.card;
              return (
                <Pressable key={i} onPress={() => answer(o)}
                  style={[s.opt, { backgroundColor: bg, borderColor: th.cardBorder }]}>
                  <Text style={{ color: th.text, fontSize: 16, fontWeight: "600" }}>{o}</Text>
                </Pressable>
              );
            })}
            {answered !== null && (
              <View style={{ marginTop: 8 }}><Btn th={th} onPress={next}>Sonraki</Btn></View>
            )}
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
  imgWrap: { width: 200, height: 200, borderRadius: 16, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  tileGrid: { flexDirection: "row", flexWrap: "wrap", width: 200, height: 200 },
  tile: { width: 50, height: 50, borderWidth: 0.5 },
  question: { fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  opt: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
});
