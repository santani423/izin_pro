"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

/* ─── Accordion FAQ di dalam badan artikel (tanpa container section) ─── */
export default function BlogDetailFaq({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={faq.question}
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
        );
      })}
    </div>
  );
}
