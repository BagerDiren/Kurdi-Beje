import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AppProvider } from "@/data/app-context";

export default function RootLayout() {
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
      </Stack>
      <StatusBar style="auto" />
    </AppProvider>
  );
}
