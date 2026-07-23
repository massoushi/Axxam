"use client";

import { useEffect, useState } from "react";
import {
  broadcastNotification,
  fetchUsers,
  updateUserCommission,
  updateUserStatus,
  updateUserSubscription,
} from "@/lib/api";
import type { AuthUser, UserStatus } from "@/types/auth";

type Props = {
  initialRole?: "all" | "client" | "owner" | "agency" | "admin";
  hideRoleFilters?: boolean;
};

const ROLE_LABEL: Record<string, string> = {
  client: "Client",
  owner: "Propriétaire",
  agency: "Agence",
  admin: "Admin",
};

export default function AdminUsersPanel({
  initialRole = "all",
  hideRoleFilters = false,
}: Props) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [roleFilter, setRoleFilter] = useState(initialRole);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastRole, setBroadcastRole] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (roleFilter !== "all") params.role = roleFilter;
      const u = await fetchUsers(params);
      setUsers(u.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [roleFilter]);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.email.toLowerCase().includes(q) ||
      (u.displayName || "").toLowerCase().includes(q) ||
      (u.agencyName || "").toLowerCase().includes(q) ||
      (u.phone || "").includes(q)
    );
  });

  const patchUser = (id: string, next: AuthUser) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? next : u)));
  };

  const setStatus = async (id: string, status: UserStatus) => {
    setBusyId(id);
    try {
      const res = await updateUserStatus(id, status);
      patchUser(id, res.data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  const toggleSub = async (u: AuthUser) => {
    setBusyId(u.id);
    try {
      const next = u.subscriptionPlan === "pro" ? "free" : "pro";
      const res = await updateUserSubscription(u.id, next);
      patchUser(u.id, res.data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim()) return;
    await broadcastNotification({
      title: broadcastTitle.trim(),
      body: broadcastBody.trim(),
      role: broadcastRole || undefined,
      link: "/",
    });
    setBroadcastTitle("");
    setBroadcastBody("");
    alert("Notifications envoyées");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Affichés" value={filtered.length} />
        <Stat label="Total chargés" value={users.length} />
        <Stat
          label="En attente"
          value={users.filter((u) => u.status === "pending").length}
        />
      </div>

      {!hideRoleFilters && (
        <form
          onSubmit={sendBroadcast}
          className="space-y-3 rounded-2xl border border-black/5 bg-white p-4"
        >
          <h3 className="font-display text-lg font-semibold text-[var(--navy)]">
            Envoyer une notification
          </h3>
          <input
            value={broadcastTitle}
            onChange={(e) => setBroadcastTitle(e.target.value)}
            placeholder="Titre"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            required
          />
          <textarea
            value={broadcastBody}
            onChange={(e) => setBroadcastBody(e.target.value)}
            placeholder="Message"
            rows={2}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={broadcastRole}
              onChange={(e) => setBroadcastRole(e.target.value)}
              className="rounded-lg border border-black/10 px-3 py-2 text-sm"
            >
              <option value="">Tous les comptes</option>
              <option value="client">Clients</option>
              <option value="owner">Propriétaires</option>
              <option value="agency">Agences</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-[var(--navy)] px-4 py-2 text-xs font-bold uppercase text-[var(--gold)]"
            >
              Diffuser
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {!hideRoleFilters &&
          (["all", "client", "owner", "agency", "admin"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`rounded-lg px-3 py-2 text-[11px] font-bold uppercase ${
                roleFilter === r
                  ? "bg-[var(--navy)] text-[var(--gold)]"
                  : "border border-black/10 text-[var(--muted)]"
              }`}
            >
              {r === "all" ? "Tous" : ROLE_LABEL[r] || r}
            </button>
          ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher (nom, email, téléphone)…"
          className="ml-auto min-w-[200px] flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm sm:max-w-xs"
        />
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-black/10 px-3 py-2 text-[11px] font-bold uppercase text-[var(--navy)]"
        >
          Actualiser
        </button>
      </div>

      {loading && <p className="text-sm text-[var(--muted)]">Chargement des utilisateurs…</p>}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" onClick={() => void load()} className="ml-2 underline">
            Réessayer
          </button>
        </p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-black/10 bg-white px-4 py-8 text-center text-sm text-[var(--muted)]">
          Aucun utilisateur trouvé.
        </p>
      )}

      <div className="space-y-2">
        {filtered.map((u) => (
          <div key={u.id} className="rounded-xl border border-black/5 bg-white px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-[var(--navy)]">
                  {u.role === "agency" ? u.agencyName || u.displayName : u.displayName}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {ROLE_LABEL[u.role] || u.role} · {u.email}
                  {u.phone ? ` · ${u.phone}` : ""}
                  {u.wilaya ? ` · ${u.wilaya}` : ""}
                </p>
                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  Statut <strong>{u.status}</strong>
                  {(u.role === "agency" || u.role === "owner") && (
                    <>
                      {" "}
                      · Abo <strong>{u.subscriptionPlan === "pro" ? "Pro" : "Gratuit"}</strong> · Com{" "}
                      {((u.commissionRate ?? 0.05) * 100).toFixed(0)}%
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {u.status !== "active" && (
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => void setStatus(u.id, "active")}
                    className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold uppercase text-white disabled:opacity-50"
                  >
                    Activer
                  </button>
                )}
                {u.status !== "suspended" && u.role !== "admin" && (
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => void setStatus(u.id, "suspended")}
                    className="rounded-lg border border-red-200 px-2.5 py-1.5 text-[10px] font-bold uppercase text-red-600 disabled:opacity-50"
                  >
                    Bloquer
                  </button>
                )}
                {(u.role === "agency" || u.role === "owner") && (
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => void toggleSub(u)}
                    className="rounded-lg border border-black/10 px-2.5 py-1.5 text-[10px] font-bold uppercase text-[var(--navy)] disabled:opacity-50"
                  >
                    Abo {u.subscriptionPlan === "pro" ? "→ Gratuit" : "→ Pro"}
                  </button>
                )}
                {(u.role === "agency" || u.role === "owner") && (
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => {
                      const raw = prompt(
                        "Taux commission (ex: 0.05 pour 5%)",
                        String(u.commissionRate ?? 0.05)
                      );
                      if (!raw) return;
                      setBusyId(u.id);
                      updateUserCommission(u.id, Number(raw))
                        .then((res) => patchUser(u.id, res.data))
                        .catch((err) =>
                          alert(err instanceof Error ? err.message : "Erreur")
                        )
                        .finally(() => setBusyId(null));
                    }}
                    className="rounded-lg border border-black/10 px-2.5 py-1.5 text-[10px] font-bold uppercase text-[var(--muted)] disabled:opacity-50"
                  >
                    Commission
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 font-display text-xl font-semibold text-[var(--navy)]">{value}</p>
    </div>
  );
}
