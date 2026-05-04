/**
 * 🔔 Hatırlatma kartı — Profil ekranına eklenir.
 *
 * Toggle + saat seçici (saat & dakika).
 * Toggle açıkken expo-notifications izni ister, günlük hatırlatma planlar.
 */
import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from "react-native";

import { DUO, DUO_RADIUS, DUO_SPACING, DUO_TYPO } from "./duo-tokens";
import {
  loadReminderSettings, applyReminderSettings,
  type ReminderSettings, DEFAULT_REMINDER,
} from "@/data/reminders";
import { useApp } from "@/data/app-context";
import type { LangCode } from "@/data/languages";

const RC_UI = {
  title:        { tr: "🔔 Günlük Hatırlatma",          en: "🔔 Daily Reminder",            ku: "🔔 Bîranîna Rojane" },
  sub:          { tr: "Her gün bir hatırlatma al",     en: "Get a daily reminder",        ku: "Her roj bîranînekê bistîne" },
  on:           { tr: "Açık",                          en: "On",                          ku: "Vekirî" },
  off:          { tr: "Kapalı",                        en: "Off",                         ku: "Girtî" },
  time:         { tr: "Saat",                          en: "Time",                        ku: "Demjimêr" },
  pickTime:     { tr: "Saati değiştir",                en: "Change time",                 ku: "Demjimêrê biguherîne" },
  permDenied:   { tr: "Bildirim izni reddedildi",      en: "Notification permission denied", ku: "Destûra bîranînê hate red kirin" },
  permDeniedSub:{ tr: "Ayarlardan açabilirsin.",       en: "You can enable it from Settings.", ku: "Tu dikarî ji Mîhengan vekî." },
  pickerTitle:  { tr: "Hatırlatma saati",               en: "Reminder time",                ku: "Demjimêra bîranînê" },
  cancel:       { tr: "VAZGEÇ",                         en: "CANCEL",                       ku: "DEV BERDE" },
  ok:           { tr: "TAMAM",                          en: "OK",                           ku: "BAŞ E" },
} as const;
const u = (k: keyof typeof RC_UI, lang: LangCode): string => RC_UI[k][lang];

export function ReminderCard() {
  const ctx = useApp();
  const lang: LangCode = (ctx.lang as LangCode) ?? "tr";
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDER);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [permError, setPermError] = useState(false);

  useEffect(() => {
    loadReminderSettings().then(setSettings);
  }, []);

  const toggle = async () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    setPermError(false);
    const result = await applyReminderSettings(newSettings, lang);
    if (!result.ok && result.permissionDenied) {
      // Geri al
      setSettings({ ...newSettings, enabled: false });
      setPermError(true);
    }
  };

  const setTime = async (hour: number, minute: number) => {
    const newSettings = { ...settings, hour, minute };
    setSettings(newSettings);
    setPickerOpen(false);
    if (newSettings.enabled) {
      await applyReminderSettings(newSettings, lang);
    }
  };

  const formatTime = (h: number, m: number) =>
    `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

  return (
    <View style={s.card}>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{u("title", lang)}</Text>
          <Text style={s.sub}>{u("sub", lang)}</Text>
        </View>
        <Pressable
          onPress={toggle}
          style={[s.toggle, settings.enabled && s.toggleOn]}
        >
          <View style={[s.toggleThumb, settings.enabled && s.toggleThumbOn]} />
        </Pressable>
      </View>

      {permError && (
        <View style={s.errorBox}>
          <Text style={s.errorTitle}>{u("permDenied", lang)}</Text>
          <Text style={s.errorSub}>{u("permDeniedSub", lang)}</Text>
        </View>
      )}

      {settings.enabled && (
        <Pressable onPress={() => setPickerOpen(true)} style={s.timeRow}>
          <Text style={s.timeLabel}>{u("time", lang)}</Text>
          <Text style={s.timeValue}>{formatTime(settings.hour, settings.minute)}</Text>
          <Text style={s.timeChange}>{u("pickTime", lang)} ›</Text>
        </Pressable>
      )}

      {/* Saat seçici modalı */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>{u("pickerTitle", lang)}</Text>
            <View style={s.pickerRow}>
              <ScrollPicker
                value={settings.hour}
                max={23}
                onChange={(v) => setSettings({ ...settings, hour: v })}
              />
              <Text style={s.colon}>:</Text>
              <ScrollPicker
                value={settings.minute}
                max={59}
                step={5}
                onChange={(v) => setSettings({ ...settings, minute: v })}
              />
            </View>
            <View style={s.modalBtns}>
              <Pressable onPress={() => setPickerOpen(false)} style={[s.modalBtn, s.modalBtnGhost]}>
                <Text style={s.modalBtnGhostTxt}>{u("cancel", lang)}</Text>
              </Pressable>
              <Pressable onPress={() => setTime(settings.hour, settings.minute)} style={[s.modalBtn, s.modalBtnOk]}>
                <Text style={s.modalBtnOkTxt}>{u("ok", lang)}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// =====================================================================
//  Mini ScrollPicker — sayı seçici (24 saat / 60 dk için)
// =====================================================================

function ScrollPicker({
  value, max, step = 1, onChange,
}: {
  value: number; max: number; step?: number; onChange: (v: number) => void;
}) {
  const items: number[] = [];
  for (let i = 0; i <= max; i += step) items.push(i);

  return (
    <ScrollView
      style={s.picker}
      showsVerticalScrollIndicator={false}
    >
      {items.map((it) => (
        <Pressable key={it} onPress={() => onChange(it)} style={s.pickerItem}>
          <Text style={[s.pickerTxt, it === value && s.pickerTxtActive]}>
            {it.toString().padStart(2, "0")}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: DUO.snow,
    borderWidth: 2, borderColor: DUO.swan,
    borderRadius: DUO_RADIUS.lg,
    padding: DUO_SPACING.md,
    gap: DUO_SPACING.sm,
  },
  row: { flexDirection: "row", alignItems: "center", gap: DUO_SPACING.md },
  title: { ...DUO_TYPO.h2, color: DUO.eel },
  sub: { ...DUO_TYPO.body, color: DUO.wolf, marginTop: 2 },

  toggle: {
    width: 52, height: 30, borderRadius: 999,
    backgroundColor: DUO.swan,
    padding: 3,
  },
  toggleOn: { backgroundColor: DUO.green },
  toggleThumb: {
    width: 24, height: 24, borderRadius: 999,
    backgroundColor: DUO.snow,
  },
  toggleThumbOn: { transform: [{ translateX: 22 }] },

  errorBox: {
    backgroundColor: "#FFEBEE", padding: DUO_SPACING.sm,
    borderRadius: DUO_RADIUS.sm,
    borderLeftWidth: 4, borderLeftColor: DUO.cardinal,
  },
  errorTitle: { ...DUO_TYPO.body, color: DUO.cardinalDark },
  errorSub: { ...DUO_TYPO.caption, color: DUO.wolf, marginTop: 2 },

  timeRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: DUO_SPACING.sm,
    borderTopWidth: 1, borderTopColor: DUO.swan,
    marginTop: DUO_SPACING.sm,
    gap: DUO_SPACING.md,
  },
  timeLabel: { ...DUO_TYPO.body, color: DUO.wolf },
  timeValue: { ...DUO_TYPO.h2, color: DUO.macaw, flex: 1 },
  timeChange: { ...DUO_TYPO.caption, color: DUO.macaw },

  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
    padding: DUO_SPACING.xl,
  },
  modalCard: {
    width: "100%", maxWidth: 320,
    backgroundColor: DUO.snow,
    borderRadius: DUO_RADIUS.lg,
    padding: DUO_SPACING.lg,
    gap: DUO_SPACING.md,
  },
  modalTitle: { ...DUO_TYPO.h2, color: DUO.eel, textAlign: "center" },
  pickerRow: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", gap: DUO_SPACING.md,
    height: 200,
  },
  colon: { ...DUO_TYPO.hero, color: DUO.eel, fontSize: 36 },
  picker: {
    width: 80, height: 200,
    borderWidth: 2, borderColor: DUO.swan,
    borderRadius: DUO_RADIUS.md,
  },
  pickerItem: {
    paddingVertical: 14, alignItems: "center",
  },
  pickerTxt: { ...DUO_TYPO.h2, color: DUO.wolf },
  pickerTxtActive: { color: DUO.macaw, fontSize: 28 },

  modalBtns: { flexDirection: "row", gap: DUO_SPACING.sm },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: DUO_RADIUS.md, alignItems: "center" },
  modalBtnGhost: { backgroundColor: DUO.polar, borderWidth: 1, borderColor: DUO.swan },
  modalBtnGhostTxt: { ...DUO_TYPO.button, color: DUO.wolf },
  modalBtnOk: { backgroundColor: DUO.green, borderBottomWidth: 4, borderBottomColor: DUO.greenDark },
  modalBtnOkTxt: { ...DUO_TYPO.button, color: DUO.snow },
});
