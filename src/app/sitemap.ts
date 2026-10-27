import { MetadataRoute } from "next";
import { getPublishedCourses } from "@/lib/courses";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pijaraksara.id";

  // Hanya kursus terbit yang masuk sitemap (PRD Bab 10 NFR-02)
  const publishedCourses = await getPublishedCourses();

  const courseUrls: MetadataRoute.Sitemap = publishedCourses.map((c) => ({
    url: `${baseUrl}/kursus/${c.slug}`,
    lastModified: new Date(c.diubah_pada || c.dibuat_pada),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/course`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...courseUrls,
  ];
}
