export type AgencyNavItem = {
  href: string;
  label: string;
  icon: string;
  match: (pathname: string) => boolean;
  badge?: "messages";
};

export const AGENCY_SHELL_NAV: AgencyNavItem[] = [
  {
    href: "/agence",
    label: "Tableau de bord",
    icon: "dashboard",
    match: (p) => p === "/agence",
  },
  {
    href: "/agence/biens",
    label: "Biens",
    icon: "home",
    match: (p) => p.startsWith("/agence/biens") || p.startsWith("/agence/publier"),
  },
  {
    href: "/agence/proprietaires",
    label: "Propriétaires",
    icon: "owners",
    match: (p) => p.startsWith("/agence/proprietaires"),
  },
  {
    href: "/agence/clients",
    label: "Clients",
    icon: "clients",
    match: (p) => p.startsWith("/agence/clients"),
  },
  {
    href: "/agence/contrats",
    label: "Contrats",
    icon: "contract",
    match: (p) => p.startsWith("/agence/contrats"),
  },
  {
    href: "/agence/paiements",
    label: "Paiements",
    icon: "payment",
    match: (p) => p.startsWith("/agence/paiements"),
  },
  {
    href: "/agence/reservations",
    label: "Réservations",
    icon: "calendar",
    match: (p) => p.startsWith("/agence/reservations"),
  },
  {
    href: "/agence/comptabilite",
    label: "Comptabilité",
    icon: "accounting",
    match: (p) => p.startsWith("/agence/comptabilite"),
  },
  {
    href: "/agence/documents",
    label: "Documents",
    icon: "docs",
    match: (p) => p.startsWith("/agence/documents"),
  },
  {
    href: "/agence/messages",
    label: "Messages",
    icon: "message",
    match: (p) => p.startsWith("/agence/messages") || p.startsWith("/messages"),
    badge: "messages",
  },
  {
    href: "/agence/taches",
    label: "Tâches",
    icon: "tasks",
    match: (p) => p.startsWith("/agence/taches"),
  },
  {
    href: "/agence/equipe",
    label: "Employés",
    icon: "team",
    match: (p) => p.startsWith("/agence/equipe"),
  },
  {
    href: "/agence/rapports",
    label: "Rapports",
    icon: "reports",
    match: (p) => p.startsWith("/agence/rapports"),
  },
  {
    href: "/agence/parametres",
    label: "Paramètres",
    icon: "settings",
    match: (p) => p.startsWith("/agence/parametres"),
  },
];

export function AgencyNavIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" />
        </svg>
      );
    case "owners":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
          <path d="M16 11a3 3 0 110-6" />
          <path d="M19 19c0-2.2-1.5-3.8-3.5-4.5" />
        </svg>
      );
    case "clients":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" />
        </svg>
      );
    case "contract":
      return (
        <svg {...common}>
          <path d="M7 3h8l4 4v14a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
          <path d="M15 3v4h4M9 12h6M9 16h4" />
        </svg>
      );
    case "payment":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18M7 15h3" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );
    case "accounting":
      return (
        <svg {...common}>
          <path d="M4 19V5M4 19h16M8 15l3-4 3 2 4-6" />
        </svg>
      );
    case "docs":
      return (
        <svg {...common}>
          <path d="M4 6a2 2 0 012-2h5l2 2h7a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M4 6h16v10H8l-4 3V6z" />
        </svg>
      );
    case "tasks":
      return (
        <svg {...common}>
          <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
      );
    case "team":
      return (
        <svg {...common}>
          <circle cx="8" cy="9" r="3" />
          <circle cx="16" cy="9" r="3" />
          <path d="M2 19c0-2.5 2.5-4 6-4s6 1.5 6 4M12 19c0-2 1.8-3.5 4.5-3.8" />
        </svg>
      );
    case "reports":
      return (
        <svg {...common}>
          <path d="M5 19V9M10 19V5M15 19v-7M20 19v-4" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
