import { redirect } from "next/navigation";
import { ensureUser } from "@/actions/user";
import { unstable_noStore as noStore } from "next/cache";

// Force dynamic rendering since we need to access user authentication
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OnboardingPage() {
  // Explicitly mark this route as dynamic to prevent static generation
  noStore();
  
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

