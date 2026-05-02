import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { DuoButton } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import { DUO } from "@/data/duo-colors";
import { TYPO } from "@/data/typography";
import { useApp } from "@/data/app-context";

/**
 * Karşılama ekranı — Türkçe odaklı.
 * Amaç: Türklere Kurmancî öğretmek. UI dili Türkçe, hedef dil Kurmancî.
 */
export default function WelcomeScreen() {
  const { setAge, setLvl } = useApp();

  const skipToTabs = () => {
    // "Hesabım var" → varsayılan yetişkin moduna düş
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
          <Text style={styles.tagline}>Kurmancî öğrenmenin en eğlenceli yolu</Text>
          <Text style={styles.taglineSub}>Belaş fêr bibe · Ücretsiz öğren</Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.actions}>
          <DuoButton onPress={() => router.push("/onboarding/mode")}>
            BAŞLA
          </DuoButton>
          <DuoButton variant="secondary" onPress={skipToTabs}>
            Zaten hesabım var
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
    gap: 8,
  },
  brand: {
    ...TYPO.h1,
    color: DUO.green,
    marginTop: 8,
  },
  tagline: {
    ...TYPO.bodyLg,
    color: DUO.textStrong,
    textAlign: "center",
    fontWeight: "700",
    marginTop: 6,
  },
  taglineSub: {
    fontSize: 13,
    color: DUO.textMuted,
    textAlign: "center",
    fontWeight: "500",
  },
  actions: {
    gap: 12,
    paddingBottom: 8,
  },
});
