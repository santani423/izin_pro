import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

/* ─── Font: Plus Jakarta Sans (heading & body) ─── */
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

/* ─── Metadata Global ─── */
export const metadata: Metadata = {
  metadataBase: new URL("https://izinpro.co.id"),
  title: {
    default: "IzinPro — Solusi Perizinan Bisnis Terpercaya di Indonesia",
    template: "%s | IzinPro",
  },
  description:
    "IzinPro adalah penyedia jasa perizinan bisnis terpercaya di Indonesia. Pendirian PT, NIB, Izin Usaha, dan lebih banyak layanan dengan proses cepat, transparan, dan legal.",
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
  authors: [{ name: "IzinPro" }],
  creator: "IzinPro",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://izinpro.co.id",
    siteName: "IzinPro",
    title: "IzinPro — Solusi Perizinan Bisnis Terpercaya di Indonesia",
    description:
      "Urus perizinan usaha dengan mudah, cepat, dan legal bersama tim profesional IzinPro.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IzinPro — Solusi Perizinan Bisnis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IzinPro — Solusi Perizinan Bisnis Terpercaya",
    description:
      "Urus perizinan usaha dengan mudah, cepat, dan legal bersama tim profesional IzinPro.",
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

export const viewport: Viewport = {
  themeColor: "#5ba12b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
