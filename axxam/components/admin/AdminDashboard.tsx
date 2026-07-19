"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  fetchPendingProperties,
  fetchProperties,
  fetchUsers,
  updatePropertyStatus,
} from "@/lib/api";
import type { AgencyProperty } from "@/types/agency";
import { propertyTypeLabel } from "@/types/agency";
import AdminAgenciesPanel from "@/components/admin/AdminAgenciesPanel";

type MainTab = "overview" | "moderation" | "agencies";
type ModTab = "pending" | "active" | "rejected";

function publisherLabel(property: AgencyProperty) {
  if (property.agencyId?.startsWith("proprietaire")) return "Propriétaire";
  return "Agence";
}

function priceLabel(property: AgencyProperty) {
  const n = Number(property.price).toLocaleString("fr-DZ");
  if (property.transaction === "vente" || property.priceUnit === "total") return `${n} DZD`;
  return `${n} DZD / ${property.priceUnit}`;
}

export default function AdminDashboard() {
  const [mainTab, setMainTab] = useState<MainTab>("overview");
  const [modTab, setModTab] = useState<ModTab>("pending");
  const [properties, setProperties] = useState<AgencyProperty[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    active: 0,
    rejected: 0,
    agenciesPending: 0,
    agenciesActive: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [pending, active, rejected, agencies] = await Promise.all([
        fetchPendingProperties(),
        fetchProperties({ status: "active" }),
        fetchProperties({ status: "rejected" }),
        fetchUsers({ role: "agency" }),
      ]);
      setStats({
        pending: pending.data.length,
        active: active.data.length,
        rejected: rejected.data.length,
        agenciesPending: agencies.data.filter((u) => u.status === "pending").length,
        agenciesActive: agencies.data.filter((u) => u.status === "active").length,
      });
    } catch {
      /* keep previous */
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadModeration = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res =
        modTab === "pending"
          ? await fetchPendingProperties()
          : await fetchProperties({ status: modTab });
      setProperties(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible");
    } finally {
      setLoading(false);
    }
  }, [modTab]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (mainTab === "moderation") {
      void loadModeration();
    }
  }, [mainTab, loadModeration]);

  useEffect(() => {
    if (mainTab !== "overview") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchPendingProperties();
        if (!cancelled) setProperties(res.data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mainTab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.loc.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.host?.toLowerCase().includes(q) ||
        propertyTypeLabel(p.type).toLowerCase().includes(q)
    );
  }, [properties, query]);

  const handleStatus = async (
    id: string,
    status: "active" | "rejected" | "pending" | "inactive"
  ) => {
    setBusyId(id);
    setToast(null);
    try {
      const res = await updatePropertyStatus(id, status);
      setToast(res.message || "Statut mis à jour");
      setProperties((prev) => prev.filter((p) => p.id !== id));
      void loadStats();
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  const openModeration = (tab: ModTab) => {
    setModTab(tab);
    setMainTab("moderation");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
            Administration
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--navy)] sm:text-4xl">
            Tableau de bord
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Validez les annonces, activez les agences et suivez l&apos;activité de la plateforme.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void loadStats();
            if (mainTab === "moderation") void loadModeration();
          }}
          className="inline-flex rounded-lg border border-black/10 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)] hover:border-[var(--gold)]"
        >
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          {
            label: "À valider",
            value: stats.pending,
            tone: "bg-amber-50 text-amber-800 border-amber-100",
            onClick: () => openModeration("pending"),
          },
          {
            label: "Publiés",
            value: stats.active,
            tone: "bg-emerald-50 text-emerald-800 border-emerald-100",
            onClick: () => openModeration("active"),
          },
          {
            label: "Refusés",
            value: stats.rejected,
            tone: "bg-red-50 text-red-700 border-red-100",
            onClick: () => openModeration("rejected"),
          },
          {
            label: "Agences en attente",
            value: stats.agenciesPending,
            tone: "bg-sky-50 text-sky-800 border-sky-100",
            onClick: () => setMainTab("agencies"),
          },
          {
            label: "Agences actives",
            value: stats.agenciesActive,
            tone: "bg-white text-[var(--navy)] border-black/5",
            onClick: () => setMainTab("agencies"),
          },
        ].map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={card.onClick}
            className={`rounded-2xl border px-4 py-4 text-left transition-transform hover:-translate-y-0.5 ${card.tone}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{card.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold">
              {statsLoading ? "—" : card.value}
            </p>
          </button>
        ))}
      </div>

      {/* Main tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-black/5 bg-white p-1 no-scrollbar">
        {(
          [
            { id: "overview", label: "Vue d'ensemble" },
            { id: "moderation", label: "Annonces" },
            { id: "agencies", label: "Agences" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMainTab(item.id)}
            className={`shrink-0 rounded-lg px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              mainTab === item.id
                ? "bg-[var(--navy)] text-[var(--gold)]"
                : "text-[var(--muted)] hover:bg-[var(--surface)]"
            }`}
          >
            {item.label}
            {item.id === "moderation" && stats.pending > 0 && (
              <span className="ml-2 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] text-white">
                {stats.pending}
              </span>
            )}
            {item.id === "agencies" && stats.agenciesPending > 0 && (
              <span className="ml-2 rounded-full bg-sky-500 px-1.5 py-0.5 text-[9px] text-white">
                {stats.agenciesPending}
              </span>
            )}
          </button>
        ))}
      </div>

      {toast && (
        <div className="rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-3 text-sm text-[var(--navy)]">
          {toast}
        </div>
      )}

      {mainTab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-[var(--navy)]">
                Annonces en attente
              </h2>
              <button
                type="button"
                onClick={() => openModeration("pending")}
                className="text-xs font-semibold text-[var(--gold-deep)]"
              >
                Tout voir →
              </button>
            </div>
            {stats.pending === 0 ? (
              <p className="mt-6 text-sm text-[var(--muted)]">Aucune annonce à valider.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {properties.slice(0, 5).map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-black/5 px-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--navy)]">{p.name}</p>
                        <p className="truncate text-xs text-[var(--muted)]">
                          {propertyTypeLabel(p.type)} · {p.city} · {publisherLabel(p)}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => handleStatus(p.id, "active")}
                        className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold uppercase text-white disabled:opacity-50"
                      >
                        OK
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-[var(--navy)]">Actions rapides</h2>
            </div>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => openModeration("pending")}
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm font-semibold text-amber-900"
              >
                Valider les annonces ({stats.pending})
              </button>
              <button
                type="button"
                onClick={() => setMainTab("agencies")}
                className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-left text-sm font-semibold text-sky-900"
              >
                Activer les agences ({stats.agenciesPending})
              </button>
              <Link
                href="/"
                className="rounded-xl border border-black/10 bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--navy)]"
              >
                Voir le site public →
              </Link>
            </div>
          </section>
        </div>
      )}

      {mainTab === "moderation" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-black/5 bg-white p-1 no-scrollbar">
              {(
                [
                  { id: "pending", label: "À valider", count: stats.pending },
                  { id: "active", label: "Publiés", count: stats.active },
                  { id: "rejected", label: "Refusés", count: stats.rejected },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setModTab(item.id)}
                  className={`shrink-0 rounded-lg px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    modTab === item.id
                      ? "bg-[var(--navy)] text-[var(--gold)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface)]"
                  }`}
                >
                  {item.label}
                  <span className="ml-1 opacity-70">({item.count})</span>
                </button>
              ))}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (nom, wilaya, type…)"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--gold)] sm:max-w-xs"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
              <button type="button" onClick={loadModeration} className="ml-2 font-semibold underline">
                Réessayer
              </button>
            </div>
          )}

          {loading ? (
            <p className="text-sm text-[var(--muted)]">Chargement des annonces...</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
              <p className="font-display text-2xl text-[var(--navy)]">Aucune annonce</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {query
                  ? "Aucun résultat pour cette recherche."
                  : modTab === "pending"
                    ? "Dès qu'une agence ou un propriétaire publie, l'annonce arrive ici."
                    : "Passez à un autre onglet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((property) => (
                <article
                  key={property.id}
                  className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative h-48 w-full shrink-0 bg-[var(--surface)] md:h-auto md:w-56">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={property.img}
                        alt={property.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-2xl font-semibold text-[var(--navy)]">
                            {property.name}
                          </h2>
                          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                            {property.transaction}
                          </span>
                          <span className="rounded-full bg-[var(--navy)]/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--navy)]">
                            {publisherLabel(property)}
                          </span>
                          {property.category === "piscine-privee" && (
                            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700">
                              Piscine
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-[var(--muted)]">{property.loc}</p>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--ink)] line-clamp-2">
                          {property.description || "Sans description"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                          <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                            {propertyTypeLabel(property.type)}
                          </span>
                          {property.bedrooms > 0 && (
                            <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                              {property.bedrooms} ch.
                            </span>
                          )}
                          {property.surface > 0 && (
                            <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                              {property.surface} m²
                            </span>
                          )}
                          <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                            {priceLabel(property)}
                          </span>
                          <span className="rounded-full bg-[var(--surface)] px-2.5 py-1">
                            {property.host}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {modTab === "pending" && (
                          <>
                            <button
                              type="button"
                              disabled={busyId === property.id}
                              onClick={() => handleStatus(property.id, "active")}
                              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Approuver
                            </button>
                            <button
                              type="button"
                              disabled={busyId === property.id}
                              onClick={() => handleStatus(property.id, "rejected")}
                              className="rounded-lg border border-red-200 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              Refuser
                            </button>
                          </>
                        )}
                        {modTab === "active" && (
                          <button
                            type="button"
                            disabled={busyId === property.id}
                            onClick={() => handleStatus(property.id, "inactive")}
                            className="rounded-lg border border-black/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)]"
                          >
                            Retirer
                          </button>
                        )}
                        {modTab === "rejected" && (
                          <button
                            type="button"
                            disabled={busyId === property.id}
                            onClick={() => handleStatus(property.id, "pending")}
                            className="rounded-lg bg-[var(--navy)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--gold)]"
                          >
                            Remettre en attente
                          </button>
                        )}
                        <Link
                          href={`/annonces/${property.id}?from=admin`}
                          className="rounded-lg border border-black/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--muted)]"
                        >
                          Détail
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {mainTab === "agencies" && (
        <AdminAgenciesPanel
          onChanged={() => {
            void loadStats();
          }}
        />
      )}
    </div>
  );
}
