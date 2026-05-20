import { Tabs } from "expo-router";
import { View, Text } from "react-native";

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

function TabIcon({ emoji, label, focused }: TabIconProps) {
  return (
    <View className="items-center justify-center pt-1">
      <Text style={{ fontSize: focused ? 22 : 20 }}>{emoji}</Text>
      <Text
        className={`text-xs mt-0.5 font-medium ${
          focused ? "text-brand-600" : "text-stone-400"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFBEB",
          borderTopColor: "#FDE68A",
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 70,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="money"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💰" label="Money" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🧠" label="Coach" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👥" label="Community" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🌱" label="You" focused={focused} />
          ),
        }}
      />
      {/* Hidden legacy screens */}
      <Tabs.Screen name="loans" options={{ href: null }} />
      <Tabs.Screen name="roundups" options={{ href: null }} />
      <Tabs.Screen name="milestones" options={{ href: null }} />
      <Tabs.Screen name="learn" options={{ href: null }} />
    </Tabs>
  );
}
