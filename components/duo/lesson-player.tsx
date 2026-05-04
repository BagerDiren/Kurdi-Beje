/**
 * DUO LESSON PLAYER — Duolingo'nun ders oyuncusu klonu.
 *
 * Akış:
 *   • Üst bar: çıkış (X) + ilerleme barı + kalp sayacı
 *   • Egzersiz alanı (5 tip + 1 yeni-kelime intro)
 *   • Alt: doğru/yanlış feedback paneli + CONTINUE butonu
 *
 * Egzersiz tipleri:
 *   1. new-word          → Büyük emoji + KU + TR + ses + "Anladım"
 *   2. translate-ku-tr   → KU cümle → TR kelime havuzu
 *   3. translate-tr-ku   → TR cümle → KU kelime havuzu
 *   4. tap-audio         → Ses oynat → kelimeleri sıraya diz
 *   5. match-pairs       → 4 KU + 4 TR çiftle
 *   6. select-image      → KU kelime → 4 emoji'den seç
 *   7. fill-blank        → Cümlede boşluk doldur (4 seçenek)
 *
 * State machine:
 *   intro → exercises[0] → ... → exercises[N-1] → complete
 *
 * Hata durumu (yanlış cevap):
 *   • -1 kalp
 *   • Yanlış soruyu listenin sonuna ekle (Duolingo'nun yapısı)
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring, Easing,
} from "react-native-reanimated";

import { speakKurmanci, playFx } from "@/data/sound-fx";
import { Confetti } from "@/components/kids/confetti";
import { DuoButton, DuoChip } from "./duo-button";
import { DUO, DUO_RADIUS, DUO_SPACING, DUO_TYPO } from "./duo-tokens";
import {
  type DuoLesson, type Exercise, shuffle, shuffleNotIdentity,
} from "@/data/duo-content";
import { tx, txArr } from "@/data/duo-translations";
import { useApp } from "@/data/app-context";
import type { LangCode } from "@/data/languages";

/** Lokalize string promp metinleri (3 dilde) */
const UI_STR = {
  enterPrompt:    { tr: "Bu cümleyi çevir",          en: "Translate this sentence",     ku: "Vê hevokê wergerîne" },
  enterPromptKu:  { tr: "Bu cümleyi çevir (Kürtçeye)", en: "Translate to Kurmancî",       ku: "Wergerîne Kurmancî" },
  listenPrompt:   { tr: "Duyduğunu yaz",              en: "Type what you hear",           ku: "Ya tu dibihîzî binivîse" },
  match:          { tr: "Eşleştir",                   en: "Match the pairs",              ku: "Berhevberî bike" },
  fillBlank:      { tr: "Boşluğu doldur",              en: "Fill in the blank",            ku: "Valahiyê tijî bike" },
  whichOne:       { tr: "Hangisi",                    en: "Which one is",                 ku: "Kîjan e" },
  newWord:        { tr: "YENİ KELİME",                en: "NEW WORD",                     ku: "PEYVA NÛ" },
  iGotIt:         { tr: "ANLADIM",                    en: "I GOT IT",                     ku: "FÊM KIR" },
  cont:           { tr: "DEVAM",                      en: "CONTINUE",                     ku: "BERDEWAM" },
  check:          { tr: "KONTROL ET",                 en: "CHECK",                        ku: "KONTROL BIKE" },
  correctAns:     { tr: "Doğru cevap:",               en: "Correct answer:",              ku: "Bersîva rast:" },
  emptyHint:      { tr: "Aşağıdan kelimelere dokun...", en: "Tap words below...",        ku: "Li ser peyvan bitikîne..." },
  noHearts:       { tr: "Tüm canların bitti!",        en: "You're out of hearts!",        ku: "Hemû dilên te qediyan!" },
  tryLater:       { tr: "Daha sonra tekrar dene.",    en: "Try again later.",             ku: "Paşê dîsa biceribîne." },
  perfect:        { tr: "MÜKEMMEL!",                  en: "PERFECT!",                     ku: "BÊKÊMASÎ!" },
  lessonComplete: { tr: "Ders Bitti!",                en: "Lesson Complete!",             ku: "Ders Qediya!" },
  perfectSub:     { tr: "Hatasız bitirdin",           en: "Finished without errors",      ku: "Te bê xelet qedand" },
  niceSub:        { tr: "Aferin, devam et",           en: "Nice work, keep going",        ku: "Bilîz, berdewam be" },
  totalXp:        { tr: "TOPLAM XP",                  en: "TOTAL XP",                     ku: "TOPLAM XP" },
  bonus:          { tr: "BONUS",                      en: "BONUS",                        ku: "BONUS" },
  goOn:           { tr: "DEVAM ET",                   en: "CONTINUE",                     ku: "BERDEWAM" },
} as const;

const ui = (k: keyof typeof UI_STR, lang: LangCode): string => UI_STR[k][lang];

/**
 * Rastgele Duolingo-vari övgü/teşvik mesajları (her dilde 5 seçenek).
 * Doğru cevapta seçilen biri görünür → hep aynı "Süpersin" değil.
 */
const PRAISES = {
  tr: ["Süpersin!", "Mükemmel!", "Aferin!", "Harika iş!", "Bravo!"],
  en: ["Excellent!", "Nicely done!", "Way to go!", "Brilliant!", "Awesome!"],
  ku: ["Pir baş!", "Bêkêmasî!", "Aferîn!", "Karekî xweş!", "Şabaş!"],
} as const;

const ENCOURAGE = {
  tr: ["Olsun, devam!", "Bir daha bak.", "Yapabilirsin!", "Neredeyse!"],
  en: ["No worries, keep going!", "Take another look.", "You got this!", "Almost!"],
  ku: ["Tişt nabe, berdewam!", "Carekê din binêre.", "Tu dikarî!", "Hema bêje!"],
} as const;

const randomPraise = (lang: LangCode) => PRAISES[lang][Math.floor(Math.random() * PRAISES[lang].length)];
const randomEncourage = (lang: LangCode) => ENCOURAGE[lang][Math.floor(Math.random() * ENCOURAGE[lang].length)];

const { width: SW } = Dimensions.get("window");

// =====================================================================
//  TOP BAR — X + progress + kalp sayacı
// =====================================================================

function TopBar({ progress, hearts, onClose }: { progress: number; hearts: number; onClose: () => void }) {
  return (
    <View style={topS.wrap}>
      <Pressable onPress={onClose} hitSlop={10}>
        <Text style={topS.x}>✕</Text>
      </Pressable>
      <View style={topS.barTrack}>
        <View style={[topS.barFill, { width: `${Math.max(0, Math.min(100, progress * 100))}%` }]} />
      </View>
      <View style={topS.heart}>
        <Text style={topS.heartIcon}>❤️</Text>
        <Text style={topS.heartTxt}>{hearts}</Text>
      </View>
    </View>
  );
}

const topS = StyleSheet.create({
  wrap: {
    flexDirection: "row", alignItems: "center", gap: DUO_SPACING.md,
    paddingTop: 50, paddingHorizontal: DUO_SPACING.lg, paddingBottom: DUO_SPACING.md,
    backgroundColor: DUO.snow,
  },
  x: { color: DUO.hare, fontSize: 26, fontFamily: "Times New Roman" },
  barTrack: { flex: 1, height: 16, backgroundColor: DUO.swan, borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: DUO.green, borderRadius: 999 },
  heart: { flexDirection: "row", alignItems: "center", gap: 4 },
  heartIcon: { fontSize: 18 },
  heartTxt: { ...DUO_TYPO.h3, color: DUO.cardinal },
});

// =====================================================================
//  FEEDBACK BAR — alt panel (doğru/yanlış sonrası "Continue")
// =====================================================================

function FeedbackBar({
  state, correctAnswer, onContinue, lang,
}: {
  state: "idle" | "correct" | "wrong";
  correctAnswer?: string;
  onContinue: () => void;
  lang: LangCode;
}) {
  // Slide-in animasyonu — Duolingo'nun imzası
  const slide = useSharedValue(state === "idle" ? 100 : 0);
  // Mesajları state değişiminde stabil tut (sürekli rastgelelenmesin)
  const praiseRef = useRef("");
  const encourageRef = useRef("");

  useEffect(() => {
    if (state === "correct") {
      praiseRef.current = randomPraise(lang);
      slide.value = withSpring(0, { damping: 18, stiffness: 200 });
    } else if (state === "wrong") {
      encourageRef.current = randomEncourage(lang);
      slide.value = withSpring(0, { damping: 18, stiffness: 200 });
    } else {
      slide.value = withTiming(100, { duration: 180 });
    }
  }, [state, lang]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slide.value }],
  }));

  if (state === "idle") return null;
  const isCorrect = state === "correct";
  const bg = isCorrect ? "#D7FFB8" : "#FFDFE0";
  const fg = isCorrect ? DUO.treeGreen : DUO.cardinalDark;
  const icon = isCorrect ? "✓" : "✕";
  const message = isCorrect ? praiseRef.current : encourageRef.current;

  return (
    <Animated.View style={[fbS.wrap, { backgroundColor: bg }, animStyle]}>
      <View style={fbS.row}>
        <View style={[fbS.icon, { backgroundColor: fg }]}>
          <Text style={fbS.iconTxt}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[fbS.title, { color: fg }]}>{message}</Text>
          {!isCorrect && correctAnswer && (
            <>
              <Text style={[fbS.correctLbl, { color: fg }]}>{ui("correctAns", lang)}</Text>
              <Text style={[fbS.correctTxt, { color: fg }]}>{tx(lang, correctAnswer)}</Text>
            </>
          )}
        </View>
      </View>
      <DuoButton
        label={ui("cont", lang)}
        variant={isCorrect ? "green" : "red"}
        onPress={onContinue}
      />
    </Animated.View>
  );
}

const fbS = StyleSheet.create({
  wrap: {
    paddingHorizontal: DUO_SPACING.lg, paddingTop: DUO_SPACING.md, paddingBottom: 28,
    gap: DUO_SPACING.md,
  },
  row: { flexDirection: "row", gap: DUO_SPACING.md, alignItems: "flex-start" },
  icon: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  iconTxt: { color: DUO.snow, ...DUO_TYPO.h1, fontSize: 22 },
  title: { ...DUO_TYPO.h1 },
  correctLbl: { ...DUO_TYPO.caption, marginTop: 4 },
  correctTxt: { ...DUO_TYPO.h3, marginTop: 2 },
});

// =====================================================================
//  EX 1: NEW WORD INTRO
// =====================================================================

function NewWordSlide({ ex, onContinue, lang }: { ex: Extract<Exercise, { type: "new-word" }>; onContinue: () => void; lang: LangCode }) {
  return (
    <View style={nwS.wrap}>
      <Text style={nwS.label}>{ui("newWord", lang)}</Text>
      <View style={nwS.card}>
        <Text style={nwS.emoji}>{ex.emoji}</Text>
        <Text style={nwS.ku}>{ex.ku}</Text>
        <Text style={nwS.tr}>{tx(lang, ex.tr)}</Text>
        <Pressable
          onPress={() => speakKurmanci(ex.ku, "kid")}
          style={nwS.listenBtn}
        >
          <Text style={nwS.listenTxt}>🔊 {lang === "en" ? "Listen" : lang === "ku" ? "Bibihîze" : "Dinle"}</Text>
        </Pressable>
        {ex.sample && (
          <View style={nwS.sample}>
            <Text style={nwS.sampleKu}>"{ex.sample.ku}"</Text>
            <Text style={nwS.sampleTr}>{tx(lang, ex.sample.tr)}</Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ padding: DUO_SPACING.lg, paddingBottom: 28 }}>
        <DuoButton label={ui("iGotIt", lang)} onPress={onContinue} />
      </View>
    </View>
  );
}

const nwS = StyleSheet.create({
  wrap: { flex: 1 },
  label: { ...DUO_TYPO.micro, color: DUO.macaw, textAlign: "center", marginTop: DUO_SPACING.lg },
  card: {
    margin: DUO_SPACING.lg,
    backgroundColor: DUO.snow,
    borderWidth: 2, borderColor: DUO.swan,
    borderBottomWidth: 4,
    borderRadius: DUO_RADIUS.xl,
    padding: DUO_SPACING.xxl,
    alignItems: "center",
  },
  emoji: { fontSize: 96, marginBottom: DUO_SPACING.md },
  ku: { ...DUO_TYPO.hero, color: DUO.eel, marginBottom: 4 },
  tr: { ...DUO_TYPO.h3, color: DUO.wolf, marginBottom: DUO_SPACING.lg },
  listenBtn: {
    backgroundColor: DUO.macaw,
    borderBottomWidth: 3, borderBottomColor: DUO.macawDark,
    paddingHorizontal: DUO_SPACING.lg, paddingVertical: 8,
    borderRadius: DUO_RADIUS.pill,
  },
  listenTxt: { color: DUO.snow, ...DUO_TYPO.body, fontSize: 14 },
  sample: {
    marginTop: DUO_SPACING.lg,
    padding: DUO_SPACING.md,
    backgroundColor: DUO.polar,
    borderRadius: DUO_RADIUS.md,
    width: "100%",
  },
  sampleKu: { ...DUO_TYPO.h3, color: DUO.eel, fontStyle: "italic", textAlign: "center" },
  sampleTr: { ...DUO_TYPO.body, color: DUO.wolf, textAlign: "center", marginTop: 4 },
});

// =====================================================================
//  EX 2-3: TRANSLATE (KU↔TR) + EX 4: TAP AUDIO — kelime havuzu paylaşılan UI
// =====================================================================

function WordBankExercise({
  prompt, hint, words, correctSentence, audioKu, onResult, lang,
}: {
  prompt: string;
  hint?: string;
  words: string[];
  correctSentence: string;
  audioKu?: string;
  onResult: (ok: boolean) => void;
  lang: LangCode;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [bank, setBank] = useState<string[]>(() => shuffle(words));
  const [done, setDone] = useState(false);

  // Audio'lu egzersizde otomatik oynat
  useEffect(() => {
    if (audioKu) {
      const t = setTimeout(() => speakKurmanci(audioKu, "kid"), 400);
      return () => clearTimeout(t);
    }
  }, [audioKu]);

  const onTapBank = (w: string, i: number) => {
    if (done) return;
    setPicked(p => [...p, w]);
    setBank(b => b.filter((_, idx) => idx !== i));
    playFx("tap");
  };
  const onTapPicked = (w: string, i: number) => {
    if (done) return;
    setBank(b => [...b, w]);
    setPicked(p => p.filter((_, idx) => idx !== i));
    playFx("tap");
  };
  const check = () => {
    setDone(true);
    const userAnswer = picked.join(" ");
    const ok = userAnswer.replace(/[.,!?]/g, "").toLowerCase().trim()
            === correctSentence.replace(/[.,!?]/g, "").toLowerCase().trim();
    onResult(ok);
  };

  return (
    <View style={wbS.wrap}>
      <Text style={wbS.title}>{prompt}</Text>
      {audioKu && (
        <Pressable
          onPress={() => speakKurmanci(audioKu, "kid")}
          style={wbS.audioBtn}
        >
          <Text style={wbS.audioBtnTxt}>🔊</Text>
        </Pressable>
      )}
      {hint && <Text style={wbS.hint}>"{hint}"</Text>}

      {/* Picked area */}
      <View style={wbS.pickedRow}>
        <View style={wbS.pickedLine} />
        {picked.length === 0 ? (
          <Text style={wbS.empty}>{ui("emptyHint", lang)}</Text>
        ) : (
          <View style={wbS.chipsWrap}>
            {picked.map((w, i) => (
              <DuoChip key={`p-${i}`} label={w} onPress={() => onTapPicked(w, i)} />
            ))}
          </View>
        )}
      </View>

      {/* Bank */}
      <View style={wbS.bankWrap}>
        {bank.map((w, i) => (
          <DuoChip key={`b-${i}`} label={w} onPress={() => onTapBank(w, i)} />
        ))}
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ padding: DUO_SPACING.lg, paddingBottom: 28 }}>
        <DuoButton
          label={picked.length === 0 ? ui("cont", lang) : ui("check", lang)}
          variant={picked.length === 0 ? "outline" : "green"}
          disabled={picked.length === 0}
          onPress={check}
        />
      </View>
    </View>
  );
}

const wbS = StyleSheet.create({
  wrap: { flex: 1 },
  title: { ...DUO_TYPO.h1, color: DUO.eel, padding: DUO_SPACING.lg, paddingBottom: DUO_SPACING.sm },
  audioBtn: {
    alignSelf: "flex-start",
    marginLeft: DUO_SPACING.lg,
    backgroundColor: DUO.macaw,
    borderBottomWidth: 4, borderBottomColor: DUO.macawDark,
    width: 84, height: 84, borderRadius: DUO_RADIUS.lg,
    alignItems: "center", justifyContent: "center",
    marginBottom: DUO_SPACING.md,
  },
  audioBtnTxt: { fontSize: 38 },
  hint: { ...DUO_TYPO.body, color: DUO.wolf, paddingHorizontal: DUO_SPACING.lg, fontStyle: "italic", marginBottom: DUO_SPACING.md },
  pickedRow: { paddingHorizontal: DUO_SPACING.lg, marginBottom: DUO_SPACING.lg, minHeight: 90 },
  pickedLine: { height: 1, backgroundColor: DUO.swan, marginBottom: DUO_SPACING.sm },
  empty: { ...DUO_TYPO.body, color: DUO.hare, textAlign: "center", paddingVertical: DUO_SPACING.md },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: DUO_SPACING.sm },
  bankWrap: {
    flexDirection: "row", flexWrap: "wrap", gap: DUO_SPACING.sm,
    paddingHorizontal: DUO_SPACING.lg,
    borderTopWidth: 1, borderTopColor: DUO.swan,
    paddingTop: DUO_SPACING.lg,
  },
});

// =====================================================================
//  EX 5: MATCH PAIRS — 4 KU + 4 TR çiftle
// =====================================================================

function MatchPairs({ pairs, onResult, lang }: { pairs: { ku: string; tr: string }[]; onResult: (ok: boolean) => void; lang: LangCode }) {
  const [leftSel, setLeftSel] = useState<number | null>(null);
  const [rightSel, setRightSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<{ l: number; r: number } | null>(null);

  // Karıştırılmış indeksler
  const leftItems = useMemo(() => pairs.map((p, i) => ({ ...p, origIdx: i })), [pairs]);
  const rightItems = useMemo(() => shuffleNotIdentity(pairs.map((p, i) => ({ ...p, origIdx: i }))), [pairs]);

  useEffect(() => {
    if (matched.size === pairs.length) {
      setTimeout(() => onResult(true), 600);
    }
  }, [matched, pairs.length]);

  const tap = (side: "l" | "r", origIdx: number) => {
    if (matched.has(origIdx)) return;
    if (side === "l") {
      setLeftSel(origIdx);
      if (rightSel !== null) {
        if (rightSel === origIdx) {
          setMatched(s => new Set([...s, origIdx]));
          playFx("success");
          speakKurmanci(pairs[origIdx].ku, "kid");
          setLeftSel(null); setRightSel(null);
        } else {
          setWrongFlash({ l: origIdx, r: rightSel });
          playFx("fail");
          setTimeout(() => { setWrongFlash(null); setLeftSel(null); setRightSel(null); }, 500);
        }
      }
    } else {
      setRightSel(origIdx);
      if (leftSel !== null) {
        if (leftSel === origIdx) {
          setMatched(s => new Set([...s, origIdx]));
          playFx("success");
          speakKurmanci(pairs[origIdx].ku, "kid");
          setLeftSel(null); setRightSel(null);
        } else {
          setWrongFlash({ l: leftSel, r: origIdx });
          playFx("fail");
          setTimeout(() => { setWrongFlash(null); setLeftSel(null); setRightSel(null); }, 500);
        }
      }
    }
  };

  return (
    <View style={mpS.wrap}>
      <Text style={mpS.title}>{ui("match", lang)}</Text>
      <View style={mpS.row}>
        <View style={mpS.col}>
          {leftItems.map((it) => {
            const isMatched = matched.has(it.origIdx);
            const isSelected = leftSel === it.origIdx;
            const isWrong = wrongFlash?.l === it.origIdx;
            return (
              <DuoChip
                key={`l-${it.origIdx}`}
                label={it.ku}
                onPress={() => tap("l", it.origIdx)}
                selected={isSelected}
                correct={isMatched}
                wrong={isWrong}
                disabled={isMatched}
              />
            );
          })}
        </View>
        <View style={mpS.col}>
          {rightItems.map((it) => {
            const isMatched = matched.has(it.origIdx);
            const isSelected = rightSel === it.origIdx;
            const isWrong = wrongFlash?.r === it.origIdx;
            return (
              <DuoChip
                key={`r-${it.origIdx}`}
                label={tx(lang, it.tr)}
                onPress={() => tap("r", it.origIdx)}
                selected={isSelected}
                correct={isMatched}
                wrong={isWrong}
                disabled={isMatched}
              />
            );
          })}
        </View>
      </View>
      <View style={{ flex: 1 }} />
    </View>
  );
}

const mpS = StyleSheet.create({
  wrap: { flex: 1 },
  title: { ...DUO_TYPO.h1, color: DUO.eel, padding: DUO_SPACING.lg },
  row: { flexDirection: "row", gap: DUO_SPACING.md, paddingHorizontal: DUO_SPACING.lg },
  col: { flex: 1, gap: DUO_SPACING.sm },
});

// =====================================================================
//  EX 6: SELECT IMAGE
// =====================================================================

function SelectImage({
  ex, onResult, lang,
}: {
  ex: Extract<Exercise, { type: "select-image" }>;
  onResult: (ok: boolean) => void;
  lang: LangCode;
}) {
  const [picked, setPicked] = useState<number | null>(null);

  // Karıştır ve doğru indeksi takip et
  const shuffledOpts = useMemo(() => {
    const opts = ex.options.map((o, i) => ({ ...o, origIdx: i }));
    return shuffle(opts);
  }, [ex]);
  const correctOrigIdx = ex.correctIdx;

  const pick = (origIdx: number) => {
    if (picked !== null) return;
    setPicked(origIdx);
    speakKurmanci(ex.ku, "kid");
    onResult(origIdx === correctOrigIdx);
  };

  return (
    <View style={siS.wrap}>
      <Text style={siS.title}>{ui("whichOne", lang)} "{ex.ku}"?</Text>
      <Pressable
        onPress={() => speakKurmanci(ex.ku, "kid")}
        style={siS.audioBtn}
      >
        <Text style={{ fontSize: 20 }}>🔊</Text>
        <Text style={siS.audioBtnTxt}>{ex.ku}</Text>
      </Pressable>
      <View style={siS.grid}>
        {shuffledOpts.map((opt) => {
          const isPicked = picked === opt.origIdx;
          const isCorrect = picked !== null && opt.origIdx === correctOrigIdx;
          let bg = DUO.snow, border = DUO.swan, bottom = DUO.swan;
          if (isCorrect)                  { bg = "#D7FFB8"; border = DUO.green; bottom = DUO.green; }
          else if (isPicked && !isCorrect){ bg = "#FFDFE0"; border = DUO.cardinal; bottom = DUO.cardinal; }
          return (
            <Pressable
              key={opt.origIdx}
              onPress={() => pick(opt.origIdx)}
              style={({ pressed }) => [siS.tile, {
                backgroundColor: bg,
                borderColor: border,
                borderBottomColor: bottom,
                borderBottomWidth: pressed ? 2 : 4,
              }]}
            >
              <Text style={siS.tileEmoji}>{opt.emoji}</Text>
              <Text style={siS.tileLabel}>{tx(lang, opt.tr)}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
    </View>
  );
}

const siS = StyleSheet.create({
  wrap: { flex: 1 },
  title: { ...DUO_TYPO.h1, color: DUO.eel, padding: DUO_SPACING.lg },
  audioBtn: {
    alignSelf: "flex-start", marginLeft: DUO_SPACING.lg,
    flexDirection: "row", alignItems: "center", gap: DUO_SPACING.sm,
    backgroundColor: DUO.macaw,
    borderBottomWidth: 4, borderBottomColor: DUO.macawDark,
    paddingHorizontal: DUO_SPACING.lg, paddingVertical: 10,
    borderRadius: DUO_RADIUS.md,
    marginBottom: DUO_SPACING.md,
  },
  audioBtnTxt: { ...DUO_TYPO.body, color: DUO.snow, fontSize: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: DUO_SPACING.md, paddingHorizontal: DUO_SPACING.lg },
  tile: {
    width: (SW - DUO_SPACING.lg * 2 - DUO_SPACING.md) / 2,
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: DUO_RADIUS.lg,
    alignItems: "center", justifyContent: "center",
    gap: DUO_SPACING.sm,
  },
  tileEmoji: { fontSize: 60 },
  tileLabel: { ...DUO_TYPO.body, color: DUO.eel },
});

// =====================================================================
//  EX 7: FILL BLANK
// =====================================================================

function FillBlank({
  ex, onResult, lang,
}: {
  ex: Extract<Exercise, { type: "fill-blank" }>;
  onResult: (ok: boolean) => void;
  lang: LangCode;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const shuffledOpts = useMemo(() => {
    const items = ex.options.map((o, i) => ({ word: o, origIdx: i }));
    return shuffle(items);
  }, [ex]);

  const pick = (origIdx: number) => {
    if (picked !== null) return;
    setPicked(origIdx);
    onResult(origIdx === ex.correctIdx);
  };

  return (
    <View style={fbExS.wrap}>
      <Text style={fbExS.title}>{ui("fillBlank", lang)}</Text>
      <Text style={fbExS.hint}>"{tx(lang, ex.trHint)}"</Text>
      <View style={fbExS.sentence}>
        <Text style={fbExS.sentTxt}>{ex.sentenceParts[0]}</Text>
        <View style={fbExS.blank}>
          {picked !== null ? (
            <Text style={[fbExS.sentTxt, { color: DUO.macawDark }]}>
              {ex.options[picked]}
            </Text>
          ) : (
            <Text style={[fbExS.sentTxt, { color: DUO.swan }]}>____</Text>
          )}
        </View>
        <Text style={fbExS.sentTxt}>{ex.sentenceParts[1]}</Text>
      </View>
      <View style={fbExS.opts}>
        {shuffledOpts.map((opt) => {
          const isPicked = picked === opt.origIdx;
          const isCorrect = picked !== null && opt.origIdx === ex.correctIdx;
          return (
            <DuoChip
              key={opt.origIdx}
              label={opt.word}
              onPress={() => pick(opt.origIdx)}
              correct={isCorrect}
              wrong={isPicked && !isCorrect}
              disabled={picked !== null && !isPicked}
            />
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
    </View>
  );
}

const fbExS = StyleSheet.create({
  wrap: { flex: 1 },
  title: { ...DUO_TYPO.h1, color: DUO.eel, padding: DUO_SPACING.lg, paddingBottom: 4 },
  hint: { ...DUO_TYPO.body, color: DUO.wolf, paddingHorizontal: DUO_SPACING.lg, fontStyle: "italic", marginBottom: DUO_SPACING.lg },
  sentence: {
    flexDirection: "row", flexWrap: "wrap", alignItems: "center",
    paddingHorizontal: DUO_SPACING.lg, marginBottom: DUO_SPACING.xl,
  },
  sentTxt: { ...DUO_TYPO.h2, color: DUO.eel },
  blank: {
    minWidth: 80, paddingHorizontal: DUO_SPACING.sm, paddingVertical: 4,
    borderBottomWidth: 2, borderBottomColor: DUO.swan,
    alignItems: "center", justifyContent: "center",
    marginHorizontal: 4,
  },
  opts: { flexDirection: "row", flexWrap: "wrap", gap: DUO_SPACING.sm, paddingHorizontal: DUO_SPACING.lg },
});

// =====================================================================
//  ANA OYUNCU (state machine)
// =====================================================================

type Props = {
  lesson: DuoLesson;
  onClose: () => void;
  onComplete: (result: { xp: number; perfect: boolean }) => void;
};

export function LessonPlayer({ lesson, onClose, onComplete }: Props) {
  const ctx = useApp();
  const lang: LangCode = (ctx.lang as LangCode) ?? "tr";

  const [queue, setQueue] = useState<Exercise[]>(lesson.exercises);
  const [completed, setCompleted] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [answerState, setAnswerState] = useState<"idle" | "correct" | "wrong">("idle");
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<string>("");
  const [perfect, setPerfect] = useState(true);
  const totalToComplete = lesson.exercises.length;
  const currentEx = queue[completed];

  if (hearts <= 0) {
    return (
      <View style={dontS.wrap}>
        <Text style={{ fontSize: 80 }}>💔</Text>
        <Text style={dontS.title}>{ui("noHearts", lang)}</Text>
        <Text style={dontS.sub}>{ui("tryLater", lang)}</Text>
        <View style={{ width: "80%", marginTop: DUO_SPACING.xl }}>
          <DuoButton label={ui("cont", lang)} onPress={onClose} />
        </View>
      </View>
    );
  }

  if (!currentEx) {
    // Tüm egzersizler bitti
    setTimeout(() => onComplete({ xp: lesson.xp + (perfect ? 5 : 0), perfect }), 0);
    return null;
  }

  const progress = completed / totalToComplete;

  const handleResult = (ok: boolean) => {
    if (ok) {
      playFx("success");
      setAnswerState("correct");
    } else {
      playFx("fail");
      setHearts(h => h - 1);
      setPerfect(false);
      setAnswerState("wrong");
      setQueue(q => [...q, currentEx]);
      const correctAns =
        currentEx.type === "translate-ku-tr" ? currentEx.sentenceTr :
        currentEx.type === "translate-tr-ku" ? currentEx.sentenceKu :
        currentEx.type === "tap-audio" ? currentEx.words.join(" ") :
        currentEx.type === "select-image" ? currentEx.options[currentEx.correctIdx].tr :
        currentEx.type === "fill-blank" ? currentEx.options[currentEx.correctIdx] :
        "";
      setLastCorrectAnswer(correctAns);
    }
  };

  const handleContinue = () => {
    setAnswerState("idle");
    setLastCorrectAnswer("");
    setCompleted(c => c + 1);
  };

  // === EGZERSİZ RENDER ===
  let body: React.ReactNode = null;
  if (currentEx.type === "new-word") {
    body = <NewWordSlide ex={currentEx} onContinue={handleContinue} lang={lang} />;
  } else if (currentEx.type === "translate-ku-tr") {
    // KU → kullanıcı dili: word bank UI dilinde gösterilsin (TR'yi EN'e çevir)
    body = (
      <WordBankExercise
        lang={lang}
        prompt={ui("enterPrompt", lang)}
        hint={currentEx.sentenceKu}
        words={txArr(lang, currentEx.words)}
        correctSentence={tx(lang, currentEx.sentenceTr)}
        onResult={handleResult}
      />
    );
  } else if (currentEx.type === "translate-tr-ku") {
    // Kullanıcı dili → KU: hint çevrilsin, word bank KU olarak kalır
    body = (
      <WordBankExercise
        lang={lang}
        prompt={ui("enterPromptKu", lang)}
        hint={tx(lang, currentEx.sentenceTr)}
        words={currentEx.words}
        correctSentence={currentEx.sentenceKu}
        onResult={handleResult}
      />
    );
  } else if (currentEx.type === "tap-audio") {
    body = (
      <WordBankExercise
        lang={lang}
        prompt={ui("listenPrompt", lang)}
        hint={currentEx.trHint ? tx(lang, currentEx.trHint) : undefined}
        words={currentEx.words}
        correctSentence={currentEx.words.join(" ")}
        audioKu={currentEx.audioKu}
        onResult={handleResult}
      />
    );
  } else if (currentEx.type === "match-pairs") {
    body = <MatchPairs pairs={currentEx.pairs} onResult={handleResult} lang={lang} />;
  } else if (currentEx.type === "select-image") {
    body = <SelectImage ex={currentEx} onResult={handleResult} lang={lang} />;
  } else if (currentEx.type === "fill-blank") {
    body = <FillBlank ex={currentEx} onResult={handleResult} lang={lang} />;
  }

  return (
    <View style={mainS.root}>
      <TopBar progress={progress} hearts={hearts} onClose={onClose} />
      <View style={{ flex: 1 }}>{body}</View>
      <FeedbackBar state={answerState} correctAnswer={lastCorrectAnswer} onContinue={handleContinue} lang={lang} />
    </View>
  );
}

const mainS = StyleSheet.create({
  root: { flex: 1, backgroundColor: DUO.snow },
});

const dontS = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: DUO.snow, padding: DUO_SPACING.xxl },
  title: { ...DUO_TYPO.hero, color: DUO.eel, marginTop: DUO_SPACING.lg, textAlign: "center" },
  sub: { ...DUO_TYPO.body, color: DUO.wolf, marginTop: DUO_SPACING.sm, textAlign: "center" },
});

// =====================================================================
//  COMPLETE — Bitiş ekranı (XP + perfect bonus)
// =====================================================================

export function LessonComplete({
  xp, perfect, onHome,
}: {
  xp: number;
  perfect: boolean;
  onHome: () => void;
}) {
  const ctx = useApp();
  const lang: LangCode = (ctx.lang as LangCode) ?? "tr";
  return (
    <View style={cS.wrap}>
      <Confetti visible count={50} duration={2200} />
      <Text style={cS.bigEmoji}>{perfect ? "🏆" : "🎉"}</Text>
      <Text style={cS.title}>{perfect ? ui("perfect", lang) : ui("lessonComplete", lang)}</Text>
      <Text style={cS.sub}>{perfect ? ui("perfectSub", lang) : ui("niceSub", lang)}</Text>

      <View style={cS.xpRow}>
        <View style={cS.xpBox}>
          <Text style={cS.xpLabel}>{ui("totalXp", lang)}</Text>
          <View style={cS.xpVal}>
            <Text style={cS.xpEmoji}>⚡</Text>
            <Text style={cS.xpNum}>{xp}</Text>
          </View>
        </View>
        {perfect && (
          <View style={[cS.xpBox, { backgroundColor: DUO.bee }]}>
            <Text style={[cS.xpLabel, { color: DUO.eel }]}>{ui("bonus", lang)}</Text>
            <View style={cS.xpVal}>
              <Text style={cS.xpEmoji}>🏆</Text>
              <Text style={[cS.xpNum, { color: DUO.eel }]}>+5</Text>
            </View>
          </View>
        )}
      </View>

      <View style={{ width: "100%", padding: DUO_SPACING.lg, paddingBottom: 28 }}>
        <DuoButton label={ui("goOn", lang)} onPress={onHome} />
      </View>
    </View>
  );
}

const cS = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: DUO.snow, alignItems: "center", justifyContent: "center", padding: DUO_SPACING.xxl },
  bigEmoji: { fontSize: 96, marginBottom: DUO_SPACING.md },
  title: { ...DUO_TYPO.hero, color: DUO.green, textAlign: "center" },
  sub: { ...DUO_TYPO.body, color: DUO.wolf, marginTop: 4, marginBottom: DUO_SPACING.xxl },
  xpRow: { flexDirection: "row", gap: DUO_SPACING.md, marginBottom: DUO_SPACING.xxl },
  xpBox: {
    backgroundColor: DUO.macaw,
    borderBottomWidth: 4, borderBottomColor: DUO.macawDark,
    paddingHorizontal: DUO_SPACING.xl, paddingVertical: DUO_SPACING.md,
    borderRadius: DUO_RADIUS.md,
    alignItems: "center", minWidth: 120,
  },
  xpLabel: { ...DUO_TYPO.micro, color: DUO.snow, marginBottom: 4 },
  xpVal: { flexDirection: "row", alignItems: "center", gap: 4 },
  xpEmoji: { fontSize: 22 },
  xpNum: { ...DUO_TYPO.hero, color: DUO.snow, fontSize: 30 },
});
