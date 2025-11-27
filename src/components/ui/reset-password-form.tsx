"use client";

import { useState } from "react";
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
  const router = useRouter();

  const token = new URLSearchParams(window.location.search).get("token");

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return; // stop the function
    }

    if (!token) {
      toast.error("Invalid or missing token");
      router.replace("/forgot-password");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword, // use state value
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
      <div className="w-full bg-white dark:bg-gray-800">
        <h1 className="text-xl font-semibold mb-4 text-left text-gray-900 dark:text-white">
          Reset Password
        </h1>

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
            disabled={loading}
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
