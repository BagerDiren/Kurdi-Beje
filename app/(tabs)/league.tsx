import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/data/app-context";
import {
  buildLeaderboardWithUser,
  FRIENDS,
  WEEKLY_CHALLENGE,
  type Player,
} from "@/data/leaderboard";
import { LEAGUES, getCurrentLeague } from "@/data/achievements";

type Tab = "league" | "friends" | "challenge";

export default function LeagueTab() {
  const { th, xp, streak, completed, lessonsToday } = useApp();
  const [tab, setTab] = useState<Tab>("league");

  const board = buildLeaderboardWithUser(xp, streak);
  const yourRank = board.findIndex((p) => p.isYou) + 1;
  const yourLeague = getCurrentLeague(xp);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }} edges={["top"]}>
      {/* Header */}
      <LinearGradient colors={th.headerGrad as unknown as readonly [string, string, ...string[]]} style={styles.header}>
        <Text style={styles.title}>🏆 Liderlik Tablosu</Text>
        <Text style={styles.subtitle}>Pêşbazî · Haftalık yarış</Text>

        {/* Your stats card */}
        <View style={styles.youCard}>
          <View style={[styles.youIcon, { backgroundColor: yourLeague.current.color + "33" }]}>
            <Text style={{ fontSize: 26 }}>{yourLeague.current.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.youLeague}>{yourLeague.current.titleTr} Lig</Text>
            <Text style={styles.youRank}>
              {yourRank > 0 ? `#${yourRank} sıradasın` : "Henüz sıralanmadın"} · {xp} XP
            </Text>
          </View>
          {yourLeague.next && (
            <View style={styles.nextBadge}>
              <Text style={{ fontSize: 9, color: "#fff", fontWeight: "700" }}>
                {yourLeague.next.minXp - xp} XP
              </Text>
              <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.7)" }}>
                → {yourLeague.next.titleTr}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: th.card, borderColor: th.cardBorder }]}>
        {[
          { key: "league" as const,    label: "🏆 Liderlik" },
          { key: "friends" as const,   label: "👥 Arkadaşlar" },
          { key: "challenge" as const, label: "⚔️ Yarış" },
        ].map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[
              styles.tab,
              tab === t.key && { backgroundColor: th.primary },
            ]}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "800",
                color: tab === t.key ? "#fff" : th.text,
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {tab === "league" && (
          <View style={styles.list}>
            <Text style={[styles.sectionTitle, { color: th.text }]}>
              📊 Bu Hafta · Hefteya vê
            </Text>
            {board.slice(0, 25).map((p, i) => (
              <PlayerRow
                key={p.id}
                rank={i + 1}
                player={p}
                th={th}
              />
            ))}
          </View>
        )}

        {tab === "friends" && (
          <View style={styles.list}>
            <Text style={[styles.sectionTitle, { color: th.text }]}>
              👥 Arkadaşların ({FRIENDS.length})
            </Text>
            {FRIENDS.map((f, i) => (
              <View
                key={f.id}
                style={[styles.friendRow, { backgroundColor: th.card, borderColor: th.cardBorder }]}
              >
                <View style={styles.avatarBox}>
                  <Text style={{ fontSize: 26 }}>{f.avatar}</Text>
                  {f.online && <View style={styles.onlineDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: th.text }}>
                    {f.name}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 2 }}>
                    <Text style={{ fontSize: 10, color: th.textMid, fontWeight: "600" }}>
                      ⭐ {f.xp} XP
                    </Text>
                    <Text style={{ fontSize: 10, color: th.textMid, fontWeight: "600" }}>
                      🔥 {f.streak} gün
                    </Text>
                    <Text style={{ fontSize: 10, color: f.online ? "#58CC02" : th.textLight }}>
                      {f.online ? "● çevrimiçi" : `son: ${f.lastActive}`}
                    </Text>
                  </View>
                </View>
                <Pressable style={[styles.poke, { backgroundColor: th.primary + "22", borderColor: th.primary }]}>
                  <Text style={{ fontSize: 16 }}>👋</Text>
                </Pressable>
              </View>
            ))}

            <Pressable style={[styles.addFriend, { borderColor: th.primary, backgroundColor: th.primary + "12" }]}>
              <Text style={{ fontSize: 14, fontWeight: "800", color: th.primary }}>
                + Arkadaş ekle
              </Text>
              <Text style={{ fontSize: 10, color: th.textMid, fontWeight: "600", marginTop: 2 }}>
                Hevalek nû lê zêde bike
              </Text>
            </Pressable>
          </View>
        )}

        {tab === "challenge" && (
          <View style={styles.list}>
            {/* Weekly challenge card */}
            <LinearGradient
              colors={["#A560E8", "#8549BA"] as unknown as readonly [string, string, ...string[]]}
              style={styles.challengeCard}
            >
              <Text style={styles.challengeTitle}>{WEEKLY_CHALLENGE.title}</Text>
              <Text style={styles.challengeSub}>{WEEKLY_CHALLENGE.titleKu}</Text>
              <Text style={styles.challengeDesc}>{WEEKLY_CHALLENGE.description}</Text>

              <View style={styles.challengeProgress}>
                <View style={styles.challengeBar}>
                  <View
                    style={[
                      styles.challengeFill,
                      { width: `${Math.min(100, (lessonsToday / WEEKLY_CHALLENGE.goal) * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.challengeProgressText}>
                  {lessonsToday}/{WEEKLY_CHALLENGE.goal} ders
                </Text>
              </View>

              <View style={styles.challengeFooter}>
                <View>
                  <Text style={styles.challengeReward}>🎁 +{WEEKLY_CHALLENGE.reward} XP</Text>
                  <Text style={styles.challengeRewardSub}>Ödül</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.challengeTime}>⏱️ {WEEKLY_CHALLENGE.endsIn}</Text>
                  <Text style={styles.challengeTimeSub}>kalan süre</Text>
                </View>
              </View>
            </LinearGradient>

            <Text style={[styles.sectionTitle, { color: th.text, marginTop: 16 }]}>
              🎯 Günlük Mini Yarışlar
            </Text>

            {[
              { icon: "⚡", title: "10 dakikada 5 ders", titleKu: "Di 10 deqîqe de 5 ders", reward: 50, locked: lessonsToday < 1 },
              { icon: "🎯", title: "Bir kategoride 3 ders üst üste", titleKu: "Di kategoriyek de 3 ders", reward: 30, locked: false },
              { icon: "🏃", title: "Pratiği 100% tamamla", titleKu: "Pratîkê %100 biqedîne", reward: 25, locked: false },
            ].map((c, i) => (
              <View
                key={i}
                style={[
                  styles.miniChallenge,
                  { backgroundColor: th.card, borderColor: th.cardBorder, opacity: c.locked ? 0.55 : 1 },
                ]}
              >
                <Text style={{ fontSize: 26 }}>{c.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "800", color: th.text }}>
                    {c.title}
                  </Text>
                  <Text style={{ fontSize: 10, color: th.textLight, fontWeight: "600", marginTop: 2 }}>
                    {c.titleKu}
                  </Text>
                </View>
                <View style={[styles.rewardChip, { backgroundColor: th.accent + "22", borderColor: th.accent }]}>
                  <Text style={{ fontSize: 10, fontWeight: "900", color: th.accent }}>
                    +{c.reward} XP
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================================
//  PLAYER ROW
// =====================================================================

function PlayerRow({ rank, player, th }: { rank: number; player: Player; th: any }) {
  const isTop3 = rank <= 3;
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <View
      style={[
        styles.playerRow,
        {
          backgroundColor: player.isYou ? th.primary + "22" : th.card,
          borderColor: player.isYou ? th.primary : th.cardBorder,
          borderWidth: player.isYou ? 2 : 1,
        },
      ]}
    >
      <View style={[styles.rankBox, { backgroundColor: isTop3 ? "#FFC200" + "33" : th.bgDark }]}>
        {medal ? (
          <Text style={{ fontSize: 18 }}>{medal}</Text>
        ) : (
          <Text style={{ fontSize: 13, fontWeight: "900", color: th.text }}>{rank}</Text>
        )}
      </View>

      <Text style={{ fontSize: 26 }}>{player.avatar}</Text>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "800", color: th.text }}>
          {player.name} {player.isYou && <Text style={{ color: th.primary }}>(Sen)</Text>}
        </Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 2 }}>
          <Text style={{ fontSize: 10, color: th.textMid, fontWeight: "600" }}>
            🔥 {player.streak}
          </Text>
          <Text style={{ fontSize: 10, color: th.textLight }}>·</Text>
          <Text style={{ fontSize: 10, color: th.textMid, fontWeight: "600" }}>
            {player.league.toUpperCase()} Lig
          </Text>
        </View>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontSize: 15, fontWeight: "900", color: th.accent }}>{player.xp}</Text>
        <Text style={{ fontSize: 9, color: th.textLight, fontWeight: "700" }}>XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: { fontSize: 22, fontWeight: "900", color: "#fff" },
  subtitle: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2, fontWeight: "600" },

  youCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 14,
    padding: 12,
  },
  youIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  youLeague: { fontSize: 14, fontWeight: "900", color: "#fff" },
  youRank: { fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2, fontWeight: "600" },
  nextBadge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },

  tabs: {
    flexDirection: "row",
    margin: 14,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    gap: 4,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10 },

  scroll: { paddingHorizontal: 14, paddingBottom: 30 },
  sectionTitle: { fontSize: 13, fontWeight: "800", marginBottom: 8, letterSpacing: 0.3 },
  list: { gap: 8 },

  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
  },
  rankBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },

  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  avatarBox: { width: 44, height: 44, alignItems: "center", justifyContent: "center", position: "relative" },
  onlineDot: {
    position: "absolute", bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: "#58CC02",
    borderWidth: 2, borderColor: "#fff",
  },
  poke: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5,
  },

  addFriend: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    marginTop: 8,
  },

  challengeCard: {
    padding: 18,
    borderRadius: 20,
  },
  challengeTitle: { fontSize: 18, fontWeight: "900", color: "#fff" },
  challengeSub: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "600", marginTop: 2 },
  challengeDesc: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 12, fontWeight: "500", lineHeight: 18 },
  challengeProgress: { marginTop: 14 },
  challengeBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.25)",
    overflow: "hidden",
  },
  challengeFill: { height: "100%", backgroundColor: "#FFC200", borderRadius: 4 },
  challengeProgressText: { fontSize: 11, color: "#fff", fontWeight: "700", marginTop: 6, textAlign: "right" },
  challengeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.18)",
  },
  challengeReward: { fontSize: 16, fontWeight: "900", color: "#FFC200" },
  challengeRewardSub: { fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 1, fontWeight: "600" },
  challengeTime: { fontSize: 13, fontWeight: "800", color: "#fff" },
  challengeTimeSub: { fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 1, fontWeight: "600" },

  miniChallenge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  rewardChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
  },
});
