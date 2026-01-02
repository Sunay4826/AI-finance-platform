import { redirect } from "next/navigation";
import { ensureUser } from "@/actions/user";

export default async function OnboardingPage() {
  try {
    // Ensure user is created in database
    await ensureUser();
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    // Continue anyway - checkUser will handle it on dashboard
  }
  
  // Server-side redirect
  redirect("/dashboard");
}

