import { useState } from "react";
import { router } from "expo-router";

import { OnboardingScreen, OptionCard } from "@/components/kids/onboarding-screen";
import { useApp, type DailyGoalMinutes } from "@/data/app-context";

const OPTIONS: { id: DailyGoalMinutes; emoji: string; label: string; sub: string }[] = [
  { id: 5,  emoji: "🌱", label: "Günde 5 dakika",  sub: "Rahat — başlangıç için ideal" },
  { id: 10, emoji: "🌳", label: "Günde 10 dakika", sub: "Normal — hızlı ilerleme" },
  { id: 15, emoji: "🌟", label: "Günde 15 dakika", sub: "Ciddi — çok kelime öğren" },
  { id: 20, emoji: "🚀", label: "Günde 20 dakika", sub: "Yoğun — uzman seviye" },
];

export default function IntroGoal() {
  const { dailyGoal, setDailyGoal } = useApp();
  const [sel, setSel] = useState<DailyGoalMinutes | null>(dailyGoal);

  const pick = (id: DailyGoalMinutes) => {
    setSel(id);
    setDailyGoal(id);
  };

  return (
    <OnboardingScreen
      progress={0.85}
      onBack={() => router.back()}
      character="kevo"
      bubbleText="Günlük hedefin ne?"
      title="Ne kadar zamanın var?"
      subtitle="Sana hatırlatma gönderirim. İstediğin zaman değiştirebilirsin."
      ctaText="HEDEFİMİ BELİRLEDİM"
      onCta={() => router.push("/intro/commitment")}
      ctaDisabled={!sel}
    >
      {OPTIONS.map((o) => (
        <OptionCard
          key={o.id}
          emoji={o.emoji}
          label={o.label}
          sublabel={o.sub}
          isActive={sel === o.id}
          onPress={() => pick(o.id)}
        />
      ))}
    </OnboardingScreen>
  );
}
