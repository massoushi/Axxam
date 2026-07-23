"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { roleLabel } from "@/lib/role-nav";

export default function UserAvatarMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!user) return null;

  const initial = (user.displayName || user.email || "?").charAt(0).toUpperCase();
  const avatarSrc = user.avatar || user.logo || null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--gold)] bg-[var(--navy-soft)] text-sm font-bold text-[var(--gold)] transition-transform hover:scale-105"
        aria-label="Mon profil"
      >
        {avatarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[60] w-60 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl">
          <div className="border-b border-black/5 px-4 py-3">
            <p className="truncate text-sm font-semibold text-[var(--navy)]">{user.displayName}</p>
            <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[var(--gold-deep)]">
              {roleLabel(user.role)}
            </p>
          </div>
          <div className="py-1 text-sm">
            {user.role === "admin" && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 font-medium text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Dashboard admin
                </Link>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Voir le site public
                </Link>
              </>
            )}

            {user.role === "client" && (
              <>
                <Link
                  href="/compte/reservations"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 font-medium text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Mes séjours
                </Link>
                <Link
                  href="/compte/factures"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Mes factures
                </Link>
                <Link
                  href="/favoris"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Mes favoris
                </Link>
                <Link
                  href="/messages"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Messages
                </Link>
                <Link
                  href="/compte/profil"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Mon profil
                </Link>
              </>
            )}

            {user.role === "owner" && (
              <>
                <Link
                  href="/proprietaire"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 font-medium text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Espace propriétaire
                </Link>
                <Link
                  href="/proprietaire/publier"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Publier un bien
                </Link>
                <Link
                  href="/proprietaire/reservations"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Réservations
                </Link>
                <Link
                  href="/proprietaire/revenus"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Revenus
                </Link>
                <Link
                  href="/messages"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Messages
                </Link>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--muted)] hover:bg-[var(--surface)]"
                >
                  Voir le site
                </Link>
              </>
            )}

            {user.role === "agency" && (
              <>
                <Link
                  href="/agence"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 font-medium text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/agence/biens"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Biens
                </Link>
                <Link
                  href="/agence/clients"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Clients
                </Link>
                <Link
                  href="/agence/publier"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Ajouter un bien
                </Link>
                <Link
                  href="/agence/reservations"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Réservations
                </Link>
                <Link
                  href="/agence/finances"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Finances
                </Link>
                <Link
                  href="/agence/equipe"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Équipe
                </Link>
                <Link
                  href="/agence/proprietaires"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Propriétaires
                </Link>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--muted)] hover:bg-[var(--surface)]"
                >
                  Voir le site
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="block w-full border-t border-black/5 px-4 py-2.5 text-left text-red-600 hover:bg-red-50"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
