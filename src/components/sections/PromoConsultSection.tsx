import Image from "next/image";
import { Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { COMPANY_INFO } from "@/lib/constants";

/* ─── Banner ajakan klaim promo — foto kiri, CTA kanan ─── */
export default function PromoConsultSection() {
  const waMessage = encodeURIComponent(
    "Halo IzinPro, saya ingin menanyakan promo spesial yang sedang berjalan.",
  );

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-2xl bg-brand-surface px-6 py-8 sm:px-10 lg:grid-cols-[auto_1fr]">
        {/* Foto tim — PNG transparan, rata bawah agar terlihat berdiri di banner */}
        <div className="relative -mb-8 hidden aspect-[3/2] w-80 self-end lg:block">
          <Image
            src="/images/promo-konsultasi.png"
            alt="Tim IzinPro siap membantu Anda"
            fill
            sizes="320px"
            className="object-contain object-bottom"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Siap Dapatkan <span className="text-primary">Promo Spesial Ini?</span>
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Konsultasikan kebutuhan perizinan bisnis Anda sekarang juga dan
            dapatkan penawaran terbaik dari kami.
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
      </div>
    </section>
  );
}
