"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";

export function AuthButtons() {
  return (
    <>
      <SignedIn>
        <Link
          href="/dashboard"
          className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
        >
          <Button variant="outline">
            <LayoutDashboard size={18} />
            <span className="hidden md:inline">Dashboard</span>
          </Button>
        </Link>
        <a href="/transaction/create">
          <Button className="flex items-center gap-2">
            <PenBox size={18} />
            <span className="hidden md:inline">Add Transaction</span>
          </Button>
        </a>
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
  return (
    <>
      <SignedOut>
        <a href="#how-it-works" className="text-gray-600 hover:text-blue-600">
          How it Works
        </a>
        <a
          href="#pricing"
          className="text-gray-600 hover:text-blue-600"
        >
          Pricing
        </a>
      </SignedOut>
    </>
  );
}
