"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function DeleteAccountButton() {
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmation !== "DELETE") {
      toast.error('Please type "DELETE" to confirm.');
      return;
    }

    setLoading(true);
    try {
      await authClient.deleteUser({ callbackURL: "/sign-in" }); // Replace with your delete account API
      toast.success("Account deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2">
          <Trash className="h-4 w-4" />
          Delete Account
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent and cannot be undone. To confirm, type <strong>DELETE</strong> below.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-2">
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="w-full p-2 border rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
