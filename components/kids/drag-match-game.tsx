/**
 * 🎯 SÜRÜKLE & EŞLEŞTİR — TRT Çocuk seviyesi animasyonlu oyun.
 *
 * Stable v2:
 *  • react-native-gesture-handler Pan ile drag
 *  • Reanimated sharedValue + spring (kart başlangıç yerine geri döner)
 *  • 2x2 hedef grid + 4 sürüklenebilir kart
 *  • measureInWindow ile gerçek slot konumu
 */
import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withSequence, runOnJS,
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
const CARD_H = 60;

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
  const [confetti, setConfetti] = useState(false);
  const [done, setDone] = useState(false);

  // Slot pozisyonlarını tutar (window-relative)
  const slotRefs = useRef<View[]>(new Array(GRID_SIZE));
  const slotBoxes = useRef<{ x: number; y: number; w: number; h: number }[]>(
    new Array(GRID_SIZE).fill({ x: 0, y: 0, w: 0, h: 0 }),
  );

  // Kart pozisyonlarını tutar (window-relative — drop hesabı için)
  const cardRefs = useRef<View[]>(new Array(GRID_SIZE));
  const cardBoxes = useRef<{ x: number; y: number; w: number; h: number }[]>(
    new Array(GRID_SIZE).fill({ x: 0, y: 0, w: 0, h: 0 }),
  );

  const measureSlot = (idx: number) => {
    const ref = slotRefs.current[idx];
    if (ref?.measureInWindow) {
      ref.measureInWindow((x, y, w, h) => {
        slotBoxes.current[idx] = { x, y, w, h };
      });
    }
  };

  const measureCard = (idx: number) => {
    const ref = cardRefs.current[idx];
    if (ref?.measureInWindow) {
      ref.measureInWindow((x, y, w, h) => {
        cardBoxes.current[idx] = { x, y, w, h };
      });
    }
  };

  const handleMatch = (cardWord: KidsWord, cardIdx: number, dropX: number, dropY: number) => {
    // Hangi slota düştü
    let targetSlotIdx = -1;
    for (let i = 0; i < GRID_SIZE; i++) {
      const s = slotBoxes.current[i];
      if (!s || s.w === 0) continue;
      if (dropX >= s.x && dropX <= s.x + s.w && dropY >= s.y && dropY <= s.y + s.h) {
        targetSlotIdx = i;
        break;
      }
    }
    if (targetSlotIdx === -1) return false;

    const targetWord = round.words[targetSlotIdx];
    if (cardWord.ku === targetWord.ku) {
      // DOĞRU
      playFx("success");
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      setMatched((prev) => {
        const next = new Set(prev);
        next.add(cardWord.ku);
        if (next.size === GRID_SIZE) {
          setTimeout(() => setDone(true), 1200);
        }
        return next;
      });
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1300);
      setTimeout(() => speakKurmanci(cardWord.ku, "kid"), 200);
      return true;
    } else {
      playFx("fail");
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
      return false;
    }
  };

  // Bitiş ekranı
  if (done) {
    const xp = GRID_SIZE * 8;
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
          <View style={styles.donePreview}>
            {round.words.map((w, i) => (
              <View key={i} style={styles.donePreviewCard}>
                {w.photo ? (
                  <Image source={{ uri: w.photo }} style={styles.donePreviewImg} resizeMode="cover" />
                ) : (
                  <Text style={{ fontSize: 32 }}>{w.emoji}</Text>
                )}
              </View>
            ))}
          </View>
          <View
            style={[styles.doneCta, { backgroundColor: KIDS_THEME.primary, ...SHADOW(KIDS_THEME.primary, "lg") }]}
            onTouchEnd={() => onDone(xp)}
          >
            <Text style={styles.doneCtaText}>+{xp} XP topla 🚀</Text>
          </View>
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
        <Text style={{ fontSize: 24 }}>👆</Text>
        <Text style={styles.instructionText}>Doğru kelimeyi resme sürükle</Text>
        <View style={[styles.scoreCard, { backgroundColor: KIDS_THEME.primarySoft }]}>
          <Text style={[styles.scoreText, { color: KIDS_THEME.primaryDark }]}>
            {matched.size}/{GRID_SIZE}
          </Text>
        </View>
      </View>

      {/* SLOT GRID */}
      <View style={styles.slotsArea}>
        <View style={styles.slotsGrid}>
          {round.words.map((w, i) => {
            const isMatched = matched.has(w.ku);
            return (
              <View
                key={w.ku}
                ref={(r) => { if (r) slotRefs.current[i] = r as any; }}
                onLayout={() => measureSlot(i)}
                style={[
                  styles.slot,
                  { borderColor: isMatched ? KIDS_THEME.success : category.color },
                  isMatched && SHADOW(KIDS_THEME.success, "glow"),
                ]}
              >
                {w.photo ? (
                  <Image source={{ uri: w.photo }} style={styles.slotPhoto} resizeMode="cover" />
                ) : (
                  <View style={[styles.slotEmoji, { backgroundColor: category.color + "22" }]}>
                    <Text style={{ fontSize: 64 }}>{w.emoji}</Text>
                  </View>
                )}
                {isMatched && (
                  <>
                    <View style={[styles.slotCheckBadge, { backgroundColor: KIDS_THEME.success }]}>
                      <Text style={{ color: "#fff", fontSize: 18, fontFamily: "Fredoka_700Bold" }}>✓</Text>
                    </View>
                    <View style={styles.slotMatchedLabel}>
                      <Text style={[styles.slotMatchedText, { color: category.color }]}>{w.ku}</Text>
                    </View>
                  </>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* SÜRÜKLENEBİLİR KARTLAR */}
      <View style={styles.cardsArea}>
        {shuffled.map((w, i) => (
          <View
            key={w.ku}
            ref={(r) => { if (r) cardRefs.current[i] = r as any; }}
            onLayout={() => measureCard(i)}
            style={styles.cardWrap}
          >
            {!matched.has(w.ku) ? (
              <DraggableCard
                word={w}
                color={category.color}
                cardBox={cardBoxes.current[i]}
                onMatch={(dropX, dropY) => handleMatch(w, i, dropX, dropY)}
              />
            ) : (
              <View style={styles.cardPlaceholder} />
            )}
          </View>
        ))}
      </View>

      <Confetti visible={confetti} count={45} />
    </View>
  );
}

// =====================================================================
//  SÜRÜKLENEBİLİR KART
// =====================================================================
function DraggableCard({
  word, color, cardBox, onMatch,
}: {
  word: KidsWord;
  color: string;
  cardBox: { x: number; y: number; w: number; h: number };
  onMatch: (dropX: number, dropY: number) => boolean;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);

  const reset = () => {
    tx.value = withSpring(0, { damping: 12 });
    ty.value = withSpring(0, { damping: 12 });
    scale.value = withSpring(1, { damping: 10 });
  };

  const tryMatch = (translateX: number, translateY: number): boolean => {
    // Kartın merkez konumu (window-relative)
    const dropX = cardBox.x + cardBox.w / 2 + translateX;
    const dropY = cardBox.y + cardBox.h / 2 + translateY;
    return onMatch(dropX, dropY);
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.15, { damping: 8 });
    })
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY;
    })
    .onEnd((e) => {
      const matched = runOnJS(tryMatch)(e.translationX, e.translationY);
      // matched değeri dönüş runOnJS'den, ama bu side-effect; biz reset yaparız.
      // Eğer eşleşme olduysa setMatched zaten state günceller, kart zaten kaybolur.
      // Yoksa shake + reset:
      tx.value = withSequence(
        withTiming(15, { duration: 70 }),
        withTiming(-15, { duration: 70 }),
        withTiming(0, { duration: 70 }),
        withSpring(0, { damping: 12 }),
      );
      ty.value = withSpring(0, { damping: 12 });
      scale.value = withSpring(1, { damping: 10 });
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animStyle, SHADOW(color, "md")]}>
        <LinearGradient
          colors={[color, color + "BB"] as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGrad}
        >
          <Text style={styles.cardText}>{word.ku}</Text>
        </LinearGradient>
      </Animated.View>
    </GestureDetector>
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
    borderWidth: 4,
    backgroundColor: "#fff",
    position: "relative",
  },
  slotPhoto: { width: "100%", height: "100%" },
  slotEmoji: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  slotCheckBadge: {
    position: "absolute",
    top: 8, right: 8,
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
  cardWrap: {
    width: SLOT_W,
    height: CARD_H,
  },
  card: {
    width: "100%",
    height: CARD_H,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  cardPlaceholder: {
    width: "100%",
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
  },
  cardText: {
    ...TYPO.h2,
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  doneBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.xl, gap: SPACING.md },
  doneTitle: { ...TYPO.hero, color: KIDS_THEME.primaryDark, marginTop: SPACING.md },
  doneSub: { ...TYPO.h2, color: KIDS_THEME.smoke },
  doneStars: { flexDirection: "row", gap: 12, marginTop: SPACING.md },
  doneStar: { fontSize: 56 },
  donePreview: {
    flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center",
    marginTop: SPACING.md,
  },
  donePreviewCard: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 2, borderColor: KIDS_THEME.success,
    overflow: "hidden",
    alignItems: "center", justifyContent: "center",
  },
  donePreviewImg: { width: "100%", height: "100%" },
  doneCta: {
    paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.xl,
  },
  doneCtaText: { ...TYPO.h2, color: "#fff" },
});
