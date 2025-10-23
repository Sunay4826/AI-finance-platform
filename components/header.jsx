"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [AuthButtons, setAuthButtons] = useState(null);
  const [AuthNavigation, setAuthNavigation] = useState(null);

  useEffect(() => {
    setMounted(true);
    
    // Dynamically import auth components only on client side
    const loadAuthComponents = async () => {
      try {
        const authWrapper = await import("./auth-wrapper");
        setAuthButtons(() => authWrapper.AuthButtons);
        setAuthNavigation(() => authWrapper.AuthNavigation);
      } catch (error) {
        console.error("Failed to load auth components:", error);
      }
    };

    loadAuthComponents();
  }, []);

  const hasClerk = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_placeholder" &&
    process.env.CLERK_SECRET_KEY
  );

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
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
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600">
              How it Works
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600">
              Pricing
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </nav>
      </header>
    );
  }

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
          {hasClerk && AuthNavigation ? (
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
          {hasClerk && AuthButtons ? (
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
