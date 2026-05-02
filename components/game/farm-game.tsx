import { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Btn } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import { FARM_ITEMS } from "@/data/game-data";
import type { AppTheme } from "@/data/themes";
import type { Translations } from "@/data/translations";

type Props = { th: AppTheme; t: Translations; onXp?: (n: number) => void; onBack?: () => void };
type Action = "av" | "nan";

export function FarmGame({ th, t, onXp, onBack }: Props) {
  const items = useMemo(() => FARM_ITEMS.slice(0, 6), []);
  const [action, setAction] = useState<Action>("av");
  const [happy, setHappy] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<number | null>(null);
  const allDone = happy.size >= items.length;

  const tapItem = (i: number) => {
    if (happy.has(i)) return;
    if (items[i].needs === action) {
      setHappy(prev => new Set(prev).add(i));
    } else {
      setWrong(i);
      setTimeout(() => setWrong(null), 500);
    }
  };

  if (allDone) {
    const xp = items.length * 2;
    return (
      <LinearGradient colors={[th.bg, th.bgDark]} style={s.fill}>
        <ScrollView contentContainerStyle={s.center}>
          <KevoMascot size={th.kevoSize} mood="happy" />
          <Text style={[s.title, { color: th.text }]}>{t.perfect}</Text>
          <Text style={{ color: th.accent, fontSize: 18, marginTop: 4 }}>+{xp} XP</Text>
          <View style={{ width: "80%", marginTop: 16 }}>
            <Btn th={th} onPress={() => { onXp?.(xp); onBack?.(); }}>{t.backHome}</Btn>
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
          <Text style={{ color: th.textMid }}>{happy.size}/{items.length}</Text>
        </View>
        <View style={s.actions}>
          <Pressable onPress={() => setAction("av")}
            style={[s.actBtn, { backgroundColor: action === "av" ? th.primary : th.card, borderColor: th.cardBorder }]}>
            <Text style={[s.actTxt, { color: action === "av" ? "#fff" : th.text }]}>Av bide 💧</Text>
          </Pressable>
          <Pressable onPress={() => setAction("nan")}
            style={[s.actBtn, { backgroundColor: action === "nan" ? th.primary : th.card, borderColor: th.cardBorder }]}>
            <Text style={[s.actTxt, { color: action === "nan" ? "#fff" : th.text }]}>Nan bide 🌾</Text>
          </Pressable>
        </View>
        <View style={s.grid}>
          {items.map((item, i) => {
            const isDone = happy.has(i);
            const isWrong = wrong === i;
            const bg = isDone ? th.correct : isWrong ? th.wrong : th.card;
            return (
              <Pressable key={i} onPress={() => tapItem(i)}
                style={[s.farmCard, { backgroundColor: bg, borderColor: th.cardBorder }]}>
                <Text style={{ fontSize: th.emojiSize }}>{isDone ? "😊" : item.emoji}</Text>
                <Text style={[s.farmName, { color: isDone ? "#fff" : th.text }]}>{item.ku}</Text>
                {isDone && <Text style={{ color: "#fff", fontSize: 12 }}>{item.done}</Text>}
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
  actions: { flexDirection: "row", marginBottom: 16 },
  actBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, borderWidth: 1, marginHorizontal: 6 },
  actTxt: { fontSize: 16, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", width: "100%" },
  farmCard: { width: "29%", margin: "2%", paddingVertical: 16, borderRadius: 16, borderWidth: 1, alignItems: "center" },
  farmName: { fontSize: 14, fontWeight: "600", marginTop: 4 },
});
