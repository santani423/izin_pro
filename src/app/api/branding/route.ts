import { NextResponse } from "next/server";
import { getBrandingAssetUrls } from "@/lib/branding";

// Handler ini gak pakai Request/headers/cookies, jadi Next.js defaultnya
// bisa nge-cache statis di build time — padahal AdminSidebar & halaman
// login fetch endpoint ini di client buat baca logo TERBARU. force-dynamic
// jamin selalu dieksekusi per-request (dedup 60s tetap jalan di
// getBrandingSettings, jadi gak nge-hit DB tiap request).
export const dynamic = "force-dynamic";

export async function GET() {
  const { logoUrl, faviconUrl } = await getBrandingAssetUrls();
  return NextResponse.json(
    { logoUrl, faviconUrl },
    { headers: { "Cache-Control": "no-store" } },
  );
}
