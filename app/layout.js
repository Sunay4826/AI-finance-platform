import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Welth",
  description: "One stop Finance Platform",
};

export default function RootLayout({ children }) {
  const publishableKeyRaw = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const publishableKey = typeof publishableKeyRaw === "string" ? publishableKeyRaw.trim() : undefined;
  const safeClerkKey = publishableKey && /^pk_(test|live)_/.test(publishableKey)
    ? publishableKey
    : "pk_test_placeholder";
  return (
    <ClerkProvider 
      publishableKey={safeClerkKey}
      signInFallbackRedirectUrl="/onboarding"
      signUpFallbackRedirectUrl="/onboarding"
    >
      <html lang="en">
        <head>
          <link rel="icon" href="/logo-sm.png" sizes="any" />
        </head>
        <body className={`${inter.className} app-bg`}>
          <Header />
          <main className="min-h-screen pt-20">{children}</main>
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
