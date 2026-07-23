"use client";

import { useEffect, useState } from "react";
import { fetchAdminContracts } from "@/lib/api";
import type { AdminContract } from "@/types/admin";
import {
  AdminFilterBar,
  AdminPill,
  AdminTable,
  Badge,
  formatDate,
  formatDz,
} from "@/components/admin/ui/AdminListUi";

export default function AdminContractsPanel() {
  const [rows, setRows] = useState<AdminContract[]>([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (status !== "all") params.status = status;
      const res = await fetchAdminContracts(params);
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
  }, [status]);

  return (
    <div className="space-y-4">
      <AdminFilterBar onRefresh={() => void load()}>
        <div className="flex flex-wrap gap-1">
          {(["all", "draft", "pending_signature", "active", "ended", "cancelled"] as const).map(
            (s) => (
              <AdminPill key={s} active={status === s} onClick={() => setStatus(s)}>
                {s === "all" ? "Tous" : s.replace("_", " ")}
              </AdminPill>
            )
          )}
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
          headers={["Contrat", "Agence", "Client", "Bien", "Loyer", "Période", "Statut"]}
          empty={rows.length === 0}
        >
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-[var(--sand)]/50 last:border-0">
              <td className="px-3 py-3 font-medium text-[var(--navy)]">{c.title || c.id}</td>
              <td className="px-3 py-3">
                <p>{c.agencyName}</p>
                <p className="text-[11px] text-[var(--muted)]">{c.agencyEmail}</p>
              </td>
              <td className="px-3 py-3">{c.clientName || "—"}</td>
              <td className="px-3 py-3">{c.propertyName || "—"}</td>
              <td className="px-3 py-3 font-semibold">{formatDz(c.rent)}</td>
              <td className="px-3 py-3 text-[var(--muted)]">
                {formatDate(c.startDate)} → {formatDate(c.endDate)}
              </td>
              <td className="px-3 py-3">
                <Badge
                  tone={
                    c.status === "active"
                      ? "good"
                      : c.status === "pending_signature"
                        ? "warn"
                        : "neutral"
                  }
                >
                  {c.status}
                </Badge>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
