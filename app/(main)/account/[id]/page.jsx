import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { TransactionTable } from "../_components/transaction-table";
import { AccountHeader } from "../_components/account-header";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, ReceiptText, Scale } from "lucide-react";

export default async function AccountPage({ params }) {
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;
  const isEmpty = !transactions || transactions.length === 0;

  const totals = (transactions || []).reduce(
    (acc, tx) => {
      if (tx.type === "INCOME") acc.income += Number(tx.amount || 0);
      if (tx.type === "EXPENSE") acc.expense += Number(tx.amount || 0);
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const net = totals.income - totals.expense;
  const avgTransaction = (transactions || []).length
    ? (totals.income + totals.expense) / transactions.length
    : 0;

  return (
    <div className="space-y-6 px-2 md:px-5">
      <AccountHeader account={account} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="dashboard-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Income</p>
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              ₹{totals.income.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Expense</p>
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-red-600">
              ₹{totals.expense.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Net</p>
              <Scale className="h-4 w-4 text-slate-500" />
            </div>
            <p
              className={`mt-2 text-2xl font-bold ${
                net >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              ₹{net.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Avg Transaction</p>
              <ReceiptText className="h-4 w-4 text-slate-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              ₹{avgTransaction.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <AccountChart transactions={transactions} accountId={id} />
      </Suspense>

      {isEmpty && (
        <Card className="border-dashed">
          <CardContent className="p-5">
            <p className="font-medium">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              This account is ready. Add your first transaction to unlock charts,
              monthly summaries, and better insights.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
}
