"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { checkUser } from "@/lib/checkUser";

export async function ensureUser() {
  return await checkUser();
}

export async function deleteUserAccount() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get the user from our database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Delete all user data from our database
    // The cascade delete will handle related records
    await db.user.delete({
      where: { id: user.id },
    });

    // Delete the user from Clerk authentication
    try {
      await clerkClient.users.deleteUser(userId);
    } catch (clerkError) {
      console.error("Failed to delete user from Clerk:", clerkError);
      // Continue even if Clerk deletion fails, as the main data is already deleted
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw new Error(error.message || "Failed to delete account");
  }
}
