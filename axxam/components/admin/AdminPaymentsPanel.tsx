"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAdminPayments } from "@/lib/api";
import type { AdminPaymentItem } from "@/types/admin";
import {
  AdminFilterBar,
  AdminPill,
  AdminTable,
  Badge,
  formatDate,
  formatDz,
} from "@/components/admin/ui/AdminListUi";

export default function AdminPaymentsPanel() {
  const [rows, setRows] = useState<AdminPaymentItem[]>([]);
  const [summary, setSummary] = useState<{
    bookingPaidTotal?: number;
    bookingFeesTotal?: number;
    agencyCollected?: number;
  } | null>(null);
  const [type, setType] = useState<"all" | "booking" | "agency">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminPayments();
      setRows(res.data || []);
      setSummary((res.summary as typeof summary) || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () => (type === "all" ? rows : rows.filter((r) => r.type === type)),
    [rows, type]
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Paiements plateforme" value={formatDz(summary?.bookingPaidTotal || 0)} />
        <Stat label="Frais / commissions" value={formatDz(summary?.bookingFeesTotal || 0)} />
        <Stat label="Encaissements agences" value={formatDz(summary?.agencyCollected || 0)} />
      </div>

      <AdminFilterBar onRefresh={() => void load()}>
        <div className="flex flex-wrap gap-1">
          {(
            [
              { id: "all", label: "Tous" },
              { id: "booking", label: "Plateforme" },
              { id: "agency", label: "CRM agences" },
            ] as const
          ).map((t) => (
            <AdminPill key={t.id} active={type === t.id} onClick={() => setType(t.id)}>
              {t.label}
            </AdminPill>
          ))}
        </div>
      </AdminFilterBar>

      {loading && <p className="text-sm text-[var(--muted)]">Chargement…</p>}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && (
        <AdminTable
          headers={["Type", "Libellé", "Partie", "Contrepartie", "Montant", "Méthode", "Date", "Statut"]}
          empty={filtered.length === 0}
        >
          {filtered.map((p) => (
            <tr key={`${p.type}-${p.id}`} className="border-b border-[var(--sand)]/50 last:border-0">
              <td className="px-3 py-3">
                <Badge tone={p.type === "booking" ? "info" : "neutral"}>
                  {p.type === "booking" ? "Résa" : "Agence"}
                </Badge>
              </td>
              <td className="px-3 py-3 font-medium text-[var(--navy)]">{p.label}</td>
              <td className="px-3 py-3">{p.partyName || "—"}</td>
              <td className="px-3 py-3">{p.counterparty || "—"}</td>
              <td className="px-3 py-3 font-semibold">{formatDz(p.amount)}</td>
              <td className="px-3 py-3 text-[var(--muted)]">{p.method}</td>
              <td className="px-3 py-3 text-[var(--muted)]">{formatDate(p.at)}</td>
              <td className="px-3 py-3">
                <Badge
                  tone={
                    p.status === "paid" ? "good" : p.status === "pending" ? "warn" : "neutral"
                  }
                >
                  {p.status}
                </Badge>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-[var(--navy)]">{value}</p>
    </div>
  );
}
