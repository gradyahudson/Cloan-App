export interface MilestoneDefinition {
  id: string;
  emoji: string;
  name: string;
  description: string;
  category: "streak" | "savings" | "payoff" | "engagement" | "education";
  secret?: boolean;
}

export const ALL_MILESTONES: MilestoneDefinition[] = [
  {
    id: "first_roundup",
    emoji: "🪙",
    name: "First Spare Change",
    description: "You made your first round-up. The snowball starts with one coin.",
    category: "engagement",
  },
  {
    id: "roundup_10",
    emoji: "⭐",
    name: "10 Round-ups",
    description: "10 purchases rounded up and working for you.",
    category: "engagement",
  },
  {
    id: "roundup_50",
    emoji: "🌟",
    name: "50 Round-ups",
    description: "50 round-ups strong. You're building serious momentum.",
    category: "engagement",
  },
  {
    id: "roundup_100",
    emoji: "💫",
    name: "Century Club",
    description: "100 round-ups. You're playing a different game now.",
    category: "engagement",
  },
  {
    id: "saved_10",
    emoji: "🌱",
    name: "First $10 Saved",
    description: "You've saved $10 in round-ups. Every dollar is a dollar closer.",
    category: "savings",
  },
  {
    id: "saved_50",
    emoji: "🌿",
    name: "$50 Milestone",
    description: "Fifty dollars in extra payments you didn't even miss.",
    category: "savings",
  },
  {
    id: "saved_100",
    emoji: "🌳",
    name: "Triple Digits",
    description: "$100 saved through round-ups and deposits. You're doing it.",
    category: "savings",
  },
  {
    id: "saved_500",
    emoji: "🎋",
    name: "$500 Toward Freedom",
    description: "Five hundred dollars closer to a debt-free life.",
    category: "savings",
  },
  {
    id: "saved_1000",
    emoji: "🏔️",
    name: "Four Figures",
    description: "$1,000 in extra loan payments. That's a big deal.",
    category: "savings",
  },
  {
    id: "streak_7",
    emoji: "🔥",
    name: "Week Warrior",
    description: "7 days active. You're building a habit.",
    category: "streak",
  },
  {
    id: "streak_30",
    emoji: "🌊",
    name: "Monthly Momentum",
    description: "30 days straight. This is who you are now.",
    category: "streak",
  },
  {
    id: "streak_100",
    emoji: "⚡",
    name: "100-Day Habit",
    description: "100 days. This isn't a streak anymore — it's your identity.",
    category: "streak",
  },
  {
    id: "first_loan_paid",
    emoji: "🎉",
    name: "First Loan Gone",
    description: "You paid off your first loan. THIS IS THE SNOWBALL. Roll it.",
    category: "payoff",
  },
  {
    id: "all_loans_paid",
    emoji: "👑",
    name: "Debt Free",
    description: "You did it. You're completely debt free. You changed your life.",
    category: "payoff",
  },
  {
    id: "halfway",
    emoji: "🏁",
    name: "Halfway There",
    description: "You've paid off 50% of your original loan balance.",
    category: "payoff",
  },
  {
    id: "snowball_rolling",
    emoji: "❄️",
    name: "Snowball Rolling",
    description: "3+ round-ups in a single week. The snowball is rolling.",
    category: "engagement",
    secret: true,
  },
  {
    id: "first_article",
    emoji: "📚",
    name: "Curious Mind",
    description: "You read your first article. Knowledge is the first step.",
    category: "education",
  },
  {
    id: "loan_added",
    emoji: "🗂️",
    name: "Visibility",
    description: "You faced your debt. That takes courage.",
    category: "engagement",
  },
];
