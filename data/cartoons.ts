/**
 * 📺 Çocuk için Kürtçe video küratörlüğü — Zarok TV ilhamlı
 *
 * Zarok TV (Diyarbakır, 2015'ten beri yayında):
 *   • Türkiye'nin ilk Kürtçe çocuk kanalı
 *   • Kurmancî/Zazaki/Sorani üç lehçede yayın
 *   • 24/7 yayın, 3-12 yaş hedefi
 *
 * Bu uygulamadaki içerik 5 kategoriye ayrılmıştır:
 *   1. Çizgi Filmler     — Sünger Bob, Pîya, Smurfs (Kurmancî dublaj)
 *   2. Şarkılar          — Stranên Zarokan, alfabe, sayılar
 *   3. Masallar          — Çîrokên Kurdî, halk hikayeleri
 *   4. Eğitici           — Firaz û Şengê, Dora Te, Hunerên Destan
 *   5. Spor & Hareket    — Yoga (Arîn û Beybûn), oyun
 *
 * Tüm linkler YouTube arama veya kanal sayfaları (telifsiz erişim).
 */

export type CartoonCategory = "cartoon" | "song" | "tale" | "educational" | "activity";

export type Cartoon = {
  id: string;
  category: CartoonCategory;
  title: string;       // Türkçe başlık (UI için)
  titleKu: string;     // Kürtçe başlık
  description: string;
  emoji: string;
  color: string;
  channel: string;
  url: string;
  /** Zarok TV resmi yapımı mı? */
  isOfficialZarok?: boolean;
};

// =====================================================================
//  KATEGORİ META BİLGİLERİ (UI için)
// =====================================================================

export const CARTOON_CATEGORIES: { id: CartoonCategory; label: string; labelKu: string; emoji: string; color: string }[] = [
  { id: "cartoon",     label: "Çizgi Filmler",  labelKu: "Karîkaturên Kurdî",   emoji: "🎬", color: "#FF6B9D" },
  { id: "song",        label: "Şarkılar",       labelKu: "Stranên Zarokan",      emoji: "🎵", color: "#1CB0F6" },
  { id: "tale",        label: "Masallar",        labelKu: "Çîrok û Çîvanok",     emoji: "📖", color: "#9B5DE5" },
  { id: "educational", label: "Eğitici",         labelKu: "Bername Yên Hîndê",   emoji: "🎓", color: "#58CC02" },
  { id: "activity",    label: "Spor & Aktivite", labelKu: "Sport û Çalakî",       emoji: "🤸", color: "#FF9600" },
];

export const CARTOONS: Cartoon[] = [
  // ─────────────────────────────────────────────────────
  // 🎬 ÇİZGİ FİLMLER (Zarok TV dublajları + Kurmancî animasyonlar)
  // ─────────────────────────────────────────────────────
  {
    id: "zarok-tv-main",
    category: "cartoon",
    title: "Zarok TV (Resmi Kanal)",
    titleKu: "Zarok TV — Kanala Resmî",
    description: "Türkiye'nin ilk Kürtçe çocuk kanalı. 24/7 Kurmancî yayın.",
    emoji: "📺",
    color: "#FF6B9D",
    channel: "Zarok TV (Diyarbakır)",
    url: "https://www.youtube.com/@ZarokTVKurmanci",
    isOfficialZarok: true,
  },
  {
    id: "spongebob-ku",
    category: "cartoon",
    title: "Sünger Bob (Kurmancî dublaj)",
    titleKu: "Bob Spancok — Kurmancî",
    description: "Sünger Bob klasik bölümleri Kürtçe seslendirmeyle",
    emoji: "🟡",
    color: "#FFC800",
    channel: "Zarok TV",
    url: "https://www.youtube.com/results?search_query=bob+spancok+kurmanci+zarok+tv",
    isOfficialZarok: true,
  },
  {
    id: "smurfs-ku",
    category: "cartoon",
    title: "Şirinler (Şirin Baba)",
    titleKu: "Şîrîn Baba — Şirinler",
    description: "Mavi Şirinler maceraları, Kurmancî dublaj",
    emoji: "💙",
    color: "#1CB0F6",
    channel: "Zarok TV",
    url: "https://www.youtube.com/results?search_query=%C5%9F%C3%AEr%C3%AEn+baba+kurmanci+zarok",
    isOfficialZarok: true,
  },
  {
    id: "piya",
    category: "cartoon",
    title: "Pîya (Kürtçe çizgi film)",
    titleKu: "Pîya — Animasyona Kurdî",
    description: "Orijinal Kürtçe animasyon serisi",
    emoji: "🦊",
    color: "#FF9600",
    channel: "Zarok TV",
    url: "https://www.youtube.com/results?search_query=p%C3%AEya+kurmanci+zarok",
    isOfficialZarok: true,
  },
  {
    id: "jijo-kewe",
    category: "cartoon",
    title: "Jîjo ile Kewe (Kirpi)",
    titleKu: "Jîjo û Kewe",
    description: "Kirpi Jîjo ve kızı Kewe'nin Kurmancî maceraları",
    emoji: "🦔",
    color: "#9C27B0",
    channel: "Zarok TV",
    url: "https://www.youtube.com/results?search_query=j%C3%AEjo+kewe+zarok+tv",
    isOfficialZarok: true,
  },
  {
    id: "azad",
    category: "cartoon",
    title: "Azad (Kürtçe çizgi film)",
    titleKu: "Azad",
    description: "Azad ve maceraları, eğitici bölümler",
    emoji: "🦸",
    color: "#27AE60",
    channel: "Zarok TV",
    url: "https://www.youtube.com/results?search_query=azad+kurmanci+zarok+tv",
    isOfficialZarok: true,
  },

  // ─────────────────────────────────────────────────────
  // 🎵 ŞARKILAR (Stranên Zarokan)
  // ─────────────────────────────────────────────────────
  {
    id: "alphabet-song",
    category: "song",
    title: "Kürtçe Alfabe Şarkısı",
    titleKu: "Stran a Alfabeya Kurdî",
    description: "31 harfin sesli ve görsel öğrenimi",
    emoji: "🔤",
    color: "#58CC02",
    channel: "Eğitim videoları",
    url: "https://www.youtube.com/results?search_query=alfabeya+kurd%C3%AE+ji+bo+zarokan+stran",
  },
  {
    id: "numbers-song",
    category: "song",
    title: "Sayılar Şarkısı (1-20)",
    titleKu: "Stran a Hejmaran",
    description: "Yek, du, sê... renkli sayma videosu",
    emoji: "🔢",
    color: "#FF9600",
    channel: "Eğitim",
    url: "https://www.youtube.com/results?search_query=hejmar+kurd%C3%AE+ji+bo+zarokan+stran",
  },
  {
    id: "colors-song",
    category: "song",
    title: "Renkler Şarkısı",
    titleKu: "Stran a Rengan",
    description: "Sor, şîn, kesk, zer — eğlenceli melodi",
    emoji: "🌈",
    color: "#FF86D0",
    channel: "Eğitim",
    url: "https://www.youtube.com/results?search_query=reng+kurd%C3%AE+stran+zarok",
  },
  {
    id: "animals-song",
    category: "song",
    title: "Hayvan Sesleri",
    titleKu: "Dengên Heywanan",
    description: "Çiftlik hayvanı sesleri Kurmancî adlarıyla",
    emoji: "🐮",
    color: "#FFC800",
    channel: "Eğitim",
    url: "https://www.youtube.com/results?search_query=heywan+kurd%C3%AE+stran+zarok",
  },
  {
    id: "lullabies",
    category: "song",
    title: "Ninni / Lori",
    titleKu: "Lorîn û Lalê",
    description: "Geleneksel Kürt ninnileri",
    emoji: "🌙",
    color: "#1A237E",
    channel: "Geleneksel",
    url: "https://www.youtube.com/results?search_query=lor%C3%AEn+kurd%C3%AE+zarok",
  },
  {
    id: "spotify-playlist",
    category: "song",
    title: "Spotify: Stranên Zarokan",
    titleKu: "Lîsteya Stranan",
    description: "130+ Kürtçe çocuk şarkısı playlist",
    emoji: "🎶",
    color: "#1DB954",
    channel: "Spotify",
    url: "https://open.spotify.com/playlist/2GoRfKLPAVw4SlqvTNZKxK",
  },

  // ─────────────────────────────────────────────────────
  // 📖 MASALLAR (Çîrokên Kurdî)
  // ─────────────────────────────────────────────────────
  {
    id: "ciroka-kurdi",
    category: "tale",
    title: "Kürtçe Masallar Genel",
    titleKu: "Çîrokên Kurdî",
    description: "Eski Kürt halk masalları, anlatılı animasyon",
    emoji: "📖",
    color: "#9B5DE5",
    channel: "Çîroka Kurdî",
    url: "https://www.youtube.com/results?search_query=%C3%A7%C3%AErok%C3%AAn+kurd%C3%AE+ji+bo+zarokan",
  },
  {
    id: "mem-zin",
    category: "tale",
    title: "Mem û Zîn (klasik)",
    titleKu: "Mem û Zîn",
    description: "Ahmedê Xanî'nin klasik Kürt aşk destanı (çocuk versiyonu)",
    emoji: "💞",
    color: "#E91E63",
    channel: "Klasik Edebiyat",
    url: "https://www.youtube.com/results?search_query=mem+%C3%BB+z%C3%AEn+zarok+%C3%A7%C3%AErok",
  },
  {
    id: "kawa-newroz",
    category: "tale",
    title: "Demirci Kawa & Newroz",
    titleKu: "Kawayê Hesinkar û Newroz",
    description: "Kawa'nın Dehak'ı yenmesi, Newroz efsanesi",
    emoji: "🔥",
    color: "#FF5722",
    channel: "Kültürel",
    url: "https://www.youtube.com/results?search_query=kawa+dehak+newroz+%C3%A7%C3%AErok",
  },
  {
    id: "bilbil-mewlud",
    category: "tale",
    title: "Bilbil û Mewlûd",
    titleKu: "Bilbil û Mewlûd",
    description: "Klasik Kürt halk masalı, animasyonlu anlatım",
    emoji: "🦜",
    color: "#CE82FF",
    channel: "Çîroka Kurdî",
    url: "https://www.youtube.com/results?search_query=bilbil+mewl%C3%BBd+%C3%A7%C3%AErok",
  },
  {
    id: "siyabend-xece",
    category: "tale",
    title: "Siyabend û Xecê",
    titleKu: "Siyabend û Xecê",
    description: "Kürt halk klasiği aşk hikayesi (çocuk uyarlaması)",
    emoji: "💕",
    color: "#FF9999",
    channel: "Klasik",
    url: "https://www.youtube.com/results?search_query=siyabend+xece+%C3%A7%C3%AErok+kurd%C3%AE",
  },

  // ─────────────────────────────────────────────────────
  // 🎓 EĞİTİCİ (Zarok TV original programs)
  // ─────────────────────────────────────────────────────
  {
    id: "firaz-senge",
    category: "educational",
    title: "Firaz ve Şengê'nin Evi",
    titleKu: "Mala Firaz û Şengê",
    description: "Dil öğrenme programı — kelime + cümle pratik",
    emoji: "🏠",
    color: "#58CC02",
    channel: "Zarok TV (resmi)",
    url: "https://www.youtube.com/results?search_query=firaz+%C5%9Feng%C3%AA+zarok+tv",
    isOfficialZarok: true,
  },
  {
    id: "dora-te",
    category: "educational",
    title: "Dora Te (Senin Sıran)",
    titleKu: "Dora Te",
    description: "Çocukların coğrafya, tarih, felsefe öğrettiği program",
    emoji: "🌍",
    color: "#0288D1",
    channel: "Zarok TV (resmi)",
    url: "https://www.youtube.com/results?search_query=dora+te+zarok+tv",
    isOfficialZarok: true,
  },
  {
    id: "huneren-destan",
    category: "educational",
    title: "Hunerên Destan (El Sanatları)",
    titleKu: "Hunerên Destan",
    description: "Adım adım el sanatları yapımı",
    emoji: "🎨",
    color: "#FF6B6B",
    channel: "Zarok TV (resmi)",
    url: "https://www.youtube.com/results?search_query=huner%C3%AAn+destan+zarok+tv",
    isOfficialZarok: true,
  },
  {
    id: "zarokistan",
    category: "educational",
    title: "Zarokistan (Çocuk Ülkesi)",
    titleKu: "Zarokistan",
    description: "Kurdistan'ın tarihi ve kültürel özellikleri",
    emoji: "🗺️",
    color: "#388E3C",
    channel: "Zarok TV (resmi)",
    url: "https://www.youtube.com/results?search_query=zarokistan+zarok+tv",
    isOfficialZarok: true,
  },
  {
    id: "great-figures",
    category: "educational",
    title: "Büyük Kürt Tarihçileri",
    titleKu: "Şexsên Mezin ên Dîroka Kurd",
    description: "Tanınmış Kürt isimler — biyografi",
    emoji: "👑",
    color: "#7B1FA2",
    channel: "Zarok TV (resmi)",
    url: "https://www.youtube.com/results?search_query=%C5%9Fexs%C3%AAn+mezin+kurd+zarok+tv",
    isOfficialZarok: true,
  },
  {
    id: "who-knows",
    category: "educational",
    title: "Kim Bilir? (Bilgi yarışması)",
    titleKu: "Kî Dizane?",
    description: "Eğlenceli bilgi yarışması — Kurmancî",
    emoji: "🤔",
    color: "#FFC800",
    channel: "Zarok TV (resmi)",
    url: "https://www.youtube.com/results?search_query=k%C3%AE+dizane+zarok+tv",
    isOfficialZarok: true,
  },

  // ─────────────────────────────────────────────────────
  // 🤸 SPOR & AKTİVİTE
  // ─────────────────────────────────────────────────────
  {
    id: "arin-beybun-yoga",
    category: "activity",
    title: "Arîn ve Beybûn (Yoga)",
    titleKu: "Arîn û Beybûn",
    description: "Çocuklar için Kurmancî yoga ve nefes egzersizleri",
    emoji: "🧘",
    color: "#9C27B0",
    channel: "Zarok TV (resmi)",
    url: "https://www.youtube.com/results?search_query=ar%C3%AEn+beyb%C3%BBn+yoga+zarok",
    isOfficialZarok: true,
  },
  {
    id: "games-streets",
    category: "activity",
    title: "Oyun ve Sokaklar",
    titleKu: "Lîstik û Kolan",
    description: "Geleneksel Kürt çocuk oyunları",
    emoji: "🎮",
    color: "#FF9600",
    channel: "Zarok TV (resmi)",
    url: "https://www.youtube.com/results?search_query=l%C3%AEstik+kolan+zarok+tv",
    isOfficialZarok: true,
  },
  {
    id: "draw-with-will",
    category: "activity",
    title: "Will ile Çiz!",
    titleKu: "Bi Will re Resim Bikişîne!",
    description: "Adım adım çizim dersleri",
    emoji: "✏️",
    color: "#1CB0F6",
    channel: "Zarok TV (resmi)",
    url: "https://www.youtube.com/results?search_query=draw+with+will+zarok+tv",
    isOfficialZarok: true,
  },
  {
    id: "amurjen",
    category: "activity",
    title: "Amûrjen (Küçük Maestro)",
    titleKu: "Amûrjen — Maestroyê Biçûk",
    description: "Müzik aletleri tanıtımı, küçük maestrolar",
    emoji: "🎻",
    color: "#FF5722",
    channel: "Zarok TV (resmi)",
    url: "https://www.youtube.com/results?search_query=am%C3%BBrjen+zarok+tv",
    isOfficialZarok: true,
  },
];
