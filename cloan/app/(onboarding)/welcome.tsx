import { View, Text, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

const features = [
  {
    icon: "🪙",
    title: "Round-up every purchase",
    description: "Spare change from your daily coffee goes straight to your loans.",
  },
  {
    icon: "❄️",
    title: "Snowball your debt",
    description: "Pay off the smallest loan first, then roll that payment to the next.",
  },
  {
    icon: "🏆",
    title: "Celebrate every win",
    description: "Milestones, streaks, and badges make paying off debt genuinely fun.",
  },
  {
    icon: "📚",
    title: "Learn as you go",
    description: "Understand your loans, rates, and options — no jargon.",
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(20);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    logoY.value = withDelay(200, withSpring(0, { damping: 15 }));
    contentOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={logoStyle} className="items-center pt-16 pb-8 px-6">
          <View className="w-20 h-20 rounded-3xl bg-brand-400 items-center justify-center mb-4 shadow-md">
            <Text className="text-4xl">🌱</Text>
          </View>
          <Text className="text-4xl font-bold text-brand-900 tracking-tight">Cloan</Text>
          <Text className="text-brand-600 text-center mt-2 text-base leading-relaxed">
            Clone your loan payments.{"\n"}Get out of debt faster.
          </Text>
        </Animated.View>

        {/* Feature list */}
        <Animated.View style={contentStyle} className="px-6 pb-6">
          <View className="bg-white rounded-3xl p-5 gap-y-5 border border-brand-100">
            {features.map((feature, i) => (
              <View key={i} className="flex-row items-start gap-x-4">
                <View className="w-11 h-11 rounded-2xl bg-brand-100 items-center justify-center">
                  <Text className="text-xl">{feature.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-brand-900 text-base">
                    {feature.title}
                  </Text>
                  <Text className="text-brand-600 text-sm mt-0.5 leading-relaxed">
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Social proof */}
          <View className="mt-5 bg-brand-400 rounded-2xl p-4 flex-row items-center gap-x-3">
            <Text className="text-2xl">📊</Text>
            <Text className="flex-1 text-brand-900 text-sm font-medium leading-relaxed">
              Users who add $50/month in extra payments pay off their loans{" "}
              <Text className="font-bold">3–5 years sooner</Text>.
            </Text>
          </View>
        </Animated.View>

        {/* CTAs */}
        <Animated.View style={contentStyle} className="px-6 pb-10 gap-y-3">
          <Button
            label="Get started — it's free"
            onPress={() => router.push("/(onboarding)/link-loans")}
            variant="primary"
            size="lg"
          />
          <Button
            label="I already have an account"
            onPress={() => router.push("/(onboarding)/link-loans")}
            variant="ghost"
            size="md"
          />
          <Text className="text-center text-xs text-brand-500 mt-2 leading-relaxed">
            No credit card required. Your data is encrypted and never sold.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
