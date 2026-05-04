import { router } from "expo-router";

import { OnboardingScreen, OptionCard } from "@/components/kids/onboarding-screen";
import { useApp } from "@/data/app-context";
import { LANGS } from "@/data/languages";

export default function LanguageScreen() {
  const { lang, setLang } = useApp();

  return (
    <OnboardingScreen
      progress={0.4}
      onBack={() => router.back()}
      character="kevo"
      bubbleText="Hangi dilde uygulamayı kullanmak istersin?"
      title="Dil seç"
      subtitle="Uygulamanın menü ve çeviri dili. Kürtçe öğretimi her durumda devam eder."
      ctaText="DEVAM ET"
      onCta={() => router.push("/onboarding/level")}
      ctaDisabled={!lang}
    >
      {LANGS.map((l) => (
        <OptionCard
          key={l.code}
          emoji={l.flag}
          label={l.name}
          sublabel={l.nativeName}
          isActive={lang === l.code}
          onPress={() => setLang(l.code)}
        />
      ))}
    </OnboardingScreen>
  );
}
