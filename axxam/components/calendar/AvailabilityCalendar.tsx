"use client";

import { useMemo, useState } from "react";
import { parseISODate, toISODate, todayISO } from "@/lib/dates";

const WEEKDAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

type AvailabilityCalendarProps = {
  unavailableDates: string[];
  /** Mode édition agence : clic pour basculer dispo/indispo */
  editable?: boolean;
  onChange?: (dates: string[]) => void;
  /** Sélection check-in / check-out (accueil) */
  selectable?: boolean;
  checkIn?: string;
  checkOut?: string;
  onSelectRange?: (checkIn: string, checkOut: string) => void;
  monthsToShow?: number;
};

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** Lundi = 0 … Dimanche = 6 */
function mondayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function MonthGrid({
  year,
  month,
  unavailable,
  editable,
  selectable,
  checkIn,
  checkOut,
  onDayClick,
}: {
  year: number;
  month: number;
  unavailable: Set<string>;
  editable?: boolean;
  selectable?: boolean;
  checkIn?: string;
  checkOut?: string;
  onDayClick: (iso: string) => void;
}) {
  const first = startOfMonth(year, month);
  const total = daysInMonth(year, month);
  const offset = mondayIndex(first);
  const label = first.toLocaleDateString("fr-DZ", { month: "long", year: "numeric" });
  const today = todayISO();

  const cells: (string | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) {
    cells.push(toISODate(new Date(year, month, d)));
  }

  return (
    <div className="min-w-[240px] flex-1">
      <p className="mb-3 text-center text-sm font-semibold capitalize text-[var(--navy)]">{label}</p>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((iso, idx) => {
          if (!iso) return <span key={`e-${idx}`} className="aspect-square" />;

          const blocked = unavailable.has(iso);
          const past = iso < today;
          const isStart = checkIn === iso;
          const isEnd = checkOut === iso;
          const inRange =
            checkIn && checkOut && iso > checkIn && iso < checkOut
              ? true
              : false;

          let className =
            "aspect-square rounded-lg text-xs font-medium transition-colors flex items-center justify-center ";

          if (past && !editable) {
            className += "bg-transparent text-gray-300 cursor-not-allowed";
          } else if (blocked) {
            className +=
              "bg-gray-200 text-gray-400 line-through cursor-not-allowed opacity-70";
            if (editable) className = className.replace("cursor-not-allowed", "cursor-pointer hover:bg-gray-300");
          } else if (isStart || isEnd) {
            className += "bg-[var(--navy)] text-[var(--gold)]";
          } else if (inRange) {
            className += "bg-[var(--gold)]/25 text-[var(--navy)]";
          } else {
            className += "bg-emerald-50 text-emerald-800 hover:bg-emerald-100";
            if (editable || selectable) className += " cursor-pointer";
          }

          const disabled = (!editable && (past || blocked)) || (past && editable);

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled && !editable}
              onClick={() => {
                if (editable) {
                  if (past) return;
                  onDayClick(iso);
                  return;
                }
                if (selectable && !past && !blocked) onDayClick(iso);
              }}
              className={className}
              title={blocked ? "Non disponible" : "Disponible"}
            >
              {parseISODate(iso).getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AvailabilityCalendar({
  unavailableDates,
  editable = false,
  onChange,
  selectable = false,
  checkIn = "",
  checkOut = "",
  onSelectRange,
  monthsToShow = 2,
}: AvailabilityCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() };
  });

  const unavailable = useMemo(() => new Set(unavailableDates), [unavailableDates]);

  const months = useMemo(() => {
    const list: { year: number; month: number }[] = [];
    for (let i = 0; i < monthsToShow; i++) {
      const d = new Date(cursor.year, cursor.month + i, 1);
      list.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return list;
  }, [cursor, monthsToShow]);

  const toggleDay = (iso: string) => {
    if (!onChange) return;
    const next = unavailable.has(iso)
      ? unavailableDates.filter((d) => d !== iso)
      : [...unavailableDates, iso].sort();
    onChange(next);
  };

  const selectDay = (iso: string) => {
    if (!onSelectRange) return;
    if (!checkIn || (checkIn && checkOut)) {
      onSelectRange(iso, "");
      return;
    }
    if (iso <= checkIn) {
      onSelectRange(iso, "");
      return;
    }
    // Vérifier qu'aucune nuit n'est bloquée
    const nights: string[] = [];
    const cur = parseISODate(checkIn);
    const end = parseISODate(iso);
    while (cur < end) {
      nights.push(toISODate(cur));
      cur.setDate(cur.getDate() + 1);
    }
    if (nights.some((d) => unavailable.has(d))) {
      onSelectRange(iso, "");
      return;
    }
    onSelectRange(checkIn, iso);
  };

  const prev = () => {
    const d = new Date(cursor.year, cursor.month - 1, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  const next = () => {
    const d = new Date(cursor.year, cursor.month + 1, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-[var(--navy)] hover:bg-[var(--surface)]"
        >
          ←
        </button>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Calendrier
        </p>
        <button
          type="button"
          onClick={next}
          className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-[var(--navy)] hover:bg-[var(--surface)]"
        >
          →
        </button>
      </div>

      <div className={`flex flex-col gap-6 ${monthsToShow > 1 ? "sm:flex-row" : ""}`}>
        {months.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            unavailable={unavailable}
            editable={editable}
            selectable={selectable}
            checkIn={checkIn}
            checkOut={checkOut}
            onDayClick={editable ? toggleDay : selectDay}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-4 text-[11px] text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-50 ring-1 ring-emerald-200" /> Disponible
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-gray-200" /> Non disponible
        </span>
        {selectable && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-[var(--navy)]" /> Sélection
          </span>
        )}
      </div>

      {editable && (
        <p className="text-xs text-[var(--muted)]">
          Cliquez sur un jour pour le marquer disponible ou non disponible. Les jours grisés sont
          bloqués.
        </p>
      )}
    </div>
  );
}
