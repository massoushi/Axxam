"use client";

import { useEffect, useState } from "react";
import { fetchUsers, updateUserStatus } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

export default function AdminAgenciesPanel() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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
    load();
  }, []);

  const setStatus = async (id: string, status: "active" | "suspended" | "pending") => {
    setBusyId(id);
    try {
      const res = await updateUserStatus(id, status);
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mt-10 space-y-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
          Comptes
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--navy)]">
          Agences inscrites
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Validez les agences avant qu&apos;elles puissent publier des biens.
        </p>
      </div>

      {loading && <p className="text-sm text-[var(--muted)]">Chargement...</p>}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && users.length === 0 && (
        <p className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-8 text-center text-sm text-[var(--muted)]">
          Aucune agence inscrite pour le moment.
        </p>
      )}

      <div className="space-y-3">
        {users.map((u) => (
          <article
            key={u.id}
            className="flex flex-col gap-3 rounded-xl border border-black/5 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-[var(--navy)]">{u.agencyName || u.displayName}</p>
              <p className="text-xs text-[var(--muted)]">
                {u.managerName} · {u.email} · {u.phone} · {u.wilaya}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                {u.status}
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
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
