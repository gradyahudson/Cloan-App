import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavingsGoal {
  id: string;
  name: string;
  emoji: string;
  targetCents: number;
  currentCents: number;
  color: string;
  category: "emergency" | "vacation" | "car" | "wedding" | "home" | "education" | "custom";
  isEmergencyFund: boolean;
  monthlyContributionCents: number;
  createdAt: string;
  completedAt?: string;
}

export interface RoundupSplit {
  loanPercent: number;   // 0–100
  savingsPercent: number; // 0–100; loanPercent + savingsPercent = 100
  savingsGoalId?: string; // which goal gets the savings portion
}

const GOAL_COLORS: Record<SavingsGoal["category"], string> = {
  emergency: "#F59E0B",
  vacation: "#60A5FA",
  car: "#34D399",
  wedding: "#F472B6",
  home: "#A78BFA",
  education: "#FB923C",
  custom: "#94A3B8",
};

const GOAL_EMOJIS: Record<SavingsGoal["category"], string> = {
  emergency: "🛡️",
  vacation: "✈️",
  car: "🚗",
  wedding: "💍",
  home: "🏡",
  education: "🎓",
  custom: "🎯",
};

export function getGoalColor(category: SavingsGoal["category"]) {
  return GOAL_COLORS[category];
}

export function getGoalEmoji(category: SavingsGoal["category"]) {
  return GOAL_EMOJIS[category];
}

export function projectGoalCompletion(goal: SavingsGoal): Date | null {
  if (goal.monthlyContributionCents <= 0) return null;
  const remaining = goal.targetCents - goal.currentCents;
  if (remaining <= 0) return new Date();
  const monthsNeeded = Math.ceil(remaining / goal.monthlyContributionCents);
  const date = new Date();
  date.setMonth(date.getMonth() + monthsNeeded);
  return date;
}

interface SavingsState {
  goals: SavingsGoal[];
  roundupSplit: RoundupSplit;

  addGoal: (goal: Omit<SavingsGoal, "id" | "currentCents" | "createdAt">) => string;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  contributeToGoal: (id: string, amountCents: number) => void;
  removeGoal: (id: string) => void;
  setRoundupSplit: (split: RoundupSplit) => void;
  getEmergencyFund: () => SavingsGoal | undefined;
  getTotalSaved: () => number;
}

export const useSavingsStore = create<SavingsState>()(
  persist(
    (set, get) => ({
      goals: [],
      roundupSplit: { loanPercent: 100, savingsPercent: 0 },

      addGoal: (goal) => {
        const id = `goal_${Date.now()}`;
        set((state) => ({
          goals: [
            ...state.goals,
            { ...goal, id, currentCents: 0, createdAt: new Date().toISOString() },
          ],
        }));
        return id;
      },

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),

      contributeToGoal: (id, amountCents) =>
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.id !== id) return g;
            const newAmount = g.currentCents + amountCents;
            const completed = newAmount >= g.targetCents && !g.completedAt;
            return {
              ...g,
              currentCents: Math.min(newAmount, g.targetCents),
              completedAt: completed ? new Date().toISOString() : g.completedAt,
            };
          }),
        })),

      removeGoal: (id) =>
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),

      setRoundupSplit: (split) => set({ roundupSplit: split }),

      getEmergencyFund: () => get().goals.find((g) => g.isEmergencyFund),

      getTotalSaved: () =>
        get().goals.reduce((sum, g) => sum + g.currentCents, 0),
    }),
    {
      name: "cloan-savings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
