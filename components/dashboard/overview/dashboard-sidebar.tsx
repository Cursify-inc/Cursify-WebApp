import {
  CircleHelp,
  CreditCard,
  Download,
  Gauge,
  Grid2X2,
  Link2,
  LogOut,
  MonitorDown,
  Package,
  RefreshCcw,
  Settings,
  Shield,
  User,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ElementType } from "react";

const sidebarItems = [
  { label: "Overview", icon: Grid2X2, href: "/dashboard" },
  { label: "Downloads", icon: Download, href: "/dashboard/downloads" },
  { label: "Devices", icon: MonitorDown, href: "/dashboard/devices" },
  { label: "Agents", icon: Gauge, href: "/dashboard/agents" },
  { label: "Tools", icon: Wrench, href: "/dashboard/tools" },
  { label: "Extensions", icon: Package, href: "/dashboard/extensions" },
  { label: "Mirrors", icon: RefreshCcw, href: "/dashboard/mirrors" },
];

const accountItems = [
  { label: "Linked Accounts", icon: Link2, href: "/dashboard/linked-accounts" },
  { label: "Billing", icon: CreditCard, href: "/dashboard/billing" },
  { label: "Account", icon: User, href: "/dashboard/account" },
  { label: "Security", icon: Shield, href: "/dashboard/security" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];


export function DashboardSidebar({
  isMobileOpen,
  onClose,
}: {
  isMobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
<aside className="hidden min-h-screen border-r border-border bg-background-surface px-4 py-7 lg:flex lg:flex-col">
  <SidebarContent />
</aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-0 cursor-pointer bg-black/35"
            aria-label="Close dashboard menu overlay"
          />

          <aside className="dashboard-sidebar-scroll relative z-10 flex h-full w-[82%] max-w-[320px] flex-col overflow-y-auto border-r border-border bg-background-surface px-4 py-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
                  Cursify
                </h2>

                <p className="mt-1 font-mono text-xs text-text-primary">
                  Developer IDE
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border text-text-primary transition-colors duration-200 hover:bg-[#EEF2FF] hover:text-brand dark:hover:bg-background-elevated dark:hover:text-text-primary"
                aria-label="Close dashboard menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <SidebarContent onItemClick={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {

  return (
    <div className="flex flex-col gap-4">
      <div className="hidden px-2 lg:block">
        <h2 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
          Cursify
        </h2>

        <p className="mt-1 font-mono text-xs text-text-primary">
          Developer IDE
        </p>
      </div>

      <nav className="space-y-1">
        {sidebarItems.map((item) => (
          <SidebarLink key={item.label} {...item} onClick={onItemClick} />
        ))}
      </nav>

      <div className="h-px bg-border" />

      <nav className="space-y-1">
        {accountItems.map((item) => (
          <SidebarLink key={item.label} {...item} onClick={onItemClick} />
        ))}
      </nav>

      <div className="h-px bg-border" />

      <button className="flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-[#E9EDFF] font-mono text-sm font-bold text-brand transition-colors duration-200 hover:bg-[#DCE3FF] dark:bg-background-elevated dark:text-text-primary dark:hover:bg-brand-hover">
        Upgrade Plan
      </button>

      <nav className="space-y-1">
        <SidebarLink
          label="Help"
          icon={CircleHelp}
          href="/dashboard/help"
          onClick={onItemClick}
        />

        <SidebarLink
          label="Logout"
          icon={LogOut}
          href="/login"
          onClick={onItemClick}
          danger
        />
      </nav>
    </div>
  );
}

function SidebarLink({
  label,
  icon: Icon,
  href,
  onClick,
  danger = false,
}: {
  label: string;
  icon: ElementType;
  href: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const pathname = usePathname();

  const isActive =
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left font-mono text-sm transition-colors duration-200 ${
        isActive
          ? "border-l-4 border-brand bg-[#E8EBFF] font-bold text-[#0F1522] dark:border-brand-light dark:bg-background-elevated dark:text-text-primary"
          : danger
            ? "border-l-4 border-transparent text-danger hover:border-danger hover:bg-danger-light hover:text-danger"
            : "border-l-4 border-transparent text-text-primary hover:border-brand-light hover:bg-[#EEF2FF] hover:text-brand dark:text-text-secondary dark:hover:border-brand-light dark:hover:bg-background-elevated dark:hover:text-text-primary"
      }`}
    >
      <Icon
        className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
          isActive
            ? "text-[#0F1522] dark:text-text-primary"
            : danger
              ? "text-danger"
              : "text-text-secondary group-hover:text-brand dark:text-text-tertiary dark:group-hover:text-text-primary"
        }`}
      />

      <span>{label}</span>
    </Link>
  );
}