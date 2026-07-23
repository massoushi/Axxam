"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  fetchPendingProperties,
  fetchProperties,
  updatePropertyStatus,
} from "@/lib/api";
import type { AgencyProperty } from "@/types/agency";
import { propertyTypeLabel } from "@/types/agency";

type ModTab = "pending" | "active" | "rejected";

function publisherLabel(property: AgencyProperty) {
  if (property.agencyId?.startsWith("proprietaire")) return "Propriétaire";
  return "Agence";
}

function priceLabel(property: AgencyProperty) {
  const n = Number(property.price).toLocaleString("fr-DZ");
  if (property.transaction === "vente" || property.priceUnit === "total") return `${n} DZD`;
  return `${n} DZD / ${property.priceUnit}`;
}

export default function AdminPropertiesPanel() {
  const [modTab, setModTab] = useState<ModTab>("pending");
  const [properties, setProperties] = useState<AgencyProperty[]>([]);
  const [counts, setCounts] = useState({ pending: 0, active: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const loadModeration = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res =
        modTab === "pending"
          ? await fetchPendingProperties()
          : await fetchProperties({ status: modTab });
      setProperties(res.data);
      setCounts((prev) => ({ ...prev, [modTab]: res.data.length }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible");
    } finally {
      setLoading(false);
    }
  }, [modTab]);

  useEffect(() => {
    void loadModeration();
  }, [loadModeration]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.loc.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.host?.toLowerCase().includes(q) ||
        propertyTypeLabel(p.type).toLowerCase().includes(q)
    );
  }, [properties, query]);

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
      setCounts((prev) => ({
        ...prev,
        [modTab]: Math.max(0, prev[modTab] - 1),
      }));
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-black/5 bg-white p-1 no-scrollbar">
          {(
            [
              { id: "pending", label: "À valider", count: counts.pending },
              { id: "active", label: "Publiés", count: counts.active },
              { id: "rejected", label: "Refusés", count: counts.rejected },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setModTab(item.id)}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                modTab === item.id
                  ? "bg-[var(--navy)] text-[var(--gold)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface)]"
              }`}
            >
              {item.label}
              {modTab === item.id && (
                <span className="ml-1 opacity-70">({item.count})</span>
              )}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher (nom, wilaya, type…)"
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--gold)] sm:max-w-xs"
        />
      </div>

      {toast && (
        <div className="rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-3 text-sm text-[var(--navy)]">
          {toast}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" onClick={loadModeration} className="ml-2 font-semibold underline">
            Réessayer
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Chargement des annonces...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
          <p className="font-display text-2xl text-[var(--navy)]">Aucune annonce</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {query
              ? "Aucun résultat pour cette recherche."
              : modTab === "pending"
                ? "Dès qu'une agence ou un propriétaire publie, l'annonce arrive ici."
                : "Passez à un autre onglet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((property) => (
            <article
              key={property.id}
              className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative h-48 w-full shrink-0 bg-[var(--surface)] md:h-auto md:w-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={property.img}
                    alt={property.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
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
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--ink)]">
                      {property.description || "Sans description"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                        {propertyTypeLabel(property.type)}
                      </span>
                      {property.bedrooms > 0 && (
                        <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                          {property.bedrooms} ch.
                        </span>
                      )}
                      {property.surface > 0 && (
                        <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                          {property.surface} m²
                        </span>
                      )}
                      <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                        {priceLabel(property)}
                      </span>
                      <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                        {property.host}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {modTab === "pending" && (
                      <>
                        <button
                          type="button"
                          disabled={busyId === property.id}
                          onClick={() => handleStatus(property.id, "active")}
                          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Approuver
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
                    {modTab === "active" && (
                      <button
                        type="button"
                        disabled={busyId === property.id}
                        onClick={() => handleStatus(property.id, "inactive")}
                        className="rounded-lg border border-black/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)]"
                      >
                        Retirer
                      </button>
                    )}
                    {modTab === "rejected" && (
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
