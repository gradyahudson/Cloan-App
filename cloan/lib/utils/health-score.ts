import type { StoredLoan } from "@/lib/store/loans";
import type { SavingsGoal } from "@/lib/store/savings";

export interface HealthScoreBreakdown {
  total: number; // 0–100
  debtLoad: { score: number; max: number; label: string; insight: string };
  paymentConsistency: { score: number; max: number; label: string; insight: string };
  savingsRate: { score: number; max: number; label: string; insight: string };
  loanKnowledge: { score: number; max: number; label: string; insight: string };
  streakBonus: { score: number; max: number; label: string; insight: string };
}

export interface HealthScoreInput {
  loans: StoredLoan[];
  savingsGoals: SavingsGoal[];
  streakDays: number;
  articlesRead: number;
  totalXP: number;
  roundupCount: number;
  monthlyIncomeCents?: number;
}

export function calculateHealthScore(input: HealthScoreInput): HealthScoreBreakdown {
  const {
    loans,
    savingsGoals,
    streakDays,
    articlesRead,
    totalXP,
    roundupCount,
    monthlyIncomeCents,
  } = input;

  const activeLoans = loans.filter((l) => l.status === "active");
  const totalDebt = activeLoans.reduce((s, l) => s + l.balanceCents, 0);
  const totalOriginal = activeLoans.reduce((s, l) => s + l.originalBalanceCents, 0);
  const paidPercent = totalOriginal > 0 ? 1 - totalDebt / totalOriginal : 1;

  // ─── Debt Load (30 pts) ────────────────────────────────────────────────
  // Score based on % paid off + avg interest rate
  const avgRate = activeLoans.length > 0
    ? activeLoans.reduce((s, l) => s + l.interestRateBps, 0) / activeLoans.length / 100
    : 0;
  const paidScore = Math.round(paidPercent * 20); // 0–20 pts
  const rateScore = avgRate < 4 ? 10 : avgRate < 6 ? 8 : avgRate < 8 ? 5 : avgRate < 10 ? 3 : 0; // 0–10 pts
  const debtScore = paidScore + rateScore;
  const debtInsight = debtScore >= 25
    ? "Excellent — you've made serious progress on your debt."
    : debtScore >= 15
    ? "Good progress. Keep targeting your snowball loan."
    : avgRate > 7
    ? "High interest rates are costing you. Consider refinancing."
    : "Focus on consistent extra payments to improve this score.";

  // ─── Payment Consistency (25 pts) ─────────────────────────────────────
  // Based on round-up count + manual payments logged
  const consistencyScore = Math.min(roundupCount * 2, 25);
  const consistencyInsight = consistencyScore >= 20
    ? "Rock solid. Your consistent payments are compounding nicely."
    : consistencyScore >= 10
    ? "Building momentum. Every round-up counts."
    : "Enable round-ups and make regular extra payments to boost this.";

  // ─── Savings Rate (20 pts) ─────────────────────────────────────────────
  const emergencyFund = savingsGoals.find((g) => g.isEmergencyFund);
  const efProgress = emergencyFund
    ? emergencyFund.currentCents / emergencyFund.targetCents
    : 0;
  const otherGoals = savingsGoals.filter((g) => !g.isEmergencyFund).length;
  const efScore = Math.round(efProgress * 12); // 0–12 pts
  const goalScore = Math.min(otherGoals * 4, 8); // 0–8 pts
  const savingsScore = efScore + goalScore;
  const savingsInsight = !emergencyFund
    ? "No emergency fund yet. Add one to protect your loan progress."
    : efProgress < 0.5
    ? "Emergency fund is under 50%. Keep building it before maxing loan payments."
    : efProgress < 1
    ? "Almost there on your emergency fund. Great work."
    : "Emergency fund complete. You're well protected.";

  // ─── Loan Knowledge (15 pts) ──────────────────────────────────────────
  const knowledgeScore = Math.min(articlesRead * 3, 15);
  const knowledgeInsight = knowledgeScore >= 12
    ? "You're informed. Knowledge is a real edge in debt payoff."
    : knowledgeScore >= 6
    ? "Keep reading — each article improves your decision-making."
    : "Head to the Learn tab. Understanding your loans is step one.";

  // ─── Streak Bonus (10 pts) ────────────────────────────────────────────
  const streakScore =
    streakDays >= 100 ? 10 : streakDays >= 30 ? 8 : streakDays >= 14 ? 6 : streakDays >= 7 ? 4 : streakDays >= 3 ? 2 : 0;
  const streakInsight = streakScore >= 8
    ? "Incredible streak. Consistency is your superpower."
    : streakScore >= 4
    ? "Good habit forming. Don't break the chain."
    : "Open Cloan daily to build your streak bonus.";

  const total = Math.min(debtScore + consistencyScore + savingsScore + knowledgeScore + streakScore, 100);

  return {
    total,
    debtLoad: { score: debtScore, max: 30, label: "Debt Load", insight: debtInsight },
    paymentConsistency: { score: consistencyScore, max: 25, label: "Consistency", insight: consistencyInsight },
    savingsRate: { score: savingsScore, max: 20, label: "Savings", insight: savingsInsight },
    loanKnowledge: { score: knowledgeScore, max: 15, label: "Knowledge", insight: knowledgeInsight },
    streakBonus: { score: streakScore, max: 10, label: "Streak", insight: streakInsight },
  };
}

export function getHealthScoreLabel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 85) return { label: "Excellent", color: "#22C55E", emoji: "🏆" };
  if (score >= 70) return { label: "Strong", color: "#FBBF24", emoji: "🌟" };
  if (score >= 50) return { label: "Building", color: "#F59E0B", emoji: "🌱" };
  if (score >= 30) return { label: "Early Stage", color: "#FB923C", emoji: "🌾" };
  return { label: "Getting Started", color: "#94A3B8", emoji: "🪴" };
}
