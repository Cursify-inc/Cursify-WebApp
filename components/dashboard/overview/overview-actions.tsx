export function OverviewActions() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-brand px-7 font-mono text-sm font-bold text-text-inverse transition hover:bg-brand-hover">
        Download Desktop IDE
      </button>

      <button className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-background-surface px-7 font-mono text-sm font-bold text-text-primary transition hover:bg-background-light">
        Pair a Device
      </button>
    </div>
  );
}