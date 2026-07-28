"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Reveal } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";
import type { LayananDetail } from "@/lib/hydrate-layanan-detail";

/* ─── FAQ seputar layanan — accordion grid (pola sama dengan FaqSection) ─── */
export default function LayananDetailFaqSection({
  faqs,
}: {
  faqs: LayananDetail["faqs"];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {faqs.title}
      </h2>

      <div className="mt-6 grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {faqs.items.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <Reveal key={index} delay={index * 0.05}>
              <div
                className={cn(
                  "overflow-hidden rounded-xl border bg-card transition-colors",
                  isOpen ? "border-primary/40 shadow-sm" : "border-border/60",
                )}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                >
                  <span
                    className={cn(
                      "text-sm font-semibold leading-snug",
                      isOpen ? "text-primary" : "text-foreground",
                    )}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180 text-primary",
                    )}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
