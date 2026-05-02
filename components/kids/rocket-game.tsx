import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";

// NASA telifsiz uzay fotoğrafı (Hubble galaxy)
const SPACE_BG = "https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=900";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withSequence, withRepeat, Easing,
} from "react-native-reanimated";

import { Confetti } from "./confetti";
import { playFx, speakKurmanci } from "@/data/sound-fx";
import type { KidsCategory, KidsWord } from "@/data/kids-content";

const { width: SW, height: SH } = Dimensions.get("window");

/**
 * 🚀 ROKET YOLCULUĞU — Doğru cevaplarla roket gezegenleri ziyaret eder.
 *
 * 5 raund. Her raundda hedef kelime sesli okunur, 3 kart (KU peyv) gösterilir.
 * Doğru kart → roket bir sonraki gezegene yükselir + alev animasyonu
 * Yanlış → roket sallanır (kalır)
 * 5 doğru sonunda Ay'a varır.
 *
 * Profesyonel öğeler:
 *   • Yıldızlı animasyonlu uzay arka planı (parıldayan yıldızlar)
 *   • Roket alev efekti (sürekli + boost momenti)
 *   • Gezegen progress bar'ı (5 ikon)
 *   • Ses + haptic feedback senkronize
 */

type Props = {
  category: KidsCategory;
  onDone: (xp: number) => void;
};

const PLANETS = ["🌍", "🔥", "🪐", "🌟", "🌙"];

export function RocketGame({ category, onDone }: Props) {
  const [round, setRound] = useState(0);     // 0..4
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState<KidsWord | null>(null);
  const [options, setOptions] = useState<KidsWord[]>([]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [confettiOn, setConfettiOn] = useState(false);
  const [done, setDone] = useState(false);

  // Roket animasyonu
  const rocketY = useSharedValue(0);
  const rocketShake = useSharedValue(0);
  const rocketScale = useSharedValue(1);
  const flameScale = useSharedValue(1);

  useEffect(() => {
    // Sürekli ateş titreşim animasyonu
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 200 }),
        withTiming(1, { duration: 200 }),
      ),
      -1, false,
    );
  }, []);

  // Round başlat
  useEffect(() => {
    if (round >= 5) {
      setDone(true);
      return;
    }
    const tgt = category.words[Math.floor(Math.random() * category.words.length)];
    const distractors = category.words
      .filter((w) => w.ku !== tgt.ku)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    const all = [tgt, ...distractors];
    const cIdx = Math.floor(Math.random() * 3);
    const opts = [...all];
    [opts[0], opts[cIdx]] = [opts[cIdx], opts[0]];

    setTarget(tgt);
    setOptions(opts);
    setCorrectIdx(cIdx);
    setPicked(null);

    // Hedefi sesli oku
    setTimeout(() => speakKurmanci(tgt.ku, "slow"), 350);
  }, [round]);

  const onPick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);

    if (i === correctIdx) {
      playFx("success");
      setScore((s) => s + 1);
      setConfettiOn(true);
      // Roket yukarı boost
      rocketY.value = withSequence(
        withSpring(rocketY.value - 50, { damping: 6 }),
        withTiming(rocketY.value - 50, { duration: 600 }),
      );
      rocketScale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withSpring(1, { damping: 5 }),
      );
      setTimeout(() => setConfettiOn(false), 1500);
      setTimeout(() => setRound((r) => r + 1), 1400);
    } else {
      playFx("fail");
      // Roket sallanır
      rocketShake.value = withSequence(
        withTiming(-12, { duration: 80 }),
        withTiming(12, { duration: 80 }),
        withTiming(-8, { duration: 80 }),
        withTiming(8, { duration: 80 }),
        withTiming(0, { duration: 80 }),
      );
      setTimeout(() => setPicked(null), 900);
    }
  };

  const rocketStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: rocketY.value },
      { translateX: rocketShake.value },
      { scale: rocketScale.value },
    ],
  }));
  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: flameScale.value }],
    opacity: 0.9,
  }));

  // === BİTTİ EKRANI ===
  if (done) {
    const stars = score === 5 ? 3 : score >= 3 ? 2 : score >= 1 ? 1 : 0;
    const xp = score * 8;
    return (
      <LinearGradient
        colors={["#0F0C29", "#302B63", "#24243E"] as unknown as readonly [string, string, ...string[]]}
        style={styles.root}
      >
        <View style={styles.doneBox}>
          <Text style={{ fontSize: 100 }}>🌙</Text>
          <Text style={styles.doneTitle}>Aya vardın!</Text>
          <Text style={styles.doneSub}>{score}/5 doğru</Text>
          <View style={styles.doneStars}>
            {[0, 1, 2].map((i) => (
              <Text key={i} style={[styles.doneStar, { opacity: i < stars ? 1 : 0.2 }]}>⭐</Text>
            ))}
          </View>
          <Pressable
            onPress={() => onDone(xp)}
            style={[styles.doneBtn, { backgroundColor: "#FFC72C" }]}
          >
            <Text style={styles.doneBtnText}>+{xp} XP topla 🚀</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.root}>
      {/* Sinematik uzay foto bg */}
      <Image source={{ uri: SPACE_BG }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <LinearGradient
        colors={["rgba(15,12,41,0.85)", "rgba(48,43,99,0.75)", "rgba(36,36,62,0.85)"] as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Yıldız parıltı katmanı */}
      <StarryBackground />

      {/* Üst bilgi */}
      <View style={styles.topInfo}>
        <Text style={styles.topLabel}>BU KELİMENİN KARTINI BUL</Text>
        <Pressable
          onPress={() => target && speakKurmanci(target.ku, "slow")}
          style={styles.topSpeaker}
        >
          <Text style={{ fontSize: 22 }}>🔊</Text>
          <Text style={styles.topWord}>{target?.ku ?? "—"}</Text>
        </Pressable>
        <Text style={styles.topHint}>
          {target?.tr ?? ""} {target?.emoji ?? ""}
        </Text>
      </View>

      {/* Gezegen progress bar */}
      <View style={styles.planets}>
        {PLANETS.map((p, i) => (
          <View key={i} style={styles.planetCol}>
            <Text
              style={[
                styles.planet,
                { opacity: i < score ? 1 : 0.3 },
              ]}
            >
              {p}
            </Text>
            {i === score && (
              <Animated.View style={styles.planetMarker}>
                <Text style={{ fontSize: 14, color: "#FFC72C" }}>▲</Text>
              </Animated.View>
            )}
          </View>
        ))}
      </View>

      {/* Roket */}
      <View style={styles.rocketContainer}>
        <Animated.View style={[styles.rocket, rocketStyle]}>
          <Text style={{ fontSize: 64 }}>🚀</Text>
          <Animated.View style={[styles.flame, flameStyle]}>
            <Text style={{ fontSize: 28 }}>🔥</Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Cevap kartları */}
      <View style={styles.cards}>
        {options.map((opt, i) => {
          const isCorrect = picked !== null && i === correctIdx;
          const isWrong = picked === i && i !== correctIdx;
          const isDimmed = picked !== null && i !== correctIdx && i !== picked;
          return (
            <Pressable
              key={opt.ku + i}
              onPress={() => onPick(i)}
              disabled={picked !== null}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: isCorrect ? "#27AE60" : isWrong ? "#E74C3C" : "rgba(255,255,255,0.95)",
                  borderColor: isCorrect ? "#FFC72C" : isWrong ? "#FFC72C" : "rgba(255,255,255,0.6)",
                  opacity: isDimmed ? 0.4 : pressed ? 0.85 : 1,
                  transform: pressed ? [{ scale: 0.96 }] : [],
                },
              ]}
            >
              <Text style={[
                styles.cardText,
                { color: isCorrect || isWrong ? "#fff" : "#1E1B4B" },
              ]}>
                {opt.ku}
              </Text>
              {isCorrect && <Text style={{ fontSize: 20 }}>✨</Text>}
              {isWrong && <Text style={{ fontSize: 20 }}>💥</Text>}
            </Pressable>
          );
        })}
      </View>

      <Confetti visible={confettiOn} count={50} />
    </View>
  );
}

// =====================================================================
//  PARILDAYAN YILDIZLI ARKA PLAN
// =====================================================================
function StarryBackground() {
  const stars = useRef(
    Array.from({ length: 30 }).map((_, i) => ({
      x: Math.random() * SW,
      y: Math.random() * SH * 0.7,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 2000,
    })),
  ).current;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((s, i) => (
        <Star key={i} {...s} />
      ))}
    </View>
  );
}

function Star({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  const op = useSharedValue(0.3);
  useEffect(() => {
    op.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 + delay % 800 }),
        withTiming(0.3, { duration: 800 + delay % 800 }),
      ),
      -1, true,
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: op.value }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#fff",
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topInfo: {
    margin: 16,
    padding: 16,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    gap: 4,
    borderWidth: 2,
    borderColor: "#FFC72C",
  },
  topLabel: { fontSize: 9, fontWeight: "900", color: "#5C4033", letterSpacing: 1.2 },
  topSpeaker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFC72C22",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 4,
  },
  topWord: { fontSize: 22, fontWeight: "900", color: "#1E1B4B" },
  topHint: { fontSize: 12, color: "#5C4033", fontWeight: "600", marginTop: 4 },

  planets: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 12,
  },
  planetCol: { alignItems: "center" },
  planet: { fontSize: 30 },
  planetMarker: { marginTop: -2 },

  rocketContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rocket: { alignItems: "center" },
  flame: { marginTop: -6 },

  cards: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
    gap: 4,
  },
  cardText: { fontSize: 18, fontWeight: "900" },

  // Done
  doneBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 14 },
  doneTitle: { fontSize: 32, fontWeight: "900", color: "#fff" },
  doneSub: { fontSize: 16, color: "rgba(255,255,255,0.85)", fontWeight: "700" },
  doneStars: { flexDirection: "row", gap: 14, marginTop: 14 },
  doneStar: { fontSize: 56 },
  doneBtn: {
    paddingHorizontal: 26,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 24,
    shadowColor: "#FFC72C",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 5,
  },
  doneBtnText: { fontSize: 16, fontWeight: "900", color: "#1E1B4B" },
});
