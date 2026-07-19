"use client";

import AgencyDashboard from "@/components/agency/AgencyDashboard";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AgencePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <AgencyDashboard
      publisherId={user.id}
      publishHref="/agence/publier"
      title="Biens de l'agence"
      subtitle={user.agencyName || user.displayName}
    />
  );
}
