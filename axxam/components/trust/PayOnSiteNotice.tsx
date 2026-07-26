import Link from "next/link";

/** Rappel clair : pas de paiement en ligne — règlement chez l'hôte. */
export default function PayOnSiteNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200/70">
        Paiement <strong>chez l&apos;hôte</strong> (espèces / virement local) — pas de carte sur AXXAM.{" "}
        <Link href="/conditions#paiements" className="font-semibold underline underline-offset-2">
          Voir les CGU
        </Link>
      </p>
    );
  }

  return (
    <aside className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-[var(--sand-soft)] p-4 sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800/80">Confiance</p>
      <h3 className="mt-1 font-display text-lg font-semibold text-[var(--navy)]">
        Paiement chez l&apos;hôte
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
        AXXAM met en relation voyageurs et hôtes. Vous demandez une réservation ici ; le règlement se
        fait <strong className="text-[var(--ink)]">directement chez l&apos;agence ou le propriétaire</strong>
        , hors plateforme. Aucun paiement en ligne n&apos;est demandé.
      </p>
      <Link
        href="/conditions#paiements"
        className="mt-3 inline-flex text-sm font-semibold text-[var(--gold-deep)] underline-offset-2 hover:underline"
      >
        Lire les conditions →
      </Link>
    </aside>
  );
}
