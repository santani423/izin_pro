import type { VercelConfig } from "@vercel/config/v1";

/* Cron auto-publish artikel blog terjadwal (lihat
 * src/app/api/cron/publish-scheduled-posts/route.ts). Tiap 5 menit —
 * granularitas "terbit dalam 5 menit dari jadwal", cukup buat CMS company
 * profile (bukan breaking news). WAJIB set env var CRON_SECRET di project
 * Vercel (Settings > Environment Variables) supaya Vercel nempelin header
 * Authorization yang dicek route-nya — endpoint ini default-deny tanpa itu.
 *
 * CATATAN: kalau project ini masih di plan Hobby, Vercel cuma ngizinin
 * cron jalan maksimal 1x/hari (bukan tiap 5 menit) — artikel terjadwal
 * baru beneran ke-publish pas cron harian itu jalan, telat dari jadwal
 * aslinya. Perlu plan Pro (atau upgrade) biar interval 5 menit ini
 * beneran dipakai persis. */
export const config: VercelConfig = {
  crons: [{ path: "/api/cron/publish-scheduled-posts", schedule: "*/5 * * * *" }],
};
