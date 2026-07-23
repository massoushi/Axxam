"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Categories from "@/components/home/Categories";
import Hero from "@/components/home/Hero";
import HomeSection from "@/components/home/HomeSection";
import PromoBanner from "@/components/home/PromoBanner";
import SiteShell from "@/components/layout/SiteShell";
import ListingCard from "@/components/listings/ListingCard";
import PropertyModal from "@/components/property/PropertyModal";
import AuthGateModal from "@/components/auth/AuthGateModal";
import RoleHomeRedirect from "@/components/auth/RoleHomeRedirect";
import { useFavorites } from "@/hooks/useFavorites";
import { fetchActiveProperties } from "@/lib/api";
import { toPublicProperties } from "@/lib/mappers";
import { EXPLORE_CATEGORIES, matchesExploreFilter } from "@/data/listings";
import type { Property } from "@/types/property";

function byCity(items: Property[], city: string) {
  return items.filter((p) => p.loc.toLowerCase().includes(city.toLowerCase()));
}

function isStay(p: Property) {
  return (
    (p.transaction || "location") === "location" &&
    (p.priceUnit || "nuit") === "nuit" &&
    p.type !== "terrain"
  );
}

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
          setListings(toPublicProperties(res.data));
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

  const stays = useMemo(() => listings.filter(isStay), [listings]);
  const villas = useMemo(
    () => listings.filter((p) => p.type === "villa" || p.type === "duplex"),
    [listings]
  );
  const withPool = useMemo(
    () => listings.filter((p) => p.category === "piscine-privee"),
    [listings]
  );
  const sales = useMemo(
    () => listings.filter((p) => p.transaction === "vente"),
    [listings]
  );
  const alger = useMemo(() => byCity(stays, "Alger"), [stays]);
  const oran = useMemo(() => byCity(stays, "Oran"), [stays]);

  const showFilteredGrid = activeId !== "all";

  return (
    <SiteShell>
      <RoleHomeRedirect />
      <div className="bg-[var(--surface)] text-[var(--ink)]">
        <Hero />
        <Categories
          activeId={activeId}
          onSelect={(cat) => setActiveId(cat.id)}
        />

        <div className="container mx-auto max-w-6xl sm:px-6">
          {loading && (
            <div className="grid grid-cols-1 gap-5 px-4 py-10 sm:grid-cols-2 sm:px-0 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="axxam-skeleton aspect-square" />
                  <div className="axxam-skeleton h-4 w-3/4" />
                  <div className="axxam-skeleton h-3 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mx-4 my-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-0">
              {error}
            </div>
          )}

          {!loading && !error && showFilteredGrid && (
            <section className="px-4 py-8 sm:px-0">
              <div className="mb-5 flex items-end justify-between">
                <h2 className="font-display text-2xl font-semibold text-[var(--navy)] sm:text-3xl">
                  {activeCat.label}
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveId("all")}
                  className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--navy)]"
                >
                  Effacer
                </button>
              </div>
              {filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-[var(--muted)]">
                  Aucun bien dans cette catégorie.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
          )}

          {!loading && !error && !showFilteredGrid && (
            <>
              <HomeSection
                title="Séjours populaires à la nuit"
                subtitle="Appartements et maisons prêts à réserver"
                href="/hebergements"
                items={stays}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onCardClick={setSelectedProperty}
              />

              <HomeSection
                title="Villas & duplex"
                subtitle="Pour les groupes et les week-ends"
                href="/hebergements"
                items={villas}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onCardClick={setSelectedProperty}
              />

              {withPool.length > 0 && (
                <HomeSection
                  title="Avec piscine"
                  href="/hebergements"
                  items={withPool}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  onCardClick={setSelectedProperty}
                />
              )}

              {alger.length > 0 && (
                <HomeSection
                  title="Séjours à Alger"
                  href="/hebergements"
                  items={alger}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  onCardClick={setSelectedProperty}
                />
              )}

              {oran.length > 0 && (
                <HomeSection
                  title="Séjours à Oran"
                  href="/hebergements"
                  items={oran}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  onCardClick={setSelectedProperty}
                />
              )}

              {sales.length > 0 && (
                <HomeSection
                  title="Biens à vendre"
                  subtitle="Appartements, villas et terrains"
                  href="/immobilier"
                  items={sales}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  onCardClick={setSelectedProperty}
                />
              )}

              {stays.length === 0 && sales.length === 0 && (
                <p className="px-4 py-16 text-center text-sm text-[var(--muted)]">
                  Aucune annonce pour le moment.
                </p>
              )}
            </>
          )}
        </div>

        <div className="container mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/hebergements"
              className="rounded-full bg-[var(--navy)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--sand)] transition-colors hover:bg-[var(--navy-soft)]"
            >
              Tous les hébergements
            </Link>
            <Link
              href="/immobilier"
              className="rounded-full bg-[var(--gold)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[var(--shadow-gold)] transition-colors hover:bg-[var(--gold-deep)]"
            >
              Toutes les ventes
            </Link>
            <Link
              href="/annonces"
              className="rounded-full border border-[var(--navy)]/15 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)] transition-colors hover:border-[var(--gold)]"
            >
              Recherche avancée
            </Link>
          </div>
        </div>

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
