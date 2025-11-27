"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleReset = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      await authClient.requestPasswordReset({
        email: email, // required
        redirectTo: "/reset-password", // optional
      });
      toast.success("If this email exists, a reset link has been sent ✅");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reset link. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full min-h-screen px-6 flex items-center justify-center">
      <div className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription className="text-sm">
            Enter your email and we’ll send you a password reset link
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 mt-4">
          <div className="grid gap-2 ">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button
            className="w-full bg-[#054744]"
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Send Reset Link"
            )}
          </Button>
          <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
            Remember your password?{" "}
            <Link href="/sign-in" className="underline hover:text-primary">
              Sign in
            </Link>
          </p>
        </CardContent>
      </div>
    </Card>
  );
}
