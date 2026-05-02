import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Btn } from "@/components/ui-kit";
import { KevoMascot } from "@/components/kevo-mascot";
import type { Lesson } from "@/data/lessons";
import type { AppTheme } from "@/data/themes";
import type { Translations } from "@/data/translations";

type Props = {
  lesson: Lesson;
  cc: number;
  tq: number;
  onFinish: () => void;
  th: AppTheme;
  t: Translations;
};

export function LessonDone({ lesson, cc, tq, onFinish, th, t }: Props) {
  const pct = tq > 0 ? Math.round((cc / tq) * 100) : 100;
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: th.bg }} contentContainerStyle={styles.container}>
      <KevoMascot size={90} mood="happy" speaking />

      <Text style={[styles.title, { color: th.primary }]}>{t.lessonDone}</Text>
      <Text style={{ fontSize: 14, color: th.textMid, textAlign: "center" }}>
        "{lesson.title}" {t.youFinished}
      </Text>

      <Text style={styles.stars}>
        {[1, 2, 3].map(s => (
          <Text key={s} style={{ opacity: s <= stars ? 1 : 0.2 }}>⭐</Text>
        ))}
      </Text>

      <View style={[styles.card, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
        {tq > 0 && (
          <View style={styles.row}>
            <Text style={{ fontSize: 13, color: th.textMid }}>{t.correct}</Text>
            <Text style={{ fontWeight: "700", color: th.correct }}>{cc}/{tq}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={{ fontSize: 13, color: th.textMid }}>{t.xpEarned}</Text>
          <Text style={{ fontWeight: "700", color: th.accent }}>+{lesson.xp} ⭐</Text>
        </View>
      </View>

      <View style={[styles.wordsBox, { backgroundColor: th.primary + "10" }]}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: th.primary, marginBottom: 4 }}>{t.wordsLearned}</Text>
        <View style={styles.wordTags}>
          {lesson.steps?.filter(s => s.type === "teach" || s.type === "scene").map((s, i) => (
            <View key={i} style={[styles.tag, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: th.primary }}>
                {s.type === "teach" ? s.word : s.type === "scene" ? s.verb : ""}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ flex: 1 }} />
      <Btn onPress={onFinish} th={th}>{t.backHome}</Btn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 30, paddingBottom: 32, alignItems: "center", gap: 14 },
  title: { fontSize: 26, fontWeight: "800" },
  stars: { fontSize: 40, letterSpacing: 8, textAlign: "center" },
  card: { borderRadius: 18, padding: 16, width: "100%", borderWidth: 1, gap: 10, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  wordsBox: { borderRadius: 14, padding: 12, width: "100%" },
  wordTags: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tag: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
});
