"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AvailabilityCalendar from "@/components/calendar/AvailabilityCalendar";
import { fetchPropertyById, updatePropertyStatus } from "@/lib/api";
import {
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  type AgencyProperty,
  type PropertyStatus,
} from "@/types/agency";
import BookingForm from "@/components/property/BookingForm";
import { toPublicProperty } from "@/lib/mappers";
import AuthGateModal from "@/components/auth/AuthGateModal";
import { useAuth } from "@/components/auth/AuthProvider";

function typeLabel(value: string) {
  return PROPERTY_TYPES.find((t) => t.value === value)?.label || value;
}

function statusLabel(status: string) {
  return PROPERTY_STATUSES.find((s) => s.value === status)?.label || status;
}

function statusStyle(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "active":
      return "bg-emerald-50 text-emerald-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

type PropertyDetailViewProps = {
  id: string;
  fromAdmin?: boolean;
};

export default function PropertyDetailView({ id, fromAdmin = false }: PropertyDetailViewProps) {
  const [property, setProperty] = useState<AgencyProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetchPropertyById(id);
        if (!cancelled) {
          setProperty(res.data);
          setError(null);
          setImageIndex(0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Bien introuvable");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleStatus = async (status: PropertyStatus) => {
    if (!property) return;
    setBusy(true);
    setToast(null);
    try {
      const res = await updatePropertyStatus(property.id, status);
      setProperty(res.data);
      setToast(res.message || "Statut mis à jour");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Chargement de la fiche...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-[var(--navy)]">Bien introuvable</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{error || "Cette annonce n'existe pas."}</p>
        <Link
          href={fromAdmin ? "/admin" : "/"}
          className="mt-6 inline-flex rounded-lg bg-[var(--navy)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          {fromAdmin ? "Retour à la validation" : "Retour à l'accueil"}
        </Link>
      </div>
    );
  }

  const images = property.images?.length ? property.images : [property.img];
  const current = images[imageIndex] || property.img;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={fromAdmin ? "/admin" : "/"}
          className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] hover:text-[var(--navy)]"
        >
          {fromAdmin ? "← Retour à la validation" : "← Retour à l'accueil"}
        </Link>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyle(property.status)}`}
        >
          {statusLabel(property.status)}
        </span>
      </div>

      {toast && (
        <div className="rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-3 text-sm text-[var(--navy)]">
          {toast}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="relative aspect-[16/9] bg-[var(--surface)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current}
            alt={property.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80";
            }}
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg shadow"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg shadow"
              >
                ›
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageIndex(idx)}
                    className={`h-2 w-2 rounded-full ${idx === imageIndex ? "bg-white" : "bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-black/5 p-3 no-scrollbar">
            {images.map((src, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setImageIndex(idx)}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                  idx === imageIndex ? "border-[var(--gold)]" : "border-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-semibold text-[var(--navy)] sm:text-4xl">
                {property.name}
              </h1>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                {property.transaction}
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">{property.loc}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-[var(--surface)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Type</p>
              <p className="mt-1 text-sm font-semibold text-[var(--navy)]">{typeLabel(property.type)}</p>
            </div>
            <div className="rounded-xl bg-[var(--surface)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Chambres</p>
              <p className="mt-1 text-sm font-semibold text-[var(--navy)]">{property.bedrooms}</p>
            </div>
            <div className="rounded-xl bg-[var(--surface)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">SDB</p>
              <p className="mt-1 text-sm font-semibold text-[var(--navy)]">{property.bathrooms}</p>
            </div>
            <div className="rounded-xl bg-[var(--surface)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Surface</p>
              <p className="mt-1 text-sm font-semibold text-[var(--navy)]">
                {property.surface > 0 ? `${property.surface} m²` : "—"}
              </p>
            </div>
          </div>

          <section>
            <h2 className="font-display text-xl font-semibold text-[var(--navy)]">Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">
              {property.description || "Aucune description fournie."}
            </p>
          </section>

          {property.amenities?.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-[var(--navy)]">Équipements</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-black/5 bg-white px-3 py-1.5 text-xs font-medium text-[var(--navy)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-black/5 bg-white p-4 sm:p-5">
            <h2 className="font-display text-xl font-semibold text-[var(--navy)]">Disponibilités</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Les jours grisés ne sont pas disponibles. Sélectionnez l&apos;arrivée puis le départ
              avant de réserver.
            </p>
            <div className="mt-4">
              <AvailabilityCalendar
                unavailableDates={property.unavailableDates || []}
                selectable={!fromAdmin && property.status === "active"}
                checkIn={checkIn}
                checkOut={checkOut}
                onSelectRange={(start, end) => {
                  setCheckIn(start);
                  setCheckOut(end);
                }}
                monthsToShow={2}
              />
            </div>
          </section>

          <section className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold)]/20 text-lg font-bold text-[var(--gold-deep)]">
              {property.host?.charAt(0) || "?"}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--navy)]">{property.host}</p>
              <p className="text-xs text-[var(--muted)]">
                {property.agencyId?.startsWith("proprietaire") ? "Propriétaire" : "Agence"} ·{" "}
                {property.city}
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="sticky top-6 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-[var(--navy)]">
              {Number(property.price).toLocaleString("fr-DZ")}{" "}
              <span className="text-sm font-normal text-[var(--muted)]">DZD / {property.priceUnit}</span>
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">Capacité : {property.capacity} personne(s)</p>

            {fromAdmin && property.status === "pending" && (
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleStatus("active")}
                  className="rounded-lg bg-emerald-600 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Approuver → Accueil
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleStatus("rejected")}
                  className="rounded-lg border border-red-200 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Refuser
                </button>
              </div>
            )}

            {fromAdmin && property.status === "active" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => handleStatus("inactive")}
                className="mt-5 w-full rounded-lg border border-black/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--navy)] disabled:opacity-50"
              >
                Retirer de l&apos;accueil
              </button>
            )}

            {fromAdmin && property.status === "rejected" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => handleStatus("pending")}
                className="mt-5 w-full rounded-lg bg-[var(--navy)] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--gold)] disabled:opacity-50"
              >
                Remettre en attente
              </button>
            )}

            {!fromAdmin && property.status === "active" && (
              <>
                <div className="mt-4 rounded-lg border border-black/5 bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)]">
                  {checkIn && checkOut
                    ? `Sélection : ${checkIn} → ${checkOut}`
                    : "Choisissez vos dates sur le calendrier"}
                </div>
                <button
                  type="button"
                  disabled={!checkIn || !checkOut || authLoading}
                  onClick={() => {
                    if (!checkIn || !checkOut) return;
                    if (!user) {
                      setShowAuthGate(true);
                      return;
                    }
                    setShowBooking(true);
                  }}
                  className="mt-3 w-full rounded-lg bg-[var(--gold)] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--navy)] disabled:opacity-40"
                >
                  {checkIn && checkOut ? "Demander la réservation" : "Choisir des dates d'abord"}
                </button>
              </>
            )}

            {!fromAdmin && property.status !== "active" && (
              <p className="mt-5 rounded-xl bg-amber-50 px-3 py-3 text-xs text-amber-800">
                Cette annonce n&apos;est pas encore publiée sur l&apos;accueil.
              </p>
            )}
          </div>
        </aside>
      </div>

      {showAuthGate && <AuthGateModal onClose={() => setShowAuthGate(false)} />}

      {showBooking && (
        <BookingForm
          property={toPublicProperty(property)}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}
