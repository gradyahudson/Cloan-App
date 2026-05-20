import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useLoansStore } from "@/lib/store/loans";
import { formatCents, calculateRoundup } from "@/lib/utils/currency";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const DEMO_TRANSACTIONS = [
  { merchant: "Blue Bottle Coffee", amount: 647, category: "☕" },
  { merchant: "Trader Joe's", amount: 2384, category: "🛒" },
  { merchant: "Lyft", amount: 1223, category: "🚗" },
  { merchant: "Chipotle", amount: 1175, category: "🌯" },
  { merchant: "Amazon", amount: 3399, category: "📦" },
  { merchant: "Spotify", amount: 999, category: "🎵" },
  { merchant: "CVS", amount: 843, category: "💊" },
  { merchant: "Shell", amount: 5271, category: "⛽" },
];

export default function RoundupsScreen() {
  const {
    roundups,
    roundupsEnabled,
    setRoundupsEnabled,
    accumulatedCents,
    addRoundup,
    loans,
    strategy,
    addPayment,
  } = useLoansStore();

  const pendingRoundups = roundups.filter((r) => r.status === "pending");
  const totalPending = pendingRoundups.reduce((sum, r) => sum + r.roundupCents, 0);

  const snowballTarget = [...loans]
    .filter((l) => l.status === "active")
    .sort((a, b) =>
      strategy === "snowball"
        ? a.balanceCents - b.balanceCents
        : b.interestRateBps - a.interestRateBps
    )[0];

  const handleSimulateRoundup = () => {
    const tx = DEMO_TRANSACTIONS[Math.floor(Math.random() * DEMO_TRANSACTIONS.length)];
    const roundupCents = calculateRoundup(tx.amount);
    if (roundupCents === 0) return;
    addRoundup({
      merchantName: `${tx.category} ${tx.merchant}`,
      originalCents: tx.amount,
      roundupCents,
      date: new Date().toLocaleDateString(),
      status: "pending",
    });
  };

  const handleApplyPayment = () => {
    if (!snowballTarget) {
      Alert.alert("No active loans", "Add a loan first to apply your round-ups.");
      return;
    }
    Alert.alert(
      `Apply ${formatCents(accumulatedCents)}?`,
      `This will apply your accumulated round-ups toward "${snowballTarget.name}" (${snowballTarget.servicer}).`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Apply payment",
          onPress: () => {
            addPayment(snowballTarget.id, {
              amountCents: accumulatedCents,
              date: new Date().toISOString(),
              isCloanPayment: true,
              note: "Round-up accumulation payment",
            });
            Alert.alert(
              "Payment queued! 🌱",
              `${formatCents(accumulatedCents)} will be applied to ${snowballTarget.name}. Follow your servicer's instructions to confirm principal-only payment.`
            );
          },
        },
      ]
    );
  };

  const thresholdCents = 500;
  const thresholdPercent = Math.min(accumulatedCents / thresholdCents, 1);

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-brand-900">Round-ups</Text>
          <Text className="text-brand-600 mt-1">
            Spare change from every purchase, stacking toward your loans.
          </Text>
        </View>

        <View className="px-6 mt-5 gap-y-4 pb-8">
          {/* Master toggle */}
          <Card variant="elevated">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="font-bold text-brand-900">Round-ups enabled</Text>
                <Text className="text-sm text-brand-600 mt-0.5">
                  Automatically round purchases to the nearest dollar
                </Text>
              </View>
              <Switch
                value={roundupsEnabled}
                onValueChange={setRoundupsEnabled}
                trackColor={{ false: "#FDE68A", true: "#FBBF24" }}
                thumbColor={roundupsEnabled ? "#78350F" : "#D97706"}
              />
            </View>
          </Card>

          {/* Accumulator */}
          <View className="bg-brand-900 rounded-3xl p-5">
            <Text className="text-brand-400 text-sm font-medium mb-1">Accumulated</Text>
            <Text className="text-white text-5xl font-bold">{formatCents(accumulatedCents)}</Text>
            <View className="mt-4 mb-2">
              <View className="h-2.5 bg-brand-700 rounded-full overflow-hidden">
                <View
                  className="h-full bg-brand-400 rounded-full"
                  style={{ width: `${thresholdPercent * 100}%` }}
                />
              </View>
              <View className="flex-row justify-between mt-1.5">
                <Text className="text-brand-500 text-xs">$0</Text>
                <Text className="text-brand-400 text-xs font-medium">
                  {formatCents(Math.max(thresholdCents - accumulatedCents, 0))} until sweep
                </Text>
                <Text className="text-brand-500 text-xs">$5.00</Text>
              </View>
            </View>

            {snowballTarget && (
              <View className="mt-3 pt-3 border-t border-brand-700">
                <Text className="text-brand-400 text-xs mb-1">Next target</Text>
                <Text className="text-white font-semibold">{snowballTarget.name}</Text>
                <Text className="text-brand-400 text-sm">{snowballTarget.servicer}</Text>
              </View>
            )}

            {accumulatedCents >= thresholdCents && (
              <TouchableOpacity
                onPress={handleApplyPayment}
                className="mt-4 bg-brand-400 rounded-2xl py-3 items-center"
              >
                <Text className="font-bold text-brand-900">Apply {formatCents(accumulatedCents)} now →</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* How it works */}
          <Card variant="highlight">
            <Text className="font-semibold text-brand-900 mb-2">How it works</Text>
            <View className="gap-y-2">
              {[
                { icon: "☕", text: 'You spend $3.47 at a café → Cloan rounds up to $4.00 → $0.53 saved' },
                { icon: "🛒", text: 'You spend $23.84 at the grocery store → $0.16 saved' },
                { icon: "🪙", text: 'Spare change accumulates until it hits $5.00' },
                { icon: "🌱", text: 'Cloan sweeps the funds and applies them to your target loan' },
              ].map((item, i) => (
                <View key={i} className="flex-row items-start gap-x-2">
                  <Text className="text-base">{item.icon}</Text>
                  <Text className="text-sm text-brand-700 flex-1 leading-relaxed">{item.text}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Demo button */}
          <TouchableOpacity
            onPress={handleSimulateRoundup}
            className="bg-brand-200 rounded-2xl py-3 items-center border border-brand-300"
          >
            <Text className="font-semibold text-brand-800">Simulate a round-up (demo)</Text>
          </TouchableOpacity>

          {/* Transaction history */}
          {roundups.length > 0 && (
            <Card variant="default">
              <Text className="font-semibold text-brand-900 mb-3">
                Transaction history ({roundups.length})
              </Text>
              {roundups.slice(0, 15).map((r, i) => (
                <View
                  key={r.id}
                  className={`flex-row justify-between items-center py-3 ${
                    i < roundups.slice(0, 15).length - 1 ? "border-b border-brand-100" : ""
                  }`}
                >
                  <View className="flex-row items-center gap-x-3 flex-1">
                    <View className="w-9 h-9 rounded-full bg-brand-100 items-center justify-center">
                      <Text className="text-sm">🪙</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-brand-900" numberOfLines={1}>
                        {r.merchantName}
                      </Text>
                      <Text className="text-xs text-brand-500">
                        {formatCents(r.originalCents)} → rounded up
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-brand-600">
                      +{formatCents(r.roundupCents)}
                    </Text>
                    <View
                      className={`mt-0.5 rounded-md px-1.5 py-0.5 ${
                        r.status === "applied"
                          ? "bg-green-100"
                          : r.status === "batched"
                          ? "bg-brand-200"
                          : "bg-brand-100"
                      }`}
                    >
                      <Text className="text-xs text-brand-700 font-medium capitalize">
                        {r.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          )}

          {roundups.length === 0 && (
            <Card variant="highlight">
              <Text className="text-center font-semibold text-brand-800 mb-1">No round-ups yet</Text>
              <Text className="text-center text-sm text-brand-600">
                Link your bank account to start automatically capturing round-ups, or tap "Simulate" above to see how it works.
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
