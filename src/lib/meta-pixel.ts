"use client";

/* ─── Meta Pixel — util terpusat ───
 * SATU Pixel ID/kode untuk seluruh website (dari Settings tab Integrasi,
 * lihat components/MetaPixel.tsx). File ini cuma tempat manggil window.fbq
 * dengan aman — jangan panggil window.fbq(...) langsung dari komponen lain,
 * selalu lewat fungsi-fungsi di bawah biar event & parameternya konsisten.
 */

export type MetaPixelContentType = "article" | "service" | "product";

export interface MetaPixelViewContentParams {
  content_name: string;
  content_type: MetaPixelContentType;
  content_ids: string[];
  content_category?: string;
}

type FbqArgs =
  | ["track", "PageView"]
  | ["track", "ViewContent", MetaPixelViewContentParams]
  | ["track", "Contact"]
  | ["track", "Lead"];

declare global {
  interface Window {
    fbq?: (...args: FbqArgs) => void;
  }
}

/* fbq mungkin belum ke-load (script masih nge-fetch, ad-blocker, dst) —
 * jangan sampai itu bikin fitur lain (WhatsApp, submit form) ikut gagal. */
function callFbq(...args: FbqArgs) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  try {
    window.fbq(...args);
  } catch {
    /* no-op — tracking gak boleh nge-crash UI */
  }
}

export function trackPageView() {
  callFbq("track", "PageView");
}

/** Dipanggil di tiap halaman detail artikel/layanan dengan data asli dari
 * CMS (bukan hardcode) — Pixel ID tetap satu, cuma parameter event yang
 * beda-beda per konten. */
export function trackViewContent(params: MetaPixelViewContentParams) {
  callFbq("track", "ViewContent", params);
}

/** Klik WhatsApp / kanal kontak lain (telepon, email). */
export function trackContact() {
  callFbq("track", "Contact");
}

/** Submit form kontak yang BERHASIL saja. */
export function trackLead() {
  callFbq("track", "Lead");
}
