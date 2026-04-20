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
        name="loans"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" label="Loans" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="roundups"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🪙" label="Round-ups" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="milestones"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏆" label="Wins" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📚" label="Learn" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
