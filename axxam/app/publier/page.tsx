import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import HostOnboarding from "@/components/host/HostOnboarding";

export const metadata: Metadata = {
  title: "Publier mon bien | AXXAM",
  description:
    "Publiez votre premier logement sur AXXAM en quelques étapes. Photos, prix, wilaya — aide WhatsApp disponible.",
};

export default function PublierPage() {
  return (
    <SiteShell>
      <div className="container mx-auto max-w-3xl px-4 py-8 pb-28 sm:px-6 sm:py-12">
        <HostOnboarding />
      </div>
    </SiteShell>
  );
}
