import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "../db";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

// ─── LOAN ROUTER ───────────────────────────────────────────────────────────

const loanRouter = router({
  list: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return prisma.loan.findMany({
        where: { userId: input.userId, status: { not: "PAID_OFF" } },
        orderBy: { currentBalanceCents: "asc" },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        loanName: z.string().min(1),
        servicerName: z.string().min(1),
        loanType: z.enum([
          "FEDERAL_SUBSIDIZED", "FEDERAL_UNSUBSIDIZED", "FEDERAL_PLUS",
          "FEDERAL_GRAD_PLUS", "PRIVATE", "REFINANCED", "OTHER",
        ]),
        originalBalanceCents: z.number().int().positive(),
        currentBalanceCents: z.number().int().positive(),
        interestRateBps: z.number().int().positive(),
        minimumPaymentCents: z.number().int().positive(),
        nextPaymentDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.loan.create({ data: input });
    }),

  updateBalance: publicProcedure
    .input(z.object({ id: z.string(), currentBalanceCents: z.number().int().min(0) }))
    .mutation(async ({ input }) => {
      return prisma.loan.update({
        where: { id: input.id },
        data: { currentBalanceCents: input.currentBalanceCents },
      });
    }),

  markPaidOff: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.loan.update({
        where: { id: input.id },
        data: { status: "PAID_OFF", currentBalanceCents: 0 },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.loan.delete({ where: { id: input.id } });
    }),
});

// ─── ROUNDUP ROUTER ────────────────────────────────────────────────────────

const roundupRouter = router({
  getAccumulated: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const result = await prisma.roundup.aggregate({
        where: { userId: input.userId, status: "PENDING" },
        _sum: { roundupAmountCents: true },
        _count: true,
      });
      return {
        totalCents: result._sum.roundupAmountCents ?? 0,
        count: result._count,
      };
    }),

  list: publicProcedure
    .input(z.object({ userId: z.string(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return prisma.roundup.findMany({
        where: { userId: input.userId },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        include: { transaction: true },
      });
    }),
});

// ─── MILESTONE ROUTER ──────────────────────────────────────────────────────

const milestoneRouter = router({
  getEarned: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return prisma.userMilestone.findMany({
        where: { userId: input.userId },
        include: { milestone: true },
        orderBy: { earnedAt: "desc" },
      });
    }),

  dismissCelebration: publicProcedure
    .input(z.object({ userMilestoneId: z.string() }))
    .mutation(async ({ input }) => {
      return prisma.userMilestone.update({
        where: { id: input.userMilestoneId },
        data: { celebrationSeenAt: new Date() },
      });
    }),
});

// ─── ROOT ROUTER ───────────────────────────────────────────────────────────

export const appRouter = router({
  loan: loanRouter,
  roundup: roundupRouter,
  milestone: milestoneRouter,
});

export type AppRouter = typeof appRouter;
