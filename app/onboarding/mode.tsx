import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { KevoMascot } from "@/components/kevo-mascot";
import { useApp } from "@/data/app-context";

/**
 * Yaş grubu seçimi — Türkçe öncelikli.
 * Çocuk → renkli/oyunlu mod (klasik path)
 * Yetişkin → koyu profesyonel mod (kategori grid + Duolingo intro flow)
 */
export default function ModeScreen() {
  const { age, setAge, setLvl } = useApp();

  const continueFlow = () => {
    if (!age) return;
    setLvl("a1"); // Default A1 başlangıç
    if (age === "child") {
      router.push("/onboarding/language");
    } else {
      router.push("/intro/hello");
    }
  };

  const msgs: Record<string, string> = {
    child: "Eğlenceli oyunlarla başlayalım! 🎉",
    adult: "Profesyonel bir öğrenme yolculuğu! 📚",
  };
  const mood = age === "child" ? "happy" : age === "adult" ? "neutral" : "happy";

  return (
    <LinearGradient colors={["#1B4332", "#2D6A4F", "#40916C"]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Kevo */}
        <View style={styles.kevo}>
          <KevoMascot size={110} mood={mood} speaking={!!age} />
        </View>

        {/* Speech bubble */}
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>
            {msgs[age ?? ""] ?? "Yaş grubunu seç!"}
          </Text>
          <View style={styles.bubbleTail} />
        </View>

        {/* Title */}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Yaş Grubunu Seç</Text>
          <Text style={styles.titleSub}>Koma xwe hilbijêre</Text>
        </View>

        {/* Cards */}
        <View style={styles.cards}>
          {/* Child */}
          <Pressable
            onPress={() => setAge("child")}
            style={[
              styles.card,
              age === "child" && styles.cardActive,
              age === "child" && { borderColor: "#E8B931" },
            ]}
          >
            {age === "child" ? (
              <LinearGradient colors={["#FFF8E1", "#FFFDE7"]} style={styles.cardInner}>
                <View style={[styles.cardIcon, { backgroundColor: "#FFD54F" }]}>
                  <Text style={{ fontSize: 36 }}>🧒</Text>
                </View>
                <Text style={[styles.cardTitle, { color: "#2D5A3D" }]}>Çocuk</Text>
                <Text style={[styles.cardSub, { color: "#5C4033" }]}>4 - 12 yaş</Text>
                <View style={styles.tags}>
                  {["🎮", "🎨", "🎵"].map((e, i) => (
                    <Text key={i} style={{ fontSize: 14 }}>{e}</Text>
                  ))}
                </View>
                <Text style={[styles.cardDesc, { color: "#8B7355" }]}>Oyunlu & renkli</Text>
              </LinearGradient>
            ) : (
              <View style={styles.cardInner}>
                <View style={[styles.cardIcon, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                  <Text style={{ fontSize: 36 }}>🧒</Text>
                </View>
                <Text style={[styles.cardTitle, { color: "#fff" }]}>Çocuk</Text>
                <Text style={[styles.cardSub, { color: "rgba(255,255,255,0.5)" }]}>4 - 12 yaş</Text>
                <View style={styles.tags}>
                  {["🎮", "🎨", "🎵"].map((e, i) => (
                    <Text key={i} style={{ fontSize: 14, opacity: 0.4 }}>{e}</Text>
                  ))}
                </View>
                <Text style={[styles.cardDesc, { color: "rgba(255,255,255,0.35)" }]}>
                  Oyunlu & renkli
                </Text>
              </View>
            )}
          </Pressable>

          {/* Adult */}
          <Pressable
            onPress={() => setAge("adult")}
            style={[
              styles.card,
              age === "adult" && styles.cardActive,
              age === "adult" && { borderColor: "#6FCF7C" },
            ]}
          >
            {age === "adult" ? (
              <LinearGradient colors={["#1E4D32", "#2E7D46"]} style={styles.cardInner}>
                <View style={[styles.cardIcon, { backgroundColor: "#6FCF7C" }]}>
                  <Text style={{ fontSize: 36 }}>🧑</Text>
                </View>
                <Text style={[styles.cardTitle, { color: "#fff" }]}>Yetişkin</Text>
                <Text style={[styles.cardSub, { color: "#A5D6A7" }]}>13+ yaş</Text>
                <View style={styles.tags}>
                  {["📚", "🧠", "📝"].map((e, i) => (
                    <Text key={i} style={{ fontSize: 14 }}>{e}</Text>
                  ))}
                </View>
                <Text style={[styles.cardDesc, { color: "#A5D6A7" }]}>Profesyonel & ciddi</Text>
              </LinearGradient>
            ) : (
              <View style={styles.cardInner}>
                <View style={[styles.cardIcon, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                  <Text style={{ fontSize: 36 }}>🧑</Text>
                </View>
                <Text style={[styles.cardTitle, { color: "#fff" }]}>Yetişkin</Text>
                <Text style={[styles.cardSub, { color: "rgba(255,255,255,0.5)" }]}>13+ yaş</Text>
                <View style={styles.tags}>
                  {["📚", "🧠", "📝"].map((e, i) => (
                    <Text key={i} style={{ fontSize: 14, opacity: 0.4 }}>{e}</Text>
                  ))}
                </View>
                <Text style={[styles.cardDesc, { color: "rgba(255,255,255,0.35)" }]}>
                  Profesyonel & ciddi
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={{ flex: 1 }} />

        {/* Continue */}
        <Pressable
          onPress={continueFlow}
          disabled={!age}
          style={({ pressed }) => [
            styles.continueBtn,
            !age && styles.continueBtnDisabled,
            pressed && { opacity: 0.85 },
          ]}
        >
          {age ? (
            <LinearGradient
              colors={age === "child" ? ["#E8B931", "#F5D76E"] : ["#6FCF7C", "#8EE89A"]}
              style={styles.continueBtnInner}
            >
              <Text
                style={[
                  styles.continueBtnText,
                  { color: age === "child" ? "#2C1810" : "#0F2A1B" },
                ]}
              >
                {age === "child" ? "Hadi başlayalım! 🚀" : "Devam et 📖"}
              </Text>
            </LinearGradient>
          ) : (
            <View style={[styles.continueBtnInner, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
              <Text style={[styles.continueBtnText, { color: "rgba(255,255,255,0.3)" }]}>
                Bir grup seç...
              </Text>
            </View>
          )}
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24, paddingTop: 30, paddingBottom: 24 },
  kevo: { alignItems: "center", marginTop: 10 },
  bubble: {
    alignSelf: "center", marginTop: 4, marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 18, paddingHorizontal: 20, paddingVertical: 8,
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 15, elevation: 4,
  },
  bubbleText: { fontSize: 14, fontWeight: "700", color: "#2D5A3D", textAlign: "center" },
  bubbleTail: {
    position: "absolute", top: -7, alignSelf: "center",
    width: 0, height: 0,
    borderLeftWidth: 7, borderRightWidth: 7, borderBottomWidth: 7,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderBottomColor: "rgba(255,255,255,0.95)",
  },
  titleWrap: { alignItems: "center", marginBottom: 20 },
  title: {
    color: "#fff", fontSize: 22, fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  titleSub: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4, fontWeight: "600" },
  cards: { flexDirection: "row", gap: 14 },
  card: { flex: 1, borderRadius: 22, borderWidth: 2, borderColor: "rgba(255,255,255,0.15)", overflow: "hidden" },
  cardActive: { borderWidth: 3, transform: [{ scale: 1.02 }] },
  cardInner: { padding: 22, alignItems: "center", gap: 8 },
  cardIcon: { width: 70, height: 70, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 18, fontWeight: "800" },
  cardSub: { fontSize: 12, fontWeight: "600" },
  tags: { flexDirection: "row", gap: 4, marginTop: 2 },
  cardDesc: { fontSize: 10, fontWeight: "500", marginTop: 2 },
  continueBtn: { width: "100%", borderRadius: 18, overflow: "hidden" },
  continueBtnDisabled: { opacity: 0.5 },
  continueBtnInner: { paddingVertical: 16, alignItems: "center", borderRadius: 18 },
  continueBtnText: { fontSize: 17, fontWeight: "800" },
});
