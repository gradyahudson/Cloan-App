export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "basics" | "interest" | "strategy" | "life" | "refinancing" | "forgiveness" | "budgeting";
  readingTime: number;
  emoji: string;
  tags: string[];
}

export const ARTICLES: Article[] = [
  {
    id: "1",
    slug: "what-is-a-good-student-loan",
    title: "What makes a student loan \"good\"?",
    excerpt: "Not all debt is created equal. Here's how to spot a loan that's working for you vs. one that's working against you.",
    category: "basics",
    readingTime: 4,
    emoji: "🎓",
    tags: ["basics", "rates", "federal"],
    content: `Not all debt is created equal. A student loan that puts you in a better financial position over time is fundamentally different from one that compounds faster than your career grows.

**The rate is the most important number**

A "good" rate for a student loan in 2024 is anything under 7%. Federal undergraduate loans currently sit at 5.50%. Graduate loans are higher — 7.05% for Grad PLUS. If you're carrying private loans above 8-10%, refinancing deserves a serious look.

**Federal > Private almost always**

Federal loans come with income-driven repayment options, forgiveness programs, deferment, and forbearance protections that private loans rarely match. If you have both, prioritize paying off private loans first unless the rates are dramatically different.

**Fixed vs. variable rates**

Federal loans are always fixed. Private loans may offer variable rates that look attractive now but can rise significantly. For loans you plan to carry for more than 3 years, fixed is almost always the right choice.

**The "good loan" checklist**
- Rate below 7%
- Federal, not private
- Fixed rate
- Payment amount is less than 10% of your take-home pay
- Has deferment options if your income changes

A loan that checked all these boxes 5 years ago might not be "good" anymore if your balance hasn't budged. That's where Cloan helps — even small extra payments make a compounding difference.`,
  },
  {
    id: "2",
    slug: "how-interest-really-works",
    title: "How interest really works (and why it's eating your paycheck)",
    excerpt: "Daily interest accrual means every day you wait costs you money. Here's the math — and what to do about it.",
    category: "interest",
    readingTime: 5,
    emoji: "📊",
    tags: ["interest", "math", "accrual"],
    content: `Here's something that surprises most borrowers: student loan interest doesn't compound monthly. It accrues daily.

**The daily interest formula**

Daily interest = (Outstanding balance × Annual interest rate) ÷ 365

If you have $30,000 at 6.5%, that's:
($30,000 × 0.065) ÷ 365 = **$5.34 per day**

Every single day. Whether it's a weekend, a holiday, or your birthday.

**Why minimum payments can feel like running in sand**

On that $30,000 loan, your minimum payment might be $336/month. Of that, roughly $163 goes to interest in month one, and only $173 reduces your actual balance.

As your balance decreases, more of each payment hits principal. That's the good news. The bad news: it takes years to really feel it.

**What extra payments do**

Every dollar above the minimum goes straight to principal — which reduces the balance that interest is calculated on. A $50 extra payment in month one saves you more than a $50 extra payment in year five.

This is why Cloan's round-ups are most powerful at the beginning of your repayment journey.

**The principal-only payment instruction**

When you make an extra payment, explicitly mark it as "principal only" with your servicer. Some servicers will apply extra payments to future interest or future monthly payments if you don't specify. Always request principal-only.`,
  },
  {
    id: "3",
    slug: "snowball-vs-avalanche",
    title: "Snowball vs. Avalanche: Which strategy wins?",
    excerpt: "One saves more money mathematically. The other gets more people to actually pay off their loans. Here's the real answer.",
    category: "strategy",
    readingTime: 5,
    emoji: "❄️",
    tags: ["snowball", "avalanche", "strategy", "dave ramsey"],
    content: `**The math says avalanche. The psychology says snowball.**

The avalanche method — targeting the highest interest rate loan first — will always cost you less total interest. On paper, it wins.

But here's what the research shows: most people who start with avalanche give up. The highest-rate loan is often also a large loan, and it can take years to see progress. Motivation collapses.

The snowball method, popularized by Dave Ramsey, targets the smallest balance first. You pay it off faster. You feel the win. You take that freed-up minimum payment and roll it to the next loan. This is the "snowball" — the rolling momentum.

**The real-world data**

A Harvard Business Review study found that people who focused on paying off one loan at a time (regardless of rate) paid off more debt than those who spread extra payments across all loans. The psychological lift is real and measurable.

**When avalanche makes more sense**

- The rate difference between your loans is very large (>3%)
- You're highly analytical and won't be discouraged by slow progress
- You're within 2-3 years of payoff anyway

**The Cloan recommendation**

Start with snowball. If your smallest loan has a much lower rate than the next one, it's a close call. But if you've ever started a debt payoff plan and abandoned it, snowball wins.

The best strategy is the one you actually complete.`,
  },
  {
    id: "4",
    slug: "renting-vs-buying-with-student-debt",
    title: "Renting vs. buying when you have student loans",
    excerpt: "You can still buy a house with student debt. Here's how lenders actually look at it — and when to wait.",
    category: "life",
    readingTime: 6,
    emoji: "🏠",
    tags: ["home buying", "DTI", "mortgage", "life decisions"],
    content: `Student debt doesn't disqualify you from buying a home. Millions of people do it every year. But it does change the math.

**The key number: DTI (Debt-to-Income ratio)**

Lenders calculate your debt-to-income ratio by dividing your total monthly debt payments (including projected mortgage) by your gross monthly income. Most conventional loans want DTI under 43%. FHA loans can go higher.

If you earn $5,000/month gross and your student loan payment is $400/month, you've already used 8% of your DTI allowance before the mortgage even enters the picture.

**How IDR payments affect your mortgage**

If you're on an income-driven repayment plan, your payment might be $0/month. Lenders used to just use 0% for that calculation. Rules changed: Fannie Mae and Freddie Mac now require lenders to use at least 0.5%-1% of your outstanding balance as the monthly payment for DTI purposes, even if your actual payment is $0.

This can significantly affect how much house you can qualify for.

**When it makes sense to buy anyway**

- Your rent is high relative to mortgage payments in your area
- You have a stable income with room to grow
- You have 3-6 months emergency fund PLUS down payment
- Your DTI remains under 40% with all debt included

**When to wait**

- You're within 1-2 years of paying off a significant loan (the freed-up cash flow will matter)
- Your job situation is uncertain
- You'd need to drain savings to close

The right answer is personal. Cloan isn't here to tell you not to buy a house — just to help you understand the numbers clearly.`,
  },
  {
    id: "5",
    slug: "pslf-explained",
    title: "PSLF explained: Is Public Service Loan Forgiveness right for you?",
    excerpt: "120 payments. A qualifying employer. No income limit. Here's everything you need to know about the program and who actually benefits.",
    category: "forgiveness",
    readingTime: 7,
    emoji: "🏛️",
    tags: ["PSLF", "forgiveness", "federal", "IDR"],
    content: `Public Service Loan Forgiveness (PSLF) forgives your remaining federal student loan balance after 120 qualifying monthly payments (10 years) while working full-time for a qualifying employer.

**Qualifying employers**
- Federal, state, local, or tribal government agencies
- 501(c)(3) nonprofits
- AmeriCorps and Peace Corps

**What makes a payment "qualifying"**
- Made under an income-driven repayment plan (SAVE, IBR, ICR, PAYE)
- Full amount due
- While working full-time for a qualifying employer
- On eligible loan types (Direct Loans only — FFEL and Perkins need consolidation)

**The math on PSLF**

If you owe $80,000 at a government salary of $55,000, your IDR payment might be $200-300/month. After 10 years, you'll have paid around $24,000-36,000 — and the remaining balance is forgiven tax-free.

Compare to: 10 years of standard repayment on $80,000 at 6.5% = ~$108,000 total paid (including interest).

PSLF can save you tens of thousands. For high-balance borrowers at lower salaries, it can save six figures.

**PSLF is NOT for everyone**

If your loan balance is low relative to your income, you may pay off the loan before 120 payments anyway. The forgiveness benefit disappears.

Rule of thumb: If your loan balance is more than your annual income, PSLF is worth modeling. If it's less, focus on payoff.

**How to track your progress**

Submit an Employer Certification Form (ECF) annually — don't wait 10 years to find out you don't qualify. Use the MOHELA PSLF tracker if you're already with them; otherwise, request your loans be transferred to MOHELA (the current PSLF servicer).`,
  },
  {
    id: "6",
    slug: "refinancing-decision-framework",
    title: "Should you refinance? A clear decision framework",
    excerpt: "Refinancing can save you thousands — or cost you your federal protections. Here's how to think through it.",
    category: "refinancing",
    readingTime: 5,
    emoji: "🔄",
    tags: ["refinancing", "interest rate", "private", "federal"],
    content: `Refinancing replaces your current loans with a new private loan at a (hopefully) lower rate. It can meaningfully reduce your interest costs — but it comes with a permanent tradeoff.

**What you gain by refinancing**
- Lower interest rate (potentially 1-4% lower if you have good credit and income)
- Simplified single monthly payment
- Potentially shorter repayment term

**What you lose**
- All federal protections: PSLF eligibility, IDR plans, federal deferment/forbearance
- Access to federal forgiveness programs
- Payment pause protections (like the COVID pause)

**The irreversible nature of refinancing**

Once you refinance federal loans into a private loan, there is no going back. You cannot "un-refinance" back to federal status. This is a one-way door.

**When refinancing makes sense**

You are a strong candidate if ALL of the following are true:
- You do NOT work for a qualifying PSLF employer (and don't plan to)
- Your income is stable and you don't expect to need IDR plans
- You have a credit score above 700 and a good debt-to-income ratio
- You can qualify for a rate at least 1.5% lower than your current rate
- You have an emergency fund and stable employment

**When to never refinance**
- You're pursuing PSLF or any federal forgiveness program
- Your income is variable or you might need income-driven repayment
- You're in deferment, forbearance, or facing financial hardship

The break-even analysis: Calculate total interest cost over remaining term at current rate vs. new rate. If savings > $2,000, it's worth looking at. Earnest, SoFi, Laurel Road, and Splash Financial are the main refinancing lenders.`,
  },
  {
    id: "7",
    slug: "emergency-fund-vs-extra-payments",
    title: "Emergency fund vs. extra loan payments: the right order",
    excerpt: "You can't pour from an empty cup. Here's the correct financial order of operations for paying off student debt.",
    category: "budgeting",
    readingTime: 4,
    emoji: "🛡️",
    tags: ["emergency fund", "budgeting", "financial order", "savings"],
    content: `This question comes up constantly: Should I throw everything at my student loans, or build an emergency fund first?

**The answer: Build the emergency fund first.**

Here's why. If you have no emergency fund and something breaks — car, medical, job loss — you'll either go into credit card debt at 20%+ APR, or you'll stop making loan payments. Either outcome erases your progress.

**The financial order of operations**

1. **Get current on all bills** — minimum payments on everything
2. **$1,000 starter emergency fund** — non-negotiable before aggressive payoff
3. **Employer 401k match** — this is a 50-100% immediate return; don't leave it on the table
4. **Pay off high-interest debt** (credit cards, private loans >8%)
5. **Build full emergency fund** — 3-6 months of expenses in a HYSA
6. **Extra student loan payments** — this is where Cloan lives
7. **Invest for retirement**

**Where Cloan fits**

Cloan is designed to work at step 6. The round-ups are small enough that they don't disrupt your emergency fund. They're money you weren't really spending intentionally.

If you're still at step 2 or 3, Cloan can still help you build awareness of your spending patterns — just redirect the "saved" round-up amount to your emergency fund instead.

**The real message**

You don't have to choose between security and payoff. A small emergency fund lets you be aggressive on your loans without risking financial catastrophe. Build the foundation first. Then snowball.`,
  },
];
