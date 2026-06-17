
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
import type { ElementType } from "react";

const sidebarItems = [
  { label: "Overview", icon: Grid2X2, active: true },
  { label: "Downloads", icon: Download },
  { label: "Devices", icon: MonitorDown },
  { label: "Agents", icon: Gauge },
  { label: "Tools", icon: Wrench },
  { label: "Extensions", icon: Package },
  { label: "Mirrors", icon: RefreshCcw },
];

const accountItems = [
  { label: "Linked Accounts", icon: Link2 },
  { label: "Billing", icon: CreditCard },
  { label: "Account", icon: User },
  { label: "Security", icon: Shield },
  { label: "Settings", icon: Settings },
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

          <aside className="relative z-10 flex h-full w-[82%] max-w-[320px] flex-col border-r border-border bg-background-surface px-4 py-6 shadow-2xl">
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
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border text-text-primary transition-colors duration-200 hover:bg-[#EEF2FF] hover:text-brand"
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
    <>
      <div className="hidden px-2 lg:block">
        <h2 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
          Cursify
        </h2>

        <p className="mt-1 font-mono text-xs text-text-primary">
          Developer IDE
        </p>
      </div>

      <nav className="space-y-1 lg:mt-9">
        {sidebarItems.map((item) => (
          <SidebarLink key={item.label} {...item} onClick={onItemClick} />
        ))}
      </nav>

      <div className="my-4 h-px bg-border" />

      <nav className="space-y-1">
        {accountItems.map((item) => (
          <SidebarLink key={item.label} {...item} onClick={onItemClick} />
        ))}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="h-px bg-border" />

        <button className="flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-[#E9EDFF] font-mono text-sm font-bold text-brand transition-colors duration-200 hover:bg-[#DCE3FF]">
          Upgrade Plan
        </button>

        <SidebarLink label="Help" icon={CircleHelp} onClick={onItemClick} />
        <SidebarLink label="Logout" icon={LogOut} onClick={onItemClick} />
      </div>
    </>
  );
}

function SidebarLink({
  label,
  icon: Icon,
  active = false,
  onClick,
}: {
  label: string;
  icon: ElementType;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left font-mono text-sm transition-colors duration-200 ${
        active
          ? "border-l-4 border-brand bg-[#E8EBFF] font-bold text-text-primary"
          : "border-l-4 border-transparent text-text-primary hover:border-brand-light hover:bg-[#EEF2FF] hover:text-brand"
      }`}
    >
      <Icon
        className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
          active ? "text-brand" : "text-text-secondary group-hover:text-brand"
        }`}
      />

      <span>{label}</span>
    </button>
  );
}