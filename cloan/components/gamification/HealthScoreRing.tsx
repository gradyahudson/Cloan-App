import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, { useSharedValue, useAnimatedProps, withSpring, useEffect } from "react-native-reanimated";
import { getHealthScoreLabel } from "@/lib/utils/health-score";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface HealthScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function HealthScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
}: HealthScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const { label, color, emoji } = getHealthScoreLabel(score);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(score / 100, { damping: 20, stiffness: 60 });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View className="items-center">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FEF3C7"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </Svg>
        {/* Center content */}
        <View
          style={{ position: "absolute", width: size, height: size }}
          className="items-center justify-center"
        >
          <Text className="text-2xl font-bold text-brand-900">{score}</Text>
          <Text className="text-xs text-brand-600">/ 100</Text>
        </View>
      </View>

      {showLabel && (
        <View className="items-center mt-2">
          <Text className="text-base font-bold text-brand-900">
            {emoji} {label}
          </Text>
        </View>
      )}
    </View>
  );
}
