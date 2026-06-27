"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionWrapper from "@/components/shared/SectionWrapper";
import { FAQS } from "@/lib/constants";

/* ─── Section: FAQ ─── */
export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SectionWrapper id="faq">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="text-center mb-10 reveal">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-gray-500 mt-3">
            Temukan jawaban atas pertanyaan umum tentang layanan IzinPro.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, i) => (
            /* Wrapper reveal dipisah agar React tidak overwrite class "visible"
               saat className inner berubah karena state openIndex */
            <div
              key={i}
              className="reveal"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div
                className={cn(
                  "rounded-2xl border bg-white overflow-hidden transition-colors duration-200",
                  openIndex === i ? "border-primary/30 shadow-sm" : "border-gray-200",
                )}
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span
                    className={cn(
                      "font-semibold text-sm leading-snug pr-4",
                      openIndex === i ? "text-primary" : "text-gray-900",
                    )}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={cn(
                      "text-gray-400 flex-shrink-0 transition-transform duration-200",
                      openIndex === i && "rotate-180 text-primary",
                    )}
                  />
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
