import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence, withDelay, Easing,
} from "react-native-reanimated";

import { KevoMascot } from "@/components/kevo-mascot";
import { SoundButton } from "@/components/kids/sound-button";
import { Confetti } from "@/components/kids/confetti";
import { StoryIntro } from "@/components/kids/story-intro";
import { FloatingBalloons } from "@/components/kids/floating-balloons";
import { useApp } from "@/data/app-context";
import {
  getKidsCategoryByKey, getKidsLessons,
  type KidsLesson, type KidsStep, type KidsCategory, type KidsWord,
} from "@/data/kids-content";

/**
 * Çocuk dersi runner — görsel ve işitsel öğrenme.
 * Step tipleri:
 *  • learn      → büyük emoji + kelime + ses butonu + "BUNU GÖRDÜM" buton
 *  • pickEmoji  → kelime + ses butonu + 4 emoji seçenek
 *  • pickWord   → büyük emoji + 4 kelime seçenek (her birinde küçük ses)
 */

export default function KidsLessonScreen() {
  const { activeCategory, completed, addXp, finishLesson, curLesson, startLesson } = useApp();
  const [showIntro, setShowIntro] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [confettiOn, setConfettiOn] = useState(false);

  const cat = activeCategory ? getKidsCategoryByKey(activeCategory) : null;
  const lessons = cat ? getKidsLessons(cat, 5) : [];
  const lesson: KidsLesson | undefined = lessons.find((l) => l.id === curLesson?.id) ?? lessons[0];

  if (!cat || !lesson) {
    router.replace("/(tabs)");
    return null;
  }

  // Story intro açıksa onu göster
  if (showIntro) {
    return <StoryIntro category={cat} onDone={() => setShowIntro(false)} />;
  }

  const step = lesson.steps[stepIdx];
  const totalSteps = lesson.steps.length;
  const progressPct = ((stepIdx + 1) / totalSteps) * 100;

  const next = () => {
    if (stepIdx + 1 >= totalSteps) {
      setDone(true);
      addXp(lesson.xp);
    } else {
      setStepIdx((i) => i + 1);
    }
  };

  const onCorrect = () => {
    setCorrectCount((c) => c + 1);
    setConfettiOn(true);
    setTimeout(() => setConfettiOn(false), 1500);
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
  };

  const onWrong = () => {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
  };

  // === Bitiş ekranı ===
  if (done) {
    const stars = correctCount === totalSteps - 4 ? 3 : correctCount >= totalSteps - 5 ? 2 : 1;
    return <KidsLessonDone cat={cat} lesson={lesson} stars={stars} onClose={() => router.replace("/(tabs)")} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8E7" }}>
      {/* Hafif yüzen balon arka plan (4 balon) */}
      <FloatingBalloons count={4} />

      <SafeAreaView style={[styles.safe, { backgroundColor: "transparent" }]} edges={["top"]}>
        {/* Top bar: progress + heart */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.replace("/(tabs)")} hitSlop={12}>
            <Text style={{ fontSize: 24, color: "#5C4033" }}>✕</Text>
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: cat.color }]} />
          </View>
          <Text style={{ fontSize: 14, fontWeight: "900", color: cat.color }}>
            {stepIdx + 1}/{totalSteps}
          </Text>
        </View>

        {step.type === "learn" && <LearnStep step={step} cat={cat} onNext={next} />}
        {step.type === "pickEmoji" && (
          <PickEmojiStep step={step} cat={cat} onNext={next} onCorrect={onCorrect} onWrong={onWrong} />
        )}
        {step.type === "pickWord" && (
          <PickWordStep step={step} cat={cat} onNext={next} onCorrect={onCorrect} onWrong={onWrong} />
        )}
      </SafeAreaView>

      {/* Kutlama efekti */}
      <Confetti visible={confettiOn} count={45} />
    </View>
  );
}

// =====================================================================
//  STEP 1: LEARN — büyük emoji, ses butonu, kelime+anlam
// =====================================================================

function LearnStep({ step, cat, onNext }: {
  step: Extract<KidsStep, { type: "learn" }>; cat: KidsCategory; onNext: () => void;
}) {
  const w = step.word;
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 400 });
    // Otomatik ses çalmayalım, çocuk butona bassın
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.lead}>YENİ KELİME ÖĞREN</Text>

      <Animated.View style={[styles.bigEmojiCard, { backgroundColor: cat.color + "18", borderColor: cat.color }, heroStyle]}>
        <Text style={styles.bigEmoji}>{w.emoji}</Text>
      </Animated.View>

      <View style={styles.wordWithSound}>
        <SoundButton text={w.ku} color={cat.color} size="lg" />
        <View>
          <Text style={[styles.kuWord, { color: cat.color }]}>{w.ku}</Text>
          <Text style={styles.trWord}>{w.tr}</Text>
        </View>
      </View>

      <Text style={styles.tip}>👆 Sesi duymak için butona dokun</Text>

      <View style={{ flex: 1 }} />

      <Pressable
        onPress={onNext}
        style={({ pressed }) => [
          styles.bigBtn,
          { backgroundColor: cat.color, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <Text style={styles.bigBtnText}>ANLADIM ✓</Text>
      </Pressable>
    </ScrollView>
  );
}

// =====================================================================
//  STEP 2: PICK EMOJI — kelime → 4 emoji
// =====================================================================

function PickEmojiStep({ step, cat, onNext, onCorrect, onWrong }: {
  step: Extract<KidsStep, { type: "pickEmoji" }>;
  cat: KidsCategory;
  onNext: () => void;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const ok = picked === step.correct;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === step.correct) onCorrect();
    else onWrong();
  };

  // Soru anında sesli oku
  useEffect(() => {
    const t = setTimeout(() => {
      Speech.speak(step.target.ku, { language: "tr-TR", rate: 0.85, pitch: 1.05 });
    }, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.lead}>HANGİ RESİM?</Text>

      <View style={styles.questionCard}>
        <SoundButton text={step.target.ku} color={cat.color} size="lg" />
        <View>
          <Text style={[styles.kuWord, { color: cat.color }]}>{step.target.ku}</Text>
          <Text style={styles.trHint}>↓ Bu kelimenin resmini seç</Text>
        </View>
      </View>

      <View style={styles.emojiGrid}>
        {step.options.map((opt, i) => {
          const isCorrect = picked !== null && i === step.correct;
          const isWrong = picked === i && !ok;
          const dimmed = picked !== null && i !== step.correct && i !== picked;
          return (
            <Pressable
              key={opt.ku + i}
              onPress={() => pick(i)}
              disabled={picked !== null}
              style={({ pressed }) => [
                styles.emojiTile,
                {
                  backgroundColor: isCorrect ? "#D7FFB8" : isWrong ? "#FFD0CC" : "#fff",
                  borderColor: isCorrect ? "#27AE60" : isWrong ? "#E74C3C" : cat.color + "30",
                  borderWidth: picked !== null && (isCorrect || isWrong) ? 3 : 2,
                  opacity: dimmed ? 0.4 : pressed ? 0.85 : 1,
                  transform: pressed ? [{ scale: 0.97 }] : [],
                },
              ]}
            >
              <Text style={styles.tileEmoji}>{opt.emoji}</Text>
              {isCorrect && <Text style={styles.tileMark}>✓</Text>}
              {isWrong && <Text style={styles.tileMark}>✗</Text>}
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      {picked !== null && (
        <View style={[styles.feedbackBar, { backgroundColor: ok ? "#27AE60" : "#E74C3C" }]}>
          <Text style={styles.feedbackText}>
            {ok ? `✨ Aferin! "${step.target.tr}" demek` : `Doğrusu: ${step.options[step.correct].emoji} ${step.options[step.correct].tr}`}
          </Text>
          <Pressable onPress={onNext} style={styles.feedbackBtn}>
            <Text style={styles.feedbackBtnText}>DEVAM →</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

// =====================================================================
//  STEP 3: PICK WORD — emoji → 4 kelime
// =====================================================================

function PickWordStep({ step, cat, onNext, onCorrect, onWrong }: {
  step: Extract<KidsStep, { type: "pickWord" }>;
  cat: KidsCategory;
  onNext: () => void;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const ok = picked === step.correct;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === step.correct) onCorrect();
    else onWrong();
  };

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.lead}>BU NEYİN ADI?</Text>

      <View style={[styles.bigEmojiCard, { backgroundColor: cat.color + "18", borderColor: cat.color }]}>
        <Text style={styles.bigEmoji}>{step.target.emoji}</Text>
        <Text style={styles.trWord}>{step.target.tr}</Text>
      </View>

      <View style={styles.wordList}>
        {step.options.map((opt, i) => {
          const isCorrect = picked !== null && i === step.correct;
          const isWrong = picked === i && !ok;
          const dimmed = picked !== null && i !== step.correct && i !== picked;
          return (
            <Pressable
              key={opt.ku + i}
              onPress={() => pick(i)}
              disabled={picked !== null}
              style={({ pressed }) => [
                styles.wordTile,
                {
                  backgroundColor: isCorrect ? "#D7FFB8" : isWrong ? "#FFD0CC" : "#fff",
                  borderColor: isCorrect ? "#27AE60" : isWrong ? "#E74C3C" : cat.color + "30",
                  borderWidth: picked !== null && (isCorrect || isWrong) ? 3 : 2,
                  opacity: dimmed ? 0.4 : pressed ? 0.85 : 1,
                },
              ]}
            >
              <SoundButton text={opt.ku} color={cat.color} size="sm" />
              <Text style={[styles.wordTileText, { color: isCorrect ? "#27AE60" : isWrong ? "#E74C3C" : "#2C1810" }]}>
                {opt.ku}
              </Text>
              {isCorrect && <Text style={{ fontSize: 22 }}>✓</Text>}
              {isWrong && <Text style={{ fontSize: 22 }}>✗</Text>}
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      {picked !== null && (
        <View style={[styles.feedbackBar, { backgroundColor: ok ? "#27AE60" : "#E74C3C" }]}>
          <Text style={styles.feedbackText}>
            {ok ? `✨ Aferin!` : `Doğrusu: "${step.options[step.correct].ku}"`}
          </Text>
          <Pressable onPress={onNext} style={styles.feedbackBtn}>
            <Text style={styles.feedbackBtnText}>DEVAM →</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

// =====================================================================
//  BİTİŞ EKRANI
// =====================================================================

function KidsLessonDone({ cat, lesson, stars, onClose }: {
  cat: KidsCategory; lesson: KidsLesson; stars: number; onClose: () => void;
}) {
  const star1 = useSharedValue(0);
  const star2 = useSharedValue(0);
  const star3 = useSharedValue(0);
  const heroScale = useSharedValue(0.5);

  useEffect(() => {
    heroScale.value = withSpring(1, { damping: 6 });
    star1.value = withDelay(200, withSpring(1, { damping: 5 }));
    star2.value = withDelay(450, withSpring(1, { damping: 5 }));
    star3.value = withDelay(700, withSpring(1, { damping: 5 }));
  }, []);

  const heroStyle = useAnimatedStyle(() => ({ transform: [{ scale: heroScale.value }] }));
  const starStyles = [
    useAnimatedStyle(() => ({ transform: [{ scale: star1.value }], opacity: stars >= 1 ? 1 : 0.2 })),
    useAnimatedStyle(() => ({ transform: [{ scale: star2.value }], opacity: stars >= 2 ? 1 : 0.2 })),
    useAnimatedStyle(() => ({ transform: [{ scale: star3.value }], opacity: stars >= 3 ? 1 : 0.2 })),
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: "#FFF8E7" }]}>
      <ScrollView contentContainerStyle={styles.doneBody}>
        <Animated.View style={[heroStyle]}>
          <LinearGradient
            colors={cat.bgGradient as unknown as readonly [string, string, ...string[]]}
            style={styles.doneHero}
          >
            <KevoMascot size={140} mood="happy" speaking />
            <Text style={styles.doneTitle}>HARİKA İŞ!</Text>
            <Text style={styles.doneSub}>{lesson.title} bitti</Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.starsRow}>
          {starStyles.map((s, i) => (
            <Animated.Text key={i} style={[styles.bigStar, s]}>⭐</Animated.Text>
          ))}
        </View>

        <View style={styles.rewardCard}>
          <Text style={{ fontSize: 32 }}>🎁</Text>
          <Text style={styles.rewardText}>+{lesson.xp} XP kazandın!</Text>
        </View>

        <Pressable onPress={onClose} style={[styles.bigBtn, { backgroundColor: cat.color }]}>
          <Text style={styles.bigBtnText}>HARİKA! →</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 6 },

  body: { padding: 20, paddingBottom: 28, gap: 16, flexGrow: 1 },

  lead: {
    fontSize: 11,
    fontWeight: "900",
    color: "#5C4033",
    letterSpacing: 1.5,
    textAlign: "center",
  },

  // Big emoji card
  bigEmojiCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    borderRadius: 28,
    borderWidth: 3,
    minHeight: 200,
  },
  bigEmoji: { fontSize: 110 },

  // Word + sound combo
  wordWithSound: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 18,
    padding: 16,
  },
  kuWord: { fontSize: 32, fontWeight: "900" },
  trWord: { fontSize: 18, fontWeight: "700", color: "#5C4033", marginTop: 8, textAlign: "center" },
  trHint: { fontSize: 11, color: "#8B7355", fontWeight: "600", marginTop: 4 },
  tip: { fontSize: 12, color: "#8B7355", textAlign: "center", fontWeight: "600" },

  // Question card
  questionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.05)",
  },

  // Emoji grid (2x2)
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  emojiTile: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tileEmoji: { fontSize: 70 },
  tileMark: {
    position: "absolute",
    top: 8,
    right: 12,
    fontSize: 22,
    fontWeight: "900",
  },

  // Word list (vertical)
  wordList: { gap: 10 },
  wordTile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 18,
  },
  wordTileText: { fontSize: 22, fontWeight: "900", flex: 1 },

  // Big primary button
  bigBtn: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  bigBtnText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
  },

  // Feedback bar (alttan)
  feedbackBar: {
    margin: -20,
    padding: 16,
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  feedbackText: { flex: 1, color: "#fff", fontSize: 14, fontWeight: "800" },
  feedbackBtn: { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  feedbackBtnText: { color: "#fff", fontSize: 12, fontWeight: "900", letterSpacing: 0.5 },

  // Done screen
  doneBody: { padding: 20, gap: 18, alignItems: "center", flexGrow: 1 },
  doneHero: {
    width: "100%",
    padding: 28,
    borderRadius: 28,
    alignItems: "center",
  },
  doneTitle: { fontSize: 28, fontWeight: "900", color: "#fff", marginTop: 12 },
  doneSub: { fontSize: 14, fontWeight: "700", color: "rgba(255,255,255,0.85)", marginTop: 4 },

  starsRow: { flexDirection: "row", gap: 16 },
  bigStar: { fontSize: 56 },

  rewardCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: "#F39C12",
  },
  rewardText: { fontSize: 18, fontWeight: "900", color: "#D87B0A" },
});
