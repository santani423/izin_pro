"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Reveal } from "@/components/shared/Reveal";
import { FAQS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* ─── FAQ — Pertanyaan yang Sering Diajukan ─── */
export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Heading center — khusus FAQ, berbeda dari pola rata kiri section lain */}
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Pertanyaan yang Sering Diajukan
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Temukan jawaban atas pertanyaan umum tentang layanan IzinPro.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <Reveal key={faq.question} delay={index * 0.05}>
              <div
                className={cn(
                  "overflow-hidden rounded-2xl border bg-card transition-colors",
                  isOpen ? "border-primary/40 shadow-sm" : "border-border/60",
                )}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span
                    className={cn(
                      "text-sm font-bold leading-snug sm:text-base",
                      isOpen ? "text-primary" : "text-foreground",
                    )}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180 text-primary",
                    )}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
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
