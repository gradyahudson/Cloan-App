import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useLoansStore } from "@/lib/store/loans";
import { useSavingsStore } from "@/lib/store/savings";
import { useXPStore } from "@/lib/store/xp";
import { formatCents } from "@/lib/utils/currency";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";

type MoneyTab = "loans" | "roundups" | "savings" | "networth";

function LoansContent() {
  const { loans, strategy, setStrategy } = useLoansStore();
  const activeLoans = loans.filter((l) => l.status === "active");
  const paidOffLoans = loans.filter((l) => l.status === "paid_off");

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="px-6 py-4 gap-y-4 pb-24">
        {/* Strategy picker */}
        <View className="bg-brand-900 rounded-2xl p-4">
          <Text className="text-brand-300 text-xs font-medium mb-3">Payoff strategy</Text>
          <View className="flex-row gap-x-2">
            {(["snowball", "avalanche", "proportional"] as const).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setStrategy(s)}
                className={`flex-1 rounded-xl py-2 items-center ${
                  strategy === s ? "bg-brand-400" : "bg-brand-800"
                }`}
              >
                <Text className={`text-xs font-bold ${strategy === s ? "text-brand-900" : "text-brand-400"}`}>
                  {s === "snowball" ? "❄️ Snowball" : s === "avalanche" ? "🌊 Avalanche" : "⚖️ Balanced"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text className="text-brand-500 text-xs mt-2">
            {strategy === "snowball"
              ? "Pay smallest balance first — fastest motivation wins."
              : strategy === "avalanche"
              ? "Pay highest rate first — saves the most interest."
              : "Split extra payments proportionally across all loans."}
          </Text>
        </View>

        {activeLoans.length === 0 ? (
          <Card variant="highlight">
            <Text className="text-center text-brand-700 font-semibold mb-1">No active loans</Text>
            <Text className="text-center text-brand-600 text-sm">Head to the Loans tab to add your first loan.</Text>
          </Card>
        ) : (
          activeLoans.map((loan, i) => (
            <Card key={loan.id} variant={i === 0 ? "elevated" : "default"}>
              {i === 0 && (
                <View className="flex-row items-center gap-x-1.5 mb-2">
                  <Text className="text-xs">🎯</Text>
                  <Text className="text-xs font-bold text-brand-600 uppercase tracking-wide">Priority target</Text>
                </View>
              )}
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-bold text-brand-900">{loan.name}</Text>
                  <Text className="text-xs text-brand-500">{loan.servicer}</Text>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-brand-900">{formatCents(loan.balanceCents)}</Text>
                  <Text className="text-xs text-brand-500">{(loan.interestRateBps / 100).toFixed(2)}% APR</Text>
                </View>
              </View>
              <View className="mt-3">
                <ProgressBar
                  progress={1 - loan.balanceCents / loan.originalBalanceCents}
                  showPercent
                  label={`${formatCents(loan.minimumPaymentCents)}/mo min`}
                />
              </View>
            </Card>
          ))
        )}

        {paidOffLoans.length > 0 && (
          <View>
            <Text className="text-sm font-semibold text-brand-600 mb-2">🎉 Paid off</Text>
            {paidOffLoans.map((loan) => (
              <Card key={loan.id} variant="default" className="opacity-60 mb-2">
                <View className="flex-row justify-between">
                  <Text className="font-medium text-brand-700 line-through">{loan.name}</Text>
                  <Text className="text-xs text-brand-500">✓ Paid off</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function RoundupsContent() {
  const { roundups, accumulatedCents, loans } = useLoansStore();
  const { addXP } = useXPStore();
  const pendingRoundups = roundups.filter((r) => r.status === "pending");

  const handleApply = () => {
    if (accumulatedCents >= 500) {
      addXP("EXTRA_PAYMENT", `Round-up sweep: ${formatCents(accumulatedCents)}`);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="px-6 py-4 gap-y-4 pb-24">
        {/* Accumulator card */}
        <View className="bg-brand-900 rounded-2xl p-5">
          <Text className="text-brand-300 text-sm">Accumulated round-ups</Text>
          <Text className="text-white text-4xl font-bold mt-1">{formatCents(accumulatedCents)}</Text>
          <View className="mt-3">
            <ProgressBar progress={Math.min(accumulatedCents / 500, 1)} height={6} />
            <Text className="text-brand-400 text-xs mt-1">
              {formatCents(Math.max(500 - accumulatedCents, 0))} until $5.00 payment sweep
            </Text>
          </View>
          {accumulatedCents >= 500 && (
            <TouchableOpacity
              onPress={handleApply}
              className="mt-4 bg-brand-400 rounded-xl py-3 items-center"
            >
              <Text className="font-bold text-brand-900">Apply {formatCents(accumulatedCents)} to loan →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Transaction history */}
        <Text className="font-semibold text-brand-900 text-sm px-1">
          {pendingRoundups.length} pending transactions
        </Text>
        {roundups.length === 0 ? (
          <Card variant="highlight">
            <Text className="text-center text-brand-700 font-medium mb-1">No round-ups yet</Text>
            <Text className="text-center text-brand-600 text-sm">
              Round-ups are collected from your everyday purchases and funneled to your loan.
            </Text>
          </Card>
        ) : (
          <Card variant="default">
            {roundups.slice(0, 20).map((r, i) => (
              <View
                key={r.id}
                className={`flex-row justify-between items-center py-2.5 ${
                  i < Math.min(roundups.length, 20) - 1 ? "border-b border-brand-100" : ""
                }`}
              >
                <View className="flex-row items-center gap-x-3">
                  <View className="w-8 h-8 rounded-full bg-brand-100 items-center justify-center">
                    <Text className="text-sm">🪙</Text>
                  </View>
                  <View>
                    <Text className="text-sm font-medium text-brand-900">{r.merchantName}</Text>
                    <Text className="text-xs text-brand-500">{r.date}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-semibold text-brand-600">+{formatCents(r.roundupCents)}</Text>
                  <Text className="text-xs text-brand-400">{r.status}</Text>
                </View>
              </View>
            ))}
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

function SavingsContent() {
  const { goals, getTotalSaved, roundupSplit, setRoundupSplit } = useSavingsStore();
  const totalSavedCents = getTotalSaved();

  const SPLIT_OPTIONS = [
    { loans: 100, label: "100% loans", sub: "All round-ups to debt" },
    { loans: 75, label: "75% loans", sub: "25% to savings" },
    { loans: 50, label: "50 / 50", sub: "Split evenly" },
    { loans: 25, label: "25% loans", sub: "75% to savings" },
    { loans: 0, label: "100% savings", sub: "All to savings goals" },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="px-6 py-4 gap-y-4 pb-24">
        {/* Total saved */}
        <View className="bg-brand-900 rounded-2xl p-5">
          <Text className="text-brand-300 text-sm">Total saved</Text>
          <Text className="text-white text-4xl font-bold mt-1">{formatCents(totalSavedCents)}</Text>
          <Text className="text-brand-400 text-xs mt-2">{goals.length} active goal{goals.length !== 1 ? "s" : ""}</Text>
        </View>

        {/* Round-up split */}
        <Card variant="elevated">
          <Text className="font-semibold text-brand-900 mb-1">Round-up split</Text>
          <Text className="text-xs text-brand-600 mb-3">Where does your extra change go?</Text>
          <View className="gap-y-2">
            {SPLIT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.loans}
                onPress={() => setRoundupSplit({ loanPercent: opt.loans, savingsPercent: 100 - opt.loans })}
                className={`flex-row items-center justify-between rounded-xl px-4 py-3 border ${
                  roundupSplit.loanPercent === opt.loans
                    ? "bg-brand-400 border-brand-400"
                    : "bg-brand-50 border-brand-200"
                }`}
              >
                <Text className={`font-semibold ${roundupSplit.loanPercent === opt.loans ? "text-brand-900" : "text-brand-700"}`}>
                  {opt.label}
                </Text>
                <Text className="text-xs text-brand-600">{opt.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Goals list */}
        {goals.length === 0 ? (
          <Card variant="highlight">
            <Text className="text-center text-brand-700 font-medium mb-1">No savings goals yet</Text>
            <Text className="text-center text-brand-600 text-sm">
              Create a goal to track your emergency fund, vacation, or any savings target.
            </Text>
          </Card>
        ) : (
          goals.map((goal) => {
            const progress = goal.targetCents > 0 ? goal.currentCents / goal.targetCents : 0;
            const remaining = goal.targetCents - goal.currentCents;
            const monthsLeft = goal.monthlyContributionCents > 0
              ? Math.ceil(remaining / goal.monthlyContributionCents)
              : null;

            return (
              <Card key={goal.id} variant="default">
                <View className="flex-row items-center gap-x-2 mb-2">
                  <Text className="text-xl">{goal.emoji}</Text>
                  <Text className="font-bold text-brand-900 flex-1">{goal.name}</Text>
                  {goal.isEmergencyFund && (
                    <View className="bg-brand-200 rounded-lg px-2 py-0.5">
                      <Text className="text-xs font-bold text-brand-700">Emergency</Text>
                    </View>
                  )}
                </View>
                <ProgressBar
                  progress={progress}
                  showPercent
                  label={`${formatCents(goal.currentCents)} of ${formatCents(goal.targetCents)}`}
                />
                {monthsLeft !== null && monthsLeft > 0 && (
                  <Text className="text-xs text-brand-500 mt-1.5">
                    ~{monthsLeft} month{monthsLeft !== 1 ? "s" : ""} at {formatCents(goal.monthlyContributionCents)}/mo
                  </Text>
                )}
              </Card>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

function NetWorthContent() {
  const { loans } = useLoansStore();
  const { goals, getTotalSaved } = useSavingsStore();
  const totalSavedCents = getTotalSaved();

  const totalDebt = loans
    .filter((l) => l.status === "active")
    .reduce((sum, l) => sum + l.balanceCents, 0);

  const netWorthCents = totalSavedCents - totalDebt;
  const isPositive = netWorthCents >= 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="px-6 py-4 gap-y-4 pb-24">
        {/* Net worth hero */}
        <View className="bg-brand-900 rounded-2xl p-5">
          <Text className="text-brand-300 text-sm">Net worth</Text>
          <Text className={`text-4xl font-bold mt-1 ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {isPositive ? "+" : "-"}{formatCents(Math.abs(netWorthCents))}
          </Text>
          <View className="mt-4 flex-row gap-x-4">
            <View>
              <Text className="text-brand-400 text-xs">Savings</Text>
              <Text className="text-white font-semibold">{formatCents(totalSavedCents)}</Text>
            </View>
            <View>
              <Text className="text-brand-400 text-xs">Debt</Text>
              <Text className="text-red-400 font-semibold">-{formatCents(totalDebt)}</Text>
            </View>
          </View>
        </View>

        {/* Breakdown */}
        <Card variant="elevated">
          <Text className="font-semibold text-brand-900 mb-3">Breakdown</Text>

          {/* Savings */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-2">Savings goals</Text>
            {goals.length === 0 ? (
              <Text className="text-sm text-brand-500">No savings goals — add some in the Savings tab</Text>
            ) : (
              goals.map((g) => (
                <View key={g.id} className="flex-row justify-between items-center py-1.5">
                  <View className="flex-row items-center gap-x-2">
                    <Text className="text-base">{g.emoji}</Text>
                    <Text className="text-sm text-brand-800">{g.name}</Text>
                  </View>
                  <Text className="text-sm font-semibold text-green-600">{formatCents(g.currentCents)}</Text>
                </View>
              ))
            )}
          </View>

          {/* Loans */}
          <View>
            <Text className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-2">Student debt</Text>
            {loans.filter((l) => l.status === "active").length === 0 ? (
              <Text className="text-sm text-brand-500">No active loans — you're debt free! 🎉</Text>
            ) : (
              loans.filter((l) => l.status === "active").map((l) => (
                <View key={l.id} className="flex-row justify-between items-center py-1.5">
                  <Text className="text-sm text-brand-800 flex-1">{l.name}</Text>
                  <Text className="text-sm font-semibold text-red-500">-{formatCents(l.balanceCents)}</Text>
                </View>
              ))
            )}
          </View>
        </Card>

        {/* Encouragement */}
        <Card variant="highlight">
          <Text className="text-brand-800 text-sm leading-relaxed">
            {isPositive
              ? "Your assets exceed your debt — you have a positive net worth! Keep building."
              : "Your net worth is negative right now because of student debt. Every payment chips away at it. You're making progress."}
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const TABS: { key: MoneyTab; label: string; emoji: string }[] = [
  { key: "loans", label: "Loans", emoji: "🎓" },
  { key: "roundups", label: "Round-ups", emoji: "🪙" },
  { key: "savings", label: "Savings", emoji: "🎯" },
  { key: "networth", label: "Net Worth", emoji: "📈" },
];

export default function MoneyScreen() {
  const [activeTab, setActiveTab] = useState<MoneyTab>("loans");

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-brand-900">Money</Text>
      </View>

      {/* Sub-tab bar */}
      <View className="px-4 mb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-x-2 py-1">
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`flex-row items-center gap-x-1.5 px-4 py-2 rounded-full border ${
                  activeTab === tab.key
                    ? "bg-brand-400 border-brand-400"
                    : "bg-white border-brand-200"
                }`}
              >
                <Text className="text-sm">{tab.emoji}</Text>
                <Text
                  className={`text-sm font-semibold ${
                    activeTab === tab.key ? "text-brand-900" : "text-brand-600"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content panels */}
      <View className="flex-1">
        <View className={activeTab === "loans" ? "flex-1" : "hidden"}>
          <LoansContent />
        </View>
        <View className={activeTab === "roundups" ? "flex-1" : "hidden"}>
          <RoundupsContent />
        </View>
        <View className={activeTab === "savings" ? "flex-1" : "hidden"}>
          <SavingsContent />
        </View>
        <View className={activeTab === "networth" ? "flex-1" : "hidden"}>
          <NetWorthContent />
        </View>
      </View>
    </SafeAreaView>
  );
}
