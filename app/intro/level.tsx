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
import { useApp, type ProficiencyLevel } from "@/data/app-context";

/**
 * Seviye sorusu — Kurmancî proficiency.
 * Kevo öğretmen pozunda (kağıt + kalem tutuyor).
 */
const OPTIONS: { id: ProficiencyLevel; label: string; bars: number }[] = [
  { id: "new", label: "Hiç Kürtçe bilmiyorum, sıfırdan başlamak istiyorum", bars: 1 },
  { id: "basic", label: "Birkaç kelime biliyorum (selam, teşekkür)", bars: 2 },
  { id: "simple", label: "Basit cümleler kurabiliyorum", bars: 3 },
  { id: "varied", label: "Farklı konularda konuşabiliyorum", bars: 4 },
  { id: "advanced", label: "Akıcı konuşuyorum, kelime hazinemi geliştirmek istiyorum", bars: 5 },
];

function BarsIcon({ count }: { count: number }) {
  return (
    <View style={barStyles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            barStyles.bar,
            {
              height: 6 + i * 3,
              backgroundColor: i <= count ? DUO.blue : DUO.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  bar: { width: 4, borderRadius: 2 },
});

export default function IntroLevel() {
  const { proficiency, setProficiency } = useApp();
  const [localSel, setLocalSel] = useState<ProficiencyLevel | null>(proficiency);

  const pick = (id: ProficiencyLevel) => {
    setLocalSel(id);
    setProficiency(id);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <OnboardingHeader progress={0.35} onBack={() => router.back()} />

        <View style={styles.bubbleArea}>
          <MascotBubble
            message="Kürtçe seviyen ne?"
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
              icon={<BarsIcon count={o.bars} />}
              selected={localSel === o.id}
              onPress={() => pick(o.id)}
            />
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <DuoButton
          disabled={!localSel}
          onPress={() => router.push("/intro/level-done")}
        >
          Devam et
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
