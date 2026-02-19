"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { checkUser } from "@/lib/checkUser";

const MAX_BUDGET_AMOUNT = 1_000_000_000;

const toFiniteNumber = (value) => {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
};

export async function getCurrentBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check and create user if needed - retry on failure
    let user = await checkUser();
    if (!user) {
      // Retry once after a short delay
      await new Promise(resolve => setTimeout(resolve, 500));
      user = await checkUser();
      if (!user) {
        throw new Error("User not found");
      }
    }

    const budget = await db.budget.findFirst({
      where: {
        userId: user.id,
      },
    });

    // Get current month's expenses
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
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        accountId,
      },
      _sum: {
        amount: true,
      },
    });

    const budgetAmount = budget ? toFiniteNumber(budget.amount) : null;
    const currentExpenses = toFiniteNumber(expenses?._sum?.amount) ?? 0;

    return {
      budget:
        budget && budgetAmount !== null
          ? {
              ...budget,
              amount: budgetAmount,
            }
          : null,
      currentExpenses,
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }
}

export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const normalizedAmount = toFiniteNumber(amount);
    if (normalizedAmount === null || normalizedAmount <= 0) {
      throw new Error("Please enter a valid budget amount");
    }
    if (normalizedAmount > MAX_BUDGET_AMOUNT) {
      throw new Error("Budget amount is too large");
    }

    // Update or create budget
    const budget = await db.budget.upsert({
      where: {
        userId: user.id,
      },
      update: {
        amount: normalizedAmount,
      },
      create: {
        userId: user.id,
        amount: normalizedAmount,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: {
        ...budget,
        amount: toFiniteNumber(budget.amount) ?? normalizedAmount,
      },
    };
  } catch (error) {
    console.error("Error updating budget:", error);
    return { success: false, error: error.message };
  }
}
