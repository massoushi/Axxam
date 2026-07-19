"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchUsers, updateUserStatus } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

type AdminAgenciesPanelProps = {
  onChanged?: () => void;
};

function statusStyle(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700";
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "suspended":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "active":
      return "Active";
    case "pending":
      return "En attente";
    case "suspended":
      return "Suspendue";
    default:
      return status;
  }
}

export default function AdminAgenciesPanel({ onChanged }: AdminAgenciesPanelProps) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "suspended">("all");
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUsers({ role: "agency" });
      setUsers(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    let list = [...users];
    if (filter !== "all") list = list.filter((u) => u.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          (u.agencyName || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.wilaya || "").toLowerCase().includes(q) ||
          (u.managerName || "").toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => {
      const rank = (s: string) => (s === "pending" ? 0 : s === "active" ? 1 : 2);
      return rank(a.status) - rank(b.status);
    });
  }, [users, filter, query]);

  const setStatus = async (id: string, status: "active" | "suspended" | "pending") => {
    setBusyId(id);
    try {
      const res = await updateUserStatus(id, status);
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
      onChanged?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
            Comptes
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--navy)]">
            Agences inscrites
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Activez une agence avant qu&apos;elle puisse publier des biens.
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une agence…"
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--gold)] sm:max-w-xs"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-black/5 bg-white p-1 no-scrollbar">
        {(
          [
            { id: "all", label: "Toutes" },
            { id: "pending", label: "En attente" },
            { id: "active", label: "Actives" },
            { id: "suspended", label: "Suspendues" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`shrink-0 rounded-lg px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              filter === item.id
                ? "bg-[var(--navy)] text-[var(--gold)]"
                : "text-[var(--muted)] hover:bg-[var(--surface)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-[var(--muted)]">Chargement...</p>}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" onClick={load} className="ml-2 underline">
            Réessayer
          </button>
        </p>
      )}

      {!loading && filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-8 text-center text-sm text-[var(--muted)]">
          Aucune agence dans ce filtre.
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((u) => (
          <article
            key={u.id}
            className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-[var(--navy)]">{u.agencyName || u.displayName}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyle(u.status)}`}
                >
                  {statusLabel(u.status)}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {u.managerName} · {u.email} · {u.phone}
              </p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                {u.wilaya}
                {u.address ? ` · ${u.address}` : ""}
                {u.rcNumber ? ` · RC ${u.rcNumber}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {u.status !== "active" && (
                <button
                  type="button"
                  disabled={busyId === u.id}
                  onClick={() => setStatus(u.id, "active")}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold uppercase text-white disabled:opacity-50"
                >
                  Activer
                </button>
              )}
              {u.status === "active" && (
                <button
                  type="button"
                  disabled={busyId === u.id}
                  onClick={() => setStatus(u.id, "suspended")}
                  className="rounded-lg border border-red-200 px-3 py-2 text-[11px] font-bold uppercase text-red-600 disabled:opacity-50"
                >
                  Suspendre
                </button>
              )}
              {u.status === "suspended" && (
                <button
                  type="button"
                  disabled={busyId === u.id}
                  onClick={() => setStatus(u.id, "pending")}
                  className="rounded-lg border border-black/10 px-3 py-2 text-[11px] font-bold uppercase text-[var(--navy)] disabled:opacity-50"
                >
                  Remettre en attente
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
