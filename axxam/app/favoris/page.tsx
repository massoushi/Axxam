"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteShell from "@/components/layout/SiteShell";
import ListingCard from "@/components/listings/ListingCard";
import PropertyModal from "@/components/property/PropertyModal";
import AuthGateModal from "@/components/auth/AuthGateModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { fetchFavorites } from "@/lib/api";
import { toPublicProperties } from "@/lib/mappers";
import type { Property } from "@/types/property";

export default function FavorisPage() {
  const { user, loading: authLoading } = useAuth();
  const { favorites, toggleFavorite, authRequired, clearAuthGate, reload } = useFavorites();
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setListings([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchFavorites();
        if (!cancelled) {
          setListings(toPublicProperties(res.data));
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
  }, [user, authLoading, favorites.length]);

  useEffect(() => {
    if (selectedProperty) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProperty]);

  const handleToggle = async (id: string) => {
    const wasFav = favorites.includes(id);
    await toggleFavorite(id);
    if (wasFav) {
      setListings((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <SiteShell>
      <section className="container mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
            AXXAM
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--navy)] sm:text-4xl">
            Mes favoris
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Les annonces que vous avez sauvegardées
          </p>
        </div>

        {!authLoading && !user && (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
            <p className="font-display text-2xl text-[var(--navy)]">Connectez-vous</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Créez un compte client pour sauvegarder vos annonces préférées.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/register"
                className="rounded-full bg-[var(--gold)] px-5 py-2.5 text-xs font-bold uppercase text-[var(--navy)]"
              >
                Créer un compte
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-black/10 px-5 py-2.5 text-xs font-bold uppercase text-[var(--navy)]"
              >
                Se connecter
              </Link>
            </div>
          </div>
        )}

        {user && loading && <p className="text-sm text-[var(--muted)]">Chargement des favoris...</p>}

        {user && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button type="button" onClick={reload} className="ml-2 underline">
              Réessayer
            </button>
          </div>
        )}

        {user && !loading && listings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
            <p className="font-display text-2xl text-[var(--navy)]">Aucun favori</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Cliquez sur le cœur d&apos;une annonce pour l&apos;enregistrer ici.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-[var(--gold)] px-5 py-2.5 text-xs font-bold uppercase text-[var(--navy)]"
            >
              Explorer les annonces
            </Link>
          </div>
        )}

        {user && listings.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                id={item.id}
                favorites={favorites}
                toggleFavorite={handleToggle}
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
