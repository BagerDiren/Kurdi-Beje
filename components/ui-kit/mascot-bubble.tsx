import { View, Text, StyleSheet } from "react-native";
import { KevoMascot, type KevoAction, type KevoMood } from "@/components/kevo-mascot";
import { DUO } from "@/data/duo-colors";
import { TYPO } from "@/data/typography";

type MascotBubbleProps = {
  message: string;
  /** Bold vurgulu parçalar */
  highlights?: string[];
  mascotSize?: number;
  mood?: KevoMood;
  speaking?: boolean;
  /** Kevo'nun pozu/aksiyonu */
  action?: KevoAction;
};

/**
 * Onboarding ekranlarında kullanılan: sol Kevo + sağ balon.
 * Duolingo'dan üstün:
 *  - Metin içindeki highlights otomatik bold + yeşil vurgu
 *  - Balonun üçgen kuyruğu Kevo'nun yüzüne yönelir
 *  - Kevo'nun mood'u prop ile değişir
 *  - Daha yumuşak gölge ve kenar yuvarlatma
 */
export function MascotBubble({
  message,
  highlights = [],
  mascotSize = 90,
  mood = "happy",
  speaking = true,
  action = "idle",
}: MascotBubbleProps) {
  // Highlight'ları parçala
  const renderText = () => {
    if (highlights.length === 0) {
      return <Text style={styles.text}>{message}</Text>;
    }
    // Basit segment ayrıştırma
    let parts: { text: string; bold: boolean }[] = [{ text: message, bold: false }];
    for (const h of highlights) {
      const next: { text: string; bold: boolean }[] = [];
      for (const p of parts) {
        if (p.bold) {
          next.push(p);
          continue;
        }
        const segments = p.text.split(h);
        segments.forEach((seg, i) => {
          if (seg) next.push({ text: seg, bold: false });
          if (i < segments.length - 1) next.push({ text: h, bold: true });
        });
      }
      parts = next;
    }
    return (
      <Text style={styles.text}>
        {parts.map((p, i) =>
          p.bold ? (
            <Text key={i} style={styles.bold}>
              {p.text}
            </Text>
          ) : (
            <Text key={i}>{p.text}</Text>
          )
        )}
      </Text>
    );
  };

  return (
    <View style={styles.row}>
      <View style={styles.mascotCol}>
        <KevoMascot size={mascotSize} mood={mood} speaking={speaking} idle action={action} />
      </View>
      <View style={styles.bubbleCol}>
        <View style={styles.bubble}>{renderText()}</View>
        {/* Sol-bottom üçgen kuyruk (Kevo'ya yönelir) */}
        <View style={styles.tailOuter} />
        <View style={styles.tailInner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  mascotCol: {
    width: 100,
    alignItems: "flex-start",
  },
  bubbleCol: {
    flex: 1,
    position: "relative",
    marginBottom: 12,
  },
  bubble: {
    backgroundColor: DUO.bubbleBg,
    borderWidth: 2,
    borderColor: DUO.bubbleBorder,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  text: {
    ...TYPO.bodyLg,
    color: DUO.textStrong,
    fontWeight: "600",
    lineHeight: 24,
  },
  bold: {
    fontWeight: "900",
    color: DUO.mediumPurple,
  },
  tailOuter: {
    position: "absolute",
    left: -10,
    bottom: 16,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 12,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: DUO.bubbleBorder,
  },
  tailInner: {
    position: "absolute",
    left: -7,
    bottom: 18,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 10,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: DUO.bubbleBg,
  },
});
