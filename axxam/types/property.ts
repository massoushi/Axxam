export type CategoryIconId =
  | "villa"
  | "sea"
  | "pool"
  | "panorama"
  | "riad"
  | "mountain"
  | "luxury"
  | "business";

export type Category = {
  label: string;
  icon: CategoryIconId;
};

export type AvailabilitySlot = {
  start: string;
  end: string;
};

export type Review = {
  name: string;
  date: string;
  rating: number;
  text: string;
};

export type Property = {
  id: string;
  name: string;
  loc: string;
  dates: string;
  price: string;
  total: string;
  rating: string;
  badge: string | null;
  img: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  amenities: string[];
  host: string;
  hostImage: string;
  availability: AvailabilitySlot[];
  /** Jours ISO YYYY-MM-DD non disponibles */
  unavailableDates?: string[];
  images: string[];
  reviews: Review[];
};

export type ListingSection = {
  title: string;
  listings: Property[];
};

export type Feature = {
  title: string;
  desc: string;
};
