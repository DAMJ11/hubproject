import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://fashionsden.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["es", "en", "fr"];

  const publicPages = [
    "",
    "/para-marcas",
    "/para-fabricantes",
    "/blog",
    "/contacto",
    "/noticias",
    "/politica-sostenibilidad",
    "/terminos",
    "/privacidad",
    "/login",
    "/register",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of publicPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1.0 : page === "/para-marcas" || page === "/para-fabricantes" ? 0.9 : 0.7,
      });
    }
  }

  return entries;
}
