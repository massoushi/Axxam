"use client";

import { useEffect, useState } from "react";
import { fetchAdminSettings, saveAdminSettings } from "@/lib/api";

const LABELS: Record<string, string> = {
  default_commission: "Commission par défaut (ex: 0.05)",
  service_fee_rate: "Frais de service (ex: 0.05)",
  currency: "Devise",
  maintenance_mode: "Mode maintenance (true/false)",
};

export default function AdminSettingsPanel() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchAdminSettings();
        setSettings(res.data || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setToast(null);
    setError(null);
    try {
      const res = await saveAdminSettings(settings);
      setSettings(res.data || settings);
      setToast("Paramètres enregistrés");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-[var(--muted)]">Chargement…</p>;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <p className="text-sm text-[var(--muted)]">
        Configuration globale de la plateforme AXXAM.
      </p>

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

      <div className="space-y-3 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        {Object.keys(settings).length === 0 && (
          <p className="text-sm text-[var(--muted)]">Aucun paramètre</p>
        )}
        {Object.entries(settings).map(([key, value]) => (
          <label key={key} className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              {LABELS[key] || key}
            </span>
            <input
              value={value}
              onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
              className="mt-1.5 w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="rounded-lg bg-[var(--navy)] px-5 py-2.5 text-xs font-bold uppercase text-[var(--gold)] disabled:opacity-50"
      >
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
    </div>
  );
}
