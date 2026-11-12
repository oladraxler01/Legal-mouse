export const dynamic = "force-dynamic";

import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import StatutesClient, { Statute } from "./StatutesClient";

async function getStatutes(): Promise<Statute[]> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Query authorities table excluding Cases and Dictionaries to capture all statutory materials
    const { data, error } = await supabase
      .from("authorities")
      .select("*")
      .not("type", "in", '("Case","Dictionary")')
      .order("title", { ascending: true });

    if (error) {
      console.error("Error fetching statutory resources from Supabase:", error);
      return [];
    }

    return (data as Statute[]) || [];
  } catch (err) {
    console.error("Unexpected error in getStatutes:", err);
    return [];
  }
}

export default async function StatutesPage() {
  const initialStatutes = await getStatutes();

  return <StatutesClient initialStatutes={initialStatutes} />;
}
