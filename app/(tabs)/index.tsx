import { View, Text, Pressable, StyleSheet, ScrollView, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { KevoMascot } from "@/components/kevo-mascot";
import { useApp } from "@/data/app-context";
import { CATEGORIES, LEVELS, type Category } from "@/data/categories";
import { getCurrentLeague } from "@/data/achievements";
import { KIDS_CATEGORIES, getKidsLessons, type KidsCategory } from "@/data/kids-content";
import { KidCharacter, characterForCategory } from "@/components/kids/kid-character";
import { KIDS_THEME, ADULT_THEME, SHADOW, RADIUS, SPACING, TYPO } from "@/components/kids/design";
import type { LevelKey } from "@/data/lessons";
import { LinearGradient as LG } from "expo-linear-gradient";

function timeOfDayGreetingTr(): string {
  const h = new Date().getHours();
  if (h < 6) return "İyi geceler";
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

function timeOfDayGreetingKu(): string {
  const h = new Date().getHours();
  if (h < 6) return "Şev baş";
  if (h < 12) return "Roj baş";
  if (h < 18) return "Roj baş";
  return "Êvar baş";
}

export default function HomeLearnTab() {
  const { age } = useApp();
  if (age === "adult") return <AdultHome />;
  return <ChildHome />;
}

// =====================================================================
//  YETİŞKİN — TEMA (KATEGORİ) GRID
// =====================================================================

function AdultHome() {
  const { lvl, xp, streak, hearts, completed, lessonsToday, correctToday, setActiveCategory, startLesson } = useApp();
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>(lvl ?? "a1");

  // Yetişkin için kendi premium teması — kid-design ile aynı dil ama daha sofistike
  const T = ADULT_THEME;

  const goalsPct = Math.round((
    Math.min(xp, 50) / 50 * 0.35 +
    Math.min(lessonsToday, 1) / 1 * 0.25 +
    Math.min(correctToday, 5) / 5 * 0.25 +
    (streak > 0 ? 1 : 0) * 0.15
  ) * 100);

  const filteredCats = CATEGORIES.filter((c) => c.level === selectedLevel);
  // Sadece kategorisi olan seviyeleri göster
  const availableLevels = LEVELS.filter((lv) =>
    CATEGORIES.some((c) => c.level === lv.key),
  );

  // CONTINUE: bul son tamamlanan kategoriyi ve içindeki sıradaki dersi
  const continueData = (() => {
    for (const c of CATEGORIES) {
      const nextLesson = c.lessons.find((l) => !completed.includes(l.id) && l.steps);
      if (nextLesson && c.lessons.some((l) => completed.includes(l.id))) {
        return { cat: c, lesson: nextLesson };
      }
    }
    // Tamamlanan kategori yoksa: ilk A1 kategorisinin ilk dersi
    const a1 = CATEGORIES.find((c) => c.level === "a1");
    if (a1 && a1.lessons[0]) return { cat: a1, lesson: a1.lessons[0] };
    return null;
  })();

  const league = getCurrentLeague(xp);

  const openCategory = (cat: Category) => {
    setActiveCategory(cat.key);
    router.push("/category" as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={adultStyles.scroll} showsVerticalScrollIndicator={false}>
          {/* Üst bar — Welcome ile aynı dil */}
          <View style={[adultStyles.topBar, SHADOW("#000", "sm")]}>
            <View style={[adultStyles.kevoSlot, { backgroundColor: T.primarySoft }]}>
              <KidCharacter character="kevo" size={56} bounce />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={[adultStyles.greet, { color: T.ink }]}>{timeOfDayGreetingTr()} 👋</Text>
              <Text style={[adultStyles.greetSub, { color: T.smoke }]}>{timeOfDayGreetingKu()}</Text>
            </View>
            <View style={[adultStyles.leagueChip, { backgroundColor: league.current.color + "22", borderColor: league.current.color + "55" }]}>
              <Text style={{ fontSize: 16 }}>{league.current.icon}</Text>
              <Text style={[adultStyles.leagueChipText, { color: league.current.color }]}>
                {league.current.title}
              </Text>
            </View>
          </View>

          {/* Stat barı — Welcome stil */}
          <View style={adultStyles.statBar}>
            <AdultStat icon="🔥" value={streak} label="Gün" color={T.fire} T={T} />
            <AdultStat icon="⭐" value={xp} label="XP" color={T.star} T={T} />
            <AdultStat icon="❤️" value={`${hearts}/5`} label="Can" color={T.heart} T={T} />
            <Pressable onPress={() => router.push("/goals")} style={[adultStyles.goalCard, { backgroundColor: T.primary + "12", borderColor: T.primary + "44" }]}>
              <Text style={{ fontSize: 18 }}>🎯</Text>
              <Text style={[adultStyles.goalVal, { color: T.primaryDark }]}>{goalsPct}%</Text>
            </Pressable>
          </View>

          {/* HERO: Devam et */}
          {continueData && (
            <Pressable
              onPress={() => continueData.lesson.steps && startLesson(continueData.lesson)}
              style={({ pressed }) => [
                adultStyles.heroCard,
                SHADOW(continueData.cat.color, "lg"),
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <LG
                colors={[continueData.cat.color, continueData.cat.color + "CC"] as unknown as readonly [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={adultStyles.heroGrad}
              >
                <View style={adultStyles.heroIcon}>
                  <Text style={{ fontSize: 44 }}>{continueData.lesson.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={adultStyles.heroBadge}>
                    <Text style={[adultStyles.heroBadgeText, { color: continueData.cat.color }]}>▶ DEVAM ET</Text>
                  </View>
                  <Text style={adultStyles.heroTitle} numberOfLines={1}>{continueData.cat.titleTr}</Text>
                  <Text style={adultStyles.heroSub} numberOfLines={1}>{continueData.lesson.title}</Text>
                  <View style={adultStyles.heroMeta}>
                    <Text style={adultStyles.heroMetaText}>+{continueData.lesson.xp} XP</Text>
                    <Text style={adultStyles.heroMetaText}>·</Text>
                    <Text style={adultStyles.heroMetaText}>{continueData.lesson.steps?.length ?? 0} adım</Text>
                  </View>
                </View>
                <Text style={adultStyles.heroArrow}>›</Text>
              </LG>
            </Pressable>
          )}

          {/* İkili eylem kartı */}
          <View style={adultStyles.dualRow}>
            <Pressable
              onPress={() => router.push("/practice" as never)}
              style={({ pressed }) => [
                adultStyles.dualCard,
                { backgroundColor: T.card, borderColor: T.yellow + "44" },
                SHADOW(T.yellow, "sm"),
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <View style={[adultStyles.dualIcon, { backgroundColor: T.yellow + "22" }]}>
                <Text style={{ fontSize: 22 }}>🎯</Text>
              </View>
              <Text style={[adultStyles.dualTitle, { color: T.ink }]}>Hızlı Pratik</Text>
              <Text style={[adultStyles.dualSub, { color: T.smoke }]}>10 soru · +5 XP/doğru</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/practice" as never)}
              style={({ pressed }) => [
                adultStyles.dualCard,
                { backgroundColor: T.card, borderColor: T.purple + "44" },
                SHADOW(T.purple, "sm"),
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <View style={[adultStyles.dualIcon, { backgroundColor: T.purple + "22" }]}>
                <Text style={{ fontSize: 22 }}>🔄</Text>
              </View>
              <Text style={[adultStyles.dualTitle, { color: T.ink }]}>Tekrar Zamanı</Text>
              <Text style={[adultStyles.dualSub, { color: T.smoke }]}>
                {completed.length > 0 ? `${completed.length * 4} kelime` : "Eski dersler"}
              </Text>
            </Pressable>
          </View>

          {/* Level segmented (yeni temaya uyumlu) */}
          <View style={[adultStyles.levelBar, { backgroundColor: T.bgSoft }]}>
            {availableLevels.map((lv) => {
              const active = lv.key === selectedLevel;
              return (
                <Pressable
                  key={lv.key}
                  onPress={() => setSelectedLevel(lv.key)}
                  style={[
                    adultStyles.levelSeg,
                    active && { backgroundColor: T.primary },
                  ]}
                >
                  <Text
                    style={{
                      ...TYPO.button,
                      fontSize: 13,
                      color: active ? "#fff" : T.smoke,
                    }}
                  >
                    {lv.key.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={adultStyles.sectionHeader}>
            <Text style={[adultStyles.sectionTitle, { color: T.ink }]}>
              {filteredCats.length} konu
            </Text>
          </View>

          {/* Kategori listesi */}
          <View style={adultStyles.catList}>
            {filteredCats.map((cat, idx) => {
              const lessonIds = cat.lessons.map((l) => l.id);
              const doneCount = lessonIds.filter((id) => completed.includes(id)).length;
              const totalLessons = cat.lessons.length;
              const pct = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;
              const isStarted = doneCount > 0;
              const isComplete = doneCount === totalLessons;
              const prev = filteredCats[idx - 1];
              let isLocked = false;
              if (prev) {
                const prevDone = prev.lessons.filter((l) => completed.includes(l.id)).length;
                const prevPct = prev.lessons.length > 0 ? prevDone / prev.lessons.length : 0;
                isLocked = idx > 0 && prevPct < 0.2 && doneCount === 0;
              }

              return (
                <Pressable
                  key={cat.key}
                  onPress={() => !isLocked && openCategory(cat)}
                  disabled={isLocked}
                  style={({ pressed }) => [
                    adultStyles.catRow,
                    {
                      backgroundColor: T.card,
                      borderColor: isComplete ? T.star : isStarted ? cat.color : "rgba(0,0,0,0.06)",
                      borderWidth: isComplete ? 2.5 : isStarted ? 2 : 1.5,
                      opacity: isLocked ? 0.55 : 1,
                      transform: pressed && !isLocked ? [{ scale: 0.98 }] : [],
                    },
                    SHADOW(isStarted ? cat.color : "#000", isStarted ? "md" : "sm"),
                  ]}
                >
                  <View style={[adultStyles.catRowIcon, { backgroundColor: isLocked ? T.silver : cat.color }]}>
                    <Text style={{ fontSize: 30 }}>
                      {isLocked ? "🔒" : isComplete ? "👑" : cat.icon}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={adultStyles.catTitleRow}>
                      <Text style={[adultStyles.catTitle, { color: T.ink }]} numberOfLines={1}>
                        {cat.titleTr}
                      </Text>
                      <View style={[adultStyles.levelDot, { backgroundColor: cat.color + "22" }]}>
                        <Text style={{ ...TYPO.micro, color: cat.color }}>{cat.level.toUpperCase()}</Text>
                      </View>
                      {isComplete && (
                        <Text style={{ ...TYPO.caption, color: T.star }}>★ TAMAM</Text>
                      )}
                    </View>
                    <Text style={[adultStyles.catSub, { color: T.smoke }]} numberOfLines={1}>
                      {isLocked ? `Önce '${prev?.titleTr}' başla` : `${cat.words.length} kelime · ${totalLessons} ders`}
                    </Text>
                    <View style={adultStyles.catProgressRow}>
                      <View style={[adultStyles.catBar, { backgroundColor: T.silver + "55" }]}>
                        <View style={[adultStyles.catBarFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                      </View>
                      <Text style={{ ...TYPO.caption, color: cat.color, minWidth: 36, textAlign: "right" }}>
                        {doneCount}/{totalLessons}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 26, color: isLocked ? T.silver : cat.color, fontFamily: "Fredoka_700Bold" }}>›</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Yetişkin için stat chip bileşeni
function AdultStat({ icon, value, label, color, T }: {
  icon: string; value: number | string; label: string; color: string; T: typeof ADULT_THEME;
}) {
  return (
    <View style={[adultStyles.statChip, { backgroundColor: color + "18", borderColor: color + "44" }]}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <View>
        <Text style={[adultStyles.statVal, { color }]}>{value}</Text>
        <Text style={[adultStyles.statLbl, { color: T.smoke }]}>{label}</Text>
      </View>
    </View>
  );
}

// =====================================================================
//  ÇOCUK — GÖRSEL & İŞİTSEL (renkli büyük tile grid)
// =====================================================================

function ChildHome() {
  const { xp, streak, hearts, completed, setActiveCategory } = useApp();

  const openKidCat = (cat: KidsCategory) => {
    setActiveCategory(cat.key as never);
    router.push("/kids-lesson" as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: KIDS_THEME.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          contentContainerStyle={kidStyles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* === ÜST BAR: Kevo + selamlama + stat chip'ler === */}
          <View style={kidStyles.topBar}>
            <View style={kidStyles.kevoSlot}>
              <KidCharacter character="kevo" size={64} bounce />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={kidStyles.greet}>Merhaba küçük dostum! 👋</Text>
              <Text style={kidStyles.greetSub}>Bugün ne öğrenmek istersin?</Text>
            </View>
          </View>

          {/* === KOMPAKT STAT BARI === */}
          <View style={kidStyles.statBar}>
            <StatChip icon="⭐" value={xp}     label="Yıldız" color={KIDS_THEME.star} />
            <StatChip icon="🔥" value={streak} label="Gün"    color={KIDS_THEME.fire} />
            <StatChip icon="❤️" value={hearts} label="Can"    color={KIDS_THEME.heart} />
          </View>

          {/* === ÇİFTLİK HERO KARTI (App Store kalitesinde oyun) === */}
          <Pressable
            onPress={() => {
              setActiveCategory(KIDS_CATEGORIES[0].key as never);
              router.push("/farm-game" as never);
            }}
            style={({ pressed }) => [
              kidStyles.heroCard,
              SHADOW(KIDS_THEME.green, "lg"),
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <LG
              colors={["#7CB342", "#558B2F", "#33691E"] as unknown as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={kidStyles.heroGrad}
            >
              <View style={kidStyles.heroIcon}>
                <Text style={{ fontSize: 56 }}>🐮</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={[kidStyles.heroBadge, { backgroundColor: "#FFC72C" }]}>
                  <Text style={[kidStyles.heroBadgeText, { color: "#5D4037" }]}>YENİ OYUN!</Text>
                </View>
                <Text style={kidStyles.heroTitle}>Kevo'nun Çiftliği</Text>
                <Text style={kidStyles.heroSub}>Soruları cevapla · 12 hayvan kazan 🌾</Text>
              </View>
              <Text style={kidStyles.heroArrow}>›</Text>
            </LG>
          </Pressable>

          {/* === ÇİZGİ FİLM KARTI === */}
          <Pressable
            onPress={() => router.push("/cartoons" as never)}
            style={({ pressed }) => [
              kidStyles.heroCard,
              SHADOW(KIDS_THEME.primary, "md"),
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <LG
              colors={[KIDS_THEME.primary, KIDS_THEME.primaryDark] as unknown as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={kidStyles.heroGrad}
            >
              <View style={kidStyles.heroIcon}>
                <Text style={{ fontSize: 56 }}>📺</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={kidStyles.heroTitle}>Çizgi Film İzle</Text>
                <Text style={kidStyles.heroSub}>Zarok TV · Kurmancî videolar 🎬</Text>
              </View>
              <Text style={kidStyles.heroArrow}>›</Text>
            </LG>
          </Pressable>

          {/* === KONULAR === */}
          <View style={kidStyles.sectionHeader}>
            <Text style={kidStyles.sectionTitle}>🎨 Konular</Text>
            <Text style={kidStyles.sectionMeta}>{KIDS_CATEGORIES.length} bölüm</Text>
          </View>

          <View style={kidStyles.catGrid}>
            {KIDS_CATEGORIES.map((cat) => {
              const lessons = getKidsLessons(cat, 5);
              const doneCount = lessons.filter((l) => completed.includes(l.id)).length;
              const total = lessons.length;
              const isComplete = doneCount === total;
              return (
                <Pressable
                  key={cat.key}
                  onPress={() => openKidCat(cat)}
                  style={({ pressed }) => [
                    kidStyles.catTile,
                    SHADOW(cat.color, "md"),
                    pressed && { transform: [{ scale: 0.96 }] },
                  ]}
                >
                  {/* Üst: foto thumbnail */}
                  <View style={[kidStyles.catThumb, { backgroundColor: cat.color }]}>
                    {cat.words[0]?.photo ? (
                      <Image
                        source={{ uri: cat.words[0].photo }}
                        style={kidStyles.catThumbImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ fontSize: 56 }}>{cat.emoji}</Text>
                    )}
                    {/* Üst sol köşe: emoji rozeti */}
                    <View style={[kidStyles.catEmoji, { backgroundColor: cat.color }]}>
                      <Text style={{ fontSize: 22 }}>{cat.emoji}</Text>
                    </View>
                    {isComplete && (
                      <View style={kidStyles.catCrown}>
                        <Text style={{ fontSize: 22 }}>👑</Text>
                      </View>
                    )}
                  </View>
                  {/* Alt: başlık + ilerleme */}
                  <View style={kidStyles.catBody}>
                    <Text style={kidStyles.catTitle} numberOfLines={1}>{cat.title}</Text>
                    <View style={kidStyles.catBar}>
                      <View
                        style={[
                          kidStyles.catBarFill,
                          { width: `${(doneCount / total) * 100}%`, backgroundColor: cat.color },
                        ]}
                      />
                    </View>
                    <Text style={[kidStyles.catProg, { color: cat.color }]}>
                      {doneCount}/{total} ✓
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* === MİNİ OYUNLAR === */}
          <View style={kidStyles.sectionHeader}>
            <Text style={kidStyles.sectionTitle}>🎮 Mini Oyunlar</Text>
          </View>

          <View style={kidStyles.gameRow}>
            <GameTile
              emoji="🎯" title="Sürükle & Eşleştir" sub="Drag & Drop"
              colors={[KIDS_THEME.primary, KIDS_THEME.primaryDark]}
              onPress={() => {
                setActiveCategory(KIDS_CATEGORIES[0].key as never);
                router.push("/drag-match" as never);
              }}
            />
            <GameTile
              emoji="🚀" title="Roket" sub="Aya çık!"
              colors={[KIDS_THEME.purple, KIDS_THEME.purpleDark]}
              onPress={() => {
                setActiveCategory(KIDS_CATEGORIES[0].key as never);
                router.push("/rocket-game" as never);
              }}
            />
          </View>

          {/* === İPUCU === */}
          <View style={kidStyles.tipCard}>
            <KidCharacter character="kevo" size={40} bounce wave />
            <Text style={kidStyles.tipText}>
              💡 Kelimeyi <Text style={{ fontWeight: "900", color: KIDS_THEME.primary }}>uzun bas</Text>
              {"·"} gerçek Kürtçe konuşurun sesini dinle!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// === Yardımcı bileşenler ===

function StatChip({ icon, value, label, color }: {
  icon: string; value: number | string; label: string; color: string;
}) {
  return (
    <View style={[kidStyles.statChip, { backgroundColor: color + "18", borderColor: color + "44" }]}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <View>
        <Text style={[kidStyles.statChipVal, { color }]}>{value}</Text>
        <Text style={kidStyles.statChipLbl}>{label}</Text>
      </View>
    </View>
  );
}

function GameTile({ emoji, title, sub, colors, onPress }: {
  emoji: string; title: string; sub: string;
  colors: [string, string]; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        kidStyles.gameTile,
        SHADOW(colors[1], "md"),
        pressed && { transform: [{ scale: 0.96 }] },
      ]}
    >
      <LG colors={colors as unknown as readonly [string, string, ...string[]]} style={kidStyles.gameTileGrad}>
        <Text style={kidStyles.gameTileEmoji}>{emoji}</Text>
        <Text style={kidStyles.gameTileTitle}>{title}</Text>
        <Text style={kidStyles.gameTileSub}>{sub}</Text>
      </LG>
    </Pressable>
  );
}

const kidStyles = StyleSheet.create({
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: 40, gap: SPACING.lg },

  // Üst bar
  topBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: KIDS_THEME.card,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    ...SHADOW("#000", "sm"),
  },
  kevoSlot: {
    width: 64, height: 64,
    borderRadius: 32,
    backgroundColor: KIDS_THEME.yellowSoft,
    alignItems: "center", justifyContent: "center",
  },
  greet: { ...TYPO.h3, color: KIDS_THEME.ink },
  greetSub: { ...TYPO.body, color: KIDS_THEME.smoke, marginTop: 2 },

  // Stat
  statBar: { flexDirection: "row", gap: SPACING.sm },
  statChip: {
    flex: 1,
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg, borderWidth: 1.5,
  },
  statChipVal: { ...TYPO.h2 },
  statChipLbl: { ...TYPO.caption, color: KIDS_THEME.smoke, marginTop: -2 },

  // Hero (Çizgi Film)
  heroCard: { borderRadius: RADIUS.xl, overflow: "hidden" },
  heroGrad: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    padding: SPACING.lg,
  },
  heroIcon: {
    width: 78, height: 78, borderRadius: RADIUS.lg,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  heroBadgeText: { ...TYPO.caption, color: KIDS_THEME.primary, letterSpacing: 1 },
  heroTitle: { ...TYPO.h2, color: "#fff" },
  heroSub:   { ...TYPO.body, color: "rgba(255,255,255,0.95)", marginTop: 2 },
  heroArrow: { fontSize: 32, color: "#fff", fontWeight: "900" },

  // Section header
  sectionHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: SPACING.xs, marginTop: SPACING.sm,
  },
  sectionTitle: { ...TYPO.h2, color: KIDS_THEME.ink },
  sectionMeta: { ...TYPO.caption, color: KIDS_THEME.smoke },

  // Kategori grid (2x3)
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.md },
  catTile: {
    width: "47.5%",
    borderRadius: RADIUS.xl,
    backgroundColor: KIDS_THEME.card,
    overflow: "hidden",
  },
  catThumb: {
    width: "100%",
    aspectRatio: 1.4,
    position: "relative",
    overflow: "hidden",
    alignItems: "center", justifyContent: "center",
  },
  catThumbImg: { width: "100%", height: "100%" },
  catEmoji: {
    position: "absolute",
    top: 8, left: 8,
    width: 38, height: 38,
    borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  catCrown: {
    position: "absolute",
    top: 8, right: 8,
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "rgba(255,199,44,0.95)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  catBody: { padding: SPACING.md, gap: 6 },
  catTitle: { ...TYPO.h3, color: KIDS_THEME.ink },
  catBar: {
    height: 6, borderRadius: 3,
    backgroundColor: KIDS_THEME.silver + "55",
    overflow: "hidden",
  },
  catBarFill: { height: "100%", borderRadius: 3 },
  catProg: { ...TYPO.caption },

  // Mini oyun row
  gameRow: { flexDirection: "row", gap: SPACING.md },
  gameTile: { flex: 1, borderRadius: RADIUS.xl, overflow: "hidden" },
  gameTileGrad: {
    paddingVertical: SPACING.lg, paddingHorizontal: SPACING.md,
    alignItems: "center",
    minHeight: 120, justifyContent: "center",
  },
  gameTileEmoji: { fontSize: 44 },
  gameTileTitle: { ...TYPO.h3, color: "#fff", marginTop: 6, textAlign: "center" },
  gameTileSub: { ...TYPO.caption, color: "rgba(255,255,255,0.85)", marginTop: 2 },

  // Tip card alt
  tipCard: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    backgroundColor: KIDS_THEME.yellowSoft,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 2, borderColor: KIDS_THEME.yellow + "55",
  },
  tipText: { flex: 1, ...TYPO.body, color: KIDS_THEME.graphite },

});

// =====================================================================
//  YETİŞKİN STİLLERİ — kid-design ile aynı dil, ADULT_THEME renkleriyle
// =====================================================================
const adultStyles = StyleSheet.create({
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: 40, gap: SPACING.lg },

  // Üst bar
  topBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: ADULT_THEME.card,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  kevoSlot: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: "center", justifyContent: "center",
  },
  greet: { ...TYPO.h3 },
  greetSub: { ...TYPO.body, marginTop: 2 },
  leagueChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5,
  },
  leagueChipText: { ...TYPO.caption },

  // Stat
  statBar: { flexDirection: "row", gap: SPACING.sm },
  statChip: {
    flex: 1,
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md, borderWidth: 1.5,
  },
  statVal: { ...TYPO.h3 },
  statLbl: { ...TYPO.caption, marginTop: -2 },
  goalCard: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md, borderWidth: 1.5,
  },
  goalVal: { ...TYPO.h3 },

  // Hero
  heroCard: { borderRadius: RADIUS.xl, overflow: "hidden" },
  heroGrad: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    padding: SPACING.lg,
  },
  heroIcon: {
    width: 72, height: 72, borderRadius: RADIUS.lg,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6, marginBottom: 4,
  },
  heroBadgeText: { ...TYPO.caption, letterSpacing: 0.5 },
  heroTitle: { ...TYPO.h2, color: "#fff" },
  heroSub: { ...TYPO.body, color: "rgba(255,255,255,0.95)", marginTop: 2 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, flexWrap: "wrap" },
  heroMetaText: { ...TYPO.caption, color: "rgba(255,255,255,0.95)" },
  heroArrow: { fontSize: 32, color: "#fff", fontFamily: "Fredoka_700Bold" },

  // İkili eylem
  dualRow: { flexDirection: "row", gap: SPACING.sm },
  dualCard: {
    flex: 1, padding: SPACING.md,
    borderRadius: RADIUS.lg, borderWidth: 1.5, gap: 6,
  },
  dualIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  dualTitle: { ...TYPO.h3, marginTop: 4 },
  dualSub: { ...TYPO.caption, marginTop: 1 },

  // Level segmented
  levelBar: {
    flexDirection: "row",
    borderRadius: RADIUS.md,
    padding: 4, gap: 4,
  },
  levelSeg: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 9 },

  // Section
  sectionHeader: { paddingHorizontal: SPACING.xs },
  sectionTitle: { ...TYPO.h2 },

  // Kategori liste
  catList: { gap: SPACING.md },
  catRow: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    padding: SPACING.md, borderRadius: RADIUS.lg,
  },
  catRowIcon: {
    width: 60, height: 60, borderRadius: RADIUS.md,
    alignItems: "center", justifyContent: "center",
  },
  catTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  catTitle: { ...TYPO.h3 },
  catSub: { ...TYPO.caption, marginTop: 2 },
  catProgressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  catBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  catBarFill: { height: "100%", borderRadius: 3 },
  levelDot: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
});

const styles = StyleSheet.create({
  scroll: { paddingBottom: 30 },
  header: { padding: 18, paddingBottom: 22, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  headerHello: { fontSize: 17, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  levelBadge: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  levelBadgeText: { fontSize: 11, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 10 },
  stat: { alignItems: "center", gap: 2 },
  statVal: { fontSize: 14, fontWeight: "800", color: "#fff" },
  statLabel: { fontSize: 9, color: "rgba(255,255,255,0.6)" },
  kevoRow: { marginHorizontal: 18, marginTop: 14, marginBottom: 8, padding: 10, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1 },
  kevoBubble: { flex: 1, borderRadius: 12, padding: 8, borderWidth: 1 },
  goalCard: { marginHorizontal: 18, marginTop: 12, marginBottom: 4, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  goalGrad: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  goalIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.85)", alignItems: "center", justifyContent: "center" },
  goalTitle: { fontSize: 13, fontWeight: "800" },
  goalBar: { height: 6, borderRadius: 3, overflow: "hidden", marginTop: 6 },
  goalBarFill: { height: "100%", borderRadius: 3 },
  goalPct: { fontSize: 16, fontWeight: "800" },
  sectionTitle: { fontSize: 13, fontWeight: "800", marginHorizontal: 18, marginBottom: 10, marginTop: 14, letterSpacing: 0.3 },
  path: { paddingHorizontal: 18, paddingBottom: 20 },
  pathRow: { flexDirection: "row", paddingVertical: 4 },
  lessonNode: { width: "60%", flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 16 },
  lessonIcon: { borderRadius: 14, alignItems: "center", justifyContent: "center" },
  lessonTitle: { fontSize: 13, fontWeight: "700" },

  // === Adult-specific (sade) ===
  leagueChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  leagueChipText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  statChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  goalChip: { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  // Tek büyük hero (continue)
  heroContinue: {
    flexDirection: "row", alignItems: "center", gap: 14,
    marginHorizontal: 16, marginTop: 14,
    padding: 16, borderRadius: 22, borderWidth: 2,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  heroIcon: { width: 70, height: 70, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, flexWrap: "wrap" },
  // İnce satır (legacy, hala stili korur)
  quickRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 16, marginTop: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 14, borderWidth: 1,
  },
  // İki yan yana eylem kartı
  dualRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 10,
  },
  dualCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 6,
  },
  dualIcon: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  dualTitle: { fontSize: 13, fontWeight: "900", marginTop: 4 },
  dualSub: { fontSize: 10, fontWeight: "600", marginTop: 1 },
  // Skill path bağlantı çizgisi
  connectorWrap: {
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  connectorLine: {
    position: "absolute",
    width: 3,
    height: "100%",
    borderRadius: 2,
  },
  connectorDot: {
    position: "absolute",
    width: 8, height: 8, borderRadius: 4,
  },
  levelTabs: { paddingHorizontal: 18, gap: 8, paddingVertical: 4 },
  levelTab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, alignItems: "center", minWidth: 96 },

  // Level segmented control
  levelBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  levelSeg: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 9,
  },

  // Yeni liste tipi kategori kartları
  catList: { paddingHorizontal: 16, gap: 10 },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 18,
  },
  catRowIcon: {
    width: 60, height: 60, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  catRowTitle: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  levelDot: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  catRowProgress: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  catRowBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  catRowBarFill: { height: "100%", borderRadius: 3 },
});
