import { View, Pressable, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { DuoButton, SpeechBubble } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import { DUO } from "@/data/duo-colors";
import { TYPO } from "@/data/typography";

/**
 * Intro 2 — birkaç kısa soru uyarısı, Kevo öğretmen pozunda (kağıt + kalem).
 */
export default function IntroQuestions() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.bubbleWrap}>
            <SpeechBubble tailOffset={50}>
              <Text style={styles.bubbleText}>
                Sana özel bir plan hazırlamam için{" "}
                <Text style={styles.bubbleBold}>3 kısa soru</Text> soracağım.
              </Text>
            </SpeechBubble>
          </View>

          <View style={styles.mascotWrap}>
            <KevoMascot
              size={180}
              mood="happy"
              speaking
              idle
              action="teach"
            />
          </View>
        </View>

        <View style={styles.actions}>
          <DuoButton onPress={() => router.push("/intro/level")}>
            Tamam, başlayalım
          </DuoButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DUO.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingBottom: 16 },
  topBar: { height: 48, justifyContent: "center" },
  backArrow: {
    fontSize: 28,
    color: DUO.textLight,
    fontWeight: "600",
    width: 40,
  },
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
  actions: { paddingBottom: 8 },
});
