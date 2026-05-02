import { useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DuoButton,
  OnboardingHeader,
  SpeechBubble,
} from "@/components/ui-kit";
import { KevoMascot, type KevoHandle } from "@/components/kevo-mascot";
import { DUO } from "@/data/duo-colors";
import { TYPO } from "@/data/typography";
import { useApp } from "@/data/app-context";

/**
 * "Ev, di hefteya te ya yekem de X peyv tê wateya!" — motivasyon ekranı.
 * Kevo cheer eder (yukarı kanatlar + zıplama).
 * Kelime sayısı dailyGoal'e göre hesaplanır: dk × 2 peyv × 5 gün.
 */
export default function IntroCommitment() {
  const { dailyGoal, setAge, setLvl } = useApp();
  const kevoRef = useRef<KevoHandle>(null);
  const words = (dailyGoal ?? 10) * 2 * 5;

  useEffect(() => {
    const t1 = setTimeout(() => kevoRef.current?.cheer(), 400);
    const t2 = setTimeout(() => kevoRef.current?.clap(2), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <OnboardingHeader progress={0.9} onBack={() => router.back()} />

        <View style={styles.hero}>
          <View style={styles.bubbleWrap}>
            <SpeechBubble tailOffset={50}>
              <Text style={styles.bubbleText}>
                Bu yolla ilk hafta{"\n"}
                <Text style={styles.bubbleBold}>{words} kelime</Text> öğreneceksin! 🎯
              </Text>
            </SpeechBubble>
          </View>

          <View style={styles.mascotWrap}>
            <KevoMascot ref={kevoRef} size={180} mood="excited" speaking idle />
          </View>
        </View>

        <DuoButton
          onPress={() => {
            setAge("adult");
            setLvl("a1");
            router.replace("/(tabs)");
          }}
        >
Hadi başlayalım!
        </DuoButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DUO.bg },
  content: { flex: 1, paddingHorizontal: 20, paddingBottom: 16 },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  bubbleWrap: { width: "92%" },
  bubbleText: {
    ...TYPO.bubble,
    color: DUO.textStrong,
    textAlign: "center",
  },
  bubbleBold: {
    ...TYPO.bubbleBold,
    color: DUO.mediumPurple,
  },
  mascotWrap: { alignItems: "center" },
});
