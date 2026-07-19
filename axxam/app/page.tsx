"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Categories from "@/components/home/Categories";
import Hero from "@/components/home/Hero";
import PromoBanner from "@/components/home/PromoBanner";
import SiteShell from "@/components/layout/SiteShell";
import ListingCard from "@/components/listings/ListingCard";
import PropertyModal from "@/components/property/PropertyModal";
import AuthGateModal from "@/components/auth/AuthGateModal";
import { useFavorites } from "@/hooks/useFavorites";
import { fetchActiveProperties } from "@/lib/api";
import { toPublicProperty } from "@/lib/mappers";
import { EXPLORE_CATEGORIES, matchesExploreFilter } from "@/data/listings";
import type { Property } from "@/types/property";

export default function Home() {
  const [activeId, setActiveId] = useState("all");
  const { favorites, toggleFavorite, authRequired, clearAuthGate } = useFavorites();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetchActiveProperties();
        if (!cancelled) {
          setListings(res.data.map(toPublicProperty));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Impossible de charger les annonces");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedProperty) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProperty]);

  const activeCat = EXPLORE_CATEGORIES.find((c) => c.id === activeId) || EXPLORE_CATEGORIES[0];

  const filtered = useMemo(
    () => listings.filter((item) => matchesExploreFilter(item, activeCat.filter)),
    [listings, activeCat]
  );

  return (
    <SiteShell>
      <div className="text-[var(--ink)]">
        <Hero />
        <Categories activeId={activeId} onSelect={(cat) => setActiveId(cat.id)} />

        <section className="container mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
                Annonces vérifiées
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-[var(--navy)]">
                {activeCat.id === "all" ? "Biens disponibles en Algérie" : activeCat.label}
              </h2>
              {!loading && (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/annonces"
                className="text-xs font-semibold text-[var(--navy)] hover:text-[var(--gold-deep)] transition-colors"
              >
                Recherche avancée →
              </Link>
              <Link
                href="/favoris"
                className="text-xs font-semibold text-[var(--navy)] hover:text-[var(--gold-deep)] transition-colors"
              >
                Mes favoris →
              </Link>
            </div>
          </div>

          {loading && <p className="text-sm text-[var(--muted)]">Chargement des annonces...</p>}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--navy)]/15 bg-white px-6 py-16 text-center">
              <p className="font-display text-2xl text-[var(--navy)]">Aucun bien dans cette catégorie</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Essayez une autre catégorie ou consultez toutes les annonces.
              </p>
              <button
                type="button"
                onClick={() => setActiveId("all")}
                className="mt-6 inline-flex rounded-full bg-[var(--gold)] px-5 py-2.5 text-xs font-bold uppercase text-[var(--navy)]"
              >
                Voir tout
              </button>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((item) => (
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

        <PromoBanner />
      </div>

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
