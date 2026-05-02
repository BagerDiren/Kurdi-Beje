import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { KevoMascot } from "@/components/kevo-mascot";
import { useApp } from "@/data/app-context";
import { CATEGORIES, LEVELS, type Category } from "@/data/categories";
import { getCurrentLeague } from "@/data/achievements";
import { KIDS_CATEGORIES, getKidsLessons, type KidsCategory } from "@/data/kids-content";
import { FloatingBalloons } from "@/components/kids/floating-balloons";
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
  const { th, t, lvl, xp, streak, hearts, completed, lessonsToday, correctToday, setActiveCategory, startLesson } = useApp();
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>(lvl ?? "a1");

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
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Sade kompakt header — selamlama + 3 inline chip */}
        <LinearGradient colors={th.headerGrad as unknown as readonly [string, string, ...string[]]} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerHello}>{timeOfDayGreetingTr()} 👋</Text>
              <Text style={styles.headerSub}>{timeOfDayGreetingKu()}</Text>
            </View>
            <View style={[styles.leagueChip, { backgroundColor: league.current.color + "33" }]}>
              <Text style={{ fontSize: 14 }}>{league.current.icon}</Text>
              <Text style={styles.leagueChipText}>{league.current.title}</Text>
            </View>
          </View>
          {/* Compact 3'lü stat: streak / XP / hearts */}
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={{ fontSize: 14 }}>🔥</Text>
              <Text style={styles.statVal}>{streak}</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={{ fontSize: 14 }}>⭐</Text>
              <Text style={styles.statVal}>{xp}</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={{ fontSize: 14 }}>❤️</Text>
              <Text style={styles.statVal}>{hearts}/5</Text>
            </View>
            <Pressable onPress={() => router.push("/goals")} style={styles.goalChip}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#fff" }}>🎯 {goalsPct}%</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* TEK BÜYÜK HERO: Continue */}
        {continueData && (
          <Pressable
            onPress={() => continueData.lesson.steps && startLesson(continueData.lesson)}
            style={({ pressed }) => [
              styles.heroContinue,
              {
                backgroundColor: th.card,
                borderColor: continueData.cat.color,
                opacity: pressed ? 0.9 : 1,
                transform: pressed ? [{ scale: 0.99 }] : [],
              },
            ]}
          >
            <LinearGradient
              colors={[continueData.cat.color, continueData.cat.color + "CC"] as unknown as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroIcon}
            >
              <Text style={{ fontSize: 38 }}>{continueData.lesson.icon}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: "800", color: continueData.cat.color, letterSpacing: 0.5 }}>
                ▶ DEVAM ET
              </Text>
              <Text style={{ fontSize: 17, fontWeight: "900", color: th.text, marginTop: 4 }} numberOfLines={1}>
                {continueData.cat.titleTr}
              </Text>
              <Text style={{ fontSize: 12, color: th.textMid, fontWeight: "600", marginTop: 2 }} numberOfLines={1}>
                {continueData.lesson.title}
              </Text>
              <View style={styles.heroMeta}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: th.accent }}>+{continueData.lesson.xp} XP</Text>
                <Text style={{ fontSize: 11, color: th.textLight }}>·</Text>
                <Text style={{ fontSize: 11, fontWeight: "600", color: th.textMid }}>
                  {continueData.lesson.steps?.length ?? 0} adım
                </Text>
                {streak >= 1 && (
                  <>
                    <Text style={{ fontSize: 11, color: th.textLight }}>·</Text>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#F49000" }}>🔥 {streak} gün</Text>
                  </>
                )}
              </View>
            </View>
          </Pressable>
        )}

        {/* İki yan yana ince eylem kartı */}
        <View style={styles.dualRow}>
          <Pressable
            onPress={() => router.push("/practice" as never)}
            style={({ pressed }) => [
              styles.dualCard,
              { backgroundColor: th.card, borderColor: th.accent + "55", opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <View style={[styles.dualIcon, { backgroundColor: th.accent + "22" }]}>
              <Text style={{ fontSize: 20 }}>🎯</Text>
            </View>
            <Text style={[styles.dualTitle, { color: th.text }]}>Hızlı Pratik</Text>
            <Text style={[styles.dualSub, { color: th.textLight }]}>10 soru · +5 XP/doğru</Text>
          </Pressable>

          {/* Tekrar Zamanı — öğrendiğin kelimeler dolduğunda anlamlı olur */}
          <Pressable
            onPress={() => router.push("/practice" as never)}
            style={({ pressed }) => [
              styles.dualCard,
              { backgroundColor: th.card, borderColor: "#A560E8" + "55", opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <View style={[styles.dualIcon, { backgroundColor: "#A560E8" + "22" }]}>
              <Text style={{ fontSize: 20 }}>🔄</Text>
            </View>
            <Text style={[styles.dualTitle, { color: th.text }]}>Tekrar Zamanı</Text>
            <Text style={[styles.dualSub, { color: th.textLight }]}>
              {completed.length > 0 ? `${completed.length * 4} kelime hazır` : "Eski dersler"}
            </Text>
          </Pressable>
        </View>

        {/* Level segmented control — sade satır */}
        <View style={styles.levelBar}>
          {availableLevels.map((lv) => {
            const active = lv.key === selectedLevel;
            return (
              <Pressable
                key={lv.key}
                onPress={() => setSelectedLevel(lv.key)}
                style={[
                  styles.levelSeg,
                  active && { backgroundColor: th.primary },
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "900",
                    color: active ? "#fff" : th.textMid,
                    letterSpacing: 0.5,
                  }}
                >
                  {lv.key.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Section title — basit */}
        <Text style={[styles.sectionTitle, { color: th.text, marginTop: 12 }]}>
          {filteredCats.length} konu hazır
        </Text>

        {/* Skill path — kategoriler birbirine bağlı (önceki %20 → sonraki açılır) */}
        <View style={styles.catList}>
          {filteredCats.map((cat, idx) => {
            const lessonIds = cat.lessons.map((l) => l.id);
            const doneCount = lessonIds.filter((id) => completed.includes(id)).length;
            const totalLessons = cat.lessons.length;
            const pct = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;
            const isStarted = doneCount > 0;
            const isComplete = doneCount === totalLessons;

            // Önceki kategorinin %20'si bitmediyse soluk göster (yumuşak unlock)
            const prev = filteredCats[idx - 1];
            let isLocked = false;
            if (prev) {
              const prevDone = prev.lessons.filter((l) => completed.includes(l.id)).length;
              const prevPct = prev.lessons.length > 0 ? prevDone / prev.lessons.length : 0;
              isLocked = idx > 0 && prevPct < 0.2 && doneCount === 0;
            }

            return (
              <View key={cat.key}>
                {/* Bağlantı çizgisi (ilk hariç) */}
                {idx > 0 && (
                  <View style={styles.connectorWrap}>
                    <View
                      style={[
                        styles.connectorLine,
                        { backgroundColor: isStarted || !isLocked ? cat.color + "55" : th.cardBorder },
                      ]}
                    />
                    {isStarted && (
                      <View style={[styles.connectorDot, { backgroundColor: cat.color }]} />
                    )}
                  </View>
                )}

                <Pressable
                  onPress={() => !isLocked && openCategory(cat)}
                  disabled={isLocked}
                  style={({ pressed }) => [
                    styles.catRow,
                    {
                      backgroundColor: th.card,
                      borderColor: isComplete ? "#FFC200" : isStarted ? cat.color : isLocked ? th.cardBorder : th.cardBorder,
                      borderWidth: isComplete ? 2.5 : isStarted ? 2 : 1.5,
                      opacity: isLocked ? 0.55 : pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.catRowIcon,
                      { backgroundColor: isLocked ? th.bgDark : cat.color },
                    ]}
                  >
                    <Text style={{ fontSize: 30 }}>
                      {isLocked ? "🔒" : isComplete ? "👑" : cat.icon}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.catRowTitle}>
                      <Text style={{ fontSize: 16, fontWeight: "900", color: th.text }} numberOfLines={1}>
                        {cat.titleTr}
                      </Text>
                      <View style={[styles.levelDot, { backgroundColor: cat.color + "22" }]}>
                        <Text style={{ fontSize: 9, fontWeight: "800", color: cat.color }}>
                          {cat.level.toUpperCase()}
                        </Text>
                      </View>
                      {isComplete && (
                        <Text style={{ fontSize: 11, fontWeight: "900", color: "#FFC200" }}>
                          ★ TAMAM
                        </Text>
                      )}
                    </View>
                    <Text style={{ fontSize: 11, color: th.textLight, marginTop: 2, fontWeight: "600" }} numberOfLines={1}>
                      {isLocked ? `Önce '${prev?.titleTr}' başla` : `${cat.title} · ${cat.words.length} kelime · ${totalLessons} ders`}
                    </Text>
                    <View style={styles.catRowProgress}>
                      <View style={[styles.catRowBar, { backgroundColor: th.bgDark }]}>
                        <View
                          style={[
                            styles.catRowBarFill,
                            { width: `${pct}%`, backgroundColor: cat.color },
                          ]}
                        />
                      </View>
                      <Text style={{ fontSize: 11, fontWeight: "800", color: cat.color, minWidth: 38, textAlign: "right" }}>
                        {doneCount}/{totalLessons}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 22, color: isLocked ? th.textLight : cat.color, fontWeight: "900" }}>
                    {isLocked ? "🔒" : "›"}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================================
//  ÇOCUK — GÖRSEL & İŞİTSEL (renkli büyük tile grid)
// =====================================================================

function ChildHome() {
  const { xp, streak, hearts, completed, setActiveCategory } = useApp();

  const openKidCat = (cat: KidsCategory) => {
    setActiveCategory(cat.key as never);
    // İlk dersi başlat
    const lessons = getKidsLessons(cat, 5);
    if (lessons[0]) {
      // useApp kids state yok henüz, kid lesson direkt ilk ders ile çalışır
      router.push("/kids-lesson" as never);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8E7" }}>
      {/* Eğlenceli yüzen balon arka planı */}
      <FloatingBalloons count={6} />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView contentContainerStyle={kidStyles.scroll}>
        {/* Renkli üst banner */}
        <LG
          colors={["#FFB740", "#F39C12", "#E67E22"] as unknown as readonly [string, string, ...string[]]}
          style={kidStyles.banner}
        >
          <View style={kidStyles.bannerTop}>
            <View>
              <Text style={kidStyles.helloKid}>Merhaba küçük dostum! 🌟</Text>
              <Text style={kidStyles.helloKidSub}>Bugün ne öğrenmek istersin?</Text>
            </View>
            <KevoMascot size={70} mood="happy" idle />
          </View>
          <View style={kidStyles.kidStats}>
            <View style={kidStyles.kidStat}>
              <Text style={{ fontSize: 22 }}>⭐</Text>
              <Text style={kidStyles.kidStatVal}>{xp}</Text>
              <Text style={kidStyles.kidStatLbl}>Yıldız</Text>
            </View>
            <View style={kidStyles.kidStat}>
              <Text style={{ fontSize: 22 }}>🔥</Text>
              <Text style={kidStyles.kidStatVal}>{streak}</Text>
              <Text style={kidStyles.kidStatLbl}>Gün</Text>
            </View>
            <View style={kidStyles.kidStat}>
              <Text style={{ fontSize: 22 }}>❤️</Text>
              <Text style={kidStyles.kidStatVal}>{hearts}</Text>
              <Text style={kidStyles.kidStatLbl}>Can</Text>
            </View>
          </View>
        </LG>

        <Text style={kidStyles.sectionTitle}>🎨 Bir konu seç</Text>

        {/* Büyük renkli kategori tile'ları (2 sütun) */}
        <View style={kidStyles.tileGrid}>
          {KIDS_CATEGORIES.map((cat) => {
            const lessons = getKidsLessons(cat, 5);
            const doneCount = lessons.filter((l) => completed.includes(l.id)).length;
            const total = lessons.length;
            return (
              <Pressable
                key={cat.key}
                onPress={() => openKidCat(cat)}
                style={({ pressed }) => [
                  kidStyles.tile,
                  { transform: pressed ? [{ scale: 0.97 }] : [] },
                ]}
              >
                <LG
                  colors={cat.bgGradient as unknown as readonly [string, string, ...string[]]}
                  style={kidStyles.tileGrad}
                >
                  <Text style={kidStyles.tileEmoji}>{cat.emoji}</Text>
                  <Text style={kidStyles.tileTitle}>{cat.title}</Text>
                  <Text style={kidStyles.tileTitleKu}>{cat.titleKu}</Text>
                  <View style={kidStyles.tileFoot}>
                    <Text style={kidStyles.tileMeta}>
                      {cat.words.length} kelime
                    </Text>
                    {doneCount > 0 && (
                      <Text style={kidStyles.tileBadge}>{doneCount}/{total} ✓</Text>
                    )}
                  </View>
                </LG>
              </Pressable>
            );
          })}
        </View>

        {/* Eğlenceli mini oyun kısayolu */}
        <Pressable
          onPress={() => {
            setActiveCategory(KIDS_CATEGORIES[0].key as never);
            router.push("/balloon-game" as never);
          }}
          style={({ pressed }) => [
            kidStyles.miniGameCard,
            { transform: pressed ? [{ scale: 0.97 }] : [] },
          ]}
        >
          <LG
            colors={["#FF6B9D", "#FF8FA3"] as unknown as readonly [string, string, ...string[]]}
            style={kidStyles.miniGameGrad}
          >
            <Text style={{ fontSize: 44 }}>🎈</Text>
            <View style={{ flex: 1 }}>
              <Text style={kidStyles.miniGameTitle}>BALON PATLATMA OYUNU</Text>
              <Text style={kidStyles.miniGameSub}>
                Doğru kelimeyi taşıyan balonu patlat!
              </Text>
            </View>
            <Text style={kidStyles.miniGameArrow}>→</Text>
          </LG>
        </Pressable>

        {/* Kevo motivasyon */}
        <View style={kidStyles.kevoRow}>
          <KevoMascot size={56} mood="happy" speaking />
          <View style={kidStyles.kevoBubble}>
            <Text style={kidStyles.kevoText}>🔊 Sesi dinle, resme dokun!</Text>
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const kidStyles = StyleSheet.create({
  scroll: { paddingBottom: 30 },
  banner: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  bannerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  helloKid: { fontSize: 18, fontWeight: "900", color: "#fff" },
  helloKidSub: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 4, fontWeight: "600" },
  kidStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
    justifyContent: "space-around",
  },
  kidStat: { alignItems: "center", gap: 2 },
  kidStatVal: { fontSize: 18, fontWeight: "900", color: "#fff" },
  kidStatLbl: { fontSize: 10, color: "rgba(255,255,255,0.85)", fontWeight: "700" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#5C4033",
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 12,
  },

  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 12,
  },
  tile: {
    width: "47%",
    aspectRatio: 0.95,
    margin: "1.5%",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tileGrad: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  tileEmoji: { fontSize: 64 },
  tileTitle: { fontSize: 18, fontWeight: "900", color: "#fff", marginTop: 4 },
  tileTitleKu: { fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: "700", fontStyle: "italic" },
  tileFoot: { flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center" },
  tileMeta: { fontSize: 10, color: "rgba(255,255,255,0.85)", fontWeight: "700" },
  tileBadge: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "900",
    backgroundColor: "rgba(0,0,0,0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  miniGameCard: {
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#FF6B9D",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  miniGameGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  miniGameTitle: { fontSize: 14, fontWeight: "900", color: "#fff", letterSpacing: 0.4 },
  miniGameSub: { fontSize: 11, color: "rgba(255,255,255,0.9)", fontWeight: "700", marginTop: 4 },
  miniGameArrow: { fontSize: 28, color: "#fff", fontWeight: "900" },

  kevoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#FFD54F",
  },
  kevoBubble: {
    flex: 1,
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FFD54F",
  },
  kevoText: { fontSize: 13, fontWeight: "800", color: "#5C4033" },
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
