import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import {
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  ListOrdered,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import BlogDetailFaq from "@/components/sections/BlogDetailFaq";
import { COMPANY_INFO } from "@/lib/constants";
import type { BlogPost } from "@/types";
import type { ArticleBlock, ArticleDetail } from "@/lib/blog-detail";

/* Render satu blok konten artikel sesuai tipenya */
function ArticleBlockView({
  block,
  index,
}: {
  block: ArticleBlock;
  index: number;
}) {
  const anchorId = `bagian-${index + 1}`;

  return (
    <section id={anchorId} className="scroll-mt-24">
      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {index + 1}. {block.heading}
      </h2>

      {block.type === "text" && (
        <div className="mt-4 grid grid-cols-1 items-start gap-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            {block.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-sm leading-relaxed text-muted-foreground sm:text-base"
              >
                {paragraph}
              </p>
            ))}
          </div>
          {block.imageLabel && (
            <div
              role="img"
              aria-label={block.imageLabel}
              className="hidden aspect-[4/3] w-56 rounded-xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark md:block"
            />
          )}
        </div>
      )}

      {block.type === "cards" && (
        <>
          {block.lead && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {block.lead}
            </p>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {block.items.map(({ title, description, icon: Icon }) => (
              <Card
                key={title}
                className="h-full gap-0 rounded-xl border-border/60 py-0"
              >
                <CardContent className="flex h-full flex-col items-center px-3 py-4 text-center">
                  <span className="flex size-9 items-center justify-center rounded-lg border border-primary/30 text-primary">
                    {Icon ? (
                      <Icon className="size-4" aria-hidden="true" />
                    ) : (
                      <ClipboardCheck className="size-4" aria-hidden="true" />
                    )}
                  </span>
                  <h3 className="mt-2 text-xs font-bold text-foreground sm:text-sm">
                    {title}
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {block.type === "steps" && (
        <>
          {block.lead && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {block.lead}
            </p>
          )}
          <ol className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {block.steps.map(({ title, description, icon: Icon }, stepIndex) => (
              <li
                key={title}
                className="relative flex flex-col items-center text-center"
              >
                {/* Panah putus-putus ke langkah berikutnya — hanya saat 6 kolom sejajar (lg) */}
                {stepIndex < block.steps.length - 1 && (
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
                    {Icon ? (
                      <Icon className="size-5" aria-hidden="true" />
                    ) : (
                      <FileText className="size-5" aria-hidden="true" />
                    )}
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
            ))}
          </ol>
        </>
      )}

      {block.type === "info" && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {block.items.map(({ title, value, description }) => (
            <div
              key={title}
              className="rounded-xl bg-brand-surface px-5 py-5"
            >
              <p className="text-xs font-semibold text-muted-foreground">
                {title}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-primary">
                {value}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      )}

      {block.type === "faq" && (
        <div className="mt-5">
          <BlogDetailFaq items={block.items} />
        </div>
      )}
    </section>
  );
}

/* ─── Badan artikel — ringkasan, blok konten & sidebar ─── */
export default function BlogDetailBodySection({
  detail,
  related,
}: {
  detail: ArticleDetail;
  related: BlogPost[];
}) {
  const waMessage = encodeURIComponent(
    "Halo IzinPro, saya membaca artikel di website dan ingin konsultasi lebih lanjut.",
  );

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_300px] lg:px-8">
      {/* ─── Konten utama ─── */}
      <article className="space-y-10">
        {/* Ringkasan */}
        <div className="rounded-2xl bg-brand-surface px-5 py-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <FileText className="size-4 text-primary" aria-hidden="true" />
            Ringkasan Artikel
          </h2>
          <ul className="mt-3 space-y-2">
            {detail.summary.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="text-sm leading-relaxed text-foreground">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {detail.blocks.map((block, index) => (
          <ArticleBlockView key={block.heading} block={block} index={index} />
        ))}
      </article>

      {/* ─── Sidebar ─── */}
      <aside className="space-y-5">
        {/* Daftar isi */}
        <Card className="gap-0 rounded-xl border-border/60 py-0">
          <CardContent className="px-5 py-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <ListOrdered className="size-4 text-primary" aria-hidden="true" />
              Daftar Isi
            </h2>
            <ol className="mt-3 space-y-2 border-l border-border pl-4">
              {detail.blocks.map((block, index) => (
                <li key={block.heading}>
                  <a
                    href={`#bagian-${index + 1}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {index + 1}. {block.heading}
                  </a>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Kartu bantuan */}
        <div className="rounded-2xl bg-brand-surface p-6">
          <h2 className="text-base font-bold text-foreground">
            {detail.help.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {detail.help.description}
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
              Konsultasikan Gratis
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
              {related.map((post) => (
                <li key={post.id} className="flex items-start gap-3">
                  <span
                    role="img"
                    aria-label={`Thumbnail artikel ${post.title}`}
                    className={`block size-14 shrink-0 rounded-lg bg-gradient-to-br ${post.gradient}`}
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
      </aside>
    </div>
  );
}
