"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { BarChart3, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

export function AccountChart({ transactions, accountId }) {
  const [dateRange, setDateRange] = useState("1M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    // Filter transactions within date range
    const filtered = transactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
    );

    // Group transactions by date
    const grouped = filtered.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd");
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      if (transaction.type === "INCOME") {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expense += transaction.amount;
      }
      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [transactions, dateRange]);

  // Calculate totals for the selected period
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  const signedTotal = useMemo(() => {
    // Interpret total as (+ income) + (- expense)
    return totals.income - totals.expense;
  }, [totals]);

  const hasChartData = filteredData.length > 0;

  return (
    <Card className="dashboard-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-base font-semibold">
          Transaction Overview
        </CardTitle>
        <Select defaultValue={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-sm">
          <div className="text-center rounded-lg border border-emerald-200/70 dark:border-emerald-700/30 bg-emerald-50/60 dark:bg-emerald-900/10 p-3">
            <p className="text-muted-foreground">Total Income</p>
            <p className="text-xl font-bold text-green-600">
              ₹{totals.income.toFixed(2)}
            </p>
          </div>
          <div className="text-center rounded-lg border border-red-200/70 dark:border-red-700/30 bg-red-50/60 dark:bg-red-900/10 p-3">
            <p className="text-muted-foreground">Total Expenses</p>
            <p className="text-xl font-bold text-red-600">
              ₹{totals.expense.toFixed(2)}
            </p>
          </div>
          <div className="text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/30 p-3">
            <p className="text-muted-foreground">Net</p>
            <p
              className={`text-xl font-bold ${
                signedTotal >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ₹{signedTotal.toFixed(2)}
            </p>
          </div>
        </div>
        {hasChartData ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                barCategoryGap="60%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  formatter={(value) => [`₹${value}`, undefined]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#22c55e"
                  maxBarSize={56}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#ef4444"
                  maxBarSize={56}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] border border-dashed rounded-xl flex items-center justify-center">
            <div className="text-center px-4">
              <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">No transaction data in this range</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add income or expense entries to see trends and comparisons.
              </p>
              <Link
                href={
                  accountId
                    ? `/transaction/create?accountId=${accountId}`
                    : "/transaction/create"
                }
                className="inline-block mt-4"
              >
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add First Transaction
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
