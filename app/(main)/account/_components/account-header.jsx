"use client";

import { useRouter } from "next/navigation";
import { Trash2, MoreHorizontal, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteAccount } from "@/actions/account";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

export function AccountHeader({ account }) {
  const router = useRouter();
  const { name, type, balance, id, _count } = account;

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deletedAccount,
    error: deleteError,
  } = useFetch(deleteAccount);

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${name}" account? This will permanently delete the account and ALL its ${_count.transactions} transactions. This action cannot be undone.`
      )
    ) {
      return;
    }

    await deleteFn(id);
  };

  useEffect(() => {
    if (deletedAccount?.success) {
      toast.success("Account deleted successfully");
      router.push("/dashboard");
    }
  }, [deletedAccount, router]);

  useEffect(() => {
    if (deleteError) {
      toast.error(deleteError.message || "Failed to delete account");
    }
  }, [deleteError]);

  return (
    <div className="dashboard-card p-5 md:p-6 flex gap-4 items-end justify-between">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 flex items-center justify-center">
          <Landmark className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 capitalize">
            {name}
          </h1>
          <p className="text-muted-foreground">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 pb-2">
        <div className="flex items-center gap-2">
          <Link href={`/transaction/create?accountId=${id}`}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Add Transaction
            </Button>
          </Link>
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold">
              ₹{parseFloat(balance).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">
              {_count.transactions} Transactions
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
