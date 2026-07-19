export const PROPERTY_TYPES = [
  { value: "appartement", label: "Appartement" },
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "maison", label: "Maison / Riad" },
  { value: "duplex", label: "Duplex" },
  { value: "immeuble", label: "Immeuble" },
  { value: "terrain", label: "Terrain" },
  { value: "local-commercial", label: "Local commercial" },
  { value: "bureau", label: "Bureau" },
] as const;

export const PROPERTY_CATEGORIES = [
  { value: "bord-de-mer", label: "Bord de mer" },
  { value: "piscine-privee", label: "Piscine privée" },
  { value: "vue-panoramique", label: "Vue panoramique" },
  { value: "design-luxe", label: "Design & Luxe" },
  { value: "montagne", label: "Montagne" },
  { value: "affaires", label: "Séjour d'affaires" },
  { value: "famille", label: "Famille" },
  { value: "autre", label: "Autre" },
] as const;

export const ALGERIAN_CITIES = [
  "Alger",
  "Oran",
  "Constantine",
  "Annaba",
  "Blida",
  "Batna",
  "Sétif",
  "Sidi Bel Abbès",
  "Biskra",
  "Tébessa",
  "Tlemcen",
  "Béjaïa",
  "Tizi Ouzou",
  "Ouargla",
  "Skikda",
  "Mostaganem",
  "Tipaza",
  "Boumerdès",
  "Jijel",
  "Ghardaïa",
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

export type PriceUnit = "nuit" | "mois";
export type TransactionType = "location" | "vente";
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
