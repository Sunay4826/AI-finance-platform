"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ACCENT_COLORS = ["#ef4444", "#0ea5e9", "#14b8a6", "#84cc16", "#f59e0b", "#a855f7", "#64748b"];
const TOP_CATEGORIES = 5;

const formatCategoryName = (value) =>
  value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const getTransactionTitle = (transaction) => {
  if (transaction.description?.trim()) {
    return transaction.description.trim();
  }

  if (transaction.category?.trim()) {
    return transaction.category
      .split(/[-_]/g)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return "Untitled Transaction";
};

export function DashboardOverview({ accounts, transactions }) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const setSegmentDetails = (entry, index, percentage) =>
    setHoveredSegment({
      name: entry.name,
      value: entry.value,
      percentage,
      color: ACCENT_COLORS[index % ACCENT_COLORS.length],
    });

  // Filter transactions for selected account
  const accountTransactions = transactions.filter(
    (t) => t.accountId === selectedAccountId
  );

  // Get recent transactions (last 5)
  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Calculate expense breakdown for current month
  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Group expenses by category
  const expensesByCategory = currentMonthExpenses.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += transaction.amount;
    return acc;
  }, {});

  const breakdownData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
    }))
    .sort((a, b) => b.value - a.value);

  const totalExpenses = breakdownData.reduce((sum, entry) => sum + entry.value, 0);
  const topBreakdown = breakdownData.slice(0, TOP_CATEGORIES);
  const remainingTotal = breakdownData
    .slice(TOP_CATEGORIES)
    .reduce((sum, entry) => sum + entry.value, 0);
  const displayBreakdown =
    remainingTotal > 0
      ? [...topBreakdown, { name: "OTHER", value: remainingTotal }]
      : topBreakdown;

  return (
    <div className="grid items-start gap-4 md:gap-5 md:grid-cols-2">
      {/* Recent Transactions Card */}
      <Card className="dashboard-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Recent Transactions
          </CardTitle>
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[150px] bg-white/90 dark:bg-zinc-900/70 border-slate-300 dark:border-zinc-600 text-slate-900 dark:text-slate-100">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-slate-600 dark:text-slate-300 py-10">
                No recent transactions
              </p>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-xl px-3 py-3 border border-slate-300/80 dark:border-zinc-700 bg-slate-50/90 dark:bg-zinc-900/55 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">
                      {getTransactionTitle(transaction)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {format(new Date(transaction.date), "PP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center",
                        transaction.type === "EXPENSE"
                          ? "text-red-500"
                          : "text-green-500"
                      )}
                    >
                      {transaction.type === "EXPENSE" ? (
                        <ArrowDownRight className="mr-1 h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="mr-1 h-4 w-4" />
                      )}
                      ₹{transaction.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown Card */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Monthly Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-5 md:px-6 md:pb-6">
          {breakdownData.length === 0 ? (
            <p className="text-center text-slate-600 dark:text-slate-300 py-14">
              No expenses this month
            </p>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-300/70 dark:border-zinc-700 bg-slate-50/85 dark:bg-zinc-900/40 p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      Total Spent
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      ₹{totalExpenses.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-300/80 dark:border-zinc-700 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300">
                    {displayBreakdown.length} categories
                  </span>
                </div>
                <div className="mt-3 flex h-3 md:h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                  <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                    {displayBreakdown.map((entry, index) => {
                      const width = totalExpenses ? (entry.value / totalExpenses) * 100 : 0;
                      const percentage = totalExpenses ? (entry.value / totalExpenses) * 100 : 0;
                      const color = ACCENT_COLORS[index % ACCENT_COLORS.length];
                      const isActive = hoveredSegment?.name === entry.name;

                      return (
                        <Tooltip key={entry.name}>
                          <TooltipTrigger asChild>
                            <div
                              role="button"
                              tabIndex={0}
                              onMouseEnter={() => setSegmentDetails(entry, index, percentage)}
                              onMouseLeave={() => setHoveredSegment(null)}
                              onFocus={() => setSegmentDetails(entry, index, percentage)}
                              onClick={() => setSegmentDetails(entry, index, percentage)}
                              onTouchStart={() => setSegmentDetails(entry, index, percentage)}
                              onBlur={() => setHoveredSegment(null)}
                              style={{
                                width: `${Math.max(width, 2.8)}%`,
                                backgroundColor: color,
                                minWidth: 10,
                              }}
                              className={cn(
                                "cursor-pointer transition-opacity focus:outline-none",
                                isActive ? "opacity-100" : "opacity-90 hover:opacity-100"
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900"
                          >
                            {formatCategoryName(entry.name)}: ₹
                            {entry.value.toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}{" "}
                            ({percentage.toFixed(1)}%)
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </TooltipProvider>
                </div>
                <div className="mt-2 min-h-5 text-xs text-slate-600 dark:text-slate-300">
                  {hoveredSegment ? (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: hoveredSegment.color }}
                      />
                      <span className="font-medium">
                        {formatCategoryName(hoveredSegment.name)}
                      </span>
                      <span>
                        ₹{hoveredSegment.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ({hoveredSegment.percentage.toFixed(1)}%)
                      </span>
                    </span>
                  ) : (
                    <span>Hover a color segment to see category details</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {displayBreakdown.map((entry, index) => {
                  const percentage = totalExpenses
                    ? ((entry.value / totalExpenses) * 100).toFixed(1)
                    : "0.0";
                  const numericPercentage = totalExpenses
                    ? (entry.value / totalExpenses) * 100
                    : 0;
                  const isActive = hoveredSegment?.name === entry.name;

                  return (
                    <div
                      key={entry.name}
                      role="button"
                      tabIndex={0}
                      onMouseEnter={() => setSegmentDetails(entry, index, numericPercentage)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      onFocus={() => setSegmentDetails(entry, index, numericPercentage)}
                      onBlur={() => setHoveredSegment(null)}
                      onClick={() => setSegmentDetails(entry, index, numericPercentage)}
                      className={cn(
                        "rounded-lg border px-3 py-2 cursor-pointer transition-colors",
                        isActive
                          ? "border-slate-400/80 bg-slate-100 dark:border-zinc-500 dark:bg-zinc-800/60"
                          : "border-slate-300/60 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-900/30"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: ACCENT_COLORS[index % ACCENT_COLORS.length] }}
                          />
                          <span className="truncate font-medium text-slate-800 dark:text-slate-100">
                            {formatCategoryName(entry.name)}
                          </span>
                        </div>
                        <div className="shrink-0 text-slate-600 dark:text-slate-300">
                          ₹{entry.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ({percentage}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
