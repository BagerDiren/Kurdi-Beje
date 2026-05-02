import { useState } from "react";
import { router } from "expo-router";

import { OnboardingScreen, OptionCard } from "@/components/kids/onboarding-screen";
import { useApp, type ProficiencyLevel } from "@/data/app-context";

const OPTIONS: { id: ProficiencyLevel; emoji: string; label: string; sub: string }[] = [
  { id: "new",      emoji: "🌱", label: "Hiç bilmiyorum",       sub: "Sıfırdan başlamak istiyorum" },
  { id: "basic",    emoji: "👋", label: "Birkaç kelime",         sub: "Selam, teşekkür gibi" },
  { id: "simple",   emoji: "💬", label: "Basit cümleler",        sub: "Günlük konuşma kurabilirim" },
  { id: "varied",   emoji: "📖", label: "Farklı konular",        sub: "Konuşabiliyorum" },
  { id: "advanced", emoji: "🎓", label: "Akıcı konuşuyorum",     sub: "Kelime hazinesini geliştirmek istiyorum" },
];

export default function IntroLevel() {
  const { proficiency, setProficiency } = useApp();
  const [sel, setSel] = useState<ProficiencyLevel | null>(proficiency);

  const pick = (id: ProficiencyLevel) => {
    setSel(id);
    setProficiency(id);
  };

  return (
    <OnboardingScreen
      progress={0.45}
      onBack={() => router.back()}
      character="kevo"
      bubbleText="Kürtçe seviyen ne?"
      title="Şu an ne durumdasın?"
      subtitle="Sana uygun başlangıç noktasını seçeceğim."
      ctaText="DEVAM ET"
      onCta={() => router.push("/intro/level-done")}
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
