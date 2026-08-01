import { Check, MapPin, Package, Search } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Pendaftaran", done: true },
  { label: "Verifikasi", done: true },
  { label: "Diproses", done: false, current: true },
  { label: "Selesai", done: false, current: false },
];

/* ─── Ilustrasi hero /tracking — mockup kartu pelacakan status layanan,
 * gantiin placeholder gradient polos bawaan PageHero. Murni dekoratif
 * (statis, tidak tersambung data asli). ─── */
export default function TrackingHeroVisual() {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-lime via-primary to-brand-green-dark">
      <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 size-48 rounded-full bg-black/10 blur-2xl" />

      {/* Badge live status */}
      <div className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-lg">
        <MapPin className="size-3.5 text-primary" />
        <span className="text-[11px] font-bold text-foreground">Live Status</span>
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
        </span>
      </div>

      {/* Kartu utama */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl bg-white/95 p-5 shadow-xl">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-brand-surface px-3 py-2">
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-[11px] font-semibold text-muted-foreground">
              TRX-20260731-000123
            </span>
          </div>

          <div className="relative mt-6">
            <div className="absolute left-3 right-3 top-3 h-0.5 bg-border" />
            <div className="absolute left-3 top-3 h-0.5 w-2/3 bg-primary" />
            <div className="relative grid grid-cols-4 gap-1">
              {STEPS.map((step, index) => (
                <div key={step.label} className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full text-[10px] font-bold",
                      step.done && "bg-primary text-white",
                      step.current && "bg-white text-primary ring-2 ring-primary/40",
                      !step.done && !step.current && "bg-border text-muted-foreground",
                    )}
                  >
                    {step.done ? <Check className="size-3" /> : index + 1}
                  </span>
                  <span className="text-center text-[9px] font-semibold leading-tight text-muted-foreground">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Progress</span>
              <span className="font-bold text-primary">65%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full w-[65%] rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Badge dokumen */}
      <div className="absolute bottom-6 left-6 flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 shadow-lg">
        <Package className="size-3.5 text-primary" />
        <span className="text-[10px] font-bold text-foreground">Dokumen Siap Diambil</span>
      </div>
    </div>
  );
}
