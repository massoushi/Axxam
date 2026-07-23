"use client";

import Link from "next/link";

export function StatCard({
  label,
  value,
  hint,
  hintTone = "good",
}: {
  label: string;
  value: string;
  hint?: string;
  hintTone?: "good" | "bad" | "neutral";
}) {
  const tone =
    hintTone === "good"
      ? "text-emerald-700 bg-emerald-50"
      : hintTone === "bad"
        ? "text-red-700 bg-red-50"
        : "text-[var(--muted)] bg-[var(--sand-soft)]";
  return (
    <div className="rounded-2xl border border-[var(--sand)]/80 bg-white p-4 shadow-[var(--shadow-soft)]">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-[var(--navy)]">{value}</p>
      {hint && (
        <p className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function Panel({
  title,
  href,
  children,
  className = "",
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[var(--sand)]/80 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-[var(--navy)]">{title}</h2>
        {href && (
          <Link href={href} className="text-xs font-semibold text-[var(--gold-deep)] hover:underline">
            Voir tout
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const map: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    partial: "bg-orange-50 text-orange-700 border-orange-200",
    overdue: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-slate-100 text-slate-500 border-slate-200",
    available: "bg-emerald-50 text-emerald-700 border-emerald-200",
    occupied: "bg-sky-50 text-sky-700 border-sky-200",
    maintenance: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}
    >
      {label || status}
    </span>
  );
}
