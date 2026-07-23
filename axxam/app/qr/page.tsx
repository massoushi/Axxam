import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteShell from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "QR Code AXXAM — Accéder au site",
  description: "Scannez le QR code pour ouvrir AXXAM sur votre téléphone.",
};

export default function QrPage() {
  return (
    <SiteShell>
      <div className="container mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-deep)]">
          Accès rapide
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-[var(--navy)] sm:text-4xl">
          QR code AXXAM
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Scannez avec l&apos;appareil photo du téléphone pour ouvrir le site.
        </p>

        <div className="mt-8 rounded-3xl border border-[var(--sand)] bg-white p-6 shadow-[var(--shadow-soft)]">
          <Image
            src="/qr-axxam.png"
            alt="QR code vers https://axxam-sw0k.onrender.com"
            width={280}
            height={280}
            className="mx-auto"
            priority
          />
        </div>

        <p className="mt-4 break-all text-xs text-[var(--muted)]">
          https://axxam-sw0k.onrender.com
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-[var(--navy)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--gold)]"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </SiteShell>
  );
}
