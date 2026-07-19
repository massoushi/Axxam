"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/layout/Logo";
import Icon from "@/components/ui/Icon";
import NotificationsBell from "@/components/layout/NotificationsBell";
import UserAvatarMenu from "@/components/layout/UserAvatarMenu";
import { useAuth } from "@/components/auth/AuthProvider";

const navItems = [
  { href: "/", label: "Accueil", match: (p: string) => p === "/" },
  { href: "/annonces", label: "Hébergements", match: (p: string) => p.startsWith("/annonces") },
  { href: "/annonces", label: "Immobilier", match: () => false },
  { href: "/favoris", label: "Favoris", match: (p: string) => p.startsWith("/favoris") },
];

export default function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname() || "/";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[var(--navy)]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between gap-4">
          <Logo height={56} />

          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
            {navItems.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={
                    active
                      ? "text-white border-b border-[var(--gold)] pb-0.5"
                      : "hover:text-white transition-colors"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {(!user || user.role === "owner" || user.role === "agency") && (
              <Link
                href={user?.role === "agency" ? "/agence" : "/proprietaire"}
                className="hidden md:inline text-[11px] font-semibold tracking-wide text-white/80 hover:text-[var(--gold)] transition-colors"
              >
                Mettre mon bien
              </Link>
            )}

            <Link
              href="/favoris"
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              aria-label="Favoris"
            >
              <Icon className="w-4 h-4">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </Icon>
            </Link>

            {!loading && user ? (
              <>
                <NotificationsBell />
                <UserAvatarMenu />
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center rounded-full bg-[var(--gold)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--navy)] hover:bg-[var(--gold-soft)] transition-colors"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
