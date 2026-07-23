"use client";

import { useEffect, useState } from "react";
import { fetchAdminActivity } from "@/lib/api";
import type { AdminActivityItem } from "@/types/admin";
import { formatDate } from "@/components/admin/ui/AdminListUi";

const DOT: Record<string, string> = {
  agency: "bg-sky-500",
  property: "bg-emerald-500",
  booking: "bg-violet-500",
  payment: "bg-[var(--gold)]",
  claim: "bg-red-500",
};

export default function AdminActivityPanel() {
  const [items, setItems] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminActivity();
      setItems(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-black/10 bg-white px-3 py-2 text-[11px] font-bold uppercase text-[var(--navy)]"
        >
          Actualiser
        </button>
      </div>

      {loading && <p className="text-sm text-[var(--muted)]">Chargement…</p>}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && items.length === 0 && (
        <p className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-10 text-center text-sm text-[var(--muted)]">
          Aucune activité récente
        </p>
      )}

      <ul className="space-y-2">
        {items.map((a, i) => (
          <li
            key={`${a.type}-${a.at}-${i}`}
            className="flex gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-sm"
          >
            <span
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${DOT[a.type] || "bg-slate-400"}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-[var(--navy)]">{a.title}</p>
                <p className="text-[11px] text-[var(--muted)]">{formatDate(a.at)}</p>
              </div>
              <p className="text-sm text-[var(--muted)]">{a.detail}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                {a.type}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
