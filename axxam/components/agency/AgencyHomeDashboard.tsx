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
import { fetchAgencyStats } from "@/lib/api";
import type { AgencyStats } from "@/types/agency-crm";
import { propertyTypeLabel } from "@/types/agency";
import { Panel, StatCard } from "@/components/agency/ui/AgencyUi";

function formatDz(n: number) {
  return `${Math.round(n).toLocaleString("fr-DZ")} DA`;
}

const PIE_COLORS = ["#a65126", "#2f2f2e", "#c8794a", "#ded0b6", "#8a4019", "#525250"];

export default function AgencyHomeDashboard() {
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchAgencyStats();
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
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
  const pieData = stats.propertyTypes.map((t) => ({
    name: propertyTypeLabel(t.type),
    value: t.count,
    pct: t.pct,
  }));

  const agendaItems = [
    ...stats.agenda.appointments.map((a) => ({
      id: a.id,
      title: a.title,
      when: new Date(a.startAt).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      kind: a.kind,
    })),
    ...stats.agenda.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      when: t.dueDate || "Sans date",
      kind: "task",
    })),
  ].slice(0, 6);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Biens" value={String(kpis.properties)} hint={`${kpis.available} actifs`} />
        <StatCard label="Clients" value={String(kpis.clients)} hint={`${kpis.owners} propriétaires`} hintTone="neutral" />
        <StatCard label="Contrats actifs" value={String(kpis.activeContracts)} />
        <StatCard
          label="Revenus ce mois"
          value={formatDz(kpis.revenueMonth)}
          hint={`${kpis.bookingsToday} résa. aujourd'hui`}
        />
        <StatCard
          label="Reste à encaisser"
          value={formatDz(kpis.outstanding)}
          hint={`${kpis.outstandingCount} en attente`}
          hintTone={kpis.outstanding > 0 ? "bad" : "good"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Revenus" href="/agence/comptabilite" className="lg:col-span-1">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueSeries}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#revFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Répartition des biens" href="/agence/biens">
          <div className="flex h-52 items-center gap-4">
            <div className="h-40 w-40 shrink-0">
              {pieData.length === 0 ? (
                <p className="flex h-full items-center justify-center text-xs text-[var(--muted)]">Aucun bien</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={42} outerRadius={68} paddingAngle={3}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <ul className="min-w-0 flex-1 space-y-2 text-sm">
              {pieData.slice(0, 4).map((t, i) => (
                <li key={t.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 truncate text-[var(--navy)]">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    {t.name}
                  </span>
                  <span className="font-semibold text-[var(--muted)]">{t.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel title="Paiements en attente" href="/agence/paiements">
          <div className="max-h-52 space-y-3 overflow-y-auto">
            {stats.pendingPayments.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--muted)]">Aucun paiement en attente</p>
            ) : (
              stats.pendingPayments.map((p) => (
                <div key={p.id} className="flex items-start justify-between gap-3 border-b border-[var(--sand)]/50 pb-3 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--navy)]">
                      {p.clientName || "Client"}
                    </p>
                    <p className="truncate text-xs text-[var(--muted)]">{p.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">
                      {formatDz(p.amount - p.amountPaid)}
                    </p>
                    <p className="text-[10px] uppercase text-[var(--muted)]">{p.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Contrats qui expirent bientôt" href="/agence/contrats" className="lg:col-span-1">
          <div className="space-y-3">
            {stats.expiringContracts.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--muted)]">Aucun contrat bientôt expiré</p>
            ) : (
              stats.expiringContracts.map((c) => (
                <div key={c.id} className="rounded-xl bg-[var(--surface)] px-3 py-2.5">
                  <p className="text-sm font-semibold text-[var(--navy)]">{c.clientName || c.title}</p>
                  <p className="text-xs text-[var(--muted)]">{c.propertyName || "Bien"}</p>
                  <div className="mt-1 flex justify-between text-xs">
                    <span className="font-semibold text-amber-700">{c.endDate}</span>
                    <span className="font-semibold text-[var(--navy)]">{formatDz(c.rent)}/mois</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Taux d'occupation">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="48" fill="none" stroke="#ebe3d4" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#a65126"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(kpis.occupancyRate / 100) * 301} 301`}
                />
              </svg>
              <div className="absolute text-center">
                <p className="font-display text-3xl font-semibold text-[var(--navy)]">{kpis.occupancyRate}%</p>
                <p className="text-[10px] font-bold uppercase text-emerald-700">
                  {kpis.occupancyRate >= 70 ? "Très bon" : kpis.occupancyRate >= 40 ? "Correct" : "Faible"}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {kpis.occupied} occupés · {kpis.available} disponibles
            </p>
          </div>
        </Panel>

        <Panel title="Messages récents" href="/agence/messages">
          <div className="space-y-3">
            {stats.recentMessages.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--muted)]">Aucun message</p>
            ) : (
              stats.recentMessages.map((m) => (
                <div key={m.id} className="border-b border-[var(--sand)]/50 pb-3 last:border-0">
                  <p className="text-sm font-semibold text-[var(--navy)]">{m.senderName}</p>
                  <p className="line-clamp-2 text-xs text-[var(--muted)]">{m.body}</p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Agenda" href="/agence/taches" className="lg:col-span-2">
          <div className="space-y-2">
            {agendaItems.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--muted)]">
                Aucun événement — créez une tâche ou un rendez-vous
              </p>
            ) : (
              agendaItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl border border-[var(--sand)]/60 px-3 py-2.5"
                >
                  <div className="w-24 shrink-0 text-xs font-semibold text-[var(--gold-deep)]">{item.when}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--navy)]">{item.title}</p>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{item.kind}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <div className="overflow-hidden rounded-2xl bg-[var(--navy)] p-6 text-white shadow-[var(--shadow-soft)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--sand)]">AXXAM Pro</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">
            Développez votre agence avec AXXAM
          </h3>
          <p className="mt-2 text-sm text-white/55">
            Contrats, échéanciers, CRM et comptabilité dans un seul espace.
          </p>
          <Link
            href="/agence/parametres"
            className="mt-5 inline-flex rounded-full bg-[var(--gold)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
          >
            Découvrir les offres
          </Link>
        </div>
      </div>
    </div>
  );
}
