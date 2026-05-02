/**
 * Kevo'nun Çiftliği V2 — Hay Day mantığında profesyonel oyun.
 *
 * Tüm state AsyncStorage'da, app yeniden açılınca devam eder.
 * Coin ekonomisi, mahsul lifecycle, hayvan üretim döngüsü, görev sistemi.
 */
import { useEffect, useState, useRef } from "react";
import {
  View, Text, Pressable, StyleSheet, Image, ImageBackground, Modal, ScrollView, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

// Telifsiz Pexels — çiftlik manzarası (sinematik bg)
const FARM_BG = "https://images.pexels.com/photos/2255801/pexels-photo-2255801.jpeg?auto=compress&cs=tinysrgb&w=900";
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, withSpring, Easing,
} from "react-native-reanimated";

import { Confetti } from "./confetti";
import { speakKurmanci, playFx } from "@/data/sound-fx";
import { KIDS_THEME, RADIUS, SHADOW, SPACING, TYPO } from "./design";
import { KidCharacter } from "./kid-character";
import {
  loadFarmState, saveFarmState, plantStage, plantProgress, animalProductReady,
  SEEDS, ANIMALS,
  type FarmState, type SlotState, type SeedKind, type AnimalKind, type SeedConfig, type AnimalConfig,
} from "@/data/farm-store";

const { width: SW } = Dimensions.get("window");
const SLOT_SIZE = (SW - SPACING.lg * 2 - SPACING.sm * 2) / 3 - 4;

type Props = {
  onClose: () => void;
};

type Modal_ = "none" | "seedShop" | "animalShop" | "harvest" | "quest";

export function FarmGameV2({ onClose }: Props) {
  const [state, setState] = useState<FarmState | null>(null);
  const [modal, setModal] = useState<Modal_>("none");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [confettiOn, setConfettiOn] = useState(false);
  const [tick, setTick] = useState(0); // re-render her saniye için (timer ilerlesin)
  const [floatMsg, setFloatMsg] = useState<{ text: string; color: string } | null>(null);

  // İlk yükleme
  useEffect(() => {
    loadFarmState().then(setState);
  }, []);

  // Plant timer — her saniye re-render
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // State değişince kaydet
  useEffect(() => {
    if (state) saveFarmState(state);
  }, [state]);

  if (!state) {
    return (
      <View style={[styles.root, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ ...TYPO.body, color: KIDS_THEME.smoke }}>Çiftlik yükleniyor...</Text>
      </View>
    );
  }

  const update = (patch: Partial<FarmState>) => setState((s) => (s ? { ...s, ...patch } : s));

  const showFloat = (text: string, color = KIDS_THEME.success) => {
    setFloatMsg({ text, color });
    setTimeout(() => setFloatMsg(null), 2200);
  };

  // === SLOT DOKUNUSUNU YÖNET ===
  const onSlotTap = (idx: number) => {
    const slot = state.slots[idx];
    if (slot.type === "empty") {
      setSelectedSlot(idx);
      setModal("seedShop");
    } else if (slot.type === "plant") {
      const stage = plantStage(slot);
      if (stage === "mature") {
        // BİÇ
        const seed = SEEDS[slot.seed];
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
        const newSlots = [...state.slots];
        newSlots[idx] = { type: "empty" };
        const newInventory = { ...state.inventory };
        newInventory[slot.seed] = (newInventory[slot.seed] ?? 0) + 1;
        const isApple = slot.seed === "sev";
        update({
          coins: state.coins + seed.reward,
          xp: state.xp + seed.xp,
          slots: newSlots,
          inventory: newInventory,
          questProgress: isApple ? state.questProgress + 1 : state.questProgress,
        });
        speakKurmanci(seed.ku, "kid");
        setConfettiOn(true);
        setTimeout(() => setConfettiOn(false), 1200);
        showFloat(`+${seed.reward} 🪙  +${seed.xp} ⭐  ·  ${seed.ku}!`);
      } else {
        // Henüz olgun değil
        showFloat("Daha büyümedi 🌱", KIDS_THEME.smoke);
      }
    } else if (slot.type === "animal") {
      const animal = ANIMALS[slot.kind];
      if (animalProductReady(slot)) {
        // ÜRÜNÜ AL
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
        const newSlots = [...state.slots];
        newSlots[idx] = {
          ...slot,
          lastFedAt: Date.now(),
          productReadyAt: Date.now() + animal.productCycleSec * 1000,
        };
        update({
          coins: state.coins + animal.productSellPrice,
          xp: state.xp + animal.xp,
          slots: newSlots,
        });
        speakKurmanci(animal.productKu, "kid");
        setConfettiOn(true);
        setTimeout(() => setConfettiOn(false), 1100);
        showFloat(`+${animal.productSellPrice} 🪙  ${animal.productEmoji}  ${animal.productKu}!`);
      } else {
        // Hayvan adını söyle
        speakKurmanci(animal.ku, "kid");
        showFloat(`${animal.ku} · ${animal.tr}`, KIDS_THEME.primary);
      }
    }
  };

  const buySeed = (kind: SeedKind) => {
    const seed = SEEDS[kind];
    if (state.coins < seed.cost || selectedSlot === null) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    const newSlots = [...state.slots];
    newSlots[selectedSlot] = { type: "plant", seed: kind, plantedAt: Date.now() };
    update({ coins: state.coins - seed.cost, slots: newSlots });
    setModal("none");
    setSelectedSlot(null);
    speakKurmanci(seed.ku, "kid");
  };

  const buyAnimal = (kind: AnimalKind) => {
    const animal = ANIMALS[kind];
    if (state.coins < animal.cost) return;
    // İlk boş slotu bul
    const emptyIdx = state.slots.findIndex((s) => s.type === "empty");
    if (emptyIdx === -1) {
      showFloat("Boş yer yok!", KIDS_THEME.danger);
      return;
    }
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
    const newSlots = [...state.slots];
    const now = Date.now();
    newSlots[emptyIdx] = {
      type: "animal",
      kind,
      placedAt: now,
      lastFedAt: now,
      productReadyAt: now + animal.productCycleSec * 1000,
    };
    update({ coins: state.coins - animal.cost, slots: newSlots });
    setModal("none");
    speakKurmanci(animal.ku, "kid");
    setConfettiOn(true);
    setTimeout(() => setConfettiOn(false), 1300);
  };

  const claimQuest = () => {
    if (state.questProgress < state.questGoal) return;
    update({
      coins: state.coins + 50,
      xp: state.xp + 20,
      questProgress: 0,
      questGoal: state.questGoal + 1,
    });
    setModal("none");
    setConfettiOn(true);
    setTimeout(() => setConfettiOn(false), 1500);
    showFloat("+50 🪙  +20 ⭐  Görev tamam!");
  };

  const level = Math.floor(state.xp / 50) + 1;

  return (
    <View style={styles.root}>
      {/* Sinematik foto arka plan + gradient overlay */}
      <Image source={{ uri: FARM_BG }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <LinearGradient
        colors={["rgba(135,206,235,0.7)", "rgba(166,217,242,0.5)", "rgba(164,214,94,0.6)"] as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* === ÜST HUD === */}
      <View style={styles.hud}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.hudBack}>
          <Text style={{ fontSize: 22, color: "#fff", fontFamily: "Fredoka_700Bold" }}>‹</Text>
        </Pressable>

        <View style={styles.hudCoinPill}>
          <Text style={{ fontSize: 18 }}>🪙</Text>
          <Text style={styles.hudCoinVal}>{state.coins}</Text>
        </View>

        <View style={styles.hudLevelPill}>
          <Text style={{ fontSize: 14 }}>⭐</Text>
          <Text style={styles.hudLevel}>Lv {level}</Text>
        </View>

        <Pressable onPress={() => setModal("quest")} style={styles.hudQuestBtn}>
          <Text style={{ fontSize: 18 }}>📋</Text>
          {state.questProgress >= state.questGoal && (
            <View style={styles.questDot} />
          )}
        </Pressable>
      </View>

      {/* === GÖKYÜZÜ DEKORU === */}
      <Cloud delay={0} />
      <Cloud delay={6000} />

      {/* === ÇİFTLİK GRİDİ (3x4) === */}
      <ScrollView contentContainerStyle={styles.farmScroll}>
        <View style={styles.gridFrame}>
          <LinearGradient
            colors={["#7CB342", "#558B2F"] as unknown as readonly [string, string, ...string[]]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.grid}>
            {state.slots.map((slot, i) => (
              <FarmSlot key={i} slot={slot} size={SLOT_SIZE} onTap={() => onSlotTap(i)} tick={tick} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* === ALT EYLEM BAR === */}
      <View style={styles.actionBar}>
        <ActionButton
          emoji="🌱" label="TOHUM" sublabel="Boş slota dok"
          color={KIDS_THEME.green}
          onPress={() => {
            // İlk boş slotu seç → tohum modal
            const idx = state.slots.findIndex((s) => s.type === "empty");
            if (idx === -1) return showFloat("Boş yer yok!", KIDS_THEME.danger);
            setSelectedSlot(idx);
            setModal("seedShop");
          }}
        />
        <ActionButton
          emoji="🐮" label="HAYVAN" sublabel="Mağaza"
          color={KIDS_THEME.yellow}
          onPress={() => setModal("animalShop")}
        />
        <ActionButton
          emoji="📋" label="GÖREV"
          sublabel={`${state.questProgress}/${state.questGoal} 🍎`}
          color={KIDS_THEME.purple}
          onPress={() => setModal("quest")}
        />
      </View>

      {/* === FLOATING MSG === */}
      {floatMsg && (
        <View style={[styles.floatMsg, { backgroundColor: floatMsg.color }]}>
          <Text style={styles.floatMsgText}>{floatMsg.text}</Text>
        </View>
      )}

      {/* === MODALLAR === */}
      <SeedShopModal
        visible={modal === "seedShop"}
        coins={state.coins}
        onClose={() => { setModal("none"); setSelectedSlot(null); }}
        onBuy={buySeed}
      />
      <AnimalShopModal
        visible={modal === "animalShop"}
        coins={state.coins}
        onClose={() => setModal("none")}
        onBuy={buyAnimal}
      />
      <QuestModal
        visible={modal === "quest"}
        progress={state.questProgress}
        goal={state.questGoal}
        onClose={() => setModal("none")}
        onClaim={claimQuest}
      />

      <Confetti visible={confettiOn} count={40} />
    </View>
  );
}

// =====================================================================
//  TEK SLOT (büyüme aşaması, hayvan, ürün)
// =====================================================================
function FarmSlot({ slot, size, onTap, tick }: {
  slot: SlotState; size: number; onTap: () => void; tick: number;
}) {
  const bounce = useSharedValue(0);

  useEffect(() => {
    if (slot.type === "animal") {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 800 + Math.random() * 600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 800 + Math.random() * 600, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, false,
      );
    }
  }, [slot.type]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bounce.value }] }));

  // Empty
  if (slot.type === "empty") {
    return (
      <Pressable onPress={onTap} style={[styles.slot, { width: size, height: size }]}>
        <View style={[styles.slotEmpty, { backgroundColor: "#8B6F47" + "55", borderColor: "#5D4037" + "44" }]}>
          <Text style={{ fontSize: 22, opacity: 0.45 }}>+</Text>
        </View>
      </Pressable>
    );
  }

  // Plant
  if (slot.type === "plant") {
    const seed = SEEDS[slot.seed];
    const stage = plantStage(slot);
    const prog = plantProgress(slot);
    const emoji = stage === "mature" ? seed.emoji.mature : stage === "sprout" ? seed.emoji.sprout : seed.emoji.seed;
    const isReady = stage === "mature";
    return (
      <Pressable onPress={onTap} style={[styles.slot, { width: size, height: size }]}>
        <View style={[
          styles.slotPlant,
          { borderColor: isReady ? KIDS_THEME.success : "#A4D65E" },
          isReady && SHADOW(KIDS_THEME.success, "glow"),
        ]}>
          <Text style={{ fontSize: size * (stage === "mature" ? 0.55 : 0.5) }}>{emoji}</Text>
          {!isReady && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${prog * 100}%` }]} />
            </View>
          )}
          {isReady && <Text style={styles.readyLabel}>HASAT! 🪙</Text>}
        </View>
      </Pressable>
    );
  }

  // Animal
  const animal = ANIMALS[slot.kind];
  const productReady = animalProductReady(slot);
  const remainSec = Math.max(0, Math.floor((slot.productReadyAt - Date.now()) / 1000));
  return (
    <Pressable onPress={onTap} style={[styles.slot, { width: size, height: size }]}>
      <View style={[
        styles.slotAnimal,
        { borderColor: productReady ? KIDS_THEME.success : "#FFB740" },
        productReady && SHADOW(KIDS_THEME.success, "glow"),
      ]}>
        <Animated.View style={animStyle}>
          <Text style={{ fontSize: size * 0.55 }}>{animal.emoji}</Text>
        </Animated.View>
        {productReady && (
          <View style={styles.productBubble}>
            <Text style={{ fontSize: 14 }}>{animal.productEmoji}</Text>
          </View>
        )}
        {!productReady && (
          <Text style={styles.timerLabel}>{remainSec}s</Text>
        )}
      </View>
    </Pressable>
  );
}

// Bulut animasyonu
function Cloud({ delay }: { delay: number }) {
  const x = useSharedValue(SW + 80);
  const y = 80 + Math.random() * 30;
  useEffect(() => {
    setTimeout(() => {
      x.value = withRepeat(
        withTiming(-120, { duration: 18000, easing: Easing.linear }),
        -1, false,
      );
    }, delay);
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <Animated.View style={[{ position: "absolute", top: y, left: 0, opacity: 0.7 }, style]}>
      <Text style={{ fontSize: 44 }}>☁️</Text>
    </Animated.View>
  );
}

// Eylem butonu
function ActionButton({ emoji, label, sublabel, color, onPress }: {
  emoji: string; label: string; sublabel: string; color: string; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.actionBtn,
      { backgroundColor: color, opacity: pressed ? 0.92 : 1, transform: pressed ? [{ scale: 0.96 }] : [] },
      SHADOW(color, "md"),
    ]}>
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionSub}>{sublabel}</Text>
    </Pressable>
  );
}

// =====================================================================
//  TOHUM MAĞAZASI
// =====================================================================
function SeedShopModal({ visible, coins, onClose, onBuy }: {
  visible: boolean; coins: number; onClose: () => void; onBuy: (k: SeedKind) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🌱 Tohum Mağazası</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
          </View>
          <Text style={styles.modalCoins}>🪙 {coins} altın</Text>
          {(Object.values(SEEDS) as SeedConfig[]).map((s) => {
            const can = coins >= s.cost;
            return (
              <Pressable
                key={s.kind}
                onPress={() => can && onBuy(s.kind)}
                disabled={!can}
                style={[styles.shopItem, { opacity: can ? 1 : 0.5, borderColor: KIDS_THEME.green }]}
              >
                <Text style={{ fontSize: 38 }}>{s.emoji.mature}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shopItemTitle}>{s.ku} <Text style={{ ...TYPO.caption, color: KIDS_THEME.smoke }}>· {s.tr}</Text></Text>
                  <Text style={styles.shopItemMeta}>⏱ {s.growSeconds}s · 🪙 {s.reward} kazanç</Text>
                </View>
                <View style={[styles.shopBuyBtn, { backgroundColor: can ? KIDS_THEME.green : KIDS_THEME.silver }]}>
                  <Text style={styles.shopBuyText}>🪙 {s.cost}</Text>
                </View>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// =====================================================================
//  HAYVAN MAĞAZASI
// =====================================================================
function AnimalShopModal({ visible, coins, onClose, onBuy }: {
  visible: boolean; coins: number; onClose: () => void; onBuy: (k: AnimalKind) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🐮 Hayvan Mağazası</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
          </View>
          <Text style={styles.modalCoins}>🪙 {coins} altın</Text>
          {(Object.values(ANIMALS) as AnimalConfig[]).map((a) => {
            const can = coins >= a.cost;
            return (
              <Pressable
                key={a.kind}
                onPress={() => can && onBuy(a.kind)}
                disabled={!can}
                style={[styles.shopItem, { opacity: can ? 1 : 0.5, borderColor: KIDS_THEME.yellow }]}
              >
                <Text style={{ fontSize: 38 }}>{a.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shopItemTitle}>{a.ku} <Text style={{ ...TYPO.caption, color: KIDS_THEME.smoke }}>· {a.tr}</Text></Text>
                  <Text style={styles.shopItemMeta}>{a.productEmoji} {a.productKu} · {a.productCycleSec}s · 🪙 {a.productSellPrice}</Text>
                </View>
                <View style={[styles.shopBuyBtn, { backgroundColor: can ? KIDS_THEME.yellow : KIDS_THEME.silver }]}>
                  <Text style={styles.shopBuyText}>🪙 {a.cost}</Text>
                </View>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// =====================================================================
//  GÜNLÜK GÖREV
// =====================================================================
function QuestModal({ visible, progress, goal, onClose, onClaim }: {
  visible: boolean; progress: number; goal: number; onClose: () => void; onClaim: () => void;
}) {
  const can = progress >= goal;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📋 Günlük Görev</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.questBlock}>
            <View style={styles.questIcon}>
              <Text style={{ fontSize: 50 }}>🍎</Text>
            </View>
            <Text style={styles.questText}>{goal} elma topla!</Text>
            <View style={styles.questBar}>
              <View style={[styles.questBarFill, { width: `${Math.min(100, (progress / goal) * 100)}%` }]} />
            </View>
            <Text style={styles.questProgress}>{progress}/{goal} 🍎</Text>
            <View style={styles.questReward}>
              <Text>🎁 Ödül:</Text>
              <Text style={styles.questRewardText}>+50 🪙  +20 ⭐</Text>
            </View>
            <Pressable
              onPress={onClaim}
              disabled={!can}
              style={[
                styles.questClaim,
                { backgroundColor: can ? KIDS_THEME.success : KIDS_THEME.silver, opacity: can ? 1 : 0.6 },
              ]}
            >
              <Text style={styles.questClaimText}>{can ? "ÖDÜLÜ AL!" : "TAMAMLA"}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  hud: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  hudBack: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  hudCoinPill: {
    flex: 1,
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    ...SHADOW("#000", "sm"),
  },
  hudCoinVal: { ...TYPO.h2, color: KIDS_THEME.yellowDark, fontFamily: "Fredoka_700Bold" },
  hudLevelPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    ...SHADOW("#000", "sm"),
  },
  hudLevel: { ...TYPO.body, color: KIDS_THEME.purple },
  hudQuestBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center", justifyContent: "center",
    ...SHADOW("#000", "sm"),
  },
  questDot: {
    position: "absolute", top: 4, right: 4,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: KIDS_THEME.danger,
    borderWidth: 2, borderColor: "#fff",
  },

  farmScroll: { padding: SPACING.lg, alignItems: "center" },
  gridFrame: {
    width: "100%",
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    padding: SPACING.md,
    minHeight: SLOT_SIZE * 4 + SPACING.sm * 3 + SPACING.md * 2,
    borderWidth: 4,
    borderColor: "#5D4037",
    ...SHADOW("#000", "lg"),
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    justifyContent: "center",
  },

  slot: { alignItems: "center", justifyContent: "center" },
  slotEmpty: {
    width: "100%", height: "100%",
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center", justifyContent: "center",
  },
  slotPlant: {
    width: "100%", height: "100%",
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 2,
    alignItems: "center", justifyContent: "center",
    padding: 4,
  },
  slotAnimal: {
    width: "100%", height: "100%",
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 2,
    alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  progressBar: {
    width: "85%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "#0000001A",
    overflow: "hidden",
    marginTop: 4,
  },
  progressFill: { height: "100%", backgroundColor: KIDS_THEME.green, borderRadius: 2 },
  readyLabel: { ...TYPO.micro, color: KIDS_THEME.success, marginTop: 2 },
  timerLabel: {
    position: "absolute", bottom: 2,
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "#fff",
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
    fontSize: 10, fontFamily: "Fredoka_700Bold",
  },
  productBubble: {
    position: "absolute", top: 2, right: 2,
    backgroundColor: "#fff",
    borderWidth: 2, borderColor: KIDS_THEME.success,
    width: 26, height: 26, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
  },

  actionBar: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 28,
    backgroundColor: "rgba(255, 250, 245, 0.95)",
  },
  actionBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: "center",
  },
  actionLabel: { ...TYPO.body, color: "#fff", marginTop: 2 },
  actionSub: { ...TYPO.caption, color: "rgba(255,255,255,0.85)" },

  floatMsg: {
    position: "absolute",
    top: 110, alignSelf: "center",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOW("#000", "lg"),
  },
  floatMsgText: { ...TYPO.bodyLg, color: "#fff" },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: KIDS_THEME.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
    gap: SPACING.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: { ...TYPO.h1, color: KIDS_THEME.ink },
  modalClose: { fontSize: 24, color: KIDS_THEME.smoke, fontFamily: "Fredoka_700Bold" },
  modalCoins: { ...TYPO.h3, color: KIDS_THEME.yellowDark },
  shopItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: KIDS_THEME.card,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
  },
  shopItemTitle: { ...TYPO.h3, color: KIDS_THEME.ink },
  shopItemMeta: { ...TYPO.caption, color: KIDS_THEME.smoke, marginTop: 2 },
  shopBuyBtn: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  shopBuyText: { ...TYPO.body, color: "#fff" },

  questBlock: { alignItems: "center", padding: SPACING.lg, gap: SPACING.md },
  questIcon: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: KIDS_THEME.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  questText: { ...TYPO.h1, color: KIDS_THEME.ink, textAlign: "center" },
  questBar: { width: "100%", height: 12, borderRadius: 6, backgroundColor: KIDS_THEME.silver, overflow: "hidden" },
  questBarFill: { height: "100%", backgroundColor: KIDS_THEME.success, borderRadius: 6 },
  questProgress: { ...TYPO.h2, color: KIDS_THEME.success },
  questReward: { flexDirection: "row", alignItems: "center", gap: 8 },
  questRewardText: { ...TYPO.h3, color: KIDS_THEME.yellowDark },
  questClaim: {
    paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  questClaimText: { ...TYPO.button, color: "#fff" },
});
