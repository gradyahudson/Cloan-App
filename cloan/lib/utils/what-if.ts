import { projectPayoff, Loan, Strategy } from "@/lib/utils/snowball";
import { formatCents } from "@/lib/utils/currency";
import { format } from "date-fns";

export type WhatIfScenario =
  | { type: "extra_payment"; amountCents: number }
  | { type: "lump_sum"; loanId: string; amountCents: number }
  | { type: "refinance"; newRateBps: number }
  | { type: "raise"; additionalMonthlyCents: number }
  | { type: "strategy_change"; strategy: Strategy };

export interface WhatIfResult {
  scenarioLabel: string;
  monthsSaved: number;
  interestSavedCents: number;
  newPayoffDate: Date;
  currentPayoffDate: Date;
  summary: string;
}

export function calculateWhatIf(
  loans: Loan[],
  currentStrategy: Strategy,
  currentExtraMonthlyCents: number,
  scenario: WhatIfScenario
): WhatIfResult {
  const baseline = projectPayoff(loans, currentStrategy, currentExtraMonthlyCents);

  let modifiedLoans = loans.map((l) => ({ ...l }));
  let modifiedExtra = currentExtraMonthlyCents;
  let modifiedStrategy = currentStrategy;
  let scenarioLabel = "";

  switch (scenario.type) {
    case "extra_payment":
      modifiedExtra = currentExtraMonthlyCents + scenario.amountCents;
      scenarioLabel = `+${formatCents(scenario.amountCents)}/month extra`;
      break;

    case "lump_sum":
      modifiedLoans = modifiedLoans.map((l) =>
        l.id === scenario.loanId
          ? { ...l, balanceCents: Math.max(0, l.balanceCents - scenario.amountCents) }
          : l
      );
      scenarioLabel = `${formatCents(scenario.amountCents)} lump sum payment`;
      break;

    case "refinance":
      modifiedLoans = modifiedLoans.map((l) => ({
        ...l,
        interestRateBps: scenario.newRateBps,
      }));
      scenarioLabel = `Refinance to ${(scenario.newRateBps / 100).toFixed(2)}%`;
      break;

    case "raise":
      modifiedExtra = currentExtraMonthlyCents + scenario.additionalMonthlyCents;
      scenarioLabel = `+${formatCents(scenario.additionalMonthlyCents)}/mo raise allocated`;
      break;

    case "strategy_change":
      modifiedStrategy = scenario.strategy;
      scenarioLabel = `Switch to ${scenario.strategy} strategy`;
      break;
  }

  const modified = projectPayoff(modifiedLoans, modifiedStrategy, modifiedExtra);
  const monthsSaved = baseline.monthsWithout - modified.monthsWith;
  const interestSaved = baseline.interestSavedCents - modified.interestSavedCents;

  const summary =
    monthsSaved > 0
      ? `You'd pay off your loans ${formatMonths(monthsSaved)} sooner and save ${formatCents(Math.abs(interestSaved))} in interest.`
      : monthsSaved === 0
      ? "No change in payoff timeline for this scenario."
      : `This scenario extends your payoff timeline by ${formatMonths(Math.abs(monthsSaved))}.`;

  return {
    scenarioLabel,
    monthsSaved,
    interestSavedCents: Math.abs(interestSaved),
    newPayoffDate: modified.payoffDateWith,
    currentPayoffDate: baseline.payoffDateWith,
    summary,
  };
}

function formatMonths(months: number): string {
  const years = Math.floor(months / 12);
  const mo = months % 12;
  if (years === 0) return `${mo} months`;
  if (mo === 0) return `${years} years`;
  return `${years}y ${mo}mo`;
}

// Preset scenarios for the UI
export const PRESET_SCENARIOS = [
  { id: "extra_25", label: "+$25/month", emoji: "💸", scenario: { type: "extra_payment" as const, amountCents: 2500 } },
  { id: "extra_50", label: "+$50/month", emoji: "💵", scenario: { type: "extra_payment" as const, amountCents: 5000 } },
  { id: "extra_100", label: "+$100/month", emoji: "💰", scenario: { type: "extra_payment" as const, amountCents: 10000 } },
  { id: "tax_refund", label: "$1,200 lump sum", emoji: "🧾", scenario: null }, // dynamic — needs loan selection
  { id: "raise_200", label: "+$200/mo raise", emoji: "📈", scenario: { type: "raise" as const, additionalMonthlyCents: 20000 } },
  { id: "refi_5", label: "Refi to 5.0%", emoji: "🔄", scenario: { type: "refinance" as const, newRateBps: 500 } },
  { id: "refi_4", label: "Refi to 4.0%", emoji: "🔄", scenario: { type: "refinance" as const, newRateBps: 400 } },
];
