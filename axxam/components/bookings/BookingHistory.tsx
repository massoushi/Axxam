"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchHostBookings,
  fetchMyBookings,
  updateBookingStatus,
} from "@/lib/api";
import { formatDayFr } from "@/lib/dates";
import type { Booking, BookingStatus } from "@/types/booking";
import { BOOKING_STATUS_LABELS } from "@/types/booking";

function statusStyle(status: BookingStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "confirmed":
      return "bg-emerald-50 text-emerald-700";
    case "cancelled":
      return "bg-red-50 text-red-600";
    case "completed":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

type BookingHistoryProps = {
  mode: "client" | "host";
  title: string;
  subtitle: string;
};

export default function BookingHistory({ mode, title, subtitle }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = mode === "client" ? await fetchMyBookings() : await fetchHostBookings();
      setBookings(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [mode]);

  const setStatus = async (id: string, status: BookingStatus) => {
    setBusyId(id);
    try {
      const res = await updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...res.data } : b)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
          Historique
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--navy)]">{title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-black/5 bg-white p-1">
        {(
          [
            { id: "all", label: "Tous" },
            { id: "pending", label: "En attente" },
            { id: "confirmed", label: "Confirmées" },
            { id: "completed", label: "Terminées" },
            { id: "cancelled", label: "Annulées" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wider ${
              filter === tab.id
                ? "bg-[var(--navy)] text-[var(--gold)]"
                : "text-[var(--muted)] hover:bg-[var(--surface)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-[var(--muted)]">Chargement...</p>}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" onClick={load} className="ml-2 underline">
            Réessayer
          </button>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
          <p className="font-display text-2xl text-[var(--navy)]">Aucune réservation</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {mode === "client"
              ? "Vos séjours apparaîtront ici après une demande de réservation."
              : "Les demandes de location sur vos biens apparaîtront ici."}
          </p>
          {mode === "client" && (
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-[var(--gold)] px-5 py-2.5 text-xs font-bold uppercase text-[var(--navy)]"
            >
              Explorer les annonces
            </Link>
          )}
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((b) => (
          <article
            key={b.id}
            className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
          >
            <div className="flex flex-col sm:flex-row">
              <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.propertyImg || "/logo-axxam.png"}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-semibold text-[var(--navy)]">
                      {b.propertyName || "Bien"}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyle(b.status)}`}
                    >
                      {BOOKING_STATUS_LABELS[b.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{b.propertyLoc}</p>
                  <p className="mt-2 text-sm text-[var(--ink)]">
                    {formatDayFr(b.checkIn)} → {formatDayFr(b.checkOut)} · {b.nights} nuit(s) ·{" "}
                    {b.guests} voyageur(s)
                  </p>
                  {mode === "host" && (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Client : {b.clientName || `${b.guestFirstName} ${b.guestLastName}`} ·{" "}
                      {b.guestPhone} · {b.guestEmail}
                    </p>
                  )}
                  <p className="mt-2 text-sm font-semibold text-[var(--navy)]">
                    {(b.totalPrice + b.serviceFee).toLocaleString("fr-DZ")} DZD
                    <span className="ml-1 text-xs font-normal text-[var(--muted)]">
                      (dont {b.serviceFee.toLocaleString("fr-DZ")} DZD frais)
                    </span>
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">{b.id}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {mode === "host" && b.status === "pending" && (
                    <>
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => setStatus(b.id, "confirmed")}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold uppercase text-white disabled:opacity-50"
                      >
                        Confirmer
                      </button>
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => setStatus(b.id, "cancelled")}
                        className="rounded-lg border border-red-200 px-3 py-2 text-[11px] font-bold uppercase text-red-600 disabled:opacity-50"
                      >
                        Refuser
                      </button>
                    </>
                  )}
                  {mode === "host" && b.status === "confirmed" && (
                    <button
                      type="button"
                      disabled={busyId === b.id}
                      onClick={() => setStatus(b.id, "completed")}
                      className="rounded-lg bg-[var(--navy)] px-3 py-2 text-[11px] font-bold uppercase text-[var(--gold)] disabled:opacity-50"
                    >
                      Marquer terminé
                    </button>
                  )}
                  {mode === "client" && (b.status === "pending" || b.status === "confirmed") && (
                    <button
                      type="button"
                      disabled={busyId === b.id}
                      onClick={() => setStatus(b.id, "cancelled")}
                      className="rounded-lg border border-red-200 px-3 py-2 text-[11px] font-bold uppercase text-red-600 disabled:opacity-50"
                    >
                      Annuler
                    </button>
                  )}
                  <Link
                    href={`/annonces/${b.propertyId}`}
                    className="rounded-lg border border-black/10 px-3 py-2 text-[11px] font-bold uppercase text-[var(--muted)]"
                  >
                    Voir le bien
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
