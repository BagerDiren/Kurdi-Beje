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

function TopBar({ progress, hearts, combo, onClose }: { progress: number; hearts: number; combo: number; onClose: () => void }) {
  return (
    <View style={topS.wrap}>
      <Pressable onPress={onClose} hitSlop={10}>
        <Text style={topS.x}>✕</Text>
      </Pressable>
      <View style={topS.barTrack}>
        <View style={[topS.barFill, { width: `${Math.max(0, Math.min(100, progress * 100))}%` }]} />
      </View>
      {combo >= 3 && (
        <View style={topS.combo}>
          <Text style={topS.comboIcon}>🔥</Text>
          <Text style={topS.comboTxt}>×{combo}</Text>
        </View>
      )}
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
  combo: {
    flexDirection: "row", alignItems: "center", gap: 2,
    backgroundColor: DUO.fox + "22",
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 999,
  },
  comboIcon: { fontSize: 14 },
  comboTxt: { ...DUO_TYPO.h3, color: DUO.fox, fontSize: 14 },
});

// =====================================================================
//  FEEDBACK BAR — alt panel (doğru/yanlış sonrası "Continue")
// =====================================================================

function FeedbackBar({
  state, correctAnswer, explanation, onContinue, lang,
}: {
  state: "idle" | "correct" | "wrong";
  correctAnswer?: string;
  explanation?: string;
  onContinue: () => void;
  lang: LangCode;
}) {
  const [showExplanation, setShowExplanation] = useState(false);
  // Sıfırla yeni soruda
  useEffect(() => { if (state === "idle") setShowExplanation(false); }, [state]);
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
          {/* Açıkla butonu — sadece yanlışta + explanation varsa */}
          {!isCorrect && explanation && !showExplanation && (
            <Pressable onPress={() => setShowExplanation(true)} style={fbS.explainBtn}>
              <Text style={fbS.explainBtnTxt}>
                💡 {lang === "en" ? "Explain" : lang === "ku" ? "Şîrove bike" : "Açıkla"}
              </Text>
            </Pressable>
          )}
          {showExplanation && explanation && (
            <View style={fbS.explainBox}>
              <Text style={fbS.explainTxt}>{explanation}</Text>
            </View>
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
  explainBtn: {
    marginTop: DUO_SPACING.sm,
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: DUO_SPACING.md, paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  explainBtnTxt: { ...DUO_TYPO.body, color: DUO.eel, fontSize: 13 },
  explainBox: {
    marginTop: DUO_SPACING.sm,
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: DUO_SPACING.md,
    borderRadius: DUO_RADIUS.md,
    borderLeftWidth: 3, borderLeftColor: DUO.bee,
  },
  explainTxt: { ...DUO_TYPO.body, color: DUO.eel, lineHeight: 20 },
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

// =====================================================================
//  EX 8: TIP CARD — gramer/kültür açıklaması
// =====================================================================

function TipCardSlide({ ex, onContinue, lang }: { ex: Extract<Exercise, { type: "tip-card" }>; onContinue: () => void; lang: LangCode }) {
  return (
    <View style={tcS.wrap}>
      <Text style={tcS.label}>
        💡 {lang === "en" ? "GRAMMAR TIP" : lang === "ku" ? "ŞÎROVA RÊZIMANÊ" : "GRAMER İPUCU"}
      </Text>
      <View style={tcS.card}>
        <Text style={tcS.emoji}>{ex.emoji}</Text>
        <Text style={tcS.title}>{ex.title}</Text>
        <Text style={tcS.body}>{tx(lang, ex.bodyTr)}</Text>
        {ex.example && (
          <View style={tcS.example}>
            <Text style={tcS.exampleKu}>"{ex.example.ku}"</Text>
            <Text style={tcS.exampleTr}>{tx(lang, ex.example.tr)}</Text>
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

const tcS = StyleSheet.create({
  wrap: { flex: 1 },
  label: { ...DUO_TYPO.micro, color: DUO.bee, textAlign: "center", marginTop: DUO_SPACING.lg, letterSpacing: 1.5 },
  card: {
    margin: DUO_SPACING.lg,
    backgroundColor: "#FFF8E1",  // sarımsı krem (ipucu hissi)
    borderWidth: 2, borderColor: DUO.bee,
    borderBottomWidth: 4,
    borderRadius: DUO_RADIUS.xl,
    padding: DUO_SPACING.xl,
    gap: DUO_SPACING.md,
  },
  emoji: { fontSize: 56, alignSelf: "center" },
  title: { ...DUO_TYPO.h1, color: DUO.eel, textAlign: "center" },
  body: { ...DUO_TYPO.body, color: DUO.eel, lineHeight: 22, fontSize: 15 },
  example: {
    marginTop: DUO_SPACING.sm,
    padding: DUO_SPACING.md,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: DUO_RADIUS.md,
    borderLeftWidth: 3, borderLeftColor: DUO.macaw,
  },
  exampleKu: { ...DUO_TYPO.h3, color: DUO.eel, fontStyle: "italic" },
  exampleTr: { ...DUO_TYPO.body, color: DUO.wolf, marginTop: 4 },
});

// =====================================================================
//  EX 9: STORY — diyalog anlatımı
// =====================================================================

function StorySlide({ ex, onContinue, lang }: { ex: Extract<Exercise, { type: "story" }>; onContinue: () => void; lang: LangCode }) {
  return (
    <View style={stS.wrap}>
      <Text style={stS.label}>
        📖 {lang === "en" ? "STORY" : lang === "ku" ? "ÇÎROK" : "HİKAYE"}
      </Text>
      <Text style={stS.title}>{ex.title}</Text>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={stS.scroll}>
        {ex.lines.map((line, i) => {
          const isNarrator = line.speaker === "narrator";
          const isA = line.speaker === "A";
          const align = isNarrator ? "center" : isA ? "flex-start" : "flex-end";
          const bg = isNarrator ? "rgba(0,0,0,0.04)" : isA ? "#E1F5FE" : "#F3E5F5";
          const speakerEmoji = isA ? "👦" : line.speaker === "B" ? "👩" : "📜";
          return (
            <View key={i} style={[stS.bubble, { alignSelf: align as "flex-start", backgroundColor: bg, maxWidth: "85%" }]}>
              {!isNarrator && <Text style={stS.speaker}>{speakerEmoji}</Text>}
              <Pressable onPress={() => speakKurmanci(line.ku, "kid")} style={stS.kuRow}>
                <Text style={stS.lineKu}>{line.ku}</Text>
                <Text style={{ fontSize: 16, marginLeft: 6 }}>🔊</Text>
              </Pressable>
              <Text style={stS.lineTr}>{tx(lang, line.tr)}</Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={{ padding: DUO_SPACING.lg, paddingBottom: 28 }}>
        <DuoButton label={ui("iGotIt", lang)} onPress={onContinue} />
      </View>
    </View>
  );
}

const stS = StyleSheet.create({
  wrap: { flex: 1 },
  label: { ...DUO_TYPO.micro, color: DUO.beetle, textAlign: "center", marginTop: DUO_SPACING.lg, letterSpacing: 1.5 },
  title: { ...DUO_TYPO.h1, color: DUO.eel, textAlign: "center", marginTop: 4 },
  scroll: { padding: DUO_SPACING.lg, gap: DUO_SPACING.sm },
  bubble: {
    paddingHorizontal: DUO_SPACING.md, paddingVertical: DUO_SPACING.sm,
    borderRadius: DUO_RADIUS.lg,
    gap: 4,
  },
  speaker: { fontSize: 20 },
  kuRow: { flexDirection: "row", alignItems: "center" },
  lineKu: { ...DUO_TYPO.h3, color: DUO.eel },
  lineTr: { ...DUO_TYPO.body, color: DUO.wolf, fontStyle: "italic" },
});

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

  // Büyük tile renderer (full-width, 60-80px yükseklik)
  const renderTile = (
    label: string,
    isMatched: boolean,
    isSelected: boolean,
    isWrong: boolean,
    onPress: () => void,
    side: "l" | "r",
  ) => {
    let bg = DUO.snow;
    let border = DUO.swan;
    let bottomBorder = DUO.swan;
    let textColor = DUO.eel;
    if (isSelected)  { bg = "#DDF4FF"; border = DUO.macaw; bottomBorder = DUO.macaw; textColor = DUO.macawDark; }
    if (isMatched)   { bg = "#D7FFB8"; border = DUO.green; bottomBorder = DUO.green; textColor = DUO.treeGreen; }
    if (isWrong)     { bg = "#FFDFE0"; border = DUO.cardinal; bottomBorder = DUO.cardinal; textColor = DUO.cardinalDark; }
    return (
      <Pressable
        onPress={isMatched ? undefined : onPress}
        disabled={isMatched}
        style={({ pressed }) => [
          mpS.tile,
          {
            backgroundColor: bg,
            borderColor: border,
            borderBottomColor: bottomBorder,
            borderBottomWidth: pressed ? 2 : 5,
            opacity: isMatched ? 0.6 : 1,
            transform: [{ translateY: pressed ? 3 : 0 }],
          },
        ]}
      >
        <Text style={[mpS.tileLabel, { color: textColor }]} numberOfLines={2}>
          {label}
        </Text>
        {side === "l" && !isMatched && (
          <Pressable
            onPress={(e) => { e.stopPropagation(); speakKurmanci(label, "kid"); }}
            hitSlop={6}
            style={mpS.tileSpeaker}
          >
            <Text style={{ fontSize: 18 }}>🔊</Text>
          </Pressable>
        )}
      </Pressable>
    );
  };

  const matchedCount = matched.size;
  const totalCount = pairs.length;

  return (
    <View style={mpS.wrap}>
      <View style={mpS.header}>
        <Text style={mpS.title}>{ui("match", lang)}</Text>
        <View style={mpS.progressBadge}>
          <Text style={mpS.progressTxt}>{matchedCount}/{totalCount}</Text>
        </View>
      </View>
      <View style={mpS.gridWrap}>
        <View style={mpS.col}>
          {leftItems.map((it) => (
            <View key={`l-${it.origIdx}`} style={mpS.tileSlot}>
              {renderTile(
                it.ku,
                matched.has(it.origIdx),
                leftSel === it.origIdx,
                wrongFlash?.l === it.origIdx,
                () => tap("l", it.origIdx),
                "l",
              )}
            </View>
          ))}
        </View>
        <View style={mpS.col}>
          {rightItems.map((it) => (
            <View key={`r-${it.origIdx}`} style={mpS.tileSlot}>
              {renderTile(
                tx(lang, it.tr),
                matched.has(it.origIdx),
                rightSel === it.origIdx,
                wrongFlash?.r === it.origIdx,
                () => tap("r", it.origIdx),
                "r",
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const mpS = StyleSheet.create({
  wrap: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: DUO_SPACING.lg, paddingTop: DUO_SPACING.lg, paddingBottom: DUO_SPACING.sm,
  },
  title: { ...DUO_TYPO.h1, color: DUO.eel },
  progressBadge: {
    backgroundColor: DUO.green,
    paddingHorizontal: DUO_SPACING.md, paddingVertical: 4,
    borderRadius: 999,
  },
  progressTxt: { ...DUO_TYPO.h3, color: DUO.snow, fontSize: 14 },
  gridWrap: {
    flex: 1,
    flexDirection: "row",
    gap: DUO_SPACING.md,
    paddingHorizontal: DUO_SPACING.lg,
    paddingVertical: DUO_SPACING.sm,
  },
  col: { flex: 1, justifyContent: "space-around", gap: DUO_SPACING.sm },
  tileSlot: { flex: 1 },
  tile: {
    flex: 1,
    minHeight: 64,
    borderWidth: 2,
    borderRadius: DUO_RADIUS.lg,
    paddingHorizontal: DUO_SPACING.md,
    paddingVertical: DUO_SPACING.sm,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tileLabel: { ...DUO_TYPO.h3, textAlign: "center" },
  tileSpeaker: {
    position: "absolute", top: 6, right: 8,
    width: 26, height: 26, borderRadius: 999,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(28,176,246,0.12)",
  },
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

  // 4 seçenek 2x2 grid, dikey alanı eşit paylaş (boşluk bırakma)
  const rows = [shuffledOpts.slice(0, 2), shuffledOpts.slice(2, 4)];

  return (
    <View style={siS.wrap}>
      <View style={siS.headerRow}>
        <Text style={siS.title}>{ui("whichOne", lang)}</Text>
        <Pressable onPress={() => speakKurmanci(ex.ku, "kid")} style={siS.audioBtn}>
          <Text style={{ fontSize: 22 }}>🔊</Text>
          <Text style={siS.audioBtnTxt}>{ex.ku}</Text>
        </Pressable>
      </View>
      <View style={siS.gridFlex}>
        {rows.map((row, rIdx) => (
          <View key={rIdx} style={siS.gridRow}>
            {row.map((opt) => {
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
                    borderBottomWidth: pressed ? 2 : 5,
                    transform: [{ translateY: pressed ? 3 : 0 }],
                  }]}
                >
                  <Text style={siS.tileEmoji}>{opt.emoji}</Text>
                  <Text style={siS.tileLabel}>{tx(lang, opt.tr)}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const siS = StyleSheet.create({
  wrap: { flex: 1 },
  headerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: DUO_SPACING.lg, paddingTop: DUO_SPACING.lg, paddingBottom: DUO_SPACING.sm,
  },
  title: { ...DUO_TYPO.h2, color: DUO.eel, flex: 1 },
  audioBtn: {
    flexDirection: "row", alignItems: "center", gap: DUO_SPACING.sm,
    backgroundColor: DUO.macaw,
    borderBottomWidth: 4, borderBottomColor: DUO.macawDark,
    paddingHorizontal: DUO_SPACING.md, paddingVertical: 10,
    borderRadius: DUO_RADIUS.md,
  },
  audioBtnTxt: { ...DUO_TYPO.body, color: DUO.snow, fontSize: 15 },
  gridFlex: {
    flex: 1,
    paddingHorizontal: DUO_SPACING.lg,
    paddingTop: DUO_SPACING.sm,
    paddingBottom: DUO_SPACING.md,
    gap: DUO_SPACING.md,
  },
  gridRow: {
    flex: 1,
    flexDirection: "row",
    gap: DUO_SPACING.md,
  },
  tile: {
    flex: 1,
    borderWidth: 2,
    borderRadius: DUO_RADIUS.lg,
    alignItems: "center", justifyContent: "center",
    gap: DUO_SPACING.sm,
    paddingVertical: DUO_SPACING.md,
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
  onComplete: (result: { xp: number; perfect: boolean; maxCombo: number }) => void;
};

export function LessonPlayer({ lesson, onClose, onComplete }: Props) {
  const ctx = useApp();
  const lang: LangCode = (ctx.lang as LangCode) ?? "tr";

  const [queue, setQueue] = useState<Exercise[]>(lesson.exercises);
  const [completed, setCompleted] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [answerState, setAnswerState] = useState<"idle" | "correct" | "wrong">("idle");
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<string>("");
  const [lastExplanation, setLastExplanation] = useState<string | undefined>(undefined);
  const [perfect, setPerfect] = useState(true);
  // Combo: ardışık doğru sayacı + zirvedeki combo (XP bonusu için)
  const [currentCombo, setCurrentCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
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
    // Tüm egzersizler bitti — combo bonusu hesapla
    const comboBonus =
      maxCombo >= 10 ? 15 :
      maxCombo >= 6  ? 10 :
      maxCombo >= 3  ? 5  : 0;
    const totalXp = lesson.xp + (perfect ? 5 : 0) + comboBonus;
    setTimeout(() => onComplete({ xp: totalXp, perfect, maxCombo }), 0);
    return null;
  }

  const progress = completed / totalToComplete;

  const handleResult = (ok: boolean) => {
    if (ok) {
      playFx("success");
      setAnswerState("correct");
      // Combo arttır
      const nextCombo = currentCombo + 1;
      setCurrentCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);
    } else {
      playFx("fail");
      setHearts(h => h - 1);
      setPerfect(false);
      setAnswerState("wrong");
      setCurrentCombo(0);  // combo kırıldı
      setQueue(q => [...q, currentEx]);
      const correctAns =
        currentEx.type === "translate-ku-tr" ? currentEx.sentenceTr :
        currentEx.type === "translate-tr-ku" ? currentEx.sentenceKu :
        currentEx.type === "tap-audio" ? currentEx.words.join(" ") :
        currentEx.type === "select-image" ? currentEx.options[currentEx.correctIdx].tr :
        currentEx.type === "fill-blank" ? currentEx.options[currentEx.correctIdx] :
        "";
      setLastCorrectAnswer(correctAns);
      // Açıklama varsa al
      const exp = (currentEx as any).explanation as string | undefined;
      setLastExplanation(exp);
    }
  };

  const handleContinue = () => {
    setAnswerState("idle");
    setLastCorrectAnswer("");
    setLastExplanation(undefined);
    setCompleted(c => c + 1);
  };

  // tip-card ve story → "doğru" gibi sayılır (etkileşim yok), combo'yu kırmaz/değiştirmez
  const passNonInteractive = () => {
    setCompleted(c => c + 1);
  };

  // === EGZERSİZ RENDER ===
  let body: React.ReactNode = null;
  if (currentEx.type === "tip-card") {
    body = <TipCardSlide ex={currentEx} onContinue={passNonInteractive} lang={lang} />;
  } else if (currentEx.type === "story") {
    body = <StorySlide ex={currentEx} onContinue={passNonInteractive} lang={lang} />;
  } else if (currentEx.type === "new-word") {
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
      <TopBar progress={progress} hearts={hearts} combo={currentCombo} onClose={onClose} />
      <View style={{ flex: 1 }}>{body}</View>
      <FeedbackBar
        state={answerState}
        correctAnswer={lastCorrectAnswer}
        explanation={lastExplanation}
        onContinue={handleContinue}
        lang={lang}
      />
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
  xp, perfect, maxCombo, onHome,
}: {
  xp: number;
  perfect: boolean;
  maxCombo?: number;
  onHome: () => void;
}) {
  const ctx = useApp();
  const lang: LangCode = (ctx.lang as LangCode) ?? "tr";
  const showCombo = (maxCombo ?? 0) >= 3;
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
        {showCombo && (
          <View style={[cS.xpBox, { backgroundColor: DUO.fox }]}>
            <Text style={[cS.xpLabel, { color: DUO.snow }]}>COMBO</Text>
            <View style={cS.xpVal}>
              <Text style={cS.xpEmoji}>🔥</Text>
              <Text style={cS.xpNum}>×{maxCombo}</Text>
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
