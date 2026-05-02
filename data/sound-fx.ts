/**
 * Ses efektleri — TTS Speech motoru üzerinden farklı pitch/hız ile
 * UI feedback sesleri üretir. Asset dosyası gerekmez.
 *
 * Kullanım:
 *   playFx("tap")      → kısa "ti" zili
 *   playFx("success")  → coşkulu "Aferin!"
 *   playFx("fail")     → yumuşak "Olsun"
 *   playFx("celebrate")→ uzun "Harika iş!"
 *
 * Tüm fonksiyonlar non-blocking. Hata olursa sessizce yutar.
 */
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { randomPraise, randomEncourage, toTurkishPhonetic, speakOptionsForStyle } from "./phonetics";

export type FxKey = "tap" | "success" | "fail" | "celebrate" | "swoosh";

let currentlySpeaking = false;

export function speakKurmanci(
  text: string,
  style: "normal" | "slow" | "happy" | "praise" | "sad" = "normal",
  onDone?: () => void,
) {
  const phonetic = toTurkishPhonetic(text);
  const opts = speakOptionsForStyle(style);
  try {
    Speech.stop();
    Speech.speak(phonetic, {
      ...opts,
      onDone: () => {
        currentlySpeaking = false;
        onDone?.();
      },
      onError: () => {
        currentlySpeaking = false;
        onDone?.();
      },
    });
    currentlySpeaking = true;
  } catch {
    currentlySpeaking = false;
  }
}

export function playFx(key: FxKey) {
  try {
    switch (key) {
      case "tap":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Speech.stop();
        Speech.speak(randomPraise(), { language: "tr-TR", rate: 1.0, pitch: 1.3 });
        break;
      case "fail":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Speech.stop();
        Speech.speak(randomEncourage(), { language: "tr-TR", rate: 0.85, pitch: 0.9 });
        break;
      case "celebrate":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Speech.stop();
        Speech.speak("Tebrikler!", { language: "tr-TR", rate: 0.95, pitch: 1.35 });
        break;
      case "swoosh":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
    }
  } catch {}
}

export function stopAllSpeech() {
  try { Speech.stop(); } catch {}
  currentlySpeaking = false;
}
