import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Save,
  SlidersHorizontal,
  User,
} from "lucide-react";

export function AccountSettings() {
  return (
    <div className="space-y-7">
      <section className="rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7">
        <SectionHeader icon={User} title="Profile" />

        <div className="mt-6 grid gap-7 border-t border-border pt-6 lg:grid-cols-[150px_1fr]">
          <div className="flex flex-col items-center lg:items-start">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-border bg-background-light shadow-sm">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-dark via-brand to-brand-light text-4xl font-black text-text-inverse">
                A
              </div>
            </div>

            <button
              type="button"
              className="mt-3 cursor-pointer font-mono text-xs text-text-primary transition hover:text-brand"
            >
              Change Avatar
            </button>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="displayName"
                className="font-mono text-sm font-medium text-text-primary"
              >
                Display Name
              </label>

              <input
                id="displayName"
                defaultValue="Alex"
                className="h-12 w-full rounded-xl border border-border bg-background-surface px-4 text-base text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-light/30"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="font-mono text-sm font-medium text-text-primary"
              >
                Email Address
              </label>

              <div className="flex h-12 items-center rounded-xl border border-border bg-background-light px-4">
                <input
                  id="email"
                  defaultValue="alex@example.com"
                  readOnly
                  className="min-w-0 flex-1 bg-transparent text-base text-text-primary outline-none"
                />

                <span className="ml-3 inline-flex items-center gap-1 rounded-md bg-background-surface px-2.5 py-1 font-mono text-xs text-text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </span>
              </div>

              <p className="text-sm text-text-secondary">
                Used for login and important notifications.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 flex justify-end border-t border-border pt-5">
          <button
            type="button"
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-text-primary px-7 font-mono text-sm font-bold text-text-inverse shadow-sm transition hover:bg-text-secondary"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </section>

      <section className="rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7">
        <SectionHeader icon={SlidersHorizontal} title="Preferences" />

        <div className="mt-6 grid gap-5 border-t border-border pt-6 md:grid-cols-2">
          <SelectField
            label="Interface Language"
            value="English (US)"
          />

          <SelectField
            label="Region / Timezone"
            value="Pacific Time (PT)"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.35rem] border border-danger bg-background-surface shadow-[0_12px_40px_rgba(21,30,48,0.06)]">
        <div className="border-l-4 border-danger p-6 md:p-7">
          <div className="flex items-center gap-3 text-danger">
            <AlertTriangle className="h-6 w-6" />

            <h2 className="text-2xl font-black tracking-[-0.04em]">
              Danger Zone
            </h2>
          </div>

          <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Delete Account
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-danger bg-danger-light px-7 font-mono text-sm font-bold text-danger transition hover:bg-danger hover:text-white"
            >
              Delete Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-text-primary" />

      <h2 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
        {title}
      </h2>
    </div>
  );
}

function SelectField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-sm font-medium text-text-primary">
        {label}
      </span>

      <button
        type="button"
        className="flex h-12 w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-background-surface px-4 text-left text-base text-text-primary transition hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand-light/30"
      >
        <span>{value}</span>
        <ChevronDown className="h-5 w-5 text-text-secondary" />
      </button>
    </label>
  );
}