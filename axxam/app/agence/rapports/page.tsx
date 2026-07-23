"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAgencyStats } from "@/lib/api";
import type { AgencyStats } from "@/types/agency-crm";

export default function AgencyReportsPage() {
  const [stats, setStats] = useState<AgencyStats | null>(null);

  useEffect(() => {
    void fetchAgencyStats()
      .then((r) => setStats(r.data))
      .catch(() => setStats(null));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--navy)]">Rapports</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Vue consolidée de l&apos;activité</p>
      </div>

      {!stats ? (
        <p className="text-sm text-[var(--muted)]">Chargement...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Biens", stats.kpis.properties, "/agence/biens"],
            ["Clients", stats.kpis.clients, "/agence/clients"],
            ["Propriétaires", stats.kpis.owners, "/agence/proprietaires"],
            ["Contrats actifs", stats.kpis.activeContracts, "/agence/contrats"],
            ["Taux d'occupation", `${stats.kpis.occupancyRate}%`, "/agence/biens"],
            ["Revenus du mois", `${Math.round(stats.kpis.revenueMonth).toLocaleString("fr-DZ")} DA`, "/agence/comptabilite"],
            ["Reste à encaisser", `${Math.round(stats.kpis.outstanding).toLocaleString("fr-DZ")} DA`, "/agence/paiements"],
            ["Réservations aujourd'hui", stats.kpis.bookingsToday, "/agence/reservations"],
            ["Conversations", stats.kpis.unreadMessages, "/agence/messages"],
          ].map(([label, value, href]) => (
            <Link
              key={String(label)}
              href={String(href)}
              className="rounded-2xl border border-[var(--sand)] bg-white p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">{label}</p>
              <p className="mt-2 font-display text-3xl font-semibold text-[var(--navy)]">{value}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
