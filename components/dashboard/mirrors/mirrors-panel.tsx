import type { ElementType } from "react";
import {
  Cloud,
  CloudOff,
  Filter,
  Gauge,
  Layers,
  MoreVertical,
  Plus,
  Server,
  ShieldCheck,
  RefreshCcw,
  TriangleAlert,
} from "lucide-react";

const stats = [
  {
    label: "Total Mirrors",
    value: "12",
    suffix: "Active",
    icon: Layers,
  },
  {
    label: "Global Latency Avg",
    value: "34",
    suffix: "ms",
    icon: Gauge,
  },
  {
    label: "Network Health",
    value: "98.9%",
    icon: ShieldCheck,
    health: true,
  },
];

const mirrors = [
  {
    name: "Primary US-East",
    endpoint: "mirror-us-e1.cursify.io",
    region: "US-East",
    status: "Healthy",
    latency: "24ms",
    syncState: "Synced",
    tone: "success",
  },
  {
    name: "EU Frankfurt Node",
    endpoint: "mirror-eu-ce.cursify.io",
    region: "EU-West",
    status: "Degraded",
    latency: "185ms",
    syncState: "Syncing...",
    tone: "warning",
  },
  {
    name: "AP Tokyo Backup",
    endpoint: "mirror-ap-ne.cursify.io",
    region: "AP-Northeast",
    status: "Offline",
    latency: "--",
    syncState: "Disconnected",
    tone: "danger",
  },
  {
    name: "US-West Edge",
    endpoint: "edge-us-w2.cursify.io",
    region: "US-West",
    status: "Healthy",
    latency: "42ms",
    syncState: "Synced",
    tone: "success",
  },
] as const;

export function MirrorsPanel() {
  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-text-primary md:text-4xl">
            Mirror Network Management
          </h1>

          <p className="mt-3 max-w-3xl text-lg leading-8 text-text-secondary">
            Configure and monitor global synchronization endpoints for optimal
            performance.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-text-primary px-6 font-mono text-sm font-bold text-text-inverse shadow-sm transition hover:bg-text-secondary sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          Add Mirror
        </button>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <ConfiguredMirrorsTable />
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  health = false,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: ElementType;
  health?: boolean;
}) {
  return (
    <section className="rounded-[1.5rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-sm font-medium uppercase tracking-[0.08em] text-text-secondary">
          {label}
        </p>

        <Icon className="h-6 w-6 text-text-tertiary" />
      </div>

      <div className="mt-8 flex items-baseline gap-2">
        {health && <span className="h-3 w-3 rounded-full bg-success" />}

        <span className="text-5xl font-black tracking-[-0.08em] text-text-primary">
          {value}
        </span>

        {suffix && (
          <span className="text-base font-medium text-text-secondary">
            {suffix}
          </span>
        )}
      </div>
    </section>
  );
}

function ConfiguredMirrorsTable() {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-border bg-background-surface shadow-[0_12px_40px_rgba(21,30,48,0.06)]">
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <h2 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
          Configured Mirrors
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-pointer rounded-lg p-2 text-text-primary transition hover:bg-background-light"
            aria-label="Filter mirrors"
          >
            <Filter className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="cursor-pointer rounded-lg p-2 text-text-primary transition hover:bg-background-light"
            aria-label="More actions"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-background-light font-mono text-xs text-text-secondary">
              <th className="px-6 py-4 font-medium">Mirror Name</th>
              <th className="px-6 py-4 font-medium">Endpoint URL</th>
              <th className="px-6 py-4 font-medium">Region</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 text-right font-medium">Latency</th>
              <th className="px-6 py-4 font-medium">Sync State</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {mirrors.map((mirror) => (
              <MirrorRow key={mirror.name} {...mirror} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border lg:hidden">
        {mirrors.map((mirror) => (
          <MirrorMobileCard key={mirror.name} {...mirror} />
        ))}
      </div>
    </section>
  );
}

function MirrorRow({
  name,
  endpoint,
  region,
  status,
  latency,
  syncState,
  tone,
}: (typeof mirrors)[number]) {
  const isDanger = tone === "danger";

  return (
    <tr
      className={`group transition hover:bg-background-light ${
        isDanger ? "bg-danger-light/40" : ""
      }`}
    >
      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <MirrorIcon tone={tone} />

          <span className="max-w-[150px] font-semibold text-text-primary">
            {name}
          </span>
        </div>
      </td>

      <td className="px-6 py-5 font-mono text-sm text-text-secondary">
        <span className="block max-w-[150px] break-all">{endpoint}</span>
      </td>

      <td className="px-6 py-5">
        <RegionBadge label={region} />
      </td>

      <td className="px-6 py-5">
        <StatusLabel tone={tone} label={status} />
      </td>

      <td
        className={`px-6 py-5 text-right font-mono text-sm ${
          tone === "warning"
            ? "text-warning"
            : tone === "danger"
              ? "text-text-tertiary"
              : "text-text-primary"
        }`}
      >
        {latency}
      </td>

      <td className="px-6 py-5">
        <SyncLabel tone={tone} label={syncState} />
      </td>
    </tr>
  );
}

function MirrorMobileCard({
  name,
  endpoint,
  region,
  status,
  latency,
  syncState,
  tone,
}: (typeof mirrors)[number]) {
  return (
    <article
      className={`space-y-4 p-5 ${tone === "danger" ? "bg-danger-light/40" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <MirrorIcon tone={tone} />

          <div>
            <h3 className="font-semibold text-text-primary">{name}</h3>
            <p className="mt-1 font-mono text-sm text-text-secondary">
              {endpoint}
            </p>
          </div>
        </div>

        <RegionBadge label={region} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MobileMeta label="Status">
          <StatusLabel tone={tone} label={status} />
        </MobileMeta>

        <MobileMeta label="Latency">
          <span
            className={`font-mono text-sm ${
              tone === "warning"
                ? "text-warning"
                : tone === "danger"
                  ? "text-text-tertiary"
                  : "text-text-primary"
            }`}
          >
            {latency}
          </span>
        </MobileMeta>

        <MobileMeta label="Sync State">
          <SyncLabel tone={tone} label={syncState} />
        </MobileMeta>
      </div>
    </article>
  );
}

function MirrorIcon({ tone }: { tone: "success" | "warning" | "danger" }) {
  const isDanger = tone === "danger";

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
        isDanger
          ? "bg-danger-light text-danger"
          : "bg-background-light text-text-primary"
      }`}
    >
      {isDanger ? (
        <CloudOff className="h-5 w-5" />
      ) : (
        <Server className="h-5 w-5" />
      )}
    </div>
  );
}

function RegionBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-md bg-background-light px-2.5 py-1 font-mono text-xs text-text-secondary">
      {label}
    </span>
  );
}

function StatusLabel({
  tone,
  label,
}: {
  tone: "success" | "warning" | "danger";
  label: string;
}) {
  const dotClass =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : "bg-danger";

  const textClass =
    tone === "danger" ? "text-danger font-semibold" : "text-text-primary";

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${textClass}`}>
      <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}

function SyncLabel({
  tone,
  label,
}: {
  tone: "success" | "warning" | "danger";
  label: string;
}) {
  if (tone === "danger") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-danger">
        <TriangleAlert className="h-4 w-4" />
        {label}
      </span>
    );
  }

  if (tone === "warning") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
        <RefreshCcw className="h-4 w-4 animate-spin" />
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
      <Cloud className="h-4 w-4" />
      {label}
    </span>
  );
}

function MobileMeta({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-text-tertiary">
        {label}
      </p>

      <div className="mt-1">{children}</div>
    </div>
  );
}