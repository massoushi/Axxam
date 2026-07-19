"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { dashboardPathForRole } from "@/lib/auth-storage";

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
  const profileHref =
    user.role === "client" ? "/compte/profil" : dashboardPathForRole(user.role);

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
        <div className="absolute right-0 top-12 z-[60] w-56 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl">
          <div className="border-b border-black/5 px-4 py-3">
            <p className="truncate text-sm font-semibold text-[var(--navy)]">{user.displayName}</p>
            <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
          </div>
          <div className="py-1 text-sm">
            {user.role === "client" && (
              <>
                <Link
                  href="/compte/profil"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Mon profil
                </Link>
                <Link
                  href="/compte/reservations"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Mes réservations
                </Link>
                <Link
                  href="/favoris"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
                >
                  Mes favoris
                </Link>
              </>
            )}
            {user.role !== "client" && (
              <Link
                href={profileHref}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
              >
                Mon espace
              </Link>
            )}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[var(--navy)] hover:bg-[var(--surface)]"
            >
              Accueil
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="block w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
