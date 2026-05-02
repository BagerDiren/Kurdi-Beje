import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { FloatingBalloons } from "@/components/kids/floating-balloons";
import { CartoonPlayer } from "@/components/kids/cartoon-player";
import {
  CARTOON_CATEGORIES, CARTOON_VIDEOS,
  getVideosByCategory,
  type CartoonCategory, type CartoonVideo,
} from "@/data/cartoon-videos";

export default function CartoonsScreen() {
  const [selectedCat, setSelectedCat] = useState<CartoonCategory>("song");
  const [playing, setPlaying] = useState<CartoonVideo | null>(null);

  const videos = getVideosByCategory(selectedCat);

  // Player modu
  if (playing) {
    return (
      <SafeAreaView style={styles.playerSafe} edges={["top"]}>
        {/* Top bar */}
        <View style={styles.playerTopBar}>
          <Pressable
            onPress={() => setPlaying(null)}
            hitSlop={12}
            style={styles.backBtn}
          >
            <Text style={{ fontSize: 26, color: "#fff" }}>‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.playerTitle} numberOfLines={1}>{playing.title}</Text>
            <Text style={styles.playerSubtitle} numberOfLines={1}>
              {playing.titleKu} · {playing.channel}
            </Text>
          </View>
        </View>

        {/* Video */}
        <CartoonPlayer videoId={playing.id} autoplay />

        {/* Açıklama */}
        <ScrollView style={styles.descScroll}>
          <View style={[styles.descCard, { borderColor: playing.color }]}>
            <Text style={{ fontSize: 36 }}>{playing.emoji}</Text>
            <Text style={styles.descTitle}>{playing.titleKu}</Text>
            <Text style={styles.descDesc}>{playing.description}</Text>
          </View>

          <Text style={styles.relatedTitle}>🎯 Diğer videolar</Text>
          <View style={styles.relatedList}>
            {CARTOON_VIDEOS
              .filter((v) => v.id !== playing.id)
              .slice(0, 6)
              .map((v) => (
                <VideoRow key={v.id} video={v} onPress={() => setPlaying(v)} />
              ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Liste modu
  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8E7" }}>
      <FloatingBalloons count={4} />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <LinearGradient
          colors={["#FF6B9D", "#FF8FA3", "#FFA1C5"] as unknown as readonly [string, string, ...string[]]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerBack}>
              <Text style={{ fontSize: 24, color: "#fff" }}>‹</Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>📺 Çizgi Filmler</Text>
              <Text style={styles.headerSub}>Zarok TV — Kurmancî çocuk videoları</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Kategori filtreleri */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {CARTOON_CATEGORIES.map((c) => {
            const active = selectedCat === c.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => setSelectedCat(c.key)}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: active ? c.color : "#fff",
                    borderColor: c.color,
                  },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{c.emoji}</Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "900",
                    color: active ? "#fff" : c.color,
                  }}
                >
                  {c.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Video listesi */}
        <ScrollView contentContainerStyle={styles.list}>
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} onPress={() => setPlaying(v)} />
          ))}

          <View style={styles.attribution}>
            <Text style={styles.attrText}>
              📡 İçerikler Zarok TV ve diğer açık YouTube kanallarından
              telif sahiplerine ait olarak embed edilmiştir.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// =====================================================================
//  BÜYÜK VIDEO KARTI (liste için)
// =====================================================================
function VideoCard({ video, onPress }: { video: CartoonVideo; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: video.color, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.thumbBox}>
        <Image
          source={{ uri: video.thumbnail }}
          style={styles.thumb}
          resizeMode="cover"
        />
        {/* Play overlay */}
        <View style={styles.playOverlay}>
          <View style={[styles.playCircle, { backgroundColor: video.color }]}>
            <Text style={{ fontSize: 22, color: "#fff", marginLeft: 3 }}>▶</Text>
          </View>
        </View>
        <View style={[styles.emojiTag, { backgroundColor: video.color }]}>
          <Text style={{ fontSize: 18 }}>{video.emoji}</Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: video.color }]}>{video.titleKu}</Text>
        <Text style={styles.cardSubtitle}>{video.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{video.description}</Text>
        <Text style={styles.cardMeta}>📺 {video.channel}</Text>
      </View>
    </Pressable>
  );
}

// =====================================================================
//  KOMPAKT VIDEO SATIRI (related list için)
// =====================================================================
function VideoRow({ video, onPress }: { video: CartoonVideo; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: video.color + "55", opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.rowThumbBox}>
        <Image source={{ uri: video.thumbnail }} style={styles.rowThumb} resizeMode="cover" />
        <View style={[styles.rowPlay, { backgroundColor: video.color }]}>
          <Text style={{ color: "#fff", fontSize: 13 }}>▶</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: "900", color: video.color }} numberOfLines={1}>
          {video.titleKu}
        </Text>
        <Text style={{ fontSize: 11, color: "#5C4033", fontWeight: "600", marginTop: 2 }} numberOfLines={1}>
          {video.title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // === Liste view ===
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerBack: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: "700", marginTop: 2 },

  catRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  list: {
    padding: 16,
    paddingBottom: 30,
    gap: 14,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    borderWidth: 2,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  thumbBox: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
  },
  thumb: { width: "100%", height: "100%" },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  emojiTag: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  cardInfo: { padding: 14, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: "900" },
  cardSubtitle: { fontSize: 12, fontWeight: "700", color: "#5C4033" },
  cardDesc: { fontSize: 11, color: "#8B7355", fontWeight: "500", lineHeight: 15, marginTop: 2 },
  cardMeta: { fontSize: 10, color: "#AAA", fontWeight: "700", marginTop: 2 },

  attribution: {
    backgroundColor: "rgba(0,0,0,0.04)",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  attrText: { fontSize: 10, color: "#8B7355", textAlign: "center", lineHeight: 14 },

  // === Player view ===
  playerSafe: { flex: 1, backgroundColor: "#1A1A1A" },
  playerTopBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
    backgroundColor: "#000",
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  playerTitle: { color: "#fff", fontSize: 14, fontWeight: "900" },
  playerSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600" },

  descScroll: { flex: 1, backgroundColor: "#FFF8E7" },
  descCard: {
    margin: 16,
    padding: 18,
    backgroundColor: "#fff",
    borderRadius: 22,
    borderWidth: 2.5,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  descTitle: { fontSize: 22, fontWeight: "900", color: "#1A1A1A" },
  descDesc: {
    fontSize: 13,
    color: "#5C4033",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 19,
  },

  relatedTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#5C4033",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  relatedList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  rowThumbBox: {
    width: 90,
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  rowThumb: { width: "100%", height: "100%" },
  rowPlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -12,
    marginTop: -12,
    width: 24, height: 24, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
});
