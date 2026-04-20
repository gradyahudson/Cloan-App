import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Strategy } from "@/lib/utils/snowball";

export interface StoredLoan {
  id: string;
  name: string;
  servicer: string;
  loanType: "federal_subsidized" | "federal_unsubsidized" | "federal_plus" | "private" | "refinanced" | "other";
  balanceCents: number;
  originalBalanceCents: number;
  interestRateBps: number;
  minimumPaymentCents: number;
  nextPaymentDate?: string;
  status: "active" | "paid_off" | "deferred";
  createdAt: string;
  payments: StoredPayment[];
}

export interface StoredPayment {
  id: string;
  amountCents: number;
  date: string;
  isCloanPayment: boolean;
  note?: string;
}

export interface RoundupEntry {
  id: string;
  merchantName: string;
  originalCents: number;
  roundupCents: number;
  date: string;
  status: "pending" | "batched" | "applied";
}

interface LoansState {
  loans: StoredLoan[];
  roundups: RoundupEntry[];
  accumulatedCents: number;
  strategy: Strategy;
  roundupsEnabled: boolean;
  weeklyDepositCents: number;
  streakDays: number;
  lastActivityDate: string | null;
  earnedMilestoneIds: string[];

  addLoan: (loan: Omit<StoredLoan, "id" | "createdAt" | "payments">) => void;
  updateLoan: (id: string, updates: Partial<StoredLoan>) => void;
  markPaidOff: (id: string) => void;
  removeLoan: (id: string) => void;
  addRoundup: (roundup: Omit<RoundupEntry, "id">) => void;
  addPayment: (loanId: string, payment: Omit<StoredPayment, "id">) => void;
  setStrategy: (strategy: Strategy) => void;
  setRoundupsEnabled: (enabled: boolean) => void;
  setWeeklyDeposit: (cents: number) => void;
  earnMilestone: (id: string) => void;
  incrementStreak: () => void;
}

export const useLoansStore = create<LoansState>()(
  persist(
    (set) => ({
      loans: [],
      roundups: [],
      accumulatedCents: 0,
      strategy: "snowball",
      roundupsEnabled: true,
      weeklyDepositCents: 0,
      streakDays: 0,
      lastActivityDate: null,
      earnedMilestoneIds: [],

      addLoan: (loan) =>
        set((state) => ({
          loans: [
            ...state.loans,
            {
              ...loan,
              id: `loan_${Date.now()}`,
              createdAt: new Date().toISOString(),
              payments: [],
            },
          ],
        })),

      updateLoan: (id, updates) =>
        set((state) => ({
          loans: state.loans.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        })),

      markPaidOff: (id) =>
        set((state) => ({
          loans: state.loans.map((l) =>
            l.id === id ? { ...l, status: "paid_off", balanceCents: 0 } : l
          ),
        })),

      removeLoan: (id) =>
        set((state) => ({ loans: state.loans.filter((l) => l.id !== id) })),

      addRoundup: (roundup) =>
        set((state) => ({
          roundups: [
            { ...roundup, id: `ru_${Date.now()}` },
            ...state.roundups,
          ],
          accumulatedCents: state.accumulatedCents + roundup.roundupCents,
        })),

      addPayment: (loanId, payment) =>
        set((state) => ({
          loans: state.loans.map((l) =>
            l.id === loanId
              ? {
                  ...l,
                  payments: [
                    ...l.payments,
                    { ...payment, id: `pay_${Date.now()}` },
                  ],
                  balanceCents: Math.max(0, l.balanceCents - payment.amountCents),
                }
              : l
          ),
        })),

      setStrategy: (strategy) => set({ strategy }),
      setRoundupsEnabled: (enabled) => set({ roundupsEnabled: enabled }),
      setWeeklyDeposit: (cents) => set({ weeklyDepositCents: cents }),

      earnMilestone: (id) =>
        set((state) => ({
          earnedMilestoneIds: state.earnedMilestoneIds.includes(id)
            ? state.earnedMilestoneIds
            : [...state.earnedMilestoneIds, id],
        })),

      incrementStreak: () =>
        set((state) => {
          const today = new Date().toDateString();
          if (state.lastActivityDate === today) return state;
          return {
            streakDays: state.streakDays + 1,
            lastActivityDate: today,
          };
        }),
    }),
    {
      name: "cloan-loans",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
