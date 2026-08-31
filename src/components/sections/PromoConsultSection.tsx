import Image from "next/image";
import { Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getLocalizedGeneralSettings } from "@/lib/general-settings";

/* ─── Banner ajakan klaim promo — foto kiri, CTA kanan ─── */
export default async function PromoConsultSection({
  titlePrefix,
  titleHighlight,
  description,
  imageUrl,
}: {
  titlePrefix: string;
  titleHighlight: string;
  description: string;
  imageUrl?: string | null;
}) {
  const dict = getDictionary(await getLocale());
  const { operatingHours, whatsapp, phoneDisplay } = await getLocalizedGeneralSettings();
  const waMessage = encodeURIComponent(dict.promoConsult.waMessage);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-2xl bg-brand-surface px-6 py-8 sm:px-10 lg:grid-cols-[auto_1fr]">
        {/* Foto tim — PNG transparan, rata bawah agar terlihat berdiri di banner */}
        <div className="relative -mb-8 hidden aspect-[3/2] w-80 self-end lg:block">
          <Image
            src={imageUrl || "/images/promo-konsultasi.png"}
            alt={dict.promoConsult.imageAlt}
            fill
            sizes="320px"
            className="object-contain object-bottom"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {titlePrefix} <span className="text-primary">{titleHighlight}</span>
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            {description}
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* Tombol — lebar penuh & teks kecil di mobile, ukuran normal ≥sm */}
            <Button
              asChild
              size="lg"
              className="w-full justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold sm:w-auto sm:gap-2 sm:px-5 sm:text-sm"
            >
              <WhatsAppLink
                href={`https://wa.me/${whatsapp}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {dict.promoConsult.button}
                <WhatsAppIcon className="size-3.5 sm:size-4" />
              </WhatsAppLink>
            </Button>

            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
                <Phone className="size-4" aria-hidden="true" />
              </span>
              <div>
                <a
                  href={`tel:+${whatsapp}`}
                  className="text-sm font-bold text-foreground transition-colors hover:text-primary"
                >
                  {phoneDisplay}
                </a>
                <p className="text-xs text-muted-foreground">
                  {operatingHours || dict.common.officeHours}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
