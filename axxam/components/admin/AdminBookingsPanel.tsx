"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAdminBookings } from "@/lib/api";
import type { AdminBooking } from "@/types/admin";
import {
  AdminFilterBar,
  AdminPill,
  AdminTable,
  Badge,
  formatDate,
  formatDz,
} from "@/components/admin/ui/AdminListUi";

const STATUS_TONE: Record<string, "good" | "warn" | "bad" | "neutral" | "info"> = {
  pending: "warn",
  confirmed: "good",
  cancelled: "bad",
  completed: "info",
};

export default function AdminBookingsPanel() {
  const [rows, setRows] = useState<AdminBooking[]>([]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (status !== "all") params.status = status;
      if (q.trim()) params.q = q.trim();
      const res = await fetchAdminBookings(params);
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

  const pending = useMemo(() => rows.filter((r) => r.status === "pending").length, [rows]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Affichées" value={rows.length} />
        <Stat label="Demandes en attente" value={pending} />
        <Stat
          label="Volume"
          value={formatDz(rows.reduce((s, r) => s + r.totalPrice, 0))}
        />
      </div>

      <AdminFilterBar
        search={q}
        onSearch={setQ}
        placeholder="Bien, client, agence…"
        onRefresh={() => void load()}
      >
        <div className="flex flex-wrap gap-1">
          {(["all", "pending", "confirmed", "cancelled", "completed"] as const).map((s) => (
            <AdminPill key={s} active={status === s} onClick={() => setStatus(s)}>
              {s === "all" ? "Toutes" : s}
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
          headers={["Bien", "Client", "Hôte", "Dates", "Montant", "Paiement", "Statut"]}
          empty={rows.length === 0}
        >
          {rows.map((b) => (
            <tr key={b.id} className="border-b border-[var(--sand)]/50 last:border-0">
              <td className="px-3 py-3">
                <p className="font-medium text-[var(--navy)]">{b.propertyName}</p>
                <p className="text-[11px] text-[var(--muted)]">{b.propertyCity}</p>
              </td>
              <td className="px-3 py-3">
                <p>{b.client.displayName || `${b.guest.firstName} ${b.guest.lastName}`}</p>
                <p className="text-[11px] text-[var(--muted)]">{b.guest.email || b.client.email}</p>
              </td>
              <td className="px-3 py-3">
                <p>{b.host.displayName}</p>
                <p className="text-[11px] text-[var(--muted)]">{b.host.role}</p>
              </td>
              <td className="px-3 py-3 text-[var(--muted)]">
                {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                <br />
                <span className="text-[11px]">{b.guests} pers. · {b.nights} nuits</span>
              </td>
              <td className="px-3 py-3 font-semibold">{formatDz(b.totalPrice)}</td>
              <td className="px-3 py-3">
                <Badge tone={b.paymentStatus === "paid" ? "good" : "warn"}>
                  {b.paymentStatus === "paid" ? "Payé" : "Non payé"}
                </Badge>
              </td>
              <td className="px-3 py-3">
                <Badge tone={STATUS_TONE[b.status] || "neutral"}>{b.status}</Badge>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-[var(--navy)]">{value}</p>
    </div>
  );
}
