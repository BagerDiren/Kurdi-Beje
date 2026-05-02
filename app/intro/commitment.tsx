import { router } from "expo-router";
import { OnboardingScreen } from "@/components/kids/onboarding-screen";
import { useApp } from "@/data/app-context";

export default function IntroCommitment() {
  const { dailyGoal, setAge, setLvl } = useApp();
  const words = (dailyGoal ?? 10) * 2 * 5; // ~2 kelime/dk × 5 gün

  const start = () => {
    setAge("adult");
    setLvl("a1");
    router.replace("/(tabs)");
  };

  return (
    <OnboardingScreen
      progress={1.0}
      onBack={() => router.back()}
      character="sterk"
      bubbleText={`İlk hafta ${words} yeni kelime öğreneceksin! 🌟`}
      title="Hazırsın!"
      subtitle="Hadi ilk dersini birlikte yapalım. Söz veriyorum, çok eğleneceksin!"
      ctaText="HADİ BAŞLAYALIM"
      onCta={start}
    />
  );
}
