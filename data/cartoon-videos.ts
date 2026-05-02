/**
 * Çizgi film / şarkı kataloğu — telifsiz Kurmancî YouTube içerikleri.
 *
 * Kaynak: Zarok TV (Diyarbakır, 2015'ten beri 24/7 Kurmancî yayın yapan
 * tek Kürtçe çocuk kanalı) ve diğer açık kanallar.
 *
 * Tüm videolar YouTube'da herkese açık, embed ile in-app oynatılır.
 * Telif: orijinal kanallar — biz sadece embed ediyoruz.
 */

export type CartoonCategory = "song" | "cartoon" | "edu";

export type CartoonVideo = {
  id: string;          // YouTube video ID
  title: string;       // Türkçe başlık
  titleKu: string;     // Kurmancî başlık
  description: string; // Türkçe açıklama
  channel: string;
  thumbnail: string;   // YouTube thumbnail URL
  category: CartoonCategory;
  duration?: string;   // örn. "3:21"
  emoji: string;       // dekoratif
  color: string;       // gradient için
};

export const CARTOON_CATEGORIES: { key: CartoonCategory; title: string; emoji: string; color: string }[] = [
  { key: "song",    title: "Şarkılar",        emoji: "🎵", color: "#FF6B9D" },
  { key: "cartoon", title: "Çizgi Filmler",   emoji: "📺", color: "#1CB0F6" },
  { key: "edu",     title: "Eğitici Videolar", emoji: "🎓", color: "#27AE60" },
];

// Curated Zarok TV koleksiyonu
export const CARTOON_VIDEOS: CartoonVideo[] = [
  // === ŞARKILAR ===
  {
    id: "lUrJL5pEHJA",
    title: "Yıldız Şarkısı",
    titleKu: "Gerestêrk",
    description: "Yıldızlar hakkında neşeli bir Kürtçe çocuk şarkısı",
    channel: "Zarok TV",
    thumbnail: "https://i.ytimg.com/vi/lUrJL5pEHJA/hqdefault.jpg",
    category: "song",
    emoji: "⭐",
    color: "#FFC72C",
  },
  {
    id: "CYliaO3XRPI",
    title: "Hayvan Şarkıları",
    titleKu: "Stranên Ajelan",
    description: "Çocuklar için Kürtçe hayvan şarkıları",
    channel: "Zarok TV",
    thumbnail: "https://i.ytimg.com/vi/CYliaO3XRPI/hqdefault.jpg",
    category: "song",
    emoji: "🐮",
    color: "#27AE60",
  },
  {
    id: "_mAEqFZqTB4",
    title: "Coşkulu Şarkılar",
    titleKu: "Stranên Bicoş",
    description: "Çocukların sevdiği coşkulu Kürtçe melodiler",
    channel: "Zarok TV",
    thumbnail: "https://i.ytimg.com/vi/_mAEqFZqTB4/hqdefault.jpg",
    category: "song",
    emoji: "🎵",
    color: "#FF6B9D",
  },

  // === ÇİZGİ FİLMLER ===
  {
    id: "zwmNu_-IULA",
    title: "Pêşangeh Bölüm 10",
    titleKu: "Pêşangeh — Beş 10",
    description: "Zarok TV'nin sevilen serisinden bir bölüm",
    channel: "Zarok TV",
    thumbnail: "https://i.ytimg.com/vi/zwmNu_-IULA/hqdefault.jpg",
    category: "cartoon",
    emoji: "📺",
    color: "#1CB0F6",
  },
  {
    id: "V6itFYefC7o",
    title: "Pêşangeh Bölüm 18",
    titleKu: "Pêşangeh — Beş 18",
    description: "Eğlenceli serüvenler dolu yeni bir bölüm",
    channel: "Zarok TV",
    thumbnail: "https://i.ytimg.com/vi/V6itFYefC7o/hqdefault.jpg",
    category: "cartoon",
    emoji: "🎬",
    color: "#5DADE2",
  },
  {
    id: "4gIp3_7Su44",
    title: "Pêşangeh Bölüm 19",
    titleKu: "Pêşangeh — Beş 19",
    description: "Çocuk dünyasından renkli bir bölüm",
    channel: "Zarok TV",
    thumbnail: "https://i.ytimg.com/vi/4gIp3_7Su44/hqdefault.jpg",
    category: "cartoon",
    emoji: "🌈",
    color: "#A560E8",
  },
  {
    id: "tr2GuIr-7wo",
    title: "Pêşangeh Bölüm 20",
    titleKu: "Pêşangeh — Beş 20",
    description: "Yeni karakterler ve serüvenler",
    channel: "Zarok TV",
    thumbnail: "https://i.ytimg.com/vi/tr2GuIr-7wo/hqdefault.jpg",
    category: "cartoon",
    emoji: "🎭",
    color: "#FF7043",
  },
  {
    id: "4fzooh-RwQw",
    title: "Pêşangeh Bölüm 21",
    titleKu: "Pêşangeh — Beş 21",
    description: "Sevdiğin karakterlerin son macerası",
    channel: "Zarok TV",
    thumbnail: "https://i.ytimg.com/vi/4fzooh-RwQw/hqdefault.jpg",
    category: "cartoon",
    emoji: "🎪",
    color: "#16A085",
  },
  {
    id: "3L1fJRuC5JI",
    title: "Bir Zamanlar 1. Bölüm",
    titleKu: "Carek Ji Caran — Beş 1",
    description: "Kürtçe masal serisinin ilk bölümü",
    channel: "Zarok TV",
    thumbnail: "https://i.ytimg.com/vi/3L1fJRuC5JI/hqdefault.jpg",
    category: "cartoon",
    emoji: "📖",
    color: "#8E44AD",
  },
  {
    id: "b1ZFIwn6wZc",
    title: "Bir Zamanlar 33. Bölüm",
    titleKu: "Carek Ji Caran — Beş 33",
    description: "Kurmancî masal serisinden bir bölüm",
    channel: "Zarok TV",
    thumbnail: "https://i.ytimg.com/vi/b1ZFIwn6wZc/hqdefault.jpg",
    category: "cartoon",
    emoji: "🦊",
    color: "#E67E22",
  },

  // === EĞİTİCİ ===
  {
    id: "Hk7GLsEouw8",
    title: "Pêşangeh Bölüm 4",
    titleKu: "Pêşangeh — Beş 4",
    description: "Eğitici hikayelerle Kurmancî öğrenme",
    channel: "Zarok TV",
    thumbnail: "https://i.ytimg.com/vi/Hk7GLsEouw8/hqdefault.jpg",
    category: "edu",
    emoji: "🎓",
    color: "#27AE60",
  },
  {
    id: "UhnTNca4ZBs",
    title: "Bikişîne Bişîne",
    titleKu: "Bikişîne Bişîne (S6 - Beş 15)",
    description: "Çocuklar için interaktif Kurmancî eğitim",
    channel: "Zarok TV",
    thumbnail: "https://i.ytimg.com/vi/UhnTNca4ZBs/hqdefault.jpg",
    category: "edu",
    emoji: "🧩",
    color: "#3498DB",
  },
];

export const getVideosByCategory = (cat: CartoonCategory): CartoonVideo[] =>
  CARTOON_VIDEOS.filter((v) => v.category === cat);

export const getVideoById = (id: string): CartoonVideo | undefined =>
  CARTOON_VIDEOS.find((v) => v.id === id);
