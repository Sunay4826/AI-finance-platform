"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const serializeAmount = (obj) => ({
  ...obj,
  amount: typeof obj.amount === 'number' ? obj.amount : obj.amount.toNumber(),
});

// Create Transaction
export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

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

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance + balanceChange;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount
        : originalTransaction.amount;

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Delete Single Transaction
export async function deleteTransaction(transactionId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get transaction to calculate balance change
    const transaction = await db.transaction.findUnique({
      where: {
        id: transactionId,
        userId: user.id,
      },
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Calculate balance change (reverse the original transaction)
    const balanceChange = transaction.type === "EXPENSE" 
      ? transaction.amount 
      : -transaction.amount;

    // Delete transaction and update account balance in a transaction
    await db.$transaction(async (tx) => {
      // Delete the transaction
      await tx.transaction.delete({
        where: {
          id: transactionId,
          userId: user.id,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: transaction.accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: transactions };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Scan Receipt
export async function scanReceipt(file) {
  try {
    if (!openai) {
      throw new Error(
        "AI receipt scanning is disabled. Add OPENAI_API_KEY to your environment variables to enable it."
      );
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    // Retry logic for API overload errors
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${file.type};base64,${base64String}`
                  }
                }
              ]
            }
          ],
          temperature: 0.1,
        });

        const text = completion.choices[0].message.content;
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        try {
          const data = JSON.parse(cleanedText);
          return {
            amount: parseFloat(data.amount),
            date: new Date(data.date),
            description: data.description,
            category: data.category,
            merchantName: data.merchantName,
          };
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError);
          throw new Error("Invalid response format from OpenAI");
        }
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt} failed:`, error.message);
        
        // If it's a quota error, don't retry
        if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("insufficient_quota")) {
          throw new Error("OpenAI API quota exceeded. Please check your billing and usage limits at https://platform.openai.com/account/billing");
        }
        
        // If it's a 503 error and we have attempts left, wait and retry
        if (error.message.includes("503") || error.message.includes("overloaded")) {
          if (attempt < 3) {
            console.log(`Waiting ${attempt * 2} seconds before retry...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            continue;
          }
        }
        
        // For other errors or final attempt, throw immediately
        throw error;
      }
    }
    
    // If we get here, all retries failed
    throw lastError;
  } catch (error) {
    console.error("Error scanning receipt:", error);
    
    // Provide more specific error messages
    if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("insufficient_quota")) {
      throw new Error("OpenAI API quota exceeded. Please check your billing and usage limits at https://platform.openai.com/account/billing");
    } else if (error.message.includes("503") || error.message.includes("overloaded")) {
      throw new Error("OpenAI API is currently overloaded. Please try again in a few minutes.");
    } else if (error.message.includes("API key")) {
      throw new Error("Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.");
    } else {
      throw new Error(`Failed to scan receipt: ${error.message}`);
    }
  }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}
