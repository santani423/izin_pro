import Image from "next/image";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { ArrowRight, CheckCircle2, ChevronRight, Download, ListOrdered } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { Reveal } from "@/components/shared/Reveal";
import BlogDetailFaq from "@/components/sections/BlogDetailFaq";
import { COMPANY_INFO } from "@/lib/constants";
import {
  PANDUAN_LEGALITAS_CHECKLIST,
  PANDUAN_LEGALITAS_FAQ,
  PANDUAN_LEGALITAS_HELP,
  PANDUAN_LEGALITAS_KEUNGGULAN,
  PANDUAN_LEGALITAS_LAYANAN,
  PANDUAN_LEGALITAS_NAV,
  PANDUAN_LEGALITAS_PENTING,
  PANDUAN_LEGALITAS_PROSES,
} from "@/lib/panduan-legalitas";

/* Kartu Daftar Isi — dirender 2x: mobile (setelah kartu penting) & sidebar desktop */
function DaftarIsiCard() {
  return (
    <Card className="gap-0 rounded-xl border-border/60 py-0">
      <CardContent className="px-5 py-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <ListOrdered className="size-4 text-primary" aria-hidden="true" />
          Daftar Isi
        </h2>
        <ol className="mt-3 space-y-2 border-l border-border pl-4">
          {PANDUAN_LEGALITAS_NAV.map(({ id, label }, index) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {index + 1}. {label}
              </a>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

/* ─── Badan panduan legalitas — 5 bagian konten & sidebar ─── */
export default function PanduanLegalitasBodySection() {
  const waHelp = encodeURIComponent(PANDUAN_LEGALITAS_HELP.waMessage);
  const PentingIcon = PANDUAN_LEGALITAS_PENTING.icon;

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_300px] lg:px-8">
      {/* ─── Konten utama ─── */}
      <article className="space-y-12">
        {/* 1. Mengapa legalitas penting */}
        <Reveal>
          <section
            id={PANDUAN_LEGALITAS_NAV[0].id}
            className="scroll-mt-24 rounded-2xl border border-primary/20 bg-brand-surface px-6 py-6"
          >
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[auto_1fr_1fr]">
              <span
                className="hidden size-16 shrink-0 place-items-center rounded-full bg-primary/10 text-primary md:grid"
                aria-hidden="true"
              >
                <PentingIcon className="size-7" />
              </span>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-primary">
                  {PANDUAN_LEGALITAS_PENTING.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {PANDUAN_LEGALITAS_PENTING.paragraph}
                </p>
              </div>
              <ul className="space-y-2.5">
                {PANDUAN_LEGALITAS_PENTING.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span className="text-sm leading-snug text-foreground">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </Reveal>

        {/* Daftar isi versi mobile/tablet — di bawah kartu penting */}
        <div className="lg:hidden">
          <DaftarIsiCard />
        </div>

        {/* 2. Legalitas yang kami tangani */}
        <Reveal>
          <section
            id={PANDUAN_LEGALITAS_NAV[1].id}
            className="scroll-mt-24"
          >
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Legalitas Usaha yang Kami Tangani
            </h2>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {PANDUAN_LEGALITAS_LAYANAN.map(
                ({ title, description, icon: Icon }, index) => (
                  <li key={title}>
                    <Reveal delay={index * 0.08} className="h-full">
                      <Card className="h-full gap-0 rounded-xl border-border/60 py-0">
                        <CardContent className="flex h-full flex-col items-center px-3 py-5 text-center">
                          <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                            <Icon className="size-5" aria-hidden="true" />
                          </span>
                          <h3 className="mt-3 text-xs font-bold leading-snug text-foreground sm:text-sm">
                            {title}
                          </h3>
                          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                            {description}
                          </p>
                        </CardContent>
                      </Card>
                    </Reveal>
                  </li>
                ),
              )}
            </ul>
            <div className="mt-6 flex justify-center">
              <Button
                asChild
                variant="outline"
                className="justify-center gap-1.5 rounded-lg px-4 text-xs font-semibold sm:gap-2 sm:px-5 sm:text-sm"
              >
                <Link href="/layanan">
                  Lihat Semua Layanan
                  <ArrowRight className="size-3.5 sm:size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </section>
        </Reveal>

        {/* 3. Proses layanan */}
        <Reveal>
          <section id={PANDUAN_LEGALITAS_NAV[2].id} className="scroll-mt-24">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Proses Layanan Kami
            </h2>
            <ol className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
              {PANDUAN_LEGALITAS_PROSES.map(
                ({ title, description, icon: Icon }, stepIndex) => (
                  <li
                    key={title}
                    className="relative flex flex-col items-center text-center"
                  >
                    {/* Panah putus-putus ke langkah berikutnya — hanya saat 6 kolom sejajar (lg) */}
                    {stepIndex < PANDUAN_LEGALITAS_PROSES.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="absolute left-[calc(50%+1.875rem)] right-[calc(-50%+1.875rem)] top-[1.375rem] hidden -translate-y-1/2 items-center lg:flex"
                      >
                        <span className="flex-1 border-t-2 border-dashed border-primary/40" />
                        <ChevronRight className="-ml-1.5 size-4 shrink-0 text-primary/60" />
                      </div>
                    )}
                    <div className="relative">
                      <span className="grid size-11 place-items-center rounded-full border border-primary/30 bg-background text-primary shadow-sm">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span
                        className="absolute -left-1.5 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white"
                        aria-hidden="true"
                      >
                        {stepIndex + 1}
                      </span>
                    </div>
                    <h3 className="mt-2 text-xs font-bold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </li>
                ),
              )}
            </ol>
          </section>
        </Reveal>

        {/* 4. Keunggulan IzinPro */}
        <Reveal>
          <section id={PANDUAN_LEGALITAS_NAV[3].id} className="scroll-mt-24">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Mengapa Memilih IzinPro?
            </h2>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {PANDUAN_LEGALITAS_KEUNGGULAN.map(
                ({ title, description, icon: Icon }, index) => (
                  <li key={title}>
                    <Reveal delay={index * 0.08} className="h-full">
                      <Card className="h-full gap-0 rounded-xl border-border/60 py-0">
                        <CardContent className="flex h-full flex-col px-4 py-5">
                          <span className="flex size-9 items-center justify-center rounded-lg border border-primary/30 text-primary">
                            <Icon className="size-4" aria-hidden="true" />
                          </span>
                          <h3 className="mt-3 text-xs font-bold leading-snug text-foreground sm:text-sm">
                            {title}
                          </h3>
                          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                            {description}
                          </p>
                        </CardContent>
                      </Card>
                    </Reveal>
                  </li>
                ),
              )}
            </ul>
          </section>
        </Reveal>

        {/* 5. FAQ seputar legalitas usaha */}
        <Reveal>
          <section id={PANDUAN_LEGALITAS_NAV[4].id} className="scroll-mt-24">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              FAQ Seputar Legalitas Usaha
            </h2>
            <div className="mt-5">
              <BlogDetailFaq items={PANDUAN_LEGALITAS_FAQ} />
            </div>
          </section>
        </Reveal>
      </article>

      {/* ─── Sidebar ─── */}
      <aside>
        <div className="space-y-5 lg:sticky lg:top-24">
          {/* Daftar isi — hanya desktop (mobile: di bawah kartu penting) */}
          <div className="hidden lg:block">
            <DaftarIsiCard />
          </div>

          {/* Kartu bantuan */}
          <div className="rounded-2xl bg-brand-surface p-6">
            <h2 className="text-base font-bold text-foreground">
              {PANDUAN_LEGALITAS_HELP.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {PANDUAN_LEGALITAS_HELP.description}
            </p>
            <Button
              asChild
              className="mt-4 w-full justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold sm:gap-2 sm:text-sm"
            >
              <WhatsAppLink
                href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${waHelp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {PANDUAN_LEGALITAS_HELP.cta}
                <WhatsAppIcon className="size-3.5 sm:size-4" />
              </WhatsAppLink>
            </Button>
          </div>

          {/* Kartu checklist gratis */}
          <Card className="gap-0 overflow-hidden rounded-xl border-border/60 py-0">
            <CardContent className="px-5 py-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                <Image
                  src={PANDUAN_LEGALITAS_CHECKLIST.image}
                  alt={PANDUAN_LEGALITAS_CHECKLIST.imageAlt}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              </div>
              <h2 className="mt-4 text-base font-bold text-foreground">
                <span className="text-primary">Gratis!</span> Checklist Legalitas
                Usaha untuk Bisnis Anda
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {PANDUAN_LEGALITAS_CHECKLIST.description}
              </p>
              {/* TODO: tautkan ke file PDF checklist saat sudah tersedia dari klien */}
              <Button
                variant="outline"
                className="mt-4 w-full justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold sm:gap-2 sm:text-sm"
              >
                {PANDUAN_LEGALITAS_CHECKLIST.cta}
                <Download className="size-3.5 sm:size-4" aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </aside>
    </div>
  );
}
