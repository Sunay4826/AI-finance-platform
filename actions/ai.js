"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { checkUser } from "@/lib/checkUser";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

function serializeDecimal(obj) {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = typeof obj.balance === 'number' ? obj.balance : obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = typeof obj.amount === 'number' ? obj.amount : obj.amount.toNumber();
  }
  return serialized;
}

export async function getAISuggestions(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    if (!openai) {
      throw new Error(
        "AI suggestions are disabled. Add OPENAI_API_KEY to your environment."
      );
    }

    let user = await checkUser();
    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      user = await checkUser();
      if (!user) throw new Error("User not found");
    }

    // Fetch account, budget, and recent transactions
    const [account, budget, transactions] = await Promise.all([
      db.account.findFirst({
        where: { id: accountId, userId: user.id },
      }),
      db.budget.findFirst({ where: { userId: user.id } }),
      db.transaction.findMany({
        where: { userId: user.id, accountId },
        orderBy: { date: "desc" },
        take: 50,
      }),
    ]);

    if (!account) throw new Error("Account not found");

    const safeAccount = serializeDecimal(account);
    const safeBudget = budget
      ? { ...budget, amount: typeof budget.amount === 'number' ? budget.amount : budget.amount.toNumber() }
      : null;
    const safeTxns = transactions.map(serializeDecimal);

    const prompt = `You are a helpful financial planning assistant.
Given the user's single account snapshot, optional monthly budget, and up to 50 recent transactions, produce concise, actionable suggestions to improve financial health. Prefer practical steps with numbers.

Return strictly valid JSON using this schema:
{
  "summary": string,
  "suggestions": [
    { "title": string, "detail": string, "impact": "low"|"medium"|"high" }
  ],
  "reminders": string[]
}

Data:
account = ${JSON.stringify(safeAccount)}
budget = ${JSON.stringify(safeBudget)}
transactions = ${JSON.stringify(safeTxns)}
`; 

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });
    
    const content = completion.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI returned empty response");

    const text = content.replace(/```(?:json)?\n?|```/g, "").trim();

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error("[AI] Invalid JSON response", { accountId, text });
      throw new Error("AI returned invalid JSON");
    }

    return json;
  } catch (error) {
    console.error("[AI] Failed to fetch suggestions", { accountId, error });
    throw error instanceof Error ? error : new Error("Failed to fetch AI suggestions");
  }
}
