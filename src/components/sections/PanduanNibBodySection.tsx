import Image from "next/image";
import Link from "next/link";
import { ChevronRight, FileText, ListOrdered } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { Reveal } from "@/components/shared/Reveal";
import BlogDetailFaq from "@/components/sections/BlogDetailFaq";
import { BLOG_POSTS, COMPANY_INFO } from "@/lib/constants";
import {
  PANDUAN_NIB_FAQ,
  PANDUAN_NIB_HELP,
  PANDUAN_NIB_INFO,
  PANDUAN_NIB_INTRO,
  PANDUAN_NIB_LANGKAH,
  PANDUAN_NIB_LANGKAH_LEAD,
  PANDUAN_NIB_NAV,
  PANDUAN_NIB_RELATED,
  PANDUAN_NIB_SUMMARY,
  PANDUAN_NIB_SYARAT,
  PANDUAN_NIB_SYARAT_LEAD,
} from "@/lib/panduan-nib";

/* Judul bagian artikel bernomor + anchor untuk Daftar Isi */
function SectionHeadingAnchor({
  index,
  id,
  title,
}: {
  index: number;
  id: string;
  title: string;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
    >
      {index}. {title}
    </h2>
  );
}

/* Kartu Daftar Isi — dirender 2x: mobile (setelah ringkasan) & sidebar desktop */
function DaftarIsiCard() {
  return (
    <Card className="gap-0 rounded-xl border-border/60 py-0">
      <CardContent className="px-5 py-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <ListOrdered className="size-4 text-primary" aria-hidden="true" />
          Daftar Isi
        </h2>
        <ol className="mt-3 space-y-2 border-l border-border pl-4">
          {PANDUAN_NIB_NAV.map(({ id, label }, index) => (
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

/* ─── Badan panduan NIB — ringkasan, 5 bagian konten & sidebar ─── */
export default function PanduanNibBodySection() {
  const related = PANDUAN_NIB_RELATED.map(({ slug, image }) => {
    const post = BLOG_POSTS.find((p) => p.slug === slug);
    return post ? { post, image } : null;
  }).filter((item) => item !== null);

  const waMessage = encodeURIComponent(PANDUAN_NIB_HELP.waMessage);

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_300px] lg:px-8">
      {/* ─── Konten utama ─── */}
      <article className="space-y-10">
        {/* Ringkasan artikel */}
        <Reveal>
          <div className="rounded-2xl border border-primary/20 bg-brand-surface px-5 py-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <FileText className="size-4 text-primary" aria-hidden="true" />
              Ringkasan Artikel
            </h2>
            <div className="mt-3 space-y-1.5">
              {PANDUAN_NIB_SUMMARY.map((point) => (
                <p
                  key={point}
                  className="text-sm leading-relaxed text-foreground"
                >
                  {point}
                </p>
              ))}
            </div>
            {/* Chip lompat ke bagian */}
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
              {PANDUAN_NIB_NAV.map(({ id, shortLabel, icon: Icon }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground transition-colors hover:text-primary sm:text-sm"
                  >
                    <span className="flex size-6 items-center justify-center rounded-md border border-primary/30 text-primary">
                      <Icon className="size-3" aria-hidden="true" />
                    </span>
                    {shortLabel}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Daftar isi versi mobile/tablet — di bawah ringkasan */}
        <div className="lg:hidden">
          <DaftarIsiCard />
        </div>

        {/* 1. Apa itu NIB */}
        <Reveal>
          <section>
            <SectionHeadingAnchor
              index={1}
              id={PANDUAN_NIB_NAV[0].id}
              title={PANDUAN_NIB_NAV[0].label}
            />
            <div className="mt-4 grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                {PANDUAN_NIB_INTRO.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-relaxed text-muted-foreground sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <Image
                src={PANDUAN_NIB_INTRO.image}
                alt={PANDUAN_NIB_INTRO.imageAlt}
                width={256}
                height={192}
                className="hidden w-64 rounded-xl md:block"
              />
            </div>
          </section>
        </Reveal>

        {/* 2. Syarat mengurus NIB */}
        <Reveal>
          <section>
            <SectionHeadingAnchor
              index={2}
              id={PANDUAN_NIB_NAV[1].id}
              title={PANDUAN_NIB_NAV[1].label}
            />
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {PANDUAN_NIB_SYARAT_LEAD}
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {PANDUAN_NIB_SYARAT.map(({ title, description, icon: Icon }) => (
                <li key={title}>
                  <Card className="h-full gap-0 rounded-xl border-border/60 py-0">
                    <CardContent className="flex h-full flex-col items-center px-3 py-4 text-center">
                      <span className="flex size-9 items-center justify-center rounded-lg border border-primary/30 text-primary">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <h3 className="mt-2 text-xs font-bold text-foreground">
                        {title}
                      </h3>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        {/* 3. Langkah mengurus NIB */}
        <Reveal>
          <section>
            <SectionHeadingAnchor
              index={3}
              id={PANDUAN_NIB_NAV[2].id}
              title="Langkah Mengurus NIB Melalui OSS"
            />
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {PANDUAN_NIB_LANGKAH_LEAD}
            </p>
            <ol className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
              {PANDUAN_NIB_LANGKAH.map(
                ({ title, description, icon: Icon }, stepIndex) => (
                  <li
                    key={title}
                    className="relative flex flex-col items-center text-center"
                  >
                    {/* Panah putus-putus ke langkah berikutnya — hanya saat 6 kolom sejajar (lg) */}
                    {stepIndex < PANDUAN_NIB_LANGKAH.length - 1 && (
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

        {/* 4. Biaya & waktu proses */}
        <Reveal>
          <section>
            <SectionHeadingAnchor
              index={4}
              id={PANDUAN_NIB_NAV[3].id}
              title={PANDUAN_NIB_NAV[3].label}
            />
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {PANDUAN_NIB_INFO.map(
                ({ title, value, description, icon: Icon, image, imageAlt }) => (
                  <div
                    key={title}
                    className="flex items-center gap-4 rounded-xl bg-brand-surface px-5 py-5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Icon className="size-3.5 text-primary" aria-hidden="true" />
                        {title}
                      </p>
                      <p className="mt-2 text-2xl font-extrabold tracking-tight text-primary">
                        {value}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </div>
                    <Image
                      src={image}
                      alt={imageAlt}
                      width={112}
                      height={112}
                      className="w-24 shrink-0 sm:w-28"
                    />
                  </div>
                ),
              )}
            </div>
          </section>
        </Reveal>

        {/* 5. FAQ seputar NIB */}
        <Reveal>
          <section>
            <SectionHeadingAnchor
              index={5}
              id={PANDUAN_NIB_NAV[4].id}
              title={PANDUAN_NIB_NAV[4].label}
            />
            <div className="mt-5">
              <BlogDetailFaq items={PANDUAN_NIB_FAQ} />
            </div>
          </section>
        </Reveal>
      </article>

      {/* ─── Sidebar ─── */}
      <aside>
        <div className="space-y-5 lg:sticky lg:top-24">
          {/* Daftar isi — hanya desktop (mobile: di bawah ringkasan) */}
          <div className="hidden lg:block">
            <DaftarIsiCard />
          </div>

          {/* Kartu bantuan */}
          <div className="rounded-2xl bg-brand-surface p-6">
            <h2 className="text-base font-bold text-foreground">
              {PANDUAN_NIB_HELP.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {PANDUAN_NIB_HELP.description}
            </p>
            <Button
              asChild
              className="mt-4 w-full justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold sm:gap-2 sm:text-sm"
            >
              <a
                href={`https://wa.me/${COMPANY_INFO.whatsapp}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {PANDUAN_NIB_HELP.cta}
                <WhatsAppIcon className="size-3.5 sm:size-4" />
              </a>
            </Button>
          </div>

          {/* Artikel terkait */}
          <Card className="gap-0 rounded-xl border-border/60 py-0">
            <CardContent className="px-5 py-5">
              <h2 className="text-sm font-bold text-foreground">
                Artikel Terkait
              </h2>
              <ul className="mt-3 space-y-4">
                {related.map(({ post, image }) => (
                  <li key={post.id} className="flex items-start gap-3">
                    <Image
                      src={image}
                      alt={`Thumbnail artikel ${post.title}`}
                      width={56}
                      height={56}
                      className="size-14 shrink-0 rounded-lg object-cover"
                    />
                    <div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {post.date}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </aside>
    </div>
  );
}
