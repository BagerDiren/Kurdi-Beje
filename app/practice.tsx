import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { KevoMascot } from "@/components/kevo-mascot";
import { useApp } from "@/data/app-context";
import { CATEGORIES } from "@/data/categories";

/**
 * Pratîka Bilez (Hızlı Pratik) — öğrenilmiş kelimelerden 10 sorulu mini quiz.
 * Tamamlanan derslerden kelime havuzu çıkarır, rastgele 10 soru üretir.
 * Doğru başına +5 XP.
 */

type QuizQ = {
  ku: string;
  tr: string;
  emoji: string;
  options: string[];   // tr seçenekleri
  correct: number;
};

export default function PracticeScreen() {
  const { th, completed, addXp } = useApp();

  const pool = useMemo(() => {
    const items: { ku: string; tr: string; emoji: string }[] = [];
    CATEGORIES.forEach((c) => {
      const hasCompleted = c.lessons.some((l) => completed.includes(l.id));
      if (!hasCompleted && completed.length > 0) return;
      c.words.forEach((w) => items.push({ ku: w.ku, tr: w.tr, emoji: w.emoji }));
    });
    // Eğer hiç ders tamamlanmamışsa bile, A1 kategorilerinden örnek havuz yap
    if (items.length === 0) {
      CATEGORIES.slice(0, 3).forEach((c) => {
        c.words.forEach((w) => items.push({ ku: w.ku, tr: w.tr, emoji: w.emoji }));
      });
    }
    return items;
  }, [completed]);

  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [questions, setQuestions] = useState<QuizQ[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const startQuiz = () => {
    const N = Math.min(10, pool.length);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const qs: QuizQ[] = shuffled.slice(0, N).map((w, i) => {
      const distractors = pool
        .filter((p) => p.tr !== w.tr)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const all = [w, ...distractors];
      const correct = i % 4;
      const options = [...all];
      const tmp = options[0];
      options[0] = options[correct];
      options[correct] = tmp;
      return {
        ku: w.ku,
        tr: w.tr,
        emoji: w.emoji,
        options: options.map((o) => o.tr),
        correct,
      };
    });
    setQuestions(qs);
    setIdx(0);
    setScore(0);
    setSel(null);
    setShowFeedback(false);
    setPhase("playing");
  };

  const onPick = (i: number) => {
    if (sel !== null || !questions) return;
    setSel(i);
    setShowFeedback(true);
    if (i === questions[idx].correct) {
      setScore((s) => s + 1);
      addXp(5);
    }
  };

  const nextQ = () => {
    if (!questions) return;
    if (idx + 1 >= questions.length) {
      setPhase("done");
      return;
    }
    setIdx((i) => i + 1);
    setSel(null);
    setShowFeedback(false);
  };

  const restartOrExit = (toExit: boolean) => {
    if (toExit) {
      setPhase("idle");
      setQuestions(null);
      setIdx(0);
      setScore(0);
      router.back();
    } else {
      startQuiz();
    }
  };

  // === RENDERS ===
  // Done → result screen
  if (phase === "done" && questions) {
    const total = questions.length;
    const pct = Math.round((score / total) * 100);
    const earnedXp = score * 5;
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
    const msg = pct === 100 ? "Bêkêmasî! 🌟" : pct >= 70 ? "Pir baş! 🎉" : pct >= 50 ? "Baş e, dewam bike!" : "Tekrar bike, tu yê fêr bibî!";
    const msgTr = pct === 100 ? "Kusursuz!" : pct >= 70 ? "Çok iyi!" : pct >= 50 ? "İyi, devam et!" : "Tekrarla, öğreneceksin!";

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.intro}>
          <View style={styles.kevoWrap}>
            <KevoMascot size={130} mood={pct >= 50 ? "happy" : "neutral"} speaking idle />
          </View>

          <View style={styles.starsRow}>
            {[0, 1, 2].map((i) => (
              <Text key={i} style={[styles.starBig, { opacity: i < stars ? 1 : 0.2 }]}>⭐</Text>
            ))}
          </View>

          <Text style={[styles.bigTitle, { color: th.primary }]}>{msg}</Text>
          <Text style={[styles.bigSub, { color: th.textMid }]}>{msgTr}</Text>

          <View style={[styles.card, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
            <View style={styles.resultRow}>
              <Text style={{ fontSize: 13, color: th.textMid, fontWeight: "600" }}>Bersivên rast</Text>
              <Text style={{ fontWeight: "900", color: th.correct, fontSize: 18 }}>{score}/{total}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={{ fontSize: 13, color: th.textMid, fontWeight: "600" }}>Serkeftin</Text>
              <Text style={{ fontWeight: "900", color: th.primary, fontSize: 18 }}>{pct}%</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={{ fontSize: 13, color: th.textMid, fontWeight: "600" }}>XP Wergirt</Text>
              <Text style={{ fontWeight: "900", color: th.accent, fontSize: 18 }}>+{earnedXp} ⭐</Text>
            </View>
          </View>

          <Pressable onPress={() => restartOrExit(false)} style={[styles.startBtn, { backgroundColor: th.primary }]}>
            <Text style={styles.startBtnText}>Dîsa bilîze 🔄</Text>
          </Pressable>
          <Pressable onPress={() => restartOrExit(true)} style={[styles.exitBtn, { borderColor: th.cardBorder, backgroundColor: th.card }]}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: th.text }}>Vegere malê</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Idle → start screen
  if (phase === "idle" || !questions) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
        <LinearGradient colors={th.headerGrad as unknown as readonly [string, string, ...string[]]} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 18, color: "#fff" }}>←</Text>
          </Pressable>
          <Text style={styles.title}>🎯 Pratîka Bilez</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.intro}>
          <View style={styles.kevoWrap}>
            <KevoMascot size={130} mood="happy" speaking idle />
          </View>

          <View style={[styles.card, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
            <Text style={[styles.bigTitle, { color: th.text }]}>10 Pirsên Bilez</Text>
            <Text style={[styles.bigSub, { color: th.textMid }]}>
              Peyvên ku te fêr bûn dîsa tekrar bike. Her bersiva rast: <Text style={{ fontWeight: "900", color: th.accent }}>+5 XP</Text>
            </Text>
            <View style={[styles.poolBadge, { backgroundColor: th.primary + "18", borderColor: th.primary }]}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: th.primary }}>
                📚 {pool.length} peyv di havizê de
              </Text>
            </View>
          </View>

          <Pressable onPress={startQuiz} style={[styles.startBtn, { backgroundColor: th.primary }]}>
            <Text style={styles.startBtnText}>Dest pê bike! 🚀</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Active quiz
  const q = questions[idx];
  const ok = sel === q.correct;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => { setPhase("idle"); setQuestions(null); }}>
          <Text style={{ fontSize: 22, color: th.textMid }}>✕</Text>
        </Pressable>
        <View style={[styles.progressBar, { backgroundColor: th.bgDark }]}>
          <View
            style={[styles.progressFill, { width: `${((idx + 1) / questions.length) * 100}%`, backgroundColor: th.primary }]}
          />
        </View>
        <Text style={{ fontSize: 13, fontWeight: "800", color: th.text }}>
          {idx + 1}/{questions.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.quiz}>
        <View style={styles.kevoWrap}>
          <KevoMascot size={70} mood={showFeedback ? (ok ? "happy" : "sad") : "neutral"} speaking={showFeedback} />
        </View>

        <View style={[styles.qCard, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
          <Text style={{ fontSize: 50, textAlign: "center" }}>{q.emoji}</Text>
          <Text style={[styles.qWord, { color: th.primary }]}>{q.ku}</Text>
          <Text style={[styles.qSub, { color: th.textMid }]}>Wateya wê çi ye? · Anlamı?</Text>
        </View>

        <View style={styles.options}>
          {q.options.map((o, i) => {
            let bg = th.card;
            let bc = th.cardBorder;
            if (showFeedback && i === q.correct) { bg = th.correct + "18"; bc = th.correct; }
            else if (showFeedback && i === sel && !ok) { bg = th.wrong + "18"; bc = th.wrong; }
            return (
              <Pressable
                key={i}
                onPress={() => onPick(i)}
                style={[styles.option, { backgroundColor: bg, borderColor: bc }]}
              >
                <Text style={[styles.optText, { color: th.text }]}>{o}</Text>
                {showFeedback && i === q.correct && <Text style={{ fontSize: 16 }}>✓</Text>}
                {showFeedback && i === sel && !ok && <Text style={{ fontSize: 16 }}>✗</Text>}
              </Pressable>
            );
          })}
        </View>

        {showFeedback && (
          <Pressable
            onPress={nextQ}
            style={[styles.nextBtn, { backgroundColor: ok ? th.correct : th.primary }]}
          >
            <Text style={styles.nextBtnText}>
              {idx + 1 >= questions.length ? "Bibîne Encam →" : "Pirsa Din →"}
            </Text>
          </Pressable>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "900", color: "#fff" },
  intro: { padding: 20, gap: 16, paddingBottom: 30 },
  kevoWrap: { alignItems: "center" },

  card: { borderRadius: 18, padding: 20, borderWidth: 1, gap: 8, alignItems: "center" },
  bigTitle: { fontSize: 22, fontWeight: "900", textAlign: "center" },
  bigSub: { fontSize: 13, fontWeight: "500", textAlign: "center", lineHeight: 20 },
  poolBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5, marginTop: 6 },

  startBtn: { padding: 16, borderRadius: 16, alignItems: "center", marginTop: 8 },
  startBtnText: { fontSize: 16, fontWeight: "900", color: "#fff", letterSpacing: 0.5 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  progressBar: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },

  quiz: { padding: 18, gap: 14, paddingBottom: 30 },
  qCard: { borderRadius: 18, padding: 20, alignItems: "center", borderWidth: 1.5, gap: 6 },
  qWord: { fontSize: 30, fontWeight: "900" },
  qSub: { fontSize: 12, fontWeight: "600" },

  options: { gap: 8 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  optText: { fontSize: 15, fontWeight: "700" },

  nextBtn: { padding: 14, borderRadius: 14, alignItems: "center", marginTop: 10 },
  nextBtnText: { fontSize: 15, fontWeight: "900", color: "#fff" },

  starsRow: { flexDirection: "row", gap: 6, justifyContent: "center", marginTop: 6 },
  starBig: { fontSize: 40 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  exitBtn: { padding: 14, borderRadius: 14, alignItems: "center", borderWidth: 1.5, marginTop: 4 },
});
