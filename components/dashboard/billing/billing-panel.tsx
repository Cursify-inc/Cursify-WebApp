import {
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  Edit3,
} from "lucide-react";

const invoices = [
  {
    date: "Sep 15, 2024",
    id: "INV-2024-09",
    amount: "$49.00",
    status: "Paid",
  },
  {
    date: "Aug 15, 2024",
    id: "INV-2024-08",
    amount: "$49.00",
    status: "Paid",
  },
  {
    date: "Jul 15, 2024",
    id: "INV-2024-07",
    amount: "$49.00",
    status: "Paid",
  },
];

export function BillingPanel() {
  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-3xl font-black tracking-[-0.04em] text-text-primary md:text-4xl">
          Billing & Subscription
        </h1>

        <p className="mt-3 max-w-3xl text-lg leading-8 text-text-secondary">
          Manage your plan, payment methods, and invoices.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <CurrentPlanCard />
        <PaymentMethodCard />
      </div>

      <AvailablePlansCard />

      <div className="grid gap-6 lg:grid-cols-3">
        <InvoiceHistoryCard />
        <BillingDetailsCard />
      </div>
    </div>
  );
}

function CurrentPlanCard() {
  return (
    <section className="relative overflow-hidden rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7 lg:col-span-2">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-background-light blur-3xl" />

      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
              Pro Plan
            </h2>

            <span className="rounded-md border border-border bg-background-light px-2.5 py-1 font-mono text-xs font-semibold text-text-secondary">
              Active
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Ideal for professional developers and small teams.
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-4xl font-black tracking-[-0.06em] text-text-primary">
            $49
            <span className="text-base font-normal tracking-normal text-text-secondary">
              /mo
            </span>
          </p>

          <p className="mt-1 font-mono text-xs text-text-secondary">
            Renews Oct 15, 2024
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-7 border-t border-border pt-5">
        <h3 className="font-mono text-sm font-bold text-text-primary">
          Plan Entitlements:
        </h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Entitlement label="Unlimited AI Inference" />
          <Entitlement label="500GB Cloud Storage" />
          <Entitlement label="Up to 5 Team Seats" />
          <Entitlement label="Priority Support" />
        </div>
      </div>
    </section>
  );
}

function PaymentMethodCard() {
  return (
    <section className="rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7">
      <h2 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
        Payment Method
      </h2>

      <div className="mt-5 flex items-center gap-4 rounded-xl border border-border bg-background-light p-4">
        <div className="flex h-9 w-14 shrink-0 items-center justify-center rounded-md bg-text-primary font-mono text-xs font-black italic text-text-inverse">
          VISA
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-bold tracking-[0.18em] text-text-primary">
            •••• •••• ••••{" "}
            <span className="tracking-normal">4242</span>
          </p>

          <p className="mt-1 font-mono text-xs text-text-secondary">
            Expires 12/25
          </p>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-background-surface px-5 font-mono text-sm font-bold text-text-primary transition hover:bg-background-light"
      >
        Update Payment
      </button>
    </section>
  );
}

function AvailablePlansCard() {
  return (
    <section className="rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7">
      <h2 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
        Available Plans
      </h2>

      <div className="mt-7 grid gap-6 md:grid-cols-2">
        <PlanCard
          title="Free Tier"
          price="$0"
          buttonLabel="Downgrade"
          features={["Limited AI Queries", "5GB Storage", "1 User"]}
        />

        <PlanCard
          title="Enterprise"
          price="$199"
          buttonLabel="Upgrade to Enterprise"
          featured
          features={[
            "Custom AI Models",
            "Unlimited Storage",
            "Unlimited Users & SSO",
            "Dedicated Account Manager",
          ]}
        />
      </div>
    </section>
  );
}

function PlanCard({
  title,
  price,
  features,
  buttonLabel,
  featured = false,
}: {
  title: string;
  price: string;
  features: string[];
  buttonLabel: string;
  featured?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl border border-border p-5 ${
        featured ? "bg-background-light" : "bg-background-surface"
      }`}
    >
      {featured && (
        <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-brand-light/20" />
      )}

      <div className="relative z-10">
        <h3 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
          {title}
        </h3>

        <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-text-primary">
          {price}
          <span className="text-sm font-normal tracking-normal text-text-secondary">
            /mo
          </span>
        </p>

        <ul className="mt-5 space-y-3">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-text-secondary"
            >
              <Check className="h-4 w-4 text-text-primary" />
              {feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={`mt-8 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl px-5 font-mono text-sm font-bold transition ${
            featured
              ? "bg-text-primary text-text-inverse hover:bg-text-secondary"
              : "border border-border bg-background-surface text-text-primary hover:bg-background-light"
          }`}
        >
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}

function InvoiceHistoryCard() {
  return (
    <section className="overflow-hidden rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7 lg:col-span-2">
      <h2 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
        Invoice History
      </h2>

      <div className="mt-5 hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border font-mono text-xs text-text-secondary">
              <th className="py-3 font-medium">Date</th>
              <th className="py-3 font-medium">Invoice ID</th>
              <th className="py-3 font-medium">Amount</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 text-right font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {invoices.map((invoice) => (
              <InvoiceRow key={invoice.id} {...invoice} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 divide-y divide-border md:hidden">
        {invoices.map((invoice) => (
          <InvoiceMobileCard key={invoice.id} {...invoice} />
        ))}
      </div>

      <button
        type="button"
        className="mt-5 inline-flex cursor-pointer items-center gap-2 font-mono text-xs font-bold text-text-primary transition hover:text-brand"
      >
        View all invoices
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </section>
  );
}

function InvoiceRow({
  date,
  id,
  amount,
  status,
}: {
  date: string;
  id: string;
  amount: string;
  status: string;
}) {
  return (
    <tr className="group transition hover:bg-background-light">
      <td className="py-5 text-sm text-text-primary">{date}</td>
      <td className="py-5 font-mono text-sm text-text-secondary">{id}</td>
      <td className="py-5 text-sm font-medium text-text-primary">{amount}</td>
      <td className="py-5">
        <PaidBadge label={status} />
      </td>
      <td className="py-5 text-right">
        <button
          type="button"
          className="cursor-pointer rounded-lg p-2 text-text-tertiary opacity-0 transition hover:bg-background-light hover:text-text-primary group-hover:opacity-100"
          aria-label={`Download invoice ${id}`}
        >
          <Download className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function InvoiceMobileCard({
  date,
  id,
  amount,
  status,
}: {
  date: string;
  id: string;
  amount: string;
  status: string;
}) {
  return (
    <div className="space-y-3 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-text-primary">{date}</p>
          <p className="mt-1 font-mono text-sm text-text-secondary">{id}</p>
        </div>

        <PaidBadge label={status} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">{amount}</p>

        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-2 font-mono text-xs text-text-secondary transition hover:text-text-primary"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>
    </div>
  );
}

function BillingDetailsCard() {
  return (
    <section className="rounded-[1.35rem] border border-border bg-background-surface p-6 shadow-[0_12px_40px_rgba(21,30,48,0.06)] md:p-7">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-black tracking-[-0.04em] text-text-primary">
          Billing Details
        </h2>

        <button
          type="button"
          className="cursor-pointer rounded-lg p-2 text-text-primary transition hover:bg-background-light"
          aria-label="Edit billing details"
        >
          <Edit3 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 divide-y divide-border">
        <BillingDetail label="Business Name" value="Acme Corp Ltd." />
        <BillingDetail label="Billing Email" value="finance@acmecorp.com" />
        <BillingDetail label="Tax ID / VAT" value="GB123456789" mono />
      </div>
    </section>
  );
}

function BillingDetail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <p className="font-mono text-xs font-medium text-text-secondary">
        {label}
      </p>

      <p
        className={`mt-2 text-sm text-text-primary ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Entitlement({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-text-secondary">
      <CheckCircle2 className="h-4 w-4 text-text-primary" />
      {label}
    </div>
  );
}

function PaidBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background-light px-2.5 py-1 font-mono text-xs text-text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-text-primary" />
      {label}
    </span>
  );
}