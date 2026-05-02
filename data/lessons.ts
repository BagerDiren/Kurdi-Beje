// ===================== STEP TİPLERİ =====================
export type DialogueLine = { speaker: string; emoji: string; text: string; tr: string };

export type TeachStep = { type: "teach"; word: string; meaning: string; emoji: string; sentence: string; sentenceTr: string; tip: string };
export type PickStep = { type: "pick"; question: string; options: string[]; correct: number };
export type MatchStep = { type: "match"; instruction: string; pairs: { word: string; meaning: string }[] };
export type FillStep = { type: "fill"; sentence: string; sentenceTr: string; hint: string; options: string[]; correct: number };
export type SceneStep = { type: "scene"; scene: string; verb: string; meaning: string; person: string; full: string; fullTr: string; tip: string };
export type DialogueStep = { type: "dialogue"; title: string; setting: string; lines: DialogueLine[] };
export type VisualPickStep = { type: "visualPick"; question: string; actions: string[]; labels: string[]; correct: number };

export type LessonStep = TeachStep | PickStep | MatchStep | FillStep | SceneStep | DialogueStep | VisualPickStep;

export type Lesson = {
  id: string;
  title: string;
  titleTr: string;
  icon: string;
  xp: number;
  steps?: LessonStep[];
};

export type LevelKey = "a1" | "a2" | "b1" | "b2";

// ===================== DERS İÇERİKLERİ =====================
export const LESSONS: Record<LevelKey, Lesson[]> = {
  a1: [
    { id: "a1-1", title: "Silav!", titleTr: "Merhaba!", icon: "👋", xp: 10, steps: [
      { type: "dialogue", title: "Yekem Silav — İlk Karşılaşma", setting: "🏫 Li kolana (Sokakta)", lines: [
        { speaker: "Kévo", emoji: "🐦", text: "Silav! Ez Kévo me!", tr: "Merhaba! Ben Kévo'yum!" },
        { speaker: "Tu", emoji: "👤", text: "Silav, Kévo!", tr: "Merhaba, Kévo!" },
        { speaker: "Kévo", emoji: "🐦", text: "Tu çawa yî?", tr: "Nasılsın?" },
        { speaker: "Tu", emoji: "👤", text: "Ez baş im, spas!", tr: "İyiyim, teşekkürler!" },
        { speaker: "Kévo", emoji: "🐦", text: "Aferîn! Ka em dest pê bikin!", tr: "Aferin! Hadi başlayalım!" },
      ]},
      { type: "scene", scene: "👋🌍", verb: "Silav!", meaning: "Merhaba!", person: "Peyv:", full: "Silav! Tu çawa yî?", fullTr: "Merhaba! Nasılsın?", tip: "Kürtçe'de selamlaşma çok önemlidir. Her karşılaşmada 'Silav' de!" },
      { type: "teach", word: "Silav", meaning: "Merhaba", emoji: "👋", sentence: "Silav! Ez Kévo me.", sentenceTr: "Merhaba! Ben Kévo'yum.", tip: "'Silav' her ortamda kullanılır." },
      { type: "teach", word: "Rojbaş", meaning: "Günaydın", emoji: "☀️", sentence: "Rojbaş! Tu çawa yî?", sentenceTr: "Günaydın! Nasılsın?", tip: "'Roj' = Gün, 'Baş' = İyi → Rojbaş = İyi günler." },
      { type: "pick", question: "'Merhaba' Kürtçe'de nasıl söylenir?", options: ["Rojbaş", "Silav", "Spas", "Na"], correct: 1 },
      { type: "teach", word: "Spas", meaning: "Teşekkürler", emoji: "🙏", sentence: "Spas dikim!", sentenceTr: "Teşekkür ederim!", tip: "'Spas dikim' = 'Teşekkür ederim' (resmi)." },
      { type: "teach", word: "Oxir be", meaning: "Hoşça kal", emoji: "🤝", sentence: "Oxir be, hevalno!", sentenceTr: "Hoşça kal, arkadaş!", tip: "'Oxir' = hayır/iyilik → 'Hayırla kal'." },
      { type: "visualPick", question: "'Silav' kîjan wateyê dide?", actions: ["drink", "walk", "sleep", "read"], labels: ["👋 Silav", "🙏 Spas", "🤝 Oxir be", "☀️ Rojbaş"], correct: 0 },
      { type: "match", instruction: "Eşleştir!", pairs: [{ word: "Silav", meaning: "Merhaba" }, { word: "Rojbaş", meaning: "Günaydın" }, { word: "Spas", meaning: "Teşekkürler" }, { word: "Oxir be", meaning: "Hoşça kal" }] },
      { type: "scene", scene: "🤝👋", verb: "Oxir be!", meaning: "Hoşça kal!", person: "Peyv:", full: "Oxir be, hevalno! Sibê dîsa!", fullTr: "Hoşça kal, arkadaş! Yarın yine!", tip: "'Oxir' = hayır/iyilik. Gidene 'Oxir be', kalana 'Bi xatirê te' denir." },
      { type: "dialogue", title: "Vedakirina — Vedalaşma", setting: "🚪 Li ber derî (Kapıda)", lines: [
        { speaker: "Kévo", emoji: "🐦", text: "Ders qediya! Spas ji bo fêrbûnê!", tr: "Ders bitti! Öğrendiğin için teşekkürler!" },
        { speaker: "Tu", emoji: "👤", text: "Spas, Kévo! Oxir be!", tr: "Teşekkürler, Kévo! Hoşça kal!" },
        { speaker: "Kévo", emoji: "🐦", text: "Oxir be! Sibê dîsa hevdû bibînin!", tr: "Hoşça kal! Yarın yine görüşelim!" },
      ]},
      { type: "fill", sentence: "___, tu çawa yî?", sentenceTr: "___, nasılsın?", hint: "☀️", options: ["Spas", "Rojbaş", "Oxir be"], correct: 1 },
    ]},
    { id: "a1-2", title: "Reng", titleTr: "Renkler", icon: "🎨", xp: 15, steps: [
      { type: "teach", word: "Sor", meaning: "Kırmızı", emoji: "🔴", sentence: "Sêv sor e.", sentenceTr: "Elma kırmızıdır.", tip: "Kürt bayrağındaki güneş de sor'dur!" },
      { type: "teach", word: "Kesk", meaning: "Yeşil", emoji: "🟢", sentence: "Dar kesk e.", sentenceTr: "Ağaç yeşildir.", tip: "'Kesk' doğayı temsil eder." },
      { type: "teach", word: "Zer", meaning: "Sarı", emoji: "🟡", sentence: "Roj zer e.", sentenceTr: "Güneş sarıdır.", tip: "'Zer' aynı zamanda 'altın' demektir." },
      { type: "visualPick", question: "'Sor' kîjan reng e?", actions: ["drink","walk","run","sleep"], labels: ["🔴 Sor","🟢 Kesk","🟡 Zer","🔵 Şîn"], correct: 0 },
      { type: "teach", word: "Şîn", meaning: "Mavi", emoji: "🔵", sentence: "Ezman şîn e.", sentenceTr: "Gökyüzü mavidir.", tip: "'Şîn' aynı zamanda 'yas' anlamına da gelir." },
      { type: "teach", word: "Spî", meaning: "Beyaz", emoji: "⚪", sentence: "Berf spî ye.", sentenceTr: "Kar beyazdır.", tip: "'Rûspî' = yüzü ak = onurlu kişi." },
      { type: "teach", word: "Reş", meaning: "Siyah", emoji: "⚫", sentence: "Şev reş e.", sentenceTr: "Gece siyahtır.", tip: "'Çavreş' (karagöz) iltifat olarak kullanılır." },
      { type: "match", instruction: "Renkleri eşleştir!", pairs: [{ word: "Sor", meaning: "🔴" }, { word: "Kesk", meaning: "🟢" }, { word: "Zer", meaning: "🟡" }, { word: "Şîn", meaning: "🔵" }] },
      { type: "dialogue", title: "Rengên Cil — Kıyafet Renkleri", setting: "🏠 Li malê", lines: [
        { speaker: "Dayê", emoji: "👩", text: "Kincê te yê sor xweş e!", tr: "Senin kırmızı kıyafetin güzel!" },
        { speaker: "Azad", emoji: "👦", text: "Spas, dayê! Ez rengê sor hez dikim.", tr: "Teşekkürler, anne! Kırmızı rengi seviyorum." },
        { speaker: "Dayê", emoji: "👩", text: "Ez jî rengê kesk hez dikim.", tr: "Ben de yeşil rengi seviyorum." },
      ]},
      { type: "pick", question: "Dayê kîjan reng hez dike?", options: ["Sor", "Zer", "Kesk", "Şîn"], correct: 2 },
      { type: "fill", sentence: "Berf ___ ye.", sentenceTr: "Kar ___dır.", hint: "❄️⚪", options: ["Reş", "Sor", "Spî"], correct: 2 },
    ]},
    { id: "a1-3", title: "Hejmar", titleTr: "Sayılar", icon: "🔢", xp: 15, steps: [
      { type: "teach", word: "Yek", meaning: "1", emoji: "1️⃣", sentence: "Yek sêv.", sentenceTr: "Bir elma.", tip: "'Yekta' = Tek/Biricik." },
      { type: "teach", word: "Du", meaning: "2", emoji: "2️⃣", sentence: "Du çav.", sentenceTr: "İki göz.", tip: "'Ducar' = İki kez." },
      { type: "teach", word: "Sê", meaning: "3", emoji: "3️⃣", sentence: "Sê stêr.", sentenceTr: "Üç yıldız.", tip: "'Sêgoşe' = Üçgen." },
      { type: "teach", word: "Çar", meaning: "4", emoji: "4️⃣", sentence: "Çar demsalên salê.", sentenceTr: "Yılın dört mevsimi.", tip: "'Çarşem' = Çarşamba." },
      { type: "teach", word: "Pênc", meaning: "5", emoji: "5️⃣", sentence: "Pênc tilî.", sentenceTr: "Beş parmak.", tip: "'Pêncşem' = Perşembe." },
      { type: "pick", question: "'Du' kaç?", options: ["1", "2", "3", "5"], correct: 1 },
      { type: "match", instruction: "Eşleştir!", pairs: [{ word: "Yek", meaning: "1" }, { word: "Du", meaning: "2" }, { word: "Sê", meaning: "3" }, { word: "Pênc", meaning: "5" }] },
      { type: "teach", word: "Deh", meaning: "10", emoji: "🔟", sentence: "Deh tilî.", sentenceTr: "On parmak.", tip: "10'luk sistem." },
      { type: "fill", sentence: "___ stêr.", sentenceTr: "___ yıldız.", hint: "⭐⭐⭐", options: ["Yek", "Sê", "Deh"], correct: 1 },
    ]},
    { id: "a1-4", title: "Lêker", titleTr: "Temel Fiiller", icon: "🏃", xp: 20, steps: [
      { type: "scene", scene: "🍵", verb: "vedixwim", meaning: "içiyorum", person: "Ez", full: "Ez çay vedixwim.", fullTr: "Çay içiyorum.", tip: "'Vexwarin' = İçmek." },
      { type: "scene", scene: "🍞", verb: "dixwim", meaning: "yiyorum", person: "Ez", full: "Ez nan dixwim.", fullTr: "Ekmek yiyorum.", tip: "'Xwarin' = Yemek." },
      { type: "visualPick", question: "Kîjan wêne 'vedixwim' nîşan dide?", actions: ["drink","eat","walk","read"], labels: ["Vedixwim","Dixwim","Dimeşim","Dixwînim"], correct: 0 },
      { type: "scene", scene: "🚶", verb: "dimeşim", meaning: "yürüyorum", person: "Ez", full: "Ez dimeşim.", fullTr: "Yürüyorum.", tip: "'Meşîn' = Yürümek." },
      { type: "scene", scene: "🏃", verb: "dibezim", meaning: "koşuyorum", person: "Ez", full: "Ez dibezim.", fullTr: "Koşuyorum.", tip: "'Bezîn' = Koşmak." },
      { type: "visualPick", question: "Kîjan wêne 'dibezim' nîşan dide?", actions: ["walk","run","sleep","drink"], labels: ["Dimeşim","Dibezim","Radizim","Vedixwim"], correct: 1 },
      { type: "scene", scene: "📖", verb: "dixwînim", meaning: "okuyorum", person: "Ez", full: "Ez dixwînim.", fullTr: "Okuyorum.", tip: "'Xwendin' = Okumak." },
      { type: "scene", scene: "😴", verb: "radizim", meaning: "uyuyorum", person: "Ez", full: "Ez radizim.", fullTr: "Uyuyorum.", tip: "'Razan' = Uyumak." },
      { type: "visualPick", question: "Kîjan wêne 'radizim' nîşan dide?", actions: ["run","write","sleep","eat"], labels: ["Dibezim","Dinivîsim","Radizim","Dixwim"], correct: 2 },
      { type: "match", instruction: "Fiilleri eşleştir!", pairs: [{ word: "Vedixwim", meaning: "İçiyorum" }, { word: "Dixwim", meaning: "Yiyorum" }, { word: "Dimeşim", meaning: "Yürüyorum" }, { word: "Dixwînim", meaning: "Okuyorum" }] },
      { type: "fill", sentence: "Ez pirtûkê ___.", sentenceTr: "Kitap ___.", hint: "📖", options: ["dixwim", "dixwînim", "dimeşim"], correct: 1 },
    ]},
    { id: "a1-5", title: "Malbat", titleTr: "Aile", icon: "👨‍👩‍👧‍👦", xp: 15 },
    { id: "a1-6", title: "Ajal", titleTr: "Hayvanlar", icon: "🐑", xp: 15 },
    { id: "a1-7", title: "Laş", titleTr: "Vücut", icon: "🦴", xp: 15 },
    { id: "a1-8", title: "Cil û berg", titleTr: "Kıyafetler", icon: "👗", xp: 15 },
  ],
  a2: [
    { id: "a2-1", title: "Nasîn", titleTr: "Tanışma Diyaloğu", icon: "🤝", xp: 25, steps: [
      { type: "dialogue", title: "Nasîn", setting: "🏫 Li dibistanê", lines: [
        { speaker: "Azad", emoji: "👦", text: "Silav! Navê min Azad e.", tr: "Merhaba! Adım Azad." },
        { speaker: "Zozan", emoji: "👧", text: "Silav! Navê min Zozan e.", tr: "Merhaba! Adım Zozan." },
        { speaker: "Azad", emoji: "👦", text: "Tu ji ku yî?", tr: "Nerelisin?" },
        { speaker: "Zozan", emoji: "👧", text: "Ez ji Wan im. Tu?", tr: "Vanlıyım. Sen?" },
        { speaker: "Azad", emoji: "👦", text: "Ez ji Diyarbekir im.", tr: "Diyarbakırlıyım." },
        { speaker: "Zozan", emoji: "👧", text: "Kêfxweş bûm!", tr: "Memnun oldum!" },
      ]},
      { type: "teach", word: "Navê min ... e", meaning: "Benim adım ...", emoji: "🏷️", sentence: "Navê min Kévo ye!", sentenceTr: "Adım Kévo!", tip: "'Nav' = İsim. 'Navê min' = Benim ismim." },
      { type: "teach", word: "Tu ji ku yî?", meaning: "Nerelisin?", emoji: "🗺️", sentence: "Ez ji Wan im.", sentenceTr: "Vanlıyım.", tip: "'Ji' = -den. 'Ku' = Nere. 'Ez ji ... im' = ...lıyım." },
      { type: "pick", question: "Zozan nereli?", options: ["Diyarbekir", "Wan", "Amed", "Stenbol"], correct: 1 },
      { type: "teach", word: "Kêfxweş bûm", meaning: "Memnun oldum", emoji: "😊", sentence: "Kêfxweş bûm!", sentenceTr: "Tanıştığıma sevindim!", tip: "'Kêf' = Keyif. 'Xweş' = Güzel." },
      { type: "match", instruction: "Eşleştir!", pairs: [{ word: "Navê min...", meaning: "Adım..." }, { word: "Tu ji ku yî?", meaning: "Nerelisin?" }, { word: "Kêfxweş bûm", meaning: "Memnun oldum" }, { word: "Ez ji...im", meaning: "...lıyım" }] },
      { type: "fill", sentence: "Navê min ___ e.", sentenceTr: "Adım ___.", hint: "🏷️", options: ["Azad", "silav", "spas"], correct: 0 },
    ]},
    { id: "a2-2", title: "Rojane", titleTr: "Günlük Rutin", icon: "🌅", xp: 20, steps: [
      { type: "scene", scene: "⏰", verb: "radibim", meaning: "kalkıyorum", person: "Ez", full: "Ez serê sibê radibim.", fullTr: "Sabah kalkıyorum.", tip: "'Rabûn' = Kalkmak. 'Serê sibê' = Sabahleyin." },
      { type: "scene", scene: "🚿", verb: "xwe dişom", meaning: "yıkanıyorum", person: "Ez", full: "Ez xwe dişom.", fullTr: "Yıkanıyorum.", tip: "'Şûştin' = Yıkamak. 'Xwe' = Kendini." },
      { type: "scene", scene: "🍳", verb: "taştê dixwim", meaning: "kahvaltı yapıyorum", person: "Ez", full: "Ez taştê dixwim.", fullTr: "Kahvaltı yapıyorum.", tip: "'Taştê' = Kahvaltı." },
      { type: "pick", question: "'Ez xwe dişom' ne demek?", options: ["Giyiniyorum", "Yıkanıyorum", "Kalkıyorum", "Uyuyorum"], correct: 1 },
      { type: "dialogue", title: "Sibeh — Sabah", setting: "🏠 Li malê", lines: [
        { speaker: "Dayê", emoji: "👩", text: "Rabû! Serê sibê baş!", tr: "Kalk! Günaydın!" },
        { speaker: "Azad", emoji: "👦", text: "Dayê, ez hêj xew im...", tr: "Anne, hâlâ uykudayım..." },
        { speaker: "Dayê", emoji: "👩", text: "Were, taştê amade ye!", tr: "Gel, kahvaltı hazır!" },
        { speaker: "Azad", emoji: "👦", text: "Baş e, ez radibim.", tr: "Tamam, kalkıyorum." },
        { speaker: "Dayê", emoji: "👩", text: "Ez çay dirijînim.", tr: "Çay koyuyorum." },
      ]},
      { type: "pick", question: "Dayê çi dirijîne?", options: ["Av", "Şîr", "Çay", "Şerbet"], correct: 2 },
      { type: "match", instruction: "Eşleştir!", pairs: [{ word: "Radibim", meaning: "Kalkıyorum" }, { word: "Xwe dişom", meaning: "Yıkanıyorum" }, { word: "Taştê dixwim", meaning: "Kahvaltı" }, { word: "Radizim", meaning: "Uyuyorum" }] },
      { type: "fill", sentence: "Ez serê sibê ___.", sentenceTr: "Sabah ___.", hint: "⏰", options: ["radizim", "radibim", "dimeşim"], correct: 1 },
    ]},
    { id: "a2-3", title: "Li Qehwexaneyê", titleTr: "Kafede", icon: "☕", xp: 25, steps: [
      { type: "dialogue", title: "Li Qehwexaneyê", setting: "☕ Qehwexane", lines: [
        { speaker: "Garson", emoji: "🧑‍🍳", text: "Rojbaş! Bi xêr hatî!", tr: "Günaydın! Hoş geldiniz!" },
        { speaker: "Zozan", emoji: "👧", text: "Çayekê, ji kerema xwe.", tr: "Bir çay, lütfen." },
        { speaker: "Garson", emoji: "🧑‍🍳", text: "Bi şekir an bê şekir?", tr: "Şekerli mi şekersiz mi?" },
        { speaker: "Zozan", emoji: "👧", text: "Bê şekir, spas.", tr: "Şekersiz, teşekkürler." },
        { speaker: "Garson", emoji: "🧑‍🍳", text: "Tiştekî din?", tr: "Başka?" },
        { speaker: "Zozan", emoji: "👧", text: "Na, bes e. Spas!", tr: "Hayır, yeter. Teşekkürler!" },
      ]},
      { type: "teach", word: "Ji kerema xwe", meaning: "Lütfen", emoji: "🙏", sentence: "Ji kerema xwe, avê bide min.", sentenceTr: "Lütfen, bana su ver.", tip: "'Kerem' = Lütuf. Çok kibar bir ifade!" },
      { type: "teach", word: "Çend e?", meaning: "Ne kadar?", emoji: "💰", sentence: "Ev çend e?", sentenceTr: "Bu ne kadar?", tip: "Alışverişte en önemli soru!" },
      { type: "pick", question: "Zozan çayê çawa dixwaze?", options: ["Bi şekir", "Bê şekir", "Bi şîr", "Germ"], correct: 1 },
      { type: "match", instruction: "Eşleştir!", pairs: [{ word: "Ji kerema xwe", meaning: "Lütfen" }, { word: "Bi xêr hatî", meaning: "Hoş geldin" }, { word: "Tiştekî din?", meaning: "Başka?" }, { word: "Bes e", meaning: "Yeter" }] },
      { type: "fill", sentence: "Çayekê, ___.", sentenceTr: "Bir çay, ___.", hint: "🙏", options: ["spas", "ji kerema xwe", "oxir be"], correct: 1 },
    ]},
    { id: "a2-4", title: "Li Bazarê", titleTr: "Pazarda", icon: "🛒", xp: 25, steps: [
      { type: "dialogue", title: "Li Bazarê", setting: "🛒 Bazar", lines: [
        { speaker: "Azad", emoji: "👦", text: "Sêv hene?", tr: "Elma var mı?" },
        { speaker: "Firoşkar", emoji: "🧔", text: "Erê, sêvên sor û zer hene.", tr: "Evet, kırmızı ve sarı var." },
        { speaker: "Azad", emoji: "👦", text: "Kîloyek çend e?", tr: "Kilosu kaç?" },
        { speaker: "Firoşkar", emoji: "🧔", text: "Deh lîre.", tr: "On lira." },
        { speaker: "Azad", emoji: "👦", text: "Du kîlo bidê min.", tr: "İki kilo ver." },
        { speaker: "Firoşkar", emoji: "🧔", text: "Bi xatirê te!", tr: "Güle güle!" },
      ]},
      { type: "teach", word: "Çend e?", meaning: "Ne kadar?", emoji: "💰", sentence: "Ev çend e?", sentenceTr: "Bu ne kadar?", tip: "Pazar ve markette en çok kullanılan ifade." },
      { type: "teach", word: "Bidê min", meaning: "Bana ver", emoji: "🤲", sentence: "Kîloyek bidê min.", sentenceTr: "Bir kilo ver.", tip: "'Dan' = Vermek. 'Bide min' = Bana ver." },
      { type: "pick", question: "Sêv çend e?", options: ["5 lîre", "10 lîre", "20 lîre", "15 lîre"], correct: 1 },
      { type: "match", instruction: "Eşleştir!", pairs: [{ word: "Çend e?", meaning: "Ne kadar?" }, { word: "Bidê min", meaning: "Ver bana" }, { word: "Kîloyek", meaning: "Bir kilo" }, { word: "Bi xatirê te", meaning: "Güle güle" }] },
      { type: "fill", sentence: "Du kîlo ___.", sentenceTr: "İki kilo ___.", hint: "🤲", options: ["bidê min", "çend e", "spas"], correct: 0 },
    ]},
  ],
  b1: [
    { id: "b1-1", title: "Ergatîf", titleTr: "Ergatif Yapı", icon: "🧠", xp: 30, steps: [
      { type: "scene", scene: "📖", verb: "xwar", meaning: "yedi (o)", person: "Wî/Wê", full: "Wî nan xwar.", fullTr: "O (erkek) ekmek yedi.", tip: "'Ergatif' = Geçmiş zamanda özne ve nesne işaretleri değişir. 'Ez' → 'Min', 'Tu' → 'Te'." },
      { type: "teach", word: "Min xwar", meaning: "Ben yedim", emoji: "🍞", sentence: "Min nan xwar.", sentenceTr: "Ben ekmek yedim.", tip: "Geçmiş zamanda 'Ez' yerine 'Min' kullanılır. Bu 'ergatif' yapıdır." },
      { type: "teach", word: "Te dît", meaning: "Sen gördün", emoji: "👀", sentence: "Te ez dîtim.", sentenceTr: "Sen beni gördün.", tip: "Geçmiş zamanda 'Tu' yerine 'Te' kullanılır." },
      { type: "pick", question: "'Min nan xwar' ne demek?", options: ["Ben ekmek yiyorum", "Ben ekmek yedim", "O ekmek yedi", "Sen ekmek yedin"], correct: 1 },
      { type: "fill", sentence: "___ nan xwar.", sentenceTr: "___ ekmek yedi.", hint: "👦", options: ["Ez", "Min", "Tu"], correct: 1 },
    ]},
    { id: "b1-2", title: "Dema Borî", titleTr: "Geçmiş Zaman", icon: "⏪", xp: 30, steps: [
      { type: "teach", word: "çûm", meaning: "gittim", emoji: "🚶", sentence: "Ez çûm malê.", sentenceTr: "Eve gittim.", tip: "'Çûn' = Gitmek. 'Çûm' = Gittim." },
      { type: "teach", word: "hat", meaning: "geldi", emoji: "🏠", sentence: "Ew hat.", sentenceTr: "O geldi.", tip: "'Hatin' = Gelmek. 'Hat' = Geldi." },
      { type: "teach", word: "got", meaning: "dedi", emoji: "💬", sentence: "Wî got: 'Silav!'", sentenceTr: "O (erkek) dedi: 'Merhaba!'", tip: "'Gotin' = Demek/Söylemek." },
      { type: "match", instruction: "Eşleştir!", pairs: [{ word: "Çûm", meaning: "Gittim" }, { word: "Hat", meaning: "Geldi" }, { word: "Got", meaning: "Dedi" }, { word: "Xwar", meaning: "Yedi" }] },
      { type: "fill", sentence: "Ez ___ malê.", sentenceTr: "Eve ___.", hint: "🚶", options: ["çûm", "hat", "got"], correct: 0 },
    ]},
    { id: "b1-3", title: "Rewş", titleTr: "Durum / Koşul", icon: "🌤️", xp: 30 },
    { id: "b1-4", title: "Lêker II", titleTr: "İleri Fiiller", icon: "📝", xp: 30 },
  ],
  b2: [
    { id: "b2-1", title: "Gotinên Pêşiyan", titleTr: "Atasözleri", icon: "📜", xp: 35, steps: [
      { type: "teach", word: "Dost di tengiyê de tê nasîn", meaning: "Dost kara günde belli olur", emoji: "🤝", sentence: "Gotina pêşiyan: Dost di tengiyê de tê nasîn.", sentenceTr: "Atasözü: Dost kara günde belli olur.", tip: "'Tengî' = Darlık/Zorluk. 'Nasîn' = Tanımak." },
      { type: "teach", word: "Ava ku ji çavkaniyê tê pak e", meaning: "Kaynağından gelen su temizdir", emoji: "💧", sentence: "Gotina pêşiyan: Ava ku ji çavkaniyê tê pak e.", sentenceTr: "Atasözü: Kaynağından gelen su temizdir.", tip: "'Çavkanî' = Kaynak. 'Pak' = Temiz." },
      { type: "pick", question: "'Dost di tengiyê de tê nasîn' ne demek?", options: ["Dost pahalıdır", "Dost kara günde belli olur", "Dost her zaman gelir", "Dost güzeldir"], correct: 1 },
    ]},
    { id: "b2-2", title: "Edebiyat", titleTr: "Edebiyat", icon: "📖", xp: 35 },
    { id: "b2-3", title: "Nûçe", titleTr: "Haber Okuma", icon: "📰", xp: 35 },
  ],
};
