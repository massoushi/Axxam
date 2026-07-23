"use client";

import { useEffect, useState } from "react";
import { fetchAdminCommissions, updateUserCommission } from "@/lib/api";
import type { AdminCommissionRow } from "@/types/admin";
import {
  AdminFilterBar,
  AdminPill,
  AdminTable,
  Badge,
  formatDz,
} from "@/components/admin/ui/AdminListUi";

export default function AdminCommissionsPanel() {
  const [rows, setRows] = useState<AdminCommissionRow[]>([]);
  const [role, setRole] = useState<"all" | "agency" | "owner">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminCommissions();
      setRows(res.data || []);
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

  const filtered = role === "all" ? rows : rows.filter((r) => r.role === role);
  const totalCom = filtered.reduce((s, r) => s + r.commissionsPaid, 0);

  const editRate = async (u: AdminCommissionRow) => {
    const raw = prompt(
      `Taux commission pour ${u.displayName} (ex: 0.05 = 5%)`,
      String(u.commissionRate ?? 0.05)
    );
    if (!raw) return;
    setBusyId(u.id);
    try {
      const res = await updateUserCommission(u.id, Number(raw));
      setRows((prev) =>
        prev.map((r) =>
          r.id === u.id ? { ...r, commissionRate: res.data.commissionRate } : r
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Comptes
          </p>
          <p className="mt-1 font-display text-xl font-semibold text-[var(--navy)]">
            {filtered.length}
          </p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Commissions encaissées
          </p>
          <p className="mt-1 font-display text-xl font-semibold text-[var(--navy)]">
            {formatDz(totalCom)}
          </p>
        </div>
      </div>

      <AdminFilterBar onRefresh={() => void load()}>
        <div className="flex flex-wrap gap-1">
          {(
            [
              { id: "all", label: "Tous" },
              { id: "agency", label: "Agences" },
              { id: "owner", label: "Propriétaires" },
            ] as const
          ).map((t) => (
            <AdminPill key={t.id} active={role === t.id} onClick={() => setRole(t.id)}>
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
          headers={["Compte", "Rôle", "Abo", "Taux", "Résa payées", "GMV", "Commissions", "Action"]}
          empty={filtered.length === 0}
        >
          {filtered.map((u) => (
            <tr key={u.id} className="border-b border-[var(--sand)]/50 last:border-0">
              <td className="px-3 py-3">
                <p className="font-medium text-[var(--navy)]">
                  {u.role === "agency" ? u.agencyName || u.displayName : u.displayName}
                </p>
                <p className="text-[11px] text-[var(--muted)]">{u.email}</p>
              </td>
              <td className="px-3 py-3">
                <Badge tone="info">{u.role}</Badge>
              </td>
              <td className="px-3 py-3">
                <Badge tone={u.subscriptionPlan === "pro" ? "good" : "neutral"}>
                  {u.subscriptionPlan === "pro" ? "Pro" : "Gratuit"}
                </Badge>
              </td>
              <td className="px-3 py-3 font-semibold">
                {((u.commissionRate ?? 0.05) * 100).toFixed(0)}%
              </td>
              <td className="px-3 py-3">{u.bookingsPaid}</td>
              <td className="px-3 py-3">{formatDz(u.gmv)}</td>
              <td className="px-3 py-3 font-semibold text-[var(--gold-deep)]">
                {formatDz(u.commissionsPaid)}
              </td>
              <td className="px-3 py-3">
                <button
                  type="button"
                  disabled={busyId === u.id}
                  onClick={() => void editRate(u)}
                  className="rounded-lg border border-black/10 px-2.5 py-1.5 text-[10px] font-bold uppercase disabled:opacity-50"
                >
                  Modifier
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
