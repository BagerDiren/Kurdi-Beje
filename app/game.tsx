import { View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/data/app-context";
import { getWordPool } from "@/data/game-data";
import {
  SpeedQuiz,
  WordMatchGame,
  SentenceGame,
  AnimalSoundGame,
  HiddenImageGame,
  WordCaveGame,
  FarmGame,
} from "@/components/game";

export default function GameScreen() {
  const { activeGame, th, t, completed, addXp, setActiveGame } = useApp();

  const pool = getWordPool(completed);
  const goBack = () => { setActiveGame(null); router.back(); };
  const handleXp = (pts: number) => addXp(pts);

  if (!activeGame) {
    router.replace("/(tabs)");
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }}>
      {activeGame === "speed" && <SpeedQuiz th={th} t={t} pool={pool} onXp={handleXp} onBack={goBack} />}
      {activeGame === "match" && <WordMatchGame th={th} pool={pool} onXp={handleXp} onBack={goBack} />}
      {activeGame === "sentence" && <SentenceGame th={th} onXp={handleXp} onBack={goBack} />}
      {activeGame === "deng" && <AnimalSoundGame th={th} t={t} onXp={handleXp} onBack={goBack} />}
      {activeGame === "wene" && <HiddenImageGame th={th} t={t} onXp={handleXp} onBack={goBack} />}
      {activeGame === "shkeft" && <WordCaveGame th={th} t={t} onXp={handleXp} onBack={goBack} />}
      {activeGame === "zevi" && <FarmGame th={th} t={t} onXp={handleXp} onBack={goBack} />}
    </SafeAreaView>
  );
}
