import Link from "next/link";
import SiteShell from "@/components/layout/SiteShell";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <SiteShell>
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="max-w-lg text-center">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
            AXXAM
          </p>
          <h1 className="mb-3 font-display text-3xl font-bold text-[var(--navy)]">{title}</h1>
          <p className="mb-8 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
          <p className="mb-6 text-xs font-semibold text-[var(--gold-deep)]">Bientôt disponible</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--navy)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#162A3B]"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    </SiteShell>
  );
}
