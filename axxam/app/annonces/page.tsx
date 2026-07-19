import { Suspense } from "react";
import AnnoncesBrowse from "@/components/listings/AnnoncesBrowse";

export default function AnnoncesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--muted)]">
          Chargement des annonces...
        </div>
      }
    >
      <AnnoncesBrowse />
    </Suspense>
  );
}
