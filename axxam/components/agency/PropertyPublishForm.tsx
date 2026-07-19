"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import ImageGalleryField from "@/components/agency/ImageGalleryField";
import { publishProperty } from "@/lib/api";
import {
  ALGERIAN_CITIES,
  AMENITY_OPTIONS,
  PROPERTY_CATEGORIES,
  PROPERTY_TYPES,
  type PriceUnit,
  type TransactionType,
} from "@/types/agency";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20";

const labelClass = "mb-1.5 block text-xs font-semibold text-[var(--navy)]";

type PublisherMode = "agency" | "owner";

type PropertyPublishFormProps = {
  mode?: PublisherMode;
  host?: string;
  agencyId?: string;
  cancelHref?: string;
  successHref?: string;
};

const PUBLISHER_DEFAULTS: Record<
  PublisherMode,
  { host: string; agencyId: string; cancelHref: string; successHref: string }
> = {
  agency: {
    host: "Agence Demo",
    agencyId: "agence-demo",
    cancelHref: "/agence",
    successHref: "/agence",
  },
  owner: {
    host: "Propriétaire",
    agencyId: "proprietaire-demo",
    cancelHref: "/proprietaire",
    successHref: "/proprietaire",
  },
};

export default function PropertyPublishForm({
  mode = "agency",
  host,
  agencyId,
  cancelHref,
  successHref,
}: PropertyPublishFormProps = {}) {
  const defaults = PUBLISHER_DEFAULTS[mode];
  const resolvedHost = host ?? defaults.host;
  const resolvedAgencyId = agencyId ?? defaults.agencyId;
  const resolvedCancelHref = cancelHref ?? defaults.cancelHref;
  const resolvedSuccessHref = successHref ?? defaults.successHref;

  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("appartement");
  const [category, setCategory] = useState("autre");
  const [transaction, setTransaction] = useState<TransactionType>("location");
  const [city, setCity] = useState("Alger");
  const [commune, setCommune] = useState("");
  const [quartier, setQuartier] = useState("");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState<PriceUnit>("nuit");
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [capacity, setCapacity] = useState(4);
  const [surface, setSurface] = useState("");
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const toggleAmenity = (item: string) => {
    setAmenities((prev) => (prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const result = await publishProperty({
        name,
        type,
        category,
        transaction,
        city,
        commune,
        quartier,
        price: Number(price),
        priceUnit,
        bedrooms,
        bathrooms,
        capacity,
        surface: Number(surface) || 0,
        description,
        amenities,
        images,
        host: resolvedHost,
        agencyId: resolvedAgencyId,
      });

      setSuccess(
        result.message ||
          "Bien soumis à validation. Un administrateur doit l'approuver avant publication sur l'accueil."
      );
      setTimeout(() => router.push(resolvedSuccessHref), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publication impossible");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-[var(--navy)]">Informations générales</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Titre, type et classification du bien</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Titre de l&apos;annonce *</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Villa Azure — vue mer"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Type de bien *</label>
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)} required>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Catégorie</label>
            <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
              {PROPERTY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Transaction *</label>
            <div className="flex gap-2">
              {(["location", "vente"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setTransaction(value);
                    setPriceUnit(value === "vente" ? "mois" : priceUnit);
                  }}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    transaction === value
                      ? "border-[var(--gold)] bg-[var(--navy)] text-[var(--gold)]"
                      : "border-black/10 bg-white text-[var(--muted)] hover:border-[var(--gold)]/50"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-[var(--navy)]">Localisation</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Wilaya *</label>
            <select className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} required>
              {ALGERIAN_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Commune</label>
            <input
              className={inputClass}
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              placeholder="Ex. Hydra"
            />
          </div>
          <div>
            <label className={labelClass}>Quartier</label>
            <input
              className={inputClass}
              value={quartier}
              onChange={(e) => setQuartier(e.target.value)}
              placeholder="Ex. Les Pins"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-[var(--navy)]">Caractéristiques & prix</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className={labelClass}>Chambres</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={bedrooms}
              onChange={(e) => setBedrooms(Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Salles de bain</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={bathrooms}
              onChange={(e) => setBathrooms(Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Capacité</label>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Surface (m²)</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
              placeholder="120"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Prix (DZD) *</label>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="25000"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Unité de prix *</label>
            <div className="flex gap-2">
              {(["nuit", "mois"] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setPriceUnit(unit)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    priceUnit === unit
                      ? "border-[var(--gold)] bg-[var(--navy)] text-[var(--gold)]"
                      : "border-black/10 bg-white text-[var(--muted)] hover:border-[var(--gold)]/50"
                  }`}
                >
                  / {unit}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-[var(--navy)]">Équipements</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((item) => {
            const active = amenities.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleAmenity(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--navy)]"
                    : "border-black/10 bg-white text-[var(--muted)] hover:border-[var(--gold)]/40"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-[var(--navy)]">Description</h2>
        <textarea
          className={`${inputClass} mt-4 min-h-[120px] resize-y`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez le bien, le quartier, les atouts..."
          rows={5}
        />
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
        <ImageGalleryField images={images} onChange={setImages} />
      </section>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push(resolvedCancelHref)}
          className="rounded-full border border-black/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--navy)] hover:border-[var(--navy)] transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[var(--gold)] px-8 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--navy)] hover:bg-[var(--gold-soft)] disabled:opacity-60 transition-colors"
        >
          {submitting ? "Envoi..." : "Soumettre pour validation"}
        </button>
      </div>
    </form>
  );
}
