"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Key } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async () => {
  setLoading(true);

  try {
    await signIn.email(
      {
        email,
        password,
        callbackURL: "/",
        rememberMe,
      },
      {
        onRequest: () => setLoading(true),

        onError: (ctx) => {
          setLoading(false);

          if (ctx.error.status === 403) {
            toast.error("Your email is not verified. Check your inbox or resend the link.");
            return;
          }

          toast.error(ctx.error.message || "Something went wrong.");
        },

        onSuccess: () => {
          setLoading(false);
          toast.success("Signed in successfully!");
        },

        onResponse: () => setLoading(false),
      }
    );
  } catch (err) {
    console.error("Sign-in error:", err);
    setLoading(false);
    toast.error("Unexpected error occurred. Try again.");
  }
};

  return (
    <Card className="w-full min-h-screen px-10 sm:flex justify-center md:px-10 sm:px-5">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email and password to access your account for bookmark manager
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4">
          {/* Email */}
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label>Password</Label>
              <Link href="/forgot-password" className="text-sm underline">
                Forgot password?
              </Link>
            </div>

            <Input
              type="password"
              placeholder="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={() => setRememberMe(!rememberMe)}
            />
            <Label htmlFor="remember">Remember me</Label>
          </div>

          {/* Email / Password Sign In */}
          <Button
            className="w-full"
            disabled={loading}
            onClick={handleEmailSignIn}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Login"}
          </Button>

          {/* Passkey Sign In */}
          <Button
            variant="secondary"
            disabled={loading}
            className="gap-2"
            onClick={async () => {
              setLoading(true);
              await signIn.passkey(
                {},
                {
                  onRequest: () => setLoading(true),
                  onResponse: () => setLoading(false),
                }
              );
            }}
          >
            <Key size={16} />
            Sign in with Passkey
          </Button>

          {/* Google Sign In */}
          <Button
            variant="outline"
            disabled={loading}
            className="gap-2"
            onClick={async () => {
              setLoading(true);
              await signIn.social(
                {
                  provider: "google",
                  callbackURL: "/",
                },
                {
                  onRequest: () => setLoading(true),
                  onResponse: () => setLoading(false),
                }
              );
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="0.98em" height="1em" viewBox="0 0 256 262">
              <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"/>
              <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"/>
              <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"/>
              <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"/>
            </svg>
            Sign in with Google
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
