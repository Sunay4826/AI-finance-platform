"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function serializeDecimal(obj) {
  const serialized = { ...obj };
  if (obj.balance && typeof obj.balance.toNumber === "function") {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount && typeof obj.amount.toNumber === "function") {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
}

export async function getAISuggestions(accountId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!genAI) {
    throw new Error(
      "AI suggestions are disabled. Add GEMINI_API_KEY or GOOGLE_API_KEY to your environment."
    );
  }

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

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

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const safeAccount = serializeDecimal(account);
  const safeBudget = budget
    ? { ...budget, amount: budget.amount.toNumber() }
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

  const result = await model.generateContent([{ text: prompt }]);
  const response = await result.response;
  const text = response.text().replace(/```(?:json)?\n?|```/g, "").trim();

  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error("AI returned invalid JSON");
  }

  return json;
}


