import Link from "next/link";
import RequireAuth from "@/components/auth/RequireAuth";

const nav = [
  { href: "/admin", label: "Validation" },
  { href: "/agence", label: "Espace agence" },
  { href: "/proprietaire", label: "Espace propriétaire" },
  { href: "/", label: "Accueil public" },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth roles={["admin"]}>
      <div className="min-h-screen bg-[#eef1f4]">
        <header className="bg-[var(--navy)] text-white">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link href="/admin" className="font-display text-xl font-semibold tracking-[0.12em]">
              AXXAM <span className="text-[var(--gold)]">Admin</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-4">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60 hover:text-[var(--gold)] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">{children}</main>
      </div>
    </RequireAuth>
  );
}
