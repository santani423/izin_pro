"use client";

import { useEffect, useState } from "react";
import { BadgePercent } from "lucide-react";
import { useDictionary } from "@/contexts/LocaleContext";

/* Sisa waktu menuju akhir bulan berjalan */
function getRemaining() {
  const now = new Date();
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );
  const diff = Math.max(0, endOfMonth.getTime() - now.getTime());
  return {
    hari: Math.floor(diff / 86_400_000),
    jam: Math.floor((diff / 3_600_000) % 24),
    menit: Math.floor((diff / 60_000) % 60),
    detik: Math.floor((diff / 1_000) % 60),
  };
}

export interface PromoCountdownHeading {
  titlePrefix: string;
  titleHighlight: string;
  description: string;
}

/* ─── Banner countdown diskon — hitung mundur ke akhir bulan ─── */
export default function PromoCountdownSection({ heading }: { heading: PromoCountdownHeading }) {
  const dict = useDictionary();
  /* null saat SSR/first paint agar tidak hydration mismatch */
  const [remaining, setRemaining] = useState<ReturnType<
    typeof getRemaining
  > | null>(null);

  useEffect(() => {
    const update = () => setRemaining(getRemaining());
    /* Tick pertama via rAF (bukan sinkron di badan effect) agar bebas
     * hydration mismatch & lolos react-hooks/set-state-in-effect */
    const raf = requestAnimationFrame(update);
    const timer = setInterval(update, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
    };
  }, []);

  const units = [
    { label: dict.promoCountdown.units.days, value: remaining?.hari },
    { label: dict.promoCountdown.units.hours, value: remaining?.jam },
    { label: dict.promoCountdown.units.minutes, value: remaining?.menit },
    { label: dict.promoCountdown.units.seconds, value: remaining?.detik },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 rounded-2xl border border-primary/30 bg-background px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
            <BadgePercent className="size-7" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              {heading.titlePrefix}{" "}
              <span className="text-primary">{heading.titleHighlight}</span>
            </h2>
            <p className="mt-2 max-w-xl text-base text-muted-foreground">
              {heading.description}
            </p>
          </div>
        </div>

        {/* Countdown — container hijau tipis, label center, kotak angka putih */}
        <div className="rounded-xl bg-brand-surface p-3">
          <p className="rounded-lg bg-primary/10 py-1.5 text-center text-sm font-bold text-primary">
            {dict.promoCountdown.endingIn}
          </p>
          <div className="mt-3 flex justify-center gap-2">
            {units.map(({ label, value }) => (
              <div
                key={label}
                className="w-16 rounded-lg bg-background px-2 py-2 text-center shadow-sm"
              >
                <p className="text-xl font-extrabold tabular-nums text-foreground">
                  {value === undefined
                    ? "--"
                    : String(value).padStart(2, "0")}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
