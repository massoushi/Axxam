import Link from "next/link";
import RequireAuth from "@/components/auth/RequireAuth";

const nav = [
  { href: "/agence", label: "Biens" },
  { href: "/agence/publier", label: "Ajouter" },
  { href: "/agence/reservations", label: "Réservations" },
  { href: "/messages", label: "Messages" },
];

export default function AgenceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth roles={["agency", "admin"]}>
      <div className="min-h-screen bg-[#eef1f4]">
        <header className="bg-[var(--navy)] text-white">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/agence" className="font-display text-xl font-semibold tracking-[0.14em]">
              AXXAM <span className="text-[var(--gold)]">Agence</span>
            </Link>
            <Link href="/" className="text-[10px] font-semibold uppercase tracking-wider text-white/50 hover:text-white">
              Site
            </Link>
          </div>
          <nav className="border-t border-white/10">
            <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-4 sm:px-6 no-scrollbar">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 border-b-2 border-transparent px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-[1400px] px-3 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </RequireAuth>
  );
}
