"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

const PLANS = [
  { id: "free", name: "Gratuit", limit: "10 biens · 1 utilisateur", price: "0 DA" },
  { id: "starter", name: "Starter", limit: "50 biens · 3 utilisateurs", price: "4 900 DA/mois" },
  { id: "pro", name: "Pro", limit: "Illimité · CRM complet", price: "9 900 DA/mois" },
  { id: "business", name: "Business", limit: "Multi-agences · API", price: "19 900 DA/mois" },
  { id: "enterprise", name: "Enterprise", limit: "Sur mesure", price: "Sur devis" },
];

export default function AgencySettingsPage() {
  const { user } = useAuth();
  const current = user?.subscriptionPlan || "free";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--navy)]">Paramètres</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Agence · abonnement · préférences</p>
      </div>

      <section className="rounded-2xl border border-[var(--sand)] bg-white p-5 shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-xl font-semibold text-[var(--navy)]">Profil agence</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--muted)]">Nom</dt>
            <dd className="font-semibold text-[var(--navy)]">{user?.agencyName || user?.displayName}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Email</dt>
            <dd className="font-semibold text-[var(--navy)]">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Téléphone</dt>
            <dd className="font-semibold text-[var(--navy)]">{user?.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Plan actuel</dt>
            <dd className="font-semibold capitalize text-[var(--gold-deep)]">{current}</dd>
          </div>
        </dl>
        <Link href="/compte/profil" className="mt-4 inline-block text-sm font-semibold text-[var(--gold-deep)] underline">
          Modifier le profil
        </Link>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-[var(--navy)]">Abonnements</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border p-5 ${
                current === p.id || (current === "pro" && p.id === "pro")
                  ? "border-[var(--gold)] bg-[var(--gold)]/5 shadow-[var(--shadow-gold)]"
                  : "border-[var(--sand)] bg-white"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--gold-deep)]">{p.name}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-[var(--navy)]">{p.price}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{p.limit}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
