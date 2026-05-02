import { router } from "expo-router";

import { OnboardingScreen, OptionCard } from "@/components/kids/onboarding-screen";
import { useApp } from "@/data/app-context";

const LEVELS = [
  { id: "a1" as const, emoji: "🌱", label: "A1 · Başlangıç", sub: "Hiç bilmeyenler için" },
  { id: "a2" as const, emoji: "🌿", label: "A2 · Temel",     sub: "Birkaç kelime biliyorum" },
  { id: "b1" as const, emoji: "🌳", label: "B1 · Orta",      sub: "Cümle kurabiliyorum" },
  { id: "b2" as const, emoji: "🏔️", label: "B2 · İleri",     sub: "Akıcı konuşuyorum" },
];

export default function LevelScreen() {
  const { lvl, setLvl } = useApp();

  return (
    <OnboardingScreen
      progress={0.7}
      onBack={() => router.back()}
      character="sterk"
      bubbleText="Kürtçe seviyeni seç, sana özel başlayalım!"
      title="Seviyeni seç"
      subtitle="Endişelenme, istediğin zaman değiştirebilirsin."
      ctaText="HADİ BAŞLAYALIM"
      onCta={() => lvl && router.replace("/(tabs)")}
      ctaDisabled={!lvl}
    >
      {LEVELS.map((lv) => (
        <OptionCard
          key={lv.id}
          emoji={lv.emoji}
          label={lv.label}
          sublabel={lv.sub}
          isActive={lvl === lv.id}
          onPress={() => setLvl(lv.id)}
        />
      ))}
    </OnboardingScreen>
  );
}
