import { dinero, toDecimal, add, subtract, multiply, allocate } from "dinero.js";
import { USD } from "@dinero.js/currencies";

export function cents(amount: number) {
  return dinero({ amount, currency: USD });
}

export function formatCents(amountCents: number): string {
  const d = cents(amountCents);
  return `$${toDecimal(d, ({ value, currency }) =>
    Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )}`;
}

export function formatCentsCompact(amountCents: number): string {
  const dollars = amountCents / 100;
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}k`;
  }
  return formatCents(amountCents);
}

export function calculateRoundup(transactionCents: number): number {
  if (transactionCents <= 0) return 0;
  const remainder = transactionCents % 100;
  if (remainder === 0) return 0;
  return 100 - remainder;
}

export function dollarsToC(dollars: number): number {
  return Math.round(dollars * 100);
}

export function cToDollars(cents: number): number {
  return cents / 100;
}
