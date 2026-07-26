import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://axxam-sw0k.onrender.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/agence", "/proprietaire", "/api"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
