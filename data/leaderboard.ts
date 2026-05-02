/**
 * Mock leaderboard ve arkadaş verisi.
 * Gerçek backend bağlanana kadar bu sahte (deterministik) veriler kullanılır.
 * Tüm isimler Kürtçe karakteri olan tipik isimler.
 */

export type Player = {
  id: string;
  name: string;
  avatar: string;       // emoji
  xp: number;
  streak: number;
  league: string;
  isYou?: boolean;
  online?: boolean;
};

export type Friend = Player & {
  lastActive: string;
};

// === HAFTALIK LİG (mock) ===
export const WEEKLY_LEADERBOARD: Player[] = [
  { id: "p1",  name: "Bager Diren", avatar: "🦅",  xp: 2450, streak: 28, league: "zer" },
  { id: "p2",  name: "Zozan Yıldız", avatar: "🌟", xp: 2180, streak: 21, league: "zer" },
  { id: "p3",  name: "Azad Kaya",    avatar: "🐺", xp: 1890, streak: 15, league: "ziv" },
  { id: "p4",  name: "Helîn Demir",  avatar: "🦋", xp: 1620, streak: 14, league: "ziv" },
  { id: "p5",  name: "Diren Aslan",  avatar: "🦁", xp: 1480, streak: 12, league: "ziv" },
  { id: "p6",  name: "Rojda Sönmez", avatar: "🌹", xp: 1350, streak: 10, league: "ziv" },
  { id: "p7",  name: "Şivan Polat",  avatar: "🎵", xp: 1180, streak: 9,  league: "bronz" },
  { id: "p8",  name: "Berfîn Çelik", avatar: "❄️", xp: 990,  streak: 8,  league: "bronz" },
  { id: "p9",  name: "Mem Yılmaz",   avatar: "📚", xp: 870,  streak: 7,  league: "bronz" },
  { id: "p10", name: "Zîn Aydın",    avatar: "🌙", xp: 760,  streak: 6,  league: "bronz" },
  { id: "p11", name: "Cudi Ekin",    avatar: "⛰️", xp: 640,  streak: 5,  league: "bronz" },
  { id: "p12", name: "Newroz Şahin", avatar: "🔥", xp: 520,  streak: 5,  league: "bronz" },
  { id: "p13", name: "Welat Akın",   avatar: "🏳️", xp: 410,  streak: 4,  league: "darin" },
  { id: "p14", name: "Heval Yıldırım",avatar:"🤝", xp: 320,  streak: 3,  league: "darin" },
  { id: "p15", name: "Çiya Korkmaz", avatar: "🏔️", xp: 240,  streak: 3,  league: "darin" },
  { id: "p16", name: "Roj Tunç",     avatar: "☀️", xp: 180,  streak: 2,  league: "darin" },
  { id: "p17", name: "Av Güneş",     avatar: "💧", xp: 130,  streak: 2,  league: "darin" },
  { id: "p18", name: "Stêrk Erdem",  avatar: "✨", xp: 95,   streak: 1,  league: "darin" },
  { id: "p19", name: "Mizgîn Türk",  avatar: "🎁", xp: 60,   streak: 1,  league: "darin" },
  { id: "p20", name: "Berfîn Doğan", avatar: "🌸", xp: 30,   streak: 1,  league: "darin" },
];

// === ARKADAŞLAR (mock) ===
export const FRIENDS: Friend[] = [
  { id: "f1", name: "Zozan Yıldız",  avatar: "🌟", xp: 2180, streak: 21, league: "zer",   online: true,  lastActive: "şimdi" },
  { id: "f2", name: "Azad Kaya",     avatar: "🐺", xp: 1890, streak: 15, league: "ziv",   online: true,  lastActive: "şimdi" },
  { id: "f3", name: "Helîn Demir",   avatar: "🦋", xp: 1620, streak: 14, league: "ziv",   online: false, lastActive: "2 sa önce" },
  { id: "f4", name: "Şivan Polat",   avatar: "🎵", xp: 1180, streak: 9,  league: "bronz", online: false, lastActive: "1 gün önce" },
  { id: "f5", name: "Mem Yılmaz",    avatar: "📚", xp: 870,  streak: 7,  league: "bronz", online: true,  lastActive: "şimdi" },
];

/**
 * Gerçek kullanıcının XP'sine göre leaderboard'a yerleştirir.
 * Eğer XP yüksekse, listenin tepesine; düşükse, uygun yere ekler.
 */
export function buildLeaderboardWithUser(userXp: number, userStreak: number): Player[] {
  const you: Player = {
    id: "you",
    name: "Sen",
    avatar: "👤",
    xp: userXp,
    streak: userStreak,
    league: leagueFromXp(userXp),
    isYou: true,
  };
  // Insert into the right position
  const list = [...WEEKLY_LEADERBOARD, you];
  list.sort((a, b) => b.xp - a.xp);
  return list;
}

function leagueFromXp(xp: number): string {
  if (xp >= 1500) return "zer";
  if (xp >= 700) return "ziv";
  if (xp >= 300) return "bronz";
  return "darin";
}

// === HAFTALIK YARIŞMA ===
export const WEEKLY_CHALLENGE = {
  title: "Haftalık Meydan Okuma",
  titleKu: "Pêşbaziya Hefteyî",
  description: "Bu hafta 10 ders bitir, 100 bonus XP kazan!",
  descriptionKu: "Vê hefteyê 10 dersan biqedîne, 100 XP bonus bistîne!",
  goal: 10,
  reward: 100,
  endsIn: "3 gün 14 saat",
  endsInKu: "3 roj 14 saet",
};
