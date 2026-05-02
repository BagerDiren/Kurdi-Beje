import { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withRepeat, withSequence, Easing,
} from "react-native-reanimated";

import { KidCharacter, type CharacterKey } from "./kid-character";
import { KIDS_THEME, RADIUS, SHADOW, SPACING, TYPO } from "./design";

const { width: SW } = Dimensions.get("window");

/**
 * Tüm onboarding/intro ekranları için tek paylaşımlı template.
 * Görsel bütünlük: aynı arka plan, aynı tipografi, aynı progress bar,
 * aynı CTA stili.
 *
 * Kullanım: hello/questions/level/goal/commitment hepsi bu template'i
 * farklı içerikle çağırır. Yamalı look bitti.
 */

export type OnboardingScreenProps = {
  /** Üst ilerleme barı 0-1 arası */
  progress: number;
  /** Geri butonu callback'i (yoksa back arrow gizlenir) */
  onBack?: () => void;
  /** Üst sağda atla butonu (yoksa gizli) */
  onSkip?: () => void;
  /** Karakter (default: kevo) */
  character?: CharacterKey;
  /** Karakter konuşma balonu metni */
  bubbleText?: string;
  /** Ana başlık */
  title: string;
  /** Alt başlık (opsiyonel) */
  subtitle?: string;
  /** İçerik (seçenekler, formlar vs) */
  children?: React.ReactNode;
  /** Alt CTA buton metni */
  ctaText: string;
  /** CTA basıldığında */
  onCta: () => void;
  /** CTA disabled mı */
  ctaDisabled?: boolean;
  /** Vurgu rengi (default: primary) */
  accentColor?: string;
};

export function OnboardingScreen({
  progress, onBack, onSkip, character = "kevo",
  bubbleText, title, subtitle, children, ctaText, onCta, ctaDisabled, accentColor,
}: OnboardingScreenProps) {
  const accent = accentColor ?? KIDS_THEME.primary;
  const accentDark = accent === KIDS_THEME.primary ? KIDS_THEME.primaryDark : accent;

  // Karakter sürekli zıplama
  const charY = useSharedValue(20);
  const charOp = useSharedValue(0);
  const bubbleOp = useSharedValue(0);
  const bubbleY = useSharedValue(10);
  const titleOp = useSharedValue(0);
  const titleY = useSharedValue(20);
  const contentOp = useSharedValue(0);
  const contentY = useSharedValue(30);
  const progressW = useSharedValue(0);

  useEffect(() => {
    charOp.value = withTiming(1, { duration: 400 });
    charY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    bubbleOp.value = withDelay(300, withTiming(1, { duration: 400 }));
    bubbleY.value = withDelay(300, withTiming(0, { duration: 400 }));
    titleOp.value = withDelay(500, withTiming(1, { duration: 400 }));
    titleY.value = withDelay(500, withTiming(0, { duration: 400 }));
    contentOp.value = withDelay(700, withTiming(1, { duration: 400 }));
    contentY.value = withDelay(700, withTiming(0, { duration: 400 }));
    progressW.value = withTiming(progress * 100, { duration: 600 });
  }, [progress]);

  const charStyle = useAnimatedStyle(() => ({
    opacity: charOp.value,
    transform: [{ translateY: charY.value }],
  }));
  const bubbleStyle = useAnimatedStyle(() => ({
    opacity: bubbleOp.value,
    transform: [{ translateY: bubbleY.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOp.value,
    transform: [{ translateY: titleY.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOp.value,
    transform: [{ translateY: contentY.value }],
  }));
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressW.value}%` as `${number}%`,
  }));

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#FFE0EC", "#FFF4DC", "#E1F5FE"] as unknown as readonly [string, string, ...string[]]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Üst bar: geri + progress + atla */}
      <View style={styles.topBar}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { backgroundColor: accent }, progressBarStyle]} />
        </View>

        {onSkip ? (
          <Pressable onPress={onSkip} hitSlop={12} style={styles.skipBtn}>
            <Text style={styles.skipText}>Atla</Text>
          </Pressable>
        ) : (
          <View style={{ width: 50 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Karakter + konuşma balonu */}
        <View style={styles.charRow}>
          <Animated.View style={charStyle}>
            <View style={styles.charCircle}>
              <KidCharacter character={character} size={90} bounce />
            </View>
          </Animated.View>

          {bubbleText && (
            <Animated.View style={[styles.bubble, bubbleStyle]}>
              <Text style={styles.bubbleText}>{bubbleText}</Text>
              <View style={styles.bubbleArrow} />
            </Animated.View>
          )}
        </View>

        {/* Başlık + alt başlık */}
        <Animated.View style={[styles.titleBlock, titleStyle]}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </Animated.View>

        {/* İçerik (seçenekler, formlar) */}
        {children && <Animated.View style={[styles.content, contentStyle]}>{children}</Animated.View>}
      </ScrollView>

      {/* Alt CTA */}
      <View style={styles.ctaWrap}>
        <Pressable
          onPress={onCta}
          disabled={ctaDisabled}
          style={({ pressed }) => [
            styles.cta,
            ctaDisabled ? { opacity: 0.4 } : SHADOW(accent, "lg"),
            pressed && !ctaDisabled && { transform: [{ scale: 0.97 }] },
          ]}
        >
          <LinearGradient
            colors={
              ctaDisabled
                ? ["#CCC", "#AAA"] as unknown as readonly [string, string, ...string[]]
                : [accent, accentDark] as unknown as readonly [string, string, ...string[]]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGrad}
          >
            <Text style={styles.ctaText}>{ctaText}</Text>
            {!ctaDisabled && <Text style={styles.ctaArrow}>→</Text>}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

// =====================================================================
//  Onboarding seçenek kartı (radio liste)
// =====================================================================
export function OptionCard({
  emoji, label, sublabel, isActive, onPress, accentColor,
}: {
  emoji?: string;
  label: string;
  sublabel?: string;
  isActive: boolean;
  onPress: () => void;
  accentColor?: string;
}) {
  const accent = accentColor ?? KIDS_THEME.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        optionStyles.card,
        {
          borderColor: isActive ? accent : "rgba(0,0,0,0.06)",
          borderWidth: isActive ? 3 : 1.5,
          backgroundColor: isActive ? accent + "10" : KIDS_THEME.card,
          transform: [{ scale: isActive ? 1.01 : pressed ? 0.99 : 1 }],
        },
        isActive ? SHADOW(accent, "md") : SHADOW("#000", "sm"),
      ]}
    >
      {emoji && <Text style={optionStyles.emoji}>{emoji}</Text>}
      <View style={{ flex: 1 }}>
        <Text style={[optionStyles.label, { color: isActive ? accent : KIDS_THEME.ink }]}>
          {label}
        </Text>
        {sublabel && <Text style={optionStyles.sublabel}>{sublabel}</Text>}
      </View>
      <View style={[
        optionStyles.radio,
        isActive
          ? { backgroundColor: accent, borderColor: accent }
          : { borderColor: KIDS_THEME.silver },
      ]}>
        {isActive && <Text style={optionStyles.radioCheck}>✓</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: KIDS_THEME.bg },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: KIDS_THEME.card,
    alignItems: "center", justifyContent: "center",
    ...SHADOW("#000", "sm"),
  },
  backText: { fontSize: 26, color: KIDS_THEME.ink, fontFamily: "Fredoka_700Bold", lineHeight: 30 },
  skipBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  skipText: { ...TYPO.body, color: KIDS_THEME.smoke },

  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },

  body: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: 120,
    gap: SPACING.lg,
  },

  charRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: SPACING.md,
  },
  charCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "#fff",
    ...SHADOW(KIDS_THEME.primary, "md"),
  },
  bubble: {
    flex: 1,
    backgroundColor: KIDS_THEME.card,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: 14,
    ...SHADOW("#000", "sm"),
    position: "relative",
  },
  bubbleText: { ...TYPO.body, color: KIDS_THEME.ink, lineHeight: 19 },
  bubbleArrow: {
    position: "absolute",
    left: -8, bottom: 14,
    width: 0, height: 0,
    borderTopWidth: 8, borderBottomWidth: 8, borderRightWidth: 10,
    borderTopColor: "transparent", borderBottomColor: "transparent",
    borderRightColor: KIDS_THEME.card,
  },

  titleBlock: { gap: 6, marginTop: SPACING.sm },
  title: { ...TYPO.display, color: KIDS_THEME.ink, lineHeight: 32 },
  subtitle: { ...TYPO.body, color: KIDS_THEME.smoke, lineHeight: 19 },

  content: { gap: SPACING.md, marginTop: SPACING.sm },

  ctaWrap: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 32,
    backgroundColor: "rgba(255, 250, 245, 0.92)",
  },
  cta: { borderRadius: RADIUS.xl, overflow: "hidden" },
  ctaGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  ctaText: { ...TYPO.button, color: "#fff" },
  ctaArrow: { fontSize: 22, color: "#fff", fontFamily: "Fredoka_700Bold" },
});

const optionStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  emoji: { fontSize: 36 },
  label: { ...TYPO.h3 },
  sublabel: { ...TYPO.caption, color: KIDS_THEME.smoke, marginTop: 2 },
  radio: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  radioCheck: { color: "#fff", fontFamily: "Fredoka_700Bold", fontSize: 14 },
});
