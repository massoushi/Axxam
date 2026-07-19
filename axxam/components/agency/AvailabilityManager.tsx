"use client";

import { useState } from "react";
import AvailabilityCalendar from "@/components/calendar/AvailabilityCalendar";
import { updatePropertyAvailability } from "@/lib/api";
import type { AgencyProperty } from "@/types/agency";

type AvailabilityManagerProps = {
  property: AgencyProperty;
  onClose: () => void;
  onSaved: (property: AgencyProperty) => void;
};

export default function AvailabilityManager({
  property,
  onClose,
  onSaved,
}: AvailabilityManagerProps) {
  const [dates, setDates] = useState<string[]>(property.unavailableDates || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    setToast(null);
    try {
      const res = await updatePropertyAvailability(property.id, dates);
      setToast(res.message || "Calendrier enregistré");
      onSaved(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-[var(--navy)] hover:bg-black/10"
          >
            ✕
          </button>

          <div className="pr-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--gold-deep)]">
              Calendrier
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[var(--navy)]">
              {property.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Définissez les jours disponibles et non disponibles pour ce bien.
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-black/5 bg-[var(--surface)] p-4">
            <AvailabilityCalendar
              unavailableDates={dates}
              editable
              onChange={setDates}
              monthsToShow={2}
            />
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {toast && (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {toast}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-black/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)]"
            >
              Fermer
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="rounded-lg bg-[var(--gold)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)] disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Enregistrer le calendrier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
