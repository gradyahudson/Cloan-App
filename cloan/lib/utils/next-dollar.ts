import type { StoredLoan } from "@/lib/store/loans";
import type { SavingsGoal } from "@/lib/store/savings";

export interface NextDollarRecommendation {
  priority: number;
  emoji: string;
  title: string;
  action: string;
  reason: string;
  amountSuggestion?: number; // cents
  urgency: "critical" | "high" | "medium" | "low";
}

export interface NextDollarInput {
  loans: StoredLoan[];
  savingsGoals: SavingsGoal[];
  monthlyIncomeCents?: number;
  hasEmergencyFund: boolean;
  emergencyFundProgress: number; // 0–1
  highestCreditCardRateBps?: number;
  hasEmployer401kMatch?: boolean;
}

export function getNextDollarRecommendations(input: NextDollarInput): NextDollarRecommendation[] {
  const {
    loans,
    savingsGoals,
    hasEmergencyFund,
    emergencyFundProgress,
    highestCreditCardRateBps = 0,
    hasEmployer401kMatch = false,
  } = input;

  const recs: NextDollarRecommendation[] = [];
  const activeLoans = loans.filter((l) => l.status === "active");
  const highRateLoans = activeLoans.filter((l) => l.interestRateBps >= 800);

  // Step 1: Emergency fund below 100%
  if (!hasEmergencyFund || emergencyFundProgress < 1) {
    recs.push({
      priority: 1,
      emoji: "🛡️",
      title: "Build your emergency fund",
      action: "Add to Emergency Fund",
      reason: emergencyFundProgress < 0.5
        ? "Without a safety net, one unexpected expense could derail your loan progress. Build this first."
        : "You're close! Completing your emergency fund protects everything else you're building.",
      urgency: emergencyFundProgress < 0.25 ? "critical" : "high",
    });
  }

  // Step 2: Free employer 401k match
  if (hasEmployer401kMatch) {
    recs.push({
      priority: 2,
      emoji: "🎁",
      title: "Capture employer 401k match",
      action: "Increase 401k contribution",
      reason: "Your employer match is a 50–100% guaranteed return. Nothing beats free money — contribute at least enough to get the full match before extra loan payments.",
      urgency: "high",
    });
  }

  // Step 3: High-rate credit card debt (>15% APR)
  if (highestCreditCardRateBps > 1500) {
    recs.push({
      priority: 3,
      emoji: "💳",
      title: `Pay down ${(highestCreditCardRateBps / 100).toFixed(0)}% credit card debt`,
      action: "Pay credit card first",
      reason: `At ${(highestCreditCardRateBps / 100).toFixed(0)}% APR, your credit card is charging more interest per dollar than your student loans. Eliminate it first, then redirect to loans.`,
      urgency: "critical",
    });
  }

  // Step 4: High-rate private student loans (>8%)
  if (highRateLoans.length > 0) {
    const worst = highRateLoans.sort((a, b) => b.interestRateBps - a.interestRateBps)[0];
    recs.push({
      priority: 4,
      emoji: "🏦",
      title: `Attack "${worst.name}" — ${(worst.interestRateBps / 100).toFixed(2)}% rate`,
      action: "Extra payment on high-rate loan",
      reason: `This private loan's rate is above 8%. It's costing you more than most investments earn. Prioritize this over lower-rate federal loans.`,
      urgency: "high",
    });
  }

  // Step 5: Snowball target
  const snowballTarget = activeLoans.sort((a, b) => a.balanceCents - b.balanceCents)[0];
  if (snowballTarget) {
    recs.push({
      priority: 5,
      emoji: "❄️",
      title: `Snowball: "${snowballTarget.name}"`,
      action: "Extra payment to snowball target",
      reason: `This is your smallest loan. Every extra dollar here accelerates payoff, frees up its minimum payment, and builds momentum for the next loan.`,
      amountSuggestion: Math.min(snowballTarget.balanceCents, 5000),
      urgency: "medium",
    });
  }

  // Step 6: Savings goals
  const activeGoals = savingsGoals.filter((g) => !g.isEmergencyFund && g.currentCents < g.targetCents);
  if (activeGoals.length > 0 && activeLoans.every((l) => l.interestRateBps < 700)) {
    recs.push({
      priority: 6,
      emoji: "🎯",
      title: "Contribute to a savings goal",
      action: "Fund a savings goal",
      reason: "Your loan rates are low enough that building toward a savings goal alongside minimum payments makes sense.",
      urgency: "low",
    });
  }

  // Default if everything is in order
  if (recs.filter((r) => r.priority <= 4).length === 0 && activeLoans.length > 0) {
    recs.push({
      priority: 5,
      emoji: "🚀",
      title: "You're on track — accelerate",
      action: "Increase extra loan payment",
      reason: "Your financial foundation is solid. Now throw everything you can at your target loan. The snowball is ready to roll.",
      urgency: "medium",
    });
  }

  return recs.sort((a, b) => a.priority - b.priority);
}
