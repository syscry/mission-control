import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[18rem_1fr]">
      <Sidebar />
      <main className="min-h-screen">
        <TopBar />
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
