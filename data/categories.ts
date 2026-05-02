/**
 * KurdîBêje — Tema (kategori) sistemi.
 *
 * Yetişkin modunda derslerin omurgası: ev, mutfak, aile, renk, sayı, tarih,
 * gezi, dünya gibi temalı bölümler. Her kategori aynı seviyede gruplanır
 * (a1/a2/b1/b2) ve içinde bir veya daha fazla ders barındırır.
 *
 * Kurmancî kelime içeriği için referans:
 *  - Wîkîferheng (CC-BY-SA, ~145k giriş)
 *  - Apertium-kmr (GPL, morfolojik veri)
 *  - KurdishHunspell (sinaahmadi/KurdishHunspell, 43k+ etiket)
 */
import type { Lesson, LevelKey } from "./lessons";

export type CategoryKey =
  // A1
  | "silav" | "hejmar" | "reng" | "malbat" | "mal" | "demjimer"
  | "xwarin" | "cil" | "las"
  // A2
  | "mitfax" | "bazar" | "gerr" | "hewa" | "rojane"
  // B1
  | "cihan" | "tendurusti" | "karkirin" | "cand";

export type CategoryWord = {
  ku: string;
  tr: string;
  emoji: string;
  example?: { ku: string; tr: string };
};

export type Category = {
  key: CategoryKey;
  title: string;        // Kurmancî
  titleTr: string;      // Türkçe
  icon: string;
  color: string;        // grid renk tonu
  level: LevelKey;
  description: string;
  descriptionTr: string;
  words: CategoryWord[];
  lessons: Lesson[];
};

// =============================================================
//  A1 — BINGEHÎN (TEMEL)
// =============================================================

const SILAV: Category = {
  key: "silav",
  title: "Silav û Naskirin",
  titleTr: "Selamlaşma & Tanışma",
  icon: "👋",
  color: "#58CC02",
  level: "a1",
  description: "Silav, navê xwe û naskirina yekem",
  descriptionTr: "Selam, isim ve ilk tanışma",
  words: [
    { ku: "Silav", tr: "Merhaba", emoji: "👋", example: { ku: "Silav, ez Bager im.", tr: "Merhaba, ben Bager'im." } },
    { ku: "Rojbaş", tr: "Günaydın", emoji: "☀️", example: { ku: "Rojbaş, mamoste!", tr: "Günaydın, öğretmenim!" } },
    { ku: "Êvarbaş", tr: "İyi akşamlar", emoji: "🌆", example: { ku: "Êvarbaş, malbatê!", tr: "İyi akşamlar, aile!" } },
    { ku: "Şevbaş", tr: "İyi geceler", emoji: "🌙", example: { ku: "Şevbaş, xewên xweş!", tr: "İyi geceler, tatlı rüyalar!" } },
    { ku: "Spas", tr: "Teşekkürler", emoji: "🙏", example: { ku: "Spas dikim.", tr: "Teşekkür ederim." } },
    { ku: "Ji kerema xwe", tr: "Lütfen", emoji: "🤲", example: { ku: "Ji kerema xwe, avê bide min.", tr: "Lütfen bana su ver." } },
    { ku: "Bibore", tr: "Affedersin", emoji: "😔", example: { ku: "Bibore, ez dereng mam.", tr: "Affedersin, geç kaldım." } },
    { ku: "Oxir be", tr: "Hoşça kal", emoji: "🤝", example: { ku: "Oxir be, hevalê min!", tr: "Hoşça kal, arkadaşım!" } },
    { ku: "Bi xatirê te", tr: "Güle güle", emoji: "👋", example: { ku: "Bi xatirê te, sibê dîsa!", tr: "Güle güle, yarın yine!" } },
    { ku: "Navê min ... e", tr: "Adım ...", emoji: "🏷️", example: { ku: "Navê min Zozan e.", tr: "Adım Zozan." } },
    { ku: "Tu çawa yî?", tr: "Nasılsın?", emoji: "❓", example: { ku: "Tu çawa yî, hevalê min?", tr: "Nasılsın, arkadaşım?" } },
    { ku: "Ez baş im", tr: "İyiyim", emoji: "👍", example: { ku: "Ez baş im, spas.", tr: "İyiyim, teşekkürler." } },
  ],
  lessons: [
    {
      id: "cat-silav-1",
      title: "Silav û Spas",
      titleTr: "Selam ve Teşekkür",
      icon: "👋",
      xp: 20,
      steps: [
        { type: "dialogue", title: "Yekem Naskirin", setting: "🏫 Li dibistanê", lines: [
          { speaker: "Bager", emoji: "🧑", text: "Silav! Navê min Bager e.", tr: "Merhaba! Adım Bager." },
          { speaker: "Zozan", emoji: "👧", text: "Silav, Bager! Ez Zozan im.", tr: "Merhaba, Bager! Ben Zozan." },
          { speaker: "Bager", emoji: "🧑", text: "Tu çawa yî?", tr: "Nasılsın?" },
          { speaker: "Zozan", emoji: "👧", text: "Ez baş im, spas. Tu çawa yî?", tr: "İyiyim, teşekkürler. Sen nasılsın?" },
          { speaker: "Bager", emoji: "🧑", text: "Ez jî baş im. Kêfxweş bûm!", tr: "Ben de iyiyim. Memnun oldum!" },
        ]},
        { type: "teach", word: "Silav", meaning: "Merhaba", emoji: "👋", sentence: "Silav, ez Bager im.", sentenceTr: "Merhaba, ben Bager'im.", tip: "Her ortamda kullanılan en yaygın selam." },
        { type: "teach", word: "Rojbaş", meaning: "Günaydın", emoji: "☀️", sentence: "Rojbaş, mamoste!", sentenceTr: "Günaydın, öğretmenim!", tip: "'Roj' = gün, 'baş' = iyi → İyi günler." },
        { type: "teach", word: "Êvarbaş", meaning: "İyi akşamlar", emoji: "🌆", sentence: "Êvarbaş, hevalno!", sentenceTr: "İyi akşamlar, arkadaşlar!", tip: "'Êvar' = akşam." },
        { type: "teach", word: "Spas", meaning: "Teşekkürler", emoji: "🙏", sentence: "Spas dikim!", sentenceTr: "Teşekkür ederim!", tip: "'Spas dikim' resmi/tam biçimdir; sadece 'Spas' da kullanılır." },
        { type: "pick", question: "'Günaydın' Kurmancî nedir?", options: ["Spas", "Rojbaş", "Şevbaş", "Oxir be"], correct: 1 },
        { type: "teach", word: "Bibore", meaning: "Affedersin", emoji: "😔", sentence: "Bibore, ez dereng mam.", sentenceTr: "Affedersin, geç kaldım.", tip: "'Borîn' = affetmek." },
        { type: "teach", word: "Ji kerema xwe", meaning: "Lütfen", emoji: "🤲", sentence: "Ji kerema xwe, avê bide min.", sentenceTr: "Lütfen, bana su ver.", tip: "'Kerem' = lütuf; çok kibar bir ifade." },
        { type: "match", instruction: "Eşleştir!", pairs: [
          { word: "Silav", meaning: "Merhaba" },
          { word: "Spas", meaning: "Teşekkürler" },
          { word: "Bibore", meaning: "Affedersin" },
          { word: "Oxir be", meaning: "Hoşça kal" },
        ]},
        { type: "teach", word: "Navê min ... e", meaning: "Adım ...", emoji: "🏷️", sentence: "Navê min Zozan e.", sentenceTr: "Adım Zozan.", tip: "'Nav' = isim. Kalıp: 'Navê min [isim] e'." },
        { type: "teach", word: "Tu çawa yî?", meaning: "Nasılsın?", emoji: "❓", sentence: "Tu çawa yî, hevalê min?", sentenceTr: "Nasılsın, arkadaşım?", tip: "'Çawa' = nasıl. 'yî' = sen-eki." },
        { type: "fill", sentence: "Navê min ___ e.", sentenceTr: "Adım ___.", hint: "🏷️", options: ["spas", "Zozan", "rojbaş"], correct: 1 },
        { type: "pick", question: "Birine 'Memnun oldum' nasıl denir?", options: ["Oxir be", "Kêfxweş bûm", "Spas dikim", "Êvarbaş"], correct: 1 },
        { type: "fill", sentence: "Ez ___ im, spas.", sentenceTr: "___, teşekkürler.", hint: "👍", options: ["baş", "dereng", "mezin"], correct: 0 },
      ],
    },
  ],
};

const HEJMAR: Category = {
  key: "hejmar",
  title: "Hejmar",
  titleTr: "Sayılar",
  icon: "🔢",
  color: "#1CB0F6",
  level: "a1",
  description: "Ji yek heta sed",
  descriptionTr: "Birden yüze",
  words: [
    { ku: "yek", tr: "1", emoji: "1️⃣", example: { ku: "Yek sêv li ser maseyê heye.", tr: "Masada bir elma var." } },
    { ku: "du", tr: "2", emoji: "2️⃣", example: { ku: "Du çavên min hene.", tr: "İki gözüm var." } },
    { ku: "sê", tr: "3", emoji: "3️⃣", example: { ku: "Sê stêr li ezman in.", tr: "Gökte üç yıldız var." } },
    { ku: "çar", tr: "4", emoji: "4️⃣", example: { ku: "Çar demsalên salê.", tr: "Yılın dört mevsimi." } },
    { ku: "pênc", tr: "5", emoji: "5️⃣", example: { ku: "Pênc tilî di destan de.", tr: "Elde beş parmak." } },
    { ku: "şeş", tr: "6", emoji: "6️⃣", example: { ku: "Şeş kursî hene.", tr: "Altı sandalye var." } },
    { ku: "heft", tr: "7", emoji: "7️⃣", example: { ku: "Heft rojên hefteyê.", tr: "Haftanın yedi günü." } },
    { ku: "heşt", tr: "8", emoji: "8️⃣", example: { ku: "Heşt mehên zivistanê.", tr: "Sekiz kış ayı." } },
    { ku: "neh", tr: "9", emoji: "9️⃣", example: { ku: "Neh meh berê hat.", tr: "Dokuz ay önce geldi." } },
    { ku: "deh", tr: "10", emoji: "🔟", example: { ku: "Deh tilîyên min hene.", tr: "On parmağım var." } },
    { ku: "bîst", tr: "20", emoji: "🔢", example: { ku: "Bîst sal in li vir im.", tr: "Yirmi yıldır buradayım." } },
    { ku: "sed", tr: "100", emoji: "💯", example: { ku: "Sed lîre.", tr: "Yüz lira." } },
  ],
  lessons: [
    {
      id: "cat-hejmar-1",
      title: "Ji 1 Heta 10",
      titleTr: "1'den 10'a",
      icon: "🔢",
      xp: 20,
      steps: [
        { type: "teach", word: "Yek", meaning: "1", emoji: "1️⃣", sentence: "Yek sêv li ser maseyê heye.", sentenceTr: "Masada bir elma var.", tip: "'Yekta' = tek/biricik." },
        { type: "teach", word: "Du", meaning: "2", emoji: "2️⃣", sentence: "Du çavên min hene.", sentenceTr: "İki gözüm var.", tip: "'Ducar' = iki kez." },
        { type: "teach", word: "Sê", meaning: "3", emoji: "3️⃣", sentence: "Sê stêr li ezman in.", sentenceTr: "Gökte üç yıldız var.", tip: "'Sêgoşe' = üçgen." },
        { type: "teach", word: "Çar", meaning: "4", emoji: "4️⃣", sentence: "Çar demsalên salê.", sentenceTr: "Yılın dört mevsimi.", tip: "'Çarşem' = Çarşamba (4. gün)." },
        { type: "teach", word: "Pênc", meaning: "5", emoji: "5️⃣", sentence: "Pênc tilî di destan de.", sentenceTr: "Elde beş parmak.", tip: "'Pêncşem' = Perşembe." },
        { type: "pick", question: "'Sê' kaç?", options: ["2", "3", "4", "5"], correct: 1 },
        { type: "teach", word: "Şeş", meaning: "6", emoji: "6️⃣", sentence: "Şeş kursî hene.", sentenceTr: "Altı sandalye var.", tip: "'Şeşek' = altılık." },
        { type: "teach", word: "Heft", meaning: "7", emoji: "7️⃣", sentence: "Heft rojên hefteyê.", sentenceTr: "Haftanın yedi günü.", tip: "'Hefte' = hafta (heft kökünden)." },
        { type: "teach", word: "Heşt", meaning: "8", emoji: "8️⃣", sentence: "Heşt mehên zivistanê.", sentenceTr: "Sekiz kış ayı.", tip: "Bazı bölgelerde 'heyşt' de denir." },
        { type: "teach", word: "Neh", meaning: "9", emoji: "9️⃣", sentence: "Neh meh berê hat.", sentenceTr: "Dokuz ay önce geldi.", tip: "Bebek doğum süresine eşittir." },
        { type: "teach", word: "Deh", meaning: "10", emoji: "🔟", sentence: "Deh tilîyên min hene.", sentenceTr: "On parmağım var.", tip: "Onlu sayma sistemi." },
        { type: "match", instruction: "Sayıları eşleştir!", pairs: [
          { word: "Pênc", meaning: "5" },
          { word: "Heft", meaning: "7" },
          { word: "Neh", meaning: "9" },
          { word: "Deh", meaning: "10" },
        ]},
        { type: "fill", sentence: "Hefte ___ roj e.", sentenceTr: "Hafta ___ gündür.", hint: "📅", options: ["pênc", "şeş", "heft"], correct: 2 },
        { type: "pick", question: "'Heşt' kaç?", options: ["6", "7", "8", "9"], correct: 2 },
        { type: "fill", sentence: "Çar û ___ deh dike.", sentenceTr: "Dört artı ___ on eder.", hint: "➕", options: ["çar", "şeş", "deh"], correct: 1 },
      ],
    },
  ],
};

const RENG: Category = {
  key: "reng",
  title: "Reng",
  titleTr: "Renkler",
  icon: "🎨",
  color: "#FF4B4B",
  level: "a1",
  description: "Rengên cîhanê",
  descriptionTr: "Dünyanın renkleri",
  words: [
    { ku: "sor", tr: "kırmızı", emoji: "🔴", example: { ku: "Sêv sor e.", tr: "Elma kırmızıdır." } },
    { ku: "kesk", tr: "yeşil", emoji: "🟢", example: { ku: "Dar kesk e.", tr: "Ağaç yeşildir." } },
    { ku: "zer", tr: "sarı", emoji: "🟡", example: { ku: "Roj zer e.", tr: "Güneş sarıdır." } },
    { ku: "şîn", tr: "mavi", emoji: "🔵", example: { ku: "Ezman şîn e.", tr: "Gökyüzü mavidir." } },
    { ku: "spî", tr: "beyaz", emoji: "⚪", example: { ku: "Berf spî ye.", tr: "Kar beyazdır." } },
    { ku: "reş", tr: "siyah", emoji: "⚫", example: { ku: "Şev reş e.", tr: "Gece siyahtır." } },
    { ku: "qehweyî", tr: "kahverengi", emoji: "🟤", example: { ku: "Erd qehweyî ye.", tr: "Toprak kahverengidir." } },
    { ku: "porteqalî", tr: "turuncu", emoji: "🟠", example: { ku: "Porteqal porteqalî ye.", tr: "Portakal turuncudur." } },
    { ku: "binefşî", tr: "mor", emoji: "🟣", example: { ku: "Gula binefşî xweş e.", tr: "Mor gül güzeldir." } },
    { ku: "gewr", tr: "gri", emoji: "🩶", example: { ku: "Ewran gewr in.", tr: "Bulutlar gridir." } },
    { ku: "pembe", tr: "pembe", emoji: "🌸", example: { ku: "Gula pembe.", tr: "Pembe gül." } },
    { ku: "zêrîn", tr: "altın", emoji: "🪙", example: { ku: "Zîvên zêrîn.", tr: "Altın takılar." } },
  ],
  lessons: [
    {
      id: "cat-reng-1",
      title: "Rengên Bingehîn",
      titleTr: "Temel Renkler",
      icon: "🎨",
      xp: 20,
      steps: [
        { type: "teach", word: "Sor", meaning: "Kırmızı", emoji: "🔴", sentence: "Sêv sor e.", sentenceTr: "Elma kırmızıdır.", tip: "Kürt bayrağındaki güneş de sor'dur." },
        { type: "teach", word: "Kesk", meaning: "Yeşil", emoji: "🟢", sentence: "Dar kesk e.", sentenceTr: "Ağaç yeşildir.", tip: "'Kesk' doğanın rengidir." },
        { type: "teach", word: "Zer", meaning: "Sarı", emoji: "🟡", sentence: "Roj zer e.", sentenceTr: "Güneş sarıdır.", tip: "'Zer' aynı zamanda 'altın' anlamında da kullanılır." },
        { type: "teach", word: "Şîn", meaning: "Mavi", emoji: "🔵", sentence: "Ezman şîn e.", sentenceTr: "Gökyüzü mavidir.", tip: "'Şîn' aynı zamanda 'yas' demektir." },
        { type: "teach", word: "Spî", meaning: "Beyaz", emoji: "⚪", sentence: "Berf spî ye.", sentenceTr: "Kar beyazdır.", tip: "'Rûspî' = yüzü ak (onurlu)." },
        { type: "teach", word: "Reş", meaning: "Siyah", emoji: "⚫", sentence: "Şev reş e.", sentenceTr: "Gece siyahtır.", tip: "'Çavreş' = karagöz (iltifat)." },
        { type: "pick", question: "'Yeşil' Kurmancî nedir?", options: ["Sor", "Kesk", "Zer", "Şîn"], correct: 1 },
        { type: "visualPick", question: "'Sor' kîjan reng e?", actions: ["drink", "walk", "run", "sleep"], labels: ["🔴 Sor", "🟢 Kesk", "🟡 Zer", "🔵 Şîn"], correct: 0 },
        { type: "teach", word: "Qehweyî", meaning: "Kahverengi", emoji: "🟤", sentence: "Erd qehweyî ye.", sentenceTr: "Toprak kahverengidir.", tip: "'Qehwe' = kahve." },
        { type: "teach", word: "Porteqalî", meaning: "Turuncu", emoji: "🟠", sentence: "Porteqal porteqalî ye.", sentenceTr: "Portakal turuncudur.", tip: "Meyve adından türemiş." },
        { type: "match", instruction: "Renkleri eşleştir!", pairs: [
          { word: "Sor", meaning: "🔴" },
          { word: "Kesk", meaning: "🟢" },
          { word: "Şîn", meaning: "🔵" },
          { word: "Reş", meaning: "⚫" },
        ]},
        { type: "fill", sentence: "Berf ___ ye.", sentenceTr: "Kar ___dır.", hint: "❄️⚪", options: ["reş", "spî", "sor"], correct: 1 },
        { type: "fill", sentence: "Ezman ___ e.", sentenceTr: "Gökyüzü ___dir.", hint: "🌌", options: ["şîn", "zer", "kesk"], correct: 0 },
        { type: "pick", question: "'Reş' ne demek?", options: ["Beyaz", "Siyah", "Mavi", "Kırmızı"], correct: 1 },
      ],
    },
  ],
};

const MALBAT: Category = {
  key: "malbat",
  title: "Malbat",
  titleTr: "Aile",
  icon: "👨‍👩‍👧‍👦",
  color: "#F49000",
  level: "a1",
  description: "Endamên malbatê",
  descriptionTr: "Aile bireyleri",
  words: [
    { ku: "dayik", tr: "anne", emoji: "👩", example: { ku: "Dayika min mamoste ye.", tr: "Annem öğretmendir." } },
    { ku: "bav", tr: "baba", emoji: "👨", example: { ku: "Bavê min karker e.", tr: "Babam işçidir." } },
    { ku: "kur", tr: "oğul", emoji: "👦", example: { ku: "Kurê min biçûk e.", tr: "Oğlum küçüktür." } },
    { ku: "keç", tr: "kız", emoji: "👧", example: { ku: "Keça min jîr e.", tr: "Kızım zekidir." } },
    { ku: "bira", tr: "erkek kardeş", emoji: "👦", example: { ku: "Birayê min mezin e.", tr: "Kardeşim büyüktür." } },
    { ku: "xwişk", tr: "kız kardeş", emoji: "👧", example: { ku: "Xwişka min hunermend e.", tr: "Kız kardeşim sanatçıdır." } },
    { ku: "kalik", tr: "dede", emoji: "👴", example: { ku: "Kalikê min serpêhatî dibêje.", tr: "Dedem hikâye anlatır." } },
    { ku: "dapîr", tr: "babaanne/anneanne", emoji: "👵", example: { ku: "Dapîra min nan dipêje.", tr: "Ninem ekmek pişirir." } },
    { ku: "ap", tr: "amca", emoji: "🧑", example: { ku: "Apê min li bajêr dijî.", tr: "Amcam şehirde yaşıyor." } },
    { ku: "met", tr: "hala", emoji: "👩", example: { ku: "Meta min hat malê.", tr: "Halam eve geldi." } },
    { ku: "xal", tr: "dayı", emoji: "🧑", example: { ku: "Xalê min cotkar e.", tr: "Dayım çiftçidir." } },
    { ku: "xaltî", tr: "teyze", emoji: "👩", example: { ku: "Xaltiya min nas dike.", tr: "Teyzem tanıyor." } },
    { ku: "jin", tr: "kadın/eş", emoji: "👩", example: { ku: "Jina wî baş e.", tr: "Onun eşi iyidir." } },
    { ku: "mêr", tr: "erkek/koca", emoji: "👨", example: { ku: "Mêrê wê dixebite.", tr: "Onun kocası çalışıyor." } },
    { ku: "zarok", tr: "çocuk", emoji: "🧒", example: { ku: "Zarok dilîzin.", tr: "Çocuklar oynuyor." } },
  ],
  lessons: [
    {
      id: "cat-malbat-1",
      title: "Malbata Min",
      titleTr: "Ailem",
      icon: "👨‍👩‍👧",
      xp: 25,
      steps: [
        { type: "dialogue", title: "Malbata Min", setting: "🏠 Li malê", lines: [
          { speaker: "Bager", emoji: "🧑", text: "Ev wêneya malbata min e.", tr: "Bu ailemin fotoğrafıdır." },
          { speaker: "Heval", emoji: "👤", text: "Wow! Ev kî ye?", tr: "Vay! Bu kim?" },
          { speaker: "Bager", emoji: "🧑", text: "Ev dayika min e, ew jî bavê min e.", tr: "Bu annem, o da babam." },
          { speaker: "Heval", emoji: "👤", text: "Birayên te hene?", tr: "Erkek kardeşin var mı?" },
          { speaker: "Bager", emoji: "🧑", text: "Erê, du bira û xwişkek min hene.", tr: "Evet, iki erkek kardeşim ve bir kız kardeşim var." },
        ]},
        { type: "teach", word: "Dayik", meaning: "Anne", emoji: "👩", sentence: "Dayika min mamoste ye.", sentenceTr: "Annem öğretmendir.", tip: "Sevgiyle 'dayê' de denir." },
        { type: "teach", word: "Bav", meaning: "Baba", emoji: "👨", sentence: "Bavê min karker e.", sentenceTr: "Babam işçidir.", tip: "Sevgiyle 'bavo' da denir." },
        { type: "teach", word: "Bira", meaning: "Erkek kardeş", emoji: "👦", sentence: "Birayê min mezin e.", sentenceTr: "Kardeşim büyüktür.", tip: "'Bira' her yaşta erkek kardeş için kullanılır." },
        { type: "teach", word: "Xwişk", meaning: "Kız kardeş", emoji: "👧", sentence: "Xwişka min jîr e.", sentenceTr: "Kız kardeşim zekidir.", tip: "'Xwiş' kısaltması da kullanılır." },
        { type: "pick", question: "'Anne' Kurmancî nedir?", options: ["Bav", "Dayik", "Xwişk", "Kalik"], correct: 1 },
        { type: "teach", word: "Kalik", meaning: "Dede", emoji: "👴", sentence: "Kalikê min 80 salî ye.", sentenceTr: "Dedem 80 yaşındadır.", tip: "'Bapîr' de denir bazı bölgelerde." },
        { type: "teach", word: "Dapîr", meaning: "Nine/Anneanne", emoji: "👵", sentence: "Dapîra min nan dipêje.", sentenceTr: "Ninem ekmek pişirir.", tip: "'Dapîr' = 'Day-pîr' (yaşlı anne)." },
        { type: "teach", word: "Ap", meaning: "Amca", emoji: "🧑", sentence: "Apê min cotkar e.", sentenceTr: "Amcam çiftçidir.", tip: "Babanın erkek kardeşi." },
        { type: "teach", word: "Xal", meaning: "Dayı", emoji: "🧑", sentence: "Xalê min hat ziyaretê.", sentenceTr: "Dayım ziyarete geldi.", tip: "Annenin erkek kardeşi." },
        { type: "match", instruction: "Eşleştir!", pairs: [
          { word: "Dayik", meaning: "Anne" },
          { word: "Bav", meaning: "Baba" },
          { word: "Xal", meaning: "Dayı" },
          { word: "Met", meaning: "Hala" },
        ]},
        { type: "fill", sentence: "Birayê min ji min ___ e.", sentenceTr: "Kardeşim benden ___.", hint: "📏", options: ["mezin", "kesk", "zêde"], correct: 0 },
        { type: "pick", question: "Annenin erkek kardeşine ne denir?", options: ["Ap", "Xal", "Kalik", "Bav"], correct: 1 },
        { type: "fill", sentence: "Dapîra min nan ___.", sentenceTr: "Ninem ekmek ___.", hint: "🍞", options: ["dixwe", "dipêje", "dimeşe"], correct: 1 },
      ],
    },
  ],
};

const MAL: Category = {
  key: "mal",
  title: "Mal û Jûr",
  titleTr: "Ev ve Odalar",
  icon: "🏠",
  color: "#A560E8",
  level: "a1",
  description: "Mal, jûr û tiştên malê",
  descriptionTr: "Ev, odalar ve eşyalar",
  words: [
    { ku: "mal", tr: "ev", emoji: "🏠", example: { ku: "Ev mala min e.", tr: "Bu benim evimdir." } },
    { ku: "jûr", tr: "oda", emoji: "🚪", example: { ku: "Jûra min biçûk e.", tr: "Odam küçüktür." } },
    { ku: "derî", tr: "kapı", emoji: "🚪", example: { ku: "Derî girtî ye.", tr: "Kapı kapalıdır." } },
    { ku: "pencere", tr: "pencere", emoji: "🪟", example: { ku: "Pencere vekirî ye.", tr: "Pencere açıktır." } },
    { ku: "dîwar", tr: "duvar", emoji: "🧱", example: { ku: "Dîwar spî ye.", tr: "Duvar beyazdır." } },
    { ku: "ban", tr: "çatı", emoji: "🏘️", example: { ku: "Ban bilind e.", tr: "Çatı yüksektir." } },
    { ku: "erd", tr: "yer/zemin", emoji: "⬇️", example: { ku: "Erd paqij e.", tr: "Yer temizdir." } },
    { ku: "mase", tr: "masa", emoji: "🪑", example: { ku: "Mase mezin e.", tr: "Masa büyüktür." } },
    { ku: "kursî", tr: "sandalye", emoji: "🪑", example: { ku: "Kursî nû ye.", tr: "Sandalye yenidir." } },
    { ku: "nivîn", tr: "yatak", emoji: "🛏️", example: { ku: "Ez li ser nivînê radizim.", tr: "Yatakta uyuyorum." } },
    { ku: "mifte", tr: "anahtar", emoji: "🔑", example: { ku: "Mifte li ku ye?", tr: "Anahtar nerede?" } },
    { ku: "lambe", tr: "lamba", emoji: "💡", example: { ku: "Lambe vêkirî ye.", tr: "Lamba yanıktır." } },
    { ku: "qad", tr: "halı", emoji: "🟫", example: { ku: "Qada nû ye.", tr: "Halı yenidir." } },
    { ku: "pelîn", tr: "raf", emoji: "📚", example: { ku: "Pirtûk li ser pelînê ne.", tr: "Kitaplar rafta." } },
    { ku: "serşok", tr: "banyo", emoji: "🚿", example: { ku: "Serşok teng e.", tr: "Banyo dardır." } },
  ],
  lessons: [
    {
      id: "cat-mal-1",
      title: "Mal û Jûr",
      titleTr: "Ev ve Odalar",
      icon: "🏠",
      xp: 25,
      steps: [
        { type: "scene", scene: "🏠", verb: "dijîm", meaning: "yaşıyorum", person: "Ez", full: "Ez li malê dijîm.", fullTr: "Evde yaşıyorum.", tip: "'Jiyîn' = yaşamak. 'Li malê' = evde." },
        { type: "teach", word: "Mal", meaning: "Ev", emoji: "🏠", sentence: "Ev mala min e.", sentenceTr: "Bu benim evimdir.", tip: "'Mala min' = benim evim ('-a' bağlama harfi)." },
        { type: "teach", word: "Jûr", meaning: "Oda", emoji: "🚪", sentence: "Jûra min biçûk e.", sentenceTr: "Odam küçüktür.", tip: "'Ode' de yaygın kullanılır." },
        { type: "teach", word: "Derî", meaning: "Kapı", emoji: "🚪", sentence: "Derî vekirî ye.", sentenceTr: "Kapı açıktır.", tip: "'Vekirî' = açık, 'girtî' = kapalı." },
        { type: "teach", word: "Pencere", meaning: "Pencere", emoji: "🪟", sentence: "Pencere mezin e.", sentenceTr: "Pencere büyüktür.", tip: "Bazı bölgelerde 'şibak' da denir." },
        { type: "teach", word: "Dîwar", meaning: "Duvar", emoji: "🧱", sentence: "Dîwar spî ye.", sentenceTr: "Duvar beyazdır.", tip: "'Dîwarê malê' = evin duvarı." },
        { type: "pick", question: "'Pencere' Kurmancî nedir?", options: ["Derî", "Pencere", "Dîwar", "Ban"], correct: 1 },
        { type: "teach", word: "Mase", meaning: "Masa", emoji: "🪑", sentence: "Mase ji dar e.", sentenceTr: "Masa ahşaptan.", tip: "'Ji dar' = ağaçtan." },
        { type: "teach", word: "Kursî", meaning: "Sandalye", emoji: "🪑", sentence: "Çar kursî hene.", sentenceTr: "Dört sandalye var.", tip: "'Kurs' = oturak." },
        { type: "teach", word: "Nivîn", meaning: "Yatak", emoji: "🛏️", sentence: "Ez li ser nivînê radizim.", sentenceTr: "Yatakta uyuyorum.", tip: "'Cih' de yatak/yer için kullanılır." },
        { type: "teach", word: "Mifte", meaning: "Anahtar", emoji: "🔑", sentence: "Mifte li ku ye?", sentenceTr: "Anahtar nerede?", tip: "'Kilîl' de denir bazı bölgelerde." },
        { type: "match", instruction: "Eşleştir!", pairs: [
          { word: "Derî", meaning: "Kapı" },
          { word: "Mase", meaning: "Masa" },
          { word: "Nivîn", meaning: "Yatak" },
          { word: "Mifte", meaning: "Anahtar" },
        ]},
        { type: "fill", sentence: "Ez li ser ___ radizim.", sentenceTr: "___ uyuyorum.", hint: "🛏️", options: ["maseyê", "nivînê", "kursiyê"], correct: 1 },
        { type: "pick", question: "'Banyo' Kurmancî nedir?", options: ["Mitfax", "Serşok", "Jûr", "Pelîn"], correct: 1 },
        { type: "fill", sentence: "Derî ___ e.", sentenceTr: "Kapı ___.", hint: "🚪✅", options: ["vekirî", "girtî", "biçûk"], correct: 0 },
      ],
    },
  ],
};

const DEMJIMER: Category = {
  key: "demjimer",
  title: "Demjimêr û Roj",
  titleTr: "Saat ve Günler",
  icon: "🕐",
  color: "#FFC200",
  level: "a1",
  description: "Wext, roj û meh",
  descriptionTr: "Zaman, gün ve aylar",
  words: [
    { ku: "demjimêr", tr: "saat", emoji: "🕐", example: { ku: "Demjimêr çend e?", tr: "Saat kaç?" } },
    { ku: "deqîqe", tr: "dakika", emoji: "⏱️", example: { ku: "Deh deqîqe ma.", tr: "On dakika kaldı." } },
    { ku: "saniye", tr: "saniye", emoji: "⏲️", example: { ku: "Bîst saniye in.", tr: "Yirmi saniyedir." } },
    { ku: "îro", tr: "bugün", emoji: "📅", example: { ku: "Îro Yekşem e.", tr: "Bugün Pazar." } },
    { ku: "duh", tr: "dün", emoji: "⏪", example: { ku: "Duh ez nehatim.", tr: "Dün gelmedim." } },
    { ku: "sibê", tr: "yarın", emoji: "⏩", example: { ku: "Em ê sibê biçin.", tr: "Yarın gideceğiz." } },
    { ku: "Yekşem", tr: "Pazar", emoji: "1️⃣", example: { ku: "Yekşem em radizin.", tr: "Pazar uyuruz." } },
    { ku: "Duşem", tr: "Pazartesi", emoji: "2️⃣", example: { ku: "Duşem dest pê dike.", tr: "Pazartesi başlar." } },
    { ku: "Sêşem", tr: "Salı", emoji: "3️⃣", example: { ku: "Sêşem ders heye.", tr: "Salı ders var." } },
    { ku: "Çarşem", tr: "Çarşamba", emoji: "4️⃣", example: { ku: "Çarşem em diçin bazarê.", tr: "Çarşamba pazara gideriz." } },
    { ku: "Pêncşem", tr: "Perşembe", emoji: "5️⃣", example: { ku: "Pêncşem em axavtinê dikin.", tr: "Perşembe konuşuruz." } },
    { ku: "În", tr: "Cuma", emoji: "6️⃣", example: { ku: "Roja Înê pîroz e.", tr: "Cuma günü kutsaldır." } },
    { ku: "Şemî", tr: "Cumartesi", emoji: "7️⃣", example: { ku: "Şemî em betal in.", tr: "Cumartesi tatildeyiz." } },
    { ku: "meh", tr: "ay", emoji: "📆", example: { ku: "Meha hilberînê.", tr: "Üretim ayı." } },
    { ku: "sal", tr: "yıl", emoji: "🗓️", example: { ku: "Sala 2026.", tr: "2026 yılı." } },
  ],
  lessons: [
    {
      id: "cat-demjimer-1",
      title: "Roj û Wext",
      titleTr: "Gün ve Zaman",
      icon: "🕐",
      xp: 25,
      steps: [
        { type: "teach", word: "Îro", meaning: "Bugün", emoji: "📅", sentence: "Îro Sêşem e.", sentenceTr: "Bugün Salı.", tip: "'Îro' = bu gün." },
        { type: "teach", word: "Duh", meaning: "Dün", emoji: "⏪", sentence: "Duh sar bû.", sentenceTr: "Dün soğuktu.", tip: "'Bû' = idi (geçmiş zaman)." },
        { type: "teach", word: "Sibê", meaning: "Yarın", emoji: "⏩", sentence: "Em ê sibê biçin.", sentenceTr: "Yarın gideceğiz.", tip: "'Sibê' aynı zamanda 'sabah' demektir; bağlama göre değişir." },
        { type: "teach", word: "Yekşem", meaning: "Pazar", emoji: "1️⃣", sentence: "Yekşem em radizin.", sentenceTr: "Pazar uyuruz.", tip: "'Yek' (1) + 'şem' kökünden." },
        { type: "teach", word: "Duşem", meaning: "Pazartesi", emoji: "2️⃣", sentence: "Duşem ders dest pê dike.", sentenceTr: "Pazartesi ders başlar.", tip: "'Du' (2) + 'şem'." },
        { type: "teach", word: "Sêşem", meaning: "Salı", emoji: "3️⃣", sentence: "Sêşem em pratîkê dikin.", sentenceTr: "Salı pratik yaparız.", tip: "'Sê' (3) + 'şem'." },
        { type: "teach", word: "Çarşem", meaning: "Çarşamba", emoji: "4️⃣", sentence: "Çarşem em diçin bazarê.", sentenceTr: "Çarşamba pazara gideriz.", tip: "'Çar' (4) + 'şem'." },
        { type: "teach", word: "Pêncşem", meaning: "Perşembe", emoji: "5️⃣", sentence: "Pêncşem em fêr dibin.", sentenceTr: "Perşembe öğreniyoruz.", tip: "'Pênc' (5) + 'şem'." },
        { type: "teach", word: "În", meaning: "Cuma", emoji: "6️⃣", sentence: "Roja Înê.", sentenceTr: "Cuma günü.", tip: "Sayı kuralından farklı, kendine özgü ad." },
        { type: "teach", word: "Şemî", meaning: "Cumartesi", emoji: "7️⃣", sentence: "Şemî em vedimirin.", sentenceTr: "Cumartesi dinleniriz.", tip: "Hafta sonu." },
        { type: "pick", question: "'Bugün' Kurmancî nedir?", options: ["Duh", "Îro", "Sibê", "Hefte"], correct: 1 },
        { type: "match", instruction: "Günleri eşleştir!", pairs: [
          { word: "Yekşem", meaning: "Pazar" },
          { word: "Duşem", meaning: "Pazartesi" },
          { word: "Çarşem", meaning: "Çarşamba" },
          { word: "Şemî", meaning: "Cumartesi" },
        ]},
        { type: "teach", word: "Demjimêr", meaning: "Saat", emoji: "🕐", sentence: "Demjimêr çend e?", sentenceTr: "Saat kaç?", tip: "'Dem' = zaman, 'jimêr' = sayan." },
        { type: "fill", sentence: "Îro ___ e.", sentenceTr: "Bugün ___.", hint: "📅 (5)", options: ["Yekşem", "Pêncşem", "Şemî"], correct: 1 },
        { type: "pick", question: "'Yarın' Kurmancî nedir?", options: ["Duh", "Sibê", "Îro", "Niha"], correct: 1 },
      ],
    },
  ],
};

// =============================================================
//  A2 — NAVÎN (ORTA)
// =============================================================

const XWARIN: Category = {
  key: "xwarin",
  title: "Xwarin û Vexwarin",
  titleTr: "Yiyecek & İçecek",
  icon: "🍽️",
  color: "#FF6B35",
  level: "a2",
  description: "Xwarinên rojane û vexwarin",
  descriptionTr: "Günlük yiyecek ve içecekler",
  words: [
    { ku: "nan", tr: "ekmek", emoji: "🍞", example: { ku: "Nan li ser maseyê ye.", tr: "Ekmek masada." } },
    { ku: "av", tr: "su", emoji: "💧", example: { ku: "Avekê bide min.", tr: "Bana bir su ver." } },
    { ku: "çay", tr: "çay", emoji: "🍵", example: { ku: "Çay germ e.", tr: "Çay sıcaktır." } },
    { ku: "qehwe", tr: "kahve", emoji: "☕", example: { ku: "Qehweya min tal e.", tr: "Kahvem acıdır." } },
    { ku: "şîr", tr: "süt", emoji: "🥛", example: { ku: "Zarok şîr vedixwin.", tr: "Çocuklar süt içer." } },
    { ku: "penîr", tr: "peynir", emoji: "🧀", example: { ku: "Penîrê gund.", tr: "Köy peyniri." } },
    { ku: "hêk", tr: "yumurta", emoji: "🥚", example: { ku: "Du hêk ji bo taştê.", tr: "Kahvaltı için iki yumurta." } },
    { ku: "goşt", tr: "et", emoji: "🥩", example: { ku: "Goştê berx xweş e.", tr: "Kuzu eti güzeldir." } },
    { ku: "masî", tr: "balık", emoji: "🐟", example: { ku: "Masî di gol de ne.", tr: "Balıklar gölde." } },
    { ku: "sêv", tr: "elma", emoji: "🍎", example: { ku: "Sêv sor e.", tr: "Elma kırmızıdır." } },
    { ku: "tirî", tr: "üzüm", emoji: "🍇", example: { ku: "Tirîyê reş.", tr: "Siyah üzüm." } },
    { ku: "hinar", tr: "nar", emoji: "🍑", example: { ku: "Hinar tirş e.", tr: "Nar ekşidir." } },
    { ku: "savar", tr: "bulgur", emoji: "🍚", example: { ku: "Savara dê.", tr: "Annenin bulguru." } },
    { ku: "şorbe", tr: "çorba", emoji: "🍲", example: { ku: "Şorbe germ e.", tr: "Çorba sıcaktır." } },
    { ku: "dew", tr: "ayran", emoji: "🥛", example: { ku: "Dew û nan.", tr: "Ayran ve ekmek." } },
  ],
  lessons: [
    {
      id: "cat-xwarin-1",
      title: "Xwarin û Vexwarin",
      titleTr: "Yiyecek ve İçecek",
      icon: "🍽️",
      xp: 30,
      steps: [
        { type: "dialogue", title: "Li Taştê", setting: "🍳 Li mitfaxê", lines: [
          { speaker: "Dayê", emoji: "👩", text: "Sibe baş! Tu çi dixwazî?", tr: "Günaydın! Ne istersin?" },
          { speaker: "Bager", emoji: "🧑", text: "Nan, penîr û çayekê, ji kerema xwe.", tr: "Ekmek, peynir ve bir çay, lütfen." },
          { speaker: "Dayê", emoji: "👩", text: "Hêk jî dixwazî?", tr: "Yumurta da ister misin?" },
          { speaker: "Bager", emoji: "🧑", text: "Erê, du hêkan bidê min.", tr: "Evet, iki yumurta ver bana." },
          { speaker: "Dayê", emoji: "👩", text: "Bi xweşî bixwe!", tr: "Afiyet olsun!" },
        ]},
        { type: "teach", word: "Nan", meaning: "Ekmek", emoji: "🍞", sentence: "Nan li ser maseyê ye.", sentenceTr: "Ekmek masada.", tip: "Kürt mutfağının en temel öğesi." },
        { type: "teach", word: "Av", meaning: "Su", emoji: "💧", sentence: "Avekê bide min.", sentenceTr: "Bana bir su ver.", tip: "'-ekê' eki: bir tane (belirsiz)." },
        { type: "teach", word: "Çay", meaning: "Çay", emoji: "🍵", sentence: "Çayek ji kerema xwe.", sentenceTr: "Bir çay lütfen.", tip: "Bağlama yapısı: 'çay-ek' = bir çay." },
        { type: "teach", word: "Penîr", meaning: "Peynir", emoji: "🧀", sentence: "Penîrê gund xweş e.", sentenceTr: "Köy peyniri güzeldir.", tip: "'Gund' = köy." },
        { type: "teach", word: "Hêk", meaning: "Yumurta", emoji: "🥚", sentence: "Hêk dikelînim.", sentenceTr: "Yumurta haşlıyorum.", tip: "'Kelandin' = haşlamak/kaynatmak." },
        { type: "teach", word: "Goşt", meaning: "Et", emoji: "🥩", sentence: "Goştê berxan.", sentenceTr: "Kuzu eti.", tip: "'Berx' = kuzu." },
        { type: "pick", question: "'Yumurta' Kurmancî nedir?", options: ["Hêk", "Nan", "Şîr", "Goşt"], correct: 0 },
        { type: "teach", word: "Şorbe", meaning: "Çorba", emoji: "🍲", sentence: "Şorbeya nokê.", sentenceTr: "Nohut çorbası.", tip: "'Nok' = nohut." },
        { type: "teach", word: "Dew", meaning: "Ayran", emoji: "🥛", sentence: "Dewê germ.", sentenceTr: "Sıcak ayran.", tip: "Yoğurttan yapılan içecek." },
        { type: "match", instruction: "Eşleştir!", pairs: [
          { word: "Nan", meaning: "Ekmek" },
          { word: "Av", meaning: "Su" },
          { word: "Penîr", meaning: "Peynir" },
          { word: "Hêk", meaning: "Yumurta" },
        ]},
        { type: "fill", sentence: "Ez ___ vedixwim.", sentenceTr: "___ içiyorum.", hint: "🍵", options: ["nan", "çay", "penîr"], correct: 1 },
        { type: "pick", question: "'Tatlı' anlamını taşır mı 'tirş'?", options: ["Evet, tatlı", "Hayır, ekşi", "Acı", "Tuzlu"], correct: 1 },
        { type: "fill", sentence: "Bi xweşî ___!", sentenceTr: "Afiyet ___!", hint: "🍽️", options: ["bixwe", "vexwe", "biçe"], correct: 0 },
      ],
    },
  ],
};

const MITFAX: Category = {
  key: "mitfax",
  title: "Mitfax",
  titleTr: "Mutfak",
  icon: "🍳",
  color: "#E8B931",
  level: "a2",
  description: "Tiştên mitfaxê û pêjandin",
  descriptionTr: "Mutfak eşyaları ve pişirme",
  words: [
    { ku: "mitfax", tr: "mutfak", emoji: "🍳", example: { ku: "Dayê li mitfaxê ye.", tr: "Anne mutfaktadır." } },
    { ku: "tac", tr: "tencere", emoji: "🍲", example: { ku: "Tac li ser êgir e.", tr: "Tencere ateştedir." } },
    { ku: "tewa", tr: "tava", emoji: "🍳", example: { ku: "Tewa germ e.", tr: "Tava sıcaktır." } },
    { ku: "kêr", tr: "bıçak", emoji: "🔪", example: { ku: "Kêr tûj e.", tr: "Bıçak keskindir." } },
    { ku: "kevçî", tr: "kaşık", emoji: "🥄", example: { ku: "Kevçiyê şorbeyê.", tr: "Çorba kaşığı." } },
    { ku: "çetel", tr: "çatal", emoji: "🍴", example: { ku: "Çetelê paqij.", tr: "Temiz çatal." } },
    { ku: "tas", tr: "tabak/kase", emoji: "🥣", example: { ku: "Tas tijî ye.", tr: "Tabak doludur." } },
    { ku: "qedeh", tr: "bardak", emoji: "🥛", example: { ku: "Qedehek av.", tr: "Bir bardak su." } },
    { ku: "îstîkana", tr: "çay bardağı", emoji: "🍵", example: { ku: "Îstîkanaya çayê.", tr: "Çay bardağı." } },
    { ku: "êgir", tr: "ateş/ocak", emoji: "🔥", example: { ku: "Êgir geş e.", tr: "Ateş yanıyor." } },
    { ku: "firne", tr: "fırın", emoji: "🍞", example: { ku: "Firnê germ kir.", tr: "Fırını ısıttı." } },
    { ku: "sarincok", tr: "buzdolabı", emoji: "🧊", example: { ku: "Şîr di sarincokê de ye.", tr: "Süt buzdolabında." } },
    { ku: "xwê", tr: "tuz", emoji: "🧂", example: { ku: "Xwê hindik e.", tr: "Tuz azdır." } },
    { ku: "biber", tr: "biber", emoji: "🌶️", example: { ku: "Biberê tûj.", tr: "Acı biber." } },
    { ku: "rûn", tr: "yağ", emoji: "🛢️", example: { ku: "Rûnê zeytûnê.", tr: "Zeytinyağı." } },
  ],
  lessons: [
    {
      id: "cat-mitfax-1",
      title: "Li Mitfaxê",
      titleTr: "Mutfakta",
      icon: "🍳",
      xp: 30,
      steps: [
        { type: "scene", scene: "🍳", verb: "dipêjim", meaning: "pişiriyorum", person: "Ez", full: "Ez xwarinê dipêjim.", fullTr: "Yemek pişiriyorum.", tip: "'Pijandin' = pişirmek." },
        { type: "teach", word: "Tac", meaning: "Tencere", emoji: "🍲", sentence: "Tac li ser êgir e.", sentenceTr: "Tencere ocaktadır.", tip: "Bazı bölgelerde 'qazan' da denir." },
        { type: "teach", word: "Tewa", meaning: "Tava", emoji: "🍳", sentence: "Tewa li firnê ye.", sentenceTr: "Tava fırındadır.", tip: "Yassı pişirme kabı." },
        { type: "teach", word: "Kêr", meaning: "Bıçak", emoji: "🔪", sentence: "Kêr tûj e.", sentenceTr: "Bıçak keskindir.", tip: "'Tûj' = keskin." },
        { type: "teach", word: "Kevçî", meaning: "Kaşık", emoji: "🥄", sentence: "Kevçiyê şorbeyê li kû ye?", sentenceTr: "Çorba kaşığı nerede?", tip: "Yemek için temel alet." },
        { type: "teach", word: "Çetel", meaning: "Çatal", emoji: "🍴", sentence: "Çeteloyên paqij.", sentenceTr: "Temiz çatallar.", tip: "Türkçe'den ödünç." },
        { type: "teach", word: "Tas", meaning: "Tabak/Kase", emoji: "🥣", sentence: "Tasa min tijî ye.", sentenceTr: "Tabağım doludur.", tip: "Hem 'kase' hem 'tabak' anlamında." },
        { type: "teach", word: "Qedeh", meaning: "Bardak", emoji: "🥛", sentence: "Qedehek av.", sentenceTr: "Bir bardak su.", tip: "Cam içecek kabı." },
        { type: "pick", question: "'Bıçak' Kurmancî nedir?", options: ["Tac", "Kêr", "Çetel", "Kevçî"], correct: 1 },
        { type: "teach", word: "Sarincok", meaning: "Buzdolabı", emoji: "🧊", sentence: "Şîr di sarincokê de ye.", sentenceTr: "Süt buzdolabında.", tip: "'Sar' = soğuk + 'incok' (yer eki)." },
        { type: "teach", word: "Firne", meaning: "Fırın", emoji: "🍞", sentence: "Nan di firnê de ye.", sentenceTr: "Ekmek fırındadır.", tip: "Pişirme cihazı." },
        { type: "teach", word: "Xwê", meaning: "Tuz", emoji: "🧂", sentence: "Xwêyê bide min.", sentenceTr: "Tuzu bana ver.", tip: "Temel baharat." },
        { type: "match", instruction: "Eşleştir!", pairs: [
          { word: "Tac", meaning: "Tencere" },
          { word: "Kêr", meaning: "Bıçak" },
          { word: "Kevçî", meaning: "Kaşık" },
          { word: "Tewa", meaning: "Tava" },
        ]},
        { type: "fill", sentence: "Şîr di ___ de ye.", sentenceTr: "Süt ___.", hint: "🧊", options: ["mitfaxê", "sarincokê", "firnê"], correct: 1 },
        { type: "pick", question: "'Tava' nedir?", options: ["Tac", "Tewa", "Kêr", "Tas"], correct: 1 },
        { type: "fill", sentence: "Kêr ___ e.", sentenceTr: "Bıçak ___.", hint: "🔪", options: ["tûj", "kesk", "germ"], correct: 0 },
      ],
    },
  ],
};

const BAZAR: Category = {
  key: "bazar",
  title: "Bazar û Kirîn",
  titleTr: "Pazar & Alışveriş",
  icon: "🛒",
  color: "#58CC02",
  level: "a2",
  description: "Kirîn, firotin û pere",
  descriptionTr: "Alma, satma ve para",
  words: [
    { ku: "bazar", tr: "pazar/çarşı", emoji: "🛒", example: { ku: "Em diçin bazarê.", tr: "Pazara gidiyoruz." } },
    { ku: "firoşgeh", tr: "dükkân/mağaza", emoji: "🏬", example: { ku: "Firoşgeha cilan.", tr: "Kıyafet mağazası." } },
    { ku: "firoşkar", tr: "satıcı", emoji: "🧔", example: { ku: "Firoşkar kerem e.", tr: "Satıcı kibardır." } },
    { ku: "kirîn", tr: "satın almak", emoji: "🛍️", example: { ku: "Min nan kirî.", tr: "Ekmek aldım." } },
    { ku: "firotin", tr: "satmak", emoji: "🤝", example: { ku: "Wî sêv firotin.", tr: "O elma sattı." } },
    { ku: "pere", tr: "para", emoji: "💵", example: { ku: "Pereyê min hindik e.", tr: "Param azdır." } },
    { ku: "buha", tr: "fiyat", emoji: "🏷️", example: { ku: "Buha çend e?", tr: "Fiyatı ne kadar?" } },
    { ku: "biha", tr: "pahalı", emoji: "💰", example: { ku: "Biha ye.", tr: "Pahalıdır." } },
    { ku: "erzan", tr: "ucuz", emoji: "💸", example: { ku: "Erzan e.", tr: "Ucuzdur." } },
    { ku: "kîlo", tr: "kilo", emoji: "⚖️", example: { ku: "Du kîlo sêv.", tr: "İki kilo elma." } },
    { ku: "torbe", tr: "çanta/torba", emoji: "🛍️", example: { ku: "Torbeya kirînê.", tr: "Alışveriş torbası." } },
    { ku: "berber", tr: "kuaför", emoji: "💈", example: { ku: "Ez diçim cem berber.", tr: "Kuaföre gidiyorum." } },
  ],
  lessons: [
    {
      id: "cat-bazar-1",
      title: "Li Bazarê",
      titleTr: "Pazarda",
      icon: "🛒",
      xp: 30,
      steps: [
        { type: "dialogue", title: "Li Bazara Sebzeyan", setting: "🛒 Bazar", lines: [
          { speaker: "Bager", emoji: "🧑", text: "Rojbaş! Sêv hene?", tr: "Günaydın! Elma var mı?" },
          { speaker: "Firoşkar", emoji: "🧔", text: "Erê, sêvên sor û zer hene.", tr: "Evet, kırmızı ve sarı elma var." },
          { speaker: "Bager", emoji: "🧑", text: "Kîloyek çend e?", tr: "Kilosu kaç?" },
          { speaker: "Firoşkar", emoji: "🧔", text: "Bîst lîre, bira.", tr: "Yirmi lira, kardeşim." },
          { speaker: "Bager", emoji: "🧑", text: "Biha ye! Erzantir nabe?", tr: "Pahalı! Daha ucuz olmaz mı?" },
          { speaker: "Firoşkar", emoji: "🧔", text: "Ji bo te panzdeh.", tr: "Sana on beş." },
          { speaker: "Bager", emoji: "🧑", text: "Du kîlo bidê min, spas.", tr: "İki kilo ver, teşekkürler." },
        ]},
        { type: "teach", word: "Bazar", meaning: "Pazar/Çarşı", emoji: "🛒", sentence: "Em diçin bazarê.", sentenceTr: "Pazara gidiyoruz.", tip: "'-ê' eki: -e/-a yön belirteci." },
        { type: "teach", word: "Çend e?", meaning: "Ne kadar?", emoji: "💰", sentence: "Ev çend e?", sentenceTr: "Bu ne kadar?", tip: "Alışverişin temel sorusu." },
        { type: "teach", word: "Bidê min", meaning: "Bana ver", emoji: "🤲", sentence: "Du kîlo bidê min.", sentenceTr: "İki kilo ver bana.", tip: "'Dan' = vermek; 'bide min' = bana ver." },
        { type: "teach", word: "Biha", meaning: "Pahalı", emoji: "💰", sentence: "Biha ye!", sentenceTr: "Pahalıdır!", tip: "Tersi: 'erzan' (ucuz)." },
        { type: "teach", word: "Erzan", meaning: "Ucuz", emoji: "💸", sentence: "Erzantir bibe!", sentenceTr: "Daha ucuz olsun!", tip: "'-tir' eki: daha (kıyaslama)." },
        { type: "teach", word: "Pere", meaning: "Para", emoji: "💵", sentence: "Pereyê min têra nake.", sentenceTr: "Param yetmiyor.", tip: "'Têra' = yeter." },
        { type: "pick", question: "'Ne kadar?' Kurmancî nedir?", options: ["Çawa?", "Çend e?", "Kê?", "Çi?"], correct: 1 },
        { type: "teach", word: "Kîlo", meaning: "Kilo", emoji: "⚖️", sentence: "Sê kîlo birinc.", sentenceTr: "Üç kilo pirinç.", tip: "'Birinc' = pirinç." },
        { type: "teach", word: "Torbe", meaning: "Torba", emoji: "🛍️", sentence: "Torbeya kirînê.", sentenceTr: "Alışveriş torbası.", tip: "'Kirîn' = alma/alışveriş." },
        { type: "match", instruction: "Eşleştir!", pairs: [
          { word: "Bazar", meaning: "Pazar" },
          { word: "Biha", meaning: "Pahalı" },
          { word: "Erzan", meaning: "Ucuz" },
          { word: "Pere", meaning: "Para" },
        ]},
        { type: "fill", sentence: "Du kîlo ___.", sentenceTr: "İki kilo ___.", hint: "🤲", options: ["bidê min", "biha ye", "çend e"], correct: 0 },
        { type: "pick", question: "Pazarlık için 'Daha ucuz olsun' nasıl denir?", options: ["Biha bibe!", "Erzantir bibe!", "Çend e?", "Spas dikim"], correct: 1 },
        { type: "fill", sentence: "Pereyê min ___ e.", sentenceTr: "Param ___.", hint: "💸", options: ["hindik", "biha", "tûj"], correct: 0 },
      ],
    },
  ],
};

const GERR: Category = {
  key: "gerr",
  title: "Gerr û Rê",
  titleTr: "Seyahat & Yol",
  icon: "✈️",
  color: "#1CB0F6",
  level: "a2",
  description: "Çûyîn, hatin û wesayît",
  descriptionTr: "Gitme, gelme ve araçlar",
  words: [
    { ku: "rê", tr: "yol", emoji: "🛣️", example: { ku: "Rê dirêj e.", tr: "Yol uzundur." } },
    { ku: "ger", tr: "gezi", emoji: "🚶", example: { ku: "Gera me xweş bû.", tr: "Gezimiz güzeldi." } },
    { ku: "wesayît", tr: "araç", emoji: "🚗", example: { ku: "Wesayîtê giran.", tr: "Ağır araç." } },
    { ku: "erebe", tr: "araba", emoji: "🚗", example: { ku: "Ereba min reş e.", tr: "Arabam siyahtır." } },
    { ku: "otobus", tr: "otobüs", emoji: "🚌", example: { ku: "Otobus dereng e.", tr: "Otobüs geç." } },
    { ku: "trên", tr: "tren", emoji: "🚂", example: { ku: "Trên çû.", tr: "Tren gitti." } },
    { ku: "balafir", tr: "uçak", emoji: "✈️", example: { ku: "Balafir li ezman e.", tr: "Uçak gökyüzünde." } },
    { ku: "keştî", tr: "gemi", emoji: "🚢", example: { ku: "Keştî mezin e.", tr: "Gemi büyüktür." } },
    { ku: "bisîklêt", tr: "bisiklet", emoji: "🚲", example: { ku: "Bisîklêta min nû ye.", tr: "Bisikletim yenidir." } },
    { ku: "bajar", tr: "şehir", emoji: "🏙️", example: { ku: "Bajara me mezin e.", tr: "Şehrimiz büyüktür." } },
    { ku: "gund", tr: "köy", emoji: "🏘️", example: { ku: "Gundê me xweş e.", tr: "Köyümüz güzeldir." } },
    { ku: "rêwî", tr: "yolcu", emoji: "🧳", example: { ku: "Rêwiyên dereng.", tr: "Geç yolcular." } },
    { ku: "balafirgeh", tr: "havalimanı", emoji: "🛬", example: { ku: "Em diçin balafirgehê.", tr: "Havalimanına gidiyoruz." } },
    { ku: "rawestgeh", tr: "durak", emoji: "🚏", example: { ku: "Rawestgeha otobusê.", tr: "Otobüs durağı." } },
  ],
  lessons: [
    {
      id: "cat-gerr-1",
      title: "Gerr û Wesayît",
      titleTr: "Seyahat ve Araçlar",
      icon: "✈️",
      xp: 30,
      steps: [
        { type: "scene", scene: "✈️", verb: "diçim", meaning: "gidiyorum", person: "Ez", full: "Ez diçim balafirgehê.", fullTr: "Havalimanına gidiyorum.", tip: "'Çûn' = gitmek." },
        { type: "teach", word: "Rê", meaning: "Yol", emoji: "🛣️", sentence: "Rê dirêj e.", sentenceTr: "Yol uzundur.", tip: "'Dirêj' = uzun." },
        { type: "teach", word: "Erebe", meaning: "Araba", emoji: "🚗", sentence: "Ereba min reş e.", sentenceTr: "Arabam siyahtır.", tip: "Türkçe 'araba'dan." },
        { type: "teach", word: "Otobus", meaning: "Otobüs", emoji: "🚌", sentence: "Otobus dereng e.", sentenceTr: "Otobüs geç.", tip: "'Dereng' = geç." },
        { type: "teach", word: "Balafir", meaning: "Uçak", emoji: "✈️", sentence: "Balafir bilind difire.", sentenceTr: "Uçak yüksek uçar.", tip: "'Bal' = kanat + 'fir' (uçmak)." },
        { type: "teach", word: "Trên", meaning: "Tren", emoji: "🚂", sentence: "Trêna sibehê.", sentenceTr: "Sabah treni.", tip: "Avrupa dillerinden ödünç." },
        { type: "pick", question: "'Otobüs' Kurmancî nedir?", options: ["Trên", "Otobus", "Erebe", "Balafir"], correct: 1 },
        { type: "teach", word: "Bajar", meaning: "Şehir", emoji: "🏙️", sentence: "Bajara me mezin e.", sentenceTr: "Şehrimiz büyüktür.", tip: "'Mezin' = büyük." },
        { type: "teach", word: "Gund", meaning: "Köy", emoji: "🏘️", sentence: "Gundê me xweş e.", sentenceTr: "Köyümüz güzeldir.", tip: "Şehir tersine küçük yerleşim." },
        { type: "teach", word: "Rêwî", meaning: "Yolcu", emoji: "🧳", sentence: "Rêwî westiyaye.", sentenceTr: "Yolcu yorgun.", tip: "'Westiyan' = yorulmak." },
        { type: "teach", word: "Balafirgeh", meaning: "Havalimanı", emoji: "🛬", sentence: "Balafirgeh nêzîk e.", sentenceTr: "Havalimanı yakındır.", tip: "'Balafir' + '-geh' (yer eki)." },
        { type: "match", instruction: "Eşleştir!", pairs: [
          { word: "Erebe", meaning: "Araba" },
          { word: "Balafir", meaning: "Uçak" },
          { word: "Trên", meaning: "Tren" },
          { word: "Keştî", meaning: "Gemi" },
        ]},
        { type: "fill", sentence: "Em ___ balafirgehê.", sentenceTr: "Havalimanına ___.", hint: "✈️", options: ["diçin", "tên", "radizin"], correct: 0 },
        { type: "pick", question: "'Köy' Kurmancî nedir?", options: ["Bajar", "Gund", "Rê", "Mal"], correct: 1 },
        { type: "fill", sentence: "Otobus ___ e.", sentenceTr: "Otobüs ___.", hint: "🕒❌", options: ["dereng", "bilind", "dirêj"], correct: 0 },
      ],
    },
  ],
};

const HEWA: Category = {
  key: "hewa",
  title: "Hewa û Demsale",
  titleTr: "Hava & Mevsimler",
  icon: "🌤️",
  color: "#14D4F4",
  level: "a2",
  description: "Hewa, demsale û xweza",
  descriptionTr: "Hava, mevsimler ve doğa",
  words: [
    { ku: "hewa", tr: "hava", emoji: "🌤️", example: { ku: "Hewa xweş e.", tr: "Hava güzeldir." } },
    { ku: "tav", tr: "güneş ışığı", emoji: "☀️", example: { ku: "Tav germ e.", tr: "Güneş sıcaktır." } },
    { ku: "baran", tr: "yağmur", emoji: "🌧️", example: { ku: "Baran dibare.", tr: "Yağmur yağıyor." } },
    { ku: "berf", tr: "kar", emoji: "❄️", example: { ku: "Berf dibare.", tr: "Kar yağıyor." } },
    { ku: "ba", tr: "rüzgâr", emoji: "💨", example: { ku: "Ba xurt e.", tr: "Rüzgâr sert." } },
    { ku: "ewran", tr: "bulutlar", emoji: "☁️", example: { ku: "Ewran zêde ne.", tr: "Bulutlar fazla." } },
    { ku: "germ", tr: "sıcak", emoji: "🥵", example: { ku: "Îro germ e.", tr: "Bugün sıcak." } },
    { ku: "sar", tr: "soğuk", emoji: "🥶", example: { ku: "Zivistan sar e.", tr: "Kış soğuktur." } },
    { ku: "havîn", tr: "yaz", emoji: "🌞", example: { ku: "Havîn germ e.", tr: "Yaz sıcaktır." } },
    { ku: "payîz", tr: "sonbahar", emoji: "🍂", example: { ku: "Payîz pelan dirûne.", tr: "Sonbahar yaprakları döker." } },
    { ku: "zivistan", tr: "kış", emoji: "❄️", example: { ku: "Zivistan dirêj e.", tr: "Kış uzundur." } },
    { ku: "bihar", tr: "ilkbahar", emoji: "🌸", example: { ku: "Bihar tê.", tr: "İlkbahar geliyor." } },
    { ku: "birûsk", tr: "şimşek", emoji: "⛈️", example: { ku: "Birûsk lê da.", tr: "Şimşek çaktı." } },
    { ku: "asîman", tr: "gökyüzü", emoji: "🌌", example: { ku: "Asîman şîn e.", tr: "Gökyüzü mavidir." } },
  ],
  lessons: [
    {
      id: "cat-hewa-1",
      title: "Hewa û Demsale",
      titleTr: "Hava ve Mevsimler",
      icon: "🌤️",
      xp: 30,
      steps: [
        { type: "teach", word: "Hewa", meaning: "Hava", emoji: "🌤️", sentence: "Hewa xweş e.", sentenceTr: "Hava güzeldir.", tip: "Hava durumu konuşmalarında merkez." },
        { type: "teach", word: "Tav", meaning: "Güneş ışığı", emoji: "☀️", sentence: "Tav li min dikeve.", sentenceTr: "Güneş üzerime vuruyor.", tip: "'Roj' = güneş gövdesi, 'tav' = ışığı." },
        { type: "teach", word: "Baran", meaning: "Yağmur", emoji: "🌧️", sentence: "Baran dibare.", sentenceTr: "Yağmur yağıyor.", tip: "'Barîn' = yağmak." },
        { type: "teach", word: "Berf", meaning: "Kar", emoji: "❄️", sentence: "Berf li çiyê heye.", sentenceTr: "Dağda kar var.", tip: "'Çiya' = dağ." },
        { type: "teach", word: "Ba", meaning: "Rüzgâr", emoji: "💨", sentence: "Ba xurt e.", sentenceTr: "Rüzgâr serttir.", tip: "'Xurt' = sert/güçlü." },
        { type: "teach", word: "Germ", meaning: "Sıcak", emoji: "🥵", sentence: "Havîn germ e.", sentenceTr: "Yaz sıcaktır.", tip: "Tersi: 'sar' (soğuk)." },
        { type: "teach", word: "Sar", meaning: "Soğuk", emoji: "🥶", sentence: "Zivistan sar e.", sentenceTr: "Kış soğuktur.", tip: "'Sar bûn' = üşümek." },
        { type: "pick", question: "'Yağmur' Kurmancî nedir?", options: ["Berf", "Baran", "Ba", "Tav"], correct: 1 },
        { type: "teach", word: "Bihar", meaning: "İlkbahar", emoji: "🌸", sentence: "Bihar gulan tîne.", sentenceTr: "İlkbahar gülleri getirir.", tip: "Newroz biharê pîroz dike." },
        { type: "teach", word: "Havîn", meaning: "Yaz", emoji: "🌞", sentence: "Havînê em diçin behrê.", sentenceTr: "Yazın denize gideriz.", tip: "'Behr' = deniz." },
        { type: "teach", word: "Payîz", meaning: "Sonbahar", emoji: "🍂", sentence: "Payîz pelan dirûne.", sentenceTr: "Sonbahar yaprakları döker.", tip: "'Pel' = yaprak." },
        { type: "teach", word: "Zivistan", meaning: "Kış", emoji: "❄️", sentence: "Zivistan berfê tîne.", sentenceTr: "Kış kar getirir.", tip: "Yılın en soğuk mevsimi." },
        { type: "match", instruction: "Mevsimleri eşleştir!", pairs: [
          { word: "Bihar", meaning: "İlkbahar" },
          { word: "Havîn", meaning: "Yaz" },
          { word: "Payîz", meaning: "Sonbahar" },
          { word: "Zivistan", meaning: "Kış" },
        ]},
        { type: "fill", sentence: "Îro hewa ___ e.", sentenceTr: "Bugün hava ___.", hint: "🥵", options: ["sar", "germ", "şîn"], correct: 1 },
        { type: "pick", question: "Hangi mevsimde kar yağar?", options: ["Bihar", "Havîn", "Zivistan", "Payîz"], correct: 2 },
        { type: "fill", sentence: "Ba ___ e.", sentenceTr: "Rüzgâr ___.", hint: "💨", options: ["xurt", "kesk", "biha"], correct: 0 },
      ],
    },
  ],
};

// =============================================================
//  B1 — PÊŞKETÎ (İLERİ)
// =============================================================

const CIHAN: Category = {
  key: "cihan",
  title: "Cîhan û Welat",
  titleTr: "Dünya & Ülkeler",
  icon: "🌍",
  color: "#8549BA",
  level: "b1",
  description: "Welat, milet û cografya",
  descriptionTr: "Ülkeler, halklar ve coğrafya",
  words: [
    { ku: "cîhan", tr: "dünya", emoji: "🌍", example: { ku: "Cîhan mezin e.", tr: "Dünya büyüktür." } },
    { ku: "welat", tr: "ülke/vatan", emoji: "🏳️", example: { ku: "Welatê min Kurdistan e.", tr: "Vatanım Kürdistan'dır." } },
    { ku: "miled", tr: "millet/halk", emoji: "👥", example: { ku: "Miledê Kurd.", tr: "Kürt halkı." } },
    { ku: "ziman", tr: "dil", emoji: "🗣️", example: { ku: "Zimanê dayikê.", tr: "Anadil." } },
    { ku: "behr", tr: "deniz", emoji: "🌊", example: { ku: "Behra reş.", tr: "Karadeniz." } },
    { ku: "çiya", tr: "dağ", emoji: "⛰️", example: { ku: "Çiyayê Agirî.", tr: "Ağrı Dağı." } },
    { ku: "çem", tr: "nehir", emoji: "🏞️", example: { ku: "Çemê Dîcle.", tr: "Dicle nehri." } },
    { ku: "gol", tr: "göl", emoji: "🏞️", example: { ku: "Gola Wanê.", tr: "Van Gölü." } },
    { ku: "daristan", tr: "orman", emoji: "🌲", example: { ku: "Daristana mezin.", tr: "Büyük orman." } },
    { ku: "rojhilat", tr: "doğu", emoji: "🌅", example: { ku: "Rojhilatê Kurdistanê.", tr: "Doğu Kürdistan." } },
    { ku: "rojava", tr: "batı", emoji: "🌇", example: { ku: "Rojavayê Kurdistanê.", tr: "Batı Kürdistan." } },
    { ku: "bakur", tr: "kuzey", emoji: "🧭", example: { ku: "Bakur sar e.", tr: "Kuzey soğuktur." } },
    { ku: "başûr", tr: "güney", emoji: "🧭", example: { ku: "Başûr germ e.", tr: "Güney sıcaktır." } },
    { ku: "paytext", tr: "başkent", emoji: "🏛️", example: { ku: "Paytexta welat.", tr: "Ülkenin başkenti." } },
    { ku: "ala", tr: "bayrak", emoji: "🚩", example: { ku: "Alaya Kurdistanê.", tr: "Kürdistan bayrağı." } },
  ],
  lessons: [
    {
      id: "cat-cihan-1",
      title: "Cîhan û Cografya",
      titleTr: "Dünya ve Coğrafya",
      icon: "🌍",
      xp: 35,
      steps: [
        { type: "dialogue", title: "Tu Ji Ku Yî?", setting: "✈️ Li balafirgehê", lines: [
          { speaker: "Bager", emoji: "🧑", text: "Silav, tu ji kîjan welat î?", tr: "Merhaba, hangi ülkedensin?" },
          { speaker: "Diren", emoji: "👤", text: "Ez ji Almanyayê me. Tu?", tr: "Ben Almanya'danım. Sen?" },
          { speaker: "Bager", emoji: "🧑", text: "Ez ji Kurdistanê me, ji bajara Amedê.", tr: "Ben Kürdistan'danım, Diyarbakır şehrinden." },
          { speaker: "Diren", emoji: "👤", text: "Çend zimanan dizanî?", tr: "Kaç dil bilirsin?" },
          { speaker: "Bager", emoji: "🧑", text: "Sê: Kurdî, Tirkî, û Îngilîzî.", tr: "Üç: Kürtçe, Türkçe ve İngilizce." },
        ]},
        { type: "teach", word: "Cîhan", meaning: "Dünya", emoji: "🌍", sentence: "Cîhan mezin e.", sentenceTr: "Dünya büyüktür.", tip: "Farsça kökenli ortak sözcük." },
        { type: "teach", word: "Welat", meaning: "Ülke/Vatan", emoji: "🏳️", sentence: "Welatê min Kurdistan e.", sentenceTr: "Vatanım Kürdistan'dır.", tip: "Hem coğrafi hem duygusal anlamda." },
        { type: "teach", word: "Miled", meaning: "Millet/Halk", emoji: "👥", sentence: "Miledê Kurd kevn e.", sentenceTr: "Kürt halkı kadimdir.", tip: "'Kevn' = eski/kadim." },
        { type: "teach", word: "Ziman", meaning: "Dil", emoji: "🗣️", sentence: "Zimanê dayikê.", sentenceTr: "Anadil.", tip: "'Zimanê dayikê' = anadil (kalıp)." },
        { type: "teach", word: "Çiya", meaning: "Dağ", emoji: "⛰️", sentence: "Çiyayê Agirî.", sentenceTr: "Ağrı Dağı.", tip: "Doğu Anadolu'nun en yüksek dağı." },
        { type: "teach", word: "Çem", meaning: "Nehir", emoji: "🏞️", sentence: "Çemê Dîcle û Firat.", sentenceTr: "Dicle ve Fırat nehirleri.", tip: "Mezopotamya'nın iki büyük nehri." },
        { type: "teach", word: "Behr", meaning: "Deniz", emoji: "🌊", sentence: "Behra Reş.", sentenceTr: "Karadeniz.", tip: "Tuzlu su kütlesi." },
        { type: "teach", word: "Gol", meaning: "Göl", emoji: "🏞️", sentence: "Gola Wanê herî mezin e.", sentenceTr: "Van Gölü en büyüğüdür.", tip: "Türkiye'nin en büyük gölü." },
        { type: "pick", question: "'Vatan' Kurmancî nedir?", options: ["Cîhan", "Welat", "Miled", "Bajar"], correct: 1 },
        { type: "teach", word: "Bakur", meaning: "Kuzey", emoji: "🧭", sentence: "Bakurê Kurdistanê li Tirkiyê ye.", sentenceTr: "Kuzey Kürdistan Türkiye'dedir.", tip: "Dört yönden biri." },
        { type: "teach", word: "Başûr", meaning: "Güney", emoji: "🧭", sentence: "Başûrê Kurdistanê.", sentenceTr: "Güney Kürdistan.", tip: "Irak'ın kuzeyi." },
        { type: "teach", word: "Rojhilat", meaning: "Doğu", emoji: "🌅", sentence: "Rojhilat = roj diçe der.", sentenceTr: "Doğu = güneş çıkar.", tip: "'Roj' + 'hilat' (çıkmak)." },
        { type: "teach", word: "Rojava", meaning: "Batı", emoji: "🌇", sentence: "Rojavayê Kurdistanê.", sentenceTr: "Batı Kürdistan.", tip: "'Roj' + 'ava' (batmak)." },
        { type: "match", instruction: "Yönleri eşleştir!", pairs: [
          { word: "Bakur", meaning: "Kuzey" },
          { word: "Başûr", meaning: "Güney" },
          { word: "Rojhilat", meaning: "Doğu" },
          { word: "Rojava", meaning: "Batı" },
        ]},
        { type: "fill", sentence: "Welatê min ___ e.", sentenceTr: "Vatanım ___.", hint: "🏳️", options: ["Kurdistan", "Çiya", "Behr"], correct: 0 },
        { type: "pick", question: "'Anadil' Kurmancî nasıl söylenir?", options: ["Zimanê welat", "Zimanê dayikê", "Zimanê bav", "Zimanê welat"], correct: 1 },
        { type: "fill", sentence: "Gola ___ herî mezin e.", sentenceTr: "___ Gölü en büyüktür.", hint: "🏞️", options: ["Wanê", "Amedê", "Stenbolê"], correct: 0 },
      ],
    },
  ],
};

const TENDURUSTI: Category = {
  key: "tendurusti",
  title: "Tendurustî",
  titleTr: "Sağlık",
  icon: "🩺",
  color: "#FF4B4B",
  level: "b1",
  description: "Bedenê me û bijîjkî",
  descriptionTr: "Vücut ve sağlık",
  words: [
    { ku: "tendurustî", tr: "sağlık", emoji: "💚", example: { ku: "Tendurustî her tişt e.", tr: "Sağlık her şeydir." } },
    { ku: "nexweşî", tr: "hastalık", emoji: "🤒", example: { ku: "Nexweşiya min derbas bû.", tr: "Hastalığım geçti." } },
    { ku: "nexweşxane", tr: "hastane", emoji: "🏥", example: { ku: "Em diçin nexweşxaneyê.", tr: "Hastaneye gidiyoruz." } },
    { ku: "bijîjk", tr: "doktor", emoji: "👨‍⚕️", example: { ku: "Bijîjk hat.", tr: "Doktor geldi." } },
    { ku: "derman", tr: "ilaç", emoji: "💊", example: { ku: "Dermanê serê min.", tr: "Baş ağrısı ilacım." } },
    { ku: "êş", tr: "ağrı", emoji: "😣", example: { ku: "Serê min diêşe.", tr: "Başım ağrıyor." } },
    { ku: "ta", tr: "ateş (vücut)", emoji: "🌡️", example: { ku: "Ta lê heye.", tr: "Ateşi var." } },
    { ku: "kuxik", tr: "öksürük", emoji: "🤧", example: { ku: "Kuxika sermayê.", tr: "Soğuk algınlığı öksürüğü." } },
    { ku: "serma", tr: "soğuk algınlığı", emoji: "🤧", example: { ku: "Serma ket min.", tr: "Üşüttüm." } },
    { ku: "çav", tr: "göz", emoji: "👁️", example: { ku: "Çavê min sor in.", tr: "Gözlerim kırmızıdır." } },
    { ku: "guh", tr: "kulak", emoji: "👂", example: { ku: "Guh dibihîse.", tr: "Kulak duyar." } },
    { ku: "diran", tr: "diş", emoji: "🦷", example: { ku: "Diranê min diêşe.", tr: "Dişim ağrıyor." } },
    { ku: "dest", tr: "el", emoji: "✋", example: { ku: "Destên min sar in.", tr: "Ellerim soğuktur." } },
    { ku: "ling", tr: "ayak/bacak", emoji: "🦶", example: { ku: "Lingê min êşiya.", tr: "Ayağım acıdı." } },
    { ku: "dil", tr: "kalp", emoji: "❤️", example: { ku: "Dilê min lê dixe.", tr: "Kalbim atıyor." } },
  ],
  lessons: [
    {
      id: "cat-tendurusti-1",
      title: "Li Cem Bijîjk",
      titleTr: "Doktorda",
      icon: "🩺",
      xp: 35,
      steps: [
        { type: "dialogue", title: "Li Nexweşxaneyê", setting: "🏥 Nexweşxane", lines: [
          { speaker: "Bijîjk", emoji: "👨‍⚕️", text: "Rojbaş! Çi heye?", tr: "Günaydın! Ne var?" },
          { speaker: "Bager", emoji: "🧑", text: "Serê min diêşe û ta li min heye.", tr: "Başım ağrıyor ve ateşim var." },
          { speaker: "Bijîjk", emoji: "👨‍⚕️", text: "Ji kengê ve?", tr: "Ne zamandan beri?" },
          { speaker: "Bager", emoji: "🧑", text: "Ji duh ve.", tr: "Dünden beri." },
          { speaker: "Bijîjk", emoji: "👨‍⚕️", text: "Ev derman bigire, rojê sê caran.", tr: "Bu ilacı al, günde üç kere." },
          { speaker: "Bager", emoji: "🧑", text: "Spas dikim, doktor.", tr: "Teşekkür ederim, doktor." },
        ]},
        { type: "teach", word: "Tendurustî", meaning: "Sağlık", emoji: "💚", sentence: "Tendurustî giring e.", sentenceTr: "Sağlık önemlidir.", tip: "'Tendurust' = sağlam." },
        { type: "teach", word: "Nexweşî", meaning: "Hastalık", emoji: "🤒", sentence: "Nexweşiya wî dijwar e.", sentenceTr: "Onun hastalığı zordur.", tip: "'Ne-' olumsuz ön ek + 'xweş' (iyi/güzel)." },
        { type: "teach", word: "Bijîjk", meaning: "Doktor", emoji: "👨‍⚕️", sentence: "Bijîjkê me jîr e.", sentenceTr: "Doktorumuz zekidir.", tip: "Türkçeye geçmiş 'doktor' da kullanılır." },
        { type: "teach", word: "Derman", meaning: "İlaç", emoji: "💊", sentence: "Dermanê serê min.", sentenceTr: "Baş ağrısı ilacım.", tip: "Şifa veren madde." },
        { type: "teach", word: "Êş", meaning: "Ağrı", emoji: "😣", sentence: "Êşa diranan dijwar e.", sentenceTr: "Diş ağrısı zordur.", tip: "'Diran' = diş." },
        { type: "teach", word: "Ta", meaning: "Ateş (vücut)", emoji: "🌡️", sentence: "Ta lê heye.", sentenceTr: "Ateşi var.", tip: "Vücut ısısı yüksek." },
        { type: "teach", word: "Kuxik", meaning: "Öksürük", emoji: "🤧", sentence: "Kuxika min naqede.", sentenceTr: "Öksürüğüm bitmiyor.", tip: "'Naqede' = bitmiyor." },
        { type: "pick", question: "'Doktor' Kurmancî nedir?", options: ["Derman", "Bijîjk", "Êş", "Nexweş"], correct: 1 },
        { type: "teach", word: "Serê min diêşe", meaning: "Başım ağrıyor", emoji: "🤕", sentence: "Serê min diêşe, derman heye?", sentenceTr: "Başım ağrıyor, ilaç var mı?", tip: "Sık kullanılan kalıp." },
        { type: "teach", word: "Diran", meaning: "Diş", emoji: "🦷", sentence: "Diranê min diêşe.", sentenceTr: "Dişim ağrıyor.", tip: "'Bijîjkê diranan' = diş hekimi." },
        { type: "teach", word: "Dil", meaning: "Kalp", emoji: "❤️", sentence: "Dilê min lê dixe.", sentenceTr: "Kalbim atıyor.", tip: "'Lê dixe' = vuruyor/atıyor." },
        { type: "match", instruction: "Vücut bölümlerini eşleştir!", pairs: [
          { word: "Çav", meaning: "Göz" },
          { word: "Guh", meaning: "Kulak" },
          { word: "Dest", meaning: "El" },
          { word: "Ling", meaning: "Ayak" },
        ]},
        { type: "fill", sentence: "Serê min ___.", sentenceTr: "Başım ___.", hint: "🤕", options: ["diêşe", "dixwe", "dimeşe"], correct: 0 },
        { type: "pick", question: "Vücut ateşi anlamını taşır mı 'ta'?", options: ["Hayır, ışık", "Evet, ateş", "Hayır, kulak", "Hayır, ilaç"], correct: 1 },
        { type: "fill", sentence: "Bijîjk ___ da min.", sentenceTr: "Doktor bana ___ verdi.", hint: "💊", options: ["derman", "êş", "ta"], correct: 0 },
      ],
    },
  ],
};

const KARKIRIN: Category = {
  key: "karkirin",
  title: "Karkirin û Pîşe",
  titleTr: "İş Hayatı & Meslekler",
  icon: "💼",
  color: "#4B4B4B",
  level: "b1",
  description: "Pîşe, ofîs û jiyana karî",
  descriptionTr: "Meslekler, ofis ve iş yaşamı",
  words: [
    { ku: "kar", tr: "iş", emoji: "💼", example: { ku: "Karê min giran e.", tr: "İşim ağırdır." } },
    { ku: "pîşe", tr: "meslek", emoji: "👨‍💼", example: { ku: "Pîşeya min mamostetî ye.", tr: "Mesleğim öğretmenliktir." } },
    { ku: "karker", tr: "işçi", emoji: "👷", example: { ku: "Karker westiyaye.", tr: "İşçi yorgun." } },
    { ku: "mamoste", tr: "öğretmen", emoji: "👩‍🏫", example: { ku: "Mamoste dersa dide.", tr: "Öğretmen ders veriyor." } },
    { ku: "bijîjk", tr: "doktor", emoji: "👨‍⚕️", example: { ku: "Bijîjkê dilê.", tr: "Kalp doktoru." } },
    { ku: "endazyar", tr: "mühendis", emoji: "🧑‍💻", example: { ku: "Endazyarê nermalavê.", tr: "Yazılım mühendisi." } },
    { ku: "cotkar", tr: "çiftçi", emoji: "🧑‍🌾", example: { ku: "Cotkar erdê dikole.", tr: "Çiftçi toprağı kazıyor." } },
    { ku: "firoşkar", tr: "satıcı", emoji: "🧔", example: { ku: "Firoşkarê bazara.", tr: "Pazar satıcısı." } },
    { ku: "polis", tr: "polis", emoji: "👮", example: { ku: "Polis hat.", tr: "Polis geldi." } },
    { ku: "şofêr", tr: "şoför", emoji: "🚗", example: { ku: "Şofêrê otobûsê.", tr: "Otobüs şoförü." } },
    { ku: "ofîs", tr: "ofis", emoji: "🏢", example: { ku: "Ofîsa min mezin e.", tr: "Ofisim büyüktür." } },
    { ku: "şirket", tr: "şirket", emoji: "🏢", example: { ku: "Şirketa nû.", tr: "Yeni şirket." } },
    { ku: "civîn", tr: "toplantı", emoji: "👥", example: { ku: "Civîn dest pê dike.", tr: "Toplantı başlıyor." } },
    { ku: "meaş", tr: "maaş", emoji: "💵", example: { ku: "Meaşê meha.", tr: "Aylık maaş." } },
    { ku: "betal", tr: "tatil/işsiz", emoji: "🌴", example: { ku: "Em betal in.", tr: "Tatildeyiz." } },
  ],
  lessons: [
    {
      id: "cat-karkirin-1",
      title: "Pîşeya Min",
      titleTr: "Mesleğim",
      icon: "💼",
      xp: 35,
      steps: [
        { type: "dialogue", title: "Hevdîtina Karî", setting: "🏢 Li ofîsê", lines: [
          { speaker: "Diren", emoji: "👨‍💼", text: "Tu çi kar dikî?", tr: "Sen ne iş yapıyorsun?" },
          { speaker: "Bager", emoji: "🧑", text: "Ez endazyarê nermalavê me.", tr: "Ben yazılım mühendisiyim." },
          { speaker: "Diren", emoji: "👨‍💼", text: "Çend salan e tu kar dikî?", tr: "Kaç yıldır çalışıyorsun?" },
          { speaker: "Bager", emoji: "🧑", text: "Pênc sal in. Tu?", tr: "Beş yıldır. Sen?" },
          { speaker: "Diren", emoji: "👨‍💼", text: "Ez mamoste me, deh sal in.", tr: "Ben öğretmenim, on yıldır." },
          { speaker: "Bager", emoji: "🧑", text: "Pîşeyek hêja!", tr: "Değerli bir meslek!" },
        ]},
        { type: "teach", word: "Kar", meaning: "İş", emoji: "💼", sentence: "Karê min giran e.", sentenceTr: "İşim ağırdır.", tip: "Hem 'iş' hem 'çalışmak'." },
        { type: "teach", word: "Pîşe", meaning: "Meslek", emoji: "👨‍💼", sentence: "Pîşeya min mamostetî ye.", sentenceTr: "Mesleğim öğretmenliktir.", tip: "'-tî' eki: -lik (öğretmenlik)." },
        { type: "teach", word: "Mamoste", meaning: "Öğretmen", emoji: "👩‍🏫", sentence: "Mamosteyê min jîr e.", sentenceTr: "Öğretmenim zekidir.", tip: "Erkek/kadın için aynı kelime." },
        { type: "teach", word: "Endazyar", meaning: "Mühendis", emoji: "🧑‍💻", sentence: "Endazyarê elektronîkê.", sentenceTr: "Elektronik mühendisi.", tip: "'Endaz' = ölçü/plan." },
        { type: "teach", word: "Cotkar", meaning: "Çiftçi", emoji: "🧑‍🌾", sentence: "Cotkar erdê dikole.", sentenceTr: "Çiftçi toprağı kazıyor.", tip: "'Cot' = çift, 'kar' = iş." },
        { type: "teach", word: "Karker", meaning: "İşçi", emoji: "👷", sentence: "Karker rojê 8 saetan dixebite.", sentenceTr: "İşçi günde 8 saat çalışır.", tip: "'Saet' = saat." },
        { type: "teach", word: "Firoşkar", meaning: "Satıcı", emoji: "🧔", sentence: "Firoşkar bi kerem e.", sentenceTr: "Satıcı kibardır.", tip: "'Firotin' = satmak." },
        { type: "pick", question: "'Mühendis' Kurmancî nedir?", options: ["Mamoste", "Endazyar", "Cotkar", "Polis"], correct: 1 },
        { type: "teach", word: "Ofîs", meaning: "Ofis", emoji: "🏢", sentence: "Ofîsa me li bajêr e.", sentenceTr: "Ofisimiz şehirdedir.", tip: "Avrupa dillerinden ödünç." },
        { type: "teach", word: "Şirket", meaning: "Şirket", emoji: "🏢", sentence: "Şirketa nermalavê.", sentenceTr: "Yazılım şirketi.", tip: "'Nermalav' = yazılım." },
        { type: "teach", word: "Civîn", meaning: "Toplantı", emoji: "👥", sentence: "Civîn dereng dest pê dike.", sentenceTr: "Toplantı geç başlıyor.", tip: "'Civîn' = toplanmak isminden." },
        { type: "teach", word: "Meaş", meaning: "Maaş", emoji: "💵", sentence: "Meaşê meha vê hat.", sentenceTr: "Bu ay maaş geldi.", tip: "Arapça-Farsça kökenli." },
        { type: "match", instruction: "Meslekleri eşleştir!", pairs: [
          { word: "Mamoste", meaning: "Öğretmen" },
          { word: "Bijîjk", meaning: "Doktor" },
          { word: "Cotkar", meaning: "Çiftçi" },
          { word: "Polis", meaning: "Polis" },
        ]},
        { type: "fill", sentence: "Pîşeya min ___ ye.", sentenceTr: "Mesleğim ___.", hint: "👩‍🏫", options: ["mamostetî", "civîn", "meaş"], correct: 0 },
        { type: "pick", question: "'Şirket' anlamı nedir?", options: ["Toplantı", "Şirket", "Maaş", "Tatil"], correct: 1 },
        { type: "fill", sentence: "Civîn dest pê ___.", sentenceTr: "Toplantı ___.", hint: "🚀", options: ["dike", "dixwe", "diçe"], correct: 0 },
      ],
    },
  ],
};

// =============================================================
//  EXPORT
// =============================================================

export const CATEGORIES: Category[] = [
  // A1
  SILAV, HEJMAR, RENG, MALBAT, MAL, DEMJIMER,
  // A2
  XWARIN, MITFAX, BAZAR, GERR, HEWA,
  // B1
  CIHAN, TENDURUSTI, KARKIRIN,
];

export const getCategoriesByLevel = (level: LevelKey): Category[] =>
  CATEGORIES.filter((c) => c.level === level);

export const getCategoryByKey = (key: CategoryKey): Category | undefined =>
  CATEGORIES.find((c) => c.key === key);

export const LEVELS: { key: LevelKey; title: string; titleTr: string; description: string }[] = [
  { key: "a1", title: "Bingehîn", titleTr: "Temel (A1)", description: "Yekem gav" },
  { key: "a2", title: "Navîn", titleTr: "Orta (A2)", description: "Pêşveçûn" },
  { key: "b1", title: "Pêşketî", titleTr: "İleri (B1)", description: "Bi rehetî" },
  { key: "b2", title: "Pispor", titleTr: "Uzman (B2)", description: "Pispor bibe" },
];
