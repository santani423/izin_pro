"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import {
  LANDING_VIDEO_TESTIMONIALS,
  type LandingVideoTestimonial,
} from "@/lib/landing";
import { cn } from "@/lib/utils";

/* ─── Video Testimoni Klien — klik kartu membuka pop-up pemutar ─── */
export default function VideoTestimonialsSection() {
  const [selected, setSelected] = useState<LandingVideoTestimonial | null>(
    null,
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        title="Video Testimoni Klien"
        subtitle="Simak pengalaman langsung dari klien yang telah menggunakan layanan IzinPro."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {LANDING_VIDEO_TESTIMONIALS.map((video, index) => (
          <Reveal key={video.id} delay={index * 0.08}>
            <article className="group">
              <button
                type="button"
                aria-label={`Putar video: ${video.title}`}
                onClick={() => setSelected(video)}
                className="relative block w-full overflow-hidden rounded-xl"
              >
                {/* Thumbnail — gradient warna per video */}
                <div
                  className={cn(
                    "aspect-video w-full bg-gradient-to-br",
                    video.gradient,
                  )}
                />
                <span className="absolute inset-0 grid place-items-center bg-foreground/15 transition-colors group-hover:bg-foreground/25">
                  <span className="grid size-11 place-items-center rounded-full bg-background/90 text-foreground shadow-md">
                    <Play
                      className="ml-0.5 size-5 fill-current"
                      aria-hidden="true"
                    />
                  </span>
                </span>
                <Badge
                  variant="secondary"
                  className="absolute bottom-2 right-2 bg-foreground/80 text-[11px] font-semibold text-background"
                >
                  {video.duration}
                </Badge>
              </button>
              <h3 className="mt-3 text-sm font-bold text-foreground">
                {video.title}
              </h3>
              <p className="text-xs text-muted-foreground">{video.service}</p>
            </article>
          </Reveal>
        ))}
      </div>

      {/* Pop-up pemutar video — placeholder gradient selama video asli belum ada */}
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent
          showCloseButton={false}
          className="w-full max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-3xl"
        >
          {selected && (
            <>
              <DialogTitle className="sr-only">
                {selected.title}
              </DialogTitle>

              {/* Area video — gradient sesuai kartu + play + nama di tengah */}
              <div
                className={cn(
                  "relative flex aspect-video w-full flex-col items-center justify-center gap-3 bg-gradient-to-br",
                  selected.gradient,
                )}
              >
                <Play className="size-12 text-white/70" aria-hidden="true" />
                <p className="text-sm font-medium text-white/90">
                  {selected.name}
                </p>

                {/* Tombol tutup — lingkaran gelap di pojok kanan atas */}
                <DialogClose
                  aria-label="Tutup video"
                  className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                >
                  <X className="size-5" aria-hidden="true" />
                </DialogClose>
              </div>

              {/* Footer — nama & jabatan klien */}
              <div className="bg-background px-6 py-5">
                <p className="text-base font-bold text-foreground">
                  {selected.name}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {selected.role}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
