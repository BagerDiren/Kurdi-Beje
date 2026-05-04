/**
 * Ana sekme: Duolingo zigzag öğrenme yolu (PathScreen).
 *
 * Kullanıcı bir lesson node'una bastığında /duo-lesson?id=... rotasına gider.
 */
import { router } from "expo-router";
import { PathScreen } from "@/components/duo/path-screen";
import { useApp } from "@/data/app-context";

export default function HomeTab() {
  const ctx = useApp();
  const completedLessonIds = new Set(ctx.completed ?? []);
  // ctx.age "child" | "adult" | null → varsayılan "adult"
  const audience: "child" | "adult" = ctx.age === "child" ? "child" : "adult";

  return (
    <PathScreen
      completedLessonIds={completedLessonIds}
      hearts={ctx.hearts ?? 5}
      xp={ctx.xp ?? 0}
      streak={ctx.streak ?? 0}
      audience={audience}
      onSelectLesson={(lessonId) => router.push(`/duo-lesson?id=${lessonId}` as never)}
    />
  );
}
