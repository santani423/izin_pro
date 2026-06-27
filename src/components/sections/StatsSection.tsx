"use client";

import { useEffect, useRef, useState } from "react";
import { FileCheck, ShieldCheck, Clock, Users } from "lucide-react";
import SectionWrapper from "@/components/shared/SectionWrapper";
import { STATS } from "@/lib/constants";
import type { StatItem } from "@/types";

const ICONS: Record<string, React.ElementType> = {
  "file-check": FileCheck,
  "shield-check": ShieldCheck,
  clock: Clock,
  users: Users,
};

/* ─── Counter animasi per stat ─── */
function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const Icon = ICONS[stat.icon] ?? FileCheck;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const step = stat.value / (duration / 16);
          let cur = 0;
          const timer = setInterval(() => {
            cur = Math.min(cur + step, stat.value);
            setCount(Math.floor(cur));
            if (cur >= stat.value) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stat.value]);

  return (
    <div
      ref={ref}
      className="reveal flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div
        className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
        style={{ backgroundColor: stat.bgColor }}
      >
        <Icon size={26} style={{ color: stat.color }} />
      </div>
      <div className="text-4xl font-extrabold text-gray-900">
        {count.toLocaleString("id-ID")}
        {stat.suffix}
      </div>
      <p className="text-sm text-gray-500 mt-2 leading-relaxed">{stat.label}</p>
    </div>
  );
}

/* ─── Section: Kenapa Kami / Statistik ─── */
export default function StatsSection() {
  return (
    <SectionWrapper id="kenapa-kami">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="text-center mb-10 reveal">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            Keunggulan Kami
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Kenapa Memilih IzinPro?
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Angka-angka ini bukan sekadar statistik — ini adalah bukti nyata kepercayaan klien
            kami.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
