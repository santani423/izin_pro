import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

import type { LayananDetail } from "@/lib/hydrate-layanan-detail";

/* ─── "Apa itu X?" — deskripsi + gambar / checklist manfaat ─── */
export default function LayananDetailAboutSection({
  about,
  imageUrl,
}: {
  about: LayananDetail["about"];
  imageUrl: string | null;
}) {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {about.title}
        </h2>
        {about.paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {about.checklist ? (
        /* Varian kartu hijau: gambar + checklist manfaat */
        <div className="flex flex-col gap-5 rounded-2xl bg-brand-surface p-5 sm:flex-row sm:items-center">
          {imageUrl ? (
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl sm:w-44">
              <Image src={imageUrl} alt={about.imageLabel} fill sizes="176px" className="object-cover" />
            </div>
          ) : (
            <div
              role="img"
              aria-label={about.imageLabel}
              className="aspect-[4/3] w-full shrink-0 rounded-xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark sm:w-44"
            />
          )}
          <ul className="space-y-3">
            {about.checklist.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span className="text-sm leading-snug text-foreground">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        /* Varian gambar penuh dengan badge lingkaran */
        <div className="relative">
          {imageUrl ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
              <Image src={imageUrl} alt={about.imageLabel} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          ) : (
            <div
              role="img"
              aria-label={about.imageLabel}
              className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark"
            />
          )}
          {about.badge && (
            <span className="absolute -left-4 top-1/2 grid size-24 -translate-y-1/2 place-items-center rounded-full border border-border/60 bg-background text-center text-xs font-bold leading-tight text-foreground shadow-md">
              {about.badge}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
