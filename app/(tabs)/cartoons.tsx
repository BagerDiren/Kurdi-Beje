/**
 * 📺 Çizgi Film sekmesi — Zarok TV ilhamlı, kategorize içerik (sadece çocuk modu).
 *
 * 5 kategori: Çizgi Filmler, Şarkılar, Masallar, Eğitici, Spor & Aktivite
 * Toplam 25+ küratörlük edilmiş Kürtçe video kaynağı.
 * Tap → YouTube'da açılır.
 */
import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, Linking, Alert } from "react-native";
import { router } from "expo-router";
import { CARTOONS, CARTOON_CATEGORIES, type CartoonCategory } from "@/data/cartoons";
import { DUO, DUO_RADIUS, DUO_SPACING, DUO_TYPO } from "@/components/duo/duo-tokens";
import { useApp } from "@/data/app-context";
import type { LangCode } from "@/data/languages";

const C_UI = {
  title:        { tr: "📺 Zarok TV",                en: "📺 Zarok TV",                   ku: "📺 Zarok TV" },
  sub:          { tr: "Kürtçe çocuk videoları",  en: "Kurdish children's videos",     ku: "Vîdeoyên zarokên Kurdî" },
  all:          { tr: "Hepsi",                     en: "All",                            ku: "Hemû" },
  openYoutube:  { tr: "YouTube'da aç →",          en: "Open in YouTube →",             ku: "Di YouTube de veke →" },
  failed:       { tr: "Açılamadı",                en: "Couldn't open",                 ku: "Nehat vekirin" },
  failedSub:    { tr: "videosu açılamadı.",      en: "video couldn't open.",          ku: "vîdeo nehat vekirin." },
  errorT:       { tr: "Hata",                    en: "Error",                          ku: "Çewtî" },
  errorSub:     { tr: "Video açılırken bir sorun oluştu.", en: "An error occurred opening the video.", ku: "Di vekirina vîdeo de pirsgirêkek çêbû." },
  zarokOfficial:{ tr: "Resmi Zarok TV",            en: "Official Zarok TV",             ku: "Resmî Zarok TV" },
  disclaimer:   { tr: "🔒 Tüm videolar telifsiz / halka açık YouTube kanallarından küratör seçilmiştir.\nAçılan içerik ebeveyn denetiminde izlenmelidir.",
                  en: "🔒 All videos are curated from royalty-free / public YouTube channels.\nContent should be viewed under parental supervision.",
                  ku: "🔒 Hemû vîdeo ji kanalên YouTube yên belaş / vekirî hatine hilbijartin.\nNaverok divê di bin çavdêriya dêûbavan de were temaşekirin." },
} as const;
const cui = (k: keyof typeof C_UI, lang: LangCode) => C_UI[k][lang];

export default function CartoonsScreen() {
  const ctx = useApp();
  const lang: LangCode = (ctx.lang as LangCode) ?? "tr";
  const [activeCat, setActiveCat] = useState<CartoonCategory | "all">("all");

  const open = async (url: string, title: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
      else Alert.alert(cui("failed", lang), `${title} ${cui("failedSub", lang)}`);
    } catch {
      Alert.alert(cui("errorT", lang), cui("errorSub", lang));
    }
  };

  const filtered = activeCat === "all"
    ? CARTOONS
    : CARTOONS.filter((c) => c.category === activeCat);

  // Kategori bazlı sayım — chip'lerin altında küçük badge için
  const counts: Record<string, number> = { all: CARTOONS.length };
  for (const c of CARTOONS) counts[c.category] = (counts[c.category] || 0) + 1;

  return (
    <View style={s.root}>
      <SafeAreaView style={s.headerWrap}>
        <View style={s.headerRow}>
          <Pressable onPress={() => router.replace("/(tabs)")} hitSlop={10} style={s.backBtn}>
            <Text style={s.backTxt}>‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{cui("title", lang)}</Text>
            <Text style={s.sub}>{cui("sub", lang)}</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Kategori chip'leri (yatay scroll) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chipsRow}
        style={s.chipsScroll}
      >
        <Pressable
          onPress={() => setActiveCat("all")}
          style={[s.chip, activeCat === "all" && s.chipActive]}
        >
          <Text style={[s.chipTxt, activeCat === "all" && s.chipTxtActive]}>
            ⭐ {cui("all", lang)} ({counts.all})
          </Text>
        </Pressable>
        {CARTOON_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setActiveCat(cat.id)}
            style={[
              s.chip,
              activeCat === cat.id && { backgroundColor: cat.color, borderColor: cat.color },
            ]}
          >
            <Text style={[s.chipTxt, activeCat === cat.id && s.chipTxtActive]}>
              {cat.emoji} {lang === "ku" ? cat.labelKu : cat.label} ({counts[cat.id] || 0})
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.body}>
        {filtered.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => open(c.url, c.title)}
            style={({ pressed }) => [
              s.card,
              {
                backgroundColor: c.color,
                borderBottomColor: c.color + "BB",
                borderBottomWidth: pressed ? 0 : 6,
                transform: [{ translateY: pressed ? 3 : 0 }],
              },
            ]}
          >
            <View style={s.cardLeft}>
              <Text style={s.cardEmoji}>{c.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.cardTitleRow}>
                <Text style={s.cardTitle}>{c.title}</Text>
                {c.isOfficialZarok && (
                  <View style={s.zarokBadge}>
                    <Text style={s.zarokBadgeTxt}>✓ ZAROK</Text>
                  </View>
                )}
              </View>
              <Text style={s.cardKu}>{c.titleKu}</Text>
              <Text style={s.cardDesc}>{c.description}</Text>
              <View style={s.cardMeta}>
                <Text style={s.cardChannel}>📡 {c.channel}</Text>
                <Text style={s.cardOpen}>{cui("openYoutube", lang)}</Text>
              </View>
            </View>
          </Pressable>
        ))}
        <Text style={s.disclaimer}>{cui("disclaimer", lang)}</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DUO.snow },
  headerWrap: {
    paddingTop: 50, paddingHorizontal: DUO_SPACING.lg, paddingBottom: DUO_SPACING.md,
    borderBottomWidth: 2, borderBottomColor: DUO.swan,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: DUO_SPACING.sm },
  backBtn: {
    width: 40, height: 40, borderRadius: 999,
    backgroundColor: DUO.polar,
    alignItems: "center", justifyContent: "center",
  },
  backTxt: { fontSize: 28, color: DUO.eel, lineHeight: 30 },
  title: { ...DUO_TYPO.hero, color: DUO.eel },
  sub: { ...DUO_TYPO.body, color: DUO.wolf, marginTop: 2 },

  // Kategori chip'leri
  chipsScroll: {
    flexGrow: 0,
    backgroundColor: DUO.polar,
    borderBottomWidth: 1, borderBottomColor: DUO.swan,
  },
  chipsRow: {
    paddingHorizontal: DUO_SPACING.md,
    paddingVertical: DUO_SPACING.sm,
    gap: DUO_SPACING.sm,
  },
  chip: {
    paddingHorizontal: DUO_SPACING.md,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: DUO.snow,
    borderWidth: 2, borderColor: DUO.swan,
  },
  chipActive: {
    backgroundColor: DUO.eel,
    borderColor: DUO.eel,
  },
  chipTxt: { ...DUO_TYPO.body, color: DUO.eel, fontSize: 13 },
  chipTxtActive: { color: DUO.snow },

  // Kart
  body: { padding: DUO_SPACING.lg, gap: DUO_SPACING.md, paddingBottom: 60 },
  card: {
    flexDirection: "row", gap: DUO_SPACING.md,
    borderRadius: DUO_RADIUS.lg,
    padding: DUO_SPACING.md,
    minHeight: 110,
  },
  cardLeft: {
    width: 76, height: 76,
    borderRadius: DUO_RADIUS.md,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  cardEmoji: { fontSize: 44 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  cardTitle: { ...DUO_TYPO.h2, color: DUO.snow, flexShrink: 1 },
  zarokBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4,
  },
  zarokBadgeTxt: { ...DUO_TYPO.micro, color: DUO.snow, fontSize: 9 },
  cardKu: { ...DUO_TYPO.body, color: "rgba(255,255,255,0.9)", fontStyle: "italic", marginTop: 2 },
  cardDesc: { ...DUO_TYPO.body, color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },
  cardMeta: {
    flexDirection: "row", justifyContent: "space-between",
    marginTop: 6, alignItems: "center",
  },
  cardChannel: { ...DUO_TYPO.caption, color: "rgba(255,255,255,0.85)" },
  cardOpen: { ...DUO_TYPO.caption, color: DUO.snow, fontWeight: "900" },
  disclaimer: {
    ...DUO_TYPO.caption,
    color: DUO.wolf,
    textAlign: "center",
    marginTop: DUO_SPACING.lg,
    lineHeight: 16,
    paddingHorizontal: DUO_SPACING.md,
  },
});
