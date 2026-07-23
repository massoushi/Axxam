"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteShell from "@/components/layout/SiteShell";
import PropertyImage from "@/components/ui/PropertyImage";
import PropertyModal from "@/components/property/PropertyModal";
import AuthGateModal from "@/components/auth/AuthGateModal";
import { useFavorites } from "@/hooks/useFavorites";
import { fetchProperties } from "@/lib/api";
import { toPublicProperties } from "@/lib/mappers";
import { ALGERIAN_CITIES, propertyTypeLabel } from "@/types/agency";
import type { Property } from "@/types/property";

const TYPE_CHIPS = [
  { value: "", label: "Tous" },
  { value: "f2", label: "F2" },
  { value: "f3", label: "F3" },
  { value: "f4", label: "F4" },
  { value: "f5", label: "F5+" },
  { value: "duplex", label: "Duplex" },
  { value: "villa", label: "Villa" },
  { value: "maison", label: "Maison" },
  { value: "terrain", label: "Terrain" },
  { value: "local-commercial", label: "Local" },
  { value: "immeuble", label: "Immeuble" },
] as const;

const BUDGET_PRESETS = [
  { value: "", label: "Budget libre" },
  { value: "5000000", label: "< 5 M" },
  { value: "10000000", label: "< 10 M" },
  { value: "20000000", label: "< 20 M" },
  { value: "50000000", label: "< 50 M" },
] as const;

function formatSalePrice(price: number) {
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)} M DZD`;
  }
  return `${price.toLocaleString("fr-DZ")} DZD`;
}

export default function ImmobilierBrowse() {
  const { favorites, toggleFavorite, authRequired, clearAuthGate } = useFavorites();

  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState({ city: "", type: "", maxPrice: "", q: "" });

  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        status: "active",
        transaction: "vente",
      };
      if (applied.city) params.city = applied.city;
      if (applied.type) params.type = applied.type;
      if (applied.maxPrice) params.maxPrice = applied.maxPrice;

      const res = await fetchProperties(params);
      let data = toPublicProperties(res.data);

      if (applied.q.trim()) {
        const needle = applied.q.trim().toLowerCase();
        data = data.filter(
          (p) =>
            p.name.toLowerCase().includes(needle) ||
            p.loc.toLowerCase().includes(needle) ||
            p.description.toLowerCase().includes(needle)
        );
      }

      setListings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les biens à vendre");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [applied]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (selectedProperty) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProperty]);

  const apply = (patch?: Partial<typeof applied>) => {
    const next = {
      city,
      type,
      maxPrice,
      q,
      ...patch,
    };
    if (patch?.city !== undefined) setCity(patch.city);
    if (patch?.type !== undefined) setType(patch.type);
    if (patch?.maxPrice !== undefined) setMaxPrice(patch.maxPrice);
    setApplied(next);
  };

  const reset = () => {
    setCity("");
    setType("");
    setMaxPrice("");
    setQ("");
    setApplied({ city: "", type: "", maxPrice: "", q: "" });
  };

  const hasFilters = useMemo(
    () => Boolean(applied.city || applied.type || applied.maxPrice || applied.q),
    [applied]
  );

  return (
    <SiteShell>
      {/* Hero vente — palette logo */}
      <section className="relative overflow-hidden bg-[var(--navy)] text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 75% 55% at 75% 15%, rgba(166,81,38,0.4), transparent), linear-gradient(145deg, #2f2f2e 0%, #3c3c3b 50%, #4a3528 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ded0b6' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative container mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--sand)]">
            Achat immobilier
          </p>
          <h1 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-[1.1] sm:text-5xl">
            Trouvez le bien à acheter en Algérie
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65">
            Appartements, villas, terrains et locaux — annonces vérifiées, prix clairs, contact
            direct avec le vendeur.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              apply();
            }}
            className="mt-8 grid gap-2 rounded-2xl border border-[var(--sand)]/20 bg-white p-3 text-[var(--ink)] shadow-[var(--shadow-lift)] sm:grid-cols-[1.2fr_1fr_1fr_auto]"
          >
            <label className="block">
              <span className="mb-1 block px-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Wilaya
              </span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-black/8 bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]"
              >
                <option value="">Toute l&apos;Algérie</option>
                {ALGERIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block px-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Budget max
              </span>
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-xl border border-black/8 bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]"
              >
                {BUDGET_PRESETS.map((b) => (
                  <option key={b.label} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block px-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Mot-clé
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Hydra, vue mer…"
                className="w-full rounded-xl border border-black/8 bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--navy)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--gold)] sm:min-w-[120px]"
              >
                Chercher
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Typologies */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {TYPE_CHIPS.map((chip) => {
            const active = applied.type === chip.value;
            return (
              <button
                key={chip.value || "all"}
                type="button"
                onClick={() => apply({ type: chip.value })}
                className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-[var(--navy)] text-[var(--gold)]"
                    : "border border-black/10 bg-white text-[var(--muted)] hover:border-[var(--navy)]/30 hover:text-[var(--navy)]"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">
            {loading
              ? "Recherche en cours…"
              : `${listings.length} bien${listings.length !== 1 ? "s" : ""} à vendre`}
            {hasFilters && " · filtres actifs"}
          </p>
          <div className="flex gap-2">
            {hasFilters && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-black/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--navy)]"
              >
                Réinitialiser
              </button>
            )}
            <Link
              href="/hebergements"
              className="rounded-full border border-black/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--navy)]"
            >
              Voir locations
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--navy)]/15 bg-white px-6 py-16 text-center">
            <p className="font-display text-3xl text-[var(--navy)]">Aucun bien à vendre</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Élargissez la wilaya ou le budget, ou revenez plus tard.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={reset}
                className="mt-6 inline-flex rounded-full bg-[var(--gold)] px-5 py-2.5 text-xs font-bold uppercase text-white"
              >
                Voir toute la vente
              </button>
            )}
          </div>
        )}

        {listings.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((item, i) => {
              const isFav = favorites.includes(item.id);
              return (
                <article
                  key={item.id}
                  className="group animate-fade-up cursor-pointer overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-md"
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  onClick={() => setSelectedProperty(item)}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[var(--navy-soft)]/10">
                    <PropertyImage
                      src={item.img}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-md bg-[var(--navy)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--gold)]">
                      À vendre
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/45"
                      aria-label="Favoris"
                    >
                      <svg
                        className={`h-5 w-5 ${isFav ? "text-[var(--gold)]" : ""}`}
                        viewBox="0 0 24 24"
                        fill={isFav ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={1.6}
                      >
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-4">
                    <p className="font-display text-2xl font-semibold text-[var(--navy)]">
                      {formatSalePrice(item.priceValue || Number(item.price) || 0)}
                    </p>
                    <h2 className="mt-1 line-clamp-1 text-sm font-semibold text-[var(--ink)]">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-xs text-[var(--muted)]">{item.loc}</p>

                    <div className="mt-3 flex flex-wrap gap-2 border-t border-black/5 pt-3 text-[11px] font-semibold text-[var(--navy-soft)]">
                      <span className="rounded-md bg-[var(--surface)] px-2 py-1">
                        {propertyTypeLabel(item.type || "")}
                      </span>
                      {(item.surface || 0) > 0 && (
                        <span className="rounded-md bg-[var(--surface)] px-2 py-1">
                          {item.surface} m²
                        </span>
                      )}
                      {(item.bedrooms || 0) > 0 && (
                        <span className="rounded-md bg-[var(--surface)] px-2 py-1">
                          {item.bedrooms} ch.
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {authRequired && (
        <AuthGateModal
          onClose={clearAuthGate}
          title="Connectez-vous pour vos favoris"
          message="Sauvegardez les biens à acheter qui vous intéressent."
        />
      )}

      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </SiteShell>
  );
}
