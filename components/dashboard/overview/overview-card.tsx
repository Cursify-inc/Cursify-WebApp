import type { ElementType } from "react";

export function OverviewCard({
  icon: Icon,
  title,
  subtitle,
  badge,
  badgeTone,
  action,
}: {
  icon: ElementType;
  title: string;
  subtitle: string;
  badge: string;
  badgeTone: "blue" | "light" | "success";
  action?: string;
}) {
  const badgeClass =
    badgeTone === "success"
      ? "text-success"
      : badgeTone === "blue"
        ? "bg-[#DDE5FF] text-brand"
        : "bg-[#EEF2FF] text-text-primary";

  return (
    <article className="min-h-[205px] cursor-pointer rounded-xl border border-border bg-background-surface p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8EBFF] text-brand">
          <Icon className="h-5 w-5" />
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 font-mono text-xs ${badgeClass}`}
        >
          {badgeTone === "success" && (
            <span className="h-2 w-2 rounded-full bg-success" />
          )}

          {badge}
        </span>
      </div>

      <h3 className="mt-6 text-2xl font-black tracking-[-0.04em] text-text-primary">
        {title}
      </h3>

      <p className="mt-2 text-base text-text-secondary">{subtitle}</p>

      {action && (
        <button className="mt-5 cursor-pointer font-mono text-sm text-text-primary transition hover:text-brand">
          {action} →
        </button>
      )}
    </article>
  );
}