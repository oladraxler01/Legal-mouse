"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // The reset email link signs the user in briefly so they can choose a new password.
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setHasSession(!!data.user));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setSaving(true);
    const { error } = await createClient().auth.updateUser({ password });
    setSaving(false);
    if (error) return setError(error.message);
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1800);
  }

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-surface-container-lowest text-on-surface p-6">
      <div className="w-full max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
          <KeyRound className="h-7 w-7" />
        </div>
        <h1 className="font-headline text-4xl font-bold tracking-tight mb-3">Set a new password</h1>

        {hasSession === null && <p className="text-on-surface-variant">Checking your link…</p>}

        {hasSession === false && (
          <div className="space-y-4">
            <p className="text-on-surface-variant">This page only works from the link in your password reset email, and that link has expired or was already used.</p>
            <Link href="/forgot-password" className="inline-block bg-primary text-on-primary px-6 py-3 rounded-xl font-bold">
              Send a new link
            </Link>
          </div>
        )}

        {hasSession && done && <p className="rounded-xl bg-green-500/10 text-green-700 dark:text-green-300 px-4 py-3">Password updated. Taking you to your dashboard…</p>}

        {hasSession && !done && (
          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <label className="block">
              <span className="text-sm font-bold">New password</span>
              <div className="relative mt-2">
                <input
                  type={show ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3.5 pr-12 outline-none focus:border-primary/50"
                />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-bold">Confirm new password</span>
              <input
                type={show ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="mt-2 w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3.5 outline-none focus:border-primary/50"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={saving} className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold disabled:opacity-50">
              {saving ? "Saving..." : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
