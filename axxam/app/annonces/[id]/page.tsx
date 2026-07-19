import PropertyDetailView from "@/components/property/PropertyDetailView";
import SiteShell from "@/components/layout/SiteShell";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function AnnonceDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { from } = await searchParams;
  const fromAdmin = from === "admin";

  if (fromAdmin) {
    return (
      <div className="min-h-screen bg-[var(--surface)]">
        <PropertyDetailView id={id} fromAdmin />
      </div>
    );
  }

  return (
    <SiteShell>
      <PropertyDetailView id={id} fromAdmin={false} />
    </SiteShell>
  );
}
