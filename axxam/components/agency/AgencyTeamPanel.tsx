"use client";

import { useEffect, useState } from "react";
import {
  fetchAgencyMembers,
  inviteAgencyMember,
  updateAgencyMemberStatus,
} from "@/lib/api";
import type { AgencyMember } from "@/types/agency-team";

export default function AgencyTeamPanel() {
  const [members, setMembers] = useState<AgencyMember[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"employee" | "manager">("employee");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAgencyMembers();
      setMembers(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await inviteAgencyMember(email.trim(), role);
      setEmail("");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Invitation impossible");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
          Agence
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--navy)]">Équipe</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Ajoutez des employés déjà inscrits sur AXXAM (par email).
        </p>
      </div>

      <form
        onSubmit={invite}
        className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="text-[10px] font-semibold uppercase text-[var(--muted)]">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            placeholder="employe@exemple.dz"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase text-[var(--muted)]">Rôle</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "employee" | "manager")}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          >
            <option value="employee">Employé</option>
            <option value="manager">Manager</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[var(--navy)] px-4 py-2.5 text-xs font-bold uppercase text-[var(--gold)] disabled:opacity-50"
        >
          Ajouter
        </button>
      </form>

      {loading && <p className="text-sm text-[var(--muted)]">Chargement…</p>}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium text-[var(--navy)]">{m.displayName || m.email}</p>
              <p className="text-xs text-[var(--muted)]">
                {m.email} · {m.memberRole} · {m.status}
              </p>
            </div>
            <div className="flex gap-2">
              {m.status === "active" ? (
                <button
                  type="button"
                  onClick={() =>
                    updateAgencyMemberStatus(m.id, "suspended").then(load)
                  }
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-[10px] font-bold uppercase text-red-600"
                >
                  Suspendre
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => updateAgencyMemberStatus(m.id, "active").then(load)}
                  className="rounded-lg border border-emerald-200 px-3 py-1.5 text-[10px] font-bold uppercase text-emerald-700"
                >
                  Réactiver
                </button>
              )}
            </div>
          </div>
        ))}
        {!loading && members.length === 0 && (
          <p className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-12 text-center text-sm text-[var(--muted)]">
            Aucun membre pour l&apos;instant.
          </p>
        )}
      </div>
    </div>
  );
}
