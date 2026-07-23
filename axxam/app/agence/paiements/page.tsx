"use client";

import { useEffect, useState } from "react";
import { fetchAgencyPayments, recordAgencyPayment } from "@/lib/api";
import type { AgencyPayment } from "@/types/agency-crm";

const statusColor: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  partial: "bg-orange-50 text-orange-700 border-orange-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function AgencyPaymentsPage() {
  const [items, setItems] = useState<AgencyPayment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState("cash");

  const load = async () => {
    try {
      const res = await fetchAgencyPayments();
      setItems(res.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const months = items.reduce<Record<string, AgencyPayment[]>>((acc, p) => {
    const key = p.dueDate ? p.dueDate.slice(0, 7) : "sans-date";
    (acc[key] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--navy)]">Paiements</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Échéancier coloré · espèces, CCP, virement</p>
        </div>
        <label className="text-xs font-semibold text-[var(--navy)]">
          Méthode d&apos;encaissement
          <select className="axxam-input mt-1" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="cash">Espèces</option>
            <option value="ccp">CCP</option>
            <option value="transfer">Virement</option>
            <option value="card">Carte</option>
            <option value="online">En ligne</option>
          </select>
        </label>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-6">
        {Object.keys(months).length === 0 && (
          <p className="rounded-2xl border border-dashed border-[var(--sand)] bg-white p-10 text-center text-sm text-[var(--muted)]">
            Aucune échéance — créez un contrat avec loyer pour générer l&apos;échéancier.
          </p>
        )}
        {Object.entries(months).map(([month, list]) => (
          <section key={month}>
            <h2 className="mb-3 font-display text-xl font-semibold capitalize text-[var(--navy)]">
              {month === "sans-date"
                ? "Sans date"
                : new Date(month + "-01").toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => (
                <article
                  key={p.id}
                  className={`rounded-2xl border bg-white p-4 shadow-[var(--shadow-soft)] ${statusColor[p.status] || ""}`}
                >
                  <div className="flex justify-between gap-2">
                    <p className="font-semibold text-[var(--navy)]">{p.clientName || "Client"}</p>
                    <span className="text-[10px] font-bold uppercase">{p.status}</span>
                  </div>
                  <p className="mt-1 text-sm">{p.label}</p>
                  <p className="mt-2 text-lg font-bold">
                    {p.amountPaid.toLocaleString("fr-DZ")} / {p.amount.toLocaleString("fr-DZ")} DA
                  </p>
                  <p className="text-xs opacity-70">Échéance : {p.dueDate || "—"}</p>
                  {p.status !== "paid" && p.status !== "cancelled" && (
                    <button
                      type="button"
                      className="mt-3 rounded-full bg-[var(--navy)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white"
                      onClick={async () => {
                        await recordAgencyPayment(p.id, {
                          amountPaid: p.amount,
                          method,
                        });
                        await load();
                      }}
                    >
                      Encaisser · reçu
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
