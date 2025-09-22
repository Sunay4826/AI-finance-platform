"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteUserAccount } from "@/actions/user";
import { toast } from "sonner";

export function DeleteAccountSection() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user } = useUser();
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
        <h3 className="text-lg font-semibold text-red-600">Delete Account</h3>
        <p className="text-sm text-gray-600 mt-1">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
      </div>

      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Warning:</strong> This will permanently delete:
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
          variant="destructive"
          onClick={handleShowConfirmation}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Account
        </Button>
      ) : (
        <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
          <div>
            <label className="block text-sm font-medium text-red-800 mb-2">
              To confirm, type <strong>DELETE</strong> in the box below:
            </label>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="border-red-300 focus:border-red-500"
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
