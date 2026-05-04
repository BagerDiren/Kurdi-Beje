/**
 * 🎯 YERLEŞTİRME SINAVI EKRANI (yetişkin)
 *
 * Akış:
 *   1. Giriş ekranı: "Seviyeni belirleyelim" + atla seçeneği
 *   2. 12 soru sırayla (her birinde 4 seçenek)
 *   3. Sonuç ekranı: "Senin seviyen X" + işaretlenecek dersler bilgisi
 *   4. CONTINUE → ana sekmeye yönlendir, app context'e completed işaretler
 */
import { useState } from "react";
import {
  View, Text, Pressable, StyleSheet, ScrollView, SafeAreaView,
} from "react-native";
import { router } from "expo-router";

import { DUO, DUO_RADIUS, DUO_SPACING, DUO_TYPO } from "@/components/duo/duo-tokens";
import { DuoButton } from "@/components/duo/duo-button";
import { Confetti } from "@/components/kids/confetti";
import { useApp } from "@/data/app-context";
import { playFx } from "@/data/sound-fx";
import {
  PLACEMENT_TEST, computePlacement, lessonsToMarkComplete,
  type PtQuestion,
} from "@/data/placement-test";
import { DUO_SECTIONS } from "@/data/duo-content";
import { shuffle } from "@/data/duo-content";
import type { LangCode } from "@/data/languages";

const PT_UI = {
  introTitle:   { tr: "Seviyeni belirleyelim",     en: "Let's find your level",       ku: "Em asta te bibînin" },
  introSub:     { tr: "12 soru. Bilmiyorsan boş bırakabilirsin.", en: "12 questions. Skip what you don't know.", ku: "12 pirs. Yên ku tu nizanî, derbas bike." },
  start:        { tr: "BAŞLA",                      en: "START",                       ku: "DEST PÊ KE" },
  skipTest:     { tr: "Sınavı atla, sıfırdan başla", en: "Skip test, start from zero",  ku: "Pirsîn derbas bike, ji sifirê dest pê bike" },
  question:     { tr: "Soru",                       en: "Question",                    ku: "Pirs" },
  skip:         { tr: "ATLA",                       en: "SKIP",                        ku: "DERBAS BIKE" },
  cont:         { tr: "DEVAM",                      en: "CONTINUE",                    ku: "BERDEWAM" },
  done:         { tr: "Sınav bitti!",               en: "Test complete!",              ku: "Pirsîn qediya!" },
  yourLevel:    { tr: "Senin seviyen",              en: "Your level",                  ku: "Asta te" },
  ofN:          { tr: "/12 doğru",                  en: "/12 correct",                 ku: "/12 rast" },
  goLearn:      { tr: "Öğrenmeye başla",            en: "Start learning",              ku: "Hîn bibe" },
} as const;
const u = (k: keyof typeof PT_UI, lang: LangCode): string => PT_UI[k][lang];

type Phase = "intro" | "playing" | "done";

export default function PlacementScreen() {
  const ctx = useApp();
  const lang: LangCode = (ctx.lang as LangCode) ?? "tr";
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");

  const total = PLACEMENT_TEST.length;
  const q: PtQuestion | undefined = PLACEMENT_TEST[idx];

  // Seçenekleri karıştır (her soru için bir kerelik)
  const shuffled = useMemoOnce(() => {
    if (!q) return [];
    return shuffle(q.choices.map((c, i) => ({ ...c, origIdx: i })));
  }, [idx, q?.id]);

  const pick = (origIdx: number) => {
    if (picked !== null || !q) return;
    setPicked(origIdx);
    const isCorrect = q.choices[origIdx].correct;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) { setScore((s) => s + 1); playFx("success"); }
    else playFx("fail");

    setTimeout(() => {
      setPicked(null);
      setFeedback("idle");
      if (idx + 1 >= total) setPhase("done");
      else setIdx((i) => i + 1);
    }, 1100);
  };

  const skip = () => {
    if (!q) return;
    setIdx((i) => i + 1);
    if (idx + 1 >= total) setPhase("done");
  };

  const finish = () => {
    const result = computePlacement(score, total);
    // Tüm lesson ID'leri çek
    const allLessonIds: string[] = [];
    for (const sec of DUO_SECTIONS) {
      for (const u of sec.units) {
        for (const l of u.lessons) {
          allLessonIds.push(l.id);
        }
      }
    }
    const toMark = lessonsToMarkComplete(result.prefilledLessonPrefixes, allLessonIds);
    // BULK update — atomik, state kaybı yok
    if (toMark.length > 0) {
      ctx.markLessonsBulkDone?.(toMark);
    }
    // State commit'in tamamlanması için tick bekle, sonra navigate
    setTimeout(() => router.replace("/(tabs)"), 80);
  };

  // === GİRİŞ EKRANI ===
  if (phase === "intro") {
    return (
      <View style={s.root}>
        <SafeAreaView style={s.safe}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={s.backBtn}>
            <Text style={s.backTxt}>‹</Text>
          </Pressable>
          <View style={s.center}>
            <Text style={s.bigEmoji}>🎯</Text>
            <Text style={s.bigTitle}>{u("introTitle", lang)}</Text>
            <Text style={s.bigSub}>{u("introSub", lang)}</Text>
            <View style={{ width: "100%", marginTop: DUO_SPACING.xxl, gap: DUO_SPACING.md }}>
              <DuoButton label={u("start", lang)} onPress={() => setPhase("playing")} />
              <Pressable onPress={() => router.replace("/(tabs)")} style={s.skipLink}>
                <Text style={s.skipLinkTxt}>{u("skipTest", lang)}</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // === SONUÇ EKRANI ===
  if (phase === "done") {
    const result = computePlacement(score, total);
    const msgKey = lang === "en" ? "startMessageEn" : lang === "ku" ? "startMessageKu" : "startMessage";
    return (
      <View style={s.root}>
        <Confetti visible count={50} duration={2200} />
        <SafeAreaView style={s.safe}>
          <View style={s.center}>
            <Text style={s.bigEmoji}>🏆</Text>
            <Text style={s.bigTitle}>{u("done", lang)}</Text>
            <Text style={s.scoreText}>{score}{u("ofN", lang)}</Text>
            <View style={s.levelBadge}>
              <Text style={s.levelLabel}>{u("yourLevel", lang)}</Text>
              <Text style={s.levelCefr}>{result.cefr}</Text>
            </View>
            <Text style={s.resultMsg}>{result[msgKey as keyof typeof result] as string}</Text>
            <View style={{ width: "100%", marginTop: DUO_SPACING.xxl }}>
              <DuoButton label={u("goLearn", lang)} onPress={finish} />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // === SORU EKRANI ===
  if (!q) return null;
  const promptText = q.promptLang === "ku" ? q.prompt : q.prompt;

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe}>
        {/* Üst bar: progress + skor */}
        <View style={s.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={s.backTxt}>‹</Text>
          </Pressable>
          <View style={s.barTrack}>
            <View style={[s.barFill, { width: `${(idx / total) * 100}%` }]} />
          </View>
          <Text style={s.qCounter}>{idx + 1}/{total}</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.body}>
          <Text style={s.qLabel}>{u("question", lang)} {idx + 1} · {q.level}</Text>
          <View style={[s.questionCard, { borderColor: q.level === "A1" ? DUO.green : q.level === "A2" ? DUO.macaw : DUO.beetle }]}>
            <Text style={s.questionText}>{promptText}</Text>
          </View>

          <View style={{ gap: DUO_SPACING.sm, marginTop: DUO_SPACING.lg }}>
            {shuffled.map((opt) => {
              const isPicked = picked === opt.origIdx;
              const isCorrect = picked !== null && opt.correct;
              let bg = DUO.snow, bd = DUO.swan, bb = DUO.swan, txt = DUO.eel;
              if (isCorrect)                  { bg = "#D7FFB8"; bd = DUO.green; bb = DUO.green; txt = DUO.treeGreen; }
              else if (isPicked && !isCorrect){ bg = "#FFDFE0"; bd = DUO.cardinal; bb = DUO.cardinal; txt = DUO.cardinalDark; }
              return (
                <Pressable
                  key={opt.origIdx}
                  onPress={() => pick(opt.origIdx)}
                  disabled={picked !== null}
                  style={({ pressed }) => [
                    s.optBtn,
                    {
                      backgroundColor: bg, borderColor: bd, borderBottomColor: bb,
                      borderBottomWidth: pressed ? 2 : 4,
                    },
                  ]}
                >
                  <Text style={[s.optText, { color: txt }]}>{opt.kuOrTr}</Text>
                </Pressable>
              );
            })}
          </View>

          {feedback === "wrong" && q.hint && (
            <View style={s.hintBox}>
              <Text style={s.hintText}>💡 {q.hint}</Text>
            </View>
          )}
        </ScrollView>

        <View style={s.bottomBar}>
          <Pressable onPress={skip} style={s.skipBtn} disabled={picked !== null}>
            <Text style={s.skipBtnTxt}>{u("skip", lang)}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

// =====================================================================
//  Helper: useMemoOnce — her soru için bir kez karıştır
// =====================================================================
import { useMemo } from "react";
function useMemoOnce<T>(factory: () => T, deps: any[]): T {
  return useMemo(factory, deps);
}

// =====================================================================
//  STYLES
// =====================================================================
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DUO.snow },
  safe: { flex: 1 },
  backBtn: {
    position: "absolute", top: 12, left: DUO_SPACING.md,
    width: 40, height: 40, borderRadius: 999,
    backgroundColor: DUO.polar,
    alignItems: "center", justifyContent: "center",
    zIndex: 10,
  },
  backTxt: { fontSize: 28, color: DUO.eel, lineHeight: 30 },

  center: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: DUO_SPACING.xxl,
  },
  bigEmoji: { fontSize: 96, marginBottom: DUO_SPACING.lg },
  bigTitle: { ...DUO_TYPO.hero, color: DUO.eel, textAlign: "center" },
  bigSub: { ...DUO_TYPO.body, color: DUO.wolf, textAlign: "center", marginTop: DUO_SPACING.sm },
  skipLink: { paddingVertical: 12, alignItems: "center" },
  skipLinkTxt: { ...DUO_TYPO.body, color: DUO.macaw, textDecorationLine: "underline" },

  // Soru ekranı
  topBar: {
    flexDirection: "row", alignItems: "center", gap: DUO_SPACING.md,
    paddingHorizontal: DUO_SPACING.lg, paddingTop: DUO_SPACING.lg, paddingBottom: DUO_SPACING.md,
  },
  barTrack: { flex: 1, height: 14, backgroundColor: DUO.swan, borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: DUO.green, borderRadius: 999 },
  qCounter: { ...DUO_TYPO.body, color: DUO.wolf },

  body: { padding: DUO_SPACING.lg },
  qLabel: { ...DUO_TYPO.caption, color: DUO.wolf, letterSpacing: 1, marginBottom: DUO_SPACING.sm },
  questionCard: {
    backgroundColor: DUO.polar,
    borderWidth: 2,
    borderRadius: DUO_RADIUS.lg,
    padding: DUO_SPACING.xl,
    alignItems: "center",
  },
  questionText: { ...DUO_TYPO.h1, color: DUO.eel, textAlign: "center" },
  optBtn: {
    paddingVertical: 14, paddingHorizontal: DUO_SPACING.lg,
    borderWidth: 2, borderRadius: DUO_RADIUS.md,
  },
  optText: { ...DUO_TYPO.h3 },

  hintBox: {
    marginTop: DUO_SPACING.md,
    padding: DUO_SPACING.md,
    backgroundColor: "#FFF8E1",
    borderRadius: DUO_RADIUS.md,
    borderLeftWidth: 4, borderLeftColor: DUO.bee,
  },
  hintText: { ...DUO_TYPO.body, color: DUO.eel },

  bottomBar: {
    paddingHorizontal: DUO_SPACING.lg, paddingTop: DUO_SPACING.md, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: DUO.swan,
  },
  skipBtn: { paddingVertical: 12, alignItems: "center" },
  skipBtnTxt: { ...DUO_TYPO.button, color: DUO.wolf },

  // Sonuç
  scoreText: { ...DUO_TYPO.h1, color: DUO.macaw, marginTop: DUO_SPACING.md },
  levelBadge: {
    marginTop: DUO_SPACING.xl,
    backgroundColor: DUO.green,
    paddingHorizontal: DUO_SPACING.xxl, paddingVertical: DUO_SPACING.lg,
    borderRadius: DUO_RADIUS.xl,
    borderBottomWidth: 4, borderBottomColor: DUO.greenDark,
    alignItems: "center",
  },
  levelLabel: { ...DUO_TYPO.caption, color: "rgba(255,255,255,0.85)", letterSpacing: 1 },
  levelCefr: { ...DUO_TYPO.hero, color: DUO.snow, fontSize: 48 },
  resultMsg: {
    ...DUO_TYPO.body, color: DUO.wolf, textAlign: "center",
    marginTop: DUO_SPACING.xl, paddingHorizontal: DUO_SPACING.lg,
  },
});
