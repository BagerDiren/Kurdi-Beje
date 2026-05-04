/**
 * DUO PATH SCREEN — Duolingo'nun zigzag öğrenme yolu klonu.
 *
 * Yapı:
 *   ┌─ Sticky header: streak ateş + XP + kalp
 *   │
 *   ├─ Section 1 (A1) ────
 *   │   • Unit 1 başlığı (renkli karakter sticker)
 *   │     ◯ Lesson 1 (mevcut/aktif → büyük yıldız)
 *   │     ◯ Lesson 2 (kilitli)
 *   │     ◯ Lesson 3 (kilitli)
 *   │   • Unit 2 başlığı
 *   │     ...
 *   │
 *   └─ Section 2 (A2) ────
 *
 * Her node:
 *   • Tamamlandı → altın daire + ✓
 *   • Aktif      → renkli + sallayan "BAŞLA" çıkartması
 *   • Kilitli    → gri kapalı kilit ikonu
 */
import { useEffect, useMemo } from "react";
import {
  View, Text, Pressable, StyleSheet, ScrollView, SafeAreaView, Dimensions,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing,
} from "react-native-reanimated";

import { DUO, DUO_RADIUS, DUO_SPACING, DUO_TYPO } from "./duo-tokens";
import { DUO_SECTIONS, getSectionsForAudience, type DuoSection, type DuoUnit, type DuoLesson } from "@/data/duo-content";

const { width: SW } = Dimensions.get("window");
const NODE_SIZE = 72;
const ZIG_OFFSETS = [0, 50, 80, 50, 0, -50, -80, -50];

type NodeStatus = "done" | "active" | "locked";

type Props = {
  completedLessonIds: Set<string>;
  hearts: number;
  xp: number;
  streak: number;
  audience: "child" | "adult";
  onSelectLesson: (lessonId: string) => void;
};

export function PathScreen({ completedLessonIds, hearts, xp, streak, audience, onSelectLesson }: Props) {
  // Hedef kitleye göre filtrelenmiş sections
  const sections = useMemo(() => getSectionsForAudience(audience), [audience]);

  // Aktif dersi bul (ilk tamamlanmamış)
  const activeLessonId = useMemo(() => {
    for (const sec of sections) {
      for (const u of sec.units) {
        for (const l of u.lessons) {
          if (!completedLessonIds.has(l.id)) return l.id;
        }
      }
    }
    return null;
  }, [completedLessonIds, sections]);

  const nodeStatus = (lessonId: string): NodeStatus => {
    if (completedLessonIds.has(lessonId)) return "done";
    if (lessonId === activeLessonId) return "active";
    return "locked";
  };

  return (
    <View style={pS.root}>
      {/* === STATUS BAR === */}
      <SafeAreaView style={pS.statusWrap}>
        <View style={pS.statusBar}>
          <View style={pS.statusItem}>
            <Text style={pS.statusEmoji}>🇰🇲</Text>
            <Text style={pS.statusLabel}>KU</Text>
          </View>
          <View style={pS.statusItem}>
            <Text style={pS.statusEmoji}>🔥</Text>
            <Text style={[pS.statusVal, { color: streak > 0 ? DUO.fox : DUO.hare }]}>{streak}</Text>
          </View>
          <View style={pS.statusItem}>
            <Text style={pS.statusEmoji}>⚡</Text>
            <Text style={[pS.statusVal, { color: DUO.bee }]}>{xp}</Text>
          </View>
          <View style={pS.statusItem}>
            <Text style={pS.statusEmoji}>❤️</Text>
            <Text style={[pS.statusVal, { color: DUO.cardinal }]}>{hearts}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={pS.scroll}>
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            nodeStatus={nodeStatus}
            onSelectLesson={onSelectLesson}
          />
        ))}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function SectionBlock({
  section, nodeStatus, onSelectLesson,
}: {
  section: DuoSection;
  nodeStatus: (id: string) => NodeStatus;
  onSelectLesson: (id: string) => void;
}) {
  return (
    <View style={pS.section}>
      <View style={pS.sectionBanner}>
        <View>
          <Text style={pS.sectionLabel}>{section.subtitle}</Text>
          <Text style={pS.sectionTitle}>{section.title}</Text>
        </View>
      </View>
      {section.units.map((unit) => (
        <UnitBlock
          key={unit.id}
          unit={unit}
          nodeStatus={nodeStatus}
          onSelectLesson={onSelectLesson}
        />
      ))}
    </View>
  );
}

function UnitBlock({
  unit, nodeStatus, onSelectLesson,
}: {
  unit: DuoUnit;
  nodeStatus: (id: string) => NodeStatus;
  onSelectLesson: (id: string) => void;
}) {
  const doneCount = unit.lessons.filter(l => nodeStatus(l.id) === "done").length;
  return (
    <View>
      {/* Unit header sticker */}
      <View style={[pS.unitHeader, { backgroundColor: unit.color }]}>
        <View style={{ flex: 1 }}>
          <Text style={pS.unitNo}>UNIT {unit.no} · {unit.title.toUpperCase()}</Text>
          <Text style={pS.unitTitle}>{unit.subtitle}</Text>
          <Text style={pS.unitMeta}>{doneCount}/{unit.lessons.length} ders tamam</Text>
        </View>
        <Text style={pS.unitEmoji}>{unit.emoji}</Text>
      </View>
      {/* Nodes */}
      <View style={pS.nodesCol}>
        {unit.lessons.map((lesson, idx) => {
          const status = nodeStatus(lesson.id);
          const offset = ZIG_OFFSETS[idx % ZIG_OFFSETS.length];
          return (
            <PathNode
              key={lesson.id}
              lesson={lesson}
              unitColor={unit.color}
              status={status}
              offset={offset}
              onPress={() => onSelectLesson(lesson.id)}
            />
          );
        })}
      </View>
    </View>
  );
}

function PathNode({
  lesson, unitColor, status, offset, onPress,
}: {
  lesson: DuoLesson;
  unitColor: string;
  status: NodeStatus;
  offset: number;
  onPress: () => void;
}) {
  // Aktif düğüm sallanma animasyonu
  const bounce = useSharedValue(0);
  useEffect(() => {
    if (status === "active") {
      bounce.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 400, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.quad) }),
        ),
        -1, false,
      );
    }
  }, [status]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  // Renk ve içerik
  let bg = DUO.swan;
  let bottom = DUO.hare;
  let icon = "🔒";
  let textColor = DUO.hare;
  if (status === "done")   { bg = DUO.bee;     bottom = DUO.beeDark;     icon = "⭐"; textColor = DUO.eel; }
  if (status === "active") { bg = unitColor;   bottom = DUO.greenDark;   icon = "▶"; textColor = DUO.snow; }

  return (
    <View style={[pS.nodeWrap, { transform: [{ translateX: offset }] }]}>
      <Animated.View style={[animStyle]}>
        {status === "active" && (
          <View style={pS.startBadge}>
            <Text style={pS.startBadgeTxt}>BAŞLA</Text>
            <View style={pS.startArrow} />
          </View>
        )}
        <Pressable
          onPress={status === "locked" ? undefined : onPress}
          disabled={status === "locked"}
          style={({ pressed }) => [
            pS.node,
            {
              backgroundColor: bg,
              borderBottomColor: bottom,
              borderBottomWidth: pressed ? 0 : 6,
              transform: [{ translateY: pressed ? 4 : 0 }],
            },
          ]}
        >
          <Text style={[pS.nodeIcon, { color: textColor }]}>{icon}</Text>
        </Pressable>
        {/* Lesson alt etiketi */}
        {status === "active" && (
          <Text style={pS.activeSub}>{lesson.subTitle ?? lesson.title}</Text>
        )}
      </Animated.View>
    </View>
  );
}

const pS = StyleSheet.create({
  root: { flex: 1, backgroundColor: DUO.snow },

  statusWrap: {
    backgroundColor: DUO.snow,
    borderBottomWidth: 2, borderBottomColor: DUO.swan,
  },
  statusBar: {
    flexDirection: "row", justifyContent: "space-around",
    paddingHorizontal: DUO_SPACING.lg, paddingVertical: DUO_SPACING.sm,
  },
  statusItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusEmoji: { fontSize: 18 },
  statusLabel: { ...DUO_TYPO.body, color: DUO.eel, fontSize: 13 },
  statusVal: { ...DUO_TYPO.h3, fontSize: 16 },

  scroll: { paddingTop: DUO_SPACING.md, paddingBottom: 60 },
  section: { marginBottom: DUO_SPACING.xl },
  sectionBanner: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: DUO_SPACING.lg, paddingVertical: DUO_SPACING.lg,
    backgroundColor: DUO.green,
    marginHorizontal: DUO_SPACING.lg,
    borderRadius: DUO_RADIUS.lg,
    borderBottomWidth: 4, borderBottomColor: DUO.greenDark,
    marginBottom: DUO_SPACING.md,
  },
  sectionLabel: { ...DUO_TYPO.micro, color: "rgba(255,255,255,0.85)" },
  sectionTitle: { ...DUO_TYPO.h1, color: DUO.snow, marginTop: 2 },

  unitHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: DUO_SPACING.xl,
    paddingHorizontal: DUO_SPACING.lg, paddingVertical: DUO_SPACING.md,
    borderRadius: DUO_RADIUS.lg,
    marginVertical: DUO_SPACING.md,
  },
  unitNo: { ...DUO_TYPO.micro, color: "rgba(255,255,255,0.7)" },
  unitTitle: { ...DUO_TYPO.h2, color: DUO.snow, marginTop: 2 },
  unitMeta: { ...DUO_TYPO.caption, color: "rgba(255,255,255,0.85)", marginTop: 4 },
  unitEmoji: { fontSize: 36 },

  nodesCol: { alignItems: "center", paddingVertical: DUO_SPACING.md },

  nodeWrap: { marginVertical: DUO_SPACING.sm, alignItems: "center" },
  node: {
    width: NODE_SIZE, height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    alignItems: "center", justifyContent: "center",
  },
  nodeIcon: { fontSize: 30, fontFamily: "Fredoka_700Bold" },
  startBadge: {
    position: "absolute",
    top: -36,
    alignSelf: "center",
    backgroundColor: DUO.snow,
    paddingHorizontal: DUO_SPACING.md, paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 2, borderColor: DUO.swan,
    zIndex: 5,
  },
  startBadgeTxt: { ...DUO_TYPO.micro, color: DUO.eel },
  startArrow: {
    position: "absolute", bottom: -7, alignSelf: "center",
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6,
    borderTopWidth: 7,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderTopColor: DUO.snow,
  },
  activeSub: {
    ...DUO_TYPO.caption, color: DUO.wolf,
    textAlign: "center", marginTop: 6,
    maxWidth: 180,
  },
});
