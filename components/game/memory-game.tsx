import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";

import { Btn } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import type { AppTheme } from "@/data/themes";
import type { Translations } from "@/data/translations";

/**
 * Hafıza Eşleştirme — kelime ve anlamlarını eşleştir.
 * 4×3 grid (12 kart, 6 çift). Süre tutar, hata sayar.
 * Tamamlanınca skor: 100 - (hata × 8) - max(0, süre - 60).
 */

type Card = {
  id: string;          // benzersiz
  pairKey: string;     // çiftin anahtarı (eşleşme için)
  text: string;
  isMeaning: boolean;
  flipped: boolean;
  matched: boolean;
};

type Props = {
  th: AppTheme;
  pool: { ku: string; tr: string; emoji: string }[];
  onXp: (n: number) => void;
  onBack: () => void;
  t?: Translations;
};

export function MemoryGame({ th, pool, onXp, onBack }: Props) {
  const [round, setRound] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<Card[]>([]);
  const [errors, setErrors] = useState(0);
  const [matches, setMatches] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  // Yeni round başlat
  const startRound = () => {
    if (pool.length < 6) return;
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
    const built: Card[] = [];
    shuffled.forEach((w, i) => {
      const pairKey = `pair-${i}`;
      built.push({ id: `ku-${i}`, pairKey, text: `${w.emoji} ${w.ku}`, isMeaning: false, flipped: false, matched: false });
      built.push({ id: `tr-${i}`, pairKey, text: w.tr, isMeaning: true, flipped: false, matched: false });
    });
    setCards(built.sort(() => Math.random() - 0.5));
    setSelected([]);
    setErrors(0);
    setMatches(0);
    setSeconds(0);
    setRunning(true);
    setDone(false);
  };

  useEffect(() => {
    startRound();
  }, [round]);

  // Süre sayacı
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  // Eşleşme kontrolü
  useEffect(() => {
    if (selected.length !== 2) return;
    const [a, b] = selected;
    const isMatch = a.pairKey === b.pairKey && a.isMeaning !== b.isMeaning;

    if (isMatch) {
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) => (c.pairKey === a.pairKey ? { ...c, matched: true } : c))
        );
        setSelected([]);
        setMatches((m) => m + 1);
      }, 400);
    } else {
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c
          )
        );
        setSelected([]);
        setErrors((e) => e + 1);
      }, 900);
    }
  }, [selected]);

  // Bitti mi?
  useEffect(() => {
    if (matches === 6 && cards.length > 0) {
      setRunning(false);
      setDone(true);
      // Skor hesabı
      const score = Math.max(0, 100 - errors * 8 - Math.max(0, seconds - 60));
      onXp(Math.round(score / 5)); // her 5 puan = 1 XP
    }
  }, [matches]);

  const flip = (card: Card) => {
    if (card.flipped || card.matched || selected.length === 2) return;
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, flipped: true } : c))
    );
    setSelected((s) => [...s, { ...card, flipped: true }]);
  };

  // Bitiş ekranı
  if (done) {
    const score = Math.max(0, 100 - errors * 8 - Math.max(0, seconds - 60));
    const xp = Math.round(score / 5);
    const stars = score >= 85 ? 3 : score >= 60 ? 2 : score >= 30 ? 1 : 0;

    return (
      <ScrollView style={{ flex: 1, backgroundColor: th.bg }} contentContainerStyle={styles.doneContainer}>
        <View style={{ alignItems: "center" }}>
          <KevoMascot size={110} mood="happy" speaking idle />
        </View>

        <Text style={[styles.doneTitle, { color: th.primary }]}>
          🧠 Tur Bitti!
        </Text>

        <View style={styles.starsRow}>
          {[0, 1, 2].map((i) => (
            <Text key={i} style={[styles.star, { opacity: i < stars ? 1 : 0.18 }]}>⭐</Text>
          ))}
        </View>

        <View style={[styles.doneCard, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
          <Row label="Skor" value={`${score}`} color={th.primary} th={th} />
          <Row label="Hata" value={`${errors}`} color={th.wrong} th={th} />
          <Row label="Süre" value={`${seconds}sn`} color={th.text} th={th} />
          <Row label="Kazanılan XP" value={`+${xp} ⭐`} color={th.accent} th={th} />
        </View>

        <View style={{ height: 16 }} />
        <Btn onPress={() => setRound((r) => r + 1)} th={th}>Yeni tur ▶</Btn>
        <View style={{ height: 8 }} />
        <Btn onPress={onBack} th={th} variant="primary">Çık</Btn>
      </ScrollView>
    );
  }

  // Aktif oyun
  return (
    <View style={{ flex: 1, backgroundColor: th.bg }}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={onBack}>
          <Text style={{ fontSize: 22, color: th.textMid }}>✕</Text>
        </Pressable>
        <View style={[styles.statChip, { backgroundColor: th.primary + "18", borderColor: th.primary }]}>
          <Text style={{ fontSize: 12, fontWeight: "800", color: th.primary }}>
            ⏱️ {seconds}sn
          </Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: th.wrong + "18", borderColor: th.wrong }]}>
          <Text style={{ fontSize: 12, fontWeight: "800", color: th.wrong }}>
            ✗ {errors}
          </Text>
        </View>
        <View style={[styles.statChip, { backgroundColor: th.correct + "18", borderColor: th.correct }]}>
          <Text style={{ fontSize: 12, fontWeight: "800", color: th.correct }}>
            ✓ {matches}/6
          </Text>
        </View>
      </View>

      <Text style={[styles.instruction, { color: th.text }]}>
        🧠 Eşleşen kelime ve anlamı bul
      </Text>

      <View style={styles.grid}>
        {cards.map((c) => (
          <MemoCard key={c.id} card={c} onFlip={flip} th={th} />
        ))}
      </View>
    </View>
  );
}

// =====================================================================
//  KART
// =====================================================================
function MemoCard({ card, onFlip, th }: { card: Card; onFlip: (c: Card) => void; th: AppTheme }) {
  const showFront = card.flipped || card.matched;
  const flipAnim = useSharedValue(showFront ? 1 : 0);

  useEffect(() => {
    flipAnim.value = withSpring(showFront ? 1 : 0, { damping: 12, stiffness: 110 });
  }, [showFront]);

  const front = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipAnim.value * 180}deg` }],
    opacity: flipAnim.value,
  }));
  const back = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${(1 - flipAnim.value) * -180}deg` }],
    opacity: 1 - flipAnim.value,
  }));

  const isMeaning = card.isMeaning;

  return (
    <Pressable onPress={() => onFlip(card)} style={styles.cardOuter}>
      {/* Back face */}
      <Animated.View
        style={[
          styles.cardFace,
          {
            backgroundColor: th.primary,
            borderColor: th.primary,
          },
          back,
        ]}
      >
        <Text style={{ fontSize: 30, color: "#fff" }}>🎴</Text>
      </Animated.View>

      {/* Front face */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardFront,
          {
            backgroundColor: card.matched ? th.correct + "22" : isMeaning ? th.accent + "18" : th.card,
            borderColor: card.matched ? th.correct : isMeaning ? th.accent : th.cardBorder,
          },
          front,
        ]}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "800",
            textAlign: "center",
            color: card.matched ? th.correct : isMeaning ? th.accent : th.text,
          }}
        >
          {card.text}
        </Text>
        {card.matched && <Text style={{ fontSize: 14, marginTop: 4 }}>✓</Text>}
      </Animated.View>
    </Pressable>
  );
}

function Row({ label, value, color, th }: { label: string; value: string; color: string; th: AppTheme }) {
  return (
    <View style={styles.row}>
      <Text style={{ fontSize: 13, color: th.textMid, fontWeight: "600" }}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: "900", color }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  instruction: {
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
  },
  cardOuter: {
    width: "31%",
    aspectRatio: 0.85,
    margin: "1%",
  },
  cardFace: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    backfaceVisibility: "hidden",
  },
  cardFront: {},

  doneContainer: { padding: 22, paddingTop: 32, alignItems: "center", gap: 14 },
  doneTitle: { fontSize: 24, fontWeight: "900" },
  starsRow: { flexDirection: "row", gap: 8 },
  star: { fontSize: 38 },
  doneCard: { width: "100%", borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
