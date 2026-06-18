"use client";

import { useState } from "react";
import {
  DashboardSidebar,
  DashboardTopbar,
} from "@/components/dashboard/overview";
import { SecuritySettings } from "@/components/dashboard/security";

export default function SecurityPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <DashboardSidebar
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <section className="dashboard-grid-bg min-w-0">
          <DashboardTopbar onMenuClick={() => setIsSidebarOpen(true)} />

          <div className="mx-auto max-w-6xl px-6 py-8 lg:px-7">
            <header className="mb-8">
              <h1 className="text-3xl font-black tracking-[-0.04em] text-text-primary md:text-4xl">
                Security Settings
              </h1>

              <p className="mt-3 max-w-4xl text-lg leading-8 text-text-secondary">
                Manage your password, authentication methods, and monitor active
                sessions to keep your Cursify account secure.
              </p>
            </header>

            <SecuritySettings />
          </div>
        </section>
      </div>
    </main>
  );
}