"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  fetchPendingProperties,
  fetchProperties,
  updatePropertyStatus,
} from "@/lib/api";
import type { AgencyProperty } from "@/types/agency";
import { PROPERTY_TYPES } from "@/types/agency";

function typeLabel(value: string) {
  return PROPERTY_TYPES.find((t) => t.value === value)?.label || value;
}

function publisherLabel(property: AgencyProperty) {
  if (property.agencyId?.startsWith("proprietaire")) return "Propriétaire";
  return "Agence";
}

export default function AdminModerationDashboard() {
  const [tab, setTab] = useState<"pending" | "active" | "rejected">("pending");
  const [properties, setProperties] = useState<AgencyProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res =
          tab === "pending"
            ? await fetchPendingProperties()
            : await fetchProperties({ status: tab });
        if (!cancelled) {
          setProperties(res.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Chargement impossible");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tab]);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res =
        tab === "pending"
          ? await fetchPendingProperties()
          : await fetchProperties({ status: tab });
      setProperties(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible");
    } finally {
      setLoading(false);
    }
  };
  const pendingHint = useMemo(() => {
    if (tab !== "pending") return null;
    return `${properties.length} annonce(s) en attente de validation`;
  }, [tab, properties.length]);

  const handleStatus = async (
    id: string,
    status: "active" | "rejected" | "pending" | "inactive"
  ) => {
    setBusyId(id);
    setToast(null);
    try {
      const res = await updatePropertyStatus(id, status);
      setToast(res.message || "Statut mis à jour");
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
            Modération
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--navy)]">
            Validation des annonces
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            Les biens publiés par une agence ou un propriétaire arrivent ici. Une fois approuvés,
            ils apparaissent sur la page d&apos;accueil pour les visiteurs.
          </p>
          {pendingHint && <p className="mt-2 text-sm font-semibold text-amber-700">{pendingHint}</p>}
        </div>
        <Link
          href="/"
          className="inline-flex rounded-lg border border-black/10 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)]"
        >
          Voir l&apos;accueil
        </Link>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-black/5 bg-white p-1 no-scrollbar">
        {(
          [
            { id: "pending", label: "À valider" },
            { id: "active", label: "Publiés" },
            { id: "rejected", label: "Refusés" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`shrink-0 rounded-lg px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              tab === item.id
                ? "bg-[var(--navy)] text-[var(--gold)]"
                : "text-[var(--muted)] hover:bg-[var(--surface)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {toast && (
        <div className="rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-3 text-sm text-[var(--navy)]">
          {toast}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" onClick={reload} className="ml-2 font-semibold underline">
            Réessayer
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Chargement...</p>
      ) : properties.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
          <p className="font-display text-2xl text-[var(--navy)]">Aucune annonce ici</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {tab === "pending"
              ? "Dès qu'une agence ou un propriétaire publie un bien, il apparaîtra ici pour validation."
              : "Passez à un autre onglet pour voir d'autres annonces."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <article
              key={property.id}
              className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative h-48 w-full shrink-0 md:h-auto md:w-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={property.img} alt={property.name} className="h-full w-full object-cover" />
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-2xl font-semibold text-[var(--navy)]">
                        {property.name}
                      </h2>
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        {property.transaction}
                      </span>
                      <span className="rounded-full bg-[var(--navy)]/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--navy)]">
                        {publisherLabel(property)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">{property.loc}</p>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--ink)] line-clamp-3">
                      {property.description || "Sans description"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                        {typeLabel(property.type)}
                      </span>
                      <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                        {property.bedrooms} ch.
                      </span>
                      {property.surface > 0 && (
                        <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                          {property.surface} m²
                        </span>
                      )}
                      <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                        {Number(property.price).toLocaleString("fr-DZ")} DZD/{property.priceUnit}
                      </span>
                      <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                        {property.host}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tab === "pending" && (
                      <>
                        <button
                          type="button"
                          disabled={busyId === property.id}
                          onClick={() => handleStatus(property.id, "active")}
                          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Approuver → Accueil
                        </button>
                        <button
                          type="button"
                          disabled={busyId === property.id}
                          onClick={() => handleStatus(property.id, "rejected")}
                          className="rounded-lg border border-red-200 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          Refuser
                        </button>
                      </>
                    )}
                    {tab === "active" && (
                      <button
                        type="button"
                        disabled={busyId === property.id}
                        onClick={() => handleStatus(property.id, "inactive")}
                        className="rounded-lg border border-black/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)]"
                      >
                        Retirer de l&apos;accueil
                      </button>
                    )}
                    {tab === "rejected" && (
                      <button
                        type="button"
                        disabled={busyId === property.id}
                        onClick={() => handleStatus(property.id, "pending")}
                        className="rounded-lg bg-[var(--navy)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--gold)]"
                      >
                        Remettre en attente
                      </button>
                    )}
                    <Link
                      href={`/annonces/${property.id}?from=admin`}
                      className="rounded-lg border border-black/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--muted)]"
                    >
                      Détail
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
