import { router } from "expo-router";
import { OnboardingScreen } from "@/components/kids/onboarding-screen";

export default function IntroRoutine() {
  return (
    <OnboardingScreen
      progress={0.65}
      onBack={() => router.back()}
      character="roj"
      bubbleText="Düzenli pratik en iyi sonucu verir 💪"
      title="Bir günlük rutin oluşturalım"
      subtitle="Her gün biraz pratik yaparak hızla ilerleyebilirsin."
      ctaText="DEVAM ET"
      onCta={() => router.push("/intro/goal")}
    />
  );
}
