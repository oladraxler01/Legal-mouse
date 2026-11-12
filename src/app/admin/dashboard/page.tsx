export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { getAnnouncementsAction } from "@/app/actions/admin";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session")?.value;

  if (!adminSession) {
    redirect("/admin/login");
  }

  const initialAnnouncements = await getAnnouncementsAction();

  return <DashboardClient initialAnnouncements={initialAnnouncements} />;
}

