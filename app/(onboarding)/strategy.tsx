import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { useLoansStore } from "@/lib/store/loans";
import { Button } from "@/components/ui/Button";
import type { Strategy } from "@/lib/utils/snowball";

const strategies: {
  value: Strategy;
  emoji: string;
  name: string;
  tagline: string;
  description: string;
  bestFor: string;
  daveSays?: boolean;
}[] = [
  {
    value: "snowball",
    emoji: "❄️",
    name: "Snowball",
    tagline: "Pay smallest loan first",
    description:
      "Attack your smallest balance first. When it's gone, roll that payment into the next. The wins come fast and keep you motivated.",
    bestFor: "People who need momentum and motivation wins",
    daveSays: true,
  },
  {
    value: "avalanche",
    emoji: "🏔️",
    name: "Avalanche",
    tagline: "Kill the highest rate first",
    description:
      "Target the loan with the highest interest rate first. Mathematically optimal — you'll pay less interest over time.",
    bestFor: "People who want to minimize total interest paid",
  },
  {
    value: "proportional",
    emoji: "⚖️",
    name: "Proportional",
    tagline: "Distribute across all loans",
    description:
      "Extra payments are split across all loans proportionally. Every loan shrinks a little each month.",
    bestFor: "People who like seeing all loans go down together",
  },
];

export default function StrategyScreen() {
  const router = useRouter();
  const { strategy, setStrategy, loans, completeOnboarding } = useOnboardingStore();
  const loansStore = useLoansStore();

  const handleFinish = () => {
    // Sync onboarding loans into the main store
    for (const loan of loans) {
      loansStore.addLoan({
        name: loan.name,
        servicer: loan.servicer,
        loanType: loan.loanType as any,
        balanceCents: loan.balanceCents,
        originalBalanceCents: loan.balanceCents,
        interestRateBps: loan.interestRateBps,
        minimumPaymentCents: loan.minimumPaymentCents,
        status: "active",
      });
    }
    loansStore.setStrategy(strategy);
    completeOnboarding();
    router.replace("/(app)");
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      {/* Progress bar */}
      <View className="flex-row px-6 pt-4 gap-x-2">
        {[0, 1, 2, 3].map((i) => (
          <View key={i} className="flex-1 h-1.5 rounded-full bg-brand-400" />
        ))}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-brand-900">Pick your strategy</Text>
          <Text className="text-brand-600 mt-1 leading-relaxed">
            This determines the order Cloan targets your loans. You can change this anytime.
          </Text>

          <View className="mt-5 gap-y-3">
            {strategies.map((s) => (
              <TouchableOpacity
                key={s.value}
                onPress={() => setStrategy(s.value)}
                activeOpacity={0.8}
              >
                <View
                  className={`rounded-2xl p-4 border-2 ${
                    strategy === s.value
                      ? "border-brand-400 bg-brand-50"
                      : "border-transparent bg-white"
                  }`}
                >
                  <View className="flex-row items-start gap-x-3">
                    <View className="w-12 h-12 rounded-2xl bg-brand-100 items-center justify-center">
                      <Text className="text-2xl">{s.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-x-2">
                        <Text className="font-bold text-brand-900 text-lg">{s.name}</Text>
                        {s.daveSays && (
                          <View className="bg-brand-300 rounded-lg px-2 py-0.5">
                            <Text className="text-xs font-bold text-brand-900">DAVE RAMSEY</Text>
                          </View>
                        )}
                        {strategy === s.value && (
                          <View className="ml-auto bg-brand-400 rounded-full w-6 h-6 items-center justify-center">
                            <Text className="text-brand-900 text-sm font-bold">✓</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-brand-600 text-sm font-medium mt-0.5">{s.tagline}</Text>
                      <Text className="text-brand-700 text-sm mt-2 leading-relaxed">
                        {s.description}
                      </Text>
                      <View className="mt-2 bg-brand-100 rounded-lg px-3 py-1.5">
                        <Text className="text-xs text-brand-700">
                          <Text className="font-semibold">Best for: </Text>
                          {s.bestFor}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Encouragement */}
          <View className="mt-5 bg-brand-400 rounded-2xl p-4">
            <Text className="text-brand-900 font-semibold mb-1">💡 Good to know</Text>
            <Text className="text-brand-800 text-sm leading-relaxed">
              The best strategy is the one you stick with. Snowball wins for most people because
              the quick wins keep you going. Paying off even one loan is a big deal.
            </Text>
          </View>

          <View className="h-10" />
        </View>
      </ScrollView>

      <View className="px-6 pb-6 pt-3 bg-brand-50 border-t border-brand-100 gap-y-2">
        <Button
          label="Start cloning payments 🌱"
          onPress={handleFinish}
          variant="primary"
          size="lg"
        />
        <Text className="text-center text-xs text-brand-500">
          You can adjust everything in settings later.
        </Text>
      </View>
    </SafeAreaView>
  );
}
