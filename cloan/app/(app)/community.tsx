import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useCommunityStore } from "@/lib/store/community";
import { useXPStore } from "@/lib/store/xp";
import { useLoansStore } from "@/lib/store/loans";
import { formatCents } from "@/lib/utils/currency";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type CommunityTab = "feed" | "crew";

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<CommunityTab>("feed");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCrewModal, setShowCrewModal] = useState(false);
  const [crewName, setCrewName] = useState("");
  const { feedPosts, crew, toggleLike, postToFeed, createCrew, joinCrew, leaveCrew } = useCommunityStore();
  const { totalXP } = useXPStore();
  const { streakDays, loans } = useLoansStore();

  const SHARE_OPTIONS = [
    { emoji: "🎉", message: "Someone just paid off a loan!", type: "loan_paid_off" as const },
    { emoji: "🔥", message: "On a streak and loving it!", type: "milestone" as const },
    { emoji: "🛡️", message: "Emergency fund complete!", type: "savings_goal" as const },
    { emoji: "🌱", message: "First week using Cloan down!", type: "milestone" as const },
  ];

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-brand-900">Community</Text>
          <Text className="text-brand-600 mt-1">
            Anonymous wins. Real accountability.
          </Text>
        </View>

        {/* Tab switcher */}
        <View className="flex-row px-6 mt-4 gap-x-3">
          {(["feed", "crew"] as CommunityTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl items-center border ${
                activeTab === tab ? "bg-brand-400 border-brand-400" : "bg-white border-brand-200"
              }`}
            >
              <Text className={`font-semibold capitalize ${activeTab === tab ? "text-brand-900" : "text-brand-600"}`}>
                {tab === "feed" ? "🌎 Feed" : "⚡ Crew"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="px-6 mt-5 gap-y-4 pb-8">
          {/* ── FEED TAB ── */}
          {activeTab === "feed" && (
            <>
              <TouchableOpacity
                onPress={() => setShowShareModal(true)}
                className="bg-brand-400 rounded-2xl p-4 flex-row items-center gap-x-3"
              >
                <View className="w-10 h-10 rounded-full bg-brand-300 items-center justify-center">
                  <Text className="text-xl">✨</Text>
                </View>
                <Text className="flex-1 font-semibold text-brand-900">
                  Share an anonymous win...
                </Text>
                <Text className="text-brand-700">→</Text>
              </TouchableOpacity>

              <View className="bg-brand-100 rounded-xl px-3 py-2">
                <Text className="text-xs text-brand-700 text-center">
                  🔒 All posts are 100% anonymous. No names, no balances, no judgment.
                </Text>
              </View>

              {feedPosts.map((post) => (
                <Card key={post.id} variant={post.isOwn ? "highlight" : "default"}>
                  <View className="flex-row items-start gap-x-3">
                    <View className="w-11 h-11 rounded-2xl bg-brand-100 items-center justify-center">
                      <Text className="text-2xl">{post.emoji}</Text>
                    </View>
                    <View className="flex-1">
                      {post.isOwn && (
                        <View className="bg-brand-400 self-start rounded-lg px-2 py-0.5 mb-1">
                          <Text className="text-xs font-bold text-brand-900">YOUR POST</Text>
                        </View>
                      )}
                      <Text className="text-brand-900 font-medium leading-relaxed">
                        {post.message}
                      </Text>
                      <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-xs text-brand-500">{post.timestamp}</Text>
                        <TouchableOpacity
                          onPress={() => toggleLike(post.id)}
                          className="flex-row items-center gap-x-1"
                        >
                          <Text className="text-base">{post.liked ? "❤️" : "🤍"}</Text>
                          <Text className="text-xs text-brand-600 font-medium">{post.likes}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </>
          )}

          {/* ── CREW TAB ── */}
          {activeTab === "crew" && (
            <>
              {!crew ? (
                <>
                  <View className="bg-brand-900 rounded-2xl p-5">
                    <Text className="text-white text-lg font-bold mb-2">What's a Cloan Crew?</Text>
                    <Text className="text-brand-400 text-sm leading-relaxed mb-3">
                      A small group of 3–6 people holding each other accountable. You see each other's streaks and XP — never balances. Complete crew challenges together for bonus XP.
                    </Text>
                    <View className="flex-row gap-x-3">
                      <View className="flex-1 bg-brand-800 rounded-xl p-3">
                        <Text className="text-brand-400 text-xs">Members</Text>
                        <Text className="text-white font-bold text-lg">3–6</Text>
                      </View>
                      <View className="flex-1 bg-brand-800 rounded-xl p-3">
                        <Text className="text-brand-400 text-xs">Shared</Text>
                        <Text className="text-white font-bold text-lg">XP only</Text>
                      </View>
                      <View className="flex-1 bg-brand-800 rounded-xl p-3">
                        <Text className="text-brand-400 text-xs">Bonus XP</Text>
                        <Text className="text-white font-bold text-lg">+200</Text>
                      </View>
                    </View>
                  </View>

                  <Button
                    label="Create a Crew"
                    onPress={() => setShowCrewModal(true)}
                    variant="primary"
                    size="lg"
                  />
                  <Button
                    label="Join a demo Crew"
                    onPress={() => joinCrew("demo_crew")}
                    variant="secondary"
                    size="md"
                  />
                </>
              ) : (
                <>
                  {/* Crew header */}
                  <View className="bg-brand-900 rounded-2xl p-5">
                    <View className="flex-row items-center gap-x-3 mb-3">
                      <Text className="text-4xl">{crew.emoji}</Text>
                      <View>
                        <Text className="text-white text-xl font-bold">{crew.name}</Text>
                        <Text className="text-brand-400 text-sm">{crew.members.length} members</Text>
                      </View>
                    </View>

                    {crew.challenge && (
                      <View className="bg-brand-800 rounded-xl p-3">
                        <Text className="text-brand-400 text-xs mb-1">Current crew challenge</Text>
                        <Text className="text-white font-semibold">{crew.challenge.description}</Text>
                        <View className="mt-2 h-2 bg-brand-700 rounded-full overflow-hidden">
                          <View
                            className="h-full bg-brand-400 rounded-full"
                            style={{ width: `${(crew.challenge.currentCents / crew.challenge.targetCents) * 100}%` }}
                          />
                        </View>
                        <View className="flex-row justify-between mt-1">
                          <Text className="text-brand-500 text-xs">
                            {formatCents(crew.challenge.currentCents)} raised
                          </Text>
                          <Text className="text-brand-500 text-xs">
                            Goal: {formatCents(crew.challenge.targetCents)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Members leaderboard */}
                  <Card variant="default">
                    <Text className="font-bold text-brand-900 mb-3">Crew leaderboard</Text>
                    {[...crew.members]
                      .sort((a, b) => b.totalXP - a.totalXP)
                      .map((member, i) => (
                        <View
                          key={member.id}
                          className={`flex-row items-center gap-x-3 py-3 ${i < crew.members.length - 1 ? "border-b border-brand-100" : ""}`}
                        >
                          <Text className="text-lg font-bold text-brand-400 w-6">
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                          </Text>
                          <View className="w-9 h-9 rounded-full bg-brand-100 items-center justify-center">
                            <Text className="text-lg">{member.avatarEmoji}</Text>
                          </View>
                          <View className="flex-1">
                            <Text className={`font-semibold ${member.isYou ? "text-brand-700" : "text-brand-900"}`}>
                              {member.displayName} {member.isYou && "(you)"}
                            </Text>
                            <Text className="text-xs text-brand-500">
                              🔥 {member.streakDays} day streak
                            </Text>
                          </View>
                          <Text className="font-bold text-brand-900">
                            {member.totalXP.toLocaleString()} XP
                          </Text>
                        </View>
                      ))}
                  </Card>

                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert("Leave crew?", "You'll lose your crew progress.", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Leave", style: "destructive", onPress: leaveCrew },
                      ])
                    }
                    className="py-3 items-center"
                  >
                    <Text className="text-red-400 text-sm">Leave crew</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Share modal */}
      <Modal visible={showShareModal} transparent animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-brand-50 px-6 pt-6">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-bold text-brand-900">Share a win</Text>
            <TouchableOpacity onPress={() => setShowShareModal(false)}>
              <Text className="text-brand-600 font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
          <View className="gap-y-3">
            {SHARE_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  postToFeed({ type: opt.type, emoji: opt.emoji, message: opt.message });
                  setShowShareModal(false);
                }}
                className="flex-row items-center gap-x-3 bg-white rounded-2xl p-4 border border-brand-200"
              >
                <Text className="text-2xl">{opt.emoji}</Text>
                <Text className="font-semibold text-brand-900 flex-1">{opt.message}</Text>
                <Text className="text-brand-400">→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Create crew modal */}
      <Modal visible={showCrewModal} transparent animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-brand-50 px-6 pt-6">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-bold text-brand-900">Create a Crew</Text>
            <TouchableOpacity onPress={() => setShowCrewModal(false)}>
              <Text className="text-brand-600 font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-sm font-semibold text-brand-800 mb-2">Crew name</Text>
          <View className="bg-white border border-brand-200 rounded-xl px-4 py-3 mb-4">
            <TextInput
              value={crewName}
              onChangeText={setCrewName}
              placeholder="Debt Destroyers, Money Moves, etc."
              placeholderTextColor="#B45309"
              className="text-brand-900 text-base"
            />
          </View>
          <Button
            label="Create Crew"
            onPress={() => {
              if (!crewName.trim()) return;
              createCrew(crewName.trim(), "⚡");
              setShowCrewModal(false);
              setCrewName("");
            }}
            variant="primary"
            size="lg"
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
