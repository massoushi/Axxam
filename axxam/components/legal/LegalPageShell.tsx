import Link from "next/link";
import SiteShell from "@/components/layout/SiteShell";

export function LegalPageShell({
  title,
  eyebrow,
  updated,
  children,
}: {
  title: string;
  eyebrow: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--gold-deep)]">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-[var(--navy)]">{title}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Dernière mise à jour : {updated}</p>

        <div className="prose-axxam mt-10 space-y-8 text-sm leading-relaxed text-[var(--ink)]">
          {children}
        </div>

        <div className="mt-12 flex flex-wrap gap-3 border-t border-[var(--sand)] pt-8">
          <Link
            href="/register"
            className="rounded-full bg-[var(--gold)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
          >
            Retour à l&apos;inscription
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[var(--navy)]/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--navy)]"
          >
            Accueil
          </Link>
        </div>
      </article>
    </SiteShell>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-[var(--navy)]">{title}</h2>
      <div className="mt-3 space-y-3 text-[var(--muted)]">{children}</div>
    </section>
  );
}
