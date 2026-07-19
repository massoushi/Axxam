export const PROPERTY_TYPES = [
  { value: "studio", label: "Studio", bedrooms: 0, group: "appartements" },
  { value: "f1", label: "F1", bedrooms: 1, group: "appartements" },
  { value: "f2", label: "F2", bedrooms: 2, group: "appartements" },
  { value: "f3", label: "F3", bedrooms: 3, group: "appartements" },
  { value: "f4", label: "F4", bedrooms: 4, group: "appartements" },
  { value: "f5", label: "F5", bedrooms: 5, group: "appartements" },
  { value: "f6", label: "F6", bedrooms: 6, group: "appartements" },
  { value: "f7", label: "F7", bedrooms: 7, group: "appartements" },
  { value: "f8", label: "F8+", bedrooms: 8, group: "appartements" },
  { value: "duplex", label: "Duplex", bedrooms: 3, group: "maisons" },
  { value: "villa", label: "Villa", bedrooms: 4, group: "maisons" },
  { value: "maison", label: "Maison / Riad", bedrooms: 3, group: "maisons" },
  { value: "immeuble", label: "Immeuble", bedrooms: 0, group: "maisons" },
  { value: "terrain", label: "Terrain", bedrooms: 0, group: "autres" },
  { value: "local-commercial", label: "Local commercial", bedrooms: 0, group: "autres" },
  { value: "bureau", label: "Bureau", bedrooms: 0, group: "autres" },
] as const;

export const PROPERTY_TYPE_GROUPS = [
  { id: "appartements", label: "Appartements (Studio → F8)" },
  { id: "maisons", label: "Villas, duplex & maisons" },
  { id: "autres", label: "Terrain & locaux" },
] as const;

export type PoolOption = "avec-piscine" | "sans-piscine" | "na";

export const POOL_OPTIONS: { value: PoolOption; label: string; hint: string }[] = [
  { value: "avec-piscine", label: "Avec piscine", hint: "Piscine privée ou partagée" },
  { value: "sans-piscine", label: "Sans piscine", hint: "Pas de piscine" },
  { value: "na", label: "Non concerné", hint: "Terrain, local commercial…" },
];

export function propertyTypeLabel(type?: string) {
  return PROPERTY_TYPES.find((t) => t.value === type)?.label || type || "Bien";
}

export function suggestedBedroomsForType(type: string) {
  return PROPERTY_TYPES.find((t) => t.value === type)?.bedrooms ?? 2;
}


export const PROPERTY_CATEGORIES = [
  { value: "bord-de-mer", label: "Bord de mer" },
  { value: "piscine-privee", label: "Piscine privée" },
  { value: "vue-panoramique", label: "Vue panoramique" },
  { value: "design-luxe", label: "Design & Luxe" },
  { value: "montagne", label: "Montagne" },
  { value: "affaires", label: "Séjour d'affaires" },
  { value: "famille", label: "Famille" },
  { value: "urbain", label: "Terrain urbain" },
  { value: "agricole", label: "Terrain agricole" },
  { value: "autre", label: "Autre" },
] as const;

export const ALGERIAN_CITIES = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Béchar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Alger",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Bel Abbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arreridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
  "Timimoun",
  "Bordj Badji Mokhtar",
  "Ouled Djellal",
  "Béni Abbès",
  "In Salah",
  "In Guezzam",
  "Touggourt",
  "Djanet",
  "El M'Ghair",
  "El Meniaa",
] as const;

export const AMENITY_OPTIONS = [
  "Wi-Fi",
  "Climatisation",
  "Parking",
  "Garage",
  "Piscine",
  "Jardin",
  "Terrasse",
  "Ascenseur",
  "Sécurité",
  "Fibre Internet",
  "Vue mer",
  "Cuisine équipée",
  "Meublé",
  "Balcon",
  "Cave",
] as const;

export type PriceUnit = "nuit" | "mois" | "jour" | "total";
export type TransactionType = "location" | "vente";

export const PRICE_UNITS: { value: PriceUnit; label: string }[] = [
  { value: "nuit", label: "Par nuit" },
  { value: "mois", label: "Par mois (longue durée)" },
  { value: "total", label: "Prix total (vente)" },
];

export const OFFER_PRESETS: {
  id: string;
  label: string;
  hint: string;
  transaction: TransactionType;
  priceUnit: PriceUnit;
  defaultType?: string;
}[] = [
  {
    id: "sejour",
    label: "Séjour / à la nuit",
    hint: "Hébergement court séjour",
    transaction: "location",
    priceUnit: "nuit",
  },
  {
    id: "longue",
    label: "Location longue durée",
    hint: "Bail mensuel",
    transaction: "location",
    priceUnit: "mois",
  },
  {
    id: "vente",
    label: "Vente",
    hint: "Bien à acheter",
    transaction: "vente",
    priceUnit: "total",
  },
];

export type PropertyStatus =
  | "pending"
  | "active"
  | "draft"
  | "on_hold"
  | "inactive"
  | "sold"
  | "rejected";

export const PROPERTY_STATUSES: { value: PropertyStatus | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "pending", label: "En attente" },
  { value: "active", label: "Publiés" },
  { value: "draft", label: "Brouillons" },
  { value: "on_hold", label: "En pause" },
  { value: "inactive", label: "Inactifs" },
  { value: "rejected", label: "Refusés" },
  { value: "sold", label: "Vendus" },
];

export type AgencyProperty = {
  id: string;
  name: string;
  city: string;
  commune: string;
  quartier: string;
  loc: string;
  price: number;
  priceUnit: PriceUnit;
  rating: string;
  badge: string | null;
  img: string;
  images: string[];
  description: string;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  surface: number;
  amenities: string[];
  host: string;
  agencyId: string;
  type: string;
  category: string;
  transaction: TransactionType;
  status: PropertyStatus;
  unavailableDates?: string[];
  createdAt: string;
};

export type PublishPropertyPayload = {
  name: string;
  type: string;
  category: string;
  transaction: TransactionType;
  city: string;
  commune: string;
  quartier: string;
  price: number;
  priceUnit: PriceUnit;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  surface: number;
  description: string;
  amenities: string[];
  images: string[];
  status?: PropertyStatus;
  host?: string;
  agencyId?: string;
};
