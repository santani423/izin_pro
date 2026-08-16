"use client";

import { useState } from "react";
import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/shared/Reveal";
import { useDictionary } from "@/contexts/LocaleContext";
import { format } from "@/i18n/format";
import { cn } from "@/lib/utils";
import { LAYANAN_CATEGORIES, LAYANAN_SERVICES } from "@/lib/layanan";

/* ─── Katalog layanan — heading, filter kategori & grid kartu ───
 * Client component karena filter kategori butuh state; konten tetap
 * ter-render di server (SSR) sehingga aman untuk SEO.
 */
export default function LayananCatalogSection() {
  const dict = useDictionary();
  const [activeCategory, setActiveCategory] = useState("semua");

  const filtered = LAYANAN_SERVICES.filter(
    (s) => activeCategory === "semua" || s.category === activeCategory,
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {dict.layananCatalog.headingPrefix}
        <br />
        <span className="text-primary">{dict.layananCatalog.headingHighlight}</span>
      </h2>

      {/* Filter kategori — scroll horizontal di mobile, wrap di ≥sm */}
      <div
        role="tablist"
        aria-label={dict.layananCatalog.ariaFilter}
        className="mt-8 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible"
      >
        {LAYANAN_CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeCategory === id}
            onClick={() => setActiveCategory(id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              activeCategory === id
                ? "bg-primary text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map(({ id, slug, icon: Icon, title, description }, index) => (
          <Reveal key={id} delay={index * 0.08}>
            <Card className="group h-full gap-0 overflow-hidden rounded-xl border-border/60 py-0 transition-shadow hover:shadow-md">
              {/* Placeholder foto layanan — gradient hijau brand */}
              <div
                role="img"
                aria-label={format(dict.layananCatalog.ariaIllustrationTemplate, { title })}
                className="grid aspect-[16/10] w-full place-items-center bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark"
              >
                <Icon className="size-8 text-white/80" aria-hidden="true" />
              </div>

              <CardContent className="flex h-full flex-col px-4 pb-5 pt-4">
                <h3 className="text-base font-bold text-foreground">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
                <Link
                  href={`/layanan/${slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  {dict.layananCatalog.cardLink}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
