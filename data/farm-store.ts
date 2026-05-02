/**
 * Çiftlik oyunu için kalıcı state.
 * AsyncStorage'da saklanır — kullanıcı app'ten çıkıp girince çiftlik durumu korunur.
 *
 * Hay Day mantığı:
 *  - Coins (başlangıç: 100)
 *  - 12 slot (3x4 grid). Her slot: empty / plant / animal
 *  - Plant 3 büyüme aşaması: seed → sprout → mature (timer-based)
 *  - Mature → biç → +coin +Kürtçe kelime sesli oku
 *  - Animal: yem ver → süre sonra ürün → sat → coin
 *  - Tohum/hayvan mağazası
 *  - Günlük görev: "3 elma topla" gibi
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "kurdîbêje_farm_v2";

export type SeedKind = "sev" | "tiri" | "hinar";
export type AnimalKind = "miriskg" | "pez" | "ga";

export type SlotState =
  | { type: "empty" }
  | { type: "plant"; seed: SeedKind; plantedAt: number; harvested?: boolean }
  | { type: "animal"; kind: AnimalKind; placedAt: number; lastFedAt: number; productReadyAt: number };

export type FarmState = {
  coins: number;
  xp: number;
  slots: SlotState[];        // 12
  inventory: Record<SeedKind, number>;  // hasat sonucu
  questProgress: number;     // bugün topladığı elma sayısı
  questGoal: number;         // 3 elma vs
  questDate: string;         // bugünün ISO tarihi
};

export type SeedConfig = {
  kind: SeedKind;
  ku: string;          // Kurmancî
  tr: string;
  emoji: { seed: string; sprout: string; mature: string };
  growSeconds: number; // toplam büyüme süresi
  cost: number;        // tohum fiyatı
  reward: number;      // hasat geliri (coin)
  xp: number;          // hasat ödülü XP
};

export type AnimalConfig = {
  kind: AnimalKind;
  ku: string;
  tr: string;
  emoji: string;
  productEmoji: string;
  productKu: string;
  productTr: string;
  cost: number;          // hayvan fiyatı
  productCycleSec: number;
  productSellPrice: number;
  xp: number;
};

export const SEEDS: Record<SeedKind, SeedConfig> = {
  sev: {
    kind: "sev",
    ku: "Sêv", tr: "Elma",
    emoji: { seed: "🌱", sprout: "🌿", mature: "🍎" },
    growSeconds: 30, cost: 5, reward: 15, xp: 5,
  },
  tiri: {
    kind: "tiri",
    ku: "Tirî", tr: "Üzüm",
    emoji: { seed: "🌱", sprout: "🌿", mature: "🍇" },
    growSeconds: 60, cost: 10, reward: 30, xp: 8,
  },
  hinar: {
    kind: "hinar",
    ku: "Hinar", tr: "Nar",
    emoji: { seed: "🌱", sprout: "🌿", mature: "🍑" },
    growSeconds: 120, cost: 20, reward: 65, xp: 12,
  },
};

export const ANIMALS: Record<AnimalKind, AnimalConfig> = {
  miriskg: {
    kind: "miriskg",
    ku: "Mirîşk", tr: "Tavuk",
    emoji: "🐔",
    productEmoji: "🥚", productKu: "Hêk", productTr: "Yumurta",
    cost: 80,
    productCycleSec: 60,
    productSellPrice: 25,
    xp: 8,
  },
  pez: {
    kind: "pez",
    ku: "Pez", tr: "Koyun",
    emoji: "🐑",
    productEmoji: "🧣", productKu: "Hirî", productTr: "Yün",
    cost: 200,
    productCycleSec: 120,
    productSellPrice: 70,
    xp: 12,
  },
  ga: {
    kind: "ga",
    ku: "Ga", tr: "İnek",
    emoji: "🐮",
    productEmoji: "🥛", productKu: "Şîr", productTr: "Süt",
    cost: 400,
    productCycleSec: 180,
    productSellPrice: 150,
    xp: 18,
  },
};

const INITIAL_STATE: FarmState = {
  coins: 100,
  xp: 0,
  slots: Array.from({ length: 12 }, () => ({ type: "empty" } as SlotState)),
  inventory: { sev: 0, tiri: 0, hinar: 0 },
  questProgress: 0,
  questGoal: 3,
  questDate: new Date().toISOString().slice(0, 10),
};

export async function loadFarmState(): Promise<FarmState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as FarmState;
    // Bugün değil mi → questi sıfırla
    const today = new Date().toISOString().slice(0, 10);
    if (parsed.questDate !== today) {
      parsed.questProgress = 0;
      parsed.questDate = today;
    }
    return parsed;
  } catch {
    return INITIAL_STATE;
  }
}

export async function saveFarmState(state: FarmState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export async function resetFarm(): Promise<void> {
  await saveFarmState(INITIAL_STATE);
}

export function plantStage(slot: SlotState): "seed" | "sprout" | "mature" | null {
  if (slot.type !== "plant") return null;
  const seed = SEEDS[slot.seed];
  const elapsed = (Date.now() - slot.plantedAt) / 1000;
  if (elapsed >= seed.growSeconds) return "mature";
  if (elapsed >= seed.growSeconds * 0.5) return "sprout";
  return "seed";
}

export function plantProgress(slot: SlotState): number {
  if (slot.type !== "plant") return 0;
  const seed = SEEDS[slot.seed];
  const elapsed = (Date.now() - slot.plantedAt) / 1000;
  return Math.min(1, elapsed / seed.growSeconds);
}

export function animalProductReady(slot: SlotState): boolean {
  if (slot.type !== "animal") return false;
  return Date.now() >= slot.productReadyAt;
}
