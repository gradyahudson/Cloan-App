import { View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "highlight";
}

export function Card({ children, className = "", variant = "default" }: CardProps) {
  const variantClasses = {
    default: "bg-white border border-brand-100",
    elevated: "bg-white shadow-sm shadow-brand-200",
    highlight: "bg-brand-50 border border-brand-200",
  };

  return (
    <View className={`rounded-2xl p-4 ${variantClasses[variant]} ${className}`}>
      {children}
    </View>
  );
}
