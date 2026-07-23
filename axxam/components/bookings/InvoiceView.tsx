"use client";

import type { Invoice } from "@/types/booking";

export default function InvoiceView({ invoice }: { invoice: Invoice }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 print:border-0 print:shadow-none">
      <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--gold-deep)]">
            Facture AXXAM
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-[var(--navy)]">
            {invoice.number}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-[var(--navy)] px-3 py-2 text-[11px] font-bold uppercase text-[var(--gold)] print:hidden"
        >
          Imprimer
        </button>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Bien
          </dt>
          <dd className="mt-1 font-medium text-[var(--navy)]">{invoice.propertyName}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Voyageur
          </dt>
          <dd className="mt-1 text-[var(--ink)]">
            {invoice.guestName}
            <br />
            <span className="text-[var(--muted)]">{invoice.guestEmail}</span>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Séjour
          </dt>
          <dd className="mt-1 text-[var(--ink)]">
            {invoice.checkIn} → {invoice.checkOut} ({invoice.nights} nuit
            {invoice.nights > 1 ? "s" : ""})
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Date
          </dt>
          <dd className="mt-1 text-[var(--ink)]">
            {new Date(invoice.createdAt).toLocaleString("fr-DZ")}
          </dd>
        </div>
      </dl>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-[10px] uppercase tracking-wider text-[var(--muted)]">
            <th className="pb-2 font-semibold">Désignation</th>
            <th className="pb-2 text-right font-semibold">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-black/5">
            <td className="py-3">Hébergement</td>
            <td className="py-3 text-right">{invoice.subtotal.toLocaleString("fr-DZ")} DZD</td>
          </tr>
          <tr className="border-b border-black/5">
            <td className="py-3">Frais de service AXXAM</td>
            <td className="py-3 text-right">{invoice.serviceFee.toLocaleString("fr-DZ")} DZD</td>
          </tr>
          <tr>
            <td className="py-3 font-semibold text-[var(--navy)]">Total payé</td>
            <td className="py-3 text-right font-semibold text-[var(--navy)]">
              {invoice.total.toLocaleString("fr-DZ")} DZD
            </td>
          </tr>
        </tbody>
      </table>

      <p className="mt-6 text-xs text-[var(--muted)]">
        Paiement simulé — preuve de transaction AXXAM (MVP). Réf. réservation : {invoice.bookingId}
      </p>
    </div>
  );
}
