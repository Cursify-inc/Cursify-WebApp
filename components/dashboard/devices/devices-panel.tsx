import {
  Ban,
  Laptop,
  Plus,
  Server,
  Trash2,
  Monitor,
} from "lucide-react";
import type { ElementType } from "react";

const devices = [
  {
    name: "MacBook Pro M3 Max",
    description: "macOS Sonoma 14.4 • IDE v2.4.1",
    status: "Active",
    statusTone: "active",
    icon: Laptop,
    lastSeen: "Just now",
    secondLabel: "Added",
    secondValue: "Oct 12, 2023",
    action: "Revoke",
    actionIcon: Ban,
  },
  {
    name: "Windows Workstation Alpha",
    description: "Windows 11 Pro • IDE v2.3.0",
    status: "Needs Update",
    statusTone: "warning",
    icon: Monitor,
    lastSeen: "2 days ago",
    secondLabel: "Added",
    secondValue: "Jan 05, 2024",
    action: "Revoke",
    actionIcon: Ban,
  },
  {
    name: "Ubuntu Build Server",
    description: "Ubuntu 22.04 LTS • IDE v2.3.9",
    status: "Revoked",
    statusTone: "revoked",
    icon: Server,
    lastSeen: "Mar 15, 2024",
    secondLabel: "Revoked On",
    secondValue: "Apr 01, 2024",
    action: "Remove",
    actionIcon: Trash2,
    revoked: true,
  },
];

export function DevicesPanel() {
  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-text-primary md:text-4xl">
            Paired Devices
          </h1>

          <p className="mt-3 max-w-3xl text-lg leading-8 text-text-secondary">
            Manage devices currently authorized to access your Cursify IDE
            environments and synchronize code.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-fit cursor-pointer items-center justify-center gap-2 rounded-xl bg-text-primary px-7 font-mono text-sm font-bold text-text-inverse shadow-sm transition hover:bg-text-secondary"
        >
          <Plus className="h-4 w-4" />
          Pair New Device
        </button>
      </div>

      <div className="grid gap-5">
        {devices.map((device) => (
          <DeviceCard key={device.name} {...device} />
        ))}
      </div>
    </div>
  );
}

function DeviceCard({
  name,
  description,
  status,
  statusTone,
  icon: Icon,
  lastSeen,
  secondLabel,
  secondValue,
  action,
  actionIcon: ActionIcon,
  revoked = false,
}: {
  name: string;
  description: string;
  status: string;
  statusTone: string;
  icon: ElementType;
  lastSeen: string;
  secondLabel: string;
  secondValue: string;
  action: string;
  actionIcon: ElementType;
  revoked?: boolean;
}) {
  return (
    <section
  className={`rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] transition md:p-7 ${
    revoked ? "opacity-75" : "hover:-translate-y-1"
  }`}
>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-5">
          <div
            className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-xl border border-border ${
              revoked
                ? "bg-background-light text-text-tertiary"
                : "bg-background-light text-text-primary"
            }`}
          >
            <Icon className="h-7 w-7" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className={`text-2xl font-black tracking-[-0.04em] ${
                  revoked
                    ? "text-text-secondary line-through"
                    : "text-text-primary"
                }`}
              >
                {name}
              </h2>

              <StatusBadge tone={statusTone} label={status} />
            </div>

            <p className="mt-1 font-mono text-xs leading-5 text-text-secondary">
              {description}
            </p>

            <div className="mt-5 flex flex-wrap gap-8">
              <DeviceMeta label="Last Seen" value={lastSeen} />
              <DeviceMeta label={secondLabel} value={secondValue} />
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-4 md:border-l md:border-t-0 md:px-6 md:py-0">
          <button
            type="button"
            disabled={revoked}
            className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 font-mono text-sm font-bold transition disabled:cursor-not-allowed ${
              revoked
                ? "text-text-tertiary"
                : "text-text-secondary hover:bg-danger-light hover:text-danger"
            }`}
          >
            <ActionIcon className="h-4 w-4" />
            {action}
          </button>
        </div>
      </div>
    </section>
  );
}

function DeviceMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        {label}
      </span>

      <span className="text-sm text-text-secondary">{value}</span>
    </div>
  );
}

function StatusBadge({ tone, label }: { tone: string; label: string }) {
  const className =
    tone === "active"
      ? "border-info bg-info-light text-info"
      : tone === "warning"
        ? "border-warning bg-warning-light text-warning"
        : "border-danger bg-danger-light text-danger";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-[0.14em] ${className}`}
    >
      {label}
    </span>
  );
}