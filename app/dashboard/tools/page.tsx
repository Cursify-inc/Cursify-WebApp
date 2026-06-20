"use client";

import { useState } from "react";
import {
  DashboardSidebar,
  DashboardTopbar,
} from "@/components/dashboard/overview";
import { ToolsPanel } from "@/components/dashboard/tools";

export default function ToolsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <DashboardSidebar
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <section className="min-w-0 bg-background">
          <DashboardTopbar onMenuClick={() => setIsSidebarOpen(true)} />

          <div className="px-6 py-8 lg:px-7">
            <ToolsPanel />
          </div>
        </section>
      </div>
    </main>
  );
}