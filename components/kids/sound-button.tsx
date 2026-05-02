import { useState } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue, useAnimatedStyle, withSequence, withTiming, withRepeat,
} from "react-native-reanimated";

import { toTurkishPhonetic, speakOptionsForStyle } from "@/data/phonetics";

type Props = {
  text: string;
  size?: "sm" | "md" | "lg";
  color?: string;
  disabled?: boolean;
};

/**
 * Sesli okuma butonu — Kürtçe metni Türkçe TTS ile söyletir.
 * Kürtçe için TTS yok, ama Türkçe motoru fonetik olarak yakın okur.
 * Tıklayınca: haptic + ses + dalga animasyonu.
 */
export function SoundButton({ text, size = "md", color = "#1F6B41", disabled }: Props) {
  const [speaking, setSpeaking] = useState(false);

  const pulse1 = useSharedValue(0);
  const pulse2 = useSharedValue(0);

  const dim = size === "lg" ? 64 : size === "md" ? 48 : 36;
  const iconSize = size === "lg" ? 28 : size === "md" ? 22 : 16;

  const speak = async () => {
    if (disabled || speaking) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    // Pulse animasyonları başlat
    setSpeaking(true);
    pulse1.value = withRepeat(withTiming(1, { duration: 800 }), -1, false);
    pulse2.value = withRepeat(
      withSequence(withTiming(0, { duration: 200 }), withTiming(1, { duration: 800 })),
      -1, false
    );

    // Çocuk dostu: yüksek pitch, yavaş tane tane okur
    const phonetic = toTurkishPhonetic(text);
    const opts = speakOptionsForStyle("kidSlow");
    Speech.stop();
    Speech.speak(phonetic, {
      ...opts,
      volume: 1.0,
      onDone: () => {
        setSpeaking(false);
        pulse1.value = 0;
        pulse2.value = 0;
      },
      onError: () => {
        setSpeaking(false);
        pulse1.value = 0;
        pulse2.value = 0;
      },
    });
  };

  const ring1 = useAnimatedStyle(() => ({
    opacity: 1 - pulse1.value,
    transform: [{ scale: 1 + pulse1.value * 0.6 }],
  }));
  const ring2 = useAnimatedStyle(() => ({
    opacity: 1 - pulse2.value,
    transform: [{ scale: 1 + pulse2.value * 0.6 }],
  }));

  return (
    <View style={{ width: dim + 24, height: dim + 24, alignItems: "center", justifyContent: "center" }}>
      {speaking && (
        <>
          <Animated.View style={[styles.ring, { width: dim + 16, height: dim + 16, borderColor: color }, ring1]} />
          <Animated.View style={[styles.ring, { width: dim + 16, height: dim + 16, borderColor: color }, ring2]} />
        </>
      )}
      <Pressable
        onPress={speak}
        disabled={disabled}
        style={({ pressed }) => [
          styles.btn,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: color,
            opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
            transform: pressed ? [{ scale: 0.95 }] : [],
          },
        ]}
      >
        <Text style={{ fontSize: iconSize }}>🔊</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 3,
  },
});
