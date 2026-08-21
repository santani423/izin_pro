"use client";

import { LocalizedLink as Link } from "@/components/shared/LocalizedLink";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/Reveal";
import { VideoDialog } from "@/components/shared/VideoDialog";
import { DEFAULT_ABOUT_HOME_CONTENT, type AboutHomeContentData } from "@/lib/home-content";

export { DEFAULT_ABOUT_HOME_CONTENT, type AboutHomeContentData };

/* ─── Tentang IzinPro ─── */
export default function AboutSection({ content = DEFAULT_ABOUT_HOME_CONTENT }: { content?: AboutHomeContentData }) {
  return (
    <section id="tentang" className="bg-brand-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[2fr_3fr] lg:px-8">
        {/* Kiri — teks */}
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {content.heading}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {content.description}
          </p>

          <ul className="mt-6 space-y-3">
            {content.points.map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                <CheckCircle2
                  className="size-5 shrink-0 fill-primary text-primary-foreground"
                  aria-hidden="true"
                />
                {point}
              </li>
            ))}
          </ul>

          <Button asChild className="mt-7 rounded-lg font-semibold">
            <Link href={content.buttonHref}>
              {content.buttonLabel}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>

        {/* Kanan — thumbnail video, klik untuk buka pop-up pemutar */}
        <Reveal delay={0.15}>
          <VideoDialog
            source={content.video}
            title={content.videoTitle}
          />
        </Reveal>
      </div>
    </section>
  );
}
