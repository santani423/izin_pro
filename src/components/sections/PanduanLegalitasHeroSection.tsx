import Image from "next/image";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { Reveal } from "@/components/shared/Reveal";
import { COMPANY_INFO } from "@/lib/constants";
import {
  PANDUAN_LEGALITAS_CHIPS,
  PANDUAN_LEGALITAS_HERO,
} from "@/lib/panduan-legalitas";

/* ─── Hero panduan legalitas — breadcrumb, judul, chip benefit, CTA & foto ─── */
export default function PanduanLegalitasHeroSection() {
  const hero = PANDUAN_LEGALITAS_HERO;
  const waMessage = encodeURIComponent(hero.waMessage);

  return (
    <section className="bg-brand-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Breadcrumb — selalu paling atas (mobile: sebelum foto) */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground lg:col-span-2"
        >
          <Link href="/" className="transition-colors hover:text-primary">
            Beranda
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <Link href="/blog" className="transition-colors hover:text-primary">
            Panduan &amp; Artikel
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <span className="font-medium text-foreground">
            Legalitas Lengkap, Bisnis Makin Terpercaya
          </span>
        </nav>

        {/* Teks — mobile: setelah foto */}
        <div className="order-last lg:order-none">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {hero.kicker}
            </p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {hero.titleLead}{" "}
              <span className="text-primary">{hero.titleHighlight}</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              {hero.description}
            </p>
          </Reveal>

          {/* Chip benefit */}
          <Reveal delay={0.1}>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-6">
              {PANDUAN_LEGALITAS_CHIPS.map(({ label, icon: Icon }) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold leading-snug text-foreground sm:text-sm">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* CTA */}
          <Reveal delay={0.2}>
            <Button
              asChild
              size="lg"
              className="mt-8 w-full justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold sm:w-auto sm:gap-2 sm:px-5 sm:text-sm"
            >
              <a
                href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {hero.cta}
                <WhatsAppIcon className="size-3.5 sm:size-4" />
              </a>
            </Button>
          </Reveal>
        </div>

        {/* Foto hero — konsultan bersama klien + kartu stat (mobile: di antara breadcrumb & judul) */}
        <Reveal delay={0.15}>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm">
            <Image
              src={hero.image}
              alt={hero.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 600px, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
