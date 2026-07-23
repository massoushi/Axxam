export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  match: (pathname: string) => boolean;
};

export const ADMIN_SHELL_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Tableau de bord", icon: "dashboard", match: (p) => p === "/admin" },
  { href: "/admin/agences", label: "Agences", icon: "team", match: (p) => p.startsWith("/admin/agences") },
  {
    href: "/admin/utilisateurs",
    label: "Utilisateurs",
    icon: "clients",
    match: (p) => p.startsWith("/admin/utilisateurs"),
  },
  {
    href: "/admin/proprietaires",
    label: "Propriétaires",
    icon: "owners",
    match: (p) => p.startsWith("/admin/proprietaires"),
  },
  {
    href: "/admin/clients",
    label: "Clients",
    icon: "clients",
    match: (p) => p.startsWith("/admin/clients"),
  },
  {
    href: "/admin/biens",
    label: "Biens",
    icon: "home",
    match: (p) => p.startsWith("/admin/biens"),
  },
  {
    href: "/admin/reservations",
    label: "Réservations",
    icon: "calendar",
    match: (p) => p.startsWith("/admin/reservations"),
  },
  {
    href: "/admin/contrats",
    label: "Contrats",
    icon: "contract",
    match: (p) => p.startsWith("/admin/contrats"),
  },
  {
    href: "/admin/paiements",
    label: "Paiements",
    icon: "payment",
    match: (p) => p.startsWith("/admin/paiements"),
  },
  {
    href: "/admin/abonnements",
    label: "Abonnements",
    icon: "reports",
    match: (p) => p.startsWith("/admin/abonnements"),
  },
  {
    href: "/admin/commissions",
    label: "Commissions",
    icon: "accounting",
    match: (p) => p.startsWith("/admin/commissions"),
  },
  {
    href: "/admin/reclamations",
    label: "Réclamations",
    icon: "message",
    match: (p) => p.startsWith("/admin/reclamations"),
  },
  {
    href: "/admin/contenu",
    label: "Contenu du site",
    icon: "docs",
    match: (p) => p.startsWith("/admin/contenu"),
  },
  {
    href: "/admin/statistiques",
    label: "Statistiques",
    icon: "reports",
    match: (p) => p.startsWith("/admin/statistiques"),
  },
  {
    href: "/admin/parametres",
    label: "Paramètres",
    icon: "settings",
    match: (p) => p.startsWith("/admin/parametres"),
  },
  {
    href: "/admin/journal",
    label: "Journal d'activité",
    icon: "tasks",
    match: (p) => p.startsWith("/admin/journal"),
  },
];
