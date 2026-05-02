import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DuoButton,
  OnboardingHeader,
  SpeechBubble,
} from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import { DUO } from "@/data/duo-colors";
import { TYPO } from "@/data/typography";

/**
 * "Niha em rutîna fêrbûnê bi cih bikin!" — hedefe geçiş ekranı.
 */
export default function IntroRoutine() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <OnboardingHeader progress={0.6} onBack={() => router.back()} />

        <View style={styles.hero}>
          <View style={styles.bubbleWrap}>
            <SpeechBubble tailOffset={50}>
              <Text style={styles.bubbleText}>
                Şimdi bir <Text style={styles.bubbleBold}>günlük rutin</Text> oluşturalım!
              </Text>
            </SpeechBubble>
          </View>

          <View style={styles.mascotWrap}>
            <KevoMascot size={180} mood="happy" speaking action="teach" idle />
          </View>
        </View>

        <DuoButton onPress={() => router.push("/intro/goal")}>
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
    color: DUO.mediumPurple,
  },
  mascotWrap: { alignItems: "center" },
});
