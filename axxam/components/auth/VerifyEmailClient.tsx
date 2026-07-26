"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/layout/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { dashboardPathForRole } from "@/lib/auth-storage";
import { resendVerificationRequest, verifyEmailRequest } from "@/lib/api";

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applySession } = useAuth();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const cleanCode = code.replace(/\D/g, "");
    if (!email.trim()) {
      setError("Indiquez votre e-mail");
      return;
    }
    if (cleanCode.length !== 6) {
      setError("Entrez le code à 6 chiffres reçu par e-mail");
      return;
    }

    setBusy(true);
    try {
      const res = await verifyEmailRequest(email.trim(), cleanCode);
      setDone(true);
      setMessage(res.message || "E-mail vérifié");
      if (res.data.token) {
        applySession(res.data.token, res.data.user);
        router.push(dashboardPathForRole(res.data.user.role));
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code incorrect");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!email.trim()) {
      setError("Indiquez votre e-mail pour renvoyer le code");
      return;
    }
    setResendBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await resendVerificationRequest(email.trim());
      setMessage(res.message || "Nouveau code envoyé");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible");
    } finally {
      setResendBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size={72} href="/" />
        <h1 className="mt-6 font-display text-3xl font-semibold text-[var(--navy)]">
          Code de vérification
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Entrez le code à 6 chiffres envoyé par e-mail pour activer votre compte.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-black/8 bg-white p-6 shadow-[var(--shadow-soft)]"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--navy)]">E-mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
            placeholder="vous@exemple.dz"
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--navy)]">
            Code à 6 chiffres
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-xl border border-black/10 px-4 py-4 text-center text-2xl font-bold tracking-[0.35em] text-[var(--navy)] outline-none focus:border-[var(--gold)]"
            placeholder="••••••"
            autoComplete="one-time-code"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        {message && !error && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
        )}

        <button
          type="submit"
          disabled={busy || done}
          className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--gold)] text-sm font-bold text-white disabled:opacity-40"
        >
          {busy ? "Vérification…" : "Valider le code"}
        </button>

        <button
          type="button"
          disabled={resendBusy}
          onClick={() => void resend()}
          className="flex min-h-12 w-full items-center justify-center rounded-xl border border-black/10 text-sm font-bold text-[var(--navy)] disabled:opacity-40"
        >
          {resendBusy ? "Envoi…" : "Renvoyer le code"}
        </button>

        <Link
          href="/login"
          className="block text-center text-sm font-semibold text-[var(--gold-deep)]"
        >
          Retour à la connexion
        </Link>
      </form>
    </div>
  );
}
