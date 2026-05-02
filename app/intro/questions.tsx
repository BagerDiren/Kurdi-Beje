import { router } from "expo-router";
import { OnboardingScreen } from "@/components/kids/onboarding-screen";

export default function IntroQuestions() {
  return (
    <OnboardingScreen
      progress={0.30}
      onBack={() => router.back()}
      character="sterk"
      bubbleText="Sana özel bir plan hazırlamam için 3 kısa soru!"
      title="Önce seni tanıyalım"
      subtitle="Cevaplarına göre dersleri kişiselleştirebilirim."
      ctaText="TAMAM, BAŞLAYALIM"
      onCta={() => router.push("/intro/level")}
    />
  );
}
