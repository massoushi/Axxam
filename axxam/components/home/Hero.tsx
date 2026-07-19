"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2400&q=80";

export default function Hero() {
  const { user, loading } = useAuth();

  return (
    <section className="relative min-h-[calc(100svh-5rem)] overflow-hidden bg-[var(--navy)]">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Villa de luxe avec piscine en Algérie"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--navy)]/75 via-[var(--navy)]/45 to-[var(--navy)]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy)]/80 via-transparent to-[var(--navy)]/30" />
      </div>

      <div className="relative z-10 flex min-h-[calc(100svh-5rem)] flex-col justify-end pb-16 pt-12 sm:pb-20 sm:pt-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <p className="animate-fade-up font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-[0.14em] text-white">
            AXXAM
          </p>
          <div className="animate-fade-up-delay mt-3 flex items-center gap-3">
            <span className="h-px w-10 animate-gold-line bg-[var(--gold)]" />
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-[var(--gold)]">
              Immobilier & Hébergement
            </p>
          </div>

          <h1 className="animate-fade-up-delay mt-8 max-w-2xl font-display text-2xl sm:text-3xl md:text-4xl font-medium leading-[1.2] text-white/95">
            Des lieux d&apos;exception,{" "}
            <span className="italic text-[var(--gold-soft)]">des expériences uniques.</span>
          </h1>

          <p className="animate-fade-up-delay-2 mt-4 max-w-md text-sm sm:text-base text-white/65 leading-relaxed">
            Trouvez. Réservez. Profitez. — la référence premium en Algérie.
          </p>

          <div className="animate-fade-up-delay-2 mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/annonces"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--navy)] hover:bg-[var(--gold-soft)] transition-colors"
            >
              Découvrir
            </Link>
            {!loading && !user && (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/35 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                Se connecter
              </Link>
            )}
            {!loading && user?.role === "client" && (
              <Link
                href="/compte/reservations"
                className="inline-flex items-center justify-center rounded-full border border-white/35 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                Mes réservations
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
