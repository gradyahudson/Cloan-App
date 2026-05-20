import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo } from "react";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { projectPayoff } from "@/lib/utils/snowball";
import { formatCents, formatCentsCompact } from "@/lib/utils/currency";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { addMonths, format } from "date-fns";

const PRESET_EXTRAS = [
  { label: "$5/mo", cents: 500 },
  { label: "$10/mo", cents: 1000 },
  { label: "$25/mo", cents: 2500 },
  { label: "$50/mo", cents: 5000 },
  { label: "$100/mo", cents: 10000 },
];

export default function PayoffCompareScreen() {
  const router = useRouter();
  const { loans, strategy, setExtraMonthly, extraMonthlyCents } = useOnboardingStore();
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customCents, setCustomCents] = useState(extraMonthlyCents);

  const projection = useMemo(() => {
    const mappedLoans = loans.map((l) => ({
      id: l.id,
      name: l.name,
      balanceCents: l.balanceCents,
      interestRateBps: l.interestRateBps,
      minimumPaymentCents: l.minimumPaymentCents,
    }));

    if (mappedLoans.length === 0) {
      return null;
    }

    return projectPayoff(mappedLoans, strategy, customCents);
  }, [loans, strategy, customCents]);

  const handlePreset = (cents: number, idx: number) => {
    setSelectedPreset(idx);
    setCustomCents(cents);
    setExtraMonthly(cents);
  };

  const totalBalance = loans.reduce((sum, l) => sum + l.balanceCents, 0);

  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths}mo`;
    if (remainingMonths === 0) return `${years}yr`;
    return `${years}yr ${remainingMonths}mo`;
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      {/* Progress bar */}
      <View className="flex-row px-6 pt-4 gap-x-2">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            className={`flex-1 h-1.5 rounded-full ${i <= 2 ? "bg-brand-400" : "bg-brand-200"}`}
          />
        ))}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-brand-900">See your payoff</Text>
          <Text className="text-brand-600 mt-1 leading-relaxed">
            Here's what your loan payoff looks like — and how much faster Cloan can get you there.
          </Text>

          {loans.length === 0 ? (
            <Card variant="highlight" className="mt-5">
              <Text className="text-brand-700 text-center py-4">
                Add loans on the previous step to see your projection.
              </Text>
            </Card>
          ) : (
            <>
              {/* Current situation */}
              {projection && (
                <View className="mt-5 gap-y-3">
                  {/* Without Cloan */}
                  <Card variant="default">
                    <View className="flex-row items-center gap-x-2 mb-3">
                      <View className="w-3 h-3 rounded-full bg-stone-300" />
                      <Text className="text-sm font-semibold text-stone-500 uppercase tracking-wide">
                        Minimum payments only
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <View>
                        <Text className="text-3xl font-bold text-stone-600">
                          {formatMonths(projection.monthsWithout)}
                        </Text>
                        <Text className="text-sm text-stone-400 mt-0.5">to pay off</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-lg font-bold text-stone-500">
                          {format(projection.payoffDateWithout, "MMM yyyy")}
                        </Text>
                        <Text className="text-sm text-stone-400 mt-0.5">payoff date</Text>
                      </View>
                    </View>
                  </Card>

                  {/* With Cloan */}
                  <Card variant="highlight">
                    <View className="flex-row items-center gap-x-2 mb-3">
                      <View className="w-3 h-3 rounded-full bg-brand-400" />
                      <Text className="text-sm font-semibold text-brand-600 uppercase tracking-wide">
                        With Cloan
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <View>
                        <Text className="text-3xl font-bold text-brand-900">
                          {formatMonths(projection.monthsWith)}
                        </Text>
                        <Text className="text-sm text-brand-600 mt-0.5">to pay off</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-lg font-bold text-brand-700">
                          {format(projection.payoffDateWith, "MMM yyyy")}
                        </Text>
                        <Text className="text-sm text-brand-600 mt-0.5">payoff date</Text>
                      </View>
                    </View>

                    {customCents > 0 && projection.monthsSaved > 0 && (
                      <View className="mt-3 pt-3 border-t border-brand-200 flex-row gap-x-4">
                        <View className="flex-1 bg-brand-400 rounded-xl p-3">
                          <Text className="text-xs text-brand-800 font-medium">Time saved</Text>
                          <Text className="text-lg font-bold text-brand-900 mt-0.5">
                            {formatMonths(projection.monthsSaved)}
                          </Text>
                        </View>
                        <View className="flex-1 bg-brand-400 rounded-xl p-3">
                          <Text className="text-xs text-brand-800 font-medium">Interest saved</Text>
                          <Text className="text-lg font-bold text-brand-900 mt-0.5">
                            {formatCentsCompact(projection.interestSavedCents)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </Card>

                  {/* Extra payment slider */}
                  <View className="bg-white rounded-2xl p-4 border border-brand-100">
                    <Text className="font-semibold text-brand-900 mb-1">
                      How much extra per month?
                    </Text>
                    <Text className="text-sm text-brand-600 mb-3">
                      Round-ups typically generate $20–60/month. You can also set a fixed deposit.
                    </Text>

                    <View className="flex-row flex-wrap gap-2">
                      {PRESET_EXTRAS.map((preset, idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => handlePreset(preset.cents, idx)}
                          className={`px-4 py-2 rounded-xl border ${
                            selectedPreset === idx
                              ? "bg-brand-400 border-brand-400"
                              : "bg-brand-50 border-brand-200"
                          }`}
                        >
                          <Text
                            className={`text-sm font-semibold ${
                              selectedPreset === idx ? "text-brand-900" : "text-brand-600"
                            }`}
                          >
                            {preset.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {customCents === 0 && (
                      <Text className="text-xs text-brand-500 mt-3 text-center">
                        Select an amount above to see your personalized projection
                      </Text>
                    )}
                  </View>

                  {/* Loan breakdown */}
                  <View className="bg-white rounded-2xl p-4 border border-brand-100">
                    <Text className="font-semibold text-brand-900 mb-3">Your loans</Text>
                    {[...loans]
                      .sort((a, b) => a.balanceCents - b.balanceCents)
                      .map((loan, idx) => (
                        <View
                          key={loan.id}
                          className={`py-3 ${idx < loans.length - 1 ? "border-b border-brand-100" : ""}`}
                        >
                          <View className="flex-row justify-between items-start">
                            <View className="flex-row items-center gap-x-2 flex-1">
                              {idx === 0 && (
                                <View className="bg-brand-400 rounded-lg px-2 py-0.5">
                                  <Text className="text-xs font-bold text-brand-900">NEXT TARGET</Text>
                                </View>
                              )}
                              <Text className="font-medium text-brand-900 flex-1" numberOfLines={1}>
                                {loan.name}
                              </Text>
                            </View>
                            <Text className="font-bold text-brand-900 ml-2">
                              {formatCents(loan.balanceCents)}
                            </Text>
                          </View>
                          <Text className="text-sm text-brand-500 mt-0.5">
                            {(loan.interestRateBps / 100).toFixed(2)}% • Min {formatCents(loan.minimumPaymentCents)}/mo
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              )}
            </>
          )}

          <View className="h-10" />
        </View>
      </ScrollView>

      <View className="px-6 pb-6 pt-3 bg-brand-50 border-t border-brand-100">
        <Button
          label="Choose my strategy →"
          onPress={() => router.push("/(onboarding)/strategy")}
          variant="primary"
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}
