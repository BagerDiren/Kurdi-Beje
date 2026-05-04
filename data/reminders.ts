/**
 * 🔔 HATIRLATMA SİSTEMİ
 *
 * expo-notifications ile günlük lokal bildirim planlayıcı.
 *
 * Kullanım:
 *   • requestPermission() — kullanıcıdan izin iste (iOS/Android)
 *   • scheduleDailyReminder({hour, minute, lang}) — her gün belirtilen saatte
 *   • cancelAllReminders() — tüm zamanlanmışları iptal
 *   • getStoredSettings() / saveStoredSettings() — AsyncStorage'da saklar
 *
 * AsyncStorage anahtarı: "kurdibeje:reminder"
 *
 * iOS için info.plist permission "Bildirimler" otomatik istenir.
 * Android için kanal otomatik kurulur.
 */
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import type { LangCode } from "./languages";

const STORAGE_KEY = "kurdibeje:reminder";

export type ReminderSettings = {
  enabled: boolean;
  hour: number;     // 0-23
  minute: number;   // 0-59
};

export const DEFAULT_REMINDER: ReminderSettings = {
  enabled: false,
  hour: 19,    // varsayılan akşam 19:00
  minute: 0,
};

// =====================================================================
//  Bildirim handler — uygulama ön planda iken davranış
// =====================================================================

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// =====================================================================
//  Bildirim metinleri (3 dilde)
// =====================================================================

const NOTIFICATION_TEXT: Record<LangCode, { title: string; body: string }[]> = {
  tr: [
    { title: "🔥 Streak'ini koru!", body: "Bugünkü Kürtçe dersini henüz yapmadın." },
    { title: "📚 Kurmancî zamanı", body: "Bir kahveyle 5 dakikalık derse ne dersin?" },
    { title: "⚡ XP topla!", body: "Hadi bir ders bitir, seviye atlamaya yakınsın." },
    { title: "🌟 Kev seni bekliyor", body: "Yeni kelimeler öğrenmen için seni bekliyor." },
  ],
  en: [
    { title: "🔥 Keep your streak!", body: "You haven't done today's Kurdish lesson yet." },
    { title: "📚 Kurmancî time", body: "How about a 5-minute lesson with your coffee?" },
    { title: "⚡ Earn XP!", body: "Finish one lesson — you're close to leveling up." },
    { title: "🌟 Kev is waiting for you", body: "Come learn some new words." },
  ],
  ku: [
    { title: "🔥 Rêza xwe biparêze!", body: "Te dersa Kurdî ya îro hêj nekiriye." },
    { title: "📚 Demê Kurmancî", body: "Bi qehwekê re dersek 5 deqîqeyî çawa ye?" },
    { title: "⚡ XP kom bike!", body: "Dersekê biqedîne — tu nêzîkî astekê yî." },
    { title: "🌟 Kev li bende te ye", body: "Were peyvên nû fêr bibe." },
  ],
};

const randomNotification = (lang: LangCode) => {
  const arr = NOTIFICATION_TEXT[lang];
  return arr[Math.floor(Math.random() * arr.length)];
};

// =====================================================================
//  PUBLIC API
// =====================================================================

/** Kullanıcıdan bildirim izni iste. Döner: granted true/false. */
export async function requestPermission(): Promise<boolean> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    if (Platform.OS === "android") {
      // Android için kanal kur
      await Notifications.setNotificationChannelAsync("daily-reminder", {
        name: "Günlük Hatırlatma",
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    return status === "granted";
  } catch {
    return false;
  }
}

/**
 * Günlük tekrarlayan bildirim planla.
 * Belirtilen saat ve dakikada her gün tetiklenir.
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  lang: LangCode = "tr",
): Promise<string | null> {
  try {
    // Önce eski hatırlatmaları temizle
    await Notifications.cancelAllScheduledNotificationsAsync();

    const text = randomNotification(lang);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: text.title,
        body: text.body,
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return id;
  } catch {
    return null;
  }
}

/** Tüm hatırlatmaları iptal et. */
export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

// =====================================================================
//  AsyncStorage persist
// =====================================================================

export async function loadReminderSettings(): Promise<ReminderSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_REMINDER;
    return JSON.parse(raw) as ReminderSettings;
  } catch {
    return DEFAULT_REMINDER;
  }
}

export async function saveReminderSettings(s: ReminderSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

/**
 * Settings'i hem kaydet, hem ona göre bildirimi güncelle.
 * enabled=true ise scheduleDailyReminder, false ise cancel.
 */
export async function applyReminderSettings(
  s: ReminderSettings,
  lang: LangCode,
): Promise<{ ok: boolean; permissionDenied?: boolean }> {
  await saveReminderSettings(s);
  if (!s.enabled) {
    await cancelAllReminders();
    return { ok: true };
  }
  const granted = await requestPermission();
  if (!granted) return { ok: false, permissionDenied: true };
  const id = await scheduleDailyReminder(s.hour, s.minute, lang);
  return { ok: id !== null };
}
