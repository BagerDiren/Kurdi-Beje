/**
 * /duo-lesson?id=... — Tek ders oyuncusu (LessonPlayer).
 *
 * Akış:
 *   • lesson id param'dan al → findLessonById
 *   • LessonPlayer çalıştır, sonunda LessonComplete
 *   • Çıkışta Path'e dön
 */
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

import { LessonPlayer, LessonComplete } from "@/components/duo/lesson-player";
import { findLessonById } from "@/data/duo-content";
import { useApp } from "@/data/app-context";

export default function DuoLessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ctx = useApp();
  const [phase, setPhase] = useState<"playing" | "done">("playing");
  const [result, setResult] = useState<{ xp: number; perfect: boolean }>({ xp: 0, perfect: true });

  const found = id ? findLessonById(id) : null;
  if (!found) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Ders bulunamadı.</Text>
      </View>
    );
  }
  const { lesson } = found;

  if (phase === "done") {
    return (
      <LessonComplete
        xp={result.xp}
        perfect={result.perfect}
        onHome={() => router.replace("/duo-path")}
      />
    );
  }

  return (
    <LessonPlayer
      lesson={lesson}
      onClose={() => router.replace("/duo-path")}
      onComplete={(r) => {
        setResult(r);
        // Context'e işle
        ctx.markLessonDone?.(lesson.id, r.xp);
        setPhase("done");
      }}
    />
  );
}
