"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  fetchAdminAgencies,
  fetchAdminAgencyDetail,
  updateUserStatus,
  updateUserSubscription,
} from "@/lib/api";
import type { AdminAgencyDetail, AdminAgencyListItem } from "@/types/admin";
import type { AuthUser } from "@/types/auth";

type AdminAgenciesPanelProps = {
  onChanged?: () => void;
  focusSubscription?: boolean;
};

function statusStyle(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700";
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "suspended":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "active":
      return "Active";
    case "pending":
      return "En attente";
    case "suspended":
      return "Suspendue";
    default:
      return status;
  }
}

function bookingStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Demande";
    case "confirmed":
      return "Confirmée";
    case "cancelled":
      return "Annulée";
    case "completed":
      return "Terminée";
    default:
      return status;
  }
}

function formatDz(n: number) {
  return `${Math.round(n).toLocaleString("fr-DZ")} DA`;
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminAgenciesPanel({
  onChanged,
  focusSubscription = false,
}: AdminAgenciesPanelProps) {
  const [agencies, setAgencies] = useState<AdminAgencyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "suspended">("all");
  const [subFilter, setSubFilter] = useState<"all" | "free" | "pro">("all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminAgencyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminAgencies();
      setAgencies(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible");
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    let list = [...agencies];
    if (filter !== "all") list = list.filter((u) => u.status === filter);
    if (subFilter !== "all") {
      list = list.filter((u) => (u.subscriptionPlan || "free") === subFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          (u.agencyName || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.wilaya || "").toLowerCase().includes(q) ||
          (u.managerName || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [agencies, filter, subFilter, query]);

  const totals = useMemo(() => {
    return agencies.reduce(
      (acc, a) => {
        acc.demandes += a.stats?.bookingsPending || 0;
        acc.reservations += a.stats?.bookingsTotal || 0;
        acc.biens += a.stats?.propertiesTotal || 0;
        return acc;
      },
      { demandes: 0, reservations: 0, biens: 0 }
    );
  }, [agencies]);

  const patchAgency = (id: string, next: AuthUser) => {
    setAgencies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...next, stats: a.stats } : a))
    );
    if (detail?.id === id) {
      setDetail((d) => (d ? { ...d, ...next, stats: d.stats } : d));
    }
    onChanged?.();
  };

  const openDetail = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(id);
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetchAdminAgencyDetail(id);
      setDetail(res.data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Détail impossible");
      setExpandedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const setStatus = async (id: string, status: "active" | "suspended" | "pending") => {
    setBusyId(id);
    try {
      const res = await updateUserStatus(id, status);
      patchAgency(id, res.data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  const toggleSubscription = async (u: AdminAgencyListItem) => {
    setBusyId(u.id);
    try {
      const next = u.subscriptionPlan === "pro" ? "free" : "pro";
      const res = await updateUserSubscription(u.id, next);
      patchAgency(u.id, res.data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
            Comptes
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--navy)]">
            {focusSubscription ? "Abonnements agences" : "Agences inscrites"}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Cliquez sur une agence pour voir les demandes reçues et tous les détails.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une agence…"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--gold)] sm:max-w-xs"
          />
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)]"
          >
            Actualiser
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat label="Demandes en attente" value={totals.demandes} tone="amber" />
        <MiniStat label="Réservations totales" value={totals.reservations} />
        <MiniStat label="Biens publiés" value={totals.biens} />
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-black/5 bg-white p-1 no-scrollbar">
          {(
            [
              { id: "all", label: "Toutes" },
              { id: "pending", label: "En attente" },
              { id: "active", label: "Actives" },
              { id: "suspended", label: "Suspendues" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                filter === item.id
                  ? "bg-[var(--navy)] text-[var(--gold)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-black/5 bg-white p-1 no-scrollbar">
          {(
            [
              { id: "all", label: "Tous abo" },
              { id: "free", label: "Gratuit" },
              { id: "pro", label: "Pro" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSubFilter(item.id)}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                subFilter === item.id
                  ? "bg-[var(--gold)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--surface)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-[var(--muted)]">Chargement...</p>}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" onClick={() => void load()} className="ml-2 underline">
            Réessayer
          </button>
        </p>
      )}

      {!loading && filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-8 text-center text-sm text-[var(--muted)]">
          Aucune agence dans ce filtre.
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((u) => {
          const isPro = u.subscriptionPlan === "pro";
          const s = u.stats;
          const open = expandedId === u.id;
          return (
            <article
              key={u.id}
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow ${
                open ? "border-[var(--gold)]/40 shadow-md" : "border-black/5"
              }`}
            >
              <button
                type="button"
                onClick={() => void openDetail(u.id)}
                className="flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[var(--navy)]">
                      {u.agencyName || u.displayName}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyle(u.status)}`}
                    >
                      {statusLabel(u.status)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isPro
                          ? "bg-[var(--navy)] text-[var(--gold)]"
                          : "bg-[var(--sand-soft)] text-[var(--navy)]"
                      }`}
                    >
                      {isPro ? "Pro" : "Gratuit"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {u.managerName} · {u.email} · {u.phone || "—"}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {u.wilaya || "Wilaya —"}
                    {u.address ? ` · ${u.address}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Chip
                      label="Demandes"
                      value={s.bookingsPending}
                      highlight={s.bookingsPending > 0}
                    />
                    <Chip label="Réservations" value={s.bookingsTotal} />
                    <Chip label="Biens" value={s.propertiesTotal} />
                    <Chip label="Confirmées" value={s.bookingsConfirmed} />
                  </div>
                </div>
                <span className="shrink-0 text-xs font-semibold text-[var(--gold-deep)]">
                  {open ? "Fermer ▲" : "Voir détail ▼"}
                </span>
              </button>

              <div
                className="flex flex-wrap gap-2 border-t border-black/5 px-4 py-3"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  disabled={busyId === u.id}
                  onClick={() => void toggleSubscription(u)}
                  className={`rounded-lg px-3 py-2 text-[11px] font-bold uppercase disabled:opacity-50 ${
                    isPro
                      ? "border border-amber-200 bg-amber-50 text-amber-800"
                      : "bg-[var(--navy)] text-[var(--gold)]"
                  }`}
                >
                  {isPro ? "Désactiver Pro" : "Activer Pro"}
                </button>
                {u.status !== "active" && (
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => void setStatus(u.id, "active")}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold uppercase text-white disabled:opacity-50"
                  >
                    Activer compte
                  </button>
                )}
                {u.status === "active" && (
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => void setStatus(u.id, "suspended")}
                    className="rounded-lg border border-red-200 px-3 py-2 text-[11px] font-bold uppercase text-red-600 disabled:opacity-50"
                  >
                    Suspendre
                  </button>
                )}
                {u.status === "suspended" && (
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => void setStatus(u.id, "pending")}
                    className="rounded-lg border border-black/10 px-3 py-2 text-[11px] font-bold uppercase text-[var(--navy)] disabled:opacity-50"
                  >
                    Remettre en attente
                  </button>
                )}
              </div>

              {open && (
                <div className="border-t border-[var(--sand)] bg-[var(--sand-soft)]/40 px-4 py-5">
                  {detailLoading && (
                    <p className="text-sm text-[var(--muted)]">Chargement du détail…</p>
                  )}
                  {detail && detail.id === u.id && (
                    <div className="space-y-5">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <DetailCard
                          title="Coordonnées"
                          rows={[
                            ["Email", detail.email],
                            ["Téléphone", detail.phone || "—"],
                            ["Wilaya", detail.wilaya || "—"],
                            ["Adresse", detail.address || "—"],
                            ["Gérant", detail.managerName || "—"],
                            ["RC", detail.rcNumber || "—"],
                            ["NIF", detail.nif || "—"],
                            [
                              "Inscrite le",
                              formatDate(String(detail.createdAt || "")),
                            ],
                            [
                              "Commission",
                              `${((detail.commissionRate ?? 0.05) * 100).toFixed(0)}%`,
                            ],
                          ]}
                        />
                        <DetailCard
                          title="Activité"
                          rows={[
                            ["Demandes en attente", String(detail.stats.bookingsPending)],
                            ["Réservations totales", String(detail.stats.bookingsTotal)],
                            ["Confirmées", String(detail.stats.bookingsConfirmed)],
                            ["Annulées", String(detail.stats.bookingsCancelled)],
                            ["Payées", String(detail.stats.bookingsPaid)],
                            ["GMV", formatDz(detail.stats.gmv)],
                            ["Commissions", formatDz(detail.stats.commissions)],
                          ]}
                        />
                        <DetailCard
                          title="Portefeuille"
                          rows={[
                            ["Biens total", String(detail.stats.propertiesTotal)],
                            ["Biens actifs", String(detail.stats.propertiesActive)],
                            ["Biens en attente", String(detail.stats.propertiesPending)],
                            ["Clients CRM", String(detail.stats.clientsCrm)],
                            ["Contrats actifs", String(detail.stats.contractsActive)],
                            ["Équipe", String(detail.stats.teamMembers)],
                          ]}
                        />
                        <div className="rounded-xl border border-black/5 bg-white p-4">
                          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                            Actions rapides
                          </h3>
                          <div className="mt-3 space-y-2">
                            <Link
                              href={`/admin/biens`}
                              className="block rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
                            >
                              Modérer les biens →
                            </Link>
                            <Link
                              href={`/admin/reservations`}
                              className="block rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-[var(--navy)] hover:border-[var(--gold)]"
                            >
                              Voir réservations →
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-3 font-display text-lg font-semibold text-[var(--navy)]">
                          Demandes & réservations récentes
                          <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                            ({detail.stats.bookingsPending} en attente)
                          </span>
                        </h3>
                        {detail.recentBookings.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-6 text-center text-sm text-[var(--muted)]">
                            Aucune demande reçue pour le moment.
                          </p>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-black/5 bg-white">
                            <table className="w-full min-w-[640px] text-left text-sm">
                              <thead>
                                <tr className="border-b border-[var(--sand)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                                  <th className="px-3 py-2.5 font-semibold">Bien</th>
                                  <th className="px-3 py-2.5 font-semibold">Client</th>
                                  <th className="px-3 py-2.5 font-semibold">Dates</th>
                                  <th className="px-3 py-2.5 font-semibold">Montant</th>
                                  <th className="px-3 py-2.5 font-semibold">Statut</th>
                                  <th className="px-3 py-2.5 font-semibold">Reçue</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detail.recentBookings.map((b) => (
                                  <tr
                                    key={b.id}
                                    className="border-b border-[var(--sand)]/50 last:border-0"
                                  >
                                    <td className="px-3 py-2.5">
                                      <p className="font-medium text-[var(--navy)]">
                                        {b.propertyName}
                                      </p>
                                      <p className="text-[11px] text-[var(--muted)]">
                                        {b.propertyCity}
                                      </p>
                                    </td>
                                    <td className="px-3 py-2.5">
                                      <p>{b.guestName || "—"}</p>
                                      <p className="text-[11px] text-[var(--muted)]">
                                        {b.guestEmail}
                                      </p>
                                    </td>
                                    <td className="px-3 py-2.5 text-[var(--muted)]">
                                      {formatDate(String(b.checkIn))} →{" "}
                                      {formatDate(String(b.checkOut))}
                                      <br />
                                      <span className="text-[11px]">{b.guests} pers.</span>
                                    </td>
                                    <td className="px-3 py-2.5 font-semibold">
                                      {formatDz(b.totalPrice)}
                                    </td>
                                    <td className="px-3 py-2.5">
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                          b.status === "pending"
                                            ? "bg-amber-50 text-amber-700"
                                            : b.status === "confirmed"
                                              ? "bg-emerald-50 text-emerald-700"
                                              : b.status === "cancelled"
                                                ? "bg-red-50 text-red-600"
                                                : "bg-slate-100 text-slate-600"
                                        }`}
                                      >
                                        {bookingStatusLabel(b.status)}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5 text-xs text-[var(--muted)]">
                                      {formatDate(String(b.createdAt))}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="mb-3 font-display text-lg font-semibold text-[var(--navy)]">
                          Biens de l&apos;agence
                        </h3>
                        {detail.recentProperties.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-6 text-center text-sm text-[var(--muted)]">
                            Aucun bien publié.
                          </p>
                        ) : (
                          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {detail.recentProperties.map((p) => (
                              <li
                                key={p.id}
                                className="rounded-xl border border-black/5 bg-white px-3 py-3"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-medium text-[var(--navy)]">{p.name}</p>
                                  <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyle(p.status)}`}
                                  >
                                    {p.status}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-[var(--muted)]">
                                  {p.city} · {p.transaction} · {formatDz(p.price)}
                                  {p.priceUnit !== "total" ? ` / ${p.priceUnit}` : ""}
                                </p>
                                <Link
                                  href={`/annonces/${p.id}?from=admin`}
                                  className="mt-2 inline-block text-[11px] font-semibold text-[var(--gold-deep)] hover:underline"
                                >
                                  Voir l&apos;annonce →
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "amber";
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        tone === "amber"
          ? "border-amber-100 bg-amber-50"
          : "border-black/5 bg-white"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold text-[var(--navy)]">{value}</p>
    </div>
  );
}

function Chip({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
        highlight
          ? "bg-amber-100 text-amber-800"
          : "bg-[var(--surface)] text-[var(--muted)]"
      }`}
    >
      {label}
      <span className="font-display text-sm font-semibold normal-case tracking-normal text-[var(--navy)]">
        {value}
      </span>
    </span>
  );
}

function DetailCard({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-white p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
        {title}
      </h3>
      <dl className="mt-3 space-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 text-sm">
            <dt className="text-[var(--muted)]">{k}</dt>
            <dd className="max-w-[55%] truncate text-right font-medium text-[var(--navy)]">
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
