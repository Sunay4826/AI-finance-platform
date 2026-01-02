import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    // First, try to find existing user
    let loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    // User doesn't exist, create it
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress || 'User';
    const email = user.emailAddresses[0]?.emailAddress || '';

    loggedInUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl || null,
        email,
      },
    });

    return loggedInUser;
  } catch (error) {
    console.error("Error in checkUser:", error);
    // Try to find user again in case of race condition
    try {
      const existingUser = await db.user.findUnique({
        where: {
          clerkUserId: user.id,
        },
      });
      if (existingUser) {
        return existingUser;
      }
    } catch (retryError) {
      console.error("Error retrying user lookup:", retryError);
    }
    // Re-throw the error so calling code can handle it
    throw new Error(`Failed to create or find user: ${error.message}`);
  }
};
