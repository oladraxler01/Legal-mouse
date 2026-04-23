"use client";

import Link from "next/link";
import { User, Mail, Lock, ArrowRight, Library, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full flex bg-surface-container-lowest text-on-surface overflow-hidden">
      {/* Left Panel: Image / Ambiance */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 bg-surface-container-low relative">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Classic legal library background"
            className="w-full h-full object-cover opacity-100 dark:opacity-80"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdvGGv6_7cdjqD7MsJ1O_T7OGfgjiWxS_3SbKN7aSHzvZNPqL39SxGsGOzOtE1d6S8phFwDhnvQn9zQdCvD7BRdqzP5CmwekzH70ZWPJWrcne0XjyQO1WjqB3BDpuz3FxggWj-sCHJMIlG7wD_fqSQywaErTBrhUASDyyy8WPwLfSBs9N--yB7XMUtHnsXL1zrVsn4AHNMWeFut7yZf-MgmhqlBTWwhO2oWFuj6L_Q1dEv6xQRcUMAMvubRSj_aPTDhhCUKeOKd24"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/10 via-surface-container-lowest/40 to-surface-container-lowest/90 backdrop-blur-[2px] z-10" />
        </div>

        <div className="relative z-20 flex flex-col justify-end p-16 lg:p-24 h-full w-full">
          <div className="max-w-2xl">
            <h2 className="font-headline text-4xl lg:text-6xl font-extrabold text-on-surface mb-8 leading-tight tracking-tight">
              Curated Legal <br />
              Intelligence.
            </h2>
            <p className="font-body text-xl lg:text-2xl text-on-surface-variant mb-12 italic leading-relaxed">
              Join a network of forward-thinking legal professionals. Access
              unmatched insights, powered by clarity and computational logic.
            </p>
            <div className="bg-surface-container-lowest/80 backdrop-blur-3xl p-8 rounded-2xl border border-outline-variant/10 max-w-sm shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl text-primary">
                  <Library className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-on-surface text-lg">
                    Institutional Access
                  </h4>
                  <p className="font-body text-on-surface-variant text-sm mt-2 leading-relaxed">
                    Connect with your firm or university for seamless SSO
                    integration and curated resources.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Panel: Form */}
      <section className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 overflow-y-auto z-30">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-12 text-center md:text-left">
            <Link href="/" className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-4 inline-block">
              Legal Mouse
            </Link>
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-[0.25em] font-bold">
              Create Your Account
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-headline text-2xl font-bold text-on-surface mb-3">
                Check Your Inbox
              </h3>
              <p className="font-body text-on-surface-variant leading-relaxed">
                We&apos;ve sent a confirmation link to your institutional email. Please verify your account to unlock curated legal intelligence.
              </p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="mt-8 font-label text-sm font-bold text-primary hover:text-primary-container transition-colors"
              >
                Back to Registration
              </button>
            </div>
          ) : (
            <form className="space-y-8" onSubmit={handleSignUp}>
              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-body">
                  {error}
                </div>
              )}
              <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block font-label text-sm font-bold text-on-surface mb-2" htmlFor="fullName">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-on-surface-variant/50" />
                  </div>
                  <input
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 pl-10 font-label text-on-surface focus:ring-2 focus:ring-primary-container/20 focus:bg-surface-container-lowest transition-all placeholder:text-on-surface-variant/40"
                    id="fullName"
                    name="fullName"
                    placeholder="Jane Doe"
                    type="text"
                    required
                  />
                </div>
              </div>

              {/* Institutional Email */}
              <div>
                <label className="block font-label text-sm font-bold text-on-surface mb-2" htmlFor="email">
                  Institutional Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-on-surface-variant/50" />
                  </div>
                  <input
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 pl-10 font-label text-on-surface focus:ring-2 focus:ring-primary-container/20 focus:bg-surface-container-lowest transition-all placeholder:text-on-surface-variant/40"
                    id="email"
                    name="email"
                    placeholder="jane.doe@firm.com"
                    type="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-label text-sm font-bold text-on-surface mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-on-surface-variant/50" />
                  </div>
                  <input
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 pl-10 pr-12 font-label text-on-surface focus:ring-2 focus:ring-primary-container/20 focus:bg-surface-container-lowest transition-all placeholder:text-on-surface-variant/40"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant/50 hover:text-on-surface transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                />
              </div>
              <label className="font-body text-sm text-on-surface-variant leading-tight" htmlFor="terms">
                I agree to the{" "}
                <Link className="text-primary hover:underline underline-offset-4" href="/terms">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link className="text-primary hover:underline underline-offset-4" href="/privacy">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <button
              className="group w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-label font-extrabold text-sm tracking-widest uppercase py-5 rounded-xl hover:shadow-xl hover:shadow-primary/20 transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              ) : (
                <>
                  Join the Future of Law
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          )}

          <div className="mt-12 text-center">
            <p className="font-body text-sm text-on-surface-variant">
              Already have an account?{" "}
              <Link className="font-bold text-primary hover:underline underline-offset-4 ml-1" href="/login">
                Log in here
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
