/**
 * Ses efektleri — feedback sesleri.
 *
 * v3 (kullanıcı isteği): "aferim" sesleri yerine MELODI.
 *   • playFx("success") → C5→E5 chime (sentetik, asset/sounds/correct.wav)
 *   • playFx("fail")    → düşen 220→165Hz buzz (asset/sounds/wrong.wav)
 *   • playFx("celebrate") → success chime + haptic
 *   • playFx("tap")     → sadece haptic
 *
 * Sesler Python ile üretildi (sin + harmonics + envelope), telifsiz.
 * expo-av Sound API ile bundle'dan yüklenir.
 *
 * Kelime telaffuzu için speakKurmanci() hâlâ TTS kullanır.
 */
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { toTurkishPhonetic, speakOptionsForStyle } from "./phonetics";

export type FxKey = "tap" | "success" | "fail" | "celebrate" | "swoosh";

let currentlySpeaking = false;

// =====================================================================
//  MELODI ASSET'LERİ (sentetik WAV, ~30KB toplam)
// =====================================================================

let correctSound: Audio.Sound | null = null;
let wrongSound: Audio.Sound | null = null;
let initialized = false;

async function initSounds() {
  if (initialized) return;
  initialized = true;
  try {
    // iOS sessiz modda da ses çalsın
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
    });
    const c = new Audio.Sound();
    await c.loadAsync(require("../assets/sounds/correct.wav"));
    correctSound = c;
    const w = new Audio.Sound();
    await w.loadAsync(require("../assets/sounds/wrong.wav"));
    wrongSound = w;
  } catch (e) {
    // Asset yüklenmedi (dev modunda nadiren olur) — sessiz devam
    console.warn("[sound-fx] sound assets failed to load", e);
  }
}

async function playMelody(s: Audio.Sound | null) {
  if (!s) return;
  try {
    await s.setPositionAsync(0);
    await s.playAsync();
  } catch {}
}

// İlk kullanımdan önce arka planda yükle
initSounds();

// =====================================================================
//  KELİME TELAFFUZU (TTS — değişmedi)
// =====================================================================

export function speakKurmanci(
  text: string,
  style: "normal" | "slow" | "happy" | "praise" | "sad" | "kid" | "kidSlow" = "normal",
  onDone?: () => void,
) {
  const phonetic = toTurkishPhonetic(text);
  const opts = speakOptionsForStyle(style);
  try {
    Speech.stop();
    Speech.speak(phonetic, {
      ...opts,
      volume: 1.0,
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

export function speakKurmanciKid(text: string, onDone?: () => void) {
  speakKurmanci(text, "kidSlow", onDone);
}

// =====================================================================
//  EFEKT SESLERİ (melodi + haptic)
// =====================================================================

export function playFx(key: FxKey) {
  try {
    switch (key) {
      case "tap":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        break;
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        playMelody(correctSound);
        break;
      case "fail":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        playMelody(wrongSound);
        break;
      case "celebrate":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        playMelody(correctSound);
        // Kutlamada chime'ı 2 kez peş peşe çal
        setTimeout(() => playMelody(correctSound), 400);
        break;
      case "swoosh":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        break;
    }
  } catch {}
}

export function stopAllSpeech() {
  try { Speech.stop(); } catch {}
  currentlySpeaking = false;
}
