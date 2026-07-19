"use client";

import PropertyImage from "@/components/ui/PropertyImage";
import type { Property } from "@/types/property";

type ListingCardProps = {
  item: Property;
  id: string;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onCardClick: (property: Property) => void;
};

export default function ListingCard({ item, id, favorites, toggleFavorite, onCardClick }: ListingCardProps) {
  const isFav = favorites.includes(id);

  return (
    <article className="group cursor-pointer" onClick={() => onCardClick(item)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--navy-soft)]/10">
        <PropertyImage
          src={item.img}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)]/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {item.badge && (
          <span className="absolute top-3 left-3 bg-[var(--navy)]/90 text-[var(--gold)] text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">
            {item.badge}
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(id);
          }}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/25 backdrop-blur-sm transition-colors hover:bg-black/40"
          aria-label="Ajouter aux favoris"
        >
          <svg
            className={`h-5 w-5 transition-colors ${isFav ? "text-[var(--gold)]" : "text-white"}`}
            viewBox="0 0 24 24"
            fill={isFav ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.6}
          >
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="mt-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[var(--ink)] text-sm leading-tight group-hover:text-[var(--navy)]">
            {item.name}
          </h3>
          <span className="flex items-center gap-1 text-xs font-medium text-[var(--ink)] shrink-0">
            <svg className="h-3.5 w-3.5 text-[var(--gold)]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            {item.rating}
          </span>
        </div>
        <p className="mt-1 text-[var(--muted)] text-xs">{item.loc}</p>
        <p className="mt-2 text-sm">
          <span className="font-semibold text-[var(--ink)]">{item.price} DZD</span>{" "}
          <span className="text-[var(--muted)]">/ nuit</span>
        </p>
      </div>
    </article>
  );
}
