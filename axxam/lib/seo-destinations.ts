export type SeoDestination = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  city: string;
  type?: string;
  category?: string;
  keywords: string;
};

/** Pages SEO locales — trafic organique type « Villa Tipaza », « Location Alger Hydra ». */
export const SEO_DESTINATIONS: SeoDestination[] = [
  {
    slug: "villa-tipaza",
    title: "Villa Tipaza à louer | AXXAM",
    h1: "Villas à Tipaza",
    description:
      "Louez une villa à Tipaza pour vos vacances : vue mer, piscine, séjour en famille. Réservation sur AXXAM — paiement chez l'hôte.",
    city: "Tipaza",
    type: "villa",
    keywords: "villa tipaza, location tipaza, séjour tipaza",
  },
  {
    slug: "location-alger-hydra",
    title: "Location Alger Hydra | Appartements & villas | AXXAM",
    h1: "Location à Alger — Hydra",
    description:
      "Appartements et villas à Hydra (Alger) pour la nuit ou le mois. Annonces vérifiées, demande de réservation simple sur AXXAM.",
    city: "Alger",
    keywords: "location alger hydra, appartement hydra, villa alger",
  },
  {
    slug: "appartement-oran",
    title: "Appartement Oran à louer | AXXAM",
    h1: "Appartements à Oran",
    description:
      "Studios et appartements à Oran pour un week-end ou un déplacement pro. Front de mer, Canastel et centre-ville.",
    city: "Oran",
    type: "studio",
    keywords: "appartement oran, location oran, studio oran",
  },
  {
    slug: "villa-alger-zeralda",
    title: "Villa Zeralda Alger | Location nuit | AXXAM",
    h1: "Villas à Zeralda (Alger)",
    description:
      "Villas avec piscine à Zeralda, proche plages ouest d'Alger. Idéal familles et groupes.",
    city: "Alger",
    type: "villa",
    category: "piscine-privee",
    keywords: "villa zeralda, location zeralda, piscine alger",
  },
  {
    slug: "maison-bejaia-tichy",
    title: "Maison Tichy Béjaïa | AXXAM",
    h1: "Maisons à Tichy — Béjaïa",
    description:
      "Maisons et séjours kabyles à Tichy, Béjaïa. Bord de mer et montagne.",
    city: "Béjaïa",
    type: "maison",
    keywords: "location tichy, maison béjaïa, séjour kabylie",
  },
  {
    slug: "location-annaba",
    title: "Location Annaba | Maisons & villas | AXXAM",
    h1: "Séjours à Annaba",
    description:
      "Maisons de plage et villas à Annaba (Sidi Achour). Réservez votre nuitée sur AXXAM.",
    city: "Annaba",
    keywords: "location annaba, villa annaba, plage sidi achour",
  },
  {
    slug: "chalet-tikjda",
    title: "Chalet Tikjda Bouira | Montagne | AXXAM",
    h1: "Chalets à Tikjda",
    description:
      "Chalets et maisons de montagne à Tikjda (Bouira). Hiver et randonnées d'été.",
    city: "Bouira",
    category: "montagne",
    keywords: "chalet tikjda, location tikjda, montagne algérie",
  },
  {
    slug: "villa-skikda",
    title: "Villa Skikda corniche | AXXAM",
    h1: "Villas à Skikda",
    description:
      "Villas vue mer à Skikda et Stora. Piscine, jardin, séjour Méditerranée.",
    city: "Skikda",
    type: "villa",
    keywords: "villa skikda, location skikda, corniche skikda",
  },
];

export function getSeoDestination(slug: string) {
  return SEO_DESTINATIONS.find((d) => d.slug === slug) || null;
}
