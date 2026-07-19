"use client";

import Link from "next/link";
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm hover:bg-gray-200"
        >
          ✕
        </button>

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--gold-deep)]">
          AXXAM
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--navy)]">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{message}</p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/register"
            onClick={unlockScroll}
            className="rounded-full bg-[var(--gold)] py-3 text-center text-xs font-bold uppercase tracking-wider text-[var(--navy)]"
          >
            Créer un compte
          </Link>
          <Link
            href="/login"
            onClick={unlockScroll}
            className="rounded-full border border-black/10 py-3 text-center text-xs font-bold uppercase tracking-wider text-[var(--navy)]"
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
