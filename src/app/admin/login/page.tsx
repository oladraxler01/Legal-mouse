"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, KeyRound, ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { loginAdminAction } from "@/app/actions/admin";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAdminAction(formData);

    if (result.success) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      setError(result.error || "Access denied. Invalid passphrase.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md bg-surface-container border border-outline-variant/15 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/20 animate-in fade-in zoom-in-95 duration-500">
        {/* Header Icon & Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 shadow-inner">
            <Shield className="w-8 h-8" />
          </div>
          <span className="font-label text-xs uppercase tracking-[0.25em] text-primary font-bold mb-2">
            Restricted Portal
          </span>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
            Legal Mouse Admin
          </h1>
          <p className="font-body text-sm text-on-surface-variant max-w-xs">
            Enter the shared master passphrase to access the publishing and management hub.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-label font-bold flex items-center gap-2 animate-in shake duration-300">
            <Lock className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dedicated Single Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block font-label text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-2.5"
            >
              Master Passphrase
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant/50">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoFocus
                placeholder="Enter admin master passphrase"
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl py-3.5 pl-12 pr-12 text-sm font-label text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant/50 hover:text-on-surface transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-label text-sm font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            ) : (
              <>
                Unlock Admin Workspace
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Back Link */}
        <div className="mt-8 text-center pt-6 border-t border-outline-variant/10">
          <Link
            href="/"
            className="font-label text-xs font-bold text-on-surface-variant/60 hover:text-primary transition-colors"
          >
            ← Return to Legal Mouse Main Site
          </Link>
        </div>
      </div>
    </div>
  );
}

