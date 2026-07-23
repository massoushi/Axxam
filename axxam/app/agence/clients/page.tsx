"use client";

import { useEffect, useState } from "react";
import {
  createAgencyClient,
  deleteAgencyClient,
  fetchAgencyClients,
} from "@/lib/api";
import type { AgencyClient } from "@/types/agency-crm";

const empty = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
  cin: "",
  passport: "",
  profession: "",
  employer: "",
  notes: "",
};

export default function AgencyClientsPage() {
  const [items, setItems] = useState<AgencyClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchAgencyClients();
      setItems(res.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createAgencyClient(form);
      setForm(empty);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Création impossible");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--navy)]">Clients</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Fiches CRM de votre agence</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-2xl border border-[var(--sand)] bg-white p-4 shadow-[var(--shadow-soft)] sm:grid-cols-2 lg:grid-cols-3"
      >
        {(
          [
            ["firstName", "Prénom"],
            ["lastName", "Nom"],
            ["phone", "Téléphone"],
            ["email", "Email"],
            ["cin", "CIN"],
            ["passport", "Passeport"],
            ["profession", "Profession"],
            ["employer", "Employeur"],
            ["address", "Adresse"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-xs font-semibold text-[var(--navy)]">
            {label}
            <input
              className="axxam-input mt-1"
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              required={key === "firstName" || key === "lastName"}
            />
          </label>
        ))}
        <label className="block text-xs font-semibold text-[var(--navy)] sm:col-span-2">
          Notes
          <textarea
            className="axxam-input mt-1 min-h-[72px]"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </label>
        <div className="flex items-end">
          <button type="submit" disabled={busy} className="axxam-btn-primary w-full sm:w-auto">
            {busy ? "..." : "Ajouter le client"}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-[var(--sand)] bg-white shadow-[var(--shadow-soft)]">
        {loading ? (
          <p className="p-6 text-sm text-[var(--muted)]">Chargement...</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-[var(--muted)]">Aucun client pour le moment</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">CIN</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-[var(--sand)]/60">
                  <td className="px-4 py-3 font-semibold text-[var(--navy)]">
                    {c.firstName} {c.lastName}
                    {c.profession && (
                      <p className="text-xs font-normal text-[var(--muted)]">{c.profession}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    <p>{c.phone}</p>
                    <p className="text-xs">{c.email}</p>
                  </td>
                  <td className="px-4 py-3">{c.cin || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-xs font-semibold text-red-600"
                      onClick={async () => {
                        await deleteAgencyClient(c.id);
                        await load();
                      }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
