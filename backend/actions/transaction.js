"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;
const GEMINI_MODEL_CANDIDATES = Array.from(
  new Set(
    [
      process.env.GEMINI_MODEL,
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ]
      .filter(Boolean)
      .map((name) => String(name).replace(/^models\//, ""))
  )
);

const errorMessage = (error, fallback = "Request failed") => {
  if (error instanceof Error && typeof error.message === "string") {
    return error.message;
  }
  if (typeof error === "string") return error;
  return fallback;
};

const serializeAmount = (obj) => ({
  ...obj,
  amount: typeof obj.amount === 'number' ? obj.amount : obj.amount.toNumber(),
});

// Create Transaction
export async function createTransaction(data) {
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

    if (!data?.accountId || typeof data.accountId !== "string") {
      throw new Error("Account is required");
    }

    console.info("[createTransaction] Requested accountId:", data.accountId);

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

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
      },
    });

    if (!account || account.userId !== user.id) {
      throw new Error("Account not found");
    }

    console.info("[createTransaction] Using accountId:", account.id);

    // Calculate new balance (handle Prisma Decimal type)
    const currentBalance = typeof account.balance === 'number' 
      ? account.balance 
      : account.balance.toNumber();
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = currentBalance + balanceChange;

    // Ensure date is a Date object
    const transactionDate = data.date instanceof Date 
      ? data.date 
      : new Date(data.date);

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          type: data.type,
          amount: data.amount,
          description: data.description,
          date: transactionDate,
          category: data.category,
          isRecurring: data.isRecurring,
          recurringInterval: data.recurringInterval,
          accountId: account.id,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(transactionDate, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: account.id },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw new Error(errorMessage(error, "Failed to create transaction"));
  }
}

export async function getTransaction(id) {
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
    throw new Error(errorMessage(error, "Failed to update transaction"));
  }
}

// Delete Single Transaction
export async function deleteTransaction(transactionId) {
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
    throw new Error(errorMessage(error, "Failed to delete transaction"));
  }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
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
    throw new Error(errorMessage(error, "Failed to fetch transactions"));
  }
}

// Scan Receipt
export async function scanReceipt(fileData) {
  try {
    console.log("scanReceipt called with:", {
      type: typeof fileData,
      hasData: fileData && typeof fileData === 'object' && 'data' in fileData,
      keys: fileData && typeof fileData === 'object' ? Object.keys(fileData) : null,
    });
    
    if (!genAI) {
      console.error("GEMINI_API_KEY is not set. Current env:", {
        hasKey: !!process.env.GEMINI_API_KEY,
        keyLength: process.env.GEMINI_API_KEY?.length,
        keyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10),
      });
      throw new Error(
        "AI receipt scanning is disabled. Add GEMINI_API_KEY to your environment variables to enable it."
      );
    }
    
    console.log("genAI initialized successfully");

    // Handle both File object (legacy) and fileData object (new format)
    let base64String;
    let mimeType;
    
    if (fileData && typeof fileData === 'object' && 'data' in fileData) {
      // New format: { data: base64String, mimeType: string }
      base64String = fileData.data;
      mimeType = fileData.mimeType || "image/jpeg";
      
      console.log("Using new format:", {
        base64Length: base64String?.length,
        mimeType: mimeType,
      });
      
      if (!base64String || base64String.length === 0) {
        throw new Error("Empty image data received");
      }
    } else if (fileData && typeof fileData.arrayBuffer === 'function') {
      // Legacy format: File object
      console.log("Using legacy File format");
      const arrayBuffer = await fileData.arrayBuffer();
      base64String = Buffer.from(arrayBuffer).toString("base64");
      mimeType = fileData.type || "image/jpeg";
    } else {
      console.error("Invalid file data format:", {
        type: typeof fileData,
        isObject: typeof fileData === 'object',
        hasArrayBuffer: fileData && typeof fileData.arrayBuffer === 'function',
        hasData: fileData && typeof fileData === 'object' && 'data' in fileData,
      });
      throw new Error("Invalid file data format. Expected file object or {data, mimeType} object.");
    }

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format YYYY-MM-DD)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense)
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "YYYY-MM-DD",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If it's not a receipt, return an empty object {}
    `;

    // Gemini API format for multimodal: pass as array of parts
    const parts = [
      {
        inlineData: {
          data: base64String,
          mimeType: mimeType,
        },
      },
      {
        text: prompt,
      },
    ];

    console.log("Calling generateContent with parts:", {
      hasImage: !!parts[0].inlineData,
      hasText: !!parts[1].text,
      imageDataLength: parts[0].inlineData.data.length,
      mimeType: parts[0].inlineData.mimeType,
    });

    let lastError;
    for (const modelName of GEMINI_MODEL_CANDIDATES) {
      const model = genAI.getGenerativeModel({ model: modelName });

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(
            `Model "${modelName}" attempt ${attempt}: calling Gemini API with image data (${base64String.length} chars, mimeType: ${mimeType})`
          );

          const result = await model.generateContent(parts);
          console.log("generateContent call successful");

          const response = await result.response;
          const text = response.text();
          console.log("Gemini API response:", text.substring(0, 200)); // Log first 200 chars
          const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

          try {
            const data = JSON.parse(cleanedText);

            // Validate that we got data (not empty object)
            if (!data || Object.keys(data).length === 0) {
              throw new Error("No receipt data found in image");
            }

            // Validate required fields
            if (!data.amount || !data.date) {
              throw new Error("Incomplete receipt data extracted");
            }

            // Parse date and ensure it's valid
            let parsedDate;
            try {
              parsedDate = new Date(data.date);
              if (isNaN(parsedDate.getTime())) {
                throw new Error("Invalid date format");
              }
            } catch (dateError) {
              console.error("Date parsing error:", dateError);
              // Use current date as fallback
              parsedDate = new Date();
            }

            const resultData = {
              amount: parseFloat(data.amount),
              date: parsedDate.toISOString(), // Serialize date as ISO string
              description: data.description || "",
              category: data.category || "other-expense",
              merchantName: data.merchantName || "",
            };

            console.log("Successfully extracted receipt data:", resultData);
            return resultData;
          } catch (parseError) {
            console.error("Error parsing JSON response:", parseError);
            console.error("Response text:", cleanedText);
            throw new Error("Invalid response format from Gemini API");
          }
        } catch (error) {
          lastError = error;
          const errorMessage = error?.message || "";
          const isModelNotFound =
            errorMessage.includes("404") &&
            (errorMessage.includes("is not found for API version") ||
              errorMessage.includes("not supported for generateContent"));

          console.error(`Model "${modelName}" attempt ${attempt} failed:`, {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });

          if (isModelNotFound) {
            console.log(`Model "${modelName}" unavailable, trying next model...`);
            break;
          }

          // If it's a quota error, don't retry
          if (
            errorMessage.includes("429") ||
            errorMessage.includes("quota") ||
            errorMessage.includes("RESOURCE_EXHAUSTED")
          ) {
            throw new Error(
              "Gemini API quota exceeded. Please check your billing and usage limits."
            );
          }

          // Retry only for temporary availability failures
          if (
            errorMessage.includes("503") ||
            errorMessage.includes("overloaded") ||
            errorMessage.includes("UNAVAILABLE")
          ) {
            if (attempt < 2) {
              console.log(`Waiting ${attempt * 2} seconds before retry...`);
              await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
              continue;
            }
          }

          // Non-retryable error for this model; try next model candidate.
          break;
        }
      }
    }

    throw (
      lastError ||
      new Error(
        `No supported Gemini model found. Tried: ${GEMINI_MODEL_CANDIDATES.join(
          ", "
        )}`
      )
    );
  } catch (error) {
    const errorMessage = error?.message || String(error) || "Unknown error";
    const errorString = typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage);
    
    console.error("Error scanning receipt:", {
      message: errorString,
      stack: error?.stack,
      name: error?.name,
      fullError: error,
    });
    
    // Provide more specific error messages
    if (errorString.includes("429") || errorString.includes("quota") || errorString.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Gemini API quota exceeded. Please check your billing and usage limits.");
    } else if (errorString.includes("503") || errorString.includes("overloaded") || errorString.includes("UNAVAILABLE")) {
      throw new Error("Gemini API is currently overloaded. Please try again in a few minutes.");
    } else if (errorString.includes("API key") || errorString.includes("API_KEY") || errorString.includes("401") || errorString.includes("API_KEY_INVALID")) {
      throw new Error("Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable.");
    } else if (
      errorString.includes("is not found for API version") ||
      errorString.includes("not supported for generateContent")
    ) {
      throw new Error(
        "Gemini model not available. Set GEMINI_MODEL to a supported model (recommended: gemini-1.5-flash)."
      );
    } else {
      throw new Error(`Failed to scan receipt: ${errorString}`);
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
