import { Pressable, Text, View, StyleSheet } from "react-native";
import { DUO } from "@/data/duo-colors";
import { TYPO } from "@/data/typography";

type SelectionCardProps = {
  label: string;
  trailing?: string;              // sağ taraftaki ikincil yazı (Sivik/Cidî gibi)
  icon?: React.ReactNode;         // sol taraftaki opsiyonel ikon
  selected?: boolean;
  onPress?: () => void;
  style?: any;
};

/**
 * Onboarding liste seçim kartı.
 * Duolingo'dan rafine edilmiş:
 *  - 2px alt gölge (3D ezilme hissi)
 *  - Seçilince: mavi border + açık mavi bg + hafif scale
 *  - Smooth transition (native feedback)
 *  - Trailing label sağda küçük puslu
 */
export function SelectionCard({
  label,
  trailing,
  icon,
  selected = false,
  onPress,
  style,
}: SelectionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        { marginBottom: pressed ? 0 : 4 },
        style,
      ]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.card,
            {
              backgroundColor: selected ? DUO.cardBgActive : DUO.cardBg,
              borderColor: selected ? DUO.cardBorderActive : DUO.cardBorder,
              borderBottomColor: selected ? DUO.cardBorderActive : DUO.borderDark,
              borderBottomWidth: pressed ? 2 : 4,
            },
            pressed && { transform: [{ translateY: 2 }] },
          ]}
        >
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text
            style={[
              styles.label,
              { color: selected ? DUO.blueDark : DUO.textStrong },
            ]}
            numberOfLines={2}
          >
            {label}
          </Text>
          {trailing ? (
            <Text style={[styles.trailing, { color: DUO.textLight }]}>{trailing}</Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 64,
  },
  icon: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...TYPO.bodyLg,
    fontWeight: "700",
    flex: 1,
  },
  trailing: {
    ...TYPO.body,
    fontWeight: "600",
  },
});
