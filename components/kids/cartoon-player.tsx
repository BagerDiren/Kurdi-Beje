import { useState, useCallback } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

const { width: SW } = Dimensions.get("window");
const VIDEO_HEIGHT = (SW * 9) / 16;

type Props = {
  videoId: string;
  autoplay?: boolean;
};

/**
 * Profesyonel YouTube oynatıcı.
 * react-native-youtube-iframe kullanıyor — IFrame Player API ile direkt
 * iletişim, embed kısıtlamalarını aşar, kontroller stabil.
 */
export function CartoonPlayer({ videoId, autoplay = true }: Props) {
  const [playing, setPlaying] = useState(autoplay);
  const [ready, setReady] = useState(false);

  const onReady = useCallback(() => setReady(true), []);
  const onStateChange = useCallback((state: string) => {
    if (state === "ended") setPlaying(false);
  }, []);
  const onError = useCallback(() => setReady(true), []);

  return (
    <View style={[styles.container, { height: VIDEO_HEIGHT }]}>
      <YoutubePlayer
        height={VIDEO_HEIGHT}
        width={SW}
        play={playing}
        videoId={videoId}
        onReady={onReady}
        onChangeState={onStateChange}
        onError={onError}
        webViewProps={{
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: false,
        }}
        initialPlayerParams={{
          controls: true,
          modestbranding: true,
          rel: false,
          preventFullScreen: false,
        }}
      />
      {!ready && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.loadingText}>Yükleniyor…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000",
    overflow: "hidden",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  loadingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
