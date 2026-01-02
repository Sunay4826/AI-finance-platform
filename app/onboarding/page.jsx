"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ensureUser } from "@/actions/user";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Ensure user is created and redirect to dashboard
    const setupUser = async () => {
      try {
        await ensureUser();
      } catch (error) {
        console.error("Error ensuring user exists:", error);
      }
      
      // Redirect to dashboard after a brief moment
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    };

    setupUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to Welth!</CardTitle>
          <CardDescription className="text-center">
            Setting up your account...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-sm text-gray-600 text-center">
            Redirecting you to your dashboard...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

