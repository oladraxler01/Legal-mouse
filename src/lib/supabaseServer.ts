import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/** Returns the logged-in Supabase user for this request, or null. */
export async function getSessionUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          /* Route handlers here only read the session. */
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export function unauthorizedResponse() {
  return Response.json({ error: "Please log in to use this feature." }, { status: 401 });
}
