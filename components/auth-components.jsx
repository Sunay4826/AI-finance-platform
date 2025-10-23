"use client";

import dynamic from "next/dynamic";

// Dynamically import the auth components to prevent SSR issues
export const AuthButtons = dynamic(
  () => import("./auth-wrapper").then((mod) => ({ default: mod.AuthButtons })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    ),
  }
);

export const AuthNavigation = dynamic(
  () => import("./auth-wrapper").then((mod) => ({ default: mod.AuthNavigation })),
  {
    ssr: false,
    loading: () => (
      <>
        <a href="#how-it-works" className="text-gray-600 hover:text-blue-600">
          How it Works
        </a>
        <a href="#pricing" className="text-gray-600 hover:text-blue-600">
          Pricing
        </a>
      </>
    ),
  }
);
