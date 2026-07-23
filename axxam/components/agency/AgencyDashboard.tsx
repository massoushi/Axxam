"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AvailabilityManager from "@/components/agency/AvailabilityManager";
import { deleteProperty, fetchAgencyProperties } from "@/lib/api";
import type { AgencyProperty, PropertyStatus, TransactionType } from "@/types/agency";
import {
  ALGERIAN_CITIES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
} from "@/types/agency";

function labelOf(list: readonly { value: string; label: string }[], value: string) {
  return list.find((item) => item.value === value)?.label || value;
}

function statusStyle(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "active":
      return "bg-emerald-50 text-emerald-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    case "draft":
      return "bg-slate-100 text-slate-600";
    case "on_hold":
      return "bg-orange-50 text-orange-700";
    case "inactive":
      return "bg-gray-100 text-gray-500";
    case "sold":
      return "bg-blue-50 text-blue-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function statusLabel(status: string) {
  return PROPERTY_STATUSES.find((s) => s.value === status)?.label || status;
}

type AgencyDashboardProps = {
  publisherId?: string;
  publishHref?: string;
  title?: string;
  subtitle?: string;
};

export default function AgencyDashboard({
  publisherId = "agence-demo",
  publishHref = "/agence/publier",
  title = "Biens immobiliers",
  subtitle,
}: AgencyDashboardProps = {}) {
  const [properties, setProperties] = useState<AgencyProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [statusTab, setStatusTab] = useState<PropertyStatus | "all">("all");
  const [transaction, setTransaction] = useState<TransactionType | "all">("all");
  const [type, setType] = useState("all");
  const [city, setCity] = useState("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [search, setSearch] = useState("");
  const [calendarProperty, setCalendarProperty] = useState<AgencyProperty | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetchAgencyProperties(publisherId);
        if (!cancelled) {
          setProperties(res.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Impossible de charger les biens");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publisherId]);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAgencyProperties(publisherId);
      setProperties(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les biens");
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    const base: Record<string, number> = {
      all: properties.length,
      pending: 0,
      active: 0,
      draft: 0,
      on_hold: 0,
      inactive: 0,
      rejected: 0,
      sold: 0,
    };
    for (const p of properties) {
      const key = p.status || "pending";
      if (key in base) base[key] += 1;
    }
    return base;
  }, [properties]);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const st = p.status || "active";
      if (statusTab !== "all" && st !== statusTab) return false;
      if (transaction !== "all" && p.transaction !== transaction) return false;
      if (type !== "all" && p.type !== type) return false;
      if (city !== "all" && p.city !== city) return false;
      if (Number(p.price) < minPrice || Number(p.price) > maxPrice) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${p.name} ${p.loc} ${p.id} ${p.city}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [properties, statusTab, transaction, type, city, minPrice, maxPrice, search]);

  const onDelete = async (id: string) => {
    if (!confirm("Supprimer ce bien ?")) return;
    try {
      await deleteProperty(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Suppression impossible");
    }
  };

  const resetFilters = () => {
    setTransaction("all");
    setType("all");
    setCity("all");
    setMinPrice(0);
    setMaxPrice(500000);
    setSearch("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--navy)]">{title}</h1>
          <p className="text-sm text-[var(--muted)]">
            {subtitle || `${filtered.length} résultat(s) affiché(s)`}
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Les nouvelles annonces restent en attente jusqu&apos;à validation par l&apos;admin, puis
            apparaissent sur l&apos;accueil.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="rounded-lg border border-black/10 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)] lg:hidden"
          >
            Filtres
          </button>
          <Link
            href={publishHref}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--gold)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--gold-soft)] transition-colors"
          >
            + Ajouter un bien
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" onClick={reload} className="ml-2 font-semibold underline">
            Réessayer
          </button>
        </div>
      )}

      <div className="flex gap-4">
        {/* Sidebar filters */}
        <aside
          className={`${
            filtersOpen ? "block" : "hidden"
          } w-full shrink-0 rounded-xl border border-black/5 bg-white p-4 lg:block lg:w-64`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--navy)]">Filtres</h2>
            <button type="button" onClick={resetFilters} className="text-[10px] font-semibold uppercase text-[var(--gold-deep)]">
              Réinitialiser
            </button>
          </div>

          <div className="space-y-5 text-sm">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Recherche
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Titre, ville, réf..."
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Prix (DZD) — {minPrice.toLocaleString("fr-DZ")} → {maxPrice.toLocaleString("fr-DZ")}
              </label>
              <input
                type="range"
                min={0}
                max={500000}
                step={5000}
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-full accent-[var(--gold)]"
              />
              <input
                type="range"
                min={0}
                max={500000}
                step={5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-1 w-full accent-[var(--navy)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Transaction
              </label>
              <div className="flex gap-2">
                {(["all", "vente", "location"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTransaction(value)}
                    className={`flex-1 rounded-lg border px-2 py-2 text-[11px] font-bold uppercase ${
                      transaction === value
                        ? "border-[var(--navy)] bg-[var(--navy)] text-[var(--gold)]"
                        : "border-black/10 text-[var(--muted)]"
                    }`}
                  >
                    {value === "all" ? "Tous" : value === "vente" ? "Vente" : "Location"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Type de bien
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
              >
                <option value="all">Tous les types</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Wilaya
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
              >
                <option value="all">Toutes les wilayas</option>
                {ALGERIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="min-w-0 flex-1 space-y-3">
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-black/5 bg-white p-1 no-scrollbar">
            {PROPERTY_STATUSES.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusTab(tab.value)}
                className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  statusTab === tab.value
                    ? "bg-[var(--navy)] text-[var(--gold)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface)]"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 opacity-70">
                  {tab.value === "all" ? counts.all : counts[tab.value as PropertyStatus] || 0}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="rounded-xl border border-black/5 bg-white px-4 py-16 text-center text-sm text-[var(--muted)]">
              Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-16 text-center">
              <p className="font-display text-xl text-[var(--navy)]">Aucun bien trouvé</p>
              <Link href="/agence/publier" className="mt-4 inline-block text-sm font-semibold text-[var(--gold-deep)]">
                Publier un bien →
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-xl border border-black/5 bg-white md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-black/5 bg-[#f8fafb] text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-3">Bien</th>
                      <th className="px-4 py-3">Ville</th>
                      <th className="px-4 py-3">Type & prix</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((property) => (
                      <tr key={property.id} className="border-b border-black/5 last:border-0 hover:bg-[#fafbfc]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={property.img}
                              alt=""
                              className="h-12 w-14 rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[var(--navy)]">{property.name}</p>
                              <p className="text-[10px] text-[var(--muted)]">
                                Réf. {property.id.slice(0, 18)}
                                {property.bedrooms > 0 ? ` · ${property.bedrooms} ch.` : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--ink)]">{property.city}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[var(--navy)]">{labelOf(PROPERTY_TYPES, property.type)}</p>
                          <p className="text-xs text-[var(--muted)]">
                            {Number(property.price).toLocaleString("fr-DZ")} DZD/{property.priceUnit}
                            <span className="ml-1 text-[var(--gold-deep)]">
                              · {property.transaction === "vente" ? "Vente" : "Location"}
                            </span>
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyle(
                              property.status || "active"
                            )}`}
                          >
                            {statusLabel(property.status || "active")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setCalendarProperty(property)}
                              className="rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[var(--gold-deep)] hover:bg-[var(--gold)]/20"
                            >
                              Calendrier
                            </button>
                            <Link
                              href={`/annonces/${property.id}`}
                              className="rounded-lg border border-black/10 px-2.5 py-1.5 text-[11px] font-semibold text-[var(--navy)] hover:border-[var(--navy)]"
                            >
                              Voir
                            </Link>
                            <button
                              type="button"
                              onClick={() => onDelete(property.id)}
                              className="rounded-lg border border-red-200 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                            >
                              Suppr.
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {filtered.map((property) => (
                  <article key={property.id} className="flex gap-3 rounded-xl border border-black/5 bg-white p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={property.img} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold text-[var(--navy)]">{property.name}</h3>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${statusStyle(
                            property.status || "active"
                          )}`}
                        >
                          {statusLabel(property.status || "active")}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        {property.city} · {property.transaction === "vente" ? "Vente" : "Location"}
                      </p>
                      <p className="mt-1 text-sm font-bold text-[var(--navy)]">
                        {Number(property.price).toLocaleString("fr-DZ")}{" "}
                        <span className="text-xs font-medium text-[var(--muted)]">DZD/{property.priceUnit}</span>
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCalendarProperty(property)}
                          className="text-[11px] font-semibold text-[var(--navy)]"
                        >
                          Calendrier
                        </button>
                        <Link href={`/annonces/${property.id}`} className="text-[11px] font-semibold text-[var(--gold-deep)]">
                          Voir
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(property.id)}
                          className="text-[11px] font-semibold text-red-600"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* FAB mobile */}
      <Link
        href={publishHref}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gold)] text-2xl font-light text-white shadow-lg md:hidden"
        aria-label="Ajouter un bien"
      >
        +
      </Link>

      {calendarProperty && (
        <AvailabilityManager
          property={calendarProperty}
          onClose={() => setCalendarProperty(null)}
          onSaved={(updated) => {
            setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setCalendarProperty(updated);
          }}
        />
      )}
    </div>
  );
}
