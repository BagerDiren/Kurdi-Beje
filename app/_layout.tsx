import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import "react-native-reanimated";
import { useFonts, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold } from "@expo-google-fonts/fredoka";
import { Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold } from "@expo-google-fonts/nunito";

import { AppProvider } from "@/data/app-context";

export default function RootLayout() {
  // Lingokids/Drops tarzı premium tipografi:
  // - Fredoka  → başlıklar, butonlar (yuvarlak, eğlenceli)
  // - Nunito   → gövde metni (okunabilir, modern)
  const [fontsLoaded] = useFonts({
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!fontsLoaded) {
    // Fontlar yüklenirken sade bir bg göster (splash zaten kendi kontrolünü yapıyor)
    return <View style={{ flex: 1, backgroundColor: "#FFFAF5" }} />;
  }

  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="intro" />
        <Stack.Screen name="onboarding/mode" />
        <Stack.Screen name="onboarding/language" />
        <Stack.Screen name="onboarding/level" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson" />
        <Stack.Screen name="game" />
        <Stack.Screen name="goals" />
        <Stack.Screen name="category" />
        <Stack.Screen name="achievements" />
        <Stack.Screen name="practice" />
        <Stack.Screen name="kids-lesson" />
        <Stack.Screen name="balloon-game" />
        <Stack.Screen name="rocket-game" />
        <Stack.Screen name="cartoons" />
        <Stack.Screen name="quick-match" />
        <Stack.Screen name="farm-game" />
        <Stack.Screen name="drag-match" />
      </Stack>
      <StatusBar style="auto" />
    </AppProvider>
  );
}
