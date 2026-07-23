import Link from "next/link";

export default function AdminComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--sand)]/80 bg-white px-6 py-14 text-center shadow-[var(--shadow-soft)]">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--gold-deep)]">
        Module en préparation
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--navy)]">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">
        {description ||
          "Cette section de l’administration générale sera connectée aux données de la plateforme dans une prochaine itération."}
      </p>
      <Link
        href="/admin"
        className="mt-6 inline-flex rounded-full bg-[var(--navy)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--gold)]"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}
