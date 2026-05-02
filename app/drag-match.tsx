import { View, Pressable, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { DragMatchGame } from "@/components/kids/drag-match-game";
import { useApp } from "@/data/app-context";
import { getKidsCategoryByKey, KIDS_CATEGORIES } from "@/data/kids-content";
import { KIDS_THEME, TYPO } from "@/components/kids/design";

export default function DragMatchScreen() {
  const { activeCategory, addXp } = useApp();
  const cat = (activeCategory && getKidsCategoryByKey(activeCategory)) || KIDS_CATEGORIES[0];

  const onDone = (xp: number) => {
    addXp(xp);
    router.replace("/(tabs)");
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Text style={{ fontSize: 26, color: KIDS_THEME.ink, fontFamily: "Fredoka_700Bold" }}>‹</Text>
          </Pressable>
          <Text style={styles.title}>🎯 Sürükle & Eşleştir</Text>
        </View>
        <DragMatchGame category={cat} onDone={onDone} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: KIDS_THEME.bg },
  topBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
    gap: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: KIDS_THEME.card,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  title: { ...TYPO.h2, color: KIDS_THEME.ink },
});
