/**
 * KEVO SUITE — Kullanıcının HTML v3 sürümünden React Native'e portlanmış 7 mini-oyun.
 *
 * İçerik:
 *   1. KevoHub               → kategori seçimi (kelime/cümle/gramer/konuşma/telaffuz)
 *   2. KevoLessonPicker      → kelime ders kategorisi seçimi
 *   3. PicMatch              → Kürtçe kelime → 4 emoji → doğruyu seç
 *   4. Flashcard             → kelime kartı, dokun → çevrilir + ses
 *   5. KevoQuiz              → Türkçe + emoji → 4 Kürtçe seçenek
 *   6. SentenceBuilder       → kelimeleri sırala (tap-tap)
 *   7. GrammarLesson         → kural göster + sonunda quiz
 *   8. PronunciationGuide    → özel harf rehberi (ê, î, û, x, q, w, j)
 *   9. SpeakingPractice      → Kürtçe cümle, sesli oku, atla/anladım
 *
 * Tüm oyunlar parent state ile yönetilir (KevoSuite).
 * Çıkış → onClose(totalXP).
 */
import { useEffect, useMemo, useState } from "react";
import {
  View, Text, Pressable, StyleSheet, ScrollView, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring, Easing,
} from "react-native-reanimated";

import { speakKurmanci, playFx } from "@/data/sound-fx";
import { Confetti } from "@/components/kids/confetti";
import { KIDS_THEME, RADIUS, SHADOW, SPACING, TYPO } from "@/components/kids/design";
import {
  KEVO_LESSONS, KEVO_GRAMMAR, KEVO_SENTENCES, KEVO_PRONUNCIATIONS, KEVO_SPEAKING,
  shuffleArr, randomCheer, randomWrong,
  type KevoLesson, type KevoWord, type GrammarTopic, type Sentence, type Pronunciation, type SpeakingLine,
} from "@/data/kevo-content";

const { width: SW } = Dimensions.get("window");

// =====================================================================
//  ORTAK BİLEŞENLER
// =====================================================================

const GameHeader = ({
  title, sub, xp, progress, onBack, gradient,
}: {
  title: string;
  sub: string;
  xp?: number;
  progress?: number;
  onBack: () => void;
  gradient: readonly [string, string];
}) => (
  <LinearGradient colors={gradient} style={hStyles.wrap}>
    <View style={hStyles.row}>
      <Pressable onPress={onBack} style={hStyles.back}>
        <Text style={hStyles.backTxt}>✕</Text>
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={hStyles.title}>{title}</Text>
        <Text style={hStyles.sub}>{sub}</Text>
      </View>
      {typeof xp === "number" && (
        <View style={hStyles.xp}>
          <Text style={hStyles.xpText}>⭐ {xp} XP</Text>
        </View>
      )}
    </View>
    {typeof progress === "number" && (
      <View style={hStyles.barTrack}>
        <View style={[hStyles.barFill, { width: `${Math.max(0, Math.min(100, progress * 100))}%` }]} />
      </View>
    )}
  </LinearGradient>
);

const hStyles = StyleSheet.create({
  wrap: { paddingTop: 50, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.sm },
  back: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  backTxt: { color: "#fff", fontSize: 18, fontFamily: "Fredoka_700Bold" },
  title: { ...TYPO.h2, color: "#fff", textShadowColor: "rgba(0,0,0,0.3)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  sub:   { ...TYPO.caption, color: "rgba(255,255,255,0.85)" },
  xp: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderRadius: 999,
  },
  xpText: { color: "#fff", fontFamily: "Fredoka_700Bold", fontSize: 12 },
  barTrack: { height: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 999 },
});

// =====================================================================
//  COMPLETE — Bitiş ekranı
// =====================================================================

function GameComplete({
  emoji, title, xpEarned, onHome, color,
}: {
  emoji: string; title: string; xpEarned: number; onHome: () => void; color: string;
}) {
  return (
    <View style={completeS.wrap}>
      <Confetti visible count={50} duration={2000} />
      <Text style={completeS.bigEmoji}>{emoji}</Text>
      <Text style={completeS.title}>{title}</Text>
      <View style={[completeS.xpCard, { borderColor: color }]}>
        <Text style={[completeS.xpLabel, { color }]}>KAZANILAN XP</Text>
        <Text style={[completeS.xpVal, { color }]}>+{xpEarned}</Text>
      </View>
      <Pressable
        onPress={onHome}
        style={({ pressed }) => [completeS.btn, { backgroundColor: color, opacity: pressed ? 0.85 : 1 }]}
      >
        <Text style={completeS.btnTxt}>Devam et →</Text>
      </Pressable>
    </View>
  );
}

const completeS = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.huge, backgroundColor: "#0A0A14" },
  bigEmoji: { fontSize: 84, marginBottom: SPACING.md },
  title: { ...TYPO.hero, color: "#fff", textAlign: "center", marginBottom: SPACING.lg },
  xpCard: {
    borderWidth: 3,
    paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    alignItems: "center",
    marginBottom: SPACING.xl,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  xpLabel: { ...TYPO.caption, letterSpacing: 2 },
  xpVal:   { ...TYPO.hero, fontSize: 48 },
  btn: { paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md, borderRadius: RADIUS.pill },
  btnTxt: { color: "#fff", ...TYPO.button },
});

// =====================================================================
//  1. PicMatch — Kürtçe kelime → 4 emoji'den doğruyu seç
// =====================================================================

function PicMatch({ lesson, onComplete, onBack }: { lesson: KevoLesson; onComplete: (xp: number) => void; onBack: () => void }) {
  const qs = useMemo(() => shuffleArr(lesson.words).slice(0, 6), [lesson]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [sel, setSel] = useState<KevoWord | null>(null);
  const [ans, setAns] = useState(false);
  const curr = qs[idx];
  const opts = useMemo(
    () => shuffleArr([curr, ...shuffleArr(lesson.words.filter(w => w.ku !== curr.ku)).slice(0, 3)]),
    [curr, lesson],
  );

  const pick = (opt: KevoWord) => {
    if (ans) return;
    setSel(opt); setAns(true);
    const ok = opt.ku === curr.ku;
    if (ok) { setScore(s => s + 1); playFx("success"); }
    else playFx("fail");
    speakKurmanci(curr.ku, "kid");
    setTimeout(() => {
      setSel(null); setAns(false);
      if (idx + 1 >= qs.length) onComplete((score + (ok ? 1 : 0)) * 10);
      else setIdx(i => i + 1);
    }, 1100);
  };

  return (
    <View style={picS.root}>
      <GameHeader
        title="🎨 Resim Eşleştir"
        sub={`Soru ${idx + 1}/${qs.length}`}
        xp={score * 10}
        progress={idx / qs.length}
        gradient={["#FF6B9D", "#FF8C42"] as const}
        onBack={onBack}
      />
      <View style={picS.body}>
        <Pressable onPress={() => speakKurmanci(curr.ku, "kid")} style={picS.listenBtn}>
          <Text style={picS.listenTxt}>🔊 Dinle!</Text>
        </Pressable>
        <View style={picS.wordCard}>
          <Text style={picS.wordKu}>{curr.ku}</Text>
          <Text style={picS.wordHint}>Hangi resim bu kelimeye ait?</Text>
        </View>
        <View style={picS.grid}>
          {opts.map((opt, i) => {
            const ok = opt.ku === curr.ku;
            const isSelected = sel?.ku === opt.ku;
            let bg = "rgba(255,255,255,0.08)";
            let bd = "rgba(255,255,255,0.14)";
            if (ans && ok) { bg = "rgba(59,178,115,0.25)"; bd = "#3BB273"; }
            if (ans && isSelected && !ok) { bg = "rgba(232,72,85,0.25)"; bd = "#E84855"; }
            return (
              <Pressable
                key={i}
                onPress={() => pick(opt)}
                style={[picS.optBtn, { backgroundColor: bg, borderColor: bd }]}
              >
                <Text style={picS.optEmoji}>{opt.emoji}</Text>
                {ans && ok && <Text style={[picS.optLabel, { color: "#3BB273" }]}>✓ {opt.tr}</Text>}
                {ans && isSelected && !ok && <Text style={[picS.optLabel, { color: "#E84855" }]}>✕</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const picS = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1A0828" },
  body: { flex: 1, padding: SPACING.lg },
  listenBtn: {
    backgroundColor: "#FF6B9D",
    alignSelf: "center",
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    marginBottom: SPACING.md,
    ...SHADOW("#FF6B9D", "md"),
  },
  listenTxt: { color: "#fff", ...TYPO.button },
  wordCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: SPACING.md,
  },
  wordKu: { color: "#FFE66D", ...TYPO.h1 },
  wordHint: { color: "rgba(255,255,255,0.45)", ...TYPO.caption, marginTop: 4 },
  grid: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, justifyContent: "space-between" },
  optBtn: {
    width: "48%",
    aspectRatio: 1,
    borderWidth: 3,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 110,
  },
  optEmoji: { fontSize: 56 },
  optLabel: { ...TYPO.body, fontSize: 12 },
});

// =====================================================================
//  2. Flashcard — kelime kartı, çevirme + ses
// =====================================================================

function Flashcard({ lesson, onFinish, onBack }: { lesson: KevoLesson; onFinish: (xp: number) => void; onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const w = lesson.words[idx];
  const last = idx === lesson.words.length - 1;
  const flipAnim = useSharedValue(0);

  const handleFlip = () => {
    setFlipped(f => !f);
    flipAnim.value = withTiming(flipped ? 0 : 1, { duration: 300 });
    if (!flipped) speakKurmanci(w.ku, "kid");
  };

  const next = () => {
    if (last) { onFinish(lesson.words.length * 5); return; }
    setFlipped(false); flipAnim.value = withTiming(0, { duration: 200 });
    setTimeout(() => setIdx(i => i + 1), 200);
  };
  const prev = () => {
    if (idx === 0) return;
    setFlipped(false); flipAnim.value = withTiming(0, { duration: 200 });
    setTimeout(() => setIdx(i => i - 1), 200);
  };

  const flipStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipAnim.value * 180}deg` }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    opacity: flipAnim.value > 0.5 ? 1 : 0,
  }));
  const frontStyle = useAnimatedStyle(() => ({
    opacity: flipAnim.value < 0.5 ? 1 : 0,
  }));

  return (
    <View style={fcS.root}>
      <GameHeader
        title="📚 Kelime Kartları"
        sub={`${lesson.title.tr} · ${idx + 1}/${lesson.words.length}`}
        progress={(idx + 1) / lesson.words.length}
        gradient={lesson.bgGradient}
        onBack={onBack}
      />
      <View style={fcS.body}>
        <Pressable onPress={handleFlip} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Animated.View style={[fcS.card, flipStyle, { backgroundColor: lesson.color + "20", borderColor: lesson.color }]}>
            <Animated.View style={[fcS.cardFace, frontStyle]}>
              <Text style={fcS.bigEmoji}>{w.emoji}</Text>
              <Text style={[fcS.frontTr, { color: lesson.color }]}>{w.tr}</Text>
              <Text style={fcS.tapHint}>👆 Çevir</Text>
            </Animated.View>
            <Animated.View style={[fcS.cardFace, backStyle, { transform: [{ rotateY: "180deg" }] }]}>
              <Text style={[fcS.bigKu, { color: lesson.color }]}>{w.ku}</Text>
              <Text style={fcS.frontTr}>{w.tr}</Text>
              <Pressable
                onPress={() => speakKurmanci(w.ku, "kid")}
                style={[fcS.listen, { backgroundColor: lesson.color }]}
              >
                <Text style={fcS.listenTxt}>🔊 Dinle</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </Pressable>
      </View>
      <View style={fcS.navRow}>
        <Pressable onPress={prev} disabled={idx === 0} style={[fcS.navBtn, { opacity: idx === 0 ? 0.3 : 1 }]}>
          <Text style={fcS.navTxt}>← Önceki</Text>
        </Pressable>
        <Pressable
          onPress={next}
          style={[fcS.navBtn, fcS.navBtnPrimary, { backgroundColor: lesson.color }]}
        >
          <Text style={fcS.navTxtPrimary}>{last ? "Bitir ✓" : "Sonraki →"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const fcS = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFF0F8" },
  body: { flex: 1, padding: SPACING.lg },
  card: {
    width: "100%",
    aspectRatio: 0.75,
    maxHeight: 480,
    borderRadius: RADIUS.xl,
    borderWidth: 3,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW("#000", "md"),
  },
  cardFace: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
    padding: SPACING.xl,
    backfaceVisibility: "hidden",
  },
  bigEmoji: { fontSize: 110, marginBottom: SPACING.md },
  bigKu: { ...TYPO.hero, fontSize: 48, marginBottom: SPACING.sm },
  frontTr: { ...TYPO.h1, color: KIDS_THEME.ink, textAlign: "center" },
  tapHint: { ...TYPO.caption, color: KIDS_THEME.smoke, marginTop: SPACING.lg },
  listen: {
    marginTop: SPACING.lg, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
  },
  listenTxt: { color: "#fff", ...TYPO.button },
  navRow: { flexDirection: "row", padding: SPACING.lg, gap: SPACING.sm, paddingBottom: 28 },
  navBtn: {
    flex: 1, paddingVertical: SPACING.md,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: RADIUS.md, alignItems: "center",
  },
  navBtnPrimary: { flex: 2, ...SHADOW("#000", "sm") },
  navTxt: { color: KIDS_THEME.smoke, ...TYPO.body },
  navTxtPrimary: { color: "#fff", ...TYPO.button },
});

// =====================================================================
//  3. KevoQuiz — Türkçe + emoji → 4 Kürtçe seçenek
// =====================================================================

function KevoQuiz({ lesson, onComplete, onBack }: { lesson: KevoLesson; onComplete: (xp: number) => void; onBack: () => void }) {
  const qw = useMemo(() => shuffleArr(lesson.words).slice(0, 5), [lesson]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [ans, setAns] = useState(false);
  const [msg, setMsg] = useState("");
  const w = qw[idx];
  const opts = useMemo(
    () => shuffleArr([w.ku, ...shuffleArr(lesson.words.filter(x => x.ku !== w.ku)).slice(0, 3).map(x => x.ku)]),
    [w, lesson],
  );

  const pick = (opt: string) => {
    if (ans) return;
    setSel(opt); setAns(true);
    const ok = opt === w.ku;
    if (ok) { setScore(s => s + 1); playFx("success"); setMsg(randomCheer()); }
    else { playFx("fail"); setMsg(randomWrong()); }
    speakKurmanci(w.ku, "kid");
    setTimeout(() => {
      setSel(null); setAns(false); setMsg("");
      const ns = ok ? score + 1 : score;
      if (idx + 1 >= qw.length) onComplete(ns * 10);
      else setIdx(i => i + 1);
    }, 1200);
  };

  const optStyle = (opt: string) => {
    if (!ans) return { bg: "rgba(255,255,255,0.95)", bd: "#FFD6E0", tx: "#2D3436" };
    if (opt === w.ku) return { bg: "#3BB27322", bd: "#3BB273", tx: "#1A7A3A" };
    if (opt === sel)  return { bg: "#E8485522", bd: "#E84855", tx: "#A02020" };
    return { bg: "rgba(255,255,255,0.6)", bd: "#FFD6E0", tx: "#888" };
  };

  return (
    <View style={qS.root}>
      <GameHeader
        title="📝 Test"
        sub={`Soru ${idx + 1}/5`}
        xp={score * 10}
        progress={idx / 5}
        gradient={["#FF6B9D", "#9B5DE5"] as const}
        onBack={onBack}
      />
      <View style={qS.body}>
        {msg ? (
          <View style={qS.msgBubble}>
            <Text style={qS.msgText}>{msg}</Text>
          </View>
        ) : null}
        <View style={qS.questionCard}>
          <Text style={qS.questionLabel}>Türkçesi gösterilen kelimenin Kürtçesi?</Text>
          <Text style={qS.questionEmoji}>{w.emoji}</Text>
          <Text style={qS.questionTr}>{w.tr}</Text>
        </View>
        <View style={qS.optionsCol}>
          {opts.map((opt, i) => {
            const s = optStyle(opt);
            return (
              <Pressable
                key={i}
                onPress={() => pick(opt)}
                style={[qS.optBtn, { backgroundColor: s.bg, borderColor: s.bd }]}
              >
                <View style={[
                  qS.optBadge,
                  ans && opt === w.ku ? { backgroundColor: "#3BB273" } :
                  ans && opt === sel  ? { backgroundColor: "#E84855" } :
                  { backgroundColor: "#F5F0F8" },
                ]}>
                  <Text style={[
                    qS.optBadgeTxt,
                    { color: ans && (opt === w.ku || opt === sel) ? "#fff" : "#888" },
                  ]}>
                    {ans && opt === w.ku ? "✓" : ans && opt === sel ? "✕" : ["A", "B", "C", "D"][i]}
                  </Text>
                </View>
                <Text style={[qS.optTxt, { color: s.tx }]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const qS = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFF0F8" },
  body: { flex: 1, padding: SPACING.lg },
  msgBubble: {
    backgroundColor: "#fff",
    borderWidth: 2.5, borderColor: "#FFD6E0",
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    alignSelf: "flex-start",
    marginBottom: SPACING.sm,
    ...SHADOW("#000", "sm"),
  },
  msgText: { ...TYPO.body, color: KIDS_THEME.ink },
  questionCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: RADIUS.lg,
    borderWidth: 2.5, borderColor: "#FFD6E0",
    padding: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  questionLabel: { ...TYPO.caption, color: "#888", marginBottom: SPACING.sm, letterSpacing: 0.5 },
  questionEmoji: { fontSize: 44, marginBottom: 4 },
  questionTr: { ...TYPO.hero, fontSize: 28, color: KIDS_THEME.ink },
  optionsCol: { flex: 1, gap: SPACING.sm },
  optBtn: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2.5,
  },
  optBadge: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  optBadgeTxt: { ...TYPO.body, fontSize: 12 },
  optTxt: { ...TYPO.h3 },
});

// =====================================================================
//  4. SentenceBuilder — kelimeleri tap-tap ile sırala
// =====================================================================

function SentenceBuilder({ levelId, onComplete, onBack }: { levelId: "A1" | "A2" | "B1" | "B2"; onComplete: (xp: number) => void; onBack: () => void }) {
  const ord: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3 };
  const filtered = useMemo(() => KEVO_SENTENCES.filter(s => ord[s.level] <= ord[levelId]), [levelId]);
  const [idx, setIdx] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [avail, setAvail] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<null | "correct" | "wrong">(null);
  const curr = filtered[idx];

  useEffect(() => {
    if (curr) { setAvail(shuffleArr(curr.words)); setPlaced([]); }
  }, [idx, curr]);

  const tapWord = (w: string, from: "avail" | "placed") => {
    if (status) return;
    if (from === "avail") {
      setPlaced(p => [...p, w]);
      setAvail(a => { const i = a.indexOf(w); return [...a.slice(0, i), ...a.slice(i + 1)]; });
    } else {
      setAvail(a => [...a, w]);
      setPlaced(p => { const i = p.indexOf(w); return [...p.slice(0, i), ...p.slice(i + 1)]; });
    }
    playFx("tap");
  };

  const check = () => {
    if (!curr) return;
    const ok = placed.join(" ") === curr.ku;
    setStatus(ok ? "correct" : "wrong");
    if (ok) { setScore(s => s + 1); playFx("success"); speakKurmanci(curr.ku, "kid"); }
    else playFx("fail");
    setTimeout(() => {
      setStatus(null);
      if (idx + 1 >= filtered.length) onComplete((score + (ok ? 1 : 0)) * 15);
      else setIdx(i => i + 1);
    }, 1500);
  };

  if (!curr) return null;

  return (
    <View style={sbS.root}>
      <GameHeader
        title="💬 Cümle Kur"
        sub={`Cümle ${idx + 1}/${filtered.length}`}
        xp={score * 15}
        progress={idx / filtered.length}
        gradient={["#0A0F1A", "#0F1428"] as const}
        onBack={onBack}
      />
      <View style={sbS.body}>
        <View style={sbS.trCard}>
          <Text style={sbS.label}>TÜRKÇE</Text>
          <Text style={sbS.tr}>{curr.tr}</Text>
        </View>
        <View
          style={[
            sbS.placedBox,
            status === "correct" && { borderColor: "#3BB273", backgroundColor: "rgba(59,178,115,0.12)" },
            status === "wrong" && { borderColor: "#E84855", backgroundColor: "rgba(232,72,85,0.12)" },
          ]}
        >
          <Text style={sbS.label}>KÜRTÇE CÜMLEYİ KUR:</Text>
          {placed.length === 0 ? (
            <Text style={sbS.empty}>Aşağıdan kelimelere dokun...</Text>
          ) : (
            <View style={sbS.wordsRow}>
              {placed.map((w, i) => (
                <Pressable key={i} onPress={() => tapWord(w, "placed")} style={sbS.placedWord}>
                  <Text style={sbS.placedWordTxt}>{w}</Text>
                </Pressable>
              ))}
            </View>
          )}
          {status && (
            <Text style={[sbS.statusTxt, { color: status === "correct" ? "#3BB273" : "#E84855" }]}>
              {status === "correct" ? `✓ Doğru! ${curr.ku}` : `✕ Doğru: ${curr.ku}`}
            </Text>
          )}
        </View>
        <View style={sbS.availBox}>
          <Text style={sbS.label}>KELİMELER:</Text>
          <View style={sbS.wordsRow}>
            {avail.map((w, i) => (
              <Pressable key={i} onPress={() => tapWord(w, "avail")} style={sbS.availWord}>
                <Text style={sbS.availWordTxt}>{w}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Pressable
          onPress={check}
          disabled={placed.length === 0 || !!status}
          style={[
            sbS.checkBtn,
            placed.length === 0 && { backgroundColor: "rgba(255,255,255,0.06)" },
          ]}
        >
          <Text style={[
            sbS.checkBtnTxt,
            placed.length === 0 && { color: "rgba(255,255,255,0.3)" },
          ]}>
            {placed.length === 0 ? "Cümle oluştur..." : "Kontrol Et ✓"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const sbS = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#060E18" },
  body: { flex: 1, padding: SPACING.lg, gap: SPACING.md },
  label: { ...TYPO.caption, color: "rgba(255,255,255,0.5)", letterSpacing: 0.5, marginBottom: 4 },
  trCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1, borderColor: "rgba(74,184,184,0.3)",
  },
  tr: { ...TYPO.h2, color: "rgba(255,255,255,0.9)" },
  placedBox: {
    minHeight: 80,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  empty: { ...TYPO.body, color: "rgba(255,255,255,0.25)", textAlign: "center", paddingVertical: SPACING.sm },
  wordsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  placedWord: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: 11,
    backgroundColor: "rgba(74,184,184,0.18)",
    borderWidth: 1.5, borderColor: "rgba(74,184,184,0.5)",
  },
  placedWordTxt: { color: "#fff", ...TYPO.body, fontSize: 14 },
  availBox: { flex: 1 },
  availWord: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.12)",
  },
  availWordTxt: { color: "rgba(255,255,255,0.85)", ...TYPO.body, fontSize: 14 },
  statusTxt: { ...TYPO.body, marginTop: SPACING.sm },
  checkBtn: {
    paddingVertical: SPACING.md,
    backgroundColor: "#4AB8B8",
    borderRadius: RADIUS.md,
    alignItems: "center",
    ...SHADOW("#4AB8B8", "md"),
  },
  checkBtnTxt: { color: "#fff", ...TYPO.button },
});

// =====================================================================
//  5. GrammarLesson — gramer kuralı + sonunda quiz
// =====================================================================

function GrammarLesson({ levelId, onComplete, onBack }: { levelId: "A1" | "A2" | "B1" | "B2"; onComplete: (xp: number) => void; onBack: () => void }) {
  const ord: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3 };
  const filtered = useMemo(() => KEVO_GRAMMAR.filter(g => ord[g.level] <= ord[levelId]), [levelId]);
  const [li, setLi] = useState(0);
  const [phase, setPhase] = useState<"learn" | "quiz">("learn");
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [ans, setAns] = useState(false);
  const curr = filtered[li];
  if (!curr) return null;

  const ansQuiz = (opt: string) => {
    if (ans) return;
    setSel(opt); setAns(true);
    const ok = opt === curr.quiz[qi].a;
    if (ok) { setScore(s => s + 1); playFx("success"); }
    else playFx("fail");
    setTimeout(() => {
      setSel(null); setAns(false);
      if (qi + 1 >= curr.quiz.length) {
        if (li + 1 >= filtered.length) onComplete((score + (ok ? 1 : 0)) * 12);
        else { setLi(i => i + 1); setQi(0); setPhase("learn"); }
      } else {
        setQi(i => i + 1);
      }
    }, 900);
  };

  return (
    <View style={glS.root}>
      <GameHeader
        title={`${curr.icon} ${curr.title}`}
        sub={phase === "learn" ? "Öğreniyorum" : `Quiz ${qi + 1}/${curr.quiz.length}`}
        xp={score * 12}
        progress={(li + (phase === "quiz" ? (qi + 1) / curr.quiz.length : 0)) / filtered.length}
        gradient={["#1A0D2A", "#0D0D2A"] as const}
        onBack={onBack}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={glS.body}>
        {phase === "learn" ? (
          <>
            <View style={glS.introCard}>
              <Text style={glS.introTxt}>{curr.intro}</Text>
            </View>
            {curr.rows.map((row, i) => (
              <View key={i} style={glS.rowCard}>
                <View style={glS.rowKuBox}>
                  <Text style={glS.rowKu}>{row.ku}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={glS.rowTr}>{row.tr}</Text>
                  <Text style={glS.rowEx}>{row.ex}</Text>
                </View>
              </View>
            ))}
            <Pressable onPress={() => setPhase("quiz")} style={glS.quizBtn}>
              <Text style={glS.quizBtnTxt}>Teste Geç →</Text>
            </Pressable>
          </>
        ) : (
          <View style={{ gap: SPACING.md }}>
            <View style={glS.qCard}>
              <Text style={glS.qLabel}>SORU {qi + 1}/{curr.quiz.length}</Text>
              <Text style={glS.qQuestion}>{curr.quiz[qi].q}</Text>
            </View>
            {curr.quiz[qi].opts.map((opt, i) => {
              const isCorrect = ans && opt === curr.quiz[qi].a;
              const isSelectedWrong = ans && opt === sel && opt !== curr.quiz[qi].a;
              return (
                <Pressable
                  key={i}
                  onPress={() => ansQuiz(opt)}
                  style={[
                    glS.optBtn,
                    isCorrect && { backgroundColor: "rgba(59,178,115,0.18)", borderColor: "#3BB273" },
                    isSelectedWrong && { backgroundColor: "rgba(232,72,85,0.18)", borderColor: "#E84855" },
                  ]}
                >
                  <Text style={glS.optTxt}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const glS = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#060E18" },
  body: { padding: SPACING.lg, gap: SPACING.sm },
  introCard: {
    backgroundColor: "rgba(184,74,184,0.12)",
    borderWidth: 1.5, borderColor: "rgba(184,74,184,0.4)",
    padding: SPACING.md, borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  introTxt: { ...TYPO.body, color: "rgba(255,255,255,0.85)", lineHeight: 20 },
  rowCard: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  rowKuBox: {
    backgroundColor: "rgba(184,74,184,0.18)",
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    minWidth: 70, alignItems: "center",
  },
  rowKu: { color: "#E0A0E0", ...TYPO.h3 },
  rowTr: { color: "#fff", ...TYPO.body, fontSize: 14 },
  rowEx: { color: "rgba(255,255,255,0.4)", ...TYPO.caption, marginTop: 2, fontStyle: "italic" },
  quizBtn: {
    marginTop: SPACING.lg,
    backgroundColor: "#B84AB8",
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    ...SHADOW("#B84AB8", "md"),
  },
  quizBtnTxt: { color: "#fff", ...TYPO.button },
  qCard: {
    backgroundColor: "rgba(184,74,184,0.1)",
    borderWidth: 1.5, borderColor: "rgba(184,74,184,0.3)",
    padding: SPACING.lg, borderRadius: RADIUS.md,
  },
  qLabel: { color: "rgba(184,74,184,0.7)", ...TYPO.caption, marginBottom: 6 },
  qQuestion: { color: "rgba(255,255,255,0.95)", ...TYPO.h2 },
  optBtn: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  optTxt: { color: "rgba(255,255,255,0.9)", ...TYPO.body, fontSize: 14 },
});

// =====================================================================
//  6. PronunciationGuide — özel harfler rehberi
// =====================================================================

function PronunciationGuide({ onComplete, onBack }: { onComplete: (xp: number) => void; onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const l = KEVO_PRONUNCIATIONS[idx];
  const last = idx + 1 >= KEVO_PRONUNCIATIONS.length;

  return (
    <View style={pgS.root}>
      <GameHeader
        title="🔊 Telaffuz Rehberi"
        sub={`Harf ${idx + 1}/${KEVO_PRONUNCIATIONS.length}`}
        progress={(idx + 1) / KEVO_PRONUNCIATIONS.length}
        gradient={["#1A0E00", "#281600"] as const}
        onBack={onBack}
      />
      <View style={pgS.body}>
        <View style={[pgS.bigLetter, { backgroundColor: l.color + "15", borderColor: l.color + "60", shadowColor: l.color }]}>
          <Text style={[pgS.letterTxt, { color: l.color }]}>{l.letter}</Text>
          <Text style={pgS.ipa}>{l.ipa}</Text>
        </View>
        <View style={pgS.descCard}>
          <Text style={pgS.desc}>{l.desc}</Text>
          <Pressable
            onPress={() => speakKurmanci(l.letter, "kid")}
            style={[pgS.listenBtn, { backgroundColor: l.color + "22", borderColor: l.color + "60" }]}
          >
            <Text style={[pgS.listenTxt, { color: l.color }]}>🔊 "{l.letter}" sesini duy</Text>
          </Pressable>
        </View>
        <View style={[pgS.exCard, { backgroundColor: l.color + "10", borderColor: l.color + "35" }]}>
          <Text style={[pgS.exLabel, { color: l.color + "BB" }]}>ÖRNEK KELİME</Text>
          <Pressable onPress={() => speakKurmanci(l.example.ku, "kid")}>
            <Text style={pgS.exKu}>{l.example.ku} 🔊</Text>
          </Pressable>
          <Text style={pgS.exTr}>= {l.example.tr}</Text>
        </View>
        <View style={pgS.navRow}>
          <Pressable
            disabled={idx === 0}
            onPress={() => setIdx(i => i - 1)}
            style={[pgS.navBtn, idx === 0 && { opacity: 0.3 }]}
          >
            <Text style={pgS.navTxt}>← Önceki</Text>
          </Pressable>
          <Pressable
            onPress={() => last ? onComplete(KEVO_PRONUNCIATIONS.length * 8) : setIdx(i => i + 1)}
            style={[pgS.navBtnPrimary, { backgroundColor: l.color }]}
          >
            <Text style={pgS.navTxtPrimary}>{last ? "Tamamla ✓" : "Sonraki →"}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const pgS = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#060E18" },
  body: { flex: 1, padding: SPACING.lg, alignItems: "center", justifyContent: "center", gap: SPACING.md },
  bigLetter: {
    width: 140, height: 140,
    borderRadius: RADIUS.xl,
    borderWidth: 3,
    alignItems: "center", justifyContent: "center",
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 30,
  },
  letterTxt: { fontSize: 64, fontFamily: "Fredoka_700Bold" },
  ipa: { ...TYPO.caption, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  descCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    gap: SPACING.sm,
  },
  desc: { ...TYPO.body, color: "rgba(255,255,255,0.85)", textAlign: "center" },
  listenBtn: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill, borderWidth: 1.5,
  },
  listenTxt: { ...TYPO.body, fontSize: 13 },
  exCard: {
    width: "100%",
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
  },
  exLabel: { ...TYPO.caption, marginBottom: 4 },
  exKu: { ...TYPO.h1, color: "#fff" },
  exTr: { ...TYPO.body, color: "rgba(255,255,255,0.45)", marginTop: 4 },
  navRow: { flexDirection: "row", gap: SPACING.sm, width: "100%" },
  navBtn: {
    flex: 1, paddingVertical: SPACING.md,
    borderRadius: RADIUS.md, alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  navTxt: { color: "rgba(255,255,255,0.55)", ...TYPO.body, fontSize: 13 },
  navBtnPrimary: {
    flex: 2, paddingVertical: SPACING.md,
    borderRadius: RADIUS.md, alignItems: "center",
  },
  navTxtPrimary: { color: "#fff", ...TYPO.button },
});

// =====================================================================
//  7. SpeakingPractice — Kürtçe cümle, sesli oku, atla/anladım
// =====================================================================

function SpeakingPractice({ onComplete, onBack }: { onComplete: (xp: number) => void; onBack: () => void }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const p = KEVO_SPEAKING[idx];

  const go = (ok: boolean) => {
    if (ok) setScore(s => s + 1);
    if (idx + 1 >= KEVO_SPEAKING.length) onComplete((score + (ok ? 1 : 0)) * 12);
    else setIdx(i => i + 1);
  };

  return (
    <View style={spS.root}>
      <GameHeader
        title="🎤 Konuşma Pratiği"
        sub={`Cümle ${idx + 1}/${KEVO_SPEAKING.length}`}
        progress={idx / KEVO_SPEAKING.length}
        gradient={["#0A1810", "#102010"] as const}
        onBack={onBack}
      />
      <View style={spS.body}>
        <View style={spS.card}>
          <Text style={spS.label}>KÜRTÇE</Text>
          <Text style={spS.kuLine}>{p.ku}</Text>
          <Pressable onPress={() => speakKurmanci(p.ku, "kidSlow")} style={spS.listenBtn}>
            <Text style={spS.listenTxt}>🔊 Seslendir</Text>
          </Pressable>
          <View style={spS.divider} />
          <Text style={spS.label}>TÜRKÇE</Text>
          <Text style={spS.trLine}>{p.tr}</Text>
        </View>
        <Text style={spS.hint}>Cümleyi yüksek sesle oku, sonra devam et.</Text>
        <View style={spS.btnRow}>
          <Pressable onPress={() => go(false)} style={spS.skipBtn}>
            <Text style={spS.skipTxt}>Atla</Text>
          </Pressable>
          <Pressable onPress={() => go(true)} style={spS.okBtn}>
            <Text style={spS.okTxt}>Anladım! →</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const spS = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#060E18" },
  body: { flex: 1, padding: SPACING.lg, justifyContent: "center", alignItems: "center", gap: SPACING.md },
  card: {
    width: "100%",
    backgroundColor: "rgba(74,184,122,0.08)",
    borderWidth: 2, borderColor: "rgba(74,184,122,0.3)",
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: "center",
  },
  label: { ...TYPO.caption, color: "rgba(74,184,122,0.85)", letterSpacing: 1, marginBottom: 6 },
  kuLine: { ...TYPO.h1, color: "#fff", textAlign: "center", marginBottom: SPACING.md, lineHeight: 30 },
  listenBtn: {
    backgroundColor: "rgba(74,184,122,0.2)",
    borderWidth: 1.5, borderColor: "rgba(74,184,122,0.5)",
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  listenTxt: { color: "#4AB87A", ...TYPO.body, fontSize: 12 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", width: "100%", marginBottom: SPACING.md },
  trLine: { ...TYPO.body, color: "rgba(255,255,255,0.6)", fontSize: 14, textAlign: "center" },
  hint: { ...TYPO.caption, color: "rgba(255,255,255,0.3)", textAlign: "center" },
  btnRow: { flexDirection: "row", gap: SPACING.sm, width: "100%" },
  skipBtn: {
    flex: 1, paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  skipTxt: { color: "rgba(255,255,255,0.5)", ...TYPO.body },
  okBtn: {
    flex: 2, paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: "#4AB87A",
    alignItems: "center",
    ...SHADOW("#4AB87A", "md"),
  },
  okTxt: { color: "#fff", ...TYPO.button },
});

// =====================================================================
//  HUB — Ana giriş ekranı (5 kategori kartı)
// =====================================================================

type GameMode =
  | { kind: "hub" }
  | { kind: "activity-picker" }
  | { kind: "lesson-picker"; activity: "picMatch" | "flashcard" | "quiz" }
  | { kind: "picMatch"; lesson: KevoLesson }
  | { kind: "flashcard"; lesson: KevoLesson }
  | { kind: "quiz"; lesson: KevoLesson }
  | { kind: "sentenceBuilder" }
  | { kind: "grammar" }
  | { kind: "pronunciation" }
  | { kind: "speaking" }
  | { kind: "complete"; emoji: string; title: string; xp: number; color: string };

const CATS = [
  { id: "vocabulary",    label: "Kelime Oyunları",  icon: "📖", color: "#C9A84C", desc: "Kelime kartları + Resim eşleştir + Test" },
  { id: "sentences",     label: "Cümle Kur",        icon: "💬", color: "#4AB8B8", desc: "Kelimeleri sırala, cümle oluştur" },
  { id: "grammar",       label: "Dilbilgisi",       icon: "📝", color: "#B84AB8", desc: "Gramer kuralları + quiz" },
  { id: "speaking",      label: "Konuşma",          icon: "🎤", color: "#4AB87A", desc: "Cümle pratiği + telaffuz" },
  { id: "pronunciation", label: "Telaffuz",         icon: "🔊", color: "#E07010", desc: "Özel harfler (ê, î, û, x, q)" },
] as const;

const VOCAB_ACTIVITIES = [
  { id: "picMatch",  label: "🎨 Resim Eşleştir", desc: "Kelimeyi gör, doğru emojiyi seç" },
  { id: "flashcard", label: "📚 Kelime Kartları", desc: "Kartları çevir, ezberle" },
  { id: "quiz",      label: "📝 Test",           desc: "Türkçesinden Kürtçesini bul" },
] as const;

function KevoHub({ onPick, onClose }: { onPick: (cat: typeof CATS[number]["id"]) => void; onClose: () => void }) {
  return (
    <View style={hubS.root}>
      <LinearGradient colors={["#0A0A14", "#1A0828"] as const} style={hubS.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
          <Pressable onPress={onClose} style={hStyles.back}>
            <Text style={hStyles.backTxt}>‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={hubS.headerTitle}>🎓 KurdîBêje Oyunları</Text>
            <Text style={hubS.headerSub}>Kürtçe öğren, eğlenerek pratik yap</Text>
          </View>
        </View>
      </LinearGradient>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={hubS.body}>
        {CATS.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => onPick(c.id)}
            style={({ pressed }) => [
              hubS.card,
              { borderColor: c.color, opacity: pressed ? 0.85 : 1 },
              SHADOW(c.color, "md"),
            ]}
          >
            <View style={[hubS.iconBox, { backgroundColor: c.color + "22" }]}>
              <Text style={hubS.iconTxt}>{c.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={hubS.cardLabel}>{c.label}</Text>
              <Text style={hubS.cardDesc}>{c.desc}</Text>
            </View>
            <Text style={[hubS.chevron, { color: c.color }]}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const hubS = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0A14" },
  header: {
    paddingTop: 56, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg,
  },
  headerTitle: { ...TYPO.hero, fontSize: 28, color: "#fff" },
  headerSub: { ...TYPO.body, color: "rgba(255,255,255,0.6)", marginTop: 4 },
  body: { padding: SPACING.lg, gap: SPACING.md },
  card: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 2,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  iconBox: {
    width: 56, height: 56, borderRadius: RADIUS.md,
    alignItems: "center", justifyContent: "center",
  },
  iconTxt: { fontSize: 30 },
  cardLabel: { ...TYPO.h2, color: "#fff" },
  cardDesc: { ...TYPO.caption, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  chevron: { fontSize: 32, fontFamily: "Fredoka_700Bold" },
});

// === LessonPicker (kelime aktivitesi öncesi ders seçimi) ===
function LessonPicker({
  activity, onPick, onBack,
}: {
  activity: "picMatch" | "flashcard" | "quiz";
  onPick: (lesson: KevoLesson) => void;
  onBack: () => void;
}) {
  const aLabel = VOCAB_ACTIVITIES.find(a => a.id === activity)?.label ?? "Oyun";
  return (
    <View style={lpS.root}>
      <LinearGradient colors={["#0A0A14", "#1A0828"] as const} style={hubS.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
          <Pressable onPress={onBack} style={hStyles.back}>
            <Text style={hStyles.backTxt}>‹</Text>
          </Pressable>
          <View>
            <Text style={hubS.headerTitle}>{aLabel}</Text>
            <Text style={hubS.headerSub}>Bir ders seç</Text>
          </View>
        </View>
      </LinearGradient>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={hubS.body}>
        {KEVO_LESSONS.map((l) => (
          <Pressable
            key={l.id}
            onPress={() => onPick(l)}
            style={({ pressed }) => [
              hubS.card,
              { borderColor: l.color, opacity: pressed ? 0.85 : 1 },
              SHADOW(l.color, "md"),
            ]}
          >
            <View style={[hubS.iconBox, { backgroundColor: l.color + "22" }]}>
              <Text style={hubS.iconTxt}>{l.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={hubS.cardLabel}>{l.title.tr}</Text>
              <Text style={hubS.cardDesc}>{l.title.ku} · {l.words.length} kelime · {l.level}</Text>
            </View>
            <Text style={[hubS.chevron, { color: l.color }]}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const lpS = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0A14" },
});

// === Activity Picker (kelime kategorisi içinde 3 aktivite arasından seçim) ===
function ActivityPicker({
  onPick, onBack,
}: {
  onPick: (a: "picMatch" | "flashcard" | "quiz") => void;
  onBack: () => void;
}) {
  return (
    <View style={lpS.root}>
      <LinearGradient colors={["#0A0A14", "#1A1828"] as const} style={hubS.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
          <Pressable onPress={onBack} style={hStyles.back}>
            <Text style={hStyles.backTxt}>‹</Text>
          </Pressable>
          <View>
            <Text style={hubS.headerTitle}>📖 Kelime Oyunları</Text>
            <Text style={hubS.headerSub}>Hangi şekilde öğreneceksin?</Text>
          </View>
        </View>
      </LinearGradient>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={hubS.body}>
        {VOCAB_ACTIVITIES.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => onPick(a.id)}
            style={({ pressed }) => [
              hubS.card,
              { borderColor: "#C9A84C", opacity: pressed ? 0.85 : 1 },
              SHADOW("#C9A84C", "md"),
            ]}
          >
            <View style={[hubS.iconBox, { backgroundColor: "#C9A84C22" }]}>
              <Text style={hubS.iconTxt}>{a.label.split(" ")[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={hubS.cardLabel}>{a.label.split(" ").slice(1).join(" ")}</Text>
              <Text style={hubS.cardDesc}>{a.desc}</Text>
            </View>
            <Text style={[hubS.chevron, { color: "#C9A84C" }]}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// =====================================================================
//  ANA SUITE — state machine
// =====================================================================

type Props = {
  levelId?: "A1" | "A2" | "B1" | "B2";
  onClose: () => void;
  onXp?: (xp: number) => void;
};

export function KevoSuite({ levelId = "A2", onClose, onXp }: Props) {
  const [mode, setMode] = useState<GameMode>({ kind: "hub" });

  const completeWith = (emoji: string, title: string, xp: number, color: string) => {
    if (xp > 0 && onXp) onXp(xp);
    setMode({ kind: "complete", emoji, title, xp, color });
  };

  const handleHubPick = (cat: typeof CATS[number]["id"]) => {
    if (cat === "vocabulary")         setMode({ kind: "activity-picker" });
    else if (cat === "sentences")     setMode({ kind: "sentenceBuilder" });
    else if (cat === "grammar")       setMode({ kind: "grammar" });
    else if (cat === "speaking")      setMode({ kind: "speaking" });
    else if (cat === "pronunciation") setMode({ kind: "pronunciation" });
  };

  // === ACTIVITY PICKER (kelime kategorisi için) ===
  if (mode.kind === "activity-picker") {
    return (
      <ActivityPicker
        onPick={(a) => setMode({ kind: "lesson-picker", activity: a })}
        onBack={() => setMode({ kind: "hub" })}
      />
    );
  }

  // === LESSON PICKER (aktivite seçildikten sonra ders seç) ===
  if (mode.kind === "lesson-picker") {
    return (
      <LessonPicker
        activity={mode.activity}
        onPick={(lesson) => {
          if (mode.activity === "picMatch")  setMode({ kind: "picMatch",  lesson });
          if (mode.activity === "flashcard") setMode({ kind: "flashcard", lesson });
          if (mode.activity === "quiz")      setMode({ kind: "quiz",      lesson });
        }}
        onBack={() => setMode({ kind: "activity-picker" })}
      />
    );
  }

  if (mode.kind === "picMatch") {
    return (
      <PicMatch
        lesson={mode.lesson}
        onComplete={(xp) => completeWith("🎨", "Resim Eşleştirme Tamam!", xp, "#FF6B9D")}
        onBack={() => setMode({ kind: "hub" })}
      />
    );
  }
  if (mode.kind === "flashcard") {
    return (
      <Flashcard
        lesson={mode.lesson}
        onFinish={(xp) => completeWith("📚", "Kelime Kartları Bitti!", xp, mode.lesson.color)}
        onBack={() => setMode({ kind: "hub" })}
      />
    );
  }
  if (mode.kind === "quiz") {
    return (
      <KevoQuiz
        lesson={mode.lesson}
        onComplete={(xp) => completeWith("📝", "Test Tamam!", xp, "#9B5DE5")}
        onBack={() => setMode({ kind: "hub" })}
      />
    );
  }
  if (mode.kind === "sentenceBuilder") {
    return (
      <SentenceBuilder
        levelId={levelId}
        onComplete={(xp) => completeWith("💬", "Cümleler Tamam!", xp, "#4AB8B8")}
        onBack={() => setMode({ kind: "hub" })}
      />
    );
  }
  if (mode.kind === "grammar") {
    return (
      <GrammarLesson
        levelId={levelId}
        onComplete={(xp) => completeWith("📐", "Gramer Bitti!", xp, "#B84AB8")}
        onBack={() => setMode({ kind: "hub" })}
      />
    );
  }
  if (mode.kind === "pronunciation") {
    return (
      <PronunciationGuide
        onComplete={(xp) => completeWith("🔊", "Telaffuz Tamam!", xp, "#E07010")}
        onBack={() => setMode({ kind: "hub" })}
      />
    );
  }
  if (mode.kind === "speaking") {
    return (
      <SpeakingPractice
        onComplete={(xp) => completeWith("🎤", "Konuşma Pratiği Bitti!", xp, "#4AB87A")}
        onBack={() => setMode({ kind: "hub" })}
      />
    );
  }
  if (mode.kind === "complete") {
    return (
      <GameComplete
        emoji={mode.emoji}
        title={mode.title}
        xpEarned={mode.xp}
        color={mode.color}
        onHome={() => setMode({ kind: "hub" })}
      />
    );
  }
  // hub
  return <KevoHub onPick={handleHubPick} onClose={onClose} />;
}
