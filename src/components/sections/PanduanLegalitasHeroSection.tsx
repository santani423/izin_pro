import Image from "next/image";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { Reveal } from "@/components/shared/Reveal";
import { getLocalizedGeneralSettings } from "@/lib/general-settings";
import {
  PANDUAN_LEGALITAS_CHIPS,
  PANDUAN_LEGALITAS_HERO,
} from "@/lib/panduan-legalitas";

/* ─── Hero panduan legalitas — breadcrumb, judul, chip benefit, CTA & foto ─── */
export default async function PanduanLegalitasHeroSection() {
  const hero = PANDUAN_LEGALITAS_HERO;
  const { whatsapp } = await getLocalizedGeneralSettings();
  const waMessage = encodeURIComponent(hero.waMessage);

  return (
    <section className="relative overflow-hidden bg-brand-surface">
      {/* Foto hero — full-bleed nempel tepi kanan & atas-bawah section
          (≥lg), sisi kiri di-fade ke transparan biar nyatu sama konten.
          Konsisten sama pola di hero beranda & detail layanan. */}
      <div className="absolute inset-y-0 right-0 hidden w-[45%] lg:block">
        <div className="absolute inset-0 [-webkit-mask-image:linear-gradient(to_right,transparent,black_38%)] [mask-image:linear-gradient(to_right,transparent,black_38%)]">
          <Image
            src={hero.image}
            alt={hero.imageAlt}
            fill
            sizes="45vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-2 lg:px-8">
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
              <WhatsAppLink
                href={`https://wa.me/${whatsapp}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {hero.cta}
                <WhatsAppIcon className="size-3.5 sm:size-4" />
              </WhatsAppLink>
            </Button>
          </Reveal>
        </div>

        {/* Foto hero — konsultan bersama klien (mobile/tablet: di antara
            breadcrumb & judul; ≥lg dipakai versi full-bleed di atas) */}
        <Reveal delay={0.15} className="lg:hidden">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm">
            <Image
              src={hero.image}
              alt={hero.imageAlt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
