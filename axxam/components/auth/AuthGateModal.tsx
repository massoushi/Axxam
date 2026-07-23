"use client";

import Link from "next/link";
import Logo from "@/components/layout/Logo";
import { useEffect } from "react";

type AuthGateModalProps = {
  onClose: () => void;
  title?: string;
  message?: string;
};

export default function AuthGateModal({
  onClose,
  title = "Créez un compte pour réserver",
  message = "Vous pouvez parcourir toutes les annonces librement. Pour réserver, créez un compte client ou connectez-vous.",
}: AuthGateModalProps) {
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const unlockScroll = () => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--navy)]/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--sand)]/40 bg-white p-6 shadow-[var(--shadow-lift)] sm:p-8">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--gold)]/10 blur-2xl" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface)] text-sm text-[var(--navy)] transition-colors hover:bg-[var(--sand)]"
        >
          ✕
        </button>

        <div className="relative flex flex-col items-center text-center">
          <Logo size={64} href={null} />
          <p className="mt-4 axxam-eyebrow">AXXAM</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--navy)]">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{message}</p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          En créant un compte, vous acceptez les{" "}
          <Link href="/conditions" className="font-semibold text-[var(--gold-deep)] underline">
            Conditions
          </Link>{" "}
          et la{" "}
          <Link href="/confidentialite" className="font-semibold text-[var(--gold-deep)] underline">
            Confidentialité
          </Link>
          .
        </p>
        </div>

        <div className="relative mt-6 flex flex-col gap-2">
          <Link
            href="/register"
            onClick={unlockScroll}
            className="rounded-full bg-[var(--gold)] py-3 text-center text-xs font-bold uppercase tracking-wider text-white shadow-[var(--shadow-gold)]"
          >
            Créer un compte
          </Link>
          <Link
            href="/login"
            onClick={unlockScroll}
            className="rounded-full border border-[var(--navy)]/10 py-3 text-center text-xs font-bold uppercase tracking-wider text-[var(--navy)]"
          >
            Se connecter
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--navy)]"
          >
            Continuer à explorer
          </button>
        </div>
      </div>
    </div>
  );
}
