import {
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  HardDrive,
  History,
  Info,
  ShieldCheck,
  Terminal,
  Verified,
  Zap,
  Grid2X2,
} from "lucide-react";

const releases = [
  {
    version: "v1.4.2",
    date: "Today",
    description:
      "Fixes terminal rendering artifacts on Wayland and improves agent memory context windows.",
    active: true,
  },
  {
    version: "v1.4.1",
    date: "Oct 12",
    description:
      "Security patch for extension sandbox escape vulnerability (CVE-2023-XXXX).",
  },
  {
    version: "v1.4.0",
    date: "Oct 01",
    description:
      "Major release: Introduced Claude 3.5 Sonnet support and multi-cursor sync.",
  },
];

export function DownloadsPanel() {
  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-3xl font-black tracking-[-0.04em] text-text-primary md:text-4xl">
          Download Cursify
        </h1>

        <p className="mt-3 text-lg leading-8 text-text-secondary">
          Get the latest stable releases for your environment.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <MainDownloadCard />
        <RecentReleases />
      </div>

      <section className="space-y-5">
        <h2 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
          Other Platforms
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <PlatformCard
            icon={Grid2X2}
            title="Windows"
            description="Requires Windows 10 or later. WSL2 integration included by default."
            buttons={[".exe Installer", "System .msi"]}
          />

          <PlatformCard
            icon={Terminal}
            title="Linux"
            description="x64 and ARM64 architectures supported. Wayland native rendering available."
            buttons={[".deb (Debian/Ubuntu)", ".rpm (Fedora/RHEL)", "AppImage"]}
          />
        </div>
      </section>

      <div className="grid gap-6 border-t border-border pt-7 lg:grid-cols-2">
        <SecurityNotice />
        <ImportantNotice />
      </div>
    </div>
  );
}

function MainDownloadCard() {
  return (
    <section className="relative overflow-hidden rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7 lg:col-span-2">
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-info-light blur-3xl" />

      <div className="relative z-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background-light px-3 py-1.5 font-mono text-xs font-semibold text-text-secondary">
          <Verified className="h-3.5 w-3.5 text-info" />
          Recommended for you
        </span>

        <h2 className="mt-6 text-3xl font-black tracking-[-0.04em] text-text-primary">
          macOS{" "}
          <span className="font-normal text-text-secondary">v1.4.2 Stable</span>
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
          The complete IDE experience optimized for Apple Silicon and Intel
          Macs. Includes integrated AI agent support and local telemetry
          processing.
        </p>

        <div className="mt-7 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-text-primary px-6 font-mono text-sm font-bold text-text-inverse shadow-sm transition hover:bg-text-secondary"
          >
            <Download className="h-4 w-4" />
            Download for Apple Silicon
          </button>

          <button
            type="button"
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-xl border border-border bg-background-surface px-6 font-mono text-sm font-bold text-text-primary transition hover:bg-background-light"
          >
            Download for Intel
          </button>
        </div>

        <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 border-t border-border pt-5 font-mono text-xs text-text-secondary">
          <MetaItem icon={CheckCircle2} label="SHA-256 Validated" />
          <MetaItem icon={ShieldCheck} label="Apple Notarized" />
          <MetaItem icon={HardDrive} label="~450 MB" />
        </div>
      </div>
    </section>
  );
}

function RecentReleases() {
  return (
    <section className="rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7">
      <div className="mb-6 flex items-center gap-3">
        <History className="h-5 w-5 text-text-primary" />

        <h2 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
          Recent Releases
        </h2>
      </div>

      <div className="space-y-5">
        {releases.map((release, index) => (
          <div
            key={release.version}
            className="relative grid gap-2 pl-7 before:absolute before:left-[7px] before:top-5 before:h-[calc(100%+1.25rem)] before:w-px before:bg-border last:before:hidden"
          >
            <span
              className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 bg-background-surface ${
                release.active ? "border-text-primary" : "border-border"
              }`}
            />

            <div className="flex items-center justify-between gap-4">
              <h3 className="font-mono text-sm font-bold text-text-primary">
                {release.version}
              </h3>

              <span className="font-mono text-xs text-text-secondary">
                {release.date}
              </span>
            </div>

            <p className="text-sm leading-6 text-text-secondary">
              {release.description}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-6 inline-flex cursor-pointer items-center gap-2 border-t border-border pt-5 font-mono text-xs font-bold text-text-primary transition hover:text-brand"
      >
        View Full Changelog
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </section>
  );
}

function PlatformCard({
  icon: Icon,
  title,
  description,
  buttons,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  buttons: string[];
}) {
  return (
    <section className="rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Icon className="h-7 w-7 text-text-primary" />

          <h3 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
            {title}
          </h3>
        </div>

        <span className="rounded-md bg-background-light px-3 py-1 font-mono text-xs text-text-secondary">
          v1.4.2
        </span>
      </div>

      <p className="min-h-[48px] text-sm leading-6 text-text-secondary">
        {description}
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        {buttons.map((button) => (
          <button
            key={button}
            type="button"
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-background-surface px-4 font-mono text-sm font-bold text-text-primary transition hover:bg-background-light"
          >
            <Download className="h-4 w-4" />
            {button}
          </button>
        ))}
      </div>
    </section>
  );
}

function SecurityNotice() {
  return (
    <section className="rounded-xl border border-border bg-background-surface p-5 shadow-[0_12px_40px_rgba(21,30,48,0.06)]">
      <h3 className="flex items-center gap-2 font-mono text-sm font-bold text-text-primary">
        <ShieldCheck className="h-4 w-4" />
        Security & Checksums
      </h3>

      <p className="mt-2 text-sm leading-6 text-text-secondary">
        All binaries are signed and validated. You can verify the integrity of
        your download against our published hashes.
      </p>

      <button
        type="button"
        className="mt-3 inline-flex cursor-pointer items-center gap-2 font-mono text-xs font-bold text-text-primary transition hover:text-brand"
      >
        View Checksums
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
    </section>
  );
}

function ImportantNotice() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-text-primary p-5 text-text-inverse shadow-[0_12px_40px_rgba(21,30,48,0.06)]">
      <div className="absolute bottom-0 left-0 top-0 w-1 bg-brand-light" />

      <h3 className="flex items-center gap-2 font-mono text-sm font-bold">
        <Info className="h-4 w-4" />
        Important Notice
      </h3>

      <p className="mt-2 text-sm leading-6 opacity-90">
        Downloads are account-bound and may expire. The desktop app pairs with
        your Cursify account during initial installation. Ensure you are logging
        in with the account used to download the binary.
      </p>
    </section>
  );
}

function MetaItem({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}