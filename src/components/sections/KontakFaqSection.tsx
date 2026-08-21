"use client";

import { useState } from "react";
import Image from "next/image";
import { Headset, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { cn } from "@/lib/utils";
import { WHATSAPP_URL } from "@/lib/landing";
import { trackContact } from "@/lib/meta-pixel";

export interface KontakFaqItem {
  question: string;
  answer: string;
}

export interface KontakHelpCard {
  title: string;
  description: string;
  buttonLabel: string;
  imageUrl: string | null;
}

/* ─── FAQ singkat + kartu "Masih Punya Pertanyaan?" — panel abu ─── */
export default function KontakFaqSection({
  titlePrefix,
  titleHighlight,
  faqs,
  helpCard,
}: {
  titlePrefix: string;
  titleHighlight: string;
  faqs: KontakFaqItem[];
  helpCard: KontakHelpCard;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-muted/40 p-4 sm:p-6 lg:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {titlePrefix} <span className="text-primary">{titleHighlight}</span>
        </h2>

        <div className="mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          {/* Daftar FAQ — kartu putih per pertanyaan */}
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.question}
                  className={cn(
                    "overflow-hidden rounded-xl border bg-background transition-colors",
                    isOpen
                      ? "border-primary/40 shadow-sm"
                      : "border-border/60 shadow-sm",
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
                        className="size-4 shrink-0 text-primary"
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

          {/* Kartu bantuan — headset kiri, konten tengah, foto tim kanan */}
          <div className="relative flex items-center overflow-hidden rounded-2xl bg-brand-surface p-6 sm:p-8">
            <div className="flex items-start gap-5 xl:pr-44">
              <Headset
                className="size-12 shrink-0 text-primary"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <div>
                <h3 className="text-lg font-bold text-foreground sm:text-xl">
                  {helpCard.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {helpCard.description}
                </p>
                {/* Tombol — lebar penuh & teks kecil di mobile, ukuran normal ≥sm */}
                <Button
                  asChild
                  size="lg"
                  className="mt-5 w-full justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold sm:w-auto sm:gap-2 sm:px-5 sm:text-sm"
                >
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackContact()}
                  >
                    {helpCard.buttonLabel}
                    <WhatsAppIcon className="size-3.5 sm:size-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Foto tim — PNG transparan rata bawah-kanan kartu, hanya ≥xl */}
            <div className="pointer-events-none absolute bottom-0 right-0 hidden w-48 xl:block">
              <Image
                src={helpCard.imageUrl || "/images/promo-konsultasi.png"}
                alt=""
                width={612}
                height={408}
                sizes="192px"
                className="w-full object-contain object-bottom"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
