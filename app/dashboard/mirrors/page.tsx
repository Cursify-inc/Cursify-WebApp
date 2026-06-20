"use client";

import { useState } from "react";
import {
  DashboardSidebar,
  DashboardTopbar,
} from "@/components/dashboard/overview";
import { MirrorsPanel } from "@/components/dashboard/mirrors";

export default function MirrorsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <DashboardSidebar
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <section className="min-w-0 bg-background-light">
          <DashboardTopbar onMenuClick={() => setIsSidebarOpen(true)} />

          <div className="px-6 py-8 lg:px-7">
            <MirrorsPanel />
          </div>
        </section>
      </div>
    </main>
  );
}