import type { CategoryIconId } from "@/types/property";

export type ExploreFilter = {
  type?: string;
  types?: string[];
  category?: string;
  transaction?: "location" | "vente";
  priceUnit?: "nuit" | "mois" | "jour" | "total";
  minBedrooms?: number;
  maxBedrooms?: number;
};

export type ExploreCategory = {
  id: string;
  label: string;
  icon: CategoryIconId;
  filter: ExploreFilter | null;
};

/** Organisation des biens : typologie algérienne + modes d'offre */
export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  { id: "all", label: "Tout", icon: "all", filter: null },
  { id: "studio", label: "Studio", icon: "business", filter: { type: "studio" } },
  { id: "f1", label: "F1", icon: "business", filter: { type: "f1" } },
  { id: "f2", label: "F2", icon: "business", filter: { type: "f2" } },
  { id: "f3", label: "F3", icon: "business", filter: { type: "f3" } },
  { id: "f4", label: "F4", icon: "business", filter: { type: "f4" } },
  { id: "f5", label: "F5", icon: "business", filter: { type: "f5" } },
  { id: "f6", label: "F6", icon: "business", filter: { type: "f6" } },
  { id: "f7", label: "F7", icon: "business", filter: { type: "f7" } },
  { id: "f8", label: "F8+", icon: "business", filter: { type: "f8" } },
  { id: "duplex", label: "Duplex", icon: "panorama", filter: { type: "duplex" } },
  { id: "villa", label: "Villas", icon: "villa", filter: { type: "villa" } },
  { id: "maison", label: "Maisons", icon: "riad", filter: { type: "maison" } },
  { id: "piscine", label: "Avec piscine", icon: "pool", filter: { category: "piscine-privee" } },
  { id: "terrain", label: "Terrains", icon: "land", filter: { type: "terrain" } },
  { id: "vehicule", label: "Véhicules", icon: "car", filter: { type: "vehicule" } },
  { id: "nuit", label: "À la nuit", icon: "night", filter: { transaction: "location", priceUnit: "nuit" } },
  { id: "mois", label: "Longue durée", icon: "calendar", filter: { transaction: "location", priceUnit: "mois" } },
  { id: "vente", label: "À vendre", icon: "key", filter: { transaction: "vente" } },
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
    bedrooms?: number;
  },
  filter: ExploreFilter | null
) {
  if (!filter) return true;
  if (filter.type && item.type !== filter.type) return false;
  if (filter.types?.length && !filter.types.includes(item.type || "")) return false;
  if (filter.category && item.category !== filter.category) return false;
  if (filter.transaction && item.transaction !== filter.transaction) return false;
  if (filter.priceUnit && item.priceUnit !== filter.priceUnit) return false;
  if (filter.minBedrooms != null && (item.bedrooms ?? 0) < filter.minBedrooms) return false;
  if (filter.maxBedrooms != null && (item.bedrooms ?? 0) > filter.maxBedrooms) return false;
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
