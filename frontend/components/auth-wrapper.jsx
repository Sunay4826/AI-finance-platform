"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

export function AuthButtons() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const addTransactionHref = useMemo(() => {
    const match = pathname?.match(/^\/account\/([^/?#]+)/);
    return match?.[1]
      ? `/transaction/create?accountId=${match[1]}`
      : "/transaction/create";
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <Link
          href="/dashboard"
          className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 transition-colors"
        >
          <Button variant="outline">
            <LayoutDashboard size={18} />
            <span className="hidden md:inline">Dashboard</span>
          </Button>
        </Link>
        <Link href={addTransactionHref}>
          <Button className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white">
            <PenBox size={18} />
            <span className="hidden md:inline">Add Transaction</span>
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings size={18} />
            <span className="hidden md:inline">Settings</span>
          </Button>
        </Link>
      </SignedIn>
      <SignedOut>
        <SignInButton forceRedirectUrl="/dashboard">
          <Button variant="outline">Login</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-10 h-10",
            },
          }}
        />
      </SignedIn>
    </>
  );
}

export function AuthNavigation() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <a href="#how-it-works" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          How it Works
        </a>
        <a href="#pricing" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Pricing
        </a>
      </>
    );
  }

  return (
    <>
      <SignedOut>
        <a href="#how-it-works" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          How it Works
        </a>
        <a
          href="#pricing"
          className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Pricing
        </a>
      </SignedOut>
    </>
  );
}
