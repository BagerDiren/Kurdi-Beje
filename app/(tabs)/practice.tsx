/**
 * 🎓 Pratik sekmesi — sadece yetişkin modunda görünür.
 * 4 mod: Kelime Quizi, Cümle Kurma, Dinleme, Karışık Tekrar.
 */
import { PracticeHub } from "@/components/duo/practice-hub";
import { useApp } from "@/data/app-context";

export default function PracticeTab() {
  const ctx = useApp();
  return <PracticeHub onXp={(xp) => ctx.addXp?.(xp)} />;
}
