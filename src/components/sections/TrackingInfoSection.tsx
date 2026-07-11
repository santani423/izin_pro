import { MessageSquareText, Search, Ticket } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/shared/Reveal";

const HOW_IT_WORKS = [
  {
    icon: Ticket,
    title: "Dapatkan Nomor Order",
    description:
      "Nomor order dikirim via WhatsApp/email saat Anda mendaftar layanan IzinPro.",
  },
  {
    icon: Search,
    title: "Masukkan & Lacak",
    description:
      "Ketik nomor order di kolom pencarian di atas, lalu klik Lacak Sekarang.",
  },
  {
    icon: MessageSquareText,
    title: "Pantau atau Tanyakan",
    description:
      "Lihat tahapan proses secara langsung, atau hubungi tim kami untuk detail lebih lanjut.",
  },
];

/* ─── Cara kerja tracking — 3 kartu ─── */
export default function TrackingInfoSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Bagaimana <span className="text-primary">Cara Kerjanya?</span>
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {HOW_IT_WORKS.map(({ icon: Icon, title, description }, index) => (
          <Reveal key={title} delay={index * 0.08}>
            <Card className="h-full gap-0 rounded-xl border-border/60 py-0">
              <CardContent className="flex h-full flex-col items-center px-5 py-6 text-center">
                <span className="flex size-11 items-center justify-center rounded-lg border border-primary/30 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-sm font-bold text-foreground">
                  {title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
