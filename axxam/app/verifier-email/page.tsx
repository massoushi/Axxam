import type { Metadata } from "next";
import { Suspense } from "react";
import SiteShell from "@/components/layout/SiteShell";
import VerifyEmailClient from "@/components/auth/VerifyEmailClient";

export const metadata: Metadata = {
  title: "Vérifier mon e-mail | AXXAM",
  description: "Confirmez votre adresse e-mail pour activer votre compte AXXAM.",
};

export default function VerifierEmailPage() {
  return (
    <SiteShell>
      <Suspense
        fallback={
          <div className="px-4 py-16 text-center text-sm text-[var(--muted)]">Chargement…</div>
        }
      >
        <VerifyEmailClient />
      </Suspense>
    </SiteShell>
  );
}
