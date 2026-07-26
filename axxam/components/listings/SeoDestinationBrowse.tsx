"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import SiteShell from "@/components/layout/SiteShell";
import ListingCard from "@/components/listings/ListingCard";
import PropertyModal from "@/components/property/PropertyModal";
import PayOnSiteNotice from "@/components/trust/PayOnSiteNotice";
import CoastMap from "@/components/map/CoastMap";
import AuthGateModal from "@/components/auth/AuthGateModal";
import { useFavorites } from "@/hooks/useFavorites";
import { fetchProperties } from "@/lib/api";
import { toPublicProperties } from "@/lib/mappers";
import type { SeoDestination } from "@/lib/seo-destinations";
import type { Property } from "@/types/property";

type Props = { dest: SeoDestination };

export default function SeoDestinationBrowse({ dest }: Props) {
  const { favorites, toggleFavorite, authRequired, clearAuthGate } = useFavorites();
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Property | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        status: "active",
        transaction: "location",
        city: dest.city,
      };
      if (dest.type) params.type = dest.type;
      if (dest.category) params.category = dest.category;
      const res = await fetchProperties(params);
      let data = toPublicProperties(res.data);
      // Hydra filter soft on loc/name for that destination
      if (dest.slug.includes("hydra")) {
        const hydra = data.filter(
          (p) =>
            p.loc.toLowerCase().includes("hydra") ||
            p.name.toLowerCase().includes("hydra")
        );
        if (hydra.length) data = hydra;
      }
      setListings(data);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [dest]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SiteShell>
      <section className="bg-[var(--navy)] px-4 py-12 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--sand)]">
            SEO · {dest.city}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">
            {dest.h1}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">{dest.description}</p>
          <Link
            href="/hebergements"
            className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-[var(--gold)] px-5 text-sm font-bold text-white"
          >
            Affiner la recherche
          </Link>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8 pb-28 sm:px-6">
        <PayOnSiteNotice />
        <CoastMap listings={listings} cityFilter={dest.city} onSelect={setSelected} />

        {loading ? (
          <p className="text-sm text-[var(--muted)]">Chargement…</p>
        ) : listings.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            Aucune annonce pour l&apos;instant.{" "}
            <Link href="/hebergements" className="font-semibold text-[var(--navy)] underline">
              Voir tous les séjours
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                id={item.id}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onCardClick={setSelected}
              />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <PropertyModal property={selected} onClose={() => setSelected(null)} />
      )}
      {authRequired && <AuthGateModal onClose={clearAuthGate} />}
    </SiteShell>
  );
}
