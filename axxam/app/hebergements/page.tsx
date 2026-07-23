import { Suspense } from "react";
import HebergementsBrowse from "@/components/listings/HebergementsBrowse";

export default function HebergementsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-[var(--muted)]">Chargement…</p>}>
      <HebergementsBrowse />
    </Suspense>
  );
}
