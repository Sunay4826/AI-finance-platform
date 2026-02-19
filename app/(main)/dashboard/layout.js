import DashboardPage from "./page";
import { BarLoader } from "react-spinners";
import { Suspense } from "react";

export default function Layout() {
  return (
    <div className="px-2 md:px-3 dashboard-surface">
      <div className="flex items-end justify-between mb-6 md:mb-8 pt-2">
        <div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight dashboard-title">
            Dashboard
          </h1>
          <div className="mt-2 h-0.5 w-16 rounded-full bg-teal-700/70 dark:bg-teal-400/60" />
          <p className="text-slate-600 dark:text-slate-300/85 mt-2 text-sm md:text-base">
            Track spending, monitor budgets, and manage accounts in one place.
          </p>
        </div>
      </div>
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#60a5fa" />}
      >
        <DashboardPage />
      </Suspense>
      <div className="h-4" />
    </div>
  );
}
