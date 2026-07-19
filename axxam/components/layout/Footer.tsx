"use client";

import Link from "next/link";
import Logo from "@/components/layout/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { dashboardPathForRole } from "@/lib/auth-storage";

export default function Footer() {
  const { user, loading, logout } = useAuth();

  const axxamLinks = (() => {
    if (loading) return [];

    if (!user) {
      return [
        { label: "Espace agence", href: "/agence" },
        { label: "Connexion", href: "/login" },
        { label: "Créer un compte", href: "/register" },
      ];
    }

    const links: { label: string; href: string; onClick?: () => void }[] = [];

    if (user.role === "client") {
      links.push({ label: "Mon espace", href: "/compte/reservations" });
      links.push({ label: "Mon profil", href: "/compte/profil" });
    } else if (user.role === "agency") {
      links.push({ label: "Espace agence", href: "/agence" });
    } else if (user.role === "owner") {
      links.push({ label: "Espace propriétaire", href: "/proprietaire" });
    } else if (user.role === "admin") {
      links.push({ label: "Espace admin", href: "/admin" });
    } else {
      links.push({ label: "Mon tableau de bord", href: dashboardPathForRole(user.role) });
    }

    links.push({ label: "Déconnexion", href: "#", onClick: () => logout() });

    return links;
  })();

  const columns = [
    {
      title: "Assistance",
      links: [
        { label: "Centre d'aide", href: "/messages" },
        { label: "Signaler un problème", href: "/messages" },
        { label: "Contact", href: "/messages" },
      ],
    },
    {
      title: "Hébergement",
      links: [
        {
          label: "Mettre son bien",
          href: user?.role === "agency" ? "/agence" : "/proprietaire",
        },
        { label: "Annonces", href: "/annonces" },
        { label: "Favoris", href: "/favoris" },
      ],
    },
    {
      title: "AXXAM",
      links: axxamLinks,
    },
  ];

  return (
    <footer className="mt-16 bg-[var(--navy)] text-white">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo height={64} />
            <p className="mt-5 max-w-[240px] text-sm leading-relaxed text-white/50">
              La plateforme immobilière & hébergement de référence en Algérie.
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
                    {"onClick" in link && link.onClick ? (
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
            <span className="cursor-default">Confidentialité</span>
            <span className="cursor-default">Conditions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
