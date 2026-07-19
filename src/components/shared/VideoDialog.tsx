"use client";

import { useState } from "react";
import { Play } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface VideoDialogProps {
  /** URL embed video (mis. https://www.youtube.com/embed/xxxx) */
  videoUrl: string;
  title: string;
  /** Kelas tambahan untuk thumbnail (mis. rasio aspek) */
  thumbnailClassName?: string;
}

/* ─── Thumbnail video + pop-up pemutar ───
 * Iframe hanya dirender saat dialog terbuka, jadi video otomatis
 * berhenti ketika pop-up ditutup.
 */
export function VideoDialog({
  videoUrl,
  title,
  thumbnailClassName,
}: VideoDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsLoading(true);
          setOpen(true);
        }}
        aria-label={`Putar video: ${title}`}
        className="group relative block w-full overflow-hidden rounded-2xl shadow-sm"
      >
        {/* Thumbnail — gradient hijau brand */}
        <div
          className={cn(
            "aspect-video w-full bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark",
            thumbnailClassName,
          )}
        />
        <span className="absolute inset-0 grid place-items-center bg-foreground/20 transition-colors group-hover:bg-foreground/30">
          <span className="grid size-16 place-items-center rounded-full bg-background/90 text-foreground shadow-lg transition-transform group-hover:scale-105">
            <Play className="ml-1 size-7 fill-current" aria-hidden="true" />
          </span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] overflow-hidden p-0 sm:max-w-3xl">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {open && (
            <div className="relative aspect-video w-full">
              {isLoading && (
                <Skeleton className="absolute inset-0 rounded-none" />
              )}
              <iframe
                src={`${videoUrl}?autoplay=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
                className="size-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
