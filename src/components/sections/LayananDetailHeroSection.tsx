import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import Image from "next/image";
import { ChevronRight, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/Reveal";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { COMPANY_INFO } from "@/lib/constants";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { format } from "@/i18n/format";
import { cn } from "@/lib/utils";
import type { LayananDetail } from "@/lib/hydrate-layanan-detail";

/* ─── Hero detail layanan — breadcrumb, judul, highlight & kartu statistik ─── */
export default async function LayananDetailHeroSection({
  detail,
}: {
  detail: LayananDetail;
}) {
  const dict = getDictionary(await getLocale());
  const waMessage = encodeURIComponent(
    format(dict.layananDetailHero.waMessageTemplate, { title: detail.title }),
  );

  const heroImageAlt = format(dict.layananDetailHero.ariaIllustrationTemplate, { title: detail.title });

  /* Isi kartu stat (dipakai di versi mobile & full-bleed) */
  const renderStatCard = ({ icon: Icon, value, label, withStars }: LayananDetail["stats"][number]) => (
    <>
      <p className="flex items-center gap-2 text-lg font-extrabold text-foreground">
        <Icon className="size-5 text-primary" aria-hidden="true" />
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      {withStars && (
        <p className="mt-1 flex gap-0.5" role="img" aria-label={dict.layananDetailHero.ariaRating}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
          ))}
        </p>
      )}
    </>
  );

  return (
    <section className="relative overflow-hidden bg-brand-surface">
      {/* Foto hero — full-bleed nempel tepi kanan & atas-bawah section
          (≥lg), sisi kiri di-fade ke transparan biar nyatu sama konten,
          kartu stat sejajar numpuk di pojok kanan bawah. Konsisten sama
          pola di hero beranda. */}
      <div className="absolute inset-y-0 right-0 hidden w-[45%] lg:block">
        <div className="absolute inset-0 [-webkit-mask-image:linear-gradient(to_right,transparent,black_38%)] [mask-image:linear-gradient(to_right,transparent,black_38%)]">
          {detail.imageUrl ? (
            <Image
              src={detail.imageUrl}
              alt={heroImageAlt}
              fill
              sizes="45vw"
              className="object-cover"
              priority
            />
          ) : (
            <div
              role="img"
              aria-label={heroImageAlt}
              className="h-full w-full bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark"
            />
          )}
        </div>

        {detail.stats.map((stat, index) => (
          <div
            key={index}
            className={cn(
              "absolute right-8 w-44 animate-float rounded-xl border border-border/60 bg-background px-4 py-3 shadow-lg",
              index === 0 ? "bottom-36" : "bottom-8",
            )}
            style={{
              animationDuration: `${4 + index * 1.5}s`,
              animationDelay: `${1 + index * 0.5}s`,
            }}
          >
            {renderStatCard(stat)}
          </div>
        ))}
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          {/* Breadcrumb */}
          <nav
            aria-label={dict.common.ariaBreadcrumb}
            className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link href="/" className="transition-colors hover:text-primary">
              {dict.common.breadcrumbHome}
            </Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <Link
              href="/layanan"
              className="transition-colors hover:text-primary"
            >
              {dict.layananDetailHero.breadcrumbLayanan}
            </Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <span className="font-medium text-foreground">{detail.title}</span>
          </nav>

          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-primary">
            {detail.kicker}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {detail.title}
            <span className="mt-1 block text-primary">{detail.tagline}</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {detail.description}
          </p>

          {/* Highlight pills */}
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {detail.highlights.map(({ icon: Icon, label }, index) => (
              <li key={index} className="flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold leading-snug text-foreground">
                  {label}
                </span>
              </li>
            ))}
          </ul>

          {/* Tombol — lebar penuh & teks kecil di mobile, ukuran normal ≥sm */}
          <Button
            asChild
            size="lg"
            className="mt-8 w-full justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold sm:w-auto sm:gap-2 sm:px-5 sm:text-sm"
          >
            <WhatsAppLink
              href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {dict.layananDetailHero.button}
              <WhatsAppIcon className="size-3.5 sm:size-4" />
            </WhatsAppLink>
          </Button>
        </div>

        {/* Foto + kartu statistik mengambang, cuma <lg (≥lg dipakai versi
            full-bleed di luar grid, lihat atas) — badge sejajar numpuk
            di pojok kanan bawah. */}
        <Reveal delay={0.15} className="relative lg:hidden">
          {detail.imageUrl ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
              <Image
                src={detail.imageUrl}
                alt={heroImageAlt}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div
              role="img"
              aria-label={heroImageAlt}
              className="aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark"
            />
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:contents">
            {detail.stats.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-xl border border-border/60 bg-background px-4 py-3 shadow-sm",
                  "sm:absolute sm:-right-3 sm:w-44 sm:animate-float sm:shadow-lg",
                  index === 0 ? "sm:bottom-36" : "sm:bottom-8",
                )}
                style={{
                  animationDuration: `${4 + index * 1.5}s`,
                  animationDelay: `${1 + index * 0.5}s`,
                }}
              >
                {renderStatCard(stat)}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
