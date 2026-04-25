import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((cookie) => {
            req.cookies.set(cookie.name, cookie.value);
          });
          res.headers.set(
            "set-cookie",
            cookiesToSet
              .map((cookie) => `${cookie.name}=${cookie.value}; Path=/`)
              .join(", ")
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const protectedRoutes = ["/dashboard", "/notes", "/"];
  const isProtectedRoute = protectedRoutes.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/notes/:path*", "/cases/:path*", "/login", "/register"],
};
