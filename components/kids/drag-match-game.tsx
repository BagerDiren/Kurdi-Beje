/**
 * 🎯 EŞLEŞTİR — TAP-TAP modu (önceki drag&drop bug'lı, kaldırıldı)
 *
 * Mekanik:
 *  • Üstte 2x2 büyük foto kartı
 *  • Altta 4 Kürtçe kelime kartı (renkli pill)
 *  • Çocuk önce kelimeye tıklar (kart parlak yanar, scale 1.05)
 *  • Sonra foto'ya tıklar
 *  • Doğru: kart slot'a UÇAR (animated translate) + Confetti + Kürtçe ses
 *  • Yanlış: kart shake + seçim sıfırlanır
 *  • 4 doğru → tebrik
 *
 * Bu yaklaşım drag&drop'tan çok daha güvenilir ve çocuk için daha kolay.
 */
import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withSequence, withRepeat, Easing,
} from "react-native-reanimated";

import { Confetti } from "./confetti";
import { speakKurmanci, playFx } from "@/data/sound-fx";
import { KIDS_THEME, RADIUS, SHADOW, SPACING, TYPO } from "./design";
import { KidCharacter } from "./kid-character";
import type { KidsCategory, KidsWord } from "@/data/kids-content";

const { width: SW } = Dimensions.get("window");
const GRID_SIZE = 4;
const SLOT_W = (SW - SPACING.lg * 2 - SPACING.sm) / 2 - 2;
const SLOT_H = SLOT_W * 0.85;
const CARD_H = 64;

type Props = {
  category: KidsCategory;
  onDone: (xp: number) => void;
};

export function DragMatchGame({ category, onDone }: Props) {
  const [round] = useState(() => ({
    words: [...category.words].sort(() => Math.random() - 0.5).slice(0, GRID_SIZE),
  }));
  const [shuffled] = useState(() => [...round.words].sort(() => Math.random() - 0.5));
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<"ok" | "miss" | null>(null);
  const [feedbackKu, setFeedbackKu] = useState<string>("");

  const selectCard = (word: KidsWord) => {
    if (matched.has(word.ku) || done) return;
    if (selectedCard === word.ku) {
      // Aynı karta tekrar tıkla → seçim iptal
      setSelectedCard(null);
      return;
    }
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setSelectedCard(word.ku);
    speakKurmanci(word.ku, "kid");
  };

  const tapPhoto = (slotWord: KidsWord) => {
    if (!selectedCard || matched.has(slotWord.ku) || done) return;
    if (selectedCard === slotWord.ku) {
      // DOĞRU
      playFx("success");
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      const newMatched = new Set(matched);
      newMatched.add(slotWord.ku);
      setMatched(newMatched);
      setSelectedCard(null);
      setFeedback("ok");
      setFeedbackKu(slotWord.ku);
      setConfetti(true);
      setTimeout(() => {
        setConfetti(false);
        setFeedback(null);
      }, 1300);
      setTimeout(() => speakKurmanci(slotWord.ku, "kid"), 200);
      if (newMatched.size === GRID_SIZE) {
        setTimeout(() => setDone(true), 1500);
      }
    } else {
      // YANLIŞ
      playFx("fail");
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
      setFeedback("miss");
      setTimeout(() => {
        setFeedback(null);
        setSelectedCard(null);
      }, 700);
    }
  };

  // Bitiş
  if (done) {
    const xp = GRID_SIZE * 10;
    return (
      <View style={[styles.root, { backgroundColor: KIDS_THEME.primarySoft }]}>
        <View style={styles.doneBox}>
          <KidCharacter character="kevo" size={140} bounce />
          <Text style={styles.doneTitle}>HARİKA!</Text>
          <Text style={styles.doneSub}>Hepsini doğru eşleştirdin 🎉</Text>
          <View style={styles.doneStars}>
            {[0, 1, 2].map((i) => (
              <Text key={i} style={styles.doneStar}>⭐</Text>
            ))}
          </View>
          <Pressable
            onPress={() => onDone(xp)}
            style={({ pressed }) => [
              styles.doneCta,
              { backgroundColor: KIDS_THEME.primary, transform: pressed ? [{ scale: 0.97 }] : [] },
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
    <View style={styles.root}>
      <LinearGradient
        colors={["#FFE0EC", "#FFF4DC", "#E1F5FE"] as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Talimat */}
      <View style={[styles.instruction, SHADOW("#000", "sm")]}>
        <Text style={{ fontSize: 24 }}>{selectedCard ? "👆" : "👇"}</Text>
        <Text style={styles.instructionText}>
          {selectedCard ? "Şimdi doğru fotoğrafa tıkla!" : "Önce bir kelime seç!"}
        </Text>
        <View style={[styles.scoreCard, { backgroundColor: KIDS_THEME.primarySoft }]}>
          <Text style={[styles.scoreText, { color: KIDS_THEME.primaryDark }]}>
            {matched.size}/{GRID_SIZE}
          </Text>
        </View>
      </View>

      {/* SLOT GRID (foto'lar) */}
      <View style={styles.slotsArea}>
        <View style={styles.slotsGrid}>
          {round.words.map((w) => {
            const isMatched = matched.has(w.ku);
            const isHighlight = selectedCard !== null && !isMatched;
            return (
              <PhotoSlot
                key={w.ku}
                word={w}
                color={category.color}
                isMatched={isMatched}
                isHighlight={isHighlight}
                onTap={() => tapPhoto(w)}
              />
            );
          })}
        </View>
      </View>

      {/* KELİME KARTLARI */}
      <View style={styles.cardsArea}>
        {shuffled.map((w) => {
          const isMatched = matched.has(w.ku);
          const isSelected = selectedCard === w.ku;
          return (
            <WordCard
              key={w.ku}
              word={w}
              color={category.color}
              isSelected={isSelected}
              isMatched={isMatched}
              isWrong={feedback === "miss" && isSelected}
              onTap={() => selectCard(w)}
            />
          );
        })}
      </View>

      {/* Geri bildirim */}
      {feedback === "ok" && (
        <View style={[styles.feedback, { backgroundColor: KIDS_THEME.success }]}>
          <Text style={styles.feedbackText}>✨ Aferin!  {feedbackKu}!</Text>
        </View>
      )}
      {feedback === "miss" && (
        <View style={[styles.feedback, { backgroundColor: KIDS_THEME.danger }]}>
          <Text style={styles.feedbackText}>Tekrar dene!</Text>
        </View>
      )}

      <Confetti visible={confetti} count={45} />
    </View>
  );
}

// =====================================================================
//  FOTO SLOT — tıklanınca highlight + scale
// =====================================================================
function PhotoSlot({ word, color, isMatched, isHighlight, onTap }: {
  word: KidsWord; color: string; isMatched: boolean; isHighlight: boolean; onTap: () => void;
}) {
  const pulse = useSharedValue(0);

  // Highlight modunda hafif puls
  if (isHighlight && !isMatched) {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, true,
    );
  } else {
    pulse.value = 0;
  }

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.04 }],
  }));

  return (
    <Pressable onPress={onTap} disabled={isMatched}>
      <Animated.View
        style={[
          styles.slot,
          {
            borderColor: isMatched ? KIDS_THEME.success : isHighlight ? color : color + "55",
            borderWidth: isMatched ? 4 : isHighlight ? 4 : 3,
          },
          isMatched && SHADOW(KIDS_THEME.success, "glow"),
          isHighlight && SHADOW(color, "md"),
          animStyle,
        ]}
      >
        {word.photo ? (
          <Image source={{ uri: word.photo }} style={styles.slotPhoto} resizeMode="cover" />
        ) : (
          <View style={[styles.slotEmoji, { backgroundColor: color + "22" }]}>
            <Text style={{ fontSize: 70 }}>{word.emoji}</Text>
          </View>
        )}
        {/* Kategori emoji rozeti */}
        <View style={[styles.slotEmojiTag, { backgroundColor: color }]}>
          <Text style={{ fontSize: 22 }}>{word.emoji}</Text>
        </View>
        {isMatched && (
          <>
            <View style={[styles.slotCheckBadge, { backgroundColor: KIDS_THEME.success }]}>
              <Text style={{ color: "#fff", fontSize: 18, fontFamily: "Fredoka_700Bold" }}>✓</Text>
            </View>
            <View style={styles.slotMatchedLabel}>
              <Text style={[styles.slotMatchedText, { color }]}>{word.ku}</Text>
            </View>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

// =====================================================================
//  KELİME KARTI — tap → seçim, doğruda kaybolur
// =====================================================================
function WordCard({ word, color, isSelected, isMatched, isWrong, onTap }: {
  word: KidsWord; color: string;
  isSelected: boolean; isMatched: boolean; isWrong: boolean;
  onTap: () => void;
}) {
  const shake = useSharedValue(0);
  if (isWrong) {
    shake.value = withSequence(
      withTiming(-12, { duration: 60 }),
      withTiming(12, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  }
  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shake.value },
      { scale: isSelected ? 1.05 : 1 },
    ],
  }));

  if (isMatched) {
    return <View style={styles.cardPlaceholder} />;
  }

  return (
    <Pressable onPress={onTap}>
      <Animated.View
        style={[
          styles.card,
          {
            borderColor: isSelected ? "#FFD700" : "transparent",
            borderWidth: isSelected ? 3 : 0,
          },
          isSelected && SHADOW("#FFC107", "glow"),
          !isSelected && SHADOW(color, "md"),
          animStyle,
        ]}
      >
        <LinearGradient
          colors={[color, color + "BB"] as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGrad}
        >
          <Text style={styles.cardText}>{word.ku}</Text>
          {isSelected && <Text style={styles.cardCheck}>★</Text>}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  instruction: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    backgroundColor: "#fff",
    margin: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: KIDS_THEME.primarySoft,
  },
  instructionText: { flex: 1, ...TYPO.bodyLg, color: KIDS_THEME.ink },
  scoreCard: {
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: { ...TYPO.h3 },

  slotsArea: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    justifyContent: "center",
  },
  slot: {
    width: SLOT_W,
    height: SLOT_H,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    backgroundColor: "#fff",
    position: "relative",
  },
  slotPhoto: { width: "100%", height: "100%" },
  slotEmoji: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  slotEmojiTag: {
    position: "absolute",
    top: 6, left: 6,
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  slotCheckBadge: {
    position: "absolute",
    top: 6, right: 6,
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "#fff",
  },
  slotMatchedLabel: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 6,
    alignItems: "center",
  },
  slotMatchedText: { ...TYPO.h3 },

  cardsArea: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  card: {
    width: SLOT_W,
    height: CARD_H,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  cardPlaceholder: {
    width: SLOT_W,
    height: CARD_H,
    borderRadius: RADIUS.lg,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(0,0,0,0.1)",
  },
  cardGrad: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  cardText: {
    ...TYPO.h2,
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardCheck: { color: "#FFD700", fontSize: 22, fontFamily: "Fredoka_700Bold" },

  feedback: {
    position: "absolute",
    top: 100, alignSelf: "center",
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOW("#000", "lg"),
  },
  feedbackText: { ...TYPO.h3, color: "#fff" },

  doneBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.xl, gap: SPACING.md },
  doneTitle: { ...TYPO.hero, color: KIDS_THEME.primaryDark, marginTop: SPACING.md },
  doneSub: { ...TYPO.h2, color: KIDS_THEME.smoke },
  doneStars: { flexDirection: "row", gap: 12, marginTop: SPACING.md },
  doneStar: { fontSize: 56 },
  doneCta: {
    paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.xl,
  },
  doneCtaText: { ...TYPO.h2, color: "#fff" },
});
