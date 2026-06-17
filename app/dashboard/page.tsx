"use client";

import { CreditCard, Laptop, RefreshCcw, User } from "lucide-react";
import { useState } from "react";
import {
  DashboardSidebar,
  DashboardTopbar,
  OverviewActions,
  OverviewCard,
} from "@/components/dashboard/overview";

export default function DashboardOverviewPage() {
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
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-[-0.04em] text-text-primary md:text-4xl">
                  Welcome back, Alex.
                </h1>

                <p className="mt-3 max-w-2xl text-xl leading-8 text-text-secondary">
                  Manage your Cursify IDE, devices, agents, and subscription
                  from one secure workspace.
                </p>

                <div className="mt-3 inline-flex items-center gap-2 border border-border bg-background-light px-3 py-1.5 font-mono text-xs text-text-primary">
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Last desktop sync: 4 minutes ago
                </div>
              </div>

              <OverviewActions />
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-3">
              <OverviewCard
                icon={User}
                title="Alex"
                subtitle="alex@example.com"
                badge="Verified"
                badgeTone="blue"
              />

              <OverviewCard
                icon={CreditCard}
                title="Pro Plan"
                subtitle="Renews on Oct 12, 2024"
                action="Manage Billing"
                badge="Active"
                badgeTone="light"
              />

              <OverviewCard
                icon={Laptop}
                title="MacBook Pro"
                subtitle="IDE Version 1.4.2"
                action="View Devices | Re-pair"
                badge="Connected"
                badgeTone="success"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}