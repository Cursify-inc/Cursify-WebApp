import type { ElementType } from "react";
import {
  Bot,
  Bug,
  Check,
  Cloud,
  Code2,
  Copy,
  FileText,
  FlaskConical,
  Grid2X2,
  List,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  Wrench,
} from "lucide-react";

type AgentTemplate = {
  title: string;
  description: string;
  model: string;
  permission: string;
  icon: ElementType;
};

type ActiveAgent = {
  name: string;
  description: string;
  model: string;
  permissions: string;
  syncStatus: "Synced" | "Pending Sync";
  syncDetail: string;
  icon: ElementType;
  iconTone: "primary" | "secondary";
};

const templates: AgentTemplate[] = [
  {
    title: "Code Reviewer",
    description:
      "Specialized in deep code analysis, identifying security flaws, and suggesting performance optimizations.",
    model: "GPT-4o",
    permission: "Read-only",
    icon: Code2,
  },
  {
    title: "Unit Test Generator",
    description:
      "Automatically writes comprehensive unit tests for your functions, focusing on edge cases.",
    model: "Claude 3.5 Sonnet",
    permission: "Read/Write",
    icon: FlaskConical,
  },
  {
    title: "Documentation Writer",
    description:
      "Drafts precise JSDoc/Docstrings and updates markdown files based on code changes.",
    model: "GPT-4o Mini",
    permission: "Read/Write",
    icon: FileText,
  },
];

const activeAgents: ActiveAgent[] = [
  {
    name: "Debug Assistant",
    description: "Analyzes stack traces and suggests fixes",
    model: "GPT-4o",
    permissions: "Read-only",
    syncStatus: "Synced",
    syncDetail: "Today, 10:42 AM",
    icon: Bug,
    iconTone: "primary",
  },
  {
    name: "Refactor Bot",
    description: "Modernizes legacy codebase structures",
    model: "Claude 3.5 Sonnet",
    permissions: "Read/Write, FS Access",
    syncStatus: "Pending Sync",
    syncDetail: "Last synced yesterday",
    icon: Wrench,
    iconTone: "secondary",
  },
];

export function AgentsPanel() {
  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-[-0.08em] text-text-primary md:text-6xl">
            AI Agents
          </h1>

          <p className="mt-4 max-w-2xl text-xl leading-9 text-text-secondary">
            Create and manage AI agent configurations for your desktop IDE.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-wrap lg:justify-end">
          <div className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background-surface px-4 font-mono text-sm text-text-secondary shadow-sm">
            <Cloud className="h-4 w-4 text-text-primary" />
            IDE Synced: Just now
          </div>

          <button
            type="button"
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-background-surface px-4 font-mono text-sm font-bold text-text-primary transition hover:bg-background-light"
          >
            <RefreshCcw className="h-4 w-4" />
            Sync to Desktop
          </button>

          <button
            type="button"
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-text-primary px-5 font-mono text-sm font-bold text-text-inverse shadow-sm transition hover:bg-text-secondary"
          >
            <Plus className="h-4 w-4" />
            Create Agent
          </button>
        </div>
      </header>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl font-black tracking-[-0.04em] text-text-primary">
            Agent Templates
          </h2>

          <button
            type="button"
            className="cursor-pointer font-mono text-sm font-bold text-text-primary transition hover:text-brand"
          >
            View all templates
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.title} {...template} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl font-black tracking-[-0.04em] text-text-primary">
            Active Agents
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-lg p-2 text-text-primary transition hover:bg-background-light"
              aria-label="Grid view"
            >
              <Grid2X2 className="h-5 w-5" />
            </button>

            <button
              type="button"
              className="cursor-pointer rounded-lg border border-border bg-background-light p-2 text-text-primary"
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        <ActiveAgentsTable />
      </section>
    </div>
  );
}

function TemplateCard({
  title,
  description,
  model,
  permission,
  icon: Icon,
}: AgentTemplate) {
  return (
    <article className="group rounded-[1.35rem] border border-border bg-background-surface p-7 shadow-[0_12px_40px_rgba(21,30,48,0.06)] transition hover:-translate-y-1 hover:border-text-primary">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-background-light text-text-primary transition group-hover:bg-text-primary group-hover:text-text-inverse">
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="mt-7 text-2xl font-black tracking-[-0.04em] text-text-primary">
        {title}
      </h3>

      <p className="mt-3 text-base leading-7 text-text-secondary">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Tag label={model} />
        <Tag label={permission} />
      </div>
    </article>
  );
}

function ActiveAgentsTable() {
  return (
    <section className="overflow-hidden rounded-[1.35rem] border border-border bg-background-surface shadow-[0_12px_40px_rgba(21,30,48,0.06)]">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-background-light font-mono text-xs uppercase tracking-[0.12em] text-text-secondary">
              <th className="px-5 py-4 font-medium">Agent Name</th>
              <th className="px-5 py-4 font-medium">Model</th>
              <th className="px-5 py-4 font-medium">Permissions</th>
              <th className="px-5 py-4 font-medium">Sync Status</th>
              <th className="px-5 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {activeAgents.map((agent) => (
              <AgentRow key={agent.name} {...agent} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border lg:hidden">
        {activeAgents.map((agent) => (
          <AgentMobileCard key={agent.name} {...agent} />
        ))}
      </div>
    </section>
  );
}

function AgentRow({
  name,
  description,
  model,
  permissions,
  syncStatus,
  syncDetail,
  icon: Icon,
  iconTone,
}: ActiveAgent) {
  return (
    <tr className="group transition hover:bg-background-light">
      <td className="px-5 py-5">
        <div className="flex items-center gap-4">
          <AgentIcon icon={Icon} tone={iconTone} />

          <div>
            <p className="font-mono text-sm font-bold text-text-primary">
              {name}
            </p>

            <p className="mt-1 max-w-[240px] truncate text-xs text-text-secondary">
              {description}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-5">
        <Tag label={model} />
      </td>

      <td className="px-5 py-5 text-sm text-text-secondary">{permissions}</td>

      <td className="px-5 py-5">
        <SyncStatus status={syncStatus} detail={syncDetail} />
      </td>

      <td className="px-5 py-5 text-right">
        <div className="flex justify-end gap-2 opacity-0 transition group-hover:opacity-100">
          <ActionButton label="Edit" icon={Pencil} />
          <ActionButton label="Duplicate" icon={Copy} />
          <ActionButton label="Delete" icon={Trash2} danger />
        </div>
      </td>
    </tr>
  );
}

function AgentMobileCard({
  name,
  description,
  model,
  permissions,
  syncStatus,
  syncDetail,
  icon: Icon,
  iconTone,
}: ActiveAgent) {
  return (
    <article className="space-y-4 p-5">
      <div className="flex items-start gap-4">
        <AgentIcon icon={Icon} tone={iconTone} />

        <div className="min-w-0 flex-1">
          <h3 className="font-mono text-sm font-bold text-text-primary">
            {name}
          </h3>

          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MobileMeta label="Model">
          <Tag label={model} />
        </MobileMeta>

        <MobileMeta label="Permissions">
          <span className="text-sm text-text-secondary">{permissions}</span>
        </MobileMeta>

        <MobileMeta label="Sync Status">
          <SyncStatus status={syncStatus} detail={syncDetail} />
        </MobileMeta>
      </div>

      <div className="flex justify-end gap-2">
        <ActionButton label="Edit" icon={Pencil} />
        <ActionButton label="Duplicate" icon={Copy} />
        <ActionButton label="Delete" icon={Trash2} danger />
      </div>
    </article>
  );
}

function AgentIcon({
  icon: Icon,
  tone,
}: {
  icon: ElementType;
  tone: "primary" | "secondary";
}) {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
        tone === "primary"
          ? "bg-text-primary text-text-inverse"
          : "bg-background-light text-text-primary"
      }`}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
}

function SyncStatus({
  status,
  detail,
}: {
  status: "Synced" | "Pending Sync";
  detail: string;
}) {
  const isSynced = status === "Synced";

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 font-mono text-xs font-bold ${
          isSynced ? "text-text-primary" : "text-text-tertiary"
        }`}
      >
        {isSynced ? (
          <Cloud className="h-4 w-4" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
        {status}
      </div>

      <p className="mt-1 text-xs text-text-secondary">{detail}</p>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-md bg-background-light px-2.5 py-1.5 font-mono text-xs text-text-secondary">
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

      <div className="mt-2">{children}</div>
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  danger = false,
}: {
  label: string;
  icon: ElementType;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className={`cursor-pointer rounded-lg p-2 transition ${
        danger
          ? "text-text-secondary hover:bg-danger-light hover:text-danger"
          : "text-text-secondary hover:bg-background-light hover:text-text-primary"
      }`}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}