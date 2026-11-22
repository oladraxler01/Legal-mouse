import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import LegalMouseAvatar from "@/components/assistant/LegalMouseAvatar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-surface text-on-surface font-label">
      <Sidebar />
      <main className="flex-1 min-w-0 ml-0 md:ml-64 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 overflow-y-auto overflow-x-hidden overscroll-y-contain">
        {children}
      </main>
      <BottomNav />
      <LegalMouseAvatar />
    </div>
  );
}
