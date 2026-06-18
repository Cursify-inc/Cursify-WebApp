"use client";

import { useState } from "react";
import {
  DashboardSidebar,
  DashboardTopbar,
} from "@/components/dashboard/overview";
import { AccountSettings } from "@/components/dashboard/account";

export default function AccountPage() {
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
                Account Settings
              </h1>

              <p className="mt-3 text-lg leading-8 text-text-secondary">
                Manage your profile, preferences, and account security.
              </p>
            </header>

            <AccountSettings />
          </div>
        </section>
      </div>
    </main>
  );
}