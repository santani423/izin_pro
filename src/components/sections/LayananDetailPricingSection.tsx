import { Check, ClipboardCheck, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/shared/Reveal";
import { WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { cn } from "@/lib/utils";
import { COMPANY_INFO } from "@/lib/constants";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { format } from "@/i18n/format";
import type { LayananDetail } from "@/lib/hydrate-layanan-detail";

/* ─── Paket harga + dokumen yang diperlukan + waktu pengerjaan ─── */
export default async function LayananDetailPricingSection({
  title,
  packages,
}: {
  title: string;
  packages: NonNullable<LayananDetail["packages"]>;
}) {
  const dict = getDictionary(await getLocale());
  const hasPackages = packages.items.length > 0;
  const hasDocuments = packages.documents.items.length > 0;
  const hasDuration =
    Boolean(packages.duration.value) && packages.duration.value !== "-";
  const hasSidebar = hasDocuments || hasDuration;

  return (
    <section
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pb-14 sm:px-6 lg:px-8",
        hasPackages && hasSidebar && "lg:grid-cols-[1fr_320px]",
      )}
    >
      {/* Paket */}
      {hasPackages && (
        <div>
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-left">
            {packages.title}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {packages.items.map((pkg, index) => {
              const waMessage = encodeURIComponent(
                format(dict.layananDetailPricing.waMessageTemplate, { name: pkg.name, price: pkg.price, title }),
              );
              return (
                <Reveal
                  key={index}
                  delay={index * 0.08}
                  className="relative h-full"
                >
                  {/* Badge di luar Card agar tidak terpotong overflow-hidden */}
                  {pkg.popular && (
                    <span className="absolute -top-3 right-4 z-10 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 shadow-sm">
                      {dict.layananDetailPricing.popularBadge}
                    </span>
                  )}
                  <Card
                    className={cn(
                      "h-full gap-0 rounded-xl py-0",
                      pkg.popular
                        ? "border-transparent bg-gradient-to-b from-primary to-brand-green-dark text-white shadow-lg"
                        : "border-border/60",
                    )}
                  >
                    <CardContent className="flex h-full flex-col px-5 py-6">
                      <h3
                        className={cn(
                          "text-sm font-bold uppercase tracking-wide",
                          pkg.popular ? "text-white" : "text-foreground",
                        )}
                      >
                        {pkg.name}
                      </h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        <p
                          className={cn(
                            "text-2xl font-extrabold",
                            pkg.popular ? "text-white" : "text-foreground",
                          )}
                        >
                          {pkg.price}
                        </p>
                        {pkg.originalPrice && (
                          <p
                            className={cn(
                              "text-sm line-through",
                              pkg.popular
                                ? "text-white/60"
                                : "text-muted-foreground",
                            )}
                          >
                            {pkg.originalPrice}
                          </p>
                        )}
                      </div>
                      <ul className="mt-4 flex-1 space-y-2.5">
                        {pkg.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-start gap-2"
                          >
                            <Check
                              className={cn(
                                "mt-0.5 size-4 shrink-0",
                                pkg.popular ? "text-white" : "text-primary",
                              )}
                              aria-hidden="true"
                            />
                            <span
                              className={cn(
                                "text-sm leading-snug",
                                pkg.popular
                                  ? "text-white/90"
                                  : "text-muted-foreground",
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
                          "mt-6 w-full justify-center rounded-lg font-semibold",
                          pkg.popular
                            ? "bg-white text-brand-green-dark hover:bg-white/90"
                            : "border border-primary/40 bg-transparent text-primary hover:bg-primary/5",
                        )}
                      >
                        <WhatsAppLink
                          href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${waMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {dict.layananDetailPricing.choosePackage}
                        </WhatsAppLink>
                      </Button>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      )}

      {/* Dokumen & waktu pengerjaan */}
      {hasSidebar && (
        <div className="space-y-5 lg:pt-16">
          {hasDocuments && (
            <Card className="gap-0 rounded-xl border-border/60 py-0">
              <CardContent className="px-5 py-5">
                <h3 className="text-sm font-bold text-foreground">
                  {packages.documents.title}
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {packages.documents.items.map((doc, docIndex) => (
                    <li key={docIndex} className="flex items-start gap-2.5">
                      <ClipboardCheck
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-snug text-muted-foreground">
                        {doc}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {hasDuration && (
            <Card className="gap-0 rounded-xl border-border/60 py-0">
              <CardContent className="flex items-start gap-3 px-5 py-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
                  <Clock className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-primary">
                    {dict.layananDetailPricing.durationHeading}
                  </h3>
                  <p className="mt-0.5 text-base font-extrabold text-foreground">
                    {packages.duration.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {packages.duration.note}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
