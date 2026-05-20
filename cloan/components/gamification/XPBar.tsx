import { View, Text } from "react-native";
import { useEffect } from "react";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { getLevelForXP, getXPProgress, getXPToNextLevel, LEVELS } from "@/lib/store/xp";

interface XPBarProps {
  totalXP: number;
  compact?: boolean;
}

export function XPBar({ totalXP, compact = false }: XPBarProps) {
  const level = getLevelForXP(totalXP);
  const progress = getXPProgress(totalXP);
  const toNext = getXPToNextLevel(totalXP);
  const nextLevel = LEVELS.find((l) => l.level === level.level + 1);

  const barWidth = useSharedValue(0);

  useEffect(() => {
    barWidth.value = withSpring(progress * 100, { damping: 20, stiffness: 80 });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
  }));

  if (compact) {
    return (
      <View className="flex-row items-center gap-x-2">
        <Text className="text-base">{level.emoji}</Text>
        <View className="flex-1">
          <View className="h-1.5 bg-brand-200 rounded-full overflow-hidden">
            <Animated.View
              style={[barStyle, { height: 6, borderRadius: 3, backgroundColor: level.color }]}
            />
          </View>
        </View>
        <Text className="text-xs font-bold text-brand-700">{totalXP} XP</Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl p-4 border border-brand-100">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-x-2">
          <Text className="text-2xl">{level.emoji}</Text>
          <View>
            <Text className="font-bold text-brand-900 text-base">{level.name}</Text>
            <Text className="text-xs text-brand-600">Level {level.level}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="font-bold text-brand-900">{totalXP.toLocaleString()} XP</Text>
          {nextLevel && (
            <Text className="text-xs text-brand-500">{toNext} to {nextLevel.name}</Text>
          )}
        </View>
      </View>
      <View className="h-3 bg-brand-100 rounded-full overflow-hidden">
        <Animated.View
          style={[barStyle, { height: 12, borderRadius: 6, backgroundColor: level.color }]}
        />
      </View>
      {nextLevel && (
        <View className="flex-row justify-between mt-1">
          <Text className="text-xs text-brand-500">{level.name}</Text>
          <Text className="text-xs text-brand-500">{nextLevel.emoji} {nextLevel.name}</Text>
        </View>
      )}
    </View>
  );
}
