import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const url = req.nextUrl;
  const pathname = url.pathname;

  // -------------------------------------------------------------
  // 1. Admin Portal Protection (Cookie Gate)
  // -------------------------------------------------------------
  const adminSession = req.cookies.get("admin_session")?.value;
  const isAdminProtectedRoute = pathname.startsWith("/admin/dashboard") || pathname.startsWith("/admin/upload");
  const isAdminLoginPage = pathname === "/admin/login";

  // If visiting protected admin route without admin_session cookie -> redirect to /admin/login
  if (isAdminProtectedRoute && !adminSession) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // If already logged in as admin and visiting /admin/login -> redirect to /admin/dashboard
  if (isAdminLoginPage && adminSession) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // -------------------------------------------------------------
  // 2. Standard User App Route Protection (Supabase Session)
  // -------------------------------------------------------------
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

  const protectedRoutes = ["/dashboard", "/notes", "/authorities", "/templates", "/videos", "/assistant"];
  const isProtectedRoute = protectedRoutes.some((path) =>
    pathname.startsWith(path)
  );

  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.some((path) =>
    pathname.startsWith(path)
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
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/notes/:path*",
    "/authorities/:path*",
    "/templates/:path*",
    "/videos/:path*",
    "/assistant/:path*",
    "/login",
    "/register",
  ],
};
