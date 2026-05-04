/**
 * 📺 Çizgi Film sekmesi — sadece çocuk modunda görünür.
 *
 * 8 küratörlük edilmiş Kürtçe çocuk videosu / kanalı.
 * Tap → Linking.openURL ile YouTube'da açılır.
 */
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, Linking, Alert } from "react-native";
import { CARTOONS } from "@/data/cartoons";
import { DUO, DUO_RADIUS, DUO_SPACING, DUO_TYPO } from "@/components/duo/duo-tokens";

export default function CartoonsScreen() {
  const open = async (url: string, title: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
      else Alert.alert("Açılamadı", `${title} videosu açılamadı.`);
    } catch {
      Alert.alert("Hata", "Video açılırken bir sorun oluştu.");
    }
  };

  return (
    <View style={s.root}>
      <SafeAreaView style={s.headerWrap}>
        <Text style={s.title}>📺 Çizgi Film</Text>
        <Text style={s.sub}>Kürtçe çocuk videoları</Text>
      </SafeAreaView>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.body}>
        {CARTOONS.map((c) => (
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
              <Text style={s.cardTitle}>{c.title}</Text>
              <Text style={s.cardKu}>{c.titleKu}</Text>
              <Text style={s.cardDesc}>{c.description}</Text>
              <View style={s.cardMeta}>
                <Text style={s.cardChannel}>📡 {c.channel}</Text>
                <Text style={s.cardOpen}>YouTube'da aç →</Text>
              </View>
            </View>
          </Pressable>
        ))}
        <Text style={s.disclaimer}>
          🔒 Tüm videolar telifsiz / halka açık YouTube kanallarından küratör seçilmiştir.{"\n"}
          Açılan içerik ebeveyn denetiminde izlenmelidir.
        </Text>
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
  title: { ...DUO_TYPO.hero, color: DUO.eel },
  sub: { ...DUO_TYPO.body, color: DUO.wolf, marginTop: 2 },
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
  cardTitle: { ...DUO_TYPO.h2, color: DUO.snow },
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
