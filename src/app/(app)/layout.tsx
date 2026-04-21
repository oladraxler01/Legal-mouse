import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-surface text-on-surface font-label">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 pb-20 md:pb-0 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
