import { View, Text, ScrollView, TouchableOpacity, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useLoansStore, StoredLoan } from "@/lib/store/loans";
import { formatCents } from "@/lib/utils/currency";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

const LOAN_TYPES = [
  { value: "federal_subsidized", label: "Fed. Subsidized", emoji: "🏛️" },
  { value: "federal_unsubsidized", label: "Fed. Unsubsidized", emoji: "🏛️" },
  { value: "federal_plus", label: "PLUS Loan", emoji: "🏛️" },
  { value: "private", label: "Private", emoji: "🏦" },
  { value: "refinanced", label: "Refinanced", emoji: "🔄" },
  { value: "other", label: "Other", emoji: "📋" },
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

function LoanCard({ loan, onMarkPaidOff, onRemove }: {
  loan: StoredLoan;
  onMarkPaidOff: () => void;
  onRemove: () => void;
}) {
  const progress = 1 - loan.balanceCents / loan.originalBalanceCents;
  const type = LOAN_TYPES.find((t) => t.value === loan.loanType);
  const isPaidOff = loan.status === "paid_off";

  return (
    <Card variant={isPaidOff ? "highlight" : "elevated"}>
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center gap-x-3 flex-1">
          <View className={`w-11 h-11 rounded-2xl items-center justify-center ${isPaidOff ? "bg-brand-300" : "bg-brand-100"}`}>
            <Text className="text-xl">{isPaidOff ? "✅" : type?.emoji ?? "📋"}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-bold text-brand-900">{loan.name}</Text>
            <Text className="text-brand-600 text-sm">{loan.servicer}</Text>
          </View>
        </View>
        {isPaidOff && (
          <View className="bg-brand-400 rounded-xl px-2 py-1">
            <Text className="text-xs font-bold text-brand-900">PAID OFF 🎉</Text>
          </View>
        )}
      </View>

      {!isPaidOff && (
        <>
          <View className="flex-row justify-between mb-2">
            <Text className="text-2xl font-bold text-brand-900">
              {formatCents(loan.balanceCents)}
            </Text>
            <Text className="text-sm text-brand-500 self-end">
              of {formatCents(loan.originalBalanceCents)}
            </Text>
          </View>

          <ProgressBar progress={progress} showPercent height={8} />

          <View className="flex-row justify-between mt-3 pt-3 border-t border-brand-100">
            <View>
              <Text className="text-xs text-brand-500">Interest rate</Text>
              <Text className="font-semibold text-brand-900">
                {(loan.interestRateBps / 100).toFixed(2)}%
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs text-brand-500">Min. payment</Text>
              <Text className="font-semibold text-brand-900">
                {formatCents(loan.minimumPaymentCents)}/mo
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-brand-500">Daily interest</Text>
              <Text className="font-semibold text-red-500">
                {formatCents(Math.round((loan.balanceCents * (loan.interestRateBps / 10000)) / 365))}/day
              </Text>
            </View>
          </View>

          <View className="flex-row gap-x-2 mt-3">
            <TouchableOpacity
              className="flex-1 py-2 rounded-xl bg-brand-400 items-center"
              onPress={onMarkPaidOff}
            >
              <Text className="text-xs font-bold text-brand-900">Mark paid off</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-2 rounded-xl bg-red-50 items-center"
              onPress={onRemove}
            >
              <Text className="text-xs font-semibold text-red-400">Remove</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </Card>
  );
}

export default function LoansScreen() {
  const { loans, addLoan, markPaidOff, removeLoan, strategy } = useLoansStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<LoanFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<LoanFormData>>({});

  const activeLoans = loans.filter((l) => l.status === "active");
  const paidOffLoans = loans.filter((l) => l.status === "paid_off");

  const sortedActive = [...activeLoans].sort((a, b) =>
    strategy === "snowball"
      ? a.balanceCents - b.balanceCents
      : b.interestRateBps - a.interestRateBps
  );

  const validate = () => {
    const e: Partial<LoanFormData> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.servicer.trim()) e.servicer = "Required";
    if (!form.balanceDollars || isNaN(Number(form.balanceDollars))) e.balanceDollars = "Invalid amount";
    if (!form.interestRatePercent || isNaN(Number(form.interestRatePercent))) e.interestRatePercent = "Invalid rate";
    if (!form.minimumPaymentDollars || isNaN(Number(form.minimumPaymentDollars))) e.minimumPaymentDollars = "Invalid amount";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const balanceCents = Math.round(Number(form.balanceDollars) * 100);
    addLoan({
      name: form.name.trim(),
      servicer: form.servicer.trim(),
      loanType: form.loanType as any,
      balanceCents,
      originalBalanceCents: balanceCents,
      interestRateBps: Math.round(Number(form.interestRatePercent) * 100),
      minimumPaymentCents: Math.round(Number(form.minimumPaymentDollars) * 100),
      status: "active",
    });
    setForm(emptyForm);
    setErrors({});
    setShowModal(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-2 flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-brand-900">Your loans</Text>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            className="bg-brand-400 rounded-full w-9 h-9 items-center justify-center"
          >
            <Text className="text-brand-900 font-bold text-xl">+</Text>
          </TouchableOpacity>
        </View>

        <View className="px-6 gap-y-4 pb-8">
          {/* Summary */}
          {activeLoans.length > 0 && (
            <View className="bg-brand-900 rounded-2xl p-4 flex-row justify-between">
              <View>
                <Text className="text-brand-400 text-xs">Total balance</Text>
                <Text className="text-white font-bold text-xl mt-0.5">
                  {formatCents(activeLoans.reduce((s, l) => s + l.balanceCents, 0))}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-brand-400 text-xs">Avg. rate</Text>
                <Text className="text-white font-bold text-xl mt-0.5">
                  {(
                    activeLoans.reduce((s, l) => s + l.interestRateBps, 0) /
                    activeLoans.length /
                    100
                  ).toFixed(2)}%
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-brand-400 text-xs">Min. monthly</Text>
                <Text className="text-white font-bold text-xl mt-0.5">
                  {formatCents(activeLoans.reduce((s, l) => s + l.minimumPaymentCents, 0))}
                </Text>
              </View>
            </View>
          )}

          {/* Active loans */}
          {sortedActive.map((loan, idx) => (
            <View key={loan.id}>
              {idx === 0 && strategy !== "proportional" && (
                <View className="flex-row items-center gap-x-2 mb-1">
                  <Text className="text-xs font-bold text-brand-600 uppercase tracking-wide">
                    {strategy === "snowball" ? "❄️ Snowball order" : "🏔️ Avalanche order"}
                  </Text>
                </View>
              )}
              <LoanCard
                loan={loan}
                onMarkPaidOff={() =>
                  Alert.alert("Mark as paid off?", `This will mark "${loan.name}" as fully paid.`, [
                    { text: "Cancel", style: "cancel" },
                    { text: "Yes, paid off! 🎉", onPress: () => markPaidOff(loan.id) },
                  ])
                }
                onRemove={() =>
                  Alert.alert("Remove loan", `Remove "${loan.name}"?`, [
                    { text: "Cancel", style: "cancel" },
                    { text: "Remove", style: "destructive", onPress: () => removeLoan(loan.id) },
                  ])
                }
              />
            </View>
          ))}

          {/* Paid off */}
          {paidOffLoans.length > 0 && (
            <>
              <Text className="text-sm font-bold text-brand-600 uppercase tracking-wide mt-2">
                🎉 Paid off
              </Text>
              {paidOffLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onMarkPaidOff={() => {}}
                  onRemove={() => removeLoan(loan.id)}
                />
              ))}
            </>
          )}

          {loans.length === 0 && (
            <Card variant="highlight">
              <Text className="text-center font-semibold text-brand-800 mb-2">No loans yet</Text>
              <Text className="text-center text-brand-600 text-sm">
                Tap + to add your first loan and start your debt snowball.
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Add loan modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-brand-50 p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-brand-900">Add a loan</Text>
            <TouchableOpacity onPress={() => { setShowModal(false); setForm(emptyForm); setErrors({}); }}>
              <Text className="text-brand-600 font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-y-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
                <View className="flex-row px-1 gap-x-2">
                  {LOAN_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      onPress={() => setForm((f) => ({ ...f, loanType: type.value }))}
                      className={`px-3 py-2 rounded-xl border flex-row items-center gap-x-1.5 ${
                        form.loanType === type.value ? "bg-brand-400 border-brand-400" : "bg-white border-brand-200"
                      }`}
                    >
                      <Text>{type.emoji}</Text>
                      <Text className={`text-xs font-medium ${form.loanType === type.value ? "text-brand-900" : "text-brand-600"}`}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TextInput label="Loan nickname" placeholder='e.g. "Nelnet Subsidized #1"' value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} error={errors.name} />
              <TextInput label="Servicer" placeholder="Nelnet, MOHELA, Aidvantage..." value={form.servicer} onChangeText={(v) => setForm((f) => ({ ...f, servicer: v }))} error={errors.servicer} />
              <TextInput label="Current balance" placeholder="0.00" prefix="$" keyboardType="decimal-pad" value={form.balanceDollars} onChangeText={(v) => setForm((f) => ({ ...f, balanceDollars: v }))} error={errors.balanceDollars} />
              <TextInput label="Interest rate (APR)" placeholder="6.50" suffix="%" keyboardType="decimal-pad" value={form.interestRatePercent} onChangeText={(v) => setForm((f) => ({ ...f, interestRatePercent: v }))} error={errors.interestRatePercent} />
              <TextInput label="Minimum monthly payment" placeholder="0.00" prefix="$" keyboardType="decimal-pad" value={form.minimumPaymentDollars} onChangeText={(v) => setForm((f) => ({ ...f, minimumPaymentDollars: v }))} error={errors.minimumPaymentDollars} />

              <Button label="Save loan" onPress={handleSave} variant="primary" size="lg" />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
