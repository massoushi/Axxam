"use client";

import { useEffect, useState } from "react";
import {
  assignProperty,
  fetchAgencyMembers,
  fetchAgencyProperties,
} from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";
import type { AgencyProperty } from "@/types/agency";
import type { AgencyMember } from "@/types/agency-team";

export default function AgencyAssignPanel() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<AgencyProperty[]>([]);
  const [members, setMembers] = useState<AgencyMember[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [props, mem] = await Promise.all([
        fetchAgencyProperties(user.id),
        fetchAgencyMembers(),
      ]);
      setProperties(props.data);
      setMembers(mem.data.filter((m) => m.status === "active"));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const onAssign = async (propertyId: string, assignedTo: string) => {
    await assignProperty(propertyId, assignedTo || null);
    await load();
  };

  if (loading) return <p className="text-sm text-[var(--muted)]">Chargement…</p>;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-[var(--navy)]">
        Attribution des logements
      </h2>
      {properties.map((p) => (
        <div
          key={p.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 bg-white px-4 py-3"
        >
          <div>
            <p className="font-medium text-[var(--navy)]">{p.name}</p>
            <p className="text-xs text-[var(--muted)]">{p.city}</p>
          </div>
          <select
            value={p.assignedTo || ""}
            onChange={(e) => onAssign(p.id, e.target.value)}
            className="rounded-lg border border-black/10 px-3 py-2 text-sm"
          >
            <option value="">Non attribué</option>
            {members.map((m) => (
              <option key={m.id} value={m.userId}>
                {m.displayName || m.email} ({m.memberRole})
              </option>
            ))}
          </select>
        </div>
      ))}
      {properties.length === 0 && (
        <p className="text-sm text-[var(--muted)]">Aucun bien à attribuer.</p>
      )}
    </div>
  );
}
