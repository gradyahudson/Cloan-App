export interface Loan {
  id: string;
  name: string;
  balanceCents: number;
  interestRateBps: number; // basis points: 650 = 6.50%
  minimumPaymentCents: number;
}

export interface PayoffMonth {
  month: number;
  totalBalanceCents: number;
  withCloanBalanceCents: number;
}

export interface PayoffProjection {
  monthsWithout: number;
  monthsWith: number;
  monthsSaved: number;
  interestSavedCents: number;
  payoffDateWithout: Date;
  payoffDateWith: Date;
  timeline: PayoffMonth[];
}

export type Strategy = "snowball" | "avalanche" | "proportional";

function sortLoans(loans: Loan[], strategy: Strategy): Loan[] {
  const copy = [...loans];
  if (strategy === "snowball") {
    return copy.sort((a, b) => a.balanceCents - b.balanceCents);
  }
  if (strategy === "avalanche") {
    return copy.sort((a, b) => b.interestRateBps - a.interestRateBps);
  }
  return copy;
}

export function projectPayoff(
  loans: Loan[],
  strategy: Strategy,
  extraMonthlyCents: number
): PayoffProjection {
  if (loans.length === 0) {
    const now = new Date();
    return {
      monthsWithout: 0,
      monthsWith: 0,
      monthsSaved: 0,
      interestSavedCents: 0,
      payoffDateWithout: now,
      payoffDateWith: now,
      timeline: [],
    };
  }

  const withoutExtra = simulatePayoff(loans, strategy, 0);
  const withExtra = simulatePayoff(loans, strategy, extraMonthlyCents);

  const timeline: PayoffMonth[] = [];
  const maxMonths = Math.max(withoutExtra.months, withExtra.months);

  for (let m = 0; m <= maxMonths; m++) {
    const withoutEntry = withoutExtra.monthlyBalances[m];
    const withEntry = withExtra.monthlyBalances[m];
    timeline.push({
      month: m,
      totalBalanceCents: withoutEntry ?? 0,
      withCloanBalanceCents: withEntry ?? 0,
    });
  }

  const now = new Date();
  const payoffDateWithout = new Date(now);
  payoffDateWithout.setMonth(now.getMonth() + withoutExtra.months);
  const payoffDateWith = new Date(now);
  payoffDateWith.setMonth(now.getMonth() + withExtra.months);

  return {
    monthsWithout: withoutExtra.months,
    monthsWith: withExtra.months,
    monthsSaved: withoutExtra.months - withExtra.months,
    interestSavedCents: withoutExtra.totalInterestCents - withExtra.totalInterestCents,
    payoffDateWithout,
    payoffDateWith,
    timeline,
  };
}

function simulatePayoff(
  loans: Loan[],
  strategy: Strategy,
  extraMonthlyCents: number
) {
  let remaining = sortLoans(loans, strategy).map((l) => ({ ...l }));
  let month = 0;
  let totalInterestCents = 0;
  const monthlyBalances: number[] = [];

  const totalBalance = () =>
    remaining.reduce((sum, l) => sum + l.balanceCents, 0);

  let availableExtra = extraMonthlyCents;

  while (remaining.length > 0 && month < 600) {
    month++;
    let extra = availableExtra;
    let releasedMinimums = 0;

    for (const loan of remaining) {
      const monthlyRate = loan.interestRateBps / 10000 / 12;
      const interest = Math.round(loan.balanceCents * monthlyRate);
      totalInterestCents += interest;
      loan.balanceCents += interest;
    }

    // Pay minimums first
    for (const loan of remaining) {
      const payment = Math.min(loan.minimumPaymentCents, loan.balanceCents);
      loan.balanceCents -= payment;
    }

    // Apply extra to first loan (snowball/avalanche target)
    if (remaining.length > 0 && extra > 0) {
      const target = remaining[0];
      const extraApplied = Math.min(extra, target.balanceCents);
      target.balanceCents -= extraApplied;
    }

    // Remove paid-off loans and roll their minimums
    const paidOff = remaining.filter((l) => l.balanceCents <= 0);
    for (const p of paidOff) {
      releasedMinimums += p.minimumPaymentCents;
    }
    remaining = remaining.filter((l) => l.balanceCents > 0);
    availableExtra = extraMonthlyCents + releasedMinimums;

    monthlyBalances.push(totalBalance());
  }

  return { months: month, totalInterestCents, monthlyBalances };
}
