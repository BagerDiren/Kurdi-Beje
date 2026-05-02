import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { DuoButton } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import { DUO } from "@/data/duo-colors";
import { TYPO } from "@/data/typography";
import { useApp } from "@/data/app-context";

/**
 * Giriş ekranı — Duolingo Ekran 1 karşılığı, tamamen Kurmancî.
 * Mimari: üst boşluk → Kevo + logo + slogan → alt boşluk → aksiyon butonları.
 */
export default function WelcomeScreen() {
  const { setAge, setLvl } = useApp();

  const skipToTabs = () => {
    // "Hesabê min heye" — onboarding atlanıyor, default yetişkin/A1 olarak gir
    setAge("adult");
    setLvl("a1");
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.spacer} />

        <View style={styles.hero}>
          <KevoMascot size={200} mood="happy" idle />
          <Text style={styles.brand}>KurdîBêje</Text>
          <Text style={styles.tagline}>Belaş fêr bibe. Herdem.</Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.actions}>
          <DuoButton onPress={() => router.push("/intro/hello")}>
            Dest pê bike
          </DuoButton>
          <DuoButton variant="secondary" onPress={skipToTabs}>
            Hesabê min heye
          </DuoButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DUO.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  spacer: { flex: 1 },
  hero: {
    alignItems: "center",
    gap: 12,
  },
  brand: {
    ...TYPO.h1,
    color: DUO.green,
    marginTop: 8,
  },
  tagline: {
    ...TYPO.bodyLg,
    color: DUO.textMuted,
    textAlign: "center",
  },
  actions: {
    gap: 12,
    paddingBottom: 8,
  },
});
