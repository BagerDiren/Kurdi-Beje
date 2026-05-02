import { router } from "expo-router";

import { OnboardingScreen, OptionCard } from "@/components/kids/onboarding-screen";
import { useApp } from "@/data/app-context";
import { LANGS } from "@/data/languages";

const FLAGS: Record<string, string> = {
  tr: "🇹🇷", en: "🇬🇧", ku: "🟢", ar: "🇸🇦", fa: "🇮🇷",
  fr: "🇫🇷", sv: "🇸🇪", ru: "🇷🇺",
};

export default function LanguageScreen() {
  const { lang, setLang } = useApp();

  return (
    <OnboardingScreen
      progress={0.4}
      onBack={() => router.back()}
      character="kevo"
      bubbleText="Hangi dilde uygulamayı kullanmak istersin?"
      title="Dil seç"
      subtitle="Uygulamanın menü dili. Kürtçe öğretimi her durumda devam eder."
      ctaText="DEVAM ET"
      onCta={() => router.push("/onboarding/level")}
      ctaDisabled={!lang}
    >
      {LANGS.map((l) => (
        <OptionCard
          key={l.code}
          emoji={FLAGS[l.code] ?? "🌐"}
          label={l.name}
          sublabel={l.code.toUpperCase()}
          isActive={lang === l.code}
          onPress={() => setLang(l.code)}
        />
      ))}
    </OnboardingScreen>
  );
}
