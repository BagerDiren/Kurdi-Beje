/**
 * PRACTICE HUB — yetişkin pratik merkezi.
 *
 * 4 mod:
 *   • 🎯 Kelime Quizi      → 10 random select-image (görsel + KU)
 *   • 📝 Cümle Kurma       → 10 random translate-tr-ku
 *   • 🔊 Dinleme           → 10 random tap-audio
 *   • 🔁 Karışık Tekrar    → her tipten karışık 12 egzersiz
 *
 * Egzersizler tüm müfredattaki içerikten rastgele üretilir.
 */
import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView } from "react-native";
import { DUO, DUO_RADIUS, DUO_SPACING, DUO_TYPO } from "./duo-tokens";
import { PracticeRunner } from "./practice-runner";
import { DUO_SECTIONS, shuffle, type Exercise } from "@/data/duo-content";

type Mode = "hub" | "wordQuiz" | "sentenceBuild" | "listening" | "mixed";

// =====================================================================
//  EGZERSİZ HAVUZLARI (tüm müfredattan toplanır)
// =====================================================================

function collectAllExercises(): Exercise[] {
  const out: Exercise[] = [];
  for (const sec of DUO_SECTIONS) {
    for (const u of sec.units) {
      for (const l of u.lessons) {
        out.push(...l.exercises);
      }
    }
  }
  return out;
}

function buildPracticeSet(mode: Exclude<Mode, "hub">, count = 10): Exercise[] {
  const all = collectAllExercises();
  let pool: Exercise[];
  if (mode === "wordQuiz")           pool = all.filter((e) => e.type === "select-image" || e.type === "match-pairs");
  else if (mode === "sentenceBuild") pool = all.filter((e) => e.type === "translate-tr-ku" || e.type === "translate-ku-tr" || e.type === "fill-blank");
  else if (mode === "listening")     pool = all.filter((e) => e.type === "tap-audio");
  else                               pool = all.filter((e) => e.type !== "new-word");
  return shuffle(pool).slice(0, count);
}

// =====================================================================
//  HUB ANA EKRANI
// =====================================================================

const MODES = [
  {
    id: "wordQuiz" as const,
    title: "Kelime Quizi",
    subtitle: "Görsel + ses · doğru kelimeyi seç",
    emoji: "🎯",
    color: "#1CB0F6",
    bg: "#E1F5FE",
  },
  {
    id: "sentenceBuild" as const,
    title: "Cümle Kurma",
    subtitle: "Kelimeleri sırala · cümle oluştur",
    emoji: "📝",
    color: "#9B5DE5",
    bg: "#F3E5F5",
  },
  {
    id: "listening" as const,
    title: "Dinleme Pratiği",
    subtitle: "Ses dinle · doğru sırada yaz",
    emoji: "🔊",
    color: "#FF9600",
    bg: "#FFF3E0",
  },
  {
    id: "mixed" as const,
    title: "Karışık Tekrar",
    subtitle: "Tüm tipler · 12 egzersiz",
    emoji: "🔁",
    color: "#58CC02",
    bg: "#E8F5E9",
  },
];

type Props = {
  onXp?: (xp: number) => void;
};

export function PracticeHub({ onXp }: Props) {
  const [mode, setMode] = useState<Mode>("hub");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const start = (m: Exclude<Mode, "hub">) => {
    const set = buildPracticeSet(m, m === "mixed" ? 12 : 10);
    setExercises(set);
    setMode(m);
  };

  if (mode !== "hub") {
    const cfg = MODES.find((x) => x.id === mode)!;
    return (
      <PracticeRunner
        title={cfg.title}
        subTitle={cfg.subtitle}
        exercises={exercises}
        themeColor={cfg.color}
        onClose={() => setMode("hub")}
        onComplete={(xp) => { if (onXp && xp > 0) onXp(xp); }}
      />
    );
  }

  return (
    <View style={s.root}>
      <SafeAreaView style={s.headerWrap}>
        <Text style={s.title}>🎓 Pratik</Text>
        <Text style={s.sub}>Tüm müfredattan rastgele egzersiz</Text>
      </SafeAreaView>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.body}>
        {MODES.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => start(m.id)}
            style={({ pressed }) => [
              s.card,
              {
                backgroundColor: m.bg,
                borderColor: m.color,
                borderBottomColor: m.color,
                borderBottomWidth: pressed ? 2 : 6,
                transform: [{ translateY: pressed ? 4 : 0 }],
              },
            ]}
          >
            <View style={[s.cardIcon, { backgroundColor: m.color }]}>
              <Text style={{ fontSize: 32 }}>{m.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.cardTitle, { color: m.color }]}>{m.title}</Text>
              <Text style={s.cardSub}>{m.subtitle}</Text>
            </View>
            <Text style={[s.chevron, { color: m.color }]}>›</Text>
          </Pressable>
        ))}

        <View style={s.statsCard}>
          <Text style={s.statsTitle}>📊 Pratik Mantığı</Text>
          <Text style={s.statsItem}>• Egzersizler tüm müfredattan rastgele seçilir</Text>
          <Text style={s.statsItem}>• Her doğru cevap = +10 XP</Text>
          <Text style={s.statsItem}>• Heart sistemi yok, sınırsız tekrar</Text>
          <Text style={s.statsItem}>• Quiz aralıklı tekrar prensibine dayanır</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DUO.snow },
  headerWrap: {
    paddingTop: 50, paddingHorizontal: DUO_SPACING.lg, paddingBottom: DUO_SPACING.md,
    borderBottomWidth: 2, borderBottomColor: DUO.swan,
  },
  title: { ...DUO_TYPO.hero, color: DUO.eel },
  sub: { ...DUO_TYPO.body, color: DUO.wolf, marginTop: 2 },
  body: { padding: DUO_SPACING.lg, gap: DUO_SPACING.md, paddingBottom: 60 },
  card: {
    flexDirection: "row", alignItems: "center", gap: DUO_SPACING.md,
    borderWidth: 2,
    borderRadius: DUO_RADIUS.lg,
    padding: DUO_SPACING.md,
    minHeight: 90,
  },
  cardIcon: {
    width: 60, height: 60,
    borderRadius: DUO_RADIUS.md,
    alignItems: "center", justifyContent: "center",
  },
  cardTitle: { ...DUO_TYPO.h2 },
  cardSub: { ...DUO_TYPO.body, color: DUO.wolf, marginTop: 2 },
  chevron: { fontSize: 36, fontFamily: "Fredoka_700Bold" },

  statsCard: {
    marginTop: DUO_SPACING.lg,
    backgroundColor: DUO.polar,
    borderRadius: DUO_RADIUS.md,
    padding: DUO_SPACING.md,
    gap: 6,
  },
  statsTitle: { ...DUO_TYPO.h3, color: DUO.eel, marginBottom: 4 },
  statsItem: { ...DUO_TYPO.body, color: DUO.wolf, fontSize: 13 },
});
