import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { CHILD_THEME, ADULT_THEME, type AppTheme } from "./themes";
import { T, type Translations } from "./translations";
import { LESSONS, type Lesson, type LevelKey } from "./lessons";
import type { LangCode } from "./languages";
import { CATEGORIES, type CategoryKey } from "./categories";
import { ACHIEVEMENTS } from "./achievements";

type AgeMode = "child" | "adult" | null;
type ScreenName =
  | "splash" | "mode" | "language" | "level"
  | "home" | "lesson" | "goals";

export type ProficiencyLevel = "new" | "basic" | "simple" | "varied" | "advanced";
export type DailyGoalMinutes = 5 | 10 | 15 | 20;

type AppState = {
  scr: ScreenName;
  lang: LangCode | null;
  age: AgeMode;
  lvl: LevelKey | null;
  hearts: number;
  xp: number;
  streak: number;
  tab: string;
  curLesson: Lesson | null;
  stepIdx: number;
  cc: number;
  lDone: boolean;
  completed: string[];
  lessonsToday: number;
  correctToday: number;
  activeGame: string | null;
  activeCategory: CategoryKey | null;
  // Streak / time tracking
  studyDates: string[];          // ISO YYYY-MM-DD strings
  lastStudyDate: string | null;
  // Achievements / rewards
  unlockedAchievements: string[];
  // Onboarding state
  proficiency: ProficiencyLevel | null;
  dailyGoal: DailyGoalMinutes | null;
  // derived
  th: AppTheme;
  t: Translations;
  levelLessons: Lesson[];
};

type AppActions = {
  go: (scr: ScreenName) => void;
  setLang: (lang: LangCode) => void;
  setAge: (age: AgeMode) => void;
  setLvl: (lvl: LevelKey) => void;
  setTab: (tab: string) => void;
  setActiveGame: (game: string | null) => void;
  setActiveCategory: (key: CategoryKey | null) => void;
  startLesson: (lesson: Lesson) => void;
  nextStep: () => void;
  finishLesson: () => void;
  onCorrect: () => void;
  onWrong: () => void;
  addXp: (n: number) => void;
  setHearts: (n: number) => void;
  resetProgress: () => void;
  setProficiency: (p: ProficiencyLevel) => void;
  setDailyGoal: (g: DailyGoalMinutes) => void;
  unlockAchievement: (id: string, xpReward?: number) => void;
};

const AppContext = createContext<(AppState & AppActions) | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [scr, setScr] = useState<ScreenName>("splash");
  const [lang, setLangState] = useState<LangCode | null>(null);
  const [age, setAgeState] = useState<AgeMode>(null);
  const [lvl, setLvlState] = useState<LevelKey | null>(null);
  const [hearts, setHeartsState] = useState(5);
  const [xp, setXpState] = useState(0);
  const [streak, setStreakState] = useState(0);
  const [tab, setTabState] = useState("learn");
  const [curLesson, setCurLesson] = useState<Lesson | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [cc, setCc] = useState(0);
  const [lDone, setLDone] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [lessonsToday, setLessonsToday] = useState(0);
  const [correctToday, setCorrectToday] = useState(0);
  const [activeGame, setActiveGameState] = useState<string | null>(null);
  const [activeCategory, setActiveCategoryState] = useState<CategoryKey | null>(null);
  const [proficiency, setProficiencyState] = useState<ProficiencyLevel | null>(null);
  const [dailyGoal, setDailyGoalState] = useState<DailyGoalMinutes | null>(null);
  const [studyDates, setStudyDates] = useState<string[]>([]);
  const [lastStudyDate, setLastStudyDate] = useState<string | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  const th: AppTheme = (age === "adult" ? ADULT_THEME : CHILD_THEME) as AppTheme;
  const t = T[lang ?? "ku"];
  const levelLessons = LESSONS[lvl ?? "a1"] ?? [];

  const go = useCallback((s: ScreenName) => setScr(s), []);
  const setLang = useCallback((l: LangCode) => setLangState(l), []);
  const setAge = useCallback((a: AgeMode) => setAgeState(a), []);
  const setLvl = useCallback((l: LevelKey) => setLvlState(l), []);
  const setTab = useCallback((t: string) => setTabState(t), []);
  const setActiveGame = useCallback((g: string | null) => setActiveGameState(g), []);
  const setActiveCategory = useCallback((k: CategoryKey | null) => setActiveCategoryState(k), []);
  const setHearts = useCallback((n: number) => setHeartsState(n), []);

  const startLesson = useCallback((lesson: Lesson) => {
    if (!lesson.steps) return;
    setCurLesson(lesson);
    setStepIdx(0);
    setCc(0);
    setLDone(false);
    setScr("lesson");
  }, []);

  const nextStep = useCallback(() => {
    if (!curLesson) return;
    if (stepIdx + 1 >= (curLesson.steps?.length ?? 0)) {
      setLDone(true);
    } else {
      setStepIdx(p => p + 1);
    }
  }, [curLesson, stepIdx]);

  const finishLesson = useCallback(() => {
    if (!curLesson) return;
    const today = new Date().toISOString().slice(0, 10);
    const isFirstStudyEver = lastStudyDate === null;
    const isNewDay = !isFirstStudyEver && lastStudyDate !== today;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    setXpState((p) => p + curLesson.xp);
    setCompleted((p) => (p.includes(curLesson.id) ? p : [...p, curLesson.id]));
    // Yeni güne geçtiyse günlük sayaçlar sıfırlanır
    setLessonsToday((p) => (isNewDay ? 1 : p + 1));
    if (isNewDay) setCorrectToday(0);

    // Çalışılan gün listesine ekle (max 60 gün tut)
    setStudyDates((p) => (p.includes(today) ? p : [...p, today].slice(-60)));

    // Streak: ilk çalışma → 1, dün çalıştıysa → +1, aksi → 1'e resetle
    if (lastStudyDate !== today) {
      setStreakState((prev) => {
        if (isFirstStudyEver) return 1;
        if (lastStudyDate === yesterday) return prev + 1;
        return 1;
      });
      setLastStudyDate(today);
    }

    setCurLesson(null);
    setTabState("learn");
    setScr("home");
  }, [curLesson, lastStudyDate]);

  const onCorrect = useCallback(() => {
    setCc(c => c + 1);
    setCorrectToday(c => c + 1);
  }, []);

  const onWrong = useCallback(() => {
    setHeartsState(h => Math.max(0, h - 1));
  }, []);

  const addXp = useCallback((n: number) => setXpState(p => p + n), []);

  const resetProgress = useCallback(() => {
    setXpState(0);
    setHeartsState(5);
    setCompleted([]);
    setStreakState(0);
    setLessonsToday(0);
    setCorrectToday(0);
    setStudyDates([]);
    setLastStudyDate(null);
    setUnlockedAchievements([]);
  }, []);

  const setProficiency = useCallback((p: ProficiencyLevel) => setProficiencyState(p), []);
  const setDailyGoal = useCallback((g: DailyGoalMinutes) => setDailyGoalState(g), []);

  const unlockAchievement = useCallback((id: string, xpReward?: number) => {
    setUnlockedAchievements(prev => {
      if (prev.includes(id)) return prev;
      if (xpReward) setXpState(x => x + xpReward);
      return [...prev, id];
    });
  }, []);

  // === OTOMATİK MADALYA AÇMA ===
  // xp / streak / completed değiştiğinde uygun madalyaları aç
  useEffect(() => {
    const lessonsCompleted = completed.length;
    const categoriesCompleted = CATEGORIES.filter(
      (c) => c.lessons.length > 0 && c.lessons.every((l) => completed.includes(l.id)),
    ).length;

    const newlyUnlocked: string[] = [];
    let bonusXp = 0;

    ACHIEVEMENTS.forEach((a) => {
      if (unlockedAchievements.includes(a.id)) return;
      let current = 0;
      if (a.metric === "xp") current = xp;
      else if (a.metric === "streak") current = streak;
      else if (a.metric === "lessons") current = lessonsCompleted;
      else if (a.metric === "categories") current = categoriesCompleted;
      if (current >= a.threshold) {
        newlyUnlocked.push(a.id);
        if (a.xpReward) bonusXp += a.xpReward;
      }
    });

    if (newlyUnlocked.length > 0) {
      setUnlockedAchievements((prev) => [...prev, ...newlyUnlocked]);
      if (bonusXp > 0) setXpState((x) => x + bonusXp);
    }
  }, [xp, streak, completed]);

  const value: AppState & AppActions = {
    scr, lang, age, lvl, hearts, xp, streak, tab,
    curLesson, stepIdx, cc, lDone, completed, lessonsToday, correctToday,
    activeGame, activeCategory,
    studyDates, lastStudyDate, unlockedAchievements,
    proficiency, dailyGoal,
    th, t, levelLessons,
    go, setLang, setAge, setLvl, setTab, setActiveGame, setActiveCategory,
    startLesson, nextStep, finishLesson, onCorrect, onWrong,
    addXp, setHearts, resetProgress,
    setProficiency, setDailyGoal, unlockAchievement,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
