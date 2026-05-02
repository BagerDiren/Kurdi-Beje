import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/data/app-context";
import { KID_LOCKS } from "@/data/game-data";

export default function GamesTab() {
  const { th, age, completed, setActiveGame } = useApp();

  // === ÇOCUK OYUNLARI ===
  const kidGames = [
    { id: "deng",   emoji: "🔊", title: "Bu Ses Kimin?",   sub: "Hayvan seslerini öğren",  color: "#F39C12", need: KID_LOCKS.deng },
    { id: "wene",   emoji: "🖼️", title: "Gizli Resim",      sub: "Resimle eşleştir",         color: "#8E44AD", need: KID_LOCKS.wene },
    { id: "shkeft", emoji: "🕳️", title: "Kelime Mağarası",  sub: "Harfleri bul, kelime yap", color: "#E74C3C", need: KID_LOCKS.shkeft },
    { id: "zevi",   emoji: "🌾", title: "Dedemin Çiftliği", sub: "Hayvanlara bak",           color: "#27AE60", need: KID_LOCKS.zevi },
  ];

  // === YETİŞKİN OYUNLARI ===
  const adultGames = [
    {
      id: "speed",
      icon: "⚡",
      title: "Hızlı Quiz",
      titleKu: "Pirsa Bilez",
      sub: "60 saniyede en çok kelime",
      color: "#F39C12",
      featured: true,
    },
    {
      id: "memory",
      icon: "🧠",
      title: "Hafıza Eşleştirme",
      titleKu: "Bîranîn",
      sub: "12 kart, 6 çift — kelime ve anlamı eşleştir",
      color: "#8E44AD",
      featured: true,
    },
    {
      id: "match",
      icon: "🃏",
      title: "Çiftleri Bul",
      titleKu: "Cotan Bibîne",
      sub: "Kelime ve anlamlarını bağla",
      color: "#1F6B41",
    },
    {
      id: "sentence",
      icon: "🔤",
      title: "Cümle Kur",
      titleKu: "Hevok Çêbike",
      sub: "Kelimeleri sıraya diz, doğru cümleyi yap",
      color: "#1CB0F6",
    },
  ];

  const openGame = (id: string) => {
    setActiveGame(id);
    router.push("/game" as never);
  };

  // === YETİŞKİN UI ===
  if (age === "adult") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
        {/* Header */}
        <LinearGradient
          colors={th.headerGrad as unknown as readonly [string, string, ...string[]]}
          style={styles.header}
        >
          <Text style={styles.title}>🎮 Mini Oyunlar</Text>
          <Text style={styles.subtitle}>Pratik yaparak XP kazan</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Featured (vurgulu) oyunlar */}
          <Text style={[styles.section, { color: th.text }]}>⭐ Öne Çıkanlar</Text>
          <View style={styles.featuredRow}>
            {adultGames.filter((g) => g.featured).map((g) => (
              <Pressable
                key={g.id}
                onPress={() => openGame(g.id)}
                style={[styles.featuredCard, { backgroundColor: th.card, borderColor: g.color }]}
              >
                <LinearGradient
                  colors={[g.color, g.color + "AA"] as unknown as readonly [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featuredIcon}
                >
                  <Text style={{ fontSize: 30 }}>{g.icon}</Text>
                </LinearGradient>
                <Text style={[styles.featuredTitle, { color: th.text }]} numberOfLines={1}>
                  {g.title}
                </Text>
                <Text style={[styles.featuredSub, { color: th.textLight }]} numberOfLines={1}>
                  {g.titleKu}
                </Text>
                <View style={[styles.featuredBadge, { backgroundColor: g.color + "22" }]}>
                  <Text style={{ fontSize: 9, fontWeight: "900", color: g.color, letterSpacing: 0.5 }}>
                    YENİ
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Diğer oyunlar */}
          <Text style={[styles.section, { color: th.text, marginTop: 18 }]}>
            🎯 Tüm Oyunlar
          </Text>
          <View style={styles.list}>
            {adultGames.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => openGame(g.id)}
                style={[styles.gameRow, { backgroundColor: th.card, borderColor: th.cardBorder }]}
              >
                <View style={[styles.gameIcon, { backgroundColor: g.color + "22", borderColor: g.color + "55" }]}>
                  <Text style={{ fontSize: 24 }}>{g.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: th.text }}>
                    {g.title}
                  </Text>
                  <Text style={{ fontSize: 11, color: th.textLight, marginTop: 2 }} numberOfLines={1}>
                    {g.sub}
                  </Text>
                </View>
                <Text style={{ fontSize: 18, color: g.color, fontWeight: "900" }}>›</Text>
              </Pressable>
            ))}
          </View>

          {/* Tip card */}
          <View style={[styles.tipCard, { backgroundColor: th.accent + "12", borderColor: th.accent + "55" }]}>
            <Text style={{ fontSize: 22 }}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: "800", color: th.text }}>
                Oyunlardan XP kazan
              </Text>
              <Text style={{ fontSize: 10, color: th.textMid, fontWeight: "600", marginTop: 2, lineHeight: 14 }}>
                Her oyun farklı bir beceriyi geliştirir. Hızlı quizle hız kazan,
                hafıza ile kelime hazinen pekişir.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // === ÇOCUK UI ===
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.kidScroll}>
        <Text style={[styles.kidTitle, { color: th.text }]}>🎮 Eğlenceli Oyunlar</Text>
        <View style={styles.list}>
          {kidGames.map((g) => {
            const locked = completed.length < g.need;
            return (
              <Pressable
                key={g.id}
                onPress={() => !locked && openGame(g.id)}
                disabled={locked}
                style={[
                  styles.kidCard,
                  {
                    borderColor: locked ? th.cardBorder : g.color + "55",
                    backgroundColor: g.color + "15",
                    opacity: locked ? 0.4 : 1,
                  },
                ]}
              >
                <View style={[styles.kidIcon, { backgroundColor: "rgba(255,255,255,0.9)" }]}>
                  <Text style={{ fontSize: 22 }}>{g.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: "#2C1810" }}>
                    {g.title}
                  </Text>
                  <Text style={{ fontSize: 10, fontWeight: "600", color: "#5C4033", marginTop: 2 }}>
                    {locked ? `🔒 ${g.need} ders sonra açılır` : g.sub}
                  </Text>
                </View>
                {locked && <Text style={{ fontSize: 20 }}>🔒</Text>}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: { fontSize: 22, fontWeight: "900", color: "#fff" },
  subtitle: { fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: "600", marginTop: 4 },
  scroll: { padding: 16, paddingBottom: 30 },

  section: { fontSize: 13, fontWeight: "800", marginBottom: 10, letterSpacing: 0.4 },

  featuredRow: { flexDirection: "row", gap: 10 },
  featuredCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    minHeight: 140,
    justifyContent: "space-between",
  },
  featuredIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredTitle: { fontSize: 14, fontWeight: "900", marginTop: 8 },
  featuredSub: { fontSize: 10, fontWeight: "600", marginTop: 1 },
  featuredBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },

  list: { gap: 8 },
  gameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  gameIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },

  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 18,
  },

  // ÇOCUK
  kidScroll: { padding: 18, gap: 12 },
  kidTitle: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
  kidCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    minHeight: 80,
  },
  kidIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
