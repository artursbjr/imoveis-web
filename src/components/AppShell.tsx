"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

const ROTAS_SEM_SIDEBAR = ["/login", "/registrar"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (ROTAS_SEM_SIDEBAR.includes(pathname)) {
    return <main className="min-h-screen flex items-center justify-center bg-paper-100 p-8">{children}</main>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 md:p-10">{children}</main>
    </div>
  );
}
