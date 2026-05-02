/**
 * 🎯 SÜRÜKLE & EŞLEŞTİR — TRT Çocuk tarzı animasyonlu oyun.
 *
 * Mekanik:
 *  • Üstte 4 büyük foto kartı (boş slot)
 *  • Altta 4 Kürtçe kelime kartı
 *  • Çocuk kelime kartını foto üstüne SÜRÜKLER
 *  • Doğru: kart sıkışır animasyonla foto'nun altına yerleşir +
 *           "Aferin!" sesi + confetti + Kürtçe ad sesli okunur
 *  • Yanlış: kart başlangıç yerine kayar geri gelir + shake
 *  • 4 doğru tamamlanınca → tebrik + +XP
 *
 * Görsel: TRT Çocuk seviyesi:
 *  • Renkli pastel arka plan
 *  • Foto slot'ları büyük, gölge/glow efektli
 *  • Kelime kartları yumuşak gradient pill
 *  • Sürükleme sırasında kart 1.1x scale (havalandı hissi)
 *  • Doğru drop noktasında foto pulse glow yapar
 */
import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withSequence, withDelay, runOnJS, Easing,
} from "react-native-reanimated";

import { Confetti } from "./confetti";
import { speakKurmanci, playFx } from "@/data/sound-fx";
import { KIDS_THEME, RADIUS, SHADOW, SPACING, TYPO } from "./design";
import { KidCharacter } from "./kid-character";
import type { KidsCategory, KidsWord } from "@/data/kids-content";

const { width: SW, height: SH } = Dimensions.get("window");

type Props = {
  category: KidsCategory;
  onDone: (xp: number) => void;
};

const GRID_SIZE = 4; // 2x2 grid
const SLOT_W = (SW - SPACING.lg * 2 - SPACING.sm) / 2 - 2;
const SLOT_H = SLOT_W * 0.85;

export function DragMatchGame({ category, onDone }: Props) {
  // Round için 4 kelime seç
  const [round, setRound] = useState<{ words: KidsWord[]; matched: Set<string> }>(() => ({
    words: [...category.words].sort(() => Math.random() - 0.5).slice(0, GRID_SIZE),
    matched: new Set(),
  }));
  // Sürüklenebilir kartların shuffled order'i
  const [shuffledWords, setShuffledWords] = useState<KidsWord[]>(() =>
    [...round.words].sort(() => Math.random() - 0.5),
  );
  const [confetti, setConfetti] = useState(false);
  const [done, setDone] = useState(false);

  // Slot pozisyonları (üstte 2x2 grid)
  const slotPositions = useRef<{ x: number; y: number; w: number; h: number; word: KidsWord }[]>([]);

  const onSlotLayout = (idx: number, word: KidsWord) => (e: any) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    // pageY için absoluteX/Y hesabı zor — relative pozisyon kullan
    slotPositions.current[idx] = { x, y, w: width, h: height, word };
  };

  const matchAttempt = (cardWord: KidsWord, targetIdx: number) => {
    const target = round.words[targetIdx];
    if (cardWord.ku === target.ku) {
      // DOĞRU
      playFx("success");
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      const newMatched = new Set(round.matched);
      newMatched.add(cardWord.ku);
      setRound({ ...round, matched: newMatched });
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1300);
      // Kürtçe kelimeyi sesli oku
      setTimeout(() => speakKurmanci(cardWord.ku, "kid"), 200);
      // Hepsi doğru ise bitir
      if (newMatched.size === GRID_SIZE) {
        setTimeout(() => setDone(true), 1500);
      }
      return true;
    }
    playFx("fail");
    return false;
  };

  // Bitiş
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
        <Confetti visible={confetti} count={50} />
      </View>
    );
  }

  return (
    <View style={[styles.root]}>
      <LinearGradient
        colors={["#FFE0EC", "#FFF4DC", "#E1F5FE"] as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Talimat */}
      <View style={[styles.instruction, SHADOW("#000", "sm")]}>
        <Text style={{ fontSize: 22 }}>👆</Text>
        <Text style={styles.instructionText}>
          Doğru kelimeyi resme sürükle!
        </Text>
        <View style={[styles.scoreCard, { backgroundColor: KIDS_THEME.primarySoft }]}>
          <Text style={{ fontSize: 16 }}>✓</Text>
          <Text style={[styles.scoreText, { color: KIDS_THEME.primaryDark }]}>
            {round.matched.size}/{GRID_SIZE}
          </Text>
        </View>
      </View>

      {/* SLOT GRID (üstte 2x2 foto) */}
      <View style={styles.slotsArea}>
        <View style={styles.slotsGrid}>
          {round.words.map((w, i) => {
            const isMatched = round.matched.has(w.ku);
            return (
              <View
                key={w.ku}
                onLayout={onSlotLayout(i, w)}
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

      {/* SÜRÜKLENEBİLİR KARTLAR (alt) */}
      <View style={styles.cardsArea}>
        {shuffledWords.map((w, i) => {
          if (round.matched.has(w.ku)) {
            return <View key={w.ku} style={styles.cardPlaceholder} />;
          }
          return (
            <DraggableCard
              key={w.ku}
              word={w}
              homeIdx={i}
              color={category.color}
              slotPositions={slotPositions.current}
              onMatch={matchAttempt}
            />
          );
        })}
      </View>

      <Confetti visible={confetti} count={45} />
    </View>
  );
}

// =====================================================================
//  SÜRÜKLENEBİLİR KART
// =====================================================================
function DraggableCard({
  word, homeIdx, color, slotPositions, onMatch,
}: {
  word: KidsWord;
  homeIdx: number;
  color: string;
  slotPositions: { x: number; y: number; w: number; h: number; word: KidsWord }[];
  onMatch: (w: KidsWord, idx: number) => boolean;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const isDragging = useSharedValue(false);

  const reset = () => {
    tx.value = withSpring(0, { damping: 12 });
    ty.value = withSpring(0, { damping: 12 });
    scale.value = withSpring(1, { damping: 10 });
  };

  const tryMatch = (absX: number, absY: number) => {
    // Slot bul
    for (let i = 0; i < slotPositions.length; i++) {
      const slot = slotPositions[i];
      if (!slot) continue;
      // Bu basit hit-test relative pozisyonlar üzerinden
      // (slotPositions container'a göredir, basit overlap kontrolü yapacağız)
      // Bu yaklaşıma uygun şekilde, her iki tarafın da ekran bazlı olması gerek
      // Pragmatik: cardArea'nın yukarısındayız mı + hangi yatay slot
    }
    // Basit yaklaşım: drop'un Y'si üst kartlarda, X'e göre slot index belirle
    const containerWidth = slotPositions[0]?.w ?? SW / 2;
    return null;
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      scale.value = withSpring(1.15, { damping: 8 });
    })
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY;
    })
    .onEnd((e) => {
      // Yukarı sürüklediyse ve x'e göre slot belirle
      const dy = e.translationY;
      const draggedUp = dy < -100; // en az 100px yukarı sürükleme
      if (draggedUp) {
        // Sol/sağ + üst/alt → slot index 0-3 (2x2 grid)
        const dx = e.translationX;
        const isLeft = dx < 0;
        const isTop = dy < -250;
        const slotIdx = (isTop ? 0 : 2) + (isLeft ? 0 : 1);

        const matched = onMatch(word, slotIdx);
        if (matched) {
          // Kayar şekilde slot'a yerleş, sonra kaybol
          opacity.value = withTiming(0, { duration: 400 });
          scale.value = withTiming(0.5, { duration: 400 });
        } else {
          // Geri dön + shake
          tx.value = withSequence(
            withTiming(20, { duration: 80 }),
            withTiming(-20, { duration: 80 }),
            withTiming(0, { duration: 80 }),
            withSpring(0, { damping: 10 }),
          );
          ty.value = withSpring(0, { damping: 12 });
          scale.value = withSpring(1, { damping: 10 });
        }
      } else {
        runOnJS(reset)();
      }
      isDragging.value = false;
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
    zIndex: isDragging.value ? 1000 : 1,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.card, animStyle, SHADOW(color, "md")]}
      >
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
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    backgroundColor: "#fff",
    margin: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: KIDS_THEME.primarySoft,
  },
  instructionText: { flex: 1, ...TYPO.bodyLg, color: KIDS_THEME.ink },
  scoreCard: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: { ...TYPO.body },

  // Slot (foto)
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

  // Sürüklenebilir kartlar
  cardsArea: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  card: {
    width: SLOT_W,
    height: 64,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  cardPlaceholder: {
    width: SLOT_W,
    height: 64,
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

  // Bitti
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
