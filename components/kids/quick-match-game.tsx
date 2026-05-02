import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  withSequence, withRepeat, Easing,
} from "react-native-reanimated";

import { Confetti } from "./confetti";
import { speakKurmanci, playFx } from "@/data/sound-fx";
import { KIDS_THEME, RADIUS, SHADOW, SPACING, TYPO } from "./design";
import { KidCharacter } from "./kid-character";
import type { KidsCategory, KidsWord } from "@/data/kids-content";

/**
 * 🎯 HIZLI EŞLEŞTİRME (Quick Match)
 *
 * Lingokids/Drops tarzı timed mini oyun.
 *
 * Mekanik:
 *   • Üstte BÜYÜK foto/emoji kartı (rastgele bir kelime)
 *   • Altta 2 KU peyv kartı yan yana (1 doğru + 1 yanlış)
 *   • 30 saniye süre, mümkün olduğunca çok doğru cevap
 *   • Doğru: +1 skor, +0.5sn süre bonus, confetti, "Aferin!"
 *   • Yanlış: -1.5sn ceza, kart sallanır
 *   • Bitince: skor + yıldız + +XP
 */

type Props = {
  category: KidsCategory;
  onDone: (xp: number) => void;
};

const ROUND_TIME = 30;

export function QuickMatchGame({ category, onDone }: Props) {
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(ROUND_TIME);
  const [target, setTarget] = useState<KidsWord | null>(null);
  const [options, setOptions] = useState<KidsWord[]>([]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [confettiOn, setConfettiOn] = useState(false);
  const [done, setDone] = useState(false);

  // Şok efektleri
  const heroScale = useSharedValue(1);
  const heroShake = useSharedValue(0);
  const timerScale = useSharedValue(1);

  const newRound = () => {
    const tgt = category.words[Math.floor(Math.random() * category.words.length)];
    const distractor = category.words.filter((w) => w.ku !== tgt.ku).sort(() => Math.random() - 0.5)[0];
    const correct = Math.random() < 0.5 ? 0 : 1;
    const opts = correct === 0 ? [tgt, distractor] : [distractor, tgt];
    setTarget(tgt);
    setOptions(opts);
    setCorrectIdx(correct);
    setPicked(null);
    heroScale.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withSpring(1, { damping: 7 }),
    );
    setTimeout(() => speakKurmanci(tgt.ku, "kid"), 200);
  };

  useEffect(() => {
    newRound();
  }, []);

  // Timer tick
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setTime((s) => {
        if (s <= 0) {
          setDone(true);
          return 0;
        }
        // Son 5 saniye nabızlı animasyon
        if (s <= 6) {
          timerScale.value = withSequence(
            withTiming(1.15, { duration: 200 }),
            withTiming(1, { duration: 200 }),
          );
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done]);

  const onPick = (i: number) => {
    if (picked !== null || done) return;
    setPicked(i);
    if (i === correctIdx) {
      playFx("success");
      setScore((s) => s + 1);
      setTime((t) => Math.min(ROUND_TIME, t + 1)); // +1sn bonus
      setConfettiOn(true);
      setTimeout(() => setConfettiOn(false), 1000);
      setTimeout(() => newRound(), 700);
    } else {
      playFx("fail");
      setTime((t) => Math.max(0, t - 2)); // -2sn ceza
      heroShake.value = withSequence(
        withTiming(-12, { duration: 80 }),
        withTiming(12, { duration: 80 }),
        withTiming(0, { duration: 80 }),
      );
      setTimeout(() => newRound(), 700);
    }
  };

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }, { translateX: heroShake.value }],
  }));
  const timerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timerScale.value }],
  }));

  // === BİTTİ ===
  if (done) {
    const xp = score * 4;
    const stars = score >= 15 ? 3 : score >= 8 ? 2 : score >= 3 ? 1 : 0;
    return (
      <View style={[styles.root, { backgroundColor: KIDS_THEME.bg }]}>
        <View style={styles.doneBox}>
          <KidCharacter character="kevo" size={130} bounce />
          <Text style={styles.doneTitle}>{score >= 8 ? "Süpersin!" : "Tekrar dene!"}</Text>
          <Text style={styles.doneSub}>{score} doğru cevap</Text>
          <View style={styles.doneStars}>
            {[0, 1, 2].map((i) => (
              <Text key={i} style={[styles.doneStar, { opacity: i < stars ? 1 : 0.18 }]}>⭐</Text>
            ))}
          </View>
          <Pressable
            onPress={() => onDone(xp)}
            style={({ pressed }) => [
              styles.doneCta,
              { backgroundColor: KIDS_THEME.primary, opacity: pressed ? 0.92 : 1 },
              SHADOW(KIDS_THEME.primary, "lg"),
            ]}
          >
            <Text style={styles.doneCtaText}>+{xp} XP topla 🚀</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: KIDS_THEME.bg }]}>
      {/* Üst HUD: süre + skor */}
      <View style={styles.hud}>
        <Animated.View style={[
          styles.timer,
          { backgroundColor: time <= 6 ? KIDS_THEME.red + "22" : KIDS_THEME.primarySoft, borderColor: time <= 6 ? KIDS_THEME.red : KIDS_THEME.primary },
          timerStyle,
        ]}>
          <Text style={{ fontSize: 22 }}>⏱️</Text>
          <Text style={[styles.timerVal, { color: time <= 6 ? KIDS_THEME.red : KIDS_THEME.primaryDark }]}>
            {time}
          </Text>
        </Animated.View>
        <View style={styles.score}>
          <Text style={{ fontSize: 22 }}>⭐</Text>
          <Text style={styles.scoreVal}>{score}</Text>
        </View>
      </View>

      {/* HERO: hedef foto/emoji */}
      <View style={styles.heroWrap}>
        <Animated.View style={[
          styles.hero,
          { backgroundColor: category.color + "12", borderColor: category.color },
          heroStyle,
        ]}>
          {target?.photo ? (
            <Image source={{ uri: target.photo }} style={styles.heroImg} resizeMode="cover" />
          ) : (
            <Text style={{ fontSize: 130 }}>{target?.emoji}</Text>
          )}
          {target?.photo && (
            <View style={[styles.heroEmoji, { backgroundColor: category.color }]}>
              <Text style={{ fontSize: 36 }}>{target.emoji}</Text>
            </View>
          )}
        </Animated.View>
        <Text style={styles.heroLabel}>BU NE? 👇</Text>
      </View>

      {/* 2 kart */}
      <View style={styles.cards}>
        {options.map((opt, i) => {
          const isCorrect = picked !== null && i === correctIdx;
          const isWrong = picked === i && !isCorrect;
          const dimmed = picked !== null && !isCorrect && !isWrong;
          return (
            <Pressable
              key={opt.ku + i}
              onPress={() => onPick(i)}
              disabled={picked !== null}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: isCorrect ? KIDS_THEME.success : isWrong ? KIDS_THEME.danger : "#fff",
                  borderColor: isCorrect ? KIDS_THEME.success : isWrong ? KIDS_THEME.danger : category.color,
                  opacity: dimmed ? 0.45 : pressed ? 0.92 : 1,
                  transform: pressed ? [{ scale: 0.96 }] : [],
                },
                SHADOW(isCorrect ? KIDS_THEME.success : isWrong ? KIDS_THEME.danger : category.color, "md"),
              ]}
            >
              <Text style={[
                styles.cardText,
                { color: isCorrect || isWrong ? "#fff" : category.color },
              ]}>
                {opt.ku}
              </Text>
              {isCorrect && <Text style={{ fontSize: 28 }}>✓</Text>}
              {isWrong && <Text style={{ fontSize: 28 }}>✗</Text>}
            </Pressable>
          );
        })}
      </View>

      <Confetti visible={confettiOn} count={35} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: SPACING.lg, gap: SPACING.lg },

  hud: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  timer: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg, borderWidth: 2,
  },
  timerVal: { ...TYPO.h1 },
  score: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: KIDS_THEME.yellowSoft,
    borderWidth: 2, borderColor: KIDS_THEME.star,
  },
  scoreVal: { ...TYPO.h1, color: KIDS_THEME.yellowDark },

  heroWrap: { alignItems: "center", flex: 1, justifyContent: "center", gap: SPACING.md },
  hero: {
    width: 240,
    height: 240,
    borderRadius: RADIUS.xl,
    borderWidth: 4,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heroImg: { width: "100%", height: "100%" },
  heroEmoji: {
    position: "absolute",
    bottom: 12, right: 12,
    width: 60, height: 60, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "#fff",
  },
  heroLabel: { ...TYPO.caption, color: KIDS_THEME.smoke },

  cards: { flexDirection: "row", gap: SPACING.md },
  card: {
    flex: 1,
    paddingVertical: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    gap: 6,
  },
  cardText: { ...TYPO.h1 },

  // Done
  doneBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.xl, gap: SPACING.md },
  doneTitle: { ...TYPO.hero, color: KIDS_THEME.ink, marginTop: SPACING.md },
  doneSub: { ...TYPO.h2, color: KIDS_THEME.smoke },
  doneStars: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.md },
  doneStar: { fontSize: 56 },
  doneCta: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.xl,
  },
  doneCtaText: { ...TYPO.h2, color: "#fff" },
});
