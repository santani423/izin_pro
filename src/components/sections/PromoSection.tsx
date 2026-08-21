"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { useDictionary } from "@/contexts/LocaleContext";
import type { LandingPromo } from "@/lib/landing";
import { cn } from "@/lib/utils";

const VARIANT_STYLES: Record<
  LandingPromo["variant"],
  { card: string; eyebrow: string; button: string }
> = {
  discount: {
    card: "bg-gradient-to-br from-primary to-brand-green-dark text-white",
    eyebrow: "text-white/85",
    button:
      "bg-white/15 text-white ring-1 ring-white/40 hover:bg-white/25",
  },
  free: {
    card: "bg-gradient-to-br from-neutral-900 to-neutral-700 text-white",
    eyebrow: "text-brand-lime",
    button: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  package: {
    card: "bg-brand-surface text-foreground border border-border/60",
    eyebrow: "text-primary",
    button:
      "bg-transparent text-primary ring-1 ring-primary hover:bg-primary/10",
  },
};

/* ─── Promo Spesial ─── */
export default function PromoSection({ promos }: { promos: LandingPromo[] }) {
  const dict = useDictionary();
  return (
    <section id="promo" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        title={dict.promo.heading}
        subtitle={dict.promo.subtitle}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {promos.map((promo, index) => {
          const style = VARIANT_STYLES[promo.variant];
          const hasImage = !!promo.imageUrl;
          return (
            <Reveal key={promo.id} delay={index * 0.1}>
              <article
                className={cn(
                  "relative flex h-full min-h-44 flex-col justify-between overflow-hidden rounded-xl p-6 shadow-sm",
                  hasImage ? "text-white" : style.card,
                )}
              >
                {hasImage && (
                  <>
                    <Image
                      src={promo.imageUrl!}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                    {/* Scrim gelap biar teks putih tetap kebaca di atas foto apa pun */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/15" />
                  </>
                )}
                <div className="relative z-10">
                  <p
                    className={cn(
                      "text-xs font-bold uppercase tracking-widest",
                      hasImage ? "text-white/85" : style.eyebrow,
                    )}
                  >
                    {promo.eyebrow}
                  </p>
                  <h3 className="mt-1 text-3xl font-extrabold tracking-tight">
                    {promo.title}
                  </h3>
                  <p className="mt-1.5 text-sm opacity-90">
                    {promo.description}
                  </p>
                </div>
                <Button
                  asChild={!!promo.ctaHref}
                  size="sm"
                  className={cn(
                    "relative z-10 mt-5 w-fit rounded-md font-semibold shadow-none",
                    hasImage
                      ? "bg-white/15 text-white ring-1 ring-white/40 hover:bg-white/25"
                      : style.button,
                  )}
                >
                  {promo.ctaHref ? (
                    <Link href={promo.ctaHref}>{promo.ctaLabel}</Link>
                  ) : (
                    promo.ctaLabel
                  )}
                </Button>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
