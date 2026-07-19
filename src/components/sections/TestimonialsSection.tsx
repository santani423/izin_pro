"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { cn } from "@/lib/utils";

export interface TestimonialData {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

const PAGE_SIZE = 4; // jumlah kartu per slide di desktop (sesuai desain)
const AUTO_SLIDE_MS = 5000;

/* Bagi testimoni menjadi halaman-halaman berisi PAGE_SIZE kartu */
function chunk(items: TestimonialData[], size: number) {
  const pages: TestimonialData[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

/* ─── Testimoni Klien — carousel dengan prev/next + auto-slide ─── */
export default function TestimonialsSection({
  testimonials,
}: {
  testimonials: TestimonialData[];
}) {
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const pages = chunk(testimonials, PAGE_SIZE);

  const prev = () => setPage((p) => (p - 1 + pages.length) % pages.length);
  const next = () => setPage((p) => (p + 1) % pages.length);

  /* Auto-slide — berhenti saat di-hover atau user memilih reduced motion */
  useEffect(() => {
    if (paused || prefersReducedMotion || pages.length <= 1) return;
    const timer = setInterval(next, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [paused, prefersReducedMotion, pages.length]);

  if (testimonials.length === 0) return null;

  return (
    <section id="testimoni" className="bg-brand-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        title="Testimoni Klien"
        subtitle="Kepercayaan dan kepuasan klien adalah prioritas kami."
      />

      {/* Viewport carousel — py-1 (+px-1 di tiap halaman) agar border kartu tepi tidak terpotong overflow-hidden */}
      <div
        className="overflow-hidden py-1"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {pages.map((pageItems, pageIndex) => (
            <div
              key={pageIndex}
              className="grid w-full shrink-0 grid-cols-1 gap-5 px-1 sm:grid-cols-2 lg:grid-cols-4"
              aria-hidden={page !== pageIndex}
            >
              {pageItems.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="h-full rounded-xl border-border/60 py-0"
                >
                  <CardContent className="flex h-full flex-col px-5 py-5">
                    <div
                      className="flex gap-0.5"
                      aria-label={`Rating ${testimonial.rating} dari 5 bintang`}
                    >
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="size-4 fill-primary text-primary"
                          aria-hidden="true"
                        />
                      ))}
                    </div>

                    <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
                      {testimonial.content}
                    </blockquote>

                    <figcaption className="mt-5 flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </figcaption>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Navigasi: prev + dots + next */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={prev}
          aria-label="Testimoni sebelumnya"
          className="rounded-full"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div
          className="flex gap-2"
          role="tablist"
          aria-label="Navigasi halaman testimoni"
        >
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={page === i}
              aria-label={`Halaman testimoni ${i + 1}`}
              onClick={() => setPage(i)}
              className={cn(
                "size-2 rounded-full transition-colors",
                page === i ? "bg-primary" : "bg-border hover:bg-primary/40",
              )}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={next}
          aria-label="Testimoni berikutnya"
          className="rounded-full"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      </div>
    </section>
  );
}
