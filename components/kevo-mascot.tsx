import { forwardRef, useImperativeHandle, useEffect } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Image as ExpoImage } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";

export type KevoMood = "happy" | "sad" | "neutral" | "excited";
export type KevoAction = "idle" | "jump" | "clap" | "teach" | "wave" | "cheer";

export type KevoHandle = {
  jump: () => void;
  clap: (times?: number) => void;
  wave: () => void;
  cheer: () => void;
};

type KevoProps = {
  mood?: KevoMood;
  size?: number;
  speaking?: boolean;
  idle?: boolean;
  action?: KevoAction;
  onPress?: () => void;
};

/**
 * Kevo v6 — Video tabanlı Pixar-kalitesi maskot.
 *
 * Her aksiyon için ayrı GIF (şeffaf arka planlı) oynar.
 * Henüz GIF'i olmayan aksiyonlar idle'a düşer.
 *
 * Mevcut videolar:
 *   ✅ idle  → kevo-idle.gif
 *   ⏳ wave, clap, jump, cheer, teach → idle'a fallback
 *
 * Ayrıca wrapper üzerinde mikro-animasyon katmanı:
 *  - Jump: squash/stretch + yukarı sıçrama (wrap transform)
 *  - Clap: hafif sıçrama + hızlı titreşim
 *  - Wave: hafif tilt salınımı
 *  - Cheer: yukarı sıçrama + büyüme
 *  - Idle: sabit, GIF kendi içinde zaten canlı
 */

// GIF kaynakları — eksik olanlar kevo-idle'a fallback yapar
const SOURCES: Record<KevoAction, any> = {
  idle: require("@/assets/videos/kevo/kevo-idle.gif"),
  // TODO: aşağıdakiler GIF gelince değiştirilecek
  wave: require("@/assets/videos/kevo/kevo-idle.gif"),
  clap: require("@/assets/videos/kevo/kevo-idle.gif"),
  jump: require("@/assets/videos/kevo/kevo-idle.gif"),
  cheer: require("@/assets/videos/kevo/kevo-idle.gif"),
  teach: require("@/assets/videos/kevo/kevo-idle.gif"),
};

export const KevoMascot = forwardRef<KevoHandle, KevoProps>(function KevoMascot(
  { size = 200, action = "idle", onPress, idle = true },
  ref
) {
  // Wrapper motion (video üstüne eklenen mikro-animasyon)
  const scaleY = useSharedValue(1);
  const scaleX = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const idleBob = useSharedValue(0);
  const idleSway = useSharedValue(0);

  // Idle wrapper motions (GIF kendi içinde animasyonlu, biz sadece hafif bob + sway)
  useEffect(() => {
    if (!idle) return;
    idleBob.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    idleSway.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    return () => {
      cancelAnimation(idleBob);
      cancelAnimation(idleSway);
    };
  }, [idle]);

  // Aksiyon değişiklik efekti (yalnızca wrapper motion — GIF zaten kendi aksiyonunu oynar)
  useEffect(() => {
    if (action === "jump") jumpInternal();
    else if (action === "cheer") cheerInternal();
    else if (action === "clap") clapInternal(3);
  }, [action]);

  const jumpInternal = () => {
    scaleY.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withTiming(1.1, { duration: 180 }),
      withSpring(1, { damping: 6, stiffness: 200, mass: 0.6 })
    );
    scaleX.value = withSequence(
      withTiming(1.15, { duration: 100 }),
      withTiming(0.92, { duration: 180 }),
      withSpring(1, { damping: 6, stiffness: 200, mass: 0.6 })
    );
    translateY.value = withSequence(
      withTiming(4, { duration: 100 }),
      withTiming(-32, { duration: 260, easing: Easing.out(Easing.cubic) }),
      withSpring(0, { damping: 8, stiffness: 180, mass: 0.7 })
    );
  };

  const clapInternal = (times = 4) => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 160, easing: Easing.out(Easing.sin) }),
        withTiming(0, { duration: 160, easing: Easing.in(Easing.sin) })
      ),
      times,
      false
    );
  };

  const waveInternal = () => {
    rotate.value = withSequence(
      withTiming(6, { duration: 220, easing: Easing.out(Easing.back(2)) }),
      withTiming(-6, { duration: 220 }),
      withTiming(6, { duration: 220 }),
      withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) })
    );
  };

  const cheerInternal = () => {
    translateY.value = withSequence(
      withTiming(-22, { duration: 320, easing: Easing.out(Easing.cubic) }),
      withSpring(0, { damping: 8, stiffness: 180 })
    );
    scaleY.value = withSequence(
      withTiming(1.1, { duration: 320 }),
      withSpring(1, { damping: 8, stiffness: 180 })
    );
    scaleX.value = withSequence(
      withTiming(1.1, { duration: 320 }),
      withSpring(1, { damping: 8, stiffness: 180 })
    );
  };

  useImperativeHandle(ref, () => ({
    jump: jumpInternal,
    clap: clapInternal,
    wave: waveInternal,
    cheer: cheerInternal,
  }));

  const wrapperStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value + idleBob.value },
      { scaleX: scaleX.value },
      { scaleY: scaleY.value },
      { rotate: `${rotate.value + idleSway.value}deg` },
    ],
  }));

  const source = SOURCES[action] ?? SOURCES.idle;

  const content = (
    <Animated.View style={[wrapperStyle, { width: size, height: size }]}>
      <ExpoImage
        source={source}
        style={styles.image}
        contentFit="contain"
        transition={200}
      />
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          jumpInternal();
          onPress();
        }}
        hitSlop={8}
      >
        {content}
      </Pressable>
    );
  }
  return content;
});

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
});

export default KevoMascot;
