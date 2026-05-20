/**
 * Round-up calculation: pure function, no side effects.
 * amountCents = 347 ($3.47) → returns 53 ($0.53)
 */
export function calculateRoundup(amountCents: number): number {
  if (amountCents <= 0) return 0;
  const remainder = amountCents % 100;
  if (remainder === 0) return 0;
  return 100 - remainder;
}

// Categories Plaid returns that should NOT be rounded up
const EXCLUDED_CATEGORIES = new Set([
  "Transfer",
  "Payment",
  "Bank Fees",
  "Interest",
  "Loan",
  "Mortgage",
  "Credit Card Payment",
  "Transfer In",
  "Transfer Out",
]);

export function isEligibleForRoundup(
  amountCents: number,
  pending: boolean,
  categories: string[]
): boolean {
  if (pending) return false;
  if (amountCents <= 0) return false; // credits/refunds don't get rounded up
  if (amountCents % 100 === 0) return false; // exact dollar amounts produce $0 roundup
  const hasExcludedCategory = categories.some((c) => EXCLUDED_CATEGORIES.has(c));
  if (hasExcludedCategory) return false;
  return true;
}
