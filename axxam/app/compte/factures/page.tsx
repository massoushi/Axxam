import { Suspense } from "react";
import FacturesClient from "@/components/bookings/FacturesClient";

export default function FacturesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--muted)]">Chargement…</p>}>
      <FacturesClient />
    </Suspense>
  );
}
