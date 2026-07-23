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
    <article
      className="group cursor-pointer"
      onClick={() => onCardClick(item)}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--sand-soft)] shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-lift)]">
        <PropertyImage
          src={item.img}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-60" />

        {item.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold tracking-wide text-[var(--navy)] shadow-sm backdrop-blur-sm">
            {item.badge}
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(id);
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/40"
          aria-label="Ajouter aux favoris"
        >
          <svg
            className={`h-5 w-5 drop-shadow ${isFav ? "text-[var(--gold-soft)]" : "text-white"}`}
            viewBox="0 0 24 24"
            fill={isFav ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="mt-3.5 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[15px] font-semibold text-[var(--ink)]">
            {item.loc.split(",")[0] || item.name}
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-sm text-[var(--ink)]">
            <svg className="h-3.5 w-3.5 text-[var(--gold)]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            {item.rating}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-sm text-[var(--muted)]">{item.name}</p>
        <p className="mt-2 text-sm">
          <span className="font-semibold text-[var(--navy)]">{item.price} DZD</span>{" "}
          {item.priceSuffix ? (
            <span className="font-normal text-[var(--muted)]">{item.priceSuffix}</span>
          ) : item.transaction === "vente" ? (
            <span className="text-[var(--muted)]">à l&apos;achat</span>
          ) : null}
        </p>
      </div>
    </article>
  );
}
