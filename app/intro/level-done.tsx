import { router } from "expo-router";
import { OnboardingScreen } from "@/components/kids/onboarding-screen";

export default function IntroLevelDone() {
  return (
    <OnboardingScreen
      progress={0.55}
      onBack={() => router.back()}
      character="kevo"
      bubbleText="Harika! Şimdi sana özel bir plan hazırlıyorum 🎯"
      title="Mükemmel!"
      subtitle="En baştan başlayalım — adım adım ilerleyeceğiz."
      ctaText="DEVAM ET"
      onCta={() => router.push("/intro/routine")}
    />
  );
}
