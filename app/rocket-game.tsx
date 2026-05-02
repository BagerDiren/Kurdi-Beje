import { View, Pressable, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { RocketGame } from "@/components/kids/rocket-game";
import { useApp } from "@/data/app-context";
import { getKidsCategoryByKey, KIDS_CATEGORIES } from "@/data/kids-content";

export default function RocketGameScreen() {
  const { activeCategory, addXp } = useApp();
  const cat = (activeCategory && getKidsCategoryByKey(activeCategory)) || KIDS_CATEGORIES[0];

  const onDone = (xp: number) => {
    addXp(xp);
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={{ fontSize: 28, color: "#fff", fontWeight: "900" }}>✕</Text>
        </Pressable>
        <Text style={styles.title}>🚀 Roket Yolculuğu</Text>
      </View>
      <RocketGame category={cat} onDone={onDone} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0F0C29" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 14,
    backgroundColor: "#0F0C29",
  },
  title: { fontSize: 18, fontWeight: "900", color: "#fff" },
});
