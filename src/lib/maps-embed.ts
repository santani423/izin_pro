/* ─── Util embed peta Google Maps (dipakai Pengaturan > Kontak & admin
 * Kontak > Lokasi) ───
 * Admin biasanya copy-paste seluruh potongan HTML dari Google Maps
 * (Bagikan → Sematkan peta → Salin HTML), bukan cuma URL src-nya —
 * extractMapsEmbedSrc ambil src="..." kalau yang ditempel ternyata tag
 * <iframe> utuh. isNonEmbeddableMapsUrl mendeteksi kalau yang ditempel
 * malah tautan share pendek (Bagikan → Salin tautan, domain goo.gl) —
 * itu link redirect, BUKAN src embed, iframe-nya bakal gagal/blank. */
export function extractMapsEmbedSrc(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  return match ? match[1] : trimmed;
}

export function isNonEmbeddableMapsUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "goo.gl" || hostname.endsWith(".goo.gl");
  } catch {
    return false;
  }
}
