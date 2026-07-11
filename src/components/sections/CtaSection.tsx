import { Headset } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { WHATSAPP_URL } from "@/lib/landing";

interface CtaSectionProps {
  /** Judul, subjudul & label tombol bisa dioverride per halaman */
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
}

/* ─── CTA Banner ─── */
export default function CtaSection({
  title = "Siap Memulai Perizinan Bisnis Anda?",
  subtitle = "Konsultasikan kebutuhan perizinan Anda sekarang gratis bersama tim ahli kami.",
  buttonLabel = "Konsultasikan Gratis Sekarang",
}: CtaSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-gradient-to-br from-primary via-brand-green-dark to-brand-green-dark px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10">
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10">
            <Headset className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
            <p className="mt-1 text-sm text-white/80">{subtitle}</p>
          </div>
        </div>

        {/* Tombol — lebar penuh & teks kecil di mobile, ukuran normal ≥sm */}
        <Button
          asChild
          size="lg"
          className="w-full shrink-0 justify-center gap-1.5 rounded-lg bg-white px-2.5 text-xs font-semibold text-brand-green-dark hover:bg-white/90 sm:w-auto sm:gap-2 sm:px-5 sm:text-sm"
        >
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            {buttonLabel}
            <WhatsAppIcon className="size-3.5 text-primary sm:size-4" />
          </a>
        </Button>
      </div>
    </section>
  );
}
