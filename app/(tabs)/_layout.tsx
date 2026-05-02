import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useApp } from "@/data/app-context";

function TabIcon({ icon, label, focused, color }: { icon: string; label: string; focused: boolean; color: string }) {
  return (
    <View style={{ alignItems: "center", gap: 2, paddingTop: 6 }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{icon}</Text>
      <Text
        style={{
          fontSize: 9,
          fontWeight: focused ? "800" : "600",
          opacity: focused ? 1 : 0.55,
          color: focused ? color : undefined,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { th } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: th.card,
          borderTopColor: th.cardBorder,
          paddingBottom: 6,
          paddingTop: 4,
          height: 70,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: th.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📚" label="Öğren" focused={focused} color={th.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🎮" label="Oyunlar" focused={focused} color={th.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="league"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏆" label="Liderlik" focused={focused} color={th.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Profil" focused={focused} color={th.primary} />
          ),
        }}
      />
    </Tabs>
  );
}
