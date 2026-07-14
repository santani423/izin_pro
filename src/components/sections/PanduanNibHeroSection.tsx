import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronRight, Clock } from "lucide-react";

import { Reveal } from "@/components/shared/Reveal";
import { PANDUAN_NIB_CHIPS, PANDUAN_NIB_HERO } from "@/lib/panduan-nib";

/* ─── Hero panduan NIB — breadcrumb, judul, chip benefit, meta penulis & foto ─── */
export default function PanduanNibHeroSection() {
  const hero = PANDUAN_NIB_HERO;

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
            Panduan Lengkap Mengurus NIB Melalui OSS
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
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              {PANDUAN_NIB_CHIPS.map(({ label, icon: Icon }) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold text-foreground sm:text-sm">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Meta penulis */}
          <Reveal delay={0.2}>
            <div className="mt-6 flex items-center gap-3">
              <Image
                src={hero.avatar}
                alt={`Foto penulis ${hero.author}`}
                width={40}
                height={40}
                className="size-10 shrink-0 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Ditulis oleh {hero.author}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {hero.updatedLabel}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden="true" />
                    {hero.readTime}
                  </span>
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Foto hero — layar OSS di laptop (mobile: di antara breadcrumb & judul) */}
        <Reveal delay={0.15}>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl shadow-sm">
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
