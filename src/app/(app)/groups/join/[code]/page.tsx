"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function JoinGroupPage() {
  const { code } = useParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const join = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("join_group_by_code", { p_code: String(code) });
      if (error || !data) {
        console.error("Join failed:", error);
        setError("This invite link is invalid or has expired. Ask the group for a new one.");
        return;
      }
      router.replace(`/groups/${data}`);
    };
    join();
  }, [code, router]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-5 p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
        <Users className="w-8 h-8" />
      </div>
      {error ? (
        <>
          <p className="text-on-surface font-bold text-lg">{error}</p>
          <Link href="/groups" className="text-primary font-bold">Go to Study Groups</Link>
        </>
      ) : (
        <p className="text-on-surface-variant font-serif italic text-lg">Joining the group...</p>
      )}
    </div>
  );
}
