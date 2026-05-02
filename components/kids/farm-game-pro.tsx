/**
 * 🐮 KEVO'NUN ÇİFTLİĞİ — Hay Day / Farmville tarzı
 *
 * Mekanik:
 *  • 12 slot çiftlik gridi (3x4)
 *  • Soruyu doğru cevapla → hayvan açılır + slota yerleşir
 *  • Hayvanlar idle animasyon (zıplar, sallanır)
 *  • Tıklayınca → Kürtçe adı sesli okunur + ses balonu
 *  • Skor: kaç hayvan açıldı + bonus XP
 *  • Mahsul: doğru cevapta yıldız puanı düşer çiftliğe
 *
 * Bu oyun gerçekten "uzun süreli" eğlenceli — çocuk her doğru cevapta
 * yeni hayvan açıyor, görsel ödül + işitsel feedback alıyor.
 */
import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, withSpring, withDelay, Easing,
} from "react-native-reanimated";

import { Confetti } from "./confetti";
import { speakKurmanci, playFx } from "@/data/sound-fx";
import { KIDS_THEME, RADIUS, SHADOW, SPACING, TYPO } from "./design";
import { KidCharacter } from "./kid-character";
import type { KidsCategory, KidsWord } from "@/data/kids-content";

const { width: SW } = Dimensions.get("window");
const SLOT_SIZE = (SW - SPACING.lg * 2 - SPACING.sm * 2) / 3;

type FarmSlot = {
  word: KidsWord | null;  // dolu mu boş mu
  unlockedAt?: number;     // sıralı animasyon için
};

type Phase = "playing" | "question" | "celebration" | "done";

type Props = {
  category: KidsCategory;
  onDone: (xp: number) => void;
};

export function FarmGamePro({ category, onDone }: Props) {
  const [slots, setSlots] = useState<FarmSlot[]>(Array.from({ length: 12 }).map(() => ({ word: null })));
  const [unlocked, setUnlocked] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [target, setTarget] = useState<KidsWord | null>(null);
  const [options, setOptions] = useState<KidsWord[]>([]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [tappedSlot, setTappedSlot] = useState<number | null>(null);

  const TOTAL = Math.min(12, category.words.length);

  const newQuestion = () => {
    if (unlocked >= TOTAL) {
      setPhase("done");
      return;
    }
    // Henüz açılmamış kelimeler
    const usedKus = new Set(slots.filter((s) => s.word).map((s) => s.word!.ku));
    const available = category.words.filter((w) => !usedKus.has(w.ku));
    if (available.length === 0) {
      setPhase("done");
      return;
    }
    const tgt = available[Math.floor(Math.random() * available.length)];
    // Distractors: tüm kelime havuzundan
    const distractors = category.words
      .filter((w) => w.ku !== tgt.ku)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    const all = [tgt, ...distractors];
    const correct = Math.floor(Math.random() * 3);
    const opts = [...all];
    [opts[0], opts[correct]] = [opts[correct], opts[0]];

    setTarget(tgt);
    setOptions(opts);
    setCorrectIdx(correct);
    setPicked(null);
    setPhase("question");

    // Hedefi sesli oku
    setTimeout(() => speakKurmanci(tgt.ku, "kid"), 300);
  };

  useEffect(() => {
    newQuestion();
  }, []);

  const onPick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === correctIdx && target) {
      playFx("success");
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1300);
      // Bir sonraki boş slota hayvanı yerleştir
      setSlots((prev) => {
        const idx = prev.findIndex((s) => !s.word);
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { word: target, unlockedAt: Date.now() };
        return copy;
      });
      setUnlocked((u) => u + 1);
      setPhase("celebration");
      setTimeout(() => newQuestion(), 1700);
    } else {
      playFx("fail");
      setTimeout(() => setPicked(null), 800);
    }
  };

  const tapAnimal = (idx: number) => {
    const slot = slots[idx];
    if (!slot.word) return;
    setTappedSlot(idx);
    speakKurmanci(slot.word.ku, "kid");
    setTimeout(() => setTappedSlot(null), 1400);
  };

  // === Bitti ekranı ===
  if (phase === "done") {
    const xp = unlocked * 5;
    return (
      <View style={[styles.root, { backgroundColor: "#A4D65E" }]}>
        <View style={styles.doneBox}>
          <Text style={{ fontSize: 90, marginBottom: 8 }}>🌾</Text>
          <Text style={styles.doneTitle}>Çiftlik Tamamlandı!</Text>
          <Text style={styles.doneSub}>{unlocked} hayvan/bitki kazandın</Text>
          <View style={styles.donePreview}>
            {slots.filter((s) => s.word).slice(0, 8).map((s, i) => (
              <Text key={i} style={{ fontSize: 28 }}>{s.word!.emoji}</Text>
            ))}
          </View>
          <Pressable
            onPress={() => onDone(xp)}
            style={({ pressed }) => [
              styles.doneCta,
              SHADOW(KIDS_THEME.greenDark, "lg"),
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            <Text style={styles.doneCtaText}>+{xp} XP topla 🚀</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Çiftlik gökyüzü gradient */}
      <LinearGradient
        colors={["#87CEEB", "#A6D9F2", "#C9E9F8"] as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Üst HUD */}
      <View style={styles.hud}>
        <View style={styles.hudCard}>
          <Text style={{ fontSize: 22 }}>🐮</Text>
          <Text style={styles.hudVal}>{unlocked}/{TOTAL}</Text>
          <Text style={styles.hudLbl}>Hayvan</Text>
        </View>
        <KidCharacter character="kevo" size={56} bounce />
        <View style={styles.hudCard}>
          <Text style={{ fontSize: 22 }}>⭐</Text>
          <Text style={styles.hudVal}>{unlocked * 5}</Text>
          <Text style={styles.hudLbl}>XP</Text>
        </View>
      </View>

      {/* Çiftlik ekranı (bulutlar) */}
      <Cloud x={20} delay={0} />
      <Cloud x={SW - 80} delay={3000} />

      {/* 3x4 SLOT GRİD (çiftlik) */}
      <View style={styles.farmArea}>
        {/* Ahşap çit kenarlık */}
        <View style={styles.fenceBg}>
          <LinearGradient
            colors={["#A4D65E", "#7CB342", "#558B2F"] as unknown as readonly [string, string, ...string[]]}
            style={StyleSheet.absoluteFillObject}
          />
        </View>

        <View style={styles.grid}>
          {slots.map((slot, i) => (
            <FarmSlotView
              key={i}
              slot={slot}
              size={SLOT_SIZE}
              tapped={tappedSlot === i}
              onTap={() => tapAnimal(i)}
            />
          ))}
        </View>
      </View>

      {/* Soru kartı */}
      {phase === "question" && target && (
        <View style={styles.questionWrap}>
          <View style={[styles.questionCard, SHADOW("#000", "lg")]}>
            <Pressable
              onPress={() => speakKurmanci(target.ku, "kid")}
              style={[styles.qSpeaker, { backgroundColor: category.color }]}
            >
              <Text style={{ fontSize: 28 }}>🔊</Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.qLabel}>BU NEYİN ADI?</Text>
              <Text style={[styles.qWord, { color: category.color }]}>{target.ku}</Text>
              <Text style={styles.qHint}>Hangisi bu? 🤔</Text>
            </View>
          </View>

          {/* 3 seçenek (foto/emoji) */}
          <View style={styles.options}>
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
                    styles.option,
                    SHADOW(category.color, "md"),
                    {
                      backgroundColor: isCorrect ? KIDS_THEME.success : isWrong ? KIDS_THEME.danger : "#fff",
                      borderColor: isCorrect ? KIDS_THEME.success : isWrong ? KIDS_THEME.danger : category.color,
                      opacity: dimmed ? 0.4 : pressed ? 0.92 : 1,
                      transform: pressed ? [{ scale: 0.96 }] : [],
                    },
                  ]}
                >
                  {opt.photo ? (
                    <Image source={{ uri: opt.photo }} style={styles.optPhoto} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: 50 }}>{opt.emoji}</Text>
                  )}
                  {isCorrect && <Text style={styles.optMark}>✓</Text>}
                  {isWrong && <Text style={styles.optMark}>✗</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Kutlama overlay */}
      {phase === "celebration" && target && (
        <View style={styles.celebration}>
          <View style={[styles.celebCard, SHADOW(KIDS_THEME.success, "glow")]}>
            <Text style={styles.celebEmoji}>🎉</Text>
            <Text style={styles.celebTitle}>Yeni hayvan!</Text>
            <View style={styles.celebRow}>
              <Text style={{ fontSize: 64 }}>{target.emoji}</Text>
              <View>
                <Text style={[styles.celebWord, { color: category.color }]}>{target.ku}</Text>
                <Text style={styles.celebTr}>{target.tr}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <Confetti visible={confetti} count={40} />
    </View>
  );
}

// =====================================================================
//  TEK SLOT (boş çit / dolu hayvan)
// =====================================================================
function FarmSlotView({ slot, size, tapped, onTap }: {
  slot: FarmSlot; size: number; tapped: boolean; onTap: () => void;
}) {
  const bounce = useSharedValue(0);
  const scaleIn = useSharedValue(slot.word ? 1 : 0);

  useEffect(() => {
    if (slot.word) {
      // Yeni eklenen → büyüyerek belirir
      scaleIn.value = withSpring(1, { damping: 8 });
      // Sürekli yumuşak zıplama
      bounce.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 1000 + Math.random() * 500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1000 + Math.random() * 500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, false,
      );
    }
  }, [slot.word]);

  const animalStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounce.value },
      { scale: tapped ? 1.15 : scaleIn.value },
    ],
  }));

  const isEmpty = !slot.word;

  return (
    <Pressable onPress={onTap} disabled={isEmpty} style={[styles.slot, { width: size, height: size }]}>
      {/* Toprak / boş slot arka planı */}
      <View style={[styles.slotBg, {
        backgroundColor: isEmpty ? "#8B6F47" + "44" : "#A4D65E",
        borderColor: isEmpty ? "#5D4037" + "33" : "#558B2F",
      }]}>
        {isEmpty && (
          <Text style={{ fontSize: 28, opacity: 0.4 }}>🌱</Text>
        )}
        {slot.word && (
          <Animated.View style={animalStyle}>
            <Text style={{ fontSize: size * 0.5 }}>{slot.word.emoji}</Text>
          </Animated.View>
        )}
      </View>
      {/* Tap edildiğinde söyleme balonu */}
      {tapped && slot.word && (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{slot.word.ku}</Text>
        </View>
      )}
    </Pressable>
  );
}

// Bulut (sürüklenen)
function Cloud({ x, delay }: { x: number; delay: number }) {
  const xPos = useSharedValue(SW + 60);
  useEffect(() => {
    xPos.value = withDelay(
      delay,
      withRepeat(
        withTiming(-100, { duration: 18000, easing: Easing.linear }),
        -1, false,
      ),
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: xPos.value }] }));
  return (
    <Animated.View style={[{ position: "absolute", top: 100 + (delay % 60), left: 0 }, style]}>
      <Text style={{ fontSize: 40, opacity: 0.7 }}>☁️</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  hud: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.lg,
  },
  hudCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    minWidth: 80,
    ...SHADOW("#000", "sm"),
  },
  hudVal: { ...TYPO.h2, color: KIDS_THEME.ink },
  hudLbl: { ...TYPO.caption, color: KIDS_THEME.smoke },

  farmArea: {
    margin: SPACING.lg,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    padding: SPACING.md,
    minHeight: SLOT_SIZE * 4 + SPACING.sm * 3 + SPACING.md * 2,
  },
  fenceBg: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS.xl },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    justifyContent: "center",
  },
  slot: { alignItems: "center", justifyContent: "center", position: "relative" },
  slotBg: {
    width: "100%", height: "100%",
    borderRadius: RADIUS.md,
    borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  bubble: {
    position: "absolute",
    top: -28,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: KIDS_THEME.primary,
    ...SHADOW(KIDS_THEME.primary, "md"),
  },
  bubbleText: { ...TYPO.body, color: KIDS_THEME.primary },

  questionWrap: { padding: SPACING.lg, gap: SPACING.md },
  questionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: "#fff",
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: "#fff",
  },
  qSpeaker: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: "center", justifyContent: "center",
  },
  qLabel: { ...TYPO.micro, color: KIDS_THEME.smoke },
  qWord: { ...TYPO.h1, marginTop: 2 },
  qHint: { ...TYPO.body, color: KIDS_THEME.smoke, marginTop: 2 },

  options: { flexDirection: "row", gap: SPACING.sm },
  option: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: RADIUS.lg,
    borderWidth: 3,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  optPhoto: { width: "100%", height: "100%" },
  optMark: {
    position: "absolute",
    top: 8, right: 8,
    fontSize: 24,
    color: "#fff",
    fontFamily: "Fredoka_700Bold",
    backgroundColor: "rgba(0,0,0,0.4)",
    width: 32, height: 32, borderRadius: 16,
    textAlign: "center",
    lineHeight: 32,
  },

  celebration: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  celebCard: {
    backgroundColor: "#fff",
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    alignItems: "center",
    gap: SPACING.md,
    borderWidth: 4,
    borderColor: KIDS_THEME.success,
  },
  celebEmoji: { fontSize: 56 },
  celebTitle: { ...TYPO.display, color: KIDS_THEME.ink },
  celebRow: { flexDirection: "row", alignItems: "center", gap: SPACING.lg },
  celebWord: { ...TYPO.h1 },
  celebTr: { ...TYPO.body, color: KIDS_THEME.smoke, marginTop: 2 },

  // Bitti
  doneBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.xl, gap: SPACING.md },
  doneTitle: { ...TYPO.hero, color: "#fff", textAlign: "center" },
  doneSub: { ...TYPO.h2, color: "rgba(255,255,255,0.95)" },
  donePreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.lg,
  },
  doneCta: {
    backgroundColor: "#fff",
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.xl,
  },
  doneCtaText: { ...TYPO.h2, color: KIDS_THEME.greenDark },
});
