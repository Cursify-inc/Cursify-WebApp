import { Check, CircleAlert } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import type { ReactNode } from "react";

const linkedAccounts = [
  {
    name: "GitHub",
    status: "Connected as @dev-cursify",
    statusTone: "success",
    logo: <FaGithub className="h-7 w-7 text-white" />,
    iconClassName: "bg-[#24292E]",
    action: "Configure",
    actionVariant: "secondary",
    footerAction: "Disconnect",
    footerVariant: "danger",
    content: (
      <div className="rounded-xl bg-background-light p-4">
        <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
          Active Permissions
        </p>

        <ul className="space-y-2 text-sm text-text-primary">
          <PermissionItem>
            Read & Write to Public/Private Repositories
          </PermissionItem>
          <PermissionItem>Manage Pull Requests & Issues</PermissionItem>
          <PermissionItem>Read User Profile Data</PermissionItem>
        </ul>
      </div>
    ),
  },
  {
    name: "GitLab",
    status: "Token Expired (2 days ago)",
    statusTone: "warning",
    logo: <GitLabLogo />,
    iconClassName: "bg-[#FC6D26]",
    action: "Reconnect",
    actionVariant: "primary",
    content: (
      <div className="rounded-xl border border-danger-light bg-danger-light p-4">
        <div className="flex items-start gap-3">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger" />

          <div>
            <p className="font-mono text-sm font-bold text-text-primary">
              Authentication Required
            </p>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Your OAuth token has expired. Please reconnect to restore CI/CD
              pipeline visibility and merge request sync.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    name: "Slack",
    status: "Not Connected",
    statusTone: "neutral",
    logo: <SlackLogo />,
    iconClassName: "border border-border bg-white",
    action: "Connect",
    actionVariant: "secondary",
    content: (
      <InfoBox>
        Connect Slack to receive IDE notifications, share code snippets directly
        to channels, and trigger AI agent workflows from Slack commands.
      </InfoBox>
    ),
  },
  {
    name: "ClickUp",
    status: "Not Connected",
    statusTone: "neutral",
    logo: <ClickUpLogo />,
    iconClassName: "bg-[#7B68EE]",
    action: "Connect",
    actionVariant: "secondary",
    content: (
      <InfoBox>
        Link your ClickUp workspace to view assigned tasks, update task statuses
        from commit messages, and track time natively within the IDE.
      </InfoBox>
    ),
  },
];

export function LinkedAccountsPanel() {
  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-3xl font-black tracking-[-0.04em] text-text-primary md:text-4xl">
          Linked Accounts
        </h1>

        <p className="mt-3 max-w-3xl text-lg leading-8 text-text-secondary">
          Connect external services to Cursify IDE to streamline your workflow,
          enable AI-assisted code reviews, and sync your development
          environments seamlessly.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {linkedAccounts.map((account) => (
          <LinkedAccountCard key={account.name} {...account} />
        ))}
      </div>
    </div>
  );
}

function LinkedAccountCard({
  name,
  status,
  statusTone,
  logo,
  iconClassName,
  action,
  actionVariant,
  footerAction,
  footerVariant,
  content,
}: {
  name: string;
  status: string;
  statusTone: string;
  logo: ReactNode;
  iconClassName: string;
  action: string;
  actionVariant: string;
  footerAction?: string;
  footerVariant?: string;
  content: ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] transition hover:border-brand md:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
          >
            {logo}
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
              {name}
            </h2>

            <div className="mt-1 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  statusTone === "success"
                    ? "bg-success"
                    : statusTone === "warning"
                      ? "bg-warning"
                      : "bg-border"
                }`}
              />

              <span className="font-mono text-xs text-text-secondary">
                {status}
              </span>
            </div>
          </div>
        </div>

        {actionVariant === "secondary" && name === "GitHub" && (
          <Button variant="secondary">{action}</Button>
        )}
      </div>

      <div className="flex-1">{content}</div>

      <div className="mt-5 flex justify-end border-t border-border pt-5">
        {footerAction ? (
          <Button variant={footerVariant === "danger" ? "danger" : "secondary"}>
            {footerAction}
          </Button>
        ) : (
          <Button variant={actionVariant === "primary" ? "primary" : "secondary"}>
            {action}
          </Button>
        )}
      </div>
    </section>
  );
}

function PermissionItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="h-4 w-4 text-text-primary" />
      <span>{children}</span>
    </li>
  );
}

function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl bg-background-light p-4">
      <p className="text-sm leading-6 text-text-secondary">{children}</p>
    </div>
  );
}

function Button({
  children,
  variant,
}: {
  children: ReactNode;
  variant: "primary" | "secondary" | "danger";
}) {
  const className =
    variant === "primary"
      ? "bg-text-primary text-text-inverse hover:bg-text-secondary"
      : variant === "danger"
        ? "text-danger hover:bg-danger-light"
        : "border border-border bg-background-surface text-text-primary hover:bg-background-light";

  return (
    <button
      type="button"
      className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl px-5 font-mono text-sm font-bold transition ${className}`}
    >
      {children}
    </button>
  );
}

function GitLabLogo() {
  return (
    <svg
      className="h-8 w-8 text-white"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.919 1.263c-.137-.423-.73-.423-.868 0L1.387 9.452.045 13.587c-.121.375.014.789.331 1.023l11.624 8.443 11.624-8.443c.318-.235.453-.647.331-1.023z" />
    </svg>
  );
}

function SlackLogo() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z"
        fill="#E01E5A"
      />
      <path
        d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
        fill="#E01E5A"
      />
      <path
        d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z"
        fill="#36C5F0"
      />
      <path
        d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
        fill="#36C5F0"
      />
      <path
        d="M18.956 8.835a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.835a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.835z"
        fill="#2EB67D"
      />
      <path
        d="M17.687 8.835a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1-2.522-2.521V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.313z"
        fill="#2EB67D"
      />
      <path
        d="M15.166 18.958a2.528 2.528 0 0 1 2.521 2.522A2.528 2.528 0 0 1 15.166 24a2.528 2.528 0 0 1-2.521-2.52V18.958z"
        fill="#ECB22E"
      />
      <path
        d="M15.166 17.687a2.528 2.528 0 0 1-2.521-2.521 2.528 2.528 0 0 1 2.521-2.522h6.312A2.528 2.528 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.521h-6.312z"
        fill="#ECB22E"
      />
    </svg>
  );
}

function ClickUpLogo() {
  return (
    <svg
      className="h-7 w-7 text-white"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2L2 12l10 10 10-10L12 2zm0 14.5c-2.48 0-4.5-2.02-4.5-4.5s2.02-4.5 4.5-4.5 4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z" />
    </svg>
  );
}