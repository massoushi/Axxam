"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import NotificationsBell from "@/components/layout/NotificationsBell";

type AgencyTopbarProps = {
  onMenu: () => void;
};

export default function AgencyTopbar({ onMenu }: AgencyTopbarProps) {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const firstName = (user?.displayName || "Agence").split(" ")[0];

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--sand)]/70 bg-[#f3eee6]/90 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--navy)]/10 bg-white text-[var(--navy)] lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-semibold text-[var(--navy)] sm:text-2xl">
            Bonjour, {firstName}
          </h1>
          <p className="hidden text-sm text-[var(--muted)] sm:block">
            Voici ce qui se passe aujourd&apos;hui dans votre agence.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) window.location.href = `/agence/biens?q=${encodeURIComponent(q.trim())}`;
          }}
          className="hidden md:block"
        >
          <label className="relative block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher..."
              className="w-56 rounded-full border border-[var(--navy)]/8 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 lg:w-72"
            />
          </label>
        </form>

        <Link
          href="/agence/publier"
          className="hidden rounded-full bg-[var(--gold)] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white shadow-[var(--shadow-gold)] sm:inline-flex"
        >
          Publier
        </Link>

        <div className="agency-notif-light">
          <NotificationsBell />
        </div>
      </div>
    </header>
  );
}
