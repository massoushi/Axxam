"use client";

import Link from "next/link";
import Logo from "@/components/layout/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { dashboardPathForRole } from "@/lib/auth-storage";
import { roleLabel } from "@/lib/role-nav";

type FooterLink = {
  label: string;
  href: string;
  onClick?: () => void;
};

export default function Footer() {
  const { user, loading, logout } = useAuth();

  const axxamLinks = ((): FooterLink[] => {
    if (loading) return [];

    if (!user) {
      return [
        { label: "Connexion", href: "/login" },
        { label: "Créer un compte", href: "/register" },
        { label: "Devenir hôte", href: "/register" },
      ];
    }

    const links: FooterLink[] = [
      {
        label: `Mon espace (${roleLabel(user.role)})`,
        href: dashboardPathForRole(user.role),
      },
    ];

    if (user.role === "client") {
      links.push({ label: "Mes réservations", href: "/compte/reservations" });
      links.push({ label: "Favoris", href: "/favoris" });
    }
    if (user.role === "owner") {
      links.push({ label: "Publier", href: "/proprietaire/publier" });
      links.push({ label: "Revenus", href: "/proprietaire/revenus" });
    }
    if (user.role === "agency") {
      links.push({ label: "Équipe", href: "/agence/equipe" });
      links.push({ label: "Finances", href: "/agence/finances" });
    }
    if (user.role === "admin") {
      links.push({ label: "Modération", href: "/admin" });
    }

    links.push({ label: "Déconnexion", href: "#", onClick: () => logout() });
    return links;
  })();

  const hebergementLinks: FooterLink[] =
    user?.role === "client" || !user
      ? [
          { label: "Hébergements", href: "/hebergements" },
          { label: "Ventes", href: "/immobilier" },
          { label: "Annonces", href: "/annonces" },
        ]
      : user.role === "owner"
        ? [
            { label: "Mes biens", href: "/proprietaire" },
            { label: "Publier", href: "/proprietaire/publier" },
            { label: "Voir le site", href: "/" },
          ]
        : user.role === "agency"
          ? [
              { label: "Portefeuille", href: "/agence" },
              { label: "Publier", href: "/agence/publier" },
              { label: "Voir le site", href: "/" },
            ]
          : [
              { label: "Dashboard", href: "/admin" },
              { label: "Site public", href: "/" },
            ];

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: "Assistance",
      links: [
        { label: "Messages", href: "/messages" },
        { label: "Contact", href: "/messages" },
      ],
    },
    {
      title: user?.role === "client" || !user ? "Explorer" : "Gestion",
      links: hebergementLinks,
    },
    {
      title: "AXXAM",
      links: axxamLinks,
    },
  ];

  return (
    <footer className="mt-20 bg-[var(--navy)] text-white">
      <div className="h-1 bg-gradient-to-r from-[var(--gold-deep)] via-[var(--gold)] to-[var(--sand)]" />
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo size={72} onDark />
            <p className="mt-5 font-display text-xl tracking-[0.08em] text-white">
              ax<span className="text-[var(--gold)]">x</span>am
            </p>
            <p className="mt-3 max-w-[240px] text-sm leading-relaxed text-white/50">
              {user
                ? `Connecté en tant que ${roleLabel(user.role).toLowerCase()}.`
                : "La plateforme immobilière & hébergement de référence en Algérie."}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                {col.title}
              </h5>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.onClick ? (
                      <button
                        type="button"
                        onClick={link.onClick}
                        className="text-sm text-white/55 transition-colors hover:text-white"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-white/55 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-white/40 sm:flex-row sm:px-6">
          <span>© 2026 AXXAM. Tous droits réservés.</span>
          <div className="flex gap-5">
            <Link href="/qr" className="hover:text-white">
              QR code
            </Link>
            <Link href="/confidentialite" className="hover:text-white">
              Confidentialité
            </Link>
            <Link href="/conditions" className="hover:text-white">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
