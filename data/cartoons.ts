/**
 * Çocuk için Kürtçe çizgi film & video küratörlüğü.
 *
 * YouTube linkleri Linking.openURL ile açılır.
 * Telifsiz/halka açık kanallar:
 *   • Zarok TV — Kürtçe çocuk kanalı (Kuzey Kürdistan)
 *   • Kurdistan TV Çocuk
 *   • Heqdas — Kurmancî hikayeler
 *   • Çîroka Kurdî — masal kanalı
 */

export type Cartoon = {
  id: string;
  title: string;       // Türkçe başlık
  titleKu: string;     // Kürtçe başlık
  description: string; // kısa açıklama
  emoji: string;
  color: string;       // gradyan için ana renk
  channel: string;     // YouTube kanal adı
  url: string;         // YouTube URL (kanal veya video)
  duration?: string;   // varsa süre
};

export const CARTOONS: Cartoon[] = [
  {
    id: "zarok-tv",
    title: "Zarok TV",
    titleKu: "Zarok TV",
    description: "Kürtçe çizgi filmler · masallar · şarkılar (resmi kanal)",
    emoji: "📺",
    color: "#FF6B9D",
    channel: "Zarok TV",
    url: "https://www.youtube.com/results?search_query=zarok+tv+kurd%C3%AE",
  },
  {
    id: "ciroka-kurdi",
    title: "Kürtçe Masallar",
    titleKu: "Çîrokên Kurdî",
    description: "Eski Kürt masalları, anlatılı animasyon",
    emoji: "📖",
    color: "#9B5DE5",
    channel: "Çîroka Kurdî",
    url: "https://www.youtube.com/results?search_query=%C3%A7%C3%AErok%C3%AAn+kurd%C3%AE+ji+bo+zarokan",
  },
  {
    id: "kurdi-songs",
    title: "Çocuk Şarkıları",
    titleKu: "Stranên Zarokan",
    description: "Kurmancî alfabe + sayma + sevgi şarkıları",
    emoji: "🎵",
    color: "#1CB0F6",
    channel: "Stranên zarokan",
    url: "https://www.youtube.com/results?search_query=stran%C3%AAn+zarokan+kurmanc%C3%AE",
  },
  {
    id: "alfabe",
    title: "Kürtçe Alfabe",
    titleKu: "Alfabeya Kurdî",
    description: "31 harfin sesleriyle eğlenceli öğrenim",
    emoji: "🔤",
    color: "#58CC02",
    channel: "Eğitim videoları",
    url: "https://www.youtube.com/results?search_query=alfabeya+kurd%C3%AE+ji+bo+zarokan",
  },
  {
    id: "hejmar",
    title: "Sayılar 1-20",
    titleKu: "Hejmar 1-20",
    description: "Renkli sayma videosu, çocuk sesli",
    emoji: "🔢",
    color: "#FF9600",
    channel: "Eğitim",
    url: "https://www.youtube.com/results?search_query=hejmar+kurd%C3%AE+ji+bo+zarokan",
  },
  {
    id: "renkler",
    title: "Renkler & Şekiller",
    titleKu: "Reng û Şikl",
    description: "Çizgi karakterlerle renk öğrenimi",
    emoji: "🌈",
    color: "#FF86D0",
    channel: "Eğitim",
    url: "https://www.youtube.com/results?search_query=reng+kurd%C3%AE+zarok",
  },
  {
    id: "heywan",
    title: "Hayvan Sesleri",
    titleKu: "Dengên Heywanan",
    description: "Çiftlik hayvanlarının Kürtçe adları + sesleri",
    emoji: "🐮",
    color: "#FFC800",
    channel: "Eğitim",
    url: "https://www.youtube.com/results?search_query=heywan+kurd%C3%AE+zarok",
  },
  {
    id: "masal-1",
    title: "Bilbil û Mewlûd",
    titleKu: "Bilbil û Mewlûd",
    description: "Kürt halk masalı, animasyonlu anlatım",
    emoji: "🦜",
    color: "#CE82FF",
    channel: "Çîroka Kurdî",
    url: "https://www.youtube.com/results?search_query=bilbil+mewl%C3%BBd+%C3%A7%C3%AErok",
  },
];
