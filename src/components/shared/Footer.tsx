import Link from "next/link";
import Image from "next/image";
import type { SVGProps } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { CONTACT_INFO } from "@/lib/landing";
import { COMPANY_INFO } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getBrandingAssetUrls } from "@/lib/branding";

/* ─── Ikon sosial media (lucide-react tidak menyediakan brand icon) ─── */
function BrandIcon({ d, ...props }: SVGProps<SVGSVGElement> & { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d={d} />
    </svg>
  );
}

const SOCIALS = [
  {
    label: "Instagram",
    href: COMPANY_INFO.social.instagram,
    d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "Facebook",
    href: COMPANY_INFO.social.facebook,
    d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "LinkedIn",
    href: COMPANY_INFO.social.linkedin,
    d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "X (Twitter)",
    href: COMPANY_INFO.social.twitter,
    d: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
  {
    label: "YouTube",
    href: COMPANY_INFO.social.youtube,
    d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

/* ─── Footer ───
 * Server Component: fetch Menu "footer" langsung dari Prisma (gak butuh
 * "use client" krn gak ada state/interaktivitas di sini). */
export default async function Footer() {
  const footerMenu = await prisma.menu.findUnique({
    where: { key: "footer", deletedAt: null },
    include: {
      items: {
        where: { parentId: null, deletedAt: null },
        include: { children: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  const columns = footerMenu?.items ?? [];
  const { logoUrl } = await getBrandingAssetUrls();

  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.4fr]">
          {/* Brand */}
          <div>
            {/* Logo asli berteks gelap — dibalik jadi putih untuk footer gelap */}
            <Image
              src={logoUrl}
              alt="IzinPro"
              width={132}
              height={28}
              unoptimized
              className="h-7 w-auto brightness-0 invert"
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Solusi perizinan terpercaya untuk mendukung legalitas dan
              pertumbuhan bisnis Anda.
            </p>
            <ul className="mt-5 flex gap-3">
              {SOCIALS.map(({ label, href, d }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    className="grid size-8 place-items-center rounded-md bg-white/10 transition-colors hover:bg-primary hover:text-white"
                  >
                    <BrandIcon d={d} className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom link */}
          {columns.map((column) => (
            <nav key={column.id} aria-label={column.label}>
              <h3 className="text-sm font-bold text-white">{column.label}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.children.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Hubungi Kami */}
          <div>
            <h3 className="text-sm font-bold text-white">Hubungi Kami</h3>
            <address className="mt-4 space-y-3 text-sm not-italic">
              <p className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {CONTACT_INFO.phone}
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {CONTACT_INFO.email}
              </p>
              <p className="flex items-start gap-2.5 leading-relaxed">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {CONTACT_INFO.address}
              </p>
            </address>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <p className="text-center text-xs">
          © {new Date().getFullYear()} IzinPro. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
