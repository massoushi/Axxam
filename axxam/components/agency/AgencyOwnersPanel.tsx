"use client";

import { useEffect, useState } from "react";
import { fetchLinkedOwners, linkOwner, unlinkOwner } from "@/lib/api";
import type { LinkedOwner } from "@/types/agency-team";

export default function AgencyOwnersPanel() {
  const [owners, setOwners] = useState<LinkedOwner[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLinkedOwners();
      setOwners(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await linkOwner(email.trim());
      setEmail("");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Impossible");
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
        <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--navy)]">
          Propriétaires liés
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Rattachez des comptes propriétaire (rôle owner) à votre agence.
        </p>
      </div>

      <form
        onSubmit={onLink}
        className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="text-[10px] font-semibold uppercase text-[var(--muted)]">
            Email propriétaire
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[var(--navy)] px-4 py-2.5 text-xs font-bold uppercase text-[var(--gold)]"
        >
          Rattacher
        </button>
      </form>

      {loading && <p className="text-sm text-[var(--muted)]">Chargement…</p>}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {owners.map((o) => (
          <div
            key={o.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium text-[var(--navy)]">{o.displayName || o.email}</p>
              <p className="text-xs text-[var(--muted)]">
                {o.email} · {o.phone || "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => unlinkOwner(o.id).then(load)}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-[10px] font-bold uppercase text-red-600"
            >
              Détacher
            </button>
          </div>
        ))}
        {!loading && owners.length === 0 && (
          <p className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-12 text-center text-sm text-[var(--muted)]">
            Aucun propriétaire rattaché.
          </p>
        )}
      </div>
    </div>
  );
}
