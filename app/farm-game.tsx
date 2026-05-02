import { router } from "expo-router";
import { FarmGameV2 } from "@/components/kids/farm-game-v2";

export default function FarmGameScreen() {
  return <FarmGameV2 onClose={() => router.replace("/(tabs)")} />;
}
