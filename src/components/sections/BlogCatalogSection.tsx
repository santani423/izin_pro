"use client";

import { useMemo, useState } from "react";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BLOG_TOPICS } from "@/lib/blog";
import { useDictionary } from "@/contexts/LocaleContext";
import { format } from "@/i18n/format";
import type { PublicBlogPost, BlogCategory } from "@/lib/blog-data";

const PAGE_SIZE = 4;

/* ─── Katalog artikel — search bar, sidebar & grid (client) ─── */
export default function BlogCatalogSection({
  posts,
  categories,
}: {
  posts: PublicBlogPost[];
  categories: BlogCategory[];
}) {
  const dict = useDictionary();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(dict.blogCatalog.allArticles);
  const [sortNewest, setSortNewest] = useState(true);
  const [page, setPage] = useState(1);
  const [subscribed, setSubscribed] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const result = posts.filter((post) => {
      const matchQuery =
        q === "" ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q);
      const matchCategory =
        activeCategory === dict.blogCatalog.allArticles || post.categoryName === activeCategory;
      return matchQuery && matchCategory;
    });
    /* posts sudah urut terbaru → terlama (orderBy publishedAt desc) */
    return sortNewest ? result : [...result].reverse();
  }, [posts, query, activeCategory, sortNewest, dict]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <>
      {/* Search bar — kartu menimpa bawah hero */}
      <section
        aria-label={dict.blogCatalog.ariaSearchSection}
        className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={dict.blogCatalog.searchPlaceholder}
              aria-label={dict.blogCatalog.ariaSearchInput}
              className="h-10 w-full rounded-lg border border-border/60 bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button className="justify-center gap-2 rounded-lg font-semibold sm:px-6">
            {dict.blogCatalog.searchButton}
            <Search className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        {/* ─── Sidebar ─── */}
        <aside className="space-y-5">
          {/* Kategori */}
          <Card className="gap-0 rounded-xl border-border/60 py-0">
            <CardContent className="px-5 py-5">
              <h2 className="text-sm font-bold text-foreground">{dict.blogCatalog.categoriesHeading}</h2>
              <ul className="mt-3 space-y-1">
                {categories.map(({ label, count }) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory(label);
                        setPage(1);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                        activeCategory === label
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {label}
                      <span className="text-xs">{count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Topik populer */}
          <Card className="gap-0 rounded-xl border-border/60 py-0">
            <CardContent className="px-5 py-5">
              <h2 className="text-sm font-bold text-foreground">
                {dict.blogCatalog.popularTopicsHeading}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {BLOG_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      setQuery(topic);
                      setPage(1);
                    }}
                    className="rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Newsletter */}
          <Card className="gap-0 rounded-xl border-border/60 py-0">
            <CardContent className="px-5 py-5">
              <h2 className="text-sm font-bold text-foreground">
                {dict.blogCatalog.newsletterHeading}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {dict.blogCatalog.newsletterCopy}
              </p>
              {subscribed ? (
                <p className="mt-3 rounded-lg bg-primary/10 px-3 py-2.5 text-xs font-semibold text-primary">
                  {dict.blogCatalog.newsletterThanks}
                </p>
              ) : (
                <form
                  className="mt-3 space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubscribed(true);
                  }}
                >
                  <input
                    type="email"
                    required
                    placeholder={dict.blogCatalog.newsletterPlaceholder}
                    aria-label={dict.blogCatalog.ariaNewsletterInput}
                    className="h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <Button
                    type="submit"
                    className="w-full justify-center gap-2 rounded-lg font-semibold"
                  >
                    {dict.blogCatalog.newsletterButton}
                    <Send className="size-4" aria-hidden="true" />
                  </Button>
                </form>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground">
                {dict.blogCatalog.newsletterPrivacy}
              </p>
            </CardContent>
          </Card>
        </aside>

        {/* ─── Daftar artikel ─── */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {dict.blogCatalog.latestArticlesHeading}
            </h2>
            <Select
              items={{ terbaru: dict.blogCatalog.sortNewest, terlama: dict.blogCatalog.sortOldest }}
              value={sortNewest ? "terbaru" : "terlama"}
              onValueChange={(value) => setSortNewest(value === "terbaru")}
            >
              <SelectTrigger
                aria-label={dict.blogCatalog.ariaSort}
                className="h-9 min-w-32 rounded-lg border-border/60 bg-background pl-3 font-medium hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} align="end">
                <SelectItem value="terbaru">{dict.blogCatalog.sortNewest}</SelectItem>
                <SelectItem value="terlama">{dict.blogCatalog.sortOldest}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {visible.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <p className="text-sm font-semibold text-foreground">
                {dict.blogCatalog.emptyTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dict.blogCatalog.emptyCopy}
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-lg"
                onClick={() => {
                  setQuery("");
                  setActiveCategory(dict.blogCatalog.allArticles);
                  setPage(1);
                }}
              >
                {dict.blogCatalog.resetFilter}
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {visible.map((post) => (
                <Card
                  key={post.id}
                  className="group h-full gap-0 overflow-hidden rounded-xl border-border/60 py-0 transition-shadow hover:shadow-md"
                >
                  {/* Thumbnail — gambar unggulan kalau ada, gradient sbg fallback */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    {post.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.imageUrl}
                        alt={format(dict.blogCatalog.ariaThumbnailTemplate, { title: post.title })}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div
                        role="img"
                        aria-label={format(dict.blogCatalog.ariaThumbnailTemplate, { title: post.title })}
                        className={`size-full bg-gradient-to-br ${post.gradient}`}
                      />
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white">
                      {post.categoryName}
                    </span>
                  </div>
                  <CardContent className="flex h-full flex-col px-4 pb-5 pt-4">
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3.5" aria-hidden="true" />
                        {post.dateLabel}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" aria-hidden="true" />
                        {post.readTimeLabel}
                      </span>
                    </p>
                    <h3 className="mt-2 text-base font-bold leading-snug text-foreground">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="transition-colors hover:text-primary"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      {dict.blogCatalog.readMore}
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label={dict.blogCatalog.ariaPaginationNav}
              className="mt-8 flex items-center justify-center gap-2"
            >
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-50"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                {dict.blogCatalog.prevPage}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-current={n === currentPage ? "page" : undefined}
                  onClick={() => setPage(n)}
                  className={cn(
                    "size-9 rounded-lg text-sm font-semibold transition-colors",
                    n === currentPage
                      ? "bg-primary text-white"
                      : "border border-border/60 text-muted-foreground hover:text-primary",
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-50"
              >
                {dict.blogCatalog.nextPage}
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
