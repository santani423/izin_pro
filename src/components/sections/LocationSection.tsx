"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/Reveal";
import { useDictionary } from "@/contexts/LocaleContext";

/* ─── Lokasi & Kontak ───
 * Semua data (alamat, telepon, email, jam, peta) berasal dari tabel
 * Settings (getLocalizedGeneralSettings() di server) — bukan lagi
 * konstanta statis, biar berubah begitu admin ubah di /settings > tab
 * Kontak. Peta embed: pakai mapsEmbedUrl kalau admin sudah tempel src
 * hasil "Bagikan → Sematkan peta" dari Google Maps (bentuk pb=..., paling
 * akurat — nunjuk pin persis); kalau kosong, fallback ke embed otomatis
 * dari address (mode output=embed, gak butuh API key). */
export default function LocationSection({
  operatingHours,
  address,
  phone,
  email,
  mapsUrl,
  mapsEmbedUrl,
}: {
  operatingHours: string;
  address: string;
  phone: string;
  email: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
}) {
  const dict = useDictionary();
  const resolvedMapsEmbedUrl =
    mapsEmbedUrl.trim() || `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
  const CONTACT_ITEMS = [
    { icon: MapPin, label: dict.location.officeAddress, value: address },
    { icon: Phone, label: dict.location.phoneWhatsapp, value: phone },
    { icon: Mail, label: dict.location.email, value: email },
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
              src={resolvedMapsEmbedUrl}
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
                href={mapsUrl}
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
