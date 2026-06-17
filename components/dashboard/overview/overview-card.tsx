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
      ? "text-success dark:border dark:border-success dark:bg-success-light dark:text-success"
      : badgeTone === "blue"
        ? "bg-[#DDE5FF] text-brand dark:border dark:border-border dark:bg-background-elevated dark:text-text-primary"
        : "bg-[#EEF2FF] text-brand dark:border dark:border-border dark:bg-background-light dark:text-text-primary";

  return (
    <article className="min-h-[205px] cursor-pointer rounded-xl border border-border bg-background-surface p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:hover:bg-background-elevated">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8EBFF] text-brand dark:border dark:border-border dark:bg-background-light dark:text-text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 font-mono text-xs font-semibold ${badgeClass}`}
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

      <p className="mt-2 text-base text-text-primary">{subtitle}</p>

      {action && (
        <button className="mt-5 cursor-pointer font-mono text-sm text-text-primary transition hover:text-brand dark:text-text-secondary dark:hover:text-text-primary">
          {action} →
        </button>
      )}
    </article>
  );
}