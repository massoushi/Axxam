"use client";

import { useRouter } from "next/navigation";
import type { ExploreCategory } from "@/data/listings";
import CategoryIcon from "@/components/ui/CategoryIcon";
import Icon from "@/components/ui/Icon";
import type { CategoryIconId } from "@/types/property";

/** Catégories compactes façon Airbnb */
export const HOME_FILTERS: {
  id: string;
  label: string;
  icon: CategoryIconId;
  href?: string;
  filterId?: string;
}[] = [
  { id: "all", label: "Tout", icon: "all", filterId: "all" },
  { id: "nuit", label: "À la nuit", icon: "night", href: "/hebergements" },
  { id: "villa", label: "Villas", icon: "villa", filterId: "villa" },
  { id: "piscine", label: "Piscine", icon: "pool", filterId: "piscine" },
  { id: "duplex", label: "Duplex", icon: "panorama", filterId: "duplex" },
  { id: "f3", label: "F3", icon: "business", filterId: "f3" },
  { id: "f4", label: "F4", icon: "business", filterId: "f4" },
  { id: "maison", label: "Maisons", icon: "riad", filterId: "maison" },
  { id: "mois", label: "Longue durée", icon: "calendar", filterId: "mois" },
  { id: "vente", label: "À vendre", icon: "key", href: "/immobilier" },
  { id: "terrain", label: "Terrains", icon: "land", href: "/immobilier" },
];

type CategoriesProps = {
  activeId: string;
  onSelect: (cat: ExploreCategory | { id: string }) => void;
};

export default function Categories({ activeId, onSelect }: CategoriesProps) {
  const router = useRouter();

  return (
    <div className="sticky top-16 z-40 border-b border-[var(--sand)]/80 bg-[var(--surface)]/95 backdrop-blur-md sm:top-[4.5rem]">
      <div className="container mx-auto max-w-6xl px-2 sm:px-6">
        <div className="flex gap-1 overflow-x-auto py-3.5 no-scrollbar">
          {HOME_FILTERS.map((cat) => {
            const isActive = activeId === cat.id || activeId === cat.filterId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  if (cat.href) {
                    router.push(cat.href);
                    return;
                  }
                  onSelect({ id: cat.filterId || cat.id });
                }}
                className={`flex min-w-[76px] shrink-0 flex-col items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 transition-colors ${
                  isActive
                    ? "border-[var(--gold)] text-[var(--navy)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--navy)]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    isActive ? "bg-[var(--gold)]/12 text-[var(--gold-deep)]" : "bg-transparent"
                  }`}
                >
                  <Icon className="h-5 w-5">
                    <CategoryIcon id={cat.icon} />
                  </Icon>
                </span>
                <span className="whitespace-nowrap text-[11px] font-medium">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
