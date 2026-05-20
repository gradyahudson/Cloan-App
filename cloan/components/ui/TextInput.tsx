import { View, Text, TextInput as RNTextInput, TextInputProps } from "react-native";

interface InputProps extends Omit<TextInputProps, "className"> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
}

export function TextInput({ label, error, hint, prefix, suffix, ...props }: InputProps) {
  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-semibold text-brand-800 mb-1.5">{label}</Text>
      )}
      <View
        className={`flex-row items-center bg-white border rounded-xl px-4 py-3 ${
          error ? "border-red-400" : "border-brand-200"
        }`}
      >
        {prefix && (
          <Text className="text-brand-600 mr-1 text-base">{prefix}</Text>
        )}
        <RNTextInput
          className="flex-1 text-base text-stone-900"
          placeholderTextColor="#B45309"
          {...props}
        />
        {suffix && (
          <Text className="text-brand-600 ml-1 text-base">{suffix}</Text>
        )}
      </View>
      {error && <Text className="text-sm text-red-500 mt-1">{error}</Text>}
      {hint && !error && <Text className="text-xs text-brand-600 mt-1">{hint}</Text>}
    </View>
  );
}
