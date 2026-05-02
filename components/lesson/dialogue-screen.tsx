import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Bar, Btn } from "@/components/ui-kit";
import type { DialogueStep } from "@/data/lessons";
import type { AppTheme } from "@/data/themes";
import type { Translations } from "@/data/translations";

type Props = {
  step: DialogueStep;
  onNext: () => void;
  lp: number; ts: number;
  th: AppTheme; t: Translations;
};

export function DialogueScreen({ step, onNext, lp, ts, th, t }: Props) {
  const [vis, setVis] = useState(1);
  const [showTr, setShowTr] = useState(false);
  const allVis = vis >= step.lines.length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: th.bg }} contentContainerStyle={styles.container}>
      <Bar value={lp} max={ts} th={th} />

      <LinearGradient colors={th.headerGrad as unknown as readonly [string, string, ...string[]]} style={styles.header}>
        <Text style={styles.headerSetting}>{step.setting}</Text>
        <Text style={styles.headerTitle}>💬 {step.title}</Text>
      </LinearGradient>

      <View style={styles.trToggle}>
        <Pressable onPress={() => setShowTr(!showTr)} style={[styles.trBtn, {
          backgroundColor: showTr ? th.primary + "15" : th.bgDark,
          borderColor: showTr ? th.primary : th.cardBorder,
        }]}>
          <Text style={{ fontSize: 10, fontWeight: "600", color: showTr ? th.primary : th.textLight }}>
            {showTr ? "🔓 Werger" : "🔒 Werger"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.lines}>
        {step.lines.slice(0, vis).map((l, i) => {
          const isLeft = i % 2 === 0;
          return (
            <View key={i} style={[styles.lineRow, { flexDirection: isLeft ? "row" : "row-reverse" }]}>
              <View style={[styles.avatar, {
                backgroundColor: isLeft ? th.primary + "15" : th.accent + "20",
                borderColor: isLeft ? th.primary + "30" : th.accent + "30",
              }]}>
                <Text style={{ fontSize: 18 }}>{l.emoji}</Text>
              </View>
              <View style={[styles.bubble, {
                backgroundColor: isLeft ? th.card : th.primary + "08",
                borderColor: th.cardBorder,
                borderTopLeftRadius: isLeft ? 4 : 14,
                borderTopRightRadius: isLeft ? 14 : 4,
              }]}>
                <Text style={{ fontSize: 9, fontWeight: "700", color: isLeft ? th.primary : th.accent, marginBottom: 2 }}>{l.speaker}</Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: th.text, lineHeight: 20 }}>{l.text}</Text>
                {showTr && <Text style={{ fontSize: 11, color: th.textLight, marginTop: 3, fontStyle: "italic" }}>{l.tr}</Text>}
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />
      {!allVis ? (
        <Btn onPress={() => setVis(v => v + 1)} th={th}>Dûmahîk... ({vis}/{step.lines.length})</Btn>
      ) : (
        <Btn onPress={onNext} th={th}>{t.next}</Btn>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 32, gap: 8 },
  header: { borderRadius: 14, padding: 12, alignItems: "center" },
  headerSetting: { fontSize: 11, color: "rgba(255,255,255,0.6)" },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#fff" },
  trToggle: { alignItems: "flex-end" },
  trBtn: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3 },
  lines: { gap: 6 },
  lineRow: { gap: 6, alignItems: "flex-start" },
  avatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  bubble: { maxWidth: "75%", borderRadius: 14, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, padding: 10, borderWidth: 1 },
});
