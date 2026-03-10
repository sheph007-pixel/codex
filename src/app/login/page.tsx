"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { user, signIn, signUp, loading, error: authError } = useAuth();
  const router = useRouter();

  // If already authenticated (e.g. demo mode), skip login
  useEffect(() => {
    if (!loading && user) {
      router.replace("/contacts");
    }
  }, [loading, user, router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const err = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (err) {
      // If sign-in fails, try sign-up automatically (matches legacy behavior)
      if (!isSignUp && err.toLowerCase().includes("invalid")) {
        const signUpErr = await signUp(email, password);
        if (signUpErr) {
          setError(signUpErr);
        } else {
          router.push("/contacts");
          return;
        }
      } else {
        setError(err);
      }
    } else {
      router.push("/contacts");
      return;
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-sm space-y-6 p-8 border rounded-xl bg-card">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Kennion CRM</h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Create your account" : "Sign in to continue"}
          </p>
        </div>

        {authError && (
          <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting
              ? "Please wait..."
              : isSignUp
              ? "Sign Up"
              : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {isSignUp ? "Already have an account?" : "No account yet?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="underline hover:text-foreground cursor-pointer"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
