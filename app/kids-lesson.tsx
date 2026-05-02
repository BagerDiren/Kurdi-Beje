import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Image } from "react-native";
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
import { speakKurmanci, speakKurmanciKid, playFx } from "@/data/sound-fx";
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
  const { activeCategory, completed, markLessonDone } = useApp();
  const [showIntro, setShowIntro] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [confettiOn, setConfettiOn] = useState(false);

  const cat = activeCategory ? getKidsCategoryByKey(activeCategory) : null;
  const lessons = cat ? getKidsLessons(cat, 5) : [];
  // Sıradaki yapılmamış dersi otomatik aç. Hepsi tamamsa ilk dersi (tekrar)
  const lesson: KidsLesson | undefined =
    lessons.find((l) => !completed.includes(l.id)) ?? lessons[0];

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
      // XP + completed + streak hepsini context yönetir
      markLessonDone(lesson.id, lesson.xp);
    } else {
      setStepIdx((i) => i + 1);
    }
  };

  const onCorrect = () => {
    setCorrectCount((c) => c + 1);
    setConfettiOn(true);
    setTimeout(() => setConfettiOn(false), 1500);
    playFx("success"); // sesli "Aferin!" + Haptic
  };

  const onWrong = () => {
    playFx("fail"); // yumuşak "Tekrar dene" + Haptic
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
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 9, stiffness: 110 });
    opacity.value = withTiming(1, { duration: 500 });
    // 800ms sonra otomatik söylesin (Drops gibi)
    const t = setTimeout(() => speakKurmanciKid(w.ku), 800);
    return () => clearTimeout(t);
  }, [w.ku]);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.body}>
      {/* Üst minimal etiket */}
      <Text style={styles.minimalLead}>{cat.title.toUpperCase()}</Text>

      {/* HERO foto/emoji */}
      <Animated.View style={[styles.heroSlot, heroStyle]}>
        {w.photo ? (
          <View style={[styles.photoWrap, { borderColor: cat.color }]}>
            {!photoLoaded && (
              <View style={[styles.photoSkeleton, { backgroundColor: cat.color + "22" }]} />
            )}
            <Image
              source={{ uri: w.photo }}
              style={styles.photoImg}
              resizeMode="cover"
              onLoad={() => setPhotoLoaded(true)}
            />
            <View style={[styles.photoEmojiTag, { backgroundColor: cat.color }]}>
              <Text style={{ fontSize: 30 }}>{w.emoji}</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.emojiSlot, { backgroundColor: cat.color + "12", borderColor: cat.color + "30" }]}>
            <Text style={styles.bigEmoji}>{w.emoji}</Text>
          </View>
        )}
      </Animated.View>

      {/* Büyük kelime + ses butonu (orta hizalı, Drops tarzı) */}
      <View style={styles.wordCenter}>
        <Text style={[styles.bigKuWord, { color: cat.color }]}>{w.ku}</Text>
        <Text style={styles.bigTrWord}>{w.tr}</Text>
        <View style={styles.soundRow}>
          <SoundButton text={w.ku} color={cat.color} size="md" />
          <Text style={styles.tip}>Tıkla · uzun bas: Forvo</Text>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      {/* CTA */}
      <Pressable
        onPress={onNext}
        style={({ pressed }) => [
          styles.bigBtn,
          { backgroundColor: cat.color, opacity: pressed ? 0.92 : 1, transform: pressed ? [{ scale: 0.98 }] : [] },
        ]}
      >
        <Text style={styles.bigBtnText}>DEVAM ET</Text>
      </Pressable>
    </View>
  );
}

// =====================================================================
//  STEP 2: PICK EMOJI — kelime → 4 emoji
// =====================================================================

// Foto + emoji rozeti, skeleton placeholder ile (loading sırasında boş kalmasın)
function PhotoTileWithEmoji({ uri, emoji }: { uri: string; emoji: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <View style={styles.tilePhotoWrap}>
      {!loaded && <View style={styles.tilePhotoSkeleton} />}
      <Image
        source={{ uri }}
        style={styles.tilePhoto}
        resizeMode="cover"
        onLoad={() => setLoaded(true)}
      />
      <View style={styles.tilePhotoEmoji}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
    </View>
  );
}

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

  // Soru anında çocuk dostu (yüksek pitch + yavaş + tekrarlı) sesli oku
  useEffect(() => {
    const t = setTimeout(() => speakKurmanciKid(step.target.ku), 200);
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
              {opt.photo ? (
                <PhotoTileWithEmoji uri={opt.photo} emoji={opt.emoji} />
              ) : (
                <Text style={styles.tileEmoji}>{opt.emoji}</Text>
              )}
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
  const [confettiOn, setConfettiOn] = useState(true);

  useEffect(() => {
    heroScale.value = withSpring(1, { damping: 6 });
    star1.value = withDelay(200, withSpring(1, { damping: 5 }));
    star2.value = withDelay(450, withSpring(1, { damping: 5 }));
    star3.value = withDelay(700, withSpring(1, { damping: 5 }));
    playFx("celebrate");
    const t = setTimeout(() => setConfettiOn(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const heroStyle = useAnimatedStyle(() => ({ transform: [{ scale: heroScale.value }] }));
  const starStyles = [
    useAnimatedStyle(() => ({ transform: [{ scale: star1.value }], opacity: stars >= 1 ? 1 : 0.2 })),
    useAnimatedStyle(() => ({ transform: [{ scale: star2.value }], opacity: stars >= 2 ? 1 : 0.2 })),
    useAnimatedStyle(() => ({ transform: [{ scale: star3.value }], opacity: stars >= 3 ? 1 : 0.2 })),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8E7" }}>
      <FloatingBalloons count={5} />
      <Confetti visible={confettiOn} count={60} />
      <SafeAreaView style={[styles.safe, { backgroundColor: "transparent" }]}>
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
    </View>
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

  body: { padding: 24, paddingBottom: 24, gap: 22, flex: 1 },

  // Drops/Babbel tarzı minimal lead
  minimalLead: {
    fontSize: 11,
    fontWeight: "900",
    color: "#8B7355",
    letterSpacing: 2.5,
    textAlign: "center",
    marginTop: 4,
  },
  lead: {
    fontSize: 11,
    fontWeight: "900",
    color: "#5C4033",
    letterSpacing: 1.5,
    textAlign: "center",
  },

  // Hero foto/emoji slot (Drops tarzı geniş ortalı)
  heroSlot: {
    alignItems: "center",
    marginTop: 8,
  },
  photoWrap: {
    width: "100%",
    aspectRatio: 1.3,
    borderRadius: 28,
    overflow: "hidden",
    position: "relative",
    borderWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  photoImg: { width: "100%", height: "100%" },
  photoSkeleton: {
    ...StyleSheet.absoluteFillObject,
  },
  photoEmojiTag: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  emojiSlot: {
    width: "100%",
    aspectRatio: 1.3,
    borderRadius: 28,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  bigEmoji: { fontSize: 130 },
  // Eski kompozit (legacy)
  bigEmojiCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    borderRadius: 28,
    borderWidth: 3,
    minHeight: 200,
  },

  // Drops tarzı kelime ortalı düzen
  wordCenter: {
    alignItems: "center",
    gap: 8,
  },
  bigKuWord: {
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  bigTrWord: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5C4033",
    textAlign: "center",
    marginTop: 2,
  },
  soundRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },

  // Eski kelime+ses combo (legacy)
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
  tip: { fontSize: 11, color: "#8B7355", fontWeight: "600" },

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
  tilePhotoWrap: { width: "100%", height: "100%", borderRadius: 18, overflow: "hidden", position: "relative" },
  tilePhoto: { width: "100%", height: "100%" },
  tilePhotoSkeleton: { ...StyleSheet.absoluteFillObject, backgroundColor: "#E0E0E0" },
  tilePhotoEmoji: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
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
