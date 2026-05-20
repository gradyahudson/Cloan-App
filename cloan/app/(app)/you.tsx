import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useLoansStore } from "@/lib/store/loans";
import { useSavingsStore } from "@/lib/store/savings";
import { useXPStore, getLevelForXP, getXPProgress, getXPToNextLevel, LEVELS } from "@/lib/store/xp";
import { calculateHealthScore } from "@/lib/utils/health-score";
import { XPBar } from "@/components/gamification/XPBar";
import { HealthScoreRing } from "@/components/gamification/HealthScoreRing";
import { Card } from "@/components/ui/Card";

type YouTab = "profile" | "wins" | "settings";

function ProfileTab() {
  const { loans, streakDays, earnedMilestoneIds, roundups } = useLoansStore();
  const { goals, getTotalSaved } = useSavingsStore();
  const totalSavedCents = getTotalSaved();
  const { totalXP, xpHistory, completedChallenges, selectedCosmetics } = useXPStore();

  const level = getLevelForXP(totalXP);
  const progress = getXPProgress(totalXP);
  const toNext = getXPToNextLevel(totalXP);
  const nextLevel = LEVELS.find((l) => l.level === level.level + 1);

  const articlesRead = xpHistory.filter((e) => e.action === "ARTICLE_READ").length;
  const todaysCompletions = completedChallenges.filter(
    (c) => c.date === new Date().toDateString()
  ).length;

  const healthInput = {
    loans,
    savingsGoals: goals,
    streakDays,
    articlesRead,
    totalXP,
    roundupCount: roundups.length,
  };
  const health = calculateHealthScore(healthInput);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="px-6 py-4 gap-y-4 pb-24">
        {/* Level card */}
        <View className="bg-brand-900 rounded-3xl p-6 items-center">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: level.color + "33" }}
          >
            <Text style={{ fontSize: 40 }}>{level.emoji}</Text>
          </View>
          <Text className="text-white text-xl font-bold">{level.name}</Text>
          <Text className="text-brand-400 text-sm">Level {level.level}</Text>
          <Text className="text-brand-300 text-xs mt-1 text-center px-4">{level.description}</Text>

          {/* XP bar */}
          <View className="w-full mt-4">
            <View className="flex-row justify-between mb-1">
              <Text className="text-brand-400 text-xs">{totalXP.toLocaleString()} XP</Text>
              {nextLevel && (
                <Text className="text-brand-500 text-xs">{toNext} to {nextLevel.emoji} {nextLevel.name}</Text>
              )}
            </View>
            <View className="h-2 bg-brand-700 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ width: `${progress * 100}%`, backgroundColor: level.color }}
              />
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View className="flex-row gap-x-3">
          <Card variant="default" className="flex-1 items-center">
            <Text className="text-2xl font-bold text-brand-900">{streakDays}</Text>
            <Text className="text-xs text-brand-600">Day streak 🔥</Text>
          </Card>
          <Card variant="default" className="flex-1 items-center">
            <Text className="text-2xl font-bold text-brand-900">{completedChallenges.length}</Text>
            <Text className="text-xs text-brand-600">Challenges done</Text>
          </Card>
          <Card variant="default" className="flex-1 items-center">
            <Text className="text-2xl font-bold text-brand-900">{earnedMilestoneIds.length}</Text>
            <Text className="text-xs text-brand-600">Badges</Text>
          </Card>
        </View>

        {/* Health score */}
        <Card variant="elevated">
          <Text className="font-semibold text-brand-900 mb-4">Financial Health</Text>
          <View className="items-center mb-4">
            <HealthScoreRing score={health.total} size={120} strokeWidth={10} />
          </View>
          <View className="gap-y-2">
            {[
              health.debtLoad,
              health.paymentConsistency,
              health.savingsRate,
              health.loanKnowledge,
            ].map((component) => (
              <View key={component.label}>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs text-brand-700">{component.label}</Text>
                  <Text className="text-xs font-bold text-brand-900">
                    {component.score}/{component.max}
                  </Text>
                </View>
                <View className="h-1.5 bg-brand-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-brand-400 rounded-full"
                    style={{ width: `${(component.score / component.max) * 100}%` }}
                  />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Unlocked cosmetics */}
        {level.unlockedCosmetics.length > 0 && (
          <Card variant="default">
            <Text className="font-semibold text-brand-900 mb-2">Unlocked at this level</Text>
            <View className="flex-row flex-wrap gap-2">
              {level.unlockedCosmetics.map((c) => (
                <View key={c} className="bg-brand-200 rounded-lg px-3 py-1.5">
                  <Text className="text-xs font-medium text-brand-800">{c.replace(/_/g, " ")}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

function WinsTab() {
  const { earnedMilestoneIds } = useLoansStore();
  const { completedChallenges, xpHistory } = useXPStore();

  const MILESTONE_DEFS: Record<string, { emoji: string; label: string; desc: string }> = {
    first_roundup: { emoji: "🪙", label: "First Round-up", desc: "Your first cent toward freedom." },
    first_article: { emoji: "📚", label: "Knowledge Seeker", desc: "Read your first Learn article." },
    first_payment: { emoji: "💸", label: "Payment Made", desc: "You logged your first loan payment." },
    streak_7: { emoji: "🔥", label: "Week on Fire", desc: "7-day streak — consistency is compounding." },
    streak_30: { emoji: "🏆", label: "Monthly Grind", desc: "30 days straight. You're unstoppable." },
    paid_off_one: { emoji: "🎉", label: "Debt Slayer", desc: "You paid off your first loan." },
    hundred_dollars: { emoji: "💯", label: "$100 Club", desc: "Rounded up $100 toward your debt." },
  };

  const totalXPEarned = xpHistory.reduce((sum, e) => sum + e.amount, 0);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="px-6 py-4 gap-y-4 pb-24">
        {/* XP summary */}
        <View className="bg-brand-900 rounded-2xl p-5">
          <Text className="text-brand-300 text-sm">Total XP earned</Text>
          <Text className="text-white text-4xl font-bold mt-1">{totalXPEarned.toLocaleString()}</Text>
          <Text className="text-brand-400 text-xs mt-1">
            {xpHistory.length} events · {completedChallenges.length} challenges completed
          </Text>
        </View>

        {/* Milestones */}
        <Text className="font-semibold text-brand-900">Badges</Text>
        {Object.entries(MILESTONE_DEFS).map(([id, def]) => {
          const earned = earnedMilestoneIds.includes(id);
          return (
            <Card key={id} variant="default" className={earned ? "" : "opacity-50"}>
              <View className="flex-row items-center gap-x-3">
                <View className={`w-12 h-12 rounded-2xl items-center justify-center ${earned ? "bg-brand-200" : "bg-brand-100"}`}>
                  <Text className="text-2xl">{earned ? def.emoji : "🔒"}</Text>
                </View>
                <View className="flex-1">
                  <Text className={`font-bold ${earned ? "text-brand-900" : "text-brand-500"}`}>{def.label}</Text>
                  <Text className="text-xs text-brand-600">{def.desc}</Text>
                </View>
                {earned && (
                  <View className="bg-brand-400 rounded-lg px-2 py-0.5">
                    <Text className="text-xs font-bold text-brand-900">Earned</Text>
                  </View>
                )}
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

function SettingsTab() {
  const { strategy, setStrategy, roundupsEnabled, setRoundupsEnabled, loans, roundups } = useLoansStore();

  const handleReset = () => {
    Alert.alert(
      "Reset all data?",
      "This will delete all your loans, round-ups, and progress. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => {} },
      ]
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="px-6 py-4 gap-y-4 pb-24">
        {/* Round-ups toggle */}
        <Card variant="elevated">
          <Text className="font-semibold text-brand-900 mb-3">Round-ups</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-brand-800 font-medium">Enable round-ups</Text>
              <Text className="text-xs text-brand-600 mt-0.5">Collect spare change from purchases</Text>
            </View>
            <Switch
              value={roundupsEnabled ?? true}
              onValueChange={setRoundupsEnabled}
              trackColor={{ false: "#E7E5E4", true: "#FCD34D" }}
              thumbColor="#FFFBEB"
            />
          </View>
        </Card>

        {/* Strategy */}
        <Card variant="default">
          <Text className="font-semibold text-brand-900 mb-3">Payoff Strategy</Text>
          {(["snowball", "avalanche", "proportional"] as const).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setStrategy(s)}
              className="flex-row items-center justify-between py-3 border-b border-brand-100"
            >
              <View>
                <Text className={`font-medium ${strategy === s ? "text-brand-700" : "text-brand-800"}`}>
                  {s === "snowball" ? "❄️ Snowball" : s === "avalanche" ? "🌊 Avalanche" : "⚖️ Proportional"}
                </Text>
                <Text className="text-xs text-brand-500">
                  {s === "snowball"
                    ? "Smallest balance first"
                    : s === "avalanche"
                    ? "Highest rate first"
                    : "Split payments evenly"}
                </Text>
              </View>
              {strategy === s && (
                <View className="w-6 h-6 rounded-full bg-brand-400 items-center justify-center">
                  <Text className="text-brand-900 font-bold text-xs">✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Data stats */}
        <Card variant="default">
          <Text className="font-semibold text-brand-900 mb-3">Your data</Text>
          <View className="gap-y-1.5">
            <View className="flex-row justify-between">
              <Text className="text-sm text-brand-700">Loans</Text>
              <Text className="text-sm font-medium text-brand-900">{loans.length}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-brand-700">Round-up transactions</Text>
              <Text className="text-sm font-medium text-brand-900">{roundups.length}</Text>
            </View>
          </View>
        </Card>

        {/* Legal */}
        <Card variant="default">
          <Text className="font-semibold text-brand-900 mb-3">Legal</Text>
          <Text className="text-xs text-brand-500 leading-relaxed">
            Cloan is a personal finance tracking tool. It does not connect to your bank accounts or servicers. All data is stored locally on your device. Cloan is not a registered financial advisor — consult a professional for personalized advice.
          </Text>
        </Card>

        {/* Danger zone */}
        <TouchableOpacity
          onPress={handleReset}
          className="border border-red-200 rounded-2xl p-4 items-center"
        >
          <Text className="text-red-500 font-semibold">Reset all data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const TABS: { key: YouTab; label: string; emoji: string }[] = [
  { key: "profile", label: "Profile", emoji: "👤" },
  { key: "wins", label: "Wins", emoji: "🏆" },
  { key: "settings", label: "Settings", emoji: "⚙️" },
];

export default function YouScreen() {
  const [activeTab, setActiveTab] = useState<YouTab>("profile");
  const { totalXP } = useXPStore();

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-brand-900">You</Text>
        <View className="mt-2">
          <XPBar totalXP={totalXP} compact />
        </View>
      </View>

      {/* Sub-tab bar */}
      <View className="px-4 mb-2">
        <View className="flex-row gap-x-2">
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
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className={activeTab === "profile" ? "flex-1" : "hidden"}>
          <ProfileTab />
        </View>
        <View className={activeTab === "wins" ? "flex-1" : "hidden"}>
          <WinsTab />
        </View>
        <View className={activeTab === "settings" ? "flex-1" : "hidden"}>
          <SettingsTab />
        </View>
      </View>
    </SafeAreaView>
  );
}
