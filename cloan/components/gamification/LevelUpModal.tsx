import { View, Text, Modal, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import { useXPStore, getLevelForXP, LEVELS } from "@/lib/store/xp";

export function LevelUpModal() {
  const { totalXP, pendingLevelUp, dismissLevelUp } = useXPStore();
  const level = getLevelForXP(totalXP);

  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    if (pendingLevelUp) {
      scale.value = withSpring(1, { damping: 12, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
      emojiScale.value = withDelay(300, withSpring(1, { damping: 8, stiffness: 200 }));
      textOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    }
  }, [pendingLevelUp]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  if (!pendingLevelUp) return null;

  return (
    <Modal transparent animationType="fade" visible={pendingLevelUp}>
      <View className="flex-1 bg-black/60 items-center justify-center px-8">
        <Animated.View
          style={containerStyle}
          className="bg-brand-50 rounded-3xl p-8 w-full items-center"
        >
          <View className="bg-brand-400 rounded-full w-8 h-8 items-center justify-center mb-4">
            <Text className="text-brand-900 font-bold text-sm">NEW</Text>
          </View>

          <Animated.Text style={emojiStyle} className="text-7xl mb-4">
            {level.emoji}
          </Animated.Text>

          <Animated.View style={textStyle} className="items-center">
            <Text className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">
              Level Up!
            </Text>
            <Text className="text-4xl font-bold text-brand-900 mb-2">{level.name}</Text>
            <Text className="text-brand-700 text-center leading-relaxed mb-4">
              {level.description}
            </Text>

            {level.unlockedCosmetics.length > 0 && (
              <View className="bg-brand-100 rounded-2xl p-3 w-full mb-4">
                <Text className="text-xs font-bold text-brand-700 uppercase tracking-wide mb-1">
                  Unlocked
                </Text>
                {level.unlockedCosmetics.map((c) => (
                  <Text key={c} className="text-sm text-brand-800">
                    ✨ {c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Text>
                ))}
              </View>
            )}

            <TouchableOpacity
              onPress={dismissLevelUp}
              className="bg-brand-400 rounded-full px-8 py-4 w-full items-center"
            >
              <Text className="font-bold text-brand-900 text-lg">Keep growing 🌱</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}
