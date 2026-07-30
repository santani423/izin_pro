import Image from "next/image";
import { BadgeCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AboutSection } from "@/lib/hydrate-about-content";

/* ─── Tentang Kami — foto + deskripsi + statistik ringkas ─── */
export default function TentangAboutSection({ content }: { content: AboutSection }) {
  const badgeStat = content.stats[0];

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
      {/* Foto + badge mengambang */}
      <div className="relative">
        {content.imageUrl ? (
          <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl">
            <Image
              src={content.imageUrl}
              alt="Foto tim IzinPro sedang berdiskusi dengan klien"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div
            role="img"
            aria-label="Foto tim IzinPro sedang berdiskusi dengan klien"
            className="aspect-[16/11] w-full rounded-2xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark"
          />
        )}
        {badgeStat && (
          <div className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3 shadow-md">
            <div>
              <p className="text-lg font-extrabold text-foreground">{badgeStat.value}</p>
              <p className="text-xs text-muted-foreground">{badgeStat.label}</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full border border-primary/30 text-primary">
              <BadgeCheck className="size-4" aria-hidden="true" />
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {content.kicker}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {content.title}{" "}
          <span className="block text-primary">{content.titleHighlight}</span>
        </h2>
        {content.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className={cn(
              "text-sm leading-relaxed text-muted-foreground sm:text-base",
              index === 0 ? "mt-4" : "mt-3",
            )}
          >
            {paragraph}
          </p>
        ))}

        {/* Statistik ringkas */}
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {content.stats.map(({ icon: Icon, value, label }, index) => (
            <li key={index} className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-base font-extrabold text-foreground">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
