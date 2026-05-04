/**
 * Kevo Oyun Suiti — kullanıcının HTML v3 sürümünden portlanan 7 mini-oyun.
 *
 * Akış:
 *   /kevo → KevoHub (5 kategori) → ilgili mini-oyun
 *   Çıkış → tabs anasayfasına dön, kazanılan XP app context'e işlenir.
 */
import { router } from "expo-router";
import { KevoSuite } from "@/components/kevo/kevo-suite";
import { useApp } from "@/data/app-context";

// proficiency → CEFR seviye eşlemesi
const PROFICIENCY_TO_LEVEL: Record<string, "A1" | "A2" | "B1" | "B2"> = {
  new: "A1",
  basic: "A1",
  simple: "A2",
  varied: "B1",
  advanced: "B2",
};

export default function KevoScreen() {
  const ctx = useApp();
  const levelId = PROFICIENCY_TO_LEVEL[ctx.proficiency ?? "basic"] ?? "A2";

  return (
    <KevoSuite
      levelId={levelId}
      onClose={() => router.replace("/(tabs)")}
      onXp={(xp) => {
        if (xp > 0) ctx.addXp?.(xp);
      }}
    />
  );
}
