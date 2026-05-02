import { router } from "expo-router";
import { OnboardingScreen } from "@/components/kids/onboarding-screen";

export default function IntroHello() {
  return (
    <OnboardingScreen
      progress={0.15}
      onBack={() => router.back()}
      character="kevo"
      bubbleText="Merhaba! Ben Kevo, sana Kürtçe öğreteceğim 🎉"
      title="Tanıştığımıza memnun oldum!"
      subtitle="Sana özel bir öğrenme planı hazırlayacağım."
      ctaText="DEVAM ET"
      onCta={() => router.push("/intro/questions")}
    />
  );
}
