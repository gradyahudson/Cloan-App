import { View, Text, TouchableOpacity, Alert } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Challenge } from "@/lib/store/xp";

interface DailyChallengeCardProps {
  challenge: Challenge;
  completed: boolean;
  onComplete: () => void;
}

export function DailyChallengeCard({ challenge, completed, onComplete }: DailyChallengeCardProps) {
  const scale = useSharedValue(1);
  const checkOpacity = useSharedValue(completed ? 1 : 0);

  const handlePress = () => {
    if (completed) return;
    Alert.alert(
      challenge.title,
      `${challenge.description}\n\nComplete this challenge to earn +${challenge.xpReward} XP${
        challenge.dollarReward ? ` and $${challenge.dollarReward} toward your loan` : ""
      }.`,
      [
        { text: "Not yet", style: "cancel" },
        {
          text: "Mark complete ✓",
          onPress: () => {
            scale.value = withSequence(
              withSpring(0.95, { damping: 8 }),
              withSpring(1.02, { damping: 8 }),
              withSpring(1, { damping: 12 })
            );
            checkOpacity.value = withTiming(1, { duration: 300 });
            onComplete();
          },
        },
      ]
    );
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }));

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={completed ? 1 : 0.8}>
      <Animated.View
        style={cardStyle}
        className={`rounded-2xl p-4 border-2 ${
          completed
            ? "bg-brand-100 border-brand-300"
            : "bg-white border-brand-200"
        }`}
      >
        <View className="flex-row items-start gap-x-3">
          <View
            className={`w-11 h-11 rounded-xl items-center justify-center ${
              completed ? "bg-brand-300" : "bg-brand-100"
            }`}
          >
            <Text className="text-2xl">{challenge.emoji}</Text>
          </View>

          <View className="flex-1">
            <Text className={`font-bold text-base ${completed ? "text-brand-600 line-through" : "text-brand-900"}`}>
              {challenge.title}
            </Text>
            <Text className="text-sm text-brand-600 mt-0.5 leading-snug">
              {challenge.description}
            </Text>
            <View className="flex-row items-center gap-x-2 mt-2">
              <View className="bg-brand-400 rounded-lg px-2 py-0.5">
                <Text className="text-xs font-bold text-brand-900">+{challenge.xpReward} XP</Text>
              </View>
              {challenge.dollarReward && (
                <View className="bg-green-100 rounded-lg px-2 py-0.5">
                  <Text className="text-xs font-bold text-green-700">+${challenge.dollarReward} loan</Text>
                </View>
              )}
            </View>
          </View>

          <Animated.View
            style={checkStyle}
            className="w-7 h-7 rounded-full bg-brand-400 items-center justify-center"
          >
            <Text className="text-brand-900 font-bold">✓</Text>
          </Animated.View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}
