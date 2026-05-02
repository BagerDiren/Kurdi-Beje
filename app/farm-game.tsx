/**
 * Çiftlik oyunu sayfası — gerçek 3D dünyaya giriş.
 *
 * Akış:
 *   1. Oyun-giriş splash'ı (Farm3D içinde)
 *   2. Çok bölgeli 3D çiftlik (hayvan/meyve/sebze/ev) + görev sistemi
 *   3. Çıkışta XP toplanır, app context'e işlenir.
 */
import { router } from "expo-router";
import { Farm3D } from "@/components/kids/farm-3d";
import { KIDS_CATEGORIES } from "@/data/kids-content";
import { useApp } from "@/data/app-context";

export default function FarmGameScreen() {
  const ctx = useApp();
  // Çiftlik hayvan kategorisini default kullan (6 hayvan: kûçik, pisîk, ga, hesp, mirîşk, pez)
  const animalCategory = KIDS_CATEGORIES.find((c) => c.key === "hayvan") ?? KIDS_CATEGORIES[0];

  return (
    <Farm3D
      category={animalCategory}
      onClose={() => router.replace("/(tabs)")}
      onXp={(xp) => {
        if (xp > 0) ctx.addXp?.(xp);
      }}
    />
  );
}
