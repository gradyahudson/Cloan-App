import { View, Text, ScrollView, Modal, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useLoansStore } from "@/lib/store/loans";
import { ALL_MILESTONES, MilestoneDefinition } from "@/lib/data/milestones";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "savings", label: "Savings" },
  { key: "payoff", label: "Payoffs" },
  { key: "streak", label: "Streaks" },
  { key: "engagement", label: "Activity" },
  { key: "education", label: "Learning" },
];

function BadgeCard({
  milestone,
  earned,
  onPress,
}: {
  milestone: MilestoneDefinition;
  earned: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (!earned) return;
    scale.value = withSequence(
      withSpring(1.1, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={earned ? 0.8 : 1} className="w-[30%]">
      <Animated.View style={animatedStyle}>
        <View
          className={`rounded-2xl p-3 items-center ${
            earned ? "bg-brand-100 border-2 border-brand-300" : "bg-stone-100 border border-stone-200"
          }`}
        >
          <Text style={{ fontSize: 32, opacity: earned ? 1 : 0.3 }}>{milestone.emoji}</Text>
          <Text
            className={`text-xs font-semibold text-center mt-1.5 ${
              earned ? "text-brand-900" : "text-stone-400"
            }`}
            numberOfLines={2}
          >
            {milestone.secret && !earned ? "???" : milestone.name}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function MilestonesScreen() {
  const { earnedMilestoneIds, streakDays, accumulatedCents, loans, roundups } = useLoansStore();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneDefinition | null>(null);

  const earned = ALL_MILESTONES.filter((m) => earnedMilestoneIds.includes(m.id));
  const total = ALL_MILESTONES.filter((m) => !m.secret).length;

  const filtered =
    selectedCategory === "all"
      ? ALL_MILESTONES
      : ALL_MILESTONES.filter((m) => m.category === selectedCategory);

  const paidOffLoans = loans.filter((l) => l.status === "paid_off").length;
  const totalOriginal = loans.reduce((s, l) => s + l.originalBalanceCents, 0);
  const totalBalance = loans.filter((l) => l.status === "active").reduce((s, l) => s + l.balanceCents, 0);
  const paidPercent = totalOriginal > 0 ? (totalOriginal - totalBalance) / totalOriginal : 0;

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-brand-900">Your wins</Text>
          <Text className="text-brand-600 mt-1">
            {earned.length}/{total} badges earned
          </Text>
        </View>

        <View className="px-6 mt-4 gap-y-4 pb-8">
          {/* Progress overview */}
          <View className="bg-brand-900 rounded-3xl p-5">
            <View className="flex-row gap-x-3 mb-4">
              <View className="flex-1 bg-brand-800 rounded-2xl p-3">
                <Text className="text-brand-400 text-xs">Badges</Text>
                <Text className="text-white text-2xl font-bold mt-0.5">
                  {earned.length}<Text className="text-brand-500 text-sm">/{total}</Text>
                </Text>
              </View>
              <View className="flex-1 bg-brand-800 rounded-2xl p-3">
                <Text className="text-brand-400 text-xs">Streak</Text>
                <Text className="text-white text-2xl font-bold mt-0.5">
                  {streakDays}<Text className="text-brand-500 text-sm"> days</Text>
                </Text>
              </View>
              <View className="flex-1 bg-brand-800 rounded-2xl p-3">
                <Text className="text-brand-400 text-xs">Paid off</Text>
                <Text className="text-white text-2xl font-bold mt-0.5">
                  {paidOffLoans}<Text className="text-brand-500 text-sm"> loans</Text>
                </Text>
              </View>
            </View>

            {/* Badge progress */}
            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-brand-400 text-xs">Badge progress</Text>
                <Text className="text-brand-400 text-xs">{Math.round((earned.length / total) * 100)}%</Text>
              </View>
              <View className="h-2 bg-brand-700 rounded-full overflow-hidden">
                <View
                  className="h-full bg-brand-400 rounded-full"
                  style={{ width: `${(earned.length / total) * 100}%` }}
                />
              </View>
            </View>
          </View>

          {/* Stats that feed milestones */}
          <View className="flex-row gap-x-3">
            <Card variant="highlight" className="flex-1">
              <Text className="text-brand-600 text-xs">Debt paid off</Text>
              <Text className="font-bold text-brand-900 text-lg mt-0.5">
                {Math.round(paidPercent * 100)}%
              </Text>
            </Card>
            <Card variant="highlight" className="flex-1">
              <Text className="text-brand-600 text-xs">Round-ups</Text>
              <Text className="font-bold text-brand-900 text-lg mt-0.5">{roundups.length}</Text>
            </Card>
            <Card variant="highlight" className="flex-1">
              <Text className="text-brand-600 text-xs">Accumulated</Text>
              <Text className="font-bold text-brand-900 text-lg mt-0.5">
                ${(accumulatedCents / 100).toFixed(0)}
              </Text>
            </Card>
          </View>

          {/* Category filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
            <View className="flex-row px-1 gap-x-2">
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedCategory === cat.key
                      ? "bg-brand-400 border-brand-400"
                      : "bg-white border-brand-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedCategory === cat.key ? "text-brand-900" : "text-brand-600"
                    }`}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Badge grid */}
          <View className="flex-row flex-wrap gap-3">
            {filtered.map((m) => (
              <BadgeCard
                key={m.id}
                milestone={m}
                earned={earnedMilestoneIds.includes(m.id)}
                onPress={() => setSelectedMilestone(m)}
              />
            ))}
          </View>

          {/* Encouragement */}
          <Card variant="highlight">
            <Text className="text-brand-800 text-sm font-medium leading-relaxed">
              💡 Earn badges by making round-ups, building streaks, and paying off loans. Every small win counts.
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* Badge detail modal */}
      <Modal visible={!!selectedMilestone} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-8">
          <View className="bg-brand-50 rounded-3xl p-6 w-full items-center">
            <Text style={{ fontSize: 64 }}>{selectedMilestone?.emoji}</Text>
            <Text className="text-2xl font-bold text-brand-900 mt-3 text-center">
              {selectedMilestone?.name}
            </Text>
            <View className="bg-brand-400 rounded-xl px-3 py-1 mt-2">
              <Text className="text-xs font-bold text-brand-900 uppercase tracking-wide">
                BADGE EARNED
              </Text>
            </View>
            <Text className="text-brand-700 text-center mt-3 leading-relaxed">
              {selectedMilestone?.description}
            </Text>
            <Button
              label="Close"
              onPress={() => setSelectedMilestone(null)}
              variant="primary"
              size="md"
              className="mt-5"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
