import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/Reveal";
import { CONTACT_INFO } from "@/lib/landing";

const CONTACT_ITEMS = [
  { icon: MapPin, label: "Alamat Kantor", value: CONTACT_INFO.address },
  { icon: Phone, label: "Telepon / WhatsApp", value: CONTACT_INFO.phone },
  { icon: Mail, label: "Email", value: CONTACT_INFO.email },
  { icon: Clock, label: "Jam Operasional", value: CONTACT_INFO.hours },
];

/* ─── Lokasi & Kontak ─── */
export default function LocationSection() {
  return (
    <section id="kontak" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* Kiri — heading + daftar kontak */}
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            Lokasi &amp; Kontak
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Temukan Kami di Sini
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Kunjungi kantor kami atau hubungi tim profesional IzinPro kapan
            saja.
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

        {/* Kanan — kartu lokasi dengan tombol Google Maps */}
        <Reveal delay={0.15}>
          <div className="flex min-h-96 flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-br from-brand-surface via-primary/10 to-brand-lime/30 px-6 py-14 text-center shadow-sm">
            {/* Pin animasi — bounce + ping ring (sama seperti versi deploy) */}
            <span className="relative">
              <span className="animate-bounce grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                <MapPin className="size-7" aria-hidden="true" />
              </span>
              <span
                className="animate-ping absolute inset-0 rounded-full bg-primary/20"
                aria-hidden="true"
              />
            </span>
            <p className="mt-2 text-lg font-bold text-foreground sm:text-xl">
              IzinPro — Jakarta Selatan
            </p>
            <p className="text-sm text-muted-foreground sm:text-base">
              {CONTACT_INFO.addressShort}
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-2 rounded-full border-none bg-background font-semibold shadow-md hover:bg-background/90"
            >
              <a
                href={CONTACT_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="size-4" aria-hidden="true" />
                Buka di Google Maps
              </a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
