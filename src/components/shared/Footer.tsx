import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { COMPANY_INFO, FOOTER_LINKS } from "@/lib/constants";

/* ─── Footer ─── */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="container mx-auto px-4 lg:px-8">

        {/* ─── Area Atas ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-14">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl mb-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white shadow-sm">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M15 4.5L7 13.5L3 9"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-white">{COMPANY_INFO.name}</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-5 max-w-xs">
              Solusi perizinan bisnis terpercaya di Indonesia. Kami hadir untuk memudahkan
              legalitas usaha Anda dengan cepat, transparan, dan profesional.
            </p>

            {/* Sosial Media */}
            <div className="flex items-center gap-2">
              {[
                { title: "LinkedIn", href: COMPANY_INFO.social.linkedin, path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 4a2 2 0 100-4 2 2 0 000 4z" },
                { title: "Facebook", href: COMPANY_INFO.social.facebook, path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                { title: "Instagram", href: COMPANY_INFO.social.instagram, isStroke: true, path: "M4 4m0 4a4 4 0 014-4h8a4 4 0 014 4v8a4 4 0 01-4 4H8a4 4 0 01-4-4z M12 12m0-3a3 3 0 110 6 3 3 0 010-6z" },
                { title: "X (Twitter)", href: COMPANY_INFO.social.twitter, path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
              ].map((s) => (
                <a
                  key={s.title}
                  href={s.href}
                  title={s.title}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary text-gray-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill={s.isStroke ? "none" : "currentColor"}
                    stroke={s.isStroke ? "currentColor" : undefined}
                    strokeWidth={s.isStroke ? 2 : undefined}
                  >
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Layanan */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Layanan Kami</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.layanan.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Informasi</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.informasi.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Hubungi Kami</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <Phone size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <a
                  href={`tel:${COMPANY_INFO.whatsappDisplay}`}
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  {COMPANY_INFO.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="text-sm text-gray-400 hover:text-primary transition-colors break-all"
                >
                  {COMPANY_INFO.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-400 leading-relaxed">{COMPANY_INFO.address}</p>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-400">{COMPANY_INFO.hours}</p>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── Area Bawah ─── */}
        <div className="border-t border-white/8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {currentYear} {COMPANY_INFO.name}. All Rights Reserved.
          </p>
          <p className="text-xs text-gray-500">
            Dibuat dengan ❤ untuk kemudahan perizinan bisnis Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
