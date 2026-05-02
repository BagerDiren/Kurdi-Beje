import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/data/app-context";
import {
  TeachScreen, PickScreen, MatchScreen, FillScreen,
  SceneScreen, DialogueScreen, VisualPickScreen, LessonDone,
} from "@/components/lesson";

export default function LessonScreen() {
  const {
    curLesson, stepIdx, cc, lDone, hearts, th, t,
    nextStep, finishLesson, onCorrect, onWrong, go,
  } = useApp();

  if (!curLesson) {
    router.replace("/(tabs)");
    return null;
  }

  const tq = curLesson.steps?.filter(s =>
    s.type === "pick" || s.type === "match" || s.type === "fill" || s.type === "visualPick"
  ).length ?? 0;

  if (lDone) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }}>
        <LessonDone lesson={curLesson} cc={cc} tq={tq} onFinish={finishLesson} th={th} t={t} />
      </SafeAreaView>
    );
  }

  const step = curLesson.steps![stepIdx];
  const cp = { lp: stepIdx + 1, ts: curLesson.steps!.length, onNext: nextStep, th, t };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }}>
      {/* Close button + hearts */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.replace("/(tabs)")} style={styles.closeBtn}>
          <Text style={{ fontSize: 18, color: th.textMid }}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Text style={{ fontSize: 15 }}>❤️</Text>
        <Text style={{ fontSize: 13, fontWeight: "700", color: th.wrong, marginLeft: 4 }}>{hearts}</Text>
      </View>

      {step.type === "teach" && <TeachScreen step={step} {...cp} />}
      {step.type === "pick" && <PickScreen step={step} {...cp} onCorrect={onCorrect} onWrong={onWrong} />}
      {step.type === "match" && <MatchScreen step={step} {...cp} onCorrect={onCorrect} />}
      {step.type === "fill" && <FillScreen step={step} {...cp} onCorrect={onCorrect} onWrong={onWrong} />}
      {step.type === "scene" && <SceneScreen step={step} {...cp} />}
      {step.type === "dialogue" && <DialogueScreen step={step} {...cp} />}
      {step.type === "visualPick" && <VisualPickScreen step={step} {...cp} onCorrect={onCorrect} onWrong={onWrong} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 10, gap: 4 },
  closeBtn: { padding: 4 },
});
