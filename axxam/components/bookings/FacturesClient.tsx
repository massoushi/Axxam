"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchInvoiceByBooking, fetchMyInvoices } from "@/lib/api";
import type { Invoice } from "@/types/booking";
import InvoiceView from "@/components/bookings/InvoiceView";

export default function FacturesClient() {
  const params = useSearchParams();
  const bookingId = params.get("booking");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (bookingId) {
          const res = await fetchInvoiceByBooking(bookingId);
          if (!cancelled) setSelected(res.data);
        }
        const list = await fetchMyInvoices();
        if (!cancelled) {
          setInvoices(list.data);
          if (!bookingId && list.data[0]) setSelected(list.data[0]);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (loading) return <p className="text-sm text-[var(--muted)]">Chargement…</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
          Voyageur
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--navy)]">Mes factures</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-2">
          {invoices.length === 0 && (
            <p className="text-sm text-[var(--muted)]">
              Aucune facture plateforme. Le paiement se fait chez l&apos;agence / propriétaire.
            </p>
          )}
          {invoices.map((inv) => (
            <button
              key={inv.id}
              type="button"
              onClick={() => setSelected(inv)}
              className={`block w-full rounded-xl border px-3 py-3 text-left text-sm ${
                selected?.id === inv.id
                  ? "border-[var(--navy)] bg-[var(--navy)] text-white"
                  : "border-black/5 bg-white text-[var(--navy)]"
              }`}
            >
              <span className="font-semibold">{inv.number}</span>
              <span className="mt-1 block text-xs opacity-70">{inv.propertyName}</span>
            </button>
          ))}
        </aside>
        <div>{selected ? <InvoiceView invoice={selected} /> : null}</div>
      </div>
    </div>
  );
}
