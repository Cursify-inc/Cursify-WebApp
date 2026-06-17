import { Bell, Cable, Menu, Search, Workflow } from "lucide-react";

export function DashboardTopbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-background-surface/80 px-6 backdrop-blur md:px-7">
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-background-surface text-text-primary transition hover:bg-background-light lg:hidden"
        aria-label="Open dashboard menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <nav className="hidden items-center gap-8 text-base text-text-primary md:flex">
        <a className="cursor-pointer transition hover:text-brand" href="#">
          Docs
        </a>

        <a className="cursor-pointer transition hover:text-brand" href="#">
          API
        </a>

        <a className="cursor-pointer transition hover:text-brand" href="#">
          Support
        </a>
      </nav>

      <div className="ml-auto flex items-center gap-5">
        <label className="hidden h-10 w-[280px] cursor-text items-center gap-2 rounded-xl border border-border bg-background-surface px-4 text-text-tertiary md:flex">
          <Search className="h-4 w-4" />

          <input
            className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
            placeholder="Search..."
          />
        </label>

        <button className="cursor-pointer text-text-primary transition hover:text-brand">
          <Workflow className="h-5 w-5" />
        </button>

        <button className="relative cursor-pointer text-text-primary transition hover:text-brand">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-brand text-text-inverse shadow-sm transition hover:bg-brand-hover">
          <Cable className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}