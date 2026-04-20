import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useLoansStore } from "@/lib/store/loans";
import { projectPayoff } from "@/lib/utils/snowball";
import { formatCents, formatCentsCompact } from "@/lib/utils/currency";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { format, addMonths } from "date-fns";

export default function DashboardScreen() {
  const router = useRouter();
  const { loans, roundups, accumulatedCents, strategy, streakDays, earnedMilestoneIds } =
    useLoansStore();

  const activeLoans = loans.filter((l) => l.status === "active");
  const totalBalance = activeLoans.reduce((sum, l) => sum + l.balanceCents, 0);
  const totalOriginal = activeLoans.reduce((sum, l) => sum + l.originalBalanceCents, 0);
  const totalPaid = totalOriginal - totalBalance;
  const paidPercent = totalOriginal > 0 ? totalPaid / totalOriginal : 0;
  const paidOffCount = loans.filter((l) => l.status === "paid_off").length;

  const pendingRoundups = roundups.filter((r) => r.status === "pending");
  const pendingRoundupTotal = pendingRoundups.reduce((sum, r) => sum + r.roundupCents, 0);

  const projection = useMemo(() => {
    if (activeLoans.length === 0) return null;
    return projectPayoff(
      activeLoans.map((l) => ({
        id: l.id,
        name: l.name,
        balanceCents: l.balanceCents,
        interestRateBps: l.interestRateBps,
        minimumPaymentCents: l.minimumPaymentCents,
      })),
      strategy,
      accumulatedCents > 0 ? Math.round(accumulatedCents / 3) : 3000
    );
  }, [activeLoans, strategy, accumulatedCents]);

  const snowballTarget = activeLoans.sort((a, b) =>
    strategy === "snowball"
      ? a.balanceCents - b.balanceCents
      : b.interestRateBps - a.interestRateBps
  )[0];

  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12);
    const mo = months % 12;
    if (years === 0) return `${mo} months`;
    if (mo === 0) return `${years} years`;
    return `${years}y ${mo}mo`;
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-2 flex-row justify-between items-start">
          <View>
            <Text className="text-brand-600 text-sm font-medium">Welcome back 👋</Text>
            <Text className="text-2xl font-bold text-brand-900 mt-0.5">Your Cloan</Text>
          </View>
          {streakDays > 0 && (
            <View className="bg-brand-400 rounded-2xl px-3 py-2 flex-row items-center gap-x-1.5">
              <Text className="text-lg">🔥</Text>
              <Text className="font-bold text-brand-900">{streakDays}</Text>
              <Text className="text-xs text-brand-800">day streak</Text>
            </View>
          )}
        </View>

        <View className="px-6 gap-y-4 pb-8">
          {/* Total debt overview */}
          <View className="bg-brand-900 rounded-3xl p-5">
            <Text className="text-brand-300 text-sm font-medium">Total remaining</Text>
            <Text className="text-white text-4xl font-bold mt-1">
              {formatCents(totalBalance)}
            </Text>
            <View className="mt-4">
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-brand-400 text-xs">
                  {formatCents(totalPaid)} paid
                </Text>
                <Text className="text-brand-400 text-xs">
                  {Math.round(paidPercent * 100)}% complete
                </Text>
              </View>
              <View className="h-2 bg-brand-700 rounded-full overflow-hidden">
                <View
                  className="h-full bg-brand-400 rounded-full"
                  style={{ width: `${Math.max(paidPercent * 100, 2)}%` }}
                />
              </View>
            </View>
            {projection && (
              <View className="mt-4 pt-4 border-t border-brand-700 flex-row justify-between">
                <View>
                  <Text className="text-brand-400 text-xs">Payoff with Cloan</Text>
                  <Text className="text-white font-semibold mt-0.5">
                    {format(projection.payoffDateWith, "MMM yyyy")}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-brand-400 text-xs">Time saved</Text>
                  <Text className="text-brand-300 font-semibold mt-0.5">
                    {formatMonths(projection.monthsSaved)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Snowball target */}
          {snowballTarget && (
            <TouchableOpacity onPress={() => router.push("/loans")} activeOpacity={0.8}>
              <Card variant="elevated">
                <View className="flex-row items-center gap-x-2 mb-3">
                  <Text className="text-base">❄️</Text>
                  <Text className="text-sm font-semibold text-brand-700 uppercase tracking-wide">
                    {strategy === "snowball" ? "Snowball" : strategy === "avalanche" ? "Avalanche" : "Primary"} target
                  </Text>
                  <View className="ml-auto bg-brand-400 rounded-lg px-2 py-0.5">
                    <Text className="text-xs font-bold text-brand-900">ACTIVE</Text>
                  </View>
                </View>
                <Text className="font-bold text-brand-900 text-lg">{snowballTarget.name}</Text>
                <Text className="text-brand-600 text-sm">{snowballTarget.servicer}</Text>
                <View className="mt-3">
                  <ProgressBar
                    progress={
                      1 -
                      snowballTarget.balanceCents / snowballTarget.originalBalanceCents
                    }
                    showPercent
                    label={formatCents(snowballTarget.balanceCents) + " remaining"}
                  />
                </View>
              </Card>
            </TouchableOpacity>
          )}

          {/* Round-ups accumulator */}
          <TouchableOpacity onPress={() => router.push("/roundups")} activeOpacity={0.8}>
            <Card variant="highlight">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-sm font-semibold text-brand-700 mb-1">
                    🪙 Accumulated round-ups
                  </Text>
                  <Text className="text-3xl font-bold text-brand-900">
                    {formatCents(accumulatedCents)}
                  </Text>
                  <Text className="text-sm text-brand-600 mt-1">
                    {pendingRoundups.length} pending transactions
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-brand-600 mb-1">Threshold</Text>
                  <Text className="text-sm font-bold text-brand-800">$5.00</Text>
                  <View className="mt-2 bg-brand-400 rounded-xl px-3 py-1.5">
                    <Text className="text-xs font-bold text-brand-900">Apply →</Text>
                  </View>
                </View>
              </View>
              {accumulatedCents > 0 && (
                <View className="mt-3">
                  <ProgressBar
                    progress={Math.min(accumulatedCents / 500, 1)}
                    height={6}
                  />
                  <Text className="text-xs text-brand-600 mt-1">
                    {formatCents(Math.max(500 - accumulatedCents, 0))} until next payment sweep
                  </Text>
                </View>
              )}
            </Card>
          </TouchableOpacity>

          {/* Stats row */}
          <View className="flex-row gap-x-3">
            <Card variant="default" className="flex-1">
              <Text className="text-2xl font-bold text-brand-900">{activeLoans.length}</Text>
              <Text className="text-xs text-brand-600 mt-0.5">Active loans</Text>
            </Card>
            <Card variant="default" className="flex-1">
              <Text className="text-2xl font-bold text-brand-400">{paidOffCount}</Text>
              <Text className="text-xs text-brand-600 mt-0.5">Paid off 🎉</Text>
            </Card>
            <Card variant="default" className="flex-1">
              <Text className="text-2xl font-bold text-brand-900">
                {earnedMilestoneIds.length}
              </Text>
              <Text className="text-xs text-brand-600 mt-0.5">Badges</Text>
            </Card>
          </View>

          {/* Recent round-ups */}
          {roundups.length > 0 && (
            <Card variant="default">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-semibold text-brand-900">Recent round-ups</Text>
                <TouchableOpacity onPress={() => router.push("/roundups")}>
                  <Text className="text-sm text-brand-600">See all</Text>
                </TouchableOpacity>
              </View>
              {roundups.slice(0, 4).map((r, i) => (
                <View
                  key={r.id}
                  className={`flex-row justify-between items-center py-2.5 ${
                    i < Math.min(roundups.length, 4) - 1 ? "border-b border-brand-100" : ""
                  }`}
                >
                  <View className="flex-row items-center gap-x-3">
                    <View className="w-8 h-8 rounded-full bg-brand-100 items-center justify-center">
                      <Text className="text-sm">🪙</Text>
                    </View>
                    <View>
                      <Text className="text-sm font-medium text-brand-900">
                        {r.merchantName}
                      </Text>
                      <Text className="text-xs text-brand-500">{r.date}</Text>
                    </View>
                  </View>
                  <Text className="text-sm font-semibold text-brand-600">
                    +{formatCents(r.roundupCents)}
                  </Text>
                </View>
              ))}
            </Card>
          )}

          {/* Empty state */}
          {activeLoans.length === 0 && (
            <Card variant="highlight">
              <Text className="text-center text-brand-700 font-semibold mb-2">
                No loans added yet
              </Text>
              <Text className="text-center text-brand-600 text-sm">
                Head to the Loans tab to add your first loan and start your snowball.
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
