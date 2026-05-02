import { View, Pressable, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { FarmGamePro } from "@/components/kids/farm-game-pro";
import { useApp } from "@/data/app-context";
import { getKidsCategoryByKey, KIDS_CATEGORIES } from "@/data/kids-content";
import { KIDS_THEME, TYPO } from "@/components/kids/design";

export default function FarmGameScreen() {
  const { activeCategory, addXp } = useApp();
  const cat = (activeCategory && getKidsCategoryByKey(activeCategory)) || KIDS_CATEGORIES[0];

  const onDone = (xp: number) => {
    addXp(xp);
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Text style={{ fontSize: 26, color: "#fff", fontFamily: "Fredoka_700Bold" }}>‹</Text>
        </Pressable>
        <Text style={styles.title}>🐮 Kevo'nun Çiftliği</Text>
      </View>
      <FarmGamePro category={cat} onDone={onDone} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#A4D65E" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 14,
    backgroundColor: "#7CB342",
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  title: { ...TYPO.h2, color: "#fff", textShadowColor: "rgba(0,0,0,0.2)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
});
