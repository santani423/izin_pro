import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { ListOrdered, Tag as TagIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { format } from "@/i18n/format";
import { getLocalizedGeneralSettings } from "@/lib/general-settings";
import type { PublicBlogPost, PublicBlogPostDetail } from "@/lib/blog-data";

/** Sisipkan id ke tiap <h2>/<h3> di HTML hasil Tiptap, sekalian kumpulin
 * jadi daftar isi — biar link anchor sidebar "Daftar Isi" bisa nyambung. */
function extractHeadingsAndInjectIds(html: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const usedIds = new Set<string>();

  const processedHtml = html.replace(
    /<h([23])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/gi,
    (_match, level: string, attrs: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, "").trim();
      const base =
        text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ||
        `bagian-${headings.length + 1}`;
      let id = base;
      let counter = 2;
      while (usedIds.has(id)) id = `${base}-${counter++}`;
      usedIds.add(id);
      headings.push({ id, text, level: Number(level) });
      return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    },
  );

  return { headings, html: processedHtml };
}

/* ─── Badan artikel — render HTML Tiptap + sidebar (daftar isi, bantuan,
 * artikel terkait) ─── */
export default async function BlogDetailProseSection({
  post,
  related,
}: {
  post: PublicBlogPostDetail;
  related: PublicBlogPost[];
}) {
  const dict = getDictionary(await getLocale());
  const { whatsapp } = await getLocalizedGeneralSettings();
  const { headings, html } = extractHeadingsAndInjectIds(post.content);
  const waMessage = encodeURIComponent(dict.blogDetailProse.waMessage);

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_300px] lg:px-8">
      {/* ─── Konten utama ─── */}
      <article className="min-w-0">
        <div
          className="prose prose-sm sm:prose-base max-w-none prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border/60 pt-6">
            <TagIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
      </article>

      {/* ─── Sidebar ─── */}
      <aside className="space-y-5">
        {headings.length > 0 && (
          <Card className="gap-0 rounded-xl border-border/60 py-0">
            <CardContent className="px-5 py-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <ListOrdered className="size-4 text-primary" aria-hidden="true" />
                {dict.blogDetailProse.tocHeading}
              </h2>
              <ol className="mt-3 space-y-2 border-l border-border pl-4">
                {headings.map((h) => (
                  <li key={h.id} className={h.level === 3 ? "ml-3" : undefined}>
                    <a
                      href={`#${h.id}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Kartu bantuan */}
        <div className="rounded-2xl bg-brand-surface p-6">
          <h2 className="text-base font-bold text-foreground">{dict.blogDetailProse.helpHeading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {dict.blogDetailProse.helpCopy}
          </p>
          <Button
            asChild
            className="mt-4 w-full justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold sm:gap-2 sm:text-sm"
          >
            <WhatsAppLink
              href={`https://wa.me/${whatsapp}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {dict.blogDetailProse.helpButton}
              <WhatsAppIcon className="size-3.5 sm:size-4" />
            </WhatsAppLink>
          </Button>
        </div>

        {/* Artikel terkait */}
        {related.length > 0 && (
          <Card className="gap-0 rounded-xl border-border/60 py-0">
            <CardContent className="px-5 py-5">
              <h2 className="text-sm font-bold text-foreground">{dict.blogDetailProse.relatedHeading}</h2>
              <ul className="mt-3 space-y-4">
                {related.map((r) => (
                  <li key={r.id} className="flex items-start gap-3">
                    {r.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.imageUrl}
                        alt={format(dict.blogDetailProse.ariaThumbnailTemplate, { title: r.title })}
                        className="block size-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span
                        role="img"
                        aria-label={format(dict.blogDetailProse.ariaThumbnailTemplate, { title: r.title })}
                        className={`block size-14 shrink-0 rounded-lg bg-gradient-to-br ${r.gradient}`}
                      />
                    )}
                    <div>
                      <Link
                        href={`/blog/${r.slug}`}
                        className="text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary"
                      >
                        {r.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">{r.dateLabel}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </aside>
    </div>
  );
}
