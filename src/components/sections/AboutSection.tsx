import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/Reveal";
import { VideoDialog } from "@/components/shared/VideoDialog";
import { ABOUT_DESCRIPTION, ABOUT_POINTS, ABOUT_VIDEO_URL } from "@/lib/landing";

/* ─── Tentang IzinPro ─── */
export default function AboutSection() {
  return (
    <section id="tentang" className="bg-brand-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[2fr_3fr] lg:px-8">
        {/* Kiri — teks */}
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Tentang IzinPro
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {ABOUT_DESCRIPTION}
          </p>

          <ul className="mt-6 space-y-3">
            {ABOUT_POINTS.map((point) => (
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
            <Link href="/tentang-kami">
              Selengkapnya Tentang Kami
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>

        {/* Kanan — thumbnail video, klik untuk buka pop-up pemutar */}
        <Reveal delay={0.15}>
          <VideoDialog
            videoUrl={ABOUT_VIDEO_URL}
            title="Video profil IzinPro"
          />
        </Reveal>
      </div>
    </section>
  );
}
