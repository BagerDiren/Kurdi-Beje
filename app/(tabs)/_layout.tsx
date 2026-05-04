import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useApp } from "@/data/app-context";
import { KIDS_THEME, TYPO } from "@/components/kids/design";

function TabIcon({ icon, label, focused, isKid }: { icon: string; label: string; focused: boolean; isKid: boolean }) {
  return (
    <View style={{ alignItems: "center", gap: 2, paddingTop: 8, minWidth: 60 }}>
      {focused && isKid && (
        <View
          style={{
            position: "absolute",
            top: 0,
            width: 32,
            height: 4,
            borderRadius: 2,
            backgroundColor: KIDS_THEME.primary,
          }}
        />
      )}
      <Text
        style={{
          fontSize: 24,
          opacity: focused ? 1 : 0.45,
        }}
      >
        {icon}
      </Text>
      <Text
        style={{
          ...(isKid ? TYPO.micro : { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 }),
          color: focused ? (isKid ? KIDS_THEME.primary : "#1F6B41") : "#999",
          marginTop: 1,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { age } = useApp();
  const isKid = age === "child";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isKid ? "#FFFFFF" : "#1E4D32",
          borderTopColor: isKid ? "#0000000A" : "#2E7D46",
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 4,
          height: 76,
          ...(isKid && {
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: -4 },
            elevation: 12,
          }),
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📚" label={isKid ? "Öğren" : "ÖĞREN"} focused={focused} isKid={isKid} />
          ),
        }}
      />
      {/* Çocuk için: Çizgi Film · Yetişkin için: gizli */}
      <Tabs.Screen
        name="cartoons"
        options={{
          href: isKid ? "/cartoons" : null,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📺" label={isKid ? "Çizgi" : "ÇİZGİ"} focused={focused} isKid={isKid} />
          ),
        }}
      />
      {/* Yetişkin için: Pratik · Çocuk için: gizli */}
      <Tabs.Screen
        name="practice"
        options={{
          href: isKid ? null : "/practice",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🎯" label={isKid ? "Pratik" : "PRATİK"} focused={focused} isKid={isKid} />
          ),
        }}
      />
      <Tabs.Screen
        name="league"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏆" label={isKid ? "Lig" : "LİG"} focused={focused} isKid={isKid} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label={isKid ? "Profil" : "PROFİL"} focused={focused} isKid={isKid} />
          ),
        }}
      />
      {/* Eski games tab'i kaldırıldı */}
      <Tabs.Screen name="games" options={{ href: null }} />
    </Tabs>
  );
}
