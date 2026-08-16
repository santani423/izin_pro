"use client";

import Link from "next/link";
import { forwardRef, type ComponentProps } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { localizeHref } from "@/i18n/config";

function isInternalPath(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

type LocalizedLinkProps = ComponentProps<typeof Link>;

/** Pengganti `next/link` di semua section publik — nambahin prefix locale
 * aktif (/en, /zh) ke path internal (mis. "/tentang-kami" -> "/en/tentang-kami"
 * kalau lagi baca versi English), biar navigasi antar halaman gak balik ke
 * Bahasa Indonesia begitu pindah dari halaman berbahasa non-default. Href
 * eksternal/mailto/tel/anchor-only (gak diawali "/") dibiarkan apa adanya. */
export const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  function LocalizedLink({ href, ...props }, ref) {
    const locale = useLocale();
    const hrefStr = typeof href === "string" ? href : (href.pathname ?? "");
    const resolvedHref = isInternalPath(hrefStr) ? localizeHref(hrefStr, locale) : href;
    return <Link ref={ref} href={resolvedHref} {...props} />;
  },
);
