import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useApp } from "@/data/app-context";

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", gap: 1, paddingTop: 4 }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{icon}</Text>
      <Text style={{ fontSize: 8, fontWeight: focused ? "700" : "500", opacity: focused ? 1 : 0.5 }}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { th } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: th.card, borderTopColor: th.cardBorder, paddingBottom: 8, height: 60 },
        tabBarShowLabel: false,
        tabBarActiveTintColor: th.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📚" label="Fêrbûn" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🎮" label="Lîstik" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profîl" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
