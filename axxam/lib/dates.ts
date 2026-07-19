/** Helpers dates ISO YYYY-MM-DD (calendrier local) */

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function isPastDate(iso: string): boolean {
  return iso < todayISO();
}

export function eachDayInRange(startIso: string, endIso: string): string[] {
  if (!startIso || !endIso || endIso < startIso) return [];
  const days: string[] = [];
  const cur = parseISODate(startIso);
  const end = parseISODate(endIso);
  while (cur <= end) {
    days.push(toISODate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function rangeOverlapsUnavailable(
  startIso: string,
  endIso: string,
  unavailable: string[]
): boolean {
  const blocked = new Set(unavailable);
  // Nuits : check-in inclus, check-out exclu
  const nights = eachDayInRange(startIso, endIso).slice(0, -1);
  return nights.some((d) => blocked.has(d));
}

export function formatDayFr(iso: string): string {
  return parseISODate(iso).toLocaleDateString("fr-DZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
