import type { ReactNode } from "react";
import {
  CloudDownload,
  RefreshCcw,
  Search,
  Settings,
  Sparkles,
  Users,
  Verified,
} from "lucide-react";

type ExtensionStatusTone = "success" | "warning";

type ExtensionItem = {
  name: string;
  publisher: string;
  version: string;
  description: string;
  logo: ReactNode;
  logoClassName?: string;
  badges: {
    label: string;
    icon: ReactNode;
    muted?: boolean;
  }[];
  status: string;
  statusTone: ExtensionStatusTone;
  action: string;
  disabled?: boolean;
  featured?: boolean;
  update?: boolean;
};

const extensions: ExtensionItem[] = [
  {
    name: "Python",
    publisher: "Microsoft",
    version: "v2023.20.0",
    description:
      "IntelliSense (Pylance), Linting, Debugging (multi-threaded, remote), Jupyter Notebooks, code formatting, refactoring, unit tests, and more.",
    logo: <PythonLogo />,
    badges: [
      {
        label: "Signed",
        icon: <Verified className="h-3.5 w-3.5 text-success" />,
      },
      {
        label: "Synced",
        icon: <RefreshCcw className="h-3.5 w-3.5" />,
      },
    ],
    status: "Compatible",
    statusTone: "success",
    action: "Uninstall",
  },
  {
    name: "Cursify AI Assist",
    publisher: "Cursify Native",
    version: "v1.5.2",
    description:
      "Premium AI copilot integration. Features real-time code suggestions, architectural planning, and automated refactoring using advanced LLM models.",
    logo: <Sparkles className="h-8 w-8 text-info" />,
    logoClassName: "bg-info-light border-info/30",
    badges: [
      {
        label: "Native",
        icon: <Verified className="h-3.5 w-3.5 text-success" />,
      },
      {
        label: "Local Only",
        icon: <RefreshCcw className="h-3.5 w-3.5" />,
        muted: true,
      },
    ],
    status: "Compatible",
    statusTone: "success",
    action: "Uninstall",
    disabled: true,
    featured: true,
  },
  {
    name: "Prettier",
    publisher: "Prettier Community",
    version: "v3.0.3",
    description:
      "Opinionated code formatter. Enforces a consistent style by parsing your code and re-printing it with its own rules that take the maximum line length into account.",
    logo: (
      <span className="font-mono text-xl font-black text-text-inverse">P</span>
    ),
    logoClassName: "bg-text-primary border-border",
    badges: [
      {
        label: "Community",
        icon: <Users className="h-3.5 w-3.5" />,
      },
      {
        label: "Synced",
        icon: <RefreshCcw className="h-3.5 w-3.5" />,
      },
    ],
    status: "Update Avail.",
    statusTone: "warning",
    action: "Update",
    update: true,
  },
];

const tabs = ["Installed (12)", "Updates (2)", "Recommended"];

export function ExtensionsPanel() {
  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-text-primary md:text-4xl">
            Extensions
          </h1>

          <p className="mt-3 max-w-3xl text-lg leading-8 text-text-secondary">
            Manage your installed tools and discover new integrations for your
            Cursify IDE.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-background-surface px-5 font-mono text-sm font-bold text-text-primary transition hover:bg-background-light"
          >
            <Search className="h-4 w-4" />
            Browse Marketplace
          </button>

          <button
            type="button"
            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-text-primary px-5 font-mono text-sm font-bold text-text-inverse shadow-sm transition hover:bg-text-secondary"
          >
            <CloudDownload className="h-4 w-4" />
            Install from VSIX...
          </button>
        </div>
      </header>

      <nav className="flex gap-6 overflow-x-auto border-b border-border">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`shrink-0 border-b-2 px-1 pb-3 font-mono text-sm transition ${
              index === 0
                ? "border-text-primary text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {extensions.map((extension) => (
          <ExtensionCard key={extension.name} {...extension} />
        ))}
      </section>
    </div>
  );
}

function ExtensionCard({
  name,
  publisher,
  version,
  description,
  logo,
  logoClassName = "bg-background-light border-border",
  badges,
  status,
  statusTone,
  action,
  disabled = false,
  featured = false,
  update = false,
}: ExtensionItem) {
  return (
    <article className="group relative flex min-h-[340px] flex-col overflow-hidden rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] transition hover:-translate-y-1 hover:border-text-primary md:p-7">
      {featured && (
        <div className="absolute left-0 top-0 h-1 w-full bg-info" />
      )}

      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${logoClassName}`}
        >
          {logo}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="truncate text-2xl font-black tracking-[-0.04em] text-text-primary">
              {name}
            </h2>

            <span
              className={`shrink-0 rounded-md px-2.5 py-1 font-mono text-xs ${
                featured
                  ? "bg-info-light text-info"
                  : "bg-background-light text-text-secondary"
              }`}
            >
              {version}
            </span>
          </div>

          <p className="mt-1 truncate text-sm text-text-secondary">
            {publisher}
          </p>
        </div>
      </div>

      <p className="mt-5 flex-1 text-sm leading-6 text-text-secondary">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span
            key={badge.label}
            className={`inline-flex items-center gap-1.5 rounded-md bg-background-light px-2.5 py-1.5 font-mono text-xs text-text-secondary ${
              badge.muted ? "opacity-50" : ""
            }`}
          >
            {badge.icon}
            {badge.label}
          </span>
        ))}
      </div>

      <div className="mt-7 flex items-center justify-between gap-4 border-t border-border pt-5">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              statusTone === "success" ? "bg-success" : "bg-warning"
            }`}
          />

          <span className="font-mono text-xs text-text-secondary">
            {status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!update && (
            <button
              type="button"
              className="cursor-pointer rounded-lg p-2 text-text-secondary transition hover:bg-background-light hover:text-text-primary"
              aria-label={`${name} settings`}
            >
              <Settings className="h-5 w-5" />
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-lg px-4 font-mono text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              update
                ? "bg-info-light text-info hover:bg-background-light"
                : "border border-border bg-background-surface text-text-primary hover:bg-danger-light hover:text-danger"
            }`}
          >
            {action}
          </button>

          {update && (
            <button
              type="button"
              className="cursor-pointer rounded-lg p-2 text-text-secondary transition hover:bg-background-light hover:text-text-primary"
              aria-label={`${name} settings`}
            >
              <Settings className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function PythonLogo() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background-surface">
      <span className="text-lg">🐍</span>
    </div>
  );
}