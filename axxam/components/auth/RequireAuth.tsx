"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import type { UserRole } from "@/types/auth";

type RequireAuthProps = {
  roles: UserRole[];
  children: React.ReactNode;
};

export default function RequireAuth({ roles, children }: RequireAuthProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--muted)]">
        Vérification de la session...
      </div>
    );
  }

  if (!user) return null;

  if (!roles.includes(user.role)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl text-[var(--navy)]">Accès refusé</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Ce espace est réservé à un autre type de compte.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-lg bg-[var(--navy)] px-4 py-2 text-sm text-white">
            Accueil
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="rounded-lg border border-black/10 px-4 py-2 text-sm"
          >
            Changer de compte
          </button>
        </div>
      </div>
    );
  }

  if (user.role === "agency" && user.status === "pending") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--gold-deep)]">
          Agence
        </p>
        <h1 className="mt-2 font-display text-3xl text-[var(--navy)]">Compte en validation</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Votre agence <strong>{user.agencyName}</strong> est enregistrée. Un administrateur doit
          valider le compte avant que vous puissiez publier des annonces.
        </p>
        <Link href="/" className="mt-6 inline-flex rounded-lg bg-[var(--gold)] px-5 py-2.5 text-xs font-bold uppercase text-white">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
