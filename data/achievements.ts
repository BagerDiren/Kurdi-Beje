/**
 * Madalya (Achievement) sistemi.
 * XP, streak, ders sayısı ve kategori sayısına göre madalyalar açılır.
 * Madalyalar yetişkin profilinde gösterilir, açıldığında kutlama yapılır.
 */

export type AchievementMetric = "lessons" | "xp" | "streak" | "categories";

export type Achievement = {
  id: string;
  title: string;        // Kurmancî
  titleTr: string;
  description: string;
  descriptionTr: string;
  icon: string;
  color: string;
  metric: AchievementMetric;
  threshold: number;
  xpReward?: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  // === DERS SAYISI ===
  {
    id: "first-lesson",
    title: "Yekem Gav",
    titleTr: "İlk Adım",
    description: "Dersa yekem qediya!",
    descriptionTr: "İlk dersini tamamladın!",
    icon: "🌱",
    color: "#58CC02",
    metric: "lessons",
    threshold: 1,
    xpReward: 10,
  },
  {
    id: "five-lessons",
    title: "Pêncîn Beş",
    titleTr: "Beşli Bölük",
    description: "5 dersa qediya",
    descriptionTr: "5 ders tamamlandı",
    icon: "✋",
    color: "#1CB0F6",
    metric: "lessons",
    threshold: 5,
    xpReward: 25,
  },
  {
    id: "ten-lessons",
    title: "Dehîn",
    titleTr: "Onar",
    description: "10 dersa qediya",
    descriptionTr: "10 ders tamamlandı",
    icon: "🔟",
    color: "#A560E8",
    metric: "lessons",
    threshold: 10,
    xpReward: 50,
  },
  {
    id: "twentyfive-lessons",
    title: "Çarîn",
    titleTr: "Çeyrek Yol",
    description: "25 dersa qediya",
    descriptionTr: "25 ders tamamlandı",
    icon: "🎯",
    color: "#F49000",
    metric: "lessons",
    threshold: 25,
    xpReward: 100,
  },
  {
    id: "fifty-lessons",
    title: "Pêncîya Zêrîn",
    titleTr: "Altın Elli",
    description: "50 dersa qediya",
    descriptionTr: "50 ders tamamlandı",
    icon: "🏆",
    color: "#FFC200",
    metric: "lessons",
    threshold: 50,
    xpReward: 200,
  },
  {
    id: "hundred-lessons",
    title: "Sedîn",
    titleTr: "Yüzbaşı",
    description: "100 dersa qediya",
    descriptionTr: "100 ders tamamlandı",
    icon: "💯",
    color: "#FF4B4B",
    metric: "lessons",
    threshold: 100,
    xpReward: 500,
  },

  // === XP ===
  {
    id: "xp-100",
    title: "Sed XP",
    titleTr: "100 XP",
    description: "Sed XP berhev kir",
    descriptionTr: "100 XP topladın",
    icon: "⭐",
    color: "#FFC200",
    metric: "xp",
    threshold: 100,
  },
  {
    id: "xp-500",
    title: "Pêncsed XP",
    titleTr: "500 XP",
    description: "500 XP berhev kir",
    descriptionTr: "500 XP topladın",
    icon: "🌟",
    color: "#F49000",
    metric: "xp",
    threshold: 500,
  },
  {
    id: "xp-1000",
    title: "Hezar XP",
    titleTr: "1000 XP",
    description: "Hezar XP! Pir baş!",
    descriptionTr: "1000 XP! Harika!",
    icon: "💫",
    color: "#A560E8",
    metric: "xp",
    threshold: 1000,
    xpReward: 100,
  },
  {
    id: "xp-5000",
    title: "Pîspor",
    titleTr: "Uzman",
    description: "5000 XP — Pîsporî",
    descriptionTr: "5000 XP — Uzmanlık",
    icon: "👑",
    color: "#FFC200",
    metric: "xp",
    threshold: 5000,
    xpReward: 500,
  },

  // === STREAK ===
  {
    id: "streak-3",
    title: "Sê Roj",
    titleTr: "Üç Gün",
    description: "3 rojên rêzkî!",
    descriptionTr: "3 günlük seri!",
    icon: "🔥",
    color: "#F49000",
    metric: "streak",
    threshold: 3,
  },
  {
    id: "streak-7",
    title: "Hefteyek Tev",
    titleTr: "Tam Hafta",
    description: "7 rojên rêzkî!",
    descriptionTr: "7 günlük seri!",
    icon: "🔥",
    color: "#FF4B4B",
    metric: "streak",
    threshold: 7,
    xpReward: 50,
  },
  {
    id: "streak-30",
    title: "Mehek Tev",
    titleTr: "Tam Ay",
    description: "30 rojên rêzkî!",
    descriptionTr: "30 günlük seri!",
    icon: "🌋",
    color: "#FF4B4B",
    metric: "streak",
    threshold: 30,
    xpReward: 200,
  },
  {
    id: "streak-100",
    title: "Sed Roj",
    titleTr: "100 Gün",
    description: "100 rojên rêzkî!",
    descriptionTr: "100 günlük seri!",
    icon: "🏔️",
    color: "#A560E8",
    metric: "streak",
    threshold: 100,
    xpReward: 1000,
  },

  // === KATEGORİ ===
  {
    id: "cat-1",
    title: "Babek Yek",
    titleTr: "İlk Kategori",
    description: "Kategoriyek qediya",
    descriptionTr: "Bir kategori bitirdin",
    icon: "🗂️",
    color: "#58CC02",
    metric: "categories",
    threshold: 1,
  },
  {
    id: "cat-5",
    title: "Pênc Bab",
    titleTr: "Beş Kategori",
    description: "5 kategorî qediya",
    descriptionTr: "5 kategori bitirdin",
    icon: "📚",
    color: "#1CB0F6",
    metric: "categories",
    threshold: 5,
    xpReward: 100,
  },
  {
    id: "cat-10",
    title: "Deh Bab",
    titleTr: "On Kategori",
    description: "10 kategorî qediya — Mamoste!",
    descriptionTr: "10 kategori — Öğretmen!",
    icon: "🎓",
    color: "#A560E8",
    metric: "categories",
    threshold: 10,
    xpReward: 300,
  },
  {
    id: "cat-all",
    title: "Hemû Bab",
    titleTr: "Tüm Kategoriler",
    description: "Hemû kategorî qediya — Lehengê Zimanê!",
    descriptionTr: "Tüm kategoriler bitti — Dil Kahramanı!",
    icon: "🦅",
    color: "#FFC200",
    metric: "categories",
    threshold: 21,
    xpReward: 1000,
  },
];

export type AchievementProgress = {
  achievement: Achievement;
  unlocked: boolean;
  current: number;
  pct: number;
};

export function computeAchievements(
  state: { xp: number; streak: number; lessonsCompleted: number; categoriesCompleted: number },
): AchievementProgress[] {
  return ACHIEVEMENTS.map((a) => {
    let current = 0;
    if (a.metric === "lessons") current = state.lessonsCompleted;
    else if (a.metric === "xp") current = state.xp;
    else if (a.metric === "streak") current = state.streak;
    else if (a.metric === "categories") current = state.categoriesCompleted;
    const unlocked = current >= a.threshold;
    const pct = Math.min(100, Math.round((current / a.threshold) * 100));
    return { achievement: a, unlocked, current, pct };
  });
}

// === LİG SİSTEMİ ===
export type League = {
  key: string;
  title: string;
  titleTr: string;
  icon: string;
  color: string;
  minXp: number;
  maxXp: number;
};

export const LEAGUES: League[] = [
  { key: "darin",    title: "Darîn",    titleTr: "Tahta",     icon: "🪵", color: "#8B6F47", minXp: 0,    maxXp: 100 },
  { key: "bronz",    title: "Bronz",    titleTr: "Bronz",     icon: "🥉", color: "#CD7F32", minXp: 100,  maxXp: 300 },
  { key: "ziv",      title: "Zîv",      titleTr: "Gümüş",     icon: "🥈", color: "#C0C0C0", minXp: 300,  maxXp: 700 },
  { key: "zer",      title: "Zêr",      titleTr: "Altın",     icon: "🥇", color: "#FFC200", minXp: 700,  maxXp: 1500 },
  { key: "sapphire", title: "Yaqût",    titleTr: "Yakut",     icon: "💎", color: "#1CB0F6", minXp: 1500, maxXp: 3000 },
  { key: "emerald",  title: "Mercan",   titleTr: "Zümrüt",    icon: "💚", color: "#58CC02", minXp: 3000, maxXp: 6000 },
  { key: "obsidian", title: "Obsidyan", titleTr: "Obsidyen",  icon: "🖤", color: "#4B4B4B", minXp: 6000, maxXp: 99999 },
];

export function getCurrentLeague(xp: number): { current: League; next: League | null; pct: number } {
  for (let i = 0; i < LEAGUES.length; i++) {
    const lg = LEAGUES[i];
    if (xp >= lg.minXp && xp < lg.maxXp) {
      const range = lg.maxXp - lg.minXp;
      const within = xp - lg.minXp;
      const pct = Math.round((within / range) * 100);
      return { current: lg, next: LEAGUES[i + 1] ?? null, pct };
    }
  }
  return { current: LEAGUES[LEAGUES.length - 1], next: null, pct: 100 };
}
