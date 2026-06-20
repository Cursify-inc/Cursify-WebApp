import type { ElementType } from "react";
import {
  CheckCircle2,
  Download,
  Filter,
  MousePointer2,
  Palette,
  SearchCode,
  Settings,
  Sparkles,
  Workflow,
  Database,
  Users,
  Verified,
} from "lucide-react";

type ToolItem = {
  name: string;
  category: string;
  description: string;
  version?: string;
  downloads?: string;
  badge: "Verified" | "Community";
  icon: ElementType;
  installed?: boolean;
};

const tools: ToolItem[] = [
  {
    name: "LogSight AI",
    category: "Debugging & Analytics",
    description:
      "Intelligently parse error logs and receive actionable fix suggestions directly within your terminal pane.",
    badge: "Verified",
    icon: SearchCode,
    installed: true,
  },
  {
    name: "ThemeGenius",
    category: "Customization",
    description:
      "Generate semantic syntax themes for Cursify using natural language prompts.",
    version: "v2.1.0",
    downloads: "14k dl",
    badge: "Verified",
    icon: Palette,
  },
  {
    name: "SQL Whisperer",
    category: "Database Tools",
    description:
      "Translate plain English into complex, optimized SQL queries spanning multiple joins.",
    version: "v0.9.4",
    downloads: "3k dl",
    badge: "Community",
    icon: Database,
  },
];

export function ToolsPanel() {
  return (
    <div className="mx-auto max-w-7xl space-y-9">
      <HeroTool />

      <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-black tracking-[-0.04em] text-text-primary">
            Featured Tools
          </h2>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl px-3 text-text-primary transition hover:bg-background-light"
              aria-label="Filter tools"
            >
              <Filter className="h-5 w-5" />
            </button>

            <button
              type="button"
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-background-surface px-4 font-mono text-sm text-text-primary transition hover:bg-background-light"
            >
              Most Popular
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.name} {...tool} />
          ))}
        </div>
      </section>
    </div>
  );
}

function HeroTool() {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-border bg-background-surface shadow-[0_12px_40px_rgba(21,30,48,0.06)]">
      <div className="grid lg:grid-cols-[1.4fr_1fr]">
        <div className="p-8 md:p-10">
          <span className="inline-flex rounded-full bg-info-light px-4 py-1.5 font-mono text-sm text-info">
            Featured Toolkit
          </span>

          <h1 className="mt-7 text-5xl font-black tracking-[-0.08em] text-text-primary md:text-6xl">
            CodeLuminar Pro
          </h1>

          <p className="mt-5 max-w-2xl text-xl leading-9 text-text-secondary">
            Supercharge your refactoring with advanced structural analysis and
            AI-driven pattern recognition. Now seamlessly integrated into your
            Cursify workspace.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-text-primary px-7 font-mono text-sm font-bold text-text-inverse shadow-sm transition hover:bg-text-secondary"
            >
              <Download className="h-4 w-4" />
              Install
            </button>

            <button
              type="button"
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-xl border border-border bg-background-surface px-7 font-mono text-sm font-bold text-text-primary transition hover:bg-background-light"
            >
              View Details
            </button>
          </div>
        </div>

        <div className="relative hidden min-h-[300px] border-l border-border bg-info-light lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(21,30,48,0.12)_1px,transparent_0)] bg-[length:22px_22px]" />

          <Workflow className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 text-text-primary opacity-10" />
        </div>
      </div>
    </section>
  );
}

function ToolCard({
  name,
  category,
  description,
  version,
  downloads,
  badge,
  icon: Icon,
  installed = false,
}: ToolItem) {
  return (
    <article className="group flex min-h-[330px] flex-col rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] transition hover:-translate-y-1 hover:border-text-primary md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-background-light text-text-primary">
          <Icon className="h-7 w-7" />
        </div>

        <ToolBadge badge={badge} />
      </div>

      <div className="mt-7">
        <h3 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
          {name}
        </h3>

        <p className="mt-1 font-mono text-sm text-text-secondary">
          {category}
        </p>
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-text-secondary">
        {description}
      </p>

      <div className="mt-7 flex items-center justify-between gap-4 border-t border-border pt-5">
        {installed ? (
          <div className="inline-flex items-center gap-2 font-mono text-sm text-text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Installed
          </div>
        ) : (
          <p className="font-mono text-sm text-text-secondary">
            {version} • {downloads}
          </p>
        )}

        {installed ? (
          <button
            type="button"
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-background-surface px-4 font-mono text-sm font-bold text-text-primary transition hover:bg-background-light"
          >
            Settings
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-text-primary px-5 font-mono text-sm font-bold text-text-inverse shadow-sm transition hover:bg-text-secondary"
          >
            Install
          </button>
        )}
      </div>
    </article>
  );
}

function ToolBadge({ badge }: { badge: "Verified" | "Community" }) {
  if (badge === "Community") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background-light px-3 py-1.5 font-mono text-xs text-text-primary">
        <Users className="h-3.5 w-3.5" />
        Community
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-info-light px-3 py-1.5 font-mono text-xs text-text-primary">
      <Verified className="h-3.5 w-3.5" />
      Verified
    </span>
  );
}