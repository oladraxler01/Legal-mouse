export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { getAnnouncementsAction } from "@/app/actions/admin";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminSession";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  if (!(await verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }

  const initialAnnouncements = await getAnnouncementsAction();

  return <DashboardClient initialAnnouncements={initialAnnouncements} />;
}

