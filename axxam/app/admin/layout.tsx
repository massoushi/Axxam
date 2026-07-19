"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/components/auth/AuthProvider";

const nav = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/", label: "Site public" },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth roles={["admin"]}>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#e8ecf1]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--navy)] text-white">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <Link href="/admin" className="font-display text-xl font-semibold tracking-[0.12em]">
              AXXAM <span className="text-[var(--gold)]">Admin</span>
            </Link>
            {user && (
              <p className="mt-0.5 text-[11px] text-white/50">{user.displayName || user.email}</p>
            )}
          </div>
          <nav className="flex flex-wrap items-center gap-3 sm:gap-5">
            {nav.map((item) => {
              const active = item.href === "/admin" && pathname === "/admin";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    active ? "text-[var(--gold)]" : "text-white/60 hover:text-[var(--gold)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/80 hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              Déconnexion
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
