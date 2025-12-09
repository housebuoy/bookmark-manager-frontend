"use client";

import { useState, useEffect } from "react"; // ⬅️ Import useEffect
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null); // ⬅️ State for token
  const router = useRouter();

  // ⬅️ FIX: Defer client-side code to run only after mounting
  useEffect(() => {
    // This code only runs in the browser where 'window' exists.
    const urlParams = new URLSearchParams(window.location.search);
    const fetchedToken = urlParams.get("token");
    setToken(fetchedToken);
    
    if (!fetchedToken) {
        // Optional: Immediately redirect if no token is found on the client
        toast.error("Invalid or missing token in URL.");
        router.replace("/forgot-password");
    }
  }, [router]); // Depend on router for replace function

  const handleResetPassword = async () => {
    // Check if the token state is loaded
    if (!token) {
      toast.error("Token is still loading or invalid.");
      return; 
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Use the token from the component state
      const { error } = await authClient.resetPassword({
        newPassword,
        token,
      });

      if (error) {
        toast.error(error.message || "Failed to reset password");
      } else {
        toast.success("Password reset successfully!");
        router.push("/sign-in");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Optional: Show a loading state if the token hasn't been parsed yet
  if (token === null) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-gray-400" />
          </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
      <div className="w-full bg-white dark:bg-gray-800">
        <h1 className="text-xl font-semibold mb-4 text-left text-gray-900 dark:text-white">
          Reset Password
        </h1>

        {/* ... form content remains the same, using 'newPassword' and 'confirmPassword' ... */}

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>New Password</Label>
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Confirm Password</Label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button
            onClick={handleResetPassword}
            disabled={loading || !token} // Disable button if loading or token is missing
            className="w- bg-[#054744]"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Reset Password"
            )}
          </Button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            Remember your password?{" "}
            <Link
              href="/sign-in"
              className="underline text-primary dark:text-primary"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}