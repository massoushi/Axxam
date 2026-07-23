"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SiteShell from "@/components/layout/SiteShell";
import PropertyImage from "@/components/ui/PropertyImage";
import PropertyModal from "@/components/property/PropertyModal";
import AuthGateModal from "@/components/auth/AuthGateModal";
import { useFavorites } from "@/hooks/useFavorites";
import { fetchProperties } from "@/lib/api";
import { toPublicProperties } from "@/lib/mappers";
import { ALGERIAN_CITIES, propertyTypeLabel } from "@/types/agency";
import type { Property } from "@/types/property";

const STAY_CHIPS = [
  { value: "", label: "Tous" },
  { value: "villa", label: "Villa" },
  { value: "duplex", label: "Duplex" },
  { value: "f3", label: "F3" },
  { value: "f4", label: "F4" },
  { value: "f5", label: "F5+" },
  { value: "maison", label: "Maison" },
  { value: "studio", label: "Studio" },
  { value: "piscine", label: "Piscine" },
] as const;

const PRICE_NIGHT = [
  { value: "", label: "Prix / nuit" },
  { value: "5000", label: "< 5 000" },
  { value: "10000", label: "< 10 000" },
  { value: "20000", label: "< 20 000" },
  { value: "50000", label: "< 50 000" },
] as const;

const GUESTS = [
  { value: "", label: "Voyageurs" },
  { value: "2", label: "2+" },
  { value: "4", label: "4+" },
  { value: "6", label: "6+" },
  { value: "8", label: "8+" },
] as const;

export default function HebergementsBrowse() {
  const searchParams = useSearchParams();
  const { favorites, toggleFavorite, authRequired, clearAuthGate } = useFavorites();

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [chip, setChip] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [guests, setGuests] = useState(searchParams.get("guests") || "");
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState({
    city: searchParams.get("city") || "",
    chip: "",
    maxPrice: "",
    guests: searchParams.get("guests") || "",
    q: "",
  });

  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        status: "active",
        transaction: "location",
        priceUnit: "nuit",
      };
      if (applied.city) params.city = applied.city;
      if (applied.chip && applied.chip !== "piscine") params.type = applied.chip;
      if (applied.chip === "piscine") params.category = "piscine-privee";
      if (applied.maxPrice) params.maxPrice = applied.maxPrice;

      const res = await fetchProperties(params);
      let data = toPublicProperties(res.data);

      // Garde-fou : uniquement locations à la nuit (pas vente / mois)
      data = data.filter(
        (p) =>
          (p.transaction || "location") === "location" &&
          (p.priceUnit || "nuit") === "nuit" &&
          p.type !== "terrain" &&
          p.type !== "local-commercial" &&
          p.type !== "immeuble" &&
          p.type !== "bureau"
      );

      if (applied.guests) {
        const min = Number(applied.guests);
        data = data.filter((p) => (p.capacity || 0) >= min);
      }

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
      setError(err instanceof Error ? err.message : "Impossible de charger les hébergements");
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
    const next = { city, chip, maxPrice, guests, q, ...patch };
    if (patch?.city !== undefined) setCity(patch.city);
    if (patch?.chip !== undefined) setChip(patch.chip);
    if (patch?.maxPrice !== undefined) setMaxPrice(patch.maxPrice);
    if (patch?.guests !== undefined) setGuests(patch.guests);
    setApplied(next);
  };

  const reset = () => {
    setCity("");
    setChip("");
    setMaxPrice("");
    setGuests("");
    setQ("");
    setApplied({ city: "", chip: "", maxPrice: "", guests: "", q: "" });
  };

  const hasFilters = useMemo(
    () =>
      Boolean(applied.city || applied.chip || applied.maxPrice || applied.guests || applied.q),
    [applied]
  );

  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-[var(--navy)]">
        <div className="absolute inset-0">
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(155deg, #2f2f2e 0%, #3c3c3b 45%, #5a4030 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 55% at 15% 85%, rgba(166,81,38,0.55), transparent), radial-gradient(ellipse 50% 40% at 90% 10%, rgba(222,208,182,0.2), transparent)",
            }}
          />
        </div>

        <div className="relative container mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--sand)]">
            Séjours & week-ends
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl">
            Réservez un logement pour la nuit
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65">
            Villas, appartements et maisons prêts à accueillir votre séjour — prix à la nuit, calendrier
            et réservation directe.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              apply();
            }}
            className="mt-8 grid gap-2 rounded-2xl border border-[var(--sand)]/20 bg-white p-3 text-[var(--ink)] shadow-[var(--shadow-lift)] sm:grid-cols-[1.1fr_1fr_1fr_1.1fr_auto]"
          >
            <label className="block">
              <span className="mb-1 block px-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Destination
              </span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-black/8 bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]"
              >
                <option value="">Toutes les wilayas</option>
                {ALGERIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block px-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Budget / nuit
              </span>
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-xl border border-black/8 bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]"
              >
                {PRICE_NIGHT.map((b) => (
                  <option key={b.label} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block px-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Voyageurs
              </span>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full rounded-xl border border-black/8 bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]"
              >
                {GUESTS.map((g) => (
                  <option key={g.label} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block px-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Recherche
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Plage, Tipaza, piscine…"
                className="w-full rounded-xl border border-black/8 bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)]"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--gold)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white sm:min-w-[110px]"
              >
                Chercher
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {STAY_CHIPS.map((c) => {
            const active = applied.chip === c.value;
            return (
              <button
                key={c.value || "all"}
                type="button"
                onClick={() => apply({ chip: c.value })}
                className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-[var(--navy)] text-[var(--gold)]"
                    : "border border-black/10 bg-white text-[var(--muted)] hover:border-[var(--navy)]/30 hover:text-[var(--navy)]"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">
            {loading
              ? "Recherche en cours…"
              : `${listings.length} hébergement${listings.length !== 1 ? "s" : ""} à la nuit`}
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
              href="/immobilier"
              className="rounded-full border border-black/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--navy)]"
            >
              Voir les ventes
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
            <p className="font-display text-3xl text-[var(--navy)]">Aucun séjour trouvé</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Changez de wilaya, de budget ou de capacité.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={reset}
                className="mt-6 inline-flex rounded-full bg-[var(--gold)] px-5 py-2.5 text-xs font-bold uppercase text-white"
              >
                Voir tous les hébergements
              </button>
            )}
          </div>
        )}

        {listings.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((item, i) => {
              const isFav = favorites.includes(item.id);
              const price = item.priceValue || 0;
              return (
                <article
                  key={item.id}
                  className="group animate-fade-up cursor-pointer overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-md"
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  onClick={() => setSelectedProperty(item)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--navy-soft)]/10">
                    <PropertyImage
                      src={item.img}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-md bg-[var(--gold)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      / nuit
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
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="line-clamp-1 text-sm font-semibold text-[var(--ink)]">
                        {item.name}
                      </h2>
                      <span className="shrink-0 text-xs font-medium text-[var(--muted)]">
                        ★ {item.rating}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">{item.loc}</p>
                    <p className="mt-3 font-display text-2xl font-semibold text-[var(--navy)]">
                      {price.toLocaleString("fr-DZ")}{" "}
                      <span className="text-sm font-sans font-normal text-[var(--muted)]">
                        DZD / nuit
                      </span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-black/5 pt-3 text-[11px] font-semibold text-[var(--navy-soft)]">
                      <span className="rounded-md bg-[var(--surface)] px-2 py-1">
                        {propertyTypeLabel(item.type || "")}
                      </span>
                      {item.capacity > 0 && (
                        <span className="rounded-md bg-[var(--surface)] px-2 py-1">
                          {item.capacity} pers.
                        </span>
                      )}
                      {item.bedrooms > 0 && (
                        <span className="rounded-md bg-[var(--surface)] px-2 py-1">
                          {item.bedrooms} ch.
                        </span>
                      )}
                      {item.category === "piscine-privee" && (
                        <span className="rounded-md bg-sky-50 px-2 py-1 text-sky-800">
                          Piscine
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
          message="Sauvegardez les séjours qui vous plaisent."
        />
      )}

      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </SiteShell>
  );
}
