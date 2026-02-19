"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Info } from "lucide-react";
import { deleteUserAccount } from "@/actions/user";
import { toast } from "sonner";

export function DeleteAccountSection() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (confirmationText !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm");
      return;
    }

    setIsDeleting(true);
    
    try {
      await deleteUserAccount();
      toast.success("Account deleted successfully");
      router.push("/");
    } catch (error) {
      toast.error(error.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  const handleShowConfirmation = () => {
    setShowConfirmation(true);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmationText("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Delete Account</h3>
        <p className="text-sm text-muted-foreground mt-1">
          This permanently removes your account and all associated data.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This action removes:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>All your financial accounts</li>
            <li>All transaction history</li>
            <li>All budget data</li>
            <li>Your profile and settings</li>
          </ul>
        </AlertDescription>
      </Alert>

      {!showConfirmation ? (
        <Button
          variant="outline"
          onClick={handleShowConfirmation}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Account
        </Button>
      ) : (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/40">
          <div>
            <label className="block text-sm font-medium mb-2">
              To confirm, type <strong>DELETE</strong> in the box below:
            </label>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type DELETE to confirm"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmationText !== "DELETE"}
              className="flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Yes, Delete My Account
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isDeleting}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
