import type { MetadataRoute } from "next";

/* ─── robots.txt otomatis ─── */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/editor/", "/author/", "/api/"],
      },
    ],
    sitemap: "https://izinpro.co.id/sitemap.xml",
  };
}
