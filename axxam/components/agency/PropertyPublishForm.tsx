"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import ImageGalleryField from "@/components/agency/ImageGalleryField";
import { publishProperty } from "@/lib/api";
import {
  ALGERIAN_CITIES,
  AMENITY_OPTIONS,
  OFFER_PRESETS,
  POOL_OPTIONS,
  PRICE_UNITS,
  PROPERTY_CATEGORIES,
  PROPERTY_TYPE_GROUPS,
  PROPERTY_TYPES,
  type PoolOption,
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

  const [offerPreset, setOfferPreset] = useState("sejour");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [hasPool, setHasPool] = useState<PoolOption | "">("");
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

  const isHousingType = !["terrain", "vehicule", "local-commercial", "bureau", "immeuble"].includes(type);

  const applyPreset = (presetId: string) => {
    const preset = OFFER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setOfferPreset(presetId);
    setTransaction(preset.transaction);
    setPriceUnit(preset.priceUnit);
    if (preset.defaultType) {
      setType(preset.defaultType);
      const suggested = PROPERTY_TYPES.find((t) => t.value === preset.defaultType)?.bedrooms;
      if (suggested != null) setBedrooms(suggested);
      if (preset.defaultType === "vehicule") {
        setCategory("voiture");
        setHasPool("na");
      }
      if (preset.defaultType === "terrain") {
        setHasPool("na");
      }
    }
  };

  const selectType = (next: string) => {
    setType(next);
    const meta = PROPERTY_TYPES.find((t) => t.value === next);
    if (meta) setBedrooms(meta.bedrooms);
    if (["terrain", "vehicule", "local-commercial", "bureau"].includes(next)) {
      setHasPool("na");
      if (next === "terrain") setCategory("urbain");
      if (next === "vehicule") setCategory("voiture");
    } else if (hasPool === "na" || !hasPool) {
      setHasPool("");
    }
  };

  const selectPool = (value: PoolOption) => {
    setHasPool(value);
    if (value === "avec-piscine") {
      setCategory("piscine-privee");
      setAmenities((prev) => (prev.includes("Piscine") ? prev : [...prev, "Piscine"]));
    } else if (value === "sans-piscine") {
      setAmenities((prev) => prev.filter((a) => a !== "Piscine" && a !== "Piscine privée"));
      if (category === "piscine-privee") setCategory("autre");
    }
  };

  const toggleAmenity = (item: string) => {
    setAmenities((prev) => (prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!type) {
      setError("Veuillez préciser le type de bien (F1, F2, villa, terrain, duplex…).");
      return;
    }
    if (!hasPool) {
      setError("Indiquez si le bien est avec piscine, sans piscine, ou non concerné.");
      return;
    }

    setSubmitting(true);

    const finalAmenities = [...amenities];
    if (hasPool === "avec-piscine" && !finalAmenities.includes("Piscine")) {
      finalAmenities.push("Piscine");
    }

    try {
      const result = await publishProperty({
        name,
        type,
        category: hasPool === "avec-piscine" ? "piscine-privee" : category,
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
        amenities: finalAmenities,
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
        <h2 className="font-display text-2xl font-semibold text-[var(--navy)]">Type d&apos;offre</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Choisissez d&apos;abord ce que vous proposez — le formulaire s&apos;adapte automatiquement.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {OFFER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                offerPreset === preset.id
                  ? "border-[var(--gold)] bg-[var(--navy)] text-white"
                  : "border-black/10 bg-white hover:border-[var(--gold)]/50"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  offerPreset === preset.id ? "text-[var(--gold)]" : "text-[var(--navy)]"
                }`}
              >
                {preset.label}
              </p>
              <p
                className={`mt-1 text-xs ${
                  offerPreset === preset.id ? "text-white/60" : "text-[var(--muted)]"
                }`}
              >
                {preset.hint}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-[var(--navy)]">Type de bien *</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Obligatoire : précisez la typologie (F1, F2… F8, villa, duplex, terrain…) puis piscine.
        </p>

        <div className="mt-5 space-y-5">
          {PROPERTY_TYPE_GROUPS.map((group) => (
            <div key={group.id}>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--gold-deep)]">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.filter((t) => t.group === group.id).map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => selectType(t.value)}
                    className={`rounded-full border px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                      type === t.value
                        ? "border-[var(--gold)] bg-[var(--navy)] text-[var(--gold)]"
                        : "border-black/10 bg-white text-[var(--navy)] hover:border-[var(--gold)]/50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!type && (
          <p className="mt-3 text-xs font-medium text-amber-700">Sélectionnez un type de bien pour continuer.</p>
        )}

        <div className="mt-6">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--gold-deep)]">
            Piscine *
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {POOL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => selectPool(opt.value)}
                className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                  hasPool === opt.value
                    ? "border-[var(--gold)] bg-[var(--navy)] text-white"
                    : "border-black/10 bg-white hover:border-[var(--gold)]/50"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    hasPool === opt.value ? "text-[var(--gold)]" : "text-[var(--navy)]"
                  }`}
                >
                  {opt.label}
                </p>
                <p className={`mt-0.5 text-xs ${hasPool === opt.value ? "text-white/60" : "text-[var(--muted)]"}`}>
                  {opt.hint}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-[var(--navy)]">Informations générales</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Titre et détails de l&apos;annonce</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Titre de l&apos;annonce *</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                type
                  ? `Ex. ${PROPERTY_TYPES.find((t) => t.value === type)?.label || "Bien"} Hydra — vue mer`
                  : "Ex. F3 Hydra — vue mer"
              }
              required
            />
          </div>

          <div className="sm:col-span-2 rounded-xl border border-dashed border-[var(--navy)]/15 bg-[var(--surface)] px-4 py-3 text-sm text-[var(--navy)]">
            <span className="font-semibold">Récapitulatif : </span>
            {type ? PROPERTY_TYPES.find((t) => t.value === type)?.label : "Type non choisi"}
            {" · "}
            {hasPool === "avec-piscine"
              ? "Avec piscine"
              : hasPool === "sans-piscine"
                ? "Sans piscine"
                : hasPool === "na"
                  ? "Piscine non concernée"
                  : "Piscine non précisée"}
          </div>

          {isHousingType && type && (
            <div>
              <label className={labelClass}>Ambiance / emplacement</label>
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                {PROPERTY_CATEGORIES.filter(
                  (c) => !["voiture", "utilitaire", "urbain", "agricole"].includes(c.value)
                ).map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            <div className="grid grid-cols-2 gap-2">
              {PRICE_UNITS.map((unit) => (
                <button
                  key={unit.value}
                  type="button"
                  onClick={() => setPriceUnit(unit.value)}
                  className={`rounded-xl border px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    priceUnit === unit.value
                      ? "border-[var(--gold)] bg-[var(--navy)] text-[var(--gold)]"
                      : "border-black/10 bg-white text-[var(--muted)] hover:border-[var(--gold)]/50"
                  }`}
                >
                  {unit.label}
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
