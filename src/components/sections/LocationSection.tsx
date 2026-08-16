"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/Reveal";
import { useDictionary } from "@/contexts/LocaleContext";
import { CONTACT_INFO } from "@/lib/landing";

/* Embed Google Maps tanpa API key (mode output=embed) */
const MAPS_EMBED_URL =
  "https://www.google.com/maps?q=Wisma+Laena+Jl+KH+Abdullah+Syafei+No+7+Jakarta+Selatan&z=15&output=embed";

/* ─── Lokasi & Kontak ─── */
export default function LocationSection({ operatingHours }: { operatingHours: string }) {
  const dict = useDictionary();
  const CONTACT_ITEMS = [
    { icon: MapPin, label: dict.location.officeAddress, value: CONTACT_INFO.address },
    { icon: Phone, label: dict.location.phoneWhatsapp, value: CONTACT_INFO.phone },
    { icon: Mail, label: dict.location.email, value: CONTACT_INFO.email },
    { icon: Clock, label: dict.location.operatingHours, value: operatingHours || dict.common.officeHours },
  ];
  return (
    <section id="kontak" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* Kiri — heading + daftar kontak */}
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            {dict.location.eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {dict.location.heading}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {dict.location.subtitle}
          </p>

          <address className="mt-8 space-y-6 not-italic">
            {CONTACT_ITEMS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground sm:text-base">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </address>
        </Reveal>

        {/* Kanan — kartu peta embed Google Maps */}
        <Reveal delay={0.15}>
          <div className="relative min-h-96 overflow-hidden rounded-2xl border border-border/60 shadow-sm">
            <iframe
              title={dict.location.mapTitle}
              src={MAPS_EMBED_URL}
              className="block h-96 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <Button
              asChild
              variant="outline"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border-none bg-background font-semibold shadow-md hover:bg-background/90"
            >
              <a
                href={CONTACT_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="size-4" aria-hidden="true" />
                {dict.location.openInMaps}
              </a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
