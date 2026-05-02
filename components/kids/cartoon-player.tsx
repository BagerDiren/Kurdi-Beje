import { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";

const { width: SW } = Dimensions.get("window");
const VIDEO_HEIGHT = (SW * 9) / 16;

type Props = {
  videoId: string;
  autoplay?: boolean;
};

/**
 * YouTube videosunu in-app embed olarak oynatır.
 * react-native-webview kullanır.
 *
 * Mobile YouTube embed URL'i: ?playsinline=1&rel=0&modestbranding=1
 */
export function CartoonPlayer({ videoId, autoplay = false }: Props) {
  const [loading, setLoading] = useState(true);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body, html { margin: 0; padding: 0; background: #000; height: 100%; }
          .wrap { position: relative; width: 100%; height: 100%; }
          iframe {
            position: absolute; top: 0; left: 0;
            width: 100%; height: 100%; border: 0;
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <iframe
            src="https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>
        </div>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, { height: VIDEO_HEIGHT }]}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        allowsFullscreenVideo
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={!autoplay}
        onLoad={() => setLoading(false)}
        style={{ flex: 1, backgroundColor: "#000" }}
      />
      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
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
  },
  loadingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
