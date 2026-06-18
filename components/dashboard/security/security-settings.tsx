"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Globe2,
  History,
  KeyRound,
  Laptop,
  LogIn,
  MapPin,
  Monitor,
  MoreHorizontal,
  PlusCircle,
  ShieldCheck,
  Smartphone,
  XCircle,
} from "lucide-react";
import { useState } from "react";

const sessions = [
  {
    device: "macOS • Safari",
    location: "San Francisco, CA",
    meta: "192.168.1.105",
    icon: Laptop,
    current: true,
  },
  {
    device: "iOS • Cursify Mobile App",
    location: "San Jose, CA",
    meta: "Active 2 hours ago",
    icon: Smartphone,
  },
  {
    device: "Windows • Chrome",
    location: "New York, NY",
    meta: "Active 3 days ago",
    icon: Monitor,
  },
];

const auditLogs = [
  {
    event: "Successful Login",
    date: "Oct 24, 2023 • 09:41 AM",
    ip: "192.168.1.105",
    status: "Success",
    type: "success",
    icon: LogIn,
  },
  {
    event: "Password Changed",
    date: "Oct 20, 2023 • 14:22 PM",
    ip: "192.168.1.105",
    status: "Success",
    type: "success",
    icon: MoreHorizontal,
  },
  {
    event: "Failed Login Attempt",
    date: "Oct 18, 2023 • 23:15 PM",
    ip: "45.22.19.102",
    status: "Failed",
    type: "failed",
    icon: AlertTriangle,
  },
  {
    event: "Successful Login",
    date: "Oct 15, 2023 • 08:30 AM",
    ip: "67.11.89.201",
    status: "Success",
    type: "success",
    icon: LogIn,
  },
];

function getPasswordStrength(password: string) {
  if (!password) return null;

  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (hasMinLength && hasLetter && hasNumber && hasSymbol) {
    return {
      label: "Strong password",
      width: "100%",
      className: "bg-success",
      textClassName: "text-success",
    };
  }

  if (password.length >= 6 && (hasLetter || hasNumber)) {
    return {
      label: "Medium password",
      width: "66%",
      className: "bg-warning",
      textClassName: "text-warning",
    };
  }

  return {
    label: "Weak password",
    width: "33%",
    className: "bg-danger",
    textClassName: "text-danger",
  };
}

export function SecuritySettings() {
  return (
    <div className="grid gap-7 lg:grid-cols-[330px_1fr]">
      <div className="space-y-7">
        <ChangePasswordCard />
        <TwoFactorCard />
      </div>

      <div className="space-y-7">
        <ActiveSessionsCard />
        <AuditLogCard />
      </div>
    </div>
  );
}

function ChangePasswordCard() {
  const [newPassword, setNewPassword] = useState("");
  const strength = getPasswordStrength(newPassword);

  return (
    <section className="rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7">
      <SectionHeader icon={KeyRound} title="Change Password" />

      <form className="mt-6 space-y-4 border-t border-border pt-6">
        <PasswordField label="Current Password" defaultValue="••••••••" />

        <label className="block space-y-2">
          <span className="font-mono text-sm font-medium text-text-primary">
            New Password
          </span>

          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-background-surface px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-light/30"
          />

          {strength && (
            <div className="space-y-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-light">
                <div
                  className={`h-full transition-all duration-300 ${strength.className}`}
                  style={{ width: strength.width }}
                />
              </div>

              <p className={`font-mono text-xs font-semibold ${strength.textClassName}`}>
                {strength.label}
              </p>

              <p className="text-xs leading-5 text-text-secondary">
                Use at least 8 characters with letters, numbers, and one symbol.
              </p>
            </div>
          )}
        </label>

        <PasswordField label="Confirm New Password" />
<button
  type="button"
  className="mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-text-primary px-7 font-mono text-sm font-bold text-text-inverse shadow-sm transition hover:bg-text-secondary disabled:cursor-not-allowed"
  disabled={strength?.label !== "Strong password"}
>
  Update Password
</button>
      </form>
    </section>
  );
}

function PasswordField({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-sm font-medium text-text-primary">
        {label}
      </span>

      <input
        type="password"
        defaultValue={defaultValue}
        className="h-12 w-full rounded-xl border border-border bg-background-surface px-4 text-sm text-text-primary outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-light/30"
      />
    </label>
  );
}

function TwoFactorCard() {
  return (
    <section className="rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader icon={ShieldCheck} title="Two-Factor Auth" />

        <span className="rounded-md border border-border bg-background-light px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          Disabled
        </span>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <p className="text-sm leading-6 text-text-secondary">
          Add an extra layer of security to your account by requiring a code from
          your authenticator app when logging in.
        </p>

        <button
          type="button"
          className="mt-5 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-background-surface px-4 font-mono text-sm font-bold text-text-primary transition hover:border-brand hover:bg-background-light"
        >
          <PlusCircle className="h-4 w-4" />
          Setup 2FA
        </button>
      </div>
    </section>
  );
}

function ActiveSessionsCard() {
  return (
    <section className="overflow-hidden rounded-[1.35rem] border border-border bg-background-surface shadow-[0_12px_40px_rgba(21,30,48,0.06)]">
      <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-7">
        <SectionHeader icon={Monitor} title="Active Sessions" />

        <button
          type="button"
          className="w-fit cursor-pointer font-mono text-xs font-semibold text-danger transition hover:underline"
        >
          Revoke All Other Sessions
        </button>
      </div>

      <div className="border-t border-border">
        <div className="divide-y divide-border">
          {sessions.map((session) => (
            <SessionRow key={session.device} {...session} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SessionRow({
  device,
  location,
  meta,
  icon: Icon,
  current = false,
}: {
  device: string;
  location: string;
  meta: string;
  icon: React.ElementType;
  current?: boolean;
}) {
  return (
    <div
      className={`group flex flex-col gap-4 p-5 transition sm:flex-row sm:items-start ${
        current ? "bg-background-light" : "hover:bg-background-light"
      }`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background-surface text-text-primary">
        <Icon className="h-6 w-6" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-mono text-sm font-bold text-text-primary">
            {device}
          </h3>

          {current && (
            <span className="rounded-md border border-border bg-background-surface px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
              Current Session
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-col gap-1 text-sm text-text-secondary sm:flex-row sm:flex-wrap sm:gap-x-4">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </span>

          <span className="inline-flex items-center gap-1">
            {current ? (
              <Globe2 className="h-3.5 w-3.5" />
            ) : (
              <Clock className="h-3.5 w-3.5" />
            )}
            {meta}
          </span>
        </div>
      </div>

      {!current && (
        <button
          type="button"
          className="w-fit cursor-pointer rounded-lg p-2 text-text-tertiary transition hover:bg-danger-light hover:text-danger sm:opacity-0 sm:group-hover:opacity-100"
          aria-label={`Revoke ${device} session`}
        >
          <XCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function AuditLogCard() {
  return (
    <section className="overflow-hidden rounded-[1.35rem] border border-border bg-background-surface shadow-[0_12px_40px_rgba(21,30,48,0.06)]">
      <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-7">
        <SectionHeader icon={History} title="Security Audit Log" />

        <button
          type="button"
          className="inline-flex w-fit cursor-pointer items-center gap-2 font-mono text-xs font-semibold text-text-primary transition hover:text-brand"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="border-t border-border">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-background-surface font-mono text-xs uppercase tracking-[0.14em] text-text-secondary">
                <th className="p-4 font-medium">Event</th>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">IP Address</th>
                <th className="p-4 text-right font-medium">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {auditLogs.map((log) => (
                <AuditRow key={`${log.event}-${log.date}`} {...log} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-border md:hidden">
          {auditLogs.map((log) => (
            <AuditMobileCard key={`${log.event}-${log.date}`} {...log} />
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-background-elevated p-4 text-center">
        <button
          type="button"
          className="cursor-pointer font-mono text-sm text-text-secondary transition hover:text-text-primary"
        >
          View All Activity
        </button>
      </div>
    </section>
  );
}

function AuditRow({
  event,
  date,
  ip,
  status,
  type,
  icon: Icon,
}: {
  event: string;
  date: string;
  ip: string;
  status: string;
  type: string;
  icon: React.ElementType;
}) {
  const failed = type === "failed";

  return (
    <tr
      className={`transition hover:bg-background-light ${
        failed ? "bg-danger-light/20" : ""
      }`}
    >
      <td className="p-4">
        <div className="flex items-center gap-2 font-medium text-text-primary">
          <Icon
            className={`h-4 w-4 ${
              failed ? "text-danger" : "text-text-secondary"
            }`}
          />
          {event}
        </div>
      </td>

      <td className="p-4 text-sm text-text-secondary">{date}</td>
      <td className="p-4 font-mono text-sm text-text-secondary">{ip}</td>

      <td className="p-4 text-right">
        <StatusBadge failed={failed} status={status} />
      </td>
    </tr>
  );
}

function AuditMobileCard({
  event,
  date,
  ip,
  status,
  type,
  icon: Icon,
}: {
  event: string;
  date: string;
  ip: string;
  status: string;
  type: string;
  icon: React.ElementType;
}) {
  const failed = type === "failed";

  return (
    <div className={`space-y-3 p-5 ${failed ? "bg-danger-light/20" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 font-medium text-text-primary">
          <Icon
            className={`h-4 w-4 shrink-0 ${
              failed ? "text-danger" : "text-text-secondary"
            }`}
          />
          <span>{event}</span>
        </div>

        <StatusBadge failed={failed} status={status} />
      </div>

      <div className="grid gap-2 text-sm text-text-secondary">
        <p>
          <span className="font-mono text-xs uppercase tracking-[0.14em]">
            Date:
          </span>{" "}
          {date}
        </p>

        <p>
          <span className="font-mono text-xs uppercase tracking-[0.14em]">
            IP:
          </span>{" "}
          <span className="font-mono">{ip}</span>
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  failed,
  status,
}: {
  failed: boolean;
  status: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2.5 py-1 font-mono text-xs ${
        failed
          ? "border-danger bg-danger-light text-danger"
          : "border-success bg-success-light text-success"
      }`}
    >
      {failed ? (
        <XCircle className="h-3.5 w-3.5" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5" />
      )}
      {status}
    </span>
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