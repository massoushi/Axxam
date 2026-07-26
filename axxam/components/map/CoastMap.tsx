"use client";

import type { Property } from "@/types/property";

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Alger: { lat: 36.7538, lng: 3.0588 },
  Tipaza: { lat: 36.5897, lng: 2.4475 },
  Oran: { lat: 35.6969, lng: -0.6331 },
  Annaba: { lat: 36.9, lng: 7.7667 },
  "Béjaïa": { lat: 36.75, lng: 5.0833 },
  Jijel: { lat: 36.82, lng: 5.7667 },
  Skikda: { lat: 36.8667, lng: 6.9 },
  Mostaganem: { lat: 35.9333, lng: 0.0833 },
  Bouira: { lat: 36.3833, lng: 3.9 },
  Constantine: { lat: 36.365, lng: 6.6147 },
  Blida: { lat: 36.47, lng: 2.83 },
  "Sétif": { lat: 36.19, lng: 5.41 },
  Tlemcen: { lat: 34.8783, lng: -1.315 },
  Batna: { lat: 35.555, lng: 6.174 },
};

type CoastMapProps = {
  listings: Property[];
  cityFilter?: string;
  onSelect?: (p: Property) => void;
  className?: string;
};

/** Carte côte / Algérie via OpenStreetMap (sans clé API). */
export default function CoastMap({ listings, cityFilter, onSelect, className = "" }: CoastMapProps) {
  const withCoords = listings
    .map((p) => {
      const city = (p.city || p.loc.split(",")[0] || "").trim();
      const fallback = CITY_COORDS[city] || CITY_COORDS["Alger"];
      const lat = p.gpsLat ?? fallback.lat + (hash(p.id) % 40) / 1000;
      const lng = p.gpsLng ?? fallback.lng + (hash(p.id + "x") % 40) / 1000;
      return { p, lat, lng, city };
    })
    .filter((x) => !cityFilter || x.city.toLowerCase().includes(cityFilter.toLowerCase()));

  const center = cityFilter && CITY_COORDS[cityFilter]
    ? CITY_COORDS[cityFilter]
    : { lat: 36.5, lng: 3.2 };
  const zoom = cityFilter ? 10 : 6;

  const bbox = [
    center.lng - (cityFilter ? 0.35 : 4),
    center.lat - (cityFilter ? 0.25 : 2.5),
    center.lng + (cityFilter ? 0.35 : 4),
    center.lat + (cityFilter ? 0.25 : 2.5),
  ].join("%2C");

  const marker = `${center.lat}%2C${center.lng}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;

  return (
    <div className={`overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[var(--shadow-soft)] ${className}`}>
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Carte</p>
          <h3 className="font-display text-lg font-semibold text-[var(--navy)]">
            {cityFilter ? cityFilter : "Côte & wilayas"}
          </h3>
        </div>
        <span className="text-xs text-[var(--muted)]">{withCoords.length} biens</span>
      </div>

      <div className="relative aspect-[16/10] w-full bg-[var(--sand-soft)] sm:aspect-[21/9]">
        <iframe
          title="Carte des hébergements AXXAM"
          src={mapSrc}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {withCoords.length > 0 && (
        <ul className="max-h-40 divide-y divide-black/5 overflow-y-auto">
          {withCoords.slice(0, 8).map(({ p }) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect?.(p)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-[var(--sand-soft)]"
              >
                <span className="line-clamp-1 font-medium text-[var(--ink)]">{p.name}</span>
                <span className="shrink-0 text-xs font-semibold text-[var(--navy)]">
                  {p.price} DA
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="border-t border-black/5 px-4 py-2 text-[10px] text-[var(--muted)]">
        Carte ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          OpenStreetMap
        </a>
      </p>
    </div>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
