"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/layout/Logo";

/**
 * Évite le 404 sur /auth/callback (URL souvent mise dans Supabase Redirect URLs).
 * La vérif e-mail AXXAM native utilise /verifier-email.
 */
function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState("Redirection…");

  useEffect(() => {
    const error = searchParams.get("error_description") || searchParams.get("error");
    if (error) {
      setMsg(String(error));
      return;
    }

    const ourToken = searchParams.get("token");
    if (ourToken) {
      router.replace(`/verifier-email?token=${encodeURIComponent(ourToken)}`);
      return;
    }

    // Fragment Supabase (#access_token=…&type=signup) — pas de SDK Supabase ici
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      setMsg(
        "Lien Supabase reçu, mais AXXAM n’utilise pas encore Supabase Auth. Utilisez le lien de vérification AXXAM ou connectez-vous."
      );
      return;
    }

    router.replace("/verifier-email?pending=1");
  }, [router, searchParams]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <Logo size={64} href="/" />
      <p className="mt-6 text-sm text-[var(--muted)]">{msg}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/verifier-email" className="text-sm font-semibold text-[var(--gold-deep)] underline">
          Vérifier mon e-mail
        </Link>
        <Link href="/login" className="text-sm font-semibold text-[var(--navy)] underline">
          Connexion
        </Link>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-16 text-center text-sm text-[var(--muted)]">Chargement…</div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
