import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DuoButton,
  OnboardingHeader,
  SelectionCard,
  MascotBubble,
} from "@/components/ui-kit";
import { DUO } from "@/data/duo-colors";
import { useApp, type DailyGoalMinutes } from "@/data/app-context";

/**
 * Günlük hedef seçimi — 5/10/15/20 dakika.
 * Kevo teach pozunda, seçim yapılınca alttaki Kevo zıplıyor gibi hissettiriyor.
 */
const OPTIONS: { id: DailyGoalMinutes; label: string; trailing: string }[] = [
  { id: 5,  label: "Günde 5 dakika",  trailing: "Rahat" },
  { id: 10, label: "Günde 10 dakika", trailing: "Normal" },
  { id: 15, label: "Günde 15 dakika", trailing: "Ciddi" },
  { id: 20, label: "Günde 20 dakika", trailing: "Yoğun" },
];

export default function IntroGoal() {
  const { dailyGoal, setDailyGoal } = useApp();
  const [localSel, setLocalSel] = useState<DailyGoalMinutes | null>(dailyGoal);

  const pick = (id: DailyGoalMinutes) => {
    setLocalSel(id);
    setDailyGoal(id);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <OnboardingHeader progress={0.75} onBack={() => router.back()} />

        <View style={styles.bubbleArea}>
          <MascotBubble
            message="Günlük hedefin ne?"
            mascotSize={88}
            action="teach"
            mood="happy"
          />
        </View>

        <View style={styles.options}>
          {OPTIONS.map((o) => (
            <SelectionCard
              key={o.id}
              label={o.label}
              trailing={o.trailing}
              selected={localSel === o.id}
              onPress={() => pick(o.id)}
            />
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <DuoButton
          disabled={!localSel}
          onPress={() => router.push("/intro/commitment")}
        >
          Hedefimi belirledim
        </DuoButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DUO.bg },
  content: { flex: 1, paddingHorizontal: 20, paddingBottom: 16 },
  bubbleArea: { marginTop: 18, marginBottom: 20 },
  options: { gap: 12 },
});
