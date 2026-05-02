import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/data/app-context";
import { KID_LOCKS } from "@/data/game-data";

export default function GamesTab() {
  const { th, t, age, completed, setActiveGame } = useApp();

  const kidGames = [
    { id: "deng", emoji: "🔊", title: t.gDeng, sub: t.gDengSub, color: "#F5B82E", need: KID_LOCKS.deng },
    { id: "wene", emoji: "🖼️", title: t.gWene, sub: t.gWeneSub, color: "#7E57C2", need: KID_LOCKS.wene },
    { id: "shkeft", emoji: "🕳️", title: t.gShk, sub: t.gShkSub, color: "#EF5350", need: KID_LOCKS.shkeft },
    { id: "zevi", emoji: "🌾", title: t.gZev, sub: t.gZevSub, color: "#43A57A", need: KID_LOCKS.zevi },
  ];

  const adultGames = [
    { id: "speed", icon: "⚡", title: "Peyva Bilez", sub: "Hızlı Kelime Quiz", color: th.primary },
    { id: "match", icon: "🃏", title: "Cotan Bibîne", sub: "Kelime eşleştirme", color: th.accent },
    { id: "sentence", icon: "🔤", title: "Hevok Çêbike", sub: "Cümle kurma", color: th.correct },
  ];

  const openGame = (id: string) => {
    setActiveGame(id);
    router.push("/game");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: th.text }]}>🎮 {age === "child" ? t.kidGames : t.games}</Text>

        {age === "child" ? (
          <View style={styles.list}>
            {kidGames.map(g => {
              const locked = completed.length < g.need;
              return (
                <Pressable
                  key={g.id}
                  onPress={() => !locked && openGame(g.id)}
                  disabled={locked}
                  style={[styles.kidCard, {
                    borderColor: locked ? th.cardBorder : g.color + "55",
                    backgroundColor: g.color + "15",
                    opacity: locked ? 0.4 : 1,
                  }]}
                >
                  <View style={[styles.kidIcon, { backgroundColor: "rgba(255,255,255,0.9)" }]}>
                    <Text style={{ fontSize: 22 }}>{g.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: "#2C1810" }}>{g.title}</Text>
                    <Text style={{ fontSize: 10, fontWeight: "600", color: "#5C4033", marginTop: 2 }}>
                      {locked ? `🔒 ${t.unlockAt.replace("{n}", String(g.need))}` : g.sub}
                    </Text>
                  </View>
                  {locked && <Text style={{ fontSize: 20 }}>🔒</Text>}
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.list}>
            {adultGames.map(g => (
              <Pressable key={g.id} onPress={() => openGame(g.id)} style={[styles.adultCard, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
                <View style={[styles.adultIcon, { backgroundColor: g.color + "15", borderColor: g.color + "30" }]}>
                  <Text style={{ fontSize: 22 }}>{g.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: th.text }}>{g.title}</Text>
                  <Text style={{ fontSize: 11, color: th.textLight }}>{g.sub}</Text>
                </View>
                <Text style={{ fontSize: 18, color: th.textLight }}>→</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, gap: 12 },
  title: { fontSize: 14, fontWeight: "800", marginBottom: 4 },
  list: { gap: 12 },
  kidCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, borderWidth: 2, minHeight: 80 },
  kidIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  adultCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1.5 },
  adultIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 2 },
});
