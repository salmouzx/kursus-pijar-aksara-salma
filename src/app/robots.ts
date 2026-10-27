import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pijaraksara.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/course", "/kursus/"],
        disallow: [
          "/dashboard",
          "/kursus-saya",
          "/belajar/",
          "/instruktur/",
          "/sertifikat/",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
