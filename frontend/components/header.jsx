"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [AuthButtons, setAuthButtons] = useState(null);
  const [AuthNavigation, setAuthNavigation] = useState(null);
  const [theme, setTheme] = useState("light");

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

    // Initialize theme
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem("theme") : null;
      const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = stored || (prefersDark ? "dark" : "light");
      setTheme(initial);
      if (initial === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try { window.localStorage.setItem("theme", next); } catch {}
  };

  const hasClerk = Boolean(
    typeof window !== 'undefined' && 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_placeholder"
  );

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <header className="fixed top-0 w-full z-50">
        <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between glass elevate rounded-b-xl">
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
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-slate-100">
                  <path d="M21.64 13.65A9 9 0 0 1 10.35 2.36 7 7 0 1 0 21.64 13.65z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-500">
                  <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0 4a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1zm0-20a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zM3 11a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm16 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1zM5.64 18.36a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zM16.24 5.64a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zM18.36 18.36a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0zM7.05 5.64a1 1 0 0 1 0 1.41l-.71.71A1 1 0 1 1 4.93 6.35l.71-.71a1 1 0 0 1 1.41 0z"/>
                </svg>
              )}
            </button>
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="fixed top-0 w-full z-50">
      <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between glass elevate rounded-b-xl">
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
              <a href="#how-it-works" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                How it Works
              </a>
              <a href="#pricing" className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Pricing
              </a>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-slate-100">
                <path d="M21.64 13.65A9 9 0 0 1 10.35 2.36 7 7 0 1 0 21.64 13.65z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-500">
                <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0 4a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1zm0-20a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zM3 11a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm16 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1zM5.64 18.36a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zM16.24 5.64a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41zM18.36 18.36a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0zM7.05 5.64a1 1 0 0 1 0 1.41l-.71.71A1 1 0 1 1 4.93 6.35l.71-.71a1 1 0 0 1 1.41 0z"/>
              </svg>
            )}
          </button>
          {hasClerk && AuthButtons ? (
            <AuthButtons />
          ) : (
            <div className="text-sm text-muted-foreground">
              Configure Clerk authentication to enable login
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
