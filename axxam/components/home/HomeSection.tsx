"use client";

import Link from "next/link";
import ListingCard from "@/components/listings/ListingCard";
import type { Property } from "@/types/property";

type HomeSectionProps = {
  title: string;
  subtitle?: string;
  href?: string;
  items: Property[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onCardClick: (property: Property) => void;
};

/** Rangée horizontale façon Airbnb + lien « Afficher plus » */
export default function HomeSection({
  title,
  subtitle,
  href,
  items,
  favorites,
  toggleFavorite,
  onCardClick,
}: HomeSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="py-9 sm:py-11">
      <div className="mb-6 flex items-end justify-between gap-4 px-4 sm:px-0">
        <div>
          <div className="mb-2 h-0.5 w-10 rounded-full bg-[var(--gold)]" />
          <h2 className="axxam-section-title text-2xl sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1.5 text-sm text-[var(--muted)]">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 rounded-full border border-[var(--navy)]/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--navy)] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold-deep)]"
          >
            Afficher plus
          </Link>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-2 sm:overflow-visible md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
        {items.slice(0, 8).map((item) => (
          <div key={item.id} className="w-[72vw] shrink-0 sm:w-auto">
            <ListingCard
              item={item}
              id={item.id}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onCardClick={onCardClick}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
