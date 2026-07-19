import type { AgencyProperty } from "@/types/agency";
import type { Property } from "@/types/property";

/** Convertit un bien API vers le format carte / modal de l'accueil */
export function toPublicProperty(item: AgencyProperty): Property {
  const priceLabel = Number(item.price).toLocaleString("fr-DZ");

  return {
    id: item.id,
    name: item.name,
    loc: item.loc,
    dates: item.priceUnit === "mois" ? "Location mensuelle" : "Séjour",
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
  };
}
