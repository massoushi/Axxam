import type { AgencyProperty } from "@/types/agency";
import type { Property } from "@/types/property";
import { priceUnitLabel } from "@/data/listings";

/** Convertit un bien API vers le format carte / modal de l'accueil */
export function toPublicProperty(item: AgencyProperty): Property {
  const priceLabel = Number(item.price).toLocaleString("fr-DZ");
  const suffix = priceUnitLabel(item.priceUnit, item.transaction);

  let dates = "Séjour";
  if (item.transaction === "vente") dates = "À vendre";
  else if (item.priceUnit === "mois") dates = "Location mensuelle";
  else if (item.type === "terrain") dates = "Terrain";
  else if (item.priceUnit === "jour") dates = "Location journalière";

  return {
    id: item.id,
    name: item.name,
    loc: item.loc,
    dates,
    price: priceLabel,
    total: priceLabel,
    rating: item.rating && item.rating !== "—" ? item.rating : "Nouveau",
    badge: item.badge,
    img: item.img,
    description: item.description || "Bien disponible sur AXXAM.",
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    capacity: item.capacity,
    amenities: item.amenities || [],
    host: item.host,
    hostImage: item.img,
    availability: [],
    unavailableDates: item.unavailableDates || [],
    images: item.images?.length ? item.images : [item.img],
    reviews: [],
    type: item.type,
    category: item.category,
    transaction: item.transaction,
    priceUnit: item.priceUnit,
    priceSuffix: suffix,
  };
}
