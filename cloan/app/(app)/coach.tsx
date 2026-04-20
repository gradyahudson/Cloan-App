import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo, useRef } from "react";
import { useLoansStore } from "@/lib/store/loans";
import { useSavingsStore } from "@/lib/store/savings";
import { useXPStore, PRESET_SCENARIOS } from "@/lib/store/xp";
import { calculateWhatIf, PRESET_SCENARIOS as WhatIfPresets } from "@/lib/utils/what-if";
import { getNextDollarRecommendations } from "@/lib/utils/next-dollar";
import { formatCents, formatCentsCompact } from "@/lib/utils/currency";
import { Card } from "@/components/ui/Card";
import { format } from "date-fns";

const LIFE_EVENTS = [
  { id: "married", emoji: "💍", label: "Getting married", advice: "Combining finances with a partner changes everything. Consider a joint debt payoff plan — two incomes on the snowball is powerful. Make sure you're on the same page about debt before the wedding." },
  { id: "raise", emoji: "📈", label: "Got a raise", advice: "Lifestyle inflation is the enemy of debt payoff. Before spending the raise, allocate at least 50% to your snowball loan. Even $100/month extra can cut years off your timeline." },
  { id: "baby", emoji: "👶", label: "Having a baby", advice: "Baby expenses are real — budget $800–1,200/month in the first year. Temporarily reduce extra loan payments if needed, but don't stop entirely. Your debt-free date is a gift to your child too." },
  { id: "house", emoji: "🏡", label: "Want to buy a house", advice: "Student debt affects your DTI ratio. Lenders use 0.5–1% of your balance as a monthly payment in their calculation, even on IDR. Paying off your smallest loans first cleans up your DTI the fastest." },
  { id: "job_loss", emoji: "😰", label: "Lost my job", advice: "Apply for Income-Driven Repayment (IDR) immediately — it can reduce federal loan payments to $0/month. Also check if you qualify for unemployment. Protect your emergency fund before making extra payments." },
  { id: "grad", emoji: "🎓", label: "Starting grad school", advice: "Federal loans enter deferment while enrolled half-time, but interest still accrues on unsubsidized loans. If you can, pay interest during school to prevent capitalization. Don't ignore your existing loans." },
  { id: "relocate", emoji: "🗺️", label: "Moving to a new city", advice: "Moving costs $1,000–5,000+ on average. Build a temporary moving fund as a sinking goal before the move, then resume aggressive payoff. Don't go into credit card debt for the move." },
  { id: "freelance", emoji: "💻", label: "Going freelance / self-employed", advice: "Irregular income means your minimum payments matter more. Build 2–3 months of minimum payments in savings so you're covered in slow months. Then extra payments come from good months only." },
];

type CoachTab = "next-dollar" | "what-if" | "life-events";

export default function CoachScreen() {
  const [activeTab, setActiveTab] = useState<CoachTab>("next-dollar");
  const [selectedLifeEvent, setSelectedLifeEvent] = useState<typeof LIFE_EVENTS[0] | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const { loans, strategy, accumulatedCents } = useLoansStore();
  const { goals, getEmergencyFund } = useSavingsStore();
  const { addXP } = useXPStore();

  const activeLoans = loans.filter((l) => l.status === "active");
  const emergencyFund = getEmergencyFund();
  const efProgress = emergencyFund
    ? emergencyFund.currentCents / emergencyFund.targetCents
    : 0;

  const nextDollarRecs = useMemo(
    () =>
      getNextDollarRecommendations({
        loans: activeLoans,
        savingsGoals: goals,
        hasEmergencyFund: !!emergencyFund,
        emergencyFundProgress: efProgress,
      }),
    [activeLoans, goals, emergencyFund, efProgress]
  );

  const whatIfResults = useMemo(() => {
    if (!selectedScenario) return null;
    const preset = WhatIfPresets.find((p) => p.id === selectedScenario);
    if (!preset?.scenario) return null;
    const mappedLoans = activeLoans.map((l) => ({
      id: l.id, name: l.name, balanceCents: l.balanceCents,
      interestRateBps: l.interestRateBps, minimumPaymentCents: l.minimumPaymentCents,
    }));
    if (mappedLoans.length === 0) return null;
    return calculateWhatIf(mappedLoans, strategy, accumulatedCents, preset.scenario);
  }, [selectedScenario, activeLoans, strategy, accumulatedCents]);

  const handleWhatIfSelect = (id: string) => {
    setSelectedScenario(id === selectedScenario ? null : id);
    addXP("WHAT_IF_USED", "Ran a what-if scenario");
  };

  const handleLifeEvent = (event: typeof LIFE_EVENTS[0]) => {
    setSelectedLifeEvent(event === selectedLifeEvent ? null : event);
    addXP("LIFE_EVENT_SET", `Explored life event: ${event.label}`);
  };

  const TABS: { key: CoachTab; label: string; emoji: string }[] = [
    { key: "next-dollar", label: "Next Dollar", emoji: "🎯" },
    { key: "what-if", label: "What-If", emoji: "🔮" },
    { key: "life-events", label: "Life Events", emoji: "🗺️" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-brand-900">Cloan Coach</Text>
          <Text className="text-brand-600 mt-1">
            Personalized guidance — no jargon, no judgment.
          </Text>
        </View>

        {/* Tab switcher */}
        <View className="flex-row px-6 mt-4 gap-x-2">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-xl items-center border ${
                activeTab === tab.key
                  ? "bg-brand-400 border-brand-400"
                  : "bg-white border-brand-200"
              }`}
            >
              <Text className="text-base">{tab.emoji}</Text>
              <Text
                className={`text-xs font-semibold mt-0.5 ${
                  activeTab === tab.key ? "text-brand-900" : "text-brand-600"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="px-6 mt-5 gap-y-4 pb-8">
          {/* ── NEXT DOLLAR TAB ── */}
          {activeTab === "next-dollar" && (
            <>
              <View className="bg-brand-900 rounded-2xl p-4">
                <Text className="text-brand-400 text-sm mb-1">Your financial order of operations</Text>
                <Text className="text-white font-semibold leading-relaxed">
                  Based on your current picture, here's exactly where your next dollar should go.
                </Text>
              </View>

              {nextDollarRecs.map((rec, i) => (
                <Card key={i} variant={i === 0 ? "highlight" : "default"}>
                  <View className="flex-row items-start gap-x-3">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        i === 0 ? "bg-brand-400" : "bg-brand-100"
                      }`}
                    >
                      <Text className="text-xs font-bold text-brand-900">{rec.priority}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-x-2 mb-1">
                        <Text className="text-lg">{rec.emoji}</Text>
                        <Text className="font-bold text-brand-900 flex-1">{rec.title}</Text>
                        <View
                          className={`rounded-lg px-2 py-0.5 ${
                            rec.urgency === "critical"
                              ? "bg-red-100"
                              : rec.urgency === "high"
                              ? "bg-orange-100"
                              : rec.urgency === "medium"
                              ? "bg-brand-200"
                              : "bg-stone-100"
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold capitalize ${
                              rec.urgency === "critical"
                                ? "text-red-700"
                                : rec.urgency === "high"
                                ? "text-orange-700"
                                : "text-brand-700"
                            }`}
                          >
                            {rec.urgency}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-sm text-brand-700 leading-relaxed">{rec.reason}</Text>
                    </View>
                  </View>
                </Card>
              ))}

              {activeLoans.length === 0 && (
                <Card variant="highlight">
                  <Text className="text-center text-brand-700">
                    Add loans in the Money tab to get personalized recommendations.
                  </Text>
                </Card>
              )}
            </>
          )}

          {/* ── WHAT-IF TAB ── */}
          {activeTab === "what-if" && (
            <>
              <View className="bg-brand-900 rounded-2xl p-4">
                <Text className="text-brand-400 text-sm mb-1">Scenario explorer</Text>
                <Text className="text-white font-semibold leading-relaxed">
                  Tap a scenario to see exactly how it changes your payoff date and interest cost.
                </Text>
              </View>

              {activeLoans.length === 0 ? (
                <Card variant="highlight">
                  <Text className="text-center text-brand-700">Add loans to run what-if scenarios.</Text>
                </Card>
              ) : (
                <>
                  <View className="flex-row flex-wrap gap-2">
                    {WhatIfPresets.filter((p) => p.scenario).map((preset) => (
                      <TouchableOpacity
                        key={preset.id}
                        onPress={() => handleWhatIfSelect(preset.id)}
                        className={`px-4 py-2.5 rounded-xl border flex-row items-center gap-x-1.5 ${
                          selectedScenario === preset.id
                            ? "bg-brand-400 border-brand-400"
                            : "bg-white border-brand-200"
                        }`}
                      >
                        <Text className="text-base">{preset.emoji}</Text>
                        <Text
                          className={`text-sm font-semibold ${
                            selectedScenario === preset.id ? "text-brand-900" : "text-brand-600"
                          }`}
                        >
                          {preset.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {whatIfResults && (
                    <View className="bg-brand-50 border-2 border-brand-300 rounded-2xl p-5">
                      <Text className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-3">
                        Scenario: {whatIfResults.scenarioLabel}
                      </Text>

                      <View className="flex-row gap-x-3 mb-3">
                        <View className="flex-1 bg-stone-100 rounded-xl p-3">
                          <Text className="text-xs text-stone-500">Current payoff</Text>
                          <Text className="font-bold text-stone-700 mt-0.5">
                            {format(whatIfResults.currentPayoffDate, "MMM yyyy")}
                          </Text>
                        </View>
                        <View className="flex-1 bg-brand-100 rounded-xl p-3">
                          <Text className="text-xs text-brand-600">New payoff</Text>
                          <Text className="font-bold text-brand-900 mt-0.5">
                            {format(whatIfResults.newPayoffDate, "MMM yyyy")}
                          </Text>
                        </View>
                      </View>

                      {whatIfResults.monthsSaved > 0 && (
                        <View className="flex-row gap-x-3 mb-3">
                          <View className="flex-1 bg-brand-400 rounded-xl p-3">
                            <Text className="text-xs text-brand-800">Time saved</Text>
                            <Text className="font-bold text-brand-900 mt-0.5 text-lg">
                              {whatIfResults.monthsSaved} months
                            </Text>
                          </View>
                          <View className="flex-1 bg-brand-400 rounded-xl p-3">
                            <Text className="text-xs text-brand-800">Interest saved</Text>
                            <Text className="font-bold text-brand-900 mt-0.5 text-lg">
                              {formatCentsCompact(whatIfResults.interestSavedCents)}
                            </Text>
                          </View>
                        </View>
                      )}

                      <Text className="text-sm text-brand-800 leading-relaxed">
                        {whatIfResults.summary}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </>
          )}

          {/* ── LIFE EVENTS TAB ── */}
          {activeTab === "life-events" && (
            <>
              <View className="bg-brand-900 rounded-2xl p-4">
                <Text className="text-brand-400 text-sm mb-1">Real life, real advice</Text>
                <Text className="text-white font-semibold leading-relaxed">
                  Life doesn't stop for student loans. Here's how to handle major moments without derailing your progress.
                </Text>
              </View>

              {LIFE_EVENTS.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => handleLifeEvent(event)}
                  activeOpacity={0.8}
                >
                  <Card variant={selectedLifeEvent?.id === event.id ? "highlight" : "default"}>
                    <View className="flex-row items-center gap-x-3">
                      <View className="w-11 h-11 rounded-xl bg-brand-100 items-center justify-center">
                        <Text className="text-2xl">{event.emoji}</Text>
                      </View>
                      <Text className="font-semibold text-brand-900 flex-1">{event.label}</Text>
                      <Text className="text-brand-400 text-lg">
                        {selectedLifeEvent?.id === event.id ? "▲" : "▼"}
                      </Text>
                    </View>
                    {selectedLifeEvent?.id === event.id && (
                      <View className="mt-3 pt-3 border-t border-brand-200">
                        <Text className="text-sm text-brand-800 leading-relaxed">
                          {event.advice}
                        </Text>
                        <View className="mt-2 bg-brand-400 rounded-xl px-3 py-2">
                          <Text className="text-xs font-bold text-brand-900">
                            💡 Cloan never tells you not to live your life — just how to do it wisely.
                          </Text>
                        </View>
                      </View>
                    )}
                  </Card>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
