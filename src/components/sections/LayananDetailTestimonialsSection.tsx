import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/shared/Reveal";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getLocalizedGeneralSettings } from "@/lib/general-settings";
import type { LayananDetail } from "@/lib/hydrate-layanan-detail";

/* Inisial nama untuk avatar, mis. "Budi Santoso" → "BS" */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ─── Testimoni klien + kartu "Butuh Bantuan?" ─── */
export default async function LayananDetailTestimonialsSection({
  testimonials,
}: {
  testimonials: LayananDetail["testimonials"];
}) {
  const dict = getDictionary(await getLocale());
  const { whatsapp } = await getLocalizedGeneralSettings();
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pb-14 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {dict.layananDetailTestimonials.heading}
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {testimonials.items.map(({ name, role, content }, index) => (
            <Reveal key={index} delay={index * 0.08}>
              <Card className="h-full gap-0 rounded-xl border-border/60 py-0">
                <CardContent className="flex h-full flex-col px-4 py-5">
                  <p
                    className="flex gap-0.5"
                    role="img"
                    aria-label={dict.layananDetailTestimonials.ariaRating}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-3.5 fill-primary text-primary"
                        aria-hidden="true"
                      />
                    ))}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {content}
                  </p>
                  <div className="mt-4 flex items-center gap-2.5">
                    <span
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-lime to-brand-green-dark text-xs font-bold text-white"
                      aria-hidden="true"
                    >
                      {getInitials(name)}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {name}
                      </p>
                      <p className="text-xs text-muted-foreground">{role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Kartu bantuan */}
      <div className="rounded-2xl bg-brand-surface p-6 lg:mt-14 lg:self-start">
        <h3 className="text-lg font-bold text-foreground">
          {testimonials.help.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {testimonials.help.description}
        </p>
        {/* Tombol — lebar penuh & teks kecil di mobile, ukuran normal ≥sm */}
        <Button
          asChild
          className="mt-5 w-full justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold sm:gap-2 sm:text-sm"
        >
          <WhatsAppLink
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {dict.layananDetailTestimonials.button}
            <WhatsAppIcon className="size-3.5 sm:size-4" />
          </WhatsAppLink>
        </Button>
      </div>
    </section>
  );
}
