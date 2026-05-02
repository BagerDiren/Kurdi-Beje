import { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Bar, Btn } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import type { SceneStep } from "@/data/lessons";
import type { AppTheme } from "@/data/themes";
import type { Translations } from "@/data/translations";

type Props = {
  step: SceneStep;
  onNext: () => void;
  lp: number; ts: number;
  th: AppTheme; t: Translations;
};

export function SceneScreen({ step, onNext, lp, ts, th, t }: Props) {
  const [rev, setRev] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [frame, setFrame] = useState(0);

  const frames = [
    { label: step.person + "...", showEmoji: true },
    { label: step.full, showEmoji: true },
    { label: step.fullTr, showEmoji: false },
  ];

  useEffect(() => {
    if (!playing) return;
    const tm = setInterval(() => setFrame(f => (f + 1) % frames.length), 2500);
    return () => clearInterval(tm);
  }, [playing, frames.length]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: th.bg }} contentContainerStyle={styles.container}>
      <Bar value={lp} max={ts} th={th} />

      <View style={[styles.sceneCard, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
        <View style={[styles.sceneHeader, { backgroundColor: th.primary + "15" }]}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: th.primary }}>📹 VÎDYO</Text>
          <View style={styles.dots}>
            {frames.map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: i === frame ? th.primary : th.primary + "30" }]} />
            ))}
          </View>
        </View>

        <View style={styles.sceneContent}>
          {frames[frame].showEmoji ? (
            <Text style={{ fontSize: 64, textAlign: "center" }}>{step.scene}</Text>
          ) : (
            <KevoMascot size={80} mood="happy" speaking />
          )}
          <Text style={[styles.frameLabel, { color: th.text }]}>{frames[frame].label}</Text>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={() => setFrame(f => (f - 1 + frames.length) % frames.length)} style={[styles.ctrlBtn, { backgroundColor: th.bgDark }]}>
            <Text style={{ fontSize: 14 }}>⏮</Text>
          </Pressable>
          <Pressable onPress={() => setPlaying(!playing)} style={styles.playBtn}>
            <LinearGradient colors={[th.primary, th.primaryLight]} style={styles.playBtnInner}>
              <Text style={{ fontSize: 18, color: "#fff" }}>{playing ? "⏸" : "▶"}</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => setFrame(f => (f + 1) % frames.length)} style={[styles.ctrlBtn, { backgroundColor: th.bgDark }]}>
            <Text style={{ fontSize: 14 }}>⏭</Text>
          </Pressable>
        </View>
      </View>

      <LinearGradient colors={[th.primary, th.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.verbStrip}>
        <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{step.person}</Text>
        <Text style={styles.verbText}>{step.verb}</Text>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: "600" }}>{step.meaning}</Text>
      </LinearGradient>

      {!rev ? (
        <Pressable onPress={() => setRev(true)} style={[styles.tipBtn, { borderColor: th.accent, backgroundColor: th.accent + "20" }]}>
          <Text style={{ fontSize: 12, color: th.accent, fontWeight: "600" }}>{t.tipLabel}</Text>
        </Pressable>
      ) : (
        <View style={[styles.tipBox, { borderColor: th.accent + "30", backgroundColor: th.accent + "15" }]}>
          <Text style={{ fontSize: 12, color: th.text, lineHeight: 20 }}>💡 {step.tip}</Text>
        </View>
      )}

      <View style={{ flex: 1 }} />
      <Btn onPress={onNext} th={th}>{t.next}</Btn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 32, gap: 10 },
  sceneCard: { borderRadius: 20, overflow: "hidden", borderWidth: 1.5, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  sceneHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 6 },
  dots: { flexDirection: "row", gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  sceneContent: { padding: 16, alignItems: "center", minHeight: 170, justifyContent: "center" },
  frameLabel: { fontSize: 16, fontWeight: "700", marginTop: 8, textAlign: "center" },
  controls: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12, paddingVertical: 10, paddingBottom: 14 },
  ctrlBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  playBtn: { width: 44, height: 44, borderRadius: 22, overflow: "hidden" },
  playBtnInner: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  verbStrip: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, padding: 12 },
  verbText: { fontSize: 20, fontWeight: "800", color: "#fff", flex: 1 },
  tipBtn: { borderRadius: 12, borderWidth: 1.5, borderStyle: "dashed", padding: 12 },
  tipBox: { borderRadius: 12, borderWidth: 1, padding: 12 },
});
