"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchRevenue } from "@/lib/api";
import type { Booking } from "@/types/booking";
import { formatDayFr } from "@/lib/dates";

export default function RevenuePanel({ title = "Revenus" }: { title?: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gross, setGross] = useState(0);
  const [fees, setFees] = useState(0);
  const [net, setNet] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchRevenue();
        if (cancelled) return;
        setGross(res.data.gross);
        setFees(res.data.platformFees);
        setNet(res.data.net);
        setPaidCount(res.data.paidCount);
        setBookings(res.data.bookings);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-sm text-[var(--muted)]">Chargement des revenus…</p>;
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
          Finances
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--navy)]">{title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Paiements reçus (simulation) et commissions plateforme.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Brut hébergement
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-[var(--navy)]">
            {gross.toLocaleString("fr-DZ")} DZD
          </p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Commission AXXAM
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-amber-700">
            {fees.toLocaleString("fr-DZ")} DZD
          </p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Net hôte · {paidCount} paiement(s)
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-emerald-700">
            {net.toLocaleString("fr-DZ")} DZD
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {bookings.length === 0 && (
          <p className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-12 text-center text-sm text-[var(--muted)]">
            Aucun paiement reçu pour le moment.
          </p>
        )}
        {bookings.map((b) => (
          <article
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium text-[var(--navy)]">{b.propertyName}</p>
              <p className="text-xs text-[var(--muted)]">
                {formatDayFr(b.checkIn)} → {formatDayFr(b.checkOut)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-emerald-700">
                {b.totalPrice.toLocaleString("fr-DZ")} DZD
              </p>
              <Link
                href={`/compte/factures?booking=${b.id}`}
                className="text-[10px] font-bold uppercase text-[var(--muted)] hover:text-[var(--navy)]"
              >
                Facture
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
