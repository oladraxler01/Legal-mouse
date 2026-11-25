import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Where email links land: sign-up verification, password reset and email change.
 * Handles both link styles Supabase can send:
 *  - ?token_hash=...&type=...  (works even if the email is opened on another device)
 *  - ?code=...                 (default links; same browser that requested them)
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : type === "recovery" ? "/reset-password" : "/dashboard";

  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    },
  });

  let error: { message: string } | null = null;
  if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  } else if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else {
    error = { message: "missing token" };
  }

  if (error) {
    console.error("Auth link failed:", error.message);
    const target = type === "recovery" || next === "/reset-password" ? "/forgot-password" : "/login";
    return NextResponse.redirect(new URL(`${target}?link=expired`, request.url));
  }

  const destination = new URL(next, request.url);
  if (type === "signup" || type === "email") destination.searchParams.set("verified", "1");
  return NextResponse.redirect(destination);
}
