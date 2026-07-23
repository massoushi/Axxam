import type { UserRole } from "@/types/auth";

export type NavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
};

/** Navigation publique (visiteur) */
export const GUEST_NAV: NavItem[] = [
  { href: "/", label: "Accueil", match: (p) => p === "/" },
  {
    href: "/hebergements",
    label: "Hébergements",
    match: (p) => p.startsWith("/hebergements"),
  },
  {
    href: "/immobilier",
    label: "Ventes",
    match: (p) => p.startsWith("/immobilier"),
  },
];

/** Voyageur / client */
export const CLIENT_NAV: NavItem[] = [
  { href: "/", label: "Accueil", match: (p) => p === "/" },
  {
    href: "/hebergements",
    label: "Hébergements",
    match: (p) => p.startsWith("/hebergements"),
  },
  {
    href: "/immobilier",
    label: "Ventes",
    match: (p) => p.startsWith("/immobilier"),
  },
  {
    href: "/favoris",
    label: "Favoris",
    match: (p) => p.startsWith("/favoris"),
  },
  {
    href: "/compte/reservations",
    label: "Mes séjours",
    match: (p) => p.startsWith("/compte"),
  },
];

/** Propriétaire */
export const OWNER_NAV: NavItem[] = [
  {
    href: "/proprietaire",
    label: "Tableau de bord",
    match: (p) => p === "/proprietaire" || p === "/proprietaire/annonces",
  },
  {
    href: "/proprietaire/publier",
    label: "Publier",
    match: (p) => p.startsWith("/proprietaire/publier"),
  },
  {
    href: "/proprietaire/reservations",
    label: "Réservations",
    match: (p) => p.startsWith("/proprietaire/reservations"),
  },
  {
    href: "/proprietaire/revenus",
    label: "Revenus",
    match: (p) => p.startsWith("/proprietaire/revenus"),
  },
  {
    href: "/messages",
    label: "Messages",
    match: (p) => p.startsWith("/messages"),
  },
];

/** Agence */
export const AGENCY_NAV: NavItem[] = [
  {
    href: "/agence",
    label: "Dashboard",
    match: (p) => p === "/agence",
  },
  {
    href: "/agence/biens",
    label: "Biens",
    match: (p) => p.startsWith("/agence/biens") || p.startsWith("/agence/publier"),
  },
  {
    href: "/agence/clients",
    label: "Clients",
    match: (p) => p.startsWith("/agence/clients"),
  },
  {
    href: "/agence/contrats",
    label: "Contrats",
    match: (p) => p.startsWith("/agence/contrats"),
  },
  {
    href: "/agence/paiements",
    label: "Paiements",
    match: (p) => p.startsWith("/agence/paiements"),
  },
  {
    href: "/agence/reservations",
    label: "Réservations",
    match: (p) => p.startsWith("/agence/reservations"),
  },
  {
    href: "/agence/equipe",
    label: "Équipe",
    match: (p) => p.startsWith("/agence/equipe"),
  },
  {
    href: "/agence/messages",
    label: "Messages",
    match: (p) => p.startsWith("/agence/messages") || p.startsWith("/messages"),
  },
];

/** Admin */
export const ADMIN_NAV: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    match: (p) => p.startsWith("/admin"),
  },
  {
    href: "/",
    label: "Voir le site",
    match: (p) => p === "/",
  },
];

export function navForRole(role?: UserRole | null): NavItem[] {
  switch (role) {
    case "client":
      return CLIENT_NAV;
    case "owner":
      return OWNER_NAV;
    case "agency":
      return AGENCY_NAV;
    case "admin":
      return ADMIN_NAV;
    default:
      return GUEST_NAV;
  }
}

export function homeHrefForRole(role?: UserRole | null): string {
  switch (role) {
    case "client":
      return "/";
    case "owner":
      return "/proprietaire";
    case "agency":
      return "/agence";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}

export function roleLabel(role?: UserRole | null): string {
  switch (role) {
    case "client":
      return "Voyageur";
    case "owner":
      return "Propriétaire";
    case "agency":
      return "Agence";
    case "admin":
      return "Administrateur";
    default:
      return "Visiteur";
  }
}
