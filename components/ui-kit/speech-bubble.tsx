import { View, Text, StyleSheet } from "react-native";
import { DUO } from "@/data/duo-colors";
import { TYPO } from "@/data/typography";

type SpeechBubbleProps = {
  children: React.ReactNode;
  /** Kuyruk yönü: 'down' mascot aşağıda, 'up' mascot yukarıda */
  tail?: "down" | "up";
  /** Kuyruğun yatay konumu (sol kenardan %) */
  tailOffset?: number;
  style?: any;
};

/**
 * Konuşma balonu — token sistemine bağlı.
 * Beyaz dolgu, 2px açık gri border, alt/üst üçgen kuyruk.
 */
export function SpeechBubble({
  children,
  tail = "down",
  tailOffset = 50,
  style,
}: SpeechBubbleProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.bubble}>
        {typeof children === "string" ? (
          <Text style={styles.text}>{children}</Text>
        ) : (
          children
        )}
      </View>
      {/* Dış üçgen (border) */}
      <View
        style={[
          styles.tailOuter,
          tail === "down"
            ? { bottom: -11, left: `${tailOffset}%`, marginLeft: -12 }
            : { top: -11, left: `${tailOffset}%`, marginLeft: -12 },
          tail === "up" && { transform: [{ rotate: "180deg" }] },
        ]}
      />
      {/* İç üçgen (fill) */}
      <View
        style={[
          styles.tailInner,
          tail === "down"
            ? { bottom: -8, left: `${tailOffset}%`, marginLeft: -10 }
            : { top: -8, left: `${tailOffset}%`, marginLeft: -10 },
          tail === "up" && { transform: [{ rotate: "180deg" }] },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignSelf: "stretch",
  },
  bubble: {
    backgroundColor: DUO.bubbleBg,
    borderWidth: 2,
    borderColor: DUO.bubbleBorder,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  text: {
    ...TYPO.bubble,
    color: DUO.textStrong,
    textAlign: "center",
  },
  tailOuter: {
    position: "absolute",
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: DUO.bubbleBorder,
  },
  tailInner: {
    position: "absolute",
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: DUO.bubbleBg,
  },
});
