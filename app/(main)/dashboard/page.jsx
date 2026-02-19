import { getDashboardBootstrap } from "@/actions/dashboard";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "./_components/budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Landmark,
} from "lucide-react";
import { DashboardOverview } from "./_components/transaction-overview";

export default async function DashboardPage() {
  const { accounts, transactions, budgetData } = await getDashboardBootstrap();

  const totalBalance = (accounts || []).reduce(
    (sum, account) => sum + Number(account.balance || 0),
    0
  );

  const now = new Date();
  const thisMonthTransactions = (transactions || []).filter((transaction) => {
    const date = new Date(transaction.date);
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  });

  const monthlyIncome = thisMonthTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const monthlyExpense = thisMonthTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const savingsRate =
    monthlyIncome > 0
      ? (((monthlyIncome - monthlyExpense) / monthlyIncome) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="dashboard-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Balance</p>
              <Wallet className="h-4 w-4 text-teal-700 dark:text-teal-400" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
              ₹{totalBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">Income (This Month)</p>
              <TrendingUp className="h-4 w-4 text-teal-700 dark:text-teal-400" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
              ₹{monthlyIncome.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">Expense (This Month)</p>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
              ₹{monthlyExpense.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">Accounts</p>
              <Landmark className="h-4 w-4 text-teal-700 dark:text-teal-400" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {accounts?.length || 0}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {savingsRate !== null ? `${savingsRate}% savings rate` : "Add transactions to track savings"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
      />

      {/* Dashboard Overview */}
      <DashboardOverview
        accounts={accounts}
        transactions={transactions || []}
      />

      {(!transactions || transactions.length === 0) && (
        <Card className="dashboard-card">
          <CardContent className="p-5 md:p-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-100">
                You are ready to start tracking
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Add your first transaction to unlock trends, category insights, and budget tracking.
              </p>
            </div>
            <a
              href="/transaction/create"
              className="shrink-0 inline-flex h-9 items-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800 transition-colors"
            >
              Add Transaction
            </a>
          </CardContent>
        </Card>
      )}

      {/* Accounts Grid */}
      <div className="grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="dashboard-card cursor-pointer border-dashed border-teal-300/60 dark:border-zinc-600 min-h-[200px]">
            <CardContent className="flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 h-full pt-5">
              <div className="rounded-full p-3 bg-teal-500/10 dark:bg-zinc-800 border border-teal-300/60 dark:border-zinc-600 mb-3">
                <Plus className="h-7 w-7 text-teal-700 dark:text-slate-300" />
              </div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Add New Account</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Create another wallet in seconds</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
        {accounts && accounts.length > 0 &&
          accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
      </div>
    </div>
  );
}
