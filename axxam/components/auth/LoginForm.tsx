"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { dashboardPathForRole } from "@/lib/auth-storage";
import Logo from "@/components/layout/Logo";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  useEffect(() => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hint = useMemo(() => "Admin démo : admin@axxam.dz / Admin123!", []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(next || dashboardPathForRole(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-y-auto bg-[var(--surface)]">
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-12">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size={88} href="/" />
          <h1 className="mt-6 font-display text-3xl font-semibold text-[var(--navy)]">Connexion</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Accédez à votre espace AXXAM</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-[var(--sand)]/60 bg-white p-6 shadow-[var(--shadow-soft)]"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--navy)]">Email</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--navy)]">Mot de passe</label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--gold)] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--gold-deep)] disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <p className="text-center text-xs text-[var(--muted)]">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-semibold text-[var(--gold-deep)] underline">
              Créer un compte
            </Link>
          </p>
          <p className="text-center text-[10px] text-[var(--muted)]">{hint}</p>
        </form>
      </div>
    </div>
  );
}
