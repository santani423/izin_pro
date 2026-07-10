import { Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { COMPANY_INFO } from "@/lib/constants";

/* ─── Banner konsultasi — kartu hijau muda dengan CTA & telepon ─── */
export default function LayananConsultSection() {
  const waMessage = encodeURIComponent(
    "Halo IzinPro, saya ingin konsultasi memilih layanan perizinan yang tepat untuk bisnis saya.",
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-2xl bg-brand-surface px-6 py-8 sm:px-10 lg:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Butuh Layanan Perizinan
            <br />
            <span className="text-primary">yang Tepat untuk Bisnis Anda?</span>
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Konsultasikan kebutuhan Anda sekarang juga secara gratis bersama tim
            ahli kami.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* Tombol — lebar penuh & teks kecil di mobile, ukuran normal ≥sm */}
            <Button
              asChild
              size="lg"
              className="w-full justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold sm:w-auto sm:gap-2 sm:px-5 sm:text-sm"
            >
              <a
                href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Konsultasikan Gratis Sekarang
                <WhatsAppIcon className="size-3.5 sm:size-4" />
              </a>
            </Button>

            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
                <Phone className="size-4" aria-hidden="true" />
              </span>
              <div>
                <a
                  href={`tel:+${COMPANY_INFO.whatsapp}`}
                  className="text-sm font-bold text-foreground transition-colors hover:text-primary"
                >
                  {COMPANY_INFO.whatsappDisplay}
                </a>
                <p className="text-xs text-muted-foreground">
                  {COMPANY_INFO.hours}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder foto tim — gradient hijau brand */}
        <div
          role="img"
          aria-label="Foto tim IzinPro siap membantu konsultasi Anda"
          className="hidden aspect-[4/3] w-72 rounded-xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark lg:block"
        />
      </div>
    </section>
  );
}
