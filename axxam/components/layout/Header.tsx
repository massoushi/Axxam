"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/layout/Logo";
import Icon from "@/components/ui/Icon";
import NotificationsBell from "@/components/layout/NotificationsBell";
import UserAvatarMenu from "@/components/layout/UserAvatarMenu";
import { useAuth } from "@/components/auth/AuthProvider";
import { homeHrefForRole, navForRole, roleLabel } from "@/lib/role-nav";

export default function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname() || "/";
  const navItems = navForRole(user?.role);
  const homeHref = homeHrefForRole(user?.role);
  const isPro = user?.role === "owner" || user?.role === "agency" || user?.role === "admin";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[var(--navy)]">
      <div className="h-0.5 bg-gradient-to-r from-[var(--gold-deep)] via-[var(--gold)] to-[var(--sand)]" />
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3 sm:h-[4.5rem]">
          {/* Logo + badge rôle */}
          <div className="flex min-w-0 items-center gap-2.5">
            <Logo size={44} href={homeHref} onDark />
            <span className="hidden truncate font-display text-lg font-semibold tracking-[0.12em] text-white sm:inline">
              ax<span className="text-[var(--gold)]">x</span>am
            </span>
            {!loading && user && isPro && (
              <span className="hidden rounded-full border border-[var(--gold)]/50 bg-[var(--gold)]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--gold-soft)] md:inline">
                {roleLabel(user.role)}
              </span>
            )}
          </div>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-5 xl:gap-7 lg:flex text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
            {navItems.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={
                    active
                      ? "border-b border-[var(--gold)] pb-0.5 text-white"
                      : "transition-colors hover:text-white"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {!loading && !user && (
              <Link
                href="/register"
                className="hidden text-[11px] font-semibold tracking-wide text-white/80 transition-colors hover:text-[var(--gold)] md:inline"
              >
                Mettre mon bien
              </Link>
            )}

            {!loading && user?.role === "client" && (
              <Link
                href="/favoris"
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)] sm:flex sm:h-10 sm:w-10"
                aria-label="Favoris"
              >
                <Icon className="h-4 w-4">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </Icon>
              </Link>
            )}

            {!loading && user ? (
              <>
                {(user.role === "client" ||
                  user.role === "owner" ||
                  user.role === "agency") && (
                  <Link
                    href="/messages"
                    className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)] sm:flex sm:h-10 sm:w-10"
                    aria-label="Messages"
                  >
                    <Icon className="h-4 w-4">
                      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </Icon>
                  </Link>
                )}
                <NotificationsBell />
                <UserAvatarMenu />
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center rounded-full bg-[var(--gold)] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[var(--gold-deep)] sm:px-4 sm:py-2.5 sm:text-[11px]"
              >
                Connexion
              </Link>
            )}

            {/* Burger mobile / tablette */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)] lg:hidden sm:h-10 sm:w-10"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {menuOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Panneau mobile */}
      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            aria-label="Fermer le menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="mobile-nav"
            className="absolute inset-x-0 top-full z-50 border-b border-white/10 bg-[var(--navy)] shadow-2xl lg:hidden"
          >
            <nav className="container mx-auto flex max-h-[min(70vh,520px)] flex-col gap-1 overflow-y-auto px-4 py-4 sm:px-6">
              {navItems.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={`m-${item.href}-${item.label}`}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold tracking-wide transition-colors ${
                      active
                        ? "bg-[var(--gold)] text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="my-2 border-t border-white/10" />

              {!loading && !user && (
                <>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                  >
                    Mettre mon bien
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="mt-1 rounded-xl bg-[var(--gold)] px-4 py-3 text-center text-sm font-bold uppercase tracking-wider text-white"
                  >
                    Se connecter
                  </Link>
                </>
              )}

              {!loading && user && (
                <>
                  {user.role === "client" && (
                    <Link
                      href="/favoris"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 sm:hidden"
                    >
                      Favoris
                    </Link>
                  )}
                  {(user.role === "client" ||
                    user.role === "owner" ||
                    user.role === "agency") && (
                    <Link
                      href="/messages"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 sm:hidden"
                    >
                      Messages
                    </Link>
                  )}
                  {isPro && (
                    <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--gold-soft)]">
                      Espace {roleLabel(user.role)}
                    </p>
                  )}
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
