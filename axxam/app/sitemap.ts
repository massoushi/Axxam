import type { MetadataRoute } from "next";
import { SEO_DESTINATIONS } from "@/lib/seo-destinations";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://axxam-sw0k.onrender.com";
  const now = new Date();

  const staticRoutes = ["", "/hebergements", "/immobilier", "/annonces", "/publier", "/conditions", "/confidentialite"].map(
    (path) => ({
      url: `${base}${path || "/"}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })
  );

  const seoRoutes = SEO_DESTINATIONS.map((d) => ({
    url: `${base}/location/${d.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...seoRoutes];
}
