"use client";

export function formatDz(n: number) {
  return `${Math.round(n).toLocaleString("fr-DZ")} DA`;
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AdminFilterBar({
  children,
  search,
  onSearch,
  placeholder = "Rechercher…",
  onRefresh,
}: {
  children?: React.ReactNode;
  search?: string;
  onSearch?: (v: string) => void;
  placeholder?: string;
  onRefresh?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}
      {onSearch && (
        <input
          value={search || ""}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="min-w-[180px] flex-1 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)] sm:max-w-xs"
        />
      )}
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]"
        >
          Actualiser
        </button>
      )}
    </div>
  );
}

export function AdminPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${
        active
          ? "bg-[var(--navy)] text-[var(--gold)]"
          : "border border-black/10 text-[var(--muted)] hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

export function AdminTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: React.ReactNode;
  empty?: boolean;
}) {
  if (empty) {
    return (
      <p className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-10 text-center text-sm text-[var(--muted)]">
        Aucun élément
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--sand)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
            {headers.map((h) => (
              <th key={h} className="px-3 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "good" | "warn" | "bad" | "neutral" | "info";
  children: React.ReactNode;
}) {
  const map = {
    good: "bg-emerald-50 text-emerald-700",
    warn: "bg-amber-50 text-amber-700",
    bad: "bg-red-50 text-red-600",
    info: "bg-sky-50 text-sky-700",
    neutral: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[tone]}`}
    >
      {children}
    </span>
  );
}
