import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getLocalizedGeneralSettings } from "@/lib/general-settings";

/* ─── Lokasi kantor — peta lebar + kartu alamat mengambang di kiri ─── */
export default async function KontakLocationSection({
  title,
  mapsEmbedUrl,
}: {
  title: string;
  mapsEmbedUrl: string;
}) {
  const dict = getDictionary(await getLocale());
  const { address, mapsUrl } = await getLocalizedGeneralSettings();
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 shadow-sm">
        <iframe
          title={dict.kontakLocation.mapTitle}
          src={mapsEmbedUrl}
          className="block h-72 w-full border-0 sm:h-96 lg:h-[34rem]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />

        {/* Kartu alamat — mengambang di kiri bawah kartu info bawaan Google
         * hanya di ≥lg (embed lebar = kartu Google pendek & tingginya stabil);
         * di bawah lg ditumpuk setelah peta agar tidak saling menutup */}
        <div className="bg-background p-6 lg:absolute lg:left-4 lg:top-56 lg:w-80 lg:rounded-2xl lg:p-7 lg:shadow-xl">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {address}
          </p>
          <Button
            asChild
            className="mt-5 w-full justify-center gap-2 rounded-lg font-semibold lg:w-auto"
          >
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {dict.kontakLocation.button}
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
