import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/shared/Reveal";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";

export interface PromoPackageItem {
  id: string;
  badge: string | null;
  title: string;
  price: string;
  originalPrice: string | null;
  saving: string | null;
  features: string[];
  href: string;
  dark: boolean;
}

export interface PromoPackagesHeading {
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  subtitle: string;
}

/* ─── Paket promo pilihan — 3 kartu (tengah gelap) ─── */
export default async function PromoPackagesSection({
  heading,
  packages,
}: {
  heading: PromoPackagesHeading;
  packages: PromoPackageItem[];
}) {
  const dict = getDictionary(await getLocale());
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {heading.titlePrefix} <span className="text-primary">{heading.titleHighlight}</span> {heading.titleSuffix}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground sm:text-base">
        {heading.subtitle}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        {packages.map((pkg, index) => (
          <Reveal key={pkg.id} delay={index * 0.08} className="h-full">
            <Card
              className={cn(
                "h-full gap-0 rounded-xl py-0",
                pkg.dark
                  ? "border-transparent bg-footer text-footer-foreground shadow-lg"
                  : "border-border/60",
              )}
            >
              <CardContent className="flex h-full flex-col px-6 py-7">
                {pkg.badge && (
                  <span
                    className={cn(
                      "self-start rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
                      pkg.dark
                        ? "bg-primary text-white"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {pkg.badge}
                  </span>
                )}
                <h3
                  className={cn(
                    "mt-4 text-lg font-bold leading-snug",
                    pkg.dark ? "text-white" : "text-foreground",
                  )}
                >
                  {pkg.title}
                </h3>
                <p
                  className={cn(
                    "mt-3 text-xs",
                    pkg.dark ? "text-white/60" : "text-muted-foreground",
                  )}
                >
                  {dict.promoPackages.startingFrom}
                </p>
                <p className="flex flex-wrap items-baseline gap-2">
                  <span
                    className={cn(
                      "text-2xl font-extrabold",
                      pkg.dark ? "text-white" : "text-foreground",
                    )}
                  >
                    {pkg.price}
                  </span>
                  {pkg.originalPrice && (
                    <span
                      className={cn(
                        "text-sm line-through",
                        pkg.dark ? "text-white/50" : "text-muted-foreground/70",
                      )}
                    >
                      {pkg.originalPrice}
                    </span>
                  )}
                </p>
                {pkg.saving && (
                  <span
                    className={cn(
                      "mt-2 self-start rounded-full px-2.5 py-1 text-xs font-bold",
                      pkg.dark
                        ? "bg-primary/20 text-brand-lime"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {pkg.saving}
                  </span>
                )}

                <ul className="mt-5 flex-1 space-y-2.5">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          pkg.dark ? "text-brand-lime" : "text-primary",
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={cn(
                          "text-sm leading-snug",
                          pkg.dark ? "text-white/85" : "text-muted-foreground",
                        )}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={cn(
                    "mt-6 w-full justify-center gap-2 rounded-lg font-semibold",
                    pkg.dark && "bg-white text-brand-green-dark hover:bg-white/90",
                  )}
                >
                  <Link href={pkg.href}>
                    {dict.promoPackages.viewDetail}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
