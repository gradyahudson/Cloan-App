import { View, Text } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useEffect } from "react";

interface ProgressBarProps {
  progress: number; // 0–1
  label?: string;
  showPercent?: boolean;
  height?: number;
  color?: string;
}

export function ProgressBar({
  progress,
  label,
  showPercent = false,
  height = 10,
  color = "#FBBF24",
}: ProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(Math.min(Math.max(progress, 0), 1) * 100, {
      damping: 20,
      stiffness: 90,
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View>
      {(label || showPercent) && (
        <View className="flex-row justify-between mb-1">
          {label && <Text className="text-sm text-brand-700">{label}</Text>}
          {showPercent && (
            <Text className="text-sm font-semibold text-brand-600">
              {Math.round(progress * 100)}%
            </Text>
          )}
        </View>
      )}
      <View
        style={{ height, borderRadius: height / 2 }}
        className="bg-brand-100 overflow-hidden"
      >
        <Animated.View
          style={[
            animatedStyle,
            { height, borderRadius: height / 2, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}
