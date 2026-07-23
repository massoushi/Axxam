"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import NotificationsBell from "@/components/layout/NotificationsBell";
import { ADMIN_SHELL_NAV } from "@/lib/admin-nav";

export default function AdminTopbar({ onMenu }: { onMenu: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname() || "/admin";
  const [q, setQ] = useState("");

  const current = useMemo(
    () => ADMIN_SHELL_NAV.find((item) => item.match(pathname)) || ADMIN_SHELL_NAV[0],
    [pathname]
  );

  const subtitle =
    pathname === "/admin"
      ? "Vue d'ensemble de la plateforme AXXAM"
      : "Administration Générale";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--sand)]/70 bg-[#f3eee6]/90 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--navy)]/10 bg-white text-[var(--navy)] lg:hidden"
          aria-label="Menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-semibold text-[var(--navy)] sm:text-2xl">
            {current.label}
          </h1>
          <p className="hidden text-sm text-[var(--muted)] sm:block">{subtitle}</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) window.location.href = `/admin/utilisateurs?q=${encodeURIComponent(q.trim())}`;
          }}
          className="hidden md:block"
        >
          <label className="relative block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher..."
              className="w-52 rounded-full border border-[var(--navy)]/8 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[var(--gold)] lg:w-64"
            />
          </label>
        </form>

        <div className="agency-notif-light">
          <NotificationsBell />
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--navy)] text-xs font-bold text-[var(--sand)]">
            {(user?.displayName || "A").charAt(0).toUpperCase()}
          </div>
          <span className="max-w-[120px] truncate text-sm font-semibold text-[var(--navy)]">
            {user?.displayName || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
