"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/layout/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { AGENCY_SHELL_NAV, AgencyNavIcon } from "@/lib/agency-nav";
import AgencyTopbar from "@/components/agency/shell/AgencyTopbar";

export default function AgencyShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/agence";
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const nav = (
    <>
      <div className="flex items-center gap-3 px-5 py-5">
        <Logo size={40} href="/agence" onDark />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">AXXAM</p>
          <p className="truncate text-[10px] uppercase tracking-wider text-[var(--sand)]/80">
            Agence Immobilière
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {AGENCY_SHELL_NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-[var(--gold)] text-white shadow-[var(--shadow-gold)]"
                  : "text-white/65 hover:bg-white/8 hover:text-white"
              }`}
            >
              <AgencyNavIcon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--gold)]/20 text-sm font-bold text-[var(--gold-soft)] ring-2 ring-[var(--gold)]/40">
            {user?.avatar || user?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar || user.logo || ""} alt="" className="h-full w-full object-cover" />
            ) : (
              (user?.displayName || "?").charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.displayName}</p>
            <p className="truncate text-[10px] text-white/45">Admin Agence</p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/50 hover:bg-white/10 hover:text-white"
            title="Déconnexion"
          >
            Quitter
          </button>
        </div>
        <Link
          href="/"
          className="mt-3 block text-center text-[11px] text-white/40 hover:text-[var(--sand)]"
        >
          Voir le site public →
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#f3eee6]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col bg-[var(--navy)] lg:flex">
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[var(--navy)] shadow-2xl lg:hidden">
            {nav}
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AgencyTopbar onMenu={() => setOpen(true)} />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
