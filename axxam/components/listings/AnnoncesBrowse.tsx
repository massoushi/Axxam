"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteShell from "@/components/layout/SiteShell";
import ListingCard from "@/components/listings/ListingCard";
import PropertyModal from "@/components/property/PropertyModal";
import AuthGateModal from "@/components/auth/AuthGateModal";
import { useFavorites } from "@/hooks/useFavorites";
import { fetchProperties } from "@/lib/api";
import { toPublicProperty } from "@/lib/mappers";
import { ALGERIAN_CITIES } from "@/types/agency";
import type { Property } from "@/types/property";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20";

export default function AnnoncesBrowse() {
  const searchParams = useSearchParams();
  const { favorites, toggleFavorite, authRequired, clearAuthGate } = useFavorites();

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [transaction, setTransaction] = useState(searchParams.get("transaction") || "");
  const [priceUnit, setPriceUnit] = useState(searchParams.get("priceUnit") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [q, setQ] = useState(searchParams.get("q") || "");

  const [applied, setApplied] = useState({
    city: searchParams.get("city") || "",
    type: searchParams.get("type") || "",
    transaction: searchParams.get("transaction") || "",
    priceUnit: searchParams.get("priceUnit") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    q: searchParams.get("q") || "",
  });

  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { status: "active" };
      if (applied.city) params.city = applied.city;
      if (applied.type) params.type = applied.type;
      if (applied.transaction) params.transaction = applied.transaction;
      if (applied.priceUnit) params.priceUnit = applied.priceUnit;
      if (applied.category) params.category = applied.category;
      if (applied.minPrice) params.minPrice = applied.minPrice;
      if (applied.maxPrice) params.maxPrice = applied.maxPrice;

      const res = await fetchProperties(params);
      let data = res.data.map(toPublicProperty);

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
      setError(err instanceof Error ? err.message : "Impossible de charger les annonces");
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

  const hasFilters = useMemo(
    () =>
      Boolean(
        applied.city ||
          applied.type ||
          applied.transaction ||
          applied.priceUnit ||
          applied.category ||
          applied.minPrice ||
          applied.maxPrice ||
          applied.q
      ),
    [applied]
  );

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    setApplied({ city, type, transaction, priceUnit, category, minPrice, maxPrice, q });
  };

  const resetFilters = () => {
    setCity("");
    setType("");
    setTransaction("");
    setPriceUnit("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setQ("");
    setApplied({
      city: "",
      type: "",
      transaction: "",
      priceUnit: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      q: "",
    });
  };

  return (
    <SiteShell>
      <section className="container mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
            AXXAM
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--navy)] sm:text-4xl">
            Annonces
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Parcourez les biens vérifiés selon la ville, le type et le budget.
          </p>
        </div>

        <form
          onSubmit={applyFilters}
          className="mb-10 grid gap-3 rounded-2xl border border-black/5 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
        >
          <div className="lg:col-span-2">
            <label className="mb-1.5 block text-[11px] font-semibold text-[var(--navy)]">Recherche</label>
            <input
              className={inputClass}
              placeholder="Nom, lieu, description…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-[var(--navy)]">Wilaya</label>
            <select className={inputClass} value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Toutes les wilayas</option>
              {ALGERIAN_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-[var(--navy)]">Type</label>
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Tous</option>
              <optgroup label="Appartements">
                <option value="studio">Studio</option>
                <option value="f1">F1</option>
                <option value="f2">F2</option>
                <option value="f3">F3</option>
                <option value="f4">F4</option>
                <option value="f5">F5</option>
                <option value="f6">F6</option>
                <option value="f7">F7</option>
                <option value="f8">F8+</option>
              </optgroup>
              <optgroup label="Maisons">
                <option value="duplex">Duplex</option>
                <option value="villa">Villa</option>
                <option value="maison">Maison</option>
              </optgroup>
              <optgroup label="Autres">
                <option value="terrain">Terrain</option>
                <option value="immeuble">Immeuble</option>
                <option value="local-commercial">Local commercial</option>
                <option value="bureau">Bureau</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-[var(--navy)]">Transaction</label>
            <select
              className={inputClass}
              value={transaction}
              onChange={(e) => setTransaction(e.target.value)}
            >
              <option value="">Toutes</option>
              <option value="location">Location</option>
              <option value="vente">Vente</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-[var(--navy)]">Tarif</label>
            <select
              className={inputClass}
              value={priceUnit}
              onChange={(e) => setPriceUnit(e.target.value)}
            >
              <option value="">Tous</option>
              <option value="nuit">Par nuit</option>
              <option value="jour">Par jour</option>
              <option value="mois">Par mois</option>
              <option value="total">Prix total</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[var(--navy)]">Min</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                placeholder="DZD"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[var(--navy)]">Max</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                placeholder="DZD"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-6">
            <button
              type="submit"
              className="rounded-full bg-[var(--gold)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)]"
            >
              Filtrer
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-black/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)]"
              >
                Réinitialiser
              </button>
            )}
            {!loading && (
              <p className="ml-auto self-center text-xs text-[var(--muted)]">
                {listings.length} bien{listings.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </form>

        {loading && <p className="text-sm text-[var(--muted)]">Chargement des annonces...</p>}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--navy)]/15 bg-white px-6 py-16 text-center">
            <p className="font-display text-2xl text-[var(--navy)]">Aucun bien trouvé</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Essayez d&apos;élargir vos critères de recherche.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 inline-flex rounded-full bg-[var(--gold)] px-5 py-2.5 text-xs font-bold uppercase text-[var(--navy)]"
              >
                Voir toutes les annonces
              </button>
            )}
          </div>
        )}

        {listings.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                id={item.id}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onCardClick={setSelectedProperty}
              />
            ))}
          </div>
        )}
      </section>

      {authRequired && (
        <AuthGateModal
          onClose={clearAuthGate}
          title="Connectez-vous pour vos favoris"
          message="Sauvegardez vos annonces préférées en créant un compte client ou en vous connectant."
        />
      )}

      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </SiteShell>
  );
}
