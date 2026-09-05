"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/meta-pixel";

/* App Router gak full-reload pas pindah rute, jadi PageView pertama (dikirim
 * snippet init di bawah) gak otomatis keulang. Effect ini yang nge-track
 * PageView berikutnya tiap pathname/query berubah — run pertama sengaja
 * di-skip biar gak dobel sama PageView dari snippet init. */
function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    trackPageView();
  }, [pathname, searchParams]);

  return null;
}

/* ─── Meta Pixel — satu Pixel ID/kode untuk seluruh website ───
 * Dipasang sekali di layout publik (bukan per halaman/artikel), datanya dari
 * Settings (tab Integrasi, lihat updateMetaIntegrationAction di
 * lib/actions/settings.ts). Cuma boleh diisi salah satu:
 * - pixelId: angka Pixel ID biasa -> dirender pakai template bawaan.
 * - code: kode/script custom hasil "Instal kode secara manual" dari Meta
 *   Events Manager -> dirender apa adanya (buat kasus lanjutan).
 * Dua-duanya kosong = komponen ini gak nge-render apa-apa. */
export default function MetaPixel({ pixelId, code }: { pixelId: string | null; code: string | null }) {
  if (!pixelId && !code) return null;

  return (
    <>
      {code ? (
        <Script id="meta-pixel-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: code }} />
      ) : (
        <>
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
              document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              alt=""
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}
      <Suspense fallback={null}>
        <RouteChangeTracker />
      </Suspense>
    </>
  );
}
