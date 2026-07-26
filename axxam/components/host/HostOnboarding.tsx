"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageGalleryField from "@/components/agency/ImageGalleryField";
import { useAuth } from "@/components/auth/AuthProvider";
import { publishProperty } from "@/lib/api";
import { publishHelpMessage, whatsappHref } from "@/lib/whatsapp";
import { ALGERIAN_CITIES } from "@/types/agency";

const STEPS = ["Bienvenue", "Photos", "Prix & lieu", "Publication"] as const;

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[var(--ink)] outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20";

/** Parcours simple « publier mon 1er bien » + aide WhatsApp. */
export default function HostOnboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("maison");
  const [city, setCity] = useState("Alger");
  const [price, setPrice] = useState("10000");
  const [bedrooms, setBedrooms] = useState(2);
  const [capacity, setCapacity] = useState(4);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [hasPool, setHasPool] = useState(false);

  const canNext = useMemo(() => {
    if (step === 0) return true;
    if (step === 1) return images.length >= 1;
    if (step === 2) return Boolean(name.trim() && city && Number(price) > 0);
    return true;
  }, [step, images.length, name, city, price]);

  const submit = async () => {
    if (!user) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "axxam_draft_listing",
          JSON.stringify({ name, type, city, price, bedrooms, capacity, description, images, hasPool })
        );
      }
      router.push("/register?next=/publier&role=owner");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const amenities = ["Wi-Fi", "Climatisation"];
      if (hasPool) amenities.push("Piscine privée");

      await publishProperty({
        name: name.trim(),
        type,
        category: hasPool ? "piscine-privee" : "famille",
        transaction: "location",
        city,
        commune: "",
        quartier: "",
        price: Number(price),
        priceUnit: "nuit",
        bedrooms,
        bathrooms: 1,
        capacity,
        surface: 0,
        description: description.trim() || `${name} — publié via l'onboarding AXXAM.`,
        amenities,
        images,
        host: user.displayName || "Hôte",
        agencyId: user.id,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publication impossible");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center">
        <p className="text-4xl">✓</p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--navy)]">
          Annonce envoyée
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Elle sera visible après validation par un administrateur AXXAM.
        </p>
        <Link
          href={user?.role === "agency" ? "/agence" : "/proprietaire"}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--navy)] px-6 text-sm font-bold text-white"
        >
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <ol className="mb-8 flex gap-1">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <div
              className={`h-1.5 rounded-full ${i <= step ? "bg-[var(--gold)]" : "bg-black/10"}`}
            />
            <p
              className={`mt-2 text-center text-[10px] font-bold uppercase tracking-wider ${
                i === step ? "text-[var(--navy)]" : "text-[var(--muted)]"
              }`}
            >
              {label}
            </p>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-black/8 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-8">
        {step === 0 && (
          <div className="space-y-4">
            <h1 className="font-display text-3xl font-semibold text-[var(--navy)]">
              Publier mon 1<sup>er</sup> bien
            </h1>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              En 4 étapes : photos, prix, lieu. Votre annonce est vérifiée avant mise en ligne.
              Le voyageur paie <strong>chez vous</strong> — pas de commission carte en ligne.
            </p>
            <ul className="space-y-2 text-sm text-[var(--ink)]">
              <li className="flex gap-2">
                <span className="text-[var(--gold)]">1.</span> Ajoutez au moins 1 photo
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--gold)]">2.</span> Indiquez le prix à la nuit (DA)
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--gold)]">3.</span> Choisissez la wilaya
              </li>
            </ul>
            <a
              href={whatsappHref(publishHelpMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 text-sm font-bold text-[#128C7E]"
            >
              Besoin d&apos;aide ? WhatsApp
            </a>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-[var(--navy)]">Photos</h2>
            <p className="text-sm text-[var(--muted)]">Au moins une photo claire du séjour.</p>
            <ImageGalleryField images={images} onChange={setImages} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-[var(--navy)]">Prix & lieu</h2>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[var(--navy)]">Titre</span>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Villa vue mer — Tipaza"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[var(--navy)]">Type</span>
                <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="villa">Villa</option>
                  <option value="maison">Maison</option>
                  <option value="f2">Appartement F2</option>
                  <option value="f3">Appartement F3</option>
                  <option value="studio">Studio</option>
                  <option value="duplex">Duplex</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[var(--navy)]">Wilaya</span>
                <select className={inputClass} value={city} onChange={(e) => setCity(e.target.value)}>
                  {ALGERIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[var(--navy)]">
                Prix / nuit (DA)
              </span>
              <input
                className={inputClass}
                type="number"
                min={1000}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[var(--navy)]">Chambres</span>
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[var(--navy)]">
                  Voyageurs
                </span>
                <input
                  className={inputClass}
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                />
              </label>
            </div>
            <label className="flex min-h-12 items-center gap-3 rounded-xl border border-black/10 px-4 py-3">
              <input
                type="checkbox"
                checked={hasPool}
                onChange={(e) => setHasPool(e.target.checked)}
                className="h-5 w-5 accent-[var(--gold)]"
              />
              <span className="text-sm font-medium">Piscine privée</span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[var(--navy)]">
                Description (optionnel)
              </span>
              <textarea
                className={`${inputClass} min-h-[100px]`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Quartier, accès plage, règles de la maison…"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-[var(--navy)]">Publier</h2>
            <div className="rounded-xl bg-[var(--sand-soft)] p-4 text-sm">
              <p className="font-semibold text-[var(--navy)]">{name || "Sans titre"}</p>
              <p className="mt-1 text-[var(--muted)]">
                {city} · {Number(price).toLocaleString("fr-DZ")} DA / nuit · {images.length} photo
                {images.length > 1 ? "s" : ""}
              </p>
            </div>
            {!user && (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Créez un compte propriétaire pour envoyer l&apos;annonce (brouillon conservé).
              </p>
            )}
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="min-h-12 flex-1 rounded-xl border border-black/15 text-sm font-bold text-[var(--navy)]"
            >
              Retour
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              className="min-h-12 flex-[2] rounded-xl bg-[var(--gold)] text-sm font-bold text-white disabled:opacity-40"
            >
              Continuer
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => void submit()}
              className="min-h-12 flex-[2] rounded-xl bg-[var(--navy)] text-sm font-bold text-white disabled:opacity-40"
            >
              {busy ? "Envoi…" : user ? "Envoyer pour validation" : "Créer mon compte"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
