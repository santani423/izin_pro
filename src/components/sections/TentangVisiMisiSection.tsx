import Image from "next/image";
import { CheckCircle2, Eye, Target } from "lucide-react";

import { TENTANG_MISSION, TENTANG_VISION } from "@/lib/tentang";

/* ─── Visi & Misi — dua kartu berdampingan ─── */
export default function TentangVisiMisiSection() {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pb-14 sm:px-6 md:grid-cols-2 lg:px-8">
      {/* Visi */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-brand-surface p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
            <Eye className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold text-foreground">Visi Kami</h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:ml-[3.25rem] sm:text-base">
          {TENTANG_VISION}
        </p>
        {/* Ilustrasi skyline gedung — full-bleed nempel tepi bawah kartu */}
        <div className="-mx-6 -mb-6 mt-auto pt-6">
          <Image
            src="/images/tentang-skyline-v3.png"
            alt="Ilustrasi gedung perkantoran"
            width={864}
            height={240}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="w-full"
          />
        </div>
      </div>

      {/* Misi */}
      <div className="rounded-2xl bg-brand-surface p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
            <Target className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold text-foreground">Misi Kami</h2>
        </div>
        <ul className="mt-4 space-y-3.5 sm:ml-[3.25rem]">
          {TENTANG_MISSION.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="text-sm leading-relaxed text-foreground sm:text-base">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
