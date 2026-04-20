import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const baseClasses = "flex-row items-center justify-center rounded-full";
  const sizeClasses = {
    sm: "px-4 py-2",
    md: "px-6 py-4",
    lg: "px-8 py-5",
  };
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };
  const variantClasses = {
    primary: "bg-brand-400",
    secondary: "bg-brand-100 border border-brand-300",
    ghost: "bg-transparent",
    danger: "bg-red-500",
  };
  const textVariantClasses = {
    primary: "text-brand-900 font-bold",
    secondary: "text-brand-700 font-semibold",
    ghost: "text-brand-600 font-semibold",
    danger: "text-white font-bold",
  };

  return (
    <AnimatedTouchable
      style={[animatedStyle, fullWidth ? { width: "100%" } : undefined]}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        disabled || loading ? "opacity-50" : ""
      }`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#78350F" : "#D97706"}
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`${textSizeClasses[size]} ${textVariantClasses[variant]}`}>
            {label}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
}
