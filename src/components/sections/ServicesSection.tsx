import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { SERVICE_ICONS, DEFAULT_SERVICE_ICON } from "@/lib/service-icons";

export interface ServiceCardData {
  id: string;
  icon: string | null;
  title: string;
  description: string;
  href: string;
  // null = pakai placeholder gradient hijau bawaan (lihat fallback di bawah)
  imageUrl: string | null;
}

/* ─── Daftar Layanan ─── */
export default function ServicesSection({ services }: { services: ServiceCardData[] }) {
  return (
    <section id="layanan" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        title="Daftar Layanan"
        subtitle="Layanan legal dengan proses mudah, cepat dan sesuai regulasi."
        linkLabel="Lihat Semua Layanan"
        linkHref="/layanan"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {services.map(({ id, icon, title, description, href, imageUrl }, index) => {
          const Icon = SERVICE_ICONS[icon ?? ""] ?? DEFAULT_SERVICE_ICON;
          return (
            <Reveal key={id} delay={index * 0.08}>
              <Card className="group h-full gap-0 overflow-hidden rounded-xl border-border/60 py-0 transition-shadow hover:shadow-md">
                <div className="relative">
                  {imageUrl ? (
                    /* Gambar titel dari admin */
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    /* Placeholder foto layanan — gradient hijau brand (fallback bawaan) */
                    <div
                      role="img"
                      aria-label={`Ilustrasi layanan ${title}`}
                      className="aspect-[16/10] w-full bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark"
                    />
                  )}
                  <span className="absolute -bottom-5 left-4 flex size-10 items-center justify-center rounded-lg border border-border bg-background text-primary shadow-sm">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                </div>

                <CardContent className="flex h-full flex-col px-4 pb-5 pt-8">
                  <h3 className="text-base font-bold text-foreground">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                  <Link
                    href={href}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    Selengkapnya
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
