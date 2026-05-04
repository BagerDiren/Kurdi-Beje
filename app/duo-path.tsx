/**
 * /duo-path — Duolingo zigzag öğrenme yolu (ana ekran).
 */
import { router } from "expo-router";
import { PathScreen } from "@/components/duo/path-screen";
import { useApp } from "@/data/app-context";

export default function DuoPathScreen() {
  const ctx = useApp();
  const completedLessonIds = new Set(ctx.completed ?? []);

  return (
    <PathScreen
      completedLessonIds={completedLessonIds}
      hearts={ctx.hearts ?? 5}
      xp={ctx.xp ?? 0}
      streak={ctx.streak ?? 0}
      onSelectLesson={(lessonId) => router.push(`/duo-lesson?id=${lessonId}` as never)}
    />
  );
}
