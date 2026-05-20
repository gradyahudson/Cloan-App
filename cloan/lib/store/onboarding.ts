import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Loan, Strategy } from "@/lib/utils/snowball";

interface OnboardingLoan extends Omit<Loan, "id"> {
  id: string;
  servicer: string;
  loanType: string;
}

interface OnboardingState {
  completed: boolean;
  currentStep: number;
  loans: OnboardingLoan[];
  strategy: Strategy;
  extraMonthlyCents: number;
  roundupsEnabled: boolean;
  weeklyDepositCents: number;

  setStep: (step: number) => void;
  addLoan: (loan: Omit<OnboardingLoan, "id">) => void;
  updateLoan: (id: string, updates: Partial<OnboardingLoan>) => void;
  removeLoan: (id: string) => void;
  setStrategy: (strategy: Strategy) => void;
  setExtraMonthly: (cents: number) => void;
  setRoundupsEnabled: (enabled: boolean) => void;
  setWeeklyDeposit: (cents: number) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      currentStep: 0,
      loans: [],
      strategy: "snowball",
      extraMonthlyCents: 0,
      roundupsEnabled: true,
      weeklyDepositCents: 0,

      setStep: (step) => set({ currentStep: step }),

      addLoan: (loan) =>
        set((state) => ({
          loans: [
            ...state.loans,
            { ...loan, id: `loan_${Date.now()}_${Math.random().toString(36).slice(2)}` },
          ],
        })),

      updateLoan: (id, updates) =>
        set((state) => ({
          loans: state.loans.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        })),

      removeLoan: (id) =>
        set((state) => ({ loans: state.loans.filter((l) => l.id !== id) })),

      setStrategy: (strategy) => set({ strategy }),
      setExtraMonthly: (cents) => set({ extraMonthlyCents: cents }),
      setRoundupsEnabled: (enabled) => set({ roundupsEnabled: enabled }),
      setWeeklyDeposit: (cents) => set({ weeklyDepositCents: cents }),

      completeOnboarding: () => set({ completed: true }),

      reset: () =>
        set({
          completed: false,
          currentStep: 0,
          loans: [],
          strategy: "snowball",
          extraMonthlyCents: 0,
          roundupsEnabled: true,
          weeklyDepositCents: 0,
        }),
    }),
    {
      name: "cloan-onboarding",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
