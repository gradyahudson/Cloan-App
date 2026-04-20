import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── LEVEL DEFINITIONS ─────────────────────────────────────────────────────

export interface Level {
  level: number;
  name: string;
  emoji: string;
  minXP: number;
  maxXP: number;
  color: string;
  description: string;
  // Avatar cosmetics unlocked at this level
  unlockedCosmetics: string[];
}

export const LEVELS: Level[] = [
  {
    level: 1, name: "Seedling", emoji: "🌱", minXP: 0, maxXP: 500,
    color: "#86EFAC", description: "Every forest starts with a single seed.",
    unlockedCosmetics: ["avatar_seedling"],
  },
  {
    level: 2, name: "Sprout", emoji: "🌿", minXP: 500, maxXP: 1500,
    color: "#4ADE80", description: "You're growing. The roots are deepening.",
    unlockedCosmetics: ["avatar_sprout", "badge_frame_green"],
  },
  {
    level: 3, name: "Sapling", emoji: "🌳", minXP: 1500, maxXP: 4000,
    color: "#FBBF24", description: "A sapling bends but doesn't break. Neither do you.",
    unlockedCosmetics: ["avatar_sapling", "badge_frame_amber", "streak_glow"],
  },
  {
    level: 4, name: "Tree", emoji: "🌲", minXP: 4000, maxXP: 10000,
    color: "#F59E0B", description: "Strong, steady, and growing taller every month.",
    unlockedCosmetics: ["avatar_tree", "badge_frame_gold", "xp_multiplier_1_25"],
  },
  {
    level: 5, name: "Forest", emoji: "🌳🌲🌿", minXP: 10000, maxXP: Infinity,
    color: "#D97706", description: "You are the forest. Debt doesn't live here.",
    unlockedCosmetics: ["avatar_forest", "badge_frame_legendary", "xp_multiplier_1_5", "crew_leader"],
  },
];

export function getLevelForXP(xp: number): Level {
  return LEVELS.slice().reverse().find((l) => xp >= l.minXP) ?? LEVELS[0];
}

export function getXPProgress(xp: number): number {
  const level = getLevelForXP(xp);
  if (level.maxXP === Infinity) return 1;
  const range = level.maxXP - level.minXP;
  const progress = xp - level.minXP;
  return Math.min(progress / range, 1);
}

export function getXPToNextLevel(xp: number): number {
  const level = getLevelForXP(xp);
  if (level.maxXP === Infinity) return 0;
  return level.maxXP - xp;
}

// ─── XP ACTIONS ────────────────────────────────────────────────────────────

export type XPAction =
  | "ROUNDUP_MADE"           // +10 XP
  | "EXTRA_PAYMENT"          // +50 XP
  | "LOAN_PAID_OFF"          // +500 XP
  | "ARTICLE_READ"           // +25 XP
  | "DAILY_CHALLENGE"        // +50 XP (base, varies by challenge)
  | "STREAK_7"               // +100 XP
  | "STREAK_30"              // +300 XP
  | "STREAK_100"             // +1000 XP
  | "SAVINGS_GOAL_CREATED"   // +20 XP
  | "SAVINGS_GOAL_HIT"       // +150 XP
  | "BANK_LINKED"            // +75 XP
  | "PROFILE_COMPLETE"       // +50 XP
  | "CREW_JOINED"            // +30 XP
  | "CREW_CHALLENGE_WON"     // +200 XP
  | "WHAT_IF_USED"           // +10 XP
  | "LIFE_EVENT_SET"         // +15 XP
  | "MANUAL_PAYMENT_LOGGED"  // +30 XP;

export const XP_VALUES: Record<XPAction, number> = {
  ROUNDUP_MADE: 10,
  EXTRA_PAYMENT: 50,
  LOAN_PAID_OFF: 500,
  ARTICLE_READ: 25,
  DAILY_CHALLENGE: 50,
  STREAK_7: 100,
  STREAK_30: 300,
  STREAK_100: 1000,
  SAVINGS_GOAL_CREATED: 20,
  SAVINGS_GOAL_HIT: 150,
  BANK_LINKED: 75,
  PROFILE_COMPLETE: 50,
  CREW_JOINED: 30,
  CREW_CHALLENGE_WON: 200,
  WHAT_IF_USED: 10,
  LIFE_EVENT_SET: 15,
  MANUAL_PAYMENT_LOGGED: 30,
};

export interface XPEvent {
  id: string;
  action: XPAction;
  amount: number;
  label: string;
  timestamp: string;
}

// ─── CHALLENGE DEFINITIONS ─────────────────────────────────────────────────

export interface Challenge {
  id: string;
  emoji: string;
  title: string;
  description: string;
  xpReward: number;
  dollarReward?: number; // extra dollars toward loan
  action: XPAction;
  category: "spending" | "payment" | "learning" | "streak" | "social";
}

export const ALL_CHALLENGES: Challenge[] = [
  // Spending challenges
  { id: "skip_dining", emoji: "☕", title: "Skip dining out today", description: "Cook at home or pack lunch — redirect that $15+ toward your loan.", xpReward: 50, dollarReward: 10, action: "DAILY_CHALLENGE", category: "spending" },
  { id: "skip_coffee", emoji: "🫖", title: "Make coffee at home", description: "Skip the café run today. $5 saved = $5 toward your loan.", xpReward: 35, dollarReward: 5, action: "DAILY_CHALLENGE", category: "spending" },
  { id: "no_impulse", emoji: "🛑", title: "No impulse purchases", description: "If you see something you want online today, close the tab.", xpReward: 40, action: "DAILY_CHALLENGE", category: "spending" },
  { id: "brown_bag", emoji: "🥪", title: "Brown bag it", description: "Bring lunch from home. Average savings: $12.", xpReward: 45, dollarReward: 12, action: "DAILY_CHALLENGE", category: "spending" },
  { id: "no_subscriptions", emoji: "📱", title: "Audit one subscription", description: "Find one subscription you haven't used in 30 days. Cancel it.", xpReward: 60, action: "DAILY_CHALLENGE", category: "spending" },
  { id: "free_fun", emoji: "🌳", title: "Free fun only today", description: "Park, trail, library, home — entertainment doesn't need a receipt.", xpReward: 40, action: "DAILY_CHALLENGE", category: "spending" },

  // Payment challenges
  { id: "extra_5", emoji: "💸", title: "Add $5 extra today", description: "Make a $5 extra payment to your target loan right now.", xpReward: 75, action: "EXTRA_PAYMENT", category: "payment" },
  { id: "extra_10", emoji: "💵", title: "Add $10 extra today", description: "$10 toward principal — that's 2–4 days of interest wiped out.", xpReward: 100, action: "EXTRA_PAYMENT", category: "payment" },
  { id: "round_up_triple", emoji: "🪙", title: "Triple your next round-up", description: "Manually match your next round-up 3x.", xpReward: 65, action: "ROUNDUP_MADE", category: "payment" },
  { id: "log_payment", emoji: "✅", title: "Log a payment", description: "Record any payment you made — even minimum — in your history.", xpReward: 30, action: "MANUAL_PAYMENT_LOGGED", category: "payment" },

  // Learning challenges
  { id: "read_article", emoji: "📚", title: "Read one article", description: "Spend 5 minutes in the Learn tab today.", xpReward: 25, action: "ARTICLE_READ", category: "learning" },
  { id: "check_rate", emoji: "📊", title: "Check your interest rate", description: "Look up your exact APR on your highest-rate loan.", xpReward: 20, action: "DAILY_CHALLENGE", category: "learning" },
  { id: "what_if", emoji: "🔮", title: "Run a What-If scenario", description: "See how one change could affect your payoff date.", xpReward: 30, action: "WHAT_IF_USED", category: "learning" },
  { id: "check_pslf", emoji: "🏛️", title: "Check PSLF eligibility", description: "Does your employer qualify for Public Service Loan Forgiveness?", xpReward: 35, action: "DAILY_CHALLENGE", category: "learning" },

  // Streak / habit
  { id: "open_app", emoji: "🔥", title: "Open Cloan today", description: "Just showing up counts. Keep the streak alive.", xpReward: 15, action: "DAILY_CHALLENGE", category: "streak" },
  { id: "share_win", emoji: "🎉", title: "Share a win to the feed", description: "Post an anonymous milestone to the community.", xpReward: 40, action: "DAILY_CHALLENGE", category: "social" },
  { id: "savings_check", emoji: "🛡️", title: "Check your emergency fund", description: "Know where you stand on your safety net.", xpReward: 20, action: "DAILY_CHALLENGE", category: "streak" },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function getDailyChallenges(dateString: string): Challenge[] {
  const seed = dateString.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rand = seededRandom(seed);
  const shuffled = [...ALL_CHALLENGES].sort(() => rand() - 0.5);
  return shuffled.slice(0, 3);
}

// ─── STORE ─────────────────────────────────────────────────────────────────

interface CompletedChallenge {
  challengeId: string;
  date: string;
  xpEarned: number;
}

interface XPState {
  totalXP: number;
  xpHistory: XPEvent[];
  completedChallenges: CompletedChallenge[];
  pendingLevelUp: boolean;
  selectedCosmetics: string[];

  addXP: (action: XPAction, label: string, bonusXP?: number) => { newXP: number; leveledUp: boolean; newLevel?: Level };
  completeChallenge: (challengeId: string, xpReward: number) => void;
  isChallengeCompleted: (challengeId: string, date: string) => boolean;
  dismissLevelUp: () => void;
  equipCosmetic: (cosmeticId: string) => void;
}

export const useXPStore = create<XPState>()(
  persist(
    (set, get) => ({
      totalXP: 0,
      xpHistory: [],
      completedChallenges: [],
      pendingLevelUp: false,
      selectedCosmetics: ["avatar_seedling"],

      addXP: (action, label, bonusXP) => {
        const state = get();
        const baseXP = XP_VALUES[action];
        const earned = bonusXP ?? baseXP;
        const oldLevel = getLevelForXP(state.totalXP);
        const newXP = state.totalXP + earned;
        const newLevel = getLevelForXP(newXP);
        const leveledUp = newLevel.level > oldLevel.level;

        set({
          totalXP: newXP,
          pendingLevelUp: leveledUp ? true : state.pendingLevelUp,
          xpHistory: [
            {
              id: `xp_${Date.now()}`,
              action,
              amount: earned,
              label,
              timestamp: new Date().toISOString(),
            },
            ...state.xpHistory.slice(0, 99),
          ],
        });

        return { newXP, leveledUp, newLevel: leveledUp ? newLevel : undefined };
      },

      completeChallenge: (challengeId, xpReward) => {
        const date = new Date().toDateString();
        set((state) => ({
          completedChallenges: [
            ...state.completedChallenges,
            { challengeId, date, xpEarned: xpReward },
          ],
        }));
      },

      isChallengeCompleted: (challengeId, date) => {
        return get().completedChallenges.some(
          (c) => c.challengeId === challengeId && c.date === date
        );
      },

      dismissLevelUp: () => set({ pendingLevelUp: false }),

      equipCosmetic: (cosmeticId) =>
        set((state) => ({
          selectedCosmetics: state.selectedCosmetics.includes(cosmeticId)
            ? state.selectedCosmetics.filter((c) => c !== cosmeticId)
            : [...state.selectedCosmetics, cosmeticId],
        })),
    }),
    {
      name: "cloan-xp",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
