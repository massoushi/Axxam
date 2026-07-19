import Link from "next/link";

export default function PromoBanner() {
  return (
    <section className="container mx-auto max-w-6xl px-4 sm:px-6 py-6">
      <div className="relative overflow-hidden rounded-3xl bg-[var(--navy-mid)] px-8 py-10 sm:px-12 sm:py-12">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[var(--gold)]/15 blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-[var(--gold)]/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">Offre spéciale</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-white">
              Jusqu&apos;à <span className="text-[var(--gold-soft)]">-20%</span> sur les sélections premium
            </h2>
          </div>
          <Link
            href="/annonces"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--navy)] hover:bg-[var(--gold-soft)] transition-colors"
          >
            En profiter
          </Link>
        </div>
      </div>
    </section>
  );
}
