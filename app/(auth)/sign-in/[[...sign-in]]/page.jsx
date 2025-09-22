import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-1">Sign in to Welth</h1>
        <p className="text-center text-gray-600 mb-6">Welcome back! Please sign in to continue</p>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
          appearance={{
            variables: { colorPrimary: "#2563eb", borderRadius: "0.75rem" },
            elements: {
              card: "shadow-2xl border border-gray-100",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
              footer: "hidden md:block",
            },
            layout: { socialButtonsPlacement: "top", socialButtonsVariant: "iconButton" },
          }}
        />
      </div>
    </div>
  );
}
