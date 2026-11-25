"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const linkExpired = useSearchParams().get("link") === "expired";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setSending(false);
    if (error) {
      setError(error.message.toLowerCase().includes("rate") ? "Too many attempts. Please wait a few minutes and try again." : error.message);
      return;
    }
    // Same message whether or not the email has an account, so accounts can't be guessed.
    setSent(true);
  }

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-surface-container-lowest text-on-surface p-6">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-primary mb-10">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
        <h1 className="font-headline text-4xl font-bold tracking-tight mb-3">Forgot your password?</h1>
        <p className="text-on-surface-variant mb-8">Enter your email and we&apos;ll send you a link to set a new one.</p>

        {linkExpired && !sent && (
          <p className="mb-6 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 px-4 py-3 text-sm">
            That reset link has expired or was already used. Request a new one below.
          </p>
        )}

        {sent ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
            <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="font-headline text-xl font-bold mb-2">Check your inbox</h2>
            <p className="text-sm text-on-surface-variant">
              If an account exists for <b>{email}</b>, a reset link is on its way. It can take a minute; check your spam folder too.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="text-sm font-bold">Email address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="mt-2 w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3.5 outline-none focus:border-primary/50"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={sending} className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold disabled:opacity-50">
              {sending ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
