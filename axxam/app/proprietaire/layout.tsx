import Link from "next/link";
import RequireAuth from "@/components/auth/RequireAuth";

export default function ProprietaireLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth roles={["owner", "admin"]}>
      <div className="min-h-screen bg-[var(--surface)]">
        <header className="border-b border-black/5 bg-white">
          <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/proprietaire" className="font-display text-lg font-semibold text-[var(--navy)]">
              Espace propriétaire
            </Link>
            <nav className="flex items-center gap-4 text-xs font-semibold text-[var(--muted)]">
              <Link href="/proprietaire" className="hover:text-[var(--navy)]">
                Tableau de bord
              </Link>
              <Link href="/proprietaire/publier" className="hover:text-[var(--navy)]">
                Publier
              </Link>
              <Link href="/proprietaire/reservations" className="hover:text-[var(--navy)]">
                Locations
              </Link>
              <Link href="/" className="hover:text-[var(--navy)]">
                Accueil
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </div>
    </RequireAuth>
  );
}
