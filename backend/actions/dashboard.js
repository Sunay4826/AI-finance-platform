"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const toFiniteNumber = (value) => {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
};

const errorMessage = (error, fallback = "Request failed") => {
  if (error instanceof Error && typeof error.message === "string") {
    return error.message;
  }
  if (typeof error === "string") return error;
  return fallback;
};

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance !== null && obj.balance !== undefined) {
    serialized.balance = toFiniteNumber(obj.balance) ?? 0;
  }
  if (obj.amount !== null && obj.amount !== undefined) {
    serialized.amount = toFiniteNumber(obj.amount) ?? 0;
  }
  return serialized;
};

const getAuthenticatedDbUser = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existingUser = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (existingUser) return existingUser;

  const createdUser = await checkUser();
  if (!createdUser) throw new Error("User not found");
  return createdUser;
};

export async function getUserAccounts() {
  try {
    const user = await getAuthenticatedDbUser();

    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    // Serialize accounts before sending to client
    const serializedAccounts = accounts.map(serializeTransaction);

    return serializedAccounts;
  } catch (error) {
    console.error("Error in getUserAccounts:", error);
    return []; // Return empty array instead of throwing
  }
}

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const isDevelopment = process.env.NODE_ENV !== "production";

    // Skip ArcJet rate-limiting in local development for smoother testing.
    if (!isDevelopment) {
      // Get request data for ArcJet
      const req = await request();

      // Check rate limit
      const decision = await aj.protect(req, {
        userId,
        requested: 1, // Specify how many tokens to consume
      });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          const { remaining, reset } = decision.reason;
          console.error({
            code: "RATE_LIMIT_EXCEEDED",
            details: {
              remaining,
              resetInSeconds: reset,
            },
          });

          throw new Error("Too many requests. Please try again later.");
        }

        throw new Error("Request blocked");
      }
    }

    const user = await getAuthenticatedDbUser();

    // Convert balance to float before saving
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    // Check if this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    // If it's the first account, make it default regardless of user input
    // If not, use the user's preference
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    // If this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create new account
    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault, // Override the isDefault based on our logic
      },
    });

    // Serialize the account before returning
    const serializedAccount = serializeTransaction(account);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error) {
    throw new Error(errorMessage(error, "Failed to create account"));
  }
}

export async function getDashboardData() {
  try {
    const user = await getAuthenticatedDbUser();

    // Get all user transactions
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return transactions.map(serializeTransaction);
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return []; // Return empty array instead of throwing
  }
}

export async function getDashboardBootstrap() {
  try {
    const user = await getAuthenticatedDbUser();

    const [accounts, transactions] = await Promise.all([
      db.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      }),
      db.transaction.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
      }),
    ]);

    const defaultAccount = accounts.find((account) => account.isDefault);

    let budgetData = { budget: null, currentExpenses: 0 };
    if (defaultAccount) {
      const budget = await db.budget.findFirst({
        where: { userId: user.id },
      });

      const currentDate = new Date();
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const expenses = await db.transaction.aggregate({
        where: {
          userId: user.id,
          type: "EXPENSE",
          accountId: defaultAccount.id,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: { amount: true },
      });

      budgetData = {
        budget: budget
          ? {
              ...budget,
              amount: toFiniteNumber(budget.amount) ?? 0,
            }
          : null,
        currentExpenses: toFiniteNumber(expenses?._sum?.amount) ?? 0,
      };
    }

    return {
      accounts: accounts.map(serializeTransaction),
      transactions: transactions.map(serializeTransaction),
      budgetData,
    };
  } catch (error) {
    console.error("Error in getDashboardBootstrap:", error);
    return {
      accounts: [],
      transactions: [],
      budgetData: { budget: null, currentExpenses: 0 },
    };
  }
}
