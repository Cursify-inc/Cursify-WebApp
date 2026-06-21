"use client";

import { useTheme } from "next-themes";
import {
  Beaker,
  Bell,
  Bot,
  Check,
  ChevronDown,
  Database,
  Gamepad2,
  Save,
  Server,
} from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

export function SettingsPanel() {
  const {theme, setTheme} = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleThemeChange(nextTheme: ThemeMode) {
    setTheme(nextTheme);
  }

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-3xl font-black tracking-[-0.04em] text-text-primary md:text-4xl">
          General Settings
        </h1>

        <p className="mt-3 max-w-3xl text-lg leading-8 text-text-secondary">
          Manage your global workspace preferences, appearance, and core platform
          behaviors.
        </p>
      </header>

      <div className="grid gap-7 lg:grid-cols-3">
        <section className="rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7 lg:col-span-2">
          <SectionHeader
            icon={Gamepad2}
            title="Appearance"
            description="Customize the look and feel of your IDE."
          />

          <div className="mt-6 space-y-6 border-t border-border pt-6">
            <div>
              <p className="font-mono text-sm font-medium text-text-primary">
                Theme Selection
              </p>

              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                <ThemeOption
                  label="Light"
                  value="light"
                  selected={mounted && theme === "light"}
                  onSelect={handleThemeChange}
                >
                  <LightPreview />
                </ThemeOption>

                <ThemeOption
                  label="Dark"
                  value="dark"
                  selected={mounted && theme === "dark"}
                  onSelect={handleThemeChange}
                >
                  <DarkPreview />
                </ThemeOption>

                <ThemeOption
                  label="System"
                  value="system"
                  selected={mounted && theme === "system"}
                  onSelect={handleThemeChange}
                >
                  <SystemPreview />
                </ThemeOption>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <label className="block space-y-2">
                <span className="font-mono text-sm font-medium text-text-primary">
                  Interface Density
                </span>

                <SelectButton value="Comfortable (Default)" />
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7">
          <SectionHeader
            icon={Check}
            title="Syncing"
            description="Manage how often your workspace data is synchronized across devices."
          />

          <div className="mt-6 space-y-6 border-t border-border pt-6">
            <label className="block space-y-2">
              <span className="font-mono text-sm font-medium text-text-primary">
                Auto-Sync Frequency
              </span>

              <SelectButton value="Real-time (Recommended)" />
            </label>

            <div className="border-t border-border pt-5">
              <p className="font-mono text-sm font-medium text-text-primary">
                Conflict Resolution
              </p>

              <div className="mt-3 space-y-2">
                <RadioOption label="Prefer Server" checked />
                <RadioOption label="Prefer Local" />
              </div>
            </div>

            <button
              type="button"
              className="flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-background-light px-4 font-mono text-sm font-bold text-text-primary transition hover:bg-background-elevated"
            >
              Sync Now
            </button>
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7">
          <SectionHeader icon={Bell} title="Notifications" />

          <div className="mt-6 divide-y divide-border border-t border-border pt-3">
            <ToggleRow
              title="Push Notifications"
              description="Desktop alerts for key events"
              defaultChecked
            />

            <ToggleRow
              title="Email Digests"
              description="Weekly summary of activity"
            />

            <ToggleRow
              title="In-App Alerts"
              description="Show dot indicator on nav"
              defaultChecked
            />
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7 lg:col-span-2">
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-info-light blur-3xl" />

          <div className="relative z-10">
            <SectionHeader
              icon={Beaker}
              title="Experimental Features"
              description="Early access to beta tools. May be unstable."
              dashed
            />

            <div className="mt-6 space-y-5">
              <FeatureToggle
                icon={Bot}
                title="AI Inline Suggestions"
                badge="Beta"
                description="Enable real-time code completions powered by our latest LLM. This feature actively analyzes your current context to provide predictive keystrokes."
              />

              <FeatureToggle
                icon={Server}
                title="Advanced Sandbox Mirroring"
                description="Automatically spin up shadow environments for untrusted extensions. Requires elevated system permissions."
              />
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-transparent px-7 font-mono text-sm font-bold text-text-secondary transition hover:border-border hover:bg-background-light"
        >
          Discard Changes
        </button>

        <button
          type="button"
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-text-primary px-7 font-mono text-sm font-bold text-text-inverse shadow-sm transition hover:bg-text-secondary"
        >
          <Save className="h-4 w-4" />
          Save Preferences
        </button>
      </div>
    </div>
  );
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;

  root.classList.remove("light", "dark");

  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add(prefersDark ? "dark" : "light");
    return;
  }

  root.classList.add(theme);
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  dashed = false,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          dashed
            ? "border border-dashed border-border bg-info-light text-text-primary"
            : "bg-background-light text-text-primary"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h2 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function ThemeOption({
  label,
  value,
  selected,
  onSelect,
  children,
}: {
  label: string;
  value: "light" | "dark" | "system";
  selected: boolean;
  onSelect: (value: "light" | "dark" | "system") => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className="group cursor-pointer text-left"
    >
      <div
        className={`h-28 overflow-hidden rounded-xl border-2 bg-background-surface p-1 transition ${
          selected ? "border-text-primary" : "border-border hover:border-brand"
        }`}
      >
        {children}
      </div>

      <p
        className={`mt-2 text-center font-mono text-sm ${
          selected ? "font-bold text-text-primary" : "text-text-secondary"
        }`}
      >
        {label}
      </p>
    </button>
  );
}

function LightPreview() {
  return (
    <div className="h-full rounded-lg border border-[#C4C9D4] bg-[#F9F9FF]">
      <div className="flex h-5 items-center gap-1 border-b border-[#C4C9D4]/40 px-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#C4C9D4]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#C4C9D4]" />
      </div>

      <div className="flex h-[calc(100%-1.25rem)]">
        <div className="w-1/4 border-r border-[#C4C9D4]/40 bg-white" />
        <div className="flex-1 space-y-2 p-3">
          <div className="h-2 rounded-full bg-[#DDE2F5]" />
          <div className="h-2 w-2/3 rounded-full bg-[#E9EDFF]" />
        </div>
      </div>
    </div>
  );
}

function DarkPreview() {
  return (
    <div className="h-full rounded-lg border border-[#3A4B6B] bg-[#151E30]">
      <div className="flex h-5 items-center gap-1 border-b border-white/10 px-2">
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
      </div>

      <div className="flex h-[calc(100%-1.25rem)]">
        <div className="w-1/4 border-r border-white/10 bg-[#24314A]" />
        <div className="flex-1 space-y-2 p-3">
          <div className="h-2 rounded-full bg-white/20" />
          <div className="h-2 w-2/3 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function SystemPreview() {
  return (
    <div className="flex h-full overflow-hidden rounded-lg border border-border">
      <div className="flex-1 bg-[#F9F9FF] p-3">
        <div className="h-2 rounded-full bg-[#DDE2F5]" />
        <div className="mt-2 h-2 w-2/3 rounded-full bg-[#E9EDFF]" />
      </div>

      <div className="flex-1 border-l border-border bg-[#151E30] p-3">
        <div className="h-2 rounded-full bg-white/20" />
        <div className="mt-2 h-2 w-2/3 rounded-full bg-white/10" />
      </div>
    </div>
  );
}

function SelectButton({ value }: { value: string }) {
  return (
    <button
      type="button"
      className="flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-background-surface px-4 text-left text-base text-text-primary transition hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light/30"
    >
      <span>{value}</span>
      <ChevronDown className="h-5 w-5 text-text-secondary" />
    </button>
  );
}

function RadioOption({
  label,
  checked = false,
}: {
  label: string;
  checked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
          checked ? "border-text-primary" : "border-border"
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-text-primary" />}
      </span>
      {label}
    </label>
  );
}

function ToggleRow({
  title,
  description,
  defaultChecked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="font-mono text-sm font-medium text-text-primary">
          {title}
        </p>

        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>

      <Toggle checked={checked} onChange={() => setChecked((value) => !value)} />
    </div>
  );
}

function FeatureToggle({
  icon: Icon,
  title,
  badge,
  description,
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  description: string;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-dashed border-border bg-info-light/40 p-5">
      <div className="flex items-start gap-4">
        <Icon className="mt-1 h-5 w-5 shrink-0 text-text-primary" />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-sm font-bold text-text-primary">
              {title}
            </p>

            {badge && (
              <span className="rounded-md bg-text-primary px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-inverse">
                {badge}
              </span>
            )}
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            {description}
          </p>
        </div>
      </div>

      <Toggle checked={checked} onChange={() => setChecked((value) => !value)} />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full border border-border transition ${
        checked ? "bg-text-primary" : "bg-background-light"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-background-surface shadow-sm transition ${
          checked ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}