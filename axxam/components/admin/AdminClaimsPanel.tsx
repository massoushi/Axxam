"use client";

import { useEffect, useState } from "react";
import {
  createAdminClaim,
  fetchAdminClaims,
  updateAdminClaim,
} from "@/lib/api";
import type { AdminClaim } from "@/types/admin";
import {
  AdminFilterBar,
  AdminPill,
  AdminTable,
  Badge,
  formatDate,
} from "@/components/admin/ui/AdminListUi";

const STATUSES = ["pending", "in_progress", "resolved", "closed"] as const;

export default function AdminClaimsPanel() {
  const [rows, setRows] = useState<AdminClaim[]>([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (status !== "all") params.status = status;
      const res = await fetchAdminClaims(params);
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

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setBusy(true);
    try {
      await createAdminClaim({ subject: subject.trim(), body: body.trim() });
      setSubject("");
      setBody("");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const setClaimStatus = async (id: string, next: string) => {
    try {
      const res = await updateAdminClaim(id, { status: next });
      setRows((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={create}
        className="space-y-3 rounded-2xl border border-black/5 bg-white p-4"
      >
        <h3 className="font-display text-lg font-semibold text-[var(--navy)]">
          Nouvelle réclamation
        </h3>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Sujet"
          required
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Description"
          rows={2}
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[var(--navy)] px-4 py-2 text-xs font-bold uppercase text-[var(--gold)] disabled:opacity-50"
        >
          Enregistrer
        </button>
      </form>

      <AdminFilterBar onRefresh={() => void load()}>
        <div className="flex flex-wrap gap-1">
          <AdminPill active={status === "all"} onClick={() => setStatus("all")}>
            Toutes
          </AdminPill>
          {STATUSES.map((s) => (
            <AdminPill key={s} active={status === s} onClick={() => setStatus(s)}>
              {s.replace("_", " ")}
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
          headers={["Sujet", "Auteur", "Date", "Statut", "Actions"]}
          empty={rows.length === 0}
        >
          {rows.map((c) => (
            <tr key={c.id} className="border-b border-[var(--sand)]/50 last:border-0">
              <td className="px-3 py-3">
                <p className="font-medium text-[var(--navy)]">{c.subject}</p>
                {c.body && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-[var(--muted)]">{c.body}</p>
                )}
              </td>
              <td className="px-3 py-3">
                <p>{c.authorName}</p>
                <p className="text-[11px] text-[var(--muted)]">
                  {c.authorEmail} · {c.authorRole}
                </p>
              </td>
              <td className="px-3 py-3 text-[var(--muted)]">{formatDate(c.createdAt)}</td>
              <td className="px-3 py-3">
                <Badge
                  tone={
                    c.status === "resolved"
                      ? "good"
                      : c.status === "pending"
                        ? "warn"
                        : c.status === "closed"
                          ? "neutral"
                          : "info"
                  }
                >
                  {c.status.replace("_", " ")}
                </Badge>
              </td>
              <td className="px-3 py-3">
                <select
                  value={c.status}
                  onChange={(e) => void setClaimStatus(c.id, e.target.value)}
                  className="rounded-lg border border-black/10 px-2 py-1.5 text-xs"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
