import Link from "next/link";

export default function PromoBanner() {
  return (
    <section className="container mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-[var(--navy)] px-8 py-12 sm:px-12">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[var(--gold)]/20 blur-3xl" />
        <div className="absolute -bottom-16 left-1/4 h-40 w-40 rounded-full bg-[var(--sand)]/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--sand)]">
              Propriétaires
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
              Proposez votre logement sur{" "}
              <span className="text-[var(--gold-soft)]">axxam</span>
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/60">
              Publiez, gérez le calendrier et recevez des réservations — simplement.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--gold)] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-[var(--gold-deep)] transition-colors"
          >
            Commencer
          </Link>
        </div>
      </div>
    </section>
  );
}
