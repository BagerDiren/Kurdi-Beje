import { useEffect, useRef } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { DuoButton, SpeechBubble } from "@/components/ui-kit";
import { KevoMascot, type KevoHandle } from "@/components/kevo-mascot";
import { DUO } from "@/data/duo-colors";
import { TYPO } from "@/data/typography";

/**
 * Intro 1 — Kevo kendini tanıtır, el sallayarak.
 */
export default function IntroHello() {
  const kevoRef = useRef<KevoHandle>(null);

  useEffect(() => {
    // Sayfa yüklenince Kevo el sallar
    const t = setTimeout(() => kevoRef.current?.wave(), 500);
    return () => clearTimeout(t);
  }, []);

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
                Merhaba! Ben <Text style={styles.bubbleBold}>Kevo</Text>!{"\n"}
                <Text style={{ fontSize: 14, fontWeight: "600" }}>
                  Sana Kürtçe öğreteceğim 🎉
                </Text>
              </Text>
            </SpeechBubble>
          </View>

          <View style={styles.mascotWrap}>
            <KevoMascot
              ref={kevoRef}
              size={180}
              mood="happy"
              speaking
              idle
              onPress={() => kevoRef.current?.wave()}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <DuoButton onPress={() => router.push("/intro/questions")}>
            Devam et
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
    color: DUO.green,
  },
  mascotWrap: { alignItems: "center" },
  actions: { paddingBottom: 8 },
});
