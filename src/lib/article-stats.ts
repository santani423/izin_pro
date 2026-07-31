import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export type DeviceType = "Desktop" | "Mobile" | "Tablet";

/* Klasifikasi device dari User-Agent — regex sederhana, cukup buat
 * breakdown kasar Desktop/Mobile/Tablet (bukan deteksi browser/OS detail). */
export function parseDeviceType(userAgent: string | null): DeviceType {
  if (!userAgent) return "Desktop";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/.test(ua)) return "Tablet";
  if (/mobile|iphone|ipod|android/.test(ua)) return "Mobile";
  return "Desktop";
}

/* Lokasi pengunjung dari header geolocation bawaan Vercel Edge Network —
 * gratis, tanpa dependency/API key. Di luar Vercel (mis. dev lokal) header
 * ini gak ada, jadi balik null (ditampilkan "tidak terdeteksi" di admin). */
export async function getRequestGeo(): Promise<{ country: string | null; city: string | null }> {
  const h = await headers();
  const country = h.get("x-vercel-ip-country");
  const rawCity = h.get("x-vercel-ip-city");
  let city: string | null = null;
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity);
    } catch {
      city = rawCity;
    }
  }
  return { country, city };
}

/* ─── Catat 1 kunjungan halaman detail artikel ───
 * Satu-satunya tempat BlogPost.views di-increment sekarang (lihat
 * blog-data.ts) — sekalian nyimpen device & lokasi buat breakdown di panel
 * Statistik admin. Dipanggil sekali dari body halaman /blog/[slug]. */
export async function recordArticleVisit(postId: string): Promise<void> {
  const h = await headers();
  const device = parseDeviceType(h.get("user-agent"));
  const { country, city } = await getRequestGeo();

  await prisma.$transaction([
    prisma.blogPost.update({ where: { id: postId }, data: { views: { increment: 1 } } }),
    prisma.articleView.create({ data: { postId, device, country, city } }),
  ]);
}

/* ─── Komentar approved, dipakai halaman publik artikel ─── */
export async function getApprovedComments(postId: string) {
  return prisma.comment.findMany({
    where: { postId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });
}
