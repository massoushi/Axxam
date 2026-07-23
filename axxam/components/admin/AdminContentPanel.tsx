"use client";

import { useEffect, useState } from "react";
import { fetchAdminContent, saveAdminContent } from "@/lib/api";
import type { SiteContentItem } from "@/types/admin";

export default function AdminContentPanel() {
  const [items, setItems] = useState<SiteContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminContent();
      setItems(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const update = (key: string, field: "title" | "body", value: string) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, [field]: value } : i))
    );
  };

  const save = async () => {
    setSaving(true);
    setToast(null);
    try {
      const res = await saveAdminContent(
        items.map((i) => ({ key: i.key, title: i.title, body: i.body }))
      );
      setItems(res.data || items);
      setToast("Contenu enregistré");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-[var(--muted)]">Chargement…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          Textes et bannières affichés sur le site public.
        </p>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-lg bg-[var(--navy)] px-4 py-2.5 text-xs font-bold uppercase text-[var(--gold)] disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {toast && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {toast}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--gold-deep)]">
              {item.key}
            </p>
            <input
              value={item.title}
              onChange={(e) => update(item.key, "title", e.target.value)}
              className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2 text-sm font-semibold"
              placeholder="Titre"
            />
            <textarea
              value={item.body}
              onChange={(e) => update(item.key, "body", e.target.value)}
              rows={item.key.includes("banner") || item.key.includes("subtitle") ? 2 : 3}
              className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              placeholder="Contenu"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
