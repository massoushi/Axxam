import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoDestinationBrowse from "@/components/listings/SeoDestinationBrowse";
import { getSeoDestination, SEO_DESTINATIONS } from "@/lib/seo-destinations";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SEO_DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = getSeoDestination(slug);
  if (!dest) return { title: "Destination | AXXAM" };
  return {
    title: dest.title,
    description: dest.description,
    keywords: dest.keywords,
    openGraph: {
      title: dest.title,
      description: dest.description,
      type: "website",
    },
  };
}

export default async function LocationSeoPage({ params }: Props) {
  const { slug } = await params;
  const dest = getSeoDestination(slug);
  if (!dest) notFound();
  return <SeoDestinationBrowse dest={dest} />;
}
