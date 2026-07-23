"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchAdminStats } from "@/lib/api";
import type { AdminStats } from "@/types/admin";
import { Panel, StatCard, StatusBadge } from "@/components/agency/ui/AgencyUi";

function formatDz(n: number) {
  return `${Math.round(n).toLocaleString("fr-DZ")} DA`;
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h} h`;
  return `Il y a ${Math.floor(h / 24)} j`;
}

const PIE_COLORS = ["#ded0b6", "#c8794a", "#a65126", "#2f2f2e"];

const ACTIVITY_DOT: Record<string, string> = {
  agency: "bg-sky-500",
  property: "bg-emerald-500",
  payment: "bg-[var(--gold)]",
  booking: "bg-violet-500",
  claim: "bg-red-500",
};

export default function AdminHomeDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchAdminStats();
        if (!cancelled) {
          setStats(res.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erreur stats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="axxam-skeleton h-28" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error || "Impossible de charger le tableau de bord"}
      </div>
    );
  }

  const { kpis } = stats;
  const subData = stats.subscriptions.filter((s) => s.count > 0 || s.id === "free" || s.id === "pro");
  const lastRevenue = stats.revenueSeries[stats.revenueSeries.length - 1];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Agences totales"
          value={String(kpis.agencies)}
          hint={`${kpis.agenciesActive} actives`}
        />
        <StatCard
          label="Utilisateurs"
          value={kpis.users.toLocaleString("fr-DZ")}
          hint={`${kpis.clients} clients`}
          hintTone="neutral"
        />
        <StatCard
          label="Biens en ligne"
          value={kpis.propertiesOnline.toLocaleString("fr-DZ")}
          hint={`${kpis.propertiesPending} en attente`}
          hintTone={kpis.propertiesPending > 0 ? "bad" : "good"}
        />
        <StatCard
          label="Réservations"
          value={kpis.bookings.toLocaleString("fr-DZ")}
          hint={`${kpis.bookingsMonth} ce mois`}
        />
        <StatCard label="Revenus (mois)" value={formatDz(kpis.revenueMonth)} />
        <StatCard label="Commissions" value={formatDz(kpis.commissionsMonth)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel title="Évolution des revenus" href="/admin/statistiques" className="lg:col-span-5">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="text-sm text-[var(--muted)]">GMV + frais plateforme</p>
            {lastRevenue && (
              <p className="font-display text-lg font-semibold text-[var(--navy)]">
                {formatDz(lastRevenue.revenue)}
              </p>
            )}
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueSeries}>
                <defs>
                  <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a65126" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#a65126" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => formatDz(Number(v ?? 0))}
                  contentStyle={{ borderRadius: 12, borderColor: "#ded0b6" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#a65126"
                  strokeWidth={2.5}
                  fill="url(#adminRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Répartition des biens par wilaya" href="/admin/biens" className="lg:col-span-4">
          {stats.cities.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--muted)]">Aucune donnée</p>
          ) : (
            <ul className="space-y-3">
              {stats.cities.map((c) => (
                <li key={c.city}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-[var(--navy)]">{c.city}</span>
                    <span className="text-[var(--muted)]">
                      {c.pct}% · {c.count}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--sand-soft)]">
                    <div
                      className="h-full rounded-full bg-[var(--gold)]"
                      style={{ width: `${Math.max(c.pct, 4)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Activité en temps réel" className="lg:col-span-3">
          <ul className="space-y-3">
            {stats.activity.length === 0 && (
              <li className="py-6 text-center text-sm text-[var(--muted)]">Aucune activité récente</li>
            )}
            {stats.activity.map((a, i) => (
              <li key={`${a.type}-${i}`} className="flex gap-3">
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${ACTIVITY_DOT[a.type] || "bg-slate-400"}`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--navy)]">{a.title}</p>
                  <p className="truncate text-xs text-[var(--muted)]">{a.detail}</p>
                  <p className="mt-0.5 text-[10px] text-[var(--muted)]">{relTime(a.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel title="Agences récentes" href="/admin/agences" className="lg:col-span-7">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--sand)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                  <th className="pb-2 font-semibold">Agence</th>
                  <th className="pb-2 font-semibold">Wilaya</th>
                  <th className="pb-2 font-semibold">Biens</th>
                  <th className="pb-2 font-semibold">Abonnement</th>
                  <th className="pb-2 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAgencies.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--sand)]/60 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--navy)] text-[10px] font-bold text-[var(--sand)]">
                          {(a.agencyName || a.displayName || "A").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[var(--navy)]">
                            {a.agencyName || a.displayName}
                          </p>
                          <p className="truncate text-[11px] text-[var(--muted)]">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[var(--muted)]">{a.wilaya || "—"}</td>
                    <td className="py-3 font-medium text-[var(--navy)]">{a.propertyCount}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-[var(--sand-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--navy)]">
                        {a.subscriptionPlan === "pro" ? "Pro" : "Gratuit"}
                      </span>
                    </td>
                    <td className="py-3">
                      <StatusBadge
                        status={a.status === "active" ? "paid" : a.status === "pending" ? "pending" : "cancelled"}
                        label={
                          a.status === "active"
                            ? "Actif"
                            : a.status === "pending"
                              ? "En attente"
                              : a.status
                        }
                      />
                    </td>
                  </tr>
                ))}
                {stats.recentAgencies.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--muted)]">
                      Aucune agence
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Répartition des abonnements" href="/admin/abonnements" className="lg:col-span-5">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subData}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {subData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#ded0b6" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-display text-2xl font-semibold text-[var(--navy)]">{kpis.agencies}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Total</p>
              </div>
            </div>
            <ul className="w-full space-y-2">
              {stats.subscriptions.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--navy)]">{s.label}</span>
                  <span className="font-semibold text-[var(--muted)]">
                    {s.pct}% · {s.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel title="Statistiques rapides" className="lg:col-span-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Clients actifs" value={kpis.clients.toLocaleString("fr-DZ")} />
            <StatCard label="Taux d'occupation" value={`${kpis.occupancyRate}%`} />
            <StatCard label="Contrats actifs" value={String(kpis.contractsActive)} />
            <StatCard
              label="Paiements en attente"
              value={formatDz(kpis.outstanding)}
              hintTone={kpis.outstanding > 0 ? "bad" : "good"}
            />
            <StatCard
              label="Avis clients"
              value={`${kpis.avgRating} / 5`}
              hint={`${kpis.reviewsCount} avis`}
              hintTone="neutral"
            />
            <StatCard
              label="À modérer"
              value={String(kpis.propertiesPending)}
              hint={kpis.propertiesPending > 0 ? "Biens" : "OK"}
              hintTone={kpis.propertiesPending > 0 ? "bad" : "good"}
            />
          </div>
        </Panel>

        <Panel title="Transactions récentes" href="/admin/paiements" className="lg:col-span-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--sand)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                  <th className="pb-2 font-semibold">ID</th>
                  <th className="pb-2 font-semibold">Type</th>
                  <th className="pb-2 font-semibold">Montant</th>
                  <th className="pb-2 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {stats.transactions.map((t) => (
                  <tr key={t.id} className="border-b border-[var(--sand)]/60 last:border-0">
                    <td className="py-2.5 font-mono text-xs text-[var(--muted)]">
                      #{String(t.id).slice(0, 8)}
                    </td>
                    <td className="py-2.5 text-[var(--navy)]">{t.type}</td>
                    <td className="py-2.5 font-semibold">{formatDz(t.amount)}</td>
                    <td className="py-2.5">
                      <StatusBadge status="paid" label="Réussi" />
                    </td>
                  </tr>
                ))}
                {stats.transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[var(--muted)]">
                      Aucune transaction
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Réclamations récentes" href="/admin/reclamations" className="lg:col-span-3">
          {stats.claims.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[var(--muted)]">Aucune réclamation ouverte</p>
              <Link
                href="/admin/reclamations"
                className="mt-3 inline-block text-xs font-semibold text-[var(--gold-deep)] hover:underline"
              >
                Ouvrir le module
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {stats.claims.map((c) => (
                <li key={c.id} className="rounded-xl bg-[var(--sand-soft)]/60 px-3 py-2">
                  <p className="text-sm font-semibold text-[var(--navy)]">{c.subject}</p>
                  <p className="text-xs text-[var(--muted)]">{c.author}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
