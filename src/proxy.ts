import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminSession";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const url = req.nextUrl;
  const pathname = url.pathname;

  // -------------------------------------------------------------
  // 1. Admin Portal Protection (Cookie Gate)
  // -------------------------------------------------------------
  const adminSession = await verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);
  const isAdminProtectedRoute = pathname.startsWith("/admin/dashboard") || pathname.startsWith("/admin/upload");
  const isAdminLoginPage = pathname === "/admin/login";

  // If visiting a protected admin route without a valid signed session -> redirect to /admin/login
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

  const protectedRoutes = [
    "/dashboard", "/notes", "/authorities", "/templates", "/videos", "/assistant",
    "/coach", "/community", "/groups", "/insights", "/profile", "/contribute",
  ];
  const isProtectedRoute = protectedRoutes.some((path) =>
    pathname.startsWith(path)
  );

  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedRoute && !session) {
    // Remember where the user was going (e.g. a group invite link) so login can send them back.
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname + url.search);
    return NextResponse.redirect(loginUrl);
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
    "/coach/:path*",
    "/community/:path*",
    "/groups/:path*",
    "/insights/:path*",
    "/profile/:path*",
    "/contribute/:path*",
    "/login",
    "/register",
  ],
};
