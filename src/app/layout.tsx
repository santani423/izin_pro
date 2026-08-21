import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getBrandingAssetUrls } from "@/lib/branding";
import { getLocale } from "@/i18n/get-dictionary";
import { getLocalizedGeneralSettings } from "@/lib/general-settings";
import { SITE_URL } from "@/lib/site-url";

/* ─── Font: Plus Jakarta Sans (heading & body) ─── */
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const OG_LOCALE: Record<string, string> = { id: "id_ID", en: "en_US", zh: "zh_CN" };

/* ─── Metadata Global ───
 * title/description/openGraph/twitter diturunkan dari Settings.companyName +
 * tagline + description (tab Umum /admin/settings, per-locale) — fallback ke
 * string asli di bawah kalau Settings kosong (mis. baris singleton somehow
 * belum ke-seed). Field lain (keywords, images, robots) sengaja tetap statis. */
export async function generateMetadata(): Promise<Metadata> {
  const [{ faviconUrl }, locale, general] = await Promise.all([
    getBrandingAssetUrls(),
    getLocale(),
    getLocalizedGeneralSettings(),
  ]);
  const title = general.tagline ? `${general.companyName} — ${general.tagline}` : "IzinPro — Solusi Perizinan Bisnis Terpercaya di Indonesia";
  const description =
    general.description ||
    "IzinPro adalah penyedia jasa perizinan bisnis terpercaya di Indonesia. Pendirian PT, NIB, Izin Usaha, dan lebih banyak layanan dengan proses cepat, transparan, dan legal.";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${general.companyName}`,
    },
    description,
    keywords: [
      "perizinan bisnis",
      "pendirian PT",
      "NIB",
      "izin usaha",
      "perizinan Indonesia",
      "jasa perizinan",
      "IzinPro",
      "legalitas usaha",
      "OSS",
    ],
    authors: [{ name: general.companyName }],
    creator: general.companyName,
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale] ?? "id_ID",
      url: SITE_URL,
      siteName: general.companyName,
      title,
      description,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#5ba12b",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
