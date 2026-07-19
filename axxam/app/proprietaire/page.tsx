"use client";

import AgencyDashboard from "@/components/agency/AgencyDashboard";
import { useAuth } from "@/components/auth/AuthProvider";

export default function ProprietairePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <AgencyDashboard
        publisherId={user.id}
        publishHref="/proprietaire/publier"
        title="Mes biens"
        subtitle={`${user.displayName} · ${user.wilaya || "Algérie"}`}
      />
    </div>
  );
}
