import { Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getLocalizedGeneralSettings } from "@/lib/general-settings";

/* ─── Banner konsultasi — kartu hijau muda dengan CTA & telepon ─── */
export default async function LayananConsultSection() {
  const dict = getDictionary(await getLocale());
  const { operatingHours, whatsapp, phoneDisplay } = await getLocalizedGeneralSettings();
  const waMessage = encodeURIComponent(dict.layananConsult.waMessage);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-2xl bg-brand-surface px-6 py-8 sm:px-10 lg:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {dict.layananConsult.headingPrefix}
            <br />
            <span className="text-primary">{dict.layananConsult.headingHighlight}</span>
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            {dict.layananConsult.subtitle}
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
                {dict.layananConsult.button}
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

        {/* Placeholder foto tim — gradient hijau brand */}
        <div
          role="img"
          aria-label={dict.layananConsult.ariaImage}
          className="hidden aspect-[4/3] w-72 rounded-xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark lg:block"
        />
      </div>
    </section>
  );
}
