"use client";

import Link from "next/link";
import PropertyPublishForm from "@/components/agency/PropertyPublishForm";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AgencePublierPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/agence"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] hover:text-[var(--navy)] transition-colors"
        >
          ← Retour au tableau de bord
        </Link>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-[var(--navy)]">
          Publier un bien
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          L&apos;annonce sera validée par un admin avant d&apos;apparaître sur l&apos;accueil.
        </p>
      </div>

      <PropertyPublishForm
        mode="agency"
        host={user.agencyName || user.displayName}
        agencyId={user.id}
      />
    </div>
  );
}
