"use client";

import { useState } from "react";
import { Quote, Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";

export interface TestimoniGridItem {
  id: string;
  name: string;
  role: string;
  content: string;
  categoryId: string | null;
  categoryName: string | null;
}

const SEMUA = "semua";

/* Inisial nama untuk avatar, mis. "Andi Setiawan" → "AS" */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ─── Grid testimoni dengan filter kategori (client) ─── */
export default function TestimoniGridSection({
  testimonials,
}: {
  testimonials: TestimoniGridItem[];
}) {
  const [activeCategory, setActiveCategory] = useState(SEMUA);

  /* Tab kategori diturunkan dari kategori yang benar-benar dipakai testimoni
   * yang ada — bukan daftar statis, supaya selalu sinkron dengan data admin. */
  const categories = Array.from(
    new Map(
      testimonials
        .filter((t) => t.categoryId && t.categoryName)
        .map((t) => [t.categoryId as string, t.categoryName as string]),
    ).entries(),
  );

  const filtered = testimonials.filter(
    (t) => activeCategory === SEMUA || t.categoryId === activeCategory,
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Apa Kata <span className="text-primary">Klien Kami?</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Pengalaman nyata dari klien yang telah menggunakan layanan IzinPro.
        </p>
      </div>

      {categories.length > 0 && (
        <div
          role="tablist"
          aria-label="Filter kategori testimoni"
          className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible"
        >
          <button
            role="tab"
            aria-selected={activeCategory === SEMUA}
            onClick={() => setActiveCategory(SEMUA)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              activeCategory === SEMUA
                ? "bg-primary text-white"
                : "border border-border/60 text-muted-foreground hover:text-primary",
            )}
          >
            Semua Testimoni
          </button>
          {categories.map(([id, name]) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeCategory === id}
              onClick={() => setActiveCategory(id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                activeCategory === id
                  ? "bg-primary text-white"
                  : "border border-border/60 text-muted-foreground hover:text-primary",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(({ id, name, role, content, categoryName }, index) => (
          <Reveal key={id} delay={index * 0.08} className="h-full">
            <Card className="h-full gap-0 rounded-xl border-border/60 py-0">
              <CardContent className="flex h-full flex-col px-5 py-6">
                <div className="flex items-start justify-between">
                  <p
                    className="flex gap-0.5"
                    role="img"
                    aria-label="Rating 5 dari 5 bintang"
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-primary text-primary"
                        aria-hidden="true"
                      />
                    ))}
                  </p>
                  <Quote
                    className="size-5 text-primary/30"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {content}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-lime to-brand-green-dark text-xs font-bold text-white"
                    aria-hidden="true"
                  >
                    {getInitials(name)}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {name}
                    </p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
                {categoryName && (
                  <span className="mt-4 self-start rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {categoryName}
                  </span>
                )}
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Belum ada testimoni untuk kategori ini.
        </p>
      )}
    </section>
  );
}
