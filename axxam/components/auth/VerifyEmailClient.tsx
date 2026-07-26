"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/layout/Logo";
import { resendVerificationRequest, verifyEmailRequest } from "@/lib/api";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";
  const pending = searchParams.get("pending") === "1";
  const devLink = searchParams.get("dev") || "";

  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    token ? "loading" : "idle"
  );
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState(emailParam);
  const [resendBusy, setResendBusy] = useState(false);
  const [devUrl, setDevUrl] = useState(devLink);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await verifyEmailRequest(token);
        if (cancelled) return;
        setStatus("ok");
        setMessage(res.message || "E-mail vérifié. Vous pouvez vous connecter.");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Vérification impossible");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const resend = async () => {
    if (!email.trim()) {
      setMessage("Indiquez votre adresse e-mail");
      return;
    }
    setResendBusy(true);
    setMessage(null);
    try {
      const res = await resendVerificationRequest(email.trim());
      setMessage(res.message || "E-mail envoyé");
      if (res.data?.verifyUrl) setDevUrl(res.data.verifyUrl);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Envoi impossible");
    } finally {
      setResendBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size={72} href="/" />
        <h1 className="mt-6 font-display text-3xl font-semibold text-[var(--navy)]">
          Vérification e-mail
        </h1>
      </div>

      <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-[var(--shadow-soft)]">
        {status === "loading" && (
          <p className="text-sm text-[var(--muted)]">Vérification en cours…</p>
        )}

        {status === "ok" && (
          <div className="space-y-4 text-center">
            <p className="text-4xl text-emerald-600">✓</p>
            <p className="text-sm text-[var(--ink)]">{message}</p>
            <Link
              href="/login"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--gold)] text-sm font-bold text-white"
            >
              Se connecter
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>
            <p className="text-sm text-[var(--muted)]">
              Demandez un nouveau lien ci-dessous.
            </p>
          </div>
        )}

        {(status === "idle" || status === "error" || pending) && status !== "ok" && (
          <div className="mt-2 space-y-4">
            {pending && status === "idle" && (
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                Un e-mail de confirmation a été envoyé
                {email ? (
                  <>
                    {" "}
                    à <strong className="text-[var(--ink)]">{email}</strong>
                  </>
                ) : null}
                . Ouvrez le lien pour activer votre compte (valide 24 h).
              </p>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[var(--navy)]">
                E-mail du compte
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[var(--gold)]"
                placeholder="vous@exemple.dz"
              />
            </label>

            {message && status !== "error" && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
            )}

            {devUrl && (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-900 break-all">
                Mode test (pas de SMTP) :{" "}
                <a href={devUrl} className="font-semibold underline">
                  ouvrir le lien de vérification
                </a>
              </p>
            )}

            <button
              type="button"
              disabled={resendBusy}
              onClick={() => void resend()}
              className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--navy)] text-sm font-bold text-white disabled:opacity-40"
            >
              {resendBusy ? "Envoi…" : "Renvoyer l'e-mail"}
            </button>

            <Link
              href="/login"
              className="block text-center text-sm font-semibold text-[var(--gold-deep)]"
            >
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
