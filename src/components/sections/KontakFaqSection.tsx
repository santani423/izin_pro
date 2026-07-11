"use client";

import { useState } from "react";
import { Headset, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { cn } from "@/lib/utils";
import { WHATSAPP_URL } from "@/lib/landing";
import { KONTAK_FAQS } from "@/lib/kontak";

/* ─── FAQ singkat + kartu "Masih Punya Pertanyaan?" ─── */
export default function KontakFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-6 px-4 pb-14 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Pertanyaan yang <span className="text-primary">Sering Diajukan</span>
        </h2>
        <div className="mt-6 space-y-3">
          {KONTAK_FAQS.map((faq, index) => {
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
                  {isOpen ? (
                    <Minus
                      className="size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  ) : (
                    <Plus
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
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
      </div>

      {/* Kartu bantuan */}
      <div className="flex flex-col justify-center rounded-2xl bg-brand-surface p-6 sm:p-8 lg:mt-14">
        <span className="flex size-12 items-center justify-center rounded-full border border-primary/30 text-primary">
          <Headset className="size-6" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-foreground">
          Masih Punya Pertanyaan?
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Tim ahli kami siap membantu Anda memberikan solusi terbaik untuk
          kebutuhan bisnis Anda.
        </p>
        {/* Tombol — lebar penuh & teks kecil di mobile, ukuran normal ≥sm */}
        <Button
          asChild
          size="lg"
          className="mt-5 w-full justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold sm:w-auto sm:gap-2 sm:self-start sm:px-5 sm:text-sm"
        >
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            Konsultasikan Gratis Sekarang
            <WhatsAppIcon className="size-3.5 sm:size-4" />
          </a>
        </Button>
      </div>
    </section>
  );
}
