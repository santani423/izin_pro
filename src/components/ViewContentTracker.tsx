"use client";

import { useEffect } from "react";
import { trackViewContent, type MetaPixelViewContentParams } from "@/lib/meta-pixel";

/* ─── ViewContent per halaman detail artikel/layanan ───
 * Render sbg child Server Component (page.tsx) dengan data asli dari
 * CMS/API — effect-nya sengaja depend ke nilai primitif (bukan objek
 * `params`) biar nge-fire ulang pas pindah artikel via client-side routing
 * (mis. /blog/a -> /blog/b), tapi gak dobel kalau parent re-render dengan
 * data konten yang sama. */
export default function ViewContentTracker(params: MetaPixelViewContentParams) {
  const contentIdsKey = params.content_ids.join(",");

  useEffect(() => {
    trackViewContent(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentIdsKey, params.content_name, params.content_type, params.content_category]);

  return null;
}
