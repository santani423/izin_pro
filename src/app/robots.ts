import type { MetadataRoute } from "next";

/* ─── robots.txt otomatis ─── */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: "https://izinpro.co.id/sitemap.xml",
  };
}
