import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
