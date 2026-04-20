import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Card } from "@/components/ui/Card";
import { formatCents } from "@/lib/utils/currency";

const LOAN_TYPES = [
  { value: "federal_subsidized", label: "Federal Subsidized", emoji: "🏛️" },
  { value: "federal_unsubsidized", label: "Federal Unsubsidized", emoji: "🏛️" },
  { value: "federal_plus", label: "Federal PLUS", emoji: "🏛️" },
  { value: "private", label: "Private Loan", emoji: "🏦" },
  { value: "refinanced", label: "Refinanced", emoji: "🔄" },
  { value: "other", label: "Other", emoji: "📋" },
];

const COMMON_SERVICERS = [
  "Nelnet", "MOHELA", "Aidvantage", "Navient", "Great Lakes",
  "PHEAA", "HESC", "OSFA", "EdFinancial", "Firstmark",
];

interface LoanFormData {
  name: string;
  servicer: string;
  loanType: string;
  balanceDollars: string;
  interestRatePercent: string;
  minimumPaymentDollars: string;
}

const emptyForm: LoanFormData = {
  name: "",
  servicer: "",
  loanType: "federal_subsidized",
  balanceDollars: "",
  interestRatePercent: "",
  minimumPaymentDollars: "",
};

export default function LinkLoansScreen() {
  const router = useRouter();
  const { loans, addLoan, removeLoan, setStep } = useOnboardingStore();
  const [showForm, setShowForm] = useState(loans.length === 0);
  const [form, setForm] = useState<LoanFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<LoanFormData>>({});

  const validate = (): boolean => {
    const newErrors: Partial<LoanFormData> = {};
    if (!form.name.trim()) newErrors.name = "Give this loan a name";
    if (!form.servicer.trim()) newErrors.servicer = "Enter your loan servicer";
    if (!form.balanceDollars || isNaN(Number(form.balanceDollars)) || Number(form.balanceDollars) <= 0)
      newErrors.balanceDollars = "Enter your current balance";
    if (!form.interestRatePercent || isNaN(Number(form.interestRatePercent)))
      newErrors.interestRatePercent = "Enter your interest rate";
    if (!form.minimumPaymentDollars || isNaN(Number(form.minimumPaymentDollars)))
      newErrors.minimumPaymentDollars = "Enter your minimum monthly payment";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddLoan = () => {
    if (!validate()) return;
    addLoan({
      name: form.name.trim(),
      servicer: form.servicer.trim(),
      loanType: form.loanType,
      balanceCents: Math.round(Number(form.balanceDollars) * 100),
      interestRateBps: Math.round(Number(form.interestRatePercent) * 100),
      minimumPaymentCents: Math.round(Number(form.minimumPaymentDollars) * 100),
    });
    setForm(emptyForm);
    setErrors({});
    setShowForm(false);
  };

  const totalBalance = loans.reduce((sum, l) => sum + l.balanceCents, 0);
  const totalMinimum = loans.reduce((sum, l) => sum + l.minimumPaymentCents, 0);

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      {/* Progress bar */}
      <View className="flex-row px-6 pt-4 gap-x-2">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            className={`flex-1 h-1.5 rounded-full ${i <= 1 ? "bg-brand-400" : "bg-brand-200"}`}
          />
        ))}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-brand-900">Add your loans</Text>
          <Text className="text-brand-600 mt-1 leading-relaxed">
            Enter each loan manually. Find these on your servicer's website or your latest statement.
          </Text>

          {/* Existing loans */}
          {loans.length > 0 && (
            <View className="mt-5 gap-y-3">
              {loans.map((loan) => {
                const type = LOAN_TYPES.find((t) => t.value === loan.loanType);
                return (
                  <Card key={loan.id} variant="elevated">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-row items-center gap-x-3 flex-1">
                        <View className="w-10 h-10 rounded-xl bg-brand-100 items-center justify-center">
                          <Text className="text-lg">{type?.emoji ?? "📋"}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-semibold text-brand-900">{loan.name}</Text>
                          <Text className="text-brand-600 text-sm">{loan.servicer}</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="font-bold text-brand-900">
                          {formatCents(loan.balanceCents)}
                        </Text>
                        <Text className="text-xs text-brand-500">
                          {(loan.interestRateBps / 100).toFixed(2)}% APR
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-brand-100">
                      <Text className="text-sm text-brand-600">
                        Min. payment: <Text className="font-semibold">{formatCents(loan.minimumPaymentCents)}/mo</Text>
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert("Remove loan", "Remove this loan?", [
                            { text: "Cancel", style: "cancel" },
                            { text: "Remove", style: "destructive", onPress: () => removeLoan(loan.id) },
                          ])
                        }
                      >
                        <Text className="text-red-400 text-sm">Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })}

              {/* Summary */}
              <View className="bg-brand-400 rounded-2xl p-4 flex-row justify-between">
                <View>
                  <Text className="text-brand-800 text-xs font-medium">Total balance</Text>
                  <Text className="text-brand-900 text-xl font-bold">{formatCents(totalBalance)}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-brand-800 text-xs font-medium">Min. monthly</Text>
                  <Text className="text-brand-900 text-xl font-bold">{formatCents(totalMinimum)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Add loan form */}
          {showForm && (
            <View className="mt-5 bg-white rounded-2xl p-5 border border-brand-200">
              <Text className="font-bold text-brand-900 text-lg mb-4">
                {loans.length === 0 ? "Add your first loan" : "Add another loan"}
              </Text>

              {/* Loan type picker */}
              <Text className="text-sm font-semibold text-brand-800 mb-2">Loan type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-1">
                <View className="flex-row px-1 gap-x-2">
                  {LOAN_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      onPress={() => setForm((f) => ({ ...f, loanType: type.value }))}
                      className={`px-3 py-2 rounded-xl border flex-row items-center gap-x-1.5 ${
                        form.loanType === type.value
                          ? "bg-brand-400 border-brand-400"
                          : "bg-white border-brand-200"
                      }`}
                    >
                      <Text className="text-base">{type.emoji}</Text>
                      <Text
                        className={`text-xs font-medium ${
                          form.loanType === type.value ? "text-brand-900" : "text-brand-600"
                        }`}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View className="gap-y-4">
                <TextInput
                  label="Loan nickname"
                  placeholder='e.g. "Nelnet Subsidized #1"'
                  value={form.name}
                  onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                  error={errors.name}
                />

                <View>
                  <Text className="text-sm font-semibold text-brand-800 mb-1.5">Servicer</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2 -mx-1">
                    <View className="flex-row px-1 gap-x-2">
                      {COMMON_SERVICERS.map((s) => (
                        <TouchableOpacity
                          key={s}
                          onPress={() => setForm((f) => ({ ...f, servicer: s }))}
                          className={`px-3 py-1.5 rounded-lg border ${
                            form.servicer === s
                              ? "bg-brand-300 border-brand-400"
                              : "bg-brand-50 border-brand-200"
                          }`}
                        >
                          <Text className="text-xs font-medium text-brand-800">{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                  <TextInput
                    placeholder="Or type servicer name"
                    value={form.servicer}
                    onChangeText={(v) => setForm((f) => ({ ...f, servicer: v }))}
                    error={errors.servicer}
                  />
                </View>

                <TextInput
                  label="Current balance"
                  placeholder="0.00"
                  prefix="$"
                  keyboardType="decimal-pad"
                  value={form.balanceDollars}
                  onChangeText={(v) => setForm((f) => ({ ...f, balanceDollars: v }))}
                  error={errors.balanceDollars}
                  hint="Find this on your servicer's website under 'Current balance'"
                />

                <TextInput
                  label="Interest rate (APR)"
                  placeholder="0.00"
                  suffix="%"
                  keyboardType="decimal-pad"
                  value={form.interestRatePercent}
                  onChangeText={(v) => setForm((f) => ({ ...f, interestRatePercent: v }))}
                  error={errors.interestRatePercent}
                  hint="Federal loans: usually 4.99%–7.54% depending on year"
                />

                <TextInput
                  label="Minimum monthly payment"
                  placeholder="0.00"
                  prefix="$"
                  keyboardType="decimal-pad"
                  value={form.minimumPaymentDollars}
                  onChangeText={(v) => setForm((f) => ({ ...f, minimumPaymentDollars: v }))}
                  error={errors.minimumPaymentDollars}
                />

                <View className="flex-row gap-x-3 mt-1">
                  <View className="flex-1">
                    <Button
                      label="Save loan"
                      onPress={handleAddLoan}
                      variant="primary"
                    />
                  </View>
                  {loans.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setShowForm(false)}
                      className="px-4 py-4 rounded-full bg-brand-100 items-center justify-center"
                    >
                      <Text className="text-brand-700 font-semibold">Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Add another button */}
          {!showForm && loans.length > 0 && (
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              className="mt-4 flex-row items-center justify-center py-3 border border-dashed border-brand-300 rounded-2xl"
            >
              <Text className="text-brand-600 font-semibold">+ Add another loan</Text>
            </TouchableOpacity>
          )}

          {/* Bottom padding for scroll */}
          <View className="h-10" />
        </View>
      </ScrollView>

      {/* Continue button */}
      <View className="px-6 pb-6 pt-3 bg-brand-50 border-t border-brand-100">
        <Button
          label={loans.length > 0 ? `Continue with ${loans.length} loan${loans.length > 1 ? "s" : ""}` : "Skip for now"}
          onPress={() => {
            setStep(2);
            router.push("/(onboarding)/payoff-compare");
          }}
          variant={loans.length > 0 ? "primary" : "secondary"}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}
