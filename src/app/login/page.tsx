"use client";

import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Quote, ArrowRight } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };


  return (
    <div className="min-h-screen w-full flex bg-surface-container-lowest text-on-surface">
      {/* Left Panel: Form */}
      <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12 z-10 relative bg-surface-container-lowest shadow-2xl lg:shadow-none">
        <div className="w-full max-w-md mx-auto">
          {/* Brand Anchor */}
          <div className="mb-12">
            <Link href="/" className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
              Legal Mouse
            </Link>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h2 className="font-headline text-4xl font-bold text-on-surface mb-3 tracking-tight">
              Access Hub
            </h2>
            <p className="font-body text-on-surface-variant text-lg">
              Sign in to your curated legal intelligence dashboard.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-body">
                {error}
              </div>
            )}
            {/* Email Field */}
            <div>
              <label className="block font-label text-sm font-medium text-on-surface mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-on-surface-variant/50" />
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-3 bg-surface-container-low border-0 outline outline-1 outline-outline-variant/20 focus:outline-primary/50 focus:ring-0 text-on-surface font-label rounded-lg transition-all"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  type="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-label text-sm font-medium text-on-surface" htmlFor="password">
                  Password
                </label>
                <Link className="font-label text-sm font-medium text-primary hover:text-primary-container transition-colors" href="/forgot-password">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-on-surface-variant/50" />
                </div>
                <input
                  className="block w-full pl-10 pr-10 py-3 bg-surface-container-low border-0 outline outline-1 outline-outline-variant/20 focus:outline-primary/50 focus:ring-0 text-on-surface font-label rounded-lg transition-all"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant/50 hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                className="group w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-md shadow-sm font-label text-sm font-bold text-on-primary bg-gradient-to-br from-primary to-primary-container hover:shadow-[0_8px_30px_rgb(110,0,193,0.3)] transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                ) : (
                  <>
                    Enter Workspace
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Sign Up CTA */}
          <div className="mt-10 text-center">
            <p className="font-body text-on-surface-variant">
              Don&apos;t have an account? 
              <Link className="font-label font-bold text-primary hover:text-primary-container transition-colors ml-2" href="/register">
                Request Institutional Access
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Image / Ambiance */}
      <div className="hidden lg:block lg:w-7/12 xl:w-2/3 h-screen relative bg-surface-container-low overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Classic legal library background"
            className="w-full h-full object-cover opacity-80 mix-blend-multiply dark:mix-blend-normal dark:opacity-60"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdvGGv6_7cdjqD7MsJ1O_T7OGfgjiWxS_3SbKN7aSHzvZNPqL39SxGsGOzOtE1d6S8phFwDhnvQn9zQdCvD7BRdqzP5CmwekzH70ZWPJWrcne0XjyQO1WjqB3BDpuz3FxggWj-sCHJMIlG7wD_fqSQywaErTBrhUASDyyy8WPwLfSBs9N--yB7XMUtHnsXL1zrVsn4AHNMWeFut7yZf-MgmhqlBTWwhO2oWFuj6L_Q1dEv6xQRcUMAMvubRSj_aPTDhhCUKeOKd24"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-surface/80 via-surface/40 to-transparent dark:from-black/80 dark:via-black/40" />
        </div>

        {/* Glassmorphic Quote Overlay */}
        <div className="absolute bottom-16 left-16 right-16 xl:right-auto xl:w-[600px] p-12 bg-surface-container-lowest/70 backdrop-blur-3xl border border-outline-variant/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          <Quote className="h-10 w-10 text-primary mb-6 opacity-50" />
          <p className="font-body text-2xl leading-relaxed text-on-surface mb-8 italic">
            &quot;The law is reason, free from passion. Our intelligence platform aims to distill the former while navigating the latter.&quot;
          </p>
          <div className="flex items-center">
            <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary-container mr-4 rounded-full" />
            <p className="font-label text-xs tracking-[0.2em] uppercase text-on-surface-variant font-bold">
              Curated Legal Intelligence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
