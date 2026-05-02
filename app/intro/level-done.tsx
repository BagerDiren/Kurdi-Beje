import { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DuoButton,
  OnboardingHeader,
} from "@/components/ui-kit";
import { KevoMascot, type KevoHandle } from "@/components/kevo-mascot";
import { SpeechBubble } from "@/components/ui-kit/speech-bubble";
import { Text, StyleSheet as RNStyleSheet } from "react-native";
import { DUO } from "@/data/duo-colors";
import { TYPO } from "@/data/typography";

/**
 * Seviye sorusundan sonraki geçiş.
 * "Baş e, em ji destpêkê dest pê bikin!" — Kevo alkışlayarak onaylıyor.
 */
export default function IntroLevelDone() {
  const kevoRef = useRef<KevoHandle>(null);

  useEffect(() => {
    // Ekran yüklendiğinde Kevo alkışlasın
    const t = setTimeout(() => kevoRef.current?.clap(3), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <OnboardingHeader progress={0.5} onBack={() => router.back()} />

        <View style={styles.hero}>
          <View style={styles.bubbleWrap}>
            <SpeechBubble tailOffset={50}>
              <Text style={styles.bubbleText}>
                Harika!{"\n"}
                <Text style={styles.bubbleBold}>En baştan</Text> başlayalım!
              </Text>
            </SpeechBubble>
          </View>

          <View style={styles.mascotWrap}>
            <KevoMascot ref={kevoRef} size={180} mood="excited" speaking idle />
          </View>
        </View>

        <DuoButton onPress={() => router.push("/intro/routine")}>
          Devam et
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
    color: DUO.green,
  },
  mascotWrap: { alignItems: "center" },
});
