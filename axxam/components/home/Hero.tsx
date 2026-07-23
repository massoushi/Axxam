"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { ALGERIAN_CITIES } from "@/types/agency";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2400&q=80";

export default function Hero() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [mode, setMode] = useState<"nuit" | "mois" | "vente">("nuit");
  const [guests, setGuests] = useState("2");

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);

    if (mode === "vente") {
      if (city) params.set("city", city);
      router.push(params.toString() ? `/immobilier?${params}` : "/immobilier");
      return;
    }

    if (mode === "mois") {
      params.set("transaction", "location");
      params.set("priceUnit", "mois");
      router.push(`/annonces?${params.toString()}`);
      return;
    }

    if (city) params.set("city", city);
    if (guests) params.set("guests", guests);
    router.push(params.toString() ? `/hebergements?${params}` : "/hebergements");
  };

  return (
    <section className="relative overflow-hidden bg-[var(--navy)]">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Séjour en Algérie"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy)]/75 via-[var(--navy)]/45 to-[var(--navy)]/90" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--navy)] to-transparent" />
        <div className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-[var(--gold)]/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[var(--sand)]/10 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20">
        <div className="animate-gold-line mx-auto mb-5 h-px w-16 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent sm:mx-0" />

        <p className="animate-fade-up axxam-eyebrow text-[var(--sand)]">
          Hébergement &amp; Location · Algérie
        </p>

        <p className="animate-fade-up mt-4 font-display text-5xl font-semibold tracking-[0.1em] text-white sm:text-6xl md:text-7xl">
          ax<span className="text-[var(--gold)]">x</span>am
        </p>

        <h1 className="animate-fade-up-delay mt-5 max-w-xl font-display text-2xl font-medium leading-snug text-white/95 sm:text-3xl md:text-[2.15rem]">
          Trouvez votre prochain séjour en Algérie
        </h1>
        <p className="animate-fade-up-delay mt-3 max-w-md text-sm leading-relaxed text-white/55">
          Villas, appartements et biens à vendre — réservation simple, partout dans le pays.
        </p>
        <p className="animate-fade-up-delay mt-2 text-sm text-white/45" dir="rtl" lang="ar">
          أخام — سكن وإيجار
        </p>

        <form
          onSubmit={search}
          className="animate-fade-up-delay-2 mt-9 overflow-hidden rounded-3xl border border-[var(--sand)]/25 bg-white/97 shadow-[var(--shadow-lift)] backdrop-blur-sm sm:mt-11 sm:rounded-full"
        >
          <div className="grid sm:grid-cols-[1.4fr_1fr_0.9fr_auto]">
            <label className="border-b border-black/5 px-5 py-3.5 sm:border-b-0 sm:border-r">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--gold-deep)]">
                Où
              </span>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-0.5 w-full bg-transparent text-sm text-[var(--ink)] outline-none"
              >
                <option value="">Explorer les destinations</option>
                {ALGERIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="border-b border-black/5 px-5 py-3.5 sm:border-b-0 sm:border-r">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--gold-deep)]">
                Type
              </span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as typeof mode)}
                className="mt-0.5 w-full bg-transparent text-sm text-[var(--ink)] outline-none"
              >
                <option value="nuit">Séjour / nuit</option>
                <option value="mois">Location longue durée</option>
                <option value="vente">Achat immobilier</option>
              </select>
            </label>

            <label className="border-b border-black/5 px-5 py-3.5 sm:border-b-0 sm:border-r">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--gold-deep)]">
                Voyageurs
              </span>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                disabled={mode === "vente"}
                className="mt-0.5 w-full bg-transparent text-sm text-[var(--ink)] outline-none disabled:opacity-40"
              >
                <option value="1">1 voyageur</option>
                <option value="2">2 voyageurs</option>
                <option value="4">4 voyageurs</option>
                <option value="6">6+ voyageurs</option>
              </select>
            </label>

            <div className="flex items-center justify-end p-2">
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-6 text-xs font-bold uppercase tracking-wider text-white shadow-[var(--shadow-gold)] transition-all hover:bg-[var(--gold-deep)] hover:scale-[1.02] sm:w-auto"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Rechercher
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
