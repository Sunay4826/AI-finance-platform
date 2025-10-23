import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AuthButtons, AuthNavigation } from "./auth-wrapper";

const Header = () => {
  const hasClerk = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_placeholder" &&
    process.env.CLERK_SECRET_KEY
  );

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <Image
            src={"/logo.png"}
            alt="Welth Logo"
            width={200}
            height={60}
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Navigation Links - Different for signed in/out users */}
        <div className="hidden md:flex items-center space-x-8">
          {hasClerk ? (
            <AuthNavigation />
          ) : (
            <>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600">
                How it Works
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600">
                Pricing
              </a>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {hasClerk ? (
            <AuthButtons />
          ) : (
            <div className="text-sm text-gray-500">
              Configure Clerk authentication to enable login
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
