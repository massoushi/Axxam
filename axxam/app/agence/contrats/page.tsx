"use client";

import { useEffect, useState } from "react";
import {
  createAgencyContract,
  fetchAgencyClients,
  fetchAgencyContracts,
  fetchAgencyProperties,
  signAgencyContract,
  updateAgencyContract,
} from "@/lib/api";
import type { AgencyClient, AgencyContract } from "@/types/agency-crm";
import type { AgencyProperty } from "@/types/agency";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AgencyContractsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<AgencyContract[]>([]);
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [properties, setProperties] = useState<AgencyProperty[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "Contrat de location",
    clientId: "",
    propertyId: "",
    startDate: "",
    endDate: "",
    durationMonths: 12,
    rent: 0,
    deposit: 0,
    commissionPct: 5,
    conditions: "",
  });

  const load = async () => {
    if (!user) return;
    try {
      const [c, cl, props] = await Promise.all([
        fetchAgencyContracts(),
        fetchAgencyClients(),
        fetchAgencyProperties(user.id),
      ]);
      setItems(c.data);
      setClients(cl.data);
      setProperties(props.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  useEffect(() => {
    void load();
  }, [user]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAgencyContract({
        ...form,
        clientId: form.clientId || null,
        propertyId: form.propertyId || null,
        rent: Number(form.rent),
        deposit: Number(form.deposit),
        commissionPct: Number(form.commissionPct),
        durationMonths: Number(form.durationMonths),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Création impossible");
    }
  };

  const statusStyle = (s: string) => {
    if (s === "active") return "bg-emerald-50 text-emerald-700";
    if (s === "pending_signature") return "bg-amber-50 text-amber-700";
    if (s === "expired") return "bg-red-50 text-red-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--navy)]">Contrats</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Génération auto, signatures et échéancier de loyers
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-2xl border border-[var(--sand)] bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-2 lg:grid-cols-3"
      >
        <label className="text-xs font-semibold text-[var(--navy)]">
          Titre
          <input
            className="axxam-input mt-1"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </label>
        <label className="text-xs font-semibold text-[var(--navy)]">
          Client
          <select
            className="axxam-input mt-1"
            value={form.clientId}
            onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
          >
            <option value="">—</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-[var(--navy)]">
          Bien
          <select
            className="axxam-input mt-1"
            value={form.propertyId}
            onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))}
          >
            <option value="">—</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-[var(--navy)]">
          Début
          <input
            type="date"
            className="axxam-input mt-1"
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            required
          />
        </label>
        <label className="text-xs font-semibold text-[var(--navy)]">
          Fin
          <input
            type="date"
            className="axxam-input mt-1"
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
          />
        </label>
        <label className="text-xs font-semibold text-[var(--navy)]">
          Durée (mois)
          <input
            type="number"
            className="axxam-input mt-1"
            value={form.durationMonths}
            onChange={(e) => setForm((f) => ({ ...f, durationMonths: Number(e.target.value) }))}
          />
        </label>
        <label className="text-xs font-semibold text-[var(--navy)]">
          Loyer (DA)
          <input
            type="number"
            className="axxam-input mt-1"
            value={form.rent}
            onChange={(e) => setForm((f) => ({ ...f, rent: Number(e.target.value) }))}
          />
        </label>
        <label className="text-xs font-semibold text-[var(--navy)]">
          Caution
          <input
            type="number"
            className="axxam-input mt-1"
            value={form.deposit}
            onChange={(e) => setForm((f) => ({ ...f, deposit: Number(e.target.value) }))}
          />
        </label>
        <label className="text-xs font-semibold text-[var(--navy)]">
          Commission %
          <input
            type="number"
            className="axxam-input mt-1"
            value={form.commissionPct}
            onChange={(e) => setForm((f) => ({ ...f, commissionPct: Number(e.target.value) }))}
          />
        </label>
        <div className="sm:col-span-2 lg:col-span-3">
          <button type="submit" className="axxam-btn-primary">
            Créer le contrat (+ échéancier)
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {items.map((c) => (
          <article
            key={c.id}
            className="rounded-2xl border border-[var(--sand)] bg-white p-4 shadow-[var(--shadow-soft)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[var(--navy)]">{c.title}</h3>
                <p className="text-sm text-[var(--muted)]">
                  {c.clientName || "Client"} · {c.propertyName || "Bien"}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {c.startDate} → {c.endDate || "—"} · {c.rent.toLocaleString("fr-DZ")} DA/mois
                </p>
                {c.qrToken && (
                  <p className="mt-1 text-[10px] text-[var(--muted)]">QR: {c.qrToken.slice(0, 12)}…</p>
                )}
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyle(c.status)}`}>
                {c.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["client", "owner", "agency"] as const).map((party) => (
                <button
                  key={party}
                  type="button"
                  className="rounded-full border border-[var(--navy)]/10 px-3 py-1.5 text-[11px] font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
                  onClick={async () => {
                    await signAgencyContract(c.id, party, `sig-${party}`);
                    await load();
                  }}
                >
                  Signer ({party})
                </button>
              ))}
              <button
                type="button"
                className="rounded-full bg-[var(--navy)] px-3 py-1.5 text-[11px] font-semibold text-[var(--sand)]"
                onClick={async () => {
                  await updateAgencyContract(c.id, { status: "active" });
                  await load();
                }}
              >
                Activer
              </button>
              <button
                type="button"
                className="rounded-full border border-[var(--navy)]/10 px-3 py-1.5 text-[11px] font-semibold"
                onClick={() => window.print()}
              >
                PDF / Imprimer
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
