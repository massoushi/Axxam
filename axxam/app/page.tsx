"use client";

import { useEffect, useState } from "react";
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
import type { Property } from "@/types/property";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState(0);
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
    if (selectedProperty) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProperty]);

  return (
    <SiteShell>
      <div className="text-[var(--ink)]">
        <Hero />
        <Categories active={activeCategory} setActive={setActiveCategory} />

        <section className="container mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
                Annonces vérifiées
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-[var(--navy)]">
                Biens disponibles en Algérie
              </h2>
            </div>
            <a
              href="/favoris"
              className="shrink-0 text-xs font-semibold text-[var(--navy)] hover:text-[var(--gold-deep)] transition-colors"
            >
              Mes favoris →
            </a>
          </div>

          {loading && <p className="text-sm text-[var(--muted)]">Chargement des annonces...</p>}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && listings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--navy)]/15 bg-white px-6 py-16 text-center">
              <p className="font-display text-2xl text-[var(--navy)]">Aucune annonce publiée pour le moment</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Les biens apparaîtront ici après validation par un administrateur.
              </p>
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
