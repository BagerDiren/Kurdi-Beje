import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, withDelay, Easing, runOnJS,
} from "react-native-reanimated";

import { Confetti } from "./confetti";
import type { KidsWord, KidsCategory } from "@/data/kids-content";

const { width: SW, height: SH } = Dimensions.get("window");
const PLAY_HEIGHT = SH * 0.55;

type BalloonItem = {
  id: number;
  word: KidsWord;
  isTarget: boolean;
  startX: number;
  size: number;
  duration: number;
  delay: number;
};

type Props = {
  category: KidsCategory;
  onDone: (score: number) => void;
};

/**
 * 🎈 BALON PATLATMA — Söylenen kelimeyi taşıyan balona dokun!
 *
 * 5 raund. Her raundda hedef kelime söylenir, ekrana 4-6 balon çıkar
 * (1 doğru + 3-5 yanlış). Doğruya dokunmak: +1 skor + confetti.
 * Yanlış balona dokunmak: -0.5 skor (azaltılır).
 */
export function BalloonPopGame({ category, onDone }: Props) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState<KidsWord | null>(null);
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [feedback, setFeedback] = useState<"ok" | "miss" | null>(null);
  const [confettiOn, setConfettiOn] = useState(false);
  const [done, setDone] = useState(false);

  const TOTAL_ROUNDS = 5;

  // Yeni round başlat
  const startRound = (n: number) => {
    if (n > TOTAL_ROUNDS) {
      setDone(true);
      return;
    }
    const pool = category.words;
    const tgt = pool[Math.floor(Math.random() * pool.length)];
    setTarget(tgt);
    setFeedback(null);

    // 1 doğru + 3 distractor
    const distractors = pool.filter((w) => w.ku !== tgt.ku).sort(() => Math.random() - 0.5).slice(0, 3);
    const all = [tgt, ...distractors].sort(() => Math.random() - 0.5);

    const newBalloons: BalloonItem[] = all.map((w, i) => ({
      id: round * 10 + i,
      word: w,
      isTarget: w.ku === tgt.ku,
      startX: 5 + (i / 4) * 80 + (Math.random() - 0.5) * 12,
      size: 90 + Math.random() * 10,
      duration: 5500 + Math.random() * 1500,
      delay: i * 250 + Math.random() * 200,
    }));
    setBalloons(newBalloons);

    // Hedef kelimeyi söyle
    setTimeout(() => Speech.speak(tgt.ku, { language: "tr-TR", rate: 0.85, pitch: 1.1 }), 350);
  };

  useEffect(() => {
    startRound(round);
  }, [round]);

  // Doğru balon dokunulduğunda
  const onPop = (b: BalloonItem) => {
    if (feedback) return;
    if (b.isTarget) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      setScore((s) => s + 1);
      setFeedback("ok");
      setConfettiOn(true);
      setTimeout(() => setConfettiOn(false), 1500);
      setTimeout(() => setRound((r) => r + 1), 1200);
    } else {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
      setFeedback("miss");
      setTimeout(() => setFeedback(null), 600);
    }
  };

  if (done) {
    const stars = score === TOTAL_ROUNDS ? 3 : score >= 3 ? 2 : score >= 1 ? 1 : 0;
    return (
      <View style={[styles.root, { backgroundColor: category.bgGradient[1] }]}>
        <View style={styles.doneContent}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>Süper iş!</Text>
          <Text style={styles.doneScore}>{score}/{TOTAL_ROUNDS} balon</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 20 }}>
            {[0, 1, 2].map((i) => (
              <Text key={i} style={[styles.doneStar, { opacity: i < stars ? 1 : 0.25 }]}>⭐</Text>
            ))}
          </View>
          <Pressable
            onPress={() => onDone(score * 5)}
            style={[styles.doneCta, { backgroundColor: "#fff" }]}
          >
            <Text style={[styles.doneCtaText, { color: category.bgGradient[1] }]}>
              +{score * 5} XP topla!
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#87CEEB", "#A6D9F2", "#C9E9F8"] as unknown as readonly [string, string, ...string[]]}
      style={styles.root}
    >
      {/* Üst banner: hedef kelime */}
      <View style={[styles.targetBar, { borderColor: category.color }]}>
        <Pressable
          onPress={() => target && Speech.speak(target.ku, { language: "tr-TR", rate: 0.85, pitch: 1.1 })}
          style={[styles.speakerBtn, { backgroundColor: category.color }]}
        >
          <Text style={{ fontSize: 24 }}>🔊</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.targetLabel}>BU KELİMENİN BALONUNU PATLAT</Text>
          <Text style={[styles.targetWord, { color: category.color }]}>
            {target?.ku ?? "—"}
          </Text>
          <Text style={styles.targetHint}>{target?.tr ?? ""}</Text>
        </View>
        <View style={[styles.scoreBox, { backgroundColor: category.color + "22", borderColor: category.color }]}>
          <Text style={{ fontSize: 14, fontWeight: "900", color: category.color }}>
            {round}/{TOTAL_ROUNDS}
          </Text>
        </View>
      </View>

      {/* Oyun alanı */}
      <View style={styles.playArea}>
        {balloons.map((b) => (
          <FlyingBalloon key={b.id} item={b} onPop={onPop} disabled={!!feedback} />
        ))}
      </View>

      {/* Feedback */}
      {feedback === "ok" && (
        <View style={[styles.feedback, { backgroundColor: "#27AE60" }]}>
          <Text style={styles.feedbackText}>✨ Aferin!</Text>
        </View>
      )}
      {feedback === "miss" && (
        <View style={[styles.feedback, { backgroundColor: "#E74C3C" }]}>
          <Text style={styles.feedbackText}>Tekrar dene!</Text>
        </View>
      )}

      <Confetti visible={confettiOn} count={50} />
    </LinearGradient>
  );
}

// =====================================================================
//  TEK BALON
// =====================================================================
function FlyingBalloon({ item, onPop, disabled }: {
  item: BalloonItem;
  onPop: (b: BalloonItem) => void;
  disabled: boolean;
}) {
  const y = useSharedValue(PLAY_HEIGHT + 100);
  const wiggle = useSharedValue(0);
  const popped = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      item.delay,
      withTiming(-150, { duration: item.duration, easing: Easing.linear }),
    );
    wiggle.value = withDelay(
      item.delay,
      withRepeat(
        withTiming(20, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        -1, true,
      ),
    );
  }, []);

  const onTap = () => {
    if (disabled) return;
    popped.value = withSequence(
      withTiming(1.4, { duration: 100 }),
      withTiming(0, { duration: 200 }),
    );
    onPop(item);
  };

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value },
      { translateX: wiggle.value },
      { scale: popped.value === 0 ? 1 : popped.value },
    ],
    opacity: popped.value === 0 ? 1 : 1 - popped.value / 1.4,
  }));

  const colors = [
    "#FF6B9D", "#F39C12", "#1CB0F6", "#27AE60",
    "#E74C3C", "#8E44AD", "#FFC72C",
  ];
  const color = colors[item.id % colors.length];

  return (
    <Animated.View
      style={[
        styles.balloonOuter,
        {
          left: `${item.startX}%`,
          width: item.size,
          height: item.size * 1.2,
        },
        style,
      ]}
    >
      <Pressable onPress={onTap} disabled={disabled} hitSlop={8}>
        <View
          style={[
            styles.balloonBody,
            {
              width: item.size,
              height: item.size * 1.15,
              backgroundColor: color,
              shadowColor: color,
            },
          ]}
        >
          <Text
            style={{
              fontSize: item.size * 0.32,
              fontWeight: "900",
              color: "#fff",
              textAlign: "center",
            }}
            numberOfLines={2}
          >
            {item.word.ku}
          </Text>
          <Text style={{ fontSize: item.size * 0.28 }}>{item.word.emoji}</Text>
        </View>
        <View style={[styles.balloonString, { backgroundColor: color + "AA" }]} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  targetBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    margin: 14,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 22,
    borderWidth: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  speakerBtn: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  targetLabel: { fontSize: 9, fontWeight: "900", color: "#8B7355", letterSpacing: 1 },
  targetWord: { fontSize: 26, fontWeight: "900" },
  targetHint: { fontSize: 11, color: "#5C4033", fontWeight: "600" },
  scoreBox: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, borderWidth: 2,
  },

  playArea: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  balloonOuter: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
  },
  balloonBody: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  balloonString: {
    width: 1.5, height: 22,
    alignSelf: "center",
    marginTop: -1,
  },

  feedback: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  feedbackText: { color: "#fff", fontSize: 18, fontWeight: "900" },

  doneContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 14,
  },
  doneEmoji: { fontSize: 80 },
  doneTitle: { fontSize: 32, fontWeight: "900", color: "#fff", textShadowColor: "rgba(0,0,0,0.25)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  doneScore: { fontSize: 18, fontWeight: "800", color: "rgba(255,255,255,0.9)" },
  doneStar: { fontSize: 56 },
  doneCta: {
    paddingHorizontal: 28, paddingVertical: 16, borderRadius: 18, marginTop: 24,
    shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 8, elevation: 4,
  },
  doneCtaText: { fontSize: 16, fontWeight: "900" },
});
