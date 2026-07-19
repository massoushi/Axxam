import type { CategoryIconId } from "@/types/property";

export type ExploreFilter = {
  type?: string;
  category?: string;
  transaction?: "location" | "vente";
  priceUnit?: "nuit" | "mois" | "jour" | "total";
};

export type ExploreCategory = {
  id: string;
  label: string;
  icon: CategoryIconId;
  filter: ExploreFilter | null;
};

/** Catégories d'accueil — filtres réels sur les annonces */
export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  { id: "all", label: "Tout", icon: "all", filter: null },
  { id: "nuit", label: "À la nuit", icon: "night", filter: { transaction: "location", priceUnit: "nuit" } },
  { id: "mois", label: "Longue durée", icon: "calendar", filter: { transaction: "location", priceUnit: "mois" } },
  { id: "vente", label: "À vendre", icon: "key", filter: { transaction: "vente" } },
  { id: "terrain", label: "Terrains", icon: "land", filter: { type: "terrain" } },
  { id: "vehicule", label: "Véhicules", icon: "car", filter: { type: "vehicule" } },
  { id: "villa", label: "Villas", icon: "villa", filter: { type: "villa" } },
  { id: "appartement", label: "Appartements", icon: "business", filter: { type: "appartement" } },
  { id: "maison", label: "Maisons", icon: "riad", filter: { type: "maison" } },
  { id: "mer", label: "Bord de mer", icon: "sea", filter: { category: "bord-de-mer" } },
  { id: "piscine", label: "Piscine", icon: "pool", filter: { category: "piscine-privee" } },
  { id: "montagne", label: "Montagne", icon: "mountain", filter: { category: "montagne" } },
];

/** @deprecated utilisez EXPLORE_CATEGORIES */
export const CATEGORIES = EXPLORE_CATEGORIES.map((c) => ({
  label: c.label,
  icon: c.icon,
}));

export function matchesExploreFilter(
  item: {
    type?: string;
    category?: string;
    transaction?: string;
    priceUnit?: string;
  },
  filter: ExploreFilter | null
) {
  if (!filter) return true;
  if (filter.type && item.type !== filter.type) return false;
  if (filter.category && item.category !== filter.category) return false;
  if (filter.transaction && item.transaction !== filter.transaction) return false;
  if (filter.priceUnit && item.priceUnit !== filter.priceUnit) return false;
  return true;
}

export function priceUnitLabel(unit?: string, transaction?: string) {
  if (transaction === "vente" || unit === "total") return "";
  switch (unit) {
    case "mois":
      return "/ mois";
    case "jour":
      return "/ jour";
    case "nuit":
    default:
      return "/ nuit";
  }
}

export const SECTIONS = [];
export const FEATURES = [];
