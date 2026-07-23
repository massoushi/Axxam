import Link from "next/link";
import RequireAuth from "@/components/auth/RequireAuth";
import SiteShell from "@/components/layout/SiteShell";

export default function CompteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth roles={["client"]}>
      <SiteShell>
        <div className="border-b border-black/5 bg-white">
          <div className="container mx-auto flex flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gold-deep)]">
              Espace voyageur
            </p>
            <nav className="flex items-center gap-4 text-xs font-semibold text-[var(--muted)]">
              <Link href="/compte/reservations" className="hover:text-[var(--navy)]">
                Séjours
              </Link>
              <Link href="/compte/factures" className="hover:text-[var(--navy)]">
                Factures
              </Link>
              <Link href="/favoris" className="hover:text-[var(--navy)]">
                Favoris
              </Link>
              <Link href="/messages" className="hover:text-[var(--navy)]">
                Messages
              </Link>
              <Link href="/compte/profil" className="hover:text-[var(--navy)]">
                Profil
              </Link>
            </nav>
          </div>
        </div>
        <main className="container mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</main>
      </SiteShell>
    </RequireAuth>
  );
}
